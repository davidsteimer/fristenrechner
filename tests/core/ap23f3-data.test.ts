// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { buildAP23F3Candidate, AP23F3_ROOT, AP23F3_BASE, AP23F3_TARGET, AP23F3_RELEASE_ID,
  AP23F3_ADMIN_PATH, AP23F3_MODULE, AP23F3_ZH_CALENDAR, AP23F3_ZH_PROJECTION } from '../../scripts/build-ap23f3-candidate';
import { parseFormat10Data, parseFormat10LocalReferenceData, getVerifiedAdministrativeDataV3 } from '../../src/core/releaseFormat10';
import { parseFormat9LocalReferenceData } from '../../src/core/releaseFormat9';
import { projectActivatedCalendarsV10, assertActivatedCalendarProjectionV10 } from '../../src/core/holidayActivationV10';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../../src/core/format7Baseline';
import { ADMINISTRATIVE_V3_BASELINE } from '../../src/core/administrativeV3Baseline';
import { FORMAT10_HOLIDAY_CONTENT_SHA256, FORMAT10_ADMINISTRATIVE_PROJECTION } from '../../src/core/format10Baseline';
import { canonicalSocialJson } from '../../src/core/socialCatalog';
import type { CalendarRuleSet } from '../../src/core/calendarRuleTypes';
import type { HolidayCatalogV2 } from '../../src/core/holidayActivationTypes';

const raw = (path: string): string => readFileSync(resolve(AP23F3_ROOT, path), 'utf8');
const read = (path: string): any => JSON.parse(raw(path));
const sha = (text: string): string => createHash('sha256').update(text).digest('hex');
const objectSha = (value: unknown): string => sha(canonicalSocialJson(value));
const baseline = read(`${AP23F3_BASE}/manifest.json`);
const manifestText = raw(`${AP23F3_TARGET}/manifest.json`);
const manifest = JSON.parse(manifestText);
const files = new Map<string, string>(manifest.artifacts.map((row: any) => [row.path, raw(`${AP23F3_TARGET}/${row.path}`)]));
const catalog = JSON.parse(files.get(AP23F3_ADMIN_PATH)!);
const historical = read(`outputs/ap23f2-candidate-2026-10-22/bundle/${AP23F3_ADMIN_PATH}`);
const holidayPath = 'holiday-catalogs/ch-holiday-catalog.json';
const holiday = JSON.parse(files.get(holidayPath)!);

test('AP23F3 native Format10 reads actual local bytes but never becomes a release approval or Format9 adapter', () => {
  const parsed = parseFormat10LocalReferenceData(manifestText, files);
  assert.equal(parsed.mode, 'localReference');
  assert.equal(parsed.manifest.formatVersion, '10.0.0');
  assert.equal(parsed.manifest.releaseId, AP23F3_RELEASE_ID);
  assert.equal(parsed.calendars.length, 33);
  assert.equal(parsed.administrativeCatalog.paths.length, 42);
  assert.equal(getVerifiedAdministrativeDataV3(parsed)?.referenceOnly, true);
  assert.equal(getVerifiedAdministrativeDataV3({ ...parsed }), undefined);
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '10.0.0');
  assert.equal(manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  assert.equal(manifest.sourceSummary.technicalValidationStatus, 'pending');
  for (const flag of ['productionActivation', 'sourceReleaseApproved', 'calendarExportEnabled'])
    assert.equal(manifest.extensions['steimer.local-reference'][flag], false, flag);
  assert.throws(() => parseFormat10Data(manifestText, files));
  assert.throws(() => parseFormat9LocalReferenceData(manifestText, files));
});

test('AP23F3 re-creates all 43 data files and generated modules deterministically', async () => {
  const built = await buildAP23F3Candidate();
  assert.equal(built.manifestText, manifestText);
  assert.deepEqual([...built.files.keys()].sort(), [...files.keys()].sort());
  for (const [path, text] of built.files) assert.equal(text, files.get(path), path);
  assert.equal(built.generatedModule, raw(AP23F3_MODULE));
  assert.equal(built.administrativeBaselineModule, raw('src/core/administrativeV3Baseline.ts'));
  assert.equal(built.format10BaselineModule, raw('src/core/format10Baseline.ts'));
  assert.equal(built.integrityText, raw('outputs/ap23f3-2026-10-22/bundle-integrity.json'));
});

test('AP23F3 binds every descriptor, evidence input and generated file to its actual SHA-256 and length', () => {
  assert.equal(manifest.artifacts.length, 42);
  assert.equal(files.size, 42);
  for (const descriptor of manifest.artifacts) {
    const text = files.get(descriptor.path)!;
    assert.equal(sha(text), descriptor.sha256, descriptor.path);
    assert.equal(Buffer.byteLength(text), descriptor.byteLength, descriptor.path);
    assert.equal(JSON.parse(text).$schema, descriptor.schemaId, descriptor.path);
  }
  const integrity = read('outputs/ap23f3-2026-10-22/bundle-integrity.json');
  for (const descriptor of [integrity.manifest, ...integrity.artifacts]) {
    assert.equal(sha(raw(descriptor.path)), descriptor.sha256, descriptor.path);
    assert.equal(Buffer.byteLength(raw(descriptor.path)), descriptor.byteLength, descriptor.path);
  }
  for (const descriptor of [...integrity.basedOn, ...integrity.generatedModules, integrity.buildScript])
    assert.equal(sha(raw(descriptor.path)), descriptor.sha256, descriptor.path);
});

test('AP23F3 preserves five profiles and the special-regime catalog byte-for-byte from MVP09', () => {
  const descriptors = baseline.artifacts.filter((row: any) => ['legalProfile', 'specialRegimeCatalog'].includes(row.role));
  assert.equal(descriptors.length, 6);
  for (const descriptor of descriptors) assert.equal(files.get(descriptor.path), raw(`${AP23F3_BASE}/${descriptor.path}`));
});

test('AP23F3 adds only the administrative nine-rule projection and no federal or social procedure binding', () => {
  const old = read(`${AP23F3_BASE}/${holidayPath}`);
  assert.equal(holiday.data.rules.length, 479);
  assert.equal(holiday.activation.supplementalRules.length, 12);
  assert.equal(holiday.activation.matrixDecisions.length, 198);
  assert.equal(holiday.activation.procedureBindings.length, 104);
  assert.equal(holiday.activation.projections.length, 33);
  assert.deepEqual(holiday.activation.releaseEligibility, { status: 'candidate', releaseId: null, approval: null });
  const recipe = holiday.activation.projections.at(-1);
  assert.deepEqual(recipe, FORMAT10_ADMINISTRATIVE_PROJECTION);
  assert.equal(recipe.id, AP23F3_ZH_PROJECTION);
  assert.equal(recipe.calendarId, AP23F3_ZH_CALENDAR);
  assert.deepEqual(recipe.scopeIds, ['ZH-RLG-ALL']);
  assert.deepEqual(recipe.ruleIds, ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY',
    'NATIONAL-DAY', 'CHRISTMAS', 'ST-STEPHEN', 'MAY1'].map(id => `ZH-RLG-ALL-DAY-${id}`));
  assert.equal(holiday.activation.procedureBindings.filter((row: any) => row.calendarId === AP23F3_ZH_CALENDAR).length, 0);
  const normalized = structuredClone(holiday);
  normalized.activation.projections.pop();
  normalized.activation.releaseEligibility = old.activation.releaseEligibility;
  assert.deepEqual(normalized, old, 'No source status, catalogue rule, old projection or role policy may change');
});

test('AP23F3 preserves old 32 calendar definitions and accepted F2 ZH calendar, changing only full-catalog provenance', () => {
  const descriptors = manifest.artifacts.filter((row: any) => row.role === 'calendar');
  assert.equal(descriptors.length, 33);
  for (const descriptor of descriptors) {
    const source = descriptor.contentId === AP23F3_ZH_CALENDAR ? 'outputs/ap23f2-candidate-2026-10-22/bundle' : AP23F3_BASE;
    const old = read(`${source}/${descriptor.path}`);
    const current = JSON.parse(files.get(descriptor.path)!);
    assert.equal(current.projection.sourceHash, sha(files.get(holidayPath)!));
    current.projection.sourceHash = old.projection.sourceHash;
    assert.deepEqual(current, old, descriptor.path);
  }
  const zh = JSON.parse(files.get(`calendars/${AP23F3_ZH_CALENDAR}.json`)!);
  assert.equal(zh.rules.length, 9);
  assert.deepEqual(zh.inherits, ['ch-federal-calendar']);
  assert.equal(zh.validity.to, '2027-12-31');
});

test('AP23F3 complete 33-calendar projection equals independent native regeneration, not only its inventory', () => {
  const calendars = manifest.artifacts.filter((row: any) => row.role === 'calendar').map((row: any) => JSON.parse(files.get(row.path)!)) as CalendarRuleSet[];
  assertActivatedCalendarProjectionV10(holiday as HolidayCatalogV2, sha(files.get(holidayPath)!), calendars, FORMAT7_LEGACY_CALENDAR_BASELINE);
  const projected = projectActivatedCalendarsV10(holiday as HolidayCatalogV2, sha(files.get(holidayPath)!), FORMAT7_LEGACY_CALENDAR_BASELINE);
  assert.deepEqual([...calendars].sort((a, b) => a.calendarId.localeCompare(b.calendarId)), projected);
  const a = holiday.activation;
  assert.equal(objectSha({ data: holiday.data, calendarProjections: holiday.calendarProjections,
    matrixDecisions: a.matrixDecisions, projections: a.projections, procedureBindings: a.procedureBindings,
    anchorPolicies: a.anchorPolicies, supplementalRules: a.supplementalRules, supplementalScopes: a.supplementalScopes }), FORMAT10_HOLIDAY_CONTENT_SHA256);
});

test('AP23F3 retains federal social rules and strictly 50 BE bindings with unchanged 2026–2027 windows', () => {
  const path = 'social-procedures/ch-social-procedures.json';
  const old = read(`${AP23F3_BASE}/${path}`), current = JSON.parse(files.get(path)!);
  assert.equal(current.federalRules.length, 44);
  assert.equal(current.cantonalBindings.length, 50);
  assert.equal(current.releaseEligibility.length, 50);
  for (const key of ['federalRules', 'cantonalBindings', 'suspensionProfiles', 'filingProfiles', 'excludedPaths', 'sources'])
    assert.deepEqual(current[key], old[key], key);
  assert.ok(current.cantonalBindings.every((row: any) => row.procedureContextCanton === 'BE'));
  for (const entry of current.releaseEligibility) {
    const previous = old.releaseEligibility.find((row: any) => row.bindingRef.bindingId === entry.bindingRef.bindingId);
    assert.equal(entry.status, 'candidate');
    assert.equal(entry.releaseId, AP23F3_RELEASE_ID);
    assert.equal(entry.approval, null);
    for (const key of ['sourceReviewRef', 'referenceSuiteRef', 'caseCoverage', 'calculationCoverage']) assert.deepEqual(entry[key], previous[key], key);
    assert.ok(entry.calculationCoverage.from.startsWith('2026-'));
    assert.ok(entry.calculationCoverage.to.startsWith('2027-'));
    assert.deepEqual(entry.componentRefs.map((ref: any) => ref.contentId).sort(), ['be-public-holidays', 'ch-federal-calendar', 'ch-holiday-catalog']);
    for (const ref of entry.componentRefs) assert.ok(manifest.artifacts.some((row: any) => row.role === ref.role && row.contentId === ref.contentId && row.sha256 === ref.sha256));
  }
});

test('AP23F3 retains all 42 accepted definitions and policy hashes, including every old 25-path definition', () => {
  for (const key of ['laws', 'paths', 'qualificationPolicies', 'suspensionProfiles', 'sources', 'excludedPaths', 'preserved'])
    assert.deepEqual(catalog[key], historical[key], key);
  assert.equal(catalog.paths.length, 42);
  assert.equal(catalog.qualificationPolicies.length, 42);
  assert.equal(catalog.laws.length, 8);
  assert.equal(catalog.suspensionProfiles.length, 14);
  const old = read(`${AP23F3_BASE}/${AP23F3_ADMIN_PATH}`);
  assert.equal(old.paths.length, 25);
  for (const [group, key] of [['paths', 'pathId'], ['qualificationPolicies', 'pathId']] as const)
    for (const previous of old[group]) assert.deepEqual(catalog[group].find((row: any) => row[key] === previous[key]), previous);
  for (const [group, key] of [['paths', 'pathId'], ['qualificationPolicies', 'pathId'], ['laws', 'lawId'],
    ['suspensionProfiles', 'suspensionProfileId'], ['excludedPaths', 'exclusionId']] as const)
    for (const row of catalog[group]) assert.equal((ADMINISTRATIVE_V3_BASELINE[group] as Record<string, string>)[row[key]], objectSha(row));
});

test('AP23F3 approves only the technical contract, never any new source, operational release or path', () => {
  assert.equal(catalog.contractStatus, 'approved');
  assert.deepEqual(catalog.contractDecision, { id: 'DEC-2026-035', status: 'approved', on: '2026-10-22' });
  assert.equal(catalog.runtimeActive, false);
  assert.equal(catalog.releaseBinding.status, 'candidate');
  for (const key of ['releaseId', 'approval', 'sourceReviewRef', 'referenceSuiteRef']) assert.equal(catalog.releaseBinding[key], null);
  assert.deepEqual(catalog.releaseBinding.targetComponentRefs, []);
  assert.equal(catalog.releaseBinding.pathEligibility.length, 42);
  for (const entry of catalog.releaseBinding.pathEligibility) {
    assert.equal(entry.status, 'candidate');
    assert.deepEqual(entry.targetComponentRefs, []);
    assert.equal(entry.sourceReviewRef, null);
    assert.equal(entry.referenceSuiteRef, null);
  }
});

test('AP23F3 binds nine physical lists and every path-policy hash to exact target bytes, stripped of F2-only markers', () => {
  assert.equal(catalog.holidayBindings.length, 9);
  for (const binding of catalog.holidayBindings) {
    assert.equal(binding.projectionEvidence, undefined);
    assert.equal(binding.physicalBaseline.releaseId, AP23F3_RELEASE_ID);
    const previous = historical.holidayBindings.find((row: any) => row.holidayBindingId === binding.holidayBindingId);
    assert.deepEqual(binding.legalBinding, previous.legalBinding);
    const { physicalBaseline, ...legal } = binding;
    assert.equal((ADMINISTRATIVE_V3_BASELINE.holidayBindings as Record<string, string>)[binding.holidayBindingId],
      objectSha({ ...legal, calendarId: physicalBaseline.calendarId, projectionId: physicalBaseline.projectionId }));
    for (const ref of physicalBaseline.references) {
      const descriptor = manifest.artifacts.find((row: any) => row.contentId === ref.contentId && row.role === ref.role);
      assert.equal(ref.path, descriptor.path);
      assert.equal(ref.sha256, descriptor.sha256);
      assert.equal(ref.sha256, sha(files.get(ref.path)!));
    }
    for (const entry of catalog.releaseBinding.pathEligibility.filter((row: any) => row.holidayBindingId === binding.holidayBindingId)) {
      assert.equal(entry.holidayBindingSha256, objectSha(binding));
      assert.equal(entry.pathSha256, objectSha(catalog.paths.find((row: any) => row.pathId === entry.pathId)));
      assert.equal(entry.qualificationPolicySha256, objectSha(catalog.qualificationPolicies.find((row: any) => row.pathId === entry.pathId)));
      assert.equal(entry.suspensionProfileSha256, objectSha(catalog.suspensionProfiles.find((row: any) => row.suspensionProfileId === entry.suspensionProfileId)));
    }
  }
});

test('AP23F3 source summary is the complete union without redating copied historical source evidence', () => {
  const actual = [...new Set([...files.values()].flatMap(text => (JSON.parse(text).sources ?? []).map((source: any) => source.sourceId)))].sort();
  assert.deepEqual(manifest.sourceSummary.sourceIds, actual);
  const oldHoliday = read(`${AP23F3_BASE}/${holidayPath}`);
  assert.deepEqual(holiday.data.sources, oldHoliday.data.sources);
  assert.deepEqual(holiday.activation.sourceEvidence, oldHoliday.activation.sourceEvidence);
  assert.deepEqual(catalog.sources, historical.sources);
  assert.deepEqual(Object.keys(ADMINISTRATIVE_V3_BASELINE.sources).sort(), catalog.sources.map((row: any) => row.sourceId).sort());
  for (const { reviewedOn: _reviewedOn, reviewBasis: _reviewBasis, ...identity } of catalog.sources)
    assert.equal((ADMINISTRATIVE_V3_BASELINE.sources as Record<string, string>)[identity.sourceId], objectSha(identity));
});

test('AP23F3 rejects byte corruption, absent components and rehashed stale physical dependencies', () => {
  const corrupted = new Map(files);
  corrupted.set(AP23F3_ADMIN_PATH, corrupted.get(AP23F3_ADMIN_PATH)! + ' ');
  assert.throws(() => parseFormat10LocalReferenceData(manifestText, corrupted));
  corrupted.delete(AP23F3_ADMIN_PATH);
  assert.throws(() => parseFormat10LocalReferenceData(manifestText, corrupted));
  const copy = structuredClone(catalog), stale = copy.holidayBindings[0];
  stale.physicalBaseline.references[0].sha256 = '0'.repeat(64);
  for (const entry of copy.releaseBinding.pathEligibility.filter((row: any) => row.holidayBindingId === stale.holidayBindingId))
    entry.holidayBindingSha256 = objectSha(stale);
  const text = JSON.stringify(copy, null, 2) + '\n';
  const rewritten = structuredClone(manifest), descriptor = rewritten.artifacts.find((row: any) => row.path === AP23F3_ADMIN_PATH);
  descriptor.sha256 = sha(text);
  descriptor.byteLength = Buffer.byteLength(text);
  assert.throws(() => parseFormat10LocalReferenceData(JSON.stringify(rewritten), new Map(files).set(AP23F3_ADMIN_PATH, text)));
});
