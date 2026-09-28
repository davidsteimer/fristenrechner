// SPDX-License-Identifier: AGPL-3.0-only
import type { SocialProcedureCatalog } from '../src/core/socialTypes';

export const candidateRelativePath: string;
export const candidateReleaseId: string;
export interface PreparedAP19CCandidate {
  readonly files: ReadonlyMap<string, Buffer>;
  readonly verification: Readonly<Record<string, unknown>>;
  readonly catalog: SocialProcedureCatalog;
  readonly rest: unknown;
  readonly manifest: unknown;
}
export function prepareAP19CCandidate(): PreparedAP19CCandidate;
export function persistAP19CCandidate(prepared: PreparedAP19CCandidate, target?: string, evidenceTarget?: string): void;
