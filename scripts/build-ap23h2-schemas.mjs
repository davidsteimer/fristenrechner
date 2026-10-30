// SPDX-License-Identifier: AGPL-3.0-only
// Closed isolated proposal. Never changes native or accepted schemas.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const dir='schemas/candidates/ap23h2',raw='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const H2_SCHEMA_FILES={catalog:dir+'/administrative-procedure-catalog-v5.schema.json',manifest:dir+'/release-manifest-v12.schema.json',
  localManifest:dir+'/local-reference-manifest-v12.schema.json',input:dir+'/administrative-input-v5.schema.json'};
export const H2_SCHEMA_IDS=Object.fromEntries(Object.entries(H2_SCHEMA_FILES).map(([k,p])=>[k,raw+p]));
const obj=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const id=()=>({type:'string',pattern:'^[a-z][a-z0-9-]*$'}),hash=()=>({type:'string',pattern:'^[a-f0-9]{64}$'});
const en=values=>({enum:[...new Set(values)]});
const sha=b=>createHash('sha256').update(b).digest('hex');
const load=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const fixture=await load('docs/fachrecht/ap23h1/referenzfaelle.json');
export const H2_REQUIREMENTS=[...new Map([...fixture.sharedRequirements,...fixture.paths.flatMap(p=>p.requirements)]
  .map(r=>[JSON.stringify(r),r])).values()];
export async function buildH2Schemas(){
  const paths=['schemas/administrative-procedure-catalog-v4.schema.json','schemas/release-manifest-v11.schema.json',
    'schemas/implementation/ap23g3/local-reference-manifest-v11.schema.json'];
  const originals=await Promise.all(paths.map(load));
  const catalog=structuredClone(originals[0]);catalog.$id=H2_SCHEMA_IDS.catalog;
  catalog.title='AP23H2 proposed Kantonalverfahrenskatalog 5';catalog.properties.$schema.const=catalog.$id;
  catalog.properties.formatVersion.const='5.0.0';catalog.properties.contractDecision.properties.id.const='DEC-2026-037';
  const v5=structuredClone(catalog.$defs.path.oneOf[2]);
  v5.required.push('contractFamily');v5.properties.contractFamily={const:'qualifiedDayProcedureV5'};
  v5.properties.action=en(fixture.paths.map(p=>p.action));
  v5.properties.normTimeline.items.required.push('researchBindingId');
  v5.properties.normTimeline.items.properties.researchBindingId=en(Object.values(fixture.temporalBindings).flatMap(x=>x.map(t=>t.id)));
  catalog.$defs.path.oneOf.push(v5);
  const requiredRow={oneOf:H2_REQUIREMENTS.map(r=>obj({key:{const:r.key},value:{const:r.value},reason:{const:r.reason}}))};
  catalog.$defs.qualificationPolicy.oneOf.push(obj({pathId:id(),pathRevision:{type:'integer',minimum:1},pathSha256:hash(),
    mode:{const:'qualifiedDayProcedureV5'},requirements:{type:'array',minItems:1,uniqueItems:true,items:requiredRow},
    openingChainPolicy:en(['requireOriginalOrTimelyRequestedReasons','notApplicable']),
    localHolidayPolicy:{const:'blockConcreteUnresolvedAdditionalEndEffect'}}));
  const binding=structuredClone(catalog.$defs.holidayBinding.oneOf[0]);
  binding.required.push('bindingVersion','projectionEvidence');binding.properties.bindingVersion={const:'5.0.0'};
  binding.properties.anchor=en(['authoritySeat','courtSeat']);
  Object.assign(binding.properties.physicalBaseline.properties.references,{minItems:4,maxItems:4});
  binding.properties.projectionEvidence=obj({kind:{const:'proceduralSupplementProjection'},baselineReleaseId:structuredClone(binding.properties.physicalBaseline.properties.releaseId),
    baselineCalendarId:id(),baselineCalendarSha256:hash(),baselineCatalogSha256:hash(),baseScopeId:en(['OW-RTG-ALL','NW-RTG-ALL']),
    supplementScopeIds:{type:'array',minItems:1,maxItems:1,items:en(['OW-PROCEDURAL-ALL','NW-PROCEDURAL-ALL'])},
    newRuleIds:{type:'array',minItems:4,maxItems:4,uniqueItems:true,items:{type:'string',minLength:1}},
    catalogRuleIds:{type:'array',minItems:18,maxItems:18,uniqueItems:true,items:{type:'string',minLength:1}},
    permissionInheritance:{const:'none'},legalScope:en(['OW-ADMIN','OW-COURT','NW-ADMIN','NW-COURT']),
    legalInterpretation:en(['directCourtStatute','systematicAdministrativeTransferConfirmedH1D','directVRG34'])});
  catalog.$defs.holidayBinding.oneOf.push(binding);
  const schemas={catalog};
  for(const[name,original]of[['manifest',originals[1]],['localManifest',originals[2]]]){
    const s=structuredClone(original);s.$id=H2_SCHEMA_IDS[name];s.title='AP23H2 proposed Manifest 12 '+name;
    s.properties.$schema.const=s.$id;s.properties.formatVersion.const='12.0.0';
    s.properties.compatibility.properties.minimumConsumerFormatVersion.const='12.0.0';
    Object.assign(s.properties.calendarIds,{minItems:35,maxItems:35});
    Object.assign(s.properties.artifacts,{minItems:44,maxItems:44});
    const artifact=s.properties.artifacts.items;
    artifact.properties.schemaId.enum=artifact.properties.schemaId.enum.map(v=>v===originals[0].$id?catalog.$id:v);
    artifact.allOf.find(x=>x.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=catalog.$id;
    schemas[name]=s;
  }
  const factValues=new Map();
  for(const facts of[fixture.sharedSyntheticFacts,...fixture.paths.map(p=>p.syntheticFacts)])
    for(const[k,v]of Object.entries(facts)){const list=factValues.get(k)??[];list.push(v);factValues.set(k,list);}
  for(const item of fixture.cases)for(const[k,v]of Object.entries(item.facts??{}))
    if(factValues.has(k))factValues.get(k).push(v);
  const facts={type:'object',additionalProperties:false,properties:Object.fromEntries([...factValues].map(([k,values])=>[k,en([
    ...values,...(values.some(v=>typeof v==='boolean')?[true,false]:[]),'unknown','other',null])]))};
  // Missing and unknown current facts stay representable and fail positive qualification.
  schemas.input={$schema:'https://json-schema.org/draft/2020-12/schema',$id:H2_SCHEMA_IDS.input,
    title:'AP23H2 explicit current research facts not persistent defaults',...obj({path:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'},
      pathRevision:{type:'integer',minimum:1},authoritySeatCanton:en(['OW','NW','BE','CH','unknown']),
      trigger:{type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},days:{type:'integer',minimum:1,maximum:365},facts})};
  return{schemas,baselines:await Promise.all(paths.map(async path=>({path,sha256:sha(await readFile(resolve(root,path)))})))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const write=process.argv.includes('--write'),{schemas,baselines}=await buildH2Schemas(),files=[];
  if(write)await mkdir(resolve(root,dir),{recursive:true});
  for(const[name,value]of Object.entries(schemas)){const path=H2_SCHEMA_FILES[name],bytes=JSON.stringify(value,null,2)+'\n';
    if(write)await writeFile(resolve(root,path),bytes);else assert.equal(await readFile(resolve(root,path),'utf8'),bytes,path);
    files.push({path,sha256:sha(bytes)});}
  console.log(JSON.stringify({status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,runtimeActive:false},null,2));
}
