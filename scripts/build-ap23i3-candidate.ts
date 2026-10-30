// SPDX-License-Identifier: AGPL-3.0-only
// Native local I3 candidate, never a source promotion or operating release.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSocialJson} from '../src/core/socialCatalog';
import {rebindSocialCalendarCandidate} from '../src/core/calendarMigration';
import type {ReleaseArtifactReference} from '../src/core/socialTypes';
export const AP23I3_ROOT=fileURLToPath(new URL('../',import.meta.url));
export const AP23I3_BASE='data/candidates/2026-10-22-ap23h3';
export const AP23I3_ACCEPTED='outputs/ap23i2-candidate-2026-10-22/bundle';
export const AP23I3_TARGET='data/candidates/2026-10-22-ap23i3';
export const AP23I3_RELEASE_ID='2026-10-22-ap23i3-candidate.1';
export const AP23I3_ADMIN_PATH='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23I3_MODULE='src/release/ap23i3CandidateData.ts';
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const decisionPath='docs/entscheidungen/DEC-2026-038-beschluss.md',acceptancePath='docs/fachrecht/abnahme-ap23i2.md';
const sha=(raw:string):string=>createHash('sha256').update(raw).digest('hex');
const objectSha=(v:unknown):string=>sha(canonicalSocialJson(v));
const encode=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
const read=(p:string):Promise<string>=>readFile(resolve(AP23I3_ROOT,p),'utf8');
const fixedEvidence=[
 {path:AP23I3_BASE+'/manifest.json',sha256:'14f60a83ed2f13e3f176f303e444ea43a606bae6980033e3d875093c63a5d429'},
 {path:AP23I3_ACCEPTED+'/manifest.json',sha256:'05131bf6b30ca4df832ff5272c4755b62be1c902a7d85f4ab9bf4ae5fca08f27'},
 {path:'outputs/ap23i2-2026-10-22/local-completion.json',sha256:'3d21fdd48f697a2b7e0a501a77ab3834f790c1633dd0cb4d10af19420dc766dd'},
 {path:'outputs/ap23i2-candidate-2026-10-22/QA-AP23I2.json',sha256:'914fe2da7aa15edad68094e9e14295b6b7d55539f7ce61d7b5e41de0a034135b'},
 {path:'outputs/ap23i2-candidate-2026-10-22/QA-AP23I2-INDEPENDENT.json',sha256:'fcdbf04e6a4cd199a2c6ca6349b832106d080d4bb16a0c509d12ad2d00618054'},
 {path:'docs/architektur/verwaltungsverfahrensvertrag-ap23i2.md',sha256:'d431d649de4b81d115b279e5dcdf7d576f8a8fde8f4923ac8391dc8c6476c13f'},
 {path:'outputs/ap23i2-abnahme-2026-10-22/receipt.json',sha256:'fc5ebf0378caf579c911419e41843b18cd02c6329da419b37926624fd9119da6'}
] as const;
function holidayContent(c:any):unknown{const a=c.activation;return{data:c.data,calendarProjections:c.calendarProjections,matrixDecisions:a.matrixDecisions,
 projections:a.projections,procedureBindings:a.procedureBindings,anchorPolicies:a.anchorPolicies,supplementalRules:a.supplementalRules,supplementalScopes:a.supplementalScopes};}
function administrativeBaseline(c:any):Record<string,Record<string,string>>{
 const result:Record<string,Record<string,string>>={};
 for(const[group,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)
  result[group]=Object.fromEntries(c[group].map((row:any)=>[row[key],objectSha(row)]));
 result.holidayBindings=Object.fromEntries(c.holidayBindings.map(({physicalBaseline,...legal}:any)=>[legal.holidayBindingId,
  objectSha({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})]));
 result.sources=Object.fromEntries(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity}:any)=>[identity.sourceId,objectSha(identity)]));
 result.preserved=Object.fromEntries(c.preserved.map((row:any)=>[row.path,objectSha(row)]));
 return result;
}
export interface AP23I3Candidate{readonly manifestText:string;readonly files:ReadonlyMap<string,string>;readonly generatedModule:string;
 readonly administrativeBaselineModule:string;readonly format13BaselineModule:string;readonly integrityText:string;}
export async function buildAP23I3Candidate():Promise<AP23I3Candidate>{
 for(const e of fixedEvidence)assert.equal(sha(await read(e.path)),e.sha256,'Accepted I2 input '+e.path);
 const acceptance=await read(acceptancePath),decision=await read(decisionPath);
 assert.ok(acceptance.includes('AP23I2 ist technisch abgenommen.'));
 assert.ok(decision.includes('status: beschlossen')&&decision.includes('Kantonalverfahrenskatalog 6.0.0 sowie Manifest und Mindestconsumer 13.0.0'));
 const baseText=await read(AP23I3_BASE+'/manifest.json'),base=JSON.parse(baseText),structuralText=await read(AP23I3_ACCEPTED+'/manifest.json'),structural=JSON.parse(structuralText);
 const files=new Map<string,string>(),oldFiles=new Map<string,string>();
 for(const d of structural.artifacts){const text=await read(AP23I3_ACCEPTED+'/'+d.path);assert.equal(sha(text),d.sha256);assert.equal(Buffer.byteLength(text),d.byteLength);files.set(d.path,text);}
 for(const d of base.artifacts){const text=await read(AP23I3_BASE+'/'+d.path);assert.equal(sha(text),d.sha256);assert.equal(Buffer.byteLength(text),d.byteLength);oldFiles.set(d.path,text);}
 assert.equal(files.size,44);assert.equal(oldFiles.size,44);
 const holidayPath='holiday-catalogs/ch-holiday-catalog.json',holiday=JSON.parse(files.get(holidayPath)!);
 assert.equal(files.get(holidayPath),oldFiles.get(holidayPath),'No holiday content or raw-byte change');
 for(const[path,text]of files)if(path.startsWith('calendars/'))assert.equal(text,oldFiles.get(path),'Unchanged calendar '+path);
 const componentRef=(contentId:string):ReleaseArtifactReference=>{
  const role=contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar',path=(role==='calendar'?'calendars/':'holiday-catalogs/')+contentId+'.json';
  assert.ok(files.has(path));return{role,contentId,sha256:sha(files.get(path)!)};
 };
 const socialPath='social-procedures/ch-social-procedures.json';
 const social=rebindSocialCalendarCandidate(JSON.parse(files.get(socialPath)!),AP23I3_RELEASE_ID,
  ['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef));files.set(socialPath,encode(social));
 const accepted=JSON.parse(files.get(AP23I3_ADMIN_PATH)!),admin=JSON.parse(JSON.stringify(accepted)),old=JSON.parse(oldFiles.get(AP23I3_ADMIN_PATH)!);
 Object.assign(admin,{$schema:prefix+'administrative-procedure-catalog-v6.schema.json',contractStatus:'approved',
  contractDecision:{id:'DEC-2026-038',status:'approved',on:'2026-10-22'}});
 admin.review.basis='I1-A bis I1-G fachlich und AP23I2 technisch abgenommen. DEC-2026-038 beschlossen. Beschluss '+decisionPath+', SHA-256 '+sha(decision)+'. Abnahme '+acceptancePath+', SHA-256 '+sha(acceptance)+'. Keine Quellenrelease- oder Betriebsfreigabe.';
 admin.review.sourceReview='Bestehende Quellen und qualifizierte GL-/TG-Verwendungen unverändert. Keine gemeinsame neue Releasequellenfreigabe. Tatsächliche Zielbytes konsistent gebunden.';
 for(const binding of admin.holidayBindings){binding.physicalBaseline.releaseId=AP23I3_RELEASE_ID;
  binding.physicalBaseline.references=binding.physicalBaseline.references.map((ref:any)=>({...componentRef(ref.contentId),path:ref.path}));}
 for(const entry of admin.releaseBinding.pathEligibility){const binding=admin.holidayBindings.find((b:any)=>b.holidayBindingId===entry.holidayBindingId);
  entry.holidayBindingSha256=objectSha(binding);assert.equal(entry.status,'candidate');assert.deepEqual(entry.targetComponentRefs,[]);
  assert.equal(entry.sourceReviewRef,null);assert.equal(entry.referenceSuiteRef,null);}
 for(const group of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths'])assert.deepEqual(admin[group],accepted[group],'Unchanged I2 meanings '+group);
 for(const[group,key]of[['paths','pathId'],['qualificationPolicies','pathId']]as const)for(const row of old[group])
  assert.deepEqual(admin[group].find((r:any)=>r[key]===row[key]),row,'Preserved H3 '+group+'/'+row[key]);
 files.set(AP23I3_ADMIN_PATH,encode(admin));
 const artifacts=structural.artifacts.map((d:any)=>({...d,schemaId:JSON.parse(files.get(d.path)!).$schema,byteLength:Buffer.byteLength(files.get(d.path)!),sha256:sha(files.get(d.path)!)}));
 const sourceIds=[...new Set<string>([...files.values()].flatMap(t=>(JSON.parse(t).sources??[]).map((s:any)=>s.sourceId)))].sort();
 const manifest={...structural,$schema:prefix+'implementation/ap23i3/local-reference-manifest-v13.schema.json',releaseId:AP23I3_RELEASE_ID,
  createdOn:'2026-10-22',releaseStatus:'candidate',artifacts,sourceSummary:{latestReviewedOn:'2026-10-22',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds},
  extensions:{'steimer.local-reference':{workPackage:'AP23I3',productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
   sourceReview:'pending',contractDecision:'DEC-2026-038',contractDecisionOn:'2026-10-22',baselineManifestSha256:sha(baseText),acceptedStructuralManifestSha256:sha(structuralText),
   contractDecisionSha256:sha(decision),technicalAcceptanceSha256:sha(acceptance),
   historicalPhysicalReuse:'Accepted historical physical provenance stays unchanged. Actual target hashes are independently rebound, without procedural permission inheritance.',
   administrativeCandidateBinding:'Actual target hashes in physicalBaseline and manifest. Release and path targets remain empty and unapproved.',
   sourceReviewReuse:'Accepted meanings and evidence remain unchanged. No combined new source-release review or operating permission.'}}};
 const manifestText=encode(manifest);
 const generatedModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Generated AP23I3 local reference data. No operating or export permission.\n'
  +"import { createFormat13CalculationData } from '../core/format13CalculationData';\nimport type { ParsedFormat13Data } from '../core/releaseFormat13';\n"
  +'export const ap23i3ManifestText = '+JSON.stringify(manifestText)+';\nexport const ap23i3Files: ReadonlyMap<string,string> = new Map('+JSON.stringify([...files])+');\n'
  +"export const ap23i3CandidateRuntime = createFormat13CalculationData(ap23i3ManifestText, ap23i3Files, { mode: 'localReference' });\nexport const ap23i3AdministrativeContext: ParsedFormat13Data = ap23i3CandidateRuntime.administrativeContext;\n";
 const administrativeBaselineModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted I2 meanings, native DEC-2026-038. Not a release permission.\nexport const ADMINISTRATIVE_V6_BASELINE = '+JSON.stringify(administrativeBaseline(admin),null,2)+' as const;\n';
 const {releaseEligibility:_permission,...closedActivation}=holiday.activation;
 const calendarTemplates=[...files].filter(([p])=>p.startsWith('calendars/')).map(([,text])=>JSON.parse(text));
 const sourceProvenances=Object.fromEntries(['SRC-AP23H1-OW-GOG-20220401','SRC-AP23H1-NW-VRG-20260801'].map(id=>[id,[...new Set([admin,...calendarTemplates]
  .flatMap(d=>(d.sources??[]).filter((s:any)=>s.sourceId===id).map((s:any)=>objectSha(s))))]]));
 const format13BaselineModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted I2 meanings and unchanged physical H3 calendars.\n'
  +'export const FORMAT13_HOLIDAY_CONTENT_SHA256 = '+JSON.stringify(objectSha(holidayContent(holiday)))+';\n'
  +'export const FORMAT13_HOLIDAY_NATIVE_SHA256 = '+JSON.stringify(objectSha({...holiday,activation:closedActivation}))+';\n'
  +'export const FORMAT13_SOURCE_PROVENANCES = '+JSON.stringify(sourceProvenances,null,2)+' as const;\n'
  +'export const FORMAT13_CALENDAR_TEMPLATES = '+JSON.stringify(calendarTemplates,null,2)+' as const;\n';
 const modules=[{path:AP23I3_MODULE,sha256:sha(generatedModule)},{path:'src/core/administrativeV6Baseline.ts',sha256:sha(administrativeBaselineModule)},
  {path:'src/core/format13Baseline.ts',sha256:sha(format13BaselineModule)}];
 const integrityText=encode({kind:'ap23i3-local-reference-bundle',releaseId:AP23I3_RELEASE_ID,releaseStatus:'candidate',contractDecision:'DEC-2026-038',contractStatus:'approved',
  sourceReleaseApproved:false,productionActivation:false,referenceOnly:true,calendarExportEnabled:false,sourceReview:'pending',
  basedOn:[...fixedEvidence,{path:decisionPath,sha256:sha(decision)},{path:acceptancePath,sha256:sha(acceptance)}],
  counts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:113,preservedAdministrativePaths:79,newAdministrativePaths:34,
   qualificationPolicies:113,laws:15,suspensionProfiles:29,holidayBindings:21,basisHolidayRules:479,supplementalRules:20,newHolidayRules:0,totalHolidayRules:499,preservedSocialRules:44,preservedBernSocialBindings:50,
   rawUnchangedFromH3:[...files].filter(([p,text])=>oldFiles.get(p)===text).length},
  actualAdministrativeComponents:[...new Set<string>(admin.holidayBindings.flatMap((h:any)=>h.physicalBaseline.references.map((r:any)=>r.contentId)))].map(componentRef),
  holidayContentSha256:objectSha(holidayContent(holiday)),manifest:{path:AP23I3_TARGET+'/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
  artifacts:artifacts.map((a:any)=>({path:AP23I3_TARGET+'/'+a.path,byteLength:a.byteLength,sha256:a.sha256})),generatedModules:modules,
  buildScript:{path:'scripts/build-ap23i3-candidate.ts',sha256:sha(await read('scripts/build-ap23i3-candidate.ts'))}});
 return{manifestText,files,generatedModule,administrativeBaselineModule,format13BaselineModule,integrityText};
}
export async function materializeAP23I3Candidate(mode:'write'|'check'):Promise<void>{
 const r=await buildAP23I3Candidate(),outputs:[string,string][]=[...r.files].map(([path,text])=>[AP23I3_TARGET+'/'+path,text]);
 outputs.push([AP23I3_TARGET+'/manifest.json',r.manifestText],[AP23I3_MODULE,r.generatedModule],['src/core/administrativeV6Baseline.ts',r.administrativeBaselineModule],
  ['src/core/format13Baseline.ts',r.format13BaselineModule],['outputs/ap23i3-2026-10-22/bundle-integrity.json',r.integrityText]);
 for(const[path,text]of outputs){const target=resolve(AP23I3_ROOT,path);if(mode==='write'){await mkdir(dirname(target),{recursive:true});await writeFile(target,text);}
  else assert.equal(await read(path),text,'Generated I3 bytes '+path);}
 console.log(JSON.stringify({mode,releaseId:AP23I3_RELEASE_ID,artifacts:r.files.size,manifestSha256:sha(r.manifestText),referenceOnly:true,exportAllowed:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');await materializeAP23I3Candidate(flag==='--write'?'write':'check');
}
