// SPDX-License-Identifier: AGPL-3.0-only
// Isolated contract tests, no native product modules or operational approvals.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Ajv2020 from '../../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../../spfx/node_modules/ajv-formats/dist/index.js';
import {buildJ2Schemas,J2_SCHEMA_FILES,J2_SCHEMA_IDS,J2_REQUIREMENTS,J2_TRIGGER_KINDS,J2_PROFILE_IDS,
  J2_HISTORICAL_SOURCE_EXCEPTION,projectJ2Requirement} from '../../scripts/build-ap23j2-schemas.mjs';
const root=new URL('../../',import.meta.url),load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const{schemas,baselines}=await buildJ2Schemas(),old=await load('schemas/administrative-procedure-catalog-v6.schema.json');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);
for(const schema of Object.values(schemas))ajv.addSchema(schema);
const fragment=key=>({$defs:schemas.catalog.$defs,$ref:'#/$defs/'+key});
const validates=(value,schema)=>{const check=ajv.compile(schema);assert.equal(check(value),true,JSON.stringify(check.errors));};
const rejects=(value,schema)=>assert.equal(ajv.compile(schema)(value),false);
const refs=[{sourceId:'SRC-AP23J1-GE-LPA-20250601',locator:'Art. 17 Abs. 6'}];
const ge=()=>({kind:'geQualifiedOrOrdinaryPost',factKey:'openingMode',allowedModes:['qualifiedLegalOpening','ordinaryPostPhysicalReceipt'],
  ordinaryPostTransformation:'nextWorkingDayIfNonWorkingReceipt',holidayBinding:'sameAsPath',otherwise:'block',sourceRefs:structuredClone(refs)});
const fixed=triggerKind=>({kind:'qualifiedCurrentTrigger',triggerKind,transformation:'none',sourceRefs:structuredClone(refs)});

test('four actual isolated schemas equal their deterministic proposal sources',async()=>{
  for(const[key,path]of Object.entries(J2_SCHEMA_FILES))assert.deepEqual(await load(path),schemas[key]);
});
test('all four schemas are valid draft2020 contracts and remain isolated',()=>{
  for(const[key,schema]of Object.entries(schemas)){assert.equal(ajv.validateSchema(schema),true);
    assert.equal(schema.$id,J2_SCHEMA_IDS[key]);assert.ok(schema.$id.includes('/schemas/candidates/ap23j2/'));}
  assert.equal(baselines.length,3);assert.ok(baselines.every(row=>!row.path.includes('ap23j2')));
});
test('new catalogue and manifests declare proposed formats without changing native baseline schemas',()=>{
  assert.equal(schemas.catalog.properties.formatVersion.const,'7.0.0');
  assert.equal(schemas.catalog.properties.contractDecision.properties.id.const,'DEC-2026-039');
  for(const name of['manifest','localManifest']){
    assert.equal(schemas[name].properties.formatVersion.const,'14.0.0');
    assert.equal(schemas[name].properties.compatibility.properties.minimumConsumerFormatVersion.const,'14.0.0');
    assert.equal(schemas[name].properties.artifacts.minItems,44);assert.equal(schemas[name].properties.artifacts.maxItems,44);
    const a=schemas[name].properties.artifacts.items;
    assert.ok(a.properties.schemaId.enum.includes(J2_SCHEMA_IDS.catalog));
    assert.equal(a.properties.schemaId.enum.includes(old.$id),false);
  }
});
for(const key of['path','qualificationPolicy','holidayBinding'])test('all historical '+key+' branches remain exact',()=>{
  const previous=old.$defs[key].oneOf;assert.deepEqual(schemas.catalog.$defs[key].oneOf.slice(0,previous.length),previous);
  assert.equal(schemas.catalog.$defs[key].oneOf.length,previous.length+1);
});
for(const key of Object.keys(old.$defs).filter(key=>!['path','qualificationPolicy','holidayBinding'].includes(key)))
  test('old definition remains unchanged: '+key,()=>assert.deepEqual(schemas.catalog.$defs[key],old.$defs[key]));
for(const kind of J2_TRIGGER_KINDS)test('fixed current event is explicit and performs no invented chain: '+kind,()=>validates(fixed(kind),fragment('openingPolicyV7')));
test('GE policy describes both current modes and one exact legal transformation',()=>validates(ge(),fragment('openingPolicyV7')));
for(const[name,change]of[
  ['mode order',v=>v.allowedModes.reverse()],['missing mode',v=>v.allowedModes.pop()],['third mode',v=>v.allowedModes.push('electronic')],
  ['first mode default',v=>{v.default='ordinaryPostPhysicalReceipt';}],['foreign mode fact',v=>{v.factKey='exceptionNotice';}],
  ['foreign holiday list',v=>{v.holidayBinding='partyDomicile';}],['automatic fallback',v=>{v.otherwise='useFirst';}],
  ['missing policy evidence',v=>{v.sourceRefs=[];}],['changed transformation',v=>{v.ordinaryPostTransformation='none';}],
  ['extra fixed event',v=>{v.triggerKind='qualifiedWrittenOpening';}],['computed opening input',v=>{v.legalOpening='2026-10-05';}]
])test('GE opening policy rejects '+name,()=>{const value=ge();change(value);rejects(value,fragment('openingPolicyV7'));});
for(const[name,change]of[
  ['unknown event',v=>{v.triggerKind='knowledgeOfDecision';}],['automatic written follow-up',v=>{v.transformation='inventConfirmationDate';}],
  ['extra receipt mode',v=>{v.factKey='openingMode';}],['default supplied opening',v=>{v.default='2026-10-05';}],
  ['missing source',v=>{delete v.sourceRefs;}],['empty source',v=>{v.sourceRefs=[];}],['untyped event',v=>{delete v.triggerKind;}]
])test('fixed opening policy rejects '+name,()=>{const value=fixed('qualifiedOralDecisionOpening');change(value);rejects(value,fragment('openingPolicyV7'));});
for(const profile of J2_PROFILE_IDS)test('new fixed profile remains an explicit single choice: '+profile,()=>
  validates({kind:'fixed',suspensionProfileId:profile},fragment('suspensionSelectionV7')));
for(const value of[{kind:'fixed',suspensionProfileId:'tg-three'},
  {kind:'currentFact',factKey:'exceptionNotice',cases:[],otherwise:'block'},
  {kind:'fixed',suspensionProfileId:'fr-two',default:'fr-three'}])
  test('V7 does not silently inherit a foreign or dynamic profile '+JSON.stringify(value),()=>rejects(value,fragment('suspensionSelectionV7')));

const newPolicy=schemas.catalog.$defs.qualificationPolicy.oneOf.at(-1);
for(const row of J2_REQUIREMENTS)test('closed accepted requirement '+row.key+' '+row.reason,()=>validates(row,newPolicy.properties.requirements.items));
test('current requirement projection strips synthetic metadata and copies explicit alternatives',()=>{
  const row={key:'openingMode',oneOf:['qualifiedLegalOpening','ordinaryPostPhysicalReceipt'],reason:'currentOpening',dynamic:'researchOnly',syntheticFixtureOnly:true};
  const projected=projectJ2Requirement(row);assert.deepEqual(projected,{key:row.key,oneOf:row.oneOf,reason:row.reason});
  assert.notEqual(projected.oneOf,row.oneOf);
});
for(const row of[
  {key:'x',reason:'required'}, {key:'x',value:true,oneOf:[true],reason:'required'},
  {key:'x',value:null,reason:'required'}, {key:'x',value:{value:true},reason:'required'},
  {key:'x',oneOf:[],reason:'required'}, {key:'x',oneOf:[true,true],reason:'required'},
  {key:'x',oneOf:[NaN],reason:'required'}, {key:'x',value:true,reason:''}
])test('requirement projection rejects a malformed meaning '+JSON.stringify(row),()=>assert.throws(()=>projectJ2Requirement(row)));
test('current requirement accessors are never read or converted',()=>{
  let read=false;const row={key:'x',reason:'required',get value(){read=true;return true;}};
  assert.throws(()=>projectJ2Requirement(row));assert.equal(read,false);
});
test('new policies do not acquire automatic follow-up chains or foreign local constraints',()=>{
  assert.deepEqual(newPolicy.properties.openingChainPolicy,{const:'notApplicable'});
  assert.deepEqual(newPolicy.properties.localHolidayPolicy,{const:'notApplicable'});
  const row=J2_REQUIREMENTS.find(row=>row.oneOf);assert.ok(row);
  rejects({...row,value:row.oneOf[0]},newPolicy.properties.requirements.items);
});
test('new eligibility binds its opening policy and exactly one permitted profile',()=>{
  for(const key of['candidatePathEligibilityV7','releasedPathEligibilityV7']){
    const value=schemas.catalog.$defs[key];assert.ok(value.required.includes('openingPolicySha256'));
    assert.deepEqual(value.properties.openingPolicySha256,{type:'string',pattern:'^[a-f0-9]{64}$'});
    assert.equal(value.properties.suspensionProfiles.minItems,1);assert.equal(value.properties.suspensionProfiles.maxItems,1);
  }
});
test('native three stages are unchanged and new paths do not pretend every trigger is an actual delivery',()=>{
  const path=schemas.catalog.$defs.path.oneOf.at(-1);
  assert.deepEqual(path.properties.stages.items.enum,['administration','administrativeAppeal','court']);
  assert.equal(path.properties.qualification.properties.delivery.const,'qualifiedTriggerAccordingToOpeningPolicy');
  assert.equal(path.properties.duration.$ref,'#/$defs/duration');
  assert.deepEqual(path.properties.urgencyPolicy,{const:'notApplicable'});
  assert.deepEqual(path.properties.openingWarnings,{type:'array',maxItems:0,items:false});
});
test('new independent legal bindings keep authority-seat anchoring and the same physical-source distinction',()=>{
  const binding=schemas.catalog.$defs.holidayBinding.oneOf.at(-1);
  assert.deepEqual(binding.properties.authoritySeatCanton.enum,['FR','GE','JU']);
  assert.deepEqual(binding.properties.anchor,{const:'authoritySeat'});
  assert.equal(binding.properties.bindingVersion.const,'7.0.0');
  assert.equal(binding.properties.physicalReuse.properties.permissionInheritance.const,'none');
});
const mirror=()=>({...J2_HISTORICAL_SOURCE_EXCEPTION,versionDescription:'Supplementary historical full-text mirror, not an operative norm',
  reviewedOn:'2026-10-27',reviewBasis:'Accepted J1 supplementaryHistoricalJudgmentFullTextMirror',locators:'E. 2.1–2.3'});
test('one accepted original historical source reference is an exact V7 exception only',()=>{
  validates(mirror(),fragment('sourceV7'));rejects(mirror(),{$defs:old.$defs,$ref:'#/$defs/source'});
  assert.deepEqual(schemas.catalog.$defs.source,old.$defs.source);
});
for(const[name,change]of[
  ['wrong source ID',v=>{v.sourceId='JUD-AP23J1-JU-ADM77-2021';}],
  ['wrong evidence kind',v=>{v.kind='statute';}],['neighbour path',v=>{v.url=v.url.replace('JumpCGI','JumpCGI2');}],
  ['changed query',v=>{v.url=v.url.replace('2D_55','2D_56');}],['added query',v=>{v.url+='&format=html';}],
  ['redirect query',v=>{v.url='http://relevancy.bger.ch/cgi-bin/JumpCGI?url='+encodeURIComponent(v.url);}],
  ['other host',v=>{v.url=v.url.replace('relevancy.bger.ch','entscheidsuche.ch');}],
  ['credentials in host',v=>{v.url=v.url.replace('://','://user:password@');}],
  ['unconfirmed HTTPS substitution',v=>{v.url=v.url.replace('http:','https:');}]
])test('exact historical source exception rejects '+name,()=>{const value=mirror();change(value);rejects(value,fragment('sourceV7'));});
test('the historical exception is not a general HTTP permission for another source',()=>{
  const value={...mirror(),sourceId:'SRC-EXAMPLE',url:'http://relevancy.bger.ch/another'};rejects(value,fragment('sourceV7'));
  validates({...value,url:'https://bdlf.fr.ch/api/fr/versions/8637/pdf_file'},fragment('sourceV7'));
});
test('input schema has exactly the current I2-style probe fields, not duplicated delivery metadata',()=>{
  assert.deepEqual(schemas.input.required,['path','pathRevision','authoritySeatCanton','trigger','days','facts']);
  assert.equal(schemas.input.additionalProperties,false);
  assert.equal(Object.hasOwn(schemas.input.properties,'qualification'),false);
  assert.equal(Object.hasOwn(schemas.input.properties.facts.properties,'syntheticFixtureOnly'),false);
  assert.equal(Object.hasOwn(schemas.input.properties.facts.properties,'actualReviewTarget'),false);
});
test('current scalar facts have no implicit defaults, arrays or follow-up dates',()=>{
  const facts=schemas.input.properties.facts;
  validates({},facts);validates({openingMode:'qualifiedLegalOpening'},facts);validates({openingMode:'ordinaryPostPhysicalReceipt'},facts);
  validates({openingMode:'unknown'},facts);
  rejects({openingMode:['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']},facts);
  rejects({openingMode:{value:'ordinaryPostPhysicalReceipt'}},facts);
  rejects({legalOpening:'2026-10-05'},facts);rejects({syntheticFixtureOnly:true},facts);
  assert.equal(JSON.stringify(schemas).includes('"default":'),false);
});
