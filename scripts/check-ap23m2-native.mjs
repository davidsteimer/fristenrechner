// SPDX-License-Identifier: AGPL-3.0-only
// Unchanged native16 regression lane. No proposed NE/VD/VS calculation here.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseFormat16Data,parseFormat16LocalReferenceData,getVerifiedAdministrativeDataV9} from '../src/core/releaseFormat16.ts';
import {calculateAdministrativeDeadline} from '../src/core/administrativeDeadline.ts';
import {administrativeInput16} from '../tests/core/ap23l3Fixtures.ts';
import {checkPreservation,preservationConfig} from './check-ap23m2-preservation.mjs';
import {checkedPath,sha256} from './prepare-ap23m2.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const encode=value=>JSON.stringify(value,null,2)+'\n';
export const nativeConfig=Object.freeze({baseline:'data/candidates/2026-10-27-ap23l3',candidate:'outputs/ap23m2-candidate-2026-10-28/bundle',
 accepted:'outputs/ap23l3-2026-10-27/native-reference-verification.json',report:'outputs/ap23m2-2026-10-28/native-regression.json',
 admin:'administrative-procedures/ch-cantonal-administrative-procedures.json',baselinePaths:196,baselineArtifacts:44,newM2Paths:49,
 nativeSchema:prefix+'release-manifest-v16.schema.json',localSchema:prefix+'implementation/ap23l3/local-reference-manifest-v16.schema.json',adminSchema:prefix+'administrative-procedure-catalog-v9.schema.json'});
/** Complete hash-checked raw maps prevent missing-artifact pseudo-rejections. */
export async function readNativeBundle(base,{directory=root}={}){
 await checkedPath(directory,base+'/manifest.json');const manifestText=await readFile(resolve(directory,base,'manifest.json'),'utf8'),manifest=JSON.parse(manifestText),files=new Map();
 const evidence=[{path:base+'/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha256(manifestText)}];assert.equal(manifest.artifacts.length,nativeConfig.baselineArtifacts,'Complete 44-artifact bundle required');
 for(const descriptor of manifest.artifacts){await checkedPath(directory,base+'/'+descriptor.path);assert.equal(files.has(descriptor.path),false,'Duplicate raw artifact');const text=await readFile(resolve(directory,base,descriptor.path),'utf8');
  assert.equal(Buffer.byteLength(text),descriptor.byteLength,'Declared byte length '+descriptor.path);assert.equal(sha256(text),descriptor.sha256,'Declared raw hash '+descriptor.path);files.set(descriptor.path,text);evidence.push({path:base+'/'+descriptor.path,byteLength:Buffer.byteLength(text),sha256:sha256(text)});}
 return{manifestText,manifest,files,evidence};
}
function header(bundle,{approved=false,downgrade=false,deep=false}={}){
 const manifest=structuredClone(bundle.manifest),files=new Map(bundle.files);if(downgrade){manifest.$schema=approved?nativeConfig.nativeSchema:nativeConfig.localSchema;manifest.formatVersion='16.0.0';manifest.compatibility.minimumConsumerFormatVersion='16.0.0';}
 if(approved){manifest.releaseStatus='approved';manifest.sourceSummary.legalBasisReviewStatus='verified';manifest.sourceSummary.technicalValidationStatus='passed';}
 if(deep){const document=JSON.parse(files.get(nativeConfig.admin));document.$schema=nativeConfig.adminSchema;document.formatVersion='9.0.0';const text=encode(document),descriptor=manifest.artifacts.find(row=>row.path===nativeConfig.admin);files.set(nativeConfig.admin,text);Object.assign(descriptor,{schemaId:nativeConfig.adminSchema,byteLength:Buffer.byteLength(text),sha256:sha256(text)});}
 return{manifestText:encode(manifest),files};
}
/** All forged labels exist in memory only, never as modified source data. */
export function rejectProposedByNative16(bundle){
 assert.equal(bundle.manifest.formatVersion,'17.0.0');const variants=[
  ['exact-format17',{manifestText:bundle.manifestText,files:new Map(bundle.files)}],['format17-with-forged-approved-status',header(bundle,{approved:true})],
  ['format16-local-header-with-catalog10',header(bundle,{downgrade:true})],['format16-approved-header-with-catalog10',header(bundle,{approved:true,downgrade:true})],
  ['format16-local-header-and-rehashed-catalog9-label',header(bundle,{downgrade:true,deep:true})],['format16-approved-header-and-rehashed-catalog9-label',header(bundle,{approved:true,downgrade:true,deep:true})]
 ],results=[];
 for(const[variant,input]of variants)for(const[reader,parse]of[['approved',parseFormat16Data],['localReference',parseFormat16LocalReferenceData]]){
  let error;try{parse(input.manifestText,input.files);}catch(caught){error=caught;}assert.ok(error,reader+' accepted unsupported '+variant);
  assert.ok(['SchemaContractError','Format16DataError'].includes(error.name),'Unexpected non-contract rejection: '+error);
  results.push({variant,reader,rejected:true,errorName:error.name,message:error.message,manifestSha256:sha256(input.manifestText),completeRawArtifactCount:input.files.size,sourceMutation:false});}
 assert.equal(results.length,12);return results;
}
export async function verifyNativeBaseline(){
 const preservation=await checkPreservation();assert.equal(preservation.protectedFilesVerified,11414);const guardBytes=await readFile(resolve(root,preservationConfig.guardPath));assert.equal(sha256(guardBytes),preservationConfig.guardSha256);
 const guard=JSON.parse(guardBytes),baseline=await readNativeBundle(nativeConfig.baseline),candidate=await readNativeBundle(nativeConfig.candidate);
 assert.equal(baseline.manifest.formatVersion,'16.0.0');assert.equal(baseline.manifest.releaseStatus,'candidate');const context=parseFormat16LocalReferenceData(baseline.manifestText,baseline.files),catalog=context.administrativeCatalog;
 assert.equal(context.mode,'localReference');assert.equal(catalog.formatVersion,'9.0.0');assert.equal(catalog.paths.length,nativeConfig.baselinePaths);assert.equal(getVerifiedAdministrativeDataV9(context).referenceOnly,true);
 const acceptedText=await readFile(resolve(root,nativeConfig.accepted),'utf8');assert.equal(sha256(acceptedText),guard.files[nativeConfig.accepted],'Accepted L3 reference proof changed');const accepted=JSON.parse(acceptedText),results=[];
 assert.equal(accepted.oldResults.length,165);assert.equal(accepted.results.length,83);assert.equal(accepted.status,'passed-native-reference-only');
 for(const path of catalog.paths){const q=catalog.qualificationPolicies.find(row=>row.pathId===path.pathId),old=accepted.oldResults.find(row=>row.pathId===path.pathId),current=old??accepted.results.find(row=>row.input.selection.pathId===path.pathId&&row.native.outcome==='calculated');
  assert.ok(current,'No accepted positive L3 baseline for '+path.pathId);const expectedInput=current.input;
  const input=administrativeInput16(catalog,path.pathId,expectedInput.inputDate,expectedInput.deadlineDays,expectedInput.selection.stage,expectedInput.caseQualification);
  if(Object.hasOwn(expectedInput,'areaFacts'))input.areaFacts=structuredClone(expectedInput.areaFacts);
  assert.deepEqual(input,expectedInput,'Explicit historical synthetic input changed '+path.pathId);const native=calculateAdministrativeDeadline(input,context);
  assert.equal(native.outcome,'calculated',path.pathId);assert.equal(native.referenceOnly,true,path.pathId);assert.equal(native.calendarExportAllowed,false,path.pathId);assert.deepEqual(native,current.native,'Native baseline result changed '+path.pathId);
  results.push({pathId:path.pathId,canton:catalog.laws.find(law=>law.lawId===path.lawId).canton,qualificationMode:q.mode,fixtureOrigin:old?'accepted-L3-oldResults':'accepted-L3-positive-reference',input,expectedFinalEnd:current.native.finalEnd,native,acceptedResultEqual:true});}
 assert.equal(new Set(results.map(row=>row.pathId)).size,196);assert.equal(results.filter(row=>row.fixtureOrigin==='accepted-L3-oldResults').length,165);assert.equal(results.filter(row=>row.fixtureOrigin==='accepted-L3-positive-reference').length,31);
 const proposed=JSON.parse(candidate.files.get(nativeConfig.admin));assert.equal(proposed.formatVersion,'10.0.0');assert.equal(proposed.paths.length,245);assert.ok(results.every(row=>proposed.paths.some(path=>path.pathId===row.pathId)));
 const rejections=rejectProposedByNative16(candidate),copied=calculateAdministrativeDeadline(results[0].input,structuredClone(context));assert.equal(copied.outcome,'blocked');assert.equal(copied.calendarExportAllowed,false);assert.equal('finalEnd'in copied,false);
 const sourcePaths=[...Object.keys(guard.files).filter(path=>path.startsWith('src/core/')||path.startsWith('schemas/')||/^tests\/core\/ap23[^/]*Fixtures\.ts$/u.test(path)),nativeConfig.accepted];
 const sourceEvidence=await Promise.all([...new Set(sourcePaths)].sort().map(async path=>{const bytes=await readFile(resolve(root,path));assert.equal(sha256(bytes),guard.files[path],'Historical native dependency changed '+path);return{path,byteLength:bytes.length,sha256:sha256(bytes)};}));
 const ownBytes=await readFile(fileURLToPath(import.meta.url));return{workPackage:'AP23M2',status:'native-format16-baseline-preserved',nativeFormat:'16.0.0',catalogFormat:'9.0.0',proposedFormat:'17.0.0',proposedCatalogFormat:'10.0.0',baselinePaths:196,baselineArtifactCount:44,
  prior165CasesPreserved:165,priorL3CasesPreserved:31,baselineCantonCount:new Set(results.map(row=>row.canton)).size,calculatedCases:results.length,newNEVDVSCalculations:0,unsupportedReaderRejections:rejections.length,
  copiedContextRejected:{outcome:copied.outcome,blockReasonKeys:copied.blockReasonKeys,calendarExportAllowed:false},referenceOnly:true,calendarExportEnabled:false,formatDecision:false,sourceReleaseApproved:false,runtimeActivation:false,productBuildPerformed:false,operatingChanges:false,
  inputProtection:{guardPath:preservationConfig.guardPath,guardSha256:preservationConfig.guardSha256,protectedFilesVerified:11414,acceptedM1ReceiptSha256:preservation.acceptedM1Archive.receiptSha256},
  evidence:[{path:'scripts/check-ap23m2-native.mjs',byteLength:ownBytes.length,sha256:sha256(ownBytes)},...baseline.evidence,...candidate.evidence,...sourceEvidence],
  scope:'Unchanged native Format-16 parser and calculator preserve 196 explicit accepted synthetic L3 positive inputs and outcomes. The 49 NE/VD/VS proposals are not calculated here. Both native readers reject Format-17 and forged approved/downgrade labels. No source promotion, export capability, product build or operating authority.',results,rejections};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');const report=await verifyNativeBaseline(),text=encode(report);if(flag==='--write'){await mkdir(resolve(root,'outputs/ap23m2-2026-10-28'),{recursive:true});await writeFile(resolve(root,nativeConfig.report),text);}else assert.equal(await readFile(resolve(root,nativeConfig.report),'utf8'),text,'Native baseline report changed');
 console.log(JSON.stringify({mode:flag,status:report.status,nativeCases:report.calculatedCases,unsupportedReaderRejections:report.unsupportedReaderRejections,newNEVDVSCalculations:0,calendarExportEnabled:false,sha256:sha256(text)},null,2));
}
