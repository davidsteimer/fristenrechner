"""MVP06 archived governance, strict historical preservation and negative checks.

R07-B deliberately evolves the living register. Its exact MVP06 state remains
bound by the accepted MVP07 preparation snapshot, not silently reconstructed.
"""
import copy
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PREFIX = ROOT / 'outputs/release-mvp06-2026-10-01'
SNAPSHOT = ROOT / 'outputs/release-mvp07-2026-10-08/inputs/snapshot.json'
SNAPSHOT_SHA256 = 'cbb9744cb2cc4f5b1812ad7850b9746fb4b504bab1c488eec824dd783b34f3bb'
spec = importlib.util.spec_from_file_location('validator', ROOT / 'tests/governance/validate_source_reviews.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

def historical_bytes(path):
    snapshot_bytes = SNAPSHOT.read_bytes()
    assert hashlib.sha256(snapshot_bytes).hexdigest() == SNAPSHOT_SHA256
    evidence = {item['path']: item for item in json.loads(snapshot_bytes)['evidence']}
    item = evidence.get(str(path))
    if item is None:
        # Only unchanged historical evidence absent from the snapshot is read
        # at its original location. The adoption record verifies its own hash.
        assert not str(path).startswith('data/source-reviews/')
        return (ROOT / path).read_bytes()
    data = (ROOT / item['archivedAt']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == item['sha256']
    assert len(data) == item['byteLength']
    return data

class Mvp06GovernanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.register = json.loads(historical_bytes('data/source-reviews/source-register.json'))
        cls.index = json.loads(historical_bytes('data/source-reviews/index.json'))
        cls.events = [json.loads(historical_bytes(f'data/source-reviews/events/{event_id}.json'))
                      for event_id in cls.index['generatedFrom']['eventIds']]
        cls.latest = next(event for event in cls.events if event['reviewEventId'] == '2026-10-01-mvp-06-prerelease.1')

    def test_archived_schema_and_exact_counts(self):
        self.assertEqual(validator.validate_documents(self.register, self.events, self.index), [])
        self.assertEqual(len(self.register['sources']), 81)
        self.assertEqual(len(self.events), 4)
        self.assertEqual(len(self.latest['entries']), 77)
        self.assertEqual(self.index['generatedFrom']['eventIds'][-1], self.latest['reviewEventId'])

    def test_historical_57_rows_are_unchanged(self):
        data = (PREFIX / 'historical-baseline/data/source-reviews/source-register.json').read_bytes()
        self.assertEqual(hashlib.sha256(data).hexdigest(), 'eb89b94c839fb01d92c4168dd99183d1c40818299b0a364247007b5bd933df7a')
        for source in json.loads(data)['sources']:
            self.assertEqual(next(s for s in self.register['sources'] if s['sourceId'] == source['sourceId']), source)

    def test_adoption_evidence_and_permission_limits(self):
        adoption = validator.load_json(PREFIX / 'source-governance-adoption.json')
        for item in adoption['evidence']:
            data = historical_bytes(item['path'])
            self.assertEqual(hashlib.sha256(data).hexdigest(), item['sha256'], item['path'])
            self.assertEqual(len(data), item['byteLength'])
        for key in ['installationAuthorized', 'publicationAuthorized', 'hostingChangesAuthorized', 'operatingApproval']:
            self.assertFalse(adoption[key])
        self.assertEqual(adoption['catalogReuse'], {'reviewedOn': '2026-09-22', 'sourceCount': 82, 'aiOutcome': 'unclear', 'freshFullReviewClaimed': False})

    def test_new_rule_binding_and_eligibility_are_indexed(self):
        item = next(s for s in self.index['sources'] if s['sourceId'] == 'SRC-AP20C3-UELG-20250101')
        self.assertIn('CH-SOC-UELG-OBJ', item['affected']['componentIds'])
        self.assertIn('BE-SOC-UELG-ADMIN-OBJ', item['affected']['componentIds'])
        self.assertIn('AP20C3-BE-SOC-UELG-ADMIN-OBJ', item['affected']['componentIds'])
        self.assertEqual(item['affected']['profileIds'], ['vrpg-be'])

    def test_lost_new_binding_is_rejected(self):
        index = copy.deepcopy(self.index)
        item = next(s for s in index['sources'] if s['sourceId'] == 'SRC-AP20C3-UELG-20250101')
        item['affected']['componentIds'].remove('BE-SOC-UELG-ADMIN-OBJ')
        self.assertTrue(any('nicht reproduzierbar' in error for error in validator.validate_documents(self.register, self.events, index)))

    def test_ai_not_falsely_refreshed_and_pure_exclusions_not_made_productive(self):
        self.assertNotIn('SRC-AI-RUHETAGE-LISTE-2026', [item['sourceId'] for item in self.latest['entries']])
        for source_id in ['SRC-AP20C1-EOG-20270701', 'SRC-AP20C3-EGKUMV-BE-20220101', 'SRC-AP20C3-UELV-20250101']:
            self.assertEqual(next(s for s in self.register['sources'] if s['sourceId'] == source_id)['usageStatus'], 'supporting')
            self.assertIn('keine positive operative Aktivierung', next(s for s in self.latest['entries'] if s['sourceId'] == source_id)['evidence']['finding'])

if __name__ == '__main__':
    unittest.main()
