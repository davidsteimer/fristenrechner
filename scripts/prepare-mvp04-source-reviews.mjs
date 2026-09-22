// SPDX-License-Identifier: AGPL-3.0-only
// Local, unapproved governance preparation. Published review events stay immutable.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { approvalPath, verifyMvp04SourceApproval } from './verify-mvp04-source-approval.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = async p => JSON.parse(await readFile(resolve(root, p), 'utf8'));
const write = async (p, value) => writeFile(resolve(root, p), `${JSON.stringify(value, null, 2)}\n`);
const releaseId = '2026-09-22-mvp-04-approved.1';
let hasApproval = false;
try {
  await readFile(resolve(root, approvalPath));
  hasApproval = true;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const previous = await read('data/source-reviews/events/2026-09-22-mvp-04-prerelease.1.json').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
if (hasApproval || previous?.recordStatus === 'approved') {
  // A missing or invalid approval is never permission to recreate an approved target.
  const verification = await verifyMvp04SourceApproval(root);
  console.log(JSON.stringify({ ...verification, action: 'verified-noop', filesWritten: 0 }, null, 2));
  process.exit(0);
}
const initialBytes = await readFile(resolve(root, 'data/source-reviews/events/2026-08-31-initial-consolidation.1.json'));
assert.equal(createHash('sha256').update(initialBytes).digest('hex'),
  '3b6884e3d929bd47006a9aeff453288de6102d2c1c50c8d6f92a88115bdce3dd', 'Historical initial event changed');
const register = await read('data/source-reviews/source-register.json');
const event = await read('outputs/release-mvp04-2026-09-22/source-event-candidate.json');
const judgments = await read('outputs/release-mvp04-2026-09-22/judgment-refresh.json');
const special = await read(`data/releases/${releaseId}/special-regimes/vrpg-be.json`);
const manifest = await read(`data/releases/${releaseId}/manifest.json`);
assert.equal(event.recordStatus, 'candidate');
assert.equal(event.reviewEventId, '2026-09-22-mvp-04-prerelease.1');
assert.deepEqual(event.entries.map(e => e.sourceId).sort(), [...manifest.sourceSummary.sourceIds].sort());
const judgmentEntries = judgments.entries ?? judgments.checks;
assert.ok(Array.isArray(judgmentEntries), 'Judgment evidence entries missing');
const known = new Set(register.sources.map(s => s.sourceId));
const future = new Set(['SRC-AP17C-AHVG-20270101', 'SRC-AP17C-IVG-20270101', 'SRC-AP17C-IVV-20270701']);
for (const source of special.sources) {
  if (known.has(source.sourceId)) continue;
  const review = event.entries.find(e => e.sourceId === source.sourceId);
  assert.ok(review, `Missing review ${source.sourceId}`);
  const isBern = source.authority === 'Kanton Bern';
  const judgment = judgmentEntries.find(e => e.sourceId === source.sourceId);
  const officialUrl = source.sourceType === 'caseLaw'
    ? isBern ? null : judgment?.officialUrl
    : source.url;
  assert.ok(officialUrl || (isBern && source.sourceType === 'caseLaw'), `Verified official URL missing ${source.sourceId}`);
  register.sources.push({
    sourceId: source.sourceId,
    usageStatus: future.has(source.sourceId) ? 'monitoring'
      : source.sourceId === 'SRC-AP17C-IVOEB-OLD-20100701' ? 'supporting' : 'productive',
    sourceType: source.sourceType, title: source.title,
    authority: source.sourceType === 'caseLaw' ? isBern ? 'Verwaltungsgericht des Kantons Bern' : 'Bundesgericht' : source.authority,
    jurisdiction: isBern ? 'BE' : 'CH', officialLocator: source.title,
    officialUrl, retrievalUrl: source.url, documentVersionDate: source.documentVersionDate,
    subjectAreas: future.has(source.sourceId) ? ['specialRegimes', 'amendmentMonitoring'] : ['specialRegimes'],
    relevantProvisions: review.evidence.relevantProvisions
  });
}
assert.equal(register.sources.length, 42);
register.sources.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
register.registerStatus = 'candidate';
register.scope.productiveReleaseIds = [...new Set([...register.scope.productiveReleaseIds, releaseId])];
event.comparedReleaseIds = [releaseId];
for (const entry of event.entries) {
  entry.affected.releaseIds = [releaseId];
  if (future.has(entry.sourceId)) {
    entry.affected.resolutionMode = 'explicit';
    entry.affected.profileIds = ['vrpg-be'];
    entry.affected.componentIds = ['vrpg-be-special-regimes-ap17c'];
  }
}
const target = `data/source-reviews/events/${event.reviewEventId}.json`;
try {
  const previous = await read(target);
  assert.equal(previous.recordStatus, 'candidate', 'An approved review event must never be overwritten');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await write('data/source-reviews/source-register.json', register);
await write(target, event);
assert.deepEqual(await readFile(resolve(root, 'data/source-reviews/events/2026-08-31-initial-consolidation.1.json')), initialBytes);
console.log(JSON.stringify({ registerStatus: register.registerStatus, sources: register.sources.length,
  event: event.reviewEventId, eventStatus: event.recordStatus, entries: event.entries.length,
  outcomes: Object.fromEntries(['unchanged', 'changed', 'unclear', 'unavailable'].map(k => [k, event.entries.filter(e => e.outcome === k).length])),
  formalApproval: false, historicalEventUnchanged: true }, null, 2));
