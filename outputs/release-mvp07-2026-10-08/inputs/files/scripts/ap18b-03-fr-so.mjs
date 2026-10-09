// SPDX-License-Identifier: AGPL-3.0-only
// Source-backed review additions only. No production calendar or legal approval.
const CHECKED = '2026-09-13';
const FROM = '2026-01-01';
const CH_SOURCE = 'SRC-BUNDESFEIERTAG-19940701';
const IDS = {
  bamg: 'SRC-FR-BAMG-866111-V8126', bamgFr: 'SRC-FR-LEMT-866111-FR-V8126',
  jg: 'SRC-FR-JG-1301-V7926', jgFr: 'SRC-FR-LJ-1301-FR-V7926',
  area: 'SRC-FR-AMA-FEIERTAGE-2026', rtg: 'SRC-SO-RTG-51241-V4319',
  calendar: 'SRC-SO-FRISTENKALENDER-2026', bj: 'SRC-SO-BJ-FEIERTAGSVERZEICHNIS-20110101',
  namesIt: 'SRC-CH-ESTV-KANTONSNAMEN-IT-AP18B03', namesRm: 'SRC-CH-BK-KANTONSNAMEN-RM-2025-AP18B03'
};
const SCOPE = { catholic: 'FR-BAMG-CATHOLIC', reformed: 'FR-BAMG-REFORMED',
  jg: 'FR-JG-ALL', rest: 'SO-RTG-EXCEPT-BUCHEGGBERG', buchegg: 'SO-RTG-BUCHEGGBERG' };
const COMMON = ['NEW-YEAR', 'GOOD-FRIDAY', 'ASCENSION', 'CHRISTMAS'];
const CATHOLIC = ['NEW-YEAR', 'GOOD-FRIDAY', 'ASCENSION', 'CORPUS-CHRISTI',
  'NATIONAL-DAY', 'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS'];
const REFORMED = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER-MONDAY',
  'ASCENSION', 'WHIT-MONDAY', 'NATIONAL-DAY', 'CHRISTMAS', 'ST-STEPHEN'];
// Four named-day/following-day pairs (8) plus seven other named days (7).
// The national holiday is already in Art. 121(2), not an extra sixteenth rule.
const JG = ['NEW-YEAR', 'BERCHTOLD', 'GOOD-FRIDAY', 'EASTER', 'EASTER-MONDAY',
  'ASCENSION', 'PENTECOST', 'WHIT-MONDAY', 'CORPUS-CHRISTI', 'NATIONAL-DAY',
  'ASSUMPTION', 'ALL-SAINTS', 'IMMACULATE-CONCEPTION', 'CHRISTMAS', 'ST-STEPHEN'];
const SO = ['NEW-YEAR', 'GOOD-FRIDAY', 'EASTER', 'MAY1', 'ASCENSION', 'PENTECOST',
  'CORPUS-CHRISTI', 'NATIONAL-DAY', 'ASSUMPTION', 'FEDERAL-FAST', 'ALL-SAINTS', 'CHRISTMAS'];
const SO_EXCEPT = ['CORPUS-CHRISTI', 'ASSUMPTION', 'ALL-SAINTS'];
const SO_HIGH = ['GOOD-FRIDAY', 'EASTER', 'PENTECOST', 'CHRISTMAS'];
const PROFILES = [
  { scope: SCOPE.catholic, jurisdiction: 'CH-FR', keys: CATHOLIC, source: IDS.bamg, kind: 'labour' },
  { scope: SCOPE.reformed, jurisdiction: 'CH-FR', keys: REFORMED, source: IDS.bamg, kind: 'labour' },
  { scope: SCOPE.jg, jurisdiction: 'CH-FR', keys: JG, source: IDS.jg, kind: 'procedure' },
  { scope: SCOPE.rest, jurisdiction: 'CH-SO', keys: SO, source: IDS.rtg, kind: 'rest' },
  { scope: SCOPE.buchegg, jurisdiction: 'CH-SO', keys: SO.filter(key => !SO_EXCEPT.includes(key)), source: IDS.rtg, kind: 'rest' }
];
const LANGUAGE_NOTE = 'Sprachprüfung offen. Gemeinsame IT/RM-Namen aus dem geprüften TI/GR-Bestand nur als provisorische Produktnamen übernommen. Keine amtliche FR-/SO-Sprachfassung behauptet. Berchtold IT/RM und Scope-Übersetzungen sind eigene provisorische Vorschläge.';

function sources() {
  const source = (id, jurisdiction, title, locator, url, version, note) =>
    [id, jurisdiction, title, locator, url, version, CHECKED, note, 'open', null];
  return [
    source(IDS.bamg, 'CH-FR', 'Gesetz über die Beschäftigung und den Arbeitsmarkt, BAMG',
      'SGF 866.1.1, Art. 49 Abs. 1–5, Version 8126', 'https://bdlf.fr.ch/api/de/versions/8126/pdf_file', '2020-01-01',
      `Erlass 06.10.2010. Geltende Fassung seit 01.01.2020. Vier gemeinsame und je vier regionale arbeitsrechtliche Tage. Bundesanwendung separat offen. Gebietsliste amtlicher Seite über geprüfte Quellenbeziehung. ${LANGUAGE_NOTE}`),
    source(IDS.bamgFr, 'CH-FR', 'Loi sur l’emploi et le marché du travail, LEMT, französische Sprachfassung',
      'RSF 866.1.1, art. 49, version 8126, FR', 'https://bdlf.fr.ch/api/fr/versions/8126/pdf_file', '2020-01-01',
      'Amtlicher FR-Sprachabgleich. Produktanzeige normalisiert Schreibweisen. Lendemain du Nouvel-An und lendemain de Noël werden nicht als zusätzliche Tage erfasst.'),
    source(IDS.jg, 'CH-FR', 'Justizgesetz, JG', 'SGF 130.1, Art. 121 Abs. 1–3, Version 7926',
      'https://bdlf.fr.ch/api/de/versions/7926/pdf_file', '2024-01-01',
      `Erlass 31.05.2010. Fassung seit 01.01.2024. Eigene kantonsweite Liste von 15 Tagen einschliesslich Ostern, Pfingsten und 1. August. Strafrechtliche Stundenfristen nach Abs. 3 ausgenommen. Keine pauschale Bundesverfahrensfreigabe. ${LANGUAGE_NOTE}`),
    source(IDS.jgFr, 'CH-FR', 'Loi sur la justice, LJ, französische Sprachfassung', 'RSF 130.1, art. 121, version 7926, FR',
      'https://bdlf.fr.ch/api/fr/versions/7926/pdf_file', '2024-01-01',
      'Amtlicher FR-Sprachabgleich der eigenen Liste. Vier Feiertag-/Folgetagspaare plus sieben weitere Tage, zusammen 15. Kalendertagsnamen für numerisch genannte Daten sind Produktbezeichnungen.'),
    source(IDS.area, 'CH-FR', 'Amt für den Arbeitsmarkt, Feiertage 2026 und regionale Gebietsliste',
      'Feiertage 2026, Fussnote zu reformierten Gemeinden', 'https://www.fr.ch/de/arbeit-und-unternehmen/arbeitnehmer/feiertage', null,
      'Seitenänderung 06.07.2026, kein Normversionsdatum. Zehn Gemeinden und nur Flamatt/Sensebrügg in Wünnewil-Flamatt. Anwendungsbeleg zu Art. 49 BAMG, kein separat verifizierter Staatsratsbeschluss. 18 Datumswerte 2026 abgeglichen. Freiwillige arbeitsfreie Tage ausgeschlossen.'),
    source(IDS.rtg, 'CH-SO', 'Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz RTG',
      'BGS 512.41, § 1, § 2 Abs. 1 und 2, § 3, Version 4319', 'https://bgs.so.ch/api/de/versions/4319/pdf_file', '2014-09-01',
      `Erlass 18.05.2014, seit 01.09.2014 geltend. Aktuelle Liste in § 2, nicht alter § 1. 1. Mai ab 12.00 Uhr. Drei Tage ausser Bezirk Bucheggberg. Kommunale Ruhetage nach § 2 Abs. 2 nicht erhoben. ${LANGUAGE_NOTE}`),
    source(IDS.calendar, 'CH-SO', 'Kanton Solothurn, gesetzliche Feiertage für die Berechnung rechtlicher Fristen 2026',
      'Jahresliste 2026 und Hinweis zum Bezirk Bucheggberg', 'https://so.ch/allgemeine-informationen/gesetzliche-feiertage/', null,
      'Aktuelle amtliche Informationsseite, ohne eigenen Normstand. Nennt 1. Mai ab 12.00 Uhr ausdrücklich im Fristenkontext. Keine Freigabe einer ganztägigen Verschiebung für alle Verfahren. Nicht als Arbeits-/Ladenöffnungskalender verwenden.'),
    source(IDS.bj, 'CH', 'BJ-Verzeichnis gesetzlicher Feiertage, historische auf so.ch verlinkte Fassung',
      'Stand 01.01.2011, Solothurn, S. 15–16', 'https://so.ch/fileadmin/internet/administrator/dokumente/Gesetzliche_Feiertage.pdf', '2011-01-01',
      'Historisch, nicht geltender RTG-Stand. Feiertage und gleichbehandelte Tage im Kontext des Europäischen Fristenübereinkommens unterscheiden. 1. Mai und regionale Gleichstellungen nicht als universelle heutige Freigabe übernehmen. Hinweise Stand 17.12.2012 begrenzen den Kontext.'),
    source(IDS.namesIt, 'CH', 'ESTV, italienische Kantonsnamen', 'Link alle autorità cantonali per l’imposta alla fonte',
      'https://www.estv.admin.ch/it/imposta-alla-fonte-link-amministrazioni-cantonale', null,
      'Amtlicher Namensbeleg für Friburgo und Soletta. Undatierte Linkliste, keine Feiertagsnorm oder sprachliche Fachabnahme des Produkts.'),
    source(IDS.namesRm, 'CH', 'Bundeskanzlei, La Confederaziun 2025, rätoromanische Kantonsnamen', 'Ausgabe 2025, S. 8, Kantonskarte',
      'https://www.bk.admin.ch/dam/bk/de/dokumente/komm-ue/Buku2025/BUKU_2025_RM.pdf.download.pdf/BUKU_2025_RM.pdf', null,
      'Amtlicher Namensbeleg Friburg und Soloturn. Publikationsjahr 2025, kein präzises Versionsdatum und keine Feiertagsnorm.')
  ];
}

function scopeRows() {
  const scope = (id, canton, name, type, note, source, locator) => [id, canton, name, type, note, source, locator, 'open', FROM, null];
  return [
    scope(SCOPE.catholic, 'CH-FR', 'Freiburg, katholisches BAMG-Gebiet', 'Gebietsgruppe',
      'Arbeitsrechtliche Gebietsliste: Kanton abzüglich der konkret erfassten zehn Gemeinden und zwei Orte. Geschäftssitz/Zweigniederlassung nach Art. 49 Abs. 5, keine persönliche Konfessionswahl. Acht kantonale Tage plus offene Bundesanwendung.', IDS.bamg, 'Art. 49 Abs. 2, Abs. 3 Bst. a, Abs. 4 und 5'),
    scope(SCOPE.reformed, 'CH-FR', 'Freiburg, reformiertes BAMG-Gebiet', 'Gebietsgruppe',
      'Arbeitsrechtliche Gebietsliste: zehn bezeichnete Gemeinden sowie Flamatt und Sensebrügg, nicht ganz Wünnewil-Flamatt. Acht kantonale Tage plus offene Bundesanwendung. Keine Übertragung auf JG.', IDS.bamg, 'Art. 49 Abs. 2, Abs. 3 Bst. b, Abs. 4 und 5'),
    scope(SCOPE.jg, 'CH-FR', 'Freiburg, kantonsweite JG-Fristenliste', 'Kanton',
      '15 eigene Tage nach Art. 121 Abs. 2, unabhängig von den BAMG-Regionalgruppen. Stundenfristen-Ausnahme Abs. 3 und Verfahrensanknüpfung gesondert. 1. August bereits enthalten.', IDS.jg, 'Art. 121 Abs. 1–3'),
    scope(SCOPE.rest, 'CH-SO', 'Solothurn, RTG ohne Bezirk Bucheggberg', 'Gebietsgruppe',
      'Elf benannte kantonale RTG-Tage plus offene Bundesanwendung. 1. Mai ausschliesslich ab 12.00 Uhr. Kantonsgebiet abzüglich Bezirk Bucheggberg. Kommunales Recht ausgeschlossen, Fristwirkung offen.', IDS.rtg, '§ 2 Abs. 1 Bst. b und c'),
    scope(SCOPE.buchegg, 'CH-SO', 'Solothurn, RTG Bezirk Bucheggberg', 'Bezirk',
      'Acht benannte kantonale RTG-Tage plus offene Bundesanwendung. Fronleichnam, Maria Himmelfahrt und Allerheiligen nicht in dieser RTG-Liste. Kein pauschaler Ausschluss möglicher verfahrensrechtlicher Gleichstellungen. 1. Mai ab 12.00 Uhr.', IDS.rtg, '§ 2 Abs. 1 Bst. b und c')
  ];
}

function ruleRows(base) {
  return PROFILES.flatMap(profile => profile.keys.map(key => {
    const definition = base.holidayDefinitions[key];
    if (!definition) throw new Error(`Missing base holiday definition: ${key}`);
    const donor = base.rules.find(rule => base.ruleKeys[rule.id] === key && rule.it && rule.rm);
    const federal = key === 'NATIONAL-DAY' && profile.kind !== 'procedure';
    const labels = { de: definition.labels.de, fr: definition.labels.fr,
      it: donor?.it ?? '', rm: donor?.rm ?? '' };
    if (key === 'BERCHTOLD') Object.assign(labels, { de: 'Berchtoldstag', fr: 'Lendemain du Nouvel-An', it: 'Giorno di Berchtold', rm: 'Di da Berchtold' });
    if (key === 'ST-STEPHEN' && profile.jurisdiction === 'CH-FR') Object.assign(labels, { de: 'Stephanstag', fr: 'Lendemain de Noël' });
    if (key === 'MAY1') Object.assign(labels, { de: '1. Mai', fr: '1er mai', it: 'Primo maggio', rm: '1. da matg' });
    if (!labels.it || !labels.rm) throw new Error(`Missing provisional language label: ${key}`);
    let locator;
    if (federal) locator = 'SR 116, Art. 1, neue offene Anwendung auf dieses Geltungsprofil';
    else if (profile.kind === 'procedure') locator = 'Art. 121 Abs. 2';
    else if (profile.kind === 'labour') locator = COMMON.includes(key) ? 'Art. 49 Abs. 2'
      : profile.scope === SCOPE.catholic ? 'Art. 49 Abs. 3 Bst. a' : 'Art. 49 Abs. 3 Bst. b';
    else locator = SO_HIGH.includes(key) ? '§ 2 Abs. 1 Bst. c' : key === 'MAY1'
      ? '§ 2 Abs. 1 Bst. b, 1. Mai ab 12.00 Uhr' : '§ 2 Abs. 1 Bst. b';
    return { id: `${profile.scope}-DAY-${key}`, jurisdiction: profile.jurisdiction, scope: profile.scope,
      ...labels, category: profile.kind === 'procedure' ? 'proceduralEquivalentDay'
        : profile.kind === 'labour' && !federal ? 'labourLawHoliday' : 'publicHoliday',
      calculation: structuredClone(definition.calculation), from: FROM, to: null,
      source: federal ? CH_SOURCE : profile.source, locator, status: 'open', approvalBasis: null,
      priority: 100, action: 'add', target: null, exportClass: 'blockedEffect', reference: null,
      dayPortion: key === 'MAY1' && profile.jurisdiction === 'CH-SO' ? 'afternoonFromNoon' : 'fullDay' };
  }));
}

function mappingRows() {
  const rows = [SCOPE.catholic, SCOPE.reformed].map(scope => [
    `MAP-${scope}-LABOUR`, scope, 'labourLawHoliday', 'BAMG Art. 49, arbeitsrechtliche Sonntagsgleichstellung',
    'Geschäftssitz/Zweigniederlassung bestimmt die Gebietsanknüpfung. Keine persönliche Konfessionswahl. Keine automatische Fristenwirkung, auch nicht aus der gesonderten offenen Bundesanwendung.',
    'SGF 866.1.1 Art. 49 / SR 116 Art. 1', 'blocked', null]);
  rows.push(
    ['MAP-FR-JG-ART121', SCOPE.jg, 'proceduralEquivalentDay', 'JG Art. 121, kantonale Verfahren im gesetzlichen Anwendungsbereich',
      'Eigene kantonsweite Liste mit 15 Tagen. Keine Vererbung der BAMG-Gebiete. Konkrete Verfahrensanknüpfung und Fachabnahme bleiben offen.', 'SGF 130.1 Art. 121 Abs. 1 und 2', 'open', null],
    ['MAP-FR-JG-HOURS', SCOPE.jg, 'proceduralEquivalentDay', 'Strafverfahren mit in Stunden gesetzten Fristen',
      'Abs. 1 ist hier nach Abs. 3 nicht anwendbar. Kein Stundenrechner und keine Fristverschiebung aktiviert.', 'SGF 130.1 Art. 121 Abs. 3', 'blocked', null],
    ['MAP-FR-JG-OTHER', SCOPE.jg, 'proceduralEquivalentDay', 'Bundesrechtliche und andere besondere Verfahrensprofile',
      'ZPO, StPO, BGG, SchKG, ATSG und Sonderrecht erhalten durch die Kantonswahl keine pauschale Zuordnung. Anwendbarkeit und gesetzlicher Ortsbezug getrennt prüfen.', 'SGF 130.1 Art. 121 / jeweiliges Verfahrensrecht', 'blocked', null]
  );
  for (const scope of [SCOPE.rest, SCOPE.buchegg]) rows.push(
    [`MAP-${scope}-REST`, scope, 'publicHoliday', 'RTG, Schutz der öffentlichen Ruhe',
      'Hohe Feiertage sind Karfreitag, Ostern, Pfingsten und Weihnachten. Benannte Sonntage bleiben eine Regel pro Profil. 1. Mai nur ab 12.00 Uhr. Keine allgemeine Arbeits- oder Fristenprofilfreigabe.', 'BGS 512.41 § 1–3 / SR 116 Art. 1', 'blocked', null],
    [`MAP-${scope}-DEADLINE`, scope, 'publicHoliday', 'Amtlicher SO-Fristenkalender, Profilprüfung offen',
      'Amtliche Seite nennt 1. Mai ab 12.00 Uhr im Fristenkontext. Umfang einer Fristverschiebung und allfällige Bucheggberg-Gleichstellungen separat klären. BJ-Liste 2011 ist historisch und übereinkommensbezogen, keine universelle Ganztagsfreigabe.', 'SO-Informationsseite 2026 / historisches BJ-Verzeichnis S. 15–16 und Hinweise 17.12.2012', 'open', null],
    [`MAP-${scope}-MUNICIPAL`, scope, 'publicHoliday', 'Kommunale Ruhetage nach kantonaler Ermächtigung',
      '§ 2 Abs. 2 ermächtigt Gemeinden zu zusätzlichen Ruhetagen. Diese kommunalen Normen sind ausserhalb des bestätigten Erhebungsscope und werden nicht erzeugt. Keine Behauptung ihres rechtlichen Ausschlusses in sämtlichen Verfahren.', 'BGS 512.41 § 2 Abs. 2', 'blocked', null]
  );
  return rows;
}

function areaRows() {
  const rows = [];
  const area = (id, de, fr, it, rm, areaType, parentAreaId) => ({ areaId: id, de, fr, it, rm, areaType, parentAreaId });
  const fr = area('GEO-FR', 'Freiburg', 'Fribourg', 'Friburgo', 'Friburg', 'Kanton', 'GEO-CH');
  const so = area('GEO-SO', 'Solothurn', 'Soleure', 'Soletta', 'Soloturn', 'Kanton', 'GEO-CH');
  const buchegg = area('GEO-SO-BUCHEGGBERG', 'Bezirk Bucheggberg', 'District de Bucheggberg', 'Distretto di Bucheggberg', 'District da Bucheggberg', 'Bezirk', 'GEO-SO');
  const add = (scopeId, territory, effect, sourceId, locator, note) => rows.push({
    id: `AREA-${scopeId}-${territory.areaId}-${effect.toUpperCase()}`, scopeId, ...territory, effect,
    officialIdSystem: '', officialId: '', from: FROM, to: null, sourceId, locator, status: 'open', note
  });
  add(SCOPE.catholic, fr, 'include', IDS.bamg, 'Art. 49 Abs. 2–5', 'Gesamtkanton als Ausgangsgebiet, abzüglich sämtlicher konkret erfasster reformierter Gemeinden/Orte. Keine persönliche Konfessionszuordnung.');
  add(SCOPE.jg, fr, 'include', IDS.jg, 'Art. 121 Abs. 2', 'Eigene kantonsweite JG-Liste. BAMG-Ausnahmen werden nicht übernommen.');
  const locator = 'Feiertage 2026, Fussnote zu reformierten Gemeinden';
  const evidenceNote = `Gebietsbeleg ${IDS.area}, Seitenänderung 06.07.2026. Geprüfte Beziehung zur Norm ${IDS.bamg}, Art. 49 Abs. 3–5, am ${CHECKED} durch Codex. Kein separat verifizierter Staatsratsbeschluss und keine Fachabnahme. Ortsnamen in IT/RM unverändert, Beschreibung provisorisch übersetzt.`;
  const parent = area('GEO-FR-WUENNEWIL-FLAMATT', 'Wünnewil-Flamatt', 'Wünnewil-Flamatt', 'Wünnewil-Flamatt', 'Wünnewil-Flamatt', 'Gemeinde', 'GEO-FR');
  add(SCOPE.catholic, parent, 'include', IDS.area, locator,
    `Redundanter räumlicher Elternknoten innerhalb des bereits einbezogenen Kantons. Die beiden Ortsteilausschlüsse bleiben wirksam. Keine Ausdehnung des reformierten Profils auf die ganze Gemeinde. ${evidenceNote}`);
  const towns = [
    ['COURGEVAUX', 'Courgevaux'], ['FRAESCHELS', 'Fräschels'], ['GRENG', 'Greng'],
    ['KERZERS', 'Kerzers'], ['MEYRIEZ', 'Meyriez'], ['MUNTELIER', 'Muntelier'],
    ['MURTEN', 'Murten'], ['RIED-BEI-KERZERS', 'Ried bei Kerzers'], ['ULMIZ', 'Ulmiz'], ['MONT-VULLY', 'Mont-Vully']
  ].map(([id, name]) => area(`GEO-FR-${id}`, name, name, name, name, 'Gemeinde', 'GEO-FR'));
  const places = ['Flamatt', 'Sensebrügg'].map((name, index) => area(`GEO-FR-${index ? 'SENSEBRUEGG' : 'FLAMATT'}`,
    name, name, name, name, 'Ortsteil', parent.areaId));
  for (const territory of [...towns, ...places]) {
    add(SCOPE.catholic, territory, 'exclude', IDS.area, locator, evidenceNote);
    add(SCOPE.reformed, territory, 'include', IDS.area, locator, evidenceNote);
  }
  add(SCOPE.rest, so, 'include', IDS.rtg, '§ 2 Abs. 1 Bst. b und c', 'Kanton als Ausgangsgebiet. Regionalausnahme durch expliziten Bezirkseintrag, kein kommunales Recht erhoben.');
  add(SCOPE.rest, buchegg, 'exclude', IDS.rtg, '§ 2 Abs. 1 Bst. b', 'Aus diesem RTG-Profil ausgeschlossen, im separaten Bucheggberg-Profil mit eigener Grundliste enthalten. Keine pauschale Aussage zu sämtlichen Fristenverfahren.');
  add(SCOPE.buchegg, buchegg, 'include', IDS.rtg, '§ 2 Abs. 1 Bst. b und c', 'Bezirk als unmittelbar kantonal bezeichnetes Gebiet. FR/IT/RM-Bezirksbeschreibungen sind provisorische Produktübersetzungen.');
  return rows;
}

export function createFrSoAdditions(base) {
  if (base.contractVersion !== '0.5.0' || !base.sources.some(row => row[0] === CH_SOURCE)) throw new Error('Expected contract 0.5 base with federal source');
  const rules = ruleRows(base), newSources = sources(), assignments = areaRows();
  return {
    rules, scopes: scopeRows(), sources: newSources, mappings: mappingRows(), assignments,
    reviews: newSources.map((source, index) => [`AP18B03-FRSO-SOURCE-${String(index + 1).padStart(2, '0')}`, source[0], 'newScope', CHECKED,
      'unclear', null, `${source[7]} Neuaufnahme als Prüfgrundlage, kein behaupteter Vergleich mit einem früher freigegebenen FR-/SO-Paket.`,
      'candidate', 'David Steimer', 'Codex', 'Fach-, Sprach- und Verfahrensabnahme offen. Teilumfang SO und regionale Quellenbeziehung FR ausdrücklich prüfen.']),
    areaSourceEvidence: assignments.filter(row => row.sourceId === IDS.area).map(row => ({
      assignmentId: row.id, scopeId: row.scopeId, normSourceId: IDS.bamg, areaSourceId: IDS.area,
      locator: row.locator, checkedOn: CHECKED, checkedBy: 'Codex, Quellenabgleich ohne Fachabnahme',
      note: 'Amtliche Freiburger Gebietsliste konkretisiert die regionalen BAMG-Listen. Historische Ausnahmen sind nach Art. 49 Abs. 4 möglich, ein einzelner Staatsratsbeschluss wurde nicht verifiziert.'
    })),
    scopeLabels: {
      [SCOPE.catholic]: { fr: 'Fribourg, territoire catholique LEMT', it: 'Friburgo, territorio cattolico LEMT', rm: 'Friburg, territori catolic BAMG' },
      [SCOPE.reformed]: { fr: 'Fribourg, territoire réformé LEMT', it: 'Friburgo, territorio riformato LEMT', rm: 'Friburg, territori refurmà BAMG' },
      [SCOPE.jg]: { fr: 'Fribourg, liste cantonale des délais LJ', it: 'Friburgo, elenco cantonale dei termini LJ', rm: 'Friburg, glista chantunala da termins JG' },
      [SCOPE.rest]: { fr: 'Soleure, RTG hors district de Bucheggberg', it: 'Soletta, RTG escluso distretto di Bucheggberg', rm: 'Soloturn, RTG senza district da Bucheggberg' },
      [SCOPE.buchegg]: { fr: 'Soleure, RTG district de Bucheggberg', it: 'Soletta, RTG distretto di Bucheggberg', rm: 'Soloturn, RTG district da Bucheggberg' }
    },
    jurisdictionLabels: { 'CH-FR': { it: 'Friburgo', rm: 'Friburg' }, 'CH-SO': { it: 'Soletta', rm: 'Soloturn' } },
    ruleKeys: Object.fromEntries(PROFILES.flatMap(profile => profile.keys.map(key => [`${profile.scope}-DAY-${key}`, key]))),
    notes: { sourceDate: CHECKED, frNormCounts: [8, 8, 15], frRuleCounts: [9, 9, 15], soNormCounts: [11, 8], soRuleCounts: [12, 9],
      federalApplications: 4, partialDayRules: 2, municipalLawIncluded: false, languageApproval: false, proceduralApproval: false }
  };
}
