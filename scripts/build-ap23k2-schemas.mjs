// SPDX-License-Identifier: AGPL-3.0-only
// AP23K2 isolated structural proposal. Native schemas and historical branches are immutable inputs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const directory='schemas/candidates/ap23k2',raw='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const K2_SCHEMA_FILES=Object.freeze({catalog:directory+'/administrative-procedure-catalog-v8.schema.json',
  manifest:directory+'/release-manifest-v15.schema.json',localManifest:directory+'/local-reference-manifest-v15.schema.json',
  input:directory+'/administrative-input-v8.schema.json'});
export const K2_SCHEMA_IDS=Object.freeze(Object.fromEntries(Object.entries(K2_SCHEMA_FILES).map(([key,path])=>[key,raw+path])));
export const K2_PROFILE_IDS=Object.freeze(['bs-none','bl-none']);
export const K2_LAW_IDS=Object.freeze(['bs-general-administrative','bl-general-administrative']);
export const K2_CANTONS=Object.freeze('ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '));
const areaScopeIds=['AI-RTG-INNER-ADDITIONAL','NE-LANDERON-ADDITIONAL'];
const object=(properties,optional=[])=>({type:'object',additionalProperties:false,
  required:Object.keys(properties).filter(key=>!optional.includes(key)),properties});
const id=()=>({type:'string',pattern:'^[a-z][a-z0-9-]*$'}),hash=()=>({type:'string',pattern:'^[a-f0-9]{64}$'});
const date=()=>({type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'});
const en=values=>({enum:[...new Set(values)]});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const load=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const scalar=value=>typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
export function projectK2Requirement(row){
  assert.ok(row&&typeof row==='object'&&!Array.isArray(row));
  assert.ok(Object.values(Object.getOwnPropertyDescriptors(row)).every(descriptor=>'value'in descriptor),'Requirement accessor');
  assert.ok(typeof row.key==='string'&&row.key.trim());
  assert.notEqual(Object.hasOwn(row,'value'),Object.hasOwn(row,'oneOf'),'Exactly one scalar or scalar alternative list');
  if(Object.hasOwn(row,'value'))assert.ok(scalar(row.value),'Finite primitive current fact required');
  else{assert.ok(Array.isArray(row.oneOf)&&row.oneOf.length&&row.oneOf.every(scalar));
    assert.equal(new Set(row.oneOf.map(value=>JSON.stringify(value))).size,row.oneOf.length);}
  assert.ok(row.reason===undefined||typeof row.reason==='string'&&row.reason.trim());
  return {key:row.key,...(Object.hasOwn(row,'value')?{value:row.value}:{oneOf:[...row.oneOf]}),
    reason:'currentFactNotQualified'+row.key[0].toUpperCase()+row.key.slice(1),
    explanation:row.reason??('Aktuelle Qualifikation '+row.key)};
}

export async function buildK2Schemas(){
  const baselines=['schemas/administrative-procedure-catalog-v7.schema.json','schemas/release-manifest-v14.schema.json',
    'schemas/implementation/ap23j3/local-reference-manifest-v14.schema.json'];
  const originals=await Promise.all(baselines.map(load));
  const fixture=await load('docs/fachrecht/ap23k1/referenzfaelle.json');
  const models=await Promise.all(['bs','bl'].map(canton=>load('docs/fachrecht/ap23k1/befund-'+canton+'.json')));
  const groups=models.flatMap(model=>model.pathProposals??model.groups);
  const rows=[...new Map([...fixture.sharedRequirements,...fixture.paths.flatMap(path=>path.requirements)]
    .filter(row=>row.key!=='regionalOfficeMode').map(projectK2Requirement).map(row=>[JSON.stringify(row),row])).values()];
  const catalog=structuredClone(originals[0]);
  catalog.$id=K2_SCHEMA_IDS.catalog;catalog.title='AP23K2 proposed Kantonalverfahrenskatalog 8 with bound end calendars';
  catalog.properties.$schema.const=catalog.$id;catalog.properties.formatVersion.const='8.0.0';
  catalog.properties.contractDecision.properties.id.const='DEC-2026-040';

  // Old laws and their closed definitions remain unchanged. Only these new IDs
  // may use the additional reviewed, path-dependent anchor qualification.
  const lawVariants=K2_LAW_IDS.map((lawId,index)=>{
    const law=structuredClone(catalog.$defs.law);
    law.properties.lawId={const:lawId};law.properties.canton={const:index===0?'BS':'BL'};
    law.properties.holidayPolicyReview.properties.explicitDeviation={const:index===0?
      'explicitReviewedPathDependentAnchor':'noneIdentifiedInReviewedGeneralLaw'};
    return law;
  });
  catalog.$defs.lawV8={oneOf:[{allOf:[{$ref:'#/$defs/law'},
    {not:{properties:{lawId:en(K2_LAW_IDS)},required:['lawId']}}]},...lawVariants]};
  catalog.properties.laws.items={$ref:'#/$defs/lawV8'};

  catalog.$defs.openingPolicyV8=object({kind:{const:'qualifiedCurrentTrigger'},triggerKind:{const:'qualifiedLegalOpening'},
    transformation:{const:'none'},sourceRefs:{$ref:'#/$defs/sourceRefs'}});
  catalog.$defs.suspensionSelectionV8=object({kind:{const:'fixed'},suspensionProfileId:en(K2_PROFILE_IDS)});
  const path=structuredClone(catalog.$defs.path.oneOf.at(-1));
  path.properties.contractFamily={const:'qualifiedDayProcedureV8'};
  path.properties.lawId=en(K2_LAW_IDS);path.properties.action=en(groups.map(group=>group.action));
  path.properties.urgencyPolicy={const:'notApplicable'};path.properties.endShiftGuard={const:'none'};
  path.properties.openingPolicy={$ref:'#/$defs/openingPolicyV8'};
  path.properties.suspensionSelection={$ref:'#/$defs/suspensionSelectionV8'};
  path.properties.openingWarnings={type:'array',maxItems:0,items:false};
  path.properties.normTimeline.items.properties.researchBindingId=en(Object.values(fixture.temporalBindings).flatMap(values=>values.map(value=>value.id)));
  catalog.$defs.path.oneOf.push(path);

  catalog.$defs.qualificationPolicy.oneOf.push(object({pathId:id(),pathRevision:{type:'integer',minimum:1},pathSha256:hash(),
    mode:{const:'qualifiedDayProcedureV8'},requirements:{type:'array',minItems:1,uniqueItems:true,
      items:{oneOf:rows.map(row=>object(Object.fromEntries(Object.entries(row).map(([key,value])=>[key,{const:value}]))))}},
    openingChainPolicy:{const:'notApplicable'},localHolidayPolicy:{const:'boundEndCalendarPolicy'}}));

  const refs={$ref:'#/$defs/sourceRefs'},interval=()=>object({from:date(),to:date()});
  const fixedSelection=object({kind:{const:'fixedAuthoritySeat'},calendarId:id(),projectionId:id()});
  const areaFacts={type:'array',maxItems:2,uniqueItems:true,items:object({scopeId:en(areaScopeIds),member:{type:'boolean'}})};
  const ambiguity={oneOf:[{type:'null'},object({decision:{const:'DEC-2026-029'},catalogRuleIds:{type:'array',minItems:1,maxItems:1,uniqueItems:true,
    items:{type:'string',pattern:'^[A-Z0-9-]+$'}},comparison:{const:'fullCalculation'},onDifference:{const:'clarificationRequired'},onEqual:{const:'resolved'}})]};
  const dynamicSelection=object({kind:{const:'qualifiedPartyOrRepresentativeCanton'},qualificationFact:{const:'legalAnchorQualification'},
    qualifiedValue:{const:'establishedPartyOrRepresentative'},cantonFact:{const:'legalAnchorCanton'},sourceProfileId:{const:'vwvg'},
    usage:{const:'holidayProjectionOnlyNoFederalProcedurePermission'},otherwise:{const:'block'},
    terminals:{type:'array',minItems:26,maxItems:26,uniqueItems:true,items:object({canton:en(K2_CANTONS),
      bindingId:{type:'string',pattern:'^AP22-BIND-[A-Z]{2}-VWVG$'},bindingSha256:hash(),
      requiredAreaScopeIds:{type:'array',maxItems:2,uniqueItems:true,items:en(areaScopeIds)},
      variants:{type:'array',minItems:1,maxItems:2,uniqueItems:true,items:object({areaFacts,projectionId:id(),projectionSha256:hash(),calendarId:id(),
        alternativeProjectionId:{oneOf:[{type:'null'},id()]},alternativeProjectionSha256:{oneOf:[{type:'null'},hash()]}})},
      boundaryIds:{type:'array',maxItems:1,uniqueItems:true,items:en(['GR-BASE-ONLY','NE-YEAR-LOCAL-RESERVE'])},ambiguity})}});
  const none=object({kind:{const:'none'}});
  const closureYears=[{year:2026,from:'2026-08-29',to:'2026-12-31',dates:['2026-12-24','2026-12-28','2026-12-29','2026-12-30','2026-12-31']},
    {year:2027,from:'2027-01-01',to:'2027-12-31',dates:['2027-03-25','2027-05-07','2027-12-24','2027-12-27','2027-12-28','2027-12-29','2027-12-30','2027-12-31']}];
  const yearSchemas=closureYears.map(year=>object({year:{const:year.year},
    coverage:{const:{from:year.from,to:year.to}},dates:{const:year.dates},sourceRefs:refs}));
  const annual=object({kind:{const:'blCantonalOfficeClosures'},effect:{const:'endShiftOnly'},coverage:{const:fixture.window},
    years:{type:'array',minItems:2,maxItems:2,items:{oneOf:yearSchemas},
      allOf:yearSchemas.map(year=>({contains:year,minContains:1,maxContains:1}))},
    uncertainty:object({boundaryId:{const:'BL-B-FASNACHT'},dates:{const:['2027-02-09']},comparison:{const:'twoCompleteAdministrativePaths'},
      onDifference:{const:'blockDefinitiveResultAndExport'},onEqual:{const:'sameResult'},inputOverride:{const:'forbidden'},sourceRefs:refs})});
  catalog.$defs.calendarSelectionV8={oneOf:[fixedSelection,dynamicSelection]};
  catalog.$defs.annualEndShiftPolicyV8={oneOf:[none,annual]};
  const physicalSource=object({releaseId:{type:'string',minLength:1},references:{type:'array',minItems:3,maxItems:36,uniqueItems:true,
    items:{$ref:'#/$defs/physicalReference'}},eligibilityMeaning:{const:'physicalSourceOnlyNotFederalProcedurePermission'}});
  const binding=(authority,anchor,selection,annualPolicy)=>object({holidayBindingId:id(),lawId:{const:authority==='BS'?'bs-general-administrative':'bl-general-administrative'},
    authoritySeatCanton:{const:authority},authorityLevel:{const:'cantonal'},bindingVersion:{const:'8.0.0'},anchor:{const:anchor},physicalSource,
    legalBinding:object({sourceRefs:refs,projectDecisionRef:{const:'DEC-2026-031'},roleUnion:{const:false},
      partyOrRepresentativeRequired:{const:anchor==='qualifiedPartyOrRepresentativeCanton'}}),calendarSelection:selection,annualEndShiftPolicy:annualPolicy});
  catalog.$defs.holidayBinding.oneOf.push(binding('BS','authoritySeat',fixedSelection,none),
    binding('BS','qualifiedPartyOrRepresentativeCanton',dynamicSelection,none),binding('BL','authoritySeat',fixedSelection,annual));

  for(const [baseName,newName] of [['candidatePathEligibilityV7','candidatePathEligibilityV8'],['releasedPathEligibilityV7','releasedPathEligibilityV8']]){
    const entry=structuredClone(catalog.$defs[baseName]);
    for(const field of ['calendarSelectionSha256','annualEndShiftPolicySha256']){entry.required.push(field);entry.properties[field]=hash();}
    entry.properties.suspensionProfiles={type:'array',minItems:1,maxItems:1,uniqueItems:true,
      items:object({suspensionProfileId:en(K2_PROFILE_IDS),sha256:hash()})};
    if(baseName.startsWith('released')){entry.properties.targetComponentRefs.minItems=3;entry.properties.targetComponentRefs.maxItems=36;}
    catalog.$defs[newName]=entry;
    const original='#/$defs/'+baseName;
    const branch=catalog.properties.releaseBinding.oneOf.find(row=>row.properties.pathEligibility.items.oneOf?.some(item=>item.$ref===original));
    assert.ok(branch,'Missing unchanged historical eligibility branch');branch.properties.pathEligibility.items.oneOf.push({$ref:'#/$defs/'+newName});
  }
  const schemas={catalog};
  for(const [name,original] of [['manifest',originals[1]],['localManifest',originals[2]]]){
    const manifest=structuredClone(original);manifest.$id=K2_SCHEMA_IDS[name];manifest.title='AP23K2 proposed Manifest 15 '+name;
    manifest.properties.$schema.const=manifest.$id;manifest.properties.formatVersion.const='15.0.0';
    manifest.properties.compatibility.properties.minimumConsumerFormatVersion.const='15.0.0';
    const artifact=manifest.properties.artifacts.items;
    artifact.properties.schemaId.enum=artifact.properties.schemaId.enum.map(value=>value===originals[0].$id?catalog.$id:value);
    artifact.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=catalog.$id;
    schemas[name]=manifest;
  }

  const factValues=new Map();
  for(const row of rows){const values=factValues.get(row.key)??[];values.push(...(Object.hasOwn(row,'value')?[row.value]:row.oneOf));factValues.set(row.key,values);}
  for(const item of fixture.cases)for(const [key,value] of Object.entries(item.facts??{}))if(factValues.has(key))factValues.get(key).push(value);
  factValues.set('legalAnchorCanton',[...K2_CANTONS]);
  const facts={type:'object',additionalProperties:false,properties:Object.fromEntries([...factValues].map(([key,values])=>[key,en([
    ...values,...(values.some(value=>typeof value==='boolean')?[true,false]:[]),'unknown','other',null])]))};
  schemas.input={$schema:'https://json-schema.org/draft/2020-12/schema',$id:K2_SCHEMA_IDS.input,
    title:'AP23K2 current legal opening and qualified holiday anchor facts',...object({
      path:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'},pathRevision:{type:'integer',minimum:1},
      authoritySeatCanton:en(['BS','BL','BE','CH','unknown']),trigger:date(),days:{type:'integer',minimum:1,maximum:365},facts,
      areaFacts:object(Object.fromEntries(areaScopeIds.map(key=>[key,{type:'boolean'}])),areaScopeIds)},['areaFacts'])};
  return {schemas,requirements:rows,baselines:await Promise.all(baselines.map(async path=>({path,sha256:sha(await readFile(resolve(root,path)))})))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'Use --write or --check');
  const write=process.argv[2]==='--write',{schemas,baselines}=await buildK2Schemas();
  if(write)await mkdir(resolve(root,directory),{recursive:true});const files=[];
  for(const [name,schema] of Object.entries(schemas)){
    const path=K2_SCHEMA_FILES[name],text=JSON.stringify(schema,null,2)+'\n';
    if(write)await writeFile(resolve(root,path),text);else assert.equal(await readFile(resolve(root,path),'utf8'),text,path);
    files.push({path,byteLength:Buffer.byteLength(text),sha256:sha(text)});
  }
  console.log(JSON.stringify({workPackage:'AP23K2',status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,
    nativeSchemasChanged:false,formatDecision:false,runtimeActive:false,sourceReleaseApproved:false},null,2));
}
