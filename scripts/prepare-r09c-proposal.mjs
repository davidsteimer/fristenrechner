// SPDX-License-Identifier: AGPL-3.0-only
// Local proposal and byte checks only. No network, upload, build or Git mutation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { readRegular, writeExclusive } from './record-mvp08-source-approval.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp09-2026-10-18';
const out = `${prefix}/r09c`;
const privateRoot = '.work/deployments/2026-10-18-eq-mvp09/vorbereitung';
const prior = '.work/deployments/2026-10-16-eq-mvp08';
const priorTargets = '.work/deployments/2026-10-15-eq-mvp08/vorbereitung/targets.private.json';
const targetPath = `${privateRoot}/targets.private.json`;
const oldRelease = '2026-10-15-mvp-08-approved.1';
const newRelease = '2026-10-18-mvp-09-approved.1';
const ids = ['E-SP', 'E-T', 'Q-SP', 'Q-T'];
const docs = ['docs/betrieb/eq-installationsvorlage-mvp09.md', 'docs/betrieb/rueckfall-mvp09.md', 'docs/betrieb/pruefmatrix-mvp09.md'];
const liveNavigation = ['README.md', 'docs/betrieb/deployment-mvp-09.md'];
const permissions = { installationAuthorized: false, uploadAuthorized: false, recoveryExecutionAuthorized: false,
  githubPushAuthorized: false, operatingApproval: false, additionalCommitAuthorized: false };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const json = async path => JSON.parse(await readRegular(root, path));
const protectedInputs = new Map();
async function bind(path, expected) {
  const bytes = await readRegular(root, path);
  const item = { path, byteLength: bytes.length, sha256: hash(bytes) };
  if (expected) assert.equal(item.sha256, expected, path);
  if (protectedInputs.has(path)) assert.deepEqual(protectedInputs.get(path), item, path);
  protectedInputs.set(path, item);
  return item;
}
async function checkBinding(item) {
  const actual = await bind(item.path, item.sha256);
  if (item.byteLength !== undefined) assert.equal(actual.byteLength, item.byteLength, item.path);
  return actual;
}
async function recheckProtected() {
  for (const item of protectedInputs.values()) {
    const bytes = await readRegular(root, item.path);
    assert.equal(hash(bytes), item.sha256, item.path);
    assert.equal(bytes.length, item.byteLength, item.path);
  }
}
function assertInventory(inventory, releaseId, formatVersion) {
  assert.equal(inventory.releaseId, releaseId);
  assert.equal(inventory.formatVersion, formatVersion);
  assert.equal(inventory.files.length, 42);
  assert.equal(new Set(inventory.files.map(item => item.path)).size, 42);
  assert.equal(inventory.files.filter(item => item.path === 'manifest.json').length, 1);
  for (const item of inventory.files) {
    assert.ok(!item.path.startsWith('/') && item.path.split('/').every(p => p && p !== '.' && p !== '..'));
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength > 0);
  }
}
async function inventory(releaseId, formatVersion, expectedManifest) {
  const base = `data/releases/${releaseId}`;
  const manifest = await bind(`${base}/manifest.json`, expectedManifest), parsed = await json(manifest.path);
  assert.equal(parsed.releaseId, releaseId);
  assert.equal(parsed.formatVersion, formatVersion);
  const files = [manifest];
  for (const descriptor of parsed.artifacts) files.push(await bind(`${base}/${descriptor.path}`, descriptor.sha256));
  const result = { releaseId, formatVersion, manifest, files: files.map(item => ({ ...item, path: item.path.slice(base.length + 1) })) };
  assertInventory(result, releaseId, formatVersion);
  return result;
}
async function common() {
  const closure = await bind(`${prefix}/local-completion.json`, 'e94353ac31cc4be6c2168ba4895e619f57f390e3a3c6d53c7d1d9ebaa1eec60f');
  const documentation = await bind(`${prefix}/documentation-completion.json`, 'a2927c1487daaef1d07efa73171ac69f26a0cb3ba6db76a80a4f024e9b2490f4');
  const complete = await json(closure.path), documented = await json(documentation.path);
  assert.equal(complete.status, 'passed'); assert.equal(documented.status, 'passed');
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), complete.dataCommit);
  assert.equal(execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8' }).trim(), '');
  for (const item of [...complete.artifacts, ...complete.evidence, ...complete.finalChecks]) await checkBinding(item);
  for (const item of documented.afterDocuments) {
    await checkBinding({ ...item, path: item.archivedAt });
    if (!liveNavigation.includes(item.path)) await checkBinding(item);
  }
  const product = await json(`${prefix}/product-build.json`);
  const recovery = await json(`${prefix}/recovery-0.9.0.1/artifact-verification.json`);
  const audit = await json(`${prefix}/artifact-verification.json`);
  const sources = await json(`${prefix}/source-approval.json`);
  await bind(`${prefix}/source-approval.json`, '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68');
  assert.equal(product.inputs.length, 241); assert.equal(product.fixtures.length, 714);
  assert.equal(product.runtimeFiles.length, 42); assert.equal(sources.evidence.length, 803);
  for (const item of [...product.inputs, ...product.fixtures, ...product.runtimeFiles, ...product.webFiles,
    ...recovery.archivedFiles, ...recovery.protectedFiles, ...sources.evidence]) await checkBinding(item);
  const inventories = [await inventory(newRelease, '9.0.0', '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265'),
    await inventory(oldRelease, '8.0.0', '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4')];
  const zip = complete.artifacts.find(item => item.path.endsWith('sharepoint-mirror.zip'));
  const entries = execFileSync('unzip', ['-Z1', resolve(root, zip.path)], { encoding: 'utf8' }).trim().split('\n').sort();
  assert.deepEqual(entries, inventories[0].files.map(item => item.path).sort());
  for (const item of inventories[0].files) {
    const bytes = execFileSync('unzip', ['-p', resolve(root, zip.path), item.path], { maxBuffer: 8 * 1024 * 1024 });
    assert.equal(hash(bytes), item.sha256); assert.equal(bytes.length, item.byteLength);
  }
  const packages = [];
  for (const [i, packageAudit] of [audit.packageAudit, recovery.packageAudit].entries()) {
    const packageFile = complete.artifacts.find(item => item.path.endsWith(i ? 'recovery-0.9.0.1.sppkg' : 'schweiz-0.9.0.0.sppkg'));
    assert.equal(packageAudit.solutionId, '13090feb-a6bf-40fa-9d3c-ec8d90516a60');
    assert.equal(packageAudit.featureId, '3edf1509-41e9-4a2f-8005-df510eec43b6');
    assert.equal(packageAudit.webpartId ?? packageAudit.webPartId, '596c7f1c-4d3e-4da8-a7be-27a96024f37c');
    assert.deepEqual(packageAudit.additionalApiPermissions, []);
    const bytes = execFileSync('unzip', ['-p', resolve(root, packageFile.path), packageAudit.bundlePath], { maxBuffer: 8 * 1024 * 1024 });
    assert.equal(hash(bytes), packageAudit.bundleSha256);
    packages.push({ package: packageFile, packageVersion: i ? '0.9.0.1' : '0.9.0.0', functionalBaseline: i ? 'MVP 0.8' : 'MVP 0.9',
      solutionId: packageAudit.solutionId, featureId: packageAudit.featureId, webpartId: packageAudit.webpartId ?? packageAudit.webPartId,
      bundlePath: packageAudit.bundlePath, bundleSha256: packageAudit.bundleSha256, additionalApiPermissions: [] });
  }
  const roundtrip = await bind(`${prefix}/recovery-roundtrip/verification.json`, 'f109e22af10660e964d9e0f8d7e1dd0e0923e732e0aad643908a2f23c21b3d0c');
  assert.equal((await json(roundtrip.path)).status, 'passed');
  return { closure, documentation, complete, inventories, packages, roundtrip };
}
function parsedConfiguration(rows, id, webpartId) {
  const row = rows.find(item => item.id === `${id}-${id === 'E-T' || id === 'Q-T' ? 'item' : 'file'}`);
  assert.ok(row, id);
  const item = row.properties.find(p => p.CanvasContent1), file = row.properties.find(p => p.UniqueId);
  const dom = new JSDOM(item.CanvasContent1);
  const webparts = [...dom.window.document.querySelectorAll('[data-sp-webpartdata]')].map(e => JSON.parse(e.getAttribute('data-sp-webpartdata')));
  dom.window.close();
  const ours = webparts.filter(w => w.id === webpartId);
  assert.equal(ours.length, 1, id);
  return { row, item, file, webparts, ours: ours[0] };
}
async function historicalState(checked) {
  const sources = new Map();
  const read = async path => { sources.set(path, await bind(path)); return json(path); };
  const old = await read(priorTargets);
  assert.equal(sources.get(priorTargets).sha256, 'b402ad864da468baef7e533db4225df3f553adaf7ddca416f253accb04b7e256');
  const c01 = await read(`${prior}/ausgangssicherung/c01-verification.private.json`);
  const c07 = await read(`${prior}/c07-technical-eq-completion-20261016.private.json`);
  assert.equal(c01.status, 'passed');
  assert.equal(c07.status, 'PASS_TECHNICAL_EQ_C07_HUMAN_ACCEPTANCE_AND_OUTLOOK_PENDING');
  assert.equal(c07.scope.packageVersion, '0.8.0.0'); assert.equal(c07.scope.releaseId, oldRelease);
  assert.deepEqual(c07.scope.currentHosts, ids);
  for (const item of [...c01.inputInventory, ...c07.bindings, ...c07.evidence]) sources.set(item.path, await checkBinding(item));
  for (const path of ['docs/betrieb/eq-vollzugsnachweis-mvp08.md', 'docs/betrieb/abnahme-q-mvp08.md']) await readTextSource(path);
  async function readTextSource(path) { sources.set(path, await bind(path)); }
  const rows = await read(`${prior}/ausgangssicherung/configurations-rendered.private.json`);
  const tabs = (await read(`${prior}/ausgangssicherung/teams-tabs.private.json`)).records;
  const catalog = await read(`${prior}/catalog-after/verification.private.json`);
  assert.equal(catalog.status, 'passed'); assert.equal(catalog.version, '0.8.0.0');
  assert.equal(catalog.rows[0].name, old.catalog.existingFileName);
  assert.equal(catalog.rows[0].sha256, c07.scope.packageSha256);
  assert.match(catalog.rows[1].name, /^fristenrechner-web-part_[a-f0-9]+\.js$/);
  for (const row of catalog.rows) await checkBinding(row);
  const esp = await read(`${prior}/hosttests/E-SP/ui-observations-20261016.private.json`);
  const et = await read(`${prior}/hosttests/E-T/configuration-observation-20261016.private.json`);
  const qs = await read(`${prior}/hosttests/c06-q-apps-and-q-sp-publication-20261016.private.json`);
  const qtFirst = await read(`${prior}/hosttests/Q-T/first-transition-block-not-effective-checkpoint-20261016.private.json`);
  const qt = await read(`${prior}/hosttests/Q-T/t02-t03-native-ui-recovery-and-cleanup-completion-20261016.private.json`);
  const alm = await read(`${prior}/hosttests/alm-e-fresh-readback-20261016.private.json`);
  const ePublication = esp.observations.find(item => item.type === 'publish-current-page');
  assert.equal(ePublication.completeWebpartJsonComparedToC01, true);
  assert.equal(ePublication.allOtherWebpartPropertiesReportedUnchanged, true);
  assert.equal(et.fullDecodedWebpartComparison.equalAfterOnlyPermittedMirrorDelta, true);
  assert.equal(qs.Q_SPConfigurationTransition.publication.allWebpartsExactlyExpectedBaselinePlusOnlyMirrorPathDelta, true);
  assert.equal(qtFirst.freshReadOnlyConfigurationReadback.allRemainingWebpartJsonReportedIdenticalByStringAndStructureComparison, true);
  assert.equal(qt.freshReadOnlyServerConfigurationConfirmation.fullWebpartJsonEqualToBeforeTest, true);
  const endpoint = {
    'E-SP': { version: ePublication.publishedVersion, level: ePublication.publishedLevel, mirrorPath: ePublication.newMirrorPath, modified: null },
    'E-T': { version: et.freshObservedItem.OData__UIVersionString, level: null, mirrorPath: et.fullDecodedWebpartComparison.newValue, modified: et.freshObservedItem.Modified },
    'Q-SP': { version: qs.Q_SPConfigurationTransition.publication.version, level: qs.Q_SPConfigurationTransition.publication.level,
      mirrorPath: qs.Q_SPConfigurationTransition.newMirrorPath, modified: qs.Q_SPConfigurationTransition.publication.timeLastModifiedUtc },
    'Q-T': { version: qt.freshReadOnlyServerConfigurationConfirmation.version, level: null,
      mirrorPath: qt.freshReadOnlyServerConfigurationConfirmation.mirrorPath, modified: qt.freshReadOnlyServerConfigurationConfirmation.modified },
  };
  const archivedRollbackFiles = [], targets = [];
  for (const t of old.targets) {
    const base = parsedConfiguration(rows, t.id, old.catalog.webpartId), finish = endpoint[t.id];
    assert.equal(base.ours.instanceId, t.webPartInstanceId); assert.equal(base.item.GUID, t.itemGuid);
    assert.equal(Number(base.item.Id), t.itemId); assert.deepEqual(base.ours.properties, t.documentedProperties);
    assert.equal(finish.mirrorPath, `${t.mirrorParentPath}/${oldRelease}`);
    const installedVersion = t.id.startsWith('E-') ? alm.reads.find(r => r.target === t.id).properties.InstalledVersion
      : t.id === 'Q-SP' ? qs.appUpdates['Q-SP'].installedVersion : qs.appUpdates['Q-T'].laterFreshAlmReadback.InstalledVersion;
    assert.equal(installedVersion, '0.8.0.0');
    const raw = await read(`${prior}/mirrors/${t.id}.verification.private.json`);
    assert.equal(raw.status, 'passed');
    const release = raw.releases.find(item => item.releaseId === oldRelease);
    assert.equal(release.fileCount, 42); assert.equal(release.manifestSha256, checked.inventories[1].manifest.sha256);
    const files = release.files ?? raw.files.filter(file => file.releaseId === oldRelease);
    assert.equal(files.length, 42);
    for (const file of files) {
      const rel = file.relative ?? file.path;
      const path = file.rawPath ?? file.path;
      assert.equal(path, `${prior}/mirrors/raw/${t.id}/${oldRelease}/${rel}`);
      const actual = await bind(path, file.sha256); assert.equal(actual.byteLength, file.byteLength);
      assert.deepEqual(checked.inventories[1].files.find(item => item.path === rel), { path: rel, sha256: actual.sha256, byteLength: actual.byteLength });
      archivedRollbackFiles.push({ ...actual, target: t.id, relative: rel, historicalDownloadedOn: '2026-10-16', freshlyDownloaded: false });
    }
    let teamId = null, channelId = null;
    if (t.host === 'Teams') {
      const tab = tabs.find(tab => tab.id === t.id);
      assert.equal(tab.tabId, t.teamsTabId); assert.equal(tab.name, t.view);
      assert.equal(new URL(tab.iframe).searchParams.get('dest'), t.actualIframeDestination);
      const channel = await read(`${prior}/ausgangssicherung/${t.id}-channel.private.json`);
      assert.equal(channel.result.isError, false); assert.equal(channel.result.structuredContent.channels.length, 1);
      const c = channel.result.structuredContent.channels[0];
      assert.equal(c.team_id, channel.teamId); assert.equal(c.team_name, t.teamName);
      assert.equal(c.display_name, t.channelName); assert.equal(c.match_type, 'exact');
      teamId = c.team_id; channelId = c.id;
    } else {
      assert.equal(base.file.UniqueId, t.fileUniqueId); assert.equal(base.file.ServerRelativeUrl, t.pagePath);
    }
    targets.push({ ...t, teamId, channelId, documentedBaselineOn: '2026-10-16', documentedInstalledVersion: installedVersion,
      documentedPageVersion: finish.version, documentedPageLevel: finish.level, documentedModified: finish.modified,
      documentedProperties: { ...base.ours.properties, sharePointMirrorPath: finish.mirrorPath },
      documentedConfigurationDerivation: 'Complete decoded C01 properties plus only the subsequently observed and compared MVP08 mirror delta. Not a new raw REST or ASPX archive.',
      documentedRecoveryFolderId: release.rootItemId, recoveryMirrorPath: finish.mirrorPath,
      proposedMirrorPath: `${t.mirrorParentPath}/${newRelease}`, proposedMirrorExistsVerified: false, freshRemoteConfirmation: false,
      identityMustBeFreshlyConfirmed: true, sourceFormat: '8.0.0', targetFormat: '9.0.0' });
  }
  assert.equal(archivedRollbackFiles.length, 168);
  const ap5 = parsedConfiguration(rows, 'AP5', old.catalog.webpartId), historical = structuredClone(old.historical);
  assert.equal(ap5.webparts.length, 2); assert.equal(ap5.ours.instanceId, historical.webPartInstanceId);
  assert.equal(ap5.item.GUID, historical.itemGuid); assert.equal(ap5.file.UniqueId, historical.fileUniqueId);
  assert.equal(ap5.file.UIVersionLabel, '1.2'); assert.equal(ap5.file.Level, '2');
  assert.equal(ap5.item.Modified, historical.modified); assert.deepEqual(ap5.ours.properties, historical.properties);
  const alias = tabs.find(tab => tab.id === 'AP5');
  assert.equal(alias.tabId, historical.teamsTabId); assert.equal(alias.iframe, `${historical.pageUrl}?useTeamsAuth=true`);
  await bind(`data/releases/${historical.releaseId}/manifest.json`, historical.manifestSha256);
  await read(`${prior}/hosttests/t09-ap5-combined-ui-observations-20261016.private.json`);
  Object.assign(historical, { documentedBaselineOn: '2026-10-16', documentedLevel: 2,
    documentedCompleteWebparts: ap5.webparts, freshRemoteConfirmation: false, configurationChangeAllowed: false,
    pagePublicationAllowed: false, defaultsWritesAllowed: false, sharedPackageCodeCanChange: true });
  const value = { kind: 'r09c-eq-private-target-proposal', schemaVersion: '1.0.0', preparedOn: '2026-10-18',
    status: 'prepared-not-authorized', freshRemoteConfirmation: false, permissions,
    catalog: { ...old.catalog, documentedSourceVersion: '0.8.0.0', documentedBaselineOn: '2026-10-16',
      proposedVersion: '0.9.0.0', conditionalRecoveryVersion: '0.9.0.1',
      previousPackageSha256: catalog.rows[0].sha256, previousBundleSha256: catalog.rows[1].sha256,
      freshRemoteConfirmation: false, addToAllSites: false },
    targets, historical, sources: [...sources.values()], archivedRollbackFiles,
    localCompletion: checked.closure, documentationCompletion: checked.documentation,
    caveats: ['Historical identities and evidence are checked locally, not freshly online.',
      'C01 and earlier preparation states are not relabelled as the final MVP08 configuration.',
      'Human Q acceptance of MVP08 is recorded separately from C07, whose earlier pending labels remain unchanged.',
      'Full effective M365 permissions, current group membership and current catalogue/site state require a fresh approved preflight.'] };
  validateTargets(value);
  return value;
}
function validateTargets(value) {
  assert.deepEqual(value.permissions, permissions); assert.equal(value.freshRemoteConfirmation, false);
  assert.equal(value.catalog.documentedSourceVersion, '0.8.0.0'); assert.equal(value.catalog.proposedVersion, '0.9.0.0');
  assert.equal(value.catalog.conditionalRecoveryVersion, '0.9.0.1'); assert.equal(value.catalog.addToAllSites, false);
  assert.deepEqual(value.targets.map(t => t.id), ids);
  assert.equal(new Set(value.targets.map(t => t.webPartInstanceId)).size, 4);
  for (const t of value.targets) {
    assert.equal(t.documentedInstalledVersion, '0.8.0.0'); assert.equal(t.documentedBaselineOn, '2026-10-16');
    assert.equal(t.freshRemoteConfirmation, false); assert.equal(t.proposedMirrorExistsVerified, false);
    assert.equal(t.documentedProperties.providerKind, 'sharepointMirror');
    assert.equal(t.documentedProperties.sharePointMirrorPath, `${t.mirrorParentPath}/${oldRelease}`);
    assert.equal(t.recoveryMirrorPath, `${t.mirrorParentPath}/${oldRelease}`);
    assert.equal(t.proposedMirrorPath, `${t.mirrorParentPath}/${newRelease}`);
    assert.deepEqual(t.allowedConfigurationDelta, ['sharePointMirrorPath']);
    assert.equal(t.sourceFormat, '8.0.0'); assert.equal(t.targetFormat, '9.0.0');
  }
  assert.deepEqual(value.targets.map(t => t.documentedPageVersion), ['10.0', '1.0', '8.0', '1.0']);
  assert.equal(value.historical.version, '1.2'); assert.equal(value.historical.documentedLevel, 2);
  for (const key of ['configurationChangeAllowed', 'pagePublicationAllowed', 'defaultsWritesAllowed', 'freshRemoteConfirmation'])
    assert.equal(value.historical[key], false);
  assert.equal(value.archivedRollbackFiles.length, 168);
}
function negativeChecks(value, inventories) {
  const checks = [];
  for (const [id, mutate] of [
    ['old-source-version', v => { v.catalog.documentedSourceVersion = '0.7.0.2'; }],
    ['false-fresh-online-claim', v => { v.freshRemoteConfirmation = true; }],
    ['extra-site-install', v => { v.catalog.addToAllSites = true; }],
    ['stale-q-mirror', v => { v.targets[2].documentedProperties.sharePointMirrorPath = '/old07'; }],
    ['duplicate-target', v => { v.targets[3] = structuredClone(v.targets[2]); }],
    ['ap5-publication', v => { v.historical.pagePublicationAllowed = true; }],
    ['ap5-draft-lost', v => { v.historical.documentedLevel = 1; }],
    ['wrong-rollback-count', v => { v.archivedRollbackFiles.pop(); }],
    ['unapproved-execution', v => { v.permissions.installationAuthorized = true; }],
    ['broadened-property-change', v => { v.targets[0].allowedConfigurationDelta.push('providerKind'); }],
  ]) { const changed = structuredClone(value); mutate(changed); assert.throws(() => validateTargets(changed)); checks.push({ id, rejected: true }); }
  for (const [id, mutate] of [
    ['duplicate-mirror-entry', v => { v.files[1] = v.files[0]; }],
    ['wrong-format', v => { v.formatVersion = '8.0.0'; }],
    ['path-traversal', v => { v.files[1].path = '../outside.json'; }],
  ]) { const changed = structuredClone(inventories[0]); mutate(changed); assert.throws(() => assertInventory(changed, newRelease, '9.0.0')); checks.push({ id, rejected: true }); }
  return checks;
}
async function prepareTargets() {
  const checked = await common(), targets = await historicalState(checked);
  const negatives = negativeChecks(targets, checked.inventories);
  await recheckProtected();
  await writeExclusive(root, targetPath, encode(targets));
  await writeExclusive(root, `${out}/mirror-inventories.json`, encode({ kind: 'r09c-local-mirror-inventories', schemaVersion: '1.0.0',
    source: checked.closure, inventories: checked.inventories, plannedRemoteFileChecks: { normal: 168, rollback: 168 },
    remoteFilesChecked: 0, localHistoricalRollbackCopiesRehashed: 168, noFreshOnlineClaim: true }));
  const binding = await bind(targetPath);
  const lines = ['# R09-C privater Zielanhang', '', 'Nur lokal vorbereitet. Keine Installation, kein Upload und keine frische Onlinebestätigung.',
    '', `Zielbindung SHA-256: \`${binding.sha256}\`.`, '',
    'Grundlage ist der tatsächliche MVP08-Endstand vom 16. Oktober. Vor Vollzug müssen Katalog, vier Apps, vier Konfigurationen, Team-/Kanal-/Tabzuordnungen, Mirrors und Rückfallquellen frisch bestätigt werden. Alte Zwischenstände werden nicht als aktuell übernommen.', '',
    `Katalog: ${targets.catalog.url}`, '', 'Dokumentierter Stand 0.8.0.0. Vorgeschlagener Stand 0.9.0.0. Bedingter Recovery 0.9.0.1 mit Funktionsumfang MVP 0.8.', ''];
  for (const t of targets.targets) lines.push(`## ${t.id} ${t.displayName}`, '', `Site: ${t.siteUrl}`, `Ansicht: ${t.pageUrl ?? t.actualIframeDestination}`,
    `Appinstanz: \`${t.siteAppInstanceId}\`. Webpartinstanz: \`${t.webPartInstanceId}\`.`,
    `Team: \`${t.teamId ?? 'nicht zutreffend'}\`. Kanal: \`${t.channelId ?? 'nicht zutreffend'}\`. Tab: \`${t.teamsTabId ?? 'nicht zutreffend'}\`.`,
    `Nur historisch bestätigt: App \`${t.documentedInstalledVersion}\`, Seite/Item \`${t.documentedPageVersion}\`.`,
    `Neuer Mirrorordner, nicht angelegt oder online geprüft: \`${t.proposedMirrorPath}\`.`,
    `Rückfallquelle, frisch zu prüfen: \`${t.recoveryMirrorPath}\`.`, '');
  lines.push('## Manueller Upload nach gesonderter Freigabe', '', `ZIP: \`${checked.complete.artifacts[1].path}\`.`,
    'Die 42 Dateien gehören unmittelbar in jeden der vier neuen Releaseordner. Keine zusätzliche Verzeichnisebene. Bestehende Dateien und Rechte bleiben unverändert. Anschliessend sind 168 neue und 168 Rückfalldateien vollständig anhand ihrer Originalbytes zu prüfen.', '',
    '## AP5 bleibt erhalten', '', `Seite: ${targets.historical.pageUrl}`, `Alias: \`${targets.historical.teamsTabId}\`.`,
    'Bestehender Entwurf Version 1.2, Level 2, beide Webparts, GitHub-Pin und Daten bleiben erhalten. Nicht publizieren, konfigurieren oder Standards speichern. Der gemeinsame Paketwechsel kann gleichwohl den geladenen Code beeinflussen.', '',
    'Die historische lokale Konfigurationsableitung ist keine neue Roh-ASPX-Sicherung und keine frische Berechtigungsprüfung.', '');
  await writeExclusive(root, `${privateRoot}/Zielanhang.md`, Buffer.from(lines.join('\n')));
  await recheckProtected();
  await writeExclusive(root, `${privateRoot}/preparation-verification.private.json`, encode({ kind: 'r09c-local-target-preparation-verification',
    status: 'passed-local-only', checkedAt: new Date().toISOString(), targetBinding: binding,
    mirrorInventory: await bind(`${out}/mirror-inventories.json`), negativeChecks: negatives,
    historicalRollbackFilesRehashed: 168, protectedInputs: [...protectedInputs.values()], permissions,
    tool: await bind('scripts/prepare-r09c-proposal.mjs'), networkActions: 0, commitsCreated: 0, uploadActions: 0, installationActions: 0 }));
  console.log(JSON.stringify({ targetBinding: binding, localNegativeChecks: negatives.length, mirrorInventory: await bind(`${out}/mirror-inventories.json`),
    protectedInputs: protectedInputs.size, historicalRollbackFilesRehashed: 168, sealed: false, networkActions: 0 }, null, 2));
}
async function seal() {
  const checked = await common(), targets = await json(targetPath), targetBinding = await bind(targetPath);
  validateTargets(targets);
  const derived = await historicalState(checked);
  assert.deepEqual(targets, derived, 'Historical target derivation changed');
  const negatives = negativeChecks(targets, checked.inventories);
  const mirrors = await json(`${out}/mirror-inventories.json`);
  assert.deepEqual(mirrors.inventories, checked.inventories);
  assert.deepEqual(mirrors.plannedRemoteFileChecks, { normal: 168, rollback: 168 });
  assert.equal(mirrors.remoteFilesChecked, 0);
  const documentBindings = [], navigationBindings = [];
  let links = 0;
  for (const path of [...docs, ...liveNavigation]) {
    const text = (await readRegular(root, path)).toString();
    if (docs.includes(path)) {
      assert.ok(!text.includes(';'), `Prose semicolon: ${path}`);
      assert.ok(!text.includes('steimer664.sharepoint.com'), `Private tenant URL in public document: ${path}`);
      for (const t of [...targets.targets, targets.historical]) for (const id of [t.siteAppInstanceId, t.webPartInstanceId, t.itemGuid, t.teamsTabId, t.channelId, t.teamId])
        if (id) assert.ok(!text.includes(id), `Private object identity in public document: ${path}`);
    }
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^https?:|^#/.test(match[1])) continue;
      const linked = relative(root, resolve(root, dirname(path), match[1].split('#')[0]));
      if (![`${out}/proposal.json`, `${out}/proposal-verification.json`].includes(linked)) await readRegular(root, linked);
      links++;
    }
    (docs.includes(path) ? documentBindings : navigationBindings).push(await bind(path));
  }
  assert.ok((await readRegular(root, docs[0])).toString().includes(targetBinding.sha256));
  await recheckProtected();
  const proposal = { kind: 'r09c-eq-installation-proposal', schemaVersion: '1.0.0', preparedOn: '2026-10-18',
    status: 'prepared-awaiting-separate-execution-approval', permissions, localCompletion: checked.closure,
    documentationCompletion: checked.documentation, historicalDocumentationCheckedThroughArchivedAfterCopies: true,
    documents: documentBindings, currentNavigation: navigationBindings,
    privateTargetBinding: { sha256: targetBinding.sha256, byteLength: targetBinding.byteLength, targetCount: 4, publiclyIncluded: false },
    artifacts: checked.complete.artifacts.filter(item => !item.path.endsWith('steimer-web.zip')),
    packageIdentities: checked.packages, releaseId: newRelease, rollbackReleaseId: oldRelease,
    mirrors: await bind(`${out}/mirror-inventories.json`), actualPackageRoundtrip: checked.roundtrip,
    gates: ['R09C-U01 separate upload approval', 'R09C-H01 conditional recovery approval', 'R09C-I01 separate installation approval',
      'Fresh exact current baseline and private backup', '168 normal and 168 rollback remote original files verified',
      'E gate before Q transition', 'Real device, guest and manual Q acceptance remain separate'],
    localChecks: { normalFiles: 42, rollbackFiles: 42, historicalRemoteCopiesRehashed: 168, productInputsUnchanged: 241,
      fixturesUnchanged: 714, runtimeFilesUnchanged: 42, mirrorZipExact: true, actualPackageBundleBytesVerified: true,
      exactHistoricalDraftAndAliasPreserved: true, privateTargetsExcludedFromPublicDocs: true, localLinks: links,
      negativeChecks: negatives.length, protectedInputsRechecked: protectedInputs.size },
    freshRemoteChecksPerformed: false, executedHostTests: 0, commitsCreated: 0, uploadsPerformed: 0, installationPerformed: false,
    tool: await bind('scripts/prepare-r09c-proposal.mjs') };
  await writeExclusive(root, `${out}/proposal.json`, encode(proposal));
  await writeExclusive(root, `${out}/proposal-verification.json`, encode({ kind: 'r09c-local-proposal-verification',
    schemaVersion: '1.0.0', checkedAt: new Date().toISOString(), status: 'passed-local-preparation-only',
    proposal: await bind(`${out}/proposal.json`), documents: documentBindings, currentNavigation: navigationBindings,
    privateTargetBinding: proposal.privateTargetBinding, localChecks: proposal.localChecks, negativeChecks: negatives, permissions,
    noNewBuildOrDataRelease: true, noNetworkAccess: true, noGitMutation: true,
    limit: 'No fresh remote inventory, upload, installation, live recovery or M365 host test. Historical evidence is not relabelled as current.' }));
  console.log(JSON.stringify({ proposal: await bind(`${out}/proposal.json`), verification: await bind(`${out}/proposal-verification.json`),
    privateTargetSha256: targetBinding.sha256, localChecks: proposal.localChecks }, null, 2));
}
assert.equal(process.argv.length, 3);
if (process.argv[2] === '--prepare-targets') await prepareTargets();
else if (process.argv[2] === '--check') { const checked = await common(), targets = await historicalState(checked); await recheckProtected(); console.log(JSON.stringify({ passed: true, negativeChecks: negativeChecks(targets, checked.inventories).length, protectedInputs: protectedInputs.size })); }
else { assert.equal(process.argv[2], '--seal'); await seal(); }
