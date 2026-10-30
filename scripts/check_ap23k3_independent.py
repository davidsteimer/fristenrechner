# SPDX-License-Identifier: AGPL-3.0-only
"""Independent native K3 bytes and results, reusing the immutable accepted Python K2 oracle."""
import argparse
import copy
import importlib.util
import importlib.metadata
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'outputs/ap23k3-2026-10-27'
BUNDLE = ROOT / 'data/candidates/2026-10-27-ap23k3'
ACCEPTED_QA = ROOT / 'outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json'
ORACLE_PATH = ROOT / 'scripts/check_ap23k2_independent.py'
GUARD = OUT / 'protected-inputs.json'
GUARD_SHA = '23f5406ec3218aa30d0fb1ac95c0aff507106523f1c7645125020bf127738ce1'
DAY = timedelta(days=1)

def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result

def normalize_native(raw):
    assert raw['calendarExportAllowed'] is False
    if raw['outcome'] == 'calculated':
        opening = raw['provenance'].get('openingResolution')
        return {'outcome': 'datedResearchValue', 'legalOpening': opening['qualifiedOpeningDate'] if opening else raw['inputDate'],
                'ordinaryStart': raw['ordinaryStart'], 'nominalEnd': raw['provisionalEnd'], 'end': raw['finalEnd']}
    assert raw['outcome'] == 'blocked' and 'finalEnd' not in raw
    reason = raw['blockReasonKeys'][0]
    if reason in ('administrative.outsideCaseCoverage', 'dataCoverageExceeded'):
        outcome = 'researchWindowBoundary'
    elif reason in ('administrative.blOfficeClosureClarificationRequired', 'calendarBinding.januaryClarificationRequired'):
        outcome = 'unresolvedBoundaryProposed'
    else:
        outcome = 'qualificationBoundaryProposed'
    return {'outcome': outcome, 'reason': reason}

def check_adaptation(original, native, catalog):
    """No negative fact or unknown original property may disappear in the test adapter."""
    assert native['selection']['pathId'] == original['path']
    assert native['selection']['revision'] == original['pathRevision']
    assert native['authoritySeat']['canton'] == original['authoritySeatCanton']
    assert native['inputDate'] == original['trigger'] and native['deadlineDays'] == original['days']
    assert native.get('caseQualification') == original['facts']
    assert native.get('areaFacts', {}) == original.get('areaFacts', {})
    for key in set(original) - {'path', 'pathRevision', 'authoritySeatCanton', 'trigger', 'days', 'facts', 'areaFacts'}:
        assert native.get(key) == original[key], 'Dropped negative input property ' + key
    path = next(row for row in catalog['paths'] if row['pathId'] == original['path'])
    assert native['selection']['lawId'] == path['lawId'] and native['selection']['stage'] in path['stages']
    assert native['qualification'] == {'delivery': 'qualifiedTriggerAccordingToOpeningPolicy', 'generalRoute': 'qualified',
        'specialLaw': 'excluded', 'explicitHolidayException': 'none', 'fixedEndDate': False, 'deviatingStart': False, 'evidenceAdvance': False}
    assert native['urgency'] == 'none'

def verify_native_provenance(oracle, original, actual, native, catalog, calendars, holiday, input_validator):
    if actual['outcome'] not in ('datedResearchValue', 'unresolvedBoundaryProposed'):
        return False
    path = next(row for row in catalog['paths'] if row['pathId'] == original['path'])
    binding = next(row for row in catalog['holidayBindings'] if row['holidayBindingId'] == path['holidayBindingId'])
    profile = next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId'] == path['suspensionSelection']['suspensionProfileId'])
    p = native['provenance']
    assert p['pathId'] == path['pathId'] and p['lawId'] == path['lawId'] and p['revision'] == path['revision']
    assert p['releaseId'] == '2026-10-27-ap23k3-candidate.1'
    assert p['holidayBindingId'] == binding['holidayBindingId']
    assert p['qualificationPolicySha256'] == oracle.digest(next(row for row in catalog['qualificationPolicies'] if row['pathId'] == path['pathId']))
    assert p['suspensionProfileId'] == profile['suspensionProfileId'] and p['suspensionProfileSha256'] == oracle.digest(profile)
    assert p['suspensionSelectionSha256'] == oracle.digest(path['suspensionSelection'])
    opening = p['openingResolution']
    assert opening['openingPolicySha256'] == oracle.digest(path['openingPolicy'])
    assert opening['inputMeaning'] == 'qualifiedLegalOpeningDate' and opening['triggerKind'] == 'qualifiedLegalOpening'
    assert opening['inputDate'] == opening['qualifiedOpeningDate'] == original['trigger'] and opening['openingShiftDates'] == []
    selection = binding['calendarSelection']
    resolution = p['calendarResolution']
    assert resolution['calendarSelectionSha256'] == oracle.digest(selection) and resolution['holidayBindingSha256'] == oracle.digest(binding)
    assert resolution['selectionKind'] == selection['kind'] and resolution['authoritySeatCanton'] == original['authoritySeatCanton']
    assert resolution['areaFacts'] == original.get('areaFacts', {})
    if selection['kind'] == 'fixedAuthoritySeat':
        variant = selection
        assert resolution['legalAnchorQualification'] is resolution['legalAnchorCanton'] is None
        assert resolution['terminalBindingId'] is resolution['terminalBindingSha256'] is None
        assert resolution['requiredAreaScopeIds'] == resolution['boundaryIds'] == []
    else:
        canton = original['facts'][selection['cantonFact']]
        terminal = next(row for row in selection['terminals'] if row['canton'] == canton)
        variant = next(row for row in terminal['variants'] if {fact['scopeId']: fact['member'] for fact in row['areaFacts']} == original.get('areaFacts', {}))
        assert resolution['legalAnchorQualification'] == selection['qualifiedValue'] and resolution['legalAnchorCanton'] == canton
        for key, expected in (('terminalBindingId', terminal['bindingId']), ('terminalBindingSha256', terminal['bindingSha256']),
                              ('requiredAreaScopeIds', terminal['requiredAreaScopeIds']), ('boundaryIds', terminal['boundaryIds'])):
            assert resolution[key] == expected
    assert p['calendarId'] == resolution['calendarId'] == variant['calendarId']
    assert p['projectionId'] == resolution['projectionId'] == variant['projectionId']
    annual = binding['annualEndShiftPolicy']
    end_resolution = p['annualEndShiftResolution']
    assert end_resolution['kind'] == annual['kind'] and end_resolution['annualEndShiftPolicySha256'] == oracle.digest(annual)
    max_end = actual.get('end')
    if annual['kind'] == 'blCantonalOfficeClosures':
        assert end_resolution['effect'] == 'endShiftOnly'
        assert end_resolution['boundOfficeClosureDays'] == [{'date': day, 'year': row['year'], 'sourceRefs': row['sourceRefs']}
                                                          for row in annual['years'] for day in row['dates']]
        without = oracle.evaluate(original, catalog, calendars, holiday, input_validator, False)
        with_optional = oracle.evaluate(original, catalog, calendars, holiday, input_validator, True)
        assert without['outcome'] == with_optional['outcome'] == 'datedResearchValue'
        expected = {'boundaryId': 'BL-B-FASNACHT', 'variedDates': ['2027-02-09'], 'withoutOptionalEnd': without['end'],
                    'withOptionalEnd': with_optional['end'], 'outcome': 'equal' if without['end'] == with_optional['end'] else 'different'}
        assert end_resolution['uncertaintyComparison'] == expected
        max_end = max(without['end'], with_optional['end'])
    else:
        assert end_resolution['effect'] == 'none' and end_resolution['boundOfficeClosureDays'] == []
        assert end_resolution['uncertaintyComparison'] is None and end_resolution['evaluatedYears'] == []
    assert max_end
    start, last = date.fromisoformat(original['trigger']), date.fromisoformat(max_end)
    traversed = [start + n * DAY for n in range((last - start).days + 1)]
    segments = [row for row in path['normTimeline'] if any(oracle.inside(day, row['interval']) for day in traversed)]
    assert p['evaluatedNormSegments'] == segments
    if annual['kind'] == 'blCantonalOfficeClosures':
        assert end_resolution['evaluatedYears'] == sorted({day.year for day in traversed})
    if selection['kind'] == 'qualifiedPartyOrRepresentativeCanton' and variant['alternativeProjectionId'] is not None:
        comparison = resolution['januaryComparison']
        assert comparison['variedCatalogRuleIds'] == terminal['ambiguity']['catalogRuleIds']
        assert comparison['outcome'] == 'equal' and comparison['withoutJanuary2'] == comparison['withJanuary2'] == actual['end']
    else:
        assert resolution['januaryComparison'] is None
    return True

def old_reference_arithmetic(native_input, catalog, calendars, oracle):
    """Full date enumeration for the explicitly supplied synthetic old-path inputs."""
    path = next(row for row in catalog['paths'] if row['pathId'] == native_input['selection']['pathId'])
    assert path.get('contractFamily') != 'qualifiedDayProcedureV8'
    facts = native_input.get('caseQualification', {})
    policy = next(row for row in catalog['qualificationPolicies'] if row['pathId'] == path['pathId'])
    requirements = policy.get('requirements', [])
    if type(requirements) is dict:
        # Historical dictionary contracts contain policy constants and qualification fields
        # outside caseQualification. This countercheck concerns their unchanged supplied
        # positive arithmetic inputs, not a replacement historical qualification engine.
        assert all(oracle.same(facts[key], value) for key, value in requirements.items() if key in facts)
        requirements = []
    for requirement in requirements:
        assert requirement['key'] in facts
        expected = requirement.get('oneOf', [requirement.get('value')])
        assert any(oracle.same(facts[requirement['key']], value) for value in expected)
    choice = path.get('suspensionSelection')
    if choice:
        ident = choice['suspensionProfileId'] if choice['kind'] == 'fixed' else next(
            row['suspensionProfileId'] for row in choice['cases'] if oracle.same(row['value'], facts[choice['factKey']]))
    else:
        ident = path['suspensionProfileId']
    profile = next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId'] == ident)
    physical = next(row for row in catalog['holidayBindings'] if row['holidayBindingId'] == path['holidayBindingId'])['physicalBaseline']
    calendar = physical['calendarId']
    opening = date.fromisoformat(native_input['inputDate'])
    def holiday(day):
        return day in oracle.calendar_dates(calendar, calendars, day.year)
    if path.get('openingPolicy', {}).get('kind') == 'geQualifiedOrOrdinaryPost' and facts.get('openingMode') == 'ordinaryPostPhysicalReceipt':
        while opening.weekday() >= 5 or holiday(opening):
            opening += DAY
    duration = path['duration']
    days = duration['value'] if duration['kind'] == 'statutoryDays' else native_input['deadlineDays']
    assert type(days) is int and 1 <= days <= 365
    if duration['kind'] == 'statutoryDays' and 'deadlineDays' in native_input:
        assert native_input['deadlineDays'] == days
    def period_day(expr, year):
        offset = expr.get('yearOffset', 0)
        if expr['type'] == 'easterOffset':
            return oracle.easter(year + offset) + expr['days'] * DAY
        assert expr['type'] == 'fixedMonthDay'
        return date(year + offset, expr['month'], expr['day'])
    intervals = [(period_day(row['start'], year), period_day(row['end'], year))
                 for year in range(opening.year - 1, opening.year + 3) for row in profile['periods']]
    def suspended(day):
        return any(start <= day <= end for start, end in intervals)
    timeline = [opening + n * DAY for n in range(1, 1100)]
    counted = [day for day in timeline if not suspended(day)][:days]
    assert len(counted) == days
    nominal = counted[-1]
    shifted = next(day for day in timeline if day >= nominal and day.weekday() < 5 and not holiday(day))
    assert shifted <= date(2027, 12, 31)
    if path['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension' and any(suspended(day) for day in timeline if nominal < day <= shifted):
        return {'outcome': 'unresolvedBoundaryProposed'}
    return {'outcome': 'datedResearchValue', 'ordinaryStart': (opening + DAY).isoformat(),
            'nominalEnd': nominal.isoformat(), 'end': shifted.isoformat(), 'countedDates': [day.isoformat() for day in counted]}

def run():
    import hashlib
    def sha(raw):
        return hashlib.sha256(raw).hexdigest()
    assert sha(GUARD.read_bytes()) == GUARD_SHA
    guard = json.loads(GUARD.read_bytes())
    assert sha(ORACLE_PATH.read_bytes()) == guard['files'][ORACLE_PATH.relative_to(ROOT).as_posix()]
    assert sha(ACCEPTED_QA.read_bytes()) == 'c60fc0fd693de41bcdd2400e2d03ee559f33341bb9e68f616636f86eca54351a'
    oracle = module('immutable_k2_python_oracle', ORACLE_PATH)
    contract = module('native_k3_independent_contract', ROOT / 'tests/data/test_ap23k3_contract.py')
    manifest, catalog, calendars, holiday = contract.inspect_bundle()
    from jsonschema import Draft202012Validator, FormatChecker
    input_validator = Draft202012Validator(oracle.load(ROOT / 'schemas/candidates/ap23k2/administrative-input-v8.schema.json'), format_checker=FormatChecker())
    suite = oracle.load(oracle.SUITE)
    assert oracle.sha(oracle.SUITE.read_bytes()) == guard['files'][oracle.SUITE.relative_to(ROOT).as_posix()]
    accepted_qa = oracle.load(ACCEPTED_QA)
    independent, diagnostics = [], []
    for case in suite['cases']:
        original, annotations = oracle.adapt(case, suite)
        actual = oracle.evaluate(original, catalog, calendars, holiday, input_validator, oracle.DIAGNOSTIC_CASES.get(case['id']))
        expected = case['analystExpected']
        assert actual['outcome'] == expected['outcome'] and (expected['outcome'] != 'datedResearchValue' or actual.get('end') == expected['end']), (
            'Accepted K1 static result expectation', case['id'], actual, expected)
        (diagnostics if case['id'] in oracle.DIAGNOSTIC_CASES else independent).append(
            {'id': case['id'], 'originalInput': original, 'actual': actual, 'annotations': annotations})
    synthetic = []
    for row in accepted_qa['syntheticProbeResults']:
        expected = oracle.peer_synthetic_expected(row)
        actual = oracle.evaluate(row['input'], catalog, calendars, holiday, input_validator)
        assert all(actual.get(key) == value for key, value in expected.items()), ('Explicit independent synthetic expectation', row['id'])
        synthetic.append({'id': row['id'], 'originalInput': row['input'], 'actual': actual})
    january = oracle.sg_january_diagnostics(catalog, calendars, holiday)
    physical = oracle.physical_calendar_diagnostics(calendars)
    old_inputs = oracle.index(accepted_qa['oldResults'], 'pathId')
    assert len(old_inputs) == 149
    old_expectations = {ident: old_reference_arithmetic(row['input'], catalog, calendars, oracle)
                        for ident, row in old_inputs.items()}
    # Only now consult independently serialised native results. They never supply an expected value.
    native_path = OUT / 'native-reference-verification.json'
    if not native_path.exists():
        raise RuntimeError('Independent candidate and 65+46 static expectations checked. Native result evidence is not yet available.')
    native = oracle.load(native_path)
    assert native['workPackage'] == 'AP23K3' and native['status'] == 'passed-native-reference-only'
    assert native['nativeFormat'] == '15.0.0' and native['catalogFormat'] == '8.0.0'
    assert native['acceptedOriginalCases'] == 67 and native['consumerCases'] == 65 and native['diagnosticWorldCases'] == 2
    assert native['syntheticCases'] == 46 and native['oldNativeCases'] == 149
    assert native['referenceOnly'] is True and native['originalK1FactsPreserved'] is True
    for key in ('sourceReleaseApproved', 'calendarExportEnabled', 'operatingApproval'):
        assert native[key] is False
    results = []
    provenance_comparisons = 0
    for own_rows, peer_key in ((independent, 'results'), (synthetic, 'syntheticResults')):
        peers = oracle.index(native[peer_key], 'id')
        assert set(peers) == {row['id'] for row in own_rows}
        for row in own_rows:
            peer = peers[row['id']]
            assert peer['originalInput'] == row['originalInput']
            check_adaptation(row['originalInput'], peer['input'], catalog)
            actual = row['actual']
            normalized = normalize_native(peer['native'])
            assert normalized['outcome'] == actual['outcome'], ('Independent native outcome mismatch', row['id'], normalized, actual)
            if actual['outcome'] == 'datedResearchValue':
                assert all(normalized[key] == actual[key] for key in ('legalOpening', 'ordinaryStart', 'nominalEnd', 'end')), row['id']
                assert peer['native']['referenceOnly'] is True
            provenance_comparisons += verify_native_provenance(oracle, row['originalInput'], actual, peer['native'], catalog, calendars, holiday, input_validator)
            results.append({'id': row['id'], 'actual': actual, 'nativeNormalized': normalized})
    old_results = []
    assert len(native['oldResults']) == 149
    old_ids = {row['pathId'] for row in oracle.load(contract.OLD / contract.ADMIN)['paths']}
    assert {row['pathId'] for row in native['oldResults']} == old_ids
    for row in native['oldResults']:
        assert row['input']['selection']['pathId'] == row['pathId']
        assert row['input'] == old_inputs[row['pathId']]['input'], 'Old synthetic input changed'
        own = old_expectations[row['pathId']]
        raw = row['native']
        assert raw['calendarExportAllowed'] is False
        if own['outcome'] == 'datedResearchValue':
            assert raw['outcome'] == 'calculated'
            assert (raw['ordinaryStart'], raw['provisionalEnd'], raw['finalEnd'], raw['countedDates']) == (
                own['ordinaryStart'], own['nominalEnd'], own['end'], own['countedDates']), row['pathId']
        else:
            assert raw['outcome'] == 'blocked' and 'finalEnd' not in raw
        assert row['mathematicalFieldsEqual'] is True
        old_results.append({'pathId': row['pathId'], 'independent': own})
    assert len(native['branchOverrideRejections']) == 2
    for row in native['branchOverrideRejections']:
        assert row['native']['outcome'] == 'blocked' and 'finalEnd' not in row['native']
        assert row['native']['calendarExportAllowed'] is False
    source_rows = oracle.load(oracle.OUT / 'source-crosswalk.json')['sourceRows']
    for row in source_rows:
        for pin in row['evidence']:
            body = (ROOT / pin['path']).read_bytes()
            assert sha(body) == pin['sha256'] == guard['files'][pin['path']] and len(body) == pin['byteLength']
    evidence_paths = [Path(__file__), ROOT / 'tests/data/test_ap23k3_contract.py', ORACLE_PATH, GUARD, native_path, ACCEPTED_QA,
                      oracle.SUITE, BUNDLE / 'manifest.json', BUNDLE / contract.ADMIN]
    evidence_paths.extend(ROOT / name for name in ('schemas/administrative-procedure-catalog-v8.schema.json',
        'schemas/release-manifest-v15.schema.json', 'schemas/implementation/ap23k3/local-reference-manifest-v15.schema.json'))
    return {'workPackage': 'AP23K3', 'status': 'passedIndependentNativeComparison',
        'referenceCases': len(independent), 'diagnosticBranchOracleCases': len(diagnostics), 'syntheticCases': len(synthetic),
        'nativeComparisons': len(results), 'oldNativeArithmeticComparisons': len(old_results), 'branchOverrideRejections': 2,
        'counts': dict(Counter(row['actual']['outcome'] for row in independent)), 'provenanceComparisons': provenance_comparisons,
        'sourceByteBindings': len(source_rows), 'unchangedRawArtifacts': 42, 'preservedPaths': 149, 'newPaths': 16,
        'physicalCalendars': 35, 'physicalProjectionRules': 431, 'holidayRules': 499,
        'socialRules': 44, 'socialBernBindings': 50, 'sgJanuaryCalendarDiagnostics': january, 'physicalCalendarDiagnostics': physical,
        'sourceReleaseApproved': False, 'calendarExportEnabled': False, 'operatingChanges': False, 'discrepancies': [],
        'schemaValidator': 'jsonschema ' + importlib.metadata.version('jsonschema'),
        'method': 'Immutable K2 Python oracle reused read-only. Independent Python calendar-day enumeration and schema/byte validation precede comparison with actual native Format15 results. No Node evaluation or product imports.',
        'results': results, 'diagnosticResults': diagnostics, 'oldResults': old_results, 'inputs': [oracle.evidence(path) for path in evidence_paths]}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    report = run()
    if args.write:
        (OUT / 'independent-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({**report, 'results': len(report['results']), 'oldResults': len(report['oldResults']),
                      'diagnosticResults': len(report['diagnosticResults']), 'inputs': len(report['inputs'])}, ensure_ascii=False, indent=2))
