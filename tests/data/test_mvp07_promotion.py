"""Independent negative checks for the actual locally approved R07-B release.

All mutations are synthetic temporary copies, never edits to approved evidence.
"""
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from ap22c1_contract import ContractError, sha
from validate_mvp07_release import ROOT, RELEASE_ID, CATALOG_PATH, SOCIAL_PATH, check_release


class Mvp07PromotionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='mvp07-negative-')
        self.directory = Path(self.temporary.name) / 'release'
        shutil.copytree(ROOT / f'data/releases/{RELEASE_ID}', self.directory)

    def tearDown(self):
        self.temporary.cleanup()

    def manifest(self, mutate):
        path = self.directory / 'manifest.json'
        value = json.loads(path.read_bytes())
        mutate(value)
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    def component(self, path, mutate):
        target = self.directory / path
        value = json.loads(target.read_bytes())
        mutate(value)
        raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
        target.write_bytes(raw)
        self.manifest(lambda manifest: next(item for item in manifest['artifacts'] if item['path'] == path)
                      .update(sha256=sha(raw), byteLength=len(raw)))

    def rejected(self):
        with self.assertRaises((ContractError, AssertionError, KeyError, ValueError)):
            check_release(self.directory)

    def test_actual_approved_envelope(self):
        result = check_release(self.directory)
        self.assertEqual(result['status'], 'passed')
        self.assertEqual(result['runtimeFiles'], 41)
        self.assertEqual(result['unchangedSocialRules'], 44)
        self.assertEqual(result['reboundBernSocialPermissions'], 50)

    def test_missing_file(self):
        (self.directory / 'calendars/be-public-holidays.json').unlink()
        self.rejected()

    def test_extra_runtime_file(self):
        (self.directory / 'extra.json').write_text('{}')
        self.rejected()

    def test_unreferenced_symlink_directory(self):
        (self.directory / 'redirected').symlink_to(self.directory / 'calendars', target_is_directory=True)
        self.rejected()

    def test_wrong_unsealed_bytes(self):
        path = self.directory / 'calendars/be-public-holidays.json'
        path.write_bytes(path.read_bytes() + b' ')
        self.rejected()


def negative_manifest(name, mutate):
    def run(self):
        self.manifest(mutate)
        self.rejected()
    setattr(Mvp07PromotionTests, f'test_reject_{name}', run)


def negative_component(name, path, mutate):
    def run(self):
        self.component(path, mutate)
        self.rejected()
    setattr(Mvp07PromotionTests, f'test_reject_{name}', run)


negative_manifest('older_consumer', lambda m: m['compatibility'].update(minimumConsumerFormatVersion='6.0.0'))
negative_manifest('only_manifest_approved', lambda m: m.update(releaseStatus='candidate'))
negative_manifest('unapproved_external_publication', lambda m: m['extensions']['steimer.release-preparation'].update(publicationApproved=True))
negative_manifest('unbound_local_authority', lambda m: m['extensions']['steimer.approval']['localBuildApproval'].update(sha256='0' * 64))
negative_manifest('missing_manifest_source', lambda m: m['sourceSummary']['sourceIds'].pop())
negative_component('wrong_catalog_decision', CATALOG_PATH, lambda v: v['activation']['releaseEligibility']['approval'].update(evidence='unbound'))
negative_component('silently_redated_historic_catalog', CATALOG_PATH, lambda v: v['activation']['sourceEvidence'][0].update(retrievedOn='2026-10-08'))
negative_component('new_calendar_approval', 'calendars/be-public-holidays.json', lambda v: v['review'].update(status='verified'))
negative_component('changed_calendar_rule', 'calendars/be-public-holidays.json', lambda v: v['rules'][0]['calculation'].update(day=2))
negative_component('changed_calendar_source_date', 'calendars/be-public-holidays.json', lambda v: v['sources'][0].update(reviewedOn='2026-10-08'))
negative_component('wrong_projection_hash', 'calendars/be-public-holidays.json', lambda v: v['projection'].update(sourceHash='0' * 64))
negative_component('pending_social_permission', SOCIAL_PATH, lambda v: v['releaseEligibility'][0].update(status='candidate', approval=None))
negative_component('wrong_social_component_hash', SOCIAL_PATH, lambda v: v['releaseEligibility'][0]['componentRefs'][0].update(sha256='0' * 64))
negative_component('enlarged_social_horizon', SOCIAL_PATH, lambda v: v['releaseEligibility'][0]['caseCoverage'].update(to='2028-12-31'))
negative_component('additional_social_canton', SOCIAL_PATH, lambda v: v['cantonalBindings'][0].update(procedureContextCanton='ZH'))
negative_component('changed_social_rule_hash', SOCIAL_PATH, lambda v: v['releaseEligibility'][0]['ruleRef'].update(sha256='0' * 64))


if __name__ == '__main__':
    unittest.main()
