// SPDX-License-Identifier: AGPL-3.0-only
// Bounded, unapproved source package. No workbook writes or runtime activation.
import { REVIEW_DATE } from './ap18a-model.mjs';

const FROM = '2026-01-01';
const CH_SOURCE = 'SRC-BUNDESFEIERTAG-19940701';
const IDS = Object.freeze({
  vsRest: 'SRC-VS-RUHE-8222-20130301',
  vsRegulation: 'SRC-VS-RUHEREG-822200-19661202',
  vsLabour: 'SRC-VS-VEKARG-822100-20161001',
  vsJustice: 'SRC-VS-RPFLG-1731-20240101',
  vsPersonnel: 'SRC-VS-PERSONALBEZUEGE-1724-20260501',
  geLaw: 'SRC-GE-LJF-J145-19910101',
  geCalendar: 'SRC-GE-FEIERTAGE-INFO-20260429',
  geJudgment: 'SRC-BGER-7B32-2023-20230906',
  cantonNamesIt: 'SRC-AP18B03-VSGE-KANTONSNAMEN-IT',
  cantonNamesRm: 'SRC-AP18B03-VSGE-KANTONSNAMEN-RM'
});
const SCOPES = Object.freeze({ vs: 'VS-PUBLIC-ALL', vsAdditional: 'VS-LOJ-ADDITIONAL', ge: 'GE-OFFICIAL-ALL' });
const URLS = Object.freeze({
  [IDS.vsRest]: 'https://lex.vs.ch/api/de/versions/2105/pdf_file',
  [IDS.vsRegulation]: 'https://lex.vs.ch/api/fr/versions/2108/pdf_file',
  [IDS.vsLabour]: 'https://lex.vs.ch/api/de/versions/2103/pdf_file',
  [IDS.vsJustice]: 'https://lex.vs.ch/api/fr/versions/3260/pdf_file',
  [IDS.vsPersonnel]: 'https://lex.vs.ch/data/172.4/fr',
  [IDS.geLaw]: 'https://silgeneve.ch/legis/data/rsg_j1_45.htm',
  [IDS.geCalendar]: 'https://www.ge.ch/vacances-scolaires-jours-feries/jours-feries-officiels',
  [IDS.geJudgment]: 'https://search.bger.ch/ext/eurospider/live/it/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F06-09-2023-7B_32-2023&lang=it&type=show_document&zoom=NO',
  [IDS.cantonNamesIt]: 'https://www.swisstopo.admin.ch/it/scambio-di-geodati-tra-le-autorita',
  [IDS.cantonNamesRm]: 'https://www.gr.ch/RM/chantun/175-Jahre/Seiten/Epochen-in-Karten.aspx'
});
const JURISDICTION_LABELS = Object.freeze({
  'CH-VS': { it: 'Vallese', rm: 'Vallais' },
  'CH-GE': { it: 'Ginevra', rm: 'Genevra' }
});

const fixed = (month, day) => ({ type: 'fixedMonthDay', month, day });
const easter = offsetDays => ({ type: 'easterOffsetDays', offsetDays });
const HOLIDAYS = Object.freeze({
  'NEW-YEAR': { de: 'Neujahr', fr: 'Nouvel An', calculation: fixed(1, 1) },
  BERCHTOLD: { de: '2. Januar', fr: '2 janvier', calculation: fixed(1, 2) },
  'ST-JOSEPH': { de: 'Josefstag', fr: 'Saint-Joseph', calculation: fixed(3, 19) },
  'GOOD-FRIDAY': { de: 'Karfreitag', fr: 'Vendredi saint', calculation: easter(-2) },
  'EASTER-MONDAY': { de: 'Ostermontag', fr: 'Lundi de Pâques', calculation: easter(1) },
  ASCENSION: { de: 'Auffahrt', fr: 'Ascension', calculation: easter(39) },
  'WHIT-MONDAY': { de: 'Pfingstmontag', fr: 'Lundi de Pentecôte', calculation: easter(50) },
  'CORPUS-CHRISTI': { de: 'Fronleichnam', fr: 'Fête-Dieu', calculation: easter(60) },
  'NATIONAL-DAY': { de: 'Bundesfeiertag', fr: 'Fête nationale', calculation: fixed(8, 1) },
  ASSUMPTION: { de: 'Mariä Himmelfahrt', fr: 'Assomption', calculation: fixed(8, 15) },
  'ALL-SAINTS': { de: 'Allerheiligen', fr: 'Toussaint', calculation: fixed(11, 1) },
  'IMMACULATE-CONCEPTION': { de: 'Mariä Empfängnis', fr: 'Immaculée Conception', calculation: fixed(12, 8) },
  CHRISTMAS: { de: 'Weihnachten', fr: 'Noël', calculation: fixed(12, 25) },
  'ST-STEPHEN': { de: '26. Dezember (Stephanstag)', fr: '26 décembre (Saint-Étienne)', calculation: fixed(12, 26) },
  'GENEVA-FAST': { de: 'Genfer Bettag', fr: 'Jeûne genevois',
    calculation: { type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 1, offsetDays: 4 } },
  RESTORATION: { de: 'Wiederherstellung der Republik', fr: 'Restauration de la République', calculation: fixed(12, 31) }
});
const VS_KEYS = ['NEW-YEAR', 'ST-JOSEPH', 'ASCENSION', 'CORPUS-CHRISTI', 'NATIONAL-DAY',
  'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'];
const VS_ADDITIONAL_KEYS = ['BERCHTOLD', 'EASTER-MONDAY', 'WHIT-MONDAY', 'ST-STEPHEN'];
const GE_KEYS = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY',
  'NATIONAL-DAY', 'GENEVA-FAST', 'CHRISTMAS', 'RESTORATION'];

function source(id, jurisdiction, title, locator, version, note) {
  return [id, jurisdiction, title, locator, URLS[id], version, REVIEW_DATE, note, 'open', null];
}

function sources() {
  return [
    source(IDS.vsRest, 'CH-VS', 'Gesetz über die Ruhe an Sonn- und Feiertagen', 'SGS 822.2, Art. 1 und 2', '2013-03-01',
      'Kantonales Ruhegesetz. Gebotene Feiertage über Diözese und Reglement bestimmt. Keine Personalurlaubsliste und keine universelle Prozesszuordnung.'),
    source(IDS.vsRegulation, 'CH-VS', 'Ausführungsreglement zur Sonn- und Feiertagsruhe / Règlement d’exécution', 'SGS 822.200, Art. 1', '1966-12-02',
      'Acht namentliche Tage erhoben. Das französische notamment wird nicht als abschliessende diözesane Feiertagsvollerhebung umgedeutet. Bundesfeier separat aus SR 116. IT/RM nur provisorische gemeinsame Produktnamen.'),
    source(IDS.vsLabour, 'CH-VS', 'Verordnung zum kantonalen Arbeitsgesetz, VEkArG', 'SGS 822.100, Art. 7 Abs. 1', '2016-10-01',
      'Acht kantonale Sonntagsgleichstellungen im Sinne von Art. 20a ArG. Datumsgegenkontrolle der Grundliste, kein eigenständiger Nachweis der Prozesswirkung.'),
    source(IDS.vsJustice, 'CH-VS', 'Gesetz über die Rechtspflege, RPflG / Loi sur l’organisation de la Justice, LOJ', 'SGS 173.1, Art. 37 Abs. 1 Bst. a–c', '2024-01-01',
      'Aktuelle Version 3260, Änderung beschlossen 07.09.2023. Vier zusätzliche Tage nach Bst. c getrennt erfasst. Behörden-/Verfahrensbezug und Bundesrechtsvorrang bleiben vor Automatik zu prüfen.'),
    source(IDS.vsPersonnel, 'CH-VS', 'Loi fixant le traitement des employés de l’Etat du Valais', 'SGS 172.4, Art. 1 und 29', '2026-05-01',
      'Nur Abgrenzungsbeleg aus dem Personalbesoldungsrecht. Karfreitag, Personalhalbtage und zusätzliche arbeitsfreie Tage werden nicht als allgemeine Feiertage oder Prozessergänzungen übernommen.'),
    source(IDS.geLaw, 'CH-GE', 'Loi sur les jours fériés, LJF', 'RSG J 1 45, Art. 1 Abs. 1 und 2 sowie Fussnote a zu Bst. g', '1991-01-01',
      'Neun gesetzliche Feiertage. Sonntagsfolgetag nach Abs. 2 nur für nicht dem ArG unterstellte Unternehmen. Keine allgemeine Folgetagsautomatik. FR-Namen normnah, DE Produktnamen, IT/RM gemeinsame Namen nur provisorisch.'),
    source(IDS.geCalendar, 'CH-GE', 'Jours fériés officiels, amtliche Jahresübersicht', 'Jahreslisten 2026, 2027 und 2028, Informationsseite', '2026-04-29',
      'Datumskontrolle, kein Normfassungsdatum. Textliche Folgetagshinweise nicht über den begrenzten Anwendungsbereich von Art. 1 Abs. 2 LJF hinaus verallgemeinern.'),
    source(IDS.geJudgment, 'CH', 'Bundesgericht, Urteil 7B_32/2023 vom 6. September 2023', 'E. 4.3.2, 4.4 und 5.2', '2023-09-06',
      'Entscheiddatum, kein Normstand. Im vorgängigen Modellcheck amtlich abgeglichener Volltext. Erneuter Entscheidsuche-Abruf im Erfassungsteil toolseitig gesperrt. Konkreter StPO-Fall, kantonale Auslegung unter Willkürmassstab, keine Aussage zu sämtlichen Prozessordnungen.'),
    source(IDS.cantonNamesIt, 'CH', 'swisstopo, Scambio di geodati tra le autorità', 'Liste der Kantone: Ginevra und Vallese', '2024-01-08',
      'Publikationsdatum der Informationsseite, kein Normstand. Amtlicher IT-Sprachbeleg ausschliesslich für die Kantonsnamen, keine Feiertags- oder Prozessgrundlage.'),
    source(IDS.cantonNamesRm, 'CH-GR', 'Kanton Graubünden, Epocas en chartas geograficas', 'Abschnitt 1814/1815: chantuns Genevra, Vallais e Neuchâtel', null,
      'Amtlicher RG-Sprachbeleg ausschliesslich für die Kantonsnamen Genevra und Vallais. Historische Kartendarstellung, kein Feiertagsrecht und kein normativer Fassungsstand.')
  ];
}

function scopes() {
  return [
    [SCOPES.vs, 'CH-VS', 'Wallis, namentliche allgemeine Feiertagsgrundliste', 'Kanton',
      'Acht namentliche Reglementstage plus Bundesfeier. Keine vollständige Erhebung zusätzlicher diözesaner Festtage. Prozessergänzungen in eigenem Geltungsbereich.', IDS.vsRegulation, 'Art. 1', 'open', FROM, null],
    [SCOPES.vsAdditional, 'CH-VS', 'Wallis, vier Prozessergänzungen nach Art. 37 RPflG', 'Kanton',
      'Nur Art. 37 Abs. 1 Bst. c. Kein alleinstehender vollständiger Prozesskalender. Bst. a und b verweisen auf Bundesrecht und Ruhegesetz samt Reglement.', IDS.vsJustice, 'Art. 37 Abs. 1', 'open', FROM, null],
    [SCOPES.ge, 'CH-GE', 'Genf, gesetzliche Feiertage nach Art. 1 Abs. 1 LJF', 'Kanton',
      'Neun Tage nach Art. 1 Abs. 1. Keine zusätzlichen Folgetage nach Abs. 2, keine Übernahme von Personalurlaub oder Schliesszeiten.', IDS.geLaw, 'Art. 1 Abs. 1', 'open', FROM, null]
  ];
}

function sharedLabels(base, key) {
  const candidates = base.rules.filter(rule => base.ruleKeys?.[rule.id] === key);
  return Object.fromEntries(['it', 'rm'].map(language => [language,
    candidates.find(rule => typeof rule[language] === 'string' && rule[language].trim())?.[language] ?? '']));
}

function makeRules(base) {
  const groups = [
    { canton: 'VS', scope: SCOPES.vs, prefix: 'VS-CAL-DAY', keys: VS_KEYS, category: 'publicHoliday' },
    { canton: 'VS', scope: SCOPES.vsAdditional, prefix: 'VS-PROC-DAY', keys: VS_ADDITIONAL_KEYS, category: 'proceduralEquivalentDay' },
    { canton: 'GE', scope: SCOPES.ge, prefix: 'GE-CAL-DAY', keys: GE_KEYS, category: 'publicHoliday' }
  ];
  return groups.flatMap(group => group.keys.map((key, index) => {
    const holiday = HOLIDAYS[key];
    const sourceId = group.scope === SCOPES.vsAdditional ? IDS.vsJustice
      : group.canton === 'GE' ? IDS.geLaw : key === 'NATIONAL-DAY' ? CH_SOURCE : IDS.vsRegulation;
    const locator = group.scope === SCOPES.vsAdditional ? 'Art. 37 Abs. 1 Bst. c'
      : group.canton === 'GE' ? `Art. 1 Abs. 1 Bst. ${'abcdefghi'[index]}${key === 'GENEVA-FAST' ? ' und Fussnote a' : ''}`
        : 'Art. 1';
    return {
      id: `${group.prefix}-${key}`, jurisdiction: `CH-${group.canton}`, scope: group.scope,
      de: holiday.de, fr: holiday.fr, ...sharedLabels(base, key), category: group.category,
      calculation: structuredClone(holiday.calculation), from: FROM, to: null,
      source: sourceId, locator, status: 'open', approvalBasis: null, priority: 100,
      action: 'add', target: null, exportClass: 'blockedEffect', reference: null, dayPortion: 'fullDay'
    };
  }));
}

function mappings() {
  return [
    ['MAP-VS-RUHE-GRUNDLISTE', SCOPES.vs, 'publicHoliday', 'Ruhegesetz und namentliche Reglementstage',
      'Grundliste, keine Vollerhebung weiterer kirchlich bestimmter gebotener Tage. Allgemeine Sonntagsruhe bleibt von den einzelnen Jahresregeln getrennt.',
      'SGS 822.2 Art. 1 / SGS 822.200 Art. 1 / SR 116 Art. 1', 'open', null],
    ['MAP-VS-VEKARG', SCOPES.vs, 'labourLawHoliday', 'Sonntagsgleichstellung nach Art. 20a ArG',
      'Acht Tage nach Art. 7 VEkArG, Bundesfeier aus Bundesrecht. Arbeitsrechtliche Klassifikation, keine pauschale Fristenwirkung.',
      'SGS 822.100 Art. 7 Abs. 1 / Art. 20a ArG', 'blocked', null],
    ['MAP-VS-RPFLG-GRUNDLISTE', SCOPES.vs, 'publicHoliday', 'Art. 37 Abs. 1 Bst. a und b RPflG',
      `Gesetzliche oder behördliche Fristen im gesetzlichen Behördenkontext. Erst zusammen mit ${SCOPES.vsAdditional} lesen. Konkrete Verfahrens- und Ortsanknüpfung sowie Bundesrechtsvorrang vor Automatik prüfen.`,
      'SGS 173.1 Art. 37 Abs. 1 Bst. a und b', 'open', null],
    ['MAP-VS-RPFLG-ERGAENZUNG', SCOPES.vsAdditional, 'proceduralEquivalentDay', 'Art. 37 Abs. 1 Bst. c RPflG, vier zusätzliche Tage',
      `2. Januar, Oster- und Pfingstmontag, 26. Dezember. Ergänzt ${SCOPES.vs}, ersetzt die Grundliste nicht. Keine selbsttätige Übertragung auf StPO, ZPO, BGG, SchKG, ATSG oder weitere Spezialverfahren.`,
      'SGS 173.1 Art. 37 Abs. 1 Bst. c', 'open', null],
    ['MAP-VS-PERSONAL-AUSSCHLUSS', SCOPES.vs, 'publicHoliday', 'Personalbesoldungsrecht und Verwaltungsschliesszeiten',
      'Art. 29 SGS 172.4 ist nur Abgrenzungsbeleg. Karfreitag, Personalhalbtage und zusätzlich gewährte freie Tage sind nicht Teil dieser Grundliste. Andere ausdrückliche Prozessgrundlagen bleiben gesondert zu prüfen.',
      'SGS 172.4 Art. 1 und 29 / SGS 173.1 Art. 37', 'blocked', null],
    ['MAP-GE-LJF-GRUNDLISTE', SCOPES.ge, 'publicHoliday', 'Gesetzliche Feiertage nach Art. 1 Abs. 1 LJF',
      'Neun Tage, einschliesslich Genfer Bettag und 31. Dezember. Rechtsordnungsspezifische Anknüpfung und Ortsbezug vor einer Fristenprofilfreigabe separat prüfen.',
      'RSG J 1 45 Art. 1 Abs. 1 und Fussnote a', 'open', null],
    ['MAP-GE-LJF-SONNTAGSFOLGETAG', SCOPES.ge, 'publicHoliday', 'Art. 1 Abs. 2 LJF, ausschliesslich nicht ArG-unterstellte Unternehmen',
      'Keine generelle Montagsverschiebung. BGer 7B_32/2023 E. 4.3.2, 4.4 und 5.2 bestätigte im konkreten Strafverfahren den Fristablauf am 02.01.2023 trotz geschlossener Gerichtskanzlei. Kantonale Auslegung unter Willkürmassstab, keine Vollprüfung aller Prozessordnungen.',
      'RSG J 1 45 Art. 1 Abs. 2 / BGer 7B_32/2023 vom 06.09.2023', 'blocked', null],
    ['MAP-GE-SCHLIESSZEITEN', SCOPES.ge, 'publicHoliday', 'Personalurlaub, Schliesszeiten und Spezialverfahren',
      'Keine Übernahme von Verwaltungs- oder Gerichtsschliessungen als zusätzliche Feiertage. Keine Folgetagsregeln aus einem Personalkalender oder aus einem allgemeinen Webseitenhinweis ableiten.',
      'RSG J 1 45 Art. 1 / BGer 7B_32/2023 E. 5.2', 'blocked', null]
  ];
}

export function createVsGeAdditions(base) {
  if (base?.contractVersion !== '0.5.0' || !Array.isArray(base.rules)
    || !base.sources?.some(row => row[0] === CH_SOURCE)) throw new Error('Validated contract 0.5.0 base with federal source required');
  const rules = makeRules(base), scopeRows = scopes(), sourceRows = sources();
  const existingIds = new Set(base.rules.map(rule => rule.id));
  if (rules.some(rule => existingIds.has(rule.id))) throw new Error('VS/GE additions already present');
  return {
    rules, scopes: scopeRows, sources: sourceRows, mappings: mappings(),
    reviews: sourceRows.map((entry, index) => [`AP18B-VS-GE-${String(index + 1).padStart(2, '0')}-20260913`,
      entry[0], 'newScope', REVIEW_DATE, 'unclear', null,
      `${entry[7]} Erstaufnahme in diesen Quellenbatch, kein behaupteter Vorher-Nachher-Normvergleich.`,
      'candidate', 'David Steimer', 'Codex', 'Fachabnahme, Quellenabgrenzung und konkrete Verfahrenszuordnung offen. Keine Runtime-Freigabe.']),
    assignments: scopeRows.map((scope, index) => ({
      id: `AREA-AP18B-VS-GE-${String(index + 1).padStart(2, '0')}`, scopeId: scope[0],
      areaId: scope[1] === 'CH-VS' ? 'GEO-VS' : 'GEO-GE',
      de: scope[1] === 'CH-VS' ? 'Wallis' : 'Genf', fr: scope[1] === 'CH-VS' ? 'Valais' : 'Genève',
      ...JURISDICTION_LABELS[scope[1]], areaType: 'Kanton', parentAreaId: 'GEO-CH', effect: 'include',
      officialIdSystem: '', officialId: '', from: FROM, to: null,
      sourceId: scope[5], locator: scope[6], status: 'open',
      note: 'Kantonsgebiet als interne Gebiet-ID. Norm- und Gebietsbeleg identisch. Keine automatische Feiertagsvererbung oder Verfahrensfreigabe.'
    })),
    areaSourceEvidence: [],
    scopeLabels: {
      [SCOPES.vs]: { fr: 'Valais, liste de base des jours fériés nommés', it: '', rm: '' },
      [SCOPES.vsAdditional]: { fr: 'Valais, quatre jours supplémentaires selon l’art. 37 LOJ', it: '', rm: '' },
      [SCOPES.ge]: { fr: 'Genève, jours fériés selon l’art. 1 al. 1 LJF', it: '', rm: '' }
    },
    ruleKeys: Object.fromEntries(rules.map(rule => [rule.id, rule.id.replace(/^(VS-CAL-DAY|VS-PROC-DAY|GE-CAL-DAY)-/, '')])),
    jurisdictionLabels: structuredClone(JURISDICTION_LABELS),
    notes: {
      scope: '22 Regeln in drei getrennten Geltungsbereichen. Keine historische Vollerhebung. 2026-01-01 ist Erfassungsuntergrenze, nicht Inkrafttretensbehauptung.',
      languages: 'DE/FR normnahe Produktnamen. IT/RM ausschliesslich vorhandene gemeinsame Namen aus der Basis übernommen und für VS/GE provisorisch. Fehlende Namen bleiben leer, keine amtliche VS-/GE-Sprachfassung behauptet.',
      federalApplication: 'VS-Bundesfeier aus bestehender CH-Quelle. Neue kantonale Anwendung offen, keine Vererbung der Freigabe des CH-Referenzeintrags. GE nennt den 1. August selbst in Art. 1 Abs. 1 Bst. f LJF.',
      jurisdictionNames: { itSourceId: IDS.cantonNamesIt, rmSourceId: IDS.cantonNamesRm,
        note: 'Kantonsnamen amtlich sprachlich belegt. Keine Übertragung der inhaltlich fremden Geodaten- oder Geschichtsquellen auf Feiertagsrecht.' },
      runtimeEnabled: false
    }
  };
}
