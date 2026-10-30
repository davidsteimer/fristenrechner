// SPDX-License-Identifier: AGPL-3.0-only
// Bind the independent standard-library result to actual candidate and fixture bytes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>readFileSync(resolve(root,p));
const json=p=>JSON.parse(read(p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const output='outputs/ap23m2-candidate-2026-10-28',bundle=output+'/bundle';
const base='data/candidates/2026-10-27-ap23l3';
const admin='administrative-procedures/ch-cantonal-administrative-procedures.json';
const reportPath='outputs/ap23m2-2026-10-28/independent-verification.json';
const report=json(reportPath),manifest=json(bundle+'/manifest.json'),catalog=json(bundle+'/'+admin);
const suite=json('docs/fachrecht/ap23m1/referenzfaelle.json');
const qa=json(output+'/QA-AP23M2.json');
const old=json(base+'/'+admin),oldManifest=json(base+'/manifest.json');
const index=(rows,key)=>{const m=new Map(rows.map(r=>[r[key],r]));assert.equal(m.size,rows.length);return m;};
function bound(row){const b=read(row.path);assert.equal(sha(b),row.sha256,row.path);assert.equal(b.length,row.byteLength,row.path);}
function expected(actual,value){for(const[k,v]of Object.entries(value))assert.deepEqual(actual[k],v,k);}
function noExport(value){assert.equal(value.calendarExport,false);assert.equal(Object.hasOwn(value,'end'),value.outcome==='datedResearchValue');}

test('M2 independent report binds actual evidence and remains proposed and nonoperative',()=>{
 assert.equal(report.workPackage,'AP23M2');assert.equal(report.status,'passed');
 assert.deepEqual(report.contractDecision,{id:'DEC-2026-042',status:'proposed'});
 for(const k of['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel',
  'annotationRemoval','implicitCaseFacts','runtimeActivation','sourceReleaseApproved','calendarExportEnabled',
  'vdArticle81NumericLegalityInference'])assert.equal(report[k],false,k);
 for(const k of['guard','manifest','catalog','suite','inputVocabularySchema','neFreshnessGate'])bound(report.binding[k]);
 bound(report.nodeComparison.evidence);
 assert.equal(report.binding.guard.sha256,'af68d4b6c0fb33d731c50f99b3ca3c63bc1c573d5635d259798a5ed28953c3b1');
 assert.equal(qa.fixtureSha256,report.binding.suite.sha256);
 assert.equal(qa.manifestSha256,report.binding.manifest.sha256);
 assert.equal(qa.catalogSha256,report.binding.catalog.sha256);
});

test('M2 Python fresh rerun independently reproduces all original and synthetic results',()=>{
 const fresh=JSON.parse(execFileSync(resolve(root,'.venv/bin/python'),['-B','scripts/check_ap23m2_independent.py'],
  {cwd:root,encoding:'utf8',maxBuffer:4*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}));
 assert.equal(fresh.status,'passed');assert.equal(fresh.report,null);
 for(const[k,v]of Object.entries(report.counts))assert.deepEqual(fresh[k],v,k);
 assert.equal(fresh.originalReferences,109);assert.equal(fresh.positivePaths,49);
 assert.equal(fresh.independentProbes,1239);assert.equal(fresh.physicalCalendarProbes,22);
 assert.equal(fresh.physicalCalendarYearEnumerations,70);
 assert.equal(fresh.mutationSensitivities,3);
});

test('M2 has44 byte-bound actual artifacts,43 unchanged historical payloads and35 calendars',()=>{
 assert.equal(report.binding.artifactBytes.length,44);
 const descriptors=index(manifest.artifacts,'path'),previous=index(oldManifest.artifacts,'path');
 assert.deepEqual([...descriptors.keys()].sort(),[...previous.keys()].sort());
 let unchanged=0;
 for(const row of report.binding.artifactBytes){
  const d=descriptors.get(row.path),b=read(bundle+'/'+row.path);
  assert.equal(sha(b),row.sha256);assert.equal(b.length,row.byteLength);
  assert.equal(d.sha256,row.sha256);assert.equal(d.byteLength,row.byteLength);
  assert.equal(row.preserved,row.path!==admin);
  if(row.preserved){assert.deepEqual(b,read(base+'/'+row.path));assert.deepEqual(d,previous.get(row.path));unchanged++;}
 }
 assert.equal(unchanged,43);assert.equal(report.binding.physicalCalendars,35);
 assert.equal(report.binding.holidayRules,499);
 assert.equal(report.physicalCalendarInventories.length,70);
 const years=new Map();
 for(const row of report.physicalCalendarInventories){
  assert.equal(row.onlyWithinActualCalendarAndRuleValidity,true);
  assert.deepEqual(row.holidayDates,[...new Set(row.holidayDates)].sort());
  assert.ok(row.holidayDates.every(d=>d.startsWith(row.year+'-')));
  years.set(row.calendarId,[...(years.get(row.calendarId)??[]),row.year]);
 }
 assert.equal(years.size,35);for(const list of years.values())assert.deepEqual(list,[2026,2027]);
 assert.equal(manifest.formatVersion,'17.0.0');assert.equal(catalog.formatVersion,'10.0.0');
});

test('M2 preserves196 historical path/policy/eligibility meanings without semantic rewrites',()=>{
 const preserved=index(report.binding.preservedObjects,'field');
 for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['holidayBindings','holidayBindingId'],
  ['laws','lawId'],['sources','sourceId'],['suspensionProfiles','suspensionProfileId'],
  ['excludedPaths','exclusionId'],['preserved','path']]){
  const rows=index(catalog[field],key);assert.equal(preserved.get(field).unchangedObjects,old[field].length);
  for(const before of old[field])assert.deepEqual(rows.get(before[key]),before,field+'/'+before[key]);
 }
 const eligibility=index(catalog.releaseBinding.pathEligibility,'pathId');
 for(const row of old.releaseBinding.pathEligibility)assert.deepEqual(eligibility.get(row.pathId),row);
 assert.equal(old.paths.length,196);assert.equal(catalog.paths.length,245);
 assert.equal(preserved.get('releaseBinding.pathEligibility').unchangedObjects,196);
});

test('M2 original109 fixtures retain every fact and static expectation, with49 positive groups',()=>{
 const original=index(suite.cases,'id');
 const paths=index(catalog.paths.filter(p=>p.contractFamily==='qualifiedDayProcedureV10'),'researchRef');
 assert.equal(report.results.length,109);assert.equal(report.nodeComparison.matchedFixtures,109);
 const outcomes={},positive=new Set();
 for(const row of report.results){
  const c=original.get(row.id),p=paths.get(c.path),law=catalog.laws.find(l=>l.lawId===p.lawId);
  assert.deepEqual(row.input,{path:p.pathId,pathRevision:p.revision,authoritySeatCanton:law.canton,
   trigger:c.trigger,days:c.days,facts:c.facts});
  assert.deepEqual(row.expected,c.expected);expected(row.actual,c.expected);noExport(row.actual);
  assert.equal(row.nodeSemanticComparison,'equal');outcomes[row.actual.outcome]=(outcomes[row.actual.outcome]??0)+1;
  if(row.actual.outcome==='datedResearchValue')positive.add(row.input.path);
 }
 assert.deepEqual(outcomes,{datedResearchValue:73,qualificationBoundaryProposed:27,unresolvedBoundaryProposed:3,researchWindowBoundary:6});
 assert.deepEqual(report.counts.referenceOutcomes,outcomes);assert.equal(positive.size,49);
});

test('M2 all Node synthetic inputs are frozen snapshots and independently agree mathematically',()=>{
 const peers=index(qa.syntheticProbeResults,'id');
 assert.equal(peers.size,33);assert.equal(report.nodeComparison.syntheticProbeComparisons.length,33);
 for(const row of report.nodeComparison.syntheticProbeComparisons){
  const peer=peers.get(row.id);assert.deepEqual(row.input,peer.input);assert.deepEqual(row.expected,peer.expected);
  expected(row.actual,row.expected);noExport(row.actual);assert.equal(row.nodeSemanticComparison,'equal');
  for(const key of['outcome','reason','legalOpening','ordinaryStart','firstCountedDay','nominalEnd','end','skippedDays','endShiftDays'])
   if(Object.hasOwn(row.actual,key))assert.deepEqual(row.actual[key],peer.actual[key],row.id+'/'+key);
 }
 const order=peers.get('vd-current-qualified-order-not-global-thirty-cap');
 assert.equal(order.input.facts.orderLegalScope,'otherValidLpaInputOrArticle81Within30OrGrantedExtension');
 assert.equal(order.input.days,40);assert.equal(order.actual.end,'2026-11-11');
 assert.equal(report.nodeComparison.nodeMissingFactComparisons.length,560);
});

test('M2 independent current-fact probes are systematic and never fill missing legal facts',()=>{
 const rows=index(report.independentProbeResults,'id');assert.equal(rows.size,1239);
 for(const row of rows.values()){expected(row.actual,row.expected);noExport(row.actual);}
 const policies=index(catalog.qualificationPolicies,'pathId');
 for(const p of catalog.paths.filter(p=>p.contractFamily==='qualifiedDayProcedureV10')){
  for(const req of policies.get(p.pathId).requirements)for(const suffix of['missing','wrong']){
   const row=rows.get('PY-M2-REQ-'+p.pathId+'-'+req.key+'-'+suffix);assert.ok(row);
   assert.equal(row.actual.reason,req.reason);assert.equal(row.actual.outcome,'qualificationBoundaryProposed');
   if(suffix==='missing')assert.equal(Object.hasOwn(row.input.facts,req.key),false);
  }
 }
 const own=report.nodeComparison.nodeMissingFactComparisons;
 for(const row of own){assert.equal(row.nodeRejectionConfirmed,true);assert.notEqual(row.actual.outcome,'datedResearchValue');}
});

test('M2 VS11over10 is distinct from AI greater-than30, and Jan5 remains inclusive only for court',()=>{
 const rows=index(report.independentProbeResults,'id');
 for(const stage of['ADMIN','COURT']){
  const p='PY-M2-M1-VS-'+stage+'-NOTICE-LONG-BASE';
  assert.equal(rows.get(p+'-11-OVER10').actual.end,'2026-10-13');
  assert.equal(rows.get(p+'-30-OVER10').actual.end,'2026-11-02');
  assert.equal(rows.get(p+'-10-EQUAL').actual.reason,'noticeDurationNotQualified');
  assert.equal(rows.get(p+'-11-BELOW30').actual.reason,'noticeDurationNotQualified');
 }
 assert.equal(rows.get('PY-M2-VS-JAN5-INCLUSIVE').actual.end,'2027-01-06');
 assert.equal(rows.get('PY-M2-VS-ADMIN-NO-RECESS').actual.end,'2027-01-05');
});

test('M2 NE uses2 explicit end calendars without rebasing, VD unsigned post has no AI expectation fact',()=>{
 const rows=index(report.independentProbeResults,'id');
 assert.equal(rows.get('PY-M2-NE-NO-RECEIPT-REBASE').actual.legalOpening,'2026-12-24');
 assert.equal(rows.get('PY-M2-NE-REGION-GENERAL').actual.end,'2027-05-27');
 assert.equal(rows.get('PY-M2-NE-REGION-LANDERON').actual.end,'2027-05-28');
 assert.equal(rows.get('PY-M2-NE-COURT-FIXED-NO-REGION-INPUT').actual.reason,'unknownResearchFact');
 assert.equal(rows.get('PY-M2-VD-QUALIFIED-SATURDAY').actual.legalOpening,'2026-09-19');
 assert.equal(rows.get('PY-M2-VD-UNSIGNED-FAST').actual.legalOpening,'2026-09-22');
 assert.equal(rows.get('PY-M2-VD-NO-AI-EXPECTATION').actual.reason,'unknownResearchFact');
 assert.equal(report.physicalCalendarProbeResults.length,22);
 for(const row of report.physicalCalendarProbeResults)assert.equal(row.actualRuleIds.length>0,row.expectedPhysicalHoliday);
 const ne=report.physicalCalendarProbeResults.filter(r=>r.calendarId==='ap22-ne-027ceadbf103');
 for(const d of['2027-01-02','2027-03-29','2027-05-07','2027-05-17','2027-09-20','2027-12-24','2027-12-26','2027-12-31'])
  assert.equal(ne.find(r=>r.date===d).expectedPhysicalHoliday,true,d);
});

test('M2 positive source/calendaring provenance agrees with actual candidate bindings',()=>{
 const peers=index(qa.results,'id'),eligible=index(catalog.releaseBinding.pathEligibility,'pathId');
 let count=0;
 for(const row of report.results.filter(r=>r.actual.outcome==='datedResearchValue')){
  const peer=peers.get(row.id),entry=eligible.get(row.input.path),p=row.actual.independentProvenance;
  for(const key of['pathId','pathSha256','qualificationPolicySha256','durationPolicySha256','openingPolicySha256',
   'holidayBindingId','holidayBindingSha256','calendarSelectionSha256','proceduralCalendarSupplementSha256','suspensionSelectionSha256'])
   assert.deepEqual(peer.actual.provenance[key],entry[key]);
  assert.equal(peer.actual.calendar,p.calendarId);assert.equal(peer.actual.provenance.baseProjectionId,p.projectionId);
  assert.deepEqual(peer.actual.provenance.evaluatedNormSegments,p.normSegments);
  assert.deepEqual(peer.actual.provenance.openingShiftDates,p.openingShiftDates);
  assert.deepEqual(peer.actual.provenance.shiftedDates,p.shiftedDates);count++;
 }
 assert.equal(count,73);assert.ok(report.nodeComparison.comparedFieldCounts.boundProvenance>=73);
 for(const row of report.mutationSensitivity){assert.equal(row.differenceDetected,true);assert.notDeepEqual(row.original,row.mutated);}
 assert.equal(report.mutationSensitivity.length,3);
});

test('M2 fresh NE gate binds9 official files without a future commencement guarantee',()=>{
 const gate=json(report.binding.neFreshnessGate.path);
 assert.equal(gate.reviewedOn,'2026-10-28');assert.equal(gate.sources.length,9);
 assert.equal(gate.status,'fresh-official-evidence-no-new-relevant-commencement-observed');
 for(const flag of['professionalAcceptance','sourceReleaseApproved','runtimeActive','operatingChanges'])assert.equal(gate[flag],false);
 for(const s of gate.sources){const b=read(gate.sourceBase+'/'+s.file);assert.equal(sha(b),s.sha256);assert.equal(b.length,s.bytes);}
 assert.equal(gate.sources.find(s=>s.id==='M2-NE-AVENIR').m1ByteIdentical,true);
 assert.equal(gate.sources.find(s=>s.id==='M2-NE-CE-INDEX-2026').legalIndexTextIdenticalM1,true);
 assert.equal(gate.sources.find(s=>s.id==='M2-NE-GC-INDEX-2026').legalIndexTextIdenticalM1,true);
});
