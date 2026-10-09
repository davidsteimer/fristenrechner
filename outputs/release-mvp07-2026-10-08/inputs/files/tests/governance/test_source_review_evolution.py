# SPDX-License-Identifier: AGPL-3.0-only
"""Register growth must not retroactively change the historical AP13 event.

All added review records below are synthetic in-memory fixtures. They are never
written to the register or treated as legal review evidence or human approvals.
"""

import copy
import functools
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("source_review_validator", ROOT / "tests/governance/validate_source_reviews.py")
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)
INITIAL_PATH = ROOT / "data/source-reviews/events/2026-08-31-initial-consolidation.1.json"
INITIAL_SHA256 = "3b6884e3d929bd47006a9aeff453288de6102d2c1c50c8d6f92a88115bdce3dd"
OLD_SCOPE = ["2026-08-31-mvp-02-approved.1", "2026-08-31-mvp-03-approved.1"]
NEW_RELEASE = "2026-09-22-mvp-04-approved.1"
FUTURE_IDS = {"SRC-AP17C-AHVG-20270101", "SRC-AP17C-IVG-20270101", "SRC-AP17C-IVV-20270701"}


def fixtures():
    initial = json.loads(INITIAL_PATH.read_bytes())
    initial_ids = {entry["sourceId"] for entry in initial["entries"]}
    register = validator.load_json(validator.REGISTER_PATH)
    register["scope"]["productiveReleaseIds"] = list(OLD_SCOPE)
    register["sources"] = [source for source in register["sources"] if source["sourceId"] in initial_ids]
    historical = copy.deepcopy(register)
    old_ids, _ = validator.release_usage(initial["comparedReleaseIds"][0])
    new_ids, usage = validator.release_usage(NEW_RELEASE)
    existing_ids = {source["sourceId"] for source in register["sources"]}
    template = next(source for source in register["sources"] if source["sourceId"] == "SRC-ATSG-20240101")
    for source_id in sorted(new_ids - existing_ids):
        source = copy.deepcopy(template)
        source.update({
            "sourceId": source_id,
            "usageStatus": "monitoring" if source_id in FUTURE_IDS else (
                "supporting" if source_id == "SRC-AP17C-IVOEB-OLD-20100701" else "productive"
            ),
            "title": f"Synthetic in-memory governance regression fixture: {source_id}",
            "documentVersionDate": None,
            "subjectAreas": ["amendmentMonitoring"] if source_id in FUTURE_IDS else ["specialRegimes"],
        })
        register["sources"].append(source)
    register["scope"]["productiveReleaseIds"].append(NEW_RELEASE)
    register["registerStatus"] = "candidate"
    event = copy.deepcopy(initial)
    event.update({
        "reviewEventId": "2026-09-22-synthetic-evolution-test.1",
        "recordStatus": "candidate",
        "recordedOn": "2026-09-22",
        "trigger": "preRelease",
        "reviewWindow": {"from": "2026-09-22", "to": "2026-09-22"},
        "comparedReleaseIds": [NEW_RELEASE],
        "responsibility": {"reviewedBy": "Synthetic test fixture, no human review",
                           "documentedWith": "unittest", "formalFourEyes": False,
                           "operatingModel": "personalUnion"},
        "entries": [],
    })
    template_entry = initial["entries"][0]
    for source_id in sorted(new_ids):
        entry = copy.deepcopy(template_entry)
        entry.update({
            "sourceId": source_id, "reviewedOn": "2026-09-22",
            "comparisonBasis": "Synthetic in-memory validation fixture, not source-review evidence.",
            "evidence": {"method": "consolidatedAcceptedReview", "relevantProvisions": ["Synthetic test scope"],
                         "finding": "Synthetic in-memory test data, no substantive or human review asserted."},
            "affected": {
                "resolutionMode": "explicit" if source_id in FUTURE_IDS else "allReferencesInRelease",
                "releaseIds": [NEW_RELEASE], "profileIds": ["vrpg-be"] if source_id in FUTURE_IDS else [],
                "calendarIds": [], "componentIds": [],
            },
            "followUp": {"required": False, "references": []},
        })
        event["entries"].append(entry)
    return historical, register, [initial, event], old_ids, new_ids, usage


class SourceReviewEvolutionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # These tests mutate register/event copies, never immutable releases.
        # Cache read-only release traversal to keep all 21 historic counterchecks bounded.
        caching = patch.object(validator, "release_usage", functools.lru_cache(maxsize=None)(validator.release_usage))
        caching.start()
        cls.addClassCleanup(caching.stop)

    def setUp(self):
        self.historical, self.register, self.events, self.old_ids, self.new_ids, self.usage = fixtures()

    def errors(self, register=None, events=None):
        register = self.register if register is None else register
        events = self.events if events is None else events
        try:
            index = validator.expected_index(register, events)
        except ValueError:
            # Preserve an otherwise valid shape so missing-review errors come from
            # the validator, not from a fixture-construction exception.
            index = validator.expected_index(self.register, self.events)
        return validator.validate_documents(register, events, index)

    def test_historical_event_is_still_byte_identical(self):
        self.assertEqual(hashlib.sha256(INITIAL_PATH.read_bytes()).hexdigest(), INITIAL_SHA256)
        self.assertEqual(len(self.events[0]["entries"]), 25)
        self.assertEqual(len(self.old_ids), 21)
        self.assertEqual(self.events[0]["comparedReleaseIds"], ["2026-08-31-ap12c-candidate.1"])

    def test_original_25_source_register_still_validates_in_its_original_scope(self):
        index = validator.expected_index(self.historical, [self.events[0]])
        self.assertEqual(validator.validate_documents(self.historical, [self.events[0]], index), [])

    def test_new_17_sources_can_be_reviewed_later_without_rewriting_initial_event(self):
        self.assertEqual(len(self.new_ids - self.old_ids), 17)
        self.assertEqual(len(self.register["sources"]), 42)
        self.assertEqual(len(self.new_ids), 38)
        self.assertEqual(self.errors(), [])
        self.assertEqual(self.events[0], json.loads(INITIAL_PATH.read_bytes()))
        self.assertEqual(self.events[1]["recordStatus"], "candidate")

    def test_all_38_release_sources_are_present_in_prerelease_event(self):
        checked = {entry["sourceId"] for entry in self.events[1]["entries"]}
        self.assertEqual(checked, self.new_ids)
        self.assertEqual(self.errors(), [])

    def test_three_future_sources_are_monitoring_with_explicit_affected_scope(self):
        future = [source for source in self.register["sources"] if source["sourceId"] in FUTURE_IDS]
        self.assertEqual(len(future), 3)
        self.assertTrue(all(source["usageStatus"] == "monitoring" for source in future))
        self.assertEqual(self.new_ids - set(self.usage), FUTURE_IDS)
        for entry in self.events[1]["entries"]:
            if entry["sourceId"] in FUTURE_IDS:
                self.assertEqual(entry["affected"]["resolutionMode"], "explicit")
                self.assertEqual(validator.resolve_affected(entry)["componentIds"], [])
        self.assertEqual(self.errors(), [])

    def test_missing_new_source_registration_is_rejected(self):
        source_id = sorted(self.new_ids - self.old_ids)[0]
        register = copy.deepcopy(self.register)
        register["sources"] = [source for source in register["sources"] if source["sourceId"] != source_id]
        errors = self.errors(register=register)
        self.assertTrue(any("nicht registrierte Quelle" in error and source_id in error for error in errors), errors)
        self.assertTrue(any("deklarierte Releasequelle fehlt" in error and source_id in error for error in errors), errors)

    def test_missing_new_source_review_is_rejected(self):
        source_id = sorted(self.new_ids - self.old_ids)[0]
        events = copy.deepcopy(self.events)
        events[1]["entries"] = [entry for entry in events[1]["entries"] if entry["sourceId"] != source_id]
        errors = self.errors(events=events)
        self.assertTrue(any("Pre-Release-Prüfung fehlt" in error and source_id in error for error in errors), errors)
        self.assertTrue(any("Quelle ohne Prüfereignis" in error and source_id in error for error in errors), errors)

    def test_missing_old_prerelease_review_is_not_replaced_by_initial_review(self):
        source_id = sorted(self.old_ids)[0]
        events = copy.deepcopy(self.events)
        events[1]["entries"] = [entry for entry in events[1]["entries"] if entry["sourceId"] != source_id]
        errors = self.errors(events=events)
        self.assertTrue(any("Pre-Release-Prüfung fehlt" in error and source_id in error for error in errors), errors)

    def test_each_of_21_historical_productive_reviews_remains_mandatory(self):
        for source_id in sorted(self.old_ids):
            with self.subTest(source=source_id):
                events = copy.deepcopy(self.events)
                events[0]["entries"] = [entry for entry in events[0]["entries"] if entry["sourceId"] != source_id]
                errors = self.errors(events=events)
                self.assertTrue(any("Initialprüfung: Quelle fehlt" in error and source_id in error for error in errors), errors)

    def test_initial_productive_source_cannot_be_demoted_to_monitoring(self):
        source_id = sorted(self.old_ids)[0]
        register = copy.deepcopy(self.register)
        next(source for source in register["sources"] if source["sourceId"] == source_id)["usageStatus"] = "monitoring"
        errors = self.errors(register=register)
        self.assertTrue(any("produktive Quelle fehlt" in error and source_id in error for error in errors), errors)

    def test_fictitious_productive_source_is_rejected_even_with_review_entry(self):
        source_id = "SRC-SYNTHETIC-NOT-IN-ANY-RELEASE"
        register = copy.deepcopy(self.register)
        source = copy.deepcopy(register["sources"][0])
        source.update({"sourceId": source_id, "usageStatus": "productive"})
        register["sources"].append(source)
        events = copy.deepcopy(self.events)
        entry = copy.deepcopy(events[1]["entries"][0])
        entry["sourceId"] = source_id
        entry["affected"]["resolutionMode"] = "explicit"
        events[1]["entries"].append(entry)
        errors = self.errors(register=register, events=events)
        self.assertTrue(any("in keinem deklarierten Release enthalten" in error and source_id in error for error in errors), errors)

    def test_future_comparison_cannot_resolve_as_applied_norm_reference(self):
        events = copy.deepcopy(self.events)
        next(entry for entry in events[1]["entries"] if entry["sourceId"] in FUTURE_IDS)["affected"]["resolutionMode"] = "allReferencesInRelease"
        errors = self.errors(events=events)
        self.assertTrue(any("keine Referenz im Datenrelease" in error for error in errors), errors)

    def test_future_comparison_cannot_be_misclassified_as_productive(self):
        for source_id in sorted(FUTURE_IDS):
            with self.subTest(source=source_id):
                register = copy.deepcopy(self.register)
                next(source for source in register["sources"] if source["sourceId"] == source_id)["usageStatus"] = "productive"
                errors = self.errors(register=register)
                self.assertTrue(any("als produktiv markierte Quelle hat keine Referenz" in error and source_id in error
                                    for error in errors), errors)

    def test_new_referenced_source_cannot_be_misclassified_as_monitoring(self):
        source_id = "JUD-AP17C-BGER-8C-767-2008-20090112"
        self.assertIn(source_id, self.usage)
        register = copy.deepcopy(self.register)
        next(source for source in register["sources"] if source["sourceId"] == source_id)["usageStatus"] = "monitoring"
        errors = self.errors(register=register)
        self.assertTrue(any("referenzierte Quelle darf nicht ausschliesslich als Monitoring" in error and source_id in error
                            for error in errors), errors)

    def test_referenced_old_law_may_remain_supporting_for_blocked_regime(self):
        source_id = "SRC-AP17C-IVOEB-OLD-20100701"
        self.assertIn(source_id, self.usage)
        self.assertEqual(next(source for source in self.register["sources"] if source["sourceId"] == source_id)["usageStatus"],
                         "supporting")
        self.assertEqual(self.errors(), [])

    def test_removed_new_scope_is_rejected_while_sources_are_marked_productive(self):
        register = copy.deepcopy(self.register)
        register["scope"]["productiveReleaseIds"] = list(OLD_SCOPE)
        errors = self.errors(register=register)
        self.assertTrue(any("in keinem deklarierten Release enthalten" in error for error in errors), errors)

    def test_later_review_does_not_automatically_become_approved(self):
        index = validator.expected_index(self.register, self.events)
        for source in index["sources"]:
            if source["sourceId"] in self.new_ids:
                self.assertEqual(source["latestReview"]["recordStatus"], "candidate")
        self.assertEqual(self.register["registerStatus"], "candidate")
        self.assertEqual(self.errors(), [])


if __name__ == "__main__":
    unittest.main()
