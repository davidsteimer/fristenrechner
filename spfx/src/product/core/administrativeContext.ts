import {getVerifiedAdministrativeDataV10} from './releaseFormat17';
import type {ParsedFormat17Data,VerifiedAdministrativeDataV10} from './releaseFormat17';
import {getVerifiedAdministrativeDataV9} from './releaseFormat16';
import type {ParsedFormat16Data,VerifiedAdministrativeDataV9} from './releaseFormat16';
import {getVerifiedAdministrativeDataV8} from './releaseFormat15';
import type {ParsedFormat15Data,VerifiedAdministrativeDataV8} from './releaseFormat15';
import { getVerifiedAdministrativeDataV7 } from './releaseFormat14';
import type { ParsedFormat14Data, VerifiedAdministrativeDataV7 } from './releaseFormat14';
// SPDX-License-Identifier: AGPL-3.0-only
import { getVerifiedAdministrativeData } from './releaseFormat8';
import { getVerifiedAdministrativeDataV2 } from './releaseFormat9';
import { getVerifiedAdministrativeDataV3 } from './releaseFormat10';
import { getVerifiedAdministrativeDataV4 } from './releaseFormat11';
import { getVerifiedAdministrativeDataV5 } from './releaseFormat12';
import { getVerifiedAdministrativeDataV6 } from './releaseFormat13';
import type { ParsedFormat13Data, VerifiedAdministrativeDataV6 } from './releaseFormat13';
import type { ParsedFormat12Data, VerifiedAdministrativeDataV5 } from './releaseFormat12';
import type { ParsedFormat8Data, VerifiedAdministrativeData } from './releaseFormat8';
import type { ParsedFormat9Data, VerifiedAdministrativeDataV2 } from './releaseFormat9';
import type { ParsedFormat10Data, VerifiedAdministrativeDataV3 } from './releaseFormat10';
import type { ParsedFormat11Data, VerifiedAdministrativeDataV4 } from './releaseFormat11';

export type ParsedAdministrativeContext = ParsedFormat8Data | ParsedFormat9Data | ParsedFormat10Data | ParsedFormat11Data | ParsedFormat12Data | ParsedFormat13Data | ParsedFormat14Data | ParsedFormat15Data | ParsedFormat16Data | ParsedFormat17Data;
/** Both readers retain independent identity-only registries. No conversion. */
export function getVerifiedAdministrativeContext(context: unknown): VerifiedAdministrativeData | VerifiedAdministrativeDataV2 | VerifiedAdministrativeDataV3 | VerifiedAdministrativeDataV4 | VerifiedAdministrativeDataV5 | VerifiedAdministrativeDataV6 | VerifiedAdministrativeDataV7 | VerifiedAdministrativeDataV8 | VerifiedAdministrativeDataV9 | VerifiedAdministrativeDataV10 | undefined {
  return getVerifiedAdministrativeData(context) ?? getVerifiedAdministrativeDataV2(context) ?? getVerifiedAdministrativeDataV3(context) ?? getVerifiedAdministrativeDataV4(context) ?? getVerifiedAdministrativeDataV5(context) ?? getVerifiedAdministrativeDataV6(context) ?? getVerifiedAdministrativeDataV7(context) ?? getVerifiedAdministrativeDataV8(context) ?? getVerifiedAdministrativeDataV9(context) ?? getVerifiedAdministrativeDataV10(context);
}
