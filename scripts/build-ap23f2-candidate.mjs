// SPDX-License-Identifier: AGPL-3.0-only
// Deterministic structural proposal only. No product imports or release promotion.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AP23F2_SCHEMA_IDS } from './build-ap23f2-schemas.mjs';

export const AP23F2_ROOT = fileURLToPath(new URL('../', import.meta.url));
export const AP23F2_BASE = 'data/releases/2026-10-18-mvp-09-approved.1';
export const AP23F2_OUTPUT = 'outputs/ap23f2-candidate-2026-10-22';
export const AP23F2_RELEASE_ID = '2026-10-22-ap23f2-reference.1';
export const AP23F2_ADMIN_PATH = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23F2_RESEARCH_PATH = 'docs/fachrecht/ap23f1/referenzfaelle.json';
export const AP23F2_ACCEPTANCE_PATH = 'docs/fachrecht/abnahme-ap23f1.md';
export const AP23F2_NEW_CALENDAR_ID = 'ap23f2-zh-rlg-nine';
export const AP23F2_NEW_CALENDAR_PATH = `calendars/${AP23F2_NEW_CALENDAR_ID}.json`;
export const AP23F2_BASE_MANIFEST_SHA256 = '3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265';
export const AP23F2_BASE_CATALOG_SHA256 = 'dc38ce060ef46720b0a833efab54dc569f2ded4397fef9eaa7874b88a6927115';
export const AP23F2_RESEARCH_SHA256 = 'cca05cfc359a09eda399f6ee8070ad96c0186f87bbc1259595a4cff2a9287548';
export const rawSha256 = value => createHash('sha256').update(value).digest('hex');
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export const objectSha256 = value => rawSha256(canonicalJson(value));
export const encode = value => JSON.stringify(value, null, 2) + '\n';
const read = path => readFile(resolve(AP23F2_ROOT, path), 'utf8');
const source = (code, url, versionDescription, locators, kind = 'statute') => ({
  sourceId: `SRC-AP23F1-${code}`, kind, url, versionDescription, reviewedOn: '2026-10-22',
  reviewBasis: 'AP23F1 fachlich abgenommen. Neue Verwaltungsverwendung, keine zusammengeführte Releasequellenfreigabe.', locators
});
const sources = [
  source('ZH-VRG-20260701', 'https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/34678345513989FAC1258E210026B3D8/%24File/175.2_24.5.59_133.pdf', 'Nachtrag 133, Kopf 01.07.2026', '§§ 11–12, 19–22, 41, 53, 70–71'),
  source('ZH-RLG-20040701', 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/wirtschaft-arbeit/arbeitsbedingungen/lohn-arbeitsbedingungen/arbeitsinspektorat/ruhetags_und_ladenoeffnungsgesetz.pdf', 'Nachtrag 45, Kopf 01.07.2004, materieller Stichtag getrennt', '§ 1'),
  source('ZH-GOG-20260101', 'https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/43B3BDA36DB02CBDC1258D4C004EC591/%24File/211.1_10.5.10_131.pdf', 'Nachtrag 131, 01.01.2026', '6. Teil, 1. Abschnitt, § 122'),
  source('ZH-VRG-REVISION-20270101', 'https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/D35EB0BD1EC395C1C1258BB80026103B/%24File/175.2.pdf', 'Beschluss 30.10.2023, Inkraftsetzung gemäss RRB 715/2025 auf 01.01.2027 verschoben', '§§ 10a, 11 Abs. 2–4, 12 Abs. 3, Übergangsbestimmung'),
  source('ZH-RRB715-2025', 'https://www.zh.ch/bin/zhweb/publish/regierungsratsbeschluss-unterlagen./2025/715/RRB-2025-0715.pdf', 'RRB 715 vom 02.07.2025', 'Dispositiv I, Inkraftsetzung 01.01.2027', 'officialMaterials'),
  source('CH-ZPO-20260701', 'https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2010/262/20260701/de/xml/fedlex-data-admin-ch-eli-cc-2010-262-20260701-de-xml.xml', '01.07.2026, frischer amtlicher XML-Text bytegleich zum 18.10.2026', 'Art. 142–143, 145–146, 248'),
  source('AG-VRPG-20240701', 'https://gesetzessammlungen.ag.ch/api/de/versions/3449/pdf_file', '01.07.2024, Version 3449', '§§ 26–28, 44, 50, 54, 76–83'),
  source('AG-EGZPO-20220101', 'https://gesetzessammlungen.ag.ch/api/de/versions/3615/pdf_file', '01.01.2022, Version 3615', '§§ 1–2, 21'),
  source('AG-EGARR-20250901', 'https://gesetzessammlungen.ag.ch/api/de/versions/3837/pdf_file', '01.09.2025, Version 3837, nur Gegenprobe', '§ 6'),
  source('AG-WBE2024299-20250331', 'https://decwork.ag.ch/api/main/v1/de/decrees_pdf/10721', '31.03.2025', 'E. I.1.1–I.2.2.2.1', 'judgment'),
  source('SG-VRP-20240101', 'https://www.gesetzessammlung.sg.ch/api/de/versions/3574/pdf_file', '01.01.2024, Version 3574', 'Art. 30, 41quater, 44, 47–48, 59–64'),
  source('SG-RLG-20080122', 'https://www.gesetzessammlung.sg.ch/api/de/versions/228/pdf_file', '22.01.2008, Version 228', 'Art. 2–3'),
  source('SG-GERG-20180701', 'https://www.gesetzessammlung.sg.ch/api/de/versions/2403/pdf_file', '01.07.2018 bis 31.05.2027, Version 2403', 'Gerichtsorganisation'),
  source('SG-GERG-20270601', 'https://www.gesetzessammlung.sg.ch/api/de/versions/3908/pdf_file', 'Publizierte Fassung ab 01.06.2027, Version 3908', 'Art. 24bis, 25, 26 und 29, keine Änderung der verwendeten Tagesarithmetik'),
  source('SG-OEFFG-20230701', 'https://www.gesetzessammlung.sg.ch/api/de/versions/3516/pdf_file', '01.07.2023, Version 3516', 'Art. 17–18, keine Übernahme der vorgelagerten Fristen')
];
const ref = (code, locator) => {
  const found = sources.find(item => item.sourceId === `SRC-AP23F1-${code}`);
  assert.ok(found, code);
  return { sourceId: found.sourceId, locator: locator ?? found.locators };
};
const definitions = {
  ZH: { lawId: 'vrg-zh', title: 'Verwaltungsrechtspflegegesetz, LS 175.2', law: 'ZH-VRG-20260701', locator: '§§ 11–12, 19–22, 41, 53, 70–71' },
  AG: { lawId: 'vrpg-ag', title: 'Verwaltungsrechtspflegegesetz, SAR 271.200', law: 'AG-VRPG-20240701', locator: '§§ 28, 44, 50, 54, 83' },
  SG: { lawId: 'vrp-sg', title: 'Gesetz über die Verwaltungsrechtspflege, sGS 951.1', law: 'SG-VRP-20240101', locator: 'Art. 30, 41quater, 44, 47–48, 59–64' }
};
export const AP23F2_ZH_RULE_IDS = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'NATIONAL-DAY', 'CHRISTMAS', 'ST-STEPHEN', 'MAY1'].map(suffix => `ZH-RLG-ALL-DAY-${suffix}`);
const periodSpecs = prefix => [
  { periodId: `${prefix}-easter`, start: { type: 'easterOffset', days: -7, yearOffset: 0 }, end: { type: 'easterOffset', days: 7, yearOffset: 0 }, inclusive: true },
  { periodId: `${prefix}-summer`, start: { type: 'fixedMonthDay', month: 7, day: 15, yearOffset: 0 }, end: { type: 'fixedMonthDay', month: 8, day: 15, yearOffset: 0 }, inclusive: true },
  { periodId: `${prefix}-winter`, start: { type: 'fixedMonthDay', month: 12, day: 18, yearOffset: 0 }, end: { type: 'fixedMonthDay', month: 1, day: 2, yearOffset: 1 }, inclusive: true }
];
function timeline(path, coverage) {
  const documentAccess = path.id.startsWith('SG-VRK-');
  const segment = (from, to, refs) => ({ interval: { from, to }, sourceRefs: refs });
  if (path.canton === 'ZH') {
    const court = path.stages.includes('court');
    const governing = [ref('ZH-VRG-20260701', court ? '§§ 11–12, 53, 70–71' : '§§ 11–12, 19–22'),
      ...(court ? [ref('ZH-GOG-20260101', '§ 122'), ref('CH-ZPO-20260701', 'Art. 145–146 über VRG § 71, keine allgemeine Verwaltungsverweisung')]
        : [ref('ZH-RLG-20040701', '§ 1, Verwaltungs-/Rekursbindung ohne allgemeine ZPO-Verweisung')])];
    return [segment(coverage.from, '2026-12-31', governing),
      segment('2027-01-01', coverage.to, [...structuredClone(governing), ref('ZH-VRG-REVISION-20270101'), ref('ZH-RRB715-2025')])];
  }
  if (path.canton === 'AG') return [segment(coverage.from, coverage.to, [ref('AG-VRPG-20240701'), ref('CH-ZPO-20260701'), ref('AG-EGZPO-20220101')])];
  const matter = documentAccess ? [ref('SG-OEFFG-20230701')] : [];
  return [segment(coverage.from, '2027-05-31', [ref('SG-VRP-20240101'), ref('SG-GERG-20180701'), ref('CH-ZPO-20260701'), ref('SG-RLG-20080122'), ...matter]),
    segment('2027-06-01', coverage.to, [ref('SG-VRP-20240101'), ref('SG-GERG-20270601'), ref('CH-ZPO-20260701'), ref('SG-RLG-20080122'), ...matter])];
}
export function f2Requirements(path) {
  const ordered = path.days === null, vrk = path.id.startsWith('SG-VRK-');
  const agExecution = path.id === 'AG-EXECUTION-10', sgMeasures = path.id === 'SG-ADMIN-MEASURES-5', sgInterim = path.id === 'SG-COURT-INTERIM-5';
  return { action: agExecution ? 'executionAppeal' : sgMeasures ? 'measuresAppeal' : sgInterim ? 'interimAppeal' : ordered ? 'proceduralSubmission' : 'ordinaryAppeal',
    decisionKind: agExecution ? 'qualifiedAGVRPG83ExecutionOrder' : sgMeasures ? 'qualifiedSGVRP44MeasuresOrder' : sgInterim ? 'qualifiedSGVRP60InterimOrder' : ordered ? 'notApplicable' : 'finalDecision',
    unit: 'day', opening: 'qualifiedCompleteActualDelivery', notice: 'uncontested', termChange: 'none', urgency: 'none',
    targetBody: vrk ? 'administrativeAppealsCommission' : path.stages.includes('court') ? 'administrativeCourt' : 'cantonAdministrativeAuthority',
    procedureMatter: vrk ? 'documentAccess' : 'generalAdministrative', channelCase: path.canton === 'ZH' ? 'ordinaryNoFictionNoOutage' : 'notApplicable',
    exceptionNotice: sgInterim ? 'correctExceptionNotice' : 'notApplicable' };
}
function makeNewCalendar(holidayCatalog, catalogHash) {
  const selected = AP23F2_ZH_RULE_IDS.map(id => holidayCatalog.data.rules.find(row => row.id === id));
  assert.equal(selected.filter(Boolean).length, 9);
  const sourceIds = [...new Set(selected.map(row => row.source))];
  const calendar = {
    $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json',
    formatVersion: '3.0.0', dataKind: 'calendar', calendarId: AP23F2_NEW_CALENDAR_ID,
    jurisdiction: { level: 'cantonal', code: 'ZH' }, validity: { from: '2026-08-29', to: '2027-12-31' }, inherits: ['ch-federal-calendar'],
    review: { reviewedOn: '2026-10-22', status: 'candidate', reviewedBy: 'Codex', basis: 'AP23F1 fachlich abgenommen, isolierte AP23F2-Strukturprojektion. Keine Katalogaktivierung oder Releasequellenfreigabe.' },
    sources: sourceIds.map(id => {
      const item = holidayCatalog.data.sources.find(row => row.id === id);
      assert.ok(item);
      return { sourceId: item.id, sourceType: 'officialDossier', title: item.title, authority: item.jurisdiction,
        url: item.url, documentVersionDate: item.versionOn, reviewedOn: item.retrievedOn, reviewStatus: 'monitored' };
    }),
    rules: selected.map(row => ({ ruleId: `ZH-CAL-AP23F2-${row.id}`, calendarId: AP23F2_NEW_CALENDAR_ID,
      jurisdiction: { level: 'cantonal', code: 'ZH' }, labelKey: `holiday.zh.${row.id}`, labels: { de: row.de, fr: row.fr },
      priority: row.priority, validity: { from: row.from, to: row.to }, sourceRefs: [{ sourceId: row.source, locator: row.locator }],
      calculation: structuredClone(row.calculation), condition: row.condition,
      effect: { type: 'holiday', kind: row.id.endsWith('NATIONAL-DAY') ? 'federalHoliday' : 'cantonalPublicHoliday', legalEffect: 'nonWorkingDayEquivalentToSunday', resultIdSuffix: row.id } })),
    projection: { catalogId: 'ch-holiday-catalog', catalogFormatVersion: '2.0.0', projectionId: 'projection-ap23f2-zh-rlg-nine', sourceHash: catalogHash }
  };
  return calendar;
}

export async function buildAP23F2Candidate() {
  const baselineManifestText = await read(`${AP23F2_BASE}/manifest.json`);
  assert.equal(rawSha256(baselineManifestText), AP23F2_BASE_MANIFEST_SHA256);
  const baselineManifest = JSON.parse(baselineManifestText), files = new Map();
  for (const entry of baselineManifest.artifacts) {
    const text = await read(`${AP23F2_BASE}/${entry.path}`);
    assert.equal(rawSha256(text), entry.sha256, entry.path);
    assert.equal(Buffer.byteLength(text), entry.byteLength, entry.path);
    files.set(entry.path, text);
  }
  assert.equal(files.size, 41);
  assert.equal(rawSha256(files.get(AP23F2_ADMIN_PATH)), AP23F2_BASE_CATALOG_SHA256);
  const baselineCatalog = JSON.parse(files.get(AP23F2_ADMIN_PATH));
  const researchText = await read(AP23F2_RESEARCH_PATH);
  assert.equal(rawSha256(researchText), AP23F2_RESEARCH_SHA256);
  const research = JSON.parse(researchText);
  assert.equal(research.paths.length, 17);
  assert.equal(research.cases.length, 80);
  const acceptanceText = await read(AP23F2_ACCEPTANCE_PATH);
  assert.ok(acceptanceText.includes('fachlich abgenommen'));
  const sourceIndexPath = 'outputs/ap23f1-2026-10-22/sources-index.json', sourceIndexText = await read(sourceIndexPath);
  const holidayCatalogText = files.get('holiday-catalogs/ch-holiday-catalog.json');
  const holidayCatalog = JSON.parse(holidayCatalogText), holidayCatalogHash = rawSha256(holidayCatalogText);
  const calendar = makeNewCalendar(holidayCatalog, holidayCatalogHash);
  files.set(AP23F2_NEW_CALENDAR_PATH, encode(calendar));
  const catalog = structuredClone(baselineCatalog);
  catalog.$schema = AP23F2_SCHEMA_IDS.catalog;
  catalog.formatVersion = '3.0.0'; catalog.contractStatus = 'proposed'; catalog.runtimeActive = false;
  catalog.contractDecision = { id: 'DEC-2026-035', status: 'proposed', on: null };
  catalog.review = { basis: `AP23F1 fachlich abgenommen, ${AP23F2_ACCEPTANCE_PATH} SHA-256 ${rawSha256(acceptanceText)}. DEC-2026-035 ist technischer Vorschlag.`,
    sourceReview: 'F1-Nachweise für neue Verwaltungsverwendungen. Die kopierten MVP09-Komponenten behalten ihre historischen Nachweise. Keine zusammengeführte neue Releasequellenfreigabe.', checkedOn: '2026-10-22' };
  catalog.sources.push(...structuredClone(sources));
  for (const [canton, definition] of Object.entries(definitions)) {
    const prefix = canton.toLowerCase();
    catalog.laws.push({ lawId: definition.lawId, canton, title: definition.title,
      holidayPolicyReview: { explicitDeviation: 'noneIdentifiedInReviewedGeneralLaw', sourceRefs: [ref(definition.law, definition.locator)], projectDecisionRef: 'DEC-2026-031' },
      sourceRefs: [ref(definition.law, definition.locator)] });
    catalog.suspensionProfiles.push({ suspensionProfileId: `${prefix}-none`, lawId: definition.lawId, periods: [], sourceRefs: [ref(definition.law)] },
      { suspensionProfileId: `${prefix}-three`, lawId: definition.lawId, periods: periodSpecs(prefix), sourceRefs: [ref(definition.law), ref('CH-ZPO-20260701', 'Art. 145–146')] });
  }
  const newDescriptor = { path: AP23F2_NEW_CALENDAR_PATH, role: 'calendar', contentId: AP23F2_NEW_CALENDAR_ID,
    mediaType: 'application/json', schemaId: calendar.$schema, byteLength: Buffer.byteLength(files.get(AP23F2_NEW_CALENDAR_PATH)), sha256: rawSha256(files.get(AP23F2_NEW_CALENDAR_PATH)) };
  const descriptors = [...baselineManifest.artifacts, newDescriptor];
  const physicalRefs = calendarId => [calendarId, 'ch-federal-calendar', 'ch-holiday-catalog'].map(id => {
    const entry = descriptors.find(row => row.contentId === id); assert.ok(entry);
    return { role: entry.role, contentId: entry.contentId, path: entry.path, sha256: entry.sha256 };
  });
  for (const [holidayBindingId, canton, calendarId, legalRefs] of [
    ['zh-administration-authority-seat', 'ZH', AP23F2_NEW_CALENDAR_ID, [ref('ZH-VRG-20260701', '§ 11'), ref('ZH-RLG-20040701', '§ 1, begrenzte ZH-O2-Behandlung')]],
    ['zh-court-authority-seat', 'ZH', 'ap22-zh-5aa2974cffee', [ref('ZH-VRG-20260701', '§§ 70–71'), ref('ZH-GOG-20260101', '§ 122')]],
    ['ag-authority-seat', 'AG', 'ap22-ag-21d6f2634ce0', [ref('AG-VRPG-20240701', '§ 28'), ref('AG-EGZPO-20220101', '§§ 1–2, 21, ausdrücklich abgenommene neue VRPG-Verwendung')]],
    ['sg-authority-seat', 'SG', 'ap22-sg-79009d6d6021', [ref('SG-VRP-20240101', 'Art. 30'), ref('SG-RLG-20080122', 'Art. 2–3, kein 2. Januar als Feiertag')]]
  ]) {
    const localProjection = calendarId === AP23F2_NEW_CALENDAR_ID;
    catalog.holidayBindings.push({ holidayBindingId, lawId: definitions[canton].lawId, authoritySeatCanton: canton,
      authorityLevel: 'cantonal', anchor: 'authoritySeat', physicalBaseline: {
        releaseId: localProjection ? AP23F2_RELEASE_ID : baselineManifest.releaseId, calendarId,
        projectionId: JSON.parse(files.get(descriptors.find(row => row.contentId === calendarId).path)).projection.projectionId,
        references: physicalRefs(calendarId), eligibilityMeaning: 'physicalSourceOnlyNotFederalProcedurePermission' },
      legalBinding: { sourceRefs: legalRefs, projectDecisionRef: 'DEC-2026-031', roleUnion: false, partyOrRepresentativeRequired: false },
      ...(localProjection ? { projectionEvidence: { kind: 'localStructuralProjection', sourceReleaseId: baselineManifest.releaseId,
        sourceCatalogSha256: holidayCatalogHash, selectedRuleIds: [...AP23F2_ZH_RULE_IDS] } } : {}) });
  }
  for (const item of research.paths) {
    const definition = definitions[item.canton], prefix = item.canton.toLowerCase(), requirements = f2Requirements(item);
    const court = item.stages.includes('court') || item.stages.includes('vrk'), ordered = item.days === null;
    const coverage = { ...research.referenceWindow };
    const normTimeline = timeline(item, coverage);
    const governingRefs = [...new Map(normTimeline.flatMap(segment => segment.sourceRefs).map(reference => [reference.sourceId, reference])).values()];
    const path = { pathId: item.id.toLowerCase(), revision: 1, researchRef: item.id, lawId: definition.lawId,
      action: requirements.action === 'executionAppeal' ? 'execution-order-appeal' : requirements.action === 'measuresAppeal' ? 'measures-appeal'
        : requirements.action === 'interimAppeal' ? 'interim-court-appeal' : ordered ? (court ? 'ordered-court-submission' : 'ordered-administrative-submission')
          : court ? 'ordinary-court-appeal' : 'ordinary-administrative-appeal',
      stages: item.stages.map(stage => stage === 'recourse' ? 'administrativeAppeal' : stage === 'vrk' ? 'court' : stage),
      duration: ordered ? { kind: 'authorityOrderedDays', minimum: 1, maximum: 365, boundMeaning: 'technicalSafetyLimitNotLegalMaximum' }
        : { kind: 'statutoryDays', value: item.days, overridable: false },
      suspensionProfileId: `${prefix}-${item.suspension}`,
      holidayBindingId: item.canton === 'ZH' ? court ? 'zh-court-authority-seat' : 'zh-administration-authority-seat' : `${prefix}-authority-seat`,
      urgencyPolicy: 'notApplicable', endShiftPolicy: 'nextWorkingDay', endShiftGuard: item.suspension === 'three' ? 'blockWhenEnteringApplicableSuspension' : 'none',
      qualification: { delivery: 'qualifiedActualDelivery', authorityLevel: 'cantonal', generalRoute: 'qualified', specialLaw: 'excluded', fixedEndDate: false, deviatingStart: false, evidenceAdvance: false },
      temporalBinding: { caseCoverage: { ...coverage }, calculationCoverage: { ...coverage }, sourceCoverage: { ...coverage },
        evaluation: 'eachEvaluatedDayIncludingEndShift', futureNormAssumption: 'proposalAssumingContinuedApplicabilityNotFutureLegalVerification' },
      normTimeline, sourceRefs: [...governingRefs,
        ...(item.id === 'AG-EXECUTION-10' ? [ref('AG-WBE2024299-20250331')] : [])] };
    catalog.paths.push(path);
    catalog.qualificationPolicies.push({ pathId: path.pathId, pathRevision: path.revision, pathSha256: objectSha256(path), mode: 'qualifiedDayProcedureV3', requirements });
  }
  for (const [id, scope, reason] of [
    ['f1-o1-end-shift', 'Neue ZH-/AG-/SG-Pfade mit Stillstand', 'Abgenommene enge Sperrbehandlung für reine Endverschiebung in neu beginnenden Stillstand. Keine behauptete gesetzliche Sperrnorm.'],
    ['f1-zh-channel', 'Zürich ab 01.01.2027', 'Keine Berechnung ungeklärter elektronischer Abruffiktion oder besonderer Kanalstörungsfolgen.'],
    ['f1-sg-vrk-measures', 'Erster Massnahmenrekurs an SG-Verwaltungsrekurskommission', 'Nicht als positiver Fünftagespfad freigeprüft.'],
    ['f1-sg-final-execution', 'Weiterzug eines endgültigen SG-Vollstreckungsrekursentscheids', 'Kein automatischer weiterer Fünftagesweg nach Art. 44 Abs. 3.'],
    ['f1-sg-exception-notice', 'SG gerichtliche Ferienausnahme', 'Unklare oder widersprüchliche Ausnahmebelehrung ohne definitives Datum oder Export.'],
    ['f1-sg-oeffg-prior-request', 'Vorgelagertes Verlangen nach OeffG-Verfügung und weitere OeffG-Fristen', 'Nur Rechtsmittel gegen bereits formelle kantonale Departementsverfügung zum Dokumentenzugang und tatsächliche gerichtliche Eingaben sind positiv unterlegt.']
  ]) catalog.excludedPaths.push({ exclusionId: id, scope, reason });
  catalog.releaseBinding = { status: 'candidate', releaseId: null, approval: null, targetComponentRefs: [], sourceReviewRef: null,
    referenceSuiteRef: null, promotionRequirement: 'rebindExactTargetReleaseBytesAndApproveBeforeActivation',
    pathEligibility: catalog.paths.map(path => {
      const binding = catalog.holidayBindings.find(row => row.holidayBindingId === path.holidayBindingId);
      const suspension = catalog.suspensionProfiles.find(row => row.suspensionProfileId === path.suspensionProfileId);
      const policy = catalog.qualificationPolicies.find(row => row.pathId === path.pathId);
      return { status: 'candidate', pathId: path.pathId, pathRevision: path.revision, pathSha256: objectSha256(path), holidayBindingId: binding.holidayBindingId,
        holidayBindingSha256: objectSha256(binding), suspensionProfileId: suspension.suspensionProfileId, suspensionProfileSha256: objectSha256(suspension),
        qualificationPolicySha256: objectSha256(policy), caseCoverage: { ...path.temporalBinding.caseCoverage }, calculationCoverage: { ...path.temporalBinding.calculationCoverage },
        targetComponentRefs: [], sourceReviewRef: null, referenceSuiteRef: null };
    }) };
  for (const entry of [{ path: 'manifest.json', sha256: rawSha256(baselineManifestText) }, ...baselineManifest.artifacts])
    catalog.preserved.push({ path: `${AP23F2_BASE}/${entry.path}`, sha256: entry.sha256 });
  catalog.preserved.push({ path: AP23F2_RESEARCH_PATH, sha256: rawSha256(researchText) },
    { path: AP23F2_ACCEPTANCE_PATH, sha256: rawSha256(acceptanceText) }, { path: sourceIndexPath, sha256: rawSha256(sourceIndexText) });
  files.set(AP23F2_ADMIN_PATH, encode(catalog));
  const manifest = structuredClone(baselineManifest);
  Object.assign(manifest, { $schema: AP23F2_SCHEMA_IDS.localManifest, formatVersion: '10.0.0', releaseId: AP23F2_RELEASE_ID,
    releaseStatus: 'candidate', createdOn: '2026-10-22', calendarIds: [...baselineManifest.calendarIds, AP23F2_NEW_CALENDAR_ID] });
  manifest.compatibility.minimumConsumerFormatVersion = '10.0.0';
  manifest.sourceSummary = { latestReviewedOn: '2026-10-22', legalBasisReviewStatus: 'pending', technicalValidationStatus: 'pending',
    sourceIds: [...new Set([...files.values()].flatMap(text => (JSON.parse(text).sources ?? []).map(row => row.sourceId)))].sort() };
  manifest.artifacts = descriptors.map(entry => entry.path === AP23F2_ADMIN_PATH
    ? { ...entry, schemaId: catalog.$schema, byteLength: Buffer.byteLength(files.get(entry.path)), sha256: rawSha256(files.get(entry.path)) } : structuredClone(entry));
  manifest.extensions = { 'steimer.local-reference': { workPackage: 'AP23F2', structuralContractProbeOnly: true, productionActivation: false,
    sourceReleaseApproved: false, calendarExportEnabled: false, contractDecision: 'DEC-2026-035', contractDecisionStatus: 'proposed',
    baselineManifestSha256: AP23F2_BASE_MANIFEST_SHA256, acceptedResearchSha256: AP23F2_RESEARCH_SHA256,
    acceptanceSha256: rawSha256(acceptanceText), historicalPayloadPolicy: '40 existing artifacts are exact MVP09 bytes. Their embedded approvals remain historical. The added ZH projection is local structural evidence only and is absent from historical catalog activation. This is not a promoted, installable or runtime-readable bundle.' } };
  const manifestText = encode(manifest);
  const integrity = { kind: 'ap23f2-structural-contract-candidate', releaseId: AP23F2_RELEASE_ID, contractDecision: 'DEC-2026-035', contractStatus: 'proposed',
    releaseStatus: 'candidate', productionActivation: false, referenceOnly: true, runtimeReadable: false, calendarExportEnabled: false, sourceReview: 'pending',
    basedOn: [{ path: `${AP23F2_BASE}/manifest.json`, sha256: AP23F2_BASE_MANIFEST_SHA256 }, { path: `${AP23F2_BASE}/${AP23F2_ADMIN_PATH}`, sha256: AP23F2_BASE_CATALOG_SHA256 },
      { path: AP23F2_RESEARCH_PATH, sha256: rawSha256(researchText) }, { path: AP23F2_ACCEPTANCE_PATH, sha256: rawSha256(acceptanceText) }, { path: sourceIndexPath, sha256: rawSha256(sourceIndexText) }],
    counts: { artifacts: files.size, totalFilesIncludingManifest: files.size + 1, unchangedRawArtifacts: 40, totalPaths: catalog.paths.length,
      unchangedLegacyPaths: baselineCatalog.paths.length, newPaths: research.paths.length, laws: catalog.laws.length, suspensionProfiles: catalog.suspensionProfiles.length,
      holidayBindings: catalog.holidayBindings.length, qualificationPolicies: catalog.qualificationPolicies.length, physicalCalendars: manifest.calendarIds.length },
    manifest: { path: `${AP23F2_OUTPUT}/bundle/manifest.json`, byteLength: Buffer.byteLength(manifestText), sha256: rawSha256(manifestText) },
    artifacts: manifest.artifacts.map(entry => ({ path: `${AP23F2_OUTPUT}/bundle/${entry.path}`, byteLength: entry.byteLength, sha256: entry.sha256 })),
    buildScript: { path: 'scripts/build-ap23f2-candidate.mjs', sha256: rawSha256(await read('scripts/build-ap23f2-candidate.mjs')) } };
  return { catalog, manifest, files, manifestText, integrity, integrityText: encode(integrity), baselineCatalog, baselineManifest, research };
}
export async function materializeAP23F2Candidate(mode) {
  assert.ok(['write', 'check'].includes(mode));
  const result = await buildAP23F2Candidate();
  const rows = [...result.files].map(([path, text]) => [`${AP23F2_OUTPUT}/bundle/${path}`, text]);
  rows.push([`${AP23F2_OUTPUT}/bundle/manifest.json`, result.manifestText], [`${AP23F2_OUTPUT}/candidate-integrity.json`, result.integrityText]);
  for (const [path, text] of rows) {
    if (mode === 'write') { await mkdir(dirname(resolve(AP23F2_ROOT, path)), { recursive: true }); await writeFile(resolve(AP23F2_ROOT, path), text); }
    else assert.equal(await read(path), text, `Stale AP23F2 candidate ${path}`);
  }
  console.log(JSON.stringify({ mode, structuralOnly: true, runtimeReadable: false, counts: result.integrity.counts, manifestSha256: rawSha256(result.manifestText) }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(['--write', '--check'].includes(process.argv[2]), 'Use --write or --check');
  await materializeAP23F2Candidate(process.argv[2].slice(2));
}
