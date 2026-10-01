#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Explicit local Git-object audit. Never part of the public file-export tests."""
import json
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import prepare_mvp06_artifacts as subject


class Mvp06MirrorGitAudit(unittest.TestCase):
    def test_eleven_mirror_files_match_pinned_local_git_objects(self):
        # Fail closed without a repository at this root. Do not accept a parent
        # repository merely because Git can discover one above a file export.
        self.assertTrue((ROOT / ".git").exists(), "This explicit audit requires the local Git repository")
        actual_root = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], cwd=ROOT, text=True).strip()
        self.assertEqual(Path(actual_root).resolve(), ROOT.resolve(), "Parent Git fallback is not allowed")
        report = json.loads(subject.file_bytes(ROOT / subject.OUTPUT / "artifact-verification.json"))
        self.assertEqual(report["manifestSha256"], subject.MANIFEST_SHA256)
        expected, _ = subject.inspect_data(ROOT, report["pinCommit"])
        actual = subject.zip_files(subject.file_bytes(ROOT / subject.OUTPUT / "artifacts/fristenrechner-mvp06-sharepoint-mirror.zip"))
        self.assertEqual(actual, expected)
        self.assertEqual(len(actual), 11)
        self.assertNotIn("README.md", actual)


if __name__ == "__main__":
    unittest.main()
