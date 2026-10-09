// SPDX-License-Identifier: AGPL-3.0-only
// AP18B-04 review additions. No product export or legal approval.
const CHECKED = '2026-09-13';
const FROM = '2026-01-01';
const FEDERAL = 'SRC-BUNDESFEIERTAG-19940701';
const ID = {
  zh: 'SRC-ZH-RLG-8224-N045', gog: 'SRC-ZH-GOG-2111-N131', zhInfo: 'SRC-ZH-AWA-FEIERTAGE-2026',
  sh: 'SRC-SH-RTG-900200-V1886', shCase: 'SRC-SH-OGE-4020181K-20180824',
  tg: 'SRC-TG-RTG-8229-V2949', sg: 'SRC-SG-RLG-5521-V228', sgCase: 'SRC-SG-KGER-FS20121-20120329',
  ar: 'SRC-AR-ARGV-82211-V1058', ai: 'SRC-AI-RTG-822200-V1327', aiInfo: 'SRC-AI-RUHETAGE-INFO-2026',
  aiDates: 'SRC-AI-RUHETAGE-LISTE-2026', aiArea: 'SRC-AI-INNERRHODEN-ZAHLEN-2025', aiReport: 'SRC-AI-STK-FEIERTAGE-20150929'
};
const BASIC = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER-MONDAY', 'ASCENSION', 'WHIT-MONDAY', 'NATIONAL-DAY', 'CHRISTMAS', 'ST-STEPHEN'];
const HIGH_SUNDAYS = ['EASTER', 'PENTECOST', 'FEDERAL-FAST'];
const NINE = [...BASIC, 'MAY1'];
const PROFILES = [
  ['ZH-RLG-ALL', 'CH-ZH', 'Zürich, RLG-Ruhetage', ID.zh, '§ 1 Abs. 1 und 2', [...NINE, ...HIGH_SUNDAYS], 'publicHoliday',
    'Neun namentliche Nichtsonntagstage und drei eigens benannte hohe Sonntage. Berchtoldstag, Sechseläuten und Knabenschiessen nicht in dieser RLG-Liste.'],
  ['ZH-GOG-ALL', 'CH-ZH', 'Zürich, GOG-Fristenliste', ID.gog, '§ 122', [...NINE, 'BERCHTOLD'], 'proceduralEquivalentDay',
    'Eigenständige Liste von zehn Tagen nach § 122 GOG einschliesslich Berchtoldstag. Keine allgemeine Arbeitsfeiertagsliste und keine pauschale Zuordnung aller Verfahren.'],
  ['SH-RTG-ALL', 'CH-SH', 'Schaffhausen, RTG-Ruhetage', ID.sh, 'Art. 1 Abs. 1 und Art. 2', [...NINE, ...HIGH_SUNDAYS], 'publicHoliday',
    'Neun namentliche Nichtsonntagstage und drei eigens benannte hohe Sonntage. Berchtoldstag nur im gesonderten ZPO-Ergänzungsprofil.'],
  ['SH-ZPO-ADDITIONAL', 'CH-SH', 'Schaffhausen, ZPO-Ergänzung Berchtoldstag', ID.shCase, 'OGE 40/2018/1/K, E. 2.1.1–2.1.4', ['BERCHTOLD'], 'proceduralEquivalentDay',
    'Nur Ergänzung zum passenden Grundprofil, keine vollständige Feiertagsliste. ZPO-Rechtsprechung, keine automatische Wirkung auf StPO, BGG, ATSG oder Verwaltungsrecht.'],
  ['TG-RTG-ALL', 'CH-TG', 'Thurgau, RTG-Ruhetage ab 2026', ID.tg, '§ 1 und § 2', [...NINE, 'BERCHTOLD', ...HIGH_SUNDAYS], 'publicHoliday',
    'Neues RTG vom 05.02.2025, Stand 01.01.2026. Zehn namentliche Nichtsonntagstage und drei eigens benannte hohe Sonntage. Nicht auf die aufgehobene RTG-Fassung abstellen.'],
  ['SG-RLG-ALL', 'CH-SG', 'St. Gallen, RLG-Ruhetage', ID.sg, 'Art. 2 und Art. 3', [...BASIC, 'ALL-SAINTS', ...HIGH_SUNDAYS], 'publicHoliday',
    'Neun namentliche Nichtsonntagstage und drei eigens benannte hohe Sonntage. Kein 1. Mai, kein Fronleichnam. Berchtoldstag als gesonderte ZPO-Ergänzung.'],
  ['SG-ZPO-ADDITIONAL', 'CH-SG', 'St. Gallen, ZPO-Ergänzung Berchtoldstag', ID.sgCase, 'FS.2012.1, Erwägungen zur Fristwahrung', ['BERCHTOLD'], 'proceduralEquivalentDay',
    'Nur Ergänzung zum passenden Grundprofil, keine vollständige Feiertagsliste. Entscheid 29.03.2012, nicht Datum des vorinstanzlichen Entscheids 24.11.2011.'],
  ['AR-ARG-ALL', 'CH-AR', 'Appenzell Ausserrhoden, Arbeitsfeiertage ohne bedingten Stephanstag', ID.ar, 'Art. 7', BASIC.filter(key => key !== 'ST-STEPHEN'), 'labourLawHoliday',
    'Sechs unbedingte kantonale Tage plus offene Bundesanwendung. Bedingter zweiter Weihnachtstag NICHT generiert. Fehlende Wochentagsbedingung als explizite Vertragslücke dokumentiert. Keine Vollständigkeit dieses Teilprofils behauptet.'],
  ['AI-RTG-ALL', 'CH-AI', 'Appenzell Innerrhoden, kantonsweite RTG-Tage ohne bedingten Stephanstag', ID.ai, 'Art. 2 Abs. 1 Bst. b und c sowie Art. 3',
    [...BASIC.filter(key => key !== 'ST-STEPHEN'), 'CORPUS-CHRISTI', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', ...HIGH_SUNDAYS], 'publicHoliday',
    '14 unbedingte Tage einschliesslich Bundesanwendung und dreier benannter Sonntage. Die drei kantonal geregelten lokalen Tage gelten hier kantonsweit, St. Mauritius separat nur im inneren Landesteil. Bedingter Stephanstag und amtlicher Quellenkonflikt bleiben offen.'],
  ['AI-RTG-INNER-ADDITIONAL', 'CH-AI', 'Appenzell Innerrhoden, St. Mauritius im inneren Landesteil', ID.ai, 'Art. 2 Abs. 1 Bst. c', ['MAURITIUS'], 'publicHoliday',
    'Nur regionale Ergänzung am 22. September. Innerer Landesteil mit Appenzell, Schwende-Rüte, Schlatt-Haslen und Gonten. Kein Einbezug von Oberegg. Grundlage ist kantonales Recht, kein eigenständiges kommunales Fest.']
];
const NAMES = {
  'CH-ZH': { de: 'Zürich', fr: 'Zurich', it: 'Zurigo', rm: 'Turitg' },
  'CH-SH': { de: 'Schaffhausen', fr: 'Schaffhouse', it: 'Sciaffusa', rm: 'Schaffusa' },
  'CH-TG': { de: 'Thurgau', fr: 'Thurgovie', it: 'Turgovia', rm: 'Turgovia' },
  'CH-SG': { de: 'St. Gallen', fr: 'Saint-Gall', it: 'San Gallo', rm: 'Son Gagl' },
  'CH-AR': { de: 'Appenzell Ausserrhoden', fr: 'Appenzell Rhodes-Extérieures', it: 'Appenzello Esterno', rm: 'Appenzell Dadora' },
  'CH-AI': { de: 'Appenzell Innerrhoden', fr: 'Appenzell Rhodes-Intérieures', it: 'Appenzello Interno', rm: 'Appenzell Dadens' }
};
const LANGUAGE_NOTE = 'DE-Normbegriffe normalisiert. Gemeinsame FR/IT/RM-Produktnamen aus Vorbestand, neue Bereichs- und Kantonsübersetzungen sowie St. Mauritius provisorisch. Keine neue amtliche Sprachfassung oder Sprachabnahme behauptet.';
const EXTRA = { MAURITIUS: { labels: { de: 'St. Mauritiustag', fr: 'Saint-Maurice', it: 'San Maurizio', rm: 'Son Murezi' }, calculation: { type: 'fixedMonthDay', month: 9, day: 22 } } };

function sourceRows() {
  const row = (id, canton, title, locator, url, version, note) => [id, canton, title, locator, url, version, CHECKED, `${note} ${LANGUAGE_NOTE}`, 'open', null];
  return [
    row(ID.zh, 'CH-ZH', 'Ruhetags- und Ladenöffnungsgesetz, RLG', 'LS 822.4, § 1, Nachtrag 045',
      'https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/663A7F8F1929F218C1256EB7002E6A05/%24File/822.4_26.6.00_45.pdf', '2004-07-01',
      'Erlass 26.06.2000. Aktueller Nachtrag 045 laut ZH-Lex, Publikationsstand 01.07.2004, einzelne letzte Inkraftsetzung 01.05.2004. Drei hohe Sonntage ergänzen die neun Nichtsonntagstage.'),
    row(ID.gog, 'CH-ZH', 'Gesetz über die Gerichts- und Behördenorganisation im Zivil- und Strafprozess, GOG', 'LS 211.1, § 122, Nachtrag 131',
      'https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/43B3BDA36DB02CBDC1258D4C004EC591/%24File/211.1_10.5.10_131.pdf', '2026-01-01',
      'Erlass 10.05.2010. Aktueller Nachtrag 131 und zehn Tage unmittelbar im geltenden PDF gelesen. GOG-Berchtoldstag nicht in die RLG-Arbeitsfeiertagsliste übertragen.'),
    row(ID.zhInfo, 'CH-ZH', 'Amt für Wirtschaft, Feiertage', 'Gesetzliche Feiertage 2025/2026 und Abgrenzung lokaler Tage',
      'https://www.zh.ch/de/wirtschaft-arbeit/arbeitsbedingungen/arbeitsssicherheit-gesundheitsschutz/arbeits-ruhezeiten/feiertage.html', null,
      'Neun arbeitsrechtliche Feiertage, Datumsvergleich 2026. Die Seite warnt ausdrücklich vor Verwechslung mit BJ-Fristenverzeichnis. Berchtoldstag, Sechseläuten und Knabenschiessen arbeitsrechtlich nicht allgemein gesetzlich.'),
    row(ID.sh, 'CH-SH', 'Gesetz betreffend die öffentlichen Ruhetage und den Ladenschluss, Ruhetagsgesetz', 'SHR 900.200, Art. 1 und 2, Version 1886',
      'https://rechtsbuch.sh.ch/api/de/versions/1886/pdf_file', '2007-01-01',
      'Erlass 05.12.1977. Neun Nichtsonntagstage einschliesslich 1. Mai, drei benannte hohe Sonntage. Art. 1 Abs. 2 verweist für arbeitsrechtliche Gleichstellung auf separate Verordnung, kein personeller Kalender.'),
    row(ID.shCase, 'CH-SH', 'Obergericht, OGE 40/2018/1/K vom 24.08.2018', 'Amtsbericht 2018, S. 84–87, E. 2.1.1–2.1.4',
      'https://sh.ch/CMS/get/file/771a1a2e-4ef2-47bb-9b04-f4afc5aed3ea', '2018-08-24',
      'Entscheidsdatum, kein Normversionsdatum. Amtlicher Volltext plus Entscheidsuche und OpenCaseLaw abgeglichen. Berchtoldstag für Art. 142 Abs. 3 ZPO anerkannt. Publikationsdatum 02.02.2021 nicht als Entscheidsdatum übernehmen.'),
    row(ID.tg, 'CH-TG', 'Ruhetagsgesetz, RTG', 'RB 822.9, § 1 und 2, Version 2949',
      'https://www.rechtsbuch.tg.ch/api/de/versions/2949/pdf_file', '2026-01-01',
      'Neuer Erlass vom 05.02.2025, in Kraft 01.01.2026. Zehn namentliche Nichtsonntagstage einschliesslich 2. Januar und 1. Mai. Hohe Sonntage einzeln, keine Sonntagsserie.'),
    row(ID.sg, 'CH-SG', 'Gesetz über Ruhetag und Ladenöffnung, RLG', 'sGS 552.1, Art. 2 und 3, Version 228',
      'https://www.gesetzessammlung.sg.ch/api/de/versions/228/pdf_file', '2008-01-22',
      'Erlass 29.06.2004, PDF-Stand 22.01.2008. Neun namentliche Nichtsonntagstage plus drei hohe Sonntage. Allerheiligen enthalten, Berchtoldstag fehlt in der RLG-Liste.'),
    row(ID.sgCase, 'CH-SG', 'Kantonsgericht, Einzelrichter im Familienrecht, FS.2012.1 vom 29.03.2012', 'Erwägungen zur Fristwahrung am Berchtoldstag, Publikation 18.02.2020',
      'https://publikationen.sg.ch/rechtsprechung-gerichte-detail/6031/', '2012-03-29',
      'Entscheidsdatum, kein Normversionsdatum. Volltext via OpenCaseLaw und amtliche Publikationsmetadaten/Entscheidsuche. Ein OpenCaseLaw-Datensatz ordnet fälschlich das Vorinstanzdatum 24.11.2011 zu, Titel und Volltext nennen 29.03.2012. Nur ZPO-Ergänzung, keine allgemeine Feiertagsfreigabe.'),
    row(ID.ar, 'CH-AR', 'Verordnung zum Bundesgesetz über die Arbeit in Industrie, Gewerbe und Handel', 'bGS 822.11, Art. 7, Version 1058',
      'https://ar.clex.ch/api/de/versions/1058/pdf_file', '2016-01-01',
      'Erlass 21.02.1966. Zweiter Weihnachtstag entfällt bei Weihnachten Montag oder Freitag. Sieben regelbasierte Einträge einschliesslich Bundesanwendung, bedingter Stephanstag bewusst nicht als fixe Jahresregel erfasst.'),
    row(ID.ai, 'CH-AI', 'Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz', 'GS 822.200, Art. 2 und 3, Version 1327',
      'https://ai.clex.ch/api/de/versions/1327/pdf_file', '2011-01-01',
      'Erlass 25.04.1982. Drei weitere lokale Tage kantonsweit, St. Mauritius nur innerer Landesteil. Stephanstag nur ohne drei aufeinanderfolgende Ruhetage. Bedingung unter 0.5.0 nicht generierbar, Widerspruch zur Liste 26.12.2026 offen.'),
    row(ID.aiInfo, 'CH-AI', 'Kantonale Informationsseite Feiertage / Ruhetage', 'Öffentliche Ruhetage und geschlossene Verwaltungstage',
      'https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage', null,
      'Amtliche Erläuterung bestätigt Bedingung des Stephanstags und Unterschied kantonaler lokaler Ruhetage zur arbeitsrechtlichen Gleichstellung. 2. Januar, Freitag nach Auffahrt, 24. und 31. Dezember sind gesonderte Schliessungstage und werden nicht als allgemeine Feiertage erzeugt.'),
    row(ID.aiDates, 'CH-AI', 'Kantonale Auflistung der bevorstehenden Feiertage', 'St. Mauritius 22.09.2026 und Stephanstag 26.12.2026',
      'https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/feiertage', null,
      'Datumsbeleg für St. Mauritius. Liste nennt Stephanstag 26.12.2026 als Sonntagsgleichstellung trotz Freitags-Weihnachten. Möglicher Widerspruch zu Art. 2 Abs. 1 Bst. b, nicht durch Annahme aufgelöst. Nur kommende Jahrestermine, keine vollständige Jahresliste.'),
    row(ID.aiArea, 'CH-AI', 'Innerrhoden in Zahlen, amtlicher Einwohnerbestand', 'Gebietstabelle Stand 31.12.2025, Quelle Einwohnerkontrolle',
      'https://ai.ch/land-und-leute/innerrhoden-in-zahlen', null,
      'Territorialer Beleg für inneren Landesteil: Appenzell, Schwende-Rüte, Schlatt-Haslen und Gonten. Oberegg separat. Fussnoten ordnen Wonnenstein statistisch Schlatt-Haslen, Grimmenstein Oberegg zu, keine eigene Normauslegung zur Feiertagsgeltung auf Klosterparzellen.'),
    row(ID.aiReport, 'CH-AI', 'Standeskommission, Überprüfung der Feiertage im Kanton', 'Bericht 29.09.2015, Ziff. 2, 3 und 4.3, S. 3–4 und 7',
      'https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/dokumente/20150929-stk-bericht-feiertage.pdf', '2015-09-29',
      'Materialie, kein aktueller Erlass. Erläutert kantonale gesetzliche Verankerung der lokalen Tage und nennt Samstag/Dienstag als Ausschluss des Stephanstags. Stützt Quellenkonflikt zur 2026-Liste, ersetzt keine heutige Norm. Keine Reformideen übernommen.')
  ];
}

export function createEastAdditions(base) {
  if (base.contractVersion !== '0.5.0' || !base.sources.some(row => row[0] === FEDERAL)) throw new Error('Expected contract 0.5 base with federal source');
  const definitions = { ...base.holidayDefinitions, ...EXTRA };
  const rules = PROFILES.flatMap(([scope, jurisdiction, , source, locator, keys, category]) => keys.map(key => {
    const definition = definitions[key];
    if (!definition) throw new Error(`Missing holiday definition ${key}`);
    const donor = base.rules.find(rule => base.ruleKeys[rule.id] === key && rule.it && rule.rm);
    const labels = { ...definition.labels, it: donor?.it ?? definition.labels.it ?? '', rm: donor?.rm ?? definition.labels.rm ?? '' };
    if (key === 'BERCHTOLD') Object.assign(labels, { it: 'Giorno di Berchtold', rm: 'Di da Berchtold' });
    if (!labels.it || !labels.rm) throw new Error(`Missing provisional language ${key}`);
    const federal = key === 'NATIONAL-DAY' && category !== 'proceduralEquivalentDay';
    return { id: `${scope}-DAY-${key}`, jurisdiction, scope, ...labels,
      category: federal ? 'publicHoliday' : category, calculation: structuredClone(definition.calculation),
      from: FROM, to: null, source: federal ? FEDERAL : source,
      locator: federal ? 'SR 116 Art. 1, offene Anwendung auf neues kantonales Profil' : locator,
      status: 'open', approvalBasis: null, priority: 100, action: 'add', target: null,
      exportClass: 'blockedEffect', reference: null, dayPortion: 'fullDay' };
  }));
  const scopes = PROFILES.map(([id, canton, name, source, locator, , , note]) => [id, canton, name,
    id === 'AI-RTG-INNER-ADDITIONAL' ? 'Gebietsgruppe' : 'Kanton', note, source, locator, 'open', FROM, null]);
  const sources = sourceRows();
  const assignments = PROFILES.filter(p => p[0] !== 'AI-RTG-INNER-ADDITIONAL').map(([scopeId, canton, , sourceId, locator]) => ({
    id: `AREA-${scopeId}`, scopeId, areaId: `GEO-${canton.slice(3)}`, ...NAMES[canton], areaType: 'Kanton',
    parentAreaId: 'GEO-CH', effect: 'include', officialIdSystem: '', officialId: '', from: FROM, to: null,
    sourceId, locator, status: 'open', note: 'Kantonaler Geltungsbereich dieses begrenzten Profils. Räumliche Zuordnung ist keine Verfahrens- oder Sprachfreigabe.'
  }));
  for (const [slug, name] of [['APPENZELL', 'Appenzell'], ['SCHWENDE-RUETE', 'Schwende-Rüte'], ['SCHLATT-HASLEN', 'Schlatt-Haslen'], ['GONTEN', 'Gonten']]) {
    assignments.push({ id: `AREA-AI-INNER-${slug}`, scopeId: 'AI-RTG-INNER-ADDITIONAL', areaId: `GEO-AI-${slug}`,
      de: name, fr: name, it: name, rm: name, areaType: 'Bezirk', parentAreaId: 'GEO-AI', effect: 'include',
      officialIdSystem: '', officialId: '', from: FROM, to: null, sourceId: ID.aiArea,
      locator: 'Gebietstabelle Stand 31.12.2025, innerer Landesteil', status: 'open',
      note: 'Kantonaler Gebietsbeleg konkretisiert inneren Landesteil nach Art. 2 Abs. 1 Bst. c RTG. Bezirke in AI entsprechen der kommunalen Ebene, keine Feiertagssetzung des Bezirks erhoben. Klosterparzellen nicht eigenständig geocodiert.' });
  }
  const pendingCases = [
    { id: 'AP18B04-AR-STEPHAN-CONDITION', canton: 'CH-AR', holiday: 'Stephanstag',
      reason: 'Kein zweiter Weihnachtstag bei Weihnachten Montag oder Freitag. Vertrag 0.5.0 enthält keine Wochentagsbedingung. Nicht generiert, auch keine jahresweise Scheinlösung.',
      sourceIds: [ID.ar], locator: 'Art. 7', status: 'contractGap' },
    { id: 'AP18B04-AI-STEPHAN-CONDITION', canton: 'CH-AI', holiday: 'Stephanstag',
      reason: 'Drei aufeinanderfolgende Ruhetage schliessen die Feier aus. Bedingung nicht abgebildet, amtliche Liste nennt trotzdem 26.12.2026. Quellenkonflikt und technische Grenze vor Erfassung auflösen.',
      sourceIds: [ID.ai, ID.aiInfo, ID.aiDates, ID.aiReport], locator: 'Art. 2 Abs. 1 Bst. b / Feiertagsliste 26.12.2026 / Bericht 2015 S. 7', status: 'sourceConflict' }
  ];
  const mappings = PROFILES.map(([scope, , , , locator, , category, note]) => [`MAP-${scope}`, scope, category,
    category === 'proceduralEquivalentDay' ? 'Verfahrensspezifische Feiertagsgrundlage, Zuordnung offen' : 'Ruhetags-/Arbeitsgrundlage, keine automatische Fristwirkung',
    `${note} ZPO, StPO, BGG, ATSG und kantonales Verfahrensrecht gesondert zuordnen.`, locator, 'blocked', null]);
  for (const pending of pendingCases) mappings.push([`MAP-${pending.id}`, pending.canton === 'CH-AR' ? 'AR-ARG-ALL' : 'AI-RTG-ALL',
    pending.canton === 'CH-AR' ? 'labourLawHoliday' : 'publicHoliday', `NICHT GENERIERT: ${pending.holiday}`,
    pending.reason, pending.locator, 'blocked', null]);
  const reviews = sources.map((source, index) => {
    const pending = pendingCases.find(p => p.sourceIds[0] === source[0]);
    return [`AP18B04-EAST-SOURCE-${String(index + 1).padStart(2, '0')}`, source[0], 'newScope', CHECKED,
      'unclear', null, `${source[7]} Neuaufnahme ohne behaupteten Vergleich mit einer freigegebenen Vorgängerversion.`, 'candidate', 'David Steimer', 'Codex',
      pending ? `${pending.id}: ${pending.reason}` : 'Fachliche Abnahme und konkrete Verfahrenszuordnung offen.'];
  });
  return { rules, scopes, sources, mappings, reviews, assignments,
    areaSourceEvidence: assignments.filter(a => a.sourceId === ID.aiArea).map(a => ({ assignmentId: a.id, scopeId: a.scopeId,
      normSourceId: ID.ai, areaSourceId: ID.aiArea, locator: a.locator, checkedOn: CHECKED, checkedBy: 'Codex, Quellenabgleich ohne Fachabnahme',
      note: 'Amtliche Gebietstabelle nennt vier Bezirke als inneren Landesteil und Oberegg gesondert. Keine Vermischung kantonal gesetzter Feiertage mit kommunalem Recht.' })),
    scopeLabels: Object.fromEntries(PROFILES.map(([id, canton, , , , , category]) => [id, {
      fr: `${NAMES[canton].fr}, ${id.includes('INNER') ? 'complément Saint-Maurice, partie intérieure' : category === 'proceduralEquivalentDay' ? 'profil procédural' : 'profil des jours de repos'}`,
      it: `${NAMES[canton].it}, ${id.includes('INNER') ? 'complemento San Maurizio, parte interna' : category === 'proceduralEquivalentDay' ? 'profilo procedurale' : 'profilo dei giorni di riposo'}`,
      rm: `${NAMES[canton].rm}, ${id.includes('INNER') ? 'cumplettaziun Son Murezi, part interna' : category === 'proceduralEquivalentDay' ? 'profil procedural' : 'profil dals dis da paus'}`
    }])),
    jurisdictionLabels: Object.fromEntries(Object.entries(NAMES).map(([id, n]) => [id, { it: n.it, rm: n.rm }])),
    ruleKeys: Object.fromEntries(PROFILES.flatMap(([scope, , , , , keys]) => keys.map(key => [`${scope}-DAY-${key}`, key]))),
    holidayDefinitions: EXTRA, pendingCases,
    notes: { checkedOn: CHECKED, ruleCount: rules.length, profiles: scopes.length, municipalLawIncluded: false, productExport: false,
      languageApproval: false, legalApproval: false, incompleteCantons: ['CH-AR', 'CH-AI'], namedSundaysNotWeekSeries: true }
  };
}
