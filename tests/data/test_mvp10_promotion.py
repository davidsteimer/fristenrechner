"""Independent negative tests on actual R10-B bytes and evidence overlays."""
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from ap22c1_contract import ContractError, sha
import validate_mvp10_release as validator


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


class Mvp10PromotionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='mvp10-independent-negative-')
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
        self.manifest(lambda value: next(row for row in value['artifacts'] if row['path'] == path)
                      .update(sha256=sha(raw), byteLength=len(raw)))

    def evidence(self, path, mutate, reseal=False):
        value = json.loads(self.overlay.get(path, (validator.ROOT / path).read_bytes()))
        mutate(value)
        self.overlay[path] = encoded(value)
        if reseal:
            adoption_path = f'{validator.OUTPUT}/source-governance-adoption.json'
            adoption = json.loads(self.overlay.get(adoption_path, (validator.ROOT / adoption_path).read_bytes()))
            row = next(row for row in adoption['evidence'] if row['path'] == path)
            row.update(sha256=sha(self.overlay[path]), byteLength=len(self.overlay[path]))
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
        with self.assertRaises((ContractError, AssertionError, KeyError, ValueError, TypeError)):
            self.checked()

    def test_actual_approved_release(self):
        result = self.checked()
        self.assertEqual(result['status'], 'passed')
        for key, expected in {'runtimeFiles': 45, 'validatedArtifacts': 44, 'unchangedNormativeFiles': 6,
                              'metadataOnlyRuntimeFiles': 39, 'calendars': 35, 'administrativePaths': 245,
                              'qualificationPolicies': 245, 'holidayBindings': 36, 'suspensionProfiles': 46,
                              'administrativeTargetComponents': 34, 'unchangedSocialRules': 44,
                              'reboundBernSocialPermissions': 50, 'registeredSources': 384,
                              'reviewedSources': 380, 'sourceEdges': 5045, 'newAdministrativeSourceEdges': 2909,
                              'sourceEvents': 8, 'addedRegisterRows': 129}.items():
            self.assertEqual(result[key], expected, key)
        self.assertFalse(result['externalDeploymentAuthorized'])

    def test_missing_file(self):
        (self.directory / validator.ADMIN_PATH).unlink()
        self.rejected()

    def test_extra_runtime_file(self):
        (self.directory / 'extra.json').write_bytes(b'{}')
        self.rejected()

    def test_symlink_runtime_file(self):
        path = self.directory / 'profiles/zpo.json'
        path.unlink()
        path.symlink_to(validator.CANDIDATE / 'profiles/zpo.json')
        self.rejected()

    def test_unreferenced_symlink_directory(self):
        (self.directory / 'indirection').symlink_to(self.directory / 'calendars', target_is_directory=True)
        self.rejected()

    def test_unsealed_runtime_bytes(self):
        target = self.directory / validator.CATALOG_PATH
        target.write_bytes(target.read_bytes() + b' ')
        self.rejected()

    def test_source_only_approval_cannot_grant_promotion(self):
        self.evidence(validator.SOURCE_APPROVAL_PATH, lambda value: value.update(dataPromotionApproved=True))
        self.rejected()

    def test_execution_authority_cannot_grant_publication(self):
        self.evidence(validator.LOCAL_APPROVAL_PATH, lambda value: value['permissions'].update(publicationAuthorized=True))
        self.rejected()

    def test_no_unbound_source_approval(self):
        self.overlay[validator.SOURCE_APPROVAL_PATH] = None
        self.rejected()

    def test_no_unbound_a2_acceptance(self):
        self.overlay[validator.ACCEPTANCE_PATH] = None
        self.rejected()

    def test_source_graph_cannot_lose_new_use(self):
        self.evidence(validator.INVENTORY_PATH, lambda value: value['referenceGraph'].pop())
        self.rejected()

    def test_schema_cannot_be_weakened(self):
        self.evidence('schemas/administrative-procedure-catalog-v10.schema.json', lambda value: value.update(additionalProperties=True))
        self.rejected()

    def test_suite_cannot_swap_golden_case(self):
        path = f'{validator.OUTPUT}/administrative-reference-suite.json'
        self.evidence(path, lambda value: value['evidence'][0].update(sha256='0' * 64))
        self.manifest(lambda value: value['extensions']['steimer.approval']['administrativeReferenceSuite']
                      .update(sha256=sha(self.overlay[path])))
        self.rejected()

    def test_resealed_register_cannot_change_historical_row(self):
        self.evidence('data/source-reviews/source-register.json', lambda value: value['sources'][0].update(title='Changed'), reseal=True)
        self.rejected()

    def test_resealed_register_cannot_drop_new_row(self):
        self.evidence('data/source-reviews/source-register.json', lambda value: value['sources'].pop(), reseal=True)
        self.rejected()

    def test_resealed_jura_mirror_cannot_become_official(self):
        self.evidence('data/source-reviews/source-register.json', lambda value: next(row for row in value['sources']
                      if row['sourceId'] == 'JUD-AP23J1-JU-BGER2D55-2010').update(officialUrl='https://mcp.opencaselaw.ch/entscheid/bger_2D_55_2010'), reseal=True)
        self.rejected()

    def test_resealed_event_cannot_silently_resolve_ai(self):
        path = f'data/source-reviews/events/2026-10-28-mvp-010-prerelease.1.json'
        self.evidence(path, lambda value: next(row for row in value['entries']
                      if row['sourceId'] == 'SRC-AI-RUHETAGE-LISTE-2026').update(outcome='unchanged'), reseal=True)
        self.rejected()

    def test_resealed_event_cannot_lose_real_component(self):
        path = f'data/source-reviews/events/2026-10-28-mvp-010-prerelease.1.json'
        self.evidence(path, lambda value: next(row for row in value['entries']
                      if row['sourceId'] == 'SRC-M1-VD-LPA')['affected']['componentIds'].pop(), reseal=True)
        self.rejected()

    def test_resealed_index_cannot_drop_source_impact(self):
        self.evidence('data/source-reviews/index.json', lambda value: next(row for row in value['sources']
                      if row['sourceId'] == 'SRC-M1-VD-LPA')['affected']['componentIds'].pop(), reseal=True)
        self.rejected()


def manifest_negative(name, mutate):
    def run(self):
        self.manifest(mutate)
        self.rejected()
    setattr(Mvp10PromotionTests, 'test_reject_' + name, run)


def component_negative(name, path, mutate):
    def run(self):
        self.component(path, mutate)
        self.rejected()
    setattr(Mvp10PromotionTests, 'test_reject_' + name, run)


manifest_negative('candidate_status', lambda d: d.update(releaseStatus='candidate'))
manifest_negative('older_consumer', lambda d: d['compatibility'].update(minimumConsumerFormatVersion='16.0.0'))
manifest_negative('unsafe_path', lambda d: d['artifacts'][0].update(path='../escape.json'))
manifest_negative('extra_core_field', lambda d: d.update(unapproved=True))
manifest_negative('source_union_loss', lambda d: d['sourceSummary']['sourceIds'].pop())
manifest_negative('publication_granted', lambda d: d['extensions']['steimer.release-preparation'].update(publicationApproved=True))
manifest_negative('unbound_source_ref', lambda d: d['extensions']['steimer.approval']['sourceReviewRef'].update(sha256='0' * 64))
manifest_negative('unbound_execution', lambda d: d['extensions']['steimer.approval']['localBuildApproval'].update(sha256='0' * 64))
component_negative('immutable_profile', 'profiles/zpo.json', lambda d: d.update(title='Changed'))
component_negative('holiday_rule', validator.CATALOG_PATH, lambda d: d['data']['rules'].pop())
component_negative('holiday_supplement', validator.CATALOG_PATH, lambda d: d['activation']['supplementalRules'].pop())
component_negative('historical_source_redated', validator.CATALOG_PATH, lambda d: d['activation']['sourceEvidence'][0].update(retrievedOn=validator.DATE))
component_negative('calendar_changed', 'calendars/be-public-holidays.json', lambda d: d['rules'][0]['calculation'].update(day=2))
component_negative('calendar_stale_hash', 'calendars/be-public-holidays.json', lambda d: d['projection'].update(sourceHash='0' * 64))
component_negative('calendar_review', 'calendars/be-public-holidays.json', lambda d: d['review'].update(status='verified'))
component_negative('social_horizon', validator.SOCIAL_PATH, lambda d: d['releaseEligibility'][0]['caseCoverage'].update(to='2028-12-31'))
component_negative('social_non_be', validator.SOCIAL_PATH, lambda d: d['cantonalBindings'][0].update(procedureContextCanton='ZH'))
component_negative('social_missing_permission', validator.SOCIAL_PATH, lambda d: d['releaseEligibility'].pop())
component_negative('social_rule_hash', validator.SOCIAL_PATH, lambda d: d['releaseEligibility'][0]['ruleRef'].update(sha256='0' * 64))
component_negative('admin_active', validator.ADMIN_PATH, lambda d: d.update(runtimeActive=True))
component_negative('admin_path_missing', validator.ADMIN_PATH, lambda d: d['paths'].pop())
component_negative('admin_duration', validator.ADMIN_PATH, lambda d: d['paths'][0]['duration'].update(value=31))
component_negative('admin_case_window', validator.ADMIN_PATH, lambda d: d['paths'][0]['temporalBinding']['caseCoverage'].update(to='2028-12-31'))
component_negative('admin_permission_missing', validator.ADMIN_PATH, lambda d: d['releaseBinding']['pathEligibility'].pop())
component_negative('admin_path_hash', validator.ADMIN_PATH, lambda d: d['releaseBinding']['pathEligibility'][0].update(pathSha256='0' * 64))
component_negative('admin_qualification_hash', validator.ADMIN_PATH, lambda d: d['releaseBinding']['pathEligibility'][0].update(qualificationPolicySha256='0' * 64))
component_negative('admin_binding_missing', validator.ADMIN_PATH, lambda d: d['holidayBindings'].pop())
component_negative('admin_target_stale', validator.ADMIN_PATH, lambda d: d['releaseBinding']['targetComponentRefs'][0].update(sha256='0' * 64))
component_negative('admin_source_ref', validator.ADMIN_PATH, lambda d: d['releaseBinding']['pathEligibility'][0]['sourceReviewRef'].update(sha256='0' * 64))
component_negative('admin_baseline_identity', validator.ADMIN_PATH,
                   lambda d: next(row['physicalBaseline'] for row in d['holidayBindings'] if 'physicalBaseline' in row)['references'][0].update(contentId='other'))
component_negative('admin_source_identity', validator.ADMIN_PATH,
                   lambda d: next(row['physicalSource'] for row in d['holidayBindings'] if 'physicalSource' in row)['references'][0].update(contentId='other'))
component_negative('admin_regional_choice', validator.ADMIN_PATH,
                   lambda d: next(row['calendarSelection'] for row in d['holidayBindings']
                                  if row.get('calendarSelection', {}).get('kind') == 'qualifiedAuthoritySeatRegion').update(defaultAllowed=True))
component_negative('admin_party_terminal', validator.ADMIN_PATH,
                   lambda d: next(row['calendarSelection'] for row in d['holidayBindings']
                                  if row.get('calendarSelection', {}).get('kind') == 'qualifiedPartyOrRepresentativeCanton')['terminals'].pop())


if __name__ == '__main__':
    unittest.main()
