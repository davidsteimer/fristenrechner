// SPDX-License-Identifier: AGPL-3.0-only
// Review-workbook seed only. Not an XLSX importer, geocoder or runtime data provider.
// Each scope denotes the union of its included areas minus its excluded areas.
// Spatial containment implies neither holiday inheritance nor procedural effect.
import { isDeepStrictEqual } from 'node:util';

export const BJ_HINTS_URL = 'https://www.bj.admin.ch/dam/de/sd-web/4Ad6GMn8rA0i/hinweise-kant-feiertage.pdf';

export const ASSIGNMENT_HEADERS = [
  'Zuordnungs-ID', 'Geltungs-ID', 'Gebiet-ID', 'Deutsch', 'Französisch',
  'Italienisch', 'Rumantsch Grischun', 'Gebietstyp', 'Übergeordnetes Gebiet',
  'Einbezug', 'Kennungssystem', 'Amtliche Kennung', 'Gültig ab', 'Gültig bis',
  'Quellen-ID', 'Fundstelle', 'Fachstatus', 'Prüfhinweis'
];

const fields = ['id', 'scopeId', 'areaId', 'de', 'fr', 'it', 'rm', 'areaType',
  'parentAreaId', 'effect', 'officialIdSystem', 'officialId', 'from', 'to',
  'sourceId', 'locator', 'status', 'note'];
const areaFields = ['de', 'fr', 'it', 'rm', 'areaType', 'parentAreaId',
  'officialIdSystem', 'officialId'];

export function createAreaAssignments(model) {
  const jurisdiction = code => {
    const row = model.jurisdictions.find(item => item[0] === code);
    if (!row) throw new Error(`Missing jurisdiction: ${code}`);
    return row;
  };
  const ch = jurisdiction('CH');
  const be = jurisdiction('CH-BE');
  const ag = jurisdiction('CH-AG');
  const definitions = [
    ['CH-ALL', 'GEO-CH', ch[1], ch[2], 'Bund', null, 'include'],
    ['BE-ALL', 'GEO-BE', be[1], be[2], 'Kanton', 'GEO-CH', 'include'],
    ['AG-ARG-BADEN', 'GEO-AG-BADEN', 'Bezirk Baden', '', 'Bezirk', 'GEO-AG', 'include'],
    ['AG-ARG-BADEN', 'GEO-AG-BERGDIETIKON', 'Gemeinde Bergdietikon', '', 'Gemeinde', 'GEO-AG-BADEN', 'exclude'],
    ['AG-ARG-BERGDIETIKON', 'GEO-AG-BERGDIETIKON', 'Gemeinde Bergdietikon', '', 'Gemeinde', 'GEO-AG-BADEN', 'include'],
    ['AG-ZPO-ALL', 'GEO-AG', ag[1], ag[2], 'Kanton', 'GEO-CH', 'include']
  ];
  const rows = definitions.map(([scopeId, areaId, de, fr, areaType, parentAreaId, effect], index) => {
    const scope = model.scopes.find(item => item[0] === scopeId);
    if (!scope) throw new Error(`Missing scope: ${scopeId}`);
    return {
      id: `AREA-AP18A-${String(index + 1).padStart(2, '0')}`, scopeId, areaId,
      de, fr, it: '', rm: '', areaType, parentAreaId, effect,
      officialIdSystem: '', officialId: '', from: scope[8], to: scope[9],
      sourceId: scope[5], locator: scope[6], status: 'open',
      note: 'Neue räumliche Zuordnung, fachlich zu prüfen. Interne Gebiet-ID, keine amtliche Kennung. Keine automatische Feiertagsvererbung oder Fristwirkung.'
    };
  });
  validateAreaAssignments(rows, model);
  return rows;
}

function assertDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid ISO date');
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error('Invalid ISO date');
}

function overlaps(a, b) {
  return a.from <= (b.to ?? '9999-12-31') && b.from <= (a.to ?? '9999-12-31');
}

export function validateAreaAssignments(rows, model, { sourceEvidence = [] } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Missing area assignments');
  const scopes = new Map(model.scopes.map(row => [row[0], row]));
  const sources = new Map(model.sources.map(row => [row[0], row]));
  // A separate territorial source is allowed only for an explicitly checked
  // relationship in contract 0.5.0. Merely being a known source is insufficient.
  if (!Array.isArray(sourceEvidence)) throw new Error('Invalid area source evidence');
  if (sourceEvidence.length && model.contractVersion !== '0.5.0') throw new Error('Source evidence requires contract 0.5.0');
  const evidenceFields = ['assignmentId', 'scopeId', 'normSourceId', 'areaSourceId',
    'locator', 'checkedOn', 'checkedBy', 'note'];
  const evidenceByAssignment = new Map();
  for (const evidence of sourceEvidence) {
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)
      || Object.keys(evidence).length !== evidenceFields.length
      || evidenceFields.some(field => !Object.hasOwn(evidence, field)
        || typeof evidence[field] !== 'string' || !evidence[field].trim())) {
      throw new Error('Incomplete area source evidence');
    }
    if (evidenceByAssignment.has(evidence.assignmentId)) throw new Error('Duplicate area source evidence');
    const assignment = rows.find(row => row.id === evidence.assignmentId);
    const scope = scopes.get(evidence.scopeId);
    const normSource = sources.get(evidence.normSourceId);
    const areaSource = sources.get(evidence.areaSourceId);
    if (!assignment || !scope || !normSource || !areaSource
      || assignment.scopeId !== evidence.scopeId || scope[5] !== evidence.normSourceId
      || assignment.sourceId !== evidence.areaSourceId || assignment.locator !== evidence.locator
      || evidence.normSourceId === evidence.areaSourceId) {
      throw new Error('Unmatched area source evidence');
    }
    if (normSource[1] !== scope[1] || areaSource[1] !== scope[1]) throw new Error('Cross-jurisdiction area source evidence');
    assertDate(evidence.checkedOn);
    evidenceByAssignment.set(evidence.assignmentId, evidence);
  }
  const jurisdictionAreas = new Map(model.jurisdictions.map(row => [
    row[0] === 'CH' ? 'GEO-CH' : `GEO-${row[0].slice(3)}`, row[0]
  ]));
  const ids = new Set();
  const areas = new Map();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)
      || Object.keys(row).length !== fields.length || fields.some(field => !Object.hasOwn(row, field))) {
      throw new Error('Invalid assignment fields');
    }
    for (const field of fields.filter(field => !['parentAreaId', 'to'].includes(field))) {
      if (typeof row[field] !== 'string') throw new Error(`Invalid assignment text: ${field}`);
    }
    if (!row.id || !row.areaId || !row.de || !row.locator || !row.note) throw new Error('Incomplete assignment');
    if (ids.has(row.id)) throw new Error(`Duplicate assignment ID: ${row.id}`);
    ids.add(row.id);
    const scope = scopes.get(row.scopeId);
    if (!scope) throw new Error(`Unknown assignment scope: ${row.scopeId}`);
    if (!sources.has(row.sourceId)) throw new Error(`Unknown assignment source: ${row.sourceId}`);
    if (row.sourceId !== scope[5] && !evidenceByAssignment.has(row.id)) throw new Error('Assignment source differs from scope source');
    if (!['include', 'exclude'].includes(row.effect)) throw new Error('Unknown assignment effect');
    if (!['Bund', 'Kanton', 'Bezirk', 'Gemeinde', 'Ortsteil', 'Gebietsgruppe'].includes(row.areaType)) throw new Error('Unknown area type');
    if (row.status === 'approved') throw new Error('Assignment approval has no independent approval basis');
    if (!['open', 'blocked'].includes(row.status)) throw new Error('Unknown assignment status');
    if (row.officialIdSystem !== '' || row.officialId !== '') throw new Error('Official identifiers are not verified in this seed');
    if (row.parentAreaId !== null && (typeof row.parentAreaId !== 'string' || !row.parentAreaId)) throw new Error('Invalid parent area');
    assertDate(row.from);
    if (row.to !== null) { assertDate(row.to); if (row.to < row.from) throw new Error('Reversed assignment validity'); }
    if (row.from < scope[8] || (scope[9] !== null && (row.to === null || row.to > scope[9]))) {
      throw new Error('Assignment validity exceeds scope validity');
    }
    const metadata = Object.fromEntries(areaFields.map(field => [field, row[field]]));
    if (areas.has(row.areaId) && !isDeepStrictEqual(areas.get(row.areaId).metadata, metadata)) {
      throw new Error(`Inconsistent repeated area metadata: ${row.areaId}`);
    }
    areas.set(row.areaId, { row, metadata });
  }
  for (const { row } of areas.values()) {
    if (row.parentAreaId !== null && !areas.has(row.parentAreaId)) throw new Error(`Unknown parent area: ${row.parentAreaId}`);
    const seen = new Set();
    let cursor = row;
    while (cursor) {
      if (seen.has(cursor.areaId)) throw new Error(`Area hierarchy cycle: ${cursor.areaId}`);
      seen.add(cursor.areaId);
      cursor = cursor.parentAreaId === null ? null : areas.get(cursor.parentAreaId)?.row;
    }
  }
  for (const { row } of areas.values()) {
    const parent = areas.get(row.parentAreaId)?.row;
    // Reserved types do not add delivered records or resolve group membership.
    const allowed = { Bund: [null], Kanton: ['Bund'], Bezirk: ['Kanton'],
      Gemeinde: ['Kanton', 'Bezirk'], Ortsteil: ['Gemeinde'], Gebietsgruppe: ['Kanton', 'Bezirk'] };
    if (!allowed[row.areaType].includes(parent?.areaType ?? null)) throw new Error('Invalid area hierarchy level');
    if (row.areaType === 'Bund' && row.areaId !== 'GEO-CH') throw new Error('Unknown federal area');
    if (row.areaType === 'Kanton' && !jurisdictionAreas.has(row.areaId)) throw new Error('Unknown cantonal area');
  }
  const contains = (ancestorId, descendantId) => {
    let cursor = areas.get(descendantId)?.row;
    while (cursor) {
      if (cursor.areaId === ancestorId) return true;
      cursor = areas.get(cursor.parentAreaId)?.row;
    }
    return false;
  };
  for (const row of rows) {
    const scope = scopes.get(row.scopeId);
    let cursor = areas.get(row.areaId).row;
    while (!['Bund', 'Kanton'].includes(cursor.areaType)) cursor = areas.get(cursor.parentAreaId).row;
    if (scope[1] !== jurisdictionAreas.get(cursor.areaId)) throw new Error('Cross-canton assignment scope');
    if (row.effect === 'exclude' && !rows.some(included => included.scopeId === row.scopeId
      && included.effect === 'include' && included.from <= row.from
      && (included.to === null || (row.to !== null && included.to >= row.to))
      && contains(included.areaId, row.areaId))) {
      throw new Error('Excluded area is not contained in a temporally covering inclusion');
    }
  }
  for (let index = 0; index < rows.length; index++) {
    for (const other of rows.slice(index + 1)) {
      const row = rows[index];
      if (row.scopeId === other.scopeId && row.areaId === other.areaId && overlaps(row, other)) {
        throw new Error(row.effect === other.effect ? 'Duplicate assignment target' : 'Contradictory assignment target');
      }
    }
  }
  return true;
}
