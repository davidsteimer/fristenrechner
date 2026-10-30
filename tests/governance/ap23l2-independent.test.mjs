// SPDX-License-Identifier: AGPL-3.0-only
// Verify the actual independent report, its bound bytes and independent recalculation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const python=resolve(root,'.venv/bin/python');
const base='data/candidates/2026-10-27-ap23k3';
const output='outputs/ap23l2-candidate-2026-10-27';
const bundle=output+'/bundle';
const admin='administrative-procedures/ch-cantonal-administrative-procedures.json';
const reportPath='outputs/ap23l2-2026-10-27/independent-verification.json';
const read=path=>readFileSync(resolve(root,path));
const json=path=>JSON.parse(read(path));
const sha=value=>createHash('sha256').update(value).digest('hex');
const report=json(reportPath),manifest=json(bundle+'/manifest.json'),catalog=json(bundle+'/'+admin);
const oldManifest=json(base+'/manifest.json'),old=json(base+'/'+admin);
const suite=json('docs/fachrecht/ap23l1/referenzfaelle.json');
const qa=json(output+'/QA-AP23L2.json');
const index=(rows,key)=>{const map=new Map(rows.map(row=>[row[key],row]));assert.equal(map.size,rows.length);return map;};
const options={cwd:root,encoding:'utf8',maxBuffer:4*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}};
function bound(row){const bytes=read(row.path);assert.equal(sha(bytes),row.sha256,row.path);assert.equal(bytes.length,row.byteLength,row.path);}
function noExport(actual){
 assert.equal(actual.calendarExport,false);
 assert.equal(Object.hasOwn(actual,'end'),actual.outcome==='datedResearchValue');
}
function expected(actual,reference){for(const[key,value]of Object.entries(reference))assert.deepEqual(actual[key],value,key);}

test('L2 independent report is passed, byte-bound and explicitly nonoperative',()=>{
 assert.equal(report.workPackage,'AP23L2');assert.equal(report.status,'passed');
 for(const key of['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel',
  'annotationRemoval','implicitCaseFacts','runtimeActivation','sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[key],false,key);
 assert.deepEqual(report.contractDecision,{id:'DEC-2026-041',status:'proposed'});
 for(const key of['guard','manifest','catalog','suite','inputVocabularySchema'])bound(report.binding[key]);
 assert.equal(report.binding.guard.sha256,'6b8540b694a67a1fffd292486a7480728eca06f37f53f490f8df75fad2786bb1');
 bound(report.nodeComparison.evidence);
 assert.equal(qa.fixtureSha256,report.binding.suite.sha256);
 assert.equal(qa.manifestSha256,report.binding.manifest.sha256);
 assert.equal(qa.catalogSha256,report.binding.catalog.sha256);
});

test('L2 Python still independently verifies actual bytes and all original and Node synthetic fixtures',()=>{
 const fresh=JSON.parse(execFileSync(python,['-B','scripts/check_ap23l2_independent.py'],options));
 assert.equal(fresh.status,'passed');assert.equal(fresh.report,null);
 for(const[key,value]of Object.entries(report.counts))assert.deepEqual(fresh[key],value,key);
 assert.equal(fresh.originalReferences,83);assert.equal(fresh.independentProbes,697);
 assert.equal(fresh.physicalCalendarProbes,12);assert.equal(fresh.mutationSensitivities,3);
});

test('L2 independent report verifies all44 actual artifacts and43 byte-identical historical payloads',()=>{
 assert.equal(report.binding.artifactBytes.length,44);
 const descriptors=index(manifest.artifacts,'path'),previous=index(oldManifest.artifacts,'path');
 assert.deepEqual([...descriptors.keys()].sort(),[...previous.keys()].sort());
 let unchanged=0;
 for(const row of report.binding.artifactBytes){
  const descriptor=descriptors.get(row.path),bytes=read(bundle+'/'+row.path);
  assert.equal(sha(bytes),row.sha256);assert.equal(bytes.length,row.byteLength);
  assert.equal(descriptor.sha256,row.sha256);assert.equal(descriptor.byteLength,row.byteLength);
  assert.equal(row.preserved,row.path!==admin);
  if(row.preserved){assert.deepEqual(bytes,read(base+'/'+row.path));assert.deepEqual(descriptor,previous.get(row.path));unchanged++;}
 }
 assert.equal(unchanged,43);assert.equal(report.counts.unchangedNonAdministrativeArtifacts,43);
 assert.equal(report.binding.physicalCalendars,35);assert.equal(report.binding.holidayRules,499);
 assert.deepEqual(report.binding.administrativeOnlySupplementDates,['2026-11-11','2027-11-11']);
});

test('L2 independent report and actual candidate retain165 old semantic paths and their original bindings',()=>{
 const preserved=index(report.binding.preservedObjects,'field');
 for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['holidayBindings','holidayBindingId'],
  ['laws','lawId'],['sources','sourceId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId'],['preserved','path']]){
  const rows=index(catalog[field],key);assert.equal(preserved.get(field).unchangedObjects,old[field].length);
  for(const previous of old[field])assert.deepEqual(rows.get(previous[key]),previous,field+'/'+previous[key]);
 }
 const eligibility=index(catalog.releaseBinding.pathEligibility,'pathId');
 assert.equal(old.paths.length,165);assert.equal(report.counts.oldPathsPreserved,165);
 assert.equal(preserved.get('releaseBinding.pathEligibility').unchangedObjects,165);
 for(const previous of old.releaseBinding.pathEligibility)assert.deepEqual(eligibility.get(previous.pathId),previous);
});

test('L2 independent fixture results preserve all83 exact current fact maps and original expectations',()=>{
 const original=index(suite.cases,'id'),paths=index(catalog.paths.filter(row=>row.contractFamily==='qualifiedDayProcedureV9'),'researchRef');
 assert.equal(report.results.length,83);assert.equal(report.nodeComparison.matchedFixtures,83);
 const outcomes={};
 for(const row of report.results){
  const source=original.get(row.id),path=paths.get(source.path),law=catalog.laws.find(law=>law.lawId===path.lawId);
  assert.deepEqual(row.input,{path:path.pathId,pathRevision:path.revision,authoritySeatCanton:law.canton,
   trigger:source.trigger,days:source.days,facts:source.facts});
  assert.deepEqual(row.expected,source.expected);expected(row.actual,source.expected);noExport(row.actual);
  assert.equal(row.nodeSemanticComparison,'equal');outcomes[row.actual.outcome]=(outcomes[row.actual.outcome]??0)+1;
 }
 assert.deepEqual(outcomes,{datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2});
 assert.deepEqual(report.counts.referenceOutcomes,outcomes);
 assert.equal(new Set(report.results.map(row=>row.input.path)).size,31);
});

test('L2 independent report compares all20 Node probes without replacing their inputs or expectations',()=>{
 const node=index(qa.syntheticProbeResults,'id');
 const compared=report.nodeComparison.syntheticProbeComparisons;assert.equal(compared.length,20);assert.equal(node.size,20);
 for(const row of compared){
  const peer=node.get(row.id);assert.deepEqual(row.input,peer.input);expected(row.actual,peer.expected);noExport(row.actual);
  assert.equal(peer.actual.exportAllowed,false);assert.equal(row.nodeSemanticComparison,'equal');
  for(const key of['outcome','reason','legalOpening','ordinaryStart','firstCountedDay','nominalEnd','end','skippedDays','endShiftDays'])
   if(Object.hasOwn(row.actual,key)&&Object.hasOwn(peer.actual,key))assert.deepEqual(row.actual[key],peer.actual[key],row.id+'/'+key);
 }
});

test('L2 all54 positive Python traces agree with actual eligibility, calendar/profile and evaluated source segments',()=>{
 const peers=index(qa.results,'id'),eligibility=index(catalog.releaseBinding.pathEligibility,'pathId');
 const paths=index(catalog.paths,'pathId'),profiles=index(catalog.suspensionProfiles,'suspensionProfileId');
 let count=0;
 for(const row of report.results.filter(row=>row.actual.outcome==='datedResearchValue')){
  const peer=peers.get(row.id),provenance=peer.actual.provenance,entry=eligibility.get(row.input.path);
  const own=row.actual.independentProvenance,path=paths.get(row.input.path);
  for(const key of['pathId','pathSha256','qualificationPolicySha256','durationPolicySha256','openingPolicySha256',
   'holidayBindingId','holidayBindingSha256','calendarSelectionSha256','proceduralCalendarSupplementSha256','suspensionSelectionSha256'])
   assert.deepEqual(provenance[key],entry[key],row.id+'/'+key);
  assert.equal(peer.actual.exportAllowed,false);assert.equal(peer.actual.calendar,own.calendarId);
  assert.equal(provenance.baseCalendarId,own.calendarId);assert.equal(provenance.baseProjectionId,own.projectionId);
  assert.equal(provenance.suspensionProfileId,own.suspensionProfileId);assert.ok(profiles.has(own.suspensionProfileId));
  assert.equal(provenance.physicalInput,row.input.trigger);assert.equal(provenance.qualifiedOpening,row.actual.legalOpening);
  assert.deepEqual(peer.actual.temporalBindings,own.normSpans.map(span=>span.researchBindingId));
  assert.deepEqual(provenance.evaluatedNormSegments,path.normTimeline.filter(span=>peer.actual.temporalBindings.includes(span.researchBindingId)));
  count++;
 }
 assert.equal(count,54);assert.equal(report.nodeComparison.comparedFieldCounts.boundProvenance,54);
 for(const key of['end','endShiftDays','firstCountedDay','legalOpening','ordinaryStart','skippedDays'])
  assert.equal(report.nodeComparison.comparedFieldCounts[key],54,key);
 assert.equal(report.nodeComparison.comparedFieldCounts.outcome,83);
 assert.equal(report.nodeComparison.comparedFieldCounts.reason,29);
 assert.equal(report.nodeComparison.comparedFieldCounts.firstSuspendedShiftDate,2);
});

test('L2 independent697 current-fact probes cover every new requirement and never enable export',()=>{
 const rows=index(report.independentProbeResults,'id');assert.equal(rows.size,697);
 for(const row of rows.values()){expected(row.actual,row.expected);noExport(row.actual);}
 const newPaths=catalog.paths.filter(row=>row.contractFamily==='qualifiedDayProcedureV9');
 const policies=index(catalog.qualificationPolicies,'pathId');
 let requirements=0;
 for(const path of newPaths)for(const req of policies.get(path.pathId).requirements){
  for(const suffix of['missing','wrong']){
   const row=rows.get('PY-L2-REQ-'+path.pathId+'-'+req.key+'-'+suffix);assert.ok(row);
   assert.equal(row.actual.outcome,'qualificationBoundaryProposed');assert.equal(row.actual.reason,req.reason);
  }
  requirements++;
 }
 assert.equal(requirements,336);
 for(const id of['PY-L2-ORDER-ONE-DAY-NOT-TEN','PY-L2-ORDER-TEN-MAX','PY-L2-ORDER-ELEVEN-REFUSED',
  'PY-L2-NOTICE-VALUE-MISSING','PY-L2-NOTICE-DAYS-MISMATCH','PY-L2-NOTICE30-NOT-LONGER',
  'PY-L2-SZ-JAN7-PAUSED','PY-L2-SZ-JAN7-EXEMPT','PY-L2-MARTINSTAG-2026','PY-L2-MARTINSTAG-2027',
  'PY-L2-QUALIFIED-NO-REBASE','PY-L2-TRACKING-SATURDAY','PY-L2-TRACKING-MAURITIUS','PY-L2-TRACKING-DURING-RECESS'])assert.ok(rows.has(id),id);
});

test('L2 twelve physical calendar contrasts distinguish raw holidays from the administrative Martinstag supplement',()=>{
 const rows=index(report.physicalCalendarProbeResults,'id');assert.equal(rows.size,12);
 for(const row of rows.values())assert.equal(row.actualRuleIds.length>0,row.expectedPhysicalHoliday,row.id);
 assert.equal(rows.get('sz-base-not-martin-2026').expectedPhysicalHoliday,false);
 assert.equal(rows.get('sz-base-not-martin-2027').expectedPhysicalHoliday,false);
 assert.equal(rows.get('ai-stephen-2026-conditional-omission').expectedPhysicalHoliday,false);
 assert.equal(rows.get('ai-stephen-2027-present').expectedPhysicalHoliday,true);
 assert.equal(rows.get('ai-outer-not-mauritius-contrast-only').comparisonOnlyNotAdditionalPositiveBinding,true);
 assert.equal(rows.get('ai-inner-mauritius').expectedPhysicalHoliday,true);
});

test('L2 independent arithmetic is sensitive to three real calendar/recess semantic changes',()=>{
 assert.deepEqual(report.mutationSensitivity.map(row=>row.id),[
  'SZ-JAN2-INSTEAD-OF-JAN7','SZ-END-SUPPLEMENT-REMOVED','AI-COURT-SUSPENSION-REMOVED']);
 for(const row of report.mutationSensitivity){assert.equal(row.differenceDetected,true);assert.notDeepEqual(row.original,row.mutated);}
});

test('L2 binds31 actual source evidence files and only17 operative source rows without source promotion',()=>{
 const crosswalk=json(output+'/source-crosswalk.json');
 assert.equal(crosswalk.sourceRows.length,31);assert.equal(report.binding.sourceEvidence.length,31);
 assert.equal(report.binding.operativeSourceCount,17);
 const operative=crosswalk.sourceRows.filter(row=>row.catalogSourceId!==null);assert.equal(operative.length,17);
 assert.equal(operative.filter(row=>row.canton==='AI').length,8);assert.equal(operative.filter(row=>row.canton==='SZ').length,9);
 const sourceIds=new Set(catalog.sources.map(row=>row.sourceId));
 for(const row of crosswalk.sourceRows){
  assert.equal(row.sourcePromotion,false);
  if(row.catalogSourceId)assert.ok(sourceIds.has(row.catalogSourceId));else assert.equal(row.kind,'evidenceOnly');
  for(const item of row.evidence)bound(item);
 }
 for(const row of report.binding.sourceEvidence)bound(row);
});

test('L2 Python comparison rejects changed arithmetic, fixture facts, export or bound provenance in peer evidence',()=>{
 const code=`
import copy
import scripts.check_ap23l2_independent as independent
runner,suite,binding=independent.byte_and_semantic_checks()
rows=[]
for case in suite['cases']:
    item=runner.input_for(case)
    rows.append({'id':case['id'],'input':item,'expected':case['expected'],'actual':runner.calculate(item)})
path=independent.OUT/'QA-AP23L2.json'
original_load=independent.load
peer=original_load(path)
for field in ['arithmetic','facts','export','provenance','sourceSegment']:
    bad=copy.deepcopy(peer)
    row=next(row for row in bad['results'] if row['id']=='L1-AI-R01')
    if field=='arithmetic': row['actual']['end']='2026-10-13'
    elif field=='facts': row['input']['facts']['authorityRegion']='unknown'
    elif field=='export': row['actual']['exportAllowed']=True
    elif field=='provenance': row['actual']['provenance']['openingPolicySha256']='0'*64
    else: row['actual']['provenance']['evaluatedNormSegments'][0]['sourceRefs'][0]['sourceId']='invented'
    independent.load=lambda candidate: bad if candidate==path else original_load(candidate)
    try:
        independent.compare_node(runner,suite,copy.deepcopy(rows),path)
    except AssertionError:
        continue
    raise AssertionError('Tampered peer comparison accepted: '+field)
independent.load=original_load
print('five peer mutations rejected')
`;
 assert.equal(execFileSync(python,['-B','-c',code],options).trim(),'five peer mutations rejected');
});
