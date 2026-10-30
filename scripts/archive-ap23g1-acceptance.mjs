// SPDX-License-Identifier: AGPL-3.0-only
// Focused immutable research acceptance. Previous F3 artefacts are verified,
// not copied recursively. Original proof/status bytes remain unchanged.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const sha256 = b => createHash('sha256').update(b).digest('hex');
const out = 'outputs/ap23g1-2026-10-22';
export const archiveConfig = Object.freeze({
  target: 'outputs/ap23g1-abnahme-2026-10-22',
  proofPath: `${out}/local-completion.json`,
  proofSha256: '89e3404125021d0f7ef2c140afb790d41a9907a31d549d13d388ac2d263ed240',
  bindingCount: 29, sourceCount: 32, groups: 16, cases: 115,
  evidencePath: `${out}/evidence-verification.json`,
  referencePath: `${out}/reference-verification.json`,
  independentPath: `${out}/independent-verification.json`,
  preservationPath: `${out}/preservation-verification.json`,
  sourcePrefix: `${out}/sources/`,
  supplements: [{ path: `${out}/research-checker-tests.txt`, byteLength: 6102,
    sha256: 'c97b804e424d4f8113b6c9c20876f9a0b3e8c77a7c16b847b31cdae140ee4647' }],
  upstream: {
    proof: { path: 'outputs/ap23f3-2026-10-22/local-completion.json',
      sha256: 'bbf8d3ac815b30224563f98c552e1ac9006e4c58e7b12e5370b0211b65a1541f' },
    guards: [
      { path: 'outputs/ap23f3-2026-10-22/protected-inputs.json',
        sha256: '31d20757d18b20e2d0a481facf3c4636e8b607142c3b968a097e17a14605da36' },
      { path: 'outputs/ap23f3-2026-10-22/additional-protected-inputs.json',
        sha256: '1e3f37a68249ae86824294e9a38544997fc0aa77c64468c6ef669c7e2a406f38' }
    ],
    receipt: { path: 'outputs/ap23f3-abnahme-2026-10-22/receipt.json',
      sha256: '518a76b33fb0666a36ada847d58ba50b8495daf921a4b10a4cabbc7ba4b8ddd6' },
    bindings: 120, historical: 445, archivePayloads: 197
  },
  acceptance: {
    kind: 'acceptedAP23G1Snapshot', acceptedOn: '2026-10-22', acceptedBy: 'David Steimer',
    userStatement: 'AP23G1 ist einschliesslich der 16 Gruppen, Kalenderbindungen, Art.-22-Behandlung, UR-Lokalgrenze, des SH-Praxiszusatzes, Zeitfensters und der begrenzten Endverschiebungskollision fachlich abgenommen. Bitte starte AP23G2.',
    accepted: true, professionalAcceptance: true, technicalContractApproved: false,
    runtimeActive: false, sourceReleaseApproved: false, deployable: false, deployed: false, published: false,
    composition: 'Exact accepted G1 research bytes, 32 original source files, the former living entry texts and a bound checker log. The accepted F3 baseline remains separately referenced and is not recursively duplicated.',
    boundaries: [
      'The original research proof retains its historical awaiting-human-acceptance status.',
      'AP23G2 is started as an isolated contract and data probe, not product integration.',
      'No approved-data promotion, product code, release build, commit, source push, installation or E/Q/P change.',
      'Existing F3 acceptance, AP5 pins, AP21 test apps and the user-modified project plan stay unchanged.'
    ]
  }
});

export function safeRelative(path) {
  assert.equal(typeof path, 'string', 'Path must be a string');
  assert.ok(path.length && !path.startsWith('/') && !/[\\\x00:]/u.test(path), `Unsafe path: ${path}`);
  assert.ok(path.split('/').every(p => p && p !== '.' && p !== '..'), `Unsafe path: ${path}`);
  return path;
}
async function exists(path) {
  try { await lstat(path); return true; }
  catch (e) { if (e.code === 'ENOENT') return false; throw e; }
}
async function noSymlinks(root, relative, { missing = false } = {}) {
  const stat = await lstat(root);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Invalid root');
  let cursor = root;
  const parts = safeRelative(relative).split('/');
  for (const [i, part] of parts.entries()) {
    cursor = resolve(cursor, part);
    let s;
    try { s = await lstat(cursor); }
    catch (e) { if (missing && e.code === 'ENOENT') return; throw e; }
    assert.ok(!s.isSymbolicLink(), `Symlink not allowed: ${cursor}`);
    assert.ok(i === parts.length - 1 || s.isDirectory(), `Not a directory: ${cursor}`);
  }
}
async function readExact(root, item) {
  await noSymlinks(root, item.path);
  const handle = await open(resolve(root, item.path), constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    assert.ok((await handle.stat()).isFile(), `Not a file: ${item.path}`);
    const bytes = await handle.readFile();
    assert.equal(sha256(bytes), item.sha256, `SHA-256 mismatch: ${item.path}`);
    if (item.byteLength !== undefined) assert.equal(bytes.length, item.byteLength, `Byte length mismatch: ${item.path}`);
    return bytes;
  } finally { await handle.close(); }
}
async function archivePaths(root, relative = '') {
  const paths = [];
  for (const e of await readdir(resolve(root, relative), { withFileTypes: true })) {
    const p = relative ? `${relative}/${e.name}` : e.name;
    assert.ok(!e.isSymbolicLink(), `Symlink not allowed: ${p}`);
    if (e.isDirectory()) paths.push(...await archivePaths(root, p));
    else { assert.ok(e.isFile(), `Not a regular archive file: ${p}`); paths.push(p); }
  }
  return paths.sort();
}
async function verifyUpstream(root, config) {
  if (!config) return null;
  const proof = JSON.parse(await readExact(root, config.proof));
  const bindings = [...proof.sourceBindings, ...proof.evidence, proof.candidateManifest];
  assert.equal(bindings.length, config.bindings);
  for (const d of bindings) await readExact(root, d);
  const guards = await Promise.all(config.guards.map(async d => JSON.parse(await readExact(root, d))));
  const historical = { ...guards[0].files, ...guards[1] };
  assert.equal(Object.keys(historical).length, config.historical);
  for (const [path, sha256] of Object.entries(historical)) await readExact(root, { path, sha256 });
  const receipt = JSON.parse(await readExact(root, config.receipt));
  assert.equal(receipt.artifacts.length, config.archivePayloads);
  for (const d of receipt.artifacts) await readExact(root, { ...d, path: `${dirname(config.receipt.path)}/${safeRelative(d.path)}` });
  return { bindings: bindings.length, historical: Object.keys(historical).length, archivePayloads: receipt.artifacts.length };
}

export async function archiveAcceptance({ root = process.cwd(), write = false, config = archiveConfig } = {}) {
  root = resolve(root);
  safeRelative(config.target);
  await noSymlinks(root, config.target, { missing: true });
  const target = resolve(root, config.target), complete = await exists(target);
  if (complete) assert.ok(await exists(resolve(target, 'receipt.json')), 'Partial archive without receipt: halt without repair');
  const input = complete ? target : root;
  const descriptors = new Map(), buffers = new Map();
  function add(item) {
    safeRelative(item.path);
    assert.match(item.sha256, /^[a-f0-9]{64}$/u, 'Invalid descriptor hash');
    if (item.byteLength !== undefined) assert.ok(Number.isSafeInteger(item.byteLength) && item.byteLength >= 0, 'Invalid length');
    const previous = descriptors.get(item.path);
    if (previous) {
      assert.equal(previous.sha256, item.sha256, `Conflicting descriptor: ${item.path}`);
      if (previous.byteLength !== undefined && item.byteLength !== undefined) assert.equal(previous.byteLength, item.byteLength, 'Conflicting length');
    }
    descriptors.set(item.path, { ...previous, ...item });
  }
  async function boundJson(path) {
    const item = descriptors.get(path);
    assert.ok(item, `Report is not bound: ${path}`);
    const bytes = await readExact(input, item);
    buffers.set(path, bytes);
    return JSON.parse(bytes);
  }
  add({ path: config.proofPath, sha256: config.proofSha256 });
  const proof = await boundJson(config.proofPath);
  assert.equal(proof.workPackage, 'AP23G1');
  assert.equal(proof.status, 'research-completed-awaiting-human-acceptance');
  assert.equal(proof.scopeConfirmedBy, 'David Steimer');
  assert.equal(proof.referenceGroups, config.groups);
  assert.equal(proof.referenceCases, config.cases);
  for (const k of ['professionalAcceptance', 'formatDecision', 'runtimeActivation', 'productCodeChanged',
    'acceptedLegalDataChanged', 'commitCreated', 'sourcePushPerformed', 'releaseBuildPerformed', 'operatingChanges']) assert.equal(proof[k], false, k);
  assert.equal(proof.bindings.length, config.bindingCount, 'Unexpected binding inventory');
  proof.bindings.forEach(add);
  config.supplements.forEach(add);
  const evidence = await boundJson(config.evidencePath);
  assert.equal(evidence.status, 'research-evidence-and-calendar-comparison-passed');
  assert.equal(evidence.originalFilesInventoried, config.sourceCount);
  assert.equal(evidence.fileInventory.length, config.sourceCount, 'Unexpected source inventory');
  assert.equal(new Set(evidence.fileInventory.map(d => d.path)).size, config.sourceCount, 'Duplicate source inventory');
  for (const k of ['productCodeChanged', 'existingCalendarBytesChanged', 'legalApproval', 'operationalApproval']) assert.equal(evidence[k], false, k);
  for (const d of evidence.fileInventory) {
    assert.ok(d.path.startsWith(config.sourcePrefix), 'Source file outside scoped inventory');
    add(d);
  }
  for (const p of [config.referencePath, config.independentPath]) {
    const j = await boundJson(p);
    assert.equal(j.workPackage, 'AP23G1');
    assert.equal(j.legalApproval, false);
    assert.equal(j.runtimeActive, false);
    assert.deepEqual(j.discrepancies, []);
    if (p === config.referencePath) {
      assert.equal(j.status, 'passedResearchComparison');
      assert.equal(j.paths, config.groups);
      assert.equal(j.referenceCases, config.cases);
    } else {
      assert.equal(j.status, 'passedIndependentResearchComparison');
      assert.equal(j.referenceComparisons, config.cases);
    }
  }
  const preservation = await boundJson(config.preservationPath);
  assert.equal(preservation.status, 'accepted-baselines-preserved');
  for (const k of ['productCodeChanged', 'productDataChanged', 'newCommitCreated', 'sourcePushPerformed', 'operatingChanges']) assert.equal(preservation[k], false, k);
  assert.deepEqual(preservation, proof.preservation, 'Preservation proof differs');
  const expectedUpstream = config.upstream ? { bindings: config.upstream.bindings, historical: config.upstream.historical,
    archivePayloads: config.upstream.archivePayloads } : null;
  if (!complete) assert.deepEqual(await verifyUpstream(root, config.upstream), expectedUpstream);
  const rows = [];
  for (const item of [...descriptors.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'))) {
    const bytes = buffers.get(item.path) ?? await readExact(input, item);
    assert.equal(sha256(bytes), item.sha256, item.path);
    rows.push({ item: { path: item.path, byteLength: bytes.length, sha256: item.sha256 }, bytes });
  }
  const receipt = { ...config.acceptance, proof: { path: config.proofPath, sha256: config.proofSha256 },
    originalBindingCount: config.bindingCount, originalSourceFiles: config.sourceCount,
    previousF3NotRecopied: expectedUpstream,
    previousF3References: config.upstream ? [config.upstream.proof, ...config.upstream.guards, config.upstream.receipt] : [],
    artifacts: rows.map(r => r.item) };
  const payload = Buffer.from(JSON.stringify(receipt, null, 2) + '\n');
  if (complete) {
    await noSymlinks(target, 'receipt.json');
    assert.deepEqual(await readFile(resolve(target, 'receipt.json')), payload, 'Receipt is not the exact derived acceptance record');
    assert.deepEqual(await archivePaths(target), [...rows.map(r => r.item.path), 'receipt.json'].sort(), 'Unexpected archive files');
  } else if (write) {
    await noSymlinks(root, config.target, { missing: true });
    await mkdir(dirname(target), { recursive: true });
    await mkdir(target);
    for (const { item, bytes } of rows) {
      await noSymlinks(target, item.path, { missing: true });
      await mkdir(dirname(resolve(target, item.path)), { recursive: true });
      await noSymlinks(target, item.path, { missing: true });
      await writeFile(resolve(target, item.path), bytes, { flag: 'wx' });
      await readExact(target, item);
    }
    await writeFile(resolve(target, 'receipt.json'), payload, { flag: 'wx' });
  }
  return { target: config.target, mode: complete ? 'archive-reverified' : write ? 'archive-created' : 'source-preflight-only',
    verified: true, files: rows.length, sourceFiles: config.sourceCount,
    payloadBytes: rows.reduce((n, r) => n + r.bytes.length, 0), previousF3NotRecopied: expectedUpstream,
    receiptSha256: sha256(payload), receiptByteLength: payload.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.slice(2).every(a => ['--write', '--check'].includes(a)), 'Only --write or --check');
  assert.ok(!(process.argv.includes('--write') && process.argv.includes('--check')), 'Choose one mode');
  console.log(JSON.stringify(await archiveAcceptance({ write: process.argv.includes('--write') }), null, 2));
}
