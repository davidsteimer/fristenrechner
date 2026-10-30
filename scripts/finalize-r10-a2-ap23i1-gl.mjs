// R10-A2 eighth sequential lot. Four native GL source rows and 88 new uses.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateSourcePartition,verifyDescriptors,collectDescriptors} from './r10-a2-review-contract.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),base='outputs/r10-a2-2026-10-28/ap23i1-gl';
const read=p=>fs.readFile(path.join(root,p)),json=async p=>JSON.parse(await read(p)),hash=b=>createHash('sha256').update(b).digest('hex');
const bind=async p=>{const b=await read(p);return {path:p,byteLength:b.length,sha256:hash(b)}};
const invPath='outputs/r10-a1-2026-10-28/sources/source-inventory.json',inv=await json(invPath);
assert.equal((await bind(invPath)).sha256,'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');
const sources=inv.rows.filter(r=>r.ownerLotId==='R10-A2-AP23I1'&&r.sourceId.includes('-GL-'));
assert.equal(sources.length,4);assert.equal(sources.reduce((n,s)=>n+s.referenceLocations.length,0),88);assert.equal(sources.reduce((n,s)=>n+s.newReferenceLocations.length,0),88);
const contentPath=base+'/content-evidence.json',extracts=(await json(contentPath)).extracts;
const primary=extracts.filter(e=>e.content.kind==='clex-full-norm-and-version-index');
assert.equal(primary.length,4);
const metadata=[];
for(const e of primary){
  const raw=(await json(e.evidence.path)).text_of_law;
  assert.equal(raw.current_version.id,raw.selected_version.id);
  assert.deepEqual(raw.future_versions,[]);assert.equal(raw.abrogated,false);assert.equal(raw.abrogated_scheduled,false);
  metadata.push({sourceIds:e.sourceIds,evidence:e.evidence,systematicNumber:raw.systematic_number,language:'de',currentVersion:raw.current_version,oldVersions:raw.old_versions,futureVersions:raw.future_versions,changeDocuments:raw.change_documents,abrogated:raw.abrogated,abrogatedScheduled:raw.abrogated_scheduled});
}
const meta=part=>metadata.find(e=>e.sourceIds.some(id=>id.includes('-'+part+'-')));
for(const [part,id]of [['FAHRT',687],['GOG',2280],['RTG',2110],['VRG',2395]])assert.equal(meta(part).currentVersion.id,id);
assert.deepEqual(meta('VRG').oldVersions.map(v=>v.id),[2286,2254,1971,1837,677,101]);
assert.match(meta('VRG').oldVersions.find(v=>v.id===2254).version_dates_str,/01\.02\.2022/);
const comparisons=extracts.flatMap(e=>e.historicalComparisons),normComparisons=extracts.filter(e=>e.content.kind!=='official-announcement-html').flatMap(e=>e.historicalComparisons);
assert.equal(comparisons.length,13);assert.equal(normComparisons.length,12);
assert.ok(normComparisons.every(c=>c.completeRawBytesEqual&&c.completeNormalizedTextEqual));
const announcement=extracts.find(e=>e.content.kind==='official-announcement-html');
assert.ok(announcement.historicalComparisons.every(c=>c.completeNormalizedTextEqual));
assert.match(announcement.content.text,/ersten Donnerstag im April/);assert.match(announcement.content.text,/Karwoche/);assert.match(announcement.content.text,/9\. April 2026/);
const norm=part=>primary.find(e=>e.sourceIds.some(id=>id.includes('-'+part+'-')));
const article=(part,n)=>Object.entries(norm(part).content.articles).find(([k])=>k.replaceAll('*','').trim()===n)?.[1];
assert.match(article('VRG','32'),/folgenden Tag/);assert.match(article('VRG','89'),/bis auf zwei Tage/);
assert.match(article('VRG','90'),/durch Gesetz bestimmten Fristen/);assert.match(article('VRG','140a'),/vor der betroffenen Instanz/);
assert.match(article('FAHRT','7'),/alljährlich durch ein Programm/);

const productPath='data/candidates/2026-10-28-ap23m3/administrative-procedures/ch-cantonal-administrative-procedures.json';
const acceptedPath='data/candidates/2026-10-22-ap23i3/administrative-procedures/ch-cantonal-administrative-procedures.json';
const product=await json(productPath),accepted=await json(acceptedPath),paths=product.paths.filter(p=>p.lawId==='vrg-gl');
assert.equal(paths.length,19);
const pathUseAssessments=[];
for(const p of paths){
  const q=product.qualificationPolicies.find(q=>q.pathId===p.pathId),req=Object.fromEntries(q.requirements.map(r=>[r.key,r.value]));
  assert.deepEqual(p,accepted.paths.find(a=>a.pathId===p.pathId));assert.deepEqual(q,accepted.qualificationPolicies.find(a=>a.pathId===p.pathId));
  const ordered=p.pathId.endsWith('-ordered'),shortened=p.pathId.includes('-shortened-'),interim=p.pathId.includes('-interim'),exception=p.pathId.endsWith('-exception');
  const suspension=ordered||exception?'gl-none':'gl-three';
  assert.deepEqual(p.suspensionSelection,{kind:'fixed',suspensionProfileId:suspension});
  assert.equal(p.endShiftGuard,suspension==='gl-three'?'blockWhenEnteringApplicableSuspension':'none');
  assert.equal(p.duration.kind,ordered?'authorityOrderedDays':shortened?'concretisedStatutoryDays':'statutoryDays');
  if(ordered){assert.equal(p.duration.boundMeaning,'technicalSafetyLimitNotLegalMaximum');assert.equal(req.durationBasis,'ordinaryProceduralOrder')}
  else if(shortened){assert.equal(p.duration.minimum,2);assert.equal(p.duration.maximum,interim?9:29);assert.equal(p.duration.legalNature,'statutoryNotExtendable');}
  else assert.equal(p.duration.value,interim?10:30);
  for(const[k,v]of Object.entries({unit:'day',direction:'forward',subsequentChange:'none',serviceMode:'qualifiedOrdinaryWritten',calendarUseQualified:true,authorityLevel:'cantonal',generalCantonalProcedure:true,specialLaw:'none',newLawApplies:true,qualifiedOpening:true,deadlineMethod:'daysForward',openingMode:'qualifiedDirectWrittenOrTimelyWrittenConfirmation',paymentOrFixedAppointment:false,shorteningEstablished:shortened,art90Exception:exception?(interim?'art90Paragraph3Established':'immediateSeriousDanger'):'none'}))assert.equal(req[k],v);
  for(const k of ['caseCoverage','calculationCoverage','sourceCoverage'])assert.deepEqual(p.temporalBinding[k],{from:'2026-08-29',to:'2027-12-31'});
  let meaning;
  if(ordered)meaning='Gewöhnliche konkret angeordnete Eingabetagesfrist '+(p.pathId.includes('initial')?'vor der erstinstanzlichen kantonalen Verwaltung':p.pathId.startsWith('gl-court')?'vor dem Verwaltungsgericht':'im Verwaltungsbeschwerdeverfahren')+'. Unter positiv qualifiziertem neuem Instanzrecht kein allgemeiner Stillstand. Keine Umdeutung von Zahlungsfrist, Erscheinungstermin oder konkret verkürzter gesetzlicher Beschwerde.';
  else meaning=(p.pathId.startsWith('gl-court')?'Verwaltungsgerichtsbeschwerde':'Verwaltungsbeschwerde an Departement/Regierungsrat')+' gegen '+(interim?'positiv selbstständig anfechtbaren Zwischenentscheid':'ordentlichen End- oder Nichteintretensentscheid')+'. '+(shortened?'Gültig konkret verkürzte gesetzliche Rechtsmittelfrist nach Art. 89 Abs. 2, genau '+(interim?'zwei bis neun':'zwei bis 29')+' Tage, keine freie Wahl von zwei Tagen. Die gesetzliche Fristnatur bleibt die ausdrücklich akzeptierte I1-B-Auslegung.':(interim?'Zehn':'Dreissig')+' Tage nach Art. 89 Abs. 1.')+' '+(exception?'Keine Ferien nur wegen konkret festgestelltem Art.-90-Abs.-3-Sachverhalt. Besondere Dringlichkeit oder Kürze allein genügen nicht.':'Drei gesetzliche Stillstandsperioden. Keine zusätzliche Ausnahme und keine Konkretisierung durch gespeicherte Fallannahmen.');
  pathUseAssessments.push({pathId:p.pathId,productPointer:'/paths/'+product.paths.indexOf(p),qualificationPointer:'/qualificationPolicies/'+product.qualificationPolicies.indexOf(q),meaning,duration:p.duration,suspensionSelection:p.suspensionSelection,endShiftGuard:p.endShiftGuard,temporalBinding:p.temporalBinding,normTimeline:p.normTimeline,requirements:req,pathAndQualificationExactlyEqualAcceptedI3:true});
}
assert.equal(pathUseAssessments.filter(p=>p.suspensionSelection.suspensionProfileId==='gl-three').length,8);
assert.equal(pathUseAssessments.filter(p=>p.suspensionSelection.suspensionProfileId==='gl-none').length,11);
const calendarPath='data/candidates/2026-10-28-ap23m3/calendars/ap22-gl-87c11e156541.json',calendar=await json(calendarPath);
assert.equal(calendar.rules.length,13);
assert.deepEqual(calendar.rules,(await json('data/candidates/2026-10-22-ap23i3/calendars/ap22-gl-87c11e156541.json')).rules);
const fahrtRule=calendar.rules.find(r=>r.ruleId.includes('NAEFELSER-FAHRT'));
assert.deepEqual(fahrtRule.calculation,{type:'nthWeekdayOfMonth',month:4,isoWeekday:4,occurrence:1});assert.equal(fahrtRule.condition,'shiftHolyThursdayBy7Days');
assert.ok(!calendar.rules.some(r=>r.calculation.type==='fixedMonthDay'&&r.calculation.month===1&&r.calculation.day===2));
const holidays=product.holidayBindings.filter(b=>b.lawId==='vrg-gl');
assert.deepEqual(holidays.map(b=>b.holidayBindingId),['gl-administration-seat','gl-court-seat']);
assert.ok(holidays.every(b=>b.legalBinding.roleUnion===false&&b.legalBinding.partyOrRepresentativeRequired===false&&b.physicalReuse.permissionInheritance==='none'));

const limits=[
  'Art. 140a bleibt instanzbezogen. Für alle neunzehn Wege ist die Anwendbarkeit des seit 01.02.2022 geltenden neuen Fristenrechts positiv zu qualifizieren. Ein Empfang im Rechenfenster ersetzt diese Tatsache nicht. Bekannter oder ungeklärter Altfall bleibt gezielt gesperrt, nicht rechtlich allgemein unberechenbar.',
  'Die konkrete gesetzliche Verkürzung nach Art. 89 Abs. 2 bleibt aufgrund der akzeptierten I1-B-Auslegung eine gesetzliche Rechtsmittelfrist. Dagegen spricht als bleibendes Gegenargument die behördlich festgesetzte konkrete Tagesdauer. Eine direkt tragende aktuelle GL-Praxis genau zu dieser Fristnatur wird nicht behauptet. Ferienfreiheit braucht zusätzlich Art. 90 Abs. 3.',
  'Unmittelbare ernste Gefahr, aufschiebende Wirkung, andere vorsorgliche Massnahme und Entscheid über eine Kostenvorschussfrist werden von blosser Dringlichkeit, beliebigem Zwischenentscheid und Kostenvorschusszahlung getrennt. Kein genereller Ferienausschluss wegen einer Zwei- oder Zehntagesdauer.',
  'Art. 90 Abs. 2 verbietet Termine in den Ferienzeiten, nicht nach bestätigter I1-Auslegung pauschal jeden Endtag einer gewöhnlichen laufenden Anordnungsfrist. Die drei gewöhnlichen Eingabetagesgruppen erhalten weder allgemeinen Stillstand noch einen neu erfundenen Ferien-Endtagskalender.',
  'Qualifizierte schriftliche Eröffnung oder schriftliche Bestätigung nach unverzüglichem Verlangen gemäss Art. 76 Abs. 2–3 bleiben nötig. Unverzüglich wird nicht in eine fixe Tagesdauer übersetzt. Plattformquittung, Siebentagesvoraussetzung, Publikation und mangelhafte Belehrung werden nicht aus einem blossen Lesedatum rekonstruiert oder durch Defaults geheilt.',
  'Behörden-/Gerichtssitz folgt der ausdrücklichen I1-E-Zuordnung und DEC-2026-031 mangels identifizierter ausdrücklicher Abweichung. Art. 32 Abs. 2 wird nicht als eigenständige Ortsnorm ausgegeben. Keine Vereinigung ausserkantonaler Partei- oder Vertretungsrollen.',
  'Die reine Endverschiebung in neu beginnende anwendbare Ferien bleibt genau in acht Drei-Perioden-Gruppen ohne definitives Ergebnis und Export. Elf Gruppen ohne Stillstand werden nicht dadurch gesperrt. Keine neue unmittelbare GL-Praxis zur Kollision wird behauptet.',
  'Fahrtgesetz Art. 7 bestimmt das jährliche Programm, nicht ausdrücklich die Aprilformel. Diese bleibt getrennt aus amtlicher Mitteilung belegt. 09.04.2026 ist amtlich genannt, 01.04.2027 ist aus der bestätigten Regel abgeleitet und kein behaupteter bereits gefasster Jahresbeschluss 2027.',
  'Keine zusätzliche GOG-Aktivierung. Historischer GOG-Art. 45 und alter, auch angeordnete Fristen umfassender Art. 90 werden nicht als aktuelles allgemeines Neurecht übernommen. Kein generischer Einsprache-, Steuer-, Sozial-, Klage-, Revisions-, Wiederherstellungs-, Erläuterungs-, Zahlungs- oder autonomer Kommunalpfad.',
  'Fall-, Rechen- und Quellenfenster 29.08.2026 bis 31.12.2027 mit allen tatsächlich berührten Normtagen unverändert. Keine Garantie künftiger Rechtsbeständigkeit, keine Quellenpromotion und keine Produkt-, Register-, Schema-, Daten-, Fenster-, Build-, Commit-, Upload- oder Betriebsänderung.'
];
const findings={
  'SRC-AP23I1-GL-FAHRT-18350524':{
    relevantProvisions:['Fahrtgesetz Art. 1–7, insbesondere Art. 7', 'Getrennte amtliche Mitteilung vom 06.01.2026 zur Terminregel und 09.04.2026'],
    contentFinding:'Der vollständig gelesene Erlass regelt den konfessionellen Ablauf, Predigt, Wahl der Geistlichkeit, Begrüssung und jährliches Programm. Art. 7 beauftragt den Regierungsrat mit Einzelheiten und Bekanntmachung. Er enthält keine ausdrückliche Regel erster Donnerstag im April oder Verschiebung in der Karwoche. Die Kalenderformel ist deshalb getrennt durch den ebenfalls vollständig neu verwendeten amtlichen Nachrichtentext vom 06.01.2026 belegt. Dieser nennt 09.04.2026 und dieselbe generelle Karwochenregel. Der heutige HTML-Gesamtstand unterscheidet sich durch den wechselnden Headerbild-/Stylebereich, nicht im vollständig verglichenen bereinigten Text. Keine blosse Hash-Abweichung wird als Rechtsänderung ausgegeben.',
    currentFutureFinding:{language:'de',systematicNumber:'I A/3/1',currentVersionId:687,currentVersionDate:'1835-05-24',publishedFutureVersions:[],finding:'Heute neu gesicherte Gesamt-PDF und ausdrücklich qualifiziert mitverwendeter vollständiger aktueller Norm-/Fassungsindex sind byte-/textgleich mit den individuellen I1-Belegen vom 22.10.2026. Kein registrierter Nachtrag, keine Zukunftsfassung oder angekündigte Aufhebung. Das begründet keine unbegrenzte Termin- oder Rechtsbeständigkeitsgarantie.'},
    newUseAssessment:'Alle drei Verwendungen sind gegenüber MVP09 neu: zwei rechtliche Verwaltungs-/Gerichtsfeiertagsbindungen und ein Feiertagsrichtlinienreview. Das Gesetz bleibt rechtliche Begleitung der Näfelser Fahrt. Die operative Formel stammt nicht fälschlich aus Art. 7. Die bereits vorhandene Feiertagsregel wird neu für die qualifizierten GL-Verfahrensrollen angebunden, ohne globale Änderung anderer Profile oder Aliasbildung mit der alten Katalog-ID.'
  },
  'SRC-AP23I1-GL-GOG-20220701':{
    relevantProvisions:['Gesamter aktueller Erlass Art. 1–55 und Änderungstabelle', 'Besonders Art. 1–2, 19–24, 34, 39 und 45', 'SBE 2022 10, Änderungsteil und ausdrückliche Aufhebung GOG 1990'],
    contentFinding:'Der gesamte aktuelle GOG-Text bestätigt Gerichtsorganisation, Verwaltungsgericht, Kommissionen, Verfahrensleitung und organisatorische Regeln. Eine zusätzliche allgemeine Feiertags- oder Stillstandsregel ist darin nicht enthalten. Art. 45 regelt heute das Generalsekretariat, nicht den alten Ferienbestand. Der neu gelesene Erlassakt SBE 2022 10 hebt das GOG 1990 ausdrücklich auf und ändert beim VRG Art. 14/28a, nicht als neue allgemeine Fristenordnung Art. 90. Geltungsbereich und Kommissionsorganisation allein schaffen keine zusätzliche konkret freigegebene Kommissionszuständigkeit.',
    currentFutureFinding:{language:'de',systematicNumber:'III A/2',currentVersionId:2280,currentVersionDate:'2022-07-01',decisionDate:'2021-09-05',publishedFutureVersions:[],finding:'Frische vollständige amtliche PDF, vollständiger Norm-/Fassungsindex und Erlassakt sind mit den individuellen I1-Originalen vollständig byte-/textgleich. Version 2280 seit 01.07.2022, keine angekündigte Folgefassung oder Aufhebung. Die im Index geführten älteren Versionen gehören dem aufgehobenen früheren Gesetz an und werden nicht mit dem aktuellen Erlass gleichgesetzt.'},
    newUseAssessment:'Null referenceLocations und null neue Graphkanten. Die native I1-ID bleibt bewusst ein ergänzender geprüfter Hilfsbeleg. Ihre Verfügbarkeit im Quellenverzeichnis wird nicht als positive Aktivierung oder alleinige rechtliche Grundlage eines Fristpfads interpretiert. Keine erfundene Quellenverwendung wird ergänzt.',
    positiveActivation:false
  },
  'SRC-AP23I1-GL-RTG-20190701':{
    relevantProvisions:['Art. 1–12 und Änderungstabelle, besonders Art. 2 und 7', 'Änderung SBE 2019 24'],
    contentFinding:'Art. 2 nennt dreizehn Feiertagsursprünge, darunter drei ohnehin sonntägliche Regeln. Zehn potentiell werktägliche Datumsregeln bleiben neben den Wochenenden. Der 2. Januar fehlt. Art. 7 lässt Ladenöffnungen am Fahrtsfest, der Landsgemeinde, der örtlichen Kirchweih und einzelnen Sonntagen sowie Tourismusausnahmen zu. Daraus entstehen keine zusätzlichen allgemeinen örtlichen Prozessfeiertage und keine dem OW-Modell entsprechende allgemeine lokale Feiertagsdelegation. Der ganze aktuelle Erlass und der Änderungserlass 2019 sind gelesen. Dessen Änderung betrifft Art. 4 zu Tätigkeiten an hohen Feiertagen, nicht die Liste in Art. 2. Die Fahrtregel wird durch den getrennten amtlichen Begleiter qualifiziert, der 1. August nicht doppelt gezählt.',
    currentFutureFinding:{language:'de',systematicNumber:'IX B/21/1',currentVersionId:2110,currentVersionDate:'2019-07-01',decisionDate:'2019-05-05',publishedFutureVersions:[],finding:'Frische Gesamt-PDF und Änderungsakt 361 sowie heute ausdrücklich qualifiziert mitverwendeter vollständiger deutscher Norm-/Fassungsindex sind mit den individuellen I1-Originalen byte-/textgleich. Vollständige Zukunftsliste leer, keine angekündigte Aufhebung. Kein neuer Feiertag aus der Versionsbezeichnung oder Verwaltungsschliessung konstruiert.'},
    newUseAssessment:'Alle 41 Verwendungen sind gegenüber MVP09 neu: zwei Feiertagsbindungen, ein Gesetz-Feiertagsreview und je zwei Quellen-/Normzeitlinienkanten an allen neunzehn GL-Pfaden. Beide rechtlich eigenständigen Rollen bleiben auf denselben vorhandenen Datumsbestand mit ausdrücklich neuer kantonaler Verfahrensberechtigung bezogen. Deutsch, Instrument, Fassung 2110 und tatsächliche Art.-2-/Art.-7-Aussage sind individuell geprüft. Keine URL-Aliasbildung, Listenvereinigung oder neue Feiertagsregel.'
  },
  'SRC-AP23I1-GL-VRG-20230101':{
    relevantProvisions:['Art. 1–2 und 7, 28–36, 74–77, 81–82, 85–96, 102–108, 122, 133 und 140–140a sowie Änderungstabelle', 'SBE 2021 29 und SBE 2022 10/64, konkrete VRG-Änderungsteile'],
    contentFinding:'Art. 32 bestätigt Folgetagsbeginn und letzte-Tage-Verschiebung. Plattformzustellungen nach Abs. 1a und elektronische Fristwahrung nach Art. 34 Abs. 3 bleiben eigenständige qualifizierte Vorgänge. Art. 74–77 unterscheiden vollständige Eröffnung, zulässigen Verzicht, unverzüglich verlangte schriftliche Bestätigung und mangelhafte Belehrung. Die Verweisung auf BGG Art. 112 Abs. 1 ist kein Import eines allgemeinen Begründungsverlangens nach Abs. 2. Art. 85/89 gilt für Verwaltungs- und Verwaltungsgerichtsbeschwerde: dreissig Tage gegen Endentscheid, zehn gegen positiv selbstständig anfechtbaren Zwischenentscheid nach Art. 86. Art. 89 Abs. 2 erlaubt konkrete Verkürzung bis zwei Tage, keine allgemeine Zweitagesfrist. Art. 90 pausiert im benannten Rechtsmittelrahmen gesetzliche, unter dem aktuellen Recht nicht gewöhnliche angeordnete Tagesfristen. Die Art.-90-Abs.-3-Tatbestände sind getrennt von besonderer Dringlichkeit und bloss kurzer Dauer. Art. 140a bindet Neurecht instanzbezogen an die seit 01.02.2022 geltende Änderung, nicht allein an ein Empfangsdatum 2026. Die tatsächlichen Änderungen von 2022/2023 und ihre vollständigen einschlägigen Teile sind gelesen. Art. 81/82 begründen keinen pauschalen Einspracheweg ohne Spezialzulässigkeit, Art. 122 keine als ordentliche Beschwerde versteckte Erläuterung und Art. 133 keinen positiven Zahlungsweg. Für gesetzlich konkret verkürzte Beschwerden bleibt die ausdrücklich akzeptierte I1-B-Auslegung erhalten, für reine Endverschiebung die begrenzte I1-F-Sperre. Die historische Praxis ist nur im getrennt gebundenen begrenzten Aussageumfang wiederverwendbar.',
    currentFutureFinding:{language:'de',systematicNumber:'III G/1',currentVersionId:2395,currentVersionDate:'2023-01-01',decisionDate:'2022-05-01',publishedFutureVersions:[],materialFristChangeDate:'2022-02-01',finding:'Frische vollständige amtliche PDF, ganzer Norm-/Fassungsindex und neu gesicherte Änderungsakte 459/483/537 sind mit den individuellen I1-Originalen byte-/textgleich. Die vollständige frühere Versionsfolge bestätigt Version 2254 ab 01.02.2022 mit dem materiellen Fristenwechsel, Version 2286 ab 01.07.2022 und den Digitalisierungsstand 2395 ab 01.01.2023. Das letzte Konsolidierungsdatum wird nicht zum Datum der gesetzlichen Stillstandsänderung umgedeutet. Kein aktuell angekündigter weiterer Stand oder Aufhebung.'},
    newUseAssessment:'Alle 44 Verwendungen sind gegenüber MVP09 neu: neunzehn Pfade mit je Quelle und Normzeitlinie, zwei Feiertags-, zwei Gesetz-/Review- und zwei Stillstandsbindungen. Alle neunzehn Pfadobjekte und ihre gesamten Qualifikationsregeln sind exakt gleich dem akzeptierten I3-Bestand. Acht Drei-Perioden-Gruppen, acht qualifizierte gesetzliche Ausnahmegruppen und drei gewöhnliche Anordnungsgruppen bleiben getrennt. Art. 140a, konkrete Verkürzungsanordnung, rechtlich massgebende Eröffnung und Behörden-/Gerichtssitz werden nicht aus gespeicherten Defaults fingiert. Der Neugebrauch wird aus vollständigem Inhalt und akzeptiertem Umfang geprüft, nicht nur aus Bytegleichheit.'
  }
};

const practicePath='outputs/r10-a2-2026-10-28/ap23i1-gl-support/practice-reuse.json';
const practice=await json(practicePath);
assert.equal(practice.humanApproval,false);assert.equal(practice.sourceReleaseApproved,false);
const rows=[];
for(const s of sources){
  const own=extracts.filter(e=>e.sourceIds.includes(s.sourceId)),uses=inv.referenceGraph.filter(u=>u.sourceId===s.sourceId),f=findings[s.sourceId];
  assert.ok(f&&own.length);assert.equal(uses.length,s.referenceLocations.length);
  rows.push({sourceId:s.sourceId,ownerLotId:s.ownerLotId,checkedOn:'2026-10-28',sourceRole:s.referenceUse,sourceUrls:s.urls,
    referenceLocations:s.referenceLocations,priorReferenceLocations:s.priorReferenceLocations,newReferenceLocations:s.newReferenceLocations,
    actualUseAssessments:uses.map(u=>({...u,newComparedToMVP09:true,assessment:u.pathId?pathUseAssessments.find(p=>p.pathId===u.pathId).meaning:s.sourceId.includes('-FAHRT-')?'Fahrtgesetzliche Jahresprogrammbegleitung zur rechtlich neuen GL-Kalenderverwendung. Die April-/Karwochenformel bleibt separat belegt.':'Gemeinsame Gesetz-, Stillstands- oder Feiertagsbindung der neunzehn qualifizierten GL-Wege im akzeptierten I1/I3-Rahmen.'})),
    method:'Vollständige heutige amtliche deutsche Norm-PDF und komplette aktuelle/publizierte zukünftige Fassungsfelder, individueller vollständiger Vergleich gegen I1-Originale. Konkrete neue Graphverwendungen, I3-Pfad-/Qualifikationsidentität, Normhierarchie und bewusster unreferenzierter Hilfsstatus eigenständig beurteilt. Vier tatsächliche Änderungsakte, amtliche Fahrtmitteilung und begrenzter historischer Praxisbegleiter getrennt.',
    ...f,outcome:s.sourceId.includes('-GOG-')?'unreferenced-support-current-confirmed-not-activated':'actual-new-uses-confirmed-with-retained-I1-limits',
    freshEvidence:own.map(e=>({...e.evidence,url:e.url,retrievedAt:e.retrievedAt,status:200,sameDayPhysicalReuse:e.sameDayPhysicalReuse,evidenceRole:e.sameDayPhysicalReuse?'same-day-primary-individually-qualified-for-native-GL-source-and-new-uses':'fresh-official-complete-norm-index-or-actual-amendment'})),
    contentEvidence:{...await bind(contentPath),pointers:own.map(e=>'/extracts/'+extracts.indexOf(e))},
    ...(s.sourceId.includes('-VRG-')?{boundedHistoricalPracticeSupport:{...await bind(practicePath),scope:'Nur historischer Nachweis auch der Beschwerdeeinlegungsfrist und getrennte Zwischenentscheidqualifikation. Der alte angeordnete Stillstand wird ausdrücklich nicht in Neufälle übertragen. Keine neue native Quelle, Graphkante oder Praxisbehauptung zur gesetzlichen Verkürzung/Kollision.'}}:{}),
    originalCheckedOn:'2026-10-22',declaredOriginalProductReviewedOn:s.declaredProductReviewedOn,originalEvidenceAssociations:s.historicalUrlAssociatedEvidence,originalTrancheAssessments:s.historicalTrancheAssessments,
    boundedReuse:{originalDatePreserved:true,reason:'Die individuelle I1-Forschung und gesonderte menschliche I1-Abnahme vom 22.10.2026 sowie I3-Abnahme vom 27.10.2026 bleiben mit ihren ursprünglichen Daten gebunden. Neue Primärlektüre, Fassungsabgleich und konkrete Neuverwendungsprüfung werden heute hinzugefügt. Physisch gleiche Belege lösen keine nativen IDs auf und begründen keine schon erteilte R10-Quellenfreigabe.'},
    remainingBoundaries:limits,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,productChanges:false,registerChanges:false});
}
const visual=[];
for(const [name,id,p,scope]of [
  ['Fahrt-p2','SRC-AP23I1-GL-FAHRT-18350524',2,'Art. 7, jährliches Programm, keine ausdrückliche Aprilformel'],
  ['GOG-p12','SRC-AP23I1-GL-GOG-20220701',12,'Aktueller organisatorischer Kontext Art. 38–41, keine positive Fristpfadaktivierung'],
  ['RTG-p1','SRC-AP23I1-GL-RTG-20190701',1,'Art. 2, dreizehn benannte Feiertagsursprünge ohne 2. Januar'],
  ['VRG-p11','SRC-AP23I1-GL-VRG-20230101',11,'Art. 32–34, Beginn, elektronische Qualifikation, letzte-Tage-Verschiebung und Fristwahrung'],
  ['VRG-p23','SRC-AP23I1-GL-VRG-20230101',23,'Art. 75–77, Verzicht, unverzüglich verlangte Bestätigung, mangelhafte Eröffnung'],
  ['VRG-p26','SRC-AP23I1-GL-VRG-20230101',26,'Art. 86–89, Zwischenentscheidqualifikation und dreissig/zehn/konkret zwei Tage'],
  ['VRG-p27','SRC-AP23I1-GL-VRG-20230101',27,'Art. 90 und 91, gesetzlicher Stillstand, Ausnahmen und konkrete Verbesserung'],
  ['VRG-p44','SRC-AP23I1-GL-VRG-20230101',44,'Art. 140/140a, instanzbezogenes Übergangsrecht'],
  ['Aenderung2021-p1','SRC-AP23I1-GL-VRG-20230101',1,'Tatsächliche Änderung Art. 33/90/140a und getrennte Steuerregel'],
  ['Aenderung2021-p2','SRC-AP23I1-GL-VRG-20230101',2,'Getrennte Steuerausnahmen und Übertragung des Inkraftsetzungsentscheids an Regierungsrat']
])visual.push({...await bind(base+'/'+name+'.png'),sourceId:id,physicalPage:p,scope,actuallyVisuallyRead:true});

const report={workPackage:'R10-A2',ownerLotId:'R10-A2-AP23I1',partition:'gl-four-sources',checkedOn:'2026-10-28',recordStatus:'reviewed-awaiting-common-report-and-human-acceptance',sourceCount:4,actualUseCount:88,newUseCount:88,
  inputInventory:await bind(invPath),candidateAdministrativeDocument:await bind(productPath),acceptedI3AdministrativeDocument:await bind(acceptedPath),retrievalEvidence:await bind(base+'/retrievals.json'),contentEvidence:await bind(contentPath),
  originalAcceptedDocuments:await Promise.all(['docs/fachrecht/ap23i1/recherche-gl.md','docs/fachrecht/ap23i1/befund-gl.json','docs/fachrecht/quellenpruefung-ap23i1.md','docs/fachrecht/abnahme-ap23i1.md','docs/fachrecht/abnahme-ap23i3.md'].map(bind)),
  counts:{uniquePrimaryTargets:13,newSuccessfulRetrievals:10,individuallyQualifiedSameDayReuse:3,completeOriginalNormPdfComparisons:4,completeOriginalFullMetadataComparisons:4,completeOriginalAmendmentComparisons:4,completeAnnouncementTextComparisons:1,announcementWholeByteChangesWithoutContentChange:1,accessGaps:0,positivelyAssessedGLPaths:19,exactlyPreservedI3PathsAndQualificationPolicies:19,threePeriodPaths:8,noSuspensionPaths:11,unreferencedNativeSupportSources:1,actuallyVisuallyReadPdfPages:10},
  completeCurrentAndFutureVersionIndices:metadata,
  sameDayPhysicalReuse:{report:await bind('outputs/r10-a2-2026-10-28/catalog-central/review.json'),nativeIdsRemainDistinct:true,evidence:extracts.filter(e=>e.sameDayPhysicalReuse).map(e=>({sourceIds:e.sourceIds,evidence:e.evidence,url:e.url,retrievedAt:e.retrievedAt,qualification:e.content.kind==='official-announcement-html'?'Amtliche Mitteilung vom 06.01.2026, deutsch, vollständiger Nachrichtentext mit derselben allgemeinen April-/Karwochenregel. Kein identischer Normakt und keine Verschmelzung mit Fahrtgesetz-ID.':'Gleiches deutschsprachiges Instrument, gleiche konkrete Fassung und vollständiger aktueller/future Index. Eigener neuer Verwaltungsverfahrensgebrauch wird hier eigenständig geprüft.'}))},
  pathUseAssessments,calendarAssessment:{calendar:await bind(calendarPath),physicalRuleCount:13,potentialWeekdayDatePatterns:10,alreadySundayOnlyOrigins:['Ostersonntag','Pfingstsonntag','Eidgenössischer Dank-, Buss- und Bettag'],fahrtRule,formulaSource:{evidence:announcement.evidence,url:announcement.url,publicationDate:'2026-01-06',actuallyAnnouncedDate2026:'2026-04-09',derivedDate2027:'2027-04-01',derivedDateNotClaimedAs2027GovernmentDecision:true},bindings:holidays.map(h=>({pointer:'/holidayBindings/'+product.holidayBindings.indexOf(h),holidayBindingId:h.holidayBindingId,anchor:h.anchor,roleUnion:h.legalBinding.roleUnion,partyOrRepresentativeRequired:h.legalBinding.partyOrRepresentativeRequired,permissionInheritance:h.physicalReuse.permissionInheritance})),meaning:'Gleicher physischer Kalenderbestand, zwei neue rechtliche Verfahrensverwendungen. Art. 32 Abs. 2 ist keine ausdrückliche Ortsnorm. DEC-2026-031/I1-E bindet Behörden- beziehungsweise Gerichtssitz. Kein 2. Januar, keine Ladenschliessungs-/Kirchweihregel als zusätzlicher Prozessfeiertag, keine Doppelzählung des 1. August.'},
  supplementalHistoricalPractice:{...await bind(practicePath),scope:'Nur begrenzte historische Wiederverwendung. Keine zusätzliche kanonische ID oder Graphkante.'},
  visualEvidence:visual,rows,remainingLimits:limits,remainingDependencies:['Gemeinsamer R10-Bericht und menschliche Quellenabnahme. Technischer Teilabschluss ist keine Quellenreleasefreigabe.'],
  humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,productChanges:false,registerChanges:false,operatingChanges:false};
validateSourcePartition(inv,[report]);const files=await verifyDescriptors(root,collectDescriptors(report));
await fs.writeFile(path.join(root,base+'/review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({ok:true,report:await bind(base+'/review.json'),rows:4,referenceLocations:88,newReferenceLocations:88,boundFiles:files.length},null,2));
