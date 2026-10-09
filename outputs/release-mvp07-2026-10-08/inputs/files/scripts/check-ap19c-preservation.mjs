// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {dirname, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const checks = [];
for (const name of ['abnahme-ap19a.md', 'abnahme-ap19b.md']) {
  const file = resolve(root, 'docs/fachrecht', name);
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/\| \[[^\]]+\]\(([^)]+)\) \| `([0-9a-f]{64})` \|/g)) {
    checks.push([relative(root, resolve(dirname(file), match[1])), match[2]]);
  }
}
assert.equal(checks.length, 16, 'All 7 AP19A and 9 AP19B acceptance artifacts must be checked');
checks.push(
  ['.work/publication-final-mvp04-2026-09-22/artifacts/fristenrechner-mvp04-steimer-web-final.zip', 'e45c780ce9dfac1d71be865df59678273efd0fc6ca1122d145bc09f422b4db16'],
  ['spfx/sharepoint/solution/fristenrechner-schweiz.sppkg', '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346'],
  ['data/releases/2026-09-22-mvp-04-approved.1/manifest.json', 'a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e'],
  ['data/releases/2026-09-22-mvp-04-approved.1/special-regimes/vrpg-be.json', 'f65af0f1aa73a4dc6e0d9a7b80c8ccd89b7196f3ed1d095ae570a451a7bb0638'],
  ['outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx', '46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61'],
  ['fristenrechner-pre-mvp04-2026-09-22.zip', '246b0c88738db71aad320550d6c12fcc9f38c548a7caf3f2dcea63b4262d0c1b'],
  ['wwwroot-webbackup-pre-mvp04-2026-09-22.zip', 'c5c4af821c391dcd7230c392ce99988016154f8a82a4922fc471bb9fbc76d308']
);
const results = [];
for (const [path, expected] of checks) {
  const actual = sha(await readFile(resolve(root, path)));
  assert.equal(actual, expected, `Protected artifact changed: ${path}`);
  results.push({path, sha256: actual, unchanged: true});
}
console.log(JSON.stringify({workPackage: 'AP19C1', checkedOn: new Date().toISOString(), count: results.length, passed: true, artifacts: results}, null, 2));
