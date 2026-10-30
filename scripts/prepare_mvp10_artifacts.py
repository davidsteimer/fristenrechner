#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Verify and seal actual local R10-B artifacts. No build or external action."""
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
from prepare_mvp04_artifacts import require, sha256, file_bytes, safe_name, inventory, zip_files, local_name, SOLUTION_ID, FEATURE_ID, WEBPART_ID

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'outputs/release-mvp10-2026-10-28'
OUTPUT = ROOT / PREFIX
RELEASE_ID = '2026-10-28-mvp-010-approved.1'
RELEASE = ROOT / 'data/releases' / RELEASE_ID
BUILD_STEPS = ['sync', 'source-tests', 'compile', 'css-audit', 'package', 'built-tests', 'web-build']
AUTHORITY_SHA = '595664f96384230fa8941ae1ac3b388c1d213f38596fe9913785966ed45e2e5c'
PIN_COMMIT = '01bbd96a296b0fc4d64cd554acc8cb122c3017a3'
MANIFEST_SHA256 = '7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016'
MINIMUM_INPUTS = {'package.json','package-lock.json','tsconfig.json','spfx/package.json','spfx/package-lock.json','spfx/tsconfig.json','spfx/eslint.config.js','spfx/src/declarations.d.ts','src/release/mvp10ReleaseData.ts','src/public-app/main.tsx','src/core/format17CalculationData.ts','src/core/administrativeCatalogV10.ts','schemas/release-manifest-v17.schema.json','schemas/administrative-procedure-catalog-v10.schema.json','spfx/config/package-solution.json','spfx/src/core/config.ts','spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json','scripts/build-public-app.mjs','scripts/browser-globals-plugin.mjs','scripts/build-mvp10-artifacts.mjs','public-app/.htaccess',f'spfx/teams/{WEBPART_ID}_color.png',f'spfx/teams/{WEBPART_ID}_outline.png','spfx/test-build/mvp10-harness.cjs','spfx/test-build/mvp10-consumer.test.cjs','spfx/test-build/mvp10-export.test.cjs'}

def bound(path):
    raw = file_bytes(path)
    return {'path': path.relative_to(ROOT).as_posix(), 'byteLength': len(raw), 'sha256': sha256(raw)}

def exact(item, read, path=None):
    require(isinstance(item, dict) and {'path','sha256','byteLength'} <= set(item), 'Incomplete binding')
    safe_name(item['path'])
    require(re.fullmatch('[a-f0-9]{64}',item['sha256']) is not None, 'Malformed hash')
    raw = read(path or item['path'])
    require(len(raw) == item['byteLength'] and sha256(raw) == item['sha256'], 'Changed binding '+item['path'])
    return raw

def write_once(path, data):
    if path.exists():
        require(file_bytes(path) == data, 'Refusing overwrite '+str(path))
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        stream.write(data)
    require(file_bytes(path) == data, 'Readback mismatch')

def file_tree(directory):
    result = {}
    for path in directory.rglob('*'):
        require(not path.is_symlink(), 'Symlink in artifact')
        if path.is_file():
            result[path.relative_to(directory).as_posix()] = file_bytes(path)
    return result

def deterministic_zip(files):
    output = io.BytesIO()
    with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for name, raw in sorted(files.items()):
            item = zipfile.ZipInfo(safe_name(name),(2026,10,28,0,0,0))
            item.create_system = 3
            item.external_attr = (stat.S_IFREG | 0o644) << 16
            item.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(item,raw,compresslevel=9)
    data = output.getvalue()
    require(zip_files(data) == files, 'ZIP readback mismatch')
    return data

def inspect_mirror(files, expected_hash):
    require(len(files) == 45 and sha256(files['manifest.json']) == expected_hash, 'Wrong mirror count/hash')
    manifest = json.loads(files['manifest.json'])
    require(manifest['releaseId'] == RELEASE_ID and manifest['formatVersion'] == '17.0.0' and manifest['releaseStatus'] == 'approved', 'Wrong approved release')
    require(len(manifest['artifacts']) == 44 and len(manifest['calendarIds']) == 35, 'Wrong release inventory')
    require(set(files) == {'manifest.json',*(row['path'] for row in manifest['artifacts'])}, 'Mirror closure differs')
    for row in manifest['artifacts']:
        require(len(files[row['path']]) == row['byteLength'] and sha256(files[row['path']]) == row['sha256'], 'Altered runtime bytes')
    return manifest

def inspect_sppkg(data, config, base_url):
    files = zip_files(data)
    app = ET.fromstring(files['AppManifest.xml'])
    require(app.get('ProductID') == SOLUTION_ID and app.get('Version') == '0.10.0.0', 'Wrong solution identity/version')
    require(app.get('IsDomainIsolated') == 'false' and app.get('IsClientSideSolution') == 'true', 'Unexpected app scope')
    solution = config['solution']
    require(solution['id'] == SOLUTION_ID and solution['version'] == '0.10.0.0', 'Source/solution mismatch')
    require(solution['includeClientSideAssets'] is True and not solution.get('webApiPermissionRequests') and not config.get('webApiPermissionRequests'), 'Unexpected API scope')
    require(len(solution['features']) == 1 and solution['features'][0]['id'] == FEATURE_ID and solution['features'][0]['version'] == '0.10.0.0', 'Wrong feature config')
    feature = ET.fromstring(files[f'feature_{FEATURE_ID}.xml'])
    require(feature.get('Id') == FEATURE_ID and feature.get('Version') == '0.10.0.0' and feature.get('Scope') == 'Web', 'Wrong feature bytes')
    components = []
    for name, raw in files.items():
        require(not name.endswith(('.map','.ts','.tsx','.pem','.key')), 'Development/private package entry')
        if name.endswith(('.xml','.rels')):
            for element in ET.fromstring(raw).iter():
                require('permission' not in local_name(element.tag).lower(), 'Unexpected permission')
                if local_name(element.tag) == 'ClientSideComponent':
                    components.append(element)
                if local_name(element.tag) == 'Relationship':
                    require(element.get('TargetMode','Internal') == 'Internal' and element.get('Target','').lstrip('/') in files, 'External/missing relationship')
    require(len(components) == 1 and components[0].get('Id') == WEBPART_ID, 'Wrong component closure')
    manifest = json.loads(components[0].attrib['ComponentManifest'])
    require(manifest['id'] == WEBPART_ID and manifest['version'] == '0.10.0' and manifest['supportedHosts'] == ['SharePointWebPart','TeamsTab'], 'Wrong component/hosts')
    require(len(manifest['preconfiguredEntries']) == 1 and manifest['preconfiguredEntries'][0]['properties'] == {'providerKind':'github','githubBaseUrl':base_url,'sharePointMirrorPath':''}, 'Wrong immutable pin')
    bundle = 'ClientSideAssets/'+manifest['loaderConfig']['scriptResources']['fristenrechner-web-part']['path']
    require(bundle in files and bundle+'.LICENSE.txt' in files, 'Missing bundle/licence')
    for token in [base_url,RELEASE_ID,'"17.0.0"','ch-social-procedures','ch-cantonal-administrative-procedures','vs-court-ordered','ne-admin-ordered']:
        require(token in files[bundle].decode(), 'Missing built consumer marker '+token)
    return {'solutionVersion':'0.10.0.0','featureVersion':'0.10.0.0','webpartVersion':'0.10.0','solutionId':SOLUTION_ID,'featureId':FEATURE_ID,'webpartId':WEBPART_ID,'additionalApiPermissions':[],'defaultGithubBaseUrl':base_url,'bundlePath':bundle,'bundleSha256':sha256(files[bundle]),'entries':inventory(files)}

def inspect_web_files(files, manifest, htaccess):
    build = json.loads(files['build-manifest.json'])
    require(build['application'] == 'fristenrechner-public' and build['version'] == '0.10.0' and build['dataReleaseId'] == RELEASE_ID and build.get('deployable') is not False and build.get('status') != 'candidate', 'Wrong normal web metadata')
    require(build['basePath'] == '/fristenrechner/' and build['canonicalUrl'] == 'https://www.steimer.ch/fristenrechner/', 'Wrong hosting target')
    resources = [build['assets']['javascript'],build['assets']['stylesheet'],*build['assets']['vendors'].values()]
    require(len(set(resources)) == 5, 'Wrong asset count')
    names = [safe_name(value.removeprefix('./')) for value in resources]
    require(all(re.fullmatch(r'assets/[A-Za-z0-9-]+\.(?:js|css)',name) for name in names), 'Unsafe asset path')
    require(set(files) == {'index.html','.htaccess','favicon.svg','build-manifest.json',*names,'licenses/react-MIT.txt','licenses/react-dom-MIT.txt','licenses/fluent-ui-MIT.txt'}, 'Wrong web closure')
    require(all(value in files['index.html'].decode() for value in resources), 'Missing resource link')
    require(files['.htaccess'] == htaccess, 'Hosting bytes changed')
    script = files[names[0]].decode()
    require(RELEASE_ID in script and all(row['sha256'] in script for row in manifest['artifacts']), 'Wrong embedded artifact closure')
    require(not re.search(r'\bfetch\s*\(|new XMLHttpRequest|new WebSocket|qaPresets',script), 'External runtime or QA activation')
    require(all(b'Permission is hereby granted' in files[name] for name in files if name.startswith('licenses/')), 'Missing licence')

def validate_build_report(report, read=None):
    read = read or (lambda path:file_bytes(ROOT/path))
    require(report.get('kind') == 'mvp10-local-product-build' and report.get('status') == 'passed', 'Build not passed')
    require(report['applicationVersion'] == '0.10.0' and report['packageVersion'] == '0.10.0.0' and report['releaseId'] == RELEASE_ID, 'Wrong build versions')
    for flag in ['installationAuthorized','publicationAuthorized','actualM365TestsPerformed','remotePinPublicationVerified']:
        require(report.get(flag) is False, 'Unapproved external action')
    require(report['authority'] == {'path':PREFIX+'/r10b-execution-approval.json','sha256':AUTHORITY_SHA}, 'Wrong execution authority')
    require(report['localDataPin']['releaseId'] == RELEASE_ID and report['localDataPin']['localOnly'] is True and report['localDataPin']['publicationVerified'] is False, 'Wrong local data pin')
    require(report['localDataPin']['commit'] == PIN_COMMIT and report['localDataPin']['manifestSha256'] == MANIFEST_SHA256, 'Wrong authorized actual commit/manifest')
    require(report['localDataPin'] == json.loads(read(PREFIX+'/local-data-pin.json')), 'Build pin differs from actual local commit receipt')
    require(report['manifest']['sha256'] == report['localDataPin']['manifestSha256'], 'Pin/manifest mismatch')
    build_plan_ref = report.get('buildPlan',{})
    require(re.fullmatch(re.escape(PREFIX)+r'/build-evidence/plans/mvp10-spfx-build-[A-Za-z0-9]+\.json',build_plan_ref.get('path','')) is not None, 'Missing/wrong frozen build plan')
    build_plan = json.loads(exact(build_plan_ref,read))
    require(build_plan['kind'] == 'mvp10-frozen-build-input-plan' and build_plan['authority'] == report['authority'] and build_plan['localDataPin'] == report['localDataPin'] and build_plan['manifest'] == report['manifest'], 'Frozen plan authority/pin mismatch')
    for key in ['inputs','fixtures','runtimeFiles','installedDependencies']:
        require(report[key] == build_plan[key], 'Build input closure differs from frozen plan: '+key)
    paths = set()
    for key, folder in [('inputs','inputs'),('fixtures','fixtures')]:
        originals, archived = report.get(key,[]), report.get('archived'+key.title(),[])
        require(originals and len(originals) == len(archived), 'Incomplete input archive')
        by_path = {row['path']:row for row in originals}
        require(len(by_path) == len(originals) and len({row['path'] for row in archived}) == len(archived), 'Duplicate archive input')
        for row in archived:
            require({k:v for k,v in row.items() if k != 'archivedAt'} == by_path[row['path']], 'Archive descriptor mismatch')
            require(row['archivedAt'] == PREFIX+'/build-evidence/'+folder+'/'+safe_name(row['path']), 'Wrong archive path')
            exact(row,read,row['archivedAt'])
        if key == 'inputs':
            paths = set(by_path)
    require(MINIMUM_INPUTS <= paths, 'Required product input missing')
    require(any(p.startswith('spfx/test/') and p.endswith('.test.ts') for p in paths), 'Source tests missing')
    runtime = report['runtimeFiles']
    require(len(runtime) == 45 and len({row['path'] for row in runtime}) == 45, 'Wrong runtime closure')
    fixtures = {row['path']:row for row in report['fixtures']}
    archived_fixtures = {row['path']:row for row in report['archivedFixtures']}
    for row in runtime:
        require(row == fixtures.get(row['path']) and row['path'] in archived_fixtures, 'Runtime file missing from closed fixture archive')
        exact(row,read,archived_fixtures[row['path']]['archivedAt'])
    manifest_bytes = exact(report['manifest'],read,PREFIX+'/build-evidence/fixtures/data/releases/'+RELEASE_ID+'/manifest.json')
    manifest = json.loads(manifest_bytes)
    require({row['path']:(row['sha256'],row['byteLength']) for row in runtime} == {'data/releases/'+RELEASE_ID+'/manifest.json':(sha256(manifest_bytes),len(manifest_bytes)),**{'data/releases/'+RELEASE_ID+'/'+r['path']:(r['sha256'],r['byteLength']) for r in manifest['artifacts']}}, 'Runtime descriptors mismatch')
    require([s['id'] for s in report['steps']] == BUILD_STEPS, 'Missing/reordered build steps')
    counts = {}
    for step in report['steps']:
        require(step['exitCode'] == 0 and step['signal'] is None, 'Failed build step')
        raw = exact(step['log'],read).decode()
        if step['id'] in ['source-tests','built-tests']:
            totals = {}
            for key in ['tests','pass','fail','cancelled','skipped','todo']:
                matches = re.findall(r'^# '+key+r' (\d+)\r?$',raw,re.M)
                require(len(matches) == 1, 'Ambiguous/missing test totals')
                totals[key] = int(matches[0])
            require(totals['tests'] > 0 and totals['tests'] == totals['pass'] and all(totals[k] == 0 for k in ['fail','cancelled','skipped','todo']), 'Failed/skipped tests')
            require(not re.search(r'^not ok|^Bail out!',raw,re.M), 'Nonpassing TAP')
            counts[step['id']] = totals
    require(report.get('preservation',{}).get('status') == 'passed', 'Protection gate absent')
    return {'status':'passed','steps':7,'productInputs':len(report['inputs']),'fixtures':len(report['fixtures']),'runtimeFiles':45,'testCounts':counts}

def main():
    require(len(sys.argv) == 1, 'No deployment/overwrite options')
    authority = file_bytes(OUTPUT/'r10b-execution-approval.json')
    require(sha256(authority) == AUTHORITY_SHA, 'Changed authority')
    require(json.loads(authority)['permissions']['definitiveLocalBuildAuthorized'] is True, 'Missing local build permission')
    report = json.loads(file_bytes(OUTPUT/'product-build.json'))
    audit = validate_build_report(report)
    pin = json.loads(file_bytes(OUTPUT/'local-data-pin.json'))
    require(pin == report['localDataPin'], 'Build pin differs')
    mirror = file_tree(RELEASE)
    manifest = inspect_mirror(mirror,pin['manifestSha256'])
    for name, raw in mirror.items():
        original = subprocess.run(['git','cat-file','blob',pin['commit']+':data/releases/'+RELEASE_ID+'/'+name],cwd=ROOT,check=True,capture_output=True).stdout
        require(original == raw, 'Mirror differs from local Git blob')
    base_url = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/'+pin['commit']+'/data/releases/'+RELEASE_ID
    package = OUTPUT/'fristenrechner-schweiz-0.10.0.0.sppkg'
    require(bound(package) == report['package'], 'Package differs from passed build')
    package_audit = inspect_sppkg(file_bytes(package),json.loads(file_bytes(ROOT/'spfx/config/package-solution.json')),base_url)
    web = file_tree(OUTPUT/'web-build')
    require(inventory(web) == [{**row,'path':row['path'].split('/web-build/',1)[1]} for row in report['webFiles']], 'Web differs from passed build')
    inspect_web_files(web,manifest,file_bytes(ROOT/'public-app/.htaccess'))
    artifacts = [bound(package)]
    for name, files in [('fristenrechner-mvp10-sharepoint-mirror.zip',mirror),('fristenrechner-mvp10-steimer-web.zip',web)]:
        write_once(OUTPUT/name,deterministic_zip(files))
        require(zip_files(file_bytes(OUTPUT/name)) == files, 'Final ZIP mismatch')
        artifacts.append(bound(OUTPUT/name))
    receipt = {'kind':'mvp10-local-artifact-sealing','status':'passed','releaseId':RELEASE_ID,'applicationVersion':'0.10.0','packageVersion':'0.10.0.0','localDataCommit':pin['commit'],'manifestSha256':pin['manifestSha256'],'authority':bound(OUTPUT/'r10b-execution-approval.json'),'buildProof':bound(OUTPUT/'product-build.json'),'buildAudit':audit,'packageAudit':package_audit,'mirrorFiles':inventory(mirror),'webFiles':inventory(web),'artifacts':artifacts,'installationAuthorized':False,'publicationAuthorized':False,'operatingApproval':False,'remotePinVerified':False,'realM365TestsPerformed':False}
    write_once(OUTPUT/'artifact-verification.json',(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode())
    print(json.dumps({'status':'passed','artifacts':artifacts,'proof':bound(OUTPUT/'artifact-verification.json')}))

if __name__ == '__main__':
    main()
