// R10-A2, seventh sequential lot. Six native OW source rows only.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {validateSourcePartition,verifyDescriptors,collectDescriptors} from './r10-a2-review-contract.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const base='outputs/r10-a2-2026-10-28/ap23h1-ow';
const read=p=>fs.readFile(path.join(root,p));
const json=async p=>JSON.parse(await read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const bind=async p=>{const b=await read(p);return {path:p,byteLength:b.length,sha256:hash(b)}};
const invPath='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const inv=await json(invPath);
assert.equal((await bind(invPath)).sha256,'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');
const sources=inv.rows.filter(s=>s.ownerLotId==='R10-A2-AP23H1'&&s.sourceId.includes('-OW-'));
assert.equal(sources.length,6);
assert.equal(sources.reduce((n,s)=>n+s.referenceLocations.length,0),126);
assert.equal(sources.reduce((n,s)=>n+s.newReferenceLocations.length,0),126);

const contentPath=base+'/content-evidence.json';
const content=await json(contentPath),extracts=content.extracts;
const meta=n=>extracts.find(e=>e.content.systematicNumber===n);
const article=(e,n)=>Object.entries(e.content.articles).find(([k])=>k.replaceAll('*','').trim()===n)?.[1];
for(const [n,id] of [['134.1',1792],['975.2',103],['130.1',1917],['134.14',1659],['133.21',1658]]){
  const e=meta(n);
  assert.equal(e.content.currentVersion.id,id);
  assert.equal(e.content.selectedVersion.id,id);
  assert.equal(e.content.abrogated,false);
  assert.equal(e.content.abrogatedScheduled,false);
  if(n==='130.1')assert.deepEqual(e.content.futureVersions.map(v=>v.id),[2031]);
  else assert.deepEqual(e.content.futureVersions,[]);
}
const comparisons=extracts.flatMap(e=>e.historicalComparisons);
assert.equal(comparisons.length,12);
assert.ok(comparisons.every(c=>c.completeRawBytesEqual&&c.completeNormalizedTextEqual));
assert.match(article(meta('130.1'),'64'),/Fristenstillstand/);
assert.match(article(meta('130.1'),'67'),/innert 20 Tagen/);
assert.match(article(meta('134.14'),'8b'),/innert 30 Tagen/);
assert.match(article(meta('134.14'),'12'),/innert 5 Tagen/);
assert.match(article(meta('134.14'),'14'),/Art\. 112 Abs\. 2/);
assert.match(article(meta('134.14'),'15'),/Fristen/);
assert.match(article(meta('133.21'),'11'),/Art\. 112 Abs\. 2/);
assert.match(article(meta('133.21'),'27'),/Bundesgesetzes über das Verwaltungsverfahren/);
assert.match(article(meta('134.1'),'28'),/2\. Januar, Ostermontag, Pfingstmontag sowie der 26\. Dezember/);
assert.match(article(meta('975.2'),'2'),/Lokalfeiertag/);
const futureStvg=extracts.find(e=>e.url.includes('/versions/2031/'));
const amendment=extracts.find(e=>e.url.includes('/file_dictionaries/4600/'));
assert.match(futureStvg.content.text,/Fristenstillstand/);
assert.match(futureStvg.content.text,/innert 20 Tagen/);
assert.match(amendment.content.text,/1\. Januar 2027/);
assert.match(amendment.content.text,/Keine Fremdänderungen/);

const productPath='data/candidates/2026-10-28-ap23m3/administrative-procedures/ch-cantonal-administrative-procedures.json';
const acceptedPath='data/candidates/2026-10-22-ap23h3/administrative-procedures/ch-cantonal-administrative-procedures.json';
const product=await json(productPath),accepted=await json(acceptedPath);
const meanings={
  'ow-admin-20':{days:20,stage:'administration',suspension:'ow-three',guard:'blockWhenEnteringApplicableSuspension',meaning:'Ordentliche allgemeine Verwaltungsbeschwerde nach StVG Art. 67 Abs. 1 mit zwanzig Tagen. Vollständig begründete, rechtlich massgebende Eröffnung, unbestrittene Belehrung, kantonale Zielinstanz und ausgeschlossenes Spezialrecht sind nötig. Über StVG Art. 64 und VGV Art. 15 gelten sinngemäss auch die drei Stillstandsperioden. Keine pauschale Ferienfreiheit der Verwaltung.'},
  'ow-court-30':{days:30,stage:'court',suspension:'ow-three',guard:'blockWhenEnteringApplicableSuspension',meaning:'Ordentliche allgemeine Verwaltungsgerichtsbeschwerde nach VGV Art. 8b mit dreissig Tagen an das Verwaltungsgericht. Zulässigkeit und Gericht bestimmen GOG Art. 1 und 64, nicht die Fristdauer allein. VGV Art. 15 trägt den sinngemässen ZPO-Fristenrahmen. Keine Aktivierung von Versicherungs-, Klage- oder besonderen Zwischenentscheidspfaden.'},
  'ow-admin-ordered':{days:'ordered',stage:'administration',suspension:'ow-three',guard:'blockWhenEnteringApplicableSuspension',meaning:'Tatsächlich behördlich angeordnete vorwärts laufende Tagesfrist im allgemeinen kantonalen Verwaltungsverfahren. StVG Art. 64 verweist für Berechnung und Stillstand auf VGV Art. 15. Keine erfundene Dauer, kein Fixtermin, keine Zahlung und kein als freie Dauer umgedeutetes gesetzliches Sondermittel.'},
  'ow-court-ordered':{days:'ordered',stage:'court',suspension:'ow-three',guard:'blockWhenEnteringApplicableSuspension',meaning:'Tatsächlich gerichtlich angeordnete Tagesfrist im gewöhnlichen Verwaltungsgerichtsverfahren. VGV Art. 9–10 und 15, keine besondere Ferienausnahme. Die zehn Tage für Klageschriftverbesserung nach Art. 2 Abs. 2 oder dreissig Tage für Klageantwort nach Art. 3 werden nicht als freie Beschwerdefristen aktiviert.'},
  'ow-admin-reasons-30':{days:30,stage:'administration',suspension:'ow-three',guard:'blockWhenEnteringApplicableSuspension',meaning:'Eigenständiges dreissigtägiges Begründungsverlangen bei gesetzlich zulässiger unbegründeter Verwaltungsverfügung nach VwVV Art. 11 Abs. 2a mit ausdrücklicher Verweisung auf BGG Art. 112 Abs. 2. Empfänger ist dieselbe verfügende Stelle. Die Anwendung des kantonalen Fristenrahmens und seiner drei Stillstandsperioden bleibt die ausdrücklich abgenommene Auslegung H1-B, nicht eine direkte OW-Urteilsaussage oder ein pauschaler Import von BGG Art. 44–46.'},
  'ow-court-reasons-30':{days:30,stage:'court',suspension:'ow-three',guard:'blockWhenEnteringApplicableSuspension',meaning:'Eigenständiges dreissigtägiges Begründungsverlangen bei rechtmässig unbegründetem Verwaltungsgerichtsentscheid nach VGV Art. 14 Abs. 4 und BGG Art. 112 Abs. 2. Dasselbe Gericht bleibt Empfänger. Drei Stillstandsperioden und kantonaler Gerichtsort folgen der ausdrücklich akzeptierten Auslegung H1-B. Kein BGer-Beschwerdepfad und keine allgemeine BGG-Partei- oder Vertretungsortbindung.'},
  'ow-court-suspensive-5':{days:5,stage:'court',suspension:'ow-none',guard:'none',meaning:'Besonderer fünftägiger schriftlicher Weiterzug des präsidialen Entscheids zur aufschiebenden Wirkung an dasselbe Gesamtgericht nach VGV Art. 12 Abs. 3. Ferienfreiheit bleibt die ausdrücklich bestätigte begrenzte Massnahmenanalogie H1-C über VGV Art. 15 und ZPO Art. 145 Abs. 2 Bst. b. Sie ist nicht ausdrücklich im Wortlaut von Art. 12 Abs. 3 enthalten und folgt nicht allein aus der Kürze der Frist.'}
};
const paths=product.paths.filter(p=>p.lawId==='stvg-vgv-ow');
assert.deepEqual(paths.map(p=>p.pathId).sort(),Object.keys(meanings).sort());
const pathUseAssessments=[];
for(const p of paths){
  const m=meanings[p.pathId],q=product.qualificationPolicies.find(q=>q.pathId===p.pathId);
  const req=Object.fromEntries(q.requirements.map(r=>[r.key,r.value]));
  assert.deepEqual(p,accepted.paths.find(x=>x.pathId===p.pathId));
  assert.deepEqual(q,accepted.qualificationPolicies.find(x=>x.pathId===p.pathId));
  assert.equal(p.duration.kind,m.days==='ordered'?'authorityOrderedDays':'statutoryDays');
  if(m.days!=='ordered')assert.equal(p.duration.value,m.days);
  else assert.equal(p.duration.boundMeaning,'technicalSafetyLimitNotLegalMaximum');
  assert.equal(p.suspensionProfileId,m.suspension);
  assert.equal(p.endShiftGuard,m.guard);
  for(const k of ['caseCoverage','calculationCoverage','sourceCoverage'])assert.deepEqual(p.temporalBinding[k],{from:'2026-08-29',to:'2027-12-31'});
  assert.deepEqual(p.normTimeline.map(t=>t.interval),[{from:'2026-08-29',to:'2026-12-31'},{from:'2027-01-01',to:'2027-12-31'}]);
  assert.ok(p.normTimeline[0].sourceRefs.some(r=>r.sourceId==='SRC-AP23H1-OW-STVG-20250101'));
  assert.ok(p.normTimeline[1].sourceRefs.some(r=>r.sourceId==='SRC-AP23H1-OW-STVG-20270101'));
  for(const [k,v]of Object.entries({authorityLevel:'cantonal',specialLaw:'excluded',stage:m.stage,serviceContext:'effectiveLegalTriggerKnown',notice:'uncontested',localHolidayEffect:'noAdditionalRelevantLocalHoliday',termChange:'none',unit:'day',direction:'forward',fixedEndDate:false,deviatingStart:false,materialPerformance:false}))assert.equal(req[k],v);
  assert.equal(q.localHolidayPolicy,'blockConcreteUnresolvedAdditionalEndEffect');
  if(p.pathId==='ow-admin-20'||p.pathId==='ow-court-30')assert.equal(q.openingChainPolicy,'requireOriginalOrTimelyRequestedReasons');
  if(p.pathId.includes('reasons'))assert.equal(req.reasonsContext,'qualifiedRequestUnderBGG112');
  if(p.pathId==='ow-court-suspensive-5'){assert.equal(req.suspensionException,'provisionalMeasureAnalogy');assert.equal(req.suspensiveReviewContext,'sameOverallCourt');}
  pathUseAssessments.push({pathId:p.pathId,productPointer:'/paths/'+product.paths.indexOf(p),qualificationPointer:'/qualificationPolicies/'+product.qualificationPolicies.indexOf(q),meaning:m.meaning,pathAndQualificationExactlyEqualAcceptedH3:true,duration:p.duration,suspensionProfileId:p.suspensionProfileId,endShiftGuard:p.endShiftGuard,temporalBinding:p.temporalBinding,normTimeline:p.normTimeline,requirements:req,openingChainPolicy:q.openingChainPolicy,localHolidayPolicy:q.localHolidayPolicy});
}

const calendarPath='data/candidates/2026-10-28-ap23m3/calendars/ap23h2-ow-procedural-core.json';
const calendar=await json(calendarPath);
const expectedExtras=[{type:'fixedMonthDay',month:1,day:2},{type:'easterOffsetDays',offsetDays:1},{type:'easterOffsetDays',offsetDays:50},{type:'fixedMonthDay',month:12,day:26}];
assert.deepEqual(calendar.rules.map(r=>r.calculation),expectedExtras);
assert.equal(calendar.rules.length,4);
assert.deepEqual(calendar.rules,(await json('data/candidates/2026-10-22-ap23h3/calendars/ap23h2-ow-procedural-core.json')).rules);
const holidays=product.holidayBindings.filter(b=>b.lawId==='stvg-vgv-ow');
assert.deepEqual(holidays.map(b=>b.holidayBindingId),['ow-administration-seat','ow-court-seat']);
assert.equal(holidays[0].projectionEvidence.legalInterpretation,'systematicAdministrativeTransferConfirmedH1D');
assert.equal(holidays[1].projectionEvidence.legalInterpretation,'directCourtStatute');
assert.ok(holidays.every(b=>b.legalBinding.roleUnion===false&&b.legalBinding.partyOrRepresentativeRequired===false));

// The first extractor kept complete XML text. This explicit article map also
// resolves Fedlex eIds with underscored letter suffixes, notably art_22_a.
const require=createRequire(path.join(root,'package.json')),{JSDOM}=require('jsdom');
const subsidiary=[];
for(const e of extracts.filter(e=>e.content.kind==='akn-xml')){
  const d=new JSDOM((await read(e.evidence.path)).toString('utf8'),{contentType:'application/xml'}),articles={};
  for(const [n,eid]of [['11','art_11'],['20','art_20'],['21','art_21'],['21a','art_21_a'],['22','art_22'],['22a','art_22_a'],['23','art_23'],['24','art_24']]){
    const a=d.window.document.querySelector('[eId="'+eid+'"]');
    assert.ok(a,n+' absent in '+e.evidence.path);
    articles[n]=a.textContent.replace(/\s+/g,' ').trim();
  }
  d.window.close();
  subsidiary.push({evidence:e.evidence,url:e.url,retrievedAt:e.retrievedAt,language:'de',publishedVersionDate:e.url.includes('/20270101/')?'2027-01-01':'2022-07-01',articles,scope:'Nur ausdrücklich subsidiärer VwVV-Art.-27-Begleiter. Die spezielle StVG-Art.-64-/VGV-Art.-15-Kette wird dadurch nicht verdrängt. Keine zusätzliche native Quell-ID und keine allgemeine positive VwVG-Pfadaktivierung.'});
}
assert.equal(subsidiary.length,3);

const limits=[
  'H1-B bleibt eine ausdrücklich akzeptierte systematische Auslegung für die beiden Begründungsverlangen. Keine direkte moderne OW-Praxis zur ganzen Fristenordnung wird neu behauptet. BGG Art. 112 Abs. 2 trägt die dreissigtägige Anforderung, nicht automatisch die gesamte BGG-Fristenordnung.',
  'H1-C bleibt die akzeptierte begrenzte Massnahmenanalogie für den fünftägigen Weiterzug. Ferienfreiheit ist weder ausdrücklicher Wortlaut von VGV Art. 12 Abs. 3 noch Folge jeder kurzen oder dringlichen Frist.',
  'H1-D trennt unmittelbare gerichtliche GOG-Geltung von systematischer administrativer Übertragung. Gleiche physische Kalenderdaten begründen weder automatische rechtliche Berechtigung noch freie Vereinigung mehrerer Ortsrollen.',
  'RTG Art. 2 Abs. 2 lässt einen kantonal vermittelten lokalen Feiertag zu. Der kantonsweite Kern macht diese Möglichkeit nicht irrelevant. Eine konkret ungeklärte zusätzliche örtliche Endtagswirkung bleibt ohne definitives Resultat und Export. Keine pauschale Sperre allein wegen fehlender gesamter Gemeindeliste.',
  'Bei sechs Pfaden mit anwendbarem Stillstand bleibt ausschliesslich die reine Endverschiebung in neu beginnende anwendbare Ferien eng gesperrt. Das ist eine Produktgrenze und keine Behauptung rechtlicher Unberechenbarkeit. Der Ferienausschluss des Fünftagespfads wird dadurch nicht aufgehoben.',
  'Qualifizierte rechtlich massgebende Eröffnung und unbestrittene Belehrung bleiben aktuelle Tatsachen. Eine rechtzeitig verlangte spätere vollständige Begründung wird nicht mit blosser nachträglicher Kenntnis oder allgemeinem Eröffnungsmangel gleichgesetzt. Keine erneute Anwendung von ZPO Art. 142 Abs. 1bis auf ein bereits qualifiziertes Eröffnungsdatum.',
  'Fenster 29.08.2026 bis 31.12.2027 unverändert, mit getrennten StVG-Fassungen vor und ab 01.01.2027 und Prüfung jedes relevanten Normtags. Keine Garantie unveränderter Rechtslage gegen erst künftig publizierte Änderungen.',
  'Keine positiven Steuer-, Sozial-, Beschaffungs-, politischen Rechte-, Zahlungs-, Klage-, materiellen Leistungs- oder autonomen Kommunalverfahren. Historische Materialien und Vergleichsentscheide werden nicht zu neuen positiven Normen aufgewertet.',
  'Keine Produkt-, Rechtsdaten-, Register-, Schema-, Zeitfenster-, Build-, Commit-, Upload-, Rechte- oder Betriebsänderung. H1/H3-Abnahmen ersetzen keine gemeinsame R10-Quellenabnahme.'
];

const findings={
  'SRC-AP23H1-OW-GOG-20220401':{
    relevantProvisions:['Art. 1, 28 Abs. 1–3, 64 und 84a'],
    contentFinding:'Art. 1 bestimmt das Obergericht zugleich als Verwaltungsgericht. Art. 64 trägt die allgemeine verwaltungsgerichtliche Zuständigkeit und ihre Zulässigkeitsgrenzen, keine Fristdauer von sich aus. Art. 28 Abs. 1 bestätigt den nicht mitgezählten auslösenden Tag. Abs. 2 stellt 2. Januar, Ostermontag, Pfingstmontag und 26. Dezember dem kantonsweiten Feiertagskern gleich. Abs. 3 betrifft getrennt die rechtzeitige Handlung, Schweizer Post und irrtümliche Einreichung an eine unzuständige Gerichts- oder Verwaltungsbehörde innerhalb des Kantons, nicht beliebige nationale Einreichungsorte. Art. 29–31 sind aufgehoben, insbesondere entsteht daraus kein aktueller eigener Ferienkalender. Die vier Ergänzungsregeln und beide rechtlich getrennten Bindungen sind im Kandidaten erhalten. Administrative Übertragung bleibt ausdrücklich H1-D-Auslegung, nicht direkte allgemeine GOG-Geltung.',
    currentFutureFinding:{systematicNumber:'134.1',language:'de',currentVersionId:1792,currentVersionDate:'2022-04-01',publishedFutureVersions:[],finding:'Heutige vollständige amtliche PDF und Volltext-/Fassungsmetadaten sind mit den individuellen H1-Originalen vom 22.10.2026 byte- und textgleich. Der aktuelle vollständige Index zeigt keine zukünftige Fassung oder angekündigte Aufhebung. Historische Änderungsakte bleiben als Historie ausgewiesen. Keine neue Fassungszäsur nach H1.'},
    newUseAssessment:'Alle 32 Verwendungen sind gegenüber MVP09 neu. Davon sind 24 Verwaltungsverfahrenskanten, vier Quellenkanten der eigenen Prozesskalenderdatei und vier Aktivierungskanten der Ergänzungsregeln. Art. 28 Abs. 2 ist für jede der vier Datumsregeln und Art. 1/64 für den Gerichtskontext geprüft. Sieben qualifizierte Wege, zwei Phasen und zwei getrennte rechtliche Kalenderrollen bleiben im abgenommenen H1/H3-Umfang. Die sonst schon physisch bekannte OW-Feiertagsfamilie ersetzt diese native H1-ID und die administrative H1-D-Begründung nicht.'
  },
  'SRC-AP23H1-OW-RTG-20090801':{
    relevantProvisions:['Art. 1–2, insbesondere Art. 2 Abs. 1 Bst. a–c, Abs. 2 und Abs. 3'],
    contentFinding:'Art. 2 Abs. 1 enthält acht Feiertage und fünf hohe Feiertage sowie die Sonntage. Ostersonntag, Pfingstsonntag und Eidgenössischer Bettag sind schon Sonntage. Die dreizehn benannten Herkunftsregeln mit vier GOG-Ergänzungen ergeben siebzehn benannte Ursprünge, aber vierzehn potentiell werktägliche Datumsmuster, nicht siebzehn zusätzliche freie Wochentage. Abs. 2 lässt die Einwohnergemeinde einen weiteren lokalen Feiertag bezeichnen. Abs. 3 ist die engere arbeitsgesetzliche Teilmenge und ersetzt den allgemeinen Prozesskern nicht. Bundesfeier wird nicht wegen ihrer kantonalen und bundesrechtlichen Herkunft doppelt gezählt.',
    currentFutureFinding:{systematicNumber:'975.2',language:'de',currentVersionId:103,currentVersionDate:'2009-08-01',publishedFutureVersions:[],finding:'Die heute neu gelesene vollständige PDF und die bereits heute in Los 3 frisch gesicherte vollständige deutsche Norm-/Fassungsantwort sind einzeln gegen die H1-Originale geprüft und byte-/textgleich. Version 103 ist weiterhin aktuell. Der vollständige Registerbestand zeigt keine publizierte Folgefassung oder angekündigte Aufhebung. Die frühere Los-3-Quellenrolle wird nicht in eine zusätzliche Verfahrensfreigabe umgedeutet.'},
    newUseAssessment:'Alle 23 Verwendungen sind gegenüber MVP09 neu: zwei rechtliche Feiertagsbindungen und je drei Quellen-/Normzeitlinienkanten an jedem der sieben OW-Wege. Geprüft sind der kantonsweite Art.-2-Abs.-1-Kern, die lokale Delegation und die Nichtgleichsetzung mit der ArG-Auswahl. Deutsch, GDB 975.2, Fassung 103 und konkrete Normstelle erlauben physische Belegteilung, nicht blosse URL-Aliasbildung. Keine pauschale Irrelevanz möglicher lokaler Endtage.'
  },
  'SRC-AP23H1-OW-STVG-20250101':{
    relevantProvisions:['Art. 1, 64, 65, 67–68 und 70, Fassungsgrenze 31.12.2026'],
    contentFinding:'Art. 64 verweist ausdrücklich für Berechnung, Erstreckung, Stillstand und Wiederherstellung subsidiär auf die VGV. Das trägt die spezielle Kette Art. 64 StVG → Art. 15 VGV → sinngemässe ZPO-Fristen auch für die allgemeine Verwaltung. Art. 67 Abs. 1 nennt zwanzig Tage und einen Spezialrechtsvorbehalt. Art. 68 betrifft aufschiebende Wirkung und vorsorgliche Massnahmen, nicht die fünftägige gerichtliche Sonderfrist von VGV Art. 12 Abs. 3. Art. 65 ermächtigt zu Regeln elektronischer Zustellung und ändert nicht die Eingabe einer bereits rechtlich qualifizierten Eröffnung. Gerichtliche Pfade werden nicht mit der administrativen Zwanzigtagesdauer überschrieben.',
    currentFutureFinding:{systematicNumber:'130.1',language:'de',currentVersionId:1917,currentVersionDate:'2025-01-01',currentVersionEnd:'2026-12-31',publishedFutureVersions:[{id:2031,from:'2027-01-01',decisionDate:'2026-05-21',publicationDate:'2026-07-02'}],finding:'Vollständige heutige Fassung 1917, sämtliche aktuelle/future Registerfelder und Nachtrag 4600 sind erneut gelesen und mit den individuellen H1-Originalen vollständig identisch. Die bestehende Befristung 31.12.2026 ist sachlich bestätigt, keine Fortgeltung dieser ID in der Folgephase erfunden. Der publizierte Nachtrag ändert Personalrecht, nicht die hier verwendeten Art. 64/67/68.'},
    newUseAssessment:'Alle 20 Verwendungen sind gegenüber MVP09 neu. Je sieben Pfadquellen und sieben erste Normzeitlinien verwenden diese Fassung, zusätzlich zwei Kalender-, zwei Gesetz-/Review- und zwei Stillstandsbindungen. Die ausdrückliche erste Phase endet am 31.12.2026. Dieselbe native ID ist keine unbefristete Quellenfreigabe. Gemeinsame Bindungen führen daneben ausdrücklich die separate 2027-ID mit.'
  },
  'SRC-AP23H1-OW-STVG-20270101':{
    relevantProvisions:['Art. 64 und 67–68 der Version 2031', 'Nachtrag vom 21.05.2026, Ziff. I–IV, Art. 51–53 und 71a'],
    contentFinding:'Die vollständig gelesene publizierte Folgefassung übernimmt Art. 64 und 67–68 im verwendeten Fristaussageumfang unverändert. Der ganze Nachtrag hebt Art. 51 auf, ändert Überschrift und Abs. 2 von Art. 52 sowie Art. 53 Abs. 3 und fügt Art. 71a zur Überbrückungsrente ein. Er nennt keine Fremdänderungen oder Fremdaufhebungen und setzt das Inkrafttreten auf 01.01.2027. Die ungenutzt abgelaufene Referendumsfrist ist ausgewiesen. Das sind tatsächliche materielle Personalrechtsänderungen im Erlassbestand, aber keine Änderung eines modellierten Rechenpfads. Kein pauschaler Gleichheitsbefund des ganzen StVG und keine Verwechslung publizierter Zukunft mit heute geltender Fassung.',
    currentFutureFinding:{systematicNumber:'130.1',language:'de',currentAsOfReview:1917,publishedFutureVersionId:2031,publishedFutureVersionDate:'2027-01-01',decisionDate:'2026-05-21',publicationDate:'2026-07-02',finding:'Die vollständige zukünftige PDF und der komplette zweitseitige Änderungsakt wurden heute neu gesichert, gelesen und gegen ihre individuellen H1-Originale byte-/textgleich bestätigt. Im heutigen vollständigen StVG-Index ist 2031 die einzige angekündigte Folgefassung. Keine nur stichtagsbezogene Ausblendung des bekannten Jahreswechsels.'},
    newUseAssessment:'Alle 20 Verwendungen sind gegenüber MVP09 neu. Je sieben Pfadquellen und sieben zweite Normzeitlinien sowie zwei Gesetz-/Review-, zwei Kalender- und zwei Stillstandsbindungen. Die tatsächlichen zweiten Normintervalle beginnen am 01.01.2027 und enden mit dem abgenommenen Fenster am 31.12.2027. Der bereits in H1 bekannte Personalrechtsnachtrag wird ausdrücklich gegen seine verwendeten Fristartikel abgeglichen, nicht nur aus gleichem PDF-Hash als irrelevant erklärt.'
  },
  'SRC-AP23H1-OW-VGV-20110101':{
    relevantProvisions:['Art. 2–3, 8, 8a, 8b, 9–10, 12 Abs. 1–3, 14 Abs. 3–4, 15 und 23'],
    contentFinding:'Art. 8b trägt dreissig Tage für die Verwaltungsgerichtsbeschwerde, Art. 12 Abs. 3 fünf Tage an das Gesamtgericht bei der besonderen aufschiebenden Wirkung. Art. 14 Abs. 4 verweist bei rechtmässig unbegründetem Entscheid gezielt auf BGG Art. 112 Abs. 2. Art. 15 verweist sinngemäss und unter Spezialvorbehalt auf die ZPO, ausdrücklich auch für Fristen. Mit StVG Art. 64 entsteht der administrative Anschluss, nicht ein genereller Ferienausschluss. Art. 2 Abs. 2 und 3 enthalten eigene Klageschriftverbesserungs- und Klageantwortfristen. Diese werden nicht zu allgemeinen Beschwerdewegen. Art. 9 Abs. 3 und 10 belassen eine konkret angeordnete Tagesfrist, ohne fixe freie Standarddauer zu erfinden. Art. 8a bewahrt den Sozialrechtsvorbehalt und aktiviert keinen neuen OW-Sozialweg. Art. 23 erhält alte Prozesshandlungen und schafft kein verlängertes Produktfenster. Die Auslegungsanteile H1-B und H1-C bleiben ausdrücklich vom Wortlaut getrennt.',
    currentFutureFinding:{systematicNumber:'134.14',language:'de',currentVersionId:1659,currentVersionDate:'2011-01-01',publishedFutureVersions:[],finding:'Heutige vollständige Original-PDF und vollständige Norm-/Fassungsantwort sind byte- und textgleich mit den H1-Originalen. Der gesamte aktuelle amtliche Index zeigt keine angekündigte Folgefassung oder Aufhebung. Die drei Ferienperioden und ihre Ausnahmen benötigen weiterhin den separat geprüften CH-ZPO-Begleiter und werden nicht aus einem aufgehobenen GOG-Art. 30 bezogen.'},
    newUseAssessment:'Alle 27 Verwendungen sind gegenüber MVP09 neu. Je drei Quellen-/Normzeitlinienkanten in sieben Pfaden, zwei Gesetz-/Review-, zwei Kalender- und zwei Stillstandskanten. Die erste allgemeine und die spätere ausdrücklich auf H1-C qualifizierte VGV-Locatorform beim Fünftagespfad bleiben beide auf denselben engen Sachverhalt begrenzt. Fünftagesweiterzug, dreissigtägige Beschwerde und Begründungsverlangen werden nicht vermischt. Alle sieben Pfadobjekte und Qualifikationsregeln sind exakt gleich dem abgenommenen H3-Bestand.'
  },
  'SRC-AP23H1-OW-VWVV-20200101':{
    relevantProvisions:['Art. 10–11, insbesondere Art. 11 Abs. 2a, Art. 15 und 27', 'Subsidiäre aktuelle/publizierte VwVG-Fassungen, Art. 11, 20–24 einschliesslich Art. 21a und 22a'],
    contentFinding:'Art. 11 Abs. 2a erlaubt die unbegründete Eröffnung und erklärt BGG Art. 112 Abs. 2 für anwendbar. Art. 10 verlangt grundsätzlich Rechtsmittelbelehrung. Art. 15 Abs. 3 enthält eine kurze konkret angesetzte Verbesserungsnachfrist, keine neue frei bestimmbare gesetzliche Dauer. Art. 27 verweist nur lückenfüllend sinngemäss auf das VwVG. Die speziellere StVG-Art.-64-/VGV-Art.-15-Fristenkette geht für die hier modellierten allgemeinen Pfade vor. Die aktuelle und publizierte 2027-VwVG-Fassung sind heute vollständig am benutzten Zeitabschnitt gegengelesen. Art. 20 Abs. 3 nennt Partei-/Vertretungsort, wird aber nicht ungeprüft zum OW-Ortswechsel importiert. Art. 22a enthält drei Perioden und Ausnahmen, ersetzt ebenfalls nicht den akzeptierten speziellen OW-Fristenrahmen. Art. 21/24 ändern ab 2027 die IGE-Benennung, nicht den benutzten allgemeinen Fristmechanismus. Kein neuer Zahlungs-, Wiederherstellungs- oder elektronischer Einreichungspfad folgt aus dieser Begleitlektüre.',
    currentFutureFinding:{systematicNumber:'133.21',language:'de',currentVersionId:1658,currentVersionDate:'2020-01-01',publishedFutureVersions:[],subsidiaryVwvgCurrentVersion:'2022-07-01',subsidiaryVwvgPublishedFutureVersion:'2027-01-01',finding:'Vollständige heutige OW-PDF und Norm-/Fassungsantwort sind mit den individuellen H1-Originalen vom 22.10.2026 byte-/textgleich. OW-Index ohne publizierte Folgefassung oder angekündigte Aufhebung. Die allgemein und ohne oberes Jahreslimit erfassten heutigen Bundesfassungs-/Wirkungsindices sowie beide indexierten Bundes-XML werden explizit als subsidiärer Begleiter zugeordnet. Kein stilles Quellenalias, keine Änderung des ursprünglichen OW-Prüfdatums.'},
    newUseAssessment:'Alle vier Verwendungen sind gegenüber MVP09 neu: eine Gesetzquellenkante und drei Kanten des administrativen Begründungsverlangens mit beiden Normphasen. Genau dieser neue Verwendungsumfang ist durch Art. 11 Abs. 2a und die begrenzte Art.-27-Subsidiarität überprüft. Die Bundesbegleiter sind physisch von der heutigen Bundesprüfung mitverwendet, aber neu gegen die eigene OW-Verweisungsfrage gelesen. Sie werden nicht als zusätzliche native H1-Quelle oder allgemeine OW-Zuständigkeit ausgegeben.'
  }
};

const rows=[];
for(const s of sources){
  const own=extracts.filter(e=>e.sourceIds.includes(s.sourceId)),uses=inv.referenceGraph.filter(g=>g.sourceId===s.sourceId);
  assert.ok(own.length&&findings[s.sourceId]);assert.equal(uses.length,s.referenceLocations.length);
  rows.push({
    sourceId:s.sourceId,ownerLotId:s.ownerLotId,checkedOn:'2026-10-28',sourceRole:s.referenceUse,sourceUrls:s.urls,
    referenceLocations:s.referenceLocations,priorReferenceLocations:s.priorReferenceLocations,newReferenceLocations:s.newReferenceLocations,
    actualUseAssessments:uses.map(g=>({...g,newComparedToMVP09:true,assessment:g.pathId?meanings[g.pathId].meaning:g.documentPath.startsWith('calendars/')?'Eigene Prozessergänzung genau nach GOG Art. 28 Abs. 2, nicht globaler Ersatz aller OW-Kalender.':g.documentPath.startsWith('holiday-catalogs/')?'Eigene Aktivierung der vier Prozessergänzungen, administrative Reichweite ausdrücklich durch akzeptiertes H1-D begrenzt.':'Gemeinsame Gesetz-, Ferien- oder Feiertagsbindung der sieben qualifizierten OW-Pfade mit zwei getrennten Rechtsrollen und beiden StVG-Phasen.'})),
    method:'Vollständige frische amtliche deutsche Norm-PDF und aktuelle/publizierte zukünftige Volltext-/Fassungsprüfung. Individueller vollständiger Byte- und Textvergleich gegen H1-Originale, konkrete neue Verwendungen und exakte H3-Pfad-/Qualifikationsidentität geprüft. Physische heutige Belegteilung nur mit ausdrücklicher Instrument-, Sprach-, Versions- und Aussagezuordnung.',
    ...findings[s.sourceId],outcome:'actual-new-uses-confirmed-with-retained-H1-limits',
    freshEvidence:own.map(e=>({...e.evidence,url:e.url,retrievedAt:e.retrievedAt,status:200,sameDayPhysicalReuse:e.sameDayPhysicalReuse,evidenceRole:e.sameDayPhysicalReuse?'same-day-primary-qualified-for-this-native-OW-ID-and-new-assertion-scope':'fresh-official-full-primary-norm-or-full-version-index'})),
    contentEvidence:{...await bind(contentPath),pointers:own.map(e=>'/extracts/'+extracts.indexOf(e))},
    originalCheckedOn:'2026-10-22',declaredOriginalProductReviewedOn:s.declaredProductReviewedOn,
    originalEvidenceAssociations:s.historicalUrlAssociatedEvidence,originalTrancheAssessments:s.historicalTrancheAssessments,
    boundedReuse:{originalDatePreserved:true,completeOriginalComparisonCount:own.reduce((n,e)=>n+e.historicalComparisons.length,0),reason:'H1-Forschung und gesonderte menschliche H1-B-/H1-C-/H1-D-Entscheide vom 22.10.2026 sowie akzeptierte H3-Integration sind unverändert historisch gebunden. Die heutige unabhängige Norm-/Fassungs- und tatsächliche Neuverwendungsprüfung tritt hinzu. Die akzeptierte Auslegung wird nicht als heute neu gefundene direkte Praxis oder als bereits erteilte R10-Quellenreleasefreigabe ausgegeben.'},
    remainingBoundaries:limits,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,productChanges:false,registerChanges:false
  });
}
const visualEvidence=[];
for(const [name,id,page,scope]of [
  ['GOG-p11','SRC-AP23H1-OW-GOG-20220401',11,'Art. 28 Abs. 1–3 und aufgehobene Art. 29–31'],
  ['RTG-p1','SRC-AP23H1-OW-RTG-20090801',1,'Art. 2 Abs. 1–2, kantonsweiter Kern und lokale Delegation'],
  ['STVG2025-p16','SRC-AP23H1-OW-STVG-20250101',16,'Art. 64–65, spezielle Fristenverweisung und elektronische Rechtsverkehrsermächtigung'],
  ['STVG2025-p17','SRC-AP23H1-OW-STVG-20250101',17,'Art. 67–68, zwanzig Tage und administrative vorsorgliche Massnahmen'],
  ['STVG2027-p16','SRC-AP23H1-OW-STVG-20270101',16,'Publizierte Folgefassung, Art. 64 und 67 Abs. 1'],
  ['VGV-p3','SRC-AP23H1-OW-VGV-20110101',3,'Art. 8–9, Zulässigkeit, Sozialvorbehalt, dreissig Tage'],
  ['VGV-p4','SRC-AP23H1-OW-VGV-20110101',4,'Art. 10 und 12, konkret angeordneter Schriftenwechsel und fünf Tage an Gesamtgericht'],
  ['VGV-p5','SRC-AP23H1-OW-VGV-20110101',5,'Art. 14 Abs. 4 und 15, BGG-112-Anforderung und ZPO-Verweisung'],
  ['VWVV-p5','SRC-AP23H1-OW-VWVV-20200101',5,'Art. 11 Abs. 2a, administrative BGG-112-Verweisung'],
  ['VWVV-p11','SRC-AP23H1-OW-VWVV-20200101',11,'Art. 27, ausdrücklich subsidiäre sinngemässe VwVG-Verweisung'],
  ['Nachtrag-p1','SRC-AP23H1-OW-STVG-20270101',1,'Vollständiger Änderungsteil Art. 51–53 und 71a'],
  ['Nachtrag-p2','SRC-AP23H1-OW-STVG-20270101',2,'Keine Fremdänderungen, Inkrafttreten 01.01.2027 und abgelaufene Referendumsfrist']
])visualEvidence.push({...await bind(base+'/'+name+'.png'),sourceId:id,physicalPage:page,scope,actuallyVisuallyRead:true});

const baselineReportPath='outputs/r10-a2-2026-10-28/baseline-federal/review.json';
const baseline=await json(baselineReportPath),vwvgRow=baseline.sourceRows.find(r=>r.sourceId==='SRC-VWVG-20220701');
const report={
  workPackage:'R10-A2',ownerLotId:'R10-A2-AP23H1',partition:'ow-six-sources',checkedOn:'2026-10-28',
  recordStatus:'reviewed-awaiting-cross-lane-companions-common-report-and-human-acceptance',sourceCount:6,actualUseCount:126,newUseCount:126,
  inputInventory:await bind(invPath),candidateAdministrativeDocument:await bind(productPath),acceptedH3AdministrativeDocument:await bind(acceptedPath),
  retrievalEvidence:await bind(base+'/retrievals.json'),contentEvidence:await bind(contentPath),
  originalAcceptedDocuments:await Promise.all(['docs/fachrecht/ap23h1/recherche-ow.md','docs/fachrecht/ap23h1/befund-ow.json','docs/fachrecht/quellenpruefung-ap23h1.md','docs/fachrecht/abnahme-ap23h1.md','docs/fachrecht/abnahme-ap23h3.md'].map(bind)),
  counts:{uniquePrimaryTargets:17,newSuccessfulRetrievals:11,individuallyQualifiedSameDayReuse:6,completeOriginalH1PdfComparisons:6,completeOriginalH1MetadataComparisons:5,completeOriginalAmendmentComparisons:1,accessGaps:0,positivelyAssessedOWPaths:7,exactlyPreservedH3PathsAndQualificationPolicies:7,actuallyVisuallyReadPdfPages:12},
  sameDayPhysicalReuse:[
    {nativeSourceId:'SRC-AP23H1-OW-RTG-20090801',sameInstrument:'GDB 975.2',language:'de',versionId:103,scope:'Vollständiger heutiger amtlicher Norm- und Fassungsindex aus Los 3. Die neue administrative Verwendung und der lokale Vorbehalt werden hier eigenständig geprüft.',evidence:meta('975.2').evidence,report:await bind('outputs/r10-a2-2026-10-28/catalog-central/review.json')},
    {nativeSourceId:'SRC-AP23H1-OW-VWVV-20200101',companionInstrument:'SR 172.021',language:'de',versions:['2022-07-01','2027-01-01'],scope:'Nur subsidiäre Art.-27-Begleitung im neu gelesenen OW-Verweisungskontext. Die heutige Bundesprüfung mit unbeschränktem Zukunftsindex ist ausdrücklich zugeordnet, keine URL-Aliasbildung oder neue native Quellenrolle.',report:await bind(baselineReportPath),nativeBaselinePointer:'/sourceRows/'+baseline.sourceRows.indexOf(vwvgRow),familyPointer:vwvgRow.currentFamilyAssessmentPointer}
  ],
  subsidiaryVwvgCompanion:{nativeOwSourceId:'SRC-AP23H1-OW-VWVV-20200101',owReferenceArticle:'Art. 27',officialVersions:vwvgRow.versionFinding,extracts:subsidiary,conclusion:'Zeitmechanik in den relevanten aktuellen/publizierten Zukunftsbestimmungen materiell gleich. 2027 ändern IGE-Benennung und Fundstellenhinweise, nicht der konkrete allgemeine Zeitmechanismus. Die spezielle OW-Kette bleibt vorrangig, kein importierter Partei-/Vertretungsort. Der vollständig gelesene Textbericht ergänzt im ersten Rohtextextrakt fehlende Buchstaben-eIds art_21_a und art_22_a, ohne den ursprünglichen Extrakt zu überschreiben.'},
  pathUseAssessments,
  proceduralCalendarAssessment:{calendar:await bind(calendarPath),physicalSupplementRuleCount:4,baseNamedOriginCount:13,totalNamedOriginsIncludingSundayOnly:17,potentialWeekdayDatePatterns:14,threeAlreadySundayOnlyOrigins:['Ostersonntag','Pfingstsonntag','Eidgenössischer Bettag'],supplementalCalculations:expectedExtras,bindingPointers:holidays.map(b=>'/holidayBindings/'+product.holidayBindings.indexOf(b)),sourceLawMapping:'RTG Art. 2 Abs. 1 trägt den bekannten Kern, GOG Art. 28 Abs. 2 die vier Ergänzungen. Der Bund-/OW-Doppelnachweis des 1. August erzeugt keinen zusätzlichen Tag. Gerichtliche unmittelbare Geltung und administrative H1-D-Übertragung sind ausdrücklich getrennt.',currentBindings:holidays.map(b=>({holidayBindingId:b.holidayBindingId,authorityLevel:b.authorityLevel,anchor:b.anchor,interpretation:b.projectionEvidence.legalInterpretation,roleUnion:b.legalBinding.roleUnion,partyOrRepresentativeRequired:b.legalBinding.partyOrRepresentativeRequired})),localBoundary:'RTG Art. 2 Abs. 2 und konkret möglicher ungeklärter örtlicher Endtag bleiben qualifiziert. Keine pauschale Gemeindetagsvereinigung oder globale Sperre. Keine Änderung der bestehenden allgemeinen OW-Bundesprofilkalender.'},
  visualEvidence,rows,
  normCompanionForNativeH1FederalSources:{sourceIds:['SRC-AP23H1-CH-ZPO-20260701','SRC-AP23H1-CH-BGG-20260401'],owPointers:rows.map((r,i)=>({sourceId:r.sourceId,rowPointer:'/rows/'+i,relevantProvisions:r.relevantProvisions})),specialChain:'StVG Art. 64 → VGV Art. 15 → sinngemässe ZPO-Fristen, soweit nicht speziell abweichend. VwVV Art. 27 ist nur subsidiär.',limitedBggReference:'VwVV Art. 11 Abs. 2a und VGV Art. 14 Abs. 4 → BGG Art. 112 Abs. 2, dreissig Tage an dieselbe ausstellende Stelle. H1-B bestätigt kantonalen Rahmen, nicht globale BGG-Anknüpfung.',limitedFiveDayException:'VGV Art. 12 Abs. 3 plus VGV Art. 15 und akzeptierte H1-C-Auslegung, Ferienfreiheit aus begrenzter Massnahmenanalogie ZPO Art. 145 Abs. 2 Bst. b, nicht allein aus kurzer Frist.'},
  remainingDependencies:['Getrennter Abschluss der nativen H1-BGG-/ZPO-Zeilen durch die andere Lane. Bundesinhalte und kantonale Anwendbarkeit bleiben unabhängig geprüft und werden am Losabschluss verbunden.','Gemeinsamer R10-Bericht und menschliche Quellenabnahme. Dieser technische Teilabschluss erteilt keine Quellenreleasefreigabe.'],
  remainingLimits:limits,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,productChanges:false,registerChanges:false,operatingChanges:false
};

validateSourcePartition(inv,[report]);
const verified=await verifyDescriptors(root,collectDescriptors(report));
await fs.writeFile(path.join(root,base+'/review.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({ok:true,report:await bind(base+'/review.json'),rows:6,referenceLocations:126,newReferenceLocations:126,verifiedBindings:verified.length},null,2));
