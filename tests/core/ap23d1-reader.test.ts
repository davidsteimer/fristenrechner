// SPDX-License-Identifier: AGPL-3.0-only
// In-memory synthetic evidence is not a source review or production release.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFormat8Data, parseFormat8LocalReferenceData, getVerifiedAdministrativeData, assertTrustedFormat8Data } from '../../src/core/releaseFormat8';
import { parseFormat7Data } from '../../src/core/releaseFormat7';
import { socialObjectSha256 } from '../../src/core/socialCatalog';
import { buildSyntheticFormat8, changeSyntheticFormat8, createSyntheticFormat8Context, encodeSyntheticFormat8,
  refreshSyntheticFormat8Manifest, SYNTHETIC_ADMIN_PATH } from './ap23d1Fixtures';
import type { SyntheticFormat8Fixture } from './ap23d1Fixtures';

const parse = (fixture: SyntheticFormat8Fixture) => (fixture.manifest.releaseStatus === 'approved' ? parseFormat8Data : parseFormat8LocalReferenceData)(encodeSyntheticFormat8(fixture.manifest), fixture.files, fixture.legacyCalendars);
const socialPath = 'social-procedures/ch-social-procedures.json';
const holidayPath = 'holiday-catalogs/ch-holiday-catalog.json';

test('AP23D1 reader verifies 41 exact artifacts and preserves five profiles, 32 calendars and 44/50 social definitions', () => {
  for (const mode of ['approved', 'localReference'] as const) {
    const context = createSyntheticFormat8Context(mode);
    assert.equal(context.manifest.artifacts.length, 41);
    assert.equal(context.manifest.profileIds.length, 5);
    assert.equal(context.calendars.length, 32);
    assert.equal(context.catalog.data.rules.length, 479);
    assert.equal(context.catalog.activation.supplementalRules.length, 12);
    assert.equal(context.administrativeCatalog.paths.length, 12);
    assert.equal(context.socialCatalog.federalRules.length, 44);
    assert.equal(context.socialCatalog.cantonalBindings.length, 50);
    assert.equal(getVerifiedAdministrativeData(context)?.referenceOnly, mode === 'localReference');
    assert.equal(getVerifiedAdministrativeData(context)?.releaseId, context.manifest.releaseId);
    assert.deepEqual(getVerifiedAdministrativeData(context)?.coverage, { from: '2026-08-29', to: null });
  }
});

test('AP23D1 verified context is detached, deeply frozen and cannot be copied or serialized into a capability', () => {
  const fixture = buildSyntheticFormat8();
  const context = parse(fixture);
  assert.doesNotThrow(() => assertTrustedFormat8Data(context));
  for (const invalid of [undefined, null, {}, { ...context }, JSON.parse(JSON.stringify(context)),
    { ...context, mode: 'approved', runtimeActive: true }, Object.create(context), new Proxy(context, {})]) {
    assert.equal(getVerifiedAdministrativeData(invalid), undefined);
    assert.throws(() => assertTrustedFormat8Data(invalid));
  }
  assert.throws(() => { (context.administrativeCatalog.paths[0]!.duration as any).value = 1; }, TypeError);
  assert.throws(() => { (getVerifiedAdministrativeData(context) as any).referenceOnly = false; }, TypeError);
  assert.throws(() => { (context.calendars as any).pop(); }, TypeError);
  assert.throws(() => { (context.manifest as any).releaseStatus = 'approved'; }, TypeError);
  assert.equal(typeof (context.artifacts as any).set, 'undefined');
  assert.throws(() => Map.prototype.set.call(context.artifacts, 'attack', {}), TypeError);
  context.artifacts.forEach((_value, _key, map) => assert.equal(map, context.artifacts));
  fixture.files.clear(); fixture.manifest.releaseStatus = 'approved';
  assert.equal(context.artifacts.size, 41);
  assert.equal(context.manifest.releaseStatus, 'candidate');
});

test('AP23D1 candidate and approved entry points are disjoint and old consumer 7 rejects manifest 8', () => {
  for (const mode of ['approved', 'localReference'] as const) {
    const fixture = buildSyntheticFormat8(mode), text = encodeSyntheticFormat8(fixture.manifest);
    assert.throws(() => (mode === 'approved' ? parseFormat8LocalReferenceData : parseFormat8Data)(text, fixture.files, fixture.legacyCalendars));
    assert.throws(() => parseFormat7Data(text, fixture.files, fixture.legacyCalendars));
  }
});

for (const [name, mutate] of [
  ['missing file', (f: any) => f.files.delete(SYNTHETIC_ADMIN_PATH)],
  ['extra file', (f: any) => f.files.set('extra.json', '{}')],
  ['duplicate descriptor', (f: any) => f.manifest.artifacts.push(f.manifest.artifacts[0])],
  ['duplicate identity', (f: any) => { f.manifest.artifacts[1].contentId = f.manifest.artifacts[0].contentId; }],
  ['wrong minimum consumer', (f: any) => { f.manifest.compatibility.minimumConsumerFormatVersion = '7.0.0'; }],
  ['unknown manifest field', (f: any) => { f.manifest.runtimeActive = true; }],
  ['raw-byte whitespace tamper', (f: any) => f.files.set(SYNTHETIC_ADMIN_PATH, f.files.get(SYNTHETIC_ADMIN_PATH) + ' ')],
  ['wrong declared length', (f: any) => { f.manifest.artifacts[0].byteLength++; }],
  ['wrong declared hash', (f: any) => { f.manifest.artifacts[0].sha256 = '0'.repeat(64); }],
  ['role/schema mismatch', (f: any) => { f.manifest.artifacts.find((a: any) => a.role === 'administrativeProcedureCatalog').schemaId = f.manifest.artifacts[0].schemaId; }],
  ['missing manifest source', (f: any) => f.manifest.sourceSummary.sourceIds.pop()],
  ['extra manifest source', (f: any) => f.manifest.sourceSummary.sourceIds.push('SRC-NOT-PRESENT')],
  ['duplicate source union', (f: any) => f.manifest.sourceSummary.sourceIds.push(f.manifest.sourceSummary.sourceIds[0])],
  ['unknown release state', (f: any) => { f.manifest.releaseStatus = 'withdrawn'; }],
  ['finite global coverage change', (f: any) => { f.manifest.coverage.to = '2027-12-31'; }],
  ['traversal path', (f: any) => {
    const original = f.manifest.artifacts[0].path;
    f.manifest.artifacts[0].path = '../escape.json'; f.files.set('../escape.json', f.files.get(original)); f.files.delete(original);
  }]
] as const) test(`AP23D1 reader rejects ${name}`, () => { const fixture = buildSyntheticFormat8(); mutate(fixture); assert.throws(() => parse(fixture)); });

for (const [name, path, mutate] of [
  ['changed old profile rule', 'profiles/stpo.json', (d: any) => { d.rules[0].priority++; }],
  ['conflicting source provenance', 'profiles/bgg.json', (d: any) => { d.sources[0].title += ' changed'; }],
  ['duplicate local source', 'profiles/stpo.json', (d: any) => { d.sources.push(d.sources[0]); }],
  ['wrong calendar source hash', 'calendars/ap22-ti-944ed0286e9a.json', (d: any) => { d.projection.sourceHash = '0'.repeat(64); }],
  ['calendar inheritance loop', 'calendars/ap22-ti-944ed0286e9a.json', (d: any) => { d.inherits = [d.calendarId]; }],
  ['source review pending in approved declaration', SYNTHETIC_ADMIN_PATH, (d: any) => { d.releaseBinding.sourceReviewRef = null; }],
  ['administrative stale target hash', SYNTHETIC_ADMIN_PATH, (d: any) => { d.releaseBinding.targetComponentRefs[0].sha256 = '0'.repeat(64); }],
  ['administrative different release', SYNTHETIC_ADMIN_PATH, (d: any) => { d.releaseBinding.releaseId = '2026-10-14-wrong-release.1'; }],
  ['administrative withdrawn contract', SYNTHETIC_ADMIN_PATH, (d: any) => { d.contractStatus = 'withdrawn'; d.contractDecision.status = 'withdrawn'; }],
  ['administrative missing path approval', SYNTHETIC_ADMIN_PATH, (d: any) => { d.releaseBinding.pathEligibility.pop(); }],
  ['administrative serialised runtime authority', SYNTHETIC_ADMIN_PATH, (d: any) => { d.runtimeActive = true; }],
  ['social stale component hash', socialPath, (d: any) => { d.releaseEligibility[0].componentRefs[0].sha256 = '0'.repeat(64); }],
  ['social missing dependency', socialPath, (d: any) => { d.releaseEligibility[0].componentRefs.pop(); }],
  ['social foreign release', socialPath, (d: any) => { d.releaseEligibility[0].releaseId = '2026-10-14-foreign-release.1'; }],
  ['social missing binding permission', socialPath, (d: any) => { d.releaseEligibility.pop(); }],
  ['social missing route permission', socialPath, (d: any) => { d.releaseEligibility[0].contextRouteIds.pop(); }],
  ['social extended coverage', socialPath, (d: any) => { d.releaseEligibility[0].calculationCoverage.to = '2028-12-31'; }],
  ['changed old holiday rule', holidayPath, (d: any) => { d.data.rules[0].de += ' changed'; }]
] as const) test(`AP23D1 reader rejects resealed ${name}`, () => {
  const fixture = buildSyntheticFormat8('approved');
  changeSyntheticFormat8(fixture, path, mutate);
  assert.throws(() => parse(fixture));
});

test('AP23D1 rejected runtime flag and withdrawn contract also fail the local reference path', () => {
  for (const mutate of [(d: any) => { d.runtimeActive = true; }, (d: any) => { d.contractStatus = 'withdrawn'; d.contractDecision.status = 'withdrawn'; }]) {
    const fixture = buildSyntheticFormat8(); changeSyntheticFormat8(fixture, SYNTHETIC_ADMIN_PATH, mutate); assert.throws(() => parse(fixture));
  }
});

test('AP23D1 calendar physical binding cannot silently point to Bern, even with resealed definition hashes', () => {
  const fixture = buildSyntheticFormat8();
  changeSyntheticFormat8(fixture, SYNTHETIC_ADMIN_PATH, (d: any) => {
    const binding = d.holidayBindings[0];
    binding.physicalBaseline.calendarId = 'be-public-holidays';
    binding.physicalBaseline.references[0].contentId = 'be-public-holidays';
    binding.physicalBaseline.references[0].path = 'calendars/be-public-holidays.json';
    const holiday = JSON.parse(fixture.files.get(holidayPath)!);
    binding.physicalBaseline.projectionId = holiday.activation.projections.find((p: any) => p.calendarId === 'be-public-holidays').id;
    for (const entry of d.releaseBinding.pathEligibility) if (entry.holidayBindingId === binding.holidayBindingId) entry.holidayBindingSha256 = socialObjectSha256(binding);
  });
  assert.throws(() => parse(fixture));
});

test('AP23D1 administrative candidate does not borrow federal procedure permission or need party locations', () => {
  const context = createSyntheticFormat8Context();
  for (const binding of context.administrativeCatalog.holidayBindings) {
    assert.equal(binding.anchor, 'authoritySeat');
    assert.equal(binding.legalBinding.partyOrRepresentativeRequired, false);
    assert.equal(binding.physicalBaseline.eligibilityMeaning, 'physicalSourceOnlyNotFederalProcedurePermission');
  }
  assert.equal(context.catalog.activation.procedureBindings.filter(b => b.jurisdiction === 'CH-TI').length, 4);
  assert.equal(context.administrativeCatalog.paths.filter(p => p.lawId === 'lpamm-ti').length, 5);
});

for (const canton of ['AI', 'NE']) test(`AP23D1 rejects every ${canton} regional alternative without explicit area facts, including its base`, () => {
  const pristine = buildSyntheticFormat8();
  const holiday = JSON.parse(pristine.files.get(holidayPath)!);
  const projections = holiday.activation.projections.filter((p: any) => p.jurisdiction === `CH-${canton}`);
  assert.equal(projections.length, 2);
  for (const projection of projections) {
    const fixture = buildSyntheticFormat8();
    changeSyntheticFormat8(fixture, SYNTHETIC_ADMIN_PATH, (d: any) => {
      d.laws.find((law: any) => law.lawId === 'lpamm-ti').canton = canton;
      const binding = d.holidayBindings.find((b: any) => b.lawId === 'lpamm-ti');
      binding.authoritySeatCanton = canton;
      binding.physicalBaseline.calendarId = projection.calendarId;
      binding.physicalBaseline.projectionId = projection.id;
      binding.physicalBaseline.references[0].contentId = projection.calendarId;
      binding.physicalBaseline.references[0].path = `calendars/${projection.calendarId}.json`;
      for (const entry of d.releaseBinding.pathEligibility) if (entry.holidayBindingId === binding.holidayBindingId) entry.holidayBindingSha256 = socialObjectSha256(binding);
    });
    assert.throws(() => parse(fixture), /regional qualification/);
  }
});

test('AP23D1 rejects a path window preceding its geographic scope even when norm and definition hashes are internally consistent', () => {
  const fixture = buildSyntheticFormat8();
  changeSyntheticFormat8(fixture, SYNTHETIC_ADMIN_PATH, (d: any) => {
    const path = d.paths[0], entry = d.releaseBinding.pathEligibility.find((row: any) => row.pathId === path.pathId);
    path.temporalBinding.calculationCoverage.from = '2025-07-01';
    path.temporalBinding.sourceCoverage.from = '2025-07-01';
    entry.calculationCoverage.from = '2025-07-01';
    entry.pathSha256 = socialObjectSha256(path);
  });
  assert.throws(() => parse(fixture), /geographic coverage/);
});

test('AP23D1 fixtures retain the original AP23C bytes and create no release on disk', () => {
  const candidate = JSON.parse(readFileSync('tests/golden/candidates/ap23c-administrative-contract.json', 'utf8'));
  assert.equal(candidate.contractStatus, 'proposed');
  assert.equal(candidate.releaseBinding.status, 'candidate');
  assert.equal(candidate.releaseBinding.releaseId, null);
  const fixture = buildSyntheticFormat8('approved');
  const admin = JSON.parse(fixture.files.get(SYNTHETIC_ADMIN_PATH)!);
  assert.match(admin.releaseBinding.approval.approvedBy, /SYNTHETIC/);
  assert.match(fixture.manifest.releaseId, /synthetic/);
  refreshSyntheticFormat8Manifest(fixture);
  assert.equal(parse(fixture).manifest.artifacts.length, 41);
});
