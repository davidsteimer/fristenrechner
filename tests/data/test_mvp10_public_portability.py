#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Explicit public-runtime audit in a minimal copy without Git/private evidence.

This is not the private R10-B source validator and cannot grant an approval.
The wider default local-artifact audit must fail in this deliberately minimal
copy. It must never silently downgrade itself to the runtime-only mode.
"""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
RELEASE = 'data/releases/2026-10-28-mvp-010-approved.1'
MANIFEST_SHA = '7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016'
SCRIPT = 'scripts/verify-mvp10-public-integrity.mjs'
SCHEMAS = ('release-manifest-v17', 'administrative-procedure-catalog-v10', 'legal-profile',
           'calendar-rules-v3', 'holiday-catalog-v2', 'special-regime-catalog-v3', 'social-procedure-catalog-v2')


def safe_public_path(value):
    parts = value.split('/')
    if (not value or PurePosixPath(value).is_absolute() or '\\' in value
            or any(part in {'', '.', '..', '.work', '.git', '.venv', 'node_modules', 'Userinput', 'private', 'arbeitskopien'} for part in parts)
            or any(ord(character) < 32 for character in value) or '.private.' in value):
        raise AssertionError('Unsafe public fixture path')
    return value


def fixture_paths():
    raw = (ROOT / RELEASE / 'manifest.json').read_bytes()
    if hashlib.sha256(raw).hexdigest() != MANIFEST_SHA:
        raise AssertionError('Actual approved manifest changed')
    manifest = json.loads(raw)
    paths = [SCRIPT, RELEASE + '/manifest.json',
             *(RELEASE + '/' + safe_public_path(row['path']) for row in manifest['artifacts']),
             *('schemas/' + name + '.schema.json' for name in SCHEMAS)]
    if len(paths) != len(set(paths)) or len(paths) != 53:
        raise AssertionError('Public byte closure is not 45 + 7 + verifier')
    return paths


class Mvp10PublicPortabilityTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='mvp10-public-runtime-')
        self.addCleanup(self.temporary.cleanup)
        self.repository = Path(self.temporary.name)
        node = os.environ.get('FRISTENRECHNER_TEST_NODE') or shutil.which('node')
        if not node:
            node = str(ROOT / '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node')
        self.node = node
        self.assertTrue(Path(node).is_file(), 'Node is a mandatory public verifier prerequisite')
        for relative in fixture_paths():
            source = ROOT / safe_public_path(relative)
            self.assertTrue(source.is_file() and not source.is_symlink(), relative)
            target = self.repository / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)

    def run_public(self, *arguments):
        environment = dict(os.environ)
        for key in ('NODE_OPTIONS', 'FRISTENRECHNER_DATA_CANDIDATE', 'FRISTENRECHNER_TEST_SPPKG'):
            environment.pop(key, None)
        return subprocess.run([self.node, SCRIPT, *arguments], cwd=self.repository,
                              env=environment, capture_output=True, text=True, timeout=60)

    def test_public_runtime_only_is_portable_without_git_outputs_or_raw_sources(self):
        for path in ('.git', '.work', '.venv', 'node_modules', 'outputs', 'docs', 'Userinput'):
            self.assertFalse((self.repository / path).exists())
        result = self.run_public('--runtime-only')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report['runtimeFilesVerified'], 45)
        self.assertEqual(report['schemaFilesVerified'], 7)
        self.assertEqual(report['verificationScope'], 'public-pinned-runtime-and-schema-integrity')
        for flag in ('gitHistoryChecked', 'privateEvidenceRequired', 'privateRawEvidenceRechecked',
                     'completeSourceAuditReproduced', 'newApprovalGranted', 'installationAuthorized', 'publicationAuthorized'):
            self.assertFalse(report[flag], flag)

    def test_default_artifact_audit_does_not_silently_fall_back(self):
        result = self.run_public()
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('"status": "passed"', result.stdout)

    def test_missing_runtime_component_is_fatal(self):
        (self.repository / RELEASE / 'profiles/zpo.json').unlink()
        self.assertNotEqual(self.run_public('--runtime-only').returncode, 0)

    def test_changed_schema_is_fatal(self):
        path = self.repository / 'schemas/administrative-procedure-catalog-v10.schema.json'
        path.write_bytes(path.read_bytes() + b' ')
        self.assertNotEqual(self.run_public('--runtime-only').returncode, 0)

    def test_extra_runtime_file_is_fatal(self):
        (self.repository / RELEASE / 'unexpected.json').write_bytes(b'{}')
        self.assertNotEqual(self.run_public('--runtime-only').returncode, 0)

    def test_symlink_does_not_substitute_a_regular_public_file(self):
        path = self.repository / RELEASE / 'profiles/zpo.json'
        path.unlink()
        path.symlink_to(ROOT / RELEASE / 'profiles/zpo.json')
        self.assertNotEqual(self.run_public('--runtime-only').returncode, 0)

    def test_unknown_audit_mode_does_not_start_a_private_fallback(self):
        self.assertNotEqual(self.run_public('--private-audit').returncode, 0)


if __name__ == '__main__':
    unittest.main()
