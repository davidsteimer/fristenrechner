// SPDX-License-Identifier: AGPL-3.0-only

import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const baseReleaseId = '2026-08-31-mvp-03-approved.1';
const releaseId = '2026-09-12-ap17c-candidate.1';
const base = join(process.cwd(), 'data/releases', baseReleaseId);
const target = join(process.cwd(), 'data/releases', releaseId);
const corpusPath = join(process.cwd(), 'tests/golden/candidates/ap17b-anwendbarkeit.json');
const corpusHash = 'd180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47';
const schemaId = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/special-regime-catalog-v3.schema.json';
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
if (hash(corpusPath) !== corpusHash) throw new Error('Der fachlich abgenommene AP17B-Referenzkorpus wurde verändert.');
const reference = readJson(corpusPath);
const sourceId = id => `${id.startsWith('BGER-') || id.startsWith('VGER-') ? 'JUD' : 'SRC'}-AP17C-${id}-${reference.sources.find(source => source.id === id).version.slice(0, 10).replaceAll('-', '')}`;
const ref = (id, locator) => ({ sourceId: sourceId(id), locator });
const legalDates = {
  'SOC-IV-PRE': '2021-01-01',
  social: '2007-01-01',
  uvg: '2017-01-01',
  procurement: '2022-02-01'
};

function legalReferences(mapping) {
  const law = mapping.selection.law;
  if (mapping.selection.area === 'social') {
    const refs = [
      ref(law === 'ivg' ? 'IVG' : law === 'ahvg' ? 'AHVG' : 'UVG', law === 'uvg' ? 'Art. 1 Abs. 1 und 2' : 'Art. 1'),
      ref('ATSG', 'Art. 2, Art. 38 Abs. 1 bis 4, Art. 39 und 40. Art. 41 nur Kontext, keine Wiederherstellungsprüfung'),
      ref('FRG-BE', 'Art. 2, nur bei geklärten Anknüpfungen nach Art. 38 Abs. 3 ATSG')
    ];
    if (mapping.id === 'SOC-IV-PRE') refs.push(ref('IVG', 'Art. 57a Abs. 3'), ref('IVV', 'Art. 73bis sowie Art. 73ter Abs. 2 und 3, Abs. 1 aufgehoben'));
    if (mapping.selection.action === 'objection') refs.push(ref('ATSG', 'Art. 52 Abs. 1'));
    if (mapping.selection.action === 'appeal') {
      refs.push(ref('ATSG', 'Art. 56, 58 und 60'));
      if (law === 'ivg') refs.push(ref('IVG', 'Art. 69 Abs. 1 Bst. a'));
      if (law === 'ahvg') refs.push(ref('AHVG', 'Art. 84'));
    }
    if (mapping.selection.action === 'ongoing') refs.push(ref('ATSG', 'Art. 38 bis 40, konkret angeordnete Tagesfrist'));
    if (mapping.selection.action === 'complaint-correction') refs.push(ref('ATSG', 'Art. 60 Abs. 2 und Art. 61 Bst. b'), ref('BGER-8C-767-2008', 'E. 4.3.2, nur qualifizierte Nachfrist zur Beschwerdeverbesserung'));
    return refs;
  }
  const refs = [
    ref('IVOEB', mapping.profileId === 'PROC-20' ? 'Art. 55, Art. 56 Abs. 1 und 2, Art. 64 Abs. 1' : 'Art. 55, Art. 56 Abs. 2, Art. 64 Abs. 1. Tagesdauer aus konkreter Anordnung'),
    ref('IVOEBG', 'Art. 3 bis 6, Art. 4 zur sinngemässen Anwendung als kantonales Gesetzesrecht'),
    ref('IVOEBV', 'Art. 21a und 22a, Verfahrenseinleitung seit 1. Februar 2022'),
    ref('VRPG-BE', 'Art. 41 und 43'),
    ref('FRG-BE', 'Art. 2')
  ];
  if (mapping.selection.action === 'appeal') refs.push(ref('IVOEB', 'Art. 51, Art. 53 Abs. 1 Bst. e'), ref('IVOEBV', 'Art. 15'));
  if (mapping.selection.action === 'appeal-second-instance') refs.push(ref('VGER-BE-100-2024-8', 'E. 1.1 und 2, 20 Tage auch für den Weiterzug'));
  return refs;
}

const actionLabels = {
  'preliminary-objection': ['Einwand gegen IV-Vorbescheid', 'Observations sur le préavis AI'],
  objection: ['Einsprache gegen Leistungsverfügung', 'Opposition à une décision de prestations'],
  appeal: ['Ordentliche Beschwerde', 'Recours ordinaire'],
  'complaint-correction': ['Nachfrist zur Verbesserung der Beschwerde', 'Délai supplémentaire pour régulariser le recours'],
  'appeal-second-instance': ['Weiterzug des Beschwerdeentscheids', 'Recours contre la décision sur recours'],
  ongoing: ['Angeordnete Tagesfrist im laufenden Verfahren', 'Délai fixé en jours dans une procédure en cours']
};
const lawLabels = { ivg: ['IVG', 'LAI'], ahvg: ['AHVG', 'LAVS'], uvg: ['UVG', 'LAA'], ivob: ['IVöB / Bern', 'AIMP / Berne'] };

const baseManifest = readJson(join(base, 'manifest.json'));
for (const artifact of baseManifest.artifacts) {
  if (hash(join(base, artifact.path)) !== artifact.sha256) {
    throw new Error(`Der freigegebene Ausgangsstand stimmt nicht mit seinem Manifest überein: ${artifact.path}`);
  }
  const dest = join(target, artifact.path);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(join(base, artifact.path), dest);
}
const catalog = readJson(join(base, 'special-regimes/vrpg-be.json'));
catalog.$schema = schemaId;
catalog.formatVersion = '3.0.0';
catalog.catalogId = 'vrpg-be-special-regimes-ap17c';
catalog.review = {
  reviewedOn: '2026-09-12', status: 'candidate', reviewedBy: 'Codex',
  basis: 'AP17B fachlich durch David Steimer abgenommen. AP17C Integrationskandidat, Quellen am 12.09.2026 nachgeprüft, keine Daten- oder Betriebsfreigabe.'
};
catalog.scope = {
  de: 'AP17C: bisherige politische Regime und 16 begrenzte IVG-, AHVG-, UVG- und bernische Beschaffungszuordnungen. Neue Fallabdeckung 2026 bis 2027, Kandidat ohne Produktfreigabe.',
  fr: 'AP17C : régimes politiques existants et 16 rattachements limités LAI, LAVS, LAA et marchés publics bernois. Nouveaux cas couverts de 2026 à 2027, version candidate non publiée.'
};
catalog.sources.push(...reference.sources.map(source => {
  const judgment = source.id.startsWith('BGER-') || source.id.startsWith('VGER-');
  return {
    sourceId: sourceId(source.id),
    sourceType: judgment ? 'caseLaw' : ['IVV', 'IVOEBV'].includes(source.id) ? 'ordinance' : 'statute',
    title: `${source.id}, AP17C-Quellenkette`,
    authority: source.id.startsWith('VGER-') || ['VRPG-BE', 'FRG-BE', 'IVOEB', 'IVOEBG', 'IVOEBV', 'IVOEB-OLD'].includes(source.id) ? 'Kanton Bern' : 'Schweizerische Eidgenossenschaft',
    url: source.url,
    documentVersionDate: source.version.slice(0, 10),
    reviewedOn: ['VGER-BE-200-2017-814', 'IVOEB-OLD'].includes(source.id) ? '2026-09-11' : '2026-09-12',
    reviewStatus: 'verified'
  };
}));
catalog.sources.push(...[
  ['IVG', '2027-01-01', 'https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/20270101/de'],
  ['AHVG', '2027-01-01', 'https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20270101/de'],
  ['IVV', '2027-07-01', 'https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/20270701/de']
].map(([law, version, url]) => ({
  sourceId: `SRC-AP17C-${law}-${version.replaceAll('-', '')}`, sourceType: law === 'IVV' ? 'ordinance' : 'statute',
  title: `${law}, angekündigte Fassung ${version}, artikelbezogener AP17C-Zukunftsabgleich`,
  authority: 'Schweizerische Eidgenossenschaft', url, documentVersionDate: version,
  reviewedOn: '2026-09-12', reviewStatus: 'verified'
})));
catalog.calendarProfiles.push({
  calendarProfileId: 'C_ATSG_BE', calendarId: 'be-public-holidays', holidayAnchor: 'partyOrRepresentativeCanton', endShiftPolicy: 'nextWorkingDay',
  labels: { de: 'ATSG: relevante Anknüpfungen von Partei und Vertretung im Kanton Bern', fr: 'LPGA : rattachements pertinents de la partie et de sa représentation dans le canton de Berne' }
}, {
  calendarProfileId: 'C_PROC_BE', calendarId: 'be-public-holidays', holidayAnchor: 'berneseProceduralLaw', endShiftPolicy: 'nextWorkingDay',
  labels: { de: 'Bernischer Kalender im Beschaffungsbeschwerdeverfahren', fr: 'Calendrier bernois dans la procédure de recours en matière de marchés publics' }
});
catalog.suspensionProfiles.push({
  suspensionProfileId: 'S_PROC_NONE', mode: 'none', suspensionSetId: null,
  labels: { de: 'Kein Fristenstillstand im Beschaffungsbeschwerdeverfahren', fr: 'Pas de suspension des délais dans le recours en matière de marchés publics' },
  sourceRefs: [ref('IVOEB', 'Art. 56 Abs. 2'), ref('IVOEBG', 'Art. 5 Abs. 2')]
});
catalog.filingProfiles.push(...[
  ['F7_ATSG_DISPATCH', [ref('ATSG', 'Art. 39')]],
  ['F8_PROC_DISPATCH', [ref('IVOEB', 'Art. 55'), ref('VRPG-BE', 'Art. 42')]]
].map(([filingProfileId, sourceRefs]) => ({
  filingProfileId, preservationMode: 'dispatch', deadlineDimension: 'dateOnly',
  labels: { de: 'Fristwahrung separat prüfen, Aufgabe oder Übergabe nach anwendbarer Norm', fr: 'Respect du délai à vérifier séparément, dépôt ou remise selon la norme applicable' },
  acceptedChannels: ['competentAuthority', 'swissPost', 'swissDiplomaticMission'], acceptedEvidence: ['authorityReceipt', 'postalDispatch'], originalRequired: false, cutoffTime: null, timezone: null, sourceRefs
})));
catalog.deadlineDefinitions = catalog.deadlineDefinitions.map(definition => definition.deadlineOrigin === 'CALCULATED' ? { ...definition, applicability: null } : definition);
for (const mapping of reference.mappings.filter(item => item.disposition === 'candidate')) {
  const social = mapping.selection.area === 'social';
  const profile = reference.calculationProfiles.find(item => item.id === mapping.profileId);
  const sourceRefs = legalReferences(mapping);
  const deadlineDefinitionId = `AP17C-${mapping.id}-001`;
  const regimeId = `ap17c-${mapping.id.toLowerCase()}`;
  const calendarProfileId = social ? 'C_ATSG_BE' : 'C_PROC_BE';
  const suspensionProfileId = social ? 'S_ATSG' : 'S_PROC_NONE';
  const filingProfileId = social ? 'F7_ATSG_DISPATCH' : 'F8_PROC_DISPATCH';
  const definition = {
    deadlineDefinitionId, deadlineOrigin: 'CALCULATED', status: 'supported',
    validity: { dataValidFrom: '2026-01-01', dataValidTo: '2027-12-31', legalEffectiveFrom: legalDates[mapping.id] ?? legalDates[mapping.selection.law] ?? legalDates[mapping.selection.area] },
    anchors: [{ inputId: 'legalTriggerDate', role: 'trigger', valueType: 'date', labelKey: 'input.legalTriggerDate' }],
    calculation: {
      type: 'R1_RELATIVE', anchorInputId: 'legalTriggerDate', direction: 'after', anchorBoundary: 'excluded',
      ...(profile.duration.mode === 'fixed' ? { duration: { value: profile.duration.days, unit: 'day' } } : { durationInputId: 'deadlineDays' })
    },
    resultPolicy: { calendarProfileId, suspensionProfileId, endShiftPolicy: 'nextWorkingDay', strictFixedDate: false },
    filingProfileId, gateIds: [], legalOverrideIds: [], sourceRefs,
    applicability: {
      mappingId: mapping.id, selection: mapping.selection, authorityCode: 'BE', ...mapping.requiredContext,
      holidayCanton: 'BE', holidayPolicy: profile.holidayPolicy,
      notificationChannels: social ? ['individual-service'] : ['individual-service', 'official-publication'],
      procedureStartOnOrAfter: social ? null : '2022-02-01',
      caseCoverageFrom: '2026-01-01', caseCoverageTo: '2027-12-31', sourceRefs
    }
  };
  catalog.deadlineDefinitions.push(definition);
  const action = !social && mapping.selection.action === 'appeal'
    ? ['Beschwerde gegen Zuschlagsverfügung', "Recours contre la décision d'adjudication"]
    : actionLabels[mapping.selection.action];
  const law = lawLabels[mapping.selection.law];
  catalog.regimes.push({
    regimeId, regimeKind: 'deadline', level: social ? 'federal' : 'cantonal', lawCode: social ? mapping.selection.law.toUpperCase() : 'IVOB-BE',
    provision: social ? 'Einzelgesetz i.V.m. ATSG Art. 38 bis 41' : 'IVöB Art. 55 und 56, IVöBG Art. 5 und 6',
    labels: { de: `${law[0]} · ${action[0]}`, fr: `${law[1]} · ${action[1]}` }, status: 'supported', statusReasonKey: 'status.supported.qualifiedMapping',
    deadlineDefinitionIds: [deadlineDefinitionId], filingProfileId, calendarProfileId, suspensionProfileId, gateIds: [], legalOverrideIds: [],
    implementationScope: 'followup', uiExposure: 'visible', sourceRefs
  });
}
catalog.blockedMappings = reference.mappings.filter(item => item.disposition === 'blocked').map(mapping => ({
  mappingId: mapping.id, sourceRefs: mapping.sourceIds.map(id => ref(id, 'Abgrenzung gemäss AP17B-Anwendbarkeitsmatrix'))
}));
writeJson(join(target, 'special-regimes/vrpg-be.json'), catalog);
const manifest = {
  ...baseManifest, releaseId, releaseStatus: 'candidate', createdOn: '2026-09-12',
  specialRegimeCatalogIds: [catalog.catalogId],
  sourceSummary: {
    latestReviewedOn: '2026-09-12', legalBasisReviewStatus: 'verified', technicalValidationStatus: 'passed',
    sourceIds: [...new Set([...baseManifest.sourceSummary.sourceIds, ...catalog.sources.map(source => source.sourceId)])].sort()
  },
  extensions: {
    'steimer.candidate': {
      preparedOn: '2026-09-12', preparedWith: 'Codex', workPackage: 'AP17C', approvalRequired: true, baseReleaseId,
      referenceCorpusSha256: corpusHash,
      scope: '16 qualifizierte Zuordnungen, neue Fallabdeckung 2026-01-01 bis 2027-12-31, kein gesetzliches Ausserkrafttreten am Abdeckungsende',
      componentContractProposal: 'Spezialregimekatalog 3.0.0, Manifest 3.0.0 und Kalender 2.0.0 unverändert',
      futureSourceComparison: {
        checkedOn: '2026-09-12',
        sourceIds: ['SRC-AP17C-IVG-20270101', 'SRC-AP17C-AHVG-20270101', 'SRC-AP17C-IVV-20270701'],
        finding: 'Angekündigte Fassungen artikelbezogen verglichen, Zielnormen unverändert. Vergleichsbelege, keine zusätzlich angewendeten Normen.'
      },
      humanIntegrationApproval: null, productionActivation: false
    }
  },
  artifacts: baseManifest.artifacts.map(artifact => {
    const path = join(target, artifact.path);
    return {
      ...artifact,
      ...(artifact.role === 'specialRegimeCatalog' ? { contentId: catalog.catalogId, schemaId } : {}),
      byteLength: statSync(path).size, sha256: hash(path)
    };
  })
};
writeJson(join(target, 'manifest.json'), manifest);
console.log(`BUILT ${releaseId}: 16 mappings, 4 blocked paths, candidate only`);
