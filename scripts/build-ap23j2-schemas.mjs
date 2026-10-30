// SPDX-License-Identifier: AGPL-3.0-only
// Isolated J2 proposal. This never changes a native schema or grants runtime authority.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const directory='schemas/candidates/ap23j2';
const raw='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const J2_SCHEMA_FILES=Object.freeze({catalog:directory+'/administrative-procedure-catalog-v7.schema.json',
  manifest:directory+'/release-manifest-v14.schema.json',localManifest:directory+'/local-reference-manifest-v14.schema.json',
  input:directory+'/administrative-input-v7.schema.json'});
export const J2_SCHEMA_IDS=Object.freeze(Object.fromEntries(Object.entries(J2_SCHEMA_FILES).map(([key,path])=>[key,raw+path])));
export const J2_PROFILE_IDS=Object.freeze(['fr-two','fr-three','ge-none','ge-three','ju-none','ju-three']);
export const J2_TRIGGER_KINDS=Object.freeze(['qualifiedWrittenOpening','qualifiedExtensionRefusalAfterExpiredDeadline',
  'qualifiedTcDispositifOpening','qualifiedOralDecisionOpening','qualifiedFullyFavourableAbbreviatedOpening']);
export const J2_HISTORICAL_SOURCE_EXCEPTION=Object.freeze({sourceId:'JUD-AP23J1-JU-BGER2D55-2010',kind:'judgment',
  url:'http://relevancy.bger.ch/cgi-bin/JumpCGI?id=01.03.2011_2D_55/2010'});
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const id=()=>({type:'string',pattern:'^[a-z][a-z0-9-]*$'});
const hash=()=>({type:'string',pattern:'^[a-f0-9]{64}$'});
const en=values=>({enum:[...new Set(values)]});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const load=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const fixture=await load('docs/fachrecht/ap23j1/referenzfaelle.json');
const scalar=value=>typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
/** Project the explicit accepted meaning, never synthetic facts, defaults or research-only metadata. */
export function projectJ2Requirement(row){
  assert.ok(row&&typeof row==='object'&&!Array.isArray(row));
  assert.ok(Object.values(Object.getOwnPropertyDescriptors(row)).every(descriptor=>'value'in descriptor),'Requirement accessor');
  assert.ok(typeof row.key==='string'&&row.key.trim()&&typeof row.reason==='string'&&row.reason.trim());
  assert.notEqual(Object.hasOwn(row,'value'),Object.hasOwn(row,'oneOf'),'Exactly one scalar value or explicit oneOf is required');
  if(Object.hasOwn(row,'value'))assert.ok(scalar(row.value),'Current fact must be a finite primitive');
  else{assert.ok(Array.isArray(row.oneOf)&&row.oneOf.length&&row.oneOf.every(scalar),'Explicit scalar alternatives required');
    assert.equal(new Set(row.oneOf.map(value=>JSON.stringify(value))).size,row.oneOf.length,'Duplicate current fact alternative');}
  if(Object.hasOwn(row,'explanation'))assert.ok(typeof row.explanation==='string'&&row.explanation.trim());
  return{key:row.key,...(Object.hasOwn(row,'value')?{value:row.value}:{oneOf:[...row.oneOf]}),reason:row.reason,
    ...(Object.hasOwn(row,'explanation')?{explanation:row.explanation}:{})};
}
export const J2_REQUIREMENTS=Object.freeze([...new Map([...fixture.sharedRequirements,...fixture.paths.flatMap(path=>path.requirements)]
  .map(projectJ2Requirement).map(row=>[JSON.stringify(row),row])).values()].map(row=>Object.freeze(row)));

export async function buildJ2Schemas(){
  const baselines=['schemas/administrative-procedure-catalog-v6.schema.json','schemas/release-manifest-v13.schema.json',
    'schemas/implementation/ap23i3/local-reference-manifest-v13.schema.json'];
  const originals=await Promise.all(baselines.map(load));
  const catalog=structuredClone(originals[0]);
  catalog.$id=J2_SCHEMA_IDS.catalog;catalog.title='AP23J2 proposed Kantonalverfahrenskatalog 7 with explicit opening policies';
  catalog.properties.$schema.const=catalog.$id;catalog.properties.formatVersion.const='7.0.0';
  catalog.properties.contractDecision.properties.id.const='DEC-2026-039';

  // One accepted historical MCP full-text mirror keeps its original reference
  // URL. This is neither an HTTP-domain allowance nor a current normative source.
  const index=await load('outputs/ap23j1-2026-10-27/sources/ju/source-bindings.json');
  const accepted=index.sources.find(row=>row.id==='AP23J1-JU-BGER2D55-2010');
  assert.equal(accepted?.url,J2_HISTORICAL_SOURCE_EXCEPTION.url);
  assert.equal(accepted.role,'supplementaryHistoricalJudgmentFullTextMirror');
  const mirror=structuredClone(catalog.$defs.source);
  for(const[key,value]of Object.entries(J2_HISTORICAL_SOURCE_EXCEPTION))mirror.properties[key]={const:value};
  catalog.$defs.sourceV7={oneOf:[{allOf:[{$ref:'#/$defs/source'},
    {not:{properties:{sourceId:{const:J2_HISTORICAL_SOURCE_EXCEPTION.sourceId}},required:['sourceId']}}]},mirror]};
  catalog.properties.sources.items={$ref:'#/$defs/sourceV7'};

  catalog.$defs.openingPolicyV7={oneOf:[
    object({kind:{const:'qualifiedCurrentTrigger'},triggerKind:en(J2_TRIGGER_KINDS),transformation:{const:'none'},sourceRefs:{$ref:'#/$defs/sourceRefs'}}),
    object({kind:{const:'geQualifiedOrOrdinaryPost'},factKey:{const:'openingMode'},
      allowedModes:{const:['qualifiedLegalOpening','ordinaryPostPhysicalReceipt']},
      ordinaryPostTransformation:{const:'nextWorkingDayIfNonWorkingReceipt'},holidayBinding:{const:'sameAsPath'},
      otherwise:{const:'block'},sourceRefs:{$ref:'#/$defs/sourceRefs'}})]};
  catalog.$defs.suspensionSelectionV7=object({kind:{const:'fixed'},suspensionProfileId:en(J2_PROFILE_IDS)});
  const path=structuredClone(catalog.$defs.path.oneOf.at(-1));
  path.properties.contractFamily={const:'qualifiedDayProcedureV7'};
  path.properties.duration={$ref:'#/$defs/duration'};
  path.properties.action=en(fixture.paths.map(item=>item.action));
  path.properties.urgencyPolicy={const:'notApplicable'};
  path.properties.qualification.properties.delivery={const:'qualifiedTriggerAccordingToOpeningPolicy'};
  path.properties.suspensionSelection={$ref:'#/$defs/suspensionSelectionV7'};
  path.properties.openingWarnings={type:'array',maxItems:0,items:false};
  path.required.push('openingPolicy');path.properties.openingPolicy={$ref:'#/$defs/openingPolicyV7'};
  path.properties.normTimeline.items.properties.researchBindingId=en(Object.values(fixture.temporalBindings).flatMap(rows=>rows.map(row=>row.id)));
  catalog.$defs.path.oneOf.push(path);

  catalog.$defs.qualificationPolicy.oneOf.push(object({pathId:id(),pathRevision:{type:'integer',minimum:1},pathSha256:hash(),
    mode:{const:'qualifiedDayProcedureV7'},requirements:{type:'array',minItems:1,uniqueItems:true,
      items:{oneOf:J2_REQUIREMENTS.map(row=>object(Object.fromEntries(Object.entries(row).map(([key,value])=>[key,{const:value}]))))}},
    openingChainPolicy:{const:'notApplicable'},localHolidayPolicy:{const:'notApplicable'}}));

  for(const[baseName,newName]of[['candidatePathEligibilityV6','candidatePathEligibilityV7'],['releasedPathEligibilityV6','releasedPathEligibilityV7']]){
    const entry=structuredClone(catalog.$defs[baseName]);
    entry.required.push('openingPolicySha256');entry.properties.openingPolicySha256=hash();
    entry.properties.suspensionProfiles={type:'array',minItems:1,maxItems:1,uniqueItems:true,
      items:object({suspensionProfileId:en(J2_PROFILE_IDS),sha256:hash()})};
    catalog.$defs[newName]=entry;
    const baseRef='#/$defs/'+baseName;
    const branch=catalog.properties.releaseBinding.oneOf.find(item=>item.properties.pathEligibility.items.oneOf?.some(row=>row.$ref===baseRef));
    assert.ok(branch,'Historical eligibility union not found');
    branch.properties.pathEligibility.items.oneOf.push({$ref:'#/$defs/'+newName});
  }
  const binding=structuredClone(catalog.$defs.holidayBinding.oneOf.find(item=>item.properties.bindingVersion?.const==='6.0.0'));
  assert.ok(binding,'Native V6 independent legal binding missing');
  binding.properties.bindingVersion={const:'7.0.0'};binding.properties.authoritySeatCanton=en(['FR','GE','JU']);
  binding.properties.anchor={const:'authoritySeat'};
  catalog.$defs.holidayBinding.oneOf.push(binding);

  const schemas={catalog};
  for(const[name,original]of[['manifest',originals[1]],['localManifest',originals[2]]]){
    const manifest=structuredClone(original);manifest.$id=J2_SCHEMA_IDS[name];
    manifest.title='AP23J2 proposed Manifest 14 '+name;manifest.properties.$schema.const=manifest.$id;
    manifest.properties.formatVersion.const='14.0.0';
    manifest.properties.compatibility.properties.minimumConsumerFormatVersion.const='14.0.0';
    Object.assign(manifest.properties.calendarIds,{minItems:35,maxItems:35});
    Object.assign(manifest.properties.artifacts,{minItems:44,maxItems:44});
    const artifact=manifest.properties.artifacts.items;
    artifact.properties.schemaId.enum=artifact.properties.schemaId.enum.map(value=>value===originals[0].$id?catalog.$id:value);
    artifact.allOf.find(item=>item.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=catalog.$id;
    schemas[name]=manifest;
  }

  // Only formal accepted current requirements are public facts. Synthetic fixture
  // conveniences and unrelated source metadata are not part of the input contract.
  const factValues=new Map();
  for(const row of J2_REQUIREMENTS){const values=factValues.get(row.key)??[];
    values.push(...(Object.hasOwn(row,'value')?[row.value]:row.oneOf));factValues.set(row.key,values);}
  for(const item of fixture.cases)for(const[key,value]of Object.entries(item.facts??{}))if(factValues.has(key))factValues.get(key).push(value);
  const facts={type:'object',additionalProperties:false,properties:Object.fromEntries([...factValues].map(([key,values])=>[key,en([
    ...values,...(values.some(value=>typeof value==='boolean')?[true,false]:[]),'unknown','other',null])]))};
  schemas.input={$schema:'https://json-schema.org/draft/2020-12/schema',$id:J2_SCHEMA_IDS.input,
    title:'AP23J2 current qualified trigger facts, never persistent defaults',...object({path:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'},
      pathRevision:{type:'integer',minimum:1},authoritySeatCanton:en(['FR','GE','JU','BE','CH','unknown']),
      trigger:{type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},days:{type:'integer',minimum:1,maximum:365},facts})};
  return{schemas,baselines:await Promise.all(baselines.map(async path=>({path,sha256:sha(await readFile(resolve(root,path)))})))};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'Use exactly --write or --check');
  const write=process.argv[2]==='--write',{schemas,baselines}=await buildJ2Schemas();
  if(write)await mkdir(resolve(root,directory),{recursive:true});
  const files=[];
  for(const[name,value]of Object.entries(schemas)){
    const path=J2_SCHEMA_FILES[name],text=JSON.stringify(value,null,2)+'\n';
    if(write)await writeFile(resolve(root,path),text);else assert.equal(await readFile(resolve(root,path),'utf8'),text,path);
    files.push({path,byteLength:Buffer.byteLength(text),sha256:sha(text)});
  }
  console.log(JSON.stringify({workPackage:'AP23J2',status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,
    nativeSchemasChanged:false,runtimeActive:false,formatDecision:false,sourceReleaseApproved:false},null,2));
}
