// SPDX-License-Identifier: AGPL-3.0-only
// Accepted L2 meanings, native local reference integration, no operating release.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSocialJson} from '../src/core/socialCatalog';
import {rebindSocialCalendarCandidate} from '../src/core/calendarMigration';
export const AP23L3_ROOT=fileURLToPath(new URL('../',import.meta.url));
export const AP23L3_ACCEPTED='outputs/ap23l2-candidate-2026-10-27/bundle';
export const AP23L3_BASE='data/candidates/2026-10-27-ap23k3';
export const AP23L3_TARGET='data/candidates/2026-10-27-ap23l3';
export const AP23L3_RELEASE_ID='2026-10-27-ap23l3-candidate.1';
export const AP23L3_ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const decisionPath='docs/entscheidungen/DEC-2026-041-beschluss.md',acceptancePath='docs/fachrecht/abnahme-ap23l2.md';
const sha=(raw:string|Buffer):string=>createHash('sha256').update(raw).digest('hex');
const objectSha=(v:unknown):string=>sha(canonicalSocialJson(v));
const encode=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
const read=(p:string):Promise<string>=>readFile(resolve(AP23L3_ROOT,p),'utf8');
const guardPath='outputs/ap23l3-2026-10-27/protected-inputs.json';
const guardSha='365a023fed55f849a83d44ebd2c4899c0e436bb77abbe2a40d4c4bd5d2912375';
const receiptPath='outputs/ap23l2-abnahme-2026-10-27/receipt.json';
const receiptSha='0f6a9be9fcebc2e1a16531c8e06299683d7bfe9172a3ca5f6808266383717afa';
function baseline(c:any):Record<string,Record<string,string>>{
 const result:Record<string,Record<string,string>>={};
 for(const[group,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)
  result[group]=Object.fromEntries(c[group].map((row:any)=>[row[key],objectSha(row)]));
 result.sources=Object.fromEntries(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity}:any)=>[identity.sourceId,objectSha(identity)]));
 result.preserved=Object.fromEntries(c.preserved.map((row:any)=>[row.path,objectSha(row)]));
 result.holidayBindings=Object.fromEntries(c.holidayBindings.map((row:any)=>{
  if(row.physicalSource){const{physicalSource:_physical,...legal}=row;return[row.holidayBindingId,objectSha(legal)];}
  const{physicalBaseline,...legal}=row;return[row.holidayBindingId,objectSha({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})];
 }));return result;
}
export async function buildAP23L3Candidate(){
 const guardText=await read(guardPath);assert.equal(sha(guardText),guardSha);const guard=JSON.parse(guardText);
 assert.equal(guard.workPackage,'AP23L3');assert.equal(guard.capturedBeforeIntegration,true);assert.equal(guard.l2TechnicallyAccepted,true);
 assert.equal(sha(await read(receiptPath)),receiptSha);const receipt=JSON.parse(await read(receiptPath));
 assert.equal(receipt.technicalL2Acceptance,true);assert.equal(receipt.contractDecision.status,'approved');assert.equal(receipt.sourceReleaseApproved,false);
 const acceptedRead=async(path:string):Promise<string>=>{const raw=await read(path);assert.equal(sha(raw),guard.files[path],'Frozen L3 input '+path);return raw;};
 const decision=await acceptedRead(decisionPath),acceptance=await acceptedRead(acceptancePath);
 assert.ok(decision.includes('Status: beschlossen')&&decision.includes('9.0.0')&&decision.includes('16.0.0'));assert.ok(acceptance.includes('technisch abgenommen'));
 const acceptedText=await acceptedRead(AP23L3_ACCEPTED+'/manifest.json'),acceptedManifest=JSON.parse(acceptedText);
 const files=new Map<string,string>(),oldFiles=new Map<string,string>();
 for(const descriptor of acceptedManifest.artifacts){const raw=await acceptedRead(AP23L3_ACCEPTED+'/'+descriptor.path);assert.equal(sha(raw),descriptor.sha256);assert.equal(Buffer.byteLength(raw),descriptor.byteLength);files.set(descriptor.path,raw);oldFiles.set(descriptor.path,raw);}
 assert.equal(files.size,44);
 const componentRef=(id:string)=>{const role=id==='ch-holiday-catalog'?'holidayCatalog'as const:'calendar'as const,path=(role==='calendar'?'calendars/':'holiday-catalogs/')+id+'.json';assert.ok(files.has(path));return{role,contentId:id,sha256:sha(files.get(path)!)};};
 const socialPath='social-procedures/ch-social-procedures.json';files.set(socialPath,encode(rebindSocialCalendarCandidate(JSON.parse(files.get(socialPath)!),AP23L3_RELEASE_ID,['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef))));
 const original=JSON.parse(files.get(AP23L3_ADMIN)!),admin=structuredClone(original);
 Object.assign(admin,{$schema:prefix+'administrative-procedure-catalog-v9.schema.json',contractStatus:'approved',contractDecision:{id:'DEC-2026-041',status:'approved',on:'2026-10-27'}});
 admin.review.basis='L1 A bis L1 G fachlich und AP23L2 technisch abgenommen. DEC-2026-041 beschlossen. Beschluss '+decisionPath+', SHA-256 '+sha(decision)+'. Abnahme '+acceptancePath+', SHA-256 '+sha(acceptance)+'. Keine Quellenrelease- oder Betriebsfreigabe.';
 admin.review.sourceReview='Abgenommene AI-/SZ-Verwendungen und sämtliche früheren Fachobjekte unverändert. Tatsächliche Zielbytes neu gebunden. Gemeinsame Quellenreleasefreigabe steht aus.';
 for(const b of admin.holidayBindings){const physical=b.physicalSource??b.physicalBaseline;physical.releaseId=AP23L3_RELEASE_ID;physical.references=physical.references.map((ref:any)=>({...componentRef(ref.contentId),path:ref.path}));}
 for(const e of admin.releaseBinding.pathEligibility){const b=admin.holidayBindings.find((b:any)=>b.holidayBindingId===e.holidayBindingId);e.holidayBindingSha256=objectSha(b);
  if(b.physicalSource)e.calendarSelectionSha256=objectSha(b.calendarSelection);
  if(b.bindingVersion==='8.0.0')e.annualEndShiftPolicySha256=objectSha(b.annualEndShiftPolicy);
  if(b.bindingVersion==='9.0.0')e.proceduralCalendarSupplementSha256=objectSha(b.proceduralCalendarSupplement);
  assert.equal(e.status,'candidate');assert.deepEqual(e.targetComponentRefs,[]);
 }
 for(const group of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths','preserved'])assert.deepEqual(admin[group],original[group],'Unchanged accepted L2 meanings '+group);
 files.set(AP23L3_ADMIN,encode(admin));
 for(const[path,raw]of files)if(path!==AP23L3_ADMIN&&path!==socialPath)assert.equal(raw,oldFiles.get(path),'Unchanged accepted raw artifact '+path);
 const artifacts=acceptedManifest.artifacts.map((d:any)=>({...d,schemaId:JSON.parse(files.get(d.path)!).$schema,byteLength:Buffer.byteLength(files.get(d.path)!),sha256:sha(files.get(d.path)!)}));
 const manifest={...acceptedManifest,$schema:prefix+'implementation/ap23l3/local-reference-manifest-v16.schema.json',releaseId:AP23L3_RELEASE_ID,releaseStatus:'candidate',artifacts,
  extensions:{'steimer.local-reference':{workPackage:'AP23L3',productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,sourceReview:'pending',contractDecision:'DEC-2026-041',contractDecisionOn:'2026-10-27',technicalAcceptanceSha256:sha(acceptance),contractDecisionSha256:sha(decision),acceptedStructuralManifestSha256:sha(acceptedText),startGuardSha256:guardSha,
   historicalPhysicalReuse:'Actual target references rebound. No inherited federal or foreign procedure permission.',proceduralSupplement:'Exactly two Schwyz end-shift-only dates, unchanged physical calendars.',sourceReviewReuse:'Accepted meanings and evidence preserved. Combined source-release review pending.'}}};
 const manifestText=encode(manifest),generatedModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Generated local L3 reference data, no operating or export authority.\n'+"import {createFormat16CalculationData} from '../core/format16CalculationData';\n"+'export const ap23l3ManifestText='+JSON.stringify(manifestText)+';\n'+'export const ap23l3Files:ReadonlyMap<string,string>=new Map('+JSON.stringify([...files])+');\n'+"export const ap23l3CandidateRuntime=createFormat16CalculationData(ap23l3ManifestText,ap23l3Files,{mode:'localReference'});\n"+'export const ap23l3AdministrativeContext=ap23l3CandidateRuntime.administrativeContext;\n';
 const administrativeBaselineModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted L2 semantic definitions, never source-release permission.\n'+'export const ADMINISTRATIVE_V9_BASELINE='+JSON.stringify(baseline(admin),null,2)+' as const;\n';
 const integrity=encode({kind:'ap23l3-local-reference-bundle',releaseId:AP23L3_RELEASE_ID,releaseStatus:'candidate',contractDecision:'DEC-2026-041',contractStatus:'approved',sourceReleaseApproved:false,productionActivation:false,referenceOnly:true,calendarExportEnabled:false,sourceReview:'pending',
  basedOn:[{path:guardPath,sha256:guardSha},{path:receiptPath,sha256:receiptSha},{path:decisionPath,sha256:sha(decision)},{path:acceptancePath,sha256:sha(acceptance)},{path:AP23L3_ACCEPTED+'/manifest.json',sha256:sha(acceptedText)}],
  counts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:196,preservedAdministrativePaths:165,newAdministrativePaths:31,qualificationPolicies:196,laws:22,suspensionProfiles:41,holidayBindings:32,basisHolidayRules:479,supplementalRules:20,totalHolidayRules:499,newHolidayRules:0,proceduralSupplementDates:2,preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromL2:[...files].filter(([p,raw])=>oldFiles.get(p)===raw).length},
  manifest:{path:AP23L3_TARGET+'/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},artifacts:artifacts.map((d:any)=>({path:AP23L3_TARGET+'/'+d.path,byteLength:d.byteLength,sha256:d.sha256})),
  generatedModules:[{path:'src/release/ap23l3CandidateData.ts',sha256:sha(generatedModule)},{path:'src/core/administrativeV9Baseline.ts',sha256:sha(administrativeBaselineModule)}],buildScript:{path:'scripts/build-ap23l3-candidate.ts',sha256:sha(await read('scripts/build-ap23l3-candidate.ts'))}});
 return{manifestText,files,generatedModule,administrativeBaselineModule,integrity};
}
export async function materializeAP23L3Candidate(mode:'write'|'check'){
 const result=await buildAP23L3Candidate();const outputs:[string,string][]=[...result.files].map(([p,raw])=>[AP23L3_TARGET+'/'+p,raw]);
 outputs.push([AP23L3_TARGET+'/manifest.json',result.manifestText],['src/release/ap23l3CandidateData.ts',result.generatedModule],['src/core/administrativeV9Baseline.ts',result.administrativeBaselineModule],['outputs/ap23l3-2026-10-27/bundle-integrity.json',result.integrity]);
 for(const[path,text]of outputs){if(mode==='write'){await mkdir(dirname(resolve(AP23L3_ROOT,path)),{recursive:true});await writeFile(resolve(AP23L3_ROOT,path),text);}else assert.equal(await read(path),text,'Deterministic L3 candidate '+path);}
 console.log(JSON.stringify({mode,releaseId:AP23L3_RELEASE_ID,artifacts:44,manifestSha256:sha(result.manifestText),referenceOnly:true,exportAllowed:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const mode=process.argv[2];assert.ok(mode==='--write'||mode==='--check');await materializeAP23L3Candidate(mode==='--write'?'write':'check');}
