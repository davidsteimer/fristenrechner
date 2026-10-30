// SPDX-License-Identifier: AGPL-3.0-only
// Native local integration candidate. This does not promote any source release.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSocialJson} from '../src/core/socialCatalog';
import {rebindSocialCalendarCandidate} from '../src/core/calendarMigration';
export const AP23K3_ROOT=fileURLToPath(new URL('../',import.meta.url));
export const AP23K3_ACCEPTED='outputs/ap23k2-candidate-2026-10-27/bundle';
export const AP23K3_BASE='data/candidates/2026-10-27-ap23j3';
export const AP23K3_TARGET='data/candidates/2026-10-27-ap23k3';
export const AP23K3_RELEASE_ID='2026-10-27-ap23k3-candidate.1';
export const AP23K3_ADMIN_PATH='administrative-procedures/ch-cantonal-administrative-procedures.json';
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const decisionPath='docs/entscheidungen/DEC-2026-040-beschluss.md',acceptancePath='docs/fachrecht/abnahme-ap23k2.md';
const sha=(raw:string|Buffer):string=>createHash('sha256').update(raw).digest('hex');
const objectSha=(v:unknown):string=>sha(canonicalSocialJson(v));
const encode=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
const read=(p:string):Promise<string>=>readFile(resolve(AP23K3_ROOT,p),'utf8');
const fixedEvidence=[
 {path:'outputs/ap23k2-2026-10-27/local-completion.json',sha256:'eb4f7bf84b403489812cf83f5be99675a6a32abd4cc4e96eaea1ec8bda4f3aee'},
 {path:'outputs/ap23k2-candidate-2026-10-27/candidate-integrity.json',sha256:'d761a6d11f5819f59e945f046034fc702f038441771250cbb2182e460c96ccf9'},
 {path:'outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json',sha256:'c60fc0fd693de41bcdd2400e2d03ee559f33341bb9e68f616636f86eca54351a'},
 {path:AP23K3_ACCEPTED+'/manifest.json',sha256:'61eadcd096530c6ddb4474857cee11c06c3ff8606460c4f145afc62972d2b36e'},
 {path:'outputs/ap23k2-abnahme-2026-10-27/receipt.json',sha256:'b0991dc1a7f473256009eee7a9fa5109ab797e15694f26412668ff35d1941c79'}
] as const;
function baseline(c:any):Record<string,Record<string,string>>{
 const result:Record<string,Record<string,string>>={};
 for(const [group,key] of [['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']] as const)
  result[group]=Object.fromEntries(c[group].map((row:any)=>[row[key],objectSha(row)]));
 result.sources=Object.fromEntries(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity}:any)=>[identity.sourceId,objectSha(identity)]));
 result.preserved=Object.fromEntries(c.preserved.map((row:any)=>[row.path,objectSha(row)]));
 result.holidayBindings=Object.fromEntries(c.holidayBindings.map((row:any)=>{
  if(row.bindingVersion==='8.0.0'){const {physicalSource:_physical,...legal}=row;return [row.holidayBindingId,objectSha(legal)];}
  const {physicalBaseline,...legal}=row;return [row.holidayBindingId,objectSha({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})];
 }));
 return result;
}
export async function buildAP23K3Candidate(){
 for(const row of fixedEvidence)assert.equal(sha(await read(row.path)),row.sha256,'Accepted K2 input '+row.path);
 const guardText=await read('outputs/ap23k3-2026-10-27/protected-inputs.json'),guard=JSON.parse(guardText);
 assert.equal(guard.workPackage,'AP23K3');assert.equal(guard.capturedBeforeIntegration,true);
 const acceptance=await read(acceptancePath),decision=await read(decisionPath);
 assert.ok(acceptance.includes('hat AP23K2 technisch abgenommen'));
 assert.ok(decision.includes('Status: beschlossen')&&decision.includes('8.0.0')&&decision.includes('15.0.0'));
 const acceptedText=await read(AP23K3_ACCEPTED+'/manifest.json'),acceptedManifest=JSON.parse(acceptedText);
 const baseText=await read(AP23K3_BASE+'/manifest.json'),baseManifest=JSON.parse(baseText);
 const files=new Map<string,string>(),oldFiles=new Map<string,string>();
 for(const descriptor of acceptedManifest.artifacts){const raw=await read(AP23K3_ACCEPTED+'/'+descriptor.path);
  assert.equal(sha(raw),descriptor.sha256);assert.equal(Buffer.byteLength(raw),descriptor.byteLength);files.set(descriptor.path,raw);}
 for(const descriptor of baseManifest.artifacts){const raw=await read(AP23K3_BASE+'/'+descriptor.path);assert.equal(sha(raw),descriptor.sha256);oldFiles.set(descriptor.path,raw);}
 assert.equal(files.size,44);assert.equal(oldFiles.size,44);
 const componentRef=(contentId:string)=>{
  const role=contentId==='ch-holiday-catalog'?'holidayCatalog' as const:'calendar' as const;
  const path=(role==='calendar'?'calendars/':'holiday-catalogs/')+contentId+'.json';assert.ok(files.has(path));
  return {role,contentId,sha256:sha(files.get(path)!)};
 };
 const socialPath='social-procedures/ch-social-procedures.json';
 files.set(socialPath,encode(rebindSocialCalendarCandidate(JSON.parse(files.get(socialPath)!),AP23K3_RELEASE_ID,
  ['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef))));
 const original=JSON.parse(files.get(AP23K3_ADMIN_PATH)!),admin=structuredClone(original);
 Object.assign(admin,{$schema:prefix+'administrative-procedure-catalog-v8.schema.json',contractStatus:'approved',
  contractDecision:{id:'DEC-2026-040',status:'approved',on:'2026-10-27'}});
 admin.review.basis='K1-A bis K1-G fachlich und AP23K2 technisch abgenommen. DEC-2026-040 beschlossen. Beschluss '+decisionPath+', SHA-256 '+sha(decision)+'. Abnahme '+acceptancePath+', SHA-256 '+sha(acceptance)+'. Keine Quellenrelease- oder Betriebsfreigabe.';
 admin.review.sourceReview='Abgenommene BS-/BL-Verwendungen und übrige Fachobjekte unverändert. Tatsächliche Zielbytes neu gebunden. Gemeinsame Quellenreleasefreigabe steht aus.';
 for(const binding of admin.holidayBindings){
  const physical=binding.bindingVersion==='8.0.0'?binding.physicalSource:binding.physicalBaseline;
  physical.releaseId=AP23K3_RELEASE_ID;physical.references=physical.references.map((ref:any)=>({...componentRef(ref.contentId),path:ref.path}));
 }
 for(const entry of admin.releaseBinding.pathEligibility){
  const binding=admin.holidayBindings.find((row:any)=>row.holidayBindingId===entry.holidayBindingId);
  entry.holidayBindingSha256=objectSha(binding);
  if(binding.bindingVersion==='8.0.0'){
   entry.calendarSelectionSha256=objectSha(binding.calendarSelection);entry.annualEndShiftPolicySha256=objectSha(binding.annualEndShiftPolicy);
  }
  assert.equal(entry.status,'candidate');assert.deepEqual(entry.targetComponentRefs,[]);
 }
 for(const group of ['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths','preserved'])
  assert.deepEqual(admin[group],original[group],'Unchanged accepted K2 meanings '+group);
 files.set(AP23K3_ADMIN_PATH,encode(admin));
 for(const [path,raw] of files)if(path!==AP23K3_ADMIN_PATH&&path!==socialPath)assert.equal(raw,oldFiles.get(path),'Preserved raw artifact '+path);
 const artifacts=acceptedManifest.artifacts.map((row:any)=>({...row,schemaId:JSON.parse(files.get(row.path)!).$schema,
  byteLength:Buffer.byteLength(files.get(row.path)!),sha256:sha(files.get(row.path)!)}));
 const manifest={...acceptedManifest,$schema:prefix+'implementation/ap23k3/local-reference-manifest-v15.schema.json',
  releaseId:AP23K3_RELEASE_ID,releaseStatus:'candidate',artifacts,
  extensions:{'steimer.local-reference':{workPackage:'AP23K3',productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
   sourceReview:'pending',contractDecision:'DEC-2026-040',contractDecisionOn:'2026-10-27',technicalAcceptanceSha256:sha(acceptance),
   contractDecisionSha256:sha(decision),acceptedStructuralManifestSha256:sha(acceptedText),baselineManifestSha256:sha(baseText),
   historicalPhysicalReuse:'Actual target references rebound. No federal or foreign procedure permission inheritance.',
   annualOfficeClosures:'Separate annual end-shift-only policy, no physical holiday changes.',
   sourceReviewReuse:'Accepted meanings and evidence preserved. Combined new source-release review pending.'}}};
 const manifestText=encode(manifest);
 const generatedModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Generated local K3 reference data, no operating or export authority.\n'
  +"import {createFormat15CalculationData} from '../core/format15CalculationData';\n"
  +'export const ap23k3ManifestText='+JSON.stringify(manifestText)+';\n'
  +'export const ap23k3Files:ReadonlyMap<string,string>=new Map('+JSON.stringify([...files])+');\n'
  +"export const ap23k3CandidateRuntime=createFormat15CalculationData(ap23k3ManifestText,ap23k3Files,{mode:'localReference'});\n"
  +'export const ap23k3AdministrativeContext=ap23k3CandidateRuntime.administrativeContext;\n';
 const administrativeBaselineModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted K2 semantic definitions, not a source release permission.\n'
  +'export const ADMINISTRATIVE_V8_BASELINE='+JSON.stringify(baseline(admin),null,2)+' as const;\n';
 const integrity=encode({kind:'ap23k3-local-reference-bundle',releaseId:AP23K3_RELEASE_ID,releaseStatus:'candidate',contractDecision:'DEC-2026-040',contractStatus:'approved',
  sourceReleaseApproved:false,productionActivation:false,referenceOnly:true,calendarExportEnabled:false,sourceReview:'pending',
  basedOn:[...fixedEvidence,{path:decisionPath,sha256:sha(decision)},{path:acceptancePath,sha256:sha(acceptance)},
   {path:'outputs/ap23k3-2026-10-27/protected-inputs.json',sha256:sha(guardText)}],
  counts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:165,preservedAdministrativePaths:149,newAdministrativePaths:16,
   qualificationPolicies:165,laws:20,suspensionProfiles:37,holidayBindings:30,basisHolidayRules:479,supplementalRules:20,totalHolidayRules:499,newHolidayRules:0,
   annualOfficeClosureDays:13,uncertainClosureDays:1,dynamicTerminalBindings:26,dynamicTerminalVariants:28,dynamicProjections:29,
   preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedFromJ3:[...files].filter(([p,raw])=>oldFiles.get(p)===raw).length},
  manifest:{path:AP23K3_TARGET+'/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
  artifacts:artifacts.map((row:any)=>({path:AP23K3_TARGET+'/'+row.path,byteLength:row.byteLength,sha256:row.sha256})),
  generatedModules:[{path:'src/release/ap23k3CandidateData.ts',sha256:sha(generatedModule)},
   {path:'src/core/administrativeV8Baseline.ts',sha256:sha(administrativeBaselineModule)}],
  buildScript:{path:'scripts/build-ap23k3-candidate.ts',sha256:sha(await read('scripts/build-ap23k3-candidate.ts'))}});
 return {manifestText,files,generatedModule,administrativeBaselineModule,integrity};
}
export async function materializeAP23K3Candidate(mode:'write'|'check'){
 const result=await buildAP23K3Candidate();
 const outputs:[string,string][]=[...result.files].map(([path,raw])=>[AP23K3_TARGET+'/'+path,raw]);
 outputs.push([AP23K3_TARGET+'/manifest.json',result.manifestText],['src/release/ap23k3CandidateData.ts',result.generatedModule],
  ['src/core/administrativeV8Baseline.ts',result.administrativeBaselineModule],['outputs/ap23k3-2026-10-27/bundle-integrity.json',result.integrity]);
 for(const [path,text] of outputs){const target=resolve(AP23K3_ROOT,path);
  if(mode==='write'){await mkdir(dirname(target),{recursive:true});await writeFile(target,text);}else assert.equal(await read(path),text,'Deterministic native candidate '+path);}
 console.log(JSON.stringify({mode,releaseId:AP23K3_RELEASE_ID,artifacts:44,manifestSha256:sha(result.manifestText),referenceOnly:true,exportAllowed:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];assert.ok(mode==='--write'||mode==='--check');await materializeAP23K3Candidate(mode==='--write'?'write':'check');
}
