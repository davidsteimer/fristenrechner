// SPDX-License-Identifier: AGPL-3.0-only
// Purpose-bound current norm closure, historical reports and reservations retained.
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildReview} from './review-r10-a2-activation-judgments.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const BASE='outputs/r10-a2-2026-10-28/activation-judgments';
const PINNED=[
 {path:BASE+'/review.json',byteLength:301980,sha256:'81c3530f3b9ee9137ffa8e17c1a3092b534f0c2b639531419e2028028a043b9e'},
 {path:BASE+'/pinpoint-readings.json',byteLength:111596,sha256:'39a4cb9ad79c45ec0bffcb732fa41b4d8739d2d0d9dc9058eb43a1debe29f1ab'},
 {path:'outputs/r10-a2-2026-10-28/activation-federal/review.json',byteLength:238533,sha256:'f6f888fe099122ab9f23b162980eeea45c1eb05e40dadf0c3cfb0c60b74f8759'},
 {path:'outputs/r10-a2-2026-10-28/activation-cantonal/review.json',byteLength:204341,sha256:'ff07ee41babdcc419db94f36aafd39c8e8ac4cccfe4d6982057cfc33491d8a59'},
 {path:'outputs/r10-a2-2026-10-28/activation-cantonal/january-companions.json',byteLength:8142,sha256:'eaed81e1cba180a7983390c6f4cd1ac44cb25bb718acb77769a5fc0217ffdbb7'}
];
const H=b=>createHash('sha256').update(b).digest('hex');
const enc=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!path.includes('\\')&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'));return path;}
async function bytes(path){safe(path);let p=ROOT;for(const item of path.split('/')){p=resolve(p,item);assert.equal((await lstat(p)).isSymbolicLink(),false,path);}return readFile(p);}
async function binding(path,expected){const b=await bytes(path),d={path,byteLength:b.length,sha256:H(b)};if(expected){assert.equal(d.sha256,expected.sha256,path);if(expected.byteLength!==undefined)assert.equal(d.byteLength,expected.byteLength,path);}return d;}
function ptr(root,p){return p.split('/').slice(1).reduce((a,k)=>a[k.replaceAll('~1','/').replaceAll('~0','~')],root);}
export async function buildClosure(){
 const bound=new Map();for(const d of PINNED)bound.set(d.path,await binding(d.path,d));
 const prior=JSON.parse(await bytes(PINNED[0].path)),pinpoints=JSON.parse(await bytes(PINNED[1].path)),rebuilt=await buildReview();assert.deepEqual(rebuilt.review,prior);assert.deepEqual(rebuilt.pinpoints,pinpoints);
 for(const d of prior.evidenceBindings)bound.set(d.path,await binding(d.path,d));
 const federal=JSON.parse(await bytes(PINNED[2].path)),cantonal=JSON.parse(await bytes(PINNED[3].path)),january=JSON.parse(await bytes(PINNED[4].path));
 for(const report of [federal,cantonal,january]){assert.equal(report.ownerLotId,'R10-A2-CALENDAR-ACTIVATION');assert.equal(report.checkedOn,'2026-10-28');assert.equal(report.humanApproval,false);assert.equal(report.sourceReleaseApproved,false);}
 assert.equal(january.laterSourceOwnerLotsClosed,false);assert.equal(january.productOrRuleChanges,false);
 const norms=new Map();for(const item of [{doc:federal,binding:PINNED[2],key:'sourceRows'},{doc:cantonal,binding:PINNED[3],key:'rows'}])item.doc[item.key].forEach((r,i)=>{assert.equal(norms.has(r.sourceId),false);norms.set(r.sourceId,{row:r,report:item,pointer:'/'+item.key+'/'+i});});
 const rows=[];
 for(const judgment of prior.rows){
  const normAssessments=[];
  for(const sourceId of judgment.requiredCurrentNormSourceIds){
   const m=norms.get(sourceId);assert.ok(m,'Missing actual companion '+sourceId);const n=m.row,isFederal=m.report.key==='sourceRows';assert.equal(n.humanApproval,false);assert.equal(n.sourceReleaseApproved,false);assert.equal(n.outcome,isFederal?'used-assertion-confirmed-with-explicit-role-and-retained-limits':'unchanged',sourceId);
   const evidence=[];for(const d of n.freshEvidence){const checked=await binding(d.path,d);bound.set(d.path,checked);evidence.push(checked);}
   const content=[];
   if(isFederal){const d=await binding(n.contentEvidence.path,n.contentEvidence);bound.set(d.path,d);const c=JSON.parse(await bytes(d.path));assert.ok(ptr(c,n.contentEvidence.pointer));content.push({...n.contentEvidence});}
   else{for(const path of n.contentRead.readingAids){const d=await binding(path);bound.set(path,d);content.push(d);}for(const d of n.contentRead.correctedNeHtml??[]){bound.set(d.path,await binding(d.path,d));content.push(d);}}
   assert.ok(evidence.length>0||content.length>0,sourceId);
   normAssessments.push({sourceId,reportBinding:{...m.report.binding,pointer:m.pointer},currentReviewDate:n.checkedOn??n.currentReviewOn,relevantProvisions:n.relevantProvisions,contentFinding:n.substantiveFinding??n.usedAssertions,currentAndPublishedFutureFinding:n.currentFutureFinding??n.versionAssessment,contentEvidence:content,officialEvidence:evidence,outcome:n.outcome,actualJudgmentUseEffect:'existing-purpose-bound-assertion-confirmed-not-new-case-approval'});
  }
  const additional=[];
  for(const need of judgment.additionalCurrentNormCompanions){const ids=need==='SG-RLG-2-and-PersV-59'?['SG-PERSV','SG-RLG']:need==='SH-PersV-33'?['SH-PERSV']:null;assert.ok(ids,need);for(const id of ids){const index=january.companionFindings.findIndex(r=>r.id===id);assert.ok(index>=0,id);const f=january.companionFindings[index],d=await binding(f.evidence.path,f.evidence);bound.set(d.path,d);assert.equal(f.law.futureVersions.length,0);assert.equal(f.law.abrogated,false);assert.equal(f.law.abrogatedScheduled,false);additional.push({id,reportBinding:{...PINNED[4],pointer:'/companionFindings/'+index},identity:f.identity,relevantProvisions:f.relevantProvisions,content:f.content,currentAndPublishedFutureFinding:f.law,finding:f.finding,proceduralBoundary:f.proceduralBoundary,evidence:d,laterSourceOwnerReviewClosed:false});}}
  const courtAssessments=judgment.courtCompanionSourceIds.map(id=>{const index=prior.rows.findIndex(r=>r.sourceId===id);assert.ok(index>=0,id);const r=prior.rows[index];assert.equal(r.outcome,'unchanged');return{sourceId:id,reviewBinding:{...PINNED[0],pointer:'/rows/'+index},assertion:r.usedAssertions,role:r.bibliographicIdentity.physicalDecisionFamily==='4A538'?'corrected-historical-counterexample':'bounded-historical-companion-not-current-statute'};});
  const limits=[...judgment.remainingBoundaries];if(judgment.requiredCurrentNormSourceIds.some(id=>id.includes('NE-LPA')||id.includes('NE-RDF')))limits.push('Die aktuelle LPA-/RDF-Kalenderprüfung schliesst NE-O4 nicht. Die LJu steht im amtlichen Zukunftsindex weiterhin auf En attente promulgation.');
  const isFr=judgment.sourceId==='SRC-AP22-FR-PRAXIS';
  rows.push({sourceId:judgment.sourceId,ownerLotId:'R10-A2-CALENDAR-ACTIVATION',closedOn:'2026-10-28',originalPendingReviewBinding:{...PINNED[0],pointer:'/rows/'+prior.rows.indexOf(judgment)},historicalPendingRecordUnchanged:true,referenceLocations:judgment.referenceLocations,actualUseCount:judgment.referenceLocations.length,normCompanionStatus:'closed-for-the-exact-existing-assertion-and-role',requiredNormSourceIds:judgment.requiredCurrentNormSourceIds,normAssessments,additionalPurposeBoundNormAssessments:additional,courtCompanionAssessments:courtAssessments,originalJudgmentOutcome:judgment.outcome,finalBoundedOutcome:judgment.outcome,closureConclusion:isFr?'Die aktuelle FR-Normgrundlage und ZPO sind separat bestätigt. Dies authentifiziert den historischen Spiegel nicht. Outcome unclear und fehlende positive Aktivierung bleiben unverändert.':judgment.usedAssertions[0]+' Die konkret genannten heutigen Normbegleiter und die ursprüngliche Quellenrolle sind separat bestätigt. Keine neue automatische Fallfreigabe.',remainingBoundaries:limits,underlyingLegalUncertaintyResolved:false,newPositiveCaseApproval:false,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false});
 }
 assert.equal(rows.length,27);assert.equal(rows.reduce((n,r)=>n+r.actualUseCount,0),47);assert.equal(rows.filter(r=>r.finalBoundedOutcome==='unclear').length,1);
 return{kind:'R10-A2-ACTIVATION-JUDGMENT-COMPANION-NORM-CLOSURE',ownerLotId:'R10-A2-CALENDAR-ACTIVATION',checkedOn:'2026-10-28',recordStatus:'27-bounded-judgment-roles-norm-companions-closed-awaiting-common-human-acceptance',counts:{judgmentSources:27,physicalDecisionFamilies:18,actualReferenceLocations:47,concreteNormSources:new Set(rows.flatMap(r=>r.requiredNormSourceIds)).size,additionalPhysicalNormCompanions:3,pendingCompanionDependencies:0,retainedUnclearOutcomes:1,newOnlineJudgmentRetrievals:0},rows,scope:'Closes only the purpose-bound current statute dependencies of these 27 historical judgment source IDs. Does not close source-owner reviews in later lots, resolve January uncertainties or authenticate the historical FR mirror.',evidenceBindings:[...bound.values()].sort((a,b)=>a.path.localeCompare(b.path,'en')),humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,registerChanges:false,productChanges:false,operatingChanges:false,laterSourceOwnerLotsClosed:false};
}
export async function run({write=false}={}){const result=await buildClosure(),path=BASE+'/companion-norm-closure.json',b=enc(result);if(write){try{await writeFile(resolve(ROOT,path),b,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;assert.deepEqual(await bytes(path),b);}}else assert.deepEqual(await bytes(path),b);return{status:write?'activation-companion-closure-created':'activation-companion-closure-reverified',...result.counts,humanApproval:false,sourceReleaseApproved:false};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await run({write:process.argv[2]==='--write'}),null,2));}
