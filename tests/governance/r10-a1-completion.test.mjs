// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic inventory and metadata fixtures. No real evidence or release mutations.
import assert from 'node:assert/strict';
import test from 'node:test';
import {completionConfig,completionFlags,validateInventories,metadataFromEvidence,validateMetadata,supplementaryPlan} from '../../scripts/finalize-r10-a1.mjs';
import {buildPlan,tapCounts,passed} from '../../scripts/check-r10-a1.mjs';
const ownerCounts=[['R10-A2-BASELINE',77],['R10-A2-CALENDAR-ACTIVATION',73],['R10-A2-CALENDAR-CATALOG',82],['R10-A2-ADMIN-PRIOR',19],
 ...[['F',15],['G',11],['H',10],['I',11],['J',19],['K',27],['L',17],['M',19]].map(([l,n])=>['R10-A2-AP23'+l+'1',n])];
const ids={candidate:'2026-10-28-ap23m3-candidate.1',baseline:'2026-10-18-mvp-09-approved.1'};
const sourceCounts={candidateManifest:258,priorManifest:128,allCanonicalSourceIds:380,priorReviewedSources:251,newCanonicalSourceIds:129,newRuntimeSourceDefinitions:130,
 existingCanonicalIdsNewlyDefinedAtRuntime:1,referenceGraphEdges:5045,previousReferenceGraphEdges:2136,retainedReferenceGraphEdges:2136,addedReferenceGraphEdges:2909,changedPriorEdges:0,
 removedPriorEdges:0,historicalProvenanceEdges:713,boundHistoricalEvidenceFiles:1223,boundHistoricalEvidenceBytes:431105954,plannedOwnerLots:12,freshOfficialChecks:0,
 referenceUses:{'positive-or-shared-reference':266,'exclusion-only':4,'supporting-or-monitoring-unreferenced':110}};
const coverageCounts={allCantons:26,operatingBaselineCantons:6,localOnlyAcceptedCantons:20,administrativePaths:245,operatingBaselineAdministrativePaths:25,newAdministrativePaths:220,
 calendars:35,baselineCalendars:32,baseHolidayRules:479,proceduralSupplementRules:20,totalHolidayRules:499,baselineBaseHolidayRules:479,baselineProceduralSupplementRules:12,
 baselineTotalHolidayRules:491,bernProfileRules:9,socialRules:44,bernSocialBindings:50,candidateFiles:45,baselineFiles:42};
function inventories(){
 let n=0;const rows=[],reviewLots=ownerCounts.map(([id,count])=>{const sourceIds=[];for(let k=0;k<count;k++){
  const sourceId=n===0?'SRC-BUNDESFEIERTAG-19940701':n===150?'SRC-ZH-RLG-8224-N045':'SRC-FIXTURE-'+String(n).padStart(3,'0');n++;sourceIds.push(sourceId);
  rows.push({sourceId,ownerLotId:id,humanApproval:false,sourceReleaseApproved:false,freshLegalReviewStatus:'pending',freshEvidence:[]});
 }return{id,status:'planned-not-reviewed',count,sourceIds,freshLegalReviewPerformed:false,sourceReleaseApproved:false};});
 const source={workPackage:'R10-A1',recordStatus:'preparation-only',candidateReleaseId:ids.candidate,comparedReleaseId:ids.baseline,
  humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,freshLegalVerificationPerformed:false,completeReleaseReview:false,newOnlineRetrievals:0,
  counts:structuredClone(sourceCounts),rows,reviewLots,groups:{existingSourceIdsWithNewUses:['SRC-BUNDESFEIERTAG-19940701','SRC-ZH-RLG-8224-N045']}};
 const coverage={workPackage:'R10-A1',status:'local-coverage-inventory-verified',localOnly:true,sourceReleaseApproved:false,humanAcceptance:false,newLegalReviewPerformed:false,
  calculationPerformed:false,operatingChanges:false,newOnlineFetches:0,candidate:{releaseId:ids.candidate},operatingBaseline:{releaseId:ids.baseline},counts:structuredClone(coverageCounts),
  paths:Array.from({length:245},(_,i)=>({pathId:'path-'+i})),cantons:'AG AI AR BE BL BS FR GE GL GR JU LU NE NW OW SG SH SO SZ TG TI UR VD VS ZG ZH'.split(' ').map(canton=>({canton})),
  preserved:{oldAdministrativePaths:true,oldQualificationPolicies:true,bernProfile:true,specialCatalog:true,socialFederalRules:true,bernSocialBindings:true,physicalHolidayCatalogData:true,oldCalendarRules:true}};
 return{source,coverage};
}
function evidence(){const{source,coverage}=inventories();return{source,coverage,preflight:{head:'a'.repeat(40)},preflightCounts:{'product-regression':4006,'host-lifecycle':90,legacyComparisons:1584},
 supplementary:{steps:[{id:'governance',counts:{tests:200,pass:200,fail:0,cancelled:0,skipped:0,todo:0}}]},preservation:{protectedFilesVerified:15367}};}
function metadata(){const e=evidence();return{e,saved:{...metadataFromEvidence(e),localLinksChecked:1,bindings:[{path:'outputs/fixture/report.json',byteLength:2,sha256:'b'.repeat(64)}]}};}
test('synthetic closed inventories validate without reading or writing evidence',()=>{const{source,coverage}=inventories();assert.equal(validateInventories(source,coverage),true);});
test('completion paths are the new A1 reports, not existing M3 or U1 proofs',()=>{
 assert.equal(completionConfig.proof,'outputs/r10-a1-2026-10-28/local-completion.json');assert.equal(completionConfig.source,'outputs/r10-a1-2026-10-28/sources/source-inventory.json');
 assert.equal(completionConfig.coverage,'outputs/r10-a1-2026-10-28/coverage.json');assert.equal(completionConfig.docs.length,3);assert.equal(completionConfig.living.length,8);
});
for(const key of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','publicationApproved','freshLegalVerificationPerformed','completeReleaseReview'])
 test('source inventory cannot raise '+key,()=>{const{source,coverage}=inventories();source[key]=true;assert.throws(()=>validateInventories(source,coverage));});
for(const [label,change]of[
 ['work package',s=>{s.workPackage='R10-A2';}],['record status',s=>{s.recordStatus='approved';}],['online retrieval',s=>{s.newOnlineRetrievals=1;}],
 ['role partition',s=>{s.counts.referenceUses['exclusion-only']=5;}],['prior usage IDs',s=>{s.groups.existingSourceIdsWithNewUses=['OTHER'];}],
 ['missing row',s=>{s.rows.pop();}],['duplicate source ID',s=>{s.rows[1].sourceId=s.rows[0].sourceId;}],['missing owner lot',s=>{s.reviewLots.pop();}],
 ['row human approval',s=>{s.rows[0].humanApproval=true;}],['row source approval',s=>{s.rows[0].sourceReleaseApproved=true;}],
 ['row fresh review status',s=>{s.rows[0].freshLegalReviewStatus='confirmed';}],['invented fresh evidence',s=>{s.rows[0].freshEvidence.push({path:'new.txt'});}],
 ['missing row owner',s=>{s.rows[0].ownerLotId='missing';}],['wrong row owner',s=>{s.rows[0].ownerLotId=s.reviewLots[1].id;}],
 ['lot status',s=>{s.reviewLots[0].status='reviewed';}],['lot fresh review',s=>{s.reviewLots[0].freshLegalReviewPerformed=true;}],
 ['lot source approval',s=>{s.reviewLots[0].sourceReleaseApproved=true;}],['lot declared count',s=>{s.reviewLots[0].count--;}],
 ['owner duplication',s=>{s.reviewLots[1].sourceIds[0]=s.reviewLots[0].sourceIds[0];}],
 ['foreign owner ID',s=>{const old=s.reviewLots[0].id;s.reviewLots[0].id='R10-A2-UNKNOWN';for(const r of s.rows)if(r.ownerLotId===old)r.ownerLotId='R10-A2-UNKNOWN';}],
 ['merged owner plus empty dummy',s=>{const first=s.reviewLots[0],second=s.reviewLots[1],old=second.id;first.sourceIds.push(...second.sourceIds);first.count=first.sourceIds.length;for(const r of s.rows)if(r.ownerLotId===old)r.ownerLotId=first.id;second.sourceIds=[];second.count=0;}]
])test('source inventory rejects '+label,()=>{const{source,coverage}=inventories();change(source);assert.throws(()=>validateInventories(source,coverage));});
for(const key of Object.keys(sourceCounts).filter(k=>k!=='referenceUses'))
 test('source count stays exact: '+key,()=>{const{source,coverage}=inventories();source.counts[key]++;assert.throws(()=>validateInventories(source,coverage));});
for(const key of ['sourceReleaseApproved','humanAcceptance','newLegalReviewPerformed','calculationPerformed','operatingChanges'])
 test('coverage cannot raise '+key,()=>{const{source,coverage}=inventories();coverage[key]=true;assert.throws(()=>validateInventories(source,coverage));});
for(const key of Object.keys(coverageCounts))
 test('coverage count stays exact: '+key,()=>{const{source,coverage}=inventories();coverage.counts[key]++;assert.throws(()=>validateInventories(source,coverage));});
for(const [label,change]of[
 ['work package',c=>{c.workPackage='R10-A2';}],['status',c=>{c.status='operating';}],['local boundary',c=>{c.localOnly=false;}],['new online fetch',c=>{c.newOnlineFetches=1;}],
 ['candidate mismatch',c=>{c.candidate.releaseId='foreign';}],['operating baseline mismatch',c=>{c.operatingBaseline.releaseId='foreign';}],
 ['missing path',c=>{c.paths.pop();}],['missing canton',c=>{c.cantons.pop();}],['changed preserved meaning',c=>{c.preserved.oldCalendarRules=false;}]
])test('coverage rejects '+label,()=>{const{source,coverage}=inventories();change(coverage);assert.throws(()=>validateInventories(source,coverage));});
test('mutually consistent foreign candidate IDs still fail the exact actual candidate gate',()=>{const{source,coverage}=inventories();source.candidateReleaseId=coverage.candidate.releaseId='foreign-consistent';assert.throws(()=>validateInventories(source,coverage));});
test('mutually consistent foreign operating IDs still fail the exact actual MVP09 gate',()=>{const{source,coverage}=inventories();source.comparedReleaseId=coverage.operatingBaseline.releaseId='foreign-consistent';assert.throws(()=>validateInventories(source,coverage));});
test('MVP09 is 479+12=491 and candidate is 479+20=499, never silently equal totals',()=>{const{source,coverage}=inventories();assert.equal(coverage.counts.baselineBaseHolidayRules+coverage.counts.baselineProceduralSupplementRules,491);assert.equal(coverage.counts.baseHolidayRules+coverage.counts.proceduralSupplementRules,499);coverage.counts.baselineTotalHolidayRules=499;assert.throws(()=>validateInventories(source,coverage));});
test('synthetic completion validates while U1 alone is human accepted',()=>{const{e,saved}=metadata();assert.equal(validateMetadata(saved,e),true);assert.equal(saved.u1HumanAcceptance,true);assert.equal(saved.humanAcceptance,false);assert.equal(saved.r10A2Performed,false);assert.equal(saved.counts.reviewLots,12);assert.equal(saved.protectedFiles,15367);});
test('all current completion flags explicitly remain false',()=>{assert.deepEqual(completionFlags,['humanAcceptance','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','r10A2Performed']);const{saved}=metadata();for(const key of completionFlags)assert.equal(saved[key],false,key);});
for(const key of completionFlags)test('completion cannot raise '+key,()=>{const{e,saved}=metadata();saved[key]=true;assert.throws(()=>validateMetadata(saved,e));});
for(const [label,change]of[
 ['work package',s=>{s.workPackage='R10-A2';}],['status',s=>{s.status='approved';}],['HEAD',s=>{s.head='b'.repeat(40);}],['U1 acceptance',s=>{s.u1HumanAcceptance=false;}],
 ['candidate ID',s=>{s.candidateReleaseId='foreign';}],['baseline ID',s=>{s.operatingBaseline='foreign';}],['source count',s=>{s.counts.sources=381;}],
 ['protected count',s=>{s.protectedFiles=1;}],['product change',s=>{s.productChanged=true;}],['legal data change',s=>{s.legalDataChanged=true;}],
 ['schemas change',s=>{s.schemasChanged=true;}],['package change',s=>{s.packageChanged=true;}],['historical evidence change',s=>{s.historicalEvidenceChanged=true;}],
 ['online retrieval',s=>{s.freshOnlineRetrievals=1;}],['content review',s=>{s.newSubstantiveSourceReviews=1;}],['extra authority',s=>{s.r10A2Authorized=true;}]
])test('closed completion rejects '+label,()=>{const{e,saved}=metadata();change(saved);assert.throws(()=>validateMetadata(saved,e));});
for(const [label,change]of[
 ['missing links',s=>{s.localLinksChecked=0;}],['invalid link counter',s=>{s.localLinksChecked=0.5;}],['empty bindings',s=>{s.bindings=[];}],
 ['duplicate binding',s=>{s.bindings.push({...s.bindings[0]});}],['parent traversal',s=>{s.bindings[0].path='../report.json';}],
 ['absolute binding',s=>{s.bindings[0].path='/report.json';}],['drive binding',s=>{s.bindings[0].path='C:/report.json';}],
 ['control character path',s=>{s.bindings[0].path='bad\nreport.json';}],['invalid hash',s=>{s.bindings[0].sha256='invalid';}],
 ['invalid byte length',s=>{s.bindings[0].byteLength=-1;}],['fractional length',s=>{s.bindings[0].byteLength=0.5;}],['extra binding field',s=>{s.bindings[0].approved=true;}]
])test('closed binding inventory rejects '+label,()=>{const{e,saved}=metadata();change(saved);assert.throws(()=>validateMetadata(saved,e));});
test('TAP counts are extracted from the actual summary, not guessed from text',()=>{assert.deepEqual(tapCounts('ok 1 - sample\n# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n'),{tests:2,pass:2,fail:0,cancelled:0,skipped:0,todo:0});assert.deepEqual(tapCounts('test words without summary'),{});});
test('strict passing TAP counts require non-empty complete results',()=>{assert.doesNotThrow(()=>passed({tests:1,pass:1,fail:0,cancelled:0,skipped:0,todo:0}));for(const value of [{},{tests:0,pass:0,fail:0,cancelled:0,skipped:0,todo:0},{tests:1,pass:0,fail:1,cancelled:0,skipped:0,todo:0}])assert.throws(()=>passed(value));});
for(const key of ['fail','cancelled','skipped','todo'])test('TAP pass rejects non-zero '+key,()=>{const counts={tests:1,pass:1,fail:0,cancelled:0,skipped:0,todo:0};counts[key]=1;assert.throws(()=>passed(counts));});
test('preflight uses only bounded existing check modes and proof logs',async()=>{const plan=await buildPlan();assert.deepEqual(plan.map(r=>r[0]),['preservation-before','typecheck','candidate-reproduction','product-regression','host-lifecycle','legacy-equivalence','accepted-u1-archive','accepted-m3-archive','preservation-after']);
 const get=id=>plan.find(r=>r[0]===id)[1];assert.deepEqual(get('candidate-reproduction'),['--import','tsx','scripts/build-ap23m3-candidate.ts','--check']);assert.deepEqual(get('typecheck'),['node_modules/typescript/bin/tsc','--noEmit']);
 assert.deepEqual(get('accepted-u1-archive'),['scripts/archive-r10-u1-acceptance.mjs','--check']);assert.deepEqual(get('accepted-m3-archive'),['scripts/archive-ap23m3-acceptance.mjs','--check']);
 assert.equal(get('host-lifecycle').filter(a=>a.endsWith('.test.ts')).length,9);assert.deepEqual(plan.filter(r=>r[1].includes('--write')).map(r=>r[0]),['preservation-before','preservation-after']);
 for(const[,args]of plan)assert.equal(args.some(a=>/promote|adopt|package-solution|push|upload|install|sppkg/iu.test(a)),false);
});
test('supplementary closure includes all new A1 governance and read-only inventory checks',async()=>{const plan=await supplementaryPlan();assert.deepEqual(plan.map(r=>r[0]),['governance','source-inventory','coverage-inventory','whitespace']);
 const get=id=>plan.find(r=>r[0]===id)[2],tests=get('governance').filter(a=>a.endsWith('.test.mjs'));assert.ok(tests.length>=4);assert.ok(tests.includes('tests/governance/r10-a1-protection.test.mjs'));assert.ok(tests.includes('tests/governance/r10-a1-completion.test.mjs'));assert.ok(tests.every(a=>/^tests\/governance\/r10-a1[^/]+\.test\.mjs$/u.test(a)));
 assert.deepEqual(get('source-inventory'),['scripts/inventory-r10-a1-sources.mjs','--check']);assert.deepEqual(get('coverage-inventory'),['scripts/inventory-r10-a1-coverage.mjs','--check']);assert.deepEqual(get('whitespace'),['diff','--check']);
 for(const[,,args]of plan){assert.equal(args.includes('--write'),false);assert.equal(args.some(a=>/promote|adopt|package-solution|push|upload|install|sppkg/iu.test(a)),false);}
});
