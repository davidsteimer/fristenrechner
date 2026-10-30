// SPDX-License-Identifier: AGPL-3.0-only
// Structural M2 tests. Input-schema acceptance never asserts legal qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import Ajv2020 from '../../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../../spfx/node_modules/ajv-formats/dist/index.js';
import {buildM2Schemas,M2_SCHEMA_FILES,M2_SCHEMA_IDS,M2_LAW_IDS,M2_PROFILE_IDS,M2_POSTAL_REQUIREMENTS,M2_REGION_CASES,M2_WINDOW,projectM2Requirement} from '../../scripts/build-ap23m2-schemas.mjs';

const root=new URL('../../',import.meta.url),load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const {schemas,baselines}=await buildM2Schemas(),old=await load('schemas/administrative-procedure-catalog-v9.schema.json');
const baselineCatalog=await load('data/candidates/2026-10-27-ap23l3/administrative-procedures/ch-cantonal-administrative-procedures.json');
const fixture=await load('docs/fachrecht/ap23m1/referenzfaelle.json');
const actualCatalog=await load('outputs/ap23m2-candidate-2026-10-28/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json');
const actualManifest=await load('outputs/ap23m2-candidate-2026-10-28/bundle/manifest.json');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);for(const schema of Object.values(schemas))ajv.addSchema(schema);
const fragment=name=>({$defs:schemas.catalog.$defs,$ref:'#/$defs/'+name}),validators=new Map();
function validate(value,schema){if(!validators.has(schema))validators.set(schema,ajv.compile(schema));const v=validators.get(schema);return{valid:v(value),errors:v.errors};}
const good=(value,schema)=>{const report=validate(value,schema);assert.equal(report.valid,true,JSON.stringify(report.errors));};
const bad=(value,schema)=>assert.equal(validate(value,schema).valid,false);
const sourceRefs=[{sourceId:'SRC-M2-SCHEMA-PROBE',locator:'Synthetic schema-only sample, not operative evidence'}];
const qualified={kind:'qualifiedCurrentTrigger',triggerKind:'qualifiedLegalOpening',transformation:'none',sourceRefs};
const postal={kind:'vdQualifiedOrUnsignedPost',factKey:'openingMode',qualifiedMode:'qualifiedLegalOpening',trackingMode:'vdUnsignedPostalReceipt',
 qualifiedTransformation:'none',trackingTransformation:'nextWorkingDayIfNonWorkingReceipt',holidayBinding:'sameAsPath',otherwise:'block',
 trackingRequirements:M2_POSTAL_REQUIREMENTS.map(projectM2Requirement),sourceRefs};
const vsLonger={kind:'qualifiedVsLongerNoticeDays',valueFact:'actualInstructionDays',ordinaryBaseFact:'ordinaryDays',minimum:1,maximum:365,
 ordinaryBaseAllowed:[10,30],comparison:'strictlyAboveOrdinaryBase',boundMeaning:'qualifiedCurrentInstructionWithTechnicalSafetyLimit'};
const region={kind:'qualifiedAuthoritySeatRegion',factKey:'authorityHolidayRegion',otherwise:'block',defaultAllowed:false,cases:structuredClone(M2_REGION_CASES)};
function pathSample(canton){
 const row=fixture.paths.find(p=>p.canton===canton),value=structuredClone(baselineCatalog.paths.find(p=>p.contractFamily==='qualifiedDayProcedureV9'));
 Object.assign(value,{pathId:row.id.toLowerCase(),researchRef:row.id,contractFamily:'qualifiedDayProcedureV10',lawId:canton.toLowerCase()+'-general-administrative',
  action:row.requirements.find(r=>r.key==='actionQualification').value,duration:{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'},
  holidayBindingId:canton==='NE'?'ne-admin-qualified-authority-seat':canton.toLowerCase()+'-qualified-authority-seat',
  openingPolicy:canton==='VD'?structuredClone(postal):structuredClone(qualified),suspensionSelection:{kind:'fixed',suspensionProfileId:canton.toLowerCase()+'-'+(canton==='NE'?'three':'none')},
  normTimeline:[{researchBindingId:canton+'-NORMS-WINDOW',interval:{...M2_WINDOW},sourceRefs}]});
 return value;
}
function bindingSample(canton,court=false){
 const value=structuredClone(baselineCatalog.holidayBindings.find(b=>b.bindingVersion==='9.0.0'));
 const calendarId=canton==='NE'?'ap22-ne-027ceadbf103':canton==='VD'?'ap22-vd-26f452ff34ee':'ap22-vs-6c002f32b1b0';
 const projectionId=canton==='NE'?'projection-027ceadbf10392aa':canton==='VD'?'projection-26f452ff34ee3e73':'projection-6c002f32b1b0461b';
 Object.assign(value,{holidayBindingId:canton==='NE'?(court?'ne-court-qualified-authority-seat':'ne-admin-qualified-authority-seat'):canton.toLowerCase()+'-qualified-authority-seat',
  lawId:canton.toLowerCase()+'-general-administrative',authoritySeatCanton:canton,bindingVersion:'10.0.0',
  calendarSelection:canton==='NE'&&!court?structuredClone(region):{kind:'fixedAuthoritySeat',calendarId,projectionId},proceduralCalendarSupplement:{kind:'none'}});
 if(canton==='NE'&&!court)value.physicalSource.references.push({...value.physicalSource.references[0],contentId:'ap22-ne-21f519039621',path:'calendars/ap22-ne-21f519039621.json'});
 return value;
}
function inputSample(id){const row=fixture.cases.find(c=>c.id===id);assert.ok(row,id);return{path:row.path.toLowerCase(),pathRevision:1,authoritySeatCanton:'VD',trigger:row.trigger,days:row.days,facts:structuredClone(row.facts)};}

test('four isolated M2 schemas match deterministic generators',async()=>{for(const[key,path]of Object.entries(M2_SCHEMA_FILES))assert.deepEqual(await load(path),schemas[key]);});
test('actual Draft2020 schemas are valid, closed and use isolated proposed IDs',()=>{for(const[key,schema]of Object.entries(schemas)){assert.equal(ajv.validateSchema(schema),true,JSON.stringify(ajv.errors));assert.equal(schema.$id,M2_SCHEMA_IDS[key]);assert.ok(schema.$id.includes('/schemas/candidates/ap23m2/'));assert.equal(schema.additionalProperties,false);}assert.equal(baselines.length,3);});
test('actual written245-path catalog and local17 manifest validate, approved manifest does not',()=>{
 assert.equal(actualCatalog.paths.length,245);assert.equal(actualCatalog.paths.filter(p=>p.contractFamily==='qualifiedDayProcedureV10').length,49);
 assert.equal(actualCatalog.contractDecision.status,'proposed');assert.equal(actualCatalog.runtimeActive,false);assert.equal(actualManifest.releaseStatus,'candidate');
 good(actualCatalog,schemas.catalog);good(actualManifest,schemas.localManifest);bad(actualManifest,schemas.manifest);
});
test('unchanged product SchemaContract accepts all four structures and the actual written candidate',()=>{
 const code=`import {readFile} from 'node:fs/promises';import {assertSchemaContract,assertSchema} from './src/core/schemaContract.ts';import {buildM2Schemas} from './scripts/build-ap23m2-schemas.mjs';const {schemas}=await buildM2Schemas();const registry=new Map(Object.values(schemas).map(s=>[s.$id,s]));for(const s of Object.values(schemas))assertSchemaContract(s,registry);const c=JSON.parse(await readFile('outputs/ap23m2-candidate-2026-10-28/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json','utf8')),m=JSON.parse(await readFile('outputs/ap23m2-candidate-2026-10-28/bundle/manifest.json','utf8'));assertSchema(c,schemas.catalog,registry);assertSchema(m,schemas.localManifest,registry);console.log('ok');`;
 assert.equal(execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',code],{cwd:fileURLToPath(root),encoding:'utf8'}).trim(),'ok');
});
for(const name of Object.keys(old.$defs).filter(name=>!['path','qualificationPolicy','holidayBinding'].includes(name)))test('historical V1-V9 definition remains exact '+name,()=>assert.deepEqual(schemas.catalog.$defs[name],old.$defs[name]));
for(const[name,added]of[['path',1],['qualificationPolicy',1],['holidayBinding',4]])test('historical branches remain exact '+name,()=>{assert.deepEqual(schemas.catalog.$defs[name].oneOf.slice(0,old.$defs[name].oneOf.length),old.$defs[name].oneOf);assert.equal(schemas.catalog.$defs[name].oneOf.length,old.$defs[name].oneOf.length+added);});
test('DEC042 catalog10/manifest17 is proposed without changing physical formats or counts',()=>{
 assert.equal(schemas.catalog.properties.formatVersion.const,'10.0.0');assert.equal(schemas.catalog.properties.contractDecision.properties.id.const,'DEC-2026-042');assert.equal(schemas.catalog.properties.runtimeActive.const,false);
 for(const name of['manifest','localManifest']){assert.equal(schemas[name].properties.formatVersion.const,'17.0.0');assert.equal(schemas[name].properties.compatibility.properties.minimumConsumerFormatVersion.const,'17.0.0');
  assert.equal(schemas[name].properties.artifacts.minItems,44);assert.equal(schemas[name].properties.artifacts.maxItems,44);assert.equal(schemas[name].properties.calendarIds.minItems,35);assert.equal(schemas[name].properties.calendarIds.maxItems,35);
  const admin=schemas[name].properties.artifacts.items.allOf.find(r=>r.if?.properties?.role?.const==='administrativeProcedureCatalog');assert.equal(admin.then.properties.schemaId.const,M2_SCHEMA_IDS.catalog);}
});
for(const canton of['NE','VD','VS'])test('new family accepts closed '+canton+' path sample',()=>good(pathSample(canton),fragment('path')));
for(const profile of M2_PROFILE_IDS)test('new fixed recess profile accepted '+profile,()=>good({kind:'fixed',suspensionProfileId:profile},fragment('suspensionSelectionV10')));
test('new family cannot borrow foreign recess, family or law',()=>{
 const p=pathSample('NE');p.suspensionSelection.suspensionProfileId='vd-three';bad(p,fragment('path'));
 const q=pathSample('VD');q.lawId='ai-general-administrative';bad(q,fragment('path'));
 bad({kind:'fixed',suspensionProfileId:'sz-three'},fragment('suspensionSelectionV10'));assert.deepEqual(M2_LAW_IDS,['ne-general-administrative','vd-general-administrative','vs-general-administrative']);
});
test('VD unsigned-post opening has exactly two present legal facts, not AI tracking prerequisites',()=>{
 good(postal,fragment('openingPolicyV10'));assert.deepEqual(postal.trackingRequirements.map(r=>r.key),['unsignedPostalService','entryIntoRecipientSphere']);
 assert.equal(postal.qualifiedTransformation,'none');assert.equal(postal.trackingMode,'vdUnsignedPostalReceipt');assert.ok(!JSON.stringify(postal).includes('expectedService'));assert.ok(!JSON.stringify(postal).includes('receiptHolidayRegime'));
});
for(const[label,change]of[
 ['missing lawful unsigned post',v=>v.trackingRequirements.shift()],['missing verified entry',v=>v.trackingRequirements.pop()],
 ['AI expectation imported',v=>v.trackingRequirements.push(projectM2Requirement({key:'expectedService',value:true,reason:'trackingExpectedServiceNotQualified'}))],
 ['AI receiving-place condition imported',v=>v.trackingRequirements.push(projectM2Requirement({key:'receiptHolidayRegime',value:'sameAsBoundAuthorityCalendar',reason:'AI-B-TRACKING-PLACE'}))],
 ['AI tracking mode',v=>{v.trackingMode='trackingPhysicalReceipt';}],['double qualified shift',v=>{v.qualifiedTransformation='nextWorkingDayIfNonWorkingReceipt';}],
 ['party holiday fallback',v=>{v.holidayBinding='partyCanton';}],['invented future opening',v=>{v.qualifiedMode='calculatedFollowupOpening';}]
])test('VD opening schema rejects '+label,()=>{const v=structuredClone(postal);change(v);bad(v,fragment('openingPolicyV10'));});
test('NE and VS qualified opening cannot gain VD raw-post transformation',()=>{good(qualified,fragment('openingPolicyV10'));for(const c of['NE','VS']){const p=pathSample(c);p.openingPolicy=structuredClone(postal);bad(p,fragment('path'));}const p=pathSample('VD');p.openingPolicy=structuredClone(qualified);bad(p,fragment('path'));});
test('VS longer notice is linked to current actual/base facts without AI thirty-day floor',()=>{good(vsLonger,fragment('durationV10'));assert.equal(vsLonger.minimum,1);assert.equal(vsLonger.valueFact,'actualInstructionDays');assert.equal(vsLonger.ordinaryBaseFact,'ordinaryDays');assert.deepEqual(vsLonger.ordinaryBaseAllowed,[10,30]);assert.equal(vsLonger.comparison,'strictlyAboveOrdinaryBase');assert.ok(!Object.hasOwn(vsLonger,'qualificationFact'));const p=pathSample('VS');p.duration=vsLonger;good(p,fragment('path'));});
for(const[label,change]of[
 ['AI minimum31',v=>{v.minimum=31;}],['AI value fact',v=>{v.valueFact='actualLongerInstructionDays';}],['AI basis fact',v=>{v.ordinaryBaseFact='ordinaryStatutoryDays';}],
 ['AI threshold comparison',v=>{v.comparison='strictlyAboveOrdinaryBaseAndThirty';}],['AI qualification fact',v=>{v.qualificationFact='longerInstructionQualification';}],
 ['extra basis7',v=>{v.ordinaryBaseAllowed=[7,10,30];}],['missing base linkage',v=>{delete v.ordinaryBaseFact;}]
])test('VS duration rejects '+label,()=>{const v=structuredClone(vsLonger);change(v);bad(v,fragment('durationV10'));});
test('VS longer-duration policy is not available to NE or VD',()=>{for(const c of['NE','VD']){const p=pathSample(c);p.duration=structuredClone(vsLonger);bad(p,fragment('path'));}});
test('ordinary statutory five/ten/thirty-day durations remain non-overridable data',()=>{for(const days of[3,5,10,30])good({kind:'statutoryDays',value:days,overridable:false},fragment('durationV10'));bad({kind:'statutoryDays',value:5,overridable:true},fragment('durationV10'));});
test('VD Art81 is a current professional order-scope qualification, not numeric automatic legality',()=>{
 good({kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'},fragment('durationV10'));
 bad({kind:'authorityOrderedDays',minimum:1,maximum:30,boundMeaning:'statutoryMaximumForCurrentOrder'},fragment('durationV10'));
 const row=fixture.paths.find(p=>p.id==='vd-administrative-appeal-ordered').requirements.find(r=>r.key==='orderLegalScope');
 assert.equal(row.value,'otherValidLpaInputOrArticle81Within30OrGrantedExtension');
 const sample=inputSample('M1-VD-NO-ARTICLE81-FREE-FORTY');good(sample,schemas.input);
 assert.equal(sample.days,40);assert.equal(sample.facts.orderLegalScope,'article81InitialExceedsThirty');
 // Diagnostic vocabulary acceptance is NOT positive qualification. Only the
 // consumer's equality with the explicit positive policy blocks this case.
 assert.notEqual(sample.facts.orderLegalScope,row.value);
});
test('three-day refusal remains statutory and explicitly qualified, no start-date arithmetic is invented by schema',()=>{
 const rows=fixture.paths.filter(p=>p.id.includes('grace-3'));assert.ok(rows.length>=5);for(const p of rows)assert.equal(p.days,3);
 const p=fixture.paths.find(p=>p.id==='vd-admin-grace-3');assert.ok(p.requirements.some(r=>r.key==='extensionRequest'&&r.value==='timelyBeforeOriginalExpiry'));assert.ok(p.requirements.some(r=>r.key==='originalDeadlineAtRefusalOpening'&&r.value==='alreadyExpired'));
});
test('NE administrative region choice is closed, two-valued, no default and no party anchor',()=>{good(region,fragment('calendarSelectionV10'));assert.equal(region.factKey,'authorityHolidayRegion');assert.equal(region.defaultAllowed,false);assert.deepEqual(region.cases,M2_REGION_CASES);});
for(const[label,change]of[
 ['implicit default',v=>{v.defaultAllowed=true;}],['first match fallback',v=>{v.otherwise='firstCalendar';}],['party qualification',v=>{v.kind='qualifiedPartyOrRepresentativeCanton';}],
 ['one region missing',v=>v.cases.pop()],['free third region',v=>v.cases.push({value:'other',calendarId:'ch-federal-calendar',projectionId:'federal'})],
 ['regions swapped',v=>{[v.cases[0].calendarId,v.cases[1].calendarId]=[v.cases[1].calendarId,v.cases[0].calendarId];}],['unbound projection',v=>{v.cases[1].projectionId='first-ne-projection';}]
])test('NE region policy rejects '+label,()=>{const v=structuredClone(region);change(v);bad(v,fragment('calendarSelectionV10'));});
test('four V10 bindings are separate, supplements none, NE court fixed at general calendar',()=>{
 for(const b of[bindingSample('NE'),bindingSample('NE',true),bindingSample('VD'),bindingSample('VS')]){good(b,fragment('holidayBinding'));assert.deepEqual(b.proceduralCalendarSupplement,{kind:'none'});}
 assert.equal(bindingSample('NE').physicalSource.references.length,4);assert.equal(bindingSample('NE',true).physicalSource.references.length,3);
 const court=bindingSample('NE',true);assert.equal(court.calendarSelection.kind,'fixedAuthoritySeat');assert.equal(court.calendarSelection.calendarId,'ap22-ne-027ceadbf103');court.calendarSelection=structuredClone(region);bad(court,fragment('holidayBinding'));
 const admin=bindingSample('NE');admin.physicalSource.references.pop();bad(admin,fragment('holidayBinding'));
});
test('new input vocabulary is closed and does not accept AI expectation/place facts',()=>{
 const sample=inputSample('M1-VD-POSTAL-BETTAG-3');good(sample,schemas.input);sample.facts.expectedService=true;bad(sample,schemas.input);delete sample.facts.expectedService;sample.facts.receiptHolidayRegime='sameAsBoundAuthorityCalendar';bad(sample,schemas.input);
 const ne={path:'ne-admin-ordered',pathRevision:1,authoritySeatCanton:'NE',trigger:'2026-10-02',days:10,facts:{authorityHolidayRegion:'leLanderon',openingMode:'qualifiedLegalOpening'}};good(ne,schemas.input);ne.facts.authorityHolidayRegion='allMunicipalities';bad(ne,schemas.input);
});
test('VS input allows actual fifteen vs ordinary ten, not stringified numbers or undeclared facts',()=>{
 const input={path:'vs-admin-notice-long',pathRevision:1,authoritySeatCanton:'VS',trigger:'2026-10-02',days:15,facts:{actualInstructionDays:15,ordinaryDays:10,openingMode:'qualifiedLegalOpening'}};good(input,schemas.input);input.facts.actualInstructionDays='15';bad(input,schemas.input);input.facts.actualInstructionDays=15;input.facts.ordinaryDays=7;bad(input,schemas.input);input.facts.ordinaryDays=10;input.facts.savedDays=15;bad(input,schemas.input);
});
test('requirement projection preserves primitive types, exact reason and no fabricated current defaults',()=>{assert.deepEqual(projectM2Requirement({key:'unsignedPostalService',value:'lawfullyPermittedAndNoSignatureRequired',reason:'VD-B-POSTAL-SCOPE'}),{key:'unsignedPostalService',value:'lawfullyPermittedAndNoSignatureRequired',reason:'VD-B-POSTAL-SCOPE',explanation:'Aktuelle Fachqualifikation unsignedPostalService.'});for(const row of[{key:'x',value:{},reason:'no'},{key:'x',value:1,oneOf:[1],reason:'no'},{key:'x',oneOf:[],reason:'no'}])assert.throws(()=>projectM2Requirement(row));});
