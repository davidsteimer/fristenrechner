// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULTS_STORAGE_KEY, clearDefaults, initialDefaults, loadDefaults, sanitizeDefaults,
  saveDefaults, type StorageLike, type StoredDefaults
} from '../../src/ui/defaults';
import { loadCalculationData } from '../core/fixtures';
import { calculationData as currentData } from '../../src/ui/preview/data';

class MemoryStorage implements StorageLike {
  public readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
  public removeItem(key: string): void { this.values.delete(key); }
}

const data = loadCalculationData();
const emptyContext = { role: '', canton: '', areaFacts: {} };

describe('AP22C2: explizite Defaults v4 ohne erfundene Fallfakten', () => {
  it('behält den v3-Pfad ohne aktivierten Kalendervertrag unverändert', () => {
    const defaults = initialDefaults(data);
    assert.equal(defaults.version, 3);
    assert.equal('calendarContext' in defaults, false);
    assert.equal(defaults.calendarId, 'be-public-holidays');
  });

  it('startet v4 ohne Rolle, Feiertagskanton oder regionale Tatsachen', () => {
    const defaults = initialDefaults(data, true);
    assert.equal(defaults.version, 4);
    assert.equal(defaults.authorityCode, 'BE');
    assert.deepEqual(defaults.calendarContext, emptyContext);
    assert.equal('inputDate' in defaults, false);
    assert.equal('reference' in defaults, false);
  });

  for (const version of [1, 2, 3]) {
    it(`migriert v${version} mit BE-Kalender ohne Rollen-/Ortsinferenz`, () => {
      const old = {
        ...initialDefaults(data), version, locale: 'fr', deadlineDays: 30,
        calendarId: 'be-public-holidays', authorityCode: 'BE', profileId: 'stpo',
        selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
        // A field smuggled into an older version is not an explicit v4 choice.
        calendarContext: { role: 'qualifiedServiceRepresentative', canton: 'BE', areaFacts: { 'AI-RTG-INNER-ADDITIONAL': true } },
        inputDate: '2027-01-01', reference: 'CASE-SECRET', mandateChangedOn: '2026-10-01'
      };
      const result = sanitizeDefaults(data, old, true);
      assert.equal(result.version, 4);
      assert.equal(result.locale, 'fr');
      assert.equal(result.deadlineDays, 30);
      assert.equal(result.profileId, 'stpo');
      assert.equal(result.authorityCode, 'BE');
      assert.equal(result.selectors.deliveryMethod, 'otherLegallyRelevantDate');
      assert.deepEqual(result.calendarContext, emptyContext);
      assert.equal('inputDate' in result, false);
      assert.equal('reference' in result, false);
      assert.equal('mandateChangedOn' in result, false);
    });
  }

  it('interpretiert Bund weder als Feiertagskanton CH noch als Ersatz für Bern', () => {
    const result = sanitizeDefaults(data, { ...initialDefaults(data), authorityCode: 'CH', calendarId: 'ch-federal-calendar' }, true);
    assert.equal(result.authorityCode, 'CH');
    assert.deepEqual(result.calendarContext, emptyContext);
  });

  it('erhält eine gültige ausdrücklich gespeicherte Rolle und ihren Kantonsort', () => {
    const storage = new MemoryStorage();
    const defaults: StoredDefaults = {
      ...initialDefaults(data, true), locale: 'fr', deadlineDays: 20, authorityCode: 'ZH',
      calendarContext: { role: 'qualifiedServiceRepresentative', canton: 'NE', areaFacts: { 'NE-LANDERON-ADDITIONAL': true } }
    };
    assert.equal(saveDefaults(storage, defaults), true);
    const raw = storage.getItem(DEFAULTS_STORAGE_KEY) ?? '';
    const saved = JSON.parse(raw);
    assert.equal(saved.version, 4);
    assert.deepEqual(saved.calendarContext, { role: 'qualifiedServiceRepresentative', canton: 'NE' });
    assert.equal('areaFacts' in saved.calendarContext, false);
    assert.equal('calendarId' in saved, false);
    const loaded = loadDefaults(data, storage, true);
    assert.equal(loaded.authorityCode, 'ZH');
    assert.equal(loaded.locale, 'fr');
    assert.equal(loaded.deadlineDays, 20);
    assert.deepEqual(loaded.calendarContext, { role: 'qualifiedServiceRepresentative', canton: 'NE', areaFacts: {} });
  });

  it('übernimmt regionale Mitgliedschaft auch bei v4 niemals als Fallfaktum', () => {
    for (const member of [true, false]) {
      const value = { ...initialDefaults(data, true), calendarContext: {
        role: 'partyWithoutRepresentative', canton: 'AI', areaFacts: { 'AI-RTG-INNER-ADDITIONAL': member }
      } };
      assert.deepEqual(sanitizeDefaults(data, value, true).calendarContext,
        { role: 'partyWithoutRepresentative', canton: 'AI', areaFacts: {} });
    }
  });

  it('speichert weder Datum noch Referenz, Mandatsnachweise, Overridestext oder Bestätigungen', () => {
    const storage = new MemoryStorage();
    const defaults = {
      ...initialDefaults(data, true), inputDate: '2027-01-03', reference: 'CASE-SECRET',
      mandateChangedOn: '2026-10-01', specialDateValues: { decision: '2027-01-03' },
      calendarOverrideReason: 'OVERRIDE-SECRET', holidayAnchorConfirmed: true,
      calendarContext: { role: 'partyWithoutRepresentative', canton: 'BE', areaFacts: {},
        mandateChangedOn: '2026-10-01', reference: 'CONTEXT-SECRET' },
      selectors: { deliveryMethod: 'otherLegallyRelevantDate', hearingDate: '2027-01-03', arbitrarySecret: 'SELECTOR-SECRET' }
    } as StoredDefaults;
    assert.equal(saveDefaults(storage, defaults), true);
    const raw = storage.getItem(DEFAULTS_STORAGE_KEY) ?? '';
    assert.doesNotMatch(raw, /SECRET|inputDate|reference|mandateChangedOn|specialDateValues|OverrideReason|Confirmed|hearingDate|arbitrarySecret/);
    assert.equal(JSON.parse(raw).selectors.deliveryMethod, 'otherLegallyRelevantDate');
  });

  it('verwirft offene Mandats-/Mehrortprobleme als persönliche Rollenvorgabe', () => {
    const storage = new MemoryStorage();
    for (const role of ['mandateChange', 'nonProfessionalDifferentPlaces', 'personalActUnqualified',
      'unqualifiedRepresentation', 'unresolvedMultiplePlaces', 'missingParty', 'missingCourt', 'invented']) {
      const defaults = { ...initialDefaults(data, true), calendarContext: { role, canton: 'BE', areaFacts: {} } } as StoredDefaults;
      assert.equal(saveDefaults(storage, defaults), true);
      const result = loadDefaults(data, storage, true);
      assert.equal(result.calendarContext?.role, '');
      assert.equal(result.calendarContext?.canton, 'BE');
    }
  });

  it('validiert Rollen profilbezogen, ohne eine andere Rolle zu erfinden', () => {
    for (const [profileId, role, expected] of [
      ['zpo', 'court', 'court'], ['zpo', 'qualifiedServiceRepresentative', ''],
      ['stpo', 'court', ''], ['bgg', 'partyWithoutRepresentative', 'partyWithoutRepresentative'],
      ['vwvg', 'qualifiedServiceRepresentative', 'qualifiedServiceRepresentative'], ['vrpg-be', 'court', '']
    ]) {
      const value = { ...initialDefaults(currentData, true), profileId,
        calendarContext: { role, canton: 'BE', areaFacts: {} } };
      assert.equal(sanitizeDefaults(currentData, value, true).calendarContext?.role, expected);
    }
  });

  it('verwirft Bund, Pseudokantone und falsch typisierte Kontextfelder', () => {
    for (const canton of ['CH', 'CH-BE', 'be', 'ZZ', null, {}, 42]) {
      const result = sanitizeDefaults(data, { ...initialDefaults(data, true),
        calendarContext: { role: 'partyWithoutRepresentative', canton, areaFacts: [] } }, true);
      assert.equal(result.calendarContext?.canton, '');
      assert.deepEqual(result.calendarContext?.areaFacts, {});
    }
    for (const context of [null, false, [], 'BE', 42]) {
      assert.deepEqual(sanitizeDefaults(data, { ...initialDefaults(data, true), calendarContext: context }, true).calendarContext,
        emptyContext);
    }
  });

  it('erhält die 26 Behördenkantone nur im neuen Kontext und erweitert keine kantonalen Profile', () => {
    for (const code of 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ')) {
      const result = sanitizeDefaults(data, { ...initialDefaults(data, true), authorityCode: code }, true);
      assert.equal(result.authorityCode, code);
      assert.equal(result.profileId, 'stpo');
      assert.deepEqual(result.calendarContext, emptyContext);
    }
    const wrongProfile = sanitizeDefaults(currentData,
      { ...initialDefaults(currentData, true), authorityCode: 'ZH', profileId: 'vrpg-be' }, true);
    assert.equal(wrongProfile.profileId, 'stpo');
  });

  it('lässt eine historische Oberfläche gemeinsame v4-Angaben ohne Kontext wiederverwenden', () => {
    const value = { ...initialDefaults(data, true), locale: 'fr', authorityCode: 'BE', deadlineDays: 20,
      calendarContext: { role: 'partyWithoutRepresentative', canton: 'GR', areaFacts: {} } };
    const legacy = sanitizeDefaults(data, value);
    assert.equal(legacy.version, 3);
    assert.equal(legacy.locale, 'fr');
    assert.equal(legacy.deadlineDays, 20);
    assert.equal(legacy.authorityCode, 'BE');
    assert.equal('calendarContext' in legacy, false);
  });

  it('liest Migration ohne stillen Speicher-Schreibvorgang', () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify({ ...initialDefaults(data), locale: 'fr' });
    storage.setItem(DEFAULTS_STORAGE_KEY, raw);
    assert.equal(loadDefaults(data, storage, true).version, 4);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), raw);
  });

  it('liefert bei fehlendem, beschädigtem oder blockiertem Speicher ungelöste v4-Ausgangswerte', () => {
    const storage = new MemoryStorage();
    for (const raw of ['{', 'null', '{"version":99}', '[1,2]', '{}']) {
      storage.setItem(DEFAULTS_STORAGE_KEY, raw);
      assert.deepEqual(loadDefaults(data, storage, true).calendarContext, emptyContext);
    }
    assert.equal(loadDefaults(data, undefined, true).version, 4);
    const blocked: StorageLike = {
      getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); }
    };
    assert.deepEqual(loadDefaults(data, blocked, true).calendarContext, emptyContext);
    assert.equal(saveDefaults(blocked, initialDefaults(data, true)), false);
    assert.equal(clearDefaults(blocked), false);
  });
});
