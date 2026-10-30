// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from '../../scripts/archive-ap23j3-acceptance.mjs';
const falseProofKeys=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed',
  'installationPerformed','regularIntermediateRelease','operatingChanges'];
const falseAcceptanceKeys=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission',
  'commitPermission','sourcePushPermission','nextProfessionalStepStarted'];
const passed=n=>({tests:n,pass:n,fail:0,cancelled:0,skipped:0,todo:0});
const tap=value=>Object.entries(value).map(([key,n])=>'# '+key+' '+n+'\n').join('');
async function fixture(t,edit=()=>{}){
  const root=await mkdtemp(join(tmpdir(),'ap23j3-archive-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const records=new Map();
  async function file(path,value){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});
    await writeFile(join(root,path),bytes);const descriptor={path,byteLength:bytes.length,sha256:sha256(bytes)};records.set(path,descriptor);return descriptor;}
  const source=await file('source/file.ts','accepted J3 implementation');
  const historical=await file('historical/file.ts','accepted pre-J3 history');records.delete(historical.path);
  const older=await file('older/metadata-only.json','original older reference');records.delete(older.path);
  const extra=await file('tests/extra/context-input.test.cjs','frozen transitive test input');records.delete(extra.path);
  const stage='.work/stage',copy=await file(stage+'/spfx/src/copy.ts','accepted J3 implementation');
  const candidateRoot='candidate',artifacts=[];
  for(let index=0;index<44;index++)artifacts.push(await file(candidateRoot+'/part-'+index+'.json',{index}));
  const manifest=await file(candidateRoot+'/manifest.json',{releaseId:'candidate.1',releaseStatus:'candidate',formatVersion:'14.0.0',
    compatibility:{minimumConsumerFormatVersion:'14.0.0'},sourceSummary:{legalBasisReviewStatus:'pending'},
    artifacts:artifacts.map(item=>({...item,path:item.path.slice(candidateRoot.length+1)}))});
  const head='synthetic-J3-head',paths=Object.fromEntries(Object.keys(archiveConfig.paths).map(key=>[key,'proof/'+key+'.json']));
  const counts=archiveConfig.expectedCounts;
  await file(paths.bundle,{kind:'ap23j3-local-reference-bundle',releaseStatus:'candidate',releaseId:'candidate.1',contractDecision:'DEC-2026-039',contractStatus:'approved',
    sourceReview:'pending',referenceOnly:true,sourceReleaseApproved:false,productionActivation:false,calendarExportEnabled:false,counts,manifest,
    artifacts,generatedModules:[],basedOn:[older],buildScript:source});
  const firstSix=[];
  for(const id of['typecheck','native-schema-rebuild','candidate-rebuild','native-references','product-regression','host-lifecycle']){
    const count=archiveConfig.qaCounts[id],log=await file('proof/qa-'+id+'.txt',count?tap(passed(count)):'');
    firstSix.push({id,exitCode:0,log:log.path,...log,counts:count?passed(count):{}});
  }
  const initialCounts={tests:22,pass:21,fail:0,cancelled:1,skipped:0,todo:0};
  const initialLog=await file('proof/initial-web.txt',"not ok 1 - complete file\n  failureType: 'testTimeoutFailure'\n  error: 'test timed out after 180000ms'\n"+tap(initialCounts));
  const initialQa=await file('proof/initial-qa.json',{status:'failed',steps:[...firstSix,{id:'actual-web-bundle',exitCode:1,counts:initialCounts,log:initialLog.path,...initialLog}]});
  const oldRunner=await file('proof/initial-runner.mjs',"const args=['--test-timeout=180000'];\n");
  await file('scripts/check-ap23j3.mjs',"const args=['--test-timeout=900000'];\n");
  const testFile=await file('tests/public-app/test.ts','frozen complete web test file');
  const qaSteps=[...firstSix];
  const commands=[['actual-web-bundle','node',['--import','tsx','--test','--test-timeout=900000',testFile.path]],
    ['independent-native','python',['independent.py']],['independent-schema','python',['schema.py']],
    ['j2-archive','node',['archive.mjs','--check']],['j3-governance','node',['--test','governance.mjs']],['web-build','node',['build.mjs']]];
  for(const[id,command,args]of commands){const count=archiveConfig.qaCounts[id],log=await file('proof/qa-'+id+'.txt',count?tap(passed(count)):'');
    qaSteps.push({id,command,args,exitCode:0,log:log.path,...log,counts:count?passed(count):{}});}
  const asset=await file('.work/web/assets/app.js','exact minified web bundle');
  const screenshots=[];for(let index=0;index<6;index++)screenshots.push(await file('proof/screen-'+index+'.jpg','synthetic screenshot '+index));
  const dom=await file('proof/dom.json',{actual:true}),ax=await file('proof/ax.txt','actual observed labels');
  const browser={status:'passed',actualLocalBuild:true,languages:['de','fr'],realDeviceTest:false,realM365HostTest:false,actualExportEnabled:false,
    twoColumnLayout:true,horizontalOverflow:false,screenshots,asset,domObservation:dom,accessibility:[ax],cases:Array.from({length:10},(_,id)=>({id}))};
  await file(paths.browser,browser);
  await file(paths.web,{workPackage:'AP23J3',status:'passed',localOnly:true,deployable:false,sourceReleaseApproved:false,dataReleaseId:'candidate.1',
    protectedBefore:[source],protectedAfter:[source],artifacts:[asset]});
  const compiler=await file('spfx/tsconfig.json',{target:'es2015'}),pkg=await file(stage+'/spfx/sharepoint/local.sppkg','actual local package');
  const sourceTests=Array.from({length:22},(_,index)=>'test/source-'+index+'.test.ts');
  const historicalTests=Array.from({length:31},(_,index)=>'test-build/old-'+index+'.test.cjs');
  const stepArgs=[['scripts/sync-schemas.mjs'],['scripts/sync-product-source.mjs'],['--test','--test-timeout=240000',...sourceTests],
    ['test','--clean','--production'],['scripts/audit-product-css.mjs'],['package-solution','--production'],['--test','--test-timeout=240000',...historicalTests]];
  const steps=[];
  for(let index=0;index<7;index++){const log=await file(stage+'/step-'+index+'.txt',index===2?tap(passed(274)):index===6?tap(passed(170)):'build passed');
    steps.push({command:'synthetic',args:stepArgs[index],exitCode:0,log:log.path,...log});}
  const spfx={workPackage:'AP23J3',status:'passed',localOnly:true,deployable:false,protectedBefore:[source],protectedAfter:[source],
    operatingPackagePreserved:true,compiler:{target:'es2015',configuration:compiler},testPackage:pkg,stage,steps};
  await file(paths.spfx,spfx);await file(stage+'/verification.json',spfx);
  const packageLog=await file('proof/actual-package.txt',tap(passed(8)));
  await file(paths.packaged,{status:'passed',localOnly:true,syntheticApprovalsOnly:true,typecheckExitCode:0,package:pkg,counts:passed(8),log:packageLog.path,sha256:packageLog.sha256});
  await file(paths.exported,{status:'passed',qualifiedPaths:36,qualifiedCases:44,syntheticInMemoryArtifacts:88,actualIcsFilesSaved:0,outlookImports:0,
    humanReleaseApproval:false,sourceReleaseApproved:false,operatingChanges:false,bindings:[source]});
  await file(paths.native,{status:'passedNativeFullReferenceComparison',referenceCases:673,inputs:[source]});
  await file(paths.independent,{status:'passedIndependentNativeComparison',referenceCases:673,calendarEndEligibilityComparisons:2190,
    calendarProbes:13,unchangedRawArtifacts:42,openingProvenanceComparisons:96,inputs:[source]});
  const context={stage,head,sourceInputsBefore:[source,extra],stageInputsBefore:[{source,stage:copy}],webArtifactsBefore:[asset],
    unchangedEvidence:[],sourceReleaseApproved:false,operatingChanges:false,productChangesAllowed:false};
  const contextDescriptor=await file('proof/continuation-context.json',context);
  const continuation={context:contextDescriptor,initialQa,initialWebLog:initialLog,initialRunner:oldRunner,testFile,
    initialGlobalTimeoutMs:180000,finalGlobalTimeoutMs:900000,completeTestFileRepeated:true,firstSixStepsReused:true,
    assertionFailuresInInitialAttempt:0,initialCancelledTests:1,initialCommand:{args:['--import','tsx','--test','--test-timeout=180000',testFile.path]},
    finalCommand:{args:commands[0][2]},commands:commands.map(([id,command,args])=>({id,command,args})),
    sourceInputsBefore:context.sourceInputsBefore,sourceInputsAfter:context.sourceInputsBefore,
    stageInputsBefore:context.stageInputsBefore,stageInputsAfter:context.stageInputsBefore,
    webArtifactsBefore:context.webArtifactsBefore,webArtifactsAfter:context.webArtifactsBefore,unchangedEvidence:[],
    sourceReleaseApproved:false,operatingChanges:false};
  await file(paths.qa,{workPackage:'AP23J3',status:'passed',localOnly:true,sourceReleaseApproved:false,installationPerformed:false,githubPushPerformed:false,
    head,steps:qaSteps,webTimeBudgetContinuation:continuation});
  const guard=await file(paths.guard,{head,files:{[historical.path]:historical.sha256}});
  await file(paths.preservation,{head,status:'protected-integration-baselines-preserved',protectedFilesVerified:1,inventorySha256:guard.sha256,
    oldReaderAndArithmeticBytesPreserved:true,...Object.fromEntries(['acceptedLegalDataChanged','existingTestsChanged','acceptedResearchChanged',
      'historicalEvidenceChanged','userModifiedDocxChanged','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'].map(key=>[key,false]))});
  const proof={workPackage:'AP23J3',status:'local-technical-verification-passed-awaiting-human-acceptance',head,j2TechnicallyAccepted:true,
    operatingPackagePreserved:true,...Object.fromEntries(falseProofKeys.map(key=>[key,false])),
    contractDecision:{id:'DEC-2026-039',status:'approved',on:'2026-10-27'},formats:{manifest:'14.0.0',minimumConsumer:'14.0.0',administrativeCatalog:'7.0.0'},
    counts,protectedFiles:1,candidateManifest:manifest,actualPackage:pkg,browser,nativeReferenceCases:673,independentReferenceCases:673,
    calendarEndEligibilityComparisons:2190,calendarProbes:13,openingProvenanceComparisons:96,
    webTimeBudgetContinuation:continuation,supplemental:[],bindings:[...records.values()]};
  edit(proof);const proofDescriptor=await file('proof/completion.json',proof);
  const config={...archiveConfig,target:'accepted/archive',proofPath:proofDescriptor.path,proofSha256:proofDescriptor.sha256,
    bindingCount:proof.bindings.length,candidateRoot,protectedCount:1,requireGitHead:false,paths,
    sourceInputCount:2,stageInputCount:1,supplements:[extra],supplementContext:{path:contextDescriptor.path,sha256:contextDescriptor.sha256},
    supplementListSha256:sha256(Buffer.from(JSON.stringify([extra],null,2)+'\n'))};
  return{root,config,file,source,historical,proof,proofDescriptor,extra,older,contextDescriptor,initialLog,testFile};
}
test('exact capture includes closed transitive inputs and verifies without live sources',async t=>{
  const f=await fixture(t),preflight=await archiveAcceptance(f);assert.equal(preflight.mode,'source-preflight-only');
  await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
  const captured=await archiveAcceptance({...f,write:true});assert.equal(captured.files,f.proof.bindings.length+2);
  assert.equal(captured.explicitTransitivePayloads,1);await rm(join(f.root,f.source.path));await rm(join(f.root,f.extra.path));
  await rm(join(f.root,f.proofDescriptor.path));await f.file(f.historical.path,'later history');await rm(join(f.root,f.older.path));
  const checked=await archiveAcceptance({...f,readHead:()=>{throw Error('Must not read live HEAD');}});
  assert.equal(checked.mode,'archive-reverified');assert.equal(captured.receiptSha256,checked.receiptSha256);
  const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));
  assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.sourceReleaseApproved,false);assert.equal(receipt.nextProfessionalStepStarted,false);
  assert.deepEqual(receipt.explicitTransitivePayloads,[f.extra]);assert.equal(receipt.continuationInputsCopiedAutonomously.sourceInputs,2);
  assert.equal(receipt.upstreamReferencesRetainedAsMetadataNotRecursivelyExpanded.length,1);
});
test('repeat write only verifies existing exact archive',async t=>{const f=await fixture(t),a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(a.receiptSha256,b.receiptSha256);assert.equal(b.mode,'archive-reverified');});
test('all actual bound J3 bytes and closed 51 additions verify autonomously',async()=>{
  const actual=await archiveAcceptance();assert.equal(actual.mode,'archive-reverified');assert.equal(actual.files,1284);assert.equal(actual.explicitTransitivePayloads,51);
  assert.equal(actual.payloadBytes,76144504);assert.equal(actual.receiptSha256,'2dc1ad03491435959c2985934436be99bf7dcf924eb65fe71a4c6187ea505b1a');
});
for(const what of['source','extra','historical','older'])test('missing '+what+' input prevents archive',async t=>{const f=await fixture(t);await rm(join(f.root,f[what].path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
for(const what of['source','extra','historical','older'])test('modified '+what+' input rejected',async t=>{const f=await fixture(t);await f.file(f[what].path,'changed');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('extra raw candidate is rejected',async t=>{const f=await fixture(t);await f.file('candidate/unlisted.json',{});await assert.rejects(archiveAcceptance(f),/Exact raw candidate inventory/);});
test('duplicate original binding rejected',async t=>{const f=await fixture(t,p=>p.bindings.push(p.bindings[0]));await assert.rejects(archiveAcceptance(f),/Duplicate binding/);});
test('wrong original count rejected',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,bindingCount:0}}),/Original binding inventory/);});
test('unsafe relative paths rejected',()=>{for(const path of['../x','/x','a//b','a/../b','a\\b','C:/a','','a\0b','.','a/./b'])assert.throws(()=>safeRelative(path));});
for(const kind of['file','directory','target','receipt'])test('reject '+kind+' symlink',async t=>{
  const f=await fixture(t);if(kind==='file'){await f.file('other.ts','accepted J3 implementation');await rm(join(f.root,f.source.path));await symlink('../other.ts',join(f.root,f.source.path));}
  if(kind==='directory'){await f.file('other/file.ts','accepted J3 implementation');await rm(join(f.root,'source'),{recursive:true});await symlink('other',join(f.root,'source'));}
  if(kind==='target'){await mkdir(join(f.root,'accepted'));await mkdir(join(f.root,'elsewhere'));await symlink('../elsewhere',join(f.root,f.config.target));}
  if(kind==='receipt'){await archiveAcceptance({...f,write:true});await f.file('other-receipt.json',{});await rm(join(f.root,f.config.target,'receipt.json'));await symlink('../../other-receipt.json',join(f.root,f.config.target,'receipt.json'));}
  await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink/);
});
test('partial archive is never repaired silently',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
for(const what of['source','extra'])test('modified archived '+what+' rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/'+f[what].path,'changed');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('missing archived extra input rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await rm(join(f.root,f.config.target,f.extra.path));await assert.rejects(archiveAcceptance(f),{code:'ENOENT'});});
test('unexpected archive file rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/extra.txt','unexpected');await assert.rejects(archiveAcceptance(f),/Unexpected archive files/);});
test('unexpected archive directory rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await mkdir(join(f.root,f.config.target,'extra'));await assert.rejects(archiveAcceptance(f),/Unexpected archive directories/);});
test('altered receipt rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/receipt.json',{});await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('supplement cannot replace original input',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplements:[f.source]}}),/Only exact missing continuation inputs/);});
test('supplement cannot silently grow',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplements:[f.extra,f.source]}}),/Only exact missing continuation inputs/);});
test('supplement cannot silently shrink',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplements:[]}}),/Only exact missing continuation inputs/);});
test('supplement list hash is fixed',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplementListSha256:'0'.repeat(64)}}),/Closed supplement list hash/);});
test('context hash is fixed',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,supplementContext:{...f.config.supplementContext,sha256:'0'.repeat(64)}}}),/Closed original continuation context/);});
for(const key of falseProofKeys)test('historical false '+key+' unchanged',async t=>{const f=await fixture(t,p=>p[key]=true);await assert.rejects(archiveAcceptance(f),/Historical boundary/);});
for(const key of falseAcceptanceKeys)test('receipt cannot grant '+key,async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,[key]:true}}}),/Acceptance cannot raise/);});
for(const[key,value]of[['status','accepted'],['workPackage','AP23K1'],['j2TechnicallyAccepted',false],['operatingPackagePreserved',false],
  ['contractDecision',{id:'DEC-2026-039',status:'proposed'}],['nativeReferenceCases',672],['independentReferenceCases',672]])
  test('original '+key+' cannot be relabelled',async t=>{const f=await fixture(t,p=>p[key]=value);await assert.rejects(archiveAcceptance(f));});
test('fresh source HEAD must agree',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,requireGitHead:true},readHead:()=> 'different'}),/Git HEAD changed/);});
