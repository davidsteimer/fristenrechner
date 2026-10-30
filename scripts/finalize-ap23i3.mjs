// SPDX-License-Identifier: AGPL-3.0-only
// Bind the actual final local implementation. No human or operating approval.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23i3-2026-10-22',candidate='data/candidates/2026-10-22-ap23i3',proof=out+'/local-completion.json';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const raw=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await raw(path));
const bind=async path=>{const bytes=await raw(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
const run=(args)=>spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,
  env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}});
const counts=text=>Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)]
  .map(match=>[match[1],Number(match[2])]));
function passedCounts(value,label){assert.ok(value.tests>0,label);assert.equal(value.pass,value.tests,label);
  for(const key of['fail','cancelled','skipped','todo'])assert.equal(value[key],0,label+' '+key);}
async function tree(path){const files=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){
  assert.ok(!item.isSymbolicLink(),'Symlink '+path+'/'+item.name);
  if(item.isDirectory())files.push(...await tree(path+'/'+item.name));else{assert.ok(item.isFile());files.push(path+'/'+item.name);}
}return files.sort();}
const documents=['docs/fachrecht/abnahme-ap23i2.md','docs/entscheidungen/DEC-2026-038-beschluss.md',
  'docs/architektur/verwaltungsintegration-ap23i3.md'];
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/schweizausbau-nach-mvp09.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md'];
const scripts=['scripts/archive-ap23i2-acceptance.mjs','scripts/prepare-ap23i3.mjs','scripts/check-ap23i3-preservation.mjs',
  'scripts/build-ap23i3-schemas.mjs','scripts/build-ap23i3-candidate.ts','scripts/build-ap23i3-public.mjs',
  'scripts/build-ap23i3-spfx.mjs','scripts/check-ap23i3-spfx-timebudget.mjs','scripts/check-ap23i3.mjs','scripts/check-ap23i3-package.mjs','scripts/check-ap23i3-references.ts',
  'scripts/check_ap23i3_independent.py','scripts/check-ap23i3-export.mjs','scripts/check-ap23i3-browser-evidence.mjs',
  'scripts/finalize-ap23i3.mjs','scripts/build-public-app.mjs','scripts/public-app-server.mjs','scripts/serve-ap23i3-built.mjs'];
async function inventory(spfx,web){
  const paths=[...documents,...living,...scripts,'package.json','package-lock.json','tsconfig.json',
    'spfx/tsconfig.json','spfx/config/package-solution.json','spfx/scripts/sync-schemas.mjs',
    'outputs/ap23i2-abnahme-2026-10-22/receipt.json'];
  for(const dir of['src/core','src/ui','src/provider','src/release','src/public-app','public-app','schemas','spfx/src','spfx/scripts']){
    try{paths.push(...(await tree(dir)).filter(path=>/\.(?:ts|tsx|json|css|scss|mjs|html|svg|txt)$/.test(path)));}
    catch(error){if(error.code!=='ENOENT')throw error;}
  }
  for(const dir of['tests/core','tests/ui','tests/hosts','tests/public-app','tests/data','tests/governance','spfx/test'])
    paths.push(...(await tree(dir)).filter(path=>/ap23i[23]/.test(path)&&/\.(?:ts|tsx|mjs|py|json)$/.test(path)));
  paths.push(...await tree(candidate),...(await tree(out)).filter(path=>path!==proof),
    spfx.testPackage.path,spfx.compiler.configuration.path,spfx.verificationPath??spfx.stage+'/verification.json',...web.artifacts.map(row=>row.path));
  for(const dir of['spfx/src','spfx/scripts'])for(const path of await tree(dir))
    if(/\.(?:ts|tsx|json|css|scss|mjs)$/.test(path))paths.push(spfx.stage+'/'+path);
  paths.push(spfx.stage+'/spfx/tsconfig.json');
  for(const path of(await tree('spfx/test-build')).filter(path=>path.endsWith('.cjs')))paths.push(path,spfx.stage+'/'+path);
  if(spfx.initialTimeBudgetAttempt){
    const initial=await json(spfx.initialTimeBudgetAttempt.path);
    paths.push(...initial.steps.map(row=>row.log),spfx.stage+'/verification.json');
  }
  return [...new Set(paths)].sort();
}
async function verifyActual(){
  const qa=await json(out+'/QA-AP23I3.json'),spfx=await json(out+'/spfx-build.json'),web=await json(out+'/web-build.json'),
    pkg=await json(out+'/actual-package.json'),bundle=await json(out+'/bundle-integrity.json'),
    browser=await json(out+'/browser-verification.json'),exportProof=await json(out+'/export-verification.json'),
    native=await json(out+'/native-reference-verification.json'),independent=await json(out+'/independent-verification.json');
  for(const[name,value]of Object.entries({qa,spfx,web,pkg,browser,exportProof}))assert.equal(value.status,'passed',name);
  assert.equal(qa.steps.length,12);assert.equal(qa.steps.at(-1).id,'web-build');
  assert.equal(native.status,'passedNativeFullReferenceComparison');assert.equal(native.referenceCases,249);
  assert.equal(independent.status,'passedIndependentNativeComparison');assert.equal(independent.referenceCases,249);
  assert.equal(independent.calendarEndEligibilityComparisons,1460);assert.equal(independent.calendarProbes,15);
  assert.equal(independent.unchangedRawArtifacts,42);
  for(const report of[native,independent])for(const row of report.inputs)assert.deepEqual(await bind(row.path),row,'Native/independent evidence '+row.path);
  for(const step of[...qa.steps,...spfx.steps]){
    assert.equal(step.exitCode,0,step.id??step.log);const bytes=await raw(step.log);
    assert.equal(hash(bytes),step.sha256,step.log);
    if(step.byteLength!==undefined)assert.equal(bytes.length,step.byteLength,step.log);
    const actual=counts(bytes.toString());
    if(Object.hasOwn(actual,'tests'))passedCounts(actual,step.log);
    if(step.counts&&Object.hasOwn(step.counts,'tests'))assert.deepEqual(actual,step.counts,step.log);
  }
  const product=qa.steps.find(step=>step.id==='product-regression');passedCounts(product.counts,'Product regression');
  assert.ok(product.counts.tests>=3053,'Historical regression cannot disappear');
  assert.equal(pkg.typecheckExitCode,0);passedCounts(pkg.counts,'Actual SPFx package');
  const packageLog=await raw(pkg.log);assert.equal(hash(packageLog),pkg.sha256);
  assert.deepEqual(counts(packageLog.toString()),pkg.counts,'Actual package TAP counts');assert.deepEqual(pkg.package,spfx.testPackage);
  for(const row of[...spfx.protectedBefore,...web.protectedBefore,spfx.testPackage,...web.artifacts,bundle.manifest,...bundle.artifacts])
    assert.deepEqual(await bind(row.path),row,row.path);
  assert.deepEqual(spfx.protectedAfter,spfx.protectedBefore);assert.deepEqual(web.protectedAfter,web.protectedBefore);
  assert.equal(spfx.operatingPackagePreserved,true);
  if(spfx.initialTimeBudgetAttempt){
    const descriptor=spfx.initialTimeBudgetAttempt,initial=await json(descriptor.path);
    assert.deepEqual(await bind(descriptor.path),{path:descriptor.path,byteLength:descriptor.byteLength,sha256:descriptor.sha256});
    assert.equal(initial.status,'failed');assert.deepEqual(initial.steps.map(row=>row.exitCode),[0,0,0,0,1]);
    assert.deepEqual(await json(spfx.stage+'/verification.json'),initial,'Unchanged original stage verification');
    assert.deepEqual(await json(spfx.verificationPath),spfx,'Actual final stage verification');
    assert.deepEqual(initial.protectedBefore,spfx.protectedBefore);assert.deepEqual(initial.protectedAfter,spfx.protectedAfter);
    for(const row of initial.steps){const bytes=await raw(row.log);assert.equal(hash(bytes),row.sha256);assert.equal(bytes.length,row.byteLength);}
    const initialCounts=counts((await raw(initial.steps[4].log)).toString());
    assert.deepEqual(initialCounts,{tests:163,pass:160,fail:0,cancelled:3,skipped:0,todo:0});
    assert.equal(spfx.retestOnly,true);assert.equal(spfx.compilerAndPackageRebuilt,false);
    assert.deepEqual(initial.steps[4].args.filter(arg=>arg.endsWith('.test.cjs')),
      spfx.timeBudgetRetest.args.filter(arg=>arg.endsWith('.test.cjs')),'Same complete historical test inventory');
    assert.ok(spfx.timeBudgetRetest.args.includes('--test-timeout=240000'));
    assert.equal(spfx.timeBudgetRetest.exitCode,0);passedCounts(spfx.timeBudgetRetest.counts,'Historical package retest');
    const retestLog=await raw(spfx.timeBudgetRetest.log);assert.equal(hash(retestLog),spfx.timeBudgetRetest.sha256);
    assert.deepEqual(counts(retestLog.toString()),spfx.timeBudgetRetest.counts);
  }
  assert.equal(bundle.counts.administrativePaths,113);assert.equal(bundle.counts.preservedAdministrativePaths,79);
  assert.equal(bundle.counts.newAdministrativePaths,34);assert.equal(bundle.counts.calendars,35);assert.equal(bundle.counts.artifacts,44);
  assert.equal(bundle.counts.totalHolidayRules,499);assert.equal(bundle.counts.newHolidayRules,0);assert.equal(bundle.counts.rawUnchangedFromH3,42);
  for(const row of bundle.generatedModules)assert.equal(hash(await raw(row.path)),row.sha256,row.path);
  for(const path of[...await tree('src/core'),...await tree('src/ui')].filter(path=>/\.(?:ts|tsx|css)$/.test(path)&&!path.includes('/preview/'))){
    const generated='spfx/src/product/'+path.slice(4);
    assert.equal(hash(await raw(path)),hash(await raw(generated)),'Generated product copy '+path);
    assert.equal(hash(await raw(path)),hash(await raw(spfx.stage+'/'+generated)),'Actual package input '+path);
  }
  for(const dir of['spfx/src','spfx/scripts'])for(const path of(await tree(dir)).filter(path=>/\.(?:ts|tsx|json|css|scss|mjs)$/.test(path)))
    assert.equal(hash(await raw(path)),hash(await raw(spfx.stage+'/'+path)),'Actual host input '+path);
  for(const path of(await tree('spfx/test-build')).filter(path=>path.endsWith('.cjs')))
    assert.equal(hash(await raw(path)),hash(await raw(spfx.stage+'/'+path)),'Actual historical package test '+path);
  assert.deepEqual(await bind(spfx.compiler.configuration.path),spfx.compiler.configuration);
  assert.equal(browser.actualLocalBuild,true);assert.deepEqual(browser.languages,['de','fr']);
  assert.equal(browser.realDeviceTest,false);assert.equal(browser.realM365HostTest,false);
  assert.ok(web.artifacts.some(row=>row.path===browser.asset.path&&row.sha256===browser.asset.sha256),'Observed asset is not final build');
  assert.deepEqual(await bind(browser.asset.path),browser.asset);
  for(const row of browser.screenshots)assert.deepEqual(await bind(row.path),row,row.path);
  for(const row of[browser.domObservation,...browser.accessibility])assert.deepEqual(await bind(row.path),row,row.path);
  assert.equal(exportProof.qualifiedPaths,34);assert.equal(exportProof.qualifiedCases,39);assert.equal(exportProof.syntheticInMemoryArtifacts,78);
  assert.equal(exportProof.actualIcsFilesSaved,0);assert.equal(exportProof.outlookImports,0);
  for(const row of exportProof.bindings)assert.deepEqual(await bind(row.path),row,'Export evidence input '+row.path);
  const manifest=await json(candidate+'/manifest.json');
  assert.equal(manifest.formatVersion,'13.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'13.0.0');
  assert.equal(manifest.releaseStatus,'candidate');assert.equal(manifest.sourceSummary.legalBasisReviewStatus,'pending');
  return{qa,spfx,web,pkg,bundle,browser,exportProof,native,independent};
}
async function freshGuard(write){
  const result=run(['scripts/check-ap23i3-preservation.mjs',...(write?['--write']:[])]);
  assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));
  const archive=run(['scripts/archive-ap23i2-acceptance.mjs','--check']);assert.equal(archive.status,0,archive.stderr);
  return JSON.parse(result.stdout);
}
const mode=process.argv[2];assert.ok(['--write','--check'].includes(mode)&&process.argv.length===3);
const guard=await freshGuard(mode==='--write');
const currentHead=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();assert.equal(currentHead,guard.head);
const actual=await verifyActual();
const paths=await inventory(actual.spfx,actual.web);
if(mode==='--check'){
  const saved=await json(proof);
  assert.equal(saved.workPackage,'AP23I3');assert.equal(saved.status,'local-technical-verification-passed-awaiting-human-acceptance');
  assert.equal(saved.head,currentHead);assert.equal(saved.i2TechnicallyAccepted,true);assert.equal(saved.professionalTechnicalAcceptance,false);
  assert.deepEqual(saved.contractDecision,{id:'DEC-2026-038',status:'approved',on:'2026-10-22'});
  assert.deepEqual(saved.formats,{manifest:'13.0.0',minimumConsumer:'13.0.0',administrativeCatalog:'6.0.0'});
  for(const key of['sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease','operatingChanges'])
    assert.equal(saved[key],false,key);
  assert.deepEqual(saved.counts,actual.bundle.counts);assert.deepEqual(saved.productTests,actual.qa.steps.find(step=>step.id==='product-regression').counts);
  assert.deepEqual(saved.candidateManifest,actual.bundle.manifest);assert.deepEqual(saved.actualPackage,actual.pkg.package);
  assert.equal(saved.protectedFiles,guard.protectedFilesVerified);assert.equal(saved.operatingPackagePreserved,true);
  assert.equal(saved.nativeReferenceCases,actual.native.referenceCases);assert.equal(saved.independentReferenceCases,actual.independent.referenceCases);
  assert.deepEqual(saved.browser,actual.browser);
  assert.deepEqual(saved.bindings.map(row=>row.path),paths,'Exact final evidence inventory');
  for(const row of saved.bindings)assert.deepEqual(await bind(row.path),row,row.path);
  assert.deepEqual(saved.supplemental.map(row=>row.id),['typecheck-final','whitespace'],'Exact supplemental inventory');
  for(const step of saved.supplemental){assert.equal(step.exitCode,0);assert.deepEqual(await bind(step.path),
    {path:step.path,byteLength:step.byteLength,sha256:step.sha256},'Supplemental descriptor '+step.id);}
  console.log(JSON.stringify({status:'bound-I3-result-reverified',bindings:saved.bindings.length,humanAcceptance:false,operatingChanges:false},null,2));
}else{
  const supplemental=[];
  for(const[id,args]of[['typecheck-final',['node_modules/typescript/bin/tsc','--noEmit']]]){
    const result=run(args),text=(result.stdout??'')+(result.stderr??''),path=out+'/'+id+'.txt';await writeFile(resolve(root,path),text);
    assert.equal(result.status,0,text);supplemental.push({id,exitCode:0,...await bind(path)});
  }
  const whitespace=spawnSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});assert.equal(whitespace.status,0,whitespace.stdout+whitespace.stderr);
  const whitespacePath=out+'/whitespace.txt';await writeFile(resolve(root,whitespacePath),whitespace.stdout+whitespace.stderr);
  supplemental.push({id:'whitespace',exitCode:0,...await bind(whitespacePath)});
  let localLinksChecked=0;
  for(const path of[...documents,...living]){
    const text=(await raw(path)).toString();if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Language style '+path);
    for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
      const target=match[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
      const absolute=resolve(root,dirname(path),decodeURIComponent(target));
      if(absolute!==resolve(root,proof))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' '+target);});
      localLinksChecked++;
    }
  }
  await freshGuard(false);
  const bindings=await Promise.all((await inventory(actual.spfx,actual.web)).map(bind));
  const report={workPackage:'AP23I3',asOf:'2026-10-22',status:'local-technical-verification-passed-awaiting-human-acceptance',head:currentHead,
    i2TechnicallyAccepted:true,contractDecision:{id:'DEC-2026-038',status:'approved',on:'2026-10-22'},professionalTechnicalAcceptance:false,
    sourceReleaseApproved:false,calendarExportEnabled:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,
    regularIntermediateRelease:false,operatingChanges:false,operatingPackagePreserved:true,
    protectedFiles:guard.protectedFilesVerified,counts:actual.bundle.counts,candidateManifest:actual.bundle.manifest,
    actualPackage:actual.pkg.package,productTests:actual.qa.steps.find(step=>step.id==='product-regression').counts,
    nativeReferenceCases:actual.native.referenceCases,independentReferenceCases:actual.independent.referenceCases,
    formats:{manifest:'13.0.0',minimumConsumer:'13.0.0',administrativeCatalog:'6.0.0'},
    browser:actual.browser,toolchain:{node:process.version,npm:'10.9.8'},supplemental,localLinksChecked,bindings,
    scope:'Local native integration only. Synthetic approvals are test-memory only. E/Q/P, AP5, AP21, mirrors, permissions, hosting and operating pins unchanged.'};
  await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');
  for(const row of bindings)assert.deepEqual(await bind(row.path),row,'Final readback '+row.path);
  console.log(JSON.stringify({status:report.status,protectedFiles:report.protectedFiles,bindings:bindings.length,localLinksChecked,
    productTests:report.productTests},null,2));
}
