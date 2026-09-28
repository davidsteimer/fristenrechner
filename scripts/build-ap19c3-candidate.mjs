// SPDX-License-Identifier: AGPL-3.0-only
// Node 22: node --import tsx scripts/build-ap19c3-candidate.mjs
// Append-only candidate derivation. No data promotion, approval or publication.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const candidateRelativePath = 'data/candidates/2026-09-28-ap19c3';
export const candidateReleaseId = '2026-09-28-ap19c3-candidate.1';
const baseRelativePath = 'data/candidates/2026-09-28-ap19c2';
const reviewRelativePath = 'outputs/ap19c3-2026-09-28/sources/source-review.json';
const temporalRelativePath = 'docs/fachrecht/zeitliche-bindung-ap19c3.md';
const referencesRelativePath = 'tests/golden/candidates/ap19b-social-deadlines.json';
const coverage = { from: '2026-01-01', to: '2027-12-31' };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(join(root, path));
const json = path => JSON.parse(read(path).toString('utf8'));
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ref = (sourceId, locator) => ({ sourceId, locator });
const fact = (factKey, ...allowedValues) => ({ factKey, allowedValues });
const protectedInputs = new Map([
  [`${baseRelativePath}/manifest.json`, '00a45f3766b376bda21fe13966ff5aad3769cddb9fe315890bd272576520fded'],
  ['docs/architektur/sozialversicherungsvertrag-ap19b.md', '0a10fab77735e8da31769f954b9a80178b081adda5cdb5ef3ed7b765581b0493'],
  ['docs/fachrecht/quellenabgleich-ap19b.md', 'e234dfaf76ae38b1e02f5562e738d94ae33738f6429c8130e785f0adb3141141'],
  [referencesRelativePath, 'da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8']
]);

export function prepareAP19C3Candidate() {
  for (const [path, expected] of protectedInputs) assert.equal(digest(read(path)), expected, `Changed approved input: ${path}`);
  const baseManifest = json(`${baseRelativePath}/manifest.json`);
  const sourceReview = json(reviewRelativePath);
  assert.equal(digest(read(reviewRelativePath)), '00f16cfb9653d32a73555c9ccd6c22a32af7810aae0068fe540d5497aac1b6e9', 'Changed AP19C3 source evidence');
  assert.equal(digest(read(temporalRelativePath)), 'e0e59f77a63611bd7547cb1f3231cb95b52c429424462c7e528e926491f686fd', 'Changed AP19C3 temporal evidence');
  assert.equal(sourceReview.reviewId, 'AP19C3-SOURCE-REVIEW-20260928');
  assert.equal(sourceReview.checkedOn, '2026-09-28');
  assert.equal(sourceReview.humanApproval, false, 'Source evidence is not integration approval');
  assert.deepEqual(sourceReview.scope.sourceCoverage, coverage);
  for (const sourceId of ['SRC-AP17C-ATSG-20240101', 'SRC-AP19C3-KVG-20260101', 'SRC-AP19C3-KVG-20260701', 'SRC-AP19C-GSOG-BE', 'SRC-AP17C-FRG-BE-20210401']) {
    assert.ok(sourceReview.checks.some(check => check.sourceRef === sourceId && check.result === 'no-relevant-change-detected'), `Missing fresh source evidence: ${sourceId}`);
  }
  assert.ok(sourceReview.checks.some(check => check.sourceRef === 'SRC-AP19C3-KVG-FUTURE-INDEX-20260928' && check.result === 'no-indexed-future-impact-detected' && check.entries.length === 0 && check.noPublicationYearFilter && check.noPreselectedArticleFilter), 'Missing complete future index evidence');
  const files = new Map();
  for (const descriptor of baseManifest.artifacts) {
    const bytes = read(`${baseRelativePath}/${descriptor.path}`);
    assert.equal(digest(bytes), descriptor.sha256, `Changed C2 artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    files.set(descriptor.path, bytes);
  }
  const original = json(`${baseRelativePath}/social-procedures/ch-social-procedures.json`);
  const catalog = structuredClone(original);
  const atsg = locator => ref('SRC-AP17C-ATSG-20240101', locator);
  const kvg = locator => ref('SRC-AP19C3-KVG-20260101', locator);
  const gsog = ref('SRC-AP19C-GSOG-BE', 'Art. 54 Abs. 1 Bst. a und c, zuständige Abteilung des Verwaltungsgerichts');
  const frg = ref('SRC-AP17C-FRG-BE-20210401', 'Art. 2, nur bei geklärten Anknüpfungen nach Art. 38 Abs. 3 ATSG');
  catalog.sources.push(
    { sourceId: 'SRC-AP19C3-KVG-20260101', sourceType: 'statute', title: 'KVG, Konsolidierung 1. Januar 2026. Artikelbezogener Fassungsvergleich und Zukunftsindex separat gebunden', authority: 'Schweizerische Eidgenossenschaft', url: 'https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260101/de', documentVersionDate: '2026-01-01', reviewedOn: '2026-09-28', reviewStatus: 'verified' },
    { sourceId: 'SRC-AP19C3-KVG-20260701', sourceType: 'statute', title: 'KVG, Fassungsvergleich 1. Juli 2026', authority: 'Schweizerische Eidgenossenschaft', url: 'https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260701/de', documentVersionDate: '2026-07-01', reviewedOn: '2026-09-28', reviewStatus: 'verified' },
    { sourceId: 'SRC-AP19C3-KVG-FUTURE-INDEX-20260928', sourceType: 'officialDossier', title: 'Amtlicher vollständiger Zukunftsänderungsindex für KVG und ATSG, Abruf 28. September 2026', authority: 'Schweizerische Eidgenossenschaft', url: 'https://fedlex.data.admin.ch/sparqlendpoint', documentVersionDate: null, reviewedOn: '2026-09-28', reviewStatus: 'verified' }
  );
  const temporal = (sourceRefs, jurisdictionRefs = []) => ({
    legalValidity: { ...coverage }, caseCoverage: { ...coverage }, sourceCoverage: { ...coverage },
    normBindings: sourceRefs.map(source => ({ ...source, temporalSelector: jurisdictionRefs.some(item => item.sourceId === source.sourceId && item.locator === source.locator) ? 'jurisdictionReferenceDate' : 'legalTriggerDate', applicableFrom: coverage.from, applicableTo: coverage.to, verification: 'verified' })),
    sourceRefs
  });
  const actions = [
    ['OBJ', 'objection', 'administration', 'initial-benefit-disposition', 'Einsprache gegen Leistungsverfügung', 'Opposition à une décision de prestations', atsg('Art. 52 Abs. 1, keine prozess- oder verfahrensleitende Verfügung')],
    ['APP', 'appeal', 'cantonal-insurance-court', 'objection-decision', 'Beschwerde gegen Einspracheentscheid', 'Recours contre une décision sur opposition', atsg('Art. 56 Abs. 1 und 60, keine direkte Beschwerde gegen gewöhnliche Erstverfügung')],
    ['ADM', 'ordered-administrative-days', 'administration', 'authority-day-order', 'Angeordnete Tagesfrist im Verwaltungsverfahren', 'Délai fixé en jours dans la procédure administrative', atsg('Art. 38 bis 40, konkret angeordnete prozessuale Tagesfrist. Keine Zahlungs- oder materielle Anspruchsfrist')],
    ['CORRECTION', 'complaint-correction', 'cantonal-insurance-court', 'court-correction-day-order', 'Nachfrist zur Verbesserung der Beschwerde', 'Délai supplémentaire pour régulariser le recours', atsg('Art. 60 Abs. 2 und Art. 61 Bst. b')]
  ];
  for (const [suffix, action, stage, triggerKind, de, fr, actionRef] of actions) {
    const federalRefs = [
      kvg('Art. 1 Abs. 1 und 2, Art. 1a Abs. 1 und Art. 25, nur individuelle Leistungen der obligatorischen Krankenpflegeversicherung'),
      kvg('Art. 80 Abs. 1 und Art. 85, formlose Leistungsabrechnung ist keine qualifizierte Verfügung'),
      atsg('Art. 2, Art. 38 Abs. 1 bis 4, Art. 39 und 40. Art. 41 nur Kontext, keine Wiederherstellungsprüfung'), actionRef
    ];
    if (suffix === 'CORRECTION') federalRefs.push(ref('JUD-AP17C-BGER-8C-767-2008-20090112', 'E. 4.3.2, nur qualifizierte Nachfrist zur Beschwerdeverbesserung. Übertragung der allgemeinen ATSG-Aussage, kein KVG-spezifischer Entscheid'));
    const rule = {
      ruleId: `CH-SOC-KVG-OKP-${suffix}`, revision: 1, status: 'candidate', labels: { de: `KVG · OKP · ${de}`, fr: `LAMal · AOS · ${fr}` },
      law: 'kvg', matter: 'kvg-okp-individual-benefits', action, stage, triggerKind, notificationChannels: ['individual-service'],
      calculation: { type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded', ...(['OBJ', 'APP'].includes(suffix) ? { duration: { value: 30, unit: 'day' } } : { durationInputId: 'deadlineDays' }) },
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay',
      ...temporal(federalRefs)
    };
    catalog.federalRules.push(rule);
    const court = stage === 'cantonal-insurance-court';
    const jurisdictionRef = atsg('Art. 57 und 58, ordentlicher Inlandsfall. Versicherte Person mit qualifiziertem Wohnsitz im Gerichtskanton im Zeitpunkt der Beschwerdeerhebung');
    const productRef = kvg('Art. 1 Abs. 1 und Art. 80, zuständiger Leistungskrankenversicherer qualifiziert. Wohnsitz BE am legalTriggerDate ist ausschliesslich erste Produktgrenze, keine gesetzliche kantonale Zuständigkeitsregel und kein Versicherersitzfilter');
    const routeRefs = court ? [jurisdictionRef, gsog] : [productRef];
    const route = {
      contextRouteId: court ? 'be-atsg58-court' : 'be-kvg-okp-product-scope', kind: court ? 'legal-jurisdiction' : 'product-scope',
      requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', 'healthInsurer'), ...(court ? [fact('courtCanton', 'BE')] : []), fact('partyDomicileCanton', 'BE'), fact('jurisdictionSpecialCase', 'ordinary')],
      sourceRefs: routeRefs
    };
    const bindingRefs = [frg, ...routeRefs];
    catalog.cantonalBindings.push({
      bindingId: `BE-SOC-KVG-OKP-${suffix}`, revision: 1, status: 'candidate', labels: { de: `Bern · ${rule.labels.de}`, fr: `Berne · ${rule.labels.fr}` },
      ruleId: rule.ruleId, ruleRevision: rule.revision, procedureContextCanton: 'BE', entryProfileId: 'vrpg-be',
      contextRoutes: [route], calendarBindings: structuredClone(original.cantonalBindings[0].calendarBindings),
      supplementaryLawRefs: [frg, ...(court ? [gsog] : [])], ...temporal(bindingRefs, court ? [jurisdictionRef] : [])
    });
  }
  const exclusions = [
    ['KVG-PROVIDER', 'kvg-provider-admission', 'statutory-exclusion', 'Zulassung oder Ausschluss von Leistungserbringern', 'Admission ou exclusion des fournisseurs de prestations', 'Art. 1 Abs. 2 Bst. a'],
    ['KVG-TARIFF', 'kvg-tariff-dispute', 'statutory-exclusion', 'Tarif-, Preis- oder Globalbudgetstreit', 'Litige tarifaire, de prix ou de budget global', 'Art. 1 Abs. 2 Bst. b, Tariffrage innerhalb eines individuellen Leistungsstreits nicht pauschal ausgeschlossen'],
    ['KVG-PREMIUM-REDUCTION', 'kvg-premium-reduction', 'statutory-exclusion', 'Prämienverbilligung und bezeichnete Bundesbeiträge', 'Réduction des primes et subsides fédéraux désignés', 'Art. 1 Abs. 2 Bst. c'],
    ['KVG-INSURERS', 'kvg-inter-insurer-dispute', 'statutory-exclusion', 'Streit zwischen Versicherern', 'Litige entre assureurs', 'Art. 1 Abs. 2 Bst. d'],
    ['KVG-ARBITRATION', 'kvg-arbitration', 'statutory-exclusion', 'Kantonales Schiedsgerichtsverfahren', 'Procédure devant le tribunal arbitral cantonal', 'Art. 1 Abs. 2 Bst. e und Art. 89, einschliesslich der dort erfassten Tiers-garant-Vertretung'],
    ['KVG-DAILY', 'kvg-daily-allowance', 'product-scope', 'Freiwilliges KVG-Taggeld nicht erfasst', 'Indemnité journalière facultative LAMal non couverte', 'Art. 1a Abs. 1 und Art. 67, Produktgrenze und kein genereller ATSG-Ausschluss'],
    ['KVG-VVG', 'vvg-supplementary-insurance', 'product-scope', 'Privatrechtliche VVG-Zusatzversicherung nicht erfasst', 'Assurance complémentaire privée LCA non couverte', 'Art. 1a, nur KVG/OKP, keine Übernahme eines privatrechtlichen Vertragswegs'],
    ['KVG-PREMIUM-DEBT', 'kvg-premium-debt', 'product-scope', 'Prämienforderung nicht erfasst', 'Créance de primes non couverte', 'Art. 61, ausserhalb des individuellen Leistungsscope'],
    ['KVG-ENFORCEMENT', 'kvg-enforcement', 'product-scope', 'Betreibungsweg nicht erfasst', 'Poursuite non couverte', 'Art. 64a, ausserhalb des individuellen Leistungsscope'],
    ['KVG-COST-SHARING', 'kvg-cost-sharing-collection', 'product-scope', 'Kostenbeteiligungsinkasso nicht erfasst', 'Recouvrement de la participation aux coûts non couvert', 'Art. 64, ausserhalb des individuellen Leistungsscope'],
    ['KVG-INSURANCE-DUTY', 'kvg-insurance-duty', 'product-scope', 'Versicherungspflicht nicht erfasst', 'Obligation de s’assurer non couverte', 'Art. 3, ausserhalb des individuellen Leistungsscope'],
    ['KVG-CARE-RESIDUAL', 'cantonal-care-residual-financing', 'product-scope', 'Kantonale Pflege-Restfinanzierung nicht erfasst', 'Financement résiduel cantonal des soins non couvert', 'Art. 25a Abs. 5, kein gewöhnlicher Leistungsanspruch gegen den Krankenversicherer']
  ];
  catalog.excludedPaths.push(...exclusions.map(([exclusionId, matter, reasonKind, de, fr, locator]) => ({ exclusionId, law: 'kvg', matter, action: 'other', reasonKind, reasonKey: reasonKind, labels: { de, fr }, sourceRefs: [kvg(locator)] })));
  catalog.excludedPaths.push(
    { exclusionId: 'KVG-FEDERAL', law: 'kvg', matter: 'federal-instance', action: 'other', reasonKind: 'unsupported-procedure', reasonKey: 'unsupported-procedure', labels: { de: 'Bundesverwaltungsgericht oder Bundesgericht nicht erfasst', fr: 'Tribunal administratif fédéral ou Tribunal fédéral non couvert' }, sourceRefs: [kvg('Art. 53, kein kantonaler OKP-Leistungspfad')] },
    { exclusionId: 'KVG-COURT-OTHER', law: 'kvg', matter: 'kvg-okp-individual-benefits', action: 'other', reasonKind: 'unsupported-procedure', reasonKey: 'unsupported-procedure', labels: { de: 'Andere gerichtliche Frist nicht modelliert', fr: 'Autre délai judiciaire non modélisé' }, sourceRefs: [atsg('Art. 61, keine pauschale Gleichstellung sämtlicher gerichtlicher Fristen')] }
  );
  const sourceReviewRef = { reviewId: sourceReview.reviewId, sha256: digest(read(reviewRelativePath)) };
  const referenceSuiteRef = { suiteId: 'AP19B-SOCIAL-REFERENCES-1', sha256: digest(read(referencesRelativePath)) };
  const componentRefs = baseManifest.artifacts.filter(item => ['calendar', 'holidayCatalog'].includes(item.role)).map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 }));
  catalog.releaseEligibility = catalog.releaseEligibility.map(item => ({ ...item, releaseId: candidateReleaseId }));
  for (const binding of catalog.cantonalBindings.filter(item => item.ruleId.startsWith('CH-SOC-KVG-OKP-'))) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId);
    catalog.releaseEligibility.push({
      eligibilityId: `AP19C3-${binding.bindingId}`, releaseId: candidateReleaseId, status: 'candidate',
      ruleRef: { ruleId: rule.ruleId, revision: rule.revision, sha256: socialObjectSha256(rule) },
      bindingRef: { bindingId: binding.bindingId, revision: binding.revision, sha256: socialObjectSha256(binding) },
      contextRouteIds: binding.contextRoutes.map(item => item.contextRouteId), calendarBindingIds: binding.calendarBindings.map(item => item.calendarBindingId),
      componentRefs: structuredClone(componentRefs), sourceReviewRef: { ...sourceReviewRef }, referenceSuiteRef: { ...referenceSuiteRef },
      caseCoverage: { ...coverage }, calculationCoverage: { ...coverage }, approval: null
    });
  }
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · AP19C3-Kandidat', fr: 'Procédures nationales des assurances sociales · candidat AP19C3' };
  catalog.review = { reviewedOn: '2026-09-28', status: 'candidate', reviewedBy: 'Codex', basis: 'Unveränderte 20 AP19C2-Bundesregeln und 24 Anbindungen, vier neue individuelle KVG/OKP-Regeln mit vier getrennten Berner Anbindungen. AP19B abgenommen, Quellenrefresh separat gebunden. Keine AP19C3-Integrations-, Release- oder Betriebsfreigabe.' };
  assert.deepEqual(catalog.federalRules.slice(0, 20), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 24), original.cantonalBindings);
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assertSocialProcedureCatalog(catalog);
  files.set('social-procedures/ch-social-procedures.json', encode(catalog));
  const descriptors = structuredClone(baseManifest.artifacts);
  for (const descriptor of descriptors) { descriptor.byteLength = files.get(descriptor.path).length; descriptor.sha256 = digest(files.get(descriptor.path)); }
  const manifest = {
    ...baseManifest, releaseId: candidateReleaseId, createdOn: '2026-09-28',
    sourceSummary: { ...baseManifest.sourceSummary, latestReviewedOn: '2026-09-28', sourceIds: [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort() },
    artifacts: descriptors,
    extensions: { 'steimer.candidate': { workPackage: 'AP19C3', baseReleaseId: baseManifest.releaseId, contractDecision: 'DEC-2026-025', approvalRequired: true, productionActivation: false, sourceReviewRef, referenceSuiteRef, priorEvidence: structuredClone(baseManifest.extensions['steimer.candidate']), scope: '20 unveränderte AP19C2-Bundesregeln mit 24 Anbindungen und vier individuelle KVG/OKP-Regeln mit vier BE-Anbindungen. Alle Sozialfreigaben Kandidat. Keine weiteren Kantone.' } }
  };
  files.set('manifest.json', encode(manifest));
  const verification = {
    workPackage: 'AP19C3', preparedOn: '2026-09-28', candidateReleaseId, candidatePath: candidateRelativePath,
    manifestSha256: digest(files.get('manifest.json')), baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)),
    counts: { preservedRules: 20, newKvgRules: 4, federalRules: 24, preservedBindings: 24, newKvgBindings: 4, cantonalBindings: 28, releaseEligibility: 28 },
    preservedRulesDeepEqual: true, preservedBindingsDeepEqual: true, productionActivation: false, integrationApproved: false,
    temporalContractEvidence: { path: temporalRelativePath, sha256: digest(read(temporalRelativePath)) }, sourceReviewRef, referenceSuiteRef,
    unchangedArtifacts: descriptors.filter(item => item.role !== 'socialProcedureCatalog').map(item => ({ path: item.path, sha256: item.sha256 })),
    changedCandidateArtifacts: ['manifest.json', 'social-procedures/ch-social-procedures.json']
  };
  return { files, verification, catalog, manifest };
}

export function persistAP19C3Candidate(prepared, target = join(root, candidateRelativePath), evidenceTarget = join(root, 'outputs/ap19c3-2026-09-28/build-verification.json')) {
  const writes = [...prepared.files].map(([path, bytes]) => [join(target, path), bytes]);
  writes.push([evidenceTarget, encode(prepared.verification)]);
  for (const [path, bytes] of writes) if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), `Refusing to overwrite differing candidate file: ${path}`);
  for (const [path, bytes] of writes) if (!existsSync(path)) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); }
  for (const [path, bytes] of writes) assert.ok(readFileSync(path).equals(bytes), `Readback differs: ${path}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = prepareAP19C3Candidate();
  persistAP19C3Candidate(prepared);
  console.log(JSON.stringify(prepared.verification, null, 2));
}
