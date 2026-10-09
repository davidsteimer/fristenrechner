// SPDX-License-Identifier: AGPL-3.0-only
// Local recovery build. No installation, network, publication or archive overwrite.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OLD = 'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01';
const NEW = 'outputs/release-mvp07-2026-10-08';
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const absolute = value => path.resolve(ROOT, value);
const relative = value => path.relative(ROOT, value);
const read = value => fs.readFile(absolute(value));
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const records = value => !value || typeof value !== 'object' ? [] : [value, ...Object.values(value).flatMap(records)];
async function tree(relativeDir) {
  const paths = [];
  for (const entry of (await fs.readdir(absolute(relativeDir), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.DS_Store' || entry.name === '__pycache__' || entry.name.endsWith('.pyc')) continue;
    const child = `${relativeDir}/${entry.name}`;
    assert(!entry.isSymbolicLink(), `Unexpected source symlink ${child}`);
    if (entry.isDirectory()) paths.push(...await tree(child));
    else if (entry.isFile()) paths.push(child);
  }
  return paths;
}
async function inventory(paths) {
  return Promise.all([...new Set(paths)].sort().map(async file => {
    const bytes = await read(file);
    return { path: file, byteLength: bytes.length, sha256: sha(bytes) };
  }));
}
assert.equal(process.argv.length, 2, 'Only a fresh local build is supported');
assert.equal(path.resolve(process.execPath), absolute(NODE));
assert.equal(process.version, 'v22.23.2');
for (const key of ['FRISTENRECHNER_TEST_SPPKG', 'FRISTENRECHNER_DATA_CANDIDATE', 'FRISTENRECHNER_RECOVERY_SPPKG']) assert(!process.env[key], `No override ${key}`);
const approval = await read('docs/betrieb/freigabe-wiederherstellung-mvp07.md');
assert(approval.toString().includes('lokale Umsetzung bestätigt'));
const stage = await fs.mkdtemp(absolute('.work/mvp07-recovery-'));
const target = path.join(stage, 'spfx');
await fs.mkdir(target);
const protectedRoots = ['src', 'spfx/src', 'spfx/config', 'data/releases', OLD, NEW];
const protectedPaths = ['package.json', 'package-lock.json', 'spfx/package.json', 'spfx/package-lock.json',
  ...(await Promise.all(protectedRoots.map(tree))).flat()];
const protectedBefore = await inventory(protectedPaths);
await fs.writeFile(path.join(stage, 'protected-before.json'), json(protectedBefore), { flag: 'wx' });
const oldProofBytes = await read(`${OLD}/artifact-verification.json`);
const newProofBytes = await read(`${NEW}/artifact-verification.json`);
const oldRecords = records(JSON.parse(oldProofBytes));
const newRecords = records(JSON.parse(newProofBytes));
const sourceBindings = [];
async function copy(source, destination, basis) {
  const bytes = await read(source);
  if (basis) {
    const record = basis.find(item => (item.archivedPath === source || item.path === source) && item.sha256 === sha(bytes));
    assert(record, `Unbound archived source ${source}`);
    assert.equal(record.byteLength ?? record.bytes, bytes.length, `Archive size ${source}`);
  }
  const out = path.join(stage, destination);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, bytes);
  sourceBindings.push({ source, destination, byteLength: bytes.length, sha256: sha(bytes), archivedEvidenceVerified: Boolean(basis) });
}
async function copyTree(source, destination, basis) {
  for (const file of await tree(source)) await copy(file, path.join(destination, path.relative(source, file)), basis);
}
const report = { kind: 'mvp07RecoveryBuild', startedAt: new Date().toISOString(), stage: relative(stage),
  recoveryPackageVersion: '0.7.0.1', componentVersion: '0.7.1', functionalBaseline: 'MVP 0.6 / package 0.6.0.1',
  approvalSha256: sha(approval), builderSha256: sha(await read('scripts/build-mvp07-recovery.mjs')),
  oldArtifactProofSha256: sha(oldProofBytes), newArtifactProofSha256: sha(newProofBytes),
  localOnly: true, installationAuthorized: false, publicationAuthorized: false, liveHostVerified: false, steps: [] };
let passed = false;
try {
  assert.equal(sha(await read(`${OLD}/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg`)), '60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587');
  assert.equal(sha(await read(`${NEW}/artifacts/fristenrechner-schweiz-0.7.0.0.sppkg`)), 'bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09');
  for (const dir of ['src/core', 'src/ui', 'schemas', 'spfx/src', 'spfx/config', 'spfx/scripts']) {
    await copyTree(`${OLD}/build-evidence/inputs/${dir}`, dir, oldRecords);
  }
  for (const file of ['package.json', 'spfx/package.json', 'spfx/package-lock.json']) await copy(`${OLD}/build-evidence/inputs/${file}`, file, oldRecords);
  for (const file of ['spfx/tsconfig.json', 'spfx/eslint.config.js']) await copy(file, file);
  await copyTree('spfx/teams', 'spfx/teams');
  for (const file of ['ReleaseService.ts', 'ValidatedReleaseStore.ts', 'cacheIdentity.ts', 'types.ts',
    'providers/GitHubReleaseProvider.ts', 'providers/SharePointReleaseProvider.ts', 'providers/sharePointPath.ts']) {
    await copy(`${NEW}/build-evidence/inputs/spfx/src/core/${file}`, `spfx/src/core/${file}`, newRecords);
  }
  for (const file of ['FristenrechnerWebPart.ts', 'components/IFristenrechnerProps.ts', 'components/Fristenrechner.module.scss']) {
    await copy(`${NEW}/build-evidence/inputs/spfx/src/webparts/fristenrechner/${file}`, `spfx/src/webparts/fristenrechner/${file}`, newRecords);
  }
  await copy('spfx/recovery-mvp07/Fristenrechner.tsx', 'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx');
  await copy('spfx/recovery-mvp07/RecoveryStorage.ts', 'spfx/src/core/RecoveryStorage.ts');
  await copy('spfx/recovery-mvp07/ReleaseService.ts', 'spfx/src/core/ReleaseService.ts');
  await copy('spfx/recovery-mvp07/ValidatedReleaseStore.ts', 'spfx/src/core/ValidatedReleaseStore.ts');
  const typesPath = path.join(target, 'src/core/types.ts');
  const types = await fs.readFile(typesPath, 'utf8');
  const signature = 'activate(release: IValidatedRelease, cacheIdentity?: string): Promise<void>;';
  assert.equal(types.split(signature).length, 2);
  await fs.writeFile(typesPath, types.replace(signature, 'activate(release: IValidatedRelease, cacheIdentity?: string, isCurrent?: () => boolean): Promise<void>;'));
  const config = await fs.readFile(path.join(target, 'src/core/config.ts'), 'utf8');
  assert(config.includes('/19b37336974f3ba7c72333763e1272425239b8cd/data/releases/2026-10-01-mvp-06-approved.1'));
  // Derive metadata only inside this new staging directory.
  for (const file of ['package.json', 'spfx/package.json', 'spfx/package-lock.json']) {
    const p = path.join(stage, file), value = JSON.parse(await fs.readFile(p));
    value.version = '0.7.1';
    if (value.packages?.['']) value.packages[''].version = '0.7.1';
    await fs.writeFile(p, json(value));
  }
  const solutionPath = path.join(target, 'config/package-solution.json');
  const solution = JSON.parse(await fs.readFile(solutionPath));
  assert.equal(solution.solution.id, '13090feb-a6bf-40fa-9d3c-ec8d90516a60');
  assert.equal(solution.solution.features[0].id, '3edf1509-41e9-4a2f-8005-df510eec43b6');
  assert(!solution.solution.webApiPermissionRequests?.length);
  solution.solution.version = '0.7.0.1';
  solution.solution.features[0].version = '0.7.0.1';
  await fs.writeFile(solutionPath, json(solution));
  await fs.symlink(absolute('spfx/node_modules'), path.join(target, 'node_modules'), 'dir');
  const env = { ...process.env, PATH: `${path.dirname(process.execPath)}:${process.env.PATH ?? ''}`,
    npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  const commands = [
    { id: 'schemas', command: process.execPath, args: ['scripts/sync-schemas.mjs'] },
    { id: 'archived-product-sync', command: process.execPath, args: ['scripts/sync-product-source.mjs'] },
    { id: 'compile-bundle', command: path.join(target, 'node_modules/.bin/heft'), args: ['test', '--clean', '--production'] },
    { id: 'css-audit', command: process.execPath, args: ['scripts/audit-product-css.mjs'] },
    { id: 'package', command: path.join(target, 'node_modules/.bin/heft'), args: ['package-solution', '--production'] }
  ];
  for (const step of commands) {
    const result = spawnSync(step.command, step.args, { cwd: target, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const log = Buffer.from(`${result.stdout ?? ''}${result.stderr ?? ''}${result.error ?? ''}`);
    const logPath = path.join(stage, `${report.steps.length + 1}-${step.id}.log`);
    await fs.writeFile(logPath, log, { flag: 'wx' });
    const recorded = { id: step.id, exitCode: result.status, log: relative(logPath), sha256: sha(log) };
    report.steps.push(recorded);
    console.log(JSON.stringify(recorded));
    assert.equal(result.status, 0, `Failed ${step.id}`);
  }
  // Check generated calculator sources against the archived originals, not workspace copies.
  const generated = [];
  for (const dir of ['core', 'ui']) {
    for (const file of await tree(`${OLD}/build-evidence/inputs/src/${dir}`)) {
      if (!/\.(?:ts|tsx|css)$/.test(file) || file.includes('/preview/')) continue;
      const dest = path.join(target, 'src/product', dir, path.relative(`${OLD}/build-evidence/inputs/src/${dir}`, file));
      assert.equal(sha(await fs.readFile(dest)), sha(await read(file)), `Modified archived calculator ${file}`);
      generated.push({ source: file, generated: relative(dest), sha256: sha(await read(file)) });
    }
  }
  assert.equal(sha(await fs.readFile(path.join(target, 'src/core/ReleaseValidator.ts'))), sha(await read(`${OLD}/build-evidence/inputs/spfx/src/core/ReleaseValidator.ts`)));
  report.archivedCalculatorFiles = generated;
  report.packagePath = relative(path.join(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg'));
  const bytes = await read(report.packagePath);
  report.packageSha256 = sha(bytes); report.packageByteLength = bytes.length;
  report.generatedCalculatorUnchanged = true;
  passed = true;
} catch (error) { report.error = String(error?.stack ?? error); }
try {
  for (const item of sourceBindings) assert.equal(sha(await read(item.source)), item.sha256, `Source changed during build ${item.source}`);
  assert.equal(sha(await read('scripts/build-mvp07-recovery.mjs')), report.builderSha256);
  assert.deepEqual(await inventory(protectedPaths), protectedBefore, 'Protected product/data/archive files changed');
  report.protectedFilesUnchanged = protectedBefore.length;
} catch (error) { report.preservationError = String(error); passed = false; }
report.passed = passed;
report.finishedAt = new Date().toISOString();
await fs.writeFile(path.join(stage, 'source-bindings.json'), json(sourceBindings), { flag: 'wx' });
report.sourceBindingsSha256 = sha(await fs.readFile(path.join(stage, 'source-bindings.json')));
await fs.writeFile(path.join(stage, 'verification.json'), json(report), { flag: 'wx' });
console.log(JSON.stringify({ stage: relative(stage), passed, package: report.packagePath, sha256: report.packageSha256, error: report.error }));
process.exitCode = passed ? 0 : 1;
