// SPDX-License-Identifier: AGPL-3.0-only
import { getVerifiedAdministrativeData } from './releaseFormat8';
import { getVerifiedAdministrativeDataV2 } from './releaseFormat9';
import type { ParsedFormat8Data, VerifiedAdministrativeData } from './releaseFormat8';
import type { ParsedFormat9Data, VerifiedAdministrativeDataV2 } from './releaseFormat9';

export type ParsedAdministrativeContext = ParsedFormat8Data | ParsedFormat9Data;
/** Both readers retain independent identity-only registries. No conversion. */
export function getVerifiedAdministrativeContext(context: unknown): VerifiedAdministrativeData | VerifiedAdministrativeDataV2 | undefined {
  return getVerifiedAdministrativeData(context) ?? getVerifiedAdministrativeDataV2(context);
}
