// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createPilotModel } from '../../scripts/ap18a-model.mjs';
import { ASSIGNMENT_HEADERS, BJ_HINTS_URL, createAreaAssignments,
  validateAreaAssignments } from '../../scripts/ap18a-area-assignments.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const model = await createPilotModel(root);
const assignments = createAreaAssignments(model);
const clone = value => structuredClone(value);
const reject = (name, mutate, error) => it(name, () => {
  const rows = clone(assignments);
  const candidate = clone(model);
  mutate(rows, candidate);
  assert.throws(() => validateAreaAssignments(rows, candidate), error ?? Error);
});

describe('AP18A räumliche Zuordnungen: begrenzter Erfassungsstand', () => {
  it('liefert sechs Zuordnungen mit den vereinbarten 18 Feldern in Spaltenreihenfolge', () => {
    assert.equal(assignments.length, 6);
    assert.equal(ASSIGNMENT_HEADERS.length, 18);
    const fields = ['id', 'scopeId', 'areaId', 'de', 'fr', 'it', 'rm', 'areaType',
      'parentAreaId', 'effect', 'officialIdSystem', 'officialId', 'from', 'to',
      'sourceId', 'locator', 'status', 'note'];
    for (const row of assignments) assert.deepEqual(Object.keys(row), fields);
    assert.equal(validateAreaAssignments(assignments, model), true);
  });

  it('beschränkt sich auf bereits bestehende CH-, BE- und AG-Geltungsbereiche', () => {
    assert.deepEqual(assignments.map(row => [row.scopeId, row.areaId, row.effect]), [
      ['CH-ALL', 'GEO-CH', 'include'], ['BE-ALL', 'GEO-BE', 'include'],
      ['AG-ARG-BADEN', 'GEO-AG-BADEN', 'include'],
      ['AG-ARG-BADEN', 'GEO-AG-BERGDIETIKON', 'exclude'],
      ['AG-ARG-BERGDIETIKON', 'GEO-AG-BERGDIETIKON', 'include'],
      ['AG-ZPO-ALL', 'GEO-AG', 'include']
    ]);
  });

  it('übernimmt Quellen, Fundstellen und Gültigkeit aus dem jeweils bestehenden Scope', () => {
    for (const row of assignments) {
      const scope = model.scopes.find(item => item[0] === row.scopeId);
      assert.deepEqual([row.from, row.to, row.sourceId, row.locator], [scope[8], scope[9], scope[5], scope[6]]);
    }
  });

  it('hält neue Zuordnungen offen und übernimmt keine bestehende Fachfreigabe', () => {
    assert.ok(assignments.every(row => row.status === 'open'));
    assert.ok(model.scopes.some(scope => scope[7] === 'approved'));
    assert.ok(assignments.every(row => !Object.hasOwn(row, 'approvalBasis')));
  });

  it('erfindet keine amtlichen Kennungen oder unbekannten Übersetzungen', () => {
    assert.ok(assignments.every(row => row.officialIdSystem === '' && row.officialId === ''
      && row.it === '' && row.rm === ''));
    assert.ok(assignments.filter(row => ['Bezirk', 'Gemeinde'].includes(row.areaType)).every(row => row.fr === ''));
    assert.equal(assignments[0].fr, 'Confédération');
    assert.equal(assignments[1].fr, 'Berne');
    assert.equal(assignments[5].fr, 'Argovie');
  });

  it('trennt eine Gemeindezuordnung vom Ausschluss in einem anderen Geltungsbereich', () => {
    const rows = assignments.filter(row => row.areaId === 'GEO-AG-BERGDIETIKON');
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.map(row => row.effect), ['exclude', 'include']);
    assert.ok(rows.every(row => row.parentAreaId === 'GEO-AG-BADEN'));
    assert.equal(validateAreaAssignments(assignments, model), true);
  });

  it('lässt Referenzmodell und produktive Datengrundlage unverändert', () => {
    const copy = clone(model);
    createAreaAssignments(model);
    assert.deepEqual(model, copy);
    assert.ok(assignments.every(row => !Object.hasOwn(row, 'holidays') && !Object.hasOwn(row, 'proceduralEffect')));
  });

  it('führt die geprüfte Ersatzadresse des BJ-Hinweisdokuments als Konstante', () => {
    assert.equal(BJ_HINTS_URL, 'https://www.bj.admin.ch/dam/de/sd-web/4Ad6GMn8rA0i/hinweise-kant-feiertage.pdf');
  });

  it('reserviert Ortsteile unter Gemeinden ohne den ausgelieferten Pilotumfang zu erweitern', () => {
    const rows = clone(assignments);
    rows.push({ ...clone(rows[4]), id: 'TEST-ORTSTEIL', areaId: 'TEST-GEO-ORTSTEIL',
      de: 'Synthetischer Testortsteil', areaType: 'Ortsteil', parentAreaId: 'GEO-AG-BERGDIETIKON' });
    assert.equal(validateAreaAssignments(rows, model), true);
    assert.equal(createAreaAssignments(model).length, 6);
  });

  it('reserviert Gebietsgruppen unter Kanton oder Bezirk ohne implizite Mitgliedschaft', () => {
    for (const parentAreaId of ['GEO-AG', 'GEO-AG-BADEN']) {
      const rows = clone(assignments);
      rows.push({ ...clone(rows[4]), id: 'TEST-GRUPPE', areaId: 'TEST-GEO-GRUPPE',
        de: 'Synthetische Testgruppe', areaType: 'Gebietsgruppe', parentAreaId });
      assert.equal(validateAreaAssignments(rows, model), true);
      assert.ok(!Object.hasOwn(rows.at(-1), 'members'));
    }
    assert.equal(createAreaAssignments(model).length, 6);
  });
});

describe('AP18A räumliche Zuordnungen: negative Vertragsfälle', () => {
  reject('weist doppelte Zuordnungs-IDs ab', rows => rows.push(clone(rows[0])), /Duplicate assignment ID/);
  reject('weist fehlende Geltungsbereiche ab', rows => { rows[0].scopeId = 'UNKNOWN'; }, /Unknown assignment scope/);
  reject('weist fehlende Quellen ab', rows => { rows[0].sourceId = 'UNKNOWN'; }, /Unknown assignment source/);
  reject('weist unpassende existierende Quellen ab', rows => { rows[0].sourceId = rows[1].sourceId; }, /source differs/);
  reject('weist unbekannte Elterngebiete ab', rows => { rows[2].parentAreaId = 'GEO-UNKNOWN'; }, /Unknown parent area/);
  reject('weist Zyklen in der Hierarchie ab', rows => { rows[5].parentAreaId = 'GEO-AG-BADEN'; }, /hierarchy cycle/);
  reject('weist kantonsfremde Gebietszuteilungen ab', rows => { rows[2].parentAreaId = 'GEO-BE'; }, /Cross-canton/);
  reject('weist unbekannte Einbezugsarten ab', rows => { rows[0].effect = 'inherit'; }, /Unknown assignment effect/);
  reject('weist unbelegte Freigaben ab', rows => { rows[0].status = 'approved'; }, /no independent approval basis/);
  reject('weist unbekannte Status ab', rows => { rows[0].status = 'verified'; }, /Unknown assignment status/);
  reject('weist ungültige Kalenderdaten ab', rows => { rows[1].from = '2026-02-30'; }, /Invalid ISO date/);
  reject('weist umgekehrte Gültigkeitsintervalle ab', rows => { rows[1].to = '2025-12-31'; }, /Reversed assignment validity/);
  reject('weist Gültigkeit vor dem Scope ab', rows => { rows[1].from = '2025-12-31'; }, /exceeds scope/);
  reject('weist offene Gültigkeit nach einem befristeten Scope ab', (rows, candidate) => {
    candidate.scopes.find(scope => scope[0] === 'BE-ALL')[9] = '2026-12-31';
  }, /exceeds scope/);
  reject('weist inkonsistente Metadaten desselben Gebiets ab', rows => { rows[4].de = 'Anderes Gebiet'; }, /Inconsistent repeated area metadata/);
  reject('weist gegensätzliche Einbezüge desselben Ziels im selben Scope ab', rows => {
    rows.push({ ...clone(rows[3]), id: 'AREA-CONTRADICTION', effect: 'include' });
  }, /Contradictory assignment target/);
  reject('weist doppelte überlappende Zielzuordnungen ab', rows => {
    rows.push({ ...clone(rows[0]), id: 'AREA-DUPLICATE' });
  }, /Duplicate assignment target/);
  reject('weist einen Ausschluss ohne räumlich passenden Einbezug ab', rows => {
    rows[2].effect = 'exclude';
  }, /not contained/);
  reject('weist einen Ausschluss ausserhalb der zeitlichen Inklusion ab', rows => {
    rows[2].to = '2026-06-30';
  }, /not contained/);
  reject('weist unbekannte Gebietstypen ab', rows => { rows[0].areaType = 'Planet'; }, /Unknown area type/);
  reject('weist einen Bezirk unmittelbar unter dem Bund ab', rows => { rows[2].parentAreaId = 'GEO-CH'; }, /hierarchy level/);
  reject('weist einen Ortsteil unmittelbar unter einem Bezirk ab', rows => {
    rows.push({ ...clone(rows[4]), id: 'TEST-ORTSTEIL', areaId: 'TEST-GEO-ORTSTEIL',
      de: 'Synthetischer Testortsteil', areaType: 'Ortsteil', parentAreaId: 'GEO-AG-BADEN' });
  }, /hierarchy level/);
  reject('weist eine Gebietsgruppe unmittelbar unter einer Gemeinde ab', rows => {
    rows.push({ ...clone(rows[4]), id: 'TEST-GRUPPE', areaId: 'TEST-GEO-GRUPPE',
      de: 'Synthetische Testgruppe', areaType: 'Gebietsgruppe', parentAreaId: 'GEO-AG-BERGDIETIKON' });
  }, /hierarchy level/);
  reject('weist nicht geprüfte amtliche Kennungen ab', rows => { rows[1].officialIdSystem = 'BFS'; rows[1].officialId = '9999'; }, /not verified/);
  reject('weist fehlende Vertragsfelder ab', rows => { delete rows[0].note; }, /Invalid assignment fields/);
  reject('weist zusätzliche Wirkungsfelder ab', rows => { rows[0].proceduralEffect = true; }, /Invalid assignment fields/);
  reject('weist leere Fundstellen ab', rows => { rows[0].locator = ''; }, /Incomplete assignment/);
});
