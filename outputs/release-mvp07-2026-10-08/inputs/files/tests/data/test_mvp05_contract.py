#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent MVP05 schema, identity, semantic-delta and tamper checks."""
import json
from pathlib import Path
import shutil
import tempfile
import unittest

from validate_mvp05_release import check_release, object_sha, sha, ROOT, RELEASE_ID, SOCIAL_PATH, WINDOW

RELEASE = ROOT / "data/releases" / RELEASE_ID


class MVP05ContractTest(unittest.TestCase):
    def test_actual_approved_release_and_all_evidence_validate(self):
        result = check_release(RELEASE)
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["approvedBindings"], 28)
        self.assertEqual(result["unchangedArtifacts"], 9)

    def test_rfc8785_reference_hashes_agree_independently(self):
        social = json.loads((RELEASE / SOCIAL_PATH).read_bytes())
        for entry in social["releaseEligibility"]:
            for group, field, identity in [("federalRules", "ruleRef", "ruleId"), ("cantonalBindings", "bindingRef", "bindingId")]:
                target = next(item for item in social[group] if item[identity] == entry[field][identity])
                self.assertEqual(object_sha(target), entry[field]["sha256"])

    def test_distinct_historical_source_dates_are_preserved(self):
        social = json.loads((RELEASE / SOCIAL_PATH).read_bytes())
        dates = {item["reviewedOn"] for item in social["sources"]}
        self.assertGreater(len(dates), 1)
        self.assertIn("2026-09-12", dates)
        self.assertIn("2026-09-28", dates)

    def test_every_operative_binding_remains_bern_and_bounded(self):
        social = json.loads((RELEASE / SOCIAL_PATH).read_bytes())
        for item in social["cantonalBindings"]:
            self.assertEqual(item["procedureContextCanton"], "BE")
            self.assertEqual(item["caseCoverage"], WINDOW)
        self.assertEqual({item["law"] for item in social["federalRules"]}, {"ivg", "ahvg", "uvg", "elg", "avig", "kvg"})

    def assert_tamper_rejected(self, mutate):
        with tempfile.TemporaryDirectory(prefix="fristenrechner-mvp05-python-test-") as directory:
            target = Path(directory) / "release"
            shutil.copytree(RELEASE, target)
            mutate(target)
            with self.assertRaises(Exception):
                check_release(target)

    def test_changed_artifact_bytes_are_rejected(self):
        self.assert_tamper_rejected(lambda target: (target / "profiles/stpo.json").write_text("{}\n"))

    def test_internally_rehashed_changed_scope_is_rejected(self):
        def mutate(target):
            manifest = json.loads((target / "manifest.json").read_bytes())
            social = json.loads((target / SOCIAL_PATH).read_bytes())
            social["cantonalBindings"][0]["procedureContextCanton"] = "ZH"
            entry = social["releaseEligibility"][0]
            entry["bindingRef"]["sha256"] = object_sha(social["cantonalBindings"][0])
            raw = json.dumps(social).encode()
            (target / SOCIAL_PATH).write_bytes(raw)
            descriptor = next(item for item in manifest["artifacts"] if item["path"] == SOCIAL_PATH)
            descriptor["sha256"], descriptor["byteLength"] = sha(raw), len(raw)
            (target / "manifest.json").write_text(json.dumps(manifest))
        self.assert_tamper_rejected(mutate)

    def test_missing_human_approval_is_rejected(self):
        def mutate(target):
            manifest = json.loads((target / "manifest.json").read_bytes())
            social = json.loads((target / SOCIAL_PATH).read_bytes())
            social["releaseEligibility"][0]["approval"] = None
            raw = json.dumps(social).encode()
            (target / SOCIAL_PATH).write_bytes(raw)
            descriptor = next(item for item in manifest["artifacts"] if item["path"] == SOCIAL_PATH)
            descriptor["sha256"], descriptor["byteLength"] = sha(raw), len(raw)
            (target / "manifest.json").write_text(json.dumps(manifest))
        self.assert_tamper_rejected(mutate)


if __name__ == "__main__":
    unittest.main()
