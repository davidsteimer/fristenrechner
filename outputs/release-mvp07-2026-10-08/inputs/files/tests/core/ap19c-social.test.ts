// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { mvp04CalculationData } from '../../src/release/mvp04ReleaseData';
import { assertSocialProcedureCatalog, canonicalSocialJson, SocialCatalogError, socialObjectSha256, validateSocialCatalogReferences } from '../../src/core/socialCatalog';
import { calculateSocialDeadline, resolveSocialDeadline } from '../../src/core/socialDeadline';
import type { SocialDeadlineInput, SocialProcedureCatalog } from '../../src/core/socialTypes';
import type { CalculationData } from '../../src/core/types';
import type { SpecialRegimeCatalog } from '../../src/core/specialTypes';
import { parseIsoDate } from '../../src/core/date';

type Mutable<T> = T extends readonly (infer U)[] ? Mutable<U>[] : T extends object ? {-readonly [P in keyof T]: Mutable<T[P]>} : T;
const directory = 'data/candidates/2026-09-25-ap19c1/';
const manifest = JSON.parse(readFileSync(directory + 'manifest.json', 'utf8')) as {releaseId: string; artifacts: {role: string; contentId: string; sha256: string}[]};
const candidate = JSON.parse(readFileSync(directory + 'social-procedures/ch-social-procedures.json', 'utf8')) as SocialProcedureCatalog;
const rest = JSON.parse(readFileSync(directory + 'special-regimes/vrpg-be.json', 'utf8')) as SpecialRegimeCatalog;
function copy(): Mutable<SocialProcedureCatalog> { return JSON.parse(JSON.stringify(candidate)) as Mutable<SocialProcedureCatalog>; }
function rehash(catalog: Mutable<SocialProcedureCatalog>): void {
  catalog.releaseEligibility.forEach(e => {
    e.ruleRef.sha256 = socialObjectSha256(catalog.federalRules.find(r => r.ruleId === e.ruleRef.ruleId && r.revision === e.ruleRef.revision));
    e.bindingRef.sha256 = socialObjectSha256(catalog.cantonalBindings.find(b => b.bindingId === e.bindingRef.bindingId && b.revision === e.bindingRef.revision));
  });
}
/** TEST ONLY. This creates invented approvals in memory, never candidate files. */
function syntheticApproved(): Mutable<SocialProcedureCatalog> {
  const catalog = copy();
  catalog.federalRules.forEach(r => { r.status = 'reviewed'; });
  catalog.cantonalBindings.forEach(b => { b.status = 'reviewed'; b.legalValidity = {from: '2026-01-01', to: '2027-12-31'}; });
  catalog.releaseEligibility.forEach(e => { e.status = 'approved'; e.approval = {approvedBy: 'SYNTHETIC TEST ONLY', approvedOn: '2026-09-25', decisionRef: 'TEST-NOT-A-RELEASE'}; });
  rehash(catalog);
  return catalog;
}
function dataFor(catalog: SocialProcedureCatalog = syntheticApproved()): CalculationData {
  return {...mvp04CalculationData, releaseId: manifest.releaseId, formatVersion: '5.0.0', socialProcedureCatalogs: new Map([[catalog.catalogId, catalog]]), specialRegimeCatalogs: new Map([[rest.catalogId, rest]]), releaseArtifactRefs: manifest.artifacts};
}
function inputFor(ruleId = 'CH-SOC-ELG-OBJ'): SocialDeadlineInput {
  const rule = candidate.federalRules.find(r => r.ruleId === ruleId)!;
  const binding = candidate.cantonalBindings.find(b => b.ruleId === ruleId)!;
  const route = binding.contextRoutes[0]!;
  // A separately qualified, fictional filing date. Never copied from service.
  const jurisdiction = [...rule.normBindings, ...binding.normBindings].some(n => n.temporalSelector === 'jurisdictionReferenceDate')
    ? {jurisdictionReferenceDate: rule.action === 'complaint-correction' ? '2026-09-01' : '2026-09-21'} : {};
  return {ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId, procedureContextCanton: 'BE', caseFacts: Object.fromEntries(route.requiredFacts.map(f => [f.factKey, f.allowedValues[0]])), qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind, notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16', holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}, ...jurisdiction, ...(rule.calculation.durationInputId ? {days: 10} : {})};
}
function reason(input: SocialDeadlineInput, data = dataFor()): string | undefined { return calculateSocialDeadline(input, data).blockReasonKeys[0]; }

test('RFC 8785 published number serialization vector and UTF-16 ordering', () => {
  assert.equal(canonicalSocialJson({numbers: [333333333.33333329, 1e30, 4.50, 2e-3, 1e-27]}), '{"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27]}');
  const sorted = JSON.parse(canonicalSocialJson({'\u20ac':'Euro Sign','\r':'Carriage Return','\ufb33':'Hebrew Letter Dalet With Dagesh','1':'One','\ud83d\ude00':'Emoji: Grinning Face','\u0080':'Control','\u00f6':'Latin Small Letter O With Diaeresis'})) as Record<string,string>;
  // Object.keys reorders integer property names, therefore compare canonical bytes.
  assert.equal(canonicalSocialJson(sorted), '{"\\r":"Carriage Return","1":"One","\u0080":"Control","ö":"Latin Small Letter O With Diaeresis","€":"Euro Sign","😀":"Emoji: Grinning Face","דּ":"Hebrew Letter Dalet With Dagesh"}');
});

test('canonical SHA-256 matches known empty-object digest and independent Node SHA-256', () => {
  assert.equal(socialObjectSha256({}), '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a');
  for (const value of [null, true, -0, ['😀','é','\n','\u0000'], {z: 1e30, a: {ö: [1,2,3]}}, ...candidate.federalRules, ...candidate.cantonalBindings]) {
    assert.equal(socialObjectSha256(value), createHash('sha256').update(canonicalSocialJson(value), 'utf8').digest('hex'));
  }
});

test('non-JSON and ambiguous canonicalization inputs fail closed', () => {
  const cycle: {self?: unknown} = {}; cycle.self = cycle;
  const getter = Object.defineProperty({}, 'x', {enumerable: true, get() { throw new Error('getter must not execute'); }});
  const symbol = {[Symbol('x')]: 1};
  for (const value of [undefined, NaN, Infinity, -Infinity, '\ud800', '\udc00', {['\udfff']: 1}, [undefined], Array(1), new Date(), new Map(), BigInt(1), cycle, getter, symbol]) assert.throws(() => canonicalSocialJson(value), SocialCatalogError);
});

test('real AP19C1 candidate is structurally valid but all sixteen paths remain unreleased', () => {
  assertSocialProcedureCatalog(candidate);
  validateSocialCatalogReferences(candidate, dataFor(candidate));
  for (const r of candidate.federalRules) {
    const result = calculateSocialDeadline(inputFor(r.ruleId), dataFor(candidate));
    assert.equal(result.outcome, 'blocked', r.ruleId);
    assert.deepEqual(result.blockReasonKeys, ['not-released'], r.ruleId);
    assert.equal(result.finalDeadline, undefined);
  }
});

test('synthetic approved ELG path calculates and names its full evidence chain', () => {
  const result = calculateSocialDeadline(inputFor(), dataFor());
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.finalDeadline?.date, '2026-10-16');
  assert.equal(result.socialEvidence?.ruleId, 'CH-SOC-ELG-OBJ');
  assert.equal(result.socialEvidence?.bindingId, 'BE-SOC-ELG-OBJ');
  assert.equal(result.socialEvidence?.contextRouteId, 'be-elg-akb-article8');
  assert.equal(result.socialEvidence?.calendarId, 'be-public-holidays');
  assert.equal(result.socialEvidence?.releaseId, manifest.releaseId);
  assert.ok(result.socialEvidence?.sourceRefs.length);
  assert.equal(result.qualifiedCalculation, undefined);
});

test('source, binding and release object hashes are independently enforced', () => {
  const wrongRule = syntheticApproved(); wrongRule.federalRules[0]!.labels.de += ' tampered';
  assert.throws(() => assertSocialProcedureCatalog(wrongRule), /hash mismatch/);
  const wrongBinding = syntheticApproved(); wrongBinding.cantonalBindings[0]!.labels.fr += ' tampered';
  assert.throws(() => assertSocialProcedureCatalog(wrongBinding), /hash mismatch/);
  const wrongArtifact = dataFor();
  assert.equal(reason(inputFor(), {...wrongArtifact, releaseArtifactRefs: wrongArtifact.releaseArtifactRefs!.map(r => ({...r, sha256: '0'.repeat(64)}))}), 'data-contract-invalid');
  const release = syntheticApproved(); release.releaseEligibility[0]!.releaseId = 'other-release';
  assert.equal(reason(inputFor(), dataFor(release)), 'data-contract-invalid');
});

test('merely changing candidate eligibility to approved is not a release', () => {
  const catalog = copy(); catalog.releaseEligibility[0]!.status = 'approved';
  assert.equal(reason(inputFor(), dataFor(catalog)), 'data-contract-invalid');
  const inventedApproval = copy(); inventedApproval.releaseEligibility[0]!.status = 'approved'; inventedApproval.releaseEligibility[0]!.approval = {approvedBy: 'invented', approvedOn: '2026-09-25', decisionRef: 'invented'};
  assert.throws(() => assertSocialProcedureCatalog(inventedApproval), /unreviewed/);
});

test('all objects reject unknown fields and norm locators must be exactly bound', () => {
  const top = {...candidate, runtimeActive: true}; assert.throws(() => assertSocialProcedureCatalog(top));
  const rule = copy(); Object.assign(rule.federalRules[0]!, {canton: 'BE'}); assert.throws(() => assertSocialProcedureCatalog(rule));
  const route = copy(); Object.assign(route.cantonalBindings[0]!.contextRoutes[0]!, {condition: 'true'}); assert.throws(() => assertSocialProcedureCatalog(route));
  const temporal = copy(); temporal.federalRules[0]!.normBindings[0]!.locator = 'different article'; assert.throws(() => assertSocialProcedureCatalog(temporal), /locator/);
  const dup = copy(); dup.federalRules.push(dup.federalRules[0]!); assert.throws(() => assertSocialProcedureCatalog(dup), /Duplicate/);
});

test('fixed duration cannot be overridden, including by the identical statutory duration', () => {
  for (const days of [30, 10, 0, 366, 1.5, NaN]) assert.equal(reason({...inputFor(), days}), 'unsupported-procedure');
  for (const days of [0, 366, 1.5, NaN]) assert.equal(reason({...inputFor('CH-SOC-ELG-ADM'), days}), 'unsupported-procedure');
  assert.equal(calculateSocialDeadline(inputFor('CH-SOC-ELG-ADM'), dataFor()).finalDeadline?.date, '2026-09-28');
});

test('unknown, wrong and contradictory contexts never return a date', () => {
  const variants: [Partial<SocialDeadlineInput>, string][] = [
    [{ruleId: 'CH-SOC-NONEXISTENT'}, 'unknown-rule'], [{matter: 'other'}, 'wrong-matter'], [{triggerKind: 'other'}, 'wrong-trigger'],
    [{procedureContextCanton: 'ZH'}, 'context-unresolved'], [{contextRouteId: 'other'}, 'context-unresolved'],
    [{caseFacts: {...inputFor().caseFacts, courtCanton: 'BE'}}, 'context-unresolved'],
    [{caseFacts: {...inputFor().caseFacts, competentBodyQualified: false}}, 'context-unresolved'],
    [{caseFacts: {...inputFor().caseFacts, jurisdictionSpecialCase: 'abroad'}}, 'context-unresolved'],
    [{qualificationBasis: 'confirmed-case-facts'}, 'context-unresolved'], [{legalTriggerDate: '2028-01-01'}, 'outside-case-coverage']
  ];
  for (const [change, expected] of variants) assert.equal(reason({...inputFor(), ...change}), expected);
  for (const malformed of [{...inputFor(), bypass: true}, {...inputFor(), caseFacts: {...inputFor().caseFacts, decisionOrigin: {}}}, {...inputFor(), legalTriggerDate: '2026-02-30'}]) assert.equal(reason(malformed as SocialDeadlineInput), 'input-contract-invalid');
});

test('authority seat is informational and never substitutes context or holiday qualification', () => {
  const away = {...inputFor(), authoritySeat: {country: 'CH', canton: 'ZH'}};
  assert.equal(calculateSocialDeadline(away, dataFor()).finalDeadline?.date, '2026-10-16');
  assert.equal(reason({...away, procedureContextCanton: 'ZH'}), 'context-unresolved');
  assert.equal(reason({...away, authoritySeat: {country: 'CH', canton: 'XX'}}), 'input-contract-invalid');
});

test('party or representative requires qualified, released and spatially consistent anchors', () => {
  const input = inputFor();
  for (const status of ['unknown','conflict'] as const) assert.equal(reason({...input, holidayResolution: {...input.holidayResolution, status}}), 'holiday-unresolved');
  assert.equal(reason({...input, holidayResolution: {...input.holidayResolution, anchors: []}}), 'holiday-unresolved');
  assert.equal(reason({...input, holidayResolution: {...input.holidayResolution, calendarBindingId: 'AG-other'}}), 'calendar-not-released');
  assert.equal(reason({...input, holidayResolution: {...input.holidayResolution, anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'unknown'}]}}), 'holiday-unresolved');
  assert.equal(reason({...input, holidayResolution: {...input.holidayResolution, anchors: [...input.holidayResolution.anchors, {role: 'representative', canton: 'ZH', spatialScopeId: 'ZH'}]}}), 'holiday-unresolved');
  assert.equal(calculateSocialDeadline({...input, holidayResolution: {status: 'resolved', calendarBindingId: 'be-representative', anchors: [{role: 'representative', canton: 'BE', spatialScopeId: 'BE'}]}}, dataFor()).outcome, 'calculated');
});

test('full counting and weekend shift must remain inside approved calculation coverage', () => {
  const shortened = syntheticApproved();
  const e = shortened.releaseEligibility.find(e => e.ruleRef.ruleId === 'CH-SOC-ELG-ADM')!;
  e.caseCoverage = {from: '2026-01-01', to: '2026-09-16'};
  e.calculationCoverage = {from: '2026-01-01', to: '2026-09-27'};
  assert.equal(reason(inputFor('CH-SOC-ELG-ADM'), dataFor(shortened)), 'outside-calculation-coverage');
  assert.equal(reason({...inputFor(), legalTriggerDate: '2027-12-15'}), 'outside-calculation-coverage');
});

test('temporal selectors require actual facts and permit court jurisdiction reference after service', () => {
  const c = syntheticApproved();
  const r = c.federalRules.find(r => r.ruleId === 'CH-SOC-ELG-APP')!;
  r.normBindings[0]!.temporalSelector = 'jurisdictionReferenceDate'; rehash(c);
  const input = inputFor('CH-SOC-ELG-APP');
  const {jurisdictionReferenceDate: _removed, ...withoutReference} = input;
  assert.equal(reason(withoutReference, dataFor(c)), 'context-unresolved');
  assert.equal(calculateSocialDeadline({...input, jurisdictionReferenceDate: '2026-10-01'}, dataFor(c)).outcome, 'calculated');
  assert.equal(reason({...input, jurisdictionReferenceDate: '2028-01-01'}, dataFor(c)), 'source-gap');
  assert.equal(reason({...inputFor(), procedureStartDate: '2026-01-01'}), 'context-unresolved');
});

test('same national rule supports a synthetic different canton only with its own exact binding and approval', () => {
  const c = syntheticApproved();
  const nationalHash = socialObjectSha256(c.federalRules.find(r => r.ruleId === 'CH-SOC-ELG-APP'));
  const b = c.cantonalBindings.find(b => b.ruleId === 'CH-SOC-ELG-APP')!;
  b.bindingId = 'ZH-SOC-ELG-APP-SYNTHETIC'; b.procedureContextCanton = 'ZH'; b.entryProfileId = 'vrpg-zh-synthetic';
  b.contextRoutes.forEach(r => { r.contextRouteId = 'zh-court-synthetic'; r.requiredFacts.forEach(f => { if (f.factKey === 'courtCanton') f.allowedValues = ['ZH']; }); });
  const e = c.releaseEligibility.find(e => e.ruleRef.ruleId === 'CH-SOC-ELG-APP')!;
  e.bindingRef.bindingId = b.bindingId; e.contextRouteIds = ['zh-court-synthetic']; rehash(c);
  const profiles = new Map(mvp04CalculationData.profiles); const baseProfile = profiles.get('vrpg-be')!; profiles.set('vrpg-zh-synthetic', {...baseProfile, profileId: 'vrpg-zh-synthetic', jurisdiction: {level: 'cantonal', code: 'ZH'}});
  const d = {...dataFor(c), profiles};
  const input = {...inputFor('CH-SOC-ELG-APP'), bindingId: b.bindingId, contextRouteId: 'zh-court-synthetic', procedureContextCanton: 'ZH', caseFacts: Object.fromEntries(b.contextRoutes[0]!.requiredFacts.map(f => [f.factKey, f.allowedValues[0]]))};
  assert.equal(calculateSocialDeadline(input as SocialDeadlineInput, d).outcome, 'calculated');
  assert.equal(socialObjectSha256(c.federalRules.find(r => r.ruleId === 'CH-SOC-ELG-APP')), nationalHash);
  e.status = 'candidate'; e.approval = null;
  assert.equal(reason(input as SocialDeadlineInput, d), 'not-released');
});

test('mixed legacy/social live catalogs are rejected, not resolved by precedence', () => {
  const d = dataFor();
  assert.equal(resolveSocialDeadline(inputFor(), {...d, specialRegimeCatalogs: mvp04CalculationData.specialRegimeCatalogs}).outcome, 'blocked');
  assert.equal(reason(inputFor(), {...d, specialRegimeCatalogs: mvp04CalculationData.specialRegimeCatalogs}), 'data-contract-invalid');
});

test('unavailable regional projections and withdrawn sources cannot be activated', () => {
  const regional = syntheticApproved();
  regional.cantonalBindings[0]!.calendarBindings[0]!.spatialScopeId = 'BE-UNREVIEWED-REGION'; rehash(regional);
  assert.equal(reason(inputFor(), dataFor(regional)), 'data-contract-invalid');
  const withdrawn = syntheticApproved();
  const sourceId = withdrawn.federalRules[0]!.sourceRefs[0]!.sourceId;
  withdrawn.sources.find(s => s.sourceId === sourceId)!.reviewStatus = 'withdrawn';
  assert.throws(() => assertSocialProcedureCatalog(withdrawn), /withdrawn source/);
});

test('ELG court jurisdiction requires separately qualified Bern domicile and its reference date', () => {
  for (const id of ['CH-SOC-ELG-APP','CH-SOC-ELG-CORRECTION']) {
    const input = inputFor(id);
    const {jurisdictionReferenceDate: _date, ...withoutDate} = input;
    assert.equal(reason(withoutDate), 'context-unresolved');
    const {partyDomicileCanton: _domicile, ...withoutDomicile} = input.caseFacts;
    assert.equal(reason({...input, caseFacts: withoutDomicile}), 'context-unresolved');
    assert.equal(reason({...input, caseFacts: {...input.caseFacts, partyDomicileCanton: 'ZH'}}), 'context-unresolved');
    assert.equal(reason({...input, jurisdictionReferenceDate: '2025-12-31'}), 'source-gap');
  }
  assert.equal(reason({...inputFor('CH-SOC-ELG-CORRECTION'), jurisdictionReferenceDate: '2026-09-17'}), 'context-unresolved');
});

test('overlapping normative intervals and case approval beyond legal validity fail at load time', () => {
  const overlap = copy(); const norm = overlap.federalRules[0]!.normBindings[0]!;
  overlap.federalRules[0]!.normBindings.push({...norm, applicableFrom: '2026-06-01'});
  assert.throws(() => assertSocialProcedureCatalog(overlap), /Overlapping norm/);
  const overrun = syntheticApproved(); overrun.cantonalBindings[0]!.legalValidity = {from: '2026-01-01', to: '2026-12-31'}; rehash(overrun);
  assert.throws(() => assertSocialProcedureCatalog(overrun), /exceeds legal validity/);
});

test('ES5-transpiled browser-neutral canonicalizer preserves hashes and error identity', () => {
  const code = ts.transpileModule(readFileSync('src/core/socialCatalog.ts', 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS, downlevelIteration: true}}).outputText;
  const sandbox = {exports: {} as Record<string, unknown>, require: (id: string): unknown => {
    assert.equal(id, './date'); return {parseIsoDate};
  }};
  runInNewContext(code + '\nexports.testHash = exports.socialObjectSha256({}); try { exports.canonicalSocialJson(NaN); } catch (e) { exports.testErrorIdentity = e instanceof exports.SocialCatalogError; }', sandbox);
  assert.equal(sandbox.exports.testHash, '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a');
  assert.equal(sandbox.exports.testErrorIdentity, true);
});
