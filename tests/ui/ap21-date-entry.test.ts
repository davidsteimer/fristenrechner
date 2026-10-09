// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';

import { formatDateEntry, parseDateEntry, zurichToday } from '../../src/ui/dateEntry';

const october = new Date('2026-10-08T10:00:00.000Z');
const valid = (value: string, display: string) => ({ kind: 'valid', value, display });

describe('AP21 – eindeutige Schweizer Datumseingabe', () => {
  it('lässt ein leeres Feld leer, ohne das Tagesdatum einzusetzen', () => {
    for (const input of ['', ' ', '\t\n']) {
      assert.deepEqual(parseDateEntry(input, 'de', new Date(NaN)), { kind: 'empty', value: '', display: '' });
    }
  });

  it('ergänzt ein- und zweistellige Tage um den aktuellen Schweizer Monat und das Jahr', () => {
    assert.deepEqual(parseDateEntry('1', 'de', october), valid('2026-10-01', '01.10.2026'));
    assert.deepEqual(parseDateEntry('01', 'fr', october), valid('2026-10-01', '01.10.2026'));
    assert.deepEqual(parseDateEntry('31', 'de', october), valid('2026-10-31', '31.10.2026'));
  });

  it('ergänzt Tag und Monat um das aktuelle Schweizer Jahr', () => {
    for (const input of ['1.2', '01.2', '1.02', '01.02']) {
      assert.deepEqual(parseDateEntry(input, 'de', october), valid('2026-02-01', '01.02.2026'));
      assert.deepEqual(parseDateEntry(input, 'fr', october), valid('2026-02-01', '01.02.2026'));
    }
  });

  it('akzeptiert ein vollständiges Datum ausschliesslich mit vierstelligem Jahr', () => {
    for (const input of ['1.2.2028', '01.2.2028', '1.02.2028', '01.02.2028']) {
      assert.deepEqual(parseDateEntry(input, 'de', october), valid('2028-02-01', '01.02.2028'));
    }
  });

  it('entfernt nur äussere Leerzeichen, nicht Trennzeichen oder innere Leerzeichen', () => {
    assert.deepEqual(parseDateEntry('\t 1.2.2028 \n', 'de', october), valid('2028-02-01', '01.02.2028'));
    for (const input of ['1 .2', '1. 2', '1.2. 2028', '0 1']) {
      assert.deepEqual(parseDateEntry(input, 'de', october), { kind: 'invalid', reason: 'format' });
    }
  });

  it('unterstützt h und H in beiden Sprachen, a und A nur auf Französisch', () => {
    for (const locale of ['de', 'fr'] as const) {
      for (const input of ['h', 'H', ' h ']) {
        assert.deepEqual(parseDateEntry(input, locale, october), valid('2026-10-08', '08.10.2026'));
      }
    }
    for (const input of ['a', 'A']) {
      assert.deepEqual(parseDateEntry(input, 'fr', october), valid('2026-10-08', '08.10.2026'));
      assert.deepEqual(parseDateEntry(input, 'de', october), { kind: 'invalid', reason: 'format' });
    }
  });

  it('lehnt mehrdeutige, relative und nicht vereinbarte Formate ab', () => {
    for (const input of [
      '1.2.26', '01.02.026', '01.02.20260', '01022026', '2026-02-01', '1/2/2026',
      '1-2-2026', '1,2,2026', '001', '1.', '1.2.', '.1', '+1', '-1', 'h+10', 'H-1',
      'a+2', 'heute', 'aujourd’hui', 'morgen', '2026-10-08T10:00:00Z', '１.２.２０２６'
    ]) {
      assert.deepEqual(parseDateEntry(input, 'de', october), { kind: 'invalid', reason: 'format' }, input);
    }
  });

  it('lehnt Null, überlange Monate und Tagesüberläufe ab statt sie zu normalisieren', () => {
    for (const input of ['0', '00', '32', '99', '0.1', '1.0', '1.13', '31.4', '31.6', '31.9', '31.11', '29.2.2026']) {
      assert.deepEqual(parseDateEntry(input, 'de', october), { kind: 'invalid', reason: 'date' }, input);
    }
    assert.deepEqual(parseDateEntry('31', 'de', new Date('2026-04-10T12:00:00Z')), { kind: 'invalid', reason: 'date' });
  });

  it('beachtet gregorianische Schaltjahrregeln einschliesslich Jahrhundertgrenzen', () => {
    for (const year of ['2000', '2024', '2028', '2400']) {
      assert.deepEqual(parseDateEntry(`29.2.${year}`, 'de', october), valid(`${year}-02-29`, `29.02.${year}`));
    }
    for (const year of ['1900', '2026', '2100', '2200']) {
      assert.deepEqual(parseDateEntry(`29.2.${year}`, 'de', october), { kind: 'invalid', reason: 'date' });
    }
    assert.deepEqual(parseDateEntry('29.2', 'de', new Date('2028-06-01T12:00:00Z')), valid('2028-02-29', '29.02.2028'));
    assert.deepEqual(parseDateEntry('29.2', 'de', october), { kind: 'invalid', reason: 'date' });
  });

  it('erhält den bestehenden Datumsbereich 0001 bis 9999 ohne künstliche Releasegrenze', () => {
    assert.deepEqual(parseDateEntry('1.1.0001', 'de', october), valid('0001-01-01', '01.01.0001'));
    assert.deepEqual(parseDateEntry('31.12.9999', 'de', october), valid('9999-12-31', '31.12.9999'));
    assert.deepEqual(parseDateEntry('1.1.0000', 'de', october), { kind: 'invalid', reason: 'date' });
  });

  it('verwendet für vollständige Daten keine Systemuhr', () => {
    assert.deepEqual(parseDateEntry('29.2.2028', 'de', new Date(NaN)), valid('2028-02-29', '29.02.2028'));
    assert.deepEqual(parseDateEntry('31.2.2028', 'de', new Date(NaN)), { kind: 'invalid', reason: 'date' });
    assert.deepEqual(parseDateEntry('h+10', 'de', new Date(NaN)), { kind: 'invalid', reason: 'format' });
  });

  it('meldet eine ungültige Uhr ausschliesslich bei uhrabhängigen Eingaben', () => {
    for (const input of ['h', 'a', '1', '1.2']) {
      assert.deepEqual(parseDateEntry(input, 'fr', new Date(NaN)), { kind: 'invalid', reason: 'clock' });
    }
    assert.throws(() => zurichToday(new Date(NaN)), RangeError);
  });

  it('friert alle Ergebnisse ein und wertet bereits aufgelöste Kürzel nicht erneut aus', () => {
    const commitInstant = new Date('2026-10-08T21:59:59Z');
    const resolved = parseDateEntry('h', 'de', commitInstant);
    commitInstant.setTime(new Date('2026-10-09T12:00:00Z').getTime());
    assert.deepEqual(resolved, valid('2026-10-08', '08.10.2026'));
    for (const result of [resolved, parseDateEntry('', 'de'), parseDateEntry('invalid', 'de')]) {
      assert.equal(Object.isFrozen(result), true);
    }
    assert.deepEqual(parseDateEntry('h', 'de', commitInstant), valid('2026-10-09', '09.10.2026'));
  });

  it('formatiert ausschliesslich gültige ISO-Kalenderdaten als DD.MM.JJJJ', () => {
    assert.equal(formatDateEntry('2026-09-16'), '16.09.2026');
    assert.equal(formatDateEntry('0001-01-01'), '01.01.0001');
    assert.equal(formatDateEntry('9999-12-31'), '31.12.9999');
    for (const value of ['', 'h', '2026-9-16', '2026-02-29', '0000-01-01', '2026-09-16T00:00:00Z']) {
      assert.equal(formatDateEntry(value), '', value);
    }
  });
});

describe('AP21 – Europe/Zurich am Bestätigungszeitpunkt', () => {
  it('wechselt heute exakt an der Schweizer Mitternacht im Sommer und Winter', () => {
    for (const [instant, expected] of [
      ['2026-07-08T21:59:59.999Z', '2026-07-08'],
      ['2026-07-08T22:00:00.000Z', '2026-07-09'],
      ['2026-01-08T22:59:59.999Z', '2026-01-08'],
      ['2026-01-08T23:00:00.000Z', '2026-01-09']
    ] as const) {
      assert.equal(zurichToday(new Date(instant)), expected, instant);
    }
  });

  it('wechselt die Ergänzung am Schweizer Monatswechsel, nicht am UTC-Monatswechsel', () => {
    assert.deepEqual(parseDateEntry('31', 'de', new Date('2026-03-31T21:59:59Z')), valid('2026-03-31', '31.03.2026'));
    assert.deepEqual(parseDateEntry('31', 'de', new Date('2026-03-31T22:00:00Z')), { kind: 'invalid', reason: 'date' });
    assert.deepEqual(parseDateEntry('1', 'de', new Date('2026-03-31T22:00:00Z')), valid('2026-04-01', '01.04.2026'));
  });

  it('wechselt das ergänzte Jahr exakt am Schweizer Jahreswechsel', () => {
    assert.deepEqual(parseDateEntry('1.2', 'de', new Date('2026-12-31T22:59:59Z')), valid('2026-02-01', '01.02.2026'));
    assert.deepEqual(parseDateEntry('1.2', 'de', new Date('2026-12-31T23:00:00Z')), valid('2027-02-01', '01.02.2027'));
  });

  it('behält während beider Sommerzeitwechsel denselben bürgerlichen Tag', () => {
    for (const [instant, expected] of [
      ['2026-03-29T00:59:59Z', '2026-03-29'],
      ['2026-03-29T01:00:00Z', '2026-03-29'],
      ['2026-10-25T00:59:59Z', '2026-10-25'],
      ['2026-10-25T01:00:00Z', '2026-10-25']
    ] as const) {
      assert.equal(zurichToday(new Date(instant)), expected);
      assert.deepEqual(parseDateEntry('h', 'de', new Date(instant)), valid(expected, formatDateEntry(expected)));
    }
  });

  it('weist Schweizer Daten ausserhalb des bestehenden gregorianischen Bereichs zurück', () => {
    for (const value of ['0000-06-01T12:00:00Z', '+010000-01-01T12:00:00Z']) {
      assert.throws(() => zurichToday(new Date(value)), RangeError);
      assert.deepEqual(parseDateEntry('h', 'de', new Date(value)), { kind: 'invalid', reason: 'clock' });
    }
  });

  for (const hostTimeZone of ['UTC', 'America/Los_Angeles', 'America/New_York', 'Asia/Tokyo', 'Pacific/Kiritimati']) {
    it(`ist unabhängig von der Prozesszeitzone ${hostTimeZone}`, () => {
      const moduleUrl = new URL('../../src/ui/dateEntry.ts', import.meta.url).href;
      const script = `
        import { parseDateEntry, zurichToday } from ${JSON.stringify(moduleUrl)};
        const now = new Date('2026-12-31T23:30:00Z');
        process.stdout.write(JSON.stringify([
          zurichToday(now), parseDateEntry('h', 'de', now),
          parseDateEntry('2', 'fr', now), parseDateEntry('2.3', 'de', now)
        ]));
      `;
      const child = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', script], {
        env: { ...process.env, TZ: hostTimeZone },
        encoding: 'utf8',
        timeout: 15_000
      });
      assert.equal(child.status, 0, child.stderr);
      assert.deepEqual(JSON.parse(child.stdout), [
        '2027-01-01', valid('2027-01-01', '01.01.2027'),
        valid('2027-01-02', '02.01.2027'), valid('2027-03-02', '02.03.2027')
      ]);
    });
  }
});
