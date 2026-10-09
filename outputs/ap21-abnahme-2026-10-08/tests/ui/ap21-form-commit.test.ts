// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyDateInputCommits } from '../../src/ui/dateFormCommit';
import type { CalculatorFormState } from '../../src/ui/model';
import { EMPTY_SOCIAL_CONTEXT } from '../../src/ui/socialUi';

function form(): CalculatorFormState {
  return {
    authorityCode: 'BE', profileId: 'stpo', inputDate: '2026-09-01', deadlineDays: '10',
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' }, calendarId: 'be-public-holidays',
    calendarOverrideReason: '', additionalHolidayAnchor: '', holidayAnchorConfirmed: false,
    deliveryFictionConfirmed: false, specialLawChecked: false, specialRegimeId: '', specialDefinitionId: '',
    specialDateValues: { firstDate: '2026-09-01', secondDate: '2026-09-02', hiddenDate: '2026-09-03' },
    specialLocalTimeValues: {}, specialIntegerValues: {}, specialOverrideConfirmations: [],
    vrpgContext: { notificationChannel: 'individual-service', holidayConnections: 'partyBE', procedureStartDate: '2025-01-01' }
  };
}

test('AP21 submit snapshot applies all mounted dates atomically without mutating the previous state', () => {
  const previous = form();
  const social = { ...EMPTY_SOCIAL_CONTEXT, jurisdictionCanton: 'BE', jurisdictionReferenceDate: '2026-09-01' };
  const before = JSON.stringify({ previous, social });
  const result = applyDateInputCommits(previous, social, {
    inputDate: { value: '2026-10-01' },
    'special.firstDate': { value: '2026-10-02' },
    'special.secondDate': { value: '2026-10-03' },
    'context.procedureStartDate': { value: '2026-10-04' },
    'social.jurisdictionDate': { value: '2026-10-05' }
  });
  assert.equal(result.form.inputDate, '2026-10-01');
  assert.deepEqual(result.form.specialDateValues, {
    firstDate: '2026-10-02', secondDate: '2026-10-03', hiddenDate: '2026-09-03'
  });
  assert.deepEqual(result.form.vrpgContext, {
    notificationChannel: 'individual-service', holidayConnections: 'partyBE', procedureStartDate: '2026-10-04'
  });
  assert.equal(result.socialContext.jurisdictionReferenceDate, '2026-10-05');
  assert.equal(result.socialContext.jurisdictionCanton, 'BE');
  assert.deepEqual(result.errors, {});
  assert.equal(JSON.stringify({ previous, social }), before);
});

test('AP21 invalid or cleared drafts replace old ISO dates with empty values in every field family', () => {
  const result = applyDateInputCommits(form(), { ...EMPTY_SOCIAL_CONTEXT, jurisdictionReferenceDate: '2026-09-01' }, {
    inputDate: { value: '', errorMessage: 'Kein gültiger Tag' },
    'special.firstDate': { value: '', errorMessage: 'Ungültiges Ankerdatum' },
    'context.procedureStartDate': { value: '', errorMessage: 'Ungültiger Verfahrensbeginn' },
    'social.jurisdictionDate': { value: '', errorMessage: 'Ungültiger Zuständigkeitszeitpunkt' }
  });
  assert.equal(result.form.inputDate, '');
  assert.equal(result.form.specialDateValues.firstDate, '');
  assert.equal(result.form.vrpgContext?.procedureStartDate, '');
  assert.equal(result.socialContext.jurisdictionReferenceDate, '');
  assert.deepEqual(result.errors, {
    inputDate: 'Kein gültiger Tag',
    'special.firstDate': 'Ungültiges Ankerdatum',
    'context.procedureStartDate': 'Ungültiger Verfahrensbeginn',
    'social.jurisdictionDate': 'Ungültiger Zuständigkeitszeitpunkt'
  });
});

test('AP21 a commit can initialise procurement context without inventing other case facts', () => {
  const previous = form();
  const { vrpgContext: _context, ...withoutContext } = previous;
  const result = applyDateInputCommits(withoutContext, EMPTY_SOCIAL_CONTEXT, {
    'context.procedureStartDate': { value: '2026-01-01' }
  });
  assert.deepEqual(result.form.vrpgContext, {
    procedureStartDate: '2026-01-01', notificationChannel: '', holidayConnections: ''
  });
  assert.equal(result.socialContext, EMPTY_SOCIAL_CONTEXT);
});

test('AP21 no mounted commits leave existing states untouched', () => {
  const previous = form();
  const result = applyDateInputCommits(previous, EMPTY_SOCIAL_CONTEXT, {});
  assert.equal(result.form, previous);
  assert.equal(result.socialContext, EMPTY_SOCIAL_CONTEXT);
  assert.deepEqual(result.errors, {});
});

test('AP21 unknown, empty and prototype-related field names cannot enter a submit snapshot', () => {
  for (const name of ['unregistered', 'special.', 'special.__proto__', 'special.prototype', 'special.constructor']) {
    assert.throws(() => applyDateInputCommits(form(), EMPTY_SOCIAL_CONTEXT, { [name]: { value: '2026-10-08' } }));
  }
});
