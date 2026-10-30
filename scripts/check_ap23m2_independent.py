# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23M2 inspection using Python's standard library only.

The actual candidate bytes supply policies, profiles and physical RuleCalendar3
objects. Original M1 case inputs and static expectations are fixtures only.
No product/Node module, M1 oracle or M1 calendar/path model is imported.
"""
import argparse
import copy
import hashlib
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'data/candidates/2026-10-27-ap23l3'
OUT = ROOT / 'outputs/ap23m2-candidate-2026-10-28'
BUNDLE = OUT / 'bundle'
REPORT = ROOT / 'outputs/ap23m2-2026-10-28/independent-verification.json'
GUARD = ROOT / 'outputs/ap23m2-2026-10-28/protected-inputs.json'
GUARD_SHA = 'af68d4b6c0fb33d731c50f99b3ca3c63bc1c573d5635d259798a5ed28953c3b1'
SUITE = ROOT / 'docs/fachrecht/ap23m1/referenzfaelle.json'
INPUT_SCHEMA = ROOT / 'schemas/candidates/ap23m2/administrative-input-v10.schema.json'
NE_GATE = ROOT / 'outputs/ap23m2-2026-10-28/ne-fassungsgate.json'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
WINDOW = {'from': '2026-08-29', 'to': '2027-12-31'}
DAY = timedelta(days=1)
RESULT_KEYS = ('outcome', 'reason', 'legalOpening', 'ordinaryStart', 'firstCountedDay',
               'nominalEnd', 'ordinaryShiftEnd', 'firstSuspendedShiftDate', 'end',
               'skippedDays', 'endShiftDays')


def load(path):
    return json.loads(path.read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def digest(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False,
                          separators=(',', ':')).encode())


def exact(a, b):
    return type(a) is type(b) and a == b


def index(rows, key):
    result = {row[key]: row for row in rows}
    assert len(result) == len(rows), 'Duplicate ' + key
    return result


def evidence(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'byteLength': len(raw), 'sha256': sha(raw)}


def relative(value):
    path = Path(value)
    assert not path.is_absolute() and '..' not in path.parts and '.' not in path.parts
    assert '\\' not in value and '\x00' not in value
    return path


def inside(day, interval):
    value = day.isoformat() if isinstance(day, date) else day
    return interval['from'] <= value and (interval.get('to') is None or value <= interval['to'])


def parse_day(value):
    if type(value) is not str:
        return None
    try:
        result = date.fromisoformat(value)
    except ValueError:
        return None
    return result if result.isoformat() == value else None


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
        value = first + ((calc['isoWeekday'] - first.isoweekday()) % 7
                         + 7 * (calc['occurrence'] - 1)) * DAY
        if calc['type'] == 'nthWeekdayOffsetDays':
            value += calc['offsetDays'] * DAY
    condition = rule.get('condition', 'always')
    assert condition in ('always', 'unlessTuesdayOrSaturday', 'onlyMonday',
                         'shiftHolyThursdayBy7Days'), condition
    if condition == 'unlessTuesdayOrSaturday' and value.isoweekday() in (2, 6):
        return None
    if condition == 'onlyMonday' and value.isoweekday() != 1:
        return None
    if condition == 'shiftHolyThursdayBy7Days' and easter(year) - 7 * DAY <= value < easter(year):
        value += 7 * DAY
    return value


def calendar_days(ident, calendars, year, ancestors=()):
    assert ident not in ancestors, 'Cyclic physical calendar'
    cal = calendars[ident]
    result = {}
    for rule in cal['rules']:
        if rule.get('effect', {}).get('type') == 'holiday':
            day = rule_day(rule, year)
            if day and inside(day, cal['validity']) and inside(day, rule['validity']):
                result.setdefault(day, []).append(rule['ruleId'])
    for parent in cal['inherits']:
        for day, ids in calendar_days(parent, calendars, year, ancestors + (ident,)).items():
            result.setdefault(day, []).extend(ids)
    return result


def profile_periods(profile, first, last):
    def edge(spec, year):
        target = year + spec['yearOffset']
        if spec['type'] == 'fixedMonthDay':
            return date(target, spec['month'], spec['day'])
        assert spec['type'] == 'easterOffset'
        return easter(target) + spec['days'] * DAY
    result = []
    for year in range(first.year - 1, last.year + 1):
        for period in profile['periods']:
            assert period['inclusive'] is True
            start, end = edge(period['start'], year), edge(period['end'], year)
            assert start <= end
            if end >= first and start <= last:
                result.append((start, end, period['periodId']))
    return result


def qualified(req, facts):
    if req['key'] not in facts:
        return False
    values = req.get('oneOf', [req.get('value')])
    return any(exact(facts[req['key']], value) for value in values)


def boundary(reason, outcome='qualificationBoundaryProposed', **extra):
    return {'outcome': outcome, 'reason': reason, **extra, 'calendarExport': False}


def outside():
    return boundary('outsideReferenceWindow', 'researchWindowBoundary')


class Candidate:
    def __init__(self, manifest, catalog, calendars):
        self.manifest, self.catalog, self.calendars = manifest, catalog, calendars
        self.paths = index(catalog['paths'], 'pathId')
        self.policies = index(catalog['qualificationPolicies'], 'pathId')
        self.bindings = index(catalog['holidayBindings'], 'holidayBindingId')
        self.profiles = index(catalog['suspensionProfiles'], 'suspensionProfileId')
        self.eligibility = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
        self.laws = index(catalog['laws'], 'lawId')
        self.research_paths = {p['researchRef']: p for p in catalog['paths']
                               if p.get('contractFamily') == 'qualifiedDayProcedureV10'}
        self.input_schema, self.holiday_cache = load(INPUT_SCHEMA), {}

    def input_for(self, case):
        path = self.research_paths[case['path']]
        return {'path': path['pathId'], 'pathRevision': path['revision'],
                'authoritySeatCanton': self.laws[path['lawId']]['canton'],
                'trigger': case['trigger'], 'days': case['days'],
                'facts': copy.deepcopy(case['facts'])}

    def holidays(self, calendar_id, year):
        key = calendar_id, year
        if key not in self.holiday_cache:
            self.holiday_cache[key] = calendar_days(calendar_id, self.calendars, year)
        return self.holiday_cache[key]

    def calculate(self, item):
        if type(item) is not dict or set(item) != {'path', 'pathRevision', 'authoritySeatCanton', 'trigger', 'days', 'facts'}:
            return boundary('inputContractInvalid')
        path = self.paths.get(item['path'])
        if not path or path.get('contractFamily') != 'qualifiedDayProcedureV10':
            return boundary('unknownResearchPath')
        if not exact(item['pathRevision'], path['revision']) or item['authoritySeatCanton'] != self.laws[path['lawId']]['canton']:
            return boundary('pathContextMismatch')
        trigger = parse_day(item['trigger'])
        if trigger is None:
            return boundary('invalidResearchDate')
        facts = item['facts']
        if type(facts) is not dict:
            return boundary('inputContractInvalid')
        policy, duration, opening = self.policies[path['pathId']], path['duration'], path['openingPolicy']
        binding, eligibility = self.bindings[path['holidayBindingId']], self.eligibility[path['pathId']]
        selection = binding['calendarSelection']
        allowed = {req['key'] for req in policy['requirements']}
        if opening['kind'] == 'vdQualifiedOrUnsignedPost':
            allowed.update(req['key'] for req in opening['trackingRequirements'])
        if duration['kind'] == 'qualifiedVsLongerNoticeDays':
            allowed.update((duration['valueFact'], duration['ordinaryBaseFact']))
        if selection['kind'] == 'qualifiedAuthoritySeatRegion':
            allowed.add(selection['factKey'])
        for req in policy['requirements']:
            if not qualified(req, facts):
                return boundary(req['reason'])
        if set(facts) - allowed:
            return boundary('unknownResearchFact')
        days = item['days']
        if type(days) is not int or not 1 <= days <= 9007199254740991:
            return boundary('dayDurationNotSpecified')
        if duration['kind'] == 'statutoryDays':
            if days != duration['value']:
                return boundary('statutoryDurationMismatch')
        elif duration['kind'] == 'authorityOrderedDays':
            if not duration['minimum'] <= days <= duration['maximum']:
                return boundary('orderedDurationOutsideTechnicalGuard')
        else:
            assert duration['kind'] == 'qualifiedVsLongerNoticeDays'
            actual, base = facts.get(duration['valueFact']), facts.get(duration['ordinaryBaseFact'])
            assert duration['comparison'] == 'strictlyAboveOrdinaryBase'
            if (type(actual) is not int or actual != days or type(base) is not int
                    or base not in duration['ordinaryBaseAllowed'] or actual <= base
                    or not duration['minimum'] <= actual <= duration['maximum']):
                return boundary('noticeDurationNotQualified')
        # This vocabulary is read from the actual new input schema, never inferred from defaults.
        vocabulary = self.input_schema['properties']['facts']['properties']
        if any(key not in vocabulary or not any(exact(value, enum)
               for enum in vocabulary[key]['enum']) for key, value in facts.items()):
            return boundary('inputContractInvalid')
        if selection['kind'] == 'qualifiedAuthoritySeatRegion':
            assert selection['otherwise'] == 'block' and selection['defaultAllowed'] is False
            variants = [row for row in selection['cases'] if exact(row['value'], facts.get(selection['factKey']))]
            if len(variants) != 1:
                return boundary('holidayAnchorNotQualified')
            chosen = variants[0]
        else:
            assert selection['kind'] == 'fixedAuthoritySeat'
            chosen = selection
        calendar_id = chosen['calendarId']
        calendar = self.calendars[calendar_id]
        assert binding['proceduralCalendarSupplement'] == {'kind': 'none'}
        temporal = path['temporalBinding']
        common = [self.manifest['coverage'], temporal['sourceCoverage'], temporal['calculationCoverage'],
                  eligibility['calculationCoverage'], calendar['validity']]

        def ancestor_intervals(ident, seen=()):
            assert ident not in seen
            result = [self.calendars[ident]['validity']]
            for parent in self.calendars[ident]['inherits']:
                result.extend(ancestor_intervals(parent, seen + (ident,)))
            return result
        common.extend(ancestor_intervals(calendar_id))
        evaluated = set()

        def covered(day):
            if not all(inside(day, interval) for interval in common):
                return False
            if sum(inside(day, row['interval']) for row in path['normTimeline']) != 1:
                return False
            evaluated.add(day)
            return True

        if not inside(trigger, temporal['caseCoverage']) or not inside(trigger, eligibility['caseCoverage']) or not covered(trigger):
            return outside()

        def working(day):
            return day.weekday() < 5 and day not in self.holidays(calendar_id, day.year)

        legal_opening, opening_shift = trigger, []
        if opening['kind'] == 'vdQualifiedOrUnsignedPost':
            assert opening['holidayBinding'] == 'sameAsPath'
            mode = facts[opening['factKey']]
            if mode == opening['trackingMode']:
                for req in opening['trackingRequirements']:
                    if not qualified(req, facts):
                        return boundary(req['reason'])
                assert opening['trackingTransformation'] == 'nextWorkingDayIfNonWorkingReceipt'
                while not working(legal_opening):
                    opening_shift.append(legal_opening.isoformat())
                    legal_opening += DAY
                    if not covered(legal_opening):
                        return outside()
            else:
                assert mode == opening['qualifiedMode']
                assert opening['qualifiedTransformation'] == 'none'
        else:
            assert opening == {**opening, 'kind': 'qualifiedCurrentTrigger', 'triggerKind': 'qualifiedLegalOpening', 'transformation': 'none'}
        if not covered(legal_opening):
            return outside()
        profile = self.profiles[path['suspensionSelection']['suspensionProfileId']]
        upper = date.fromisoformat(temporal['calculationCoverage']['to'])
        periods = profile_periods(profile, legal_opening, upper)

        def paused(day):
            return any(first <= day <= last for first, last, _ in periods)

        # Enumerate forward-covered calendar days, then select the nth nonpaused day.
        candidates = [legal_opening + n * DAY for n in range(1, (upper - legal_opening).days + 1)]
        counted = [day for day in candidates if not paused(day)]
        if len(counted) < days:
            return outside()
        ordinary_start, first_counted, nominal = legal_opening + DAY, counted[0], counted[days - 1]
        count_span = [day for day in candidates if day <= nominal]
        if not all(covered(day) for day in count_span):
            return outside()
        ends = [day for day in [nominal] + [d for d in candidates if d > nominal] if working(day)]
        if not ends:
            return outside()
        end = ends[0]
        shift_span = [nominal + n * DAY for n in range((end - nominal).days + 1)]
        if not all(covered(day) for day in shift_span):
            return outside()
        first_paused = next((day for day in shift_span if day > nominal and paused(day)), None)
        if path['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension' and first_paused:
            return boundary('M1-END-SUSPENSION', 'unresolvedBoundaryProposed',
                            nominalEnd=nominal.isoformat(), ordinaryShiftEnd=end.isoformat(),
                            firstSuspendedShiftDate=first_paused.isoformat())
        assert path['endShiftGuard'] in ('none', 'blockWhenEnteringApplicableSuspension')
        spans = [copy.deepcopy(row) for row in path['normTimeline']
                 if any(inside(day, row['interval']) for day in evaluated)]
        return {'outcome': 'datedResearchValue', 'legalOpening': legal_opening.isoformat(),
                'ordinaryStart': ordinary_start.isoformat(), 'firstCountedDay': first_counted.isoformat(),
                'nominalEnd': nominal.isoformat(), 'end': end.isoformat(),
                'skippedDays': sum(paused(day) for day in count_span), 'endShiftDays': (end - nominal).days,
                'calendarExport': False, 'independentProvenance': {
                    'pathId': path['pathId'], 'pathRevision': path['revision'], 'calendarId': calendar_id,
                    'projectionId': chosen['projectionId'], 'suspensionProfileId': profile['suspensionProfileId'],
                    'openingShiftDates': opening_shift,
                    'shiftedDates': [day.isoformat() for day in shift_span if day < end],
                    'normSegments': spans}}


def compare_expected(actual, expected, label):
    for key, value in expected.items():
        assert key in actual and exact(actual[key], value), (label, key, value, actual.get(key))
    assert actual['calendarExport'] is False
    assert ('end' in actual) == (actual['outcome'] == 'datedResearchValue'), (label, 'definitive boundary')


def byte_and_semantic_checks():
    assert evidence(GUARD)['sha256'] == GUARD_SHA
    guard = load(GUARD)
    assert guard['workPackage'] == 'AP23M2' and guard['m1ProfessionallyAccepted'] is True
    assert len(guard['files']) == 11414

    def protected(path):
        raw = (ROOT / relative(path)).read_bytes()
        assert sha(raw) == guard['files'][path], 'Protected input changed ' + path
        return raw

    old_manifest = json.loads(protected((BASE / 'manifest.json').relative_to(ROOT).as_posix()))
    manifest = load(BUNDLE / 'manifest.json')
    integrity = load(OUT / 'candidate-integrity.json')
    assert manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '17.0.0'
    assert manifest['releaseStatus'] == 'candidate'
    assert manifest['calendarIds'] == old_manifest['calendarIds'] and len(manifest['calendarIds']) == 35
    ext = manifest['extensions']['steimer.local-reference']
    assert ext['structuralContractProbeOnly'] is True and ext['startGuardSha256'] == GUARD_SHA
    assert ext['acceptedResearchSha256'] == guard['files'][SUITE.relative_to(ROOT).as_posix()]
    for flag in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'):
        assert ext[flag] is False
    descriptors, previous = index(manifest['artifacts'], 'path'), index(old_manifest['artifacts'], 'path')
    assert set(descriptors) == set(previous) and len(descriptors) == 44
    calendars, byte_rows = {}, []
    for path, descriptor in descriptors.items():
        raw = (BUNDLE / relative(path)).read_bytes()
        assert sha(raw) == descriptor['sha256'] and len(raw) == descriptor['byteLength'], path
        value = json.loads(raw)
        if descriptor['role'] == 'calendar':
            assert value['formatVersion'] == '3.0.0'
            calendars[value['calendarId']] = value
        preserved = path != ADMIN
        if preserved:
            assert raw == protected((BASE / path).relative_to(ROOT).as_posix())
            assert descriptor == previous[path]
        byte_rows.append({'path': path, 'sha256': sha(raw), 'byteLength': len(raw), 'preserved': preserved})
    assert len(calendars) == 35
    for key, path in [('manifest', BUNDLE / 'manifest.json'), ('sourceCrosswalk', OUT / 'source-crosswalk.json'),
                      ('researchMap', OUT / 'research-map.json')]:
        assert evidence(path) == integrity[key]
    for row in integrity['artifacts']:
        assert evidence(ROOT / relative(row['path'])) == row
    catalog = load(BUNDLE / ADMIN)
    old = json.loads(protected((BASE / ADMIN).relative_to(ROOT).as_posix()))
    assert catalog['formatVersion'] == '10.0.0' and catalog['runtimeActive'] is False
    assert catalog['contractStatus'] == 'proposed'
    assert catalog['contractDecision'] == {'id': 'DEC-2026-042', 'status': 'proposed', 'on': None}
    assert len(old['paths']) == 196 and len(catalog['paths']) == 245
    preserved = []
    for field, key in [('paths', 'pathId'), ('qualificationPolicies', 'pathId'), ('holidayBindings', 'holidayBindingId'),
                       ('laws', 'lawId'), ('sources', 'sourceId'), ('suspensionProfiles', 'suspensionProfileId'),
                       ('excludedPaths', 'exclusionId'), ('preserved', 'path')]:
        current = index(catalog[field], key)
        for row in old[field]:
            assert current[row[key]] == row, 'Changed historical object ' + field + '/' + row[key]
        preserved.append({'field': field, 'unchangedObjects': len(old[field])})
    eligible = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
    for row in old['releaseBinding']['pathEligibility']:
        assert eligible[row['pathId']] == row
    preserved.append({'field': 'releaseBinding.pathEligibility', 'unchangedObjects': 196})
    for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'):
        assert catalog['releaseBinding'][key] is None
    assert catalog['releaseBinding']['status'] == 'candidate' and catalog['releaseBinding']['targetComponentRefs'] == []
    runner = Candidate(manifest, catalog, calendars)
    new = list(runner.research_paths.values())
    assert len(new) == 49
    assert Counter(runner.laws[p['lawId']]['canton'] for p in new) == {'NE': 16, 'VD': 19, 'VS': 14}
    assert Counter(p['openingPolicy']['kind'] for p in new) == {'qualifiedCurrentTrigger': 30, 'vdQualifiedOrUnsignedPost': 19}
    for path in new:
        ident = path['pathId']
        policy, binding, entry = runner.policies[ident], runner.bindings[path['holidayBindingId']], eligible[ident]
        profile = runner.profiles[path['suspensionSelection']['suspensionProfileId']]
        assert entry['pathRevision'] == policy['pathRevision'] == path['revision'] == 1
        for field, value in [('pathSha256', path), ('qualificationPolicySha256', policy), ('durationPolicySha256', path['duration']),
                             ('holidayBindingSha256', binding), ('openingPolicySha256', path['openingPolicy']),
                             ('calendarSelectionSha256', binding['calendarSelection']), ('suspensionSelectionSha256', path['suspensionSelection']),
                             ('proceduralCalendarSupplementSha256', binding['proceduralCalendarSupplement'])]:
            assert entry[field] == digest(value), (ident, field)
        assert policy['pathSha256'] == digest(path)
        assert entry['suspensionProfiles'] == [{'suspensionProfileId': profile['suspensionProfileId'], 'sha256': digest(profile)}]
        assert entry['caseCoverage'] == entry['calculationCoverage'] == WINDOW
        for field in ('caseCoverage', 'calculationCoverage', 'sourceCoverage'):
            assert path['temporalBinding'][field] == WINDOW
        assert entry['status'] == 'candidate' and entry['targetComponentRefs'] == []
        assert entry['sourceReviewRef'] is None and entry['referenceSuiteRef'] is None
        assert binding['bindingVersion'] == '10.0.0' and binding['anchor'] == 'authoritySeat'
        assert binding['legalBinding']['roleUnion'] is False and binding['legalBinding']['partyOrRepresentativeRequired'] is False
        assert binding['proceduralCalendarSupplement'] == {'kind': 'none'}
        for ref in binding['physicalSource']['references']:
            descriptor = descriptors[ref['path']]
            assert all(ref[key] == descriptor[key] for key in ('role', 'contentId', 'path', 'sha256'))
        day = date.fromisoformat(WINDOW['from'])
        while day <= date.fromisoformat(WINDOW['to']):
            assert sum(inside(day, row['interval']) for row in path['normTimeline']) == 1
            day += DAY
    holiday = load(BUNDLE / HOLIDAY)
    assert len(holiday['data']['rules'] + holiday['activation']['supplementalRules']) == 499
    projections = index(holiday['activation']['projections'], 'id')
    for binding in catalog['holidayBindings']:
        if binding.get('bindingVersion') != '10.0.0':
            continue
        selection = binding['calendarSelection']
        options = selection.get('cases', [selection])
        if selection['kind'] == 'qualifiedAuthoritySeatRegion':
            assert binding['authoritySeatCanton'] == 'NE' and len(options) == 2
            assert selection['factKey'] == 'authorityHolidayRegion' and selection['defaultAllowed'] is False
            assert {row['value'] for row in options} == {'neWithoutLeLanderon', 'leLanderon'}
        for selected in options:
            assert projections[selected['projectionId']]['calendarId'] == selected['calendarId']
            assert selected['calendarId'] in calendars
    crosswalk = load(OUT / 'source-crosswalk.json')
    assert crosswalk['mappingOnly'] is True and len(crosswalk['sourceRows']) == 64
    operative = [row for row in crosswalk['sourceRows'] if row['catalogSourceId'] is not None]
    assert len(operative) == crosswalk['operativeCatalogSources'] == 19
    source_ids = set(index(catalog['sources'], 'sourceId'))
    sources = []
    for row in crosswalk['sourceRows']:
        assert row['sourcePromotion'] is False
        if row['catalogSourceId']:
            assert row['catalogSourceId'] in source_ids
        for item in row['evidence']:
            raw = protected(item['path'])
            assert len(raw) == item['byteLength'] and sha(raw) == item['sha256']
            sources.append(item)
    assert len(sources) == 64
    suite = json.loads(protected(SUITE.relative_to(ROOT).as_posix()))
    assert len(suite['cases']) == 109
    for item in suite['sourceModels']:
        assert sha(protected(item['path'])) == item['sha256']
    gate = load(NE_GATE)
    assert gate['status'] == 'fresh-official-evidence-no-new-relevant-commencement-observed'
    for row in gate['sources']:
        raw = (ROOT / relative(gate['sourceBase']) / relative(row['file'])).read_bytes()
        assert len(raw) == row['bytes'] and sha(raw) == row['sha256']
    return runner, suite, {'guard': evidence(GUARD), 'manifest': evidence(BUNDLE / 'manifest.json'),
                           'catalog': evidence(BUNDLE / ADMIN), 'suite': evidence(SUITE),
                           'inputVocabularySchema': evidence(INPUT_SCHEMA), 'neFreshnessGate': evidence(NE_GATE),
                           'artifactBytes': byte_rows, 'preservedObjects': preserved,
                           'physicalCalendars': 35, 'holidayRules': 499,
                           'operativeSourceCount': 19, 'sourceEvidence': sources}


def independent_calendar_probes(runner):
    """Static authored anchors, resolved through real physical calendars only."""
    general, landeron = 'ap22-ne-027ceadbf103', 'ap22-ne-21f519039621'
    vd, vs = 'ap22-vd-26f452ff34ee', 'ap22-vs-6c002f32b1b0'
    # Calendar applicability begins on 29.08.2026. Earlier 2026 anchor dates
    # cannot truthfully be claimed as covered physical holiday occurrences.
    anchors = [(general, '2027-01-02', True), (general, '2027-03-29', True),
               (general, '2027-05-07', True), (general, '2027-05-17', True),
               (general, '2026-09-21', True), (general, '2027-09-20', True),
               (general, '2026-12-24', True), (general, '2027-12-24', True),
               (general, '2026-12-26', True), (general, '2027-12-26', True),
               (general, '2026-12-31', True), (general, '2027-12-31', True),
               (general, '2027-05-27', False), (landeron, '2027-05-27', True),
               (vd, '2026-09-21', True), (vd, '2027-09-20', True),
               (vd, '2027-05-27', False), (vs, '2027-03-26', False),
               (vs, '2026-12-08', True), (vs, '2027-12-08', True),
               (vs, '2027-05-27', True), (vs, '2027-01-05', False)]
    rows = []
    for i, (calendar_id, value, expected) in enumerate(anchors, 1):
        day = date.fromisoformat(value)
        ids = runner.holidays(calendar_id, day.year).get(day, [])
        assert bool(ids) is expected, (calendar_id, value)
        rows.append({'id': 'PY-M2-CAL-' + str(i), 'calendarId': calendar_id, 'date': value,
                     'expectedPhysicalHoliday': expected, 'actualRuleIds': ids,
                     'meaning': 'physical end-calendar probe, not receipt transformation or new legal permission'})
    return rows


def enumerate_physical_calendars(runner):
    """Exercise every actual physical calendar in both years, not a free union."""
    rows = []
    for ident in sorted(runner.calendars):
        for year in (2026, 2027):
            holidays = runner.holidays(ident, year)
            dates = sorted(day.isoformat() for day in holidays)
            assert len(dates) == len(set(dates))
            assert all(value.startswith(str(year) + '-') for value in dates)
            rows.append({'calendarId': ident, 'year': year, 'holidayDates': dates,
                         'holidayDatesSha256': digest(dates),
                         'actualRuleIds': {day.isoformat(): ids for day, ids in sorted(holidays.items())},
                         'onlyWithinActualCalendarAndRuleValidity': True})
    assert len(rows) == 70
    return rows


def independent_probes(runner, suite):
    seeds = {case['id']: runner.input_for(case) for case in suite['cases']}
    rows = []

    def add(ident, seed, expected, **changes):
        item = copy.deepcopy(seeds[seed])
        facts, remove = changes.pop('facts', {}), changes.pop('remove', ())
        item.update(changes)
        item['facts'].update(facts)
        for key in remove:
            item['facts'].pop(key, None)
        actual = runner.calculate(item)
        compare_expected(actual, expected, ident)
        rows.append({'id': ident, 'input': item, 'expected': expected, 'actual': actual})

    dated = lambda end, **kw: {'outcome': 'datedResearchValue', 'end': end, **kw}
    blocked = lambda reason: {'outcome': 'qualificationBoundaryProposed', 'reason': reason}
    for path in runner.research_paths.values():
        case = next(case for case in suite['cases'] if case['path'] == path['researchRef']
                    and case['expected']['outcome'] == 'datedResearchValue')
        for req in runner.policies[path['pathId']]['requirements']:
            for suffix, change in [('missing', {'remove': (req['key'],)}),
                                   ('wrong', {'facts': {req['key']: {'unqualified': True}}})]:
                add('PY-M2-REQ-' + path['pathId'] + '-' + req['key'] + '-' + suffix,
                    case['id'], blocked(req['reason']), **change)
        if path['openingPolicy']['kind'] == 'vdQualifiedOrUnsignedPost':
            for req in path['openingPolicy']['trackingRequirements']:
                add('PY-M2-POST-MISSING-' + path['pathId'] + '-' + req['key'],
                    case['id'], blocked(req['reason']),
                    facts={'openingMode': 'vdUnsignedPostalReceipt',
                           'unsignedPostalService': 'lawfullyPermittedAndNoSignatureRequired',
                           'entryIntoRecipientSphere': 'verified'}, remove=(req['key'],))
        selection = runner.bindings[path['holidayBindingId']]['calendarSelection']
        if selection['kind'] == 'qualifiedAuthoritySeatRegion':
            add('PY-M2-REGION-MISSING-' + path['pathId'], case['id'], blocked('holidayAnchorNotQualified'),
                remove=(selection['factKey'],))
    for seed in ('M1-VS-ADMIN-NOTICE-LONG-BASE', 'M1-VS-COURT-NOTICE-LONG-BASE'):
        prefix = 'PY-M2-' + seed
        add(prefix + '-11-OVER10', seed, dated('2026-10-13'), days=11,
            facts={'ordinaryDays': 10, 'actualInstructionDays': 11})
        add(prefix + '-30-OVER10', seed, dated('2026-11-02'), days=30,
            facts={'ordinaryDays': 10, 'actualInstructionDays': 30})
        add(prefix + '-31-OVER30', seed, dated('2026-11-02'), days=31,
            facts={'ordinaryDays': 30, 'actualInstructionDays': 31})
        add(prefix + '-10-EQUAL', seed, blocked('noticeDurationNotQualified'), days=10,
            facts={'ordinaryDays': 10, 'actualInstructionDays': 10})
        add(prefix + '-11-BELOW30', seed, blocked('noticeDurationNotQualified'), days=11,
            facts={'ordinaryDays': 30, 'actualInstructionDays': 11})
        add(prefix + '-VALUE-MISSING', seed, blocked('noticeDurationNotQualified'), remove=('actualInstructionDays',))
        add(prefix + '-BASE-MISSING', seed, blocked('VS-B-NOTICE-BASE'), remove=('ordinaryDays',))
    add('PY-M2-NE-NO-RECEIPT-REBASE', 'M1-NE-OPENING-CLOSURE-UNCHANGED',
        dated('2027-01-04', legalOpening='2026-12-24', firstCountedDay='2027-01-03'))
    add('PY-M2-NE-REGION-GENERAL', 'M1-NE-GENERAL-CORPUS-NO', dated('2027-05-27'))
    add('PY-M2-NE-REGION-LANDERON', 'M1-NE-GENERAL-CORPUS-NO', dated('2027-05-28'),
        facts={'authorityHolidayRegion': 'leLanderon'})
    add('PY-M2-NE-COURT-FIXED-NO-REGION-INPUT', 'M1-NE-COURT-ORDERED-BASE', blocked('unknownResearchFact'),
        facts={'authorityHolidayRegion': 'leLanderon'})
    add('PY-M2-VD-QUALIFIED-SATURDAY', 'M1-VD-QUALIFIED-SATURDAY-3',
        dated('2026-09-22', legalOpening='2026-09-19'))
    add('PY-M2-VD-UNSIGNED-FAST', 'M1-VD-POSTAL-BETTAG-3',
        dated('2026-09-25', legalOpening='2026-09-22'))
    add('PY-M2-VD-NO-AI-EXPECTATION', 'M1-VD-POSTAL-BETTAG-3', blocked('unknownResearchFact'),
        facts={'expectedService': True})
    add('PY-M2-VS-JAN5-INCLUSIVE', 'M1-VS-COURT-ORDERED-BASE',
        dated('2027-01-06', firstCountedDay='2027-01-06'), trigger='2027-01-04', days=1)
    add('PY-M2-VS-ADMIN-NO-RECESS', 'M1-VS-ADMIN-ORDERED-BASE',
        dated('2027-01-05', firstCountedDay='2027-01-05'), trigger='2027-01-04', days=1)
    for path in runner.research_paths.values():
        case = next(case for case in suite['cases'] if case['path'] == path['researchRef']
                    and case['expected']['outcome'] == 'datedResearchValue')
        add('PY-M2-UNKNOWN-FACT-' + path['pathId'], case['id'], blocked('unknownResearchFact'),
            facts={'inventedDefaultFact': True})
    return rows


def mutation_sensitivity(runner, suite):
    rows = []

    def changed(ident, case_id, mutate):
        catalog = copy.deepcopy(runner.catalog)
        mutate(catalog)
        altered = Candidate(runner.manifest, catalog, runner.calendars)
        case = next(case for case in suite['cases'] if case['id'] == case_id)
        original = runner.calculate(runner.input_for(case))
        actual = altered.calculate(altered.input_for(case))
        assert any(original.get(k) != actual.get(k) for k in RESULT_KEYS), ident
        rows.append({'id': ident, 'caseId': case_id, 'differenceDetected': True,
                     'original': {k: original[k] for k in RESULT_KEYS if k in original},
                     'mutated': {k: actual[k] for k in RESULT_KEYS if k in actual}})

    def vs_jan2(catalog):
        profile = next(p for p in catalog['suspensionProfiles'] if p['suspensionProfileId'] == 'vs-three')
        next(p for p in profile['periods'] if p['periodId'] == 'vs-winter')['end']['day'] = 2

    def vd_no_shift(catalog):
        path = next(p for p in catalog['paths'] if p.get('researchRef') == 'vd-admin-grace-3')
        tracking = copy.deepcopy(path['openingPolicy']['trackingRequirements'])
        path['openingPolicy'] = {'kind': 'qualifiedCurrentTrigger', 'triggerKind': 'qualifiedLegalOpening',
                                 'transformation': 'none', 'sourceRefs': path['sourceRefs']}
        # Keep current facts permitted so the sensitivity isolates the missing transformation.
        policy = next(p for p in catalog['qualificationPolicies'] if p['pathId'] == path['pathId'])
        policy['requirements'].extend(tracking)

    def ne_no_landeron(catalog):
        binding = next(b for b in catalog['holidayBindings'] if b['holidayBindingId'] == 'ne-admin-qualified-authority-seat')
        binding['calendarSelection']['cases'][1]['calendarId'] = 'ap22-ne-027ceadbf103'

    changed('VS-WINTER-NOT-JAN2', 'M1-VS-COURT-WINTER-SHORT', vs_jan2)
    changed('NE-LANDERON-NOT-GENERAL', 'M1-NE-LANDERON-CORPUS-YES', ne_no_landeron)
    changed('VD-UNSIGNED-TRANSFORMATION-REQUIRED', 'M1-VD-POSTAL-BETTAG-3', vd_no_shift)
    return rows


def compare_node(runner, suite, results, qa_path):
    qa = load(qa_path)
    assert qa['status'] == 'passed'
    assert qa['fixtureSha256'] == evidence(SUITE)['sha256']
    assert qa['manifestSha256'] == evidence(BUNDLE / 'manifest.json')['sha256']
    assert qa['catalogSha256'] == evidence(BUNDLE / ADMIN)['sha256']
    peers = index(qa['results'], 'id')
    assert set(peers) == {case['id'] for case in suite['cases']} and len(peers) == 109
    counts = Counter()

    def semantic(own, node, item, label):
        for key in RESULT_KEYS:
            if key in own or key in node:
                assert key in own and key in node and exact(own[key], node[key]), (label, 'Node/Python', key, own.get(key), node.get(key))
                counts[key] += 1
        assert node.get('exportAllowed') is False
        assert ('end' in node) == (node['outcome'] == 'datedResearchValue')
        if own['outcome'] == 'datedResearchValue':
            p = own['independentProvenance']
            entry = runner.eligibility[item['path']]
            prov = node['provenance']
            for key in ('pathId', 'pathSha256', 'qualificationPolicySha256', 'durationPolicySha256', 'openingPolicySha256',
                        'holidayBindingId', 'holidayBindingSha256', 'calendarSelectionSha256',
                        'proceduralCalendarSupplementSha256', 'suspensionSelectionSha256'):
                assert prov[key] == entry[key], (label, 'provenance', key)
            assert node['calendar'] == prov['baseCalendarId'] == p['calendarId']
            assert prov['baseProjectionId'] == p['projectionId']
            assert prov['suspensionProfileId'] == p['suspensionProfileId']
            assert prov['suspensionProfileSha256'] == digest(runner.profiles[p['suspensionProfileId']])
            assert prov['physicalInput'] == item['trigger'] and prov['qualifiedOpening'] == own['legalOpening']
            assert prov['openingShiftDates'] == p['openingShiftDates']
            assert prov['shiftedDates'] == p['shiftedDates'] and prov['supplementDates'] == []
            assert prov['evaluatedNormSegments'] == p['normSegments']
            assert node['temporalBindings'] == [s['researchBindingId'] for s in p['normSegments']]
            counts['boundProvenance'] += 1

    for row in results:
        peer = peers[row['id']]
        assert peer['input'] == row['input'] and peer['expected'] == row['expected']
        compare_expected({**peer['actual'], 'calendarExport': False}, row['expected'], row['id'] + ' Node')
        semantic(row['actual'], peer['actual'], row['input'], row['id'])
        row['nodeSemanticComparison'] = 'equal'
    probes = []
    for row in qa['syntheticProbeResults']:
        own = runner.calculate(row['input'])
        compare_expected(own, row['expected'], row['id'])
        semantic(own, row['actual'], row['input'], row['id'])
        probes.append({'id': row['id'], 'input': row['input'], 'expected': row['expected'],
                      'actual': own, 'nodeSemanticComparison': 'equal'})
    missing = []
    for row in qa['missingFactRejections']:
        item = row.get('input')
        if item is None:
            path = runner.paths[row['path']]
            case = next(case for case in suite['cases'] if case['path'] == path['researchRef']
                        and case['expected']['outcome'] == 'datedResearchValue')
            item = runner.input_for(case)
            assert row['fact'] in item['facts']
            del item['facts'][row['fact']]
        own = runner.calculate(item)
        assert own['outcome'] != 'datedResearchValue'
        if 'actual' in row:
            semantic(own, row['actual'], item, row.get('id', row['path'] + '/' + row['fact']))
        missing.append({'id': row.get('id', row['path'] + '/' + row['fact']), 'input': item,
                        'actual': own, 'nodeRejectionConfirmed': True})
    assert len(missing) == 560
    return {'evidence': evidence(qa_path), 'matchedFixtures': 109,
            'comparedFieldCounts': dict(sorted(counts.items())), 'syntheticProbeComparisons': probes,
            'nodeMissingFactComparisons': missing}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--candidate-only', action='store_true')
    args = parser.parse_args()
    runner, suite, binding = byte_and_semantic_checks()
    results = []
    for case in suite['cases']:
        item = runner.input_for(case)
        assert item['facts'] == case['facts'], 'No annotation removal or inferred fact'
        actual = runner.calculate(item)
        compare_expected(actual, case['expected'], case['id'])
        results.append({'id': case['id'], 'input': item, 'expected': case['expected'], 'actual': actual})
    positive_paths = {row['input']['path'] for row in results if row['actual']['outcome'] == 'datedResearchValue'}
    assert len(positive_paths) == 49
    probes = independent_probes(runner, suite)
    calendar_probes = independent_calendar_probes(runner)
    physical_calendars = enumerate_physical_calendars(runner)
    mutations = mutation_sensitivity(runner, suite)
    node = None if args.candidate_only else compare_node(runner, suite, results, OUT / 'QA-AP23M2.json')
    counts = {'originalReferences': len(results), 'positivePaths': len(positive_paths),
              'referenceOutcomes': dict(Counter(r['actual']['outcome'] for r in results)),
              'independentProbes': len(probes), 'mutationSensitivities': len(mutations),
              'physicalCalendarProbes': len(calendar_probes), 'oldPathsPreserved': 196,
              'physicalCalendarYearEnumerations': len(physical_calendars),
              'unchangedNonAdministrativeArtifacts': 43}
    report = {'workPackage': 'AP23M2', 'status': 'candidate-only-passed-node-pending' if args.candidate_only else 'passed',
              'independentImplementation': 'Python standard library, actual M2 bytes, Gregorian computus and complete date enumeration',
              'importsProductCode': False, 'importsNodeCode': False, 'importsResearchOracle': False,
              'usesResearchCalendarOrPathModel': False, 'annotationRemoval': False, 'implicitCaseFacts': False,
              'runtimeActivation': False, 'sourceReleaseApproved': False, 'calendarExportEnabled': False,
              'vdArticle81NumericLegalityInference': False,
              'contractDecision': {'id': 'DEC-2026-042', 'status': 'proposed'}, 'binding': binding,
              'counts': counts, 'results': results, 'independentProbeResults': probes,
              'physicalCalendarProbeResults': calendar_probes, 'mutationSensitivity': mutations,
              'physicalCalendarInventories': physical_calendars,
              'nodeComparison': node,
              'limitations': ['Independent arithmetic and byte checks are not a native runtime or JSON Schema implementation.',
                              'No implicit legal facts, general reconstruction of an original expiry, platform or special-law expansion.',
                              'No source release, product build, export capability, installation, commit or operating change.']}
    if args.write:
        assert not args.candidate_only, 'No final report before Node comparison'
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'status': report['status'], **counts, 'report': evidence(REPORT) if args.write else None}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
