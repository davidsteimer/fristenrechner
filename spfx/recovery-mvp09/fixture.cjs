// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// The unchanged built AMD runs, browser/React/transport are explicit simulations.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const harness=require('../recovery-mvp07/package-harness.cjs');
const {REPO_ROOT,localMirrorConfiguration,sha256}=harness;
const PACKAGE=process.env.FRISTENRECHNER_RECOVERY_SPPKG,STAGE=process.env.FRISTENRECHNER_RECOVERY_STAGE;
assert.ok(PACKAGE&&path.isAbsolute(PACKAGE));assert.ok(STAGE&&path.isAbsolute(STAGE));
assert.match(path.relative(REPO_ROOT,STAGE),/^\.work\/mvp09-recovery-[A-Za-z0-9]+$/);
const F8='2026-10-15-mvp-08-approved.1',AP5='2026-08-29-ap5-approved.1',V5='fristenrechner.defaults.v5';
const ARCHIVE=path.join(REPO_ROOT,'outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-0.8.0.0.sppkg');
assert.equal(sha256(fs.readFileSync(ARCHIVE)),'d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a');
assert.notEqual(fs.realpathSync(PACKAGE),fs.realpathSync(ARCHIVE));
const fileSets=new Map();
function provider(id=F8,suffix=''){
  if(!fileSets.has(id)){
    const dir=path.join(STAGE,'data/releases',id),raw=fs.readFileSync(path.join(dir,'manifest.json')),manifest=JSON.parse(raw);
    const files=new Map([['manifest.json',raw]]);
    for(const item of manifest.artifacts){const bytes=fs.readFileSync(path.join(dir,item.path));assert.equal(sha256(bytes),item.sha256);assert.equal(bytes.length,item.byteLength);files.set(item.path,bytes);}
    fileSets.set(id,files);
  }
  const files=fileSets.get(id),fetched=[];
  return{id:`synthetic-local:${id}${suffix}`,kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(id+suffix),fetched,
    async fetchBytes(name){fetched.push(name);assert.ok(files.has(name),name);return new Uint8Array(files.get(name));}};
}
const offline=p=>({...p,async fetchBytes(){throw new Error('SYNTHETIC LOCAL OFFLINE');}});
async function activate(runtime,source=provider()){
  runtime.configure(source);await runtime.host.restoreAndRefresh();assert.equal(runtime.host.state.status,'ready',runtime.host.state.message);return runtime.host.state.calculationData;
}
const basic={authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10',calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
function click(ui,label){const button=ui.findElement(ui.tree,node=>node.props.children===label&&typeof node.props.onClick==='function');assert.ok(button,label);button.props.onClick();ui.rerender();}
const preferences=(canton,lawId,pathId,days)=>({version:5,state:'preferences',preferences:{locale:'de',authorityCode:canton,deadlineDays:days,
  deliveryMethod:'otherLegallyRelevantDate',procedureSelection:{kind:'cantonalAdministrative',lawId,pathId,revision:1,stage:'administrativeAppeal'},
  legacySelectors:{},vrpgSelection:{area:'',law:'',action:'',stage:''},calendarPreference:{role:'',canton:''}}});
const protectedSeeds={LU:JSON.stringify(preferences('LU','vrg-lu','lu-admin-30',30)),ZG:JSON.stringify(preferences('ZG','vrg-zg','zg-admin-20',20)),
  AR:JSON.stringify(preferences('AR','vrpg-ar','ar-execution-5',5)),corrupt:'{not-json-preserved',future:JSON.stringify({version:999,state:'unknown',payload:['keep exactly']})};
module.exports={...harness,provider,offline,activate,basic,click,PACKAGE,STAGE,F8,AP5,V5,ARCHIVE,protectedSeeds,preferences};
