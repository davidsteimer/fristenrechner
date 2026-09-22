// SPDX-License-Identifier: AGPL-3.0-only
// Read-only capability check, not a new calendar implementation or legal release.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createPilotModel, ruleDate, validateModel } from './ap18a-model.mjs';
import { createAreaAssignments, validateAreaAssignments } from './ap18a-area-assignments.mjs';
import { createTiGrPackageModel } from './ap18b-ti-gr-model.mjs';

const root = process.cwd();
const file = path.join(root, 'outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx');
const digest = async name => createHash('sha256').update(await fs.readFile(name)).digest('hex');
const before = await digest(file);
assert.equal(before, 'd3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f');
const require = createRequire(path.join(root, '.work/ap18a/runtime.mjs'));
const { FileBlob, SpreadsheetFile } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')));
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
const inventory = await wb.inspect({ kind: 'sheet', include: 'id,name', maxChars: 3000 });
const ruleHeaders = wb.worksheets.getItem('Feiertagsregeln').getRange('A6:Z6').values[0];
const mapHeaders = wb.worksheets.getItem('Verfahrensbezug').getRange('A6:H6').values[0];
const areaHeaders = wb.worksheets.getItem('Gebietszuordnungen').getRange('A6:R6').values[0];
const representativeFormula = wb.worksheets.getItem('Feiertagsregeln').getRange('W7:X7').formulas[0];
assert.equal(ruleHeaders.length, 26);
assert.equal(areaHeaders.length, 18);
assert.ok(!ruleHeaders.some(value => /Tagesumfang|Tagesabschnitt/.test(value)));

const base = await createPilotModel(root);
const packageModel = await createTiGrPackageModel(root);
const sample = { from: '2000-01-01', to: null };
const nth = (year, isoWeekday, occurrence) => ruleDate({ ...sample,
  calculation: { type: 'nthWeekdayOfMonth', month: 9, isoWeekday, occurrence } }, year);
const iso = date => date.toISOString().slice(0, 10);
// Independent, bounded date oracle only. Not exported to any consumer.
const genevaFast = year => {
  for (let day = 5; day <= 11; day++) {
    const date = new Date(Date.UTC(year, 8, day));
    if (date.getUTCDay() === 4) return iso(date);
  }
  throw new Error('No Thursday in reference window');
};
const referenceCases = [
  [2026, '2026-09-10'], [2027, '2027-09-09'],
  [2028, '2028-09-07'], [2030, '2030-09-05']
];
for (const [year, expected] of referenceCases) assert.equal(genevaFast(year), expected);
const septemberStarts = new Set();
let firstThursdayMismatches = 0;
let secondThursdayMismatches = 0;
for (let year = 2000; year < 2400; year++) {
  const anchor = new Date(`${nth(year, 7, 1)}T00:00:00Z`);
  anchor.setUTCDate(anchor.getUTCDate() + 4);
  assert.equal(iso(anchor), genevaFast(year));
  septemberStarts.add(new Date(Date.UTC(year, 8, 1)).getUTCDay());
  if (nth(year, 4, 1) !== genevaFast(year)) firstThursdayMismatches++;
  if (nth(year, 4, 2) !== genevaFast(year)) secondThursdayMismatches++;
}
assert.equal(septemberStarts.size, 7);
assert.ok(firstThursdayMismatches > 0 && secondThursdayMismatches > 0);

// Characterisation of a gap, NOT a desired permanent behaviour or an XLSX importer test.
const ignoredOffset = ruleDate({ ...sample, calculation: {
  type: 'nthWeekdayOfMonth', month: 9, isoWeekday: 7, occurrence: 1, offsetDays: 4
} }, 2026);
assert.equal(ignoredOffset, '2026-09-06');
assert.throws(() => ruleDate({ ...sample, calculation: {
  type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 1, offsetDays: 4
} }, 2026), /Unsupported calculation/);
const withDayPart = structuredClone(base);
withDayPart.rules.at(-1).dayPortion = 'afternoonFromNoon';
assert.equal(validateModel(withDayPart), true);
assert.equal(ruleDate(withDayPart.rules.at(-1), 2026), ruleDate(base.rules.at(-1), 2026));

// Synthetic geography proves representability, not legal membership or geographic resolution.
const spatial = structuredClone(base);
const sourceId = 'SRC-MODELCHECK-FR';
spatial.sources.push([sourceId, 'CH-FR', 'Synthetic model check', 'No legal claim',
  'https://www.fr.ch/', null, '2026-09-13', 'Synthetic', 'open', null]);
for (const id of ['CHECK-FR-ALL', 'CHECK-FR-LOCAL']) {
  spatial.scopes.push([id, 'CH-FR', id, 'Kanton', 'Synthetic', sourceId, 'Synthetic', 'open', '2026-01-01', null]);
}
const areas = createAreaAssignments(base);
const area = (id, scopeId, areaId, name, type, parent, effect) => ({
  id, scopeId, areaId, de: name, fr: '', it: '', rm: '', areaType: type,
  parentAreaId: parent, effect, officialIdSystem: '', officialId: '',
  from: '2026-01-01', to: null, sourceId, locator: 'Synthetic', status: 'open', note: 'Not legal data'
});
areas.push(
  area('CHECK-FR-1', 'CHECK-FR-ALL', 'GEO-FR', 'Freiburg', 'Kanton', 'GEO-CH', 'include'),
  area('CHECK-FR-2', 'CHECK-FR-ALL', 'GEO-CHECK-MUNICIPALITY', 'Testgemeinde', 'Gemeinde', 'GEO-FR', 'exclude'),
  area('CHECK-FR-3', 'CHECK-FR-LOCAL', 'GEO-CHECK-PART', 'Testortsteil', 'Ortsteil', 'GEO-CHECK-MUNICIPALITY', 'include')
);
assert.equal(validateAreaAssignments(areas, spatial), true);
const badParent = structuredClone(areas);
badParent.at(-1).parentAreaId = 'GEO-FR';
assert.throws(() => validateAreaAssignments(badParent, spatial), /Invalid area hierarchy level/);
const withSourceSplit = structuredClone(areas);
const sourceSplitModel = structuredClone(spatial);
sourceSplitModel.sources.push(['SRC-MODELCHECK-FR-AREA', 'CH-FR', 'Synthetic area evidence',
  'No legal claim', 'https://www.fr.ch/', null, '2026-09-13', 'Synthetic', 'open', null]);
withSourceSplit.at(-1).sourceId = 'SRC-MODELCHECK-FR-AREA';
assert.throws(() => validateAreaAssignments(withSourceSplit, sourceSplitModel), /Assignment source differs/);

const schema = JSON.parse(await fs.readFile(path.join(root, 'schemas/calendar-rules-v2.schema.json'), 'utf8'));
assert.equal(schema.$defs.nthWeekdayOfMonth.additionalProperties, false);
assert.ok(!Object.hasOwn(schema.$defs.nthWeekdayOfMonth.properties, 'offsetDays'));
assert.equal(schema.$defs.holidayEffect.additionalProperties, false);
assert.ok(!Object.hasOwn(schema.$defs.holidayEffect.properties, 'dayPortion'));
assert.equal(await digest(file), before);
console.log(JSON.stringify({
  checkId: 'AP18B-03-MODELCHECK', checkedOn: '2026-09-13', workbook: path.relative(root, file),
  workbookSha256: before, workbookUnchanged: true, workbookInventory: inventory.ndjson,
  ruleHeaders, mappingHeaders: mapHeaders, areaHeaders, representativeFormula,
  currentPackage: { rules: packageModel.rules.length, seedContractMarker: packageModel.contractVersion,
    workbookContractNote: wb.worksheets.getItem('Übersicht').getRange('A36').values[0][0] },
  genevaFast: { referenceCases, gregorianYearsChecked: 400, septemberStartsCovered: 7,
    firstThursdayMismatches, secondThursdayMismatches, ignoredUnknownOffsetResult: ignoredOffset,
    proposedTypeRejectedByCurrentModel: true },
  gaps: { unknownRuleFieldsIgnoredByBaseValidator: true, dayPortionIgnoredInDateResult: true,
    differentAssignmentSourceRejected: true, v2SchemaRejectsNewFields: true },
  spatial: { syntheticMunicipalityAndPartAccepted: true, invalidPartParentRejected: true,
    geographicResolutionImplemented: false },
  limits: 'No XLSX writes, candidate export, app change, legal approval or new calendar implementation'
}, null, 2));
