// SPDX-License-Identifier: AGPL-3.0-only
// Close concrete statute dependencies separately. Do not rewrite pending history.
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildReview} from './review-r10-a2-baseline-judgments.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const BASE='outputs/r10-a2-2026-10-28/baseline-judgments';
const PINNED=[
 {path:BASE+'/review.json',byteLength:124157,sha256:'8e206fff7ea1510ece10e5608fa717852cf8eebaf2b6b363ace55f3880b9c7aa'},
 {path:BASE+'/pinpoint-readings.json',byteLength:47694,sha256:'7e55d704f18446b8c3098deec0d1652f52409bdd36c1a529cbba350298bb1fe2'},
 {path:'outputs/r10-a2-2026-10-28/baseline-federal/review.json',byteLength:1452772,sha256:'fc9a4f67a9042b09ce6f6920b6bf9d9142e73baca2b5eecc2d0dc14606d47f7c'},
 {path:'outputs/r10-a2-2026-10-28/baseline-bern/review.json',byteLength:175558,sha256:'8c849d66aae69c3b7a325600bca281336d21d3dcaebac327e2ca13bdcdfc1ab3'}
];
const CONCLUSIONS={
 'JUD-AP17C-BGER-8C-767-2008-20090112':'ATSG Art. 38 bis 40, Art. 60 Abs. 2 und Art. 61 Bst. b sind im verwendeten Fenster bestätigt. Die angrenzenden elf Sozialerlasse und ausdrücklich qualifizierten Zuständigkeitsnormen sind einzeln gebunden. Der ausdrückliche materielle KVG-Editionsbefund betrifft nicht die positiven Art. 1, 80 und 85 dieses Verbesserungswegs und bleibt im Normbericht sichtbar. Keine Übertragung auf allgemeine weitere Gerichtsfristen oder ausserbernische Sozialpfade.',
 'JUD-AP17C-VGER-BE-100-2024-8-20240404':'IVöB Art. 55, 56 und 64, IVöBG Art. 3 bis 6 und IVöBV Art. 21a/22a bestätigen den qualifizierten bernischen 20-Tage-Weiterzug und die Beschaffungsübergangsgrenze. Der historische Beitrittsbefund wird nicht an die Stelle der heutigen qualifizierten kantonalen Anwendung gesetzt.',
 'JUD-AP17C-VGER-BE-200-2017-814-20180117':'Die aktuellen ATSG-Bestimmungen zu nach Tagen oder Monaten bestimmten Fristen bestätigen die bereits begrenzte Ausschlussrolle bei anderen gerichtlichen Fristen. Die drei IVG-/AHVG-/UVG-Ausschlüsse bleiben Ausschlüsse, keine neue Fixterminfunktion.',
 'JUD-BE-VG-100-2016-347':'VRPG in amtlicher Fassung seit 01.09.2026 bestätigt Art. 41, 67a Abs. 3 und 81. Der Zehntagespfad und die Bedingung nicht erst nach dem Abstimmungstermin bleiben unverändert.',
 'JUD-BE-VG-100-2017-270':'VRPG Art. 67a Abs. 3 ist amtlich unverändert bestätigt. Die einzige Gate-Verwendung bleibt auf qualifizierte Eröffnung und den Wahl-/Abstimmungstermin bezogen.',
 'JUD-BE-VG-100-2021-189':'VRPG Art. 67a Abs. 3 und die gesonderte Eröffnungsqualifikation bleiben bestätigt. Die subsidiäre individuelle Kenntnisanknüpfung wird nicht automatisiert als Falltatsache angenommen.',
 'JUD-BE-VG-200-2026-421':'VRPG Art. 41 Abs. 2 und FRG Art. 2 bestätigen die bernische Feiertagsbindung dieses allgemeinen kantonalen Verfahrens. Die eigenständige ATSG-Partei-/Vertretungsanknüpfung wird dadurch nicht verdrängt.',
 'JUD-BGER-1C-275-2009':'Aktueller BPR Art. 79 Abs. 1 bestätigt zehn Tage seit Eingang für die Kantonsregierung. Die im historischen Urteil genannte Art.-77-Referenz wird nicht umgeschrieben oder als heutige Normzuordnung behandelt. Verwendet bleiben nur Beginn und Endverschiebung.',
 'JUD-BGER-8C-620-2007':'Aktueller VRPG Art. 41 Abs. 3 bestätigt den Vorbehaltscharakter. Aktueller ATSG-Fristenstillstand wird gesondert normativ bestätigt. Die bis Ende 2007 geltende Übergangslage wird nicht in 2026–2027 übertragen.',
 'JUD-BGER-9C-757-2007':'Aktueller VRPG Art. 41 Abs. 3 und die getrennt geprüften ATSG-Fristnormen schliessen die Begleitabhängigkeit. Wiederverwendet wird nur der deklaratorische Vorbehalt, nicht die historische Nichtanwendung des ATSG.'
};
const H=b=>createHash('sha256').update(b).digest('hex');
const enc=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!path.includes('\\')&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'));return path;}
async function read(path){safe(path);let p=ROOT;assert.equal((await lstat(p)).isSymbolicLink(),false);for(const bit of path.split('/')){p=resolve(p,bit);assert.equal((await lstat(p)).isSymbolicLink(),false,path);}return readFile(p);}
async function descriptor(path,expected){const b=await read(path),d={path,byteLength:b.length,sha256:H(b)};if(expected){assert.equal(d.sha256,expected.sha256,path);assert.equal(d.byteLength,expected.byteLength,path);}return d;}
function ptr(root,path){return path.split('/').slice(1).reduce((a,k)=>a[k.replaceAll('~1','/').replaceAll('~0','~')],root);}
export async function buildClosure(){
 const bound=new Map();for(const d of PINNED)bound.set(d.path,await descriptor(d.path,d));
 const preliminary=JSON.parse(await read(PINNED[0].path)),pinpoints=JSON.parse(await read(PINNED[1].path));
 const rebuilt=await buildReview();assert.deepEqual(rebuilt.review,preliminary);assert.deepEqual(rebuilt.excerpts,pinpoints);
 const federal=JSON.parse(await read(PINNED[2].path)),bern=JSON.parse(await read(PINNED[3].path));
 assert.equal(federal.checkedOn,'2026-10-28');assert.equal(bern.checkedOn,'2026-10-28');for(const report of [federal,bern]){assert.equal(report.humanApproval,false);assert.equal(report.sourceReleaseApproved,false);}
 const norms=new Map();for(const report of [{doc:federal,binding:PINNED[2],key:'sourceRows'},{doc:bern,binding:PINNED[3],key:'rows'}])report.doc[report.key].forEach((row,i)=>{assert.equal(norms.has(row.sourceId),false,row.sourceId);norms.set(row.sourceId,{row,report,pointer:'/'+report.key+'/'+i});});
 const documents=new Map(),rows=[];
 for(const judgment of preliminary.rows){
  const required=new Set(judgment.normCompanionAssessment.sourceIds),contextLocators=new Map();
  for(const use of judgment.actualUseAssessments){const file=use.location.split('#')[0],path='data/candidates/2026-10-28-ap23m3/'+file;if(!documents.has(file)){documents.set(file,JSON.parse(await read(path)));bound.set(path,await descriptor(path));}const parent=ptr(documents.get(file),use.parentPointer);for(const ref of [...parent.sourceRefs??[],...parent.normBindings??[]])if(!ref.sourceId.startsWith('JUD')){required.add(ref.sourceId);const set=contextLocators.get(ref.sourceId)??new Set();if(ref.locator)set.add(ref.locator);contextLocators.set(ref.sourceId,set);}}
  const normAssessments=[];
  for(const sourceId of [...required].sort()){
   const match=norms.get(sourceId);assert.ok(match,'Missing actual companion '+sourceId);const n=match.row,isFederal=match.report.key==='sourceRows';
   assert.equal(n.ownerLotId,'R10-A2-BASELINE');assert.equal(n.humanApproval,false);assert.equal(n.sourceReleaseApproved,false);const expectedOutcome=isFederal?(sourceId==='SRC-AP19C3-KVG-20260101'?'used-assertions-confirmed-with-explicit-material-edition-finding':'used-assertions-confirmed-with-retained-limits'):'unchanged';assert.equal(n.outcome,expectedOutcome,sourceId);
   const officialEvidence=[];for(const item of n.freshEvidence){const d=await descriptor(item.path,item);bound.set(d.path,d);officialEvidence.push(d);}
   assert.ok(officialEvidence.length>0,sourceId);
   let contentAssessment;
   if(isFederal){assert.match(n.currentFamilyAssessmentPointer,/^\/families\/\d+$/u);const family=ptr(match.report.doc,n.currentFamilyAssessmentPointer);assert.ok(family);contentAssessment={reportBinding:{...match.report.binding,pointer:n.currentFamilyAssessmentPointer}};for(const key of ['contentEvidence','sameVersionEditionEvidence'])if(family[key]){const d=await descriptor(family[key].path,family[key]);bound.set(d.path,d);contentAssessment[key]={...family[key]};}}
   else{const d=await descriptor(n.contentExtract.path,n.contentExtract);bound.set(d.path,d);contentAssessment=d;}
   normAssessments.push({sourceId,reportBinding:{...match.report.binding,pointer:match.pointer},currentReviewDate:n.checkedOn??n.currentReviewOn,judgmentContextLocators:[...contextLocators.get(sourceId)??[]].sort(),reviewedNormProvisions:n.actualStatements?.relevantProvisions??n.relevantProvisions,contentFinding:n.substantiveFinding??n.contentFinding,currentAndPublishedFutureVersions:n.versionFinding??n.currentAndFutureVersions,contentAssessment,officialEvidence,outcome:n.outcome,actualJudgmentUseEffect:'existing-limited-assertion-confirmed'});
  }
  assert.ok(CONCLUSIONS[judgment.sourceId]);rows.push({sourceId:judgment.sourceId,ownerLotId:'R10-A2-BASELINE',closedOn:'2026-10-28',originalPendingReviewBinding:{...PINNED[0],pointer:'/rows/'+preliminary.rows.indexOf(judgment)},historicalJudgmentReviewNotRewritten:true,referenceLocations:judgment.referenceLocations,actualUseCount:judgment.referenceLocations.length,normCompanionStatus:'closed-for-the-exact-existing-uses',requiredNormIds:[...required].sort(),normAssessments,closureConclusion:CONCLUSIONS[judgment.sourceId],remainingBoundaries:judgment.remainingBoundaries,noBroaderCaseLawClaim:true,noScopeExtension:true,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false});
 }
 assert.equal(rows.length,10);assert.equal(rows.reduce((n,r)=>n+r.actualUseCount,0),42);
 return{kind:'R10-A2-BASELINE-JUDGMENT-COMPANION-NORM-CLOSURE',checkedOn:'2026-10-28',recordStatus:'ten-bounded-judgment-reviews-closed-awaiting-common-human-acceptance',ownerLotId:'R10-A2-BASELINE',counts:{judgmentSources:10,actualReferenceLocations:42,requiredNormSources:new Set(rows.flatMap(r=>r.requiredNormIds)).size,pendingCompanionDependencies:0},scope:'Only the ten historical judgment assertions and their unchanged 42 uses. Each current statute dependency is resolved by concrete source ID, legal content, version finding and byte-bound report pointer. Not a blanket closure of the other R10-A2 sources.',humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false,registerChanges:false,operatingChanges:false,rows,evidenceBindings:[...bound.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))};
}
export async function run({write=false}={}){const result=await buildClosure(),path=BASE+'/companion-norm-closure.json',b=enc(result);if(write){try{await writeFile(resolve(ROOT,path),b,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;assert.deepEqual(await read(path),b);}}else assert.deepEqual(await read(path),b);return{status:write?'companion-norm-closure-written':'companion-norm-closure-reverified',...result.counts,humanApproval:false,sourceReleaseApproved:false};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await run({write:process.argv[2]==='--write'}),null,2));}
