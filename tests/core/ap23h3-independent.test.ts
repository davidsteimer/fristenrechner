// SPDX-License-Identifier: AGPL-3.0-only
// Additive root review against actual native inputs, independent of H1 replay expectations.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createFormat12CalculationData} from '../../src/core/format12CalculationData';
import {calculateAdministrativeDeadline} from '../../src/core/administrativeDeadline';
import {socialObjectSha256} from '../../src/core/socialCatalog';
import {buildSyntheticFormat12,encode12,changeSyntheticFormat12,administrativeInput12,AP23H3_ADMIN} from './ap23h3Fixtures';

const source=buildSyntheticFormat12();
const runtime=createFormat12CalculationData(encode12(source.manifest),source.files,{mode:'localReference'});
const catalog=runtime.administrativeContext.administrativeCatalog;
const newPaths=catalog.paths.filter(p=>p.pathId.startsWith('ow-')||p.pathId.startsWith('nw-'));
const calculate=(v:any,context:unknown=runtime.administrativeContext)=>calculateAdministrativeDeadline(v,context);
const load=(f:ReturnType<typeof buildSyntheticFormat12>,approved=false)=>createFormat12CalculationData(encode12(f.manifest),f.files,{mode:approved?'approved':'localReference'});

test('H3 independent review removes every required current fact from all21 native paths',t=>{
  let removed=0;
  assert.equal(newPaths.length,21);
  for(const p of newPaths){
    const input=administrativeInput12(catalog,p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined);
    assert.equal(calculate(input).outcome,'calculated',p.pathId+'/positive');
    for(const key of Object.keys(input.caseQualification!)){
      const copy=structuredClone(input) as any;
      delete copy.caseQualification[key];
      const result=calculate(copy);
      assert.equal(result.outcome,'blocked',p.pathId+'/'+key);
      assert.equal(result.calendarExportAllowed,false);
      removed++;
    }
  }
  t.diagnostic('Individually removed mandatory current facts: '+removed);
  assert.ok(removed>=200);
});

test('H3 independent review rejects opening-origin coercion and unproven later-reasons chains',()=>{
  for(const id of ['ow-admin-20','ow-court-30']){
    for(const value of [new String('originalReasoned'),new String('reasonedFollowingTimelyRequest'),
      {toString:()=> 'originalReasoned'},{toString:()=> 'reasonedFollowingTimelyRequest'},
      {valueOf:()=> 'originalReasoned'},['originalReasoned'],null,true,1]){
      const input=administrativeInput12(catalog,id) as any;
      input.caseQualification.openingOrigin=value;
      const result=calculate(input);
      assert.equal(result.outcome,'blocked',id+'/'+Object.prototype.toString.call(value));
      assert.equal(result.calendarExportAllowed,false);
    }
    const followup=administrativeInput12(catalog,id) as any;
    followup.caseQualification.openingOrigin='reasonedFollowingTimelyRequest';
    assert.equal(calculate(followup).outcome,'blocked');
    followup.caseQualification.priorReasonsRequest='timelyEstablished';
    assert.equal(calculate(followup).outcome,'calculated');
    followup.caseQualification.priorReasonsRequest='unknown';
    assert.equal(calculate(followup).outcome,'blocked');
  }
});

test('H3 independent review rejects copied serialized inherited and proxy context capabilities',()=>{
  const context=runtime.administrativeContext,input=administrativeInput12(catalog);
  for(const fake of [{...context},structuredClone({...context,artifacts:undefined}),Object.create(context),
    new Proxy(context,{}),JSON.parse(JSON.stringify({...context,artifacts:undefined})),{}]){
    const r=calculate(input,fake);
    assert.equal(r.outcome,'blocked');
    assert.equal(r.calendarExportAllowed,false);
  }
});

test('H3 independent review rejects invented facts and inherited-only facts rather than silently ignoring them',()=>{
  for(const p of newPaths){
    const input=administrativeInput12(catalog,p.pathId,'2026-10-02',p.duration.kind==='authorityOrderedDays'?10:undefined) as any;
    input.caseQualification.unmodelledPositive=true;
    assert.equal(calculate(input).outcome,'blocked',p.pathId+'/extra');
    delete input.caseQualification.unmodelledPositive;
    input.caseQualification=Object.create(input.caseQualification);
    assert.equal(calculate(input).outcome,'blocked',p.pathId+'/inherited');
  }
});

test('H3 independent review accepts only the exact two OW/NW source provenances, not modified URLs or review upgrades',()=>{
  const targets=[['SRC-AP23H1-OW-GOG-20220401','calendars/ow-procedural-calendar.json'],
    ['SRC-AP23H1-NW-VRG-20260801','calendars/nw-procedural-calendar.json']];
  for(const[id]of targets){
    for(const mode of ['url','review']){
      const f=buildSyntheticFormat12();
      const path=f.manifest.artifacts.find((d:any)=>d.role==='calendar'&&JSON.parse(f.files.get(d.path)!).sources.some((s:any)=>s.sourceId===id)).path;
      changeSyntheticFormat12(f,path,document=>{
        const s=document.sources.find((s:any)=>s.sourceId===id);
        if(mode==='url')s.url='https://example.invalid/changed-source';
        else s.reviewStatus=s.reviewStatus==='verified'?'monitored':'verified';
      });
      assert.throws(()=>load(f),/./,id+'/'+mode);
    }
  }
});

test('H3 independent review requires the active transitive CH parent, not just historic evidence',()=>{
  const f=buildSyntheticFormat12();
  changeSyntheticFormat12(f,AP23H3_ADMIN,c=>{
    for(const binding of c.holidayBindings.filter((b:any)=>b.bindingVersion==='5.0.0')){
      binding.physicalBaseline.references=binding.physicalBaseline.references.filter((r:any)=>r.contentId!=='ch-federal-calendar');
      for(const entry of c.releaseBinding.pathEligibility.filter((e:any)=>e.holidayBindingId===binding.holidayBindingId)){
        entry.holidayBindingSha256=socialObjectSha256(binding);
      }
    }
  });
  assert.throws(()=>load(f));
});

test('H3 independent review rejects a fresh approved-shaped path bound to the wrong actual calendar bytes',()=>{
  const f=buildSyntheticFormat12('approved');
  changeSyntheticFormat12(f,AP23H3_ADMIN,c=>{
    const e=c.releaseBinding.pathEligibility.find((e:any)=>e.pathId==='nw-admin-20');
    const replacement=f.manifest.artifacts.find((d:any)=>d.contentId==='be-public-holidays');
    const r=e.targetComponentRefs.find((r:any)=>r.contentId.startsWith('ap23h'))??e.targetComponentRefs[0];
    Object.assign(r,{contentId:replacement.contentId,role:replacement.role,sha256:replacement.sha256});
  });
  assert.throws(()=>load(f,true));
});

test('H3 independent review confirms two new physical calendars never change the OW/NW federal profile selection',()=>{
  const bindings=catalog.holidayBindings.filter(b=>'bindingVersion' in b&&b.bindingVersion==='5.0.0');
  assert.equal(bindings.length,4);
  const calendars=new Set(bindings.map(b=>b.physicalBaseline.calendarId));
  assert.equal(calendars.size,2);
  for(const b of bindings){
    const refs=b.physicalBaseline.references;
    assert.equal(refs.length,4);
    assert.equal(new Set(refs.map(r=>r.contentId)).size,4);
    assert.ok(refs.some(r=>r.contentId==='ch-federal-calendar'));
    assert.ok(refs.some(r=>r.contentId==='ch-holiday-catalog'));
    assert.ok(refs.some(r=>r.contentId===b.physicalBaseline.calendarId));
  }
  const activation=runtime.administrativeContext.catalog.activation;
  for(const b of activation.procedureBindings)for(const variant of b.variants){
    for(const id of [variant.projectionId,variant.alternativeProjectionId].filter((id):id is string=>id!==null)){
      const projection=activation.projections.find(p=>p.id===id);
      assert.ok(projection,b.id+'/'+id);
      assert.ok(!calendars.has(projection.calendarId),b.id+'/'+id);
    }
  }
});
