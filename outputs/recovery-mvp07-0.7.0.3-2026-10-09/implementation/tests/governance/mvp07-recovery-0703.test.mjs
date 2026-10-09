// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ROOT, ORIGINAL, VERSION, deriveInput, replaceExactlyOnce, normalizeGeneratedPartConfig,
  normalizeGeneratedAssetFeature, normalizeHostClassNames, assertPassingTestLog } from '../../scripts/build-mvp07-recovery-0703.mjs';

const configPath = 'spfx/config/package-solution.json';
const hostPath = 'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx';
const config = await readFile(resolve(ROOT, `${ORIGINAL}/build-inputs/${configPath}`));
const host = await readFile(resolve(ROOT, `${ORIGINAL}/build-inputs/${hostPath}`));
test('only solution and feature versions change, component version and other inputs remain exact', () => {
  const result = deriveInput(configPath, config).toString();
  assert.equal(result.split(`"version": "${VERSION}"`).length, 3);
  assert.equal(result.replaceAll(`"version": "${VERSION}"`, '"version": "0.7.0.1"'), config.toString());
  const arbitrary = Buffer.from('{"version":"0.7.1","factualRule":"unchanged"}');
  assert.equal(deriveInput('spfx/package.json', arbitrary), arbitrary);
});
test('visible recovery marker changes exactly once and does not change runtime logic', () => {
  const result = deriveInput(hostPath, host).toString();
  assert.equal(result.replace('data-recovery-version="0.7.0.3"', 'data-recovery-version="0.7.0.1"'), host.toString());
  assert.throws(() => deriveInput(hostPath, Buffer.from(host.toString().replace('data-recovery-version', 'data-other-version'))));
  assert.throws(() => deriveInput(hostPath, Buffer.concat([host, Buffer.from('data-recovery-version="0.7.0.1"')])));
});
test('version derivation refuses changed identity, version, added API permission and extra feature', () => {
  for (const mutate of [value => {value.solution.id = 'other';}, value => {value.solution.version = '0.6.0.1';},
    value => {value.solution.webApiPermissionRequests = [{resource:'Graph',scope:'User.Read'}];},
    value => {value.solution.features.push({...value.solution.features[0]});}]) {
    const value = JSON.parse(config); mutate(value);
    assert.throws(() => deriveInput(configPath, Buffer.from(`${JSON.stringify(value,null,2)}\n`)));
  }
});
test('single-literal normalisation rejects absent or repeated input', () => {
  assert.equal(replaceExactlyOnce('prefix "one" suffix','"one"','"two"'),'prefix "two" suffix');
  assert.throws(() => replaceExactlyOnce('absent','one','two'));
  assert.throws(() => replaceExactlyOnce('one one','one','two'));
});
const uuid = 'c04ad770-183e-4a43-b890-7d02d4d757c4';
const part = `<?xml version="1.0" encoding="utf-8"?><AppPartConfig xmlns="http://schemas.microsoft.com/sharepoint/2012/app/partconfiguration"><Id>${uuid}</Id></AppPartConfig>`;
test('only the two exact generated AppPartConfig UUID v4 files normalise', () => {
  assert.equal(normalizeGeneratedPartConfig('ClientSideAssets.xml.config.xml',part), normalizeGeneratedPartConfig(
    'feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml.config.xml',part.replace('c04ad770','d04ad770')));
  assert.equal(normalizeGeneratedPartConfig('unrelated.xml',part),part);
  assert.throws(() => normalizeGeneratedPartConfig('ClientSideAssets.xml.config.xml',part.replace('-4a43-','-1a43-')));
  assert.throws(() => normalizeGeneratedPartConfig('ClientSideAssets.xml.config.xml',part.replace('</AppPartConfig>','<Other/></AppPartConfig>')));
});
const asset = `<?xml version="1.0" encoding="utf-8"?><Feature xmlns="http://schemas.microsoft.com/sharepoint/" Title="Client Side Assets" Description="A feature that help deploy client side component assets to SharePoint Online." Id="${uuid}" Version="1.0.0.0" Scope="Web" Hidden="FALSE"></Feature>`;
test('asset GUID normalisation requires the exact generated asset feature, not a permission or other feature', () => {
  assert.equal(normalizeGeneratedAssetFeature('unrelated.xml',asset),asset);
  assert.match(normalizeGeneratedAssetFeature('ClientSideAssets.xml',asset),/GENERATED-ASSET-FEATURE/);
  for (const altered of [asset.replace('-4a43-','-1a43-'), asset.replace('Title="Client Side Assets"','Title="Other"'),
    asset.replace('</Feature>','<Permission/></Feature>')]) assert.throws(() => normalizeGeneratedAssetFeature('ClientSideAssets.xml',altered));
});
test('test evidence requires exact pass count with no skipped, cancelled or todo tests', () => {
  const log = '# tests 32\n# pass 32\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
  assertPassingTestLog(log,32);
  for (const altered of [log.replace('# pass 32','# pass 31'),log.replace('# skipped 0','# skipped 1'),log.replace('# fail 0','# fail 1')]) assert.throws(() => assertPassingTestLog(altered,32));
});
test('scoped class normalisation requires all five exact inline class references and bound counts', () => {
  const fixture = suffix => Object.entries({host:2,startup:5,badge:2,runtimeMessage:3,runtimeStatus:5})
    .map(([name,count]) => `${name === 'runtimeMessage' ? 'const s_=' : 'className:'}"${name}_${suffix}"; ${(`${name}_${suffix} `).repeat(count-1)}`).join('');
  const old = fixture('8a3f4b47'), current = fixture('1234abcd');
  assert.equal(normalizeHostClassNames(current,old).normalized,old);
  for (const changed of [current.replace('host_1234abcd','host_deadbeef'), `${current} host_1234abcd`,
    current.replace('className:"startup_','other:"startup_'), current.replace('const s_=','other=')]) assert.throws(() => normalizeHostClassNames(changed,old));
  const result = normalizeHostClassNames(`${current} other_1234abcd`,`${old} other_1234abcd`).normalized;
  assert.ok(result.endsWith('other_1234abcd'), 'Unrelated generated strings must remain unchanged');
});
