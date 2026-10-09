// SPDX-License-Identifier: AGPL-3.0-only
// Append-only local integration candidate. No promotion or operational approval.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';
import { readFrozenAP20BInput } from './read-frozen-ap20b-input.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const candidateRelativePath = 'data/candidates/2026-10-01-ap20c2';
export const candidateReleaseId = '2026-10-01-ap20c2-candidate.1';
const baseRelativePath = 'data/candidates/2026-09-30-ap20c1';
const evidencePath = 'outputs/ap20b-2026-09-30/pruefprotokoll.json';
const acceptancePath = 'docs/fachrecht/abnahme-ap20c1.md';
const sourceControlPath = 'outputs/ap20c2-2026-10-01/quellenkontrolle.json';
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

export function prepareAP20C2Candidate() {
  assert.equal(digest(read(`${baseRelativePath}/manifest.json`)), 'deb308e319a47eaf80f9056b88ee2bc9ff56c0500e70269fb0bc54e91a1900b5');
  assert.equal(digest(read(acceptancePath)), 'f94289c3069128a26bb4a270d178982dac342d0f3267b2059dbe0d8c6e657f11');
  assert.equal(digest(read(evidencePath)), '8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d');
  assert.equal(digest(read(decisionPath)), '16873c28621edcac92e490814c5196fbbfb34900d8e10d4c767cda8a5359ef7a');
  const evidence = json(evidencePath);
  for (const entry of evidence.evidence) readFrozenAP20BInput(entry, read);
  const contract = json(contractPath);
  assert.deepEqual(contract.referenceWindow, coverage);
  assert.equal(digest(read(sourceControlPath)), '6ef1e65e4a2e5a7fa0a87c2042d5fc17a9f736c3f09fe9035620dbf0ce84d4c5', 'Changed integration source evidence');
  const sourceControl = json(sourceControlPath);
  assert.equal(sourceControl.checkedOn, '2026-10-01');
  assert.deepEqual(sourceControl.errors, []);
  assert.equal(sourceControl.noDeltaInCheckedScope, true);
  // Bind immutable C1 data and its acceptance, not hashes of runtime source
  // files that legitimately evolve during this explicitly authorised package.
  const baseManifest = json(`${baseRelativePath}/manifest.json`);
  const files = new Map();
  for (const descriptor of baseManifest.artifacts) {
    const bytes = read(`${baseRelativePath}/${descriptor.path}`);
    assert.equal(digest(bytes), descriptor.sha256, `Changed AP20C1 artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
    files.set(descriptor.path, bytes);
  }
  const original = json(`${baseRelativePath}/social-procedures/ch-social-procedures.json`);
  const catalog = structuredClone(original);
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(baseManifest.formatVersion, '6.0.0');
  const atsg = locator => ref('SRC-AP17C-ATSG-20240101', locator);
  const famzg = locator => ref('SRC-AP20C2-FAMZG-20260101', locator);
  const flg = locator => ref('SRC-AP20C2-FLG-20240101', locator);
  const flv = locator => ref('SRC-AP20C2-FLV-20140423', locator);
  const kfamzg = ref('SRC-AP20C2-KFAMZG-BE-20201101', 'Art. 1, 2, 26 und 27. Nur qualifizierte obligatorische bernische Leistungen. Freiwillige Kassenleistungen bleiben unmodelliert, nicht pauschal ausserhalb des ATSG');
  const gsog = ref('SRC-AP20C1-GSOG-BE-20260101', 'Art. 54 Abs. 1 bis 5, Artikeltext über 1. Mai 2026 unverändert. Zuständige Abteilung des Verwaltungsgerichts, Sprache ohne Fristwirkung');
  const vrpg = ref('SRC-AP20C1-VRPG-BE-20230801', 'Art. 1 Abs. 2, Art. 32 und 83, Artikeltext über 1. September 2026 unverändert. Ergänzendes kantonales Recht, keine eigenständige ATSG-Frist');
  const frg = ref('SRC-AP17C-FRG-BE-20210401', 'Art. 2, nur separat qualifizierte Partei-/Vertretungsanknüpfung nach Art. 38 Abs. 3 ATSG');
  for (const [law, type, base, versions] of [
    ['FAMZG', 'statute', '2008/51', ['2026-01-01']],
    ['FLG', 'statute', '1952/823_843_839', ['2024-01-01', '2027-07-01']],
    ['FLV', 'ordinance', '1952/896_916_912', ['2014-04-23']]
  ]) for (const version of versions) catalog.sources.push({
    sourceId: `SRC-AP20C2-${law}-${version.replaceAll('-', '')}`, sourceType: type,
    title: `${law}, Originalfassung ${version}. Tragende Artikel durch AP20B-Originalkette und AP20C2-Quellenkontrolle nachgewiesen`,
    authority: 'Schweizerische Eidgenossenschaft', url: `https://www.fedlex.admin.ch/eli/cc/${base}/${version.replaceAll('-', '')}/de`,
    documentVersionDate: version, reviewedOn: '2026-10-01', reviewStatus: 'verified'
  });
  catalog.sources.push({
    sourceId: 'SRC-AP20C2-KFAMZG-BE-20201101', sourceType: 'statute', title: 'KFamZG Bern, Art. 1, 2, 26 und 27, obligatorischer Umfang und bewusst nicht modellierte freiwillige Leistungen',
    authority: 'Kanton Bern', url: 'https://www.belex.sites.be.ch/api/de/versions/1993/pdf_file', documentVersionDate: '2020-11-01', reviewedOn: '2026-10-01', reviewStatus: 'verified'
  });

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
  const lawDefinitions = contract.laws.filter(item => ['FAMZG', 'FLG'].includes(item.law));
  for (const lawDefinition of lawDefinitions) for (const [suffix, action, stage, triggerKind, de, fr, actionRef] of actions) {
    const family = lawDefinition.law === 'FAMZG';
    const sources = [
      ...(family ? [famzg('Art. 1 und 3, gesetzliche individuelle Familienzulagen einschliesslich gesetzlich erfasster höherer Ansätze sowie Geburts- und Adoptionszulagen. Keine Finanzhilfen an Familienorganisationen')]
        : [flg('Art. 1 und 13, nur individuelle bundesrechtliche Familienzulagen in der Landwirtschaft. Tragende Artikel über 1. Juli 2027 unverändert'), flv('Art. 10, kantonale Kasse für den konkreten Leistungsfall eigenständig qualifiziert. Keine einheitliche Wohnsitzregel für alle Berechtigtengruppen')]),
      atsg('Art. 2, 38 bis 40, Tagesfrist mit Stillstand und eigenständiger Partei-/Vertretungsfeiertagsanknüpfung'), actionRef
    ];
    if (suffix === 'CORRECTION') sources.push(ref('JUD-AP17C-BGER-8C-767-2008-20090112', 'E. 4.3.2, nur formelle Beschwerdeverbesserung. Wiederverwendeter allgemeiner ATSG-Vorbefund, kein erlassspezifischer Entscheid'));
    const rule = {
      ruleId: `CH-SOC-${lawDefinition.law}-${suffix}`, revision: 1, status: 'candidate', labels: { de: `${family ? 'FamZG' : 'FLG'} · ${de}`, fr: `${family ? 'LAFam' : 'LFA'} · ${fr}` },
      law: lawDefinition.law.toLowerCase(), matter: lawDefinition.matter, action, stage, triggerKind, notificationChannels: ['individual-service'],
      calculation: { type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded', ...(['OBJ', 'APP'].includes(suffix) ? { duration: { value: 30, unit: 'day' } } : { durationInputId: 'deadlineDays' }) },
      suspensionProfileId: 'S_ATSG', filingProfileId: 'F7_ATSG_DISPATCH', holidayPolicy: 'partyOrRepresentative', endShiftPolicy: 'nextWorkingDay', ...temporal(sources)
    };
    catalog.federalRules.push(rule);
    const definition = contract.routes.find(route => route.law === lawDefinition.law && route.actions.includes(suffix));
    assert.ok(definition);
    const court = stage === 'cantonal-insurance-court';
    const jurisdiction = family
      ? famzg('Art. 22, Gerichtskanton der für die streitige Leistung tatsächlich anwendbaren Familienzulagenordnung. Kein Wohnsitz- oder Kassensitzersatz')
      : flg('Art. 22 Abs. 1, Gerichtskanton der im angefochtenen Fall verfügenden zuständigen kantonalen Ausgleichskasse. Über 1. Juli 2027 unverändert, kein allgemeiner Wohnsitzfilter');
    const routeRefs = court ? [jurisdiction, gsog] : family
      ? [famzg('Art. 1 und 3, tatsächlich anwendbare Familienzulagenordnung für die angefochtene Leistung beziehungsweise laufende Anordnung separat qualifiziert. Keine Ableitung allein aus Wohnsitz, Arbeitsort oder Kassensitz'), kfamzg]
      : [flg('Art. 13, Durchführung durch die zuständige kantonale Ausgleichskasse'), flv('Art. 10, zuständige kantonale Kasse des Arbeitgebers für landwirtschaftliche Arbeitnehmende beziehungsweise des Wohnsitzkantons für selbstständigerwerbende Landwirte. Konkrete Zuständigkeit separat qualifiziert')];
    const route = {
      contextRouteId: `be-soc-${definition.id.toLowerCase()}`, kind: definition.kind,
      requiredFacts: [fact('competentBodyQualified', true), fact('decisionOrigin', lawDefinition.origin), ...Object.entries(definition.facts).map(([key, value]) => fact(key, value)), fact('jurisdictionSpecialCase', 'ordinary')], sourceRefs: routeRefs
    };
    const bindingRefs = [frg, ...routeRefs, ...(family && court ? [kfamzg] : []), ...(court ? [vrpg] : [])];
    catalog.cantonalBindings.push({
      bindingId: `BE-SOC-${definition.id}-${suffix}`, revision: 1, status: 'candidate',
      labels: { de: `Bern · ${rule.labels.de}`, fr: `Berne · ${rule.labels.fr}` },
      ruleId: rule.ruleId, ruleRevision: 1, procedureContextCanton: 'BE', entryProfileId: 'vrpg-be', contextRoutes: [route],
      calendarBindings: structuredClone(original.cantonalBindings[0].calendarBindings), supplementaryLawRefs: [frg, ...(family ? [kfamzg] : []), ...(court ? [gsog, vrpg] : [])],
      ...temporal(bindingRefs, court ? [jurisdiction, gsog] : [])
    });
  }
  const exclusions = [
    ['FAMZG-ORGANISATION-GRANTS', 'famzg', 'famzg-family-organisation-grants', 'statutory-exclusion', 'statutory-exclusion', 'Finanzhilfen an Familienorganisationen nicht erfasst', 'Aides financières aux organisations familiales non couvertes', famzg('Art. 1 Abs. 2, gesetzliche Ausnahme für Finanzhilfen an Familienorganisationen')],
    ['FAMZG-VOLUNTARY', 'famzg', 'famzg-voluntary-fund-benefits', 'unresolved-qualification', 'unresolved-qualification', 'Freiwillige Kassenleistungen nicht modelliert', 'Prestations facultatives des caisses non modélisées', kfamzg],
    ['FLG-CANTONAL-EXTRA', 'flg', 'flg-cantonal-extra-benefits', 'product-scope', 'product-scope', 'Kantonale Zusatzleistungen ausserhalb des Bundeswegs nicht erfasst', 'Prestations cantonales supplémentaires hors du régime fédéral non couvertes', flg('Art. 25, kantonale Zusatzleistungen ausserhalb des qualifizierten Bundeswegs nicht aktiviert')]
  ];
  for (const law of lawDefinitions) exclusions.push(
    [`${law.law}-FEDERAL`, law.law.toLowerCase(), 'federal-instance', 'unsupported-procedure', 'unsupported-procedure', 'Bundesgerichtliche Verfahren nicht erfasst', 'Procédures devant les tribunaux fédéraux non couvertes', law.law === 'FAMZG' ? famzg('Art. 22, nur qualifizierte kantonale Inlandspfade') : flg('Art. 22, nur qualifizierte kantonale Inlandspfade')],
    [`${law.law}-COURT-OTHER`, law.law.toLowerCase(), `${law.law.toLowerCase()}-other-court-order`, 'unsupported-procedure', 'unsupported-procedure', 'Andere gerichtliche Frist nicht modelliert', 'Autre délai judiciaire non modélisé', atsg('Art. 61, keine pauschale Übernahme richterlicher Fristen')]
  );
  catalog.excludedPaths.push(...exclusions.map(([exclusionId, law, matter, reasonKind, reasonKey, de, fr, source]) => ({ exclusionId, law, matter, action: 'other', reasonKind, reasonKey, labels: { de, fr }, sourceRefs: [source] })));
  const sourceReviewRef = { reviewId: 'AP20C2-SOURCE-CONTROL-20261001', sha256: digest(read(sourceControlPath)) };
  const referenceSuiteRef = { suiteId: 'AP20B-SOCIAL-DATES-1', sha256: digest(read(datesPath)) };
  const componentRefs = baseManifest.artifacts.filter(item => ['calendar', 'holidayCatalog'].includes(item.role)).map(({ role, contentId, sha256 }) => ({ role, contentId, sha256 }));
  catalog.releaseEligibility = catalog.cantonalBindings.map(binding => {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId && item.revision === binding.ruleRevision);
    const old = original.releaseEligibility.find(item => item.bindingRef.bindingId === binding.bindingId && item.bindingRef.revision === binding.revision);
    return {
      eligibilityId: `AP20C2-${binding.bindingId}`, releaseId: candidateReleaseId, status: 'candidate',
      ruleRef: { ruleId: rule.ruleId, revision: rule.revision, sha256: socialObjectSha256(rule) },
      bindingRef: { bindingId: binding.bindingId, revision: binding.revision, sha256: socialObjectSha256(binding) },
      contextRouteIds: binding.contextRoutes.map(route => route.contextRouteId), calendarBindingIds: binding.calendarBindings.map(calendar => calendar.calendarBindingId),
      componentRefs: structuredClone(componentRefs), sourceReviewRef: old ? structuredClone(old.sourceReviewRef) : { ...sourceReviewRef },
      referenceSuiteRef: old ? structuredClone(old.referenceSuiteRef) : { ...referenceSuiteRef },
      caseCoverage: old ? structuredClone(old.caseCoverage) : { ...coverage }, calculationCoverage: old ? structuredClone(old.calculationCoverage) : { ...coverage }, approval: null
    };
  });
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · AP20C2-Kandidat', fr: 'Procédures nationales des assurances sociales · candidat AP20C2' };
  catalog.review = { reviewedOn: '2026-10-01', status: 'candidate', reviewedBy: 'Codex', basis: '28 bisherige nationale Regeln und 34 Berner Anbindungen aus dem abgenommenen AP20C1 objektidentisch erhalten. Je vier FamZG- und FLG-Regeln mit je vier BE-Anbindungen als Kandidat. AP20B und DEC-2026-026 abgenommen. Anwendungsuntergrenze 2026 ist kein behauptetes Inkrafttreten. Keine AP20C2-Integrations-, Quellenrelease-, Produkt- oder Betriebsfreigabe.' };
  assert.deepEqual(catalog.federalRules.slice(0, 28), original.federalRules);
  assert.deepEqual(catalog.cantonalBindings.slice(0, 34), original.cantonalBindings);
  assert.equal(catalog.federalRules.length, 36);
  assert.equal(catalog.cantonalBindings.length, 42);
  assertSocialProcedureCatalog(catalog);
  files.set('social-procedures/ch-social-procedures.json', encode(catalog));
  const descriptors = structuredClone(baseManifest.artifacts);
  for (const descriptor of descriptors) {
    descriptor.byteLength = files.get(descriptor.path).length;
    descriptor.sha256 = digest(files.get(descriptor.path));
  }
  const sourceEvidence = [...baseManifest.extensions['steimer.candidate'].sourceEvidence, { path: sourceControlPath, sha256: sourceReviewRef.sha256 }];
  const acceptanceEvidence = { path: acceptancePath, sha256: digest(read(acceptancePath)) };
  const manifest = {
    ...baseManifest, releaseId: candidateReleaseId, releaseStatus: 'candidate', createdOn: '2026-10-01',
    sourceSummary: { ...baseManifest.sourceSummary, latestReviewedOn: '2026-10-01', sourceIds: [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort() },
    artifacts: descriptors,
    extensions: { 'steimer.candidate': {
      workPackage: 'AP20C2', baseReleaseId: baseManifest.releaseId, baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)), contractDecision: 'DEC-2026-026',
      approvalRequired: true, productionActivation: false, sourceReviewRef, referenceSuiteRef, acceptanceEvidence,
      decisionEvidence: { path: decisionPath, sha256: digest(read(decisionPath)) }, sourceEvidence,
      scope: '36 nationale Regeln und 42 Berner Anbindungen. Je vier FamZG- und FLG-Regeln mit je vier BE-Anbindungen neu. Bestandsobjekte unverändert, sämtliche Freigabeverknüpfungen Kandidat. Keine MVG-/ÜLG-Pfade oder weiteren Kantone aktiviert.'
    } }
  };
  files.set('manifest.json', encode(manifest));
  const verification = {
    workPackage: 'AP20C2', preparedOn: '2026-10-01', candidateReleaseId, candidatePath: candidateRelativePath, manifestSha256: digest(files.get('manifest.json')),
    baseManifestSha256: digest(read(`${baseRelativePath}/manifest.json`)), acceptanceEvidence,
    counts: { preservedRules: 28, newFamzgRules: 4, newFlgRules: 4, federalRules: 36, preservedBindings: 34, newFamzgBindings: 4, newFlgBindings: 4, cantonalBindings: 42, candidateEligibility: 42 },
    preservedRules: original.federalRules.map(rule => ({ ruleId: rule.ruleId, revision: rule.revision, status: rule.status, sha256: socialObjectSha256(rule) })),
    preservedBindings: original.cantonalBindings.map(binding => ({ bindingId: binding.bindingId, revision: binding.revision, status: binding.status, sha256: socialObjectSha256(binding) })),
    preservedRulesDeepEqual: true, preservedBindingsDeepEqual: true, productionActivation: false, integrationApproved: false,
    sourceReviewRef, referenceSuiteRef, sourceEvidence,
    unchangedArtifacts: descriptors.filter(item => item.role !== 'socialProcedureCatalog').map(item => ({ path: item.path, sha256: item.sha256 })),
    changedCandidateArtifacts: ['manifest.json', 'social-procedures/ch-social-procedures.json']
  };
  return { files, verification, catalog, manifest };
}

export function persistAP20C2Candidate(prepared, target = join(root, candidateRelativePath), evidenceTarget = join(root, 'outputs/ap20c2-2026-10-01/build-verification.json')) {
  const writes = [...prepared.files].map(([path, bytes]) => [join(target, path), bytes]);
  writes.push([evidenceTarget, encode(prepared.verification)]);
  for (const [path, bytes] of writes) if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), `Refusing to overwrite differing candidate: ${path}`);
  for (const [path, bytes] of writes) if (!existsSync(path)) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes, { flag: 'wx' }); }
  for (const [path, bytes] of writes) assert.ok(readFileSync(path).equals(bytes), `Candidate readback differs: ${path}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prepared = prepareAP20C2Candidate();
  persistAP20C2Candidate(prepared);
  console.log(JSON.stringify(prepared.verification, null, 2));
}
