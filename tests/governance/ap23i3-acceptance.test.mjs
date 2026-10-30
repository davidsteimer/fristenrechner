// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from '../../scripts/archive-ap23i3-acceptance.mjs';
const falseProofKeys=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed',
  'installationPerformed','regularIntermediateRelease','operatingChanges'];
const falseAcceptanceKeys=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission'];
const passed=n=>({tests:n,pass:n,fail:0,cancelled:0,skipped:0,todo:0});
const tap=value=>Object.entries(value).map(([key,n])=>'# '+key+' '+n+'\n').join('');
async function fixture(t,edit=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23i3-archive-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const records=new Map();
  async function file(path,value){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});
    await writeFile(join(root,path),bytes);const descriptor={path,byteLength:bytes.length,sha256:sha256(bytes)};records.set(path,descriptor);return descriptor;}
  const source=await file('source/file.ts','accepted I3 implementation');
  const historical=await file('historical/file.ts','accepted pre-I3 history');records.delete(historical.path);
  const candidateRoot='candidate',artifacts=[];
  for(let index=0;index<44;index++)artifacts.push(await file(candidateRoot+'/part-'+index+'.json',{index}));
  const manifest=await file(candidateRoot+'/manifest.json',{releaseId:'candidate.1',releaseStatus:'candidate',formatVersion:'13.0.0',
    compatibility:{minimumConsumerFormatVersion:'13.0.0'},sourceSummary:{legalBasisReviewStatus:'pending'},
    artifacts:artifacts.map(item=>({...item,path:item.path.slice(candidateRoot.length+1)}))});
  const head='synthetic-I3-head',paths=Object.fromEntries(Object.keys(archiveConfig.paths).map(key=>[key,'proof/'+key+'.json']));
  const counts=archiveConfig.expectedCounts;
  await file(paths.bundle,{kind:'ap23i3-local-reference-bundle',releaseStatus:'candidate',releaseId:'candidate.1',contractDecision:'DEC-2026-038',contractStatus:'approved',
    sourceReview:'pending',referenceOnly:true,sourceReleaseApproved:false,productionActivation:false,calendarExportEnabled:false,counts,manifest,
    artifacts,generatedModules:[],basedOn:[{path:'older/metadata-only.json',sha256:'1'.repeat(64)}],buildScript:source});
  const qaSteps=[];
  for(const id of['typecheck','native-schema-rebuild','candidate-rebuild','native-references','product-regression','host-lifecycle',
    'actual-web-bundle','independent-native','independent-schema','i2-archive','i3-governance','web-build']){
    const count=archiveConfig.qaCounts[id],log=await file('proof/qa-'+id+'.txt',count?tap(passed(count)):'');
    qaSteps.push({id,exitCode:0,log:log.path,...log,counts:count?passed(count):{}});
  }
  await file(paths.qa,{workPackage:'AP23I3',status:'passed',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,head,steps:qaSteps});
  const asset=await file('.work/web/assets/app.js','exact minified web bundle');
  const screenshots=[];for(let index=0;index<6;index++)screenshots.push(await file('proof/screen-'+index+'.jpg','synthetic screenshot '+index));
  const dom=await file('proof/dom.json',{actual:true}),ax=await file('proof/ax.txt','actual observed labels');
  const browser={status:'passed',actualLocalBuild:true,languages:['de','fr'],realDeviceTest:false,realM365HostTest:false,actualExportEnabled:false,
    twoColumnLayout:true,horizontalOverflow:false,screenshots,asset,domObservation:dom,accessibility:[ax]};
  await file(paths.browser,browser);
  await file(paths.web,{workPackage:'AP23I3',status:'passed',localOnly:true,deployable:false,sourceReleaseApproved:false,dataReleaseId:'candidate.1',
    protectedBefore:[source],protectedAfter:[source],artifacts:[asset]});
  const stage='.work/stage',compiler=await file('spfx/tsconfig.json',{target:'es2015'}),pkg=await file(stage+'/spfx/sharepoint/local.sppkg','actual local package');
  const steps=[];
  for(let index=0;index<4;index++){const log=await file(stage+'/step-'+index+'.txt',index===0?tap(passed(261)):'build passed');
    steps.push({command:'synthetic',args:[],exitCode:0,log:log.path,...log});}
  const oldCounts={tests:163,pass:160,fail:0,cancelled:3,skipped:0,todo:0};
  const oldLog=await file(stage+'/step-5.txt',tap(oldCounts));
  const testFiles=Array.from({length:31},(_,index)=>'test-build/old-'+index+'.test.cjs');
  const initial={status:'failed',steps:[...steps,{command:'node',args:['--test','--test-concurrency=2','--test-timeout=60000',...testFiles],exitCode:1,log:oldLog.path,...oldLog}]};
  const initialDescriptor=await file('proof/initial-timebudget.json',initial);await file(stage+'/verification.json',initial);
  const retestLog=await file(stage+'/step-5-budget240.txt',tap(passed(170)));records.delete(retestLog.path);
  const retest={command:'node',args:['--test','--test-concurrency=2','--test-timeout=240000',...testFiles],exitCode:0,log:retestLog.path,...retestLog,counts:passed(170)};
  const spfx={workPackage:'AP23I3',status:'passed',localOnly:true,deployable:false,protectedBefore:[source],protectedAfter:[source],
    operatingPackagePreserved:true,compiler:{target:'es2015',configuration:compiler},testPackage:pkg,stage,steps:[...steps,retest],
    initialTimeBudgetAttempt:initialDescriptor,verificationPath:stage+'/verification-budget240.json',historicalTestFileCount:31,
    retestOnly:true,compilerAndPackageRebuilt:false,timeBudgetRetest:retest};
  await file(paths.spfx,spfx);await file(spfx.verificationPath,spfx);
  const packageLog=await file('proof/actual-package.txt',tap(passed(8)));
  await file(paths.packaged,{status:'passed',localOnly:true,syntheticApprovalsOnly:true,typecheckExitCode:0,package:pkg,counts:passed(8),log:packageLog.path,sha256:packageLog.sha256});
  await file(paths.exported,{status:'passed',qualifiedPaths:34,qualifiedCases:39,syntheticInMemoryArtifacts:78,actualIcsFilesSaved:0,outlookImports:0,
    humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,bindings:[source]});
  await file(paths.native,{status:'passedNativeFullReferenceComparison',referenceCases:249,inputs:[source]});
  await file(paths.independent,{status:'passedIndependentNativeComparison',referenceCases:249,calendarEndEligibilityComparisons:1460,
    calendarProbes:15,unchangedRawArtifacts:42,inputs:[source]});
  const guard=await file(paths.guard,{head,files:{[historical.path]:historical.sha256}});
  await file(paths.preservation,{head,status:'protected-integration-baselines-preserved',protectedFilesVerified:1,inventorySha256:guard.sha256,
    oldReaderAndArithmeticBytesPreserved:true,...Object.fromEntries(['acceptedLegalDataChanged','existingTestsChanged','acceptedResearchChanged',
      'historicalEvidenceChanged','userModifiedDocxChanged','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'].map(key=>[key,false]))});
  const proof={workPackage:'AP23I3',status:'local-technical-verification-passed-awaiting-human-acceptance',head,i2TechnicallyAccepted:true,
    operatingPackagePreserved:true,...Object.fromEntries(falseProofKeys.map(key=>[key,false])),
    contractDecision:{id:'DEC-2026-038',status:'approved',on:'2026-10-22'},formats:{manifest:'13.0.0',minimumConsumer:'13.0.0',administrativeCatalog:'6.0.0'},
    counts,protectedFiles:1,candidateManifest:manifest,actualPackage:pkg,browser,nativeReferenceCases:249,independentReferenceCases:249,supplemental:[],bindings:[...records.values()]};
  edit(proof);const proofDescriptor=await file('proof/completion.json',proof);
  const config={...archiveConfig,target:'accepted/archive',proofPath:proofDescriptor.path,proofSha256:proofDescriptor.sha256,
    bindingCount:proof.bindings.length,candidateRoot,protectedCount:1,requireGitHead:false,paths,supplements:[retestLog]};
  return{root,config,file,source,historical,proof,proofDescriptor,retestLog};
}
test('read-only preflight, exact capture and source-independent verification',async t=>{
  const f=await fixture(t),first=await archiveAcceptance(f);assert.equal(first.mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const captured=await archiveAcceptance({...f,write:true});assert.equal(captured.files,f.proof.bindings.length+2);assert.equal(captured.explicitTransitivePayloads,1);
  await rm(join(f.root,f.source.path));await rm(join(f.root,f.proofDescriptor.path));await f.file(f.historical.path,'later history');
  const checked=await archiveAcceptance({...f,readHead:()=>{throw Error('Must not read live HEAD');}});
  assert.equal(checked.mode,'archive-reverified');assert.equal(captured.receiptSha256,checked.receiptSha256);
  const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));
  assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.sourceReleaseApproved,false);assert.equal(receipt.candidate.files,45);
  assert.deepEqual(receipt.explicitTransitivePayloads,[f.retestLog]);assert.equal(receipt.upstreamReferencesRetainedAsMetadataNotRecursivelyExpanded.length,1);
});
test('repeat write verifies rather than overwrites',async t=>{const f=await fixture(t),a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(a.receiptSha256,b.receiptSha256);assert.equal(b.mode,'archive-reverified');});
test('missing original bound file prevents any archive',async t=>{const f=await fixture(t);await rm(join(f.root,f.source.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
test('missing successful transitive retest log prevents any archive',async t=>{const f=await fixture(t);await rm(join(f.root,f.retestLog.path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});});
test('modified original bound file rejected',async t=>{const f=await fixture(t);await f.file(f.source.path,'modified');await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256 mismatch/);});
test('modified successful retest log rejected',async t=>{const f=await fixture(t);await f.file(f.retestLog.path,'changed');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('original historical guard checked without recursively copying',async t=>{const f=await fixture(t);await f.file(f.historical.path,'changed');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('extra raw candidate file rejected',async t=>{const f=await fixture(t);await f.file('candidate/unlisted.json',{});await assert.rejects(archiveAcceptance(f),/Exact raw candidate inventory/);});
test('duplicate original descriptor rejected',async t=>{const f=await fixture(t,p=>p.bindings.push(p.bindings[0]));await assert.rejects(archiveAcceptance(f),/Duplicate binding/);});
test('incorrect proof binding count rejected',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,bindingCount:0}}),/Original binding inventory/);});
test('unsafe relative paths rejected',()=>{for(const path of['../x','/x','a//b','a/../b','a\\b','C:/a','','a\0b','.','a/./b'])assert.throws(()=>safeRelative(path));});
for(const kind of['file','directory','target','receipt'])test('reject '+kind+' symlink',async t=>{
  const f=await fixture(t);
  if(kind==='file'){await f.file('other.ts','accepted I3 implementation');await rm(join(f.root,f.source.path));await symlink('../other.ts',join(f.root,f.source.path));}
  if(kind==='directory'){await f.file('other/file.ts','accepted I3 implementation');await rm(join(f.root,'source'),{recursive:true});await symlink('other',join(f.root,'source'));}
  if(kind==='target'){await mkdir(join(f.root,'accepted'));await mkdir(join(f.root,'elsewhere'));await symlink('../elsewhere',join(f.root,f.config.target));}
  if(kind==='receipt'){await archiveAcceptance({...f,write:true});await f.file('other-receipt.json',{});await rm(join(f.root,f.config.target,'receipt.json'));await symlink('../../other-receipt.json',join(f.root,f.config.target,'receipt.json'));}
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink/);
});
test('partial archive never repaired silently',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('changed archived payload rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/'+f.source.path,'changed');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('missing archived payload rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await rm(join(f.root,f.config.target,f.source.path));await assert.rejects(archiveAcceptance(f),{code:'ENOENT'});});
test('unexpected archived file rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/extra.txt','unexpected');await assert.rejects(archiveAcceptance(f),/Unexpected archive files/);});
test('unexpected archived directory rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await mkdir(join(f.root,f.config.target,'extra'));await assert.rejects(archiveAcceptance(f),/Unexpected archive directories/);});
test('altered receipt rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/receipt.json',{});await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('supplement cannot duplicate or replace a primary binding',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplements:[f.source]}}),/Duplicate binding/);});
test('supplement list cannot silently grow',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplements:[f.retestLog,f.source]}}),/One closed retest-log supplement/);});
for(const key of falseProofKeys)test('historical false boundary '+key+' unchanged',async t=>{const f=await fixture(t,p=>p[key]=true);await assert.rejects(archiveAcceptance(f),/Historical boundary/);});
for(const key of falseAcceptanceKeys)test('new receipt cannot raise '+key,async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,[key]:true}}}),/Acceptance cannot raise/);});
for(const[key,value]of[['status','accepted'],['workPackage','AP23J1'],['i2TechnicallyAccepted',false],['operatingPackagePreserved',false],
  ['contractDecision',{id:'DEC-2026-038',status:'proposed'}],['nativeReferenceCases',248],['independentReferenceCases',248]])
  test('original '+key+' not relabelled',async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(archiveAcceptance(f));});
test('fresh source HEAD must agree',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,requireGitHead:true},readHead:()=> 'different'}),/Git HEAD changed/);});
