// SPDX-License-Identifier: AGPL-3.0-only
// Local integration evidence. No source approval, data promotion or deployment.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'outputs/ap22c3-2026-10-08');
const persist = process.argv.includes('--write');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.match(process.version, /^v22\./);
async function run(name, command, args, extraEnv = {}) {
  const chunks = [];
  const child = spawn(command, args, { cwd: root, env: { ...process.env, FORCE_COLOR: '0', ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => chunks.push(chunk)); child.stderr.on('data', chunk => chunks.push(chunk));
  const code = await new Promise((ok, bad) => { child.on('error', bad); child.on('close', ok); });
  const text = Buffer.concat(chunks).toString('utf8');
  if (persist) { await mkdir(output, { recursive: true }); await writeFile(join(output, `${name}.txt`), text); }
  if (code !== 0) { console.error(text); throw new Error(`${name} failed (${code})`); }
  console.log(`${name}: passed`);
  return { command: [command, ...args], passed: true,
    tests: Number(/# tests (\d+)/.exec(text)?.[1] ?? /Ran (\d+) tests/.exec(text)?.[1] ?? 0), outputSha256: sha(text) };
}
async function verifyReceipt(name, expected) {
  const path = `outputs/${name}/receipt.json`;
  const bytes = await readFile(resolve(root, path)); assert.equal(sha(bytes), expected);
  const receipt = JSON.parse(bytes);
  for (const artifact of receipt.artifacts) {
    const content = await readFile(resolve(root, `outputs/${name}`, artifact.path));
    assert.equal(sha(content), artifact.sha256); assert.equal(content.length, artifact.byteLength);
  }
  return { path, sha256: expected, files: receipt.artifacts.length };
}
const frozen = await Promise.all([
  verifyReceipt('ap22c1-abnahme-2026-10-08', '5b0e2e9da7ac5b5306361311927f6b90ada3d1b89ba3d7081d0ebe31fa9076aa'),
  verifyReceipt('ap22c2-abnahme-2026-10-08', '355b0043a2b82e3da7c9ccfbe804529a7e506d87bb04e199ebaa35d1b549704d')
]);
const runs = {};
runs.candidate = await run('candidate-build', process.execPath, ['--import', 'tsx', 'scripts/build-ap22c3-candidate.ts']);
runs.types = await run('typecheck', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']);
const c3 = (await Promise.all(['core', 'ui', 'hosts'].map(async dir => (await readdir(resolve(root, `tests/${dir}`)))
  .filter(name => name.startsWith('ap22c3-') && /\.test\.tsx?$/.test(name)).sort().map(name => `tests/${dir}/${name}`)))).flat();
runs.node = await run('c3-node-tests', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-reporter=tap', ...c3]);
runs.product = await run('product-regression', process.execPath, ['scripts/run-standard-tests.mjs', 'product']);
runs.public = await run('public-regression', process.execPath, ['--import', 'tsx', '--test', ...((await readdir(resolve(root, 'tests/public-app'))).filter(p => p.endsWith('.test.ts')).map(p => `tests/public-app/${p}`))]);
runs.python = await run('c3-python-tests', resolve(root, '.venv/bin/python'), ['tests/data/test_ap22c3_contract.py']);
runs.c1Python = await run('c1-python-regression', resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_ap22c1_contract.py']);
runs.bNode = await run('ap22b-node-regression', process.execPath, ['--test', 'tests/governance/ap22b-contract.test.mjs', 'tests/governance/ap22b-reference-index.test.mjs']);
runs.bPython = await run('ap22b-python-regression', resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_ap22b_*.py']);
runs.preview = await run('preview-build', process.execPath, ['scripts/build-ui-preview.mjs']);
runs.candidatePublic = await run('candidate-public-build', process.execPath, ['scripts/build-public-app.mjs'], { FRISTENRECHNER_DATA_CANDIDATE: 'ap22c3' });
runs.historicalData = await run('historical-data-pins-unchanged', 'git', ['diff', '--exit-code', '--',
  'data/releases', 'schemas/calendar-rules-v2.schema.json', 'schemas/holiday-catalog-v1.schema.json', 'schemas/release-manifest-v6.schema.json',
  'src/public-app/main.tsx', 'src/release/mvp06ReleaseData.ts', 'spfx/config/package-solution.json', 'spfx/src/core/config.ts',
  'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json', 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg']);
runs.whitespace = await run('diff-check', 'git', ['diff', '--check']);
const integrity = JSON.parse(await readFile(join(output, 'bundle-integrity.json')));
for (const artifact of [integrity.manifest, ...integrity.artifacts]) {
  const bytes = await readFile(resolve(root, artifact.path)); assert.equal(sha(bytes), artifact.sha256); assert.equal(bytes.length, artifact.byteLength);
}
const files = new Set([
  'docs/fachrecht/abnahme-ap22c2.md', 'docs/architektur/kalenderintegration-ap22c3.md',
  'scripts/archive-ap22c2-acceptance.mjs', 'scripts/build-ap22c3-candidate.ts', 'scripts/check-ap22c3.mjs', 'scripts/check-ap19c-spfx-build.mjs',
  'scripts/build-public-app.mjs', 'package.json', 'spfx/package.json',
  'tests/data/test_ap22c3_contract.py', 'tests/public-app/ap22c3-build.test.ts',
  'schemas/implementation/ap22c3/local-reference-manifest-v7.schema.json',
  'src/release/ap22c3CandidateData.ts', 'src/public-app/ap22c3-main.tsx',
  'outputs/ap22c3-2026-10-08/bundle-integrity.json', ...c3
]);
async function sourceFiles(folder) {
  for (const item of await readdir(resolve(root, folder), { withFileTypes: true })) {
    const path = `${folder}/${item.name}`;
    if (item.isDirectory()) await sourceFiles(path);
    else if (/\.(?:tsx?|css|scss|mjs|cjs)$/.test(item.name)) files.add(path);
  }
}
for (const folder of ['src/core', 'src/ui', 'spfx/src/core', 'spfx/src/webparts', 'spfx/scripts', 'spfx/test', 'spfx/test-build']) await sourceFiles(folder);
const artifacts = [];
for (const path of [...files].sort()) {
  const bytes = await readFile(resolve(root, path)); artifacts.push({ path, sha256: sha(bytes), byteLength: bytes.length });
}
const report = { kind: 'ap22c3-local-integration-qa', date: '2026-10-08', status: 'ready-for-review', accepted: false,
  contractDecision: 'DEC-2026-030', runtimeMode: 'localReference', sourceReview: 'pending', sourceReleaseApproved: false,
  published: false, deployed: false, productionPinsChanged: false,
  frozen, runs, artifacts,
  additionalEvidence: ['spfx-build.json', 'browser-qa.md', 'completion-integrity.json'],
  boundary: 'Local tests and isolated builds only. Actual E/Q hosts and a source/release approval remain separate.' };
if (persist) await writeFile(join(output, 'QA-AP22C3.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, c3Node: runs.node.tests, product: runs.product.tests, public: runs.public.tests, c3Python: runs.python.tests }, null, 2));
