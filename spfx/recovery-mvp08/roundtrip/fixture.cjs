// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Actual packaged AMD runs. Storage, IndexedDB and transport are synthetic local
// seams. This is not a SharePoint install, browser DOM or live downgrade test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const harness=require('../package-harness.cjs');
const {REPO_ROOT,sha256,localMirrorConfiguration,loadPackagedHost,memoryStorage,browserState}=harness;
const PREFIX='outputs/release-mvp08-2026-10-15';
const NORMAL=path.join(REPO_ROOT,PREFIX,'fristenrechner-schweiz-0.8.0.0.sppkg');
const RECOVERY=path.join(REPO_ROOT,PREFIX,'fristenrechner-schweiz-recovery-0.8.0.1.sppkg');
const ORIGINAL=path.join(REPO_ROOT,'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg');
const F8='2026-10-15-mvp-08-approved.1',F7='2026-10-08-mvp-07-approved.1';
const V5='fristenrechner.defaults.v5',OLD='fristenrechner.defaults.v1';
const json=file=>JSON.parse(fs.readFileSync(path.join(REPO_ROOT,file),'utf8'));
const product=json(`${PREFIX}/product-build.json`),recovery=json(`${PREFIX}/recovery-0.8.0.1/artifact-verification.json`);
assert.equal(product.status,'passed');assert.equal(recovery.passed,true);
assert.equal(sha256(fs.readFileSync(NORMAL)),product.package.sha256);
assert.equal(sha256(fs.readFileSync(RECOVERY)),recovery.packageSha256);
assert.equal(sha256(fs.readFileSync(ORIGINAL)),'8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db');
const files=new Map();
for(const [id,directory,expected]of[
  [F8,`data/releases/${F8}`,product.manifest.sha256],
  [F7,`${PREFIX}/recovery-0.8.0.1/build-inputs/data/releases/${F7}`,'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597']
]){
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
async function activate(runtime,source,expectedStatus='ready'){
  runtime.configure(source);await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,expectedStatus,runtime.host.state.message);return runtime.host.state.calculationData;
}
const preferences={locale:'de',authorityCode:'TI',deadlineDays:19,deliveryMethod:'otherLegallyRelevantDate',
  procedureSelection:{kind:'legacyProfile',profileId:'zpo'},legacySelectors:{procedureVariant:'ordinary'},
  vrpgSelection:{area:'',law:'',action:'',stage:''},calendarPreference:{role:'court',canton:'TI'}};
const seeds={preferences:JSON.stringify({version:5,state:'preferences',preferences}),reset:JSON.stringify({version:5,state:'reset'}),
  corrupt:'{not-json-preserved',future:JSON.stringify({version:999,state:'unknown',payload:['do not delete']})};
seeds.administrative=JSON.stringify({version:5,state:'preferences',preferences:{...preferences,deadlineDays:30,
  procedureSelection:{kind:'cantonalAdministrative',lawId:'lpamm-ti',pathId:'ti-80-30',revision:1,stage:'administrativeAppeal'},
  legacySelectors:{},calendarPreference:{role:'',canton:''}}});
const basic={authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10',
  selectors:{deliveryMethod:'otherLegallyRelevantDate'},calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
function click(ui,label){const button=ui.findElement(ui.tree,n=>n.props.children===label&&typeof n.props.onClick==='function');
  assert.ok(button,label);button.props.onClick();ui.rerender();}
function inspectDefaults(runtime,name){return runtime.inspectCalculator(undefined,ui=>{
  const form=ui.stateValues().find(value=>value&&typeof value==='object'&&Object.hasOwn(value,'authorityCode')&&Object.hasOwn(value,'inputDate'));
  assert.ok(form,'Actual packaged calculator form state must be present');
  assert.equal(form.authorityCode,['preferences','administrative'].includes(name)?'TI':'');assert.equal(form.profileId,name==='preferences'?'zpo':'');
  assert.equal(form.deadlineDays,name==='preferences'?'19':name==='administrative'?'30':'10');assert.equal(form.inputDate,'');assert.equal(form.specialLawChecked,false);
  if(name==='preferences'){assert.equal(form.selectors.procedureVariant,'ordinary');assert.equal(form.calendarContext.canton,'TI');}
  if(name==='administrative'){
    assert.ok(ui.stateValues().includes('lpamm-ti'));
    const selection=ui.stateValues().find(value=>value?.pathId==='ti-80-30');assert.ok(selection);
    assert.equal(selection.stage,'administrativeAppeal');assert.equal(selection.qualification,'');assert.equal(selection.urgency,'');
  }
  assert.equal(ui.result(),undefined,'No previous result or case facts may appear');
  return JSON.parse(JSON.stringify(form));
});}
async function roundtrip(name,t){
  const raw=seeds[name];assert.equal(typeof raw,'string');
  const storage=memoryStorage({[V5]:raw}),browser=browserState(storage),source8=provider(F8,name),source7=provider(F7,name);
  const first=loadPackagedHost(NORMAL,{browser});
  assert.equal((await activate(first,source8)).formatVersion,'8.0.0');assert.equal(source8.fetched.length,42);
  const initial=inspectDefaults(first,name);assert.equal(storage.values.get(V5),raw);
  assert.equal(storage.operations.some(op=>op[1]===OLD),false,'Existing V5 must prevent legacy import');
  const beforeRecovery=storage.operations.length;
  const old=loadPackagedHost(RECOVERY,{browser});
  assert.equal((await activate(old,source7)).formatVersion,'7.0.0');assert.equal(source7.fetched.length,41);
  old.inspectCalculator(basic,ui=>{
    click(ui,'Als Standard speichern');assert.equal(JSON.parse(storage.values.get(OLD)).authorityCode,'BE');
    click(ui,'Standards zurücksetzen');assert.equal(storage.values.has(OLD),false);
    click(ui,'Als Standard speichern');assert.equal(JSON.parse(storage.values.get(OLD)).authorityCode,'BE');
  });
  assert.equal(storage.values.get(V5),raw);assert.ok(storage.operations.slice(beforeRecovery).every(op=>op[1]!==V5));
  const afterRecovery=storage.operations.length;
  const restored=loadPackagedHost(NORMAL,{browser});
  const data=await activate(restored,offline(source8),'fallback');
  assert.equal(data.formatVersion,'8.0.0');assert.equal(data.releaseId,F8);
  assert.equal(restored.host.state.administrativeContext.manifest.releaseId,F8);
  assert.deepEqual(inspectDefaults(restored,name),initial);
  assert.equal(storage.values.get(V5),raw);assert.equal(JSON.parse(storage.values.get(OLD)).authorityCode,'BE');
  assert.ok(storage.operations.slice(afterRecovery).every(op=>op[1]!==OLD),'Returned MVP08 must not merge the changed MVP07 defaults');
  assert.equal(source8.fetched.length,42,'Recovery must leave the original Format8 cache usable without refetch');
  t.diagnostic(JSON.stringify({case:name,normalSha256:product.package.sha256,recoverySha256:recovery.packageSha256,
    sequence:['0.8.0.0/Format8','0.8.0.1/MVP07/Format7','0.8.0.0/Format8-offline'],sameStorage:true,sameIndexedDB:true,
    v5BytesUnchanged:true,actualM365Installation:false}));
}
module.exports={...harness,NORMAL,RECOVERY,ORIGINAL,F8,F7,provider,activate,basic,roundtrip};
