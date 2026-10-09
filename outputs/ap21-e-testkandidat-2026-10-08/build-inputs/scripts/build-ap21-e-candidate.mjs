// SPDX-License-Identifier: AGPL-3.0-only
// Prepare an independent E-device-test SPPKG. No network or tenant mutations.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rename, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templates = resolve(root, 'spfx/test-candidates/ap21-e');
const output = resolve(root, 'outputs/ap21-e-testkandidat-2026-10-08');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const writeJson = async (path, value) => writeFile(path, JSON.stringify(value, null, 2) + '\n');
const contract = await json(resolve(templates, 'contract.json'));
const previousProof = await json(resolve(root, 'outputs/ap21-2026-10-08/completion-integrity.json'));
const originalPackage = resolve(root, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg');
const originalHash = sha(await readFile(originalPackage));
async function checkPreviousProof() {
  for (const artifact of previousProof.artifacts) {
    assert.equal(sha(await readFile(resolve(root, artifact.path))), artifact.sha256, `AP21 archive changed: ${artifact.path}`);
  }
}
await checkPreviousProof();
await mkdir(resolve(root, '.work'), {recursive: true});
const stage = await mkdtemp(resolve(root, '.work/ap21-e-candidate-'));
const target = resolve(stage, 'spfx');
await mkdir(target);
const excluded = new Set(['node_modules', 'lib', 'lib-commonjs', 'dist', 'temp', 'release', 'sharepoint', '.heft']);
for (const item of await readdir(resolve(root, 'spfx'), {withFileTypes: true})) {
  if (!excluded.has(item.name)) await cp(resolve(root, 'spfx', item.name), resolve(target, item.name), {recursive: true});
}
await symlink(resolve(root, 'spfx/node_modules'), resolve(target, 'node_modules'), 'dir');
await cp(resolve(root, 'src'), resolve(stage, 'src'), {recursive: true});
for (const name of ['schemas', 'data', 'tests', 'outputs']) await symlink(resolve(root, name), resolve(stage, name), 'dir');
const env = {...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH ?? ''}`, AP21_E_STAGE: stage};
const report = {schemaVersion: '1.0.0', workPackage: 'AP21', candidate: contract,
  createdAt: new Date().toISOString(), stage: relative(root, stage),
  purpose: 'Independent E-only device-test candidate. Preparation is not installation approval.',
  installed: false, published: false, installationApproved: false, realDeviceTestsComplete: false,
  baselineProof: 'outputs/ap21-2026-10-08/completion-integrity.json', steps: [], transformations: []};
const inputPaths = ['scripts/build-ap21-e-candidate.mjs', 'tests/ap21-e/candidate.test.cjs',
  'spfx/test-candidates/ap21-e/contract.json', 'spfx/test-candidates/ap21-e/ap21ETestPolicy.ts',
  'spfx/test-candidates/ap21-e/FristenrechnerEDeviceWebPart.ts'];
report.buildInputs = await Promise.all(inputPaths.map(async path => ({path, sha256: sha(await readFile(resolve(root, path)))})));
async function run(label, command, args) {
  const result = spawnSync(command, args, {cwd: target, env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024});
  const log = resolve(stage, `${report.steps.length + 1}-${label}.log`);
  await writeFile(log, `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`);
  const record = {label, command, args, exitCode: result.status, log: relative(root, log)};
  report.steps.push(record);
  await writeJson(resolve(stage, 'verification.json'), report);
  console.log(JSON.stringify(record));
  assert.equal(result.status, 0, `${label} failed. See ${log}`);
  return result.stdout;
}
async function transform(path, edit) {
  const before = await readFile(path, 'utf8');
  const after = edit(before);
  assert.notEqual(after, before, `Transformation did not match ${path}`);
  await writeFile(path, after);
  report.transformations.push({path: relative(stage, path), beforeSha256: sha(before), afterSha256: sha(after)});
}
function once(text, before, after) {
  assert.equal(text.split(before).length - 1, 1, `Expected one occurrence: ${before}`);
  return text.replace(before, after);
}
async function filesIn(directory) {
  const paths = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await filesIn(path));
    else if (entry.isFile()) paths.push(path);
  }
  return paths.sort();
}

// Baseline tests still use the normal identities. Run before any E transform.
await run('baseline-source-tests', 'npm', ['test']);
const historicalRecords = ['e-sp-q01-root-observation.json', 'e-teams-q01-root-observation.json'];
const observationBytes = await Promise.all(historicalRecords.map(name =>
  readFile(resolve(root, '.work/deployments/2026-10-01-eq-mvp06', name))));
const observations = observationBytes.map(bytes => JSON.parse(bytes));
const origin = new URL(observations[0].pageUrl).origin;
const targets = observations.map((observation, index) => {
  assert.equal(observation.observedReleaseId, contract.releaseId);
  assert.equal(observation.localManifestBinding.sha256, contract.manifestSha256);
  const mirrorPath = observation.resourceServerRelativePrefix.replace(/\/+$/, '');
  assert.ok(mirrorPath.endsWith(`/${contract.releaseId}`));
  const sitePath = mirrorPath.split('/').slice(0, 3).join('/');
  return {name: index === 0 ? 'Fristenrechner Test' : 'Entwicklungsumgebung',
    siteAbsoluteUrl: origin + sitePath, mirrorPath};
});
await writeJson(resolve(stage, 'qa-targets.private.json'), targets);
// Use the real normaliser and cache identity, not a second implementation.
await run('bind-recorded-targets', process.execPath, ['--import', 'tsx', '--input-type=module', '-e',
  "import fs from 'node:fs'; import {getProviderCacheIdentity} from './src/core/cacheIdentity.ts'; "
  + "const p='../qa-targets.private.json'; const targets=JSON.parse(fs.readFileSync(p,'utf8')); "
  + "for(const t of targets)t.cacheIdentity=getProviderCacheIdentity({kind:'sharepointMirror',cacheConfiguration:{kind:'sharepointMirror',...t}}); "
  + "fs.writeFileSync(p,JSON.stringify(targets,null,2)+'\\n');"]);
const boundTargets = await json(resolve(stage, 'qa-targets.private.json'));
const approvedManifest = await readFile(resolve(root, 'data/releases', contract.releaseId, 'manifest.json'));
assert.equal(sha(approvedManifest), contract.manifestSha256);
report.targetEvidence = {source: 'Local MVP-0.6 deployment observations of 2026-10-01, not a new live tenant check',
  names: boundTargets.map(item => item.name), livePreflightRequired: true,
  records: historicalRecords.map((name, i) => ({path: `.work/deployments/2026-10-01-eq-mvp06/${name}`,
    sha256: sha(observationBytes[i])})),
  privateTargetFile: relative(root, resolve(stage, 'qa-targets.private.json'))};

const solutionPath = resolve(target, 'config/package-solution.json');
const baselineSolution = await json(solutionPath);
const manifestPath = resolve(target, 'src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json');
const baselineManifest = await json(manifestPath);
await transform(solutionPath, text => {
  const config = JSON.parse(text), solution = config.solution;
  solution.name = contract.solutionName; solution.id = contract.solutionId;
  solution.version = contract.solutionVersion; solution.skipFeatureDeployment = false;
  solution.metadata.shortDescription = {default: 'AP21 E-Gerätetest. Nicht für operative Fristen.'};
  solution.metadata.longDescription = {default: 'Getrennter Gerätetest der Datumseingabe auf zwei fest gebundenen E-Sites mit freigegebenen MVP-0.6-Daten. Kein Kalenderexport.'};
  assert.equal(solution.features.length, 1);
  solution.features[0] = {title: contract.solutionName, description: 'Aktiviert ausschliesslich den getrennten AP21-Gerätetest.',
    id: contract.featureId, version: contract.solutionVersion};
  return JSON.stringify(config, null, 2) + '\n';
});
for (const name of ['package.json', 'package-lock.json']) await transform(resolve(target, name), text => {
  const pkg = JSON.parse(text); pkg.name = 'fristenrechner-ap21e-spfx'; pkg.version = contract.npmVersion;
  if (pkg.packages?.['']) {pkg.packages[''].name = pkg.name; pkg.packages[''].version = pkg.version;}
  return JSON.stringify(pkg, null, 2) + '\n';
});
await transform(manifestPath, text => {
  const manifest = JSON.parse(text); manifest.id = contract.componentId; manifest.alias = contract.alias;
  for (const entry of manifest.preconfiguredEntries) {
    entry.title = {default: 'AP21 · E-Gerätetest', 'fr-fr': 'AP21 · Test sur appareil E'};
    entry.description = {default: 'Nur synthetische Prüffälle. Keine operative Nutzung.', 'fr-fr': 'Cas de test synthétiques uniquement. Pas d’utilisation opérationnelle.'};
    entry.properties = {};
  }
  return JSON.stringify(manifest, null, 2) + '\n';
});
await transform(resolve(target, 'config/config.json'), text => {
  const config = JSON.parse(text);
  config.bundles = {[contract.bundleName]: config.bundles['fristenrechner-web-part']};
  config.localizedResources = {[contract.localizedResourceName]: config.localizedResources.FristenrechnerWebPartStrings};
  return JSON.stringify(config, null, 2) + '\n';
});
await transform(resolve(target, 'src/webparts/fristenrechner/loc/mystrings.d.ts'), text =>
  text.replaceAll('FristenrechnerWebPartStrings', contract.localizedResourceName));
for (const suffix of ['color', 'outline']) await rename(
  resolve(target, `teams/${baselineManifest.id}_${suffix}.png`),
  resolve(target, `teams/${contract.componentId}_${suffix}.png`));

for (const path of await filesIn(resolve(stage, 'src/ui'))) {
  if (!/\.(?:ts|tsx|css)$/.test(path)) continue;
  const content = await readFile(path, 'utf8');
  if (/\bfr-(?=[a-z])/.test(content)) await transform(path, text => text.replace(/\bfr-(?=[a-z])/g, contract.cssPrefix));
}
await transform(resolve(stage, 'src/ui/calendarMessages.ts'), text => text
  .replace(/referenceAll: '[^\n]*',/g, line => line.includes('AP22C3 :')
    ? "referenceAll: 'AP21 · Test sur appareil E. Cas synthétiques uniquement. Pas de contrôle opérationnel des délais ni d’export de calendrier.',"
    : "referenceAll: 'AP21 · E-Gerätetest. Nur synthetische Prüffälle. Keine operative Fristenkontrolle und kein Kalenderexport.',")
  .replace(/referenceAllIntro: '[^\n]*',/g, line => line.includes('Contrôle')
    ? "referenceAllIntro: 'Test de saisie des dates avec les données approuvées de MVP 0.6.',"
    : "referenceAllIntro: 'Gerätetest der Datumseingabe mit dem freigegebenen MVP-0.6-Datenstand.',"));
await run('sync-isolated-product', process.execPath, ['scripts/sync-product-source.mjs']);
await cp(resolve(templates, 'FristenrechnerEDeviceWebPart.ts'), resolve(target, 'src/webparts/fristenrechner/FristenrechnerWebPart.ts'));
await cp(resolve(templates, 'ap21ETestPolicy.ts'), resolve(target, 'src/core/ap21ETestPolicy.ts'));
await writeFile(resolve(target, 'src/core/ap21ETestConfig.ts'), '// Generated from the candidate contract and recorded E targets. No live tenant check.\n'
  + `export const E_TEST_CONFIG = ${JSON.stringify(contract, null, 2)};\n`
  + `export const E_TEST_TARGETS = ${JSON.stringify(boundTargets, null, 2)};\n`);
await transform(resolve(target, 'src/webparts/fristenrechner/components/Fristenrechner.tsx'), text => {
  text = once(text, "import { ReleaseService }", "import { assertETestRelease, createETestStorage } from '../../../core/ap21ETestPolicy';\nimport { ReleaseService }");
  text = once(text, '  private loadSequence = 0;', '  private loadSequence = 0;\n  private readonly eTestStorage = createETestStorage();');
  text = once(text, '          data={data}', '          data={data}\n          storage={this.eTestStorage}\n          referenceOnlyAllCalculations={true}\n          localReviewLabel="AP21 · E-Gerätetest / test sur appareil"');
  text = once(text, '    const runtime = createCalculatorRuntime(release);', '    assertETestRelease(release);\n    const runtime = createCalculatorRuntime(release);');
  return text.replace('STEIMER · MVP', 'AP21 · E-Gerätetest').replace('<h2>Fristenrechner Schweiz</h2>', '<h2>Fristenrechner · E-Gerätetest</h2>');
});
await transform(resolve(target, 'scripts/audit-product-css.mjs'), text => text
  .replaceAll('fristenrechner-web-part', contract.bundleName).replaceAll('fr-actions', `${contract.cssPrefix}actions`));
await transform(resolve(target, 'test-build/package-harness.cjs'), text => {
  text = text.replaceAll('fristenrechner-web-part', contract.bundleName)
    .replaceAll('FristenrechnerWebPartStrings', contract.localizedResourceName)
    .replaceAll(baselineManifest.id, contract.componentId)
    .replaceAll("'https://example.invalid/sites/test'", JSON.stringify(boundTargets[0].siteAbsoluteUrl))
    .replace("'/sites/test/Shared Documents/releases/test'", JSON.stringify(boundTargets[0].mirrorPath))
    .replace('`/sites/test/Shared Documents/releases/${dataPin}`', JSON.stringify(boundTargets[0].mirrorPath));
  return once(text, '    host, context, provenance: packaged.provenance,',
    '    host, context, webpart, renderWebPart() { webpart.render(); return rendered; }, provenance: packaged.provenance,');
});

await run('production-build', resolve(target, 'node_modules/.bin/heft'), ['test', '--clean', '--production']);
await run('namespaced-css-audit', process.execPath, ['scripts/audit-product-css.mjs']);
await run('package-solution', resolve(target, 'node_modules/.bin/heft'), ['package-solution', '--production']);
await run('packaged-ap21-and-isolation-tests', process.execPath, ['--test', '--test-concurrency=2', '--test-timeout=60000',
  'test-build/ap21.test.cjs', resolve(root, 'tests/ap21-e/candidate.test.cjs')]);

await checkPreviousProof();
for (const input of report.buildInputs) assert.equal(sha(await readFile(resolve(root, input.path))), input.sha256,
  `Builder or test changed during execution: ${input.path}`);
assert.equal(sha(await readFile(originalPackage)), originalHash, 'Original SPPKG changed');
assert.deepEqual(await json(resolve(root, 'spfx/config/package-solution.json')), baselineSolution);
assert.deepEqual(await json(resolve(root, 'spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json')), baselineManifest);
await mkdir(output, {recursive: true});
const packageBytes = await readFile(resolve(target, 'sharepoint/solution/fristenrechner-schweiz.sppkg'));
const packagePath = resolve(output, contract.packageFileName);
await writeFile(packagePath, packageBytes, {flag: 'wx'});
report.package = {path: relative(root, packagePath), sha256: sha(packageBytes), byteLength: packageBytes.length};
report.protectedBaseline = {artifactCount: previousProof.artifacts.length, byteIdentical: true,
  originalIgnoredPackageSha256: originalHash, sourceSolutionAndComponentUnchanged: true};
report.compiledSource = await Promise.all((await filesIn(resolve(target, 'src'))).map(async path =>
  ({path: relative(root, path), sha256: sha(await readFile(path))})));
await mkdir(resolve(output, 'build-inputs'), {recursive: true});
for (const input of report.buildInputs) {
  const destination = resolve(output, 'build-inputs', input.path);
  await mkdir(dirname(destination), {recursive: true});
  await cp(resolve(root, input.path), destination);
}
// Private, local snapshot of the exact transformed inputs. Contains the two
// recorded tenant locations, so it is not a publication artefact.
const sourceArchive = resolve(stage, 'source-snapshot.private.tar.gz');
await run('archive-stage-inputs', 'tar', ['-czf', sourceArchive, '-C', stage, 'src', 'spfx/src', 'spfx/config',
  'spfx/scripts', 'spfx/test-build', 'spfx/teams', 'spfx/package.json', 'spfx/package-lock.json',
  'spfx/tsconfig.json', 'spfx/eslint.config.js', 'qa-targets.private.json']);
report.privateSourceArchive = {path: relative(root, sourceArchive), sha256: sha(await readFile(sourceArchive)),
  publicationApproved: false};
report.passed = true;
report.readyForScopedInstallationApproval = true;
report.remainingGates = ['live-target-and-catalogue-preflight', 'explicit-package-installation-approval',
  'isolated-e-installation', 'real-ios-and-desktop-tests', 'ap21-human-acceptance'];
await writeJson(resolve(stage, 'verification.json'), report);
await writeJson(resolve(output, 'build-verification.json'), report);
await cp(resolve(templates, 'contract.json'), resolve(output, 'candidate-contract.json'));
for (const step of report.steps) await cp(resolve(root, step.log), resolve(output, step.label + '.log'));
console.log(JSON.stringify({stage, output, passed: true, ...report.package}));
