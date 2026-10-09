// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { candidateRelativePath, candidateReleaseId, prepareAP19C2Candidate, persistAP19C2Candidate } from '../../scripts/build-ap19c2-candidate.mjs';
import { canonicalSocialJson, socialObjectSha256 } from '../../src/core/socialCatalog';
import type { SocialProcedureCatalog } from '../../src/core/socialTypes';

const basePath = 'data/candidates/2026-09-25-ap19c1';
const original = JSON.parse(readFileSync(join(basePath, 'social-procedures/ch-social-procedures.json'), 'utf8')) as SocialProcedureCatalog;

test('AP19C2 builder deterministically reproduces every actual candidate byte', () => {
  const first = prepareAP19C2Candidate();
  const second = prepareAP19C2Candidate();
  assert.deepEqual([...first.files], [...second.files]);
  assert.deepEqual(first.verification, second.verification);
  for (const [path, bytes] of first.files) assert.ok(readFileSync(join(candidateRelativePath, path)).equals(bytes), path);
});

test('AP19C2 preserves all C1 rules, bindings, exclusions and old provenance exactly', () => {
  const { catalog } = prepareAP19C2Candidate();
  assert.deepEqual(catalog.federalRules.slice(0, 16), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 16), original.cantonalBindings);
  assert.deepEqual(catalog.excludedPaths.slice(0, original.excludedPaths.length), original.excludedPaths);
  assert.deepEqual(catalog.sources.slice(0, original.sources.length), original.sources);
  assert.deepEqual(catalog.suspensionProfiles, original.suspensionProfiles);
  assert.deepEqual(catalog.filingProfiles, original.filingProfiles);
  assert.deepEqual(catalog.releaseEligibility.slice(0, 16), original.releaseEligibility.map(item => ({ ...item, releaseId: candidateReleaseId })));
});

test('AP19C2 only changes manifest and social artifact while all other components are byte-identical', () => {
  const { files } = prepareAP19C2Candidate();
  let unchanged = 0;
  for (const [path, bytes] of files) {
    if (['manifest.json', 'social-procedures/ch-social-procedures.json'].includes(path)) continue;
    assert.ok(readFileSync(join(basePath, path)).equals(bytes), path);
    unchanged += 1;
  }
  assert.equal(unchanged, 9);
  assert.equal(createHash('sha256').update(readFileSync(join(basePath, 'manifest.json'))).digest('hex'), 'eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524');
});

test('AP19C2 has four nationally reusable AVIG rules and eight distinct BE-only bindings without approval', () => {
  const { catalog } = prepareAP19C2Candidate();
  const rules = catalog.federalRules.filter(rule => rule.law === 'avig');
  const bindings = catalog.cantonalBindings.filter(binding => binding.ruleId.startsWith('CH-SOC-AVIG-ALE-'));
  assert.equal(rules.length, 4);
  assert.equal(bindings.length, 8);
  assert.equal(catalog.federalRules.length, 20);
  assert.equal(catalog.cantonalBindings.length, 24);
  assert.equal(catalog.releaseEligibility.length, 24);
  assert.ok(rules.every(rule => !rule.ruleId.includes('BE')));
  assert.ok(catalog.cantonalBindings.every(binding => binding.procedureContextCanton === 'BE'));
  assert.ok(catalog.releaseEligibility.every(item => item.status === 'candidate' && item.approval === null));
  assert.equal(catalog.federalRules.some(rule => rule.law === 'kvg'), false);
  for (const rule of rules) {
    assert.equal(bindings.filter(binding => binding.ruleId === rule.ruleId).length, 2);
    assert.equal(rule.calculation.anchorInputId, 'legalTriggerDate');
    assert.equal(rule.calculation.anchorBoundary, 'excluded');
    assert.equal(rule.suspensionProfileId, 'S_ATSG');
    assert.equal(rule.holidayPolicy, 'partyOrRepresentative');
  }
});

test('AP19C2 separates fund disposition reference from fund current-administration jurisdiction and office route', () => {
  const { catalog } = prepareAP19C2Candidate();
  for (const suffix of ['OBJ', 'APP', 'ADM', 'CORRECTION']) {
    const fund = catalog.cantonalBindings.find(binding => binding.bindingId === `BE-SOC-AVIG-ALE-${suffix}-FUND`)!;
    const office = catalog.cantonalBindings.find(binding => binding.bindingId === `BE-SOC-AVIG-ALE-${suffix}-OFFICE`)!;
    assert.ok(fund && office);
    assert.ok(fund.normBindings.some(binding => binding.temporalSelector === 'jurisdictionReferenceDate'));
    assert.equal(office.normBindings.some(binding => binding.temporalSelector === 'jurisdictionReferenceDate'), false);
    assert.ok(fund.contextRoutes[0]!.requiredFacts.some(fact => fact.factKey === 'avigControlCanton'));
    assert.ok(office.contextRoutes[0]!.requiredFacts.some(fact => fact.factKey === 'avigOfficeCanton'));
    for (const binding of [fund, office]) assert.equal(binding.contextRoutes[0]!.requiredFacts.some(fact => fact.factKey === 'partyDomicileCanton'), false);
    if (suffix === 'ADM') {
      assert.equal(fund.contextRoutes[0]!.contextRouteId, 'be-avig-ale-current-control-canton');
      assert.ok(fund.sourceRefs.some(ref => ref.locator.includes('laufende Zuständigkeit')));
      assert.equal(fund.sourceRefs.some(ref => ref.locator.includes('Abs. 2')), false);
    } else assert.ok(fund.sourceRefs.some(ref => ref.locator.includes('ursprünglichen Verfügung')));
  }
});

test('AP19C2 canonical hashes cover all 44 national and binding objects consistently', () => {
  const { catalog } = prepareAP19C2Candidate();
  const objects = [...catalog.federalRules, ...catalog.cantonalBindings];
  assert.equal(objects.length, 44);
  for (const object of objects) assert.equal(socialObjectSha256(object), createHash('sha256').update(canonicalSocialJson(object), 'utf8').digest('hex'));
});

test('AP19C2 persists idempotently and verifies all written bytes', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'ap19c2-builder-test-'));
  try {
    const prepared = prepareAP19C2Candidate();
    const target = join(temporary, 'candidate');
    const evidence = join(temporary, 'verification.json');
    persistAP19C2Candidate(prepared, target, evidence);
    persistAP19C2Candidate(prepared, target, evidence);
    for (const [path, bytes] of prepared.files) assert.ok(readFileSync(join(target, path)).equals(bytes));
    assert.equal(JSON.parse(readFileSync(evidence, 'utf8')).productionActivation, false);
  } finally { rmSync(temporary, { recursive: true }); }
});

test('AP19C2 refuses replacement before writing any missing file', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'ap19c2-builder-conflict-'));
  try {
    const prepared = prepareAP19C2Candidate();
    const originalBytes = Buffer.from('user-owned conflict\n');
    writeFileSync(join(temporary, 'manifest.json'), originalBytes);
    assert.throws(() => persistAP19C2Candidate(prepared, temporary, join(temporary, 'proof.json')), /Refusing to overwrite differing candidate file/);
    assert.ok(readFileSync(join(temporary, 'manifest.json')).equals(originalBytes));
    assert.equal(existsSync(join(temporary, 'profiles')), false);
    assert.equal(existsSync(join(temporary, 'proof.json')), false);
  } finally { rmSync(temporary, { recursive: true }); }
});
