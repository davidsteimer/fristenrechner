// SPDX-License-Identifier: AGPL-3.0-only
// Local-only audit. Output includes private backup paths and is not for publication.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
// The old AP19C guards retain their historical meaning and are not weakened.
// The only documented evolution is one live reference-import test. Its exact
// accepted bytes are checked at the archive, its new bytes separately below.
const evolvedPath = 'tests/governance/ap19b-references.test.mjs';
const archivePath = 'tests/archive/ap19b-references.accepted-2026-09-25.mjs';
const archiveHash = 'ac9c85d9877f0e20b7ea95e71ac533b662a5d8d5e10a22382dd3ec753bbc329e';
const evolvedHash = '529541b7b123e2abd5779c3eb77d0507d4a69376da892d180f829ea8fc4be067';
const checks = [];
for (const [name, count, sourceHistory] of [
  ['abnahme-ap19a.md', 7, false], ['abnahme-ap19b.md', 9, false],
  ['abnahme-ap19c1.md', 5, true], ['abnahme-ap19c2.md', 5, true], ['abnahme-ap19c3.md', 5, true]
]) {
  const file = resolve(root, 'docs/fachrecht', name);
  const text = await readFile(file, 'utf8');
  const rows = [...text.matchAll(/\| \[[^\]]+\]\(([^)]+)\) \| `([0-9a-f]{64})` \|/g)]
    .map(match => [relative(root, resolve(dirname(file), match[1])), match[2]])
    .filter(([path]) => !sourceHistory || !path.startsWith('src/'));
  assert.equal(rows.length, count, `Complete acceptance inventory required: ${name}`);
  checks.push(...rows);
}
for (const base of ['data/candidates/2026-09-25-ap19c1', 'data/candidates/2026-09-28-ap19c2', 'data/candidates/2026-09-28-ap19c3']) {
  const manifest = JSON.parse(await readFile(resolve(root, base, 'manifest.json'), 'utf8'));
  assert.equal(manifest.artifacts.length, 10);
  checks.push(...manifest.artifacts.map(artifact => [`${base}/${artifact.path}`, artifact.sha256]));
}
checks.push(
  ['.work/publication-final-mvp04-2026-09-22/artifacts/fristenrechner-mvp04-steimer-web-final.zip', 'e45c780ce9dfac1d71be865df59678273efd0fc6ca1122d145bc09f422b4db16'],
  ['spfx/sharepoint/solution/fristenrechner-schweiz.sppkg', '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346'],
  ['data/releases/2026-09-22-mvp-04-approved.1/manifest.json', 'a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e'],
  ['data/releases/2026-09-22-mvp-04-approved.1/special-regimes/vrpg-be.json', 'f65af0f1aa73a4dc6e0d9a7b80c8ccd89b7196f3ed1d095ae570a451a7bb0638'],
  ['outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx', '46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61'],
  ['fristenrechner-pre-mvp04-2026-09-22.zip', '246b0c88738db71aad320550d6c12fcc9f38c548a7caf3f2dcea63b4262d0c1b'],
  ['wwwroot-webbackup-pre-mvp04-2026-09-22.zip', 'c5c4af821c391dcd7230c392ce99988016154f8a82a4922fc471bb9fbc76d308']
);
assert.equal(checks.length, 68, 'No predecessor evidence may silently disappear');
assert.equal(checks.filter(([path]) => path === evolvedPath).length, 1);
const results = [];
for (const [path, expected] of checks) {
  const readFrom = path === evolvedPath ? archivePath : path;
  if (path === evolvedPath) assert.equal(expected, archiveHash);
  const actual = hash(await readFile(resolve(root, readFrom)));
  assert.equal(actual, expected, `Protected artifact changed: ${readFrom}`);
  results.push({ path, readFrom, sha256: actual, historicalBytesUnchanged: true,
    livePathUnchanged: path !== evolvedPath });
}
const liveHash = hash(await readFile(resolve(root, evolvedPath)));
assert.equal(liveHash, evolvedHash, 'Live test differs from the documented, bounded evolution');
results.push({ path: evolvedPath, sha256: liveHash, evolutionVerified: true,
  reference: 'docs/architektur/mvp05-testvertrag-fortschreibung.md' });
console.log(JSON.stringify({ purpose: 'MVP05 local preparation preservation audit', checkedOn: new Date().toISOString(),
  count: results.length, historicalChecks: checks.length, documentedLiveTestEvolutions: 1,
  passed: true, publishable: false, artifacts: results }, null, 2));
