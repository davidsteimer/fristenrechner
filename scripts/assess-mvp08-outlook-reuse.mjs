// SPDX-License-Identifier: AGPL-3.0-only
// Local source comparison and already-saved synthetic ICS inspection only.
// Does not import, create or remove an Outlook event, or grant reuse approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = 'outputs/release-mvp08-2026-10-15';
const baseline = 'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/build-evidence/inputs';
const hash = raw => createHash('sha256').update(raw).digest('hex');
async function binding(path) {
  const raw = await readFile(resolve(root, path));
  return { path, byteLength: raw.length, sha256: hash(raw) };
}
async function writeOnce(path, raw) {
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  try { await writeFile(resolve(root, path), raw, { flag: 'wx' }); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    assert.ok((await readFile(resolve(root, path))).equals(raw), `Refusing changed existing evidence: ${path}`);
  }
}
function extractTile(source) {
  const from = source.indexOf('function CalendarExportTile(');
  const to = source.indexOf('\nfunction ResultPanel(', from);
  assert.ok(from >= 0 && to > from);
  return source.slice(from, to).trimEnd();
}
function inspectIcs(raw, name) {
  const text = raw.toString('utf8');
  assert.ok(Buffer.from(text).equals(raw), 'Invalid UTF-8');
  assert.ok(text.endsWith('\r\n'));
  assert.doesNotMatch(text.replaceAll('\r\n', ''), /[\r\n]/);
  assert.ok(text.split('\r\n').every(line => Buffer.byteLength(line) <= 75), 'Invalid content-line folding');
  const lines = text.replace(/\r\n[ \t]/g, '').split('\r\n');
  const one = prefix => { const matching = lines.filter(line => line.startsWith(prefix)); assert.equal(matching.length, 1, prefix); return matching[0].slice(prefix.length); };
  for (const exact of ['BEGIN:VCALENDAR', 'END:VCALENDAR', 'BEGIN:VEVENT', 'END:VEVENT', 'BEGIN:VALARM', 'END:VALARM',
    'VERSION:2.0', 'METHOD:PUBLISH', 'CALSCALE:GREGORIAN', 'TRANSP:TRANSPARENT', 'X-MICROSOFT-CDO-BUSYSTATUS:FREE',
    'CATEGORIES:Fristablauf', 'TRIGGER:-PT112H', 'ACTION:DISPLAY']) assert.equal(lines.filter(line => line === exact).length, 1, exact);
  assert.equal(lines.filter(line => line.startsWith('DESCRIPTION:')).length, 2);
  assert.ok(!lines.some(line => /^(ATTENDEE|ORGANIZER|RRULE|RDATE|ATTACH|LOCATION)(?:;|:)/.test(line)));
  assert.match(one('UID:'), /@steimer\.ch$/);
  assert.match(one('DTSTAMP:'), /^\d{8}T\d{6}Z$/);
  const date = one('DTSTART;VALUE=DATE:');
  const end = one('DTEND;VALUE=DATE:');
  const iso = value => `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
  assert.equal(new Date(`${iso(end)}T00:00:00Z`).valueOf() - new Date(`${iso(date)}T00:00:00Z`).valueOf(), 86400000);
  const administrative = name.includes('-TI');
  if (administrative) {
    for (const marker of ['kind: cantonalAdministrative', 'lawId: lpamm-ti', 'pathId: ti-80-30',
      'releaseId: 2026-10-15-mvp-08-approved.1', 'authoritySeatCanton: TI']) assert.ok(text.replace(/\r\n[ \t]/g, '').includes(marker), marker);
  }
  return { filename: name, date: iso(date), exclusiveEndDate: iso(end), summary: one('SUMMARY:'),
    administrativeProvenance: administrative, category: 'Fristablauf', trigger: '-PT112H',
    transparent: true, allDay: true, utf8CrlfFoldingPassed: true, outlookImported: false };
}

export async function assessMvp08OutlookReuse({ write = false } = {}) {
  const oldSerializerPath = `${baseline}/src/ui/calendarExport.ts`;
  const newSerializerPath = 'src/ui/calendarExport.ts';
  const oldSerializer = (await readFile(resolve(root, oldSerializerPath))).toString();
  const currentSerializer = (await readFile(resolve(root, newSerializerPath))).toString();
  assert.equal(hash(Buffer.from(oldSerializer)), 'aaec9be40831ef89b194477c1295ecb1019f6eb06e255d030404872a2ba59984');
  const normalized = currentSerializer
    .replace('  /** Optional verified provenance supplied by a qualified calculation adapter. */\n  readonly descriptionAppendix?: string;\n', '')
    .replace("  const description = [translate(options.locale, 'calendar.description'), options.descriptionAppendix].filter(Boolean).join('\\n\\n');\n", '')
    .replace('`DESCRIPTION:${escapeText(description)}`', "`DESCRIPTION:${escapeText(translate(options.locale, 'calendar.description'))}`");
  assert.notEqual(currentSerializer, oldSerializer, 'Expected explicit non-byte-identical serializer delta');
  assert.equal(normalized, oldSerializer, 'Unexpected serializer change outside optional description appendix');
  const comparisons = [{ component: 'calendarExport.ts', old: await binding(oldSerializerPath), current: await binding(newSerializerPath),
    byteIdentical: false, change: 'Optional descriptionAppendix type member and escaped DESCRIPTION extension only',
    onlyDeclaredDeltaVerified: true }];
  for (const path of ['src/core/date.ts']) {
    const old = await binding(`${baseline}/${path}`), current = await binding(path);
    assert.equal(old.sha256, current.sha256);
    comparisons.push({ component: path, old, current, byteIdentical: true });
  }
  const blocks = [];
  for (const [component, path, extractor] of [
    ['CalendarExportTile', 'src/ui/FristenrechnerApp.tsx', extractTile],
    ['CalendarTextRowsDEFR', 'src/ui/i18n.ts', source => source.split('\n').filter(line => /^\s*'calendar\./.test(line)).join('\n')]
  ]) {
    const oldBlock = extractor((await readFile(resolve(root, `${baseline}/${path}`))).toString());
    const currentBlock = extractor((await readFile(resolve(root, path))).toString());
    assert.equal(oldBlock, currentBlock);
    blocks.push({ component, sourcePath: path, baselinePath: `${baseline}/${path}`, byteIdenticalBlock: true,
      blockSha256: hash(Buffer.from(currentBlock)), blockByteLength: Buffer.byteLength(currentBlock) });
  }
  const exports = [];
  for (const name of ['WEB-DE-STPO.ics', 'WEB-DE-TI.ics', 'WEB-FR-TI.ics']) {
    const sourcePath = `.work/mvp08-web-exports/${name}`;
    const raw = await readFile(resolve(root, sourcePath));
    const archivedAt = `${output}/outlook-evidence/local-web/${name}`;
    if (write) await writeOnce(archivedAt, raw);
    exports.push({ source: await binding(sourcePath), archivedAt, ...inspectIcs(raw, name),
      evidenceScope: 'actualMinifiedCodeExecutedInJsdomWithSimulatedDownloadBoundary',
      browserDownloadPerformed: false, finalArtifactBound: false, m365HostExport: false });
  }
  const args = ['--import', 'tsx', '--test', 'tests/ui/calendar-export.test.ts', 'tests/ui/ap23d2-administrative.test.tsx'];
  const log = execFileSync(process.execPath, args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  const counts = Object.fromEntries(['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'].map(key => {
    const matches = [...log.toString().matchAll(new RegExp(`^# ${key} (\\d+)$`, 'gm'))];
    assert.equal(matches.length, 1); return [key, Number(matches[0][1])];
  }));
  assert.equal(counts.tests, 21); assert.equal(counts.pass, 21);
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0);
  const logPath = `${output}/outlook-evidence/current-export-tests-v2.txt`;
  if (write) await writeOnce(logPath, log);
  const report = { dataKind: 'mvp08OutlookReuseProposal', status: 'draft-awaiting-definitive-artifact-bindings-and-human-decision',
    evaluatedOn: '2026-10-15',
    correctsEvidenceAttributionOf: {
      path: `${output}/outlook-reuse-assessment.json`,
      sha256: '715ab681ada512d616f64a1216a1b399b4444fbf33e3a9afb00e92c5fdb4998c',
      explanation: 'The earlier localWebDownload label overstated the host boundary. The same ICS bytes were generated from actual minified code in JSDOM and locally saved across a simulated download boundary, not downloaded by a browser.'
    },
    sourceComparisons: comparisons, unchangedSourceBlocks: blocks,
    newAdministrativeAdapter: { ...await binding('src/ui/administrativeExport.ts'), existedInMvp07: false,
      responsibilities: ['exact input/context/result binding', 'fresh recomputation before export', 'law/data provenance appendix'],
      notCoveredByHistoricalOutlookImports: true },
    tests: { command: ['node', ...args], counts, log: { path: logPath, byteLength: log.length, sha256: hash(log) },
      sourceInputs: await Promise.all(args.slice(3).map(binding)), scope: '8 serializer/download tests and 13 administrative UI and export-gate tests, including approved-shaped fixtures' },
    exports, priorReports: await Promise.all(['docs/betrieb/outlook-pruefung-mvp05.md', 'docs/betrieb/outlook-wiederverwendung-mvp07.md'].map(binding)),
    unchangedAppointmentContract: { allDay: true, exclusiveFollowingEndDate: true, freeAvailability: true,
      category: 'Fristablauf', reminder: '-PT112H', noAttendees: true, localIcsDownload: true },
    proposedReuseScope: 'Historical Outlook import interpretation of unchanged appointment properties only, not new calculation, provenance, host or download behaviour',
    definitiveArtifactBindings: null, definitiveArtifactExportsVerified: false, realBrowserDownloadPerformed: false,
    outlookImportPerformed: false, mailboxOrCalendarChanged: false, humanReuseAccepted: false,
    m365HostExportsVerified: false, newDeviceOrGuestProof: false,
    retainedLimits: ['No new reminder delivery or daylight-saving-time observation', 'Category name does not enforce account-specific colour',
      'Historical Desktop confirmation keeps its original detail level', 'Description/provenance may render differently and is not covered by old import proof'],
    installationAuthorized: false, publicationAuthorized: false, operatingApproval: false };
  if (write) await writeOnce(`${output}/outlook-reuse-assessment-v2.json`, Buffer.from(JSON.stringify(report, null, 2) + '\n'));
  return report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  const report = await assessMvp08OutlookReuse({ write: process.argv[2] === '--write' });
  console.log(JSON.stringify({ status: report.status, sourceComparisons: report.sourceComparisons,
    unchangedSourceBlocks: report.unchangedSourceBlocks, tests: report.tests.counts,
    exports: report.exports.map(({ source, ...entry }) => ({ ...entry, sha256: source.sha256, byteLength: source.byteLength })),
    humanReuseAccepted: false }));
}
