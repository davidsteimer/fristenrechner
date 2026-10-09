// SPDX-License-Identifier: AGPL-3.0-only
// Isolated definitive local build. Does not overwrite earlier package archives.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(resolve(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
await verifyMvp06SourceApproval(root);
const releaseId = '2026-10-01-mvp-06-approved.1';
const packagePath = 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg';
const priorHash = hash(await read(packagePath));
assert.equal(priorHash, '9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346', 'Prior package must remain unchanged');
const rollbackPackagePath = 'outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg';
const rollbackPackageSha256 = hash(await read(rollbackPackagePath));
assert.equal(rollbackPackageSha256, 'f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39');
const config = JSON.parse(await read('spfx/config/package-solution.json'));
assert.equal(config.solution.version, '0.6.0.0');
assert.equal(config.solution.features[0].version, '0.6.0.0');
assert.equal(JSON.parse(await read('spfx/package.json')).version, '0.6.0');
const manifestPath = `data/releases/${releaseId}/manifest.json`;
const manifestBytes = await read(manifestPath);
assert.equal(hash(manifestBytes), '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724',
  'Only the exact independently validated promotion can be packaged');
assert.equal(hash(await read('outputs/release-mvp06-2026-10-01/data-promotion.json')),
  '51f946fe36104e83e766ad7b958d2debf678781deee7f9b388c573b928088b91');
const manifest = JSON.parse(manifestBytes);
assert.equal(manifest.releaseStatus, 'approved');
assert.equal(manifest.formatVersion, '6.0.0');
const configuration = await read('spfx/src/core/config.ts');
const pin = configuration.toString().match(/https:\/\/raw\.githubusercontent\.com\/davidsteimer\/fristenrechner\/([0-9a-f]{40})\/data\/releases\/2026-10-01-mvp-06-approved\.1/);
assert.ok(pin, 'A real immutable MVP06 data pin is required before definitive packaging');
for (const artifact of [{ path: 'manifest.json', sha256: hash(manifestBytes) }, ...manifest.artifacts]) {
  const path = `data/releases/${releaseId}/${artifact.path}`;
  const bytes = await read(path);
  assert.equal(hash(bytes), artifact.sha256);
  const blob = spawnSync('git', ['cat-file', 'blob', `${pin[1]}:${path}`], {cwd: root});
  assert.equal(blob.status, 0, `Missing pinned Git blob: ${path}`);
  assert.ok(bytes.equals(blob.stdout), `Local data differs from pinned Git commit: ${path}`);
}
await mkdir(resolve(root, '.work'), { recursive: true });
const stage = await mkdtemp(resolve(root, '.work/mvp06-spfx-build-'));
const target = resolve(stage, 'spfx');
await mkdir(target);
const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
for (const item of await readdir(resolve(root, 'spfx'), { withFileTypes: true })) {
  if (!excluded.has(item.name)) await cp(resolve(root, 'spfx', item.name), resolve(target, item.name), { recursive: true });
}
await symlink(resolve(root, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
for (const name of ['src', 'schemas', 'data', 'tests', 'outputs']) await symlink(resolve(root, name), resolve(stage, name), 'dir');
async function productInputFiles() {
  const paths = ['src/release/mvp06ReleaseData.ts', 'package.json', 'package-lock.json',
    'spfx/package.json', 'spfx/package-lock.json', 'scripts/build-public-app.mjs', 'scripts/browser-globals-plugin.mjs'];
  for (const directory of ['src/core', 'src/ui', 'src/public-app', 'schemas', 'spfx/src/core',
    'spfx/src/webparts', 'spfx/scripts', 'spfx/config', 'public-app']) {
    for (const item of await readdir(resolve(root, directory), { recursive: true, withFileTypes: true })) {
      if (item.isFile() && !item.parentPath.includes('/preview')) paths.push(relative(root, resolve(item.parentPath, item.name)));
    }
  }
  return Promise.all(paths.sort().map(async path => { const bytes = await read(path); return { path, sha256: hash(bytes), byteLength: bytes.length }; }));
}
const buildInputs = await productInputFiles();
const commands = [
  ['npm', ['test']],
  [resolve(target, 'node_modules/.bin/heft'), ['test', '--clean', '--production']],
  [process.execPath, ['scripts/audit-product-css.mjs']],
  [resolve(target, 'node_modules/.bin/heft'), ['package-solution', '--production']],
  ['npm', ['run', 'test:built']]
];
const report = { purpose: 'MVP06 definitive local SPFx build, not installed or published', releaseId,
  applicationVersion: '0.6.0', packageVersion: '0.6.0.0', pinCommit: pin[1],
  manifestSha256: hash(manifestBytes), stage: relative(root, stage),
  priorPackagePath: packagePath, priorPackageSha256: priorHash,
  rollbackPackagePath, rollbackPackageSha256, productInputFiles: buildInputs,
  publicationVerified: false, installationAuthorized: false, productionActivation: false, steps: [] };
let passed = true;
for (const [command, args] of commands) {
  const result = spawnSync(command, args, { cwd: target, env: { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}` }, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const log = resolve(stage, `step-${report.steps.length + 1}.log`);
  await writeFile(log, `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`);
  report.steps.push({ command: command.includes('/') ? relative(target, command) : command, args, exitCode: result.status, log: relative(root, log) });
  console.log(JSON.stringify(report.steps.at(-1)));
  if (result.status !== 0) { passed = false; break; }
}
assert.equal(hash(await read(packagePath)), priorHash, 'Prior archived SPPKG changed');
assert.equal(hash(await read(rollbackPackagePath)), rollbackPackageSha256, 'MVP05 rollback package changed');
assert.deepEqual(await productInputFiles(), buildInputs, 'Product sources changed during the build');
report.passed = passed;
if (passed) {
  report.packagePath = relative(root, resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg'));
  report.packageSha256 = hash(await read(report.packagePath));
}
await writeFile(resolve(stage, 'verification.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ buildEvidence: relative(root, resolve(stage, 'verification.json')), passed, priorPackageUnchanged: true }));
process.exitCode = passed ? 0 : 1;
