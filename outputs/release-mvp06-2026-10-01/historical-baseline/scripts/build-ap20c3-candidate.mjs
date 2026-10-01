// SPDX-License-Identifier: AGPL-3.0-only
// Append-only local integration candidate. No promotion or operational approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const candidateRelativePath = 'data/candidates/2026-10-01-ap20c3';
export const candidateReleaseId = '2026-10-01-ap20c3-candidate.1';
const baseRelativePath = 'data/candidates/2026-10-01-ap20c2';
const evidencePath = 'outputs/ap20b-2026-09-30/pruefprotokoll.json';
const acceptancePath = 'docs/fachrecht/abnahme-ap20c2.md';
const sourceControlPath = 'outputs/ap20c3-2026-10-01/quellenkontrolle.json';
const datesPath = 'tests/golden/candidates/ap20b-social-dates.json';
const contractPath = 'tests/golden/candidates/ap20b-social-contract.json';
const decisionPath = 'docs/entscheidungen/DEC-2026-026-beschluss.md';
const coverage = { from: '2026-01-01', to: '2027-12-31' };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(join(root, path));
const json = path => JSON.parse(read(path).toString('utf8'));
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const ref = (sourceId, locator) => ({ sourceId, locator });
const fact = (factKey, value) => ({ factKey, allowedValues: [value] });

export function prepareAP20C3Candidate() {
  assert.equal(digest(read(`${baseRelativePath}/manifest.json`)), 'e7d1921d7a67adc60e49142fe549f1f6113cf73084f94fd1f0f057d3360cc520');
  assert.equal(digest(read(acceptancePath)), '864543a15afb57b205d9a183134a6eeb91bc19aeefd92bbcd9bdefaa2a1bc7b1');
  assert.equal(digest(read(evidencePath)), '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d');
  assert.equal(digest(read(decisionPath)), '16873c28621edcac92e490814c5196fbbfb34900d8e10d4c767cda8a5359ef7a');
  const evidence = json(evidencePath);
  for (const entry of evidence.evidence) assert.equal(digest(read(entry.path)), entry.sha256, `Changed frozen AP20B input: ${entry.path}`);
  const contract = json(contractPath);
  assert.deepEqual(contract.referenceWindow, coverage);
  assert.equal(digest(read(sourceControlPath)), 'b7cfc44bb809f66ff8bbb55e30580710e4716a63253d4125ed6874c55c2b518c', 'Changed integration source evidence');
  const sourceControl = json(sourceControlPath);
  assert.equal(sourceControl.checkedOn, '2026-10-01');
  assert.deepEqual(sourceControl.errors, []);
  assert.equal(sourceControl.noDeltaInCheckedScope, true);
  // Bind immutable C2 data and its acceptance, not hashes of runtime source
  // files that legitimately evolve during this explicitly authorised package.
  const baseManifest = json(`${baseRelativePath}/manifest.json`);
  const files = new Map();
  for (const descriptor of baseManifest.artifacts) {
    const bytes = read(`${baseRelativePath}/${descriptor.path}`);
    assert.equal(digest(bytes), descriptor.sha256, `Changed AP20C2 artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    files.set(descriptor.path, bytes);
  }
  const original = json(`${baseRelativePath}/social-procedures/ch-social-procedures.json`);
  const catalog = structuredClone(original);
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(baseManifest.formatVersion, '6.0.0');
  const atsg = locator => ref('SRC-AP17C-ATSG-20240101', locator);
  const mvg = locator => ref('SRC-AP20C3-MVG-20240101', locator);
  const mvv = locator => ref('SRC-AP20C3-MVV-20260101', locator);
  const uelg = locator => ref('SRC-AP20C3-UELG-20250101', locator);
  const uelv = locator => ref('SRC-AP20C3-UELV-20250101', locator);
  const elg = ref('SRC-AP20C3-ELG-20260101', 'Art. 21 Abs. 2, von den Kantonen bezeichnete EL-Durchführungsorgane. Absatz über 1. Januar 2027 unverändert. Keine Übernahme der Wohnsitznorm aus Abs. 1');
  const egelg = ref('SRC-AP20C3-EGELG-BE-20250101', 'Art. 8 und 9, AK Bern als kantonal bezeichnetes Durchführungsorgan. Keine Bindung der örtlichen Gerichtszuständigkeit an die Verwaltung');
  const egkumv = ref('SRC-AP20C3-EGKUMV-BE-20220101', 'Art. 39 und 40, über 1. September 2026 unveränderter ausgeschlossener MV-Schiedsgerichtsweg für Leistungserbringer');
  const gsog = ref('SRC-AP20C1-GSOG-BE-20260101', 'Art. 54 Abs. 1 bis 5, Artikeltext über 1. Mai 2026 unverändert. Zuständige Abteilung des Verwaltungsgerichts, Sprache ohne Fristwirkung');
  const vrpg = ref('SRC-AP20C1-VRPG-BE-20230801', 'Art. 1 Abs. 2, Art. 32 und 83, Artikeltext über 1. September 2026 unverändert. Ergänzendes kantonales Recht, keine eigenständige ATSG-Frist');
  const frg = ref('SRC-AP17C-FRG-BE-20210401', 'Art. 2, nur separat qualifizierte Partei-/Vertretungsanknüpfung nach Art. 38 Abs. 3 ATSG');
  for (const [law, type, base, versions] of [
    ['MVG', 'statute', '1993/3043_3043_3043', ['2024-01-01']],
    ['MVV', 'ordinance', '1993/3080_3080_3080', ['2026-01-01']],
    ['UELG', 'statute', '2021/373', ['2025-01-01']],
    ['UELV', 'ordinance', '2021/376', ['2025-01-01']],
    ['ELG', 'statute', '2007/804', ['2026-01-01', '2027-01-01']]
  ]) for (const version of versions) catalog.sources.push({
    sourceId: `SRC-AP20C3-${law}-${version.replaceAll('-', '')}`, sourceType: type,
    title: `${law}, Originalfassung ${version}. Tragende beziehungsweise abgrenzende Artikel durch AP20B und AP20C3-Quellenkontrolle nachgewiesen`,
    authority: 'Schweizerische Eidgenossenschaft', url: `https://www.fedlex.admin.ch/eli/cc/${base}/${version.replaceAll('-', '')}/de`,
    documentVersionDate: version, reviewedOn: '2026-10-01', reviewStatus: 'verified'
  });
  for (const [sourceId, title, version, url] of [
    ['SRC-AP20C3-EGELG-BE-20250101', 'EG ELG Bern, Art. 8 und 9, Durchführungsorgan für den qualifizierten ÜLG-Verwaltungsweg', '2025-01-01', 'https://www.belex.sites.be.ch/api/de/versions/3072/pdf_file'],
    ['SRC-AP20C3-EGKUMV-BE-20220101', 'EG KUMV Bern, Art. 39 und 40, ausgeschlossener MV-Schiedsgerichtsweg', '2022-01-01', 'https://www.belex.sites.be.ch/api/de/versions/2435/pdf_file'],
    ['SRC-AP20C3-EGKUMV-BE-20260901', 'EG KUMV Bern, unveränderte Art. 39 und 40 in der Folgekonsolidierung', '2026-09-01', 'https://www.belex.sites.be.ch/api/de/versions/3445/pdf_file']
  ]) catalog.sources.push({ sourceId, sourceType: 'statute', title, authority: 'Kanton Bern', url, documentVersionDate: version, reviewedOn: '2026-10-01', reviewStatus: 'verified' });

  // Demonstrated application bounds, not invented statutory commencement or
  // repeal. A following consolidation does not cut unchanged article coverage.
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
  const lawDefinitions = contract.laws.filter(item => ['MVG', 'UELG'].includes(item.law));
  for (const lawDefinition of lawDefinitions) for (const [suffix, action, stage, triggerKind, de, fr, actionRef] of actions) {
    const military = lawDefinition.law === 'MVG';
    const sources = [
      military ? mvg('Art. 1, nur individuelle Versichertenleistungen im ATSG-Verfahren. Keine Leistungserbringer-, Medizinalrechts- oder Tarifstreitigkeiten nach Art. 22 bis 27')
        : uelg('Art. 1, nur bundesrechtliche individuelle Überbrückungsleistungen. Keine materielle Geltendmachungsfrist oder behördliche Bearbeitungsfrist'),
      atsg('Art. 2, 38 bis 40, Tagesfrist mit Stillstand und eigenständiger Partei-/Vertretungsfeiertagsanknüpfung'), actionRef
    ];
    if (military && suffix === 'ADM') sources.push(mvv('Art. 32a, optionaler Vorbescheid ohne gesetzliche feste Einwandfrist. Nur konkret angeordnete und qualifizierte positive Tagesfrist'));
    if (military && suffix === 'APP') sources.push(mvg('Art. 104 seit 2007 und Art. 105 seit 2021 aufgehoben. Keine Wiederbelebung historischer Sonderfristen'));
    if (suffix === 'CORRECTION') sources.push(ref('JUD-AP17C-BGER-8C-767-2008-20090112', 'E. 4.3.2, nur formelle Beschwerdeverbesserung. Wiederverwendeter allgemeiner ATSG-Vorbefund, kein erlassspezifischer Entscheid'));
    const rule = {
      ruleId: `CH-SOC-${lawDefinition.law}-${suffix}`, revision: 1, status: 'candidate', labels: { de: `${military ? 'MVG' : 'ÜLG'} · ${de}`, fr: `${military ? 'LAM' : 'LPtra'} · ${fr}` },
      law: lawDefinition.law.toLowerCase(), matter: lawDefinition.matter, action, stage, triggerKind, notificationChannels: ['individual-service'],
      calculation: { type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded', ...(['OBJ', 'APP'].includes(suffix) ? { duration: { value: 30, unit: 'day' } } : { durationInputId: 'deadlineDays' }) },
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay', ...temporal(sources)
    };
    catalog.federalRules.push(rule);
    const definition = contract.routes.find(route => route.law === lawDefinition.law && route.actions.includes(suffix));
    assert.ok(definition);
    const court = stage === 'cantonal-insurance-court';
    const jurisdiction = atsg('Art. 57 und 58, ordentlicher Inlandsfall. Gerichtskanton und Wohnsitz der versicherten Person bei Beschwerdeerhebung eigenständig qualifiziert. Frühere Verwaltungszuständigkeit ist kein Ersatz');
    const routeRefs = court ? [jurisdiction, gsog] : military
      ? [mvg('Art. 1, fachlich zuständiger Militärversicherungsträger und individueller Leistungsfall separat qualifiziert. BE-Wohnsitz am legalTriggerDate ist ausschliesslich Produktgrenze, kein Suva-Sitzfilter')]
      : [uelg('Art. 19 Abs. 1, administrative Zuständigkeit für den angefochtenen Leistungsfall beziehungsweise die konkrete laufende Anordnung. Heutiger Wohnsitz oder frühere Auszahlung allein genügt nicht'), elg, egelg];
    const route = {
      contextRouteId: `be-soc-${definition.id.toLowerCase()}`, kind: definition.kind,
      requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', lawDefinition.origin), ...Object.entries(definition.facts).map(([key, value]) => fact(key, value)), fact('jurisdictionSpecialCase', 'ordinary')], sourceRefs: routeRefs
    };
    const bindingRefs = [frg, ...routeRefs, ...(court ? [vrpg] : [])];
    catalog.cantonalBindings.push({
      bindingId: `BE-SOC-${definition.id}-${suffix}`, revision: 1, status: 'candidate',
      labels: { de: `Bern · ${rule.labels.de}`, fr: `Berne · ${rule.labels.fr}` },
      ruleId: rule.ruleId, ruleRevision: 1, procedureContextCanton: 'BE', entryProfileId: 'vrpg-be', contextRoutes: [route],
      calendarBindings: structuredClone(original.cantonalBindings[0].calendarBindings), supplementaryLawRefs: [frg, ...(!military && !court ? [egelg] : []), ...(court ? [gsog, vrpg] : [])],
      ...temporal(bindingRefs, court ? [jurisdiction, gsog] : [])
    });
  }
  const exclusions = [
    ['MVG-MEDICAL-TARIFFS', 'mvg', 'mvg-medical-tariffs', 'statutory-exclusion', 'statutory-exclusion', 'Medizinalrechts- und Tarifstreitigkeiten nicht erfasst', 'Litiges de droit médical et tarifaire non couverts', [mvg('Art. 1 Abs. 2 und Art. 22 bis 27, gesetzliche Bereichsausnahme'), egkumv]],
    ['MVG-GENERIC-PRELIMINARY', 'mvg', 'mvg-generic-preliminary-notice', 'unsupported-procedure', 'unsupported-procedure', 'Keine feste Einwandfrist aus blossem MV-Vorbescheid', 'Aucun délai fixe d’objection déduit d’un simple préavis de l’assurance militaire', [mvv('Art. 32a, kein gesetzlich fester 30-Tage-Pfad. Nur konkret qualifizierte positive Tagesanordnung im ADM-Pfad')]],
    ['UELG-MATERIAL-CLAIM', 'uelg', 'uelg-material-claim-period', 'unsupported-procedure', 'unsupported-procedure', 'Materielle Geltendmachungsfrist nicht erfasst', 'Délai matériel pour faire valoir le droit non couvert', [uelg('Art. 18, 15 Monate sind keine prozessuale Tagesfrist')]],
    ['UELG-AUTHORITY-PROCESSING', 'uelg', 'uelg-authority-processing-period', 'unsupported-procedure', 'unsupported-procedure', 'Behördliche Bearbeitungsfrist nicht erfasst', 'Délai de traitement par l’organe d’exécution non couvert', [uelv('Art. 38, grundsätzlich 90 Tage für das Durchführungsorgan, keine Rechtsmittelfrist der Partei')]]
  ];
  for (const law of lawDefinitions) exclusions.push(
    [`${law.law}-FEDERAL`, law.law.toLowerCase(), 'federal-instance', 'unsupported-procedure', 'unsupported-procedure', 'Bundesgerichtliche Verfahren nicht erfasst', 'Procédures devant les tribunaux fédéraux non couvertes', [atsg('Art. 58, nur qualifizierte kantonale Inlandspfade')]],
    [`${law.law}-COURT-OTHER`, law.law.toLowerCase(), `${law.law.toLowerCase()}-other-court-order`, 'unsupported-procedure', 'unsupported-procedure', 'Andere gerichtliche Frist nicht modelliert', 'Autre délai judiciaire non modélisé', [atsg('Art. 61, keine pauschale Übernahme richterlicher Fristen')]]
  );
  catalog.excludedPaths.push(...exclusions.map(([exclusionId, law, matter, reasonKind, reasonKey, de, fr, sourceRefs]) => ({ exclusionId, law, matter, action: 'other', reasonKind, reasonKey, labels: { de, fr }, sourceRefs })));
  const sourceReviewRef = { reviewId: 'AP20C3-SOURCE-CONTROL-20261001', sha256: digest(read(sourceControlPath)) };
  const referenceSuiteRef = { suiteId: 'AP20B-SOCIAL-DATES-1', sha256: digest(read(datesPath)) };
  const componentRefs = baseManifest.artifacts.filter(item => ['calendar', 'holidayCatalog'].includes(item.role)).map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 }));
  catalog.releaseEligibility = catalog.cantonalBindings.map(binding => {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId && item.revision === binding.ruleRevision);
    const old = original.releaseEligibility.find(item => item.bindingRef.bindingId === binding.bindingId && item.bindingRef.revision === binding.revision);
    return {
      eligibilityId: `AP20C3-${binding.bindingId}`, releaseId: candidateReleaseId, status: 'candidate',
      ruleRef: { ruleId: rule.ruleId, revision: rule.revision, sha256: socialObjectSha256(rule) },
      bindingRef: { bindingId: binding.bindingId, revision: binding.revision, sha256: socialObjectSha256(binding) },
      contextRouteIds: binding.contextRoutes.map(route => route.contextRouteId), calendarBindingIds: binding.calendarBindings.map(calendar => calendar.calendarBindingId),
      componentRefs: structuredClone(componentRefs), sourceReviewRef: old ? structuredClone(old.sourceReviewRef) : { ...sourceReviewRef },
      referenceSuiteRef: old ? structuredClone(old.referenceSuiteRef) : { ...referenceSuiteRef },
      caseCoverage: old ? structuredClone(old.caseCoverage) : { ...coverage }, calculationCoverage: old ? structuredClone(old.calculationCoverage) : { ...coverage }, approval: null
    };
  });
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · AP20C3-Kandidat', fr: 'Procédures nationales des assurances sociales · candidat AP20C3' };
  catalog.review = { reviewedOn: '2026-10-01', status: 'candidate', reviewedBy: 'Codex', basis: '36 bisherige nationale Regeln und 42 Berner Anbindungen aus dem abgenommenen AP20C2 objektidentisch erhalten. Je vier MVG- und ÜLG-Regeln mit je vier BE-Anbindungen als Kandidat. AP20B und DEC-2026-026 abgenommen. Anwendungsuntergrenze 2026 ist kein behauptetes Inkrafttreten. Keine AP20C3-Integrations-, Quellenrelease-, Produkt- oder Betriebsfreigabe.' };
  assert.deepEqual(catalog.federalRules.slice(0, 36), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 42), original.cantonalBindings);
  assert.equal(catalog.federalRules.length, 44);
  assert.equal(catalog.cantonalBindings.length, 50);
  assertSocialProcedureCatalog(catalog);
  files.set('social-procedures/ch-social-procedures.json', encode(catalog));
  const descriptors = structuredClone(baseManifest.artifacts);
  for (const descriptor of descriptors) {
    descriptor.byteLength = files.get(descriptor.path).length;
    descriptor.sha256 = digest(files.get(descriptor.path));
  }
  const sourceEvidence = [...baseManifest.extensions['steimer.candidate'].sourceEvidence, { path: sourceControlPath, sha256: sourceReviewRef.sha256 }];
  for (const entry of sourceEvidence) assert.equal(digest(read(entry.path)), entry.sha256, `Changed bound source evidence: ${entry.path}`);
  const acceptanceEvidence = { path: acceptancePath, sha256: digest(read(acceptancePath)) };
  const manifest = {
    ...baseManifest, releaseId: candidateReleaseId, releaseStatus: 'candidate', createdOn: '2026-10-01',
    sourceSummary: { ...baseManifest.sourceSummary, latestReviewedOn: '2026-10-01', sourceIds: [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort() },
    artifacts: descriptors,
    extensions: { 'steimer.candidate': {
      workPackage: 'AP20C3', baseReleaseId: baseManifest.releaseId, baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)), contractDecision: 'DEC-2026-026',
      approvalRequired: true, productionActivation: false, sourceReviewRef, referenceSuiteRef, acceptanceEvidence,
      decisionEvidence: { path: decisionPath, sha256: digest(read(decisionPath)) }, sourceEvidence,
      scope: '44 nationale Regeln und 50 Berner Anbindungen. Je vier MVG- und ÜLG-Regeln mit je vier BE-Anbindungen neu. Bestandsobjekte unverändert, sämtliche Freigabeverknüpfungen Kandidat. Alle fünf AP20-Erlasse im Kandidaten modelliert, keine operativen Freigaben oder weiteren Kantone aktiviert.'
    } }
  };
  files.set('manifest.json', encode(manifest));
  const verification = {
    workPackage: 'AP20C3', preparedOn: '2026-10-01', candidateReleaseId, candidatePath: candidateRelativePath, manifestSha256: digest(files.get('manifest.json')),
    baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)), acceptanceEvidence,
    counts: { preservedRules: 36, newMvgRules: 4, newUelgRules: 4, federalRules: 44, preservedBindings: 42, newMvgBindings: 4, newUelgBindings: 4, cantonalBindings: 50, candidateEligibility: 50 },
    preservedRules: original.federalRules.map(rule => ({ ruleId: rule.ruleId, revision: rule.revision, status: rule.status, sha256: socialObjectSha256(rule) })),
    preservedBindings: original.cantonalBindings.map(binding => ({ bindingId: binding.bindingId, revision: binding.revision, status: binding.status, sha256: socialObjectSha256(binding) })),
    preservedRulesDeepEqual: true, preservedBindingsDeepEqual: true, productionActivation: false, integrationApproved: false,
    sourceReviewRef, referenceSuiteRef, sourceEvidence,
    unchangedArtifacts: descriptors.filter(item => item.role !== 'socialProcedureCatalog').map(item => ({ path: item.path, sha256: item.sha256 })),
    changedCandidateArtifacts: ['manifest.json', 'social-procedures/ch-social-procedures.json']
  };
  return { files, verification, catalog, manifest };
}

export function persistAP20C3Candidate(prepared, target = join(root, candidateRelativePath), evidenceTarget = join(root, 'outputs/ap20c3-2026-10-01/build-verification.json')) {
  const writes = [...prepared.files].map(([path, bytes]) => [join(target, path), bytes]);
  writes.push([evidenceTarget, encode(prepared.verification)]);
  for (const [path, bytes] of writes) if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), `Refusing to overwrite differing candidate: ${path}`);
  for (const [path, bytes] of writes) if (!existsSync(path)) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); }
  for (const [path, bytes] of writes) assert.ok(readFileSync(path).equals(bytes), `Candidate readback differs: ${path}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = prepareAP20C3Candidate();
  persistAP20C3Candidate(prepared);
  console.log(JSON.stringify(prepared.verification, null, 2));
}
