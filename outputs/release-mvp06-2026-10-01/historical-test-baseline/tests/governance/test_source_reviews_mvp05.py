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

class Mvp05GovernanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.register = validator.load_json(validator.REGISTER_PATH)
        cls.events = [validator.load_json(p) for p in sorted(validator.EVENT_DIRECTORY.glob('*.json'))]
        cls.index = validator.load_json(validator.INDEX_PATH)
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
