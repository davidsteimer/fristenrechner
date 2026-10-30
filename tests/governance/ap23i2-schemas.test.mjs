// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertSchema,assertSchemaContract} from '../../src/core/schemaContract.ts';
import {buildI2Schemas,I2_SCHEMA_FILES,I2_REQUIREMENTS,projectI2Requirement} from '../../scripts/build-ap23i2-schemas.mjs';
const root=new URL('../../',import.meta.url);
const load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const {schemas}=await buildI2Schemas();
const old=await load('schemas/administrative-procedure-catalog-v5.schema.json');
const fragment=key=>({$defs:schemas.catalog.$defs,$ref:'#/$defs/'+key});
test('four isolated schemas execute the unchanged local schema keyword subset',()=>{
  for(const schema of Object.values(schemas))assertSchemaContract(schema);
});
test('four actual schema files equal their deterministic proposal sources',async()=>{
  for(const[key,path]of Object.entries(I2_SCHEMA_FILES))assert.deepEqual(await load(path),schemas[key]);
});
for(const key of ['path','qualificationPolicy','holidayBinding'])test('all historical '+key+' branches retained exactly',()=>{
  const prior=old.$defs[key].oneOf;assert.deepEqual(schemas.catalog.$defs[key].oneOf.slice(0,prior.length),prior);
});
for(const key of ['duration','candidatePathEligibility','releasedPathEligibility','law','source','suspension','period','preserved'])
  test('historical definition '+key+' is exact',()=>assert.deepEqual(schemas.catalog.$defs[key],old.$defs[key]));
for(const value of [
  {kind:'statutoryDays',value:5,overridable:false},
  {kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'},
  {kind:'concretisedStatutoryDays',minimum:2,maximum:29,overridable:false,confirmationFact:'shorteningEstablished',legalNature:'statutoryNotExtendable'},
  {kind:'concretisedStatutoryDays',minimum:2,maximum:9,overridable:false,confirmationFact:'shorteningEstablished',legalNature:'statutoryNotExtendable'},
  {kind:'concretisedStatutoryDays',minimum:5,maximum:29,overridable:false,confirmationFact:'concreteShortenedDurationQualified',legalNature:'statutoryNotExtendable'}])
  test('duration is exactly one permitted branch '+JSON.stringify(value),()=>assertSchema(value,fragment('durationV6')));
for(const mutate of [v=>{v.overridable=true;},v=>{v.minimum=1;},v=>{v.maximum=30;},v=>{v.legalNature='authorityOrdered';},
  v=>{delete v.confirmationFact;},v=>{v.value=5;},v=>{v.confirmationFact='unknown';},v=>{v.extra=true;}])
  test('reject altered statutory duration '+mutate.toString(),()=>{
    const value={kind:'concretisedStatutoryDays',minimum:5,maximum:29,overridable:false,
      confirmationFact:'concreteShortenedDurationQualified',legalNature:'statutoryNotExtendable'};
    mutate(value);assert.throws(()=>assertSchema(value,fragment('durationV6')));
  });
const selection={kind:'currentFact',factKey:'exceptionNotice',cases:[{value:'given',suspensionProfileId:'tg-none'},
  {value:'absent',suspensionProfileId:'tg-three'}],otherwise:'block'};
test('TG selection has exactly the two accepted current-fact meanings',()=>assertSchema(selection,fragment('suspensionSelectionV6')));
for(const mutate of [v=>v.cases.reverse(),v=>v.cases.pop(),v=>{v.cases[0].suspensionProfileId='tg-three';},
  v=>{v.default='given';},v=>{v.otherwise='useFirst';},v=>{v.factKey='urgency';},v=>{v.cases.push(v.cases[0]);}])
  test('reject changed TG selection '+mutate.toString(),()=>{const value=structuredClone(selection);mutate(value);
    assert.throws(()=>assertSchema(value,fragment('suspensionSelectionV6')));});
for(const profile of ['gl-three','gl-none','tg-three','tg-none'])test('fixed profile '+profile,()=>{
  assertSchema({kind:'fixed',suspensionProfileId:profile},fragment('suspensionSelectionV6'));
});
test('foreign fixed profile has no fallback',()=>assert.throws(()=>assertSchema({kind:'fixed',suspensionProfileId:'ch-three'},fragment('suspensionSelectionV6'))));
test('requirements project only explicit semantic fields, not research dynamic metadata',()=>{
  const row={key:'exceptionNotice',oneOf:['given','absent'],reason:'qualified',explanation:'current',dynamic:'tgNotice'};
  assert.deepEqual(projectI2Requirement(row),{key:'exceptionNotice',oneOf:['given','absent'],reason:'qualified',explanation:'current'});
  assert.equal(I2_REQUIREMENTS.some(item=>Object.hasOwn(item,'dynamic')),false);
});
const newPolicy=schemas.catalog.$defs.qualificationPolicy.oneOf.at(-1);
for(const row of I2_REQUIREMENTS)test('closed requirement '+row.key+' '+JSON.stringify(row),()=>{
  assertSchema(row,newPolicy.properties.requirements.items);
});
test('requirement must not carry value and oneOf together',()=>{
  const row=I2_REQUIREMENTS.find(item=>item.oneOf);
  assert.throws(()=>assertSchema({...row,value:row.oneOf[0]},newPolicy.properties.requirements.items));
});
test('V6 policies do not inherit OW opening or local holiday constraints',()=>{
  assert.deepEqual(newPolicy.properties.openingChainPolicy,{const:'notApplicable'});
  assert.deepEqual(newPolicy.properties.localHolidayPolicy,{const:'notApplicable'});
});
test('input facts are current scalars, not arrays, and no schema default is present',()=>{
  assert.throws(()=>assertSchema({exceptionNotice:['given','absent']},schemas.input.properties.facts));
  assertSchema({exceptionNotice:'given'},schemas.input.properties.facts);
  assertSchema({exceptionNotice:'absent'},schemas.input.properties.facts);
  assertSchema({},schemas.input.properties.facts);
  assert.equal(JSON.stringify(schemas).includes('"default":'),false);
});
