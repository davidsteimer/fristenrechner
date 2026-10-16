// SPDX-License-Identifier: AGPL-3.0-only
// Isolated proposal checks. Never imported by product code or release builders.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixturePath = 'tests/golden/candidates/ap23c-administrative-contract.json';
const schemaPath = 'schemas/candidates/ap23c/administrative-procedure-catalog.schema.json';
const manifestSchemaPath = 'schemas/candidates/ap23c/release-manifest-v8.schema.json';
const baseline = 'data/releases/2026-10-08-mvp-07-approved.1/';
const hash = value => createHash('sha256').update(value).digest('hex');
const read = path => readFile(resolve(root, path));
const json = async path => JSON.parse(await read(path));
const equal = (a, b, message) => assert.deepEqual(a, b, message);
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key,canonical(value[key])])) : value;
const objectHash = value => hash(JSON.stringify(canonical(value)));
const ids = (items, key) => {
  const values = items.map(item => item[key]);
  equal(new Set(values).size, values.length, `Duplicate ${key}`);
  return new Map(items.map(item => [item[key], item]));
};
function refs(value, key, found = []) {
  if (Array.isArray(value)) value.forEach(item => refs(item, key, found));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => {
    if (name === key && typeof item === 'string') found.push(item);
    else refs(item, key, found);
  });
  return found;
}
function strictDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}
function contains(interval, date) {
  return strictDate(date) && interval.from <= date && (interval.to === null || date <= interval.to);
}

export function assertCatalogContract(catalog, research) {
  equal(catalog.contractStatus, 'proposed');
  equal(catalog.runtimeActive, false);
  equal(catalog.releaseBinding.releaseId, null);
  equal(catalog.releaseBinding.approval, null);
  equal(catalog.releaseBinding.targetComponentRefs, []);
  equal(catalog.review,{basis:'AP23B accepted 2026-10-14 with TI-O1 amendment',sourceReview:'reuseAP23BNoNewCompleteSourceReview',checkedOn:'2026-10-14'});
  catalog.sources.forEach(source=>equal(source.reviewBasis,'AP23B-2026-10-12'));
  const laws = ids(catalog.laws, 'lawId');
  const paths = ids(catalog.paths, 'pathId');
  const sources = ids(catalog.sources, 'sourceId');
  const suspensions = ids(catalog.suspensionProfiles, 'suspensionProfileId');
  const holidays = ids(catalog.holidayBindings, 'holidayBindingId');
  const eligibility = ids(catalog.releaseBinding.pathEligibility, 'pathId');
  equal([...laws.keys()].sort(), ['lpamm-ti', 'vrg-gr']);
  equal(paths.size, 12);
  equal([...eligibility.keys()].sort(), [...paths.keys()].sort());
  equal(suspensions.size, 4);
  equal(holidays.size, 2);
  const sourceRefs = refs(catalog, 'sourceId');
  sourceRefs.forEach(id => assert.ok(sources.has(id), `Unknown source ${id}`));
  assert.ok(!sourceRefs.some(id => id.startsWith('DEC-')), 'Project decision is not a statute');
  equal(catalog.holidayResolutionPolicy.precedence,
    ['applicableFederalSpecialLaw', 'verifiedExplicitProceduralException', 'authoritySeat']);
  const expected = research.paths.filter(path => path.purpose === 'pilot');
  equal([...paths.keys()].sort(), expected.map(path => path.id.toLowerCase()).sort());
  const coverage = { from: '2026-08-29', to: '2027-12-31' };
  for (const path of catalog.paths) {
    const old = expected.find(item => item.id === path.researchRef);
    assert.ok(old, 'Unknown AP23B path');
    equal(path.pathId, old.id.toLowerCase());
    equal(path.revision, 1);
    equal(path.stages, old.stages, path.pathId);
    equal(path.lawId, old.canton === 'TI' ? 'lpamm-ti' : 'vrg-gr');
    equal(path.duration, old.days === null
      ? {kind: 'authorityOrderedDays', minimum: 1, maximum: 365, boundMeaning: 'technicalSafetyLimitNotLegalMaximum'}
      : {kind: 'statutoryDays', value: old.days, overridable: false});
    const suspension = suspensions.get(path.suspensionProfileId);
    const holiday = holidays.get(path.holidayBindingId);
    assert.ok(suspension && holiday, 'Unresolved component');
    equal(suspension.lawId, path.lawId);
    equal(holiday.lawId, path.lawId);
    equal(path.suspensionProfileId, `${old.canton.toLowerCase()}-${old.suspension}`);
    equal(path.urgencyPolicy, old.canton === 'GR' && old.stages.length === 1 && old.stages[0] === 'court'
      ? 'explicitGRJudicialUrgencyOrder' : 'notApplicable');
    equal(path.endShiftGuard, old.canton === 'TI' && old.suspension === 'three'
      ? 'blockWhenEnteringApplicableSuspension' : 'none');
    for (const key of ['caseCoverage', 'calculationCoverage', 'sourceCoverage']) equal(path.temporalBinding[key], coverage);
    assert.ok(contains(path.temporalBinding.normVersionCoverage, coverage.from));
    equal(path.temporalBinding.futureNormAssumption, 'proposalAssumingContinuedApplicabilityNotFutureLegalVerification');
    equal(path.temporalBinding.evaluation, 'eachEvaluatedDayIncludingEndShift');
    const entry = eligibility.get(path.pathId);
    equal(entry.pathRevision,path.revision);
    equal(entry.pathSha256,objectHash(path));
    equal(entry.holidayBindingId,path.holidayBindingId);
    equal(entry.holidayBindingSha256,objectHash(holiday));
    equal(entry.suspensionProfileId,path.suspensionProfileId);
    equal(entry.suspensionProfileSha256,objectHash(suspension));
    equal(entry.caseCoverage,path.temporalBinding.caseCoverage);
    equal(entry.calculationCoverage,path.temporalBinding.calculationCoverage);
    equal(entry.status,'candidate');
    equal(entry.targetComponentRefs,[]);
    equal(entry.sourceReviewRef,null);
    equal(entry.referenceSuiteRef,null);
  }
  const winter = {start: {type:'fixedMonthDay',month:12,day:18,yearOffset:0},
    end: {type:'fixedMonthDay',month:1,day:2,yearOffset:1}};
  for (const suspension of catalog.suspensionProfiles) {
    const prefix = suspension.lawId === 'lpamm-ti' ? 'ti' : 'gr';
    const norm = prefix === 'ti' ? 'SRC-AP23B-TI-LPAMM' : 'SRC-AP23B-GR-VRG';
    assert.ok(suspension.sourceRefs.some(ref => ref.sourceId === norm));
    ids(suspension.periods, 'periodId');
    equal(suspension.periods, suspension.suspensionProfileId.endsWith('-none') ? [] : [
      {periodId:`${prefix}-easter`,start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
      {periodId:`${prefix}-summer`,start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
      {periodId:`${prefix}-winter`,...winter,inclusive:true}
    ]);
  }
  for (const holiday of catalog.holidayBindings) {
    equal(holiday.authoritySeatCanton, laws.get(holiday.lawId).canton);
    equal(holiday.anchor, 'authoritySeat');
    equal(holiday.legalBinding.partyOrRepresentativeRequired, false);
    equal(holiday.legalBinding.roleUnion, false);
    equal(holiday.physicalBaseline.eligibilityMeaning, 'physicalSourceOnlyNotFederalProcedurePermission');
    equal(holiday.physicalBaseline.releaseId,'2026-10-08-mvp-07-approved.1');
    ids(holiday.physicalBaseline.references, 'contentId');
  }
  assert.ok(catalog.excludedPaths.some(path => path.exclusionId === 'nw-contrast-only'));
  assert.ok(!catalog.paths.some(path => path.lawId.includes('nw')));
  return true;
}

/** Contract-only resolver probe. Returns no deadline and never enables export. */
export function probePlan(input, catalog) {
  const block = reason => ({outcome:'blocked',reason,exportAllowed:false});
  const required = ['pathId','lawId','authoritySeatCanton','authorityLevel','stage','triggerDate','actualDelivery','generalRoute','specialLaw','explicitHolidayException','urgency','fixedEndDate','deviatingStart','evidenceAdvance'];
  const optional = ['orderedDays','partyCanton','representativeCanton'];
  if (!input || required.some(key => !Object.hasOwn(input,key)) || Object.keys(input).some(key => !required.includes(key) && !optional.includes(key))) return block('invalidInputContract');
  const path = catalog.paths.find(path => path.pathId === input.pathId);
  if (!path || path.lawId !== input.lawId) return block('unknownPath');
  if (!strictDate(input.triggerDate)) return block('invalidDate');
  if (input.specialLaw === 'federalSpecial') return block('requiresSeparateReleasedFederalSpecialPath');
  if (input.specialLaw !== 'excluded') return block('specialLawUnresolved');
  if (input.explicitHolidayException === 'verified') return block('requiresExplicitSeparateHolidayBinding');
  if (input.explicitHolidayException !== 'none') return block('holidayPolicyUnresolved');
  const binding = catalog.holidayBindings.find(item => item.holidayBindingId === path.holidayBindingId);
  if (input.authorityLevel !== 'cantonal' || input.authoritySeatCanton !== binding.authoritySeatCanton) return block('authorityNotQualified');
  if (!path.stages.includes(input.stage)) return block('wrongStage');
  if (input.actualDelivery !== true || input.generalRoute !== true) return block('routeNotQualified');
  if (input.fixedEndDate !== false || input.deviatingStart !== false || input.evidenceAdvance !== false) return block('unsupportedProcedure');
  if (!['none','explicitGRJudicialUrgencyOrder'].includes(input.urgency)) return block('urgencyNotQualified');
  if (input.urgency !== 'none' && path.urgencyPolicy !== input.urgency) return block('urgencyOutsideScope');
  if (path.duration.kind === 'statutoryDays' ? Object.hasOwn(input,'orderedDays')
    : !Number.isInteger(input.orderedDays) || input.orderedDays < 1 || input.orderedDays > 365) return block('invalidDuration');
  if (['caseCoverage','sourceCoverage','normVersionCoverage'].some(key => !contains(path.temporalBinding[key],input.triggerDate))) return block('outsideCoverage');
  return {outcome:'referencePlan',lawId:path.lawId,pathId:path.pathId,stage:input.stage,
    days:path.duration.kind === 'statutoryDays' ? path.duration.value : input.orderedDays,
    holidayBindingId:binding.holidayBindingId,
    suspensionProfileId:input.urgency === 'explicitGRJudicialUrgencyOrder' ? 'gr-none' : path.suspensionProfileId,
    exportAllowed:false};
}

function inSuspension(date, profile) {
  const year = Number(date.slice(0,4));
  const easter = {2026:'2026-04-05',2027:'2027-03-28'};
  const expression = (expr, baseYear) => expr.type === 'fixedMonthDay'
    ? `${baseYear + expr.yearOffset}-${String(expr.month).padStart(2,'0')}-${String(expr.day).padStart(2,'0')}`
    : new Date(Date.parse(`${easter[baseYear]}T00:00:00Z`) + expr.days * 86400000).toISOString().slice(0,10);
  return profile.periods.some(period => [year-1,year].some(baseYear =>
    (period.start.type !== 'easterOffset' || easter[baseYear])
    && expression(period.start,baseYear) <= date && date <= expression(period.end,baseYear)));
}
export function probeEvaluatedDay(catalog,pathId,date,{endShift=false,suspensionDisabled=false}={}) {
  const path = catalog.paths.find(path => path.pathId === pathId);
  if (!path || ['calculationCoverage','sourceCoverage','normVersionCoverage'].some(key => !contains(path.temporalBinding[key],date))) return 'outsideCoverage';
  const profile = catalog.suspensionProfiles.find(item => item.suspensionProfileId === path.suspensionProfileId);
  return !suspensionDisabled && endShift && path.endShiftGuard === 'blockWhenEnteringApplicableSuspension' && inSuspension(date,profile)
    ? 'endShiftIntoSuspensionUnresolved' : 'referenceDayPermitted';
}

/** Structural readiness is not source verification, approval or runtime authority. */
export function assertPromotionBindingShape(catalog) {
  const release = catalog.releaseBinding;
  assert.ok(['approved','withdrawn'].includes(release.status));
  equal(catalog.runtimeActive,false);
  const paths = ids(catalog.paths,'pathId');
  const eligibility = ids(release.pathEligibility,'pathId');
  equal([...eligibility.keys()].sort(),[...paths.keys()].sort());
  assert.ok(strictDate(release.approval.approvedOn));
  assert.ok(catalog.contractDecision.on <= release.approval.approvedOn);
  const components = ids(release.targetComponentRefs,'contentId');
  const expectedRoles = {'ap22-gr-bf0366c8eda2':'calendar','ap22-ti-944ed0286e9a':'calendar',
    'ch-federal-calendar':'calendar','ch-holiday-catalog':'holidayCatalog'};
  equal([...components.keys()].sort(),Object.keys(expectedRoles).sort());
  for(const [contentId,component] of components) equal(component.role,expectedRoles[contentId],`Component role ${contentId}`);
  for (const path of paths.values()) {
    const entry = eligibility.get(path.pathId);
    const holiday = catalog.holidayBindings.find(item=>item.holidayBindingId===path.holidayBindingId);
    const suspension = catalog.suspensionProfiles.find(item=>item.suspensionProfileId===path.suspensionProfileId);
    equal(entry.status,release.status);
    equal(entry.pathRevision,path.revision);
    equal(entry.pathSha256,objectHash(path));
    equal(entry.holidayBindingId,path.holidayBindingId);
    equal(entry.holidayBindingSha256,objectHash(holiday));
    equal(entry.suspensionProfileId,path.suspensionProfileId);
    equal(entry.suspensionProfileSha256,objectHash(suspension));
    equal(entry.caseCoverage,path.temporalBinding.caseCoverage);
    equal(entry.calculationCoverage,path.temporalBinding.calculationCoverage);
    const refsById = ids(entry.targetComponentRefs,'contentId');
    equal([...refsById.keys()].sort(),[holiday.physicalBaseline.calendarId,'ch-federal-calendar','ch-holiday-catalog'].sort());
    entry.targetComponentRefs.forEach(ref=>equal(ref,components.get(ref.contentId)));
    equal(entry.sourceReviewRef,release.sourceReviewRef);
    equal(entry.referenceSuiteRef,release.referenceSuiteRef);
  }
  return true;
}

export function assertManifestInventory(manifest) {
  equal(manifest.formatVersion,'8.0.0');
  equal(manifest.compatibility.minimumConsumerFormatVersion,'8.0.0');
  ids(manifest.artifacts,'path');
  ids(manifest.artifacts,'contentId');
  const roleFields = {legalProfile:'profileIds',calendar:'calendarIds',holidayCatalog:'holidayCatalogIds',
    specialRegimeCatalog:'specialRegimeCatalogIds',socialProcedureCatalog:'socialProcedureCatalogIds',
    administrativeProcedureCatalog:'administrativeProcedureCatalogIds'};
  for(const artifact of manifest.artifacts){
    assert.ok(Object.hasOwn(roleFields,artifact.role));
    assert.ok(!artifact.path.split('/').some(part=>!part||part==='.'||part==='..'),'Noncanonical artifact path');
  }
  for(const [role,field] of Object.entries(roleFields)){
    equal(new Set(manifest[field]).size,manifest[field].length);
    equal([...manifest[field]].sort(),manifest.artifacts.filter(a=>a.role===role).map(a=>a.contentId).sort());
  }
  equal([...manifest.profileIds].sort(),['bgg','stpo','vrpg-be','vwvg','zpo']);
  return true;
}

function schemaBatch(schemas, samples) {
  const python = process.env.AP23C_PYTHON ?? resolve(root,'.venv/bin/python');
  const program = 'import json,sys,jsonschema\np=json.load(sys.stdin)\nfor s in p["schemas"].values(): jsonschema.Draft202012Validator.check_schema(s)\nr=[]\nfor x in p["samples"]:\n v=jsonschema.Draft202012Validator(p["schemas"][x["schema"]],format_checker=jsonschema.FormatChecker())\n r.append({"id":x["id"],"valid":v.is_valid(x["value"])})\nprint(json.dumps(r))';
  const result = spawnSync(python,['-c',program],{input:JSON.stringify({schemas,samples}),encoding:'utf8',maxBuffer:8*1024*1024});
  assert.equal(result.status,0,result.stderr);
  const results = JSON.parse(result.stdout);
  results.forEach((result,index) => equal(result.valid,samples[index].valid,`Schema probe ${result.id}`));
  return results;
}

export async function runContractChecks() {
  const [bytes,schema,manifestSchema,research,oldManifest] = await Promise.all([
    read(fixturePath),json(schemaPath),json(manifestSchemaPath),json('tests/golden/candidates/ap23b-administrative.json'),json(baseline+'manifest.json')]);
  const catalog = JSON.parse(bytes);
  assertCatalogContract(catalog,research);
  const preserved = [];
  for (const item of catalog.preserved) {
    equal(hash(await read(item.path)),item.sha256,item.path);
    preserved.push(item.path);
  }
  for (const binding of catalog.holidayBindings) {
    for (const reference of binding.physicalBaseline.references) {
      const descriptor = oldManifest.artifacts.find(item => item.contentId === reference.contentId && item.role === reference.role);
      assert.ok(descriptor,'Missing physical baseline');
      equal(descriptor.path,reference.path);
      equal(descriptor.sha256,reference.sha256);
      equal(hash(await read(baseline+reference.path)),reference.sha256);
    }
    const calendarRef = binding.physicalBaseline.references.find(item => item.contentId === binding.physicalBaseline.calendarId);
    const calendar = await json(baseline+calendarRef.path);
    equal(calendar.projection.projectionId,binding.physicalBaseline.projectionId);
    equal(calendar.jurisdiction.code,binding.authoritySeatCanton);
    equal(calendar.inherits,['ch-federal-calendar']);
  }
  const manifest = structuredClone(oldManifest);
  manifest.$schema = manifestSchema.$id;
  manifest.formatVersion = '8.0.0';
  manifest.compatibility.minimumConsumerFormatVersion = '8.0.0';
  manifest.releaseId = '2026-10-14-ap23c-schema-probe.1';
  manifest.releaseStatus = 'candidate';
  manifest.createdOn = '2026-10-14';
  manifest.sourceSummary.legalBasisReviewStatus = 'pending';
  manifest.sourceSummary.technicalValidationStatus = 'pending';
  manifest.sourceSummary.latestReviewedOn = '2026-10-12';
  manifest.sourceSummary.sourceIds = [...new Set([...manifest.sourceSummary.sourceIds,...catalog.sources.map(source=>source.sourceId)])].sort();
  manifest.administrativeProcedureCatalogIds = [catalog.catalogId];
  manifest.artifacts.push({path:'administrative-procedures/ch-cantonal-administrative-procedures.json',role:catalog.dataKind,contentId:catalog.catalogId,mediaType:'application/json',schemaId:catalog.$schema,byteLength:bytes.length,sha256:hash(bytes)});
  assertManifestInventory(manifest);
  // Transient schema sample only. Deliberately not emitted, persisted or treated as a release.
  const approvedShape = structuredClone(catalog);
  approvedShape.contractStatus = 'approved';
  approvedShape.contractDecision = {id:'DEC-2026-032',status:'approved',on:'2026-10-14'};
  const release = approvedShape.releaseBinding;
  release.status = 'approved';
  release.releaseId = '2026-10-14-synthetic-schema-shape.1';
  release.approval = {approvedBy:'SYNTHETIC SHAPE ONLY',approvedOn:'2026-10-14',decisionRef:'synthetic-not-an-approval'};
  release.targetComponentRefs = [...new Map(catalog.holidayBindings.flatMap(binding=>binding.physicalBaseline.references)
    .map(({role,contentId,sha256})=>[contentId,{role,contentId,sha256}])).values()];
  release.sourceReviewRef = {id:'synthetic-review',sha256:'a'.repeat(64)};
  release.referenceSuiteRef = {id:'synthetic-reference-suite',sha256:'b'.repeat(64)};
  release.pathEligibility.forEach(entry=>{
    entry.status='approved';
    const holiday=catalog.holidayBindings.find(binding=>binding.holidayBindingId===entry.holidayBindingId);
    entry.targetComponentRefs=release.targetComponentRefs.filter(ref=>[holiday.physicalBaseline.calendarId,'ch-federal-calendar','ch-holiday-catalog'].includes(ref.contentId));
    entry.sourceReviewRef=release.sourceReviewRef;
    entry.referenceSuiteRef=release.referenceSuiteRef;
  });
  assertPromotionBindingShape(approvedShape);
  const withdrawnShape = structuredClone(approvedShape);
  withdrawnShape.contractStatus='withdrawn';
  withdrawnShape.contractDecision.status='withdrawn';
  withdrawnShape.releaseBinding.status='withdrawn';
  withdrawnShape.releaseBinding.pathEligibility.forEach(entry=>entry.status='withdrawn');
  assertPromotionBindingShape(withdrawnShape);
  const genericTwentyDayShape = structuredClone(catalog);
  genericTwentyDayShape.paths[0].duration.value = 20;
  const schemaSamples = [{id:'catalog-valid',schema:'catalog',value:catalog,valid:true},{id:'manifest-synthetic-candidate',schema:'manifest',value:manifest,valid:true},
    {id:'generic-statutory-20-days-schema-only',schema:'catalog',value:genericTwentyDayShape,valid:true},
    {id:'synthetic-approved-shape-not-release',schema:'catalog',value:approvedShape,valid:true},
    {id:'synthetic-withdrawn-shape-not-release',schema:'catalog',value:withdrawnShape,valid:true},
    {id:'old-format7-schema-rejects-new-manifest',schema:'oldManifest',value:manifest,valid:false}];
  const schemaMutation = (id,which,modify) => { const value = structuredClone(which === 'catalog' ? catalog : manifest); modify(value); schemaSamples.push({id,schema:which,value,valid:false}); };
  schemaMutation('unknown-root-field','catalog',c=>c.silentFallback='BE');
  schemaMutation('unknown-path-field','catalog',c=>c.paths[0].assumedPermission=true);
  schemaMutation('runtime-active','catalog',c=>c.runtimeActive=true);
  schemaMutation('invented-release-approval','catalog',c=>c.releaseBinding.releaseId=manifest.releaseId);
  schemaMutation('approved-without-decision-date','catalog',c=>c.contractStatus='approved');
  schemaMutation('approved-without-path-binding','catalog',c=>c.releaseBinding.status='approved');
  schemaMutation('free-statutory-days','catalog',c=>c.paths[0].duration.overridable=true);
  schemaMutation('ordered-days-over-365','catalog',c=>c.paths[2].duration.maximum=366);
  schemaMutation('party-role-required','catalog',c=>c.holidayBindings[0].legalBinding.partyOrRepresentativeRequired=true);
  schemaMutation('decision-as-source','catalog',c=>c.paths[0].sourceRefs[0].sourceId='DEC-2026-031');
  schemaMutation('manifest-old-min-consumer','manifest',m=>m.compatibility.minimumConsumerFormatVersion='7.0.0');
  schemaMutation('manifest-missing-catalog-inventory','manifest',m=>delete m.administrativeProcedureCatalogIds);
  schemaMutation('manifest-role-schema-mismatch','manifest',m=>m.artifacts.at(-1).schemaId=m.artifacts[0].schemaId);
  schemaMutation('manifest-unreviewed-approved','manifest',m=>m.releaseStatus='approved');
  const schemaResults = schemaBatch({catalog:schema,manifest:manifestSchema,oldManifest:await json('schemas/release-manifest-v7.schema.json')},schemaSamples);
  const manifestMutations = [
    ['missing-listed-artifact',m=>m.artifacts.pop()],
    ['duplicate-artifact-path',m=>m.artifacts[1].path=m.artifacts[0].path],
    ['duplicate-content-id',m=>m.artifacts[1].contentId=m.artifacts[0].contentId],
    ['path-traversal',m=>m.artifacts.at(-1).path='administrative-procedures/../elsewhere.json'],
    ['unlisted-new-calendar',m=>m.calendarIds.push('invented-calendar')]
  ];
  for(const [id,modify] of manifestMutations){const changed=structuredClone(manifest);modify(changed);assert.throws(()=>assertManifestInventory(changed),undefined,id);}
  const promotionMutations=[
    ['wrong-component-role',c=>{
      c.releaseBinding.targetComponentRefs.filter(ref=>ref.contentId!=='ch-holiday-catalog').forEach(ref=>ref.role='holidayCatalog');
      c.releaseBinding.pathEligibility.forEach(entry=>entry.targetComponentRefs.filter(ref=>ref.contentId!=='ch-holiday-catalog').forEach(ref=>ref.role='holidayCatalog'));
    }],
    ['missing-eligibility',c=>c.releaseBinding.pathEligibility.pop()],
    ['stale-path-hash',c=>c.releaseBinding.pathEligibility[0].pathSha256='0'.repeat(64)],
    ['stale-target-component-hash',c=>c.releaseBinding.pathEligibility[0].targetComponentRefs[0]={...c.releaseBinding.pathEligibility[0].targetComponentRefs[0],sha256:'0'.repeat(64)}],
    ['stale-suite-proof',c=>c.releaseBinding.pathEligibility[0].referenceSuiteRef={id:'stale',sha256:'c'.repeat(64)}],
    ['withdrawn-path-in-approved-shape',c=>c.releaseBinding.pathEligibility[0].status='withdrawn']
  ];
  for(const [id,modify] of promotionMutations){const changed=structuredClone(approvedShape);modify(changed);assert.throws(()=>assertPromotionBindingShape(changed),undefined,id);}
  const contractMutations = [
    ['pilot-statutory-20-days',c=>c.paths[0].duration.value=20],
    ['duplicate-path',c=>c.paths[1].pathId=c.paths[0].pathId],
    ['changed-stage',c=>c.paths[0].stages=['court']],
    ['wrong-law-suspension',c=>c.paths[0].suspensionProfileId='gr-three'],
    ['unknown-source',c=>c.paths[0].sourceRefs[0].sourceId='SRC-UNKNOWN'],
    ['removed-ti-guard',c=>c.paths[0].endShiftGuard='none'],
    ['invented-provisional-gr-exception',c=>c.paths[9].suspensionProfileId='gr-none'],
    ['extended-coverage',c=>c.paths[0].temporalBinding.caseCoverage.to='2028-12-31'],
    ['winter-does-not-cross-year',c=>c.suspensionProfiles[1].periods[2].end.yearOffset=0],
    ['wrong-holiday-binding',c=>c.paths[0].holidayBindingId='gr-authority-seat'],
    ['nw-positive-path',c=>c.paths.push({...c.paths[0],pathId:'nw-appeal',researchRef:'NW-APPEAL-20'})]
  ];
  for (const [id,modify] of contractMutations) { const changed = structuredClone(catalog); modify(changed); assert.throws(()=>assertCatalogContract(changed,research),undefined,id); }
  const base = {pathId:'ti-80-30',lawId:'lpamm-ti',authoritySeatCanton:'TI',authorityLevel:'cantonal',stage:'administrativeAppeal',triggerDate:'2026-10-02',actualDelivery:true,generalRoute:true,specialLaw:'excluded',explicitHolidayException:'none',urgency:'none',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false};
  const positive = probePlan(base,catalog);
  equal(positive.outcome,'referencePlan');
  equal(probePlan({...base,partyCanton:'BE',representativeCanton:'ZH'},catalog),positive);
  const inputMutations = [
    [{pathId:'unknown'},'unknownPath'],[{stage:'court'},'wrongStage'],[{authoritySeatCanton:'BE'},'authorityNotQualified'],
    [{authorityLevel:'municipal'},'authorityNotQualified'],[{actualDelivery:false},'routeNotQualified'],[{generalRoute:false},'routeNotQualified'],
    [{specialLaw:'federalSpecial'},'requiresSeparateReleasedFederalSpecialPath'],[{specialLaw:'unknown'},'specialLawUnresolved'],
    [{explicitHolidayException:'verified'},'requiresExplicitSeparateHolidayBinding'],[{explicitHolidayException:'unknown'},'holidayPolicyUnresolved'],
    [{orderedDays:30},'invalidDuration'],[{triggerDate:'2026-08-28'},'outsideCoverage'],[{triggerDate:'2027-02-30'},'invalidDate'],
    [{urgency:'unknown'},'urgencyNotQualified'],[{urgency:'explicitGRJudicialUrgencyOrder'},'urgencyOutsideScope'],
    [{fixedEndDate:true},'unsupportedProcedure'],[{evidenceAdvance:true},'unsupportedProcedure'],[{freeCalendarId:'be-public-holidays'},'invalidInputContract']
  ];
  inputMutations.forEach(([change,reason])=>equal(probePlan({...base,...change},catalog),{outcome:'blocked',reason,exportAllowed:false}));
  const gr = {...base,pathId:'gr-court-ordered',lawId:'vrg-gr',authoritySeatCanton:'GR',stage:'court',orderedDays:10,urgency:'explicitGRJudicialUrgencyOrder'};
  equal(probePlan(gr,catalog).suspensionProfileId,'gr-none');
  equal(probePlan({...gr,orderedDays:365},catalog).days,365);
  equal(probePlan({...gr,orderedDays:366},catalog).reason,'invalidDuration');
  const noDays = {...gr}; delete noDays.orderedDays;
  equal(probePlan(noDays,catalog).reason,'invalidDuration');
  equal(probeEvaluatedDay(catalog,'ti-80-30','2027-03-22',{endShift:true}),'endShiftIntoSuspensionUnresolved');
  equal(probeEvaluatedDay(catalog,'ti-provisional-15','2027-03-22',{endShift:true}),'referenceDayPermitted');
  equal(probeEvaluatedDay(catalog,'ti-80-30','2028-01-03',{endShift:true}),'outsideCoverage');
  equal(probeEvaluatedDay(catalog,'ti-80-30','2026-08-28'),'outsideCoverage');
  return {status:'passed',checkedOn:'2026-10-14',runtimeActive:false,productIntegrationTest:false,
    scope:'schema-and-cross-reference-contract-probe-not-release-or-legal-source-review',
    laws:catalog.laws.length,paths:catalog.paths.length,suspensionProfiles:catalog.suspensionProfiles.length,holidayBindings:catalog.holidayBindings.length,sources:catalog.sources.length,
    schemaProbes:schemaResults.length,negativeContractMutations:contractMutations.length,negativeInputMutations:inputMutations.length,negativePromotionBindingMutations:promotionMutations.length,negativeManifestInventoryMutations:manifestMutations.length,
    positivePlans:4,additionalDurationBoundaryChecks:2,evaluatedDayGuards:4,preservedFiles:preserved.length,
    fixtureSha256:hash(bytes),schemaSha256:hash(await read(schemaPath)),manifestSchemaSha256:hash(await read(manifestSchemaPath)),
    nodeVersion:process.version,preserved};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await runContractChecks(),null,2));
