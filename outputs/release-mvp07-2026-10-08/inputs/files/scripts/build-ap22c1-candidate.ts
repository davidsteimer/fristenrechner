// SPDX-License-Identifier: AGPL-3.0-only
// Isolated C1 validation bundle. Never creates or approves a data release.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertHolidayCatalogV2, projectActivatedCalendars, assertActivatedCalendarProjection } from '../src/core/holidayActivation';
import { generateCalendarFromRules } from '../src/core/generateCalendar';
import { rebindSocialCalendarCandidate } from '../src/core/calendarMigration';
import type { CalendarRuleSet } from '../src/core/calendarRuleTypes';
import type { SocialProcedureCatalog } from '../src/core/socialTypes';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root,'outputs/ap22c1-2026-10-08');
const baseline = 'data/releases/2026-10-01-mvp-06-approved.1';
const sha = (bytes: string | Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const input = 'tests/golden/candidates/ap22b-holiday-contract.json';
const frozenBytes = await readFile(resolve(root,input));
if(sha(frozenBytes)!=='572b735fdb5cdbd7a397b41f6f1cb7eb99a15db43e506d9bc8e312293ba00c0a') throw new Error('AP22B specimen differs from its accepted SHA-256 binding');
const catalog = JSON.parse(frozenBytes.toString('utf8'));
catalog.activation.contractDecision = {id:'DEC-2026-030',status:'approved',on:'2026-10-08'};
assertHolidayCatalogV2(catalog);
for (const [path, expected] of [[catalog.activation.base.catalogPath,catalog.activation.base.catalogSha256],[catalog.activation.base.matrixPath,catalog.activation.base.matrixSha256]]) {
  if (sha(await readFile(resolve(root,path))) !== expected) throw new Error(`Changed bound input ${path}`);
}
const baselineManifestBytes=await readFile(resolve(root,baseline,'manifest.json'));
const baselineManifestSha256='637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724';
if(sha(baselineManifestBytes)!==baselineManifestSha256) throw new Error('MVP0.6 baseline manifest differs from the bound release');
const baselineManifest=JSON.parse(baselineManifestBytes.toString('utf8')) as {artifacts:{role:string;path:string;sha256:string;byteLength:number}[]};
const baselineBytes=new Map<string,Buffer>();
for(const artifact of baselineManifest.artifacts){
  const raw=await readFile(resolve(root,baseline,artifact.path));
  if(sha(raw)!==artifact.sha256||raw.length!==artifact.byteLength) throw new Error(`Changed MVP0.6 baseline artifact ${artifact.path}`);
  baselineBytes.set(artifact.path,raw);
}
const legacy = ['ch-federal-calendar','be-public-holidays'].map(id=>JSON.parse(baselineBytes.get(`calendars/${id}.json`)!.toString('utf8'))) as CalendarRuleSet[];
const bytes = JSON.stringify(catalog,null,2)+'\n';
const calendars = projectActivatedCalendars(catalog,sha(bytes),legacy);
assertActivatedCalendarProjection(catalog,sha(bytes),calendars,legacy);
const inventory: {path:string;sha256:string;byteLength:number}[] = [];
async function emit(path:string, value:unknown):Promise<void> {
  const text=JSON.stringify(value,null,2)+'\n';
  const target=resolve(output,path);
  await mkdir(dirname(target),{recursive:true}); await writeFile(target,text);
  inventory.push({path,sha256:sha(text),byteLength:Buffer.byteLength(text)});
}
await emit('holiday-catalogs/ch-holiday-catalog.json',catalog);
for (const calendar of calendars) await emit(`calendars/${calendar.calendarId}.json`,calendar);
for(const artifact of baselineManifest.artifacts.filter(row=>['legalProfile','specialRegimeCatalog'].includes(row.role))){
  const sourceBytes=baselineBytes.get(artifact.path)!;
  const target=resolve(output,artifact.path);
  await mkdir(dirname(target),{recursive:true});await writeFile(target,sourceBytes);
  inventory.push({path:artifact.path,sha256:sha(sourceBytes),byteLength:sourceBytes.length});
}
const socialPath=baselineManifest.artifacts.find(row=>row.role==='socialProcedureCatalog')!.path;
const social=JSON.parse(baselineBytes.get(socialPath)!.toString('utf8')) as SocialProcedureCatalog;
const componentRefs=[
  ...['ch-federal-calendar','be-public-holidays'].map(contentId=>({role:'calendar',contentId,sha256:inventory.find(row=>row.path===`calendars/${contentId}.json`)!.sha256})),
  {role:'holidayCatalog',contentId:'ch-holiday-catalog',sha256:sha(bytes)}
];
await emit(socialPath,rebindSocialCalendarCandidate(social,'2026-10-08-ap22c1-candidate.1',componentRefs));
// Dates are algorithm QA outside a product release. Coverage does not authorise
// social procedures after 2027 or any unimplemented canton procedure.
const range={from:'2026-08-29',to:'2036-12-31'};
await emit('generated-dates.json',{kind:'algorithmComparisonOnly',range,calendars:calendars.map(calendar=>{
  const generated=generateCalendarFromRules(calendars,calendar.calendarId,range);
  return {calendarId:calendar.calendarId,holidays:generated.calendar.holidays,suspensionSets:generated.calendar.suspensionSets};
})});
const probeRange={from:'2027-01-01',to:'2035-12-31'};
await emit('date-probes.json',{...probeRange,occurrences:calendars.flatMap(calendar=>{
  const generated=generateCalendarFromRules(calendars,calendar.calendarId,probeRange);
  const dates=new Map(generated.calendar.holidays.map(row=>[row.holidayId,row.date]));
  return generated.trace.filter(step=>step.operation==='generateHoliday').flatMap(step=>step.generatedIds.filter(id=>dates.has(id)).map(id=>({calendarId:calendar.calendarId,ruleId:step.ruleId,date:dates.get(id)!})));
}).sort((a,b)=>a.calendarId.localeCompare(b.calendarId)||a.ruleId.localeCompare(b.ruleId)||a.date.localeCompare(b.date))});
await emit('inventory.json',{
  kind:'ap22c1ValidationBundle',releaseStatus:'candidate',runtimeEnabled:false,
  contractDecision:'DEC-2026-030',builtOn:'2026-10-08',
  frozenInput:{path:input,sha256:sha(frozenBytes)},
  historicalBaseline:{path:`${baseline}/manifest.json`,sha256:baselineManifestSha256,verifiedArtifacts:baselineBytes.size},
  counts:{archiveRules:479,supplementalRules:12,matrixDecisions:198,procedureBindings:104,calendarDefinitions:32},
  artifacts:[...inventory],
  boundaries:['Keine Release- oder Quellenfreigabe','Keine Rollen-/Gebietsauflösung','Kein Januarvergleich','Keine Freigabe weiterer Sozialanbindungen','Keine Host-/Providerintegration']
});
console.log(JSON.stringify({output,artifacts:inventory.length,calendars:calendars.length,runtimeEnabled:false},null,2));
