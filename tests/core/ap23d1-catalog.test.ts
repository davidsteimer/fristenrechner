// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { administrativeIntervalContains, administrativePeriodDate, assertAdministrativeProcedureCatalog,
  validateAdministrativeReleaseBindings } from '../../src/core/administrativeCatalog';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import type { AdministrativeComponentRef, AdministrativeProcedureCatalog } from '../../src/core/administrativeTypes';

type Mutable<T> = T extends object ? { -readonly [P in keyof T]: Mutable<T[P]> } : T;
const fixtureBytes = readFileSync(new URL('../golden/candidates/ap23c-administrative-contract.json', import.meta.url), 'utf8');
const fixture = (): Mutable<AdministrativeProcedureCatalog> => JSON.parse(fixtureBytes);
function rebind(catalog: Mutable<AdministrativeProcedureCatalog>): void {
  for (const entry of catalog.releaseBinding.pathEligibility) {
    const path = catalog.paths.find(path => path.pathId === entry.pathId)!;
    const holiday = catalog.holidayBindings.find(row => row.holidayBindingId === path.holidayBindingId)!;
    const suspension = catalog.suspensionProfiles.find(row => row.suspensionProfileId === path.suspensionProfileId)!;
    entry.pathRevision = path.revision;
    entry.pathSha256 = socialObjectSha256(path);
    entry.holidayBindingId = path.holidayBindingId;
    entry.holidayBindingSha256 = socialObjectSha256(holiday);
    entry.suspensionProfileId = path.suspensionProfileId;
    entry.suspensionProfileSha256 = socialObjectSha256(suspension);
    entry.caseCoverage = { ...path.temporalBinding.caseCoverage };
    entry.calculationCoverage = { ...path.temporalBinding.calculationCoverage };
  }
}
const componentRefs = (catalog: AdministrativeProcedureCatalog): AdministrativeComponentRef[] => [...new Map(
  catalog.holidayBindings.flatMap(binding => binding.physicalBaseline.references.map(({role, contentId, sha256}) => [contentId, {role, contentId, sha256}] as const))
).values()];
/** Synthetic in-memory boundary shape only. This never promotes real data. */
function released(): Mutable<AdministrativeProcedureCatalog> {
  const catalog = fixture();
  catalog.contractStatus = 'approved'; catalog.contractDecision.status = 'approved'; catalog.contractDecision.on = '2026-10-14';
  const release = catalog.releaseBinding;
  release.status = 'approved'; release.releaseId = '2026-10-14-ap23d1-synthetic.1';
  release.approval = { approvedBy: 'Synthetic test only', approvedOn: '2026-10-14', decisionRef: 'TEST-NOT-A-RELEASE' };
  release.targetComponentRefs = componentRefs(catalog);
  release.sourceReviewRef = { id: 'synthetic-source-review', sha256: '1'.repeat(64) };
  release.referenceSuiteRef = { id: 'synthetic-reference-suite', sha256: '2'.repeat(64) };
  for (const entry of release.pathEligibility) {
    entry.status = 'approved';
    entry.sourceReviewRef = { ...release.sourceReviewRef }; entry.referenceSuiteRef = { ...release.referenceSuiteRef };
    const binding = catalog.holidayBindings.find(binding => binding.holidayBindingId === entry.holidayBindingId)!;
    entry.targetComponentRefs = binding.physicalBaseline.references.map(({role, contentId, sha256}) => ({role, contentId, sha256}));
  }
  return catalog;
}

test('AP23D1 accepts the preserved AP23C twelve-path candidate without activation', () => {
  const catalog = fixture(); assert.doesNotThrow(() => assertAdministrativeProcedureCatalog(catalog));
  assert.equal(catalog.paths.length, 12); assert.equal(catalog.laws.length, 2);
  assert.equal(catalog.runtimeActive, false); assert.equal(catalog.releaseBinding.releaseId, null);
  assert.equal(JSON.stringify(catalog), JSON.stringify(JSON.parse(fixtureBytes)));
});

test('technical contract approval alone neither promotes nor activates the candidate', () => {
  const catalog = fixture(); catalog.contractStatus = 'approved'; catalog.contractDecision.status = 'approved'; catalog.contractDecision.on = '2026-10-14';
  assert.doesNotThrow(() => assertAdministrativeProcedureCatalog(catalog));
  assert.doesNotThrow(() => validateAdministrativeReleaseBindings(catalog, { releaseId: 'local-reference', componentRefs: componentRefs(catalog), mode: 'localReference' }));
  assert.throws(() => validateAdministrativeReleaseBindings(catalog, { releaseId: 'local-reference', componentRefs: componentRefs(catalog), mode: 'approved' }), /not approved/);
});

test('closed schema rejects unknown, executable and contradictory metadata', () => {
  for (const change of [
    (c: any) => { c.extra = true; }, (c: any) => { c.runtimeActive = true; },
    (c: any) => { c.formatVersion = '2.0.0'; }, (c: any) => { c.contractStatus = 'approved'; },
    (c: any) => { c.paths[0].qualification.specialLaw = 'inferred'; },
    (c: any) => { c.paths[0].endShiftGuard = 'skipHolidayPeriod'; },
    (c: any) => { c.paths[0].stages = ['socialCourt']; },
    (c: any) => { c.holidayBindings[0].anchor = 'partyOrRepresentative'; },
    (c: any) => { c.paths[0].duration.value = 1.5; }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog)); }
  const catalog = fixture(); Object.defineProperty(catalog, 'paths', { get() { throw new Error('Accessor must not run'); } });
  assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /accessor/i);
});

test('all identity collections reject duplicates', () => {
  for (const key of ['sources','laws','suspensionProfiles','holidayBindings','paths','excludedPaths','projectDecisions','preserved'] as const) {
    const catalog = fixture(); (catalog[key] as unknown[]).push(structuredClone(catalog[key][0]));
    assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /Duplicate/);
  }
});

test('every source reference resolves, including nested policy and suspension sources', () => {
  for (const locate of [(c: Mutable<AdministrativeProcedureCatalog>) => c.paths[0]!.sourceRefs,
    (c: Mutable<AdministrativeProcedureCatalog>) => c.laws[0]!.holidayPolicyReview.sourceRefs,
    (c: Mutable<AdministrativeProcedureCatalog>) => c.holidayBindings[0]!.legalBinding.sourceRefs,
    (c: Mutable<AdministrativeProcedureCatalog>) => c.suspensionProfiles[0]!.sourceRefs]) {
    const catalog = fixture(); locate(catalog)[0]!.sourceId = 'SRC-NOT-BOUND';
    assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /Unknown source/);
  }
  const duplicate = fixture(); duplicate.paths[0]!.sourceRefs.push({ ...duplicate.paths[0]!.sourceRefs[0]! });
  assert.throws(() => assertAdministrativeProcedureCatalog(duplicate), /Duplicate source reference/);
});

test('foreign laws, cantons and cross-law components fail before calculation', () => {
  for (const change of [
    (c: any) => { c.paths[0].lawId = 'missing'; },
    (c: any) => { c.holidayBindings[0].authoritySeatCanton = 'GR'; },
    (c: any) => { c.paths[0].suspensionProfileId = 'gr-three'; },
    (c: any) => { c.paths[0].holidayBindingId = 'gr-authority-seat'; }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /mismatch|foreign/); }
});

test('impossible recurring dates, absent winter offset and overlaps are rejected', () => {
  for (const change of [
    (c: any) => { c.suspensionProfiles.find((p: any) => p.periods.length).periods[1].start.day = 32; },
    (c: any) => { Object.assign(c.suspensionProfiles.find((p: any) => p.periods.length).periods[1].start, {month: 4, day: 31}); },
    (c: any) => { Object.assign(c.suspensionProfiles.find((p: any) => p.periods.length).periods[1].start, {month: 2, day: 29}); },
    (c: any) => { c.suspensionProfiles.find((p: any) => p.periods.length).periods[2].end.yearOffset = 0; },
    (c: any) => { c.suspensionProfiles.find((p: any) => p.periods.length).periods[0].start.yearOffset = 1; },
    (c: any) => { const p = c.suspensionProfiles.find((p: any) => p.periods.length); p.periods.push({...structuredClone(p.periods[1]), periodId: 'overlap'}); }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /date|suspension|base year|schema/i); }
});

test('date generator shares Gregorian Easter and preserves inclusive winter boundaries', () => {
  assert.equal(administrativePeriodDate({type:'easterOffset',days:-7,yearOffset:0}, 2027), '2027-03-21');
  assert.equal(administrativePeriodDate({type:'easterOffset',days:7,yearOffset:0}, 2027), '2027-04-04');
  assert.equal(administrativePeriodDate({type:'fixedMonthDay',month:1,day:2,yearOffset:1}, 2026), '2027-01-02');
  assert.throws(() => administrativePeriodDate({type:'fixedMonthDay',month:2,day:30,yearOffset:0}, 2026), /Impossible/);
  assert.throws(() => administrativePeriodDate({type:'fixedMonthDay',month:1,day:1,yearOffset:0}, 1500), /Unsupported/);
});

test('ordered duration limits and fixed-duration non-override are structural contracts', () => {
  for (const change of [
    (c: any) => { c.paths.find((p: any) => p.duration.kind === 'authorityOrderedDays').duration.maximum = 366; },
    (c: any) => { c.paths[0].duration.overridable = true; },
    (c: any) => { c.paths[0].duration.value = 0; }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog)); }
});

test('urgency is limited to qualified GR judicial suspension contexts', () => {
  const ti = fixture(); ti.paths[0]!.urgencyPolicy = 'explicitGRJudicialUrgencyOrder'; rebind(ti);
  assert.throws(() => assertAdministrativeProcedureCatalog(ti), /GR urgency/);
  const admin = fixture(); admin.paths.find(p => p.pathId === 'gr-32-10')!.urgencyPolicy = 'explicitGRJudicialUrgencyOrder'; rebind(admin);
  assert.throws(() => assertAdministrativeProcedureCatalog(admin), /GR urgency/);
  const noSuspension = fixture(); noSuspension.paths.find(p => p.pathId === 'ti-advance')!.endShiftGuard = 'blockWhenEnteringApplicableSuspension'; rebind(noSuspension);
  assert.throws(() => assertAdministrativeProcedureCatalog(noSuspension), /guard without suspension/);
});

test('all temporal intervals use actual dates and the evaluated-day envelope is nested', () => {
  for (const change of [
    (c: any) => { c.paths[0].temporalBinding.caseCoverage.from = '2026-02-30'; },
    (c: any) => { c.paths[0].temporalBinding.caseCoverage.to = '2025-12-31'; },
    (c: any) => { c.paths[0].temporalBinding.calculationCoverage.to = '2028-01-01'; },
    (c: any) => { c.paths[0].temporalBinding.normVersionCoverage.to = '2027-06-01'; },
    (c: any) => { c.paths[0].temporalBinding.sourceCoverage.from = '2026-09-01'; }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /temporal|coverage|date/i); }
  assert.equal(administrativeIntervalContains({from:'2026-08-29',to:'2027-12-31'}, '2027-12-31'), true);
  assert.equal(administrativeIntervalContains({from:'2026-08-29',to:'2027-12-31'}, '2028-01-01'), false);
  assert.equal(administrativeIntervalContains({from:'2026-08-29',to:null}, '2027-02-29'), false);
});

test('eligibility is exhaustive, unique and revision-bound, never first-match', () => {
  const absent = fixture(); absent.releaseBinding.pathEligibility.pop();
  assert.throws(() => assertAdministrativeProcedureCatalog(absent), /Complete path/);
  const duplicate = fixture(); duplicate.releaseBinding.pathEligibility.push({...duplicate.releaseBinding.pathEligibility[0]!});
  assert.throws(() => assertAdministrativeProcedureCatalog(duplicate), /Duplicate path eligibility/);
  const revision = fixture(); revision.releaseBinding.pathEligibility[0]!.pathRevision += 1;
  assert.throws(() => assertAdministrativeProcedureCatalog(revision), /revision mismatch/);
});

test('path, holiday and suspension hashes are recomputed from semantic objects', () => {
  for (const change of [
    (c: any) => { c.paths[0].duration.value = 29; },
    (c: any) => { c.holidayBindings[0].legalBinding.sourceRefs[0].locator += ' changed'; },
    (c: any) => { c.suspensionProfiles[0].sourceRefs[0].locator += ' changed'; }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /definition hash/); }
});

test('physical references require canonical paths, identity union and consistent roles', () => {
  for (const change of [
    (c: any) => { c.holidayBindings[0].physicalBaseline.references[0].path = '../calendar.json'; },
    (c: any) => { c.holidayBindings[0].physicalBaseline.references[0].role = 'holidayCatalog'; },
    (c: any) => { c.holidayBindings[0].physicalBaseline.calendarId = 'ch-federal-calendar'; },
    (c: any) => { c.holidayBindings[1].physicalBaseline.references[1].sha256 = '0'.repeat(64); }
  ]) { const catalog = fixture(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog), /relative|role|inventory|physical|Duplicate/i); }
});

test('general catalog is not permanently restricted to two names or twelve paths', () => {
  const catalog = fixture();
  // Rename the TI law to a future VD law while retaining already modelled
  // semantics. This checks the format domain, not a legal VD authorisation.
  const old = 'lpamm-ti', next = 'test-vd-general';
  const law = catalog.laws.find(law => law.lawId === old)!; law.lawId = next; law.canton = 'VD';
  catalog.suspensionProfiles.filter(row => row.lawId === old).forEach(row => {row.lawId = next;});
  catalog.holidayBindings.filter(row => row.lawId === old).forEach(row => {row.lawId = next; row.authoritySeatCanton = 'VD';});
  catalog.paths.filter(row => row.lawId === old).forEach(row => {row.lawId = next;});
  rebind(catalog); assert.doesNotThrow(() => assertAdministrativeProcedureCatalog(catalog));
});

test('released shape has explicit evidence and an exact per-path component set', () => {
  assert.doesNotThrow(() => assertAdministrativeProcedureCatalog(released()));
  for (const change of [
    (c: any) => { c.releaseBinding.approval = null; },
    (c: any) => { c.releaseBinding.approval.approvedOn = '2026-10-13'; },
    (c: any) => { c.releaseBinding.pathEligibility[0].sourceReviewRef.sha256 = '0'.repeat(64); },
    (c: any) => { c.releaseBinding.pathEligibility[0].targetComponentRefs[0].sha256 = '0'.repeat(64); },
    (c: any) => { c.releaseBinding.targetComponentRefs.pop(); },
    (c: any) => { c.releaseBinding.pathEligibility[0].status = 'candidate'; }
  ]) { const catalog = released(); change(catalog); assert.throws(() => assertAdministrativeProcedureCatalog(catalog)); }
});

test('actual approved release binding rejects stale hashes, wrong release or missing components', () => {
  const catalog = released(), context = {releaseId: catalog.releaseBinding.releaseId!, componentRefs: componentRefs(catalog), mode:'approved' as const};
  assert.doesNotThrow(() => validateAdministrativeReleaseBindings(catalog, context));
  assert.throws(() => validateAdministrativeReleaseBindings(catalog, {...context, releaseId: 'wrong-release'}), /mismatched/);
  assert.throws(() => validateAdministrativeReleaseBindings(catalog, {...context, componentRefs: context.componentRefs.slice(1)}), /inventory/);
  assert.throws(() => validateAdministrativeReleaseBindings(catalog, {...context, componentRefs: context.componentRefs.map((ref, i) => i ? ref : {...ref,sha256:'0'.repeat(64)})}), /hash mismatch/);
});

test('local reference verifies identities but does not confuse baseline bytes with target bytes', () => {
  const catalog = fixture(), refs = componentRefs(catalog).map(ref => ({...ref,sha256:'9'.repeat(64)}));
  assert.doesNotThrow(() => validateAdministrativeReleaseBindings(catalog, {releaseId:'local-reference',componentRefs:refs,mode:'localReference'}));
  assert.throws(() => validateAdministrativeReleaseBindings(catalog, {releaseId:'local-reference',componentRefs:refs.slice(1),mode:'localReference'}), /inventory/);
  assert.throws(() => validateAdministrativeReleaseBindings(catalog, {releaseId:'local-reference',componentRefs:[...refs,refs[0]!],mode:'localReference'}), /Duplicate/);
});

test('withdrawn release remains inspectable but cannot activate approved or local-reference modes', () => {
  const catalog = released(); catalog.contractStatus = 'withdrawn'; catalog.contractDecision.status = 'withdrawn'; catalog.releaseBinding.status = 'withdrawn';
  catalog.releaseBinding.pathEligibility.forEach(row => {row.status = 'withdrawn';});
  assert.doesNotThrow(() => assertAdministrativeProcedureCatalog(catalog));
  for (const mode of ['approved','localReference'] as const) assert.throws(() => validateAdministrativeReleaseBindings(catalog, {releaseId:catalog.releaseBinding.releaseId!,componentRefs:componentRefs(catalog),mode}));
});

test('implementation schema preserves the accepted structural contract exactly apart from its title', () => {
  const oldSchema = JSON.parse(readFileSync(new URL('../../schemas/candidates/ap23c/administrative-procedure-catalog.schema.json', import.meta.url), 'utf8'));
  const current = JSON.parse(readFileSync(new URL('../../schemas/implementation/ap23d1/administrative-procedure-catalog.schema.json', import.meta.url), 'utf8'));
  current.title = oldSchema.title; assert.deepEqual(current, oldSchema);
});
