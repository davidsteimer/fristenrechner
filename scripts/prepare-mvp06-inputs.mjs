// SPDX-License-Identifier: AGPL-3.0-only
// Immutable local preparation evidence. Never a source approval or promotion.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises';
import { dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
export const candidatePath = 'data/candidates/2026-10-01-ap20c3';
export const candidateHash = 'b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450';
export const outputPath = 'outputs/release-mvp06-2026-10-01/preparation-inputs.json';
export const historicalRoot = 'outputs/release-mvp06-2026-10-01/historical-baseline';
const productionPath = 'data/releases/2026-09-28-mvp-05-approved.1';
const protocolPaths = ['outputs/ap20c1-2026-09-30/pruefprotokoll.json', 'outputs/ap20c2-2026-10-01/pruefprotokoll.json', 'outputs/ap20c3-2026-10-01/pruefprotokoll.json'];
const controls = ['outputs/ap20c1-2026-09-30/quellenkontrolle.json', 'outputs/ap20c2-2026-10-01/quellenkontrolle.json', 'outputs/ap20c3-2026-10-01/quellenkontrolle.json'];
const approvalPath = 'outputs/release-mvp05-2026-09-28/source-approval.json';
const ap20bPath = 'outputs/ap20b-2026-09-30/pruefprotokoll.json';
const priorReviewPaths = ['outputs/ap19c1-2026-09-25/source-review.json', 'outputs/ap19c2-2026-09-28/sources/source-review.json', 'outputs/ap19c3-2026-09-28/sources/source-review.json'];
const reviewPaths = [approvalPath, ...controls];
const suitePaths = [
  ['AP17B-ANWENDBARKEIT', 'tests/golden/candidates/ap17b-anwendbarkeit.json'],
  ['AP19B-SOCIAL-REFERENCES-1', 'tests/golden/candidates/ap19b-social-deadlines.json'],
  ['AP20B-SOCIAL-DATES-1', 'tests/golden/candidates/ap20b-social-dates.json']
];
const pinnedEvidence = {
  [`${candidatePath}/manifest.json`]: candidateHash,
  [`${productionPath}/manifest.json`]: '3aa09c80c93ef56d472748c4a5496d439537272d96491497b2c678e3c7e20715',
  [protocolPaths[0]]: '691d831b5220676a89dd48acf9fcab199f52ba66edcfd90fdc2a86f0d3bd8918',
  [protocolPaths[1]]: '311cb80a027c0de883a7c07c46ba59e150065bdad3657a2c4947dec0bbacb2e9',
  [protocolPaths[2]]: '3dd855f4a023a2d5486a77753d6719bf5e494dda769521c9ce52042f62381866',
  [ap20bPath]: '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d',
  [approvalPath]: '2897874ed52c826bb43dc61270f8122cf996b4fa2070904eacc4d672f551f768',
  [priorReviewPaths[0]]: 'a3a423687f45a3706dc34095d41c5356cd97891b21e7989bde47b6f363acf773',
  [priorReviewPaths[1]]: '33d2fe1c6f6e1d54a97f8a9a54c97ce4a58aea56d0158a029ffa2a5d0f43abc3',
  [priorReviewPaths[2]]: '00f16cfb9653d32a73555c9ccd6c22a32af7810aae0068fe540d5497aac1b6e9',
  'docs/fachrecht/abnahme-ap20c1.md': 'f94289c3069128a26bb4a270d178982dac342d0f3267b2059dbe0d8c6e657f11',
  'docs/fachrecht/abnahme-ap20c2.md': '864543a15afb57b205d9a183134a6eeb91bc19aeefd92bbcd9bdefaa2a1bc7b1',
  'docs/fachrecht/abnahme-ap20c3.md': 'cd460ccfb4a9895f53812b54c648b8f834ed61e795914bc6fd7f2f8f3dde6f64',
  'docs/entscheidungen/DEC-2026-026-beschluss.md': '16873c28621edcac92e490814c5196fbbfb34900d8e10d4c767cda8a5359ef7a',
  'src/public-app/main.tsx': 'b0a114b392d2efaa412251845f8a926759c63a22734df4deb0939291a5fb10b7',
  'src/release/mvp05ReleaseData.ts': '82e1975ff14e77a4398a0d59529ce62ca301c7308538fce14800910d82147afc',
  'spfx/src/core/config.ts': '68b6944a9e0de6afaadb2f6d4980948bd198071efbf8263d2cc51cf88f2e593c',
  'spfx/config/package-solution.json': '4759ce8b8edc31cb1eea21b8056b324d84295a9bbfaabeafa7ab8dd171e47f88',
  'spfx/package.json': 'aa2e2bead634d78cb0396505aa1b99c19449d77aa8a59706833f75e42984bdaa',
  'package-lock.json': '671267ac6032fbe723bac87e34e385f83b6665ed570c937553399d0ae22afd44'
};
export const evidencePaths = [...new Set([
  ...Object.keys(pinnedEvidence), ...reviewPaths, ...suitePaths.map(([, path]) => path),
  'docs/fachrecht/abnahme-ap20a.md', 'docs/fachrecht/abnahme-ap20b.md',
  'docs/entscheidungen/DEC-2026-024-nationales-sozialversicherungsmodell.md',
  'docs/entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md',
  'schemas/release-manifest-v6.schema.json', 'schemas/social-procedure-catalog-v2.schema.json',
  'data/source-reviews/source-register.json', 'data/source-reviews/index.json',
  'data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json',
  'package.json', 'spfx/package-lock.json',
  'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json'
])];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const archiveNeeded = path => /^(?:src|spfx|schemas|scripts|tests|\.work)\//.test(path) || /^package(?:-lock)?\.json$/.test(path) || /^data\/source-reviews\//.test(path);

export function assertSafeEvidencePath(path) {
  assert.ok(typeof path === 'string' && !isAbsolute(path) && !path.includes('\\') && !/[\0\r\n]/.test(path)
    && !path.split('/').some(part => ['..', '.', ''].includes(part)), `Unsafe preparation path: ${path}`);
  assert.ok(/^(?:docs|data|src|spfx|schemas|scripts|tests|outputs|\.work)\//.test(path) || /^package(?:-lock)?\.json$/.test(path), `Out-of-scope preparation path: ${path}`);
}

/** Only the predetermined, hash-bound proof structures contribute extra paths. */
function dependencyEdges(files) {
  const json = path => JSON.parse(files.get(path));
  const edges = [];
  for (const directory of [candidatePath, productionPath]) {
    for (const entry of json(`${directory}/manifest.json`).artifacts) {
      assertSafeEvidencePath(entry.path.startsWith('data/') ? entry.path : `data/${entry.path}`);
      edges.push({ ...entry, path: `${directory}/${entry.path}` });
    }
  }
  for (let index = 0; index < protocolPaths.length; index++) {
    const proof = json(protocolPaths[index]);
    const successor = index + 1 < protocolPaths.length ? json(protocolPaths[index + 1]) : undefined;
    const preimages = successor?.preservation?.historicalPreimages ?? [];
    for (const entry of proof.evidence) {
      const preimage = preimages.find(item => item.originalPath === entry.path);
      edges.push({ ...entry, path: preimage?.preservedAt ?? entry.path });
    }
    for (const check of proof.checks ?? []) if (check.evidence) edges.push(check.evidence);
    if (proof.isolatedBuild?.verification) edges.push(proof.isolatedBuild.verification);
    edges.push(...(proof.isolatedBuild?.stepLogs ?? []), ...(proof.artifactChecks ?? []));
  }
  edges.push(...json(ap20bPath).evidence, ...json(approvalPath).evidence);
  for (const path of controls) edges.push(...json(path).baselineBindings);
  const extension = json(`${candidatePath}/manifest.json`).extensions['steimer.candidate'];
  edges.push(...extension.sourceEvidence, extension.acceptanceEvidence, extension.decisionEvidence);
  for (const edge of edges) {
    assertSafeEvidencePath(edge.path);
    assert.match(edge.sha256, /^[a-f0-9]{64}$/);
  }
  return edges;
}

/** Pure byte validation, independent of the current post-promotion workspace. */
export function validateMvp06Inputs(files, expectedSnapshot) {
  const bytes = path => { assertSafeEvidencePath(path); assert.ok(files.has(path), `Missing preparation evidence: ${path}`); return files.get(path); };
  const json = path => JSON.parse(bytes(path));
  for (const path of evidencePaths) bytes(path);
  for (const [path, hash] of Object.entries(pinnedEvidence)) assert.equal(digest(bytes(path)), hash, `Changed pinned preparation input: ${path}`);
  for (const edge of dependencyEdges(files)) {
    assert.equal(digest(bytes(edge.path)), edge.sha256, `Changed bound preparation input: ${edge.path}`);
    if (edge.byteLength !== undefined) assert.equal(bytes(edge.path).length, edge.byteLength);
  }
  const manifest = json(`${candidatePath}/manifest.json`);
  assert.equal(manifest.releaseId, '2026-10-01-ap20c3-candidate.1');
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.formatVersion, '6.0.0');
  assert.equal(manifest.compatibility.minimumConsumerFormatVersion, '6.0.0');
  assert.equal(manifest.artifacts.length, 10);
  const social = json(`${candidatePath}/social-procedures/ch-social-procedures.json`);
  assert.equal(social.formatVersion, '2.0.0');
  assert.equal(social.federalRules.length, 44);
  assert.equal(social.cantonalBindings.length, 50);
  assert.equal(social.releaseEligibility.length, 50);
  assert.ok(social.cantonalBindings.every(binding => binding.procedureContextCanton === 'BE'));
  const reviews = new Map(reviewPaths.map(path => [json(path).reviewId, { reviewId: json(path).reviewId, path, sha256: digest(bytes(path)) }]));
  assert.equal(reviews.size, 4, 'No broad fallback to a similarly named source review');
  const suites = new Map(suitePaths.map(([suiteId, path]) => [suiteId, { suiteId, path, sha256: digest(bytes(path)) }]));
  const reviewCounts = new Map();
  for (const item of social.releaseEligibility) {
    assert.equal(item.status, 'candidate');
    assert.equal(item.approval, null, 'Preparation must not grant operative approval');
    assert.equal(item.releaseId, manifest.releaseId);
    assert.equal(reviews.get(item.sourceReviewRef.reviewId)?.sha256, item.sourceReviewRef.sha256, 'Unresolved or changed integration source evidence');
    assert.equal(suites.get(item.referenceSuiteRef.suiteId)?.sha256, item.referenceSuiteRef.sha256, 'Unresolved or changed reference suite');
    assert.deepEqual(item.calculationCoverage, { from: '2026-01-01', to: '2027-12-31' });
    reviewCounts.set(item.sourceReviewRef.reviewId, (reviewCounts.get(item.sourceReviewRef.reviewId) ?? 0) + 1);
  }
  assert.deepEqual([...reviewCounts.values()], [28, 6, 8, 8]);
  const before = json(`${productionPath}/manifest.json`);
  assert.equal(before.releaseStatus, 'approved');
  assert.equal(before.formatVersion, '5.0.0');
  for (const artifact of manifest.artifacts.filter(item => item.role !== 'socialProcedureCatalog')) {
    assert.deepEqual(artifact, before.artifacts.find(item => item.path === artifact.path), `Unexpected non-social artifact change: ${artifact.path}`);
  }
  const previousSocial = json(`${productionPath}/social-procedures/ch-social-procedures.json`);
  assert.deepEqual(social.federalRules.slice(0, 24), previousSocial.federalRules);
  assert.deepEqual(social.cantonalBindings.slice(0, 28), previousSocial.cantonalBindings);
  assert.ok(social.federalRules.slice(24).every(rule => rule.status === 'candidate'));
  assert.ok(social.cantonalBindings.slice(28).every(binding => binding.status === 'candidate'));
  assert.equal(json('package.json').version, '0.5.0');
  assert.equal(json('spfx/package.json').version, '0.5.0');
  const solution = json('spfx/config/package-solution.json').solution;
  assert.equal(solution.version, '0.5.0.0');
  assert.ok(solution.features.every(feature => feature.version === '0.5.0.0'));
  assert.match(bytes('src/public-app/main.tsx').toString(), /mvp05CalculationData/);
  assert.doesNotMatch(bytes('src/public-app/main.tsx').toString(), /ap20c\dCandidate|mvp06/);
  assert.match(bytes('spfx/src/core/config.ts').toString(), /2026-09-28-mvp-05-approved\.1/);
  assert.equal(json('data/source-reviews/source-register.json').dataKind, 'sourceRegister');
  assert.equal(json('data/source-reviews/index.json').dataKind, 'sourceReviewIndex');

  const audit = [...files.keys()].sort().map(path => ({ path, sha256: digest(bytes(path)), byteLength: bytes(path).length }));
  const historicalArchives = audit.filter(entry => archiveNeeded(entry.path)).map(entry => ({ ...entry, archivedAt: `${historicalRoot}/${entry.path}` }));
  const snapshot = {
    formatVersion: '1.0.0', dataKind: 'releasePreparationInputs', preparedOn: '2026-10-01',
    preparationId: 'mvp06-ap20-preparation.1', status: 'preparation-only',
    requestedBy: 'David Steimer', declaration: 'AP20C3 ist abgenommen. Bitte starte die Releasevorbereitung.',
    acceptance: { path: 'docs/fachrecht/abnahme-ap20c3.md', sha256: pinnedEvidence['docs/fachrecht/abnahme-ap20c3.md'] },
    targetVersions: { application: '0.6.0', package: '0.6.0.0', status: 'planned-not-built' },
    candidate: { path: candidatePath, releaseId: manifest.releaseId, sha256: candidateHash, status: 'candidate' },
    formats: { socialProcedureCatalog: '2.0.0', manifest: '6.0.0', minimumConsumer: '6.0.0' },
    scope: { federalRules: 44, cantonalBindings: 50, newAp20Rules: 20, newAp20Bindings: 22, candidateEligibility: 50,
      operativeCantonsPlanned: ['BE'], socialCaseCoverage: { from: '2026-01-01', to: '2027-12-31' },
      unchangedNonSocialArtifacts: 9, holidayCatalogUnchanged: true },
    priorProduction: { releaseId: before.releaseId, manifestFormat: before.formatVersion,
      applicationVersion: '0.5.0', packageVersion: '0.5.0.0', manifestSha256: pinnedEvidence[`${productionPath}/manifest.json`],
      baselineIsHistoricalAfterFuturePromotion: true, liveTenantOrHostingStatusNotAsserted: true },
    permissions: { localPreparationAuthorized: true, sourceReviewApproved: false, dataPromotionApproved: false,
      definitiveBuildAuthorized: false, installationAuthorized: false, publicationAuthorized: false,
      productionActivation: false, operatingApproval: false, permissionsChangeAuthorized: false },
    gates: ['combined-source-review-and-human-approval', 'explicit-controlled-data-promotion-and-definitive-local-build-approval',
      'versioned-package-and-mirror-build', 'explicit-eq-installation-approval', 'fresh-eq-tests-and-manual-acceptance',
      'explicit-publication-approval', 'get-header-evidence-and-risk-treatment-before-p', 'explicit-p-deployment-and-operation-approval'],
    integrationEvidence: { sourceReviews: [...reviews.values()].map(entry => ({ ...entry, affectedBindings: reviewCounts.get(entry.reviewId) })),
      referenceSuites: [...suites.values()], earlierAp19SourceProofs: priorReviewPaths.map(path => ({ path, sha256: digest(bytes(path)) })),
      note: 'Existing integration and MVP05 approvals are historical evidence, not a new MVP06 source approval.' },
    preservation: { appendOnly: true, regularFilesOnly: true, archiveFallbackAllowed: false,
      historicalArchives, note: 'After snapshot persistence, evolving files and test logs are read only from their verified archived preimages. Immutable candidate, acceptance and proof records continue to be verified in place.' },
    evidence: audit
  };
  if (expectedSnapshot) assert.deepEqual(snapshot, expectedSnapshot, 'Recorded preparation inputs changed, create a new revision');
  return snapshot;
}

async function readRegular(repositoryRoot, path) {
  assertSafeEvidencePath(path);
  const parts = path.split('/');
  for (let index = 0; index < parts.length; index++) {
    const selected = parts.slice(0, index + 1).join('/');
    const stat = await lstat(resolve(repositoryRoot, selected));
    assert.ok(!stat.isSymbolicLink() && (index === parts.length - 1 ? stat.isFile() : stat.isDirectory()), `Not a regular ${index === parts.length - 1 ? 'file' : 'directory'}: ${selected}`);
  }
  return readFile(resolve(repositoryRoot, path));
}

export async function prepareMvp06Inputs(repositoryRoot = root) {
  let recorded;
  try { recorded = JSON.parse(await readRegular(repositoryRoot, outputPath)); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const files = new Map();
  const read = async path => {
    if (files.has(path)) return;
    const archived = recorded?.preservation?.historicalArchives?.find(entry => entry.path === path);
    if (recorded && archiveNeeded(path)) assert.ok(archived, `Historical archive descriptor missing: ${path}`);
    if (archived) assert.equal(archived.archivedAt, `${historicalRoot}/${path}`, 'Unsafe or unexpected archive mapping');
    const content = await readRegular(repositoryRoot, archived?.archivedAt ?? path);
    if (archived) assert.equal(digest(content), archived.sha256, `Historical preparation archive changed: ${path}`);
    files.set(path, content);
  };
  for (const path of evidencePaths) await read(path);
  // Pin trusted parents before following any evidence paths from their contents.
  for (const [path, hash] of Object.entries(pinnedEvidence)) assert.equal(digest(files.get(path)), hash, `Changed pinned preparation input: ${path}`);
  for (const edge of dependencyEdges(files)) await read(edge.path);
  return { snapshot: validateMvp06Inputs(files, recorded), files };
}

export async function persistMvp06Inputs(prepared, repositoryRoot = root) {
  const { snapshot, files } = prepared;
  assert.deepEqual(validateMvp06Inputs(files), snapshot, 'Preparation snapshot must match validated bytes');
  const writes = snapshot.preservation.historicalArchives.map(entry => ({ path: entry.archivedAt, bytes: files.get(entry.path) }));
  writes.push({ path: outputPath, bytes: encode(snapshot) });
  // Preflight every exact target before writing any file. Never replace data.
  for (const item of writes) {
    try { assert.ok((await readRegular(repositoryRoot, item.path)).equals(item.bytes), `Existing preparation differs: ${item.path}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const item of writes) {
    await mkdir(dirname(resolve(repositoryRoot, item.path)), { recursive: true });
    // Recheck all parents after creation to reject symlink redirection.
    const parent = item.path.split('/').slice(0, -1);
    for (let index = 0; index < parent.length; index++) {
      const stat = await lstat(resolve(repositoryRoot, parent.slice(0, index + 1).join('/')));
      assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Unsafe archive directory');
    }
    try { await writeFile(resolve(repositoryRoot, item.path), item.bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readRegular(repositoryRoot, item.path)).equals(item.bytes), `Preparation readback mismatch: ${item.path}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = await prepareMvp06Inputs();
  await persistMvp06Inputs(prepared);
  console.log(JSON.stringify({ outputPath, evidenceFiles: prepared.snapshot.evidence.length,
    historicalArchives: prepared.snapshot.preservation.historicalArchives.length,
    sha256: digest(encode(prepared.snapshot)), status: prepared.snapshot.status, productionActivation: false }));
}
