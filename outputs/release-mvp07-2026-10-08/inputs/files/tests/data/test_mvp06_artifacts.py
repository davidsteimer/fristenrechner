#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Offline checks of the actual definitive local MVP06 artifacts."""
import copy
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import prepare_mvp06_artifacts as subject


class PortableArtifactTests(unittest.TestCase):
    def test_deterministic_zip_readback(self):
        files = {"manifest.json": b"{}", "social-procedures/rules.json": b"[]"}
        first = subject.deterministic_zip(files)
        self.assertEqual(subject.zip_files(first), files)
        self.assertEqual(first, subject.deterministic_zip(dict(reversed(list(files.items())))))

    def test_unsafe_archive_paths_rejected(self):
        for name in ("../bad", "/absolute", "a/../bad", "a\\bad", "a//bad"):
            with self.subTest(name=name), self.assertRaises(subject.ArtifactError):
                subject.deterministic_zip({name: b"x"})

    def test_write_once_is_immutable(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "release.zip"
            subject.write_once(path, b"first")
            subject.write_once(path, b"first")
            with self.assertRaises(subject.ArtifactError):
                subject.write_once(path, b"second")
            self.assertEqual(path.read_bytes(), b"first")

    def test_working_tree_inventory_rejects_unrelated_or_duplicate_files(self):
        required = ["package.json", "package-lock.json", "src/public-app/main.tsx", "src/release/mvp06ReleaseData.ts"]
        records = [{"path": name, "sha256": "0" * 64, "byteLength": 0} for name in required]
        self.assertEqual(subject.product_input_paths({"productInputFiles": records}), set(required))
        for extra in ("Userinput/private.docx", "src/ui/preview/qaPresets.ts", "src/core/private.key", "../private", "package.json"):
            with self.subTest(extra=extra), self.assertRaises(subject.ArtifactError):
                subject.product_input_paths({"productInputFiles": records + [{"path": extra, "sha256": "0" * 64, "byteLength": 0}]})

    def test_missing_minimum_working_tree_inventory_is_rejected(self):
        for receipt in ({}, {"productInputFiles": []}, {"productInputFiles": [{"path": "src/core/index.ts", "sha256": "0" * 64, "byteLength": 0}]}):
            with self.subTest(receipt=receipt), self.assertRaises(subject.ArtifactError):
                subject.product_input_paths(receipt)


class GovernanceBindingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((ROOT / "data/releases" / subject.RELEASE_ID / "manifest.json").read_bytes())
        cls.source = (ROOT / subject.OUTPUT / "source-approval.json").read_bytes()
        cls.promotion = (ROOT / subject.OUTPUT / "data-promotion.json").read_bytes()
        cls.decision = (ROOT / cls.manifest["extensions"]["steimer.approval"]["decisionRef"]).read_bytes()

    def test_actual_governance_binds_to_the_approved_manifest(self):
        result = subject.inspect_governance(self.manifest, self.source, self.promotion, self.decision)
        self.assertEqual(result["sourceApprovalSha256"], self.manifest["extensions"]["steimer.approval"]["sourceReviewRef"]["sha256"])

    def test_replaced_or_reformatted_source_approval_is_rejected(self):
        for source in (b"{}", self.source + b"\n"):
            with self.subTest(source=source[:12]), self.assertRaisesRegex(subject.ArtifactError, "Source approval differs"):
                subject.inspect_governance(self.manifest, source, self.promotion, self.decision)

    def test_promotion_identity_hash_source_binding_and_scope_are_required(self):
        for field, value in (("releaseId", "other-release"), ("manifestSha256", "0" * 64),
                             ("sourceReviewRef", {"reviewId": "other", "sha256": "0" * 64}),
                             ("decisionSha256", "0" * 64), ("counts", {}), ("referenceSuites", {}),
                             ("preparationSnapshot", {})):
            promotion = json.loads(self.promotion)
            promotion[field] = value
            with self.subTest(field=field), self.assertRaises(subject.ArtifactError):
                subject.inspect_governance(self.manifest, self.source, json.dumps(promotion).encode(), self.decision)

    def test_promotion_cannot_claim_external_authority(self):
        for field in ("publicationApproved", "deploymentApproved", "productionActivation"):
            promotion = json.loads(self.promotion)
            promotion[field] = True
            with self.subTest(field=field), self.assertRaisesRegex(subject.ArtifactError, "unauthorised"):
                subject.inspect_governance(self.manifest, self.source, json.dumps(promotion).encode(), self.decision)

    def test_changed_decision_or_unverified_promotion_is_rejected(self):
        with self.assertRaisesRegex(subject.ArtifactError, "Human decision"):
            subject.inspect_governance(self.manifest, self.source, self.promotion, b"different decision")
        promotion = json.loads(self.promotion)
        promotion["validation"]["core"] = "failed"
        with self.assertRaisesRegex(subject.ArtifactError, "verification"):
            subject.inspect_governance(self.manifest, self.source, json.dumps(promotion).encode(), self.decision)

    def test_legal_content_or_source_date_mutation_cannot_be_called_approval_only(self):
        for field in ("legalContentUnchanged", "sourceReviewDatesUnchanged"):
            promotion = json.loads(self.promotion)
            promotion["approvalOnlyChanges"][field] = False
            with self.subTest(field=field), self.assertRaisesRegex(subject.ArtifactError, "legal-content"):
                subject.inspect_governance(self.manifest, self.source, json.dumps(promotion).encode(), self.decision)

    def test_unchanged_semantics_do_not_permit_replacing_the_promotion_bytes(self):
        with self.assertRaisesRegex(subject.ArtifactError, "immutable original"):
            subject.inspect_governance(self.manifest, self.source, self.promotion + b"\n", self.decision)


class RealReleaseArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # This is intentionally not skipped if the definitive build is missing.
        cls.report = json.loads((ROOT / subject.OUTPUT / "artifact-verification.json").read_text())
        cls.artifact_dir = ROOT / subject.OUTPUT / "artifacts"
        cls.package = (cls.artifact_dir / "fristenrechner-schweiz-0.6.0.0.sppkg").read_bytes()
        cls.config = json.loads((ROOT / subject.EVIDENCE / "inputs/spfx/config/package-solution.json").read_text())
        cls.pin = cls.report["pinCommit"]
        cls.base_url = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{cls.pin}/data/releases/{subject.RELEASE_ID}"

    def test_all_outputs_reproduce_exactly(self):
        result = subject.verify_archived(ROOT)
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["artifacts"], 3)
        self.assertFalse(result["scratchRequired"])
        for name in ("fristenrechner-mvp06-sharepoint-mirror.zip", "fristenrechner-mvp06-steimer-web.zip"):
            data = (self.artifact_dir / name).read_bytes()
            self.assertEqual(subject.deterministic_zip(subject.zip_files(data)), data)

    def archived_fixture(self, directory):
        paths = [f"{subject.OUTPUT}/artifact-verification.json", f"{subject.OUTPUT}/source-approval.json",
                 f"{subject.OUTPUT}/data-promotion.json", "docs/fachrecht/abnahme-quellen-mvp06.md",
                 *[item["path"] for item in self.report["archivedBuildEvidence"]],
                 *[f"{subject.OUTPUT}/artifacts/{item['path']}" for item in self.report["artifacts"]]]
        for relative in paths:
            destination = Path(directory) / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, destination)
        return Path(directory)

    def test_verification_survives_without_scratch_git_or_current_source(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            self.assertFalse((fixture / ".work").exists())
            self.assertFalse((fixture / ".git").exists())
            self.assertFalse((fixture / "spfx").exists())
            result = subject.verify_archived(fixture)
            self.assertEqual(result["mirrorFiles"], 11)
            self.assertEqual(result["webFiles"], 12)
            self.assertFalse(result["gitHistoryRequiredForThisArchiveCheck"])

    def test_changed_archived_log_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            log = fixture / self.report["archivedBuildLogs"][0]["archivePath"]
            log.write_bytes(log.read_bytes() + b"changed")
            with self.assertRaisesRegex(subject.ArtifactError, "Archived evidence changed"):
                subject.verify_archived(fixture)

    def test_changed_archived_artifact_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            package = fixture / subject.OUTPUT / "artifacts/fristenrechner-schweiz-0.6.0.0.sppkg"
            package.write_bytes(package.read_bytes() + b"changed")
            with self.assertRaisesRegex(subject.ArtifactError, "Archived artifact changed"):
                subject.verify_archived(fixture)

    def test_eleven_mirror_files_match_exact_approved_runtime_bytes_without_git(self):
        actual = subject.zip_files((self.artifact_dir / "fristenrechner-mvp06-sharepoint-mirror.zip").read_bytes())
        # The public file export carries exact approved bytes, not Git objects.
        # This checker pins the manifest SHA and all ten artifact descriptors.
        # The separate test:artifacts:git:mvp06 command retains the strict Git audit.
        subject.inspect_mirror_files(actual)
        expected = {name: subject.file_bytes(ROOT / "data/releases" / subject.RELEASE_ID / name)
                    for name in actual}
        self.assertEqual(subject.sha256(expected["manifest.json"]), subject.MANIFEST_SHA256)
        self.assertEqual(actual, expected)
        self.assertEqual(len(actual), 11)
        self.assertNotIn("README.md", actual)

    def test_twelve_web_files(self):
        actual = subject.zip_files((self.artifact_dir / "fristenrechner-mvp06-steimer-web.zip").read_bytes())
        self.assertEqual(len(actual), 12)
        self.assertEqual(json.loads(actual["build-manifest.json"])["dataReleaseId"], subject.RELEASE_ID)
        self.assertFalse(any("Userinput" in name or name.endswith(".map") for name in actual))

    def test_wrong_pin_rejected(self):
        with self.assertRaisesRegex(subject.ArtifactError, "default pin"):
            subject.inspect_sppkg(self.package, self.config, self.base_url.replace(self.pin, "0" * 40))

    def test_previous_mvp05_pin_cannot_be_claimed_as_mvp06(self):
        previous_url = "https://raw.githubusercontent.com/davidsteimer/fristenrechner/3109c39730f10d31cb6c57200b36dd5091d7bcd1/data/releases/2026-09-28-mvp-05-approved.1"
        with self.assertRaisesRegex(subject.ArtifactError, "default pin"):
            subject.inspect_sppkg(self.package, self.config, previous_url)

    def test_mirror_is_actual_approved_format6_catalog2_with_50_bindings(self):
        files = subject.zip_files((self.artifact_dir / "fristenrechner-mvp06-sharepoint-mirror.zip").read_bytes())
        manifest = subject.inspect_mirror_files(files)
        self.assertEqual(manifest["formatVersion"], "6.0.0")
        catalog = json.loads(files["social-procedures/ch-social-procedures.json"])
        self.assertEqual(catalog["formatVersion"], "2.0.0")
        self.assertEqual(len(catalog["federalRules"]), 44)
        self.assertEqual(len(catalog["cantonalBindings"]), 50)
        self.assertTrue(all(item["status"] == "approved" for item in catalog["releaseEligibility"]))
        with self.assertRaisesRegex(subject.ArtifactError, "eleven"):
            subject.inspect_mirror_files({**files, "README.md": b"unapproved extra"})

    def test_failed_or_missing_build_step_is_not_an_artifact_test(self):
        receipt = json.loads((ROOT / self.report["spfxBuildEvidence"]["path"]).read_bytes())
        for mutation in ("missing", "failed", "published"):
            altered = copy.deepcopy(receipt)
            if mutation == "missing":
                altered["steps"].pop()
            elif mutation == "failed":
                altered["steps"][-1]["exitCode"] = 1
            else:
                altered["publicationVerified"] = True
            with self.subTest(mutation=mutation), self.assertRaises(subject.ArtifactError):
                subject.validate_build_receipt(altered, self.pin)

    def test_later_approval_claim_or_changed_rollback_is_rejected(self):
        for mutation in ("publication", "full-product-commit", "wrong-rollback"):
            with self.subTest(mutation=mutation), tempfile.TemporaryDirectory() as directory:
                fixture = self.archived_fixture(directory)
                report_path = fixture / subject.OUTPUT / "artifact-verification.json"
                report = json.loads(report_path.read_bytes())
                if mutation == "publication":
                    report["permissions"]["publication"] = True
                elif mutation == "full-product-commit":
                    report["fullProductCommit"] = self.pin
                else:
                    report["priorPackage"]["version"] = "0.4.0.1"
                report_path.write_text(json.dumps(report))
                with self.assertRaises(subject.ArtifactError):
                    subject.verify_archived(fixture)

    def test_additional_permissions_rejected(self):
        config = copy.deepcopy(self.config)
        config["solution"]["webApiPermissionRequests"] = [{"resource": "Microsoft Graph", "scope": "User.Read"}]
        with self.assertRaisesRegex(subject.ArtifactError, "permission"):
            subject.inspect_sppkg(self.package, config, self.base_url)

    def test_wrong_version_rejected(self):
        files = subject.zip_files(self.package)
        files["AppManifest.xml"] = files["AppManifest.xml"].replace(b'Version="0.6.0.0"', b'Version="0.4.0.1"')
        with self.assertRaisesRegex(subject.ArtifactError, "identity/version"):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, self.base_url)

    def test_private_file_rejected(self):
        files = subject.zip_files(self.package)
        files["private.key"] = b"not a real key"
        with self.assertRaisesRegex(subject.ArtifactError, "Private/development"):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, self.base_url)

    def test_no_operational_authority_claimed(self):
        self.assertEqual(self.report["permissions"], {"localDataPromotion": True, "localDefinitiveBuild": True,
                         "eqInstallation": False, "publication": False, "hostingChanges": False, "productionActivation": False})
        self.assertFalse(self.report["remotePinPublicationVerified"])
        self.assertEqual(self.report["priorPackage"]["sha256"], subject.PRIOR_SHA256)
        self.assertEqual(self.report["priorPackage"]["version"], "0.5.0.0")
        self.assertTrue(self.report["priorPackage"]["unchanged"])
        self.assertEqual(self.report["historicalPackage"]["sha256"], subject.HISTORICAL_SHA256)
        self.assertEqual(self.report["historicalPackage"]["version"], "0.4.0.1")


if __name__ == "__main__":
    unittest.main()
