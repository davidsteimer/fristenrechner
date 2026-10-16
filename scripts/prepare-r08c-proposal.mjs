// SPDX-License-Identifier: AGPL-3.0-only
// Local proposal only. No network, upload, package build, Git mutation or installation.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { root, prefix, hash, encode } from './consolidate-mvp08-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp08-source-approval.mjs';

const out = `${prefix}/r08c`;
const privateRoot = '.work/deployments/2026-10-15-eq-mvp08/vorbereitung';
const priorRoot = '.work/deployments/2026-10-09-eq-mvp07-0702';
const targetPath = `${privateRoot}/targets.private.json`;
const oldRelease = '2026-10-08-mvp-07-approved.1';
const newRelease = '2026-10-15-mvp-08-approved.1';
const docs = ['docs/betrieb/eq-installationsvorlage-mvp08.md', 'docs/betrieb/rueckfall-mvp08.md', 'docs/betrieb/pruefmatrix-mvp08.md'];
const ids = ['E-SP', 'E-T', 'Q-SP', 'Q-T'];
const json = async path => JSON.parse(await readRegular(root, path));
const bind = async (path, expected) => {
  const bytes = await readRegular(root, path);
  const item = {path, byteLength: bytes.length, sha256: hash(bytes)};
  if (expected) assert.equal(item.sha256, expected, path);
  return item;
};
const permissions = {installationAuthorized: false, uploadAuthorized: false, recoveryExecutionAuthorized: false,
  githubPushAuthorized: false, operatingApproval: false, additionalCommitAuthorized: false};
async function common() {
  const closure = await bind(`${prefix}/local-completion.json`, '68a91b538cc7437d91932e04cf3bb320a0378c201714d0e440aa36ec7e957864');
  const complete = await json(closure.path);
  assert.equal(complete.status, 'passed');
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(), complete.dataCommit);
  assert.equal(execFileSync('git', ['diff', '--cached', '--name-only'], {cwd: root, encoding: 'utf8'}).trim(), '');
  for (const item of complete.artifacts) assert.deepEqual(await bind(item.path), item);
  for (const path of [`${prefix}/product-build.json`, `${prefix}/artifact-verification.json`,
    `${prefix}/recovery-0.8.0.1/artifact-verification.json`]) {
    const item = complete.evidence.find(entry => entry.path === path);
    assert.ok(item, `Missing bound R08-B evidence: ${path}`);
    assert.deepEqual(await bind(item.path), item);
  }
  const product = await json(`${prefix}/product-build.json`);
  assert.equal(product.inputs.length, 210);
  assert.equal(product.runtimeFiles.length, 42);
  for (const item of [...product.inputs, ...product.runtimeFiles]) assert.deepEqual(await bind(item.path), item);
  const audit = await json(`${prefix}/artifact-verification.json`);
  const recovery = await json(`${prefix}/recovery-0.8.0.1/artifact-verification.json`);
  const roundtrip = await bind(`${prefix}/recovery-roundtrip/verification.json`, '07a5187e4869104568ca0d39b70bc4bee9ec3a427780ff450b129bb8504526e4');
  assert.equal((await json(roundtrip.path)).status, 'passed');
  const inventories = [];
  for (const [releaseId, count, expected] of [[newRelease, 42, '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4'],
    [oldRelease, 41, 'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597']]) {
    const base = `data/releases/${releaseId}`;
    const manifest = await bind(`${base}/manifest.json`, expected);
    const parsed = await json(manifest.path);
    const files = [manifest];
    for (const item of parsed.artifacts) {
      const actual = await bind(`${base}/${item.path}`, item.sha256);
      files.push(actual);
    }
    assert.equal(files.length, count);
    assert.equal(new Set(files.map(item => item.path)).size, count);
    inventories.push({releaseId, manifest, files: files.map(item => ({...item, path: item.path.slice(base.length + 1)}))});
  }
  const zip = complete.artifacts[1];
  const zipEntries = execFileSync('unzip', ['-Z1', resolve(root, zip.path)], {encoding: 'utf8'}).trim().split('\n').sort();
  assert.deepEqual(zipEntries, inventories[0].files.map(item => item.path).sort());
  for (const item of inventories[0].files) {
    const bytes = execFileSync('unzip', ['-p', resolve(root, zip.path), item.path], {maxBuffer: 8 * 1024 * 1024});
    assert.equal(hash(bytes), item.sha256); assert.equal(bytes.length, item.byteLength);
  }
  const packages = [audit.packageAudit, recovery.packageAudit];
  for (const [i, p] of packages.entries()) {
    assert.equal(p.solutionId, '13090feb-a6bf-40fa-9d3c-ec8d90516a60');
    assert.equal(p.featureId, '3edf1509-41e9-4a2f-8005-df510eec43b6');
    assert.equal(p.webpartId ?? p.webPartId, '596c7f1c-4d3e-4da8-a7be-27a96024f37c');
    assert.deepEqual(p.additionalApiPermissions, []);
    const packagePath = complete.artifacts[i === 0 ? 0 : 3].path;
    const bytes = execFileSync('unzip', ['-p', resolve(root, packagePath), p.bundlePath], {maxBuffer: 8 * 1024 * 1024});
    assert.equal(hash(bytes), p.bundleSha256);
  }
  return {closure, complete, inventories, roundtrip, packages: packages.map(p => ({solutionId: p.solutionId, featureId: p.featureId,
    webpartId: p.webpartId ?? p.webPartId, bundlePath: p.bundlePath, bundleSha256: p.bundleSha256, additionalApiPermissions: []}))};
}
async function prepareTargets() {
  const checked = await common();
  const sourceNames = [
    '.work/deployments/2026-10-08-eq-mvp07/vorbereitung/targets.private.json',
    ...['configuration-baseline.private.json', 'q-sp-transition.private.json', 'q-t-transition.private.json',
      'catalog-readback/verification.private.json', 'alm-after-e.private.json', 'mirrors/verification.private.json',
      'network/q-sp-firstload-verification.private.json', 'network/q-t-firstload-verification.private.json'].map(name => `${priorRoot}/${name}`),
    'docs/betrieb/eq-vollzugsnachweis-mvp07-0702.md', 'docs/betrieb/abnahme-q-mvp07.md'];
  const sources = await Promise.all(sourceNames.map(path => bind(path)));
  assert.equal(sources[0].sha256, 'd09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec');
  assert.equal(sources[1].sha256, '24d38d34cff1f3e0ce20d1923e4ab31f2455c3a4b68f81a55332c84dbe968ddf');
  const old = await json(sourceNames[0]), baseline = await json(sourceNames[1]);
  const qsp = await json(sourceNames[2]), qt = await json(sourceNames[3]);
  const raw = await json(`${priorRoot}/mirrors/verification.private.json`);
  const identity = baseline.freshVersionAndFileIdentitySupplement;
  const targets = old.targets.map(t => {
    const b = baseline.instances.find(item => item.target === t.id);
    assert.ok(b); assert.equal(b.siteUrl, t.siteUrl);
    const previousProperties = {...b.properties};
    if (t.id === 'Q-SP') {
      assert.equal(qsp.webPartInstanceId, b.webPartInstanceId);
      previousProperties.sharePointMirrorPath = qsp.newMirrorPath;
    }
    if (t.id === 'Q-T') {
      assert.equal(qt.sourceSwitch.readback.webPartInstanceId, b.webPartInstanceId);
      assert.equal(qt.mirrorReleaseNow, oldRelease);
      previousProperties.sharePointMirrorPath = `${t.mirrorParentPath}/${qt.mirrorReleaseNow}`;
    }
    const oldPath = `${t.mirrorParentPath}/${oldRelease}`;
    assert.equal(previousProperties.sharePointMirrorPath, oldPath);
    const mirror = raw.mirrors.find(m => m.target === t.id && m.releaseId === oldRelease);
    assert.equal(mirror.fileCount, 41); assert.equal(mirror.passed, true);
    return {id: t.id, host: t.host, displayName: t.displayName, siteUrl: t.siteUrl,
      documentedSiteId: t.documentedSiteId, documentedDriveId: t.documentedDriveId, documentedParentItemId: t.documentedParentItemId,
      siteAppInstanceId: b.siteAppInstanceId, view: b.actualTabTitle ?? t.view,
      pagePath: b.pagePath ?? null, pageUrl: b.pagePath ? new URL(b.pagePath, t.siteUrl).href : null,
      fileUniqueId: identity.fileUniqueIds[t.id] ?? null, teamsTabId: identity.teamsTabIds[t.id] ?? null,
      listId: b.listId ?? null, itemId: b.itemId, itemGuid: b.itemGuid, webPartInstanceId: b.webPartInstanceId,
      actualIframeDestination: b.actualIframeDestination ?? null,
      teamName: t.host === 'Teams' ? t.displayName : null, channelName: t.host === 'Teams' ? 'Fristenrechner' : null,
      teamId: null, channelId: null, teamChannelAssociationRequiresFreshCheck: t.host === 'Teams',
      documentedPageVersion: t.id === 'Q-SP' ? qsp.publishedVersion : b.version,
      documentedInstalledVersion: '0.7.0.2', documentedBaselineOn: '2026-10-09', freshRemoteConfirmation: false,
      documentedProperties: previousProperties, mirrorParentPath: t.mirrorParentPath, mirrorParentUrl: t.mirrorParentUrl,
      documentedRecoveryFolderId: mirror.rootItemId, recoveryMirrorPath: oldPath,
      proposedMirrorPath: `${t.mirrorParentPath}/${newRelease}`, proposedMirrorExistsVerified: false,
      allowedConfigurationDelta: ['sharePointMirrorPath'], preserveOtherFreshProperties: true};
  });
  assert.deepEqual(targets.map(t => t.id), ids);
  const archivedRollbackFiles = [];
  for (const t of targets) {
    const m = raw.mirrors.find(item => item.target === t.id && item.releaseId === oldRelease);
    for (const file of m.files) {
      const copy = await bind(`${priorRoot}/mirrors/raw/${t.id}/${oldRelease}/${file.path}`, file.sha256);
      assert.equal(copy.byteLength, file.byteLength);
      assert.deepEqual(checked.inventories[1].files.find(item => item.path === file.path),
        {path: file.path, byteLength: file.byteLength, sha256: file.sha256});
      archivedRollbackFiles.push({...copy, target: t.id});
    }
  }
  assert.equal(archivedRollbackFiles.length, 164);
  const historical = {...old.historical, ...baseline.historical,
    fileUniqueId: identity.fileUniqueIds.AP5, teamsTabId: identity.teamsTabIds.AP5,
    freshRemoteConfirmation: false, configurationChangeAllowed: false, pagePublicationAllowed: false, defaultsWritesAllowed: false};
  await bind(`data/releases/${historical.releaseId}/manifest.json`, historical.manifestSha256);
  const catalogReadback = await json(`${priorRoot}/catalog-readback/verification.private.json`);
  const value = {kind: 'r08c-eq-private-target-proposal', schemaVersion: '1.0.0', preparedOn: '2026-10-15',
    status: 'prepared-not-authorized', freshRemoteConfirmation: false, permissions,
    catalog: {url: old.catalog.url, existingFileName: old.catalog.existingFileName, documentedItemId: old.catalog.documentedItemId,
      solutionId: old.catalog.solutionId, featureId: old.catalog.featureId, webpartId: old.catalog.webpartId,
      documentedSourceVersion: '0.7.0.2', proposedVersion: '0.8.0.0', conditionalRecoveryVersion: '0.8.0.1', addToAllSites: false,
      previousPackageSha256: catalogReadback.package.sha256, previousBundleSha256: catalogReadback.bundle.sha256},
    targets, historical, sources, archivedRollbackFiles, localCompletion: checked.closure,
    caveats: ['Historical object identities and local bytes only. No remote confirmation on 15 October.',
      'Old proposal sourceVersion and pre-transition Q properties are not used as current baseline.',
      'Later full execution and network evidence close earlier intermediate Q statuses without rewriting them.']};
  await writeExclusive(root, targetPath, encode(value));
  await writeExclusive(root, `${out}/mirror-inventories.json`, encode({kind: 'r08c-local-mirror-inventories',
    schemaVersion: '1.0.0', source: checked.closure, inventories: checked.inventories,
    plannedRemoteFileChecks: {normal: 168, rollback: 164}, remoteFilesChecked: 0}));
  const targetBinding = await bind(targetPath);
  const lines = ['# R08-C privater Zielanhang', '', 'Stand: 15. Oktober 2026. Nur lokal vorbereitet. Keine Installation, kein Upload und keine frische Onlinebestätigung.',
    '', `Zielbindung SHA-256: \`${targetBinding.sha256}\`.`, '',
    'Die Identitäten stammen aus den gebundenen Belegen vom 9. Oktober. Vor einem Vollzug vollständig frisch bestätigen. Team- und Kanal-IDs werden nicht erfunden. Tab-ID und tatsächliches SharePoint-Ziel sind gebunden, ihre aktuelle Team-/Kanalzuordnung bleibt zu prüfen.', '',
    `Katalog: ${old.catalog.url}`, `Bestehende Datei: \`${old.catalog.existingFileName}\`. Dokumentierter Stand 0.7.0.2, Ziel 0.8.0.0, bedingter Recovery 0.8.0.1.`, ''];
  for (const t of targets) lines.push(`## ${t.id} ${t.displayName}`, '', `Site: ${t.siteUrl}`, `Ansicht: ${t.pageUrl ?? t.actualIframeDestination}`,
    `Appinstanz: \`${t.siteAppInstanceId}\`. Webpartinstanz: \`${t.webPartInstanceId}\`.`,
    `Tab: \`${t.teamsTabId ?? 'keine Teamsregisterkarte'}\`. Item: \`${t.itemId}\`, Item-GUID: \`${t.itemGuid}\`.`,
    `Neuer Ordner, noch nicht angelegt oder online geprüft: \`${t.proposedMirrorPath}\``,
    `Rückfallpfad, vor Vollzug frisch prüfen: \`${t.recoveryMirrorPath}\``, '');
  lines.push('## Upload und Rückfall', '', `Das lokale ZIP \`${prefix}/fristenrechner-mvp08-sharepoint-mirror.zip\` enthält 42 Dateien direkt ab manifest.json, ohne zusätzliche Release-Verzeichnisebene. Nach separater Uploadfreigabe gehört dieser Inhalt in jeden der vier oben bezeichneten neuen Releaseordner. Keine alten Dateien überschreiben und keine Rechte verändern.`, '',
    'Die bestehende AP5-Seite und ihr Teams-Alias bleiben unverändert, einschliesslich Entwurf und GitHub-Pin. Ihre Identitäten stehen im JSON-Zielanhang. Andere Inhalte sind nicht Teil des Auftrags.', '',
    'Vollständige Eigenschaften und Istberechtigungen werden erst im frischen Vorlauf gesichert. Dieser historische Zielanhang ersetzt diese Sicherung nicht.', '');
  await writeExclusive(root, `${privateRoot}/Zielanhang.md`, Buffer.from(lines.join('\n')));
  console.log(JSON.stringify({targetBinding, privateGuide: `${privateRoot}/Zielanhang.md`, rollbackFiles: 164, remoteAccess: false}, null, 2));
}
async function seal() {
  const checked = await common();
  const targetBinding = await bind(targetPath);
  const privateTargets = await json(targetPath);
  assert.deepEqual(privateTargets.permissions, permissions);
  for (const source of privateTargets.sources) assert.deepEqual(await bind(source.path), source);
  for (const file of privateTargets.archivedRollbackFiles) {
    const {target, ...item} = file; assert.ok(ids.includes(target)); assert.deepEqual(await bind(item.path), item);
  }
  const inventories = await json(`${out}/mirror-inventories.json`);
  assert.deepEqual(inventories.inventories, checked.inventories);
  const documentBindings = [];
  let links = 0;
  for (const path of docs) {
    const text = (await readRegular(root, path)).toString();
    assert.ok(!text.includes(';'), `Prose semicolon: ${path}`);
    assert.ok(!text.includes('steimer664.sharepoint.com'), `Private tenant URL in public document: ${path}`);
    for (const t of privateTargets.targets) for (const id of [t.siteAppInstanceId, t.webPartInstanceId, t.itemGuid, t.teamsTabId])
      if (id) assert.ok(!text.includes(id), `Private instance ID in public document: ${path}`);
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^https?:|^#/.test(match[1])) continue;
      const linked = relative(root, resolve(root, dirname(path), match[1].split('#')[0]));
      if (linked !== `${out}/proposal.json` && linked !== `${out}/proposal-verification.json`) await readRegular(root, linked);
      links++;
    }
    documentBindings.push(await bind(path));
  }
  assert.ok((await readRegular(root, docs[0])).toString().includes(targetBinding.sha256));
  const proposal = {kind: 'r08c-eq-installation-proposal', schemaVersion: '1.0.0', preparedOn: '2026-10-15',
    status: 'prepared-awaiting-separate-execution-approval', permissions, localCompletion: checked.closure,
    documents: documentBindings, privateTargetBinding: {sha256: targetBinding.sha256, byteLength: targetBinding.byteLength, targetCount: 4, publiclyIncluded: false},
    artifacts: checked.complete.artifacts.filter(item => !item.path.endsWith('steimer-web.zip')),
    packageIdentities: checked.packages, releaseId: newRelease, rollbackReleaseId: oldRelease,
    mirrors: await bind(`${out}/mirror-inventories.json`), actualPackageRoundtrip: checked.roundtrip,
    gates: ['R08C-U01 separate upload authority', 'R08C-H01 conditional recovery approved by David',
      'R08C-I01 separate installation authority', 'C01 fresh exact current baseline and private backup',
      'C03 168 new and 164 rollback remote file bodies verified', 'E gate before Q configuration',
      'Real device and guest evidence and manual Q acceptance'],
    localChecks: {normalFiles: 42, rollbackFiles: 41, historicalRemoteCopiesRehashed: 164,
      productInputsUnchanged: 210, runtimeFilesUnchanged: 42, mirrorZipExact: true,
      normalAndRecoveryBundleBytesVerified: true, privateTargetsExcludedFromPublicDocs: true, localLinks: links},
    freshRemoteChecksPerformed: false, executedHostTests: 0, commitsCreated: 0, uploadsPerformed: 0, installationPerformed: false,
    tool: await bind('scripts/prepare-r08c-proposal.mjs')};
  await writeExclusive(root, `${out}/proposal.json`, encode(proposal));
  const receipt = {kind: 'r08c-local-proposal-verification', schemaVersion: '1.0.0', checkedAt: new Date().toISOString(),
    status: 'passed-local-preparation-only', proposal: await bind(`${out}/proposal.json`), documents: documentBindings,
    privateTargetBinding: proposal.privateTargetBinding, checks: proposal.localChecks, permissions,
    noNewBuildOrDataRelease: true, noNetworkAccess: true, noGitMutation: true,
    limit: 'No remote inventory, upload, installation, live recovery or M365 host test. Historical evidence is not relabelled as current.'};
  await writeExclusive(root, `${out}/proposal-verification.json`, encode(receipt));
  console.log(JSON.stringify({proposal: receipt.proposal, verification: await bind(`${out}/proposal-verification.json`),
    documents: documentBindings, privateTargetSha256: targetBinding.sha256, checks: receipt.checks}, null, 2));
}
assert.equal(process.argv.length, 3);
if (process.argv[2] === '--prepare-targets') await prepareTargets();
else {assert.equal(process.argv[2], '--seal'); await seal();}
