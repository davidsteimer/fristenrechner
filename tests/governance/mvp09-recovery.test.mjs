// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { ROOT, BASE, VERSION, deriveInput, normalizeGeneratedXml, passing } from '../../scripts/build-mvp09-recovery.mjs';
const archive = `${BASE}/build-evidence/inputs/`;
test('R09 recovery derives exactly two package fields from actual MVP08 archive', async () => {
  const bytes = await readFile(resolve(ROOT, archive, 'spfx/config/package-solution.json'));
  const original = JSON.parse(bytes), changed = JSON.parse(deriveInput('spfx/config/package-solution.json', bytes));
  assert.equal(changed.solution.version, VERSION); assert.equal(changed.solution.features[0].version, VERSION);
  changed.solution.version = original.solution.version; changed.solution.features[0].version = original.solution.features[0].version;
  assert.deepEqual(changed, original);
});
test('R09 recovery rejects a different predecessor or identity', async () => {
  const bytes = await readFile(resolve(ROOT, archive, 'spfx/config/package-solution.json'));
  for (const altered of [bytes.toString().replaceAll('0.8.0.0', '0.8.0.1'), bytes.toString().replace('13090feb-a6bf-40fa-9d3c-ec8d90516a60', 'wrong')])
    assert.throws(() => deriveInput('spfx/config/package-solution.json', Buffer.from(altered)));
});
test('R09 recovery adjusts only the two exact package-version test assertions', async () => {
  const path = 'spfx/test/product-integration.test.ts', original = await readFile(resolve(ROOT, archive, path));
  const changed = deriveInput(path, original);
  assert.equal(changed.toString().split("'0.9.0.1'").length, 3);
  assert.equal(changed.toString().replaceAll("'0.9.0.1'", "'0.8.0.0'"), original.toString());
});
test('R09 recovery never rewrites arbitrary product content', () => {
  const value = Buffer.from('0.8.0.0 stays unchanged here'); assert.equal(deriveInput('src/ui/defaults.ts', value), value);
});
test('R09 recovery normalization cannot remove content or permissions', () => {
  const bad = '<Permissions>changed</Permissions>'; assert.equal(normalizeGeneratedXml('AppManifest.xml', bad), bad);
  assert.throws(() => normalizeGeneratedXml('ClientSideAssets.xml.config.xml', bad));
});
test('R09 recovery requires complete successful TAP logs', () => {
  const good = '# tests 9\n# pass 9\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n'; assert.equal(passing(good), 9);
  for (const bad of [good.replace('# pass 9', '# pass 8'), good.replace('# skipped 0', '# skipped 1'), good.replace('# fail 0', '# fail 1'), '']) assert.throws(() => passing(bad));
});
