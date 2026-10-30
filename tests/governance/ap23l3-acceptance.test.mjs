// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from '../../scripts/archive-ap23l3-acceptance.mjs';
const proofFalse=['professionalTechnicalAcceptance','sourceReleaseApproved','calendarExportEnabled','commitCreated','sourcePushPerformed','installationPerformed','regularIntermediateRelease','operatingChanges'];
const receiptFalse=['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission','nextProfessionalStepStarted','additionalRiskDecision'];
const passed=n=>({tests:n,pass:n,fail:0,cancelled:0,skipped:0,todo:0});
const tap=n=>Object.entries(passed(n)).map(([key,value])=>`# ${key} ${value}\n`).join('');
const rows=n=>Array.from({length:n},(_,i)=>({id:'fixture-'+i}));
const originalCounts={administrativePaths:196,preservedAdministrativePaths:165,newAdministrativePaths:31,calendars:35,totalHolidayRules:499,
 preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromL2:42,proceduralSupplementDates:2};
const independentCounts={originalReferences:83,independentProbes:697,physicalCalendarProbes:12,mutationSensitivities:3};
const nativeCounts={consumerReferences:83,syntheticCases:20,oldNativeReferences:165,consumerOutcomes:{datedResearchValue:54,qualificationBoundaryProposed:22,researchWindowBoundary:5,unresolvedBoundaryProposed:2}};
async function fixture(t,editProof=()=>{},editReport=()=>{}){
 const root=await mkdtemp(join(tmpdir(),'ap23l3-acceptance-'));t.after(()=>rm(root,{recursive:true,force:true}));const records=new Map();
 async function file(path,value){const bytes=Buffer.from(typeof value==='string'?value:JSON.stringify(value));await mkdir(dirname(join(root,path)),{recursive:true});await writeFile(join(root,path),bytes);
  const descriptor={path,byteLength:bytes.length,sha256:sha256(bytes)};records.set(path,descriptor);return descriptor;}
 async function report(key,path,value){editReport(key,value);return file(path,value);}
 const source=await file('source/current.ts','accepted native integration'),historical=await file('history/prior.ts','unrecopied protected input');records.delete(historical.path);
 const guard=await file('proof/guard.json',{files:{[historical.path]:historical.sha256}}),pkg=await file('.work/stage/spfx/sharepoint/local.sppkg','actual fixture package');
 const paths=Object.fromEntries(Object.keys(archiveConfig.paths).map(key=>[key,'proof/'+key+'.json']));
 const manifest=await file('candidate/manifest.json',{releaseStatus:'candidate',formatVersion:'16.0.0',compatibility:{minimumConsumerFormatVersion:'16.0.0'},sourceSummary:{legalBasisReviewStatus:'pending'}});
 await report('bundle',paths.bundle,{counts:originalCounts,manifest,artifacts:[source],referenceOnly:true,sourceReleaseApproved:false});
 const qaCounts={'product-regression':2,'host-lifecycle':3,'actual-web-bundle':4,governance:5},qaSteps=[];
 for(const[id,count]of Object.entries(qaCounts)){const log=await file('proof/'+id+'.txt',tap(count));qaSteps.push({id,exitCode:0,log:log.path,byteLength:log.byteLength,sha256:log.sha256,counts:passed(count)});}
 for(let index=0;index<12;index++){const log=await file('proof/qa-'+index+'.txt','successful');qaSteps.push({id:'other-'+index,exitCode:0,log:log.path,byteLength:log.byteLength,sha256:log.sha256,counts:{}});}
 await report('qa',paths.qa,{workPackage:'AP23L3',status:'passed',head:'fixture-head',steps:qaSteps});
 const stage='.work/stage',spfxSteps=[];
 for(let index=0;index<7;index++){const log=await file('proof/spfx-'+index+'.txt',index===2?tap(3):index===6?tap(4):'successful');
  spfxSteps.push({exitCode:0,log:log.path,byteLength:log.byteLength,sha256:log.sha256,args:index===2?['test/a.test.ts','test/b.test.ts']:index===6?['test-build/a.test.cjs','test-build/b.test.cjs']:[]});}
 const spfx={status:'passed',localOnly:true,deployable:false,protectedBefore:[source],protectedAfter:[source],operatingPackagePreserved:true,testPackage:pkg,steps:spfxSteps,stage};
 await report('spfx',paths.spfx,spfx);await file(stage+'/verification.json',spfx);
 await report('web',paths.web,{status:'passed',localOnly:true,deployable:false,protectedBefore:[source],protectedAfter:[source],artifacts:[source]});
 const packageLog=await file('proof/package.txt',tap(1));
 await report('packaged',paths.packaged,{status:'passed',package:pkg,typecheckExitCode:0,localOnly:true,syntheticApprovalsOnly:true,counts:passed(1),log:packageLog.path,sha256:packageLog.sha256});
 await report('native',paths.native,{status:'passed-native-reference-only',consumerCases:83,results:rows(83),syntheticCases:20,syntheticResults:rows(20),oldNativeCases:165,oldResults:rows(165),
  evidence:[source],sourceReleaseApproved:false,calendarExportEnabled:false});
 await report('independent',paths.independent,{status:'passed',counts:independentCounts,results:rows(83),independentProbeResults:rows(697),physicalCalendarProbeResults:rows(12),mutationSensitivity:rows(3),
  nodeComparison:{matchedFixtures:83,syntheticProbeComparisons:rows(20),oldNativeMathematicalComparisons:165,inheritedReferenceComparisons:673,
   evidence:source,inheritedEvidence:source,acceptedInheritedEvidence:source},
  binding:{guard,manifest,catalog:source,suite:source,inputVocabularySchema:source,sourceEvidence:[source]},
  importsProductCode:false,importsNodeCode:false,importsResearchOracle:false,usesResearchCalendarOrPathModel:false,annotationRemoval:false,implicitCaseFacts:false,
  sourceReleaseApproved:false,calendarExportEnabled:false});
 await report('inherited',paths.inherited,{status:'passed-inherited-reference-cases',referenceCases:673,results:rows(673),evidence:[source],sourceReleaseApproved:false,calendarExportEnabled:false});
 await report('browser',paths.browser,{status:'passed',realDeviceOrM365Test:false,cases:[{id:'fixture'}],evidence:[source],sourceReleaseApproved:false});
 await report('exported',paths.exported,{status:'passed',qualifiedCases:54,qualifiedPaths:31,syntheticInMemoryArtifacts:108,blockedCasesDenied:29,
  actualIcsFilesSaved:0,outlookImports:0,humanReleaseApproval:false,bindings:[source],sourceReleaseApproved:false});
 const proof={workPackage:'AP23L3',status:'local-technical-verification-passed-awaiting-human-acceptance',l2TechnicallyAccepted:true,operatingPackagePreserved:true,head:'fixture-head',
  contractDecision:{id:'DEC-2026-041',status:'approved',on:'2026-10-27'},formats:{manifest:'16.0.0',minimumConsumer:'16.0.0',administrativeCatalog:'9.0.0'},
  ...Object.fromEntries(proofFalse.map(key=>[key,false])),protectedFiles:1,counts:structuredClone(originalCounts),qaCounts,
  hostCounts:{sourceTestFiles:2,historicalTestFiles:2,copiedSourceInputs:1,sourceTests:3,historicalPackageTests:4,actualPackageTests:1},
  nativeCounts:structuredClone(nativeCounts),independentCounts:structuredClone(independentCounts),inheritedReferenceCases:673,candidateManifest:manifest,actualPackage:pkg,bindings:[...records.values()]};
 editProof(proof);const descriptor=await file('proof/completion.json',proof);
 const config={...archiveConfig,target:'accepted/archive',proofPath:descriptor.path,proofSha256:descriptor.sha256,bindingCount:proof.bindings.length,head:'fixture-head',requireGitHead:false,
  guard:{path:guard.path,sha256:guard.sha256,count:1},paths,qaCounts,spfxCounts:[3,4],packageTests:1,sourceTestFiles:2,historicalTestFiles:2,copiedInputs:1,browserCases:1};
 return{root,config,proof,descriptor,file,source,historical,pkg};
}
test('exact capture is autonomous and preserves original false and pending flags',async t=>{
 const f=await fixture(t),preflight=await archiveAcceptance(f);assert.equal(preflight.mode,'source-preflight-only');await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});
 const written=await archiveAcceptance({...f,write:true});assert.equal(written.files,f.proof.bindings.length+1);
 await rm(join(f.root,f.source.path));await rm(join(f.root,f.historical.path));await rm(join(f.root,f.descriptor.path));
 const checked=await archiveAcceptance({...f,readHead:()=>{throw Error('Live HEAD must not be read');}});assert.equal(checked.mode,'archive-reverified');assert.equal(checked.receiptSha256,written.receiptSha256);
 const receipt=JSON.parse(await readFile(join(f.root,f.config.target,'receipt.json')));assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.nextProfessionalStepStarted,false);assert.equal(receipt.additionalRiskDecision,false);
 assert.equal(receipt.acceptedCantons,23);assert.equal(receipt.operationalCantons,6);assert.equal(receipt.localOnlyAcceptedCantons,17);assert.deepEqual(receipt.remainingCantons,['NE','VD','VS']);
 const original=JSON.parse(await readFile(join(f.root,f.config.target,f.descriptor.path)));assert.equal(original.professionalTechnicalAcceptance,false);assert.equal(original.status,'local-technical-verification-passed-awaiting-human-acceptance');
 await assert.rejects(readFile(join(f.root,f.config.target,f.historical.path)),{code:'ENOENT'});
});
test('repeat write only verifies the existing exact archive',async t=>{const f=await fixture(t),a=await archiveAcceptance({...f,write:true}),b=await archiveAcceptance({...f,write:true});assert.equal(a.receiptSha256,b.receiptSha256);assert.equal(b.mode,'archive-reverified');});
test('accepted L3 archive verifies exactly1427 payloads without live source reads',async()=>{
 const result=await archiveAcceptance({readHead:()=>{throw Error('No current Git read');}});assert.equal(result.mode,'archive-reverified');assert.equal(result.files,1427);
 assert.equal(result.payloadBytes,116479852);assert.equal(result.receiptSha256,'f09d6c37f5a70afdb26dcd924df44bd9d01ed90764f94dcb884a631816fc0927');
});
for(const what of['source','historical','pkg'])test('missing '+what+' prevents creation',async t=>{const f=await fixture(t);await rm(join(f.root,f[what].path));await assert.rejects(archiveAcceptance({...f,write:true}),{code:'ENOENT'});await assert.rejects(readFile(join(f.root,f.config.target,'receipt.json')),{code:'ENOENT'});});
for(const what of['source','historical','pkg'])test('modified '+what+' prevents creation',async t=>{const f=await fixture(t);await f.file(f[what].path,'modified');await assert.rejects(archiveAcceptance({...f,write:true}),/SHA-256 mismatch/);});
for(const key of proofFalse)test('historical false '+key+' cannot be raised',async t=>{const f=await fixture(t,proof=>{proof[key]=true;});await assert.rejects(archiveAcceptance(f),/Historical boundary/);});
for(const key of receiptFalse)test('receipt cannot grant '+key,async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,[key]:true}}}),/Acceptance cannot raise/);});
for(const[key,value]of[['workPackage','AP23M1'],['status','accepted'],['l2TechnicallyAccepted',false],['operatingPackagePreserved',false],['head','different'],
 ['formats',{manifest:'15.0.0',minimumConsumer:'15.0.0',administrativeCatalog:'8.0.0'}],['contractDecision',{id:'DEC-2026-041',status:'proposed'}]])
 test('original '+key+' cannot be relabelled',async t=>{const f=await fixture(t,proof=>{proof[key]=value;});await assert.rejects(archiveAcceptance(f));});
for(const[key,value]of[['acceptedCantons',26],['operationalCantons',23],['localOnlyAcceptedCantons',0],['remainingCantons',[]],['acceptedBy','Codex'],['userStatement','AP23M1 is approved']])
 test('receipt cannot silently change '+key,async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,[key]:value}}}));});
test('documented lint reservation cannot silently become a new risk approval',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,documentedLintReservation:{...f.config.acceptance.documentedLintReservation,additionalHumanRiskDecision:true}}}}));});
test('documented lint reservation cannot be erased',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,documentedLintReservation:{totalWarnings:0}}}}));});
test('unknown human receipt fields cannot broaden authority',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,acceptance:{...f.config.acceptance,publishNow:true}}}),/Closed human receipt/);});
test('duplicate original input rejected',async t=>{const f=await fixture(t,proof=>{proof.bindings.push(proof.bindings[0]);});await assert.rejects(archiveAcceptance(f),/Duplicate binding/);});
test('wrong original binding count rejected',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,bindingCount:0}}),/Original binding inventory/);});
test('changed bound byte length rejected',async t=>{const f=await fixture(t,proof=>{proof.bindings[0].byteLength++;});await assert.rejects(archiveAcceptance(f),/Byte length/);});
test('descriptor extension rejected',async t=>{const f=await fixture(t,proof=>{proof.bindings[0].approval=true;});await assert.rejects(archiveAcceptance(f));});
test('fresh source HEAD must agree',async t=>{const f=await fixture(t);await assert.rejects(archiveAcceptance({...f,config:{...f.config,requireGitHead:true},readHead:()=> 'different'}),/Git HEAD changed/);});
test('unsafe relative paths rejected',()=>{for(const path of['../x','/x','a//b','a/../b','a\\b','C:/x','','a\0b','a\nb','.','a/./b'])assert.throws(()=>safeRelative(path));});
for(const kind of['file','directory','target','receipt'])test('reject '+kind+' symlink',async t=>{
 const f=await fixture(t);if(kind==='file'){await f.file('other.ts','accepted native integration');await rm(join(f.root,f.source.path));await symlink('../other.ts',join(f.root,f.source.path));}
 if(kind==='directory'){await f.file('other/current.ts','accepted native integration');await rm(join(f.root,'source'),{recursive:true});await symlink('other',join(f.root,'source'));}
 if(kind==='target'){await mkdir(join(f.root,'accepted'));await mkdir(join(f.root,'elsewhere'));await symlink('../elsewhere',join(f.root,f.config.target));}
 if(kind==='receipt'){await archiveAcceptance({...f,write:true});await f.file('other-receipt.json',{});await rm(join(f.root,f.config.target,'receipt.json'));await symlink('../../other-receipt.json',join(f.root,f.config.target,'receipt.json'));}
 await assert.rejects(archiveAcceptance({...f,write:true}),/Symlink/);
});
test('partial archive cannot be silently repaired',async t=>{const f=await fixture(t);await mkdir(join(f.root,f.config.target),{recursive:true});await assert.rejects(archiveAcceptance({...f,write:true}),/Partial archive/);});
test('tampered archived payload rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/'+f.source.path,'changed');await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
test('missing archived payload rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await rm(join(f.root,f.config.target,f.source.path));await assert.rejects(archiveAcceptance(f),{code:'ENOENT'});});
test('unexpected archive file rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/extra.txt','unexpected');await assert.rejects(archiveAcceptance(f),/Unexpected archive files/);});
test('unexpected archive directory rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await mkdir(join(f.root,f.config.target,'extra'));await assert.rejects(archiveAcceptance(f),/Unexpected archive directories/);});
test('changed receipt rejected',async t=>{const f=await fixture(t);await archiveAcceptance({...f,write:true});await f.file(f.config.target+'/receipt.json',{});await assert.rejects(archiveAcceptance(f),/SHA-256 mismatch/);});
for(const reportKey of['qa','spfx','packaged','web','browser','exported','native','independent','inherited'])test('failed '+reportKey+' cannot be accepted',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key===reportKey)report.status='failed';});await assert.rejects(archiveAcceptance(f));});
test('browser evidence cannot become a real-device claim',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key==='browser')report.realDeviceOrM365Test=true;});await assert.rejects(archiveAcceptance(f));});
test('saved calendar file cannot be hidden in export summary',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key==='exported')report.actualIcsFilesSaved=1;});await assert.rejects(archiveAcceptance(f));});
test('unbound compiled package cannot replace accepted bytes',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key==='packaged')report.package={path:'other.sppkg',byteLength:1,sha256:'0'.repeat(64)};});await assert.rejects(archiveAcceptance(f));});
test('independent checker cannot inherit product arithmetic authority',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key==='independent')report.importsProductCode=true;});await assert.rejects(archiveAcceptance(f));});
test('wrong actual native case count rejected',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key==='native')report.consumerCases=82;});await assert.rejects(archiveAcceptance(f));});
test('unbound independent evidence rejected',async t=>{const f=await fixture(t,()=>{},(key,report)=>{if(key==='independent')report.binding.catalog={path:'unbound.json',byteLength:1,sha256:'0'.repeat(64)};});await assert.rejects(archiveAcceptance(f),/Unbound input/);});
