// SPDX-License-Identifier: AGPL-3.0-only
// AP18B-01 review data only. No application provider, release approval or geocoder.
import { isDeepStrictEqual } from 'node:util';
import { createPilotModel, validateModel, REVIEW_DATE } from './ap18a-model.mjs';
import { BJ_HINTS_URL, createAreaAssignments, validateAreaAssignments } from './ap18a-area-assignments.mjs';

const ARG_SOURCE = 'SRC-AG-EGARR-20250901';
const ZPO_SOURCE = 'SRC-AG-EGZPO';
const AWA_SOURCE = 'SRC-AG-AWA-FEIERTAGE';
const FROM = '2026-01-01';
const common = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY',
  'ASCENSION', 'WHIT-MONDAY', 'CHRISTMAS', 'ST-STEPHEN'];
const catholic = ['NEW-YEAR', 'GOOD-FRIDAY', 'ASCENSION', 'CORPUS-CHRISTI',
  'ASSUMPTION', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN'];
const catholicImmaculate = catholic.filter(key => key !== 'ST-STEPHEN').concat('IMMACULATE-CONCEPTION');

// These lists transcribe the eight norm branches. Identical patterns remain separate
// profiles because they have different territorial membership and legal locators.
const PROFILE_SEEDS = [
  { branch: 'a', scopeId: 'AG-ARG-AARAU-BRUGG-KULM-LENZBURG-ZOFINGEN', kind: 'labour',
    de: 'Bezirke Aarau, Brugg, Kulm, Lenzburg und Zofingen', holidayKeys: common,
    locator: '§ 6 Abs. 1 Bst. a', sourceId: ARG_SOURCE, areaType: 'Bezirk',
    members: ['Aarau', 'Brugg', 'Kulm', 'Lenzburg', 'Zofingen'] },
  { branch: 'b1', scopeId: 'AG-ARG-BERGDIETIKON', kind: 'labour',
    de: 'Gemeinde Bergdietikon', holidayKeys: common,
    locator: '§ 6 Abs. 1 Bst. b Ziff. 1', sourceId: ARG_SOURCE, areaType: 'Gemeinde', members: ['Bergdietikon'] },
  { branch: 'b2', scopeId: 'AG-ARG-BADEN', kind: 'labour',
    de: 'Bezirk Baden ohne Bergdietikon', holidayKeys: common.filter(key => key !== 'BERCHTOLD').concat('CORPUS-CHRISTI'),
    locator: '§ 6 Abs. 1 Bst. b Ziff. 2', sourceId: ARG_SOURCE, areaType: 'Bezirk', members: ['Baden'] },
  { branch: 'c', scopeId: 'AG-ARG-BREMGARTEN', kind: 'labour',
    de: 'Bezirk Bremgarten', holidayKeys: catholic,
    locator: '§ 6 Abs. 1 Bst. c', sourceId: ARG_SOURCE, areaType: 'Bezirk', members: ['Bremgarten'] },
  { branch: 'd', scopeId: 'AG-ARG-LAUFENBURG-MURI', kind: 'labour',
    de: 'Bezirke Laufenburg und Muri', holidayKeys: catholicImmaculate,
    locator: '§ 6 Abs. 1 Bst. d', sourceId: ARG_SOURCE, areaType: 'Bezirk', members: ['Laufenburg', 'Muri'] },
  { branch: 'e1', scopeId: 'AG-ARG-RHEINFELDEN-E1', kind: 'labour',
    de: 'Rheinfelden, Gemeindegruppe nach Ziff. 1', holidayKeys: catholicImmaculate,
    locator: '§ 6 Abs. 1 Bst. e Ziff. 1', sourceId: ARG_SOURCE, areaType: 'Gemeinde',
    members: ['Hellikon', 'Mumpf', 'Obermumpf', 'Schupfart', 'Stein', 'Wegenstetten'] },
  { branch: 'e2', scopeId: 'AG-ARG-RHEINFELDEN-E2', kind: 'labour',
    de: 'Rheinfelden, Gemeindegruppe nach Ziff. 2',
    holidayKeys: common.filter(key => key !== 'BERCHTOLD').concat('ALL-SAINTS'),
    locator: '§ 6 Abs. 1 Bst. e Ziff. 2', sourceId: ARG_SOURCE, areaType: 'Gemeinde',
    members: ['Kaiseraugst', 'Magden', 'Möhlin', 'Olsberg', 'Rheinfelden', 'Wallbach', 'Zeiningen', 'Zuzgen'] },
  { branch: 'f', scopeId: 'AG-ARG-ZURZACH', kind: 'labour',
    de: 'Bezirk Zurzach', holidayKeys: ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'ASCENSION',
      'CORPUS-CHRISTI', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN'],
    locator: '§ 6 Abs. 1 Bst. f', sourceId: ARG_SOURCE, areaType: 'Bezirk', members: ['Zurzach'] },
  { branch: 'zpo', scopeId: 'AG-ZPO-ALL', kind: 'procedural', de: 'Aargau, prozessuale Zuordnung',
    holidayKeys: ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'MAY1', 'ASCENSION',
      'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'ALL-SAINTS',
      'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'],
    locator: '§ 21', sourceId: ZPO_SOURCE, areaType: 'Kanton', members: ['Aargau'] }
];

const fixed = (month, day) => ({ type: 'fixedMonthDay', month, day });
const easter = offsetDays => ({ type: 'easterOffsetDays', offsetDays });
const definition = (de, fr, calculation) => ({ labels: { de, fr }, calculation });
const HOLIDAY_DEFINITIONS = {
  'NEW-YEAR': definition('Neujahr', 'Nouvel An', fixed(1, 1)),
  BERCHTOLD: definition('Berchtoldstag', 'Saint-Berchtold', fixed(1, 2)),
  'GOOD-FRIDAY': definition('Karfreitag', 'Vendredi saint', easter(-2)),
  EASTER: definition('Ostern', 'Pâques', easter(0)),
  'EASTER-MONDAY': definition('Ostermontag', 'Lundi de Pâques', easter(1)),
  MAY1: definition('Tag der Arbeit (1. Mai)', 'Fête du travail (1er mai)', fixed(5, 1)),
  ASCENSION: definition('Auffahrt', 'Ascension', easter(39)),
  PENTECOST: definition('Pfingsten', 'Pentecôte', easter(49)),
  'WHIT-MONDAY': definition('Pfingstmontag', 'Lundi de Pentecôte', easter(50)),
  'CORPUS-CHRISTI': definition('Fronleichnam', 'Fête-Dieu', easter(60)),
  'NATIONAL-DAY': definition('Bundesfeiertag', 'Fête nationale', fixed(8, 1)),
  ASSUMPTION: definition('Mariä Himmelfahrt', 'Assomption', fixed(8, 15)),
  'FEDERAL-FAST': definition('Eidgenössischer Dank-, Buss- und Bettag', 'Jeûne fédéral',
    { type: 'nthWeekdayOfMonth', month: 9, isoWeekday: 7, occurrence: 3 }),
  'ALL-SAINTS': definition('Allerheiligen', 'Toussaint', fixed(11, 1)),
  'IMMACULATE-CONCEPTION': definition('Mariä Empfängnis', 'Immaculée Conception', fixed(12, 8)),
  CHRISTMAS: definition('Weihnachten', 'Noël', fixed(12, 25)),
  'ST-STEPHEN': definition('Stephanstag', 'Saint-Étienne', fixed(12, 26))
};

function ruleId(profile, key) {
  if (profile.branch === 'b1' && key === 'BERCHTOLD') return 'AG-WORK-HOL-BERCHTOLD';
  if (profile.branch === 'b2' && key === 'CORPUS-CHRISTI') return 'AG-WORK-HOL-CORPUS-CHRISTI';
  if (profile.kind === 'procedural') return `AG-PROC-DAY-${key}`;
  return `AG-WORK-HOL-${profile.branch.toUpperCase()}-${key}`;
}

function keyForReference(rule) {
  const match = Object.entries(HOLIDAY_DEFINITIONS).find(([, item]) =>
    item.labels.de === rule.de && item.labels.fr === rule.fr
    && isDeepStrictEqual(item.calculation, rule.calculation));
  if (!match) throw new Error(`Unknown existing holiday reference: ${rule.id}`);
  return match[0];
}

function addedScope(profile) {
  return [profile.scopeId, 'CH-AG', profile.de,
    profile.members.length > 1 ? 'Gebietsgruppe' : profile.areaType,
    `${profile.locator} EG ArR. Nur arbeitsrechtlicher Feiertagsgeltungsbereich, kein allgemeiner Fristenkalender.`,
    profile.sourceId, profile.locator, 'open', FROM, null];
}

function expectedAssignments(model) {
  const rows = createAreaAssignments(model);
  let index = 0;
  for (const profile of PROFILE_SEEDS.filter(item => item.kind === 'labour' && !['b1', 'b2'].includes(item.branch))) {
    for (const name of profile.members) {
      const prefix = profile.areaType === 'Bezirk' ? 'BEZIRK' : 'GEMEINDE';
      const slug = name.replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ä', 'ae').toUpperCase();
      rows.push({
        id: `AREA-AP18B-AG-${String(++index).padStart(2, '0')}`,
        scopeId: profile.scopeId, areaId: `GEO-AG-${prefix}-${slug}`,
        de: `${profile.areaType} ${name}`, fr: '', it: '', rm: '', areaType: profile.areaType,
        // Nearest recorded enclosing area. This does not claim immediate administrative parentage.
        parentAreaId: 'GEO-AG', effect: 'include', officialIdSystem: '', officialId: '',
        from: FROM, to: null, sourceId: profile.sourceId, locator: profile.locator, status: 'open',
        note: 'Normzweig aus § 6 EG ArR, fachliche Abnahme offen. Parent ist das nächste erfasste übergeordnete Gebiet, keine Feiertagsvererbung. Amtliche Kennung noch zu prüfen.'
      });
    }
  }
  return rows;
}

export async function createAgPackageModel(root) {
  const model = await createPilotModel(root);
  model.packageId = 'AP18B-01-AG';
  model.profiles = structuredClone(PROFILE_SEEDS);
  model.holidayDefinitions = structuredClone(HOLIDAY_DEFINITIONS);
  model.ruleKeys = Object.fromEntries(model.rules.map(rule => [rule.id, keyForReference(rule)]));
  model.jurisdictions.find(row => row[0] === 'CH-AG')[4] = 'Kantonspaket AP18B-01, Fachabnahme offen';
  model.sources.find(row => row[0] === 'SRC-BJ-FRISTENHINWEISE-20121217')[4] = BJ_HINTS_URL;
  model.sources.find(row => row[0] === ARG_SOURCE)[7] =
    'Alle acht Normzweige von § 6 Abs. 1 am 13.09.2026 vollständig abgeglichen, Fachabnahme offen';
  model.sources.find(row => row[0] === ZPO_SOURCE)[7] =
    'Alle 14 Tage von § 21 Abs. 1 am 13.09.2026 vollständig abgeglichen, Orts-/Profilanknüpfung und Freigabe offen';
  const zpoMapping = model.mappings.find(row => row[0] === 'MAP-AG-ZPO');
  zpoMapping[3] = 'Art. 142 Abs. 3 ZPO / § 21 Abs. 1 EG ZPO';
  zpoMapping[4] = 'Orts-/Profilanknüpfung und Freigabe offen';
  zpoMapping[5] = 'SAR 221.200 § 21 Abs. 1 / Art. 142 Abs. 3 ZPO';
  model.sources.push([AWA_SOURCE, 'CH-AG', 'Gesetzliche Feiertage im Kanton Aargau, AWA-Übersicht',
    'Amtliche Übersicht zu Art. 20a ArG und § 6 EG ArR',
    'https://www.ag.ch/media/kanton-aargau/dvi/dokumente/awa/awa/arbeitnehmerschutz-im-betrieb/feiertage.pdf',
    null, REVIEW_DATE, 'Undatiertes amtliches Merkblatt, am 13.09.2026 mit § 6 EG ArR abgeglichen', 'open', null]);
  for (const profile of PROFILE_SEEDS) {
    if (!model.scopes.some(scope => scope[0] === profile.scopeId)) model.scopes.push(addedScope(profile));
    for (const key of profile.holidayKeys) {
      const id = ruleId(profile, key);
      if (!model.rules.some(rule => rule.id === id)) {
        const holiday = HOLIDAY_DEFINITIONS[key];
        model.rules.push({ id, jurisdiction: 'CH-AG', scope: profile.scopeId,
          de: holiday.labels.de, fr: holiday.labels.fr,
          category: profile.kind === 'labour' ? 'labourLawHoliday' : 'proceduralEquivalentDay',
          calculation: structuredClone(holiday.calculation), from: FROM, to: null,
          source: profile.sourceId, locator: profile.locator, status: 'open',
          approvalBasis: null, priority: 100, action: 'add', target: null,
          exportClass: profile.kind === 'labour' ? 'blockedScope' : 'blockedEffect', reference: null });
      }
      model.ruleKeys[id] = key;
    }
    if (profile.kind === 'labour' && !model.mappings.some(mapping => mapping[1] === profile.scopeId)) {
      model.mappings.push([`MAP-AP18B-AG-${profile.branch.toUpperCase()}`, profile.scopeId,
        'labourLawHoliday', 'Arbeitsrecht, nicht pauschal Fristenrecht',
        'Keine automatische Übernahme in Fristenrechner', `SAR 961.200 ${profile.locator}`, 'blocked', null]);
    }
  }
  model.reviews.push(
    ['AP18B-AG-EGARR-20260913', ARG_SOURCE, 'newScope', REVIEW_DATE,
      'unchanged', null, 'Normtext gegenüber AP18A unverändert. Acht Normzweige von § 6 Abs. 1 jetzt vollständig erfasst',
      'candidate', 'David Steimer', 'Codex', 'Vollständigen Erfassungsumfang und räumliche Zuordnungen fachlich abnehmen'],
    ['AP18B-AG-EGZPO-20260913', ZPO_SOURCE, 'newScope', REVIEW_DATE,
      'unchanged', null, 'Normtext gegenüber AP18A unverändert. Liste der 14 Tage von § 21 Abs. 1 jetzt vollständig erfasst',
      'candidate', 'David Steimer', 'Codex', 'Vollständigen Erfassungsumfang sowie Orts-/Profilanknüpfung fachlich abnehmen'],
    ['AP18B-AG-AWA-20260913', AWA_SOURCE, 'newScope', REVIEW_DATE,
    'unclear', null, 'Acht Normzweige gegen undatierte AWA-Übersicht abgeglichen, Quellenprüfung als Kandidat',
    'candidate', 'David Steimer', 'Codex', 'Fachabnahme des vollständigen AG-Erfassungsstands und Verfahrensanknüpfung offen']);
  model.assignments = expectedAssignments(model);
  validateAgPackageModel(model);
  return model;
}

export function validateAgPackageModel(model) {
  validateModel(model);
  if (model.packageId !== 'AP18B-01-AG') throw new Error('Unknown AG package');
  if (!isDeepStrictEqual(model.profiles, PROFILE_SEEDS)) throw new Error('Changed AG norm profiles');
  if (!isDeepStrictEqual(model.holidayDefinitions, HOLIDAY_DEFINITIONS)) throw new Error('Changed AG holiday definitions');
  const profileScopes = new Set(PROFILE_SEEDS.map(profile => profile.scopeId));
  if (model.scopes.length !== 11 || model.scopes.some(scope => !['CH-ALL', 'BE-ALL'].includes(scope[0]) && !profileScopes.has(scope[0]))) {
    throw new Error('Incomplete or extra AG scopes');
  }
  const agRules = model.rules.filter(rule => rule.jurisdiction === 'CH-AG');
  if (model.rules.length !== 90 || agRules.length !== 78
    || agRules.filter(rule => rule.category === 'labourLawHoliday').length !== 64
    || agRules.filter(rule => rule.category === 'proceduralEquivalentDay').length !== 14) throw new Error('Incorrect AG rule coverage');
  const allowed = status => ['open', 'blocked'].includes(status);
  if (!allowed(model.jurisdictions.find(row => row[0] === 'CH-AG')[5])) throw new Error('Unapproved AG jurisdiction claimed as approved');
  const agSources = new Set(model.sources.filter(row => row[1] === 'CH-AG').map(row => row[0]));
  if (agSources.size !== 3 || [ARG_SOURCE, ZPO_SOURCE, AWA_SOURCE].some(id => !agSources.has(id))) {
    throw new Error('Missing or reassigned AG sources');
  }
  for (const source of model.sources.filter(row => row[1] === 'CH-AG')) {
    if (!allowed(source[8]) || source[9] !== null) throw new Error('Unapproved AG source claimed as approved');
  }
  for (const scope of model.scopes.filter(row => row[1] === 'CH-AG')) {
    const profile = PROFILE_SEEDS.find(item => item.scopeId === scope[0]);
    if (!profile || !allowed(scope[7]) || scope[5] !== profile.sourceId
      || scope[6] !== profile.locator || scope[8] !== FROM || scope[9] !== null) throw new Error('Changed AG scope contract');
  }
  for (const mapping of model.mappings.filter(row => profileScopes.has(row[1]))) {
    if (!allowed(mapping[6]) || mapping[7] !== null) throw new Error('Unapproved AG mapping claimed as approved');
  }
  for (const profile of PROFILE_SEEDS) {
    if (model.mappings.filter(row => row[1] === profile.scopeId).length !== 1) throw new Error('Missing or repeated AG process mapping');
    const scoped = agRules.filter(rule => rule.scope === profile.scopeId);
    if (scoped.length !== profile.holidayKeys.length) throw new Error('Incomplete AG norm branch');
    for (const key of profile.holidayKeys) {
      const id = ruleId(profile, key);
      const rule = scoped.find(item => item.id === id);
      const holiday = HOLIDAY_DEFINITIONS[key];
      if (!rule || model.ruleKeys[id] !== key || rule.de !== holiday.labels.de || rule.fr !== holiday.labels.fr
        || !isDeepStrictEqual(rule.calculation, holiday.calculation)
        || rule.source !== profile.sourceId || rule.locator !== profile.locator
        || rule.from !== FROM || rule.to !== null || !allowed(rule.status)
        || rule.approvalBasis !== null || rule.reference !== null
        || rule.category !== (profile.kind === 'labour' ? 'labourLawHoliday' : 'proceduralEquivalentDay')
        || rule.exportClass !== (profile.kind === 'labour' ? 'blockedScope' : 'blockedEffect')) {
        throw new Error(`Invalid or unapproved AG rule: ${id}`);
      }
    }
  }
  if (Object.keys(model.ruleKeys).length !== model.rules.length
    || model.rules.some(rule => model.ruleKeys[rule.id] !== keyForReference(rule))) throw new Error('Inconsistent AG holiday keys');
  for (const review of model.reviews.filter(row => agSources.has(row[1]) || row[0].startsWith('AP18B'))) {
    if (review[7] !== 'candidate') throw new Error('Unapproved AG review claimed as approved');
  }
  for (const [id, source, outcome] of [['AP18B-AG-EGARR-20260913', ARG_SOURCE, 'unchanged'],
    ['AP18B-AG-EGZPO-20260913', ZPO_SOURCE, 'unchanged'], ['AP18B-AG-AWA-20260913', AWA_SOURCE, 'unclear']]) {
    const review = model.reviews.find(row => row[0] === id);
    if (!review || review[1] !== source || review[3] !== REVIEW_DATE || review[4] !== outcome) {
      throw new Error('Missing or changed AG review candidate');
    }
  }
  validateAreaAssignments(model.assignments, model);
  const expected = expectedAssignments(model);
  if (model.assignments.length !== 29 || expected.some(row => {
    const actual = model.assignments.find(item => item.id === row.id);
    return !actual || Object.keys(row).some(key => key === 'status'
      ? !allowed(actual[key]) : !isDeepStrictEqual(actual[key], row[key]));
  })) throw new Error('Changed AG territorial assignments');
  return true;
}
