# SPDX-License-Identifier: AGPL-3.0-only
"""Bounded artifact-audit regressions. All mutations affect temporary fixtures only."""

import copy
import importlib.util
import io
import json
import shutil
import tempfile
import unittest
import warnings
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("mvp04_artifacts", ROOT / "scripts/prepare_mvp04_artifacts.py")
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)


class Mvp04ArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.artifacts, cls.report = audit.prepare(ROOT)
        cls.package = (ROOT / audit.SPPKG).read_bytes()
        cls.package_files = audit.zip_files(cls.package)
        cls.config = json.loads((ROOT / "spfx/config/package-solution.json").read_bytes())
        cls.manifest = json.loads((ROOT / "data/releases" / audit.RELEASE_ID / "manifest.json").read_bytes())

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mvp04-artifact-test-")
        self.fixture = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)

    def web_fixture(self):
        target = self.fixture / "web"
        shutil.copytree(ROOT / ".work/public-app", target)
        return target

    def data_fixture(self):
        target = self.fixture / "data/releases" / audit.RELEASE_ID
        shutil.copytree(ROOT / "data/releases" / audit.RELEASE_ID, target)
        return target

    def patch_xml(self, member, mutate):
        files = dict(self.package_files)
        document = ET.fromstring(files[member])
        mutate(document)
        files[member] = ET.tostring(document, encoding="utf-8")
        return audit.deterministic_zip(files)

    def test_actual_artifacts_are_deterministic_and_disk_identical(self):
        again, report = audit.prepare(ROOT)
        self.assertEqual(again, self.artifacts)
        self.assertEqual(report, self.report)
        for name, data in self.artifacts.items():
            self.assertEqual((ROOT / audit.ARTIFACT_DIRECTORY / name).read_bytes(), data)
        self.assertEqual(json.loads((ROOT / audit.REPORT).read_bytes()), self.report)

    def test_local_report_does_not_claim_publication_or_deployment(self):
        for key in ["publicationVerified", "deploymentApproved", "productionActivation"]:
            self.assertIs(self.report[key], False)
        self.assertEqual(self.report["pinCommit"], audit.PIN_COMMIT)
        self.assertEqual(self.report["manifestSha256"], audit.MANIFEST_SHA256)
        self.assertEqual(self.report["rollback"]["sha256"], audit.ROLLBACK_SHA256)

    def test_sppkg_is_byte_identical_with_real_current_ids_and_pin(self):
        self.assertEqual(self.artifacts["fristenrechner-schweiz-0.4.0.0.sppkg"], self.package)
        package = self.report["sppkg"]
        self.assertEqual(package["solutionVersion"], "0.4.0.0")
        self.assertEqual(package["webpartVersion"], "0.4.0")
        self.assertEqual(package["solutionId"], audit.SOLUTION_ID)
        self.assertEqual(package["featureId"], audit.FEATURE_ID)
        self.assertEqual(package["webpartId"], audit.WEBPART_ID)
        self.assertEqual(package["defaultGithubBaseUrl"], audit.BASE_URL)
        self.assertEqual(package["additionalApiPermissions"], [])

    def test_mirror_has_exact_manifest_and_nine_commit_identical_artifacts(self):
        files = audit.zip_files(self.artifacts["fristenrechner-mvp04-sharepoint-mirror.zip"])
        self.assertEqual(len(files), 10)
        self.assertEqual(set(files), {"manifest.json", *[artifact["path"] for artifact in self.manifest["artifacts"]]})
        for name, content in files.items():
            self.assertEqual(content, audit.git_blob(ROOT, f"data/releases/{audit.RELEASE_ID}/{name}"))

    def test_web_preserves_hidden_security_file_licences_and_exact_build(self):
        files = audit.zip_files(self.artifacts["fristenrechner-mvp04-steimer-web.zip"])
        self.assertEqual(len(files), 12)
        self.assertIn(".htaccess", files)
        self.assertEqual(len([name for name in files if name.startswith("licenses/")]), 3)
        self.assertFalse(any(name.endswith(".map") or "node_modules" in name for name in files))
        for name, data in files.items():
            self.assertEqual(data, (ROOT / ".work/public-app" / name).read_bytes())

    def test_generated_zip_metadata_is_fixed_and_sorted(self):
        for name in ["fristenrechner-mvp04-sharepoint-mirror.zip", "fristenrechner-mvp04-steimer-web.zip"]:
            with zipfile.ZipFile(io.BytesIO(self.artifacts[name])) as archive:
                self.assertEqual(archive.namelist(), sorted(archive.namelist()))
                for entry in archive.infolist():
                    self.assertEqual(entry.date_time, audit.ZIP_TIMESTAMP)
                    self.assertEqual((entry.external_attr >> 16) & 0o777, 0o644)

    def test_changed_approved_manifest_is_rejected(self):
        directory = self.data_fixture()
        (directory / "manifest.json").write_bytes(b"{}\n")
        with self.assertRaisesRegex(audit.ArtifactError, "manifest hash differs"):
            audit.inspect_data(self.fixture, ROOT)

    def test_changed_data_artifact_is_rejected(self):
        directory = self.data_fixture()
        (directory / "profiles/stpo.json").write_bytes(b"{}\n")
        with self.assertRaisesRegex(audit.ArtifactError, "Manifest artifact differs"):
            audit.inspect_data(self.fixture, ROOT)

    def test_git_byte_mismatch_is_rejected(self):
        with patch.object(audit, "git_blob", return_value=b"different committed bytes"):
            with self.assertRaisesRegex(audit.ArtifactError, "differ from pinned Git commit"):
                audit.inspect_data(ROOT)

    def test_old_sppkg_cannot_be_renamed_as_mvp04(self):
        with self.assertRaisesRegex(audit.ArtifactError, "not version 0.4.0.0"):
            audit.inspect_sppkg((ROOT / audit.ROLLBACK).read_bytes(), self.config)

    def test_changed_solution_and_feature_identity_are_rejected(self):
        package = self.patch_xml("AppManifest.xml", lambda app: app.set("ProductID", "wrong"))
        with self.assertRaisesRegex(audit.ArtifactError, "Unexpected solution ID"):
            audit.inspect_sppkg(package, self.config)
        package = self.patch_xml(f"feature_{audit.FEATURE_ID}.xml", lambda feature: feature.set("Version", "0.3.0.0"))
        with self.assertRaisesRegex(audit.ArtifactError, "feature identity/version differs"):
            audit.inspect_sppkg(package, self.config)

    def test_component_manifest_pin_is_checked_independently_from_bundle(self):
        member = f"{audit.FEATURE_ID}/WebPart_{audit.WEBPART_ID}.xml"
        def mutate(document):
            component = next(e for e in document.iter() if audit.local_name(e.tag) == "ClientSideComponent")
            manifest = json.loads(component.attrib["ComponentManifest"])
            manifest["preconfiguredEntries"][0]["properties"]["githubBaseUrl"] = "https://example.invalid/wrong"
            component.set("ComponentManifest", json.dumps(manifest))
        package = self.patch_xml(member, mutate)
        with self.assertRaisesRegex(audit.ArtifactError, "wrong default data pin"):
            audit.inspect_sppkg(package, self.config)

    def test_script_pin_is_checked_independently_from_component_manifest(self):
        files = dict(self.package_files)
        name = next(name for name in files if name.startswith("ClientSideAssets/fristenrechner-web-part_") and name.endswith(".js"))
        files[name] = files[name].replace(audit.PIN_COMMIT.encode(), b"0" * 40)
        with self.assertRaisesRegex(audit.ArtifactError, "required marker"):
            audit.inspect_sppkg(audit.deterministic_zip(files), self.config)

    def test_new_api_permission_request_is_rejected(self):
        config = copy.deepcopy(self.config)
        config["solution"]["webApiPermissionRequests"] = [{"resource": "Microsoft Graph", "scope": "Mail.Read"}]
        with self.assertRaisesRegex(audit.ArtifactError, "additional API permissions"):
            audit.inspect_sppkg(self.package, config)

    def test_packaged_permission_declaration_is_rejected(self):
        def add_permission(app):
            ET.SubElement(app, "AppPermissionRequests")
        package = self.patch_xml("AppManifest.xml", add_permission)
        with self.assertRaisesRegex(audit.ArtifactError, "permission declaration"):
            audit.inspect_sppkg(package, self.config)

    def test_external_package_relationship_is_rejected(self):
        def mutate(document):
            next(iter(document)).set("TargetMode", "External")
        package = self.patch_xml("_rels/.rels", mutate)
        with self.assertRaisesRegex(audit.ArtifactError, "External package relationship"):
            audit.inspect_sppkg(package, self.config)

    def test_unsafe_or_duplicate_zip_entries_are_rejected(self):
        for members in [[("../escape", b"x")], [("same", b"a"), ("same", b"b")]]:
            stream = io.BytesIO()
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                with zipfile.ZipFile(stream, "w") as archive:
                    for name, content in members:
                        archive.writestr(name, content)
            with self.assertRaises(audit.ArtifactError):
                audit.zip_files(stream.getvalue())

    def test_missing_htaccess_is_rejected(self):
        directory = self.web_fixture()
        (directory / ".htaccess").unlink()
        with self.assertRaisesRegex(audit.ArtifactError, "Unexpected/missing web files"):
            audit.inspect_web(directory, self.manifest)

    def test_extra_development_files_are_rejected(self):
        directory = self.web_fixture()
        (directory / "assets/dev.js.map").write_text("{}")
        with self.assertRaisesRegex(audit.ArtifactError, "Unexpected/missing web files"):
            audit.inspect_web(directory, self.manifest)

    def test_wrong_web_release_is_rejected(self):
        directory = self.web_fixture()
        file = directory / "build-manifest.json"
        manifest = json.loads(file.read_bytes())
        manifest["dataReleaseId"] = "2026-08-31-mvp-03-approved.1"
        file.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(audit.ArtifactError, "Web build data release differs"):
            audit.inspect_web(directory, self.manifest)

    def test_missing_embedded_data_hash_is_rejected(self):
        directory = self.web_fixture()
        build = json.loads((directory / "build-manifest.json").read_bytes())
        file = directory / build["assets"]["javascript"]
        file.write_bytes(file.read_bytes().replace(self.manifest["artifacts"][0]["sha256"].encode(), b"0" * 64))
        with self.assertRaisesRegex(audit.ArtifactError, "Web bundle lacks the manifest hash"):
            audit.inspect_web(directory, self.manifest)

    def test_web_symlink_is_rejected(self):
        directory = self.web_fixture()
        (directory / "linked-secret").symlink_to(directory / "index.html")
        with self.assertRaisesRegex(audit.ArtifactError, "Symlink in web output"):
            audit.inspect_web(directory, self.manifest)

    def test_rollback_change_is_rejected(self):
        real = audit.file_bytes
        def changed(file):
            return b"changed rollback" if str(file).endswith(audit.ROLLBACK) else real(file)
        with patch.object(audit, "file_bytes", side_effect=changed):
            with self.assertRaisesRegex(audit.ArtifactError, "Rollback package hash differs"):
                audit.prepare(ROOT)

    def test_writer_is_idempotent_and_refuses_modified_artifacts(self):
        audit.write(self.artifacts, self.report, self.fixture)
        audit.write(self.artifacts, self.report, self.fixture)
        file = self.fixture / audit.ARTIFACT_DIRECTORY / "fristenrechner-schweiz-0.4.0.0.sppkg"
        file.write_bytes(b"existing user content")
        with self.assertRaisesRegex(audit.ArtifactError, "Existing artifact differs"):
            audit.write(self.artifacts, self.report, self.fixture)
        self.assertEqual(file.read_bytes(), b"existing user content")

    def test_writer_preflights_late_report_conflict_before_copying(self):
        report = self.fixture / audit.REPORT
        report.parent.mkdir(parents=True)
        report.write_text("existing report\n")
        with self.assertRaisesRegex(audit.ArtifactError, "Existing artifact differs"):
            audit.write(self.artifacts, self.report, self.fixture)
        self.assertFalse((self.fixture / audit.ARTIFACT_DIRECTORY).exists())

    def test_writer_rejects_bytes_changed_after_audit(self):
        artifacts = dict(self.artifacts)
        artifacts["fristenrechner-schweiz-0.4.0.0.sppkg"] = b"changed"
        with self.assertRaisesRegex(audit.ArtifactError, "Artifact bytes changed after audit"):
            audit.write(artifacts, self.report, self.fixture)

    def test_writer_cannot_assert_publication(self):
        report = copy.deepcopy(self.report)
        report["publicationVerified"] = True
        with self.assertRaisesRegex(audit.ArtifactError, "cannot assert publication"):
            audit.write(self.artifacts, report, self.fixture)


if __name__ == "__main__":
    unittest.main()
