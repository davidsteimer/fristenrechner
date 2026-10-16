// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {loadPackagedHost,PACKAGE,F7,AP5,activate,provider,offline}=require('./fixture.cjs');
test('actual recovery keeps AP5 and Format7 caches separate and does not infer a different provider',async()=>{
  const r=loadPackagedHost(PACKAGE),p7=provider(),p5=provider(AP5);
  const seven=await r.service.refresh(p7),five=await r.service.refresh(p5);
  assert.equal(five.release.formatVersion,'1.0.0');assert.equal(seven.release.formatVersion,'7.0.0');
  assert.equal((await r.service.refresh(offline(p7))).release.manifestSha256,seven.release.manifestSha256);
  assert.equal((await r.service.refresh(offline(p5))).release.manifestSha256,five.release.manifestSha256);
  await assert.rejects(r.service.refresh(offline(provider(F7,'-other'))),/SYNTHETIC LOCAL OFFLINE/);
});
test('actual recovery fails closed for Format8 bytes rather than reusing unrelated Format7 cache',async()=>{
  const r=loadPackagedHost(PACKAGE);await activate(r);
  const p=provider(F7,'-format8-rejected'),b=JSON.parse(Buffer.from(await p.fetchBytes('manifest.json')));
  b.formatVersion='8.0.0';b.minimumConsumerVersion='8.0.0';
  const bad={...p,async fetchBytes(name){return name==='manifest.json'?new TextEncoder().encode(JSON.stringify(b)):p.fetchBytes(name);}};
  r.configure(bad);await r.host.restoreAndRefresh();
  assert.equal(r.host.state.status,'error');assert.equal(r.calculatorElement(),undefined);
});
