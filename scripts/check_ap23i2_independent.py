# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23I2 byte/schema/semantic and full-date enumeration probe.

No JavaScript builder/checker or product module is imported. Node results are
read only after independently computing each result, solely for comparison.
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
BASE = ROOT / 'data/candidates/2026-10-22-ap23h3'
OUT = ROOT / 'outputs/ap23i2-candidate-2026-10-22'
BUNDLE = OUT / 'bundle'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
SUITE = ROOT / 'docs/fachrecht/ap23i1/referenzfaelle.json'
WINDOW = {'from': '2026-08-29', 'to': '2027-12-31'}
DAY = timedelta(days=1)
CALENDARS = {'GL': 'ap22-gl-87c11e156541', 'TG': 'ap22-tg-3d6514fbabb1'}


def load(path):
    return json.loads(path.read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())


def evidence(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'byteLength': len(raw), 'sha256': sha(raw)}


def equal(a, b):
    return type(a) is type(b) and a == b


def index(rows, key):
    mapped = {r[key]: r for r in rows}
    assert len(mapped) == len(rows), f'Duplicate {key}'
    return mapped


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


def period_day(expr, year):
    if expr['type'] == 'easterOffset':
        return easter(year + expr['yearOffset']) + expr['days'] * DAY
    assert expr['type'] == 'fixedMonthDay'
    return date(year + expr['yearOffset'], expr['month'], expr['day'])


def rule_day(rule, year):
    calc = rule['calculation']
    if calc['type'] == 'fixedMonthDay':
        value = date(year, calc['month'], calc['day'])
    elif calc['type'] == 'easterOffsetDays':
        value = easter(year) + calc['offsetDays'] * DAY
    else:
        assert calc['type'] == 'nthWeekdayOfMonth'
        first = date(year, calc['month'], 1)
        value = first + ((calc['isoWeekday'] - first.isoweekday()) % 7 + 7 * (calc['occurrence'] - 1)) * DAY
    if rule['condition'] == 'shiftHolyThursdayBy7Days':
        if easter(year) - 7 * DAY <= value <= easter(year) - DAY:
            value += 7 * DAY
    else:
        assert rule['condition'] == 'always'
    return value


def calendar_dates(ident, calendars, year, legal_validity=True, seen=None):
    seen = set() if seen is None else seen
    assert ident not in seen, 'Cycle'
    cal = calendars[ident]
    found = set()
    for parent in cal['inherits']:
        found |= calendar_dates(parent, calendars, year, legal_validity, seen | {ident})
    for rule in cal['rules']:
        if rule['effect']['type'] != 'holiday':
            continue
        value, span = rule_day(rule, year), rule['validity']
        if not legal_validity or span['from'] <= value.isoformat() and (span['to'] is None or value.isoformat() <= span['to']):
            found.add(value)
    return found


def named_legal_calendar(canton, year):
    """Named legal dates transcribed independently, no candidate rule read here."""
    fixed = [(1, 1), (8, 1), (12, 25), (12, 26)]
    fixed += [(11, 1)] if canton == 'GL' else [(1, 2), (5, 1)]
    found = {date(year, month, day) for month, day in fixed}
    found |= {easter(year) + offset * DAY for offset in (-2, 1, 39, 50)}
    if canton == 'GL':
        first = date(year, 4, 1)
        thursday = first + ((4 - first.isoweekday()) % 7) * DAY
        if easter(year) - 7 * DAY <= thursday < easter(year):
            thursday += 7 * DAY
        found.add(thursday)
    return found


# Independently reviewed branch inventory. These are not builder constants.
EXPECTED = {}
for prefix in ('gl-admin', 'gl-court'):
    for suffix, days, limits in (('30', 30, None), ('interim-10', 10, None),
                                 ('shortened-end', None, (2, 29)), ('shortened-interim', None, (2, 9))):
        EXPECTED[f'{prefix}-{suffix}'] = ('GL', days, limits, 'three')
        EXPECTED[f'{prefix}-{suffix}-exception'] = ('GL', days, limits, 'none')
for ident in ('gl-admin-initial-ordered', 'gl-admin-appeal-ordered', 'gl-court-ordered'):
    EXPECTED[ident] = ('GL', None, None, 'none')
for ident in ('tg-admin-ordered', 'tg-rekurs-ordered', 'tg-rr-ordered'):
    EXPECTED[ident] = ('TG', None, None, 'none')
for prefix in ('tg-rekurs', 'tg-rr'):
    EXPECTED[prefix + '-30'] = ('TG', 30, None, 'none')
    EXPECTED[prefix + '-shortened'] = ('TG', None, (5, 29), 'none')
for suffix, days, limits in (('30', 30, None), ('shortened', None, (5, 29)), ('ordered', None, None)):
    EXPECTED['tg-vg-' + suffix] = ('TG', days, limits, 'three')
    EXPECTED['tg-vg-provisional-' + suffix] = ('TG', days, limits, 'notice')
EXPECTED['tg-vg-execution-5'] = ('TG', 5, None, 'notice')
EXPECTED['tg-vg-execution-ordered'] = ('TG', None, None, 'notice')
assert len(EXPECTED) == 34


def adapt(case, suite):
    path = next((p for p in suite['paths'] if p['id'] == case['path']), suite['paths'][0])
    return {'path': case['path'].lower(), 'pathRevision': 1, 'authoritySeatCanton': path['canton'],
            'trigger': case['trigger'], 'days': case['days'],
            'facts': dict(suite['sharedSyntheticFacts'], **path['syntheticFacts']) | case.get('facts', {})}


def evaluate(item, catalog, calendars, input_validator):
    def block(reason):
        return {'outcome': 'qualificationBoundaryProposed', 'reason': reason, 'exportAllowed': False}
    out_of_window = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow', 'exportAllowed': False}
    path = next((p for p in catalog['paths'] if p['pathId'] == item.get('path')), None)
    if path is None or path['contractFamily'] != 'qualifiedDayProcedureV6':
        return block('unknownResearchPath')
    try:
        trigger = date.fromisoformat(item.get('trigger'))
    except (TypeError, ValueError):
        return block('invalidResearchDate')
    law = next(l for l in catalog['laws'] if l['lawId'] == path['lawId'])
    if item.get('pathRevision') != path['revision'] or item.get('authoritySeatCanton') != law['canton']:
        return block('pathContextMismatch')
    policy = next(q for q in catalog['qualificationPolicies'] if q['pathId'] == path['pathId'])
    facts = item.get('facts')
    allowed = {r['key'] for r in policy['requirements']}
    if type(facts) is not dict or set(facts) - allowed:
        return block('unknownResearchFact')
    for req in policy['requirements']:
        actual = facts.get(req['key'])
        values = [req['value']] if 'value' in req else req['oneOf']
        if req['key'] not in facts or not any(equal(actual, value) for value in values):
            return block(req['reason'])
    days = item.get('days')
    if type(days) is not int or days < 1:
        return block('dayDurationNotSpecified')
    duration = path['duration']
    if duration['kind'] == 'statutoryDays' and days != duration['value']:
        return block('statutoryDurationMismatch')
    if duration['kind'] != 'statutoryDays' and not duration['minimum'] <= days <= duration['maximum']:
        return block('durationOutsideQualifiedRange' if duration['kind'] == 'concretisedStatutoryDays' else 'orderedDurationOutsideTechnicalGuard')
    if not input_validator.is_valid(item):
        return block('inputContractInvalid')
    choice = path['suspensionSelection']
    if choice['kind'] == 'fixed':
        selected = choice['suspensionProfileId']
    else:
        matches = [r['suspensionProfileId'] for r in choice['cases'] if equal(facts[choice['factKey']], r['value'])]
        if len(matches) != 1:
            return block('exceptionNoticeUnresolved')
        selected = matches[0]
    profile = next(p for p in catalog['suspensionProfiles'] if p['suspensionProfileId'] == selected)
    binding = next(b for b in catalog['holidayBindings'] if b['holidayBindingId'] == path['holidayBindingId'])
    calendar = calendars[binding['physicalBaseline']['calendarId']]
    spans = [path['temporalBinding'][key] for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage')] + [calendar['validity']]
    def covered(day):
        text = day.isoformat()
        return all(s['from'] <= text and (s['to'] is None or text <= s['to']) for s in spans) and len([
            t for t in path['normTimeline'] if t['interval']['from'] <= text <= t['interval']['to']]) == 1
    def paused(day):
        return any(period_day(p['start'], year) <= day <= period_day(p['end'], year)
                   for year in (day.year - 1, day.year) for p in profile['periods'])
    if not covered(trigger):
        return out_of_window
    upper = date.fromisoformat(path['temporalBinding']['calculationCoverage']['to'])
    # Independent list enumeration, not the production counting loop.
    future = [trigger + n * DAY for n in range(1, (upper - trigger).days + 1)]
    counted = [d for d in future if not paused(d)]
    if len(counted) < days:
        return out_of_window
    nominal = counted[days - 1]
    eligible = [d for d in future if d >= nominal and d.weekday() < 5 and
                d not in calendar_dates(calendar['calendarId'], calendars, d.year)]
    if not eligible:
        return out_of_window
    end = eligible[0]
    examined = [trigger + n * DAY for n in range((end - trigger).days + 1)]
    if not all(covered(d) for d in examined):
        return out_of_window
    collision = next((nominal + n * DAY for n in range(1, (end - nominal).days + 1) if paused(nominal + n * DAY)), None)
    if collision and path['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension':
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'I1-END-SUSPENSION', 'nominalEnd': nominal.isoformat(),
                'ordinaryShiftEnd': end.isoformat(), 'firstSuspendedShiftDate': collision.isoformat(), 'exportAllowed': False}
    bindings = []
    for day in examined:
        match = next(t for t in path['normTimeline'] if t['interval']['from'] <= day.isoformat() <= t['interval']['to'])
        if match['researchBindingId'] not in bindings:
            bindings.append(match['researchBindingId'])
    return {'outcome': 'datedResearchValue', 'ordinaryStart': (trigger + DAY).isoformat(), 'firstCountedDay': counted[0].isoformat(),
            'nominalEnd': nominal.isoformat(), 'end': end.isoformat(), 'skippedDays': (nominal - trigger).days - days,
            'endShiftDays': (end - nominal).days, 'suspension': 'three' if profile['periods'] else 'none',
            'temporalBindings': bindings, 'exportAllowed': False}


def validate_structure(catalog, old, suite, calendars, manifest):
    paths, policies = index(catalog['paths'], 'pathId'), index(catalog['qualificationPolicies'], 'pathId')
    entries = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
    profiles, bindings = index(catalog['suspensionProfiles'], 'suspensionProfileId'), index(catalog['holidayBindings'], 'holidayBindingId')
    laws = index(catalog['laws'], 'lawId')
    assert (len(paths), len(policies), len(entries), len(profiles), len(bindings), len(laws)) == (113, 113, 113, 29, 21, 15)
    assert set(paths) == set(policies) == set(entries) == set(EXPECTED) | {p['pathId'] for p in old['paths']}
    assert catalog['formatVersion'] == '6.0.0' and catalog['contractStatus'] == 'proposed' and catalog['runtimeActive'] is False
    assert catalog['contractDecision'] == {'id': 'DEC-2026-038', 'status': 'proposed', 'on': None}
    assert catalog['releaseBinding']['status'] == 'candidate' and catalog['releaseBinding']['targetComponentRefs'] == []
    for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'):
        assert catalog['releaseBinding'][key] is None
    for field, key in (('paths', 'pathId'), ('qualificationPolicies', 'pathId'), ('laws', 'lawId'), ('sources', 'sourceId'),
                       ('suspensionProfiles', 'suspensionProfileId'), ('holidayBindings', 'holidayBindingId'), ('excludedPaths', 'exclusionId')):
        current = index(catalog[field], key)
        for row in old[field]:
            assert current[row[key]] == row, (field, row[key])
    for old_entry in old['releaseBinding']['pathEligibility']:
        assert entries[old_entry['pathId']] == old_entry
    stage_map = {'competentCantonalAdministrativeAuthority': 'administration', 'competentCantonalDepartmentOrGovernment': 'administrativeAppeal',
                 'cantonalAdministrativeCourt': 'court', 'administrativeFirstInstance': 'administration', 'administrativeAppeal': 'administrativeAppeal',
                 'regierungsratComplaint': 'administrativeAppeal', 'administrativeCourtComplaint': 'court'}
    for ident, (canton, days, limits, mode) in EXPECTED.items():
        p, q, entry = paths[ident], policies[ident], entries[ident]
        accepted = next(r for r in suite['paths'] if r['id'].lower() == ident)
        assert p['researchRef'] == accepted['id'] and p['contractFamily'] == q['mode'] == 'qualifiedDayProcedureV6'
        assert p['action'] == accepted['action'] and p['stages'] == [stage_map[accepted['stage']]]
        assert p['lawId'] == 'vrg-' + canton.lower() and laws[p['lawId']]['canton'] == canton
        assert p['duration'] == ({'kind': 'statutoryDays', 'value': days, 'overridable': False} if days is not None else
                                {'kind': 'concretisedStatutoryDays', 'minimum': limits[0], 'maximum': limits[1], 'overridable': False,
                                 'confirmationFact': 'shorteningEstablished' if canton == 'GL' else 'concreteShortenedDurationQualified',
                                 'legalNature': 'statutoryNotExtendable'} if limits else
                                {'kind': 'authorityOrderedDays', 'minimum': 1, 'maximum': 365, 'boundMeaning': 'technicalSafetyLimitNotLegalMaximum'})
        assert 'suspensionProfileId' not in p
        expected_selection = {'kind': 'currentFact', 'factKey': 'exceptionNotice', 'cases': [
            {'value': 'given', 'suspensionProfileId': 'tg-none'}, {'value': 'absent', 'suspensionProfileId': 'tg-three'}], 'otherwise': 'block'} if mode == 'notice' else {
            'kind': 'fixed', 'suspensionProfileId': canton.lower() + '-' + mode}
        assert p['suspensionSelection'] == expected_selection
        selected_ids = sorted(['tg-none', 'tg-three'] if mode == 'notice' else [canton.lower() + '-' + mode])
        closure = [{'suspensionProfileId': i, 'sha256': digest(profiles[i])} for i in selected_ids]
        assert entry['suspensionSelectionSha256'] == digest(p['suspensionSelection']) and entry['suspensionProfiles'] == closure
        assert 'suspensionProfileId' not in entry and 'suspensionProfileSha256' not in entry
        expected_requirements = [{key: value for key, value in r.items() if key in ('key', 'value', 'oneOf', 'reason', 'explanation')}
                                 for r in suite['sharedRequirements'] + accepted['requirements']]
        assert q['requirements'] == expected_requirements and len({r['key'] for r in q['requirements']}) == len(q['requirements'])
        for req in q['requirements']:
            assert ('value' in req) != ('oneOf' in req)
            assert all(type(v) in (str, bool, int, float) or v is None for v in ([req['value']] if 'value' in req else req['oneOf']))
        assert q['openingChainPolicy'] == q['localHolidayPolicy'] == 'notApplicable'
        assert q['pathSha256'] == entry['pathSha256'] == digest(p) and entry['qualificationPolicySha256'] == digest(q)
        assert entry['holidayBindingSha256'] == digest(bindings[p['holidayBindingId']])
        assert entry['targetComponentRefs'] == [] and entry['sourceReviewRef'] is None and entry['referenceSuiteRef'] is None
        for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage'):
            assert p['temporalBinding'][key] == WINDOW
        assert [(t['researchBindingId'], t['interval']) for t in p['normTimeline']] == [(t['id'], {'from': t['from'], 'to': t['to']}) for t in suite['temporalBindings'][canton]]
        assert p['endShiftGuard'] == ('none' if mode == 'none' else 'blockWhenEnteringApplicableSuspension')
    # Explicitly named statute versions and actual judgment metadata, not search metadata.
    sources = index(catalog['sources'], 'sourceId')
    for suffix, domain, version in (('GL-VRG-20230101', 'gesetze.gl.ch', 2395), ('GL-GOG-20220701', 'gesetze.gl.ch', 2280),
                                    ('GL-RTG-20190701', 'gesetze.gl.ch', 2110), ('GL-FAHRT-18350524', 'gesetze.gl.ch', 687),
                                    ('TG-VRG-20240601', 'www.rechtsbuch.tg.ch', 2774), ('TG-RTG-20260101', 'www.rechtsbuch.tg.ch', 2949),
                                    ('TG-VEU-20260328', 'www.rechtsbuch.tg.ch', 3034)):
        row = sources['SRC-AP23I1-' + suffix]
        assert row['url'] == f'https://{domain}/api/de/versions/{version}/pdf_file' and f'Version {version}' in row['versionDescription']
        assert row['kind'] == 'statute'
    assert sources['JUD-AP23I1-TG-TVR2003-45']['versionDescription'] == '2003-01-14 / RegierungsratTG'
    assert sources['JUD-AP23I1-TG-TVR2013-15']['versionDescription'] == '2012-12-19 / VerwaltungsgerichtTG / VG.2012.136/E'
    assert sources['JUD-AP23I1-TG-TVR2020-7']['versionDescription'] == '2020-10-28 / VerwaltungsgerichtTG / VG.2020.94/E'
    assert len(sources) == len(old['sources']) + 11
    for ident in ('gl-none', 'gl-three', 'tg-none', 'tg-three'):
        profile = profiles[ident]
        assert profile['lawId'] == 'vrg-' + ident[:2]
        assert len(profile['periods']) == (3 if ident.endswith('three') else 0)
        assert '§ 27' not in profile['sourceRefs'][0]['locator']
        if profile['periods']:
            assert [(period_day(r['start'], 2026).isoformat(), period_day(r['end'], 2026).isoformat()) for r in profile['periods']] == [
                ('2026-03-29', '2026-04-12'), ('2026-07-15', '2026-08-15'), ('2026-12-18', '2027-01-02')]
    descriptors = index(manifest['artifacts'], 'contentId')
    for canton in ('GL', 'TG'):
        for court in (False, True):
            binding = bindings[canton.lower() + ('-court-seat' if court else '-administration-seat')]
            assert binding['lawId'] == 'vrg-' + canton.lower() and binding['bindingVersion'] == '6.0.0'
            assert binding['anchor'] == ('courtSeat' if court else 'authoritySeat') and binding['authorityLevel'] == 'cantonal'
            assert binding['physicalBaseline']['calendarId'] == CALENDARS[canton]
            assert {r['contentId'] for r in binding['physicalBaseline']['references']} == {CALENDARS[canton], 'ch-federal-calendar', 'ch-holiday-catalog'}
            for ref in binding['physicalBaseline']['references']:
                a = descriptors[ref['contentId']]
                assert ref == {key: a[key] for key in ('role', 'contentId', 'sha256', 'path')}
            reuse = binding['physicalReuse']
            assert reuse['permissionInheritance'] == 'none' and reuse['notDerivedFrom'] == 'notApplicable' and binding['practiceAddition'] is None
            assert reuse['selectedRuleIds'] == [r['ruleId'] for r in calendars[CALENDARS[canton]]['rules']]
            assert not binding['legalBinding']['roleUnion'] and not binding['legalBinding']['partyOrRepresentativeRequired']


def run():
    suite, manifest, old_manifest = load(SUITE), load(BUNDLE / 'manifest.json'), load(BASE / 'manifest.json')
    catalog, old = load(BUNDLE / ADMIN), load(BASE / ADMIN)
    assert sha((BASE / 'manifest.json').read_bytes()) == '14f60a83ed2f13e3f176f303e444ea43a606bae6980033e3d875093c63a5d429'
    assert sha(SUITE.read_bytes()) == '5ac2b60af93ee9ee329b75484356c3442c6a93baf20ac26e4971c208d5d298c8'
    schema_paths = sorted((ROOT / 'schemas/candidates/ap23i2').glob('*.json'))
    schemas = {p.name: load(p) for p in schema_paths}
    registry = Registry().with_resources((s['$id'], Resource.from_contents(s)) for s in schemas.values())
    validators = {name: Draft202012Validator(s, registry=registry, format_checker=FormatChecker()) for name, s in schemas.items()}
    for schema in schemas.values():
        Draft202012Validator.check_schema(schema)
    validators['administrative-procedure-catalog-v6.schema.json'].validate(catalog)
    validators['local-reference-manifest-v13.schema.json'].validate(manifest)
    assert not validators['release-manifest-v13.schema.json'].is_valid(manifest)
    input_validator = validators['administrative-input-v6.schema.json']
    unchanged, files, calendars = 0, {}, {}
    assert len(manifest['artifacts']) == 44 and len(manifest['calendarIds']) == 35
    assert manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '13.0.0'
    assert manifest['releaseStatus'] == 'candidate' and manifest['sourceSummary']['legalBasisReviewStatus'] == 'pending'
    ext = manifest['extensions']['steimer.local-reference']
    assert ext['structuralContractProbeOnly'] is True and ext['contractDecisionStatus'] == 'proposed'
    assert all(ext[k] is False for k in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'))
    for a in manifest['artifacts']:
        raw = (BUNDLE / a['path']).read_bytes()
        assert len(raw) == a['byteLength'] and sha(raw) == a['sha256']
        files[a['path']] = json.loads(raw)
        if a['path'] != ADMIN:
            assert raw == (BASE / a['path']).read_bytes()
            unchanged += 1
        if a['role'] == 'calendar':
            calendars[a['contentId']] = json.loads(raw)
    assert unchanged == 43 and len(calendars) == 35
    assert manifest['calendarIds'] == old_manifest['calendarIds']
    validate_structure(catalog, old, suite, calendars, manifest)
    receipt_path = ROOT / 'outputs/ap23i1-abnahme-2026-10-22/receipt.json'
    assert sha(receipt_path.read_bytes()) == '36580dd3e7c8b02b482edccc7781fe51bfbebf2d2b0fcf4f7d37317ca5397af6'
    receipt = load(receipt_path)
    assert receipt['professionalAcceptance'] is True and receipt['formatDecision'] is False and receipt['i2Started'] is True
    for entry in receipt['artifacts']:
        raw = (receipt_path.parent / entry['path']).read_bytes()
        assert sha(raw) == entry['sha256'] and len(raw) == entry['byteLength']
    results = []
    for case in suite['cases']:
        item = adapt(case, suite)
        actual = evaluate(item, catalog, calendars, input_validator)
        for key, expected in case['expected'].items():
            assert equal(actual.get(key), expected), (case['id'], key, actual, expected)
        results.append({'id': case['id'], 'actual': actual})
    # Only now compare with JS and historical research evidence.
    node, peer = load(OUT / 'QA-AP23I2.json'), load(ROOT / 'outputs/ap23i1-2026-10-22/reference-verification.json')
    for row in results:
        assert row['actual'] == next(r['actual'] for r in node['results'] if r['id'] == row['id'])
        assert {k: v for k, v in row['actual'].items() if k != 'exportAllowed'} == next(r['actual'] for r in peer['results'] if r['id'] == row['id'])
    comparisons = 0
    for canton in ('GL', 'TG'):
        for year in (2026, 2027):
            raw_dates, legal_dates = calendar_dates(CALENDARS[canton], calendars, year, False), named_legal_calendar(canton, year)
            for n in range(365):
                day = date(year, 1, 1) + n * DAY
                assert (day.weekday() >= 5 or day in raw_dates) == (day.weekday() >= 5 or day in legal_dates), (canton, day)
                comparisons += 1
    for probe in suite['calendarProbes']:
        day = date.fromisoformat(probe['date'])
        assert (day in calendar_dates(CALENDARS[probe['calendar'][:2]], calendars, day.year, False)) == probe['isHoliday']
    negatives = []
    def rebind(c):
        pp, qq, ee = index(c['paths'], 'pathId'), index(c['qualificationPolicies'], 'pathId'), index(c['releaseBinding']['pathEligibility'], 'pathId')
        bb, ss = index(c['holidayBindings'], 'holidayBindingId'), index(c['suspensionProfiles'], 'suspensionProfileId')
        for ident in EXPECTED:
            path, policy, entry = pp[ident], qq[ident], ee[ident]
            policy['pathSha256'] = digest(path)
            entry.update(pathSha256=digest(path), qualificationPolicySha256=digest(policy), holidayBindingSha256=digest(bb[path['holidayBindingId']]),
                         suspensionSelectionSha256=digest(path['suspensionSelection']))
            ids = [path['suspensionSelection']['suspensionProfileId']] if path['suspensionSelection']['kind'] == 'fixed' else [r['suspensionProfileId'] for r in path['suspensionSelection']['cases']]
            entry['suspensionProfiles'] = [{'suspensionProfileId': i, 'sha256': digest(ss[i])} for i in sorted(set(ids))]
    def negative(name, change):
        c = copy.deepcopy(catalog)
        change(c)
        rebind(c)
        rejected = False
        try:
            validate_structure(c, old, suite, calendars, manifest)
        except (AssertionError, KeyError, TypeError):
            rejected = True
        assert rejected, name
        negatives.append({'id': name, 'rehashed': True, 'rejected': True})
    def p(c, ident):
        return next(p for p in c['paths'] if p['pathId'] == ident)
    def q(c, ident):
        return next(q for q in c['qualificationPolicies'] if q['pathId'] == ident)
    for name, change in (
        ('old-path-drift', lambda c: p(c, 'ar-execution-5')['duration'].update(value=6)),
        ('fixed-two-invented', lambda c: p(c, 'gl-admin-shortened-end').update(duration={'kind': 'statutoryDays', 'value': 2, 'overridable': False})),
        ('shortened-minimum', lambda c: p(c, 'tg-rekurs-shortened')['duration'].update(minimum=2)),
        ('shortened-extendable', lambda c: p(c, 'gl-court-shortened-end')['duration'].update(legalNature='authorityExtendable')),
        ('wrong-stage', lambda c: p(c, 'tg-rr-30').update(stages=['court'])),
        ('old-20day-import', lambda c: p(c, 'tg-rr-30')['duration'].update(value=20)),
        ('gl-ordered-pause', lambda c: p(c, 'gl-court-ordered')['suspensionSelection'].update(suspensionProfileId='gl-three')),
        ('notice-unconditional-free', lambda c: p(c, 'tg-vg-execution-5').update(suspensionSelection={'kind': 'fixed', 'suspensionProfileId': 'tg-none'})),
        ('notice-swapped', lambda c: p(c, 'tg-vg-execution-5')['suspensionSelection']['cases'].reverse()),
        ('oneof-first-only', lambda c: q(c, 'tg-rr-30')['requirements'][next(i for i, r in enumerate(q(c, 'tg-rr-30')['requirements']) if r['key'] == 'regierungsratCompetenceBasis')]['oneOf'].pop()),
        ('current-fact-removed', lambda c: q(c, 'gl-admin-30').update(requirements=[r for r in q(c, 'gl-admin-30')['requirements'] if r['key'] != 'newLawApplies'])),
        ('wrong-judgment-metadata', lambda c: next(s for s in c['sources'] if s['sourceId'] == 'JUD-AP23I1-TG-TVR2003-45').update(versionDescription='2003-01-14 / Obergericht')),
        ('endguard-removed', lambda c: p(c, 'tg-vg-30').update(endShiftGuard='none')),
        ('window-extended', lambda c: p(c, 'gl-admin-30')['temporalBinding']['calculationCoverage'].update(to='2028-12-31')),
    ):
        negative(name, change)
    input_negative_count = 0
    for accepted in suite['paths']:
        case = next(r for r in suite['cases'] if r['path'] == accepted['id'] and r['expected']['outcome'] == 'datedResearchValue')
        positive = adapt(case, suite)
        policy = next(q for q in catalog['qualificationPolicies'] if q['pathId'] == positive['path'])
        for req in policy['requirements']:
            item = copy.deepcopy(positive)
            item['facts'].pop(req['key'], None)
            assert evaluate(item, catalog, calendars, input_validator)['outcome'] == 'qualificationBoundaryProposed'
            input_negative_count += 1
    missing_fact_count = input_negative_count
    for ident, key, value in (('TG-VG-30', 'exceptionNotice', 'incomplete'), ('GL-ADMIN-30', 'regierungsratCompetenceBasis', 'vrg55Abs1Nr8Qualified')):
        case = next(r for r in suite['cases'] if r['path'] == ident and r['expected']['outcome'] == 'datedResearchValue')
        item = adapt(case, suite)
        item['facts'][key] = value
        assert evaluate(item, catalog, calendars, input_validator)['outcome'] == 'qualificationBoundaryProposed'
        input_negative_count += 1
    positive = adapt(next(r for r in suite['cases'] if r['id'] == 'TG-VG-30-BASIC'), suite)
    for key, value in (('pathRevision', 2), ('authoritySeatCanton', 'GL')):
        item = copy.deepcopy(positive)
        item[key] = value
        assert evaluate(item, catalog, calendars, input_validator)['reason'] == 'pathContextMismatch'
        input_negative_count += 1
    counts = dict(Counter(r['actual']['outcome'] for r in results))
    assert counts == {'datedResearchValue': 110, 'unresolvedBoundaryProposed': 16, 'qualificationBoundaryProposed': 117, 'researchWindowBoundary': 6}
    return {'workPackage': 'AP23I2', 'status': 'passedIndependentStructuralAndResearchComparison', 'checkedOn': '2026-10-22',
            'method': 'Actual bytes, Python jsonschema, independently transcribed duration/pause inventory and independent full-date list enumeration',
            'runtimeActive': False, 'productImports': False, 'releaseApproval': False, 'calendarExportEnabled': False,
            'jsonschemaVersion': importlib.metadata.version('jsonschema'), 'referenceCases': len(results), 'referenceOutcomes': counts,
            'unchangedRawArtifacts': unchanged, 'newPaths': 34, 'preservedPaths': 79, 'calendarEndEligibilityComparisons': comparisons,
            'calendarProbes': len(suite['calendarProbes']), 'acceptedArchiveFilesVerified': len(receipt['artifacts']),
            'negativeStructuralTests': negatives, 'missingCurrentFactNegatives': missing_fact_count,
            'foreignKnownFactNegatives': 2, 'wrongContextNegatives': 2, 'negativeInputChecks': input_negative_count,
            'discrepancies': [], 'results': results,
            'inputs': [evidence(p) for p in [Path(__file__), SUITE, receipt_path, BASE / 'manifest.json', BASE / ADMIN,
                       BUNDLE / 'manifest.json', BUNDLE / ADMIN, OUT / 'QA-AP23I2.json', *schema_paths]]}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    report = run()
    if args.write:
        (OUT / 'QA-AP23I2-INDEPENDENT.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key not in ('results', 'inputs')}, ensure_ascii=False, indent=2))
