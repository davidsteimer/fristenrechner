"""Independent negative checks on R08-B bytes, never the mutable builder object.

Each mutation affects an isolated temporary runtime copy or evidence overlay.
Even internally rehashed mutations must fail the accepted semantic contract.
"""
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ap22c1_contract import ContractError, sha
import validate_mvp08_release as validator


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


class Mvp08PromotionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='mvp08-independent-negative-')
        self.directory = Path(self.temporary.name) / 'release'
        shutil.copytree(validator.ROOT / f'data/releases/{validator.RELEASE_ID}', self.directory)
        self.overlay = {}

    def tearDown(self):
        self.temporary.cleanup()

    def manifest(self, mutate):
        path = self.directory / 'manifest.json'
        value = json.loads(path.read_bytes())
        mutate(value)
        path.write_bytes(encoded(value))

    def component(self, path, mutate):
        target = self.directory / path
        value = json.loads(target.read_bytes())
        mutate(value)
        raw = encoded(value)
        target.write_bytes(raw)
        self.manifest(lambda manifest: next(item for item in manifest['artifacts'] if item['path'] == path)
                      .update(sha256=sha(raw), byteLength=len(raw)))

    def evidence(self, path, mutate, seal_adoption=False):
        raw = self.overlay.get(path, (validator.ROOT / path).read_bytes())
        value = json.loads(raw)
        mutate(value)
        self.overlay[path] = encoded(value)
        if seal_adoption:
            adoption_path = f'{validator.OUTPUT}/source-governance-adoption.json'
            adoption = json.loads(self.overlay.get(adoption_path, (validator.ROOT / adoption_path).read_bytes()))
            entry = next(entry for entry in adoption['evidence'] if entry['path'] == path)
            entry.update(sha256=sha(self.overlay[path]), byteLength=len(self.overlay[path]))
            self.overlay[adoption_path] = encoded(adoption)
            self.manifest(lambda value: value['extensions']['steimer.approval']['sourceGovernance']
                          .update(sha256=sha(self.overlay[adoption_path])))

    def checked(self):
        original = validator.read_regular

        def read(base, path):
            if Path(base) == validator.ROOT and path in self.overlay:
                if self.overlay[path] is None:
                    raise ContractError(f'Synthetic missing evidence: {path}')
                return self.overlay[path]
            return original(base, path)

        with patch.object(validator, 'read_regular', side_effect=read):
            return validator.check_release(self.directory)

    def rejected(self):
        with self.assertRaises((ContractError, AssertionError, KeyError, ValueError)):
            self.checked()

    def test_actual_approved_release(self):
        report = self.checked()
        self.assertEqual(report['status'], 'passed')
        for key, expected in {'runtimeFiles': 42, 'validatedArtifacts': 41, 'calendars': 32,
                              'administrativePaths': 12, 'tiPaths': 5, 'grPaths': 7,
                              'unchangedSocialRules': 44, 'reboundBernSocialPermissions': 50,
                              'registeredSources': 247, 'reviewedSources': 243, 'sourceEdges': 2078,
                              'administrativeSourceEdges': 58, 'sourceEvents': 6,
                              'newAmendingActs': 5, 'amendmentLawFamilies': 8, 'newVersionIntervals': 5}.items():
            self.assertEqual(report[key], expected, key)
        self.assertFalse(report['externalDeploymentAuthorized'])

    def test_missing_file(self):
        (self.directory / validator.ADMIN_PATH).unlink()
        self.rejected()

    def test_extra_runtime_file(self):
        (self.directory / 'unapproved.json').write_bytes(b'{}')
        self.rejected()

    def test_runtime_symlink(self):
        target = self.directory / 'profiles/zpo.json'
        target.unlink()
        target.symlink_to(validator.CANDIDATE / 'profiles/zpo.json')
        self.rejected()

    def test_unreferenced_directory_symlink(self):
        (self.directory / 'indirection').symlink_to(self.directory / 'calendars', target_is_directory=True)
        self.rejected()

    def test_unsealed_bytes(self):
        target = self.directory / validator.CATALOG_PATH
        target.write_bytes(target.read_bytes() + b' ')
        self.rejected()

    def test_missing_source_decision(self):
        self.overlay[validator.SOURCE_APPROVAL_PATH] = None
        self.rejected()

    def test_missing_execution_decision(self):
        self.overlay[validator.LOCAL_APPROVAL_PATH] = None
        self.rejected()

    def test_source_approval_cannot_be_retroactively_expanded(self):
        self.evidence(validator.SOURCE_APPROVAL_PATH, lambda value: value['permissions'].update(localDataPromotionAuthorized=True))
        self.rejected()

    def test_execution_approval_cannot_gain_publication(self):
        self.evidence(validator.LOCAL_APPROVAL_PATH, lambda value: value['permissions'].update(publicationAuthorized=True))
        self.rejected()

    def test_canonical_schema_cannot_drift(self):
        self.evidence('schemas/administrative-procedure-catalog.schema.json', lambda value: value.update(additionalProperties=True))
        self.rejected()

    def test_accepted_source_graph_cannot_lose_edge(self):
        self.evidence(validator.INVENTORY_PATH, lambda value: value['referenceGraph'].pop())
        self.rejected()

    def test_rehashed_event_cannot_lose_administrative_source_impact(self):
        event = f'data/source-reviews/events/2026-10-15-mvp-08-prerelease.1.json'
        self.evidence(event, lambda value: next(row for row in value['entries'] if row['sourceId'] == 'SRC-AP23B-TI-LPAMM')
                      ['affected']['componentIds'].remove('ti-80-30'), seal_adoption=True)
        self.rejected()

    def test_rehashed_registry_cannot_drop_historical_source(self):
        self.evidence('data/source-reviews/source-register.json', lambda value: value['sources'].pop(), seal_adoption=True)
        self.rejected()

    def test_rehashed_registry_cannot_rewrite_historical_source(self):
        self.evidence('data/source-reviews/source-register.json', lambda value: value['sources'][0].update(title='Rewritten'),
                      seal_adoption=True)
        self.rejected()

    def test_rehashed_event_cannot_claim_ai_resolved(self):
        self.evidence('data/source-reviews/events/2026-10-15-mvp-08-prerelease.1.json',
                      lambda value: next(row for row in value['entries'] if row['sourceId'] == 'SRC-AI-RUHETAGE-LISTE-2026')
                      .update(outcome='unchanged'), seal_adoption=True)
        self.rejected()

    def test_rehashed_index_cannot_silently_lose_component(self):
        self.evidence('data/source-reviews/index.json',
                      lambda value: next(row for row in value['sources'] if row['sourceId'] == 'SRC-AP23B-GR-VRG')
                      ['affected']['componentIds'].pop(), seal_adoption=True)
        self.rejected()

    def test_rehashed_bridge_cannot_drop_an_amendment_family(self):
        path = f'{validator.OUTPUT}/source-version-bridges.json'
        self.evidence(path, lambda value: value['newNormBridges'].pop('IVV'), seal_adoption=True)
        self.manifest(lambda value: value['extensions']['steimer.approval']['sourceVersionBridges']
                      .update(sha256=sha(self.overlay[path])))
        self.rejected()

    def test_rehashed_bridge_cannot_extend_temporal_scope(self):
        path = f'{validator.OUTPUT}/source-version-bridges.json'
        self.evidence(path, lambda value: value.update(productTemporalLimit='2028-12-31'), seal_adoption=True)
        self.manifest(lambda value: value['extensions']['steimer.approval']['sourceVersionBridges']
                      .update(sha256=sha(self.overlay[path])))
        self.rejected()

    def test_rehashed_registry_cannot_invent_official_https_transport(self):
        self.evidence('data/source-reviews/source-register.json',
                      lambda value: next(row for row in value['sources'] if row['sourceId'] == 'JUD-AP23B-TI-PROVISIONAL-JUD')
                      .update(officialUrl='https://www.sentenze.ti.ch/invented'), seal_adoption=True)
        self.rejected()

    def test_reference_suite_cannot_swap_the_golden_oracle(self):
        path = f'{validator.OUTPUT}/administrative-reference-suite.json'
        self.evidence(path, lambda value: value['evidence'][0].update(sha256='0' * 64))
        self.manifest(lambda value: value['extensions']['steimer.approval']['administrativeReferenceSuite']
                      .update(sha256=sha(self.overlay[path])))
        self.rejected()


def negative_manifest(name, mutate):
    def run(self):
        self.manifest(mutate)
        self.rejected()
    setattr(Mvp08PromotionTests, f'test_reject_{name}', run)


def negative_component(name, path, mutate):
    def run(self):
        self.component(path, mutate)
        self.rejected()
    setattr(Mvp08PromotionTests, f'test_reject_{name}', run)


negative_manifest('older_consumer', lambda value: value['compatibility'].update(minimumConsumerFormatVersion='7.0.0'))
negative_manifest('candidate_status', lambda value: value.update(releaseStatus='candidate'))
negative_manifest('unapproved_publication', lambda value: value['extensions']['steimer.release-preparation'].update(publicationApproved=True))
negative_manifest('unbound_build_authority', lambda value: value['extensions']['steimer.approval']['localBuildApproval'].update(sha256='0' * 64))
negative_manifest('missing_manifest_source', lambda value: value['sourceSummary']['sourceIds'].pop())
negative_manifest('new_manifest_core_field', lambda value: value.update(extra='unapproved'))
negative_manifest('replaced_schema_id', lambda value: value.update(**{'$schema': validator.PREFIX + 'local-reference-manifest-v8.schema.json'}))
negative_manifest('unsafe_artifact_path', lambda value: value['artifacts'][0].update(path='../escape.json'))
negative_component('historical_profile_changed', 'profiles/zpo.json', lambda value: value.update(title='Changed'))
negative_component('calendar_approval_unbound', validator.CATALOG_PATH,
                   lambda value: value['activation']['releaseEligibility']['approval'].update(evidence='unbound'))
negative_component('calendar_original_review_redated', validator.CATALOG_PATH,
                   lambda value: value['activation']['sourceEvidence'][0].update(retrievedOn=validator.DATE))
negative_component('calendar_source_hash_stale', 'calendars/be-public-holidays.json',
                   lambda value: value['projection'].update(sourceHash='0' * 64))
negative_component('calendar_rule_rehashed_but_changed', 'calendars/be-public-holidays.json',
                   lambda value: value['rules'][0]['calculation'].update(day=2))
negative_component('calendar_review_silently_approved', 'calendars/be-public-holidays.json', lambda value: value['review'].update(status='verified'))
negative_component('social_unapproved', validator.SOCIAL_PATH, lambda value: value['releaseEligibility'][0].update(status='candidate', approval=None))
negative_component('social_stale_components', validator.SOCIAL_PATH,
                   lambda value: value['releaseEligibility'][0]['componentRefs'][0].update(sha256='0' * 64))
negative_component('social_beyond_horizon', validator.SOCIAL_PATH,
                   lambda value: value['releaseEligibility'][0]['caseCoverage'].update(to='2028-12-31'))
negative_component('social_non_be', validator.SOCIAL_PATH, lambda value: value['cantonalBindings'][0].update(procedureContextCanton='ZH'))
negative_component('social_rule_hash_changed', validator.SOCIAL_PATH,
                   lambda value: value['releaseEligibility'][0]['ruleRef'].update(sha256='0' * 64))
negative_component('admin_runtime_active', validator.ADMIN_PATH, lambda value: value.update(runtimeActive=True))
negative_component('admin_missing_path', validator.ADMIN_PATH, lambda value: value['paths'].pop())
negative_component('admin_ti_o2_removed', validator.ADMIN_PATH, lambda value: value['paths'][0].update(endShiftGuard='none'))
negative_component('admin_normative_rule_changed', validator.ADMIN_PATH, lambda value: value['paths'][0]['duration'].update(value=31))
negative_component('admin_old_path_hash', validator.ADMIN_PATH,
                   lambda value: value['releaseBinding']['pathEligibility'][0].update(pathSha256='0' * 64))
negative_component('admin_old_components', validator.ADMIN_PATH,
                   lambda value: value['releaseBinding']['pathEligibility'][0]['targetComponentRefs'][0].update(sha256='0' * 64))
negative_component('admin_missing_source_review', validator.ADMIN_PATH, lambda value: value['releaseBinding'].update(sourceReviewRef=None))
negative_component('admin_wrong_reference_suite', validator.ADMIN_PATH,
                   lambda value: value['releaseBinding']['referenceSuiteRef'].update(sha256='0' * 64))
negative_component('admin_horizon_expanded', validator.ADMIN_PATH,
                   lambda value: value['releaseBinding']['pathEligibility'][0]['caseCoverage'].update(to='2028-12-31'))
negative_component('admin_physical_baseline_changed', validator.ADMIN_PATH,
                   lambda value: value['holidayBindings'][0]['physicalBaseline'].update(releaseId=validator.RELEASE_ID))


if __name__ == '__main__':
    unittest.main()
