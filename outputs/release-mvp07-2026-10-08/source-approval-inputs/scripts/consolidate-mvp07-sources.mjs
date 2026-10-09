// SPDX-License-Identifier: AGPL-3.0-only
// A complete technical evidence map is not a human source or release approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, lstat, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeRelativePath, prepareMvp07Inputs, outputPath as snapshotPath } from './prepare-mvp07-inputs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp07-2026-10-08';
export const resultPath = `${prefix}/source-review-completeness.json`;
export const inventoryPath = `${prefix}/sources/source-inventory.json`;
export const inventoryHash = '4bb394c9b1cccdc50ccae896925a5b64b3a6274fba0fb0b81a35b0ddca7e9c82';
export const snapshotHash = 'cbb9744cb2cc4f5b1812ad7850b9746fb4b504bab1c488eec824dd783b34f3bb';
export const candidateHash = 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6';
const candidateManifestPath = 'outputs/ap22c3-2026-10-08/bundle/manifest.json';
export const reviewGroups = Object.freeze({
  baseline: ['priorManifest'],
  activation: ['newActivationDirect', 'newActivationEvidenceOnly'],
  catalog: ['priorCatalogNewlyDirect', 'priorCatalogEvidenceOnly']
});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const sorted = values => [...values].sort();
const text = (value, label) => assert.ok(typeof value === 'string' && value.trim().length > 5, `Missing ${label}`);
const substantiveText = value => typeof value === 'string' ? value.trim().length > 5
  : value && typeof value === 'object' && Object.values(value).some(substantiveText);
const deniedPermissions = ['humanApproval', 'sourceReleaseApproved', 'dataPromotionApproved',
  'dataPromotionAuthorized', 'productionActivation', 'publicationApproved', 'operatingApproval'];
export const versionBridgeBindings = [
  { path: '.work/mvp07-source-review-2026-10-08/baseline/index-and-content-assessment.json',
    sha256: '69ed969e374780de8a6b7d57615866646375541f7b40f709522d93dd4b0eebca' },
  { path: '.work/mvp07-source-review-2026-10-08/catalog/lu-version-bridge.json',
    sha256: 'ab37325e8f55abfee5eed039c6bda34d1d6da213550f7437992442317a0e7793' }
];

export function validateMvp07VersionBridges(stpo, lu) {
  for (const proof of [stpo, lu]) { assert.equal(proof.checkedOn, '2026-10-08'); assert.equal(proof.humanApproval, false); }
  assert.equal(stpo.StPO.allArticleBodiesCompared, 478);
  assert.deepEqual(stpo.StPO.changedArticleNumbers, ['269']);
  assert.deepEqual(stpo.StPO.deadlineArticles.map(row => row.article), ['85', '89', '90', '91', '92']);
  for (const row of stpo.StPO.deadlineArticles) {
    text(row.oldText, 'old StPO article'); assert.equal(row.oldText, row.newText); assert.equal(row.equal, true);
  }
  assert.equal(lu.oldVersion, 3569); assert.equal(lu.newVersion, 4916);
  assert.deepEqual(lu.comparisons.map(row => row.provision), ['§ 1a', '§ 2']);
  for (const row of lu.comparisons) {
    text(row.oldText, 'old LU provision'); assert.equal(row.oldText, row.newText); assert.equal(row.equal, true);
  }
  assert.equal(lu.ruleChangeRequired, false); assert.equal(lu.metadataUpdateRequired, true);
  return [
    { eventId: 'STPO-AS-2026-509', sourceIds: ['SRC-STPO-20250401', 'SRC-AP22-STPO', 'SRC-AP22CLOSE-BUND-STPO'],
      sourceVersionDelta: true, effectiveFrom: '2027-01-01', modelImpact: 'unchanged', ruleChangeRequired: false,
      assessment: 'New Art. 269 surveillance-catalog entry. The used deadline provisions remain equal.', evidence: versionBridgeBindings[0] },
    { eventId: 'LU-855-V4916', sourceIds: ['SRC-LU-RLG-855-20200501'], sourceVersionDelta: true,
      effectiveFrom: '2026-09-27', modelImpact: 'unchanged', ruleChangeRequired: false,
      assessment: 'New title and shop-opening provisions. Used §§ 1a and 2 remain equal.', evidence: versionBridgeBindings[1] }
  ];
}

export function assertSourceEvidencePath(path) {
  assertSafeRelativePath(path);
  assert.ok(['outputs/', '.work/', 'docs/fachrecht/', 'docs/entscheidungen/', 'data/source-reviews/']
    .some(prefix => path.startsWith(prefix)), `Out-of-scope source evidence: ${path}`);
  assert.ok(!/(?:^|\/)(?:\.git|Userinput|node_modules|private)(?:\/|$)|(?:secret|credential|\.private\.)/i.test(path),
    `Private or unrelated source evidence: ${path}`);
}

export function validateMvp07SourceCoverage(inventory, reviews) {
  assert.equal(inventory.inventoryId, 'MVP07-SOURCE-INVENTORY-20261008');
  assert.equal(inventory.candidateReleaseId, '2026-10-08-ap22c3-reference.1');
  assert.equal(inventory.humanApproval, false);
  assert.equal(inventory.freshLegalVerificationPerformed, false, 'Preserve the historical inventory');
  assert.equal(inventory.rows.length, 232);
  assert.equal(new Set(inventory.rows.map(row => row.sourceId)).size, 232);
  assert.deepEqual(sorted(Object.keys(reviews)), sorted(Object.keys(reviewGroups)));
  const all = [];
  for (const [name, groups] of Object.entries(reviewGroups)) {
    const review = reviews[name];
    assert.equal(review.checkedOn, '2026-10-08', `Wrong review day: ${name}`);
    assert.equal(review.humanApproval, false);
    assert.equal(review.sourceReleaseApproved, false);
    assert.equal(review.candidateManifest?.sha256 ?? review.candidatehash, candidateHash, `Wrong candidate hash: ${name}`);
    assert.equal(review.inputInventory?.sha256 ?? review.inputhash, inventoryHash, `Wrong inventory hash: ${name}`);
    if (review.candidateReleaseId !== undefined) assert.equal(review.candidateReleaseId, inventory.candidateReleaseId);
    if (review.candidateManifest !== undefined) assert.equal(review.candidateManifest.path, candidateManifestPath);
    if (review.inputInventory !== undefined) assert.equal(review.inputInventory.path, inventoryPath);
    if (review.candidatehash !== undefined) assert.equal(review.candidatehash, candidateHash);
    if (review.inputhash !== undefined) assert.equal(review.inputhash, inventoryHash);
    if (review.candidateHash !== undefined) assert.equal(review.candidateHash, candidateHash);
    if (review.inputHash !== undefined) assert.equal(review.inputHash, inventoryHash);
    for (const flag of deniedPermissions) assert.ok(review[flag] === undefined || review[flag] === false, `Fabricated ${flag}`);
    const expected = inventory.rows.filter(row => groups.includes(row.group)).map(row => row.sourceId);
    assert.equal(review.rows.length, expected.length, `Wrong group size: ${name}`);
    assert.deepEqual(sorted(review.rows.map(row => row.sourceId)), sorted(expected), `Missing, duplicate or foreign source: ${name}`);
    for (const row of review.rows) {
      assert.ok(['unchanged', 'changed', 'unclear', 'unavailable'].includes(row.outcome), `Open outcome: ${row.sourceId}`);
      text(row.method, 'method'); text(row.rationale, 'rationale');
      assert.ok((typeof row.relevantProvisions === 'string' && row.relevantProvisions.trim().length > 0)
        || (Array.isArray(row.relevantProvisions) && row.relevantProvisions.length > 0
          && row.relevantProvisions.every(item => typeof item === 'string' && item.trim().length > 0)), `Missing provisions: ${row.sourceId}`);
      assert.ok(substantiveText(row.versionFinding), `Missing version finding: ${row.sourceId}`);
      assert.ok(Array.isArray(row.reusedEvidence) && Array.isArray(row.freshEvidence));
      assert.ok(row.reusedEvidence.length + row.freshEvidence.length > 0, `Unbound assertion: ${row.sourceId}`);
      if (row.outcome !== 'unchanged') assert.ok(substantiveText(row.followUp), `Untreated finding: ${row.sourceId}`);
      for (const flag of deniedPermissions) assert.ok(row[flag] === undefined || row[flag] === false, `Fabricated row ${flag}`);
      for (const item of row.reusedEvidence) {
        assertSourceEvidencePath(item.path); assert.match(item.sha256, /^[a-f0-9]{64}$/);
        assert.match(item.originalCheckedOn, /^\d{4}-\d{2}-\d{2}$/);
        assert.ok(item.originalCheckedOn <= '2026-10-08', 'Future historical check');
        text(item.scope, 'reuse scope');
      }
      for (const item of row.freshEvidence) {
        assertSourceEvidencePath(item.path); assert.match(item.sha256, /^[a-f0-9]{64}$/);
        assert.match(item.url, /^https?:\/\//); text(item.method, 'fresh method');
        assert.ok(Number.isFinite(Date.parse(item.retrievedAt)), 'Missing actual retrieval timestamp');
        const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date(item.retrievedAt));
        assert.equal(day, '2026-10-08', 'Historical retrieval described as fresh');
      }
      all.push({ ...row, reviewGroup: name,
        sourceInventoryGroup: inventory.rows.find(item => item.sourceId === row.sourceId).group,
        structuralReferenceUse: inventory.rows.find(item => item.sourceId === row.sourceId).directReferenceUse });
    }
  }
  assert.equal(new Set(all.map(row => row.sourceId)).size, 232, 'Cross-group duplication');
  const ai = all.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026');
  assert.equal(ai.outcome, 'unclear', 'Existing AI conflict must not silently disappear');
  return all.sort((left, right) => left.sourceId.localeCompare(right.sourceId, 'en'));
}

export function validateMvp07Evidence(files, bindings) {
  const hashes = new Map();
  for (const item of bindings) {
    assertSourceEvidencePath(item.path); assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.ok(files.has(item.path), `Missing source evidence: ${item.path}`);
    assert.equal(sha(files.get(item.path)), item.sha256, `Changed source evidence: ${item.path}`);
    if (item.byteLength !== undefined) assert.equal(files.get(item.path).length, item.byteLength);
    if (hashes.has(item.path)) assert.equal(hashes.get(item.path), item.sha256, 'Conflicting evidence hashes');
    hashes.set(item.path, item.sha256);
  }
  return hashes.size;
}

async function readRegular(repositoryRoot, path) {
  assertSafeRelativePath(path);
  const segments = path.split('/');
  for (let index = 0; index < segments.length; index++) {
    const stat = await lstat(resolve(repositoryRoot, segments.slice(0, index + 1).join('/')));
    assert.ok(!stat.isSymbolicLink() && (index === segments.length - 1 ? stat.isFile() : stat.isDirectory()), `Not regular evidence: ${path}`);
  }
  return readFile(resolve(repositoryRoot, path));
}

export async function consolidateMvp07Sources(repositoryRoot = root) {
  const prepared = await prepareMvp07Inputs(repositoryRoot);
  const files = new Map(), bindings = [];
  const read = async path => {
    if (!files.has(path)) files.set(path, await readRegular(repositoryRoot, path));
    return files.get(path);
  };
  const inventoryBytes = await read(inventoryPath);
  assert.equal(sha(inventoryBytes), inventoryHash);
  const snapshotBytes = await read(snapshotPath);
  assert.equal(sha(snapshotBytes), snapshotHash);
  const inventory = JSON.parse(inventoryBytes), reviews = {};
  for (const name of Object.keys(reviewGroups)) reviews[name] = JSON.parse(await read(`${prefix}/sources/${name}-review.json`));
  const coverage = validateMvp07SourceCoverage(inventory, reviews);
  for (const row of coverage) bindings.push(...row.reusedEvidence, ...row.freshEvidence);
  // Explicit one-level auxiliary bindings only, no unrestricted recursive discovery.
  for (const review of Object.values(reviews)) bindings.push(...(review.evidenceBindings ?? []));
  bindings.push(...versionBridgeBindings);
  for (const entry of bindings) { assertSourceEvidencePath(entry.path); await read(entry.path); }
  const uniqueEvidence = validateMvp07Evidence(files, bindings);
  const legalChangeEvents = validateMvp07VersionBridges(...versionBridgeBindings.map(entry => JSON.parse(files.get(entry.path))));
  const protectedPaths = [...prepared.files.keys()].filter(path => path.startsWith('src/') || path.startsWith('spfx/src/')
    || path.startsWith('spfx/config/') || path.startsWith('data/') || path === 'package.json' || path === 'package-lock.json'
    || path === 'spfx/package.json' || path === 'spfx/package-lock.json' || path.startsWith('outputs/ap22c3-2026-10-08/bundle/'));
  for (const path of protectedPaths) assert.ok((await readRegular(repositoryRoot, path)).equals(prepared.files.get(path)), `Protected live input changed: ${path}`);
  const counts = {};
  for (const row of coverage) counts[row.outcome] = (counts[row.outcome] ?? 0) + 1;
  return {
    reviewId: 'MVP07-CONSOLIDATED-SOURCE-REVIEW-20261008', checkedOn: '2026-10-08', recordStatus: 'candidate',
    humanApproval: false, sourceReleaseApproved: false, dataPromotionApproved: false,
    productionActivation: false, publicationApproved: false,
    completeTechnicalSourceCoverage: true, allSourcesSubstantivelyConfirmed: false,
    legalChangeEvents,
    outcomeSemantics: {
      rawCountsOnly: true,
      baseline: 'Unchanged refers to the used deadline/procedural proposition. A whole-law version delta may still exist.',
      activation: 'Changed can describe a source-version delta without a change to the used rule.',
      catalog: 'Changed includes a source-version delta. Unclear retains a source conflict, not an invented new rule.',
      warning: 'Raw outcomes are reference labels, not a homogeneous count of amended laws or calculation changes. Use legalChangeEvents for the two unique version changes.'
    },
    inventory: { path: inventoryPath, sha256: inventoryHash },
    preparationSnapshot: { path: snapshotPath, sha256: snapshotHash, inputFiles: prepared.snapshot.evidence.length },
    counts: { sourceIds: coverage.length, groups: Object.fromEntries(Object.entries(reviews).map(([name, review]) => [name, review.rows.length])),
      outcomes: counts, withFreshEvidence: coverage.filter(row => row.freshEvidence.length).length,
      reusedWithoutFreshEvidence: coverage.filter(row => !row.freshEvidence.length).length,
      withExplicitReuse: coverage.filter(row => row.reusedEvidence.length).length, uniqueBoundEvidenceFiles: uniqueEvidence,
      protectedFilesUnchanged: protectedPaths.length },
    coverage,
    evidence: [...files].map(([path, bytes]) => ({ path, sha256: sha(bytes), byteLength: bytes.length }))
      .sort((left, right) => left.path.localeCompare(right.path, 'en')),
    limits: [
      'Technical source coverage, original identity, substantive reading and human approval are separate.',
      'Historical evidence retains its actual date and exact scope. A current inventory or matrix acceptance is not a fresh legal retrieval.',
      'AI source conflict and the already decided statutory treatment remain visible. SG/SH January boundaries, GR/NE limits, AVIV Option B and OF-001 are not silently removed.',
      'No exhaustive new-case-law search or unlimited future legal stability is asserted.',
      'Positive structural references do not expand permitted cases. Social scope remains BE, 2026–2027, with 44 rules and 50 bindings.',
      'Human review of the substantive findings and bounded reuse remains required before promotion or definitive builds.',
      'Private raw source material is not automatically cleared for public publication.'
    ]
  };
}

export async function writeMvp07SourceCoverage(report, repositoryRoot = root) {
  assert.equal(report.recordStatus, 'candidate'); assert.equal(report.humanApproval, false);
  for (const flag of deniedPermissions) assert.ok(report[flag] === undefined || report[flag] === false, `Fabricated ${flag}`);
  const target = resolve(repositoryRoot, resultPath);
  const parents = resultPath.split('/').slice(0, -1);
  for (let index = 0; index < parents.length; index++) {
    const parent = resolve(repositoryRoot, parents.slice(0, index + 1).join('/'));
    try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = await lstat(parent);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Unsafe source review directory');
  }
  const bytes = encode(report);
  try { await writeFile(target, bytes, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.ok((await readRegular(repositoryRoot, resultPath)).equals(bytes), 'Existing source review differs, create a separate revision');
  }
  assert.ok((await readRegular(repositoryRoot, resultPath)).equals(bytes));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const report = await consolidateMvp07Sources();
  if (process.argv[2] === '--write') await writeMvp07SourceCoverage(report);
  console.log(JSON.stringify({ reviewId: report.reviewId, counts: report.counts,
    sha256: sha(encode(report)), written: process.argv[2] === '--write', humanApproval: false }, null, 2));
}
