// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mvp07CalculationData } from '../../src/release/mvp07ReleaseData';
import { DEFAULTS_STORAGE_KEY, saveDefaults, initialDefaults } from '../../src/ui/defaults';
import {
  ADMINISTRATIVE_DEFAULTS_STORAGE_KEY as KEY, emptyAdministrativePreferences,
  initializeAdministrativeDefaults as initialize, saveAdministrativeDefaults as save, resetAdministrativeDefaults as reset,
  type AdministrativeDefaultsContext, type AdministrativePreferences
} from '../../src/ui/administrativeDefaults';
import { createSyntheticFormat8Context } from '../core/ap23d1Fixtures';

class MemoryStorage {
  readonly values = new Map<string, string>();
  readonly reads: string[] = [];
  readonly writes: string[] = [];
  readonly removes: string[] = [];
  readBlocked = false;
  writeBlocked = false;
  ignoreWrite = false;
  readAfterWriteBlocked = false;
  getItem(key: string): string | null {
    this.reads.push(key);
    if (this.readBlocked || (this.readAfterWriteBlocked && this.writes.length)) throw Error('read denied');
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.writeBlocked) throw Error('write denied');
    this.writes.push(key);
    if (!this.ignoreWrite) this.values.set(key, value);
  }
  removeItem(key: string): void { this.removes.push(key); this.values.delete(key); }
}
const administrativeData = createSyntheticFormat8Context();
const context: AdministrativeDefaultsContext = { legacyData: mvp07CalculationData, administrativeData };
function old(version = 4): Record<string, unknown> {
  return { version, locale: 'fr', authorityCode: 'TI', profileId: 'zpo', deadlineDays: 30,
    selectors: { deliveryMethod: 'otherLegallyRelevantDate', procedureVariant: 'summary', specialLawStatus: 'noKnownOverride' },
    calendarContext: { role: 'court', canton: 'TI', areaFacts: { inventedRegion: true } },
    inputDate: '2026-10-15', regionFacts: { member: true }, urgency: 'explicitJudicialUrgencyOrder',
    qualificationConfirmed: true, specialLawConfirmed: true };
}
function withOld(version = 4): MemoryStorage {
  const storage = new MemoryStorage(); storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify(old(version))); return storage;
}
function admin(): AdministrativePreferences {
  return { ...emptyAdministrativePreferences(), authorityCode: 'TI', locale: 'fr', deadlineDays: 30,
    deliveryMethod: 'otherLegallyRelevantDate',
    procedureSelection: { kind: 'cantonalAdministrative', lawId: 'lpamm-ti', pathId: 'ti-80-30', revision: 1, stage: 'administrativeAppeal' } };
}
function legacy(profileId = 'zpo', authorityCode = 'TI'): AdministrativePreferences {
  return { ...emptyAdministrativePreferences(), authorityCode, locale: 'fr', deadlineDays: 30,
    deliveryMethod: 'otherLegallyRelevantDate', procedureSelection: { kind: 'legacyProfile', profileId } };
}

describe('AP23D2: isolated version-5 defaults and read-only legacy migration', () => {
  it('initializes the empty v5 slot once without inventing canton or procedure', () => {
    const storage = new MemoryStorage();
    assert.deepEqual(initialize(context, storage).preferences, emptyAdministrativePreferences());
    initialize(context, storage);
    assert.deepEqual(storage.writes, [KEY]);
    assert.equal(storage.reads.filter(key => key === DEFAULTS_STORAGE_KEY).length, 1);
    assert.equal(initialize(context, storage).legalQualification, false);
  });
  for (const version of [1, 2, 3, 4]) it(`migrates valid v${version} choices without their case facts`, () => {
    const storage = withOld(version), before = storage.values.get(DEFAULTS_STORAGE_KEY);
    const state = initialize(context, storage);
    assert.equal(state.persistence, 'stored');
    assert.deepEqual(state.preferences, { ...legacy(), legacySelectors: { procedureVariant: 'summary' },
      calendarPreference: version === 4 ? { role: 'court', canton: 'TI' } : { role: '', canton: '' } });
    assert.equal(storage.values.get(DEFAULTS_STORAGE_KEY), before);
    assert.doesNotMatch(storage.values.get(KEY)!, /inputDate|areaFacts|regionFacts|urgency|specialLaw|Confirmed|2026-10-15/);
  });
  it('never interprets TI or GR in old ZPO defaults as a cantonal administrative path', () => {
    for (const authorityCode of ['TI', 'GR']) {
      const storage = withOld(); storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(), authorityCode }));
      assert.deepEqual(initialize(context, storage).preferences.procedureSelection, { kind: 'legacyProfile', profileId: 'zpo' });
    }
  });
  it('does not replace an invalid old profile with the first valid one', () => {
    for (const change of [{ profileId: 'vrpg-be' }, { profileId: 'invented' }, { authorityCode: 'XX' }]) {
      const storage = withOld(); storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(), ...change }));
      assert.equal(initialize(context, storage).preferences.procedureSelection, null);
    }
  });
  it('does not infer holiday role or canton from an older calendar identifier', () => {
    const storage = withOld(2);
    storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(2), calendarId: 'be-public-holidays' }));
    assert.deepEqual(initialize(context, storage).preferences.calendarPreference, { role: '', canton: '' });
  });
  it('keeps BE social law, action and stage as visible choices only', () => {
    for (const law of ['ivg', 'ahvg', 'uvg', 'elg', 'avig', 'kvg', 'eog', 'famzg', 'flg', 'mvg', 'uelg']) {
      const storage = new MemoryStorage();
      const preference = { ...legacy('vrpg-be', 'BE'), vrpgSelection: { area: 'social', law, action: 'ongoing', stage: 'court' } };
      assert.equal(save(context, storage, { ...preference, vrpgContext: { competenceConfirmed: true } }).persistence, 'stored');
      assert.deepEqual(initialize(context, storage).preferences.vrpgSelection, preference.vrpgSelection);
      assert.doesNotMatch(storage.values.get(KEY)!, /vrpgContext|competenceConfirmed/);
    }
  });
  it('migrates old v3/v4 social selections and removes social facts', () => {
    for (const version of [3, 4]) {
      const storage = withOld(version);
      const vrpgSelection = { area: 'social', law: 'famzg', action: 'appeal', stage: '' };
      storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(version), authorityCode: 'BE', profileId: 'vrpg-be', vrpgSelection,
        vrpgContext: { authorityConfirmed: true }, calendarContext: { role: 'partyWithoutRepresentative', canton: 'NE' } }));
      const state = initialize(context, storage);
      assert.deepEqual(state.preferences.vrpgSelection, vrpgSelection);
      assert.deepEqual(state.preferences.calendarPreference, { role: '', canton: '' });
      assert.deepEqual(state.preferences.legacySelectors, {});
    }
  });
  it('migrates an explicitly equivalent old general-regime selection, without a qualification', () => {
    const storage = withOld(2);
    storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(2), authorityCode: 'BE', profileId: 'vrpg-be',
      specialRegimeId: 'vrpg-be-general', specialDefinitionId: 'VRPGBE-SPEC-REL-GENERAL-001' }));
    const state = initialize(context, storage);
    assert.deepEqual(state.preferences.vrpgSelection, { area: 'general', law: '', action: '', stage: '' });
    assert.deepEqual(state.preferences.legacySelectors, {});
    assert.equal(state.legalQualification, false);
  });
  it('preserves the intentionally empty BE procedure selection', () => {
    const storage = new MemoryStorage(), preference = legacy('vrpg-be', 'BE');
    save(context, storage, preference);
    assert.deepEqual(initialize(context, storage).preferences.vrpgSelection, emptyAdministrativePreferences().vrpgSelection);
  });
  it('checks legacy selector values against the selected actual profile', () => {
    const storage = new MemoryStorage();
    save(context, storage, { ...legacy(), legacySelectors: { procedureVariant: 'summary', subjectMatter: 'interimMeasures',
      specialLawStatus: 'noKnownOverride', legalTrigger: 'unknown', arbitrary: 'secret' } });
    assert.deepEqual(initialize(context, storage).preferences.legacySelectors, { procedureVariant: 'summary' });
    save(context, storage, { ...legacy('bgg'), legacySelectors: { procedureVariant: 'summary', subjectMatter: 'interimMeasures' } });
    assert.deepEqual(initialize(context, storage).preferences.legacySelectors, { subjectMatter: 'interimMeasures' });
  });
  it('preserves supported delivery options but never their confirmation', () => {
    const storage = new MemoryStorage();
    save(context, storage, { ...legacy(), deliveryMethod: 'registeredMailUncollected', deliveryFictionConfirmed: true });
    assert.equal(initialize(context, storage).preferences.deliveryMethod, 'registeredMailUncollected');
    assert.doesNotMatch(storage.values.get(KEY)!, /Confirmed/);
    save(context, storage, { ...legacy('bgg'), deliveryMethod: 'registeredMailUncollected' });
    assert.equal(initialize(context, storage).preferences.deliveryMethod, '');
  });
  it('stores only compatible holiday role and canton, never regional evidence', () => {
    const storage = new MemoryStorage();
    save(context, storage, { ...legacy('stpo'), calendarPreference: { role: 'qualifiedServiceRepresentative', canton: 'NE',
      areaFacts: { 'NE-LANDERON-ADDITIONAL': false }, competenceConfirmed: true } });
    assert.deepEqual(initialize(context, storage).preferences.calendarPreference, { role: 'qualifiedServiceRepresentative', canton: 'NE' });
    assert.doesNotMatch(storage.values.get(KEY)!, /areaFacts|ADDITIONAL|Confirmed/);
    save(context, storage, { ...legacy(), calendarPreference: { role: 'qualifiedServiceRepresentative', canton: 'CH' } });
    assert.deepEqual(initialize(context, storage).preferences.calendarPreference, { role: '', canton: '' });
  });
  it('can save each current TI/GR path and stage only through a genuine reader context', () => {
    let combinations = 0;
    for (const path of administrativeData.administrativeCatalog.paths) for (const stage of path.stages) {
      const law = administrativeData.administrativeCatalog.laws.find(item => item.lawId === path.lawId)!;
      const preference: AdministrativePreferences = { ...admin(), authorityCode: law.canton,
        deadlineDays: path.duration.kind === 'statutoryDays' ? path.duration.value : 9,
        procedureSelection: { kind: 'cantonalAdministrative', lawId: law.lawId, pathId: path.pathId, revision: path.revision, stage } };
      const storage = new MemoryStorage();
      assert.equal(save(context, storage, preference).persistence, 'stored');
      assert.deepEqual(initialize(context, storage).preferences, preference);
      combinations += 1;
    }
    assert.equal(administrativeData.administrativeCatalog.paths.length, 12);
    assert.ok(combinations >= 12);
  });
  it('rejects a serialized/copied context and a bare catalog instead of trusting their flags', () => {
    for (const fake of [{ ...administrativeData }, JSON.parse(JSON.stringify(administrativeData)), administrativeData.administrativeCatalog]) {
      const storage = new MemoryStorage();
      const unverified = { ...context, administrativeData: fake } as AdministrativeDefaultsContext;
      assert.equal(save(unverified, storage, admin()).reason, 'unsupportedSelection');
      assert.equal(storage.writes.length, 0);
    }
  });
  it('rejects missing context, unknown revision, stage, path, law and canton without fallback', () => {
    const base = admin().procedureSelection!;
    for (const change of [{ revision: 2 }, { stage: 'court' }, { lawId: 'vrg-gr' }, { pathId: 'unknown' }]) {
      const storage = new MemoryStorage(); initialize(context, storage); const before = storage.values.get(KEY);
      assert.equal(save(context, storage, { ...admin(), procedureSelection: { ...base, ...change } }).reason, 'unsupportedSelection');
      assert.equal(storage.values.get(KEY), before);
    }
    assert.equal(save(context, new MemoryStorage(), { ...admin(), authorityCode: 'GR' }).reason, 'unsupportedSelection');
    assert.equal(save({ legacyData: mvp07CalculationData }, new MemoryStorage(), admin()).reason, 'unsupportedSelection');
  });
  it('rejects a mixed legacy/cantonal tagged selection', () => {
    assert.equal(save(context, new MemoryStorage(), { ...admin(), procedureSelection: { ...admin().procedureSelection, profileId: 'vrpg-be' } }).reason,
      'unsupportedSelection');
    assert.equal(save(context, new MemoryStorage(), { ...legacy(), procedureSelection: { kind: 'legacyProfile', profileId: 'zpo', pathId: 'ti-80-30' } }).reason,
      'unsupportedSelection');
  });
  it('does not make a fixed statutory path valid by saving a different day count', () => {
    for (const deadlineDays of [10, 15, 31, 0, 366]) {
      const storage = new MemoryStorage();
      assert.equal(save(context, storage, { ...admin(), deadlineDays }).reason, 'unsupportedDuration');
      assert.equal(storage.writes.length, 0);
    }
  });
  it('never persists date, urgency, competence, exclusions or other legal facts', () => {
    const storage = new MemoryStorage();
    const unsafe = { ...admin(), inputDate: '2026-10-15', dateDraft: 'h', reference: 'CASE-SECRET',
      urgency: 'explicitJudicialUrgencyOrder', authoritySeat: { qualification: 'competentAuthorityForCurrentAction' },
      qualification: { specialLaw: 'excluded' }, specialLawStatus: 'noKnownOverride', specialLawChecked: true,
      regionFacts: { member: true }, areaFacts: { member: false }, deliveryFictionConfirmed: true,
      legacySelectors: { specialLawStatus: 'noKnownOverride' }, vrpgSelection: { area: 'general', law: '', action: '', stage: '' },
      calendarPreference: { role: 'court', canton: 'TI', areaFacts: { member: true } } };
    assert.equal(save(context, storage, unsafe).persistence, 'stored');
    assert.deepEqual(initialize(context, storage).preferences, admin());
    assert.doesNotMatch(storage.values.get(KEY)!, /inputDate|dateDraft|"reference"|SECRET|urgency|authoritySeat|qualification|specialLaw|regionFacts|areaFacts|Confirmed/);
  });
  it('keeps the legacy key byte-identical through initialize, save and reset', () => {
    const storage = withOld(), before = storage.values.get(DEFAULTS_STORAGE_KEY);
    initialize(context, storage); save(context, storage, admin()); reset(context, storage);
    assert.equal(storage.values.get(DEFAULTS_STORAGE_KEY), before);
    assert.ok(storage.writes.every(key => key === KEY));
    assert.deepEqual(storage.removes, []);
  });
  it('keeps a v5 reset marker and never resurrects modified legacy preferences', () => {
    const storage = withOld(); initialize(context, storage); reset(context, storage);
    storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(), deadlineDays: 99 })); storage.reads.length = 0;
    assert.deepEqual(initialize(context, storage).preferences, emptyAdministrativePreferences());
    assert.equal(storage.reads.includes(DEFAULTS_STORAGE_KEY), false);
    assert.deepEqual(JSON.parse(storage.values.get(KEY)!), { version: 5, state: 'reset' });
  });
  it('old hosts can keep using the old slot without altering v5', () => {
    const storage = withOld(); save(context, storage, admin()); const before = storage.values.get(KEY);
    saveDefaults(storage, initialDefaults(mvp07CalculationData, true));
    assert.equal(storage.values.get(KEY), before);
    assert.deepEqual(initialize(context, storage).preferences, admin());
  });
  it('allows an explicit v5 save after a reset marker without reimporting v1', () => {
    const storage = withOld(); reset(context, storage); storage.reads.length = 0;
    assert.equal(save(context, storage, admin()).persistence, 'stored');
    assert.deepEqual(initialize(context, storage).preferences, admin());
    assert.equal(storage.reads.includes(DEFAULTS_STORAGE_KEY), false);
  });
  it('protects future versions against initialize, save and ordinary reset', () => {
    const storage = withOld(), raw = JSON.stringify({ version: 6, futurePrivateState: 'preserve' });
    storage.values.set(KEY, raw);
    for (const call of [() => initialize(context, storage), () => save(context, storage, admin()), () => reset(context, storage)]) {
      assert.equal(call().reason, 'futureVersion'); assert.equal(storage.values.get(KEY), raw);
    }
    assert.equal(storage.reads.includes(DEFAULTS_STORAGE_KEY), false); assert.deepEqual(storage.writes, []);
  });
  it('protects damaged or extra-field v5 values and never falls back to the old slot', () => {
    for (const raw of ['{', 'null', '{}', '[]', '{"version":4}', JSON.stringify({ version: 5, state: 'reset', extra: true }),
      JSON.stringify({ version: 5, state: 'preferences', preferences: { ...admin(), qualificationConfirmed: true } }),
      JSON.stringify({ version: 5, state: 'preferences', preferences: { ...admin(), locale: 'it' } })]) {
      const storage = withOld(); storage.values.set(KEY, raw);
      for (const call of [() => initialize(context, storage), () => save(context, storage, admin()), () => reset(context, storage)]) {
        assert.equal(call().persistence, 'protected'); assert.equal(storage.values.get(KEY), raw);
      }
      assert.equal(storage.reads.includes(DEFAULTS_STORAGE_KEY), false); assert.deepEqual(storage.writes, []);
    }
  });
  it('protects a previously saved admin identity if the current host cannot validate it', () => {
    const storage = withOld(); save(context, storage, admin()); const raw = storage.values.get(KEY);
    const missing = { legacyData: mvp07CalculationData };
    assert.equal(initialize(missing, storage).reason, 'unsupportedSelection');
    assert.equal(reset(missing, storage).persistence, 'protected');
    assert.equal(storage.values.get(KEY), raw);
  });
  it('accepts harmless JSON key ordering differences', () => {
    const storage = new MemoryStorage(); save(context, storage, admin());
    const envelope = JSON.parse(storage.values.get(KEY)!);
    storage.values.set(KEY, JSON.stringify({ preferences: envelope.preferences, state: envelope.state, version: 5 }));
    assert.deepEqual(initialize(context, storage).preferences, admin());
  });
  it('rechecks a future or damaged replacement on every save/reset', () => {
    for (const raw of ['{', JSON.stringify({ version: 9 })]) {
      const storage = withOld(); initialize(context, storage); const writes = storage.writes.length;
      storage.values.set(KEY, raw);
      assert.equal(save(context, storage, admin()).persistence, 'protected');
      assert.equal(reset(context, storage).persistence, 'protected');
      assert.equal(storage.values.get(KEY), raw); assert.equal(storage.writes.length, writes);
    }
  });
  it('missing storage and denied reads remain session-only, without pretending migration', () => {
    const storage = withOld(); storage.readBlocked = true;
    for (const candidate of [undefined, storage]) {
      assert.equal(initialize(context, candidate).reason, 'storageReadUnavailable');
      const saved = save(context, candidate, admin());
      assert.equal(saved.persistence, 'memoryOnly'); assert.deepEqual(saved.preferences, admin());
      assert.equal(reset(context, candidate).persistence, 'memoryOnly');
    }
    assert.deepEqual(storage.writes, []);
    assert.equal(storage.reads.includes(DEFAULTS_STORAGE_KEY), false);
  });
  it('denied writes cannot promise durable initialization or reset', () => {
    const storage = withOld(); storage.writeBlocked = true;
    const loaded = initialize(context, storage);
    assert.equal(loaded.persistence, 'memoryOnly'); assert.equal(loaded.preferences.locale, 'fr');
    assert.equal(save(context, storage, admin()).reason, 'storageWriteUnavailable');
    assert.equal(reset(context, storage).reason, 'storageWriteUnavailable');
    assert.equal(storage.values.has(KEY), false);
  });
  it('an ignored setter or unreadable read-back is not labelled as durable storage', () => {
    for (const property of ['ignoreWrite', 'readAfterWriteBlocked'] as const) {
      const storage = new MemoryStorage(); storage[property] = true;
      const result = save(context, storage, admin());
      assert.equal(result.persistence, 'memoryOnly'); assert.equal(result.reason, 'storageWriteUnverified');
    }
  });
  it('bounds old preference values without using a first-profile fallback', () => {
    const storage = withOld();
    storage.values.set(DEFAULTS_STORAGE_KEY, JSON.stringify({ ...old(), locale: 'it', deadlineDays: 366, authorityCode: 'XX' }));
    const state = initialize(context, storage);
    assert.equal(state.preferences.locale, 'de'); assert.equal(state.preferences.deadlineDays, 10);
    assert.equal(state.preferences.authorityCode, ''); assert.equal(state.preferences.procedureSelection, null);
  });
  it('does not interpret unknown/corrupt old versions as usable defaults', () => {
    for (const raw of ['{', 'null', '[]', JSON.stringify({ ...old(), version: 9 }), JSON.stringify({ ...old(), version: '4' })]) {
      const storage = new MemoryStorage(); storage.values.set(DEFAULTS_STORAGE_KEY, raw);
      assert.deepEqual(initialize(context, storage).preferences, emptyAdministrativePreferences());
      assert.equal(storage.values.get(DEFAULTS_STORAGE_KEY), raw);
    }
  });
});
