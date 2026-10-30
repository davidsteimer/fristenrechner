// SPDX-License-Identifier: AGPL-3.0-only
// Local evidence reconciliation only. No network, Git, build or deployment calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../', import.meta.url));
const prior = '.work/deployments/2026-10-18-eq-mvp09';
const output = '.work/deployments/2026-10-29-eq-mvp10/vorbereitung';
const releasePrefix = 'outputs/release-mvp10-2026-10-28';
const previousRelease = '2026-10-18-mvp-09-approved.1';
const releaseId = '2026-10-28-mvp-010-approved.1';
const priorPreparationRelease = '2026-10-15-mvp-08-approved.1';
const ids = ['E-SP', 'E-T', 'Q-SP', 'Q-T'];
const inputs = new Map();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
function regular(relative) {
  assert.ok(!path.isAbsolute(relative) && !relative.split('/').includes('..'), relative);
  const absolute = path.join(root, relative);
  assert.ok(fs.lstatSync(absolute).isFile() && !fs.lstatSync(absolute).isSymbolicLink(), relative);
  return fs.readFileSync(absolute);
}
function bind(relative, expected) {
  const bytes = regular(relative);
  const binding = { path: relative, byteLength: bytes.length, sha256: sha(bytes) };
  if (expected) {
    assert.equal(binding.sha256, typeof expected === 'string' ? expected : expected.sha256, relative);
    if (expected.byteLength !== undefined) assert.equal(binding.byteLength, expected.byteLength, relative);
  }
  if (inputs.has(relative)) assert.deepEqual(binding, inputs.get(relative), relative);
  inputs.set(relative, binding);
  return binding;
}
function read(relative, expected) { bind(relative, expected); return JSON.parse(regular(relative)); }
function text(relative, expected) { bind(relative, expected); return regular(relative).toString('utf8'); }
function check(b) { return bind(b.path, b); }
function walk(relative) {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap(e => {
    assert.ok(!e.isSymbolicLink() && (e.isDirectory() || e.isFile()));
    return e.isDirectory() ? walk(`${relative}/${e.name}`) : [`${relative}/${e.name}`];
  });
}
function inventory(id, format, count, expectedHash) {
  const base = `data/releases/${id}`;
  const manifestBinding = bind(`${base}/manifest.json`, expectedHash);
  const manifest = read(manifestBinding.path);
  assert.equal(manifest.releaseId, id);
  assert.equal(manifest.formatVersion, format);
  assert.equal(manifest.releaseStatus, 'approved');
  const files = [{ path: 'manifest.json', byteLength: manifestBinding.byteLength, sha256: manifestBinding.sha256 }];
  for (const b of manifest.artifacts) {
    const actual = bind(`${base}/${b.path}`, b);
    files.push({ ...actual, path: b.path });
  }
  assert.equal(files.length, count);
  assert.equal(new Set(files.map(f => f.path)).size, count);
  assert.deepEqual(walk(base).map(p => p.slice(base.length + 1)).sort(), files.map(f => f.path).sort());
  return { releaseId: id, formatVersion: format, fileCount: count, byteLength: files.reduce((n, f) => n + f.byteLength, 0), manifest: manifestBinding, files };
}
function webparts(canvas) {
  const dom = new JSDOM(canvas);
  const result = [...dom.window.document.querySelectorAll('[data-sp-webpartdata]')].map(e => JSON.parse(e.getAttribute('data-sp-webpartdata')));
  dom.window.close();
  return result;
}
function xmlProperties(relative) {
  const xml = text(relative);
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const namespace = 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata';
  const result = [...dom.window.document.getElementsByTagNameNS(namespace, 'properties')].map(el => Object.fromEntries([...el.children].map(child => [child.localName,
    child.getAttributeNS(namespace, 'null') === 'true' ? null : child.children.length ? child.innerHTML : child.textContent])));
  dom.window.close();
  assert.ok(result.length > 0, relative);
  return result;
}
function baseline(rows, target, webpartId) {
  const row = rows.find(r => r.id === `${target.id}-${target.host === 'Teams' ? 'item' : 'file'}`);
  assert.ok(row);
  const item = row.properties.find(p => p.CanvasContent1);
  const parts = webparts(item.CanvasContent1);
  const ours = parts.filter(p => p.id === webpartId);
  assert.equal(ours.length, 1);
  assert.equal(ours[0].instanceId, target.webPartInstanceId);
  assert.equal(item.GUID, target.itemGuid);
  assert.equal(Number(item.Id), target.itemId);
  assert.deepEqual(ours[0].properties, target.documentedProperties);
  return { row, item, file: row.properties.find(p => p.UniqueId) ?? null, webparts: parts, ours: ours[0] };
}
function exclusive(relative, bytes, verify) {
  const absolute = path.join(root, relative);
  if (fs.existsSync(absolute)) assert.ok(fs.readFileSync(absolute).equals(bytes), `Existing output differs: ${relative}`);
  else {
    assert.equal(verify, false, `Missing output: ${relative}`);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, bytes, { flag: 'wx', mode: 0o600 });
  }
  return { path: relative, byteLength: bytes.length, sha256: sha(bytes) };
}

function prepare() {
  const priorPath = `${prior}/vorbereitung/targets.private.json`;
  const previous = read(priorPath, 'b1d1e7adbe6532c238d42284b9728445c0fbe68461954d6e226803715c3fe146');
  const rowsPath = `${prior}/ausgangssicherung/configurations-rendered.private.json`;
  const rows = read(rowsPath, '398c1363a6163630d59cc0b32cc4c36f71edddd3ea546cd9ce6b49f45b8947d6');
  const tabsPath = `${prior}/ausgangssicherung/teams-tabs.private.json`;
  const tabs = read(tabsPath).records;
  const journalPath = 'docs/betrieb/eq-vollzugsnachweis-mvp09.md';
  const journal = text(journalPath);
  const acceptancePath = 'docs/betrieb/abnahme-q-mvp09.md';
  const acceptance = text(acceptancePath);
  assert.ok(journal.includes('R09-C einschliesslich C08') && acceptance.includes('19. Oktober 2026'));
  const finalPath = `${prior}/hosttests/q-mvp09/r09c-local-final-integrity-20261019-r2.private.json`;
  const final = read(finalPath);
  assert.equal(final.status, 'LOCAL_BOUND_ARTIFACTS_AND_TECHNICAL_EVIDENCE_UNCHANGED');
  assert.deepEqual(final.failures, []);
  const completePath = `${releasePrefix}/local-completion.json`;
  const complete = read(completePath, '433110e9d13d03fffb335eee95cde9fc0b0186f5b8d33358d73323aac51ee29b');
  assert.equal(complete.status, 'passed');
  assert.equal(complete.releaseId, releaseId);
  const artifacts = complete.artifacts.filter(b => !b.path.endsWith('steimer-web.zip'));
  assert.equal(artifacts.length, 3);
  artifacts.forEach(check);
  const oldInventory = inventory(previousRelease, '9.0.0', 42, '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265');
  const newInventory = inventory(releaseId, '17.0.0', 45, '7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016');
  const c03Path = `${prior}/mirrors/c03-20261018T223610Z.private.json`;
  const c03 = read(c03Path);
  assert.equal(c03.status, 'passed');
  const catalogPath = `${prior}/katalognachweis/verification-after-activation.private.json`;
  const catalog = read(catalogPath, '9b54d1ea4281102867268808ef64b60b323f2157b062fbd3db3ea8cda5708dbd');
  check(catalog.catalogPackage.originalFile);
  check(catalog.newMainBundle.originalFile);
  assert.equal(catalog.catalogPackage.originalFile.sha256, '7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331');
  const eAppsPath = `${prior}/hosttests/after-e-appupdates-20261018T230834Z.private.json`;
  const eApps = read(eAppsPath);
  const etPath = `${prior}/hosttests/E-T/t03-source-switch-interim.private.json`;
  const et = read(etPath);
  assert.equal(et.sourceSwitch.persistedConfiguration.allOtherPropertiesIdentical, true);
  assert.deepEqual(et.sourceSwitch.persistedConfiguration.changedRestProperties, ['Modified', 'CanvasContent1']);
  const qspPath = `${prior}/hosttests/pre-q-2026-10-19T072028490Z/q-sp-post-publication-comparison.private.json`;
  const qsp = read(qspPath);
  Object.values(qsp.bindings).forEach(check);
  const qspRows = xmlProperties(qsp.bindings.after.path);
  const qspItem = qspRows.find(p => p.CanvasContent1);
  const qspFile = qspRows.find(p => p.UniqueId);
  const qspAlm = xmlProperties(qsp.bindings.almAfterAppUpdate.path)[0];
  assert.equal(qspAlm.InstalledVersion, '0.9.0.0');
  assert.equal(qspAlm.AppCatalogVersion, '0.9.0.0');
  const qtPath = `${prior}/hosttests/pre-qt-20261019/q-t-app-mirror-cold-interim.private.json`;
  const qt = read(qtPath);
  assert.equal(qt.app.completed.InstalledVersion, '0.9.0.0');
  assert.equal(qt.item.exactWholeCanvasEqualsOnlyBoundMirrorReplacement, true);
  const mirrorOriginals = [];
  const targets = previous.targets.map(t => {
    const b = baseline(rows, t, previous.catalog.webpartId);
    const mirrorRecord = c03.targets.find(v => v.target === t.id);
    assert.ok(mirrorRecord);
    check(mirrorRecord.report);
    const report = read(mirrorRecord.report.path);
    const reportRelease = report.releases?.find(v => v.releaseId === previousRelease) ?? {};
    const oldTree = `${prior}/mirrors/${t.id}/${t.id === 'Q-SP' ? 'originals' : 'raw'}/${previousRelease}`;
    assert.deepEqual(walk(oldTree).map(p => p.slice(oldTree.length + 1)).sort(), oldInventory.files.map(f => f.path).sort());
    for (const f of oldInventory.files) {
      const actual = bind(`${oldTree}/${f.path}`, f);
      mirrorOriginals.push({ ...actual, target: t.id, relative: f.path, originalRemoteVerificationAt: report.verifiedAt ?? report.checkedAt, rehashedLocally: true, newRemoteRead: false });
    }
    const expectedProperties = { ...b.ours.properties, sharePointMirrorPath: `${t.mirrorParentPath}/${previousRelease}` };
    let afterParts, item = null, file = null, observedAt, installedVersion, derivation, evidence, limitations = [];
    if (t.id === 'E-SP') {
      assert.ok(journal.includes('b0a81d9123891f97ce54eb3f9f7135a8c5b64c1c59f09d45ac9bdeb9b0a831a6'));
      assert.ok(journal.includes('Version `11.0` publiziert'));
      afterParts = structuredClone(b.webparts);
      afterParts.find(w => w.id === previous.catalog.webpartId).properties = expectedProperties;
      installedVersion = eApps.siteApps.find(a => a.id === t.id).installedVersion;
      observedAt = '2026-10-18T23:16:27Z';
      derivation = 'Complete C01 webpart JSON plus the sole subsequently documented MVP09 mirror replacement, confirmed by the dated execution journal. This reconstruction is not a saved original post-publication REST response or ASPX byte archive.';
      evidence = [rowsPath, eAppsPath, journalPath];
      limitations = ['No independent post-publication original ASPX body or complete item/file snapshot identified. Fresh full configuration backup required before R10-C writes.', 'Journal-reported property hash is retained as attributed evidence. Its historical canonicalisation is not invented or equated with the reconstruction hash.'];
    } else if (t.id === 'E-T') {
      item = structuredClone(b.item);
      item.CanvasContent1 = item.CanvasContent1.replaceAll(priorPreparationRelease, previousRelease);
      item.Modified = et.sourceSwitch.persistedConfiguration.modifiedAtUtc;
      afterParts = webparts(item.CanvasContent1);
      installedVersion = et.before.freshAlm.installedVersion;
      observedAt = item.Modified;
      derivation = 'Complete C01 item reconstructed with exactly the two enumerated persisted changes from the source-switch report. All other properties were compared at that time. Not a new remote observation.';
      evidence = [rowsPath, eAppsPath, etPath];
      limitations = ['The complete post-switch item is reconstructed from the exact baseline and recorded delta. A fresh original response must be captured before R10-C writes.'];
    } else if (t.id === 'Q-SP') {
      item = qspItem; file = qspFile; afterParts = webparts(item.CanvasContent1);
      installedVersion = qspAlm.InstalledVersion;
      observedAt = qsp.publication.fileModifiedUtc;
      derivation = 'Complete saved visible REST XML after publication, parsed locally, with a separately retained full before/after comparison. Visible XML text is not original HTTP response bytes or the ASPX file body.';
      evidence = [qspPath, qsp.bindings.after.path, qsp.bindings.almAfterAppUpdate.path];
      limitations = ['The historical one-byte ASPX Length difference is documented by the source report. No raw ASPX equivalence is claimed.'];
    } else {
      item = qt.item.completeAfterProperties; afterParts = qt.item.decodedWebpart;
      assert.deepEqual(webparts(item.CanvasContent1), afterParts);
      installedVersion = qt.app.completed.InstalledVersion;
      observedAt = item.Modified;
      derivation = 'Complete after-item and decoded webpart retained in the persisted Q-T source-switch record, with completed ALM version and exact full-Canvas comparison.';
      evidence = [qtPath];
      limitations = ['The tab GUID is inherited from the separately recorded tab identity. It is not directly present in the later native AX observation. Fresh tab/channel/iframe association is required.'];
    }
    const ours = afterParts.filter(w => w.id === previous.catalog.webpartId);
    assert.equal(ours.length, 1);
    assert.equal(ours[0].instanceId, t.webPartInstanceId);
    assert.deepEqual(ours[0].properties, expectedProperties);
    assert.equal(installedVersion, '0.9.0.0');
    if (item) {
      assert.equal(item.GUID, t.itemGuid);
      assert.equal(Number(item.Id), t.itemId);
    }
    if (file) { assert.equal(file.UniqueId, t.fileUniqueId); assert.equal(file.ServerRelativeUrl, t.pagePath); }
    if (t.host === 'Teams') {
      const tab = tabs.find(v => v.id === t.id);
      assert.equal(tab.tabId, t.teamsTabId);
      assert.equal(tab.name, t.view);
      assert.equal(new URL(tab.iframe).searchParams.get('dest'), t.actualIframeDestination);
      evidence.push(tabsPath);
    }
    return { ...t,
      documentedInstalledVersion: installedVersion, documentedBaselineOn: '2026-10-19',
      documentedPageVersion: t.id === 'E-SP' ? '11.0' : item.OData__UIVersionString,
      documentedPageLevel: t.id === 'E-SP' ? 1 : file ? Number(file.Level) : null,
      documentedModified: observedAt,
      documentedProperties: expectedProperties,
      documentedCompleteWebparts: afterParts,
      documentedCompleteItem: item,
      documentedCompleteFile: file,
      documentedConfigurationDerivation: derivation,
      documentedLayoutDelta: t.id === 'E-SP' ? { property: 'reservedHeight', before: 1161, after: 940,
        source: inputs.get(journalPath), evidenceKind: 'Dated journal observation of automatic layout change',
        fullPostPublicationCanvasArchived: false } : null,
      configurationEvidence: evidence.map(p => inputs.get(p)),
      configurationLimitations: limitations,
      propertySerializationForThisProposal: 'JSON.stringify of the reconstructed complete webpart properties, insertion order retained, UTF-8',
      reconstructedPropertiesSha256: sha(JSON.stringify(expectedProperties)),
      documentedRecoveryFolderId: reportRelease.rootItemId ?? null,
      recoveryFolderIdentitySource: reportRelease.rootItemId ? mirrorRecord.report : null,
      recoveryFolderIdentityLimit: reportRelease.rootItemId ? null : 'The selected historical report does not provide the release-root folder ID. Resolve it freshly by the exact bound parent path and release name before any action.',
      recoveryMirrorPath: `${t.mirrorParentPath}/${previousRelease}`,
      proposedMirrorPath: `${t.mirrorParentPath}/${releaseId}`,
      proposedMirrorExistsVerified: false, freshRemoteConfirmation: false,
      identityMustBeFreshlyConfirmed: true, sourceFormat: '9.0.0', targetFormat: '17.0.0',
      allowedConfigurationDelta: ['sharePointMirrorPath'], preserveOtherFreshProperties: true,
      sourceStateNotCurrentRemoteAssertion: true,
      needsFreshFullBackup: true,
      uploadModeAfterSeparateApproval: 'manual-user-upload',
    };
  });
  assert.deepEqual(targets.map(t => t.id), ids);
  assert.equal(mirrorOriginals.length, 168);
  const ap5Path = `${prior}/hosttests/vor-q-ap5/ap5-both-hosts-assessment.private.json`;
  const ap5 = read(ap5Path);
  const ap5Capture = ap5.historicalConfiguration;
  check(ap5Capture.source);
  const ap5Rows = xmlProperties(ap5Capture.source.path);
  const ap5Item = ap5Rows.find(p => p.CanvasContent1);
  const ap5File = ap5Rows.find(p => p.UniqueId);
  const ap5Parts = webparts(ap5Item.CanvasContent1);
  assert.equal(ap5File.UIVersionLabel, '1.2');
  assert.equal(ap5File.Level, '2');
  assert.equal(ap5File.UniqueId, previous.historical.fileUniqueId);
  assert.equal(ap5Item.GUID, previous.historical.itemGuid);
  const ap5Ours = ap5Parts.find(w => w.instanceId === previous.historical.webPartInstanceId);
  assert.deepEqual(ap5Ours.properties, previous.historical.properties);
  const ap5Tab = tabs.find(t => t.id === 'AP5');
  assert.equal(ap5Tab.tabId, previous.historical.teamsTabId);
  assert.equal(ap5Tab.iframe, `${previous.historical.pageUrl}?useTeamsAuth=true`);
  for (const host of ap5.hosts) {
    check(host.byteReport);
    for (const f of host.files) bind(`data/releases/${previous.historical.releaseId}/${f.path}`, f);
  }
  const historical = { ...previous.historical,
    documentedBaselineOn: '2026-10-19', documentedCompleteWebparts: ap5Parts,
    documentedCompleteItem: ap5Item, documentedCompleteFile: ap5File,
    configurationEvidence: [inputs.get(ap5Path), inputs.get(ap5Capture.source.path), inputs.get(tabsPath)],
    freshRemoteConfirmation: false, remoteCheckedThisPreparation: false,
    configurationChangeAllowed: false, pagePublicationAllowed: false, defaultsWritesAllowed: false,
    sharedPackageCodeCanChange: true,
    evidenceLimit: 'Saved visible REST XML and dated AP5 host evidence, not a new online inventory or an original ASPX backup.',
  };
  const permissions = { installationAuthorized: false, uploadAuthorized: false, recoveryExecutionAuthorized: false,
    githubPushAuthorized: false, operatingApproval: false, additionalCommitAuthorized: false };
  const value = { kind: 'r10c-eq-private-target-proposal', schemaVersion: '1.0.0', preparedOn: '2026-10-29',
    status: 'prepared-not-authorized', freshRemoteConfirmation: false, permissions,
    catalog: { ...previous.catalog, documentedSourceVersion: '0.9.0.0', documentedBaselineOn: '2026-10-19',
      proposedVersion: '0.10.0.0', conditionalRecoveryVersion: '0.10.0.1',
      previousPackageSha256: catalog.catalogPackage.originalFile.sha256,
      previousBundleSha256: catalog.newMainBundle.originalFile.sha256,
      sourceEvidence: [inputs.get(catalogPath), inputs.get(eAppsPath)],
      freshRemoteConfirmation: false, addToAllSites: false },
    targets, historical, artifacts, localCompletion: inputs.get(completePath),
    inventories: [oldInventory, newInventory], archivedRollbackFiles: mirrorOriginals,
    sourceBindings: [...inputs.values()],
    caveats: [
      'Only local reads of previously saved evidence were performed. All remote state requires fresh confirmation before writes.',
      'MVP09 terminal records replace the old MVP08 preparation baseline. Source-specific reconstruction limits remain explicit.',
      'MVP10 files have only been checked locally. No new remote folder, upload, installation, permission change or human operational approval is implied.',
      'The 168 rehashed old mirror copies are historical original-byte captures. Rehashing does not renew their remote observation date.',
      'Existing dormant githubBaseUrl properties stay unchanged. No new GitHub fallback or remote publication is assumed.',
      'A full recovery uses package 0.10.0.1 and each target own MVP09 Format-9 mirror. A later regular return requires a newly bound package version at least 0.10.0.2.',
    ],
  };
  return value;
}

function annex(v) {
  const lines = ['# R10-C: privater Zielanhang', '', 'Fassung 1.0 vom 29. Oktober 2026. Nur lokale Vorbereitung, noch kein Vollzug freigegeben.', '',
    'Diese Datei enthält private Tenantadressen und technische Identitäten. Sie gehört nicht zur öffentlichen Positivliste.', '',
    `Letzter belegter Stand: Paket ${v.catalog.documentedSourceVersion}, Datenrelease ${previousRelease}, Format 9. Vorgesehen: Paket ${v.catalog.proposedVersion}, Datenrelease ${releaseId}, Format 17.`, '',
    'Die Remotezeitpunkte stammen aus den Endbelegen von MVP 0.9. Die heutige lokale Prüfung bestätigt keine unveränderte aktuelle Onlinekonfiguration. Vor einem Vollzug sind sämtliche Identitäten, vollständigen Eigenschaften, Pakete, Berechtigungen und Rohbytes frisch zu sichern und zu vergleichen.', '',
    `Katalog: ${v.catalog.url}`, `Bestehende Datei: ${v.catalog.existingFileName}`, `Lösung: ${v.catalog.solutionId}`, '',
    '| Ziel | Bestehende Ansicht | Bisherige App | Belegte Seitenversion |', '| --- | --- | --- | --- |',
    ...v.targets.map(t => `| ${t.id} – ${t.displayName} | ${t.view} | ${t.documentedInstalledVersion} | ${t.documentedPageVersion} |`), '',
    '## Vier unveränderte Zielidentitäten', ''];
  for (const t of v.targets) lines.push(`### ${t.id} – ${t.displayName}`, '',
    `Site: ${t.siteUrl}`, `Appinstanz: ${t.siteAppInstanceId}`, `Webpartinstanz: ${t.webPartInstanceId}`,
    t.pageUrl ? `Seite: ${t.pageUrl}` : `Teamsregisterkarte: ${t.teamsTabId}`, `Item-GUID: ${t.itemGuid}`,
    `Mirror für den Rückfall: ${t.recoveryMirrorPath}`, `Vorgesehener neuer Mirror: ${t.proposedMirrorPath}`, '',
    `Herkunft: ${t.documentedConfigurationDerivation}`, '', ...t.configurationLimitations.map(x => `- ${x}`), '',
    'Einzig vorgesehene Konfigurationsänderung: sharePointMirrorPath. Alle anderen frisch gelesenen Eigenschaften bleiben erhalten.', '');
  lines.push('## Historische AP5-Ansicht', '', v.historical.pageUrl, `Registerkarte: ${v.historical.teamsTabId}`, `Unveränderter Pin: ${v.historical.githubBaseUrl}`, '',
    'Die bestehende Entwurfsfassung 1.2 bleibt erhalten. Kein Publizieren, kein Konfigurationswechsel, kein Export und kein Schreiben von Standards. Die gemeinsame Paketcodewirkung wird trotzdem auf SharePoint und Teams geprüft.', '',
    '## Lokal geprüfte Dateiherkunft', '',
    'Alle 168 historischen MVP09-Mirrordateien wurden erneut lokal gegen die 42 tatsächlichen Format-9-Releasedateien geprüft. Der neue Format-17-Bestand umfasst 45 lokal geprüfte Dateien. Der vollständige Einzelnachweis steht in targets.private.json.', '',
    'Die R10-C-Sicherung und der manuelle Mirrorupload sind erst nach der konkreten Freigabe auszuführen. Fehlende, mehrdeutige oder abweichende Istangaben führen zum Halt vor einer Änderung.', '');
  return Buffer.from(lines.join('\n'));
}

const verify = process.argv.includes('--verify');
assert.ok(process.argv.slice(2).every(a => a === '--verify'));
const value = prepare();
const targetBytes = encode(value);
const targetBinding = exclusive(`${output}/targets.private.json`, targetBytes, verify);
const annexBinding = exclusive(`${output}/Zielanhang.md`, annex(value), verify);
for (const b of inputs.values()) {
  const current = regular(b.path);
  assert.equal(current.length, b.byteLength);
  assert.equal(sha(current), b.sha256);
}
const report = { kind: 'r10c-private-target-local-verification', schemaVersion: '1.0.0', preparedOn: '2026-10-29',
  status: 'passed-local-only', proposalStatus: value.status, targetBinding, annex: annexBinding,
  generator: { path: 'scripts/prepare-r10c-targets.mjs', byteLength: regular('scripts/prepare-r10c-targets.mjs').length, sha256: sha(regular('scripts/prepare-r10c-targets.mjs')) },
  targets: value.targets.map(t => ({ id: t.id, installedVersionFromHistoricalEndEvidence: t.documentedInstalledVersion,
    pageVersion: t.documentedPageVersion, sourceFormat: t.sourceFormat, targetFormat: t.targetFormat,
    freshRemoteConfirmation: false, freshFullBackupRequired: true, reconstructionLimits: t.configurationLimitations })),
  historicalMirrorFilesRehashed: 168, historicalMirrorBytes: value.archivedRollbackFiles.reduce((n, f) => n + f.byteLength, 0),
  newLocalRuntimeFiles: 45, inputBindingsRechecked: inputs.size,
  artifactsRechecked: value.artifacts, sourceBindings: [...inputs.values()],
  freshRemoteConfirmation: false, networkRequests: 0, installationPerformed: false, uploadPerformed: false,
  gitMutationPerformed: false, permissionsChanged: false, recoveryExecuted: false,
};
const verificationBinding = exclusive(`${output}/verification.private.json`, encode(report), verify);
process.stdout.write(JSON.stringify({ status: report.status, targetBinding, annex: annexBinding, verification: verificationBinding,
  historicalFiles: 168, historicalBytes: report.historicalMirrorBytes, newLocalFiles: 45, sourceBindings: inputs.size,
  verifyOnly: verify, writesAuthorized: false }, null, 2) + '\n');
