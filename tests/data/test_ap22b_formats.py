#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Isolated AP22B schema proposal tests, never a product activation test."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[2]
SCHEMAS = ROOT / "schemas"
DRAFTS = SCHEMAS / "candidates" / "ap22b"
BASELINE = ROOT / "data/releases/2026-10-01-mvp-06-approved.1"
HISTORY = ROOT / "outputs/release-mvp07-2026-10-08/inputs"
PREFIX = "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/"
OLD_HASHES = {
    "calendar-rules-v2.schema.json": "a01a220c6df09cd932ca7407f0a04bad2217acb6e0a45dec06b9358926caca98",
    "release-manifest-v6.schema.json": "c6ea5582d47db4fbc8fceec1819af2648c6aaaf1f9f169caf2e301d5f22b4825",
    "holiday-catalog-v1.schema.json": "03af4aabdfcd34d9f73f14dc01322ce1c77ad34f45e47bddb63cb5f3b58db0a4",
}
ROLE_SCHEMAS = {
    "legalProfile": "legal-profile.schema.json",
    "calendar": "calendar-rules-v3.schema.json",
    "specialRegimeCatalog": "special-regime-catalog-v3.schema.json",
    "holidayCatalog": "holiday-catalog-v2.schema.json",
    "socialProcedureCatalog": "social-procedure-catalog-v2.schema.json",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def calendar_fixture():
    # The source file remains immutable. Only this in-memory test fixture changes.
    value = read_json(BASELINE / "calendars/be-public-holidays.json")
    value["$schema"] = PREFIX + "calendar-rules-v3.schema.json"
    value["formatVersion"] = "3.0.0"
    value["projection"] = {
        "catalogId": "ch-holiday-catalog", "catalogFormatVersion": "2.0.0",
        "projectionId": "be-public-holidays", "sourceHash": "a" * 64,
    }
    value["rules"] = value["rules"][:1]
    value["rules"][0]["condition"] = "always"
    return value


def manifest_fixture():
    value = read_json(BASELINE / "manifest.json")
    value["$schema"] = PREFIX + "release-manifest-v7.schema.json"
    value["formatVersion"] = "7.0.0"
    value["releaseStatus"] = "candidate"
    value["compatibility"]["minimumConsumerFormatVersion"] = "7.0.0"
    for descriptor in value["artifacts"]:
        descriptor["schemaId"] = PREFIX + ROLE_SCHEMAS[descriptor["role"]]
    # Artifact bytes and their digests are NOT built here. The main semantic
    # contract checker is responsible for inventory bijections and hash binding.
    return value


class AP22BFormatProposalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        schemas = [read_json(path) for path in SCHEMAS.glob("*.schema.json")]
        schemas.extend(read_json(DRAFTS / name) for name in (
            "calendar-rules-v3.schema.json", "release-manifest-v7.schema.json"))
        cls.schemas = {value["$id"]: value for value in schemas}
        cls.registry = Registry().with_resources(
            (value["$id"], Resource.from_contents(value)) for value in schemas)

    def validator(self, name):
        return Draft202012Validator(self.schemas[PREFIX + name],
                                     registry=self.registry, format_checker=FormatChecker())

    def assert_valid(self, name, value):
        self.validator(name).validate(value)

    def assert_invalid(self, name, value):
        self.assertTrue(list(self.validator(name).iter_errors(value)))

    def test_draft_schemas_are_valid_and_isolated(self):
        # Keep AP22B's original isolation check against its hash-bound history.
        # The later R07-B copy must match the confirmed implementation exactly.
        snapshot = (HISTORY / "snapshot.json").read_bytes()
        self.assertEqual(hashlib.sha256(snapshot).hexdigest(),
                         "cbb9744cb2cc4f5b1812ad7850b9746fb4b504bab1c488eec824dd783b34f3bb")
        original = next(row for row in json.loads(snapshot)["evidence"]
                        if row["path"] == "tests/data/test_ap22b_formats.py")
        self.assertEqual(hashlib.sha256((ROOT / original["archivedAt"]).read_bytes()).hexdigest(), original["sha256"])
        for name in ("calendar-rules-v3.schema.json", "release-manifest-v7.schema.json"):
            with self.subTest(name=name):
                schema = self.schemas[PREFIX + name]
                Draft202012Validator.check_schema(schema)
                self.assertIn("Vertragsvorlage", schema["title"])
                self.assertFalse((HISTORY / "files/schemas" / name).exists(), "Historical proposal unexpectedly promoted")
                self.assertEqual((SCHEMAS / name).read_bytes(),
                                 (HISTORY / "files/schemas/implementation/ap22c1" / name).read_bytes())
                self.assertEqual((DRAFTS / name).read_bytes(),
                                 (HISTORY / "files/schemas/candidates/ap22b" / name).read_bytes())

    def test_old_contract_files_remain_byteidentical(self):
        for name, expected in OLD_HASHES.items():
            with self.subTest(name=name):
                self.assertEqual(hashlib.sha256((SCHEMAS / name).read_bytes()).hexdigest(), expected)

    def test_old_readers_reject_new_major_versions(self):
        self.assert_invalid("calendar-rules-v2.schema.json", calendar_fixture())
        self.assert_invalid("release-manifest-v6.schema.json", manifest_fixture())
        catalog = read_json(BASELINE / "holiday-catalogs/ch-holiday-catalog.json")
        catalog["formatVersion"] = "2.0.0"
        catalog["$schema"] = PREFIX + "holiday-catalog-v2.schema.json"
        self.assert_invalid("holiday-catalog-v1.schema.json", catalog)

    def test_current_historical_artifacts_still_validate(self):
        self.assert_valid("calendar-rules-v2.schema.json",
                          read_json(BASELINE / "calendars/be-public-holidays.json"))
        self.assert_valid("release-manifest-v6.schema.json", read_json(BASELINE / "manifest.json"))

    def test_minimal_calendar_and_nullable_projection(self):
        value = calendar_fixture()
        self.assert_valid("calendar-rules-v3.schema.json", value)
        value["projection"] = None
        self.assert_valid("calendar-rules-v3.schema.json", value)
        del value["projection"]
        self.assert_invalid("calendar-rules-v3.schema.json", value)

    def test_projection_is_closed_and_version_and_hash_bound(self):
        for key, bad in (("catalogFormatVersion", "1.0.0"), ("sourceHash", "not-a-hash"),
                         ("catalogId", "other-catalog"), ("unexpected", True)):
            with self.subTest(key=key):
                value = calendar_fixture()
                value["projection"][key] = bad
                self.assert_invalid("calendar-rules-v3.schema.json", value)

    def test_closed_holiday_conditions_and_parameters(self):
        cases = (
            ("unlessTuesdayOrSaturday", {"type": "fixedMonthDay", "month": 12, "day": 26}),
            ("onlyMonday", {"type": "fixedMonthDay", "month": 1, "day": 2}),
            ("onlyMonday", {"type": "fixedMonthDay", "month": 12, "day": 26}),
            ("shiftHolyThursdayBy7Days", {"type": "nthWeekdayOfMonth", "month": 4,
                                          "isoWeekday": 4, "occurrence": 1}),
        )
        for condition, calculation in cases:
            with self.subTest(condition=condition, calculation=calculation):
                value = calendar_fixture()
                value["rules"][0].update(condition=condition, calculation=calculation)
                self.assert_valid("calendar-rules-v3.schema.json", value)
        for condition in ("sometimes", "", None, {"expression": "true"}):
            with self.subTest(condition=condition):
                value = calendar_fixture()
                value["rules"][0]["condition"] = condition
                self.assert_invalid("calendar-rules-v3.schema.json", value)
        for condition, month, day in (("unlessTuesdayOrSaturday", 1, 2),
                                     ("onlyMonday", 1, 26), ("onlyMonday", 12, 2)):
            value = calendar_fixture()
            value["rules"][0].update(condition=condition,
                                     calculation={"type": "fixedMonthDay", "month": month, "day": day})
            self.assert_invalid("calendar-rules-v3.schema.json", value)
        value = calendar_fixture()
        del value["rules"][0]["condition"]
        self.assert_invalid("calendar-rules-v3.schema.json", value)

    def test_offset_limits_and_procedural_equivalent_day(self):
        value = calendar_fixture()
        rule = value["rules"][0]
        rule["calculation"] = {"type": "nthWeekdayOffsetDays", "month": 9,
                               "isoWeekday": 7, "occurrence": 3, "offsetDays": 1}
        rule["effect"]["kind"] = "proceduralEquivalentDay"
        self.assert_valid("calendar-rules-v3.schema.json", value)
        for bad in (-367, 367, 0.5, "1"):
            with self.subTest(offset=bad):
                rule["calculation"]["offsetDays"] = bad
                self.assert_invalid("calendar-rules-v3.schema.json", value)
        rule["calculation"]["offsetDays"] = 1
        rule["calculation"]["isoWeekday"] = 0
        self.assert_invalid("calendar-rules-v3.schema.json", value)

    def test_suspension_cannot_use_holiday_condition(self):
        value = calendar_fixture()
        baseline = read_json(BASELINE / "calendars/ch-federal-calendar.json")
        value["rules"] = [next(rule for rule in baseline["rules"]
                               if rule["effect"]["type"] == "suspensionPeriod")]
        self.assert_valid("calendar-rules-v3.schema.json", value)
        value["rules"][0]["condition"] = "always"
        self.assert_invalid("calendar-rules-v3.schema.json", value)

    def test_manifest_dynamic_calendar_inventory(self):
        value = manifest_fixture()
        self.assert_valid("release-manifest-v7.schema.json", value)
        descriptor = copy.deepcopy(next(item for item in value["artifacts"] if item["role"] == "calendar"))
        descriptor.update(contentId="zh-public-holidays", path="calendars/zh-public-holidays.json")
        value["calendarIds"].append("zh-public-holidays")
        value["artifacts"].append(descriptor)
        self.assert_valid("release-manifest-v7.schema.json", value)

    def test_manifest_exact_existing_profile_set(self):
        for bad in ([], ["stpo", "zpo", "bgg", "vwvg", "vrpg-zh"],
                    ["stpo", "zpo", "bgg", "vwvg", "vrpg-be", "vrpg-zh"],
                    ["stpo", "stpo", "bgg", "vwvg", "vrpg-be"]):
            with self.subTest(profiles=bad):
                value = manifest_fixture()
                value["profileIds"] = bad
                self.assert_invalid("release-manifest-v7.schema.json", value)

    def test_manifest_rejects_mixed_calendar_formats_and_role_schema_swaps(self):
        for role, expected in ROLE_SCHEMAS.items():
            for other in set(ROLE_SCHEMAS.values()) - {expected}:
                with self.subTest(role=role, schema=other):
                    value = manifest_fixture()
                    next(item for item in value["artifacts"] if item["role"] == role)["schemaId"] = PREFIX + other
                    self.assert_invalid("release-manifest-v7.schema.json", value)
        value = manifest_fixture()
        next(item for item in value["artifacts"] if item["role"] == "calendar")["schemaId"] = PREFIX + "calendar-rules-v2.schema.json"
        self.assert_invalid("release-manifest-v7.schema.json", value)
        value = manifest_fixture()
        value["compatibility"]["minimumConsumerFormatVersion"] = "6.0.0"
        self.assert_invalid("release-manifest-v7.schema.json", value)

    def test_manifest_requires_each_fixed_catalog_and_five_profiles(self):
        for role in ("holidayCatalog", "specialRegimeCatalog", "socialProcedureCatalog", "legalProfile"):
            with self.subTest(role=role):
                value = manifest_fixture()
                index = next(i for i, item in enumerate(value["artifacts"]) if item["role"] == role)
                del value["artifacts"][index]
                self.assert_invalid("release-manifest-v7.schema.json", value)


if __name__ == "__main__":
    unittest.main()
