#!/usr/bin/env python3
"""Research-only full-date enumeration independent of the Node day loop."""
import datetime as dt
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/fachrecht/ap23h1/referenzfaelle.json'
OUTPUT = ROOT / 'outputs/ap23h1-2026-10-22'
DAY = dt.timedelta(days=1)


def easter(year):
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
    dates = {dt.date.fromisoformat(f'{year}-{md}') for md in spec['fixed']}
    dates.update(easter(year) + n * DAY for n in spec['easterOffsets'])
    return dates


def paused(date, path):
    mode = path['suspension']
    assert mode in ('none', 'winter', 'three')
    if mode == 'none':
        return False
    md = date.month * 100 + date.day
    winter = md >= 1218 or md <= 102
    return winter or mode == 'three' and (715 <= md <= 815 or abs((date - easter(date.year)).days) <= 7)


def qualification(item, suite):
    path = next((p for p in suite['paths'] if p['id'] == item['path']), None)
    if path is None:
        return None, 'unknownResearchPath'
    try:
        assert isinstance(item['trigger'], str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', item['trigger'])
        dt.date.fromisoformat(item['trigger'])
    except (AssertionError, TypeError, ValueError):
        return None, 'invalidResearchDate'
    facts = dict(suite['sharedSyntheticFacts'])
    facts.update(path['syntheticFacts'])
    facts.update(item.get('facts', {}))
    allowed = set(suite['sharedSyntheticFacts'])
    for p in suite['paths']:
        allowed.update(p['syntheticFacts'])
    if set(item.get('facts', {})) - allowed:
        return None, 'unknownResearchFact'
    for required in suite['sharedRequirements'] + path['requirements']:
        value = facts.get(required['key'])
        if type(value) is not type(required['value']) or value != required['value']:
            return None, required['reason']
    if path.get('openingChain'):
        if facts.get('openingOrigin') not in ('originalReasoned', 'reasonedFollowingTimelyRequest'):
            return None, 'openingOriginNotQualified'
        if facts.get('openingOrigin') == 'reasonedFollowingTimelyRequest' and facts.get('priorReasonsRequest') != 'timelyEstablished':
            return None, 'priorReasonsRequestNotEstablished'
    days = item.get('days')
    if type(days) is not int or not 1 <= days <= 2 ** 53 - 1:
        return None, 'dayDurationNotSpecified'
    if path['days'] is not None and days != path['days']:
        return None, 'statutoryDurationMismatch'
    return path, None


def evaluate(item, suite):
    path, reason = qualification(item, suite)
    if reason:
        return {'outcome': 'qualificationBoundaryProposed', 'reason': reason}
    start = dt.date.fromisoformat(item['trigger'])
    lower, upper = (dt.date.fromisoformat(suite['referenceWindow'][k]) for k in ('from', 'to'))
    boundary = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow'}
    if not lower <= start <= upper:
        return boundary
    # Enumerate the full research window independently, then select the n-th date.
    future = [start + n * DAY for n in range(1, (upper - start).days + 1)]
    eligible = [date for date in future if not paused(date, path)]
    if len(eligible) < item['days']:
        return boundary
    nominal = eligible[item['days'] - 1]
    usable = [date for date in future if date >= nominal and date.weekday() < 5
              and date not in holiday_dates(path['calendar'], date.year, suite)]
    if not usable:
        return boundary
    end = usable[0]
    shifted = [nominal + n * DAY for n in range(1, (end - nominal).days + 1)]
    collision = next((date for date in shifted if paused(date, path)), None)
    if collision and path['endShiftCollision'] == 'proposedBoundary':
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'H1-END-SUSPENSION',
                'nominalEnd': nominal.isoformat(), 'ordinaryShiftEnd': end.isoformat(),
                'firstSuspendedShiftDate': collision.isoformat()}
    bindings = []
    for n in range((end - start).days + 1):
        date = (start + n * DAY).isoformat()
        match = [b for b in suite['temporalBindings'][path['canton']] if b['from'] <= date <= b['to']]
        assert len(match) == 1
        if match[0]['id'] not in bindings:
            bindings.append(match[0]['id'])
    return {'outcome': 'datedResearchValue', 'ordinaryStart': (start + DAY).isoformat(),
            'firstCountedDay': eligible[0].isoformat(), 'nominalEnd': nominal.isoformat(), 'end': end.isoformat(),
            'skippedDays': (nominal - start).days - item['days'], 'endShiftDays': (end - nominal).days,
            'temporalBindings': bindings}


def raw_date(rule, year):
    assert rule['condition'] == 'always'
    calc = rule['calculation']
    kind = calc['type']
    if kind == 'fixedMonthDay':
        return dt.date(year, calc['month'], calc['day'])
    if kind == 'easterOffsetDays':
        return easter(year) + calc['offsetDays'] * DAY
    assert kind == 'nthWeekdayOfMonth' and calc['isoWeekday'] == 7 and calc['occurrence'] == 3
    date = dt.date(year, calc['month'], 15)
    return date + (6 - date.weekday()) % 7 * DAY


def isolated_practice(probe, suite):
    assert probe['productScope'] is False and probe['normReleaseApproval'] is False
    assert not suite['referenceWindow']['from'] <= probe['trigger'] <= suite['referenceWindow']['to']
    path = next(p for p in suite['paths'] if p['id'] == probe['path'])
    isolated = dict(suite, referenceWindow=probe['arithmeticWindow'])
    isolated['temporalBindings'] = dict(suite['temporalBindings'])
    isolated['temporalBindings'][path['canton']] = [dict(id='isolatedPracticeArithmeticOnly', **probe['arithmeticWindow'])]
    result = evaluate(probe, isolated)
    return dict(result, isolatedPracticeOnly=True, normReleaseApproval=False)


def run():
    raw = FIXTURE.read_bytes()
    suite = json.loads(raw)
    assert suite['formatVersion'] == 'ap23h1-research-references-1'
    assert all(suite[key] is False for key in ('runtimeActive', 'productTest', 'legalApproval'))
    node_path = OUTPUT / 'reference-verification.json'
    node_bytes = node_path.read_bytes()
    node = json.loads(node_bytes)
    assert node['fixtureSha256'] == hashlib.sha256(raw).hexdigest()
    for year, expected in suite['easter'].items():
        assert easter(int(year)).isoformat() == expected
    differences = []
    for item in suite['cases']:
        result = evaluate(item, suite)
        for key, expected in item['expected'].items():
            if result.get(key) != expected:
                differences.append({'id': item['id'], 'kind': 'staticExpectation', 'key': key,
                                    'expected': expected, 'actual': result.get(key)})
        peer = next(row['actual'] for row in node['results'] if row['id'] == item['id'])
        if result != peer:
            differences.append({'id': item['id'], 'kind': 'nodePythonComparison', 'python': result, 'node': peer})
    for probe in suite['calendarProbes']:
        date = dt.date.fromisoformat(probe['date'])
        assert (date in holiday_dates(probe['calendar'], date.year, suite)) == probe['isHoliday']
    practice_comparisons = 0
    for probe in suite.get('isolatedPracticeProbes', []):
        assert hashlib.sha256((ROOT / probe['sourcePath']).read_bytes()).hexdigest() == probe['sourceSha256']
        actual = isolated_practice(probe, suite)
        for key, expected in probe['expected'].items():
            if actual.get(key) != expected:
                differences.append({'id': probe['id'], 'kind': 'isolatedPracticeExpectation', 'key': key,
                                    'expected': expected, 'actual': actual.get(key)})
        counterpart = next(row['actual'] for row in node['isolatedPracticeResults'] if row['id'] == probe['id'])
        if counterpart != actual:
            differences.append({'id': probe['id'], 'kind': 'isolatedPracticeNodePython', 'python': actual, 'node': counterpart})
        practice_comparisons += 1
    calendar_days = 0
    for baseline in suite['calendarBaselines']:
        data = (ROOT / baseline['path']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == baseline['sha256']
        rules = json.loads(data)['rules']
        assert len(rules) == 13
        for year in (2026, 2027):
            projected = {raw_date(rule, year) for rule in rules}
            projected.update(dt.date.fromisoformat(f'{year}-{md}') for md in baseline['additionalFixed'])
            projected.update(easter(year) + n * DAY for n in baseline['additionalEasterOffsets'])
            assert len(projected) == 17
            dates = [dt.date(year, 1, 1) + n * DAY for n in range(365)]
            assert dates[-1] == dt.date(year, 12, 31)
            expected = holiday_dates(baseline['researchCalendar'], year, suite)
            for date in dates:
                if (date.weekday() >= 5 or date in projected) != (date.weekday() >= 5 or date in expected):
                    differences.append({'calendar': baseline['researchCalendar'], 'date': date.isoformat(),
                                        'kind': 'rawCalendarProjection'})
                calendar_days += 1
    report = {'workPackage': 'AP23H1', 'asOf': suite['asOf'],
              'status': 'passedIndependentResearchComparison' if not differences else 'discrepancies',
              'fixtureSha256': hashlib.sha256(raw).hexdigest(),
              'pythonCheckerSha256': hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
              'nodeReportSha256': hashlib.sha256(node_bytes).hexdigest(),
              'referenceComparisons': len(suite['cases']), 'calendarProbes': len(suite['calendarProbes']),
              'isolatedPracticeComparisons': practice_comparisons,
              'rawCalendarDateComparisons': calendar_days, 'independentlyComputedEasterDates': len(suite['easter']),
              'runtimeActive': False, 'productImports': False, 'legalApproval': False, 'discrepancies': differences}
    if '--write' in sys.argv:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / 'reference-independent-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return bool(differences)


if __name__ == '__main__':
    sys.exit(run())
