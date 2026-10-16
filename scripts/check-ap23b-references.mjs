// SPDX-License-Identifier: AGPL-3.0-only
// Independent AP23B research oracle. Never imported by the product or a release builder.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixturePath = 'tests/golden/candidates/ap23b-administrative.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const dayMs = 86_400_000;
const iso = number => new Date(number * dayMs).toISOString().slice(0, 10);
function day(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const result = Date.parse(`${value}T00:00:00Z`) / dayMs;
  return Number.isInteger(result) && iso(result) === value ? result : null;
}
const add = (value, n) => iso(day(value) + n);
const weekend = value => [0, 6].includes(new Date(day(value) * dayMs).getUTCDay());
const blocked = reason => ({ outcome: 'blocked', reason, exportAllowed: false });

function calendar(canton, year, suite) {
  const specification = suite.calendars[canton];
  assert.ok(specification && suite.easter[year], `No reference calendar for ${canton}/${year}`);
  return new Set([
    ...specification.fixed.map(value => `${year}-${value}`),
    ...specification.easterOffsets.map(offset => add(suite.easter[year], offset))
  ]);
}
function suspended(value, mode, suite) {
  if (mode === 'none') return false;
  const year = Number(value.slice(0, 4));
  const monthDay = value.slice(5);
  if (monthDay >= '12-18' || monthDay <= '01-02') return true;
  if (mode === 'winter') return false;
  assert.equal(mode, 'three');
  if (monthDay >= '07-15' && monthDay <= '08-15') return true;
  return value >= add(suite.easter[year], -7) && value <= add(suite.easter[year], 7);
}

export function evaluate(input, suite) {
  const path = suite.paths.find(value => value.id === input.path);
  if (!path) return blocked('unknownPath');
  const trigger = day(input.trigger);
  if (trigger === null) return blocked('invalidDate');
  if (input.unit !== 'day') return blocked('unsupportedUnit');
  if (input.opening !== 'qualifiedDirectDelivery') return blocked('openingNotQualified');
  if (input.specialLaw !== 'excluded') return blocked('specialLawNotExcluded');
  if (input.authorityLevel !== 'cantonal') return blocked('authorityOutsideScope');
  if (!path.stages.includes(input.stage)) return blocked('stageDoesNotMatchPath');
  if (input.calendarQualification !== path.calendarQualification) return blocked('calendarNotQualified');
  if (!['none', 'urgentOrder'].includes(input.urgency)) return blocked('urgencyNotQualified');
  if (input.urgency === 'urgentOrder' && path.canton !== 'GR') return blocked('unsupportedUrgency');
  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 365) return blocked('invalidDays');
  if (path.days !== null && path.days !== input.days) return blocked('statutoryDurationMismatch');
  if (input.evidenceAdvance === true) return blocked('evidenceAdvanceOutsideScope');
  if (input.trigger < suite.referenceRange.from || input.trigger > suite.referenceRange.to) return blocked('outsideReferenceRange');
  const mode = path.canton === 'GR' && input.stage === 'court' && input.urgency === 'urgentOrder' ? 'none' : path.suspension;
  let cursor = trigger;
  let counted = 0;
  let skipped = 0;
  let firstCountedDay;
  while (counted < input.days) {
    cursor += 1;
    const date = iso(cursor);
    if (date > suite.referenceRange.to) return blocked('outsideReferenceRange');
    if (suspended(date, mode, suite)) { skipped += 1; continue; }
    firstCountedDay ??= date;
    counted += 1;
  }
  const nominalEnd = iso(cursor);
  let end = nominalEnd;
  while (weekend(end) || calendar(path.canton, Number(end.slice(0, 4)), suite).has(end)) {
    end = add(end, 1);
    if (end > suite.referenceRange.to) return blocked('outsideReferenceRange');
  }
  // Legal order of operations remains open. Never invent a definitive result.
  if (end !== nominalEnd && suspended(end, mode, suite)) return blocked('endShiftIntoSuspensionUnresolved');
  return {
    outcome: 'reference', eligibility: path.purpose === 'contrast' ? 'contrast-only' : 'candidate-not-approved',
    ordinaryStart: iso(trigger + 1), firstCountedDay, nominalEnd, end,
    skippedDays: skipped, endShiftDays: day(end) - day(nominalEnd), exportAllowed: false
  };
}

export async function runReferences() {
  const fixtureBytes = await readFile(resolve(root, fixturePath));
  const suite = JSON.parse(fixtureBytes);
  assert.equal(suite.formatVersion, 'ap23b-research-1');
  assert.equal(suite.status, 'draft');
  assert.equal(suite.runtimeActive, false);
  assert.equal(new Set(suite.paths.map(value => value.id)).size, suite.paths.length);
  assert.equal(new Set(suite.cases.map(value => value.id)).size, suite.cases.length);
  const sources = new Set(suite.sources.map(value => value.id));
  assert.equal(sources.size, suite.sources.length);
  for (const path of suite.paths) {
    assert.ok(path.sourceRefs.length > 0);
    path.sourceRefs.forEach(id => assert.ok(sources.has(id), `Unknown source ${id}`));
    assert.ok(['TI', 'GR', 'NW'].includes(path.canton));
    assert.ok(['none', 'winter', 'three'].includes(path.suspension));
    if (path.canton === 'NW') assert.equal(path.purpose, 'contrast');
  }
  const results = [];
  for (const item of suite.cases) {
    const result = evaluate({ ...suite.sharedFacts, ...item.input }, suite);
    for (const [key, expected] of Object.entries(item.expected)) assert.deepEqual(result[key], expected, `${item.id}/${key}`);
    assert.equal(result.exportAllowed, false);
    if (result.outcome === 'blocked') assert.equal(Object.hasOwn(result, 'end'), false, item.id);
    results.push({ id: item.id, ...result });
  }
  // These mutations must be rejected. Correct fixtures alone are not sufficient.
  const base = { ...suite.sharedFacts, ...suite.cases.find(item => item.id === 'TI01').input };
  const mutations = [
    [{ path: 'not-a-path' }, 'unknownPath'],
    [{ trigger: '2027-02-30' }, 'invalidDate'],
    [{ unit: 'month' }, 'unsupportedUnit'],
    [{ opening: 'failedAttempt' }, 'openingNotQualified'],
    [{ specialLaw: 'unknown' }, 'specialLawNotExcluded'],
    [{ specialLaw: 'socialInsurance' }, 'specialLawNotExcluded'],
    [{ authorityLevel: 'municipal' }, 'authorityOutsideScope'],
    [{ stage: 'unknown' }, 'stageDoesNotMatchPath'],
    [{ calendarQualification: 'unknown' }, 'calendarNotQualified'],
    [{ urgency: 'unknown' }, 'urgencyNotQualified'],
    [{ days: 0 }, 'invalidDays'],
    [{ days: 29 }, 'statutoryDurationMismatch'],
    [{ evidenceAdvance: true }, 'evidenceAdvanceOutsideScope'],
    [{ trigger: '2028-01-01' }, 'outsideReferenceRange']
  ];
  for (const [mutation, reason] of mutations) assert.deepEqual(evaluate({ ...base, ...mutation }, suite), blocked(reason));
  const preserved = [];
  for (const item of suite.preserved) {
    assert.equal(hash(await readFile(resolve(root, item.path))), item.sha256, item.path);
    preserved.push(item);
  }
  return { status: 'passed', runtimeActive: false, productIntegrationTest: false,
    referenceCases: results.length, negativeMutations: mutations.length,
    fixtureSha256: hash(fixtureBytes), nodeVersion: process.version, results, preserved };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runReferences();
  if (process.argv.includes('--write')) {
    const output = resolve(root, 'outputs/ap23b-2026-10-12');
    await mkdir(output, { recursive: true });
    await writeFile(resolve(output, 'QA-AP23B.json'), `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify(report, null, 2));
}
