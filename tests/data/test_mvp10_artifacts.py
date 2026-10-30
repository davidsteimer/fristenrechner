#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Actual R10-B artifacts and isolated mutations, never historical substitutes.

Missing definitive artifacts fail this suite. They are not skipped or replaced
by older packages. Only the explicitly named primitive class can run before
the new build. Mutations remain in memory or private temporary directories.
"""
import copy
import io
import json
from pathlib import Path
import re
import stat
import subprocess
import sys
import tempfile
import unittest
import warnings
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
import prepare_mvp10_artifacts as subject
from prepare_mvp04_artifacts import ArtifactError

RELEASE_ID = '2026-10-28-mvp-010-approved.1'
MANIFEST_SHA = '7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016'
PIN = '01bbd96a296b0fc4d64cd554acc8cb122c3017a3'
PREFIX = 'outputs/release-mvp10-2026-10-28'
OUTPUT = ROOT / PREFIX
PACKAGE = 'fristenrechner-schweiz-0.10.0.0.sppkg'
MIRROR = 'fristenrechner-mvp10-sharepoint-mirror.zip'
WEB = 'fristenrechner-mvp10-steimer-web.zip'
BASE_URL = f'https://raw.githubusercontent.com/davidsteimer/fristenrechner/{PIN}/data/releases/{RELEASE_ID}'


def checked_file(path, row):
    raw = subject.file_bytes(path)
    subject.require(len(raw) == row['byteLength'] and subject.sha256(raw) == row['sha256'], 'Changed sealed artifact/evidence')
    return raw


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


class PortableArchivePrimitiveTests(unittest.TestCase):
    def test_deterministic_archive_and_roundtrip_ignore_input_order(self):
        files = {'manifest.json': b'{}', '.htaccess': b'Options -Indexes', 'calendars/a.json': b'[]'}
        raw = subject.deterministic_zip(files)
        self.assertEqual(subject.zip_files(raw), files)
        self.assertEqual(raw, subject.deterministic_zip(dict(reversed(list(files.items())))))

    def test_unsafe_archive_names(self):
        for name in ('../bad', '/absolute', 'a/../b', 'a\\b', 'a//b', './bad'):
            with self.subTest(name=name), self.assertRaises(ArtifactError):
                subject.deterministic_zip({name: b'x'})

    def test_raw_zip_duplicate_is_rejected(self):
        stream = io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', UserWarning)
            with zipfile.ZipFile(stream, 'w') as archive:
                archive.writestr('manifest.json', b'{}')
                archive.writestr('manifest.json', b'[]')
        with self.assertRaises(ArtifactError):
            subject.zip_files(stream.getvalue())

    def test_raw_zip_symlink_and_truncation_are_rejected(self):
        stream = io.BytesIO()
        entry = zipfile.ZipInfo('link')
        entry.create_system = 3
        entry.external_attr = (stat.S_IFLNK | 0o777) << 16
        with zipfile.ZipFile(stream, 'w') as archive:
            archive.writestr(entry, b'../private')
        with self.assertRaises(ArtifactError):
            subject.zip_files(stream.getvalue())
        with self.assertRaises(ArtifactError):
            subject.zip_files(stream.getvalue()[:-10])

    def test_write_once_and_readback_protect_existing_artifact(self):
        with tempfile.TemporaryDirectory(prefix='mvp10-artifact-primitive-') as directory:
            path = Path(directory) / 'output.zip'
            subject.write_once(path, b'original')
            subject.write_once(path, b'original')
            with self.assertRaises(ArtifactError):
                subject.write_once(path, b'changed')
            self.assertEqual(path.read_bytes(), b'original')


class ActualMvp10ArtifactTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof = json.loads((OUTPUT / 'artifact-verification.json').read_bytes())
        cls.build = json.loads(checked_file(ROOT / cls.proof['buildProof']['path'], cls.proof['buildProof']))
        cls.artifacts = {Path(row['path']).name: row for row in cls.proof['artifacts']}
        cls.package = checked_file(OUTPUT / PACKAGE, cls.artifacts[PACKAGE])
        cls.mirror = subject.zip_files(checked_file(OUTPUT / MIRROR, cls.artifacts[MIRROR]))
        cls.web = subject.zip_files(checked_file(OUTPUT / WEB, cls.artifacts[WEB]))
        cls.manifest = json.loads(cls.mirror['manifest.json'])
        inputs = {row['path']: row for row in cls.build['archivedInputs']}
        cls.config = json.loads(checked_file(ROOT / inputs['spfx/config/package-solution.json']['archivedAt'], inputs['spfx/config/package-solution.json']))
        cls.htaccess = checked_file(ROOT / inputs['public-app/.htaccess']['archivedAt'], inputs['public-app/.htaccess'])

    def audit_web(self, files):
        subject.require(subject.inventory(files) == self.proof['webFiles'], 'Web sealed byte inventory differs')
        subject.inspect_web_files(files, self.manifest, self.htaccess)

    def test_actual_artifact_scope_and_all_three_bound_outputs(self):
        self.assertEqual(set(self.artifacts), {PACKAGE, MIRROR, WEB})
        self.assertEqual(self.proof['kind'], 'mvp10-local-artifact-sealing')
        self.assertEqual(self.proof['status'], 'passed')
        self.assertEqual(self.proof['localDataCommit'], PIN)
        self.assertEqual(self.proof['manifestSha256'], MANIFEST_SHA)
        self.assertEqual(self.proof['releaseId'], RELEASE_ID)
        for flag in ('installationAuthorized', 'publicationAuthorized', 'operatingApproval', 'remotePinVerified', 'realM365TestsPerformed'):
            self.assertFalse(self.proof[flag], flag)
        audit = subject.inspect_sppkg(self.package, self.config, BASE_URL)
        self.assertEqual(audit, self.proof['packageAudit'])
        self.assertEqual(audit['solutionVersion'], '0.10.0.0')
        self.assertEqual(audit['featureVersion'], '0.10.0.0')
        self.assertEqual(audit['webpartVersion'], '0.10.0')
        self.assertEqual(audit['additionalApiPermissions'], [])

    def test_all_45_mirror_files_match_runtime_and_local_git_blobs(self):
        self.assertEqual(len(self.mirror), 45)
        self.assertEqual(subject.inspect_mirror(self.mirror, MANIFEST_SHA), self.manifest)
        self.assertEqual(subject.inventory(self.mirror), self.proof['mirrorFiles'])
        for name, raw in self.mirror.items():
            path = f'data/releases/{RELEASE_ID}/{name}'
            self.assertEqual(raw, (ROOT / path).read_bytes(), name)
            blob = subprocess.run(['git', 'cat-file', 'blob', f'{PIN}:{path}'], cwd=ROOT,
                                  check=True, capture_output=True).stdout
            self.assertEqual(blob, raw, path)

    def test_mirror_missing_extra_nested_or_changed_bytes_are_rejected(self):
        mutations = []
        missing = dict(self.mirror)
        del missing['profiles/zpo.json']
        mutations.append(missing)
        mutations.append({**self.mirror, 'Userinput/private.docx': b'not a real document'})
        mutations.append({f'wrapper/{name}': raw for name, raw in self.mirror.items()})
        mutations.append({**self.mirror, 'profiles/zpo.json': self.mirror['profiles/zpo.json'] + b' '})
        for value in mutations:
            with self.assertRaises((ArtifactError, KeyError)):
                subject.inspect_mirror(value, MANIFEST_SHA)

    def test_manifest_cannot_be_resealed_to_another_release_or_consumer(self):
        for field, value in (('releaseId', 'old'), ('formatVersion', '16.0.0'), ('releaseStatus', 'candidate')):
            manifest = copy.deepcopy(self.manifest)
            manifest[field] = value
            with self.subTest(field=field), self.assertRaises(ArtifactError):
                subject.inspect_mirror({**self.mirror, 'manifest.json': encoded(manifest)}, MANIFEST_SHA)

    def test_solution_id_version_and_scope_are_not_substitutable(self):
        for field, value in (('ProductID', '00000000-0000-0000-0000-000000000001'),
                             ('Version', '0.9.0.0'), ('IsDomainIsolated', 'true'), ('IsClientSideSolution', 'false')):
            files = subject.zip_files(self.package)
            root = ET.fromstring(files['AppManifest.xml'])
            root.set(field, value)
            files['AppManifest.xml'] = ET.tostring(root)
            with self.subTest(field=field), self.assertRaises(ArtifactError):
                subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_feature_version_and_scope_must_match_the_concrete_package(self):
        for field, value in (('Version', '0.10.0.1'), ('Scope', 'Site')):
            files = subject.zip_files(self.package)
            path = f'feature_{subject.FEATURE_ID}.xml'
            root = ET.fromstring(files[path])
            root.set(field, value)
            files[path] = ET.tostring(root)
            with self.assertRaises(ArtifactError):
                subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_api_and_package_permissions_are_rejected(self):
        config = copy.deepcopy(self.config)
        config['solution']['webApiPermissionRequests'] = [{'resource': 'Microsoft Graph', 'scope': 'User.Read'}]
        with self.assertRaises(ArtifactError):
            subject.inspect_sppkg(self.package, config, BASE_URL)
        files = subject.zip_files(self.package)
        root = ET.fromstring(files['AppManifest.xml'])
        ET.SubElement(root, 'AppPermissionRequest', {'Scope': 'unapproved'})
        files['AppManifest.xml'] = ET.tostring(root)
        with self.assertRaises(ArtifactError):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_immutable_data_pin_cannot_be_substituted(self):
        with self.assertRaises(ArtifactError):
            subject.inspect_sppkg(self.package, self.config, BASE_URL.replace(PIN, '0' * 40))

    def test_package_development_files_and_external_relationships_are_rejected(self):
        for name in ('private.key', 'private.pem', 'assets/debug.js.map', 'private.ts'):
            with self.subTest(name=name), self.assertRaises(ArtifactError):
                subject.inspect_sppkg(subject.deterministic_zip({**subject.zip_files(self.package), name: b'x'}), self.config, BASE_URL)
        files = subject.zip_files(self.package)
        path = next(name for name in files if name.endswith('.rels'))
        root = ET.fromstring(files[path])
        relationship = next(item for item in root.iter() if subject.local_name(item.tag) == 'Relationship')
        relationship.set('TargetMode', 'External')
        relationship.set('Target', 'https://unapproved.invalid/x')
        files[path] = ET.tostring(root)
        with self.assertRaises(ArtifactError):
            subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_package_bundle_and_license_are_required(self):
        for suffix in ('', '.LICENSE.txt'):
            files = subject.zip_files(self.package)
            del files[self.proof['packageAudit']['bundlePath'] + suffix]
            with self.assertRaises(ArtifactError):
                subject.inspect_sppkg(subject.deterministic_zip(files), self.config, BASE_URL)

    def test_actual_web_zip_and_all_static_readback_files_are_identical(self):
        self.assertEqual(len(self.web), 12)
        self.audit_web(self.web)
        static = subject.file_tree(OUTPUT / 'web-build')
        self.assertEqual(static, self.web)
        self.assertEqual(self.web['.htaccess'], self.htaccess)

    def test_every_sealed_web_byte_and_exact_resource_closure_are_required(self):
        for name in self.web:
            with self.subTest(name=name), self.assertRaises(ArtifactError):
                self.audit_web({**self.web, name: self.web[name] + b' '})
        missing = dict(self.web)
        del missing['favicon.svg']
        for value in (missing, {**self.web, 'extra.json': b'{}'}):
            with self.assertRaises(ArtifactError):
                self.audit_web(value)

    def test_web_metadata_cannot_change_version_release_or_hosting_destination(self):
        for key, value in (('version', '0.9.0'), ('dataReleaseId', 'old'), ('basePath', '/other/'),
                           ('canonicalUrl', 'https://unapproved.invalid/'), ('deployable', False), ('status', 'candidate')):
            metadata = json.loads(self.web['build-manifest.json'])
            metadata[key] = value
            with self.subTest(key=key), self.assertRaises(ArtifactError):
                subject.inspect_web_files({**self.web, 'build-manifest.json': encoded(metadata)}, self.manifest, self.htaccess)

    def test_web_hosting_configuration_is_not_rewritten(self):
        with self.assertRaises(ArtifactError):
            subject.inspect_web_files({**self.web, '.htaccess': b'Options +Indexes'}, self.manifest, self.htaccess)

    def test_actual_closed_build_report_is_accepted(self):
        result = subject.validate_build_report(self.build)
        self.assertEqual(result['status'], 'passed')
        self.assertEqual(result['steps'], 7)
        self.assertEqual(result['runtimeFiles'], 45)
        for counts in result['testCounts'].values():
            self.assertGreater(counts['tests'], 0)
            self.assertEqual(counts['tests'], counts['pass'])
            self.assertTrue(all(counts[key] == 0 for key in ('fail', 'cancelled', 'skipped', 'todo')))

    def test_build_steps_must_be_complete_ordered_and_successful(self):
        for kind in ('empty', 'missing', 'reverse', 'duplicate', 'failed', 'signal'):
            report = copy.deepcopy(self.build)
            if kind == 'empty': report['steps'] = []
            elif kind == 'missing': report['steps'].pop()
            elif kind == 'reverse': report['steps'].reverse()
            elif kind == 'duplicate': report['steps'].append(report['steps'][0])
            elif kind == 'failed': report['steps'][1]['exitCode'] = 1
            else: report['steps'][1]['signal'] = 'SIGTERM'
            with self.subTest(kind=kind), self.assertRaises(ArtifactError):
                subject.validate_build_report(report)

    def test_required_and_nonminimum_archived_input_cannot_be_jointly_removed(self):
        optional = next(row['path'] for row in self.build['inputs'] if row['path'].startswith('src/ui/')
                        and row['path'] not in subject.MINIMUM_INPUTS)
        for path in ('src/release/mvp10ReleaseData.ts', optional):
            report = copy.deepcopy(self.build)
            report['inputs'] = [row for row in report['inputs'] if row['path'] != path]
            report['archivedInputs'] = [row for row in report['archivedInputs'] if row['path'] != path]
            with self.subTest(path=path), self.assertRaises(ArtifactError):
                subject.validate_build_report(report)

    def test_runtime_fixture_cannot_be_jointly_removed_from_both_archived_lists(self):
        path = f'data/releases/{RELEASE_ID}/administrative-procedures/ch-cantonal-administrative-procedures.json'
        report = copy.deepcopy(self.build)
        report['fixtures'] = [row for row in report['fixtures'] if row['path'] != path]
        report['archivedFixtures'] = [row for row in report['archivedFixtures'] if row['path'] != path]
        with self.assertRaises(ArtifactError):
            subject.validate_build_report(report)

    def test_plan_binding_and_actual_data_pin_cannot_be_replaced(self):
        for kind in ('plan', 'commit', 'manifest', 'publication'):
            report = copy.deepcopy(self.build)
            if kind == 'plan': report['buildPlan']['sha256'] = '0' * 64
            elif kind == 'commit': report['localDataPin']['commit'] = '0' * 40
            elif kind == 'manifest': report['localDataPin']['manifestSha256'] = '0' * 64
            else: report['localDataPin']['publicationVerified'] = True
            with self.subTest(kind=kind), self.assertRaises(ArtifactError):
                subject.validate_build_report(report)

    def test_archived_input_readback_is_exact(self):
        row = next(item for item in self.build['archivedInputs'] if item['path'] == 'src/core/format17CalculationData.ts')
        original = (ROOT / row['archivedAt']).read_bytes()
        with self.assertRaises(ArtifactError):
            subject.validate_build_report(self.build, lambda path: original + b' ' if path == row['archivedAt'] else (ROOT / path).read_bytes())

    def test_failed_skipped_zero_or_ambiguous_test_totals_cannot_be_resealed(self):
        for phase in ('source-tests', 'built-tests'):
            for kind in ('zero', 'skip', 'missing', 'duplicate', 'not-ok'):
                report = copy.deepcopy(self.build)
                log = next(step['log'] for step in report['steps'] if step['id'] == phase)
                text = (ROOT / log['path']).read_text()
                if kind == 'zero': text = re.sub(r'^# (tests|pass) \d+$', r'# \1 0', text, flags=re.M)
                elif kind == 'skip': text = re.sub(r'^# skipped \d+$', '# skipped 1', text, flags=re.M)
                elif kind == 'missing': text = re.sub(r'^# todo \d+\n?', '', text, flags=re.M)
                elif kind == 'duplicate': text += '\n# tests 1\n'
                else: text += '\nnot ok 999 - forged failure\n'
                raw = text.encode()
                log.update(sha256=subject.sha256(raw), byteLength=len(raw))
                with self.subTest(phase=phase, kind=kind), self.assertRaises(ArtifactError):
                    subject.validate_build_report(report, lambda path: raw if path == log['path'] else (ROOT / path).read_bytes())

    def test_wrong_authority_or_remote_scope_claim_is_rejected(self):
        for kind in ('authority', 'remote', 'installation', 'publication'):
            report = copy.deepcopy(self.build)
            if kind == 'authority': report['authority']['sha256'] = '0' * 64
            elif kind == 'remote': report['remotePinPublicationVerified'] = True
            elif kind == 'installation': report['installationAuthorized'] = True
            else: report['publicationAuthorized'] = True
            with self.subTest(kind=kind), self.assertRaises(ArtifactError):
                subject.validate_build_report(report)


if __name__ == '__main__':
    unittest.main()
