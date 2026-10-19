// SPDX-License-Identifier: AGPL-3.0-only
// Fresh acceptance evidence without rewriting the historical proposal or reports.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAP23E2 } from './check-ap23e2-contract.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(root, path));
const historicReportPath = 'outputs/ap23e2-2026-10-18/QA-AP23E2.json';
const independentPath = 'outputs/ap23e2-2026-10-18/QA-AP23E2-INDEPENDENT.json';
const decisionPath = 'docs/entscheidungen/DEC-2026-033-beschluss.md';
const destination = 'outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json';
const bound = [
  [historicReportPath, 'ac7fd146a9db098d65b37c2c586fab36db0072290195b213f3d7e0cd00ca111b'],
  [independentPath, '26c739ed97ba82eebb888358a811052ace41e53554bebefaf5a01d39dbe44059'],
  ['docs/entscheidungen/DEC-2026-033-qualifizierte-kantonalverfahren-v2.md', '4f93a38a3098b1c965652374c91bdca0dbf7865c7ca8f4faf62c976f00511c68'],
  ['docs/architektur/verwaltungsverfahrensvertrag-ap23e2.md', 'abf6b9c0b58f0e030fe9bd885508c4520b3c7e986cbdf7f20e285fff4f6ae344']
];
const inspect = async path => {
  const bytes = await read(path);
  return { path, byteLength: bytes.length, sha256: digest(bytes) };
};
const executeJson = (executable, args) => JSON.parse(execFileSync(executable, args, {
  cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 180000
}));

export async function verifyAcceptance() {
  for (const [path, expected] of bound) assert.equal(digest(await read(path)), expected, path);
  const historic = JSON.parse(await read(historicReportPath));
  const independent = JSON.parse(await read(independentPath));
  // Check each bound artefact before running code and once more after the tests.
  for (const expected of historic.artifacts) assert.deepEqual(await inspect(expected.path), expected);
  const protectedPaths = [...new Set([...bound.map(([p]) => p), ...historic.artifacts.map(a => a.path),
    'outputs/ap23e2-candidate-2026-10-18/candidate-integrity.json'])];
  const before = await Promise.all(protectedPaths.map(inspect));
  const headBefore = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const schemas = executeJson(process.execPath, ['scripts/build-ap23e2-schemas.mjs', '--check']);
  const candidate = executeJson(process.execPath, ['scripts/build-ap23e2-candidate.mjs', '--check']);
  const freshIndependent = executeJson(resolve(root, '.venv/bin/python'), ['scripts/check_ap23e2_independent.py']);
  assert.deepEqual(freshIndependent, independent, 'Independent recheck differs from bound evidence');
  const fresh = await runAP23E2();
  // Compare the actual JSON evidence bytes, not an in-memory object carrying
  // optional undefined values that JSON intentionally does not represent.
  assert.equal(JSON.stringify(fresh, null, 2) + '\n', (await read(historicReportPath)).toString('utf8'),
    'Fresh serialized contract evidence differs from bound bytes');
  assert.deepEqual(await Promise.all(protectedPaths.map(inspect)), before, 'Historical evidence changed');
  const headAfter = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(headAfter, headBefore);
  const decision = (await read(decisionPath)).toString('utf8');
  assert.match(decision, /^status: beschlossen$/m);
  assert.match(decision, /^entscheidungsdatum: 2026-10-18$/m);
  assert.match(decision, /DEC-2026-033 ist bestätigt\. Bitte starte die technische Abnahme\./);
  for (const [, sha] of bound.slice(2)) assert.ok(decision.includes(sha));
  return {
    status: 'passed', workPackage: 'AP23E2', verificationDate: '2026-10-18',
    scope: 'technicalContractAcceptanceCheck',
    governance: { decisionId: 'DEC-2026-033', status: 'confirmedByDavidSteimer',
      packageResultAcceptance: 'pendingHumanConfirmation', decisionEvidence: await inspect(decisionPath) },
    historicalCandidateStatus: 'proposedUnmodified', runtimeActive: false,
    productIntegrationTest: false, sourceReleaseApproved: false, ap23e3Started: false,
    checks: { boundArtefacts: historic.artifacts.length, historicalReportsUnchanged: 2,
      schemaRegeneration: schemas.status, candidateRegeneration: candidate.mode,
      freshMainReportMatches: true, freshIndependentReportMatches: true,
      mainComparison: 'exactSerializedJsonBytes',
      totalPaths: fresh.paths, legacyPaths: fresh.unchangedLegacyPaths, newPaths: fresh.newPaths,
      referenceCases: fresh.referenceCases, datedCases: fresh.datedCases, blockedCases: fresh.blockedCases,
      catalogNegatives: fresh.negativeCatalogMutations, inputNegatives: fresh.negativeInputMutations,
      independentNegatives: freshIndependent.negativeMutations.length,
      retainedRawComponents: fresh.retainedArtifactBytes,
      legacyRuntimeReferences: fresh.legacyReferences.length },
    unchangedHead: headAfter, preservedTrees: fresh.preservedTrees,
    preservedSchemaBaselines: fresh.preservedSchemaBaselines, preservedArtefacts: before,
    checker: await inspect('scripts/check-ap23e2-acceptance.mjs')
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await verifyAcceptance();
  if (process.argv.includes('--write')) {
    await mkdir(dirname(resolve(root, destination)), { recursive: true });
    await writeFile(resolve(root, destination), JSON.stringify(report, null, 2) + '\n');
  }
  const { preservedArtefacts, preservedSchemaBaselines, ...summary } = report;
  console.log(JSON.stringify(summary, null, 2));
}
