// SPDX-License-Identifier: AGPL-3.0-only
// Executes the real SPPKG AMD bundle. Approvals exist only as synthetic memory bytes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {buildSyntheticFormat14,encode14,AP23J3_ADMIN} from '../core/ap23j3Fixtures';
const report=JSON.parse(readFileSync('outputs/ap23j3-2026-10-27/spfx-build.json','utf8'));
assert.equal(report.status,'passed');
const require=createRequire(import.meta.url);
const {loadPackagedHost,localMirrorConfiguration}=require(resolve(report.stage,'spfx/test-build/package-harness.cjs'));
const approved=buildSyntheticFormat14('approved'),candidate=buildSyntheticFormat14('localReference');
const research=JSON.parse(readFileSync('docs/fachrecht/ap23j1/referenzfaelle.json','utf8'));
const makeHost=()=>loadPackagedHost(resolve(report.testPackage.path));
function provider(value=approved,suffix='native14',corrupt=false):any{
  const files=new Map([['manifest.json',encode14(value.manifest)],...value.files]);
  if(corrupt)files.set(AP23J3_ADMIN,files.get(AP23J3_ADMIN)!+' ');
  const fetched:string[]=[];
  return{id:'same-label',kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(suffix),fetched,
    async fetchBytes(path:string){fetched.push(path);assert.ok(files.has(path));return new TextEncoder().encode(files.get(path)!);}};
}
async function activated(){const host=makeHost(),result=await host.service.refresh(provider());host.host.applyActivationResult(result,host.host.props.configurationKey);return host;}
function inspect(host:any,pathId:string,date:string,check:(value:any,state:any)=>void,locale='de',days=10,values?:Record<string,string>){
  const catalog=host.host.state.administrativeContext.administrativeCatalog,path=catalog.paths.find((p:any)=>p.pathId===pathId);assert.ok(path);
  const canton=catalog.laws.find((law:any)=>law.lawId===path.lawId).canton;
  host.inspectCalculator({authorityCode:canton,profileId:'',inputDate:date,deadlineDays:String(days)},(state:any)=>{
    let tree=state.tree;
    if(locale==='fr'){state.findElement(tree,(el:any)=>el.props.className==='fr-language').props.onChange(undefined,{key:'fr'});tree=state.renderSession();}
    state.findElement(tree,(el:any)=>el.props.options?.some((o:any)=>o.key==='admin:'+path.lawId)).props.onChange(undefined,{key:'admin:'+path.lawId});tree=state.renderSession();
    const fields=state.findElement(tree,(el:any)=>el.props.lawId===path.lawId&&el.props.catalog&&typeof el.props.onChange==='function');
    const currentValues=values?Object.assign(new host.realmObject(),values):undefined;
    assert.ok(fields);fields.props.onChange({stage:path.stages[0],pathId,qualification:'generalActualReceipt',urgency:'none',...(currentValues?{currentValues}:{})});tree=state.renderSession();
    if(path.duration.kind!=='statutoryDays'){
      const number=state.findElement(tree,(el:any)=>el.props.type==='number'&&typeof el.props.onChange==='function');
      assert.ok(number,'Current variable duration input');number.props.onChange(undefined,String(days));tree=state.renderSession();
    }
    state.findElement(tree,(el:any)=>el.type==='form').props.onSubmit({preventDefault(){}});tree=state.renderSession();
    const calculation=state.stateValues().find((value:any)=>value?.kind==='administrative');
    check(calculation?.value,{...state,tree,input:calculation?.input});
  });
}
test('AP23J3 actual AMD rejects the unapproved local candidate before any artifact fetch',async()=>{
  const host=makeHost(),source=provider(candidate);await assert.rejects(host.service.refresh(source));
  assert.deepEqual(source.fetched,['manifest.json']);assert.equal(await host.service.getActive(source),undefined);
});
test('AP23J3 actual AMD contains one complete native14 context with149 paths and35 calendars',async()=>{
  const host=await activated();assert.equal(host.host.state.calculationData.formatVersion,'14.0.0');
  assert.equal(host.host.state.calculationData.calendarRuleSets.size,35);assert.equal(host.host.state.administrativeContext.administrativeCatalog.paths.length,149);
});
test('AP23J3 actual AMD handlers calculate all36 FR/GE/JU paths with explicit current alternatives',async()=>{
  const host=await activated(),catalog=host.host.state.administrativeContext.administrativeCatalog;
  const paths=catalog.paths.filter((p:any)=>p.contractFamily==='qualifiedDayProcedureV7');assert.equal(paths.length,36);
  for(const path of paths){
    const r=research.paths.find((r:any)=>r.id.toLowerCase()===path.pathId);assert.ok(r);
    const values=Object.fromEntries(catalog.qualificationPolicies.find((q:any)=>q.pathId===path.pathId).requirements
      .filter((q:any)=>q.oneOf).map((q:any)=>[q.key,r.syntheticFacts[q.key]]));
    const days=path.duration.kind==='statutoryDays'?path.duration.value:path.duration.kind==='concretisedStatutoryDays'?7:10;
    const expected=({3:'2026-10-05',5:'2026-10-07',7:'2026-10-09',10:'2026-10-12',30:'2026-11-02'} as Record<number,string>)[days];assert.ok(expected);
    inspect(host,path.pathId,'2026-10-02',(result,state)=>{
      assert.ok(result,path.pathId);assert.equal(result.outcome,'calculated',path.pathId);assert.equal(result.finalEnd,expected,path.pathId);
      assert.equal(result.provenance.pathId,path.pathId);assert.equal(result.referenceOnly,false);
      for(const key of Object.keys(values))assert.equal(state.input.caseQualification[key],values[key]);
    },path.pathId.includes('court')||path.pathId.startsWith('tg-vg-')?'fr':'de',days,values);
  }
});
test('AP23J3 actual AMD TG given/absent notice changes the winter result without replacing the statutory5days',async()=>{
  const host=await activated();
  for(const[notice,end]of[['given','2026-12-21'],['absent','2027-01-04']])inspect(host,'tg-vg-execution-5','2026-12-14',(result,state)=>{
    assert.equal(result.outcome,'calculated');assert.equal(result.finalEnd,end);assert.equal(state.input.deadlineDays,5);
    assert.equal(state.input.caseQualification.exceptionNotice,notice);
  },notice==='given'?'de':'fr',5,{exceptionNotice:notice!});
});
test('AP23J3 actual AMD no current notice and invalid concrete shortened duration produce no stale result',async()=>{
  const host=await activated();
  inspect(host,'tg-vg-execution-5','2026-12-14',result=>assert.equal(result,undefined),'de',5);
  inspect(host,'tg-vg-execution-5','2026-12-14',result=>assert.equal(result,undefined),'fr',5,{exceptionNotice:'unknown'});
  inspect(host,'gl-admin-shortened-end','2026-10-02',result=>assert.equal(result,undefined),'de',1);
  inspect(host,'tg-rekurs-shortened','2026-10-02',result=>assert.equal(result,undefined),'fr',30,{shorteningGround:'otherUrgentCase'});
});
test('AP23J3 actual AMD preserves old court summer clocks and concrete collision blocks',async()=>{
  const host=await activated();
  inspect(host,'sg-vrk-14','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-25'),'fr',14);
  inspect(host,'sg-court-interim-5','2027-07-10',result=>assert.equal(result.finalEnd,'2027-07-15'),'de',5);
  inspect(host,'ag-execution-10','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-23'),'de',10);
  inspect(host,'zh-court-30','2027-02-18',result=>{assert.equal(result.outcome,'blocked');assert.equal(result.finalEnd,undefined);assert.equal(result.calendarExportAllowed,false);});
});
test('AP23J3 actual AMD keeps OW/NW procedural calendars and special actions intact',async()=>{
  const host=await activated();
  inspect(host,'ow-court-suspensive-5','2026-12-23',result=>assert.equal(result.finalEnd,'2026-12-28'),'fr',5);
  inspect(host,'nw-einwendung-ordered','2026-12-10',result=>assert.equal(result.finalEnd,'2027-01-15'),'fr',20);
  inspect(host,'nw-admin-vernehmlassung-20','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-31'),'de',20);
  inspect(host,'ur-admin-20','2026-12-23',result=>{assert.equal(result.finalEnd,'2027-01-12');assert.ok(result.warningKeys.includes('administrative.urArt22OpeningRestriction'));},'de',20);
});
test('AP23J3 actual packaged same-source fallback is revalidated and foreign/corrupt sources never activate',async()=>{
  const host=makeHost(),source=provider();await host.service.refresh(source);
  const offline=(p:any)=>({...p,async fetchBytes(){throw Error('J3 OFFLINE');}});
  assert.equal((await host.service.refresh(offline(source))).mode,'fallback');
  await assert.rejects(host.service.refresh(offline(provider(approved,'foreign'))),/J3 OFFLINE/);
  await assert.rejects(host.service.refresh(provider(approved,'corrupt',true)));
});

