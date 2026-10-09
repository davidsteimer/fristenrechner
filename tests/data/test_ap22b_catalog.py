# SPDX-License-Identifier: AGPL-3.0-only
"""Isolated candidate syntax tests, not tests of a production resolver."""
import copy
import hashlib
import json
from pathlib import Path
import unittest
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
HISTORY = ROOT / 'outputs/release-mvp07-2026-10-08/inputs'

class CatalogProposalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT/'schemas/candidates/ap22b/holiday-catalog-v2.schema.json').read_text())
        cls.value = json.loads((ROOT/'tests/golden/candidates/ap22b-holiday-contract.json').read_text())
        cls.validator = Draft202012Validator(cls.schema,format_checker=FormatChecker())

    def rejected(self, mutate):
        value = copy.deepcopy(self.value)
        mutate(value)
        self.assertTrue(list(self.validator.iter_errors(value)))

    def test_proposal_schema_and_complete_specimen(self):
        Draft202012Validator.check_schema(self.schema)
        self.validator.validate(self.value)
        # AP22B isolation is historical. R07-B now separately promotes the
        # confirmed implementation, without rewriting that isolated proposal.
        snapshot = (HISTORY/'snapshot.json').read_bytes()
        self.assertEqual(hashlib.sha256(snapshot).hexdigest(),
                         'cbb9744cb2cc4f5b1812ad7850b9746fb4b504bab1c488eec824dd783b34f3bb')
        original = next(row for row in json.loads(snapshot)['evidence']
                        if row['path'] == 'tests/data/test_ap22b_catalog.py')
        self.assertEqual(hashlib.sha256((ROOT/original['archivedAt']).read_bytes()).hexdigest(), original['sha256'])
        self.assertFalse((HISTORY/'files/schemas/holiday-catalog-v2.schema.json').exists())
        self.assertEqual((ROOT/'schemas/holiday-catalog-v2.schema.json').read_bytes(),
                         (HISTORY/'files/schemas/implementation/ap22c1/holiday-catalog-v2.schema.json').read_bytes())
        self.assertEqual((ROOT/'schemas/candidates/ap22b/holiday-catalog-v2.schema.json').read_bytes(),
                         (HISTORY/'files/schemas/candidates/ap22b/holiday-catalog-v2.schema.json').read_bytes())

    def test_closed_root_and_activation(self):
        self.rejected(lambda v: v.update(unexpected=True))
        self.rejected(lambda v: v.pop('activation'))
        self.rejected(lambda v: v['activation'].update(unexpected=True))

    def test_archived_status_is_not_changed_to_permission(self):
        self.rejected(lambda v: v['data']['assignments'][0].update(status='approved'))
        self.rejected(lambda v: v['acceptance'].update(runtimeEnabled=True))

    def test_approval_gates_cannot_be_switched_by_one_flag(self):
        self.rejected(lambda v: v['activation']['contractDecision'].update(status='approved'))
        self.rejected(lambda v: v['activation']['releaseEligibility'].update(status='approved'))
        self.rejected(lambda v: v['activation']['releaseEligibility'].update(status='candidate',releaseId='invented'))
        self.rejected(lambda v: v['activation']['releaseEligibility'].update(status='approved',releaseId='test-release',approval={'on':'2026-10-08','by':'test','evidence':'fixture-only'}))

    def test_binding_fields_and_intervals_are_strict(self):
        self.rejected(lambda v: v['activation']['procedureBindings'][0].update(profileId='atsg'))
        self.rejected(lambda v: v['activation']['procedureBindings'][0].update(purpose='anything'))
        self.rejected(lambda v: v['activation']['procedureBindings'][0]['caseCoverage'].update(**{'from':'2026-02-30'}))
        self.rejected(lambda v: v['activation']['procedureBindings'][0]['variants'][0].update(guessRegion=True))

    def test_no_halfday_conversion_in_additional_rules(self):
        self.rejected(lambda v: v['activation']['supplementalRules'][0].update(dayPortion='afternoonFromNoon'))
        self.rejected(lambda v: v['activation']['supplementalRules'][0].update(condition='arbitrary-expression'))

    def test_archival_origin_and_projected_lists_cannot_disappear(self):
        self.rejected(lambda v: v['activation']['matrixDecisions'].pop())
        self.rejected(lambda v: v['activation']['projections'][0].pop('baseScopeId'))
        self.rejected(lambda v: v['activation']['projections'][0].pop('ruleIds'))

if __name__ == '__main__':
    unittest.main()
