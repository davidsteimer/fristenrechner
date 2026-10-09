// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { historicalAP20BTest as binding, readFrozenAP20BInput } from '../../scripts/read-frozen-ap20b-input.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const read = path => readFileSync(resolve(root, path));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const entry = { path: binding.path, sha256: binding.sha256 };

test('AP20B historical test is the exact 85-archive input, not the evolved living test', () => {
  const calls = [];
  const bytes = readFrozenAP20BInput(entry, path => { calls.push(path); return read(path); });
  assert.deepEqual(calls, [binding.archivedAt]);
  assert.equal(digest(bytes), binding.sha256);
  assert.notEqual(digest(read(binding.path)), binding.sha256);
  const snapshot = JSON.parse(read('outputs/release-mvp06-2026-10-01/preparation-inputs.json'));
  assert.deepEqual(snapshot.evidence.find(item => item.path === binding.path), { path: binding.path, sha256: binding.sha256, byteLength: binding.byteLength });
});
test('no accepted hash or path may be changed to select a different historical input', () => {
  assert.throws(() => readFrozenAP20BInput({ ...entry, sha256: '0'.repeat(64) }, () => { throw new Error('must not read'); }), /Unrecognised/);
  for (const path of ['../tests/governance/ap20b-references.test.mjs', '/tests/x', 'tests//x', 'tests\\x'])
    assert.throws(() => readFrozenAP20BInput({ ...entry, path }, read), /Unsafe/);
});
test('missing, changed or replaced historical test fails without falling back to the living file', () => {
  assert.throws(() => readFrozenAP20BInput(entry, () => { throw new Error('missing archive'); }), /missing archive/);
  const calls = [];
  assert.throws(() => readFrozenAP20BInput(entry, path => { calls.push(path); return Buffer.from('changed archive'); }), /Changed frozen/);
  assert.deepEqual(calls, [binding.archivedAt]);
  assert.throws(() => readFrozenAP20BInput(entry, () => read(binding.path)), /Changed frozen/);
});
test('all other AP20B evidence is still read from its exact original path', () => {
  const evidence = JSON.parse(read('outputs/ap20b-2026-09-30/pruefprotokoll.json')).evidence;
  for (const item of evidence.filter(item => item.path !== binding.path)) {
    const calls = [];
    assert.equal(digest(readFrozenAP20BInput(item, path => { calls.push(path); return read(path); })), item.sha256);
    assert.deepEqual(calls, [item.path]);
  }
});
test('an unrelated hash mismatch cannot trigger any archive lookup', () => {
  const calls = [], bytes = Buffer.from('accepted'), changed = Buffer.from('changed');
  assert.throws(() => readFrozenAP20BInput({ path: 'docs/other.md', sha256: digest(bytes) }, path => {
    calls.push(path); return path.startsWith('outputs/') ? bytes : changed;
  }), /Changed frozen/);
  assert.deepEqual(calls, ['docs/other.md']);
});
