#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Actual MVP08 package/Mirror/Web integrity and synthetic archive mutations.

Missing final artifacts are a failing prerequisite, never a skipped test. All
mutations are made in memory or in newly created temporary directories.
"""
import copy
import io
import json
import re
import stat
import sys
import tempfile
import unittest
import warnings
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import prepare_mvp08_artifacts as subject
from prepare_mvp04_artifacts import ArtifactError

RELEASE_ID = '2026-10-15-mvp-08-approved.1'
MANIFEST_SHA = '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4'
PIN = '10a99419eaabb3e96d2acccf0c7a93e2fe6472cb'
OUTPUT = ROOT / 'outputs/release-mvp08-2026-10-15'
PACKAGE = 'fristenrechner-schweiz-0.8.0.0.sppkg'
MIRROR = 'fristenrechner-mvp08-sharepoint-mirror.zip'
WEB = 'fristenrechner-mvp08-steimer-web.zip'
BASE_URL = f'https://raw.githubusercontent.com/davidsteimer/fristenrechner/{PIN}/data/releases/{RELEASE_ID}'


def checked_file(path, expected):
    raw = path.read_bytes()
    subject.require(subject.sha256(raw) == expected['sha256'] and len(raw) == expected['byteLength'],
                    f'Artifact/evidence changed: {path.name}')
    return raw


def verified_web(files, report, manifest, htaccess):
    subject.require(subject.inventory(files) == report['webFiles'], 'Web resource bytes differ from the sealed inventory')
    subject.inspect_web_files(files, manifest, htaccess)


class PortableArchivePrimitiveTests(unittest.TestCase):
    def test_deterministic_zip_is_exact_and_independent_of_input_order(self):
        files = {'manifest.json': b'{}', 'calendars/a.json': b'[]', '.htaccess': b'Options -Indexes'}
        archive = subject.deterministic_zip(files)
        self.assertEqual(subject.zip_files(archive), files)
        self.assertEqual(archive, subject.deterministic_zip(dict(reversed(list(files.items())))))

    def test_unsafe_names_are_rejected(self):
        for name in ('../bad', '/absolute', 'a/../b', 'a\\b', 'a//b', './bad'):
            with self.subTest(name=name), self.assertRaises(ArtifactError):
                subject.deterministic_zip({name: b'x'})

    def test_duplicate_zip_member_is_rejected(self):
        stream = io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', UserWarning)
            with zipfile.ZipFile(stream, 'w') as archive:
                archive.writestr('manifest.json', b'{}')
                archive.writestr('manifest.json', b'{"different":true}')
        with self.assertRaisesRegex(ArtifactError, 'Duplicate ZIP'):
            subject.zip_files(stream.getvalue())

    def test_zip_symlink_is_rejected(self):
        stream = io.BytesIO()
        entry = zipfile.ZipInfo('link')
        entry.create_system = 3
        entry.external_attr = (stat.S_IFLNK | 0o777) << 16
        with zipfile.ZipFile(stream, 'w') as archive:
            archive.writestr(entry, b'../private')
        with self.assertRaisesRegex(ArtifactError, 'symlink'):
            subject.zip_files(stream.getvalue())

    def test_existing_different_target_is_not_overwritten(self):
        with tempfile.TemporaryDirectory(prefix='mvp08-write-once-') as directory:
            path = Path(directory) / 'archive.zip'
            subject.write_once(path, b'original')
            subject.write_once(path, b'original')
            with self.assertRaisesRegex(ArtifactError, 'Refusing overwrite'):
                subject.write_once(path, b'different')
            self.assertEqual(path.read_bytes(), b'original')


class ActualMvp08ArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads((OUTPUT / 'artifact-verification.json').read_bytes())
        cls.build = json.loads(checked_file(ROOT / cls.report['buildProof']['path'], cls.report['buildProof']))
        cls.artifacts = {Path(item['path']).name: item for item in cls.report['artifacts']}
        cls.package = checked_file(OUTPUT / PACKAGE, cls.artifacts[PACKAGE])
        cls.mirror = subject.zip_files(checked_file(OUTPUT / MIRROR, cls.artifacts[MIRROR]))
        cls.web = subject.zip_files(checked_file(OUTPUT / WEB, cls.artifacts[WEB]))
        cls.manifest = json.loads(cls.mirror['manifest.json'])
        by_input = {item['path']: item for item in cls.build['archivedInputs']}
        config = by_input['spfx/config/package-solution.json']
        htaccess = by_input['public-app/.htaccess']
        cls.config = json.loads(checked_file(ROOT / config['archivedAt'], config))
        cls.htaccess = checked_file(ROOT / htaccess['archivedAt'], htaccess)

    def test_actual_three_artifacts_have_bound_bytes_and_expected_scope(self):
        self.assertEqual(set(self.artifacts), {PACKAGE, MIRROR, WEB})
        self.assertEqual(self.report['status'], 'passed')
        self.assertEqual(self.report['releaseId'], RELEASE_ID)
        self.assertEqual(self.report['localDataCommit'], PIN)
        self.assertEqual(self.report['manifestSha256'], MANIFEST_SHA)
        for flag in ('installationAuthorized', 'publicationAuthorized', 'operatingApproval', 'remotePinVerified', 'realM365TestsPerformed'):
            self.assertFalse(self.report[flag])
        package = subject.inspect_sppkg(self.package, self.config, BASE_URL)
        self.assertEqual(package['solutionVersion'], '0.8.0.0')
        self.assertEqual(package['featureVersion'], '0.8.0.0')
        self.assertEqual(package['webpartVersion'], '0.8.0')
        self.assertEqual(package['additionalApiPermissions'], [])
        self.assertEqual(subject.inspect_mirror(self.mirror, MANIFEST_SHA), self.manifest)
        verified_web(self.web, self.report, self.manifest, self.htaccess)

    def test_all_42_mirror_files_equal_original_approved_runtime_bytes(self):
        self.assertEqual(len(self.mirror), 42)
        self.assertEqual(self.manifest['formatVersion'], '8.0.0')
        for name, raw in self.mirror.items():
            self.assertEqual(raw, (ROOT / 'data/releases' / RELEASE_ID / name).read_bytes(), name)
        self.assertNotIn('README.md', self.mirror)
        self.assertFalse(any('.work' in name or 'Userinput' in name for name in self.mirror))

    def test_mirror_missing_file_fails(self):
        altered = dict(self.mirror)
        del altered['profiles/zpo.json']
        with self.assertRaises(ArtifactError):
            subject.inspect_mirror(altered, MANIFEST_SHA)

    def test_mirror_extra_private_file_fails(self):
        with self.assertRaises(ArtifactError):
            subject.inspect_mirror({**self.mirror, 'Userinput/private.docx': b'private'}, MANIFEST_SHA)

    def test_mirror_altered_bound_component_fails(self):
        altered = {**self.mirror, 'profiles/zpo.json': self.mirror['profiles/zpo.json'] + b' '}
        with self.assertRaisesRegex(ArtifactError, 'Altered mirror bytes'):
            subject.inspect_mirror(altered, MANIFEST_SHA)

    def test_mirror_changed_and_resealed_manifest_still_fails_fixed_pin(self):
        altered = dict(self.mirror)
        manifest = json.loads(altered['manifest.json'])
        manifest['artifacts'][0]['sha256'] = '0' * 64
        altered['manifest.json'] = json.dumps(manifest).encode()
        with self.assertRaises(ArtifactError):
            subject.inspect_mirror(altered, MANIFEST_SHA)

    def test_mirror_wrapping_directory_is_not_accepted(self):
        with self.assertRaises((ArtifactError, KeyError)):
            subject.inspect_mirror({f'fristenrechner/{name}': raw for name, raw in self.mirror.items()}, MANIFEST_SHA)

    def test_immutable_pin_cannot_be_substituted(self):
        with self.assertRaisesRegex(ArtifactError, 'default pin'):
            subject.inspect_sppkg(self.package, self.config, BASE_URL.replace(PIN, '0' * 40))

    def test_solution_version_cannot_be_old(self):
        files = subject.zip_files(self.package)
        root = ET.fromstring(files['AppManifest.xml'])
        root.set('Version', '0.7.0.2')
        files['AppManifest.xml'] = ET.tostring(root)
        with self.assertRaisesRegex(ArtifactError, 'identity/version'):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_solution_identity_cannot_be_another_app(self):
        files = subject.zip_files(self.package)
        root = ET.fromstring(files['AppManifest.xml'])
        root.set('ProductID', '00000000-0000-0000-0000-000000000001')
        files['AppManifest.xml'] = ET.tostring(root)
        with self.assertRaisesRegex(ArtifactError, 'identity/version'):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_feature_version_must_match_package(self):
        files = subject.zip_files(self.package)
        path = f'feature_{subject.FEATURE_ID}.xml'
        root = ET.fromstring(files[path])
        root.set('Version', '0.8.0.1')
        files[path] = ET.tostring(root)
        with self.assertRaisesRegex(ArtifactError, 'built feature'):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_added_api_permission_is_rejected(self):
        config = copy.deepcopy(self.config)
        config['solution']['webApiPermissionRequests'] = [{'resource': 'Microsoft Graph', 'scope': 'User.Read'}]
        with self.assertRaisesRegex(ArtifactError, 'permission'):
            subject.inspect_sppkg(self.package, config, BASE_URL)

    def test_added_package_permission_is_rejected(self):
        files = subject.zip_files(self.package)
        root = ET.fromstring(files['AppManifest.xml'])
        ET.SubElement(root, 'AppPermissionRequest', {'Scope': 'unapproved'})
        files['AppManifest.xml'] = ET.tostring(root)
        with self.assertRaisesRegex(ArtifactError, 'permission'):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_package_private_or_development_file_is_rejected(self):
        for name in ('private.key', 'private.pem', 'assets/debug.js.map', 'private.ts'):
            with self.subTest(name=name), self.assertRaisesRegex(ArtifactError, 'Private/development'):
                files = {**subject.zip_files(self.package), name: b'not real credentials'}
                subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_package_license_or_bundle_must_exist(self):
        for suffix in ('', '.LICENSE.txt'):
            files = subject.zip_files(self.package)
            del files[self.report['packageAudit']['bundlePath'] + suffix]
            with self.subTest(suffix=suffix), self.assertRaises(ArtifactError):
                subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_package_relationship_cannot_point_outside_archive(self):
        files = subject.zip_files(self.package)
        path = next(name for name in files if name.endswith('.rels'))
        root = ET.fromstring(files[path])
        relationship = next(element for element in root.iter() if subject.local_name(element.tag) == 'Relationship')
        relationship.set('TargetMode', 'External')
        relationship.set('Target', 'https://unapproved.invalid/resource')
        files[path] = ET.tostring(root)
        with self.assertRaisesRegex(ArtifactError, 'relationship'):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_web_has_exactly_twelve_files_and_no_private_or_source_maps(self):
        self.assertEqual(len(self.web), 12)
        self.assertFalse(any(name.endswith(('.map', '.ts', '.tsx', '.key', '.pem'))
                             or 'Userinput' in name or '.work' in name for name in self.web))
        self.assertEqual(self.web['.htaccess'], self.htaccess)

    def test_web_missing_extra_or_folded_resource_is_rejected(self):
        javascript = json.loads(self.web['build-manifest.json'])['assets']['javascript'].removeprefix('./')
        mutations = []
        missing = dict(self.web)
        del missing[javascript]
        mutations.append(missing)
        mutations.append({**self.web, 'private.json': b'{}'})
        folded = dict(self.web)
        folded[Path(javascript).name] = folded.pop(javascript)
        mutations.append(folded)
        for files in mutations:
            with self.assertRaises(ArtifactError):
                verified_web(files, self.report, self.manifest, self.htaccess)

    def test_every_web_resource_byte_is_bound_not_merely_mentioned_in_html(self):
        for name in self.web:
            with self.subTest(name=name), self.assertRaisesRegex(ArtifactError, 'resource bytes'):
                verified_web({**self.web, name: self.web[name] + b' '}, self.report, self.manifest, self.htaccess)

    def test_web_hosting_rules_cannot_be_ignored(self):
        files = {**self.web, '.htaccess': b'Options +Indexes'}
        with self.assertRaisesRegex(ArtifactError, 'Hosting configuration'):
            subject.inspect_web_files(files, self.manifest, self.htaccess)

    def test_web_metadata_cannot_change_release_or_destination(self):
        for key, value in (('version', '0.7.0'), ('dataReleaseId', 'other-release'),
                           ('basePath', '/other/'), ('canonicalUrl', 'https://unapproved.invalid/'), ('deployable', False)):
            build = json.loads(self.web['build-manifest.json'])
            build[key] = value
            files = {**self.web, 'build-manifest.json': json.dumps(build).encode()}
            with self.subTest(key=key), self.assertRaises(ArtifactError):
                subject.inspect_web_files(files, self.manifest, self.htaccess)

    def test_all_actual_build_phases_are_present_and_successful(self):
        self.assertEqual([step['id'] for step in self.build['steps']],
                         ['sync', 'source-tests', 'compile', 'css-audit', 'package', 'built-tests', 'web-build'])
        self.assertTrue(all(step['exitCode'] == 0 and step['signal'] is None for step in self.build['steps']))
        inputs = {item['path'] for item in self.build['archivedInputs']}
        for path in ('src/release/mvp08ReleaseData.ts', 'src/public-app/main.tsx',
                     'src/core/format8CalculationData.ts', 'schemas/release-manifest-v8.schema.json',
                     'schemas/administrative-procedure-catalog.schema.json', 'spfx/config/package-solution.json'):
            self.assertIn(path, inputs)
        for step in self.build['steps']:
            checked_file(ROOT / step['log']['path'], step['log'])

    def test_complete_build_report_is_accepted(self):
        result = subject.validate_build_report(self.build)
        self.assertEqual(result['status'], 'passed')
        self.assertEqual(result['steps'], 7)
        self.assertEqual(result['runtimeFiles'], 42)
        for counts in result['testCounts'].values():
            self.assertGreater(counts['tests'], 0)
            self.assertEqual(counts['tests'], counts['pass'])
            self.assertTrue(all(counts[key] == 0 for key in ('fail', 'cancelled', 'skipped', 'todo')))

    def test_partial_failed_or_reordered_build_steps_are_rejected(self):
        for mutation in ('empty', 'missing', 'reordered', 'duplicate', 'failed', 'signal'):
            report = copy.deepcopy(self.build)
            if mutation == 'empty':
                report['steps'] = []
            elif mutation == 'missing':
                report['steps'].pop()
            elif mutation == 'reordered':
                report['steps'].reverse()
            elif mutation == 'duplicate':
                report['steps'].append(report['steps'][0])
            elif mutation == 'failed':
                report['steps'][1]['exitCode'] = 1
            else:
                report['steps'][1]['signal'] = 'SIGTERM'
            with self.subTest(mutation=mutation), self.assertRaises(ArtifactError):
                subject.validate_build_report(report)

    def test_required_captured_or_archived_inputs_cannot_disappear(self):
        for path in ('src/release/mvp08ReleaseData.ts', 'schemas/release-manifest-v8.schema.json',
                     'schemas/administrative-procedure-catalog.schema.json'):
            report = copy.deepcopy(self.build)
            report['inputs'] = [item for item in report['inputs'] if item['path'] != path]
            report['archivedInputs'] = [item for item in report['archivedInputs'] if item['path'] != path]
            with self.subTest(path=path), self.assertRaisesRegex(ArtifactError, 'Required product input'):
                subject.validate_build_report(report)

    def test_runtime_fixtures_cannot_be_dropped(self):
        report = copy.deepcopy(self.build)
        path = f'data/releases/{RELEASE_ID}/administrative-procedures/ch-cantonal-administrative-procedures.json'
        report['fixtures'] = [item for item in report['fixtures'] if item['path'] != path]
        report['archivedFixtures'] = [item for item in report['archivedFixtures'] if item['path'] != path]
        with self.assertRaisesRegex(ArtifactError, 'runtime files absent'):
            subject.validate_build_report(report)

    def test_forged_log_cannot_claim_zero_skipped_or_incomplete_test_success(self):
        for phase, mutation in ((phase, mutation) for phase in ('source-tests', 'built-tests')
                                for mutation in ('zero-tests', 'skipped', 'missing-total', 'duplicate-total')):
            report = copy.deepcopy(self.build)
            log = next(step['log'] for step in report['steps'] if step['id'] == phase)
            text = (ROOT / log['path']).read_text()
            if mutation == 'zero-tests':
                text = re.sub(r'^# (tests|pass) \d+$', r'# \1 0', text, flags=re.MULTILINE)
            elif mutation == 'skipped':
                text = re.sub(r'^# skipped \d+$', '# skipped 1', text, flags=re.MULTILINE)
            elif mutation == 'missing-total':
                text = re.sub(r'^# todo \d+\n?', '', text, flags=re.MULTILINE)
            else:
                text += '\n# tests 1\n'
            raw = text.encode()
            log.update(sha256=subject.sha256(raw), byteLength=len(raw))
            with self.subTest(phase=phase, mutation=mutation), self.assertRaises(ArtifactError):
                subject.validate_build_report(report, lambda path: raw if path == log['path'] else (ROOT / path).read_bytes())

    def test_changed_build_authority_or_remote_claim_is_rejected(self):
        for mutation in ('authority', 'pin', 'external'):
            report = copy.deepcopy(self.build)
            if mutation == 'authority':
                report['authority']['sha256'] = '0' * 64
            elif mutation == 'pin':
                report['localDataPin']['commit'] = '0' * 40
            else:
                report['remotePinPublicationVerified'] = True
            with self.subTest(mutation=mutation), self.assertRaises(ArtifactError):
                subject.validate_build_report(report)


if __name__ == '__main__':
    unittest.main()
