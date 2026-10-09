#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Portable integrity, scope and mutation tests of the definitive local MVP07 artifacts."""
import copy
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import prepare_mvp07_artifacts as subject


class PortableArtifactTests(unittest.TestCase):
    def test_deterministic_zip_exact_readback(self):
        files = {"manifest.json": b"{}", "calendars/a.json": b"[]", ".htaccess": b"Options -Indexes"}
        data = subject.deterministic_zip(files)
        self.assertEqual(subject.zip_files(data), files)
        self.assertEqual(data, subject.deterministic_zip(dict(reversed(list(files.items())))))

    def test_unsafe_archive_names_rejected(self):
        for name in ("../bad", "/absolute", "a/../bad", "a\\bad", "a//bad", "./bad"):
            with self.subTest(name=name), self.assertRaises(subject.ArtifactError):
                subject.deterministic_zip({name: b"x"})

    def test_differing_write_once_target_remains_untouched(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "release.zip"
            subject.write_once(path, b"first")
            subject.write_once(path, b"first")
            with self.assertRaises(subject.ArtifactError):
                subject.write_once(path, b"second")
            self.assertEqual(path.read_bytes(), b"first")

    def records(self):
        return [{"path": name, "sha256": "0" * 64, "byteLength": 0} for name in sorted(subject.MINIMUM_INPUTS)]

    def test_complete_input_contract_includes_format7_and_actual_entry(self):
        self.assertEqual(subject.product_input_paths({"productInputFiles": self.records()}), subject.MINIMUM_INPUTS)
        for path in ("src/release/mvp07ReleaseData.ts", "schemas/release-manifest-v7.schema.json",
                     "schemas/calendar-rules-v3.schema.json", "schemas/holiday-catalog-v2.schema.json"):
            with self.subTest(path=path), self.assertRaises(subject.ArtifactError):
                subject.product_input_paths({"productInputFiles": [item for item in self.records() if item["path"] != path]})

    def test_unrelated_private_or_duplicate_inputs_rejected(self):
        for name in ("Userinput/private.docx", "src/ui/preview/qaPresets.ts", "src/core/private.key", "../private", "package.json"):
            with self.subTest(name=name), self.assertRaises(subject.ArtifactError):
                subject.product_input_paths({"productInputFiles": self.records() + [{"path": name, "sha256": "0" * 64, "byteLength": 0}]})

    def test_malformed_input_binding_rejected(self):
        for key, value in (("sha256", "not-a-digest"), ("byteLength", -1), ("byteLength", True)):
            records = self.records()
            records[0][key] = value
            with self.subTest(key=key, value=value), self.assertRaises(subject.ArtifactError):
                subject.product_input_paths({"productInputFiles": records})


class RealReleaseArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # A missing release is intentionally a failing prerequisite, never a skipped proof.
        cls.report = json.loads((ROOT / subject.OUTPUT / "artifact-verification.json").read_bytes())
        cls.artifact_dir = ROOT / subject.OUTPUT / "artifacts"
        cls.package = (cls.artifact_dir / subject.PACKAGE_NAME).read_bytes()
        cls.mirror = subject.zip_files((cls.artifact_dir / subject.MIRROR_NAME).read_bytes())
        cls.manifest = json.loads(cls.mirror["manifest.json"])
        cls.config = json.loads((ROOT / subject.EVIDENCE / "inputs/spfx/config/package-solution.json").read_bytes())
        cls.pin = cls.report["pinCommit"]
        cls.base_url = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{cls.pin}/data/releases/{subject.RELEASE_ID}"
        cls.receipt = json.loads((ROOT / cls.report["spfxBuildEvidence"]["path"]).read_bytes())

    def archived_fixture(self, directory):
        paths = [f"{subject.OUTPUT}/artifact-verification.json",
            *[item["path"] for item in self.report["archivedBuildEvidence"]],
            *[f"{subject.OUTPUT}/artifacts/{item['path']}" for item in self.report["artifacts"]]]
        for relative in paths:
            destination = Path(directory) / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, destination)
        return Path(directory)

    def test_all_actual_artifacts_pass(self):
        result = subject.verify_archived(ROOT)
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["artifacts"], 3)
        self.assertEqual(result["mirrorFiles"], 41)
        self.assertEqual(result["webFiles"], 12)

    def test_archive_independent_of_scratch_git_and_current_source(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            self.assertFalse((fixture / ".git").exists())
            self.assertFalse((fixture / ".work").exists())
            self.assertFalse((fixture / "src").exists())
            result = subject.verify_archived(fixture)
            self.assertFalse(result["scratchRequired"])
            self.assertFalse(result["gitHistoryRequiredForThisArchiveCheck"])

    def test_archived_log_mutation_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            path = fixture / self.report["archivedBuildLogs"][0]["archivePath"]
            path.write_bytes(path.read_bytes() + b"changed")
            with self.assertRaisesRegex(subject.ArtifactError, "Archived evidence changed"):
                subject.verify_archived(fixture)

    def test_archived_artifact_mutation_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            path = fixture / subject.OUTPUT / "artifacts" / subject.PACKAGE_NAME
            path.write_bytes(path.read_bytes() + b"changed")
            with self.assertRaisesRegex(subject.ArtifactError, "Archived artifact changed"):
                subject.verify_archived(fixture)

    def test_missing_schema_input_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = self.archived_fixture(directory)
            path = fixture / subject.OUTPUT / "artifact-verification.json"
            report = json.loads(path.read_bytes())
            report["buildInputSnapshots"] = [item for item in report["buildInputSnapshots"]
                if item["path"] != "schemas/calendar-rules-v3.schema.json"]
            path.write_text(json.dumps(report))
            with self.assertRaisesRegex(subject.ArtifactError, "Incomplete or stale"):
                subject.verify_archived(fixture)

    def test_all_41_mirror_files_equal_approved_runtime_bytes(self):
        self.assertEqual(len(self.mirror), 41)
        self.assertEqual(self.manifest["formatVersion"], "7.0.0")
        for name, data in self.mirror.items():
            self.assertEqual(data, (ROOT / "data/releases" / subject.RELEASE_ID / name).read_bytes())
        self.assertNotIn("README.md", self.mirror)

    def test_added_or_tampered_mirror_file_rejected(self):
        for files in ({**self.mirror, "private.md": b"extra"}, {**self.mirror, "manifest.json": self.mirror["manifest.json"] + b"\n"}):
            with self.assertRaises(subject.ArtifactError):
                subject.inspect_mirror_files(files, self.report["manifestSha256"])

    def test_package_pin_and_version_must_match(self):
        with self.assertRaisesRegex(subject.ArtifactError, "default pin"):
            subject.inspect_sppkg(self.package, self.config, self.base_url.replace(self.pin, "0" * 40))
        files = subject.zip_files(self.package)
        files["AppManifest.xml"] = files["AppManifest.xml"].replace(b'Version="0.7.0.0"', b'Version="0.6.0.1"')
        with self.assertRaisesRegex(subject.ArtifactError, "identity/version"):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, self.base_url)

    def test_additional_permissions_and_private_file_rejected(self):
        config = copy.deepcopy(self.config)
        config["solution"]["webApiPermissionRequests"] = [{"resource": "Microsoft Graph", "scope": "User.Read"}]
        with self.assertRaisesRegex(subject.ArtifactError, "permission"):
            subject.inspect_sppkg(self.package, config, self.base_url)
        files = subject.zip_files(self.package)
        files["private.key"] = b"not a real key"
        with self.assertRaisesRegex(subject.ArtifactError, "Private/development"):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, self.base_url)

    def test_incomplete_failed_or_weakened_build_proof_rejected(self):
        for mutation in ("missing", "failed", "skip-test", "external", "timeout"):
            receipt = copy.deepcopy(self.receipt)
            if mutation == "missing":
                receipt["steps"].pop()
            elif mutation == "failed":
                receipt["steps"][-1]["exitCode"] = 1
            elif mutation == "skip-test":
                receipt["builtTestFiles"].pop()
            elif mutation == "external":
                receipt["publicationVerified"] = True
            else:
                receipt["steps"][1]["args"][4] = "--test-timeout=120000"
            with self.subTest(mutation=mutation), self.assertRaises(subject.ArtifactError):
                subject.validate_build_receipt(receipt, self.pin, self.report["manifestSha256"])

    def test_altered_source_or_authority_is_rejected(self):
        governance = lambda path: (ROOT / subject.EVIDENCE / "governance" / path).read_bytes()
        inputs = [self.mirror["manifest.json"], governance(f"{subject.OUTPUT}/source-approval.json"),
            governance(f"{subject.OUTPUT}/local-build-approval.json"), governance(subject.DECISION_PATH),
            governance(f"{subject.OUTPUT}/data-promotion.json")]
        subject.inspect_governance(*inputs)
        for index in (1, 2, 3):
            changed = inputs.copy()
            changed[index] += b"\n"
            with self.subTest(index=index), self.assertRaises(subject.ArtifactError):
                subject.inspect_governance(*changed)

    def test_operational_authority_and_rollback_cannot_be_rewritten(self):
        for mutation in ("publication", "productcommit", "rollback"):
            with self.subTest(mutation=mutation), tempfile.TemporaryDirectory() as directory:
                fixture = self.archived_fixture(directory)
                path = fixture / subject.OUTPUT / "artifact-verification.json"
                report = json.loads(path.read_bytes())
                if mutation == "publication":
                    report["permissions"]["publication"] = True
                elif mutation == "productcommit":
                    report["fullProductCommit"] = self.pin
                else:
                    report["priorPackage"]["version"] = "0.6.0.0"
                path.write_text(json.dumps(report))
                with self.assertRaises(subject.ArtifactError):
                    subject.verify_archived(fixture)

    def test_web_has_no_candidate_metadata_and_retains_hosting_rules(self):
        files = subject.zip_files((self.artifact_dir / subject.WEB_NAME).read_bytes())
        build = json.loads(files["build-manifest.json"])
        self.assertEqual(build["version"], "0.7.0")
        self.assertEqual(build["dataReleaseId"], subject.RELEASE_ID)
        self.assertEqual(files[".htaccess"], (ROOT / subject.EVIDENCE / "inputs/public-app/.htaccess").read_bytes())
        self.assertFalse(any(name.endswith(".map") or "Userinput" in name for name in files))


if __name__ == "__main__":
    unittest.main()
