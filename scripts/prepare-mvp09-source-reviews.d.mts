// SPDX-License-Identifier: AGPL-3.0-only
// Narrow declaration of the promotion-facing, byte-bound governance interface.
export const root: string;
export const prefix: string;
export const releaseId: '2026-10-18-mvp-09-approved.1';
export const candidateRoot: string;
export const candidateHash: string;
export const sourceApprovalPath: string;
export const sourceApprovalHash: string;
export const sourceReviewRef: Readonly<{ reviewId: string; sha256: string }>;
export const adminSourceReviewRef: Readonly<{ id: string; sha256: string }>;
export const authorityPath: string;
export const decisionPath: string;
export const bridgePath: string;
export const adoptionPath: string;
export const suitePath: string;
export function hash(bytes: Uint8Array | string): string;
export function encode(value: unknown): Buffer;
export function readRegular(repository: string, path: string, optional?: false): Promise<Buffer>;
export function readRegular(repository: string, path: string, optional: true): Promise<Buffer | undefined>;
export function writeExclusive(repository: string, path: string, bytes: Uint8Array): Promise<void>;
export function requireAuthority(repository?: string): Promise<{
  path: string;
  sha256: string;
  record: Readonly<Record<string, unknown>>;
}>;
export function verifyGovernance(repository?: string): Promise<Readonly<Record<string, unknown>>>;

