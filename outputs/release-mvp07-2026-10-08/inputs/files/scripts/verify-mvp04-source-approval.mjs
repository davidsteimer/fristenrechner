// SPDX-License-Identifier: AGPL-3.0-only
// Read-only verification of an explicitly documented human decision. Never grants approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const approvalPath = 'outputs/release-mvp04-2026-09-22/source-approval.json';
const prefix = 'outputs/release-mvp04-2026-09-22/';
const releaseId = '2026-09-22-mvp-04-approved.1';
const releasePrefix = `data/releases/${releaseId}/`;
const eventPath = 'data/source-reviews/events/2026-09-22-mvp-04-prerelease.1.json';
const registerPath = 'data/source-reviews/source-register.json';
const initialPath = 'data/source-reviews/events/2026-08-31-initial-consolidation.1.json';
const initialSha256 = '3b6884e3d929bd47006a9aeff453288de6102d2c1c50c8d6f92a88115bdce3dd';
const declaration = 'Ich nehme die Quellenprüfung für MVP 0.4 ab. Die bereits beschlossene Behandlung des dokumentierten AI-Quellenkonflikts bleibt unverändert.';
const requiredEvidence = [
  'source-check.json', 'judgment-refresh.json', 'catalog-refresh-central.json',
  'catalog-refresh-west.json', 'catalog-refresh-east.json', 'catalog-follow-up.json',
  'source-review-completeness.json',
].map(path => prefix + path).concat([releasePrefix + 'manifest.json', releasePrefix + 'holiday-catalogs/ch-holiday-catalog.json']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const parse = bytes => JSON.parse(Buffer.from(bytes).toString('utf8'));

function safePath(path) {
  assert.equal(typeof path, 'string');
  assert.ok(path.length && !isAbsolute(path) && !path.includes('\\') && !path.includes('\0'), 'Invalid evidence path');
  assert.ok(!path.split('/').some(part => part === '..' || part === '.' || part === ''), 'Evidence path must be repository-relative');
  return path;
}

function assertHash(bytes, expected, label) {
  assert.match(expected, /^[a-f0-9]{64}$/, `Invalid SHA-256: ${label}`);
  assert.equal(hash(bytes), expected, `Evidence changed: ${label}`);
}

/** Pure validation over caller-supplied bytes. Synthetic tests never write an approval. */
export async function validateMvp04SourceApproval(approval, files) {
  assert.equal(approval.formatVersion, '1.0.0');
  assert.equal(approval.dataKind, 'sourceReviewApproval');
  assert.equal(approval.approvalId, '2026-09-22-mvp-04-source-approval.1');
  assert.equal(approval.recordStatus, 'approved');
  assert.equal(approval.approvedOn, '2026-09-22');
  assert.equal(approval.approvedBy, 'David Steimer');
  assert.equal(approval.declaration, declaration, 'Human decision must remain exact');
  assert.equal(approval.releaseId, releaseId);
  assert.deepEqual(approval.scope, { manifestSources: 38, catalogSources: 84, overlap: 2, uniqueSources: 120 });
  assert.deepEqual(approval.outcomes, { unchanged: 119, unclear: 1, changed: 0, unavailable: 0 });
  assert.deepEqual(approval.knownConflict, { sourceId: 'SRC-AI-RUHETAGE-LISTE-2026', treatmentUnchanged: true, officialCorrectionClaimed: false });
  assert.deepEqual(approval.permissions, { sourceReviewApproved: true, publicationAuthorized: false, deploymentAuthorized: false, operatingApproval: false });
  const bytes = path => {
    safePath(path);
    assert.ok(files.has(path), `Missing evidence bytes: ${path}`);
    return files.get(path);
  };
  const json = path => parse(bytes(path));
  assert.ok(Array.isArray(approval.evidence));
  const evidence = new Map();
  for (const item of approval.evidence) {
    assert.ok(!evidence.has(item.path), `Duplicate evidence: ${item.path}`);
    assertHash(bytes(item.path), item.sha256, item.path);
    evidence.set(item.path, item.sha256);
  }
  for (const path of requiredEvidence) assert.ok(evidence.has(path), `Approval does not bind required evidence: ${path}`);
  assertHash(bytes(initialPath), initialSha256, initialPath);

  assert.deepEqual(Object.keys(approval.transition).sort(), ['event', 'register']);
  const expectedPaths = {
    event: [prefix + 'approval-inputs/source-event-candidate.json', eventPath],
    register: [prefix + 'approval-inputs/source-register-candidate.json', registerPath],
  };
  const documents = {};
  for (const [kind, [beforePath, afterPath]] of Object.entries(expectedPaths)) {
    const transition = approval.transition[kind];
    assert.equal(transition.beforePath, beforePath);
    assert.equal(transition.afterPath, afterPath);
    assertHash(bytes(beforePath), transition.beforeSha256, beforePath);
    assertHash(bytes(afterPath), transition.afterSha256, afterPath);
    const before = json(beforePath), after = json(afterPath), expected = structuredClone(before);
    if (kind === 'event') {
      assert.equal(before.recordStatus, 'candidate');
      assert.equal(before.reviewEventId, '2026-09-22-mvp-04-prerelease.1');
      expected.recordStatus = 'approved';
      expected.responsibility.reviewedBy = 'David Steimer';
      assert.equal(before.responsibility.formalFourEyes, false);
      assert.equal(before.responsibility.operatingModel, 'personalUnion');
    } else {
      assert.equal(before.registerStatus, 'candidate');
      expected.registerStatus = 'approved';
      assert.equal(before.sources.length, 42);
    }
    assert.deepEqual(after, expected, `Unauthorised substantive ${kind} transition`);
    documents[kind] = { before, after };
  }

  // Recompute the presented technical evidence against its preserved candidate,
  // not against metadata that changed only through the later human decision.
  const { validateCoverage, validateKnownConflict } = await import('./consolidate-mvp04-source-checks.mjs');
  const result = validateCoverage({
    catalog: json(releasePrefix + 'holiday-catalogs/ch-holiday-catalog.json'),
    catalogHash: evidence.get(releasePrefix + 'holiday-catalogs/ch-holiday-catalog.json'),
    manifest: json(releasePrefix + 'manifest.json'),
    operative: json(prefix + 'source-check.json'),
    event: documents.event.before,
    batches: Object.fromEntries(['central', 'west', 'east'].map(batch => [batch, json(prefix + `catalog-refresh-${batch}.json`)])),
  });
  const completeness = json(prefix + 'source-review-completeness.json');
  for (const [key, value] of Object.entries(result)) assert.deepEqual(completeness[key], value, `Presented completeness does not reproduce: ${key}`);
  assert.equal(completeness.allSourcesSubstantivelyConfirmed, false, 'Known source conflict must not be greenwashed');
  assert.equal(completeness.formalApproval, false, 'Preserve the historical technical report');
  assert.deepEqual(completeness.knownConflictsWithAcceptedTreatment, ['SRC-AI-RUHETAGE-LISTE-2026']);
  assert.deepEqual(completeness.newUndisposedFindings, []);
  const followUp = json(prefix + 'catalog-follow-up.json');
  validateKnownConflict(result.unresolved, followUp, evidence.get(prefix + 'catalog-refresh-east.json'));
  assert.ok(Array.isArray(completeness.evidence));
  const completeEvidence = new Set();
  for (const item of completeness.evidence) {
    assert.ok(!completeEvidence.has(item.path), `Duplicate presented completeness evidence: ${item.path}`);
    completeEvidence.add(item.path);
    if (item.path === eventPath) assert.equal(item.sha256, approval.transition.event.beforeSha256, 'Presented event hash must bind the candidate snapshot');
    else {
      assert.ok(evidence.has(item.path), `Unbound nested evidence: ${item.path}`);
      assert.equal(item.sha256, evidence.get(item.path), `Nested evidence hash differs: ${item.path}`);
    }
  }
  for (const path of [eventPath, releasePrefix + 'manifest.json', releasePrefix + 'holiday-catalogs/ch-holiday-catalog.json', prefix + 'source-check.json', prefix + 'catalog-follow-up.json', ...['central', 'west', 'east'].map(batch => prefix + `catalog-refresh-${batch}.json`)]) {
    assert.ok(completeEvidence.has(path), `Presented completeness lacks evidence: ${path}`);
  }
  return { approvalId: approval.approvalId, releaseId, sourceReviewApproved: true, formalApproval: true, verifiedEvidenceFiles: evidence.size,
    uniqueSources: 120, unchanged: 119, knownConflictSourceId: 'SRC-AI-RUHETAGE-LISTE-2026',
    allSourcesSubstantivelyConfirmed: false, historicalEvidenceUnchanged: true,
    publicationAuthorized: false, deploymentAuthorized: false, operatingApproval: false };
}

/** Reads and verifies only. A file records the prior user decision, it never creates one. */
export async function verifyMvp04SourceApproval(root = repositoryRoot) {
  const realRoot = await realpath(root);
  const read = async path => {
    safePath(path);
    const resolved = await realpath(resolve(realRoot, path));
    const rel = relative(realRoot, resolved);
    assert.ok(rel && !isAbsolute(rel) && rel !== '..' && !rel.startsWith('../'), `Evidence escapes repository: ${path}`);
    return readFile(resolved);
  };
  const approval = parse(await read(approvalPath));
  const paths = new Set([initialPath, ...approval.evidence.map(item => item.path),
    ...Object.values(approval.transition).flatMap(item => [item.beforePath, item.afterPath])]);
  let archivedRegisterUsed = false;
  const files = new Map(await Promise.all([...paths].map(async path => {
    if (path === registerPath) {
      // This verifies the historical 2026-09-22 decision, not today's register.
      // A later append-only review can grow the living register. Its exact old
      // bytes remain pinned by the unchanged original approval transition.
      const archive = 'outputs/release-mvp05-2026-09-28/approval-inputs/' + registerPath;
      try {
        const bytes = await read(archive);
        assertHash(bytes, approval.transition.register.afterSha256, archive);
        archivedRegisterUsed = true;
        return [path, bytes];
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return [path, await read(path)];
  })));
  return { ...await validateMvp04SourceApproval(approval, files),
    validationScope: 'historical-human-decision-not-current-register', archivedRegisterUsed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await verifyMvp04SourceApproval(), null, 2));
}
