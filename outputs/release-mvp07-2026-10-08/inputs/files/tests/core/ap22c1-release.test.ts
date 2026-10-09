// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic transport fixture only. No source review or release is approved.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { projectActivatedCalendars, assertHolidayCatalogV2 } from '../../src/core/holidayActivation';
import { parseFormat7Data, parseCalendarRuleSetV3 } from '../../src/core/releaseFormat7';
import { rebindSocialCalendarCandidate } from '../../src/core/calendarMigration';
import { assertSocialProcedureCatalog } from '../../src/core/socialCatalog';
import { createCalculationData } from '../../src/core/data';
import { mvp06Release } from '../../src/release/mvp06ReleaseData';
import type { CalendarRuleSet } from '../../src/core/calendarRuleTypes';
import type { ReleaseArtifactReference } from '../../src/core/socialTypes';

const base = 'data/releases/2026-10-01-mvp-06-approved.1/';
const json = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const prefix = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const sha = (text: string): string => createHash('sha256').update(text).digest('hex');
const encode = (v: unknown): string => JSON.stringify(v, null, 2) + '\n';
const legacy = ['ch-federal-calendar', 'be-public-holidays'].map(id => json(base + `calendars/${id}.json`)) as CalendarRuleSet[];
function build() {
  const manifest = json(base + 'manifest.json');
  const catalog = json('tests/golden/candidates/ap22b-holiday-contract.json');
  catalog.activation.contractDecision = {id:'DEC-2026-030', status:'approved', on:'2026-10-08'};
  assertHolidayCatalogV2(catalog);
  const files = new Map<string, string>();
  files.set('holiday-catalogs/ch-holiday-catalog.json', encode(catalog));
  const calendars = projectActivatedCalendars(catalog, sha(encode(catalog)), legacy);
  for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, encode(calendar));
  for (const a of manifest.artifacts) if (['legalProfile', 'specialRegimeCatalog'].includes(a.role)) files.set(a.path, readFileSync(base + a.path, 'utf8'));
  manifest.$schema = prefix + 'release-manifest-v7.schema.json';
  manifest.formatVersion = '7.0.0';
  manifest.compatibility.minimumConsumerFormatVersion = '7.0.0';
  manifest.releaseId = '2026-10-08-ap22c1-candidate.1';
  manifest.releaseStatus = 'candidate';
  manifest.coverage = {from:'2026-08-29', to:null};
  manifest.calendarIds = calendars.map(c => c.calendarId);
  const social = json(base + 'social-procedures/ch-social-procedures.json');
  assertSocialProcedureCatalog(social);
  const refs: ReleaseArtifactReference[] = ['ch-federal-calendar','be-public-holidays'].map(id => ({role:'calendar',contentId:id,sha256:sha(files.get(`calendars/${id}.json`)!)}));
  refs.push({role:'holidayCatalog',contentId:'ch-holiday-catalog',sha256:sha(encode(catalog))});
  files.set('social-procedures/ch-social-procedures.json', encode(rebindSocialCalendarCandidate(social, manifest.releaseId, refs)));
  const schemas: Record<string,string> = {calendar:'calendar-rules-v3',legalProfile:'legal-profile',specialRegimeCatalog:'special-regime-catalog-v3',holidayCatalog:'holiday-catalog-v2',socialProcedureCatalog:'social-procedure-catalog-v2'};
  manifest.artifacts = [...files].map(([path,text]) => {
    const d = JSON.parse(text), role = d.dataKind;
    return {path,role,contentId:role==='legalProfile'?d.profileId:role==='calendar'?d.calendarId:d.catalogId,mediaType:'application/json',schemaId:prefix+schemas[role]+'.schema.json',byteLength:Buffer.byteLength(text),sha256:sha(text)};
  });
  return {manifest,files};
}
const baseline = build();
const fresh = () => ({manifest:structuredClone(baseline.manifest),files:new Map(baseline.files)});
const parse = (f: ReturnType<typeof fresh>) => parseFormat7Data(encode(f.manifest), f.files, legacy);
function change(f: ReturnType<typeof fresh>, path: string, mutate: (v:any)=>void): void {
  const value = JSON.parse(f.files.get(path)!); mutate(value);
  const text = encode(value); f.files.set(path,text);
  const a = f.manifest.artifacts.find((a:any)=>a.path===path)!;
  a.sha256=sha(text); a.byteLength=Buffer.byteLength(text);
}

test('AP22C1 parses 40 byte-bound artifacts with all32 Format3 calendars but never activates calculations', () => {
  const parsed = parse(fresh());
  assert.equal(parsed.manifest.artifacts.length,40); assert.equal(parsed.calendars.length,32);
  assert.equal(parsed.catalog.data.rules.length,479); assert.equal(parsed.catalog.activation.supplementalRules.length,12);
  assert.equal(parsed.runtimeReady,false);
  assert.throws(() => createCalculationData({...mvp06Release, formatVersion:'7.0.0'}), /Nicht unterstützte Hauptversion/);
});
for (const [name, mutate] of [
  ['missing file', (f:any)=>f.files.delete('calendars/ch-federal-calendar.json')],
  ['extra file', (f:any)=>f.files.set('foreign.json','{}')],
  ['duplicate descriptor', (f:any)=>f.manifest.artifacts.push(f.manifest.artifacts[0])],
  ['duplicate calendar ID', (f:any)=>f.manifest.calendarIds.push(f.manifest.calendarIds[0])],
  ['wrong minimum consumer', (f:any)=>{f.manifest.compatibility.minimumConsumerFormatVersion='6.0.0';}],
  ['unknown manifest field', (f:any)=>{f.manifest.extra=true;}],
  ['changed actual bytes', (f:any)=>f.files.set('calendars/ch-federal-calendar.json',f.files.get('calendars/ch-federal-calendar.json')+' ')],
  ['unapproved release claimed', (f:any)=>{f.manifest.releaseStatus='approved';}],
  ['wrong content ID', (f:any)=>{f.manifest.artifacts[0].contentId='foreign';}],
] as const) test(`AP22C1 rejects ${name}`, () => {const f=fresh();mutate(f);assert.throws(()=>parse(f));});
for (const [name, mutate] of [
  ['mixed old calendar', (v:any)=>{v.formatVersion='2.0.0';}],
  ['wrong catalog hash', (v:any)=>{v.projection.sourceHash='0'.repeat(64);}],
  ['inherited cycle', (v:any)=>{v.inherits=['be-public-holidays'];}],
  ['source locator mutation', (v:any)=>{v.rules[0].sourceRefs[0].locator='wrong';}],
  ['changed calculation', (v:any)=>{v.rules[0].calculation={type:'fixedMonthDay',month:5,day:2};}],
  ['extra rule field', (v:any)=>{v.rules[0].newMode=true;}],
] as const) test(`AP22C1 rejects resealed ${name}`, () => {const f=fresh();change(f,'calendars/be-public-holidays.json',mutate);assert.throws(()=>parse(f));});
for (const [name, mutate] of [
  ['empty social eligibility', (v:any)=>{v.releaseEligibility=[];}],
  ['duplicate binding eligibility', (v:any)=>{v.releaseEligibility[1]={...v.releaseEligibility[0],eligibilityId:'ANOTHER-ID'};}],
  ['stale release ID', (v:any)=>{v.releaseEligibility[0].releaseId='2026-10-01-mvp-06-approved.1';}],
  ['stale component hash', (v:any)=>{v.releaseEligibility[0].componentRefs[0].sha256='0'.repeat(64);}],
  ['missing component', (v:any)=>{v.releaseEligibility[0].componentRefs.pop();}],
  ['old approval retained', (v:any)=>{v.releaseEligibility[0].approval={approvedBy:'David Steimer',approvedOn:'2026-10-01',decisionRef:'old'};}],
  ['extended social coverage', (v:any)=>{v.releaseEligibility[0].caseCoverage.to='2028-12-31';}],
] as const) test(`AP22C1 rejects ${name}`, () => {const f=fresh();change(f,'social-procedures/ch-social-procedures.json',mutate);assert.throws(()=>parse(f));});
test('AP22C1 standalone calendar parser rejects missing source and unknown condition', () => {
  const c = JSON.parse(baseline.files.get('calendars/be-public-holidays.json')!);
  assert.doesNotThrow(()=>parseCalendarRuleSetV3(c));
  c.rules[0].sourceRefs[0].sourceId='SRC-ABSENT';assert.throws(()=>parseCalendarRuleSetV3(c));
});
