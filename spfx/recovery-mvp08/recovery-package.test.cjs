// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT,readPackage,loadPackagedHost,browserState,memoryStorage,localMirrorConfiguration,sha256} = require('./package-harness.cjs');
const PACKAGE = process.env.FRISTENRECHNER_RECOVERY_SPPKG;
const STAGE = process.env.FRISTENRECHNER_RECOVERY_STAGE;
assert.ok(PACKAGE && path.isAbsolute(PACKAGE)); assert.ok(STAGE && path.isAbsolute(STAGE));
assert.match(path.relative(REPO_ROOT,STAGE), /^\.work\/mvp08-recovery-[A-Za-z0-9]+$/);
const F7='2026-10-08-mvp-07-approved.1', AP5='2026-08-29-ap5-approved.1';
const V5='fristenrechner.defaults.v5', OLD='fristenrechner.defaults.v1';
const ARCHIVE=path.join(REPO_ROOT,'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg');
assert.equal(sha256(fs.readFileSync(ARCHIVE)),'8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db');
assert.notEqual(fs.realpathSync(PACKAGE),fs.realpathSync(ARCHIVE));
const fileSets=new Map();
function provider(id=F7,suffix='') {
  if(!fileSets.has(id)) {
    const dir=path.join(STAGE,'data/releases',id), manifest=fs.readFileSync(path.join(dir,'manifest.json'));
    fileSets.set(id,new Map([['manifest.json',manifest],...JSON.parse(manifest).artifacts.map(d=>[d.path,fs.readFileSync(path.join(dir,d.path))])]));
  }
  const files=fileSets.get(id), fetched=[];
  return {id:`synthetic-local:${id}${suffix}`,kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(id+suffix),fetched,
    async fetchBytes(name){fetched.push(name);assert.ok(files.has(name),name);return new Uint8Array(files.get(name));}};
}
const offline=p=>({...p,async fetchBytes(){throw new Error('SYNTHETIC LOCAL OFFLINE');}});
async function activate(runtime,source=provider()) {
  runtime.configure(source); await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'ready',runtime.host.state.message); return runtime.host.state.calculationData;
}
const basic={authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10',
  calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
function click(ui,label) {const button=ui.findElement(ui.tree,n=>n.props.children===label&&typeof n.props.onClick==='function');assert.ok(button,label);button.props.onClick();ui.rerender();}

test('actual recovery package has version0.8.0.1 but unchanged MVP07 component, pin and identities',()=>{
  const p=readPackage(PACKAGE),manifest=p.files.get('AppManifest.xml').toString();
  assert.match(manifest,/ProductID="13090feb-a6bf-40fa-9d3c-ec8d90516a60"/);
  assert.match(manifest,/Version="0\.8\.0\.1"/);
  assert.match(p.files.get('feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml').toString(),/Version="0\.8\.0\.1"/);
  const xml=p.files.get('3edf1509-41e9-4a2f-8005-df510eec43b6/WebPart_596c7f1c-4d3e-4da8-a7be-27a96024f37c.xml').toString();
  const c=JSON.parse(xml.match(/ComponentManifest="([^"]+)"/)[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
  assert.equal(c.version,'0.7.0');assert.deepEqual(c.supportedHosts,['SharePointWebPart','TeamsTab']);
  assert.match(c.preconfiguredEntries[0].properties.githubBaseUrl,/\/331ef3e19d43a6b51d91a502acd6b5443071599f\/data\/releases\/2026-10-08-mvp-07-approved\.1$/);
  for(const [name,bytes]of p.files)if(/\.xml$/.test(name))assert.doesNotMatch(bytes.toString(),/AppPermissionRequest|WebApiPermission|webApiPermissionRequests/);
  assert.doesNotMatch(p.bundle.toString(),/fristenrechner\.defaults\.v5/);
});
test('actual recovery loads every Format7 byte and calculates the unchanged BE September reference',async()=>{
  const r=loadPackagedHost(PACKAGE),p=provider();const data=await activate(r,p);
  assert.equal(data.releaseId,F7);assert.equal(data.formatVersion,'7.0.0');assert.equal(p.fetched.length,41);
  assert.equal(r.submitCalculator(basic).finalEnd,'2026-09-28');
  r.configure(offline(provider()));await r.host.restoreAndRefresh();
  assert.equal(r.host.state.status,'fallback');assert.equal(r.host.state.calculationData.releaseId,F7);
});
