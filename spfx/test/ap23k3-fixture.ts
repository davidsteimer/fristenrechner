// SPDX-License-Identifier: AGPL-3.0-only
// Purely synthetic in-memory approvals. Never release or upload authority.
import { resolve } from 'node:path';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import type { IReleaseProvider } from '../src/core/types';
import { buildSyntheticFormat15, encode15, type SyntheticFormat15 } from '../../tests/core/ap23k3Fixtures';

export const candidateRoot = resolve(process.cwd(), '../data/candidates/2026-10-27-ap23k3');
export const approved = buildSyntheticFormat15('approved');
export const validator = new ReleaseValidator();
export const clone = (): SyntheticFormat15 => ({manifest: structuredClone(approved.manifest), files: new Map(approved.files)});
export function provider(value = approved, kind: 'github' | 'sharepointMirror' = 'github', missing?: string): IReleaseProvider {
  return { id: 'same-friendly-provider-label', kind,
    cacheConfiguration: kind === 'github'
      ? {kind, baseUrl: 'https://raw.githubusercontent.com/example/project/' + '1'.repeat(40) + '/format15'}
      : {kind, siteAbsoluteUrl: 'https://tenant.example/sites/E', mirrorPath: '/sites/E/Shared Documents/format15'},
    async fetchBytes(path) {
      if (path === missing) throw new Error('Missing synthetic artifact: ' + path);
      const text = path === 'manifest.json' ? encode15(value.manifest) : value.files.get(path);
      if (text === undefined) throw new Error('Unexpected path: ' + path);
      return new TextEncoder().encode(text);
    }
  };
}
export const adminInput = {
  selection: {kind: 'cantonalAdministrative' as const, lawId: 'lpamm-ti', pathId: 'ti-80-30', revision: 1, stage: 'administrativeAppeal'},
  authoritySeat: {canton: 'TI', level: 'cantonal' as const, qualification: 'competentAuthorityForCurrentAction' as const},
  inputDate: '2026-10-02',
  qualification: {delivery: 'qualifiedActualDelivery' as const, generalRoute: 'qualified' as const, specialLaw: 'excluded' as const,
    explicitHolidayException: 'none' as const, fixedEndDate: false, deviatingStart: false, evidenceAdvance: false},
  urgency: 'none' as const
};
