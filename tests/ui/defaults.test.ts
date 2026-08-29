// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULTS_STORAGE_KEY,
  clearDefaults,
  initialDefaults,
  loadDefaults,
  saveDefaults,
  type StorageLike
} from '../../src/ui/defaults';
import { loadCalculationData } from '../core/fixtures';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

const data = loadCalculationData();

describe('AP9-lokale Defaults', () => {
  it('verwendet Bern und StPO als sicheren MVP-Ausgangspunkt', () => {
    const defaults = initialDefaults(data);
    assert.equal(defaults.authorityCode, 'BE');
    assert.equal(defaults.profileId, 'stpo');
    assert.equal(defaults.calendarId, 'be-public-holidays');
    assert.equal('inputDate' in defaults, false);
  });

  it('speichert kein Empfangsdatum und lädt gültige Werte', () => {
    const storage = new MemoryStorage();
    const defaults = { ...initialDefaults(data), locale: 'fr' as const, deadlineDays: 30 };
    assert.equal(saveDefaults(storage, defaults), true);
    const serialized = storage.getItem(DEFAULTS_STORAGE_KEY);
    assert.ok(serialized);
    assert.equal(serialized.includes('inputDate'), false);
    assert.deepEqual(loadDefaults(data, storage), defaults);
  });

  it('verwirft einen mit dem Bund unvereinbaren kantonalen Default', () => {
    const storage = new MemoryStorage();
    storage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify({
      version: 1,
      locale: 'de',
      authorityCode: 'CH',
      profileId: 'vrpg-be',
      deadlineDays: 10,
      selectors: { specialLawStatus: 'noKnownOverride' },
      calendarId: 'be-public-holidays',
      inputDate: '2027-01-01'
    }));
    const loaded = loadDefaults(data, storage);
    assert.equal(loaded.authorityCode, 'CH');
    assert.equal(loaded.profileId, 'stpo');
    assert.equal('specialLawStatus' in loaded.selectors, false);
    assert.equal('inputDate' in loaded, false);
  });

  it('kann lokale Defaults vollständig entfernen', () => {
    const storage = new MemoryStorage();
    assert.equal(saveDefaults(storage, initialDefaults(data)), true);
    assert.equal(clearDefaults(storage), true);
    assert.equal(storage.getItem(DEFAULTS_STORAGE_KEY), null);
  });
});
