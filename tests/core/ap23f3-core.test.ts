// SPDX-License-Identifier: AGPL-3.0-only
// Native product tests against the local candidate. Synthetic approval is never a release.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateAdministrativeDeadline } from '../../src/core/administrativeDeadline';
import { parseFormat10Data, parseFormat10LocalReferenceData, getVerifiedAdministrativeDataV3,
  assertTrustedFormat10Data } from '../../src/core/releaseFormat10';
import { parseFormat9Data, parseFormat9LocalReferenceData, getVerifiedAdministrativeDataV2 } from '../../src/core/releaseFormat9';
import { getVerifiedAdministrativeData } from '../../src/core/releaseFormat8';
import { assertAdministrativeProcedureCatalogV2 } from '../../src/core/administrativeCatalogV2';
import { buildSyntheticFormat10, changeSyntheticFormat10, encode10, AP23F3_ADMIN,
  administrativeInput10, resealAdministrative10 } from './ap23f3Fixtures';

const fixture = buildSyntheticFormat10();
const context = parseFormat10LocalReferenceData(encode10(fixture.manifest), fixture.files);
const catalog = context.administrativeCatalog;
const research = JSON.parse(readFileSync('docs/fachrecht/ap23f1/referenzfaelle.json', 'utf8'));
const input = (id?: string, date?: string, days?: number, stage?: string) => administrativeInput10(catalog, id, date, days, stage);
const translateStage = (s: string): string => ({recourse: 'administrativeAppeal', vrk: 'court'}[s] ?? s);
function adaptF1(row: any): any {
  const source = research.paths.find((p: any) => p.id === row.path);
  if (!source) return {...input(), selection: {...input().selection, pathId: 'unknown'}, inputDate: row.trigger, deadlineDays: row.days};
  const value: any = input(source.id.toLowerCase(), row.trigger, row.days === null ? undefined : row.days);
  for (const [key, v] of Object.entries(row.facts ?? {})) {
    if (key === 'stage') value.selection.stage = translateStage(v as string);
    else if (key === 'qualification') value.caseQualification.decisionKind = 'unknown';
    else if (key === 'paymentOrMaterialPerformance') { if (v) value.caseQualification.action = 'payment'; }
    else if (key === 'opening') value.caseQualification.opening = v === 'completeLegalTriggerKnown' ? 'qualifiedCompleteActualDelivery'
      : v === 'electronicFictionUnresolved' ? 'fiction' : v;
    else if (key === 'specialLaw') value.qualification.specialLaw = v === 'taxProcedure' ? 'unknown' : v;
    else if (key === 'zh2027ChannelCase') value.caseQualification.channelCase = v;
    else if (key === 'notice') {
      value.caseQualification.notice = v;
      if (source.id === 'SG-COURT-INTERIM-5') value.caseQualification.exceptionNotice = v;
    } else if (key === 'termChange') value.caseQualification.termChange = v === 'restored' ? 'reinstatement' : v;
    else if (key === 'holidayAnchor') value.authoritySeat.qualification = v;
    else if (key === 'subject') value.caseQualification.procedureMatter = v;
    else if (key === 'authorityLevel') value.authoritySeat.level = v;
    else if (['fixedEndDate', 'deviatingStart'].includes(key)) value.qualification[key] = v;
    else if (key === 'partyOrRepresentativeCanton') {
      // Not a fact of this authority-seat-bound API. Deliberately absent from
      // the closed input, rather than a hidden or silently merged canton.
      assert.equal(catalog.holidayBindings.find(b => b.holidayBindingId === catalog.paths.find(p => p.pathId === value.selection.pathId)!.holidayBindingId)!.anchor, 'authoritySeat');
    } else if (key === 'direction' || key === 'unit') value.caseQualification[key] = v;
    else throw new Error('Unmapped F1 fact: ' + key);
  }
  return value;
}
function block(value: any, reason?: string): void {
  const result = calculateAdministrativeDeadline(value, context);
  assert.equal(result.outcome, 'blocked', JSON.stringify(result));
  assert.equal(result.calendarExportAllowed, false);
  assert.equal('finalEnd' in result, false);
  if (reason && result.outcome === 'blocked') assert.ok(result.blockReasonKeys.includes(reason), JSON.stringify(result));
}

for (const row of research.cases) test('AP23F3 native10 calculation matches accepted F1 ' + row.id, () => {
  const result = calculateAdministrativeDeadline(adaptF1(row), context);
  assert.equal(result.calendarExportAllowed, false);
  if (row.expected.outcome !== 'datedResearchValue') {
    assert.equal(result.outcome, 'blocked', JSON.stringify(result));
    assert.equal('finalEnd' in result, false);
    if (row.expected.outcome === 'unresolvedBoundaryProposed' && result.outcome === 'blocked') {
      assert.ok(result.blockReasonKeys.includes('endShiftIntoSuspensionUnresolved'));
      assert.equal(result.provisionalEnd, row.expected.nominalEnd);
    }
    return;
  }
  assert.equal(result.outcome, 'calculated', JSON.stringify(result));
  if (result.outcome !== 'calculated') return;
  assert.equal(result.finalEnd, row.expected.end);
  if (row.expected.nominalEnd) assert.equal(result.provisionalEnd, row.expected.nominalEnd);
  if (row.expected.firstCountedDay) assert.equal(result.deadlineStart, row.expected.firstCountedDay);
  if (row.expected.skippedDays !== undefined) assert.equal(result.skippedCalendarDays, row.expected.skippedDays);
  assert.equal(result.referenceOnly, true);
  assert.ok(result.provenance.evaluatedNormSegments!.length >= 1);
});

test('AP23F3 all 80 independent cases cover 17 new paths and exact 52/3/20/5 classifications', () => {
  assert.equal(research.cases.length, 80);
  assert.deepEqual(['datedResearchValue', 'unresolvedBoundaryProposed', 'qualificationBoundaryProposed', 'researchWindowBoundary']
    .map(k => research.cases.filter((r: any) => r.expected.outcome === k).length), [52, 3, 20, 5]);
  for (const path of research.paths) assert.ok(research.cases.some((c: any) => c.path === path.id && c.expected.outcome === 'datedResearchValue'));
  assert.equal(catalog.paths.filter(p => 'normTimeline' in p && p.endShiftGuard === 'blockWhenEnteringApplicableSuspension').length, 9);
});

test('AP23F3 every one of 11 current case facts is required and every negative value is blocked', () => {
  const full: any = input('ag-execution-10');
  assert.equal(Object.keys(full.caseQualification).length, 11);
  const absent = structuredClone(full); delete absent.caseQualification;
  block(absent, 'administrative.caseQualificationRequired');
  for (const key of Object.keys(full.caseQualification)) {
    const changed = structuredClone(full); delete changed.caseQualification[key]; block(changed);
  }
  for (const [key, values] of Object.entries({
    action: ['payment', 'materialPerformance', 'ordinaryAppeal', 'unknown'],
    decisionKind: ['finalDecision', 'interimDecision', 'qualifiedVRPGArt63Order', 'unknown'],
    unit: ['month', 'hour', 'fixedDate'], direction: ['backward', 'unknown'],
    opening: ['fiction', 'publication', 'dispositiveOnly', 'unknown'], notice: ['missing', 'incorrect', 'unknown'],
    termChange: ['extension', 'reinstatement', 'unknown'], targetBody: ['cantonAdministrativeAuthority', 'administrativeAppealsCommission', 'unknown'],
    procedureMatter: ['documentAccess', 'tax', 'unknown'], channelCase: ['channelOutageClaimed', 'ordinaryNoFictionNoOutage', 'unknown'],
    exceptionNotice: ['correctExceptionNotice', 'missing', 'unknown']
  })) for (const v of values) {
    const changed = structuredClone(full); changed.caseQualification[key] = v; block(changed);
  }
  const extra = structuredClone(full); extra.caseQualification.approved = true; block(extra, 'administrative.inputContractInvalid');
  for (const key of ['selection', 'authoritySeat', 'inputDate', 'qualification', 'urgency']) {
    const changed = structuredClone(full); delete changed[key]; block(changed, 'administrative.inputContractInvalid');
  }
  for (const parent of ['selection', 'authoritySeat', 'qualification']) for (const key of Object.keys(full[parent])) {
    const changed = structuredClone(full); delete changed[parent][key]; block(changed, 'administrative.inputContractInvalid');
  }
  block({...full, deadlineDays: 5}, 'administrative.durationMismatch');
  block({...full, selection: {...full.selection, revision: 2}}, 'administrative.unknownPath');
  block({...full, authoritySeat: {...full.authoritySeat, canton: 'AR'}}, 'administrative.authoritySeatMismatch');
  block({...full, caseQualification: {...full.caseQualification, targetBody: 'administrativeCourt'}, urgency: 'explicitJudicialUrgencyOrder'}, 'administrative.unsupportedUrgency');
});

test('AP23F3 evaluated norm trace includes only actually applicable temporal segments and links', () => {
  for (const [id, date, days, expected] of [
    ['zh-rekurs-30', '2026-10-02', undefined, ['2026-08-29']],
    ['zh-rekurs-30', '2027-02-01', undefined, ['2027-01-01']],
    ['zh-court-30', '2026-12-03', undefined, ['2026-08-29', '2027-01-01']],
    ['sg-court-14', '2027-05-01', undefined, ['2026-08-29']],
    ['sg-court-14', '2027-06-01', undefined, ['2027-06-01']],
    ['sg-court-14', '2027-05-25', undefined, ['2026-08-29', '2027-06-01']]
  ] as const) {
    const r = calculateAdministrativeDeadline(input(id, date, days), context);
    assert.equal(r.outcome, 'calculated', JSON.stringify(r));
    if (r.outcome !== 'calculated') continue;
    assert.deepEqual(r.provenance.evaluatedNormSegments!.map(s => s.interval.from), expected);
    const ids = r.provenance.sourceRefs.map(s => s.sourceId);
    if (id.startsWith('zh-') && expected.length === 1) assert.equal(ids.includes('SRC-AP23F1-ZH-VRG-REVISION-20270101'), date > '2026-12-31');
    if (id.startsWith('sg-') && expected.length === 1) {
      assert.equal(ids.includes('SRC-AP23F1-SG-GERG-20180701'), date < '2027-06-01');
      assert.equal(ids.includes('SRC-AP23F1-SG-GERG-20270601'), date >= '2027-06-01');
    }
  }
});

test('AP23F3 preserves all 25 historical paths, cases and exception semantics against native9', () => {
  const base = 'data/releases/2026-10-18-mvp-09-approved.1/';
  const text = readFileSync(base + 'manifest.json', 'utf8'), m = JSON.parse(text);
  const old = parseFormat9Data(text, new Map(m.artifacts.map((a: any) => [a.path, readFileSync(base + a.path, 'utf8')])));
  assert.equal(old.administrativeCatalog.paths.length, 25);
  for (const p of old.administrativeCatalog.paths) {
    assert.deepEqual(catalog.paths.find(v => v.pathId === p.pathId), p);
    for (const date of ['2026-10-16', '2026-12-17', '2027-03-18', '2027-07-20']) for (const stage of p.stages) {
      const v = input(p.pathId, date, p.duration.kind === 'authorityOrderedDays' ? 10 : undefined, stage);
      const semantic = (r: any) => { const {provenance, referenceOnly, calendarExportAllowed, ...rest} = r; return rest; };
      assert.deepEqual(semantic(calculateAdministrativeDeadline(v, context)), semantic(calculateAdministrativeDeadline(v, old)), p.pathId + date + stage);
    }
  }
  block({...input('ar-execution-5'), caseQualification: input('ag-execution-10').caseQualification!}, 'administrative.inputContractInvalid');
  const gr = calculateAdministrativeDeadline({...input('gr-court-ordered', '2027-07-20', 10), urgency: 'explicitJudicialUrgencyOrder'}, context);
  assert.equal(gr.outcome, 'calculated');
  if (gr.outcome === 'calculated') assert.equal(gr.finalEnd, '2027-07-30');
});

test('AP23F3 independently branded native10 context cannot be copied, serialized, proxied or downgraded', () => {
  assertTrustedFormat10Data(context);
  assert.equal(getVerifiedAdministrativeData(context), undefined); assert.equal(getVerifiedAdministrativeDataV2(context), undefined);
  for (const fake of [undefined, null, {}, {...context}, JSON.parse(JSON.stringify(context)), Object.create(context), new Proxy(context, {})]) {
    assert.equal(getVerifiedAdministrativeDataV3(fake), undefined);
    assert.throws(() => assertTrustedFormat10Data(fake));
    for (const p of catalog.paths) assert.equal(calculateAdministrativeDeadline(input(p.pathId, '2026-10-16', p.duration.kind === 'authorityOrderedDays' ? 10 : undefined), fake).outcome, 'blocked');
  }
  assert.throws(() => { (catalog.paths as any).pop(); }, TypeError);
  assert.equal(typeof (context.artifacts as any).set, 'undefined');
  assert.throws(() => assertAdministrativeProcedureCatalogV2(catalog));
  assert.throws(() => parseFormat9LocalReferenceData(encode10(fixture.manifest), fixture.files));
  assert.throws(() => parseFormat9Data(encode10(fixture.manifest), fixture.files));
});

test('AP23F3 candidate and approved readers remain disjoint with no manufactured release approval', () => {
  assert.throws(() => parseFormat10Data(encode10(fixture.manifest), fixture.files));
  const approved = buildSyntheticFormat10('approved');
  const verified = parseFormat10Data(encode10(approved.manifest), approved.files);
  assert.throws(() => parseFormat10LocalReferenceData(encode10(approved.manifest), approved.files));
  const result = calculateAdministrativeDeadline(input(), verified);
  assert.equal(result.outcome, 'calculated'); assert.equal(result.calendarExportAllowed, true);
  assert.equal(catalog.releaseBinding.status, 'candidate'); assert.equal(catalog.releaseBinding.approval, null);
  assert.equal(catalog.releaseBinding.sourceReviewRef, null); assert.equal(catalog.releaseBinding.referenceSuiteRef, null);
  assert.deepEqual(catalog.releaseBinding.targetComponentRefs, []);
});

for (const [name, edit] of [
  ['stale physical release', (c: any) => {c.holidayBindings[0].physicalBaseline.releaseId = '2026-10-18-mvp-09-approved.1';}],
  ['stale physical component hash', (c: any) => {c.holidayBindings[0].physicalBaseline.references[0].sha256 = '0'.repeat(64);}]
] as const) test('AP23F3 approved reader rejects ' + name + ' despite resealed eligibility', () => {
  const changed = buildSyntheticFormat10('approved');
  changeSyntheticFormat10(changed, AP23F3_ADMIN, c => {edit(c); resealAdministrative10(c);});
  assert.throws(() => parseFormat10Data(encode10(changed.manifest), changed.files));
});

const pathOf = (c: any, id: string) => c.paths.find((p: any) => p.pathId === id);
const policyOf = (c: any, id: string) => c.qualificationPolicies.find((p: any) => p.pathId === id);
for (const [name, edit] of [
  ['missing path', (c: any) => c.paths.pop()], ['missing policy', (c: any) => c.qualificationPolicies.pop()],
  ['duplicate policy', (c: any) => c.qualificationPolicies.push(c.qualificationPolicies[0])],
  ['existing AR duration', (c: any) => {pathOf(c, 'ar-execution-5').duration.value = 10;}],
  ['existing LU notice', (c: any) => {policyOf(c, 'lu-admin-30').requirements.notice = 'unknown';}],
  ['AG five days', (c: any) => {pathOf(c, 'ag-execution-10').duration.value = 5;}],
  ['AG wrong execution', (c: any) => {policyOf(c, 'ag-execution-10').requirements.decisionKind = 'qualifiedVRPGArt63Order';}],
  ['SG measures swapped', (c: any) => {policyOf(c, 'sg-admin-measures-5').requirements.decisionKind = 'qualifiedSGVRP60InterimOrder';}],
  ['SG wrong exception notice', (c: any) => {policyOf(c, 'sg-court-interim-5').requirements.exceptionNotice = 'notApplicable';}],
  ['SG VRK wrong body', (c: any) => {policyOf(c, 'sg-vrk-14').requirements.targetBody = 'administrativeCourt';}],
  ['SG VRK general matter', (c: any) => {policyOf(c, 'sg-vrk-ordered').requirements.procedureMatter = 'generalAdministrative';}],
  ['ZH channel omission', (c: any) => {policyOf(c, 'zh-rekurs-30').requirements.channelCase = 'notApplicable';}],
  ['ZH guard omitted', (c: any) => {pathOf(c, 'zh-court-30').endShiftGuard = 'none';}],
  ['AG guard omitted', (c: any) => {pathOf(c, 'ag-court-30').endShiftGuard = 'none';}],
  ['SG guard omitted', (c: any) => {pathOf(c, 'sg-court-ordered').endShiftGuard = 'none';}],
  ['SG false guard', (c: any) => {pathOf(c, 'sg-admin-14').endShiftGuard = 'blockWhenEnteringApplicableSuspension';}],
  ['ZH timeline gap', (c: any) => {pathOf(c, 'zh-court-30').normTimeline[1].interval.from = '2027-01-02';}],
  ['ZH timeline overlap', (c: any) => {pathOf(c, 'zh-court-30').normTimeline[1].interval.from = '2026-12-31';}],
  ['ZH wrong revision date', (c: any) => {const p = pathOf(c, 'zh-court-30'); p.normTimeline[0].interval.to = '2026-11-30'; p.normTimeline[1].interval.from = '2026-12-01';}],
  ['ZH wrong norm source', (c: any) => {pathOf(c, 'zh-court-30').normTimeline[1].sourceRefs[0].sourceId = 'SRC-AP23F1-SG-VRP-20240101';}],
  ['ZH norm revision source dropped', (c: any) => {const p = pathOf(c, 'zh-court-30'); p.normTimeline[1].sourceRefs = p.normTimeline[1].sourceRefs.filter((r: any) => r.sourceId !== 'SRC-AP23F1-ZH-VRG-REVISION-20270101');}],
  ['SG wrong GerG date', (c: any) => {const p = pathOf(c, 'sg-court-14'); p.normTimeline[0].interval.to = '2027-06-30'; p.normTimeline[1].interval.from = '2027-07-01';}],
  ['SG wrong GerG source', (c: any) => {const p = pathOf(c, 'sg-court-14'); p.normTimeline[1].sourceRefs = p.normTimeline[0].sourceRefs;}],
  ['SG VRK OeffG dropped', (c: any) => {const p = pathOf(c, 'sg-vrk-14'); p.normTimeline[0].sourceRefs = p.normTimeline[0].sourceRefs.filter((r: any) => r.sourceId !== 'SRC-AP23F1-SG-OEFFG-20230701');}],
  ['new path scalar norm envelope', (c: any) => {pathOf(c, 'zh-court-30').temporalBinding.normVersionCoverage = {from: '2026-08-29', to: '2027-12-31'};}],
  ['unreviewed extended window', (c: any) => {pathOf(c, 'zh-court-30').temporalBinding.calculationCoverage.to = '2028-12-31';}],
  ['new legacy bypass', (c: any) => {const q = policyOf(c, 'ag-execution-10'); delete q.requirements; q.mode = 'legacyV1'; q.baseline = c.qualificationPolicies.find((p: any) => p.mode === 'legacyV1').baseline;}],
  ['wrong SG calendar with January2', (c: any) => {const b = c.holidayBindings.find((b: any) => b.holidayBindingId === 'sg-authority-seat'); b.physicalBaseline.calendarId = 'ap22-sg-f95068e3b162'; b.physicalBaseline.projectionId = 'forged-sg';}],
  ['wrong ZH scope', (c: any) => {c.holidayBindings.find((b: any) => b.holidayBindingId === 'zh-administration-authority-seat').legalBinding.scopeIds = ['CH-ALL'];}],
  ['runtime privilege flag', (c: any) => {c.runtimeActive = true;}],
  ['standalone source URL', (c: any) => {c.sources.find((s: any) => s.sourceId === 'SRC-AP23F1-SG-GERG-20270601').url = 'https://www.sg.ch/forged-version';}],
  ['standalone source version', (c: any) => {c.sources.find((s: any) => s.sourceId === 'SRC-AP23F1-SG-GERG-20270601').versionDescription = 'Wrong norm version';}],
  ['extra source identity field', (c: any) => {c.sources.find((s: any) => s.sourceId === 'SRC-AP23F1-SG-GERG-20270601').approvedForFuture = true;}],
  ['candidate forged approval', (c: any) => {c.releaseBinding.status = 'approved'; c.releaseBinding.releaseId = fixture.manifest.releaseId;}]
] as const) test('AP23F3 rejects fully rehashed semantic mutation: ' + name, () => {
  const changed = buildSyntheticFormat10();
  changeSyntheticFormat10(changed, AP23F3_ADMIN, c => {edit(c); resealAdministrative10(c);});
  assert.throws(() => parseFormat10LocalReferenceData(encode10(changed.manifest), changed.files));
});

test('AP23F3 permits a separately evidenced review refresh without changing source identity', () => {
  const changed = buildSyntheticFormat10();
  changeSyntheticFormat10(changed, AP23F3_ADMIN, c => {
    const s = c.sources.find((s: any) => s.sourceId === 'SRC-AP23F1-SG-GERG-20270601');
    s.reviewedOn = '2026-10-21'; s.reviewBasis = 'SYNTHETIC REVIEW REFRESH, NO SOURCE RELEASE APPROVAL';
  });
  const reviewed = parseFormat10LocalReferenceData(encode10(changed.manifest), changed.files);
  assert.equal(reviewed.mode, 'localReference');
  assert.equal(reviewed.administrativeCatalog.releaseBinding.status, 'candidate');
});

test('AP23F3 strictly rejects a resealed Format9 relabelling even with old inventory', () => {
  const down = buildSyntheticFormat10();
  down.manifest.$schema = down.manifest.$schema.replace('ap23f3/local-reference-manifest-v10', 'ap23e3/local-reference-manifest-v9');
  down.manifest.formatVersion = '9.0.0'; down.manifest.compatibility.minimumConsumerFormatVersion = '9.0.0';
  down.manifest.calendarIds = down.manifest.calendarIds.filter((id: string) => id !== 'ap23f2-zh-rlg-nine');
  down.manifest.artifacts = down.manifest.artifacts.filter((a: any) => a.contentId !== 'ap23f2-zh-rlg-nine');
  down.files.delete('calendars/ap23f2-zh-rlg-nine.json');
  const descriptor = down.manifest.artifacts.find((a: any) => a.path === AP23F3_ADMIN);
  descriptor.schemaId = descriptor.schemaId.replace('-v3.schema', '-v2.schema');
  changeSyntheticFormat10(down, AP23F3_ADMIN, c => {
    c.$schema = descriptor.schemaId; c.formatVersion = '2.0.0'; c.contractDecision = {id: 'DEC-2026-033', status: 'approved', on: '2026-10-18'};
  });
  assert.throws(() => parseFormat9LocalReferenceData(encode10(down.manifest), down.files));
});
