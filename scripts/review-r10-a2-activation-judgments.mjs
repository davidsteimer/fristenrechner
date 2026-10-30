// SPDX-License-Identifier: AGPL-3.0-only
// Individual bounded reuse of 27 canonical IDs representing 18 historical cases.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const BASE='outputs/r10-a2-2026-10-28/activation-judgments';
const INV='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const R07='outputs/release-mvp07-2026-10-08/sources/activation-review.json';
const CATALOG='data/candidates/2026-10-28-ap23m3/holiday-catalogs/ch-holiday-catalog.json';
const H=b=>createHash('sha256').update(b).digest('hex');
const enc=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
const N={bgg:'SRC-AP22CLOSE-BUND-BGG',stpo:'SRC-AP22CLOSE-BUND-STPO',zpo:'SRC-AP22CLOSE-BUND-ZPO',vwvg:'SRC-AP22CLOSE-BUND-VWVG',eufr:'SRC-AP22CLOSE-BUND-EUFR',bbl2025:'SRC-AP22CLOSE-BUND-BBL2025'};
const CONFIG={
 '4A434':{identity:['4A_434/2023','5 septembre 2024'],lines:[[172,177]],norms:[N.bgg],
 assertion:'Bei Zustellvertretung mit Zustellungsdomizil GE ist deren Ort massgebend, nicht zusätzlich der Parteiort SH. Der historische Genfer Bettag verschob den 07.09.2023 auf 08.09.2023.',
 boundary:'Nur ergänzender historischer Rollenbeleg ohne heutige Graphreferenz. Kein allgemeines Wahlrecht und keine freie Kalendervereinigung.'},
 '4A538':{identity:['4A_538/2023','3. Januar 2024'],lines:[[106,121]],norms:[N.bgg,N.zpo,'SRC-AP22-AG-ZPO','SRC-AP22CLOSE-AG-ZPO'],
 assertion:'Das historische Nichteintreten wegen vermeintlichen Ablaufs am 01.11.2023 ist durch 2E_8/2024 E. 6.5 ausdrücklich als fehlerhaft geklärt. Es bleibt nur als korrigierter Gegenbeleg in der Herkunftskette.',
 boundary:'Strukturelle Referenz im AG-ZPO-Binding ist keine positive Autorität für den alten falschen Sollwert. Aktuell massgebend ist die eigene kantonale Prozessliste, nicht die arbeitsrechtliche Regionalreduktion.',historicalCounterexample:true,courtCompanions:['SRC-AP22CLOSE-BGER-2E8']},
 '7B561':{identity:['7B_561/2025','1 juillet 2025'],identityAlternatives:[['1 juillet 2025','1er juillet 2025','01.07.2025']],lines:[[118,123]],norms:[N.bgg],
 assertion:'Bei Zustellvertretung VD verlängert Fronleichnam am anonymisierten Parteiort die BGG-Frist nicht zusätzlich. Der historische Ablauf blieb 19.06.2025.',
 boundary:'Der anonymisierte Parteiort wird keinem erfundenen Kanton zugewiesen. Ergänzender historischer Rollenbeleg, kein heutiger positiver Fallpfad.'},
 '9C396':{identity:['9C_396/2018','20 décembre 2018'],lines:[[106,123]],norms:[N.bgg,N.vwvg,N.eufr,'SRC-AP22CLOSE-NE-LPA','SRC-AP22CLOSE-NE-RDF'],
 assertion:'Die damalige LPJA-NE stellte mindestens halbtägige gesetzlich erfasste Verwaltungsschliessungen gleich. Deshalb verschob Pfingstmontag 21.05.2018 das Ende auf 22.05.2018. Die heutige Normbasis wird getrennt an LPA/RDF gebunden.',
 boundary:'Kein stiller Transfer der alten LPJA in 2026–2027. Die ergänzende Formalismusbegründung erzeugt keinen allgemeinen Schliesskalender. NE-Jahres-/Lokalvorbehalt bleibt erhalten.'},
 'BGE115':{identity:['115 IV 266','22. November 1989'],lines:[[58,65],[78,79]],norms:[N.stpo,'SRC-AP22CLOSE-PROC-LU-JUSG'],
 assertion:'Historischer OG-Entscheid: Das Luzerner Patrozinium war nach der damaligen Änderung nicht mehr durch die massgebende kantonale Grundlage anerkannt. Bloss örtliche Übung genügte nicht.',
 boundary:'Kein universelles Verbot kantonalrechtlich delegierter örtlicher Feiertage. Die heutige StPO-Übertragung wird durch 7B_32/2023 und die aktuellen Normbegleiter begrenzt.',courtCompanions:['SRC-AP22CLOSE-BUND-7B32']},
 'BGE124':{identity:['124 II 527','11 juin 1998'],lines:[[72,79]],norms:[N.eufr,N.bgg,N.vwvg,N.zpo,N.stpo,'SRC-AP22CLOSE-FR-JG'],
 assertion:'Art. 5 EuFrÜb ist unmittelbar anwendbar. Im damaligen Freiburger Fall war Pfingstmontag gesetzlich gleichgestellt, weshalb die Frist bis 20.05.1997 lief. Das Anerkennungsprinzip bestätigt keine unveränderte heutige Feiertagsliste.',
 boundary:'EuFrÜb erfasst kein Strafverfahren. FR/StPO benötigt den eigenständigen aktuellen JG-/StPO-Nachweis. Übertragung auf SO ist ausdrücklich Norminferenz mit eigener heutiger Prozessliste, kein direkter SO-Entscheid.'},
 'FR-PRAXIS':{identity:['101 2012-89','25 avril 2012'],lines:[[1,12],[63,87]],norms:[N.zpo,'SRC-AP22CLOSE-FR-JG'],
 assertion:'Der historische vollständige Spiegel nennt Art. 142 Abs. 3 und Art. 145 ZPO sowie Art. 121 Abs. 2 JG. Die auffällige Formulierung mardi 9 avril 2012 wird nicht als datierter Sollwert übernommen.',
 boundary:'Unvollständiger amtlicher Original-/Identitätsnachweis bleibt offen. Ergänzender gekennzeichneter Spiegel ohne aktuelle Graphverwendung und ohne eigenständige positive Fallfreigabe. Aktuelle FR-Norm ist davon getrennt zu bestätigen.',unclear:true},
 '2E8':{identity:['2E_8/2024','13. Februar 2026'],lines:[[170,187]],norms:[N.bgg,N.eufr,'SRC-AP22CLOSE-AG-ZPO'],
 assertion:'E. 6.5 bezeichnet die alte Fristberechnung von 4A_538/2023 als fehlerhaft. Allerheiligen in Lenzburg ist aufgrund § 21 EG ZPO/AG auch unter Art. 45 BGG zu berücksichtigen. Die Haftungsabweisung macht die alte Rechnung nicht richtig.',
 boundary:'Die 17 Transferstellen sind begründete Inferenz auf jeweils eigenständig geprüfte Prozesslisten, kein Direktentscheid für jeden Kanton und jedes Verfahren. SG-/SH-Januargrenzen bleiben erhalten. Keine freie Vereinigung konkurrierender Listen.',courtCompanions:['SRC-AP22-4A538']},
 '7B32':{identity:['7B_32/2023','6 septembre 2023'],lines:[[122,149]],norms:[N.stpo],
 assertion:'Genfer Personalersatzurlaub und geschlossene Schalter am 02.01.2023 begründeten keinen anerkannten Feiertag nach Art. 90 StPO. Der Entscheid unterscheidet gesetzliche Anerkennung und konkrete Einreichungsmöglichkeiten.',
 boundary:'Keine negative Universalregel für den 2. Januar in allen Kantonen. Keine automatische Verwandlung von Personalruhetagen in Prozessfeiertage.'},
 'BB2020164':{identity:['BB.2020.164','9. Dezember 2020'],lines:[[218,239]],norms:[N.stpo],
 assertion:'Der historische StPO-Fall knüpft an das SG-Advokaturbüro an. Empfang 20.05.2020, zehn Tage, Wochenende und Pfingstmontag führten zum 02.06.2020.',
 boundary:'Ergänzender Rollenbeleg ohne aktuelle Graphverwendung. Kein universeller Entscheid zur Mehrortpriorität und keine heutige SG-Feiertagsneufreigabe.'},
 'D6953':{identity:['D-6953/2010','14 avril 2011'],lines:[[77,107]],norms:[N.vwvg,N.bbl2025],
 assertion:'Die historische günstigere Partei-/Vertretungsanknüpfung ist ausdrücklich auf nichtprofessionelle Vertretung begrenzt. Der historische BE-/katholische-FR-Fall lief bis 02.11.2010.',
 boundary:'Kein allgemeiner heutiger Vereinigungskalender. Professionelle Zustellvertretung bleibt getrennt. Besondere Asyl- oder Arbeitstagefristen werden nicht aktiviert.'},
 'D7710':{identity:['D-7710/2009','4. März 2010'],lines:[[197,232]],norms:[N.vwvg,N.bbl2025],
 assertion:'Der historische Entscheid formuliert eine kumulierte Partei-/Vertretungsanknüpfung. Dieser Gegenbefund wird nicht entfernt, sondern mit der späteren Nichtprofessionsgrenze und aktueller Rollenprüfung eingeordnet.',
 boundary:'Keine pauschale heutige Kumulation und keine Aktivierung besonderer Asyl-/Arbeitstagefristen. Spätere normative Rollenklärung bleibt eigenständig.',courtCompanions:['SRC-AP22CLOSE-BUND-D6953']},
 'F10031':{identity:['F-10031/2025','9 janvier 2026'],lines:[[169,244]],norms:[N.vwvg,N.bbl2025],
 assertion:'Der konkret während der Frist beendete Mandatsbezug wechselte von NE zum Parteiort GE. E. 1.11 würdigt die Schliessung im Einzelfall, nicht als wiederkehrende Feiertagsnorm.',
 boundary:'Ausschliesslich Rollen-/Wechselprinzip. Besondere Asylfrist von fünf Arbeitstagen bleibt ausserhalb des Rechners. Kein neuer Genfer Feiertag aus Einzelfallformalismus.'},
 'SG-NEG':{identity:['B 2023/3','19. Mai 2023'],lines:[[146,158]],norms:[N.stpo,N.bgg,N.vwvg,N.zpo,N.eufr],additionalNorms:['SG-RLG-2-and-PersV-59'],
 assertion:'Im VRP-/DBG-Fall 2023 war der 2. Januar trotz Personalruhetag, BJ-Verzeichnis und sachgemässer ZPO-Verweisung kein anerkannter Feiertag. Der Entscheid betrifft nicht unmittelbar StPO, BGG oder VwVG.',
 boundary:'Kein automatischer negativer Bundesprofilbeleg und keine behauptete Aufhebung von FS.2012.1. Die drei SG-Januargrenzen mit vollständigem Ergebnisvergleich nach DEC-2026-029 bleiben bestehen.',courtCompanions:['SRC-AP22CLOSE-PROC-SG-POS']},
 'SG-POS':{identity:['FS.2012.1','29. März 2012'],lines:[[76,85]],norms:[N.zpo,N.eufr,N.stpo,N.bgg,N.vwvg],additionalNorms:['SG-RLG-2-and-PersV-59'],
 assertion:'Der Entscheid vom 29.03.2012 anerkennt den 2. Januar für ZPO anhand EuFrÜb und damaliger Staatsdienstregelung. Das Datum der Vorinstanz 24.11.2011 ist nicht der Entscheidtag.',
 boundary:'Keine pauschale Übertragung auf die drei Bundesprofile und kein Verschweigen des SG-Verwaltungsgegenbefunds. Die beschlossene Unsicherheitsbehandlung bleibt unverändert.',courtCompanions:['SRC-AP22CLOSE-PROC-SG-NEG']},
 'SH':{identity:['OGE 40/2018/1/K','24. August 2018'],lines:[[6634,6729]],norms:[N.zpo,N.eufr,N.stpo,N.bgg,N.vwvg],additionalNorms:['SH-PersV-33'],
 assertion:'Der OGE anerkennt den 2. Januar direkt unter Art. 142 Abs. 3 ZPO unter Bezug auf EuFrÜb, Personalregelung und Behördenpraxis. Der aktuelle BGG-/VwVG-Transfer bleibt eine Norminferenz.',
 boundary:'Kein unmittelbarer StPO-Beleg. SH/StPO bleibt die vierte Januargrenze nach DEC-2026-029. Keine sichere Entscheidung allein aus einer Schliessliste.'},
 'STPO-LIMIT':{identity:['6B_730/2013','10. Dezember 2013'],lines:[[114,121]],norms:[N.stpo,N.eufr],
 assertion:'Geschlossene Schalter schaffen keinen gesetzlichen Feiertag. Das Bundesgericht schützt im konkreten Fall vor überspitztem Formalismus, wenn nachweisliche Einreichung in vernünftiger Distanz nicht möglich war.',
 boundary:'Keine wiederkehrende Schliesskalenderregel und keine eigenständige positive Feiertagsaktivierung. Einzelfallschutz bleibt erhalten, EuFrÜb wird nicht in StPO importiert.'},
 'VD-BGG':{identity:['1B_209/2014','30 juin 2014'],lines:[[104,105]],norms:[N.bgg,N.stpo,N.zpo,N.vwvg,'SRC-AP22CLOSE-PROC-VD'],
 assertion:'Die Erwägung bestätigt Art. 45 BGG zusammen mit Art. 47 Abs. 1 LEmp auch im strafrechtlichen BGG-Verfahren. Der heutige VD-Normbestand bleibt separat zu prüfen.',
 boundary:'Direktbeleg für BGG, nicht für eine selbständige Erweiterung des EuFrÜb auf StPO. Andere Profilbindungen bleiben ausdrücklich Anerkennungsinferenz.'}
};
function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!path.includes('\\')&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'));return path;}
async function bytes(path){safe(path);let p=ROOT;for(const item of path.split('/')){p=resolve(p,item);assert.equal((await lstat(p)).isSymbolicLink(),false,path);}return readFile(p);}
async function binding(path,expected){const b=await bytes(path),d={path,byteLength:b.length,sha256:H(b)};if(expected){assert.equal(d.sha256,expected.sha256,path);if(expected.byteLength!==undefined)assert.equal(d.byteLength,expected.byteLength,path);}return d;}
function ptr(root,p){return p.split('/').slice(1).reduce((a,k)=>a[k.replaceAll('~1','/').replaceAll('~0','~')],root);}
function compact(s){return s.normalize('NFC').replace(/\s+/gu,'').toLowerCase();}
async function save(path,b,write){if(write){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});try{await writeFile(resolve(ROOT,path),b,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;assert.deepEqual(await bytes(path),b);}}else assert.deepEqual(await bytes(path),b);}
export async function buildReview(){
 const inv=JSON.parse(await bytes(INV));assert.equal(H(await bytes(INV)),'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');const r07=JSON.parse(await bytes(R07)),copies=JSON.parse(await bytes(BASE+'/reading-copies.json')),catalog=JSON.parse(await bytes(CATALOG));
 const sources=inv.rows.filter(r=>r.ownerLotId==='R10-A2-CALENDAR-ACTIVATION'&&r.kind==='caseLaw');assert.equal(sources.length,27);assert.equal(copies.families.length,18);assert.equal(copies.newOnlineRetrievals,0);
 const bound=new Map();for(const p of [INV,R07,BASE+'/reading-copies.json',CATALOG])bound.set(p,await binding(p));for(const d of copies.evidenceBindings)bound.set(d.path,await binding(d.path,d));
 const familyReadings=[];
 for(const f of copies.families){const c=CONFIG[f.family];assert.ok(c,f.family);const text=(await bytes(f.derivedReadingCopy.path)).toString('utf8'),normal=compact(text);for(const marker of c.identity){if(c.identityAlternatives?.some(a=>a.includes(marker)))continue;assert.ok(normal.includes(compact(marker)),f.family+': '+marker);}for(const alternatives of c.identityAlternatives??[])assert.ok(alternatives.some(s=>normal.includes(compact(s))),f.family);
  const lines=text.split('\n');familyReadings.push({...f,pinpointReadOn:'2026-10-28',identityConfirmedFromBoundContent:true,identityNotInferredFromUrlEquality:true,identityMarkers:c.identity,sections:c.lines.map(([from,to])=>{assert.ok(to<=lines.length&&from>0&&to>=from);return{derivedTextLines:{from,to},text:lines.slice(from-1,to).join('\n')};}),assertionReviewedNow:c.assertion,remainingBoundary:c.boundary,method:'local-rereading-of-dated-hash-bound-historical-pinpoints-not-new-online-retrieval',newOnlineRetrieval:false});
 }
 const rows=[];
 for(const source of sources){const old=r07.rows.find(r=>r.sourceId===source.sourceId),config=CONFIG[old.physicalSourceFamily],family=familyReadings.find(f=>f.family===old.physicalSourceFamily);assert.deepEqual(source.referenceLocations,source.priorReferenceLocations);assert.equal(source.newReferenceLocations.length,0);
  for(const d of [source.historicalAssessment.review,source.historicalAssessment.humanApproval,...source.historicalAssessment.evidence])bound.set(d.path,await binding(d.path,d));
  const actualUseAssessments=[],normIds=new Set(config.norms),adjacentOutsideOwner=[];
  for(const location of source.referenceLocations){const[file,p]=location.split('#');assert.equal(file,'holiday-catalogs/ch-holiday-catalog.json');const actual=ptr(catalog,p),canonical=inv.rows.some(r=>r.sourceId===actual)?actual:'SRC-'+actual;assert.equal(canonical,source.sourceId);const parentPointer=p.replace(/\/sourceIds\/\d+$/u,''),parent=ptr(catalog,parentPointer);
   for(const id of parent.sourceIds){const resolved=inv.rows.find(r=>r.sourceId===id)??inv.rows.find(r=>r.sourceId==='SRC-'+id);assert.ok(resolved,id);if(resolved.kind==='caseLaw')continue;if(resolved.ownerLotId==='R10-A2-CALENDAR-ACTIVATION')normIds.add(resolved.sourceId);else adjacentOutsideOwner.push({sourceId:resolved.sourceId,ownerLotId:resolved.ownerLotId,role:'separate-source-owner-review-not-preempted-by-this-judgment-lane'});}
   let statementRole=config.historicalCounterexample?'historical-corrected-counterexample-not-positive-calculation-authority':parent.ambiguity?'limited-uncertainty-evidence-not-definitive-holiday-recognition':old.physicalSourceFamily==='2E8'&&source.sourceId==='SRC-AP22CLOSE-PROC-BGG-TRANSFER'?'bounded-normative-transfer-inference-not-canton-specific-precedent':'historical-principle-with-separate-current-norm-qualification';
   actualUseAssessments.push({location,parentPointer,bindingId:parent.id,profileId:parent.profileId,jurisdiction:parent.jurisdiction,statementRole,anchorPolicyId:parent.anchorPolicyId,boundaryIds:parent.boundaryIds,ambiguity:parent.ambiguity,matrixDecisionIds:parent.matrixDecisionIds,assessment:'same-existing-bounded-role-confirmed-no-new-use'});
  }
  for(const id of normIds){const source=inv.rows.find(s=>s.sourceId===id);assert.ok(source,id);assert.equal(source.ownerLotId,'R10-A2-CALENDAR-ACTIVATION',id);assert.notEqual(source.kind,'caseLaw');}
  const outcome=config.unclear?'unclear':'unchanged';assert.equal(source.historicalAssessment.outcome,outcome);
  rows.push({sourceId:source.sourceId,ownerLotId:'R10-A2-CALENDAR-ACTIVATION',reviewLane:'activation-judgments',currentReviewDate:'2026-10-28',outcome,method:'individual-bounded-historical-judgment-reuse-with-local-pinpoint-reread-and-separate-current-norm-screen',sourceRole:source.referenceUse,referenceLocations:source.referenceLocations,actualUseAssessments,newUsesAssessment:{count:0,priorReferenceGraphUnchanged:true,newCaseApprovalDerived:false},relevantProvisions:source.historicalAssessment.relevantProvisions,usedAssertions:[config.assertion],remainingBoundaries:[config.boundary,'Keine neue oder erschöpfende Rechtsprechungsrecherche. Keine Aussage, dass keine spätere Rechtsprechung existiert.'],decisionDate:old.versionFinding.resolvedVersion,bibliographicIdentity:{physicalDecisionFamily:old.physicalSourceFamily,originalRawEvidence:family.originalRawEvidence,originalRetrievalAt:family.originalRetrievalAt,identityConfirmedFromBoundContent:true,identityNotInferredFromUrlEquality:true,nonofficialMirror:config.unclear===true,officialOriginalIdentityStillUnclear:config.unclear===true},originalAssessment:{...source.historicalAssessment,originalDatePreserved:true},boundedReuse:{justified:true,originalCheckedOn:source.historicalAssessment.originalCheckedOn,originalContentRetrievalAt:family.originalRetrievalAt,decisionDate:old.versionFinding.resolvedVersion,currentDecisionDate:'2026-10-28',rationale:'Der datierte Originalbeleg und die konkret wieder gelesene historische Erwägung sind bytegebunden. Alle '+source.referenceLocations.length+' tatsächlichen Verwendungen und ihre eng begrenzte Quellenrolle sind gegenüber MVP09 unverändert. '+(config.unclear?'Die bekannte Spiegel-/Identitätsgrenze bleibt ausdrücklich ungeklärt und begründet keine positive Fallfreigabe.':'Keine heutige Normfassung oder neue Feiertagsliste wird allein aus der historischen Aussage abgeleitet.'),currentNormClosure:'pending-separate-bound-companion-closure'},localPinpointReading:{path:BASE+'/pinpoint-readings.json',family:old.physicalSourceFamily},freshEvidence:[],freshOnlineRetrievals:0,additionalCurrentNormCompanions:config.additionalNorms??[],requiredCurrentNormSourceIds:[...normIds].sort(),courtCompanionSourceIds:config.courtCompanions??[],adjacentSourcesOutsideCurrentOwner:[...new Map(adjacentOutsideOwner.map(x=>[x.sourceId,x])).values()].sort((a,b)=>a.sourceId.localeCompare(b.sourceId,'en')),positiveCaseApproval:false,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false});
 }
 assert.equal(rows.length,27);assert.equal(rows.reduce((n,r)=>n+r.referenceLocations.length,0),47);assert.equal(rows.filter(r=>r.referenceLocations.length===0).length,16);assert.equal(rows.filter(r=>r.outcome==='unclear').length,1);
 const pinpoints={kind:'R10-A2-CALENDAR-ACTIVATION-HISTORICAL-PINPOINT-REREAD',checkedOn:'2026-10-28',newOnlineRetrievals:0,method:'Current local reading of historical byte-bound documents. Original retrieval and decision dates are unchanged.',families:familyReadings,humanApproval:false,sourceReleaseApproved:false};
 const review={reviewId:'R10-A2-ACTIVATION-JUDGMENTS-20261028',ownerLotId:'R10-A2-CALENDAR-ACTIVATION',recordStatus:'historical-assertions-reviewed-awaiting-concrete-current-norm-closure',checkedOn:'2026-10-28',counts:{canonicalSources:27,physicalDecisionFamilies:18,actualReferenceLocations:47,newReferenceLocations:0,unreferencedSupportingSourceIds:16,individuallyJustifiedHistoricalReuses:27,currentLocalPinpointRereads:18,newOnlineRetrievals:0,unchangedOutcomes:26,retainedUnclearOutcomes:1},rows,evidenceBindings:[...bound.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,registerChanges:false,productChanges:false,operatingChanges:false,exhaustiveNewerCaseLawSearch:false};
 return{review,pinpoints};
}
export async function run({write=false}={}){const result=await buildReview();await save(BASE+'/pinpoint-readings.json',enc(result.pinpoints),write);await save(BASE+'/review.json',enc(result.review),write);return{status:write?'activation-judgment-review-created':'activation-judgment-review-reverified',...result.review.counts,normClosure:'pending',humanApproval:false,sourceReleaseApproved:false};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await run({write:process.argv[2]==='--write'}),null,2));}
