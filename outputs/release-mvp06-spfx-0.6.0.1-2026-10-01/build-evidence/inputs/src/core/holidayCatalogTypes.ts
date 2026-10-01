// SPDX-License-Identifier: AGPL-3.0-only

import type { HolidayCalendarRule } from './calendarRuleTypes';

export interface HolidayCatalogProvenance {
  readonly sheet: string;
  readonly table: string;
  readonly row: number;
}

export interface HolidayCatalogLabels {
  readonly de: string;
  readonly fr: string;
  readonly it: string;
  readonly rm: string;
}

export type HolidayCatalogStatus = 'approved' | 'open' | 'blocked';
export type HolidayCatalogCategory = 'publicHoliday' | 'labourLawHoliday' | 'proceduralEquivalentDay';
export type HolidayCatalogCondition = 'always' | 'unlessTuesdayOrSaturday' | 'onlyMonday' | 'shiftHolyThursdayBy7Days';
export type HolidayCatalogCalculation = HolidayCalendarRule['calculation'] | {
  readonly type: 'nthWeekdayOffsetDays';
  readonly month: number;
  readonly isoWeekday: number;
  readonly occurrence: number;
  readonly offsetDays: number;
};

export interface HolidayCatalogJurisdiction {
  readonly id: string;
  readonly labels: HolidayCatalogLabels;
  readonly parentId: string | null;
  readonly coverage: string;
  readonly status: HolidayCatalogStatus;
  readonly sourceUrl: string;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogScope {
  readonly id: string;
  readonly jurisdiction: string;
  readonly labels: HolidayCatalogLabels;
  readonly type: 'National' | 'Kanton' | 'Bezirk' | 'Bezirksausnahme' | 'Gemeinde' | 'Ortsteil' | 'Gebietsgruppe';
  readonly boundary: string;
  readonly source: string;
  readonly locator: string;
  readonly status: HolidayCatalogStatus;
  readonly from: string;
  readonly to: string | null;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogSource {
  readonly id: string;
  readonly jurisdiction: string;
  readonly title: string;
  readonly locator: string;
  readonly url: string;
  readonly versionOn: string | null;
  readonly retrievedOn: string;
  readonly note: string;
  readonly status: HolidayCatalogStatus;
  readonly approvalBasis: string | null;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogRule extends HolidayCatalogLabels {
  readonly id: string;
  readonly jurisdiction: string;
  readonly scope: string;
  readonly category: HolidayCatalogCategory;
  readonly calculation: HolidayCatalogCalculation;
  readonly from: string;
  readonly to: string | null;
  readonly priority: number;
  readonly status: HolidayCatalogStatus;
  readonly approvalBasis: string | null;
  readonly action: 'add';
  readonly target: null;
  readonly exportClass: 'referenceOnly' | 'blockedScope' | 'blockedEffect';
  readonly source: string;
  readonly locator: string;
  readonly dayPortion: 'fullDay' | 'afternoonFromNoon';
  readonly condition: HolidayCatalogCondition;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogAssignment extends HolidayCatalogLabels {
  readonly id: string;
  readonly scopeId: string;
  readonly areaId: string;
  readonly areaType: 'Bund' | 'Kanton' | 'Bezirk' | 'Gemeinde' | 'Ortsteil' | 'Gebietsgruppe';
  readonly parentAreaId: string | null;
  readonly effect: 'include' | 'exclude';
  readonly officialIdSystem: string;
  readonly officialId: string;
  readonly from: string;
  readonly to: string | null;
  readonly sourceId: string;
  readonly locator: string;
  readonly status: 'open' | 'blocked';
  readonly note: string;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogMapping {
  readonly id: string;
  readonly scope: string;
  readonly category: HolidayCatalogCategory;
  readonly context: string;
  readonly boundary: string;
  readonly legalReference: string;
  readonly status: HolidayCatalogStatus;
  readonly approvalBasis: string | null;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogReview {
  readonly id: string;
  readonly source: string;
  readonly trigger: 'newScope' | 'expertClarification';
  readonly on: string;
  readonly result: 'unchanged' | 'changed' | 'unclear' | 'unavailable';
  readonly comparison: string | null;
  readonly finding: string;
  readonly status: 'candidate' | 'withdrawn';
  readonly responsible: string;
  readonly instrument: string;
  readonly next: string;
  readonly provenance: HolidayCatalogProvenance;
}

export interface HolidayCatalogAreaSourceLink {
  readonly assignmentId: string;
  readonly scopeId: string;
  readonly normSourceId: string;
  readonly areaSourceId: string;
  readonly locator: string;
  readonly note: string;
  readonly provenance: HolidayCatalogProvenance;
  readonly status: 'preservedWorkbookEvidenceNotRuntimePermission';
}

export interface HolidayCatalogProjection {
  readonly catalogRuleId: string;
  readonly calendarId: string;
  readonly ruleId: string;
  readonly labelKey: string;
  readonly kind: 'federalHoliday' | 'cantonalPublicHoliday';
  readonly resultIdSuffix: string;
  readonly legalEffect: 'nonWorkingDayEquivalentToSunday';
  readonly approvalBasis: '2026-08-31-mvp-03-approved.1';
}

export interface HolidayCatalogAcceptance {
  readonly kind: 'workbookAcceptance';
  readonly workbookVersion: '0.12';
  readonly workbookContractVersion: '0.6.0';
  readonly workbookFile: string;
  readonly sha256: string;
  readonly acceptedOn: string;
  readonly acceptedBy: string;
  readonly decision: 'DEC-2026-022';
  readonly evidence: string;
  readonly runtimeEnabled: false;
  readonly boundaries: readonly {
    readonly id: string;
    readonly appliesToScopes?: readonly string[];
    readonly appliesToJurisdiction?: string;
    readonly statement: string;
    readonly evidence: string;
  }[];
}

export interface HolidayCatalog {
  readonly $schema: string;
  readonly formatVersion: '1.0.0';
  readonly dataKind: 'holidayCatalog';
  readonly catalogId: 'ch-holiday-catalog';
  readonly provenance: {
    readonly workbook: { readonly fileName: string; readonly sha256: string; readonly byteLength: number };
    readonly importSha256: string;
    readonly decision: 'DEC-2026-023';
  };
  readonly acceptance: HolidayCatalogAcceptance;
  readonly data: {
    readonly jurisdictions: readonly HolidayCatalogJurisdiction[];
    readonly scopes: readonly HolidayCatalogScope[];
    readonly sources: readonly HolidayCatalogSource[];
    readonly rules: readonly HolidayCatalogRule[];
    readonly assignments: readonly HolidayCatalogAssignment[];
    readonly mappings: readonly HolidayCatalogMapping[];
    readonly reviews: readonly HolidayCatalogReview[];
  };
  readonly areaSourceLinks: readonly HolidayCatalogAreaSourceLink[];
  readonly interpretation: {
    readonly computedColumnsAreEvidenceOnly: true;
    readonly inputValuesAndHistoricalStatusesPreserved: true;
    readonly proceduralMappingsAreTextNotExecutablePermissions: true;
    readonly sourceLinksAreNotIndependentApprovalRecords: true;
    readonly translationsAreNotOfficialLanguageApproval: true;
    readonly excludesWorkbookPresentationRoundTrip: true;
  };
  readonly calendarProjections: readonly HolidayCatalogProjection[];
}
