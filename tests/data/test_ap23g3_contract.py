# SPDX-License-Identifier: AGPL-3.0-only
"""Independent schema/raw-byte/accepted-definition checks of actual G3 files."""
import copy
import hashlib
import json
from pathlib import Path
import unittest
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "data/candidates/2026-10-22-ap23g3"
F3 = ROOT / "data/candidates/2026-10-22-ap23f3"
G2 = ROOT / "outputs/ap23g2-candidate-2026-10-22/bundle"
ADMIN = "administrative-procedures/ch-cantonal-administrative-procedures.json"
RELEASE = "2026-10-22-ap23g3-candidate.1"
PREFIX = "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/"

def read(path):
    return json.loads(path.read_bytes())

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()

SCHEMAS = {schema["$id"]: schema for p in (ROOT / "schemas").rglob("*.json") if "$id" in (schema := read(p))}
REGISTRY = Registry().with_resources((key, Resource.from_contents(value)) for key, value in SCHEMAS.items())

def validate(value, schema):
    Draft202012Validator(schema, registry=REGISTRY, format_checker=FormatChecker()).validate(value)

def seal(catalog):
    for path in catalog["paths"]:
        policy = next(q for q in catalog["qualificationPolicies"] if q["pathId"] == path["pathId"])
        eligibility = next(e for e in catalog["releaseBinding"]["pathEligibility"] if e["pathId"] == path["pathId"])
        binding = next(b for b in catalog["holidayBindings"] if b["holidayBindingId"] == path["holidayBindingId"])
        suspension = next(s for s in catalog["suspensionProfiles"] if s["suspensionProfileId"] == path["suspensionProfileId"])
        policy["pathSha256"] = digest(canonical(path))
        eligibility.update(pathSha256=digest(canonical(path)), qualificationPolicySha256=digest(canonical(policy)),
                           holidayBindingSha256=digest(canonical(binding)), suspensionProfileSha256=digest(canonical(suspension)))

def accepted_definitions(catalog, accepted):
    for key in ("paths", "qualificationPolicies", "laws", "sources", "suspensionProfiles", "excludedPaths"):
        if catalog[key] != accepted[key]:
            raise AssertionError("Unaccepted G2 definition " + key)
    for binding in catalog["holidayBindings"]:
        previous = next(h for h in accepted["holidayBindings"] if h["holidayBindingId"] == binding["holidayBindingId"])
        actual = {k: v for k, v in binding.items() if k != "physicalBaseline"}
        expected = {k: v for k, v in previous.items() if k != "physicalBaseline"}
        if actual != expected:
            raise AssertionError("Unaccepted legal binding " + binding["holidayBindingId"])

class AP23G3Contract(unittest.TestCase):
    def test_all_actual_files_schemas_and_hashes(self):
        manifest = read(BUNDLE / "manifest.json")
        local = SCHEMAS[PREFIX + "schemas/implementation/ap23g3/local-reference-manifest-v11.schema.json"]
        validate(manifest, local)
        self.assertEqual(manifest["releaseId"], RELEASE)
        self.assertEqual(manifest["formatVersion"], "11.0.0")
        self.assertEqual(manifest["compatibility"]["minimumConsumerFormatVersion"], "11.0.0")
        self.assertEqual(len(manifest["artifacts"]), 42)
        self.assertEqual(len(manifest["calendarIds"]), 33)
        self.assertEqual(sorted(str(p.relative_to(BUNDLE)) for p in BUNDLE.rglob("*.json")),
                         sorted(["manifest.json"] + [d["path"] for d in manifest["artifacts"]]))
        for descriptor in manifest["artifacts"]:
            with self.subTest(path=descriptor["path"]):
                path = BUNDLE / descriptor["path"]
                self.assertTrue(path.resolve().is_relative_to(BUNDLE.resolve()))
                raw = path.read_bytes()
                self.assertEqual(len(raw), descriptor["byteLength"])
                self.assertEqual(digest(raw), descriptor["sha256"])
                document = json.loads(raw)
                self.assertEqual(document["$schema"], descriptor["schemaId"])
                validate(document, SCHEMAS[descriptor["schemaId"]])
        with self.assertRaises(Exception):
            validate(manifest, SCHEMAS[PREFIX + "schemas/release-manifest-v11.schema.json"])

    def test_preserved_g2_semantics_f3_paths_and_raw_calendars(self):
        c, accepted, f3 = read(BUNDLE / ADMIN), read(G2 / ADMIN), read(F3 / ADMIN)
        accepted_definitions(c, accepted)
        self.assertEqual([len(c[k]) for k in ("paths", "qualificationPolicies", "laws", "suspensionProfiles", "holidayBindings")], [58, 58, 11, 20, 13])
        for key in ("paths", "qualificationPolicies"):
            by_id = {p["pathId"]: p for p in c[key]}
            for p in f3[key]:
                self.assertEqual(by_id[p["pathId"]], p)
        unchanged = 0
        for descriptor in read(BUNDLE / "manifest.json")["artifacts"]:
            path = descriptor["path"]
            if path not in (ADMIN, "social-procedures/ch-social-procedures.json"):
                self.assertEqual((BUNDLE / path).read_bytes(), (F3 / path).read_bytes())
                unchanged += 1
        self.assertEqual(unchanged, 40)

    def test_actual_targets_and_historical_reuse_are_distinct(self):
        manifest, c, accepted = read(BUNDLE / "manifest.json"), read(BUNDLE / ADMIN), read(G2 / ADMIN)
        descriptors = {d["contentId"]: d for d in manifest["artifacts"]}
        for h in c["holidayBindings"]:
            self.assertEqual(h["physicalBaseline"]["releaseId"], RELEASE)
            for r in h["physicalBaseline"]["references"]:
                d = descriptors[r["contentId"]]
                self.assertEqual(r, {k: d[k] for k in ("contentId", "role", "path", "sha256")})
            if "physicalReuse" in h:
                prior = next(p for p in accepted["holidayBindings"] if p["holidayBindingId"] == h["holidayBindingId"])
                self.assertEqual(h["physicalReuse"], prior["physicalReuse"])
                self.assertEqual(h["physicalReuse"]["sourceReleaseId"], "2026-10-22-ap23f3-candidate.1")
                self.assertEqual(h["physicalReuse"]["permissionInheritance"], "none")
        for p in c["paths"]:
            q = next(q for q in c["qualificationPolicies"] if q["pathId"] == p["pathId"])
            e = next(e for e in c["releaseBinding"]["pathEligibility"] if e["pathId"] == p["pathId"])
            h = next(h for h in c["holidayBindings"] if h["holidayBindingId"] == p["holidayBindingId"])
            self.assertEqual(q["pathSha256"], digest(canonical(p)))
            self.assertEqual(e["pathSha256"], digest(canonical(p)))
            self.assertEqual(e["qualificationPolicySha256"], digest(canonical(q)))
            self.assertEqual(e["holidayBindingSha256"], digest(canonical(h)))

    def test_no_promotion_and_no_social_expansion(self):
        manifest, c = read(BUNDLE / "manifest.json"), read(BUNDLE / ADMIN)
        self.assertEqual(c["contractDecision"], {"id": "DEC-2026-036", "status": "approved", "on": "2026-10-22"})
        self.assertFalse(c["runtimeActive"])
        self.assertEqual(c["releaseBinding"]["status"], "candidate")
        self.assertIsNone(c["releaseBinding"]["releaseId"])
        self.assertIsNone(c["releaseBinding"]["approval"])
        self.assertEqual(c["releaseBinding"]["targetComponentRefs"], [])
        for flag in ("productionActivation", "sourceReleaseApproved", "calendarExportEnabled"):
            self.assertFalse(manifest["extensions"]["steimer.local-reference"][flag])
        path = "social-procedures/ch-social-procedures.json"
        social, old = read(BUNDLE / path), read(F3 / path)
        for k in ("federalRules", "cantonalBindings", "suspensionProfiles", "filingProfiles", "excludedPaths"):
            self.assertEqual(social[k], old[k])
        self.assertEqual(len(social["federalRules"]), 44)
        self.assertEqual(len(social["cantonalBindings"]), 50)
        for e in social["releaseEligibility"]:
            self.assertEqual(e["releaseId"], RELEASE)
            self.assertEqual(e["status"], "candidate")
            self.assertIsNone(e["approval"])
            self.assertEqual(e["calculationCoverage"]["to"], "2027-12-31")

    def test_rehashed_semantic_changes_are_not_new_accepted_definitions(self):
        c, accepted = read(BUNDLE / ADMIN), read(G2 / ADMIN)
        edits = [
            lambda x: next(p for p in x["paths"] if p["pathId"] == "ur-admin-20")["duration"].update(value=21),
            lambda x: next(p for p in x["paths"] if p["pathId"] == "ur-admin-20").update(openingWarnings=[]),
            lambda x: next(q for q in x["qualificationPolicies"] if q["pathId"] == "sh-court-reasons-30")["requirements"].update(requiredSameIssuingCourt=False),
            lambda x: next(h for h in x["holidayBindings"] if h["holidayBindingId"] == "sh-administration-seat").update(practiceAddition=None),
            lambda x: next(h for h in x["holidayBindings"] if h["holidayBindingId"] == "sh-administration-seat")["physicalReuse"].update(sourceReleaseId=RELEASE),
            lambda x: next(s for s in x["sources"] if s["sourceId"] == "JUD-AP23G1-SH-BGER-2C4832025-20260312").update(url="https://example.org/forged"),
            lambda x: next(p for p in x["paths"] if p["pathId"] == "ar-execution-5")["duration"].update(value=6),
        ]
        for n, edit in enumerate(edits):
            with self.subTest(mutation=n):
                changed = copy.deepcopy(c)
                edit(changed)
                seal(changed)
                with self.assertRaises(AssertionError):
                    accepted_definitions(changed, accepted)

    def test_old_schema_relabelling_and_incomplete_native_inventory(self):
        manifest = read(BUNDLE / "manifest.json")
        local = SCHEMAS[PREFIX + "schemas/implementation/ap23g3/local-reference-manifest-v11.schema.json"]
        for key in ("calendarIds", "artifacts"):
            changed = copy.deepcopy(manifest)
            changed[key].pop()
            with self.assertRaises(Exception):
                validate(changed, local)
        old = copy.deepcopy(manifest)
        old["$schema"] = PREFIX + "schemas/implementation/ap23f3/local-reference-manifest-v10.schema.json"
        old["formatVersion"] = "10.0.0"
        old["compatibility"]["minimumConsumerFormatVersion"] = "10.0.0"
        with self.assertRaises(Exception):
            validate(old, SCHEMAS[old["$schema"]])

if __name__ == "__main__":
    unittest.main()
