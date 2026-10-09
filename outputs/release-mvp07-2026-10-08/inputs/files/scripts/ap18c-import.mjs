// SPDX-License-Identifier: AGPL-3.0-only
// Actual XLSX data -> lossless review candidate, never a runtime calendar.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { evaluateRule06, CONDITION_LABELS_06 } from './ap18b-05-conditions.mjs';
import { DAY_PORTION_LABELS } from './ap18b-03-contract.mjs';

export const TABLE_HEADERS = Object.freeze({
  Feiertagskalender: ['Datum', 'Wochentag', 'Gemeinwesen', 'Geltungsbereich', 'Feiertag', 'Französisch', 'Italienisch', 'Rumantsch Grischun', 'Rechtskategorie', 'Fachstatus', 'Regel-ID', 'Quellen-ID', 'Fundstelle', 'Abdeckung', 'Tagesumfang'],
  Gemeinwesen: ['Code', 'Deutsch', 'Französisch', 'Italienisch', 'Rumantsch Grischun', 'Übergeordnet', 'Erfassungsstand', 'Fachstatus', 'Amtliche Feiertagsquelle'],
  Feiertagsregeln: ['Regel-ID', 'Gemeinwesen', 'Geltungs-ID', 'Deutsch', 'Französisch', 'Italienisch', 'Rumantsch Grischun', 'Rechtskategorie', 'Regeltyp', 'Monat', 'Tag', 'Tagesabstand', 'ISO-Wochentag', 'Vorkommen', 'Gültig ab', 'Gültig bis', 'Priorität', 'Fachstatus', 'Freigabebasis', 'Wirkung', 'Zielregel', 'Exportklasse', 'Rohdatum', 'Datum im Geltungszeitraum', 'Quellen-ID', 'Fundstelle', 'Tagesumfang', 'Kalenderbedingung'],
  Geltungsbereiche: ['Geltungs-ID', 'Gemeinwesen', 'Gebiet', 'Französisch', 'Italienisch', 'Rumantsch Grischun', 'Gebietstyp', 'Umfang / Grenze', 'Quellen-ID', 'Fundstelle', 'Fachstatus', 'Daten ab', 'Daten bis'],
  Gebietszuordnungen: ['Zuordnungs-ID', 'Geltungs-ID', 'Gebiet-ID', 'Deutsch', 'Französisch', 'Italienisch', 'Rumantsch Grischun', 'Gebietstyp', 'Übergeordnetes Gebiet', 'Einbezug', 'Kennungssystem', 'Amtliche Kennung', 'Gültig ab', 'Gültig bis', 'Quellen-ID', 'Fundstelle', 'Fachstatus', 'Prüfhinweis'],
  Rechtsquellen: ['Quellen-ID', 'Gemeinwesen', 'Erlass / Quelle', 'Fundstelle', 'Amtlicher Link', 'Fassungsstand', 'Abgerufen', 'Prüfhinweis', 'Fachstatus', 'Frühere Freigabebasis', 'URL (Original)'],
  Verfahrensbezug: ['Zuordnungs-ID', 'Geltungs-ID', 'Rechtskategorie', 'Anwendungsbereich', 'Wirkung / Grenze', 'Norm / Referenz', 'Fachstatus', 'Freigabebasis'],
  Quellenprüfung: ['Prüf-ID', 'Quellen-ID', 'Auslöser', 'Datum', 'Ergebnis', 'Vergleichsbasis', 'Befund', 'Ereignisstatus', 'Fachverantwortung', 'Arbeitsinstrument', 'Nächster Schritt']
});
const CATEGORIES = ['publicHoliday', 'labourLawHoliday', 'proceduralEquivalentDay'];
const STATUSES = ['approved', 'open', 'blocked'];
const BASELINE = '2026-08-31-mvp-03-approved.1';
// Pins the recorded acceptance, not a digital signature or independent review.
const ACCEPTANCE_SHA256 = '551b75e998edcba80c7cdffbd489ca49cd202382b04349a985ae4b084290e188';
const CH_CANTONS = 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ').map(c => `CH-${c}`);
const reverse = object => Object.fromEntries(Object.entries(object).map(([k, v]) => [v, k]));
const conditions = reverse(CONDITION_LABELS_06);
const portions = reverse(DAY_PORTION_LABELS);
export const canonicalJson = value => `${JSON.stringify(value, null, 2)}\n`;
export const sha256 = value => createHash('sha256').update(value).digest('hex');
const fail = message => { throw new Error(message); };
function text(value, label, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim())) fail(`Invalid text: ${label}`);
  return value;
}
function oneOf(value, values, label) {
  if (!values.includes(value)) fail(`Unknown ${label}: ${value}`);
  return value;
}
function integer(value, low, high, label) {
  if (!Number.isInteger(value) || value < low || value > high) fail(`Invalid integer: ${label}`);
  return value;
}
export function excelDate(value, label, optional = false) {
  if (value === null && optional) return null;
  // The approved workbook uses 1899-12-30, including negative serials for
  // historical source editions (Näfelser Fahrt 1835). Preserve that contract.
  integer(value, -115780, 2958465, label);
  if (value === 60) fail(`Fictitious Excel date: ${label}`);
  return new Date(Date.UTC(1899, 11, 30) + value * 86400000).toISOString().slice(0, 10);
}
function interval(from, to, label) {
  if (to !== null && to < from) fail(`Reversed validity: ${label}`);
}
function url(value, label) {
  text(value, label);
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) fail(`Invalid HTTPS source: ${label}`);
  return value;
}
function unique(rows, label) {
  const indexed = new Map();
  for (const row of rows) {
    if (indexed.has(row.id)) fail(`Duplicate ${label}: ${row.id}`);
    indexed.set(row.id, row);
  }
  return indexed;
}
function ref(index, id, label) {
  if (!index.has(id)) fail(`Unknown ${label}: ${id}`);
  return index.get(id);
}
function inputRows(snapshot, sheet) {
  const table = snapshot.tables[sheet];
  const expected = TABLE_HEADERS[sheet];
  if (!table || !Array.isArray(table.headers) || new Set(table.headers).size !== expected.length
    || table.headers.length !== expected.length || expected.some(h => !table.headers.includes(h))) {
    fail(`Unknown or missing headers: ${sheet}`);
  }
  const tableName = `AP18_${sheet === 'Quellenprüfung' ? 'Quellenprufung' : sheet}`;
  if (table.name !== tableName || !Array.isArray(table.rows) || !table.rows.length) fail(`Invalid table: ${sheet}`);
  return table.rows.map(row => {
    if (Object.keys(row.cells).length !== expected.length || expected.some(h => !Object.hasOwn(row.cells, h))) {
      fail(`Invalid row fields: ${sheet}/${row.row}`);
    }
    for (const [header, cell] of Object.entries(row.cells)) {
      const derived = sheet === 'Feiertagskalender' || (sheet === 'Feiertagsregeln' && ['Rohdatum', 'Datum im Geltungszeitraum'].includes(header));
      if (!derived && cell.formula !== null) fail(`Formula in input: ${sheet}/${row.row}/${header}`);
      if (cell.dataType === 'e') fail(`Excel error: ${sheet}/${row.row}/${header}`);
      if (typeof cell.value === 'number' && !Number.isFinite(cell.value)) fail('Nonfinite cell');
    }
    return {
      v: Object.fromEntries(expected.map(h => [h, row.cells[h].value])),
      cells: row.cells,
      provenance: { sheet, table: table.name, row: row.row }
    };
  });
}
const labels = (v, de = 'Deutsch') => Object.fromEntries([
  ['de', de], ['fr', 'Französisch'], ['it', 'Italienisch'], ['rm', 'Rumantsch Grischun']
].map(([lang, h]) => [lang, text(v[h], h)]));
const status = v => oneOf(v, STATUSES, 'work status');
const basis = v => v === null ? null : text(v, 'approval basis');
function calculation(v) {
  const fields = { Monat: 'month', Tag: 'day', Tagesabstand: 'offsetDays', 'ISO-Wochentag': 'isoWeekday', Vorkommen: 'occurrence' };
  // Preserve all nonempty parameters. The strict existing calculator rejects
  // irrelevant parameters, rather than silently dropping a user's input.
  return { type: text(v.Regeltyp, 'calculation type'), ...Object.fromEntries(
    Object.entries(fields).filter(([h]) => v[h] !== null).map(([h, f]) => [f, v[h]])
  ) };
}

export function normalizeWorkbook(snapshot) {
  assert.deepEqual(Object.keys(snapshot.tables).sort(), Object.keys(TABLE_HEADERS).sort(), 'Expected eight native tables');
  if (['1', 'true'].includes(snapshot.context.workbookProperties.date1904)) fail('Unsupported 1904 date system');
  const overview = snapshot.context.sheets.find(s => s.name === 'Übersicht');
  const selected = overview?.cells.B4;
  if (!selected || selected.formula !== null || ![2026, 2027, 2028].includes(selected.value)) fail('Unsupported selected workbook year');
  const rows = Object.fromEntries(Object.keys(TABLE_HEADERS).map(s => [s, inputRows(snapshot, s)]));
  const model = {
    jurisdictions: rows.Gemeinwesen.map(({ v, provenance }) => ({
      id: text(v.Code, 'jurisdiction'), labels: labels(v), parentId: v['Übergeordnet'],
      coverage: text(v.Erfassungsstand, 'coverage'), status: status(v.Fachstatus),
      sourceUrl: url(v['Amtliche Feiertagsquelle'], 'jurisdiction source'), provenance
    })),
    scopes: rows.Geltungsbereiche.map(({ v, provenance }) => ({
      id: text(v['Geltungs-ID'], 'scope'), jurisdiction: text(v.Gemeinwesen, 'jurisdiction'),
      labels: labels(v, 'Gebiet'), type: oneOf(v.Gebietstyp, ['National', 'Kanton', 'Bezirk', 'Bezirksausnahme', 'Gemeinde', 'Ortsteil', 'Gebietsgruppe'], 'scope type'),
      boundary: text(v['Umfang / Grenze'], 'boundary'), source: text(v['Quellen-ID'], 'source'),
      locator: text(v.Fundstelle, 'locator'), status: status(v.Fachstatus),
      from: excelDate(v['Daten ab'], 'scope from'), to: excelDate(v['Daten bis'], 'scope to', true), provenance
    })),
    sources: rows.Rechtsquellen.map(({ v, cells, provenance }) => {
      const link = url(v['URL (Original)'], 'source URL');
      if (cells['Amtlicher Link'].hyperlink !== link) fail(`Source hyperlink mismatch: ${v['Quellen-ID']}`);
      return { id: text(v['Quellen-ID'], 'source'), jurisdiction: text(v.Gemeinwesen, 'jurisdiction'),
        title: text(v['Erlass / Quelle'], 'source title'), locator: text(v.Fundstelle, 'locator'),
        url: link, versionOn: excelDate(v.Fassungsstand, 'version date', true), retrievedOn: excelDate(v.Abgerufen, 'retrieval date'),
        note: text(v.Prüfhinweis, 'source note'), status: status(v.Fachstatus), approvalBasis: basis(v['Frühere Freigabebasis']), provenance };
    }),
    rules: rows.Feiertagsregeln.map(({ v, provenance }) => ({
      id: text(v['Regel-ID'], 'rule'), jurisdiction: text(v.Gemeinwesen, 'jurisdiction'),
      scope: text(v['Geltungs-ID'], 'scope'), ...labels(v), category: oneOf(v.Rechtskategorie, CATEGORIES, 'category'),
      calculation: calculation(v), from: excelDate(v['Gültig ab'], 'rule from'), to: excelDate(v['Gültig bis'], 'rule to', true),
      priority: integer(v.Priorität, 0, 10000, 'priority'), status: status(v.Fachstatus), approvalBasis: basis(v.Freigabebasis),
      action: oneOf(v.Wirkung, ['add'], 'action'), target: v.Zielregel,
      exportClass: oneOf(v.Exportklasse, ['referenceOnly', 'blockedScope', 'blockedEffect'], 'export class'),
      source: text(v['Quellen-ID'], 'source'), locator: text(v.Fundstelle, 'locator'),
      dayPortion: portions[v.Tagesumfang] ?? fail(`Unknown day portion: ${v.Tagesumfang}`),
      condition: conditions[v.Kalenderbedingung] ?? fail(`Unknown condition: ${v.Kalenderbedingung}`), provenance
    })),
    assignments: rows.Gebietszuordnungen.map(({ v, provenance }) => ({
      id: text(v['Zuordnungs-ID'], 'assignment'), scopeId: text(v['Geltungs-ID'], 'scope'), areaId: text(v['Gebiet-ID'], 'area'),
      ...labels(v), areaType: oneOf(v.Gebietstyp, ['Bund', 'Kanton', 'Bezirk', 'Gemeinde', 'Ortsteil', 'Gebietsgruppe'], 'area type'),
      parentAreaId: v['Übergeordnetes Gebiet'], effect: oneOf(v.Einbezug, ['include', 'exclude'], 'area effect'),
      officialIdSystem: text(v.Kennungssystem, 'identifier system', true), officialId: text(v['Amtliche Kennung'], 'official ID', true),
      from: excelDate(v['Gültig ab'], 'area from'), to: excelDate(v['Gültig bis'], 'area to', true),
      sourceId: text(v['Quellen-ID'], 'source'), locator: text(v.Fundstelle, 'locator'), status: oneOf(v.Fachstatus, ['open', 'blocked'], 'assignment status'),
      note: text(v.Prüfhinweis, 'assignment note'), provenance
    })),
    mappings: rows.Verfahrensbezug.map(({ v, provenance }) => ({
      id: text(v['Zuordnungs-ID'], 'mapping'), scope: text(v['Geltungs-ID'], 'scope'), category: oneOf(v.Rechtskategorie, CATEGORIES, 'category'),
      context: text(v.Anwendungsbereich, 'procedural context'), boundary: text(v['Wirkung / Grenze'], 'procedural boundary'),
      legalReference: text(v['Norm / Referenz'], 'procedural legal reference'), status: status(v.Fachstatus), approvalBasis: basis(v.Freigabebasis), provenance
    })),
    reviews: rows.Quellenprüfung.map(({ v, provenance }) => ({
      id: text(v['Prüf-ID'], 'review'), source: text(v['Quellen-ID'], 'source'),
      trigger: oneOf(v.Auslöser, ['newScope', 'expertClarification'], 'review trigger'),
      on: excelDate(v.Datum, 'review date'), result: oneOf(v.Ergebnis, ['unchanged', 'changed', 'unclear', 'unavailable'], 'review result'),
      comparison: basis(v.Vergleichsbasis), finding: text(v.Befund, 'finding'), status: oneOf(v.Ereignisstatus, ['candidate', 'approved', 'withdrawn'], 'review status'),
      responsible: text(v.Fachverantwortung, 'responsible'), instrument: text(v.Arbeitsinstrument, 'instrument'),
      next: text(v['Nächster Schritt'], 'next step'), provenance
    }))
  };
  validateRelations(model);
  return model;
}

export function evaluationRule(rule) {
  const { provenance, ...input } = rule;
  return input;
}

function validateRelations(m) {
  const jurisdictions = unique(m.jurisdictions, 'jurisdiction');
  assert.deepEqual([...jurisdictions.keys()].sort(), ['CH', ...CH_CANTONS].sort(), 'CH + 26 cantons required');
  for (const j of m.jurisdictions) {
    if (j.parentId !== (j.id === 'CH' ? null : 'CH')) fail(`Jurisdiction parent: ${j.id}`);
    if (j.status === 'approved' && !['CH', 'CH-BE'].includes(j.id)) fail(`Jurisdiction approval: ${j.id}`);
  }
  const sources = unique(m.sources, 'source'), scopes = unique(m.scopes, 'scope');
  for (const s of m.sources) {
    ref(jurisdictions, s.jurisdiction, 'source jurisdiction');
    if (s.status === 'approved' ? s.approvalBasis !== BASELINE || !['SRC-BUNDESFEIERTAG-19940701', 'SRC-FRG-BE-20210401'].includes(s.id)
      : s.approvalBasis !== null) fail(`Source approval: ${s.id}`);
  }
  for (const s of m.scopes) {
    ref(jurisdictions, s.jurisdiction, 'scope jurisdiction');
    const source = ref(sources, s.source, 'scope source');
    if (source.jurisdiction !== s.jurisdiction) fail(`Scope source jurisdiction: ${s.id}`);
    if (s.status === 'approved' && !['CH-ALL', 'BE-ALL'].includes(s.id)) fail(`Scope approval: ${s.id}`);
    interval(s.from, s.to, s.id);
  }
  unique(m.rules, 'rule'); unique(m.mappings, 'mapping'); unique(m.reviews, 'review');
  for (const r of m.rules) {
    const scope = ref(scopes, r.scope, 'rule scope');
    const source = ref(sources, r.source, 'rule source');
    if (scope.jurisdiction !== r.jurisdiction || ![r.jurisdiction, 'CH'].includes(source.jurisdiction)) fail(`Rule jurisdiction: ${r.id}`);
    if (r.target !== null) fail(`Unexpected target: ${r.id}`);
    if (r.status === 'approved') {
      if (r.approvalBasis !== BASELINE || r.exportClass !== 'referenceOnly'
        || !['CH-ALL', 'BE-ALL'].includes(r.scope) || r.category !== 'publicHoliday'
        || r.dayPortion !== 'fullDay' || r.condition !== 'always') fail(`Invalid historical approval: ${r.id}`);
    } else if (r.approvalBasis !== null || r.exportClass === 'referenceOnly') fail(`Inherited approval: ${r.id}`);
    if (r.dayPortion !== 'fullDay' && r.exportClass !== 'blockedEffect') fail(`Partial-day export: ${r.id}`);
    interval(r.from, r.to, r.id);
    for (const year of [2026, 2027, 2028]) evaluateRule06(evaluationRule(r), year);
  }
  for (const mapping of m.mappings) {
    ref(scopes, mapping.scope, 'mapping scope');
    if (mapping.status === 'approved' && (!['CH-ALL', 'BE-ALL'].includes(mapping.scope) || mapping.approvalBasis !== BASELINE)) fail(`Mapping approval: ${mapping.id}`);
    if (mapping.status !== 'approved' && mapping.approvalBasis !== null) fail(`Inherited mapping approval: ${mapping.id}`);
  }
  for (const review of m.reviews) {
    ref(sources, review.source, 'review source');
    if (review.status === 'approved') fail(`Review approval requires an independent basis: ${review.id}`);
  }
  validateAreas(m, scopes, sources);
}

function validateAreas(m, scopes, sources) {
  unique(m.assignments, 'assignment');
  const areas = new Map();
  for (const a of m.assignments) {
    const scope = ref(scopes, a.scopeId, 'assignment scope');
    const source = ref(sources, a.sourceId, 'assignment source');
    if (source.jurisdiction !== scope.jurisdiction) fail(`Cross-canton area source: ${a.id}`);
    interval(a.from, a.to, a.id);
    if (a.from < scope.from || (scope.to !== null && (a.to === null || a.to > scope.to))) fail(`Assignment exceeds scope: ${a.id}`);
    if (a.officialIdSystem !== '' || a.officialId !== '') fail('Unverified official identifier requires a separate contract');
    if (a.parentAreaId !== null) text(a.parentAreaId, 'parent area');
    const definition = Object.fromEntries(['areaId', 'de', 'fr', 'it', 'rm', 'areaType', 'parentAreaId', 'officialIdSystem', 'officialId'].map(k => [k, a[k]]));
    if (areas.has(a.areaId)) assert.deepEqual(areas.get(a.areaId), definition, `Conflicting area: ${a.areaId}`);
    areas.set(a.areaId, definition);
  }
  const levels = { Bund: [null], Kanton: ['Bund'], Bezirk: ['Kanton'], Gemeinde: ['Kanton', 'Bezirk'], Ortsteil: ['Gemeinde'], Gebietsgruppe: ['Kanton', 'Bezirk'] };
  for (const a of areas.values()) {
    const parent = a.parentAreaId === null ? null : ref(areas, a.parentAreaId, 'parent area');
    if (!levels[a.areaType].includes(parent?.areaType ?? null)) fail(`Invalid area level: ${a.areaId}`);
    if (a.areaType === 'Bund' && a.areaId !== 'GEO-CH') fail('Unknown federal area');
    if (a.areaType === 'Kanton' && !CH_CANTONS.includes(`CH-${a.areaId.slice(4)}`)) fail('Unknown cantonal area');
    const seen = new Set();
    for (let node = a; node; node = areas.get(node.parentAreaId)) {
      if (seen.has(node.areaId)) fail(`Area cycle: ${node.areaId}`);
      seen.add(node.areaId);
    }
  }
  const contains = (outer, inner) => {
    for (let node = areas.get(inner); node; node = areas.get(node.parentAreaId)) if (node.areaId === outer) return true;
    return false;
  };
  for (const a of m.assignments) {
    let top = areas.get(a.areaId);
    while (!['Bund', 'Kanton'].includes(top.areaType)) top = areas.get(top.parentAreaId);
    if (scopes.get(a.scopeId).jurisdiction !== (top.areaId === 'GEO-CH' ? 'CH' : `CH-${top.areaId.slice(4)}`)) fail(`Cross-canton assignment: ${a.id}`);
    if (a.effect === 'exclude' && !m.assignments.some(b => b.scopeId === a.scopeId && b.effect === 'include'
      && contains(b.areaId, a.areaId) && b.from <= a.from && (b.to === null || (a.to !== null && b.to >= a.to)))) fail(`Uncovered exclusion: ${a.id}`);
  }
  for (let i = 0; i < m.assignments.length; i++) for (const b of m.assignments.slice(i + 1)) {
    const a = m.assignments[i];
    if (a.scopeId === b.scopeId && a.areaId === b.areaId && a.from <= (b.to ?? '9999-12-31') && b.from <= (a.to ?? '9999-12-31')) fail(`Overlapping area assignments: ${a.id}/${b.id}`);
  }
  for (const scope of m.scopes) if (!m.assignments.some(a => a.scopeId === scope.id && a.effect === 'include')) fail(`Scope without area: ${scope.id}`);
}

export function verifyReferenceParity(model, calendars) {
  const refs = calendars.flatMap(c => c.rules.filter(r => r.effect.type === 'holiday'));
  const imported = model.rules.filter(r => r.exportClass === 'referenceOnly');
  assert.equal(imported.length, refs.length, 'Complete CH/BE reference rules required');
  for (const rule of imported) {
    const reference = refs.find(r => r.ruleId === rule.id);
    assert.ok(reference, `Unknown reference: ${rule.id}`);
    assert.deepEqual(rule.calculation, reference.calculation, `Reference calculation: ${rule.id}`);
    assert.deepEqual({ from: rule.from, to: rule.to }, reference.validity, `Reference validity: ${rule.id}`);
    assert.deepEqual({ de: rule.de, fr: rule.fr }, reference.labels, `Reference labels: ${rule.id}`);
    assert.deepEqual([{ sourceId: rule.source, locator: rule.locator }], reference.sourceRefs, `Reference source: ${rule.id}`);
    assert.equal(rule.jurisdiction, reference.jurisdiction.code === 'CH' ? 'CH' : `CH-${reference.jurisdiction.code}`);
    assert.equal(rule.priority, reference.priority);
  }
  return { baseline: BASELINE, unchangedHolidayRules: refs.length, runtimeFilesWritten: 0 };
}

export function verifyComputedEvidence(snapshot, model) {
  const year = snapshot.context.sheets.find(s => s.name === 'Übersicht').cells.B4.value;
  const rules = new Map(model.rules.map(r => [r.id, r]));
  const expectedDate = rule => {
    const result = evaluateRule06(evaluationRule(rule), year);
    return result.status === 'occurs'
      ? (Date.parse(`${result.date}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 86400000
      : result.status === 'notApplicable' ? 'Entfällt' : 'Ausserhalb Geltung';
  };
  for (const row of snapshot.tables.Feiertagsregeln.rows) {
    const rule = ref(rules, row.cells['Regel-ID'].value, 'computed rule');
    assert.equal(row.cells['Datum im Geltungszeitraum'].value, expectedDate(rule), `Saved rule date: ${rule.id}`);
  }
  const represented = new Set();
  for (const row of snapshot.tables.Feiertagskalender.rows) {
    const rule = ref(rules, row.cells['Regel-ID'].value, 'calendar rule');
    represented.add(rule.id);
    const expected = { Datum: expectedDate(rule), Feiertag: rule.de, Französisch: rule.fr,
      Italienisch: rule.it, 'Rumantsch Grischun': rule.rm, Rechtskategorie: rule.category,
      'Quellen-ID': rule.source, Fundstelle: rule.locator,
      Tagesumfang: DAY_PORTION_LABELS[rule.dayPortion] };
    for (const [header, value] of Object.entries(expected)) assert.equal(row.cells[header].value, value, `Saved calendar ${rule.id}/${header}`);
    // Inherited federal holiday entries carry their target profile's status,
    // not the federal rule's historic approval. Preserve this distinction.
    status(row.cells.Fachstatus.value);
  }
  assert.equal(represented.size, rules.size, 'Every rule must be represented in the workbook calendar');
  return snapshot.tables.Feiertagsregeln.rows.length + snapshot.tables.Feiertagskalender.rows.length;
}

export function createCandidate(snapshot, acceptance, calendars) {
  const model = normalizeWorkbook(snapshot);
  if (sha256(canonicalJson(acceptance)) !== ACCEPTANCE_SHA256
    || acceptance.kind !== 'workbookAcceptance' || acceptance.workbookContractVersion !== '0.6.0'
    || acceptance.runtimeEnabled !== false || snapshot.source.sha256 !== acceptance.sha256
    || snapshot.source.fileName !== acceptance.workbookFile) fail('Workbook acceptance does not match actual bytes');
  const parity = verifyReferenceParity(model, calendars);
  verifyComputedEvidence(snapshot, model);
  const sourceLinks = model.assignments.filter(a => a.sourceId !== model.scopes.find(s => s.id === a.scopeId).source).map(a => ({
    assignmentId: a.id, scopeId: a.scopeId,
    normSourceId: model.scopes.find(s => s.id === a.scopeId).source,
    areaSourceId: a.sourceId, locator: a.locator, note: a.note,
    provenance: a.provenance, status: 'preservedWorkbookEvidenceNotRuntimePermission'
  }));
  const annualOccurrences = [2026, 2027, 2028].flatMap(year => model.rules.map(rule => ({
    ruleId: rule.id, year, ...evaluateRule06(evaluationRule(rule), year)
  })));
  const candidate = {
    kind: 'holidayWorkbookCandidate', importFormatVersion: '0.1.0', workbookContractVersion: '0.6.0',
    status: 'candidate', runtimeEnabled: false, acceptance: structuredClone(acceptance),
    source: structuredClone(snapshot.source),
    data: model, areaSourceLinks: sourceLinks, annualOccurrences,
    workbookEvidence: structuredClone(snapshot),
    interpretation: {
      computedColumnsAreEvidenceOnly: true,
      inputValuesAndHistoricalStatusesPreserved: true,
      proceduralMappingsAreTextNotExecutablePermissions: true,
      sourceLinksAreNotIndependentApprovalRecords: true,
      translationsAreNotOfficialLanguageApproval: true,
      excludesWorkbookPresentationRoundTrip: true
    }
  };
  const counts = Object.fromEntries(Object.entries(snapshot.tables).map(([s, t]) => [s, t.rows.length]));
  return { candidate, report: {
    kind: 'ap18cImportValidation', status: 'passed', workbookSha256: snapshot.source.sha256,
    workbookContractVersion: '0.6.0', candidateSha256: sha256(canonicalJson(candidate)),
    counts, ruleOccurrencesChecked: annualOccurrences.length, explicitAreaSourceLinks: sourceLinks.length,
    referenceParity: parity, runtimeEligible: false,
    boundaries: [
      'Lossless semantic snapshot of all eight tables and populated non-table cells, not an XLSX presentation round trip.',
      'The 92 textual procedural mappings are not executable profiles.',
      'Separate territorial and norm sources are preserved with their original note. No independent approval record is inferred.',
      'A runtime product contract, consumer mapping and release tests remain outstanding.',
      'Historical V0.9 byte drift is a separate archive issue. Legacy hash gates are not weakened.'
    ]
  } };
}
