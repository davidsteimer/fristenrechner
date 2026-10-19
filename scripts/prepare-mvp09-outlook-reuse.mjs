// SPDX-License-Identifier: AGPL-3.0-only
// Inspect existing immutable local evidence only. No network, browser, test run,
// Outlook import, M365 access, product change or human approval is performed.
import assert from 'node:assert/strict';
import { readFile, lstat, realpath, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve, relative, dirname, basename, isAbsolute, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp09-2026-10-18';
const baseline = 'outputs/release-mvp08-2026-10-15';
const releaseId = '2026-10-18-mvp-09-approved.1';
const require = createRequire(resolve(root, 'spfx/package.json'));
const ts = require('typescript');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const checks = new Map();
const plannedCopies = [];
const fixedProofs = [
  [`${baseline}/product-build.json`, '1638becba091b1fccc3924ad477476d6bfb8fb0fd5245d115923c6e4ebe98bd6'],
  [`${baseline}/artifact-verification.json`, '5307901a72a32537ffc8f05cefa250341c42a5d21fc387a64df04ea2c1e369c2'],
  [`${baseline}/outlook-reuse-assessment-v2.json`, 'd0f358fc0095b51f59e2f2aa77fa5598ede4593de15c9b1d70f1a9b4f0ae5e0c'],
  [`${baseline}/outlook-final-artifact-supplement.json`, '91c281872265198d322e84b57d3fc8efa22b6c42d0e46edacdf670b102d327bc'],
  ['docs/betrieb/outlook-pruefung-mvp05.md', '45208e2672e19a272cef28231c6cae7ab89639fe5926becc07a901250695144a']
];
const scenarios = {
  'ti-80-30': {lawId: 'lpamm-ti', canton: 'TI', stage: 'administrativeAppeal', date: '2026-11-02'},
  'gr-52-30': {lawId: 'vrg-gr', canton: 'GR', stage: 'court', date: '2026-11-02'},
  'lu-admin-30': {lawId: 'vrg-lu', canton: 'LU', stage: 'administrativeAppeal', date: '2026-11-02'},
  'zg-admin-20': {lawId: 'vrg-zg', canton: 'ZG', stage: 'administrativeAppeal', date: '2026-10-22'},
  'ar-execution-5': {lawId: 'vrpg-ar', canton: 'AR', stage: 'administrativeAppeal', date: '2026-10-07'}
};
function local(path) {
  assert.equal(typeof path, 'string');
  assert.ok(!isAbsolute(path) && !path.includes('\\') && path.split('/').every(part => part && part !== '.' && part !== '..'), path);
  const absolute = resolve(root, path);
  assert.ok(absolute.startsWith(resolve(root) + sep), path);
  return absolute;
}
async function regular(absolute) {
  const stat = await lstat(absolute);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), absolute);
  return readFile(absolute);
}
async function binding(path) {
  const bytes = await regular(local(path));
  const entry = {path, byteLength: bytes.length, sha256: hash(bytes)};
  if (checks.has(path)) assert.deepEqual(checks.get(path), entry, `Changed input: ${path}`);
  checks.set(path, entry);
  return entry;
}
async function checked(item, archivedAt) {
  const path = archivedAt ?? item.path;
  const entry = await binding(path);
  assert.equal(entry.byteLength, item.byteLength, path);
  assert.equal(entry.sha256, item.sha256, path);
  return regular(local(path));
}
async function json(path) {await binding(path); return JSON.parse(await regular(local(path)));}
function unique(rows, predicate, label) {
  const found = rows.filter(predicate);
  assert.equal(found.length, 1, label);
  return found[0];
}
async function archived(build, path) {
  const item = unique(build.archivedInputs, entry => entry.path === path, `Archived input ${path}`);
  const declared = unique(build.inputs, entry => entry.path === path, `Build input ${path}`);
  assert.deepEqual({path: item.path, byteLength: item.byteLength, sha256: item.sha256}, declared);
  return {item, bytes: await checked(item, item.archivedAt)};
}
function functionBlock(bytes, name) {
  const source = ts.createSourceFile('FristenrechnerApp.tsx', bytes.toString('utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = source.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.equal(found.length, 1, name);
  return Buffer.from(found[0].getText(source));
}
function replaceOne(text, from, to) {
  assert.equal(text.split(from).length - 1, 1, `Exactly one declared adapter delta: ${from}`);
  return text.replace(from, to);
}
function decodeText(text) {
  assert.doesNotMatch(text, /\\(?![nN,;\\])/);
  return text.replace(/\\([nN,;\\])/g, (_, value) => /[nN]/.test(value) ? '\n' : value);
}
function encodeText(text) {return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');}
function oneLine(lines, prefix) {
  const row = unique(lines, item => item.startsWith(prefix), prefix);
  return row.slice(prefix.length);
}
function inspectIcs(raw, locale, expectedSummary, catalog, expectedPath) {
  assert.ok(['de', 'fr'].includes(locale));
  const text = raw.toString('utf8');
  assert.ok(Buffer.from(text).equals(raw), 'Valid UTF-8');
  assert.ok(text.endsWith('\r\n'), 'Final CRLF');
  assert.doesNotMatch(text.replaceAll('\r\n', ''), /[\r\n]/, 'Only CRLF newlines');
  assert.ok(text.split('\r\n').every(line => Buffer.byteLength(line) <= 75), '75 UTF-8 octet content-line folding');
  const lines = text.replace(/\r\n[ \t]/g, '').split('\r\n');
  assert.equal(lines.pop(), '');
  assert.equal(lines.length, 22, 'Exactly the established properties, no additions');
  const fixed = {0: 'BEGIN:VCALENDAR', 1: 'VERSION:2.0', 2: 'PRODID:-//STEIMER//Fristenrechner Schweiz//DE-FR',
    3: 'CALSCALE:GREGORIAN', 4: 'METHOD:PUBLISH', 5: 'BEGIN:VEVENT', 12: 'TRANSP:TRANSPARENT',
    13: 'X-MICROSOFT-CDO-BUSYSTATUS:FREE', 14: 'CATEGORIES:Fristablauf', 15: 'BEGIN:VALARM',
    16: 'TRIGGER:-PT112H', 17: 'ACTION:DISPLAY', 19: 'END:VALARM', 20: 'END:VEVENT', 21: 'END:VCALENDAR'};
  for (const [index, value] of Object.entries(fixed)) assert.equal(lines[Number(index)], value);
  assert.match(lines[6], /^UID:fristenrechner-\d{8}-[^\s\\]+@steimer\.ch$/);
  assert.match(lines[7], /^DTSTAMP:\d{8}T\d{6}Z$/);
  assert.equal(lines[10], `SUMMARY:${encodeText(expectedSummary)}`);
  assert.equal(lines[18], `DESCRIPTION:${encodeText(expectedSummary)}`);
  assert.ok(lines[11].startsWith('DESCRIPTION:'));
  const description = decodeText(lines[11].slice('DESCRIPTION:'.length));
  const descriptionLines = description.split('\n');
  const pathId = oneLine(descriptionLines, 'pathId: ');
  if (expectedPath) assert.equal(pathId, expectedPath);
  const scenario = scenarios[pathId]; assert.ok(scenario, `Known tested path: ${pathId}`);
  const expectedEnd = new Date(scenario.date + 'T00:00:00Z'); expectedEnd.setUTCDate(expectedEnd.getUTCDate() + 1);
  const exclusiveEnd = expectedEnd.toISOString().slice(0, 10);
  assert.equal(lines[8], `DTSTART;VALUE=DATE:${scenario.date.replaceAll('-', '')}`);
  assert.equal(lines[9], `DTEND;VALUE=DATE:${exclusiveEnd.replaceAll('-', '')}`);
  const path = unique(catalog.paths, item => item.pathId === pathId, 'Catalog path');
  const law = unique(catalog.laws, item => item.lawId === path.lawId, 'Catalog law');
  const holiday = unique(catalog.holidayBindings, item => item.holidayBindingId === path.holidayBindingId, 'Catalog holiday binding');
  const suspension = unique(catalog.suspensionProfiles, item => item.suspensionProfileId === path.suspensionProfileId, 'Catalog suspension');
  const eligible = unique(catalog.releaseBinding.pathEligibility, item => item.pathId === pathId, 'Approved eligibility');
  assert.equal(eligible.status, 'approved'); assert.match(eligible.qualificationPolicySha256, /^[a-f0-9]{64}$/);
  assert.equal(path.lawId, scenario.lawId); assert.equal(law.canton, scenario.canton); assert.ok(path.stages.includes(scenario.stage));
  const fields = {kind: 'cantonalAdministrative', lawId: scenario.lawId, pathId, revision: String(path.revision),
    releaseId, catalogId: catalog.catalogId, holidayBindingId: holiday.holidayBindingId,
    calendarId: holiday.physicalBaseline.calendarId, projectionId: holiday.physicalBaseline.projectionId,
    holidayRole: 'authoritySeat', authoritySeatCanton: law.canton, suspensionProfileId: suspension.suspensionProfileId,
    urgencyApplied: 'false', qualificationPolicySha256: eligible.qualificationPolicySha256};
  for (const [key, value] of Object.entries(fields)) assert.equal(oneLine(descriptionLines, key + ': '), value, key);
  const stage = oneLine(descriptionLines, 'stage: ');
  assert.ok(stage.startsWith(scenario.stage + ' (') && stage.endsWith(')'), 'Stage and translated label');
  const disclaimer = locale === 'de'
    ? 'Mit Fristenrechner Schweiz erzeugt. Hilfsmittel ohne Gewähr. Prüfen Sie den Fristablauf vor fristgebundenen Handlungen.'
    : 'Créé avec le Calculateur de délais suisse. Outil fourni sans garantie. Vérifiez l’échéance avant tout acte soumis à un délai.';
  assert.equal(descriptionLines[0], disclaimer); assert.equal(descriptionLines[1], '');
  assert.equal(descriptionLines[2], locale === 'de' ? 'Rechts- und Datenherkunft' : 'Origine juridique et données');
  const refs = [...new Map([...law.sourceRefs, ...path.sourceRefs, ...holiday.legalBinding.sourceRefs, ...suspension.sourceRefs]
    .map(ref => [ref.sourceId + '\u0000' + ref.locator, ref])).values()];
  const expectedSourceLines = refs.map(ref => {
    const source = unique(catalog.sources, item => item.sourceId === ref.sourceId, ref.sourceId);
    return `${ref.sourceId} — ${ref.locator} — ${source.url}`;
  });
  const sourceStart = descriptionLines.findIndex(line => line.startsWith('qualificationPolicySha256: ')) + 1;
  assert.deepEqual(descriptionLines.slice(sourceStart), expectedSourceLines, 'Exact legal source appendix from bound catalog');
  return {locale, pathId, summary: expectedSummary, start: scenario.date, exclusiveEnd,
    allDay: true, freeAvailability: true, category: 'Fristablauf', trigger: '-PT112H',
    utf8Crlf75OctetFoldingVerified: true, unexpectedProperties: [],
    description: {sha256: hash(Buffer.from(description)), legalFields: fields, sourceRefs: refs,
      currentReleaseProvenanceVerified: true, coveredByHistoricalOutlookImport: false}, outlookImported: false};
}
function plannedCopy(path, bytes) {
  assert.ok(path.startsWith(prefix + '/outlook-evidence/'));
  assert.ok(!plannedCopies.some(item => item.path === path), path);
  plannedCopies.push({path, bytes});
  return {path, byteLength: bytes.length, sha256: hash(bytes)};
}
async function absent(path) {
  await assert.rejects(lstat(local(path)), {code: 'ENOENT'}, `Refuse to overwrite evidence ${path}`);
}

export async function prepare(browserPath) {
  assert.equal(process.version, 'v22.23.2');
  assert.ok(typeof browserPath === 'string' && browserPath.startsWith(prefix + '/browser-') && /\/verification-[0-9]+\.json$/.test(browserPath), 'Explicit browser report path required');
  const reportPath = prefix + '/outlook-reuse-assessment.json'; await absent(reportPath);
  for (const [path, expected] of fixedProofs) assert.equal((await binding(path)).sha256, expected, path);
  const oldBuild = await json(fixedProofs[0][0]); assert.equal(oldBuild.status, 'passed');
  const buildPath = prefix + '/product-build.json', sealingPath = prefix + '/artifact-verification.json';
  const build = await json(buildPath), sealed = await json(sealingPath);
  assert.equal(build.status, 'passed'); assert.equal(build.releaseId, releaseId);
  assert.equal(build.applicationVersion, '0.9.0'); assert.equal(build.packageVersion, '0.9.0.0');
  assert.equal(sealed.status, 'passed'); assert.equal(sealed.kind, 'mvp09-local-artifact-sealing');
  assert.equal(sealed.releaseId, releaseId); assert.equal(sealed.packageVersion, '0.9.0.0');
  assert.deepEqual(sealed.buildProof, await binding(buildPath));
  const packageBinding = unique(sealed.artifacts, item => item.path === prefix + '/fristenrechner-schweiz-0.9.0.0.sppkg', 'Normal package only');
  assert.deepEqual(packageBinding, build.package); await checked(packageBinding);
  const sourceComparisons = [];
  for (const path of ['src/ui/calendarExport.ts', 'src/core/date.ts', 'src/ui/i18n.ts']) {
    const old = await archived(oldBuild, path), current = await archived(build, path);
    assert.ok(old.bytes.equals(current.bytes), `Unchanged import contract ${path}`);
    sourceComparisons.push({path, old: old.item, current: current.item, byteIdentical: true});
  }
  const oldApp = await archived(oldBuild, 'src/ui/FristenrechnerApp.tsx');
  const newApp = await archived(build, 'src/ui/FristenrechnerApp.tsx');
  const unchangedSourceBlocks = ['CalendarExportTile', 'ResultPanel', 'SpecialResultPanel'].map(name => {
    const old = functionBlock(oldApp.bytes, name), current = functionBlock(newApp.bytes, name);
    assert.ok(old.equals(current), name);
    return {name, byteLength: current.length, sha256: hash(current), byteIdentical: true,
      oldSource: oldApp.item, currentSource: newApp.item};
  });
  const oldAdapter = await archived(oldBuild, 'src/ui/administrativeExport.ts');
  const newAdapter = await archived(build, 'src/ui/administrativeExport.ts');
  let normalized = replaceOne(newAdapter.bytes.toString('utf8'),
    "import { getVerifiedAdministrativeContext } from '../core/administrativeContext';",
    "import { getVerifiedAdministrativeData } from '../core/releaseFormat8';");
  normalized = replaceOne(normalized, 'const verified = getVerifiedAdministrativeContext(context);', 'const verified = getVerifiedAdministrativeData(context);');
  normalized = replaceOne(normalized,
    '    ...(provenance.qualificationPolicySha256 ? [`qualificationPolicySha256: ${provenance.qualificationPolicySha256}`] : []),\n', '');
  assert.ok(Buffer.from(normalized).equals(oldAdapter.bytes), 'Only the three declared adapter deltas');
  const harnessInputs = [];
  for (const path of ['spfx/test-build/package-harness.cjs', 'spfx/test-build/mvp09-harness.cjs']) {
    const captured = await archived(build, path); harnessInputs.push(captured.item);
    if (path.endsWith('/package-harness.cjs')) await checked(captured.item);
  }
  // This reads the archive only, never executes its AMD module.
  const {readPackage} = require(resolve(root, 'spfx/test-build/package-harness.cjs'));
  const packaged = readPackage(local(packageBinding.path));
  assert.equal(packaged.provenance.packageSha256, packageBinding.sha256);
  assert.equal(packaged.bundlePath, sealed.packageAudit.bundlePath);
  assert.equal(packaged.provenance.bundleSha256, sealed.packageAudit.bundleSha256);
  const manifest = JSON.parse(await checked(build.manifest));
  assert.equal(manifest.releaseId, releaseId); assert.equal(manifest.formatVersion, '9.0.0');
  assert.equal(build.manifest.sha256, sealed.manifestSha256);
  const catalogDescriptor = unique(manifest.artifacts, item => item.role === 'administrativeProcedureCatalog', 'Administrative catalog');
  const catalogBinding = {...catalogDescriptor, path: `data/releases/${releaseId}/${catalogDescriptor.path}`};
  const catalog = JSON.parse(await checked(catalogBinding));
  assert.equal(catalog.formatVersion, '2.0.0'); assert.equal(catalog.releaseBinding.releaseId, releaseId);
  const browser = await json(browserPath);
  assert.equal(browser.kind, 'mvp09-actual-static-browser'); assert.equal(browser.status, 'passed');
  assert.deepEqual(browser.webFiles, build.webFiles);
  assert.deepEqual(browser.externalRequests, []); assert.deepEqual(browser.pageErrors, []);
  for (const flag of ['actualM365Testing', 'actualDeviceTesting', 'outlookImports']) assert.equal(browser[flag], false);
  for (const file of build.webFiles) {
    await checked(file);
    const name = file.path.split('/web-build/'); assert.equal(name.length, 2);
    const sealedFile = unique(sealed.webFiles, entry => entry.path === name[1], name[1]);
    assert.equal(sealedFile.sha256, file.sha256); assert.equal(sealedFile.byteLength, file.byteLength);
  }
  const webPackage = unique(sealed.artifacts, item => item.path === prefix + '/fristenrechner-mvp09-steimer-web.zip', 'Web package');
  await checked(webPackage);
  const localeChecks = browser.checks.filter(row => ['de', 'fr'].includes(row.locale));
  assert.equal(localeChecks.length, 2); assert.deepEqual(localeChecks.map(row => row.locale).sort(), ['de', 'fr']);
  for (const row of localeChecks) {
    assert.equal(row.download, true); assert.equal(row.staleExportRemoved, true); assert.equal(row.tiO2Blocked, true);
    assert.equal(row.overflow, false); assert.equal(row.result, '2026-11-02');
  }
  assert.equal(browser.exports.length, 2);
  const browserExports = [];
  for (const locale of ['de', 'fr']) {
    const item = unique(browser.exports, entry => basename(entry.path) === `${locale}-ti.ics`, `${locale} browser ICS`);
    assert.equal(dirname(item.path), dirname(browserPath));
    const raw = await checked(item), title = locale === 'de' ? 'Fristablauf' : 'Échéance du délai';
    const inspected = inspectIcs(raw, locale, `${title} (QA-MVP09-BROWSER-${locale.toUpperCase()}-TI)`, catalog, 'ti-80-30');
    browserExports.push({...plannedCopy(`${prefix}/outlook-evidence/browser/${locale}-ti.ics`, raw), original: item,
      ...inspected, evidenceScope: 'actualHeadlessLocalBrowserDownload', realBrowserDownload: true,
      simulatedDownloadBoundary: false, m365HostExport: false, publicProductionHostExport: false});
  }
  const builtTests = unique(build.steps, step => step.id === 'built-tests', 'Built tests');
  assert.equal(builtTests.exitCode, 0); assert.equal(builtTests.signal, null);
  const log = (await checked(builtTests.log)).toString('utf8');
  const records = [], otherSavedCalendars = [];
  for (const line of log.split('\n')) {
    if (!line.startsWith('# {')) continue;
    const entry = JSON.parse(line.slice(2));
    if (!entry.savedCalendar) continue;
    const parent = basename(dirname(entry.savedCalendar));
    if (/^fristenrechner-mvp09-amd-(de|fr)-[A-Za-z0-9]+$/.test(parent)) records.push(entry);
    else otherSavedCalendars.push({locale: entry.locale, temporaryDirectoryName: parent, excludedFromMvp09Evidence: true});
  }
  assert.equal(records.length, 10, 'Exactly five MVP09 paths in DE and FR, never older AMD records');
  const amdExports = [], seen = new Set();
  const realTemporaryRoot = await realpath(tmpdir());
  for (const row of records) {
    assert.ok(['de', 'fr'].includes(row.locale)); assert.equal(row.browserDownloadOrOutlookProof, false);
    assert.ok(isAbsolute(row.savedCalendar));
    assert.equal(await realpath(dirname(dirname(row.savedCalendar))), realTemporaryRoot, 'Only this run temporary export folders');
    assert.ok(basename(dirname(row.savedCalendar)).startsWith(`fristenrechner-mvp09-amd-${row.locale}-`));
    assert.equal(row.package.packageSha256, packageBinding.sha256);
    assert.equal(row.package.bundlePath, packaged.bundlePath);
    assert.equal(row.package.bundleSha256, packaged.provenance.bundleSha256);
    assert.equal(row.package.packagePath, resolve(root, build.stage, 'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg'));
    const raw = await regular(row.savedCalendar); assert.equal(hash(raw), row.sha256);
    const inspected = inspectIcs(raw, row.locale, row.locale === 'de' ? 'Fristablauf' : 'Échéance du délai', catalog);
    assert.equal(basename(row.savedCalendar), `fristablauf-${inspected.start}.ics`);
    const key = `${row.locale}-${inspected.pathId}`; assert.ok(!seen.has(key), key); seen.add(key);
    amdExports.push({...plannedCopy(`${prefix}/outlook-evidence/packaged-amd/${key}.ics`, raw), ...inspected,
      sourceDiagnostic: {locale: row.locale, savedCalendar: row.savedCalendar, sha256: row.sha256,
        package: row.package, diagnosticLog: builtTests.log},
      evidenceScope: 'actualPackagedAmdWithSimulatedDomAndDownloadBoundary', realBrowserDownload: false,
      simulatedDownloadBoundary: true, m365HostExport: false, publicProductionHostExport: false});
  }
  assert.deepEqual([...seen].sort(), Object.keys(scenarios).flatMap(id => [`de-${id}`, `fr-${id}`]).sort());
  const report = {
    kind: 'mvp09-outlook-reuse-proposal', status: 'local-evidence-passed-human-reuse-decision-open',
    proposalOnly: true, releaseId, manifestSha256: build.manifest.sha256, applicationVersion: '0.9.0', packageVersion: '0.9.0.0',
    buildProof: await binding(buildPath), artifactVerification: await binding(sealingPath),
    definitiveArtifacts: [packageBinding, webPackage], actualPackageProvenance: packaged.provenance,
    historicalEvidenceUnchanged: await Promise.all(fixedProofs.map(([path]) => binding(path))),
    sourceComparisons, unchangedSourceBlocks,
    administrativeAdapter: {old: oldAdapter.item, current: newAdapter.item, byteIdentical: false,
      onlyDeclaredDeltaVerified: true, changes: ['Verified Format-8/9 context accessor import', 'Matching verified context accessor call',
        'Optional qualificationPolicySha256 line within escaped event DESCRIPTION'],
      unchangedGuards: ['Exact actual input/context/result binding', 'Fresh calculation before export', 'Recomputed result equality'],
      newProvenanceNotCoveredByOldImport: true},
    browserProof: await binding(browserPath), browserVersion: browser.browser,
    browserExports, packagedAmdExports: amdExports, packagedHarnessInputs: harnessInputs,
    excludedOlderSavedCalendarDiagnostics: otherSavedCalendars,
    actualBrowserDownloads: 2, simulatedPackagedDownloads: 10,
    unchangedAppointmentContract: {allDay: true, exclusiveFollowingEndDate: true, freeAvailability: true,
      category: 'Fristablauf', reminder: '-PT112H', crlfUtf8Maximum75Octets: true,
      exactlyOneEventAndDisplayAlarm: true, localIcsDownload: true, noAdditionalProperties: true,
      noAttendees: true, noOrganizer: true, noRecurrence: true, noAttachment: true},
    proposedReuseScope: 'Only historical Outlook interpretation of the unchanged appointment fields. New legal provenance, qualification, calculation and host behavior require their separately scoped evidence.',
    newProvenanceNotCoveredByOldImport: true, humanReuseAccepted: false,
    noOutlookImport: true, noM365: true, outlookImportsPerformed: false, mailboxOrCalendarChanged: false,
    newBrowserSessionPerformedByThisScript: false, newTestsPerformedByThisScript: false,
    publicProductionHostTestsPerformed: false, actualDeviceTestsPerformed: false,
    installationAuthorized: false, publicationAuthorized: false, operatingApproval: false,
    retainedLimits: ['No new Outlook version or reminder delivery observation', 'No new daylight-saving-time observation',
      'Category name does not enforce account-specific colour', 'Historical Desktop confirmation retains its original detail level',
      'Extended legal DESCRIPTION rendering is not covered by historical import evidence'],
    parser: {typescriptVersion: ts.version}, script: await binding('scripts/prepare-mvp09-outlook-reuse.mjs')
  };
  // Validate all inputs and destinations before the first local evidence write.
  const protectedInputs = [...checks.values()];
  for (const item of protectedInputs) await checked(item);
  report.inputs = protectedInputs;
  for (const item of plannedCopies) await absent(item.path);
  for (const item of plannedCopies) {
    await mkdir(dirname(local(item.path)), {recursive: true});
    await writeFile(local(item.path), item.bytes, {flag: 'wx'});
    assert.ok((await regular(local(item.path))).equals(item.bytes));
  }
  for (const item of protectedInputs) await checked(item);
  await writeFile(local(reportPath), encode(report), {flag: 'wx'});
  console.log(JSON.stringify({status: report.status, report: await binding(reportPath), humanReuseAccepted: false,
    actualBrowserDownloads: 2, simulatedPackagedDownloads: 10}));
  return report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 3, 'Usage: node scripts/prepare-mvp09-outlook-reuse.mjs <explicit-passed-browser-report.json>');
  await prepare(process.argv[2]);
}
