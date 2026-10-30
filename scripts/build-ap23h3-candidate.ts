// SPDX-License-Identifier: AGPL-3.0-only
// Native AP23H3 reference integration. No release promotion or operating authority.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSocialJson } from '../src/core/socialCatalog';
import { rebindSocialCalendarCandidate } from '../src/core/calendarMigration';
import type { ReleaseArtifactReference } from '../src/core/socialTypes';

export const AP23H3_ROOT=fileURLToPath(new URL('../',import.meta.url));
export const AP23H3_BASE='data/candidates/2026-10-22-ap23g3';
export const AP23H3_ACCEPTED='outputs/ap23h2-candidate-2026-10-22/bundle';
export const AP23H3_TARGET='data/candidates/2026-10-22-ap23h3';
export const AP23H3_RELEASE_ID='2026-10-22-ap23h3-candidate.1';
export const AP23H3_ADMIN_PATH='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23H3_MODULE='src/release/ap23h3CandidateData.ts';
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const decisionPath='docs/entscheidungen/DEC-2026-037-beschluss.md',acceptancePath='docs/fachrecht/abnahme-ap23h2.md';
const sha=(raw:string):string=>createHash('sha256').update(raw).digest('hex');
const objectSha=(v:unknown):string=>sha(canonicalSocialJson(v));
const encode=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
const read=(p:string):Promise<string>=>readFile(resolve(AP23H3_ROOT,p),'utf8');
const fixedEvidence=[
  {path:`${AP23H3_BASE}/manifest.json`,sha256:'bf710be1a5e58b540d644e4dace885eed4dbe998a431badb9eec07032ea6bada'},
  {path:`${AP23H3_ACCEPTED}/manifest.json`,sha256:'221491b96c330e46919248e569ade16a46d3a84ca7ea5df7cd6c91d148f687de'},
  {path:'outputs/ap23h2-2026-10-22/local-completion.json',sha256:'e2398539e3c1ba0c06948fa50dae62aa17c0dc39d011962ab5b2a43888072dd1'},
  {path:'outputs/ap23h2-2026-10-22/QA-AP23H2.json',sha256:'513ac4320be21172529b6027c8e03ca6f3cc55c675f998852ea3e276a018ffae'},
  {path:'outputs/ap23h2-2026-10-22/QA-AP23H2-INDEPENDENT.json',sha256:'04f6b435547e7bb210b9d07417d3b6a6d79f39b52ff17791412ec9faa5da993b'},
  {path:'docs/architektur/verwaltungsverfahrensvertrag-ap23h2.md',sha256:'4e185f129613df9135762923aec4218c2b6194f7ee32922018cf884f6d29aae4'},
  {path:'outputs/ap23h2-abnahme-2026-10-22/receipt.json',sha256:'bb856623f83847202b2a7e387fbe3a974234abe250d0c2b4180f4fd52b303494'}
] as const;

function holidayContent(c:any):unknown{
  const a=c.activation;return{data:c.data,calendarProjections:c.calendarProjections,matrixDecisions:a.matrixDecisions,projections:a.projections,
    procedureBindings:a.procedureBindings,anchorPolicies:a.anchorPolicies,supplementalRules:a.supplementalRules,supplementalScopes:a.supplementalScopes};
}
function administrativeBaseline(c:any):Record<string,Record<string,string>>{
  const result:Record<string,Record<string,string>>={};
  for(const[group,key]of[['paths','pathId'],['qualificationPolicies','pathId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId']]as const)
    result[group]=Object.fromEntries(c[group].map((row:any)=>[row[key],objectSha(row)]));
  result.holidayBindings=Object.fromEntries(c.holidayBindings.map(({physicalBaseline,...legal}:any)=>[legal.holidayBindingId,
    objectSha({...legal,calendarId:physicalBaseline.calendarId,projectionId:physicalBaseline.projectionId})]));
  result.sources=Object.fromEntries(c.sources.map(({reviewedOn:_date,reviewBasis:_basis,...identity}:any)=>[identity.sourceId,objectSha(identity)]));
  result.sourceObjects=Object.fromEntries(c.sources.map((row:any)=>[row.sourceId,objectSha(row)]));
  return result;
}
export interface AP23H3Candidate{
  readonly manifestText:string;readonly files:ReadonlyMap<string,string>;readonly generatedModule:string;
  readonly administrativeBaselineModule:string;readonly format12BaselineModule:string;readonly integrityText:string;
}
export async function buildAP23H3Candidate():Promise<AP23H3Candidate>{
  for(const e of fixedEvidence)assert.equal(sha(await read(e.path)),e.sha256,`Accepted evidence ${e.path}`);
  const acceptance=await read(acceptancePath),decision=await read(decisionPath);
  assert.ok(acceptance.includes('AP23H2 ist technisch abgenommen. DEC-2026-037 ist beschlossen. AP23H3 ist ausdrücklich gestartet.'));
  assert.ok(decision.includes('status: beschlossen')&&decision.includes('Kantonalverfahrenskatalog 5.0.0 sowie Manifest und Mindestconsumer 12.0.0'));
  const baseText=await read(`${AP23H3_BASE}/manifest.json`),base=JSON.parse(baseText),structuralText=await read(`${AP23H3_ACCEPTED}/manifest.json`),structural=JSON.parse(structuralText);
  const files=new Map<string,string>(),oldFiles=new Map<string,string>();
  for(const d of structural.artifacts){const text=await read(`${AP23H3_ACCEPTED}/${d.path}`);assert.equal(sha(text),d.sha256);assert.equal(Buffer.byteLength(text),d.byteLength);files.set(d.path,text);}
  for(const d of base.artifacts){const text=await read(`${AP23H3_BASE}/${d.path}`);assert.equal(sha(text),d.sha256);assert.equal(Buffer.byteLength(text),d.byteLength);oldFiles.set(d.path,text);}
  assert.equal(files.size,44);assert.equal(oldFiles.size,42);
  const holidayPath='holiday-catalogs/ch-holiday-catalog.json',holiday=JSON.parse(files.get(holidayPath)!);
  for(const[path,text]of files)if(path.startsWith('calendars/')){const c=JSON.parse(text);c.projection.sourceHash=sha(files.get(holidayPath)!);files.set(path,encode(c));}
  const componentRef=(contentId:string):ReleaseArtifactReference=>{
    const role=contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar',path=`${role==='calendar'?'calendars':'holiday-catalogs'}/${contentId}.json`;
    assert.ok(files.has(path));return{role,contentId,sha256:sha(files.get(path)!)};
  };
  const socialPath='social-procedures/ch-social-procedures.json';
  const social=rebindSocialCalendarCandidate(JSON.parse(files.get(socialPath)!),AP23H3_RELEASE_ID,
    ['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef));files.set(socialPath,encode(social));
  const accepted=JSON.parse(files.get(AP23H3_ADMIN_PATH)!),admin=structuredClone(accepted),old=JSON.parse(oldFiles.get(AP23H3_ADMIN_PATH)!);
  Object.assign(admin,{$schema:prefix+'administrative-procedure-catalog-v5.schema.json',contractStatus:'approved',
    contractDecision:{id:'DEC-2026-037',status:'approved',on:'2026-10-22'}});
  admin.review.basis=`Bestehende G1- und neue H1-Fachgrundlagen sowie AP23H2 technisch abgenommen. Beschluss ${decisionPath}, SHA-256 ${sha(decision)}. Abnahme ${acceptancePath}, SHA-256 ${sha(acceptance)}. Keine neue Quellenrelease- oder Betriebsfreigabe.`;
  for(const h of admin.holidayBindings){h.physicalBaseline.releaseId=AP23H3_RELEASE_ID;
    h.physicalBaseline.references=h.physicalBaseline.references.map((r:any)=>({...componentRef(r.contentId),path:r.path}));}
  for(const e of admin.releaseBinding.pathEligibility){const h=admin.holidayBindings.find((h:any)=>h.holidayBindingId===e.holidayBindingId);
    e.holidayBindingSha256=objectSha(h);assert.equal(e.status,'candidate');assert.deepEqual(e.targetComponentRefs,[]);assert.equal(e.sourceReviewRef,null);assert.equal(e.referenceSuiteRef,null);}
  for(const group of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths'])assert.deepEqual(admin[group],accepted[group],`Unchanged H2 definitions ${group}`);
  for(const[group,key]of[['paths','pathId'],['qualificationPolicies','pathId']]as const)for(const row of old[group])assert.deepEqual(admin[group].find((r:any)=>r[key]===row[key]),row,`Unchanged G3 ${group}/${row[key]}`);
  for(const h of accepted.holidayBindings.filter((h:any)=>h.bindingVersion==='5.0.0')){
    const next=admin.holidayBindings.find((n:any)=>n.holidayBindingId===h.holidayBindingId);assert.deepEqual(next.physicalReuse,h.physicalReuse);assert.deepEqual(next.practiceAddition,h.practiceAddition);}
  files.set(AP23H3_ADMIN_PATH,encode(admin));
  const artifacts=structural.artifacts.map((d:any)=>({...d,schemaId:JSON.parse(files.get(d.path)!).$schema,byteLength:Buffer.byteLength(files.get(d.path)!),sha256:sha(files.get(d.path)!)}));
  const sourceIds=[...new Set<string>([...files.values()].flatMap(t=>(JSON.parse(t).sources??[]).map((s:any)=>s.sourceId)))].sort();
  const manifest={...structural,$schema:prefix+'implementation/ap23h3/local-reference-manifest-v12.schema.json',releaseId:AP23H3_RELEASE_ID,
    createdOn:'2026-10-22',releaseStatus:'candidate',artifacts,sourceSummary:{latestReviewedOn:'2026-10-22',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds},
    extensions:{'steimer.local-reference':{workPackage:'AP23H3',productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
      sourceReview:'pending',contractDecision:'DEC-2026-037',contractDecisionOn:'2026-10-22',baselineManifestSha256:sha(baseText),acceptedStructuralManifestSha256:sha(structuralText),
      contractDecisionSha256:sha(decision),technicalAcceptanceSha256:sha(acceptance),
      historicalPhysicalReuse:'PhysicalReuse retains the accepted G3 historical provenance. PhysicalBaseline and manifest bind actual H3 components. Same dates never inherit federal legal permission.',
      administrativeCandidateBinding:'Actual target hashes in physicalBaseline and manifest. Release/per-path targets empty and unapproved.',
      sourceReviewReuse:'Accepted existing G1 and new H1 uses retained. No combined source-release review or operating permission.'}}};
  const manifestText=encode(manifest);
  const generatedModule=`// SPDX-License-Identifier: AGPL-3.0-only\n// Generated AP23H3 local reference data. No operating or export permission.\nimport { createFormat12CalculationData } from '../core/format12CalculationData';\nimport type { ParsedFormat12Data } from '../core/releaseFormat12';\nexport const ap23h3ManifestText = ${JSON.stringify(manifestText)};\nexport const ap23h3Files: ReadonlyMap<string,string> = new Map(${JSON.stringify([...files])});\nexport const ap23h3CandidateRuntime = createFormat12CalculationData(ap23h3ManifestText, ap23h3Files, { mode: 'localReference' });\nexport const ap23h3AdministrativeContext: ParsedFormat12Data = ap23h3CandidateRuntime.administrativeContext;\n`;
  const administrativeBaselineModule=`// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted H2 meanings, native DEC-2026-037. Exact identities are not release authority.\nexport const ADMINISTRATIVE_V5_BASELINE = ${JSON.stringify(administrativeBaseline(admin),null,2)} as const;\n`;
  const {releaseEligibility:_permission,...closedActivation}=holiday.activation;
  const calendarTemplates=[...files].filter(([p])=>p.startsWith('calendars/')).map(([,t])=>JSON.parse(t));
  const sourceProvenances=Object.fromEntries(['SRC-AP23H1-OW-GOG-20220401','SRC-AP23H1-NW-VRG-20260801'].map(id=>[id,[...new Set([admin,...calendarTemplates].flatMap(d=>(d.sources??[]).filter((s:any)=>s.sourceId===id).map((s:any)=>objectSha(s))))]]));
  const format12BaselineModule='// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted H2 meanings. Actual H3 bytes are not release authority.\n'
    +'export const FORMAT12_HOLIDAY_CONTENT_SHA256 = '+JSON.stringify(objectSha(holidayContent(holiday)))+';\n'
    +'export const FORMAT12_HOLIDAY_NATIVE_SHA256 = '+JSON.stringify(objectSha({...holiday,activation:closedActivation}))+';\n'
    +'export const FORMAT12_SOURCE_PROVENANCES = '+JSON.stringify(sourceProvenances,null,2)+' as const;\n'
    +'export const FORMAT12_CALENDAR_TEMPLATES = '+JSON.stringify(calendarTemplates,null,2)+' as const;\n';
  const modules=[{path:AP23H3_MODULE,sha256:sha(generatedModule)},{path:'src/core/administrativeV5Baseline.ts',sha256:sha(administrativeBaselineModule)},
    {path:'src/core/format12Baseline.ts',sha256:sha(format12BaselineModule)}];
  const integrityText=encode({kind:'ap23h3-local-reference-bundle',releaseId:AP23H3_RELEASE_ID,releaseStatus:'candidate',contractDecision:'DEC-2026-037',contractStatus:'approved',
    sourceReleaseApproved:false,productionActivation:false,referenceOnly:true,calendarExportEnabled:false,sourceReview:'pending',
    basedOn:[...fixedEvidence,{path:decisionPath,sha256:sha(decision)},{path:acceptancePath,sha256:sha(acceptance)}],
    counts:{artifacts:44,totalFilesIncludingManifest:45,calendars:35,profiles:5,administrativePaths:79,preservedAdministrativePaths:58,newAdministrativePaths:21,
      qualificationPolicies:79,laws:13,suspensionProfiles:25,holidayBindings:17,basisHolidayRules:479,supplementalSoRules:12,newProceduralRules:8,totalHolidayRules:499,preservedSocialRules:44,preservedBernSocialBindings:50,
      rawUnchangedFromG3:[...files].filter(([p,t])=>oldFiles.get(p)===t).length},
    actualAdministrativeComponents:[...new Set<string>(admin.holidayBindings.flatMap((h:any)=>h.physicalBaseline.references.map((r:any)=>r.contentId)))].map(componentRef),
    holidayContentSha256:objectSha(holidayContent(holiday)),manifest:{path:`${AP23H3_TARGET}/manifest.json`,byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
    artifacts:artifacts.map((a:any)=>({path:`${AP23H3_TARGET}/${a.path}`,byteLength:a.byteLength,sha256:a.sha256})),generatedModules:modules,
    buildScript:{path:'scripts/build-ap23h3-candidate.ts',sha256:sha(await read('scripts/build-ap23h3-candidate.ts'))}});
  return{manifestText,files,generatedModule,administrativeBaselineModule,format12BaselineModule,integrityText};
}
export async function materializeAP23H3Candidate(mode:'write'|'check'):Promise<void>{
  const r=await buildAP23H3Candidate(),outputs:[string,string][]=[...r.files].map(([p,t])=>[`${AP23H3_TARGET}/${p}`,t]);
  outputs.push([`${AP23H3_TARGET}/manifest.json`,r.manifestText],[AP23H3_MODULE,r.generatedModule],['src/core/administrativeV5Baseline.ts',r.administrativeBaselineModule],
    ['src/core/format12Baseline.ts',r.format12BaselineModule],['outputs/ap23h3-2026-10-22/bundle-integrity.json',r.integrityText]);
  for(const[p,t]of outputs){const target=resolve(AP23H3_ROOT,p);if(mode==='write'){await mkdir(dirname(target),{recursive:true});await writeFile(target,t);}else assert.equal(await read(p),t,`Generated H3 bytes ${p}`);}
  console.log(JSON.stringify({mode,releaseId:AP23H3_RELEASE_ID,artifacts:r.files.size,manifestSha256:sha(r.manifestText),referenceOnly:true,exportAllowed:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');await materializeAP23H3Candidate(flag==='--write'?'write':'check');
}

