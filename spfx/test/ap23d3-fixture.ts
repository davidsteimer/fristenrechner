// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approvals are exclusively in-memory test shapes, not releases.
import { resolve } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import { IndexedDbValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import type { IReleaseProvider } from '../src/core/types';
import { buildSyntheticFormat8, encodeSyntheticFormat8, type SyntheticFormat8Fixture } from '../../tests/core/ap23d1Fixtures';

export const repository = resolve(process.cwd(), '..');
export const candidateRoot = resolve(repository, 'outputs/ap23d2-candidate-2026-10-15/bundle');
const originalWorkingDirectory = process.cwd();
let fixture: SyntheticFormat8Fixture;
// The existing fixture reads repository-relative source files. Only its
// in-memory construction runs at the repository root, never a file mutation.
try {
  process.chdir(repository);
  fixture = buildSyntheticFormat8('approved');
} finally {
  process.chdir(originalWorkingDirectory);
}
export const approved = fixture;
export const validator = new ReleaseValidator();
export const clone = (): SyntheticFormat8Fixture => ({
  ...approved, manifest: structuredClone(approved.manifest), files: new Map(approved.files)
});
export function provider(value = approved, kind: 'github' | 'sharepointMirror' = 'github', missing?: string): IReleaseProvider {
  return {
    id: 'same-friendly-provider-label', kind,
    cacheConfiguration: kind === 'github'
      ? { kind, baseUrl: `https://raw.githubusercontent.com/example/project/${'1'.repeat(40)}/format8` }
      : { kind, siteAbsoluteUrl: 'https://tenant.example/sites/E', mirrorPath: '/sites/E/Shared Documents/format8' },
    async fetchBytes(path) {
      if (path === missing) throw new Error(`Missing synthetic artifact: ${path}`);
      const text = path === 'manifest.json' ? encodeSyntheticFormat8(value.manifest) : value.files.get(path);
      if (text === undefined) throw new Error(`Unexpected path: ${path}`);
      return new TextEncoder().encode(text);
    }
  };
}
export function offline(value: IReleaseProvider): IReleaseProvider {
  return { ...value, async fetchBytes() { throw new Error('Synthetic offline'); } };
}
export function indexedStore(): IndexedDbValidatedReleaseStore {
  return new IndexedDbValidatedReleaseStore('ap23d3-format8', new IDBFactory());
}
export const adminInput = {
  selection: { kind: 'cantonalAdministrative' as const, lawId: 'lpamm-ti', pathId: 'ti-80-30', revision: 1, stage: 'administrativeAppeal' },
  authoritySeat: { canton: 'TI', level: 'cantonal' as const, qualification: 'competentAuthorityForCurrentAction' as const },
  inputDate: '2026-10-02',
  qualification: { delivery: 'qualifiedActualDelivery' as const, generalRoute: 'qualified' as const, specialLaw: 'excluded' as const,
    explicitHolidayException: 'none' as const, fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
  urgency: 'none' as const
};
