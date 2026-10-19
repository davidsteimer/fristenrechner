// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Actual packaged AMD, with synthetic hooks, browser storage and byte transport.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const harness=require('../recovery-mvp07/package-harness.cjs');
const {REPO_ROOT,sha256,localMirrorConfiguration,loadPackagedHost,memoryStorage,browserState}=harness;
const PREFIX='outputs/release-mvp09-2026-10-18',F9='2026-10-18-mvp-09-approved.1',F8='2026-10-15-mvp-08-approved.1';
const NORMAL=path.join(REPO_ROOT,PREFIX,'fristenrechner-schweiz-0.9.0.0.sppkg');
const RECOVERY=path.join(REPO_ROOT,PREFIX,'fristenrechner-schweiz-recovery-0.9.0.1.sppkg');
const V5='fristenrechner.defaults.v5';
const json=file=>JSON.parse(fs.readFileSync(path.join(REPO_ROOT,file),'utf8'));
const product=json(`${PREFIX}/product-build.json`),recovery=json(`${PREFIX}/recovery-0.9.0.1/artifact-verification.json`);
assert.equal(product.status,'passed');assert.equal(recovery.passed,true);
assert.equal(sha256(fs.readFileSync(NORMAL)),product.package.sha256);assert.equal(sha256(fs.readFileSync(RECOVERY)),recovery.packageSha256);
const files=new Map();
for(const [id,directory,expected]of [[F9,`data/releases/${F9}`,product.manifest.sha256],
  [F8,`${PREFIX}/recovery-0.9.0.1/build-inputs/data/releases/${F8}`,'2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4']]){
  const root=path.join(REPO_ROOT,directory),raw=fs.readFileSync(path.join(root,'manifest.json')),manifest=JSON.parse(raw);
  assert.equal(sha256(raw),expected);assert.equal(manifest.releaseId,id);
  const content=new Map([['manifest.json',raw]]);
  for(const descriptor of manifest.artifacts){const bytes=fs.readFileSync(path.join(root,descriptor.path));
    assert.equal(sha256(bytes),descriptor.sha256);assert.equal(bytes.length,descriptor.byteLength);content.set(descriptor.path,bytes);}
  files.set(id,content);
}
function provider(id,suffix){const fetched=[];return{id:`synthetic-roundtrip:${id}:${suffix}`,kind:'sharepointMirror',
  cacheConfiguration:localMirrorConfiguration(`roundtrip-${id}-${suffix}`),fetched,
  async fetchBytes(name){fetched.push(name);assert.ok(files.get(id).has(name));return new Uint8Array(files.get(id).get(name));}};}
const offline=source=>({...source,async fetchBytes(){throw new Error('SYNTHETIC ROUNDTRIP OFFLINE');}});
async function activate(runtime,source,status='ready'){
  runtime.configure(source);await runtime.host.restoreAndRefresh();assert.equal(runtime.host.state.status,status,runtime.host.state.message);return runtime.host.state.calculationData;
}
// The persisted V5 contract uses the actual profile value, not the GUI concept
// "direct". A non-canonical value is correctly protected as corrupt preferences.
const basePreferences={locale:'de',authorityCode:'BE',deadlineDays:10,deliveryMethod:'otherLegallyRelevantDate',
  procedureSelection:{kind:'legacyProfile',profileId:'stpo'},legacySelectors:{},
  vrpgSelection:{area:'',law:'',action:'',stage:''},calendarPreference:{role:'partyWithoutRepresentative',canton:'BE'}};
const administrative={LU:{canton:'LU',lawId:'vrg-lu',pathId:'lu-admin-30',days:30},
  ZG:{canton:'ZG',lawId:'vrg-zg',pathId:'zg-admin-20',days:20},AR:{canton:'AR',lawId:'vrpg-ar',pathId:'ar-execution-5',days:5}};
const seeds={reset:JSON.stringify({version:5,state:'reset'},null,2)+'\n',corrupt:'{not-json-preserved\n',
  future:JSON.stringify({version:999,state:'unknown',payload:['retain exactly']},null,2)+'\n',
  legacy:JSON.stringify({version:5,state:'preferences',preferences:basePreferences},null,2)+'\n'};
for(const [name,value]of Object.entries(administrative))seeds[name]=JSON.stringify({version:5,state:'preferences',preferences:{...basePreferences,
  authorityCode:value.canton,deadlineDays:value.days,deliveryMethod:'otherLegallyRelevantDate',calendarPreference:{role:'',canton:''},
  procedureSelection:{kind:'cantonalAdministrative',lawId:value.lawId,pathId:value.pathId,revision:1,stage:'administrativeAppeal'}}},null,2)+'\n';
const basic={authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10',
  selectors:{deliveryMethod:'direct'},calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
function click(ui,label){const button=ui.findElement(ui.tree,node=>node.props.children===label&&typeof node.props.onClick==='function');
  assert.ok(button,label);button.props.onClick();ui.rerender();}
function inspect(runtime,name,old=false){return runtime.inspectCalculator(undefined,ui=>{
  const form=ui.stateValues().find(value=>value&&typeof value==='object'&&Object.hasOwn(value,'authorityCode')&&Object.hasOwn(value,'inputDate'));
  assert.ok(form);const admin=administrative[name],isProtected=['corrupt','future'].includes(name)||(old&&Boolean(admin));
  assert.equal(form.authorityCode,isProtected||name==='reset'?'':admin?.canton??'BE');
  assert.equal(form.profileId,name==='legacy'?'stpo':'');assert.equal(form.deadlineDays,admin&&!old?String(admin.days):'10');
  assert.equal(form.inputDate,'');assert.equal(form.specialLawChecked,false);
  const warning=ui.findElement(ui.tree,node=>node.props.className==='fr-selection-notice'&&typeof node.props.children==='string'
    &&node.props.children.startsWith('Die gespeicherten Standards sind mit diesem Datenstand nicht verwendbar.'));
  assert.equal(Boolean(warning),isProtected);
  const selected=ui.stateValues().find(value=>value?.pathId===admin?.pathId&&Boolean(admin));
  if(admin&&!old){assert.ok(ui.stateValues().includes(admin.lawId));assert.ok(selected);assert.equal(selected.qualification,'');assert.equal(selected.urgency,'');}
  assert.ok(!ui.stateValues().some(value=>['general','social','special','boundCalendar','administrative'].includes(value?.kind)),'No case result may be restored from preferences');
  return {form:JSON.parse(JSON.stringify(form)),selection:selected?JSON.parse(JSON.stringify(selected)):null,protected:isProtected};
});}
async function roundtrip(name,t){
  const raw=seeds[name];assert.equal(typeof raw,'string');
  const storage=memoryStorage({[V5]:raw}),browser=browserState(storage),source9=provider(F9,name),source8=provider(F8,name);
  const first=loadPackagedHost(NORMAL,{browser});assert.equal((await activate(first,source9)).formatVersion,'9.0.0');assert.equal(source9.fetched.length,42);
  const initial=inspect(first,name);assert.equal(storage.values.get(V5),raw);
  const old=loadPackagedHost(RECOVERY,{browser});assert.equal((await activate(old,source8)).formatVersion,'8.0.0');assert.equal(source8.fetched.length,42);
  inspect(old,name,true);
  if(administrative[name]||['corrupt','future'].includes(name))old.inspectCalculator(basic,ui=>{
    click(ui,'Als Standard speichern');assert.equal(storage.values.get(V5),raw);click(ui,'Standards zurücksetzen');assert.equal(storage.values.get(V5),raw);
  });
  assert.equal(storage.values.get(V5),raw);assert.ok(storage.operations.every(op=>op[1]!==V5||op[0]==='get'));
  const restored=loadPackagedHost(NORMAL,{browser}),data=await activate(restored,offline(source9),'fallback');
  assert.equal(data.formatVersion,'9.0.0');assert.equal(data.releaseId,F9);assert.equal(restored.host.state.administrativeContext.manifest.releaseId,F9);
  assert.deepEqual(inspect(restored,name),initial);assert.equal(storage.values.get(V5),raw);
  assert.ok(storage.operations.every(op=>op[1]!==V5||op[0]==='get'));assert.equal(source9.fetched.length,42);
  t.diagnostic(JSON.stringify({case:name,normalSha256:product.package.sha256,recoverySha256:recovery.packageSha256,
    sequence:['MVP09/Format9','MVP08 recovery/Format8','MVP09/own Format9 cache'],sameStorage:true,sameIndexedDB:true,v5BytesUnchanged:true,actualM365Installation:false}));
}
module.exports={roundtrip};
