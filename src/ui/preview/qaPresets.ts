// SPDX-License-Identifier: AGPL-3.0-only

import type { CalculatorFormState } from '../model';

const presets: Readonly<Record<string, Partial<CalculatorFormState>>> = {
  'stpo-weekend': {
    authorityCode: 'BE',
    profileId: 'stpo',
    inputDate: '2026-09-16',
    deadlineDays: '10',
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
    calendarId: 'be-public-holidays'
  },
  'delivery-block': {
    authorityCode: 'BE',
    profileId: 'stpo',
    inputDate: '2027-09-01',
    deadlineDays: '10',
    selectors: { deliveryMethod: 'registeredMailUncollected' },
    calendarId: 'be-public-holidays',
    deliveryFictionConfirmed: false
  },
  'special-law-block': {
    authorityCode: 'BE',
    profileId: 'vrpg-be',
    inputDate: '2027-09-01',
    deadlineDays: '30',
    selectors: {
      deliveryMethod: 'otherLegallyRelevantDate',
      specialLawStatus: 'noKnownOverride'
    },
    calendarId: 'be-public-holidays',
    specialLawChecked: false
  },
  'anchor-block': {
    authorityCode: 'BE',
    profileId: 'stpo',
    inputDate: '2027-09-01',
    deadlineDays: '10',
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
    calendarId: 'be-public-holidays',
    additionalHolidayAnchor: 'FR',
    holidayAnchorConfirmed: false
  },
  'vrpg-special-original': {
    authorityCode: 'BE',
    profileId: 'vrpg-be',
    specialRegimeId: 'prg-be-111a-replacement-candidacy',
    specialDefinitionId: 'PRGBE-SPEC-WEEKDAY-111',
    specialDateValues: { firstBallotDate: '2026-03-29' },
    calendarId: 'be-public-holidays'
  },
  'vrpg-special-gate': {
    authorityCode: 'BE',
    profileId: 'vrpg-be',
    specialRegimeId: 'vrpg-be-67a-3-preparatory-act',
    specialDefinitionId: 'VRPGBE-SPEC-REL-673',
    specialDateValues: {
      preparatoryActNoticeDate: '2026-03-10',
      pollDate: '2026-03-29'
    },
    calendarId: 'be-public-holidays'
  }
};

export function qaPreset(search: string): Partial<CalculatorFormState> | undefined {
  const key = new URLSearchParams(search).get('qa');
  return key ? presets[key] : undefined;
}
