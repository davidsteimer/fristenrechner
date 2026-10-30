#!/usr/bin/env python3
"""Independent research-only date enumeration. No product imports."""
import datetime as dt
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/fachrecht/ap23g1/referenzfaelle.json'
DAY = dt.timedelta(days=1)


def easter(year):
    """Gregorian Easter computed independently, not taken from Node fixture dates."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    n = h + l - 7 * m + 114
    return dt.date(year, n // 31, n % 31 + 1)


def holiday_dates(calendar, year, suite):
    spec = suite['calendarDefinitions'][calendar]
    result = {dt.date.fromisoformat(f'{year}-{md}') for md in spec['fixed']}
    result.update(easter(year) + offset * DAY for offset in spec['easterOffsets'])
    if spec['septemberThirdSunday']:
        result.add(dt.date(year, 9, 15) + ((6 - dt.date(year, 9, 15).weekday()) % 7) * DAY)
    return result


def paused(day, path):
    if path['suspension'] == 'none':
        return False
    assert path['suspension'] == 'three'
    md = day.month * 100 + day.day
    return md <= 102 or md >= 1218 or 715 <= md <= 815 or abs((day - easter(day.year)).days) <= 7


def qualification(item, suite):
    path = next((p for p in suite['paths'] if p['id'] == item['path']), None)
    if path is None:
        return None, 'unknownResearchPath'
    facts = dict(suite['sharedSyntheticFacts'], stage=path['stage'], action=path['action'],
                 opening=path['opening'], holidayAnchor=path['holidayAnchor'],
                 targetCourt=path.get('requiredCourt', 'notApplicable'),
                 sameIssuingCourt=path.get('sameIssuingCourt', False),
                 openingOrigin='originalReasoned' if path['opening'] == 'completeReasonedAdministrativeDecision' else 'notApplicable')
    facts.update(item.get('facts', {}))
    try:
        assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', item['trigger'])
        dt.date.fromisoformat(item['trigger'])
    except (ValueError, TypeError, AssertionError):
        return None, 'invalidResearchDate'
    requirements = [
        ('stage', path['stage'], 'stageDoesNotMatchPath'),
        ('action', path['action'], 'actionNotQualified'),
        ('authorityLevel', 'cantonal', 'targetOutsideScope'),
        ('holidayAnchor', path['holidayAnchor'], 'holidayAnchorNotQualified'),
        ('opening', path['opening'], 'openingNotQualified'),
        ('specialLaw', 'excluded', 'specialLawNotExcluded'),
        ('materialPerformance', False, 'materialPerformanceOutsideScope'),
        ('fixedEndDate', False, 'fixedDateOrDeviatingStart'),
        ('deviatingStart', False, 'fixedDateOrDeviatingStart'),
        ('termChange', 'none', 'termChangeNeedsIndividualReview'),
        ('unit', 'day', 'unsupportedUnitOrDirection'),
        ('direction', 'forward', 'unsupportedUnitOrDirection'),
        ('notice', 'uncontested', 'noticeNeedsIndividualReview'),
        ('suspensionContext', 'ordinaryNoException', 'suspensionExceptionNotQualified'),
        ('serviceContext', 'effectiveLegalTriggerKnown', 'serviceFictionNotCalculated')
    ]
    # Opening-specific checks belong immediately after the opening type.
    extra = []
    if path.get('requiredCourt'):
        extra.append(('targetCourt', path['requiredCourt'], 'targetCourtNotQualified'))
    if path.get('sameIssuingCourt'):
        extra.append(('sameIssuingCourt', True, 'courtReasonsWrongRecipient'))
    if path['opening'] == 'completeReasonedAdministrativeDecision':
        if facts.get('openingOrigin') not in ('originalReasoned', 'reasonedFollowingRequest'):
            extra.append(('openingOrigin', 'originalReasoned', 'openingOriginNotQualified'))
        if facts.get('openingOrigin') == 'reasonedFollowingRequest':
            extra.append(('priorReasonsRequest', 'timelyEstablished', 'priorReasonsRequestNotEstablished'))
    requirements[5:5] = extra
    if path['canton'] == 'UR':
        requirements.extend([
            ('urOpeningConsequence', 'ordinaryEffectiveOpening', 'urOpeningSpecialConsequenceUnresolved'),
            ('localHolidayEffect', 'noAdditionalRelevantLocalHoliday', 'urLocalHolidayEffectUnresolved')
        ])
        if path['id'] in ('UR-ADMIN-20', 'UR-COURT-20'):
            requirements.insert(-1, ('coordinatedDecision', False, 'urCoordinatedLongestPeriodNotQualified'))
    if path['canton'] == 'SH':
        requirements.append(('shortenedRekurs', False, 'shShortenedRekursOutsideOrdinaryPath'))
    for key, expected, reason in requirements:
        if facts.get(key) != expected:
            return None, reason
    n = item.get('days')
    if type(n) is not int or n < 1 or n > 2**53 - 1:
        return None, 'dayDurationNotSpecified'
    if path['days'] is not None and n != path['days']:
        return None, 'statutoryDurationMismatch'
    return path, None


def evaluate(item, suite):
    path, reason = qualification(item, suite)
    if reason:
        return {'outcome': 'qualificationBoundaryProposed', 'reason': reason}
    start = dt.date.fromisoformat(item['trigger'])
    lower, upper = (dt.date.fromisoformat(suite['referenceWindow'][k]) for k in ('from', 'to'))
    limit = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow'}
    if not lower <= start <= upper:
        return limit
    # Enumerate the entire covered future, then select the n-th eligible date.
    future = [start + i * DAY for i in range(1, (upper - start).days + 1)]
    eligible = [day for day in future if not paused(day, path)]
    if len(eligible) < item['days']:
        return limit
    nominal = eligible[item['days'] - 1]
    def usable(day):
        return day.weekday() < 5 and day not in holiday_dates(path['calendar'], day.year, suite)
    possible_ends = [day for day in future if day >= nominal and usable(day)]
    if not possible_ends:
        return limit
    end = possible_ends[0]
    shifted = [nominal + n * DAY for n in range(1, (end - nominal).days + 1)]
    collision = next((day for day in shifted if paused(day, path)), None)
    if collision:
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'G1-END-SUSPENSION',
                'nominalEnd': nominal.isoformat(), 'ordinaryShiftEnd': end.isoformat(),
                'firstSuspendedShiftDate': collision.isoformat()}
    md = start.month * 100 + start.day
    warning = path['openingRestriction'] and (md >= 1218 or md <= 106 or abs((start - easter(start.year)).days) <= 8)
    return {'outcome': 'datedResearchValue', 'ordinaryStart': (start + DAY).isoformat(),
            'firstCountedDay': eligible[0].isoformat(), 'nominalEnd': nominal.isoformat(),
            'end': end.isoformat(), 'skippedDays': (nominal - start).days - item['days'],
            'endShiftDays': (end - nominal).days, 'warnings': ['UR-ART22'] if warning else [],
            'temporalBinding': suite['temporalBindings'][path['canton']]}


def run():
    fixture_bytes = FIXTURE.read_bytes()
    suite = json.loads(fixture_bytes)
    assert suite['runtimeActive'] is False and suite['productTest'] is False
    node_file = ROOT / 'outputs/ap23g1-2026-10-22/reference-verification.json'
    node = json.loads(node_file.read_bytes())
    assert node['fixtureSha256'] == hashlib.sha256(fixture_bytes).hexdigest()
    discrepancies = []
    for year, expected in suite['easter'].items():
        assert easter(int(year)).isoformat() == expected
    for item in suite['cases']:
        actual = evaluate(item, suite)
        for key, expected in item['expected'].items():
            if actual.get(key) != expected:
                discrepancies.append({'id': item['id'], 'type': 'staticExpectation', 'key': key,
                                      'expected': expected, 'actual': actual.get(key)})
        counterpart = next(row['actual'] for row in node['results'] if row['id'] == item['id'])
        if counterpart != actual:
            discrepancies.append({'id': item['id'], 'type': 'nodePythonComparison', 'python': actual, 'node': counterpart})
    for probe in suite['calendarProbes']:
        day = dt.date.fromisoformat(probe['date'])
        assert (day in holiday_dates(probe['calendar'], day.year, suite)) == probe['isHoliday']
    report = {
        'workPackage': 'AP23G1', 'asOf': suite['asOf'],
        'status': 'passedIndependentResearchComparison' if not discrepancies else 'discrepancies',
        'fixtureSha256': hashlib.sha256(fixture_bytes).hexdigest(),
        'pythonCheckerSha256': hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
        'nodeReportSha256': hashlib.sha256(node_file.read_bytes()).hexdigest(),
        'referenceComparisons': len(suite['cases']), 'calendarProbes': len(suite['calendarProbes']),
        'independentlyComputedEasterDates': len(suite['easter']),
        'productImports': False, 'runtimeActive': False, 'legalApproval': False, 'discrepancies': discrepancies
    }
    if '--write' in sys.argv:
        target = ROOT / 'outputs/ap23g1-2026-10-22/independent-verification.json'
        target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return bool(discrepancies)


if __name__ == '__main__':
    sys.exit(run())
