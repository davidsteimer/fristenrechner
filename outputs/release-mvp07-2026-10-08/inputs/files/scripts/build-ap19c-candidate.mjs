// SPDX-License-Identifier: AGPL-3.0-only
// Run with Node 22: node --import tsx scripts/build-ap19c-candidate.mjs
// This creates an isolated, inactive candidate. Existing targets are never overwritten.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const candidateRelativePath = 'data/candidates/2026-09-25-ap19c1';
export const candidateReleaseId = '2026-09-25-ap19c1-candidate.1';
const baseRelative = 'data/releases/2026-09-22-mvp-04-approved.1';
const schemaBase = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = relative => readFileSync(join(root, relative));
const json = relative => JSON.parse(read(relative).toString('utf8'));
const encode = object => Buffer.from(`${JSON.stringify(object, null, 2)}\n`, 'utf8');
const coverage = { from: '2026-01-01', to: '2027-12-31' };
const ref = (sourceId, locator) => ({ sourceId, locator });
const fact = (factKey, ...allowedValues) => ({ factKey, allowedValues });
const uniqueRefs = refs => [...new Map(refs.map(item => [`${item.sourceId}|${item.locator}`, item])).values()];
const reviewRelative = 'outputs/ap19c1-2026-09-25/source-review.json';
const referencesRelative = 'tests/golden/candidates/ap19b-social-deadlines.json';
const legacyReferencesRelative = 'tests/golden/candidates/ap17b-anwendbarkeit.json';
const temporalEvidenceRelative = 'docs/fachrecht/zeitliche-bindung-ap19c1.md';
const approvedAP19B = new Map([
  ['docs/architektur/sozialversicherungsvertrag-ap19b.md', '0a10fab77735e8da31769f954b9a80178b081adda5cdb5ef3ed7b765581b0493'],
  ['docs/fachrecht/quellenabgleich-ap19b.md', 'e234dfaf76ae38b1e02f5562e738d94ae33738f6429c8130e785f0adb3141141'],
  ['tests/golden/candidates/ap19b-migration-plan.json', '105875c6ffa5b225c845f6da056568361aa610f8479d2256c2924f9ed7ad2087'],
  [referencesRelative, 'da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8']
]);

export function prepareAP19CCandidate() {
  for (const [path, expected] of approvedAP19B) assert.equal(digest(read(path)), expected, `Changed approved input: ${path}`);
  assert.equal(digest(read(`${baseRelative}/manifest.json`)), 'a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e', 'Changed MVP 0.4 base manifest');
  const baseManifest = json(`${baseRelative}/manifest.json`);
  const sourceReview = json(reviewRelative);
  assert.equal(digest(read(reviewRelative)), 'a3a423687f45a3706dc34095d41c5356cd97891b21e7989bde47b6f363acf773', 'Changed AP19C1 source evidence');
  assert.equal(digest(read(legacyReferencesRelative)), 'd180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47', 'Changed accepted AP17B references');
  assert.equal(sourceReview.reviewId, 'AP19C1-SOURCE-REVIEW-20260925');
  assert.equal(sourceReview.checkedOn, '2026-09-25');
  assert.equal(sourceReview.humanApproval, false, 'Source refresh is not integration approval');
  const files = new Map();
  for (const descriptor of baseManifest.artifacts) {
    const bytes = read(`${baseRelative}/${descriptor.path}`);
    assert.equal(digest(bytes), descriptor.sha256, `Changed base artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    files.set(descriptor.path, bytes);
  }
  const original = json(`${baseRelative}/special-regimes/vrpg-be.json`);
  const plan = json('tests/golden/candidates/ap19b-migration-plan.json');
  assert.equal(digest(files.get('special-regimes/vrpg-be.json')), plan.base.catalogSha256);
  const rest = structuredClone(original);
  const oldDefinitionIds = new Set(plan.migrations.map(item => item.oldDefinitionId));
  const oldRegimeIds = new Set(plan.migrations.map(item => item.oldRegimeId));
  rest.catalogId = 'vrpg-be-special-regimes-rest';
  rest.deadlineDefinitions = rest.deadlineDefinitions.filter(item => !oldDefinitionIds.has(item.deadlineDefinitionId));
  rest.regimes = rest.regimes.filter(item => !oldRegimeIds.has(item.regimeId));
  rest.blockedMappings = rest.blockedMappings.filter(item => !item.mappingId.startsWith('SOC-'));
  assert.equal(rest.deadlineDefinitions.length, 33);
  assert.equal(rest.regimes.length, 40);
  assert.deepEqual(rest.blockedMappings.map(item => item.mappingId), ['PROC-ADMIN-OTHER']);
  assert.deepEqual(rest.deadlineDefinitions, original.deadlineDefinitions.filter(item => plan.preservedNonSocialDefinitionIds.includes(item.deadlineDefinitionId)));
  assert.deepEqual(rest.regimes, original.regimes.filter(item => plan.preservedNonSocialRegimeIds.includes(item.regimeId)));
  // Apart from the explicit partition and new catalog ID, the old component stays intact.
  const reconstructed = { ...rest, catalogId: original.catalogId, deadlineDefinitions: original.deadlineDefinitions, regimes: original.regimes, blockedMappings: original.blockedMappings };
  assert.deepEqual(reconstructed, original);

  const additionalSources = [
    ['SRC-AP19C-ELG-20260101', 'statute', 'ELG, Konsolidierung 1. Januar 2026', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/cc/2007/804/20260101/de', '2026-01-01'],
    ['SRC-AP19C-ELG-20270101', 'statute', 'ELG, Zukunftsvergleich der Konsolidierung 1. Januar 2027', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/cc/2007/804/20270101/de', '2027-01-01'],
    ['SRC-AP19C-EGELG-BE-20250101', 'statute', 'EG ELG Bern, Artikel 8 und 9', 'Kanton Bern', 'https://www.belex.sites.be.ch/api/de/versions/3072/pdf_file', '2025-01-01'],
    ['SRC-AP19C-GSOG-BE', 'statute', 'GSOG Bern, Artikel 54, Fassungsvergleich Januar und Mai 2026', 'Kanton Bern', 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.1', null]
  ].map(([sourceId, sourceType, title, authority, url, documentVersionDate]) => ({ sourceId, sourceType, title, authority, url, documentVersionDate, reviewedOn: '2026-09-25', reviewStatus: 'verified' }));
  const sources = new Map([...original.sources, ...additionalSources].map(source => [source.sourceId, source]));
  const frg = ref('SRC-AP17C-FRG-BE-20210401', 'Art. 2, nur bei geklärten Anknüpfungen nach Art. 38 Abs. 3 ATSG');
  const gsog = ref('SRC-AP19C-GSOG-BE', 'Art. 54, Sozialversicherungsrechtliche Abteilung des Verwaltungsgerichts');
  const elg = ref('SRC-AP19C-ELG-20260101', 'Art. 1, individuelle Leistungen nach dem zweiten Kapitel');
  const egElg = ref('SRC-AP19C-EGELG-BE-20250101', 'Art. 8, Ausgleichskasse des Kantons Bern als Durchführungsstelle');
  const atsg = locator => ref('SRC-AP17C-ATSG-20240101', locator);
  const baseATSG = atsg('Art. 2, Art. 38 Abs. 1 bis 4, Art. 39 und 40. Art. 41 nur Kontext, keine Wiederherstellungsprüfung');
  // Norm bounds describe the positively checked applicability window, not enactment dates.
  // The explicit interpretation/evidence note binds a conservative application interval.
  const temporal = (refs, legalFrom, normFrom = coverage.from) => ({
    legalValidity: legalFrom === null ? null : { from: legalFrom, to: null }, caseCoverage: { ...coverage }, sourceCoverage: { ...coverage },
    normBindings: refs.map(source => ({ ...source, temporalSelector: 'legalTriggerDate', applicableFrom: normFrom, applicableTo: coverage.to, verification: 'verified' })),
    sourceRefs: refs
  });
  const calendarBindings = ['party', 'representative'].map(role => ({
    calendarBindingId: `be-${role}`, holidayCanton: 'BE', spatialScopeId: 'BE', calendarId: 'be-public-holidays', requiredAnchorRoles: [role], sourceRefs: [frg]
  }));
  const federalRules = [];
  const cantonalBindings = [];
  const auditMigrations = [];
  function addBinding(rule, bindingId, route, cantonalRefs) {
    const refs = uniqueRefs([...cantonalRefs, ...route.sourceRefs]);
    cantonalBindings.push({
      bindingId, revision: 1, status: 'candidate', labels: { de: `Bern · ${rule.labels.de}`, fr: `Berne · ${rule.labels.fr}` },
      ruleId: rule.ruleId, ruleRevision: 1, procedureContextCanton: 'BE', entryProfileId: 'vrpg-be',
      contextRoutes: [route], calendarBindings: structuredClone(calendarBindings), supplementaryLawRefs: cantonalRefs,
      ...temporal(refs, coverage.from), legalValidity: { ...coverage }
    });
  }
  for (const migration of plan.migrations) {
    const definition = original.deadlineDefinitions.find(item => item.deadlineDefinitionId === migration.oldDefinitionId);
    const regime = original.regimes.find(item => item.regimeId === migration.oldRegimeId);
    assert.ok(definition && regime, `Incomplete migration: ${migration.oldMappingId}`);
    const applicability = definition.applicability;
    const court = ['appeal', 'complaint-correction'].includes(applicability.selection.action);
    const action = applicability.selection.action === 'ongoing' ? 'ordered-administrative-days' : applicability.selection.action;
    const allRefs = uniqueRefs([...definition.sourceRefs, ...applicability.sourceRefs, ...regime.sourceRefs]);
    const federalRefs = allRefs.filter(source => sources.get(source.sourceId)?.authority !== 'Kanton Bern');
    const cantonalRefs = allRefs.filter(source => sources.get(source.sourceId)?.authority === 'Kanton Bern');
    const legalFrom = definition.validity.legalEffectiveFrom;
    const rule = {
      ruleId: migration.ruleId, revision: 1, status: 'candidate', labels: regime.labels,
      law: applicability.selection.law, matter: applicability.matter, action,
      stage: court ? 'cantonal-insurance-court' : 'administration', triggerKind: applicability.triggerKind,
      notificationChannels: [...applicability.notificationChannels], calculation: structuredClone(definition.calculation),
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay',
      ...temporal(federalRefs, legalFrom)
    };
    federalRules.push(rule);
    const law = applicability.selection.law;
    const origin = action === 'complaint-correction' ? 'insuranceCourt' : law === 'ivg' ? 'ivOffice' : law === 'ahvg' ? 'compensationOffice' : 'accidentInsurer';
    const jurisdictionRef = law === 'ivg' ? ref('SRC-AP17C-IVG-20260101', 'Art. 69 Abs. 1 Bst. a, Zuständigkeit fachlich geklärt') : law === 'ahvg' ? ref('SRC-AP17C-AHVG-20260101', 'Art. 84, Zuständigkeit fachlich geklärt') : atsg('Art. 58, Gerichtszuständigkeit im ordentlichen Inlandsfall fachlich geklärt');
    const route = {
      contextRouteId: court ? `be-${law}-court-qualified` : `be-${law}-administration-qualified`, kind: court ? 'legal-jurisdiction' : 'product-scope',
      requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', origin), ...(court ? [fact('courtCanton', 'BE')] : []), fact('jurisdictionSpecialCase', 'ordinary')],
      sourceRefs: court ? [jurisdictionRef, gsog] : [federalRefs[0]]
    };
    addBinding(rule, migration.bindingId, route, uniqueRefs([...cantonalRefs, ...(court ? [gsog] : [])]));
    const binding = cantonalBindings.at(-1);
    const movedRefs = uniqueRefs([...rule.sourceRefs, ...binding.sourceRefs]);
    for (const source of allRefs) assert.ok(movedRefs.some(item => item.sourceId === source.sourceId && item.locator === source.locator), `Lost source trail: ${migration.oldMappingId}`);
    assert.deepEqual(rule.calculation, definition.calculation);
    auditMigrations.push({ ...migration, preservedSourceRefs: allRefs, federalSourceRefs: federalRefs, bindingSourceRefs: binding.sourceRefs, calculationUnchanged: true, profileIdsUnchanged: true });
  }

  const actions = [
    ['OBJ', 'objection', 'administration', 'initial-benefit-disposition', 'Einsprache gegen Leistungsverfügung', 'Opposition à une décision de prestations', atsg('Art. 52 Abs. 1')],
    ['APP', 'appeal', 'cantonal-insurance-court', 'objection-decision', 'Beschwerde gegen Einspracheentscheid', 'Recours contre une décision sur opposition', atsg('Art. 56, 58 und 60')],
    ['ADM', 'ordered-administrative-days', 'administration', 'authority-day-order', 'Angeordnete Tagesfrist im Verwaltungsverfahren', 'Délai fixé en jours dans la procédure administrative', atsg('Art. 38 bis 40, konkret angeordnete Tagesfrist')],
    ['CORRECTION', 'complaint-correction', 'cantonal-insurance-court', 'court-correction-day-order', 'Nachfrist zur Verbesserung der Beschwerde', 'Délai supplémentaire pour régulariser le recours', atsg('Art. 60 Abs. 2 und Art. 61 Bst. b')]
  ];
  for (const [suffix, action, stage, triggerKind, de, fr, actionRef] of actions) {
    const federalRefs = [elg, baseATSG, actionRef];
    if (suffix === 'CORRECTION') federalRefs.push(ref('JUD-AP17C-BGER-8C-767-2008-20090112', 'E. 4.3.2, nur qualifizierte Nachfrist zur Beschwerdeverbesserung'));
    const rule = {
      ruleId: `CH-SOC-ELG-${suffix}`, revision: 1, status: 'candidate', labels: { de: `ELG · ${de}`, fr: `LPC · ${fr}` },
      law: 'elg', matter: 'el-individual-benefits', action, stage, triggerKind, notificationChannels: ['individual-service'],
      calculation: { type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded', ...(['OBJ', 'APP'].includes(suffix) ? { duration: { value: 30, unit: 'day' } } : { durationInputId: 'deadlineDays' }) },
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay',
      ...temporal(federalRefs, '2008-01-01')
    };
    const court = stage === 'cantonal-insurance-court';
    const route = court ? {
      contextRouteId: 'be-atsg58-court', kind: 'legal-jurisdiction',
      requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', suffix === 'CORRECTION' ? 'insuranceCourt' : 'compensationOffice'), fact('courtCanton', 'BE'), fact('partyDomicileCanton', 'BE'), fact('jurisdictionSpecialCase', 'ordinary')],
      sourceRefs: [atsg('Art. 58, Gerichtszuständigkeit im ordentlichen Inlandsfall fachlich geklärt'), gsog]
    } : {
      contextRouteId: 'be-elg-akb-article8', kind: 'legal-jurisdiction',
      requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', 'compensationOffice'), fact('elgAdministrativeCanton', 'BE'), fact('jurisdictionSpecialCase', 'ordinary')],
      sourceRefs: [ref('SRC-AP19C-ELG-20260101', 'Art. 21, kantonale Verwaltungszuständigkeit fachlich geklärt'), egElg]
    };
    federalRules.push(rule);
    addBinding(rule, `BE-SOC-ELG-${suffix}`, route, [frg, court ? gsog : egElg]);
    if (court) {
      // ATSG 58 qualifies domicile/jurisdiction at the separately established appeal date.
      // Never copy the opening or court-order date into this independent factual anchor.
      const jurisdictionLocator = route.sourceRefs.find(source => source.sourceId === 'SRC-AP17C-ATSG-20240101').locator;
      const norm = cantonalBindings.at(-1).normBindings.find(item => item.sourceId === 'SRC-AP17C-ATSG-20240101' && item.locator === jurisdictionLocator);
      assert.ok(norm, 'ELG court route must bind ATSG 58');
      norm.temporalSelector = 'jurisdictionReferenceDate';
    }
  }
  const excludedPaths = original.blockedMappings.filter(item => item.mappingId.startsWith('SOC-')).map(item => {
    const law = item.mappingId.includes('-IV-') ? 'ivg' : item.mappingId.includes('-AHV-') ? 'ahvg' : 'uvg';
    return { exclusionId: item.mappingId, law, matter: law === 'ivg' ? 'iv-individual-benefits' : law === 'ahvg' ? 'ahv-individual-benefits' : 'uvg-individual-benefits', action: 'other-court-period', reasonKind: 'unsupported-procedure', reasonKey: 'unsupported-procedure', labels: { de: 'Andere gerichtliche Frist nicht modelliert', fr: 'Autre délai judiciaire non modélisé' }, sourceRefs: structuredClone(item.sourceRefs) };
  });
  excludedPaths.push(...[
    ['ELG-THIRD-CHAPTER', 'institution-subsidies', 'statutory-exclusion', 'Drittes Kapitel ELG, kein pauschaler ATSG-Weg', 'Chapitre 3 LPC, pas de voie LPGA générale'],
    ['ELG-COURT-OTHER', 'el-individual-benefits', 'unsupported-procedure', 'Andere gerichtliche Frist nicht modelliert', 'Autre délai judiciaire non modélisé']
  ].map(([exclusionId, matter, reasonKind, de, fr]) => ({ exclusionId, law: 'elg', matter, action: 'other', reasonKind, reasonKey: reasonKind, labels: { de, fr }, sourceRefs: [elg, atsg('Art. 61, keine pauschale Gleichstellung sämtlicher gerichtlicher Fristen')] })));
  const suspensionProfiles = original.suspensionProfiles.filter(item => item.suspensionProfileId === 'S_ATSG');
  const filingProfiles = original.filingProfiles.filter(item => item.filingProfileId === 'F7_ATSG_DISPATCH');
  const usedSourceIds = new Set([federalRules, cantonalBindings, excludedPaths, suspensionProfiles, filingProfiles].flatMap(collection => {
    const found = [];
    const visit = value => { if (value && typeof value === 'object') { if (typeof value.sourceId === 'string') found.push(value.sourceId); for (const child of Object.values(value)) visit(child); } };
    visit(collection); return found;
  }));
  usedSourceIds.add('SRC-AP19C-ELG-20270101');
  const componentRefs = baseManifest.artifacts.filter(item => item.role === 'calendar' || item.role === 'holidayCatalog').map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 }));
  const sourceReviewRef = { reviewId: sourceReview.reviewId, sha256: digest(read(reviewRelative)) };
  const referenceSuiteRef = { suiteId: 'AP19B-SOCIAL-REFERENCES-1', sha256: digest(read(referencesRelative)) };
  const legacyReferenceSuiteRef = { suiteId: 'AP17B-ANWENDBARKEIT', sha256: digest(read(legacyReferencesRelative)) };
  const releaseEligibility = federalRules.map(rule => {
    const binding = cantonalBindings.find(item => item.ruleId === rule.ruleId);
    return {
      eligibilityId: `AP19C1-${rule.ruleId}`, releaseId: candidateReleaseId, status: 'candidate',
      ruleRef: { ruleId: rule.ruleId, revision: rule.revision, sha256: socialObjectSha256(rule) },
      bindingRef: { bindingId: binding.bindingId, revision: binding.revision, sha256: socialObjectSha256(binding) },
      contextRouteIds: binding.contextRoutes.map(item => item.contextRouteId), calendarBindingIds: binding.calendarBindings.map(item => item.calendarBindingId),
      componentRefs: structuredClone(componentRefs), sourceReviewRef: { ...sourceReviewRef }, referenceSuiteRef: { ...(rule.law === 'elg' ? referenceSuiteRef : legacyReferenceSuiteRef) },
      caseCoverage: { ...coverage }, calculationCoverage: { ...coverage }, approval: null
    };
  });
  const catalog = {
    $schema: `${schemaBase}social-procedure-catalog.schema.json`, formatVersion: '1.0.0', dataKind: 'socialProcedureCatalog', catalogId: 'ch-social-procedures',
    labels: { de: 'Nationale Sozialversicherungsverfahren · AP19C1-Kandidat', fr: 'Procédures nationales des assurances sociales · candidat AP19C1' },
    review: { reviewedOn: '2026-09-25', status: 'candidate', reviewedBy: 'Codex', basis: 'AP19B fachlich und vertraglich abgenommen. AP19C1: zwölf migrierte Pfade und vier ELG-Pfade. Quellenrefresh separat gebunden. Keine Integrations-, Release- oder Betriebsfreigabe.' },
    sources: [...usedSourceIds].sort().map(sourceId => { assert.ok(sources.has(sourceId), `Missing source: ${sourceId}`); return sources.get(sourceId); }),
    suspensionProfiles, filingProfiles, federalRules, cantonalBindings, releaseEligibility, excludedPaths
  };
  assert.equal(federalRules.length, 16);
  assert.equal(cantonalBindings.length, 16);
  assertSocialProcedureCatalog(catalog);
  files.set('special-regimes/vrpg-be.json', encode(rest));
  files.set('social-procedures/ch-social-procedures.json', encode(catalog));
  const descriptors = baseManifest.artifacts.map(item => item.role === 'specialRegimeCatalog' ? { ...item, contentId: rest.catalogId } : { ...item });
  descriptors.push({ path: 'social-procedures/ch-social-procedures.json', role: 'socialProcedureCatalog', contentId: catalog.catalogId, schemaId: catalog.$schema, mediaType: 'application/json' });
  for (const descriptor of descriptors) { descriptor.byteLength = files.get(descriptor.path).length; descriptor.sha256 = digest(files.get(descriptor.path)); }
  const sourceIds = [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort();
  const manifest = {
    ...baseManifest, $schema: `${schemaBase}release-manifest-v5.schema.json`, formatVersion: '5.0.0', releaseId: candidateReleaseId, releaseStatus: 'candidate', createdOn: '2026-09-25',
    coverage: { from: coverage.from, to: null }, specialRegimeCatalogIds: [rest.catalogId], socialProcedureCatalogIds: [catalog.catalogId],
    sourceSummary: { ...baseManifest.sourceSummary, latestReviewedOn: '2026-09-25', sourceIds },
    compatibility: { ...baseManifest.compatibility, minimumConsumerFormatVersion: '5.0.0' }, artifacts: descriptors,
    extensions: { 'steimer.candidate': { workPackage: 'AP19C1', baseReleaseId: baseManifest.releaseId, contractDecision: 'DEC-2026-025', approvalRequired: true, productionActivation: false, sourceReviewRef, referenceSuiteRefs: [legacyReferenceSuiteRef, referenceSuiteRef], scope: 'Zwölf migrierte Sozialpfade und vier ELG-Pfade. Alle Sozialfreigaben Kandidat, keine AVIG-/KVG-Aktivierung. Übrige Daten unverändert.' } }
  };
  files.set('manifest.json', encode(manifest));
  const verification = {
    workPackage: 'AP19C1', preparedOn: '2026-09-25', candidateReleaseId, candidatePath: candidateRelativePath,
    manifestSha256: digest(files.get('manifest.json')), baseManifestSha256: digest(read(`${baseRelative}/manifest.json`)),
    counts: { migratedRules: 12, newElgRules: 4, federalRules: 16, cantonalBindings: 16, retainedDefinitions: 33, retainedRegimes: 40, migratedBlockedPaths: 3 },
    preservedRestDeepEqual: true, productionActivation: false, integrationApproved: false,
    temporalEvidenceLimit: 'legalValidity der Anbindungen und Normbindungsgrenzen bezeichnen das konservative, positiv belegte Anwendungsintervall 2026–2027. Weder erstes Inkrafttreten noch Ausserkrafttreten werden behauptet. Die Wahl beruht auf den gebundenen AP19B-/AP19C1-Normnachweisen, nicht allein auf identischen technischen Datumswerten. Kandidatenstatus und approval:null bleiben unverändert.',
    temporalContractEvidence: { path: temporalEvidenceRelative, sha256: digest(read(temporalEvidenceRelative)) },
    sourceReviewRef, referenceSuiteRefs: [legacyReferenceSuiteRef, referenceSuiteRef], migrations: auditMigrations,
    unchangedArtifacts: descriptors.filter(item => !['specialRegimeCatalog', 'socialProcedureCatalog'].includes(item.role)).map(item => ({ path: item.path, sha256: item.sha256 }))
  };
  return { files, verification, catalog, rest, manifest };
}

export function persistAP19CCandidate(prepared, target = join(root, candidateRelativePath), evidenceTarget = join(root, 'outputs/ap19c1-2026-09-25/build-verification.json')) {
  const writes = [...prepared.files].map(([path, bytes]) => [join(target, path), bytes]);
  writes.push([evidenceTarget, encode(prepared.verification)]);
  // Preflight every destination before any write, so a mismatch cannot leave a partial replacement.
  for (const [path, bytes] of writes) if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), `Refusing to overwrite differing candidate file: ${path}`);
  for (const [path, bytes] of writes) if (!existsSync(path)) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); }
  for (const [path, bytes] of writes) assert.ok(readFileSync(path).equals(bytes), `Readback differs: ${path}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = prepareAP19CCandidate();
  persistAP19CCandidate(prepared);
  console.log(JSON.stringify({ releaseId: candidateReleaseId, ...prepared.verification.counts, manifestSha256: prepared.verification.manifestSha256, integrationApproved: false, productionActivation: false }, null, 2));
}
