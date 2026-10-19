// SPDX-License-Identifier: AGPL-3.0-only
// Independent research oracle. No product imports and no runtime/release activation.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = 'tests/golden/candidates/ap23e1-administrative.json';
const hash = value => createHash('sha256').update(value).digest('hex');
const epochDay = value => Date.parse(`${value}T00:00:00Z`) / 86400000;
const iso = value => new Date(value * 86400000).toISOString().slice(0, 10);
const add = (value, n) => iso(epochDay(value) + n);
const weekday = value => new Date(`${value}T00:00:00Z`).getUTCDay();
const weekend = value => [0, 6].includes(weekday(value));
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(epochDay(value)) && iso(epochDay(value)) === value;
const blocked = reason => ({ outcome: 'blocked', reason, exportAllowed: false });

export function holidays(canton, year, suite) {
  const spec = suite.calendars[canton];
  assert.ok(spec && suite.easter[year], `No calendar reference ${canton}/${year}`);
  const result = new Set([...spec.fixed.map(md => `${year}-${md}`),
    ...spec.easterOffsets.map(n => add(suite.easter[year], n))]);
  if (canton === 'AR' && ![1, 5].includes(weekday(`${year}-12-25`))) result.add(`${year}-12-26`);
  return result;
}
function suspended(date, mode, suite) {
  if (mode === 'none') return false;
  assert.equal(mode, 'three');
  const md = date.slice(5), easter = suite.easter[Number(date.slice(0, 4))];
  assert.ok(easter);
  return md >= '12-18' || md <= '01-02' || (md >= '07-15' && md <= '08-15')
    || (date >= add(easter, -7) && date <= add(easter, 7));
}
export function evaluate(input, suite) {
  const path = suite.paths.find(p => p.id === input.path);
  if (!path) return blocked('unknownPath');
  if (!validDate(input.trigger)) return blocked('invalidDate');
  if (input.unit !== 'day') return blocked('unsupportedUnit');
  if (input.action !== path.action) return blocked('actionDoesNotMatchPath');
  if (path.action === 'ordinaryAppeal' && input.decisionKind !== 'finalDecision') return blocked('decisionOutsideScope');
  if (path.action === 'executionAppeal' && input.decisionKind !== 'qualifiedVRPGArt63Order') return blocked('executionOrderNotQualified');
  if (!path.stages.includes(input.stage)) return blocked('stageDoesNotMatchPath');
  if (input.authorityLevel !== 'cantonal') return blocked('authorityOutsideScope');
  if (input.holidayAnchor !== 'qualifiedTargetAuthority') return blocked('holidayAnchorNotQualified');
  if (input.opening !== 'qualifiedCompleteActualDelivery') return blocked('openingNotQualified');
  if (input.notice !== 'uncontested') return blocked('noticeNeedsIndividualReview');
  if (input.specialLaw !== 'excluded') return blocked('specialLawNotExcluded');
  if (input.urgency !== 'none') return blocked('shortenedOrSpecialPeriod');
  if (input.fixedEndDate !== false || input.deviatingStart !== false) return blocked('fixedDateOrDeviatingStart');
  if (input.termChange !== 'none') return blocked('termChangeNeedsIndividualReview');
  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 365) return blocked('invalidDays');
  if (path.days !== null && input.days !== path.days) return blocked('statutoryDurationMismatch');
  const within = date => date >= path.from && date <= suite.referenceRange.to;
  if (!within(input.trigger)) return blocked('outsideReferenceRange');
  let cursor = input.trigger, counted = 0, skippedDays = 0, firstCountedDay;
  while (counted < input.days) {
    cursor = add(cursor, 1);
    if (!within(cursor)) return blocked('outsideReferenceRange');
    if (suspended(cursor, path.suspension, suite)) { skippedDays++; continue; }
    firstCountedDay ??= cursor;
    counted++;
  }
  const nominalEnd = cursor;
  while (weekend(cursor) || holidays(path.canton, Number(cursor.slice(0, 4)), suite).has(cursor)) {
    cursor = add(cursor, 1);
    if (!within(cursor)) return blocked('outsideReferenceRange');
  }
  if (cursor !== nominalEnd && suspended(cursor, path.suspension, suite)) return blocked('AR-O1-endShiftIntoSuspension');
  return { outcome: 'reference', ordinaryStart: add(input.trigger, 1), firstCountedDay,
    nominalEnd, end: cursor, skippedDays, endShiftDays: epochDay(cursor) - epochDay(nominalEnd), exportAllowed: false };
}
async function treeDigest(directory) {
  async function walk(path) {
    const entries = await readdir(resolve(root, path), { withFileTypes: true });
    return (await Promise.all(entries.map(e => e.isDirectory() ? walk(`${path}/${e.name}`) : `${path}/${e.name}`))).flat();
  }
  const files = (await walk(directory)).sort();
  const lines = await Promise.all(files.map(async p => `${p}\0${hash(await readFile(resolve(root, p)))}\n`));
  return { files: files.length, sha256: hash(lines.join('')) };
}
function physicalDays(calendar, year, suite) {
  return new Set(calendar.rules.flatMap(rule => {
    const c = rule.calculation;
    let date;
    if (c.type === 'fixedMonthDay') date = `${year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
    else if (c.type === 'easterOffsetDays') date = add(suite.easter[year], c.offsetDays);
    else if (c.type === 'nthWeekdayOfMonth') {
      date = `${year}-${String(c.month).padStart(2, '0')}-01`;
      while ((weekday(date) || 7) !== c.isoWeekday) date = add(date, 1);
      date = add(date, 7 * (c.occurrence - 1));
    } else throw new Error(`Unreviewed physical rule ${c.type}`);
    assert.ok(['always', 'unlessTuesdayOrSaturday'].includes(rule.condition));
    if (rule.condition === 'unlessTuesdayOrSaturday' && [2, 6].includes(weekday(date))) return [];
    return [date];
  }));
}
export async function runReferences() {
  const bytes = await readFile(resolve(root, fixture)), suite = JSON.parse(bytes);
  assert.equal(suite.formatVersion, 'ap23e1-research-1');
  assert.equal(suite.status, 'draft');
  assert.equal(suite.runtimeActive, false);
  assert.equal(new Set(suite.paths.map(p => p.id)).size, suite.paths.length);
  assert.equal(new Set(suite.cases.map(c => c.id)).size, suite.cases.length);
  const sources = new Set(suite.sources.map(s => s.id));
  for (const path of suite.paths) {
    assert.ok(path.sourceRefs.length);
    path.sourceRefs.forEach(s => assert.ok(sources.has(s), s));
    assert.ok(['LU', 'ZG', 'AR'].includes(path.canton));
    assert.ok(suite.cases.some(c => c.input.path === path.id && c.expected.outcome === 'reference'), path.id);
  }
  const results = suite.cases.map(item => {
    const result = evaluate({ ...suite.sharedFacts, ...item.input }, suite);
    for (const [key, expected] of Object.entries(item.expected)) assert.deepEqual(result[key], expected, `${item.id}/${key}`);
    assert.equal(result.exportAllowed, false);
    if (result.outcome === 'blocked') assert.equal(Object.hasOwn(result, 'end'), false);
    return { id: item.id, ...result };
  });
  const base = { ...suite.sharedFacts, ...suite.cases[0].input };
  const mutations = [
    [{ path: 'unknown' }, 'unknownPath'], [{ trigger: '2027-02-30' }, 'invalidDate'],
    [{ unit: 'hour' }, 'unsupportedUnit'], [{ action: 'reasonRequest' }, 'actionDoesNotMatchPath'],
    [{ decisionKind: 'interimDecision' }, 'decisionOutsideScope'],
    [{ stage: 'court' }, 'stageDoesNotMatchPath'], [{ authorityLevel: 'municipal' }, 'authorityOutsideScope'],
    [{ holidayAnchor: 'party' }, 'holidayAnchorNotQualified'], [{ opening: 'fiction' }, 'openingNotQualified'],
    [{ notice: 'unknown' }, 'noticeNeedsIndividualReview'], [{ specialLaw: 'unknown' }, 'specialLawNotExcluded'],
    [{ urgency: 'shortened' }, 'shortenedOrSpecialPeriod'], [{ fixedEndDate: true }, 'fixedDateOrDeviatingStart'],
    [{ deviatingStart: true }, 'fixedDateOrDeviatingStart'], [{ termChange: 'extension' }, 'termChangeNeedsIndividualReview'],
    [{ days: 0 }, 'invalidDays'], [{ days: 366 }, 'invalidDays'], [{ days: 1.5 }, 'invalidDays'],
    [{ days: 29 }, 'statutoryDurationMismatch'], [{ trigger: '2026-09-26' }, 'outsideReferenceRange']
  ];
  for (const [delta, expected] of mutations) assert.deepEqual(evaluate({ ...base, ...delta }, suite), blocked(expected));
  let calendarDayComparisons = 0;
  const physicalCalendars = new Map();
  for (const [canton, spec] of Object.entries(suite.calendars)) {
    const physicalBytes = await readFile(resolve(root, spec.physical.path));
    assert.equal(hash(physicalBytes), spec.physical.sha256);
    physicalCalendars.set(canton, JSON.parse(physicalBytes));
    for (const year of [2026, 2027]) {
      const physical = physicalDays(JSON.parse(physicalBytes), year, suite), reference = holidays(canton, year, suite);
      for (let d = `${year}-01-01`; d <= `${year}-12-31`; d = add(d, 1)) {
        assert.equal(weekend(d) || physical.has(d), weekend(d) || reference.has(d), `${canton}/${d}`);
        calendarDayComparisons++;
      }
    }
  }
  for (const probe of suite.calendarProbes) {
    const year = Number(probe.date.slice(0, 4));
    assert.equal(holidays(probe.canton, year, suite).has(probe.date), probe.isHoliday, probe.date);
    assert.equal(physicalDays(physicalCalendars.get(probe.canton), year, suite).has(probe.date), probe.isHoliday, `physical/${probe.canton}/${probe.date}`);
  }
  for (const tree of suite.preservedTrees) assert.deepEqual(await treeDigest(tree.path), { files: tree.files, sha256: tree.sha256 }, tree.path);
  return { status: 'passed', runtimeActive: false, productIntegrationTest: false, fixtureSha256: hash(bytes),
    checkerSha256: hash(await readFile(fileURLToPath(import.meta.url))), nodeVersion: process.version,
    paths: suite.paths.length, referenceCases: results.length,
    datedCases: results.filter(r => r.outcome === 'reference').length,
    blockedCases: results.filter(r => r.outcome === 'blocked').length,
    negativeMutations: mutations.length, calendarDayComparisons, calendarProbes: suite.calendarProbes.length,
    physicalCalendarProbes: suite.calendarProbes.length,
    results, preservedTrees: suite.preservedTrees };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runReferences();
  if (process.argv.includes('--write')) {
    const output = resolve(root, 'outputs/ap23e1-2026-10-18');
    await mkdir(output, { recursive: true });
    await writeFile(resolve(output, 'QA-AP23E1.json'), JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify({ ...report, results: undefined, preservedTrees: undefined }, null, 2));
}
