// SPDX-License-Identifier: AGPL-3.0-only
// Exact-byte local implementation candidate. Never promotes a legal data release.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectActivatedCalendars } from '../src/core/holidayActivation';
import { rebindSocialCalendarCandidate } from '../src/core/calendarMigration';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../src/core/format7Baseline';
import { canonicalSocialJson } from '../src/core/socialCatalog';
import type { ReleaseArtifactReference } from '../src/core/socialTypes';

export const AP23E3_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const AP23E3_BASE = 'data/releases/2026-10-15-mvp-08-approved.1';
export const AP23E3_TARGET = 'outputs/ap23e3-candidate-2026-10-18/bundle';
export const AP23E3_MODULE = 'src/release/ap23e3CandidateData.ts';
export const AP23E3_RELEASE_ID = '2026-10-18-ap23e3-reference.1';
export const AP23E3_ADMIN_PATH = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
const e2Root = 'outputs/ap23e2-candidate-2026-10-18/bundle';
const e2ReportPath = 'outputs/ap23e2-2026-10-18/QA-AP23E2.json';
const acceptanceReportPath = 'outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json';
const decisionPath = 'docs/entscheidungen/DEC-2026-033-beschluss.md';
const acceptancePath = 'docs/fachrecht/abnahme-ap23e2.md';
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const encode = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const sha = (value: string): string => createHash('sha256').update(value).digest('hex');
const objectSha = (value: unknown): string => sha(canonicalSocialJson(value));
const read = (path: string): Promise<string> => readFile(resolve(AP23E3_ROOT, path), 'utf8');
const fixedEvidence = [
  { path: `${AP23E3_BASE}/manifest.json`, sha256: '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4' },
  { path: e2ReportPath, sha256: 'ac7fd146a9db098d65b37c2c586fab36db0072290195b213f3d7e0cd00ca111b' },
  { path: acceptanceReportPath, sha256: '9872982c93adb19b839827d0bb93ef1220457f2dfdd18263c99da02bf488e566' },
  { path: decisionPath, sha256: '8a669f031ad213c04f67c4160dab86cc59e9d574444ec61d7766b9cf9e704cf8' },
  { path: acceptancePath, sha256: '189eda49c59a5d45a11c6a4ab4d00ede7955c753881c706eea9b0a91f17b3449' }
] as const;
export interface AP23E3Candidate {
  readonly manifestText: string;
  readonly files: ReadonlyMap<string, string>;
  readonly generatedModule: string;
  readonly integrityText: string;
}

/** Checks immutable accepted inputs, without asserting the obsolete E2 src-tree hash. */
export async function buildAP23E3Candidate(): Promise<AP23E3Candidate> {
  for (const evidence of fixedEvidence) assert.equal(sha(await read(evidence.path)), evidence.sha256, `Bound input changed: ${evidence.path}`);
  const acceptanceReport = JSON.parse(await read(acceptanceReportPath));
  assert.equal(acceptanceReport.status, 'passed');
  assert.equal(acceptanceReport.governance.status, 'confirmedByDavidSteimer');
  for (const descriptor of acceptanceReport.preservedArtefacts) {
    const bytes = await read(descriptor.path);
    assert.equal(Buffer.byteLength(bytes), descriptor.byteLength, `Accepted input length: ${descriptor.path}`);
    assert.equal(sha(bytes), descriptor.sha256, `Accepted input hash: ${descriptor.path}`);
  }
  const baselineText = await read(`${AP23E3_BASE}/manifest.json`);
  const baseline = JSON.parse(baselineText);
  const baselineFiles = new Map<string, string>();
  for (const descriptor of baseline.artifacts) {
    const text = await read(`${AP23E3_BASE}/${descriptor.path}`);
    assert.equal(Buffer.byteLength(text), descriptor.byteLength, `MVP08 length: ${descriptor.path}`);
    assert.equal(sha(text), descriptor.sha256, `MVP08 hash: ${descriptor.path}`);
    baselineFiles.set(descriptor.path, text);
  }
  assert.equal(baselineFiles.size, 41);
  const e2ManifestText = await read(`${e2Root}/manifest.json`);
  const e2Manifest = JSON.parse(e2ManifestText);
  for (const descriptor of e2Manifest.artifacts) {
    const text = await read(`${e2Root}/${descriptor.path}`);
    assert.equal(Buffer.byteLength(text), descriptor.byteLength, `E2 length: ${descriptor.path}`);
    assert.equal(sha(text), descriptor.sha256, `E2 hash: ${descriptor.path}`);
  }
  const files = new Map<string, string>();
  for (const descriptor of baseline.artifacts) if (['legalProfile', 'specialRegimeCatalog'].includes(descriptor.role)) {
    files.set(descriptor.path, baselineFiles.get(descriptor.path)!);
  }
  const holidayPath = 'holiday-catalogs/ch-holiday-catalog.json';
  const holiday = JSON.parse(baselineFiles.get(holidayPath)!);
  // Existing evidence and all substantive rules remain identical. This null candidate
  // permission explicitly does not copy an MVP08 approval to a new release identity.
  holiday.activation.releaseEligibility = { status: 'candidate', releaseId: null, approval: null };
  const holidayText = encode(holiday);
  files.set(holidayPath, holidayText);
  const calendars = projectActivatedCalendars(holiday, sha(holidayText), FORMAT7_LEGACY_CALENDAR_BASELINE);
  assert.equal(calendars.length, 32);
  for (const calendar of calendars) {
    const path = `calendars/${calendar.calendarId}.json`;
    const previous = JSON.parse(baselineFiles.get(path)!);
    const normalized = JSON.parse(JSON.stringify(calendar));
    normalized.projection.sourceHash = previous.projection.sourceHash;
    assert.deepEqual(normalized, previous, `Only the catalog source hash may change: ${path}`);
    files.set(path, encode(calendar));
  }
  const componentRef = (contentId: string): ReleaseArtifactReference => {
    const role = contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
    const path = `${role === 'calendar' ? 'calendars' : 'holiday-catalogs'}/${contentId}.json`;
    const text = files.get(path);
    assert.ok(text, `Missing actual component: ${path}`);
    return { role, contentId, sha256: sha(text) };
  };
  const socialPath = 'social-procedures/ch-social-procedures.json';
  const social = rebindSocialCalendarCandidate(JSON.parse(baselineFiles.get(socialPath)!), AP23E3_RELEASE_ID,
    ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
  files.set(socialPath, encode(social));
  const administrative = JSON.parse(await read(`${e2Root}/${AP23E3_ADMIN_PATH}`));
  administrative.$schema = prefix + 'administrative-procedure-catalog-v2.schema.json';
  administrative.contractStatus = 'approved';
  administrative.contractDecision = { id: 'DEC-2026-033', status: 'approved', on: '2026-10-18' };
  administrative.review.basis = `AP23E1 fachlich und AP23E2 technisch abgenommen. Die unveränderte E2-Vorlage bleibt historisch erhalten. Technischer Beschluss: ${decisionPath}, SHA-256 ${sha(await read(decisionPath))}. Teilpaketabnahme: ${acceptancePath}, SHA-256 ${sha(await read(acceptancePath))}. Keine neue Quellen- oder Datenreleasefreigabe.`;
  // The candidate schema deliberately leaves releaseBinding unapproved with empty
  // release-target arrays. Exact candidate bytes are bound by physical references
  // plus the manifest, not by inventing a release approval or schema extension.
  for (const binding of administrative.holidayBindings) {
    binding.physicalBaseline.releaseId = AP23E3_RELEASE_ID;
    binding.physicalBaseline.references = binding.physicalBaseline.references.map((old: any) => ({
      ...componentRef(old.contentId), path: old.path
    }));
  }
  for (const eligibility of administrative.releaseBinding.pathEligibility) {
    const binding = administrative.holidayBindings.find((item: any) => item.holidayBindingId === eligibility.holidayBindingId);
    assert.ok(binding);
    eligibility.holidayBindingSha256 = objectSha(binding);
  }
  files.set(AP23E3_ADMIN_PATH, encode(administrative));
  assert.equal(files.size, 41);
  const artifacts = baseline.artifacts.map((descriptor: any) => {
    const text = files.get(descriptor.path)!;
    return { ...descriptor, schemaId: JSON.parse(text).$schema, byteLength: Buffer.byteLength(text), sha256: sha(text) };
  });
  const sourceIds = [...new Set<string>([...files.values()].flatMap(text => (JSON.parse(text).sources ?? []).map((source: any) => source.sourceId)))].sort();
  const manifest = { ...baseline, $schema: prefix + 'local-reference-manifest-v9.schema.json', formatVersion: '9.0.0',
    releaseId: AP23E3_RELEASE_ID, releaseStatus: 'candidate', createdOn: '2026-10-18',
    compatibility: { ...baseline.compatibility, minimumConsumerFormatVersion: '9.0.0' },
    sourceSummary: { latestReviewedOn: '2026-10-18', legalBasisReviewStatus: 'pending', technicalValidationStatus: 'pending', sourceIds },
    artifacts, extensions: { 'steimer.local-reference': {
      workPackage: 'AP23E3', productionActivation: false, sourceReleaseApproved: false, calendarExportEnabled: false,
      sourceReview: 'pending', contractDecision: 'DEC-2026-033', contractDecisionOn: '2026-10-18',
      reviewReuse: 'Existing MVP08 and accepted AP23E1 evidence retained. No combined new source review or data release approval.',
      administrativeCandidateBinding: 'Exact manifest bytes plus current-candidate physicalBaseline references. Empty unapproved release targets are intentional.',
      baselineManifestSha256: sha(baselineText), acceptedStructuralManifestSha256: sha(e2ManifestText),
      acceptedContractReportSha256: sha(await read(e2ReportPath)), technicalAcceptanceReportSha256: sha(await read(acceptanceReportPath)),
      contractDecisionSha256: sha(await read(decisionPath)), technicalAcceptanceSha256: sha(await read(acceptancePath))
    } } };
  const manifestText = encode(manifest);
  const generatedModule = `// SPDX-License-Identifier: AGPL-3.0-only\n// Generated by build-ap23e3-candidate.ts. Local reference only, no data-release approval.\nimport { createFormat9CalculationData } from '../core/format9CalculationData';\nimport type { ParsedFormat9Data } from '../core/releaseFormat9';\nexport const ap23e3ManifestText = ${JSON.stringify(manifestText)};\nexport const ap23e3Files: ReadonlyMap<string, string> = new Map(${JSON.stringify([...files])});\nexport const ap23e3CandidateRuntime = createFormat9CalculationData(ap23e3ManifestText, ap23e3Files, { mode: 'localReference' });\nexport const ap23e3AdministrativeContext: ParsedFormat9Data = ap23e3CandidateRuntime.administrativeContext;\n`;
  const integrityText = encode({ kind: 'ap23e3-local-reference-bundle', releaseId: AP23E3_RELEASE_ID,
    releaseStatus: 'candidate', contractDecision: 'DEC-2026-033', contractStatus: 'approved', sourceReview: 'pending',
    productionActivation: false, sourceReleaseApproved: false, referenceOnly: true, calendarExportEnabled: false,
    basedOn: fixedEvidence,
    counts: { artifacts: 41, calendars: 32, profiles: 5, administrativePaths: 25, preservedAdministrativePaths: 12,
      newAdministrativePaths: 13, qualificationPolicies: 25, preservedSocialRules: 44, preservedBernSocialBindings: 50,
      rawUnchangedProfilesAndSpecialCatalog: 6 },
    actualAdministrativeComponents: [...new Set<string>(administrative.holidayBindings.flatMap((binding: any) => binding.physicalBaseline.references.map((ref: any) => ref.contentId)))].map(componentRef),
    candidatePermissionBinding: 'Administrative release-target arrays intentionally empty under the approved contract. Actual candidate bytes are bound by physicalBaseline and manifest.',
    manifest: { path: `${AP23E3_TARGET}/manifest.json`, byteLength: Buffer.byteLength(manifestText), sha256: sha(manifestText) },
    artifacts: artifacts.map((descriptor: any) => ({ path: `${AP23E3_TARGET}/${descriptor.path}`, byteLength: descriptor.byteLength, sha256: descriptor.sha256 })),
    previewModule: { path: AP23E3_MODULE, byteLength: Buffer.byteLength(generatedModule), sha256: sha(generatedModule) },
    buildScript: { path: 'scripts/build-ap23e3-candidate.ts', sha256: sha(await read('scripts/build-ap23e3-candidate.ts')) }
  });
  return { manifestText, files, generatedModule, integrityText };
}

/** Generated artifacts only. Original E1/E2 and MVP08 files are never written. */
export async function materializeAP23E3Candidate(mode: 'write' | 'check'): Promise<void> {
  const candidate = await buildAP23E3Candidate();
  const outputs: [string, string][] = [...candidate.files].map(([path, text]) => [`${AP23E3_TARGET}/${path}`, text]);
  outputs.push([`${AP23E3_TARGET}/manifest.json`, candidate.manifestText], [AP23E3_MODULE, candidate.generatedModule],
    ['outputs/ap23e3-candidate-2026-10-18/bundle-integrity.json', candidate.integrityText]);
  for (const [path, text] of outputs) {
    const absolute = resolve(AP23E3_ROOT, path);
    if (mode === 'write') { await mkdir(dirname(absolute), { recursive: true }); await writeFile(absolute, text); }
    else assert.equal(await read(path), text, `Generated bytes differ: ${path}`);
  }
  console.log(JSON.stringify({ releaseId: AP23E3_RELEASE_ID, mode, artifacts: candidate.files.size,
    manifestSha256: sha(candidate.manifestText), referenceOnly: true, calendarExportEnabled: false, target: AP23E3_TARGET }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flag = process.argv[2];
  if (flag !== '--write' && flag !== '--check') throw new Error('Use --write or --check');
  await materializeAP23E3Candidate(flag === '--write' ? 'write' : 'check');
}
