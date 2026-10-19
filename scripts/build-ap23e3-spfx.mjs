// SPDX-License-Identifier: AGPL-3.0-only
// Local integration proof only. Never builds into the operating package path.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const protectedPaths = [
  'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg',
  'spfx/config/package-solution.json', 'spfx/package.json', 'spfx/src/core/config.ts',
  'src/public-app/main.tsx', 'src/release/mvp08ReleaseData.ts',
  'outputs/ap23e3-candidate-2026-10-18/bundle/manifest.json'
];
const bind = async path => {
  const bytes = await readFile(resolve(root, path));
  return { path, byteLength: bytes.length, sha256: sha(bytes) };
};
const protectedBefore = await Promise.all(protectedPaths.map(bind));
await mkdir(resolve(root, '.work'), { recursive: true });
const stage = await mkdtemp(resolve(root, '.work/ap23e3-spfx-build-'));
const target = resolve(stage, 'spfx');
await mkdir(target);
const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
for (const item of await readdir(resolve(root, 'spfx'), { withFileTypes: true })) {
  if (!excluded.has(item.name)) await cp(resolve(root, 'spfx', item.name), resolve(target, item.name), { recursive: true });
}
await symlink(resolve(root, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
for (const name of ['src', 'schemas', 'data', 'tests', 'outputs']) {
  await symlink(resolve(root, name), resolve(stage, name), 'dir');
}
const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}` };
const commands = [
  ['npm', ['test']],
  [resolve(target, 'node_modules/.bin/heft'), ['test', '--clean', '--production']],
  [process.execPath, ['scripts/audit-product-css.mjs']],
  [resolve(target, 'node_modules/.bin/heft'), ['package-solution', '--production']],
  [process.execPath, ['--test', '--test-concurrency=2', '--test-timeout=60000',
    ...(await readdir(resolve(target, 'test-build'))).filter(name => name.endsWith('.test.cjs'))
      .sort().map(name => `test-build/${name}`)]]
];
const report = {
  workPackage: 'AP23E3', status: 'running', localOnly: true, deployable: false,
  purpose: 'Isolated SPFx integration build and actual SPPKG tests. No release or installation authority.',
  compiler: {
    configuration: await bind('spfx/tsconfig.json'),
    target: 'es2015',
    reason: 'TypeScript lowers native private fields to private WeakMaps without removing the accepted runtime capability boundary. Existing Map/WeakMap/Promise runtime requirements remain.'
  },
  stage: relative(root, stage), operatingPackagePreserved: false,
  protectedBefore, protectedAfter: [], steps: []
};
let failed = false;
for (const [command, args] of commands) {
  const result = spawnSync(command, args, { cwd: target, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const log = resolve(stage, `step-${report.steps.length + 1}.log`);
  await writeFile(log, `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`);
  report.steps.push({ command, args, exitCode: result.status, log: relative(root, log) });
  console.log(JSON.stringify(report.steps.at(-1)));
  if (result.status !== 0) { failed = true; break; }
}
report.protectedAfter = await Promise.all(protectedPaths.map(bind));
assert.deepEqual(report.protectedAfter, protectedBefore, 'Operating package, pin or accepted data changed during isolated build');
report.operatingPackagePreserved = true;
if (!failed) {
  report.testPackage = await bind(relative(root, resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg')));
}
report.status = failed ? 'failed' : 'passed';
await writeFile(resolve(stage, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
await mkdir(resolve(root, 'outputs/ap23e3-2026-10-18'), { recursive: true });
await writeFile(resolve(root, 'outputs/ap23e3-2026-10-18/spfx-build.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ stage, status: report.status, operatingPackagePreserved: true }));
process.exitCode = failed ? 1 : 0;

