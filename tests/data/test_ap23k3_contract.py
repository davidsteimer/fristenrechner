# SPDX-License-Identifier: AGPL-3.0-only
"""Independent native K3 schema, actual-byte and accepted-meaning checks."""
import copy
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import ValidationError
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / 'data/candidates/2026-10-27-ap23k3'
ACCEPTED = ROOT / 'outputs/ap23k2-candidate-2026-10-27/bundle'
OLD = ROOT / 'data/candidates/2026-10-27-ap23j3'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
SOCIAL = 'social-procedures/ch-social-procedures.json'
PREFIX = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/'

def read(path):
    return json.loads(path.read_bytes())

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def digest(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())

SCHEMAS = {schema['$id']: schema for path in (ROOT / 'schemas').rglob('*.json') if '$id' in (schema := read(path))}
REGISTRY = Registry().with_resources((ident, Resource.from_contents(schema)) for ident, schema in SCHEMAS.items())

def validate(value, schema):
    Draft202012Validator(schema, registry=REGISTRY, format_checker=FormatChecker()).validate(value)

def counterchecker():
    spec = importlib.util.spec_from_file_location('independent_k3_countercheck', ROOT / 'scripts/check_ap23k3_independent.py')
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

def meaning(catalog, manifest=None):
    """Only the approved contract metadata and actual release-byte references may evolve."""
    manifest = read(BUNDLE / 'manifest.json') if manifest is None else manifest
    accepted = read(ACCEPTED / ADMIN)
    expected = copy.deepcopy(accepted)
    expected['$schema'] = PREFIX + 'administrative-procedure-catalog-v8.schema.json'
    expected['contractStatus'] = 'approved'
    expected['contractDecision'] = {'id': 'DEC-2026-040', 'status': 'approved', 'on': '2026-10-27'}
    decision = 'docs/entscheidungen/DEC-2026-040-beschluss.md'
    acceptance = 'docs/fachrecht/abnahme-ap23k2.md'
    expected['review']['basis'] = ('K1-A bis K1-G fachlich und AP23K2 technisch abgenommen. DEC-2026-040 beschlossen. Beschluss '
        + decision + ', SHA-256 ' + sha((ROOT / decision).read_bytes()) + '. Abnahme ' + acceptance + ', SHA-256 '
        + sha((ROOT / acceptance).read_bytes()) + '. Keine Quellenrelease- oder Betriebsfreigabe.')
    expected['review']['sourceReview'] = ('Abgenommene BS-/BL-Verwendungen und übrige Fachobjekte unverändert. Tatsächliche Zielbytes neu gebunden. '
                                         'Gemeinsame Quellenreleasefreigabe steht aus.')
    for binding in expected['holidayBindings']:
        physical = binding.get('physicalSource', binding.get('physicalBaseline'))
        physical['releaseId'] = manifest['releaseId']
    bindings = {binding['holidayBindingId']: binding for binding in expected['holidayBindings']}
    for entry in expected['releaseBinding']['pathEligibility']:
        entry['holidayBindingSha256'] = digest(bindings[entry['holidayBindingId']])
    assert digest(catalog) == digest(expected), 'Changed accepted administrative meaning or unapproved native metadata'
    return True

def eligibility(catalog):
    paths = {row['pathId']: row for row in catalog['paths']}
    policies = {row['pathId']: row for row in catalog['qualificationPolicies']}
    entries = {row['pathId']: row for row in catalog['releaseBinding']['pathEligibility']}
    profiles = {row['suspensionProfileId']: row for row in catalog['suspensionProfiles']}
    bindings = {row['holidayBindingId']: row for row in catalog['holidayBindings']}
    assert len(paths) == len(policies) == len(entries) == 165
    for ident, path in paths.items():
        policy, entry, binding = policies[ident], entries[ident], bindings[path['holidayBindingId']]
        assert entry['status'] == 'candidate' and entry['pathRevision'] == policy['pathRevision'] == path['revision']
        assert entry['pathSha256'] == policy['pathSha256'] == digest(path)
        assert entry['qualificationPolicySha256'] == digest(policy)
        assert entry['holidayBindingSha256'] == digest(binding)
        if 'suspensionSelection' in path:
            selection = path['suspensionSelection']
            ids = [selection['suspensionProfileId']] if selection['kind'] == 'fixed' else [row['suspensionProfileId'] for row in selection['cases']]
            assert entry['suspensionSelectionSha256'] == digest(selection)
            assert entry['suspensionProfiles'] == [{'suspensionProfileId': profile, 'sha256': digest(profiles[profile])} for profile in sorted(set(ids))]
        else:
            assert entry['suspensionProfileId'] == path['suspensionProfileId']
            assert entry['suspensionProfileSha256'] == digest(profiles[path['suspensionProfileId']])
        if 'openingPolicy' in path:
            assert entry['openingPolicySha256'] == digest(path['openingPolicy'])
        if path.get('contractFamily') == 'qualifiedDayProcedureV8':
            assert entry['calendarSelectionSha256'] == digest(binding['calendarSelection'])
            assert entry['annualEndShiftPolicySha256'] == digest(binding['annualEndShiftPolicy'])
        assert entry['targetComponentRefs'] == [] and entry['sourceReviewRef'] is None
    return True

def actual_bindings(manifest, catalog, calendars):
    descriptors = {row['contentId']: row for row in manifest['artifacts']}
    projections = {row['id']: row for row in read(BUNDLE / HOLIDAY)['activation']['projections']}
    def closure(ident, chain=()):
        assert ident in calendars and ident not in chain, 'Missing or cyclic actual calendar parent'
        return {ident}.union(*(closure(parent, chain + (ident,)) for parent in calendars[ident]['inherits']))
    for binding in catalog['holidayBindings']:
        physical = binding.get('physicalSource', binding.get('physicalBaseline'))
        assert physical['releaseId'] == manifest['releaseId']
        if 'physicalSource' in binding:
            selection = binding['calendarSelection']
            if selection['kind'] == 'fixedAuthoritySeat':
                ids = {selection['calendarId']}
            else:
                ids = {variant['calendarId'] for terminal in selection['terminals'] for variant in terminal['variants']}
                ids.update(projections[variant['alternativeProjectionId']]['calendarId']
                           for terminal in selection['terminals'] for variant in terminal['variants'] if variant['alternativeProjectionId'] is not None)
        else:
            ids = {physical['calendarId']}
        required = set().union(*(closure(ident) for ident in ids)) | {'ch-holiday-catalog'}
        refs = physical['references']
        assert len({row['contentId'] for row in refs}) == len(refs)
        assert {row['contentId'] for row in refs} == required, 'Physical closure is not exact'
        for ref in refs:
            assert ref == {key: descriptors[ref['contentId']][key] for key in ('role', 'contentId', 'path', 'sha256')}
    return True

def social_meaning(manifest):
    expected = copy.deepcopy(read(ACCEPTED / SOCIAL))
    for entry in expected['releaseEligibility']:
        entry['releaseId'] = manifest['releaseId']
    current = read(BUNDLE / SOCIAL)
    assert digest(current) == digest(expected), 'Social semantics or eligibility changed beyond release rebinding'
    assert len(current['federalRules']) == 44 and len(current['cantonalBindings']) == 50
    refs = {row['contentId']: row for row in manifest['artifacts']}
    for entry in current['releaseEligibility']:
        assert entry['status'] == 'candidate' and entry['approval'] is None
        assert entry['caseCoverage']['to'] == entry['calculationCoverage']['to'] == '2027-12-31'
        for ref in entry['componentRefs']:
            assert ref == {key: refs[ref['contentId']][key] for key in ('role', 'contentId', 'sha256')}
    return True

def inspect_bundle():
    manifest, catalog = read(BUNDLE / 'manifest.json'), read(BUNDLE / ADMIN)
    validate(manifest, SCHEMAS[manifest['$schema']])
    assert manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '15.0.0'
    assert manifest['releaseId'] == '2026-10-27-ap23k3-candidate.1' and manifest['releaseStatus'] == 'candidate'
    assert len(manifest['artifacts']) == 44 and len(manifest['calendarIds']) == 35
    assert sorted(path.relative_to(BUNDLE).as_posix() for path in BUNDLE.rglob('*') if path.is_file()) == sorted(
        ['manifest.json'] + [row['path'] for row in manifest['artifacts']])
    calendars = {}
    for descriptor in manifest['artifacts']:
        raw = (BUNDLE / descriptor['path']).read_bytes()
        assert len(raw) == descriptor['byteLength'] and sha(raw) == descriptor['sha256']
        value = json.loads(raw)
        assert value['$schema'] == descriptor['schemaId']
        validate(value, SCHEMAS[value['$schema']])
        if value['dataKind'] == 'calendar':
            calendars[value['calendarId']] = value
        if descriptor['path'] not in (ADMIN, SOCIAL):
            assert raw == (ACCEPTED / descriptor['path']).read_bytes() == (OLD / descriptor['path']).read_bytes()
    meaning(catalog, manifest)
    eligibility(catalog)
    actual_bindings(manifest, catalog, calendars)
    social_meaning(manifest)
    assert len(calendars) == 35 and sum(len(row['rules']) for row in calendars.values()) == 431
    holiday = read(BUNDLE / HOLIDAY)
    assert len(holiday['data']['rules']) == 479 and len(holiday['activation']['supplementalRules']) == 20
    assert len(holiday['activation']['procedureBindings']) == 104
    for key in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'):
        assert manifest['extensions']['steimer.local-reference'][key] is False
    assert catalog['runtimeActive'] is False and catalog['releaseBinding']['status'] == 'candidate'
    for key in ('releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef'):
        assert catalog['releaseBinding'][key] is None
    return manifest, catalog, calendars, holiday

class AP23K3Contract(unittest.TestCase):
    def setUp(self):
        self.manifest = read(BUNDLE / 'manifest.json')
        self.catalog = read(BUNDLE / ADMIN)
        self.calendars = {path.stem: read(path) for path in (BUNDLE / 'calendars').glob('*.json')}

    def test_actual_files_schemas_hashes_and_all_accepted_meanings(self):
        inspect_bundle()

    def test_native_catalog_definitions_remain_exact_accepted_K2_definitions(self):
        before = read(ROOT / 'schemas/candidates/ap23k2/administrative-procedure-catalog-v8.schema.json')
        after = SCHEMAS[PREFIX + 'administrative-procedure-catalog-v8.schema.json']
        self.assertEqual(after['$defs'], before['$defs'])
        self.assertEqual(after['properties']['formatVersion'], before['properties']['formatVersion'])

    def test_local_candidate_does_not_validate_as_production_release(self):
        with self.assertRaises(ValidationError):
            validate(self.manifest, SCHEMAS[PREFIX + 'release-manifest-v15.schema.json'])

    def test_165_unchanged_accepted_paths_and_149_old_paths(self):
        meaning(self.catalog)
        current = {row['pathId']: digest(row) for row in self.catalog['paths']}
        for row in read(OLD / ADMIN)['paths']:
            self.assertEqual(current[row['pathId']], digest(row))
        self.assertEqual(len(current), 165)

    def test_dynamic26_28_29_and_BL13_remain_exact(self):
        bindings = {row['holidayBindingId']: row for row in self.catalog['holidayBindings']}
        selection = bindings['bs-party-representative']['calendarSelection']
        self.assertEqual(len(selection['terminals']), 26)
        self.assertEqual(sum(len(terminal['variants']) for terminal in selection['terminals']), 28)
        self.assertEqual(len({ident for terminal in selection['terminals'] for variant in terminal['variants']
                              for ident in (variant['projectionId'], variant['alternativeProjectionId']) if ident is not None}), 29)
        policy = bindings['bl-authority-seat']['annualEndShiftPolicy']
        self.assertEqual(sum(len(row['dates']) for row in policy['years']), 13)
        self.assertEqual(policy['effect'], 'endShiftOnly')
        self.assertEqual(policy['uncertainty']['dates'], ['2027-02-09'])
        self.assertEqual(policy['uncertainty']['inputOverride'], 'forbidden')

    def test_social44_50_rebind_only(self):
        social_meaning(self.manifest)

    def test_all_seven_accepted_semantic_group_mutations_rejected(self):
        for field in ('paths', 'qualificationPolicies', 'laws', 'sources', 'suspensionProfiles', 'excludedPaths', 'preserved'):
            changed = copy.deepcopy(self.catalog)
            changed[field][-1]['forged'] = 'unapproved'
            with self.subTest(field=field), self.assertRaises(AssertionError):
                meaning(changed)

    def test_three_territorial_or_role_mutations_rejected(self):
        for field in ('role', 'region', 'fallback'):
            changed = copy.deepcopy(self.catalog)
            binding = next(row for row in changed['holidayBindings'] if row['holidayBindingId'] == 'bs-party-representative')
            selection = binding['calendarSelection']
            if field == 'role':
                binding['legalBinding']['roleUnion'] = True
            elif field == 'region':
                selection['terminals'][0]['requiredAreaScopeIds'] = ['invented-municipal-rule']
            else:
                selection['otherwise'] = 'firstCalendar'
            with self.subTest(field=field), self.assertRaises(AssertionError):
                meaning(changed)

    def test_three_annual_policy_mutations_rejected(self):
        for field in ('date', 'effect', 'override'):
            changed = copy.deepcopy(self.catalog)
            policy = next(row for row in changed['holidayBindings'] if row['holidayBindingId'] == 'bl-authority-seat')['annualEndShiftPolicy']
            if field == 'date':
                policy['years'][1]['dates'].append('2027-02-09')
            elif field == 'effect':
                policy['effect'] = 'doNotCountAsDay'
            else:
                policy['uncertainty']['inputOverride'] = 'consumerChoice'
            with self.subTest(field=field), self.assertRaises(AssertionError):
                meaning(changed)

    def test_three_opening_or_normtimeline_mutations_rejected(self):
        for field in ('trigger', 'timeline', 'start'):
            changed = copy.deepcopy(self.catalog)
            path = next(row for row in changed['paths'] if row['pathId'] == 'bs-court-register-10')
            if field == 'trigger':
                path['openingPolicy']['triggerKind'] = 'inferredPhysicalReceipt'
            elif field == 'timeline':
                path['normTimeline'][1]['interval']['from'] = '2027-01-02'
            else:
                path['openingPolicy']['transformation'] = 'nextWorkingDay'
            with self.subTest(field=field), self.assertRaises(AssertionError):
                meaning(changed)

    def test_three_parent_closure_mutations_rejected(self):
        for field in ('missing', 'cycle', 'replacement'):
            changed = copy.deepcopy(self.calendars)
            ident = 'ap23h2-ow-procedural-core'
            if field == 'missing':
                del changed[changed[ident]['inherits'][0]]
            elif field == 'cycle':
                changed[ident]['inherits'] = [ident]
            else:
                changed[ident]['inherits'] = ['ch-federal-calendar']
            with self.subTest(field=field), self.assertRaises(AssertionError):
                actual_bindings(self.manifest, self.catalog, changed)

    def test_four_resealed_eligibility_mutations_rejected(self):
        for field in ('calendarSelectionSha256', 'annualEndShiftPolicySha256', 'openingPolicySha256', 'qualificationPolicySha256'):
            changed = copy.deepcopy(self.catalog)
            entry = next(row for row in changed['releaseBinding']['pathEligibility'] if row['pathId'] == 'bs-court-register-10')
            entry[field] = '0' * 64
            with self.subTest(field=field), self.assertRaises(AssertionError):
                eligibility(changed)

    def test_approved_contract_cannot_grant_operating_authority(self):
        self.assertEqual(self.catalog['contractDecision'], {'id': 'DEC-2026-040', 'status': 'approved', 'on': '2026-10-27'})
        self.assertFalse(self.catalog['runtimeActive'])
        self.assertEqual(self.catalog['releaseBinding']['status'], 'candidate')
        for key in ('productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'):
            self.assertFalse(self.manifest['extensions']['steimer.local-reference'][key])

    def test_independent_adapter_does_not_erase_negative_case_facts_or_unknown_keys(self):
        checker = counterchecker()
        original = next(row['input'] for row in read(ROOT / 'outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json')['syntheticProbeResults']
                        if row['id'] == 'bs-foreign-role-input')
        path = next(row for row in self.catalog['paths'] if row['pathId'] == original['path'])
        native = {'selection': {'pathId': original['path'], 'revision': original['pathRevision'], 'lawId': path['lawId'], 'stage': path['stages'][0]},
                  'authoritySeat': {'canton': original['authoritySeatCanton']}, 'inputDate': original['trigger'], 'deadlineDays': original['days'],
                  'caseQualification': copy.deepcopy(original['facts']), 'role': original['role'], 'urgency': 'none',
                  'qualification': {'delivery': 'qualifiedTriggerAccordingToOpeningPolicy', 'generalRoute': 'qualified', 'specialLaw': 'excluded',
                                    'explicitHolidayException': 'none', 'fixedEndDate': False, 'deviatingStart': False, 'evidenceAdvance': False}}
        checker.check_adaptation(original, native, self.catalog)
        for field in ('role', 'caseQualification'):
            changed = copy.deepcopy(native)
            if field == 'role':
                del changed['role']
            else:
                changed[field]['legalAnchorQualification'] = 'authoritySeatOnly'
            with self.subTest(field=field), self.assertRaises(AssertionError):
                checker.check_adaptation(original, changed, self.catalog)

    def test_independent_normalizer_rejects_export_authority_and_definitive_blocked_values(self):
        checker = counterchecker()
        for reason, expected in [('administrative.blOfficeClosureClarificationRequired', 'unresolvedBoundaryProposed'),
                                 ('calendarBinding.januaryClarificationRequired', 'unresolvedBoundaryProposed'),
                                 ('dataCoverageExceeded', 'researchWindowBoundary'),
                                 ('administrative.outsideCaseCoverage', 'researchWindowBoundary'),
                                 ('administrative.holidayAnchorNotQualified', 'qualificationBoundaryProposed')]:
            raw = {'outcome': 'blocked', 'calendarExportAllowed': False, 'blockReasonKeys': [reason]}
            self.assertEqual(checker.normalize_native(raw)['outcome'], expected)
            with self.subTest(reason=reason), self.assertRaises(AssertionError):
                checker.normalize_native({**raw, 'finalEnd': '2027-02-09'})
            with self.assertRaises(AssertionError):
                checker.normalize_native({**raw, 'calendarExportAllowed': True})

    def test_independent_old_arithmetic_covers_all149_frozen_inputs_without_using_old_results_as_expected_values(self):
        checker = counterchecker()
        oracle = checker.module('unchanged_k2_oracle_for_old_arithmetic', ROOT / 'scripts/check_ap23k2_independent.py')
        inputs = read(ROOT / 'outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json')['oldResults']
        results = [checker.old_reference_arithmetic(row['input'], self.catalog, self.calendars, oracle) for row in inputs]
        self.assertEqual(len(results), 149)
        self.assertTrue(all(row['outcome'] == 'datedResearchValue' for row in results))

if __name__ == '__main__':
    unittest.main()
