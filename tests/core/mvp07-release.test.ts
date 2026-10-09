// SPDX-License-Identifier: AGPL-3.0-only
// These are real human-approved disk bytes, not synthetic release permissions.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { createCalculatorRuntime, createFormat7CalculationData } from '../../src/core/calculatorRuntime';
import { calculateCalendarBoundDeadline } from '../../src/core/calculateCalendarBoundDeadline';
import { resolveBoundCalendar } from '../../src/core/calendarResolution';
import type { CalendarContext } from '../../src/core/calendarResolution';
import { calculateDeadline, calculateSocialDeadline, calculateSpecialDeadline } from '../../src/core';
import type { CalculationInput, SocialDeadlineInput, ValidatedReleaseLike } from '../../src/core';
import { mvp07ManifestText, mvp07Files, mvp07Runtime } from '../../src/release/mvp07ReleaseData';
import { mvp06CalculationData } from '../../src/release/mvp06ReleaseData';
import { ap22c3CandidateRuntime } from '../../src/release/ap22c3CandidateData';
import { createDeadlineCalendarEntry } from '../../src/ui/calendarExport';
import { initialDefaults, sanitizeDefaults } from '../../src/ui/defaults';
import { parseDateEntry } from '../../src/ui/dateEntry';
import { calculationInput, loadGoldenSuite } from './fixtures';

const releaseId = '2026-10-08-mvp-07-approved.1';
const root = `data/releases/${releaseId}/`;
const read = (path: string): string => readFileSync(path, 'utf8');
const hash = (text: string): string => createHash('sha256').update(text).digest('hex');
const manifestText = read(`${root}manifest.json`);
const manifest = JSON.parse(manifestText);
const files: Map<string, string> = new Map(manifest.artifacts.map((item: { path: string }) => [item.path, read(root + item.path)]));
const runtime = createFormat7CalculationData(manifestText, files, { mode: 'approved' });
const { data, calendarRuntime } = runtime;
const social = data.socialProcedureCatalogs!.get('ch-social-procedures')!;
const input = (profileId = 'stpo', inputDate = '2026-09-16', deadlineDays = 10): CalculationInput => ({
  profileId, inputDate, inputDateSemantics: 'legallyRelevantDeliveryOrEventDate', deadlineDays,
  calendarId: 'be-public-holidays', holidayAnchorCandidates: ['BE'], confirmations: {},
  selectors: profileId === 'zpo' ? { procedureVariant: 'summary' }
    : ['bgg', 'vwvg'].includes(profileId) ? { subjectMatter: 'interimMeasures' } : {}
});
const context = (profile = 'stpo', canton = 'BE', areaFacts?: CalendarContext['areaFacts']): CalendarContext => ({
  role: profile === 'zpo' ? 'court' : 'partyWithoutRepresentative', canton,
  areaFacts: areaFacts ?? (canton === 'AI' ? { 'AI-RTG-INNER-ADDITIONAL': false }
    : canton === 'NE' ? { 'NE-LANDERON-ADDITIONAL': false } : {})
});
const calculate = (value = input(), place = context()) => calculateCalendarBoundDeadline(value, place, data, calendarRuntime);

test('MVP07 executes exact approved 41-file release bytes and the generated web module is byte-identical', () => {
  assert.equal(manifest.releaseStatus, 'approved');
  assert.equal(manifest.formatVersion, '7.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '7.0.0');
  assert.equal(files.size, 40);
  assert.equal(readdirSync(root, { recursive: true, withFileTypes: true }).filter(item => item.isFile()).length, 41);
  assert.equal(mvp07ManifestText, manifestText);
  assert.deepEqual(mvp07Files, files);
  for (const descriptor of manifest.artifacts) {
    assert.equal(hash(files.get(descriptor.path)!), descriptor.sha256, descriptor.path);
    assert.equal(Buffer.byteLength(files.get(descriptor.path)!), descriptor.byteLength, descriptor.path);
  }
  assert.equal(mvp07Runtime.calendarRuntime.referenceOnly, false);
  assert.equal(data.profiles.size, 5);
  assert.equal(data.calendars.size, 32);
  assert.ok([...data.calendarRuleSets.values()].every(calendar => calendar.formatVersion === '3.0.0'));
  assert.equal(calendarRuntime.catalog.data.rules.length, 479);
  assert.equal(calendarRuntime.catalog.activation.supplementalRules.length, 12);
  assert.equal(calendarRuntime.catalog.activation.matrixDecisions.length, 198);
  assert.equal(calendarRuntime.catalog.activation.procedureBindings.length, 104);
  assert.equal(calendarRuntime.catalog.activation.releaseEligibility.releaseId, releaseId);
});

test('MVP07 resolves and calculates all 104 approved terminal bindings, with explicit regional answers', () => {
  for (const binding of calendarRuntime.catalog.activation.procedureBindings) {
    const canton = binding.jurisdiction.slice(3), place = context(binding.profileId, canton);
    const result = calculate(input(binding.profileId), place);
    assert.equal(result.calendarResolution.binding?.id, binding.id);
    assert.equal(result.outcome, 'calculated', `${binding.id}: ${result.blockReasonKeys}`);
    assert.equal(result.referenceOnly, false);
    assert.equal(result.calendarExportAllowed, true);
  }
});

test('MVP07 cannot replace missing role/place/region qualification with a fallback or old calendar ID', () => {
  for (const place of [context('stpo', ''), context('stpo', 'CH'), context('stpo', 'XX'),
    context('stpo', 'AI', {}), context('stpo', 'NE', {}), { ...context(), role: '' as const },
    { ...context(), role: 'court' as const }, { ...context(), role: 'unqualifiedRepresentation' as const }]) {
    const result = calculate({ ...input(), calendarId: 'ch-federal-calendar', confirmations: { holidayAnchorConfirmed: true } }, place);
    assert.equal(result.outcome, 'blocked');
    assert.equal(result.calendarExportAllowed, false);
    assert.equal('finalEnd' in result, false);
  }
  assert.equal(calculateDeadline(input(), data).outcome, 'blocked');
  assert.equal(resolveBoundCalendar('vrp-sg', context(), calendarRuntime).status, 'clarificationRequired');
});

for (const [canton, profile] of [['SH', 'stpo'], ['SG', 'stpo'], ['SG', 'bgg'], ['SG', 'vwvg']]) {
  test(`MVP07 ${canton}/${profile}: January divergence has two complete results but no definitive result or export`, () => {
    for (const day of ['2028-12-31', '2029-01-01']) {
      const result = calculate(input(profile, day, 1), context(profile, canton));
      assert.equal(result.outcome, 'blocked');
      assert.equal(result.januaryComparison?.outcome, 'different');
      assert.deepEqual(result.januaryComparison?.variedCatalogRuleIds, [`${canton}-ZPO-ADDITIONAL-DAY-BERCHTOLD`]);
      assert.equal(result.januaryComparison?.withoutJanuary2?.finalEnd, '2029-01-02');
      assert.equal(result.januaryComparison?.withJanuary2?.finalEnd, '2029-01-03');
      for (const path of [result.januaryComparison?.withoutJanuary2, result.januaryComparison?.withJanuary2]) {
        assert.deepEqual(Object.keys(path!).sort(), ['deadlineStart', 'finalEnd', 'legallyRelevantDate', 'provisionalEnd']);
      }
      assert.equal('finalEnd' in result, false);
      assert.equal(result.calendarExportAllowed, false);
    }
    const same = calculate(input(profile, '2027-01-01', 1), context(profile, canton));
    assert.equal(same.outcome === 'calculated' && same.finalEnd, '2027-01-04');
    assert.equal(same.januaryComparison?.outcome, 'same');
    assert.equal(same.calendarExportAllowed, true);
  });
}

test('MVP07 GR/NE stay calculable warnings, distinct from January and regional missing-fact blocks', () => {
  for (const [canton, boundary] of [['GR', 'GR-BASE-ONLY'], ['NE', 'NE-YEAR-LOCAL-RESERVE']] as const) {
    const result = calculate(input(), context('stpo', canton));
    assert.equal(result.outcome, 'calculated');
    assert.deepEqual(result.calendarResolution.boundaryIds, [boundary]);
    assert.ok(result.warningKeys.includes(boundary));
    assert.equal(result.calendarExportAllowed, true);
    assert.equal(result.januaryComparison, undefined);
  }
  for (const profile of ['stpo', 'zpo', 'bgg', 'vwvg']) {
    const yes = calculate(input(profile, '2027-05-26', 1), context(profile, 'NE', { 'NE-LANDERON-ADDITIONAL': true }));
    const no = calculate(input(profile, '2027-05-26', 1), context(profile, 'NE', { 'NE-LANDERON-ADDITIONAL': false }));
    assert.equal(yes.outcome === 'calculated' && yes.finalEnd, '2027-05-28');
    assert.equal(no.outcome === 'calculated' && no.finalEnd, '2027-05-27');
  }
});

function socialInput(bindingId: string, date = '2026-09-16'): SocialDeadlineInput {
  const binding = social.cantonalBindings.find(item => item.bindingId === bindingId)!;
  const rule = social.federalRules.find(item => item.ruleId === binding.ruleId)!;
  const route = binding.contextRoutes[0]!;
  const temporal = new Set([...rule.normBindings, ...binding.normBindings].map(item => item.temporalSelector));
  return { ruleId: rule.ruleId, bindingId, contextRouteId: route.contextRouteId, procedureContextCanton: 'BE',
    caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
    qualificationBasis: 'confirmed-case-facts', matter: rule.matter, triggerKind: rule.triggerKind,
    notificationChannel: rule.notificationChannels[0]!, notificationConfirmed: true, legalTriggerDate: date,
    ...(temporal.has('jurisdictionReferenceDate') ? { jurisdictionReferenceDate: date } : {}),
    ...(temporal.has('procedureStartDate') ? { procedureStartDate: date } : {}),
    holidayResolution: { status: 'resolved', calendarBindingId: 'be-party', anchors: [{ role: 'party', canton: 'BE', spatialScopeId: 'BE' }] },
    ...(rule.calculation.durationInputId ? { days: 10 } : {}) };
}
test('MVP07 all 44 social rules and 50 BE permissions retain the accepted arithmetic, facts and 2026–2027 limits', () => {
  const prior = mvp06CalculationData.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.deepEqual(social.federalRules, prior.federalRules);
  assert.deepEqual(social.cantonalBindings, prior.cantonalBindings);
  assert.equal(social.federalRules.length, 44);
  assert.equal(social.cantonalBindings.length, 50);
  for (const binding of social.cantonalBindings) {
    const value = socialInput(binding.bindingId), result = calculateSocialDeadline(value, data);
    assert.equal(result.outcome, 'calculated', `${binding.bindingId}: ${result.blockReasonKeys}`);
    assert.equal(result.finalDeadline?.date, calculateSocialDeadline(value, mvp06CalculationData).finalDeadline?.date);
    assert.equal(result.socialEvidence?.releaseId, releaseId);
    for (const invalid of [{ ...value, procedureContextCanton: 'ZH' }, { ...value, caseFacts: {} },
      { ...value, notificationConfirmed: false }, socialInput(binding.bindingId, '2028-01-02')]) {
      const blocked = calculateSocialDeadline(invalid, data);
      assert.equal(blocked.outcome, 'blocked', binding.bindingId);
      assert.equal(blocked.finalDeadline, undefined);
    }
  }
  for (const entry of social.releaseEligibility) {
    assert.equal(entry.status, 'approved'); assert.equal(entry.releaseId, releaseId);
    assert.equal(entry.sourceReviewRef.reviewId, 'MVP07-SOURCE-APPROVAL-20261008');
    assert.deepEqual(entry.caseCoverage, { from: '2026-01-01', to: '2027-12-31' });
  }
});

test('MVP07 preserves remaining VRPG calculation and rejects historical dates before its own release coverage', () => {
  const catalog = data.specialRegimeCatalogs.get('vrpg-be-special-regimes-rest')!;
  const regime = catalog.regimes.find(item => item.regimeId === 'vrpg-be-general')!;
  const value = { profileId: 'vrpg-be', regimeId: regime.regimeId, ruleId: 'VRPGBE-SPEC-REL-GENERAL-001',
    dateValues: { eventDate: '2026-09-04' }, localTimeValues: {}, integerValues: { deadlineDays: 10 },
    calendarProfileId: regime.calendarProfileId!, suspensionProfileId: regime.suspensionProfileId!,
    filingProfileId: regime.filingProfileId!, overrideConfirmations: [] };
  assert.equal(calculateSpecialDeadline(value, data).finalDeadline?.date, '2026-09-14');
  assert.equal(calculate(input('stpo', '2026-08-28', 1)).outcome, 'blocked');
  assert.equal(calculate(input('stpo', '2026-08-29', 1)).outcome, 'calculated');
});

test('MVP07 AP21 shortcuts lead to the real release result and DE/FR ICS preserves the all-day/free/112h contract', () => {
  for (const locale of ['de', 'fr'] as const) {
    for (const text of ['16', '16.9', '16.9.2026', 'h']) {
      const parsed = parseDateEntry(text, locale, new Date('2026-09-16T10:00:00Z'));
      assert.equal(parsed.kind, 'valid');
      if (parsed.kind !== 'valid') throw new Error('Expected valid date');
      const result = calculate(input('stpo', parsed.value, 10));
      assert.equal(result.outcome, 'calculated');
      if (result.outcome !== 'calculated') throw new Error('Expected calculated release result');
      assert.equal(result.finalEnd, '2026-09-28');
      const ics = createDeadlineCalendarEntry({ deadlineDate: result.finalEnd, locale, reference: 'QA-MVP07-LOCAL',
        uid: 'synthetic-mvp07@example.invalid', createdAt: new Date('2026-10-08T10:00:00Z') }).content;
      assert.match(ics, /DTSTART;VALUE=DATE:20260928\r\n/);
      assert.match(ics, /DTEND;VALUE=DATE:20260929\r\n/);
      assert.match(ics, /TRANSP:TRANSPARENT\r\n/);
      assert.match(ics, /TRIGGER:-PT112H\r\n/);
      assert.match(ics, /CATEGORIES:Fristablauf\r\n/);
      assert.match(ics, locale === 'de' ? /SUMMARY:Fristablauf/ : /SUMMARY:Échéance du délai/);
    }
  }
});

test('MVP07 migration to defaults 4 never invents a procedural role, canton, regional fact or date', () => {
  const migrated = sanitizeDefaults(data, initialDefaults(mvp06CalculationData), true);
  assert.equal(migrated.version, 4);
  assert.deepEqual(migrated.calendarContext, { role: '', canton: '', areaFacts: {} });
  const explicit = sanitizeDefaults(data, { ...migrated, calendarContext: context('stpo', 'NE', { 'NE-LANDERON-ADDITIONAL': true }),
    inputDate: '2026-09-16', reference: 'PRIVATE-REFERENCE' }, true);
  assert.deepEqual(explicit.calendarContext, { role: 'partyWithoutRepresentative', canton: 'NE', areaFacts: {} });
  assert.doesNotMatch(JSON.stringify(explicit), /2026-09-16|PRIVATE-REFERENCE|NE-LANDERON-ADDITIONAL/);
});

test('MVP07 transport validates actual bytes and rejects cache metadata, resealed semantic drift and candidate promotion shortcuts', () => {
  const transport = { releaseId, formatVersion: '7.0.0', coverageFrom: manifest.coverage.from, coverageTo: null,
    profileIds: manifest.profileIds, calendarIds: manifest.calendarIds, holidayCatalogIds: manifest.holidayCatalogIds,
    socialProcedureCatalogIds: manifest.socialProcedureCatalogIds, specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
    manifestBytes: Buffer.from(manifestText), manifestSha256: hash(manifestText),
    artifacts: manifest.artifacts.map((descriptor: any) => ({ descriptor, bytes: Buffer.from(files.get(descriptor.path)!), parsed: { stale: true } })) };
  assert.equal(createCalculatorRuntime(transport).data.releaseId, releaseId);
  assert.throws(() => createCalculatorRuntime({ ...transport, manifestSha256: '0'.repeat(64) }));
  assert.throws(() => createCalculatorRuntime({ ...transport, artifacts: transport.artifacts.map((item: any, index: number) => index ? item : { ...item, bytes: undefined }) }));
  for (const [path, change] of [
    ['calendars/be-public-holidays.json', (value: any) => { value.rules[0].calculation.day = 2; }],
    ['social-procedures/ch-social-procedures.json', (value: any) => { value.releaseEligibility[0].status = 'candidate'; value.releaseEligibility[0].approval = null; }],
    ['social-procedures/ch-social-procedures.json', (value: any) => { value.releaseEligibility[0].componentRefs[0].sha256 = '0'.repeat(64); }],
    ['social-procedures/ch-social-procedures.json', (value: any) => { value.releaseEligibility[0].caseCoverage.to = '2028-12-31'; }]
  ] as const) {
    const next = JSON.parse(files.get(path)!); change(next);
    const text = JSON.stringify(next, null, 2) + '\n', replaced = new Map(files).set(path, text), metadata = structuredClone(manifest);
    Object.assign(metadata.artifacts.find((item: { path: string }) => item.path === path), { sha256: hash(text), byteLength: Buffer.byteLength(text) });
    assert.throws(() => createFormat7CalculationData(JSON.stringify(metadata), replaced), path);
  }
  assert.equal(ap22c3CandidateRuntime.calendarRuntime.referenceOnly, true);
  assert.equal(ap22c3CandidateRuntime.calendarRuntime.catalog.activation.releaseEligibility.status, 'candidate');
});

test('MVP07 consumer still loads the original pinned AP5 format without activating Format7 or changing its golden outcomes', () => {
  const oldRoot = 'data/releases/2026-08-29-ap5-approved.1/';
  const oldText = read(oldRoot + 'manifest.json'), old = JSON.parse(oldText);
  assert.equal(hash(oldText), 'c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6');
  const oldRuntime = createCalculatorRuntime({ releaseId: old.releaseId, formatVersion: old.formatVersion,
    coverageFrom: old.coverage.from, coverageTo: old.coverage.to, profileIds: old.profileIds, calendarIds: old.calendarIds,
    artifacts: old.artifacts.map((descriptor: { path: string }) => ({ descriptor, parsed: JSON.parse(read(oldRoot + descriptor.path)) })) } as ValidatedReleaseLike);
  assert.equal(oldRuntime.calendarRuntime, undefined);
  assert.equal(oldRuntime.data.calendars.size, 2);
  for (const item of [...loadGoldenSuite('approved').cases, ...loadGoldenSuite('unresolved').cases]) {
    const result = calculateDeadline(calculationInput(item), oldRuntime.data);
    assert.equal(result.outcome, item.expected.outcome, item.caseId);
    assert.deepEqual(result.blockReasonKeys, item.expected.blockReasonKeys, item.caseId);
    if (result.outcome === 'calculated') assert.equal(result.finalEnd, item.expected.finalEnd, item.caseId);
  }
});
