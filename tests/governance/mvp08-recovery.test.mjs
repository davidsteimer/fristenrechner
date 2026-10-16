// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { ROOT, BASE, VERSION, deriveInput, normalizeGeneratedXml, passing } from '../../scripts/build-mvp08-recovery.mjs';
const archive = `${BASE}/build-evidence/inputs/`;
test('recovery derives exactly two package fields from sealed MVP07 config',async()=>{
  const bytes=await readFile(resolve(ROOT,archive,'spfx/config/package-solution.json'));
  const old=JSON.parse(bytes),next=JSON.parse(deriveInput('spfx/config/package-solution.json',bytes));
  assert.equal(next.solution.version,VERSION);assert.equal(next.solution.features[0].version,VERSION);
  next.solution.version=old.solution.version;next.solution.features[0].version=old.solution.features[0].version;assert.deepEqual(next,old);
});
test('recovery rejects a different predecessor package or identity',async()=>{
  const bytes=await readFile(resolve(ROOT,archive,'spfx/config/package-solution.json'));
  assert.throws(()=>deriveInput('spfx/config/package-solution.json',Buffer.from(bytes.toString().replaceAll('0.7.0.2','0.7.0.3'))));
  assert.throws(()=>deriveInput('spfx/config/package-solution.json',Buffer.from(bytes.toString().replace('13090feb-a6bf-40fa-9d3c-ec8d90516a60','wrong'))));
});
test('only two literal test assertions are re-versioned, test coverage is retained',async()=>{
  const path='spfx/test/product-integration.test.ts',bytes=await readFile(resolve(ROOT,archive,path));
  const changed=deriveInput(path,bytes);
  assert.equal(changed.toString().split("'0.8.0.1'").length,3);
  assert.equal(changed.toString().replaceAll("'0.8.0.1'","'0.7.0.2'"),bytes.toString());
});
test('arbitrary product inputs are never rewritten',()=>{
  const b=Buffer.from('0.7.0.2 in arbitrary source must stay');
  assert.equal(deriveInput('src/ui/defaults.ts',b),b);
});
test('generated-XML normalization cannot remove permission or content changes',()=>{
  const xml='<Permissions>changed</Permissions>';
  assert.equal(normalizeGeneratedXml('AppManifest.xml',xml),xml);
  assert.throws(()=>normalizeGeneratedXml('ClientSideAssets.xml.config.xml',xml));
});
test('passing test log rejects omissions, skips and failed tests',()=>{
  const log='# tests 9\n# pass 9\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
  assert.equal(passing(log),9);
  for(const broken of [log.replace('# skipped 0','# skipped 1'),log.replace('# fail 0','# fail 1'),log.replace('# pass 9','# pass 8'),''])assert.throws(()=>passing(broken));
});
