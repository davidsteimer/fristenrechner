#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Run unchanged data and Python-governance validators in a public-only copy.

This test deliberately copies selected JSON/code inputs, never whole output
trees, private originals, acceptance TARs, Git or a dependency directory.
It tests portability, not a repeat of the complete private source audit.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
RELEASE = 'data/releases/2026-10-08-mvp-07-approved.1'
PREFIX = 'outputs/release-mvp07-2026-10-08'
SNAPSHOT = PREFIX + '/inputs/snapshot.json'
SNAPSHOT_SHA = 'cbb9744cb2cc4f5b1812ad7850b9746fb4b504bab1c488eec824dd783b34f3bb'
STATIC_FILES = (
    'tests/data/validate_mvp07_release.py', 'tests/data/ap22c1_contract.py',
    'tests/governance/validate_source_reviews.py',
    'tests/governance/test_source_review_evolution.py',
    'tests/governance/test_source_reviews_mvp05.py',
    'tests/governance/test_source_reviews_mvp06.py',
    'tests/golden/candidates/ap22b-holiday-contract.json',
    'outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json',
    'docs/betrieb/freigabe-r07-b.md',
    PREFIX + '/source-approval.json', PREFIX + '/local-build-approval.json',
    PREFIX + '/source-governance-adoption.json', PREFIX + '/source-version-bridges.json',
    SNAPSHOT,
    'outputs/release-mvp04-2026-09-22/source-approval.json',
    'outputs/release-mvp05-2026-09-28/source-approval.json',
    'outputs/release-mvp05-2026-09-28/approval-inputs/data/source-reviews/source-register.json',
    'outputs/release-mvp06-2026-10-01/source-governance-adoption.json',
    'outputs/release-mvp06-2026-10-01/historical-baseline/data/source-reviews/source-register.json',
    'outputs/release-mvp06-2026-10-01/historical-baseline/data/source-reviews/index.json',
    'outputs/release-mvp06-2026-10-01/historical-baseline/data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json',
)
PUBLIC_JSON_TREES = (
    'data/releases', 'data/source-reviews', 'schemas',
    'outputs/ap22c3-2026-10-08/bundle',
)


def safe_public_path(value):
    path = PurePosixPath(value)
    if (path.is_absolute() or '\\' in value or any(part in {'', '.', '..'} for part in value.split('/'))
            or set(path.parts) & {'.work', '.git', '.venv', 'node_modules', 'Userinput', 'private', 'arbeitskopien'}
            or '.private.' in value):
        raise AssertionError('Unsafe public fixture path')
    return value


def public_fixture_paths():
    paths = set(STATIC_FILES)
    for relative in PUBLIC_JSON_TREES:
        files = list((ROOT / relative).rglob('*.json'))
        if not files:
            raise AssertionError(f'Missing public input tree: {relative}')
        paths.update(str(path.relative_to(ROOT)) for path in files)
    raw = (ROOT / SNAPSHOT).read_bytes()
    if hashlib.sha256(raw).hexdigest() != SNAPSHOT_SHA:
        raise AssertionError('Accepted historical snapshot changed')
    evidence = {entry['path']: entry for entry in json.loads(raw)['evidence']}
    # Only the exact historical governance inputs that the existing MVP06
    # regression suite uses. Do not copy all referenced acceptance archives.
    needed = {'data/source-reviews/source-register.json', 'data/source-reviews/index.json'}
    index_entry = evidence['data/source-reviews/index.json']
    old_index = json.loads((ROOT / index_entry['archivedAt']).read_bytes())
    needed.update(f'data/source-reviews/events/{event}.json'
                  for event in old_index['generatedFrom']['eventIds'])
    adoption = json.loads((ROOT / 'outputs/release-mvp06-2026-10-01/source-governance-adoption.json').read_bytes())
    needed.update(entry['path'] for entry in adoption['evidence'])
    for relative in needed:
        if relative in evidence:
            entry = evidence[relative]
            actual = (ROOT / safe_public_path(entry['archivedAt'])).read_bytes()
            if len(actual) != entry['byteLength'] or hashlib.sha256(actual).hexdigest() != entry['sha256']:
                raise AssertionError(f'Changed historical governance fixture: {relative}')
            paths.add(entry['archivedAt'])
        else:
            if relative.startswith('data/source-reviews/'):
                raise AssertionError('Missing historical snapshot entry, no live fallback')
            paths.add(relative)
    return sorted(safe_public_path(path) for path in paths)


class PublicPortabilityTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='mvp07-public-python-')
        self.addCleanup(self.temporary.cleanup)
        self.repository = Path(self.temporary.name)
        for relative in public_fixture_paths():
            original = ROOT / relative
            self.assertTrue(original.is_file() and not original.is_symlink(), relative)
            self.assertFalse(any(parent.is_symlink() for parent in original.parents if parent != ROOT.parent))
            target = self.repository / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(original, target)
        for absent in ['.work', '.git', '.venv', 'node_modules', 'outputs/ap21-abnahme-2026-10-08']:
            self.assertFalse((self.repository / absent).exists())

    def run_public(self, *arguments):
        environment = dict(os.environ, PYTHONDONTWRITEBYTECODE='1')
        environment.pop('PYTHONPATH', None)
        return subprocess.run([sys.executable, '-B', *arguments], cwd=self.repository,
                              env=environment, text=True, capture_output=True, timeout=120)

    def assert_success(self, result):
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_unchanged_format7_semantic_validator_is_public_and_independent(self):
        self.assert_success(self.run_public('tests/data/validate_mvp07_release.py', RELEASE))

    def test_public_python_governance_including_historical_suites_is_not_excluded(self):
        self.assert_success(self.run_public('tests/governance/validate_source_reviews.py', '--self-test'))
        result = self.run_public('-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py')
        self.assert_success(result)
        self.assertIn('Ran 30 tests', result.stderr)

    def test_missing_public_candidate_is_fatal_without_repository_fallback(self):
        (self.repository / 'outputs/ap22c3-2026-10-08/bundle/manifest.json').unlink()
        result = self.run_public('tests/data/validate_mvp07_release.py', RELEASE)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing release file', result.stdout + result.stderr)

    def test_changed_source_approval_is_fatal_before_semantic_validation(self):
        path = self.repository / (PREFIX + '/source-approval.json')
        path.write_bytes(path.read_bytes() + b'\n')
        result = self.run_public('tests/data/validate_mvp07_release.py', RELEASE)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Source approval bytes changed', result.stdout + result.stderr)

    def test_missing_historical_governance_snapshot_is_not_replaced_with_live_state(self):
        raw = json.loads((self.repository / SNAPSHOT).read_bytes())
        archived = next(entry['archivedAt'] for entry in raw['evidence']
                        if entry['path'] == 'data/source-reviews/source-register.json')
        (self.repository / archived).unlink()
        result = self.run_public('tests/governance/test_source_reviews_mvp06.py')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('FileNotFoundError', result.stderr)


if __name__ == '__main__':
    unittest.main()
