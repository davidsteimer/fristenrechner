// SPDX-License-Identifier: AGPL-3.0-only
// Append-only local candidate, never data promotion or release approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const candidateRelativePath = 'data/candidates/2026-09-30-ap20c1';
export const candidateReleaseId = '2026-09-30-ap20c1-candidate.1';
const baseRelativePath = 'data/releases/2026-09-28-mvp-05-approved.1';
const evidencePath = 'outputs/ap20b-2026-09-30/pruefprotokoll.json';
const sourceControlPath = 'outputs/ap20c1-2026-09-30/quellenkontrolle.json';
const datesPath = 'tests/golden/candidates/ap20b-social-dates.json';
const contractPath = 'tests/golden/candidates/ap20b-social-contract.json';
const decisionPath = 'docs/entscheidungen/DEC-2026-026-beschluss.md';
const coverage = { from: '2026-01-01', to: '2027-12-31' };
const schema = name => `https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/${name}.schema.json`;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(join(root, path));
const json = path => JSON.parse(read(path).toString('utf8'));
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const ref = (sourceId, locator) => ({ sourceId, locator });
const fact = (factKey, value) => ({ factKey, allowedValues: [value] });

export function prepareAP20C1Candidate() {
  assert.equal(digest(read(`${baseRelativePath}/manifest.json`)), '3aa09c80c93ef56d472748c4a5496d439537272d96491497b2c678e3c7e20715');
  assert.equal(digest(read(evidencePath)), '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d');
  assert.equal(digest(read(decisionPath)), '16873c28621edcac92e490814c5196fbbfb34900d8e10d4c767cda8a5359ef7a');
  const evidence = json(evidencePath);
  for (const entry of evidence.evidence) assert.equal(digest(read(entry.path)), entry.sha256, `Changed AP20B input: ${entry.path}`);
  const contract = json(contractPath);
  assert.deepEqual(contract.referenceWindow, coverage);
  const sourceControl = json(sourceControlPath);
  assert.equal(digest(read(sourceControlPath)), '6209ff32d00910b36f97dfb5c35c147dc19ec908500b17c75736bd3960da990c', 'Changed integration source evidence');
  assert.equal(sourceControl.checkedOn, '2026-09-30');
  const baseManifest = json(`${baseRelativePath}/manifest.json`);
  const files = new Map();
  for (const descriptor of baseManifest.artifacts) {
    const bytes = read(`${baseRelativePath}/${descriptor.path}`);
    assert.equal(digest(bytes), descriptor.sha256, `Changed MVP 0.5 artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    files.set(descriptor.path, bytes);
  }
  const original = json(`${baseRelativePath}/social-procedures/ch-social-procedures.json`);
  const catalog = structuredClone(original);
  catalog.$schema = schema('social-procedure-catalog-v2');
  catalog.formatVersion = '2.0.0';
  const atsg = locator => ref('SRC-AP17C-ATSG-20240101', locator);
  const eog = locator => ref('SRC-AP20C1-EOG-20250128', locator);
  const eov = locator => ref('SRC-AP20C1-EOV-20250101', locator);
  const gsog = ref('SRC-AP20C1-GSOG-BE-20260101', 'Art. 54 Abs. 1 bis 5, Artikeltext über 1. Mai 2026 unverändert. Zuständige Abteilung des Verwaltungsgerichts, Sprache ohne Fristwirkung');
  const vrpg = ref('SRC-AP20C1-VRPG-BE-20230801', 'Art. 1 Abs. 2, Art. 32 und 83, Artikeltext über 1. September 2026 unverändert. Ergänzendes kantonales Recht, keine eigenständige ATSG-Frist');
  const frg = ref('SRC-AP17C-FRG-BE-20210401', 'Art. 2, nur separat qualifizierte Partei-/Vertretungsanknüpfung nach Art. 38 Abs. 3 ATSG');
  for (const [law, type, base, versions] of [
    ['EOG', 'statute', '1952/1021_1046_1050', ['2025-01-28', '2026-06-01', '2027-07-01']],
    ['EOV', 'ordinance', '2005/187', ['2025-01-01', '2026-06-01', '2027-07-01']]
  ]) for (const version of versions) catalog.sources.push({
    sourceId: `SRC-AP20C1-${law}-${version.replaceAll('-', '')}`, sourceType: type,
    title: `${law}, Originalfassung ${version}. Unveränderte tragende Artikel durch AP20B-Originalkette und Fassungsvergleich nachgewiesen`,
    authority: 'Schweizerische Eidgenossenschaft', url: `https://www.fedlex.admin.ch/eli/cc/${base}/${version.replaceAll('-', '')}/de`,
    documentVersionDate: version, reviewedOn: '2026-09-30', reviewStatus: 'verified'
  });
  for (const [id, title, version, url] of [
    ['GSOG-BE-20260101', 'GSOG Bern, Art. 54, Original vor der unveränderten Folgekonsolidierung', '2026-01-01', 'https://www.belex.sites.be.ch/api/de/versions/3144/pdf_file'],
    ['GSOG-BE-20260501', 'GSOG Bern, Art. 54, bestätigte Folgekonsolidierung', '2026-05-01', 'https://www.belex.sites.be.ch/api/de/versions/3367/pdf_file'],
    ['VRPG-BE-20230801', 'VRPG Bern, Art. 1, 32 und 83, Original vor der unveränderten Folgekonsolidierung', '2023-08-01', 'https://www.belex.sites.be.ch/api/de/versions/2855/pdf_file'],
    ['VRPG-BE-20260901', 'VRPG Bern, Art. 1, 32 und 83, bestätigte Folgekonsolidierung', '2026-09-01', 'https://www.belex.sites.be.ch/api/de/versions/3424/pdf_file']
  ]) catalog.sources.push({ sourceId: `SRC-AP20C1-${id}`, sourceType: 'statute', title, authority: 'Kanton Bern', url, documentVersionDate: version, reviewedOn: '2026-09-30', reviewStatus: 'verified' });

  // These are demonstrated applicability bounds, not legislative commencement
  // or repeal dates. The original/follow-up chain is bound in manifest evidence.
  const temporal = (sourceRefs, jurisdictionRefs = []) => ({
    legalValidity: { ...coverage }, caseCoverage: { ...coverage }, sourceCoverage: { ...coverage },
    normBindings: sourceRefs.map(source => ({ ...source,
      temporalSelector: jurisdictionRefs.some(item => item.sourceId === source.sourceId && item.locator === source.locator) ? 'jurisdictionReferenceDate' : 'legalTriggerDate',
      applicableFrom: coverage.from, applicableTo: coverage.to, verification: 'verified'
    })), sourceRefs
  });
  const actions = [
    ['OBJ', 'objection', 'administration', 'initial-benefit-disposition', 'Einsprache gegen Leistungsverfügung', 'Opposition à une décision de prestations', atsg('Art. 49, 51 und 52 Abs. 1, formelle Leistungsverfügung erforderlich')],
    ['APP', 'appeal', 'cantonal-insurance-court', 'objection-decision', 'Beschwerde gegen Einspracheentscheid', 'Recours contre une décision sur opposition', atsg('Art. 56 Abs. 1 und 60, ordentliche Beschwerde gegen Einspracheentscheid')],
    ['ADM', 'ordered-administrative-days', 'administration', 'authority-day-order', 'Angeordnete Tagesfrist im Verwaltungsverfahren', 'Délai fixé en jours dans la procédure administrative', atsg('Art. 38 bis 40, qualifizierte prozessuale Tagesanordnung, keine materielle Anspruchsfrist')],
    ['CORRECTION', 'complaint-correction', 'cantonal-insurance-court', 'court-correction-day-order', 'Nachfrist zur Verbesserung der Beschwerde', 'Délai supplémentaire pour régulariser le recours', atsg('Art. 60 Abs. 2 und Art. 61 Bst. b, nur formelle Beschwerdeverbesserung')]
  ];
  for (const [suffix, action, stage, triggerKind, de, fr, actionRef] of actions) {
    const sources = [
      eog('Art. 1, 17 und 18, nur individuelle bundesrechtliche EO-Leistungen und qualifizierte formelle Eröffnung. Tragende Artikel über 1. Juni 2026 und 1. Juli 2027 unverändert'),
      eov('Art. 19, 34, 35i und 35q, zuständige Kasse für den konkreten Leistungsfall eigenständig qualifiziert. Keine automatisierte Ableitung aus Leistungsdaten'),
      atsg('Art. 2, 38 bis 40, Tagesfrist mit Stillstand und eigenständiger Partei-/Vertretungsfeiertagsanknüpfung'), actionRef
    ];
    if (suffix === 'CORRECTION') sources.push(ref('JUD-AP17C-BGER-8C-767-2008-20090112', 'E. 4.3.2, nur formelle Beschwerdeverbesserung. Wiederverwendeter allgemeiner ATSG-Vorbefund, kein EOG-spezifischer Entscheid'));
    const rule = {
      ruleId: `CH-SOC-EOG-${suffix}`, revision: 1, status: 'candidate', labels: { de: `EOG · ${de}`, fr: `LAPG · ${fr}` },
      law: 'eog', matter: 'eog-federal-individual-benefits', action, stage, triggerKind, notificationChannels: ['individual-service'],
      calculation: { type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded', ...(['OBJ', 'APP'].includes(suffix) ? { duration: { value: 30, unit: 'day' } } : { durationInputId: 'deadlineDays' }) },
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay', ...temporal(sources)
    };
    catalog.federalRules.push(rule);
    for (const definition of contract.routes.filter(route => route.law === 'EOG' && route.actions.includes(suffix))) {
      const court = stage === 'cantonal-insurance-court';
      const jurisdiction = definition.id === 'EOG-CANTONAL'
        ? eog('Art. 24 Abs. 1, Gerichtskanton der im angefochtenen Fall verfügenden kantonalen Ausgleichskasse. Kein Wohnsitzerfordernis')
        : atsg('Art. 57 und 58, ordentlicher Inlandsfall nach nichtkantonaler Kasse. Wohnsitz der versicherten Person bei Beschwerdeerhebung');
      const routeRefs = court ? [jurisdiction, gsog] : [
        eog('Art. 17 und 18 sowie EOV-Zuständigkeit separat qualifiziert. BE-Wohnsitz am legalTriggerDate ist ausschliesslich Produktgrenze. Kein Kassenkanton- oder Kassensitzfilter')
      ];
      const route = {
        contextRouteId: `be-soc-${definition.id.toLowerCase()}`, kind: definition.kind,
        requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', 'compensationOffice'), ...Object.entries(definition.facts).map(([key, value]) => fact(key, value)), fact('jurisdictionSpecialCase', 'ordinary')], sourceRefs: routeRefs
      };
      const bindingRefs = [frg, ...routeRefs, ...(court ? [vrpg] : [])];
      catalog.cantonalBindings.push({
        bindingId: `BE-SOC-${definition.id}-${suffix}`, revision: 1, status: 'candidate',
        labels: { de: `Bern · ${rule.labels.de}${court ? definition.id === 'EOG-CANTONAL' ? ' · kantonale Kasse' : ' · nichtkantonale Kasse' : ''}`, fr: `Berne · ${rule.labels.fr}${court ? definition.id === 'EOG-CANTONAL' ? ' · caisse cantonale' : ' · caisse non cantonale' : ''}` },
        ruleId: rule.ruleId, ruleRevision: 1, procedureContextCanton: 'BE', entryProfileId: 'vrpg-be', contextRoutes: [route],
        calendarBindings: structuredClone(original.cantonalBindings[0].calendarBindings), supplementaryLawRefs: [frg, ...(court ? [gsog, vrpg] : [])], ...temporal(bindingRefs, court ? [jurisdiction, gsog] : [])
      });
    }
  }
  const exclusions = [
    ['EOG-INFORMAL', 'eog-informal-statement', 'unresolved-qualification', 'formal-disposition-required', 'Formlose EO-Abrechnung ist kein Einspracheauslöser', 'Un décompte APG informel ne déclenche pas le délai d’opposition', 'Art. 18 Abs. 2, formelle Verfügung erforderlich'],
    ['EOG-CANTONAL-SUPPLEMENT', 'eog-cantonal-supplement', 'product-scope', 'product-scope', 'Rein kantonale EO-Zusatzleistung nicht erfasst', 'Prestation complémentaire purement cantonale non couverte', 'Art. 16mbis, 16sbis und 16x ab Juli 2027 nicht als Bundesleistungsweg aktiviert'],
    ['EOG-EMPLOYER', 'eog-employer-dispute', 'product-scope', 'product-scope', 'Arbeitgeberstreit nicht erfasst', 'Litige avec un employeur non couvert', 'Art. 17 und 18, nur individuelle Leistungswege'],
    ['EOG-ORGAN-LIABILITY', 'eog-organ-liability', 'product-scope', 'product-scope', 'Organhaftungsstreit nicht erfasst', 'Litige en responsabilité des organes non couvert', 'Art. 1 und 17, ausserhalb des qualifizierten individuellen Leistungswegs'],
    ['EOG-SUPERVISION', 'eog-supervision', 'product-scope', 'product-scope', 'Aufsichtsverfahren nicht erfasst', 'Procédure de surveillance non couverte', 'Art. 17, kein individueller Leistungsweg'],
    ['EOG-FEDERAL', 'federal-instance', 'unsupported-procedure', 'unsupported-procedure', 'Bundesgerichtliche Verfahren nicht erfasst', 'Procédures devant les tribunaux fédéraux non couvertes', 'Art. 24, nur qualifizierte kantonale Inlandspfade'],
    ['EOG-COURT-OTHER', 'eog-other-court-order', 'unsupported-procedure', 'unsupported-procedure', 'Andere gerichtliche Frist nicht modelliert', 'Autre délai judiciaire non modélisé', 'Art. 1 in Verbindung mit Art. 61 ATSG, keine pauschale Übernahme richterlicher Fristen']
  ];
  catalog.excludedPaths.push(...exclusions.map(([exclusionId, matter, reasonKind, reasonKey, de, fr, locator]) => ({ exclusionId, law: 'eog', matter, action: 'other', reasonKind, reasonKey, labels: { de, fr }, sourceRefs: [exclusionId === 'EOG-CANTONAL-SUPPLEMENT' ? ref('SRC-AP20C1-EOG-20270701', locator) : eog(locator)] })));
  const sourceReviewRef = { reviewId: 'AP20C1-SOURCE-CONTROL-20260930', sha256: digest(read(sourceControlPath)) };
  const referenceSuiteRef = { suiteId: 'AP20B-SOCIAL-DATES-1', sha256: digest(read(datesPath)) };
  const componentRefs = baseManifest.artifacts.filter(item => ['calendar', 'holidayCatalog'].includes(item.role)).map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 }));
  // Preserve reviewed objects exactly, but never transplant an old approval to
  // a new release. Each eligibility is a new candidate with no human approval.
  catalog.releaseEligibility = catalog.cantonalBindings.map(binding => {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId && item.revision === binding.ruleRevision);
    const old = original.releaseEligibility.find(item => item.bindingRef.bindingId === binding.bindingId && item.bindingRef.revision === binding.revision);
    return {
      eligibilityId: `AP20C1-${binding.bindingId}`, releaseId: candidateReleaseId, status: 'candidate',
      ruleRef: { ruleId: rule.ruleId, revision: rule.revision, sha256: socialObjectSha256(rule) },
      bindingRef: { bindingId: binding.bindingId, revision: binding.revision, sha256: socialObjectSha256(binding) },
      contextRouteIds: binding.contextRoutes.map(route => route.contextRouteId), calendarBindingIds: binding.calendarBindings.map(calendar => calendar.calendarBindingId),
      componentRefs: structuredClone(componentRefs), sourceReviewRef: old ? structuredClone(old.sourceReviewRef) : { ...sourceReviewRef },
      referenceSuiteRef: old ? structuredClone(old.referenceSuiteRef) : { ...referenceSuiteRef },
      caseCoverage: old ? structuredClone(old.caseCoverage) : { ...coverage }, calculationCoverage: old ? structuredClone(old.calculationCoverage) : { ...coverage }, approval: null
    };
  });
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · AP20C1-Kandidat', fr: 'Procédures nationales des assurances sociales · candidat AP20C1' };
  catalog.review = { reviewedOn: '2026-09-30', status: 'candidate', reviewedBy: 'Codex', basis: '24 freigegebene MVP-0.5-Regeln und 28 Anbindungen objektidentisch erhalten. Vier neue EOG-Regeln und sechs BE-Anbindungen als Kandidat. AP20B und DEC-2026-026 abgenommen. Anwendungsuntergrenze 2026 ist kein behauptetes Inkrafttreten. Keine AP20C1-Integrations-, Quellenrelease-, Produkt- oder Betriebsfreigabe.' };
  assert.deepEqual(catalog.federalRules.slice(0, 24), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 28), original.cantonalBindings);
  assert.equal(catalog.federalRules.length, 28);
  assert.equal(catalog.cantonalBindings.length, 34);
  assertSocialProcedureCatalog(catalog);
  files.set('social-procedures/ch-social-procedures.json', encode(catalog));
  const descriptors = structuredClone(baseManifest.artifacts);
  for (const descriptor of descriptors) {
    if (descriptor.role === 'socialProcedureCatalog') descriptor.schemaId = catalog.$schema;
    descriptor.byteLength = files.get(descriptor.path).length;
    descriptor.sha256 = digest(files.get(descriptor.path));
  }
  const sourceEvidence = [...evidence.evidence.filter(item => /quellenabgleich-ap20b-bund|zeitliche-bindung-ap20b|federal-source-(indexes|originals|comparisons)|bern-source-review/.test(item.path)), { path: sourceControlPath, sha256: sourceReviewRef.sha256 }];
  const manifest = {
    ...baseManifest, $schema: schema('release-manifest-v6'), formatVersion: '6.0.0', releaseId: candidateReleaseId, releaseStatus: 'candidate', createdOn: '2026-09-30',
    compatibility: { ...baseManifest.compatibility, minimumConsumerFormatVersion: '6.0.0' },
    sourceSummary: { ...baseManifest.sourceSummary, latestReviewedOn: '2026-09-30', sourceIds: [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort() },
    artifacts: descriptors,
    extensions: { 'steimer.candidate': {
      workPackage: 'AP20C1', baseReleaseId: baseManifest.releaseId, baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)), contractDecision: 'DEC-2026-026',
      approvalRequired: true, productionActivation: false, sourceReviewRef, referenceSuiteRef,
      decisionEvidence: { path: decisionPath, sha256: digest(read(decisionPath)) }, sourceEvidence,
      scope: '28 nationale Regeln und 34 Berner Anbindungen. Nur vier EOG-Regeln und sechs BE-Anbindungen neu. Bestandsobjekte unverändert, sämtliche Freigabeverknüpfungen Kandidat. Keine weiteren Erlasse oder Kantone aktiviert.'
    } }
  };
  files.set('manifest.json', encode(manifest));
  const verification = {
    workPackage: 'AP20C1', preparedOn: '2026-09-30', candidateReleaseId, candidatePath: candidateRelativePath, manifestSha256: digest(files.get('manifest.json')),
    baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)),
    counts: { preservedRules: 24, newEogRules: 4, federalRules: 28, preservedBindings: 28, newEogBindings: 6, cantonalBindings: 34, candidateEligibility: 34 },
    preservedRules: original.federalRules.map(rule => ({ ruleId: rule.ruleId, revision: rule.revision, status: rule.status, sha256: socialObjectSha256(rule) })),
    preservedBindings: original.cantonalBindings.map(binding => ({ bindingId: binding.bindingId, revision: binding.revision, status: binding.status, sha256: socialObjectSha256(binding) })),
    preservedRulesDeepEqual: true, preservedBindingsDeepEqual: true, productionActivation: false, integrationApproved: false,
    sourceReviewRef, referenceSuiteRef, sourceEvidence,
    unchangedArtifacts: descriptors.filter(item => item.role !== 'socialProcedureCatalog').map(item => ({ path: item.path, sha256: item.sha256 })),
    changedCandidateArtifacts: ['manifest.json', 'social-procedures/ch-social-procedures.json']
  };
  return { files, verification, catalog, manifest };
}

export function persistAP20C1Candidate(prepared, target = join(root, candidateRelativePath), evidenceTarget = join(root, 'outputs/ap20c1-2026-09-30/build-verification.json')) {
  const writes = [...prepared.files].map(([path, bytes]) => [join(target, path), bytes]);
  writes.push([evidenceTarget, encode(prepared.verification)]);
  for (const [path, bytes] of writes) if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), `Refusing to overwrite differing candidate: ${path}`);
  for (const [path, bytes] of writes) if (!existsSync(path)) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); }
  for (const [path, bytes] of writes) assert.ok(readFileSync(path).equals(bytes), `Candidate readback differs: ${path}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = prepareAP20C1Candidate();
  persistAP20C1Candidate(prepared);
  console.log(JSON.stringify(prepared.verification, null, 2));
}
