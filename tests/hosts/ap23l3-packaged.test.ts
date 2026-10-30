// SPDX-License-Identifier: AGPL-3.0-only
// Executes the actual local SPPKG AMD bundle. Approval shapes exist only in memory.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {buildSyntheticFormat16,encode16,AP23L3_ADMIN} from '../core/ap23l3Fixtures';

const selectedStage=process.env.AP23L3_PACKAGE_STAGE;
if(selectedStage)assert.match(selectedStage,/^\.work\/ap23l3-spfx-build-[A-Za-z0-9]{6}$/);
const report=selectedStage
 ?{stage:selectedStage,testPackage:{path:`${selectedStage}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg`}}
 :JSON.parse(readFileSync('outputs/ap23l3-2026-10-27/spfx-build.json','utf8'));
if(!selectedStage)assert.equal(report.status,'passed');
const require=createRequire(import.meta.url);
const {loadPackagedHost,localMirrorConfiguration}=require(resolve(report.stage,'spfx/test-build/package-harness.cjs'));
const approved=buildSyntheticFormat16('approved'),candidate=buildSyntheticFormat16('localReference');
const research=JSON.parse(readFileSync('docs/fachrecht/ap23l1/referenzfaelle.json','utf8'));
const makeHost=()=>loadPackagedHost(resolve(report.testPackage.path));
function provider(value=approved,suffix='native16',corrupt=false):any{
 const files=new Map([['manifest.json',encode16(value.manifest)],...value.files]);
 if(corrupt)files.set(AP23L3_ADMIN,files.get(AP23L3_ADMIN)!+' ');
 const fetched:string[]=[];
 return{id:'same-label',kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(suffix),fetched,
  async fetchBytes(path:string){fetched.push(path);assert.ok(files.has(path));return new TextEncoder().encode(files.get(path)!);}};
}
async function activated(){const host=makeHost(),result=await host.service.refresh(provider());host.host.applyActivationResult(result,host.host.props.configurationKey);return host;}
function inspect(host:any,row:any,check:(result:any,state:any)=>void,locale='de',overrides?:Record<string,string>,qualified=true){
 const catalog=host.host.state.administrativeContext.administrativeCatalog;
 const path=catalog.paths.find((path:any)=>path.researchRef===row.path&&path.contractFamily==='qualifiedDayProcedureV9');assert.ok(path);
 const canton=catalog.laws.find((law:any)=>law.lawId===path.lawId).canton;
 host.inspectCalculator({authorityCode:canton,profileId:'',inputDate:row.trigger,deadlineDays:String(row.days)},(state:any)=>{
  let tree=state.tree;
  if(locale==='fr'){state.findElement(tree,(el:any)=>el.props.className==='fr-language').props.onChange(undefined,{key:'fr'});tree=state.renderSession();}
  state.findElement(tree,(el:any)=>el.props.options?.some((option:any)=>option.key==='admin:'+path.lawId)).props.onChange(undefined,{key:'admin:'+path.lawId});tree=state.renderSession();
  const fields=state.findElement(tree,(el:any)=>el.props.lawId===path.lawId&&el.props.catalog&&typeof el.props.onChange==='function');assert.ok(fields);
  const policy=catalog.qualificationPolicies.find((q:any)=>q.pathId===path.pathId);
  const alternatives=Object.fromEntries(policy.requirements.filter((q:any)=>q.oneOf?.length>1).map((q:any)=>[q.key,String(row.facts[q.key])]));
  const values=Object.assign(new host.realmObject(),alternatives,overrides??{});
  fields.props.onChange({stage:path.stages[0],pathId:path.pathId,qualification:qualified?'generalActualReceipt':'',urgency:'none',currentValues:values});
  tree=state.renderSession();
  if(path.duration.kind!=='statutoryDays'){
   const number=state.findElement(tree,(el:any)=>el.props.type==='number'&&typeof el.props.onChange==='function');
   assert.ok(number,'Current variable duration input');number.props.onChange(undefined,String(row.days));tree=state.renderSession();
  }
  state.findElement(tree,(el:any)=>el.type==='form').props.onSubmit({preventDefault(){}});tree=state.renderSession();
  const calculation=state.stateValues().find((value:any)=>value?.kind==='administrative');
  check(calculation?.value,{...state,tree,input:calculation?.input});
 });
}
const reference=(id:string)=>research.cases.find((row:any)=>row.id===id);

test('AP23L3 actual AMD rejects local candidate before component fetch and never caches it',async()=>{
 const host=makeHost(),source=provider(candidate);await assert.rejects(host.service.refresh(source));
 assert.deepEqual(source.fetched,['manifest.json']);assert.equal(await host.service.getActive(source),undefined);
});

test('AP23L3 actual AMD binds one native16 context with196 paths and35 physical calendars',async()=>{
 const host=await activated();assert.equal(host.host.state.calculationData.formatVersion,'16.0.0');
 assert.equal(host.host.state.calculationData.calendarRuleSets.size,35);
 assert.equal(host.host.state.administrativeContext.administrativeCatalog.paths.length,196);
});

test('AP23L3 actual AMD handlers calculate all31 new paths using explicit current alternatives and duration',async()=>{
 const host=await activated(),catalog=host.host.state.administrativeContext.administrativeCatalog;
 const paths=catalog.paths.filter((path:any)=>path.contractFamily==='qualifiedDayProcedureV9');assert.equal(paths.length,31);
 for(const path of paths){
  const row=research.cases.find((row:any)=>row.path===path.researchRef&&row.expected.outcome==='datedResearchValue');assert.ok(row,path.pathId);
  inspect(host,row,(result,state)=>{
   assert.ok(result,path.pathId);assert.equal(result.outcome,'calculated',path.pathId);assert.equal(result.finalEnd,row.expected.end,path.pathId);
   assert.equal(result.referenceOnly,false);assert.equal(result.provenance.pathId,path.pathId);
   for(const req of catalog.qualificationPolicies.find((q:any)=>q.pathId===path.pathId).requirements)
    if(req.oneOf?.length>1)assert.equal(state.input.caseQualification[req.key],row.facts[req.key],path.pathId+'/'+req.key);
  },path.stages[0]==='court'?'fr':'de');
 }
});

test('AP23L3 actual AMD distinguishes qualified opening from tracking receipt and keeps court recess separate',async()=>{
 const host=await activated();
 for(const id of['L1-AI-R21','L1-AI-R22','L1-AI-R23','L1-AI-R24','L1-AI-R25']){
  const row=reference(id);inspect(host,row,(result,state)=>{
   assert.equal(result.outcome,'calculated',id);assert.equal(result.finalEnd,row.expected.end,id);
   assert.equal(state.input.caseQualification.openingMode,row.facts.openingMode,id);
   if(row.facts.openingMode==='trackingPhysicalReceipt'){
    assert.equal(state.input.caseQualification.expectedService,true);
    assert.equal(state.input.caseQualification.entryIntoSphere,'verified');
    assert.equal(state.input.caseQualification.receiptHolidayRegime,'sameAsBoundAuthorityCalendar');
   }
  },id==='L1-AI-R25'?'fr':'de');
 }
});

test('AP23L3 actual AMD requires current case qualification and a selected opening mode',async()=>{
 const host=await activated();
 inspect(host,reference('L1-AI-R22'),result=>assert.equal(result,undefined),'de',undefined,false);
 inspect(host,reference('L1-AI-R22'),result=>assert.equal(result,undefined),'fr',{openingMode:''});
});

test('AP23L3 actual AMD longer notice is linked to current duration and selected statutory base',async()=>{
 const host=await activated();
 for(const id of['L1-AI-R16','L1-AI-R18']){
  const row=reference(id);inspect(host,row,(result,state)=>{
   assert.equal(result.outcome,'calculated');assert.equal(result.finalEnd,'2026-11-16');
   assert.equal(state.input.caseQualification.actualLongerInstructionDays,45);
   assert.equal(state.input.caseQualification.ordinaryStatutoryDays,row.facts.ordinaryStatutoryDays);
  },id==='L1-AI-R18'?'fr':'de');
 }
 inspect(host,{...reference('L1-AI-R16'),days:30},result=>assert.ok(!result||result.outcome!=='calculated'),'de');
 inspect(host,reference('L1-AI-R16'),result=>assert.equal(result,undefined),'fr',{ordinaryStatutoryDays:''});
});

test('AP23L3 actual AMD max10 opposition uses the current order and never silently inserts ten days',async()=>{
 const host=await activated();
 for(const[days,end]of[[1,'2026-12-24'],[5,'2026-12-28'],[10,'2027-01-04']]as const)
  inspect(host,{...reference('L1-SZ-R08'),days},(result,state)=>{assert.equal(result.outcome,'calculated');assert.equal(result.finalEnd,end);assert.equal(state.input.deadlineDays,days);});
 inspect(host,{...reference('L1-SZ-R08'),days:11},result=>assert.ok(!result||result.outcome!=='calculated'));
});

test('AP23L3 actual AMD applies Schwyz Martinstag only as a bound end holiday and keeps January7 recess',async()=>{
 const host=await activated();
 for(const id of['L1-SZ-R09','L1-SZ-R13','L1-SZ-R14','L1-SZ-R31','L1-SZ-R32']){
  const row=reference(id);inspect(host,row,(result,state)=>{assert.equal(result.outcome,'calculated',id);assert.equal(result.finalEnd,row.expected.end,id);
   assert.equal(state.input.caseQualification.authorityMunicipality,'Schwyz');},id==='L1-SZ-R14'?'fr':'de');
 }
});

test('AP23L3 actual AMD blocks two end-shift/recess collisions and the full calculation window',async()=>{
 const host=await activated();
 for(const id of['L1-AI-R48','L1-SZ-R30','L1-AI-R45','L1-SZ-R18'])inspect(host,reference(id),result=>{
  assert.ok(result,id);assert.equal(result.outcome,'blocked',id);assert.equal(result.finalEnd,undefined,id);assert.equal(result.calendarExportAllowed,false,id);
 },id.includes('SZ')?'fr':'de');
});

test('AP23L3 actual packaged fallback revalidates only the same configured source and rejects corrupted bytes',async()=>{
 const host=makeHost(),source=provider();await host.service.refresh(source);
 const offline=(value:any)=>({...value,async fetchBytes(){throw Error('L3 OFFLINE');}});
 assert.equal((await host.service.refresh(offline(source))).mode,'fallback');
 await assert.rejects(host.service.refresh(offline(provider(approved,'foreign'))),/L3 OFFLINE/);
 await assert.rejects(host.service.refresh(provider(approved,'corrupt',true)));
});
