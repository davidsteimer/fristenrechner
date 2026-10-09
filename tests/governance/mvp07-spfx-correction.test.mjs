// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ROOT, VERSION, ORIGINAL, UI_CHANGES, UI_ADDITIONS, assertCorrectionConfig,
  assertBoundedSourceDelta, auditDropdownBundle, normalizeGeneratedPartConfig } from '../../scripts/build-mvp07-spfx-0702.mjs';

const baseline = JSON.parse(await readFile(resolve(ROOT, `${ORIGINAL}/build-evidence/inputs/spfx/config/package-solution.json`)));
test('normalises only the two exact SPFx-generated part-configuration GUIDs', () => {
  const xml = '<?xml version="1.0" encoding="utf-8"?><AppPartConfig xmlns="http://schemas.microsoft.com/sharepoint/2012/app/partconfiguration"><Id>c04ad770-183e-4a43-b890-7d02d4d757c4</Id></AppPartConfig>';
  const first = normalizeGeneratedPartConfig('ClientSideAssets.xml.config.xml', xml);
  assert.equal(first, normalizeGeneratedPartConfig('feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml.config.xml', xml.replace('c04ad770', 'd04ad770')));
  assert.equal(normalizeGeneratedPartConfig('unrelated.xml', xml), xml);
  assert.throws(() => normalizeGeneratedPartConfig('ClientSideAssets.xml.config.xml', xml.replace('</AppPartConfig>', '<Other/></AppPartConfig>')));
  assert.throws(() => normalizeGeneratedPartConfig('ClientSideAssets.xml.config.xml', xml.replace('-4a43-', '-1a43-')));
});
const config = () => {
  const value = structuredClone(baseline);
  value.solution.version = VERSION; value.solution.features[0].version = VERSION;
  return value;
};
test('correction permits only the bound package and feature version delta', () => {
  assertCorrectionConfig(config(), baseline);
  for (const mutate of [value => { value.solution.id = 'different'; }, value => { value.solution.includeClientSideAssets = false; },
    value => { value.solution.webApiPermissionRequests = [{resource: 'Microsoft Graph', scope: 'User.Read'}]; },
    value => { value.solution.features[0].version = '0.7.0.1'; }]) {
    const value = config(); mutate(value); assert.throws(() => assertCorrectionConfig(value, baseline));
  }
});
const old = [{path: 'src/core/index.ts', sha256: 'old-core'}, ...[...UI_CHANGES].map(path => ({path, sha256: 'old-ui'})),
  {path: 'spfx/config/package-solution.json', sha256: 'old-package'}, {path: 'src/ui/i18n.ts', sha256: 'old-strings'}];
const current = () => old.map(row => ({...row, sha256: UI_CHANGES.has(row.path) ? 'new-style' : row.sha256}))
  .concat([...UI_ADDITIONS].map(path => ({path, sha256: 'new-helper'})));
test('source allowlist accepts precisely the declared UI files and helper', () => {
  assert.equal(assertBoundedSourceDelta(current(), old).length, UI_CHANGES.size + UI_ADDITIONS.size);
});
test('source allowlist rejects changed core, strings, unknown additions and removed runtime inputs', () => {
  for (const path of ['src/core/index.ts', 'src/ui/i18n.ts']) {
    const value = current(); value.find(row => row.path === path).sha256 = 'tampered';
    assert.throws(() => assertBoundedSourceDelta(value, old), /Unbounded runtime change/);
  }
  assert.throws(() => assertBoundedSourceDelta([...current(), {path: 'src/ui/unbounded.ts', sha256: 'new'}], old), /Unbounded new runtime input/);
  assert.throws(() => assertBoundedSourceDelta(current().filter(row => row.path !== 'src/core/index.ts'), old), /Removed runtime input/);
});
const wrapping = 'whiteSpace:"normal",overflow:"visible",textOverflow:"clip",overflowWrap:"anywhere"';
const styleBundle = `title:{height:"auto",minHeight:32,paddingTop:5,paddingBottom:5,lineHeight:20,${wrapping}},dropdownOptionText:{${wrapping}},height:"auto",minHeight:36,paddingTop:7,paddingBottom:7,dropdownItem:x,dropdownItemSelected:x,dropdownItemDisabled:x,dropdownItemSelectedAndDisabled:x`;
test('actual bundle audit requires closed title, layered option wrapping and all four option states', () => {
  assert.equal(auditDropdownBundle(Buffer.from(styleBundle)).hostVisualAcceptanceClaimed, false);
  for (const mutation of [styleBundle.replace('title:', 'unrelated:'), styleBundle.replace('dropdownOptionText:', 'unrelated:'),
    styleBundle.replace('dropdownItemSelectedAndDisabled:', 'unrelated:'), styleBundle.replace('minHeight:32', 'minHeight:31')]) {
    assert.throws(() => auditDropdownBundle(Buffer.from(mutation)));
  }
});
