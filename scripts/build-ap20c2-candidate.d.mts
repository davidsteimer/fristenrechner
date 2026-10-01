// SPDX-License-Identifier: AGPL-3.0-only
import type { SocialProcedureCatalog } from '../src/core/socialTypes';
export const candidateRelativePath: string;
export const candidateReleaseId: string;
export interface PreparedAP20C2Candidate {
  readonly files: ReadonlyMap<string, Buffer>;
  readonly verification: Readonly<Record<string, unknown>>;
  readonly catalog: SocialProcedureCatalog;
  readonly manifest: unknown;
}
export function prepareAP20C2Candidate(): PreparedAP20C2Candidate;
export function persistAP20C2Candidate(prepared: PreparedAP20C2Candidate, target?: string, evidenceTarget?: string): void;
