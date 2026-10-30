// SPDX-License-Identifier: AGPL-3.0-only
// Actual native evidence and independent Python arithmetic, no product imports.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)),out='outputs/ap23m3-2026-10-28',bundle='data/candidates/2026-10-28-ap23m3';
const read=p=>readFileSync(resolve(root,p)),json=p=>JSON.parse(read(p)),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report=json(out+'/independent-verification.json'),native=json(out+'/native-reference-verification.json'),suite=json('docs/fachrecht/ap23m1/referenzfaelle.json');
const manifest=json(bundle+'/manifest.json'),admin='administrative-procedures/ch-cantonal-administrative-procedures.json',catalog=json(bundle+'/'+admin),accepted=json('outputs/ap23m2-candidate-2026-10-28/bundle/'+admin);
const idx=(rows,key)=>{const m=new Map(rows.map(row=>[row[key],row]));assert.equal(m.size,rows.length);return m;};
function bound(row){const b=read(row.path);assert.equal(sha(b),row.sha256,row.path);assert.equal(b.length,row.byteLength,row.path);}
function expected(actual,values){for(const[key,value]of Object.entries(values))assert.deepEqual(actual[key],value,key);}
function noExport(actual){assert.equal(actual.calendarExport,false);assert.equal(Object.hasOwn(actual,'end'),actual.outcome==='datedResearchValue');}
test('M3 independent report binds actual native bytes and separates approved contract from pending source release',()=>{
 assert.equal(report.workPackage,'AP23M3');assert.equal(report.status,'passed');assert.deepEqual(report.contractDecision,{id:'DEC-2026-042',status:'approved',on:'2026-10-28'});
 for(const key of['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel','annotationRemoval','implicitCaseFacts','runtimeActivation','sourceReleaseApproved','calendarExportEnabled','vdArticle81NumericLegalityInference'])assert.equal(report[key],false,key);
 for(const key of['guard','manifest','catalog','suite','inputVocabularySchema','neFreshnessGate','acceptedM2Manifest','acceptedM2Catalog'])bound(report.binding[key]);bound(report.nativeComparison.evidence);
 assert.equal(report.binding.guard.sha256,'999058873565d1395f04767d040ca218ec8da04303b899f23d7f80cbcd7227f9');
 assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.extensions['steimer.local-reference'].sourceReview,'pending');assert.equal(catalog.contractStatus,'approved');
});
test('M3 fresh independent --check reproduces all current results without rewriting evidence',()=>{
 const before=read(out+'/independent-verification.json'),fresh=JSON.parse(execFileSync(resolve(root,'.venv/bin/python'),['-B','scripts/check_ap23m3_independent.py','--check'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}));
 assert.equal(fresh.status,'passed');for(const[key,value]of Object.entries(report.counts))assert.deepEqual(fresh[key],value,key);assert.deepEqual(read(out+'/independent-verification.json'),before);
});
test('M3 actually binds44 raw payloads,42 unchanged artifacts and35 calendars in70 year enumerations',()=>{
 assert.equal(report.binding.artifactBytes.length,44);const descriptors=idx(manifest.artifacts,'path');let unchanged=0;
 for(const row of report.binding.artifactBytes){const raw=read(bundle+'/'+row.path),d=descriptors.get(row.path);assert.equal(sha(raw),row.sha256);assert.equal(raw.length,row.byteLength);assert.equal(d.sha256,row.sha256);assert.equal(d.byteLength,row.byteLength);if(row.preserved){assert.deepEqual(raw,read('outputs/ap23m2-candidate-2026-10-28/bundle/'+row.path));unchanged++;}}
 assert.equal(unchanged,42);assert.equal(report.binding.physicalCalendars,35);assert.equal(report.binding.holidayRules,499);assert.equal(report.physicalCalendarInventories.length,70);
 const years=new Map();for(const row of report.physicalCalendarInventories){assert.equal(row.onlyWithinActualCalendarAndRuleValidity,true);assert.deepEqual(row.holidayDates,[...new Set(row.holidayDates)].sort());years.set(row.calendarId,[...(years.get(row.calendarId)??[]),row.year]);}assert.equal(years.size,35);for(const values of years.values())assert.deepEqual(values,[2026,2027]);
});
test('M3 preserves all245 accepted M2 path and qualification meanings',()=>{
 for(const[field,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['sources','sourceId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId'],['preserved','path']]){const current=idx(catalog[field],key);for(const old of accepted[field])assert.deepEqual(current.get(old[key]),old,field+'/'+old[key]);assert.equal(current.size,accepted[field].length);}
 assert.equal(catalog.paths.length,245);assert.equal(report.counts.oldPathsPreserved,196);assert.equal(report.binding.preservedObjects.find(row=>row.field==='holidayBindings.legalMeaning').unchangedObjects,36);
});
test('M3 all109 original fixtures retain every actual fact, static expectation and genuine native outcome',()=>{
 const original=idx(suite.cases,'id'),peers=idx(native.results,'id'),positive=new Set(),outcomes={};assert.equal(report.results.length,109);assert.equal(report.nativeComparison.matchedFixtures,109);
 for(const row of report.results){const source=original.get(row.id),peer=peers.get(row.id);assert.deepEqual(row.input.facts,source.facts);assert.deepEqual(peer.originalInput,row.input);assert.deepEqual(peer.input.caseQualification,source.facts);assert.deepEqual(row.expected,source.expected);expected(row.actual,source.expected);noExport(row.actual);assert.equal(row.nativeSemanticComparison,'equal');assert.equal(peer.native.calendarExportAllowed,false);outcomes[row.actual.outcome]=(outcomes[row.actual.outcome]??0)+1;if(row.actual.outcome==='datedResearchValue')positive.add(row.input.path);}
 assert.equal(positive.size,49);assert.deepEqual(outcomes,{datedResearchValue:73,qualificationBoundaryProposed:27,unresolvedBoundaryProposed:3,researchWindowBoundary:6});assert.deepEqual(report.counts.referenceOutcomes,outcomes);
});
test('M3 independent systematic probes exercise1239 explicit cases without filling absent facts',()=>{
 const rows=idx(report.independentProbeResults,'id');assert.equal(rows.size,1239);for(const row of rows.values()){expected(row.actual,row.expected);noExport(row.actual);}
 for(const path of catalog.paths.filter(row=>row.contractFamily==='qualifiedDayProcedureV10')){const policy=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);for(const req of policy.requirements)for(const suffix of['missing','wrong']){const row=rows.get('PY-M3-REQ-'+path.pathId+'-'+req.key+'-'+suffix);assert.ok(row);assert.equal(row.actual.reason,req.reason);assert.equal(row.actual.outcome,'qualificationBoundaryProposed');if(suffix==='missing')assert.equal(Object.hasOwn(row.input.facts,req.key),false);}}
});
test('M3 synthetic33 native cases are separate from the109 human references and1239 independent probes',()=>{
 const peers=idx(native.syntheticResults,'id');assert.equal(peers.size,33);assert.equal(report.nativeComparison.syntheticProbeComparisons.length,33);
 for(const row of report.nativeComparison.syntheticProbeComparisons){const peer=peers.get(row.id);assert.deepEqual(row.input,peer.originalInput);assert.deepEqual(row.expected,peer.expected);expected(row.actual,row.expected);noExport(row.actual);assert.equal(row.nativeSemanticComparison,'equal');assert.equal(peer.native.calendarExportAllowed,false);}
 assert.equal(native.oldResults.length,196);for(const row of native.oldResults){assert.equal(row.mathematicalFieldsEqual,true);assert.equal(row.native.calendarExportAllowed,false);}
});
test('M3 six technical diagnostic differences are explicit, case-bound and never hide a definitive result',()=>{
 const rows=idx(report.nativeComparison.explicitTechnicalDiagnosticDifferences,'id');assert.deepEqual([...rows.keys()].sort(),['authority-wrong','days-noninteger','days-string','days-zero','invalid-date-overflow','path-revision-wrong']);
 const peers=idx(native.syntheticResults,'id');for(const row of rows.values()){assert.equal(row.exactInputConditionVerified,true);assert.equal(row.arithmeticOrLegalRuleChanged,false);assert.equal(row.outcome,'qualificationBoundaryProposed');const peer=peers.get(row.id);assert.equal(peer.actual.reason,row.nativeReason);assert.equal(peer.native.outcome,'blocked');assert.equal(Object.hasOwn(peer.native,'finalEnd'),false);assert.equal(peer.native.calendarExportAllowed,false);}
});
test('M3 independent current-seat choice and unsigned receipt normalization are not defaulted',()=>{
 const rows=idx(report.independentProbeResults,'id');assert.equal(rows.get('PY-M3-NE-NO-RECEIPT-REBASE').actual.legalOpening,'2026-12-24');assert.equal(rows.get('PY-M3-NE-REGION-GENERAL').actual.end,'2027-05-27');assert.equal(rows.get('PY-M3-NE-REGION-LANDERON').actual.end,'2027-05-28');assert.equal(rows.get('PY-M3-NE-COURT-FIXED-NO-REGION-INPUT').actual.reason,'unknownResearchFact');assert.equal(rows.get('PY-M3-VD-QUALIFIED-SATURDAY').actual.legalOpening,'2026-09-19');assert.equal(rows.get('PY-M3-VD-UNSIGNED-FAST').actual.legalOpening,'2026-09-22');assert.equal(rows.get('PY-M3-VD-NO-AI-EXPECTATION').actual.reason,'unknownResearchFact');
});
test('M3 independent VS11over10 is not AI greater-than30 and January5 remains court-only',()=>{
 const rows=idx(report.independentProbeResults,'id');for(const stage of['ADMIN','COURT']){const prefix='PY-M3-M1-VS-'+stage+'-NOTICE-LONG-BASE';assert.equal(rows.get(prefix+'-11-OVER10').actual.end,'2026-10-13');assert.equal(rows.get(prefix+'-30-OVER10').actual.end,'2026-11-02');assert.equal(rows.get(prefix+'-10-EQUAL').actual.reason,'noticeDurationNotQualified');assert.equal(rows.get(prefix+'-11-BELOW30').actual.reason,'noticeDurationNotQualified');}assert.equal(rows.get('PY-M3-VS-JAN5-INCLUSIVE').actual.end,'2027-01-06');assert.equal(rows.get('PY-M3-VS-ADMIN-NO-RECESS').actual.end,'2027-01-05');
});
test('M3 positive native provenance binds actual input, selected calendar, opening and norms',()=>{
 const peers=idx(native.results,'id'),eligibility=idx(catalog.releaseBinding.pathEligibility,'pathId');let count=0;
 for(const row of report.results.filter(row=>row.actual.outcome==='datedResearchValue')){const peer=peers.get(row.id),prov=peer.native.provenance,own=row.actual.independentProvenance,entry=eligibility.get(row.input.path);assert.equal(prov.pathId,row.input.path);assert.equal(prov.calendarId,own.calendarId);assert.equal(prov.projectionId,own.projectionId);assert.equal(prov.calendarResolution.holidayBindingSha256,entry.holidayBindingSha256);assert.equal(prov.durationPolicySha256,entry.durationPolicySha256);assert.equal(prov.openingResolution.openingPolicySha256,entry.openingPolicySha256);assert.deepEqual(prov.openingResolution.openingShiftDates,own.openingShiftDates);assert.deepEqual(prov.evaluatedNormSegments,own.normSegments);count++;}assert.equal(count,73);
});
test('M3 independent physical anchors and mutation sensitivities remain meaningful',()=>{
 assert.equal(report.physicalCalendarProbeResults.length,22);for(const row of report.physicalCalendarProbeResults)assert.equal(row.actualRuleIds.length>0,row.expectedPhysicalHoliday);assert.equal(report.mutationSensitivity.length,3);for(const row of report.mutationSensitivity)assert.equal(row.differenceDetected,true);
});
test('M3 source-role bytes and inherited NE gate are independently byte-bound',()=>{
 assert.equal(report.binding.sourceEvidence.length,64);for(const row of report.binding.sourceEvidence)bound(row);assert.equal(report.binding.operativeSourceCount,19);const gate=json(report.binding.neFreshnessGate.path);assert.equal(gate.sources.length,9);for(const row of gate.sources){const bytes=read(gate.sourceBase+'/'+row.file);assert.equal(bytes.length,row.bytes);assert.equal(sha(bytes),row.sha256);}
});
test('M3 all196 old native results preserve every nonprovenance field and explicit input',()=>{
 const baseline=idx(json('outputs/ap23m2-2026-10-28/native-regression.json').results,'pathId'),current=idx(native.oldResults,'pathId');
 const mathematical=value=>Object.fromEntries(Object.entries(value).filter(([key])=>key!=='provenance'));
 assert.equal(report.nativeComparison.oldNativeMathematicalComparisons,196);assert.equal(report.nativeComparison.oldNativeMathematicalResults.length,196);assert.deepEqual([...baseline.keys()].sort(),[...current.keys()].sort());bound(report.nativeComparison.oldNativeAcceptedEvidence);
 for(const[path,row]of current){const old=baseline.get(path);assert.deepEqual(row.input,old.input);assert.deepEqual(mathematical(row.native),mathematical(old.native));assert.deepEqual(mathematical(row.prior),mathematical(old.native));assert.equal(row.native.referenceOnly,true);assert.equal(row.native.calendarExportAllowed,false);}
});
test('M3 all776 inherited original, synthetic and earlier-boundary cases are exact static comparisons',()=>{
 const inherited=json(out+'/inherited-reference-verification.json'),expected=new Map(),mathematical=value=>Object.fromEntries(Object.entries(value).filter(([key])=>key!=='provenance'));
 for(const[path,sections]of[['outputs/ap23l3-2026-10-27/native-reference-verification.json',['results','syntheticResults']],['outputs/ap23l3-2026-10-27/inherited-reference-verification.json',['results']]]){const prior=json(path);for(const section of sections)for(const row of prior[section])expected.set(path+'|'+section+'|'+row.id,row);}
 assert.equal(report.nativeComparison.inheritedReferenceComparisons,776);assert.equal(report.nativeComparison.inheritedMathematicalResults.length,776);assert.equal(expected.size,776);bound(report.nativeComparison.inheritedReferenceEvidence);for(const row of report.nativeComparison.inheritedAcceptedEvidence)bound(row);
 const seen=new Set();for(const row of inherited.results){const key=row.acceptedEvidence+'|'+row.acceptedSection+'|'+row.acceptedId,prior=expected.get(key);assert.ok(prior);assert.equal(seen.has(key),false);seen.add(key);assert.deepEqual(row.input,prior.input);assert.deepEqual(row.actual,prior.actual);assert.deepEqual(mathematical(row.native),mathematical(prior.native));assert.deepEqual(mathematical(row.prior),mathematical(prior.native));assert.equal(row.native.calendarExportAllowed,false);}assert.equal(seen.size,776);
 assert.equal(report.counts.oldNativeMathematicalComparisons,196);assert.equal(report.counts.inheritedReferenceComparisons,776);assert.match(report.nativeComparison.legacyComparisonMethod,/Not independent legacy arithmetic/u);
});
