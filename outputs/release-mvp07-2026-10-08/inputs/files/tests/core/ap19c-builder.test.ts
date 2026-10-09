// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { prepareAP19CCandidate, persistAP19CCandidate, candidateRelativePath } from '../../scripts/build-ap19c-candidate.mjs';
import { canonicalSocialJson, socialObjectSha256 } from '../../src/core/socialCatalog';

test('AP19C builder reproduces every actual candidate byte deterministically', () => {
  const first = prepareAP19CCandidate();
  const second = prepareAP19CCandidate();
  assert.deepEqual([...first.files], [...second.files]);
  assert.deepEqual(first.verification, second.verification);
  for (const [path, bytes] of first.files) assert.ok(readFileSync(join(candidateRelativePath, path)).equals(bytes));
});

test('AP19C shares one canonical hash implementation and agrees with Node SHA-256 for all 32 bound objects', () => {
  const { catalog } = prepareAP19CCandidate();
  const objects = [...catalog.federalRules, ...catalog.cantonalBindings];
  assert.equal(objects.length, 32);
  for (const object of objects) assert.equal(socialObjectSha256(object), createHash('sha256').update(canonicalSocialJson(object), 'utf8').digest('hex'));
});

test('AP19C persist is idempotent and reads back all candidate files', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'ap19c-builder-test-'));
  try {
    const prepared = prepareAP19CCandidate();
    const target = join(temporary, 'candidate');
    const evidence = join(temporary, 'build-verification.json');
    persistAP19CCandidate(prepared, target, evidence);
    persistAP19CCandidate(prepared, target, evidence);
    for (const [path, bytes] of prepared.files) assert.ok(readFileSync(join(target, path)).equals(bytes));
    assert.equal(JSON.parse(readFileSync(evidence, 'utf8')).productionActivation, false);
  } finally {
    rmSync(temporary, { recursive: true });
  }
});

test('AP19C persist preflights every path and refuses replacement before any write', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'ap19c-builder-conflict-'));
  try {
    const prepared = prepareAP19CCandidate();
    const original = Buffer.from('user-owned conflict\n');
    writeFileSync(join(temporary, 'manifest.json'), original);
    assert.throws(() => persistAP19CCandidate(prepared, temporary, join(temporary, 'proof.json')), /Refusing to overwrite differing candidate file/);
    assert.ok(readFileSync(join(temporary, 'manifest.json')).equals(original));
    assert.equal(existsSync(join(temporary, 'profiles')), false);
    assert.equal(existsSync(join(temporary, 'proof.json')), false);
  } finally {
    rmSync(temporary, { recursive: true });
  }
});
