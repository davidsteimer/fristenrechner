#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent, read-only R10-B verification of all actual Format-17 bytes.

No TypeScript reader, promotion helper or source writer is imported. The
accepted candidate and R2 baseline are separate immutable oracles. Every
normative field must survive unchanged even when a mutation is resealed.
"""
from __future__ import annotations

import copy
import json
import sys
from collections import Counter
from functools import lru_cache
from pathlib import Path, PurePosixPath

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

from ap22c1_contract import ROOT, PREFIX, require, sha

DATE = '2026-10-28'
RELEASE_ID = '2026-10-28-mvp-010-approved.1'
OUTPUT = 'outputs/release-mvp10-2026-10-28'
CANDIDATE_PATH = 'data/candidates/2026-10-28-ap23m3'
CANDIDATE = ROOT / CANDIDATE_PATH
CANDIDATE_SHA = '4519b40136fd533600b7cda85d941c87dfc14826325a5e542534e5257cedddad'
LOCAL_APPROVAL_PATH = f'{OUTPUT}/r10b-execution-approval.json'
LOCAL_APPROVAL_SHA = '595664f96384230fa8941ae1ac3b388c1d213f38596fe9913785966ed45e2e5c'
SOURCE_APPROVAL_PATH = f'{OUTPUT}/source-approval.json'
# Bound only after the source lane produced and verified these actual bytes.
# The TypeScript promoter still obtains this binding dynamically at execution.
SOURCE_APPROVAL_SHA = '992dbec1d485629941133617d458e01e98be73f65eeb9100d942be3cba649776'
DECISION_PATH = 'docs/betrieb/freigabe-r10-b.md'
PROPOSAL_PATH = 'outputs/r10-b-vorbereitung-2026-10-28/r10b-proposal-r2.json'
PROPOSAL_SHA = '63784d635301c99416cbb49b23cac1260539d891b05e7094ba2d9bb654b13ec5'
ACCEPTANCE_PATH = 'outputs/r10-a2-abnahme-2026-10-28/receipt.json'
ACCEPTANCE_SHA = '6687d720296645439b66beb6c654e79b776df7d44252751d870838749e49db52'
COMMON_PATH = 'outputs/r10-a2-2026-10-28/common-completion.json'
COMMON_SHA = '7a5a93d7e8147d0de9013e645343ef9a346ba3c77ee98085fb1db92b376ebbb1'
INVENTORY_PATH = 'outputs/r10-a1-2026-10-28/sources/source-inventory.json'
INVENTORY_SHA = 'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6'
CATALOG_PATH = 'holiday-catalogs/ch-holiday-catalog.json'
SOCIAL_PATH = 'social-procedures/ch-social-procedures.json'
ADMIN_PATH = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
SOCIAL_HORIZON = {'from': '2026-01-01', 'to': '2027-12-31'}
ROLE_SCHEMAS = {
    'legalProfile': 'legal-profile.schema.json',
    'calendar': 'calendar-rules-v3.schema.json',
    'holidayCatalog': 'holiday-catalog-v2.schema.json',
    'specialRegimeCatalog': 'special-regime-catalog-v3.schema.json',
    'socialProcedureCatalog': 'social-procedure-catalog-v2.schema.json',
    'administrativeProcedureCatalog': 'administrative-procedure-catalog-v10.schema.json',
}


def without(value, keys):
    return {key: item for key, item in value.items() if key not in keys}


def object_sha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def read_regular(base, relative):
    path = PurePosixPath(relative)
    require(isinstance(relative, str) and relative and not path.is_absolute()
            and '..' not in path.parts and '\\' not in relative and str(path) == relative,
            f'Unsafe path: {relative}')
    target = Path(base)
    require(target.is_dir() and not target.is_symlink(), 'Unsafe base directory')
    for part in path.parts:
        target /= part
        require(not target.is_symlink(), f'Symlink in runtime/evidence: {relative}')
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


def exact_json(base, path, expected_sha):
    raw = read_regular(base, path)
    require(sha(raw) == expected_sha, f'Accepted evidence changed: {path}')
    return json.loads(raw)


@lru_cache(maxsize=None)
def baseline_rows(base):
    proposal = exact_json(base, PROPOSAL_PATH, PROPOSAL_SHA)
    baseline = bound_json(base, proposal['baseline'])
    return {row['path']: row for row in baseline['files']}


def protected_json(base, path):
    rows = baseline_rows(str(base))
    require(path in rows, f'Evidence was not protected by R2: {path}')
    return bound_json(base, rows[path], path)


@lru_cache(maxsize=1)
def schema_registry(base):
    # Never fetch schemas. Every loaded schema is an unchanged R2-protected input.
    schemas = {}
    # Only canonical published schemas participate in this approved reader.
    # Historical candidate schemas deliberately reuse some old canonical IDs.
    for path in (Path(base) / 'schemas').glob('*.schema.json'):
        relative = path.relative_to(base).as_posix()
        item = protected_json(base, relative)
        if '$id' in item:
            if item['$id'] in schemas:
                require(schemas[item['$id']] == item, 'Conflicting local schema identity')
            schemas[item['$id']] = item
    registry = Registry().with_resources((key, Resource.from_contents(item)) for key, item in schemas.items())
    return schemas, registry


def schema_check(base, name, value):
    schemas, registry = schema_registry(str(base))
    schema = schemas[PREFIX + name]
    Draft202012Validator.check_schema(schema)
    errors = sorted(Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())
                    .iter_errors(value), key=lambda error: str(error.absolute_path))
    require(not errors, f'{name}: {errors[0].message if errors else ""}')


def validate_authority(base):
    local = exact_json(base, LOCAL_APPROVAL_PATH, LOCAL_APPROVAL_SHA)
    require(local['status'] == 'approved-local-execution-only' and local['approvedBy'] == 'David Steimer',
            'Local authority is not the accepted execution decision')
    expected_permissions = {
        'localDataPromotionAuthorized': True, 'definitiveLocalBuildAuthorized': True,
        'localRuntimeDataCommitAuthorized': True, 'localRecoveryBuildAuthorized': True,
        'installationAuthorized': False, 'uploadAuthorized': False, 'additionalCommitsAuthorized': False,
        'publicationAuthorized': False, 'recoveryExecutionAuthorized': False, 'operatingApproval': False,
        'outlookImportsAuthorized': False, 'm365PermissionChangesAuthorized': False, 'hostingChangesAuthorized': False}
    require(local['permissions'] == expected_permissions, 'Execution authority expanded')
    for reference in ('proposal', 'preparationProof', 'template', 'decision', 'a2Acceptance', 'sourceAdoptionPlan', 'protection'):
        bound_json(base, local[reference]) if reference not in {'template', 'decision'} else bound_bytes(base, local[reference])
    proposal = bound_json(base, local['proposal'], PROPOSAL_PATH, PROPOSAL_SHA)
    bound_json(base, proposal['baseline'])
    require(local['versions'] == proposal['proposedVersions']
            and local['singleLocalDataCommit'] == proposal['plannedSingleLocalDataCommit'], 'Bound versions or data paths changed')
    require(f'> {local["declaration"]}' in read_regular(base, DECISION_PATH).decode(), 'Human decision not recorded')
    acceptance = exact_json(base, ACCEPTANCE_PATH, ACCEPTANCE_SHA)
    common = exact_json(base, COMMON_PATH, COMMON_SHA)
    require(acceptance['sourceReviewAccepted'] is True and acceptance['r10BExecutionAuthorized'] is False
            and common['humanApproval'] is False and common['sourceReleaseApproved'] is False,
            'A2 technical report, human source acceptance and execution authority were merged')
    source_raw = read_regular(base, SOURCE_APPROVAL_PATH)
    require(sha(source_raw) == SOURCE_APPROVAL_SHA, 'Actual accepted source-only receipt changed')
    source = json.loads(source_raw)
    require(source['approvedOn'] == DATE and source['approvedBy'] == 'David Steimer'
            and source['recordStatus'] == 'approved' and source['humanSourceApproval'] is True,
            'Source acceptance is missing')
    for field in ('sourceReleaseApproved', 'dataPromotionApproved', 'buildApproved', 'commitApproved',
                  'publicationApproved', 'operatingApproval'):
        require(source[field] is False, f'Source-only approval expanded: {field}')
    bound_json(base, source['acceptanceRef'], ACCEPTANCE_PATH, ACCEPTANCE_SHA)
    bound_json(base, source['commonReviewRef'], COMMON_PATH, COMMON_SHA)
    bound_json(base, source['sourceAdoptionPlanRef'], local['sourceAdoptionPlan']['path'], local['sourceAdoptionPlan']['sha256'])
    require(source['declaration'] == acceptance['userStatement'], 'Source declaration changed')
    source_ids = sorted(row['sourceId'] for row in common['sources'])
    require(source['acceptedSourceIds'] == source_ids and len(set(source_ids)) == 380, 'Source approval scope is incomplete')
    require(source['scope'] == {'sourceIds': 380, 'actualUses': 5045, 'retainedUses': 2136, 'newUses': 2909,
            'lots': 12, 'administrativePaths': 245, 'additionalCasesApproved': False,
            'socialRules': 44, 'socialBindings': 50, 'socialOperativeCantons': ['BE'], 'socialCoverage': SOCIAL_HORIZON,
            'allOriginalsFreshlyRead': False, 'unlimitedFutureStabilityProof': False},
            'Source scope or social boundaries changed')
    return local, source, sha(source_raw), common


def bound_bytes(base, reference):
    raw = read_regular(base, reference['path'])
    require(sha(raw) == reference['sha256'] and len(raw) == reference['byteLength'], 'Evidence byte binding failed')
    return raw


def suite_paths():
    paths = ['tests/golden/candidates/ap23b-administrative.json',
             'outputs/ap23d3-2026-10-15/QA-AP23D3.json', 'outputs/ap23d3-abnahme-2026-10-15/receipt.json',
             'tests/golden/candidates/ap23e1-administrative.json', 'outputs/ap23e2-2026-10-18/QA-AP23E2.json',
             'outputs/ap23e3-2026-10-18/QA-AP23E3.json', 'outputs/ap23e3-abnahme-2026-10-18/receipt.json']
    for letter, qa_date, candidate, receipt_date in [
            ('f', '2026-10-22', False, '2026-10-22'), ('g', '2026-10-22', False, '2026-10-22'),
            ('h', '2026-10-22', False, '2026-10-22'), ('i', '2026-10-22', True, '2026-10-27'),
            ('j', '2026-10-27', True, '2026-10-27'), ('k', '2026-10-27', True, '2026-10-27'),
            ('l', '2026-10-27', True, '2026-10-27'), ('m', '2026-10-28', True, '2026-10-28')]:
        paths += [f'docs/fachrecht/ap23{letter}1/referenzfaelle.json',
                  f'outputs/ap23{letter}2{"-candidate" if candidate else ""}-{qa_date}/QA-AP23{letter.upper()}2.json',
                  f'outputs/ap23{letter}3-{qa_date}/QA-AP23{letter.upper()}3.json',
                  f'outputs/ap23{letter}3-abnahme-{receipt_date}/receipt.json']
    return paths


def reference_rows(base):
    rows = dict(baseline_rows(str(base)))
    anchors = []

    def anchor(reference):
        value = bound_json(base, reference)
        raw = read_regular(base, reference['path'])
        anchors.append({'path': reference['path'], 'sha256': reference['sha256'], 'byteLength': len(raw)})
        return value

    old_manifest = anchor(rows['data/releases/2026-10-18-mvp-09-approved.1/manifest.json'])
    old_suite = anchor(old_manifest['extensions']['steimer.approval']['administrativeReferenceSuite'])
    for row in old_suite['evidence']:
        rows.setdefault(row['path'], row)
    g1 = anchor(rows['outputs/ap23g1-abnahme-2026-10-22/receipt.json'])
    f3_ref = next(row for row in g1['previousF3References'] if row['path'] == 'outputs/ap23f3-abnahme-2026-10-22/receipt.json')
    f3 = anchor(f3_ref)
    rows[f3_ref['path']] = anchors[-1]
    for row in f3['artifacts']:
        rows.setdefault(row['path'], row)
    return rows, anchors


def validate_release_evidence(manifest, base, source, source_sha):
    extensions = manifest['extensions']
    require(set(extensions) == {'steimer.approval', 'steimer.release-preparation'}, 'Unexpected release extension')
    approval = extensions['steimer.approval']
    expected = {'approvedBy': 'David Steimer', 'approvedOn': DATE, 'decisionRef': DECISION_PATH,
                'approvalScope': 'mvp10LocalDataAndReleaseArtifacts', 'contractDecision': 'DEC-2026-042',
                'candidateReleaseId': '2026-10-28-ap23m3-candidate.1', 'candidateManifestSha256': CANDIDATE_SHA,
                'sourceReviewRef': {'reviewId': 'MVP10-SOURCE-APPROVAL-20261028', 'sha256': source_sha},
                'sourceReviewPath': SOURCE_APPROVAL_PATH, 'sourceApprovalId': source['approvalId'],
                'localBuildApproval': {'path': LOCAL_APPROVAL_PATH, 'sha256': LOCAL_APPROVAL_SHA},
                'historicalSourceMetadataUnchanged': True}
    require(without(approval, {'sourceGovernance', 'sourceVersionBridges', 'administrativeReferenceSuite'}) == expected,
            'Unbound release approval, source identity or local authority')
    require(extensions['steimer.release-preparation'] == {
        'preparedOn': DATE, 'appVersion': '0.10.0', 'sourceRefresh': 'acceptedWithDocumentedReuseAndReservations',
        'publicationApproved': False, 'deploymentApproved': False, 'productionActivation': False,
        'operatingApproval': 'requiresSeparateDecision'}, 'Release metadata grants external authority')
    for key, filename in [('sourceGovernance', 'source-governance-adoption.json'),
                          ('sourceVersionBridges', 'source-version-bridges.json'),
                          ('administrativeReferenceSuite', 'administrative-reference-suite.json')]:
        bound_json(base, approval[key], f'{OUTPUT}/{filename}')
    suite = bound_json(base, approval['administrativeReferenceSuite'])
    require(suite['suiteId'] == 'mvp10-administrative-reference-suite' and suite['recordedOn'] == DATE
            and suite['releaseId'] == RELEASE_ID and suite['candidateManifestSha256'] == CANDIDATE_SHA
            and suite['newHostTestingClaimed'] is False and suite['noAdditionalCases'] is True,
            'Reference suite expanded or unbound')
    expected_paths = suite_paths()
    require([row['path'] for row in suite['evidence']] == expected_paths and len(expected_paths) == 39,
            'Reference suite substituted actual accepted oracles')
    expected_rows, anchors = reference_rows(base)
    require(suite['identityAnchors'] == anchors, 'Reference identity chain changed')
    for row in suite['evidence']:
        protected = expected_rows[row['path']]
        require(row == {key: protected[key] for key in ('path', 'sha256', 'byteLength')}, 'Reference oracle resealed')
        bound_bytes(base, row)
    return {'id': 'mvp10-source-approval-20261028', 'sha256': source_sha}, {'id': suite['suiteId'], 'sha256': approval['administrativeReferenceSuite']['sha256']}


def references(binding):
    return binding.get('physicalSource', binding.get('physicalBaseline'))


def validate_administrative(current, previous, artifacts, source_ref, suite_ref):
    require(without(current, {'review', 'releaseBinding', 'holidayBindings'})
            == without(previous, {'review', 'releaseBinding', 'holidayBindings'}),
            'Administrative legal content, historical metadata or qualification changed')
    require(current['runtimeActive'] is False and current['contractStatus'] == 'approved', 'Runtime or contract status changed')
    require(len(current['paths']) == len(current['qualificationPolicies']) == 245
            and len(current['holidayBindings']) == 36 and len(current['suspensionProfiles']) == 46,
            'Administrative cardinalities changed')
    require(set(current['review']) == {'basis', 'sourceReview', 'checkedOn'} and current['review']['checkedOn'] == DATE
            and current['review']['basis'].strip() and current['review']['sourceReview'].strip(), 'Unqualified administrative review')
    descriptors = {(row['role'], row['contentId']): row for row in artifacts}
    union = {}
    for old, now in zip(previous['holidayBindings'], current['holidayBindings']):
        field = 'physicalSource' if 'physicalSource' in old else 'physicalBaseline'
        require(without(now, {field}) == without(old, {field}), 'Calendar selection, legal binding or procedural supplement changed')
        require(without(now[field], {'releaseId', 'references'}) == without(old[field], {'releaseId', 'references'})
                and now[field]['releaseId'] == RELEASE_ID, 'Physical source identity changed')
        require(len(now[field]['references']) == len(old[field]['references']), 'Physical dependency removed/added')
        for a, b in zip(old[field]['references'], now[field]['references']):
            require(without(a, {'sha256'}) == without(b, {'sha256'}), 'Physical dependency identity changed')
            descriptor = descriptors[(b['role'], b['contentId'])]
            require(b['path'] == descriptor['path'] and b['sha256'] == descriptor['sha256'], 'Stale physical target bytes')
            target = {key: b[key] for key in ('role', 'contentId', 'sha256')}
            require(b['contentId'] not in union or union[b['contentId']] == target, 'Conflicting shared physical bytes')
            union[b['contentId']] = target
    require(len(union) == 34, 'Administrative dependency union is not 34')
    release = current['releaseBinding']
    require(without(release, {'status', 'releaseId', 'approval', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'pathEligibility'})
            == without(previous['releaseBinding'], {'status', 'releaseId', 'approval', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'pathEligibility'}),
            'Administrative promotion requirement changed')
    require(release['status'] == 'approved' and release['releaseId'] == RELEASE_ID
            and release['approval'] == {'approvedBy': 'David Steimer', 'approvedOn': DATE, 'decisionRef': DECISION_PATH}
            and release['sourceReviewRef'] == source_ref and release['referenceSuiteRef'] == suite_ref,
            'Unbound administrative release permission')
    require({row['contentId']: row for row in release['targetComponentRefs']} == union
            and len(release['targetComponentRefs']) == 34, 'Incomplete global component union')
    paths = {row['pathId']: row for row in current['paths']}
    policies = {row['pathId']: row for row in current['qualificationPolicies']}
    bindings = {row['holidayBindingId']: row for row in current['holidayBindings']}
    suspensions = {row['suspensionProfileId']: row for row in current['suspensionProfiles']}
    entries = release['pathEligibility']
    require(len(entries) == len({row['pathId'] for row in entries}) == 245, 'Duplicate or incomplete eligibility')
    mutable = {'status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256'}
    for old, entry in zip(previous['releaseBinding']['pathEligibility'], entries):
        require(without(entry, mutable) == without(old, mutable), 'Path qualifications, hashes or windows changed')
        path, policy, binding = paths[entry['pathId']], policies[entry['pathId']], bindings[entry['holidayBindingId']]
        require(entry['status'] == 'approved' and entry['sourceReviewRef'] == source_ref
                and entry['referenceSuiteRef'] == suite_ref, 'Path lacks source/suite approval')
        require(entry['pathSha256'] == object_sha(path) and entry['pathRevision'] == path['revision']
                and entry['holidayBindingSha256'] == object_sha(binding)
                and entry['qualificationPolicySha256'] == object_sha(policy), 'Path/binding/policy hash chain broken')
        require(policy['pathSha256'] == object_sha(path) and policy['pathRevision'] == path['revision'], 'Policy path chain broken')
        expected = [{key: row[key] for key in ('role', 'contentId', 'sha256')} for row in references(binding)['references']]
        require(entry['targetComponentRefs'] == expected, 'Path target bytes do not match its actual binding')
        for key in ('caseCoverage', 'calculationCoverage'):
            require(entry[key] == path['temporalBinding'][key], 'Path window changed')
        for name, value in [('openingPolicy', path.get('openingPolicy')),
                            ('suspensionSelection', path.get('suspensionSelection')),
                            ('calendarSelection', binding.get('calendarSelection')),
                            ('annualEndShiftPolicy', binding.get('annualEndShiftPolicy')),
                            ('proceduralCalendarSupplement', binding.get('proceduralCalendarSupplement'))]:
            hash_key = name + 'Sha256'
            if hash_key in entry:
                require(entry[hash_key] == object_sha(value), f'Broken explicit {name} chain')
        if 'durationPolicySha256' in entry:
            require(entry['durationPolicySha256'] == object_sha(path['duration']), 'Duration policy hash changed')
        if 'suspensionProfiles' in entry:
            selection = path['suspensionSelection']
            ids = ([selection['suspensionProfileId']] if selection['kind'] == 'fixed'
                   else [case['suspensionProfileId'] for case in selection['cases']])
            require(entry['suspensionProfiles'] == [{'suspensionProfileId': key, 'sha256': object_sha(suspensions[key])}
                    for key in sorted(set(ids))], 'Incomplete suspension-profile closure')
        else:
            require(entry['suspensionProfileSha256'] == object_sha(suspensions[path['suspensionProfileId']]),
                    'Broken historical suspension profile chain')


def validate_governance(base, documents, raw_files, source, common):
    """Independently close source IDs, actual pointers and append-only history."""
    inventory = exact_json(base, INVENTORY_PATH, INVENTORY_SHA)
    require(len(inventory['referenceGraph']) == 5045 and len(inventory['addedReferenceGraph']) == 2909,
            'Accepted reference graph changed')
    by_path = {path: json.loads(raw) for path, raw in raw_files.items()}
    catalog = by_path[CATALOG_PATH]
    aliases = {row['evidenceId']: row['sourceId'] for row in catalog['activation']['sourceIdMap']}
    for edge in inventory['referenceGraph']:
        value = by_path[edge['documentPath']]
        for part in edge['jsonPath'].strip('/').split('/'):
            key = part.replace('~1', '/').replace('~0', '~')
            value = value[int(key)] if isinstance(value, list) else value[key]
        actual = value if isinstance(value, str) else value.get('sourceId', value.get('evidenceId'))
        require(actual == edge['sourceId'] or aliases.get(actual) == edge['sourceId'], 'Normative source edge changed')
    register = read_json(base, 'data/source-reviews/source-register.json')
    index = read_json(base, 'data/source-reviews/index.json')
    event_id = '2026-10-28-mvp-010-prerelease.1'
    event = read_json(base, f'data/source-reviews/events/{event_id}.json')
    for name, value in [('source-register.schema.json', register), ('source-review-index.schema.json', index), ('source-review-event.schema.json', event)]:
        schema_check(base, name, value)
    protection = bound_json(base, exact_json(base, LOCAL_APPROVAL_PATH, LOCAL_APPROVAL_SHA)['protection'])
    snapshots = {row['path']: row for row in protection['snapshots']}
    old_register_row = snapshots['data/source-reviews/source-register.json']
    old_index_row = snapshots['data/source-reviews/index.json']
    old_register = json.loads(bound_bytes(base, {**old_register_row, 'path': old_register_row['archivedAt']}))
    old_index = json.loads(bound_bytes(base, {**old_index_row, 'path': old_index_row['archivedAt']}))
    current = {row['sourceId']: row for row in register['sources']}
    require(len(current) == len(register['sources']) == 384 and len(old_register['sources']) == 255, 'Register cardinality changed')
    require(without(register, {'sources', 'scope'}) == without(old_register, {'sources', 'scope'}), 'Register metadata changed')
    require(register['scope']['productiveReleaseIds'] == [*old_register['scope']['productiveReleaseIds'], RELEASE_ID]
            and register['scope']['jurisdictions'] == sorted({row['jurisdiction'] for row in register['sources']}),
            'Register scope does not match actual sources')
    for row in old_register['sources']:
        require(current.get(row['sourceId']) == row, 'Historical source row changed')
    adoption_plan = bound_json(base, source['sourceAdoptionPlanRef'])
    added = set(current) - {row['sourceId'] for row in old_register['sources']}
    require(added == {row['sourceId'] for row in adoption_plan['rows']} and len(added) == 129, 'New register IDs differ from explicit approved mapping')
    for row in adoption_plan['rows']:
        target = current[row['sourceId']]
        for key in ('usageStatus', 'sourceType', 'retrievalUrl', 'officialUrl', 'jurisdiction'):
            expected = row['targetSourceType'] if key == 'sourceType' else row[key]
            require(target[key] == expected, f'Unapproved source adoption: {row["sourceId"]}:{key}')
    require(len(old_index['generatedFrom']['eventIds']) == 7 and index['generatedFrom']['eventIds']
            == sorted([*old_index['generatedFrom']['eventIds'], event_id]), 'Source event history changed')
    rows = baseline_rows(str(base))
    for event_name in old_index['generatedFrom']['eventIds']:
        path = f'data/source-reviews/events/{event_name}.json'
        bound_bytes(base, rows[path])
    require(event['recordStatus'] == 'approved' and event['reviewEventId'] == event_id
            and event['comparedReleaseIds'] == [RELEASE_ID], 'Wrong review event identity/status')
    require(event['recordedOn'] == DATE and event['reviewWindow'] == {'from': DATE, 'to': DATE}
            and event['nextAnnualReviewDue'] == index['nextAnnualReviewDue'] == '2026-11-15'
            and index['generatedOn'] == DATE, 'Source dates or ordinary November review changed')
    reviewed_ids = set(source['acceptedSourceIds'])
    event_rows = {row['sourceId']: row for row in event['entries']}
    require(set(event_rows) == reviewed_ids and len(event['entries']) == 380, 'Review event incomplete/duplicated')
    indexed = {row['sourceId']: row for row in index['sources']}
    require(len(index['sources']) == len(indexed) == 384 and set(indexed) == set(current), 'Source index incomplete')
    old_indexed = {row['sourceId']: row for row in old_index['sources']}
    historical = set(current) - reviewed_ids
    require(historical == set(inventory['historicalRegisterOnlySourceIds']) and len(historical) == 4,
            'Historical-only source promoted or lost')
    for source_id in historical:
        require(indexed[source_id] == old_indexed[source_id], 'Historical-only index row changed')
    component_keys = {'componentId', 'ruleId', 'deadlineDefinitionId', 'filingProfileId', 'regimeId',
                      'suspensionSetId', 'bindingId', 'contextRouteId', 'calendarBindingId', 'eligibilityId',
                      'excludedPathId', 'pathId', 'lawId', 'holidayBindingId', 'suspensionProfileId', 'qualificationPolicyId'}
    impacts = {}
    for edge in inventory['referenceGraph']:
        impact = impacts.setdefault(edge['sourceId'], {'profileIds': set(), 'calendarIds': set(), 'componentIds': set()})
        if edge.get('profileId'):
            impact['profileIds'].add(edge['profileId'])
        if edge.get('calendarId'):
            impact['calendarIds'].add(edge['calendarId'])
        impact['componentIds'].update(edge[key] for key in component_keys if isinstance(edge.get(key), str) and edge[key])
    reviewed = {row['sourceId']: row for row in common['sources']}
    for source_id, entry in event_rows.items():
        expected = {'resolutionMode': 'explicit', 'releaseIds': [RELEASE_ID],
                    **{key: sorted(values) for key, values in impacts.get(source_id, {
                        'profileIds': set(), 'calendarIds': set(), 'componentIds': set()}).items()}}
        require(entry['affected'] == expected, f'Lost/invented actual source impacts: {source_id}')
        expected_outcome = 'unclear' if source_id in {'SRC-AI-RUHETAGE-LISTE-2026', 'SRC-AP22-FR-PRAXIS'} else 'unchanged'
        require(entry['outcome'] == expected_outcome and entry['reviewedOn'] == DATE, 'Review outcome changed')
        native_ref = reviewed[source_id]['reviewBinding']
        require(native_ref['path'] + '#' + native_ref['pointer'] in entry['evidence']['finding'], 'Native finding binding lost')
        require(entry['evidence']['method'] == 'consolidatedAcceptedReview' and entry['evidence']['relevantProvisions'], 'Missing explicit provisions')
        row = indexed[source_id]
        require(row['affected'] == {**without(expected, {'resolutionMode'}), 'locators': []}, 'Index actual impact differs from event')
        require(row['latestReview'] == {'reviewEventId': event_id, 'recordStatus': 'approved', 'reviewedOn': DATE,
                'outcome': entry['outcome'], 'finding': entry['evidence']['finding'], 'followUp': entry['followUp']['required']},
                'Index review differs from event')
        require(row['usageStatus'] == current[source_id]['usageStatus']
                and row['jurisdiction'] == current[source_id]['jurisdiction']
                and row['subjectAreas'] == sorted(current[source_id]['subjectAreas']), 'Index source identity changed')
    require(event_rows['SRC-AI-RUHETAGE-LISTE-2026']['outcome'] == 'unclear'
            and event_rows['SRC-AP22-FR-PRAXIS']['outcome'] == 'unclear', 'AI/FR reservations silently resolved')
    adoption = read_json(base, f'{OUTPUT}/source-governance-adoption.json')
    bridge = read_json(base, f'{OUTPUT}/source-version-bridges.json')
    require(adoption['releaseId'] == bridge['releaseId'] == RELEASE_ID
            and adoption['counts'] == {'previouslyRegistered': 255, 'added': 129, 'registered': 384,
            'retainedHistoricalExtraRows': 4, 'newEventEntries': 380, 'totalEvents': 8,
            'referenceGraphEdges': 5045, 'retainedUses': 2136, 'newUses': 2909,
            'historicalProvenanceEdges': 713, 'changedUsedRules': 0}, 'Governance counts changed')
    require(adoption['newSourceIds'] == sorted(added) and adoption['historicalEventsUnchanged'] is True
            and adoption['previousRegisterRowsUnchanged'] is True and adoption['evidenceOnlySourcesNotActivated'] is True
            and adoption['FRmirrorPositiveApproval'] is False and adoption['annualReviewCompleted'] is False,
            'Governance adoption expanded a supporting source or annual review')
    for field in ('installationAuthorized', 'publicationAuthorized', 'operatingApproval'):
        require(adoption[field] is False, 'Governance claims external authority')
    for row in adoption['evidence']:
        bound_bytes(base, row)
    bound_json(base, bridge['approvalRef'], SOURCE_APPROVAL_PATH, SOURCE_APPROVAL_SHA)
    bound_json(base, bridge['authorityRef'], LOCAL_APPROVAL_PATH, LOCAL_APPROVAL_SHA)
    require(bridge['historicalSourceRecordsUnchanged'] is True and bridge['operationalRulesChanged'] is False
            and bridge['runtimeSourcesAdded'] is False and bridge['allOriginalRetrievalDatesPreserved'] is True
            and bridge['noUnlimitedStabilityProof'] is True and bridge['annualReviewCompleted'] is False
            and bridge['nextOrdinarySourceReview'] == '2026-11-15', 'Bridge expands material scope or future guarantee')
    require(bridge['retainedLimits'] == {'AIcurrentCorrectionHistoricalStatusRetained': True,
            'FRmirrorNoPositiveActivation': True, 'FRundatedReformRetained': True, 'NEgateAndLimitedNegativeSearchRetained': True,
            'januaryComparisonsRetained': True, 'GRandNEcoverageReservationsRetained': True,
            'AVIVoptionBRetained': True, 'OF001Retained': True}, 'A retained boundary was dropped')
    inventory_rows = {row['sourceId']: (position, row) for position, row in enumerate(inventory['rows'])}
    expected_bridges = [{'sourceId': row['sourceId'], 'ownerLotId': row['ownerLotId'], 'outcome': row['outcome'],
                         'referenceCount': len(row['referenceLocations']), 'newReferenceCount': len(row['newReferenceLocations']),
                         'reviewBinding': row['reviewBinding'],
                         'originalMetadataSource': f'{INVENTORY_PATH}#/rows/{inventory_rows[row["sourceId"]][0]}'}
                        for row in common['sources']]
    require(bridge['sources'] == expected_bridges, 'Bridge loses an individual native source or original metadata pointer')
    special_ids = {row['sourceId'] for row in common['sources'] if row['sourceId'].startswith('SRC-AP19C3-KVG-')
                   or row['sourceId'] in {'SRC-AI-RUHETAGE-LISTE-2026', 'SRC-AP22-FR-PRAXIS',
                                         'SRC-AP23J1-FR-LJ-7926-DE', 'SRC-AP23J1-FR-LJ-7926-FR', 'SRC-M1-NE-OJN'}}
    require(bridge['specialFindings'] == [{'sourceId': row['sourceId'], 'outcome': row['outcome'], 'reviewBinding': row['reviewBinding']}
            for row in common['sources'] if row['sourceId'] in special_ids], 'Special material/version finding was dropped')
    return {'registeredSources': 384, 'reviewedSources': 380, 'sourceEdges': 5045,
            'newAdministrativeSourceEdges': 2909, 'sourceEvents': 8, 'addedRegisterRows': 129}


def check_release(directory, evidence_root=ROOT):
    directory, base = Path(directory), Path(evidence_root)
    # Revalidate all schema bytes once per invocation, also under a test overlay.
    schema_registry.cache_clear()
    local, source, source_sha, common = validate_authority(base)
    candidate = exact_json(base, f'{CANDIDATE_PATH}/manifest.json', CANDIDATE_SHA)
    raw_manifest = read_regular(directory, 'manifest.json')
    manifest = json.loads(raw_manifest)
    schema_check(base, 'release-manifest-v17.schema.json', manifest)
    require(manifest['$schema'] == PREFIX + 'release-manifest-v17.schema.json'
            and manifest['releaseId'] == RELEASE_ID and manifest['releaseStatus'] == 'approved'
            and manifest['createdOn'] == DATE and manifest['immutable'] is True, 'Wrong canonical release identity')
    require(manifest['formatVersion'] == manifest['compatibility']['minimumConsumerFormatVersion'] == '17.0.0', 'Wrong format/consumer')
    allowed = {'$schema', 'releaseId', 'releaseStatus', 'createdOn', 'sourceSummary', 'artifacts', 'extensions'}
    require(without(manifest, allowed) == without(candidate, allowed), 'Manifest changed outside allowed metadata')
    require(manifest['sourceSummary'] == {**candidate['sourceSummary'], 'latestReviewedOn': DATE,
            'legalBasisReviewStatus': 'verified', 'technicalValidationStatus': 'passed'}, 'Source summary changed')
    artifacts = manifest['artifacts']
    require(len(artifacts) == len({row['path'] for row in artifacts}) == 44, 'Expected 44 unique artifacts')
    descendants = list(directory.rglob('*'))
    require(not any(path.is_symlink() for path in descendants), 'Runtime symlink')
    require({path.relative_to(directory).as_posix() for path in descendants if path.is_file()}
            == {'manifest.json', *(row['path'] for row in artifacts)}, 'Missing/extra runtime files')
    require({f'data/releases/{RELEASE_ID}/{path}' for path in ['manifest.json', *(row['path'] for row in artifacts)]}
            == set(local['singleLocalDataCommit']['paths']), 'Runtime files differ from approved positive list')
    old = {row['path']: row for row in candidate['artifacts']}
    require(set(old) == {row['path'] for row in artifacts}, 'Runtime paths changed')
    documents, raw_files, original_files, roles, sources = {}, {}, {}, Counter(), set()
    pending_component_schemas = []
    for row in artifacts:
        path, role = row['path'], row['role']
        raw = read_regular(directory, path)
        require(sha(raw) == row['sha256'] and len(raw) == row['byteLength'], f'Unsealed bytes: {path}')
        require(without(row, {'sha256', 'byteLength'}) == without(old[path], {'sha256', 'byteLength'}), 'Artifact descriptor identity changed')
        original = read_regular(base, f'{CANDIDATE_PATH}/{path}')
        require(sha(original) == old[path]['sha256'] and len(original) == old[path]['byteLength'], 'Accepted artifact changed')
        value = json.loads(raw)
        require(value['$schema'] == row['schemaId'] == PREFIX + ROLE_SCHEMAS[role], 'Wrong component schema')
        pending_component_schemas.append((ROLE_SCHEMAS[role], value))
        key = 'calendarId' if role == 'calendar' else 'profileId' if role == 'legalProfile' else 'catalogId'
        require(value['dataKind'] == role and value[key] == row['contentId'] and row['contentId'] not in documents, 'Component identity mismatch')
        documents[row['contentId']] = value
        raw_files[path], original_files[path] = raw, original
        roles[role] += 1
        sources.update(item['sourceId'] for item in value.get('sources', []))
        if role in {'legalProfile', 'specialRegimeCatalog'}:
            require(raw == original, 'Historical immutable profile or BE special catalog changed')
    require(roles == {'legalProfile': 5, 'calendar': 35, 'holidayCatalog': 1, 'specialRegimeCatalog': 1,
                     'socialProcedureCatalog': 1, 'administrativeProcedureCatalog': 1}, 'Component counts changed')
    require(sorted(sources) == manifest['sourceSummary']['sourceIds'], 'Incomplete source inventory')
    require(sum(raw_files[path] == original_files[path] for path in raw_files) == 6, 'Expected exactly six byteidentical artifacts')
    catalog = documents['ch-holiday-catalog']
    previous_catalog = json.loads(original_files[CATALOG_PATH])
    copy_catalog = copy.deepcopy(catalog)
    copy_catalog['activation']['releaseEligibility'] = previous_catalog['activation']['releaseEligibility']
    require(copy_catalog == previous_catalog, 'Holiday definitions, source metadata or scope changed')
    require(catalog['activation']['releaseEligibility'] == {'status': 'approved', 'releaseId': RELEASE_ID,
            'approval': {'by': 'David Steimer', 'on': DATE,
            'evidence': f'{DECISION_PATH} | {SOURCE_APPROVAL_PATH} | sha256:{source_sha}'}}, 'Unbound holiday permission')
    require(len(catalog['data']['rules']) == 479 and len(catalog['activation']['supplementalRules']) == 20
            and len(catalog['activation']['matrixDecisions']) == 198 and len(catalog['activation']['procedureBindings']) == 104,
            'Holiday cardinalities changed')
    # Independent closed native projection: every candidate template is pinned by
    # its accepted descriptor. Only its actual parent catalog hash is substituted.
    for row in artifacts:
        if row['role'] == 'calendar':
            expected = json.loads(original_files[row['path']])
            expected['projection']['sourceHash'] = sha(raw_files[CATALOG_PATH])
            require(documents[row['contentId']] == expected, 'Changed native calendar rules/projection/metadata')
    social = documents['ch-social-procedures']
    previous_social = json.loads(original_files[SOCIAL_PATH])
    require(without(social, {'review', 'releaseEligibility'}) == without(previous_social, {'review', 'releaseEligibility'}), 'Social normative delta')
    require(set(social['review']) == {'reviewedOn', 'status', 'reviewedBy', 'basis'}
            and social['review']['reviewedOn'] == DATE and social['review']['reviewedBy'] == 'David Steimer'
            and social['review']['status'] == 'verified' and social['review']['basis'].strip(), 'Social review not bound')
    require(len(social['federalRules']) == 44 and len(social['cantonalBindings']) == len(social['releaseEligibility']) == 50,
            'Social cardinality changed')
    expected_refs = [{key: row[key] for key in ('role', 'contentId', 'sha256')} for row in artifacts
                     if row['contentId'] in {'ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'}]
    for old_entry, entry in zip(previous_social['releaseEligibility'], social['releaseEligibility']):
        mutable = {'releaseId', 'status', 'approval', 'sourceReviewRef', 'componentRefs'}
        require(without(entry, mutable) == without(old_entry, mutable), 'Social qualifications, rule/suite hashes or windows changed')
        require(entry['releaseId'] == RELEASE_ID and entry['status'] == 'approved'
                and entry['sourceReviewRef'] == {'reviewId': 'MVP10-SOURCE-APPROVAL-20261028', 'sha256': source_sha}
                and entry['approval'] == {'approvedBy': 'David Steimer', 'approvedOn': DATE, 'decisionRef': DECISION_PATH}, 'Social release unbound')
        require(sorted(entry['componentRefs'], key=lambda row: row['contentId']) == sorted(expected_refs, key=lambda row: row['contentId'])
                and len(entry['componentRefs']) == 3, 'Social target dependency changed')
        require(entry['caseCoverage'] == entry['calculationCoverage'] == SOCIAL_HORIZON, 'Social horizon expanded')
    require(all(row['procedureContextCanton'] == 'BE' for row in social['cantonalBindings']), 'Non-BE social release')
    source_ref, suite_ref = validate_release_evidence(manifest, base, source, source_sha)
    validate_administrative(documents['ch-cantonal-administrative-procedures'], json.loads(original_files[ADMIN_PATH]), artifacts, source_ref, suite_ref)
    governance = validate_governance(base, documents, raw_files, source, common)
    # Semantic tampering fails before the large native schema traversal. A
    # successful check still validates every component against its real schema.
    for name, value in pending_component_schemas:
        schema_check(base, name, value)
    return {'status': 'passed', 'releaseId': RELEASE_ID, 'manifestSha256': sha(raw_manifest),
            'runtimeFiles': 45, 'validatedArtifacts': 44, 'unchangedNormativeFiles': 6, 'metadataOnlyRuntimeFiles': 39,
            'calendars': 35, 'catalogRules': 479, 'supplementalProceduralRules': 20, 'provenanceDecisions': 198,
            'terminalBindings': 104, 'unchangedSocialRules': 44, 'reboundBernSocialPermissions': 50,
            'administrativePaths': 245, 'qualificationPolicies': 245, 'holidayBindings': 36, 'suspensionProfiles': 46,
            'administrativeTargetComponents': 34, 'bernGeneralPathsInPreservedProfile': 9,
            'sourceApprovalSha256': source_sha, 'localBuildApprovalSha256': LOCAL_APPROVAL_SHA,
            'historicalSourceMetadataPreserved': True, 'externalDeploymentAuthorized': False, **governance}


if __name__ == '__main__':
    require(len(sys.argv) == 2, 'Pass exactly one release directory')
    print(json.dumps(check_release(Path(sys.argv[1])), ensure_ascii=False))
