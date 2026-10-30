// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateMetadata,governanceCount,validateReports,flags,formats,outcomes} from '../../scripts/finalize-ap23m2.mjs';
const root=new URL('../../',import.meta.url),read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const integrity=await read('outputs/ap23m2-candidate-2026-10-28/candidate-integrity.json');
const sample=()=>({workPackage:'AP23M2',asOf:'2026-10-28',status:'passed-awaiting-technical-acceptance',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
 professionalM1Acceptance:true,technicalM2Acceptance:false,contractDecision:{id:'DEC-2026-042',status:'proposed'},proposedFormats:structuredClone(formats),counts:structuredClone(integrity.counts),
 consumerReferenceCases:109,consumerOutcomeCounts:structuredClone(outcomes),syntheticProbes:33,missingCurrentFactRejections:560,negativeCatalogMutations:23,
 independentReferences:109,independentAdditionalProbes:1239,independentPhysicalCalendarProbes:22,independentMutationSensitivities:3,independentStatus:'passed',
 oldNativeReferenceCalculations:196,nativeReaderNegatives:12,newNativeNEVDVSCalculations:0,protectedFilesVerified:11414,vdArticle81NumericLegalityInference:false,
 neGateStatus:'fresh-official-evidence-no-new-relevant-commencement-observed',governanceTests:400,manifest:integrity.manifest,localLinksChecked:1,
 steps:['schemas','candidate','contract','independent','native','m1-archive','governance-tests','preservation','typecheck','whitespace'].map(id=>({id,exitCode:0})),
 bindings:Array.from({length:101},(_,i)=>({path:'synthetic-only-'+i,byteLength:1,sha256:'0'.repeat(64)})),...Object.fromEntries(flags.map(flag=>[flag,false])),
 nextGate:'Technical AP23M2 acceptance and explicit DEC-2026-042 decision, then separately commissioned AP23M3.'});
test('Closed synthetic metadata shape passes without conferring acceptance',()=>assert.equal(validateMetadata(sample()),true));
for(const flag of flags)test('Handoff cannot invent '+flag,()=>{const v=sample();v[flag]=true;assert.throws(()=>validateMetadata(v));});
for(const key of ['consumerReferenceCases','syntheticProbes','missingCurrentFactRejections','negativeCatalogMutations','independentReferences','independentAdditionalProbes','independentPhysicalCalendarProbes','independentMutationSensitivities','oldNativeReferenceCalculations','nativeReaderNegatives','newNativeNEVDVSCalculations','protectedFilesVerified'])test('Actual count cannot change '+key,()=>{const v=sample();v[key]++;assert.throws(()=>validateMetadata(v));});
for(const key of ['administrativeCatalog','manifest','minimumConsumer','defaults'])test('No silent format migration '+key,()=>{const v=sample();v.proposedFormats[key]='changed';assert.throws(()=>validateMetadata(v));});
test('Technical acceptance and decision stay open',()=>{
 const a=sample();a.technicalM2Acceptance=true;assert.throws(()=>validateMetadata(a));
 const b=sample();b.contractDecision.status='approved';assert.throws(()=>validateMetadata(b));
 const c=sample();c.professionalM1Acceptance=false;assert.throws(()=>validateMetadata(c));
});
test('No additional handoff fields, duplicated evidence or missing steps',()=>{
 const a=sample();a.exportAllowed=true;assert.throws(()=>validateMetadata(a));
 const b=sample();b.bindings[1]=b.bindings[0];assert.throws(()=>validateMetadata(b));
 const c=sample();c.steps.pop();assert.throws(()=>validateMetadata(c));
 const d=sample();d.steps[0].exitCode=1;assert.throws(()=>validateMetadata(d));
});
test('Waadt numeric Art81 legal inference is not claimed',()=>{const v=sample();v.vdArticle81NumericLegalityInference=true;assert.throws(()=>validateMetadata(v));});
test('Governance counts reject omitted skipped failed and cancelled tests',()=>{
 const log='# tests 400\n# pass 400\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';assert.equal(governanceCount(log),400);
 for(const key of ['fail','cancelled','skipped','todo'])assert.throws(()=>governanceCount(log.replace('# '+key+' 0','# '+key+' 1')));
 assert.throws(()=>governanceCount(log.replace('# pass 400','# pass 399')));assert.throws(()=>governanceCount(''));
});
test('Actual QA independent native and NE gate reports are mutually bound',async()=>{await validateReports();});
