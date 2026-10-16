// SPDX-License-Identifier: AGPL-3.0-only
// Local reference candidate only. This builder never promotes a source release.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { projectActivatedCalendars } from '../src/core/holidayActivation';
import { rebindSocialCalendarCandidate } from '../src/core/calendarMigration';
import { parseFormat8LocalReferenceData } from '../src/core/releaseFormat8';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../src/core/format7Baseline';
import type { ParsedFormat8Data } from '../src/core/releaseFormat8';
import type { ReleaseArtifactReference } from '../src/core/socialTypes';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = 'data/releases/2026-10-08-mvp-07-approved.1';
const contract = 'tests/golden/candidates/ap23c-administrative-contract.json';
const contractQa = 'outputs/ap23c-vertrag-2026-10-14/QA-AP23C.json';
const target = 'outputs/ap23d2-candidate-2026-10-15/bundle';
const modulePath = 'src/release/ap23d2CandidateData.ts';
const releaseId = '2026-10-15-ap23d2-reference.1';
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const encode = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex');
const schemaNames: Record<string, string> = {
  legalProfile: 'legal-profile', calendar: 'calendar-rules-v3', holidayCatalog: 'holiday-catalog-v2',
  specialRegimeCatalog: 'special-regime-catalog-v3', socialProcedureCatalog: 'social-procedure-catalog-v2',
  administrativeProcedureCatalog: 'administrative-procedure-catalog'
};
export interface AP23D2Candidate {
  readonly manifestText: string;
  readonly files: ReadonlyMap<string, string>;
  readonly context: ParsedFormat8Data;
  readonly generatedModule: string;
  readonly integrityText: string;
}

/** Derive only from byte-verified historical inputs, then validate actual bytes. */
export async function buildAP23D2Candidate(): Promise<AP23D2Candidate> {
  const baselineText = await readFile(resolve(root, source, 'manifest.json'), 'utf8');
  assert.equal(sha(baselineText), 'fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597', 'MVP07 baseline manifest changed');
  const baseline = JSON.parse(baselineText);
  const baselineFiles = new Map<string, string>();
  for (const descriptor of baseline.artifacts) {
    const text = await readFile(resolve(root, source, descriptor.path), 'utf8');
    assert.equal(Buffer.byteLength(text), descriptor.byteLength, `Baseline length: ${descriptor.path}`);
    assert.equal(sha(text), descriptor.sha256, `Baseline hash: ${descriptor.path}`);
    baselineFiles.set(descriptor.path, text);
  }
  const qaText = await readFile(resolve(root, contractQa), 'utf8');
  assert.equal(sha(qaText), '3db2767c9c58a0adbf86828a1e0211ccd18d321b1d44b3e87d515cb4755b1328', 'AP23C QA changed');
  const contractText = await readFile(resolve(root, contract), 'utf8');
  const historical = JSON.parse(qaText);
  const contractRef = historical.artifacts.find((entry: any) => entry.path === contract);
  assert.ok(contractRef, 'Missing historical contract binding');
  assert.equal(sha(contractText), contractRef.sha256, 'AP23C contract changed');
  const files = new Map<string, string>();
  for (const descriptor of baseline.artifacts) if (['legalProfile', 'specialRegimeCatalog'].includes(descriptor.role)) {
    files.set(descriptor.path, baselineFiles.get(descriptor.path)!);
  }
  const holiday = JSON.parse(baselineFiles.get('holiday-catalogs/ch-holiday-catalog.json')!);
  holiday.activation.releaseEligibility = { status: 'candidate', releaseId: null, approval: null };
  const holidayText = encode(holiday);
  files.set('holiday-catalogs/ch-holiday-catalog.json', holidayText);
  const calendars = projectActivatedCalendars(holiday, sha(holidayText), FORMAT7_LEGACY_CALENDAR_BASELINE);
  for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, encode(calendar));
  const componentRef = (contentId: string): ReleaseArtifactReference => {
    const role = contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
    const path = `${role === 'calendar' ? 'calendars' : 'holiday-catalogs'}/${contentId}.json`;
    assert.ok(files.has(path), `Missing component ${path}`);
    return { role, contentId, sha256: sha(files.get(path)!) };
  };
  const socialPath = 'social-procedures/ch-social-procedures.json';
  const social = rebindSocialCalendarCandidate(JSON.parse(baselineFiles.get(socialPath)!), releaseId,
    ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
  // Historical review references are retained, not labelled a new source check.
  files.set(socialPath, encode(social));
  const administrative = JSON.parse(contractText);
  administrative.contractStatus = 'approved';
  administrative.contractDecision = { id: 'DEC-2026-032', status: 'approved', on: '2026-10-14' };
  // Release/path eligibility intentionally remain candidate, null and unapproved.
  files.set('administrative-procedures/ch-cantonal-administrative-procedures.json', encode(administrative));
  const artifacts = [...files].map(([path, text]) => {
    const document = JSON.parse(text), role = document.dataKind;
    assert.ok(schemaNames[role], `Unknown artifact role ${role}`);
    return { path, role, contentId: role === 'calendar' ? document.calendarId : role === 'legalProfile' ? document.profileId : document.catalogId,
      mediaType: 'application/json', schemaId: prefix + schemaNames[role] + '.schema.json', byteLength: Buffer.byteLength(text), sha256: sha(text) };
  });
  const sourceIds = [...new Set([...files.values()].flatMap(text => (JSON.parse(text).sources ?? []).map((s: any) => s.sourceId as string)))].sort();
  const manifest = {
    ...baseline,
    $schema: prefix + 'local-reference-manifest-v8.schema.json', formatVersion: '8.0.0',
    releaseId, releaseStatus: 'candidate', createdOn: '2026-10-15',
    administrativeProcedureCatalogIds: ['ch-cantonal-administrative-procedures'],
    sourceSummary: { latestReviewedOn: '2026-10-12', legalBasisReviewStatus: 'pending', technicalValidationStatus: 'passed', sourceIds },
    compatibility: { ...baseline.compatibility, minimumConsumerFormatVersion: '8.0.0' }, artifacts,
    extensions: { 'steimer.local-reference': { workPackage: 'AP23D2', productionActivation: false,
      sourceReleaseApproved: false, calendarExportEnabled: false, sourceReview: 'pending',
      reviewReuse: 'Historical MVP07 and AP23B evidence retained. No new complete source review or data approval.',
      baseReleaseManifestSha256: sha(baselineText), acceptedContractSha256: sha(contractText), acceptedContractQaSha256: sha(qaText),
      contractDecision: 'DEC-2026-032', contractDecisionOn: '2026-10-14' } }
  };
  const manifestText = encode(manifest);
  const context = parseFormat8LocalReferenceData(manifestText, files);
  assert.equal(context.mode, 'localReference');
  assert.equal(context.manifest.artifacts.length, 41);
  const generatedModule = `// SPDX-License-Identifier: AGPL-3.0-only\n// Generated by build-ap23d2-candidate.ts. Local reference only, no data-release approval.\nimport { parseFormat8LocalReferenceData } from '../core/releaseFormat8';\nimport type { ParsedFormat8Data } from '../core/releaseFormat8';\nexport const ap23d2ManifestText = ${JSON.stringify(manifestText)};\nexport const ap23d2Files: ReadonlyMap<string, string> = new Map(${JSON.stringify([...files])});\nexport const ap23d2AdministrativeContext: ParsedFormat8Data = parseFormat8LocalReferenceData(ap23d2ManifestText, ap23d2Files);\n`;
  const integrityText = encode({
    kind: 'ap23d2-local-reference-bundle', releaseId, releaseStatus: 'candidate', sourceReview: 'pending',
    productionActivation: false, sourceReleaseApproved: false, referenceOnly: true, calendarExportEnabled: false,
    basedOn: { releaseManifest: { path: `${source}/manifest.json`, sha256: sha(baselineText) },
      administrativeContract: { path: contract, sha256: sha(contractText) }, contractQa: { path: contractQa, sha256: sha(qaText) } },
    actualAdministrativeComponents: [...new Set<string>(administrative.holidayBindings.flatMap((binding: any) => binding.physicalBaseline.references.map((ref: any) => ref.contentId)))].map(componentRef),
    manifest: { path: `${target}/manifest.json`, byteLength: Buffer.byteLength(manifestText), sha256: sha(manifestText) },
    artifacts: artifacts.map(a => ({ path: `${target}/${a.path}`, byteLength: a.byteLength, sha256: a.sha256 })),
    previewModule: { path: modulePath, byteLength: Buffer.byteLength(generatedModule), sha256: sha(generatedModule) }
  });
  return { manifestText, files, context, generatedModule, integrityText };
}

/** --write generates new local artifacts. --check compares every emitted byte. */
export async function materializeAP23D2Candidate(mode: 'write' | 'check'): Promise<void> {
  const candidate = await buildAP23D2Candidate();
  const outputs: [string, string][] = [...candidate.files].map(([path, text]) => [`${target}/${path}`, text]);
  outputs.push([`${target}/manifest.json`, candidate.manifestText], [modulePath, candidate.generatedModule],
    ['outputs/ap23d2-candidate-2026-10-15/bundle-integrity.json', candidate.integrityText]);
  for (const [path, text] of outputs) {
    const absolute = resolve(root, path);
    if (mode === 'write') { await mkdir(dirname(absolute), { recursive: true }); await writeFile(absolute, text); }
    else assert.equal(await readFile(absolute, 'utf8'), text, `Generated bytes differ: ${path}`);
  }
  console.log(JSON.stringify({ releaseId, mode, artifacts: candidate.files.size, manifestSha256: sha(candidate.manifestText),
    sourceReview: 'pending', referenceOnly: true, calendarExportEnabled: false, target }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flag = process.argv[2];
  if (flag !== '--write' && flag !== '--check') throw new Error('Use --write or --check');
  await materializeAP23D2Candidate(flag === '--write' ? 'write' : 'check');
}
