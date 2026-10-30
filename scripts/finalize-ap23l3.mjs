// SPDX-License-Identifier: AGPL-3.0-only
// Bind actual local source, web, native and package evidence. Never human approval.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPlan,tapCounts,assertPassedCounts} from './check-ap23l3.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const completionConfig=Object.freeze({out:'outputs/ap23l3-2026-10-27',proof:'outputs/ap23l3-2026-10-27/local-completion.json',
 candidate:'data/candidates/2026-10-27-ap23l3',browser:'outputs/ap23l3-2026-10-27/browser-verification.json',
 exported:'outputs/ap23l3-2026-10-27/calendar-export-verification.json',
 documents:['docs/fachrecht/abnahme-ap23l2.md','docs/entscheidungen/DEC-2026-041-beschluss.md','docs/architektur/verwaltungsintegration-ap23l3.md'],
 living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/schweizausbau-nach-mvp09.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md']});
const{out,proof}=completionConfig;
const raw=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await raw(path));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!path.includes('\\')&&!path.includes('\0')&&path.split('/').every(part=>part&&part!=='.'&&part!=='..'),'Closed evidence path '+path);return path;}
const bind=async path=>{safe(path);const bytes=await raw(path);return{path,byteLength:bytes.length,sha256:sha(bytes)};};
export const completionFlags=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease','operatingChanges'];
const sourceDirs=['src/core','src/ui','src/release','src/public-app','schemas','public-app'];
const testDirs=['tests/core','tests/ui','tests/hosts','tests/public-app','tests/data','tests/governance'];
const copiedDirs=['spfx/src','spfx/scripts','spfx/config','spfx/test','spfx/test-build'];
const extensions=/\.(?:ts|tsx|json|css|scss|mjs|cjs|html|svg|txt|py)$/u;
async function tree(path){const files=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
 const next=path+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink '+next);if(item.isDirectory())files.push(...await tree(next));else{assert.ok(item.isFile());files.push(next);}}
 return files.sort();}
async function verifyInputs(rows,label){assert.ok(Array.isArray(rows)&&rows.length>0,label);assert.equal(new Set(rows.map(row=>row.path)).size,rows.length,label+' unique inputs');for(const row of rows)assert.deepEqual(await bind(row.path),row,label+' '+row.path);}
async function copiedFiles(){const files=(await readdir(resolve(root,'spfx'),{withFileTypes:true})).filter(item=>item.isFile()).map(item=>'spfx/'+item.name);for(const path of copiedDirs)files.push(...await tree(path));return[...new Set(files)].sort();}
async function verifyStage(spfx){
 assert.match(spfx.stage,/^\.work\/ap23l3-spfx-build-[A-Za-z0-9]{6}$/u);const verified=[];
 for(const directory of copiedDirs)assert.deepEqual((await tree(spfx.stage+'/'+directory)).map(path=>path.slice(spfx.stage.length+1)),await tree(directory),'Stage inventory '+directory);
 for(const path of await copiedFiles()){const source=await bind(path),stage=await bind(spfx.stage+'/'+path);assert.equal(source.sha256,stage.sha256,'Actual compiled source '+path);assert.equal(source.byteLength,stage.byteLength);verified.push({source,stage});}
 assert.deepEqual(await bind(spfx.testPackage.path),spfx.testPackage);assert.deepEqual(await json(spfx.stage+'/verification.json'),spfx);
 const sourceTests=(await readdir(resolve(root,'spfx/test'))).filter(name=>name.endsWith('.test.ts')).sort().map(name=>'test/'+name);
 const historicalTests=(await readdir(resolve(root,'spfx/test-build'))).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>'test-build/'+name);
 assert.deepEqual(spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts')),sourceTests,'Complete SPFx source test inventory');
 assert.deepEqual(spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs')),historicalTests,'Complete historical package test inventory');
 for(const step of spfx.steps){assert.equal(step.exitCode,0);assert.deepEqual(await bind(step.log),{path:step.log,byteLength:step.byteLength,sha256:step.sha256});}
 const sourceCounts=tapCounts((await raw(spfx.steps[2].log)).toString()),historicalCounts=tapCounts((await raw(spfx.steps[6].log)).toString());
 assertPassedCounts(sourceCounts,'SPFx source');assertPassedCounts(historicalCounts,'Historical package');
 assert.deepEqual(spfx.protectedBefore,spfx.protectedAfter);await verifyInputs(spfx.protectedAfter,'Operating paths');
 return{verified,sourceTestFiles:sourceTests.length,historicalTestFiles:historicalTests.length,sourceCounts,historicalCounts};
}
export async function collectEvidence(){
 const qa=await json(out+'/QA-AP23L3.json'),spfx=await json(out+'/spfx-build.json'),web=await json(out+'/web-build.json'),packaged=await json(out+'/actual-package.json');
 for(const[name,report]of Object.entries({qa,spfx,web,packaged}))assert.equal(report.status,'passed',name);
 assert.equal(qa.workPackage,'AP23L3');assert.equal(qa.localOnly,true);for(const flag of['sourceReleaseApproved','installationPerformed','githubPushPerformed'])assert.equal(qa[flag],false);
 const plan=await buildPlan();assert.deepEqual(qa.steps.map(step=>step.id),plan.map(row=>row[0]));const qaCounts={};
 for(const step of qa.steps){assert.equal(step.exitCode,0,step.id);assert.deepEqual(await bind(step.log),{path:step.log,byteLength:step.byteLength,sha256:step.sha256});
  assert.deepEqual(step.args,plan.find(row=>row[0]===step.id)[2]);
  if(Object.hasOwn(step.counts,'tests')){assertPassedCounts(step.counts,step.id);assert.deepEqual(tapCounts((await raw(step.log)).toString()),step.counts);qaCounts[step.id]=step.counts.tests;}}
 for(const key of['product-regression','host-lifecycle','actual-web-bundle','governance'])assert.ok(qaCounts[key]>0,key);
 assert.equal(spfx.localOnly,true);assert.equal(spfx.deployable,false);assert.equal(spfx.operatingPackagePreserved,true);assert.equal(web.deployable,false);assert.equal(web.localOnly,true);
 const stage=await verifyStage(spfx);assertPassedCounts(packaged.counts,'Actual packaged UI');assert.deepEqual(packaged.package,spfx.testPackage);
 assert.equal(packaged.typecheckExitCode,0);assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);
 const packLog=await raw(packaged.log);assert.equal(sha(packLog),packaged.sha256);assert.deepEqual(tapCounts(packLog.toString()),packaged.counts);
 const bundle=await json(out+'/bundle-integrity.json');assert.equal(bundle.contractStatus,'approved');assert.equal(bundle.referenceOnly,true);assert.equal(bundle.sourceReleaseApproved,false);
 for(const[key,value]of Object.entries({administrativePaths:196,preservedAdministrativePaths:165,newAdministrativePaths:31,calendars:35,totalHolidayRules:499,newHolidayRules:0,proceduralSupplementDates:2,preservedSocialRules:44,preservedBernSocialBindings:50}))assert.equal(bundle.counts[key],value,key);
 assert.deepEqual(await bind(bundle.manifest.path),bundle.manifest);await verifyInputs(bundle.artifacts,'Candidate artifact');assert.equal((await tree(completionConfig.candidate)).length,bundle.counts.totalFilesIncludingManifest);
 await verifyInputs(web.artifacts,'Actual static build');assert.deepEqual(web.protectedBefore,web.protectedAfter);await verifyInputs(web.protectedAfter,'Static preserved source');
 const native=await json(out+'/native-reference-verification.json'),independent=await json(out+'/independent-verification.json'),inherited=await json(out+'/inherited-reference-verification.json');
 assert.equal(native.status,'passed-native-reference-only');assert.equal(native.nativeFormat,'16.0.0');assert.equal(native.referenceOnly,true);assert.equal(native.operatingApproval,false);
 const suite=await json('docs/fachrecht/ap23l1/referenzfaelle.json');assert.equal(native.results.length,suite.cases.length);assert.equal(native.consumerCases,native.results.length);assert.equal(native.syntheticCases,native.syntheticResults.length);assert.equal(native.oldNativeCases,native.oldResults.length);
 assert.equal(native.oldResults.length,bundle.counts.preservedAdministrativePaths);
 for(const row of[...native.results,...native.syntheticResults]){assert.equal(row.native.calendarExportAllowed,false);assert.equal(row.actual.exportAllowed,false);assert.equal(row.native.outcome==='calculated',row.actual.outcome==='datedResearchValue');if(row.native.outcome==='calculated')assert.equal(row.native.referenceOnly,true);else assert.equal(Object.hasOwn(row.native,'finalEnd'),false);}
 for(const row of native.oldResults){assert.equal(row.mathematicalFieldsEqual,true);for(const key of native.mathematicalFields)assert.deepEqual(row.native[key],row.prior[key]);assert.equal(row.native.calendarExportAllowed,false);}
 await verifyInputs(native.evidence,'Native input');await verifyInputs(inherited.evidence,'Inherited input');
 assert.equal(inherited.status,'passed-inherited-reference-cases');assert.equal(inherited.referenceCases,inherited.results.length);assert.ok(inherited.referenceCases>0);
 assert.equal(independent.status,'passed');assert.equal(independent.nodeComparison.matchedFixtures,native.consumerCases);assert.equal(independent.nodeComparison.syntheticProbeComparisons.length,native.syntheticCases);
 assert.equal(independent.counts.originalReferences,independent.results.length);assert.equal(independent.results.length,native.consumerCases);
 assert.equal(independent.counts.independentProbes,independent.independentProbeResults.length);assert.equal(independent.counts.physicalCalendarProbes,independent.physicalCalendarProbeResults.length);
 assert.equal(independent.counts.mutationSensitivities,independent.mutationSensitivity.length);
 assert.deepEqual(independent.results.map(row=>row.id).sort(),native.results.map(row=>row.id).sort());
 for(const row of[...independent.results,...independent.independentProbeResults])assert.equal(row.actual.calendarExport,false);
 assert.equal(independent.nodeComparison.oldNativeMathematicalComparisons,native.oldNativeCases);assert.equal(independent.nodeComparison.inheritedReferenceComparisons,inherited.referenceCases);
 assert.deepEqual(independent.nodeComparison.evidence,await bind(out+'/native-reference-verification.json'));assert.deepEqual(independent.nodeComparison.inheritedEvidence,await bind(out+'/inherited-reference-verification.json'));
 for(const row of[independent.binding.guard,independent.binding.manifest,independent.binding.catalog,independent.binding.suite,independent.binding.inputVocabularySchema,independent.nodeComparison.acceptedInheritedEvidence])assert.deepEqual(await bind(row.path),row);
 await verifyInputs(independent.binding.sourceEvidence,'Independent source evidence');
 for(const key of['importsProductCode','importsNodeCode','importsResearchOracle','usesResearchCalendarOrPathModel','annotationRemoval','implicitCaseFacts'])assert.equal(independent[key],false);
 for(const report of[native,independent,inherited])for(const flag of['sourceReleaseApproved','calendarExportEnabled'])assert.equal(report[flag],false);
 const exported=await json(completionConfig.exported),browser=await json(completionConfig.browser);
 assert.equal(exported.status,'passed');assert.equal(exported.actualIcsFilesSaved,0);assert.equal(exported.outlookImports,0);assert.equal(exported.humanReleaseApproval,false);await verifyInputs(exported.bindings,'Calendar export evidence');
 const positive=native.results.filter(row=>row.native.outcome==='calculated'),blocked=native.results.filter(row=>row.native.outcome==='blocked');
 assert.equal(exported.qualifiedCases,positive.length);assert.equal(exported.cases.length,positive.length);assert.equal(exported.qualifiedPaths,new Set(positive.map(row=>row.input.selection.pathId)).size);
 assert.deepEqual(exported.languages,['de','fr']);assert.equal(exported.syntheticInMemoryArtifacts,exported.cases.length*exported.languages.length);
 assert.equal(exported.blockedCasesDenied,blocked.length);assert.equal(exported.blockedCases.length,blocked.length);
 assert.deepEqual(exported.cases.map(row=>row.id).sort(),positive.map(row=>row.id).sort());assert.deepEqual(exported.blockedCases.map(row=>row.id).sort(),blocked.map(row=>row.id).sort());
 for(const row of exported.cases){const original=positive.find(item=>item.id===row.id);assert.deepEqual(row.input,original.input);assert.equal(row.finalEnd,original.native.finalEnd);}
 assert.equal(exported.changedFactsDenied,exported.cases.reduce((sum,row)=>sum+Object.keys(row.input.caseQualification).length,0));
 for(const key of['referenceExportsDenied','changedDurationsDenied','contextClonesDenied','changedDatesDenied','directCoreResultsDenied'])assert.equal(exported[key],exported.cases.length,key);
 assert.equal(exported.resultClonesDenied,exported.cases.length*3);
 for(const key of['sourceReleaseApproved','operatingChanges'])assert.equal(exported[key],false);
 assert.equal(browser.status,'passed');assert.equal(browser.realDeviceOrM365Test,false);assert.equal(browser.sourceReleaseApproved,false);await verifyInputs(browser.evidence,'Actual browser evidence');
 const preservation=await json(out+'/preservation-verification.json');assert.equal(preservation.protectedFilesVerified,9130);assert.equal(preservation.intendedMutableInputs.length,147);assert.equal(preservation.acceptedL2Archive.files,137);assert.equal(preservation.stylesheetChanged,false);
 return{qa,spfx,web,packaged,bundle,native,independent,inherited,exported,browser,preservation,stage,qaCounts};
}
async function requiredInventory(e){
 const scripts=(await readdir(resolve(root,'scripts'))).filter(name=>/ap23l[23]/u.test(name)).map(name=>'scripts/'+name);
 const paths=[...completionConfig.documents,...completionConfig.living,...scripts,'package.json','package-lock.json','tsconfig.json','scripts/build-public-app.mjs',
  'scripts/public-app-server.mjs','scripts/browser-globals-plugin.mjs','scripts/run-standard-tests.mjs','public-app/.htaccess','outputs/ap23l2-abnahme-2026-10-27/receipt.json'];
 for(const directory of[...sourceDirs,...testDirs])paths.push(...(await tree(directory)).filter(path=>extensions.test(path)));
 for(const path of await copiedFiles())paths.push(path,e.spfx.stage+'/'+path);
 paths.push(...await tree(completionConfig.candidate),...(await tree(out)).filter(path=>path!==proof),e.spfx.testPackage.path,e.spfx.stage+'/verification.json',
  ...e.spfx.steps.map(step=>step.log),...e.web.artifacts.map(row=>row.path),...e.native.evidence.map(row=>row.path),...e.inherited.evidence.map(row=>row.path),
  ...e.exported.bindings.map(row=>row.path),...e.browser.evidence.map(row=>row.path),...e.independent.binding.sourceEvidence.map(row=>row.path),e.independent.nodeComparison.acceptedInheritedEvidence.path);
 return[...new Set(paths)].sort();
}
export function metadataFromEvidence(e){return structuredClone({
 workPackage:'AP23L3',asOf:'2026-10-27',status:'local-technical-verification-passed-awaiting-human-acceptance',head:e.qa.head,
 l2TechnicallyAccepted:true,contractDecision:{id:'DEC-2026-041',status:'approved',on:'2026-10-27'},formats:{manifest:'16.0.0',minimumConsumer:'16.0.0',administrativeCatalog:'9.0.0'},
 counts:e.bundle.counts,protectedFiles:9130,mutableSourceBoundary:147,
 nativeCounts:{consumerReferences:e.native.consumerCases,syntheticCases:e.native.syntheticCases,oldNativeReferences:e.native.oldNativeCases,consumerOutcomes:e.native.consumerOutcomes},
 independentCounts:e.independent.counts,inheritedReferenceCases:e.inherited.referenceCases,qaCounts:e.qaCounts,
 exportCounts:Object.fromEntries(['qualifiedPaths','qualifiedCases','syntheticInMemoryArtifacts','referenceExportsDenied','blockedCasesDenied','changedFactsDenied',
  'changedDurationsDenied','resultClonesDenied','contextClonesDenied','changedDatesDenied','directCoreResultsDenied'].map(key=>[key,e.exported[key]])),
 hostCounts:{sourceTestFiles:e.stage.sourceTestFiles,historicalTestFiles:e.stage.historicalTestFiles,copiedSourceInputs:e.stage.verified.length,
  sourceTests:e.stage.sourceCounts.tests,historicalPackageTests:e.stage.historicalCounts.tests,actualPackageTests:e.packaged.counts.tests},
 candidateManifest:e.bundle.manifest,actualPackage:e.spfx.testPackage,operatingPackagePreserved:true,
 ...Object.fromEntries(completionFlags.map(key=>[key,false])),
 nextGate:'Human professional and technical AP23L3 acceptance. Source release, publication, installation and operation remain separate.'
});}
export function validateCompletionMetadata(saved,e){
 const expected=metadataFromEvidence(e);for(const[key,value]of Object.entries(expected))assert.deepEqual(saved[key],value,key);
 assert.match(saved.head,/^[a-f0-9]{40}$/u);assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);
 assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length>0);assert.equal(new Set(saved.bindings.map(row=>row.path)).size,saved.bindings.length);
 for(const row of saved.bindings){safe(row.path);assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);assert.match(row.sha256,/^[a-f0-9]{64}$/u);}
 assert.deepEqual(Object.keys(saved).sort(),[...Object.keys(expected),'localLinksChecked','bindings'].sort(),'Closed final metadata');return true;
}
export async function finalize(mode){
 assert.ok(mode==='--write'||mode==='--check');const fresh=spawnSync(process.execPath,['scripts/check-ap23l3-preservation.mjs'],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(fresh.status,0,fresh.stdout+fresh.stderr);
 const e=await collectEvidence();
 if(mode==='--check'){const saved=await json(proof);validateCompletionMetadata(saved,e);assert.deepEqual(saved.bindings.map(row=>row.path),await requiredInventory(e),'Exact closed final inventory');for(const row of saved.bindings)assert.deepEqual(await bind(row.path),row,'Final bound byte '+row.path);
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),saved.head);return{status:'bound-L3-result-reverified',bindings:saved.bindings.length,humanAcceptance:false,operatingChanges:false};}
 let localLinksChecked=0;for(const path of[...completionConfig.documents,...completionConfig.living])for(const match of(await raw(path)).toString().matchAll(/\]\(([^)]+)\)/g)){
  const target=match[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;const absolute=resolve(root,dirname(path),decodeURIComponent(target));if(absolute!==resolve(root,proof))await access(absolute);localLinksChecked++;}
 const bindings=await Promise.all((await requiredInventory(e)).map(bind)),report={...metadataFromEvidence(e),localLinksChecked,bindings};validateCompletionMetadata(report,e);
 await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final L3 readback '+row.path);return{...report,bindings:bindings.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await finalize(process.argv[2]),null,2));
