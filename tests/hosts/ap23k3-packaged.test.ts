// SPDX-License-Identifier: AGPL-3.0-only
// Executes the real SPPKG AMD bundle. Approvals exist only as synthetic memory bytes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {buildSyntheticFormat15,encode15,AP23K3_ADMIN} from '../core/ap23k3Fixtures';
const selectedStage=process.env.AP23K3_PACKAGE_STAGE;
if(selectedStage)assert.match(selectedStage,/^\.work\/ap23k3-spfx-build-[A-Za-z0-9]{6}$/);
// A compiled private stage may be tested concurrently with its historical suite.
// Only the finalizer may combine both successful reports into a completion claim.
const report=selectedStage
  ?{stage:selectedStage,testPackage:{path:`${selectedStage}/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg`}}
  :JSON.parse(readFileSync('outputs/ap23k3-2026-10-27/spfx-build.json','utf8'));
if(!selectedStage)assert.equal(report.status,'passed');
const require=createRequire(import.meta.url);
const {loadPackagedHost,localMirrorConfiguration}=require(resolve(report.stage,'spfx/test-build/package-harness.cjs'));
const approved=buildSyntheticFormat15('approved'),candidate=buildSyntheticFormat15('localReference');
const research=JSON.parse(readFileSync('docs/fachrecht/ap23j1/referenzfaelle.json','utf8'));
const makeHost=()=>loadPackagedHost(resolve(report.testPackage.path));
function provider(value=approved,suffix='native15',corrupt=false):any{
  const files=new Map([['manifest.json',encode15(value.manifest)],...value.files]);
  if(corrupt)files.set(AP23K3_ADMIN,files.get(AP23K3_ADMIN)!+' ');
  const fetched:string[]=[];
  return{id:'same-label',kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(suffix),fetched,
    async fetchBytes(path:string){fetched.push(path);assert.ok(files.has(path));return new TextEncoder().encode(files.get(path)!);}};
}
function elementText(node:any):string{
 if(Array.isArray(node))return node.map(elementText).join('');
 if(typeof node==='string'||typeof node==='number')return String(node);
 return node&&typeof node==='object'&&node.props?elementText(node.props.children):'';
}
async function activated(){const host=makeHost(),result=await host.service.refresh(provider());host.host.applyActivationResult(result,host.host.props.configurationKey);return host;}
function inspect(host:any,pathId:string,date:string,check:(value:any,state:any)=>void,locale='de',days=10,values?:Record<string,string>,extra?:Record<string,unknown>){
  const catalog=host.host.state.administrativeContext.administrativeCatalog,path=catalog.paths.find((p:any)=>p.pathId===pathId);assert.ok(path);
  const canton=catalog.laws.find((law:any)=>law.lawId===path.lawId).canton;
  host.inspectCalculator({authorityCode:canton,profileId:'',inputDate:date,deadlineDays:String(days)},(state:any)=>{
    let tree=state.tree;
    if(locale==='fr'){state.findElement(tree,(el:any)=>el.props.className==='fr-language').props.onChange(undefined,{key:'fr'});tree=state.renderSession();}
    state.findElement(tree,(el:any)=>el.props.options?.some((o:any)=>o.key==='admin:'+path.lawId)).props.onChange(undefined,{key:'admin:'+path.lawId});tree=state.renderSession();
    const fields=state.findElement(tree,(el:any)=>el.props.lawId===path.lawId&&el.props.catalog&&typeof el.props.onChange==='function');
    const currentValues=values?Object.assign(new host.realmObject(),values):undefined;
    assert.ok(fields);fields.props.onChange({stage:path.stages[0],pathId,qualification:'generalActualReceipt',urgency:'none',...(currentValues?{currentValues}:{}),...(extra??{}),...(extra?.areaFacts?{areaFacts:Object.assign(new host.realmObject(),extra.areaFacts)}:{})});tree=state.renderSession();
    if(path.duration.kind!=='statutoryDays'){
      const number=state.findElement(tree,(el:any)=>el.props.type==='number'&&typeof el.props.onChange==='function');
      assert.ok(number,'Current variable duration input');number.props.onChange(undefined,String(days));tree=state.renderSession();
    }
    state.findElement(tree,(el:any)=>el.type==='form').props.onSubmit({preventDefault(){}});tree=state.renderSession();
    const calculation=state.stateValues().find((value:any)=>value?.kind==='administrative');
    check(calculation?.value,{...state,tree,input:calculation?.input});
  });
}
test('AP23K3 actual AMD rejects the unapproved local candidate before any artifact fetch',async()=>{
  const host=makeHost(),source=provider(candidate);await assert.rejects(host.service.refresh(source));
  assert.deepEqual(source.fetched,['manifest.json']);assert.equal(await host.service.getActive(source),undefined);
});
test('AP23K3 actual AMD contains one complete native15 context with165 paths and35 calendars',async()=>{
  const host=await activated();assert.equal(host.host.state.calculationData.formatVersion,'15.0.0');
  assert.equal(host.host.state.calculationData.calendarRuleSets.size,35);assert.equal(host.host.state.administrativeContext.administrativeCatalog.paths.length,165);
});
test('AP23K3 actual AMD handlers calculate all36 FR/GE/JU paths with explicit current alternatives',async()=>{
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
test('AP23K3 actual AMD TG given/absent notice changes the winter result without replacing the statutory5days',async()=>{
  const host=await activated();
  for(const[notice,end]of[['given','2026-12-21'],['absent','2027-01-04']])inspect(host,'tg-vg-execution-5','2026-12-14',(result,state)=>{
    assert.equal(result.outcome,'calculated');assert.equal(result.finalEnd,end);assert.equal(state.input.deadlineDays,5);
    assert.equal(state.input.caseQualification.exceptionNotice,notice);
  },notice==='given'?'de':'fr',5,{exceptionNotice:notice!});
});
test('AP23K3 actual AMD no current notice and invalid concrete shortened duration produce no stale result',async()=>{
  const host=await activated();
  inspect(host,'tg-vg-execution-5','2026-12-14',result=>assert.equal(result,undefined),'de',5);
  inspect(host,'tg-vg-execution-5','2026-12-14',result=>assert.equal(result,undefined),'fr',5,{exceptionNotice:'unknown'});
  inspect(host,'gl-admin-shortened-end','2026-10-02',result=>assert.equal(result,undefined),'de',1);
  inspect(host,'tg-rekurs-shortened','2026-10-02',result=>assert.equal(result,undefined),'fr',30,{shorteningGround:'otherUrgentCase'});
});
test('AP23K3 actual AMD preserves old court summer clocks and concrete collision blocks',async()=>{
  const host=await activated();
  inspect(host,'sg-vrk-14','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-25'),'fr',14);
  inspect(host,'sg-court-interim-5','2027-07-10',result=>assert.equal(result.finalEnd,'2027-07-15'),'de',5);
  inspect(host,'ag-execution-10','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-23'),'de',10);
  inspect(host,'zh-court-30','2027-02-18',result=>{assert.equal(result.outcome,'blocked');assert.equal(result.finalEnd,undefined);assert.equal(result.calendarExportAllowed,false);});
});
test('AP23K3 actual AMD keeps OW/NW procedural calendars and special actions intact',async()=>{
  const host=await activated();
  inspect(host,'ow-court-suspensive-5','2026-12-23',result=>assert.equal(result.finalEnd,'2026-12-28'),'fr',5);
  inspect(host,'nw-einwendung-ordered','2026-12-10',result=>assert.equal(result.finalEnd,'2027-01-15'),'fr',20);
  inspect(host,'nw-admin-vernehmlassung-20','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-31'),'de',20);
  inspect(host,'ur-admin-20','2026-12-23',result=>{assert.equal(result.finalEnd,'2027-01-12');assert.ok(result.warningKeys.includes('administrative.urArt22OpeningRestriction'));},'de',20);
});
test('AP23K3 actual packaged same-source fallback is revalidated and foreign/corrupt sources never activate',async()=>{
  const host=makeHost(),source=provider();await host.service.refresh(source);
  const offline=(p:any)=>({...p,async fetchBytes(){throw Error('K3 OFFLINE');}});
  assert.equal((await host.service.refresh(offline(source))).mode,'fallback');
  await assert.rejects(host.service.refresh(offline(provider(approved,'foreign'))),/K3 OFFLINE/);
  await assert.rejects(host.service.refresh(provider(approved,'corrupt',true)));
});
test('AP23K3 actual AMD handlers calculate all16 BS/BL paths without inherited holidays or invented current facts',async()=>{
 const host=await activated(),catalog=host.host.state.administrativeContext.administrativeCatalog,paths=catalog.paths.filter((p:any)=>p.contractFamily==='qualifiedDayProcedureV8');assert.equal(paths.length,16);
 for(const path of paths){const days=path.duration.kind==='statutoryDays'?path.duration.value:10,expected=days===30?'2026-11-02':days===5?'2026-10-07':'2026-10-12';
  const values=path.pathId==='bl-court-objection-5'?{courtOrderCategory:'competence'}:undefined,extra=path.pathId.startsWith('bs-court-')?{legalAnchorCanton:'TI'}:undefined;
  inspect(host,path.pathId,'2026-10-02',(result,state)=>{assert.ok(result,path.pathId);assert.equal(result.outcome,'calculated',path.pathId);assert.equal(result.finalEnd,expected,path.pathId);assert.equal(result.referenceOnly,false);assert.equal(result.provenance.pathId,path.pathId);
   assert.equal(state.input.caseQualification.regionalOfficeMode,undefined);assert.equal(state.input.caseQualification.role,undefined);
   if(extra)assert.equal(state.input.caseQualification.legalAnchorCanton,'TI');else assert.equal(state.input.caseQualification.legalAnchorCanton,undefined);
  },path.pathId.includes('court')?'fr':'de',days,values,extra);
 }
});
test('AP23K3 actual AMD covers all7 closed BL presidential categories',async()=>{
 const host=await activated(),catalog=host.host.state.administrativeContext.administrativeCatalog,q=catalog.qualificationPolicies.find((q:any)=>q.pathId==='bl-court-objection-5'),categories=q.requirements.find((r:any)=>r.key==='courtOrderCategory').oneOf;assert.equal(categories.length,7);
 for(const category of categories)inspect(host,'bl-court-objection-5','2026-10-02',(result,state)=>{assert.equal(result.outcome,'calculated');assert.equal(result.finalEnd,'2026-10-07');assert.equal(state.input.caseQualification.courtOrderCategory,category);},'de',5,{courtOrderCategory:category});
 inspect(host,'bl-court-objection-5','2026-10-02',result=>assert.equal(result,undefined),'fr',5);
});
test('AP23K3 actual AMD separates BS anchor from BL closures and foreign court recess',async()=>{
 const host=await activated();inspect(host,'bs-court-register-10','2026-12-14',result=>assert.equal(result,undefined),'de',10);
 inspect(host,'bs-court-register-10','2026-12-14',result=>{assert.equal(result.finalEnd,'2026-12-24');assert.equal(result.provenance.annualEndShiftResolution.kind,'none');},'de',10,undefined,{legalAnchorCanton:'BL'});
 inspect(host,'bl-admin-appeal-10','2026-12-14',result=>{assert.equal(result.finalEnd,'2027-01-04');assert.equal(result.provenance.annualEndShiftResolution.kind,'blCantonalOfficeClosures');assert.ok(result.shiftReasonKeys.includes('administrativeOfficeClosure'));},'de',10);
 inspect(host,'bs-court-register-10','2027-07-10',result=>{assert.equal(result.finalEnd,'2027-07-20');assert.equal(result.skippedCalendarDays,0);},'fr',10,undefined,{legalAnchorCanton:'TI'});
});
test('AP23K3 actual AMD requires exact current AI/NE scopes and calculates both alternatives',async()=>{
 const host=await activated();
 for(const[canton,scope,date,without,withRegion]of[['AI','AI-RTG-INNER-ADDITIONAL','2027-09-12','2027-09-22','2027-09-23'],['NE','NE-LANDERON-ADDITIONAL','2027-05-17','2027-05-27','2027-05-28']]){
  inspect(host,'bs-court-register-10',date!,result=>assert.equal(result,undefined),'de',10,undefined,{legalAnchorCanton:canton});
  for(const member of[false,true])inspect(host,'bs-court-register-10',date!,result=>{assert.equal(result.outcome,'calculated');assert.equal(result.finalEnd,member?withRegion:without);assert.equal(result.provenance.calendarResolution.areaFacts[scope!],member);},'de',10,undefined,{legalAnchorCanton:canton,areaFacts:{[scope!]:member}});
 }
});
test('AP23K3 actual AMD Fasnacht comparison blocks only a different legal end and offers no override',async()=>{
 const host=await activated();for(const locale of['de','fr'])inspect(host,'bl-admin-ordered','2027-02-01',(result,state)=>{
  assert.equal(result.outcome,'blocked');assert.equal(result.finalEnd,undefined);assert.equal(result.calendarExportAllowed,false);assert.equal(result.provenance.annualEndShiftResolution.uncertaintyComparison.outcome,'different');
  const element=state.findElement(state.tree,(el:any)=>typeof el.type==='function'&&el.props.result===result&&el.props.input===state.input);assert.ok(element,'Actual bundled AdministrativeResultView');
  const rendered=state.component(element).render(),trace=state.findElement(rendered,(el:any)=>el.props['data-testid']==='administrative-readable-trace');assert.ok(trace,'Actual bundled readable trace');
  const text=elementText(trace),message=locale==='de'?'Nicht abschliessend bestimmbar. Siehe Vergleichsvarianten.':'Report non déterminable définitivement. Voir les variantes comparatives.';
  assert.equal(text.split(message).length-1,2);
  assert.doesNotMatch(text,/Endverschiebung\s*Keine|Keine zusätzliche Büroschliessung hat das Fristende verschoben\.|Report de l’échéance\s*Aucun|Aucune fermeture supplémentaire n’a reporté l’échéance\./);
 },locale,8);
 inspect(host,'bl-admin-ordered','2027-02-01',result=>{assert.equal(result.finalEnd,'2027-02-11');assert.equal(result.provenance.annualEndShiftResolution.uncertaintyComparison.outcome,'equal');},'fr',10);
});


