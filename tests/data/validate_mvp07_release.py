#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent read-only R07-B validator of actual approved Format-7 bytes.

Historical source review metadata is deliberately preserved. Approval belongs
to the new release envelope, not to a silently redated source or calendar rule.
"""
from __future__ import annotations

import copy
import json
from pathlib import Path, PurePosixPath
import sys

from ap22c1_contract import (ROOT, PREFIX, ROLE_SCHEMAS, require, read_json, sha,
                            check_schema, validate_catalog, validate_calendars)

RELEASE_ID = '2026-10-08-mvp-07-approved.1'
CANDIDATE = ROOT / 'outputs/ap22c3-2026-10-08/bundle'
CANDIDATE_SHA = 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6'
SOURCE_APPROVAL_PATH = 'outputs/release-mvp07-2026-10-08/source-approval.json'
SOURCE_APPROVAL_SHA = '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810'
LOCAL_APPROVAL_PATH = 'outputs/release-mvp07-2026-10-08/local-build-approval.json'
DECISION_PATH = 'docs/betrieb/freigabe-r07-b.md'
CATALOG_PATH = 'holiday-catalogs/ch-holiday-catalog.json'
SOCIAL_PATH = 'social-procedures/ch-social-procedures.json'
SOURCE_REF = {'reviewId': 'MVP07-SOURCE-APPROVAL-20261008', 'sha256': SOURCE_APPROVAL_SHA}


def without(value, keys):
    return {key: item for key, item in value.items() if key not in keys}


def read_regular(base, relative):
    path = PurePosixPath(relative)
    require(not path.is_absolute() and '..' not in path.parts and '\\' not in relative,
            f'Unsafe path: {relative}')
    target = Path(base)
    require(target.is_dir() and not target.is_symlink(), 'Unsafe release directory')
    for part in path.parts:
        target /= part
        require(not target.is_symlink(), f'Symlink is not an immutable release file: {relative}')
    require(target.is_file() and target.resolve().is_relative_to(Path(base).resolve()), 'Missing release file')
    return target.read_bytes()


def validate_authority():
    source_raw = read_regular(ROOT, SOURCE_APPROVAL_PATH)
    require(sha(source_raw) == SOURCE_APPROVAL_SHA, 'Source approval bytes changed')
    source = json.loads(source_raw)
    require(source['permissions']['sourceReviewApproved'] is True, 'Source review not accepted')
    # Preserve the previous decision: it did not already authorise R07-B.
    require(source['permissions']['localDataPromotionAuthorized'] is False
            and source['permissions']['definitiveLocalBuildAuthorized'] is False,
            'Historical source approval was overwritten')
    local_raw = read_regular(ROOT, LOCAL_APPROVAL_PATH)
    local = json.loads(local_raw)
    require(local['kind'] == 'mvp07LocalBuildApproval'
            and local['approvalId'] == '2026-10-08-mvp-07-local-build-approval.1'
            and local['declaration'] == 'Ich gebe R07-B frei.'
            and local['approvedBy'] == 'David Steimer' and local['approvedOn'] == '2026-10-08',
            'Wrong R07-B decision')
    require(local['candidateManifestSha256'] == CANDIDATE_SHA, 'Wrong approved candidate')
    require(local['sourceApproval'] == {'path': SOURCE_APPROVAL_PATH, 'sha256': SOURCE_APPROVAL_SHA},
            'Local authority does not bind the prior source acceptance')
    require(local['decision'] == {'path': DECISION_PATH, 'sha256': sha(read_regular(ROOT, DECISION_PATH))},
            'Unbound local decision document')
    permissions = local['permissions']
    require(permissions == {'localDataPromotionAuthorized': True, 'definitiveLocalBuildAuthorized': True,
                           'localRuntimeDataCommitAuthorized': True, 'installationAuthorized': False,
                           'publicationAuthorized': False, 'hostingChangesAuthorized': False,
                           'operatingApproval': False, 'm365PermissionChangesAuthorized': False,
                           'outlookChangesAuthorized': False, 'testAppCleanupAuthorized': False},
            'Unexpected local or external authority')
    return sha(local_raw)


def check_release(directory):
    directory = Path(directory)
    local_approval_sha = validate_authority()
    raw_manifest = read_regular(directory, 'manifest.json')
    manifest = json.loads(raw_manifest)
    check_schema('release-manifest-v7.schema.json', manifest)
    require(manifest['$schema'] == PREFIX + 'release-manifest-v7.schema.json', 'Wrong approved manifest schema')
    require(manifest['releaseId'] == RELEASE_ID and manifest['releaseStatus'] == 'approved', 'Wrong release identity/status')
    require(manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '7.0.0',
            'Wrong Format-7 compatibility')
    require(manifest['immutable'] is True and manifest['createdOn'] == '2026-10-08', 'Wrong immutable release metadata')
    require(manifest['coverage'] == {'from': '2026-08-29', 'to': None}, 'Expanded temporal scope')
    require(manifest['sourceSummary']['latestReviewedOn'] == '2026-10-08'
            and manifest['sourceSummary']['legalBasisReviewStatus'] == 'verified'
            and manifest['sourceSummary']['technicalValidationStatus'] == 'passed', 'Missing release-level source approval')
    require(sha(read_regular(CANDIDATE, 'manifest.json')) == CANDIDATE_SHA, 'Accepted candidate changed')
    candidate = read_json(CANDIDATE / 'manifest.json')
    approval_extension = manifest['extensions']['steimer.approval']
    require(approval_extension == {
        'approvedBy': 'David Steimer', 'approvedOn': '2026-10-08', 'decisionRef': DECISION_PATH,
        'approvalScope': 'mvp07LocalDataAndReleaseArtifacts', 'contractDecision': 'DEC-2026-030',
        'candidateReleaseId': candidate['releaseId'], 'candidateManifestSha256': CANDIDATE_SHA,
        'sourceReviewRef': SOURCE_REF, 'sourceReviewPath': SOURCE_APPROVAL_PATH,
        'sourceApprovalId': '2026-10-08-mvp-07-source-approval.1',
        'localBuildApproval': {'path': LOCAL_APPROVAL_PATH, 'sha256': local_approval_sha},
        'sourceGovernance': {
            'path': 'outputs/release-mvp07-2026-10-08/source-governance-adoption.json',
            'sha256': sha(read_regular(ROOT, 'outputs/release-mvp07-2026-10-08/source-governance-adoption.json'))},
        'sourceVersionBridges': {
            'path': 'outputs/release-mvp07-2026-10-08/source-version-bridges.json',
            'sha256': sha(read_regular(ROOT, 'outputs/release-mvp07-2026-10-08/source-version-bridges.json'))},
        'historicalSourceMetadataUnchanged': True}, 'Unbound release approval or extra approval claim')
    require(manifest['extensions'] == {'steimer.approval': approval_extension, 'steimer.release-preparation': {
        'preparedOn': '2026-10-08', 'appVersion': '0.7.0',
        'sourceRefresh': 'acceptedWithDocumentedReuseAndReservations', 'publicationApproved': False,
        'deploymentApproved': False, 'productionActivation': False, 'operatingApproval': 'requiresSeparateDecision'}},
        'External permissions or release preparation contract changed')
    for key in ['coverage', 'profileIds', 'calendarIds', 'specialRegimeCatalogIds', 'holidayCatalogIds', 'socialProcedureCatalogIds']:
        require(manifest[key] == candidate[key], f'Inventory or coverage drift: {key}')
    artifacts = manifest['artifacts']
    require(len(artifacts) == len({item['path'] for item in artifacts}) == 40, 'Expected forty unique artifacts')
    descendants = list(directory.rglob('*'))
    require(not any(path.is_symlink() for path in descendants), 'Symlink in runtime inventory')
    actual_files = {str(path.relative_to(directory)).replace('\\', '/') for path in descendants if path.is_file()}
    require(actual_files == {'manifest.json', *(item['path'] for item in artifacts)}, 'Missing or extra runtime files')
    documents, raw_files, sources = {}, {}, set()
    roles = {role: set() for role in ROLE_SCHEMAS}
    previous_artifacts = {item['path']: item for item in candidate['artifacts']}
    require(set(previous_artifacts) == {item['path'] for item in artifacts}, 'Runtime paths changed')
    for item in artifacts:
        path, role = item['path'], item['role']
        raw = read_regular(directory, path)
        require(len(raw) == item['byteLength'] and sha(raw) == item['sha256'], f'Unbound artifact: {path}')
        require(without(item, {'sha256', 'byteLength'}) == without(previous_artifacts[path], {'sha256', 'byteLength'}),
                f'Descriptor identity changed: {path}')
        value = json.loads(raw)
        require(value['$schema'] == item['schemaId'] == PREFIX + ROLE_SCHEMAS[role], f'Wrong schema: {path}')
        check_schema(ROLE_SCHEMAS[role], value)
        require(value['dataKind'] == role, f'Wrong role: {path}')
        id_key = 'calendarId' if role == 'calendar' else 'profileId' if role == 'legalProfile' else 'catalogId'
        require(value[id_key] == item['contentId'] and item['contentId'] not in documents, 'Wrong/duplicate content ID')
        documents[item['contentId']] = value
        raw_files[path] = raw
        roles[role].add(item['contentId'])
        sources.update(source['sourceId'] for source in value.get('sources', []))
        if role in {'legalProfile', 'specialRegimeCatalog'}:
            require(raw == read_regular(CANDIDATE, path), f'Historic normative file changed: {path}')
    require({key: len(value) for key, value in roles.items()} == {
        'legalProfile': 5, 'calendar': 32, 'holidayCatalog': 1, 'specialRegimeCatalog': 1, 'socialProcedureCatalog': 1},
        'Wrong component role counts')
    for role, key in [('calendar', 'calendarIds'), ('legalProfile', 'profileIds'), ('holidayCatalog', 'holidayCatalogIds'),
                      ('specialRegimeCatalog', 'specialRegimeCatalogIds'), ('socialProcedureCatalog', 'socialProcedureCatalogIds')]:
        require(roles[role] == set(manifest[key]), 'Manifest role inventory mismatch')
    require(sorted(sources) == sorted(manifest['sourceSummary']['sourceIds']) == candidate['sourceSummary']['sourceIds'],
            'Operational source inventory drift')
    catalog = documents['ch-holiday-catalog']
    original_catalog = read_json(CANDIDATE / CATALOG_PATH)
    release_binding = catalog['activation']['releaseEligibility']
    require(release_binding['status'] == 'approved' and release_binding['releaseId'] == RELEASE_ID,
            'Missing calendar release permission')
    require(release_binding['approval']['by'] == 'David Steimer' and release_binding['approval']['on'] == '2026-10-08',
            'Calendar approval must identify the actual decision')
    require(release_binding['approval']['evidence'] == f'{DECISION_PATH} | {SOURCE_APPROVAL_PATH} | sha256:{SOURCE_APPROVAL_SHA}',
            'Calendar release approval does not bind source acceptance and R07-B')
    historical_catalog = copy.deepcopy(catalog)
    historical_catalog['activation']['releaseEligibility'] = original_catalog['activation']['releaseEligibility']
    require(historical_catalog == original_catalog, 'Calendar promotion changed something other than release eligibility')
    # This normalisation is exclusively for checking the historic candidate's
    # contract. The actual approved catalog was schema-checked above unchanged.
    validate_catalog(historical_catalog, json.dumps(historical_catalog, ensure_ascii=False).encode())
    calendars = {key: documents[key] for key in roles['calendar']}
    validate_calendars(catalog, raw_files[CATALOG_PATH], calendars)
    for key, calendar in calendars.items():
        previous = read_json(CANDIDATE / f'calendars/{key}.json')
        expected = copy.deepcopy(previous)
        expected['projection']['sourceHash'] = sha(raw_files[CATALOG_PATH])
        require(calendar == expected, f'Calendar semantics or historical provenance changed: {key}')
    social = documents['ch-social-procedures']
    previous_social = read_json(CANDIDATE / SOCIAL_PATH)
    require(without(social, {'review', 'releaseEligibility'}) == without(previous_social, {'review', 'releaseEligibility'}),
            'The unchanged social rules/bindings were altered')
    require(social['review']['status'] == 'verified' and social['review']['reviewedOn'] == '2026-10-08'
            and social['review']['reviewedBy'] == 'David Steimer', 'Missing social release-level review')
    require(len(social['federalRules']) == 44 and len(social['cantonalBindings']) == len(social['releaseEligibility']) == 50,
            'Social cardinality changed')
    require(all(binding['procedureContextCanton'] == 'BE' for binding in social['cantonalBindings']), 'Social canton scope changed')
    previous_entries = {entry['eligibilityId']: entry for entry in previous_social['releaseEligibility']}
    expected_refs = {(item['role'], item['contentId']): item['sha256'] for item in artifacts
                     if item['contentId'] in {'ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'}}
    require(set(previous_entries) == {entry['eligibilityId'] for entry in social['releaseEligibility']}, 'Social eligibility IDs changed')
    for entry in social['releaseEligibility']:
        previous = previous_entries[entry['eligibilityId']]
        require(without(entry, {'releaseId', 'status', 'approval', 'sourceReviewRef', 'componentRefs'})
                == without(previous, {'releaseId', 'status', 'approval', 'sourceReviewRef', 'componentRefs'}),
                'Social qualification, hashes, horizons or reference-suite changed')
        require(entry['releaseId'] == RELEASE_ID and entry['status'] == 'approved', 'Social release not approved')
        require(entry['approval'] == {'approvedBy': 'David Steimer', 'approvedOn': '2026-10-08', 'decisionRef': DECISION_PATH},
                'Social approval does not bind R07-B')
        require(entry['sourceReviewRef'] == SOURCE_REF, 'Wrong social source acceptance')
        refs = {(item['role'], item['contentId']): item['sha256'] for item in entry['componentRefs']}
        require(len(refs) == len(entry['componentRefs']) and refs == expected_refs, 'Social component bytes are not bound')
        require(entry['caseCoverage'] == entry['calculationCoverage'] == {'from': '2026-01-01', 'to': '2027-12-31'},
                'Social horizon expanded')
    return {'status': 'passed', 'releaseId': RELEASE_ID, 'manifestSha256': sha(raw_manifest),
            'runtimeFiles': 41, 'validatedArtifacts': 40, 'unchangedNormativeFiles': 6,
            'calendars': 32, 'catalogRules': 479, 'additionalSoProceduralRules': 12,
            'provenanceDecisions': 198, 'terminalBindings': 104,
            'unchangedSocialRules': 44, 'reboundBernSocialPermissions': 50,
            'localBuildApprovalSha256': local_approval_sha, 'sourceApprovalSha256': SOURCE_APPROVAL_SHA,
            'historicalSourceMetadataPreserved': True, 'externalDeploymentAuthorized': False}


if __name__ == '__main__':
    require(len(sys.argv) == 2, 'Pass exactly one release directory')
    print(json.dumps(check_release(Path(sys.argv[1])), ensure_ascii=False))
