// SPDX-License-Identifier: AGPL-3.0-only
// Local document/artifact binding only. No network, build, deployment or Git writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRegular, writeExclusive } from './record-mvp08-source-approval.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp10-2026-10-28';
const out = `${prefix}/r10c`;
const privateRoot = '.work/deployments/2026-10-29-eq-mvp10';
const targetPath = `${privateRoot}/vorbereitung/targets.private.json`;
const newRelease = '2026-10-28-mvp-010-approved.1';
const oldRelease = '2026-10-18-mvp-09-approved.1';
const docs = ['docs/betrieb/eq-installationsvorlage-mvp10.md', 'docs/betrieb/rueckfall-mvp10.md', 'docs/betrieb/pruefmatrix-mvp10.md'];
const permissions = { installationAuthorized: false, uploadAuthorized: false, recoveryExecutionAuthorized: false,
  githubPushAuthorized: false, operatingApproval: false, additionalCommitAuthorized: false };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const json = async path => JSON.parse(await readRegular(root, path));
const bound = new Map();
async function bind(path, expected) {
  const bytes = await readRegular(root, path);
  const value = { path, byteLength: bytes.length, sha256: hash(bytes) };
  if (expected) assert.equal(value.sha256, expected, path);
  if (bound.has(path)) assert.deepEqual(bound.get(path), value, path);
  bound.set(path, value);
  return value;
}
async function check(item) {
  const actual = await bind(item.path, item.sha256);
  if (item.byteLength !== undefined) assert.equal(actual.byteLength, item.byteLength, item.path);
  return actual;
}
async function preserve() {
  for (const b of bound.values()) {
    const bytes = await readRegular(root, b.path);
    assert.equal(bytes.length, b.byteLength, b.path);
    assert.equal(hash(bytes), b.sha256, b.path);
  }
}
function safePath(path) {
  assert.equal(typeof path, 'string');
  assert.ok(path && !path.startsWith('/') && !path.includes('\\'));
  assert.ok(path.split('/').every(part => part && part !== '.' && part !== '..'));
}
async function fileList(path, prefixPath = '') {
  const values = [];
  for (const item of await readdir(resolve(root, path), { withFileTypes: true })) {
    assert.ok(!item.isSymbolicLink(), path);
    const name = `${prefixPath}${item.name}`;
    if (item.isDirectory()) values.push(...await fileList(`${path}/${item.name}`, `${name}/`));
    else { assert.ok(item.isFile()); values.push(name); }
  }
  return values.sort();
}
export function validateInventory(value, releaseId, formatVersion, count) {
  assert.equal(value.releaseId, releaseId);
  assert.equal(value.formatVersion, formatVersion);
  assert.equal(value.files.length, count);
  assert.equal(new Set(value.files.map(item => item.path)).size, count);
  assert.equal(value.files.filter(item => item.path === 'manifest.json').length, 1);
  for (const item of value.files) {
    safePath(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength > 0);
  }
}
async function inventory(releaseId, formatVersion, count, manifestHash) {
  const base = `data/releases/${releaseId}`;
  const manifest = await bind(`${base}/manifest.json`, manifestHash);
  const parsed = await json(manifest.path);
  assert.equal(parsed.releaseId, releaseId);
  assert.equal(parsed.formatVersion, formatVersion);
  const files = [manifest];
  for (const item of parsed.artifacts) {
    safePath(item.path);
    files.push(await bind(`${base}/${item.path}`, item.sha256));
  }
  const value = { releaseId, formatVersion, manifest,
    files: files.map(item => ({ ...item, path: item.path.slice(base.length + 1) })) };
  validateInventory(value, releaseId, formatVersion, count);
  assert.deepEqual(await fileList(base), value.files.map(item => item.path).sort());
  return value;
}
function unzip(path, entry) {
  return execFileSync('unzip', ['-p', resolve(root, path), entry], { maxBuffer: 32 * 1024 * 1024 });
}
async function common() {
  const closure = await bind(`${prefix}/local-completion.json`, '433110e9d13d03fffb335eee95cde9fc0b0186f5b8d33358d73323aac51ee29b');
  const complete = await json(closure.path);
  assert.equal(complete.status, 'passed');
  assert.equal(complete.packageVersion, '0.10.0.0');
  assert.equal(complete.recoveryPackageVersion, '0.10.0.1');
  assert.equal(complete.localDataPin.commit, '01bbd96a296b0fc4d64cd554acc8cb122c3017a3');
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), complete.localDataPin.commit);
  assert.equal(execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8' }).trim(), '');
  for (const b of [...complete.artifacts, ...complete.implementation, complete.closingDocument, ...complete.livingEntryDocuments]) await check(b);
  for (const b of complete.localDataPin.files) await check(b);
  const reportPaths = ['artifact-verification.json', 'recovery-0.10.0.1/artifact-verification.json',
    'recovery-roundtrip/verification.json', 'portability/attempt-05/report.json'];
  const reports = [];
  for (const name of reportPaths) {
    const expected = [...complete.reports, complete.portability].find(item => item.path === `${prefix}/${name}`);
    assert.ok(expected, `Report not bound in R10-B: ${name}`);
    reports.push(await check(expected));
  }
  const normal = await json(reports[0].path), recovery = await json(reports[1].path);
  assert.equal(normal.status, 'passed'); assert.equal(recovery.passed, true);
  assert.equal((await json(reports[2].path)).status, 'passed');
  const inventories = [await inventory(newRelease, '17.0.0', 45, complete.localDataPin.manifestSha256),
    await inventory(oldRelease, '9.0.0', 42, '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265')];
  const mirror = complete.artifacts.find(item => item.path.endsWith('sharepoint-mirror.zip'));
  const names = execFileSync('unzip', ['-Z1', resolve(root, mirror.path)], { encoding: 'utf8' }).trim().split('\n').sort();
  assert.deepEqual(names, inventories[0].files.map(item => item.path).sort());
  for (const item of inventories[0].files) {
    const bytes = unzip(mirror.path, item.path);
    assert.equal(bytes.length, item.byteLength); assert.equal(hash(bytes), item.sha256);
  }
  const packages = [];
  for (const [i, audit] of [normal.packageAudit, recovery.packageAudit].entries()) {
    const artifact = complete.artifacts.find(item => item.path.endsWith(i ? 'recovery-0.10.0.1.sppkg' : 'schweiz-0.10.0.0.sppkg'));
    assert.equal(audit.solutionId, '13090feb-a6bf-40fa-9d3c-ec8d90516a60');
    assert.equal(audit.featureId, '3edf1509-41e9-4a2f-8005-df510eec43b6');
    assert.equal(audit.webpartId ?? audit.webPartId, '596c7f1c-4d3e-4da8-a7be-27a96024f37c');
    assert.deepEqual(audit.additionalApiPermissions, []);
    assert.equal(hash(unzip(artifact.path, audit.bundlePath)), audit.bundleSha256);
    const xml = unzip(artifact.path, 'AppManifest.xml').toString();
    assert.ok(xml.includes(`Version="${i ? '0.10.0.1' : '0.10.0.0'}"`));
    assert.ok(xml.toLowerCase().includes(audit.solutionId));
    packages.push({ artifact, packageVersion: i ? '0.10.0.1' : '0.10.0.0', functionalBaseline: i ? 'MVP 0.9' : 'MVP 0.10',
      solutionId: audit.solutionId, featureId: audit.featureId, webpartId: audit.webpartId ?? audit.webPartId,
      bundlePath: audit.bundlePath, bundleSha256: audit.bundleSha256, additionalApiPermissions: [] });
  }
  return { closure, complete, inventories, mirror, packages, reports };
}
async function prepareMirrors() {
  const c = await common();
  const uploadRoot = `${privateRoot}/manueller-upload/${newRelease}`;
  const files = [];
  for (const item of c.inventories[0].files) {
    const path = `${uploadRoot}/${item.path}`;
    await writeExclusive(root, path, unzip(c.mirror.path, item.path));
    files.push(await check({ ...item, path }));
  }
  assert.deepEqual(await fileList(uploadRoot), c.inventories[0].files.map(item => item.path).sort());
  await writeExclusive(root, `${out}/mirror-inventories.json`, encode({ kind: 'r10c-local-mirror-inventories', schemaVersion: '1.0.0',
    inventories: c.inventories, plannedRemoteFileChecks: { normal: 180, rollback: 168, total: 348 },
    remoteFilesChecked: 0, freshOnlineConfirmation: false, source: c.closure }));
  await writeExclusive(root, `${privateRoot}/manueller-upload/verification.json`, encode({ kind: 'r10c-local-upload-copy',
    status: 'passed-local-only', sourceZip: c.mirror, files, uploaded: false, uploadAuthorized: false }));
  await preserve();
  console.log(JSON.stringify({ mirrorInventory: await bind(`${out}/mirror-inventories.json`), localUploadFiles: files.length, remoteActions: 0 }));
}
export function validateTargets(t) {
  assert.equal(t.freshRemoteConfirmation, false);
  assert.equal(t.catalog.documentedSourceVersion, '0.9.0.0');
  assert.equal(t.catalog.proposedVersion, '0.10.0.0');
  assert.equal(t.catalog.conditionalRecoveryVersion, '0.10.0.1');
  assert.equal(t.catalog.addToAllSites, false);
  assert.deepEqual(t.targets.map(x => x.id), ['E-SP', 'E-T', 'Q-SP', 'Q-T']);
  assert.equal(new Set(t.targets.map(x => x.webPartInstanceId)).size, 4);
  assert.deepEqual(t.permissions, permissions);
  for (const x of t.targets) {
    assert.equal(x.documentedInstalledVersion, '0.9.0.0');
    assert.equal(x.freshRemoteConfirmation, false);
    assert.equal(x.documentedProperties.providerKind, 'sharepointMirror');
    assert.equal(x.documentedProperties.sharePointMirrorPath, `${x.mirrorParentPath}/${oldRelease}`);
    assert.equal(x.recoveryMirrorPath, `${x.mirrorParentPath}/${oldRelease}`);
    assert.equal(x.proposedMirrorPath, `${x.mirrorParentPath}/${newRelease}`);
    assert.equal(x.proposedMirrorExistsVerified, false);
    assert.deepEqual(x.allowedConfigurationDelta, ['sharePointMirrorPath']);
  }
  for (const name of ['configurationChangeAllowed', 'pagePublicationAllowed', 'defaultsWritesAllowed', 'freshRemoteConfirmation'])
    assert.equal(t.historical[name], false);
  assert.equal(t.archivedRollbackFiles.length, 168);
}
function negativeChecks(targets, inv) {
  const checks = [];
  for (const [id, mutate] of [
    ['false-live-confirmation', x => { x.freshRemoteConfirmation = true; }],
    ['extra-target', x => { x.targets.push(x.targets[0]); }],
    ['wrong-source-version', x => { x.catalog.documentedSourceVersion = '0.8.0.0'; }],
    ['wrong-recovery-version', x => { x.catalog.conditionalRecoveryVersion = '0.9.0.1'; }],
    ['old-q-source', x => { x.targets[2].documentedProperties.sharePointMirrorPath = '/wrong'; }],
    ['broad-property-delta', x => { x.targets[0].allowedConfigurationDelta.push('providerKind'); }],
    ['installation-approval-inferred', x => { x.permissions.installationAuthorized = true; }],
    ['automatic-site-install', x => { x.catalog.addToAllSites = true; }],
    ['ap5-publication', x => { x.historical.pagePublicationAllowed = true; }],
    ['missing-old-file', x => { x.archivedRollbackFiles.pop(); }]
  ]) { const value = structuredClone(targets); mutate(value); assert.throws(() => validateTargets(value)); checks.push({ id, rejected: true }); }
  for (const [id, mutate] of [
    ['duplicate-file', x => { x.files[1] = x.files[0]; }],
    ['path-traversal', x => { x.files[1].path = '../outside.json'; }],
    ['wrong-data-format', x => { x.formatVersion = '9.0.0'; }]
  ]) { const value = structuredClone(inv); mutate(value); assert.throws(() => validateInventory(value, newRelease, '17.0.0', 45)); checks.push({ id, rejected: true }); }
  return checks;
}
async function proposal() {
  const c = await common(), targets = await json(targetPath);
  validateTargets(targets);
  const targetBinding = await bind(targetPath, 'dd50cdd78f9508770be9a5dbe78044256f3e19a1aae1d807635187d1c7103924');
  const targetProof = await bind(`${privateRoot}/vorbereitung/verification.private.json`, '2d7968dd2f26c97e900c121d015a0fdd0ccd0d7b23f90569c60957b838cfcef7');
  const targetResult = await json(targetProof.path);
  assert.equal(targetResult.status, 'passed-local-only');
  assert.deepEqual(targetResult.targetBinding, targetBinding);
  assert.equal(targetResult.historicalMirrorFilesRehashed, 168);
  assert.equal(targetResult.newLocalRuntimeFiles, 45);
  assert.equal(targetResult.freshRemoteConfirmation, false);
  assert.equal(targetResult.networkRequests, 0);
  for (const b of targets.sourceBindings) await check(b);
  await check(targetResult.annex);
  await check(targetResult.generator);
  for (const file of targets.archivedRollbackFiles) await check(file);
  const mir = await json(`${out}/mirror-inventories.json`);
  assert.deepEqual(mir.inventories, c.inventories);
  assert.equal(mir.remoteFilesChecked, 0);
  const upload = await json(`${privateRoot}/manueller-upload/verification.json`);
  assert.equal(upload.files.length, 45); assert.equal(upload.uploaded, false);
  for (const file of upload.files) await check(file);
  const documents = [], referenceFiles = new Map();
  let linkCount = 0;
  const future = [`${out}/proposal.json`, `${out}/proposal-verification.json`];
  for (const path of docs) {
    const text = (await readRegular(root, path)).toString();
    assert.ok(!text.replace(/`[^`]*`/g, '').includes(';'), `Prose semicolon ${path}`);
    assert.ok(!text.includes('R10C_TARGET_SHA_PENDING'));
    assert.ok(!text.includes('steimer664.sharepoint.com'));
    for (const t of [...targets.targets, targets.historical]) for (const key of ['siteAppInstanceId', 'webPartInstanceId', 'itemGuid', 'teamsTabId', 'teamId', 'channelId'])
      if (t[key]) assert.ok(!text.includes(t[key]), `${path}: private ${key}`);
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^https?:|^#/.test(match[1])) continue;
      const linked = relative(root, resolve(root, dirname(path), match[1].split('#')[0]));
      if (!future.includes(linked)) referenceFiles.set(linked, await bind(linked));
      linkCount++;
    }
    documents.push(await bind(path));
  }
  assert.ok((await readRegular(root, docs[0])).toString().includes(targetBinding.sha256));
  const negatives = negativeChecks(targets, c.inventories[0]);
  await preserve();
  return { kind: 'r10c-eq-installation-proposal', schemaVersion: '1.0.0', edition: '1.0', preparedOn: '2026-10-29',
    status: 'prepared-awaiting-separate-execution-approval', permissions, localCompletion: c.closure, documents,
    referencedFiles: [...referenceFiles.values()].sort((a, b) => a.path.localeCompare(b.path, 'en')),
    privateTargetBinding: { sha256: targetBinding.sha256, byteLength: targetBinding.byteLength, targetCount: 4, publiclyIncluded: false },
    privateTargetVerification: { sha256: targetProof.sha256, byteLength: targetProof.byteLength, publiclyIncluded: false },
    artifacts: c.complete.artifacts.filter(item => !item.path.endsWith('steimer-web.zip')),
    packageIdentities: c.packages, releaseId: newRelease, rollbackReleaseId: oldRelease,
    mirrors: await bind(`${out}/mirror-inventories.json`), completedLocalReports: c.reports,
    tools: [await bind('scripts/prepare-r10c-proposal.mjs'), await bind('scripts/prepare-r10c-targets.mjs')],
    gates: ['R10C-U01 manual mirror upload', 'R10C-H01 conditional recovery', 'R10C-I01 catalogue and four existing app updates',
      'C01 fresh exact baseline and private backup', 'C03 original bytes of 180 new and 168 rollback files',
      'C05 E gate including unchanged-Q-data mixed mode and historical AP5', 'C07 full technical Q matrix',
      'C08 separate real devices, guest, manual Q acceptance and Outlook decision'],
    localChecks: { normalFiles: 45, rollbackFiles: 42, historicalRollbackCopiesRehashed: 168, localUploadCopyFiles: 45,
      mirrorZipExact: true, actualPackageBundlesVerified: true, privateTargetsExcludedFromPublicDocs: true,
      localLinks: linkCount, negativeChecks: negatives, boundInputsRechecked: bound.size },
    knownTechnicalLimits: ['R10B-CLI-H01 remains open before source publication'],
    freshRemoteChecksPerformed: false, executedHostTests: 0, commitsCreated: 0, uploadsPerformed: 0,
    installationPerformed: false, headerCacheRetested: false, outlookImportsPerformed: false };
}
async function sealOrVerify(verify) {
  const value = await proposal();
  if (verify) {
    assert.deepEqual(await json(`${out}/proposal.json`), value);
  } else await writeExclusive(root, `${out}/proposal.json`, encode(value));
  const receipt = { kind: 'r10c-local-proposal-verification',
    schemaVersion: '1.0.0', status: 'passed-local-preparation-only', checkedOn: '2026-10-29',
    proposal: await bind(`${out}/proposal.json`), privateTargetBinding: value.privateTargetBinding,
    documents: value.documents, permissions, localChecks: value.localChecks,
    noNewBuildOrDataRelease: true, noNetworkAccess: true, noGitMutation: true,
    limitation: 'No live inventory, upload, installation, host test or operating approval. Historical evidence stays historical.' };
  if (verify) assert.deepEqual(await json(`${out}/proposal-verification.json`), receipt);
  else await writeExclusive(root, `${out}/proposal-verification.json`, encode(receipt));
  console.log(JSON.stringify({ status: verify ? 'verified-local-only' : 'prepared-local-only',
    proposal: await bind(`${out}/proposal.json`), verification: await bind(`${out}/proposal-verification.json`),
    privateTargetSha256: value.privateTargetBinding.sha256, localChecks: value.localChecks }, null, 2));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3);
  if (process.argv[2] === '--prepare-mirrors') await prepareMirrors();
  else if (process.argv[2] === '--seal') await sealOrVerify(false);
  else { assert.equal(process.argv[2], '--verify'); await sealOrVerify(true); }
}
