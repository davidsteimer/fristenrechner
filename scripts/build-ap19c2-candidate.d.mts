// SPDX-License-Identifier: AGPL-3.0-only
import type { SocialProcedureCatalog } from '../src/core/socialTypes';
export const candidateRelativePath: string;
export const candidateReleaseId: string;
export interface PreparedAP19C2Candidate {
  readonly files: ReadonlyMap<string, Buffer>;
  readonly verification: Readonly<Record<string, unknown>>;
  readonly catalog: SocialProcedureCatalog;
  readonly manifest: unknown;
}
export function prepareAP19C2Candidate(): PreparedAP19C2Candidate;
export function persistAP19C2Candidate(prepared: PreparedAP19C2Candidate, target?: string, evidenceTarget?: string): void;
