# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AI/SZ research oracle using Python date enumeration only."""
import calendar
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/fachrecht/ap23l1/referenzfaelle.json'
OUTPUT = ROOT / 'outputs/ap23l1-2026-10-27'
DAY = dt.timedelta(days=1)
MISSING = object()
MAX_SAFE_INTEGER = 9007199254740991


def easter(year):
    """Gregorian computus, independent of the application's calendar code."""
    a, b, c = year % 19, year // 100, year % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    ell = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * ell) // 451
    result = h + ell - 7 * m + 114
    return dt.date(year, result // 31, result % 31 + 1)


def iso_date(value):
    if type(value) is not str or re.fullmatch(r'\d{4}-\d{2}-\d{2}', value) is None:
        raise ValueError('Expected a canonical ISO date')
    date = dt.date.fromisoformat(value)
    if date.isoformat() != value:
        raise ValueError('Noncanonical ISO date')
    return date


def holidays(name, year, suite):
    definition = suite['calendars'][name]
    dates = {iso_date(f'{year}-{md}') for md in definition['fixed']}
    dates.update(easter(year) + offset * DAY for offset in definition['easterOffsets'])
    if definition.get('federalFast') is True:
        sundays = [dt.date(year, 9, day) for day in range(1, 31)
                   if dt.date(year, 9, day).weekday() == calendar.SUNDAY]
        dates.add(sundays[2])
    if definition.get('stephenAvoidThreeConsecutiveRestDays') is True:
        candidate = dt.date(year, 12, 26)
        dates.discard(candidate)
        if candidate.isoweekday() not in (2, 6):
            dates.add(candidate)
    dates.update(iso_date(value) for value in definition.get('additionalDates', [])
                 if value.startswith(f'{year}-'))
    return dates


def paused(date, mode):
    assert mode in ('none', 'three', 'szThree'), 'Unknown research suspension mode'
    if mode == 'none':
        return False
    last_january_day = 7 if mode == 'szThree' else 2
    return (date.month == 12 and date.day >= 18
            or date.month == 1 and date.day <= last_january_day
            or dt.date(date.year, 7, 15) <= date <= dt.date(date.year, 8, 15)
            or easter(date.year) - 7 * DAY <= date <= easter(date.year) + 7 * DAY)


def boundary(reason):
    return {'outcome': 'qualificationBoundaryProposed', 'reason': reason}


def safe_positive_integer(value):
    return type(value) is int and 1 <= value <= MAX_SAFE_INTEGER


def equal_fact(left, right):
    return type(left) is type(right) and left == right


def known_fact_keys(suite):
    keys = set()
    for path in suite['paths']:
        keys.update(req['key'] for req in path['requirements'])
        opening = path.get('opening')
        if opening is not None:
            keys.add(opening['modeFact'])
            if opening.get('expectedServiceFact'):
                keys.add(opening['expectedServiceFact'])
            keys.update(req['key'] for req in opening.get('trackingRequirements', []))
        binding = path['calendarBinding']
        if binding['type'] == 'fact':
            keys.add(binding['fact'])
        if path.get('durationFact'):
            keys.add(path['durationFact'])
        if path.get('durationBaseFact'):
            keys.add(path['durationBaseFact'])
    return keys


def evaluate(item, suite):
    path = next((row for row in suite['paths'] if row['id'] == item['path']), None)
    if path is None:
        return boundary('unknownResearchPath')
    try:
        trigger = iso_date(item.get('trigger'))
    except (ValueError, TypeError):
        return boundary('invalidResearchDate')
    facts = item.get('facts', {})
    assert type(facts) is dict, 'Research facts must be an explicit object'
    if any(key not in known_fact_keys(suite) for key in facts):
        return boundary('unknownResearchFact')
    for requirement in path['requirements']:
        actual = facts.get(requirement['key'], MISSING)
        if 'oneOf' in requirement:
            assert type(requirement['oneOf']) is list and requirement['oneOf']
            matches = any(equal_fact(actual, expected) for expected in requirement['oneOf'])
        else:
            matches = equal_fact(actual, requirement['value'])
        if not matches:
            return boundary(requirement['reason'])
    duration = item.get('days')
    if not safe_positive_integer(duration):
        return boundary('dayDurationNotSpecified')
    if path['days'] is not None and duration != path['days']:
        return boundary('statutoryDurationMismatch')
    if duration < path.get('minimumDays', 1) or duration > path.get('maximumDays', MAX_SAFE_INTEGER):
        return boundary('durationOutsideQualifiedRange')
    if path.get('durationFact'):
        specified = facts.get(path['durationFact'], MISSING)
        threshold = facts.get(path['durationBaseFact'], MISSING) if path.get('durationBaseFact') else path['longerThanDays']
        if (not safe_positive_integer(specified) or not safe_positive_integer(threshold)
                or specified != duration or specified <= threshold):
            return boundary('noticeDurationNotQualified')
    lower, upper = (iso_date(suite['window'][key]) for key in ('from', 'to'))
    outside = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow'}
    if not lower <= trigger <= upper:
        return outside
    binding = path['calendarBinding']
    assert binding['type'] in ('fixed', 'fact'), 'Unknown calendar binding mode'
    if binding['type'] == 'fixed':
        name = binding['calendar']
    else:
        name = facts.get(binding['fact'], MISSING)
        if name not in binding['allowed']:
            return boundary('holidayAnchorNotQualified')
    assert name in suite['calendars'], 'Unknown named research calendar'
    dates = [trigger + n * DAY for n in range((upper - trigger).days + 1)]
    legal_opening = trigger
    opening = path.get('opening')
    if opening is not None:
        opening_mode = facts.get(opening['modeFact'], MISSING)
        if opening_mode == opening['qualifiedValue']:
            pass
        elif opening_mode == opening['trackingValue']:
            if facts.get(opening['expectedServiceFact'], MISSING) is not True:
                return boundary('trackingExpectedServiceNotQualified')
            for requirement in opening.get('trackingRequirements', []):
                value = facts.get(requirement['key'], MISSING)
                if 'oneOf' in requirement:
                    matches = any(equal_fact(value, expected) for expected in requirement['oneOf'])
                else:
                    matches = equal_fact(value, requirement['value'])
                if not matches:
                    return boundary(requirement['reason'])
            legal_opening = next((date for date in dates if date.weekday() < 5
                                  and date not in holidays(name, date.year, suite)), None)
            if legal_opening is None:
                return outside
        else:
            return boundary('openingModeUnqualified')
    assert lower <= legal_opening <= upper
    mode = path['suspension']
    # Enumerate all eligible days, independently of Node's incremental counter.
    eligible = [date for date in dates if date > legal_opening and not paused(date, mode)]
    if len(eligible) < duration:
        return outside
    nominal = eligible[duration - 1]
    ending = next((date for date in dates if date >= nominal and date.weekday() < 5
                   and date not in holidays(name, date.year, suite)), None)
    if ending is None:
        return outside
    collision = next((date for date in dates if nominal < date <= ending and paused(date, mode)), None)
    if collision is not None:
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'L1-END-SUSPENSION',
                'nominalEnd': nominal.isoformat(), 'ordinaryShiftEnd': ending.isoformat(),
                'firstSuspendedShiftDate': collision.isoformat()}
    return {'outcome': 'datedResearchValue', 'legalOpening': legal_opening.isoformat(),
            'ordinaryStart': (legal_opening + DAY).isoformat(), 'firstCountedDay': eligible[0].isoformat(),
            'nominalEnd': nominal.isoformat(), 'end': ending.isoformat(),
            'skippedDays': (nominal - legal_opening).days - duration,
            'endShiftDays': (ending - nominal).days, 'suspension': mode, 'calendar': name}


def raw_rule_date(rule, year):
    calculation = rule['calculation']
    if calculation['type'] == 'fixedMonthDay':
        date = dt.date(year, calculation['month'], calculation['day'])
    elif calculation['type'] == 'easterOffsetDays':
        date = easter(year) + calculation['offsetDays'] * DAY
    else:
        assert calculation['type'] in ('nthWeekdayOfMonth', 'nthWeekdayOffsetDays')
        choices = [dt.date(year, calculation['month'], day)
                   for day in range(1, calendar.monthrange(year, calculation['month'])[1] + 1)
                   if dt.date(year, calculation['month'], day).isoweekday() == calculation['isoWeekday']]
        date = choices[calculation['occurrence'] - 1] + calculation.get('offsetDays', 0) * DAY
    condition = rule['condition']
    if condition == 'unlessTuesdayOrSaturday':
        return None if date.isoweekday() in (2, 6) else date
    assert condition == 'always', 'Unexamined baseline condition'
    return date


def run():
    raw = FIXTURE.read_bytes()
    suite = json.loads(raw)
    assert suite['formatVersion'] == 'ap23l1-research-references-1'
    for flag in ('runtimeActive', 'productTest', 'legalApproval', 'exportTest'):
        if flag in suite:
            assert suite[flag] is False, 'Research flag cannot imply release or export approval'
    assert len({path['id'] for path in suite['paths']}) == len(suite['paths'])
    assert len({item['id'] for item in suite['cases']}) == len(suite['cases'])
    node_raw = (OUTPUT / 'reference-verification.json').read_bytes()
    node = json.loads(node_raw)
    fixture_hash = hashlib.sha256(raw).hexdigest()
    assert node['fixtureSha256'] == fixture_hash, 'Peer report refers to different fixture bytes'
    assert len({row['id'] for row in node['results']}) == len(node['results'])
    assert {row['id'] for row in node['results']} == {row['id'] for row in suite['cases']}
    for year, expected in suite.get('easter', {}).items():
        assert easter(int(year)).isoformat() == expected
    discrepancies = []
    for item in suite['cases']:
        actual = evaluate(item, suite)
        for key, expected in item['expected'].items():
            if not equal_fact(actual.get(key, MISSING), expected):
                discrepancies.append({'id': item['id'], 'kind': 'staticExpectation', 'key': key,
                                      'expected': expected, 'actual': actual.get(key)})
        peer = next(row['actual'] for row in node['results'] if row['id'] == item['id'])
        if actual != peer:
            discrepancies.append({'id': item['id'], 'kind': 'nodePythonComparison', 'python': actual, 'node': peer})
    baseline_dates_checked = 0
    baseline_files = []
    for baseline in suite.get('calendarBaselines', []):
        path = baseline['path']
        assert type(path) is str and not Path(path).is_absolute() and '..' not in Path(path).parts
        calendar_bytes = (ROOT / path).read_bytes()
        assert hashlib.sha256(calendar_bytes).hexdigest() == baseline['sha256'], 'Raw calendar bytes changed'
        baseline_files.append({'path': path, 'sha256': baseline['sha256'], 'byteLength': len(calendar_bytes)})
        rules = json.loads(calendar_bytes)['rules']
        for year in (2026, 2027):
            projected = {date for rule in rules if (date := raw_rule_date(rule, year)) is not None}
            definition = holidays(baseline['calendar'], year, suite)
            additions = {iso_date(value) for value in baseline.get('researchAdditionalDates', [])
                         if value.startswith(f'{year}-')}
            if projected | additions != definition:
                discrepancies.append({'kind': 'rawCalendarProjection', 'calendar': baseline['calendar'], 'year': year,
                                      'expected': sorted(date.isoformat() for date in projected | additions),
                                      'actual': sorted(date.isoformat() for date in definition)})
            for offset in range((dt.date(year + 1, 1, 1) - dt.date(year, 1, 1)).days):
                date = dt.date(year, 1, 1) + offset * DAY
                if (date.weekday() >= 5 or date in projected | additions) != (date.weekday() >= 5 or date in definition):
                    discrepancies.append({'kind': 'rawCalendarEndEligibility', 'calendar': baseline['calendar'], 'date': date.isoformat()})
                baseline_dates_checked += 1
    for probe in suite.get('calendarProbes', []):
        date = iso_date(probe['date'])
        if (date in holidays(probe['calendar'], date.year, suite)) != probe['isHoliday']:
            discrepancies.append({'kind': 'calendarProbe', **probe})
    report = {'workPackage': 'AP23L1', 'asOf': suite.get('asOf', '2026-10-27'),
              'status': 'passedIndependentResearchComparison' if not discrepancies else 'discrepancies',
              'fixtureSha256': fixture_hash, 'nodeReportSha256': hashlib.sha256(node_raw).hexdigest(),
              'checkerSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'referenceComparisons': len(suite['cases']), 'calendarEndEligibilityComparisons': baseline_dates_checked,
              'calendarProbes': len(suite.get('calendarProbes', [])), 'calendarBaselineInputs': baseline_files,
              'discrepancies': discrepancies, 'productModulesImported': False,
              'legalInterpretationAutomaticallyValidated': False, 'runtimeActive': False,
              'exportTest': False, 'legalApproval': False}
    if '--write' in sys.argv:
        (OUTPUT / 'independent-verification.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if discrepancies else 0


if __name__ == '__main__':
    assert all(value == '--write' for value in sys.argv[1:])
    sys.exit(run())
