// SPDX-License-Identifier: AGPL-3.0-only
// Local D1 proof only. No data promotion, package build or publication.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'outputs/ap23d1-2026-10-14');
const write = process.argv.includes('--write');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.match(process.version, /^v22\./, 'Use the project Node 22 toolchain');
const historicalPath = 'outputs/ap23c-vertrag-2026-10-14/QA-AP23C.json';
const historicalHash = '3db2767c9c58a0adbf86828a1e0211ccd18d321b1d44b3e87d515cb4755b1328';
async function preservedContract() {
  const bytes = await readFile(resolve(root, historicalPath));
  assert.equal(sha(bytes), historicalHash);
  const report = JSON.parse(bytes);
  for (const item of report.artifacts) {
    const bytes = await readFile(resolve(root, item.path));
    assert.equal(bytes.length, item.byteLength, item.path);
    assert.equal(sha(bytes), item.sha256, item.path);
  }
  return { reportSha256: historicalHash, artifacts: report.artifacts.length };
}
async function run(name, args) {
  const chunks = [];
  const processChild = spawn(process.execPath, args, { cwd: root, env: { ...process.env, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  processChild.stdout.on('data', chunk => chunks.push(chunk));
  processChild.stderr.on('data', chunk => chunks.push(chunk));
  const code = await new Promise((done, reject) => { processChild.on('error', reject); processChild.on('close', done); });
  const text = Buffer.concat(chunks).toString('utf8');
  if (write) { await mkdir(output, { recursive: true }); await writeFile(resolve(output, `${name}.txt`), text); }
  if (code !== 0) { console.error(text); throw new Error(`${name} failed (${code})`); }
  console.log(`${name}: passed`);
  return { command: ['node', ...args], tests: Number(/# tests (\d+)/.exec(text)?.[1] ?? 0), passed: true, outputSha256: sha(text) };
}
const frozen = await preservedContract();
const testFiles = (await readdir(resolve(root, 'tests/core'))).filter(name => /^ap23d1-.*\.test\.ts$/.test(name)).sort().map(name => `tests/core/${name}`);
assert.equal(testFiles.length, 4, 'Unexpected D1 test inventory');
const documents = ['docs/fachrecht/abnahme-ap23c.md', 'docs/entscheidungen/DEC-2026-032-beschluss.md', 'docs/architektur/verwaltungsintegration-ap23d1.md'];
const paths = [...documents, 'README.md', 'docs/architektur/README.md', 'docs/fachrecht/README.md', 'docs/entscheidungen/README.md',
  'package.json', 'src/core/calculateDeadline.ts', 'src/core/dayDeadlineArithmetic.ts',
  'src/core/administrativeTypes.ts', 'src/core/administrativeCatalog.ts', 'src/core/administrativeDeadline.ts', 'src/core/releaseFormat8.ts',
  'scripts/check-ap23d1.mjs', 'scripts/check-ap23d1-legacy-equivalence.mjs', 'tests/core/ap23d1Fixtures.ts', ...testFiles,
  ...(await readdir(resolve(root, 'schemas/implementation/ap23d1'))).filter(name => name.endsWith('.json')).sort().map(name => `schemas/implementation/ap23d1/${name}`)];
const artifacts = [];
for (const path of paths) { const bytes = await readFile(resolve(root, path)); artifacts.push({ path, byteLength: bytes.length, sha256: sha(bytes) }); }
const runs = {};
runs.types = await run('typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']);
runs.d1 = await run('d1-tests', ['--import', 'tsx', '--test', ...testFiles]);
runs.legacyEquivalence = await run('legacy-equivalence', ['--import', 'tsx', 'scripts/check-ap23d1-legacy-equivalence.mjs']);
runs.product = await run('product-regression', ['scripts/run-standard-tests.mjs', 'product']);
await preservedContract();
const unchanged = ['data/releases', 'src/ui', 'src/providers', 'src/release', 'spfx',
  'schemas/legal-profile.schema.json', 'schemas/release-manifest-v7.schema.json',
  'schemas/calendar-rules-v3.schema.json', 'schemas/holiday-catalog-v2.schema.json'];
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', ...unchanged], { cwd: root, encoding: 'utf8' }).trim(), '', 'Out-of-scope product changes');
execFileSync('git', ['diff', '--check'], { cwd: root, encoding: 'utf8' });
let links = 0;
for (const path of documents) {
  const text = await readFile(resolve(root, path), 'utf8');
  assert.ok(!text.includes('ß'), path);
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^https?:/.test(target) || target.endsWith('/QA-AP23D1.json')) continue;
    await readFile(resolve(root, dirname(path), target)); links++;
  }
}
for (const item of artifacts) {
  const bytes = await readFile(resolve(root, item.path));
  assert.equal(bytes.length, item.byteLength, `Changed during tests: ${item.path}`);
  assert.equal(sha(bytes), item.sha256, `Changed during tests: ${item.path}`);
}
const report = { kind: 'ap23d1-implementation-qa', date: '2026-10-14', status: 'ready-for-technical-acceptance',
  accepted: false, contractDecision: 'DEC-2026-032', contractApproved: true,
  productCoreImplemented: true, hostIntegrated: false, sourceReleaseApproved: false, releaseBuilt: false, published: false,
  environment: { node: process.version, scope: 'Reader and genuine core tests, no SPFx/Web build or browser tests' },
  frozenAP23C: frozen, legacyEquivalenceCases: 1584, runs,
  checks: { protectedPathsUnchanged: unchanged, localDocumentLinks: links, gitDiffCheckPassed: true, artifactsStableDuringTests: true }, artifacts };
if (write) await writeFile(resolve(output, 'QA-AP23D1.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, tests: runs.d1.tests, productTests: runs.product.tests, legacyEquivalenceCases: report.legacyEquivalenceCases, artifacts: artifacts.length }, null, 2));
