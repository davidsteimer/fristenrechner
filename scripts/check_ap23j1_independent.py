# SPDX-License-Identifier: AGPL-3.0-only
"""Independent J1 date enumeration. No product or Node arithmetic imports."""
import calendar
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/fachrecht/ap23j1/referenzfaelle.json'
OUTPUT = ROOT / 'outputs/ap23j1-2026-10-27'
DAY = dt.timedelta(days=1)


def easter(year):
    a, b, c = year % 19, year // 100, year % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    value = h + l - 7 * m + 114
    return dt.date(year, value // 31, value % 31 + 1)


def holidays(name, year, suite):
    definition = suite['calendars'][name]
    dates = {dt.date.fromisoformat(f'{year}-{md}') for md in definition['fixed']}
    dates.update(easter(year) + n * DAY for n in definition['easterOffsets'])
    if definition.get('genevaFast'):
        sunday = next(dt.date(year, 9, day) for day in range(1, 8)
                      if dt.date(year, 9, day).weekday() == calendar.SUNDAY)
        dates.add(sunday + 4 * DAY)
    dates.update(dt.date.fromisoformat(value) for value in definition.get('additionalDates', [])
                 if value.startswith(f'{year}-'))
    return dates


def paused(date, mode):
    assert mode in ('none', 'two', 'three')
    return mode != 'none' and (
        date.month == 12 and date.day >= 18
        or date.month == 1 and date.day <= 2
        or mode == 'three' and dt.date(date.year, 7, 15) <= date <= dt.date(date.year, 8, 15)
        or easter(date.year) - 7 * DAY <= date <= easter(date.year) + 7 * DAY)


def boundary(reason):
    return {'outcome': 'qualificationBoundaryProposed', 'reason': reason}


def evaluate(item, suite):
    path = next((p for p in suite['paths'] if p['id'] == item['path']), None)
    if not path:
        return boundary('unknownResearchPath')
    try:
        trigger = dt.date.fromisoformat(item['trigger'])
        assert trigger.isoformat() == item['trigger']
    except (ValueError, TypeError, AssertionError):
        return boundary('invalidResearchDate')
    allowed = set(suite['sharedSyntheticFacts'])
    for candidate in suite['paths']:
        allowed.update(candidate['syntheticFacts'])
    if any(key not in allowed for key in item.get('facts', {})):
        return boundary('unknownResearchFact')
    facts = dict(suite['sharedSyntheticFacts'], **path['syntheticFacts'])
    facts.update(item.get('facts', {}))
    for req in suite['sharedRequirements'] + path['requirements']:
        if 'oneOf' in req:
            assert type(req['oneOf']) is list and req['oneOf']
            match = any(type(facts.get(req['key'])) is type(value) and facts.get(req['key']) == value
                        for value in req['oneOf'])
        else:
            match = type(facts.get(req['key'])) is type(req['value']) and facts.get(req['key']) == req['value']
        if not match:
            return boundary(req['reason'])
    mode = path['suspension']
    assert mode in ('none', 'two', 'three')
    assert path['endShiftCollision'] in ('proposedBoundary', 'notApplicable')
    assert mode == 'none' or path['endShiftCollision'] == 'proposedBoundary'
    duration = item.get('days')
    if type(duration) is not int or duration < 1 or duration > 9007199254740991:
        return boundary('dayDurationNotSpecified')
    if path['days'] is not None and path['days'] != duration:
        return boundary('statutoryDurationMismatch')
    if duration < path.get('minimumDays', 1) or duration > path.get('maximumDays', 9007199254740991):
        return boundary('durationOutsideQualifiedRange')
    lower, upper = (dt.date.fromisoformat(suite['window'][key]) for key in ('from', 'to'))
    outside = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow'}
    if not lower <= trigger <= upper:
        return outside

    def bound_through(last):
        bindings = []
        for n in range((last - trigger).days + 1):
            date = (trigger + n * DAY).isoformat()
            choices = [b for b in suite['temporalBindings'][path['canton']] if b['from'] <= date <= b['to']]
            assert len(choices) == 1, 'Missing/ambiguous temporal binding'
            if choices[0]['id'] not in bindings:
                bindings.append(choices[0]['id'])
        return bindings

    all_dates = [trigger + n * DAY for n in range((upper - trigger).days + 1)]
    assert path['opening'] in ('qualifiedLegalOpening', 'geQualifiedOrOrdinaryPost')
    opening = trigger
    if path['opening'] == 'geQualifiedOrOrdinaryPost':
        if facts.get('openingMode') not in ('qualifiedLegalOpening', 'ordinaryPostPhysicalReceipt'):
            return boundary('openingModeUnqualified')
        if facts['openingMode'] == 'ordinaryPostPhysicalReceipt':
            opening = next((date for date in all_dates if date.weekday() < 5
                            and date not in holidays(path['calendar'], date.year, suite)), None)
            if opening is None:
                bound_through(upper)
                return outside
    # Select the nth eligible date from a complete enumeration, not Node's counting loop.
    eligible = [date for date in all_dates if date > opening and not paused(date, mode)]
    if len(eligible) < duration:
        bound_through(upper)
        return outside
    nominal = eligible[duration - 1]
    ending = next((date for date in all_dates if date >= nominal and date.weekday() < 5
                   and date not in holidays(path['calendar'], date.year, suite)), None)
    if ending is None:
        bound_through(upper)
        return outside
    bindings = bound_through(ending)
    collision = next((date for date in all_dates if nominal < date <= ending and paused(date, mode)), None)
    if collision and path['endShiftCollision'] == 'proposedBoundary':
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'J1-END-SUSPENSION',
                'legalOpening': opening.isoformat(), 'nominalEnd': nominal.isoformat(),
                'ordinaryShiftEnd': ending.isoformat(), 'firstSuspendedShiftDate': collision.isoformat()}
    return {'outcome': 'datedResearchValue', 'legalOpening': opening.isoformat(),
            'ordinaryStart': (opening + DAY).isoformat(), 'firstCountedDay': eligible[0].isoformat(),
            'nominalEnd': nominal.isoformat(), 'end': ending.isoformat(),
            'openingShiftDays': (opening - trigger).days, 'skippedDays': (nominal - opening).days - duration,
            'endShiftDays': (ending - nominal).days, 'suspension': mode, 'temporalBindings': bindings}


def raw_rule_date(rule, year):
    calc = rule['calculation']
    assert rule['condition'] == 'always'
    if calc['type'] == 'fixedMonthDay':
        return dt.date(year, calc['month'], calc['day'])
    if calc['type'] == 'easterOffsetDays':
        return easter(year) + calc['offsetDays'] * DAY
    assert calc['type'] == 'nthWeekdayOffsetDays'
    choices = [dt.date(year, calc['month'], day) for day in range(1, calendar.monthrange(year, calc['month'])[1] + 1)
               if dt.date(year, calc['month'], day).isoweekday() == calc['isoWeekday']]
    return choices[calc['occurrence'] - 1] + calc['offsetDays'] * DAY


def run():
    raw = FIXTURE.read_bytes()
    suite = json.loads(raw)
    assert suite['formatVersion'] == 'ap23j1-research-references-1'
    assert all(suite[key] is False for key in ('runtimeActive', 'productTest', 'legalApproval'))
    node_raw = (OUTPUT / 'reference-verification.json').read_bytes()
    node = json.loads(node_raw)
    assert node['fixtureSha256'] == hashlib.sha256(raw).hexdigest()
    for year, expected in suite['easter'].items():
        assert easter(int(year)).isoformat() == expected
    discrepancies = []
    for item in suite['cases']:
        actual = evaluate(item, suite)
        for key, expected in item['expected'].items():
            if actual.get(key) != expected:
                discrepancies.append({'id': item['id'], 'kind': 'staticExpectation',
                                      'key': key, 'expected': expected, 'actual': actual.get(key)})
        peer = next(row['actual'] for row in node['results'] if row['id'] == item['id'])
        if actual != peer:
            discrepancies.append({'id': item['id'], 'kind': 'nodePythonComparison', 'python': actual, 'node': peer})
    days_checked = 0
    for baseline in suite['calendarBaselines']:
        raw_calendar = (ROOT / baseline['path']).read_bytes()
        assert hashlib.sha256(raw_calendar).hexdigest() == baseline['sha256']
        rules = json.loads(raw_calendar)['rules']
        for year in (2026, 2027):
            projected = {raw_rule_date(rule, year) for rule in rules}
            expected = holidays(baseline['calendar'], year, suite)
            assert projected == expected, 'Named holiday date projection differs'
            for n in range((dt.date(year + 1, 1, 1) - dt.date(year, 1, 1)).days):
                date = dt.date(year, 1, 1) + n * DAY
                if (date.weekday() >= 5 or date in projected) != (date.weekday() >= 5 or date in expected):
                    discrepancies.append({'kind': 'rawCalendarProjection', 'calendar': baseline['calendar'], 'date': date.isoformat()})
                days_checked += 1
    for probe in suite['calendarProbes']:
        date = dt.date.fromisoformat(probe['date'])
        if (date in holidays(probe['calendar'], date.year, suite)) != probe['isHoliday']:
            discrepancies.append({'kind': 'calendarProbe', **probe})
    report = {'workPackage': 'AP23J1', 'asOf': suite['asOf'],
              'status': 'passedIndependentResearchComparison' if not discrepancies else 'discrepancies',
              'fixtureSha256': hashlib.sha256(raw).hexdigest(), 'nodeReportSha256': hashlib.sha256(node_raw).hexdigest(),
              'checkerSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'referenceComparisons': len(suite['cases']), 'calendarEndEligibilityComparisons': days_checked,
              'calendarProbes': len(suite['calendarProbes']), 'discrepancies': discrepancies,
              'productModulesImported': False, 'legalInterpretationAutomaticallyValidated': False,
              'runtimeActive': False, 'exportTest': False, 'legalApproval': False}
    if '--write' in sys.argv:
        (OUTPUT / 'reference-independent-verification.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if discrepancies else 0


if __name__ == '__main__':
    assert all(value == '--write' for value in sys.argv[1:])
    sys.exit(run())
