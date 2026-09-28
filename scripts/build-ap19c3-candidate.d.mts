// SPDX-License-Identifier: AGPL-3.0-only
import type { SocialProcedureCatalog } from '../src/core/socialTypes';
export const candidateRelativePath: string;
export const candidateReleaseId: string;
export interface PreparedAP19C3Candidate {
  readonly files: ReadonlyMap<string, Buffer>;
  readonly verification: Readonly<Record<string, unknown>>;
  readonly catalog: SocialProcedureCatalog;
  readonly manifest: unknown;
}
export function prepareAP19C3Candidate(): PreparedAP19C3Candidate;
export function persistAP19C3Candidate(prepared: PreparedAP19C3Candidate, target?: string, evidenceTarget?: string): void;

