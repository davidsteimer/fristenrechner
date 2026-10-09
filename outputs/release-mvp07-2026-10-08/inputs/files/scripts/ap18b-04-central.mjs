// SPDX-License-Identifier: AGPL-3.0-only
// AP18B-04 capture only. No legal approval, product export or runtime calendar.
const CHECKED = '2026-09-13';
const FROM = '2026-01-01';
const CH_SOURCE = 'SRC-BUNDESFEIERTAG-19940701';
const LANGUAGE_NOTE = 'IT/RM-Namen aus dem bestehenden Bestand provisorisch übernommen. Neue Scope-Namen, Kantonsnamen und Bruderklausenfest-Übersetzungen sind provisorische Produkttexte, keine amtlichen Sprachfassungen. Sprachabnahme offen.';
const IDS = Object.freeze({
  luRest: 'SRC-LU-RLG-855-20200501', luVrg: 'SRC-LU-VRG-40-20210901',
  luJusg: 'SRC-LU-JUSG-260-20260101', urRest: 'SRC-UR-LSG-701421-20030101',
  urLabour: 'SRC-UR-KAV-201111-20020201', urInfo: 'SRC-UR-FEIERTAGE-20230406',
  szRest: 'SRC-SZ-RTG-545110-20180701', szInfo: 'SRC-SZ-FEIERTAGSREGELUNG-AP18B04',
  owRest: 'SRC-OW-RTG-9752-20090801', nwRest: 'SRC-NW-RTG-9211-20160101',
  zgRest: 'SRC-ZG-RLG-94231-20250822', zgVrg: 'SRC-ZG-VRG-1621-20251017',
  zgInfo: 'SRC-ZG-FEIERTAGE-2026-2027', glRest: 'SRC-GL-RTG-IXB211-20190701',
  glFahrtLaw: 'SRC-GL-FAHRT-IA31-18350524', glFahrt2026: 'SRC-GL-FAHRT-RR-20260106'
});
const NAMES = Object.freeze({
  LU: { de: 'Luzern', fr: 'Lucerne', it: 'Lucerna', rm: 'Lucerna' },
  UR: { de: 'Uri', fr: 'Uri', it: 'Uri', rm: 'Uri' },
  SZ: { de: 'Schwyz', fr: 'Schwytz', it: 'Svitto', rm: 'Sviz' },
  OW: { de: 'Obwalden', fr: 'Obwald', it: 'Obvaldo', rm: 'Sursilvania' },
  NW: { de: 'Nidwalden', fr: 'Nidwald', it: 'Nidvaldo', rm: 'Sutsilvania' },
  ZG: { de: 'Zug', fr: 'Zoug', it: 'Zugo', rm: 'Zug' },
  GL: { de: 'Glarus', fr: 'Glaris', it: 'Glarona', rm: 'Glaruna' }
});
const HIGH = ['GOOD-FRIDAY', 'EASTER', 'PENTECOST', 'FEDERAL-FAST', 'CHRISTMAS'];
const CATHOLIC_ARG = ['NEW-YEAR', 'GOOD-FRIDAY', 'ASCENSION', 'CORPUS-CHRISTI',
  'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'];
const LU_REST = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'ASCENSION', 'PENTECOST',
  'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS',
  'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const FULL_CATHOLIC = ['NEW-YEAR', 'EPIPHANY', 'ST-JOSEPH', 'GOOD-FRIDAY',
  'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY',
  'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const LU_JUSTICE = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY',
  'ASCENSION', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION',
  'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const ZG_VRG = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY',
  'ASCENSION', 'PENTECOST', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY',
  'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const PROFILES = [
  { canton: 'LU', scope: 'LU-RLG-ALL', source: IDS.luRest, keys: LU_REST, kind: 'rest',
    locator: '§ 1a Abs. 1 Bst. b und Abs. 2 / § 2',
    note: 'Zehn kantonsweite Tage in § 1a Abs. 1 Bst. b, davon 1. August als offene Bundesanwendung. Drei weitere ausdrücklich benannte Sonntage in § 2. Kommunale Patronstage und Josefstag nach Bst. c ausgeschlossen.' },
  { canton: 'LU', scope: 'LU-JUSG-ART76', source: IDS.luJusg, keys: LU_JUSTICE, kind: 'procedure',
    locator: '§ 76', name: 'JusG, eigene Liste für ZPO/StPO',
    note: '13 eigene gesetzlich anerkannte Feiertage für Art. 142 Abs. 3 ZPO und Art. 90 Abs. 2 StPO. Nicht aus der arbeitsrechtlichen Liste abgeleitet. Gesetzliche Ortsanknüpfung und Spezialrecht bleiben zu prüfen.' },
  { canton: 'LU', scope: 'LU-VRG-ADDITIONAL', source: IDS.luVrg, keys: ['BERCHTOLD', 'EASTER-MONDAY', 'WHIT-MONDAY'], kind: 'procedure',
    locator: '§ 34 Abs. 1 Satz 2', name: 'VRG, drei zusätzliche Fristentage',
    note: 'Nur die drei Zusatztage. Keine vollständige VRG-Liste. Öffentliche Ruhetage aus LU-RLG-ALL separat anzuknüpfen, Patroziniumsfest und Josefstag ausdrücklich ausgenommen. Rückwärtsfristen nach Abs. 2 separat.' },
  { canton: 'UR', scope: 'UR-LSG-ALL', source: IDS.urRest, keys: FULL_CATHOLIC, kind: 'rest',
    locator: 'Art. 9 Abs. 1 Bst. b',
    note: '14 namentliche kantonsweite Ruhetage. Gemeindefeiertage nach Bst. c nicht erhoben. ArG-Teilmenge aus Art. 6 KAV getrennt. Kein zusätzlicher benannter Sonntag im LSG.' },
  { canton: 'SZ', scope: 'SZ-RTG-ALL', source: IDS.szRest, keys: [...FULL_CATHOLIC, 'EASTER', 'PENTECOST', 'FEDERAL-FAST'], kind: 'rest',
    locator: '§ 2 Abs. 1 Ziff. 2 und 3',
    note: 'Elf Feiertage und sechs hohe Feiertage, insgesamt 17 benannte Tage. Gemeindefeiertage nach Ziff. 4 nicht erhoben. ArG-Teilmenge nach Abs. 2 ausdrücklich enger.' },
  { canton: 'OW', scope: 'OW-RTG-ALL', source: IDS.owRest, keys: ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'ASCENSION', 'PENTECOST',
    'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'BRUDER-KLAUS', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'], kind: 'rest',
    locator: 'Art. 2 Abs. 1 Bst. b und c',
    note: 'Acht Feiertage und fünf hohe Feiertage. Bruderklausenfest 25. September ist kantonaler Ruhetag, nicht nur Personalfreitag. Kommunaler Lokalfeiertag nach Abs. 2 nicht erhoben. ArG-Teilmenge nach Abs. 3 enger.' },
  { canton: 'NW', scope: 'NW-RTG-ALL', source: IDS.nwRest, keys: ['NEW-YEAR', 'ST-JOSEPH', 'GOOD-FRIDAY', 'EASTER', 'ASCENSION', 'PENTECOST',
    'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'], kind: 'rest',
    locator: 'Art. 2 Abs. 1 Ziff. 2 und 3',
    note: 'Acht Feiertage und fünf hohe Feiertage. Josefstag ist Ruhetag, jedoch nicht in ArG-Teilmenge Abs. 2. Kommunale zusätzliche Feiertage und blosse Personal-Schliesstage sind nicht enthalten.' },
  { canton: 'ZG', scope: 'ZG-RLG-ALL', source: IDS.zgRest, keys: [...CATHOLIC_ARG, 'NATIONAL-DAY', 'EASTER', 'PENTECOST', 'FEDERAL-FAST'], kind: 'rest',
    locator: '§ 1 Abs. 1 Bst. b / § 5 Abs. 2',
    note: 'Neun explizite Feiertage aus § 1 plus die drei im Ladenöffnungsrecht § 5 Abs. 2 benannten Sonntage Ostern, Pfingsten, Bettag. Keine eigenständige gesetzliche Kategorie hohe Feiertage behauptet. VRG-Liste separat.' },
  { canton: 'ZG', scope: 'ZG-VRG-ART10', source: IDS.zgVrg, keys: ZG_VRG, kind: 'procedure',
    locator: '§ 10 Abs. 3 und 4', name: 'VRG, eigene Fristenliste',
    note: '16 eigenständig aufgezählte Tage. Einschliesslich Berchtoldstag, Oster- und Pfingstmontag sowie Stephanstag. Diese Liste ist nicht auf das allgemeine Ruhe-/Arbeitsrecht zu übertragen. Bundesrecht bleibt vorbehalten.' },
  { canton: 'GL', scope: 'GL-RTG-ALL', source: IDS.glRest, keys: ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY', 'ASCENSION',
    'PENTECOST', 'WHIT-MONDAY', 'NATIONAL-DAY', 'FEDERAL-FAST', 'ALL-SAINTS', 'CHRISTMAS', 'ST-STEPHEN'], kind: 'rest',
    locator: 'Art. 2 Abs. 1 Bst. b und c, ohne offenen Datumsfall Fahrtsfest',
    note: 'Unvollständiges Datumsprofil. 12 der 13 benannten RTG-Tage berechenbar. Fahrtsfest fehlt bewusst wegen GAP-GL-FAHRT-APRIL. Keine Einmalregel oder unbedingte April-Donnerstagsregel als ewiger Ersatz. Kantonale Fach-/Produktfreigabe offen.' }
];

function sources() {
  const s = (id, canton, title, locator, url, version, note) => [id, `CH-${canton}`, title, locator, url, version, CHECKED, `${note} ${LANGUAGE_NOTE}`, 'open', null];
  return [
    s(IDS.luRest, 'LU', 'Ruhetags- und Ladenschlussgesetz, RLG', 'SRL 855, § 1a Abs. 1–3 und § 2',
      'https://srl.lu.ch/data/855/de', '2020-05-01', 'Erlass 23.11.1987. Aktiver Stand über amtliche Sammlung und LexFind/Swiss Caselaw abgeglichen. Kommunale Erklärungen nach § 1a Abs. 1c ausgeschlossen.'),
    s(IDS.luVrg, 'LU', 'Gesetz über die Verwaltungsrechtspflege, VRG', 'SRL 40, § 34 Abs. 1 und 2',
      'https://srl.lu.ch/data/40/de', '2021-09-01', 'Drei zusätzliche Tage. Öffentliche Ruhetage gelten unter ausdrücklicher Ausnahme Josefstag/Patrozinium. Rückwärtszählung gesondert. Erhebung aktiviert keinen VRG-LU-Rechner.'),
    s(IDS.luJusg, 'LU', 'Justizgesetz, JusG', 'SRL 260, § 76',
      'https://srl.lu.ch/data/260/de', '2026-01-01', 'Eigene Liste von 13 Tagen für ZPO/StPO. Geltende Fassung mit Beschluss 20.10.2025 geprüft. Keine allgemeine ArG-Liste.'),
    s(IDS.urRest, 'UR', 'Gesetz über den Ladenschluss und die Sonntagsruhe, LSG', 'RB 70.1421, Art. 9 und 10',
      'https://rechtsbuch.ur.ch/api/de/versions/963/pdf_file', '2003-01-01', 'Amtlicher Text nennt Erlass 09.02.2003 und Stand/Inkrafttreten 01.01.2003. Datierung unverändert wiedergegeben. 14 kantonsweite Tage, Gemeindefeiertage separat ausgeschlossen.'),
    s(IDS.urLabour, 'UR', 'Kantonale Arbeitsverordnung, KAV', 'RB 20.1111, Art. 6',
      'https://rechtsbuch.ur.ch/data/20.1111/de', '2002-02-01', 'Acht kantonale arbeitsgesetzliche Feiertage. LSG Art. 10 verweist darauf. Keine Übernahme sämtlicher 14 LSG-Tage in ArG.'),
    s(IDS.urInfo, 'UR', 'Amt für Arbeit und Migration, Feiertage im Kanton Uri', 'Ausgabe 04/2023, Stand 06.04.2023, S. 1',
      'https://www.ur.ch/publikationen/6581', null, 'Amtlicher Listenabgleich 14 LSG-Tage versus neun sonntagsgleiche Tage einschliesslich Bundesfeier. Publikationsstand ist kein eigener Normstand.'),
    s(IDS.szRest, 'SZ', 'Ruhetagsgesetz', 'SRSZ 545.110, § 2 Abs. 1 und 2',
      'https://www.sz.ch/public/upload/assets/28055/545_110.pdf', '2018-07-01', 'Erlass 21.11.2001. Letzte im PDF belegte Änderung in Kraft 01.07.2018, PDF-Ausgabe SRSZ 01.02.2019 ist kein neues Inkrafttreten. 17 kantonsweite benannte Tage.'),
    s(IDS.szInfo, 'SZ', 'Amt für Arbeit, Feiertagsregelung Kanton Schwyz', 'Ziff. 1–4',
      'https://www.sz.ch/public/upload/assets/36693/Feiertagsregelung_Kanton_Schwyz.pdf?fp=6', null, 'Aktuell verlinktes amtliches Merkblatt. Interner Dateiname enthält 20251211, kein eigener Normstand abgeleitet. Kommunal festgelegte Patronstage ausdrücklich nicht übernommen.'),
    s(IDS.owRest, 'OW', 'Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz', 'GDB 975.2, Art. 2 Abs. 1–3',
      'https://gdb.ow.ch/api/de/versions/103/pdf_file', '2009-08-01', 'Erlass 27.04.2007, geltender Stand 01.08.2009. Bruderklausenfest 25.09. ausdrücklich in Abs. 1b. Abs. 3 enthält engere ArG-Liste.'),
    s(IDS.nwRest, 'NW', 'Gesetz über die öffentlichen Ruhetage, RTG', 'NG 921.1, Art. 2 Abs. 1 und 2',
      'https://gesetze.nw.ch/app/de/texts_of_law/921.1', '2016-01-01', 'Erlass 01.06.2005, geltender Stand 01.01.2016. Dreizehn benannte Tage. Kommunale Reglemente nach Abs. 1 Ziff. 4 sind ausserhalb Erhebung.'),
    s(IDS.zgRest, 'ZG', 'Ruhetags- und Ladenöffnungsgesetz', 'BGS 942.31, § 1 und § 5 Abs. 2',
      'https://bgs.zg.ch/app/de/texts_of_law/942.31', '2025-08-22', 'Erlass 28.08.2003. Aktuelle Fassung Stand 22.08.2025. Neun Feiertage plus drei namentliche Sonntage im Ladenöffnungs-Ausnahmekatalog. Kein gleichlautender VRG-Katalog.'),
    s(IDS.zgVrg, 'ZG', 'Gesetz über den Rechtsschutz in Verwaltungssachen, VRG', 'BGS 162.1, § 1 Abs. 2 und § 10 Abs. 3–4',
      'https://bgs.zg.ch/app/de/texts_of_law/162.1/versions/2740', '2025-10-17', 'Erlass 01.04.1976. Eigene Fristenliste mit 16 Tagen. Aktueller Stand über LexFind/Swiss Caselaw und amtlichen Normtext verifiziert.'),
    s(IDS.zgInfo, 'ZG', 'Amt für Wirtschaft und Arbeit, Feiertage 2026 und 2027', 'Jahreslisten 2026/2027 und Hinweis zu feiertagsähnlichen Tagen',
      'https://zg.ch/dam/jcr:d241f3f6-4c0c-4bb2-9096-b53dd371501c/Feiertage_2026_2027_Kt-ZG_Daten.pdf', null,
      '18 amtliche Datumswerte zur Neuner-Grundliste geprüft. Berchtold, Oster-/Pfingstmontag und Stephanstag sind arbeitsrechtlich nicht automatisch frei. Daraus folgt kein Ausschluss ihrer ausdrücklichen VRG-Fristwirkung.'),
    s(IDS.glRest, 'GL', 'Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz', 'GS IX B/21/1, Art. 2 Abs. 1 und 5 / Art. 7',
      'https://gesetze.gl.ch/api/de/versions/2110/pdf_file', '2019-07-01', 'Erlass 06.05.2012. Dreizehn benannte Tage, davon Fahrtsfest in GAP-GL-FAHRT-APRIL ungeklärt modellierbar. Art. 2 Abs. 5 gilt für nicht auf Sonntag fallende Ruhetage. Ladenöffnungsausnahmen erzeugen keine neuen Feiertage.'),
    s(IDS.glFahrtLaw, 'GL', 'Gesetz betreffend die Feier der Näfelser Fahrt', 'GS I A/3/1, Art. 7',
      'https://gesetze.gl.ch/data/I-A.3.1/de', '1835-05-24', 'Art. 7 beauftragt den Regierungsrat mit dem jährlichen Programm. Das Gesetz enthält keine ausformulierte April-/Karwochen-Datumsformel. Keine solche Formel als Gesetzeszitat ausgeben.'),
    s(IDS.glFahrt2026, 'GL', 'Regierungsrat, Näfelser Fahrt 2026', 'Regierungsratssitzung 06.01.2026, Termin und Karwochen-Ausnahme',
      'https://www.gl.ch/public-newsroom.html/31/newsroomnews/14237/title/n%C3%A4felser-fahrt', null,
      'Amtlich 09.04.2026. Erklärung: erster Donnerstag im April, bei Karwoche Verschiebung um eine Woche. Bedingung ist mit Vertrag 0.5.0 nicht als unbefristete Einzelregel abgebildet. GAP-GL-FAHRT-APRIL.')
  ];
}

function locator(profile, key) {
  if (profile.kind === 'procedure') return profile.locator;
  if (key === 'NATIONAL-DAY') return 'SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil';
  if (profile.canton === 'LU') return HIGH.includes(key) ? '§ 2 / § 1a Abs. 1' : '§ 1a Abs. 1 Bst. b und Abs. 2';
  if (profile.canton === 'SZ') return [...HIGH, 'ALL-SAINTS'].includes(key) ? '§ 2 Abs. 1 Ziff. 2' : '§ 2 Abs. 1 Ziff. 3';
  if (profile.canton === 'OW') return HIGH.includes(key) ? 'Art. 2 Abs. 1 Bst. c' : 'Art. 2 Abs. 1 Bst. b';
  if (profile.canton === 'NW') return HIGH.includes(key) ? 'Art. 2 Abs. 1 Ziff. 2' : 'Art. 2 Abs. 1 Ziff. 3';
  if (profile.canton === 'ZG') return ['EASTER', 'PENTECOST', 'FEDERAL-FAST'].includes(key) ? '§ 5 Abs. 2, benannter Sonntag / § 1 Abs. 1 Bst. a' : '§ 1 Abs. 1 Bst. b';
  if (profile.canton === 'GL') return HIGH.includes(key) ? 'Art. 2 Abs. 1 Bst. c' : 'Art. 2 Abs. 1 Bst. b';
  return profile.locator;
}

export function createCentralAdditions(base) {
  if (base.contractVersion !== '0.5.0' || !base.sources.some(row => row[0] === CH_SOURCE)) throw new Error('Expected contract 0.5 base with federal source');
  const definitions = { ...base.holidayDefinitions,
    'BRUDER-KLAUS': { labels: { de: 'Bruderklausenfest', fr: 'Fête de saint Nicolas de Flue' }, calculation: { type: 'fixedMonthDay', month: 9, day: 25 } } };
  const rules = PROFILES.flatMap(profile => profile.keys.map(key => {
    const definition = definitions[key];
    const donor = base.rules.find(rule => base.ruleKeys[rule.id] === key && rule.it && rule.rm);
    const labels = { de: definition.labels.de, fr: definition.labels.fr, it: donor?.it ?? '', rm: donor?.rm ?? '' };
    if (key === 'BRUDER-KLAUS') Object.assign(labels, { it: 'San Nicolao della Flüe', rm: 'Sontg Clau da Flia' });
    if (!labels.it || !labels.rm) throw new Error(`Missing provisional name for ${key}`);
    return { id: `${profile.scope}-DAY-${key}`, jurisdiction: `CH-${profile.canton}`, scope: profile.scope, ...labels,
      category: profile.kind === 'procedure' ? 'proceduralEquivalentDay' : 'publicHoliday',
      calculation: structuredClone(definition.calculation), from: FROM, to: null,
      source: key === 'NATIONAL-DAY' && profile.kind === 'rest' ? CH_SOURCE : profile.source,
      locator: locator(profile, key), status: 'open', approvalBasis: null, priority: 100,
      action: 'add', target: null, exportClass: 'blockedEffect', reference: null, dayPortion: 'fullDay' };
  }));
  const scopes = PROFILES.map(p => [p.scope, `CH-${p.canton}`, `${NAMES[p.canton].de}, ${p.name ?? 'kantonsweite Ruhetagsliste'}`,
    'Kanton', p.note, p.source, p.locator, 'open', FROM, null]);
  const assignments = PROFILES.map(p => ({ id: `AREA-${p.scope}-CANTON`, scopeId: p.scope, areaId: `GEO-${p.canton}`,
    ...NAMES[p.canton], areaType: 'Kanton', parentAreaId: 'GEO-CH', effect: 'include', officialIdSystem: '', officialId: '',
    from: FROM, to: null, sourceId: p.source, locator: p.locator, status: 'open',
    note: `Kantonsweites gesetzliches Profil. Keine separate kommunale Norm erhoben. ${LANGUAGE_NOTE}` }));
  const mappings = [];
  const addMapping = (id, p, category, context, note, law, status = 'blocked') => mappings.push([id, p.scope, category, context, note, law, status, null]);
  for (const p of PROFILES.filter(p => p.kind === 'rest')) {
    addMapping(`MAP-${p.scope}-REST`, p, 'publicHoliday', 'Öffentliche Ruhe / benannte Sonn- und Feiertage',
      `${p.note} Kein universelles Fristenprofil.`, p.locator);
    addMapping(`MAP-${p.scope}-PROCEDURE`, p, 'publicHoliday', 'Verfahrensrechtliche Zuordnung vor Produkteinsatz',
      'ZPO, StPO, BGG, SchKG, ATSG und kantonales Verfahrensrecht benötigen eine eigenständige Zuordnung samt gesetzlichem Ortsbezug. Keine Ableitung aus Personal-/Ladenschliessung. Dieses Kantonspaket gibt keine Automatik frei.',
      'Jeweils anwendbares Verfahrensrecht / hier belegtes kantonales Ruhetagsrecht');
    let keys = CATHOLIC_ARG, legal = p.locator;
    if (p.canton === 'LU') { keys = CATHOLIC_ARG.filter(k => k !== 'IMMACULATE-CONCEPTION').concat('ST-STEPHEN'); legal = 'SRL 855 § 1a Abs. 3'; }
    if (p.canton === 'UR') legal = 'RB 20.1111 Art. 6 / RB 70.1421 Art. 10';
    if (p.canton === 'SZ') { keys = CATHOLIC_ARG.filter(k => k !== 'IMMACULATE-CONCEPTION').concat('ST-JOSEPH'); legal = 'SRSZ 545.110 § 2 Abs. 2'; }
    if (p.canton === 'OW') legal = 'GDB 975.2 Art. 2 Abs. 3';
    if (p.canton === 'NW') legal = 'NG 921.1 Art. 2 Abs. 2';
    if (p.canton === 'ZG') legal = 'BGS 942.31 § 1 Abs. 2';
    const note = p.canton === 'GL'
      ? 'Art. 2 Abs. 5 stellt die nicht auf Sonntag fallenden öffentlichen Ruhetage arbeitsrechtlich gleich. Fahrtsfest bleibt GAP-GL-FAHRT-APRIL. Diese Bedingung begründet keine allgemeine Fristenwirkung und erzeugt keinen Ersatzmontag.'
      : `Nur diese acht kantonalen Tage sind arbeitsrechtlich sonntagsgleich: ${keys.map(key => definitions[key].labels.de).join(', ')}. Bundesfeiertag gesondert. Keine Gleichstellung der gesamten Ruhetagsliste und keine Prozessfreigabe.`;
    addMapping(`MAP-${p.scope}-LABOUR`, p, 'labourLawHoliday', 'Arbeitsrechtliche Teilmenge, kein Fristenautomatismus', note,
      p.canton === 'GL' ? 'GS IX B/21/1 Art. 2 Abs. 5' : legal);
  }
  for (const canton of ['LU', 'UR', 'SZ', 'OW', 'NW']) {
    const p = PROFILES.find(p => p.canton === canton && p.kind === 'rest');
    addMapping(`MAP-${p.scope}-LOCAL-OUT`, p, 'publicHoliday', 'Kommunal erklärte zusätzliche Feiertage, nicht erhoben',
      'Kantonale Ermächtigung ersetzt die notwendige kommunale Festlegung nicht. Selbständige kommunale Normen sind ausserhalb des bestätigten Auftrags. Keine pauschale Aussage, sie seien in allen Verfahren bedeutungslos.',
      ({ LU: 'SRL 855 § 1a Abs. 1 Bst. c', UR: 'RB 70.1421 Art. 9 Abs. 1 Bst. c', SZ: 'SRSZ 545.110 § 2 Abs. 1 Ziff. 4', OW: 'GDB 975.2 Art. 2 Abs. 2', NW: 'NG 921.1 Art. 2 Abs. 1 Ziff. 4' })[canton]);
  }
  for (const p of PROFILES.filter(p => p.kind === 'procedure')) addMapping(`MAP-${p.scope}-PROCEDURE`, p, 'proceduralEquivalentDay',
    p.name, `${p.note} Fachabnahme und Produktzuordnung bleiben offen.`, p.locator, 'open');
  const gl = PROFILES.find(p => p.canton === 'GL');
  addMapping('MAP-GL-FAHRT-GAP', gl, 'publicHoliday', 'GAP-GL-FAHRT-APRIL, nicht berechneter Feiertag',
    'GAP-GL-FAHRT-APRIL: Feiertag rechtlich belegt. Erster Donnerstag im April, bei Karwoche eine Woche später. 2026 amtlich 9. April. Bedingte Datumslogik fehlt in Vertrag 0.5.0. Nicht durch feste Einzeldaten oder eine unbedingte Formel ersetzt.',
    'GS IX B/21/1 Art. 2 Abs. 1b / GS I A/3/1 Art. 7 / RR 06.01.2026');
  const newSources = sources();
  return { rules, scopes, sources: newSources, mappings, assignments, areaSourceEvidence: [],
    reviews: newSources.map((source, i) => [`AP18B04-CENTRAL-SOURCE-${String(i + 1).padStart(2, '0')}`, source[0], 'newScope', CHECKED,
      'unclear', null, `${source[7]} Neuaufnahme als Prüfgrundlage, keine Fach- oder Produktfreigabe.`, 'candidate', 'David Steimer', 'Codex',
      'Quellen-/Profilprüfung und provisorische Sprachnamen abnehmen. Glarus bleibt wegen GAP-GL-FAHRT-APRIL ausdrücklich unvollständig.']),
    scopeLabels: Object.fromEntries(PROFILES.map(p => [p.scope, p.kind === 'rest'
      ? { fr: `${NAMES[p.canton].fr}, jours de repos cantonaux`, it: `${NAMES[p.canton].it}, giorni di riposo cantonali`, rm: `${NAMES[p.canton].rm}, dis da ruaus chantunals` }
      : p.scope === 'LU-VRG-ADDITIONAL'
        ? { fr: 'Lucerne, trois jours supplémentaires VRG', it: 'Lucerna, tre giorni supplementari VRG', rm: 'Lucerna, trais dis supplementars VRG' }
        : { fr: `${NAMES[p.canton].fr}, liste des délais ${p.canton === 'LU' ? 'JusG' : 'VRG'}`, it: `${NAMES[p.canton].it}, elenco dei termini ${p.canton === 'LU' ? 'JusG' : 'VRG'}`, rm: `${NAMES[p.canton].rm}, glista da termins ${p.canton === 'LU' ? 'JusG' : 'VRG'}` }])),
    jurisdictionLabels: Object.fromEntries(Object.entries(NAMES).map(([code, names]) => [`CH-${code}`, { it: names.it, rm: names.rm }])),
    ruleKeys: Object.fromEntries(PROFILES.flatMap(p => p.keys.map(key => [`${p.scope}-DAY-${key}`, key]))),
    holidayDefinitions: { 'BRUDER-KLAUS': definitions['BRUDER-KLAUS'] },
    pendingCases: [{ id: 'GAP-GL-FAHRT-APRIL', canton: 'CH-GL', holiday: 'Fahrtsfest / Näfelser Fahrt',
      reason: 'Erster Donnerstag im April, bei Karwoche um eine Woche verschoben. Bedingte Verknüpfung mit Ostern ausserhalb Vertrag 0.5.0. Keine berechenbare Regel erfasst.',
      sourceIds: [IDS.glRest, IDS.glFahrtLaw, IDS.glFahrt2026], locator: 'GS IX B/21/1 Art. 2 Abs. 1b / GS I A/3/1 Art. 7 / RR 06.01.2026', status: 'contractGap' }],
    notes: { sourceDate: CHECKED, cantonCount: 7, profiles: PROFILES.map(p => ({ scope: p.scope, ruleCount: p.keys.length })),
      pendingCaseCount: 1, omittedKnownNamedDays: ['GL Fahrtsfest'], municipalLawIncluded: false,
      languageApproval: false, proceduralApproval: false, inheritedApproval: false } };
}
