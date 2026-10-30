# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23H2 actual-byte, schema and full-date enumeration probe.

No JavaScript checker, builder constants or product module is imported.
"""
import argparse
import copy
import hashlib
import importlib.metadata
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'data/candidates/2026-10-22-ap23g3'
OUT = ROOT / 'outputs/ap23h2-candidate-2026-10-22'
BUNDLE = OUT / 'bundle'
SCHEMAS = ROOT / 'schemas/candidates/ap23h2'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
FIXTURE = ROOT / 'docs/fachrecht/ap23h1/referenzfaelle.json'
REPORT = ROOT / 'outputs/ap23h2-2026-10-22/QA-AP23H2-INDEPENDENT.json'
WINDOW = {'from': '2026-08-29', 'to': '2027-12-31'}
DAY = timedelta(days=1)


def load(path):
    return json.loads(path.read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical_hash(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())


def index(rows, key):
    found = {r[key]: r for r in rows}
    assert len(found) == len(rows), f'Duplicate {key}'
    return found


def equal(left, right):
    return type(left) is type(right) and left == right


def evidence(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': sha(raw), 'byteLength': len(raw)}


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


def period_date(expr, year):
    if expr['type'] == 'easterOffset':
        return easter(year) + expr['days'] * DAY
    assert expr['type'] == 'fixedMonthDay'
    return date(year + expr['yearOffset'], expr['month'], expr['day'])


def raw_rule_date(rule, year):
    assert rule['condition'] == 'always'
    calc = rule['calculation']
    if calc['type'] == 'fixedMonthDay':
        return date(year, calc['month'], calc['day'])
    if calc['type'] == 'easterOffsetDays':
        return easter(year) + calc['offsetDays'] * DAY
    assert calc['type'] == 'nthWeekdayOfMonth'
    first = date(year, calc['month'], 1)
    return first + ((calc['isoWeekday'] - first.isoweekday()) % 7 + 7 * (calc['occurrence'] - 1)) * DAY


def calendar_dates(ident, calendars, year, check_validity=True, seen=None):
    seen = set() if seen is None else seen
    assert ident not in seen, 'Cyclic calendar inheritance'
    seen = seen | {ident}
    cal = calendars[ident]
    dates = set()
    for parent in cal['inherits']:
        dates |= calendar_dates(parent, calendars, year, check_validity, seen)
    for rule in cal['rules']:
        if rule['effect']['type'] != 'holiday':
            continue
        value = raw_rule_date(rule, year)
        span = rule['validity']
        if not check_validity or span['from'] <= value.isoformat() and (span['to'] is None or value.isoformat() <= span['to']):
            dates.add(value)
    return dates


def legal_calendar(canton, year):
    """Independently transcribed named legal list, not candidate parameters."""
    fixed = [(1, 1), (1, 2), (8, 1), (8, 15), (11, 1), (12, 8), (12, 25), (12, 26)]
    fixed.append((9, 25) if canton == 'OW' else (3, 19))
    return {date(year, m, d) for m, d in fixed} | {easter(year) + n * DAY for n in (-2, 1, 39, 50, 60)}


# Independent duration and pause inventory, not copied from builder constants.
EXPECTED = {
    'ow-admin-20': ('OW', 'administration', 20, 'three'),
    'ow-court-30': ('OW', 'court', 30, 'three'),
    'ow-admin-ordered': ('OW', 'administration', None, 'three'),
    'ow-court-ordered': ('OW', 'court', None, 'three'),
    'ow-admin-reasons-30': ('OW', 'administration', 30, 'three'),
    'ow-court-reasons-30': ('OW', 'court', 30, 'three'),
    'ow-court-suspensive-5': ('OW', 'court', 5, 'none'),
    'nw-admin-20': ('NW', 'administration', 20, 'three'),
    'nw-court-20': ('NW', 'court', 20, 'three'),
    'nw-einsprache-20': ('NW', 'administration', 20, 'three'),
    'nw-admin-ordered': ('NW', 'administration', None, 'none'),
    'nw-einwendung-ordered': ('NW', 'administration', None, 'winter'),
    'nw-einsprache-ordered': ('NW', 'administration', None, 'three'),
    'nw-appeal-ordered': ('NW', 'administration', None, 'three'),
    'nw-court-ordered': ('NW', 'court', None, 'three'),
    'nw-admin-vernehmlassung-20': ('NW', 'administration', 20, 'three'),
    'nw-court-vernehmlassung-20': ('NW', 'court', 20, 'three'),
    'nw-admin-replik-20': ('NW', 'administration', 20, 'three'),
    'nw-court-replik-20': ('NW', 'court', 20, 'three'),
    'nw-admin-duplik-20': ('NW', 'administration', 20, 'three'),
    'nw-court-duplik-20': ('NW', 'court', 20, 'three'),
}


def adapt(case, suite):
    path = next((p for p in suite['paths'] if p['id'] == case['path']), suite['paths'][0])
    facts = dict(suite['sharedSyntheticFacts'])
    facts.update(path['syntheticFacts'])
    facts.update(case.get('facts', {}))
    return {'path': case['path'].lower(), 'pathRevision': 1, 'authoritySeatCanton': path['canton'],
            'trigger': case['trigger'], 'days': case['days'], 'facts': facts}


def evaluate(item, catalog, calendars, validator):
    def block(reason):
        return {'outcome': 'qualificationBoundaryProposed', 'reason': reason, 'exportAllowed': False}

    window_block = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow', 'exportAllowed': False}
    path = next((p for p in catalog['paths'] if p['pathId'] == item['path']), None)
    if path is None:
        return block('unknownResearchPath')
    policy = next(q for q in catalog['qualificationPolicies'] if q['pathId'] == item['path'])
    if policy['mode'] != 'qualifiedDayProcedureV5':
        return block('unknownResearchPath')
    try:
        trigger = date.fromisoformat(item['trigger'])
    except (TypeError, ValueError):
        return block('invalidResearchDate')
    law = next(l for l in catalog['laws'] if l['lawId'] == path['lawId'])
    if item['pathRevision'] != path['revision'] or item['authoritySeatCanton'] != law['canton']:
        return block('pathContextMismatch')
    allowed = {q['key'] for p in catalog['qualificationPolicies'] if p['mode'] == 'qualifiedDayProcedureV5' for q in p['requirements']}
    allowed |= {'openingOrigin', 'priorReasonsRequest'}
    if set(item['facts']) - allowed:
        return block('unknownResearchFact')
    for req in policy['requirements']:
        if not equal(item['facts'].get(req['key']), req['value']):
            return block(req['reason'])
    facts = item['facts']
    if policy['openingChainPolicy'] == 'requireOriginalOrTimelyRequestedReasons':
        if facts.get('openingOrigin') not in ('originalReasoned', 'reasonedFollowingTimelyRequest'):
            return block('openingOriginNotQualified')
        if facts.get('openingOrigin') == 'reasonedFollowingTimelyRequest' and facts.get('priorReasonsRequest') != 'timelyEstablished':
            return block('priorReasonsRequestNotEstablished')
    days = item['days']
    if type(days) is not int or days < 1:
        return block('dayDurationNotSpecified')
    duration = path['duration']
    if duration['kind'] == 'statutoryDays' and days != duration['value']:
        return block('statutoryDurationMismatch')
    if duration['kind'] == 'authorityOrderedDays' and not duration['minimum'] <= days <= duration['maximum']:
        return block('orderedDurationOutsideTechnicalGuard')
    if not validator.is_valid(item):
        return block('inputContractInvalid')
    binding = next(b for b in catalog['holidayBindings'] if b['holidayBindingId'] == path['holidayBindingId'])
    calendar = calendars[binding['physicalBaseline']['calendarId']]
    profiles = next(p for p in catalog['suspensionProfiles'] if p['suspensionProfileId'] == path['suspensionProfileId'])
    spans = [path['temporalBinding'][k] for k in ('caseCoverage', 'calculationCoverage', 'sourceCoverage')] + [calendar['validity']]

    def covered(value):
        text = value.isoformat()
        matches = [t for t in path['normTimeline'] if t['interval']['from'] <= text <= t['interval']['to']]
        return all(s['from'] <= text and (s['to'] is None or text <= s['to']) for s in spans) and len(matches) == 1

    def paused(value):
        return any(period_date(p['start'], y) <= value <= period_date(p['end'], y)
                   for y in (value.year - 1, value.year) for p in profiles['periods'])

    if not covered(trigger):
        return window_block
    upper = date.fromisoformat(path['temporalBinding']['calculationCoverage']['to'])
    future = [trigger + n * DAY for n in range(1, (upper - trigger).days + 1)]
    counted = [d for d in future if not paused(d)]
    if len(counted) < days:
        return window_block
    nominal = counted[days - 1]
    usable = [d for d in future if d >= nominal and d.weekday() < 5 and
              d not in calendar_dates(calendar['calendarId'], calendars, d.year)]
    if not usable:
        return window_block
    end = usable[0]
    examined = [trigger + n * DAY for n in range((end - trigger).days + 1)]
    if not all(covered(d) for d in examined):
        return window_block
    shifted = [nominal + n * DAY for n in range(1, (end - nominal).days + 1)]
    collision = next((d for d in shifted if paused(d)), None)
    if collision and path['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension':
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'H1-END-SUSPENSION',
                'nominalEnd': nominal.isoformat(), 'ordinaryShiftEnd': end.isoformat(),
                'firstSuspendedShiftDate': collision.isoformat(), 'exportAllowed': False}
    timelines = []
    for day in examined:
        entry = next(t for t in path['normTimeline'] if t['interval']['from'] <= day.isoformat() <= t['interval']['to'])
        if entry['researchBindingId'] not in timelines:
            timelines.append(entry['researchBindingId'])
    return {'outcome': 'datedResearchValue', 'ordinaryStart': (trigger + DAY).isoformat(),
            'firstCountedDay': counted[0].isoformat(), 'nominalEnd': nominal.isoformat(), 'end': end.isoformat(),
            'skippedDays': (nominal - trigger).days - days, 'endShiftDays': (end - nominal).days,
            'temporalBindings': timelines, 'exportAllowed': False}


def validate_structure(catalog, old, suite):
    paths, policies = index(catalog['paths'], 'pathId'), index(catalog['qualificationPolicies'], 'pathId')
    entries = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
    bindings = index(catalog['holidayBindings'], 'holidayBindingId')
    profiles = index(catalog['suspensionProfiles'], 'suspensionProfileId')
    laws = index(catalog['laws'], 'lawId')
    assert catalog['formatVersion'] == '5.0.0' and catalog['contractStatus'] == 'proposed'
    assert catalog['runtimeActive'] is False and catalog['contractDecision'] == {'id': 'DEC-2026-037', 'status': 'proposed', 'on': None}
    assert (len(paths), len(policies), len(entries), len(laws), len(profiles), len(bindings)) == (79, 79, 79, 13, 25, 17)
    assert set(paths) == set(policies) == set(entries) == set(EXPECTED) | {p['pathId'] for p in old['paths']}
    release = catalog['releaseBinding']
    assert release['status'] == 'candidate' and release['targetComponentRefs'] == []
    assert all(release[key] is None for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'))
    for group, key in (('paths', 'pathId'), ('qualificationPolicies', 'pathId'), ('laws', 'lawId'),
                       ('suspensionProfiles', 'suspensionProfileId'), ('holidayBindings', 'holidayBindingId'),
                       ('sources', 'sourceId'), ('excludedPaths', 'exclusionId')):
        actual = index(catalog[group], key)
        for item in old[group]:
            assert actual[item[key]] == item, (group, item[key])
    for ident, (canton, stage, days, mode) in EXPECTED.items():
        p, q, e = paths[ident], policies[ident], entries[ident]
        accepted = next(r for r in suite['paths'] if r['id'].lower() == ident)
        assert p['researchRef'] == accepted['id'] and p['contractFamily'] == q['mode'] == 'qualifiedDayProcedureV5'
        assert p['action'] == accepted['action'] and p['stages'] == [stage] and laws[p['lawId']]['canton'] == canton
        assert p['lawId'] == ('stvg-vgv-ow' if canton == 'OW' else 'vrg-nw')
        assert profiles[p['suspensionProfileId']]['lawId'] == bindings[p['holidayBindingId']]['lawId'] == p['lawId']
        assert p['revision'] == q['pathRevision'] == e['pathRevision'] == 1
        assert q['requirements'] == suite['sharedRequirements'] + accepted['requirements']
        assert len({r['key'] for r in q['requirements']}) == len(q['requirements'])
        assert q['openingChainPolicy'] == ('requireOriginalOrTimelyRequestedReasons' if accepted['openingChain'] else 'notApplicable')
        assert q['localHolidayPolicy'] == 'blockConcreteUnresolvedAdditionalEndEffect'
        expected_duration = ({'kind': 'authorityOrderedDays', 'minimum': 1, 'maximum': 365,
                              'boundMeaning': 'technicalSafetyLimitNotLegalMaximum'} if days is None else
                             {'kind': 'statutoryDays', 'value': days, 'overridable': False})
        assert p['duration'] == expected_duration
        assert p['suspensionProfileId'] == f'{canton.lower()}-{mode}'
        assert p['holidayBindingId'] == f'{canton.lower()}-{"court" if stage == "court" else "administration"}-seat'
        assert p['endShiftGuard'] == ('none' if mode == 'none' else 'blockWhenEnteringApplicableSuspension')
        assert p['normTimeline'] and all(p['temporalBinding'][key] == WINDOW for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage'))
        assert [(t['researchBindingId'], t['interval']) for t in p['normTimeline']] == [(t['id'], {'from': t['from'], 'to': t['to']}) for t in suite['temporalBindings'][canton]]
        assert q['pathSha256'] == e['pathSha256'] == canonical_hash(p)
        assert e['qualificationPolicySha256'] == canonical_hash(q)
        assert e['holidayBindingSha256'] == canonical_hash(bindings[p['holidayBindingId']])
        assert e['suspensionProfileSha256'] == canonical_hash(profiles[p['suspensionProfileId']])
        assert e['status'] == 'candidate' and e['targetComponentRefs'] == []
        assert e['sourceReviewRef'] is None and e['referenceSuiteRef'] is None
    sources = index(catalog['sources'], 'sourceId')
    versions = {'OW-STVG-20250101': ('gdb.ow.ch', 1917), 'OW-STVG-20270101': ('gdb.ow.ch', 2031),
                'OW-VGV-20110101': ('gdb.ow.ch', 1659), 'OW-VWVV-20200101': ('gdb.ow.ch', 1658),
                'OW-GOG-20220401': ('gdb.ow.ch', 1792), 'OW-RTG-20090801': ('gdb.ow.ch', 103),
                'NW-VRG-20260801': ('gesetze.nw.ch', 1519), 'NW-RTG-20160101': ('gesetze.nw.ch', 668)}
    for suffix, (domain, version) in versions.items():
        source = sources['SRC-AP23H1-' + suffix]
        assert source['url'] == f'https://{domain}/api/de/versions/{version}/pdf_file'
        assert f'Version {version}' in source['versionDescription']
    for ident, _values in EXPECTED.items():
        path = paths[ident]
        if ident.startswith('ow-'):
            for timeline, version in zip(path['normTimeline'], ('20250101', '20270101')):
                refs = {r['sourceId'] for r in timeline['sourceRefs']}
                assert f'SRC-AP23H1-OW-STVG-{version}' in refs
                other = '20270101' if version == '20250101' else '20250101'
                assert f'SRC-AP23H1-OW-STVG-{other}' not in refs
        else:
            assert {r['sourceId'] for r in path['normTimeline'][0]['sourceRefs']} == {'SRC-AP23H1-NW-VRG-20260801', 'SRC-AP23H1-NW-RTG-20160101'}
    return True


def validate_calendar_bindings(catalog, holiday, original_holiday, calendars, manifest, original_manifest):
    for key in original_holiday:
        if key != 'activation':
            assert holiday[key] == original_holiday[key]
    assert len(holiday['data']['rules']) == 479 and len(holiday['activation']['supplementalRules']) == 20
    assert holiday['activation']['releaseEligibility'] == {'status': 'candidate', 'releaseId': None, 'approval': None}
    for key, identity in (('supplementalRules', 'id'), ('supplementalScopes', 'id'), ('sourceEvidence', 'id'),
                          ('sourceIdMap', 'evidenceId'), ('projections', 'id')):
        actual = index(holiday['activation'][key], identity)
        for old in original_holiday['activation'][key]:
            assert actual[old[identity]] == old
    descriptors, old_descriptors = index(manifest['artifacts'], 'contentId'), index(original_manifest['artifacts'], 'contentId')
    for canton, parent, version in (('OW', 'ap22-ow-76c151dccf1f', '20220401'), ('NW', 'ap22-nw-5dfca484e4af', '20260801')):
        ident = f'ap23h2-{canton.lower()}-procedural-core'
        scope = canton + '-PROCEDURAL-ALL'
        cal = calendars[ident]
        assert cal['inherits'] == [parent] and cal['validity'] == WINDOW and len(cal['rules']) == 4
        assert cal['jurisdiction'] == {'level': 'cantonal', 'code': canton}
        source_id = f'SRC-AP23H1-{canton}-{"GOG" if canton == "OW" else "VRG"}-{version}'
        source = cal['sources'][0]
        assert len(cal['sources']) == 1 and source['sourceId'] == source_id
        additions = [r for r in holiday['activation']['supplementalRules'] if r['scopeId'] == scope]
        assert len(additions) == 4
        for suffix, expression in (
                ('BERCHTOLD', {'type': 'fixedMonthDay', 'month': 1, 'day': 2}),
                ('EASTER-MONDAY', {'type': 'easterOffsetDays', 'offsetDays': 1}),
                ('WHIT-MONDAY', {'type': 'easterOffsetDays', 'offsetDays': 50}),
                ('ST-STEPHEN', {'type': 'fixedMonthDay', 'month': 12, 'day': 26})):
            rule = next(r for r in additions if r['id'] == scope + '-DAY-' + suffix)
            assert rule['calculation'] == expression and rule['dayPortion'] == 'fullDay' and rule['condition'] == 'always'
            assert {r['evidenceId'] for r in rule['sourceRefs']} == {source_id}
            mapped = next(r for r in cal['rules'] if r['ruleId'] == canton + '-CAL-' + rule['id'])
            assert mapped['calculation'] == expression and mapped['condition'] == 'always'
            assert {r['sourceId'] for r in mapped['sourceRefs']} == {source_id}
        projection = next(p for p in holiday['activation']['projections'] if p['calendarId'] == ident)
        original_projection = next(p for p in original_holiday['activation']['projections'] if p['calendarId'] == parent)
        assert projection['ruleIds'] == sorted(original_projection['ruleIds'] + [r['id'] for r in additions])
        assert len(projection['ruleIds']) == 18 and projection['supplementScopeIds'] == [scope]
        for stage in ('administration', 'court'):
            binding = next(b for b in catalog['holidayBindings'] if b['holidayBindingId'] == f'{canton.lower()}-{stage}-seat')
            assert binding['anchor'] == ('courtSeat' if stage == 'court' else 'authoritySeat')
            refs = binding['physicalBaseline']['references']
            assert [r['contentId'] for r in refs] == [ident, parent, 'ch-federal-calendar', 'ch-holiday-catalog']
            for ref in refs:
                descriptor = descriptors[ref['contentId']]
                assert ref == {k: descriptor[k] for k in ('role', 'contentId', 'path', 'sha256')}
            provenance = binding['projectionEvidence']
            assert provenance['baselineCalendarId'] == parent
            assert provenance['baselineCalendarSha256'] == old_descriptors[parent]['sha256']
            assert provenance['baselineCatalogSha256'] == old_descriptors['ch-holiday-catalog']['sha256']
            assert provenance['permissionInheritance'] == 'none'
            assert provenance['legalScope'] == canton + '-' + ('COURT' if stage == 'court' else 'ADMIN')
            assert provenance['legalInterpretation'] == ('directVRG34' if canton == 'NW' else
                                                        'directCourtStatute' if stage == 'court' else
                                                        'systematicAdministrativeTransferConfirmedH1D')
    return True


def run():
    manifest, old_manifest = load(BUNDLE / 'manifest.json'), load(BASE / 'manifest.json')
    catalog, old, suite = load(BUNDLE / ADMIN), load(BASE / ADMIN), load(FIXTURE)
    resources = {}
    for path in list((ROOT / 'schemas').glob('*.schema.json')) + sorted(SCHEMAS.glob('*.schema.json')):
        schema = load(path)
        if '$id' in schema:
            resources[schema['$id']] = Resource.from_contents(schema)
    registry = Registry().with_resources(resources.items())
    validators = {path.name: Draft202012Validator(load(path), registry=registry, format_checker=FormatChecker())
                  for path in sorted(SCHEMAS.glob('*.schema.json'))}
    validators['administrative-procedure-catalog-v5.schema.json'].validate(catalog)
    validators['local-reference-manifest-v12.schema.json'].validate(manifest)
    assert not validators['release-manifest-v12.schema.json'].is_valid(manifest)
    input_validator = validators['administrative-input-v5.schema.json']
    validate_structure(catalog, old, suite)
    artifacts, old_artifacts = index(manifest['artifacts'], 'path'), index(old_manifest['artifacts'], 'path')
    assert len(artifacts) == 44 and len(manifest['calendarIds']) == 35
    unchanged, calendars = 0, {}
    for path, descriptor in artifacts.items():
        raw = (BUNDLE / path).read_bytes()
        assert sha(raw) == descriptor['sha256'] and len(raw) == descriptor['byteLength']
        document = json.loads(raw)
        if path in old_artifacts and raw == (BASE / path).read_bytes():
            unchanged += 1
        if document.get('dataKind') == 'calendar':
            Draft202012Validator(load(ROOT / 'schemas/calendar-rules-v3.schema.json'), registry=registry,
                                 format_checker=FormatChecker()).validate(document)
            calendars[document['calendarId']] = document
    assert unchanged == 40 and len(calendars) == 35
    for descriptor in old_manifest['artifacts']:
        if descriptor['role'] == 'calendar':
            assert (BUNDLE / descriptor['path']).read_bytes() == (BASE / descriptor['path']).read_bytes()
    validate_calendar_bindings(catalog, load(BUNDLE / HOLIDAY), load(BASE / HOLIDAY), calendars, manifest, old_manifest)
    receipt_path = ROOT / 'outputs/ap23h1-abnahme-2026-10-22/receipt.json'
    assert sha(receipt_path.read_bytes()) == '66ecb1c71dea0fd2f2c46e708931a6984ce3ec23c56b1658aff8ba10fdf64318'
    receipt = load(receipt_path)
    assert receipt['professionalAcceptance'] is True and receipt['acceptedBy'] == 'David Steimer'
    for item in receipt['artifacts']:
        raw = (receipt_path.parent / item['path']).read_bytes()
        assert sha(raw) == item['sha256'] and len(raw) == item['byteLength']
    negatives = []

    def rebind(value):
        policy_map = index(value['qualificationPolicies'], 'pathId')
        entry_map = index(value['releaseBinding']['pathEligibility'], 'pathId')
        binding_map = index(value['holidayBindings'], 'holidayBindingId')
        profile_map = index(value['suspensionProfiles'], 'suspensionProfileId')
        for path in value['paths']:
            policy, entry = policy_map[path['pathId']], entry_map[path['pathId']]
            policy['pathSha256'] = canonical_hash(path)
            entry.update(pathSha256=canonical_hash(path), qualificationPolicySha256=canonical_hash(policy),
                         holidayBindingSha256=canonical_hash(binding_map[path['holidayBindingId']]),
                         suspensionProfileSha256=canonical_hash(profile_map[path['suspensionProfileId']]))

    def structural_negative(name, change):
        value = copy.deepcopy(catalog)
        change(value)
        rebind(value)
        rejected = False
        try:
            validate_structure(value, old, suite)
        except (AssertionError, KeyError, TypeError):
            rejected = True
        assert rejected, name
        negatives.append({'id': name, 'rehashedBeforeSemanticCheck': True, 'rejected': True})

    def p(value, ident):
        return next(p for p in value['paths'] if p['pathId'] == ident)

    def q(value, ident):
        return next(q for q in value['qualificationPolicies'] if q['pathId'] == ident)

    for name, change in (
            ('old-path-duration', lambda c: p(c, 'ar-execution-5')['duration'].update(value=6)),
            ('new-reasons-duration', lambda c: p(c, 'ow-court-reasons-30')['duration'].update(value=10)),
            ('new-suspensive-duration', lambda c: p(c, 'ow-court-suspensive-5')['duration'].update(value=30)),
            ('wrong-new-stage', lambda c: p(c, 'nw-court-20').update(stages=['administration'])),
            ('wrong-law-binding', lambda c: p(c, 'ow-admin-20').update(lawId='vrg-nw')),
            ('missing-consent-rule', lambda c: q(c, 'nw-appeal-ordered').update(requirements=[r for r in q(c, 'nw-appeal-ordered')['requirements'] if r['key'] != 'deadlineAgreement'])),
            ('missing-einsprache-rule', lambda c: q(c, 'nw-einsprache-20').update(requirements=[r for r in q(c, 'nw-einsprache-20')['requirements'] if r['key'] != 'einspracheAdmissibility'])),
            ('future-source-replaced', lambda c: p(c, 'ow-admin-20')['normTimeline'][1]['sourceRefs'][0].update(sourceId='SRC-AP23H1-OW-STVG-20250101')),
            ('temporal-gap', lambda c: p(c, 'ow-admin-20')['normTimeline'][0]['interval'].update(to='2026-12-20')),
            ('window-broadened', lambda c: p(c, 'ow-admin-20')['temporalBinding']['calculationCoverage'].update(to='2028-12-31')),
            ('missing-endshift-guard', lambda c: p(c, 'nw-court-replik-20').update(endShiftGuard='none')),
            ('nw-winter-as-three', lambda c: p(c, 'nw-einwendung-ordered').update(suspensionProfileId='nw-three')),
    ):
        structural_negative(name, change)
    for name in ('missing-active-parent', 'wrong-projection-interpretation', 'wrong-parent-inheritance', 'wrong-addition-date', 'wrong-addition-source'):
        c, hc, cals = copy.deepcopy(catalog), load(BUNDLE / HOLIDAY), copy.deepcopy(calendars)
        binding = next(b for b in c['holidayBindings'] if b['holidayBindingId'] == 'ow-administration-seat')
        if name == 'missing-active-parent':
            binding['physicalBaseline']['references'] = [r for r in binding['physicalBaseline']['references'] if r['contentId'] != 'ap22-ow-76c151dccf1f']
        elif name == 'wrong-projection-interpretation':
            binding['projectionEvidence']['legalInterpretation'] = 'directCourtStatute'
        elif name == 'wrong-parent-inheritance':
            cals['ap23h2-ow-procedural-core']['inherits'] = ['ap22-nw-5dfca484e4af']
        elif name == 'wrong-addition-date':
            next(r for r in hc['activation']['supplementalRules'] if r['id'] == 'OW-PROCEDURAL-ALL-DAY-BERCHTOLD')['calculation']['day'] = 3
        else:
            next(r for r in hc['activation']['supplementalRules'] if r['id'] == 'OW-PROCEDURAL-ALL-DAY-BERCHTOLD')['sourceRefs'][0]['evidenceId'] = 'SRC-AP23H1-NW-VRG-20260801'
        rebind(c)
        rejected = False
        try:
            validate_calendar_bindings(c, hc, load(BASE / HOLIDAY), cals, manifest, old_manifest)
        except (AssertionError, KeyError, TypeError):
            rejected = True
        assert rejected, name
        negatives.append({'id': name, 'policyDependenciesRehashed': True, 'rejected': True})
    old_catalog_validator = Draft202012Validator(load(ROOT / 'schemas/administrative-procedure-catalog-v4.schema.json'))
    old_manifest_validator = Draft202012Validator(load(ROOT / 'schemas/release-manifest-v11.schema.json'))
    assert not old_catalog_validator.is_valid(catalog) and not old_manifest_validator.is_valid(manifest)
    negatives += [{'id': 'old-catalog4-schema-rejects-catalog5', 'formalSchemaOnly': True},
                  {'id': 'old-manifest11-schema-rejects-manifest12', 'formalSchemaOnly': True}]
    node = load(ROOT / 'outputs/ap23h2-2026-10-22/QA-AP23H2.json')
    historical = load(ROOT / 'outputs/ap23h1-2026-10-22/reference-verification.json')
    results, differences = [], []
    for case in suite['cases']:
        item = adapt(case, suite)
        result = evaluate(item, catalog, calendars, input_validator)
        for key, expected in case['expected'].items():
            if result.get(key) != expected:
                differences.append({'id': case['id'], 'kind': 'expected', 'key': key, 'expected': expected, 'actual': result.get(key)})
        counterpart = next(r['actual'] for r in node['results'] if r['id'] == case['id'])
        if result != counterpart:
            differences.append({'id': case['id'], 'kind': 'actualCandidateNodePython', 'python': result, 'node': counterpart})
        without_export = {k: v for k, v in result.items() if k != 'exportAllowed'}
        if without_export != next(r['actual'] for r in historical['results'] if r['id'] == case['id']):
            differences.append({'id': case['id'], 'kind': 'historicalH1FullResult'})
        results.append({'id': case['id'], 'inputSchemaValid': input_validator.is_valid(item), 'actual': result})
    calendar_comparisons = 0
    for canton in ('OW', 'NW'):
        ident = f'ap23h2-{canton.lower()}-procedural-core'
        for year in (2026, 2027):
            raw_dates = calendar_dates(ident, calendars, year, check_validity=False)
            legal = legal_calendar(canton, year)
            assert len(raw_dates) == 17 and len(legal) == 14
            for n in range(365):
                day = date(year, 1, 1) + n * DAY
                assert (day.weekday() >= 5 or day in raw_dates) == (day.weekday() >= 5 or day in legal)
                calendar_comparisons += 1
    for probe in suite['calendarProbes']:
        day = date.fromisoformat(probe['date'])
        actual = calendar_dates(f'ap23h2-{probe["calendar"][:2].lower()}-procedural-core', calendars, day.year)
        assert (day in actual) == probe['isHoliday']
    counts = dict(Counter(r['actual']['outcome'] for r in results))
    assert counts == {'datedResearchValue': 58, 'unresolvedBoundaryProposed': 18,
                      'qualificationBoundaryProposed': 38, 'researchWindowBoundary': 4}
    assert not differences, differences
    paths = [Path(__file__), FIXTURE, receipt_path, BASE / 'manifest.json', BASE / ADMIN, BUNDLE / 'manifest.json', BUNDLE / ADMIN,
             BUNDLE / HOLIDAY, ROOT / 'outputs/ap23h2-2026-10-22/QA-AP23H2.json'] + sorted(SCHEMAS.glob('*.json'))
    return {'workPackage': 'AP23H2', 'status': 'passedIndependentStructuralAndResearchComparison', 'checkedOn': '2026-10-22',
            'method': 'Actual candidate parameters, Python jsonschema and independent full-date enumeration with independent Easter calculation',
            'runtimeActive': False, 'productImports': False, 'productCapabilityTest': False, 'exportTest': False,
            'releaseApproval': False, 'jsonschemaVersion': importlib.metadata.version('jsonschema'),
            'referenceCases': len(results), 'referenceOutcomes': counts, 'calendarProbes': len(suite['calendarProbes']),
            'calendarEndEligibilityComparisons': calendar_comparisons, 'actualCalendarFormat3SchemaChecks': len(calendars),
            'unchangedRawArtifacts': unchanged, 'newPaths': len(EXPECTED), 'preservedPaths': len(old['paths']),
            'acceptedArchiveFilesVerified': len(receipt['artifacts']), 'negativeStructuralTests': negatives,
            'discrepancies': differences, 'results': results, 'inputs': [evidence(p) for p in paths]}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    report = run()
    if args.write:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k not in ('results', 'inputs')}, ensure_ascii=False, indent=2))
