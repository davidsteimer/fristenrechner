// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {validateCompletionMetadata} from '../../scripts/finalize-ap23i2.mjs';
const boundaries=['runtimeActive','productIntegration','calendarExportEnabled','sourceReleaseApproved','productCodeChanged',
  'nativeSchemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed',
  'operatingChanges','i3Started','publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
function fixture(){
  const integrity={counts:{totalPaths:113,preservedPaths:79,newPaths:34},manifest:{path:'candidate/manifest.json',sha256:'a'.repeat(64),byteLength:30}};
  const saved={workPackage:'AP23I2',asOf:'2026-10-22',status:'passed-awaiting-technical-acceptance',head:'a'.repeat(40),
    professionalI1Acceptance:true,technicalI2Acceptance:false,contractDecision:{id:'DEC-2026-038',status:'proposed'},
    proposedFormats:{administrativeCatalog:'6.0.0',manifest:'13.0.0',minimumConsumer:'13.0.0',holidayCatalog:'2.0.0',calendar:'3.0.0'},
    counts:structuredClone(integrity.counts),referenceCases:249,
    referenceCounts:{datedResearchValue:110,unresolvedBoundaryProposed:16,qualificationBoundaryProposed:117,researchWindowBoundary:6},
    negativeCatalogMutations:61,negativeInputMutations:728,nativeReaderNegatives:5,oldNativeReferenceCalculations:79,forgedContextBlocks:237,
    governanceTests:300,protectedFilesVerified:2759,independentStatus:'passedIndependentStructuralAndResearchComparison',
    manifest:structuredClone(integrity.manifest),localLinksChecked:50,
    steps:['schemas','candidate','contract','independent','i1-archive','governance-tests','preservation','typecheck','whitespace'].map(id=>({id,exitCode:0})),
    bindings:Array.from({length:70},(_,i)=>({path:'proof/'+i,sha256:'a'.repeat(64),byteLength:1})),
    ...Object.fromEntries(boundaries.map(key=>[key,false])),
    nextGate:'Technical AP23I2 acceptance and explicit DEC-2026-038 decision, then separately commissioned AP23I3.'};
  return{saved,integrity};
}
test('valid pending-I2 proof is accepted, not relabelled as human approval',()=>{
  const f=fixture();assert.equal(validateCompletionMetadata(f.saved,f.integrity),true);
});
for(const key of boundaries)test('completion must preserve false boundary '+key,()=>{
  const f=fixture();f.saved[key]=true;assert.throws(()=>validateCompletionMetadata(f.saved,f.integrity));
});
for(const[key,value]of[['workPackage','AP23I3'],['status','accepted'],['professionalI1Acceptance',false],['technicalI2Acceptance',true],
  ['contractDecision',{id:'DEC-2026-038',status:'approved'}],['referenceCases',248],['oldNativeReferenceCalculations',78],
  ['forgedContextBlocks',0],['protectedFilesVerified',0],['nativeReaderNegatives',0],['negativeCatalogMutations',0],
  ['negativeInputMutations',0],['governanceTests',0],['independentStatus','skipped'],['localLinksChecked',0],['head',''],['nextGate','deploy']])
  test('completion rejects altered '+key,()=>{const f=fixture();f.saved[key]=value;assert.throws(()=>validateCompletionMetadata(f.saved,f.integrity));});
for(const[key,edit]of[
  ['formats',p=>p.proposedFormats.manifest='12.0.0'],['counts',p=>p.counts.newPaths=33],['manifest',p=>p.manifest.sha256='b'.repeat(64)],
  ['referenceCounts',p=>p.referenceCounts.datedResearchValue=109],['steps',p=>p.steps.pop()],['failedStep',p=>p.steps[0].exitCode=1],
  ['duplicateBinding',p=>p.bindings.push(p.bindings[0])],['unknownField',p=>p.formatDecision=true]
])test('completion rejects changed '+key,()=>{const f=fixture();edit(f.saved);assert.throws(()=>validateCompletionMetadata(f.saved,f.integrity));});
