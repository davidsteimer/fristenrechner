// SPDX-License-Identifier: AGPL-3.0-only
// Local checks and immutable evidence copies. No deployment or publication.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = 'outputs/recovery-mvp07-0.7.0.1-2026-10-08';
const NODE = '.work/toolchains/node-v22.23.2-darwin-arm64/bin/node';
const DOCS = ['README.md', 'docs/README.md', 'docs/betrieb/eq-installationsvorlage-mvp07.md',
  'docs/betrieb/deployment-mvp-07.md', 'docs/betrieb/pruefmatrix-mvp07.md', 'docs/betrieb/rueckfall-mvp07.md'];
const OLD = 'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01';
const NEW = 'outputs/release-mvp07-2026-10-08';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const read = file => fs.readFile(path.resolve(ROOT, file));
const parse = async file => JSON.parse(await read(file));
async function files(dir) {
  const result = [];
  for (const entry of (await fs.readdir(path.resolve(ROOT, dir), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.DS_Store') continue;
    const file = `${dir}/${entry.name}`;
    assert(!entry.isSymbolicLink(), `No archive symlinks ${file}`);
    if (entry.isDirectory()) result.push(...await files(file));
    else if (entry.isFile()) result.push(file);
  }
  return result;
}
async function verify(out) {
  const manifest = await parse(`${out}/artifact-verification.json`);
  for (const item of manifest.files) {
    const bytes = await read(`${out}/${item.path}`);
    assert.equal(bytes.length, item.byteLength, item.path);
    assert.equal(sha(bytes), item.sha256, item.path);
  }
  const actual = (await files(out)).map(file => path.relative(out, file)).filter(file => file !== 'artifact-verification.json').sort();
  assert.deepEqual(actual, manifest.files.map(item => item.path).sort());
  const pkg = await read(`${out}/${manifest.package.path}`);
  assert.equal(sha(pkg), manifest.package.sha256);
  console.log(json({ passed: true, archive: out, verifiedFiles: manifest.files.length, package: manifest.package,
    artifactVerificationSha256: sha(await read(`${out}/artifact-verification.json`)), liveHostVerified: false }));
}

const [mode, argument, packageRun] = process.argv.slice(2);
if (mode === '--verify') {
  assert.equal(process.argv.length, argument ? 4 : 3);
  await verify(argument ?? OUT);
} else {
  assert.equal(path.resolve(process.execPath), path.resolve(ROOT, NODE));
  assert.equal(process.version, 'v22.23.2');
  assert.match(argument ?? '', /^\.work\/mvp07-recovery-[A-Za-z0-9]+$/);
  const stage = argument;
  const build = await parse(`${stage}/verification.json`);
  assert.equal(build.passed, true);
  assert.equal(sha(await read(build.packagePath)), build.packageSha256);
  if (mode === '--test-source') {
    assert.equal(process.argv.length, 4);
    const tests = ['recovery-storage.test.ts', 'recovery-lifecycle.test.ts'];
    const paths = (await files('spfx/recovery-mvp07')).filter(file => /\.(ts|tsx)$/.test(file));
    const before = await Promise.all(paths.map(async file => ({ path: file, sha256: sha(await read(file)) })));
    const args = ['--import', 'tsx', '--test', '--test-timeout=60000', ...tests.map(file => `recovery-mvp07/${file}`)];
    const result = spawnSync(process.execPath, args, { cwd: path.resolve(ROOT, 'spfx'), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const stdout = Buffer.from(result.stdout ?? ''), stderr = Buffer.from(`${result.stderr ?? ''}${result.error ?? ''}`);
    await fs.writeFile(path.resolve(ROOT, stage, 'source-tests.stdout.log'), stdout, { flag: 'wx' });
    await fs.writeFile(path.resolve(ROOT, stage, 'source-tests.stderr.log'), stderr, { flag: 'wx' });
    for (const item of before) assert.equal(sha(await read(item.path)), item.sha256);
    const passed = result.status === 0 && /# tests 32\b/.test(stdout.toString()) && /# pass 32\b/.test(stdout.toString()) && /# fail 0\b/.test(stdout.toString());
    const proof = { passed, testedAt: new Date().toISOString(), node: process.version, args, cwd: 'spfx',
      exitCode: result.status, tests: 32, sourceBindings: before, stdoutSha256: sha(stdout), stderrSha256: sha(stderr),
      scope: '18 defaults and 14 controlled lifecycle source tests. Not a packaged or live-host test.' };
    await fs.writeFile(path.resolve(ROOT, stage, 'source-tests.json'), json(proof), { flag: 'wx' });
    console.log(json(proof));
    assert(passed, 'Source test suite failed');
  } else if (mode === '--archive') {
    assert.equal(process.argv.length, 5);
    assert(packageRun?.startsWith(`${stage}/package-tests.`));
    assert.equal(sha(await read('scripts/build-mvp07-recovery.mjs')), build.builderSha256);
    const sourceTests = await parse(`${stage}/source-tests.json`);
    assert(sourceTests.passed);
    for (const item of sourceTests.sourceBindings) assert.equal(sha(await read(item.path)), item.sha256);
    const packageReport = await parse(`${packageRun}/result.json`);
    assert.equal(packageReport.exitCode, 0);
    assert.equal(packageReport.packages.find(item => item.role === 'recovery').packageSha256, build.packageSha256);
    for (const item of packageReport.testInputsVerifiedBeforeAndAfterRun) {
      assert.equal(sha(await read(item.pathRelativeToRepo)), item.sha256);
    }
    for (const item of Object.values(packageReport.artifacts)) {
      const bytes = await read(`${packageRun}/${item.path}`);
      assert.equal(bytes.length, item.bytes);
      assert.equal(sha(bytes), item.sha256);
    }
    const stdout = await read(`${packageRun}/${packageReport.artifacts.stdout.path}`);
    assert.match(stdout.toString(), /# tests 11\b/);
    assert.match(stdout.toString(), /# pass 11\b/);
    assert.match(stdout.toString(), /# fail 0\b/);
    assert(stdout.toString().includes(build.packageSha256), 'Test log must bind exact package');
    const bindings = await parse(`${stage}/source-bindings.json`);
    for (const item of bindings) assert.equal(sha(await read(item.source)), item.sha256, item.source);
    const protectedFiles = await parse(`${stage}/protected-before.json`);
    for (const item of protectedFiles) assert.equal(sha(await read(item.path)), item.sha256, item.path);
    // A fresh archive only. No overwrite of any previously frozen candidate.
    await fs.mkdir(path.resolve(ROOT, OUT));
    const inventory = [];
    async function copy(source, destination) {
      const bytes = await read(source), target = path.resolve(ROOT, OUT, destination);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, bytes, { flag: 'wx' });
      inventory.push({ path: destination, source, byteLength: bytes.length, sha256: sha(bytes) });
    }
    const packagePath = 'artifacts/fristenrechner-schweiz-recovery-0.7.0.1.sppkg';
    await copy(build.packagePath, packagePath);
    for (const file of ['verification.json', 'source-bindings.json', 'protected-before.json',
      'source-tests.json', 'source-tests.stdout.log', 'source-tests.stderr.log', ...build.steps.map(step => path.basename(step.log))]) {
      await copy(`${stage}/${file}`, `build-evidence/${file}`);
    }
    for (const file of await files(packageRun)) await copy(file, `package-tests/${path.relative(packageRun, file)}`);
    for (const file of new Set(bindings.map(item => item.source))) await copy(file, `source-inputs/${file}`);
    for (const dir of ['src', 'schemas', 'spfx/src', 'spfx/config', 'spfx/scripts', 'spfx/teams']) {
      for (const file of await files(`${stage}/${dir}`)) await copy(file, `build-inputs/${path.relative(stage, file)}`);
    }
    for (const file of ['package.json', 'spfx/package.json', 'spfx/package-lock.json', 'spfx/tsconfig.json', 'spfx/eslint.config.js']) {
      await copy(`${stage}/${file}`, `build-inputs/${file}`);
    }
    for (const file of [...await files('spfx/recovery-mvp07'), 'spfx/test-build/package-harness.cjs', 'scripts/build-mvp07-recovery.mjs',
      'scripts/archive-mvp07-recovery.mjs', 'docs/betrieb/freigabe-wiederherstellung-mvp07.md']) {
      await copy(file, `implementation/${file}`);
    }
    for (const file of DOCS) await copy(file, `documentation-before/${file}`);
    for (const [base, label, pkg] of [[OLD, 'mvp06', '0.6.0.1'], [NEW, 'mvp07', '0.7.0.0']]) {
      await copy(`${base}/artifact-verification.json`, `basis/${label}-artifact-verification.json`);
      await copy(`${base}/artifacts/fristenrechner-schweiz-${pkg}.sppkg`, `basis/fristenrechner-schweiz-${pkg}.sppkg`);
    }
    for (const id of ['2026-08-29-ap5-approved.1', '2026-10-01-mvp-06-approved.1', '2026-10-08-mvp-07-approved.1']) {
      const base = `data/releases/${id}`;
      for (const file of await files(base)) await copy(file, `basis/${file}`);
    }
    for (const [id, module] of [['typescript','typescript'], ['spfx','@microsoft/sp-webpart-base'],
      ['webpack','webpack'], ['react','react'], ['fake-indexeddb','fake-indexeddb']]) {
      await copy(`spfx/node_modules/${module}/package.json`, `toolchain/${id}-package.json`);
    }
    const manifest = { kind: 'mvp07RecoveryCandidate', archivedAt: new Date().toISOString(), localOnly: true,
      functionalBaseline: build.functionalBaseline, packageVersion: '0.7.0.1', componentVersion: '0.7.1', node: process.version,
      package: { path: packagePath, byteLength: build.packageByteLength, sha256: build.packageSha256 },
      sourceTests: 32, packageTests: 11, socialUiSubmissionsWithinPackageTests: 100,
      protectedFilesUnchanged: protectedFiles.length, calculatorFilesByteIdentical: build.archivedCalculatorFiles.length,
      installationAuthorized: false, publicationAuthorized: false, liveHostVerified: false,
      files: inventory.sort((a,b) => a.path.localeCompare(b.path)) };
    await fs.writeFile(path.resolve(ROOT, OUT, 'artifact-verification.json'), json(manifest), { flag: 'wx' });
    await verify(OUT);
  } else throw new Error('Use --test-source STAGE, --archive STAGE PACKAGE_RUN or --verify [ARCHIVE]');
}
