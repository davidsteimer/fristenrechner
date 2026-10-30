# SPDX-License-Identifier: AGPL-3.0-only
"""Independent K1 enumeration. No application modules or Node arithmetic imports."""
import calendar
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/fachrecht/ap23k1/referenzfaelle.json'
OUTPUT = ROOT / 'outputs/ap23k1-2026-10-27'
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


def nth_weekday(year, rule):
    options = [dt.date(year, rule['month'], day)
               for day in range(1, calendar.monthrange(year, rule['month'])[1] + 1)
               if dt.date(year, rule['month'], day).isoweekday() == rule['isoWeekday']]
    return options[rule['occurrence'] - 1] + rule.get('offsetDays', 0) * DAY


def holidays(name, year, suite):
    value = suite['calendars'][name]
    dates = {dt.date.fromisoformat(f'{year}-{md}') for md in value['fixed']}
    dates.update(easter(year) + offset * DAY for offset in value['easterOffsets'])
    dates.update(nth_weekday(year, rule) for rule in value.get('nthWeekdays', []))
    dates.update(dt.date.fromisoformat(date) for date in value.get('additionalDates', [])
                 if date.startswith(f'{year}-'))
    return dates


def boundary(reason):
    return {'outcome': 'qualificationBoundaryProposed', 'reason': reason}


def evaluate(item, suite):
    path = next((row for row in suite['paths'] if row['id'] == item['path']), None)
    if not path:
        return boundary('unknownResearchPath')
    try:
        trigger = dt.date.fromisoformat(item['trigger'])
        assert trigger.isoformat() == item['trigger']
    except (ValueError, TypeError, AssertionError):
        return boundary('invalidResearchDate')
    allowed = set(suite['sharedSyntheticFacts']) | set(suite.get('allowedFactKeys', []))
    for candidate in suite['paths']:
        allowed.update(candidate['syntheticFacts'])
    if any(key not in allowed for key in item.get('facts', {})):
        return boundary('unknownResearchFact')
    facts = dict(suite['sharedSyntheticFacts'], **path['syntheticFacts'])
    facts.update(item.get('facts', {}))
    for req in suite['sharedRequirements'] + path['requirements']:
        if 'oneOf' in req:
            match = any(type(facts.get(req['key'])) is type(value) and facts.get(req['key']) == value
                        for value in req['oneOf'])
        else:
            match = type(facts.get(req['key'])) is type(req['value']) and facts.get(req['key']) == req['value']
        if not match:
            return boundary(req.get('reason') or req['key'] + 'NotQualified')
    assert path['suspension'] == 'none'
    assert path['opening'] == 'qualifiedLegalOpening'
    duration = item.get('days')
    if type(duration) is not int or duration < 1 or duration > 9007199254740991:
        return boundary('dayDurationNotSpecified')
    if path['days'] is not None and duration != path['days']:
        return boundary('statutoryDurationMismatch')
    if duration < path.get('minimumDays', 1):
        return boundary('durationOutsideQualifiedRange')
    lower, upper = (dt.date.fromisoformat(suite['window'][key]) for key in ('from', 'to'))
    outside = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow'}
    if not lower <= trigger <= upper:
        return outside
    binding = path['calendarBinding']
    assert binding['type'] in ('fixed', 'fact')
    if binding['type'] == 'fixed':
        name = binding['calendar']
    else:
        name = facts.get(binding['fact'])
        if name not in binding['allowed']:
            return boundary('holidayAnchorNotQualified')
    assert name in suite['calendars']
    # Enumerate the complete window and select the nth day, independently of Node's date addition.
    all_dates = [trigger + n * DAY for n in range((upper - trigger).days + 1)]
    if duration >= len(all_dates):
        return outside
    nominal = all_dates[duration]
    closure = suite['officeClosures'][path['officeClosure']] if path.get('officeClosure') else None
    fixed = {dt.date.fromisoformat(date) for date in closure['dates']} if closure else set()
    uncertain = closure.get('uncertainty') if closure else None
    mode = facts.get(uncertain['fact']) if uncertain else None
    closed_value = uncertain.get('closedValue', 'confirmedClosed') if uncertain else 'confirmedClosed'
    unknown_value = uncertain.get('unknownValue', 'unknown') if uncertain else 'unknown'
    open_values = uncertain.get('openValues', ['notApplicable', 'confirmedOpen']) if uncertain else []
    if uncertain and mode not in [*open_values, closed_value, unknown_value]:
        return boundary('officeClosureNotQualified')
    optional = {dt.date.fromisoformat(date) for date in uncertain['dates']} if uncertain else set()

    def end(include_optional):
        return next((date for date in all_dates if date >= nominal and date.weekday() < 5
                     and date not in holidays(name, date.year, suite)
                     and date not in fixed and (not include_optional or date not in optional)), None)

    without, with_optional = end(False), end(True) if uncertain else end(False)

    def bind_through(last):
        result = []
        for date in all_dates:
            if date > last:
                break
            choices = [row for row in suite['temporalBindings'][path.get('temporalBindingKey', path['canton'])]
                       if row['from'] <= date.isoformat() <= row['to']]
            assert len(choices) == 1, 'Missing or ambiguous temporal binding'
            if choices[0]['id'] not in result:
                result.append(choices[0]['id'])
        return result

    if uncertain and mode == unknown_value and without != with_optional:
        if without is None or with_optional is None:
            return outside
        bind_through(with_optional)
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': uncertain['reason'],
                'legalOpening': trigger.isoformat(), 'nominalEnd': nominal.isoformat(),
                'endWithoutOptionalClosure': without.isoformat(), 'endWithOptionalClosure': with_optional.isoformat()}
    ending = with_optional if uncertain and mode == closed_value else without
    if ending is None:
        return outside
    used = [date.isoformat() for date in all_dates if nominal <= date < ending and
            (date in fixed or uncertain and mode == closed_value and date in optional)]
    return {'outcome': 'datedResearchValue', 'legalOpening': trigger.isoformat(),
            'ordinaryStart': all_dates[1].isoformat(), 'nominalEnd': nominal.isoformat(), 'end': ending.isoformat(),
            'endShiftDays': (ending - nominal).days, 'suspension': 'none', 'calendar': name,
            'officeClosureDays': used, 'temporalBindings': bind_through(ending)}


def raw_date(rule, year):
    assert rule['condition'] == 'always'
    value = rule['calculation']
    if value['type'] == 'fixedMonthDay':
        return dt.date(year, value['month'], value['day'])
    if value['type'] == 'easterOffsetDays':
        return easter(year) + value['offsetDays'] * DAY
    assert value['type'] in ('nthWeekdayOfMonth', 'nthWeekdayOffsetDays')
    return nth_weekday(year, value)


def run():
    raw = FIXTURE.read_bytes()
    suite = json.loads(raw)
    assert suite['formatVersion'] == 'ap23k1-research-references-1'
    assert suite['factPolicy'] == 'explicitCaseFactsOnly'
    assert suite['sharedSyntheticFacts'] == {} and all(row['syntheticFacts'] == {} for row in suite['paths'])
    assert all(suite[key] is False for key in ('runtimeActive', 'productTest', 'exportTest', 'legalApproval'))
    node_raw = (OUTPUT / 'reference-verification.json').read_bytes()
    node = json.loads(node_raw)
    assert node['fixtureSha256'] == hashlib.sha256(raw).hexdigest()
    registered_sources = 0
    analyst_cases, analyst_paths = set(), set()
    for model in suite['sourceModels']:
        model_raw = (ROOT / model['path']).read_bytes()
        assert hashlib.sha256(model_raw).hexdigest() == model['sha256']
        if model.get('sourceRegister'):
            register = json.loads(model_raw)
            for source in register['sources']:
                assert '..' not in source['file'] and not source['file'].startswith('/')
                source_raw = (ROOT / register['sourceBase'] / source['file']).read_bytes()
                assert hashlib.sha256(source_raw).hexdigest() == source['sha256']
                assert len(source_raw) == source['bytes']
                registered_sources += 1
        if model.get('cantonFindings'):
            findings = json.loads(model_raw)
            for path in findings.get('pathProposals', findings.get('groups', [])):
                assert path['id'] not in analyst_paths
                analyst_paths.add(path['id'])
            for original in findings.get('localReferenceCases', findings.get('researchCases', [])):
                assert original['id'] not in analyst_cases
                analyst_cases.add(original['id'])
                candidate = next(row for row in suite['cases'] if row['id'] == original['id'])
                assert candidate['analystSource'] == model['path']
                assert candidate['provenance'] == 'canton-analyst-static-reference'
                assert all(candidate[key] == original[key] for key in ('path', 'trigger', 'days', 'facts'))
                assert candidate['analystExpected'] == original['expected']
    assert analyst_cases == {row['id'] for row in suite['cases']}
    assert analyst_paths == {row['id'] for row in suite['paths']}
    for year, expected in suite['easter'].items():
        assert easter(int(year)).isoformat() == expected
    discrepancies = []
    for item in suite['cases']:
        actual = evaluate(item, suite)
        for key, expected in item['expected'].items():
            if actual.get(key) != expected:
                discrepancies.append({'id': item['id'], 'kind': 'staticExpectation', 'key': key,
                                      'expected': expected, 'actual': actual.get(key)})
        peer = next(row['actual'] for row in node['results'] if row['id'] == item['id'])
        if actual != peer:
            discrepancies.append({'id': item['id'], 'kind': 'nodePythonComparison', 'python': actual, 'node': peer})
    days = 0
    for baseline in suite['calendarBaselines']:
        calendar_raw = (ROOT / baseline['path']).read_bytes()
        assert hashlib.sha256(calendar_raw).hexdigest() == baseline['sha256']
        rules = json.loads(calendar_raw)['rules']
        for year in (2026, 2027):
            raw_dates = {raw_date(rule, year) for rule in rules}
            named = holidays(baseline['calendar'], year, suite)
            assert {date for date in raw_dates if date.weekday() < 5} == {date for date in named if date.weekday() < 5}
            for n in range((dt.date(year + 1, 1, 1) - dt.date(year, 1, 1)).days):
                date = dt.date(year, 1, 1) + n * DAY
                if (date.weekday() >= 5 or date in raw_dates) != (date.weekday() >= 5 or date in named):
                    discrepancies.append({'kind': 'calendarEndEligibility', 'calendar': baseline['calendar'], 'date': date.isoformat()})
                days += 1
    for probe in suite['calendarProbes']:
        date = dt.date.fromisoformat(probe['date'])
        if (date in holidays(probe['calendar'], date.year, suite)) != probe['isHoliday']:
            discrepancies.append({'kind': 'calendarProbe', **probe})
    report = {'workPackage': 'AP23K1', 'asOf': suite['asOf'],
              'status': 'passedIndependentResearchComparison' if not discrepancies else 'discrepancies',
              'fixtureSha256': hashlib.sha256(raw).hexdigest(), 'nodeReportSha256': hashlib.sha256(node_raw).hexdigest(),
              'checkerSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'referenceComparisons': len(suite['cases']), 'calendarEndEligibilityComparisons': days,
              'registeredRawSourcesCompared': registered_sources,
              'calendarProbes': len(suite['calendarProbes']), 'discrepancies': discrepancies,
              'productModulesImported': False, 'legalInterpretationAutomaticallyValidated': False,
              'runtimeActive': False, 'productTest': False, 'exportTest': False, 'legalApproval': False}
    if '--write' in sys.argv:
        (OUTPUT / 'reference-independent-verification.json').write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if discrepancies else 0


if __name__ == '__main__':
    assert all(value == '--write' for value in sys.argv[1:])
    sys.exit(run())
