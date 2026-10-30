// SPDX-License-Identifier: AGPL-3.0-only
// Actual SPPKG AMD code. Synthetic approvals exist only in memory, never in data files.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {buildSyntheticFormat11,encode11,AP23G3_ADMIN} from '../core/ap23g3Fixtures';
const report=JSON.parse(readFileSync('outputs/ap23g3-2026-10-22/spfx-build.json','utf8'));
assert.equal(report.status,'passed');
const require=createRequire(import.meta.url);
const {loadPackagedHost,localMirrorConfiguration}=require(resolve(report.stage,'spfx/test-build/package-harness.cjs'));
const approved=buildSyntheticFormat11('approved');
const candidate=buildSyntheticFormat11('localReference');
const makeHost=()=>loadPackagedHost(resolve(report.testPackage.path));
function provider(value=approved,suffix='native11',corrupt=false):any {
  const files=new Map([['manifest.json',encode11(value.manifest)],...value.files]);
  if(corrupt) files.set(AP23G3_ADMIN,files.get(AP23G3_ADMIN)!+' ');
  const fetched:string[]=[];
  return {id:'same-label',kind:'sharepointMirror',cacheConfiguration:localMirrorConfiguration(suffix),fetched,
    async fetchBytes(path:string){fetched.push(path);assert.ok(files.has(path));return new TextEncoder().encode(files.get(path)!);}};
}
async function activated(){const host=makeHost();const result=await host.service.refresh(provider());host.host.applyActivationResult(result,host.host.props.configurationKey);return host;}
function inspect(host:any,pathId:string,date:string,inspectResult:(result:any,state:any)=>void,locale='de'){
  const catalog=host.host.state.administrativeContext.administrativeCatalog;
  const path=catalog.paths.find((p:any)=>p.pathId===pathId);assert.ok(path);
  const canton=pathId.split('-')[0]!.toUpperCase();
  host.inspectCalculator({authorityCode:canton,profileId:'',inputDate:date,deadlineDays:'10'},(state:any)=>{
    let tree=state.tree;
    if(locale==='fr'){state.findElement(tree,(el:any)=>el.props.className==='fr-language').props.onChange(undefined,{key:'fr'});tree=state.renderSession();}
    const law=state.findElement(tree,(el:any)=>el.props.options?.some((option:any)=>option.key==='admin:'+path.lawId));
    assert.ok(law);law.props.onChange(undefined,{key:'admin:'+path.lawId});tree=state.renderSession();
    const fields=state.findElement(tree,(el:any)=>el.props.lawId===path.lawId&&el.props.catalog&&typeof el.props.onChange==='function');
    assert.ok(fields);fields.props.onChange({stage:path.stages[0],pathId,qualification:'generalActualReceipt',urgency:'none'});
    tree=state.renderSession();state.findElement(tree,(el:any)=>el.type==='form').props.onSubmit({preventDefault(){}});
    tree=state.renderSession();
    const calculation=state.stateValues().find((v:any)=>v?.kind==='administrative');
    assert.ok(calculation);inspectResult(calculation.value,{...state,tree,input:calculation.input});
  });
}
test('AP23G3 actual AMD rejects the unapproved candidate before fetching artifacts',async()=>{
  const host=makeHost(),source=provider(candidate);
  await assert.rejects(host.service.refresh(source));
  assert.deepEqual(source.fetched,['manifest.json']);
  assert.equal(await host.service.getActive(source),undefined);
});
test('AP23G3 actual packaged handlers calculate all 16 new qualified paths using one native11 context',async()=>{
  const host=await activated();
  assert.equal(host.host.state.calculationData.formatVersion,'11.0.0');
  assert.equal(host.host.state.calculationData.calendarRuleSets.size,33);
  const catalog=host.host.state.administrativeContext.administrativeCatalog;
  assert.equal(catalog.paths.length,58);
  const newPaths=catalog.paths.filter((p:any)=>/^(ur|so|sh)-/.test(p.pathId));assert.equal(newPaths.length,16);
  for(const path of newPaths){
    const days=path.duration.kind==='statutoryDays'?path.duration.value:10;
    const expected=({30:'2026-11-02',20:'2026-10-22',10:'2026-10-12'} as Record<number,string>)[days];
    assert.ok(expected);
    inspect(host,path.pathId,'2026-10-02',(result,state)=>{
      assert.equal(result.outcome,'calculated',path.pathId);assert.equal(result.finalEnd,expected,path.pathId);
      assert.equal(result.provenance.pathId,path.pathId);assert.equal(state.input.caseQualification.direction,'forward');
      assert.equal(state.input.caseQualification.notice,'uncontested');
      assert.equal(result.referenceOnly,false); // Purely synthetic approved envelope, not a release.
    });
  }
});
test('AP23G3 actual AMD keeps SG VRK summer suspension and narrow F1-O1 guard in both languages',async()=>{
  const host=await activated();
  inspect(host,'sg-vrk-14','2027-07-10',result=>{assert.equal(result.finalEnd,'2027-08-25');assert.ok(result.provenance.evaluatedNormSegments.length);},'fr');
  inspect(host,'sg-court-interim-5','2027-07-10',result=>assert.equal(result.finalEnd,'2027-07-15'));
  inspect(host,'ag-execution-10','2027-07-10',result=>assert.equal(result.finalEnd,'2027-08-23'));
  inspect(host,'zh-court-30','2027-02-18',result=>{
    assert.equal(result.outcome,'blocked');assert.equal(result.finalEnd,undefined);assert.equal(result.calendarExportAllowed,false);
    assert.ok(result.blockReasonKeys.includes('endShiftIntoSuspensionUnresolved'));
  });
});
test('AP23G3 actual packaged UR opening notice does not change the date and SH court reasons use thirty days',async()=>{
  const host=await activated();
  inspect(host,'ur-admin-20','2026-12-23',result=>{
    assert.equal(result.finalEnd,'2027-01-12');
    assert.ok(result.warningKeys.includes('administrative.urArt22OpeningRestriction'));
  });
  inspect(host,'sh-court-reasons-30','2026-10-02',(result,state)=>{
    assert.equal(result.finalEnd,'2026-11-02');assert.equal(state.input.caseQualification.sameIssuingCourt,true);
    assert.equal(result.provenance.holidayRole,'courtSeat');
  },'fr');
  inspect(host,'sh-admin-20','2026-12-13',result=>{
    assert.equal(result.finalEnd,'2027-01-04');
    assert.ok(result.provenance.sourceRefs.some((r:any)=>r.sourceId==='JUD-AP23G1-SH-BGER-2C4832025-20260312'));
    assert.ok(!result.provenance.sourceRefs.some((r:any)=>r.sourceId==='JUD-AP23G1-SH-OGE-4020181K-20180824'));
  });
});
test('AP23G3 actual packaged collision blocks all seven new court groups without result or export',async()=>{
  const host=await activated();
  for(const[id,date]of[['ur-court-20','2027-02-28'],['ur-court-ordered','2027-03-10'],['so-court-10','2027-03-10'],
    ['so-court-ordered','2027-03-10'],['sh-court-20','2027-02-28'],['sh-court-ordered','2027-03-10'],['sh-court-reasons-30','2027-02-18']]){
    inspect(host,id!,date!,result=>{assert.equal(result.outcome,'blocked',id!);assert.equal(result.finalEnd,undefined);
      assert.equal(result.calendarExportAllowed,false);assert.ok(result.blockReasonKeys.includes('endShiftIntoSuspensionUnresolved'));});
  }
});
test('AP23G3 actual packaged cache revalidates same-source bytes and rejects foreign or corrupt sources',async()=>{
  const host=makeHost(),source=provider();await host.service.refresh(source);
  const offline=(p:any)=>({...p,async fetchBytes(){throw Error('F3 OFFLINE');}});
  assert.equal((await host.service.refresh(offline(source))).mode,'fallback');
  await assert.rejects(host.service.refresh(offline(provider(approved,'foreign'))),/F3 OFFLINE/);
  await assert.rejects(host.service.refresh(provider(approved,'corrupt',true)));
});
