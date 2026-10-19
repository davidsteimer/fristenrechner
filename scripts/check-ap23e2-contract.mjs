// SPDX-License-Identifier: AGPL-3.0-only
// Isolated contract proposal. Never imported by src, hosts or release builders.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSchema } from '../src/core/schemaContract.ts';
import { assertAdministrativeProcedureCatalog, administrativePeriodDate } from '../src/core/administrativeCatalog.ts';
import { parseFormat8Data, parseFormat8LocalReferenceData } from '../src/core/releaseFormat8.ts';
import { calculateAdministrativeDeadline } from '../src/core/administrativeDeadline.ts';
import { countDayDeadline } from '../src/core/dayDeadlineArithmetic.ts';
import { generateCalendarFromRules } from '../src/core/generateCalendar.ts';
import { parseIsoDate } from '../src/core/date.ts';
import { buildAp23e2Schemas, AP23E2_SCHEMA_FILES, AP23E2_SCHEMA_IDS } from './build-ap23e2-schemas.mjs';
import { runReferences } from './check-ap23e1-references.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = 'data/releases/2026-10-15-mvp-08-approved.1';
const candidateRoot = 'outputs/ap23e2-candidate-2026-10-18/bundle';
const adminFile = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
const read = p => readFile(resolve(root, p), 'utf8');
const json = async p => JSON.parse(await read(p));
const hash = s => createHash('sha256').update(s).digest('hex');
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const objectHash = v => hash(JSON.stringify(canonical(v)));
const same = (a, b, message) => assert.deepEqual(a, b, message);
const map = (rows, key) => {
  const result = new Map(rows.map(v => [v[key], v]));
  assert.equal(result.size, rows.length, `Duplicate ${key}`);
  return result;
};
const block = reason => ({ outcome: 'blocked', reason, exportAllowed: false });

export function validateAP23E2Catalog(catalog, old, research, schemas, sourceManifest) {
  assertSchema(catalog, schemas.catalog);
  same(catalog.contractStatus, 'proposed');
  same(catalog.contractDecision, { id: 'DEC-2026-033', status: 'proposed', on: null });
  same(catalog.runtimeActive, false);
  same(catalog.releaseBinding.status, 'candidate');
  same(catalog.releaseBinding.releaseId, null);
  same(catalog.releaseBinding.approval, null);
  same(catalog.releaseBinding.targetComponentRefs, []);
  same(catalog.releaseBinding.sourceReviewRef, null);
  same(catalog.releaseBinding.referenceSuiteRef, null);
  // Read-only structural projection for existing generic invariants only.
  // It is never persisted or passed into a Format-8 reader/calculator.
  const common = structuredClone(catalog);
  delete common.qualificationPolicies;
  for (const row of common.releaseBinding.pathEligibility) delete row.qualificationPolicySha256;
  common.$schema = old.$schema;
  common.formatVersion = '1.0.0';
  common.contractDecision = { id: 'DEC-2026-032', status: 'proposed', on: null };
  assertAdministrativeProcedureCatalog(common);

  const paths = map(catalog.paths, 'pathId'), policies = map(catalog.qualificationPolicies, 'pathId');
  const eligibility = map(catalog.releaseBinding.pathEligibility, 'pathId');
  const laws = map(catalog.laws, 'lawId'), suspensions = map(catalog.suspensionProfiles, 'suspensionProfileId');
  const holidays = map(catalog.holidayBindings, 'holidayBindingId');
  const oldPaths = map(old.paths, 'pathId');
  same(paths.size, 25); same(policies.size, 25); same(laws.size, 5); same(holidays.size, 5); same(suspensions.size, 8);
  same([...policies.keys()].sort(), [...paths.keys()].sort());
  for (const key of ['laws', 'sources', 'suspensionProfiles', 'excludedPaths']) {
    const id = { laws: 'lawId', sources: 'sourceId', suspensionProfiles: 'suspensionProfileId', excludedPaths: 'exclusionId' }[key];
    const entries = map(catalog[key], id);
    old[key].forEach(row => same(entries.get(row[id]), row, `Existing ${key}/${row[id]}`));
  }
  const descriptors = new Map(sourceManifest.artifacts.map(a => [a.contentId, a]));
  for (const binding of holidays.values()) {
    same(binding.physicalBaseline.releaseId, sourceManifest.releaseId);
    for (const ref of binding.physicalBaseline.references) {
      const d = descriptors.get(ref.contentId); assert.ok(d);
      same(ref, { role: d.role, contentId: d.contentId, sha256: d.sha256, path: d.path });
    }
    const prior = old.holidayBindings.find(b => b.holidayBindingId === binding.holidayBindingId);
    if (prior) { const {physicalBaseline:a, ...left}=binding, {physicalBaseline:b, ...right}=prior; same(left,right); }
  }
  for (const path of paths.values()) {
    const policy = policies.get(path.pathId), entry = eligibility.get(path.pathId);
    same(policy.pathRevision, path.revision); same(policy.pathSha256, objectHash(path));
    same(entry.qualificationPolicySha256, objectHash(policy));
    same(entry.targetComponentRefs, []); same(entry.sourceReviewRef, null); same(entry.referenceSuiteRef, null);
    if (oldPaths.has(path.pathId)) {
      same(path, oldPaths.get(path.pathId), 'Existing path changed');
      same(policy.mode, 'legacyV1');
      same(policy.baseline, { releaseId: sourceManifest.releaseId, catalogSha256: descriptors.get('ch-cantonal-administrative-procedures').sha256 });
      continue;
    }
    const source = research.paths.find(p => p.id.toLowerCase() === path.pathId);
    assert.ok(source, 'Unaccepted new path');
    same(path.revision, 1); same(path.researchRef, source.id); same(path.stages, source.stages);
    const law = laws.get(path.lawId), holiday = holidays.get(path.holidayBindingId), suspension = suspensions.get(path.suspensionProfileId);
    same(law.canton, source.canton); same(holiday.authoritySeatCanton, source.canton);
    same(holiday.physicalBaseline.calendarId, research.calendars[source.canton].physical.path.split('/').at(-1).replace('.json',''));
    same(path.duration, source.days === null
      ? { kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum' }
      : { kind:'statutoryDays',value:source.days,overridable:false });
    same(path.urgencyPolicy,'notApplicable');
    same(path.endShiftGuard,source.suspension==='three'?'blockWhenEnteringApplicableSuspension':'none');
    same(suspension.periods.length, source.suspension==='three'?3:0);
    if(source.suspension==='three') {
      for(const year of [2026,2027]) {
        const actual=suspension.periods.map(p=>[administrativePeriodDate(p.start,year),administrativePeriodDate(p.end,year)]).sort();
        const easter=research.easter[year]; const add=n=>new Date(Date.parse(easter+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
        same(actual,[[add(-7),add(7)],[`${year}-07-15`,`${year}-08-15`],[`${year}-12-18`,`${year+1}-01-02`]].sort());
      }
    }
    for(const key of ['caseCoverage','calculationCoverage','sourceCoverage']) same(path.temporalBinding[key],{from:source.from,to:'2027-12-31'});
    same(policy.mode,'qualifiedDayProcedure');
    same(policy.requirements,{action:source.action,decisionKind:source.action==='ordinaryAppeal'?'finalDecision':source.action==='executionAppeal'?'qualifiedVRPGArt63Order':'notApplicable',unit:'day',opening:'qualifiedCompleteActualDelivery',notice:'uncontested',termChange:'none',urgency:'none'});
  }
  return true;
}

/** Isolated proposal qualification, no product activation or export capability. */
export function evaluateAP23E2(input, catalog, calendars, inputSchema) {
  try { assertSchema(input,inputSchema); } catch { return block('inputContractInvalid'); }
  const path=catalog.paths.find(p=>p.pathId===input.path.toLowerCase());
  if(!path)return block('unknownPath');
  if(path.revision!==input.pathRevision)return block('pathRevisionMismatch');
  const policy=catalog.qualificationPolicies.find(p=>p.pathId===path.pathId);
  if(policy.mode!=='qualifiedDayProcedure')return block('legacyRequiresExistingQualifiedInput');
  const q=policy.requirements;
  if(input.unit!==q.unit)return block('unsupportedUnit');
  if(input.direction!=='forward')return block('unsupportedDirection');
  if(input.action!==q.action)return block('actionDoesNotMatchPath');
  if(q.action==='ordinaryAppeal'&&input.decisionKind!==q.decisionKind)return block('decisionOutsideScope');
  if(q.action==='executionAppeal'&&input.decisionKind!==q.decisionKind)return block('executionOrderNotQualified');
  if(q.action==='proceduralSubmission'&&input.decisionKind!=='notApplicable')return block('submissionQualificationMismatch');
  if(!path.stages.includes(input.stage))return block('stageDoesNotMatchPath');
  if(input.authorityLevel!=='cantonal')return block('authorityOutsideScope');
  const law=catalog.laws.find(l=>l.lawId===path.lawId);
  if(input.authoritySeatCanton!==law.canton)return block('authoritySeatMismatch');
  if(input.holidayAnchor!=='qualifiedTargetAuthority')return block('holidayAnchorNotQualified');
  if(input.explicitHolidayException!=='none')return block('explicitHolidayExceptionUnresolved');
  if(input.opening!==q.opening)return block('openingNotQualified');
  if(input.notice!==q.notice)return block('noticeNeedsIndividualReview');
  if(input.specialLaw!=='excluded')return block('specialLawNotExcluded');
  if(input.urgency!==q.urgency)return block('shortenedOrSpecialPeriod');
  if(input.fixedEndDate||input.deviatingStart)return block('fixedDateOrDeviatingStart');
  if(input.termChange!==q.termChange)return block('termChangeNeedsIndividualReview');
  if(path.duration.kind==='statutoryDays'&&input.days!==path.duration.value)return block('statutoryDurationMismatch');
  const temporal=path.temporalBinding;
  const holiday=catalog.holidayBindings.find(h=>h.holidayBindingId===path.holidayBindingId);
  const calendar=calendars.find(c=>c.calendarId===holiday.physicalBaseline.calendarId);
  const intervals=[temporal.caseCoverage,temporal.calculationCoverage,temporal.sourceCoverage,temporal.normVersionCoverage,calendar.validity];
  const covered=date=>intervals.every(i=>i.from<=date&&(i.to===null||date<=i.to));
  const range=temporal.calculationCoverage;
  if(!covered(input.trigger))return block('outsideReferenceRange');
  const generated=generateCalendarFromRules(calendars,calendar.calendarId,range);
  const holidays=new Map();
  for(const h of generated.calendar.holidays)holidays.set(h.date,[...(holidays.get(h.date)??[]),h]);
  const suspension=catalog.suspensionProfiles.find(s=>s.suspensionProfileId===path.suspensionProfileId);
  const periods=[];
  for(let y=Number(range.from.slice(0,4))-1;y<=Number(range.to.slice(0,4));y++)for(const p of suspension.periods)periods.push({periodId:`${p.periodId}-${y}`,startsOn:administrativePeriodDate(p.start,y),endsOn:administrativePeriodDate(p.end,y)});
  const result=countDayDeadline({legallyRelevantDate:input.trigger,deadlineDays:input.days,periods,shiftStartDuringSuspension:true,holidaysByDate:holidays,isCovered:covered,blockEndShiftIntoSuspension:path.endShiftGuard==='blockWhenEnteringApplicableSuspension'});
  if(result.outcome==='blocked')return {...block(result.reason==='dataCoverageExceeded'?'outsideReferenceRange':result.reason==='endShiftIntoSuspensionUnresolved'?'AR-O1-endShiftIntoSuspension':result.reason),blockedDate:result.blockedDate,nominalEnd:result.provisionalEnd};
  return{outcome:'reference',end:result.finalEnd,nominalEnd:result.provisionalEnd,firstCountedDay:result.countedDates[0],skippedDays:result.skippedCalendarDays,endShiftDays:parseIsoDate(result.finalEnd).ordinal-parseIsoDate(result.provisionalEnd).ordinal,exportAllowed:false};
}

/** Only the fixed synthetic E1 suite supplies these already-known test facts. */
function researchInput(test,research) {
  const source=research.paths.find(p=>p.id===test.input.path);
  const result={...research.sharedFacts,...test.input,pathRevision:1,authoritySeatCanton:source.canton,direction:'forward',explicitHolidayException:'none'};
  if(source.action==='proceduralSubmission')result.decisionKind='notApplicable';
  return result;
}

export async function runAP23E2() {
  const acceptance=await read('docs/fachrecht/abnahme-ap23e1.md');
  const acceptedFiles=[...acceptance.matchAll(/\| \[[^\]]+\]\(([^)]+)\) \| `([a-f0-9]{64})` \|/g)];
  same(acceptedFiles.length,9);
  for(const [,path,expected]of acceptedFiles)same(hash(await readFile(resolve(root,'docs/fachrecht',path))),expected,`Accepted E1 bytes ${path}`);
  const {schemas,preservedSchemaBaselines}=await buildAp23e2Schemas();
  for(const [key,path] of Object.entries(AP23E2_SCHEMA_FILES))same(await json(path),schemas[key]);
  const sourceManifest=await json(`${baseline}/manifest.json`), oldText=await read(`${baseline}/${adminFile}`), old=JSON.parse(oldText);
  const sourceFiles=new Map();
  for(const a of sourceManifest.artifacts){const text=await read(`${baseline}/${a.path}`);same(Buffer.byteLength(text),a.byteLength);same(hash(text),a.sha256);sourceFiles.set(a.path,text);}
  const research=await json('tests/golden/candidates/ap23e1-administrative.json');
  const catalog=await json(`${candidateRoot}/${adminFile}`), manifest=await json(`${candidateRoot}/manifest.json`);
  validateAP23E2Catalog(catalog,old,research,schemas,sourceManifest);
  assertSchema(manifest,schemas.localManifest);
  same(manifest.releaseStatus,'candidate');same(manifest.sourceSummary.legalBasisReviewStatus,'pending');
  same(manifest.artifacts.length,41);same(manifest.profileIds,sourceManifest.profileIds);same(manifest.calendarIds,sourceManifest.calendarIds);
  const files=new Map();let retainedArtifactBytes=0;
  for(const a of manifest.artifacts){const text=await read(`${candidateRoot}/${a.path}`);same(Buffer.byteLength(text),a.byteLength);same(hash(text),a.sha256);files.set(a.path,text);if(a.path!==adminFile){same(text,sourceFiles.get(a.path));retainedArtifactBytes++;}}
  same(retainedArtifactBytes,40);
  const calendars=[...files.values()].map(JSON.parse).filter(d=>d.dataKind==='calendar');same(calendars.length,32);
  const runtimeBaseline=parseFormat8Data(await read(`${baseline}/manifest.json`),sourceFiles);
  same(runtimeBaseline.mode,'approved');
  assert.throws(()=>assertAdministrativeProcedureCatalog(catalog));
  assert.throws(()=>parseFormat8Data(JSON.stringify(manifest),files));
  assert.throws(()=>parseFormat8LocalReferenceData(JSON.stringify(manifest),files));
  const oldLocalSchema=await json('schemas/implementation/ap23d1/local-reference-manifest-v8.schema.json');
  const relabelled={...manifest,$schema:oldLocalSchema.$id,formatVersion:'8.0.0',compatibility:{...manifest.compatibility,minimumConsumerFormatVersion:'8.0.0'}};
  assert.throws(()=>parseFormat8LocalReferenceData(JSON.stringify(relabelled),files));
  // Even correctly relabelled versions and descriptors, with recomputed raw
  // byte hashes, cannot hide the mandatory qualification fields from V1.
  const forgedManifest=structuredClone(relabelled), forgedCatalog=structuredClone(catalog), forgedFiles=new Map(files);
  forgedCatalog.$schema=old.$schema;forgedCatalog.formatVersion='1.0.0';forgedCatalog.contractDecision.id='DEC-2026-032';
  const forgedText=JSON.stringify(forgedCatalog,null,2)+'\n';forgedFiles.set(adminFile,forgedText);
  const forgedDescriptor=forgedManifest.artifacts.find(a=>a.path===adminFile);
  forgedDescriptor.schemaId=old.$schema;forgedDescriptor.byteLength=Buffer.byteLength(forgedText);forgedDescriptor.sha256=hash(forgedText);
  assertSchema(forgedManifest,oldLocalSchema);
  assert.throws(()=>assertAdministrativeProcedureCatalog(forgedCatalog));
  assert.throws(()=>parseFormat8LocalReferenceData(JSON.stringify(forgedManifest),forgedFiles));
  assert.throws(()=>assertSchema(manifest,schemas.manifest));
  const results=research.cases.map(test=>{const actual=evaluateAP23E2(researchInput(test,research),catalog,calendars,schemas.input);for(const [k,v]of Object.entries(test.expected))same(actual[k],v,`${test.id}/${k}`);same(actual.exportAllowed,false);return{id:test.id,...actual};});

  const mutationResults=[];
  const invalid=(id,edit)=>{const altered=structuredClone(catalog);edit(altered);assert.throws(()=>validateAP23E2Catalog(altered,old,research,schemas,sourceManifest),undefined,id);mutationResults.push(id);};
  const newPolicy=c=>c.qualificationPolicies.find(p=>p.pathId==='ar-execution-5');
  const newPath=c=>c.paths.find(p=>p.pathId==='ar-execution-5');
  const rebindPolicy=(c,id)=>{const p=c.qualificationPolicies.find(p=>p.pathId===id);c.releaseBinding.pathEligibility.find(p=>p.pathId===id).qualificationPolicySha256=objectHash(p);};
  const rebindPath=(c,id)=>{const p=c.paths.find(p=>p.pathId===id);c.qualificationPolicies.find(q=>q.pathId===id).pathSha256=objectHash(p);c.releaseBinding.pathEligibility.find(q=>q.pathId===id).pathSha256=objectHash(p);rebindPolicy(c,id);};
  invalid('missing-policy',c=>c.qualificationPolicies.pop());
  invalid('duplicate-policy',c=>c.qualificationPolicies.push(c.qualificationPolicies[0]));
  invalid('foreign-policy',c=>{newPolicy(c).pathId='unknown-path';});
  invalid('policy-revision',c=>{newPolicy(c).pathRevision=2;});
  invalid('policy-path-hash',c=>{newPolicy(c).pathSha256='0'.repeat(64);});
  invalid('eligibility-policy-hash',c=>{c.releaseBinding.pathEligibility[0].qualificationPolicySha256='0'.repeat(64);});
  invalid('new-path-as-legacy-with-recomputed-hash',c=>{const p=newPolicy(c);delete p.requirements;p.mode='legacyV1';p.baseline={releaseId:sourceManifest.releaseId,catalogSha256:hash(oldText)};rebindPolicy(c,p.pathId);});
  invalid('weaken-execution-kind',c=>{newPolicy(c).requirements.decisionKind='finalDecision';rebindPolicy(c,'ar-execution-5');});
  invalid('alter-existing-ti-path-recomputed-hashes',c=>{c.paths[0].duration.value=29;rebindPath(c,c.paths[0].pathId);});
  invalid('change-existing-exclusion',c=>{c.excludedPaths[0].reason='new permission';});
  invalid('remove-ar-guard-recomputed-hashes',c=>{const p=c.paths.find(p=>p.pathId==='ar-court-30');p.endShiftGuard='none';rebindPath(c,p.pathId);});
  invalid('enable-ar-urgency',c=>{c.paths.find(p=>p.pathId==='ar-court-30').urgencyPolicy='explicitGRJudicialUrgencyOrder';});
  invalid('broaden-lu-window',c=>{c.paths.find(p=>p.pathId==='lu-admin-30').temporalBinding.caseCoverage.from='2026-08-29';});
  invalid('federal-calendar-fallback',c=>{c.holidayBindings.at(-1).physicalBaseline.calendarId='ch-federal-calendar';});
  invalid('wrong-baseline-bytes',c=>{c.holidayBindings[0].physicalBaseline.references[0].sha256='0'.repeat(64);});
  invalid('remove-one-new-path',c=>{c.paths.pop();});
  invalid('promote-contract',c=>{c.contractStatus='approved';c.contractDecision.status='approved';c.contractDecision.on='2026-10-18';});
  invalid('grant-runtime',c=>{c.runtimeActive=true;});

  const positive=researchInput(research.cases.find(c=>c.id==='ZG01'),research);
  const inputMutations=[];
  for(const key of Object.keys(positive)){const input={...positive};delete input[key];same(evaluateAP23E2(input,catalog,calendars,schemas.input).outcome,'blocked');inputMutations.push(`missing:${key}`);}
  for(const [key,value]of [['pathRevision',2],['authoritySeatCanton','BE'],['direction','backward'],['holidayAnchor','party'],['explicitHolidayException','present'],['notice','missing'],['termChange','extension'],['urgency','shortened'],['action','payment'],['decisionKind','interimDecision'],['opening','dispositiveOnly'],['specialLaw','unknown'],['trigger','2026-02-30'],['days',19],['unrecognisedFact',true]]){
    same(evaluateAP23E2({...positive,[key]:value},catalog,calendars,schemas.input).outcome,'blocked',key);inputMutations.push(`changed:${key}`);
  }
  const legacyPositive={selection:{kind:'cantonalAdministrative',lawId:'lpamm-ti',pathId:'ti-advance',revision:1,stage:'court'},authoritySeat:{canton:'TI',level:'cantonal',qualification:'competentAuthorityForCurrentAction'},inputDate:'2026-10-16',deadlineDays:10,qualification:{delivery:'qualifiedActualDelivery',generalRoute:'qualified',specialLaw:'excluded',explicitHolidayException:'none',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},urgency:'none'};
  const tiAdvance=calculateAdministrativeDeadline(legacyPositive,runtimeBaseline);
  same(tiAdvance.outcome,'calculated','Existing TI cost advance must remain eligible');
  const legacyReferences=old.paths.map(path=>{
    const input={...legacyPositive,selection:{kind:'cantonalAdministrative',lawId:path.lawId,pathId:path.pathId,revision:path.revision,stage:path.stages[0]},authoritySeat:{...legacyPositive.authoritySeat,canton:old.laws.find(l=>l.lawId===path.lawId).canton},deadlineDays:path.duration.kind==='statutoryDays'?path.duration.value:10};
    const result=calculateAdministrativeDeadline(input,runtimeBaseline);same(result.outcome,'calculated',path.pathId);
    const untrusted=calculateAdministrativeDeadline(input,{catalog,manifest});same(untrusted.outcome,'blocked');
    return{pathId:path.pathId,end:result.finalEnd,untrustedCandidateBlocked:true};
  });
  const e1=await runReferences(); // also binds unchanged 95 src + 42 approved files
  same(e1.status,'passed');
  const artifactPaths=['docs/fachrecht/abnahme-ap23e1.md','docs/architektur/verwaltungsverfahrensvertrag-ap23e2.md','docs/architektur/verwaltungsverfahrensvertrag-ap23e2-pruefung.md','docs/entscheidungen/DEC-2026-033-qualifizierte-kantonalverfahren-v2.md',...Object.values(AP23E2_SCHEMA_FILES),'scripts/build-ap23e2-schemas.mjs','scripts/build-ap23e2-candidate.mjs','scripts/check-ap23e2-contract.mjs','scripts/check_ap23e2_independent.py','outputs/ap23e2-2026-10-18/QA-AP23E2-INDEPENDENT.json',`${candidateRoot}/manifest.json`,`${candidateRoot}/${adminFile}`];
  const artifacts=await Promise.all(artifactPaths.map(async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:hash(bytes)};}));
  return{status:'passed',workPackage:'AP23E2',contractStatus:'proposed',runtimeActive:false,productIntegrationTest:false,sourceReleaseApproved:false,calendarExportEnabled:false,sourceReview:'historicalReusePendingCombinedReleaseReview',paths:25,unchangedLegacyPaths:12,newPaths:13,qualificationPolicies:25,referenceCases:results.length,datedCases:results.filter(r=>r.outcome==='reference').length,blockedCases:results.filter(r=>r.outcome==='blocked').length,negativeCatalogMutations:mutationResults.length,negativeInputMutations:inputMutations.length,retainedArtifactBytes,legacyReferences,results,mutationResults,inputMutations,preservedSchemaBaselines,preservedTrees:e1.preservedTrees,artifacts};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=await runAP23E2();
  if(process.argv.includes('--write')){await mkdir(resolve(root,'outputs/ap23e2-2026-10-18'),{recursive:true});await writeFile(resolve(root,'outputs/ap23e2-2026-10-18/QA-AP23E2.json'),JSON.stringify(report,null,2)+'\n');}
  const {results,mutationResults,inputMutations,legacyReferences,artifacts,...summary}=report;console.log(JSON.stringify(summary,null,2));
}
