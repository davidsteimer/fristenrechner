// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from '../../scripts/archive-ap23h3-acceptance.mjs';

const counts=tests=>({tests,pass:tests,fail:0,cancelled:0,skipped:0,todo:0});
const tap=tests=>Object.entries(counts(tests)).map(([key,value])=>'# '+key+' '+value).join('\n')+'\n';
async function fixture(t,modifyProof=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23h3-archive-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
  async function file(path,value){
    const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));
    await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
    return{path,byteLength:bytes.length,sha256:sha256(bytes)};
  }
  const source=await file('src/a.ts','accepted source'),living=await file('docs/living.md','accepted living text');
  const registryA=await file('src/registry-a.ts','accepted registry A'),registryB=await file('src/registry-b.ts','accepted registry B');
  const old=await file('historical/old.json','unchanged old bytes');
  const beforeA=sha256(Buffer.from('old registry A')),beforeB=sha256(Buffer.from('old registry B'));
  const head='1'.repeat(40),artifact=await file('candidate/data.json',{candidate:true});
  const manifest=await file('candidate/manifest.json',{formatVersion:'12.0.0',compatibility:{minimumConsumerFormatVersion:'12.0.0'},releaseStatus:'candidate',releaseId:'local-reference.1',artifacts:[{...artifact,path:'data.json'}]});
  const testLog=await file('proof/test.log',tap(1)),packageLog=await file('proof/package.log',tap(1)),reviewLog=await file('proof/review.log',tap(1));
  const buildLogs=[];for(let i=0;i<5;i++)buildLogs.push(await file('stage/build-'+i+'.log',i===0||i===4?tap(1):'build step passed'));
  const pkg=await file('stage/local.sppkg','synthetic local package'),compiler=await file('stage/tsconfig.json',{target:'es2015'});
  const asset=await file('stage/web.js','synthetic browser asset'),screenshot=await file('proof/screenshot.png','synthetic screenshot bytes');
  const guard=await file('proof/guard.json',{capturedBeforeIntegration:true,head,files:{[old.path]:old.sha256,[registryA.path]:beforeA,[registryB.path]:beforeB}});
  const mutable=await file('proof/mutable.json',{capturedBeforeIntegration:true,head,existingFiles:{[source.path]:source.sha256},livingAtStart:{[living.path]:living.sha256}});
  const extraFiles={[registryA.path]:{beforeSha256:beforeA},[registryB.path]:{beforeSha256:beforeB}};
  const additional=await file('proof/additional.json',{productOperatingChanges:false,files:extraFiles});
  const preservation=await file('proof/preservation.json',{head,status:'protected-baselines-preserved',originalProtectedBindings:3,protectedFilesVerified:1,
    additionalMutableInputs:[{path:registryA.path,before:beforeA,current:registryA.sha256},{path:registryB.path,before:beforeB,current:registryB.sha256}],
    intendedMutableInputs:[{path:source.path,before:source.sha256,current:source.sha256}],livingStatus:[{path:living.path,before:living.sha256,current:living.sha256}],
    inventorySha256:{'guard.json':guard.sha256,'mutable.json':mutable.sha256,'additional.json':additional.sha256},
    oldReaderAndArithmeticBytesPreserved:true,acceptedLegalDataChanged:false,existingTestsChanged:false,historicalResearchReportsChanged:false,
    userModifiedDocxChanged:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false});
  const componentCounts={artifacts:1,totalFilesIncludingManifest:2};
  const qa=await file('proof/qa.json',{workPackage:'AP23H3',status:'passed',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,
    head,manifestSha256:manifest.sha256,protectedFiles:1,explicitAdditionalRegistryDispatches:2,originalProtectedBindings:3,
    steps:[{id:'positive',exitCode:0,log:testLog.path,sha256:testLog.sha256,byteLength:testLog.byteLength,counts:counts(1)}]});
  const bundle=await file('proof/bundle.json',{kind:'ap23h3-local-reference-bundle',releaseStatus:'candidate',releaseId:'local-reference.1',contractDecision:'DEC-2026-037',contractStatus:'approved',
    sourceReleaseApproved:false,productionActivation:false,calendarExportEnabled:false,referenceOnly:true,sourceReview:'pending',counts:componentCounts,
    manifest,artifacts:[artifact],generatedModules:[source,registryA,registryB],buildScript:source,basedOn:[]});
  const web=await file('proof/web.json',{workPackage:'AP23H3',status:'passed',localOnly:true,deployable:false,sourceReleaseApproved:false,dataReleaseId:'local-reference.1',
    protectedBefore:[old],protectedAfter:[old],artifacts:[asset]});
  const spfx=await file('proof/spfx.json',{workPackage:'AP23H3',status:'passed',localOnly:true,deployable:false,operatingPackagePreserved:true,
    protectedBefore:[old],protectedAfter:[old],testPackage:pkg,compiler:{target:'es2015',configuration:compiler},steps:buildLogs.map(x=>({exitCode:0,log:x.path,sha256:x.sha256,byteLength:x.byteLength}))});
  const actual=await file('proof/actual.json',{workPackage:'AP23H3',status:'passed',localOnly:true,syntheticApprovalsOnly:true,typecheckExitCode:0,
    counts:counts(1),package:pkg,log:packageLog.path,sha256:packageLog.sha256});
  const browserValue={status:'passed',actualLocalBuild:true,languages:['de','fr'],asset,screenshots:[screenshot],layout:{horizontalOverflow:false,formGridColumns:['1fr','1fr']},
    realDeviceTest:false,realM365HostTest:false,narrowViewportVisualTest:false,sourceReleaseApproved:false,operatingPermission:false};
  const browser=await file('proof/browser.json',browserValue);
  const exported=await file('proof/export.json',{workPackage:'AP23H3',status:'passed',kind:'supplemental-in-memory-export-verification',languages:['de','fr'],qualifiedPaths:1,
    syntheticInMemoryArtifacts:2,referenceExportsDenied:1,changedInputsDenied:1,resultClonesDenied:1,contextClonesDenied:1,actualIcsFilesSaved:0,outlookImports:0,
    humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,bindings:[source]});
  const review=await file('proof/review.json',{status:'passed',kind:'separate-ai-technical-countercheck',humanFourEyesReview:false,professionalAcceptance:false,operatingPermission:false,
    tests:{...counts(1),log:reviewLog},bindings:[source]});
  const evidence=[qa,bundle,web,spfx,actual,browser,exported,review,guard,mutable,additional,preservation,...buildLogs,packageLog,testLog,reviewLog];
  const proof={workPackage:'AP23H3',status:'local-technical-verification-passed-awaiting-human-acceptance',head,
    professionalTechnicalAcceptance:false,sourceReleaseApproved:false,calendarExportEnabled:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,regularIntermediateRelease:false,
    operatingPackagePreserved:true,protectedFiles:1,separatelyBoundRegistryChanges:2,formats:{manifest:'12.0.0',minimumConsumer:'12.0.0',administrativeCatalog:'5.0.0'},
    sourceBindings:[source,living,registryA,registryB],evidence,candidateManifest:manifest,counts:componentCounts,browser:browserValue,supplemental:[]};
  modifyProof(proof);const descriptor=await file('proof/completion.json',proof);
  const config={...archiveConfig,target:'archive/accepted',proofPath:descriptor.path,proofSha256:descriptor.sha256,sourceCount:4,evidenceCount:evidence.length,candidateFiles:2,
    upstreamCount:0,originalProtectedCount:3,protectedCount:1,mutableCount:1,livingCount:1,requireGitHead:false,
    qaPath:qa.path,bundlePath:bundle.path,webPath:web.path,spfxPath:spfx.path,packagePath:actual.path,browserPath:browser.path,exportPath:exported.path,reviewPath:review.path,
    guardPaths:[guard.path,mutable.path,additional.path,preservation.path],qaCounts:{positive:1},spfxCounts:[1,1],packageCount:1,reviewCount:1,screenshotCount:1,qualifiedPaths:1,expectedCounts:componentCounts};
  async function change(path,modify){
    const value=JSON.parse(await readFile(join(root,path)));modify(value);const changed=await file(path,value);
    const p=JSON.parse(await readFile(join(root,config.proofPath)));
    p.sourceBindings=p.sourceBindings.map(x=>x.path===path?changed:x);p.evidence=p.evidence.map(x=>x.path===path?changed:x);
    const d=await file(config.proofPath,p);config.proofSha256=d.sha256;
    return changed;
  }
  return{root,file,change,config,source,living,registryA,registryB,old,artifact,asset,screenshot,buildLogs,testLog};
}
test('read-only preflight, exclusive copy and autonomous re-verification preserve original false flags',async t=>{
  const f=await fixture(t),before=await archiveAcceptance(f);assert.equal(before.mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const created=await archiveAcceptance({...f,write:true});assert.equal(created.mode,'archive-created');assert.equal(created.candidateFiles,2);
  assert.equal(created.historicalProtectedInputsNotRecopied,1);assert.equal(created.separatelyBoundRegistryChanges,2);
  await assert.rejects(readFile(join(f.root,f.config.target,f.old.path)),{code:'ENOENT'});
  const archivedProof=JSON.parse(await readFile(join(f.root,f.config.target,f.config.proofPath)));
  assert.equal(archivedProof.professionalTechnicalAcceptance,false);assert.equal(archivedProof.sourceReleaseApproved,false);
  const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.deployable,false);
  await writeFile(join(f.root,f.source.path),'later source');await writeFile(join(f.root,f.old.path),'later historical data');
  await writeFile(join(f.root,f.living.path),'later living text');await writeFile(join(f.root,f.registryA.path),'later registry');
  const checked=await archiveAcceptance(f);assert.equal(checked.mode,'archive-reverified');assert.equal(checked.receiptSha256,created.receiptSha256);
});
for(const key of['source','artifact','old','registryA','asset','screenshot'])test('changed '+key+' halts before creating an archive',async t=>{
  const f=await fixture(t);await writeFile(join(f.root,f[key].path),'changed bytes');await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256 mismatch/);
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
});
test('missing candidate file halts before writing',async t=>{const f=await fixture(t);await rm(join(f.root,f.artifact.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});});
test('unsafe paths include traversal, absolute paths, NUL, ambiguous separators and drive letters',()=>{
  for(const path of['../a','/a','a/../b','./a','a//b','a\\b','C:/a','','a\0b'])assert.throws(()=>safeRelative(path));
  assert.equal(safeRelative('.work/stage/file.js'),'.work/stage/file.js');
});
for(const kind of['file','directory'])test('source '+kind+' symlink is refused',async t=>{
  const f=await fixture(t);if(kind==='file'){await f.file('other.ts','accepted source');await rm(join(f.root,f.source.path));await symlink('../other.ts',join(f.root,f.source.path));}
  else{await f.file('other/a.ts','accepted source');await rm(join(f.root,'src'),{recursive:true});await symlink('other',join(f.root,'src'));}
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink not allowed/);
});
test('partial archive halts without repair',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('repeated write verifies rather than replacing the receipt',async t=>{const f=await fixture(t),a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(b.mode,'archive-reverified');assert.equal(a.receiptSha256,b.receiptSha256);});
test('archive payload tampering is rejected independently of the live source',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await writeFile(join(f.root,f.config.target,f.source.path),'tampered');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('archive receipt tampering is rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await writeFile(join(f.root,f.config.target,'receipt.json'),'{}');await assert.rejects(archiveAcceptance(f),/exact derived acceptance record/);});
for(const kind of['file','empty directory'])test('unexpected archive '+kind+' is rejected',async t=>{
  const f=await fixture(t);await archiveAcceptance({...f,write:true});
  if(kind==='file')await f.file(f.config.target+'/extra.bin','extra');else await mkdir(join(f.root,f.config.target,'extra-dir'));
  await assert.rejects(archiveAcceptance(f),/Unexpected archive/);
});
test('archive symlinks are rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await rm(join(f.root,f.config.target,f.source.path));await symlink(join(f.root,f.source.path),join(f.root,f.config.target,f.source.path));await assert.rejects(archiveAcceptance(f),/Symlink not allowed/);});
for(const[key,value]of[['workPackage','AP23G3'],['status','accepted'],['professionalTechnicalAcceptance',true],['sourceReleaseApproved',true],['calendarExportEnabled',true],
  ['commitCreated',true],['sourcePushPerformed',true],['installationPerformed',true],['regularIntermediateRelease',true],['operatingPackagePreserved',false]])
test('historical proof boundary remains exact: '+key,async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(archiveAcceptance({...f,write:true}));});
for(const key of['sourceCount','evidenceCount','candidateFiles','originalProtectedCount','protectedCount','additionalCount','mutableCount','livingCount'])
test('inventory count is enforced: '+key,async t=>{const f=await fixture(t);f.config[key]++;await assert.rejects(archiveAcceptance({...f,write:true}));});
test('conflicting descriptor in a proof is rejected',async t=>{const f=await fixture(t,p=>p.evidence.push({...p.sourceBindings[0],sha256:'0'.repeat(64)}));await assert.rejects(archiveAcceptance({...f,write:true}),/Conflicting descriptor/);});
test('duplicate primary source bindings are rejected',async t=>{const f=await fixture(t,p=>p.sourceBindings.push(p.sourceBindings[0]));f.config.sourceCount=5;await assert.rejects(archiveAcceptance({...f,write:true}),/Duplicate primary binding/);});
test('unbound build report is refused',async t=>{const f=await fixture(t);f.config.webPath='unbound.json';await assert.rejects(archiveAcceptance({...f,write:true}),/not bound/);});
test('unbound build log is refused',async t=>{
  const f=await fixture(t);await f.change(f.config.proofPath,p=>p.evidence=p.evidence.filter(x=>x.path!==f.buildLogs[1].path));f.config.evidenceCount--;
  await assert.rejects(archiveAcceptance({...f,write:true}),/Unbound build log/);
});
test('all generated modules must be explicitly bound in sources',async t=>{
  const f=await fixture(t),unknown=await f.file('src/new-module.ts','unbound module');
  await f.change(f.config.bundlePath,b=>b.generatedModules[0]=unknown);await assert.rejects(archiveAcceptance({...f,write:true}),/Unbound generated module/);
});
test('generated-module hash conflicts are refused',async t=>{const f=await fixture(t);await f.change(f.config.bundlePath,b=>b.generatedModules[0].sha256='0'.repeat(64));await assert.rejects(archiveAcceptance({...f,write:true}),/Unbound generated module/);});
test('missing numerical QA gate is refused',async t=>{const f=await fixture(t);await f.change(f.config.qaPath,q=>q.steps=[]);await assert.rejects(archiveAcceptance({...f,write:true}),/Missing numerical QA step/);});
test('failed numerical QA is refused even after coherent report rebinding',async t=>{const f=await fixture(t);await f.change(f.config.qaPath,q=>q.steps[0].counts.fail=1);await assert.rejects(archiveAcceptance({...f,write:true}),/Non-passing tests/);});
test('a successful JSON claim cannot hide a failed TAP log',async t=>{
  const f=await fixture(t),bad=await f.file(f.testLog.path,tap(2));
  await f.change(f.config.qaPath,q=>{q.steps[0].sha256=bad.sha256;q.steps[0].byteLength=bad.byteLength;});
  await f.change(f.config.proofPath,p=>p.evidence=p.evidence.map(x=>x.path===bad.path?bad:x));
  await assert.rejects(archiveAcceptance({...f,write:true}),/Unexpected test inventory/);
});
test('candidate is not silently treated as format11',async t=>{
  const f=await fixture(t),m=JSON.parse(await readFile(join(f.root,'candidate/manifest.json')));m.formatVersion='11.0.0';const d=await f.file('candidate/manifest.json',m);
  await f.change(f.config.bundlePath,b=>b.manifest=d);await f.change(f.config.proofPath,p=>p.candidateManifest=d);
  await assert.rejects(archiveAcceptance({...f,write:true}));
});
test('exact raw candidate inventory must also appear in the bundle',async t=>{const f=await fixture(t);await f.change(f.config.bundlePath,b=>b.artifacts=[]);await assert.rejects(archiveAcceptance({...f,write:true}));});
test('failed SPFx build step is refused',async t=>{const f=await fixture(t);await f.change(f.config.spfxPath,s=>s.steps[2].exitCode=1);await assert.rejects(archiveAcceptance({...f,write:true}));});
test('actual package count and skipped tests are enforced',async t=>{const f=await fixture(t);await f.change(f.config.packagePath,p=>p.counts.skipped=1);await assert.rejects(archiveAcceptance({...f,write:true}),/Non-passing tests/);});
test('browser proof does not acquire a real M365 host claim',async t=>{
  const f=await fixture(t);await f.change(f.config.browserPath,b=>b.realM365HostTest=true);await f.change(f.config.proofPath,p=>p.browser.realM365HostTest=true);
  await assert.rejects(archiveAcceptance({...f,write:true}),/Browser boundary/);
});
test('browser asset must be the actual bound build asset',async t=>{
  const f=await fixture(t),other=await f.file('stage/other.js','other');await f.change(f.config.browserPath,b=>b.asset=other);await f.change(f.config.proofPath,p=>p.browser.asset=other);
  await assert.rejects(archiveAcceptance({...f,write:true}),/Browser asset not in actual web build/);
});
test('in-memory export evidence does not imply saved ICS files',async t=>{const f=await fixture(t);await f.change(f.config.exportPath,e=>e.actualIcsFilesSaved=1);await assert.rejects(archiveAcceptance({...f,write:true}),/actualIcsFilesSaved/);});
test('AI countercheck does not acquire human four-eyes status',async t=>{const f=await fixture(t);await f.change(f.config.reviewPath,r=>r.humanFourEyesReview=true);await assert.rejects(archiveAcceptance({...f,write:true}));});
test('the two explicit registry exceptions cannot be silently expanded',async t=>{const f=await fixture(t);await f.change(f.config.guardPaths[2],a=>a.files['src/third.ts']={beforeSha256:'0'.repeat(64)});await assert.rejects(archiveAcceptance({...f,write:true}));});
