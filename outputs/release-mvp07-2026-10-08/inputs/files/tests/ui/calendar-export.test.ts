// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  CALENDAR_EXPORT_CONTRACT,
  createDeadlineCalendarEntry,
  downloadDeadlineCalendarEntry,
  normalizeCalendarReference
} from '../../src/ui/calendarExport';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixedMetadata = {
  uid: 'frist-2026-09-16@example.invalid',
  createdAt: new Date('2026-08-31T07:30:45.123Z')
} as const;

function unfold(content: string): string {
  return content.replace(/\r\n[ \t]/g, '');
}

describe('Issue #18 – Outlook-kompatibler Kalendereintrag', () => {
  it('erzeugt ohne Referenz einen ganztägigen, freien Termin am Fristablauf', () => {
    const artifact = createDeadlineCalendarEntry({
      deadlineDate: '2026-09-16',
      locale: 'de',
      ...fixedMetadata
    });
    const content = unfold(artifact.content);

    assert.equal(artifact.filename, 'fristablauf-2026-09-16.ics');
    assert.equal(artifact.mimeType, 'text/calendar;charset=utf-8');
    assert.match(content, /\r\nDTSTART;VALUE=DATE:20260916\r\n/);
    assert.match(content, /\r\nDTEND;VALUE=DATE:20260917\r\n/);
    assert.match(content, /\r\nSUMMARY:Fristablauf\r\n/);
    assert.match(content, /\r\nTRANSP:TRANSPARENT\r\n/);
    assert.match(content, /\r\nX-MICROSOFT-CDO-BUSYSTATUS:FREE\r\n/);
    assert.match(content, /\r\nCATEGORIES:Fristablauf\r\n/);
    assert.match(content, /\r\nTRIGGER:-PT112H\r\n/);
    assert.doesNotMatch(content, /SUMMARY:Fristablauf \(\)/);
    assert.ok(artifact.content.endsWith('\r\n'));
    assert.doesNotMatch(artifact.content.replace(/\r\n/g, ''), /[\r\n]/);
  });

  it('bestimmt das exklusive Terminende über Monats-, Jahres- und Schaltjahrgrenzen', () => {
    const cases = [
      ['2026-01-31', '20260201'],
      ['2026-12-31', '20270101'],
      ['2028-02-29', '20280301']
    ] as const;

    cases.forEach(([deadlineDate, expectedEnd]) => {
      const artifact = createDeadlineCalendarEntry({
        deadlineDate,
        locale: 'de',
        ...fixedMetadata
      });
      assert.match(unfold(artifact.content), new RegExp(`DTEND;VALUE=DATE:${expectedEnd}`));
    });
  });

  it('behandelt eine französische Referenz mit Sonderzeichen ohne Content-Line-Injection', () => {
    const reference = '  Dossier, été; \\ test\r\nN° 42  ';
    const artifact = createDeadlineCalendarEntry({
      deadlineDate: '2026-09-16',
      locale: 'fr',
      reference,
      ...fixedMetadata
    });
    const content = unfold(artifact.content);

    assert.match(content, /SUMMARY:Échéance du délai \(Dossier\\, été\\; \\\\ test N° 42\)/);
    assert.match(content, /CATEGORIES:Fristablauf/);
    assert.doesNotMatch(content, /\r\nN° 42/);
    assert.equal(normalizeCalendarReference(reference), 'Dossier, été; \\ test N° 42');
  });

  it('faltet lange UTF-8-Zeilen auf höchstens 75 Oktette', () => {
    const artifact = createDeadlineCalendarEntry({
      deadlineDate: '2026-09-16',
      locale: 'fr',
      reference: 'É'.repeat(200),
      ...fixedMetadata
    });

    artifact.content.split('\r\n').filter(Boolean).forEach(line => {
      assert.ok(Buffer.byteLength(line, 'utf8') <= 75, `${Buffer.byteLength(line, 'utf8')} Oktette: ${line}`);
    });
    assert.equal(normalizeCalendarReference('É'.repeat(205)).length, 200);
  });

  it('behält den 112-Stunden-Trigger über beide Schweizer Zeitumstellungen unverändert', () => {
    ['2027-03-29', '2027-10-25'].forEach(deadlineDate => {
      const content = createDeadlineCalendarEntry({
        deadlineDate,
        locale: 'de',
        ...fixedMetadata
      }).content;
      assert.equal(content.match(/TRIGGER:-PT112H/g)?.length, 1);
    });
    assert.equal(CALENDAR_EXPORT_CONTRACT.reminderTrigger, '-PT112H');
  });

  it('weist ungültige Fristdaten ab und führt weder Netzwerk- noch Graphzugriffe aus', async () => {
    assert.throws(() => createDeadlineCalendarEntry({
      deadlineDate: '2026-02-30',
      locale: 'de',
      ...fixedMetadata
    }), /gültigen Fristablauf/);

    const source = await readFile(resolve(repositoryRoot, 'src/ui/calendarExport.ts'), 'utf8');
    assert.doesNotMatch(source, /fetch\s*\(|graph\.microsoft|microsoft-graph|msal/i);
    assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB/i);
  });

  it('löst den lokalen Blob-Download aus und räumt das temporäre Objekt wieder auf', async () => {
    const artifact = createDeadlineCalendarEntry({
      deadlineDate: '2026-09-16',
      locale: 'de',
      ...fixedMetadata
    });
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    let appended = 0;
    let clicked = 0;
    let removed = 0;
    let revoked = '';
    const anchor = {
      href: '',
      download: '',
      hidden: false,
      click: () => { clicked += 1; },
      remove: () => { removed += 1; }
    };

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        createElement: (tagName: string) => {
          assert.equal(tagName, 'a');
          return anchor;
        },
        body: {
          appendChild: (node: unknown) => {
            assert.equal(node, anchor);
            appended += 1;
          }
        }
      }
    });
    URL.createObjectURL = blob => {
      assert.ok(blob instanceof Blob);
      assert.equal(blob.type, artifact.mimeType);
      return 'blob:issue-18-test';
    };
    URL.revokeObjectURL = value => { revoked = value; };

    try {
      downloadDeadlineCalendarEntry(artifact);
      await new Promise(resolvePromise => globalThis.setTimeout(resolvePromise, 0));
      assert.equal(anchor.href, 'blob:issue-18-test');
      assert.equal(anchor.download, artifact.filename);
      assert.equal(anchor.hidden, true);
      assert.equal(appended, 1);
      assert.equal(clicked, 1);
      assert.equal(removed, 1);
      assert.equal(revoked, 'blob:issue-18-test');
    } finally {
      URL.createObjectURL = originalCreateObjectUrl;
      URL.revokeObjectURL = originalRevokeObjectUrl;
      if (originalDocument) {
        Object.defineProperty(globalThis, 'document', originalDocument);
      } else {
        Reflect.deleteProperty(globalThis, 'document');
      }
    }
  });
});
