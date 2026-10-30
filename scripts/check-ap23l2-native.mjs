// SPDX-License-Identifier: AGPL-3.0-only
// Read-only native15 regression lane. No proposed AI/SZ path is calculated here.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseFormat15Data,parseFormat15LocalReferenceData,getVerifiedAdministrativeDataV8} from '../src/core/releaseFormat15.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {administrativeInput15} from '../tests/core/ap23k3Fixtures.ts';
import {checkPreservation,preservationConfig} from './check-ap23l2-preservation.mjs';
import {checkedPath,sha256} from './prepare-ap23l2.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const encode=value=>JSON.stringify(value,null,2)+'\n';
export const nativeConfig=Object.freeze({
 baseline:'data/candidates/2026-10-27-ap23k3',candidate:'outputs/ap23l2-candidate-2026-10-27/bundle',
 accepted:'outputs/ap23k3-2026-10-27/native-reference-verification.json',
 report:'outputs/ap23l2-2026-10-27/native-regression.json',
 admin:'administrative-procedures/ch-cantonal-administrative-procedures.json',
 baselinePaths:165,baselineArtifacts:44,newL2Paths:31,
 nativeSchema:prefix+'release-manifest-v15.schema.json',
 localSchema:prefix+'implementation/ap23k3/local-reference-manifest-v15.schema.json',
 adminSchema:prefix+'administrative-procedure-catalog-v8.schema.json'
});

/** Complete raw maps only. A parser rejection must not be an absent-file accident. */
export async function readNativeBundle(base,{directory=root}={}){
 await checkedPath(directory,base+'/manifest.json');
 const manifestText=await readFile(resolve(directory,base,'manifest.json'),'utf8');
 const manifest=JSON.parse(manifestText),files=new Map(),evidence=[{path:base+'/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha256(manifestText)}];
 assert.equal(manifest.artifacts.length,nativeConfig.baselineArtifacts,'Complete 44-artifact bundle required');
 for(const descriptor of manifest.artifacts){
  await checkedPath(directory,base+'/'+descriptor.path);assert.equal(files.has(descriptor.path),false,'Duplicate raw artifact');
  const text=await readFile(resolve(directory,base,descriptor.path),'utf8');
  assert.equal(Buffer.byteLength(text),descriptor.byteLength,'Declared byte length '+descriptor.path);
  assert.equal(sha256(text),descriptor.sha256,'Declared raw hash '+descriptor.path);files.set(descriptor.path,text);
  evidence.push({path:base+'/'+descriptor.path,byteLength:Buffer.byteLength(text),sha256:sha256(text)});
 }
 return{manifestText,manifest,files,evidence};
}

function header(bundle,{approved=false,downgrade=false,deep=false}={}){
 const manifest=structuredClone(bundle.manifest),files=new Map(bundle.files);
 if(downgrade){manifest.$schema=approved?nativeConfig.nativeSchema:nativeConfig.localSchema;manifest.formatVersion='15.0.0';manifest.compatibility.minimumConsumerFormatVersion='15.0.0';}
 if(approved){manifest.releaseStatus='approved';manifest.sourceSummary.legalBasisReviewStatus='verified';manifest.sourceSummary.technicalValidationStatus='passed';}
 if(deep){
  const document=JSON.parse(files.get(nativeConfig.admin));document.$schema=nativeConfig.adminSchema;document.formatVersion='8.0.0';
  const text=encode(document),descriptor=manifest.artifacts.find(row=>row.path===nativeConfig.admin);
  files.set(nativeConfig.admin,text);Object.assign(descriptor,{schemaId:nativeConfig.adminSchema,byteLength:Buffer.byteLength(text),sha256:sha256(text)});
 }
 return{manifestText:encode(manifest),files};
}

/** Synthetic in-memory labels are never written into a source or release file. */
export function rejectProposedByNative15(bundle){
 assert.equal(bundle.manifest.formatVersion,'16.0.0');
 const variants=[
  ['exact-format16',{manifestText:bundle.manifestText,files:new Map(bundle.files)}],
  ['format16-with-forged-approved-status',header(bundle,{approved:true})],
  ['format15-local-header-with-catalog9',header(bundle,{downgrade:true})],
  ['format15-approved-header-with-catalog9',header(bundle,{approved:true,downgrade:true})],
  ['format15-local-header-and-rehashed-catalog8-label',header(bundle,{downgrade:true,deep:true})],
  ['format15-approved-header-and-rehashed-catalog8-label',header(bundle,{approved:true,downgrade:true,deep:true})]
 ];
 const results=[];
 for(const [variant,input]of variants)for(const [reader,parse]of [['approved',parseFormat15Data],['localReference',parseFormat15LocalReferenceData]]){
  let error;try{parse(input.manifestText,input.files);}catch(caught){error=caught;}
  assert.ok(error,reader+' accepted unsupported '+variant);
  assert.ok(['SchemaContractError','Format15DataError'].includes(error.name),'Unexpected non-contract rejection: '+error);
  results.push({variant,reader,rejected:true,errorName:error.name,message:error.message,
   manifestSha256:sha256(input.manifestText),completeRawArtifactCount:input.files.size,sourceMutation:false});
 }
 assert.equal(results.length,12);return results;
}

export async function verifyNativeBaseline(){
 const preservation=await checkPreservation();assert.equal(preservation.protectedFilesVerified,9048);
 const guardBytes=await readFile(resolve(root,preservationConfig.guardPath));assert.equal(sha256(guardBytes),preservationConfig.guardSha256);
 const guard=JSON.parse(guardBytes),baseline=await readNativeBundle(nativeConfig.baseline),candidate=await readNativeBundle(nativeConfig.candidate);
 assert.equal(baseline.manifest.formatVersion,'15.0.0');assert.equal(baseline.manifest.releaseStatus,'candidate');
 const context=parseFormat15LocalReferenceData(baseline.manifestText,baseline.files),catalog=context.administrativeCatalog;
 assert.equal(context.mode,'localReference');assert.equal(catalog.formatVersion,'8.0.0');assert.equal(catalog.paths.length,nativeConfig.baselinePaths);
 assert.equal(getVerifiedAdministrativeDataV8(context).referenceOnly,true);
 const acceptedText=await readFile(resolve(root,nativeConfig.accepted),'utf8');
 assert.equal(sha256(acceptedText),guard.files[nativeConfig.accepted],'Accepted K3 reference proof changed');
 const accepted=JSON.parse(acceptedText),results=[];
 assert.equal(accepted.oldResults.length,149);
 for(const path of catalog.paths){
  const q=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId);
  const old=accepted.oldResults.find(row=>row.pathId===path.pathId);
  const current=old??accepted.results.find(row=>row.input.selection.pathId===path.pathId&&row.native.outcome==='calculated');
  assert.ok(current,'No positive accepted K3 baseline for '+path.pathId);
  const expectedInput=current.input;
  const overrides=q.mode==='qualifiedDayProcedureV7'?Object.fromEntries(q.requirements.map(row=>[row.key,row.oneOf?row.oneOf[0]:row.value])):undefined;
  const input=administrativeInput15(catalog,path.pathId,expectedInput.inputDate,expectedInput.deadlineDays,path.stages[0],overrides);
  if(Object.hasOwn(expectedInput,'areaFacts'))input.areaFacts=structuredClone(expectedInput.areaFacts);
  assert.deepEqual(input,expectedInput,'Explicit historical synthetic input changed: '+path.pathId);
  const native=calculateAdministrativeDeadline(input,context);
  assert.equal(native.outcome,'calculated',path.pathId);assert.equal(native.referenceOnly,true,path.pathId);assert.equal(native.calendarExportAllowed,false,path.pathId);
  assert.deepEqual(native,current.native,'Native baseline result changed: '+path.pathId);
  results.push({pathId:path.pathId,canton:catalog.laws.find(law=>law.lawId===path.lawId).canton,
   qualificationMode:q.mode,fixtureOrigin:old?'accepted-K3-oldResults':'accepted-K3-positive-reference',
   input,expectedFinalEnd:current.native.finalEnd,native,acceptedResultEqual:true});
 }
 assert.equal(new Set(results.map(row=>row.pathId)).size,165);
 assert.equal(results.filter(row=>row.fixtureOrigin==='accepted-K3-oldResults').length,149);
 assert.equal(results.filter(row=>row.fixtureOrigin==='accepted-K3-positive-reference').length,16);
 const proposed=JSON.parse(candidate.files.get(nativeConfig.admin));assert.equal(proposed.formatVersion,'9.0.0');
 assert.equal(proposed.paths.length,catalog.paths.length+nativeConfig.newL2Paths);
 assert.ok(results.every(row=>proposed.paths.some(path=>path.pathId===row.pathId)));
 const rejections=rejectProposedByNative15(candidate);
 const copiedContext=structuredClone(context),copied=calculateAdministrativeDeadline(results[0].input,copiedContext);
 assert.equal(copied.outcome,'blocked');assert.equal(copied.calendarExportAllowed,false);assert.equal('finalEnd'in copied,false);
 const sourcePaths=[...Object.keys(guard.files).filter(path=>path.startsWith('src/core/')||path.startsWith('schemas/')
  ||/^tests\/core\/ap23[^/]*Fixtures\.ts$/u.test(path)),
  'docs/fachrecht/ap23i1/referenzfaelle.json','docs/fachrecht/ap23j1/referenzfaelle.json',
  'outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json','outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json',nativeConfig.accepted];
 const sourceEvidence=await Promise.all([...new Set(sourcePaths)].sort().map(async path=>{
  const bytes=await readFile(resolve(root,path));assert.equal(sha256(bytes),guard.files[path],'Historical native dependency changed: '+path);
  return{path,byteLength:bytes.length,sha256:sha256(bytes)};
 }));
 const ownBytes=await readFile(fileURLToPath(import.meta.url));
 return{workPackage:'AP23L2',status:'native-format15-baseline-preserved',nativeFormat:'15.0.0',catalogFormat:'8.0.0',
  proposedFormat:'16.0.0',proposedCatalogFormat:'9.0.0',baselinePaths:165,baselineArtifactCount:44,
  prior149CasesPreserved:149,priorK3CasesPreserved:16,baselineCantonCount:new Set(results.map(row=>row.canton)).size,
  calculatedCases:results.length,newAISZCalculations:0,unsupportedReaderRejections:rejections.length,
  copiedContextRejected:{outcome:copied.outcome,blockReasonKeys:copied.blockReasonKeys,calendarExportAllowed:false},
  referenceOnly:true,calendarExportEnabled:false,formatDecision:false,sourceReleaseApproved:false,runtimeActivation:false,
  productBuildPerformed:false,operatingChanges:false,
  inputProtection:{guardPath:preservationConfig.guardPath,guardSha256:preservationConfig.guardSha256,protectedFilesVerified:9048,
   acceptedL1ReceiptSha256:preservation.acceptedL1Archive.receiptSha256},
  evidence:[{path:'scripts/check-ap23l2-native.mjs',byteLength:ownBytes.length,sha256:sha256(ownBytes)},
   ...baseline.evidence,...candidate.evidence,...sourceEvidence],
  scope:'Unchanged native Format-15 parser and native calculator, with 165 explicit historical synthetic qualified inputs and accepted K3 outcome comparison. The 31 proposed AI/SZ paths are not evaluated here. Unsupported Format-16 and forged release labels are rejected by both existing native readers. No source promotion, export capability, product build or operating authority.',
  results,rejections};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');const report=await verifyNativeBaseline(),text=encode(report);
 if(flag==='--write'){await mkdir(resolve(root,'outputs/ap23l2-2026-10-27'),{recursive:true});await writeFile(resolve(root,nativeConfig.report),text);}
 else assert.equal(await readFile(resolve(root,nativeConfig.report),'utf8'),text,'Native baseline report changed');
 console.log(JSON.stringify({mode:flag,status:report.status,nativeCases:report.calculatedCases,unsupportedReaderRejections:report.unsupportedReaderRejections,
  newAISZCalculations:0,calendarExportEnabled:false,sha256:sha256(text)},null,2));
}
