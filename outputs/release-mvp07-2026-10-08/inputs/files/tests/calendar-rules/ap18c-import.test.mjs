// SPDX-License-Identifier: AGPL-3.0-only
// Import tests use the actual accepted XLSX, never an older authoring seed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canonicalJson, sha256, normalizeWorkbook,
  evaluationRule, verifyReferenceParity, verifyComputedEvidence, createCandidate
} from '../../scripts/ap18c-import.mjs';
import { evaluateRule06 } from '../../scripts/ap18b-05-conditions.mjs';
import { AP18C_REFERENCE } from '../../scripts/ap18-workbook-archive.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workbookRelative = AP18C_REFERENCE;
const workbook = path.join(root, workbookRelative);
const acceptedSha = 'd4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65';
const baseline = '2026-08-31-mvp-03-approved.1';
const parseFile = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const acceptance = parseFile('data/candidates/2026-09-22-ap18c-workbook/acceptance.json');
const calendars = ['ch-federal-calendar', 'be-public-holidays'].map(id =>
  parseFile(`data/releases/${baseline}/calendars/${id}.json`));
const snapshot = JSON.parse(execFileSync(process.env.AP18_PYTHON || 'python3', [
  path.join(root, 'scripts/ap18c_read_workbook.py'), workbook
], { cwd: root, encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 }));
const model = normalizeWorkbook(snapshot);
const result = createCandidate(snapshot, acceptance, calendars);
const counts = {
  Feiertagskalender: 488, Gemeinwesen: 27, Feiertagsregeln: 479,
  Geltungsbereiche: 49, Gebietszuordnungen: 95, Rechtsquellen: 84,
  Verfahrensbezug: 92, Quellenprüfung: 90
};
const clone = value => structuredClone(value);
const rows = (book, sheet) => book.tables[sheet].rows;
const value = (row, header) => row.cells[header].value;
const set = (row, header, newValue) => { row.cells[header].value = newValue; };
const find = (book, sheet, header, id) => {
  const row = rows(book, sheet).find(item => value(item, header) === id);
  assert.ok(row, `${sheet}/${header}/${id} fixture exists`);
  return row;
};
const rule = (book, id) => find(book, 'Feiertagsregeln', 'Regel-ID', id);
const mutate = fn => { const changed = clone(snapshot); fn(changed); return changed; };
const reject = (name, fn, pattern) => test(name, () =>
  assert.throws(() => normalizeWorkbook(mutate(fn)), pattern));
const countBy = (array, key) => Object.fromEntries([...new Set(array.map(row => row[key]))]
  .map(item => [item, array.filter(row => row[key] === item).length]));

test('reads accepted V0.12 bytes without touching the workbook', () => {
  assert.equal(sha256(fs.readFileSync(workbook)), acceptedSha);
  assert.equal(snapshot.source.sha256, acceptedSha);
  assert.equal(snapshot.source.fileName, path.basename(workbook));
  assert.equal(snapshot.source.byteLength, fs.statSync(workbook).size);
  assert.equal(acceptance.sha256, acceptedSha);
});

test('all eight native tables and all nine sheet contexts are preserved', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(snapshot.tables).map(([k, v]) => [k, v.rows.length])), counts);
  assert.equal(snapshot.context.sheets.length, 9);
  assert.deepEqual(result.candidate.workbookEvidence, snapshot);
  assert.notEqual(result.candidate.workbookEvidence, snapshot);
  assert.ok(snapshot.context.sheets.find(sheet => sheet.name === 'Übersicht').cells.B4);
  assert.ok(snapshot.context.sheets.find(sheet => sheet.name === 'Feiertagsregeln').cells.AD23);
  assert.ok(rows(snapshot, 'Feiertagsregeln')[0].cells.Rohdatum.formula);
});

test('normalization is header-based, independent of native header and object order', () => {
  const reordered = clone(snapshot);
  for (const table of Object.values(reordered.tables)) {
    table.headers.reverse();
    for (const row of table.rows) row.cells = Object.fromEntries(Object.entries(row.cells).reverse());
  }
  assert.deepEqual(normalizeWorkbook(reordered), model);
});

reject('unknown headers are rejected', book => {
  book.tables.Feiertagsregeln.headers[0] = 'Unbekannte Regel-ID';
}, /headers/);
reject('missing headers are rejected', book => { book.tables.Feiertagsregeln.headers.pop(); }, /headers/);
reject('duplicate headers are rejected', book => {
  book.tables.Feiertagsregeln.headers[1] = book.tables.Feiertagsregeln.headers[0];
}, /headers/);
reject('missing row cells are rejected', book => {
  delete rows(book, 'Feiertagsregeln')[0].cells.Deutsch;
}, /row fields/);
reject('unexpected row cells are rejected', book => {
  rows(book, 'Feiertagsregeln')[0].cells.Unknown = { value: 'x', formula: null };
}, /row fields/);
reject('unknown native table is rejected', book => { book.tables.Unbekannt = clone(book.tables.Gemeinwesen); }, /eight native tables/);
reject('foreign native table names are rejected despite matching columns', book => {
  book.tables.Feiertagsregeln.name = 'AP18_ForeignRules';
}, /Invalid table/);
reject('1904 workbook date system is rejected', book => {
  book.context.workbookProperties.date1904 = '1';
}, /1904 date system/);
reject('selected year outside 2026–2028 is rejected', book => {
  book.context.sheets.find(sheet => sheet.name === 'Übersicht').cells.B4.value = 2034;
}, /selected workbook year/);
reject('formula-based selected year is rejected', book => {
  book.context.sheets.find(sheet => sheet.name === 'Übersicht').cells.B4.formula = '2026+1';
}, /selected workbook year/);
reject('Excel error cells are rejected in derived as well as input columns', book => {
  const cell = rows(book, 'Feiertagskalender')[0].cells.Datum;
  cell.dataType = 'e'; cell.value = '#VALUE!';
}, /Excel error/);
reject('duplicate rule IDs are rejected', book => {
  set(rows(book, 'Feiertagsregeln')[1], 'Regel-ID', value(rows(book, 'Feiertagsregeln')[0], 'Regel-ID'));
}, /Duplicate rule/);
reject('duplicate source IDs are rejected', book => {
  set(rows(book, 'Rechtsquellen')[1], 'Quellen-ID', value(rows(book, 'Rechtsquellen')[0], 'Quellen-ID'));
}, /Duplicate source/);
reject('unknown rule source is rejected', book => {
  set(rows(book, 'Feiertagsregeln')[0], 'Quellen-ID', 'SRC-UNKNOWN');
}, /Unknown rule source/);
reject('source URL and native hyperlink must match', book => {
  rows(book, 'Rechtsquellen')[0].cells['Amtlicher Link'].hyperlink = 'https://example.invalid/wrong';
}, /hyperlink mismatch/);
reject('non-HTTPS source URLs are rejected even with matching hyperlink', book => {
  const first = rows(book, 'Rechtsquellen')[0];
  set(first, 'URL (Original)', 'http://example.invalid/source');
  first.cells['Amtlicher Link'].hyperlink = 'http://example.invalid/source';
}, /HTTPS source/);
reject('formula in a legal input is rejected instead of trusting its cache', book => {
  rows(book, 'Feiertagsregeln')[0].cells.Monat.formula = '1+7';
}, /Formula in input/);
reject('formula in a translated label is rejected', book => {
  rows(book, 'Feiertagsregeln')[0].cells.Italienisch.formula = '"test"';
}, /Formula in input/);
reject('unknown calendar condition is rejected', book => {
  set(rows(book, 'Feiertagsregeln')[0], 'Kalenderbedingung', 'Beliebige Bedingung');
}, /Unknown condition/);
reject('missing calendar condition is rejected', book => {
  set(rows(book, 'Feiertagsregeln')[0], 'Kalenderbedingung', null);
}, /Unknown condition/);
reject('known condition with incompatible anchor is rejected', book => {
  set(rule(book, 'AR-ARG-ALL-DAY-ST-STEPHEN'), 'Tag', 25);
}, /requires 26 December/);
reject('GL shift only permits first Thursday in April', book => {
  set(rule(book, 'GL-RTG-ALL-DAY-NAEFELSER-FAHRT'), 'Vorkommen', 2);
}, /first Thursday in April/);
reject('unknown calculation types are rejected', book => {
  set(rows(book, 'Feiertagsregeln')[0], 'Regeltyp', 'freeExpression');
}, /Unsupported.*calculation/);
reject('impossible fixed date is rejected', book => {
  const first = rows(book, 'Feiertagsregeln')[0];
  set(first, 'Monat', 2); set(first, 'Tag', 30);
}, /Invalid fixed date/);
reject('irrelevant calculation parameters are not silently discarded', book => {
  set(rows(book, 'Feiertagsregeln')[0], 'Tagesabstand', 1);
}, /calculation fields/);
reject('reversed rule validity is rejected', book => {
  const first = rows(book, 'Feiertagsregeln')[0];
  set(first, 'Gültig bis', value(first, 'Gültig ab') - 1);
}, /Reversed validity/);
reject('non-integer dates are rejected', book => {
  set(rows(book, 'Feiertagsregeln')[0], 'Gültig ab', 45000.5);
}, /Invalid integer/);
reject('uncovered area exclusion is rejected', book => {
  set(find(book, 'Gebietszuordnungen', 'Geltungs-ID', 'BE-ALL'), 'Einbezug', 'exclude');
}, /Uncovered exclusion/);
reject('overlapping duplicate area membership is rejected', book => {
  const added = clone(find(book, 'Gebietszuordnungen', 'Geltungs-ID', 'BE-ALL'));
  set(added, 'Zuordnungs-ID', 'TEST-OVERLAPPING-AREA');
  rows(book, 'Gebietszuordnungen').push(added);
}, /Overlapping area assignments/);
reject('cross-canton assignments are rejected', book => {
  const target = find(book, 'Gebietszuordnungen', 'Geltungs-ID', 'BE-ALL');
  const source = find(book, 'Gebietszuordnungen', 'Gebiet-ID', 'GEO-AG');
  for (const key of ['Gebiet-ID', 'Deutsch', 'Französisch', 'Italienisch', 'Rumantsch Grischun',
    'Gebietstyp', 'Übergeordnetes Gebiet', 'Kennungssystem', 'Amtliche Kennung']) {
    set(target, key, value(source, key));
  }
}, /Cross-canton assignment/);
reject('invented official area IDs are rejected', book => {
  set(rows(book, 'Gebietszuordnungen')[0], 'Amtliche Kennung', '99999');
}, /Unverified official identifier/);
reject('partial days cannot be exported as reference-only', book => {
  const target = rows(book, 'Feiertagsregeln').find(row => value(row, 'Tagesumfang') === 'Ab 12.00 Uhr');
  set(target, 'Exportklasse', 'referenceOnly');
}, /Inherited approval|Partial-day export/);
reject('new rule cannot forge approval using the baseline release name', book => {
  const target = rule(book, 'AI-RTG-ALL-DAY-ST-STEPHEN');
  set(target, 'Fachstatus', 'approved');
  set(target, 'Freigabebasis', baseline);
  set(target, 'Exportklasse', 'referenceOnly');
}, /historical approval/);
reject('unapproved rule cannot carry a fabricated approval basis', book => {
  set(rule(book, 'AR-ARG-ALL-DAY-ST-STEPHEN'), 'Freigabebasis', 'approved-by-ai');
}, /Inherited approval/);
reject('non-reference procedural mapping cannot forge approved status', book => {
  const target = rows(book, 'Verfahrensbezug').find(row => value(row, 'Fachstatus') !== 'approved');
  set(target, 'Fachstatus', 'approved'); set(target, 'Freigabebasis', baseline);
}, /Mapping approval/);
reject('unapproved source cannot carry a fabricated approval basis', book => {
  const target = rows(book, 'Rechtsquellen').find(row => value(row, 'Fachstatus') !== 'approved');
  set(target, 'Frühere Freigabebasis', 'approved-by-ai');
}, /Source approval/);
reject('new source cannot inherit approved baseline status', book => {
  const target = rows(book, 'Rechtsquellen').find(row => value(row, 'Fachstatus') !== 'approved');
  set(target, 'Fachstatus', 'approved'); set(target, 'Frühere Freigabebasis', baseline);
}, /Source approval/);
reject('new scope cannot inherit approved baseline status', book => {
  const target = rows(book, 'Geltungsbereiche').find(row => value(row, 'Fachstatus') !== 'approved');
  set(target, 'Fachstatus', 'approved');
}, /[Ss]cope approval/);
reject('new jurisdiction cannot inherit approved baseline status', book => {
  const target = rows(book, 'Gemeinwesen').find(row => value(row, 'Fachstatus') !== 'approved');
  set(target, 'Fachstatus', 'approved');
}, /[Jj]urisdiction approval/);
reject('a source-review event cannot forge its own independent approval', book => {
  set(rows(book, 'Quellenprüfung')[0], 'Ereignisstatus', 'approved');
}, /Review approval/);

test('candidate source hash and file name must match the accepted file', () => {
  const changedHash = clone(snapshot); changedHash.source.sha256 = '0'.repeat(64);
  assert.throws(() => createCandidate(changedHash, acceptance, calendars), /acceptance/);
  const changedName = clone(snapshot); changedName.source.fileName = 'different.xlsx';
  assert.throws(() => createCandidate(changedName, acceptance, calendars), /acceptance/);
});

for (const [name, update] of [
  ['wrong human approver', a => { a.acceptedBy = 'Codex'; }],
  ['missing decision', a => { delete a.decision; }],
  ['missing approval date', a => { delete a.acceptedOn; }],
  ['missing scope boundaries', a => { a.boundaries = []; }],
  ['runtime activation', a => { a.runtimeEnabled = true; }]
]) {
  test(`acceptance rejects ${name}`, () => {
    const changed = clone(acceptance); update(changed);
    assert.throws(() => createCandidate(snapshot, changed, calendars), /acceptance/i);
  });
}

test('all twelve CH/BE reference holidays have unchanged product semantics', () => {
  assert.deepEqual(verifyReferenceParity(model, calendars), {
    baseline, unchangedHolidayRules: 12, runtimeFilesWritten: 0
  });
  for (const field of ['de', 'locator', 'priority']) {
    const changed = clone(model);
    const first = changed.rules.find(r => r.exportClass === 'referenceOnly');
    first[field] = typeof first[field] === 'number' ? first[field] + 1 : `${first[field]} changed`;
    assert.throws(() => verifyReferenceParity(changed, calendars), /Reference|strictly equal/);
  }
  const missing = clone(model);
  missing.rules = missing.rules.filter(r => r.id !== model.rules.find(r => r.exportClass === 'referenceOnly').id);
  assert.throws(() => verifyReferenceParity(missing, calendars), /Complete CH\/BE/);
});

test('candidate is deterministic, independently hashable and inert', () => {
  assert.equal(result.candidate.kind, 'holidayWorkbookCandidate');
  assert.equal(result.candidate.status, 'candidate');
  assert.equal(result.candidate.runtimeEnabled, false);
  assert.equal(result.report.runtimeEligible, false);
  assert.deepEqual(result.report.counts, counts);
  assert.equal(result.report.candidateSha256, sha256(canonicalJson(result.candidate)));
  assert.equal(result.report.candidateSha256, createCandidate(snapshot, acceptance, calendars).report.candidateSha256);
  const tampered = clone(result.candidate); tampered.data.rules[0].de += ' tampered';
  assert.notEqual(result.report.candidateSha256, sha256(canonicalJson(tampered)));
  assert.equal(result.candidate.interpretation.proceduralMappingsAreTextNotExecutablePermissions, true);
});

test('categories, historical statuses, half-days and bounded conditions survive', () => {
  assert.deepEqual(countBy(model.rules, 'category'), {
    publicHoliday: 291, labourLawHoliday: 103, proceduralEquivalentDay: 85
  });
  assert.deepEqual(countBy(model.rules, 'status'), { approved: 12, open: 467 });
  assert.deepEqual(countBy(model.rules, 'dayPortion'), { fullDay: 477, afternoonFromNoon: 2 });
  assert.deepEqual(countBy(model.rules, 'condition'), {
    always: 474, unlessTuesdayOrSaturday: 2, shiftHolyThursdayBy7Days: 1, onlyMonday: 2
  });
  assert.equal(model.mappings.length, 92);
  assert.equal(model.reviews.length, 90);
  assert.equal(result.candidate.areaSourceLinks.length, 29);
});

test('every current label and procedural boundary comes from the actual workbook', () => {
  for (const actual of rows(snapshot, 'Feiertagsregeln')) {
    const imported = model.rules.find(r => r.id === value(actual, 'Regel-ID'));
    for (const [language, header] of [['de', 'Deutsch'], ['fr', 'Französisch'], ['it', 'Italienisch'], ['rm', 'Rumantsch Grischun']]) {
      assert.equal(imported[language], value(actual, header));
      assert.ok(imported[language].trim());
    }
  }
  for (const actual of rows(snapshot, 'Verfahrensbezug')) {
    const imported = model.mappings.find(m => m.id === value(actual, 'Zuordnungs-ID'));
    assert.equal(imported.boundary, value(actual, 'Wirkung / Grenze'));
    assert.equal(imported.context, value(actual, 'Anwendungsbereich'));
  }
  const changed = mutate(book => set(rule(book, 'AR-ARG-ALL-DAY-ST-STEPHEN'), 'Rumantsch Grischun', 'Nadal: test da la cella actuala'));
  assert.equal(normalizeWorkbook(changed).rules.find(r => r.id === 'AR-ARG-ALL-DAY-ST-STEPHEN').rm, 'Nadal: test da la cella actuala');
  assert.equal(result.candidate.interpretation.translationsAreNotOfficialLanguageApproval, true);
});

test('SO no-effect decision and NE reservation coexist with raw historical notes', () => {
  const ids = result.candidate.acceptance.boundaries.map(b => b.id);
  assert.ok(ids.includes('SO-MAY1-NO-DEADLINE-EFFECT'));
  assert.ok(ids.includes('NE-INDIVIDUAL-DAYS-RESERVED'));
  assert.ok(model.mappings.some(m => m.scope.startsWith('SO-') && m.boundary.includes('separat klären')));
  assert.ok(model.rules.filter(r => r.dayPortion === 'afternoonFromNoon').every(r => r.exportClass === 'blockedEffect'));
  assert.equal(result.candidate.interpretation.inputValuesAndHistoricalStatusesPreserved, true);
});

test('all 1437 derivations cover exactly the checked years 2026–2028', () => {
  assert.equal(result.report.ruleOccurrencesChecked, 479 * 3);
  assert.equal(result.candidate.annualOccurrences.length, 479 * 3);
  assert.deepEqual([...new Set(result.candidate.annualOccurrences.map(o => o.year))], [2026, 2027, 2028]);
  for (const occurrence of result.candidate.annualOccurrences) {
    const imported = model.rules.find(r => r.id === occurrence.ruleId);
    assert.deepEqual({ status: occurrence.status, date: occurrence.date }, evaluateRule06(evaluationRule(imported), occurrence.year));
  }
});

test('GL, AR and AI boundary dates survive XLSX import', () => {
  const lookup = (id, year) => result.candidate.annualOccurrences.find(o => o.ruleId === id && o.year === year);
  assert.equal(lookup('GL-RTG-ALL-DAY-NAEFELSER-FAHRT', 2026).date, '2026-04-09');
  assert.equal(lookup('GL-RTG-ALL-DAY-NAEFELSER-FAHRT', 2027).date, '2027-04-01');
  assert.equal(lookup('GL-RTG-ALL-DAY-NAEFELSER-FAHRT', 2028).date, '2028-04-06');
  for (const id of ['AR-ARG-ALL-DAY-ST-STEPHEN', 'AI-RTG-ALL-DAY-ST-STEPHEN']) {
    assert.equal(lookup(id, 2026).status, 'notApplicable');
    assert.equal(lookup(id, 2026).date, null);
    assert.equal(lookup(id, 2027).date, '2027-12-26');
    assert.equal(lookup(id, 2028).status, 'notApplicable');
  }
});

test('positive NE algorithm cases do not widen the delivered candidate year window', () => {
  const newYear = evaluationRule(model.rules.find(r => r.id === 'NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE'));
  const christmas = evaluationRule(model.rules.find(r => r.id === 'NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE'));
  assert.deepEqual(evaluateRule06(newYear, 2034), { status: 'occurs', date: '2034-01-02' });
  assert.deepEqual(evaluateRule06(christmas, 2033), { status: 'occurs', date: '2033-12-26' });
  assert.ok(result.candidate.annualOccurrences.every(o => o.year >= 2026 && o.year <= 2028));
});

test('derived formula caches are retained as evidence, not promoted to calculation input', () => {
  const changed = mutate(book => {
    rule(book, 'GL-RTG-ALL-DAY-NAEFELSER-FAHRT').cells['Datum im Geltungszeitraum'].value = 1;
  });
  assert.deepEqual(normalizeWorkbook(changed), model);
  assert.equal(result.candidate.interpretation.computedColumnsAreEvidenceOnly, true);
  assert.equal(sha256(fs.readFileSync(workbook)), acceptedSha);
});

test('saved derivation evidence agrees with all 479 rules and 488 calendar rows', () => {
  assert.equal(verifyComputedEvidence(snapshot, model), 479 + 488);
});

test('wrong saved rule-date cache is rejected at the export evidence gate', () => {
  const changed = mutate(book => {
    rule(book, 'GL-RTG-ALL-DAY-NAEFELSER-FAHRT').cells['Datum im Geltungszeitraum'].value = 1;
  });
  assert.throws(() => verifyComputedEvidence(changed, normalizeWorkbook(changed)), /Saved rule date/);
  assert.throws(() => createCandidate(changed, acceptance, calendars), /Saved rule date/);
});

test('wrong saved calendar-date cache is rejected at the export evidence gate', () => {
  const changed = mutate(book => { rows(book, 'Feiertagskalender')[0].cells.Datum.value = 1; });
  assert.throws(() => createCandidate(changed, acceptance, calendars), /Saved calendar/);
});

test('unknown calendar rule reference is rejected', () => {
  const changed = mutate(book => set(rows(book, 'Feiertagskalender')[0], 'Regel-ID', 'UNKNOWN-RULE'));
  assert.throws(() => createCandidate(changed, acceptance, calendars), /Unknown calendar rule/);
});

for (const header of ['Französisch', 'Italienisch', 'Rumantsch Grischun', 'Quellen-ID', 'Tagesumfang', 'Rechtskategorie']) {
  test(`derived calendar ${header} must match the corresponding legal rule`, () => {
    const changed = mutate(book => set(rows(book, 'Feiertagskalender')[0], header, 'changed'));
    assert.throws(() => createCandidate(changed, acceptance, calendars), /Saved calendar/);
  });
}
