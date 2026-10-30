// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {validateCompletionMetadata} from '../../scripts/finalize-ap23k2.mjs';
const integrity=JSON.parse(await readFile(new URL('../../outputs/ap23k2-candidate-2026-10-27/candidate-integrity.json',import.meta.url)));
const flags=['runtimeActive','productIntegration','calendarExportEnabled','sourceReleaseApproved','productCodeChanged','nativeSchemasChanged',
  'acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges',
  'k3Started','formatDecision','publicProjectStatusUpdated','publicTechnicalFindingsPublished'];
function sample(){return {
  workPackage:'AP23K2',asOf:'2026-10-27',status:'passed-awaiting-technical-acceptance',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
  professionalK1Acceptance:true,technicalK2Acceptance:false,contractDecision:{id:'DEC-2026-040',status:'proposed'},
  proposedFormats:{administrativeCatalog:'8.0.0',manifest:'15.0.0',minimumConsumer:'15.0.0',profiles:'1.0.0',holidayCatalog:'2.0.0',
    calendar:'3.0.0',specialRegimeCatalog:'3.0.0',socialProcedureCatalog:'2.0.0',defaults:5},
  counts:structuredClone(integrity.counts),originalK1Cases:67,consumerReferenceCases:65,diagnosticWorldOracleCases:2,
  consumerOutcomeCounts:{datedResearchValue:40,qualificationBoundaryProposed:18,unresolvedBoundaryProposed:2,researchWindowBoundary:5},
  syntheticProbes:46,negativeCatalogMutations:19,negativeInputMutations:109,nativeReaderNegatives:2,oldNativeReferenceCalculations:149,
  governanceTests:250,protectedFilesVerified:6612,independentStatus:'passedIndependentStructuralAndResearchComparison',manifest:structuredClone(integrity.manifest),
  localLinksChecked:1,steps:['schemas','candidate','contract','independent','k1-archive','governance-tests','preservation','typecheck','whitespace'].map(id=>({id,exitCode:0})),
  bindings:Array.from({length:91},(_,n)=>({path:'metadata-unit-test-only-'+n,sha256:'a'.repeat(64),byteLength:1})),
  ...Object.fromEntries(flags.map(flag=>[flag,false])),
  nextGate:'Technical AP23K2 acceptance and explicit DEC-2026-040 decision, then separately commissioned AP23K3.'
};}
test('closed K2 handoff metadata accepts a technically pending synthetic record',()=>assert.equal(validateCompletionMetadata(sample(),integrity),true));
for(const flag of flags)test('completion cannot claim '+flag,()=>{const saved=sample();saved[flag]=true;assert.throws(()=>validateCompletionMetadata(saved,integrity));});
for(const [id,mutate] of [
  ['technical acceptance inferred',s=>s.technicalK2Acceptance=true],['human K1 acceptance removed',s=>s.professionalK1Acceptance=false],
  ['decision pre-approved',s=>s.contractDecision.status='approved'],['foreign decision',s=>s.contractDecision.id='DEC-2026-039'],
  ['catalog fallback to V7',s=>s.proposedFormats.administrativeCatalog='7.0.0'],['minimum consumer old',s=>s.proposedFormats.minimumConsumer='14.0.0'],
  ['defaults facts migration invented',s=>s.proposedFormats.defaults=6],['67 cases claimed consumer',s=>s.consumerReferenceCases=67],
  ['diagnostic worlds dropped',s=>s.diagnosticWorldOracleCases=0],['source cases dropped',s=>s.originalK1Cases=65],
  ['positive result inflation',s=>s.consumerOutcomeCounts.datedResearchValue=42],['old references lost',s=>s.oldNativeReferenceCalculations=148],
  ['native reader rejects lost',s=>s.nativeReaderNegatives=0],['input mutation checks lost',s=>s.negativeInputMutations=0],
  ['catalog mutation checks lost',s=>s.negativeCatalogMutations=0],['synthetic checks lost',s=>s.syntheticProbes=0],
  ['baseline incomplete',s=>s.protectedFilesVerified=6611],['independent comparison absent',s=>s.independentStatus='unverified'],
  ['links unverified',s=>s.localLinksChecked=0],['test evidence absent',s=>s.governanceTests=0],
  ['failed phase',s=>s.steps[2].exitCode=1],['phase omitted',s=>s.steps.pop()],['phase reordered',s=>s.steps.reverse()],
  ['duplicate binding',s=>s.bindings[1]=structuredClone(s.bindings[0])],['incomplete binding inventory',s=>s.bindings=[]],
  ['unknown metadata field',s=>s.extraPermission=true],['changed declared next gate',s=>s.nextGate='Start AP23K3'],
  ['wrong path count',s=>s.counts.totalPaths=166],['extra physical holiday rule',s=>s.counts.newHolidayRules=1],
  ['extra annual closure',s=>s.counts.annualOfficeClosureDays=14],['regional world made certain',s=>s.counts.uncertainClosureDays=0],
  ['social binding expansion',s=>s.counts.socialBernBindings=51],['nonadministrative bytes changed',s=>s.counts.unchangedRawArtifacts=42]
])test('completion rejects '+id,()=>{const saved=sample();mutate(saved);assert.throws(()=>validateCompletionMetadata(saved,integrity));});
