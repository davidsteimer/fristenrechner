"""Independent contract, projection and date tests for the isolated C1 bundle."""
from __future__ import annotations

import copy
import json
import unittest
from datetime import date

from ap22c1_contract import (
    BASE, BUNDLE, PREFIX, ROLE_SCHEMAS, ROOT, SPECIMEN, ContractError, canonical, check_schema,
    easter_sunday, holiday_date, holiday_dates_in_year, read_json, sha,
    validate_bundle, validate_calendars, validate_catalog, validate_date_probes, validate_inventory,
    validate_manifest, validate_social_copy,
)


class CalendarDateOracleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rules = {r["id"]: r for r in read_json(SPECIMEN)["data"]["rules"]}

    def archive_date(self, identifier, year):
        r = self.rules[identifier]
        return holiday_date(r["calculation"], r["condition"], year, {"from": r["from"], "to": r["to"]})

    def test_gregorian_easter_known_century_and_late_dates(self):
        for year, expected in ((1900, "1900-04-15"), (2000, "2000-04-23"), (2026, "2026-04-05"),
                               (2027, "2027-03-28"), (2038, "2038-04-25"), (2100, "2100-03-28")):
            with self.subTest(year=year):
                self.assertEqual(easter_sunday(year).isoformat(), expected)

    def test_ar_and_ai_stephen_day_conditions(self):
        for prefix in ("AR-ARG-ALL", "AI-RTG-ALL"):
            identifier = prefix + "-DAY-ST-STEPHEN"
            for year in range(2026, 2101):
                with self.subTest(rule=identifier, year=year):
                    christmas_weekday = date(year, 12, 25).isoweekday()
                    expected = None if christmas_weekday in (1, 5) else date(year, 12, 26)
                    self.assertEqual(self.archive_date(identifier, year), expected)

    def test_glarus_karwoche_shift_and_regular_year(self):
        self.assertEqual(self.archive_date("GL-RTG-ALL-DAY-NAEFELSER-FAHRT", 2026), date(2026, 4, 9))
        self.assertEqual(self.archive_date("GL-RTG-ALL-DAY-NAEFELSER-FAHRT", 2027), date(2027, 4, 1))

    def test_glarus_first_thursday_or_week_after_maundy_thursday(self):
        for year in range(2026, 2101):
            actual = self.archive_date("GL-RTG-ALL-DAY-NAEFELSER-FAHRT", year)
            self.assertEqual(actual.isoweekday(), 4)
            self.assertEqual(actual.month, 4)
            expected_day = next(d for d in range(1, 8) if date(year, 4, d).isoweekday() == 4)
            if (easter_sunday(year) - date(year, 4, expected_day)).days == 3:
                expected_day += 7
            self.assertEqual(actual.day, expected_day)

    def test_ne_substitutes_only_after_sunday(self):
        for suffix, month in (("NEW-YEAR-SUBSTITUTE", 1), ("CHRISTMAS-SUBSTITUTE", 12)):
            target_day = 2 if month == 1 else 26
            for year in range(2026, 2101):
                with self.subTest(suffix=suffix, year=year):
                    expected = date(year, month, target_day) if date(year, month, target_day - 1).isoweekday() == 7 else None
                    self.assertEqual(self.archive_date("NE-LDJF-BASE-DAY-" + suffix, year), expected)

    def test_validity_applies_after_conditional_shift(self):
        calc = {"type": "nthWeekdayOfMonth", "month": 4, "isoWeekday": 4, "occurrence": 1}
        condition = "shiftHolyThursdayBy7Days"
        self.assertIsNone(holiday_date(calc, condition, 2026, {"from": "2026-01-01", "to": "2026-04-08"}))
        self.assertEqual(holiday_date(calc, condition, 2026, {"from": "2026-04-09", "to": "2026-04-09"}), date(2026, 4, 9))

    def test_nth_weekday_offset_supports_previous_and_next_year(self):
        validity = {"from": "1900-01-01", "to": None}
        for offset, expected in ((-366, date(2026, 1, 3)), (366, date(2028, 1, 5))):
            calc = {"type": "nthWeekdayOffsetDays", "month": 1, "isoWeekday": 1, "occurrence": 1, "offsetDays": offset}
            self.assertEqual(holiday_date(calc, "always", 2027, validity), expected)
        calc = {"type": "nthWeekdayOffsetDays", "month": 12, "isoWeekday": 7, "occurrence": 4, "offsetDays": 7}
        rule = {"calculation": calc, "condition": "always", "validity": validity}
        self.assertIn("2027-01-03", holiday_dates_in_year(rule, 2027))

    def test_nth_weekday_offset_validity_uses_final_date(self):
        calc = {"type": "nthWeekdayOffsetDays", "month": 1, "isoWeekday": 1, "occurrence": 1, "offsetDays": -7}
        self.assertEqual(holiday_date(calc, "always", 2027, {"from": "2026-12-28", "to": "2026-12-28"}), date(2026, 12, 28))
        self.assertIsNone(holiday_date(calc, "always", 2027, {"from": "2027-01-01", "to": None}))

    def test_no_unknown_condition_or_invalid_offset(self):
        validity = {"from": "1900-01-01", "to": None}
        for condition in ("sometimes", "", "never"):
            with self.assertRaises(ContractError):
                holiday_date({"type": "fixedMonthDay", "month": 1, "day": 1}, condition, 2026, validity)
        for offset in (-367, 367, True, 0.5):
            with self.assertRaises(ContractError):
                holiday_date({"type": "nthWeekdayOffsetDays", "month": 1, "isoWeekday": 1,
                              "occurrence": 1, "offsetDays": offset}, "always", 2026, validity)


class AP22C1CandidateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = (BUNDLE / "holiday-catalogs/ch-holiday-catalog.json").read_bytes()
        cls.catalog = json.loads(cls.raw)
        cls.calendars = {p.stem: read_json(p) for p in (BUNDLE / "calendars").glob("*.json")}
        cls.changed_calendar = next(key for key in cls.calendars if key.startswith("ap22-ag-"))

    def catalog_rejected(self, mutation):
        value = copy.deepcopy(self.catalog)
        mutation(value)
        with self.assertRaises(ContractError):
            validate_catalog(value, canonical(value))

    def calendars_rejected(self, mutation):
        value = copy.deepcopy(self.calendars)
        mutation(value)
        with self.assertRaises(ContractError):
            validate_calendars(self.catalog, self.raw, value)

    def test_complete_independently_validated_candidate(self):
        result = validate_bundle()
        self.assertEqual(result["projections"], 32)
        self.assertFalse(result["runtimeActivation"])

    def test_archived_rule_and_status_mutation_rejected(self):
        self.catalog_rejected(lambda v: v["data"]["rules"][0].update(condition="onlyMonday"))
        self.catalog_rejected(lambda v: v["data"]["sources"][2].update(status="approved"))
        self.catalog_rejected(lambda v: v["data"]["rules"].pop())

    def test_original_matrix_and_source_metadata_preserved(self):
        self.catalog_rejected(lambda v: v["activation"]["matrixDecisions"][0].update(rowSha256="0" * 64))
        self.catalog_rejected(lambda v: v["activation"]["sourceEvidence"][0].update(note="Changed"))
        self.catalog_rejected(lambda v: v["activation"]["sourceIdMap"].pop())

    def test_frozen_approved_104_bindings_and_32_recipes(self):
        self.catalog_rejected(lambda v: v["activation"]["procedureBindings"].pop())
        self.catalog_rejected(lambda v: v["activation"]["projections"].pop())
        self.catalog_rejected(lambda v: v["activation"]["procedureBindings"][0].update(profileId="vrpg-be"))

    def test_so_is_separate_full_day_process_list(self):
        self.catalog_rejected(lambda v: v["activation"]["supplementalRules"][0].update(dayPortion="afternoonFromNoon"))
        self.catalog_rejected(lambda v: v["activation"]["supplementalRules"][0]["legalValidity"].update(**{"from": "2026-01-01"}))
        self.catalog_rejected(lambda v: v["activation"]["supplementalRules"][0]["sourceRefs"][0].update(locator="Other norm"))

    def test_approved_contract_is_not_approved_release(self):
        self.catalog_rejected(lambda v: v["activation"]["contractDecision"].update(status="proposed", on=None))
        self.catalog_rejected(lambda v: v["activation"]["releaseEligibility"].update(status="approved", releaseId="fake"))

    def test_full_raw_catalog_hash_not_semantic_subset(self):
        self.calendars_rejected(lambda v: v[self.changed_calendar]["projection"].update(sourceHash=sha(canonical(self.catalog["data"]))))
        with self.assertRaises(ContractError):
            validate_calendars(self.catalog, self.raw + b"\n", self.calendars)

    def test_missing_extra_and_renamed_calendar_rejected(self):
        self.calendars_rejected(lambda v: v.pop(self.changed_calendar))
        self.calendars_rejected(lambda v: v.update(extra=v[self.changed_calendar]))
        self.calendars_rejected(lambda v: v[self.changed_calendar].update(calendarId="renamed"))

    def test_inheritance_cycle_and_unbound_parent_rejected(self):
        for parents in ([self.changed_calendar], [], ["be-public-holidays"], ["ch-federal-calendar", "be-public-holidays"]):
            with self.subTest(parents=parents):
                self.calendars_rejected(lambda v: v[self.changed_calendar].update(inherits=parents))

    def test_inherited_federal_rule_must_not_be_emitted_twice(self):
        federal = next(r for r in self.calendars["ch-federal-calendar"]["rules"] if r["effect"]["type"] == "holiday")
        self.calendars_rejected(lambda v: v[self.changed_calendar]["rules"].append(copy.deepcopy(federal)))

    def test_source_reference_locator_and_metadata_tampering(self):
        self.calendars_rejected(lambda v: v[self.changed_calendar]["rules"][0]["sourceRefs"][0].update(locator="Wrong locator"))
        self.calendars_rejected(lambda v: v[self.changed_calendar]["sources"][0].update(url="https://example.org/wrong"))
        self.calendars_rejected(lambda v: v[self.changed_calendar]["sources"][0].update(reviewStatus="verified"))
        self.calendars_rejected(lambda v: v[self.changed_calendar]["sources"].pop())

    def test_norm_validity_condition_calculation_and_effect_tampering(self):
        self.calendars_rejected(lambda v: v[self.changed_calendar]["rules"][0]["validity"].update(to="2026-12-31"))
        self.calendars_rejected(lambda v: v[self.changed_calendar]["rules"][0].update(condition="unknown"))
        self.calendars_rejected(lambda v: v[self.changed_calendar]["rules"][0].update(calculation={"type": "fixedMonthDay", "month": 1, "day": 17}))
        self.calendars_rejected(lambda v: v[self.changed_calendar]["rules"][0]["effect"].update(kind="federalHoliday"))

    def test_three_federal_suspension_rules_remain_identical(self):
        before = [r for r in read_json(BASE / "calendars/ch-federal-calendar.json")["rules"] if r["effect"]["type"] == "suspensionPeriod"]
        after = [r for r in self.calendars["ch-federal-calendar"]["rules"] if r["effect"]["type"] == "suspensionPeriod"]
        self.assertEqual(len(after), 3)
        self.assertEqual(before, after)
        self.calendars_rejected(lambda v: next(r for r in v["ch-federal-calendar"]["rules"]
                                               if r["effect"]["type"] == "suspensionPeriod")["effect"].update(applicableProfileIds=["stpo"]))

    def test_new_calendar_and_historic_schema_major_versions_separated(self):
        for identifier in self.calendars:
            self.assertEqual(self.calendars[identifier]["formatVersion"], "3.0.0")
        historical = read_json(BASE / "calendars/be-public-holidays.json")
        check_schema("calendar-rules-v2.schema.json", historical)
        with self.assertRaises(ContractError):
            check_schema("calendar-rules-v2.schema.json", self.calendars["be-public-holidays"])

    def test_january_variants_only_vary_bound_rule_not_zpo(self):
        projections = {p["id"]: p for p in self.catalog["activation"]["projections"]}
        for binding in self.catalog["activation"]["procedureBindings"]:
            if binding["ambiguity"]:
                self.assertNotEqual(binding["profileId"], "zpo")
                for variant in binding["variants"]:
                    normal = set(projections[variant["projectionId"]]["ruleIds"])
                    alternative = set(projections[variant["alternativeProjectionId"]]["ruleIds"])
                    self.assertEqual(alternative ^ normal, set(binding["ambiguity"]["catalogRuleIds"]))
                    self.assertEqual(len(alternative ^ normal), 1)

    def test_ts_generated_dates_match_independent_python_2027_through_2035(self):
        probes = read_json(BUNDLE / "date-probes.json")
        count = validate_date_probes(self.calendars, probes)
        self.assertGreater(count, 3000)

    def test_cross_language_comparison_rejects_missing_extra_or_changed_date(self):
        original = read_json(BUNDLE / "date-probes.json")
        for mutation in (lambda v: v["occurrences"].pop(),
                         lambda v: v["occurrences"].append(copy.deepcopy(v["occurrences"][0])),
                         lambda v: v["occurrences"][0].update(date="2027-02-17")):
            with self.subTest(mutation=mutation):
                probes = copy.deepcopy(original)
                mutation(probes)
                with self.assertRaises(ContractError):
                    validate_date_probes(self.calendars, probes)

    def test_bundle_inventory_binds_every_data_and_oracle_file(self):
        inventory = read_json(BUNDLE / "inventory.json")
        self.assertEqual(validate_inventory(BUNDLE, inventory), 42)
        for mutation in (lambda v: v["artifacts"].pop(),
                         lambda v: v["artifacts"][0].update(sha256="0" * 64),
                         lambda v: v.update(runtimeEnabled=True)):
            bad = copy.deepcopy(inventory)
            mutation(bad)
            with self.assertRaises(ContractError):
                validate_inventory(BUNDLE, bad)

    def test_social_rules_preserved_but_every_release_binding_is_new_candidate(self):
        value = read_json(BUNDLE / "social-procedures/ch-social-procedures.json")
        components = {name: (BUNDLE / name).read_bytes() for name in (
            "calendars/ch-federal-calendar.json", "calendars/be-public-holidays.json",
            "holiday-catalogs/ch-holiday-catalog.json")}
        validate_social_copy(value, components)
        for mutation in (lambda v: v["federalRules"].pop(),
                         lambda v: v["cantonalBindings"].pop(),
                         lambda v: v["releaseEligibility"][0].update(status="approved"),
                         lambda v: v["releaseEligibility"][0]["componentRefs"][0].update(sha256="0" * 64),
                         lambda v: v["releaseEligibility"][0]["caseCoverage"].update(to="2028-12-31")):
            bad = copy.deepcopy(value)
            mutation(bad)
            with self.assertRaises(ContractError):
                validate_social_copy(bad, components)


class AP22C1ManifestSyntaxFixtureTests(unittest.TestCase):
    """In-memory format/inventory fixtures only, not a releasable manifest.

    The old social release bindings are intentionally not promoted by this
    syntax test. C1 does not supply a new source-review or deployment approval.
    """
    @classmethod
    def setUpClass(cls):
        cls.manifest = read_json(BASE / "manifest.json")
        cls.manifest.update(**{"$schema": PREFIX + "release-manifest-v7.schema.json",
                               "formatVersion": "7.0.0", "releaseStatus": "candidate"})
        cls.manifest["compatibility"]["minimumConsumerFormatVersion"] = "7.0.0"
        cls.files = {}
        cls.manifest["artifacts"] = [a for a in cls.manifest["artifacts"] if a["role"] != "calendar"]
        for artifact in cls.manifest["artifacts"]:
            path = (BUNDLE if artifact["role"] == "holidayCatalog" else BASE) / artifact["path"]
            raw = path.read_bytes()
            artifact.update(byteLength=len(raw), sha256=sha(raw), schemaId=PREFIX + ROLE_SCHEMAS[artifact["role"]])
            cls.files[artifact["path"]] = raw
        cls.manifest["calendarIds"] = []
        for path in sorted((BUNDLE / "calendars").glob("*.json")):
            raw = path.read_bytes()
            relative = "calendars/" + path.name
            cls.files[relative] = raw
            cls.manifest["calendarIds"].append(path.stem)
            cls.manifest["artifacts"].append({"path": relative, "role": "calendar", "contentId": path.stem,
                "schemaId": PREFIX + ROLE_SCHEMAS["calendar"], "mediaType": "application/json",
                "byteLength": len(raw), "sha256": sha(raw)})

    def rejected(self, mutate_manifest=None, mutate_files=None):
        value, files = copy.deepcopy(self.manifest), dict(self.files)
        if mutate_manifest:
            mutate_manifest(value)
        if mutate_files:
            mutate_files(files)
        with self.assertRaises(ContractError):
            validate_manifest(value, files)

    def test_format7_dynamic_inventory_fixture_has_40_bound_files(self):
        self.assertEqual(len(self.files), 40)
        validate_manifest(self.manifest, self.files)

    def test_missing_additional_or_changed_bytes_rejected(self):
        key = next(iter(self.files))
        self.rejected(mutate_files=lambda v: v.pop(key))
        self.rejected(mutate_files=lambda v: v.update(extra=b"{}"))
        self.rejected(mutate_files=lambda v: v.update({key: v[key] + b"\n"}))

    def test_duplicate_paths_and_content_ids_rejected(self):
        self.rejected(lambda v: v["artifacts"].append(copy.deepcopy(v["artifacts"][-1])))
        self.rejected(lambda v: v["artifacts"][-1].update(contentId=v["artifacts"][-2]["contentId"]))

    def test_byte_length_and_digest_both_checked(self):
        self.rejected(lambda v: v["artifacts"][0].update(byteLength=v["artifacts"][0]["byteLength"] + 1))
        self.rejected(lambda v: v["artifacts"][0].update(sha256="0" * 64))

    def test_mixed_calendar_format_and_low_consumer_rejected(self):
        self.rejected(lambda v: v["artifacts"][-1].update(schemaId=PREFIX + "calendar-rules-v2.schema.json"))
        self.rejected(lambda v: v["compatibility"].update(minimumConsumerFormatVersion="6.0.0"))

    def test_calendar_inventory_bijection(self):
        self.rejected(lambda v: v["calendarIds"].pop())
        self.rejected(lambda v: v["calendarIds"].append("unbound"))

    def test_wrong_or_additional_profiles_rejected(self):
        self.rejected(lambda v: v["profileIds"].append("vrpg-zh"))
        self.rejected(lambda v: v["profileIds"].remove("vrpg-be"))


if __name__ == "__main__":
    unittest.main()
