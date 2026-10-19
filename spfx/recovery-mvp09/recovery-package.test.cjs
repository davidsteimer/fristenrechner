// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {readPackage,loadPackagedHost,PACKAGE,F8,activate,basic,provider,offline}=require('./fixture.cjs');
test('actual recovery has 0.9.0.1 package but MVP08 component, pin, identities, hosts and permissions',()=>{
  const pkg=readPackage(PACKAGE);assert.match(pkg.files.get('AppManifest.xml').toString(),/ProductID="13090feb-a6bf-40fa-9d3c-ec8d90516a60"/);
  assert.match(pkg.files.get('AppManifest.xml').toString(),/Version="0\.9\.0\.1"/);
  assert.match(pkg.files.get('feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml').toString(),/Version="0\.9\.0\.1"/);
  const xml=pkg.files.get('3edf1509-41e9-4a2f-8005-df510eec43b6/WebPart_596c7f1c-4d3e-4da8-a7be-27a96024f37c.xml').toString();
  const manifest=JSON.parse(xml.match(/ComponentManifest="([^"]+)"/)[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
  assert.equal(manifest.version,'0.8.0');assert.deepEqual(manifest.supportedHosts,['SharePointWebPart','TeamsTab']);
  assert.match(manifest.preconfiguredEntries[0].properties.githubBaseUrl,/\/10a99419eaabb3e96d2acccf0c7a93e2fe6472cb\/data\/releases\/2026-10-15-mvp-08-approved\.1$/);
  for(const [name,bytes]of pkg.files)if(/\.xml$/.test(name))assert.doesNotMatch(bytes.toString(),/AppPermissionRequest|WebApiPermission|webApiPermissionRequests/);
  assert.match(pkg.bundle.toString(),/fristenrechner\.defaults\.v5/);
});
test('actual recovery loads all 42 Format8 files and keeps the September reference and own cache',async()=>{
  const runtime=loadPackagedHost(PACKAGE),source=provider();const data=await activate(runtime,source);
  assert.equal(data.releaseId,F8);assert.equal(data.formatVersion,'8.0.0');assert.equal(source.fetched.length,42);
  assert.equal(runtime.submitCalculator(basic).finalEnd,'2026-09-28');
  runtime.configure(offline(provider()));await runtime.host.restoreAndRefresh();assert.equal(runtime.host.state.status,'fallback');
  assert.equal(runtime.host.state.administrativeContext.manifest.releaseId,F8);
});
