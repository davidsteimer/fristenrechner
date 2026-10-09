// SPDX-License-Identifier: AGPL-3.0-only
// Local UI evidence only. Real-device and tenant approval remains separate.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { selectStandardSuites } from './run-standard-tests.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(root, 'outputs/ap21-2026-10-08');
const sha = b => createHash('sha256').update(b).digest('hex');
await mkdir(out, { recursive: true });
const receiptPath = 'outputs/ap22c3-abnahme-2026-10-08/receipt.json';
const receiptBytes = await readFile(resolve(root, receiptPath));
assert.equal(sha(receiptBytes), '399186439f8a44a4d604042fc48191dcc3646d5d856568ff6e9b565dfb25ca31');
const receipt = JSON.parse(receiptBytes);
for (const entry of receipt.artifacts) {
  const bytes = await readFile(resolve(root, 'outputs/ap22c3-abnahme-2026-10-08', entry.archivePath));
  assert.equal(sha(bytes), entry.sha256, entry.path);
  assert.equal(bytes.length, entry.byteLength, entry.path);
  if (/^src\/core\/.*\.ts$/.test(entry.path) || entry.path.startsWith('schemas/')
    || entry.path.startsWith('outputs/ap22c3-2026-10-08/') || entry.path.startsWith('src/release/')) {
    assert.equal(sha(await readFile(resolve(root, entry.path))), entry.sha256, `Unchanged AP22C3 input: ${entry.path}`);
  }
}
async function run(name, command, args, env = {}) {
  const chunks = [];
  const child = spawn(command, args, { cwd: root, env: { ...process.env, ...env, FORCE_COLOR: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', b => chunks.push(b)); child.stderr.on('data', b => chunks.push(b));
  const code = await new Promise((yes, no) => { child.on('close', yes); child.on('error', no); });
  const text = Buffer.concat(chunks).toString();
  const path = `outputs/ap21-2026-10-08/${name}.txt`;
  await writeFile(resolve(root, path), text);
  if (code !== 0) { console.error(text); throw new Error(`${name} failed (${code})`); }
  console.log(`${name}: passed`);
  return { command: [command, ...args], passed: true, tests: Number(/# tests (\d+)/.exec(text)?.[1] ?? 0),
    log: { path, sha256: sha(text), byteLength: Buffer.byteLength(text) } };
}
const productTests = selectStandardSuites((await Promise.all(['core', 'ui'].map(async dir =>
  (await readdir(resolve(root, `tests/${dir}`))).filter(p => /\.test\.(?:tsx?|mjs)$/.test(p))
    .sort().map(p => `tests/${dir}/${p}`)))).flat());
const ap21 = productTests.filter(p => p.includes('/ap21-'));
assert.ok(ap21.length >= 4);
const runs = {};
runs.types = await run('typecheck', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']);
runs.ap21 = await run('ap21-tests', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-reporter=tap', ...ap21]);
runs.product = await run('product-tests', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-reporter=tap', ...productTests]);
runs.hosts = await run('host-tests', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', ...((await readdir(resolve(root, 'tests/hosts'))).filter(p=>p.endsWith('.test.ts')).map(p=>`tests/hosts/${p}`))]);
runs.public = await run('public-tests', process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=2', ...((await readdir(resolve(root, 'tests/public-app'))).filter(p=>p.endsWith('.test.ts')).map(p=>`tests/public-app/${p}`))]);
runs.preview = await run('preview-build', process.execPath, ['scripts/build-ui-preview.mjs']);
runs.ap21Build = await run('ap21-build', process.execPath, ['scripts/build-public-app.mjs'], { FRISTENRECHNER_DATA_CANDIDATE: 'ap21' });
runs.pins = await run('production-pins', 'git', ['diff', '--exit-code', '--', 'data/releases', 'src/release/mvp06ReleaseData.ts',
  'src/public-app/main.tsx', 'spfx/src/core/config.ts', 'spfx/config/package-solution.json',
  'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json', 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg']);
runs.whitespace = await run('diff-check', 'git', ['diff', '--check']);

const paths = new Set([...ap21, 'tests/ui/ap22c2-ui.test.tsx', 'tests/ui/preview.test.ts', 'tests/public-app/ap21-build.test.ts',
  'scripts/check-ap21.mjs', 'scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs',
  'scripts/check-ap19c-spfx-build.mjs', 'package.json', 'package-lock.json', 'spfx/package.json', 'spfx/test-build/README.md',
  'src/public-app/ap21-main.tsx', 'docs/architektur/datumseingabe-ap21.md', receiptPath]);
async function sourceFiles(dir) {
  for (const entry of await readdir(resolve(root, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await sourceFiles(path);
    else if (/\.(?:tsx?|css|cjs|mjs)$/.test(entry.name)) paths.add(path);
  }
}
for (const dir of ['src/ui', 'spfx/test-build']) await sourceFiles(dir);
const artifacts = [];
for (const path of [...paths].sort()) {
  const bytes = await readFile(resolve(root, path)); artifacts.push({ path, sha256: sha(bytes), byteLength: bytes.length });
}
const report = { kind: 'ap21-local-ui-qa', date: '2026-10-08', status: 'local-tests-passed-device-validation-open',
  accepted: false, sourceReleaseApproved: false, deployed: false, published: false,
  dataReleaseId: '2026-10-08-ap22c3-reference.1', dataUnchanged: true, coreUnchanged: true,
  realDeviceTestsComplete: false, remainingGates: ['real-ios-teams-edge-chrome-safari', 'macos-desktop-safari-chrome', 'm365-hosts', 'voiceover-zoom', 'human-acceptance'],
  archivedC3FilesVerified: receipt.artifacts.length, runs, artifacts };
await writeFile(resolve(out, 'QA-AP21.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, ap21: runs.ap21.tests, product: runs.product.tests, hosts: runs.hosts.tests, public: runs.public.tests }));
