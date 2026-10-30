# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23J2 candidate-byte and complete-date enumeration probe.

No JavaScript builder/checker or product module is imported. Node results are
consulted only after an independent result has been computed for comparison.
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

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'data/candidates/2026-10-22-ap23i3'
OUT = ROOT / 'outputs/ap23j2-candidate-2026-10-27'
BUNDLE = OUT / 'bundle'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
SUITE = ROOT / 'docs/fachrecht/ap23j1/referenzfaelle.json'
WINDOW = {'from': '2026-08-29', 'to': '2027-12-31'}
GUARD = ROOT / 'outputs/ap23j2-2026-10-27/protected-inputs.json'
GUARD_SHA = '1d65ba6006db51cea44198a52cb61def7830b67887e6f502aa8445a3f0cb6b17'
DAY = timedelta(days=1)
SCHEMAS = {name: ROOT / ('schemas/candidates/ap23j2/' + file) for name, file in {
    'catalog': 'administrative-procedure-catalog-v7.schema.json',
    'manifest': 'release-manifest-v14.schema.json',
    'localManifest': 'local-reference-manifest-v14.schema.json',
    'input': 'administrative-input-v7.schema.json'}.items()}
STAGES = {
    'cantonalAdministrationOrNonTribunalCantonalRemedy': ['administration', 'administrativeAppeal'],
    'nonTribunalCantonalAdministrativeRemedy': ['administrativeAppeal'],
    'nonTribunalCantonalReclamation': ['administrativeAppeal'], 'tribunalCantonal': ['court'],
    'tribunalCantonalJudgmentReasonsRequest': ['court'], 'tribunalCantonalCostsReclamation': ['court'],
    'initialAdministration': ['administration'], 'reclamation': ['administrativeAppeal'],
    'costsReclamation': ['administrativeAppeal', 'court'], 'administrativeAppeal': ['administrativeAppeal', 'court'],
    'administrativeFirstInstance': ['administration'], 'opposition': ['administrativeAppeal'],
    'oppositionProvisional': ['administrativeAppeal'], 'administrativeReview': ['administrativeAppeal', 'court'],
    'administrativeReviewProvisional': ['administrativeAppeal', 'court'],
    'oppositionOrAdministrativeReview': ['administrativeAppeal', 'court'],
    'oppositionOrAdministrativeReviewProvisional': ['administrativeAppeal', 'court']}
CALENDARS = {'FR': 'ap22-fr-7d8c38f7c610', 'GE': 'ap22-ge-a36ff7926d08', 'JU': 'ap22-ju-b096c09f506c'}
LAWS = {'FR': 'cpja-fr', 'GE': 'lpa-ge', 'JU': 'cpa-ju'}
FIXTURE_ANNOTATIONS = {
    'JU-J1-R11': ('JU-REVIEW-ORDERED', {'actualReviewTarget': 'GouvernementUnder172'}, {}),
    'JU-J1-R13': ('JU-CONFIRMATION-REQUEST5-INITIAL', {'qualifiedLegalOpening': True, 'triggerKind': 'actualLawfulOralOpening'}, {}),
    'JU-J1-R14': ('JU-CONFIRMATION-REQUEST5-REVIEW', {'qualifiedLegalOpening': True, 'triggerKind': 'actualLawfulOralOpening'}, {}),
    'JU-J1-R15': ('JU-CONFIRMATION-REQUEST5-PROVISIONAL', {'qualifiedLegalOpening': True, 'triggerKind': 'actualLawfulOralOpening'}, {}),
    'JU-J1-R22': ('JU-REVIEW-FINAL30', {'actualReviewTarget': 'unqualifiedSpecialCommission'}, {'reviewTargetQualified': False})}


def load(path):
    return json.loads(path.read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())


def evidence(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'byteLength': len(raw), 'sha256': sha(raw)}


def same(a, b):
    return type(a) is type(b) and a == b


def index(rows, key):
    mapped = {row[key]: row for row in rows}
    assert len(mapped) == len(rows), 'Duplicate ' + key
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
        assert calc['type'] in ('nthWeekdayOfMonth', 'nthWeekdayOffsetDays')
        first = date(year, calc['month'], 1)
        value = first + ((calc['isoWeekday'] - first.isoweekday()) % 7 + 7 * (calc['occurrence'] - 1)) * DAY
        if calc['type'] == 'nthWeekdayOffsetDays':
            value += calc['offsetDays'] * DAY
    condition = rule.get('condition', 'always')
    if condition == 'unlessTuesdayOrSaturday' and value.isoweekday() in (2, 6):
        return None
    if condition == 'onlyMonday' and value.isoweekday() != 1:
        return None
    if condition == 'shiftHolyThursdayBy7Days' and easter(year) - 7 * DAY <= value < easter(year):
        value += 7 * DAY
    assert condition in ('always', 'unlessTuesdayOrSaturday', 'onlyMonday', 'shiftHolyThursdayBy7Days')
    return value


def inside(day, span):
    text = day.isoformat() if isinstance(day, date) else day
    return span['from'] <= text and (span['to'] is None or text <= span['to'])


def calendar_dates(ident, calendars, year, legal_validity=True, seen=None):
    seen = set() if seen is None else set(seen)
    assert ident not in seen, 'Cyclic physical calendar'
    seen.add(ident)
    cal = calendars[ident]
    result = set()
    for rule in cal['rules']:
        if rule.get('effect', {}).get('type') != 'holiday':
            continue
        day = rule_day(rule, year)
        if day and (not legal_validity or inside(day, cal['validity']) and inside(day, rule['validity'])):
            result.add(day)
    for parent in cal['inherits']:
        result.update(calendar_dates(parent, calendars, year, legal_validity, seen))
    return result


def research_provenance(case):
    original = copy.deepcopy(case.get('facts', {}))
    current, annotations = copy.deepcopy(original), {}
    if case['id'] in FIXTURE_ANNOTATIONS:
        path, metadata, negative = FIXTURE_ANNOTATIONS[case['id']]
        assert case['path'] == path
        for key, value in metadata.items():
            assert same(current.get(key), value), 'Exact fixture annotation ' + case['id'] + '/' + key
            annotations[key] = current.pop(key)
        for key, value in negative.items():
            assert same(current.get(key), value), 'Negative qualification preserved ' + case['id'] + '/' + key
    return {'originalOverrides': original, 'annotations': annotations, 'currentOverrides': current}


def adapt(case, suite):
    path = next((p for p in suite['paths'] if p['id'] == case['path']), suite['paths'][0])
    allowed = {row['key'] for row in suite['sharedRequirements'] + path['requirements']}
    baseline = dict(suite['sharedSyntheticFacts'], **path['syntheticFacts'])
    selected = {key: value for key, value in baseline.items() if key in allowed}
    return {'path': case['path'].lower(), 'pathRevision': 1, 'authoritySeatCanton': path['canton'],
            'trigger': case['trigger'], 'days': case['days'], 'facts': selected | research_provenance(case)['currentOverrides']}


def evaluate(item, catalog, calendars, input_validator, manifest_coverage=WINDOW):
    def block(reason):
        return {'outcome': 'qualificationBoundaryProposed', 'reason': reason, 'exportAllowed': False}
    outside = {'outcome': 'researchWindowBoundary', 'reason': 'outsideReferenceWindow', 'exportAllowed': False}
    p = next((p for p in catalog['paths'] if p['pathId'] == item.get('path')), None)
    q = next((q for q in catalog['qualificationPolicies'] if q['pathId'] == item.get('path')), None)
    if p is None or p['contractFamily'] != 'qualifiedDayProcedureV7' or q is None or q['mode'] != 'qualifiedDayProcedureV7':
        return block('unknownResearchPath')
    try:
        trigger = date.fromisoformat(item.get('trigger'))
        assert trigger.isoformat() == item['trigger']
    except (ValueError, TypeError, AssertionError):
        return block('invalidResearchDate')
    law = next(law for law in catalog['laws'] if law['lawId'] == p['lawId'])
    if item.get('pathRevision') != p['revision'] or item.get('authoritySeatCanton') != law['canton']:
        return block('pathContextMismatch')
    facts = item.get('facts')
    allowed = {row['key'] for row in q['requirements']}
    if type(facts) is not dict or set(facts) - allowed:
        return block('unknownResearchFact')
    for req in q['requirements']:
        values = [req['value']] if 'value' in req else req['oneOf']
        if req['key'] not in facts or not any(same(facts[req['key']], value) for value in values):
            return block(req['reason'])
    days = item.get('days')
    if type(days) is not int or days < 1 or days > 9007199254740991:
        return block('dayDurationNotSpecified')
    duration = p['duration']
    if duration['kind'] == 'statutoryDays' and days != duration['value']:
        return block('statutoryDurationMismatch')
    if duration['kind'] == 'authorityOrderedDays' and not duration['minimum'] <= days <= duration['maximum']:
        return block('orderedDurationOutsideTechnicalGuard')
    if not input_validator.is_valid(item):
        return block('inputContractInvalid')
    entry = next((row for row in catalog['releaseBinding']['pathEligibility']
                  if row['pathId'] == p['pathId'] and row['pathRevision'] == p['revision']), None)
    binding = next((row for row in catalog['holidayBindings'] if row['holidayBindingId'] == p['holidayBindingId']), None)
    if entry is None or entry['status'] != 'candidate' or entry['pathSha256'] != digest(p) or entry['qualificationPolicySha256'] != digest(q) \
            or entry['openingPolicySha256'] != digest(p['openingPolicy']) or entry['holidayBindingId'] != p['holidayBindingId'] \
            or entry['holidayBindingSha256'] != digest(binding):
        return block('proposalEligibilityInvalid')
    if p['qualification']['delivery'] != 'qualifiedTriggerAccordingToOpeningPolicy' or q['openingChainPolicy'] != 'notApplicable':
        return block('openingContractInvalid')
    choice = p['suspensionSelection']
    if choice['kind'] != 'fixed' or entry['suspensionSelectionSha256'] != digest(choice):
        return block('suspensionSelectionInvalid')
    profile = next((row for row in catalog['suspensionProfiles'] if row['suspensionProfileId'] == choice['suspensionProfileId']), None)
    if profile is None or profile['lawId'] != p['lawId'] or entry['suspensionProfiles'] != [
            {'suspensionProfileId': profile['suspensionProfileId'], 'sha256': digest(profile)}]:
        return block('suspensionSelectionInvalid')
    if binding is None or binding['lawId'] != p['lawId'] or binding['authoritySeatCanton'] != item['authoritySeatCanton']:
        return block('calendarBindingInvalid')
    dependencies = []
    def collect(ident, visiting):
        assert ident not in visiting
        if any(row['calendarId'] == ident for row in dependencies):
            return
        cal = calendars[ident]
        dependencies.append(cal)
        for parent in cal['inherits']:
            collect(parent, visiting | {ident})
    collect(binding['physicalBaseline']['calendarId'], set())
    spans = [manifest_coverage] + [p['temporalBinding'][key] for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage')] \
        + [entry['caseCoverage'], entry['calculationCoverage']] + [row['validity'] for row in dependencies]
    temporal, opening_segments = [], []
    def bind(day, opening_phase=False):
        choices = [row for row in p['normTimeline'] if inside(day, row['interval'])]
        if not all(inside(day, span) for span in spans) or len(choices) != 1:
            return False
        segment = choices[0]
        if segment['researchBindingId'] not in temporal:
            temporal.append(segment['researchBindingId'])
        if opening_phase and segment not in opening_segments:
            opening_segments.append(segment)
        return True
    if not bind(trigger, True):
        return outside
    upper_text = min(span['to'] for span in spans if span['to'] is not None)
    upper = date.fromisoformat(upper_text)
    future = [trigger + n * DAY for n in range((upper - trigger).days + 1)]
    cache = {}
    def holiday(day):
        if day.year not in cache:
            cache[day.year] = calendar_dates(binding['physicalBaseline']['calendarId'], calendars, day.year)
        return day in cache[day.year]
    def paused(day):
        return any(period_day(period['start'], year) <= day <= period_day(period['end'], year)
                   for year in (day.year - 1, day.year) for period in profile['periods'])
    opening = trigger
    op = p['openingPolicy']
    if op['kind'] == 'qualifiedCurrentTrigger':
        if op['transformation'] != 'none':
            return block('openingContractInvalid')
    elif op['kind'] == 'geQualifiedOrOrdinaryPost':
        if item['authoritySeatCanton'] != 'GE' or op['factKey'] != 'openingMode' or op['otherwise'] != 'block' \
                or op['holidayBinding'] != 'sameAsPath' or op['ordinaryPostTransformation'] != 'nextWorkingDayIfNonWorkingReceipt' \
                or op['allowedModes'] != ['qualifiedLegalOpening', 'ordinaryPostPhysicalReceipt']:
            return block('openingContractInvalid')
        if facts.get('openingMode') not in op['allowedModes']:
            return block('openingModeUnqualified')
        if facts['openingMode'] == 'ordinaryPostPhysicalReceipt':
            opening = next((day for day in future if day.weekday() < 5 and not holiday(day)), None)
            if opening is None:
                return outside
    else:
        return block('openingContractInvalid')
    opening_days = [trigger + n * DAY for n in range((opening - trigger).days + 1)]
    if not all(bind(day, True) for day in opening_days):
        return outside
    mode = facts['openingMode'] if op['kind'] == 'geQualifiedOrOrdinaryPost' else None
    meaning = 'qualifiedCurrentTriggerDate' if mode is None else (
        'physicalOrdinaryPostReceiptDate' if mode == 'ordinaryPostPhysicalReceipt' else 'qualifiedLegalOpeningDate')
    resolution = {'policyKind': op['kind'], 'openingPolicySha256': digest(op), 'inputMode': mode, 'inputMeaning': meaning,
                  'inputDate': trigger.isoformat(), 'qualifiedOpeningDate': opening.isoformat(),
                  'openingShiftDates': [day.isoformat() for day in opening_days[1:]],
                  'triggerKind': op['triggerKind'] if op['kind'] == 'qualifiedCurrentTrigger' else None,
                  'evaluatedNormSegments': copy.deepcopy(opening_segments), 'sourceRefs': copy.deepcopy(op['sourceRefs']), 'exportAllowed': False}
    eligible_count = [day for day in future if day > opening and not paused(day)]
    if len(eligible_count) < days:
        return outside
    nominal = eligible_count[days - 1]
    end = next((day for day in future if day >= nominal and day.weekday() < 5 and not holiday(day)), None)
    if end is None:
        return outside
    if not all(bind(day) for day in future if opening < day <= end):
        return outside
    collision = next((day for day in future if nominal < day <= end and paused(day)), None)
    if collision and p['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension':
        return {'outcome': 'unresolvedBoundaryProposed', 'reason': 'J1-END-SUSPENSION', 'legalOpening': opening.isoformat(),
                'nominalEnd': nominal.isoformat(), 'ordinaryShiftEnd': end.isoformat(), 'firstSuspendedShiftDate': collision.isoformat(),
                'openingResolution': resolution, 'exportAllowed': False}
    return {'outcome': 'datedResearchValue', 'legalOpening': opening.isoformat(), 'ordinaryStart': (opening + DAY).isoformat(),
            'firstCountedDay': eligible_count[0].isoformat(), 'nominalEnd': nominal.isoformat(), 'end': end.isoformat(),
            'openingShiftDays': (opening - trigger).days, 'skippedDays': (nominal - opening).days - days,
            'endShiftDays': (end - nominal).days, 'suspension': {0: 'none', 2: 'two', 3: 'three'}[len(profile['periods'])],
            'temporalBindings': temporal, 'openingResolution': resolution, 'exportAllowed': False}


def expected_trigger(path):
    ident = path['id']
    return 'qualifiedExtensionRefusalAfterExpiredDeadline' if 'NACHFRIST-3' in ident else (
        'qualifiedTcDispositifOpening' if ident == 'FR-TC-BEGRUENDUNG-30' else (
            'qualifiedOralDecisionOpening' if ident.startswith('JU-CONFIRMATION-REQUEST5-') else (
                'qualifiedFullyFavourableAbbreviatedOpening' if ident.startswith('JU-MOTIVATION-REQUEST30-') else 'qualifiedWrittenOpening')))


def project_requirement(row):
    return {key: value for key, value in row.items() if key in ('key', 'value', 'oneOf', 'reason', 'explanation')}


def validate_structure(catalog, old, suite, calendars, manifest):
    paths, policies = index(catalog['paths'], 'pathId'), index(catalog['qualificationPolicies'], 'pathId')
    entries = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
    profiles, bindings = index(catalog['suspensionProfiles'], 'suspensionProfileId'), index(catalog['holidayBindings'], 'holidayBindingId')
    laws, sources = index(catalog['laws'], 'lawId'), index(catalog['sources'], 'sourceId')
    assert (len(paths), len(policies), len(entries), len(laws), len(profiles), len(bindings), len(sources)) == (149, 149, 149, 18, 35, 27, 85)
    assert set(paths) == set(policies) == set(entries) == {p['id'].lower() for p in suite['paths']} | {p['pathId'] for p in old['paths']}
    assert catalog['formatVersion'] == '7.0.0' and catalog['contractStatus'] == 'proposed' and catalog['runtimeActive'] is False
    assert catalog['contractDecision'] == {'id': 'DEC-2026-039', 'status': 'proposed', 'on': None}
    assert catalog['releaseBinding']['status'] == 'candidate' and catalog['releaseBinding']['targetComponentRefs'] == []
    for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'):
        assert catalog['releaseBinding'][key] is None
    for field, key in (('paths', 'pathId'), ('qualificationPolicies', 'pathId'), ('laws', 'lawId'), ('sources', 'sourceId'),
                       ('suspensionProfiles', 'suspensionProfileId'), ('holidayBindings', 'holidayBindingId'), ('excludedPaths', 'exclusionId')):
        current = index(catalog[field], key)
        for row in old[field]:
            assert current[row[key]] == row, (field, row[key])
    for row in old['releaseBinding']['pathEligibility']:
        assert entries[row['pathId']] == row
    for research in suite['paths']:
        p, q, entry = paths[research['id'].lower()], policies[research['id'].lower()], entries[research['id'].lower()]
        assert p['researchRef'] == research['id'] and p['contractFamily'] == q['mode'] == 'qualifiedDayProcedureV7'
        assert p['action'] == research['action'] and p['stages'] == STAGES[research['stage']]
        assert p['lawId'] == LAWS[research['canton']] and laws[p['lawId']]['canton'] == research['canton']
        assert p['qualification']['delivery'] == 'qualifiedTriggerAccordingToOpeningPolicy'
        assert p['duration'] == ({'kind': 'statutoryDays', 'value': research['days'], 'overridable': False} if research['days'] is not None else
                                 {'kind': 'authorityOrderedDays', 'minimum': 1, 'maximum': 365, 'boundMeaning': 'technicalSafetyLimitNotLegalMaximum'})
        selected_id = research['canton'].lower() + '-' + research['suspension']
        assert p['suspensionSelection'] == {'kind': 'fixed', 'suspensionProfileId': selected_id}
        assert 'suspensionProfileId' not in p
        profile = profiles[selected_id]
        assert profile['lawId'] == p['lawId']
        assert len(profile['periods']) == {'none': 0, 'two': 2, 'three': 3}[research['suspension']]
        expected_periods = [('easter', {'type': 'easterOffset', 'days': -7, 'yearOffset': 0}, {'type': 'easterOffset', 'days': 7, 'yearOffset': 0}),
                            ('summer', {'type': 'fixedMonthDay', 'month': 7, 'day': 15, 'yearOffset': 0}, {'type': 'fixedMonthDay', 'month': 8, 'day': 15, 'yearOffset': 0}),
                            ('winter', {'type': 'fixedMonthDay', 'month': 12, 'day': 18, 'yearOffset': 0}, {'type': 'fixedMonthDay', 'month': 1, 'day': 2, 'yearOffset': 1})]
        if research['suspension'] == 'none':
            expected_periods = []
        elif research['suspension'] == 'two':
            expected_periods = [expected_periods[0], expected_periods[2]]
        assert [(r['start'], r['end'], r['inclusive']) for r in profile['periods']] == [(a, b, True) for _, a, b in expected_periods]
        assert q['requirements'] == [project_requirement(row) for row in suite['sharedRequirements'] + research['requirements']]
        assert len({row['key'] for row in q['requirements']}) == len(q['requirements'])
        assert q['openingChainPolicy'] == q['localHolidayPolicy'] == 'notApplicable'
        op = p['openingPolicy']
        assert op['sourceRefs'] and all(ref['sourceId'] in sources and ref['locator'].strip() for ref in op['sourceRefs'])
        if research['canton'] == 'GE':
            assert {key: value for key, value in op.items() if key != 'sourceRefs'} == {
                'kind': 'geQualifiedOrOrdinaryPost', 'factKey': 'openingMode',
                'allowedModes': ['qualifiedLegalOpening', 'ordinaryPostPhysicalReceipt'],
                'ordinaryPostTransformation': 'nextWorkingDayIfNonWorkingReceipt', 'holidayBinding': 'sameAsPath', 'otherwise': 'block'}
            mode_req = next(r for r in q['requirements'] if r['key'] == 'openingMode')
            assert mode_req['oneOf'] == op['allowedModes']
            assert {r['sourceId'] for r in op['sourceRefs']} == {'SRC-J1-GE-LPA-20250601', 'SRC-J1-GE-LJF-19910101'}
        else:
            assert {key: value for key, value in op.items() if key != 'sourceRefs'} == {
                'kind': 'qualifiedCurrentTrigger', 'triggerKind': expected_trigger(research), 'transformation': 'none'}
        assert entry['openingPolicySha256'] == digest(op)
        assert entry['pathSha256'] == q['pathSha256'] == digest(p)
        assert entry['qualificationPolicySha256'] == digest(q)
        assert entry['suspensionSelectionSha256'] == digest(p['suspensionSelection'])
        assert entry['suspensionProfiles'] == [{'suspensionProfileId': selected_id, 'sha256': digest(profile)}]
        binding = bindings[p['holidayBindingId']]
        assert binding['lawId'] == p['lawId'] and binding['authoritySeatCanton'] == research['canton'] and binding['anchor'] == 'authoritySeat'
        assert binding['physicalBaseline']['calendarId'] == CALENDARS[research['canton']]
        assert entry['holidayBindingSha256'] == digest(binding)
        assert entry['targetComponentRefs'] == [] and entry['sourceReviewRef'] is None and entry['referenceSuiteRef'] is None
        for key in ('caseCoverage', 'calculationCoverage', 'sourceCoverage'):
            assert p['temporalBinding'][key] == WINDOW
        assert [(r['researchBindingId'], r['interval']) for r in p['normTimeline']] == [(r['id'], {'from': r['from'], 'to': r['to']}) for r in suite['temporalBindings'][research['canton']]]
        if research['canton'] == 'FR':
            for segment in p['normTimeline']:
                prohibited = '8637' if segment['interval']['from'] < '2026-10-01' else '7947'
                assert not any(prohibited in ref['sourceId'] for ref in segment['sourceRefs'])
        assert p['endShiftGuard'] == ('none' if research['suspension'] == 'none' else 'blockWhenEnteringApplicableSuspension')
    assert len(calendars) == 35
    assert sum(len(c['rules']) for c in calendars.values()) == 431
    for year in (2026, 2027):
        genf = calendar_dates(CALENDARS['GE'], calendars, year, False)
        assert len(genf) == 9
        for md in ('01-02', '05-01', '08-02', '12-26'):
            assert date.fromisoformat(f'{year}-{md}') not in genf
    assert date(2026, 9, 10) in calendar_dates(CALENDARS['GE'], calendars, 2026, False)
    assert date(2027, 9, 9) in calendar_dates(CALENDARS['GE'], calendars, 2027, False)
    assert manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '14.0.0'
    assert manifest['releaseStatus'] == 'candidate'
    local = manifest['extensions']['steimer.local-reference']
    assert local['structuralContractProbeOnly'] is True
    assert all(local[k] is False for k in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'))


def run(write=False):
    assert sha(GUARD.read_bytes()) == GUARD_SHA
    guard = load(GUARD)
    assert guard['j1ProfessionallyAccepted'] is True and len(guard['files']) == 4413
    for name in ('formatDecision', 'productCodeChangePermission', 'runtimeActivation', 'sourceReleaseApproved', 'operatingChanges'):
        assert guard[name] is False
    suite_raw = SUITE.read_bytes()
    assert sha(suite_raw) == guard['files'][SUITE.relative_to(ROOT).as_posix()]
    suite = json.loads(suite_raw)
    manifest, old_manifest = load(BUNDLE / 'manifest.json'), load(BASE / 'manifest.json')
    files = {ref['path']: (BUNDLE / ref['path']).read_bytes() for ref in manifest['artifacts']}
    assert len(files) == len(manifest['artifacts']) == 44
    payload_inventory = sorted(p.relative_to(BUNDLE).as_posix() for p in BUNDLE.rglob('*') if p.is_file() and p.name != 'manifest.json')
    assert payload_inventory == sorted(files)
    for ref in manifest['artifacts']:
        assert sha(files[ref['path']]) == ref['sha256'] and len(files[ref['path']]) == ref['byteLength']
    old_refs = index(old_manifest['artifacts'], 'path')
    for path, raw in files.items():
        if path != ADMIN:
            assert raw == (BASE / path).read_bytes()
            assert sha(raw) == old_refs[path]['sha256']
    catalog, old = json.loads(files[ADMIN]), load(BASE / ADMIN)
    holiday_catalog = json.loads(files[HOLIDAY])
    assert len(holiday_catalog['data']['rules']) == 479
    assert len(holiday_catalog['activation']['supplementalRules']) == 20
    calendars = {value['calendarId']: value for value in map(json.loads, files.values()) if value['dataKind'] == 'calendar'}
    schema_values = {name: load(path) for name, path in SCHEMAS.items()}
    validators = {name: Draft202012Validator(value, format_checker=FormatChecker()) for name, value in schema_values.items()}
    for value in schema_values.values():
        Draft202012Validator.check_schema(value)
    validators['catalog'].validate(catalog)
    validators['localManifest'].validate(manifest)
    assert not validators['manifest'].is_valid(manifest)
    validate_structure(catalog, old, suite, calendars, manifest)
    crosswalk_document = load(OUT / 'source-crosswalk.json')
    assert crosswalk_document['archiveIDsUnchanged'] is True and crosswalk_document['mappingOnly'] is True
    crosswalk = crosswalk_document['sourceRows']
    assert len(crosswalk) == 19
    for row in crosswalk:
        register = load(ROOT / ('outputs/ap23j1-2026-10-27/sources/' + row['canton'].lower() + '/source-bindings.json'))
        origin = next(s for s in register['sources'] if s['id'] == row['researchSourceId'])
        assert row['url'] == origin['url'] and row['researchRole'] == origin['role']
        for pin in row['evidence']:
            raw = (ROOT / pin['path']).read_bytes()
            assert sha(raw) == pin['sha256'] == origin['sha256'] and len(raw) == pin['byteLength']
    node = load(OUT / 'QA-AP23J2.json')
    assert node['status'] == 'passed' and node['referenceCases'] == 673
    peers = index(node['results'], 'id')
    discrepancies, results = [], []
    for case in suite['cases']:
        item = adapt(case, suite)
        assert research_provenance(case) == peers[case['id']]['provenance']
        actual = evaluate(item, catalog, calendars, validators['input'], manifest['coverage'])
        for key, expected in case['expected'].items():
            if not same(actual.get(key), expected):
                discrepancies.append({'id': case['id'], 'kind': 'acceptedStaticExpectation', 'key': key, 'expected': expected, 'actual': actual.get(key)})
        if actual != peers[case['id']]['actual']:
            discrepancies.append({'id': case['id'], 'kind': 'nodeComparison', 'python': actual, 'node': peers[case['id']]['actual']})
        assert actual['exportAllowed'] is False
        if actual['outcome'] != 'datedResearchValue':
            assert 'end' not in actual
        results.append({'id': case['id'], 'actual': actual})
    opening_checks = []
    for row in node['openingProbeResults']:
        changed = catalog
        if row.get('mutation') in ('missingNormDate', 'syntheticNormTransition'):
            changed = copy.deepcopy(catalog)
            p = next(p for p in changed['paths'] if p['pathId'] == row['input']['path'])
            q = next(q for q in changed['qualificationPolicies'] if q['pathId'] == p['pathId'])
            entry = next(e for e in changed['releaseBinding']['pathEligibility'] if e['pathId'] == p['pathId'])
            p['normTimeline'] = row['mutatedNormTimeline']
            q['pathSha256'] = digest(p)
            entry['pathSha256'] = digest(p)
            entry['qualificationPolicySha256'] = digest(q)
        actual = evaluate(row['input'], changed, calendars, validators['input'], manifest['coverage'])
        if actual != row['actual']:
            discrepancies.append({'id': row['id'], 'kind': 'openingProvenanceComparison', 'python': actual, 'node': row['actual']})
        opening_checks.append({'id': row['id'], 'outcome': actual['outcome'], 'exportAllowed': actual['exportAllowed']})
    counts = Counter(row['actual']['outcome'] for row in results)
    assert dict(counts) == {'datedResearchValue': 93, 'qualificationBoundaryProposed': 573, 'unresolvedBoundaryProposed': 3, 'researchWindowBoundary': 4}
    report = {'workPackage': 'AP23J2', 'status': 'passedIndependentStructuralAndResearchComparison' if not discrepancies else 'discrepancies',
              'method': 'Independent Python candidate-byte/schema inspection and full-date selection. No JS or product imports.',
              'runtimeActive': False, 'sourceReleaseApproved': False, 'calendarExportEnabled': False,
              'catalogPaths': len(catalog['paths']), 'preservedPaths': len(old['paths']), 'newPaths': len(suite['paths']),
              'physicalCalendars': len(calendars), 'physicalProjectionRules': sum(len(c['rules']) for c in calendars.values()),
              'holidayRules': len(holiday_catalog['data']['rules']) + len(holiday_catalog['activation']['supplementalRules']),
              'baseHolidayRules': len(holiday_catalog['data']['rules']), 'supplementalHolidayRules': len(holiday_catalog['activation']['supplementalRules']),
              'artifacts': len(files), 'unchangedRawArtifacts': len(files) - 1,
              'referenceCases': len(results), 'counts': dict(counts), 'openingProvenanceComparisons': len(opening_checks),
              'sourceByteBindings': len(crosswalk), 'discrepancies': discrepancies,
              'nodeEvidenceSha256': sha((OUT / 'QA-AP23J2.json').read_bytes()), 'fixtureSha256': sha(suite_raw),
              'schemaValidator': 'jsonschema ' + importlib.metadata.version('jsonschema'),
              'openingChecks': opening_checks, 'results': results,
              'evidence': [evidence(path) for path in [Path(__file__), GUARD, SUITE, BUNDLE / 'manifest.json', BUNDLE / ADMIN, *SCHEMAS.values()]]}
    if write:
        (OUT / 'independent-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key not in ('results', 'openingChecks', 'evidence')}, ensure_ascii=False, indent=2))
    return 1 if discrepancies else 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    raise SystemExit(run(args.write))
