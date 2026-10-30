# SPDX-License-Identifier: AGPL-3.0-only
"""Independent JSON-Schema and raw-byte check of the local AP23F3 candidate."""
import copy
import hashlib
import json
from pathlib import Path
import unittest
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "data/candidates/2026-10-22-ap23f3"

def read(path):
    return json.loads(path.read_bytes())

SCHEMAS = [read(path) for path in (ROOT / "schemas").rglob("*.json")]
SCHEMAS = {schema["$id"]: schema for schema in SCHEMAS if "$id" in schema}
REGISTRY = Registry().with_resources((key, Resource.from_contents(value)) for key, value in SCHEMAS.items())

def validate(value, schema):
    Draft202012Validator(schema, registry=REGISTRY).validate(value)

class AP23F3Contract(unittest.TestCase):
    def test_all_actual_artifacts_and_candidate_envelope(self):
        manifest = read(BUNDLE / "manifest.json")
        local = read(ROOT / "schemas/implementation/ap23f3/local-reference-manifest-v10.schema.json")
        validate(manifest, local)
        self.assertEqual(len(manifest["artifacts"]), 42)
        self.assertEqual(len(manifest["calendarIds"]), 33)
        for descriptor in manifest["artifacts"]:
            with self.subTest(path=descriptor["path"]):
                path = BUNDLE / descriptor["path"]
                self.assertTrue(path.resolve().is_relative_to(BUNDLE.resolve()))
                raw = path.read_bytes()
                self.assertEqual(len(raw), descriptor["byteLength"])
                self.assertEqual(hashlib.sha256(raw).hexdigest(), descriptor["sha256"])
                validate(json.loads(raw), SCHEMAS[descriptor["schemaId"]])
        approved = read(ROOT / "schemas/release-manifest-v10.schema.json")
        self.assertTrue(list(Draft202012Validator(approved, registry=REGISTRY).iter_errors(manifest)))

    def test_candidate_schema_keeps_contract_and_release_envelopes_separate(self):
        manifest = read(BUNDLE / "manifest.json")
        local = read(ROOT / "schemas/implementation/ap23f3/local-reference-manifest-v10.schema.json")
        # Extensions are descriptive metadata, not authority. The native
        # reader's issued mode and capability, not an extension flag, govern
        # calculations/export. Those runtime probes live in the TS suites.
        for flag in ["productionActivation", "sourceReleaseApproved", "calendarExportEnabled"]:
            self.assertIs(manifest["extensions"]["steimer.local-reference"][flag], False)
        for key, value in [("formatVersion", "9.0.0"), ("releaseStatus", "approved")]:
            changed = copy.deepcopy(manifest)
            changed[key] = value
            with self.subTest(key=key):
                self.assertTrue(list(Draft202012Validator(local, registry=REGISTRY).iter_errors(changed)))
        for key in ["calendarIds", "artifacts"]:
            changed = copy.deepcopy(manifest)
            changed[key].pop()
            with self.subTest(key=key):
                self.assertTrue(list(Draft202012Validator(local, registry=REGISTRY).iter_errors(changed)))

if __name__ == "__main__":
    unittest.main()
