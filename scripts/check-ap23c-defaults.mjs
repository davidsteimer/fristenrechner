// SPDX-License-Identifier: AGPL-3.0-only
// Isolated AP23C contract model. No product imports, browser storage or migration.
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OLD_KEY = 'fristenrechner.defaults.v1';
const NEW_KEY = 'fristenrechner.defaults.v5';
const CANTONS = new Set('CH ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '));
const LEGACY_PROFILES = new Set(['stpo', 'zpo', 'bgg', 'vwvg', 'vrpg-be']);
// Representative fixtures only. These are not an operational law/path registry.
const ADMIN_PATHS = {
  'lpamm-ti:ti-80-30': { authorityCode: 'TI', revision: 1, stages: ['administrativeAppeal'] },
  'vrg-gr:gr-52-30': { authorityCode: 'GR', revision: 1, stages: ['court'] }
};
const DELIVERY = new Set(['otherLegallyRelevantDate']);
const SELECTORS = {
  subjectMatter: new Set(['interimMeasures']),
  procedureVariant: new Set(['summary'])
};
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const empty = () => ({ locale: 'de', authorityCode: '', deadlineDays: 10,
  deliveryMethod: '', procedureSelection: null, legacySelectors: {} });

function stableSelection(value, authorityCode) {
  if (!record(value)) return null;
  if (value.kind === 'legacyProfile') {
    if (!LEGACY_PROFILES.has(value.profileId)
      || !CANTONS.has(authorityCode)
      || (value.profileId === 'vrpg-be' && authorityCode !== 'BE')) return null;
    return { kind: 'legacyProfile', profileId: value.profileId };
  }
  if (value.kind === 'cantonalAdministrative') {
    const path = ADMIN_PATHS[`${value.lawId}:${value.pathId}`];
    if (!path || path.authorityCode !== authorityCode || value.revision !== path.revision
      || !path.stages.includes(value.stage)) return null;
    return { kind: 'cantonalAdministrative', lawId: value.lawId, pathId: value.pathId,
      revision: value.revision, stage: value.stage };
  }
  return null;
}

function stablePreferences(value) {
  const input = record(value) ? value : {};
  const authorityCode = CANTONS.has(input.authorityCode) ? input.authorityCode : '';
  const procedureSelection = stableSelection(input.procedureSelection, authorityCode);
  const legacySelectors = {};
  if (procedureSelection?.kind === 'legacyProfile' && record(input.legacySelectors)) {
    for (const [key, values] of Object.entries(SELECTORS)) {
      const applies = key === 'procedureVariant' ? procedureSelection.profileId === 'zpo'
        : ['bgg', 'vwvg'].includes(procedureSelection.profileId);
      if (applies && values.has(input.legacySelectors[key])) legacySelectors[key] = input.legacySelectors[key];
    }
  }
  return { locale: input.locale === 'fr' ? 'fr' : 'de', authorityCode,
    deadlineDays: Number.isInteger(input.deadlineDays) && input.deadlineDays >= 1 && input.deadlineDays <= 365
      ? input.deadlineDays : 10,
    deliveryMethod: DELIVERY.has(input.deliveryMethod) ? input.deliveryMethod : '',
    procedureSelection, legacySelectors };
}

function legacyPreferences(raw) {
  try {
    const old = JSON.parse(raw);
    if (!record(old) || ![1, 2, 3, 4].includes(old.version)) return empty();
    return stablePreferences({ locale: old.locale, authorityCode: old.authorityCode,
      deadlineDays: old.deadlineDays,
      procedureSelection: { kind: 'legacyProfile', profileId: old.profileId },
      deliveryMethod: old.selectors?.deliveryMethod,
      legacySelectors: old.selectors });
  } catch { return empty(); }
}

function decodeV5(raw) {
  let value;
  try { value = JSON.parse(raw); } catch { return { kind: 'protected', reason: 'corruptV5' }; }
  if (record(value) && Number.isInteger(value.version) && value.version > 5) {
    return { kind: 'protected', reason: 'futureVersion' };
  }
  if (isDeepStrictEqual(value, { version: 5, state: 'reset' })) return { kind: 'reset', preferences: empty() };
  if (record(value) && value.version === 5 && value.state === 'preferences') {
    const preferences = stablePreferences(value.preferences);
    const canonical = { version: 5, state: 'preferences', preferences };
    if (isDeepStrictEqual(canonical, value)) return { kind: 'preferences', preferences };
  }
  return { kind: 'protected', reason: 'corruptV5' };
}

function result(persistence, preferences, state, reason) {
  return { persistence, preferences, state, ...(reason ? { reason } : {}),
    legalQualification: false, productMigration: false };
}

function readCurrent(storage) {
  try {
    if (!storage) return { kind: 'unavailable' };
    const raw = storage.getItem(NEW_KEY);
    return raw === null ? { kind: 'absent' } : decodeV5(raw);
  } catch { return { kind: 'unavailable' }; }
}

function persist(storage, value, preferences) {
  try {
    storage.setItem(NEW_KEY, JSON.stringify(value));
    return result('stored', preferences, value.state);
  } catch {
    return result('memoryOnly', preferences, value.state, 'storageWriteUnavailable');
  }
}

function initialize(storage) {
  const current = readCurrent(storage);
  if (current.kind === 'unavailable') return result('memoryOnly', empty(), 'uninitialized', 'storageReadUnavailable');
  if (current.kind === 'protected') return result('protected', empty(), 'uninitialized', current.reason);
  if (current.kind !== 'absent') return result('stored', current.preferences, current.kind);
  let preferences;
  try { preferences = legacyPreferences(storage.getItem(OLD_KEY)); }
  catch { return result('memoryOnly', empty(), 'uninitialized', 'storageReadUnavailable'); }
  return persist(storage, { version: 5, state: 'preferences', preferences }, preferences);
}

function save(storage, input) {
  const current = readCurrent(storage);
  if (current.kind === 'protected') return result('protected', empty(), 'uninitialized', current.reason);
  const preferences = stablePreferences(input);
  // An unsupported explicit choice must not silently become the first valid path.
  if (input?.procedureSelection !== null && input?.procedureSelection !== undefined
    && preferences.procedureSelection === null) {
    return result('rejected', current.preferences ?? empty(), current.kind, 'unsupportedSelection');
  }
  if (current.kind === 'unavailable') return result('memoryOnly', preferences, 'preferences', 'storageReadUnavailable');
  return persist(storage, { version: 5, state: 'preferences', preferences }, preferences);
}

function reset(storage) {
  const current = readCurrent(storage);
  if (current.kind === 'protected') return result('protected', empty(), 'uninitialized', current.reason);
  if (current.kind === 'unavailable') return result('memoryOnly', empty(), 'reset', 'storageReadUnavailable');
  return persist(storage, { version: 5, state: 'reset' }, empty());
}

class ModelStorage {
  values = new Map();
  reads = [];
  writes = [];
  readBlocked = false;
  writeBlocked = false;
  getItem(key) { this.reads.push(key); if (this.readBlocked) throw Error('read denied'); return this.values.get(key) ?? null; }
  setItem(key, value) { if (this.writeBlocked) throw Error('write denied'); this.writes.push(key); this.values.set(key, value); }
}

export function runProbeSummary() {
  const passed = [];
  const check = (id, body) => { body(); passed.push(id); };
  const old = version => ({ version, locale: 'fr', authorityCode: 'TI', profileId: 'zpo', deadlineDays: 30,
    selectors: { deliveryMethod: 'otherLegallyRelevantDate', procedureVariant: 'summary', specialLawStatus: 'noKnownOverride' },
    inputDate: '2026-10-14', regionFacts: { local: true }, urgency: 'urgentOrder',
    qualificationConfirmed: true, specialLawConfirmed: true });
  const withOld = (version = 4) => { const storage = new ModelStorage(); storage.values.set(OLD_KEY, JSON.stringify(old(version))); return storage; };
  const newAdmin = () => ({ ...empty(), authorityCode: 'TI', locale: 'fr', deadlineDays: 30,
    procedureSelection: { kind: 'cantonalAdministrative', lawId: 'lpamm-ti', pathId: 'ti-80-30', revision: 1, stage: 'administrativeAppeal' } });

  check('D01-absent-initializes-once', () => {
    const storage = new ModelStorage();
    assert.deepEqual(initialize(storage).preferences, empty());
    initialize(storage);
    assert.deepEqual(storage.writes, [NEW_KEY]);
    assert.equal(storage.reads.filter(key => key === OLD_KEY).length, 1);
  });
  check('D02-v1-to-v4-stable-legacy-values', () => {
    for (const version of [1, 2, 3, 4]) {
      const storage = withOld(version), before = storage.values.get(OLD_KEY), state = initialize(storage);
      assert.equal(state.persistence, 'stored');
      assert.deepEqual(state.preferences, { locale: 'fr', authorityCode: 'TI', deadlineDays: 30,
        deliveryMethod: 'otherLegallyRelevantDate', procedureSelection: { kind: 'legacyProfile', profileId: 'zpo' },
        legacySelectors: { procedureVariant: 'summary' } });
      assert.equal(storage.values.get(OLD_KEY), before);
    }
  });
  check('D03-no-cantonal-path-inference', () => {
    for (const authorityCode of ['TI', 'GR']) {
      const storage = withOld(); storage.values.set(OLD_KEY, JSON.stringify({ ...old(4), authorityCode }));
      assert.deepEqual(initialize(storage).preferences.procedureSelection, { kind: 'legacyProfile', profileId: 'zpo' });
    }
  });
  check('D04-no-first-profile-or-path-fallback', () => {
    const storage = withOld(); storage.values.set(OLD_KEY, JSON.stringify({ ...old(4), profileId: 'vrpg-be' }));
    assert.equal(initialize(storage).preferences.procedureSelection, null);
    const previous = storage.values.get(NEW_KEY);
    assert.equal(save(storage, { ...newAdmin(), procedureSelection: { ...newAdmin().procedureSelection, pathId: 'unknown' } }).persistence, 'rejected');
    assert.equal(storage.values.get(NEW_KEY), previous);
  });
  check('D05-no-case-facts-from-old-or-new-input', () => {
    const storage = withOld(); initialize(storage);
    save(storage, { ...newAdmin(), inputDate: '2026-10-14', regionFacts: { member: true }, urgency: 'urgentOrder',
      specialLawStatus: 'noKnownOverride', specialLawConfirmed: true, qualificationConfirmed: true,
      dateDraft: 'h', courtCantonConfirmed: true });
    assert.doesNotMatch(storage.values.get(NEW_KEY), /inputDate|regionFacts|urgency|specialLaw|Confirmed|dateDraft|2026-10-14/);
  });
  check('D06-old-key-unchanged-through-write-and-reset', () => {
    const storage = withOld(), before = storage.values.get(OLD_KEY);
    initialize(storage); save(storage, newAdmin()); reset(storage);
    assert.equal(storage.values.get(OLD_KEY), before);
    assert.ok(storage.writes.every(key => key === NEW_KEY));
  });
  check('D07-explicit-admin-choice-is-not-case-approval', () => {
    const storage = new ModelStorage(), expected = newAdmin();
    save(storage, expected);
    const state = initialize(storage);
    assert.deepEqual(state.preferences, expected);
    assert.equal(state.legalQualification, false);
    assert.equal(state.productMigration, false);
  });
  check('D08-unknown-revision-stage-and-canton-rejected', () => {
    for (const change of [{ revision: 2 }, { stage: 'court' }, { lawId: 'vrg-gr' }]) {
      const storage = new ModelStorage(); initialize(storage); const before = storage.values.get(NEW_KEY);
      assert.equal(save(storage, { ...newAdmin(), procedureSelection: { ...newAdmin().procedureSelection, ...change } }).persistence, 'rejected');
      assert.equal(storage.values.get(NEW_KEY), before);
    }
  });
  check('D09-reset-marker-prevents-old-values-resurrection', () => {
    const storage = withOld(); initialize(storage); reset(storage); storage.reads = [];
    storage.values.set(OLD_KEY, JSON.stringify({ ...old(4), deadlineDays: 99 }));
    assert.deepEqual(initialize(storage).preferences, empty());
    assert.equal(storage.reads.includes(OLD_KEY), false);
    assert.deepEqual(JSON.parse(storage.values.get(NEW_KEY)), { version: 5, state: 'reset' });
  });
  check('D10-future-v5-slot-is-protected', () => {
    const storage = withOld(), future = JSON.stringify({ version: 6, privateFutureState: 'keep' });
    storage.values.set(NEW_KEY, future);
    for (const call of [() => initialize(storage), () => save(storage, newAdmin()), () => reset(storage)]) {
      assert.equal(call().persistence, 'protected'); assert.equal(storage.values.get(NEW_KEY), future);
    }
    assert.equal(storage.reads.includes(OLD_KEY), false); assert.deepEqual(storage.writes, []);
  });
  check('D11-corrupt-new-slot-is-protected-no-legacy-fallback', () => {
    for (const raw of ['{', 'null', '{}', '[]', '{"version":4}', JSON.stringify({ version: 5, state: 'reset', extra: true }),
      JSON.stringify({ version: 5, state: 'preferences', preferences: { ...newAdmin(), qualificationConfirmed: true } })]) {
      const storage = withOld(); storage.values.set(NEW_KEY, raw);
      assert.equal(initialize(storage).persistence, 'protected');
      assert.equal(save(storage, newAdmin()).persistence, 'protected');
      assert.equal(reset(storage).persistence, 'protected');
      assert.equal(storage.values.get(NEW_KEY), raw); assert.equal(storage.reads.includes(OLD_KEY), false);
    }
  });
  check('D12-unavailable-read-is-memory-only', () => {
    const storage = withOld(); storage.readBlocked = true;
    assert.equal(initialize(storage).persistence, 'memoryOnly');
    assert.equal(initialize(undefined).reason, 'storageReadUnavailable');
    assert.equal(save(storage, newAdmin()).persistence, 'memoryOnly');
    assert.equal(reset(storage).persistence, 'memoryOnly');
    assert.equal(storage.reads.includes(OLD_KEY), false); assert.deepEqual(storage.writes, []);
  });
  check('D13-denied-write-cannot-promise-durable-migration-or-reset', () => {
    const storage = withOld(); storage.writeBlocked = true;
    assert.equal(initialize(storage).persistence, 'memoryOnly');
    assert.equal(initialize(storage).preferences.locale, 'fr');
    assert.equal(reset(storage).reason, 'storageWriteUnavailable');
    assert.equal(storage.values.has(NEW_KEY), false);
    // A later session can still see old values. This is the documented limit.
    storage.writeBlocked = false;
    assert.equal(initialize(storage).preferences.locale, 'fr');
  });
  check('D14-historical-host-write-cannot-change-new-preferences', () => {
    const storage = withOld(); save(storage, newAdmin()); const before = storage.values.get(NEW_KEY);
    storage.values.set(OLD_KEY, JSON.stringify({ ...old(3), authorityCode: 'BE', deadlineDays: 7 }));
    assert.deepEqual(initialize(storage).preferences, newAdmin());
    assert.equal(storage.values.get(NEW_KEY), before);
  });
  check('D15-malformed-old-values-stay-unqualified', () => {
    for (const raw of ['{', '{"version":99}', JSON.stringify({ ...old(4), authorityCode: 'ZZ', deadlineDays: 0 })]) {
      const storage = new ModelStorage(); storage.values.set(OLD_KEY, raw);
      const state = initialize(storage);
      assert.equal(state.preferences.procedureSelection, null);
      assert.equal(state.preferences.deadlineDays, 10);
      assert.equal(storage.values.get(OLD_KEY), raw);
    }
  });
  return { status: 'passed', modelProbe: true, productMigration: false, runtimeActive: false,
    browserStorageUsed: false, tests: passed.length, passed,
    modeledKeys: { legacy: OLD_KEY, proposed: NEW_KEY },
    limitations: [
      'Representative closed legacy selector and TI/GR path fixtures, not a complete product registry.',
      'No real browser, SPFx, calendar runtime or legal applicability test.',
      'Denied storage writes permit session-only preferences and cannot guarantee a durable reset.'
    ] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(JSON.stringify(runProbeSummary(), null, 2) + '\n');
}
