#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""AP19C1 schema and lossless partition evidence. No production activation."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "data/candidates/2026-09-25-ap19c1"
BASE = ROOT / "data/releases/2026-09-22-mvp-04-approved.1"


def load(path):
    return json.loads(path.read_bytes())


class AP19CContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        schemas = [load(path) for path in (ROOT / "schemas").glob("*.schema.json")]
        registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema)) for schema in schemas)
        cls.validators = {}
        for schema in schemas:
            Draft202012Validator.check_schema(schema)
            cls.validators[schema["$id"]] = Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())
        cls.manifest = load(CANDIDATE / "manifest.json")
        cls.social = load(CANDIDATE / "social-procedures/ch-social-procedures.json")
        cls.rest = load(CANDIDATE / "special-regimes/vrpg-be.json")
        cls.original = load(BASE / "special-regimes/vrpg-be.json")
        cls.plan = load(ROOT / "tests/golden/candidates/ap19b-migration-plan.json")
        cls.validator = cls.validators[cls.social["$schema"]]

    def assert_rejected(self, instance):
        self.assertTrue(list(self.validator.iter_errors(instance)))

    def test_every_candidate_artifact_validates_against_declared_schema(self):
        self.validators[self.manifest["$schema"]].validate(self.manifest)
        for descriptor in self.manifest["artifacts"]:
            with self.subTest(path=descriptor["path"]):
                raw = (CANDIDATE / descriptor["path"]).read_bytes()
                self.assertEqual(hashlib.sha256(raw).hexdigest(), descriptor["sha256"])
                self.assertEqual(len(raw), descriptor["byteLength"])
                self.validators[descriptor["schemaId"]].validate(json.loads(raw))

    def test_candidate_status_is_not_integration_or_release_approval(self):
        self.assertEqual(self.manifest["releaseStatus"], "candidate")
        self.assertNotIn("steimer.approval", self.manifest["extensions"])
        self.assertEqual(len(self.social["federalRules"]), 16)
        self.assertEqual(len(self.social["cantonalBindings"]), 16)
        self.assertEqual(len(self.social["releaseEligibility"]), 16)
        self.assertTrue(all(item["status"] == "candidate" for item in self.social["federalRules"] + self.social["cantonalBindings"]))
        self.assertTrue(all(item["legalValidity"] == {"from": "2026-01-01", "to": "2027-12-31"} for item in self.social["cantonalBindings"]))
        self.assertTrue(all(item["status"] == "candidate" and item["approval"] is None for item in self.social["releaseEligibility"]))
        self.assertEqual({item["law"] for item in self.social["federalRules"]}, {"ivg", "ahvg", "uvg", "elg"})

    def test_all_remaining_objects_and_head_fields_equal_the_frozen_base(self):
        expected = copy.deepcopy(self.original)
        expected["catalogId"] = "vrpg-be-special-regimes-rest"
        expected["deadlineDefinitions"] = [item for item in expected["deadlineDefinitions"] if item["deadlineDefinitionId"] in self.plan["preservedNonSocialDefinitionIds"]]
        expected["regimes"] = [item for item in expected["regimes"] if item["regimeId"] in self.plan["preservedNonSocialRegimeIds"]]
        expected["blockedMappings"] = [item for item in expected["blockedMappings"] if item["mappingId"] == "PROC-ADMIN-OTHER"]
        self.assertEqual(self.rest, expected)
        self.assertEqual(len(self.rest["deadlineDefinitions"]), 33)
        self.assertEqual(len(self.rest["regimes"]), 40)

    def test_old_twelve_calculations_and_complete_source_trails_are_preserved(self):
        for migration in self.plan["migrations"]:
            with self.subTest(rule=migration["ruleId"]):
                old = next(item for item in self.original["deadlineDefinitions"] if item["deadlineDefinitionId"] == migration["oldDefinitionId"])
                rule = next(item for item in self.social["federalRules"] if item["ruleId"] == migration["ruleId"])
                binding = next(item for item in self.social["cantonalBindings"] if item["bindingId"] == migration["bindingId"])
                self.assertEqual(rule["calculation"], old["calculation"])
                self.assertEqual(rule["triggerKind"], old["applicability"]["triggerKind"])
                self.assertEqual(rule["matter"], old["applicability"]["matter"])
                self.assertEqual(rule["filingProfileId"], old["filingProfileId"])
                self.assertEqual(rule["suspensionProfileId"], old["resultPolicy"]["suspensionProfileId"])
                refs = rule["sourceRefs"] + binding["sourceRefs"]
                for reference in old["sourceRefs"] + old["applicability"]["sourceRefs"]:
                    self.assertIn(reference, refs)
                authorities = {item["sourceId"]: item["authority"] for item in self.social["sources"]}
                self.assertTrue(all(authorities[item["sourceId"]] != "Kanton Bern" for item in rule["sourceRefs"]))

    def test_three_blocked_mappings_keep_ids_and_sources_in_new_component(self):
        for old in self.original["blockedMappings"]:
            if not old["mappingId"].startswith("SOC-"):
                continue
            new = next(item for item in self.social["excludedPaths"] if item["exclusionId"] == old["mappingId"])
            self.assertEqual(new["sourceRefs"], old["sourceRefs"])
            self.assertEqual(new["reasonKind"], "unsupported-procedure")

    def test_elg_court_paths_bind_domicile_and_independent_appeal_time(self):
        for suffix in ["APP", "CORRECTION"]:
            binding = next(item for item in self.social["cantonalBindings"] if item["bindingId"] == f"BE-SOC-ELG-{suffix}")
            route = binding["contextRoutes"][0]
            self.assertEqual(route["contextRouteId"], "be-atsg58-court")
            self.assertIn({"factKey": "partyDomicileCanton", "allowedValues": ["BE"]}, route["requiredFacts"])
            self.assertIn({"factKey": "courtCanton", "allowedValues": ["BE"]}, route["requiredFacts"])
            norms = [item for item in binding["normBindings"] if item["sourceId"] == "SRC-AP17C-ATSG-20240101" and item["locator"].startswith("Art. 58,")]
            self.assertEqual(len(norms), 1)
            self.assertEqual(norms[0]["temporalSelector"], "jurisdictionReferenceDate")

    def test_eight_unmodified_artifacts_stay_byte_identical(self):
        unchanged = [item for item in self.manifest["artifacts"] if item["role"] not in {"socialProcedureCatalog", "specialRegimeCatalog"}]
        self.assertEqual(len(unchanged), 8)
        for artifact in unchanged:
            self.assertEqual((BASE / artifact["path"]).read_bytes(), (CANDIDATE / artifact["path"]).read_bytes())

    def test_historical_manifest_schema_still_rejects_five(self):
        old_schema = load(ROOT / "schemas/release-manifest.schema.json")
        self.assertEqual(old_schema["properties"]["formatVersion"]["enum"], ["1.0.0", "2.0.0", "3.0.0", "4.0.0"])
        self.assertTrue(list(self.validators[old_schema["$id"]].iter_errors(self.manifest)))

    def test_new_contract_rejects_unknown_top_and_nested_fields(self):
        for mutate in [lambda x: x.update(jurisdiction="BE"), lambda x: x["federalRules"][0].update(runtimeActive=True), lambda x: x["cantonalBindings"][0]["contextRoutes"][0].update(predicate="true")]:
            instance = copy.deepcopy(self.social)
            mutate(instance)
            self.assert_rejected(instance)

    def test_relative_calculation_has_exactly_one_duration_form(self):
        instance = copy.deepcopy(self.social)
        calculation = instance["federalRules"][0]["calculation"]
        calculation["durationInputId"] = "deadlineDays"
        self.assert_rejected(instance)
        del calculation["durationInputId"]
        del calculation["duration"]
        self.assert_rejected(instance)

    def test_schema_rejects_invalid_dates_values_and_unknown_laws(self):
        for mutate in [lambda x: x["federalRules"][0].update(law="unknown"), lambda x: x["federalRules"][0]["caseCoverage"].update(from_="2026-01-01"), lambda x: x["federalRules"][0]["caseCoverage"].update(to="2026-02-30"), lambda x: x["cantonalBindings"][0]["contextRoutes"][0]["requiredFacts"][0].update(allowedValues=["true"])]:
            instance = copy.deepcopy(self.social)
            mutate(instance)
            self.assert_rejected(instance)

    def test_approved_eligibility_cannot_lack_approval_and_candidate_cannot_claim_it(self):
        instance = copy.deepcopy(self.social)
        instance["releaseEligibility"][0]["status"] = "approved"
        self.assert_rejected(instance)
        instance["releaseEligibility"][0]["status"] = "candidate"
        instance["releaseEligibility"][0]["approval"] = {"approvedBy": "Synthetic", "approvedOn": "2026-09-25", "decisionRef": "TEST-ONLY"}
        self.assert_rejected(instance)

    def test_evidence_references_bind_real_artifact_bytes(self):
        source = ROOT / "outputs/ap19c1-2026-09-25/source-review.json"
        suite = ROOT / "tests/golden/candidates/ap19b-social-deadlines.json"
        legacy_suite = ROOT / "tests/golden/candidates/ap17b-anwendbarkeit.json"
        for eligibility in self.social["releaseEligibility"]:
            self.assertEqual(eligibility["sourceReviewRef"]["sha256"], hashlib.sha256(source.read_bytes()).hexdigest())
            expected_suite = suite if eligibility["ruleRef"]["ruleId"].startswith("CH-SOC-ELG-") else legacy_suite
            self.assertEqual(eligibility["referenceSuiteRef"]["sha256"], hashlib.sha256(expected_suite.read_bytes()).hexdigest())
            for reference in eligibility["componentRefs"]:
                descriptor = next(item for item in self.manifest["artifacts"] if item["role"] == reference["role"] and item["contentId"] == reference["contentId"])
                self.assertEqual(reference["sha256"], descriptor["sha256"])


if __name__ == "__main__":
    unittest.main()
