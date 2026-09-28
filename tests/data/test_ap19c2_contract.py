#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""AP19C2 schema, provenance and append-only candidate evidence. No activation."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "data/candidates/2026-09-28-ap19c2"
BASE = ROOT / "data/candidates/2026-09-25-ap19c1"
EVIDENCE = ROOT / "outputs/ap19c2-2026-09-28"
SOURCES = EVIDENCE / "sources"
REFERENCES = ROOT / "tests/golden/candidates/ap19b-social-deadlines.json"
WINDOW = {"from": "2026-01-01", "to": "2027-12-31"}
SOURCE_HASH = "33d2fe1c6f6e1d54a97f8a9a54c97ce4a58aea56d0158a029ffa2a5d0f43abc3"
BASE_MANIFEST_HASH = "eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524"


def load(path):
    return json.loads(path.read_bytes())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def object_sha(value):
    # These particular catalog objects contain strings, booleans, null and
    # small integer revisions/durations only. No general RFC 8785 number codec.
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class AP19C2ContractTest(unittest.TestCase):
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
        cls.base_manifest = load(BASE / "manifest.json")
        cls.original = load(BASE / "social-procedures/ch-social-procedures.json")
        cls.review = load(SOURCES / "source-review.json")
        cls.verification = load(EVIDENCE / "build-verification.json")
        cls.avig_rules = [item for item in cls.social["federalRules"] if item["law"] == "avig"]
        cls.avig_bindings = [item for item in cls.social["cantonalBindings"] if item["ruleId"].startswith("CH-SOC-AVIG-ALE-")]

    def test_manifest_and_all_ten_artifacts_validate_and_match_exact_bytes(self):
        self.validators[self.manifest["$schema"]].validate(self.manifest)
        self.assertEqual(len(self.manifest["artifacts"]), 10)
        self.assertEqual(self.verification["manifestSha256"], sha(CANDIDATE / "manifest.json"))
        for descriptor in self.manifest["artifacts"]:
            with self.subTest(path=descriptor["path"]):
                raw = (CANDIDATE / descriptor["path"]).read_bytes()
                self.assertEqual(hashlib.sha256(raw).hexdigest(), descriptor["sha256"])
                self.assertEqual(len(raw), descriptor["byteLength"])
                self.validators[descriptor["schemaId"]].validate(json.loads(raw))

    def test_c1_manifest_and_every_original_artifact_remain_bound_and_unchanged(self):
        self.assertEqual(sha(BASE / "manifest.json"), BASE_MANIFEST_HASH)
        self.assertEqual(self.verification["baseManifestSha256"], BASE_MANIFEST_HASH)
        for descriptor in self.base_manifest["artifacts"]:
            with self.subTest(path=descriptor["path"]):
                raw = (BASE / descriptor["path"]).read_bytes()
                self.assertEqual(hashlib.sha256(raw).hexdigest(), descriptor["sha256"])
                self.assertEqual(len(raw), descriptor["byteLength"])

    def test_nine_non_social_artifacts_are_byte_identical_to_c1(self):
        unchanged = [item for item in self.manifest["artifacts"] if item["role"] != "socialProcedureCatalog"]
        self.assertEqual(len(unchanged), 9)
        for descriptor in unchanged:
            with self.subTest(path=descriptor["path"]):
                self.assertEqual((CANDIDATE / descriptor["path"]).read_bytes(), (BASE / descriptor["path"]).read_bytes())
        self.assertEqual({item["path"] for item in self.verification["unchangedArtifacts"]}, {item["path"] for item in unchanged})

    def test_all_original_rules_bindings_sources_and_exclusions_are_preserved(self):
        for group, identity in [("federalRules", "ruleId"), ("cantonalBindings", "bindingId"), ("sources", "sourceId"), ("excludedPaths", "exclusionId")]:
            current = {item[identity]: item for item in self.social[group]}
            for old in self.original[group]:
                with self.subTest(group=group, identity=old[identity]):
                    self.assertEqual(current[old[identity]], old)
        self.assertEqual(self.social["suspensionProfiles"], self.original["suspensionProfiles"])
        self.assertEqual(self.social["filingProfiles"], self.original["filingProfiles"])

    def test_c1_eligibility_keeps_its_provenance_and_changes_only_containing_release(self):
        current = {item["eligibilityId"]: item for item in self.social["releaseEligibility"]}
        for old in self.original["releaseEligibility"]:
            expected = copy.deepcopy(old)
            expected["releaseId"] = self.manifest["releaseId"]
            self.assertEqual(current[old["eligibilityId"]], expected)
        self.assertEqual(self.manifest["extensions"]["steimer.candidate"]["priorEvidence"], self.base_manifest["extensions"]["steimer.candidate"])

    def test_candidate_is_not_human_approval_or_operational_activation(self):
        self.assertEqual(self.manifest["releaseStatus"], "candidate")
        self.assertEqual(self.manifest["formatVersion"], "5.0.0")
        self.assertEqual(self.social["formatVersion"], "1.0.0")
        self.assertNotIn("steimer.approval", self.manifest["extensions"])
        extension = self.manifest["extensions"]["steimer.candidate"]
        self.assertTrue(extension["approvalRequired"])
        self.assertFalse(extension["productionActivation"])
        self.assertFalse(self.verification["productionActivation"])
        self.assertFalse(self.verification["integrationApproved"])
        self.assertEqual(len(self.social["federalRules"]), 20)
        self.assertEqual(len(self.social["cantonalBindings"]), 24)
        self.assertEqual(len(self.social["releaseEligibility"]), 24)
        for item in self.social["federalRules"] + self.social["cantonalBindings"]:
            self.assertEqual(item["status"], "candidate")
        for item in self.social["releaseEligibility"]:
            self.assertEqual(item["status"], "candidate")
            self.assertIsNone(item["approval"])
            self.assertEqual(item["releaseId"], self.manifest["releaseId"])
        self.assertEqual({item["law"] for item in self.social["federalRules"]}, {"ivg", "ahvg", "uvg", "elg", "avig"})
        self.assertEqual({item["procedureContextCanton"] for item in self.social["cantonalBindings"]}, {"BE"})

    def test_eight_avig_eligibilities_bind_exact_rule_binding_calendar_and_evidence_objects(self):
        source_reference = {"reviewId": self.review["reviewId"], "sha256": sha(SOURCES / "source-review.json")}
        suite_reference = {"suiteId": "AP19B-SOCIAL-REFERENCES-1", "sha256": sha(REFERENCES)}
        extension = self.manifest["extensions"]["steimer.candidate"]
        self.assertEqual(extension["sourceReviewRef"], source_reference)
        self.assertEqual(extension["referenceSuiteRef"], suite_reference)
        avig = [item for item in self.social["releaseEligibility"] if item["ruleRef"]["ruleId"].startswith("CH-SOC-AVIG-ALE-")]
        self.assertEqual(len(avig), 8)
        for item in avig:
            rule = next(rule for rule in self.avig_rules if rule["ruleId"] == item["ruleRef"]["ruleId"])
            binding = next(binding for binding in self.avig_bindings if binding["bindingId"] == item["bindingRef"]["bindingId"])
            self.assertEqual(item["ruleRef"]["sha256"], object_sha(rule))
            self.assertEqual(item["bindingRef"]["sha256"], object_sha(binding))
            self.assertEqual(item["sourceReviewRef"], source_reference)
            self.assertEqual(item["referenceSuiteRef"], suite_reference)
            self.assertEqual(item["contextRouteIds"], [route["contextRouteId"] for route in binding["contextRoutes"]])
            for reference in item["componentRefs"]:
                descriptor = next(row for row in self.manifest["artifacts"] if row["role"] == reference["role"] and row["contentId"] == reference["contentId"])
                self.assertEqual(reference["sha256"], descriptor["sha256"])

    def test_option_b_source_review_is_hash_bound_and_distinguishes_reconstruction_from_full_text(self):
        self.assertEqual(sha(SOURCES / "source-review.json"), SOURCE_HASH)
        for key in ["humanApproval", "productionApproval", "runtimeActivation"]:
            self.assertFalse(self.review[key])
        self.assertEqual(self.review["scope"]["sourceCoverage"], WINDOW)
        method = self.review["officialAmendmentReconstruction"]
        self.assertEqual(method["method"], "official-amendment-reconstruction")
        self.assertEqual(method["acceptedMethodReference"], "docs/fachrecht/abnahme-ap19b.md")
        self.assertEqual(method["reconstructedFrom"], "2027-02-01")
        self.assertEqual(method["reconstructedThrough"], "2027-12-31")
        self.assertTrue(method["noClaimOfOfficialConsolidatedFebruaryText"])
        self.assertEqual(method["failedExport"]["result"], "html-fallback-not-valid-legal-source")
        self.assertEqual(method["failedExport"]["responseSha256"], sha(SOURCES / "AVIV-20270201-response.txt"))
        self.assertFalse(any("20270201" in source["url"] for source in self.social["sources"]))
        source_ids = {source["sourceId"] for source in self.social["sources"]}
        self.assertTrue(set(method["evidenceSourceRefs"]).issubset(source_ids))

    def test_each_fresh_source_response_and_complete_index_match_reviewed_bytes(self):
        self.assertEqual(len(self.review["checks"]), 11)
        for check in self.review["checks"]:
            with self.subTest(source=check["sourceRef"]):
                file = check.get("file", check.get("response"))
                self.assertIsNotNone(file)
                self.assertEqual(Path(file).name, file)
                self.assertEqual(sha(SOURCES / file), check["responseSha256"])
        index = next(check for check in self.review["checks"] if check["mode"] == "fresh-official-complete-article-impact-index")
        self.assertTrue(index["noPublicationYearFilter"])
        self.assertTrue(index["noPreselectedArticleFilter"])
        self.assertEqual(len(index["entries"]), 3)
        self.assertEqual({entry["target"].rsplit("/", 1)[-1] for entry in index["entries"]}, {"art_46", "art_66a", "art_57b"})

    def test_avig_does_not_silently_expand_time_or_holiday_scope(self):
        self.assertEqual(len(self.avig_rules), 4)
        self.assertEqual(len(self.avig_bindings), 8)
        for item in self.avig_rules + self.avig_bindings:
            for key in ["legalValidity", "caseCoverage", "sourceCoverage"]:
                self.assertEqual(item[key], WINDOW)
            for norm in item["normBindings"]:
                self.assertEqual(norm["verification"], "verified")
                self.assertEqual(norm["applicableFrom"], WINDOW["from"])
                self.assertEqual(norm["applicableTo"], WINDOW["to"])
        for binding in self.avig_bindings:
            for calendar in binding["calendarBindings"]:
                self.assertEqual(calendar["holidayCanton"], "BE")
                self.assertEqual(calendar["spatialScopeId"], "BE")
                self.assertEqual(calendar["calendarId"], "be-public-holidays")

    def test_fund_and_office_routes_require_distinct_facts_and_time_selectors(self):
        for binding in self.avig_bindings:
            fund = binding["bindingId"].endswith("-FUND")
            court = "-APP-" in binding["bindingId"] or "-CORRECTION-" in binding["bindingId"]
            self.assertEqual(len(binding["contextRoutes"]), 1)
            route = binding["contextRoutes"][0]
            facts = {fact["factKey"]: fact["allowedValues"] for fact in route["requiredFacts"]}
            self.assertEqual(facts["decisionOrigin"], ["unemploymentFund" if fund else "cantonalEmploymentOffice"])
            self.assertEqual(facts["avigControlCanton" if fund else "avigOfficeCanton"], ["BE"])
            self.assertNotIn("avigOfficeCanton" if fund else "avigControlCanton", facts)
            self.assertNotIn("partyDomicileCanton", facts)
            self.assertEqual("courtCanton" in facts, court)
            if court:
                self.assertEqual(facts["courtCanton"], ["BE"])
            reference_dates = [norm for norm in binding["normBindings"] if norm["temporalSelector"] == "jurisdictionReferenceDate"]
            self.assertEqual(bool(reference_dates), fund)
            if fund and "-ADM-" in binding["bindingId"]:
                self.assertTrue(any("laufende Zuständigkeit" in norm["locator"] for norm in reference_dates))
            elif fund:
                self.assertTrue(any("ursprünglichen Verfügung" in norm["locator"] for norm in reference_dates))

    def test_schema_still_rejects_synthetic_authorization_and_unknown_context_fields(self):
        validator = self.validators[self.social["$schema"]]
        for mutate in [
            lambda value: value["releaseEligibility"][-1].update(status="approved"),
            lambda value: value["releaseEligibility"][-1].update(approval={"approvedBy": "Synthetic", "approvedOn": "2026-09-28", "decisionRef": "NOT-A-RELEASE"}),
            lambda value: value["cantonalBindings"][-1]["contextRoutes"][0].update(automaticBernFallback=True),
            lambda value: value["federalRules"][-1].update(runtimeActive=True),
        ]:
            with self.subTest(mutation=mutate):
                changed = copy.deepcopy(self.social)
                mutate(changed)
                self.assertTrue(list(validator.iter_errors(changed)))


if __name__ == "__main__":
    unittest.main()
