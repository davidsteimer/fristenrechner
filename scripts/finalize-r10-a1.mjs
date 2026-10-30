// SPDX-License-Identifier: AGPL-3.0-only
// Close A1 inventories and plan. This cannot approve sources or begin A2.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPlan,tapCounts,passed} from './check-r10-a1.mjs';
import {checkPreservation,preservationConfig} from './check-r10-a1-preservation.mjs';
import {preparationConfig,bind,safe,walk} from './prepare-r10-a1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const completionConfig=Object.freeze({out:preparationConfig.out,proof:preparationConfig.out+'/local-completion.json',
 docs:['docs/betrieb/bestandsbericht-r10-a1.md','docs/fachrecht/quellenpruefplan-r10-a2.md','docs/ux/abnahme-r10-u1.md'],living:preparationConfig.living,
 source:preparationConfig.out+'/sources/source-inventory.json',coverage:preparationConfig.out+'/coverage.json'});
const {out,proof}=completionConfig,json=async path=>JSON.parse(await readFile(resolve(root,path)));
async function verify(rows,label){assert.ok(Array.isArray(rows)&&rows.length>0,label);assert.equal(new Set(rows.map(r=>r.path)).size,rows.length,label);for(const r of rows)assert.deepEqual(await bind(root,r.path),r,label+' '+r.path);}
export function validateInventories(source,coverage){
 assert.equal(source.workPackage,'R10-A1');assert.equal(source.recordStatus,'preparation-only');
 for(const k of ['humanApproval','sourceReleaseApproved','dataPromotionApproved','publicationApproved','freshLegalVerificationPerformed','completeReleaseReview'])assert.equal(source[k],false,k);
 assert.equal(source.newOnlineRetrievals,0);
 assert.equal(source.candidateReleaseId,'2026-10-28-ap23m3-candidate.1');assert.equal(source.comparedReleaseId,'2026-10-18-mvp-09-approved.1');
 for(const[k,v]of Object.entries({candidateManifest:258,priorManifest:128,allCanonicalSourceIds:380,priorReviewedSources:251,newCanonicalSourceIds:129,newRuntimeSourceDefinitions:130,existingCanonicalIdsNewlyDefinedAtRuntime:1,referenceGraphEdges:5045,previousReferenceGraphEdges:2136,retainedReferenceGraphEdges:2136,addedReferenceGraphEdges:2909,changedPriorEdges:0,removedPriorEdges:0,historicalProvenanceEdges:713,boundHistoricalEvidenceFiles:1223,boundHistoricalEvidenceBytes:431105954,plannedOwnerLots:12,freshOfficialChecks:0}))assert.equal(source.counts[k],v,k);
 assert.deepEqual(source.counts.referenceUses,{'positive-or-shared-reference':266,'exclusion-only':4,'supporting-or-monitoring-unreferenced':110});
 assert.equal(source.rows.length,380);assert.equal(new Set(source.rows.map(r=>r.sourceId)).size,380);
 assert.equal(source.reviewLots.length,12);assert.equal(new Set(source.reviewLots.map(r=>r.id)).size,12);
 assert.deepEqual(Object.fromEntries(source.reviewLots.map(r=>[r.id,r.count])),{'R10-A2-BASELINE':77,'R10-A2-CALENDAR-ACTIVATION':73,'R10-A2-CALENDAR-CATALOG':82,'R10-A2-ADMIN-PRIOR':19,'R10-A2-AP23F1':15,'R10-A2-AP23G1':11,'R10-A2-AP23H1':10,'R10-A2-AP23I1':11,'R10-A2-AP23J1':19,'R10-A2-AP23K1':27,'R10-A2-AP23L1':17,'R10-A2-AP23M1':19});
 const owned=source.reviewLots.flatMap(r=>r.sourceIds);assert.equal(owned.length,380);assert.equal(new Set(owned).size,380);assert.deepEqual([...owned].sort(),source.rows.map(r=>r.sourceId).sort());
 for(const lot of source.reviewLots){assert.equal(lot.status,'planned-not-reviewed');assert.equal(lot.count,lot.sourceIds.length);assert.equal(lot.freshLegalReviewPerformed,false);assert.equal(lot.sourceReleaseApproved,false);}
 for(const row of source.rows){assert.equal(row.humanApproval,false);assert.equal(row.sourceReleaseApproved,false);assert.equal(row.freshLegalReviewStatus,'pending');assert.deepEqual(row.freshEvidence,[]);assert.equal(source.reviewLots.find(r=>r.id===row.ownerLotId)?.sourceIds.includes(row.sourceId),true);}
 assert.deepEqual(source.groups.existingSourceIdsWithNewUses,['SRC-BUNDESFEIERTAG-19940701','SRC-ZH-RLG-8224-N045']);
 assert.equal(coverage.workPackage,'R10-A1');assert.equal(coverage.status,'local-coverage-inventory-verified');assert.equal(coverage.localOnly,true);
 for(const k of ['sourceReleaseApproved','humanAcceptance','newLegalReviewPerformed','calculationPerformed','operatingChanges'])assert.equal(coverage[k],false,k);
 assert.equal(coverage.newOnlineFetches,0);assert.equal(coverage.candidate.releaseId,source.candidateReleaseId);assert.equal(coverage.operatingBaseline.releaseId,source.comparedReleaseId);
 for(const[k,v]of Object.entries({allCantons:26,operatingBaselineCantons:6,localOnlyAcceptedCantons:20,administrativePaths:245,operatingBaselineAdministrativePaths:25,newAdministrativePaths:220,calendars:35,baselineCalendars:32,baseHolidayRules:479,proceduralSupplementRules:20,totalHolidayRules:499,baselineBaseHolidayRules:479,baselineProceduralSupplementRules:12,baselineTotalHolidayRules:491,bernProfileRules:9,socialRules:44,bernSocialBindings:50,candidateFiles:45,baselineFiles:42}))assert.equal(coverage.counts[k],v,k);
 assert.equal(coverage.paths.length,245);assert.equal(coverage.cantons.length,26);for(const v of Object.values(coverage.preserved))assert.equal(v,true,'Preserved meaning');return true;
}
export const completionFlags=['humanAcceptance','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','r10A2Performed'];
export function metadataFromEvidence(e){return{
 workPackage:'R10-A1',asOf:'2026-10-28',status:'local-inventory-and-review-plan-verified',head:e.preflight.head,localOnly:true,u1HumanAcceptance:true,
 scope:'Common accepted canton inventory and source review plan only.',
 candidateReleaseId:e.source.candidateReleaseId,operatingBaseline:e.source.comparedReleaseId,
 counts:{cantons:e.coverage.counts.allCantons,administrativePaths:e.coverage.counts.administrativePaths,newAdministrativePaths:e.coverage.counts.newAdministrativePaths,sources:e.source.counts.allCanonicalSourceIds,newSources:e.source.counts.newCanonicalSourceIds,sourceUses:e.source.counts.referenceGraphEdges,newSourceUses:e.source.counts.addedReferenceGraphEdges,existingEvidenceFiles:e.source.counts.boundHistoricalEvidenceFiles,reviewLots:e.source.reviewLots.length},
 preflightCounts:e.preflightCounts,governanceCounts:e.supplementary.steps.find(r=>r.id==='governance').counts,protectedFiles:e.preservation.protectedFilesVerified,
 productChanged:false,legalDataChanged:false,schemasChanged:false,packageChanged:false,historicalEvidenceChanged:false,freshOnlineRetrievals:0,newSubstantiveSourceReviews:0,
 ...Object.fromEntries(completionFlags.map(k=>[k,false])),
 nextGate:'Confirm A1 review plan and separately instruct R10-A2 content/version review. No approval, promotion, build, commit, push, upload, installation or operation change.'
};}
export function validateMetadata(saved,e){const expected=metadataFromEvidence(e);for(const[k,v]of Object.entries(expected))assert.deepEqual(saved[k],v,k);
 assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length);assert.equal(new Set(saved.bindings.map(r=>r.path)).size,saved.bindings.length);
 for(const row of saved.bindings){safe(row.path);assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);assert.match(row.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);}
 assert.deepEqual(Object.keys(saved).sort(),[...Object.keys(expected),'localLinksChecked','bindings'].sort());return true;}
async function toolInputs(){const p=[];for(const dir of ['scripts','tests/governance'])p.push(...(await walk(root,dir)).filter(path=>path.split('/').at(-1).includes('r10-a1')));return[...new Set(p)].sort();}
export async function supplementaryPlan(){const tests=(await readdir(resolve(root,'tests/governance'))).filter(n=>/^r10-a1[^/]+\.test\.mjs$/u.test(n)).sort().map(n=>'tests/governance/'+n);assert.ok(tests.length>=3);return[
 ['governance',process.execPath,['--import','tsx','--test',...tests]],
 ['source-inventory',process.execPath,['scripts/inventory-r10-a1-sources.mjs','--check']],
 ['coverage-inventory',process.execPath,['scripts/inventory-r10-a1-coverage.mjs','--check']],
 ['whitespace','git',['diff','--check']]
 ];}
async function runSupplementary(){const paths=await toolInputs(),before=await Promise.all(paths.map(p=>bind(root,p))),steps=[];for(const[id,cmd,args]of await supplementaryPlan()){
 const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}}),text=(r.stdout??'')+(r.stderr??''),path=out+'/'+id+'.txt';await writeFile(resolve(root,path),text);
 const step={id,args,exitCode:r.status,counts:tapCounts(text),log:await bind(root,path)};steps.push(step);console.log(JSON.stringify(step));assert.equal(r.status,0,text);if(Object.hasOwn(step.counts,'tests'))passed(step.counts);
 }const after=await Promise.all(paths.map(p=>bind(root,p)));assert.deepEqual(before,after,'Supplementary tool inputs changed');const report={workPackage:'R10-A1',status:'passed',localOnly:true,steps,inputsBefore:before,inputsAfter:after};await writeFile(resolve(root,out+'/supplementary.json'),JSON.stringify(report,null,2)+'\n');}
export async function collectEvidence(){const preservation=await checkPreservation(),preflight=await json(out+'/preflight.json'),supplementary=await json(out+'/supplementary.json'),source=await json(completionConfig.source),coverage=await json(completionConfig.coverage);
 validateInventories(source,coverage);assert.equal(preflight.workPackage,'R10-A1');assert.equal(preflight.status,'passed');assert.equal(preflight.head,preservation.head);assert.equal(preflight.localOnly,true);
 for(const k of ['freshOnlineRetrievals','substantiveSourceReviewsPerformed'])assert.equal(preflight[k],0,k);for(const k of ['humanAcceptance','sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges'])assert.equal(preflight[k],false,k);
 const plan=await buildPlan();assert.deepEqual(preflight.steps.map(r=>r.id),plan.map(r=>r[0]));const preflightCounts={};
 for(const step of preflight.steps){assert.equal(step.exitCode,0);assert.deepEqual(step.args,plan.find(r=>r[0]===step.id)[1]);assert.deepEqual(await bind(root,step.log.path),step.log);if(Object.hasOwn(step.counts,'tests')){passed(step.counts);assert.deepEqual(tapCounts((await readFile(resolve(root,step.log.path))).toString()),step.counts);preflightCounts[step.id]=step.counts.tests;}}
 assert.equal(preflightCounts['product-regression'],4006);assert.equal(preflightCounts['host-lifecycle'],90);assert.equal(preflight.legacyComparisons,1584);preflightCounts.legacyComparisons=preflight.legacyComparisons;
 assert.deepEqual(preflight.runnerInputsBefore,preflight.runnerInputsAfter);await verify(preflight.runnerInputsAfter,'Preflight runner');
 assert.equal(supplementary.workPackage,'R10-A1');assert.equal(supplementary.status,'passed');assert.equal(supplementary.localOnly,true);assert.deepEqual(supplementary.inputsBefore,supplementary.inputsAfter);assert.deepEqual(supplementary.inputsAfter.map(r=>r.path),await toolInputs());await verify(supplementary.inputsAfter,'Supplementary source');
 const extra=await supplementaryPlan();assert.deepEqual(supplementary.steps.map(r=>r.id),extra.map(r=>r[0]));for(const step of supplementary.steps){assert.equal(step.exitCode,0);assert.deepEqual(step.args,extra.find(r=>r[0]===step.id)[2]);assert.deepEqual(await bind(root,step.log.path),step.log);if(Object.hasOwn(step.counts,'tests')){passed(step.counts);assert.deepEqual(tapCounts((await readFile(resolve(root,step.log.path))).toString()),step.counts);}}
 await verify(source.evidenceBindings,'Source inventory input');await verify(coverage.bindings,'Coverage input');
 return{preservation,preflight,supplementary,source,coverage,preflightCounts};}
async function inventory(e){return[...new Set([...completionConfig.docs,...completionConfig.living,...await toolInputs(),preparationConfig.guard,preparationConfig.u1Receipt,preparationConfig.u1Proof,
 ...(await walk(root,out)).filter(p=>p!==proof),...e.source.evidenceBindings.map(r=>r.path),...e.coverage.bindings.map(r=>r.path)])].sort();}
export async function finalize(mode){assert.ok(['--write','--check'].includes(mode));if(mode==='--write')await runSupplementary();const e=await collectEvidence(),paths=await inventory(e);
 if(mode==='--check'){const saved=await json(proof);validateMetadata(saved,e);assert.deepEqual(saved.bindings.map(r=>r.path),paths);await verify(saved.bindings,'Final A1 byte');return{status:'a1-bound-result-reverified',bindings:saved.bindings.length,operatingChanges:false};}
 let localLinksChecked=0;for(const p of [...completionConfig.docs,...completionConfig.living])for(const m of(await readFile(resolve(root,p),'utf8')).matchAll(/\]\(([^)]+)\)/gu)){const target=m[1].replace(/^<|>$/gu,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;const abs=resolve(root,dirname(p),decodeURIComponent(target));if(abs!==resolve(root,proof))await access(abs);localLinksChecked++;}
 const report={...metadataFromEvidence(e),localLinksChecked,bindings:await Promise.all(paths.map(p=>bind(root,p)))};validateMetadata(report,e);await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');await verify(report.bindings,'A1 readback');return{status:report.status,bindings:report.bindings.length,counts:report.counts,preflightCounts:report.preflightCounts,governance:report.governanceCounts,sourceReleaseApproved:false,operatingChanges:false};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await finalize(process.argv[2]),null,2));

