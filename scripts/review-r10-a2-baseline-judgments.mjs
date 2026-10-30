// SPDX-License-Identifier: AGPL-3.0-only
// R10-A2: fresh reading of identified historical judgment mirrors, not new law.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const BASE='outputs/r10-a2-2026-10-28/baseline-judgments';
const INVENTORY='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const INVENTORY_SHA='e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6';
const CANDIDATE='data/candidates/2026-10-28-ap23m3';
const DAY='2026-10-28';
const H=bytes=>createHash('sha256').update(bytes).digest('hex');
const JSON_BYTES=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const records=[
 {sourceId:'JUD-AP17C-BGER-8C-767-2008-20090112',date:'2009-01-12',docket:'8C_767/2008',sections:[['4.3.1','4.3.2'],['4.3.2','5.']],
  usedAssertions:['Die Nachfrist zur Behebung formeller Beschwerdemängel einschliesslich fehlender Vertretungsvollmacht fällt in den erweiterten Beschwerdezusammenhang von Art. 60 Abs. 2 und Art. 61 Bst. b ATSG.','Allgemeine weitere gerichtliche Fristen werden durch den Entscheid gerade nicht abschliessend dem ATSG-Fristenregime unterstellt.'],
  usageFinding:'Die 22 positiven beziehungsweise gemeinsam verwendeten Stellen betreffen ausschliesslich qualifizierte Beschwerdeverbesserungsnachfristen der elf bereits modellierten Sozialversicherungszweige. Drei Ausschlussstellen erhalten die Abgrenzung anderer gerichtlicher Fristen. Kein neuer erlassspezifischer Entscheid und keine ausserbernische Sozialfreigabe werden behauptet.',
  boundaries:['Nur formelle Beschwerdeverbesserung. Nicht jede Instruktionsfrist ist erfasst.','Die Übertragung der allgemeinen ATSG-Aussage auf die elf Spezialerlasse setzt deren separat geprüfte ATSG-Anwendung voraus.','Die bereits gebundenen Sozialfenster 2026–2027 und BE-Anbindungen bleiben unverändert.'],
  normCompanions:['SRC-AP17C-ATSG-20240101','SRC-AP17C-IVG-20260101','SRC-AP17C-AHVG-20260101','SRC-AP17C-UVG-20260101','SRC-AP19C-ELG-20260101','SRC-AP19C2-AVIG-20260101','SRC-AP19C3-KVG-20260101','SRC-AP20C1-EOG-20250128','SRC-AP20C2-FAMZG-20260101','SRC-AP20C2-FLG-20240101','SRC-AP20C3-MVG-20240101','SRC-AP20C3-UELG-20250101']},
 {sourceId:'JUD-AP17C-VGER-BE-100-2024-8-20240404',date:'2024-04-04',docket:'100.2024.8',sections:[['1.1','1.2'],['2.','3.']],
  usedAssertions:['E. 1.1 unterstellt Form und Frist des Weiterzugs an das Verwaltungsgericht Art. 56 Abs. 1 IVöB.','E. 2 bestätigt den Beitritt Berns per 01.02.2022, den vorbehaltenen zweistufigen Instanzenzug und die Anwendung auf danach eingeleitete Vergabeverfahren.'],
  usageFinding:'Alle drei Stellen begründen denselben qualifizierten 20-Tage-Weiterzug bei seit 01.02.2022 eingeleiteter Beschaffung. Die konkrete Dauer folgt der separat amtlich geprüften IVöB-Norm, der historische Entscheid bestätigt deren Verwendung im bernischen Weiterzug.',
  boundaries:['Kein allgemeiner Nachweis für ältere Vergabeverfahren oder nicht modellierte Beschaffungskonstellationen.','Die amtlichen geltenden IVöB-, Beitritts- und Ausführungsnormen sind separat zu prüfen.'],
  normCompanions:['SRC-AP17C-IVOEB-20220201','SRC-AP17C-IVOEBG-20220201','SRC-AP17C-IVOEBV-20240901','SRC-AP17C-VRPG-BE-20260901','SRC-AP17C-FRG-BE-20210401']},
 {sourceId:'JUD-AP17C-VGER-BE-200-2017-814-20180117',date:'2018-01-17',docket:'200 2017 814',bodyDocket:'200 17 814',sections:[['1.2','1.3']],
  usedAssertions:['Der Stillstand nach Art. 38 Abs. 4 in Verbindung mit Art. 60 Abs. 2 ATSG ist auf nach Tagen oder Monaten bestimmte Fristen beschränkt.','Die im Entscheid bis zum festen 18.12.2017 erstreckte Replikfrist unterlag deshalb keinem Stillstand.'],
  usageFinding:'Die drei ausschliessenden Stellen belassen andere gerichtliche Fristen ausserhalb des positiven Modells. Daraus wird weder eine neue berechenbare Fixterminfunktion noch eine negative Aussage über sämtliche gerichtlichen Tagesfristen gewonnen.',
  boundaries:['Historische Randbemerkung zu einem festen Erstreckungstermin. Keine pauschale Freigabe aller Instruktionsfristen.'],
  normCompanions:['SRC-AP17C-ATSG-20240101']},
 {sourceId:'JUD-BE-VG-100-2016-347',date:'2017-06-29',docket:'100.2016.347',sections:[['3.2','3.3'],['3.3','3.4'],['3.4','3.5'],['4.5','4.6']],
  usedAssertions:['Art. 67a Abs. 3 VRPG verlangt die gesonderte Anfechtung einer Vorbereitungshandlung, wenn die Zehntagesfrist nicht erst nach dem Wahl- oder Abstimmungstermin endet.','Der Fristbeginn folgt der rechtserheblichen Eröffnung oder Veröffentlichung, nicht einem beliebig gewählten Kenntnisdatum.','E. 4.5 überträgt die Vorher-/Nachher-Unterscheidung auf den damaligen Weiterzug nach Art. 81 Abs. 2 VRPG.'],
  usageFinding:'Die drei tatsächlichen Stellen stützen den bestehenden Zehntagespfad und das Gate G1_PREP_ACT mit der normgetreuen Bedingung finalDeadline <= pollDate. E. 4.5 wird als historischer Kontext mitgeführt, nicht zur Aktivierung eines neuen Pfads verwendet.',
  boundaries:['Eröffnung und Abstimmungstermin müssen rechtlich qualifiziert sein.','Keine Berechnung materieller Abstimmungsfehler oder Erweiterung des kommunalrechtlichen Produktumfangs.'],
  normCompanions:['SRC-VRPG-BE-20230801','SRC-AP17C-VRPG-BE-20260901']},
 {sourceId:'JUD-BE-VG-100-2017-270',date:'2017-12-12',docket:'100.2017.270',sections:[['4.1','4.2'],['4.3','5.'],['5.2','5.3']],
  usedAssertions:['Der französischsprachige Entscheid bestätigt die zehn Tage gegen Vorbereitungshandlungen und den Beginn am Tag nach Eröffnung oder Veröffentlichung.','Die Anfechtungspflicht hängt am Ablauf der Frist vor beziehungsweise nicht erst nach dem Abstimmungstag. Der Beginn der brieflichen Stimmabgabe ersetzt den Abstimmungstermin nicht.'],
  usageFinding:'Die einzige tatsächliche Stelle gehört zum bestehenden G1_PREP_ACT. Das gelesene Urteil bestätigt dessen bisherige Bedingung und die Eröffnungsqualifikation, ohne neue Frist oder neuen Verfahrenspfad.',
  boundaries:['Kein freies Abstellen auf individuell frühere oder spätere Kenntnisnahme.','Die aktuelle Normfassung bleibt ein separater amtlicher Begleitnachweis.'],
  normCompanions:['SRC-VRPG-BE-20230801','SRC-AP17C-VRPG-BE-20260901']},
 {sourceId:'JUD-BE-VG-100-2021-189',date:'2021-10-22',docket:'100.2021.189',sections:[['4.1','4.2'],['4.2','5.']],
  usedAssertions:['Bei Abstimmungsbotschaften zählt die offizielle Publikation oder Zustellung als fristauslösendes Ereignis, unabhängig von individuell früherer oder späterer Kenntnis.','Ohne eigentliche förmliche Eröffnung oder Veröffentlichung gilt subsidiär die tatsächliche beziehungsweise mögliche und zumutbare Kenntnisnahme im Einzelfall.'],
  usageFinding:'Die zwei Stellen gehören zum bisherigen Vorbereitungshandlungsregime und Gate. Sie verlangen qualifizierte Angaben zur Eröffnung und ersetzen die Rechtsprüfung nicht durch ein blosses Empfangsdatum.',
  boundaries:['Die subsidiäre Kenntnisanknüpfung ist keine automatische Tatsachenfeststellung durch die App.'],
  normCompanions:['SRC-VRPG-BE-20230801','SRC-AP17C-VRPG-BE-20260901']},
 {sourceId:'JUD-BE-VG-200-2026-421',date:'2026-06-26',docket:'200 2026 421',sections:[['4.','5.'],['6.','7.']],
  usedAssertions:['Für das konkrete kantonal-bernische Verfahren gelten nach Art. 41 Abs. 2 VRPG die bundesrechtlich und im Kanton Bern anerkannten Feiertage.','Fronleichnam am Freiburger Wohnort verschob die bernische Rechtsmittelfrist nicht. Bei Empfang am 05.05.2026 endete sie am 04.06.2026.'],
  usageFinding:'Die einzige Stelle stützt VRPGBE-HOL-001 im allgemeinen bernischen Profil. Der entschiedene Fall betrifft kantonale Sozialhilfe und wird nicht als ATSG-Fall oder als Beleg gegen die eigenständige ATSG-Partei-/Vertretungsanknüpfung verwendet.',
  boundaries:['Nur die bernische kantonale Verfahrensanknüpfung. Kein schweizweiter Satz gegen ausdrücklich abweichendes Spezialrecht.'],
  normCompanions:['SRC-VRPG-BE-20230801','SRC-FRG-BE-20210401','SRC-AP17C-VRPG-BE-20260901','SRC-AP17C-FRG-BE-20210401']},
 {sourceId:'JUD-BGER-1C-275-2009',date:'2009-10-01',docket:'1C_275/2009',sections:[['3.3.2','4.']],
  usedAssertions:['E. 3.3.2 rechnet die behördliche Zehntagesfrist ab dem Tag nach dem Eingangsereignis.','Bei Samstag und anschliessendem Pfingstmontag verlängert sich der Ablauf bis Dienstag, 02.06.2009.'],
  usageFinding:'Die zwei tatsächlichen Stellen beim behördlichen BPR-Entscheid verwenden nur den allgemeinen Beginn-/Endverschiebungsbefund. Die historische Erwägung nennt Art. 77 Abs. 1 BPR. Die heutige Produktbindung an Art. 79 Abs. 1 benötigt den getrennten amtlichen Normabgleich, nicht eine Umnummerierung des Urteils.',
  boundaries:['Historischer Fristberechnungsbeleg, keine aktuelle Fassung des BPR.','Keine positive Aktivierung einer bislang nicht angebotenen Behördenfrist allein aus dem Urteil.'],
  normCompanions:['SRC-BPR-20221023']},
 {sourceId:'JUD-BGER-8C-620-2007',date:'2008-06-09',docket:'8C_620/2007',sections:[['3.3','3.4'],['3.4','4.']],
  usedAssertions:['Art. 41 Abs. 3 VRPG ist ein unechter, deklaratorischer Bundesrechtsvorbehalt ohne selbständigen Regelungsgehalt.','Die vor dem 01.01.2008 beurteilte ATSG-Übergangslage ist historisch und kein Nachweis einer heutigen Nichtanwendung des ATSG-Stillstands.'],
  usageFinding:'Die einzige Stelle gehört zum allgemeinen VRPG-Regime und bleibt auf den Vorbehaltscharakter begrenzt. Aktuelle Sozialfristen folgen den separat geprüften Normketten.',
  boundaries:['Der Übergangsfall von 2007 wird nicht in den aktuellen Zeitraum übertragen.'],
  normCompanions:['SRC-VRPG-BE-20230801','SRC-AP17C-VRPG-BE-20260901','SRC-AP17C-ATSG-20240101']},
 {sourceId:'JUD-BGER-9C-757-2007',date:'2008-01-03',docket:'9C_757/2007',sections:[['3.','4.']],
  usedAssertions:['Art. 41 Abs. 3 VRPG übernimmt deklaratorisch den Vorrang des Bundesrechts und hat keinen zusätzlichen eigenen Regelungsgehalt.','Die verneinte vorzeitige Anpassung an das ATSG betrifft die damalige Übergangslage 2007, nicht die aktuell modellierten Sozialverfahren.'],
  usageFinding:'Die einzige Stelle stützt unverändert den deklaratorischen Charakter im allgemeinen VRPG-Regime. Daraus wird keine heutige Ausschaltung des ATSG abgeleitet.',
  boundaries:['Keine selbständige aktuelle Stillstandsaussage aus dem historischen Übergangsfall.'],
  normCompanions:['SRC-VRPG-BE-20230801','SRC-AP17C-VRPG-BE-20260901','SRC-AP17C-ATSG-20240101']}
];

function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!path.includes('\\')&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe path');return path;}
async function bytes(path){safe(path);let p=ROOT;assert.equal((await lstat(ROOT)).isSymbolicLink(),false);for(const bit of path.split('/')){p=resolve(p,bit);assert.equal((await lstat(p)).isSymbolicLink(),false,path);}return readFile(p);}
async function binding(path,expected){const b=await bytes(path);const d={path,byteLength:b.length,sha256:H(b)};if(expected){assert.equal(d.sha256,expected.sha256,path);if(expected.byteLength!==undefined)assert.equal(d.byteLength,expected.byteLength,path);}return d;}
function ptr(root,p){return p.split('/').slice(1).reduce((a,k)=>a[k.replaceAll('~1','/').replaceAll('~0','~')],root);}
function heading(text,section){const s=section.replaceAll('.','\\.');const m=new RegExp('(?:^|\\n)\\s*'+s+'(?=\\s|$)','u').exec(text);assert.ok(m,'Missing pinpoint '+section);return m.index;}
function excerpt(text,start,end){const from=heading(text,start);const to=heading(text.slice(from+1),end)+from+1;assert.ok(to>from);return{text:text.slice(from,to).trim(),characterStart:from,characterEndExclusive:to};}

export async function buildReview(){
 const invBytes=await bytes(INVENTORY);assert.equal(H(invBytes),INVENTORY_SHA);const inv=JSON.parse(invBytes);const partition=inv.rows.filter(r=>r.ownerLotId==='R10-A2-BASELINE'&&r.sourceId.startsWith('JUD'));
 assert.deepEqual(records.map(r=>r.sourceId).sort(),partition.map(r=>r.sourceId).sort());
 const evidence=new Map([[INVENTORY,await binding(INVENTORY)]]),rowResults=[],excerptRows=[],cache=new Map();
 for(const item of records){
  const source=partition.find(r=>r.sourceId===item.sourceId);assert.deepEqual(source.referenceLocations,source.priorReferenceLocations,item.sourceId);assert.equal(source.newReferenceLocations.length,0);assert.equal(source.newUseOfPreviouslyReviewedSource,false);
  for(const d of [source.historicalAssessment.review,source.historicalAssessment.humanApproval,...source.historicalAssessment.evidence])evidence.set(d.path,await binding(d.path,d));
  const path=BASE+'/raw/'+item.sourceId+'.mcp.json',rawBytes=await bytes(path),raw=JSON.parse(rawBytes);assert.equal(raw.id,item.sourceId);assert.equal(raw.result.isError,false);assert.match(raw.fetchedAt,/^2026-10-28T/u);
  const d=raw.result.structuredContent,body=d.full_text??d.result?.text;assert.equal(typeof body,'string');assert.ok(body.length>6000);const meta=d.result??d;
  assert.equal(meta.decision_date,item.date,item.sourceId);assert.ok(body.includes(item.docket)||body.includes(item.docket.replaceAll('.',' '))||body.includes(item.docket.replace('_',' '))||(item.bodyDocket&&body.includes(item.bodyDocket)),item.docket);
  const rawBinding=await binding(path);evidence.set(path,rawBinding);
  excerptRows.push({sourceId:item.sourceId,classification:'fresh-nonofficial-identified-court-text-mirror',service:raw.service,retrievedAt:raw.fetchedAt,rawBinding,sections:item.sections.map(([a,b])=>({pinpoint:a,...excerpt(body,a,b)}))});
  const actualUses=[];
  for(const location of source.referenceLocations){const[file,p]=location.split('#');if(!cache.has(file)){cache.set(file,JSON.parse(await bytes(CANDIDATE+'/'+file)));evidence.set(CANDIDATE+'/'+file,await binding(CANDIDATE+'/'+file));}const document=cache.get(file),ref=ptr(document,p);assert.equal(ref.sourceId??ref,item.sourceId,location);const parentPointer=p.replace(/\/(?:sourceRefs|normBindings)\/\d+$/u,'');const parent=ptr(document,parentPointer);actualUses.push({location,parentPointer,parentId:parent.ruleId??parent.regimeId??parent.deadlineDefinitionId??parent.gateId??parent.exclusionId??null,locator:ref.locator??null,role:p.startsWith('/excludedPaths/')?'exclusion':'positive-or-shared',assessment:'covered-within-unchanged-bounded-assertion'});}
  rowResults.push({sourceId:item.sourceId,ownerLotId:'R10-A2-BASELINE',reviewLane:'baseline-judgments',currentReviewDate:DAY,outcome:'historical-assertion-confirmed-pending-companion-norm-closure',method:'fresh-mcp-mirror-pinpoint-reading-and-bounded-reuse-of-accepted-interpretation',sourceClassification:'nonofficial-identified-court-text-mirror-not-fresh-official-publication',freshContentRead:true,exclusivelyReusedWithoutFreshRead:false,decisionDate:item.date,usedAssertions:item.usedAssertions,usageFinding:item.usageFinding,referenceLocations:source.referenceLocations,actualUseAssessments:actualUses,newUsesAssessment:{newUses:0,priorReferenceGraphUnchanged:true,conclusion:'No new judgment uses, no scope extension.'},originalAssessment:{...source.historicalAssessment,originalDatePreserved:true},freshEvidence:[rawBinding],reuseRationale:'Der identifizierte historische Entscheid und die konkret gelesenen Erwägungen bestätigen die eng begrenzte bisherige Aussage. Alle '+source.referenceLocations.length+' tatsächlichen Referenzstellen sind gegenüber MVP09 identisch. Die frühere Auslegung wird nicht neu datiert. Die aktuelle Normanwendung bleibt ausdrücklich vom gesonderten amtlichen Begleitabgleich abhängig.',versionAssessment:{kind:'fixed-historical-decision-not-a-consolidating-statute',judgmentIdentityAndDateConfirmed:true,newerCaseLawSearch:'No new or exhaustive search for subsequent judgments or doctrinal developments.'},normCompanionAssessment:{status:'pending-separate-official-statute-review',sourceIds:item.normCompanions,normReviewEvidence:[]},remainingBoundaries:item.boundaries,productRuleChangeRequired:false,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false});
 }
 assert.equal(rowResults.length,10);assert.equal(rowResults.reduce((n,r)=>n+r.referenceLocations.length,0),42);
 const excerpts={kind:'r10-a2-baseline-judgment-pinpoints',preparedOn:DAY,sourceClassification:'nonofficial-mirror',freshFullTexts:10,exhaustiveCaseLawSearch:false,rows:excerptRows};
 return{excerpts,review:{reviewId:'R10-A2-BASELINE-JUDGMENTS-20261028',workPackage:'R10-A2',lotId:'R10-A2-BASELINE',currentReviewDate:DAY,recordStatus:'content-reviewed-awaiting-current-companion-norm-closure',humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false,registerChanges:false,operatingChanges:false,counts:{canonicalSources:10,freshMcpFullTextResponses:10,freshOfficialPublicationResponses:0,actualReferenceLocations:42,newReferenceLocations:0,exclusivelyHistoricalReuseWithoutFreshReading:0,pendingCompanionNormClosures:10},scope:'Only ten identified historical judgments and their unchanged 42 graph locations. No exhaustive new case-law search and no extension of positive procedural coverage.',rows:rowResults,evidenceBindings:[...evidence.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))}};
}
export async function run({write=false}={}){const {review,excerpts}=await buildReview();for(const[name,value]of[['pinpoint-readings.json',excerpts],['review.json',review]]){const target=BASE+'/'+name,wanted=JSON_BYTES(value);if(write){await mkdir(dirname(resolve(ROOT,target)),{recursive:true});try{await writeFile(resolve(ROOT,target),wanted,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;assert.deepEqual(await bytes(target),wanted,'Existing report differs, do not overwrite');}}else assert.deepEqual(await bytes(target),wanted,target);}return{status:write?'judgment-review-written':'judgment-review-reverified',sources:10,referenceLocations:42,allHistoricalBindingsVerified:true,companionNormClosure:'pending',humanApproval:false,sourceReleaseApproved:false};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await run({write:process.argv[2]==='--write'}),null,2));}
