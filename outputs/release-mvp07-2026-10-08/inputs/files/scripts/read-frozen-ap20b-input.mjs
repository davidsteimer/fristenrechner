// SPDX-License-Identifier: AGPL-3.0-only
// One exact historical input moved out of the living test surface in MVP06.
// This is a fixed, hash-bound resolution, never a fallback after a mismatch.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { isAbsolute } from 'node:path';

export const historicalAP20BTest = Object.freeze({
  path: 'tests/governance/ap20b-references.test.mjs',
  archivedAt: 'outputs/release-mvp06-2026-10-01/historical-baseline/tests/governance/ap20b-references.test.mjs',
  sha256: 'e67a13560a8b16d9432bed767861b55b561c3c834dd29eef7c1281c75e5e0b3b',
  byteLength: 13611
});

export function readFrozenAP20BInput(entry, read) {
  assert.ok(typeof entry.path === 'string' && !isAbsolute(entry.path) && !entry.path.includes('\\')
    && !/[\0\r\n]/.test(entry.path) && !entry.path.split('/').some(part => ['', '.', '..'].includes(part)), 'Unsafe AP20B evidence path');
  assert.match(entry.sha256, /^[a-f0-9]{64}$/);
  const historical = entry.path === historicalAP20BTest.path;
  if (historical) assert.equal(entry.sha256, historicalAP20BTest.sha256, 'Unrecognised AP20B historical test binding');
  const bytes = read(historical ? historicalAP20BTest.archivedAt : entry.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, `Changed frozen AP20B input: ${entry.path}`);
  if (historical) assert.equal(bytes.length, historicalAP20BTest.byteLength, 'Historical AP20B test size changed');
  if (entry.byteLength !== undefined) assert.equal(bytes.length, entry.byteLength, `Changed AP20B evidence size: ${entry.path}`);
  return bytes;
}
