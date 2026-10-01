"""MVP05 append-only governance and social-model impact indexing."""
import copy
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('validator', ROOT / 'tests/governance/validate_source_reviews.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
PREFIX = ROOT / 'outputs/release-mvp05-2026-09-28'
HISTORICAL = ROOT / 'outputs/release-mvp06-2026-10-01/historical-baseline'

class Mvp05GovernanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Exact MVP05 fixture. Future live events are checked by their own suite.
        def bound(relative_path, expected_hash):
            data = (HISTORICAL / relative_path).read_bytes()
            assert hashlib.sha256(data).hexdigest() == expected_hash
            return json.loads(data)
        cls.register = bound('data/source-reviews/source-register.json', 'eb89b94c839fb01d92c4168dd99183d1c40818299b0a364247007b5bd933df7a')
        cls.index = bound('data/source-reviews/index.json', '017179338852bddac965a11718912bf2cf7ef793884a8ae1d5d8f2b639ee31fe')
        event_ids = cls.index['generatedFrom']['eventIds']
        assert event_ids == ['2026-08-31-initial-consolidation.1', '2026-09-22-mvp-04-prerelease.1', '2026-09-28-mvp-05-prerelease.1']
        cls.events = [validator.load_json(validator.EVENT_DIRECTORY / f'{event_id}.json') for event_id in event_ids]
        cls.events[-1] = bound('data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json', '1d3dc59e02f5c67026cab22d7d20ddcca68840840ec54029c36f51482816f372')
        cls.latest = cls.events[-1]

    def test_current_schema_and_index(self):
        self.assertEqual(validator.validate_documents(self.register, self.events, self.index), [])
        self.assertEqual(len(self.register['sources']), 57)
        self.assertEqual(len(self.events), 3)
        self.assertEqual(len(self.latest['entries']), 53)

    def test_old_register_rows_not_rewritten(self):
        old = validator.load_json(PREFIX / 'approval-inputs/data/source-reviews/source-register.json')
        current = {s['sourceId']: s for s in self.register['sources']}
        for source in old['sources']:
            self.assertEqual(current[source['sourceId']], source)

    def test_historical_event_hashes(self):
        approval = validator.load_json(ROOT / 'outputs/release-mvp04-2026-09-22/source-approval.json')
        event = approval['transition']['event']
        self.assertEqual(hashlib.sha256((ROOT / event['afterPath']).read_bytes()).hexdigest(), event['afterSha256'])
        initial = ROOT / 'data/source-reviews/events/2026-08-31-initial-consolidation.1.json'
        self.assertEqual(hashlib.sha256(initial.read_bytes()).hexdigest(), '3b6884e3d929bd47006a9aeff453288de6102d2c1c50c8d6f92a88115bdce3dd')

    def test_social_source_indexes_binding_context_and_eligibility(self):
        kvg = next(s for s in self.index['sources'] if s['sourceId'] == 'SRC-AP19C3-KVG-20260101')
        components = kvg['affected']['componentIds']
        for expected in ['CH-SOC-KVG-OKP-OBJ', 'BE-SOC-KVG-OKP-OBJ', 'be-kvg-okp-product-scope', 'AP19C3-BE-SOC-KVG-OKP-OBJ']:
            self.assertIn(expected, components)
        self.assertEqual(kvg['affected']['profileIds'], ['vrpg-be'])

    def test_calendar_binding_ids_are_retained(self):
        frg = next(s for s in self.index['sources'] if s['sourceId'] == 'SRC-AP17C-FRG-BE-20210401')
        for binding in ['be-party', 'be-representative']:
            self.assertIn(binding, frg['affected']['componentIds'])
        self.assertIn('be-public-holidays', frg['affected']['calendarIds'])

    def test_lost_social_link_is_detected(self):
        index = copy.deepcopy(self.index)
        kvg = next(s for s in index['sources'] if s['sourceId'] == 'SRC-AP19C3-KVG-20260101')
        kvg['affected']['componentIds'].remove('BE-SOC-KVG-OKP-OBJ')
        self.assertTrue(any('nicht reproduzierbar' in e for e in validator.validate_documents(self.register, self.events, index)))

    def test_reused_catalog_scope_not_claimed_as_fresh_operative_event(self):
        self.assertNotIn('SRC-AI-RUHETAGE-LISTE-2026', [s['sourceId'] for s in self.latest['entries']])
        approval = validator.load_json(PREFIX / 'source-approval.json')
        self.assertEqual(approval['scope']['additionalReusedCatalogSources'], 82)
        self.assertFalse(approval['knownConflict']['officialCorrectionClaimed'])
        self.assertEqual(self.latest['nextAnnualReviewDue'], '2027-11-15')

if __name__ == '__main__':
    unittest.main()
