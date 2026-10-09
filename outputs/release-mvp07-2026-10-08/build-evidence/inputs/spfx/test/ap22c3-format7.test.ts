// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic approvals exist exclusively in this in-memory test transport.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { getProviderCacheIdentity } from '../src/core/cacheIdentity';
import { ReleaseService } from '../src/core/ReleaseService';
import { ReleaseValidator } from '../src/core/ReleaseValidator';
import { MemoryValidatedReleaseStore } from '../src/core/ValidatedReleaseStore';
import { rebindSocialCalendarCandidate } from '../src/product/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../src/product/core/format7Baseline';
import { projectActivatedCalendars } from '../src/product/core/holidayActivation';
import { createCalculatorRuntime } from '../src/product/core/calculatorRuntime';
import type { IReleaseProvider } from '../src/core/types';

type Document = Record<string, any>;
interface Fixture { manifest: Document; files: Map<string, string> }
const repository = resolve(process.cwd(), '..');
const candidateRoot = resolve(repository, 'outputs/ap22c3-2026-10-08/bundle');
const originalRoot = resolve(repository, 'data/releases/2026-10-01-mvp-06-approved.1');
const read = (path: string): Document => JSON.parse(readFileSync(path, 'utf8')) as Document;
const encode = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const sha = (text: string): string => createHash('sha256').update(text).digest('hex');
const releaseId = '2026-10-08-synthetic-spfx-format7.1';
const validator = new ReleaseValidator();

function seal(fixture: Fixture): void {
  for (const descriptor of fixture.manifest.artifacts) {
    const text = fixture.files.get(descriptor.path)!;
    descriptor.byteLength = Buffer.byteLength(text);
    descriptor.sha256 = sha(text);
  }
}

function fixture(calendarApproval = true, socialApproval = true): Fixture {
  const manifest = read(resolve(candidateRoot, 'manifest.json'));
  assert.equal(manifest.releaseStatus, 'candidate');
  assert.equal(manifest.sourceSummary.legalBasisReviewStatus, 'pending');
  const files = new Map<string, string>(manifest.artifacts.map((descriptor: Document) => [
    descriptor.path, readFileSync(resolve(candidateRoot, descriptor.path), 'utf8')
  ]));
  const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
  const catalog = JSON.parse(files.get(catalogPath)!);
  if (calendarApproval) catalog.activation.releaseEligibility = {
    status: 'approved', releaseId,
    approval: { on: '2026-10-08', by: 'SYNTHETIC TEST ONLY', evidence: 'TEST-NOT-A-RELEASE' }
  };
  const catalogText = encode(catalog);
  files.set(catalogPath, catalogText);
  const calendars = projectActivatedCalendars(catalog, sha(catalogText), FORMAT7_LEGACY_CALENDAR_BASELINE);
  assert.equal(calendars.length, 32);
  for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, encode(calendar));
  const calendarRefs = ['ch-federal-calendar', 'be-public-holidays'].map(contentId => ({
    role: 'calendar' as const, contentId, sha256: sha(files.get(`calendars/${contentId}.json`)!)
  }));
  const social: any = rebindSocialCalendarCandidate(
    read(resolve(originalRoot, 'social-procedures/ch-social-procedures.json')) as any,
    releaseId, [...calendarRefs, { role: 'holidayCatalog', contentId: 'ch-holiday-catalog', sha256: sha(catalogText) }]
  );
  if (socialApproval) for (const entry of social.releaseEligibility) {
    entry.status = 'approved';
    entry.approval = { approvedBy: 'SYNTHETIC TEST ONLY', approvedOn: '2026-10-08', decisionRef: 'TEST-NOT-A-RELEASE' };
  }
  files.set('social-procedures/ch-social-procedures.json', encode(social));
  manifest.$schema = manifest.$schema.replace('local-reference-manifest-v7', 'release-manifest-v7');
  manifest.releaseId = releaseId;
  manifest.releaseStatus = 'approved';
  manifest.sourceSummary.latestReviewedOn = '2026-10-08';
  manifest.sourceSummary.legalBasisReviewStatus = 'verified';
  const result = { manifest, files };
  seal(result);
  return result;
}

function provider(data: Fixture, kind: 'github' | 'sharepointMirror' = 'github', missing?: string): IReleaseProvider {
  return {
    id: `synthetic-format7:${kind}`, kind,
    cacheConfiguration: kind === 'github' ? {
      kind, baseUrl: `https://raw.githubusercontent.com/example/project/${'1'.repeat(40)}/format7-test`
    } : {
      kind, siteAbsoluteUrl: 'https://example.invalid/sites/test',
      mirrorPath: '/sites/test/Shared Documents/releases/format7-test'
    },
    async fetchBytes(path) {
      if (path === missing) throw new Error(`Synthetisches Artefakt fehlt: ${path}`);
      const text = path === 'manifest.json' ? encode(data.manifest) : data.files.get(path);
      assert.notEqual(text, undefined, path);
      return new TextEncoder().encode(text);
    }
  };
}

const approved = fixture();
function clone(): Fixture { return { manifest: structuredClone(approved.manifest), files: new Map(approved.files) }; }
function change(data: Fixture, path: string, mutate: (document: Document) => void): void {
  const document = JSON.parse(data.files.get(path)!);
  mutate(document);
  data.files.set(path, encode(document));
  seal(data);
}

test('echtes AP22C3-Bundle bleibt pending und wird vor jeglichem Artefaktabruf gesperrt', async () => {
  const fetched: string[] = [];
  const real: IReleaseProvider = {
    ...provider(approved), id: 'real-pending-ap22c3',
    async fetchBytes(path) {
      fetched.push(path);
      return new Uint8Array(readFileSync(resolve(candidateRoot, path)));
    }
  };
  const store = new MemoryValidatedReleaseStore();
  await assert.rejects(new ReleaseService(store, validator).refresh(real), /Format-7-Manifest.*JSON-Schema/);
  assert.deepEqual(fetched, ['manifest.json']);
  assert.equal(await store.getActive(getProviderCacheIdentity(real)), undefined);
  assert.equal(read(resolve(candidateRoot, 'manifest.json')).sourceSummary.legalBasisReviewStatus, 'pending');
});

test('vollständige synthetische gemeinsame Freigabe lädt Format7 mit40 originalbytegebundenen Artefakten', async () => {
  const release = await validator.validateProvider(provider(approved));
  assert.equal(release.formatVersion, '7.0.0');
  assert.equal(release.releaseId, releaseId);
  assert.equal(release.artifacts.length, 40);
  assert.equal(release.calendarIds.length, 32);
  assert.equal(release.profileIds.length, 5);
  const runtime = createCalculatorRuntime(release);
  assert.equal(runtime.data.calendarRuleSets.size, 32);
  assert.equal(runtime.calendarRuntime?.referenceOnly, false);
  const social = runtime.data.socialProcedureCatalogs!.get('ch-social-procedures')!;
  assert.equal(social.releaseEligibility.length, 50);
  assert.ok(social.releaseEligibility.every(entry => entry.releaseId === releaseId && entry.status === 'approved'));
});

test('synthetischer GitHub- und SharePoint-Transport liefern byteidentisches Format7', async () => {
  const github = await validator.validateProvider(provider(approved));
  const mirror = await validator.validateProvider(provider(approved, 'sharepointMirror'));
  assert.equal(github.manifestSha256, mirror.manifestSha256);
  assert.deepEqual(github.artifacts.map(artifact => artifact.descriptor.sha256), mirror.artifacts.map(artifact => artifact.descriptor.sha256));
  assert.notEqual(getProviderCacheIdentity(provider(approved)), getProviderCacheIdentity(provider(approved, 'sharepointMirror')));
});

test('Format7-Fallback ignoriert manipulierte parsed-Objekte und validiert bei gleichem Pin Originalbytes erneut', async () => {
  const store = new MemoryValidatedReleaseStore();
  const service = new ReleaseService(store, validator);
  const online = provider(approved);
  const initial = await service.refresh(online);
  const key = getProviderCacheIdentity(online);
  const stored = (await store.getActive(key))!;
  await store.activate({ ...stored, artifacts: stored.artifacts.map(artifact => ({ ...artifact, parsed: { manipulated: true } })) }, key);
  const fallback = await service.refresh({ ...online, async fetchBytes() { throw new Error('Synthetisch offline'); } });
  assert.equal(fallback.mode, 'fallback');
  assert.equal(fallback.release.manifestSha256, initial.release.manifestSha256);
  assert.ok(fallback.release.artifacts.every(artifact => !(artifact.parsed as Document).manipulated));
  assert.equal(createCalculatorRuntime(fallback.release).data.calendars.size, 32);
});

test('Format7 weist veränderte Originalbytes trotz formal gültigem JSON zurück', async () => {
  const changed = clone();
  changed.files.set('calendars/be-public-holidays.json', `${changed.files.get('calendars/be-public-holidays.json')} `);
  await assert.rejects(validator.validateProvider(provider(changed)));
});

test('Format7 weist ein fehlendes manifestgebundenes Kalenderartefakt zurück', async () => {
  await assert.rejects(validator.validateProvider(provider(approved, 'github', 'calendars/be-public-holidays.json')), /Artefakt fehlt/);
});

test('Manifestfreigabe ersetzt keine Kalenderfreigabe, auch bei neu aufgebauten Projektionen und Sozialreferenzen', async () => {
  await assert.rejects(validator.validateProvider(provider(fixture(false, true))));
});

test('Kalenderfreigabe ersetzt keine gemeinsame Sozialfreigabe für den neuen Release', async () => {
  await assert.rejects(validator.validateProvider(provider(fixture(true, false))));
});

test('eine einzige neu versiegelte abweichende Sozialbindung blockiert den gesamten Format7-Release', async () => {
  const changed = clone();
  change(changed, 'social-procedures/ch-social-procedures.json', social => {
    social.releaseEligibility[0].status = 'candidate';
    social.releaseEligibility[0].approval = null;
  });
  await assert.rejects(validator.validateProvider(provider(changed)));
});

test('neu versiegelter veralteter Sozialkomponentenhash blockiert Format7', async () => {
  const changed = clone();
  change(changed, 'social-procedures/ch-social-procedures.json', social => {
    social.releaseEligibility[0].componentRefs[0].sha256 = '0'.repeat(64);
  });
  await assert.rejects(validator.validateProvider(provider(changed)));
});
