// SPDX-License-Identifier: AGPL-3.0-only
// Local, exclusive evidence for the expressly authorised exact-host supplement.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, readdir, lstat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = 'outputs/release-mvp09-2026-10-18/validator-supplement';
const validator = 'tests/governance/validate_source_reviews.py';
const tests = 'tests/governance/test_source_reviews_mvp09_host.py';
const script = 'scripts/check-r09b-validator-supplement.mjs';
const initialSha256 = '9bab48baa0c91cf0d6732775dec1f2a49ce4a3ee992d565b12977e43a93b729c';
const authorities = {
  'docs/betrieb/nachtrag-r09-b-quellenvalidator.md': '1c60d628d7ab3ce1340bbd7d633f23c3baae7d04e616a7ae53a699094b0703d0',
  'docs/betrieb/freigabe-r09-b-quellenvalidator.md': 'dcb688ccaaaf40046c7958484b44e65611928ac652945677fdf90f39d59c2057',
};
const addition = '    # R09-B supplement: exact AR materials host checked in accepted R09-A2.\n    "ar.ch",\n';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const read = path => readFile(resolve(root, path));
async function bind(path) {
  const bytes = await read(path);
  return { path, sha256: hash(bytes), byteLength: bytes.length };
}
async function save(path, value) {
  const bytes = Buffer.isBuffer(value) ? value : encode(value);
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  await writeFile(resolve(root, path), bytes, { flag: 'wx' });
  return { path, sha256: hash(bytes), byteLength: bytes.length };
}
async function authorityBindings() {
  const result = [];
  for (const [path, expected] of Object.entries(authorities)) {
    const binding = await bind(path);
    assert.equal(binding.sha256, expected, path);
    result.push(binding);
  }
  return result;
}
async function walk(path) {
  const stat = await lstat(resolve(root, path));
  assert.equal(stat.isSymbolicLink(), false, path);
  if (stat.isFile()) return [path];
  const result = [];
  for (const name of (await readdir(resolve(root, path))).sort()) {
    if (name === '__pycache__' || name === '.DS_Store') continue;
    result.push(...await walk(`${path}/${name}`));
  }
  return result;
}
async function prepare() {
  const authority = await authorityBindings();
  const bytes = await read(validator);
  assert.equal(hash(bytes), initialSha256);
  const paths = [...await walk('data'), ...await walk('tests/governance')].filter(path => path !== tests).sort();
  const inputs = await Promise.all(paths.map(bind));
  const beforeCopy = await save(`${output}/before/validate_source_reviews.py`, bytes);
  const record = { kind: 'r09bExactHostSupplementBefore', recordedAt: new Date().toISOString(),
    authority, initialValidator: { path: validator, sha256: initialSha256, byteLength: bytes.length },
    beforeCopy, protectedInputScope: ['data', 'existing tests/governance except authorised validator edit'], inputs };
  await save(`${output}/before-inputs.json`, record);
  console.log(JSON.stringify({ prepared: true, protectedInputs: inputs.length, initialSha256 }));
}
async function verify() {
  const authority = await authorityBindings();
  const beforeRaw = await read(`${output}/before-inputs.json`), before = JSON.parse(beforeRaw);
  assert.deepEqual(authority, before.authority);
  const beforeBytes = await read(before.beforeCopy.path), afterBytes = await read(validator);
  assert.equal(hash(beforeBytes), initialSha256);
  const text = afterBytes.toString('utf8');
  assert.equal(text.split(addition).length, 2, 'Exactly one bounded host/comment insertion');
  assert.equal(text.replace(addition, ''), beforeBytes.toString('utf8'), 'No other validator change');
  const currentPaths = [...await walk('data'), ...await walk('tests/governance')].filter(path => path !== tests).sort();
  assert.deepEqual(currentPaths, before.inputs.map(item => item.path));
  for (const item of before.inputs) if (item.path !== validator) assert.deepEqual(await bind(item.path), item);
  const inputBindings = await Promise.all([validator, tests, script, 'data/source-reviews/source-register.json',
    'data/source-reviews/index.json', ...await walk('data/source-reviews/events'),
    ...await walk('schemas')].map(bind));
  const commands = [
    ['exact-host-tests', ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_source_reviews_mvp09_host.py'], 'unittest'],
    ['source-semantic-schema', [validator, '--self-test'], 'schema'],
    ['python-governance', ['-m', 'unittest', 'discover', '-s', 'tests/governance', '-p', 'test_*.py'], 'unittest'],
  ];
  const executions = [];
  for (const [id, args, mode] of commands) {
    const startedAt = new Date().toISOString();
    const result = spawnSync(resolve(root, '.venv/bin/python'), args,
      { cwd: root, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
    const log = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    const logBinding = await save(`${output}/${id}.log`, Buffer.from(log));
    const count = mode === 'unittest' ? Number(log.match(/Ran (\d+) tests? in/)?.[1]) : null;
    const passed = result.status === 0 && !result.signal && (mode === 'unittest'
      ? count > 0 && /\nOK\s*$/.test(log) && !/skipped=/.test(log)
      : /255 Quellen.*157 produktiv.*7 Ereignis.*8 Negativtests/s.test(log));
    executions.push({ id, executable: '.venv/bin/python', args, startedAt, finishedAt: new Date().toISOString(),
      exitCode: result.status, signal: result.signal, passed, count, log: logBinding });
    assert.ok(passed, `${id} failed: ${log}`);
  }
  for (const item of inputBindings) assert.deepEqual(await bind(item.path), item);
  for (const item of before.inputs) if (item.path !== validator) assert.deepEqual(await bind(item.path), item);
  const afterCopy = await save(`${output}/after/validate_source_reviews.py`, afterBytes);
  const testsCopy = await save(`${output}/after/test_source_reviews_mvp09_host.py`, await read(tests));
  const report = { kind: 'r09bExactHostSupplementVerification', status: 'passed', checkedAt: new Date().toISOString(),
    authority, beforeInventory: { path: `${output}/before-inputs.json`, sha256: hash(beforeRaw) },
    originalValidatorSha256: initialSha256, validator: await bind(validator), afterCopy, testsCopy,
    authorisedDelta: { exactOfficialHostAdded: 'ar.ch', provenanceCommentAdded: true, urlParsingUnchanged: true,
      wildcardsAdded: false, subdomainsAdded: false, otherValidatorBytesUnchanged: true },
    protectedInputsUnchanged: before.inputs.length - 1, inputBindings, executions,
    legalDataChanged: false, historicalEvidenceChanged: false, commitCreated: false,
    deploymentPerformed: false, uploadPerformed: false, githubPushPerformed: false };
  const binding = await save(`${output}/verification.json`, report);
  console.log(JSON.stringify({ status: report.status, binding, tests: executions.map(step => ({ id: step.id, count: step.count })) }));
}
if (process.argv[2] === 'prepare') await prepare();
else if (process.argv[2] === 'verify') await verify();
else throw new Error('Use prepare before patch or verify after the authorised exact patch');
