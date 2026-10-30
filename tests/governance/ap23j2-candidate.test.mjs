// SPDX-License-Identifier: AGPL-3.0-only
// Read-only real inputs, isolated outputs and in-memory negative mutations only.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import Ajv2020 from '../../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../../spfx/node_modules/ajv-formats/dist/index.js';
import {buildJ2Candidate,assertJ2Preservation,ROOT,BASE,OUTPUT,ADMIN,HOLIDAYS,RELEASE,GUARD,GUARD_SHA256,
  sha,canonical,objSha,sourceId,bindingIdFor,openingFor,stagesFor} from '../../scripts/build-ap23j2-candidate.mjs';
import {buildJ2Schemas} from '../../scripts/build-ap23j2-schemas.mjs';

const built=await buildJ2Candidate(),{schemas}=await buildJ2Schemas();
const load=async path=>(await readFile(resolve(ROOT,path))).toString('utf8');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);
for(const schema of Object.values(schemas))ajv.addSchema(schema);
const newPaths=built.catalog.paths.slice(113),oldCollections=[['paths','pathId'],['qualificationPolicies','pathId'],['sources','sourceId'],['laws','lawId'],
  ['suspensionProfiles','suspensionProfileId'],['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId'],['preserved','path']];

test('actual isolated catalogue and manifest satisfy the four proposed schemas',()=>{
  for(const[name,value]of[['catalog',built.catalog],['localManifest',built.manifest]]){
    const validate=ajv.getSchema(schemas[name].$id);assert.equal(validate(value),true,JSON.stringify(validate.errors));
  }
});
test('written candidate equals a fresh deterministic build, including exact bytes and sidecar evidence',async()=>{
  for(const[path,bytes]of built.files)assert.equal(await load(OUTPUT+'/bundle/'+path),bytes,path);
  assert.equal(await load(OUTPUT+'/bundle/manifest.json'),built.manifestText);
  assert.equal(await load(OUTPUT+'/source-crosswalk.json'),built.crosswalkText);
  assert.equal(await load(OUTPUT+'/research-map.json'),built.researchMapText);
  assert.equal(await load(OUTPUT+'/candidate-integrity.json'),JSON.stringify(built.integrity,null,2)+'\n');
});
test('start guard is the bound immutable J2 guard, not a refreshed baseline',async()=>{
  const bytes=await readFile(resolve(ROOT,GUARD));assert.equal(sha(bytes),GUARD_SHA256);
  const guard=JSON.parse(bytes);assert.equal(Object.keys(guard.files).length,4413);
  assert.equal(guard.capturedBeforeTechnicalPlanning,true);assert.equal(guard.productCodeChangePermission,false);
});
test('accepted J1 remains research data and is not relabelled as active product evidence',()=>{
  assert.equal(built.research.paths.length,36);assert.equal(built.research.cases.length,673);
  for(const key of['runtimeActive','productTest','legalApproval'])assert.equal(built.research[key],false,key);
  assert.equal(built.catalog.contractStatus,'proposed');assert.equal(built.catalog.runtimeActive,false);
  assert.deepEqual(built.catalog.contractDecision,{id:'DEC-2026-039',status:'proposed',on:null});
  assert.equal(built.manifest.releaseStatus,'candidate');assert.equal(built.manifest.formatVersion,'14.0.0');
  assert.equal(built.manifest.compatibility.minimumConsumerFormatVersion,'14.0.0');
  for(const key of['productionActivation','sourceReleaseApproved','calendarExportEnabled'])assert.equal(built.manifest.extensions['steimer.local-reference'][key],false,key);
  for(const key of['runtimeReadable','productionActivation','calendarExportEnabled'])assert.equal(built.integrity[key],false,key);
});
for(const[key,id]of oldCollections)test('every old I3 '+key+' object is exactly preserved, not migrated in place',()=>{
  const rows=new Map(built.catalog[key].map(row=>[row[id],row]));
  assert.equal(rows.size,built.catalog[key].length);
  for(const row of built.old[key])assert.equal(canonical(rows.get(row[id])),canonical(row),row[id]);
});
test('113 old eligibility records retain exact hashes, source status and original physical targets',()=>{
  const current=new Map(built.catalog.releaseBinding.pathEligibility.map(row=>[row.pathId,row]));
  assert.equal(built.old.releaseBinding.pathEligibility.length,113);
  for(const row of built.old.releaseBinding.pathEligibility)assert.equal(canonical(current.get(row.pathId)),canonical(row));
  assert.ok(built.catalog.holidayBindings.slice(0,21).every(binding=>binding.physicalBaseline.releaseId===built.manifest0.releaseId));
  assert.ok(built.catalog.holidayBindings.slice(21).every(binding=>binding.physicalBaseline.releaseId===RELEASE));
});
test('exactly 36 new groups, three laws, six profiles, six uses and nineteen evidence sources are projected',()=>{
  assert.deepEqual(built.integrity.counts,{artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,changedBaselineArtifacts:1,newArtifacts:0,
    preservedPaths:113,newPaths:36,totalPaths:149,qualificationPolicies:149,laws:18,suspensionProfiles:35,holidayBindings:27,newSources:19,totalSources:85,
    physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,socialRules:44,socialBernBindings:50});
  assert.deepEqual(newPaths.map(path=>path.researchRef),built.research.paths.map(path=>path.id));
  assert.deepEqual(newPaths.map(path=>path.pathId),built.research.paths.map(path=>path.id.toLowerCase()));
});
test('43 nonadministrative files including all35 calendars are raw-byte identical to I3',async()=>{
  let count=0,calendarCount=0;
  for(const descriptor of built.manifest0.artifacts)if(descriptor.path!==ADMIN){
    const old=await readFile(resolve(ROOT,BASE,descriptor.path)),current=Buffer.from(built.files.get(descriptor.path));
    assert.deepEqual(current,old,descriptor.path);count++;if(descriptor.role==='calendar')calendarCount++;
  }
  assert.equal(count,43);assert.equal(calendarCount,35);assert.equal(sha(built.files.get(HOLIDAYS)),built.manifest0.artifacts.find(row=>row.path===HOLIDAYS).sha256);
});
test('new calendars are independent legal uses and never inherited procedural permission',()=>{
  const rows=built.catalog.holidayBindings.slice(21);assert.equal(rows.length,6);
  for(const row of rows){assert.equal(row.anchor,'authoritySeat');assert.equal(row.bindingVersion,'7.0.0');assert.equal(row.legalBinding.roleUnion,false);
    assert.equal(row.legalBinding.partyOrRepresentativeRequired,false);assert.equal(row.physicalReuse.permissionInheritance,'none');
    assert.equal(row.physicalReuse.sourceReleaseId,built.manifest0.releaseId);assert.equal(row.physicalBaseline.eligibilityMeaning,'physicalSourceOnlyNotFederalProcedurePermission');
    assert.deepEqual(row.physicalBaseline.references.map(ref=>ref.contentId).sort(),[row.physicalBaseline.calendarId,'ch-federal-calendar','ch-holiday-catalog'].sort());}
  assert.equal(new Set(rows.map(row=>row.physicalBaseline.calendarId)).size,3);
});
test('new source crosswalk preserves all research identities, exact primary bytes and roles',async()=>{
  assert.equal(built.crosswalk.length,19);assert.equal(new Set(built.crosswalk.map(row=>row.researchSourceId)).size,19);
  for(const row of built.crosswalk){
    assert.equal(row.catalogSourceId,sourceId(row.researchSourceId));assert.equal(row.archiveIDsUnchanged,true);assert.ok(row.roleLimit);
    assert.ok(!row.researchSourceId.endsWith('-TEXT'));assert.ok(!row.researchSourceId.includes('-SEARCH-'));
    assert.ok(!row.researchSourceId.includes('-DRAFT-'));assert.ok(!row.researchSourceId.endsWith('-META'));
    assert.equal(row.catalogSourceId.startsWith('JUD-'),row.kind==='judgment');
    for(const evidence of row.evidence){const bytes=await readFile(resolve(ROOT,evidence.path));assert.equal(sha(bytes),evidence.sha256);assert.equal(bytes.length,evidence.byteLength);}
  }
  assert.equal(built.crosswalk.find(row=>row.researchSourceId==='AP23J1-FR-ROF-2026-044').kind,'statute');
  assert.equal(built.crosswalk.find(row=>row.researchSourceId==='AP23J1-FR-MESSAGE-175-2009').kind,'officialMaterials');
  assert.match(built.crosswalk.find(row=>row.researchSourceId==='AP23J1-JU-ADM121-2017').researchRole,/Mirror/);
});
test('FR timelines bind exactly one applicable CPJA version per interval and constant current LJ',()=>{
  for(const path of newPaths.filter(path=>path.lawId==='cpja-fr')){
    assert.deepEqual(path.normTimeline.map(row=>row.interval),[{from:'2026-08-29',to:'2026-09-30'},{from:'2026-10-01',to:'2027-12-31'}]);
    for(const[index,segment]of path.normTimeline.entries()){
      const ids=segment.sourceRefs.map(ref=>ref.sourceId);assert.equal(ids.filter(id=>id.includes('-CPJA-')).length,1);
      assert.ok(ids.includes(sourceId(index===0?'AP23J1-FR-CPJA-7947':'AP23J1-FR-CPJA-8637')));
      assert.ok(ids.includes(sourceId('AP23J1-FR-LJ-7926-FR')));
      assert.ok(!ids.some(id=>id.includes('-ROF-')||id.includes('-BGER-')));
    }
  }
});
test('the single historic JU HTTP URL is preserved without source promotion or silent canonical-link replacement',()=>{
  const evidence=built.crosswalk.find(row=>row.researchSourceId==='AP23J1-JU-BGER2D55-2010');
  const source=built.sourceRows.find(row=>row.sourceId===evidence.catalogSourceId);
  assert.equal(source.url,'http://relevancy.bger.ch/cgi-bin/JumpCGI?id=01.03.2011_2D_55/2010');
  assert.equal(evidence.url,evidence.researchUrl);assert.equal(evidence.urlProjection,'noneOriginalResearchUrlPreserved');
  assert.equal(evidence.capturedCanonicalUrl,'https://mcp.opencaselaw.ch/entscheid/bger_2D_55_2010');
  assert.equal(evidence.researchRole,'supplementaryHistoricalJudgmentFullTextMirror');
  assert.equal(built.sourceRows.filter(row=>row.url.startsWith('http://')).length,1);
});
test('profile distinction remains FRtwo/three, GEnone/three and JUnone/three without hidden exceptions',()=>{
  const rows=built.catalog.suspensionProfiles.slice(29),lengths=Object.fromEntries(rows.map(row=>[row.suspensionProfileId,row.periods.length]));
  assert.deepEqual(lengths,{'fr-two':2,'fr-three':3,'ge-none':0,'ge-three':3,'ju-none':0,'ju-three':3});
  assert.ok(!rows.find(row=>row.suspensionProfileId==='fr-two').periods.some(row=>row.periodId.endsWith('summer')));
});
test('every new eligibility is a candidate with exact opening, profile, path, policy and holiday hashes',()=>{
  for(const path of newPaths){
    const entry=built.catalog.releaseBinding.pathEligibility.find(row=>row.pathId===path.pathId),policy=built.catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);
    const binding=built.catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId);
    assert.equal(entry.openingPolicySha256,objSha(path.openingPolicy));assert.equal(entry.pathSha256,objSha(path));
    assert.equal(entry.qualificationPolicySha256,objSha(policy));assert.equal(entry.holidayBindingSha256,objSha(binding));
    assert.equal(entry.suspensionSelectionSha256,objSha(path.suspensionSelection));assert.equal(entry.suspensionProfiles.length,1);
    const profile=built.catalog.suspensionProfiles.find(row=>row.suspensionProfileId===entry.suspensionProfiles[0].suspensionProfileId);
    assert.equal(entry.suspensionProfiles[0].sha256,objSha(profile));assert.equal(entry.status,'candidate');assert.deepEqual(entry.targetComponentRefs,[]);
    assert.equal(entry.sourceReviewRef,null);assert.equal(entry.referenceSuiteRef,null);
  }
});
test('GE has two current opening modes, while special FR/JU triggers perform no invented transformation',()=>{
  for(const research of built.research.paths){
    const path=newPaths.find(path=>path.researchRef===research.id);assert.equal(path.qualification.delivery,'qualifiedTriggerAccordingToOpeningPolicy');
    if(research.canton==='GE'){
      assert.equal(path.openingPolicy.kind,'geQualifiedOrOrdinaryPost');assert.equal(path.openingPolicy.factKey,'openingMode');
      assert.deepEqual(path.openingPolicy.allowedModes,['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']);
      assert.equal(path.openingPolicy.holidayBinding,'sameAsPath');assert.equal(path.openingPolicy.otherwise,'block');
    }else{assert.equal(path.openingPolicy.kind,'qualifiedCurrentTrigger');assert.equal(path.openingPolicy.transformation,'none');}
  }
  const kind=id=>newPaths.find(path=>path.researchRef===id).openingPolicy.triggerKind;
  assert.equal(kind('FR-NONTC-NACHFRIST-3'),'qualifiedExtensionRefusalAfterExpiredDeadline');
  assert.equal(kind('FR-TC-BEGRUENDUNG-30'),'qualifiedTcDispositifOpening');
  assert.equal(kind('JU-CONFIRMATION-REQUEST5-REVIEW'),'qualifiedOralDecisionOpening');
  assert.equal(kind('JU-MOTIVATION-REQUEST30-REVIEW'),'qualifiedFullyFavourableAbbreviatedOpening');
});
test('technical stage mapping never manufactures new stages or duplicates the36 accepted groups',()=>{
  for(const research of built.research.paths){const path=newPaths.find(path=>path.researchRef===research.id);
    assert.deepEqual(path.stages,stagesFor(research));assert.equal(path.holidayBindingId,bindingIdFor(research));
    assert.ok(path.stages.every(stage=>['administration','administrativeAppeal','court'].includes(stage)));}
  assert.deepEqual(newPaths.find(path=>path.researchRef==='GE-RECOURS-30').stages,['administrativeAppeal','court']);
  assert.deepEqual(newPaths.find(path=>path.researchRef==='JU-REVIEW-FINAL30').stages,['administrativeAppeal','court']);
});
test('research-map records original identity, current requirements and technical stages without persisting case facts',()=>{
  assert.equal(built.researchMap.paths.length,36);assert.equal(built.researchMap.caseFactsAreCurrentNotDefaults,true);
  for(const row of built.researchMap.paths){assert.ok(row.currentRequirements.length);assert.equal(row.pathId,row.researchId.toLowerCase());assert.equal(Object.hasOwn(row,'syntheticFacts'),false);}
});
test('new requirement policy contains only explicit scalar requirements, never synthetic fixture metadata',()=>{
  for(const policy of built.catalog.qualificationPolicies.slice(113)){
    assert.equal(policy.mode,'qualifiedDayProcedureV7');assert.equal(policy.openingChainPolicy,'notApplicable');assert.equal(policy.localHolidayPolicy,'notApplicable');
    assert.equal(new Set(policy.requirements.map(row=>row.key)).size,policy.requirements.length);
    for(const row of policy.requirements){assert.notEqual(Object.hasOwn(row,'value'),Object.hasOwn(row,'oneOf'));assert.equal(Object.hasOwn(row,'syntheticFixtureOnly'),false);}
  }
});
for(const[key,id]of oldCollections)test('preservation check rejects an in-memory change to old '+key,()=>{
  const changed=structuredClone(built);changed.catalog[key][0]={...changed.catalog[key][0],syntheticTamper:true};
  assert.throws(()=>assertJ2Preservation(changed),new RegExp('Changed I3 '+key));
});
test('preservation check rejects changing only an old eligibility record',()=>{
  const changed=structuredClone(built);changed.catalog.releaseBinding.pathEligibility[0].status='approved';assert.throws(()=>assertJ2Preservation(changed),/Changed I3 path eligibility/);
});
test('preservation check rejects old legal-use target rebinding inside the structural probe',()=>{
  const changed=structuredClone(built);changed.catalog.holidayBindings[0].physicalBaseline.releaseId=RELEASE;assert.throws(()=>assertJ2Preservation(changed),/Changed I3 holidayBindings/);
});
test('preservation check rejects modified nonadministrative payload bytes',()=>{
  const changed=structuredClone(built);changed.files.set(HOLIDAYS,changed.files.get(HOLIDAYS)+' ');assert.throws(()=>assertJ2Preservation(changed),/Changed nonadministrative bytes/);
});
test('candidate release cannot acquire a target approval or release reference during the structure probe',()=>{
  for(const[key,value]of[['status','approved'],['releaseId',RELEASE],['approval',{approvedBy:'synthetic'}],['sourceReviewRef',{id:'synthetic'}],['referenceSuiteRef',{id:'synthetic'}]]){
    const changed=structuredClone(built);changed.catalog.releaseBinding[key]=value;assert.throws(()=>assertJ2Preservation(changed),key);
  }
});
test('unknown research source cannot be projected by a naming heuristic',()=>assert.throws(()=>sourceId('J1-FR-INVENTED')));
test('unknown research stage cannot be replaced with the first or Bern stage',()=>assert.throws(()=>stagesFor({stage:'unknown'})));
test('an opening policy without relevant norm sources cannot be constructed',()=>assert.throws(()=>openingFor({id:'GE-RECOURS-30',canton:'GE'},[])));
