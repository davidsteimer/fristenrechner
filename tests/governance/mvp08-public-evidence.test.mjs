import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  ROOT, OUTPUT, MANIFEST, SELF, SPECS, sha256,
  redactPaths, selectSummary, derive, verifyPublicEvidence
} from '../../scripts/prepare-mvp08-public-evidence.mjs';

async function temporary(callback) {
  const dir = await mkdtemp(resolve(tmpdir(), 'mvp08-public-evidence-test-'));
  try { return await callback(dir); }
  finally { await rm(dir, { recursive: true, force: true }); }
}
async function copyFileTo(root, path) {
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  await writeFile(resolve(root, path), await readFile(resolve(ROOT, path)));
}
async function publicOnlyClone(root) {
  for (const path of [SELF, MANIFEST, ...SPECS.map(s => OUTPUT + '/' + s.output)]) {
    await copyFileTo(root, path);
  }
}
async function changeManifest(root, change) {
  const path = resolve(root, MANIFEST), value = JSON.parse(await readFile(path));
  change(value);
  await writeFile(path, JSON.stringify(value, null, 2) + '\n');
}

test('path redaction retains diagnostics, failures and ordinary relative evidence references', () => {
  const root = '/mock/project with spaces';
  const home = ['', 'Users', 'example'].join('/');
  const temp = ['', 'private', 'var', 'folders', 'ab', 'synthetic', 'T'].join('/');
  const before = [
    'failed 3 passed 10 expected false',
    root + '/file.ts:12', pathToFileURL(root).href + '/file.ts',
    home + '/tool/file.js', temp + '/test-123/result.txt',
    '.work/local-attempt/output.txt', 'data/releases/manifest.json'
  ].join('\n');
  const after = redactPaths(before, root);
  assert.match(after.text, /failed 3 passed 10 expected false/);
  assert.ok(after.text.includes('<REPO_ROOT>/file.ts:12'));
  assert.ok(after.text.includes('<REPO_FILE_URI>/file.ts'));
  assert.ok(after.text.includes('<USER_HOME>/tool/file.js'));
  assert.ok(after.text.includes('<SYSTEM_TEMP>/test-123/result.txt'));
  assert.ok(after.text.includes('.work/local-attempt/output.txt'));
  assert.equal(Object.values(after.counts).reduce((a, b) => a + b, 0), 4);
});

test('summary projection retains historical false decisions and reports exactly omitted fields', () => {
  const source = { status: 'failed', humanApproval: false, failures: ['unchanged'], privateArchive: ['not copied'] };
  const spec = { source: 'outputs/historical.json', selectedFields: ['status', 'humanApproval', 'failures'] };
  const result = selectSummary(source, spec);
  assert.deepEqual(result.data, { status: 'failed', humanApproval: false, failures: ['unchanged'] });
  assert.deepEqual(result.omittedTopLevelFields, ['privateArchive']);
  assert.equal(result.sourceRecordStatusIsHistorical, true);
  assert.throws(() => selectSummary(source, { ...spec, selectedFields: ['absent'] }), /Missing selected field/);
});

test('derivation rejects changed source bytes without publishing a new interpretation', () => {
  const bytes = Buffer.from('failed 3\n');
  const spec = {
    source: 'outputs/fixture.txt', sourceByteLength: bytes.length,
    sourceSha256: sha256(bytes), output: 'fixture.txt'
  };
  assert.ok(derive(bytes, spec, '/mock/project').bytes.equals(bytes));
  assert.throws(() => derive(Buffer.from('passed 30\n'), spec), /Original byte length changed/);
  assert.throws(() => derive(Buffer.from('failed 4\n'), spec), /Original SHA-256 changed/);
});

test('actual public evidence verifies with only generator, manifest and 30 copies, no original reports', () => temporary(async root => {
  await publicOnlyClone(root);
  for (const spec of SPECS) {
    await assert.rejects(readFile(resolve(root, spec.source)), { code: 'ENOENT' });
  }
  const result = await verifyPublicEvidence(root);
  assert.equal(result.evidenceFilesVerified, 30);
  assert.equal(result.originalFilesRead, 0);
  assert.equal(result.fullOriginalAuditPerformed, false);
  assert.equal(result.publicationAuthorized, false);
}));

test('public verifier rejects changed copy bytes', () => temporary(async root => {
  await publicOnlyClone(root);
  const path = resolve(root, OUTPUT, SPECS[0].output);
  const bytes = await readFile(path);
  bytes[0] ^= 1;
  await writeFile(path, bytes);
  await assert.rejects(verifyPublicEvidence(root), /Public copy changed/);
}));

test('public verifier rejects a missing copy', () => temporary(async root => {
  await publicOnlyClone(root);
  await rm(resolve(root, OUTPUT, SPECS[0].output));
  await assert.rejects(verifyPublicEvidence(root), { code: 'ENOENT' });
}));

test('public verifier rejects altered origin binding, duplicate entries and path traversal', () => temporary(async root => {
  await publicOnlyClone(root);
  await changeManifest(root, m => { m.entries[0].source.sha256 = '0'.repeat(64); });
  await assert.rejects(verifyPublicEvidence(root));
  await copyFileTo(root, MANIFEST);
  await changeManifest(root, m => { m.entries[1] = m.entries[0]; });
  await assert.rejects(verifyPublicEvidence(root));
  await copyFileTo(root, MANIFEST);
  await changeManifest(root, m => { m.entries[0].output.path = '../outside.txt'; });
  await assert.rejects(verifyPublicEvidence(root));
}));

test('public verifier rejects symlink substitution', () => temporary(async root => {
  await publicOnlyClone(root);
  const path = resolve(root, OUTPUT, SPECS[0].output);
  await rm(path);
  await symlink(resolve(root, SELF), path);
  await assert.rejects(verifyPublicEvidence(root), /Symlinks are not evidence/);
}));

test('module import creates no evidence and performs no CLI action', () => temporary(async root => {
  await copyFileTo(root, SELF);
  const before = await readdir(root);
  const result = execFileSync(process.execPath, ['--input-type=module', '-e', 'await import(' + JSON.stringify(pathToFileURL(resolve(root, SELF)).href) + ')'], {
    cwd: root, encoding: 'utf8', timeout: 10000
  });
  assert.equal(result, '');
  assert.deepEqual(await readdir(root), before);
  await assert.rejects(readFile(resolve(root, MANIFEST)), { code: 'ENOENT' });
}));

