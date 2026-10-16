// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const harness=require('./package-harness.cjs');
const {REPO_ROOT,localMirrorConfiguration,sha256}=harness;
const PACKAGE=process.env.FRISTENRECHNER_RECOVERY_SPPKG,STAGE=process.env.FRISTENRECHNER_RECOVERY_STAGE;
assert.ok(PACKAGE&&path.isAbsolute(PACKAGE));assert.ok(STAGE&&path.isAbsolute(STAGE));
assert.match(path.relative(REPO_ROOT,STAGE),/^\.work\/mvp08-recovery-[A-Za-z0-9]+$/);
const F7='2026-10-08-mvp-07-approved.1',AP5='2026-08-29-ap5-approved.1';
const V5='fristenrechner.defaults.v5',OLD='fristenrechner.defaults.v1';
const ARCHIVE=path.join(REPO_ROOT,'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg');
assert.equal(sha256(fs.readFileSync(ARCHIVE)),'8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db');
assert.notEqual(fs.realpathSync(PACKAGE),fs.realpathSync(ARCHIVE));
const fileSets=new Map();
function provider(id=F7,suffix=''){
  if(!fileSets.has(id)){
    const dir=path.join(STAGE,'data/releases',id),manifest=fs.readFileSync(path.join(dir,'manifest.json'));
    fileSets.set(id,new Map([['manifest.json',manifest],...JSON.parse(manifest).artifacts.map(d=>[d.path,fs.readFileSync(path.join(dir,d.path))])]));
  }
  const files=fileSets.get(id),fetched=[];
  return{id:`synthetic-local:${id}${suffix}`,kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(id+suffix),fetched,
    async fetchBytes(name){fetched.push(name);assert.ok(files.has(name),name);return new Uint8Array(files.get(name));}};
}
const offline=p=>({...p,async fetchBytes(){throw new Error('SYNTHETIC LOCAL OFFLINE');}});
async function activate(runtime,source=provider()){
  runtime.configure(source);await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'ready',runtime.host.state.message);return runtime.host.state.calculationData;
}
const basic={authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10',calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
function click(ui,label){const button=ui.findElement(ui.tree,n=>n.props.children===label&&typeof n.props.onClick==='function');assert.ok(button,label);button.props.onClick();ui.rerender();}
module.exports={...harness,provider,offline,activate,basic,click,PACKAGE,STAGE,F7,AP5,V5,OLD,ARCHIVE};
