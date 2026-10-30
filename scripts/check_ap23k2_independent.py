# SPDX-License-Identifier: AGPL-3.0-only
"""Independent K2 candidate inspection and date enumeration, without JS or product imports."""
import argparse
import copy
import hashlib
import importlib.metadata
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'data/candidates/2026-10-27-ap23j3'
OUT = ROOT / 'outputs/ap23k2-candidate-2026-10-27'
BUNDLE = OUT / 'bundle'
REPORT = ROOT / 'outputs/ap23k2-2026-10-27/independent-verification.json'
SUITE = ROOT / 'docs/fachrecht/ap23k1/referenzfaelle.json'
GUARD = ROOT / 'outputs/ap23k2-2026-10-27/protected-inputs.json'
GUARD_SHA = '87bce79b661302e4e94091d3664a77c922411782bed38c9f986d6a99f5d2492b'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
WINDOW = {'from': '2026-08-29', 'to': '2027-12-31'}
DAY = timedelta(days=1)
DIAGNOSTIC_CASES = {'K1-BL-R17': False, 'K1-BL-R18': True}
ANNOTATION_KEYS = {'authorityCanton', 'partyCanton', 'openingProvenance', 'orderProvenance', 'regionalOfficeMode'}


def load(path):
    return json.loads(path.read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())


def same(a, b):
    return type(a) is type(b) and a == b


def index(rows, key):
    result = {row[key]: row for row in rows}
    assert len(result) == len(rows), 'Duplicate ' + key
    return result


def evidence(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'byteLength': len(raw), 'sha256': sha(raw)}


def inside(day, interval):
    value = day.isoformat() if isinstance(day, date) else day
    return interval['from'] <= value and (interval.get('to') is None or value <= interval['to'])


def easter(year):
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    ell = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * ell) // 451
    month, day = divmod(h + ell - 7 * m + 114, 31)
    return date(year, month, day + 1)


def rule_day(rule, year):
    calc = rule['calculation']
    if calc['type'] == 'fixedMonthDay':
        value = date(year, calc['month'], calc['day'])
    elif calc['type'] == 'easterOffsetDays':
        value = easter(year) + calc['offsetDays'] * DAY
    else:
        assert calc['type'] in ('nthWeekdayOfMonth', 'nthWeekdayOffsetDays')
        first = date(year, calc['month'], 1)
        value = first + ((calc['isoWeekday'] - first.isoweekday()) % 7 + 7 * (calc['occurrence'] - 1)) * DAY
        if calc['type'] == 'nthWeekdayOffsetDays':
            value += calc['offsetDays'] * DAY
    condition = rule.get('condition', 'always')
    assert condition in ('always', 'unlessTuesdayOrSaturday', 'onlyMonday', 'shiftHolyThursdayBy7Days')
    if condition == 'unlessTuesdayOrSaturday' and value.isoweekday() in (2, 6):
        return None
    if condition == 'onlyMonday' and value.isoweekday() != 1:
        return None
    if condition == 'shiftHolyThursdayBy7Days' and easter(year) - 7 * DAY <= value < easter(year):
        value += 7 * DAY
    return value


def calendar_dates(ident, calendars, year, seen=None):
    seen = set() if seen is None else set(seen)
    assert ident not in seen, 'Cyclic physical calendar'
    seen.add(ident)
    calendar = calendars[ident]
    result = set()
    for rule in calendar['rules']:
        if rule.get('effect', {}).get('type') != 'holiday':
            continue
        day = rule_day(rule, year)
        if day and inside(day, calendar['validity']) and inside(day, rule['validity']):
            result.add(day)
    for parent in calendar['inherits']:
        result.update(calendar_dates(parent, calendars, year, seen))
    return result


def enumerate_end(trigger, days, holiday, closures=(), extra=(), upper='2027-12-31'):
    """Select the nth next calendar day, then first admissible end from a full date range."""
    upper_date = date.fromisoformat(upper)
    if type(days) is not int or days < 1:
        return {'outcome': 'qualificationBoundaryProposed'}
    if not date.fromisoformat(WINDOW['from']) <= trigger <= upper_date:
        return {'outcome': 'researchWindowBoundary'}
    full = [trigger + n * DAY for n in range((upper_date - trigger).days + 1)]
    counted = full[1:]
    if len(counted) < days:
        return {'outcome': 'researchWindowBoundary'}
    nominal = counted[days - 1]
    end = next((day for day in full if day >= nominal and day.weekday() < 5 and not holiday(day)
                and day.isoformat() not in closures and day.isoformat() not in extra), None)
    if end is None:
        return {'outcome': 'researchWindowBoundary'}
    return {'outcome': 'datedResearchValue', 'legalOpening': trigger.isoformat(), 'ordinaryStart': counted[0].isoformat(),
            'nominalEnd': nominal.isoformat(), 'end': end.isoformat()}


def compare_worlds(left, right, reason):
    if left['outcome'] == right['outcome'] == 'datedResearchValue' and left['end'] == right['end']:
        return left
    if 'researchWindowBoundary' in (left['outcome'], right['outcome']):
        return {'outcome': 'researchWindowBoundary'}
    return {'outcome': 'unresolvedBoundaryProposed', 'reason': reason}


def adapt(case, suite):
    path = next(row for row in suite['paths'] if row['id'] == case['path'])
    facts = copy.deepcopy(case['facts'])
    annotations = {key: facts.pop(key) for key in sorted(ANNOTATION_KEYS) if key in facts}
    if 'authorityCanton' in annotations:
        assert annotations['authorityCanton'] == path['canton']
    return {'path': case['path'].lower(), 'pathRevision': 1, 'authoritySeatCanton': path['canton'],
            'trigger': case['trigger'], 'days': case['days'], 'facts': facts}, annotations


def synthetic_references(suite, catalog):
    """Static expectations decided independently of both evaluators."""
    selection = next(row for row in catalog['holidayBindings'] if row['holidayBindingId'] == 'bs-party-representative')['calendarSelection']
    seed, _ = adapt(next(row for row in suite['cases'] if row['id'] == 'K1-BS-R03'), suite)
    rows = []
    for terminal in selection['terminals']:
        for n, variant in enumerate(terminal['variants']):
            item = copy.deepcopy(seed)
            item['facts']['legalAnchorCanton'] = terminal['canton']
            if terminal['requiredAreaScopeIds']:
                item['areaFacts'] = {row['scopeId']: row['member'] for row in variant['areaFacts']}
            rows.append({'id': 'PY-K2-OCT-' + terminal['canton'] + '-' + str(n), 'input': item,
                         'expected': {'outcome': 'datedResearchValue', 'end': '2026-10-12'}})
    ordered, _ = adapt(next(row for row in suite['cases'] if row['path'] == 'BS-COURT-ORDERED' and row['expected']['outcome'] == 'datedResearchValue'), suite)
    for canton, scope, trigger, open_end, closed_end in [
        ('AI', 'AI-RTG-INNER-ADDITIONAL', '2027-09-21', '2027-09-22', '2027-09-23'),
        ('NE', 'NE-LANDERON-ADDITIONAL', '2027-05-26', '2027-05-27', '2027-05-28')]:
        for member, expected in [(False, open_end), (True, closed_end)]:
            item = copy.deepcopy(ordered)
            item['trigger'], item['days'] = trigger, 1
            item['facts']['legalAnchorCanton'] = canton
            item['areaFacts'] = {scope: member}
            rows.append({'id': 'PY-K2-AREA-' + canton + '-' + str(member), 'input': item,
                         'expected': {'outcome': 'datedResearchValue', 'end': expected}})
        for suffix, area in [('missing', None), ('unqualified', {scope: 'false'}),
                             ('foreign', {'unrecognised': False})]:
            item = copy.deepcopy(ordered)
            item['trigger'], item['days'] = trigger, 1
            item['facts']['legalAnchorCanton'] = canton
            if area is not None:
                item['areaFacts'] = area
            rows.append({'id': 'PY-K2-AREA-' + canton + '-' + suffix, 'input': item,
                         'expected': {'outcome': 'qualificationBoundaryProposed'}})
    for suffix, change in [('unknown-canton', {'legalAnchorCanton': 'XX'}),
                           ('unqualified-anchor', {'legalAnchorQualification': 'notDetermined'}),
                           ('role-invention', {'representativeRole': 'professional'})]:
        item = copy.deepcopy(seed)
        item['facts'].update(change)
        rows.append({'id': 'PY-K2-' + suffix, 'input': item, 'expected': {'outcome': 'qualificationBoundaryProposed'}})
    for key, value in [('regionalOfficeMode', 'confirmedFullClosure'), ('officeClosureOverride', True), ('jurisdictionRole', 'party')]:
        item = copy.deepcopy(seed)
        item[key] = value
        rows.append({'id': 'PY-K2-NO-OVERRIDE-' + key, 'input': item, 'expected': {'outcome': 'qualificationBoundaryProposed'}})
    return rows


def sg_january_diagnostics(catalog, calendars, holiday_catalog):
    selection = next(row for row in catalog['holidayBindings'] if row['holidayBindingId'] == 'bs-party-representative')['calendarSelection']
    sg = next(row for row in selection['terminals'] if row['canton'] == 'SG')
    variant = sg['variants'][0]
    alternative = next(row for row in holiday_catalog['activation']['projections'] if row['id'] == variant['alternativeProjectionId'])
    left, right = variant['calendarId'], alternative['calendarId']
    assert sg['ambiguity']['catalogRuleIds'] == ['SG-ZPO-ADDITIONAL-DAY-BERCHTOLD']
    rows = []
    for year, days, expected in [(2027, 1, ('2027-01-04', '2027-01-04')),
                                 (2028, 1, ('2028-01-03', '2028-01-03')),
                                 (2029, 1, ('2029-01-02', '2029-01-03')),
                                 (2029, 3, ('2029-01-04', '2029-01-04'))]:
        trigger = date(year, 1, 1)
        a = enumerate_end(trigger, days, lambda day: day in calendar_dates(left, calendars, day.year), upper=f'{year}-01-31')
        b = enumerate_end(trigger, days, lambda day: day in calendar_dates(right, calendars, day.year), upper=f'{year}-01-31')
        assert (a['end'], b['end']) == expected
        rows.append({'year': year, 'days': days, 'withoutJanuaryRule': a['end'], 'withJanuaryRule': b['end'],
                     'different': a['end'] != b['end'], 'diagnosticCalendarArithmeticOnly': True,
                     'outsideK1Window': year != 2027, 'legalApproval': False, 'exportAllowed': False})
    return rows


def physical_calendar_diagnostics(calendars):
    """Actual byte-bound formulas. Pre-activation examples never become eligible case dates."""
    rows = []
    cases = [('ap22-ar-88bb22c08a22', '2026-12-26', False), ('ap22-ar-88bb22c08a22', '2027-12-26', True),
             ('ap22-ai-5d4e5a68e106', '2026-12-26', False), ('ap22-ai-5d4e5a68e106', '2027-12-26', True),
             ('ap22-gl-87c11e156541', '2026-04-02', False), ('ap22-gl-87c11e156541', '2026-04-09', True),
             ('ap22-gl-87c11e156541', '2027-04-01', True)]
    for ident, value, expected in cases:
        day = date.fromisoformat(value)
        calendar = calendars[ident]
        activated = inside(day, calendar['validity'])
        actual = day in calendar_dates(ident, calendars, day.year) if activated else any(
            rule.get('effect', {}).get('type') == 'holiday' and rule_day(rule, day.year) == day for rule in calendar['rules'])
        assert actual is expected
        rows.append({'calendarId': ident, 'date': value, 'expected': expected, 'actual': actual,
                     'calendarDataOnly': True, 'legalCaseWindowApplied': False, 'calendarActivationApplied': activated,
                     'probeMeaning': 'activatedCalendarData' if activated else 'formulaOnlyNotAnEligibleCalendarDate'})
    return rows


def validate_schemas(manifest, catalog):
    names = {'catalog': 'administrative-procedure-catalog-v8.schema.json', 'input': 'administrative-input-v8.schema.json',
             'manifest': 'release-manifest-v15.schema.json', 'localManifest': 'local-reference-manifest-v15.schema.json'}
    schemas = {key: ROOT / ('schemas/candidates/ap23k2/' + value) for key, value in names.items()}
    validators = {}
    for key, path in schemas.items():
        schema = load(path)
        Draft202012Validator.check_schema(schema)
        validators[key] = Draft202012Validator(schema, format_checker=FormatChecker())
    validators['catalog'].validate(catalog)
    validators['localManifest'].validate(manifest)
    assert not validators['manifest'].is_valid(manifest), 'Local candidate may not pass the production manifest contract'
    return validators, schemas


def evaluate(item, catalog, calendars, holiday_catalog, input_validator=None, diagnostic_optional=None):
    def block(reason):
        return {'outcome': 'qualificationBoundaryProposed', 'reason': reason}
    outside = {'outcome': 'researchWindowBoundary'}
    if type(item) is not dict or set(item) - {'path', 'pathRevision', 'authoritySeatCanton', 'trigger', 'days', 'facts', 'areaFacts'}:
        return block('unknownInputProperty')
    p = next((row for row in catalog['paths'] if row['pathId'] == item.get('path')), None)
    q = next((row for row in catalog['qualificationPolicies'] if row['pathId'] == item.get('path')), None)
    if p is None or q is None or p.get('contractFamily') != 'qualifiedDayProcedureV8' or q.get('mode') != 'qualifiedDayProcedureV8':
        return block('unsupportedPath')
    try:
        trigger = date.fromisoformat(item['trigger'])
        if trigger.isoformat() != item['trigger']:
            return block('invalidDate')
    except (ValueError, KeyError, TypeError):
        return block('invalidDate')
    law = next(row for row in catalog['laws'] if row['lawId'] == p['lawId'])
    if item.get('pathRevision') != p['revision'] or item.get('authoritySeatCanton') != law['canton']:
        return block('contextMismatch')
    binding = next(row for row in catalog['holidayBindings'] if row['holidayBindingId'] == p['holidayBindingId'])
    selection = binding['calendarSelection']
    facts = item.get('facts')
    allowed = {row['key'] for row in q['requirements']}
    if selection['kind'] == 'qualifiedPartyOrRepresentativeCanton':
        allowed.update((selection['qualificationFact'], selection['cantonFact']))
    if type(facts) is not dict or set(facts) - allowed:
        return block('unknownCaseFact')
    for requirement in q['requirements']:
        values = requirement['oneOf'] if 'oneOf' in requirement else [requirement['value']]
        if requirement['key'] not in facts or not any(same(facts[requirement['key']], value) for value in values):
            return block('currentQualificationMissing')
    if input_validator and not input_validator.is_valid(item):
        return block('inputContractInvalid')
    days = item.get('days')
    if type(days) is not int or not 1 <= days <= 9007199254740991:
        return block('durationNotQualified')
    duration = p['duration']
    if duration['kind'] == 'statutoryDays' and days != duration['value']:
        return block('statutoryDurationMismatch')
    if duration['kind'] == 'authorityOrderedDays' and not duration['minimum'] <= days <= duration['maximum']:
        return block('orderedDurationOutsideTechnicalGuard')
    entry = next(row for row in catalog['releaseBinding']['pathEligibility'] if row['pathId'] == p['pathId'])
    if entry.get('status') != 'candidate' or entry.get('pathSha256') != digest(p) or entry.get('qualificationPolicySha256') != digest(q) \
            or entry.get('holidayBindingSha256') != digest(binding):
        return block('eligibilityMismatch')
    if entry.get('calendarSelectionSha256') != digest(binding['calendarSelection']) \
            or entry.get('annualEndShiftPolicySha256') != digest(binding['annualEndShiftPolicy']):
        return block('newPolicyIntegrityMismatch')
    alternatives = []
    if selection['kind'] == 'fixedAuthoritySeat':
        if item.get('areaFacts'):
            return block('unexpectedAreaFacts')
        alternatives = [selection['calendarId']]
    else:
        assert selection['kind'] == 'qualifiedPartyOrRepresentativeCanton'
        if facts.get(selection['qualificationFact']) != selection['qualifiedValue']:
            return block('holidayAnchorUnqualified')
        terminals = [row for row in selection['terminals'] if row['canton'] == facts.get(selection['cantonFact'])]
        if len(terminals) != 1:
            return block('holidayAnchorUnqualified')
        terminal = terminals[0]
        area = item.get('areaFacts', {})
        if type(area) is not dict or set(area) != set(terminal['requiredAreaScopeIds']) \
                or any(type(value) is not bool for value in area.values()):
            return block('areaQualificationMissing')
        matched = [row for row in terminal['variants'] if {fact['scopeId']: fact['member'] for fact in row['areaFacts']} == area]
        if len(matched) != 1:
            return block('areaQualificationMissing')
        variant = matched[0]
        alternatives = [variant['calendarId']]
        if variant['alternativeProjectionId'] is not None:
            alternative = next(row for row in holiday_catalog['activation']['projections'] if row['id'] == variant['alternativeProjectionId'])
            alternatives.append(alternative['calendarId'])
    assert p['openingPolicy']['kind'] == 'qualifiedCurrentTrigger' and p['openingPolicy']['transformation'] == 'none'
    profile = next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId'] == p['suspensionSelection']['suspensionProfileId'])
    assert profile['periods'] == [], 'K1 has no general recess'
    spans = [WINDOW] + [p['temporalBinding'][key] for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage')]
    dependencies = set()
    def collect(ident, visiting):
        assert ident not in visiting, 'Cyclic calendar dependency'
        if ident in dependencies:
            return
        dependencies.add(ident)
        for parent in calendars[ident]['inherits']:
            collect(parent, visiting | {ident})
    for ident in alternatives:
        collect(ident, set())
    spans.extend(calendars[ident]['validity'] for ident in dependencies)
    if not all(inside(trigger, interval) for interval in spans):
        return outside
    upper = min(interval['to'] for interval in spans if interval['to'] is not None)
    annual = binding['annualEndShiftPolicy']
    closures, optional = set(), []
    if annual['kind'] == 'blCantonalOfficeClosures':
        spans.append(annual['coverage'])
        closures = {day for year in annual['years'] for day in year['dates']}
        optional = annual['uncertainty']['dates']
        upper = min(upper, annual['coverage']['to'])
    else:
        assert annual['kind'] == 'none'
    worlds = []
    for ident in alternatives:
        cache = {}
        def holiday(day):
            if day.year not in cache:
                cache[day.year] = calendar_dates(ident, calendars, day.year)
            return day in cache[day.year]
        for with_optional in ([False, True] if optional and diagnostic_optional is None else [bool(diagnostic_optional)]):
            result = enumerate_end(trigger, days, holiday, closures, optional if with_optional else (), upper)
            if result['outcome'] == 'datedResearchValue':
                end = date.fromisoformat(result['end'])
                all_days = [trigger + n * DAY for n in range((end - trigger).days + 1)]
                if not all(all(inside(day, span) for span in spans) and len([row for row in p['normTimeline'] if inside(day, row['interval'])]) == 1 for day in all_days):
                    result = outside
            worlds.append(result)
    result = worlds[0]
    for world in worlds[1:]:
        result = compare_worlds(result, world, 'BL-B-FASNACHT' if optional else 'SG-JANUARY-UNCERTAINTY')
    return result


def validate_structure(catalog, old, suite, calendars, holiday_catalog, manifest):
    paths, policies = index(catalog['paths'], 'pathId'), index(catalog['qualificationPolicies'], 'pathId')
    entries = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
    bindings = index(catalog['holidayBindings'], 'holidayBindingId')
    profiles = index(catalog['suspensionProfiles'], 'suspensionProfileId')
    sources = index(catalog['sources'], 'sourceId')
    assert (len(paths), len(policies), len(entries), len(catalog['laws']), len(profiles), len(bindings), len(sources)) == (165, 165, 165, 20, 37, 30, 112)
    assert len(old['paths']) == 149 and len(suite['paths']) == 16
    for field, key in (('paths', 'pathId'), ('qualificationPolicies', 'pathId'), ('laws', 'lawId'), ('sources', 'sourceId'),
                       ('suspensionProfiles', 'suspensionProfileId'), ('holidayBindings', 'holidayBindingId'),
                       ('excludedPaths', 'exclusionId'), ('preserved', 'path')):
        current = index(catalog[field], key)
        for row in old[field]:
            assert digest(current[row[key]]) == digest(row), 'Changed accepted object ' + field + '/' + row[key]
    for row in old['releaseBinding']['pathEligibility']:
        assert digest(entries[row['pathId']]) == digest(row)
    assert set(paths) == {row['pathId'] for row in old['paths']} | {row['id'].lower() for row in suite['paths']}
    assert catalog['formatVersion'] == '8.0.0' and catalog['contractStatus'] == 'proposed' and catalog['runtimeActive'] is False
    assert catalog['contractDecision'] == {'id': 'DEC-2026-040', 'status': 'proposed', 'on': None}
    assert catalog['releaseBinding']['status'] == 'candidate' and catalog['releaseBinding']['targetComponentRefs'] == []
    for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'):
        assert catalog['releaseBinding'][key] is None
    vwvg_bindings = {row['id']: row for row in holiday_catalog['activation']['procedureBindings'] if row['profileId'] == 'vwvg'}
    projections = index(holiday_catalog['activation']['projections'], 'id')
    party = bindings['bs-party-representative']
    selection = party['calendarSelection']
    assert selection['kind'] == 'qualifiedPartyOrRepresentativeCanton'
    assert (selection['qualificationFact'], selection['qualifiedValue'], selection['cantonFact'], selection['sourceProfileId']) == \
        ('legalAnchorQualification', 'establishedPartyOrRepresentative', 'legalAnchorCanton', 'vwvg')
    assert selection['usage'] == 'holidayProjectionOnlyNoFederalProcedurePermission' and selection['otherwise'] == 'block'
    assert len(selection['terminals']) == len(vwvg_bindings) == 26
    assert {row['bindingId'] for row in selection['terminals']} == set(vwvg_bindings)
    projected_ids, variant_count = set(), 0
    for terminal in selection['terminals']:
        original = vwvg_bindings[terminal['bindingId']]
        assert terminal['bindingSha256'] == digest(original)
        assert original['jurisdiction'] == 'CH-' + terminal['canton']
        assert terminal['requiredAreaScopeIds'] == original['requiredAreaScopeIds']
        assert terminal['boundaryIds'] == original['boundaryIds'] and terminal['ambiguity'] == original['ambiguity']
        assert len(terminal['variants']) == len(original['variants'])
        for variant, before in zip(terminal['variants'], original['variants']):
            variant_count += 1
            for key in ('areaFacts', 'projectionId', 'alternativeProjectionId'):
                assert variant[key] == before[key]
            primary = projections[variant['projectionId']]
            assert variant['projectionSha256'] == digest(primary) and variant['calendarId'] == primary['calendarId']
            projected_ids.add(primary['id'])
            if variant['alternativeProjectionId'] is not None:
                secondary = projections[variant['alternativeProjectionId']]
                assert variant['alternativeProjectionSha256'] == digest(secondary)
                projected_ids.add(secondary['id'])
            else:
                assert variant['alternativeProjectionSha256'] is None
    assert variant_count == 28 and len(projected_ids) == 29
    assert party['legalBinding']['roleUnion'] is False and party['legalBinding']['partyOrRepresentativeRequired'] is True
    assert party['physicalSource']['eligibilityMeaning'] == 'physicalSourceOnlyNotFederalProcedurePermission'
    artifacts = index(manifest['artifacts'], 'path')
    for binding in (party, bindings['bs-authority-seat'], bindings['bl-authority-seat']):
        assert binding['physicalSource']['releaseId'] == manifest['releaseId']
        assert binding['physicalSource']['eligibilityMeaning'] == 'physicalSourceOnlyNotFederalProcedurePermission'
        refs = binding['physicalSource']['references']
        assert len(index(refs, 'path')) == len(refs)
        for ref in refs:
            raw = (BUNDLE / ref['path']).read_bytes()
            assert sha(raw) == ref['sha256'] == artifacts[ref['path']]['sha256']
            assert ref['role'] == artifacts[ref['path']]['role'] and ref['contentId'] == artifacts[ref['path']]['contentId']
    bl_policy = bindings['bl-authority-seat']['annualEndShiftPolicy']
    assert bl_policy['kind'] == 'blCantonalOfficeClosures' and bl_policy['effect'] == 'endShiftOnly' and bl_policy['coverage'] == WINDOW
    expected_closures = suite['officeClosures']['BL-ANNUAL']['dates']
    assert sorted(day for row in bl_policy['years'] for day in row['dates']) == sorted(expected_closures)
    assert len(expected_closures) == 13
    assert [(row['year'], row['coverage']) for row in bl_policy['years']] == [
        (2026, {'from': '2026-08-29', 'to': '2026-12-31'}), (2027, {'from': '2027-01-01', 'to': '2027-12-31'})]
    for row in bl_policy['years']:
        assert all(int(day[:4]) == row['year'] and inside(day, row['coverage']) for day in row['dates'])
        assert row['sourceRefs'] and all(ref['sourceId'] in sources and ref['locator'] for ref in row['sourceRefs'])
    uncertainty = bl_policy['uncertainty']
    assert {key: value for key, value in uncertainty.items() if key != 'sourceRefs'} == {
        'boundaryId': 'BL-B-FASNACHT', 'dates': ['2027-02-09'], 'comparison': 'twoCompleteAdministrativePaths',
        'onDifference': 'blockDefinitiveResultAndExport', 'onEqual': 'sameResult', 'inputOverride': 'forbidden'}
    assert bindings['bs-authority-seat']['annualEndShiftPolicy'] == party['annualEndShiftPolicy'] == {'kind': 'none'}
    for research in suite['paths']:
        p, q, entry = paths[research['id'].lower()], policies[research['id'].lower()], entries[research['id'].lower()]
        assert p['researchRef'] == research['id'] and p['contractFamily'] == q['mode'] == 'qualifiedDayProcedureV8'
        assert p['duration'] == ({'kind': 'statutoryDays', 'value': research['days'], 'overridable': False} if research['days'] is not None else
                                 {'kind': 'authorityOrderedDays', 'minimum': 1, 'maximum': 365, 'boundMeaning': 'technicalSafetyLimitNotLegalMaximum'})
        assert len(q['requirements']) == len(research['requirements'])
        for after, before in zip(q['requirements'], research['requirements']):
            assert after['key'] == before['key']
            assert {key: after[key] for key in ('value', 'oneOf') if key in after} == {key: before[key] for key in ('value', 'oneOf') if key in before}
        assert q['pathRevision'] == p['revision'] == 1
        assert q['pathSha256'] == entry['pathSha256'] == digest(p)
        assert entry['qualificationPolicySha256'] == digest(q)
        binding = bindings[p['holidayBindingId']]
        assert entry['holidayBindingSha256'] == digest(binding)
        assert entry['calendarSelectionSha256'] == digest(binding['calendarSelection'])
        assert entry['annualEndShiftPolicySha256'] == digest(binding['annualEndShiftPolicy'])
        assert entry['openingPolicySha256'] == digest(p['openingPolicy'])
        assert p['openingPolicy']['kind'] == 'qualifiedCurrentTrigger' and p['openingPolicy']['transformation'] == 'none'
        assert p['qualification']['delivery'] == 'qualifiedTriggerAccordingToOpeningPolicy'
        for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage'):
            assert p['temporalBinding'][key] == WINDOW
        assert p['endShiftGuard'] == 'none'
        profile = profiles[p['suspensionSelection']['suspensionProfileId']]
        assert profile['periods'] == [] and profile['lawId'] == p['lawId']
        assert entry['suspensionSelectionSha256'] == digest(p['suspensionSelection'])
        assert entry['suspensionProfiles'] == [{'suspensionProfileId': profile['suspensionProfileId'], 'sha256': digest(profile)}]
        key = research.get('temporalBindingKey', research['canton'])
        before = suite['temporalBindings'][key]
        assert [(row['researchBindingId'], row['interval']) for row in p['normTimeline']] == [(row['id'], {'from': row['from'], 'to': row['to']}) for row in before]
        if research['id'].startswith('BS-COURT-'):
            assert p['holidayBindingId'] == 'bs-party-representative'
            for segment in p['normTimeline']:
                selected = '20220701' if segment['interval']['from'] < '2027-01-01' else '20270101'
                prohibited = '20270101' if selected == '20220701' else '20220701'
                assert any(selected in ref['sourceId'] for ref in segment['sourceRefs'])
                assert not any(prohibited in ref['sourceId'] for ref in segment['sourceRefs'])
        if research['canton'] == 'BS' and not research['id'].startswith('BS-COURT-'):
            assert p['holidayBindingId'] == 'bs-authority-seat'
            assert not any('VWVG' in ref['sourceId'] for segment in p['normTimeline'] for ref in segment['sourceRefs'])
        assert entry['targetComponentRefs'] == [] and entry['sourceReviewRef'] is None and entry['referenceSuiteRef'] is None
    assert len(calendars) == 35 and sum(len(row['rules']) for row in calendars.values()) == 431
    assert len(holiday_catalog['data']['rules']) == 479 and len(holiday_catalog['activation']['supplementalRules']) == 20
    assert manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '15.0.0'
    assert manifest['releaseStatus'] == 'candidate'
    local = manifest['extensions']['steimer.local-reference']
    assert local['structuralContractProbeOnly'] is True
    assert all(local[key] is False for key in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'))
    return {'vwvgBindings': 26, 'vwvgVariants': variant_count, 'calendarProjections': len(projected_ids), 'annualClosureDates': 13}


def compare_peer(row, peer, catalog, discrepancies):
    """Inspect Node evidence after independent arithmetic, including selected source provenance."""
    assert peer['input'] == row['input'], 'Different adapted current input ' + row['id']
    actual, other = row['actual'], peer['actual']
    if actual['outcome'] != other['outcome'] or actual['outcome'] == 'datedResearchValue' and actual['end'] != other.get('end'):
        discrepancies.append({'id': row['id'], 'kind': 'independentNodeComparison', 'python': actual, 'node': other})
        return
    assert other.get('exportAllowed') is False
    if actual['outcome'] != 'datedResearchValue':
        assert 'end' not in other, 'Boundary carries a definitive result'
        return
    for key in ('legalOpening', 'ordinaryStart', 'nominalEnd', 'end'):
        assert actual[key] == other[key], 'Different arithmetic field ' + row['id'] + '/' + key
    assert other['suspension'] == 'none'
    assert other['endShiftDays'] == (date.fromisoformat(actual['end']) - date.fromisoformat(actual['nominalEnd'])).days
    item = row['input']
    path = next(p for p in catalog['paths'] if p['pathId'] == item['path'])
    binding = next(b for b in catalog['holidayBindings'] if b['holidayBindingId'] == path['holidayBindingId'])
    selection = binding['calendarSelection']
    provenance = other['provenance']
    for key, expected in (
        ('holidayBindingId', binding['holidayBindingId']), ('holidayBindingSha256', digest(binding)),
        ('calendarSelectionSha256', digest(selection)), ('annualEndShiftPolicySha256', digest(binding['annualEndShiftPolicy'])),
        ('openingPolicySha256', digest(path['openingPolicy'])), ('inputMeaning', 'qualifiedLegalOpeningDate'),
        ('qualifiedOpeningDate', item['trigger']), ('authoritySeatCanton', item['authoritySeatCanton']),
        ('areaFacts', item.get('areaFacts', {}))):
        assert provenance[key] == expected, 'Different provenance ' + row['id'] + '/' + key
    # Every traversed day must belong to exactly one norm segment. The list is independently
    # selected by interval overlap rather than copied from the Node result.
    traversed = [date.fromisoformat(item['trigger']) + n * DAY
                 for n in range((date.fromisoformat(actual['end']) - date.fromisoformat(item['trigger'])).days + 1)]
    segments = [segment for segment in path['normTimeline'] if any(inside(day, segment['interval']) for day in traversed)]
    assert provenance['evaluatedNormSegments'] == segments
    assert other['temporalBindings'] == [segment['researchBindingId'] for segment in segments]
    if selection['kind'] == 'fixedAuthoritySeat':
        assert provenance['holidayRole'] == 'authoritySeat' and provenance['legalAnchorCanton'] is None
        assert provenance['terminalBindingId'] is provenance['terminalBindingSha256'] is None
        variant = selection
        assert provenance['boundaryIds'] == []
    else:
        canton = item['facts'][selection['cantonFact']]
        terminal = next(t for t in selection['terminals'] if t['canton'] == canton)
        variant = next(v for v in terminal['variants'] if {f['scopeId']: f['member'] for f in v['areaFacts']} == item.get('areaFacts', {}))
        assert provenance['holidayRole'] == 'qualifiedPartyOrRepresentativeCanton'
        assert provenance['legalAnchorCanton'] == canton
        assert provenance['terminalBindingId'] == terminal['bindingId']
        assert provenance['terminalBindingSha256'] == terminal['bindingSha256']
        assert provenance['boundaryIds'] == terminal['boundaryIds']
    assert provenance['calendarId'] == variant['calendarId'] and provenance['projectionId'] == variant['projectionId']


def peer_synthetic_expected(peer):
    """Independent explicit expectation inventory, never using Node's actual result as oracle."""
    ident = peer['id']
    dated = {
        'bs-court-bl-anchor-no-bl-office-closure': '2026-12-24',
        'bl-procedure-uses-annual-closure-chain': '2027-01-04',
        'bs-AI-explicit-positive-area': '2026-10-12',
        'bs-NE-explicit-positive-area': '2026-10-12',
        'bs-sg-bound-january-comparison': '2027-01-04',
        'bs-ai-september-region-false': '2027-09-22',
        'bs-ai-september-region-true': '2027-09-23',
        'bs-ne-corpus-christi-region-false': '2027-05-27',
        'bs-ne-corpus-christi-region-true': '2027-05-28'
    }
    cantons = ('ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'ZG', 'GL', 'FR', 'SO', 'BS', 'BL',
               'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU')
    dated.update({'bs-qualified-national-anchor-' + canton: '2026-10-12' for canton in cantons})
    blocked = {'bs-AI-missing-current-area', 'bs-NE-missing-current-area', 'bs-missing-anchor',
               'bs-multiple-anchors', 'bs-authority-anchor-only', 'bs-unknown-area-key', 'bs-foreign-role-input',
               'bl-consumer-override-forbidden-noOptionalFullClosure', 'bl-consumer-override-forbidden-confirmedFullClosure'}
    window = {'complete-window-2026-08-28', 'complete-window-2027-12-31'}
    assert ident in set(dated) | blocked | window, 'Unexpected parallel synthetic case ' + ident
    if ident in dated:
        return {'outcome': 'datedResearchValue', 'end': dated[ident]}
    return {'outcome': 'researchWindowBoundary' if ident in window else 'qualificationBoundaryProposed'}


def run(write=False):
    assert sha(GUARD.read_bytes()) == GUARD_SHA
    guard = load(GUARD)
    assert guard['k1ProfessionallyAccepted'] is True and len(guard['files']) == 6612
    for key in ('formatDecision', 'productCodeChangePermission', 'runtimeActivation', 'sourceReleaseApproved', 'operatingChanges'):
        assert guard[key] is False
    suite_raw = SUITE.read_bytes()
    assert sha(suite_raw) == guard['files'][SUITE.relative_to(ROOT).as_posix()]
    suite = json.loads(suite_raw)
    manifest, old_manifest = load(BUNDLE / 'manifest.json'), load(BASE / 'manifest.json')
    artifacts = index(manifest['artifacts'], 'path')
    assert len(artifacts) == len(old_manifest['artifacts']) == 44
    assert set(artifacts) == {row['path'] for row in old_manifest['artifacts']}
    assert sorted(path.relative_to(BUNDLE).as_posix() for path in BUNDLE.rglob('*') if path.is_file() and path.name != 'manifest.json') == sorted(artifacts)
    payloads = {}
    for path, ref in artifacts.items():
        raw = (BUNDLE / path).read_bytes()
        assert len(raw) == ref['byteLength'] and sha(raw) == ref['sha256']
        if path != ADMIN:
            assert raw == (BASE / path).read_bytes(), 'Changed nonadministrative artifact ' + path
        payloads[path] = json.loads(raw)
    catalog, old = payloads[ADMIN], load(BASE / ADMIN)
    holiday_catalog = payloads[HOLIDAY]
    calendars = {row['calendarId']: row for row in payloads.values() if row['dataKind'] == 'calendar'}
    validators, schemas = validate_schemas(manifest, catalog)
    structural = validate_structure(catalog, old, suite, calendars, holiday_catalog, manifest)
    crosswalk = load(OUT / 'source-crosswalk.json')
    assert crosswalk['mappingOnly'] is True and crosswalk['archiveIDsUnchanged'] is True
    assert len(crosswalk['sourceRows']) == 27
    sources = index(catalog['sources'], 'sourceId')
    registered_raw_count = 0
    for row in crosswalk['sourceRows']:
        register_path = ROOT / ('outputs/ap23k1-2026-10-27/sources/' + row['canton'].lower() + '/source-bindings.json')
        assert sha(register_path.read_bytes()) == guard['files'][register_path.relative_to(ROOT).as_posix()]
        original = next(source for source in load(register_path)['sources'] if source['id'] == row['researchSourceId'])
        assert row['url'] == original['url'] == sources[row['catalogSourceId']]['url']
        assert row['researchRole'] == original['role'] and row['sourcePromotion'] is False
        assert row['readingScope'] == original.get('readingScope', original.get('read')) and row['roleLimit']
        source = sources[row['catalogSourceId']]
        assert row['versionDescription'] == original.get('title', original.get('finding', original['id'])) == source['versionDescription']
        assert row['roleLimit'] == original.get('finding', original.get('readingScope', original.get('read')))
        assert source['kind'] == row['kind'] and source['locators'] == row['readingScope']
        assert source['reviewBasis'].endswith('Rolle: ' + original['role'])
        for pin in row['evidence']:
            raw = (ROOT / pin['path']).read_bytes()
            assert len(raw) == pin['byteLength'] and sha(raw) == pin['sha256'] == original['sha256']
            assert guard['files'][pin['path']] == pin['sha256']
            registered_raw_count += 1
    discrepancies, results, diagnostic = [], [], []
    input_rows = {}
    for case in suite['cases']:
        item, annotations = adapt(case, suite)
        actual = evaluate(item, catalog, calendars, holiday_catalog, validators['input'], DIAGNOSTIC_CASES.get(case['id']))
        expected = case['analystExpected']
        if actual['outcome'] != expected['outcome'] or expected['outcome'] == 'datedResearchValue' and actual.get('end') != expected['end']:
            discrepancies.append({'id': case['id'], 'kind': 'acceptedStaticExpectation', 'expected': expected, 'actual': actual})
        row = {'id': case['id'], 'input': item, 'annotations': annotations, 'actual': actual}
        input_rows[case['id']] = row
        (diagnostic if case['id'] in DIAGNOSTIC_CASES else results).append(row)
    synthetic = []
    for row in synthetic_references(suite, catalog):
        actual = evaluate(row['input'], catalog, calendars, holiday_catalog, validators['input'])
        if any(actual.get(key) != value for key, value in row['expected'].items()):
            discrepancies.append({'id': row['id'], 'kind': 'independentStaticSyntheticExpectation', 'expected': row['expected'], 'actual': actual})
        synthetic.append({**row, 'actual': actual})
    january = sg_january_diagnostics(catalog, calendars, holiday_catalog)
    calendar_diagnostics = physical_calendar_diagnostics(calendars)
    # Peers are consulted only after all independent static expectations have been evaluated.
    node_path = OUT / 'QA-AP23K2.json'
    if not node_path.exists():
        raise RuntimeError('Independent results computed, Node comparison report is not yet available')
    node = load(node_path)
    if 'results' not in node:
        raise RuntimeError('Node comparison report has no serializable result list')
    assert node['calendarProbeResults'] == calendar_diagnostics
    peers = index(node['results'], 'id')
    compared = 0
    for row in results:
        assert row['id'] in peers, 'Missing Node consumer result ' + row['id']
        peer = peers[row['id']]
        compare_peer(row, peer, catalog, discrepancies)
        compared += 1
    branch_peers = index(node['branchOracleResults'], 'id')
    assert set(branch_peers) == set(DIAGNOSTIC_CASES)
    for row in diagnostic:
        peer = branch_peers[row['id']]
        assert peer['consumerInput'] is False
        assert peer['world'] == ('withOptionalClosure' if DIAGNOSTIC_CASES[row['id']] else 'withoutOptionalClosure')
        compare_peer(row, peer, catalog, discrepancies)
    parallel_synthetic = []
    assert len(node['syntheticProbeResults']) == 46 and len(index(node['syntheticProbeResults'], 'id')) == 46
    for peer in node['syntheticProbeResults']:
        expected = peer_synthetic_expected(peer)
        assert peer['expected'] == expected
        actual = evaluate(peer['input'], catalog, calendars, holiday_catalog, validators['input'])
        if any(actual.get(key) != value for key, value in expected.items()):
            discrepancies.append({'id': peer['id'], 'kind': 'independentParallelSyntheticExpectation', 'expected': expected, 'actual': actual})
        row = {'id': peer['id'], 'input': peer['input'], 'expected': expected, 'actual': actual}
        compare_peer(row, peer, catalog, discrepancies)
        parallel_synthetic.append(row)
    counts = dict(Counter(row['actual']['outcome'] for row in results))
    report = {'workPackage': 'AP23K2', 'status': 'passedIndependentStructuralAndResearchComparison' if not discrepancies else 'discrepancies',
              'method': 'Independent Python candidate-byte/schema inspection and complete calendar-day enumeration. Node actual results are compared only after independent static expectations.',
              'runtimeActive': False, 'sourceReleaseApproved': False, 'calendarExportEnabled': False,
              'catalogPaths': 165, 'preservedPaths': 149, 'newPaths': 16, 'physicalCalendars': 35, 'physicalProjectionRules': 431,
              'holidayRules': 499, 'artifacts': 44, 'unchangedRawArtifacts': 43, **structural,
              'referenceCases': len(results), 'diagnosticBranchOracleCases': len(diagnostic), 'counts': counts,
              'independentSyntheticCases': len(synthetic), 'sgJanuaryCalendarDiagnosticCases': len(january),
              'physicalCalendarDiagnosticCases': len(calendar_diagnostics),
              'nodeConsumerComparisons': compared, 'nodeDiagnosticBranchComparisons': len(diagnostic),
              'parallelSyntheticComparisons': len(parallel_synthetic), 'sourceByteBindings': registered_raw_count,
              'discrepancies': discrepancies, 'nodeEvidenceSha256': sha(node_path.read_bytes()), 'fixtureSha256': sha(suite_raw),
              'schemaValidator': 'jsonschema ' + importlib.metadata.version('jsonschema'),
              'results': results, 'diagnosticResults': diagnostic, 'independentSyntheticResults': synthetic,
              'sgJanuaryCalendarDiagnostics': january, 'physicalCalendarDiagnostics': calendar_diagnostics,
              'parallelSyntheticResults': parallel_synthetic,
              'evidence': [evidence(path) for path in [Path(__file__), GUARD, SUITE, BUNDLE / 'manifest.json', BUNDLE / ADMIN, *schemas.values()]]}
    if write:
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key not in ('results', 'diagnosticResults', 'independentSyntheticResults', 'sgJanuaryCalendarDiagnostics', 'physicalCalendarDiagnostics', 'parallelSyntheticResults', 'evidence')}, ensure_ascii=False, indent=2))
    return 1 if discrepancies else 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    raise SystemExit(run(args.write))
