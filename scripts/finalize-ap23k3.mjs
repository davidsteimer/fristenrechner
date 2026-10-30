// SPDX-License-Identifier: AGPL-3.0-only
// Bind actual local source, web bytes and package evidence, never human approval.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23k3-2026-10-27',proof=out+'/local-completion.json';
const raw=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await raw(path));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await raw(path);return {path,byteLength:bytes.length,sha256:sha(bytes)};};
async function verifyInputs(rows,label){assert.ok(Array.isArray(rows)&&rows.length>0,label);assert.equal(new Set(rows.map(row=>row.path)).size,rows.length,label+' unique paths');
 for(const row of rows)assert.deepEqual(await bind(row.path),row,label+' '+row.path);}
const flags=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease','operatingChanges'];
const documents=['docs/fachrecht/abnahme-ap23k2.md','docs/entscheidungen/DEC-2026-040-beschluss.md','docs/architektur/verwaltungsintegration-ap23k3.md'];
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
 'docs/planung/schweizausbau-nach-mvp09.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md'];
const sourceDirs=['src/core','src/ui','src/release','src/public-app','schemas','public-app'];
const testDirs=['tests/core','tests/ui','tests/hosts','tests/public-app','tests/data','tests/governance'];
const copiedDirs=['spfx/src','spfx/scripts','spfx/config','spfx/test','spfx/test-build'];
const extensions=/\.(?:ts|tsx|json|css|scss|mjs|cjs|html|svg|txt|py)$/u;
async function tree(path){const files=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
 const next=path+'/'+item.name;assert.ok(!item.isSymbolicLink(),'Symlink '+next);if(item.isDirectory())files.push(...await tree(next));else{assert.ok(item.isFile());files.push(next);}
}return files.sort();}
async function copiedFiles(){const files=(await readdir(resolve(root,'spfx'),{withFileTypes:true})).filter(row=>row.isFile()).map(row=>'spfx/'+row.name);
 for(const dir of copiedDirs)files.push(...await tree(dir));return [...new Set(files)].sort();}
function tapCounts(text){return Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));}
function passed(value,label){assert.ok(value.tests>0,label);assert.equal(value.pass,value.tests,label);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(value[key],0,label+' '+key);}
async function requiredInventory(spfx,web){
 const scripts=(await readdir(resolve(root,'scripts'))).filter(name=>/ap23k[23]/u.test(name)).map(name=>'scripts/'+name);
 const paths=[...documents,...living,...scripts,'package.json','package-lock.json','tsconfig.json','scripts/build-public-app.mjs','scripts/public-app-server.mjs',
  'scripts/browser-globals-plugin.mjs','public-app/.htaccess',
  'scripts/run-standard-tests.mjs','outputs/ap23k2-abnahme-2026-10-27/receipt.json'];
 for(const dir of [...sourceDirs,...testDirs])paths.push(...(await tree(dir)).filter(path=>extensions.test(path)));
 for(const path of await copiedFiles())paths.push(path,spfx.stage+'/'+path);
 paths.push(...await tree('data/candidates/2026-10-27-ap23k3'),...(await tree(out)).filter(path=>path!==proof),spfx.testPackage.path,
  spfx.stage+'/verification.json',...spfx.steps.map(step=>step.log),...web.artifacts.map(row=>row.path));
 for(const [report,key] of [['native-reference-verification','evidence'],['inherited-reference-verification','evidence'],['independent-verification','inputs'],['export-verification','bindings'],['browser-verification','evidence']]){
  paths.push(...(await json(out+'/'+report+'.json'))[key].map(row=>row.path));
 }
 const negative=await json(out+'/trace-text-negative-control.json');paths.push(negative.oldPackage.path,negative.test.path);
 return [...new Set(paths)].sort();
}
async function verifyStage(spfx){
 const verified=[];
 for(const dir of copiedDirs)assert.deepEqual((await tree(spfx.stage+'/'+dir)).map(path=>path.slice(spfx.stage.length+1)),await tree(dir),'Stage inventory '+dir);
 for(const path of await copiedFiles()){const current=await bind(path),staged=await bind(spfx.stage+'/'+path);assert.equal(current.sha256,staged.sha256,'Actual compiled source '+path);
  assert.equal(current.byteLength,staged.byteLength);verified.push({source:current,stage:staged});}
 assert.deepEqual(await bind(spfx.testPackage.path),spfx.testPackage,'Actual SPPKG bytes');
 assert.deepEqual(await json(spfx.stage+'/verification.json'),spfx,'Actual SPFx stage report');
 const sourceTests=(await readdir(resolve(root,'spfx/test'))).filter(name=>name.endsWith('.test.ts')).sort().map(name=>'test/'+name);
 const historicalTests=(await readdir(resolve(root,'spfx/test-build'))).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>'test-build/'+name);
 assert.deepEqual(spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts')),sourceTests,'Complete source test inventory');
 assert.deepEqual(spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs')),historicalTests,'Complete historical package test inventory');
 for(const step of spfx.steps){assert.equal(step.exitCode,0);assert.deepEqual(await bind(step.log),{path:step.log,byteLength:step.byteLength,sha256:step.sha256});}
 for(const index of [2,6]){assert.ok(spfx.steps[index].args.includes('--test-timeout=240000'));passed(tapCounts((await raw(spfx.steps[index].log)).toString()),'SPFx '+index);}
 assert.deepEqual(spfx.protectedBefore,spfx.protectedAfter);for(const row of spfx.protectedAfter)assert.deepEqual(await bind(row.path),row,'Operating path '+row.path);
 return {verified,sourceTestFiles:sourceTests.length,historicalTestFiles:historicalTests.length};
}
async function collectEvidence(){
 const qa=await json(out+'/QA-AP23K3.json'),spfx=await json(out+'/spfx-build.json'),web=await json(out+'/web-build.json'),packaged=await json(out+'/actual-package.json');
 for(const [name,report] of Object.entries({qa,spfx,web,packaged}))assert.equal(report.status,'passed',name);
 assert.equal(qa.workPackage,'AP23K3');assert.equal(qa.steps.length,16);const stepCounts={};
 for(const step of qa.steps){assert.equal(step.exitCode,0,step.id);assert.deepEqual(await bind(step.log),{path:step.log,byteLength:step.byteLength,sha256:step.sha256},step.id);
  if(Object.hasOwn(step.counts,'tests')){passed(step.counts,step.id);assert.deepEqual(tapCounts((await raw(step.log)).toString()),step.counts);stepCounts[step.id]=step.counts.tests;}}
 for(const name of ['product-regression','host-lifecycle','actual-web-bundle','governance'])assert.ok(stepCounts[name]>0,name);
 assert.equal(spfx.localOnly,true);assert.equal(spfx.deployable,false);assert.equal(spfx.operatingPackagePreserved,true);assert.equal(web.deployable,false);
 const stage=await verifyStage(spfx);passed(packaged.counts,'Actual packaged UI');assert.deepEqual(packaged.package,spfx.testPackage);
 assert.equal(packaged.typecheckExitCode,0);assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);
 const packLog=await raw(packaged.log);assert.equal(sha(packLog),packaged.sha256);assert.deepEqual(tapCounts(packLog.toString()),packaged.counts);
 const bundle=await json(out+'/bundle-integrity.json');assert.equal(bundle.contractStatus,'approved');assert.equal(bundle.referenceOnly,true);assert.equal(bundle.sourceReleaseApproved,false);
 assert.equal(bundle.counts.administrativePaths,165);assert.equal(bundle.counts.preservedAdministrativePaths,149);assert.equal(bundle.counts.newAdministrativePaths,16);
 assert.equal(bundle.counts.rawUnchangedFromJ3,42);assert.equal(bundle.counts.calendars,35);assert.equal(bundle.counts.totalHolidayRules,499);
 assert.equal(bundle.counts.preservedSocialRules,44);assert.equal(bundle.counts.preservedBernSocialBindings,50);
 assert.deepEqual(await bind(bundle.manifest.path),bundle.manifest);for(const row of bundle.artifacts)assert.deepEqual(await bind(row.path),row);
 assert.equal((await tree('data/candidates/2026-10-27-ap23k3')).length,45);for(const row of web.artifacts)assert.deepEqual(await bind(row.path),row);
 const native=await json(out+'/native-reference-verification.json'),independent=await json(out+'/independent-verification.json'),inherited=await json(out+'/inherited-reference-verification.json');
 assert.equal(native.status,'passed-native-reference-only');assert.equal(native.consumerCases,65);assert.equal(native.syntheticCases,46);assert.equal(native.oldNativeCases,149);
 assert.equal(native.diagnosticWorldCases,2);assert.equal(native.calendarExportEnabled,false);
 await verifyInputs(native.evidence,'Native input');assert.equal(native.sourceReleaseApproved,false);assert.equal(native.operatingApproval,false);
 assert.deepEqual(independent.discrepancies,[]);assert.equal(independent.status,'passedIndependentNativeComparison');
 for(const [key,value] of Object.entries({referenceCases:65,syntheticCases:46,nativeComparisons:111,oldNativeArithmeticComparisons:149,
  diagnosticBranchOracleCases:2,branchOverrideRejections:2,provenanceComparisons:77,sourceByteBindings:27,unchangedRawArtifacts:42,
  preservedPaths:149,newPaths:16,physicalCalendars:35,holidayRules:499,socialRules:44,socialBernBindings:50}))assert.equal(independent[key],value,'Independent '+key);
 for(const key of ['sourceReleaseApproved','calendarExportEnabled','operatingChanges'])assert.equal(independent[key],false,key);
 const nativePin=independent.inputs.find(row=>row.path===out+'/native-reference-verification.json');
 assert.deepEqual(await bind(nativePin.path),nativePin);await verifyInputs(independent.inputs,'Independent input');
 assert.equal(inherited.status,'passed-inherited-673-reference-cases');assert.equal(inherited.referenceCases,673);
 await verifyInputs(inherited.evidence,'Inherited input');for(const key of ['sourceReleaseApproved','calendarExportEnabled','operatingChanges'])assert.equal(inherited[key],false,key);
 const exported=await json(out+'/export-verification.json'),browser=await json(out+'/browser-verification.json');
 assert.equal(exported.status,'passed');assert.equal(exported.actualIcsFilesSaved,0);assert.equal(exported.outlookImports,0);assert.equal(exported.humanReleaseApproval,false);
 await verifyInputs(exported.bindings,'Export input');
 for(const key of ['sourceReleaseApproved','operatingChanges'])assert.equal(exported[key],false,key);
 assert.equal(browser.status,'passed');assert.equal(browser.realDeviceOrM365Test,false);assert.equal(browser.sourceReleaseApproved,false);
 await verifyInputs(browser.evidence,'Browser actual artifact');
 const negative=await json(out+'/trace-text-negative-control.json');assert.equal(negative.status,'old-package-rejected-as-expected');assert.equal(negative.observedExitCode,1);
 assert.equal(negative.failure.expectedOccurrencesOfCorrectedTraceText,2);assert.equal(negative.failure.actualOccurrencesInOldBundle,0);
 await verifyInputs([negative.oldPackage,negative.test],'Deliberate old-package negative control');
 const preservation=await json(out+'/preservation-verification.json');assert.equal(preservation.protectedFilesVerified,6696);assert.equal(preservation.acceptedK2Archive.files,131);
 return {qa,spfx,web,packaged,bundle,native,independent,inherited,exported,browser,preservation,stage,stepCounts};
}
async function validateMetadata(saved,e){
 assert.equal(saved.workPackage,'AP23K3');assert.equal(saved.asOf,'2026-10-27');assert.equal(saved.status,'local-technical-verification-passed-awaiting-human-acceptance');
 assert.equal(saved.head,e.qa.head);assert.equal(saved.k2TechnicallyAccepted,true);assert.deepEqual(saved.contractDecision,{id:'DEC-2026-040',status:'approved',on:'2026-10-27'});
 assert.deepEqual(saved.formats,{manifest:'15.0.0',minimumConsumer:'15.0.0',administrativeCatalog:'8.0.0'});for(const flag of flags)assert.equal(saved[flag],false,flag);
 assert.deepEqual(saved.counts,e.bundle.counts);assert.deepEqual(saved.qaCounts,e.stepCounts);assert.deepEqual(saved.candidateManifest,e.bundle.manifest);assert.deepEqual(saved.actualPackage,e.spfx.testPackage);
 const counts={protectedFiles:6696,mutableSourceBoundary:137,originalK1Cases:67,consumerReferenceCases:65,diagnosticWorldCases:2,syntheticCases:46,oldNativeCases:149,inheritedReferenceCases:673,
  sourceTestFiles:e.stage.sourceTestFiles,historicalPackageTestFiles:e.stage.historicalTestFiles,copiedSourceInputs:e.stage.verified.length,
  spfxSourceTests:tapCounts((await raw(e.spfx.steps[2].log)).toString()).tests,historicalPackageTests:tapCounts((await raw(e.spfx.steps[6].log)).toString()).tests,actualPackageTests:e.packaged.counts.tests};
 for(const [key,value] of Object.entries(counts))assert.equal(saved[key],value,key);assert.equal(saved.operatingPackagePreserved,true);
 assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);assert.ok(saved.bindings.length>500);assert.equal(new Set(saved.bindings.map(row=>row.path)).size,saved.bindings.length);
 assert.equal(saved.nextGate,'Human professional and technical AP23K3 acceptance. Source release, publication, installation and operation remain separate.');
 const keys=['workPackage','asOf','status','head','k2TechnicallyAccepted','contractDecision','formats','counts','qaCounts','candidateManifest','actualPackage','localLinksChecked','operatingPackagePreserved','bindings','nextGate',...flags,...Object.keys(counts)];
 assert.deepEqual(Object.keys(saved).sort(),keys.sort(),'Closed final metadata');
}
export async function finalize(mode){
 assert.ok(mode==='--write'||mode==='--check');
 const fresh=spawnSync(process.execPath,['scripts/check-ap23k3-preservation.mjs'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(fresh.status,0,fresh.stdout+fresh.stderr);
 if(mode==='--check'){
  const saved=await json(proof),e=await collectEvidence();await validateMetadata(saved,e);
  assert.deepEqual(saved.bindings.map(row=>row.path),await requiredInventory(e.spfx,e.web),'Exact closed final inventory');
  for(const row of saved.bindings)assert.deepEqual(await bind(row.path),row,'Bound K3 final bytes '+row.path);
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),saved.head);
  return {status:'bound-K3-result-reverified',bindings:saved.bindings.length,humanAcceptance:false,operatingChanges:false};
 }
 const e=await collectEvidence();let localLinksChecked=0;
 for(const path of [...documents,...living])for(const match of (await raw(path)).toString().matchAll(/\]\(([^)]+)\)/g)){
  const target=match[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;
  const absolute=resolve(root,dirname(path),decodeURIComponent(target));if(absolute!==resolve(root,proof))await access(absolute);localLinksChecked++;
 }
 const bindings=await Promise.all((await requiredInventory(e.spfx,e.web)).map(bind));
 const report={workPackage:'AP23K3',asOf:'2026-10-27',status:'local-technical-verification-passed-awaiting-human-acceptance',head:e.qa.head,
  k2TechnicallyAccepted:true,contractDecision:{id:'DEC-2026-040',status:'approved',on:'2026-10-27'},formats:{manifest:'15.0.0',minimumConsumer:'15.0.0',administrativeCatalog:'8.0.0'},
  counts:e.bundle.counts,protectedFiles:6696,mutableSourceBoundary:137,originalK1Cases:67,consumerReferenceCases:65,diagnosticWorldCases:2,
  syntheticCases:46,oldNativeCases:149,inheritedReferenceCases:673,qaCounts:e.stepCounts,
  sourceTestFiles:e.stage.sourceTestFiles,historicalPackageTestFiles:e.stage.historicalTestFiles,
  spfxSourceTests:tapCounts((await raw(e.spfx.steps[2].log)).toString()).tests,historicalPackageTests:tapCounts((await raw(e.spfx.steps[6].log)).toString()).tests,
  actualPackageTests:e.packaged.counts.tests,
  candidateManifest:e.bundle.manifest,actualPackage:e.spfx.testPackage,copiedSourceInputs:e.stage.verified.length,localLinksChecked,
  ...Object.fromEntries(flags.map(key=>[key,false])),operatingPackagePreserved:true,bindings,
  nextGate:'Human professional and technical AP23K3 acceptance. Source release, publication, installation and operation remain separate.'};
 await validateMetadata(report,e);await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
 for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final K3 readback '+row.path);
 return {...report,bindings:bindings.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await finalize(process.argv[2]),null,2));
