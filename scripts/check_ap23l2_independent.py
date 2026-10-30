# SPDX-License-Identifier: AGPL-3.0-only
"""Independent L2 byte inspection and date enumeration using Python standard library.

Reads the actual isolated candidate. Does not import JavaScript, product code,
the L1 date oracle, or the research-only calendar/path model. The original L1
case inputs and static expectations are used only as fixtures to compare.
"""
import argparse
import copy
import hashlib
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'data/candidates/2026-10-27-ap23k3'
OUT = ROOT / 'outputs/ap23l2-candidate-2026-10-27'
BUNDLE = OUT / 'bundle'
REPORT = ROOT / 'outputs/ap23l2-2026-10-27/independent-verification.json'
SUITE = ROOT / 'docs/fachrecht/ap23l1/referenzfaelle.json'
GUARD = ROOT / 'outputs/ap23l2-2026-10-27/protected-inputs.json'
GUARD_SHA = '6b8540b694a67a1fffd292486a7480728eca06f37f53f490f8df75fad2786bb1'
INPUT_SCHEMA = ROOT / 'schemas/candidates/ap23l2/administrative-input-v9.schema.json'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
WINDOW = {'from': '2026-08-29', 'to': '2027-12-31'}
DAY = timedelta(days=1)
TRACKING_FACTS = {'expectedService', 'entryIntoSphere', 'receiptHolidayRegime'}
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


def relative(path):
    value = Path(path)
    assert not value.is_absolute() and '..' not in value.parts and '.' not in value.parts
    assert '\\' not in path and '\x00' not in path
    return value


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
    # Gregorian computus, independently implemented with Python integer arithmetic.
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


def calendar_days(ident, calendars, year, seen=None):
    seen = set() if seen is None else set(seen)
    assert ident not in seen, 'Cyclic physical calendar'
    seen.add(ident)
    calendar = calendars[ident]
    result = {}
    for rule in calendar['rules']:
        if rule.get('effect', {}).get('type') != 'holiday':
            continue
        day = rule_day(rule, year)
        if day and inside(day, calendar['validity']) and inside(day, rule['validity']):
            result.setdefault(day, []).append(rule['ruleId'])
    for parent in calendar['inherits']:
        for day, ids in calendar_days(parent, calendars, year, seen).items():
            result.setdefault(day, []).extend(ids)
    return result


def period_boundary(spec, year):
    target = year + spec['yearOffset']
    if spec['type'] == 'fixedMonthDay':
        return date(target, spec['month'], spec['day'])
    assert spec['type'] == 'easterOffset'
    return easter(target) + spec['days'] * DAY


def profile_periods(profile, first, last):
    result = []
    for year in range(first.year - 1, last.year + 1):
        for period in profile['periods']:
            assert period['inclusive'] is True
            start = period_boundary(period['start'], year)
            end = period_boundary(period['end'], year)
            assert start <= end
            if end >= first and start <= last:
                result.append((start, end, period['periodId']))
    return result


def qualified(requirement, facts):
    if requirement['key'] not in facts:
        return False
    actual = facts[requirement['key']]
    if 'oneOf' in requirement:
        return any(exact(actual, value) for value in requirement['oneOf'])
    return exact(actual, requirement['value'])


def boundary(reason, outcome='qualificationBoundaryProposed', **extra):
    return {'outcome': outcome, 'reason': reason, **extra, 'calendarExport': False}


def outside():
    return boundary('outsideReferenceWindow', 'researchWindowBoundary')


class Candidate:
    def __init__(self, manifest, catalog, calendars):
        self.manifest = manifest
        self.catalog = catalog
        self.paths = index(catalog['paths'], 'pathId')
        self.policies = index(catalog['qualificationPolicies'], 'pathId')
        self.bindings = index(catalog['holidayBindings'], 'holidayBindingId')
        self.profiles = index(catalog['suspensionProfiles'], 'suspensionProfileId')
        self.eligibility = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
        self.laws = index(catalog['laws'], 'lawId')
        self.calendars = calendars
        self.research_paths = {row['researchRef']: row for row in catalog['paths']
                               if row.get('contractFamily') == 'qualifiedDayProcedureV9'}
        self.physical_cache = {}
        self.input_schema = load(INPUT_SCHEMA)

    def input_for(self, case):
        path = self.research_paths[case['path']]
        return {'path': path['pathId'], 'pathRevision': path['revision'],
                'authoritySeatCanton': self.laws[path['lawId']]['canton'],
                'trigger': case['trigger'], 'days': case['days'],
                'facts': copy.deepcopy(case['facts'])}

    def holidays(self, calendar_id, year):
        key = (calendar_id, year)
        if key not in self.physical_cache:
            self.physical_cache[key] = calendar_days(calendar_id, self.calendars, year)
        return self.physical_cache[key]

    def calculate(self, item):
        if type(item) is not dict or set(item) != {'path', 'pathRevision', 'authoritySeatCanton',
                                                 'trigger', 'days', 'facts'}:
            return boundary('inputContractInvalid')
        path = self.paths.get(item['path'])
        if not path or path.get('contractFamily') != 'qualifiedDayProcedureV9':
            return boundary('unknownResearchPath')
        if not exact(item['pathRevision'], path['revision']):
            return boundary('pathContextMismatch')
        law = self.laws[path['lawId']]
        if item['authoritySeatCanton'] != law['canton']:
            return boundary('pathContextMismatch')
        trigger = parse_day(item['trigger'])
        if trigger is None:
            return boundary('invalidResearchDate')
        facts = item['facts']
        if type(facts) is not dict:
            return boundary('inputContractInvalid')
        policy = self.policies[path['pathId']]
        duration = path['duration']
        opening = path['openingPolicy']
        allowed = {row['key'] for row in policy['requirements']}
        if opening['kind'] == 'aiQualifiedOrTrackingPost':
            allowed.update(row['key'] for row in opening['trackingRequirements'])
        if duration['kind'] == 'qualifiedLongerNoticeDays':
            allowed.update((duration['valueFact'], duration['ordinaryBaseFact'],
                            duration['qualificationFact']))
        # Existing research facts are all current input. Nothing is supplied by defaults.
        for requirement in policy['requirements']:
            if not qualified(requirement, facts):
                return boundary(requirement['reason'])
        if set(facts) - allowed:
            return boundary('unknownResearchFact')
        days = item['days']
        if type(days) is not int or days < 1 or days > 9007199254740991:
            return boundary('dayDurationNotSpecified')
        if duration['kind'] == 'statutoryDays':
            if days != duration['value']:
                return boundary('statutoryDurationMismatch')
        elif duration['kind'] == 'authorityOrderedDays':
            if not duration['minimum'] <= days <= duration['maximum']:
                reason = ('durationOutsideQualifiedRange'
                          if duration['boundMeaning'] == 'statutoryMaximumForCurrentOrder'
                          else 'orderedDurationOutsideTechnicalGuard')
                return boundary(reason)
        else:
            assert duration['kind'] == 'qualifiedLongerNoticeDays'
            current = facts.get(duration['valueFact'])
            base = facts.get(duration['ordinaryBaseFact'])
            if (type(current) is not int or current != days or type(base) is not int
                    or base not in duration['ordinaryBaseAllowed']
                    or facts.get(duration['qualificationFact']) != duration['qualifiedValue']
                    or current <= max(base, 30)
                    or not duration['minimum'] <= current <= duration['maximum']):
                return boundary('noticeDurationNotQualified')
        # Independent direct validation of the finite input vocabulary, not a JS validator.
        # Qualification-specific reasons intentionally precede this type/enum boundary.
        fact_properties = self.input_schema['properties']['facts']['properties']
        if any(key not in fact_properties or not any(exact(value, item)
               for item in fact_properties[key]['enum']) for key, value in facts.items()):
            return boundary('inputContractInvalid')
        binding = self.bindings[path['holidayBindingId']]
        eligibility = self.eligibility[path['pathId']]
        selection = binding['calendarSelection']
        assert selection['kind'] == 'fixedAuthoritySeat'
        calendar_id = selection['calendarId']
        calendar = self.calendars[calendar_id]
        supplement = binding['proceduralCalendarSupplement']
        if supplement['kind'] != 'none':
            assert supplement['kind'] == 'szSchwyzMartinstag'
            assert supplement['effect'] == 'endShiftOnly'
            assert law['canton'] == 'SZ' and opening['kind'] == 'qualifiedCurrentTrigger'
            if facts.get('authorityMunicipality') != supplement['authorityMunicipality']:
                return boundary('SZ-O1')
        temporal = path['temporalBinding']
        common_intervals = [self.manifest['coverage'], temporal['sourceCoverage'],
                            temporal['calculationCoverage'], eligibility['calculationCoverage'],
                            calendar['validity']]
        if supplement['kind'] != 'none':
            common_intervals.append(supplement['coverage'])
        ancestor_ids = set()

        def add_ancestors(ident):
            assert ident not in ancestor_ids
            ancestor_ids.add(ident)
            for parent in self.calendars[ident]['inherits']:
                add_ancestors(parent)

        add_ancestors(calendar_id)
        common_intervals.extend(self.calendars[ident]['validity'] for ident in ancestor_ids)
        evaluated = set()

        def covered(day):
            if not all(inside(day, interval) for interval in common_intervals):
                return False
            spans = [row for row in path['normTimeline'] if inside(day, row['interval'])]
            if len(spans) != 1:
                return False
            evaluated.add(day)
            return True

        if not inside(trigger, temporal['caseCoverage']) or not inside(trigger, eligibility['caseCoverage']) or not covered(trigger):
            return outside()
        legal_opening = trigger
        if opening['kind'] == 'aiQualifiedOrTrackingPost':
            assert opening['holidayBinding'] == 'sameAsPath'
            mode = facts[opening['factKey']]
            if mode == opening['trackingMode']:
                for requirement in opening['trackingRequirements']:
                    if not qualified(requirement, facts):
                        return boundary(requirement['reason'])
                assert opening['trackingTransformation'] == 'nextWorkingDayIfNonWorkingReceipt'
                # This is the physical AI calendar only, never the SZ end-only supplement.
                while legal_opening.weekday() >= 5 or legal_opening in self.holidays(calendar_id, legal_opening.year):
                    legal_opening += DAY
                    if not covered(legal_opening):
                        return outside()
            else:
                assert mode == opening['qualifiedMode']
                assert opening['qualifiedTransformation'] == 'none'
        else:
            assert opening['kind'] == 'qualifiedCurrentTrigger'
            assert opening['triggerKind'] == 'qualifiedLegalOpening'
            assert opening['transformation'] == 'none'
        if not covered(legal_opening):
            return outside()
        profile = self.profiles[path['suspensionSelection']['suspensionProfileId']]
        intervals = profile_periods(profile, trigger, date.fromisoformat(temporal['calculationCoverage']['to']))

        def paused(day):
            return [ident for first, last, ident in intervals if first <= day <= last]

        # Enumerate all candidate-covered days, then select the nth nonpaused day.
        # Weekends and holidays count normally within the running period.
        upper = date.fromisoformat(temporal['calculationCoverage']['to'])
        possible = [legal_opening + offset * DAY
                    for offset in range(1, (upper - legal_opening).days + 1)]
        running = [day for day in possible if not paused(day)]
        if len(running) < days:
            return outside()
        ordinary_start, first_counted, nominal = legal_opening + DAY, running[0], running[days - 1]
        counted_span = [day for day in possible if day <= nominal]
        if not all(covered(day) for day in counted_span):
            return outside()
        extra_dates = set(supplement.get('dates', []))

        def working_end(day):
            return (day.weekday() < 5 and day not in self.holidays(calendar_id, day.year)
                    and day.isoformat() not in extra_dates)

        admissible = [day for day in [nominal] + [d for d in possible if d > nominal] if working_end(day)]
        if not admissible:
            return outside()
        shifted = admissible[0]
        shift_span = [nominal + n * DAY for n in range((shifted - nominal).days + 1)]
        if not all(covered(day) for day in shift_span):
            return outside()
        first_paused_shift = next((day for day in shift_span if day > nominal and paused(day)), None)
        if path['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension' and first_paused_shift:
            return boundary('L1-END-SUSPENSION', 'unresolvedBoundaryProposed',
                            nominalEnd=nominal.isoformat(), ordinaryShiftEnd=shifted.isoformat(),
                            firstSuspendedShiftDate=first_paused_shift.isoformat())
        assert path['endShiftGuard'] in ('none', 'blockWhenEnteringApplicableSuspension')
        spans = []
        for row in path['normTimeline']:
            touched = sorted(day for day in evaluated if inside(day, row['interval']))
            if touched:
                spans.append({'researchBindingId': row['researchBindingId'],
                              'from': touched[0].isoformat(), 'to': touched[-1].isoformat(),
                              'evaluatedDays': len(touched), 'sourceRefs': copy.deepcopy(row['sourceRefs'])})
        return {'outcome': 'datedResearchValue', 'legalOpening': legal_opening.isoformat(),
                'ordinaryStart': ordinary_start.isoformat(), 'firstCountedDay': first_counted.isoformat(),
                'nominalEnd': nominal.isoformat(), 'end': shifted.isoformat(),
                'skippedDays': sum(bool(paused(day)) for day in counted_span),
                'endShiftDays': (shifted - nominal).days, 'calendarExport': False,
                'independentProvenance': {'pathId': path['pathId'], 'pathRevision': path['revision'],
                                          'calendarId': calendar_id,
                                          'projectionId': selection['projectionId'],
                                          'suspensionProfileId': profile['suspensionProfileId'],
                                          'supplementKind': supplement['kind'],
                                          'supplementApplied': any(day.isoformat() in extra_dates for day in shift_span),
                                          'normSpans': spans}}


def compare_expected(actual, expected, label):
    for key, value in expected.items():
        assert key in actual and exact(actual[key], value), (label, key, value, actual.get(key))
    assert actual['calendarExport'] is False
    if actual['outcome'] != 'datedResearchValue':
        assert 'end' not in actual, (label, 'nondefinitive end')


def byte_and_semantic_checks():
    assert evidence(GUARD)['sha256'] == GUARD_SHA
    guard = load(GUARD)
    assert len(guard['files']) == 9048 and guard['workPackage'] == 'AP23L2'
    assert guard['l1ProfessionallyAccepted'] is True
    for flag in ('formatDecision', 'productCodeChangePermission', 'runtimeActivation',
                 'sourceReleaseApproved', 'releaseBuildPerformed', 'commitCreated',
                 'sourcePushPerformed', 'operatingChanges'):
        assert guard[flag] is False

    def protected(path):
        relative(path)
        raw = (ROOT / path).read_bytes()
        assert sha(raw) == guard['files'][path], 'Changed protected input ' + path
        return raw

    manifest0 = json.loads(protected((BASE / 'manifest.json').relative_to(ROOT).as_posix()))
    manifest = load(BUNDLE / 'manifest.json')
    integrity = load(OUT / 'candidate-integrity.json')
    assert manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '16.0.0'
    assert manifest['releaseStatus'] == 'candidate'
    assert len(manifest['artifacts']) == len(manifest0['artifacts']) == 44
    assert manifest['calendarIds'] == manifest0['calendarIds'] and len(manifest['calendarIds']) == 35
    ext = manifest['extensions']['steimer.local-reference']
    assert ext['structuralContractProbeOnly'] is True
    for key in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'):
        assert ext[key] is False
    assert ext['startGuardSha256'] == GUARD_SHA
    assert ext['acceptedResearchSha256'] == guard['files'][SUITE.relative_to(ROOT).as_posix()]
    descriptors = index(manifest['artifacts'], 'path')
    baseline_descriptors = index(manifest0['artifacts'], 'path')
    assert set(descriptors) == set(baseline_descriptors)
    calendars = {}
    byte_rows = []
    for path, descriptor in descriptors.items():
        relative(path)
        raw = (BUNDLE / path).read_bytes()
        assert sha(raw) == descriptor['sha256'] and len(raw) == descriptor['byteLength'], path
        actual = json.loads(raw)
        if descriptor['role'] == 'calendar':
            assert actual['formatVersion'] == '3.0.0'
            calendars[actual['calendarId']] = actual
        row = {'path': path, 'sha256': sha(raw), 'byteLength': len(raw), 'preserved': path != ADMIN}
        if path != ADMIN:
            old_raw = protected((BASE / path).relative_to(ROOT).as_posix())
            assert raw == old_raw
            assert descriptor == baseline_descriptors[path]
        byte_rows.append(row)
    assert len(calendars) == 35
    assert evidence(BUNDLE / 'manifest.json') == integrity['manifest']
    assert evidence(OUT / 'source-crosswalk.json') == integrity['sourceCrosswalk']
    assert evidence(OUT / 'research-map.json') == integrity['researchMap']
    for row in integrity['artifacts']:
        assert evidence(ROOT / relative(row['path'])) == row
    catalog = load(BUNDLE / ADMIN)
    old = json.loads(protected((BASE / ADMIN).relative_to(ROOT).as_posix()))
    assert catalog['formatVersion'] == '9.0.0' and catalog['runtimeActive'] is False
    assert catalog['contractStatus'] == catalog['contractDecision']['status'] == 'proposed'
    assert catalog['contractDecision'] == {'id': 'DEC-2026-041', 'status': 'proposed', 'on': None}
    assert len(old['paths']) == 165 and len(catalog['paths']) == 196
    preservation = []
    for field, key in [('paths', 'pathId'), ('qualificationPolicies', 'pathId'),
                       ('holidayBindings', 'holidayBindingId'), ('laws', 'lawId'),
                       ('sources', 'sourceId'), ('suspensionProfiles', 'suspensionProfileId'),
                       ('excludedPaths', 'exclusionId'), ('preserved', 'path')]:
        actual = index(catalog[field], key)
        for row in old[field]:
            assert actual[row[key]] == row, 'Changed old ' + field + '/' + row[key]
        preservation.append({'field': field, 'unchangedObjects': len(old[field])})
    eligible = index(catalog['releaseBinding']['pathEligibility'], 'pathId')
    for row in old['releaseBinding']['pathEligibility']:
        assert eligible[row['pathId']] == row
    preservation.append({'field': 'releaseBinding.pathEligibility', 'unchangedObjects': 165})
    for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'):
        assert catalog['releaseBinding'][key] is None
    assert catalog['releaseBinding']['status'] == 'candidate'
    assert catalog['releaseBinding']['targetComponentRefs'] == []
    runner = Candidate(manifest, catalog, calendars)
    assert len(runner.research_paths) == 31
    new = list(runner.research_paths.values())
    assert Counter(runner.laws[row['lawId']]['canton'] for row in new) == {'AI': 18, 'SZ': 13}
    assert Counter(row['openingPolicy']['kind'] for row in new) == {'aiQualifiedOrTrackingPost': 16, 'qualifiedCurrentTrigger': 15}
    for path in new:
        ident = path['pathId']
        policy, binding, eligibility = runner.policies[ident], runner.bindings[path['holidayBindingId']], eligible[ident]
        profile = runner.profiles[path['suspensionSelection']['suspensionProfileId']]
        assert eligibility['pathRevision'] == path['revision'] == policy['pathRevision'] == 1
        for name, value in [('pathSha256', path), ('holidayBindingSha256', binding),
                            ('suspensionSelectionSha256', path['suspensionSelection']),
                            ('openingPolicySha256', path['openingPolicy']),
                            ('calendarSelectionSha256', binding['calendarSelection']),
                            ('proceduralCalendarSupplementSha256', binding['proceduralCalendarSupplement']),
                            ('durationPolicySha256', path['duration']), ('qualificationPolicySha256', policy)]:
            assert eligibility[name] == digest(value), (ident, name)
        assert policy['pathSha256'] == digest(path)
        assert eligibility['suspensionProfiles'] == [{'suspensionProfileId': profile['suspensionProfileId'], 'sha256': digest(profile)}]
        assert eligibility['caseCoverage'] == eligibility['calculationCoverage'] == WINDOW
        assert path['temporalBinding']['caseCoverage'] == path['temporalBinding']['calculationCoverage'] == path['temporalBinding']['sourceCoverage'] == WINDOW
        assert eligibility['status'] == 'candidate' and eligibility['targetComponentRefs'] == []
        assert eligibility['sourceReviewRef'] is None and eligibility['referenceSuiteRef'] is None
        for ref in binding['physicalSource']['references']:
            descriptor = descriptors[ref['path']]
            assert all(ref[key] == descriptor[key] for key in ('role', 'contentId', 'path', 'sha256'))
    holiday = load(BUNDLE / HOLIDAY)
    # Physical 499-rule inventory is not enlarged by administrative-only Martinstag dates.
    holiday_rows = holiday['data']['rules'] + holiday['activation']['supplementalRules']
    assert len(holiday_rows) == 499
    projections = index(holiday['activation']['projections'], 'id')
    for path in new:
        binding = runner.bindings[path['holidayBindingId']]
        selection = binding['calendarSelection']
        projection = projections[selection['projectionId']]
        assert projection['calendarId'] == selection['calendarId']
        assert selection['calendarId'] in runner.calendars
    supplements = [row['proceduralCalendarSupplement'] for row in catalog['holidayBindings']
                   if row.get('bindingVersion') == '9.0.0']
    assert {'kind': 'none'} in supplements
    sz_extra = next(row for row in supplements if row['kind'] != 'none')
    assert sz_extra['dates'] == ['2026-11-11', '2027-11-11']
    assert sz_extra['authorityMunicipality'] == 'Schwyz' and sz_extra['coverage'] == WINDOW
    assert sz_extra['effect'] == 'endShiftOnly'
    crosswalk = load(OUT / 'source-crosswalk.json')
    assert crosswalk['mappingOnly'] is True and len(crosswalk['sourceRows']) == 31
    operative = [row for row in crosswalk['sourceRows'] if row['catalogSourceId'] is not None]
    assert len(operative) == crosswalk['operativeCatalogSources'] == 17
    assert Counter(row['canton'] for row in operative) == {'AI': 8, 'SZ': 9}
    all_sources = runner.catalog['sources']
    source_ids = set(index(all_sources, 'sourceId'))
    source_evidence = []
    for row in crosswalk['sourceRows']:
        assert row['sourcePromotion'] is False
        if row['catalogSourceId']:
            assert row['catalogSourceId'] in source_ids
        else:
            assert row['kind'] == 'evidenceOnly'
        for item in row['evidence']:
            raw = protected(item['path'])
            assert sha(raw) == item['sha256'] and len(raw) == item['byteLength']
            source_evidence.append(item)
    assert len(source_evidence) == 31
    for path in new:
        refs = path['sourceRefs'] + path['openingPolicy']['sourceRefs']
        refs += [ref for span in path['normTimeline'] for ref in span['sourceRefs']]
        assert refs and all(ref['sourceId'] in source_ids for ref in refs)
        current = date.fromisoformat(WINDOW['from'])
        while current <= date.fromisoformat(WINDOW['to']):
            assert sum(inside(current, row['interval']) for row in path['normTimeline']) == 1
            current += DAY
    suite = json.loads(protected(SUITE.relative_to(ROOT).as_posix()))
    assert len(suite['cases']) == 83
    for source_model in suite['sourceModels']:
        assert sha(protected(source_model['path'])) == source_model['sha256']
    return runner, suite, {'guard': evidence(GUARD), 'manifest': evidence(BUNDLE / 'manifest.json'),
                           'catalog': evidence(BUNDLE / ADMIN), 'suite': evidence(SUITE),
                           'artifactBytes': byte_rows, 'preservedObjects': preservation,
                           'operativeSourceCount': len(operative), 'sourceEvidence': source_evidence,
                           'physicalCalendars': 35, 'holidayRules': 499,
                           'administrativeOnlySupplementDates': sz_extra['dates']}


def independent_calendar_probes(runner):
    """Static calendar contrasts, resolved only through real RuleCalendar3 objects."""
    expectations = [
        ('ai-inner-mauritius', 'ap22-ai-f507435d8aa8', '2026-09-22', True),
        ('ai-outer-not-mauritius-contrast-only', 'ap22-ai-5d4e5a68e106', '2026-09-22', False),
        ('ai-stephen-2026-conditional-omission', 'ap22-ai-f507435d8aa8', '2026-12-26', False),
        ('ai-stephen-2027-present', 'ap22-ai-f507435d8aa8', '2027-12-26', True),
        ('ai-jan2-not-raw-holiday', 'ap22-ai-f507435d8aa8', '2027-01-02', False),
        ('ai-easter-2027', 'ap22-ai-f507435d8aa8', '2027-03-28', True),
        ('ai-corpus-2027', 'ap22-ai-f507435d8aa8', '2027-05-27', True),
        ('sz-base-not-martin-2026', 'ap22-sz-ec9f2c557fe4', '2026-11-11', False),
        ('sz-base-not-martin-2027', 'ap22-sz-ec9f2c557fe4', '2027-11-11', False),
        ('sz-joseph-2027', 'ap22-sz-ec9f2c557fe4', '2027-03-19', True),
        ('sz-jan2-not-raw-holiday', 'ap22-sz-ec9f2c557fe4', '2027-01-02', False),
        ('sz-federal-holiday-2027', 'ap22-sz-ec9f2c557fe4', '2027-08-01', True),
    ]
    rows = []
    for ident, calendar_id, value, expected in expectations:
        day = date.fromisoformat(value)
        ids = runner.holidays(calendar_id, day.year).get(day, [])
        assert bool(ids) == expected, ident
        rows.append({'id': ident, 'calendarId': calendar_id, 'date': value,
                     'expectedPhysicalHoliday': expected, 'actualRuleIds': ids,
                     'comparisonOnlyNotAdditionalPositiveBinding': 'contrast-only' in ident})
    return rows


def independent_probes(runner, suite):
    seeds = {case['id']: runner.input_for(case) for case in suite['cases']}
    rows = []

    def add(ident, seed, expected, **changes):
        item = copy.deepcopy(seeds[seed])
        facts = changes.pop('facts', {})
        remove = changes.pop('remove', ())
        item.update(changes)
        item['facts'].update(facts)
        for key in remove:
            item['facts'].pop(key, None)
        actual = runner.calculate(item)
        compare_expected(actual, expected, ident)
        rows.append({'id': ident, 'input': item, 'expected': expected, 'actual': actual})

    dated = lambda end, **extra: {'outcome': 'datedResearchValue', 'end': end, **extra}
    blocked = lambda reason: {'outcome': 'qualificationBoundaryProposed', 'reason': reason}
    add('PY-L2-QUALIFIED-NO-REBASE', 'L1-AI-R21', dated('2026-09-29', legalOpening='2026-09-19'))
    add('PY-L2-TRACKING-SATURDAY', 'L1-AI-R22', dated('2026-10-01', legalOpening='2026-09-21'))
    add('PY-L2-TRACKING-MAURITIUS', 'L1-AI-R23', dated('2026-09-30', legalOpening='2026-09-23'))
    add('PY-L2-TRACKING-DURING-RECESS', 'L1-AI-R25', dated('2027-01-12', legalOpening='2026-12-28'))
    add('PY-L2-NOTICE31-INTERNAL', 'L1-AI-R16', dated('2026-11-02'), days=31,
        facts={'actualLongerInstructionDays': 31})
    add('PY-L2-NOTICE31-COURT', 'L1-AI-R18', dated('2026-11-02'), days=31,
        facts={'actualLongerInstructionDays': 31})
    add('PY-L2-NOTICE30-NOT-LONGER', 'L1-AI-R16', blocked('noticeDurationNotQualified'), days=30,
        facts={'actualLongerInstructionDays': 30})
    add('PY-L2-NOTICE-DAYS-MISMATCH', 'L1-AI-R16', blocked('noticeDurationNotQualified'), days=44)
    add('PY-L2-NOTICE-VALUE-MISSING', 'L1-AI-R16', blocked('noticeDurationNotQualified'),
        remove=('actualLongerInstructionDays',))
    add('PY-L2-NOTICE-WRONG-BASE', 'L1-AI-R16', blocked('AI-B-NOTICE-BASE'),
        facts={'ordinaryStatutoryDays': 7})
    add('PY-L2-ORDER-ONE-DAY-NOT-TEN', 'L1-SZ-R08', dated('2026-12-24'), days=1)
    add('PY-L2-ORDER-TEN-MAX', 'L1-SZ-R08', dated('2027-01-04'), days=10)
    add('PY-L2-ORDER-ELEVEN-REFUSED', 'L1-SZ-R08', blocked('durationOutsideQualifiedRange'), days=11)
    add('PY-L2-ORDER-BOOL-REFUSED', 'L1-SZ-R08', blocked('dayDurationNotSpecified'), days=True)
    add('PY-L2-SZ-JAN7-PAUSED', 'L1-SZ-R13', dated('2027-01-08'))
    add('PY-L2-SZ-JAN7-EXEMPT', 'L1-SZ-R14', dated('2027-01-07'))
    add('PY-L2-MARTINSTAG-2026', 'L1-SZ-R09', dated('2026-11-12'))
    add('PY-L2-MARTINSTAG-2027', 'L1-SZ-R09', dated('2027-11-12'), trigger='2027-11-01')
    add('PY-L2-SZ-OTHER-SEAT', 'L1-SZ-R09', blocked('SZ-O1'), facts={'authorityMunicipality': 'Ingenbohl'})
    add('PY-L2-SZ-SEAT-MISSING', 'L1-SZ-R09', blocked('SZ-O1'), remove=('authorityMunicipality',))
    for ident in ('L1-AI-R49', 'L1-AI-R50'):
        add('PY-L2-NO-TRACKING-' + ident, ident, next(case['expected'] for case in suite['cases'] if case['id'] == ident))
    # One missing and one wrong typed current value for every new requirement.
    for path in runner.research_paths.values():
        case = next(case for case in suite['cases'] if case['path'] == path['researchRef']
                    and case['expected']['outcome'] == 'datedResearchValue')
        for requirement in runner.policies[path['pathId']]['requirements']:
            for suffix, kwargs in [('missing', {'remove': (requirement['key'],)}),
                                   ('wrong', {'facts': {requirement['key']: {'unqualified': True}}})]:
                add('PY-L2-REQ-' + path['pathId'] + '-' + requirement['key'] + '-' + suffix,
                    case['id'], blocked(requirement['reason']), **kwargs)
    for name in sorted(TRACKING_FACTS):
        path = runner.research_paths['AI-ADMIN-ORDERED']
        req = next(row for row in path['openingPolicy']['trackingRequirements'] if row['key'] == name)
        add('PY-L2-TRACK-MISSING-' + name, 'L1-AI-R22', blocked(req['reason']), remove=(name,))
    return rows


def mutation_sensitivity(runner, suite):
    """Independent evaluator must notice semantic mutations, not just fixture labels."""
    checks = []

    def changed(name, case_id, mutate):
        catalog = copy.deepcopy(runner.catalog)
        mutate(catalog)
        altered = Candidate(runner.manifest, catalog, runner.calendars)
        case = next(row for row in suite['cases'] if row['id'] == case_id)
        original = runner.calculate(runner.input_for(case))
        actual = altered.calculate(altered.input_for(case))
        assert any(original.get(key) != actual.get(key) for key in RESULT_KEYS), name
        checks.append({'id': name, 'caseId': case_id,
                       'original': {key: original[key] for key in RESULT_KEYS if key in original},
                       'mutated': {key: actual[key] for key in RESULT_KEYS if key in actual},
                       'differenceDetected': True})

    def winter2(catalog):
        profile = next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId'] == 'sz-three')
        next(row for row in profile['periods'] if row['periodId'] == 'sz-winter')['end']['day'] = 2

    def no_martin(catalog):
        binding = next(row for row in catalog['holidayBindings'] if row['holidayBindingId'] == 'sz-qualified-authority-seat')
        binding['proceduralCalendarSupplement'] = {'kind': 'none'}

    def no_ai_pause(catalog):
        profile = next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId'] == 'ai-three')
        profile['periods'] = []

    changed('SZ-JAN2-INSTEAD-OF-JAN7', 'L1-SZ-R13', winter2)
    changed('SZ-END-SUPPLEMENT-REMOVED', 'L1-SZ-R09', no_martin)
    changed('AI-COURT-SUSPENSION-REMOVED', 'L1-AI-R27', no_ai_pause)
    return checks


def compare_node(runner, suite, results, qa_path):
    qa = load(qa_path)
    assert qa['status'] == 'passed'
    assert qa['fixtureSha256'] == evidence(SUITE)['sha256']
    assert qa['manifestSha256'] == evidence(BUNDLE / 'manifest.json')['sha256']
    assert qa['catalogSha256'] == evidence(BUNDLE / ADMIN)['sha256']
    rows = index(qa['results'], 'id')
    assert set(rows) == {case['id'] for case in suite['cases']} and len(rows) == 83
    counts = Counter()
    for row in results:
        node = rows[row['id']]
        assert node['input'] == row['input'], (row['id'], 'Node fixture input changed')
        assert node['expected'] == row['expected'], (row['id'], 'Node expected fixture changed')
        actual = node['actual']
        compare_expected({**actual, 'calendarExport': False}, row['expected'], row['id'] + ' Node')
        export_keys = [key for key in ('calendarExport', 'calendarExportAllowed', 'exportAllowed') if key in actual]
        assert export_keys and all(actual[key] is False for key in export_keys), (row['id'], 'Node export boundary')
        for key in RESULT_KEYS:
            if key in actual and key in row['actual']:
                assert exact(actual[key], row['actual'][key]), (row['id'], 'Node/Python', key, actual[key], row['actual'][key])
                counts[key] += 1
        if actual['outcome'] == 'datedResearchValue':
            for key in ('legalOpening', 'ordinaryStart', 'nominalEnd', 'end'):
                assert key in actual, (row['id'], 'Missing independently comparable Node field ' + key)
            independent = row['actual']['independentProvenance']
            assert actual['calendar'] == independent['calendarId']
            assert actual['temporalBindings'] == [span['researchBindingId'] for span in independent['normSpans']]
            path = runner.paths[row['input']['path']]
            eligibility = runner.eligibility[path['pathId']]
            provenance = actual['provenance']
            for key in ('pathId', 'pathSha256', 'qualificationPolicySha256', 'durationPolicySha256',
                        'openingPolicySha256', 'holidayBindingId', 'holidayBindingSha256',
                        'calendarSelectionSha256', 'proceduralCalendarSupplementSha256',
                        'suspensionSelectionSha256'):
                assert provenance[key] == eligibility[key], (row['id'], 'provenance', key)
            assert provenance['baseCalendarId'] == independent['calendarId']
            assert provenance['baseProjectionId'] == independent['projectionId']
            assert provenance['suspensionProfileId'] == independent['suspensionProfileId']
            profile = runner.profiles[independent['suspensionProfileId']]
            assert provenance['suspensionProfileSha256'] == digest(profile)
            assert provenance['physicalInput'] == row['input']['trigger']
            assert provenance['qualifiedOpening'] == row['actual']['legalOpening']
            assert provenance['evaluatedNormSegments'] == [segment for segment in path['normTimeline']
                   if segment['researchBindingId'] in actual['temporalBindings']]
            counts['boundProvenance'] += 1
        row['nodeSemanticComparison'] = 'equal'
    probes = []
    for row in qa.get('syntheticProbeResults', []):
        item = row.get('input', row.get('researchInput'))
        assert item is not None, 'Node synthetic probe lacks full input'
        actual = runner.calculate(item)
        if 'expected' in row:
            compare_expected(actual, row['expected'], row.get('id', 'Node synthetic'))
        for key in RESULT_KEYS:
            if key in actual and key in row['actual']:
                assert exact(actual[key], row['actual'][key]), (row.get('id'), 'Node synthetic/Python', key)
        if actual['outcome'] == 'datedResearchValue':
            assert row['actual']['calendar'] == actual['independentProvenance']['calendarId']
            assert row['actual']['temporalBindings'] == [span['researchBindingId']
                   for span in actual['independentProvenance']['normSpans']]
        probes.append({'id': row.get('id'), 'input': item, 'actual': actual, 'nodeSemanticComparison': 'equal'})
    return {'evidence': evidence(qa_path), 'matchedFixtures': 83,
            'comparedFieldCounts': dict(sorted(counts.items())), 'syntheticProbeComparisons': probes}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--candidate-only', action='store_true', help='Preliminary run without Node QA, never a final pass')
    args = parser.parse_args()
    runner, suite, binding = byte_and_semantic_checks()
    results = []
    for case in suite['cases']:
        item = runner.input_for(case)
        assert item['facts'] == case['facts'], 'No annotation removal or default inference'
        actual = runner.calculate(item)
        compare_expected(actual, case['expected'], case['id'])
        results.append({'id': case['id'], 'input': item, 'expected': case['expected'], 'actual': actual})
    probes = independent_probes(runner, suite)
    calendar_probes = independent_calendar_probes(runner)
    mutations = mutation_sensitivity(runner, suite)
    qa_path = OUT / 'QA-AP23L2.json'
    node = None if args.candidate_only else compare_node(runner, suite, results, qa_path)
    report = {'workPackage': 'AP23L2', 'status': 'candidate-only-passed-node-pending' if args.candidate_only else 'passed',
              'independentImplementation': 'Python standard library, actual L2 candidate byte and object readers, Gregorian computus, complete date enumeration',
              'importsProductCode': False, 'importsNodeCode': False, 'importsResearchOracle': False,
              'usesResearchCalendarOrPathModel': False, 'annotationRemoval': False, 'implicitCaseFacts': False,
              'runtimeActivation': False, 'sourceReleaseApproved': False, 'calendarExportEnabled': False,
              'contractDecision': {'id': 'DEC-2026-041', 'status': 'proposed'},
              'binding': {**binding, 'inputVocabularySchema': evidence(INPUT_SCHEMA)},
              'counts': {'originalReferences': len(results), 'referenceOutcomes': dict(Counter(row['actual']['outcome'] for row in results)),
                         'independentProbes': len(probes), 'mutationSensitivities': len(mutations),
                         'physicalCalendarProbes': len(calendar_probes),
                         'oldPathsPreserved': 165, 'unchangedNonAdministrativeArtifacts': 43},
              'results': results, 'independentProbeResults': probes,
              'physicalCalendarProbeResults': calendar_probes,
              'mutationSensitivity': mutations, 'nodeComparison': node,
              'limitations': ['Independent arithmetic and byte/object checks do not replace the Node JSON Schema or native rejection tests.',
                              'No legal reopening, source-release approval, native activation, L3 implementation, product build, export or operating test.']}
    if args.write:
        assert not args.candidate_only, 'Do not publish a preliminary report as final independent verification'
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'status': report['status'], **report['counts'],
                      'report': evidence(REPORT) if args.write else None}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
