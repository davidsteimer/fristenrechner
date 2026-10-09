// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { candidateRelativePath, candidateReleaseId, prepareAP19C3Candidate, persistAP19C3Candidate } from '../../scripts/build-ap19c3-candidate.mjs';
import { canonicalSocialJson, socialObjectSha256 } from '../../src/core/socialCatalog';
import type { SocialProcedureCatalog } from '../../src/core/socialTypes';

const basePath = 'data/candidates/2026-09-28-ap19c2';
const original = JSON.parse(readFileSync(join(basePath, 'social-procedures/ch-social-procedures.json'), 'utf8')) as SocialProcedureCatalog;

test('AP19C3 builder deterministically reproduces every actual candidate byte', () => {
  const first = prepareAP19C3Candidate();
  const second = prepareAP19C3Candidate();
  assert.deepEqual([...first.files], [...second.files]);
  assert.deepEqual(first.verification, second.verification);
  for (const [path, bytes] of first.files) assert.ok(readFileSync(join(candidateRelativePath, path)).equals(bytes), path);
});

test('AP19C3 preserves all C2 rules, bindings, exclusions and old provenance exactly', () => {
  const { catalog } = prepareAP19C3Candidate();
  assert.deepEqual(catalog.federalRules.slice(0, 20), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 24), original.cantonalBindings);
  assert.deepEqual(catalog.excludedPaths.slice(0, original.excludedPaths.length), original.excludedPaths);
  assert.deepEqual(catalog.sources.slice(0, original.sources.length), original.sources);
  assert.deepEqual(catalog.suspensionProfiles, original.suspensionProfiles);
  assert.deepEqual(catalog.filingProfiles, original.filingProfiles);
  assert.deepEqual(catalog.releaseEligibility.slice(0, 24), original.releaseEligibility.map(item => ({ ...item, releaseId: candidateReleaseId })));
});

test('AP19C3 only changes manifest and social artifact while all other components are byte-identical', () => {
  const { files } = prepareAP19C3Candidate();
  let unchanged = 0;
  for (const [path, bytes] of files) {
    if (['manifest.json', 'social-procedures/ch-social-procedures.json'].includes(path)) continue;
    assert.ok(readFileSync(join(basePath, path)).equals(bytes), path);
    unchanged += 1;
  }
  assert.equal(unchanged, 9);
  assert.equal(createHash('sha256').update(readFileSync(join(basePath, 'manifest.json'))).digest('hex'), '00a45f3766b376bda21fe13966ff5aad3769cddb9fe315890bd272576520fded');
});

test('AP19C3 has four nationally reusable KVG/OKP rules and four BE-only bindings without approval', () => {
  const { catalog } = prepareAP19C3Candidate();
  const rules = catalog.federalRules.filter(rule => rule.law === 'kvg');
  const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-KVG-OKP-'));
  assert.equal(rules.length, 4);
  assert.equal(bindings.length, 4);
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assert.equal(catalog.releaseEligibility.length, 28);
  assert.ok(rules.every(rule => !rule.ruleId.includes('BE')));
  assert.ok(catalog.cantonalBindings.every(binding => binding.procedureContextCanton === 'BE'));
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  for (const rule of rules) {
    assert.equal(bindings.filter(binding => binding.ruleId === rule.ruleId).length, 1);
    assert.equal(rule.calculation.anchorInputId, 'legalTriggerDate');
    assert.equal(rule.calculation.anchorBoundary, 'excluded');
    assert.equal(rule.suspensionProfileId, 'S_ATSG');
    assert.equal(rule.holidayPolicy, 'partyOrRepresentative');
  }
});

test('AP19C3 distinguishes product domicile at legal trigger from judicial domicile at appeal time', () => {
  const { catalog } = prepareAP19C3Candidate();
  for (const suffix of ['OBJ', 'APP', 'ADM', 'CORRECTION']) {
    const binding = catalog.cantonalBindings.find(item => item.bindingId === `BE-SOC-KVG-OKP-${suffix}`)!;
    const court = suffix === 'APP' || suffix === 'CORRECTION';
    const route = binding.contextRoutes[0]!;
    assert.equal(route.kind, court ? 'legal-jurisdiction' : 'product-scope');
    assert.equal(route.contextRouteId, court ? 'be-atsg58-court' : 'be-kvg-okp-product-scope');
    assert.ok(route.requiredFacts.some(fact => fact.factKey === 'partyDomicileCanton'));
    assert.equal(route.requiredFacts.some(fact => fact.factKey === 'courtCanton'), court);
    assert.ok(route.requiredFacts.some(fact => fact.factKey === 'decisionOrigin' && fact.allowedValues[0] === 'healthInsurer'));
    assert.equal(binding.normBindings.some(norm => norm.temporalSelector === 'jurisdictionReferenceDate'), court);
    if (!court) assert.ok(binding.normBindings.some(norm => norm.locator.includes('legalTriggerDate') && norm.temporalSelector === 'legalTriggerDate'));
    assert.equal(JSON.stringify(route).includes('authoritySeat'), false);
  }
});

test('AP19C3 preserves statutory KVG exclusions separately from product limits', () => {
  const { catalog } = prepareAP19C3Candidate();
  const references = JSON.parse(readFileSync('tests/golden/candidates/ap19b-social-deadlines.json', 'utf8'));
  const rows = references.cases.filter((item: any) => /^S(1[1-9]|2[0-2])$/.test(item.id));
  assert.equal(rows.length, 12);
  for (const row of rows) {
    const exclusion = catalog.excludedPaths.find(item => item.law === 'kvg' && item.matter === row.overrides.subject);
    assert.ok(exclusion, row.id);
    assert.equal(exclusion.reasonKind, row.expected.reason);
  }
});

test('AP19C3 canonical hashes cover all 52 national and binding objects consistently', () => {
  const { catalog } = prepareAP19C3Candidate();
  const objects = [...catalog.federalRules, ...catalog.cantonalBindings];
  assert.equal(objects.length, 52);
  for (const object of objects) assert.equal(socialObjectSha256(object), createHash('sha256').update(canonicalSocialJson(object), 'utf8').digest('hex'));
});

test('AP19C3 persists idempotently and verifies all written bytes', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'ap19c3-builder-test-'));
  try {
    const prepared = prepareAP19C3Candidate();
    const target = join(temporary, 'candidate');
    const evidence = join(temporary, 'verification.json');
    persistAP19C3Candidate(prepared, target, evidence);
    persistAP19C3Candidate(prepared, target, evidence);
    for (const [path, bytes] of prepared.files) assert.ok(readFileSync(join(target, path)).equals(bytes));
    assert.equal(JSON.parse(readFileSync(evidence, 'utf8')).productionActivation, false);
  } finally { rmSync(temporary, { recursive: true }); }
});

test('AP19C3 refuses replacement before writing any missing file', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'ap19c3-builder-conflict-'));
  try {
    const prepared = prepareAP19C3Candidate();
    const originalBytes = Buffer.from('user-owned conflict\n');
    writeFileSync(join(temporary, 'manifest.json'), originalBytes);
    assert.throws(() => persistAP19C3Candidate(prepared, temporary, join(temporary, 'proof.json')), /Refusing to overwrite differing candidate file/);
    assert.ok(readFileSync(join(temporary, 'manifest.json')).equals(originalBytes));
    assert.equal(existsSync(join(temporary, 'profiles')), false);
    assert.equal(existsSync(join(temporary, 'proof.json')), false);
  } finally { rmSync(temporary, { recursive: true }); }
});

