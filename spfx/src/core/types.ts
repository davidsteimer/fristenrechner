// SPDX-License-Identifier: AGPL-3.0-only

export type ProviderKind = 'github' | 'sharepointMirror';

export interface IReleaseProvider {
  readonly id: string;
  readonly kind: ProviderKind;
  fetchBytes(relativePath: string): Promise<Uint8Array>;
}

export interface IReleaseArtifactDescriptor {
  readonly path: string;
  readonly role: 'legalProfile' | 'calendar' | 'specialRegimeCatalog';
  readonly contentId: string;
  readonly mediaType: 'application/json';
  readonly schemaId: string;
  readonly byteLength: number;
  readonly sha256: string;
}

export interface IReleaseManifest {
  readonly formatVersion: string;
  readonly dataKind: 'releaseManifest';
  readonly releaseId: string;
  readonly releaseStatus: 'approved';
  readonly immutable: true;
  readonly coverage: {
    readonly from: string;
    readonly to: string | null;
  };
  readonly profileIds: readonly string[];
  readonly calendarIds: readonly string[];
  readonly specialRegimeCatalogIds?: readonly string[];
  readonly checksumAlgorithm: 'sha256';
  readonly artifacts: readonly IReleaseArtifactDescriptor[];
}

export interface IValidatedArtifact {
  readonly descriptor: IReleaseArtifactDescriptor;
  readonly bytes: Uint8Array;
  readonly parsed: unknown;
}

export interface IValidatedRelease {
  readonly releaseId: string;
  readonly formatVersion: string;
  readonly coverageFrom: string;
  readonly coverageTo: string | null;
  readonly profileIds: readonly string[];
  readonly calendarIds: readonly string[];
  readonly specialRegimeCatalogIds?: readonly string[];
  readonly manifestSha256: string;
  readonly manifestBytes: Uint8Array;
  readonly artifacts: readonly IValidatedArtifact[];
  readonly validatedAt: string;
}

export interface IReleaseActivationResult {
  readonly mode: 'network' | 'fallback';
  readonly providerId: string;
  readonly release: IValidatedRelease;
  readonly warning?: string;
}

export interface IValidatedReleaseStore {
  activate(release: IValidatedRelease): Promise<void>;
  getActive(): Promise<IValidatedRelease | undefined>;
}

export interface IProviderOption {
  readonly key: ProviderKind;
  readonly text: string;
  readonly provider?: IReleaseProvider;
  readonly unavailableReason?: string;
}
