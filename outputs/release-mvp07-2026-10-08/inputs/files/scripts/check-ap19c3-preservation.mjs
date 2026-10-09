// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {dirname, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const previous = spawnSync(process.execPath, ['scripts/check-ap19c2-preservation.mjs'], {cwd: root, encoding: 'utf8'});
assert.equal(previous.status, 0, previous.stderr);
const results = JSON.parse(previous.stdout).artifacts;
const acceptance = resolve(root, 'docs/fachrecht/abnahme-ap19c2.md');
const text = await readFile(acceptance, 'utf8');
const protectedC2 = [...text.matchAll(/\| \[[^\]]+\]\(([^)]+)\) \| `([0-9a-f]{64})` \|/g)]
  .map(match => [relative(root, resolve(dirname(acceptance), match[1])), match[2]])
  .filter(([path]) => !path.startsWith('src/'));
assert.equal(protectedC2.length, 5);
const base = 'data/candidates/2026-09-28-ap19c2';
const manifest = JSON.parse(await readFile(resolve(root, base, 'manifest.json'), 'utf8'));
protectedC2.push(...manifest.artifacts.map(artifact => [`${base}/${artifact.path}`, artifact.sha256]));
for (const [path, expected] of protectedC2) {
  const actual = createHash('sha256').update(await readFile(resolve(root, path))).digest('hex');
  assert.equal(actual, expected, `Protected C2 artifact changed: ${path}`);
  results.push({path, sha256: actual, unchanged: true});
}
console.log(JSON.stringify({workPackage: 'AP19C3', checkedOn: new Date().toISOString(), count: results.length,
  passed: true, note: 'Accepted C1/C2 source hashes remain historical. Live UI/core source evolves in C3.', artifacts: results}, null, 2));

