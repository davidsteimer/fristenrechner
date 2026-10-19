// SPDX-License-Identifier: AGPL-3.0-only
// AP23E2 structural contract candidate. No product imports, release promotion or runtime authority.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AP23E2_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const AP23E2_BASE = 'data/releases/2026-10-15-mvp-08-approved.1';
export const AP23E2_OUTPUT = 'outputs/ap23e2-candidate-2026-10-18';
export const AP23E2_RELEASE_ID = '2026-10-18-ap23e2-reference.1';
export const AP23E2_ADMIN_PATH = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23E2_RESEARCH_PATH = 'tests/golden/candidates/ap23e1-administrative.json';
export const AP23E2_ACCEPTANCE_PATH = 'docs/fachrecht/abnahme-ap23e1.md';
export const AP23E2_BASE_MANIFEST_SHA256 = '2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4';
export const AP23E2_BASE_CATALOG_SHA256 = '2f434968628c951a2e15eb62c5f3e0d5d906fa476b1c66387076a3e9727ce3f7';
export const AP23E2_RESEARCH_SHA256 = '769e9c7db0d63b768909a5042bd1446b708f5e0ed6be7bb92abe7f33669d7ddb';
const schemaPrefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/candidates/ap23e2/';
export const rawSha256 = value => createHash('sha256').update(value).digest('hex');
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export const objectSha256 = value => rawSha256(canonicalJson(value));
export const encode = value => JSON.stringify(value, null, 2) + '\n';
const read = path => readFile(resolve(AP23E2_ROOT, path), 'utf8');
const definitions = {
  LU: { lawId: 'vrg-lu', title: 'Gesetz über die Verwaltungsrechtspflege, SRL 40', normFrom: '2026-09-27',
    source: 'LU-VRG', holidayLocator: '§ 34', scopeLocator: '§§ 6–9, 31–36, 127–130, 135–136, 142–150' },
  ZG: { lawId: 'vrg-zg', title: 'Gesetz über den Rechtsschutz in Verwaltungssachen, BGS 162.1', normFrom: '2025-10-17',
    source: 'ZG-VRG', holidayLocator: '§ 10 Abs. 3/4', scopeLocator: '§§ 1–3, 10–11, 32, 43–44, 46, 64–65, 67–68' },
  AR: { lawId: 'vrpg-ar', title: 'Gesetz über die Verwaltungsrechtspflege, bGS 143.1', normFrom: '2020-01-01',
    source: 'AR-VRPG', holidayLocator: 'Art. 5', scopeLocator: 'Art. 1, 4–7, 31a, 34, 54–55, 59, 63' }
};
const sourceIdentities = {
  'LU-VRG': ['SRC-AP23E1-LU-VRG-20210901', 'statute'],
  'LU-RTG': ['SRC-AP23E1-LU-RTG-20260927', 'statute'],
  'LU-NO-SUSPENSION': ['JUD-AP23E1-LU-5A-872-2020', 'judgment'],
  'ZG-VRG': ['SRC-AP23E1-ZG-VRG-20251017', 'statute'],
  'ZG-COURT-GUIDANCE': ['SRC-AP23E1-ZG-COURT-GUIDANCE', 'officialMaterials'],
  'AR-VRPG': ['SRC-AP23E1-AR-VRPG-20200101', 'statute'],
  'AR-ARGV': ['SRC-AP23E1-AR-ARGV-20160101', 'statute'],
  'AR-MATERIAL': ['SRC-AP23E1-AR-MATERIAL-20180703', 'officialMaterials'],
  'CH-HOL': ['SRC-AP23B-CH-HOL', 'statute']
};
const pathLocators = {
  'LU-ADMIN-30': '§§ 31–35, 130, 142–143',
  'LU-COURT-30': '§§ 31–35, 130, 148–150',
  'LU-ADMIN-ORDERED': '§§ 31–35, je nach Handlung §§ 135–136', 'LU-COURT-ORDERED': '§§ 31–35, 135–136',
  'ZG-ADMIN-20': '§§ 10–11, 39–43', 'ZG-COURT-30': '§§ 10–11, 61, 64',
  'ZG-ADMIN-ORDERED': '§§ 10–11, 15, 32, 44, 46', 'ZG-COURT-ORDERED': '§§ 10–11, 65, 67–68',
  'AR-ADMIN-20': 'Art. 4–6, 30–31a', 'AR-EXECUTION-5': 'Art. 4–6, 33 Abs. 1 und 63 Abs. 4',
  'AR-ADMIN-ORDERED': 'Art. 4–6, 13, 35 Abs. 3 und 39', 'AR-COURT-30': 'Art. 4–7, 54–55, 59',
  'AR-COURT-ORDERED': 'Art. 4–7, 59 und konkrete Verfahrenshandlung'
};

/** Build a byte-bound structural proposal, not an installable or released data set. */
export async function buildAP23E2Candidate() {
  const baselineManifestText = await read(`${AP23E2_BASE}/manifest.json`);
  assert.equal(rawSha256(baselineManifestText), AP23E2_BASE_MANIFEST_SHA256, 'MVP08 manifest changed');
  const baselineManifest = JSON.parse(baselineManifestText);
  const files = new Map();
  for (const entry of baselineManifest.artifacts) {
    const text = await read(`${AP23E2_BASE}/${entry.path}`);
    assert.equal(Buffer.byteLength(text), entry.byteLength, `Baseline length ${entry.path}`);
    assert.equal(rawSha256(text), entry.sha256, `Baseline hash ${entry.path}`);
    files.set(entry.path, text);
  }
  assert.equal(files.size, 41);
  assert.equal(rawSha256(files.get(AP23E2_ADMIN_PATH)), AP23E2_BASE_CATALOG_SHA256);
  const baselineCatalog = JSON.parse(files.get(AP23E2_ADMIN_PATH));
  const researchText = await read(AP23E2_RESEARCH_PATH);
  assert.equal(rawSha256(researchText), AP23E2_RESEARCH_SHA256, 'Accepted E1 fixture changed');
  const research = JSON.parse(researchText);
  assert.equal(research.paths.length, 13);
  assert.equal(research.cases.length, 51);
  const acceptanceText = await read(AP23E2_ACCEPTANCE_PATH);
  const catalog = structuredClone(baselineCatalog);
  catalog.$schema = schemaPrefix + 'administrative-procedure-catalog-v2.schema.json';
  catalog.formatVersion = '2.0.0';
  catalog.contractStatus = 'proposed';
  catalog.contractDecision = { id: 'DEC-2026-033', status: 'proposed', on: null };
  catalog.runtimeActive = false;
  catalog.review = {
    basis: `AP23E1 fachlich abgenommen einschliesslich AR-Fünftagesrekurs, Zeitfenster und AR-O1. ${AP23E2_ACCEPTANCE_PATH} SHA-256 ${rawSha256(acceptanceText)}. Vertragsnachtrag DEC-2026-033 noch nicht beschlossen.`,
    sourceReview: 'AP23E1-Quellenprüfung vom 18.10.2026 für die neue Tranche. Bestehende MVP08-Nachweise unverändert wiederverwendet. Keine zusammengeführte neue Releasequellenprüfung oder Datenfreigabe.',
    checkedOn: '2026-10-18'
  };
  const sourceRef = (researchId, locator) => ({ sourceId: sourceIdentities[researchId][0],
    locator: locator ?? research.sources.find(source => source.id === researchId).locators });
  for (const source of research.sources) {
    if (source.id === 'CH-HOL') {
      assert.ok(catalog.sources.some(existing => existing.sourceId === sourceIdentities[source.id][0]));
      continue; // Reuse the exact historical administrative source object, without a review-date upgrade.
    }
    const [sourceId, kind] = sourceIdentities[source.id];
    assert.ok(!catalog.sources.some(existing => existing.sourceId === sourceId));
    catalog.sources.push({ sourceId, kind, url: source.url, versionDescription: source.version,
      reviewedOn: '2026-10-18', reviewBasis: 'AP23E1-2026-10-18, neue Verwaltungsverwendung getrennt von historischen Feiertagsmetadaten', locators: source.locators });
  }
  for (const [canton, definition] of Object.entries(definitions)) {
    catalog.laws.push({ lawId: definition.lawId, canton, title: definition.title,
      holidayPolicyReview: { explicitDeviation: 'noneIdentifiedInReviewedGeneralLaw',
        sourceRefs: [sourceRef(definition.source, definition.holidayLocator)], projectDecisionRef: 'DEC-2026-031' },
      sourceRefs: [sourceRef(definition.source, definition.scopeLocator)] });
    const prefix = canton.toLowerCase();
    const noSuspensionRefs = canton === 'LU'
      ? [sourceRef('LU-VRG', '§§ 31–36'), sourceRef('LU-NO-SUSPENSION')]
      : canton === 'ZG' ? [sourceRef('ZG-VRG', '§§ 10–11'), sourceRef('ZG-COURT-GUIDANCE')]
        : [sourceRef('AR-VRPG', 'Art. 4–7, systematische Beschränkung von Art. 7 auf Gerichtsverfahren')];
    catalog.suspensionProfiles.push({ suspensionProfileId: `${prefix}-none`, lawId: definition.lawId,
      periods: [], sourceRefs: noSuspensionRefs });
    if (canton === 'AR') catalog.suspensionProfiles.push({ suspensionProfileId: 'ar-three', lawId: definition.lawId,
      periods: [
        { periodId: 'ar-easter', start: { type: 'easterOffset', days: -7, yearOffset: 0 }, end: { type: 'easterOffset', days: 7, yearOffset: 0 }, inclusive: true },
        { periodId: 'ar-summer', start: { type: 'fixedMonthDay', month: 7, day: 15, yearOffset: 0 }, end: { type: 'fixedMonthDay', month: 8, day: 15, yearOffset: 0 }, inclusive: true },
        { periodId: 'ar-winter', start: { type: 'fixedMonthDay', month: 12, day: 18, yearOffset: 0 }, end: { type: 'fixedMonthDay', month: 1, day: 2, yearOffset: 1 }, inclusive: true }
      ], sourceRefs: [sourceRef('AR-VRPG', 'Art. 7'), sourceRef('AR-MATERIAL')] });
    const calendarPath = research.calendars[canton].physical.path.slice(AP23E2_BASE.length + 1);
    assert.equal(rawSha256(files.get(calendarPath)), research.calendars[canton].physical.sha256);
    const calendar = JSON.parse(files.get(calendarPath));
    const legalRefs = [sourceRef(definition.source, definition.holidayLocator)];
    if (canton === 'LU') legalRefs.push(sourceRef('LU-RTG', '§ 1a'));
    if (canton === 'AR') legalRefs.push(sourceRef('AR-ARGV', 'Art. 7'));
    legalRefs.push(sourceRef('CH-HOL', 'Art. 1, historische Wiederverwendung ohne neue Quellenfreigabe'));
    catalog.holidayBindings.push({ holidayBindingId: `${prefix}-authority-seat`, lawId: definition.lawId,
      authoritySeatCanton: canton, authorityLevel: 'cantonal', anchor: 'authoritySeat',
      physicalBaseline: { releaseId: baselineManifest.releaseId, calendarId: calendar.calendarId,
        projectionId: calendar.projection.projectionId, references: [], eligibilityMeaning: 'physicalSourceOnlyNotFederalProcedurePermission' },
      legalBinding: { sourceRefs: legalRefs, projectDecisionRef: 'DEC-2026-031', roleUnion: false, partyOrRepresentativeRequired: false } });
  }
  // Shared physical references must have one exact baseline. Historic MVP07 provenance remains in the immutable MVP08 catalog.
  for (const binding of catalog.holidayBindings) {
    binding.physicalBaseline.releaseId = baselineManifest.releaseId;
    binding.physicalBaseline.references = [binding.physicalBaseline.calendarId, 'ch-federal-calendar', 'ch-holiday-catalog'].map(contentId => {
      const descriptor = baselineManifest.artifacts.find(entry => entry.contentId === contentId);
      assert.ok(descriptor, `Physical baseline component ${contentId}`);
      return { role: descriptor.role, contentId, path: descriptor.path, sha256: descriptor.sha256 };
    });
  }
  for (const path of research.paths) {
    const definition = definitions[path.canton], prefix = path.canton.toLowerCase();
    const coverage = { from: path.from, to: research.referenceRange.to };
    const court = path.stages.length === 1 && path.stages[0] === 'court';
    catalog.paths.push({ pathId: path.id.toLowerCase(), revision: 1, researchRef: path.id, lawId: definition.lawId,
      action: path.action === 'executionAppeal' ? 'execution-order-appeal'
        : path.action === 'proceduralSubmission' ? (court ? 'ordered-court-submission' : 'ordered-administrative-submission')
          : (court ? 'ordinary-court-appeal' : 'ordinary-administrative-appeal'),
      stages: path.stages, duration: path.days === null
        ? { kind: 'authorityOrderedDays', minimum: 1, maximum: 365, boundMeaning: 'technicalSafetyLimitNotLegalMaximum' }
        : { kind: 'statutoryDays', value: path.days, overridable: false },
      suspensionProfileId: `${prefix}-${path.suspension}`, holidayBindingId: `${prefix}-authority-seat`, urgencyPolicy: 'notApplicable',
      endShiftPolicy: 'nextWorkingDay', endShiftGuard: path.canton === 'AR' && path.suspension === 'three' ? 'blockWhenEnteringApplicableSuspension' : 'none',
      qualification: { delivery: 'qualifiedActualDelivery', authorityLevel: 'cantonal', generalRoute: 'qualified', specialLaw: 'excluded', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
      temporalBinding: { caseCoverage: { ...coverage }, calculationCoverage: { ...coverage }, sourceCoverage: { ...coverage },
        evaluation: 'eachEvaluatedDayIncludingEndShift', normVersionCoverage: { from: definition.normFrom, to: null },
        futureNormAssumption: 'proposalAssumingContinuedApplicabilityNotFutureLegalVerification' },
      sourceRefs: path.sourceRefs.map(id => sourceRef(id, id === definition.source ? pathLocators[path.id] : undefined)) });
  }
  catalog.qualificationPolicies = catalog.paths.map(path => {
    const base = { pathId: path.pathId, pathRevision: path.revision, pathSha256: objectSha256(path) };
    const researchPath = research.paths.find(row => row.id === path.researchRef);
    if (!researchPath) return { ...base, mode: 'legacyV1', baseline: { releaseId: baselineManifest.releaseId, catalogSha256: AP23E2_BASE_CATALOG_SHA256 } };
    return { ...base, mode: 'qualifiedDayProcedure', requirements: { action: researchPath.action,
      decisionKind: researchPath.action === 'executionAppeal' ? 'qualifiedVRPGArt63Order' : researchPath.action === 'proceduralSubmission' ? 'notApplicable' : 'finalDecision',
      unit: 'day', opening: 'qualifiedCompleteActualDelivery', notice: 'uncontested', termChange: 'none', urgency: 'none' } };
  });
  catalog.releaseBinding = { status: 'candidate', releaseId: null, approval: null, targetComponentRefs: [],
    sourceReviewRef: null, referenceSuiteRef: null, promotionRequirement: 'rebindExactTargetReleaseBytesAndApproveBeforeActivation',
    pathEligibility: catalog.paths.map(path => {
      const holiday = catalog.holidayBindings.find(binding => binding.holidayBindingId === path.holidayBindingId);
      const suspension = catalog.suspensionProfiles.find(profile => profile.suspensionProfileId === path.suspensionProfileId);
      const policy = catalog.qualificationPolicies.find(row => row.pathId === path.pathId);
      return { status: 'candidate', pathId: path.pathId, pathRevision: path.revision, pathSha256: objectSha256(path),
        holidayBindingId: path.holidayBindingId, holidayBindingSha256: objectSha256(holiday), suspensionProfileId: path.suspensionProfileId,
        suspensionProfileSha256: objectSha256(suspension), qualificationPolicySha256: objectSha256(policy),
        caseCoverage: { ...path.temporalBinding.caseCoverage }, calculationCoverage: { ...path.temporalBinding.calculationCoverage },
        targetComponentRefs: [], sourceReviewRef: null, referenceSuiteRef: null };
    }) };
  catalog.excludedPaths.push(
    { exclusionId: 'ap23e1-lu-zg-ar-non-final-ordinary-appeals', scope: 'Nur neue ordentliche LU-/ZG-/AR-Rechtsmittelwege', reason: 'Nur Endentscheide positiv qualifiziert. Bestehende TI-/GR-Zwischenentscheidspfade bleiben unverändert.' },
    { exclusionId: 'ap23e1-lu-zg-ar-payment-and-performance', scope: 'Nur neue angeordnete LU-/ZG-/AR-Verfahrenseingaben', reason: 'Keine Kostenvorschüsse, Zahlungs- oder materiellen Erfüllungsfristen. Der bestehende TI-Kostenvorschusspfad bleibt erhalten.' },
    { exclusionId: 'ap23e1-lu-objection-and-reason-request', scope: 'LU Einsprache und Begründungsverlangen', reason: 'Eigene Verfahren und Eröffnungsschritte, nicht als ordentliche 30-Tage-Beschwerde freigegeben.' },
    { exclusionId: 'ap23e1-zg-shortened-or-unconfirmed-opening', scope: 'ZG verkürzte Dringlichkeitsfrist und mündliche Eröffnung ohne vollständige schriftliche Bestätigung', reason: 'Nicht als gewöhnliche vollständig eröffnete 20-/30-Tage-Frist qualifiziert.' },
    { exclusionId: 'ap23e1-ar-notice-special-law-and-execution-scope', scope: 'Neue AR-Wege, insbesondere fehlende Belehrung, Bau-/Steuer-/Beschaffungsrecht und unqualifizierte Vollstreckung', reason: 'Keine Umdeutung einer Zwei-Monatsregel in Tage. Art. 63 nur für die qualifizierte VRPG-Vollstreckungsanordnung, nicht für SchKG, blosse Mahnung oder nachfolgenden Gerichtsschritt.' },
    { exclusionId: 'ap23e1-ar-o1-end-shift-into-suspension', scope: 'Neue AR-Gerichtswege mit tatsächlich anwendbarem Stillstand', reason: 'Abgenommene begrenzte Sperre bei Endverschiebung in neu beginnenden Stillstand. Kein definitives Fristresultat oder Kalenderexport.' }
  );
  for (const descriptor of [{ path: 'manifest.json', sha256: rawSha256(baselineManifestText) }, ...baselineManifest.artifacts]) {
    catalog.preserved.push({ path: `${AP23E2_BASE}/${descriptor.path}`, sha256: descriptor.sha256 });
  }
  catalog.preserved.push({ path: AP23E2_RESEARCH_PATH, sha256: rawSha256(researchText) },
    { path: AP23E2_ACCEPTANCE_PATH, sha256: rawSha256(acceptanceText) });
  files.set(AP23E2_ADMIN_PATH, encode(catalog));
  const manifest = structuredClone(baselineManifest);
  Object.assign(manifest, { $schema: schemaPrefix + 'local-reference-manifest-v9.schema.json', formatVersion: '9.0.0',
    releaseId: AP23E2_RELEASE_ID, releaseStatus: 'candidate', createdOn: '2026-10-18' });
  manifest.compatibility.minimumConsumerFormatVersion = '9.0.0';
  manifest.sourceSummary = { latestReviewedOn: '2026-10-18', legalBasisReviewStatus: 'pending', technicalValidationStatus: 'pending',
    sourceIds: [...new Set([...files.values()].flatMap(text => (JSON.parse(text).sources ?? []).map(source => source.sourceId)))].sort() };
  manifest.artifacts = baselineManifest.artifacts.map(descriptor => descriptor.path === AP23E2_ADMIN_PATH
    ? { ...descriptor, schemaId: catalog.$schema, byteLength: Buffer.byteLength(files.get(descriptor.path)), sha256: rawSha256(files.get(descriptor.path)) }
    : structuredClone(descriptor));
  manifest.extensions = { 'steimer.local-reference': { workPackage: 'AP23E2', structuralContractProbeOnly: true,
    productionActivation: false, sourceReleaseApproved: false, calendarExportEnabled: false, sourceReview: 'pending',
    contractDecision: 'DEC-2026-033', contractDecisionStatus: 'proposed',
    historicalPayloadPolicy: 'The other 40 artifacts are exact MVP08 bytes. Embedded MVP08 approvals remain historical and do not authorize this candidate release. This structural probe is not a promoted, installable or runtime-readable bundle.',
    baselineManifestSha256: AP23E2_BASE_MANIFEST_SHA256, acceptedResearchSha256: AP23E2_RESEARCH_SHA256,
    acceptanceSha256: rawSha256(acceptanceText) } };
  const manifestText = encode(manifest);
  const integrity = { kind: 'ap23e2-structural-contract-candidate', releaseId: AP23E2_RELEASE_ID, contractDecision: 'DEC-2026-033',
    contractStatus: 'proposed', releaseStatus: 'candidate', productionActivation: false, referenceOnly: true,
    runtimeReadable: false, calendarExportEnabled: false, sourceReview: 'pending',
    basedOn: [{ path: `${AP23E2_BASE}/manifest.json`, sha256: AP23E2_BASE_MANIFEST_SHA256 },
      { path: `${AP23E2_BASE}/${AP23E2_ADMIN_PATH}`, sha256: AP23E2_BASE_CATALOG_SHA256 },
      { path: AP23E2_RESEARCH_PATH, sha256: AP23E2_RESEARCH_SHA256 }, { path: AP23E2_ACCEPTANCE_PATH, sha256: rawSha256(acceptanceText) }],
    counts: { artifacts: 41, unchangedRawArtifacts: 40, totalPaths: 25, unchangedLegacyPaths: 12, newPaths: 13,
      laws: 5, suspensionProfiles: 8, holidayBindings: 5, qualificationPolicies: 25 },
    manifest: { path: `${AP23E2_OUTPUT}/bundle/manifest.json`, byteLength: Buffer.byteLength(manifestText), sha256: rawSha256(manifestText) },
    artifacts: manifest.artifacts.map(entry => ({ path: `${AP23E2_OUTPUT}/bundle/${entry.path}`, byteLength: entry.byteLength, sha256: entry.sha256 })),
    buildScript: { path: 'scripts/build-ap23e2-candidate.mjs', sha256: rawSha256(await read('scripts/build-ap23e2-candidate.mjs')) } };
  return { catalog, manifest, files, manifestText, integrity, integrityText: encode(integrity), baselineCatalog, baselineManifest, research };
}

export async function materializeAP23E2Candidate(mode) {
  assert.ok(['write', 'check'].includes(mode));
  const result = await buildAP23E2Candidate();
  const outputs = [...result.files].map(([path, text]) => [`${AP23E2_OUTPUT}/bundle/${path}`, text]);
  outputs.push([`${AP23E2_OUTPUT}/bundle/manifest.json`, result.manifestText], [`${AP23E2_OUTPUT}/candidate-integrity.json`, result.integrityText]);
  for (const [path, text] of outputs) {
    if (mode === 'write') { await mkdir(dirname(resolve(AP23E2_ROOT, path)), { recursive: true }); await writeFile(resolve(AP23E2_ROOT, path), text); }
    else assert.equal(await read(path), text, `Generated candidate differs ${path}`);
  }
  console.log(JSON.stringify({ mode, releaseId: AP23E2_RELEASE_ID, structuralOnly: true, runtimeReadable: false,
    artifacts: result.files.size, paths: result.catalog.paths.length, manifestSha256: rawSha256(result.manifestText) }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flag = process.argv[2];
  if (!['--write', '--check'].includes(flag)) throw new Error('Use --write or --check');
  await materializeAP23E2Candidate(flag.slice(2));
}
