// SPDX-License-Identifier: AGPL-3.0-only
// Index- und Nachweiskontrolle, ausdrücklich kein Produktresolver.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const indexPath = 'tests/golden/candidates/ap22b-calendar-references.json';
const index = JSON.parse(await readFile(resolve(root, indexPath), 'utf8'));
const expectedGroups = [
  'BUND01', 'BUND02', 'BUND03', 'BUND04', 'BUND05', 'BUND06',
  'REG-01', 'REG-02', 'REG-03', 'REG-04', 'REG-05', 'REG-06', 'REG-07', 'REG-08', 'REG-09', 'REG-10',
  'PROC-SH-2026', 'PROC-SG-2023', 'PROC-SG-2026', 'PROC-AR-2028/29',
  'PROC-VD-2026', 'PROC-ZH-2026', 'PROC-LU-2026', 'PROC-ZG-2026', 'PROC-VS-2026'
];
const expectedBoundaries = ['ZENT01', 'ZENT02', 'ZENT03', 'ZENT04', 'ZENT05', 'ZENT06', 'ZENT07', 'ZENT08'];
const expectedJanuary = ['JAN02-DIFFERENT-2026', 'JAN02-REACHED-2026', 'JAN02-SAME-WEEKEND-2027', 'JAN02-IRRELEVANT-2026'];
const januaryBindings = [
  'AP22-SH-ZPO-ADDITIONAL-STPO', 'AP22-SG-ZPO-ADDITIONAL-STPO',
  'AP22-SG-ZPO-ADDITIONAL-BGG', 'AP22-SG-ZPO-ADDITIONAL-VWVG'
];

function sameSet(actual, expected) {
  assert.equal(new Set(actual).size, actual.length, 'Keine doppelten Kennungen');
  assert.deepEqual([...actual].sort(), [...expected].sort());
}

function inspectIndex(value) {
  assert.equal(value.kind, 'ap22b-calendar-reference-index');
  assert.equal(value.status, 'draft');
  for (const flag of ['implementation', 'productActivation', 'calculationPerformed', 'contractApproved']) {
    assert.equal(value[flag], false, `${flag} darf keine Produktfreigabe behaupten`);
  }
  assert.deepEqual(value.counts, { ap22aGroups: 25, centralBoundaries: 8, januaryCounterfactuals: 4 });
  sameSet(value.referenceGroups.map(row => row.id), expectedGroups);
  sameSet(value.centralBoundaries.map(row => row.id), expectedBoundaries);
  sameSet(value.januaryCounterfactuals.map(row => row.id), expectedJanuary);
  const all = [...value.referenceGroups, ...value.centralBoundaries, ...value.januaryCounterfactuals];
  sameSet(all.map(row => row.id), [...expectedGroups, ...expectedBoundaries, ...expectedJanuary]);
  for (const row of all) {
    assert.equal(row.implementation, false, row.id);
    assert.equal(row.verificationStatus, 'specified-not-executed', row.id);
    assert.ok(['historicalFullCase', 'endpoint', 'productBoundary'].includes(row.kind), row.id);
    assert.match(row.sourcePath, /^docs\/(?:fachrecht|entscheidungen)\/[A-Za-z0-9-]+\.md$/);
    assert.ok(row.ref && row.scenarios.length > 0, row.id);
    assert.equal(new Set(row.scenarios.map(scenario => scenario.id)).size, row.scenarios.length, row.id);
    for (const scenario of row.scenarios) {
      assert.ok(scenario.input && scenario.expected && Object.keys(scenario.expected).length > 0, row.id);
      if (scenario.expected.outcome === 'clarification') {
        assert.equal(scenario.expected.definitiveResult, false, row.id);
        assert.equal(scenario.expected.calendarExportAllowed, false, row.id);
        assert.equal(Object.hasOwn(scenario.expected, 'finalDate'), false, row.id);
      }
    }
  }
  for (const row of value.januaryCounterfactuals) {
    sameSet(row.affectedBindingIds, januaryBindings);
    assert.equal(row.ref, 'DEC-2026-029');
    const scenario = row.scenarios[0];
    assert.equal(scenario.input.toggle, 'only-the-bound-jan2-rule');
    assert.equal(scenario.input.otherRulesIdentical, true);
    const differs = scenario.expected.withoutJanuary2.finalDate !== scenario.expected.withJanuary2.finalDate;
    // Vergleicht nur explizit hinterlegte Sollwerte, berechnet keine Frist.
    assert.equal(scenario.expected.requiresClarification, differs);
    assert.equal(scenario.expected.definitiveResult, !differs);
    assert.equal(scenario.expected.calendarExportAllowed, !differs);
  }
  assert.equal(value.counterfactualContract.comparison, 'legal-result-not-trace-or-metadata');
  assert.equal(value.counterfactualContract.includeEntireEndpointShift, true);
  assert.equal(value.counterfactualContract.noEarlyStopAtFirstDifference, true);
  assert.equal(value.counterfactualContract.noProductRuntimeImplemented, true);
}

test('AP22B preserves all 25 AP22A groups and eight central boundaries as unexecuted specifications', () => {
  inspectIndex(index);
});

test('every reference has an existing repository source containing its reference identifier', async () => {
  for (const row of [...index.referenceGroups, ...index.centralBoundaries, ...index.januaryCounterfactuals]) {
    const source = await readFile(resolve(root, row.sourcePath), 'utf8');
    assert.ok(source.includes(row.ref), `${row.id}: ${row.sourcePath} muss ${row.ref} enthalten`);
  }
});

test('the reference index is bound to the unchanged AP22A V1.0 matrix', async () => {
  const bytes = await readFile(resolve(root, index.sourceMatrix.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), index.sourceMatrix.sha256);
  const matrix = JSON.parse(bytes);
  sameSet(matrix.matrix.filter(row => row.mode === 'resultDependentClarification').map(row => row.id), januaryBindings);
  for (const id of index.counterfactualContract.unchangedBindings) {
    assert.ok(matrix.matrix.some(row => row.id === id), id);
    assert.equal(januaryBindings.includes(id), false, id);
  }
});

test('missing, duplicated and unfamiliar reference groups fail index integrity', () => {
  for (const change of [
    value => value.referenceGroups.pop(),
    value => value.centralBoundaries.push(structuredClone(value.centralBoundaries[0])),
    value => { value.referenceGroups[0].id = 'UNKNOWN'; },
    value => value.januaryCounterfactuals.pop(),
    value => { value.referenceGroups[0].kind = 'passedProductTest'; }
  ]) {
    const changed = structuredClone(index);
    change(changed);
    assert.throws(() => inspectIndex(changed));
  }
});

test('draft metadata cannot be changed into product execution or approval', () => {
  for (const change of [
    value => { value.implementation = true; },
    value => { value.productActivation = true; },
    value => { value.calculationPerformed = true; },
    value => { value.contractApproved = true; },
    value => { value.status = 'approved'; },
    value => { value.referenceGroups[0].verificationStatus = 'passed'; },
    value => { value.referenceGroups[0].implementation = true; }
  ]) {
    const changed = structuredClone(index);
    change(changed);
    assert.throws(() => inspectIndex(changed));
  }
});

test('January counterfactuals cover direct, reached, weekend and irrelevant cases without arithmetic', () => {
  const cases = Object.fromEntries(index.januaryCounterfactuals.map(row => [row.id, row.scenarios[0]]));
  for (const id of ['JAN02-DIFFERENT-2026', 'JAN02-REACHED-2026']) {
    assert.equal(cases[id].expected.withoutJanuary2.finalDate, '2026-01-02');
    assert.equal(cases[id].expected.withJanuary2.finalDate, '2026-01-05');
    assert.equal(cases[id].expected.requiresClarification, true);
  }
  assert.equal(cases['JAN02-REACHED-2026'].input.nominalDate, '2026-01-01');
  assert.equal(cases['JAN02-SAME-WEEKEND-2027'].input.nominalDate, '2027-01-02');
  assert.equal(cases['JAN02-SAME-WEEKEND-2027'].expected.withoutJanuary2.finalDate, '2027-01-04');
  assert.equal(cases['JAN02-SAME-WEEKEND-2027'].expected.withJanuary2.finalDate, '2027-01-04');
  assert.equal(cases['JAN02-SAME-WEEKEND-2027'].expected.requiresClarification, false);
  assert.equal(cases['JAN02-IRRELEVANT-2026'].input.nominalDate, '2026-02-03');
  assert.equal(cases['JAN02-IRRELEVANT-2026'].expected.requiresClarification, false);
});

test('a January date difference cannot produce a definitive result or lose a binding', () => {
  for (const change of [
    value => { value.januaryCounterfactuals[0].scenarios[0].expected.definitiveResult = true; },
    value => { value.januaryCounterfactuals[0].scenarios[0].expected.calendarExportAllowed = true; },
    value => { value.januaryCounterfactuals[0].scenarios[0].expected.requiresClarification = false; },
    value => value.januaryCounterfactuals[0].affectedBindingIds.pop(),
    value => { value.januaryCounterfactuals[2].scenarios[0].expected.requiresClarification = true; }
  ]) {
    const changed = structuredClone(index);
    change(changed);
    assert.throws(() => inspectIndex(changed));
  }
});

test('GR, NE, historical and negative evidence remain distinct reference categories', () => {
  const group = id => [...index.referenceGroups, ...index.centralBoundaries].find(row => row.id === id);
  assert.equal(index.referenceGroups.filter(row => row.kind === 'historicalFullCase').length, 6);
  assert.equal(group('BUND05').scenarios[0].expected.finalDate, '2010-11-02');
  assert.equal(group('BUND05').scenarios[1].expected.outcome, 'clarification');
  assert.equal(group('REG-09').scenarios[0].expected.outcome, 'unchangedFromKnownRules');
  assert.deepEqual(group('REG-09').scenarios[0].expected.coverageCaveats, ['NE-additional-annual-or-local-orders']);
  assert.equal(group('ZENT03').scenarios[0].expected.outcome, 'boundedCalculation');
  assert.equal(group('ZENT03').scenarios[1].input.effectiveHolidayCanton, 'BE');
  assert.equal(group('ZENT06').scenarios[1].expected.outcome, 'preserve-negative-binding');
  assert.equal(group('ZENT06').scenarios[2].expected.outcome, 'boundedCalculation');
});
