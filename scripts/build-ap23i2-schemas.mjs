// SPDX-License-Identifier: AGPL-3.0-only
// Isolated contract proposal, never a native reader or a release activation.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const dir='schemas/candidates/ap23i2';
const raw='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const I2_SCHEMA_FILES={catalog:dir+'/administrative-procedure-catalog-v6.schema.json',
  manifest:dir+'/release-manifest-v13.schema.json',localManifest:dir+'/local-reference-manifest-v13.schema.json',
  input:dir+'/administrative-input-v6.schema.json'};
export const I2_SCHEMA_IDS=Object.fromEntries(Object.entries(I2_SCHEMA_FILES).map(([key,path])=>[key,raw+path]));
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const id=()=>({type:'string',pattern:'^[a-z][a-z0-9-]*$'});
const hash=()=>({type:'string',pattern:'^[a-f0-9]{64}$'});
const en=values=>({enum:[...new Set(values)]});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const load=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const fixture=await load('docs/fachrecht/ap23i1/referenzfaelle.json');
export function projectI2Requirement(row){
  return {key:row.key,...(Object.hasOwn(row,'value')?{value:row.value}:{oneOf:row.oneOf}),reason:row.reason,
    ...(Object.hasOwn(row,'explanation')?{explanation:row.explanation}:{})};
}
export const I2_REQUIREMENTS=[...new Map([...fixture.sharedRequirements,...fixture.paths.flatMap(path=>path.requirements)]
  .map(projectI2Requirement).map(row=>[JSON.stringify(row),row])).values()];

export async function buildI2Schemas(){
  const paths=['schemas/administrative-procedure-catalog-v5.schema.json','schemas/release-manifest-v12.schema.json',
    'schemas/implementation/ap23h3/local-reference-manifest-v12.schema.json'];
  const originals=await Promise.all(paths.map(load));
  const catalog=structuredClone(originals[0]);
  catalog.$id=I2_SCHEMA_IDS.catalog;
  catalog.title='AP23I2 proposed Kantonalverfahrenskatalog 6';
  catalog.properties.$schema.const=catalog.$id;
  catalog.properties.formatVersion.const='6.0.0';
  catalog.properties.contractDecision.properties.id.const='DEC-2026-038';

  // Only the new path branch receives the third duration kind.
  catalog.$defs.durationV6={oneOf:[...structuredClone(catalog.$defs.duration.oneOf),
    ...[{minimum:2,maximum:29,confirmationFact:'shorteningEstablished'},
      {minimum:2,maximum:9,confirmationFact:'shorteningEstablished'},
      {minimum:5,maximum:29,confirmationFact:'concreteShortenedDurationQualified'}].map(range=>object({
      kind:{const:'concretisedStatutoryDays'},minimum:{const:range.minimum},maximum:{const:range.maximum},
      overridable:{const:false},confirmationFact:{const:range.confirmationFact},legalNature:{const:'statutoryNotExtendable'}}))]};
  const profiles=en(['gl-three','gl-none','tg-three','tg-none']);
  catalog.$defs.suspensionSelectionV6={oneOf:[
    object({kind:{const:'fixed'},suspensionProfileId:profiles}),
    object({kind:{const:'currentFact'},factKey:{const:'exceptionNotice'},cases:{const:[
      {value:'given',suspensionProfileId:'tg-none'},{value:'absent',suspensionProfileId:'tg-three'}]},otherwise:{const:'block'}})]};
  const path=structuredClone(catalog.$defs.path.oneOf.at(-1));
  path.required=path.required.filter(key=>key!=='suspensionProfileId');
  delete path.properties.suspensionProfileId;
  path.required.push('suspensionSelection');
  path.properties.suspensionSelection={$ref:'#/$defs/suspensionSelectionV6'};
  path.properties.duration={$ref:'#/$defs/durationV6'};
  path.properties.contractFamily={const:'qualifiedDayProcedureV6'};
  path.properties.action=en(fixture.paths.map(item=>item.action));
  path.properties.normTimeline.items.properties.researchBindingId=en(Object.values(fixture.temporalBindings).flatMap(items=>items.map(item=>item.id)));
  catalog.$defs.path.oneOf.push(path);

  const requiredRow={oneOf:I2_REQUIREMENTS.map(row=>object(Object.fromEntries(Object.entries(row)
    .map(([key,value])=>[key,{const:value}]))))};
  catalog.$defs.qualificationPolicy.oneOf.push(object({pathId:id(),pathRevision:{type:'integer',minimum:1},pathSha256:hash(),
    mode:{const:'qualifiedDayProcedureV6'},requirements:{type:'array',minItems:1,uniqueItems:true,items:requiredRow},
    openingChainPolicy:{const:'notApplicable'},
    localHolidayPolicy:{const:'notApplicable'}}));

  // Profile closure replaces the single profile hash only for new V6 eligibility.
  for(const [baseName,newName]of[['candidatePathEligibility','candidatePathEligibilityV6'],['releasedPathEligibility','releasedPathEligibilityV6']]){
    const eligibility=structuredClone(catalog.$defs[baseName]);
    eligibility.required=eligibility.required.filter(key=>!['suspensionProfileId','suspensionProfileSha256'].includes(key));
    delete eligibility.properties.suspensionProfileId;
    delete eligibility.properties.suspensionProfileSha256;
    eligibility.required.push('suspensionSelectionSha256','suspensionProfiles');
    eligibility.properties.suspensionSelectionSha256=hash();
    eligibility.properties.suspensionProfiles={type:'array',minItems:1,maxItems:2,uniqueItems:true,
      items:object({suspensionProfileId:profiles,sha256:hash()})};
    if(baseName==='releasedPathEligibility'){
      delete eligibility.allOf;
      Object.assign(eligibility.properties.targetComponentRefs,{minItems:3,maxItems:3});
    }
    catalog.$defs[newName]=eligibility;
    const branch=catalog.properties.releaseBinding.oneOf.find(item=>item.properties.pathEligibility.items.$ref==='#/$defs/'+baseName);
    branch.properties.pathEligibility.items={oneOf:[{$ref:'#/$defs/'+baseName},{$ref:'#/$defs/'+newName}]};
  }

  const binding=structuredClone(catalog.$defs.holidayBinding.oneOf.find(item=>item.properties.bindingVersion?.const==='4.0.0'));
  binding.properties.bindingVersion={const:'6.0.0'};
  binding.properties.authoritySeatCanton=en(['GL','TG']);
  binding.properties.physicalReuse.properties.notDerivedFrom={const:'notApplicable'};
  binding.properties.practiceAddition={type:'null'};
  catalog.$defs.holidayBinding.oneOf.push(binding);

  const schemas={catalog};
  for(const[name,original]of[['manifest',originals[1]],['localManifest',originals[2]]]){
    const manifest=structuredClone(original);
    manifest.$id=I2_SCHEMA_IDS[name];
    manifest.title='AP23I2 proposed Manifest 13 '+name;
    manifest.properties.$schema.const=manifest.$id;
    manifest.properties.formatVersion.const='13.0.0';
    manifest.properties.compatibility.properties.minimumConsumerFormatVersion.const='13.0.0';
    Object.assign(manifest.properties.calendarIds,{minItems:35,maxItems:35});
    Object.assign(manifest.properties.artifacts,{minItems:44,maxItems:44});
    const artifact=manifest.properties.artifacts.items;
    artifact.properties.schemaId.enum=artifact.properties.schemaId.enum.map(value=>value===originals[0].$id?catalog.$id:value);
    artifact.allOf.find(item=>item.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=catalog.$id;
    schemas[name]=manifest;
  }

  const factValues=new Map();
  for(const facts of[fixture.sharedSyntheticFacts,...fixture.paths.map(item=>item.syntheticFacts)])
    for(const[key,value]of Object.entries(facts)){const list=factValues.get(key)??[];list.push(value);factValues.set(key,list);}
  for(const row of I2_REQUIREMENTS){const list=factValues.get(row.key)??[];list.push(...(Object.hasOwn(row,'value')?[row.value]:row.oneOf));factValues.set(row.key,list);}
  for(const item of fixture.cases)for(const[key,value]of Object.entries(item.facts??{}))
    if(factValues.has(key))factValues.get(key).push(value);
  const facts={type:'object',additionalProperties:false,properties:Object.fromEntries([...factValues].map(([key,values])=>[key,en([
    ...values,...(values.some(value=>typeof value==='boolean')?[true,false]:[]),'unknown','other',null])]))};
  schemas.input={$schema:'https://json-schema.org/draft/2020-12/schema',$id:I2_SCHEMA_IDS.input,
    title:'AP23I2 current qualified facts, never persistent defaults',...object({path:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'},
      pathRevision:{type:'integer',minimum:1},authoritySeatCanton:en(['GL','TG','BE','CH','unknown']),
      trigger:{type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},days:{type:'integer',minimum:1,maximum:365},facts})};
  return {schemas,baselines:await Promise.all(paths.map(async path=>({path,sha256:sha(await readFile(resolve(root,path)))})))};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const write=process.argv.includes('--write');
  const {schemas,baselines}=await buildI2Schemas();
  if(write)await mkdir(resolve(root,dir),{recursive:true});
  const files=[];
  for(const[name,value]of Object.entries(schemas)){
    const path=I2_SCHEMA_FILES[name],bytes=JSON.stringify(value,null,2)+'\n';
    if(write)await writeFile(resolve(root,path),bytes);
    else assert.equal(await readFile(resolve(root,path),'utf8'),bytes,path);
    files.push({path,sha256:sha(bytes)});
  }
  console.log(JSON.stringify({status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,runtimeActive:false},null,2));
}
