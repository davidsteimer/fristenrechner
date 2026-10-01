// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { before, describe, it } from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { calculateSocialDeadline } from '../../src/core';
import type { SocialDeadlineInput } from '../../src/core';
import { ap19c3CandidateCalculationData as candidate } from '../../src/release/ap19c3CandidateData';

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, '.work/public-ap19c3');
const releaseId = '2026-09-28-ap19c3-candidate.1';
const candidateManifest = resolve(root, 'data/candidates/2026-09-28-ap19c3/manifest.json');
const manifestSha256 = '8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da';
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

describe('Lokaler statischer AP19C3-Kandidat zur Releasevorbereitung', () => {
  before(async () => {
    assert.equal(digest(await readFile(candidateManifest)), manifestSha256);
    await execFileAsync(process.execPath, [resolve(root, 'scripts/build-public-app.mjs')], {
      cwd: root, env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: 'ap19c3' }
    });
  });

  it('baut getrennt vom Standardrelease und kennzeichnet den Build als nicht bereitstellbar', async () => {
    const manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
    assert.equal(manifest.application, 'fristenrechner-public');
    assert.equal(manifest.version, 'ap19c3-local-candidate');
    assert.equal(manifest.dataReleaseId, releaseId);
    assert.equal(manifest.status, 'candidate');
    assert.equal(manifest.deployable, false);
    assert.match(manifest.assets.javascript, /^\.\/assets\/app-[A-Z0-9]+\.js$/);
    assert.match(manifest.assets.stylesheet, /^\.\/assets\/app-[A-Z0-9]+\.css$/);
    const javascript = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
    assert.ok(javascript.includes(releaseId));
    assert.ok(javascript.includes('AP19C3'));
    assert.ok(javascript.includes('Lokaler Integrationskandidat einschliesslich KVG/OKP'));
    assert.ok(javascript.includes('CH-SOC-KVG-OKP-OBJ'));
    assert.ok(javascript.includes('CH-SOC-ELG-OBJ'));
    assert.ok(javascript.includes('CH-SOC-AVIG-ALE-OBJ'));
    // The historical MVP 0.4 ID remains legitimate provenance inside the
    // candidate manifest. The entry point, not a substring count, selects data.
    const entry = await readFile(resolve(root, 'src/public-app/ap19c3-main.tsx'), 'utf8');
    assert.doesNotMatch(entry, /mvp04CalculationData|mvp04ReleaseData/);
    assert.equal(digest(await readFile(candidateManifest)), manifestSha256);
  });

  it('enthält nur lokale Laufzeitassets und keine QA-Vorgaben oder synthetischen Freigaben', async () => {
    const manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
    const javascript = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
    const files = (await readdir(output, { recursive: true })).join('\n');
    assert.doesNotMatch(files, /\.map$/m);
    assert.doesNotMatch(javascript, /stpo-weekend|vrpg-special-gate|qaPresets|SYNTHETIC TEST|TEST-NOT-A-RELEASE/);
    assert.doesNotMatch(javascript, /\bfetch\s*\(|new XMLHttpRequest\b|new WebSocket\b|new EventSource\b/);
    assert.equal(await readFile(resolve(output, '.htaccess'), 'utf8'), await readFile(resolve(root, 'public-app/.htaccess'), 'utf8'));
    const entry = await readFile(resolve(root, 'src/public-app/ap19c3-main.tsx'), 'utf8');
    assert.match(entry, /ap19c3CandidateCalculationData/);
    assert.doesNotMatch(entry, /initialState|qaPreset|socialObjectSha256|status\s*=\s*['"]approved/);
  });

  it('belässt alle 28 eingebetteten Sozialpfade im Kandidatenstatus ohne berechnetes Enddatum', () => {
    const catalog = candidate.socialProcedureCatalogs!.get('ch-social-procedures')!;
    assert.equal(catalog.federalRules.length, 24);
    assert.equal(catalog.cantonalBindings.length, 28);
    assert.equal(catalog.releaseEligibility.length, 28);
    assert.ok(catalog.releaseEligibility.every(entry => entry.status === 'candidate' && entry.approval === null));
    for (const binding of catalog.cantonalBindings) {
      const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId)!;
      const route = binding.contextRoutes[0]!;
      const needsJurisdictionDate = [...rule.normBindings, ...binding.normBindings]
        .some(norm => norm.temporalSelector === 'jurisdictionReferenceDate');
      const input: SocialDeadlineInput = {
        ruleId: rule.ruleId, bindingId: binding.bindingId, contextRouteId: route.contextRouteId,
        procedureContextCanton: 'BE',
        caseFacts: Object.fromEntries(route.requiredFacts.map(fact => [fact.factKey, fact.allowedValues[0]])),
        qualificationBasis: 'displayed-model-scope', matter: rule.matter, triggerKind: rule.triggerKind,
        notificationChannel: 'individual-service', notificationConfirmed: false, legalTriggerDate: '2026-09-16',
        ...(needsJurisdictionDate ? {jurisdictionReferenceDate: '2026-09-16'} : {}),
        ...(rule.calculation.durationInputId ? {days: 10} : {}),
        holidayResolution: {status: 'resolved', calendarBindingId: 'be-party', anchors: [{role: 'party', canton: 'BE', spatialScopeId: 'BE'}]}
      };
      const result = calculateSocialDeadline(input, candidate);
      assert.equal(result.outcome, 'blocked', binding.bindingId);
      assert.deepEqual(result.blockReasonKeys, ['not-released'], binding.bindingId);
      assert.equal(result.finalDeadline, undefined, binding.bindingId);
    }
  });

  it('bleibt vom inzwischen freigegebenen normalen MVP-0.6-Einstieg und seinem Commit-Pin getrennt', async () => {
    const entry = await readFile(resolve(root, 'src/public-app/main.tsx'), 'utf8');
    const build = await readFile(resolve(root, 'scripts/build-public-app.mjs'), 'utf8');
    const pin = await readFile(resolve(root, 'spfx/src/core/config.ts'), 'utf8');
    assert.match(entry, /mvp06CalculationData/);
    assert.doesNotMatch(entry, /ap19c3/);
    assert.match(build, /isCandidate \? `\$\{candidateName\}-local-candidate` : '0\.6\.0'/);
    assert.match(pin, /[a-f0-9]{40}\/data\/releases\/2026-10-01-mvp-06-approved\.1/);
  });

  it('weist nicht unterstützte Kandidaten weiterhin ohne Umdeutung zurück', async () => {
    await assert.rejects(execFileAsync(process.execPath, [resolve(root, 'scripts/build-public-app.mjs')], {
      cwd: root, env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: 'mvp05-approved' }
    }), /Unbekannter lokaler Datenkandidat/);
  });
});
