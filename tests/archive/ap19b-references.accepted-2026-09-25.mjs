// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { candidatePath, civilDay, civilDate, evaluateReference, runReferenceCases, validateReferences, verifyCalendarBasis } from '../../scripts/check-ap19b-references.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = JSON.parse(await readFile(resolve(root, candidatePath), 'utf8'));
const clone = () => structuredClone(source);
const getInput = pathId => structuredClone(source.paths.find(path => path.pathId === pathId).input);
const run = (pathId, overrides = {}, model = source) => evaluateReference(model, pathId, { ...getInput(pathId), ...overrides });
const path = 'CH-SOC-ELG-OBJ';
function rejectMutation(change) {
  const model = clone(); change(model);
  assert.throws(() => validateReferences(model));
  assert.equal(run(path, {}, model).reason, 'reference-contract-invalid');
}

test('all 77 literal references pass across twelve candidate paths', () => {
  assert.deepEqual(runReferenceCases(source), { paths: 12, cases: 77, positive: 25, blocked: 52, runtimeActive: false, legalTimeApproval: false });
});
test('candidate completeness never grants runtime or legal time approval', () => {
  for (const item of source.cases.filter(item => item.expected.qualification === 'qualified-reference')) {
    const result = run(item.pathId, item.overrides);
    assert.equal(result.eligibility, 'candidate-not-approved'); assert.equal(result.runtimeActive, false);
  }
  for (const change of [m => { m.status = 'approved'; }, m => { m.approvedBy = 'David Steimer'; }, m => { m.runtimeActive = true; }, m => { m.legalTimeApproval = true; }]) rejectMutation(change);
});
test('all twelve paths require qualified individual inputs, not only an input date', () => {
  for (const item of source.paths) {
    assert.equal(run(item.pathId, { document: 'unknown' }).reason, 'document-unqualified');
    assert.equal(run(item.pathId, { triggerStatus: 'unknown' }).reason, 'trigger-unqualified');
    assert.equal(run(item.pathId, { jurisdictionStatus: 'unknown' }).reason, 'jurisdiction-unqualified');
    assert.equal(run(item.pathId, { subject: 'unknown' }).reason, 'subject-unqualified');
  }
});
test('statutory exceptions remain distinct from narrower product scope', () => {
  assert.equal(run('CH-SOC-ELG-OBJ', { subject: 'elg-charitable-benefits' }).reason, 'statutory-exclusion');
  assert.equal(run('CH-SOC-ELG-OBJ', { subject: 'elg-cantonal-extra-benefits' }).reason, 'product-scope');
  assert.equal(run('CH-SOC-AVIG-ALE-OBJ', { subject: 'avig-collective-amm' }).reason, 'statutory-exclusion');
  assert.equal(run('CH-SOC-AVIG-ALE-OBJ', { subject: 'avig-insolvency-benefits' }).reason, 'product-scope');
  assert.equal(run('CH-SOC-KVG-OKP-OBJ', { subject: 'kvg-premium-reduction' }).reason, 'statutory-exclusion');
  assert.equal(run('CH-SOC-KVG-OKP-OBJ', { subject: 'kvg-daily-allowance' }).reason, 'product-scope');
  assert.equal(run('CH-SOC-ELG-OBJ', { subject: 'kvg-premium-reduction' }).reason, 'subject-unqualified');
  assert.equal(run('CH-SOC-AVIG-ALE-OBJ', { subject: 'elg-cantonal-extra-benefits' }).reason, 'subject-unqualified');
  assert.equal(run('CH-SOC-KVG-OKP-OBJ', { subject: 'avig-collective-amm' }).reason, 'subject-unqualified');
});
test('fixed thirty-day periods cannot be altered or confused with ordered periods', () => {
  for (const item of source.paths.filter(item => /-(OBJ|APP)$/.test(item.pathId))) {
    assert.equal(run(item.pathId, { days: 31 }).reason, 'fixed-duration-changed');
    assert.equal(run(item.pathId, { days: null }).reason, 'duration-unqualified');
  }
  for (const item of source.paths.filter(item => /-(ADM|CORRECTION)$/.test(item.pathId))) {
    for (const days of [null, 0, -1, 1.5, '10', 366]) assert.equal(run(item.pathId, { days }).reason, 'duration-unqualified');
  }
});
test('the three ATSG pauses and inclusive endpoints are literal audited references', () => {
  const expected = { R02: 15, R03: 32, R04: 16, R13: 15, R14: 31, R15: 15, R20: 0, R21: 0, R22: 0 };
  for (const [id, suspensionDays] of Object.entries(expected)) {
    const item = source.cases.find(item => item.id === id);
    assert.equal(run(item.pathId, item.overrides).arithmetic.suspensionDays, suspensionDays, id);
  }
});
test('weekends and holidays inside a running period count, only the end shifts', () => {
  const result = run('CH-SOC-KVG-OKP-ADM', { legalTriggerDate: '2026-05-22', days: 3 });
  assert.deepEqual(result.arithmetic, { calendarStartDate: '2026-05-23', firstCountedDate: '2026-05-23', nominalEndDate: '2026-05-25', deadline: '2026-05-26', suspensionDays: 0, extensionDays: 1 });
  assert.equal(run('CH-SOC-AVIG-ALE-OBJ', { legalTriggerDate: '2026-05-13' }).arithmetic.deadline, '2026-06-12');
});
test('civil-date validation respects leap years without widening legal coverage', () => {
  for (const date of ['2026-02-29', '2027-02-29', '2026-02-30', '2026-13-01', '2026-1-01', '1900-02-29', '', null]) assert.equal(civilDay(date), null);
  assert.equal(civilDate(civilDay('2028-02-28') + 1), '2028-02-29');
  assert.equal(civilDate(civilDay('2000-02-28') + 1), '2000-02-29');
  assert.equal(run(path, { legalTriggerDate: '2028-02-29' }).reason, 'outside-reference-window');
});
test('holiday anchor and insurer seat are separate and unresolved places never default to BE', () => {
  const base = run('CH-SOC-KVG-OKP-APP');
  const otherSeat = run('CH-SOC-KVG-OKP-APP', { institutionSeatCanton: 'GE', holidayAnchor: 'representative' });
  assert.deepEqual(otherSeat.arithmetic, base.arithmetic);
  assert.equal(run(path, { holidayCanton: null }).reason, 'holiday-scope-unbound');
  assert.equal(run(path, { holidayCanton: 'ZH' }).reason, 'holiday-scope-unbound');
  assert.equal(run(path, { holidayAnchor: 'authority' }).reason, 'holiday-anchor-unqualified');
  assert.equal(run(path, { holidayStatus: 'unknown' }).reason, 'holiday-anchor-unqualified');
  assert.equal(run(path, { regionalAreaId: 'UNKNOWN' }).reason, 'holiday-scope-unbound');
  for (const institutionSeatCanton of ['XX', {}, [], 5, false]) assert.equal(run(path, { institutionSeatCanton }).reason, 'reference-contract-invalid');
  assert.deepEqual(run(path, { institutionSeatCanton: null }).arithmetic, run(path).arithmetic);
});
test('Bern-only fixture binding does not assert national product activation', () => {
  for (const item of source.paths) {
    assert.equal(run(item.pathId, { proceduralCanton: 'ZH' }).reason, 'jurisdiction-unbound');
    assert.equal(run(item.pathId, { proceduralCanton: null }).reason, 'jurisdiction-unbound');
  }
  assert.equal(evaluateReference(source, 'CH-SOC-UNKNOWN-OBJ', getInput(path)).reason, 'path-unavailable');
});
test('reference source calendar bytes remain identical to the frozen release', async () => {
  assert.equal(await verifyCalendarBasis(source), 2);
});
test('AVIG proposed original-amendment evidence is explicit across January/February 2027', () => {
  const avig = 'CH-SOC-AVIG-ALE-ADM';
  assert.equal(run(avig, { legalTriggerDate: '2027-01-30', days: 1 }).arithmetic.deadline, '2027-02-01');
  assert.equal(run(avig, { legalTriggerDate: '2027-01-31', days: 1 }).arithmetic.deadline, '2027-02-01');
  assert.equal(run('CH-SOC-AVIG-ALE-OBJ', { legalTriggerDate: '2027-02-01' }).arithmetic.deadline, '2027-03-03');
  assert.equal(run(avig, { legalTriggerDate: '2027-01-28', days: 1 }).arithmetic.deadline, '2027-01-29');
  assert.equal(run(avig, { legalTriggerDate: '2027-12-17', days: 1 }).reason, 'result-outside-reference-window');
  rejectMutation(model => { model.sourceCoverageCeilings['AVIG-ALE'] = '2028-12-31'; });
  for (const mode of ['unknown', 'unsupported', 'direct-consolidations', null]) rejectMutation(model => { model.sourceEvidenceMode['AVIG-ALE'] = mode; });
  rejectMutation(model => { delete model.sourceEvidenceMode; });
});
test('source identifiers, citations and versioned original URLs cannot be interchanged', () => {
  rejectMutation(model => { model.sources[2].citation = 'KVG Art. 1'; });
  rejectMutation(model => { model.sources[2].url = model.sources[4].url; });
  rejectMutation(model => { model.sources[0].url = 'https://www.fedlex.admin.ch/eli/cc/2002/510/de'; });
  rejectMutation(model => { model.sources[0].url = ''; });
});
test('literal fixture holidays match an independent projection of read-only CH/BE rules', async () => {
  const dates = new Set();
  const easter = { 2026: '2026-04-05', 2027: '2027-03-28' };
  for (const entry of source.calendarFixture.basis) {
    const calendar = JSON.parse(await readFile(resolve(root, entry.path), 'utf8'));
    for (const rule of calendar.rules.filter(rule => rule.effect.type === 'holiday')) {
      for (const year of [2026, 2027]) {
        const spec = rule.calculation;
        if (spec.type === 'fixedMonthDay') dates.add(`${year}-${String(spec.month).padStart(2, '0')}-${String(spec.day).padStart(2, '0')}`);
        else if (spec.type === 'easterOffsetDays') dates.add(civilDate(civilDay(easter[year]) + spec.offsetDays));
        else {
          assert.equal(spec.type, 'nthWeekdayOfMonth');
          let day = civilDay(`${year}-${String(spec.month).padStart(2, '0')}-01`), matches = 0;
          while (matches < spec.occurrence) {
            const weekday = new Date(day * 86_400_000).getUTCDay() || 7;
            if (weekday === spec.isoWeekday) matches++;
            if (matches < spec.occurrence) day++;
          }
          dates.add(civilDate(day));
        }
      }
    }
  }
  assert.deepEqual([...dates].sort(), source.calendarFixture.holidayDates);
});
test('unknown keys and missing fields fail closed in fixtures and inputs', () => {
  for (const route of [[], ['referenceWindow'], ['calendarFixture'], ['sources', 0], ['paths', 0], ['paths', 0, 'input'], ['cases', 0], ['cases', 0, 'overrides'], ['cases', 0, 'expected']]) {
    rejectMutation(model => { route.reduce((item, key) => item[key], model).unknown = true; });
  }
  for (const key of Object.keys(getInput(path))) {
    const input = getInput(path); delete input[key];
    assert.equal(evaluateReference(source, path, input).reason, 'reference-contract-invalid', key);
  }
  assert.equal(run(path, { unknown: true }).reason, 'reference-contract-invalid');
});
test('changes to literal expected results are detected, never recomputed into the fixture', () => {
  const model = clone(); model.cases[0].expected.arithmetic.deadline = '2026-10-17';
  assert.throws(() => runReferenceCases(model), /R01/);
  const negative = clone(); negative.cases.find(item => item.id === 'S16').expected.reason = 'statutory-exclusion';
  assert.throws(() => runReferenceCases(negative), /S16/);
});
test('duplicate IDs, altered durations and missing calendar dates are rejected', () => {
  rejectMutation(model => { model.cases[1].id = model.cases[0].id; });
  rejectMutation(model => { model.paths[0].input.days = 31; });
  rejectMutation(model => { model.calendarFixture.holidayDates.splice(0, 1); });
  rejectMutation(model => { model.calendarFixture.suspensionIntervals[1][1] = '2026-04-11'; });
  rejectMutation(model => { model.calendarFixture.basis[0].sha256 = '0'.repeat(64); });
});
test('calendar arithmetic does not depend on host time zone or daylight-saving transition', () => {
  for (const TZ of ['UTC', 'Europe/Zurich', 'America/New_York']) {
    const child = spawnSync(process.execPath, [resolve(root, 'scripts/check-ap19b-references.mjs')], { cwd: root, env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(child.status, 0, child.stderr);
    assert.equal(JSON.parse(child.stdout).cases, 77);
  }
});

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? filesUnder(resolve(directory, entry.name)) : [resolve(directory, entry.name)]))).flat();
}
test('no AP19B reference artifact is imported by product source or released manifests', async () => {
  const sourceFiles = (await filesUnder(resolve(root, 'src'))).filter(path => /\.(ts|tsx|js|mjs|json)$/.test(path));
  const manifests = (await filesUnder(resolve(root, 'data/releases'))).filter(path => path.endsWith('/manifest.json'));
  for (const filename of [...sourceFiles, ...manifests, resolve(root, 'package.json')]) {
    assert.doesNotMatch(await readFile(filename, 'utf8'), /ap19b-social-deadlines|check-ap19b-references/, filename);
  }
});
