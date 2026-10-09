// SPDX-License-Identifier: AGPL-3.0-only
// Research workbook only. No product projection or activation is performed.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const root = process.cwd();
const require = createRequire(path.join(root, '.work/ap22a/runtime.mjs'));
const {Workbook, SpreadsheetFile, FileBlob} = await import(pathToFileURL(require.resolve('@oai/artifact-tool')));
const out = path.join(root, 'outputs/ap22a-matrix-2026-10-02');
const qa = path.join(root, '.work/ap22a');
const file = path.join(out, '2026-10-02_Verfahrens-und-Gebietsmatrix_AP22A_V0.1.xlsx');
const sourcePath = 'data/releases/2026-10-01-mvp-06-approved.1/holiday-catalogs/ch-holiday-catalog.json';
const sourceBytes = await fs.readFile(sourcePath);
const sourceSha = createHash('sha256').update(sourceBytes).digest('hex');
const catalog = JSON.parse(sourceBytes);
const {jurisdictions, scopes, rules, sources, assignments, mappings} = catalog.data;
assert.equal(scopes.length, 49);
assert.equal(jurisdictions.length, 27);
assert.equal(rules.length, 479);
const date = '2026-10-02';
const newSources = [];
function source(id, jurisdiction, title, locator, url, versionOn, note) {
  newSources.push({id, jurisdiction, title, locator, url, versionOn, retrievedOn:date, note, review:'Gezielt neu geprüft'});
}
source('AP22-STPO','CH','Schweizerische Strafprozessordnung','Art. 89 Abs. 2 und Art. 90 Abs. 2','https://www.fedlex.admin.ch/eli/cc/2010/267/de#art_90','2025-04-01','Gesetzestext über Swiss Caselaw / Fedlex. Keine Gerichtsferien. Gesetzliche Anknüpfung Partei oder Rechtsbeistand.');
source('AP22-ZPO','CH','Schweizerische Zivilprozessordnung','Art. 142 Abs. 1bis und 3, Art. 145','https://www.fedlex.admin.ch/eli/cc/2010/262/de#art_142','2026-07-01','Gerichtsort. Art. 142 Abs. 1bis betrifft zusätzlich die Zustellung gewöhnlicher Post. Keine Freigabe neuer Zustellarten.');
source('AP22-BGG','CH','Bundesgerichtsgesetz','Art. 45 und 46','https://www.fedlex.admin.ch/eli/cc/2006/218/de#art_45','2026-04-01','Partei-/Vertretungsort durch Rechtsprechung zu qualifizieren. Friststillstand mit Ausnahmen getrennt.');
source('AP22-VWVG','CH','Verwaltungsverfahrensgesetz','Art. 20 Abs. 3 und Art. 22a','https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de#art_20','2022-07-01','Lookup meldet künftige Konsolidierung 01.01.2027. Kein Beleg einer Änderung dieser Artikel. Vor späterer Freigabe erneut prüfen.');
source('AP22-EUFRUEB','CH','Europäisches Übereinkommen über die Berechnung von Fristen','Art. 5','https://www.fedlex.admin.ch/eli/cc/1983/500_500_500/de#art_5','2011-01-01','Gleichgestellte Tage nach einschlägiger Rechtsprechung berücksichtigen. Keine globale Kategorienfreigabe.');
source('AP22-4A434','CH','BGer 4A_434/2023','E. 1.1','https://www.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F05-09-2024-4A_434-2023&lang=de&type=show_document&zoom=','2024-09-05','Volltext. BGG: selbst handelnde Partei, sonst Vertretung mit dortigem Zustelldomizil. Keine alternative günstigste Wahl.');
source('AP22-7B561','CH','BGer 7B_561/2025','E. 1.2','https://search.bger.ch/ext/eurospider/live/fr/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F01-07-2025-7B_561-2025&lang=fr&type=show_document&zoom=NO','2025-07-01','Volltext. BGG: Fronleichnam am anonymisierten Parteiwohnort hilft bei Zustelldomizil der Vertretung in VD nicht. Parteiwohnkanton nicht ergänzt.');
source('AP22-BGE124II527','CH','BGE 124 II 527','E. 2b','https://entscheidsuche.ch/docs/CH_BGE/CH_BGE_004_BGE-124-II-527_1998-06-11.html','1998-06-11','Historischer FR-Fall: prozessual gleichgestellter Pfingstmontag. Prinzip, kein aktueller Vollständigkeitsnachweis.');
source('AP22-9C396','CH','BGer 9C_396/2018','E. 2.2–2.4','https://www.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2Faza%3A%2F%2F20-12-2018-9C_396-2018&lang=de&type=show_document&zoom=NO','2018-12-20','Damals Art. 20 Abs. 2 LPJA-NE. Pfingstmontag als Schliesstag für BGG anerkannt. Übertragung auf LPA ab 2026 gesondert offen.');
source('AP22-4A538','CH','BGer 4A_538/2023','E. 2','https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F03-01-2024-4A_538-2023&lang=de&type=show_document','2024-01-03','BGG: Allerheiligen nicht im ganzen AG anerkannt. Tatsächlichen relevanten Ort auflösen.');
source('AP22-BGE115IV266','CH','BGE 115 IV 266','kantonale Anerkennung und kommunales Patrozinium','https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?azaclir=clir&highlight_docid=atf%3A%2F%2F115-IV-266%3Ade&lang=de&type=show_document','1989-11-22','Historischer LU-Fall. Rein tatsächliche Arbeitsruhe genügt nicht. Keine umfassende heutige Delegationsprüfung.');
source('AP22-AG-ZPO','CH-AG','EG ZPO Aargau','§ 21','https://gesetzessammlungen.ag.ch/api/de/versions/3615/pdf_file','2022-01-01','Amtlicher Volltext, PDF-S. 8. Eigene kantonsweite Liste für Art. 142 Abs. 3 ZPO.');
source('AP22-AG-ARR','CH-AG','EG ArR Aargau','§ 6','https://www.lexfind.ch/fe/de/tol/1582','2025-09-01','Swiss-Caselaw-Artikelvolltext. Regionale Listen für Art. 20a ArG, keine pauschale Fristenzuordnung.');
source('AP22-FR-JG','CH-FR','Justizgesetz Freiburg','Art. 1 und 121','https://bdlf.fr.ch/api/de/versions/7926/pdf_file','2024-01-01','Amtlicher Volltext. ZPO/StPO-Kandidat, Tagesfristen. Stundenfristen ausdrücklich ausgenommen.');
source('AP22-FR-PRAXIS','CH-FR','TC FR 101 2012 89','Erwägung zu Art. 142 Abs. 3 ZPO und Art. 121 Abs. 2 JG','https://entscheidsuche.ch/docs/FR_Gerichte/FR_TC_001_101-2012-89_2012-04-25.pdf','2012-04-25','Nur zusammenhängender Suchauszug gelesen. Unterstützende Praxis, kein vollständiger aktueller Freigabenachweis.');
source('AP22-SO-STPO','CH-SO','EG StPO Solothurn','§ 10bis','https://bgs.so.ch/app/de/texts_of_law/321.3','2024-01-01','Aktueller Swiss-Caselaw-Artikelvolltext. Zwölf kantonale Tage ausdrücklich für Art. 90 Abs. 2 StPO.');
source('AP22-SO-ZPO','CH-SO','EG ZPO Solothurn','§ 22 Abs. 2','https://bgs.so.ch/api/de/versions/5488/pdf_file','2025-01-01','Aktuelles amtliches PDF Version 5488 vollständig gelesen, Liste auf S. 6. Letzte Änderung von § 22 per 01.03.2015. Zwölf kantonale Tage ohne Halbtag oder Bucheggberg-Ausnahme.');
source('AP22-SO-GS201463','CH-SO','Solothurn GS 2014, 63','Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG','https://bgs.so.ch/api/de/change_documents/file_dictionaries/1025/pdf_file','2015-03-01','Amtliches Änderungsrecht vollständig gelesen. Inkrafttreten 01.03.2015. Kein Halbtag und keine Bucheggberg-Ausnahme in diesen Listen.');
source('AP22-SO-ZPO2015','CH-SO','EG ZPO Solothurn historische Konsolidierung','§ 22 Abs. 2','https://bgs.so.ch/api/de/versions/4366/pdf_file','2015-03-01','Amtliches PDF vollständig an massgebender Stelle gelesen. Nicht als aktuelle 2025-Fassung ausgeben.');
source('AP22-GR','CH-GR','Ruhetagsgesetz Graubünden','Art. 2 und 3','https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file','2016-01-01','Amtliches PDF. Grundliste und Kompetenz für zusätzliche lokale Tage getrennt. VRG-Annahme nicht auf Bundesprofile übertragen.');
source('AP22-NE-LPA','CH-NE','Loi sur la procédure administrative Neuchâtel','Art. 33 Abs. 3','https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.130.pdf','2026-01-01','Swiss-Caselaw-Artikelvolltext. Verwaltungsschliessung mindestens halbtägig im LPA-Kontext. Bundeswirkung mit aktueller Norm gesondert prüfen.');
source('AP22-NE-LDJF','CH-NE','Loi sur le dimanche et les jours fériés','Art. 3','https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.02.pdf','2010-01-01','Artikeltext und amtliche Jahresübersicht neu gelesen. Bedingte Ersatzfeiertage bleiben bereits abgenommene Datumsregeln.');
source('AP22-NE-LANDERON','CH-NE','Arrêté concernant le dimanche et les jours fériés','Art. 2','https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf','2025-05-27','Artikeltext neu gelesen. Fronleichnam Le Landeron ist kantonal angeordnet, kein eigenständiges kommunales Recht.');
source('AP22-NE-RDF','CH-NE','Règlement fixant la durée du travail','Art. 11','https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.512.pdf','2023-01-01','Artikeltext neu gelesen. Feste Schliesstage von jährlich festzulegenden Ausgleichstagen trennen.');

const profiles = [
  {id:'StPO',anchor:'Partei / Rechtsbeistand',norm:'Art. 90 Abs. 2 StPO',source:'AP22-STPO',role:'Wohnsitz/Sitz der Partei oder ihres Rechtsbeistands. Priorisierung bei Vertretung gezielt nachweisen, keine freie Kalendervereinigung.',effect:'Fristende',recess:'Keine Gerichtsferien, Art. 89 Abs. 2.',limit:'Nur Tagesfristen. Keine automatische Übertragung der BGG-Praxis auf StPO.'},
  {id:'ZPO',anchor:'Gerichtsort',norm:'Art. 142 Abs. 3 ZPO',source:'AP22-ZPO',role:'Ort des zuständigen Gerichts. Partei- und Vertretungsort sind kein Ersatz.',effect:'Fristende und Art. 142 Abs. 1bis',recess:'Art. 145. Schlichtung und summarisches Verfahren grundsätzlich ausgenommen. Spezialrecht gesondert.',limit:'Art. 142 Abs. 1bis benötigt denselben Kalender bei gewöhnlicher Post. Diese Matrix aktiviert keine neue Zustellart.'},
  {id:'BGG',anchor:'Selbst handelnde Partei / Vertretung',norm:'Art. 45 Abs. 2 BGG',source:'AP22-BGG',role:'Selbst handelnde Partei, sonst massgebende Vertretung, insbesondere bei dortigem Zustelldomizil. Keine günstigste Wahl und keine Vereinigung.',effect:'Fristende',recess:'Art. 46. Ausnahmen einschliesslich politischer Rechte, Beschaffung und weiterer Abs.-2-Verfahren.',limit:'Mehrfachvertretung, Mandatswechsel, Ausland und mehrere Niederlassungen separat. Nachweise AP22-4A434 und AP22-7B561.'},
  {id:'VwVG',anchor:'Partei / Vertretung',norm:'Art. 20 Abs. 3 VwVG',source:'AP22-VWVG',role:'Wohnsitz/Sitz der Partei oder ihrer Vertretung. Qualifizierte Auswahl vorgeschlagen, Übertragungsnachweis der BGG-Praxis offen.',effect:'Fristende',recess:'Art. 22a. Vorsorgliche Massnahmen und öffentliche Beschaffungen ausgenommen.',limit:'Neuen Konsolidierungsstand per 2027 vor Freigabe prüfen. Keine unbekannte Gesetzesänderung unterstellen.'},
];
const catNames={publicHoliday:'Öffentlicher Feiertag',labourLawHoliday:'Arbeitsrechtlicher Feiertag',proceduralEquivalentDay:'Prozessual gleichgestellter Tag'};
const sourceById=Object.fromEntries([...sources,...newSources].map(s=>[s.id,s]));
const scopeRules=s=>rules.filter(r=>r.scope===s.id);
function classify(s,p){
  const rs=scopeRules(s),cats=[...new Set(rs.map(r=>r.category))];
  let status='Zuordnung offen',action='Grundliste prüfen',reason='Abgenommene Erhebung. Neue Fristwirkung je Verfahren und Ort noch nicht abschliessend geprüft.',evidence='AP18C wiederverwendet',refs=[s.source,p.source];
  const id=s.id;
  if(['CH-ALL','BE-ALL'].includes(id)){
    status='Bestand unverändert';action=id==='CH-ALL'?'Bundesfeiertag beibehalten':'Referenzkalender beibehalten';
    reason=id==='CH-ALL'?'Bundesweite Grundregel, keine vollständige kantonale Liste. Nicht mit einem Behördenort «Bund» gleichsetzen.':'Bestehende CH/BE-Anbindung bleibt. Neue Rollen-/Ortsauflösung nicht dadurch freigegeben.';
    evidence='Operativer Referenzbestand, keine neue Abnahme';
  }else if(id==='AG-ZPO-ALL'){
    status=p.id==='ZPO'?'Prüfvorschlag':'Zuordnung offen';action=p.id==='ZPO'?'Eigene ZPO-Liste':'Übertragung prüfen';
    reason=p.id==='ZPO'?'§ 21 EG ZPO nennt eine kantonsweite Liste. Regionale ArG-Räume sind für diese ZPO-Liste nicht nötig.':'ZPO-Gleichstellung nicht automatisch in dieses Profil kopieren. Kantonale Anerkennung und Praxis separat prüfen.';
    refs.push('AP22-AG-ZPO');evidence='02.10.2026 amtlicher Volltext';
  }else if(id.startsWith('AG-ARG')){
    status=p.id==='ZPO'?'Nicht übernehmen':'Zuordnung offen';action=p.id==='ZPO'?'AG-ZPO-ALL verwenden':'Regionale Anerkennung prüfen';
    reason=p.id==='ZPO'?'Keine zusätzliche regionale Auswahl aus dem Arbeitsrecht. Eigene ZPO-Liste ist der Kandidat.':'Regionale ArG-Kategorie allein genügt nicht. BGG-Praxis bestätigt zugleich, dass AG nicht pauschal vereinheitlicht werden darf.';
    refs.push('AP22-AG-ARR','AP22-4A538');evidence='02.10.2026 Artikeltext und BGG-Praxis';
  }else if(id==='FR-JG-ALL'){
    status=['ZPO','StPO'].includes(p.id)?'Prüfvorschlag':'Zuordnung offen';action=status==='Prüfvorschlag'?'JG-Liste für Tagesfristen':'Bundeswirkung prüfen';
    reason=status==='Prüfvorschlag'?'Art. 1 und 121 JG erfassen kantonale ZPO-/StPO-Verfahren. Stundenfristen ausgenommen. Bundesrechtlichen Anknüpfungsort separat beachten.':'JG-Liste nicht allein wegen FR-Parteiwohnort kopieren. BGE 124 II 527 belegt ein Gleichstellungsprinzip, nicht sämtliche aktuellen Einzelfälle.';
    refs.push('AP22-FR-JG','AP22-BGE124II527');evidence='02.10.2026 amtlicher Volltext';
  }else if(id.startsWith('FR-BAMG')){
    status=['ZPO','StPO'].includes(p.id)?'Nicht übernehmen':'Zuordnung offen';action=status==='Nicht übernehmen'?'FR-JG-ALL prüfen':'Anerkennung separat prüfen';
    reason='Arbeitsrechtliche Gebietsgruppen, keine persönliche Konfessionsauswahl. Für kantonale Tagesverfahren eigene JG-Liste. Bundeswirkung nicht aus BAMG-Kategorie erraten.';
    refs.push('AP22-FR-JG');evidence='AP18C plus neuer JG-Abgleich';
  }else if(id.startsWith('SO-RTG')){
    status=['ZPO','StPO'].includes(p.id)?'Nicht übernehmen':'Zuordnung offen';action=status==='Nicht übernehmen'?'Neue SO-Prozessliste prüfen':'RTG und Gleichstellung prüfen';
    reason='RTG-Halbtag unverändert ohne eigene Fristwirkung. Separate EG-ZPO-/EG-StPO-Liste kennt den 1. Mai ohne Halbtagsgrenze und keine Bucheggberg-Ausnahme. Keine stille Vermischung.';
    refs.push('AP22-SO-STPO','AP22-SO-ZPO','AP22-SO-GS201463');evidence='02.10.2026 gesonderte Prozessnormen';
  }else if(id==='GR-PUBLIC-ALL'){
    status='Quellenlücke';action='Grundliste nur mit Vorbehalt';reason='VRG-Annahme für kantonale Behörden gilt nicht pauschal für Bundesprofile. Rechtliche Wirkung nicht erhobener lokaler Tage und mögliche Produktgrenze entscheiden.';
    refs.push('AP22-GR');evidence='02.10.2026 amtlicher Volltext';
  }else if(id==='NE-LPA-ADDITIONAL'){
    status='Zuordnung offen';action='Gleichstellungswirkung prüfen';reason='LPA ab 2026 getrennt von früherer LPJA. BGG 9C_396/2018 verbietet pauschalen Ausschluss, ersetzt aber keinen aktuellen Übertragungsnachweis. Jahresbeschlüsse bleiben vorbehalten.';
    refs.push('AP22-NE-LPA','AP22-NE-RDF','AP22-9C396');evidence='02.10.2026 Normen und historische Praxis';
  }else if(id.startsWith('NE-')){
    status='Prüfvorschlag';action=id.includes('LANDERON')?'Örtliche Ergänzung':'Allgemeine Grundliste';reason='LDJF-Grundliste und bedingte Ersatzfeiertage. Le Landeron ist kantonal angeordnet. Weitere Verfahrensgleichstellungen/Jahresbeschlüsse noch offen, keine Vollständigkeitsfreigabe.';
    refs.push(id.includes('LANDERON')?'AP22-NE-LANDERON':'AP22-NE-LDJF');evidence='02.10.2026 Artikeltexte';
  }else if(id==='LU-JUSG-ART76'){
    status=['StPO','ZPO'].includes(p.id)?'Prüfvorschlag':'Zuordnung offen';action=status==='Prüfvorschlag'?'Eigene ZPO-/StPO-Liste':'Übertragung prüfen';reason='§ 76 JusG enthält laut abgenommenem Quellenpaket 13 eigene Tage für ZPO/StPO. Aktualitäts-/Ortsprüfung vor neuer Freigabe. Andere Verfahren nicht automatisch übernehmen.';
  }else if(['SH-ZPO-ADDITIONAL','SG-ZPO-ADDITIONAL'].includes(id)){
    status=p.id==='ZPO'?'Prüfvorschlag':'Zuordnung offen';action=p.id==='ZPO'?'Berchtoldstag ergänzen':'Praxisübertragung prüfen';reason='Verfahrensspezifischer ZPO-Praxisbeleg aus AP18. Nur Ergänzung zum Grundkalender. Neue Prüfung weiterer Profile nicht durch diese Erhebung ersetzt.';
  }else if(['LU-VRG-ADDITIONAL','ZG-VRG-ART10','ZH-GOG-ALL','VS-LOJ-ADDITIONAL'].includes(id)){
    action='Gesetzlichen Anwendungsbereich prüfen';reason='Eigene Prozessnorm, keine allgemeine Arbeitsfeiertagsliste. Reichweite für dieses Bundesprofil und Zusammenspiel mit Grundkalender gezielt nachweisen.';
  }else if(cats.includes('labourLawHoliday')){
    action='Kategorie und Bundeswirkung prüfen';reason='Arbeitsrechtliche Gleichstellung oder Mischprofil. Nicht ungeprüft vollständig übernehmen. Bundesfeiertag separat bewahren. Datumsalgorithmus ist keine Fristenfreigabe.';
    if(id==='JU-LJF-LABOUR'){status='Nicht übernehmen';action='JU-LJF-OFFICIAL prüfen';reason='Arbeitsrechtliche Teilmenge ist kein vollständiger Feiertagskalender. Allgemeine Art.-3-Liste separat führen, keine Doppelzählung.';}
  }else{
    status='Prüfvorschlag';action='Allgemeine Grundliste';reason='Öffentliche Feiertagsliste als Arbeitsvorschlag. Zusätzliche Prozessnormen, Ortsausnahmen und Aktualität für dieses Profil vor Freigabe bestätigen.';
    if(id==='AI-RTG-INNER-ADDITIONAL')reason='Nur gesetzlich bezeichnetes inneres Landesteilgebiet, nicht Oberegg. Geprüfte örtliche Zugehörigkeit nötig. Kein eigenständiges kommunales Recht.';
    if(id==='AI-RTG-ALL')reason+=' Abgenommene gesetzesbasierte Stephanstagsregel unverändert, amtlicher Kalenderkonflikt nicht neu geöffnet.';
    if(id==='GL-RTG-ALL')reason+=' Näfelser Fahrt mit bereits abgenommener Karwochenverschiebung übernehmen, nicht als starres Datum.';
  }
  return{status,action,reason,evidence,refs:[...new Set(refs)],cats};
}
const matrix=[];
for(const j of jurisdictions){for(const s of scopes.filter(s=>s.jurisdiction===j.id)){for(const p of profiles){
  const c=classify(s,p),rs=scopeRules(s);
  matrix.push({id:`AP22-${s.id}-${p.id.toUpperCase()}`,jurisdiction:j.id,place:j.labels.de,profile:p.id,scope:s.id,category:c.cats.map(v=>catNames[v]).join(' / '),status:c.status,action:c.action,anchor:p.anchor,reason:c.reason,sourceIds:c.refs,locator:[`${s.locator}`,p.norm].join(' | '),dates:`Erfasste Regelgültigkeiten ${[...new Set(rs.map(r=>r.from))].join(', ')} bis offen. Kein neuer Berechnungszeitraum freigegeben.`,evidence:c.evidence,release:c.status==='Bestand unverändert'?'Bestehende Freigabe, keine Erweiterung':'Keine neue Freigabe',comment:'',rules:rs.map(r=>r.id)});
}}}
for(const p of profiles.filter(p=>['StPO','ZPO'].includes(p.id))){
  matrix.push({id:`AP22-SO-PROCEDURAL-DRAFT-${p.id.toUpperCase()}`,jurisdiction:'CH-SO',place:'Solothurn',profile:p.id,scope:'SO-PROCEDURAL-DRAFT',category:'Prozessual gleichgestellter Tag',status:'Katalogergänzung nötig',action:'Separate Prozessliste ergänzen',anchor:p.anchor,reason:'Zwölf kantonale Tage plus Bundesfeiertag. 1. Mai ohne Halbtag, keine Bucheggberg-Ausnahme. Bestehenden RTG-Halbtagsentscheid nicht umdeuten. Fachliche Präzisierung erforderlich.',sourceIds:[p.source,p.id==='ZPO'?'AP22-SO-ZPO':'AP22-SO-STPO','AP22-SO-GS201463'],locator:p.id==='ZPO'?'§ 22 Abs. 2 EG ZPO / Art. 142 ZPO':'§ 10bis EG StPO / Art. 90 Abs. 2 StPO',dates:'Norm seit 01.03.2015. Kein neuer Produktzeitraum freigegeben.',evidence:'02.10.2026 neuer Quellenbefund. EG ZPO: aktuelle amtliche Fassung vollständig gelesen. EG StPO: aktueller Artikelvolltext im Gesetzesmirror.',release:'Keine neue Freigabe',comment:'',rules:[]});
}
assert.equal(matrix.length,198);
assert.equal(new Set(matrix.map(r=>r.id)).size,198);
assert.equal(new Set(matrix.map(r=>r.jurisdiction)).size,27);
for(const s of scopes)assert.equal(matrix.filter(r=>r.scope===s.id).length,4);
for(const r of matrix)for(const id of r.sourceIds)assert.ok(sourceById[id],id);

const checks=[
  ['R01','BGG','Partei SH, Vertretung mit Zustelldomizil GE','Genfer Bettag','Massgebender Vertretungskalender, keine Wahl des günstigeren Kantons.','AP22-4A434','Rechtsprinzip neu belegt','Rollenmodell spezifizieren'],
  ['R02','BGG','Partei an Fronleichnam-Feiertagsort, Vertretung VD','Fronleichnam','Parteiort allein verlängert nicht. Parteiwohnkanton des Urteils nicht erraten.','AP22-7B561','Rechtsprinzip neu belegt','Negativtest gegen Kalendervereinigung'],
  ['R03','ZPO','Gericht AG, Partei/Vertretung anderer Kanton','2. Januar','Gerichtsort mit AG-ZPO-Liste, kein Wechsel zum Wohnortkalender.','AP22-AG-ZPO | AP22-ZPO','Zuordnung zur Fachprüfung','Positiven Kalender-/Resolverfall festlegen'],
  ['R04','BGG','Relevanter AG-Ort in verschiedenen Bezirken','Allerheiligen','Keine pauschale AG-Gleichstellung. Relevante Gebietsmitgliedschaft muss bekannt sein.','AP22-4A538','Rechtsprinzip neu belegt','Positive und negative konkrete Orte festlegen'],
  ['R05','ZPO / StPO','SO, auch Bucheggberg','1. Mai 2026','Aus gesonderter Prozessliste ganztägig vorgeschlagen. RTG-Halbtag nicht als Grundlage.','AP22-SO-STPO | AP22-SO-ZPO | AP22-SO-GS201463','Fachliche Präzisierung offen','Nach Abnahme Katalogergänzung und Fristendetest'],
  ['R06','ZPO / StPO','FR, verschiedene BAMG-Regionalgruppen','Oster-/Pfingstmontag','JG-Liste im passenden kantonalen Tagesverfahren, keine persönliche Konfessionswahl.','AP22-FR-JG','Zuordnung zur Fachprüfung','Stundenfrist ausdrücklich negativ abgrenzen'],
  ['R07','Alle vier','GR, zusätzlicher lokaler Feiertag unbekannt','Örtlicher Zusatztag','Unbekannte lokale Wirkung nicht als bestätigtes Nein ausgeben. VRG-Annahme reicht nicht.','AP22-GR','Abdeckungsgrenze offen','Produktgrenze und nötige Warnung festlegen'],
  ['R08','Kalenderarithmetik','AR und AI','26.12.2026 / 26.12.2027 / 26.12.2028','2026 kein Stephanstag-Ereignis, 2027 Ereignis am Sonntag, 2028 kein Ereignis. Wochenende getrennt behandeln.','SRC-AR-ARGV-82211-V1058 | SRC-AI-RTG-822200-V1327','Datumsregel bereits abgenommen','Operative Projektion testen, Zuordnung separat'],
  ['R09','Kalenderarithmetik','GL','02.04.2026 / 09.04.2026','Näfelser Fahrt am 09.04.2026 wegen Karwochenverschiebung, nicht 02.04.2026.','SRC-GL-RTG-IXB211-20190701','Datumsregel bereits abgenommen','Positiv-/Negativtest der Projektion'],
  ['R10','Kalenderarithmetik','NE','02.01.2026 / 02.01.2029 / 02.01.2034','Nur 02.01.2034 Ersatz nach Sonntag. 2026/2029 keine Ersatzereignisse aus LDJF. LPA getrennt.','AP22-NE-LDJF','Datumsregel bereits abgenommen','Nicht unbedingten 2. Januar generieren'],
  ['R11','Kalenderarithmetik','NE','26.12.2026 / 26.12.2033','2033 Ersatz nach Sonntag, 2026 kein Ersatzereignis. Samstagwirkung bleibt separat.','AP22-NE-LDJF','Datumsregel bereits abgenommen','Bedingung und Wochenende nicht vermischen'],
  ['R12','Alle vier','NE, Le Landeron gegenüber übrigen Orten','Fronleichnam','Örtliche Ergänzung nur Le Landeron. Grundlage kantonal, daher innerhalb Erhebungsumfang.','AP22-NE-LANDERON','Zuordnung zur Fachprüfung','Ort muss eindeutig auflösbar sein'],
  ['R13','BGG','NE, aktuelle LPA gegenüber früherer LPJA','Pfingstmontag / Jahresbeschluss','Historisches Gleichstellungsprinzip belegt. Aktuelle Wirkung und konkrete Jahresdaten gesondert nachweisen.','AP22-9C396 | AP22-NE-LPA | AP22-NE-RDF','Zeitliche Übertragung offen','Nicht pauschal ein- oder ausschliessen'],
  ['R14','ZPO','Gewöhnliche Post am Gerichtsort an Feiertag','Art. 142 Abs. 1bis','Kalender zusätzlich bei Zustellzeitpunkt relevant. Der Matrixausbau aktiviert diese Zustellart nicht automatisch.','AP22-ZPO','Rechtswirkung neu belegt','Separate Zustellart-/Fristendeprüfungen'],
  ['R15','ZPO / StPO / BGG / VwVG','Gleicher Kalender, verschiedene Verfahrensarten','Gerichtsferien','Feiertag und Friststillstand sind unterschiedliche Wirkungen. Keine Gerichtsferien in StPO.','AP22-STPO | AP22-ZPO | AP22-BGG | AP22-VWVG','Rechtsprinzip neu belegt','Bestehende Stillstandstests als Regression'],
  ['R16','Alle vier','Eigenständiges kommunales Recht oder Personalurlaub','Nicht erfasster lokaler Tag','Nicht automatisch ergänzen. Erhebungsausschluss darf nicht als Beweis rechtlicher Irrelevanz dienen.','AP22-BGE115IV266 | AP22-GR','Scopegrenze bestehend','Einschränkung bei möglicher rechtlicher Wirkung'],
  ['R17','Alle vier','Bundesbehörde mit Partei-/Vertretungsort BE, bei ZPO separat Gerichtsort prüfen','Bund und Kanton nicht verwechseln','Behördenebene Bund ist kein vollständiger Feiertagsort. CH-ALL enthält nur die Bundesregel. ZPO bleibt am Gerichtsort, nicht am Partei-/Vertretungsort.','AP22-STPO | AP22-ZPO | AP22-BGG | AP22-VWVG','Rechtsprinzip neu belegt','Kein stiller Rückfall auf reinen Bundeskalender'],
  ['R18','VwVG','Anwendungsdatum ab 2027','Künftige Konsolidierung','Vor Freigabe neue Fassung prüfen. Lookup-Hinweis allein belegt keine Änderung der Fristenartikel.','AP22-VWVG','Prüfauftrag','Versionierte Aktualitätskontrolle'],
];
for(const row of checks)for(const id of row[5].split(' | '))assert.ok(sourceById[id],id);
const allSources=[...sources.map(s=>({...s,review:'AP18/MVP0.6 wiederverwendet'})),...newSources];
assert.equal(new Set(allSources.map(s=>s.id)).size,allSources.length);
const model={kind:'ap22a-review-matrix',version:'0.1',preparedOn:date,status:'Nicht abgenommen',productActivation:false,source:{path:sourcePath,sha256:sourceSha,release:'2026-10-01-mvp-06-approved.1'},counts:{jurisdictions:27,existingScopes:49,existingRules:479,matrixRows:198,plannedNewScopes:1,checks:checks.length},profiles,matrix,scopes,assignments,sources:allSources,checks};

const C={navy:'#122C40',teal:'#2F6F73',text:'#172126',muted:'#566168',pale:'#E7EEEE',amber:'#FFF1CB',red:'#FCE3DE',white:'#FFFFFF'};
const col=n=>{let r='';for(n++;n>0;n=Math.floor((n-1)/26))r=String.fromCharCode(65+(n-1)%26)+r;return r;};
const wb=process.argv.includes('--verify')?await SpreadsheetFile.importXlsx(await FileBlob.load(file)):Workbook.create();
const specs=[];
function tableSheet(name,title,subtitle,headers,rows,widths,tableName,options={}){
  const s=wb.worksheets.add(name),end=6+rows.length,last=col(headers.length-1);
  s.showGridLines=false;
  s.getRange(`A1:${last}${end}`).format={font:{name:'Arial',size:10,color:C.text},verticalAlignment:'top',wrapText:true,rowHeight:options.rowHeight??96};
  widths.forEach((w,i)=>{s.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth=w;});
  s.getRange('A1:F2').merge();s.getRange('A1').values=[[title]];
  s.getRange('A1:F2').format={fill:C.navy,font:{name:'Arial',size:17,bold:true,color:C.white},verticalAlignment:'center'};
  s.getRange('A3:F4').merge();s.getRange('A3').values=[[subtitle]];
  s.getRange('A3:F4').format={font:{name:'Arial',size:10,color:C.muted},fill:C.pale,verticalAlignment:'center'};
  s.getRange(`A1:${last}4`).format.rowHeight=24;s.getRange(`A5:${last}5`).format.rowHeight=10;
  s.getRange(`A6:${last}${end}`).values=[headers,...rows];
  const t=s.tables.add(`A6:${last}${end}`,true,tableName);t.showFilterButton=true;
  s.getRange(`A6:${last}6`).format={fill:C.teal,font:{name:'Arial',size:10,bold:true,color:C.white},rowHeight:38,verticalAlignment:'center'};
  for(let r=7;r<=end;r++){
    const lines=Math.max(...rows[r-7].map((v,i)=>String(v??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/(widths[i]*0.9))),0)));
    s.getRange(`A${r}:${last}${r}`).format={fill:r%2?C.white:C.pale,rowHeight:Math.max(36,lines*13+12)};
  }
  s.freezePanes.freezeRows(6);s.freezePanes.freezeColumns(options.freezeColumns??3);
  if(options.comment){const c=col(headers.indexOf('Bemerkung David'));s.getRange(`${c}7:${c}${end}`).format.fill=C.amber;}
  specs.push({name,headers,rows:rows.length,last,end});return s;
}
if(!process.argv.includes('--verify')){
  const intro=[
    ['Überblick','27 Gemeinwesen','49 bestehende Räume','4 Bundesprofile','198 Zuordnungszeilen','Arbeitsentwurf V0.1, keine neue Produktfreigabe'],
    ['Verfahren','Massgebender Ort','Wirkung','Norm / Quelle','Friststillstand','Abgrenzung'],
    ...profiles.map(p=>[p.id,p.anchor,p.effect,`${p.norm}\n${p.source}`,p.recess,`${p.role}\n${p.limit}`]),
    ['Leseschlüssel','Bestand unverändert','Prüfvorschlag','Zuordnung offen','Quellenlücke','Nicht übernehmen / Katalogergänzung nötig'],
    ['Bedeutung','Bisher operative CH/BE-Daten, keine Ausdehnung.','Begründeter Arbeitsvorschlag, teils nur aus AP18 wiederverwendet. Keine Fachabnahme.','Rechtliche Zuordnung zu genau diesem Verfahren noch offen.','Fehlender Nachweis verhindert Vollständigkeitsbehauptung.','Nicht übernehmen gilt nur für die bezeichnete Datenliste. Neuer SO-Entwurf ist noch nicht im Katalog.'],
    ['Arbeitsweise','1. Verfahrensmatrix nach Kanton und Verfahren filtern.','2. Status und Begründung prüfen, Quellen-ID im Blatt Quellen nachschlagen.','3. Gebietsdefinitionen unter Geltungsräume prüfen.','4. Offene Bemerkungen in gelben Spalten erfassen.','Fachentscheid durch David Steimer separat dokumentieren. Bemerkungen sind keine automatische Freigabe.'],
    ['Quellenstatus','84 Quellenmetadaten aus AP18/MVP0.6 übernommen.','24 zusätzliche gezielte Recherchenachweise vom 02.10.2026.','Nicht alle 84 Quellen in dieser Matrix erneut geöffnet.','Frischer Artikelcheck ist keine vollständige Prüfung aller Sonderfristen.','Alte Katalogtexte und Status bleiben als historische Herkunft erkennbar, nicht als neue Abnahme.'],
    ['Umfang','Bund und 26 Kantone','Nur Tagesfristen in StPO, ZPO, BGG, VwVG','Keine Freigabe von ATSG-Anbindungen oder kantonalen Verwaltungsverfahren','Eigenständiges kommunales Recht nicht erhoben. Daraus folgt keine pauschale rechtliche Irrelevanz.','Friststillstand, Zustellung, Feiertag und Behördenzuständigkeit getrennt behandeln.'],
    ['Zahlen','Bestandszeilen','Prüfvorschläge','Offene Zuordnungen','Quellenlücken','Nicht übernehmen / neue Listen'],
    ['Anzahl',null,null,null,null,null],
    ['Herkunft','MVP0.6, Katalog1.0.0','479 Feiertagsregeln','95 räumliche Zuordnungen','198 = 49 × 4 + 2 neue SO-Zeilen','Keine Änderung am freigegebenen Datenrelease'],
    ['Dateiablage','Diese Datei ist die kommentierbare Arbeitskopie.','Ein später abgenommener Stand wird separat eingefroren.','Änderungen nicht durch erneuten Builderlauf überschreiben.','Hash des Eingangskatalogs in matrix-data.json und QA-Bericht.','E/Q/P, AP5, Mirrors und GitHub bleiben durch die Datei unverändert.'],
  ];
  const start=tableSheet('Lesehilfe','STEIMER  |  Kalenderaktivierung AP22A','Stand 02.10.2026  ·  V0.1 zur fachlichen Prüfung  ·  Bewusst noch keine schweizweite Aktivierung', ['Bereich','Angabe 1','Angabe 2','Angabe 3','Angabe 4','Erläuterung'],intro,[20,33,33,38,43,68],'AP22_Lesehilfe',{rowHeight:140,freezeColumns:1});
  start.getRange('A7:F7').format={rowHeight:38,font:{name:'Arial',size:11,bold:true,color:C.navy}};
  start.getRange('A8:F8').format={rowHeight:35,fill:C.teal,font:{name:'Arial',size:10,bold:true,color:C.white}};
  start.getRange('A13:F13').format.rowHeight=40;start.getRange('A18:F19').format.rowHeight=44;
  const mrows=matrix.map(r=>[r.id,r.place,r.profile,r.scope,r.status,r.action,r.anchor,r.category,r.reason,r.sourceIds.join('\n'),r.locator,r.dates,r.evidence,r.release,r.comment]);
  const mat=tableSheet('Verfahrensmatrix','STEIMER  |  Verfahren und Feiertagsräume','Filter zuerst Kanton und Verfahren. Jede Zeile bewertet eine Datenliste, nicht die vollständige Abdeckung eines Kantons.', ['Zuordnung-ID','Kanton / Bund','Verfahren','Geltungsbereich-ID','Prüfstatus','Vorgeschlagene Verwendung','Massgebender Ort','Kategorie','Begründung und offene Frage','Quellen-IDs','Fundstellen','Zeitliche Grenze','Prüfevidenz','Neue Produktfreigabe','Bemerkung David'],mrows,[35,19,12,40,27,34,32,38,76,44,44,52,48,36,55],'AP22_Verfahrensmatrix',{rowHeight:110,comment:true});
  for(let i=0;i<matrix.length;i++){
    const r=matrix[i];mat.getRange(`E${i+7}`).format.fill=['Quellenlücke','Katalogergänzung nötig'].includes(r.status)?C.red:r.status==='Bestand unverändert'?C.pale:C.amber;
  }
  const n=6+matrix.length;
  start.getRange('B19:F19').formulas=[[
    `=COUNTIF(Verfahrensmatrix!E7:E${n},"Bestand unverändert")`,
    `=COUNTIF(Verfahrensmatrix!E7:E${n},"Prüfvorschlag")`,
    `=COUNTIF(Verfahrensmatrix!E7:E${n},"Zuordnung offen")`,
    `=COUNTIF(Verfahrensmatrix!E7:E${n},"Quellenlücke")`,
    `=COUNTIF(Verfahrensmatrix!E7:E${n},"Nicht übernehmen")+COUNTIF(Verfahrensmatrix!E7:E${n},"Katalogergänzung nötig")`
  ]];
  const grow=scopes.map(s=>[s.id,s.labels.de,s.labels.fr,s.labels.it,s.labels.rm,jurisdictions.find(j=>j.id===s.jurisdiction).labels.de,s.type,s.boundary,assignments.filter(a=>a.scopeId===s.id).map(a=>`${a.effect==='exclude'?'Ausnahme: ':''}${a.de}${a.officialId?` [${a.officialIdSystem} ${a.officialId}]`:''}`).join('\n'),s.source,s.locator,`${s.from} bis ${s.to??'offen'}`,[...new Set(scopeRules(s).map(r=>catNames[r.category]))].join(' / '),scopeRules(s).length,'']);
  tableSheet('Geltungsräume','STEIMER  |  49 bestehende Geltungsräume','Inventar aus dem unveränderten Katalog. Historische Abgrenzungstexte sind keine neue Verfahrensfreigabe. Neue SO-Liste nur im Matrixentwurf.', ['Bereich-ID','Deutsch','Français','Italiano','Rumantsch Grischun','Kanton / Bund','Raumtyp','Bestehende Abgrenzung','Räumliche Zuordnungen','Quellen-ID','Fundstelle','Erfasste Gültigkeit','Regelkategorien','Regeln im Bestand','Bemerkung David'],grow,[37,49,49,49,49,20,23,80,70,45,47,28,43,16,55],'AP22_Geltungsraeume',{rowHeight:145,freezeColumns:1,comment:true});
  tableSheet('Prüfpunkte','STEIMER  |  Referenzfälle und offene Entscheidungen','18 positive und negative Prüfpunkte. Erwartete Wirkung ist Prüfauftrag, kein ausgeführter Produktnachweis.', ['Fall-ID','Verfahren','Konstellation','Datum / Gegenstand','Erwartete Wirkung oder Grenze','Quellen-IDs','Fachlicher Stand','Nächster Nachweis','Bemerkung David'], checks.map(r=>[...r,'']),[14,25,52,43,76,58,35,52,55],'AP22_Pruefpunkte',{rowHeight:108,freezeColumns:1,comment:true});
  const sourceSheet=tableSheet('Quellen','STEIMER  |  Quellen und Prüftiefe','84 unveränderte Quellenmetadaten plus 24 neue Rechercheeinträge. Wiederverwendung ist ausdrücklich keine neue Vollprüfung.', ['Quellen-ID','Gemeinwesen','Titel','Fundstelle','URL','Fassung / Entscheid','Abruf laut Bestand','Prüftiefe AP22A','Inhalt und Grenzen','Bemerkung David'],allSources.map(s=>[s.id,s.jurisdiction,s.title,s.locator,s.url,s.versionOn,s.retrievedOn,s.review,s.note,'']),[43,18,60,54,85,22,22,33,78,55],'AP22_Quellen',{rowHeight:120,freezeColumns:1,comment:true});
  // HYPERLINK calculation is not implemented in this artifact runtime.
  // Preserve ordinary cell text and add native link relationships after export.
  sourceSheet.getRange(`E7:E${6+allSources.length}`).format.font.color='#1A5C8E';
  wb.recalculate();
  const counts=start.getRange('B19:F19').values[0];
  assert.equal(counts.reduce((a,b)=>a+b,0),matrix.length);
  assert.equal(counts[0],8);
  // One real dependency check, then restore the original matrix before delivery.
  const old=mat.getRange('E7').values[0][0];mat.getRange('E7').values=[['Zuordnung offen']];wb.recalculate();
  assert.equal(start.getRange('B19').values[0][0],7);
  mat.getRange('E7').values=[[old]];wb.recalculate();assert.equal(start.getRange('B19').values[0][0],8);
  await fs.writeFile(path.join(out,'matrix-data.json'),JSON.stringify(model,null,2)+'\n');
}

const errorScan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP22A formula error scan'});
assert.ok(errorScan.ndjson.includes('Cell search matched 0 entries.'),errorScan.ndjson);
assert.equal(wb.worksheets.getItem('Verfahrensmatrix').getRange('A7:A204').values.flat().filter(Boolean).length,198);
assert.equal(wb.worksheets.getItem('Geltungsräume').getRange('A7:A55').values.flat().filter(Boolean).length,49);
assert.equal(wb.worksheets.getItem('Quellen').getRange('A7:A114').values.flat().filter(Boolean).length,108);
assert.deepEqual(wb.worksheets.getItem('Quellen').getRange('E7:E114').values.flat(),allSources.map(s=>s.url));
const views=[['Lesehilfe','A1:F12'],['Lesehilfe','A13:F21'],['Verfahrensmatrix','A1:F11'],['Verfahrensmatrix','G6:O10'],['Verfahrensmatrix','A201:F204'],['Geltungsräume','A1:F9'],['Geltungsräume','G6:O9'],['Prüfpunkte','A1:F11'],['Prüfpunkte','F6:I12'],['Quellen','A89:D94'],['Quellen','E89:J94']];
for(let i=0;i<views.length;i++){
  const [sheetName,range]=views[i];const blob=await wb.render({sheetName,range,scale:1,format:'png'});
  await fs.writeFile(path.join(qa,`${process.argv.includes('--verify')?'saved-':'draft-'}${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));
}
if(!process.argv.includes('--verify')){
  await(await SpreadsheetFile.exportXlsx(wb)).save(file);
  const patchLinks=String.raw`
import sys,json,zipfile,xml.etree.ElementTree as E,io
target,model_path=sys.argv[1:]
model=json.load(open(model_path))
main='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
rel='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
pkg='http://schemas.openxmlformats.org/package/2006/relationships'
E.register_namespace('',main)
E.register_namespace('r',rel)
with zipfile.ZipFile(target) as z:
    parts={name:z.read(name) for name in z.namelist()}
sheet_name='xl/worksheets/sheet5.xml'
sheet=E.fromstring(parts[sheet_name])
original_cells=[E.tostring(c) for c in sheet.findall('.//{'+main+'}c')]
links=E.Element('{'+main+'}hyperlinks')
rels_name='xl/worksheets/_rels/sheet5.xml.rels'
rels=E.fromstring(parts[rels_name]) if rels_name in parts else E.Element('{'+pkg+'}Relationships')
ids={x.attrib.get('Id') for x in rels}
for i,s in enumerate(model['sources'],7):
    rid='rIdAP22Source'+str(i)
    assert rid not in ids
    assert s['url'].startswith('https://')
    E.SubElement(links,'{'+main+'}hyperlink',{'ref':'E'+str(i),'{'+rel+'}id':rid})
    E.SubElement(rels,'{'+pkg+'}Relationship',{'Id':rid,'Type':rel+'/hyperlink','Target':s['url'],'TargetMode':'External'})
following={'printOptions','pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','customProperties','cellWatches','ignoredErrors','smartTags','drawing','legacyDrawing','legacyDrawingHF','picture','oleObjects','controls','webPublishItems','tableParts','extLst'}
idx=next((i for i,c in enumerate(sheet) if c.tag.rsplit('}',1)[-1] in following),len(sheet))
sheet.insert(idx,links)
assert original_cells==[E.tostring(c) for c in sheet.findall('.//{'+main+'}c')]
parts[sheet_name]=E.tostring(sheet,encoding='utf-8',xml_declaration=True)
parts[rels_name]=E.tostring(rels,encoding='utf-8',xml_declaration=True)
buf=io.BytesIO()
with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
    for name,data in parts.items(): z.writestr(name,data)
with open(target,'wb') as f: f.write(buf.getvalue())
print(json.dumps({'native_source_hyperlinks':len(model['sources']),'cell_values_changed':False}))
`;
  console.log(execFileSync(process.env.FRISTENRECHNER_PYTHON || 'python3',['-c',patchLinks,file,path.join(out,'matrix-data.json')],{encoding:'utf8'}).trim());
}
const audit={version:'0.1',file:path.basename(file),sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex'),inputSha256:sourceSha,counts:model.counts,sourceRows:108,formulaScan:errorScan.ndjson,dependencyTest:'status count changes and restored',renderedViews:views,nativeExcelInteraction:'not tested',reimported:process.argv.includes('--verify'),productFilesChanged:false};
await fs.writeFile(path.join(qa,process.argv.includes('--verify')?'saved-audit.json':'build-audit.json'),JSON.stringify(audit,null,2)+'\n');
assert.equal(createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex'),sourceSha);
console.log(JSON.stringify({file,rows:matrix.length,scopes:scopes.length,sources:allSources.length,counts:wb.worksheets.getItem('Lesehilfe').getRange('B19:F19').values[0],reimported:audit.reimported}));
