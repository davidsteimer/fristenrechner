// SPDX-License-Identifier: AGPL-3.0-only
import type { SocialProcedureCatalog } from '../src/core/socialTypes';
export const candidateRelativePath: string;
export const candidateReleaseId: string;
export interface PreparedAP20C3Candidate {
  readonly files: ReadonlyMap<string, Buffer>;
  readonly verification: Readonly<Record<string, unknown>>;
  readonly catalog: SocialProcedureCatalog;
  readonly manifest: unknown;
}
export function prepareAP20C3Candidate(): PreparedAP20C3Candidate;
export function persistAP20C3Candidate(prepared: PreparedAP20C3Candidate, target?: string, evidenceTarget?: string): void;
