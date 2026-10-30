// SPDX-License-Identifier: AGPL-3.0-only
// Post-acceptance diagnosis only. No legal data, product fix or release promotion.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ap23m3CandidateRuntime, ap23m3ManifestText } from '../src/release/ap23m3CandidateData';
import { mvp09Runtime, mvp09ManifestText } from '../src/release/mvp09ReleaseData';
import { hasSocialUi, socialUiPath } from '../src/ui/socialUi';
import type { CalculationData } from '../src/core';
import type { VrpgSelectionState } from '../src/ui/vrpgSelection';

const root = fileURLToPath(new URL('../', import.meta.url));
const reportPath = 'outputs/ap23m3-2026-10-28/post-acceptance-social-ui-finding.json';
const manifest17 = 'data/candidates/2026-10-28-ap23m3/manifest.json';
const manifest9 = 'data/releases/2026-10-18-mvp-09-approved.1/manifest.json';
const hash = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const read = (relative: string): Buffer => fs.readFileSync(path.join(root, relative));
const selections: readonly VrpgSelectionState[] = [
  { area: 'social', law: 'ivg', action: 'preliminary-objection', stage: '' },
  { area: 'social', law: 'ahvg', action: 'objection', stage: '' },
  { area: 'social', law: 'mvg', action: 'objection', stage: '' }
];

function evaluate(name: string, data: CalculationData): object {
  const catalogs = [...data.socialProcedureCatalogs!.values()];
  assert.equal(catalogs.length, 1);
  const catalog = catalogs[0]!;
  return {
    name, formatVersion: data.formatVersion, releaseId: data.releaseId,
    socialCatalogs: catalogs.length, federalRules: catalog.federalRules.length,
    bernBindings: catalog.cantonalBindings.filter(binding => binding.procedureContextCanton === 'BE').length,
    hasSocialUi: hasSocialUi(data),
    selections: selections.map(input => {
      const resolved = socialUiPath(data, input);
      return { input, defined: resolved !== undefined, ruleId: resolved?.rule.ruleId ?? null,
        bindings: resolved?.selections.length ?? 0 };
    })
  };
}

assert.equal(hash(ap23m3ManifestText), hash(read(manifest17)), 'Embedded M3 manifest differs from actual candidate bytes');
assert.equal(hash(mvp09ManifestText), hash(read(manifest9)), 'Embedded MVP09 manifest differs from approved data bytes');
const currentData = ap23m3CandidateRuntime.data;
const priorData = mvp09Runtime.data;
assert.equal(currentData.formatVersion, '17.0.0');
assert.equal(priorData.formatVersion, '9.0.0');
for (const data of [currentData, priorData]) {
  const catalogs = [...data.socialProcedureCatalogs!.values()];
  assert.equal(catalogs.length, 1);
  assert.equal(catalogs[0]!.federalRules.length, 44);
  assert.equal(catalogs[0]!.cantonalBindings.filter(binding => binding.procedureContextCanton === 'BE').length, 50);
}
assert.equal(hasSocialUi(currentData), false, 'This historical diagnosis must fail after a product fix');
assert.equal(hasSocialUi(priorData), true);
for (const selection of selections) {
  assert.equal(socialUiPath(currentData, selection), undefined);
  assert.ok(socialUiPath(priorData, selection));
}

const boundPaths = [
  'scripts/check-ap23m3-social-ui-regression.ts', 'src/ui/socialUi.ts', 'src/ui/vrpgSelection.ts',
  'src/release/ap23m3CandidateData.ts', 'src/release/mvp09ReleaseData.ts',
  'src/core/format17CalculationData.ts', 'src/core/format9CalculationData.ts', manifest17, manifest9,
  'data/candidates/2026-10-28-ap23m3/social-procedures/ch-social-procedures.json',
  'data/releases/2026-10-18-mvp-09-approved.1/social-procedures/ch-social-procedures.json'
];
const report = {
  kind: 'ap23m3-post-acceptance-social-ui-finding', id: 'social-ui-format17-disabled', gate: 'R10-H01',
  status: 'confirmed-release-blocker', checkedOn: '2026-10-28', localOnly: true,
  legalRulesChanged: false, knownAfterHumanAcceptance: true, humanAcceptanceOfFinding: false,
  fixImplemented: false, sourceReleaseApproved: false, operatingChanges: false,
  scope: 'Read-only reproduction through actual native data contexts and UI helper. No UI render, installation or production assertion.',
  observation: 'hasSocialUi explicitly enumerates formats 5 through 16 and omits format 17. socialUiPath therefore returns undefined before resolving preserved Bern social paths.',
  current: evaluate('genuine-ap23m3-native-local-reference', currentData),
  prior: evaluate('genuine-approved-mvp09', priorData),
  bindings: boundPaths.map(relative => {
    const bytes = read(relative);
    return { path: relative, byteLength: bytes.length, sha256: hash(bytes) };
  }),
  assertionsPassed: true, reportDoesNotAuthorizeFix: true
};
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(root, reportPath), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ path: reportPath, status: report.status, sha256: hash(read(reportPath)) }));
} else {
  console.log(JSON.stringify(report, null, 2));
}
