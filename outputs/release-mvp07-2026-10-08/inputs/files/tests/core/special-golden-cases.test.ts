// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateSpecialDeadline } from '../../src/core';
import type { SpecialDeadlineInput } from '../../src/core';
import {
  SPECIAL_RELEASE_ID,
  specialCalculationData,
  specialGoldenSuite
} from './specialFixtures';

describe('AP11B-Spezialregime-Golden-Cases', () => {
  it('lädt den Format-2-Referenzrelease mit dem fachlich abgenommenen Katalog', () => {
    assert.equal(specialCalculationData.releaseId, SPECIAL_RELEASE_ID);
    assert.equal(specialCalculationData.formatVersion, '2.0.0');
    assert.equal(specialCalculationData.profiles.size, 5);
    assert.equal(specialCalculationData.calendars.size, 2);
    assert.equal(specialCalculationData.specialRegimeCatalogs.size, 1);
    assert.equal(specialGoldenSuite.suiteStatus, 'approved');
  });

  for (const goldenCase of specialGoldenSuite.cases) {
    it(`${goldenCase.caseId} stimmt bytegenau mit der fachlich abgenommenen Erwartung überein`, () => {
      const input: SpecialDeadlineInput = {
        profileId: goldenCase.profileId,
        ...goldenCase.input
      };
      assert.deepEqual(
        calculateSpecialDeadline(input, specialCalculationData),
        goldenCase.expected
      );
    });
  }
});
