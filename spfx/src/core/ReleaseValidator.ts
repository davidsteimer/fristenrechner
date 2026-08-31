// SPDX-License-Identifier: AGPL-3.0-only

import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import calendarSchema from './schemas/calendar.schema.json';
import commonSchema from './schemas/common.schema.json';
import deadlineDefinitionSchema from './schemas/deadline-definition.schema.json';
import filingProfileSchema from './schemas/filing-profile.schema.json';
import legalProfileSchema from './schemas/legal-profile.schema.json';
import releaseManifestSchema from './schemas/release-manifest.schema.json';
import specialRegimeCatalogSchema from './schemas/special-regime-catalog-v2.schema.json';
import { assertSafeReleasePath } from './path';
import type {
  IReleaseArtifactDescriptor,
  IReleaseManifest,
  IReleaseProvider,
  IValidatedArtifact,
  IValidatedRelease
} from './types';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodeJson(bytes: Uint8Array, label: string): unknown {
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} ist kein gültiges UTF-8-JSON: ${message}`);
  }
}

function formatErrors(errors: readonly ErrorObject[] | undefined): string {
  return (errors ?? [])
    .map(error => `${error.instancePath || '/'} ${error.message ?? 'ist ungültig'}`)
    .join(', ');
}

function assertSchema(
  validate: ValidateFunction,
  value: unknown,
  label: string
): asserts value is JsonObject {
  if (!validate(value)) {
    throw new Error(`${label} verletzt das JSON-Schema: ${formatErrors(validate.errors ?? undefined)}`);
  }
}

function collectStringValues(value: unknown, key: string, result: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach(item => collectStringValues(item, key, result));
    return;
  }

  if (!isObject(value)) {
    return;
  }

  Object.keys(value).forEach(property => {
    const child = value[property];
    if (property === key && typeof child === 'string') {
      result.add(child);
    }
    collectStringValues(child, key, result);
  });
}

function collectStringArrayValues(value: unknown, key: string, result: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach(item => collectStringArrayValues(item, key, result));
    return;
  }

  if (!isObject(value)) {
    return;
  }

  Object.keys(value).forEach(property => {
    const child = value[property];
    if (property === key && Array.isArray(child)) {
      child.forEach(item => {
        if (typeof item === 'string') {
          result.add(item);
        }
      });
    }
    collectStringArrayValues(child, key, result);
  });
}

function assertSameIds(label: string, expected: readonly string[], actual: readonly string[]): void {
  const expectedSorted = [...expected].sort();
  const actualSorted = [...actual].sort();

  if (JSON.stringify(expectedSorted) !== JSON.stringify(actualSorted)) {
    throw new Error(`${label} stimmen nicht mit dem Manifest überein.`);
  }
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto mit SHA-256 ist in diesem Host nicht verfügbar.');
  }

  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes.slice().buffer);
  return Array.from(new Uint8Array(digest))
    .map(byte => `0${byte.toString(16)}`.slice(-2))
    .join('');
}

export class ReleaseValidator {
  private readonly manifestValidator: ValidateFunction;
  private readonly legalProfileValidator: ValidateFunction;
  private readonly calendarValidator: ValidateFunction;
  private readonly specialRegimeCatalogValidator: ValidateFunction;

  public constructor() {
    const ajv = new Ajv2020({
      allErrors: true,
      strict: true,
      strictRequired: false
    });
    addFormats(ajv, ['date', 'uri']);
    ajv.addSchema(commonSchema);
    ajv.addSchema(filingProfileSchema);
    ajv.addSchema(deadlineDefinitionSchema);
    this.manifestValidator = ajv.compile(releaseManifestSchema);
    this.legalProfileValidator = ajv.compile(legalProfileSchema);
    this.calendarValidator = ajv.compile(calendarSchema);
    this.specialRegimeCatalogValidator = ajv.compile(specialRegimeCatalogSchema);
  }

  public async validateProvider(provider: IReleaseProvider): Promise<IValidatedRelease> {
    const manifestBytes = await provider.fetchBytes('manifest.json');
    const manifestValue = decodeJson(manifestBytes, 'Manifest');

    if (isObject(manifestValue) && typeof manifestValue.formatVersion === 'string') {
      const major = Number.parseInt(manifestValue.formatVersion.split('.')[0], 10);
      if (major !== 1 && major !== 2) {
        throw new Error(`Unbekannte Hauptversion des Datenformats: ${manifestValue.formatVersion}`);
      }
    }

    assertSchema(this.manifestValidator, manifestValue, 'Manifest');
    const manifest = manifestValue as unknown as IReleaseManifest;
    this.assertManifestContract(manifest);

    const artifacts = await Promise.all(
      manifest.artifacts.map(descriptor => this.loadArtifact(provider, descriptor))
    );

    this.assertSemanticReferences(manifest, artifacts);

    return {
      releaseId: manifest.releaseId,
      formatVersion: manifest.formatVersion,
      coverageFrom: manifest.coverage.from,
      coverageTo: manifest.coverage.to,
      profileIds: [...manifest.profileIds],
      calendarIds: [...manifest.calendarIds],
      ...(manifest.specialRegimeCatalogIds
        ? { specialRegimeCatalogIds: [...manifest.specialRegimeCatalogIds] }
        : {}),
      manifestSha256: await sha256(manifestBytes),
      manifestBytes,
      artifacts,
      validatedAt: new Date().toISOString()
    };
  }

  private assertManifestContract(manifest: IReleaseManifest): void {
    if (manifest.releaseStatus !== 'approved') {
      throw new Error(`Nur freigegebene Datenreleases sind zulässig: ${manifest.releaseStatus}`);
    }

    if (!manifest.immutable || manifest.checksumAlgorithm !== 'sha256') {
      throw new Error('Der Datenrelease ist weder unveränderlich noch SHA-256-gesichert.');
    }

    const paths = new Set<string>();
    const contentKeys = new Set<string>();

    manifest.artifacts.forEach(artifact => {
      assertSafeReleasePath(artifact.path);
      const contentKey = `${artifact.role}:${artifact.contentId}`;

      if (paths.has(artifact.path) || contentKeys.has(contentKey)) {
        throw new Error(`Doppeltes Manifestartefakt: ${artifact.path}`);
      }

      paths.add(artifact.path);
      contentKeys.add(contentKey);
    });
  }

  private async loadArtifact(
    provider: IReleaseProvider,
    descriptor: IReleaseArtifactDescriptor
  ): Promise<IValidatedArtifact> {
    const bytes = await provider.fetchBytes(descriptor.path);

    if (bytes.byteLength !== descriptor.byteLength) {
      throw new Error(`Falsche Dateigrösse für ${descriptor.path}.`);
    }

    const actualHash = await sha256(bytes);
    if (actualHash !== descriptor.sha256) {
      throw new Error(`Falsche SHA-256-Prüfsumme für ${descriptor.path}.`);
    }

    const parsed = decodeJson(bytes, descriptor.path);
    const validator = descriptor.role === 'legalProfile'
      ? this.legalProfileValidator
      : descriptor.role === 'calendar'
        ? this.calendarValidator
        : this.specialRegimeCatalogValidator;
    assertSchema(validator, parsed, descriptor.path);

    const idProperty = descriptor.role === 'legalProfile'
      ? 'profileId'
      : descriptor.role === 'calendar'
        ? 'calendarId'
        : 'catalogId';
    if (parsed[idProperty] !== descriptor.contentId) {
      throw new Error(`Content-ID und Inhalt stimmen für ${descriptor.path} nicht überein.`);
    }

    return {
      descriptor,
      bytes,
      parsed
    };
  }

  private assertSemanticReferences(
    manifest: IReleaseManifest,
    artifacts: readonly IValidatedArtifact[]
  ): void {
    const profiles = artifacts.filter(artifact => artifact.descriptor.role === 'legalProfile');
    const calendars = artifacts.filter(artifact => artifact.descriptor.role === 'calendar');
    const specialRegimeCatalogs = artifacts.filter(
      artifact => artifact.descriptor.role === 'specialRegimeCatalog'
    );
    const profileIds = profiles.map(artifact => artifact.descriptor.contentId);
    const calendarIds = calendars.map(artifact => artifact.descriptor.contentId);
    const specialRegimeCatalogIds = specialRegimeCatalogs.map(
      artifact => artifact.descriptor.contentId
    );

    assertSameIds('Profil-IDs', manifest.profileIds, profileIds);
    assertSameIds('Kalender-IDs', manifest.calendarIds, calendarIds);
    assertSameIds(
      'Spezialregimekatalog-IDs',
      manifest.specialRegimeCatalogIds ?? [],
      specialRegimeCatalogIds
    );

    const knownProfiles = new Set(manifest.profileIds);
    const knownCalendars = new Set(manifest.calendarIds);
    const referencedCalendars = new Set<string>();
    const inheritedCalendars = new Set<string>();
    const referencedProfiles = new Set<string>();

    profiles.forEach(profile => collectStringValues(profile.parsed, 'calendarId', referencedCalendars));
    calendars.forEach(calendar => {
      collectStringArrayValues(calendar.parsed, 'inherits', inheritedCalendars);
      collectStringArrayValues(calendar.parsed, 'applicableProfileIds', referencedProfiles);

      if (isObject(calendar.parsed) && isObject(calendar.parsed.coverage)) {
        const from = calendar.parsed.coverage.from;
        const to = calendar.parsed.coverage.to;
        if (
          typeof from !== 'string' ||
          typeof to !== 'string' ||
          from > manifest.coverage.from ||
          to < manifest.coverage.to
        ) {
          throw new Error(`Kalenderabdeckung ungenügend: ${calendar.descriptor.contentId}`);
        }
      }
    });
    specialRegimeCatalogs.forEach(catalog => {
      collectStringValues(catalog.parsed, 'calendarId', referencedCalendars);
      collectStringValues(catalog.parsed, 'profileId', referencedProfiles);
    });

    Array.from(referencedCalendars).concat(Array.from(inheritedCalendars)).forEach(calendarId => {
      if (!knownCalendars.has(calendarId)) {
        throw new Error(`Unbekannte Kalenderreferenz: ${calendarId}`);
      }
    });

    referencedProfiles.forEach(profileId => {
      if (!knownProfiles.has(profileId)) {
        throw new Error(`Unbekannte Profilreferenz: ${profileId}`);
      }
    });
  }
}
