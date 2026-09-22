// SPDX-License-Identifier: AGPL-3.0-only
// AP18B-04 review data. No product activation or legal approval.
const CHECKED = '2026-09-13';
const FROM = '2026-01-01';
const FEDERAL_SOURCE = 'SRC-BUNDESFEIERTAG-19940701';
const IDS = {
  bs: 'SRC-BS-RLG-811100-20200701', bsCalendar: 'SRC-BS-FEIERTAGE-2026-2028',
  bl: 'SRC-BL-RTG-547-20191201', blCalendar: 'SRC-BL-PERSONAL-FEIERTAGE-2026',
  vd: 'SRC-VD-LEMP-82211-20120401', vdFaq: 'SRC-VD-DGEM-FAQ-2026',
  vd26: 'SRC-VD-FEIERTAGE-2026', vd27: 'SRC-VD-FEIERTAGE-2027', vd28: 'SRC-VD-FEIERTAGE-2028',
  ne: 'SRC-NE-LDJF-94102-20100101', neArea: 'SRC-NE-ADJF-941020-20250527',
  neLpa: 'SRC-NE-LPA-152130-20260101', neRdf: 'SRC-NE-RDF-152512-20230101',
  neCircular: 'SRC-NE-DELAIS-CIRCULAIRE-20260101', neCalendar: 'SRC-NE-FEIERTAGE-2026-2027',
  ju: 'SRC-JU-LJF-5551-20230101', juCalendar: 'SRC-JU-FEIERTAGE-2026-2027'
};
const BASEL = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'MAY1', 'ASCENSION',
  'PENTECOST', 'WHIT-MONDAY', 'NATIONAL-DAY', 'FEDERAL-FAST', 'CHRISTMAS', 'ST-STEPHEN'];
const VD = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION',
  'WHIT-MONDAY', 'NATIONAL-DAY', 'FEDERAL-FAST-MONDAY', 'CHRISTMAS'];
const NE = ['NEW-YEAR', 'NE-REPUBLIC', 'GOOD-FRIDAY', 'MAY1', 'ASCENSION', 'NATIONAL-DAY', 'CHRISTMAS'];
const NE_ADDITIONAL = ['BERCHTOLD', 'EASTER-MONDAY', 'ASCENSION-FRIDAY', 'WHIT-MONDAY',
  'FEDERAL-FAST-MONDAY', 'CHRISTMAS-EVE', 'ST-STEPHEN', 'NEW-YEAR-EVE'];
const JU = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'MAY1',
  'ASCENSION', 'PENTECOST', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'JU-PLEBISCITE', 'NATIONAL-DAY',
  'ASSUMPTION', 'ALL-SAINTS', 'CHRISTMAS'];
const JU_LABOUR = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'MAY1', 'ASCENSION',
  'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'CHRISTMAS'];
const PROFILES = [
  { canton: 'BS', scope: 'BS-RLG-ALL', source: IDS.bs, category: 'publicHoliday', keys: BASEL, locator: '§ 2 Abs. 1 Bst. a und b' },
  { canton: 'BL', scope: 'BL-RTG-ALL', source: IDS.bl, category: 'publicHoliday', keys: BASEL, locator: '§ 2 Abs. 1 Bst. b und c' },
  { canton: 'VD', scope: 'VD-LEMP-ALL', source: IDS.vd, category: 'labourLawHoliday', keys: VD, locator: 'Art. 47 Abs. 1' },
  { canton: 'NE', scope: 'NE-LDJF-BASE', source: IDS.ne, category: 'publicHoliday', keys: NE, locator: 'Art. 3 Abs. 1' },
  { canton: 'NE', scope: 'NE-LANDERON-ADDITIONAL', source: IDS.neArea, category: 'publicHoliday', keys: ['CORPUS-CHRISTI'], locator: 'Art. 2' },
  { canton: 'NE', scope: 'NE-LPA-ADDITIONAL', source: IDS.neLpa, category: 'proceduralEquivalentDay', keys: NE_ADDITIONAL, locator: 'LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1' },
  { canton: 'JU', scope: 'JU-LJF-OFFICIAL', source: IDS.ju, category: 'publicHoliday', keys: JU, locator: 'Art. 3 Bst. b' },
  { canton: 'JU', scope: 'JU-LJF-LABOUR', source: IDS.ju, category: 'labourLawHoliday', keys: JU_LABOUR, locator: 'Art. 4' }
];
const NAMES = {
  BS: { de: 'Basel-Stadt', fr: 'Bâle-Ville', it: 'Basilea Città', rm: 'Basilea-Citad' },
  BL: { de: 'Basel-Landschaft', fr: 'Bâle-Campagne', it: 'Basilea Campagna', rm: 'Basilea-Champagna' },
  VD: { de: 'Waadt', fr: 'Vaud', it: 'Vaud', rm: 'Vad' },
  NE: { de: 'Neuenburg', fr: 'Neuchâtel', it: 'Neuchâtel', rm: 'Neuchâtel' },
  JU: { de: 'Jura', fr: 'Jura', it: 'Giura', rm: 'Giura' }
};
const definition = (de, fr, it, rm, calculation) => ({ labels: { de, fr, it, rm }, calculation });
const NEW_HOLIDAYS = {
  'FEDERAL-FAST-MONDAY': definition('Bettagsmontag', 'Lundi du Jeûne fédéral', 'Lunedì del Digiuno federale', 'Glindesdi da la Rogaziun federala',
    { type: 'nthWeekdayOffsetDays', month: 9, isoWeekday: 7, occurrence: 3, offsetDays: 1 }),
  'NE-REPUBLIC': definition('Gründung der Republik Neuenburg', 'Instauration de la République de Neuchâtel', 'Istituzione della Repubblica di Neuchâtel', 'Fundaziun da la Republica da Neuchâtel',
    { type: 'fixedMonthDay', month: 3, day: 1 }),
  'ASCENSION-FRIDAY': definition('Freitag nach Auffahrt', 'Vendredi de l’Ascension', 'Venerdì dopo l’Ascensione', 'Venderdi suenter Anzainzas',
    { type: 'easterOffsetDays', offsetDays: 40 }),
  'CHRISTMAS-EVE': definition('Heiligabend', 'Veille de Noël', 'Vigilia di Natale', 'Vigilia da Nadal',
    { type: 'fixedMonthDay', month: 12, day: 24 }),
  'NEW-YEAR-EVE': definition('Silvester', 'Saint-Sylvestre', 'San Silvestro', 'Silvester',
    { type: 'fixedMonthDay', month: 12, day: 31 }),
  'JU-PLEBISCITE': definition('Gedenktag der Volksabstimmung (23. Juni)', 'Commémoration du Plébiscite (23 juin)', 'Commemorazione del plebiscito (23 giugno)', 'Commemoraziun dal plebiscit (23 da zercladur)',
    { type: 'fixedMonthDay', month: 6, day: 23 })
};
const LANGUAGE_NOTE = 'DE/FR normnahe Produktnamen. IT/RM aus vorhandenen gemeinsamen Namen übernommen oder provisorisch übersetzt. Sprachabnahme offen, keine amtliche IT/RM-Fassung dieser Norm behauptet.';

function sourceRows() {
  const source = (id, canton, title, locator, url, version, note) =>
    [id, canton, title, locator, url, version, CHECKED, note, 'open', null];
  return [
    source(IDS.bs, 'CH-BS', 'Gesetz über öffentliche Ruhetage und Ladenöffnung, RLG', 'SG 811.100, § 2 Abs. 1, Version 4927',
      'https://www.gesetzessammlung.bs.ch/frontend/versions/4927/download_pdf_file?locale=de', '2020-07-01',
      `Zwölf namentliche Tage, davon vier hohe Feiertage. Bettag seit 2013 übriger Feiertag. Alte Suchtreffer mit fünf hohen Feiertagen verworfen. ${LANGUAGE_NOTE}`),
    source(IDS.bsCalendar, 'CH-BS', 'Feiertage im Kanton Basel-Stadt', 'Amtliche Jahreslisten 2026 bis 2028',
      'https://www.bs.ch/themen/arbeit-und-steuern/feiertage-im-kanton-basel-stadt', null,
      'Je neun Datumswerte abgeglichen. Die Jahresliste lässt die drei stets sonntäglichen namentlichen RLG-Tage weg. Kein Widerspruch zur Zwölferliste und keine neue Fristenfreigabe.'),
    source(IDS.bl, 'CH-BL', 'Gesetz über die öffentlichen Ruhetage und den Sonntagsverkauf, RTG', 'SGS 547, § 2, § 3 und § 10, Version 2507',
      'https://bl.clex.ch/api/versions/2507/pdf_file_with_annexes', '2019-12-01',
      `Zwölf namentliche kantonale Tage. 1. Mai ganztägig. Selbständige kommunale Feiertage nach § 3 nicht erhoben. Arbeitsrecht und Ruheordnung nicht gleichsetzen. ${LANGUAGE_NOTE}`),
    source(IDS.blCalendar, 'CH-BL', 'Personalamt, Feiertage, arbeitsfreie Tage und Kompensationstage 2026', 'Nur als gesetzliche Feiertage bezeichnete Zeilen zum Datumsabgleich',
      'https://bl-api.webcloud7.ch/politik-und-behorden/direktionen/finanz-und-kirchendirektion/personalamt/arbeitszeiten/dateien_arbeitszeiten/2026_ubersicht-feiertage-arbeitsfreie-tage-kompensationstage-und-netto-sollarbeitszeit.pdf/%40%40download/file/2026_U%CC%88bersicht%20Feiertage%20arbeitsfreie%20Tage%20Kompensationstage%20und%20Netto-Sollarbeitszeit.pdf', null,
      'Personalquelle nur ergänzend. Fasnacht, Gründonnerstag, Freitag nach Auffahrt, Kompensation und Schliessungen nicht als allgemeine Feiertage übernommen. Gesetz bleibt Primärbeleg.'),
    source(IDS.vd, 'CH-VD', 'Loi sur l’emploi, LEmp', 'BLV 822.11, Art. 47 Abs. 1 und 2',
      'https://prestations.vd.ch/pub/blv-publication/actes/consolide/822.11?id=c3ef83f5-e736-490d-90a7-1753b31d5ef3', '2012-04-01',
      `Neun arbeitsrechtlich sonntagsgleiche Tage. Direktportal lieferte keinen auslesbaren Volltext. Aktiver LexFind-Bestand 20296, amtlicher PDF-Spiegel Version 107233 und DGEM-FAQ 2026 abgeglichen. Kein historischer Siebentage-Stand. ${LANGUAGE_NOTE}`),
    source(IDS.vdFaq, 'CH-VD', 'DGEM, FAQ en droit du travail, Ausgabe 2026', 'S. 32, Art. 47 LEmp / Art. 20a LTr',
      'https://www.vd.ch/fileadmin/user_upload/themes/economie_emploi/emploi/fichiers_pdf/FAQ-droit_du_travail-DGEM.pdf', null,
      'Jahresausgabe 2026, kein genaues Normdatum. Amtliche aktuelle Neunerliste einschliesslich 2. Januar und Pfingstmontag. Weder der 26. Dezember noch zusätzliche vertragliche freie Tage sind Teil von Art. 47 Abs. 1.'),
    ...[2026, 2027, 2028].map(year => source(IDS[`vd${String(year).slice(2)}`], 'CH-VD', `Vaud, jours fériés officiels ${year}`, 'Abschnitt Jours fériés officiels',
      `https://www.vd.ch/formation/jours-feries-et-vacances-scolaires/jours-feries-et-vacances-scolaires-${year}`, null,
      'Amtlicher Datumsabgleich der neun Feiertage. Schulferien und zusätzliche verschiebbare Personalferien nach Art. 123 RLPers ausdrücklich nicht übernommen.')),
    source(IDS.ne, 'CH-NE', 'Loi sur le dimanche et les jours fériés, LDJF', 'RSN 941.02, Art. 3 Abs. 1 und 2',
      'https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.02.pdf', '2010-01-01',
      `Sechs unbedingte kantonale Tage plus Bundesfeier. Aktiver Volltext über Swiss Caselaw/LexFind 10049, mit amtlicher Liste und Circulaire 2026 abgeglichen. NE-PENDING-SUNDAY-SUBSTITUTION: 2. Januar/26. Dezember nur nach Sonntag, nicht als unbedingte Regeln. ${LANGUAGE_NOTE}`),
    source(IDS.neArea, 'CH-NE', 'Arrêté d’application de la loi sur le dimanche et les jours fériés', 'RSN 941.020, Art. 2',
      'https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf', '2025-05-27',
      'Kantonaler Erlass bezeichnet ausschliesslich Le Landeron für Fronleichnam. Erfasst als örtliche Ergänzung, nicht als eigener vollständiger Kantonskalender. Keine kommunale Norm verwendet.'),
    source(IDS.neLpa, 'CH-NE', 'Loi sur la procédure administrative, LPA', 'RSN 152.130, Art. 1–3 und Art. 33 Abs. 2 und 3',
      'https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.130.pdf', '2026-01-01',
      'Gesetz vom 18.03.2025, ersetzt LPJA seit 01.01.2026. Mindestens halbtägige Schliessung der kantonalen Verwaltung ausdrücklich gleichgestellt. Konkrete acht RDF-Ergänzungen separat, Bundesverfahren nicht pauschal zugeordnet.'),
    source(IDS.neRdf, 'CH-NE', 'Règlement des fonctionnaires, RDF', 'RSN 152.512, Art. 11 Abs. 1 und 2',
      'https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.512.pdf', '2023-01-01',
      'Aktiver Volltext über Swiss Caselaw/LexFind 11005. Normfeste ganztägige Liste nur über LPA-Verweis genutzt. NE-PENDING-COMPENSATION: zusätzliche vom Conseil d’Etat gewährte Ausgleichstage nach Abs. 2 separat offen, kein erfundener ewiger Ersatz.'),
    source(IDS.neCircular, 'CH-NE', 'Service de l’aménagement du territoire, Computation des délais en procédure administrative', 'Circulaire 01.01.2026, S. 1',
      'https://www.ne.ch/sites/default/files/migration/autorites/DDTE/SCAT/Documents/06_07_Documents_communs/PConstr_CirculaireComputationDelais.pdf', '2026-01-01',
      'Amtliche aktuelle Bestätigung von LPA Art. 33, sieben allgemeinen Tagen, acht Verwaltungsergänzungen und Le Landeron. 2026-Ausgabe statt historischer LPJA-Circulaire verwendet. Baurechtliche Sonderregeln und Fristenstillstände sind nicht Teil dieser Feiertagserfassung.'),
    source(IDS.neCalendar, 'CH-NE', 'Neuchâtel, jours fériés officiels et dans l’administration cantonale', 'Getrennte Jahreslisten 2026 und 2027',
      'https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels', null,
      'Allgemeine Feiertage und Verwaltungstage getrennt. 2026/2027 beide bedingten allgemeinen Zusatzfeiertage nicht anwendbar. Ladenöffnungsschliessungen nicht als allgemeine Feiertage übernommen.'),
    source(IDS.ju, 'CH-JU', 'Loi sur les jours fériés officiels et le repos dominical', 'RSJU 555.1, Art. 3, Art. 4 und Art. 9',
      'https://rsju.jura.ch/Htdocs/Files/v/38948.pdf', '2023-01-01',
      `Gesetz vom 31.08.2022. Art. 3 nennt 15 Tage, Art. 4 eigenständig neun arbeitsrechtliche Tage. Altes Gesetz und Dekret 555.10 aufgehoben. ${LANGUAGE_NOTE}`),
    source(IDS.juCalendar, 'CH-JU', 'Jura, jours fériés officiels 2026–2027', 'Amtliche Jahrestabelle mit 13 datierten Tagen, ohne Ostern/Pfingstsonntag',
      'https://www.jura.ch/Htdocs/Files/v/7818f8eb129d227f2892b240cfbf77d3597c47169f83a6d57891c45fbd7b66df.pdf/2026-2027.pdf?download=1', null,
      'Nur Datumsabgleich. Formatierungen der arbeitsrechtlichen Untergruppe nicht aus einer linearen Textextraktion ableiten, dafür Art. 4 verwenden. Lundi de Saint-Martin ist ausdrücklich kein Feiertag. Quellenseite verlinkt noch das aufgehobene Dekret 555.10.')
  ];
}

function scopes() {
  const row = (id, canton, name, type, note, source, locator) => [id, `CH-${canton}`, name, type, note, source, locator, 'open', FROM, null];
  return [
    row('BS-RLG-ALL', 'BS', 'Basel-Stadt, namentliche RLG-Ruhetage', 'Kanton', 'Zwölf Tage einschliesslich drei benannter Sonntage. Keine Fasnacht, kein 2. Januar. Verfahrensanknüpfung offen.', IDS.bs, '§ 2 Abs. 1 Bst. a und b'),
    row('BL-RTG-ALL', 'BL', 'Basel-Landschaft, namentliche RTG-Ruhetage', 'Kanton', 'Zwölf kantonale Tage, keine selbständigen kommunalen Feiertage nach § 3. 1. Mai ganztägig, keine Personalhalbtage.', IDS.bl, '§ 2 Abs. 1 Bst. b und c'),
    row('VD-LEMP-ALL', 'VD', 'Waadt, arbeitsrechtliche LEmp-Liste', 'Kanton', 'Neun sonntagsgleiche Tage. Keine unbedingte Aufnahme des verschiebbaren zusätzlichen Personaltags am 26. Dezember. Keine pauschale Fristenfreigabe.', IDS.vd, 'Art. 47 Abs. 1'),
    row('NE-LDJF-BASE', 'NE', 'Neuenburg, unbedingte allgemeine Grundliste', 'Kanton', 'Sieben Tage mit Bundesfeier. Unvollständig für bedingte Sonntagsfolgetage. Diese bleiben unter NE-PENDING-SUNDAY-SUBSTITUTION sichtbar offen. Regionale und verfahrensrechtliche Ergänzungen separat.', IDS.ne, 'Art. 3 Abs. 1'),
    row('NE-LANDERON-ADDITIONAL', 'NE', 'Neuenburg, Fronleichnam in Le Landeron', 'Gemeinde', 'Nur Gemeinde Le Landeron, unmittelbar kantonal festgelegt. Ein zusätzlicher Tag zur Grundliste. Le Cerneux-Péquignot nicht aus nichtamtlichen Kalendern übernommen.', IDS.neArea, 'Art. 2'),
    row('NE-LPA-ADDITIONAL', 'NE', 'Neuenburg, acht feste LPA-Verwaltungsergänzungen', 'Kanton', 'Acht zusätzliche ganztägige Daten aus RDF Art. 11 Abs. 1 mit ausdrücklicher LPA-Verweisung. Kein vollständiger selbständiger Kalender. Variable zusätzliche Schliessungen nach Abs. 2 offen.', IDS.neLpa, 'Art. 33 Abs. 3'),
    row('JU-LJF-OFFICIAL', 'JU', 'Jura, allgemeine Feiertage nach Art. 3', 'Kanton', '15 genannte Tage einschliesslich Ostern und Pfingsten. 23. Juni, 2. Januar, Mariä Himmelfahrt und Allerheiligen sind nicht Teil der engeren Art.-4-Liste.', IDS.ju, 'Art. 3 Bst. b'),
    row('JU-LJF-LABOUR', 'JU', 'Jura, arbeitsrechtliche Liste nach Art. 4', 'Kanton', 'Neun sonntagsgleiche Tage. Eigenständige Kategorie, keine Übernahme sämtlicher Art.-3-Tage als arbeitsrechtliche Feiertage.', IDS.ju, 'Art. 4')
  ];
}

function mappings() {
  const rows = PROFILES.map(profile => [`MAP-${profile.scope}`, profile.scope, profile.category,
    profile.category === 'proceduralEquivalentDay' ? 'LPA-Verfahren, ausdrückliche Feiertagsgleichstellung'
      : profile.category === 'labourLawHoliday' ? 'Arbeitsrechtliche Sonntagsgleichstellung' : 'Allgemeine Ruhe- und Feiertagsordnung',
    profile.category === 'proceduralEquivalentDay'
      ? 'Art. 33 Abs. 3 LPA verweist auf Verwaltungsschliessung. Acht feste Zusatzdaten nach RDF Art. 11 Abs. 1. Nur mit Grundliste und territorialer Prüfung verwenden. Keine Freigabe für sämtliche Bundesverfahren.'
      : 'Normkategorie, Verfahrensordnung und gesetzlicher Ortsbezug getrennt prüfen. Erfassung ist keine Aktivierung. Keine Übernahme von Personalferien, Fasnacht oder allgemeinen Ladenschliessungen.',
    profile.locator, 'open', null]);
  rows.push(
    ['MAP-BL-MUNICIPAL-EXCLUSION', 'BL-RTG-ALL', 'publicHoliday', 'Selbständiges kommunales Recht nach § 3 RTG', 'Ausserhalb des beschlossenen Erhebungsscope. Kein Schluss, dass kommunale Tage in allen denkbaren Verfahren rechtlich irrelevant seien.', 'SGS 547 § 3', 'blocked', null],
    ['MAP-NE-PENDING-SUNDAY-SUBSTITUTION', 'NE-LDJF-BASE', 'publicHoliday', 'NE-PENDING-SUNDAY-SUBSTITUTION, bedingte allgemeine Zusatzfeiertage',
      '2. Januar und 26. Dezember nur wenn Neujahr beziehungsweise Weihnachten Sonntag ist. Vertrag 0.5.0 kann diese Bedingung nicht ausdrücken. Keine falschen jährlichen Fixregeln. 2026–2028 entsteht aus dieser Regel kein zusätzlicher allgemeiner Feiertag.', 'RSN 941.02 Art. 3 Abs. 1', 'blocked', null],
    ['MAP-NE-PENDING-COMPENSATION', 'NE-LPA-ADDITIONAL', 'proceduralEquivalentDay', 'NE-PENDING-COMPENSATION, zusätzliche Verwaltungsschliessungen',
      'RDF Art. 11 Abs. 2 erlaubt zusätzliche Ausgleichstage. Konkrete jährliche Beschlüsse wurden nicht vollständig erhoben. Über LPA Art. 33 Abs. 3 möglicherweise fristrelevant, deshalb LPA-Profil nicht als vollständigen ewigen Kalender freigeben.', 'RSN 152.512 Art. 11 Abs. 2 / RSN 152.130 Art. 33 Abs. 3', 'blocked', null],
    ['MAP-VD-PERSONAL-EXCLUSION', 'VD-LEMP-ALL', 'labourLawHoliday', 'Zusätzlicher verschiebbarer Personaltag',
      'Art. 123 RLPers nennt grundsätzlich 26. Dezember als zusätzlichen Personaltag und erlaubt Verlegung. Nicht Teil der LEmp-Neunerliste, keine universelle Fristenwirkung oder jährliche feste Kalenderregel abgeleitet.', 'Amtliche VD-Jahresseiten, Abschnitt zu Art. 123 RLPers', 'blocked', null],
    ['MAP-JU-NORM-VS-CALENDAR', 'JU-LJF-OFFICIAL', 'publicHoliday', 'Allgemeine Feiertage versus engere Art.-4-Liste',
      '15 namentliche Art.-3-Tage, davon 13 auf amtlicher Jahresliste ohne Ostern/Pfingstsonntag. Arbeitsaussage ausschliesslich aus Art. 4, nicht aus verlorener Hervorhebung im PDF-Text. Saint-Martin-Montag ausdrücklich kein Feiertag.', 'RSJU 555.1 Art. 3, 4 und 9 / amtliche Jahresliste 2026–2027', 'open', null]
  );
  return rows;
}

export function createWestAdditions(base) {
  if (base.contractVersion !== '0.5.0' || !base.sources.some(row => row[0] === FEDERAL_SOURCE)) throw new Error('Contract 0.5 base with federal source required');
  const definitions = { ...base.holidayDefinitions, ...NEW_HOLIDAYS };
  const ruleKeys = {};
  const rules = PROFILES.flatMap(profile => profile.keys.map(key => {
    const item = definitions[key];
    if (!item) throw new Error(`Unknown west holiday ${key}`);
    const donor = base.rules.find(rule => base.ruleKeys[rule.id] === key && rule.it && rule.rm);
    const labels = { de: item.labels.de, fr: item.labels.fr, it: item.labels.it || donor?.it || '', rm: item.labels.rm || donor?.rm || '' };
    if (key === 'BERCHTOLD') Object.assign(labels, { de: '2. Januar', fr: '2 janvier', it: '2 gennaio', rm: '2 da schaner' });
    if (!labels.it || !labels.rm) throw new Error(`Missing provisional west label ${key}`);
    const id = `${profile.scope}-DAY-${key}`;
    ruleKeys[id] = key;
    const federal = key === 'NATIONAL-DAY';
    return { id, jurisdiction: `CH-${profile.canton}`, scope: profile.scope, ...labels,
      category: federal ? 'publicHoliday' : profile.category, calculation: structuredClone(item.calculation),
      from: FROM, to: null, source: federal ? FEDERAL_SOURCE : profile.source,
      locator: federal ? `SR 116 Art. 1, neue Anwendung auf ${profile.scope}. Kantonaler Bezug ${profile.locator}` : profile.locator,
      status: 'open', approvalBasis: null, priority: 100, action: 'add', target: null,
      exportClass: 'blockedEffect', reference: null, dayPortion: 'fullDay' };
  }));
  const scopeRows = scopes(), sources = sourceRows();
  const assignments = scopeRows.map(scope => {
    const code = scope[1].slice(3), local = scope[0] === 'NE-LANDERON-ADDITIONAL';
    return { id: `AREA-${scope[0]}`, scopeId: scope[0], areaId: local ? 'GEO-NE-LE-LANDERON' : `GEO-${code}`,
      ...(local ? { de: 'Le Landeron', fr: 'Le Landeron', it: 'Le Landeron', rm: 'Le Landeron' } : NAMES[code]),
      areaType: local ? 'Gemeinde' : 'Kanton', parentAreaId: local ? 'GEO-NE' : 'GEO-CH', effect: 'include',
      officialIdSystem: '', officialId: '', from: FROM, to: null, sourceId: scope[5], locator: scope[6], status: 'open',
      note: `${local ? 'Kantonaler Erlass bezeichnet Gemeinde ausdrücklich. Keine zusätzliche kommunale Norm.' : 'Kantonsgebiet als interne Gebiet-ID. Keine automatische Profilvererbung.'} IT/RM-Kantonsnamen provisorische Produktnamen, nicht neue amtliche IDs.` };
  });
  const scopeLabels = {
    'BS-RLG-ALL': { fr: 'Bâle-Ville, jours de repos nommés RLG', it: 'Basilea Città, giorni di riposo nominati RLG', rm: 'Basilea-Citad, dis da ruaus numnads RLG' },
    'BL-RTG-ALL': { fr: 'Bâle-Campagne, jours de repos nommés RTG', it: 'Basilea Campagna, giorni di riposo nominati RTG', rm: 'Basilea-Champagna, dis da ruaus numnads RTG' },
    'VD-LEMP-ALL': { fr: 'Vaud, jours assimilés au dimanche LEmp', it: 'Vaud, giorni equiparati alla domenica LEmp', rm: 'Vad, dis equiparads a dumengias LEmp' },
    'NE-LDJF-BASE': { fr: 'Neuchâtel, liste générale inconditionnelle LDJF', it: 'Neuchâtel, elenco generale incondizionato LDJF', rm: 'Neuchâtel, glista generala nuncondiziunada LDJF' },
    'NE-LANDERON-ADDITIONAL': { fr: 'Neuchâtel, Fête-Dieu au Landeron', it: 'Neuchâtel, Corpus Domini a Le Landeron', rm: 'Neuchâtel, Sontgilcrest a Le Landeron' },
    'NE-LPA-ADDITIONAL': { fr: 'Neuchâtel, huit jours supplémentaires fixes LPA', it: 'Neuchâtel, otto giorni supplementari fissi LPA', rm: 'Neuchâtel, otg dis supplementars fixs LPA' },
    'JU-LJF-OFFICIAL': { fr: 'Jura, jours fériés officiels selon l’art. 3', it: 'Giura, giorni festivi ufficiali secondo l’art. 3', rm: 'Giura, firads uffizials tenor l’art. 3' },
    'JU-LJF-LABOUR': { fr: 'Jura, jours assimilés au dimanche selon l’art. 4', it: 'Giura, giorni equiparati alla domenica secondo l’art. 4', rm: 'Giura, dis equiparads a dumengias tenor l’art. 4' }
  };
  return { rules, scopes: scopeRows, sources, mappings: mappings(), assignments, areaSourceEvidence: [],
    reviews: sources.map((source, index) => [`AP18B04-WEST-SOURCE-${String(index + 1).padStart(2, '0')}`, source[0], 'newScope', CHECKED,
      'unclear', null, `${source[7]} Ersterhebung, kein behaupteter Normänderungsvergleich.`,
      'candidate', 'David Steimer', 'Codex', 'Fach-, Sprach- und Verfahrensabnahme offen. Keine Produktfreigabe.']),
    scopeLabels, ruleKeys, holidayDefinitions: structuredClone(NEW_HOLIDAYS),
    jurisdictionLabels: Object.fromEntries(Object.entries(NAMES).map(([code, names]) => [`CH-${code}`, { it: names.it, rm: names.rm }])),
    pendingCases: [
      { id: 'NE-PENDING-SUNDAY-SUBSTITUTION', canton: 'CH-NE', holiday: '2. Januar und 26. Dezember bei Sonntagslage des Vortags',
        reason: 'Vertrag 0.5.0 hat keine bedingte Datumsauslösung. Grundliste daher keine vollständige ewige allgemeine NE-Liste.',
        sourceIds: [IDS.ne, IDS.neCalendar], locator: 'LDJF Art. 3 Abs. 1', status: 'contractGap' },
      { id: 'NE-PENDING-COMPENSATION', canton: 'CH-NE', holiday: 'Zusätzliche vom Conseil d’Etat gewährte Ausgleichstage',
        reason: 'Jährliche Ausgleichsbeschlüsse nach RDF Art. 11 Abs. 2 noch nicht vollständig erhoben. Über LPA-Verweis möglicherweise fristrelevant.',
        sourceIds: [IDS.neRdf, IDS.neLpa], locator: 'RDF Art. 11 Abs. 2 / LPA Art. 33 Abs. 3', status: 'sourceGap' }
    ],
    notes: { checkedOn: CHECKED, counts: { BS: 12, BL: 12, VD: 9, NE: 16, JU: 24 },
      legalApproval: false, languageApproval: false, runtimeEnabled: false, municipalLawIncluded: false,
      languagePolicy: LANGUAGE_NOTE,
      sourceAccess: 'Swiss Caselaw für aktive Normen und Fassungsabgleich berücksichtigt. Entscheidsuche ergänzend durchsucht, keine ungeprüften Entscheide in die Regelbasis übernommen.',
      validity: '2026-01-01 ist Erfassungsuntergrenze, kein Inkrafttretensdatum sämtlicher Normen.' }
  };
}
