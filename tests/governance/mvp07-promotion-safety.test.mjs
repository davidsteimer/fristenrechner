// SPDX-License-Identifier: AGPL-3.0-only
// Private R07-B mutation checks against the independently validated real bytes.
import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareMvp07Promotion, validateMvp07Promotion, sha } from '../../scripts/promote-mvp07-release.ts';
const original = await prepareMvp07Promotion();
const fixture = () => structuredClone(original);
const encode = value => JSON.stringify(value, null, 2) + '\n';
function mutateManifest(prepared, change) {
  const value = JSON.parse(prepared.files.get('manifest.json'));
  change(value); prepared.files.set('manifest.json', encode(value));
}
function mutateArtifact(prepared, path, change) {
  const value = JSON.parse(prepared.files.get(path)); change(value);
  const text = encode(value); prepared.files.set(path, text);
  mutateManifest(prepared, manifest => {
    const descriptor = manifest.artifacts.find(row => row.path === path);
    descriptor.sha256 = sha(text); descriptor.byteLength = Buffer.byteLength(text);
  });
}
test('definitive real bytes pass independent R07-B validation without a reference-only shortcut', async () => {
  const result = await validateMvp07Promotion(fixture());
  assert.equal(result.report.validation.python, 'passed');
  assert.equal(result.report.validation.result.runtimeFiles, 41);
  assert.equal(result.report.validation.result.reboundBernSocialPermissions, 50);
});
test('reject publication authority invented inside an otherwise consistent manifest', async () => {
  const copy = fixture(); mutateManifest(copy, manifest => { manifest.extensions['steimer.release-preparation'].publicationApproved = true; });
  await assert.rejects(validateMvp07Promotion(copy), /External permissions or release preparation contract changed/);
});
test('reject swapped source-approval alias even when local manifest hashes are consistent', async () => {
  const copy = fixture(); mutateManifest(copy, manifest => { manifest.extensions['steimer.approval'].sourceReviewRef.reviewId = 'MVP07-INVENTED-APPROVAL'; });
  await assert.rejects(validateMvp07Promotion(copy), /Unbound release approval or extra approval claim/);
});
test('reject rehashed change to historical source metadata in a legal profile', async () => {
  const copy = fixture(); const path = [...copy.files.keys()].find(path => path.startsWith('profiles/'));
  assert.ok(path);
  mutateArtifact(copy, path, value => { value.sources[0].reviewedOn = '2026-10-08'; });
  await assert.rejects(validateMvp07Promotion(copy), /Historic normative file changed/);
});
test('reject extra unmanifested runtime file', async () => {
  const copy = fixture(); copy.files.set('unbound-extra.json', '{}\n');
  await assert.rejects(validateMvp07Promotion(copy), /Missing or extra runtime files/);
});
test('reject false social source review despite resealed descriptor', async () => {
  const copy = fixture(); mutateArtifact(copy, 'social-procedures/ch-social-procedures.json', value => {
    value.releaseEligibility[0].sourceReviewRef.sha256 = '0'.repeat(64);
  });
  await assert.rejects(validateMvp07Promotion(copy), /Wrong social source acceptance/);
});
