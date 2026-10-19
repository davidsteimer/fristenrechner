#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent, read-only verification of the actual R09-B release bytes.

No promotion helper or TypeScript runtime is imported. Accepted candidate bytes,
the separate human decisions and the Python calendar projector are independent
oracles. Re-signing a changed component in the manifest does not legitimise it.
"""
from __future__ import annotations

import copy
import json
from collections import Counter
from functools import lru_cache
from pathlib import Path, PurePosixPath
import sys

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

from ap22c1_contract import (ROOT, PREFIX, ROLE_SCHEMAS as OLD_ROLE_SCHEMAS,
                            require, sha, validate_calendars)

RELEASE_ID = '2026-10-18-mvp-09-approved.1'
DATE = '2026-10-18'
OUTPUT = 'outputs/release-mvp09-2026-10-18'
CANDIDATE = ROOT / 'outputs/ap23e3-candidate-2026-10-18/bundle'
CANDIDATE_SHA = '4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31'
SOURCE_APPROVAL_PATH = f'{OUTPUT}/source-approval.json'
SOURCE_APPROVAL_SHA = '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68'
LOCAL_APPROVAL_PATH = f'{OUTPUT}/r09b-execution-approval.json'
LOCAL_APPROVAL_SHA = '87d64bc998f2003cf21ea5fe4eb20abefa2b8eb056f46f5ca26f7733f8fadcd3'
DECISION_PATH = 'docs/betrieb/freigabe-r09-b.md'
INVENTORY_PATH = f'{OUTPUT}/sources/source-inventory.json'
INVENTORY_SHA = 'f1171c9259e27027d1f3da9850f3107897a6cb4d5b6631561165aa2e7df2b4b1'
CATALOG_PATH = 'holiday-catalogs/ch-holiday-catalog.json'
SOCIAL_PATH = 'social-procedures/ch-social-procedures.json'
ADMIN_PATH = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
ROLE_SCHEMAS = {**OLD_ROLE_SCHEMAS,
                'administrativeProcedureCatalog': 'administrative-procedure-catalog-v2.schema.json'}
HORIZON = {'from': '2026-08-29', 'to': '2027-12-31'}
SOCIAL_HORIZON = {'from': '2026-01-01', 'to': '2027-12-31'}


def without(value, keys):
    return {key: item for key, item in value.items() if key not in keys}


def object_sha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def read_regular(base, relative):
    path = PurePosixPath(relative)
    require(relative and not path.is_absolute() and '..' not in path.parts
            and '\\' not in relative and str(path) == relative, f'Unsafe path: {relative}')
    target = Path(base)
    require(target.is_dir() and not target.is_symlink(), 'Unsafe base directory')
    for part in path.parts:
        target /= part
        require(not target.is_symlink(), f'Symlink in evidence/runtime file: {relative}')
    require(target.is_file() and target.resolve().is_relative_to(Path(base).resolve()),
            f'Missing regular file: {relative}')
    return target.read_bytes()


def read_json(base, path):
    return json.loads(read_regular(base, path))


def bound_json(base, reference, expected_path=None, expected_sha=None):
    if expected_path:
        require(reference['path'] == expected_path, 'Evidence path substitution')
    raw = read_regular(base, reference['path'])
    require(sha(raw) == reference['sha256'], f'Unbound evidence: {reference["path"]}')
    if expected_sha:
        require(sha(raw) == expected_sha, 'Accepted evidence bytes changed')
    if 'byteLength' in reference:
        require(len(raw) == reference['byteLength'], 'Evidence byte length mismatch')
    return json.loads(raw)


@lru_cache(maxsize=None)
def schema_validator(base, name):
    schemas = {}
    for path in (Path(base) / 'schemas').glob('*.schema.json'):
        item = json.loads(path.read_bytes())
        schemas[item['$id']] = item
    registry = Registry().with_resources((key, Resource.from_contents(item))
                                         for key, item in schemas.items())
    schema = schemas[PREFIX + name]
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())


def schema_check(base, name, value):
    errors = sorted(schema_validator(str(base), name).iter_errors(value), key=lambda e: str(e.absolute_path))
    require(not errors, f'{name}: {errors[0].message if errors else ""}')


def validate_authority(evidence_root=ROOT):
    source_raw = read_regular(evidence_root, SOURCE_APPROVAL_PATH)
    require(sha(source_raw) == SOURCE_APPROVAL_SHA, 'Source approval bytes changed')
    source = json.loads(source_raw)
    require(source['permissions']['sourceReviewApproved'] is True
            and source['permissions']['localDataPromotionAuthorized'] is False
            and source['permissions']['definitiveLocalBuildAuthorized'] is False,
            'Historical source approval changed or does not approve the sources')
    local_raw = read_regular(evidence_root, LOCAL_APPROVAL_PATH)
    require(sha(local_raw) == LOCAL_APPROVAL_SHA, 'Local execution decision bytes changed')
    local = json.loads(local_raw)
    allowed = {'localDataPromotionAuthorized', 'definitiveLocalBuildAuthorized',
               'localRuntimeDataCommitAuthorized', 'localRecoveryBuildAuthorized'}
    require({key for key, value in local['permissions'].items() if value is True} == allowed,
            'Wrong local permissions or unapproved external authority')
    require(all(type(value) is bool for value in local['permissions'].values()), 'Ambiguous permission value')
    bound_json(evidence_root, local['sourceApproval'], SOURCE_APPROVAL_PATH, SOURCE_APPROVAL_SHA)
    decision = local['decision']
    require(decision['path'] == DECISION_PATH
            and sha(read_regular(evidence_root, DECISION_PATH)) == decision['sha256'], 'Unbound decision document')
    for name, expected in {
        'release-manifest-v9.schema.json': '1b489a9cc4efad7751586c5f9bdfa198a0ea6396f4737db9c363e98089c12333',
        'administrative-procedure-catalog-v2.schema.json': 'cbedc3757fd1e5919b1c8c2a4969597e697df56bcf147c14fa6b81e30cd161e0'
    }.items():
        require(sha(read_regular(evidence_root, f'schemas/{name}')) == expected, 'Canonical accepted schema changed')
    return source, local


def validate_administrative(catalog, previous, artifacts, evidence_root, source_ref, suite_ref):
    require(without(catalog, {'review', 'releaseBinding', 'holidayBindings'}) == without(previous, {'review', 'releaseBinding', 'holidayBindings'}),
            'Administrative normative fields, exclusions or physical baseline changed')
    require(catalog['runtimeActive'] is False and catalog['contractStatus'] == 'approved', 'Changed contract activation meaning')
    require(catalog['review']['checkedOn'] == DATE, 'Administrative source check not linked to current review')
    paths = {item['pathId']: item for item in catalog['paths']}
    require(len(paths) == len(catalog['paths']) == 25
            and Counter(path.split('-')[0] for path in paths) == {'ti': 5, 'gr': 7, 'lu': 4, 'zg': 4, 'ar': 5}, 'Administrative path scope changed')
    require({path for path, value in paths.items()
             if value['endShiftGuard'] == 'blockWhenEnteringApplicableSuspension'}
            == {'ti-80-30', 'ti-84-30', 'ti-reply', 'ar-court-30', 'ar-court-ordered'}, 'TI-O2/AR-O1 safeguard changed')
    holidays = {item['holidayBindingId']: item for item in catalog['holidayBindings']}
    suspensions = {item['suspensionProfileId']: item for item in catalog['suspensionProfiles']}
    binding = catalog['releaseBinding']
    require(without(binding, {'status', 'releaseId', 'approval', 'targetComponentRefs', 'sourceReviewRef',
                             'referenceSuiteRef', 'pathEligibility'})
            == without(previous['releaseBinding'], {'status', 'releaseId', 'approval', 'targetComponentRefs',
                                                    'sourceReviewRef', 'referenceSuiteRef', 'pathEligibility'}),
            'Administrative release contract changed')
    require(binding['status'] == 'approved' and binding['releaseId'] == RELEASE_ID, 'Unapproved administrative release')
    require(binding['approval'] == {'approvedBy': 'David Steimer', 'approvedOn': DATE, 'decisionRef': DECISION_PATH},
            'Administrative approval does not bind actual decision')
    require(binding['sourceReviewRef'] == source_ref and binding['referenceSuiteRef'] == suite_ref,
            'Wrong administrative source or reference proof')
    by_id = {item['contentId']: item for item in artifacts}
    required_ids = {'ch-federal-calendar', 'ch-holiday-catalog',
                    'ap22-ti-944ed0286e9a', 'ap22-gr-bf0366c8eda2', 'ap22-lu-b879eb8eb04f', 'ap22-zg-860e0f8e0e1a', 'ap22-ar-88bb22c08a22'}

    def target_refs(actual, identifiers):
        expected = {identifier: {'role': by_id[identifier]['role'], 'contentId': identifier,
                                'sha256': by_id[identifier]['sha256']}
                    for identifier in identifiers}
        require(len(actual) == len(expected) and {item['contentId']: item for item in actual} == expected,
                'Administrative component reference is stale, incomplete or crosses cantons')

    require(len(holidays) == 5, 'Changed holiday binding cardinality')
    previous_holidays = {row['holidayBindingId']: row for row in previous['holidayBindings']}
    for identifier, holiday in holidays.items():
        old = previous_holidays[identifier]
        require(without(holiday, {'physicalBaseline'}) == without(old, {'physicalBaseline'}), 'Changed legal holiday binding')
        baseline, old_baseline = holiday['physicalBaseline'], old['physicalBaseline']
        require(without(baseline, {'releaseId', 'references'}) == without(old_baseline, {'releaseId', 'references'}), 'Changed physical calendar/projection identity')
        require(baseline['releaseId'] == RELEASE_ID, 'Stale physical release provenance')
        require(len(baseline['references']) == len(old_baseline['references']) == 3, 'Incomplete physical references')
        for ref, old_ref in zip(baseline['references'], old_baseline['references']):
            require(without(ref, {'sha256'}) == without(old_ref, {'sha256'}), 'Changed physical role/id/path')
            require(ref['sha256'] == by_id[ref['contentId']]['sha256'], 'Stale physical reference hash')
    target_refs(binding['targetComponentRefs'], required_ids)
    old_entries = {item['pathId']: item for item in previous['releaseBinding']['pathEligibility']}
    entries = binding['pathEligibility']
    require(len(entries) == 25 and {item['pathId'] for item in entries} == set(paths), 'Missing/duplicate administrative permission')
    for entry in entries:
        path = paths[entry['pathId']]
        require(without(entry, {'status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256'})
                == without(old_entries[entry['pathId']], {'status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256'}),
                'Administrative path identity, revision, hashes or horizon changed')
        require(entry['status'] == 'approved' and entry['sourceReviewRef'] == source_ref
                and entry['referenceSuiteRef'] == suite_ref, 'Path permission not fully bound')
        require(entry['pathSha256'] == object_sha(path)
                and entry['holidayBindingSha256'] == object_sha(holidays[path['holidayBindingId']])
                and entry['suspensionProfileSha256'] == object_sha(suspensions[path['suspensionProfileId']]),
                'Administrative semantic hash does not describe the actual object')
        expected_horizon = {**HORIZON, 'from': '2026-09-27'} if entry['pathId'].startswith('lu-') else HORIZON
        policies = {row['pathId']: row for row in catalog['qualificationPolicies']}
        require(entry['qualificationPolicySha256'] == object_sha(policies[entry['pathId']]), 'Qualification hash changed')
        require(entry['caseCoverage'] == entry['calculationCoverage'] == expected_horizon, 'Administrative horizon expanded')
        canton_calendar = {'ti': 'ap22-ti-944ed0286e9a', 'gr': 'ap22-gr-bf0366c8eda2', 'lu': 'ap22-lu-b879eb8eb04f', 'zg': 'ap22-zg-860e0f8e0e1a', 'ar': 'ap22-ar-88bb22c08a22'}[entry['pathId'].split('-')[0]]
        target_refs(entry['targetComponentRefs'], {'ch-federal-calendar', 'ch-holiday-catalog', canton_calendar})


def validate_release_evidence(manifest, source, local, evidence_root):
    extension = manifest['extensions']
    require(set(extension) == {'steimer.approval', 'steimer.release-preparation'}, 'Unexpected release extension')
    approval = extension['steimer.approval']
    require(set(approval) == {'approvedBy', 'approvedOn', 'decisionRef', 'approvalScope', 'contractDecision',
            'candidateReleaseId', 'candidateManifestSha256', 'sourceReviewRef', 'sourceReviewPath', 'sourceApprovalId',
            'localBuildApproval', 'sourceGovernance', 'sourceVersionBridges', 'administrativeReferenceSuite',
            'historicalSourceMetadataUnchanged'}, 'Unexpected approval field')
    require(approval['approvedBy'] == 'David Steimer' and approval['approvedOn'] == DATE
            and approval['decisionRef'] == DECISION_PATH and approval['contractDecision'] == 'DEC-2026-033'
            and approval['approvalScope'] == 'mvp09LocalDataAndReleaseArtifacts'
            and approval['sourceApprovalId'] == '2026-10-18-mvp-09-source-approval.1'
            and approval['historicalSourceMetadataUnchanged'] is True
            and approval['candidateManifestSha256'] == CANDIDATE_SHA
            and approval['candidateReleaseId'] == '2026-10-18-ap23e3-reference.1', 'Wrong release approval origin')
    require(approval['sourceReviewRef'] == {'reviewId': 'MVP09-SOURCE-APPROVAL-20261018', 'sha256': SOURCE_APPROVAL_SHA}
            and approval['sourceReviewPath'] == SOURCE_APPROVAL_PATH, 'Manifest source proof not bound')
    bound_json(evidence_root, approval['localBuildApproval'], LOCAL_APPROVAL_PATH, LOCAL_APPROVAL_SHA)
    bound_json(evidence_root, approval['sourceGovernance'], f'{OUTPUT}/source-governance-adoption.json')
    bound_json(evidence_root, approval['sourceVersionBridges'], f'{OUTPUT}/source-version-bridges.json')
    suite_reference = approval['administrativeReferenceSuite']
    suite = bound_json(evidence_root, suite_reference, f'{OUTPUT}/administrative-reference-suite.json')
    require(suite['releaseId'] == RELEASE_ID, 'Reference suite belongs to a different release')
    # Bind original golden cases and actual accepted D3 QA. The receipt is not
    # allowed to replace the historical oracle with synthetic success metadata.
    expected_evidence = {
        'tests/golden/candidates/ap23b-administrative.json': 'a795a22a07945e02369f917dcea4d047a7bb3bb897e198a1fe1ffbea4a65a5d1',
        'outputs/ap23d3-2026-10-15/QA-AP23D3.json': '0794e536ce757964eb1e00fb5d65a5fd4fdf39a2ddcb730e6061e93b3d06f38a',
        'outputs/ap23d3-abnahme-2026-10-15/receipt.json': 'e3641a460497a0047d7968de106575887757f4d8c619d396359ebd62bfb12966',
        'tests/golden/candidates/ap23e1-administrative.json': '769e9c7db0d63b768909a5042bd1446b708f5e0ed6be7bb92abe7f33669d7ddb',
        'outputs/ap23e2-2026-10-18/QA-AP23E2.json': 'ac7fd146a9db098d65b37c2c586fab36db0072290195b213f3d7e0cd00ca111b',
        'outputs/ap23e3-2026-10-18/QA-AP23E3.json': 'fa564603394ed40a6eebc6a587b5e11111f4f37e75c9930b4a04d1d889991c80',
        'outputs/ap23e3-abnahme-2026-10-18/receipt.json': '18de59434d8dcb8469d0ebad767e6fcea55be089948335930d496990730da3ea'}
    require(len(suite['evidence']) == 7
            and {item['path']: item['sha256'] for item in suite['evidence']} == expected_evidence,
            'Missing accepted administrative reference input')
    require(suite['candidateManifestSha256'] == CANDIDATE_SHA and suite['suiteId'] == 'mvp09-administrative-reference-suite'
            and suite['newHostTestingClaimed'] is False and suite['noAdditionalCases'] is True, 'Misleading reference suite claim')
    for item in suite.get('evidence', []):
        raw = read_regular(evidence_root, item['path'])
        require(sha(raw) == item['sha256'] and len(raw) == item.get('byteLength', len(raw)), 'Changed administrative reference evidence')
    preparation = extension['steimer.release-preparation']
    require(preparation == {'preparedOn': DATE, 'appVersion': '0.9.0',
            'sourceRefresh': 'acceptedWithDocumentedReuseAndReservations', 'publicationApproved': False,
            'deploymentApproved': False, 'productionActivation': False,
            'operatingApproval': 'requiresSeparateDecision'}, 'Build metadata granted external authority')
    return {'adminSourceRef': {'id': 'mvp09-source-approval-20261018', 'sha256': SOURCE_APPROVAL_SHA},
            'adminSuiteRef': {'id': 'mvp09-administrative-reference-suite', 'sha256': suite_reference['sha256']}}


def source_impacts(inventory, documents):
    """Derive source impact closure independently from actual normative objects."""
    components = {'componentId', 'ruleId', 'deadlineDefinitionId', 'filingProfileId', 'regimeId',
                  'suspensionSetId', 'bindingId', 'contextRouteId', 'calendarBindingId', 'eligibilityId',
                  'excludedPathId', 'pathId', 'lawId', 'holidayBindingId', 'suspensionProfileId', 'qualificationPolicyId'}
    impacts = {}

    def collect(source_id, ancestors):
        context = {}
        for ancestor in ancestors:
            for key, value in ancestor.items():
                if key in components | {'profileId', 'entryProfileId', 'calendarId'} and isinstance(value, str):
                    context[key] = value
        target = impacts.setdefault(source_id, {'profileIds': set(), 'calendarIds': set(), 'componentIds': set()})
        profile = context.get('profileId', context.get('entryProfileId'))
        if profile:
            target['profileIds'].add(profile)
        if context.get('calendarId'):
            target['calendarIds'].add(context['calendarId'])
        target['componentIds'].update(context[key] for key in components if context.get(key))

    for edge in inventory['referenceGraph']:
        collect(edge['sourceId'], [edge])

    def descend(value, ancestors):
        if isinstance(value, list):
            for member in value:
                descend(member, ancestors)
        elif isinstance(value, dict):
            ancestry = [*ancestors, value]
            for key, child in value.items():
                if key in {'sourceRefs', 'normBindings', 'supplementaryLawRefs'}:
                    for ref in child:
                        if ref.get('sourceId'):
                            collect(ref['sourceId'], ancestry)
                descend(child, ancestry)

    for document in documents.values():
        descend(document, [])
        if document['dataKind'] == 'socialProcedureCatalog':
            rules = {rule['ruleId']: rule for rule in document['federalRules']}
            bindings = {binding['bindingId']: binding for binding in document['cantonalBindings']}
            for permission in document['releaseEligibility']:
                rule = rules[permission['ruleRef']['ruleId']]
                binding = bindings[permission['bindingRef']['bindingId']]
                for ref in rule['sourceRefs'] + binding['sourceRefs']:
                    collect(ref['sourceId'], [{'eligibilityId': permission['eligibilityId'],
                            'ruleId': rule['ruleId'], 'bindingId': binding['bindingId'],
                            'entryProfileId': binding['entryProfileId']}])
    return {source: {key: sorted(value) for key, value in target.items()} for source, target in impacts.items()}


def validate_governance(evidence_root, documents, raw_files):
    raw_inventory = read_regular(evidence_root, INVENTORY_PATH)
    require(sha(raw_inventory) == INVENTORY_SHA, 'Accepted source graph changed')
    inventory = json.loads(raw_inventory)
    require(len(inventory['referenceGraph']) == 2136
            and len(inventory['addedReferenceGraph']) == 58
            and len(inventory['historicalCatalogProvenanceGraph']) == 713
            and sum(edge['sourceId'] == 'SRC-AP23B-CH-HOL' for edge in inventory['addedReferenceGraph']) == 8,
            'Incomplete reference edge inventory')
    by_path = {path: json.loads(raw) for path, raw in raw_files.items()}
    catalog = by_path[CATALOG_PATH]
    evidence_to_source = {entry['evidenceId']: entry['sourceId'] for entry in catalog['activation']['sourceIdMap']}
    for edge in inventory['referenceGraph']:
        value = by_path[edge['documentPath']]
        for part in edge['jsonPath'].strip('/').split('/'):
            part = part.replace('~1', '/').replace('~0', '~')
            value = value[int(part)] if isinstance(value, list) else value[part]
        actual = value if isinstance(value, str) else value.get('sourceId', value.get('evidenceId'))
        require(actual == edge['sourceId'] or evidence_to_source.get(actual) == edge['sourceId'],
                f'Actual normative source edge lost: {edge["documentPath"]}#{edge["jsonPath"]}')
    baseline = f'{OUTPUT}/governance-inputs/data/source-reviews'
    raw_old_register = read_regular(evidence_root, f'{baseline}/source-register.json')
    raw_old_index = read_regular(evidence_root, f'{baseline}/index.json')
    require(sha(raw_old_register) == 'dce98663dc83595c9345b1170e5f2aef5c12d665b43e280a83b4f0cc2b611e4f'
            and sha(raw_old_index) == '4e8bd348806bc2b3d824b9264bbadd3e1c65e51bd90a0299e4a15e301380b3b4',
            'Governance before-state changed')
    old_register, old_index = json.loads(raw_old_register), json.loads(raw_old_index)
    register = read_json(evidence_root, 'data/source-reviews/source-register.json')
    index = read_json(evidence_root, 'data/source-reviews/index.json')
    event_id = '2026-10-18-mvp-09-prerelease.1'
    event = read_json(evidence_root, f'data/source-reviews/events/{event_id}.json')
    for name, document in [('source-register.schema.json', register), ('source-review-index.schema.json', index),
                           ('source-review-event.schema.json', event)]:
        schema_check(evidence_root, name, document)
    current_sources = {entry['sourceId']: entry for entry in register['sources']}
    require(len(current_sources) == len(register['sources']) == 255
            and Counter(entry['usageStatus'] for entry in register['sources'])
            == {'productive': 157, 'supporting': 85, 'monitoring': 13}, 'Wrong register cardinalities')
    require(without(register, {'sources', 'scope'}) == without(old_register, {'sources', 'scope'}), 'Register metadata drift')
    require(register['scope']['productiveReleaseIds'] == [*old_register['scope']['productiveReleaseIds'], RELEASE_ID],
            'Register release scope changed')
    require(register['scope']['jurisdictions'] == sorted({entry['jurisdiction'] for entry in register['sources']}),
            'Register jurisdiction inventory does not describe its sources')
    for entry in old_register['sources']:
        require(current_sources.get(entry['sourceId']) == entry, 'Historical registry row altered')
    added_ids = set(current_sources) - {item['sourceId'] for item in old_register['sources']}
    require(added_ids == {item['sourceId'] for item in documents['ch-cantonal-administrative-procedures']['sources']}
            - {row['sourceId'] for row in old_register['sources']}
            and len(added_ids) == 8, 'Unexpected new source IDs')
    for event_name in old_index['generatedFrom']['eventIds']:
        require(read_regular(evidence_root, f'data/source-reviews/events/{event_name}.json')
                == read_regular(evidence_root, f'{baseline}/events/{event_name}.json'), 'Historical source event altered')
    require(len(old_index['generatedFrom']['eventIds']) == 6 and index['generatedFrom']['eventIds']
            == sorted([*old_index['generatedFrom']['eventIds'], event_id]), 'Wrong event history')
    require(index['generatedOn'] == DATE and index['nextAnnualReviewDue'] == '2027-11-15', 'Index review dates changed')
    require(event['reviewEventId'] == event_id and event['recordStatus'] == 'approved'
            and event['comparedReleaseIds'] == [RELEASE_ID], 'Wrong source review event')
    event_rows = {entry['sourceId']: entry for entry in event['entries']}
    require(len(event_rows) == len(event['entries']) == 251
            and set(event_rows) == {entry['sourceId'] for entry in inventory['rows']}, 'Incomplete/extra source event rows')
    impacts = source_impacts(inventory, documents)
    index_rows = {entry['sourceId']: entry for entry in index['sources']}
    require(set(index_rows) == set(current_sources) and len(index['sources']) == 255, 'Source index incomplete/duplicated')
    report_raw = read_regular(evidence_root, f'{OUTPUT}/source-review-completeness.json')
    require(sha(report_raw) == '9f7b578725b3c695e3938e18354de83f47e83556d05a4fbdc653d73043c7482c', 'Accepted source report changed')
    report = json.loads(report_raw)
    reviewed = {row['sourceId']: row for row in report['coverage']}
    administrative_sources = {item['sourceId']: item for item in documents['ch-cantonal-administrative-procedures']['sources']}
    for source_id in added_ids:
        original_source, current = administrative_sources[source_id], current_sources[source_id]
        require(current['usageStatus'] == 'productive' and current['retrievalUrl'] == original_source['url'],
                'New source retrieval identity differs from the accepted administrative catalog')
        official_evidence_urls = {item['url'] for item in reviewed[source_id]['freshEvidence'] if item.get('url')}
        require(current['officialUrl'] in official_evidence_urls and current['officialUrl'].startswith('https://'),
                'New official source URL not grounded in accepted fresh evidence')
        if source_id == 'SRC-AP23E1-ZG-COURT-GUIDANCE':
            require(current['documentVersionDate'] is None, 'Invented court guidance version date')
        if source_id == 'SRC-AP23E1-AR-ARGV-20160101':
            require(current['sourceType'] == 'ordinance', 'AR-ARGV wrongly classified')
        if source_id == 'JUD-AP23E1-LU-5A-872-2020':
            require(current['officialUrl'].startswith('https://search.bger.ch/')
                    and current['retrievalUrl'].startswith('https://entscheidsuche.ch/'), 'Official and mirror provenance merged')
    for source_id, entry in event_rows.items():
        expected = {'resolutionMode': 'explicit', 'releaseIds': [RELEASE_ID],
                    **impacts.get(source_id, {'profileIds': [], 'calendarIds': [], 'componentIds': []})}
        require(entry['affected'] == expected, f'Lost or fabricated source impact: {source_id}')
        require(entry['outcome'] == reviewed[source_id]['outcome'] and entry['reviewedOn'] == DATE,
                'Accepted review outcome changed')
        require(entry['evidence']['finding'].startswith(reviewed[source_id]['rationale']), 'Review rationale was replaced')
        require(set(entry['evidence']['relevantProvisions']) == set(reviewed[source_id]['relevantProvisions']),
                'Reviewed provisions changed')
        current = index_rows[source_id]
        require(current['affected'] == {**without(expected, {'resolutionMode'}), 'locators': []}, 'Index impact differs from event')
        require(current['latestReview'] == {'reviewEventId': event_id, 'recordStatus': 'approved', 'reviewedOn': DATE,
                'outcome': entry['outcome'], 'finding': entry['evidence']['finding'], 'followUp': entry['followUp']['required']},
                'Index review differs from event')
    old_index_rows = {entry['sourceId']: entry for entry in old_index['sources']}
    historical_ids = set(current_sources) - set(event_rows)
    require(historical_ids == set(inventory['historicalRegisterOnlySourceIds']) and len(historical_ids) == 4,
            'Historical-only sources silently dropped or newly approved')
    for source_id in historical_ids:
        require(index_rows[source_id] == old_index_rows[source_id], 'Historical-only index row altered')
    require(event_rows['SRC-AP22-FR-PRAXIS']['outcome'] == 'unclear'
            and event_rows['SRC-AP22-FR-PRAXIS']['affected']['componentIds'] == []
            and event_rows['SRC-AI-RUHETAGE-LISTE-2026']['outcome'] == 'unclear', 'AI/FR reservations silently resolved')
    bridge = read_json(evidence_root, f'{OUTPUT}/source-version-bridges.json')
    require(bridge['retainedMvp08NormBridges'] == report['retainedMvp08NormBridges']
            and bridge['retainedVersionBridges'] == report['retainedVersionBridges'], 'Historical bridge changed')
    baseline_ref = report['currentNormAssessments']['baseline']
    baseline = bound_json(evidence_root, baseline_ref)
    require(bridge['currentAssessmentRef'] == baseline_ref
            and bridge['currentNormAssessments'] == baseline['preservedMvp08NormBridges']
            and bridge['currentIvvEvidence'] == baseline['IVV']
            and bridge['remainingHtmlOnlyAvailabilityChecks'] == baseline['remainingHtmlOnlyAvailabilityChecks'],
            'Current availability or actual IVV comparison dropped')
    require(set(bridge['currentNormAssessments']) == {'AHVG', 'IVG', 'IVV', 'EOG', 'EOV', 'ELG', 'UELG', 'UELV'}
            and {act for row in bridge['currentNormAssessments'].values() for act in row['acts']}
            == {'542', '544', '546', '548', '549'}, 'Wrong five retained AS acts/eight families')
    require(bridge['counts'] == {'retainedAmendingActs': 5, 'retainedAffectedLawFamilies': 8,
            'newNormDeltasComparedWithMvp08': 0, 'usedCalculationRulesChanged': 0}, 'Invented norm changes')
    require(bridge['releaseId'] == RELEASE_ID and bridge['operationalRulesChanged'] is False
            and bridge['runtimeSourcesAdded'] is False and bridge['historicalSourceRecordsUnchanged'] is True
            and bridge['productTemporalLimit'] == '2027-12-31' and bridge['availabilityIsPerLaw'] is True
            and bridge['historicalUnavailableFindingNotCurrent'] is True, 'Bridge claims broader legal release')
    bound_json(evidence_root, bridge['approvalRef'], SOURCE_APPROVAL_PATH, SOURCE_APPROVAL_SHA)
    bound_json(evidence_root, bridge['authorityRef'], LOCAL_APPROVAL_PATH, LOCAL_APPROVAL_SHA)
    adoption = read_json(evidence_root, f'{OUTPUT}/source-governance-adoption.json')
    for item in adoption['evidence']:
        bound_json(evidence_root, item)
    require(adoption['installationAuthorized'] is adoption['publicationAuthorized'] is adoption['operatingApproval'] is False,
            'Governance implies external approval')
    return {'registeredSources': 255, 'reviewedSources': 251, 'sourceEdges': 2136,
            'newAdministrativeSourceEdges': 58, 'historicalProvenanceEdges': 713, 'sourceEvents': 7, 'retainedAmendingActs': 5,
            'amendmentLawFamilies': 8, 'newNormDeltas': 0}


def check_release(directory, evidence_root=ROOT):
    directory, evidence_root = Path(directory), Path(evidence_root)
    source, local = validate_authority(evidence_root)
    candidate_raw = read_regular(CANDIDATE, 'manifest.json')
    require(sha(candidate_raw) == CANDIDATE_SHA, 'Accepted candidate manifest changed')
    candidate = json.loads(candidate_raw)
    raw_manifest = read_regular(directory, 'manifest.json')
    manifest = json.loads(raw_manifest)
    schema_check(evidence_root, 'release-manifest-v9.schema.json', manifest)
    require(manifest['$schema'] == PREFIX + 'release-manifest-v9.schema.json', 'Wrong canonical release schema')
    require(manifest['releaseId'] == RELEASE_ID and manifest['releaseStatus'] == 'approved'
            and manifest['createdOn'] == DATE and manifest['immutable'] is True, 'Wrong release identity/status')
    require(manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '9.0.0',
            'Wrong format/consumer contract')
    require(without(manifest, {'$schema', 'releaseId', 'releaseStatus', 'createdOn', 'sourceSummary', 'artifacts', 'extensions'})
            == without(candidate, {'$schema', 'releaseId', 'releaseStatus', 'createdOn', 'sourceSummary', 'artifacts', 'extensions'}),
            'Manifest changed outside permitted metadata fields')
    require(manifest['sourceSummary'] == {**candidate['sourceSummary'], 'latestReviewedOn': DATE,
            'legalBasisReviewStatus': 'verified', 'technicalValidationStatus': 'passed'}, 'Source inventory/summary drift')
    artifacts = manifest['artifacts']
    require(len(artifacts) == len({item['path'] for item in artifacts}) == 41, 'Expected forty-one unique artifacts')
    descendants = list(directory.rglob('*'))
    require(not any(path.is_symlink() for path in descendants), 'Symlink in runtime inventory')
    actual_files = {path.relative_to(directory).as_posix() for path in descendants if path.is_file()}
    require(actual_files == {'manifest.json', *(item['path'] for item in artifacts)}, 'Missing or extra runtime files')
    original = {item['path']: item for item in candidate['artifacts']}
    require(set(original) == {item['path'] for item in artifacts}, 'Runtime paths changed')
    documents, raw_files, roles, source_ids = {}, {}, Counter(), set()
    for item in artifacts:
        path, role = item['path'], item['role']
        raw = read_regular(directory, path)
        require(sha(raw) == item['sha256'] and len(raw) == item['byteLength'], f'Unsealed runtime bytes: {path}')
        require(without(item, {'sha256', 'byteLength'}) == without(original[path], {'sha256', 'byteLength'}),
                f'Descriptor changed: {path}')
        candidate_bytes = read_regular(CANDIDATE, path)
        require(sha(candidate_bytes) == original[path]['sha256']
                and len(candidate_bytes) == original[path]['byteLength'], f'Accepted candidate component changed: {path}')
        value = json.loads(raw)
        require(value['$schema'] == item['schemaId'] == PREFIX + ROLE_SCHEMAS[role], 'Wrong component schema')
        schema_check(evidence_root, ROLE_SCHEMAS[role], value)
        identifier = 'calendarId' if role == 'calendar' else 'profileId' if role == 'legalProfile' else 'catalogId'
        require(value['dataKind'] == role and value[identifier] == item['contentId']
                and item['contentId'] not in documents, 'Wrong/duplicate component identity')
        documents[item['contentId']] = value
        raw_files[path] = raw
        roles[role] += 1
        source_ids.update(item['sourceId'] for item in value.get('sources', []))
        if role in {'legalProfile', 'specialRegimeCatalog'}:
            require(raw == candidate_bytes, f'Unchanged normative file changed: {path}')
    require(roles == {'legalProfile': 5, 'calendar': 32, 'holidayCatalog': 1, 'specialRegimeCatalog': 1,
                      'socialProcedureCatalog': 1, 'administrativeProcedureCatalog': 1}, 'Component counts changed')
    require(len(source_ids) == 128 and sorted(source_ids) == manifest['sourceSummary']['sourceIds'], 'Manifest sources incomplete')
    catalog = documents['ch-holiday-catalog']
    previous_catalog = read_json(CANDIDATE, CATALOG_PATH)
    historical_catalog = copy.deepcopy(catalog)
    historical_catalog['activation']['releaseEligibility'] = previous_catalog['activation']['releaseEligibility']
    require(historical_catalog == previous_catalog, 'Holiday rules/decisions changed outside release eligibility')
    calendar_permission = catalog['activation']['releaseEligibility']
    require(calendar_permission == {'status': 'approved', 'releaseId': RELEASE_ID,
            'approval': {'by': 'David Steimer', 'on': DATE,
            'evidence': f'{DECISION_PATH} | {SOURCE_APPROVAL_PATH} | sha256:{SOURCE_APPROVAL_SHA}'}},
            'Unbound calendar release permission')
    require(len(catalog['data']['rules']) == 479 and len(catalog['activation']['supplementalRules']) == 12
            and len(catalog['activation']['matrixDecisions']) == 198
            and len(catalog['activation']['procedureBindings']) == 104, 'Calendar cardinalities changed')
    calendars = {identifier: value for identifier, value in documents.items() if value['dataKind'] == 'calendar'}
    validate_calendars(catalog, raw_files[CATALOG_PATH], calendars)
    for identifier, value in calendars.items():
        expected = read_json(CANDIDATE, f'calendars/{identifier}.json')
        expected['projection']['sourceHash'] = sha(raw_files[CATALOG_PATH])
        require(value == expected, f'Calendar projection or historical metadata changed: {identifier}')
    social = documents['ch-social-procedures']
    previous_social = read_json(CANDIDATE, SOCIAL_PATH)
    require(without(social, {'review', 'releaseEligibility'}) == without(previous_social, {'review', 'releaseEligibility'}),
            'Social rules, exclusions or metadata changed')
    require(social['review']['status'] == 'verified' and social['review']['reviewedOn'] == DATE
            and social['review']['reviewedBy'] == 'David Steimer', 'Wrong social review')
    require(len(social['federalRules']) == 44 and len(social['cantonalBindings']) == len(social['releaseEligibility']) == 50,
            'Social cardinality changed')
    previous_permissions = {item['eligibilityId']: item for item in previous_social['releaseEligibility']}
    require(set(previous_permissions) == {item['eligibilityId'] for item in social['releaseEligibility']}, 'Social permission identities changed')
    social_refs = {(item['role'], item['contentId']): item['sha256'] for item in artifacts
                   if item['contentId'] in {'ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'}}
    source_ref = {'reviewId': 'MVP09-SOURCE-APPROVAL-20261018', 'sha256': SOURCE_APPROVAL_SHA}
    for entry in social['releaseEligibility']:
        require(without(entry, {'releaseId', 'status', 'approval', 'sourceReviewRef', 'componentRefs'})
                == without(previous_permissions[entry['eligibilityId']], {'releaseId', 'status', 'approval', 'sourceReviewRef', 'componentRefs'}),
                'Social qualification, rule hashes or reference suite changed')
        require(entry['releaseId'] == RELEASE_ID and entry['status'] == 'approved'
                and entry['sourceReviewRef'] == source_ref, 'Unapproved social permission')
        require(entry['approval'] == {'approvedBy': 'David Steimer', 'approvedOn': DATE, 'decisionRef': DECISION_PATH},
                'Wrong social approval')
        refs = {(item['role'], item['contentId']): item['sha256'] for item in entry['componentRefs']}
        require(len(refs) == len(entry['componentRefs']) and refs == social_refs, 'Stale social components')
        require(entry['caseCoverage'] == entry['calculationCoverage'] == SOCIAL_HORIZON, 'Social horizon expanded')
    require(all(item['procedureContextCanton'] == 'BE' for item in social['cantonalBindings']), 'Non-BE social release')
    # Approval, governance and administrative receipts are checked separately so
    # synthetic failures can pinpoint a forged evidence chain as well as bytes.
    approval = validate_release_evidence(manifest, source, local, evidence_root)
    validate_administrative(documents['ch-cantonal-administrative-procedures'], read_json(CANDIDATE, ADMIN_PATH),
                            artifacts, evidence_root, approval['adminSourceRef'], approval['adminSuiteRef'])
    governance = validate_governance(evidence_root, documents, raw_files)
    return {'status': 'passed', 'releaseId': RELEASE_ID, 'manifestSha256': sha(raw_manifest),
            'runtimeFiles': 42, 'validatedArtifacts': 41, 'unchangedNormativeFiles': 6,
            'calendars': 32, 'catalogRules': 479, 'additionalSoProceduralRules': 12,
            'provenanceDecisions': 198, 'terminalBindings': 104, 'unchangedSocialRules': 44,
            'reboundBernSocialPermissions': 50, 'administrativePaths': 25, 'tiPaths': 5, 'grPaths': 7, 'luPaths': 4, 'zgPaths': 4, 'arPaths': 5,
            'sourceApprovalSha256': SOURCE_APPROVAL_SHA, 'localBuildApprovalSha256': LOCAL_APPROVAL_SHA,
            'historicalSourceMetadataPreserved': True, 'externalDeploymentAuthorized': False, **governance}


if __name__ == '__main__':
    require(len(sys.argv) == 2, 'Pass exactly one release directory')
    print(json.dumps(check_release(Path(sys.argv[1])), ensure_ascii=False))

