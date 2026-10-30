// SPDX-License-Identifier: AGPL-3.0-only
// Native AP23G3 reference integration. No release promotion or operating authority.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSocialJson } from '../src/core/socialCatalog';
import { rebindSocialCalendarCandidate } from '../src/core/calendarMigration';
import type { ReleaseArtifactReference } from '../src/core/socialTypes';

export const AP23G3_ROOT=fileURLToPath(new URL('../',import.meta.url));
export const AP23G3_BASE='data/candidates/2026-10-22-ap23f3';
export const AP23G3_ACCEPTED='outputs/ap23g2-candidate-2026-10-22/bundle';
export const AP23G3_TARGET='data/candidates/2026-10-22-ap23g3';
export const AP23G3_RELEASE_ID='2026-10-22-ap23g3-candidate.1';
export const AP23G3_ADMIN_PATH='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const AP23G3_MODULE='src/release/ap23g3CandidateData.ts';
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const decisionPath='docs/entscheidungen/DEC-2026-036-beschluss.md',acceptancePath='docs/fachrecht/abnahme-ap23g2.md';
const sha=(raw:string):string=>createHash('sha256').update(raw).digest('hex');
const objectSha=(v:unknown):string=>sha(canonicalSocialJson(v));
const encode=(v:unknown):string=>JSON.stringify(v,null,2)+'\n';
const read=(p:string):Promise<string>=>readFile(resolve(AP23G3_ROOT,p),'utf8');
const fixedEvidence=[
  {path:`${AP23G3_BASE}/manifest.json`,sha256:'89470d589615a447b146eb58028a7e2ac58fe7389b908196b3f82e02864b3311'},
  {path:`${AP23G3_ACCEPTED}/manifest.json`,sha256:'f7193786575ee9f58063859b3af2daca738b766d5a73bd9ddacf474310124187'},
  {path:'outputs/ap23g2-2026-10-22/local-completion.json',sha256:'bc06bf3e6fa10986be2c27dbf927b7e4988f9522e98b20f82803f141d0d378f8'},
  {path:'outputs/ap23g2-2026-10-22/QA-AP23G2.json',sha256:'eae5906223ed690349a4126bd04947094d4e201472fda4f333ca2fec6c4b9e1e'},
  {path:'outputs/ap23g2-2026-10-22/QA-AP23G2-INDEPENDENT.json',sha256:'eb230cb4f2e2292f5818ec7d4e4f163d8fb96eec67b3fe60d7b2b7df29a880d3'},
  {path:'docs/architektur/verwaltungsverfahrensvertrag-ap23g2.md',sha256:'c3b0298d5cb8710718b4b59315c1150a967d00c4036d5d0ed8e46809ba7a5eba'},
  {path:'docs/architektur/verwaltungsverfahrensvertrag-ap23g2-pruefung.md',sha256:'f39987150e488dc55af295beee382818b6fe2bead2b590aee0f4948ff00f9569'},
  {path:'docs/entscheidungen/DEC-2026-036-eroeffnungsketten-und-begruendungsverlangen-v4.md',sha256:'09fc67aa785ba06dc406db60528fc5e0301e0eec162d409f5853daf93f6297df'},
  {path:'outputs/ap23g2-abnahme-2026-10-22/receipt.json',sha256:'e574f920bbc01b01d3c9b358524acddad095f695cf38d91dca78c2d456e7db7c'}
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
export interface AP23G3Candidate{
  readonly manifestText:string;readonly files:ReadonlyMap<string,string>;readonly generatedModule:string;
  readonly administrativeBaselineModule:string;readonly format11BaselineModule:string;readonly integrityText:string;
}
export async function buildAP23G3Candidate():Promise<AP23G3Candidate>{
  for(const e of fixedEvidence)assert.equal(sha(await read(e.path)),e.sha256,`Accepted evidence ${e.path}`);
  const acceptance=await read(acceptancePath),decision=await read(decisionPath);
  assert.ok(acceptance.includes('AP23G2 ist technisch abgenommen. DEC-2026-036 ist beschlossen. AP23G3 ist ausdrücklich gestartet.'));
  assert.ok(decision.includes('status: beschlossen')&&decision.includes('Kantonalverfahrenskatalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0'));
  const baseText=await read(`${AP23G3_BASE}/manifest.json`),base=JSON.parse(baseText),structuralText=await read(`${AP23G3_ACCEPTED}/manifest.json`),structural=JSON.parse(structuralText);
  const files=new Map<string,string>(),oldFiles=new Map<string,string>();
  for(const d of structural.artifacts){const text=await read(`${AP23G3_ACCEPTED}/${d.path}`);assert.equal(sha(text),d.sha256);assert.equal(Buffer.byteLength(text),d.byteLength);files.set(d.path,text);}
  for(const d of base.artifacts){const text=await read(`${AP23G3_BASE}/${d.path}`);assert.equal(sha(text),d.sha256);assert.equal(Buffer.byteLength(text),d.byteLength);oldFiles.set(d.path,text);}
  assert.equal(files.size,42);assert.equal(oldFiles.size,42);
  for(const[path,text]of files)if(path!==AP23G3_ADMIN_PATH)assert.equal(text,oldFiles.get(path),`G2 F3 physical identity ${path}`);
  const holidayPath='holiday-catalogs/ch-holiday-catalog.json',holiday=JSON.parse(files.get(holidayPath)!);
  assert.equal(sha(files.get(holidayPath)!),'a5500b47cd7f2aad03d56f0eb16c738d0e75c56d14f8bb2cb56c85abc4b7cd45');
  const componentRef=(contentId:string):ReleaseArtifactReference=>{
    const role=contentId==='ch-holiday-catalog'?'holidayCatalog':'calendar',path=`${role==='calendar'?'calendars':'holiday-catalogs'}/${contentId}.json`;
    assert.ok(files.has(path));return{role,contentId,sha256:sha(files.get(path)!)};
  };
  const socialPath='social-procedures/ch-social-procedures.json';
  const social=rebindSocialCalendarCandidate(JSON.parse(files.get(socialPath)!),AP23G3_RELEASE_ID,
    ['ch-federal-calendar','be-public-holidays','ch-holiday-catalog'].map(componentRef));files.set(socialPath,encode(social));
  const accepted=JSON.parse(files.get(AP23G3_ADMIN_PATH)!),admin=structuredClone(accepted),old=JSON.parse(oldFiles.get(AP23G3_ADMIN_PATH)!);
  Object.assign(admin,{$schema:prefix+'administrative-procedure-catalog-v4.schema.json',contractStatus:'approved',
    contractDecision:{id:'DEC-2026-036',status:'approved',on:'2026-10-22'}});
  admin.review.basis=`AP23G1 fachlich und AP23G2 technisch abgenommen. Beschluss ${decisionPath}, SHA-256 ${sha(decision)}. Abnahme ${acceptancePath}, SHA-256 ${sha(acceptance)}. Keine neue Quellenrelease- oder Betriebsfreigabe.`;
  for(const h of admin.holidayBindings){h.physicalBaseline.releaseId=AP23G3_RELEASE_ID;
    h.physicalBaseline.references=h.physicalBaseline.references.map((r:any)=>({...componentRef(r.contentId),path:r.path}));}
  for(const e of admin.releaseBinding.pathEligibility){const h=admin.holidayBindings.find((h:any)=>h.holidayBindingId===e.holidayBindingId);
    e.holidayBindingSha256=objectSha(h);assert.equal(e.status,'candidate');assert.deepEqual(e.targetComponentRefs,[]);assert.equal(e.sourceReviewRef,null);assert.equal(e.referenceSuiteRef,null);}
  for(const group of['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths'])assert.deepEqual(admin[group],accepted[group],`Unchanged G2 definitions ${group}`);
  for(const[group,key]of[['paths','pathId'],['qualificationPolicies','pathId']]as const)for(const row of old[group])assert.deepEqual(admin[group].find((r:any)=>r[key]===row[key]),row,`Unchanged F3 ${group}/${row[key]}`);
  for(const h of accepted.holidayBindings.filter((h:any)=>h.bindingVersion==='4.0.0')){
    const next=admin.holidayBindings.find((n:any)=>n.holidayBindingId===h.holidayBindingId);assert.deepEqual(next.physicalReuse,h.physicalReuse);assert.deepEqual(next.practiceAddition,h.practiceAddition);}
  files.set(AP23G3_ADMIN_PATH,encode(admin));
  const artifacts=structural.artifacts.map((d:any)=>({...d,schemaId:JSON.parse(files.get(d.path)!).$schema,byteLength:Buffer.byteLength(files.get(d.path)!),sha256:sha(files.get(d.path)!)}));
  const sourceIds=[...new Set<string>([...files.values()].flatMap(t=>(JSON.parse(t).sources??[]).map((s:any)=>s.sourceId)))].sort();
  const manifest={...structural,$schema:prefix+'implementation/ap23g3/local-reference-manifest-v11.schema.json',releaseId:AP23G3_RELEASE_ID,
    createdOn:'2026-10-22',releaseStatus:'candidate',artifacts,sourceSummary:{latestReviewedOn:'2026-10-22',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds},
    extensions:{'steimer.local-reference':{workPackage:'AP23G3',productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
      sourceReview:'pending',contractDecision:'DEC-2026-036',contractDecisionOn:'2026-10-22',baselineManifestSha256:sha(baseText),acceptedStructuralManifestSha256:sha(structuralText),
      contractDecisionSha256:sha(decision),technicalAcceptanceSha256:sha(acceptance),
      historicalPhysicalReuse:'PhysicalReuse retains the accepted F3 historical provenance. PhysicalBaseline and manifest bind actual G3 components. Same dates never inherit federal legal permission.',
      administrativeCandidateBinding:'Actual target hashes in physicalBaseline and manifest. Release/per-path targets empty and unapproved.',
      sourceReviewReuse:'Accepted G1 uses retained. No combined source-release review or operating permission.'}}};
  const manifestText=encode(manifest);
  const generatedModule=`// SPDX-License-Identifier: AGPL-3.0-only\n// Generated AP23G3 local reference data. No operating or export permission.\nimport { createFormat11CalculationData } from '../core/format11CalculationData';\nimport type { ParsedFormat11Data } from '../core/releaseFormat11';\nexport const ap23g3ManifestText = ${JSON.stringify(manifestText)};\nexport const ap23g3Files: ReadonlyMap<string,string> = new Map(${JSON.stringify([...files])});\nexport const ap23g3CandidateRuntime = createFormat11CalculationData(ap23g3ManifestText, ap23g3Files, { mode: 'localReference' });\nexport const ap23g3AdministrativeContext: ParsedFormat11Data = ap23g3CandidateRuntime.administrativeContext;\n`;
  const administrativeBaselineModule=`// SPDX-License-Identifier: AGPL-3.0-only\n// Accepted G2 meanings, native DEC-2026-036. Exact identities are not release authority.\nexport const ADMINISTRATIVE_V4_BASELINE = ${JSON.stringify(administrativeBaseline(admin),null,2)} as const;\n`;
  const format11BaselineModule=`// SPDX-License-Identifier: AGPL-3.0-only\n// Exact F3 physical content retained. Permissions are independently issued.\nexport const FORMAT11_HOLIDAY_CONTENT_SHA256 = ${JSON.stringify(objectSha(holidayContent(holiday)))};\nexport const FORMAT11_ADMINISTRATIVE_PROJECTION = ${JSON.stringify(holiday.activation.projections.at(-1),null,2)} as const;\n`;
  const modules=[{path:AP23G3_MODULE,sha256:sha(generatedModule)},{path:'src/core/administrativeV4Baseline.ts',sha256:sha(administrativeBaselineModule)},
    {path:'src/core/format11Baseline.ts',sha256:sha(format11BaselineModule)}];
  const integrityText=encode({kind:'ap23g3-local-reference-bundle',releaseId:AP23G3_RELEASE_ID,releaseStatus:'candidate',contractDecision:'DEC-2026-036',contractStatus:'approved',
    sourceReleaseApproved:false,productionActivation:false,referenceOnly:true,calendarExportEnabled:false,sourceReview:'pending',
    basedOn:[...fixedEvidence,{path:decisionPath,sha256:sha(decision)},{path:acceptancePath,sha256:sha(acceptance)}],
    counts:{artifacts:42,totalFilesIncludingManifest:43,calendars:33,profiles:5,administrativePaths:58,preservedAdministrativePaths:42,newAdministrativePaths:16,
      qualificationPolicies:58,laws:11,suspensionProfiles:20,holidayBindings:13,basisHolidayRules:479,supplementalSoRules:12,preservedSocialRules:44,preservedBernSocialBindings:50,rawUnchangedArtifacts:40},
    actualAdministrativeComponents:[...new Set<string>(admin.holidayBindings.flatMap((h:any)=>h.physicalBaseline.references.map((r:any)=>r.contentId)))].map(componentRef),
    holidayContentSha256:objectSha(holidayContent(holiday)),manifest:{path:`${AP23G3_TARGET}/manifest.json`,byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
    artifacts:artifacts.map((a:any)=>({path:`${AP23G3_TARGET}/${a.path}`,byteLength:a.byteLength,sha256:a.sha256})),generatedModules:modules,
    buildScript:{path:'scripts/build-ap23g3-candidate.ts',sha256:sha(await read('scripts/build-ap23g3-candidate.ts'))}});
  return{manifestText,files,generatedModule,administrativeBaselineModule,format11BaselineModule,integrityText};
}
export async function materializeAP23G3Candidate(mode:'write'|'check'):Promise<void>{
  const r=await buildAP23G3Candidate(),outputs:[string,string][]=[...r.files].map(([p,t])=>[`${AP23G3_TARGET}/${p}`,t]);
  outputs.push([`${AP23G3_TARGET}/manifest.json`,r.manifestText],[AP23G3_MODULE,r.generatedModule],['src/core/administrativeV4Baseline.ts',r.administrativeBaselineModule],
    ['src/core/format11Baseline.ts',r.format11BaselineModule],['outputs/ap23g3-2026-10-22/bundle-integrity.json',r.integrityText]);
  for(const[p,t]of outputs){const target=resolve(AP23G3_ROOT,p);if(mode==='write'){await mkdir(dirname(target),{recursive:true});await writeFile(target,t);}else assert.equal(await read(p),t,`Generated G3 bytes ${p}`);}
  console.log(JSON.stringify({mode,releaseId:AP23G3_RELEASE_ID,artifacts:r.files.size,manifestSha256:sha(r.manifestText),referenceOnly:true,exportAllowed:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const flag=process.argv[2];assert.ok(flag==='--write'||flag==='--check');await materializeAP23G3Candidate(flag==='--write'?'write':'check');
}
