// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic handoff metadata only. This test neither finalizes nor grants approval.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {completionFlags,validateCompletionMetadata,governanceCount} from '../../scripts/finalize-ap23l2.mjs';
const integrity=JSON.parse(readFileSync(new URL('../../outputs/ap23l2-candidate-2026-10-27/candidate-integrity.json',import.meta.url),'utf8'));
const counters={consumerReferenceCases:83,syntheticProbes:20,missingCurrentFactRejections:336,negativeCatalogMutations:22,
 independentReferences:83,independentAdditionalProbes:697,independentPhysicalCalendarProbes:12,independentMutationSensitivities:3,
 oldNativeReferenceCalculations:165,nativeReaderNegatives:12,newNativeAISZCalculations:0,protectedFilesVerified:9048};
const steps=['schemas','candidate','contract','independent','native','l1-archive','governance-tests','preservation','typecheck','whitespace'];
function fixture(){return{
 workPackage:'AP23L2',asOf:'2026-10-27',status:'passed-awaiting-technical-acceptance',head:'a'.repeat(40),
 professionalL1Acceptance:true,technicalL2Acceptance:false,contractDecision:{id:'DEC-2026-041',status:'proposed'},
 proposedFormats:{administrativeCatalog:'9.0.0',manifest:'16.0.0',minimumConsumer:'16.0.0',profiles:'1.0.0',holidayCatalog:'2.0.0',
  calendar:'3.0.0',specialRegimeCatalog:'3.0.0',socialProcedureCatalog:'2.0.0',defaults:5},
 counts:structuredClone(integrity.counts),...counters,
 consumerOutcomeCounts:{datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2},
 independentStatus:'passed',governanceTests:350,manifest:structuredClone(integrity.manifest),localLinksChecked:1,
 steps:steps.map(id=>({id,exitCode:0})),
 // Deliberately synthetic names. Real file bytes belong to finalize(), not this pure validator fixture.
 bindings:Array.from({length:91},(_,i)=>({path:'synthetic-evidence/'+i+'.json',byteLength:1,sha256:'b'.repeat(64)})),
 ...Object.fromEntries(completionFlags.map(flag=>[flag,false])),
 nextGate:'Technical AP23L2 acceptance and explicit DEC-2026-041 decision, then separately commissioned AP23L3.'
};}
function rejected(change,changeIntegrity){const saved=fixture(),bound=structuredClone(integrity);change(saved);if(changeIntegrity)changeIntegrity(bound);assert.throws(()=>validateCompletionMetadata(saved,bound));}

test('complete synthetic local handoff metadata matches the actual isolated candidate integrity',()=>{
 const saved=fixture(),before=structuredClone(saved);assert.equal(validateCompletionMetadata(saved,integrity),true);assert.deepEqual(saved,before);
 assert.equal(saved.technicalL2Acceptance,false);assert.equal(saved.contractDecision.status,'proposed');assert.equal(saved.newNativeAISZCalculations,0);
});
for(const flag of completionFlags)test('handoff cannot promote closed permission flag '+flag,()=>rejected(saved=>{saved[flag]=true;}));
test('L1 professional acceptance does not imply L2 acceptance',()=>{
 rejected(saved=>{saved.professionalL1Acceptance=false;});rejected(saved=>{saved.technicalL2Acceptance=true;});
});
test('another work package is not this handoff',()=>rejected(saved=>{saved.workPackage='AP23L3';}));
test('another evidence date is not this handoff',()=>rejected(saved=>{saved.asOf='2026-10-28';}));
test('passed checks cannot relabel technical acceptance as already granted',()=>{
 for(const status of['passed','approved','released','passed-technical-acceptance'])rejected(saved=>{saved.status=status;});
});
test('contract decision remains the exact proposed DEC-2026-041',()=>{
 rejected(saved=>{saved.contractDecision.status='approved';});rejected(saved=>{saved.contractDecision.id='DEC-2026-040';});
 rejected(saved=>{saved.contractDecision.extra='synthetic permission';});
});
test('each proposed component format and the exact format inventory remain closed',()=>{
 for(const key of Object.keys(fixture().proposedFormats))rejected(saved=>{saved.proposedFormats[key]=key==='defaults'?6:'99.0.0';});
 rejected(saved=>{delete saved.proposedFormats.minimumConsumer;});rejected(saved=>{saved.proposedFormats.newConsumer='16.0.0';});
});
test('candidate counts cannot change even if an altered integrity object repeats them',()=>{
 for(const key of Object.keys(integrity.counts)){
  rejected(saved=>{saved.counts[key]++;});
  if(['totalPaths','preservedPaths','newPaths','artifacts','totalFilesIncludingManifest','unchangedRawArtifacts','physicalCalendars','totalHolidayRules',
   'newHolidayRules','proceduralSupplementDates','newSources','belegFiles','socialRules','socialBernBindings'].includes(key)){
   rejected(saved=>{saved.counts[key]++;},bound=>{bound.counts[key]++;});
  }
 }
 rejected(saved=>{delete saved.counts.newPaths;});
});
test('manifest metadata must equal the actual candidate integrity binding',()=>{
 for(const[key,value]of[['path','synthetic-other/manifest.json'],['sha256','0'.repeat(64)],['byteLength',1]])rejected(saved=>{saved.manifest[key]=value;});
 rejected(saved=>{saved.manifest.extra=true;});
});
test('consumer outcome totals cannot be merged, dropped or relabelled',()=>{
 for(const key of Object.keys(fixture().consumerOutcomeCounts))rejected(saved=>{saved.consumerOutcomeCounts[key]++;});
 rejected(saved=>{delete saved.consumerOutcomeCounts.unresolvedBoundaryProposed;});rejected(saved=>{saved.consumerOutcomeCounts.approved=54;});
});
test('every reference, probe, preservation and native-negative counter is fixed',()=>{
 for(const key of Object.keys(counters))rejected(saved=>{saved[key]++;});rejected(saved=>{saved.independentStatus='pending';});
});
test('governance and local-link counters must be meaningful safe integers',()=>{
 for(const value of[349,0,-1,350.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'350'])rejected(saved=>{saved.governanceTests=value;});
 for(const value of[0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'1'])rejected(saved=>{saved.localLinksChecked=value;});
 const higher=fixture();higher.governanceTests=500;higher.localLinksChecked=100;assert.equal(validateCompletionMetadata(higher,integrity),true);
});
test('the bound Git head must be a complete hexadecimal commit identifier',()=>{
 for(const value of['','a'.repeat(39),'a'.repeat(41),'z'.repeat(40),'A'.repeat(40),'main'])rejected(saved=>{saved.head=value;});
});
test('handoff inventory requires more than 90 distinct evidence paths',()=>{
 rejected(saved=>{saved.bindings=saved.bindings.slice(0,90);});rejected(saved=>{saved.bindings=[];});
 rejected(saved=>{saved.bindings[1].path=saved.bindings[0].path;});rejected(saved=>{saved.bindings=null;});
});
test('verification step sequence and successful exit codes cannot change',()=>{
 rejected(saved=>{saved.steps.reverse();});rejected(saved=>{saved.steps.pop();});
 rejected(saved=>{saved.steps.push({id:'deploy',exitCode:0});});
 for(const id of steps)rejected(saved=>{saved.steps.find(step=>step.id===id).exitCode=1;});
});
test('the next gate requires technical acceptance and a separate explicit L3 commission',()=>{
 rejected(saved=>{saved.nextGate='Start AP23L3 now';});rejected(saved=>{saved.nextGate='Technical AP23L2 acceptance then automatic L3';});
});
test('handoff fields are closed against extra claims and missing evidence categories',()=>{
 rejected(saved=>{saved.deployable=true;});rejected(saved=>{saved.humanApproval=true;});
 for(const key of Object.keys(fixture()))rejected(saved=>{delete saved[key];});
});
test('complete clean TAP counters yield the actual governance test count',()=>{
 const tap='# tests 350\n# pass 350\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';assert.equal(governanceCount(tap),350);
 assert.equal(governanceCount(tap.replaceAll('350','415')),415);
});
test('TAP totals cannot hide failures, skips, todos, cancellation or a short suite',()=>{
 const tap='# tests 350\n# pass 350\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
 for(const key of['fail','cancelled','skipped','todo'])assert.throws(()=>governanceCount(tap.replace('# '+key+' 0','# '+key+' 1')));
 assert.throws(()=>governanceCount(tap.replace('# pass 350','# pass 349')));
 assert.throws(()=>governanceCount(tap.replaceAll('350','349')));
 assert.throws(()=>governanceCount(tap.replace('# skipped 0\n','')));
});
