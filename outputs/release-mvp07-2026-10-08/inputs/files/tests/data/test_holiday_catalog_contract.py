"""Independent schema, projection and bounded date-language AP18C regression."""

from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path
from unittest.mock import patch

from holiday_catalog_contract import check_holiday_catalog, holiday_date
from validate_release import ReleaseValidationError, load_schema_registry, validate_against_schema, validate_release


ROOT = Path(__file__).resolve().parents[2]
RELEASE = ROOT / "data/releases/2026-09-22-ap18c-candidate.1"


class HolidayCatalogContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.manifest = json.loads((RELEASE / "manifest.json").read_text())
        cls.documents = {
            item["contentId"]: json.loads((RELEASE / item["path"]).read_text())
            for item in cls.manifest["artifacts"]
        }
        cls.catalog = cls.documents["ch-holiday-catalog"]
        cls.calendars = {key: value for key, value in cls.documents.items()
                         if value["dataKind"] == "calendar"}
        cls.schemas, cls.registry = load_schema_registry()

    def errors(self, mutate=lambda catalog, calendars: None):
        catalog = copy.deepcopy(self.catalog)
        calendars = copy.deepcopy(self.calendars)
        mutate(catalog, calendars)
        errors = []
        check_holiday_catalog(catalog, calendars, "test", errors)
        return errors

    def test_actual_candidate_is_structurally_valid_but_not_promoted(self):
        self.assertEqual(self.manifest["releaseStatus"], "candidate")
        summary = validate_release(RELEASE)
        self.assertEqual(summary["holidayCatalogRules"], 479)
        self.assertEqual(summary["holidayCatalogs"], 1)
        self.assertEqual(summary["profiles"], 5)
        self.assertFalse(self.errors())

    def test_duplicate_catalog_rule_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["rules"].append(
            copy.deepcopy(catalog["data"]["rules"][0]))))

    def test_unknown_nonoperative_source_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["rules"][-1].update(
            source="SRC-NOT-AVAILABLE")))

    def test_unknown_area_evidence_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["areaSourceLinks"][0].update(
            areaSourceId="SRC-NOT-AVAILABLE")))

    def test_changed_calendar_projection_is_rejected(self):
        self.assertTrue(self.errors(lambda _, calendars:
            calendars["be-public-holidays"]["rules"][0]["labels"].update(de="Manipuliert")))

    def test_consistently_changed_catalog_and_calendar_still_reject_baseline_change(self):
        def mutate(catalog, calendars):
            catalog["data"]["rules"][0]["de"] = "Manipuliert"
            calendars["ch-federal-calendar"]["rules"][0]["labels"]["de"] = "Manipuliert"
        self.assertTrue(any("Referenzbestand" in error for error in self.errors(mutate)))

    def test_extra_operational_rule_is_rejected(self):
        self.assertTrue(self.errors(lambda _, calendars:
            calendars["be-public-holidays"]["rules"].append(
                copy.deepcopy(calendars["be-public-holidays"]["rules"][0]))))

    def test_half_day_may_not_be_projected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["rules"][0].update(
            dayPortion="afternoonFromNoon")))

    def test_manifest_major_smuggling_is_rejected(self):
        for remove_ids in (False, True):
            manifest = copy.deepcopy(self.manifest)
            manifest["formatVersion"] = "3.0.0"
            manifest["compatibility"]["minimumConsumerFormatVersion"] = "3.0.0"
            if remove_ids:
                del manifest["holidayCatalogIds"]
            self.assertTrue(validate_against_schema(manifest,
                self.schemas["release-manifest.schema.json"], self.registry, "manifest"))

    def test_duplicate_catalog_role_is_rejected(self):
        manifest = copy.deepcopy(self.manifest)
        descriptor = next(item for item in manifest["artifacts"] if item["role"] == "holidayCatalog")
        manifest["artifacts"].append(copy.deepcopy(descriptor))
        self.assertTrue(validate_against_schema(manifest,
            self.schemas["release-manifest.schema.json"], self.registry, "manifest"))

    def test_conditional_dates_and_final_validity(self):
        rules = self.catalog["data"]["rules"]
        ar = next(rule for rule in rules if rule["id"].startswith("AR-")
                  and rule["condition"] == "unlessTuesdayOrSaturday")
        self.assertEqual(holiday_date(ar, 2026), ("notApplicable", None))
        self.assertEqual(holiday_date(ar, 2027), ("occurs", "2027-12-26"))
        gl = next(rule for rule in rules if rule["condition"] == "shiftHolyThursdayBy7Days")
        self.assertEqual(holiday_date(gl, 2026), ("occurs", "2026-04-09"))
        limited = {**gl, "to": "2026-04-08"}
        self.assertEqual(holiday_date(limited, 2026), ("outsideValidity", None))
        ne = next(rule for rule in rules if rule["condition"] == "onlyMonday"
                  and rule["calculation"]["month"] == 1)
        self.assertEqual(holiday_date(ne, 2028), ("notApplicable", None))
        self.assertEqual(holiday_date(ne, 2034), ("occurs", "2034-01-02"))

    def test_wrong_conditional_anchor_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["rules"][0].update(
            condition="onlyMonday")))

    def test_unknown_parent_area_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["assignments"][20].update(
            parentAreaId="MISSING")))

    def test_cyclic_area_hierarchy_is_rejected(self):
        def mutate(catalog, _):
            for row in catalog["data"]["assignments"]:
                if row["areaId"] == "GEO-CH":
                    row["parentAreaId"] = "GEO-CH"
        self.assertTrue(any("zyklische" in error for error in self.errors(mutate)))

    def test_invalid_area_level_is_rejected(self):
        def mutate(catalog, _):
            for row in catalog["data"]["assignments"]:
                if row["areaType"] == "Gemeinde":
                    row["parentAreaId"] = "GEO-CH"
        self.assertTrue(self.errors(mutate))

    def test_missing_or_inconsistent_area_link_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["areaSourceLinks"].pop()))
        self.assertTrue(self.errors(lambda catalog, _: catalog["areaSourceLinks"][0].update(note="Verändert")))

    def test_historical_unapproved_rule_cannot_gain_approval(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["rules"][20].update(
            status="approved", approvalBasis="2026-08-31-mvp-03-approved.1")))

    def test_projected_rule_must_remain_explicitly_approved(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["rules"][0].update(
            status="open", approvalBasis=None, exportClass="blockedEffect")))

    def test_foreign_canton_scope_is_rejected(self):
        self.assertTrue(self.errors(lambda catalog, _: catalog["data"]["scopes"][20].update(
            jurisdiction="CH-BE")))

    def test_changed_inheritance_is_rejected(self):
        self.assertTrue(self.errors(lambda _, calendars: calendars["be-public-holidays"].update(inherits=[])))

    def test_changed_court_holiday_is_rejected(self):
        self.assertTrue(self.errors(lambda _, calendars:
            calendars["ch-federal-calendar"]["rules"][1]["calculation"]["startsOn"].update(offsetDays=-8)))

    def test_extra_override_effect_is_rejected(self):
        def mutate(_, calendars):
            rule = copy.deepcopy(calendars["ch-federal-calendar"]["rules"][1])
            rule["ruleId"] = "CH-CAL-OVERRIDE-UNAPPROVED"
            rule["effect"]["type"] = "holidayOverride"
            calendars["ch-federal-calendar"]["rules"].append(rule)
        self.assertTrue(any("Overrideregel" in error for error in self.errors(mutate)))

    def test_exclusion_requires_full_validity_of_containing_inclusion(self):
        def mutate(catalog, _):
            row = next(row for row in catalog["data"]["assignments"] if row["effect"] == "exclude")
            row["from"] = "1900-01-01"
        self.assertTrue(any("Ausschluss" in error for error in self.errors(mutate)))

    def test_overlapping_area_assignment_is_rejected(self):
        def mutate(catalog, _):
            row = copy.deepcopy(catalog["data"]["assignments"][0])
            row["id"] = "AREA-DUPLICATE-PERIOD"
            catalog["data"]["assignments"].append(row)
        self.assertTrue(any("überlappende" in error for error in self.errors(mutate)))

    def test_operational_scope_gate_is_applied_by_release_validator(self):
        old_catalog = json.loads((ROOT / "data/releases/2026-08-31-mvp-03-approved.1/special-regimes/vrpg-be.json").read_text())
        manifest = copy.deepcopy(self.manifest)
        descriptor = next(item for item in manifest["artifacts"] if item["role"] == "specialRegimeCatalog")
        descriptor.update(contentId=old_catalog["catalogId"], schemaId=old_catalog["$schema"])
        manifest["specialRegimeCatalogIds"] = [old_catalog["catalogId"]]

        def read_fixture(path):
            if path.name == "manifest.json":
                return manifest
            if path.as_posix().endswith("special-regimes/vrpg-be.json"):
                return old_catalog
            return json.loads(path.read_text())

        # Inject only parsed values, keeping all actual source files unchanged.
        with patch("validate_release.load_json", side_effect=read_fixture):
            with self.assertRaisesRegex(ReleaseValidationError, "Format 4: AP17-Spezialkatalog"):
                validate_release(RELEASE)


if __name__ == "__main__":
    unittest.main()
