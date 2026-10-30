// SPDX-License-Identifier: AGPL-3.0-only
// AP23F3 local reference integration. Never promotes or writes approved releases.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSocialJson } from '../src/core/socialCatalog';
import { rebindSocialCalendarCandidate } from '../src/core/calendarMigration';
import type { ReleaseArtifactReference } from '../src/core/socialTypes';

export const AP23F3_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const AP23F3_BASE = 'data/releases/2026-10-18-mvp-09-approved.1';
export const AP23F3_TARGET = 'data/candidates/2026-10-22-ap23f3';
export const AP23F3_RELEASE_ID = '2026-10-22-ap23f3-candidate.1';
export const AP23F3_ADMIN_PATH = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23F3_MODULE = 'src/release/ap23f3CandidateData.ts';
export const AP23F3_ZH_CALENDAR = 'ap23f2-zh-rlg-nine';
export const AP23F3_ZH_PROJECTION = 'projection-ap23f2-zh-rlg-nine';
const f2 = 'outputs/ap23f2-candidate-2026-10-22/bundle';
const nativePrefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const decisionPath = 'docs/entscheidungen/DEC-2026-035-beschluss.md';
const acceptancePath = 'docs/fachrecht/abnahme-ap23f2.md';
const encode = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const sha = (value: string): string => createHash('sha256').update(value).digest('hex');
const objectSha = (value: unknown): string => sha(canonicalSocialJson(value));
const read = (path: string): Promise<string> => readFile(resolve(AP23F3_ROOT, path), 'utf8');
const fixedEvidence = [
  { path: `${AP23F3_BASE}/manifest.json`, sha256: '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265' },
  { path: `${f2}/manifest.json`, sha256: 'e835661353a0d7d402ecddf04cd7e3c10e58cae1976c2aeddfeb5e046edd34ec' },
  { path: 'outputs/ap23f2-2026-10-22/QA-AP23F2.json', sha256: 'ee6b9df9d2bb68cb8f6143eed455f1ac55f1605c3afb1965b1fa91c9b4a21f8f' },
  { path: 'outputs/ap23f2-2026-10-22/QA-AP23F2-INDEPENDENT.json', sha256: '84a2c090b6b42a3949358ff71b5e6043a5b7d5e51ff0e22aec0f705bb32e0125' },
  { path: 'docs/architektur/verwaltungsverfahrensvertrag-ap23f2.md', sha256: '7043456ebafa9b57e6e0b85c703364c457d467b39110f83bb9b3f9adf6b0894d' },
  { path: 'docs/architektur/verwaltungsverfahrensvertrag-ap23f2-pruefung.md', sha256: 'a56606be92fce3336098a479f512d05bcb1087642d25071fa6aa8107dc7ccd90' },
  { path: 'docs/entscheidungen/DEC-2026-035-qualifizierte-kantonalverfahren-v3.md', sha256: '574a0d0daa54d119e94199708b704ba4d7bec9adc6f49a10efa6839752cd1f12' }
] as const;
const zhRuleIds = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'NATIONAL-DAY', 'CHRISTMAS', 'ST-STEPHEN', 'MAY1'].map(id => `ZH-RLG-ALL-DAY-${id}`);

function holidayContent(catalog: any): unknown {
  const a = catalog.activation;
  return { data: catalog.data, calendarProjections: catalog.calendarProjections, matrixDecisions: a.matrixDecisions,
    projections: a.projections, procedureBindings: a.procedureBindings, anchorPolicies: a.anchorPolicies,
    supplementalRules: a.supplementalRules, supplementalScopes: a.supplementalScopes };
}
function administrativeBaseline(catalog: any): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const [group, key] of [['paths', 'pathId'], ['qualificationPolicies', 'pathId'], ['laws', 'lawId'],
    ['suspensionProfiles', 'suspensionProfileId'], ['excludedPaths', 'exclusionId']] as const) {
    result[group] = Object.fromEntries(catalog[group].map((row: any) => [row[key], objectSha(row)]));
  }
  result.holidayBindings = Object.fromEntries(catalog.holidayBindings.map(({ physicalBaseline, ...legal }: any) => [legal.holidayBindingId,
    objectSha({ ...legal, calendarId: physicalBaseline.calendarId, projectionId: physicalBaseline.projectionId })]));
  // New source reviews may update their review record, never silently replace
  // the accepted norm identity, locator, edition, source kind or URL.
  result.sources = Object.fromEntries(catalog.sources.map(({ reviewedOn: _reviewedOn, reviewBasis: _reviewBasis, ...identity }: any) =>
    [identity.sourceId, objectSha(identity)]));
  return result;
}
export interface AP23F3Candidate {
  readonly manifestText: string;
  readonly files: ReadonlyMap<string, string>;
  readonly generatedModule: string;
  readonly administrativeBaselineModule: string;
  readonly format10BaselineModule: string;
  readonly integrityText: string;
}

/** Rebinds actual bytes only. Candidate permissions never inherit historical approvals. */
export async function buildAP23F3Candidate(): Promise<AP23F3Candidate> {
  for (const item of fixedEvidence) assert.equal(sha(await read(item.path)), item.sha256, `Accepted input changed: ${item.path}`);
  const decisionText = await read(decisionPath), acceptanceText = await read(acceptancePath);
  assert.ok(decisionText.includes('DEC-2026-035') && decisionText.includes('beschlossen'), 'Missing human technical decision');
  assert.ok(acceptanceText.includes('AP23F2') && acceptanceText.includes('abgenommen'), 'Missing human technical acceptance');
  const baselineText = await read(`${AP23F3_BASE}/manifest.json`), baseline = JSON.parse(baselineText);
  const previous = new Map<string, string>();
  for (const descriptor of baseline.artifacts) {
    const text = await read(`${AP23F3_BASE}/${descriptor.path}`);
    assert.equal(sha(text), descriptor.sha256, `MVP09 hash ${descriptor.path}`);
    assert.equal(Buffer.byteLength(text), descriptor.byteLength, `MVP09 length ${descriptor.path}`);
    previous.set(descriptor.path, text);
  }
  assert.equal(previous.size, 41);
  const f2ManifestText = await read(`${f2}/manifest.json`), f2Manifest = JSON.parse(f2ManifestText);
  const accepted = new Map<string, string>();
  for (const descriptor of f2Manifest.artifacts) {
    const text = await read(`${f2}/${descriptor.path}`);
    assert.equal(sha(text), descriptor.sha256, `F2 hash ${descriptor.path}`);
    assert.equal(Buffer.byteLength(text), descriptor.byteLength, `F2 length ${descriptor.path}`);
    accepted.set(descriptor.path, text);
  }
  assert.equal(accepted.size, 42);
  const files = new Map<string, string>();
  for (const descriptor of baseline.artifacts) if (['legalProfile', 'specialRegimeCatalog'].includes(descriptor.role)) files.set(descriptor.path, previous.get(descriptor.path)!);

  const holidayPath = 'holiday-catalogs/ch-holiday-catalog.json';
  const holiday = JSON.parse(previous.get(holidayPath)!);
  const priorProjectionCount = holiday.activation.projections.length;
  assert.equal(priorProjectionCount, 32);
  assert.equal(holiday.data.rules.length, 479);
  assert.equal(holiday.activation.supplementalRules.length, 12);
  assert.equal(holiday.activation.procedureBindings.length, 104);
  assert.ok(!holiday.activation.projections.some((row: any) => row.id === AP23F3_ZH_PROJECTION || row.calendarId === AP23F3_ZH_CALENDAR));
  for (const id of zhRuleIds) assert.equal(holiday.data.rules.filter((row: any) => row.id === id && row.scope === 'ZH-RLG-ALL').length, 1);
  holiday.activation.projections.push({ id: AP23F3_ZH_PROJECTION, calendarId: AP23F3_ZH_CALENDAR, jurisdiction: 'CH-ZH',
    baseScopeId: 'ZH-RLG-ALL', supplementScopeIds: [], scopeIds: ['ZH-RLG-ALL'], ruleIds: [...zhRuleIds] });
  holiday.activation.releaseEligibility = { status: 'candidate', releaseId: null, approval: null };
  const holidayText = encode(holiday), holidayHash = sha(holidayText);
  files.set(holidayPath, holidayText);

  // All original calendar objects preserve their exact content and order, except
  // for the full target-catalog provenance hash. The new one is the accepted F2 object.
  for (const descriptor of f2Manifest.artifacts.filter((row: any) => row.role === 'calendar')) {
    const sourceText = descriptor.contentId === AP23F3_ZH_CALENDAR ? accepted.get(descriptor.path)! : previous.get(descriptor.path)!;
    const calendar = JSON.parse(sourceText), previousSourceHash = calendar.projection.sourceHash;
    calendar.projection.sourceHash = holidayHash;
    const normalized = structuredClone(calendar); normalized.projection.sourceHash = previousSourceHash;
    assert.deepEqual(normalized, JSON.parse(sourceText), `Only calendar catalog hash may change: ${descriptor.path}`);
    files.set(descriptor.path, encode(calendar));
  }
  const componentRef = (contentId: string): ReleaseArtifactReference => {
    const role = contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar';
    const path = `${role === 'calendar' ? 'calendars' : 'holiday-catalogs'}/${contentId}.json`;
    assert.ok(files.has(path), `Missing actual target component ${path}`);
    return { role, contentId, sha256: sha(files.get(path)!) };
  };
  const socialPath = 'social-procedures/ch-social-procedures.json';
  const social = rebindSocialCalendarCandidate(JSON.parse(previous.get(socialPath)!), AP23F3_RELEASE_ID,
    ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef));
  files.set(socialPath, encode(social));

  const administrative = JSON.parse(accepted.get(AP23F3_ADMIN_PATH)!);
  const oldAdministrative = JSON.parse(previous.get(AP23F3_ADMIN_PATH)!);
  administrative.$schema = nativePrefix + 'administrative-procedure-catalog-v3.schema.json';
  administrative.contractStatus = 'approved';
  administrative.contractDecision = { id: 'DEC-2026-035', status: 'approved', on: '2026-10-22' };
  administrative.review.basis = `AP23F1 fachlich und AP23F2 technisch abgenommen. Beschluss ${decisionPath}, SHA-256 ${sha(decisionText)}. Abnahme ${acceptancePath}, SHA-256 ${sha(acceptanceText)}. Keine neue Quellen- oder Datenreleasefreigabe.`;
  for (const binding of administrative.holidayBindings) {
    delete binding.projectionEvidence;
    binding.physicalBaseline.releaseId = AP23F3_RELEASE_ID;
    binding.physicalBaseline.references = binding.physicalBaseline.references.map((ref: any) => ({ ...componentRef(ref.contentId), path: ref.path }));
  }
  for (const entry of administrative.releaseBinding.pathEligibility) {
    const binding = administrative.holidayBindings.find((row: any) => row.holidayBindingId === entry.holidayBindingId);
    entry.holidayBindingSha256 = objectSha(binding);
    assert.equal(entry.status, 'candidate');
    assert.deepEqual(entry.targetComponentRefs, []);
    assert.equal(entry.sourceReviewRef, null); assert.equal(entry.referenceSuiteRef, null);
  }
  // Definitions are immutable across F2/F3. Only actual component/provenance links change.
  for (const group of ['paths', 'qualificationPolicies', 'laws', 'suspensionProfiles', 'excludedPaths', 'sources'])
    assert.deepEqual(administrative[group], JSON.parse(accepted.get(AP23F3_ADMIN_PATH)!)[group], `F2 definitions ${group}`);
  for (const [group, key] of [['paths', 'pathId'], ['qualificationPolicies', 'pathId']] as const) for (const old of oldAdministrative[group])
    assert.deepEqual(administrative[group].find((row: any) => row[key] === old[key]), old, `MVP09 retained ${group}/${old[key]}`);
  files.set(AP23F3_ADMIN_PATH, encode(administrative));
  assert.equal(files.size, 42);
  const descriptors = f2Manifest.artifacts.map((descriptor: any) => ({ ...descriptor, schemaId: JSON.parse(files.get(descriptor.path)!).$schema,
    byteLength: Buffer.byteLength(files.get(descriptor.path)!), sha256: sha(files.get(descriptor.path)!) }));
  const sourceIds = [...new Set<string>([...files.values()].flatMap(text => (JSON.parse(text).sources ?? []).map((source: any) => source.sourceId)))].sort();
  const dynamicEvidence = [{ path: decisionPath, sha256: sha(decisionText) }, { path: acceptancePath, sha256: sha(acceptanceText) }];
  const manifest = { ...f2Manifest, $schema: nativePrefix + 'implementation/ap23f3/local-reference-manifest-v10.schema.json',
    releaseId: AP23F3_RELEASE_ID, releaseStatus: 'candidate', createdOn: '2026-10-22',
    sourceSummary: { latestReviewedOn: '2026-10-22', legalBasisReviewStatus: 'pending', technicalValidationStatus: 'pending', sourceIds }, artifacts: descriptors,
    extensions: { 'steimer.local-reference': { workPackage: 'AP23F3', productionActivation: false, sourceReleaseApproved: false,
      calendarExportEnabled: false, sourceReview: 'pending', contractDecision: 'DEC-2026-035', contractDecisionOn: '2026-10-22',
      baselineManifestSha256: sha(baselineText), acceptedStructuralManifestSha256: sha(f2ManifestText),
      contractDecisionSha256: sha(decisionText), technicalAcceptanceSha256: sha(acceptanceText),
      administrativeCandidateBinding: 'Actual target hashes in physicalBaseline plus manifest, while release and per-path targets remain empty and unapproved.',
      sourceReviewReuse: 'Accepted F1 legal uses and historical MVP09 evidence retained. No new combined source-release review or operating permission.' } } };
  const manifestText = encode(manifest);
  const generatedModule = `// SPDX-License-Identifier: AGPL-3.0-only\n// Generated AP23F3 local reference data. No operating or export permission.\nimport { createFormat10CalculationData } from '../core/format10CalculationData';\nimport type { ParsedFormat10Data } from '../core/releaseFormat10';\nexport const ap23f3ManifestText = ${JSON.stringify(manifestText)};\nexport const ap23f3Files: ReadonlyMap<string,string> = new Map(${JSON.stringify([...files])});\nexport const ap23f3CandidateRuntime = createFormat10CalculationData(ap23f3ManifestText, ap23f3Files, { mode: 'localReference' });\nexport const ap23f3AdministrativeContext: ParsedFormat10Data = ap23f3CandidateRuntime.administrativeContext;\n`;
  const administrativeBaselineModule = `// SPDX-License-Identifier: AGPL-3.0-only\n// Exact accepted F2 definitions, native DEC-2026-035 integration. Never release authority.\nexport const ADMINISTRATIVE_V3_BASELINE = ${JSON.stringify(administrativeBaseline(administrative), null, 2)} as const;\n`;
  const format10BaselineModule = `// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted content baseline. Release permission is independently verified.\nexport const FORMAT10_HOLIDAY_CONTENT_SHA256 = ${JSON.stringify(objectSha(holidayContent(holiday)))};\nexport const FORMAT10_ADMINISTRATIVE_PROJECTION = ${JSON.stringify(holiday.activation.projections.at(-1), null, 2)} as const;\n`;
  const integrityText = encode({ kind: 'ap23f3-local-reference-bundle', releaseId: AP23F3_RELEASE_ID, releaseStatus: 'candidate',
    contractDecision: 'DEC-2026-035', contractStatus: 'approved', sourceReleaseApproved: false, productionActivation: false,
    referenceOnly: true, calendarExportEnabled: false, sourceReview: 'pending', basedOn: [...fixedEvidence, ...dynamicEvidence],
    counts: { artifacts: 42, totalFilesIncludingManifest: 43, calendars: 33, existingCalendarsPreserved: 32, profiles: 5,
      administrativePaths: 42, preservedAdministrativePaths: 25, newAdministrativePaths: 17, qualificationPolicies: 42,
      laws: 8, suspensionProfiles: 14, holidayBindings: 9, basisHolidayRules: 479, supplementalSoRules: 12,
      preservedSocialRules: 44, preservedBernSocialBindings: 50, rawUnchangedProfilesAndSpecialCatalog: 6 },
    actualAdministrativeComponents: [...new Set<string>(administrative.holidayBindings.flatMap((row: any) => row.physicalBaseline.references.map((r: any) => r.contentId)))].map(componentRef),
    holidayContentSha256: objectSha(holidayContent(holiday)),
    manifest: { path: `${AP23F3_TARGET}/manifest.json`, byteLength: Buffer.byteLength(manifestText), sha256: sha(manifestText) },
    artifacts: descriptors.map((row: any) => ({ path: `${AP23F3_TARGET}/${row.path}`, byteLength: row.byteLength, sha256: row.sha256 })),
    generatedModules: [{ path: AP23F3_MODULE, sha256: sha(generatedModule) }, { path: 'src/core/administrativeV3Baseline.ts', sha256: sha(administrativeBaselineModule) },
      { path: 'src/core/format10Baseline.ts', sha256: sha(format10BaselineModule) }],
    buildScript: { path: 'scripts/build-ap23f3-candidate.ts', sha256: sha(await read('scripts/build-ap23f3-candidate.ts')) } });
  return { manifestText, files, generatedModule, administrativeBaselineModule, format10BaselineModule, integrityText };
}

export async function materializeAP23F3Candidate(mode: 'write' | 'check'): Promise<void> {
  const result = await buildAP23F3Candidate();
  const outputs: [string, string][] = [...result.files].map(([path, text]) => [`${AP23F3_TARGET}/${path}`, text]);
  outputs.push([`${AP23F3_TARGET}/manifest.json`, result.manifestText], [AP23F3_MODULE, result.generatedModule],
    ['src/core/administrativeV3Baseline.ts', result.administrativeBaselineModule], ['src/core/format10Baseline.ts', result.format10BaselineModule],
    ['outputs/ap23f3-2026-10-22/bundle-integrity.json', result.integrityText]);
  for (const [path, text] of outputs) {
    const absolute = resolve(AP23F3_ROOT, path);
    if (mode === 'write') { await mkdir(dirname(absolute), { recursive: true }); await writeFile(absolute, text); }
    else assert.equal(await read(path), text, `Generated AP23F3 bytes differ: ${path}`);
  }
  console.log(JSON.stringify({ mode, releaseId: AP23F3_RELEASE_ID, artifacts: result.files.size,
    manifestSha256: sha(result.manifestText), referenceOnly: true, exportAllowed: false }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flag = process.argv[2];
  assert.ok(flag === '--write' || flag === '--check', 'Use --write or --check');
  await materializeAP23F3Candidate(flag === '--write' ? 'write' : 'check');
}
