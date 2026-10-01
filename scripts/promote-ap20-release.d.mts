// SPDX-License-Identifier: AGPL-3.0-only
import type { SocialProcedureCatalog, ValidatedReleaseLike } from '../src/core';
export const MVP06_RELEASE_ID: string;
export const MVP06_PROMOTION_REPORT: string;
export const AP20C3_CANDIDATE_PATH: string;
export const AP20C3_CANDIDATE_MANIFEST_SHA256: string;
export const MVP06_SOURCE_APPROVAL_PATH: string;
export const MVP06_SOURCE_APPROVAL_SHA256: string;
export const MVP06_DECISION_PATH: string;
export const MVP06_REVIEW_PATH: string;
export const MVP06_REVIEW_SHA256: string;
export const MVP06_REFERENCE_SUITES: Readonly<Record<string, {path: string; sha256: string}>>;
export interface PreparedMvp06Promotion {
  manifest: unknown;
  catalog: SocialProcedureCatalog;
  files: Map<string, Buffer>;
  report: Record<string, unknown>;
}
export function mvp06Sha256(bytes: Uint8Array): string;
export function mvp06CalculationRelease(manifest: unknown, files: ReadonlyMap<string, Buffer>): ValidatedReleaseLike;
export function assertMvp06PromotionDelta(before: SocialProcedureCatalog, after: SocialProcedureCatalog, previous: SocialProcedureCatalog): void;
export function prepareMvp06Promotion(repository?: string): Promise<PreparedMvp06Promotion>;
export function validateMvp06Promotion(prepared: PreparedMvp06Promotion): Promise<PreparedMvp06Promotion>;
export function writeMvp06Promotion(prepared: PreparedMvp06Promotion, outputRepository?: string): Promise<Record<string, unknown>>;
