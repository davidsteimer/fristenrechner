// SPDX-License-Identifier: AGPL-3.0-only
// Local C2 verification. Does not promote data, modify historical proofs or deploy.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'outputs/ap22c2-2026-10-08');
const persist = process.argv.includes('--write');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const load = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
assert.match(process.version, /^v22\./, 'Use the project Node 22 toolchain for the final C2 proof');
async function run(name, command, args) {
  const chunks = [];
  const child = spawn(command, args, { cwd: root, env: { ...process.env, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => chunks.push(chunk));
  child.stderr.on('data', chunk => chunks.push(chunk));
  const code = await new Promise((ok, bad) => { child.on('error', bad); child.on('close', ok); });
  const text = Buffer.concat(chunks).toString('utf8');
  if (persist) { await mkdir(output, { recursive: true }); await writeFile(join(output, `${name}.txt`), text); }
  if (code !== 0) { console.error(text); throw new Error(`${name} failed (${code})`); }
  console.log(`${name}: passed`);
  return { command: [command, ...args], passed: true,
    tests: Number(/# tests (\d+)/.exec(text)?.[1] ?? /Ran (\d+) tests/.exec(text)?.[1] ?? 0), outputSha256: sha(text) };
}
async function c1Binding() {
  const qaPath = 'outputs/ap22c1-2026-10-08/QA-AP22C1.json';
  assert.equal(sha(await readFile(resolve(root, qaPath))), '21381e84e85e42e2f43d01fd054efe161adf14fef91d4e419030e8dd0874167c');
  const receiptPath = 'outputs/ap22c1-abnahme-2026-10-08/receipt.json';
  assert.equal(sha(await readFile(resolve(root, receiptPath))), '5b0e2e9da7ac5b5306361311927f6b90ada3d1b89ba3d7081d0ebe31fa9076aa');
  const inventory = await load('outputs/ap22c1-2026-10-08/inventory.json');
  for (const entry of inventory.artifacts) {
    const raw = await readFile(resolve(root, 'outputs/ap22c1-2026-10-08', entry.path));
    assert.equal(raw.length, entry.byteLength); assert.equal(sha(raw), entry.sha256);
  }
  return { artifacts: inventory.artifacts.length, qaSha256: sha(await readFile(resolve(root, qaPath))), receiptSha256: sha(await readFile(resolve(root, receiptPath))) };
}
const frozenC1 = await c1Binding();
const runs = {};
runs.acceptance = await run('c1-acceptance-integrity', process.execPath, ['scripts/archive-ap22c1-acceptance.mjs']);
runs.types = await run('typecheck', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']);
const c2 = (await Promise.all(['core', 'ui'].map(async dir => (await readdir(resolve(root, `tests/${dir}`)))
  .filter(name => name.startsWith('ap22c2-') && /\.test\.tsx?$/.test(name)).sort().map(name => `tests/${dir}/${name}`)))).flat();
runs.node = await run('node-tests', process.execPath, ['--import', 'tsx', '--test', '--test-reporter=tap', ...c2]);
runs.product = await run('product-regression', process.execPath, ['scripts/run-standard-tests.mjs', 'product']);
runs.python = await run('c1-python-regression', resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_ap22c1_contract.py']);
runs.ap22bNode = await run('ap22b-node-regression', process.execPath, ['--test', '--test-reporter=tap', 'tests/governance/ap22b-contract.test.mjs', 'tests/governance/ap22b-reference-index.test.mjs']);
runs.ap22bPython = await run('ap22b-python-regression', resolve(root, '.venv/bin/python'), ['-m', 'unittest', 'discover', '-s', 'tests/data', '-p', 'test_ap22b_*.py']);
runs.preview = await run('preview-build', process.execPath, ['scripts/build-ui-preview.mjs']);
runs.historicalData = await run('historical-data-unchanged', 'git', ['diff', '--exit-code', '--', 'data/releases', 'schemas/calendar-rules-v2.schema.json', 'schemas/holiday-catalog-v1.schema.json', 'schemas/release-manifest-v6.schema.json', 'src/core/data.ts', 'src/provider', 'src/spfx', 'src/public-app']);
runs.whitespace = await run('diff-check', 'git', ['diff', '--check']);
await c1Binding();
const files = [
  'docs/fachrecht/abnahme-ap22c1.md', 'docs/architektur/kalenderintegration-ap22c2.md', 'package.json',
  'src/core/calendarResolution.ts', 'src/core/calculateCalendarBoundDeadline.ts',
  'src/ui/defaults.ts', 'src/ui/model.ts', 'src/ui/FristenrechnerApp.tsx', 'src/ui/calendarContextUi.tsx', 'src/ui/calendarMessages.ts', 'src/ui/styles.css',
  'src/ui/preview/main.tsx', 'src/release/ap22c2CandidateData.ts',
  'outputs/ap22c2-2026-10-08/browser-qa.md',
  'outputs/ap22c2-2026-10-08/oberflaeche-de.jpg', 'outputs/ap22c2-2026-10-08/januarvergleich-de.jpg', 'outputs/ap22c2-2026-10-08/rechenspur-fr-schmal.jpg',
  'scripts/archive-ap22c1-acceptance.mjs', 'scripts/check-ap22c2.mjs', 'scripts/run-standard-tests.mjs', 'tests/ui/i18n.test.ts', ...c2
];
const artifacts = [];
for (const path of files) { const raw = await readFile(resolve(root, path)); artifacts.push({ path, sha256: sha(raw), byteLength: raw.length }); }
const report = { kind: 'ap22c2-implementation-qa', date: '2026-10-08', status: 'ready-for-review', accepted: false,
  contractDecision: 'DEC-2026-030', runtime: 'local-reference-preview-only', runtimeReleaseApproved: false,
  sourceReviewPerformed: false, releaseBuilt: false, published: false, deployed: false,
  environment: { node: process.version, python: '.venv/bin/python', scope: 'C2 resolver, complete deadline comparison, shared UI and defaults. No provider or host deployment.' },
  frozenC1, runs, artifacts,
  visualQA: 'See browser-qa.md. Automated tests do not replace a real-host C3 proof or David Steimer acceptance.' };
if (persist) await writeFile(join(output, 'QA-AP22C2.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, nodeTests: runs.node.tests, productTests: runs.product.tests, pythonTests: runs.python.tests }, null, 2));
