// SPDX-License-Identifier: AGPL-3.0-only
// Isolated, non-deployable integration build. Never overwrites the archived SPPKG.
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const originalPackage = resolve(root, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const originalHash = sha(await readFile(originalPackage));
await mkdir(resolve(root, '.work'), {recursive: true});
const stage = await mkdtemp(resolve(root, '.work/ap19c-spfx-build-'));
const target = resolve(stage, 'spfx');
await mkdir(target);
const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
for (const item of await readdir(resolve(root, 'spfx'), {withFileTypes: true})) {
  if (!excluded.has(item.name)) await cp(resolve(root, 'spfx', item.name), resolve(target, item.name), {recursive: true});
}
await symlink(resolve(root, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
for (const name of ['src', 'schemas', 'data', 'tests']) await symlink(resolve(root, name), resolve(stage, name), 'dir');
const env = {...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`};
const commands = [
  ['npm', ['test']],
  [resolve(target, 'node_modules/.bin/heft'), ['test', '--clean', '--production']],
  [process.execPath, ['scripts/audit-product-css.mjs']],
  [resolve(target, 'node_modules/.bin/heft'), ['package-solution', '--production']],
  ['npm', ['run', 'test:built']]
];
const report = {purpose: `${process.argv.includes('--ap20c3') ? 'AP20C3' : process.argv.includes('--ap20c2') ? 'AP20C2' : process.argv.includes('--ap20c1') ? 'AP20C1' : process.argv.includes('--ap19c3') ? 'AP19C3' : process.argv.includes('--ap19c2') ? 'AP19C2' : 'AP19C1'} isolated integration build, NOT a release or installation package`, stage, originalPackage, originalHash, steps: []};
let failed = false;
for (const [command, args] of commands) {
  const result = spawnSync(command, args, {cwd: target, env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  const index = report.steps.length + 1;
  const log = resolve(stage, `step-${index}.log`);
  await writeFile(log, `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`);
  report.steps.push({command, args, exitCode: result.status, log});
  console.log(JSON.stringify(report.steps.at(-1)));
  if (result.status !== 0) { failed = true; break; }
}
report.originalHashAfter = sha(await readFile(originalPackage));
if (report.originalHashAfter !== originalHash) throw new Error('Original SPPKG changed during isolated build');
if (!failed) report.testPackageSha256 = sha(await readFile(resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg')));
report.passed = !failed;
await writeFile(resolve(stage, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({stage, passed: !failed, originalPackageUnchanged: true}));
process.exitCode = failed ? 1 : 0;
