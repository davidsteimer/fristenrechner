// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {loadPackagedHost,PACKAGE,F8,AP5,activate,provider,offline}=require('./fixture.cjs');
test('actual recovery keeps AP5 and Format8 caches separate and rejects unknown provider fallback',async()=>{
  const runtime=loadPackagedHost(PACKAGE),p8=provider(),p5=provider(AP5);
  const eight=await runtime.service.refresh(p8),five=await runtime.service.refresh(p5);
  assert.equal(eight.release.formatVersion,'8.0.0');assert.equal(five.release.formatVersion,'1.0.0');
  assert.equal((await runtime.service.refresh(offline(p8))).release.manifestSha256,eight.release.manifestSha256);
  assert.equal((await runtime.service.refresh(offline(p5))).release.manifestSha256,five.release.manifestSha256);
  await assert.rejects(runtime.service.refresh(offline(provider(F8,'-other'))),/SYNTHETIC LOCAL OFFLINE/);
});
test('actual recovery fails closed for Format9 rather than using unrelated Format8 cache',async()=>{
  const runtime=loadPackagedHost(PACKAGE);await activate(runtime);
  const source=provider(F8,'-format9-rejected'),manifest=JSON.parse(Buffer.from(await source.fetchBytes('manifest.json')));
  manifest.formatVersion='9.0.0';manifest.minimumConsumerVersion='9.0.0';
  runtime.configure({...source,async fetchBytes(name){return name==='manifest.json'?new TextEncoder().encode(JSON.stringify(manifest)):source.fetchBytes(name);}});
  await runtime.host.restoreAndRefresh();assert.equal(runtime.host.state.status,'error');assert.equal(runtime.calculatorElement(),undefined);
});
