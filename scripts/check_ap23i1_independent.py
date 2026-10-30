# SPDX-License-Identifier: AGPL-3.0-only
"""Independent research enumeration. No imports from the application or Node checker."""
import calendar
import datetime as dt
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'docs/fachrecht/ap23i1/referenzfaelle.json'
OUTPUT = ROOT / 'outputs/ap23i1-2026-10-22'
DAY = dt.timedelta(days=1)


def easter(year):
    # Gregorian computus calculated here rather than taking Node's fixture date.
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
    if definition.get('naefelserFahrt'):
        first = next(dt.date(year, 4, d) for d in range(1, 8)
                     if dt.date(year, 4, d).weekday() == calendar.THURSDAY)
        dates.add(first + (7 * DAY if first == easter(year) - 3 * DAY else dt.timedelta()))
    return dates


def paused(date, mode):
    if mode == 'none':
        return False
    assert mode == 'three'
    return (date.month == 12 and date.day >= 18
            or date.month == 1 and date.day <= 2
            or dt.date(date.year, 7, 15) <= date <= dt.date(date.year, 8, 15)
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
    for p in suite['paths']:
        allowed.update(p['syntheticFacts'])
    if any(key not in allowed for key in item.get('facts', {})):
        return boundary('unknownResearchFact')
    facts = dict(suite['sharedSyntheticFacts'], **path['syntheticFacts'])
    facts.update(item.get('facts', {}))
    for req in suite['sharedRequirements'] + path['requirements']:
        if 'oneOf' in req:
            assert type(req['oneOf']) is list and req['oneOf']
            match = any(type(facts.get(req['key'])) is type(value) and facts.get(req['key']) == value for value in req['oneOf'])
        else:
            match = type(facts.get(req['key'])) is type(req['value']) and facts.get(req['key']) == req['value']
        if not match:
            return boundary(req['reason'])
    mode = path['suspension']
    if mode == 'tgNotice':
        if facts.get('exceptionNotice') not in ('given', 'absent'):
            return boundary('exceptionNoticeUnresolved')
        mode = 'three' if facts['exceptionNotice'] == 'absent' else 'none'
    assert path['endShiftCollision'] in ('proposedBoundary', 'notApplicable'), 'Unknown end-shift collision policy'
    assert mode == 'none' or path['endShiftCollision'] == 'proposedBoundary', 'Suspended path requires collision boundary'
    duration = item.get('days')
    if type(duration) is not int or duration < 1 or duration > 9007199254740991:
        return boundary('dayDurationNotSpecified')
    if path['days'] is not None and path['days'] != duration:
        return boundary('statutoryDurationMismatch')
    if duration < path.get('minimumDays', 1) or duration > path.get('maximumDays', 9007199254740991):
        return boundary('durationOutsideQualifiedRange')
    lower, upper = (dt.date.fromisoformat(suite['window'][x]) for x in ('from', 'to'))
    outside = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow'}
    if not lower <= trigger <= upper:
        return outside
    def bind_through(last):
        bindings = []
        for n in range((last - trigger).days + 1):
            date = (trigger + n * DAY).isoformat()
            selected = [b for b in suite['temporalBindings'][path['canton']]
                        if b['from'] <= date <= b['to']]
            assert len(selected) == 1, 'Missing/ambiguous temporal binding'
            if selected[0]['id'] not in bindings:
                bindings.append(selected[0]['id'])
        return bindings
    # Enumerate all available dates before selecting the nth eligible counting day.
    sequence = [trigger + n * DAY for n in range(1, (upper - trigger).days + 1)]
    eligible = [date for date in sequence if not paused(date, mode)]
    if len(eligible) < duration:
        bind_through(upper)
        return outside
    nominal = eligible[duration - 1]
    ending = next((date for date in sequence if date >= nominal and date.weekday() < 5
                   and date not in holidays(path['calendar'], date.year, suite)), None)
    if ending is None:
        bind_through(upper)
        return outside
    bindings = bind_through(ending)
    shifted = [nominal + n * DAY for n in range(1, (ending - nominal).days + 1)]
    collision = next((date for date in shifted if paused(date, mode)), None)
    if collision and path['endShiftCollision'] == 'proposedBoundary':
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'I1-END-SUSPENSION',
                'nominalEnd': nominal.isoformat(), 'ordinaryShiftEnd': ending.isoformat(),
                'firstSuspendedShiftDate': collision.isoformat()}
    return {'outcome': 'datedResearchValue', 'ordinaryStart': (trigger + DAY).isoformat(),
            'firstCountedDay': eligible[0].isoformat(), 'nominalEnd': nominal.isoformat(),
            'end': ending.isoformat(), 'skippedDays': (nominal - trigger).days - duration,
            'endShiftDays': (ending - nominal).days, 'suspension': mode, 'temporalBindings': bindings}


def raw_rule_date(rule, year):
    calc = rule['calculation']
    kind = calc['type']
    if kind == 'fixedMonthDay':
        assert rule['condition'] == 'always'
        return dt.date(year, calc['month'], calc['day'])
    if kind == 'easterOffsetDays':
        assert rule['condition'] == 'always'
        return easter(year) + calc['offsetDays'] * DAY
    assert kind == 'nthWeekdayOfMonth'
    options = [dt.date(year, calc['month'], day)
               for day in range(1, calendar.monthrange(year, calc['month'])[1] + 1)
               if dt.date(year, calc['month'], day).isoweekday() == calc['isoWeekday']]
    date = options[calc['occurrence'] - 1]
    if rule['condition'] == 'shiftHolyThursdayBy7Days':
        assert (calc['month'], calc['isoWeekday'], calc['occurrence']) == (4, 4, 1)
        if date == easter(year) - 3 * DAY:
            date += 7 * DAY
    else:
        assert rule['condition'] == 'always'
    return date


def run():
    raw = FIXTURE.read_bytes()
    suite = json.loads(raw)
    assert suite['formatVersion'] == 'ap23i1-research-references-1'
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
    for probe in suite['calendarProbes']:
        date = dt.date.fromisoformat(probe['date'])
        assert (date in holidays(probe['calendar'], date.year, suite)) == probe['isHoliday']
    days_checked = 0
    for baseline in suite['calendarBaselines']:
        raw = (ROOT / baseline['path']).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == baseline['sha256']
        rules = json.loads(raw)['rules']
        assert len(rules) == 13
        for year in (2026, 2027):
            projected = {raw_rule_date(r, year) for r in rules}
            expected = holidays(baseline['calendar'], year, suite)
            assert len(projected) == 13 and len(expected) == 10
            for n in range(365):
                date = dt.date(year, 1, 1) + n * DAY
                if (date.weekday() >= 5 or date in projected) != (date.weekday() >= 5 or date in expected):
                    discrepancies.append({'kind': 'rawCalendarProjection', 'calendar': baseline['calendar'], 'date': date.isoformat()})
                days_checked += 1
    report = {'workPackage': 'AP23I1', 'asOf': suite['asOf'],
              'status': 'passedIndependentResearchComparison' if not discrepancies else 'discrepancies',
              'fixtureSha256': node['fixtureSha256'], 'nodeReportSha256': hashlib.sha256(node_raw).hexdigest(),
              'checkerSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'referenceComparisons': len(suite['cases']), 'calendarEndEligibilityComparisons': days_checked,
              'calendarProbes': len(suite['calendarProbes']), 'discrepancies': discrepancies,
              'productModulesImported': False, 'legalInterpretationAutomaticallyValidated': False,
              'runtimeActive': False, 'exportTest': False, 'legalApproval': False}
    assert all(arg == '--write' for arg in sys.argv[1:])
    if '--write' in sys.argv:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / 'reference-independent-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return bool(discrepancies)


if __name__ == '__main__':
    sys.exit(run())
