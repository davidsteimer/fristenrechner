// SPDX-License-Identifier: AGPL-3.0-only
// Schema-only K2 proposal tests. No native reader, calculation, permission or operating mutation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import Ajv2020 from '../../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../../spfx/node_modules/ajv-formats/dist/index.js';
import {buildK2Schemas,K2_SCHEMA_FILES,K2_SCHEMA_IDS,K2_LAW_IDS,K2_PROFILE_IDS,projectK2Requirement}
  from '../../scripts/build-ap23k2-schemas.mjs';
const root=new URL('../../',import.meta.url),load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const {schemas,requirements,baselines}=await buildK2Schemas();
const old=await load('schemas/administrative-procedure-catalog-v7.schema.json');
const candidate=await load('outputs/ap23k2-candidate-2026-10-27/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json');
const manifest=await load('outputs/ap23k2-candidate-2026-10-27/bundle/manifest.json');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);
for(const schema of Object.values(schemas))ajv.addSchema(schema);
const fragment=name=>({$defs:schemas.catalog.$defs,$ref:'#/$defs/'+name});
const cache=new WeakMap(),validator=schema=>{if(!cache.has(schema))cache.set(schema,ajv.compile(schema));return cache.get(schema);};
const good=(value,schema)=>{const validate=validator(schema);assert.equal(validate(value),true,JSON.stringify(validate.errors));};
const bad=(value,schema)=>assert.equal(validator(schema)(value),false);
const openingSchema=fragment('openingPolicyV8'),selectionSchema=fragment('calendarSelectionV8'),annualSchema=fragment('annualEndShiftPolicyV8');
const bindingSchema=fragment('holidayBinding'),lawSchema=fragment('lawV8');
const bsFixed=candidate.holidayBindings.find(row=>row.holidayBindingId==='bs-authority-seat');
const bsDynamic=candidate.holidayBindings.find(row=>row.holidayBindingId==='bs-party-representative');
const blFixed=candidate.holidayBindings.find(row=>row.holidayBindingId==='bl-authority-seat');
assert.ok(bsFixed&&bsDynamic&&blFixed,'Actual K2 proposal bindings required');

test('four written isolated schema files exactly match their deterministic sources',async()=>{
  for(const [key,path] of Object.entries(K2_SCHEMA_FILES))assert.deepEqual(await load(path),schemas[key]);
});
test('four actual schemas are valid Draft2020 and isolated below the K2 candidate directory',()=>{
  for(const [key,schema] of Object.entries(schemas)){
    assert.equal(ajv.validateSchema(schema),true,JSON.stringify(ajv.errors));
    assert.equal(schema.$id,K2_SCHEMA_IDS[key]);assert.ok(schema.$id.includes('/schemas/candidates/ap23k2/'));
  }
  assert.equal(baselines.length,3);assert.ok(baselines.every(row=>!row.path.includes('ap23k2')));
});
test('all four K2 schemas pass the actual unchanged product SchemaContract and actual candidate validation',()=>{
  const script=`
    import assert from 'node:assert/strict';
    import {readFile} from 'node:fs/promises';
    import {assertSchemaContract,assertSchema} from './src/core/schemaContract.ts';
    import {buildK2Schemas} from './scripts/build-ap23k2-schemas.mjs';
    const {schemas}=await buildK2Schemas();
    const registry=new Map(Object.values(schemas).map(schema=>[schema.$id,schema]));
    for(const schema of Object.values(schemas))assertSchemaContract(schema,registry);
    const read=async path=>JSON.parse(await readFile(path,'utf8'));
    const candidate=await read('outputs/ap23k2-candidate-2026-10-27/bundle/administrative-procedures/ch-cantonal-administrative-procedures.json');
    const manifest=await read('outputs/ap23k2-candidate-2026-10-27/bundle/manifest.json');
    assertSchema(candidate,schemas.catalog,registry);assertSchema(manifest,schemas.localManifest,registry);
    const annual=candidate.holidayBindings.find(row=>row.holidayBindingId==='bl-authority-seat').annualEndShiftPolicy;
    const schema={$defs:schemas.catalog.$defs,$ref:'#/$defs/annualEndShiftPolicyV8'};
    assertSchema(annual,schema,registry);
    const reordered=structuredClone(annual);reordered.years.reverse();assertSchema(reordered,schema,registry);
    const duplicate=structuredClone(annual);duplicate.years[1]=structuredClone(duplicate.years[0]);
    assert.throws(()=>assertSchema(duplicate,schema,registry));
    const missing=structuredClone(annual);missing.years.pop();assert.throws(()=>assertSchema(missing,schema,registry));
    console.log(JSON.stringify({schemas:4,actualCatalogue:true,actualLocalManifest:true,wholeYearMultiplicityChecked:true,productSchemaContractUnchanged:true}));`;
  const report=JSON.parse(execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',script],
    {cwd:fileURLToPath(root),encoding:'utf8',maxBuffer:4*1024*1024}));
  assert.deepEqual(report,{schemas:4,actualCatalogue:true,actualLocalManifest:true,wholeYearMultiplicityChecked:true,productSchemaContractUnchanged:true});
});
test('actual165-path candidate satisfies the proposed catalogue without a source promotion',()=>{
  good(candidate,schemas.catalog);assert.equal(candidate.paths.length,165);
  assert.equal(candidate.contractStatus,'proposed');assert.equal(candidate.contractDecision.id,'DEC-2026-040');
  assert.equal(candidate.contractDecision.status,'proposed');assert.equal(candidate.contractDecision.on,null);
  assert.equal(candidate.runtimeActive,false);assert.equal(candidate.releaseBinding.status,'candidate');
});
test('actual local Format15 manifest has no additional calendar or manifest artefact',()=>{
  good(manifest,schemas.localManifest);bad(manifest,schemas.manifest);
  for(const name of ['manifest','localManifest']){
    assert.equal(schemas[name].properties.formatVersion.const,'15.0.0');
    assert.equal(schemas[name].properties.compatibility.properties.minimumConsumerFormatVersion.const,'15.0.0');
    assert.equal(schemas[name].properties.artifacts.minItems,44);assert.equal(schemas[name].properties.artifacts.maxItems,44);
    assert.equal(schemas[name].properties.calendarIds.minItems,35);assert.equal(schemas[name].properties.calendarIds.maxItems,35);
  }
});
for(const name of ['path','qualificationPolicy','holidayBinding'])test('all historical '+name+' branches remain exact',()=>{
  const before=old.$defs[name].oneOf;assert.deepEqual(schemas.catalog.$defs[name].oneOf.slice(0,before.length),before);
  assert.equal(schemas.catalog.$defs[name].oneOf.length,before.length+(name==='holidayBinding'?3:1));
});
for(const name of Object.keys(old.$defs).filter(name=>!['path','qualificationPolicy','holidayBinding'].includes(name)))
  test('unchanged historical definition '+name,()=>assert.deepEqual(schemas.catalog.$defs[name],old.$defs[name]));
test('new catalogue introduces two composite procedural families without rewriting historical law definitions',()=>{
  assert.deepEqual(schemas.catalog.$defs.law,old.$defs.law);
  for(const lawId of K2_LAW_IDS){const law=candidate.laws.find(row=>row.lawId===lawId);assert.ok(law);good(law,lawSchema);}
  const bs=structuredClone(candidate.laws.find(row=>row.lawId===K2_LAW_IDS[0]));bs.holidayPolicyReview.explicitDeviation='noneIdentifiedInReviewedGeneralLaw';bad(bs,lawSchema);
});
test('current legal opening is a separate closed V8 meaning, not a widened V7 trigger enum',()=>{
  const p=candidate.paths.find(row=>row.contractFamily==='qualifiedDayProcedureV8');good(p.openingPolicy,openingSchema);
  assert.equal(p.openingPolicy.triggerKind,'qualifiedLegalOpening');assert.equal(p.openingPolicy.transformation,'none');
  bad(p.openingPolicy,fragment('openingPolicyV7'));assert.deepEqual(schemas.catalog.$defs.openingPolicyV7,old.$defs.openingPolicyV7);
});
for(const [label,change] of [
  ['written-only trigger',v=>{v.triggerKind='qualifiedWrittenOpening';}],
  ['physical ordinary post inference',v=>{v.transformation='nextWorkingDayIfNonWorkingReceipt';}],
  ['invented follow-up trigger',v=>{v.triggerKind='computedRegistrationEnd';}],
  ['default date',v=>{v.default='2026-09-16';}],['missing source',v=>{delete v.sourceRefs;}]
])test('V8 opening rejects '+label,()=>{const v=structuredClone(candidate.paths.find(row=>row.contractFamily==='qualifiedDayProcedureV8').openingPolicy);change(v);bad(v,openingSchema);});
for(const profile of K2_PROFILE_IDS)test('V8 explicitly selects the no-recess profile '+profile,()=>good({kind:'fixed',suspensionProfileId:profile},fragment('suspensionSelectionV8')));
test('V8 cannot import the federal VwVG recess profile or dynamic notice selection',()=>{
  bad({kind:'fixed',suspensionProfileId:'vwvg'},fragment('suspensionSelectionV8'));
  bad({kind:'currentFact',factKey:'exceptionNotice',cases:[],otherwise:'block'},fragment('suspensionSelectionV8'));
});
test('three actual new holiday bindings are valid and retain source-only evidence semantics',()=>{
  for(const binding of [bsFixed,bsDynamic,blFixed]){
    good(binding,bindingSchema);assert.equal(binding.physicalSource.eligibilityMeaning,'physicalSourceOnlyNotFederalProcedurePermission');
    assert.equal(binding.legalBinding.roleUnion,false);
  }
  assert.equal(bsFixed.annualEndShiftPolicy.kind,'none');assert.equal(bsDynamic.annualEndShiftPolicy.kind,'none');
  assert.equal(blFixed.annualEndShiftPolicy.kind,'blCantonalOfficeClosures');
});
test('dynamic calendar selection has26 pinned terminal bindings and never invents a representation role',()=>{
  const selection=bsDynamic.calendarSelection;good(selection,selectionSchema);assert.equal(selection.terminals.length,26);
  assert.equal(selection.qualificationFact,'legalAnchorQualification');assert.equal(selection.qualifiedValue,'establishedPartyOrRepresentative');
  assert.equal(selection.cantonFact,'legalAnchorCanton');assert.equal(selection.sourceProfileId,'vwvg');
  assert.equal(selection.usage,'holidayProjectionOnlyNoFederalProcedurePermission');
  assert.equal(Object.hasOwn(selection,'role'),false);assert.equal(Object.hasOwn(selection,'default'),false);
});
for(const [label,change] of [
  ['first calendar fallback',v=>{v.otherwise='firstCalendar';}],
  ['foreign data profile',v=>{v.sourceProfileId='zpo';}],
  ['federal full procedure permission',v=>{v.usage='fullFederalProcedure';}],
  ['invented unrepresented role',v=>{v.role='partyWithoutRepresentative';}],
  ['default canton',v=>{v.default='BS';}],
  ['union of party and representative',v=>{v.roleUnion=true;}],
  ['missing terminal',v=>{v.terminals.pop();}],
  ['unqualified anchor accepted',v=>{v.qualifiedValue='unknown';}],
  ['terminal hash missing',v=>{delete v.terminals[0].bindingSha256;}],
  ['projection hash malformed',v=>{v.terminals[0].variants[0].projectionSha256='wrong';}],
  ['extra territorial fact',v=>{v.terminals[0].requiredAreaScopeIds=['MUNICIPAL-FREE-DAY'];}]
])test('dynamic binding rejects '+label,()=>{const v=structuredClone(bsDynamic.calendarSelection);change(v);bad(v,selectionSchema);});
test('BL annual policy binds13 exact dated closures in two complete in-window year segments',()=>{
  const policy=blFixed.annualEndShiftPolicy;good(policy,annualSchema);
  assert.deepEqual(policy.coverage,{from:'2026-08-29',to:'2027-12-31'});
  assert.equal(policy.years.flatMap(year=>year.dates).length,13);assert.equal(policy.effect,'endShiftOnly');
  assert.equal(policy.uncertainty.inputOverride,'forbidden');assert.deepEqual(policy.uncertainty.dates,['2027-02-09']);
});
test('annual year multiplicity is closed with supported contains keywords without requiring schema tuple semantics',()=>{
  const policy=structuredClone(blFixed.annualEndShiftPolicy);policy.years.reverse();good(policy,annualSchema);
  const duplicate=structuredClone(policy);duplicate.years[1]=structuredClone(duplicate.years[0]);bad(duplicate,annualSchema);
  const years=schemas.catalog.$defs.annualEndShiftPolicyV8.oneOf[1].properties.years;
  assert.equal(Object.hasOwn(years,'prefixItems'),false);assert.equal(years.items.oneOf.length,2);
  assert.ok(years.allOf.every(row=>row.minContains===1&&row.maxContains===1));
});
for(const [label,change] of [
  ['missing full closure',v=>{v.years[0].dates.pop();}],
  ['half day treated as full',v=>{v.years[1].dates.push('2027-02-15');}],
  ['same day treated as yearly forever',v=>{v.years[0].dates[0]='12-24';}],
  ['whole2026 coverage falsely claimed',v=>{v.years[0].coverage.from='2026-01-01';}],
  ['third unreviewed year',v=>{v.years.push({...v.years[1],year:2028});}],
  ['wrong uncertainty day',v=>{v.uncertainty.dates=['2027-02-15'];}],
  ['input region override',v=>{v.uncertainty.inputOverride='allow';}],
  ['blanket uncertainty block',v=>{v.uncertainty.comparison='alwaysBlockCanton';}],
  ['different result accepted',v=>{v.uncertainty.onDifference='allowExport';}],
  ['inner-day suspension',v=>{v.effect='suspendDayCount';}],
  ['missing annual evidence',v=>{v.years[1].sourceRefs=[];}]
])test('annual closure policy rejects '+label,()=>{const v=structuredClone(blFixed.annualEndShiftPolicy);change(v);bad(v,annualSchema);});
test('new eligibility binds opening, calendar selection and annual policy separately',()=>{
  for(const key of ['candidatePathEligibilityV8','releasedPathEligibilityV8']){
    const schema=schemas.catalog.$defs[key];
    for(const field of ['openingPolicySha256','calendarSelectionSha256','annualEndShiftPolicySha256'])assert.ok(schema.required.includes(field));
    assert.equal(schema.properties.suspensionProfiles.minItems,1);assert.equal(schema.properties.suspensionProfiles.maxItems,1);
  }
});
for(const row of requirements)test('closed accepted current requirement '+row.key+' '+JSON.stringify(row.value??row.oneOf),()=>
  good(row,schemas.catalog.$defs.qualificationPolicy.oneOf.at(-1).properties.requirements.items));
test('requirement projection does not create facts and tolerates absent research-only reasons',()=>{
  const result=projectK2Requirement({key:'stage',value:'courtAppeal',synthetic:'ignored'});
  assert.deepEqual(result,{key:'stage',value:'courtAppeal',reason:'currentFactNotQualifiedStage',explanation:'Aktuelle Qualifikation stage'});
});
for(const row of [{key:'x'},{key:'x',value:null},{key:'x',value:true,oneOf:[true]},{key:'x',oneOf:[]},{key:'x',oneOf:[true,true]},
  {key:'x',value:Infinity},{key:'x',value:true,reason:''}])
  test('requirement projection rejects invalid current meaning '+JSON.stringify(row),()=>assert.throws(()=>projectK2Requirement(row)));
test('requirement getters are rejected before invocation',()=>{
  let invoked=false;const row={key:'x',get value(){invoked=true;return true;}};assert.throws(()=>projectK2Requirement(row));assert.equal(invoked,false);
});
test('consumer facts exclude all regional office choices, representations and invented follow-up dates',()=>{
  const facts=schemas.input.properties.facts;
  good({legalAnchorQualification:'establishedPartyOrRepresentative',legalAnchorCanton:'TI'},facts);
  for(const value of [{regionalOfficeMode:'confirmedFullClosure'},{regionalOfficeMode:'noOptionalFullClosure'},
    {regionalOfficeMode:'unknown'},{role:'partyWithoutRepresentative'},{computedOpening:'2026-09-16'}])bad(value,facts);
  bad({legalAnchorCanton:['BS','TI']},facts);bad({legalAnchorCanton:{value:'TI'}},facts);
  assert.equal(JSON.stringify(schemas).includes('"default":'),false);
});
test('current regional membership is explicitly typed without a general municipal extension point',()=>{
  const schema=schemas.input.properties.areaFacts;
  good({},schema);good({'AI-RTG-INNER-ADDITIONAL':true},schema);good({'NE-LANDERON-ADDITIONAL':false},schema);
  bad({'AI-RTG-INNER-ADDITIONAL':'unknown'},schema);bad({'MUNICIPAL-UNREVIEWED':true},schema);
});
test('old catalogue7 and old manifest14 reject actual new structures',async()=>{
  const oldAjv=new Ajv2020({strict:false,allErrors:true});addFormats(oldAjv);
  assert.equal(oldAjv.compile(old)(candidate),false);
  const oldManifest=await load('schemas/implementation/ap23j3/local-reference-manifest-v14.schema.json');
  assert.equal(oldAjv.compile(oldManifest)(manifest),false);
});
