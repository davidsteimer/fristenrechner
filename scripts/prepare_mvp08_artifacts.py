#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Seal R08-B local artifacts. No build, network, commit or deployment."""
from __future__ import annotations
import io
import json
import re
import stat
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any
from prepare_mvp04_artifacts import require, sha256, file_bytes, safe_name, inventory, zip_files, local_name, SOLUTION_ID, FEATURE_ID, WEBPART_ID
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'outputs/release-mvp08-2026-10-15'
RELEASE_ID = '2026-10-15-mvp-08-approved.1'
RELEASE = ROOT / 'data/releases' / RELEASE_ID
MANIFEST_SHA256 = '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4'
PIN_COMMIT = '10a99419eaabb3e96d2acccf0c7a93e2fe6472cb'
OUTPUT_RELATIVE = 'outputs/release-mvp08-2026-10-15'
BUILD_STEPS = ['sync', 'source-tests', 'compile', 'css-audit', 'package', 'built-tests', 'web-build']
MINIMUM_PRODUCT_INPUTS = {
    'package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json', 'spfx/tsconfig.json',
    'src/release/mvp08ReleaseData.ts', 'src/public-app/main.tsx', 'src/core/format8CalculationData.ts',
    'schemas/release-manifest-v8.schema.json', 'schemas/administrative-procedure-catalog.schema.json',
    'spfx/config/package-solution.json', 'spfx/src/core/config.ts',
    'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json',
    'scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs', 'scripts/build-mvp08-artifacts.mjs',
    'public-app/.htaccess'
}
def bound(path):
    raw = file_bytes(path)
    return {'path': path.relative_to(ROOT).as_posix(), 'byteLength': len(raw), 'sha256': sha256(raw)}
def write_once(path, raw):
    if path.exists():
        require(file_bytes(path) == raw, f'Refusing overwrite: {path}')
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        stream.write(raw)
    require(file_bytes(path) == raw, 'Readback mismatch')
def deterministic_zip(files):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, raw in sorted(files.items()):
            entry = zipfile.ZipInfo(safe_name(name), (2026,10,15,0,0,0))
            entry.create_system = 3
            entry.external_attr = (stat.S_IFREG | 0o644) << 16
            entry.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(entry, raw, compresslevel=9)
    result = stream.getvalue()
    require(zip_files(result) == files, 'ZIP readback differs')
    return result
def file_tree(directory):
    result = {}
    for path in directory.rglob('*'):
        require(not path.is_symlink(), 'Symlink in artifact tree')
        if path.is_file():
            result[path.relative_to(directory).as_posix()] = file_bytes(path)
    return result
def inspect_sppkg(data: bytes, config: dict[str, Any], base_url: str) -> dict[str, Any]:
    files = zip_files(data)
    app = ET.fromstring(files["AppManifest.xml"])
    require(app.get("ProductID") == SOLUTION_ID and app.get("Version") == "0.8.0.0", "Wrong solution identity/version")
    require(app.get("IsDomainIsolated") == "false" and app.get("IsClientSideSolution") == "true", "Unexpected application scope")
    solution = config["solution"]
    require(solution.get("id") == SOLUTION_ID and solution.get("version") == "0.8.0.0", "Source/build solution mismatch")
    require(solution.get("includeClientSideAssets") is True and not solution.get("webApiPermissionRequests")
            and not config.get("webApiPermissionRequests"), "Unexpected API permission requests or absent client assets")
    require(len(solution.get("features", [])) == 1 and solution["features"][0]["id"] == FEATURE_ID
            and solution["features"][0]["version"] == "0.8.0.0", "Wrong feature configuration")
    feature = ET.fromstring(files[f"feature_{FEATURE_ID}.xml"])
    require(feature.get("Id") == FEATURE_ID and feature.get("Version") == "0.8.0.0" and feature.get("Scope") == "Web", "Wrong built feature")
    components = []
    for name, content in files.items():
        require(not name.endswith((".map", ".ts", ".tsx", ".pem", ".key")), f"Private/development artifact: {name}")
        if name.endswith((".xml", ".rels")):
            for element in ET.fromstring(content).iter():
                require("permission" not in local_name(element.tag).lower(), f"Unexpected permission in {name}")
                if local_name(element.tag) == "ClientSideComponent":
                    components.append(element)
                if local_name(element.tag) == "Relationship":
                    require(element.get("TargetMode", "Internal") == "Internal"
                            and element.get("Target", "").lstrip("/") in files, "External or unresolved package relationship")
    require(len(components) == 1 and components[0].get("Id") == WEBPART_ID, "Wrong component inventory")
    manifest = json.loads(components[0].attrib["ComponentManifest"])
    require(manifest.get("id") == WEBPART_ID and manifest.get("version") == "0.8.0", "Wrong webpart version")
    require(manifest.get("supportedHosts") == ["SharePointWebPart", "TeamsTab"], "Unexpected hosts")
    entries = manifest.get("preconfiguredEntries", [])
    require(len(entries) == 1 and entries[0].get("properties") == {"providerKind": "github", "githubBaseUrl": base_url,
            "sharePointMirrorPath": ""}, "Wrong immutable default pin")
    bundle = "ClientSideAssets/" + manifest["loaderConfig"]["scriptResources"]["fristenrechner-web-part"]["path"]
    require(bundle in files and bundle + ".LICENSE.txt" in files, "Bundle or licence missing")
    for marker in [base_url, RELEASE_ID, '"8.0.0"', '"3.0.0"', '"2.0.0"', "ch-holiday-catalog", "ch-social-procedures"]:
        require(marker in files[bundle].decode(), f"Missing built consumer marker: {marker}")
    return {"solutionVersion": "0.8.0.0", "featureVersion": "0.8.0.0", "webpartVersion": "0.8.0",
        "solutionId": SOLUTION_ID, "featureId": FEATURE_ID, "webpartId": WEBPART_ID, "additionalApiPermissions": [],
        "defaultGithubBaseUrl": base_url, "bundlePath": bundle, "bundleSha256": sha256(files[bundle]), "entries": inventory(files)}


def inspect_web_files(files: dict[str, bytes], manifest: dict[str, Any], htaccess: bytes) -> None:
    build = json.loads(files["build-manifest.json"])
    require(build.get("application") == "fristenrechner-public" and build.get("version") == "0.8.0"
            and build.get("dataReleaseId") == RELEASE_ID and build.get("deployable") is not False, "Wrong web release metadata")
    require(build.get("basePath") == "/fristenrechner/" and build.get("canonicalUrl") == "https://www.steimer.ch/fristenrechner/", "Wrong hosting target")
    resources = [build["assets"]["javascript"], build["assets"]["stylesheet"], *build["assets"]["vendors"].values()]
    require(len(set(resources)) == 5, "Wrong asset count")
    names = [safe_name(value.removeprefix("./")) for value in resources]
    require(all(re.fullmatch(r"assets/[A-Za-z0-9-]+\.(js|css)", name) for name in names), "Unsafe asset path")
    expected = {"index.html", ".htaccess", "favicon.svg", "build-manifest.json", *names,
                "licenses/react-MIT.txt", "licenses/react-dom-MIT.txt", "licenses/fluent-ui-MIT.txt"}
    require(set(files) == expected, "Unexpected web inventory")
    require(all(value in files["index.html"].decode() for value in resources), "Missing HTML resource link")
    require(files[".htaccess"] == htaccess and b"connect-src 'none'" in htaccess and b"Options -Indexes" in htaccess,
            "Hosting configuration changed or incomplete")
    script = files[names[0]].decode()
    require(RELEASE_ID in script, "Wrong embedded data release")
    require(all(item["sha256"] in script for item in manifest["artifacts"]), "Missing embedded artifact hash")
    require(all(b"Permission is hereby granted" in files[name] for name in expected if name.startswith("licenses/")), "Missing licence")



def inspect_mirror(files, expected_hash):
    require(len(files) == 42 and sha256(files['manifest.json']) == expected_hash, 'Wrong mirror inventory/manifest')
    manifest = json.loads(files['manifest.json'])
    require(manifest['releaseId'] == RELEASE_ID and manifest['formatVersion'] == '8.0.0'
            and manifest['releaseStatus'] == 'approved', 'Wrong data release')
    require(set(files) == {'manifest.json', *(row['path'] for row in manifest['artifacts'])}, 'Mirror inventory differs')
    for row in manifest['artifacts']:
        require(sha256(files[row['path']]) == row['sha256'] and len(files[row['path']]) == row['byteLength'],
                'Altered mirror bytes')
    return manifest


def validate_build_report(report, read=None):
    """Reject partial, weakened or unbound build receipts before sealing ZIPs.

    The reader resolves only explicit bound archive paths. It can be replaced
    with a synthetic in-memory overlay for negative tests, never a fallback.
    """
    if read is None:
        read = lambda path: file_bytes(ROOT / path)
    require(report.get('kind') == 'mvp08-local-product-build' and report.get('status') == 'passed', 'Build not passed')
    require(report.get('releaseId') == RELEASE_ID and report.get('applicationVersion') == '0.8.0'
            and report.get('packageVersion') == '0.8.0.0', 'Wrong build release versions')
    for flag in ('installationAuthorized', 'publicationAuthorized', 'actualM365TestsPerformed', 'remotePinPublicationVerified'):
        require(report.get(flag) is False, 'Build receipt claims unapproved external action')
    require(report.get('manifest', {}).get('path') == f'data/releases/{RELEASE_ID}/manifest.json'
            and report.get('manifest', {}).get('sha256') == MANIFEST_SHA256, 'Build uses another data manifest')
    pin = report.get('localDataPin', {})
    require(pin.get('commit') == PIN_COMMIT and pin.get('releaseId') == RELEASE_ID
            and pin.get('manifestSha256') == MANIFEST_SHA256
            and pin.get('localOnly') is True and pin.get('publicationVerified') is False, 'Wrong local immutable pin')
    authority = report.get('authority', {})
    require(authority == {'path': f'{OUTPUT_RELATIVE}/r08b-execution-approval.json',
            'sha256': '5efaec306598ee0c9f9ed5ff47c6c3ee3ce21697fc0f089c8abbb4ad4d0e3c66'},
            'Build authority is not the approved R08-B decision')

    def regular_binding(item):
        require(isinstance(item, dict) and {'path', 'sha256', 'byteLength'} <= set(item), 'Incomplete build input binding')
        safe_name(item['path'])
        require(re.fullmatch(r'[0-9a-f]{64}', item['sha256']) is not None
                and type(item['byteLength']) is int and item['byteLength'] >= 0, 'Malformed build input binding')
        private_test_program = item['path'] == 'tests/private/mvp06_mirror_git_audit.py'
        require((private_test_program or not re.search(r'(?:^|/)(?:\.work|\.git|\.env|Userinput|private|node_modules)(?:/|$)|\.private\.', item['path']))
                and not item['path'].endswith(('.pem', '.key')), 'Private or unrelated build input')

    product_paths, fixture_paths = set(), set()
    for collection, archive_collection, archive_folder, paths in (
            ('inputs', 'archivedInputs', 'inputs', product_paths),
            ('fixtures', 'archivedFixtures', 'fixtures', fixture_paths)):
        originals = report.get(collection, [])
        archived = report.get(archive_collection, [])
        require(originals and len(archived) == len(originals), f'Incomplete {archive_collection}')
        by_path = {}
        for item in originals:
            regular_binding(item)
            require(item['path'] not in by_path, 'Duplicate build input')
            by_path[item['path']] = item
            paths.add(item['path'])
        require(len({item.get('path') for item in archived}) == len(archived), 'Duplicate archived input')
        for item in archived:
            regular_binding(item)
            require({key: value for key, value in item.items() if key != 'archivedAt'} == by_path.get(item['path']),
                    'Archive differs from captured input binding')
            require(item['archivedAt'] == f'{OUTPUT_RELATIVE}/build-evidence/{archive_folder}/{item["path"]}',
                    'Archive path does not match its captured input')
            raw = read(item['archivedAt'])
            require(len(raw) == item['byteLength'] and sha256(raw) == item['sha256'], 'Archived input changed')
    require(MINIMUM_PRODUCT_INPUTS <= product_paths, 'Required product input is absent')
    allowed_product_roots = ('src/core/', 'src/ui/', 'src/public-app/', 'schemas/', 'spfx/config/',
                             'spfx/src/core/', 'spfx/src/webparts/', 'spfx/scripts/', 'spfx/test/',
                             'spfx/test-build/', 'public-app/')
    require(all(path in MINIMUM_PRODUCT_INPUTS or path.startswith(allowed_product_roots) for path in product_paths)
            and not any(path.startswith('src/ui/preview/') for path in product_paths), 'Unrelated product input')
    require(any(path.startswith('spfx/test/') and path.endswith('.test.ts') for path in product_paths)
            and any(path.startswith('spfx/test-build/') and path.endswith('.test.cjs') for path in product_paths),
            'Source/package test inputs missing')
    require(all(path.startswith(('data/', 'tests/', 'outputs/ap22c3-2026-10-08/bundle/',
                                 'outputs/ap23d2-candidate-2026-10-15/bundle/')) for path in fixture_paths),
            'Unrelated or private fixture root')
    runtime = report.get('runtimeFiles', [])
    require(len(runtime) == 42 and len({item.get('path') for item in runtime}) == 42, 'Incomplete runtime input closure')
    require({item['path'] for item in runtime} <= fixture_paths, 'Approved runtime files absent from fixture archive')
    raw_manifest = read(f'{OUTPUT_RELATIVE}/build-evidence/fixtures/data/releases/{RELEASE_ID}/manifest.json')
    require(sha256(raw_manifest) == MANIFEST_SHA256, 'Archived release manifest changed')
    manifest = json.loads(raw_manifest)
    expected_runtime = {f'data/releases/{RELEASE_ID}/manifest.json': (MANIFEST_SHA256, len(raw_manifest)),
                        **{f'data/releases/{RELEASE_ID}/{row["path"]}': (row['sha256'], row['byteLength'])
                           for row in manifest['artifacts']}}
    require({item['path']: (item['sha256'], item['byteLength']) for item in runtime} == expected_runtime,
            'Runtime input descriptor differs from approved manifest')
    require({'tests/golden/candidates/ap23b-administrative.json',
             'outputs/ap22c3-2026-10-08/bundle/manifest.json',
             'outputs/ap23d2-candidate-2026-10-15/bundle/manifest.json'} <= fixture_paths,
            'Required compatibility/reference fixtures missing')

    steps = report.get('steps', [])
    require([step.get('id') for step in steps] == BUILD_STEPS, 'Incomplete, repeated or reordered build steps')
    stage_name = report.get('stage', '').removeprefix('.work/')
    require(re.fullmatch(r'mvp08-product-build-[A-Za-z0-9]+', stage_name) is not None, 'Unexpected isolated build stage')
    test_counts = {}
    for step in steps:
        require(type(step.get('exitCode')) is int and step['exitCode'] == 0 and step.get('signal') is None,
                'Failed or interrupted build step')
        log = step.get('log', {})
        regular_binding(log)
        require(log['path'] == f'{OUTPUT_RELATIVE}/build-evidence/logs/{stage_name}-{step["id"]}.log',
                'Build log belongs to another step/stage')
        raw = read(log['path'])
        require(len(raw) == log['byteLength'] and sha256(raw) == log['sha256'], 'Build log changed')
        if step['id'] in ('source-tests', 'built-tests'):
            counts = {}
            for key in ('tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'):
                matches = re.findall(rf'^# {key} (\d+)\r?$', raw.decode('utf-8'), re.MULTILINE)
                require(len(matches) == 1, 'Missing or ambiguous test totals')
                counts[key] = int(matches[0])
            require(counts['tests'] > 0 and counts['tests'] == counts['pass']
                    and all(counts[key] == 0 for key in ('fail', 'cancelled', 'skipped', 'todo')),
                    'Incomplete, failed or skipped tests')
            test_counts[step['id']] = counts
    return {'status': 'passed', 'steps': len(steps), 'productInputs': len(product_paths),
            'fixtures': len(fixture_paths), 'runtimeFiles': 42, 'testCounts': test_counts}


def main():
    require(len(sys.argv) == 1, 'No installation or overwrite options')
    approval = json.loads(file_bytes(OUTPUT / 'r08b-execution-approval.json'))
    require(sha256(file_bytes(OUTPUT / 'r08b-execution-approval.json')) ==
            '5efaec306598ee0c9f9ed5ff47c6c3ee3ce21697fc0f089c8abbb4ad4d0e3c66', 'Changed authority')
    require(approval['permissions']['definitiveLocalBuildAuthorized'] is True, 'No local build authority')
    report = json.loads(file_bytes(OUTPUT / 'product-build.json'))
    build_audit = validate_build_report(report)
    pin = json.loads(file_bytes(OUTPUT / 'local-data-pin.json'))
    mirror = file_tree(RELEASE)
    manifest = inspect_mirror(mirror, pin['manifestSha256'])
    for name, raw in mirror.items():
        pinned = subprocess.run(['git','cat-file','blob',f"{pin['commit']}:data/releases/{RELEASE_ID}/{name}"],
                                cwd=ROOT, check=True, capture_output=True).stdout
        require(pinned == raw, 'Mirror differs from local data commit')
    base_url = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{pin['commit']}/data/releases/{RELEASE_ID}"
    package = OUTPUT / 'fristenrechner-schweiz-0.8.0.0.sppkg'
    require(bound(package) == report['package'], 'Actual package differs')
    config = json.loads(file_bytes(ROOT / 'spfx/config/package-solution.json'))
    package_audit = inspect_sppkg(file_bytes(package), config, base_url)
    web = file_tree(OUTPUT / 'web-build')
    require(inventory(web) == [{**entry, 'path': entry['path'].split('/web-build/',1)[1]} for entry in report['webFiles']],
            'Actual web output differs from passed build')
    inspect_web_files(web, manifest, file_bytes(ROOT / 'public-app/.htaccess'))
    artifacts = [bound(package)]
    for name, files in [('fristenrechner-mvp08-sharepoint-mirror.zip',mirror), ('fristenrechner-mvp08-steimer-web.zip',web)]:
        write_once(OUTPUT / name, deterministic_zip(files))
        require(zip_files(file_bytes(OUTPUT / name)) == files, 'Final ZIP bytes differ')
        artifacts.append(bound(OUTPUT / name))
    receipt = {'kind':'mvp08-local-artifact-sealing','status':'passed','releaseId':RELEASE_ID,
               'applicationVersion':'0.8.0','packageVersion':'0.8.0.0','localDataCommit':pin['commit'],
               'manifestSha256':pin['manifestSha256'],'authority':bound(OUTPUT / 'r08b-execution-approval.json'),
               'buildProof':bound(OUTPUT / 'product-build.json'),'buildAudit':build_audit,'packageAudit':package_audit,
               'mirrorFiles':inventory(mirror),'webFiles':inventory(web),'artifacts':artifacts,
               'installationAuthorized':False,'publicationAuthorized':False,'operatingApproval':False,
               'remotePinVerified':False,'realM365TestsPerformed':False}
    write_once(OUTPUT / 'artifact-verification.json', (json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps({'status':'passed','artifacts':artifacts,'proof':bound(OUTPUT / 'artifact-verification.json')}))
if __name__ == '__main__':
    main()
