// SPDX-License-Identifier: AGPL-3.0-only
// AP22A read-only model probes. No new runtime or legal selection is implemented.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { assertHolidayCatalog, evaluateHolidayCatalogRule, isHolidayCatalogScopeMember,
  projectHolidayRules } from '../src/core/holidayCatalog.ts';
import { createCalculationData } from '../src/core/data.ts';

const root = process.cwd();
const out = path.join(root, 'outputs/ap22a-abschluss-2026-10-02');
const input = 'data/releases/2026-10-01-mvp-06-approved.1/holiday-catalogs/ch-holiday-catalog.json';
const bytes = await fs.readFile(path.join(root, input));
const catalog = JSON.parse(bytes);
const digest = value => createHash('sha256').update(value).digest('hex');
const results = [];
function check(id, description, action) {
  action();
  results.push({ id, description, status: 'passed' });
}
function rule(id) {
  const found = catalog.data.rules.find(row => row.id === id);
  assert.ok(found, id);
  return found;
}
function occurs(id, year, expected) {
  assert.deepEqual(evaluateHolidayCatalogRule(rule(id), year),
    { status: expected === null ? 'notApplicable' : 'occurs', date: expected });
}
check('M01', 'Unveränderter 479-Regeln-Katalog erfüllt seinen alten Vertrag', () => {
  assertHolidayCatalog(catalog);
  assert.equal(catalog.data.rules.length, 479);
  assert.equal(catalog.data.scopes.length, 49);
});
check('M02', 'Alte Projektion liefert exakt zwölf CH-/BE-Feiertagsregeln', () => {
  assert.equal(projectHolidayRules(catalog).length, 12);
});
check('M03', 'Genfer Bettag braucht Wochentag plus Offset', () => {
  occurs('GE-CAL-DAY-GENEVA-FAST', 2026, '2026-09-10');
  occurs('GE-CAL-DAY-GENEVA-FAST', 2027, '2027-09-09');
});
check('M04', 'Bettagsmontag VD und NE datierbar, noch keine neue Verfahrensfreigabe', () => {
  for (const id of ['VD-LEMP-ALL-DAY-FEDERAL-FAST-MONDAY','NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY']) {
    occurs(id, 2026, '2026-09-21');
  }
});
check('M05', 'AR und AI 2026/2027/2028 mit gesetzlicher Bedingung', () => {
  for (const id of ['AR-ARG-ALL-DAY-ST-STEPHEN','AI-RTG-ALL-DAY-ST-STEPHEN']) {
    occurs(id, 2026, null);
    occurs(id, 2027, '2027-12-26');
    occurs(id, 2028, null);
  }
});
check('M06', 'GL verschiebt den ersten April-Donnerstag aus der Karwoche', () => {
  occurs('GL-RTG-ALL-DAY-NAEFELSER-FAHRT', 2026, '2026-04-09');
  occurs('GL-RTG-ALL-DAY-NAEFELSER-FAHRT', 2027, '2027-04-01');
});
check('M07', 'NE Ersatzfeiertage bleiben bedingte Regeln', () => {
  const ny = 'NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE';
  occurs(ny, 2026, null);
  occurs(ny, 2029, null);
  occurs(ny, 2034, '2034-01-02');
  const xmas = 'NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE';
  occurs(xmas, 2026, null);
  occurs(xmas, 2033, '2033-12-26');
});
check('M08', 'Rheinfelder Teilgebiete bleiben voneinander getrennt', () => {
  assert.equal(isHolidayCatalogScopeMember(catalog,'AG-ARG-RHEINFELDEN-E1','GEO-AG-GEMEINDE-HELLIKON','2026-11-01'),true);
  assert.equal(isHolidayCatalogScopeMember(catalog,'AG-ARG-RHEINFELDEN-E2','GEO-AG-GEMEINDE-HELLIKON','2026-11-01'),false);
  assert.equal(isHolidayCatalogScopeMember(catalog,'AG-ARG-RHEINFELDEN-E2','GEO-AG-GEMEINDE-MAGDEN','2026-11-01'),true);
});
check('M09', 'Le Landeron ist eine örtliche Ergänzung, nicht der ganze Kanton', () => {
  assert.equal(isHolidayCatalogScopeMember(catalog,'NE-LANDERON-ADDITIONAL','GEO-NE-LE-LANDERON','2026-06-04'),true);
  assert.equal(isHolidayCatalogScopeMember(catalog,'NE-LANDERON-ADDITIONAL','GEO-NE','2026-06-04'),false);
});
check('M10', 'Unbekanntes Gebiet liefert keinen stillen Standard', () => {
  assert.throws(() => isHolidayCatalogScopeMember(catalog,'NE-LANDERON-ADDITIONAL','GEO-NOT-MODELLED','2026-06-04'));
});
check('M11', 'Operative Freigabe ist im alten Katalog nicht durch Umetikettierung einschleusbar', () => {
  const changed = structuredClone(catalog);
  const target = changed.data.rules.find(row => row.id === 'GL-RTG-ALL-DAY-NAEFELSER-FAHRT');
  target.status = 'approved';
  target.approvalBasis = 'DEC-2026-028';
  assert.throws(() => assertHolidayCatalog(changed));
});
check('M12', 'Alter Kern weist vorgeschlagenes Manifest-Hauptformat 7 zurück', () => {
  assert.throws(() => createCalculationData({formatVersion:'7.0.0'}),/Nicht unterstützte Hauptversion/);
});
check('M13', 'Regelgültigkeit wird nicht durch reine Jahresdatierung erweitert', () => {
  assert.deepEqual(evaluateHolidayCatalogRule(rule('GE-CAL-DAY-GENEVA-FAST'),2025),
    {status:'outsideValidity',date:null});
});
check('M14', 'Alle Katalogregeln sind für 2026 bis 2028 datierbar', () => {
  for (const entry of catalog.data.rules) for (const year of [2026,2027,2028]) {
    const found = evaluateHolidayCatalogRule(entry,year);
    assert.ok(['occurs','notApplicable','outsideValidity'].includes(found.status));
    if (found.status === 'occurs') assert.match(found.date,/^\d{4}-\d{2}-\d{2}$/);
  }
});
assert.equal(digest(await fs.readFile(path.join(root,input))),digest(bytes));
await fs.mkdir(out,{recursive:true});
const regressionFiles = ['tests/core/holiday-catalog.test.ts','tests/core/calendar-rules.test.ts','tests/core/ap18c-integration.test.ts'];
const regression = execFileSync(process.execPath,['--import','tsx','--test',...regressionFiles],{cwd:root,encoding:'utf8',maxBuffer:5_000_000});
await fs.writeFile(path.join(out,'existing-regression.txt'),regression);
const count = label => Number(regression.match(new RegExp('(?:#|ℹ) '+label+' (\\d+)'))?.[1]);
assert.equal(count('fail'),0);
assert.equal(count('pass'),220);
const report = { kind:'ap22a-existing-model-check', performedOn:'2026-10-02',
  input:{path:input,sha256:digest(bytes)}, results,
  regression:{files:regressionFiles,passed:count('pass'),failed:count('fail'),log:'existing-regression.txt'},
  scope:'Existing catalog evaluator, geographic membership and legacy rejection only. No new product resolver or future contract implemented.',
  productActivation:false };
await fs.writeFile(path.join(out,'model-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:results.length,failed:0,report:'outputs/ap22a-abschluss-2026-10-02/model-check.json'}));
