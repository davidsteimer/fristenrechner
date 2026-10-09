// SPDX-License-Identifier: AGPL-3.0-only
// In-memory mutations and temporary copies of the actual documented decision.
// These tests never create or alter an approval in the real repository.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, mkdtemp, realpath, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { approvalPath, validateMvp04SourceApproval, verifyMvp04SourceApproval } from '../../scripts/verify-mvp04-source-approval.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const prefix = 'outputs/release-mvp04-2026-09-22/';
const initialPath = 'data/source-reviews/events/2026-08-31-initial-consolidation.1.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const jsonBytes = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const recordedApproval = JSON.parse(await readFile(resolve(root, approvalPath), 'utf8'));
const paths = new Set([initialPath, ...recordedApproval.evidence.map(item => item.path),
  ...Object.values(recordedApproval.transition).flatMap(item => [item.beforePath, item.afterPath])]);
const recordedFiles = new Map(await Promise.all([...paths].map(async path => [path, await readFile(resolve(root,
  path === 'data/source-reviews/source-register.json' ? 'outputs/release-mvp05-2026-09-28/approval-inputs/' + path : path))])));
const fixture = () => ({ approval: structuredClone(recordedApproval), files: new Map([...recordedFiles].map(([p, bytes]) => [p, Buffer.from(bytes)])) });
const check = f => validateMvp04SourceApproval(f.approval, f.files);
function mutateJson(f, path, change, rebind = false) {
  const value = JSON.parse(f.files.get(path));
  change(value);
  f.files.set(path, jsonBytes(value));
  if (rebind) {
    const evidence = f.approval.evidence.find(item => item.path === path);
    if (evidence) evidence.sha256 = hash(f.files.get(path));
    for (const transition of Object.values(f.approval.transition)) {
      if (transition.beforePath === path) transition.beforeSha256 = hash(f.files.get(path));
      if (transition.afterPath === path) transition.afterSha256 = hash(f.files.get(path));
    }
  }
}

test('actual recorded approval binds 120 source IDs while withholding external authority', async () => {
  const result = await verifyMvp04SourceApproval(root);
  assert.equal(result.sourceReviewApproved, true);
  assert.equal(result.formalApproval, true);
  assert.equal(result.allSourcesSubstantivelyConfirmed, false);
  assert.equal(result.uniqueSources, 120);
  assert.equal(result.unchanged, 119);
  assert.equal(result.publicationAuthorized, false);
  assert.equal(result.deploymentAuthorized, false);
  assert.equal(result.operatingApproval, false);
});
test('exact human declaration, identity, date, status and release are mandatory', async () => {
  for (const field of ['declaration', 'approvedBy', 'approvedOn', 'recordStatus', 'releaseId', 'approvalId', 'formatVersion', 'dataKind']) {
    const f = fixture(); f.approval[field] = 'synthetic-invalid-value';
    await assert.rejects(check(f), undefined, field);
  }
});
test('source scope and outcome totals cannot be widened or greenwashed', async () => {
  for (const [group, key, value] of [['scope', 'uniqueSources', 121], ['outcomes', 'unclear', 0], ['outcomes', 'unchanged', 120], ['knownConflict', 'treatmentUnchanged', false], ['knownConflict', 'officialCorrectionClaimed', true]]) {
    const f = fixture(); f.approval[group][key] = value; await assert.rejects(check(f));
  }
});
test('publication, deployment and operating approval remain explicitly false', async () => {
  for (const field of ['publicationAuthorized', 'deploymentAuthorized', 'operatingApproval']) {
    const f = fixture(); f.approval.permissions[field] = true; await assert.rejects(check(f));
  }
  const f = fixture(); f.approval.permissions.extraAuthority = true; await assert.rejects(check(f));
});
test('missing, duplicate or unhashed reports are rejected', async () => {
  const missing = fixture(); missing.approval.evidence = missing.approval.evidence.filter(item => item.path !== prefix + 'catalog-refresh-east.json');
  await assert.rejects(check(missing), /required evidence/);
  const duplicate = fixture(); duplicate.approval.evidence.push(duplicate.approval.evidence[0]);
  await assert.rejects(check(duplicate), /Duplicate evidence/);
  const invalidHash = fixture(); invalidHash.approval.evidence[0].sha256 = 'not-a-hash';
  await assert.rejects(check(invalidHash), /Invalid SHA/);
});
test('modified evidence is rejected before substantive assertions', async () => {
  const f = fixture(); f.files.set(prefix + 'catalog-refresh-west.json', Buffer.from('{}'));
  await assert.rejects(check(f), /Evidence changed/);
});
test('evidence paths cannot leave the repository or be reinterpreted', async () => {
  for (const path of ['../outside.json', '/private/tmp/outside.json', 'data/../outside.json', 'data\\outside.json', 'data//outside.json', 'data/./outside.json']) {
    const f = fixture(); f.approval.evidence.push({ path, sha256: '0'.repeat(64) }); f.files.set(path, Buffer.from('{}'));
    await assert.rejects(check(f), /path|relative/i);
  }
});
test('historical AP13 event remains protected by its independent pinned hash', async () => {
  const f = fixture(); mutateJson(f, initialPath, doc => { doc.recordedOn = '2026-09-22'; }, true);
  await assert.rejects(check(f), /Evidence changed/);
});
test('approved event allows only the exact two metadata changes', async () => {
  for (const change of [doc => { doc.entries[0].outcome = 'changed'; }, doc => { doc.reviewWindow.to = '2026-09-23'; }, doc => { doc.responsibility.formalFourEyes = true; }, doc => { doc.entries[0].followUp.required = true; }]) {
    const f = fixture(); mutateJson(f, f.approval.transition.event.afterPath, change, true);
    await assert.rejects(check(f), /Unauthorised substantive event transition/);
  }
});
test('register role, scope and source content cannot change through approval', async () => {
  for (const change of [doc => { doc.sources[0].usageStatus = 'monitoring'; }, doc => { doc.scope.jurisdictions.push('AI'); }, doc => { doc.sources.pop(); }]) {
    const f = fixture(); mutateJson(f, f.approval.transition.register.afterPath, change, true);
    await assert.rejects(check(f), /Unauthorised substantive register transition/);
  }
});
test('candidate snapshots and canonical target paths are mandatory', async () => {
  const f = fixture(); f.approval.transition.event.beforePath = f.approval.transition.event.afterPath;
  await assert.rejects(check(f));
  const g = fixture(); mutateJson(g, g.approval.transition.register.beforePath, doc => { doc.registerStatus = 'approved'; }, true);
  await assert.rejects(check(g));
});
test('rehashing incomplete catalog evidence does not manufacture a complete review', async () => {
  const f = fixture(); mutateJson(f, prefix + 'catalog-refresh-east.json', doc => { doc.entries.pop(); }, true);
  await assert.rejects(check(f), /Incomplete or duplicated batch/);
});
test('AI remains unclear even if a changed report is rehashed', async () => {
  const f = fixture(); mutateJson(f, prefix + 'catalog-refresh-east.json', doc => {
    doc.entries.find(item => item.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026').outcome = 'unchanged';
  }, true);
  await assert.rejects(check(f), /Presented completeness does not reproduce/);
});
test('historical technical false flags cannot be rewritten as human approval', async () => {
  const f = fixture(); mutateJson(f, prefix + 'source-review-completeness.json', doc => { doc.formalApproval = true; }, true);
  await assert.rejects(check(f), /Presented completeness does not reproduce/);
});
test('AI follow-up cannot claim correction or erase the open source conflict', async () => {
  for (const change of [doc => { doc.releaseImpact.officialCorrectionClaimed = true; }, doc => { doc.followUp.required = false; }, doc => { doc.formalApproval = true; }]) {
    const f = fixture(); mutateJson(f, prefix + 'catalog-follow-up.json', change, true);
    await assert.rejects(check(f));
  }
});
test('nested historical evidence must bind the candidate event, not the approved replacement', async () => {
  const f = fixture(); mutateJson(f, prefix + 'source-review-completeness.json', doc => {
    doc.evidence.find(item => item.path === f.approval.transition.event.afterPath).sha256 = f.approval.transition.event.afterSha256;
  }, true);
  await assert.rejects(check(f), /Presented event hash must bind the candidate snapshot/);
});

async function temporaryRepository(t, f = fixture()) {
  const target = await realpath(await mkdtemp(resolve(tmpdir(), 'fristenrechner-approval-test-')));
  t.after(() => rm(target, { recursive: true, force: true }));
  const files = new Map(f.files);
  files.set(approvalPath, jsonBytes(f.approval));
  for (const name of ['verify-mvp04-source-approval.mjs', 'consolidate-mvp04-source-checks.mjs', 'prepare-mvp04-source-reviews.mjs']) {
    files.set('scripts/' + name, await readFile(resolve(root, 'scripts', name)));
  }
  for (const [path, bytes] of files) {
    await mkdir(dirname(resolve(target, path)), { recursive: true });
    await writeFile(resolve(target, path), bytes);
  }
  return { target, files };
}
test('both generators verify approved temporary copies without writing or downgrading', async t => {
  const { target, files } = await temporaryRepository(t);
  for (const name of ['prepare-mvp04-source-reviews.mjs', 'consolidate-mvp04-source-checks.mjs']) {
    const run = spawnSync(process.execPath, [resolve(target, 'scripts', name)], { encoding: 'utf8', timeout: 20000 });
    assert.equal(run.status, 0, run.stderr);
    const summary = JSON.parse(run.stdout);
    assert.equal(summary.action, 'verified-noop');
    assert.equal(summary.filesWritten, 0);
    for (const [path, bytes] of files) assert.deepEqual(await readFile(resolve(target, path)), bytes, path);
  }
});
test('malformed approval stops both generators before touching evidence', async t => {
  const f = fixture(); f.approval.permissions.deploymentAuthorized = true;
  const { target, files } = await temporaryRepository(t, f);
  for (const name of ['prepare-mvp04-source-reviews.mjs', 'consolidate-mvp04-source-checks.mjs']) {
    const run = spawnSync(process.execPath, [resolve(target, 'scripts', name)], { encoding: 'utf8', timeout: 20000 });
    assert.notEqual(run.status, 0);
    for (const [path, bytes] of files) assert.deepEqual(await readFile(resolve(target, path)), bytes, path);
  }
});
test('missing approval cannot make either generator overwrite approved evidence', async t => {
  const { target, files } = await temporaryRepository(t);
  await rm(resolve(target, approvalPath));
  files.delete(approvalPath);
  for (const name of ['prepare-mvp04-source-reviews.mjs', 'consolidate-mvp04-source-checks.mjs']) {
    const run = spawnSync(process.execPath, [resolve(target, 'scripts', name)], { encoding: 'utf8', timeout: 20000 });
    assert.notEqual(run.status, 0);
    for (const [path, bytes] of files) assert.deepEqual(await readFile(resolve(target, path)), bytes, path);
  }
});
test('a tampered candidate status cannot bypass a recorded approval', async t => {
  const f = fixture(); mutateJson(f, f.approval.transition.event.afterPath, doc => { doc.recordStatus = 'candidate'; });
  const { target, files } = await temporaryRepository(t, f);
  for (const name of ['prepare-mvp04-source-reviews.mjs', 'consolidate-mvp04-source-checks.mjs']) {
    const run = spawnSync(process.execPath, [resolve(target, 'scripts', name)], { encoding: 'utf8', timeout: 20000 });
    assert.notEqual(run.status, 0);
    for (const [path, bytes] of files) assert.deepEqual(await readFile(resolve(target, path)), bytes, path);
  }
});
