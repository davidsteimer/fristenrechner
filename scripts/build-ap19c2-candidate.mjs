// SPDX-License-Identifier: AGPL-3.0-only
// Node 22: node --import tsx scripts/build-ap19c2-candidate.mjs
// Append-only candidate derivation. No data promotion, human approval or publication.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const candidateRelativePath = 'data/candidates/2026-09-28-ap19c2';
export const candidateReleaseId = '2026-09-28-ap19c2-candidate.1';
const baseRelativePath = 'data/candidates/2026-09-25-ap19c1';
const reviewRelativePath = 'outputs/ap19c2-2026-09-28/sources/source-review.json';
const temporalRelativePath = 'docs/fachrecht/zeitliche-bindung-ap19c2.md';
const referencesRelativePath = 'tests/golden/candidates/ap19b-social-deadlines.json';
const coverage = { from: '2026-01-01', to: '2027-12-31' };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(join(root, path));
const json = path => JSON.parse(read(path).toString('utf8'));
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ref = (sourceId, locator) => ({ sourceId, locator });
const fact = (factKey, ...allowedValues) => ({ factKey, allowedValues });
const uniqueRefs = refs => [...new Map(refs.map(item => [`${item.sourceId}|${item.locator}`, item])).values()];
const protectedInputs = new Map([
  [`${baseRelativePath}/manifest.json`, 'eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524'],
  ['docs/architektur/sozialversicherungsvertrag-ap19b.md', '0a10fab77735e8da31769f954b9a80178b081adda5cdb5ef3ed7b765581b0493'],
  ['docs/fachrecht/quellenabgleich-ap19b.md', 'e234dfaf76ae38b1e02f5562e738d94ae33738f6429c8130e785f0adb3141141'],
  [referencesRelativePath, 'da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8']
]);

export function prepareAP19C2Candidate() {
  for (const [path, expected] of protectedInputs) assert.equal(digest(read(path)), expected, `Changed approved input: ${path}`);
  const baseManifest = json(`${baseRelativePath}/manifest.json`);
  const sourceReview = json(reviewRelativePath);
  assert.equal(digest(read(reviewRelativePath)), '33d2fe1c6f6e1d54a97f8a9a54c97ce4a58aea56d0158a029ffa2a5d0f43abc3', 'Changed AP19C2 source evidence');
  assert.equal(sourceReview.reviewId, 'AP19C2-SOURCE-REVIEW-20260928');
  assert.equal(sourceReview.checkedOn, '2026-09-28');
  assert.equal(sourceReview.humanApproval, false, 'Source evidence is not integration approval');
  assert.deepEqual(sourceReview.scope.sourceCoverage, coverage);
  assert.equal(sourceReview.officialAmendmentReconstruction.method, 'official-amendment-reconstruction');
  assert.equal(sourceReview.officialAmendmentReconstruction.noClaimOfOfficialConsolidatedFebruaryText, true);
  assert.equal(sourceReview.officialAmendmentReconstruction.reconstructedThrough, coverage.to);
  for (const sourceId of ['SRC-AP17C-ATSG-20240101', 'SRC-AP19C2-AVIG-20260101', 'SRC-AP19C2-AVIV-20260101', 'SRC-AP19C2-AVIV-20260801', 'SRC-AP19C2-AVIV-20270101', 'SRC-AP19C2-AVIV-AS-2025-814', 'SRC-AP19C2-AVIV-AS-2026-258', 'SRC-AP19C2-AMG-BE-ART35', 'SRC-AP19C-GSOG-BE', 'SRC-AP17C-FRG-BE-20210401']) {
    assert.ok(sourceReview.checks.some(check => check.sourceRef === sourceId && check.result === 'no-relevant-change-detected'), `Missing fresh source evidence: ${sourceId}`);
  }
  assert.ok(sourceReview.checks.some(check => check.sourceRef === 'SRC-AP19C2-AVIV-FUTURE-INDEX-20260928' && check.result === 'three-known-avig-regulation-impacts-no-new-relevant-impact'), 'Missing bounded Option-B future index evidence');
  const files = new Map();
  for (const descriptor of baseManifest.artifacts) {
    const bytes = read(`${baseRelativePath}/${descriptor.path}`);
    assert.equal(digest(bytes), descriptor.sha256, `Changed C1 artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    files.set(descriptor.path, bytes);
  }
  const original = json(`${baseRelativePath}/social-procedures/ch-social-procedures.json`);
  const catalog = structuredClone(original);
  const atsg = locator => ref('SRC-AP17C-ATSG-20240101', locator);
  const avig = locator => ref('SRC-AP19C2-AVIG-20260101', locator);
  const aviv = locator => ref('SRC-AP19C2-AVIV-20260101', locator);
  const amg = ref('SRC-AP19C2-AMG-BE-ART35', 'Art. 35 Abs. 1, 2 und 4, nur individuelle ALE. Kantonale AMM nach Abs. 3 nicht erfasst');
  const gsog = ref('SRC-AP19C-GSOG-BE', 'Art. 54, Sozialversicherungsrechtliche Abteilung des Verwaltungsgerichts');
  const frg = ref('SRC-AP17C-FRG-BE-20210401', 'Art. 2, nur bei geklärten Anknüpfungen nach Art. 38 Abs. 3 ATSG');
  const additionalSources = [
    ['SRC-AP19C2-AVIG-20260101', 'AVIG, Konsolidierung 1. Januar 2026', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/cc/1982/2184_2184_2184/20260101/de', '2026-01-01'],
    ['SRC-AP19C2-AVIV-20260101', 'AVIV, Konsolidierung 1. Januar 2026. Artikelbezogener Fassungsnachweis bis Ende 2027 separat gebunden', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20260101/de', '2026-01-01'],
    ['SRC-AP19C2-AVIV-20260801', 'AVIV, Fassungsvergleich 1. August 2026', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20260801/de', '2026-08-01'],
    ['SRC-AP19C2-AVIV-20270101', 'AVIV, Fassungsvergleich 1. Januar 2027', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20270101/de', '2027-01-01'],
    ['SRC-AP19C2-AVIV-AS-2025-814', 'AS 2025 814, Originaländerungsrecht als Teil des Option-B-Nachweises', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/oc/2025/814/de', '2025-11-26'],
    ['SRC-AP19C2-AVIV-AS-2026-258', 'AS 2026 258, Originaländerungsrecht als Teil des Option-B-Nachweises', 'Schweizerische Eidgenossenschaft', 'https://www.fedlex.admin.ch/eli/oc/2026/258/de', '2026-05-27'],
    ['SRC-AP19C2-AMG-BE-ART35', 'AMG Bern, Artikel 35. Fassungsvergleich Februar 2022 und September 2026', 'Kanton Bern', 'https://www.belex.sites.be.ch/app/de/texts_of_law/836.11', null]
  ].map(([sourceId, title, authority, url, documentVersionDate]) => ({ sourceId, sourceType: sourceId.includes('-AVIV-') ? 'ordinance' : 'statute', title, authority, url, documentVersionDate, reviewedOn: '2026-09-28', reviewStatus: 'verified' }));
  additionalSources.push({ sourceId: 'SRC-AP19C2-AVIV-FUTURE-INDEX-20260928', sourceType: 'officialDossier', title: 'Amtlicher Zukunftsänderungsindex für AVIV, AVIG und ATSG, Abruf 28. September 2026', authority: 'Schweizerische Eidgenossenschaft', url: 'https://fedlex.data.admin.ch/sparqlendpoint', documentVersionDate: null, reviewedOn: '2026-09-28', reviewStatus: 'verified' });
  catalog.sources.push(...additionalSources);
  const temporal = (sourceRefs, jurisdictionRefs = []) => ({
    legalValidity: { ...coverage }, caseCoverage: { ...coverage }, sourceCoverage: { ...coverage },
    normBindings: sourceRefs.map(source => ({ ...source, temporalSelector: jurisdictionRefs.some(item => item.sourceId === source.sourceId && item.locator === source.locator) ? 'jurisdictionReferenceDate' : 'legalTriggerDate', applicableFrom: coverage.from, applicableTo: coverage.to, verification: 'verified' })),
    sourceRefs
  });
  const actions = [
    ['OBJ', 'objection', 'administration', 'initial-benefit-disposition', 'Einsprache gegen Leistungsverfügung', 'Opposition à une décision de prestations', atsg('Art. 52 Abs. 1')],
    ['APP', 'appeal', 'cantonal-insurance-court', 'objection-decision', 'Beschwerde gegen Einspracheentscheid', 'Recours contre une décision sur opposition', atsg('Art. 56 und 60, örtliche Zuständigkeit gesondert nach AVIV Art. 128')],
    ['ADM', 'ordered-administrative-days', 'administration', 'authority-day-order', 'Angeordnete Tagesfrist im Verwaltungsverfahren', 'Délai fixé en jours dans la procédure administrative', atsg('Art. 38 bis 40, konkret angeordnete prozessuale Tagesfrist')],
    ['CORRECTION', 'complaint-correction', 'cantonal-insurance-court', 'court-correction-day-order', 'Nachfrist zur Verbesserung der Beschwerde', 'Délai supplémentaire pour régulariser le recours', atsg('Art. 60 Abs. 2 und Art. 61 Bst. b')]
  ];
  for (const [suffix, action, stage, triggerKind, de, fr, actionRef] of actions) {
    const federalRefs = [
      avig('Art. 1, nur individuelle Arbeitslosenentschädigung im erfassten ATSG-Verfahren'),
      atsg('Art. 2, Art. 38 Abs. 1 bis 4, Art. 39 und 40. Art. 41 nur Kontext, keine Wiederherstellungsprüfung'), actionRef
    ];
    if (suffix === 'CORRECTION') federalRefs.push(ref('JUD-AP17C-BGER-8C-767-2008-20090112', 'E. 4.3.2, nur qualifizierte Nachfrist zur Beschwerdeverbesserung'));
    const rule = {
      ruleId: `CH-SOC-AVIG-ALE-${suffix}`, revision: 1, status: 'candidate', labels: { de: `AVIG · ALE · ${de}`, fr: `LACI · IC · ${fr}` },
      law: 'avig', matter: 'alv-individual-unemployment-benefits', action, stage, triggerKind, notificationChannels: ['individual-service'],
      calculation: { type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded', ...(['OBJ', 'APP'].includes(suffix) ? { duration: { value: 30, unit: 'day' } } : { durationInputId: 'deadlineDays' }) },
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay',
      ...temporal(federalRefs)
    };
    catalog.federalRules.push(rule);
    const court = stage === 'cantonal-insurance-court';
    for (const origin of ['FUND', 'OFFICE']) {
      const fund = origin === 'FUND';
      const jurisdictionRef = fund
        ? aviv(suffix === 'ADM' ? 'Art. 119 Abs. 1 Bst. a, laufende Zuständigkeit vor der Verfügung als eigener Fallbefund' : 'Art. 119 Abs. 1 Bst. a und Abs. 2, Kontrollkanton im Zeitpunkt der ursprünglichen Verfügung')
        : avig('Art. 100 Abs. 2, fachlich zuständige kantonale Amtsstelle oder rechtmässig beauftragte Stelle und Einspracheinstanz geklärt');
      const courtRef = aviv(fund ? 'Art. 128 Abs. 1 in Verbindung mit Art. 119, besondere örtliche Gerichtszuständigkeit bei Kassenverfügung' : 'Art. 128 Abs. 2, Gericht desselben Kantons bei Verfügung einer kantonalen Amtsstelle');
      const routeRefs = uniqueRefs([jurisdictionRef, ...(court ? [courtRef, gsog] : []), ...(!fund ? [amg] : [])]);
      const contextRouteId = court
        ? `be-avig-court-article128-${fund ? 'fund' : 'office'}`
        : fund ? suffix === 'ADM' ? 'be-avig-ale-current-control-canton' : 'be-avig-ale-article119-control-canton' : 'be-avig-cantonal-office';
      const route = {
        contextRouteId, kind: 'legal-jurisdiction',
        requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', fund ? 'unemploymentFund' : 'cantonalEmploymentOffice'), fact(fund ? 'avigControlCanton' : 'avigOfficeCanton', 'BE'), ...(court ? [fact('courtCanton', 'BE')] : []), fact('jurisdictionSpecialCase', 'ordinary')],
        sourceRefs: routeRefs
      };
      const bindingRefs = uniqueRefs([frg, ...routeRefs]);
      catalog.cantonalBindings.push({
        bindingId: `BE-SOC-AVIG-ALE-${suffix}-${origin}`, revision: 1, status: 'candidate',
        labels: { de: `Bern · ${rule.labels.de} · ${fund ? 'Kassenpfad' : 'Amtsstellenpfad'}`, fr: `Berne · ${rule.labels.fr} · ${fund ? 'voie caisse' : 'voie autorité cantonale'}` },
        ruleId: rule.ruleId, ruleRevision: rule.revision, procedureContextCanton: 'BE', entryProfileId: 'vrpg-be',
        contextRoutes: [route], calendarBindings: structuredClone(original.cantonalBindings[0].calendarBindings),
        supplementaryLawRefs: [frg, ...(!fund ? [amg] : []), ...(court ? [gsog] : [])],
        ...temporal(bindingRefs, fund ? [jurisdictionRef, ...(court ? [courtRef] : [])] : [])
      });
    }
  }
  const exclusions = [
    ['AVIG-KAE', 'short-time-work-compensation', 'Kurzarbeitsentschädigung nicht erfasst', 'Indemnité en cas de réduction de l’horaire de travail non couverte', avig('Art. 31 ff., ausserhalb der individuellen ALE-Tranche')],
    ['AVIG-SWE', 'bad-weather-compensation', 'Schlechtwetterentschädigung nicht erfasst', 'Indemnité en cas d’intempéries non couverte', avig('Art. 42 ff., ausserhalb der individuellen ALE-Tranche')],
    ['AVIG-IE', 'insolvency-compensation', 'Insolvenzentschädigung nicht erfasst', 'Indemnité en cas d’insolvabilité non couverte', avig('Art. 51 ff., AVIV Art. 77 ist kein positiver ALE-Pfad')],
    ['AVIG-JOBSEARCH', 'job-search-evidence', 'Nachweis der persönlichen Arbeitsbemühungen nicht erfasst', 'Preuve des recherches personnelles d’emploi non couverte', aviv('Art. 26 Abs. 2, keine allgemeine ATSG-Tagesfrist')],
    ['AVIG-FEDERAL', 'federal-instance', 'Bundesinstanz nach Artikel 101 AVIG nicht erfasst', 'Instance fédérale selon l’article 101 LACI non couverte', avig('Art. 101, kein Berner Gerichtsweg')],
    ['AVIG-COURT-OTHER', 'alv-individual-unemployment-benefits', 'Andere gerichtliche Frist nicht modelliert', 'Autre délai judiciaire non modélisé', atsg('Art. 61, keine pauschale Gleichstellung sämtlicher gerichtlicher Fristen')]
  ];
  catalog.excludedPaths.push(...exclusions.map(([exclusionId, matter, de, fr, source]) => ({ exclusionId, law: 'avig', matter, action: 'other', reasonKind: 'unsupported-procedure', reasonKey: 'unsupported-procedure', labels: { de, fr }, sourceRefs: [source] })));
  const sourceReviewRef = { reviewId: sourceReview.reviewId, sha256: digest(read(reviewRelativePath)) };
  const referenceSuiteRef = { suiteId: 'AP19B-SOCIAL-REFERENCES-1', sha256: digest(read(referencesRelativePath)) };
  const componentRefs = baseManifest.artifacts.filter(item => ['calendar', 'holidayCatalog'].includes(item.role)).map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 }));
  // Prior eligibility provenance is retained. Only its containing release identity changes.
  catalog.releaseEligibility = catalog.releaseEligibility.map(item => ({ ...item, releaseId: candidateReleaseId }));
  for (const binding of catalog.cantonalBindings.filter(item => item.ruleId.startsWith('CH-SOC-AVIG-ALE-'))) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId);
    catalog.releaseEligibility.push({
      eligibilityId: `AP19C2-${binding.bindingId}`, releaseId: candidateReleaseId, status: 'candidate',
      ruleRef: { ruleId: rule.ruleId, revision: rule.revision, sha256: socialObjectSha256(rule) },
      bindingRef: { bindingId: binding.bindingId, revision: binding.revision, sha256: socialObjectSha256(binding) },
      contextRouteIds: binding.contextRoutes.map(item => item.contextRouteId), calendarBindingIds: binding.calendarBindings.map(item => item.calendarBindingId),
      componentRefs: structuredClone(componentRefs), sourceReviewRef: { ...sourceReviewRef }, referenceSuiteRef: { ...referenceSuiteRef },
      caseCoverage: { ...coverage }, calculationCoverage: { ...coverage }, approval: null
    });
  }
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · AP19C2-Kandidat', fr: 'Procédures nationales des assurances sociales · candidat AP19C2' };
  catalog.review = { reviewedOn: '2026-09-28', status: 'candidate', reviewedBy: 'Codex', basis: 'Unveränderte 16 AP19C1-Fachpfade und vier neue AVIG-ALE-Regeln mit acht getrennten Berner Anbindungen. AP19B und Option B abgenommen, Quellenrefresh separat gebunden. Keine AP19C2-Integrations-, Release- oder Betriebsfreigabe.' };
  assert.deepEqual(catalog.federalRules.slice(0, 16), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 16), original.cantonalBindings);
  assert.equal(catalog.federalRules.length, 20);
  assert.equal(catalog.cantonalBindings.length, 24);
  assertSocialProcedureCatalog(catalog);
  files.set('social-procedures/ch-social-procedures.json', encode(catalog));
  const descriptors = structuredClone(baseManifest.artifacts);
  for (const descriptor of descriptors) { descriptor.byteLength = files.get(descriptor.path).length; descriptor.sha256 = digest(files.get(descriptor.path)); }
  const manifest = {
    ...baseManifest, releaseId: candidateReleaseId, createdOn: '2026-09-28',
    sourceSummary: { ...baseManifest.sourceSummary, latestReviewedOn: '2026-09-28', sourceIds: [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort() },
    artifacts: descriptors,
    extensions: { 'steimer.candidate': { workPackage: 'AP19C2', baseReleaseId: baseManifest.releaseId, contractDecision: 'DEC-2026-025', approvalRequired: true, productionActivation: false, sourceReviewRef, referenceSuiteRef, priorEvidence: structuredClone(baseManifest.extensions['steimer.candidate']), scope: '16 unveränderte AP19C1-Fachpfade und vier AVIG-ALE-Regeln mit acht getrennten BE-Anbindungen. Alle Sozialfreigaben Kandidat. Kein KVG, keine weiteren Kantone.' } }
  };
  files.set('manifest.json', encode(manifest));
  const verification = {
    workPackage: 'AP19C2', preparedOn: '2026-09-28', candidateReleaseId, candidatePath: candidateRelativePath,
    manifestSha256: digest(files.get('manifest.json')), baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)),
    counts: { preservedRules: 16, newAvigRules: 4, federalRules: 20, preservedBindings: 16, newAvigBindings: 8, cantonalBindings: 24, releaseEligibility: 24 },
    preservedRulesDeepEqual: true, preservedBindingsDeepEqual: true, productionActivation: false, integrationApproved: false,
    temporalContractEvidence: { path: temporalRelativePath, sha256: digest(read(temporalRelativePath)) }, sourceReviewRef, referenceSuiteRef,
    unchangedArtifacts: descriptors.filter(item => item.role !== 'socialProcedureCatalog').map(item => ({ path: item.path, sha256: item.sha256 })),
    changedCandidateArtifacts: ['manifest.json', 'social-procedures/ch-social-procedures.json']
  };
  return { files, verification, catalog, manifest };
}

export function persistAP19C2Candidate(prepared, target = join(root, candidateRelativePath), evidenceTarget = join(root, 'outputs/ap19c2-2026-09-28/build-verification.json')) {
  const writes = [...prepared.files].map(([path, bytes]) => [join(target, path), bytes]);
  writes.push([evidenceTarget, encode(prepared.verification)]);
  for (const [path, bytes] of writes) if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), `Refusing to overwrite differing candidate file: ${path}`);
  for (const [path, bytes] of writes) if (!existsSync(path)) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); }
  for (const [path, bytes] of writes) assert.ok(readFileSync(path).equals(bytes), `Readback differs: ${path}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = prepareAP19C2Candidate();
  persistAP19C2Candidate(prepared);
  console.log(JSON.stringify(prepared.verification, null, 2));
}
