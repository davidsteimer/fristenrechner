# SPDX-License-Identifier: AGPL-3.0-only
"""SPFx-only correction audit regressions. Mutations use temporary fixtures."""

import copy
import importlib.util
import json
import shutil
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("mvp04_spfx_correction", ROOT / "scripts/prepare_mvp04_spfx_correction.py")
correction = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(correction)
audit = correction.audit
HISTORICAL_CODE_COMMIT = "c3eaa629d13198d49013a66e8ef2029883139939"


class Mvp04SpfxCorrectionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.old_package = (ROOT / audit.ARTIFACT_DIRECTORY / "fristenrechner-schweiz-0.4.0.0.sppkg").read_bytes()
        cls.old_config = json.loads(subprocess.run(
            ["git", "cat-file", "blob", f"{HISTORICAL_CODE_COMMIT}:spfx/config/package-solution.json"],
            cwd=ROOT, capture_output=True, check=True).stdout)
        # Structural tests use a clearly synthetic package fixture, not proof
        # that the defect is fixed. The real package is verified separately.
        files = audit.zip_files(cls.old_package)
        for member in ["AppManifest.xml", f"feature_{audit.FEATURE_ID}.xml"]:
            xml = ET.fromstring(files[member])
            xml.set("Version", correction.VERSION)
            files[member] = ET.tostring(xml, encoding="utf-8")
        cls.fixture_package = audit.deterministic_zip(files)
        cls.fixture_config = copy.deepcopy(cls.old_config)
        cls.fixture_config["solution"]["version"] = correction.VERSION
        cls.fixture_config["solution"]["features"][0]["version"] = correction.VERSION

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mvp04-spfx-correction-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for relative in [*correction.FROZEN_EVIDENCE, audit.ROLLBACK, "package.json", "spfx/package.json"]:
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, target)
        shutil.copytree(ROOT / "data/releases" / audit.RELEASE_ID,
                        self.root / "data/releases" / audit.RELEASE_ID)
        self.write_fixture(audit.SPPKG, self.fixture_package)
        self.write_fixture("spfx/config/package-solution.json", json.dumps(self.fixture_config).encode())

    def write_fixture(self, relative, data):
        target = self.root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    def prepare(self):
        return correction.prepare(self.root, ROOT)

    def test_spfx_only_does_not_read_or_rebuild_a_public_output_tree(self):
        self.assertFalse((self.root / ".work/public-app").exists())
        with patch.object(audit, "inspect_web", side_effect=AssertionError("Web audit invoked")), \
             patch.object(audit, "deterministic_zip", side_effect=AssertionError("Archive repacked")):
            artifacts, report = self.prepare()
        self.assertEqual(set(artifacts), {"fristenrechner-schweiz-0.4.0.1.sppkg"})
        self.assertEqual(report["applicationVersion"], "0.4.0")
        self.assertEqual(report["packageVersion"], "0.4.0.1")
        self.assertFalse(report["web"]["prepared"])
        self.assertFalse(report["web"]["repacked"])
        self.assertFalse(report["web"]["productionChanged"])
        self.assertTrue(report["mirror"]["reusedUnchanged"])
        self.assertEqual(report["mirror"]["sha256"], correction.FROZEN_EVIDENCE[correction.MIRROR])

    def test_explicit_version_contract_does_not_infer_trust_from_input(self):
        with self.assertRaisesRegex(audit.ArtifactError, "not version 0.4.0.0"):
            audit.inspect_sppkg(self.fixture_package, self.fixture_config)
        with self.assertRaisesRegex(audit.ArtifactError, "not version 0.4.0.1"):
            audit.inspect_sppkg(self.old_package, self.old_config, expected_version="0.4.0.1")
        with self.assertRaisesRegex(audit.ArtifactError, "Unsupported explicit"):
            audit.inspect_sppkg(self.fixture_package, self.fixture_config, expected_version="9.9.9.9")
        report = audit.inspect_sppkg(self.fixture_package, self.fixture_config, expected_version="0.4.0.1")
        self.assertEqual(report["solutionVersion"], "0.4.0.1")
        self.assertEqual(report["featureVersion"], "0.4.0.1")
        self.assertEqual(report["webpartVersion"], "0.4.0")

    def test_old_package_cannot_be_promoted_by_renaming(self):
        self.write_fixture(audit.SPPKG, self.old_package)
        with self.assertRaisesRegex(audit.ArtifactError, "not version 0.4.0.1"):
            self.prepare()

    def test_solution_configuration_must_match_fixed_expected_version(self):
        self.write_fixture("spfx/config/package-solution.json", json.dumps(self.old_config).encode())
        with self.assertRaisesRegex(audit.ArtifactError, "configuration differs"):
            self.prepare()

    def test_feature_version_must_match_fixed_expected_version(self):
        config = copy.deepcopy(self.fixture_config)
        config["solution"]["features"][0]["version"] = "0.4.0.0"
        self.write_fixture("spfx/config/package-solution.json", json.dumps(config).encode())
        with self.assertRaisesRegex(audit.ArtifactError, "feature configuration"):
            self.prepare()

    def test_no_additional_api_permissions(self):
        config = copy.deepcopy(self.fixture_config)
        config["solution"]["webApiPermissionRequests"] = [{"resource": "Microsoft Graph", "scope": "Mail.Read"}]
        self.write_fixture("spfx/config/package-solution.json", json.dumps(config).encode())
        with self.assertRaisesRegex(audit.ArtifactError, "additional API permissions"):
            self.prepare()

    def test_application_version_remains_040(self):
        self.write_fixture("package.json", b'{"version":"0.4.1"}')
        with self.assertRaisesRegex(audit.ArtifactError, "Application version differs"):
            self.prepare()

    def test_all_approved_data_match_pin_commit(self):
        _, report = self.prepare()
        self.assertEqual(len(report["data"]["entries"]), 10)
        self.assertEqual(report["pinCommit"], audit.PIN_COMMIT)
        self.assertEqual(report["manifestSha256"], audit.MANIFEST_SHA256)
        for item in report["data"]["entries"]:
            expected = audit.git_blob(ROOT, f"data/releases/{audit.RELEASE_ID}/{item['path']}")
            self.assertEqual(item["sha256"], audit.sha256(expected))

    def test_changed_data_is_rejected_without_repromoting_it(self):
        self.write_fixture(f"data/releases/{audit.RELEASE_ID}/calendars/be-public-holidays.json", b"{}\n")
        with self.assertRaisesRegex(audit.ArtifactError, "Manifest artifact differs"):
            self.prepare()

    def test_each_frozen_artifact_and_report_is_hash_bound(self):
        for relative in correction.FROZEN_EVIDENCE:
            with self.subTest(relative=relative):
                original = (self.root / relative).read_bytes()
                self.write_fixture(relative, b"changed historical evidence")
                with self.assertRaisesRegex(audit.ArtifactError, "Frozen release evidence differs"):
                    self.prepare()
                self.write_fixture(relative, original)

    def test_changed_rollback_package_is_rejected(self):
        self.write_fixture(audit.ROLLBACK, b"changed rollback")
        with self.assertRaisesRegex(audit.ArtifactError, "Rollback package hash differs"):
            self.prepare()

    def test_report_is_local_only_and_makes_no_runtime_claim(self):
        _, report = self.prepare()
        self.assertEqual(report["candidateStatus"], "localCorrectionCandidate")
        for key in ["publicationVerified", "deploymentApproved", "productionActivation", "runtimeValidationVerified"]:
            self.assertIs(report[key], False)
        self.assertEqual(report["rollback"]["sha256"], audit.ROLLBACK_SHA256)

    def test_writer_is_idempotent_and_preserves_all_historic_evidence(self):
        before = {relative: (self.root / relative).read_bytes() for relative in correction.FROZEN_EVIDENCE}
        artifacts, report = self.prepare()
        correction.write(artifacts, report, self.root)
        correction.write(artifacts, report, self.root)
        self.assertEqual((self.root / correction.ARTIFACT_DIRECTORY / correction.PACKAGE_NAME).read_bytes(), self.fixture_package)
        self.assertEqual(json.loads((self.root / correction.REPORT).read_bytes()), report)
        for relative, expected in before.items():
            self.assertEqual((self.root / relative).read_bytes(), expected)
        self.assertFalse((self.root / ".work/public-app").exists())

    def test_writer_rejects_modified_candidate_without_overwrite(self):
        artifacts, report = self.prepare()
        path = correction.ARTIFACT_DIRECTORY + "/" + correction.PACKAGE_NAME
        self.write_fixture(path, b"existing user content")
        with self.assertRaisesRegex(audit.ArtifactError, "Existing artifact differs"):
            correction.write(artifacts, report, self.root)
        self.assertEqual((self.root / path).read_bytes(), b"existing user content")
        self.assertFalse((self.root / correction.REPORT).exists())

    def test_late_report_conflict_is_preflighted_before_any_copy(self):
        artifacts, report = self.prepare()
        self.write_fixture(correction.REPORT, b"existing report")
        with self.assertRaisesRegex(audit.ArtifactError, "Existing artifact differs"):
            correction.write(artifacts, report, self.root)
        self.assertFalse((self.root / correction.ARTIFACT_DIRECTORY).exists())

    def test_writer_rejects_extra_p_artifact(self):
        artifacts, report = self.prepare()
        artifacts["fristenrechner-mvp04-steimer-web.zip"] = b"not allowed"
        report["artifacts"] = audit.inventory(artifacts)
        with self.assertRaisesRegex(audit.ArtifactError, "only the explicit SPFx package"):
            correction.write(artifacts, report, self.root)

    def test_writer_rechecks_frozen_evidence_after_prepare(self):
        artifacts, report = self.prepare()
        self.write_fixture(audit.REPORT, b"changed historic report")
        with self.assertRaisesRegex(audit.ArtifactError, "Frozen release evidence differs"):
            correction.write(artifacts, report, self.root)
        self.assertFalse((self.root / correction.ARTIFACT_DIRECTORY).exists())

    def test_writer_rejects_bytes_changed_after_prepare(self):
        artifacts, report = self.prepare()
        artifacts[correction.PACKAGE_NAME] = b"changed package"
        with self.assertRaisesRegex(audit.ArtifactError, "Artifact bytes changed after audit"):
            correction.write(artifacts, report, self.root)

    def test_writer_cannot_claim_any_unverified_approval(self):
        artifacts, original_report = self.prepare()
        for key in ["publicationVerified", "deploymentApproved", "productionActivation", "runtimeValidationVerified"]:
            report = copy.deepcopy(original_report)
            report[key] = True
            with self.subTest(key=key), self.assertRaisesRegex(audit.ArtifactError, "cannot assert"):
                correction.write(artifacts, report, self.root)

    def test_actual_prepared_candidate_matches_its_separate_report(self):
        # Integration gate: run after the real SPFx build and correction script.
        artifacts, report = correction.prepare(ROOT)
        self.assertEqual(set(artifacts), {correction.PACKAGE_NAME})
        self.assertEqual((ROOT / correction.ARTIFACT_DIRECTORY / correction.PACKAGE_NAME).read_bytes(), artifacts[correction.PACKAGE_NAME])
        self.assertEqual(json.loads((ROOT / correction.REPORT).read_bytes()), report)


if __name__ == "__main__":
    unittest.main()
