#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Adversarial copies only. Never modifies the approved release or source proof."""
import copy
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

import validate_mvp06_release as validator
from validate_mvp06_release import sha, SOCIAL_PATH, RELEASE_ID, ROOT


def check_release(directory):
    """These standard regressions validate public integrity, not private originals."""
    return validator.check_release(directory, evidence_scope="public-integrity")


class Mvp06PromotionTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix="mvp06-promotion-negative-")
        self.target = Path(self.scratch.name) / "release"
        shutil.copytree(ROOT / "data/releases" / RELEASE_ID, self.target)

    def tearDown(self):
        self.scratch.cleanup()

    def modify(self, mutator):
        social_file = self.target / SOCIAL_PATH
        catalog = json.loads(social_file.read_bytes())
        mutator(catalog)
        raw = (json.dumps(catalog, ensure_ascii=False, indent=2) + "\n").encode()
        social_file.write_bytes(raw)
        manifest_file = self.target / "manifest.json"
        manifest = json.loads(manifest_file.read_bytes())
        descriptor = next(item for item in manifest["artifacts"] if item["path"] == SOCIAL_PATH)
        descriptor["sha256"], descriptor["byteLength"] = sha(raw), len(raw)
        manifest_file.write_text(json.dumps(manifest), encoding="utf-8")

    def test_actual_approved_release(self):
        result = check_release(self.target)
        self.assertEqual(result["reviewedFederalRules"], 44)
        self.assertEqual(result["approvedBindings"], 50)
        self.assertEqual(result["unchangedReviewedRules"], 24)
        self.assertEqual(result["unchangedReviewedBindings"], 28)
        self.assertEqual(result["verificationScope"], "public-integrity")
        self.assertFalse(result["privateRawEvidenceRechecked"])
        self.assertFalse(result["completeSourceAuditReproduced"])
        self.assertEqual(result["privateEvidenceFilesBoundButNotRechecked"], 107)

    def test_default_private_validator_never_falls_back_to_public_integrity(self):
        original = validator.read_regular
        def absent_private(base, relative):
            if ".work" in Path(relative).parts:
                raise FileNotFoundError("Private source original is absent")
            return original(base, relative)
        with patch.object(validator, "read_regular", side_effect=absent_private):
            with self.assertRaisesRegex(FileNotFoundError, "Private source original is absent"):
                validator.check_release(self.target)
            self.assertEqual(check_release(self.target)["publicEvidenceFilesVerified"], 63)

    def test_unknown_evidence_scope_is_rejected(self):
        with self.assertRaisesRegex(AssertionError, "Unknown evidence scope"):
            validator.check_release(self.target, evidence_scope="skip-missing")

    def test_missing_approval(self):
        self.modify(lambda c: c["releaseEligibility"][-1].update(approval=None))
        with self.assertRaises(Exception):
            check_release(self.target)

    def test_fabricated_approver(self):
        self.modify(lambda c: c["releaseEligibility"][-1]["approval"].update(approvedBy="SYNTHETIC TEST"))
        with self.assertRaises(Exception):
            check_release(self.target)

    def test_wrong_source_review_even_with_consistent_artifact_hash(self):
        self.modify(lambda c: c["releaseEligibility"][-1]["sourceReviewRef"].update(sha256="f" * 64))
        with self.assertRaises(AssertionError):
            check_release(self.target)

    def test_previous_release_approval_cannot_be_reused(self):
        self.modify(lambda c: c["releaseEligibility"][0].update(releaseId="2026-09-28-mvp-05-approved.1"))
        with self.assertRaises(AssertionError):
            check_release(self.target)

    def test_promoting_a_candidate_label_without_review_fails(self):
        self.modify(lambda c: c["federalRules"][-1].update(status="candidate"))
        with self.assertRaises(Exception):
            check_release(self.target)

    def test_existing_reviewed_rule_must_remain_identical(self):
        self.modify(lambda c: c["federalRules"][0]["labels"].update(de="Changed historical content"))
        with self.assertRaises(AssertionError):
            check_release(self.target)

    def test_new_rule_substantive_source_must_not_change(self):
        self.modify(lambda c: c["federalRules"][-1]["sourceRefs"][0].update(locator="Changed article"))
        with self.assertRaises(AssertionError):
            check_release(self.target)

    def test_scope_cannot_expand_to_another_canton(self):
        self.modify(lambda c: c["cantonalBindings"][-1].update(procedureContextCanton="ZH"))
        with self.assertRaises(AssertionError):
            check_release(self.target)

    def test_eligibility_cannot_be_omitted_or_duplicated(self):
        self.modify(lambda c: c["releaseEligibility"].pop())
        with self.assertRaises(AssertionError):
            check_release(self.target)

    def test_path_escape_fails(self):
        manifest_file = self.target / "manifest.json"
        manifest = json.loads(manifest_file.read_bytes())
        manifest["artifacts"][0]["path"] = "../elsewhere.json"
        manifest_file.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaises(Exception):
            check_release(self.target)

    def test_symlink_artifact_is_rejected(self):
        original = ROOT / "data/releases" / RELEASE_ID / SOCIAL_PATH
        local = self.target / SOCIAL_PATH
        local.unlink()
        local.symlink_to(original)
        with self.assertRaises(AssertionError):
            check_release(self.target)


if __name__ == "__main__":
    unittest.main()
