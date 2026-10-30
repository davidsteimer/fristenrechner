// SPDX-License-Identifier: AGPL-3.0-only
// Isolated AP23F2 proposal validation. Never a product reader or export capability.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSchema } from '../src/core/schemaContract.ts';
import { administrativePeriodDate } from '../src/core/administrativeCatalog.ts';
import { assertAdministrativeProcedureCatalogV2 } from '../src/core/administrativeCatalogV2.ts';
import { parseFormat9Data, parseFormat9LocalReferenceData } from '../src/core/releaseFormat9.ts';
import { FORMAT7_SCHEMAS } from '../src/core/releaseFormat7.ts';
import { calculateAdministrativeDeadline } from '../src/core/administrativeDeadline.ts';
import { countDayDeadline } from '../src/core/dayDeadlineArithmetic.ts';
import { generateCalendarFromRules, calculateCalendarRuleOccurrence } from '../src/core/generateCalendar.ts';
import { addCalendarDays, parseIsoDate } from '../src/core/date.ts';
import { buildAP23F2Candidate, AP23F2_OUTPUT, AP23F2_ADMIN_PATH, AP23F2_RELEASE_ID } from './build-ap23f2-candidate.mjs';
import { buildAp23f2Schemas, AP23F2_SCHEMA_FILES } from './build-ap23f2-schemas.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = 'data/releases/2026-10-18-mvp-09-approved.1';
const reportFile = 'outputs/ap23f2-2026-10-22/QA-AP23F2.json';
const f1File = 'docs/fachrecht/ap23f1/referenzfaelle.json';
const read = p => readFile(resolve(root, p), 'utf8');
const json = async p => JSON.parse(await read(p));
const sha = text => createHash('sha256').update(text).digest('hex');
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const objSha = v => sha(JSON.stringify(canonical(v)));
const same = (a, b, why) => assert.deepEqual(a, b, why);
const closedMap = (rows, key) => {
  const map = new Map(rows.map(row => [row[key], row]));
  assert.equal(map.size, rows.length, `Duplicate ${key}`);
  return map;
};
const contains = (interval, date) => !!parseIsoDate(date) && interval.from <= date && (interval.to === null || date <= interval.to);
const refId = suffix => 'SRC-AP23F1-' + suffix;
const translatedStage = stage => ({ recourse: 'administrativeAppeal', vrk: 'court' }[stage] ?? stage);
const newWindow = { from: '2026-08-29', to: '2027-12-31' };
const calendarIds = { 'ZH-RLG': 'ap23f2-zh-rlg-nine', 'ZH-GOG': 'ap22-zh-5aa2974cffee',
  'AG-PROCEDURAL': 'ap22-ag-21d6f2634ce0', 'SG-VRP': 'ap22-sg-79009d6d6021' };

/** Independent expected mapping, derived from the accepted F1 routes, not builder constants. */
function expectedRequirements(source) {
  const action = source.id === 'AG-EXECUTION-10' ? 'executionAppeal'
    : source.id === 'SG-ADMIN-MEASURES-5' ? 'measuresAppeal'
    : source.id === 'SG-COURT-INTERIM-5' ? 'interimAppeal'
    : source.days === null ? 'proceduralSubmission' : 'ordinaryAppeal';
  const decisionKind = source.id === 'AG-EXECUTION-10' ? 'qualifiedAGVRPG83ExecutionOrder'
    : source.id === 'SG-ADMIN-MEASURES-5' ? 'qualifiedSGVRP44MeasuresOrder'
    : source.id === 'SG-COURT-INTERIM-5' ? 'qualifiedSGVRP60InterimOrder'
    : source.days === null ? 'notApplicable' : 'finalDecision';
  return { action, decisionKind, unit: 'day', opening: 'qualifiedCompleteActualDelivery', notice: 'uncontested',
    termChange: 'none', urgency: 'none',
    targetBody: source.id.startsWith('SG-VRK-') ? 'administrativeAppealsCommission'
      : source.stages.includes('court') ? 'administrativeCourt' : 'cantonAdministrativeAuthority',
    procedureMatter: source.id.startsWith('SG-VRK-') ? 'documentAccess' : 'generalAdministrative',
    channelCase: source.canton === 'ZH' ? 'ordinaryNoFictionNoOutage' : 'notApplicable',
    exceptionNotice: source.id === 'SG-COURT-INTERIM-5' ? 'correctExceptionNotice' : 'notApplicable' };
}
function expectedTimeline(source) {
  const zpo = refId('CH-ZPO-20260701');
  const make = (from, to, ids) => ({ interval: { from, to }, ids: ids.sort() });
  if (source.canton === 'ZH') {
    const ordinary = source.stages.includes('court')
      ? [refId('ZH-VRG-20260701'), refId('ZH-GOG-20260101'), zpo]
      : [refId('ZH-VRG-20260701'), refId('ZH-RLG-20040701')];
    return [make(newWindow.from, '2026-12-31', ordinary),
      make('2027-01-01', newWindow.to, [...ordinary, refId('ZH-VRG-REVISION-20270101'), refId('ZH-RRB715-2025')])];
  }
  if (source.canton === 'AG') return [make(newWindow.from, newWindow.to, [refId('AG-VRPG-20240701'), refId('AG-EGZPO-20220101'), zpo])];
  const extras = source.id.startsWith('SG-VRK-') ? [refId('SG-OEFFG-20230701')] : [];
  return [make(newWindow.from, '2027-05-31', [refId('SG-VRP-20240101'), refId('SG-RLG-20080122'), refId('SG-GERG-20180701'), zpo, ...extras]),
    make('2027-06-01', newWindow.to, [refId('SG-VRP-20240101'), refId('SG-RLG-20080122'), refId('SG-GERG-20270601'), zpo, ...extras])];
}
function expectedAction(source) {
  if (source.id === 'AG-EXECUTION-10') return 'execution-order-appeal';
  if (source.id === 'SG-ADMIN-MEASURES-5') return 'measures-appeal';
  if (source.id === 'SG-COURT-INTERIM-5') return 'interim-court-appeal';
  return source.days === null
    ? source.stages.some(s => ['court', 'vrk'].includes(s)) ? 'ordered-court-submission' : 'ordered-administrative-submission'
    : source.stages.some(s => ['court', 'vrk'].includes(s)) ? 'ordinary-court-appeal' : 'ordinary-administrative-appeal';
}

export function validateAP23F2Catalog(catalog, old, research, schemas, descriptors, files) {
  assertSchema(catalog, schemas.catalog);
  same(catalog.contractStatus, 'proposed');
  same(catalog.contractDecision, { id: 'DEC-2026-035', status: 'proposed', on: null });
  same(catalog.runtimeActive, false);
  const release = catalog.releaseBinding;
  same(release.status, 'candidate'); same(release.releaseId, null); same(release.approval, null);
  same(release.targetComponentRefs, []); same(release.sourceReviewRef, null); same(release.referenceSuiteRef, null);
  const paths = closedMap(catalog.paths, 'pathId'), policies = closedMap(catalog.qualificationPolicies, 'pathId');
  const eligibilities = closedMap(release.pathEligibility, 'pathId');
  const laws = closedMap(catalog.laws, 'lawId'), suspensions = closedMap(catalog.suspensionProfiles, 'suspensionProfileId');
  const holidays = closedMap(catalog.holidayBindings, 'holidayBindingId'), sources = closedMap(catalog.sources, 'sourceId');
  same([paths.size, policies.size, laws.size, suspensions.size, holidays.size, eligibilities.size], [42, 42, 8, 14, 9, 42]);
  const expectedIds = [...old.paths.map(p => p.pathId), ...research.paths.map(p => p.id.toLowerCase())].sort();
  same([...paths.keys()].sort(), expectedIds); same([...policies.keys()].sort(), expectedIds); same([...eligibilities.keys()].sort(), expectedIds);
  for (const [field, key] of [['paths','pathId'], ['qualificationPolicies','pathId'], ['laws','lawId'],
    ['sources','sourceId'], ['suspensionProfiles','suspensionProfileId'], ['excludedPaths','exclusionId']]) {
    const rows = closedMap(catalog[field], key);
    for (const row of old[field]) same(rows.get(row[key]), row, `Changed accepted ${field}/${row[key]}`);
  }
  const refs = values => {
    assert.ok(values.length > 0); const ids = new Set();
    for (const ref of values) { assert.ok(sources.has(ref.sourceId)); assert.ok(ref.locator.trim()); assert.ok(!ids.has(JSON.stringify(ref))); ids.add(JSON.stringify(ref)); }
  };
  const priorBindings = closedMap(old.holidayBindings, 'holidayBindingId');
  for (const binding of holidays.values()) {
    const prior = priorBindings.get(binding.holidayBindingId);
    if (prior) same(binding, prior, `Existing holiday use changed ${binding.holidayBindingId}`);
    const law = laws.get(binding.lawId); assert.ok(law);
    same(law.canton, binding.authoritySeatCanton); same(binding.authorityLevel, 'cantonal'); same(binding.anchor, 'authoritySeat');
    same(binding.legalBinding.roleUnion, false); same(binding.legalBinding.partyOrRepresentativeRequired, false); refs(binding.legalBinding.sourceRefs);
    const ids = binding.physicalBaseline.references.map(r => r.contentId).sort();
    same(ids, [binding.physicalBaseline.calendarId, 'ch-federal-calendar', 'ch-holiday-catalog'].sort());
    for (const ref of binding.physicalBaseline.references) {
      const d = descriptors.get(ref.contentId); assert.ok(d);
      same(ref, { role: d.role, contentId: d.contentId, sha256: d.sha256, path: d.path });
    }
    const calendar = JSON.parse(files.get(descriptors.get(binding.physicalBaseline.calendarId).path));
    same(calendar.jurisdiction.code, law.canton);
    if (binding.physicalBaseline.calendarId === calendarIds['ZH-RLG']) {
      same(binding.physicalBaseline.releaseId, AP23F2_RELEASE_ID);
      same(binding.projectionEvidence.kind, 'localStructuralProjection');
      same(binding.projectionEvidence.sourceReleaseId, '2026-10-18-mvp-09-approved.1');
      same(binding.projectionEvidence.sourceCatalogSha256, descriptors.get('ch-holiday-catalog').sha256);
      const selected = binding.projectionEvidence.selectedRuleIds;
      const exactSelection = ['NEW-YEAR','GOOD-FRIDAY','EASTER-MONDAY','ASCENSION','WHIT-MONDAY','NATIONAL-DAY','CHRISTMAS','ST-STEPHEN','MAY1'].map(s=>'ZH-RLG-ALL-DAY-'+s);
      same([...selected].sort(), exactSelection.sort()); same(new Set(selected).size, 9);
      const sourceCatalog = JSON.parse(files.get(descriptors.get('ch-holiday-catalog').path));
      for (const id of selected) {
        const sourceRule = sourceCatalog.data.rules.find(r => r.id === id);
        assert.ok(sourceRule, `Missing catalogue rule ${id}`);
        assert.ok(JSON.stringify(sourceRule).includes('ZH-RLG-ALL'), `Wrong ZH rule scope ${id}`);
        const projected = calendar.rules.find(r=>r.effect.resultIdSuffix===id);
        assert.ok(projected, `Missing projected rule ${id}`);
        same(projected.calculation, sourceRule.calculation); same(projected.condition, sourceRule.condition);
        same(projected.validity, {from:sourceRule.from,to:sourceRule.to}); same(projected.priority,sourceRule.priority);
        same(projected.labels,{de:sourceRule.de,fr:sourceRule.fr});
        same(projected.sourceRefs,[{sourceId:sourceRule.source,locator:sourceRule.locator}]);
        same(projected.effect.legalEffect,'nonWorkingDayEquivalentToSunday');
        same(projected.effect.kind,id.endsWith('NATIONAL-DAY')?'federalHoliday':'cantonalPublicHoliday');
      }
      same(calendar.rules.length, 9); assert.ok(calendar.rules.every(r => r.ruleId.startsWith('ZH-CAL-AP23F2-')));
      assert.ok(!calendar.rules.some(r => r.calculation.type === 'fixedMonthDay' && r.calculation.month === 1 && r.calculation.day === 2));
    } else same(binding.physicalBaseline.releaseId, '2026-10-18-mvp-09-approved.1');
  }
  const oldIds = new Set(old.paths.map(p => p.pathId));
  for (const path of paths.values()) {
    const policy = policies.get(path.pathId), entry = eligibilities.get(path.pathId);
    same(policy.pathRevision, path.revision); same(policy.pathSha256, objSha(path));
    same(entry.pathRevision, path.revision); same(entry.pathSha256, objSha(path));
    same(entry.qualificationPolicySha256, objSha(policy)); same(entry.status, 'candidate');
    same(entry.targetComponentRefs, []); same(entry.sourceReviewRef, null); same(entry.referenceSuiteRef, null);
    const holiday = holidays.get(path.holidayBindingId), suspension = suspensions.get(path.suspensionProfileId), law = laws.get(path.lawId);
    assert.ok(holiday && suspension && law); same(holiday.lawId, path.lawId); same(suspension.lawId, path.lawId);
    same(entry.holidayBindingId, holiday.holidayBindingId); same(entry.holidayBindingSha256, objSha(holiday));
    same(entry.suspensionProfileId, suspension.suspensionProfileId); same(entry.suspensionProfileSha256, objSha(suspension));
    same(entry.caseCoverage, path.temporalBinding.caseCoverage); same(entry.calculationCoverage, path.temporalBinding.calculationCoverage);
    if (oldIds.has(path.pathId)) continue;
    const source = research.paths.find(p => p.id.toLowerCase() === path.pathId); assert.ok(source);
    same(path.revision, 1); same(path.researchRef, source.id); same(path.action, expectedAction(source));
    same(path.stages, source.stages.map(translatedStage)); same(law.canton, source.canton);
    same(holiday.physicalBaseline.calendarId, calendarIds[source.calendar]);
    same(path.duration, source.days === null
      ? { kind: 'authorityOrderedDays', minimum: 1, maximum: 365, boundMeaning: 'technicalSafetyLimitNotLegalMaximum' }
      : { kind: 'statutoryDays', value: source.days, overridable: false });
    same(path.urgencyPolicy, 'notApplicable'); same(path.endShiftPolicy, 'nextWorkingDay');
    same(path.endShiftGuard, source.suspension === 'three' ? 'blockWhenEnteringApplicableSuspension' : 'none');
    same(suspension.periods.length, source.suspension === 'three' ? 3 : 0);
    for (const year of [2026, 2027]) if (source.suspension === 'three') {
      const easter = research.easter[year];
      same(suspension.periods.map(p => [administrativePeriodDate(p.start, year), administrativePeriodDate(p.end, year)]).sort(),
        [[addCalendarDays(easter, -7), addCalendarDays(easter, 7)], [`${year}-07-15`, `${year}-08-15`], [`${year}-12-18`, `${year + 1}-01-02`]].sort());
    }
    for (const k of ['caseCoverage','calculationCoverage','sourceCoverage']) same(path.temporalBinding[k], newWindow);
    assert.equal(Object.hasOwn(path.temporalBinding, 'normVersionCoverage'), false);
    same(path.temporalBinding.evaluation, 'eachEvaluatedDayIncludingEndShift');
    const timeline = expectedTimeline(source);
    same(path.normTimeline.length, timeline.length);
    for (let n = 0; n < timeline.length; n++) {
      same(path.normTimeline[n].interval, timeline[n].interval); refs(path.normTimeline[n].sourceRefs);
      same(path.normTimeline[n].sourceRefs.map(r => r.sourceId).sort(), timeline[n].ids);
      if (n) same(addCalendarDays(path.normTimeline[n - 1].interval.to, 1), path.normTimeline[n].interval.from);
    }
    const expectedPathSourceIds=[...new Set(timeline.flatMap(t=>t.ids))];
    if(source.id==='AG-EXECUTION-10')expectedPathSourceIds.push(refId('AG-WBE2024299-20250331'));
    same(path.sourceRefs.map(r=>r.sourceId).sort(),expectedPathSourceIds.sort());
    same(policy.mode, 'qualifiedDayProcedureV3'); same(policy.requirements, expectedRequirements(source));
    refs(path.sourceRefs);
  }
  same([...paths.values()].filter(p => !oldIds.has(p.pathId) && p.endShiftGuard === 'blockWhenEnteringApplicableSuspension').length, 9);
  return true;
}

const blocked = (reason, category = 'qualificationBoundaryProposed', details = {}) =>
  ({ outcome: 'blocked', category, reason, exportAllowed: false, ...details });
/** Native isolated V3 proposal evaluator. Does not register a runtime context. */
export function evaluateAP23F2(input, catalog, calendars, inputSchema) {
  try { assertSchema(input, inputSchema); } catch { return blocked('inputContractInvalid'); }
  const path = catalog.paths.find(p => p.pathId === input.path);
  if (!path) return blocked('unknownPath');
  const policy = catalog.qualificationPolicies.find(p => p.pathId === path.pathId);
  if (policy?.mode !== 'qualifiedDayProcedureV3') return blocked('oldPathNeedsUnchangedNativeReader');
  const q = policy.requirements;
  if (path.revision !== input.pathRevision) return blocked('pathRevisionMismatch');
  if (!path.stages.includes(input.stage)) return blocked('stageDoesNotMatchPath');
  for (const key of Object.keys(q)) if (input[key] !== q[key]) return blocked('unqualified:' + key);
  if (input.direction !== 'forward' || input.authorityLevel !== 'cantonal') return blocked('unsupportedDirectionOrAuthority');
  if (input.holidayAnchor !== 'qualifiedTargetAuthority' || input.explicitHolidayException !== 'none') return blocked('holidayAnchorNotQualified');
  const law = catalog.laws.find(p => p.lawId === path.lawId);
  if (input.authoritySeatCanton !== law.canton) return blocked('authoritySeatMismatch');
  if (input.specialLaw !== 'excluded' || input.fixedEndDate || input.deviatingStart) return blocked('specialOrUnsupportedProcedure');
  if (path.duration.kind === 'statutoryDays' && input.days !== path.duration.value) return blocked('statutoryDurationMismatch');
  if (path.duration.kind === 'authorityOrderedDays' && (input.days < path.duration.minimum || input.days > path.duration.maximum)) return blocked('orderedDurationOutsideSafetyRange');
  const holiday = catalog.holidayBindings.find(b => b.holidayBindingId === path.holidayBindingId);
  const calendar = calendars.find(c => c.calendarId === holiday.physicalBaseline.calendarId);
  const intervals = [path.temporalBinding.caseCoverage, path.temporalBinding.calculationCoverage,
    path.temporalBinding.sourceCoverage, calendar.validity];
  const normMatches = d => path.normTimeline.filter(n => contains(n.interval, d));
  const covered = d => intervals.every(i => contains(i, d)) && normMatches(d).length === 1;
  if (!covered(input.trigger)) return blocked('outsideReferenceWindow', 'researchWindowBoundary');
  const range = path.temporalBinding.calculationCoverage;
  const generated = generateCalendarFromRules(calendars, calendar.calendarId, range);
  const byDate = new Map();
  for (const h of generated.calendar.holidays) byDate.set(h.date, [...(byDate.get(h.date) ?? []), h]);
  const suspension = catalog.suspensionProfiles.find(s => s.suspensionProfileId === path.suspensionProfileId);
  const periods = [];
  for (let year = Number(range.from.slice(0, 4)) - 1; year <= Number(range.to.slice(0, 4)); year++)
    for (const p of suspension.periods) periods.push({ periodId: `${p.periodId}-${year}`,
      startsOn: administrativePeriodDate(p.start, year), endsOn: administrativePeriodDate(p.end, year) });
  const result = countDayDeadline({ legallyRelevantDate: input.trigger, deadlineDays: input.days,
    periods, shiftStartDuringSuspension: true, holidaysByDate: byDate, isCovered: covered,
    blockEndShiftIntoSuspension: path.endShiftGuard === 'blockWhenEnteringApplicableSuspension' });
  if (result.outcome === 'blocked') return blocked(result.reason,
    result.reason === 'endShiftIntoSuspensionUnresolved' ? 'unresolvedBoundaryProposed' : 'researchWindowBoundary',
    { nominalEnd: result.provisionalEnd, blockedDate: result.blockedDate });
  return { outcome: 'reference', category: 'datedResearchValue', end: result.finalEnd, nominalEnd: result.provisionalEnd,
    firstCountedDay: result.countedDates[0], skippedDays: result.skippedCalendarDays,
    normIntervals: path.normTimeline.filter(n => n.interval.to >= input.trigger && n.interval.from <= result.finalEnd).map(n => n.interval),
    exportAllowed: false };
}

/** Complete synthetic facts only for the accepted research fixture, never application defaults. */
function adaptF1(item, research) {
  const source = research.paths.find(p => p.id === item.path);
  if (!source) return { ...adaptF1(research.cases.find(c => c.id === 'ZH01'), research), path: 'unknown', trigger: item.trigger, days: item.days };
  const q = expectedRequirements(source);
  const input = { path: source.id.toLowerCase(), pathRevision: 1, stage: translatedStage(source.stages[0]),
    authoritySeatCanton: source.canton, trigger: item.trigger, days: item.days, ...q, direction: 'forward',
    specialLaw: 'excluded', authorityLevel: 'cantonal', holidayAnchor: 'qualifiedTargetAuthority',
    explicitHolidayException: 'none', fixedEndDate: false, deviatingStart: false };
  const facts = item.facts ?? {};
  for (const [key, value] of Object.entries(facts)) {
    if (key === 'stage') input.stage = translatedStage(value);
    else if (key === 'qualification') input.decisionKind = 'unknown';
    else if (key === 'paymentOrMaterialPerformance') { if (value) input.action = 'payment'; }
    else if (key === 'opening') input.opening = value === 'completeLegalTriggerKnown' ? q.opening : value === 'electronicFictionUnresolved' ? 'fiction' : value;
    else if (key === 'specialLaw') input.specialLaw = value === 'taxProcedure' ? 'tax' : value;
    else if (key === 'zh2027ChannelCase') input.channelCase = value;
    else if (key === 'notice') { input.notice = value; if (source.id === 'SG-COURT-INTERIM-5') input.exceptionNotice = value; }
    else if (key === 'termChange') input.termChange = value === 'restored' ? 'reinstatement' : value;
    else if (key === 'holidayAnchor') input.holidayAnchor = value === 'partyOrRepresentativeSeat' ? 'party' : value;
    else if (key === 'subject') input.procedureMatter = value;
    else if (key !== 'partyOrRepresentativeCanton') input[key] = value;
  }
  return input;
}

export async function runAP23F2() {
  const candidate = await buildAP23F2Candidate();
  const generated = await buildAp23f2Schemas();
  const schemas = generated.schemas ?? generated;
  for (const [key, path] of Object.entries(AP23F2_SCHEMA_FILES)) same(await json(path), schemas[key], `Schema reproducibility ${key}`);
  const research = await json(f1File);
  const oldManifest = await json(`${baseline}/manifest.json`), old = await json(`${baseline}/${AP23F2_ADMIN_PATH}`);
  const baselineFiles = new Map();
  for (const d of oldManifest.artifacts) {
    const text = await read(`${baseline}/${d.path}`); same(sha(text), d.sha256); same(Buffer.byteLength(text), d.byteLength); baselineFiles.set(d.path, text);
  }
  const manifestPath = `${AP23F2_OUTPUT}/bundle/manifest.json`;
  const manifest = await json(manifestPath), catalog = await json(`${AP23F2_OUTPUT}/bundle/${AP23F2_ADMIN_PATH}`);
  same(catalog, candidate.catalog, 'Candidate rebuild catalog'); same(manifest, candidate.manifest, 'Candidate rebuild manifest');
  same(manifest.releaseStatus, 'candidate'); same(manifest.formatVersion, '10.0.0');
  same(manifest.compatibility.minimumConsumerFormatVersion, '10.0.0');
  assertSchema(manifest, schemas.localManifest); assert.throws(() => assertSchema(manifest, schemas.manifest));
  same(manifest.artifacts.length, 42); same(manifest.calendarIds.length, 33);
  const descriptors = closedMap(manifest.artifacts, 'contentId'), files = new Map();
  let unchangedArtifactBytes = 0;
  for (const d of manifest.artifacts) {
    const text = await read(`${AP23F2_OUTPUT}/bundle/${d.path}`); same(sha(text), d.sha256); same(Buffer.byteLength(text), d.byteLength);
    same(text, candidate.files.get(d.path), `Rebuild artifact ${d.path}`); files.set(d.path, text);
    if (d.path !== AP23F2_ADMIN_PATH && d.contentId !== calendarIds['ZH-RLG']) { same(text, baselineFiles.get(d.path), `Old raw artifact ${d.path}`); unchangedArtifactBytes++; }
  }
  same(unchangedArtifactBytes, 40);
  assertSchema(JSON.parse(files.get(descriptors.get(calendarIds['ZH-RLG']).path)),await json('schemas/calendar-rules-v3.schema.json'),FORMAT7_SCHEMAS);
  validateAP23F2Catalog(catalog, old, research, schemas, descriptors, files);
  const calendars = [...files.values()].map(JSON.parse).filter(d => d.dataKind === 'calendar'); same(calendars.length, 33);
  // Construction probes deliberately do not grant a case outside coverage.
  // The physical rule occurrences, including inherited federal holidays, are
  // taken from actual candidate bytes rather than copied F1 calendar lists.
  const constructionDates=(id,year,seen=new Set())=>{
    if(seen.has(id))return new Set();seen.add(id);
    const c=calendars.find(c=>c.calendarId===id);assert.ok(c);
    const dates=new Set(c.rules.filter(r=>r.effect.type==='holiday').map(r=>{
      same(r.condition,'always');return calculateCalendarRuleOccurrence(r.calculation,year,r.ruleId).date;
    }));
    for(const parent of c.inherits)for(const d of constructionDates(parent,year,seen))dates.add(d);
    return dates;
  };
  const calendarProbeResults=research.calendarProbes.map(probe=>{
    const actual=constructionDates(calendarIds[probe.calendar],Number(probe.date.slice(0,4))).has(probe.date);
    same(actual,probe.isHoliday,`Physical construction probe ${probe.calendar}/${probe.date}`);
    return{...probe,actual,caseEligibility:false};
  });
  const results = research.cases.map(item => {
    const input = adaptF1(item, research), result = evaluateAP23F2(input, catalog, calendars, schemas.input);
    same(result.category, item.expected.outcome, `F1 classification ${item.id}`); same(result.exportAllowed, false);
    if (item.expected.outcome === 'datedResearchValue') for (const key of ['end','nominalEnd','firstCountedDay','skippedDays'])
      if (Object.hasOwn(item.expected, key)) same(result[key], item.expected[key], `${item.id}/${key}`);
    if (item.expected.outcome === 'unresolvedBoundaryProposed') { same(result.nominalEnd, item.expected.nominalEnd); same(result.reason, 'endShiftIntoSuspensionUnresolved'); }
    return { id: item.id, expectedCategory: item.expected.outcome, syntheticInput: input, ...result };
  });
  same(results.filter(r => r.outcome === 'reference').length, 52);
  same(results.filter(r => r.category === 'unresolvedBoundaryProposed').length, 3);
  same(results.filter(r => r.category === 'qualificationBoundaryProposed').length, 20);
  same(results.filter(r => r.category === 'researchWindowBoundary').length, 5);
  for (const source of research.paths) assert.ok(results.some(r => r.outcome === 'reference' && r.syntheticInput.path === source.id.toLowerCase()));

  const mutations = [], inputMutations = [], readerNegatives = [];
  const pathOf = (c,id) => c.paths.find(p => p.pathId === id);
  const policyOf = (c,id) => c.qualificationPolicies.find(p => p.pathId === id);
  const rebind = (c,id) => {
    const p = pathOf(c,id), q = policyOf(c,id), e = c.releaseBinding.pathEligibility.find(x => x.pathId === id);
    q.pathSha256 = objSha(p); e.pathSha256 = objSha(p); e.qualificationPolicySha256 = objSha(q);
    const h = c.holidayBindings.find(x => x.holidayBindingId === p.holidayBindingId), s = c.suspensionProfiles.find(x => x.suspensionProfileId === p.suspensionProfileId);
    e.holidayBindingId = h.holidayBindingId; e.holidayBindingSha256 = objSha(h); e.suspensionProfileId = s.suspensionProfileId; e.suspensionProfileSha256 = objSha(s);
    e.caseCoverage = structuredClone(p.temporalBinding.caseCoverage); e.calculationCoverage = structuredClone(p.temporalBinding.calculationCoverage);
  };
  const invalid = (id, edit) => { const c = structuredClone(catalog); edit(c); assert.throws(() => validateAP23F2Catalog(c, old, research, schemas, descriptors, files), undefined, id); mutations.push(id); };
  const alteredPath = (id, field, value) => invalid(`${id}:${field}`, c => { pathOf(c,id)[field] = value; rebind(c,id); });
  const alteredPolicy = (id, field, value) => invalid(`${id}:requirements.${field}`, c => { policyOf(c,id).requirements[field] = value; rebind(c,id); });
  invalid('missing-path', c => c.paths.pop()); invalid('missing-policy', c => c.qualificationPolicies.pop());
  invalid('duplicate-policy', c => c.qualificationPolicies.push(c.qualificationPolicies[0]));
  invalid('forged-runtime-active', c => { c.runtimeActive = true; });
  invalid('forged-contract-approval', c => { c.contractStatus = 'approved'; c.contractDecision.status = 'approved'; c.contractDecision.on = '2026-10-22'; });
  invalid('forged-release-approval', c => { c.releaseBinding.status = 'approved'; c.releaseBinding.releaseId = AP23F2_RELEASE_ID; });
  invalid('alter-existing-path-hash-consistent', c => { const p=c.paths.find(p=>p.pathId==='ar-execution-5'); p.duration.value=10; rebind(c,p.pathId); });
  invalid('alter-existing-policy-hash-consistent', c => { policyOf(c,'lu-admin-30').requirements.notice='unknown'; rebind(c,'lu-admin-30'); });
  alteredPolicy('ag-execution-10','decisionKind','qualifiedVRPGArt63Order');
  alteredPolicy('sg-admin-measures-5','decisionKind','qualifiedSGVRP60InterimOrder');
  alteredPolicy('sg-court-interim-5','action','ordinaryAppeal');
  alteredPolicy('sg-court-interim-5','exceptionNotice','notApplicable');
  alteredPolicy('sg-admin-14','exceptionNotice','correctExceptionNotice');
  alteredPolicy('sg-vrk-14','targetBody','administrativeCourt');
  alteredPolicy('sg-vrk-ordered','procedureMatter','generalAdministrative');
  alteredPolicy('sg-court-14','targetBody','administrativeAppealsCommission');
  alteredPolicy('zh-rekurs-30','channelCase','notApplicable');
  alteredPath('ag-execution-10','duration',{kind:'statutoryDays',value:5,overridable:false});
  alteredPath('zh-court-30','endShiftGuard','none'); alteredPath('ag-court-30','endShiftGuard','none'); alteredPath('sg-court-ordered','endShiftGuard','none');
  alteredPath('sg-admin-14','endShiftGuard','blockWhenEnteringApplicableSuspension');
  alteredPath('sg-court-interim-5','suspensionProfileId',pathOf(catalog,'sg-court-14').suspensionProfileId);
  alteredPath('sg-vrk-14','stages',['administration']);
  invalid('new-path-legacy-bypass', c => { const q=policyOf(c,'ag-execution-10'); delete q.requirements; q.mode='legacyV1'; q.baseline=structuredClone(c.qualificationPolicies.find(x=>x.mode==='legacyV1').baseline); rebind(c,q.pathId); });
  for (const [id, edit] of [
    ['zh-timeline-gap', p=>{p.normTimeline[1].interval.from='2027-01-02';}],
    ['zh-timeline-overlap', p=>{p.normTimeline[1].interval.from='2026-12-31';}],
    ['zh-wrong-stichtag', p=>{p.normTimeline[0].interval.to='2026-11-30';p.normTimeline[1].interval.from='2026-12-01';}],
    ['zh-foreign-timeline-source', p=>{p.normTimeline[1].sourceRefs[0].sourceId=refId('SG-VRP-20240101');}],
    ['zh-drop-revision-source', p=>{p.normTimeline[1].sourceRefs=p.normTimeline[1].sourceRefs.filter(r=>r.sourceId!==refId('ZH-VRG-REVISION-20270101'));}],
    ['zh-old-scalar-added', p=>{p.temporalBinding.normVersionCoverage=structuredClone(newWindow);}],
    ['broaden-reference-window',p=>{p.temporalBinding.caseCoverage.to='2028-12-31';p.temporalBinding.calculationCoverage.to='2028-12-31';}]
  ]) invalid(id,c=>{const p=pathOf(c,'zh-court-30');edit(p);rebind(c,p.pathId);});
  invalid('sg-wrong-gerg-stichtag', c=>{const p=pathOf(c,'sg-court-14');p.normTimeline[0].interval.to='2027-06-30';p.normTimeline[1].interval.from='2027-07-01';rebind(c,p.pathId);});
  invalid('sg-old-gerg-after-stichtag',c=>{const p=pathOf(c,'sg-court-14');p.normTimeline[1].sourceRefs=p.normTimeline[0].sourceRefs;rebind(c,p.pathId);});
  invalid('sg-vrk-omit-oeffg-source',c=>{const p=pathOf(c,'sg-vrk-14');p.normTimeline[0].sourceRefs=p.normTimeline[0].sourceRefs.filter(r=>r.sourceId!==refId('SG-OEFFG-20230701'));rebind(c,p.pathId);});
  invalid('sg-incorrect-jan2-calendar',c=>{const h=c.holidayBindings.find(x=>x.holidayBindingId==='sg-authority-seat');const d=descriptors.get('ap22-sg-f95068e3b162');h.physicalBaseline.calendarId=d.contentId;h.physicalBaseline.references=h.physicalBaseline.references.filter(x=>x.contentId!=='ap22-sg-79009d6d6021');h.physicalBaseline.references.push({role:d.role,contentId:d.contentId,path:d.path,sha256:d.sha256});for(const p of c.paths.filter(p=>p.holidayBindingId===h.holidayBindingId))rebind(c,p.pathId);});
  invalid('zh-wrong-scope-projection',c=>{const h=c.holidayBindings.find(x=>x.holidayBindingId==='zh-administration-authority-seat');h.projectionEvidence.selectedRuleIds[0]='unknown-rule';for(const p of c.paths.filter(p=>p.holidayBindingId===h.holidayBindingId))rebind(c,p.pathId);});
  invalid('foreign-existing-exclusion',c=>{c.excludedPaths[0].reason='Now included without review';});

  const positive = adaptF1(research.cases.find(c=>c.id==='AG01'),research);
  for (const key of Object.keys(positive)) { const input={...positive};delete input[key]; same(evaluateAP23F2(input,catalog,calendars,schemas.input).outcome,'blocked',`missing:${key}`);inputMutations.push(`missing:${key}`); }
  for (const [key,value] of [['pathRevision',2],['authoritySeatCanton','BE'],['direction','backward'],['holidayAnchor','party'],['explicitHolidayException','present'],['notice','missing'],['termChange','extension'],['urgency','shortened'],['action','payment'],['decisionKind','interimDecision'],['opening','dispositiveOnly'],['specialLaw','unknown'],['trigger','2026-02-30'],['days',29],['targetBody','administrativeCourt'],['procedureMatter','documentAccess'],['channelCase','ordinaryNoFictionNoOutage'],['exceptionNotice','correctExceptionNotice'],['unrecognisedFact',true]]) {
    same(evaluateAP23F2({...positive,[key]:value},catalog,calendars,schemas.input).outcome,'blocked',key);inputMutations.push(`changed:${key}`);
  }
  // Missing/unknown future norm coverage is checked for every evaluated day, not only receipt.
  const gapCatalog=structuredClone(catalog);pathOf(gapCatalog,'zh-court-30').normTimeline[1].interval.from='2027-01-04';
  const acrossRevision=adaptF1(research.cases.find(c=>c.id==='ZH12'),research);
  same(evaluateAP23F2(acrossRevision,gapCatalog,calendars,schemas.input).category,'researchWindowBoundary');inputMutations.push('evaluated-day-gap-after-receipt');
  const overlapCatalog=structuredClone(catalog);pathOf(overlapCatalog,'zh-court-30').normTimeline[1].interval.from='2026-12-31';
  same(evaluateAP23F2(acrossRevision,overlapCatalog,calendars,schemas.input).category,'researchWindowBoundary');inputMutations.push('evaluated-day-overlap-after-receipt');

  const runtime = parseFormat9Data(await read(`${baseline}/manifest.json`), baselineFiles);
  assert.throws(()=>assertAdministrativeProcedureCatalogV2(catalog)); readerNegatives.push('native-v2-catalog-rejects-v3');
  for (const [id, reader] of [['approved-format9',parseFormat9Data],['local-format9',parseFormat9LocalReferenceData]]) {
    assert.throws(()=>reader(JSON.stringify(manifest),files));readerNegatives.push(id+'-rejects-format10');
  }
  const relabelled=structuredClone(manifest), forgedCatalog=structuredClone(catalog), forgedFiles=new Map(files);
  const oldLocal=await json('schemas/implementation/ap23e3/local-reference-manifest-v9.schema.json');
  relabelled.$schema=oldLocal.$id;relabelled.formatVersion='9.0.0';relabelled.compatibility.minimumConsumerFormatVersion='9.0.0';
  forgedCatalog.$schema=old.$schema;forgedCatalog.formatVersion='2.0.0';forgedCatalog.contractStatus='approved';forgedCatalog.contractDecision={id:'DEC-2026-033',status:'approved',on:'2026-10-18'};
  const forgedText=JSON.stringify(forgedCatalog,null,2)+'\n';forgedFiles.set(AP23F2_ADMIN_PATH,forgedText);
  const d=relabelled.artifacts.find(x=>x.path===AP23F2_ADMIN_PATH);d.schemaId=old.$schema;d.sha256=sha(forgedText);d.byteLength=Buffer.byteLength(forgedText);
  assert.throws(()=>parseFormat9LocalReferenceData(JSON.stringify(relabelled),forgedFiles));readerNegatives.push('hash-consistent-relabel-and-fake-approval-rejected');
  // Remove the additional calendar only to isolate the old schema inventory
  // from the genuinely new catalog semantics. This is an in-memory negative
  // specimen, never a stored downgrade or runtime bridge.
  const inventoryCompatible=structuredClone(relabelled), inventoryFiles=new Map(forgedFiles);
  inventoryCompatible.calendarIds=structuredClone(oldManifest.calendarIds);
  inventoryCompatible.artifacts=inventoryCompatible.artifacts.filter(d=>d.contentId!==calendarIds['ZH-RLG']);
  inventoryFiles.delete(descriptors.get(calendarIds['ZH-RLG']).path);
  assertSchema(inventoryCompatible,oldLocal);
  assert.throws(()=>assertAdministrativeProcedureCatalogV2(forgedCatalog));
  assert.throws(()=>parseFormat9LocalReferenceData(JSON.stringify(inventoryCompatible),inventoryFiles));
  readerNegatives.push('old-inventory-schema-valid-relabelled-v3-still-rejected');
  const fakeContexts=[{catalog,manifest},structuredClone(runtime),JSON.parse(JSON.stringify(runtime))];
  const legacyReferences=old.paths.map(path=>{
    const q=old.qualificationPolicies.find(q=>q.pathId===path.pathId);
    const input={selection:{kind:'cantonalAdministrative',lawId:path.lawId,pathId:path.pathId,revision:path.revision,stage:path.stages[0]},authoritySeat:{canton:old.laws.find(l=>l.lawId===path.lawId).canton,level:'cantonal',qualification:'competentAuthorityForCurrentAction'},inputDate:'2026-10-16',deadlineDays:path.duration.kind==='statutoryDays'?path.duration.value:10,qualification:{delivery:'qualifiedActualDelivery',generalRoute:'qualified',specialLaw:'excluded',explicitHolidayException:'none',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},urgency:'none'};
    if(q.mode==='qualifiedDayProcedure') {const {action,decisionKind,unit,opening,notice,termChange}=q.requirements;input.caseQualification={action,decisionKind,unit,direction:'forward',opening,notice,termChange};}
    const actual=calculateAdministrativeDeadline(input,runtime);same(actual.outcome,'calculated',path.pathId);
    for(const fake of fakeContexts)same(calculateAdministrativeDeadline(input,fake).outcome,'blocked','Forged capability');
    return{pathId:path.pathId,end:actual.finalEnd,forgedContextsBlocked:fakeContexts.length};
  });
  readerNegatives.push('fake-copied-serialized-contexts-blocked-for-25-old-paths');
  const accepted=await read('docs/fachrecht/abnahme-ap23f1.md');
  const acceptedFiles=[...accepted.matchAll(/\| `([^`]+)` \| `([a-f0-9]{64})` \|/g)];
  same(acceptedFiles.length,11);
  for(const [,path,expected]of acceptedFiles)same(sha(await readFile(resolve(root,path))),expected,`Accepted F1 bytes ${path}`);
  const evidencePaths=['scripts/check-ap23f2-contract.mjs','scripts/build-ap23f2-candidate.mjs','scripts/build-ap23f2-schemas.mjs',
    'docs/fachrecht/abnahme-ap23f1.md',f1File,...Object.values(AP23F2_SCHEMA_FILES),manifestPath,
    `${AP23F2_OUTPUT}/bundle/${AP23F2_ADMIN_PATH}`,`${AP23F2_OUTPUT}/candidate-integrity.json`];
  const evidence=await Promise.all(evidencePaths.map(async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:sha(bytes)};}));
  return {status:'passed',workPackage:'AP23F2',contractStatus:'proposed',runtimeActive:false,productIntegrationTest:false,
    sourceReleaseApproved:false,calendarExportEnabled:false,sourceReview:'accepted-F1-content-not-combined-release-review',
    paths:42,unchangedLegacyPaths:25,newPaths:17,laws:8,suspensionProfiles:14,holidayBindings:9,calendars:33,artifactFiles:42,
    unchangedArtifactBytes,referenceCases:results.length,datedCases:52,unresolvedF1O1Cases:3,qualificationBoundaryCases:20,windowBoundaryCases:5,
    negativeCatalogMutations:mutations.length,negativeInputMutations:inputMutations.length,readerNegatives,legacyReferences,
    calendarProbes:calendarProbeResults.length,calendarProbeResults,
    results,mutations,inputMutations,evidence,acceptanceFilesByteChecked:acceptedFiles.length,
    semantics:'Native isolated contract proposal. Case restrictions and historical F1 categories retained. No runtime registration, promotion or export.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const report=await runAP23F2();
  if(process.argv.includes('--write')){await mkdir(resolve(root,'outputs/ap23f2-2026-10-22'),{recursive:true});await writeFile(resolve(root,reportFile),JSON.stringify(report,null,2)+'\n');}
  const {results,mutations,inputMutations,legacyReferences,...summary}=report;console.log(JSON.stringify(summary,null,2));
}
