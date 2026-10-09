#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Historical manifest-schema compatibility, not execution of an old app binary."""

from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[2]
FIXTURE = ROOT / "tests/fixtures/ap18c/manifest-format3.schema.json"
COMMON = ROOT / "schemas/common.schema.json"
SCHEMA_SHA256 = "016abce21e480fd24c6ba45213df66622c9216299986cd89a22e95ea751cad55"
COMMON_SHA256 = "a3616757f84b5f5ab5c2c671abf628e643303cb4c8ffd3afd01751b82f6ef1f8"
APPROVED_MANIFEST_SHA256 = "74583fa4dc9cab8ed99af3f9202782d90b02e9e47578f1dd9d2da40d19357be8"


def read_pinned_json(path: Path, expected_hash: str) -> dict:
    raw = path.read_bytes()
    actual = hashlib.sha256(raw).hexdigest()
    if actual != expected_hash:
        raise AssertionError(f"Historical contract input changed: {path.name}: {actual}")
    return json.loads(raw)


class PreviousManifestContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = read_pinned_json(FIXTURE, SCHEMA_SHA256)
        common = read_pinned_json(COMMON, COMMON_SHA256)
        Draft202012Validator.check_schema(cls.schema)
        registry = Registry().with_resources(
            (schema["$id"], Resource.from_contents(schema))
            for schema in (cls.schema, common)
        )
        cls.validator = Draft202012Validator(
            cls.schema, registry=registry, format_checker=FormatChecker()
        )
        cls.approved = read_pinned_json(
            ROOT / "data/releases/2026-08-31-mvp-03-approved.1/manifest.json",
            APPROVED_MANIFEST_SHA256,
        )
        cls.candidate = json.loads(
            (ROOT / "data/releases/2026-09-22-ap18c-candidate.1/manifest.json").read_bytes()
        )

    def assert_rejected_at(self, errors, path, validator):
        self.assertTrue(
            any(list(error.absolute_path) == path and error.validator == validator for error in errors),
            [(list(error.absolute_path), error.validator, error.message) for error in errors],
        )

    def test_historical_fixture_and_unchanged_dependency_keep_exact_bytes(self):
        self.assertEqual(FIXTURE.stat().st_size, 10245)
        self.assertEqual(hashlib.sha256(FIXTURE.read_bytes()).hexdigest(), SCHEMA_SHA256)
        self.assertEqual(hashlib.sha256(COMMON.read_bytes()).hexdigest(), COMMON_SHA256)
        self.assertEqual(self.schema["properties"]["formatVersion"]["enum"], ["1.0.0", "2.0.0", "3.0.0"])

    def test_actual_approved_mvp03_manifest_is_accepted_by_historical_contract(self):
        self.assertEqual(self.approved["formatVersion"], "3.0.0")
        self.assertEqual(self.approved["releaseStatus"], "approved")
        self.assertEqual(list(self.validator.iter_errors(self.approved)), [])

    def test_actual_ap18c_candidate_is_rejected_on_version_role_and_catalog_ids(self):
        self.assertEqual(self.candidate["formatVersion"], "4.0.0")
        errors = list(self.validator.iter_errors(self.candidate))
        self.assert_rejected_at(errors, ["formatVersion"], "enum")
        catalog_index = next(
            index for index, artifact in enumerate(self.candidate["artifacts"])
            if artifact["role"] == "holidayCatalog"
        )
        self.assert_rejected_at(errors, ["artifacts", catalog_index, "role"], "enum")
        self.assertTrue(any(error.validator == "additionalProperties"
                            and not list(error.absolute_path)
                            and "holidayCatalogIds" in error.message for error in errors))

    def test_new_version_alone_is_rejected_without_modifying_the_historical_schema(self):
        instance = copy.deepcopy(self.approved)
        instance["formatVersion"] = "4.0.0"
        errors = list(self.validator.iter_errors(instance))
        self.assertEqual(len(errors), 1)
        self.assert_rejected_at(errors, ["formatVersion"], "enum")

    def test_new_role_alone_is_not_treated_as_a_calendar(self):
        instance = copy.deepcopy(self.approved)
        instance["artifacts"][0]["role"] = "holidayCatalog"
        errors = list(self.validator.iter_errors(instance))
        self.assertEqual(len(errors), 1)
        self.assert_rejected_at(errors, ["artifacts", 0, "role"], "enum")

    def test_new_catalog_ids_alone_are_rejected_as_unknown_core_field(self):
        instance = copy.deepcopy(self.approved)
        instance["holidayCatalogIds"] = ["ch-holiday-catalog"]
        errors = list(self.validator.iter_errors(instance))
        self.assertEqual(len(errors), 1)
        self.assert_rejected_at(errors, [], "additionalProperties")
        self.assertIn("holidayCatalogIds", errors[0].message)


if __name__ == "__main__":
    unittest.main()
