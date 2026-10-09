// SPDX-License-Identifier: AGPL-3.0-only
// Preserve accepted AP21 evidence before changing living status documents.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const target = 'outputs/ap21-abnahme-2026-10-08';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const archivePath = path => path.startsWith('.work/') ? `build/${path.slice(6)}` : path;
const roots = [
  ['outputs/ap21-2026-10-08/completion-integrity.json', '6356d0d23624befb5f8bd0a6f8d7fa014eb99c47ba5b2015f50c96b762a1ee4b'],
  ['outputs/ap21-e-testkandidat-r2-2026-10-08/completion-integrity.json', 'ee877975ca0280f4e8ae3a322dc4babdaa05ed934ef89a5ff0f1ed1e3a66326e'],
  ['outputs/ap21-e04-r2-2026-10-08/execution-proof.json', '1cf3f8fa065f2e5b23622c25c520d86a1d6f03fbbf2f1b9388839a26d0f46630']
];
const entries = new Map();
function add(entry) {
  assert.ok(!entry.path.startsWith('/') && !entry.path.split('/').includes('..'), entry.path);
  assert.match(entry.sha256, /^[0-9a-f]{64}$/);
  assert.ok(Number.isInteger(entry.byteLength));
  const normalized = { path: entry.path, sha256: entry.sha256, byteLength: entry.byteLength };
  if (entries.has(entry.path)) assert.deepEqual(entries.get(entry.path), normalized);
  entries.set(entry.path, normalized);
}
async function sourceBytes(path) {
  try { return await readFile(resolve(target, archivePath(path))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; return readFile(path); }
}
for (const [path, sha256] of roots) {
  const bytes = await sourceBytes(path);
  assert.equal(digest(bytes), sha256, path);
  add({ path, sha256, byteLength: bytes.length });
  for (const entry of JSON.parse(bytes).artifacts) add(entry);
}
for (const path of ['docs/betrieb/ap21-ipad-magic-keyboard-tab-befund.md',
  '.work/ap21-tab-minimal/index.html', 'scripts/archive-ap21-acceptance.mjs']) {
  const bytes = await sourceBytes(path);
  add({ path, sha256: digest(bytes), byteLength: bytes.length });
}

// Verify all inputs first. Existing archive files are never overwritten.
const verified = [];
for (const entry of [...entries.values()].sort((a, b) => a.path.localeCompare(b.path))) {
  const bytes = await sourceBytes(entry.path);
  assert.equal(digest(bytes), entry.sha256, entry.path);
  assert.equal(bytes.length, entry.byteLength, entry.path);
  verified.push({ entry, bytes });
}
for (const { entry, bytes } of verified) {
  const destination = resolve(target, archivePath(entry.path));
  await mkdir(dirname(destination), { recursive: true });
  try { await writeFile(destination, bytes, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.equal(digest(await readFile(destination)), entry.sha256, destination);
}
const receipt = {
  schemaVersion: '1.0.0', kind: 'acceptedAP21EvidenceSnapshot',
  acceptedOn: '2026-10-08', acceptedBy: 'David Steimer',
  userStatement: 'AP21 ist abgenommen.', accepted: true,
  acceptanceScope: 'AP21 implementation with accepted minor iPad Magic Keyboard environment finding',
  newSourceReleaseApproved: false, newDeploymentApproved: false,
  newPublicationApproved: false, testAppCleanupApproved: false,
  existingIsolatedETestPackageVersion: '0.0.21.2',
  realDeviceMatrixFullyEvidenced: false,
  carriedReleaseEvidenceChecks: [
    'direct-Teams-host-and-iOS-Teams-after-separate-deployment-approval',
    'real-device-VoiceOver-and-200-percent-zoom',
    'detailed-secondary-date-roles-and-device-matrix',
    'live-export-invalidation-in-release-build-with-export-enabled'
  ],
  acceptedMinorFinding: {
    path: 'docs/betrieb/ap21-ipad-magic-keyboard-tab-befund.md',
    productChangeRequired: false, exactCauseResolved: false
  },
  historicalProofs: roots.map(([path, sha256]) => ({ path, sha256 })),
  archivePublicationApproved: false,
  artifacts: verified.map(({ entry }) => ({ ...entry, archivePath: archivePath(entry.path) }))
};
const receiptBytes = Buffer.from(JSON.stringify(receipt, null, 2) + '\n');
const receiptPath = resolve(target, 'receipt.json');
try { await writeFile(receiptPath, receiptBytes, { flag: 'wx' }); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
assert.equal(digest(await readFile(receiptPath)), digest(receiptBytes));
console.log(JSON.stringify({ target, files: verified.length, verified: true, receiptSha256: digest(receiptBytes) }));
