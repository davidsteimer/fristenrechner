// SPDX-License-Identifier: AGPL-3.0-only
// Bind the actual final local implementation. No human or operating approval.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23j3-2026-10-27',candidate='data/candidates/2026-10-27-ap23j3',proof=out+'/local-completion.json';
const guardPath=out+'/protected-inputs.json';
const guardSha256='8b431957fa6228e53f271c6bab994486919247d1a84b20684f116e8578424f31';
const receiptPath='outputs/ap23j2-abnahme-2026-10-27/receipt.json';
const receiptSha256='d4a4bffea18680a56ae232cc212ea2b91c5c0644249f4acd670359d823b90fed';
const newFileSupplement={path:out+'/native-opening-integration-supplement.json',
  sha256:'ba503835be104dc7089af2e926c5e6ae21ce839f90c5e2887d815b7e9c83c6de'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const raw=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await raw(path));
const bind=async path=>{const bytes=await raw(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const run=args=>spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,
  env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
const counts=text=>Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
  .map(match=>[match[1],Number(match[2])]));
function passedCounts(value,label){assert.ok(value.tests>0,label);assert.equal(value.pass,value.tests,label);
  for(const key of['fail','cancelled','skipped','todo'])assert.equal(value[key],0,label+' '+key);}
async function tree(path){const files=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
  assert.ok(!item.isSymbolicLink(),'Symlink '+path+'/'+item.name);
  if(item.isDirectory())files.push(...await tree(path+'/'+item.name));else{assert.ok(item.isFile());files.push(path+'/'+item.name);}
}return files.sort();}
const sourceExtension=/\.(?:ts|tsx|json|css|scss|mjs|cjs|html|svg|txt|py)$/;
const documents=['docs/fachrecht/abnahme-ap23j2.md','docs/entscheidungen/DEC-2026-039-beschluss.md',
  'docs/architektur/verwaltungsintegration-ap23j3.md'];
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/schweizausbau-nach-mvp09.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md'];
const scripts=['scripts/archive-ap23j2-acceptance.mjs','scripts/prepare-ap23j3.mjs','scripts/check-ap23j3-preservation.mjs',
  'scripts/build-ap23j3-schemas.mjs','scripts/build-ap23j3-candidate.ts','scripts/build-ap23j3-public.mjs',
  'scripts/build-ap23j3-spfx.mjs','scripts/check-ap23j3.mjs','scripts/check-ap23j3-package.mjs','scripts/check-ap23j3-references.ts',
  'scripts/check_ap23j3_independent.py','scripts/check-ap23j3-export.mjs','scripts/check-ap23j3-browser-evidence.mjs',
  'scripts/finalize-ap23j3.mjs','scripts/resume-ap23j3-web-timebudget.mjs',
  'scripts/build-public-app.mjs','scripts/public-app-server.mjs','scripts/serve-ap23j3-built.mjs',
  'scripts/run-standard-tests.mjs'];
const sourceDirs=['src/core','src/ui','src/release','src/public-app','public-app','schemas'];
const testDirs=['tests/core','tests/ui','tests/hosts','tests/public-app','tests/data','tests/governance'];
const copiedDirs=['spfx/src','spfx/scripts','spfx/config','spfx/test','spfx/test-build'];
async function copiedFiles(){
  const files=(await readdir(resolve(root,'spfx'),{withFileTypes:true})).filter(item=>item.isFile()).map(item=>'spfx/'+item.name);
  for(const dir of copiedDirs)files.push(...await tree(dir));
  return [...new Set(files)].sort();
}
async function inventory(spfx,web){
  const paths=[...documents,...living,...scripts,'package.json','package-lock.json','tsconfig.json',receiptPath];
  for(const dir of[...sourceDirs,...testDirs])paths.push(...(await tree(dir)).filter(path=>sourceExtension.test(path)));
  for(const path of await copiedFiles())paths.push(path,spfx.stage+'/'+path);
  paths.push(...await tree(candidate),...(await tree(out)).filter(path=>path!==proof),
    spfx.testPackage.path,spfx.compiler.configuration.path,spfx.stage+'/verification.json',
    ...spfx.steps.map(row=>row.log),...web.artifacts.map(row=>row.path));
  return [...new Set(paths)].sort();
}
async function checkCopiedInputs(spfx){
  const verified=[];
  for(const dir of copiedDirs){
    const current=await tree(dir),staged=(await tree(spfx.stage+'/'+dir)).map(path=>path.slice(spfx.stage.length+1));
    assert.deepEqual(staged,current,'Exact copied source/test inventory '+dir);
  }
  for(const path of await copiedFiles()){
    const actual=await bind(path),staged=await bind(spfx.stage+'/'+path);
    assert.equal(actual.sha256,staged.sha256,'Actual package source/test input '+path);
    assert.equal(actual.byteLength,staged.byteLength,'Actual package input length '+path);
    verified.push({source:actual,stage:staged});
  }
  const sourceTests=(await readdir(resolve(root,'spfx/test'))).filter(name=>name.endsWith('.test.ts')).sort().map(name=>'test/'+name);
  const packageTests=(await readdir(resolve(root,'spfx/test-build'))).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>'test-build/'+name);
  assert.deepEqual(spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts')),sourceTests,'All actual TS source tests');
  assert.deepEqual(spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs')),packageTests,'All actual compiled-package tests');
  assert.ok(sourceTests.includes('test/ap23j3-format14.test.ts'),'Native Format14 source test included');
  assert.ok(sourceTests.length>0&&packageTests.length>0);
  for(const step of[spfx.steps[2],spfx.steps[6]])assert.ok(step.args.includes('--test-timeout=240000'));
  return{files:verified,sourceTestFiles:sourceTests,packageTestFiles:packageTests};
}
async function checkWebTimeBudgetContinuation(qa,spfx,web){
  const current=qa.webTimeBudgetContinuation;assert.ok(current,'The actual initial web timeout remains disclosed');
  const archive=out+'/initial-web-timebudget';
  assert.deepEqual(current.context,{path:archive+'/continuation-inputs.json',byteLength:293380,
    sha256:'40b96da27f381ebc66ebd69774922c944f9525f34170867dad5de8adf7302e91'});
  for(const row of[current.context,current.initialQa,current.initialWebLog,current.initialRunner,current.testFile])
    assert.deepEqual(await bind(row.path),row,'Original timeout evidence '+row.path);
  assert.deepEqual(current.initialQa,{path:archive+'/QA-AP23J3.failed.json',byteLength:2534,
    sha256:'2a41b26845cb5ecd793c8aa4b3e34e02d1d89da29b36fae09ca4e96ad819ee65'});
  assert.deepEqual(current.initialWebLog,{path:archive+'/actual-web-bundle-timeout180000.txt',byteLength:6319,
    sha256:'cdf4b18f05db93a95cfd7df11356a93630ee6534db87423ca7918c6bba5b8451'});
  assert.deepEqual(current.initialRunner,{path:archive+'/check-ap23j3-timeout180000.mjs',byteLength:3951,
    sha256:'dd5ef374240191a7c2f53405b56ecd97c0826368baa4cfec4637de15f2f2e6cf'});
  const initial=await json(current.initialQa.path),context=await json(current.context.path);
  assert.equal(initial.status,'failed');assert.equal(initial.steps.length,7);
  assert.deepEqual(initial.steps.map(step=>step.exitCode),[0,0,0,0,0,0,1]);
  assert.deepEqual(qa.steps.slice(0,6),initial.steps.slice(0,6),'All six prior successful steps remain exact and unreplaced');
  const expectedInitial={tests:22,pass:21,fail:0,cancelled:1,skipped:0,todo:0};
  const initialText=(await raw(current.initialWebLog.path)).toString();
  assert.deepEqual(initial.steps[6].counts,expectedInitial);assert.deepEqual(counts(initialText),expectedInitial);
  assert.deepEqual(current.initialCounts,expectedInitial);
  assert.match(initialText,/failureType: 'testTimeoutFailure'/);assert.match(initialText,/test timed out after 180000ms/);
  assert.equal([...initialText.matchAll(/^not ok /gm)].length,1,'Only the complete-file timeout was cancelled');
  const file='tests/public-app/ap23j3-build.test.ts';
  const initialArgs=['--import','tsx','--test','--test-timeout=180000',file];
  const finalArgs=['--import','tsx','--test','--test-timeout=900000',file];
  assert.equal(current.testFile.path,file);assert.deepEqual(current.initialCommand.args,initialArgs);
  assert.deepEqual(current.finalCommand.args,finalArgs);assert.deepEqual(qa.steps[6].args,finalArgs);
  assert.equal(current.initialGlobalTimeoutMs,180000);assert.equal(current.finalGlobalTimeoutMs,900000);
  assert.equal(current.completeTestFileRepeated,true);assert.equal(current.firstSixStepsReused,true);
  assert.equal(current.assertionFailuresInInitialAttempt,0);assert.equal(current.initialCancelledTests,1);
  assert.deepEqual(qa.steps[6].counts,{tests:27,pass:27,fail:0,cancelled:0,skipped:0,todo:0});
  const oldRunner=(await raw(current.initialRunner.path)).toString();
  assert.equal((await raw('scripts/check-ap23j3.mjs')).toString(),
    oldRunner.replace("'--test-timeout=180000'","'--test-timeout=900000'"),'Full-run script changes only global web budget');
  assert.deepEqual(current.commands.map(row=>({id:row.id,command:row.command,args:row.args})),
    qa.steps.slice(6).map(row=>({id:row.id,command:row.command,args:row.args})),'All remaining complete steps were executed');
  assert.equal(context.stage,spfx.stage);assert.equal(context.head,qa.head);assert.equal(context.guardSha256,guardSha256);
  assert.equal(context.sourceInputsBefore.length,899);assert.equal(context.stageInputsBefore.length,278);
  assert.deepEqual(current.sourceInputsBefore,context.sourceInputsBefore);assert.deepEqual(current.sourceInputsAfter,context.sourceInputsBefore);
  assert.deepEqual(current.stageInputsBefore,context.stageInputsBefore);assert.deepEqual(current.stageInputsAfter,context.stageInputsBefore);
  assert.deepEqual(current.webArtifactsBefore,context.webArtifactsBefore);assert.deepEqual(current.webArtifactsAfter,context.webArtifactsBefore);
  assert.deepEqual(current.unchangedEvidence,context.unchangedEvidence);
  for(const row of current.sourceInputsAfter)assert.deepEqual(await bind(row.path),row,'Unchanged continuation source '+row.path);
  for(const pair of current.stageInputsAfter){assert.deepEqual(await bind(pair.source.path),pair.source);
    assert.deepEqual(await bind(pair.stage.path),pair.stage);assert.equal(pair.source.sha256,pair.stage.sha256);}
  for(const row of current.webArtifactsAfter)assert.deepEqual(await bind(row.path),row,'Reproducible web output '+row.path);
  assert.deepEqual([...current.webArtifactsAfter].sort((a,b)=>a.path.localeCompare(b.path)),
    [...web.artifacts].sort((a,b)=>a.path.localeCompare(b.path)),'Same full final web artifact inventory');
  for(const row of current.unchangedEvidence)assert.deepEqual(await bind(row.path),row,'Unchanged browser/export proof '+row.path);
  for(const value of[current,context]){assert.equal(value.sourceReleaseApproved,false);assert.equal(value.operatingChanges,false);}
  assert.equal(context.productChangesAllowed,false);
  return current;
}
async function verifyActual(){
  const qa=await json(out+'/QA-AP23J3.json'),spfx=await json(out+'/spfx-build.json'),web=await json(out+'/web-build.json'),
    pkg=await json(out+'/actual-package.json'),bundle=await json(out+'/bundle-integrity.json'),
    browser=await json(out+'/browser-verification.json'),exportProof=await json(out+'/export-verification.json'),
    native=await json(out+'/native-reference-verification.json'),independent=await json(out+'/independent-verification.json');
  for(const[name,value]of Object.entries({qa,spfx,web,pkg,browser,exportProof}))assert.equal(value.status,'passed',name);
  for(const value of[qa,spfx,web,pkg,native,independent,exportProof])assert.equal(value.workPackage,'AP23J3');
  assert.equal(qa.head,(await json(guardPath)).head,'QA and frozen HEAD');
  assert.equal(qa.manifestSha256,bundle.manifest.sha256,'QA and actual candidate manifest');
  assert.deepEqual(qa.steps.map(step=>step.id),['typecheck','native-schema-rebuild','candidate-rebuild','native-references',
    'product-regression','host-lifecycle','actual-web-bundle','independent-native','independent-schema','j2-archive','j3-governance','web-build']);
  assert.equal(spfx.steps.length,7,'Complete regular SPFx build');
  for(const key of['initialTimeBudgetAttempt','timeBudgetRetest','retestOnly'])assert.equal(Object.hasOwn(spfx,key),false,'No historical retry workaround '+key);
  assert.deepEqual(await json(spfx.stage+'/verification.json'),spfx,'Actual final stage verification');
  assert.equal(spfx.steps[0].args[0],'scripts/sync-schemas.mjs');
  assert.equal(spfx.steps[1].args[0],'scripts/sync-product-source.mjs');
  assert.deepEqual(spfx.steps[3].args,['test','--clean','--production']);
  assert.equal(spfx.steps[4].args[0],'scripts/audit-product-css.mjs');
  assert.deepEqual(spfx.steps[5].args,['package-solution','--production']);
  const webTimeBudgetContinuation=await checkWebTimeBudgetContinuation(qa,spfx,web);
  assert.equal(native.status,'passedNativeFullReferenceComparison');assert.equal(native.referenceCases,673);
  assert.equal(native.native,true);assert.equal(native.productCoreUsed,true);assert.equal(native.localReference,true);
  assert.equal(independent.status,'passedIndependentNativeComparison');assert.equal(independent.referenceCases,673);
  assert.equal(independent.calendarEndEligibilityComparisons,2190);assert.equal(independent.calendarProbes,13);
  assert.equal(independent.openingProvenanceComparisons,96);assert.equal(independent.sourceByteBindings,19);
  assert.equal(independent.unchangedRawArtifacts,42);assert.equal(independent.physicalCalendars,35);
  assert.equal(independent.physicalProjectionRules,431);assert.equal(independent.baseHolidayRules,479);
  assert.equal(independent.supplementalHolidayRules,20);assert.equal(independent.holidayRules,499);
  assert.equal(independent.preservedPaths,113);assert.equal(independent.newPaths,36);assert.deepEqual(independent.discrepancies,[]);
  const referenceCounts={datedResearchValue:93,unresolvedBoundaryProposed:3,qualificationBoundaryProposed:573,researchWindowBoundary:4};
  for(const report of[native,independent]){
    assert.deepEqual(report.counts,referenceCounts);assert.equal(report.results.length,673);
    assert.equal(new Set(report.results.map(row=>row.id)).size,673);
    assert.equal(report.sourceReleaseApproved,false);assert.equal(report.calendarExportEnabled,false);
    for(const row of report.inputs)assert.deepEqual(await bind(row.path),row,'Native/independent evidence '+row.path);
  }
  assert.deepEqual(native.results.map(row=>row.id),independent.results.map(row=>row.id),'Same complete native/oracle reference inventory');
  for(const step of[...qa.steps,...spfx.steps]){
    assert.equal(step.exitCode,0,step.id??step.log);const bytes=await raw(step.log);
    assert.equal(hash(bytes),step.sha256,step.log);assert.equal(bytes.length,step.byteLength,step.log);
    const actual=counts(bytes.toString());
    if(Object.hasOwn(actual,'tests'))passedCounts(actual,step.log);
    if(step.counts&&Object.hasOwn(step.counts,'tests'))assert.deepEqual(actual,step.counts,step.log);
  }
  for(const index of[2,6])passedCounts(counts((await raw(spfx.steps[index].log)).toString()),'Actual SPFx tests step '+(index+1));
  const product=qa.steps.find(step=>step.id==='product-regression');passedCounts(product.counts,'Product regression');
  assert.ok(product.counts.tests>=3053,'Historical regression cannot disappear');
  assert.equal(pkg.typecheckExitCode,0);passedCounts(pkg.counts,'Actual SPFx package');
  const packageLog=await raw(pkg.log);assert.equal(hash(packageLog),pkg.sha256);
  assert.deepEqual(counts(packageLog.toString()),pkg.counts,'Actual package TAP counts');assert.deepEqual(pkg.package,spfx.testPackage);
  for(const row of[...spfx.protectedBefore,...web.protectedBefore,spfx.testPackage,...web.artifacts,bundle.manifest,...bundle.artifacts])
    assert.deepEqual(await bind(row.path),row,row.path);
  assert.deepEqual(spfx.protectedAfter,spfx.protectedBefore);assert.deepEqual(web.protectedAfter,web.protectedBefore);
  assert.equal(spfx.operatingPackagePreserved,true);assert.equal(spfx.localOnly,true);assert.equal(spfx.deployable,false);
  assert.equal(web.localOnly,true);assert.equal(web.deployable,false);assert.equal(web.sourceReleaseApproved,false);
  const expectedCounts={artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:149,
    preservedAdministrativePaths:113,newAdministrativePaths:36,qualificationPolicies:149,laws:18,suspensionProfiles:35,
    holidayBindings:27,basisHolidayRules:479,supplementalRules:20,newHolidayRules:0,totalHolidayRules:499,
    preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromI3:42};
  assert.deepEqual(bundle.counts,expectedCounts);
  assert.equal(bundle.sourceReleaseApproved,false);assert.equal(bundle.productionActivation,false);
  assert.equal(bundle.referenceOnly,true);assert.equal(bundle.calendarExportEnabled,false);
  for(const row of[...bundle.basedOn,...bundle.generatedModules,bundle.buildScript])assert.equal(hash(await raw(row.path)),row.sha256,row.path);
  const manifest=await json(candidate+'/manifest.json');
  assert.equal(manifest.formatVersion,'14.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'14.0.0');
  assert.equal(manifest.releaseId,'2026-10-27-ap23j3-candidate.1');assert.equal(manifest.releaseStatus,'candidate');
  assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');assert.equal(manifest.sourceSummary.technicalValidationStatus,'pending');
  assert.equal(manifest.artifacts.length,44);assert.equal(manifest.calendarIds.length,35);
  const candidatePaths=[candidate+'/manifest.json',...manifest.artifacts.map(row=>candidate+'/'+row.path)].sort();
  assert.deepEqual(await tree(candidate),candidatePaths,'No missing or extra candidate files');
  assert.deepEqual(bundle.artifacts.map(row=>row.path).sort(),manifest.artifacts.map(row=>candidate+'/'+row.path).sort());
  for(const row of manifest.artifacts)assert.deepEqual(await bind(candidate+'/'+row.path),
    {path:candidate+'/'+row.path,byteLength:row.byteLength,sha256:row.sha256},'Actual manifest artifact '+row.path);
  const administrativeDescriptor=manifest.artifacts.find(row=>row.role==='administrativeProcedureCatalog');
  assert.ok(administrativeDescriptor,'Native V7 catalog descriptor');
  const administrative=await json(candidate+'/'+administrativeDescriptor.path);assert.equal(administrative.formatVersion,'7.0.0');
  const previous=await json('data/candidates/2026-10-22-ap23i3/manifest.json');
  const unchanged=manifest.artifacts.filter(row=>previous.artifacts.some(old=>old.path===row.path&&old.sha256===row.sha256&&old.byteLength===row.byteLength));
  assert.equal(unchanged.length,42,'Actual raw artifact identity with I3');
  for(const row of unchanged)assert.deepEqual(await raw(candidate+'/'+row.path),await raw('data/candidates/2026-10-22-ap23i3/'+row.path));
  for(const path of[...await tree('src/core'),...await tree('src/ui')].filter(path=>/\.(?:ts|tsx|css)$/.test(path)&&!path.includes('/preview/'))){
    const generated='spfx/src/product/'+path.slice(4);
    assert.equal(hash(await raw(path)),hash(await raw(generated)),'Generated product copy '+path);
    assert.equal(hash(await raw(path)),hash(await raw(spfx.stage+'/'+generated)),'Actual package product input '+path);
  }
  const copiedInputs=await checkCopiedInputs(spfx);
  assert.deepEqual(await bind(spfx.compiler.configuration.path),spfx.compiler.configuration);
  assert.equal(browser.actualLocalBuild,true);assert.deepEqual(browser.languages,['de','fr']);
  assert.equal(browser.realDeviceTest,false);assert.equal(browser.realM365HostTest,false);
  assert.equal(browser.horizontalOverflow,false);assert.equal(browser.twoColumnLayout,true);assert.equal(browser.actualExportEnabled,false);
  assert.ok(web.artifacts.some(row=>row.path===browser.asset.path&&row.sha256===browser.asset.sha256),'Observed asset is not final build');
  assert.deepEqual(await bind(browser.asset.path),browser.asset);
  assert.ok(browser.screenshots.length>0&&browser.accessibility.length>0);
  for(const row of[browser.domObservation,...browser.accessibility,...browser.screenshots])assert.deepEqual(await bind(row.path),row,row.path);
  assert.equal(exportProof.qualifiedPaths,36);assert.equal(exportProof.qualifiedCases,44);assert.equal(exportProof.syntheticInMemoryArtifacts,88);
  assert.deepEqual(exportProof.languages,['de','fr']);assert.equal(exportProof.cases.length,44);
  assert.equal(new Set(exportProof.cases.map(row=>row.pathId)).size,36);
  for(const key of['referenceExportsDenied','changedInputsDenied','resultClonesDenied','contextClonesDenied'])assert.equal(exportProof[key],44,key);
  assert.equal(exportProof.actualIcsFilesSaved,0);assert.equal(exportProof.outlookImports,0);
  for(const key of['humanReleaseApproval','sourceReleaseApproved','operatingChanges'])assert.equal(exportProof[key],false,key);
  for(const row of exportProof.bindings)assert.deepEqual(await bind(row.path),row,'Export evidence input '+row.path);
  return{qa,spfx,web,pkg,bundle,browser,exportProof,native,independent,copiedInputs,webTimeBudgetContinuation};
}
async function freshGuard(write){
  assert.equal(hash(await raw(guardPath)),guardSha256,'Frozen original guard');
  assert.equal(hash(await raw(receiptPath)),receiptSha256,'Frozen accepted J2 archive receipt');
  assert.equal(hash(await raw(newFileSupplement.path)),newFileSupplement.sha256,'Exact narrow native-opening supplement');
  const extra=await json(newFileSupplement.path);
  assert.equal(extra.workPackage,'AP23J3');assert.equal(extra.kind,'closedNewNativeIntegrationFileSupplement');
  assert.deepEqual(extra.originalGuard,{path:guardPath,sha256:guardSha256});
  assert.deepEqual(extra.additionalNewFiles,['src/core/holidayActivationV14.ts']);
  assert.equal(extra.technicalScopeConfirmedByRoot,true);assert.equal(extra.existingFileChangesAllowed,false);assert.equal(extra.newOperatingAuthority,false);
  const result=run(['scripts/check-ap23j3-preservation.mjs',...(write?['--write']:[])]);
  assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));
  const archive=run(['scripts/archive-ap23j2-acceptance.mjs','--check']);assert.equal(archive.status,0,archive.stdout+archive.stderr);
  const report=JSON.parse(result.stdout);assert.equal(report.protectedFilesVerified,4466);assert.equal(report.intendedMutableInputs.length,127);
  assert.equal(report.inventorySha256,guardSha256);assert.deepEqual(report.newFileSupplement,newFileSupplement);
  assert.equal(report.generatedSchemaSupplement,null);assert.equal(report.generatedSchemaCopiesVerified.length,5);
  assert.deepEqual(report.livingStatus.map(row=>row.path).sort(),[...living].sort());
  return report;
}
async function verifyLinks(){
  let checked=0;
  for(const path of[...documents,...living]){
    const text=(await raw(path)).toString();if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Language style '+path);
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      const target=match[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
      const absolute=resolve(root,dirname(path),decodeURIComponent(target));
      if(absolute!==resolve(root,proof))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' '+target);});
      checked++;
    }
  }
  return checked;
}
const mode=process.argv[2];assert.ok(['--write','--check'].includes(mode)&&process.argv.length===3);
const guard=await freshGuard(mode==='--write');
const headResult=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});assert.equal(headResult.status,0,headResult.stderr);
const currentHead=headResult.stdout.trim();assert.equal(currentHead,guard.head);
const actual=await verifyActual(),localLinksChecked=await verifyLinks();
if(mode==='--check'){
  const saved=await json(proof);
  assert.equal(saved.workPackage,'AP23J3');assert.equal(saved.status,'local-technical-verification-passed-awaiting-human-acceptance');
  assert.equal(saved.head,currentHead);assert.equal(saved.j2TechnicallyAccepted,true);assert.equal(saved.professionalTechnicalAcceptance,false);
  assert.deepEqual(saved.contractDecision,{id:'DEC-2026-039',status:'approved',on:'2026-10-27'});
  assert.deepEqual(saved.formats,{manifest:'14.0.0',minimumConsumer:'14.0.0',administrativeCatalog:'7.0.0'});
  for(const key of['sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease','operatingChanges'])
    assert.equal(saved[key],false,key);
  assert.deepEqual(saved.counts,actual.bundle.counts);assert.deepEqual(saved.productTests,actual.qa.steps.find(step=>step.id==='product-regression').counts);
  assert.deepEqual(saved.candidateManifest,actual.bundle.manifest);assert.deepEqual(saved.actualPackage,actual.pkg.package);
  assert.equal(saved.protectedFiles,4466);assert.equal(saved.operatingPackagePreserved,true);assert.equal(saved.guardSha256,guardSha256);
  assert.deepEqual(saved.newFileSupplement,newFileSupplement);assert.equal(saved.generatedSchemaSupplement,null);
  assert.equal(saved.nativeReferenceCases,673);assert.equal(saved.independentReferenceCases,673);
  assert.equal(saved.calendarEndEligibilityComparisons,2190);assert.equal(saved.calendarProbes,13);
  assert.equal(saved.openingProvenanceComparisons,96);assert.deepEqual(saved.copiedInputs,actual.copiedInputs);
  assert.deepEqual(saved.webTimeBudgetContinuation,actual.webTimeBudgetContinuation);
  assert.deepEqual(saved.browser,actual.browser);assert.equal(saved.localLinksChecked,localLinksChecked);
  assert.deepEqual(saved.bindings.map(row=>row.path),await inventory(actual.spfx,actual.web),'Exact final evidence inventory');
  for(const row of saved.bindings)assert.deepEqual(await bind(row.path),row,row.path);
  assert.deepEqual(saved.supplemental.map(row=>row.id),['typecheck-final','native-schema-governance','whitespace'],'Exact supplemental inventory');
  for(const step of saved.supplemental){assert.equal(step.exitCode,0);assert.deepEqual(await bind(step.path),
    {path:step.path,byteLength:step.byteLength,sha256:step.sha256},'Supplemental descriptor '+step.id);
    if(step.id==='native-schema-governance'){
      assert.deepEqual(counts((await raw(step.path)).toString()),step.counts);
      passedCounts(step.counts,step.id);assert.equal(step.counts.tests,14);
    }
  }
  console.log(JSON.stringify({status:'bound-J3-result-reverified',bindings:saved.bindings.length,humanAcceptance:false,operatingChanges:false},null,2));
}else{
  const supplemental=[];
  const typecheck=run(['node_modules/typescript/bin/tsc','--noEmit']);
  const typecheckText=(typecheck.stdout??'')+(typecheck.stderr??''),typecheckPath=out+'/typecheck-final.txt';
  await writeFile(resolve(root,typecheckPath),typecheckText);assert.equal(typecheck.status,0,typecheckText);
  supplemental.push({id:'typecheck-final',exitCode:0,...await bind(typecheckPath)});
  const schemas=run(['--test','tests/governance/ap23j3-schemas.test.mjs']);
  const schemasText=(schemas.stdout??'')+(schemas.stderr??''),schemasPath=out+'/native-schema-governance.txt';
  await writeFile(resolve(root,schemasPath),schemasText);assert.equal(schemas.status,0,schemasText);
  const schemaCounts=counts(schemasText);passedCounts(schemaCounts,'Native schema governance');assert.equal(schemaCounts.tests,14);
  supplemental.push({id:'native-schema-governance',exitCode:0,...await bind(schemasPath),counts:schemaCounts});
  const whitespace=spawnSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});assert.equal(whitespace.status,0,whitespace.stdout+whitespace.stderr);
  const whitespacePath=out+'/whitespace.txt';await writeFile(resolve(root,whitespacePath),whitespace.stdout+whitespace.stderr);
  supplemental.push({id:'whitespace',exitCode:0,...await bind(whitespacePath)});
  await freshGuard(false);
  const bindings=await Promise.all((await inventory(actual.spfx,actual.web)).map(bind));
  const report={workPackage:'AP23J3',asOf:'2026-10-27',status:'local-technical-verification-passed-awaiting-human-acceptance',head:currentHead,
    j2TechnicallyAccepted:true,contractDecision:{id:'DEC-2026-039',status:'approved',on:'2026-10-27'},professionalTechnicalAcceptance:false,
    sourceReleaseApproved:false,calendarExportEnabled:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,
    regularIntermediateRelease:false,operatingChanges:false,operatingPackagePreserved:true,
    protectedFiles:guard.protectedFilesVerified,guardSha256,newFileSupplement,generatedSchemaSupplement:null,
    counts:actual.bundle.counts,candidateManifest:actual.bundle.manifest,actualPackage:actual.pkg.package,
    productTests:actual.qa.steps.find(step=>step.id==='product-regression').counts,nativeReferenceCases:actual.native.referenceCases,
    independentReferenceCases:actual.independent.referenceCases,calendarEndEligibilityComparisons:2190,calendarProbes:13,openingProvenanceComparisons:96,
    formats:{manifest:'14.0.0',minimumConsumer:'14.0.0',administrativeCatalog:'7.0.0'},copiedInputs:actual.copiedInputs,
    webTimeBudgetContinuation:actual.webTimeBudgetContinuation,
    browser:actual.browser,toolchain:{node:process.version,npm:'10.9.8'},supplemental,localLinksChecked,bindings,
    scope:'Local native integration only. Synthetic approvals are test-memory only. E/Q/P, AP5, AP21, mirrors, permissions, hosting and operating pins unchanged.'};
  await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
  for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final readback '+row.path);
  console.log(JSON.stringify({status:report.status,protectedFiles:report.protectedFiles,bindings:bindings.length,localLinksChecked,
    productTests:report.productTests},null,2));
}
