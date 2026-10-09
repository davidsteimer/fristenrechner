// SPDX-License-Identifier: AGPL-3.0-only
// Immutable local preparation snapshot. This is NOT a release promotion or approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises';
import { dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export const candidatePath = 'data/candidates/2026-09-28-ap19c3';
export const outputPath = 'outputs/release-mvp05-2026-09-28/preparation-inputs.json';
export const candidateHash = '8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const reviewPaths = [
  'outputs/ap19c1-2026-09-25/source-review.json',
  'outputs/ap19c2-2026-09-28/sources/source-review.json',
  'outputs/ap19c3-2026-09-28/sources/source-review.json'
];
const suitePaths = [
  ['AP17B-ANWENDBARKEIT', 'tests/golden/candidates/ap17b-anwendbarkeit.json'],
  ['AP19B-SOCIAL-REFERENCES-1', 'tests/golden/candidates/ap19b-social-deadlines.json']
];
export const evidencePaths = [
  ...['1', '2', '3'].map(number => `docs/fachrecht/abnahme-ap19c${number}.md`),
  'docs/entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md',
  ...reviewPaths, ...suitePaths.map(([, path]) => path),
  'schemas/release-manifest-v5.schema.json', 'schemas/social-procedure-catalog.schema.json',
  'outputs/release-mvp04-2026-09-22/source-approval.json',
  'data/releases/2026-09-22-mvp-04-approved.1/manifest.json',
  'src/release/mvp04ReleaseData.ts', 'src/public-app/main.tsx',
  'spfx/src/core/config.ts', 'spfx/config/package-solution.json',
  'data/source-reviews/source-register.json', 'data/source-reviews/index.json'
];

/** Pure validation of actual file bytes, also exercised with negative fixtures. */
export function validateMvp05Inputs(files) {
  const bytes = path => { assert.ok(files.has(path), `Missing preparation evidence: ${path}`); return files.get(path); };
  const json = path => JSON.parse(bytes(path));
  const manifestPath = `${candidatePath}/manifest.json`;
  assert.equal(digest(bytes(manifestPath)), candidateHash, 'Accepted C3 manifest changed');
  const manifest = json(manifestPath);
  assert.equal(manifest.releaseId, '2026-09-28-ap19c3-candidate.1');
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.formatVersion, '5.0.0');
  assert.equal(manifest.artifacts.length, 10);
  for (const artifact of manifest.artifacts) {
    assert.ok(!isAbsolute(artifact.path) && !artifact.path.includes('\\') && !artifact.path.split('/').some(part => ['..', '.', ''].includes(part)), 'Unsafe artifact path');
    const content = bytes(`${candidatePath}/${artifact.path}`);
    assert.equal(digest(content), artifact.sha256, `Changed candidate artifact: ${artifact.path}`);
    assert.equal(content.length, artifact.byteLength);
  }
  const social = json(`${candidatePath}/social-procedures/ch-social-procedures.json`);
  assert.equal(social.federalRules.length, 24);
  assert.equal(social.cantonalBindings.length, 28);
  assert.equal(social.releaseEligibility.length, 28);
  assert.ok(social.federalRules.every(rule => rule.status === 'candidate'));
  assert.ok(social.cantonalBindings.every(binding => binding.status === 'candidate' && binding.procedureContextCanton === 'BE'));
  const reviews = new Map(reviewPaths.map(path => [json(path).reviewId, { path, sha256: digest(bytes(path)) }]));
  const suites = new Map(suitePaths.map(([id, path]) => [id, { path, sha256: digest(bytes(path)) }]));
  for (const item of social.releaseEligibility) {
    assert.equal(item.status, 'candidate');
    assert.equal(item.approval, null, 'Preparation must not grant operative approval');
    assert.equal(item.releaseId, manifest.releaseId);
    assert.equal(reviews.get(item.sourceReviewRef.reviewId)?.sha256, item.sourceReviewRef.sha256, 'Changed integration source evidence');
    assert.equal(suites.get(item.referenceSuiteRef.suiteId)?.sha256, item.referenceSuiteRef.sha256, 'Changed reference suite');
    assert.deepEqual(item.calculationCoverage, { from: '2026-01-01', to: '2027-12-31' });
  }
  for (const path of evidencePaths) bytes(path);
  const before = json('data/releases/2026-09-22-mvp-04-approved.1/manifest.json');
  const holiday = manifest.artifacts.find(item => item.role === 'holidayCatalog');
  assert.deepEqual(holiday, before.artifacts.find(item => item.role === 'holidayCatalog'), 'Holiday catalog must stay byte-identical');
  const audit = [...new Set([manifestPath, ...manifest.artifacts.map(item => `${candidatePath}/${item.path}`), ...evidencePaths])]
    .sort().map(path => ({ path, sha256: digest(bytes(path)), byteLength: bytes(path).length }));
  return {
    formatVersion: '1.0.0', dataKind: 'releasePreparationInputs', preparedOn: '2026-09-28',
    preparationId: 'mvp05-ap19-preparation.1', status: 'preparation-only',
    requestedBy: 'David Steimer', declaration: 'Dann starten wir die Releasevorbereitung und hoffen auf den Support.',
    targetVersions: { application: '0.5.0', package: '0.5.0.0', status: 'planned-not-built' },
    candidate: { path: candidatePath, releaseId: manifest.releaseId, sha256: candidateHash, status: 'candidate' },
    scope: { federalRules: 24, cantonalBindings: 28, operativeCantonsPlanned: ['BE'],
      socialCaseCoverage: { from: '2026-01-01', to: '2027-12-31' }, holidayCatalogUnchanged: true },
    permissions: { localPreparationAuthorized: true, sourceReviewApproved: false, dataPromotionApproved: false,
      installationAuthorized: false, publicationAuthorized: false, productionActivation: false },
    gates: ['combined-source-review-and-human-approval', 'controlled-data-promotion',
      'versioned-package-and-mirror-build', 'explicit-eq-installation-approval', 'fresh-eq-tests-and-manual-acceptance',
      'explicit-publication-approval', 'green-get-header-evidence-before-p', 'explicit-p-deployment-and-operation-approval'],
    integrationEvidence: { sourceReviews: [...reviews.values()], referenceSuites: [...suites.values()] },
    evidence: audit
  };
}

export async function prepareMvp05Inputs(repositoryRoot = root) {
  const files = new Map();
  const historicalPaths = new Set(['src/public-app/main.tsx', 'spfx/src/core/config.ts', 'spfx/config/package-solution.json',
    'data/source-reviews/source-register.json', 'data/source-reviews/index.json']);
  let recordedSnapshot;
  try { recordedSnapshot = JSON.parse(await readFile(resolve(repositoryRoot, outputPath))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const read = async path => {
    let filePath = path;
    if (historicalPaths.has(path) && recordedSnapshot) {
      const archived = `outputs/release-mvp05-2026-09-28/approval-inputs/${path}`;
      try {
        const bytes = await readFile(resolve(repositoryRoot, archived));
        assert.equal(digest(bytes), recordedSnapshot.evidence.find(item => item.path === path)?.sha256,
          `Historical preparation archive changed: ${path}`);
        filePath = archived;
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    assert.ok((await lstat(resolve(repositoryRoot, filePath))).isFile(), `Not a regular file: ${filePath}`);
    files.set(path, await readFile(resolve(repositoryRoot, filePath)));
  };
  await read(`${candidatePath}/manifest.json`);
  assert.equal(digest(files.get(`${candidatePath}/manifest.json`)), candidateHash, 'Accepted C3 manifest changed');
  for (const artifact of JSON.parse(files.get(`${candidatePath}/manifest.json`)).artifacts) await read(`${candidatePath}/${artifact.path}`);
  for (const path of evidencePaths) await read(path);
  return { snapshot: validateMvp05Inputs(files), files };
}

export async function persistMvp05Inputs(snapshot, destination = resolve(root, outputPath)) {
  const content = encode(snapshot);
  try {
    assert.ok((await lstat(destination)).isFile(), 'Preparation output must be a regular file');
    assert.ok((await readFile(destination)).equals(content), 'Existing preparation differs, create a new revision');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(dirname(destination), { recursive: true });
  try { await writeFile(destination, content, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await readFile(destination)).equals(content), 'Preparation readback mismatch');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { snapshot } = await prepareMvp05Inputs();
  await persistMvp05Inputs(snapshot);
  console.log(JSON.stringify({ outputPath, evidenceFiles: snapshot.evidence.length, status: snapshot.status, productionActivation: false }));
}
