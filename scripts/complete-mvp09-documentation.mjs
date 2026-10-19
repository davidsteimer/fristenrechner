// SPDX-License-Identifier: AGPL-3.0-only
// Transparent post-QA documentation receipt. Never edits documentation or proof.
// snapshot: only after the successful local closure, before changing five pages.
// verify: allows those five Markdown pages and two named new Markdown records.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { root, prefix, hash, encode } from './consolidate-mvp09-sources.mjs';
import { readRegular, writeExclusive } from './record-mvp09-source-approval.mjs';

const SELF = 'scripts/complete-mvp09-documentation.mjs';
const CLOSURE = `${prefix}/local-completion.json`;
const SNAPSHOT = `${prefix}/documentation-completion/before-inputs.json`;
const RECEIPT = `${prefix}/documentation-completion.json`;
const EXISTING = Object.freeze(['README.md', 'docs/architektur/README.md', 'docs/fachrecht/README.md',
  'docs/betrieb/deployment-mvp-09.md', 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md']);
const NEW = Object.freeze(['docs/betrieb/lokaler-releaseabschluss-mvp09.md', 'docs/betrieb/outlook-wiederverwendung-mvp09.md']);
const PORTABLE_DOCS = Object.freeze(['docs/architektur/README.md', 'docs/fachrecht/README.md']);
const COMMIT = '0ccc4b9178503ede051964149a4b17efab8d0cf9';
const PARENT = 'c37c11bc9fbf8241535d202d54c3499d2f4c3350';
const MANIFEST = '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265';
const SOURCE_APPROVAL = '4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68';
const read = path => readRegular(root, path);
const json = async path => JSON.parse(await read(path));
const bind = async path => {const bytes = await read(path); return {path, sha256: hash(bytes), byteLength: bytes.length};};
async function verify(item) {
  assert.match(item.sha256, /^[a-f0-9]{64}$/);
  const actual = await bind(item.path);
  assert.equal(actual.sha256, item.sha256, `Changed protected input: ${item.path}`);
  if (item.byteLength !== undefined) assert.equal(actual.byteLength, item.byteLength, item.path);
  return actual;
}
async function verifyAll(items) {for (const item of items) await verify(item);}
const rawGit = args => {
  const result = spawnSync('git', args, {cwd: root, maxBuffer: 32 * 1024 * 1024});
  assert.equal(result.status, 0, result.stderr?.toString()); assert.equal(result.signal, null);
  return result.stdout;
};
function gitState() {
  const head = rawGit(['rev-parse', 'HEAD']).toString().trim();
  const parent = rawGit(['rev-parse', 'HEAD^']).toString().trim();
  const staged = rawGit(['diff', '--cached', '--name-only']).toString().trim();
  assert.equal(head, COMMIT); assert.equal(parent, PARENT); assert.equal(staged, '');
  return {head, parent, indexEmpty: true};
}
async function checkProtected() {
  const closure = await json(CLOSURE);
  assert.equal(closure.kind, 'mvp09-r09b-local-completion'); assert.equal(closure.status, 'passed');
  assert.equal(closure.dataCommit, COMMIT); assert.equal(closure.parent, PARENT);
  assert.equal(closure.packageVersion, '0.9.0.0'); assert.equal(closure.recoveryPackageVersion, '0.9.0.1');
  assert.equal(closure.builtProductAndFixturesUnchanged, true); assert.deepEqual(closure.postBuildFixtureExceptions, []);
  for (const key of ['installationPerformed', 'uploadsPerformed', 'githubPushPerformed', 'outlookImportsPerformed',
    'operationalApprovalGranted', 'realM365TestsPerformed', 'realDeviceTestsPerformed', 'remoteDataPinPublicationVerified']) assert.equal(closure[key], false);
  await verifyAll([closure.authority, closure.closureTool, closure.dataManifest, ...closure.artifacts, ...closure.evidence, ...closure.finalChecks]);
  assert.equal(closure.wiring.checkedInputs, 630);
  const acceptedInputs = [...closure.wiring.unchanged, ...closure.wiring.changed.map(item => item.after)];
  assert.equal(acceptedInputs.length, 630); assert.equal(new Set(acceptedInputs.map(item => item.path)).size, 630);
  await verifyAll(acceptedInputs);
  assert.equal(closure.dataManifest.sha256, MANIFEST); assert.equal(closure.artifacts.length, 4);
  const evidence = new Set(closure.evidence.map(item => item.path));
  const productPath = `${prefix}/product-build.json`, recoveryPath = `${prefix}/recovery-0.9.0.1/artifact-verification.json`;
  assert.ok(evidence.has(productPath) && evidence.has(recoveryPath));
  const product = await json(productPath);
  assert.equal(product.status, 'passed'); assert.equal(product.packageVersion, '0.9.0.0');
  assert.equal(product.localDataPin.commit, COMMIT); assert.equal(product.manifest.sha256, MANIFEST);
  await verifyAll([...product.inputs, ...product.fixtures, ...product.runtimeFiles, ...product.webFiles,
    product.package, product.oldPackage, product.embedded, product.manifest]);
  for (const item of [...product.archivedInputs, ...product.archivedFixtures]) await verify({...item, path: item.archivedAt});
  for (const step of product.steps) {assert.equal(step.exitCode, 0); await verify(step.log);}
  const recovery = await json(recoveryPath);
  assert.equal(recovery.passed, true); assert.equal(recovery.packageVersion, '0.9.0.1'); assert.equal(recovery.functionalBaseline, 'MVP 0.8');
  await verifyAll([...recovery.archivedFiles, ...recovery.protectedFiles, ...recovery.implementation]);
  for (const step of recovery.steps) {assert.equal(step.exitCode, 0); await verify({path: step.archivedLog, sha256: step.sha256});}
  const sourcePath = `${prefix}/source-approval.json`;
  assert.equal((await bind(sourcePath)).sha256, SOURCE_APPROVAL);
  const source = await json(sourcePath); assert.equal(source.evidence.length, 803); await verifyAll(source.evidence);
  const state = gitState(), pin = await json(`${prefix}/local-data-pin.json`);
  assert.equal(pin.commit, COMMIT); assert.equal(pin.files.length, 42);
  assert.deepEqual(rawGit(['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD']).toString().trim().split('\n').sort(), pin.files.map(item => item.path).sort());
  for (const item of pin.files) {
    await verify(item); const blob = rawGit(['cat-file', 'blob', `${COMMIT}:${item.path}`]);
    assert.equal(hash(blob), item.sha256); assert.equal(blob.length, item.byteLength);
  }
  return {closure, closureBinding: await bind(CLOSURE), git: state,
    checked: {productInputs: product.inputs.length, fixtures: product.fixtures.length, runtimeFiles: product.runtimeFiles.length,
      webFiles: product.webFiles.length, artifacts: closure.artifacts.length, sourceEvidence: source.evidence.length,
      acceptedBaselineInputs: acceptedInputs.length, recoveryArchivedFiles: recovery.archivedFiles.length}};
}
async function checkPortability(closure, beforeDocs, permitNavigationChanges) {
  const references = closure.finalChecks.filter(item => item.kind === 'mvp09StandardTestPortabilityProof');
  assert.equal(references.length, 1); const reference = references[0]; await verify(reference);
  const proof = await json(reference.path);
  assert.equal(proof.kind, 'mvp09StandardTestPortabilityProof'); assert.equal(proof.passed, true);
  assert.equal(proof.isolatedInputBytesVerifiedBeforeAndAfter, true); assert.equal(proof.noTestsSkipped, true);
  await verify(proof.inputInventory); const inventory = await json(proof.inputInventory.path);
  assert.equal(inventory.kind, 'mvp09ClosedStandardPortabilityInputs');
  assert.match(inventory.stage, /^\.work\/mvp09-standard-no-private-[A-Za-z0-9]+$/);
  assert.equal(inventory.files.length, proof.inputCount);
  assert.deepEqual(inventory.files.filter(item => EXISTING.includes(item.path)).map(item => item.path).sort(), [...PORTABLE_DOCS].sort());
  const changed = [];
  for (const item of inventory.files) {
    // The historical isolated test copy must remain byte-identical, including
    // both old navigation pages. No mutation or rewritten original proof.
    await verify({...item, path: `${inventory.stage}/${item.path}`});
    if (PORTABLE_DOCS.includes(item.path)) {
      const before = beforeDocs.find(row => row.path === item.path); assert.ok(before);
      assert.equal(item.sha256, before.sha256); assert.equal(item.byteLength, before.byteLength);
      const current = await bind(item.path);
      if (current.sha256 !== item.sha256) {
        assert.equal(permitNavigationChanges, true, `Documentation already changed before snapshot: ${item.path}`);
        changed.push({path: item.path, testedSnapshot: item, beforeSnapshot: before, current});
      }
    } else await verify(item);
  }
  for (const execution of proof.executions) {
    await verify(execution); assert.deepEqual(await json(execution.path), execution.result);
    assert.equal(execution.result.passed, true);
    for (const step of execution.result.steps) {assert.equal(step.exitCode, 0); await verify(step.log);}
  }
  return {proof: await bind(reference.path), inputInventory: await bind(proof.inputInventory.path), stage: inventory.stage,
    checkedFiles: inventory.files.length, historicalPortabilitySnapshotUnchanged: true,
    permittedNavigationPaths: PORTABLE_DOCS, changedNavigationPages: changed,
    interpretation: 'Original QA applies to its unchanged captured bytes. Two non-executable navigation pages may be updated afterwards. This receipt is not a rerun or alteration of that proof.'};
}
async function archiveDocs(directory, bindings) {
  const result = [];
  for (const item of bindings) {
    await verify(item); const archivedAt = `${prefix}/documentation-completion/${directory}/${item.path}`;
    await writeExclusive(root, archivedAt, await read(item.path));
    await verify({...item, path: archivedAt}); result.push({...item, archivedAt});
  }
  return result;
}
async function snapshot() {
  assert.equal(await readRegular(root, SNAPSHOT, true), undefined, 'Snapshot already exists');
  assert.equal(await readRegular(root, RECEIPT, true), undefined, 'Documentation already completed');
  const protectedState = await checkProtected();
  for (const path of NEW) assert.equal(await readRegular(root, path, true), undefined, `New record already exists: ${path}`);
  const documents = await Promise.all(EXISTING.map(bind));
  const portability = await checkPortability(protectedState.closure, documents, false);
  const report = {kind: 'mvp09PostQaDocumentationBefore', recordedAt: new Date().toISOString(),
    closure: protectedState.closureBinding, tool: await bind(SELF), git: protectedState.git,
    allowedExistingMarkdown: EXISTING, allowedNewMarkdown: NEW, documents,
    archivedDocuments: await archiveDocs('before', documents), portability,
    protectedChecks: protectedState.checked, testOrBuildRerunClaimed: false,
    inspectionScope: 'Only exact prior QA/product/fixture/source/portability bindings and the seven named Markdown paths. No scan of unrelated Git-visible or untracked user files.',
    installationPerformed: false, uploaded: false, published: false};
  await writeExclusive(root, SNAPSHOT, encode(report));
  console.log(JSON.stringify({snapshot: await bind(SNAPSHOT), status: 'ready-for-bounded-documentation-only',
    allowedExistingMarkdown: EXISTING, allowedNewMarkdown: NEW}));
}
async function complete() {
  assert.equal(await readRegular(root, RECEIPT, true), undefined, 'Never overwrite documentation receipt');
  const before = await json(SNAPSHOT);
  assert.equal(before.kind, 'mvp09PostQaDocumentationBefore'); await verifyAll([before.closure, before.tool]);
  assert.deepEqual(before.allowedExistingMarkdown, EXISTING); assert.deepEqual(before.allowedNewMarkdown, NEW);
  for (const item of before.archivedDocuments) await verify({...item, path: item.archivedAt});
  const protectedState = await checkProtected();
  assert.deepEqual(protectedState.closureBinding, before.closure); assert.deepEqual(protectedState.git, before.git);
  assert.deepEqual(before.documents.map(item => item.path), EXISTING);
  const changed = [], added = await Promise.all(NEW.map(bind));
  for (const item of before.documents) {
    const path = item.path, now = await bind(path);
    if (now.sha256 !== item.sha256) {
      assert.ok(EXISTING.includes(path), `Unexpected post-QA change: ${path}`); changed.push({before: item, after: now});
    }
  }
  const portability = await checkPortability(protectedState.closure, before.documents, true);
  const documents = await Promise.all([...EXISTING, ...NEW].map(bind));
  for (const item of documents) {assert.ok(item.byteLength > 0); assert.ok(item.path.endsWith('.md'));}
  const afterArchive = await archiveDocs('after', documents);
  // Recheck protected bytes and Git immediately before writing the new receipt.
  const final = await checkProtected(); assert.deepEqual(final.closureBinding, before.closure);
  await verifyAll(documents);
  const report = {kind: 'mvp09PostQaDocumentationCompletion', status: 'passed', recordedAt: new Date().toISOString(),
    snapshot: await bind(SNAPSHOT), closure: before.closure, tool: await bind(SELF), git: final.git,
    postQaDocumentationOnly: true, historicalPortabilitySnapshotUnchanged: true,
    approvedPathScope: {existing: EXISTING, added: NEW}, changes: changed, added, beforeDocuments: before.archivedDocuments,
    afterDocuments: afterArchive, portability, protectedChecks: final.checked,
    productInputsUnchanged: true, fixturesUnchanged: true, legalDataUnchanged: true, artifactsUnchanged: true,
    originalQaReportsUnchanged: true, sourceEvidenceUnchanged: true, additionalCommits: 0,
    testOrBuildRerunPerformed: false, originalTestCoverageNotExtended: true,
    inspectionScope: before.inspectionScope,
    installationPerformed: false, uploaded: false, published: false, operationalApprovalGranted: false,
    meaning: 'Seven bounded Markdown records describe the completed local work and remaining gates. Executable inputs, legal data, packages and original QA evidence are unchanged. The two updated navigation copies are explicitly distinguished from their still byte-identical isolated test snapshots.'};
  await writeExclusive(root, RECEIPT, encode(report));
  console.log(JSON.stringify({receipt: await bind(RECEIPT), postQaDocumentationOnly: true,
    changedDocuments: changed.map(item => item.after.path), addedDocuments: added.map(item => item.path),
    historicalPortabilitySnapshotUnchanged: true}));
}
assert.equal(process.argv.length, 3, 'Use one explicit mode: snapshot or verify');
assert.ok(['snapshot', 'verify'].includes(process.argv[2]));
await (process.argv[2] === 'snapshot' ? snapshot() : complete());
