# SPDX-License-Identifier: AGPL-3.0-only
"""Regression tests for the isolated corrected MVP 0.6 web artifact."""
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from prepare_mvp04_artifacts import ArtifactError, file_bytes, sha256, zip_files
from prepare_mvp06_artifacts import deterministic_zip, inspect_web_files
from prepare_mvp06_web_correction import (
    OUTPUT, ORIGINAL, CORRECTION, SPPKG, SPPKG_SHA256, ORIGINAL_WEB_SHA256, ZIP_NAME,
    audit_correction, check,
)
import prepare_mvp06_web_correction as subject


class CorrectedWebArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.packed = file_bytes(ROOT / OUTPUT / "artifacts" / ZIP_NAME)
        cls.files = zip_files(cls.packed)
        cls.build = json.loads(cls.files["build-manifest.json"])
        cls.script_name = cls.build["assets"]["javascript"].removeprefix("./")
        cls.css_name = cls.build["assets"]["stylesheet"].removeprefix("./")

    def test_archived_artifact_verifies_without_build_stage(self):
        report = check(public_readback=True)
        self.assertTrue(report["passed"])
        self.assertTrue(report["archiveIndependentOfScratch"])
        self.assertEqual(report["webFiles"], 12)
        self.assertEqual(report["archivedInputs"], 84)
        self.assertEqual(report["archive"]["sha256"], "37e949e0442365a86b5b4e90e25a5a4ef9d8209a31644f3de119f2862b9d3810")
        self.assertFalse(report["gitPinCheckedNow"])
        self.assertFalse(report["fullHistoricalPreservationCheckedNow"])
        self.assertTrue(report["fixedPublicReleaseAnchorsCheckedNow"])

    def public_fixture(self, directory):
        root = Path(directory)
        shutil.copytree(ROOT / OUTPUT, root / OUTPUT)
        receipt = json.loads(file_bytes(ROOT / OUTPUT / "artifact-verification.json"))
        manifest = json.loads(file_bytes(ROOT / "data/releases" / subject.RELEASE_ID / "manifest.json"))
        paths = {SPPKG, f"{CORRECTION}/artifact-verification.json", f"{ORIGINAL}/artifact-verification.json",
                 f"{ORIGINAL}/artifacts/fristenrechner-mvp06-steimer-web.zip",
                 f"data/releases/{subject.RELEASE_ID}/manifest.json",
                 *(f"data/releases/{subject.RELEASE_ID}/{item['path']}" for item in manifest["artifacts"]),
                 *(item["sourceSnapshot"] for item in receipt["inputBindings"])}
        for name in paths:
            destination = root / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, destination)
        return root

    def test_public_readback_needs_neither_git_nor_private_historical_tree(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self.public_fixture(directory)
            self.assertFalse((root / ".git").exists())
            self.assertFalse((root / ".work").exists())
            self.assertFalse((root / ORIGINAL / "historical-baseline/.work").exists())
            with patch.object(subject, "ROOT", root), patch.object(subject, "inspect_data", side_effect=AssertionError("Git inspector must not run")):
                self.assertTrue(subject.check(root / OUTPUT, public_readback=True)["passed"])

    def test_public_readback_rejects_mutated_data_without_falling_back_to_git(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self.public_fixture(directory)
            file = root / "data/releases" / subject.RELEASE_ID / "profiles/stpo.json"
            file.write_bytes(file.read_bytes() + b"\n")
            with patch.object(subject, "ROOT", root), patch.object(subject, "inspect_data", side_effect=AssertionError("No Git fallback")):
                with self.assertRaisesRegex(ArtifactError, "Mirror artifact differs"):
                    subject.check(root / OUTPUT, public_readback=True)

    def test_archive_is_deterministic_and_matches_existing_accepted_spfx(self):
        self.assertEqual(deterministic_zip(self.files), self.packed)
        self.assertEqual(sha256(file_bytes(ROOT / SPPKG)), SPPKG_SHA256)
        old = file_bytes(ROOT / ORIGINAL / "artifacts/fristenrechner-mvp06-steimer-web.zip")
        self.assertEqual(sha256(old), ORIGINAL_WEB_SHA256)
        self.assertNotEqual(old, self.packed)

    def test_public_wrapper_security_and_vendors_are_byte_identical(self):
        old = zip_files(file_bytes(ROOT / ORIGINAL / "artifacts/fristenrechner-mvp06-steimer-web.zip"))
        manifest = json.loads(old["build-manifest.json"])
        stable = {".htaccess", "favicon.svg", "licenses/react-MIT.txt", "licenses/react-dom-MIT.txt", "licenses/fluent-ui-MIT.txt",
                  *(name.removeprefix("./") for name in manifest["assets"]["vendors"].values())}
        self.assertEqual(self.build["assets"]["vendors"], manifest["assets"]["vendors"])
        for name in stable:
            self.assertEqual(self.files[name], old[name], name)
        normalised = dict(self.build)
        normalised["assets"] = dict(self.build["assets"])
        for field in ["javascript", "stylesheet"]:
            normalised["assets"][field] = manifest["assets"][field]
        self.assertEqual(normalised, manifest)
        old_html = old["index.html"]
        for field in ["javascript", "stylesheet"]:
            old_html = old_html.replace(manifest["assets"][field].encode(), self.build["assets"][field].encode())
        self.assertEqual(old_html, self.files["index.html"])

    def test_wrapping_correction_is_in_actual_shipping_assets(self):
        self.assertTrue(audit_correction(self.files)["titleWrapping"])

    def test_missing_title_wrapping_is_rejected(self):
        changed = dict(self.files)
        changed[self.css_name] = changed[self.css_name].replace(b"overflow-wrap:anywhere", b"overflow-wrap:normal")
        with self.assertRaises(ArtifactError):
            audit_correction(changed)

    def test_missing_social_hook_is_rejected(self):
        changed = dict(self.files)
        changed[self.script_name] = changed[self.script_name].replace(b'className:"fr-holiday-connections"', b'className:"different-class"')
        with self.assertRaises(ArtifactError):
            audit_correction(changed)

    def test_missing_dynamic_option_height_is_rejected(self):
        changed = dict(self.files)
        changed[self.script_name] = changed[self.script_name].replace(b'height:"auto",minHeight:36,paddingTop:7,paddingBottom:7', b'height:36,minHeight:36,paddingTop:7,paddingBottom:7')
        with self.assertRaises(ArtifactError):
            audit_correction(changed)

    def test_external_runtime_transport_is_rejected(self):
        changed = dict(self.files)
        changed[self.script_name] += b'\nfetch("https://example.invalid/");'
        with self.assertRaises(ArtifactError):
            audit_correction(changed)

    def test_development_files_are_rejected(self):
        changed = {**self.files, "assets/app.js.map": b"{}"}
        manifest = json.loads(file_bytes(ROOT / "data/releases/2026-10-01-mvp-06-approved.1/manifest.json"))
        with self.assertRaises(ArtifactError):
            inspect_web_files(changed, manifest, self.files[".htaccess"])


if __name__ == "__main__":
    unittest.main()
