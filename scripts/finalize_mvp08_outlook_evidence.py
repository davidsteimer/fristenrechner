#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Bind existing browser and simulated AMD ICS evidence to final local artifacts.

No build, browser action, network request, Outlook import or human approval.
The original draft evidence remains unchanged.
"""
from __future__ import annotations

import datetime as dt
import json
import re
from pathlib import Path

from prepare_mvp08_artifacts import ROOT, OUTPUT, bound, file_bytes, inventory, sha256, write_once, zip_files

PREFIX = 'outputs/release-mvp08-2026-10-15'
RELEASE = '2026-10-15-mvp-08-approved.1'
BROWSER = f'{PREFIX}/browser-evidence/verification-1792091283775.json'
BROWSER_SHA = '2c4989793025b142a0ab1578b0183f1c7a9afd781c4de7129083fb7f438e62e7'
SOURCE_REPORT = f'{PREFIX}/outlook-reuse-assessment-v2.json'
SOURCE_REPORT_SHA = 'd0f358fc0095b51f59e2f2aa77fa5598ede4593de15c9b1d70f1a9b4f0ae5e0c'
ARTIFACT_REPORT_SHA = '5307901a72a32537ffc8f05cefa250341c42a5d21fc387a64df04ea2c1e369c2'


def checked(binding, *, path=None):
    selected = Path(path) if path else ROOT / binding['path']
    raw = file_bytes(selected)
    assert len(raw) == binding['byteLength'] and sha256(raw) == binding['sha256'], selected
    return raw


def inspect_ics(raw, locale, expected_summary):
    text = raw.decode('utf-8', errors='strict')
    assert text.endswith('\r\n') and '\n' not in text.replace('\r\n', '') and '\r' not in text.replace('\r\n', '')
    assert all(len(line.encode()) <= 75 for line in text.split('\r\n'))
    lines = re.sub(r'\r\n[ \t]', '', text).split('\r\n')
    required = ['BEGIN:VCALENDAR', 'END:VCALENDAR', 'VERSION:2.0', 'METHOD:PUBLISH', 'CALSCALE:GREGORIAN',
                'BEGIN:VEVENT', 'END:VEVENT', 'BEGIN:VALARM', 'END:VALARM', 'ACTION:DISPLAY',
                'TRANSP:TRANSPARENT', 'X-MICROSOFT-CDO-BUSYSTATUS:FREE', 'CATEGORIES:Fristablauf', 'TRIGGER:-PT112H']
    assert all(lines.count(value) == 1 for value in required)
    allowed = {'BEGIN', 'END', 'VERSION', 'METHOD', 'CALSCALE', 'PRODID', 'UID', 'DTSTAMP', 'DTSTART', 'DTEND',
               'SUMMARY', 'DESCRIPTION', 'TRANSP', 'X-MICROSOFT-CDO-BUSYSTATUS', 'CATEGORIES', 'TRIGGER', 'ACTION'}
    assert all(line.split(':', 1)[0].split(';', 1)[0] in allowed for line in lines if line)
    def one(prefix):
        values = [line[len(prefix):] for line in lines if line.startswith(prefix)]
        assert len(values) == 1, prefix
        return values[0]
    descriptions = [line[len('DESCRIPTION:'):] for line in lines if line.startswith('DESCRIPTION:')]
    assert len(descriptions) == 2
    assert one('SUMMARY:') == expected_summary and descriptions[1] == expected_summary
    assert re.fullmatch(r'[^\s]+@steimer\.ch', one('UID:'))
    assert re.fullmatch(r'\d{8}T\d{6}Z', one('DTSTAMP:'))
    start, end = one('DTSTART;VALUE=DATE:'), one('DTEND;VALUE=DATE:')
    assert start == '20261102' and end == '20261103'
    assert dt.datetime.strptime(end, '%Y%m%d') - dt.datetime.strptime(start, '%Y%m%d') == dt.timedelta(days=1)
    for marker in ['kind: cantonalAdministrative', 'lawId: lpamm-ti', 'pathId: ti-80-30',
                   'stage: administrativeAppeal', f'releaseId: {RELEASE}', 'authoritySeatCanton: TI',
                   'SRC-AP23B-TI-LPAMM', 'SRC-AP23B-TI-HOL']:
        assert marker in descriptions[0], marker
    return {'locale': locale, 'summary': expected_summary, 'start': '2026-11-02', 'exclusiveEnd': '2026-11-03',
            'allDay': True, 'freeAvailability': True, 'category': 'Fristablauf', 'trigger': '-PT112H',
            'administrativeProvenanceVerified': True, 'utf8Crlf75OctetFoldingVerified': True,
            'unexpectedProperties': [], 'outlookImported': False}


def main():
    artifact_path = OUTPUT / 'artifact-verification.json'
    assert sha256(file_bytes(artifact_path)) == ARTIFACT_REPORT_SHA
    artifact = json.loads(file_bytes(artifact_path))
    assert artifact['status'] == 'passed' and artifact['releaseId'] == RELEASE
    actual = {Path(item['path']).name: item for item in artifact['artifacts']}
    package = actual['fristenrechner-schweiz-0.8.0.0.sppkg']
    package_files = zip_files(checked(package))
    web = actual['fristenrechner-mvp08-steimer-web.zip']
    web_files = zip_files(checked(web))
    assert inventory(web_files) == artifact['webFiles']
    build = json.loads(checked(artifact['buildProof']))
    assert build['status'] == 'passed' and build['package'] == package
    assert sha256(file_bytes(ROOT / SOURCE_REPORT)) == SOURCE_REPORT_SHA
    prior = json.loads(file_bytes(ROOT / SOURCE_REPORT))
    assert prior['humanReuseAccepted'] is False and prior['realBrowserDownloadPerformed'] is False

    # Bridge the prior source assessment to the actual immutable build inputs.
    archived = {item['path']: item for item in build['archivedInputs']}
    source_binding = []
    for item in [*[entry['current'] for entry in prior['sourceComparisons']], prior['newAdministrativeAdapter']]:
        captured = archived[item['path']]
        assert all(captured[key] == item[key] for key in ('path', 'sha256', 'byteLength'))
        checked(captured, path=ROOT / captured['archivedAt'])
        source_binding.append({key: captured[key] for key in ('path', 'sha256', 'byteLength', 'archivedAt')})
    for path in ['src/ui/FristenrechnerApp.tsx', 'src/ui/i18n.ts']:
        captured = archived[path]
        assert file_bytes(ROOT / path) == checked(captured, path=ROOT / captured['archivedAt'])
        source_binding.append(captured)

    assert sha256(file_bytes(ROOT / BROWSER)) == BROWSER_SHA
    browser = json.loads(file_bytes(ROOT / BROWSER))
    assert browser['kind'] == 'mvp08-actual-static-browser' and browser['status'] == 'passed'
    assert browser['browser'] == '155.0.8059.79'
    assert browser['webFiles'] == build['webFiles']
    assert browser['externalRequests'] == [] and browser['pageErrors'] == []
    assert all(browser[flag] is False for flag in ('actualM365Testing', 'actualDeviceTesting', 'outlookImports'))
    for item in browser['webFiles']:
        name = item['path'].split('/web-build/', 1)[1]
        assert checked(item) == web_files[name]
    assert {row['locale'] for row in browser['checks']} == {'de', 'fr'} and len(browser['checks']) == 2
    for row in browser['checks']:
        assert row['download'] and row['staleExportRemoved'] and row['tiO2Blocked'] and not row['overflow']
        assert row['result'] == '2026-11-02'
    assert len(browser['exports']) == 2
    browser_exports = []
    for item in browser['exports']:
        locale = Path(item['path']).name.split('-', 1)[0]
        assert locale in ('de', 'fr')
        title = 'Fristablauf' if locale == 'de' else 'Échéance du délai'
        verification = inspect_ics(checked(item), locale, f'{title} (QA-MVP08-BROWSER-{locale.upper()}-TI)')
        browser_exports.append({**item, **verification, 'evidenceScope': 'actualHeadlessChromiumDownloadFromDefinitiveWebBuild',
                                'realBrowserDownloadPerformed': True, 'simulatedDownloadBoundary': False,
                                'm365HostExport': False, 'publicProductionHostExport': False})

    step = next(step for step in build['steps'] if step['id'] == 'built-tests')
    assert step['exitCode'] == 0 and step['signal'] is None
    log = checked(step['log']).decode()
    records = []
    for line in log.splitlines():
        if line.startswith('# {'):
            entry = json.loads(line[2:])
            if 'savedCalendar' in entry:
                records.append(entry)
    assert len(records) == 2 and {row['locale'] for row in records} == {'de', 'fr'}
    bundle = artifact['packageAudit']['bundlePath']
    assert sha256(package_files[bundle]) == artifact['packageAudit']['bundleSha256']
    amd_exports = []
    for row in records:
        assert row['browserDownloadOrOutlookProof'] is False
        assert row['package']['packageSha256'] == package['sha256']
        assert row['package']['bundlePath'] == bundle
        assert row['package']['bundleSha256'] == sha256(package_files[bundle])
        source = Path(row['savedCalendar'])
        assert source.name == 'fristablauf-2026-11-02.ics'
        assert source.parent.name.startswith(f'fristenrechner-mvp08-amd-{row["locale"]}-')
        raw = file_bytes(source)
        assert sha256(raw) == row['sha256']
        title = 'Fristablauf' if row['locale'] == 'de' else 'Échéance du délai'
        verification = inspect_ics(raw, row['locale'], title)
        target = OUTPUT / 'outlook-evidence/packaged-amd' / f'{row["locale"]}-ti.ics'
        write_once(target, raw)
        amd_exports.append({**bound(target), **verification, 'evidenceScope': 'actualPackagedAmdWithSimulatedDomAndDownloadBoundary',
                            'savedCalendarDiagnosticLocale': row['locale'], 'diagnosticLog': step['log'],
                            'bundlePath': bundle, 'bundleSha256': row['package']['bundleSha256'],
                            'realBrowserDownloadPerformed': False, 'simulatedDownloadBoundary': True, 'm365HostExport': False})

    harnesses = []
    for path in ['spfx/test-build/mvp08-harness.cjs', 'spfx/test-build/package-harness.cjs']:
        item = archived[path]
        checked(item, path=ROOT / item['archivedAt'])
        harnesses.append(item)
    report = {
        'kind': 'mvp08-definitive-outlook-evidence-supplement', 'status': 'local-evidence-passed-human-reuse-decision-open',
        'releaseId': RELEASE, 'manifestSha256': artifact['manifestSha256'], 'applicationVersion': '0.8.0',
        'packageVersion': '0.8.0.0', 'priorAssessmentUnchanged': bound(ROOT / SOURCE_REPORT),
        'artifactVerification': bound(artifact_path), 'buildProof': artifact['buildProof'],
        'definitiveArtifacts': [package, web], 'sourceAssessmentMatchesArchivedBuildInputs': source_binding,
        'browserProof': bound(ROOT / BROWSER), 'browserVersion': browser['browser'],
        'browserExports': browser_exports, 'packagedAmdExports': amd_exports, 'packagedHarnessInputs': harnesses,
        'actualBrowserDownloads': 2, 'simulatedPackagedDownloads': 2,
        'readOnlyReverificationOfExistingEvidence': True, 'newBrowserSessionPerformedByThisScript': False,
        'proposedReuseScope': 'Only historical Outlook import interpretation of unchanged appointment fields. New administrative provenance, gate logic and host behavior retain their separate evidence scopes.',
        'm365HostTestsPerformed': False, 'publicProductionHostTestsPerformed': False, 'actualDeviceTestsPerformed': False,
        'outlookImportsPerformed': False, 'mailboxChanged': False, 'humanReuseAccepted': False,
        'installationAuthorized': False, 'publicationAuthorized': False, 'operatingApproval': False,
        'script': bound(Path(__file__).resolve())
    }
    target = OUTPUT / 'outlook-final-artifact-supplement.json'
    write_once(target, (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode())
    print(json.dumps({'status': report['status'], 'actualBrowserDownloads': 2, 'simulatedPackagedDownloads': 2,
                      'proof': bound(target), 'browserExports': browser_exports, 'packagedAmdExports': amd_exports}, ensure_ascii=False))


if __name__ == '__main__':
    main()
