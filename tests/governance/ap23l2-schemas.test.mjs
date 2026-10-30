// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import Ajv2020 from '../../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../../spfx/node_modules/ajv-formats/dist/index.js';
import {buildL2Schemas,L2_SCHEMA_FILES,L2_SCHEMA_IDS,L2_PROFILE_IDS,projectL2Requirement} from '../../scripts/build-ap23l2-schemas.mjs';
import {buildL2Candidate} from '../../scripts/build-ap23l2-candidate.mjs';
const root=new URL('../../',import.meta.url),load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const {schemas,baselines}=await buildL2Schemas(),built=await buildL2Candidate(),old=await load('schemas/administrative-procedure-catalog-v8.schema.json');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);for(const schema of Object.values(schemas))ajv.addSchema(schema);
const fragment=name=>({$defs:schemas.catalog.$defs,$ref:'#/$defs/'+name}),validators=new Map();
function validate(value,schema){if(!validators.has(schema))validators.set(schema,ajv.compile(schema));const v=validators.get(schema);return{valid:v(value),errors:v.errors};}
const good=(value,schema)=>{const report=validate(value,schema);assert.equal(report.valid,true,JSON.stringify(report.errors));};
const bad=(value,schema)=>assert.equal(validate(value,schema).valid,false);
const newPaths=built.catalog.paths.filter(path=>path.contractFamily==='qualifiedDayProcedureV9');
const tracking=newPaths.find(path=>path.openingPolicy.kind==='aiQualifiedOrTrackingPost').openingPolicy;
const qualified=newPaths.find(path=>path.pathId==='ai-admin-written-7').openingPolicy;
const longer=newPaths.find(path=>path.duration.kind==='qualifiedLongerNoticeDays').duration;
const opposition=newPaths.find(path=>path.pathId==='sz-admin-provisional-opposition').duration;
const supplement=built.catalog.holidayBindings.find(binding=>binding.holidayBindingId==='sz-qualified-authority-seat').proceduralCalendarSupplement;
test('four isolated written schemas match deterministic generators',async()=>{for(const[key,path]of Object.entries(L2_SCHEMA_FILES))assert.deepEqual(await load(path),schemas[key]);});
test('actual Draft2020 schemas are valid and use only isolated L2 IDs',()=>{for(const[key,schema]of Object.entries(schemas)){assert.equal(ajv.validateSchema(schema),true,JSON.stringify(ajv.errors));assert.equal(schema.$id,L2_SCHEMA_IDS[key]);assert.ok(schema.$id.includes('/schemas/candidates/ap23l2/'));}assert.equal(baselines.length,3);});
test('actual196-path catalog and local16 manifest validate, released manifest does not',()=>{good(built.catalog,schemas.catalog);good(built.manifest,schemas.localManifest);bad(built.manifest,schemas.manifest);});
test('all four schemas and actual data pass unchanged product SchemaContract',()=>{
 const code=`import {assertSchemaContract,assertSchema} from './src/core/schemaContract.ts';import {buildL2Schemas} from './scripts/build-ap23l2-schemas.mjs';import {buildL2Candidate} from './scripts/build-ap23l2-candidate.mjs';
 const {schemas}=await buildL2Schemas(),built=await buildL2Candidate(),registry=new Map(Object.values(schemas).map(s=>[s.$id,s]));for(const s of Object.values(schemas))assertSchemaContract(s,registry);assertSchema(built.catalog,schemas.catalog,registry);assertSchema(built.manifest,schemas.localManifest,registry);console.log('ok');`;
 assert.equal(execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',code],{cwd:fileURLToPath(root),encoding:'utf8'}).trim(),'ok');
});
for(const name of Object.keys(old.$defs).filter(name=>!['path','qualificationPolicy','holidayBinding'].includes(name)))test('historical definition remains exact '+name,()=>assert.deepEqual(schemas.catalog.$defs[name],old.$defs[name]));
for(const[name,added]of[['path',1],['qualificationPolicy',1],['holidayBinding',2]])test('historical branches remain exact '+name,()=>{assert.deepEqual(schemas.catalog.$defs[name].oneOf.slice(0,old.$defs[name].oneOf.length),old.$defs[name].oneOf);assert.equal(schemas.catalog.$defs[name].oneOf.length,old.$defs[name].oneOf.length+added);});
test('new manifest changes format/consumer but not physical artifact counts',()=>{for(const name of['manifest','localManifest']){assert.equal(schemas[name].properties.formatVersion.const,'16.0.0');assert.equal(schemas[name].properties.compatibility.properties.minimumConsumerFormatVersion.const,'16.0.0');assert.equal(schemas[name].properties.artifacts.minItems,44);assert.equal(schemas[name].properties.artifacts.maxItems,44);assert.equal(schemas[name].properties.calendarIds.minItems,35);assert.equal(schemas[name].properties.calendarIds.maxItems,35);}});
test('qualified oral/knowledge opening remains untransformed and valid separately',()=>{good(qualified,fragment('openingPolicyV9'));assert.equal(qualified.transformation,'none');for(const id of['ai-admin-written-7','ai-internal-denial-30'])assert.equal(newPaths.find(path=>path.pathId===id).openingPolicy.kind,'qualifiedCurrentTrigger');});
test('tracking branch carries exactly three current conditional facts',()=>{good(tracking,fragment('openingPolicyV9'));assert.deepEqual(tracking.trackingRequirements.map(row=>row.key),['expectedService','entryIntoSphere','receiptHolidayRegime']);assert.equal(tracking.qualifiedTransformation,'none');});
for(const[label,change]of[
 ['missing expectation',v=>v.trackingRequirements.shift()],['missing verified entry',v=>v.trackingRequirements.splice(1,1)],['missing same-region fact',v=>v.trackingRequirements.pop()],
 ['false expectation',v=>{v.trackingRequirements[0].value=false;}],['ordinary-post mode',v=>{v.trackingMode='ordinaryPostPhysicalReceipt';}],
 ['double qualified shift',v=>{v.qualifiedTransformation='nextWorkingDayIfNonWorkingReceipt';}],['invented follow-up',v=>{v.qualifiedMode='calculatedRegistrationEnd';}],
 ['first calendar fallback',v=>{v.otherwise='firstCalendar';}],['foreign receiving calendar',v=>{v.holidayBinding='partyCanton';}],['date default',v=>{v.default='2026-09-16';}]
])test('tracking schema rejects '+label,()=>{const value=structuredClone(tracking);change(value);bad(value,fragment('openingPolicyV9'));});
test('longer notice uses current linked facts and explicit minimum31',()=>{good(longer,fragment('durationV9'));assert.equal(longer.valueFact,'actualLongerInstructionDays');assert.equal(longer.ordinaryBaseFact,'ordinaryStatutoryDays');assert.equal(longer.minimum,31);assert.equal(longer.maximum,365);});
for(const[label,change]of[['15day silent choice',v=>{v.minimum=15;}],['generic ordered meaning',v=>{v.kind='authorityOrderedDays';}],['missing ordinary base',v=>{delete v.ordinaryBaseFact;}],['max blind comparison',v=>{v.comparison='maxOfThirtyAndInput';}],['unqualified instruction',v=>{v.qualifiedValue='unknown';}]])test('longer duration rejects '+label,()=>{const value=structuredClone(longer);change(value);bad(value,fragment('durationV9'));});
test('concrete provisional opposition is ordered with statutory max10, not invented fixed10',()=>{good(opposition,fragment('durationV9'));assert.deepEqual(opposition,{kind:'authorityOrderedDays',minimum:1,maximum:10,boundMeaning:'statutoryMaximumForCurrentOrder'});});
test('SZ supplement is exact dated end-only policy, not a new global holiday projection',()=>{good(supplement,fragment('proceduralCalendarSupplementV9'));assert.equal(supplement.effect,'endShiftOnly');assert.deepEqual(supplement.dates,['2026-11-11','2027-11-11']);assert.deepEqual(supplement.coverage,{from:'2026-08-29',to:'2027-12-31'});assert.equal(supplement.authorityMunicipality,'Schwyz');});
for(const[label,change]of[['allSZ seats',v=>{v.authorityMunicipality='all';}],['permanent recurrence',v=>{v.recurrence={month:11,day:11};}],['interior suspension',v=>{v.effect='suspension';}],['outside window day',v=>{v.dates.push('2028-11-11');}],['missing2027',v=>{v.dates.pop();}],['new municipality kind',v=>{v.kind='municipalHolidayCatalog';}]])test('SZ supplement rejects '+label,()=>{const value=structuredClone(supplement);change(value);bad(value,fragment('proceduralCalendarSupplementV9'));});
for(const profile of L2_PROFILE_IDS)test('new fixed profile accepted '+profile,()=>good({kind:'fixed',suspensionProfileId:profile},fragment('suspensionSelectionV9')));
test('new family cannot select a foreign recess',()=>bad({kind:'fixed',suspensionProfileId:'vwvg'},fragment('suspensionSelectionV9')));
test('AI and SZ binding branches enforce independent own calendars',()=>{for(const binding of built.catalog.holidayBindings.filter(row=>row.bindingVersion==='9.0.0')){good(binding,fragment('holidayBinding'));const value=structuredClone(binding);value.calendarSelection.calendarId='ch-federal-calendar';bad(value,fragment('holidayBinding'));}});
test('requirement projection preserves strict primitive types and research reason',()=>{assert.deepEqual(projectL2Requirement({key:'expectedService',value:true,reason:'trackingExpectedServiceNotQualified'}),{key:'expectedService',value:true,reason:'trackingExpectedServiceNotQualified',explanation:'Aktuelle Fachqualifikation expectedService.'});assert.throws(()=>projectL2Requirement({key:'x',value:{},reason:'no'}));assert.throws(()=>projectL2Requirement({key:'x',value:true,oneOf:[true],reason:'no'}));});
