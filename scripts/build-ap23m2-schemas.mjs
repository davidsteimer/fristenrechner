// SPDX-License-Identifier: AGPL-3.0-only
// Isolated M2 structural proposal. Native/historical V1-V9 schemas stay immutable.
// VD Art. 81 legality remains an explicit current professional qualification.
// The generic 365-day guard is not a statutory maximum or a numeric Art. 81 proof.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url)),directory='schemas/candidates/ap23m2';
const raw='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const M2_SCHEMA_FILES=Object.freeze({catalog:directory+'/administrative-procedure-catalog-v10.schema.json',manifest:directory+'/release-manifest-v17.schema.json',
 localManifest:directory+'/local-reference-manifest-v17.schema.json',input:directory+'/administrative-input-v10.schema.json'});
export const M2_SCHEMA_IDS=Object.freeze(Object.fromEntries(Object.entries(M2_SCHEMA_FILES).map(([key,path])=>[key,raw+path])));
export const M2_LAW_IDS=Object.freeze(['ne-general-administrative','vd-general-administrative','vs-general-administrative']);
export const M2_PROFILE_IDS=Object.freeze(['ne-three','vd-none','vd-three','vs-none','vs-three']);
export const M2_WINDOW=Object.freeze({from:'2026-08-29',to:'2027-12-31'});
export const M2_POSTAL_REQUIREMENTS=Object.freeze([
 {key:'unsignedPostalService',value:'lawfullyPermittedAndNoSignatureRequired',reason:'VD-B-POSTAL-SCOPE'},
 {key:'entryIntoRecipientSphere',value:'verified',reason:'VD-B-POSTAL-ENTRY'}]);
export const M2_CALENDAR_IDS=Object.freeze({neGeneral:'ap22-ne-027ceadbf103',neLanderon:'ap22-ne-21f519039621',vd:'ap22-vd-26f452ff34ee',vs:'ap22-vs-6c002f32b1b0'});
export const M2_REGION_CASES=Object.freeze([
 Object.freeze({value:'neWithoutLeLanderon',calendarId:M2_CALENDAR_IDS.neGeneral,projectionId:'projection-027ceadbf10392aa'}),
 Object.freeze({value:'leLanderon',calendarId:M2_CALENDAR_IDS.neLanderon,projectionId:'projection-21f519039621689a'})]);
const object=(properties,optional=[])=>({type:'object',additionalProperties:false,required:Object.keys(properties).filter(key=>!optional.includes(key)),properties});
const id=()=>({type:'string',pattern:'^[a-z][a-z0-9-]*$'}),hash=()=>({type:'string',pattern:'^[a-f0-9]{64}$'});
const date=()=>({type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'});
const en=values=>({enum:[...new Map(values.map(value=>[JSON.stringify(value),value])).values()]});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const load=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
export function projectM2Requirement(row){
 assert.ok(row&&typeof row==='object'&&!Array.isArray(row));assert.ok(typeof row.key==='string'&&row.key.trim());
 assert.notEqual(Object.hasOwn(row,'value'),Object.hasOwn(row,'oneOf'));
 const scalar=value=>typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
 assert.ok(Object.hasOwn(row,'value')?scalar(row.value):Array.isArray(row.oneOf)&&row.oneOf.length&&row.oneOf.every(scalar));
 assert.ok(typeof row.reason==='string'&&row.reason.trim());
 return{key:row.key,...(Object.hasOwn(row,'value')?{value:row.value}:{oneOf:[...row.oneOf]}),reason:row.reason,explanation:'Aktuelle Fachqualifikation '+row.key+'.'};
}
const exactRow=row=>object(Object.fromEntries(Object.entries(row).map(([key,value])=>[key,{const:value}])));

export async function buildM2Schemas(){
 const baselines=['schemas/administrative-procedure-catalog-v9.schema.json','schemas/release-manifest-v16.schema.json',
  'schemas/implementation/ap23l3/local-reference-manifest-v16.schema.json'];
 const originals=await Promise.all(baselines.map(load)),fixture=await load('docs/fachrecht/ap23m1/referenzfaelle.json');
 assert.equal(fixture.paths.length,49);assert.equal(fixture.cases.length,109);assert.deepEqual(fixture.window,M2_WINDOW);
 const rows=[...new Map(fixture.paths.flatMap(path=>path.requirements).map(projectM2Requirement).map(row=>[JSON.stringify(row),row])).values()];
 const conditional=M2_POSTAL_REQUIREMENTS.map(projectM2Requirement);
 for(const path of fixture.paths.filter(path=>path.canton==='VD'))assert.deepEqual(path.opening.trackingRequirements,M2_POSTAL_REQUIREMENTS);
 const catalog=structuredClone(originals[0]);catalog.$id=M2_SCHEMA_IDS.catalog;catalog.title='AP23M2 proposed Kantonalverfahrenskatalog 10 for qualified NE, VD and VS procedures';
 catalog.properties.$schema.const=catalog.$id;catalog.properties.formatVersion.const='10.0.0';catalog.properties.contractDecision.properties.id.const='DEC-2026-042';
 const lawVariants=M2_LAW_IDS.map((lawId,index)=>{const law=structuredClone(catalog.$defs.law);law.properties.lawId={const:lawId};law.properties.canton={const:['NE','VD','VS'][index]};return law;});
 catalog.$defs.lawV10={oneOf:[{allOf:[{$ref:'#/$defs/lawV9'},{not:{properties:{lawId:en(M2_LAW_IDS)},required:['lawId']}}]},...lawVariants]};
 catalog.properties.laws.items={$ref:'#/$defs/lawV10'};
 const refs={$ref:'#/$defs/sourceRefs'};
 const qualified=object({kind:{const:'qualifiedCurrentTrigger'},triggerKind:{const:'qualifiedLegalOpening'},transformation:{const:'none'},sourceRefs:refs});
 const postal=object({kind:{const:'vdQualifiedOrUnsignedPost'},factKey:{const:'openingMode'},qualifiedMode:{const:'qualifiedLegalOpening'},trackingMode:{const:'vdUnsignedPostalReceipt'},
  qualifiedTransformation:{const:'none'},trackingTransformation:{const:'nextWorkingDayIfNonWorkingReceipt'},holidayBinding:{const:'sameAsPath'},otherwise:{const:'block'},
  trackingRequirements:{type:'array',minItems:2,maxItems:2,uniqueItems:true,items:{oneOf:conditional.map(exactRow)}},sourceRefs:refs});
 catalog.$defs.openingPolicyV10={oneOf:[qualified,postal]};
 const vsLonger=object({kind:{const:'qualifiedVsLongerNoticeDays'},valueFact:{const:'actualInstructionDays'},ordinaryBaseFact:{const:'ordinaryDays'},
  minimum:{const:1},maximum:{const:365},ordinaryBaseAllowed:{const:[10,30]},comparison:{const:'strictlyAboveOrdinaryBase'},
  boundMeaning:{const:'qualifiedCurrentInstructionWithTechnicalSafetyLimit'}});
 catalog.$defs.durationV10={oneOf:[...structuredClone(catalog.$defs.duration.oneOf),vsLonger]};
 catalog.$defs.suspensionSelectionV10=object({kind:{const:'fixed'},suspensionProfileId:en(M2_PROFILE_IDS)});
 const path=structuredClone(catalog.$defs.path.oneOf.at(-1));path.properties.contractFamily={const:'qualifiedDayProcedureV10'};
 path.properties.lawId=en(M2_LAW_IDS);path.properties.action=en(fixture.paths.map(row=>row.requirements.find(req=>req.key==='actionQualification')?.value));
 assert.ok(path.properties.action.enum.every(value=>typeof value==='string'));
 path.properties.duration={$ref:'#/$defs/durationV10'};path.properties.openingPolicy={$ref:'#/$defs/openingPolicyV10'};
 path.properties.suspensionSelection={$ref:'#/$defs/suspensionSelectionV10'};path.properties.endShiftGuard=en(['none','blockWhenEnteringApplicableSuspension']);
 path.properties.normTimeline.items.properties.researchBindingId=en(['NE-NORMS-WINDOW','VD-NORMS-WINDOW','VS-NORMS-WINDOW']);
 // The new closed family cannot borrow VD raw-post service for NE or VS, nor
 // import an unrelated new recess. Historic family branches are not relaxed.
 path.allOf=[...(path.allOf??[]),...M2_LAW_IDS.map((lawId,index)=>({if:{properties:{lawId:{const:lawId}},required:['lawId']},then:{properties:{
  openingPolicy:index===1?postal:qualified,
  suspensionSelection:object({kind:{const:'fixed'},suspensionProfileId:en(index===0?['ne-three']:index===1?['vd-none','vd-three']:['vs-none','vs-three'])})
 }}})),{if:{properties:{lawId:{enum:['ne-general-administrative','vd-general-administrative']}},required:['lawId']},then:{properties:{duration:{$ref:'#/$defs/duration'}}}}];
 catalog.$defs.path.oneOf.push(path);
 catalog.$defs.qualificationPolicy.oneOf.push(object({pathId:id(),pathRevision:{type:'integer',minimum:1},pathSha256:hash(),mode:{const:'qualifiedDayProcedureV10'},
  requirements:{type:'array',minItems:1,uniqueItems:true,items:{oneOf:rows.map(exactRow)}},openingChainPolicy:{const:'notApplicable'},localHolidayPolicy:{const:'boundProceduralCalendarSupplement'}}));
 const none=object({kind:{const:'none'}});
 catalog.$defs.proceduralCalendarSupplementV10=structuredClone(none);
 const fixed=(calendarId,projectionId)=>object({kind:{const:'fixedAuthoritySeat'},calendarId:{const:calendarId},projectionId:{const:projectionId}});
 const region=object({kind:{const:'qualifiedAuthoritySeatRegion'},factKey:{const:'authorityHolidayRegion'},otherwise:{const:'block'},defaultAllowed:{const:false},cases:{const:M2_REGION_CASES}});
 catalog.$defs.calendarSelectionV10={oneOf:[region,fixed(M2_CALENDAR_IDS.neGeneral,'projection-027ceadbf10392aa'),fixed(M2_CALENDAR_IDS.vd,'projection-26f452ff34ee3e73'),fixed(M2_CALENDAR_IDS.vs,'projection-6c002f32b1b0461b')]};
 const physicalSource=count=>object({releaseId:{type:'string',minLength:1},references:{type:'array',minItems:count,maxItems:count,uniqueItems:true,items:{$ref:'#/$defs/physicalReference'}},eligibilityMeaning:{const:'physicalSourceOnlyNotFederalProcedurePermission'}});
 const binding=(canton,bindingId,calendarSelection,count=3)=>object({holidayBindingId:{const:bindingId},lawId:{const:canton.toLowerCase()+'-general-administrative'},
  authoritySeatCanton:{const:canton},authorityLevel:{const:'cantonal'},bindingVersion:{const:'10.0.0'},anchor:{const:'authoritySeat'},physicalSource:physicalSource(count),
  legalBinding:object({sourceRefs:refs,projectDecisionRef:{const:'DEC-2026-031'},roleUnion:{const:false},partyOrRepresentativeRequired:{const:false}}),
  calendarSelection,proceduralCalendarSupplement:none});
 catalog.$defs.holidayBinding.oneOf.push(
  binding('NE','ne-admin-qualified-authority-seat',region,4),
  binding('NE','ne-court-qualified-authority-seat',fixed(M2_CALENDAR_IDS.neGeneral,'projection-027ceadbf10392aa')),
  binding('VD','vd-qualified-authority-seat',fixed(M2_CALENDAR_IDS.vd,'projection-26f452ff34ee3e73')),
  binding('VS','vs-qualified-authority-seat',fixed(M2_CALENDAR_IDS.vs,'projection-6c002f32b1b0461b')));
 for(const[baseName,newName]of[['candidatePathEligibilityV9','candidatePathEligibilityV10'],['releasedPathEligibilityV9','releasedPathEligibilityV10']]){
  const entry=structuredClone(catalog.$defs[baseName]);entry.properties.suspensionProfiles.items.properties.suspensionProfileId=en(M2_PROFILE_IDS);catalog.$defs[newName]=entry;
  const branch=catalog.properties.releaseBinding.oneOf.find(row=>row.properties.pathEligibility.items.oneOf?.some(item=>item.$ref==='#/$defs/'+baseName));assert.ok(branch);
  branch.properties.pathEligibility.items.oneOf.push({$ref:'#/$defs/'+newName});
 }
 const schemas={catalog};
 for(const[name,original]of[['manifest',originals[1]],['localManifest',originals[2]]]){
  const manifest=structuredClone(original);manifest.$id=M2_SCHEMA_IDS[name];manifest.title='AP23M2 proposed Manifest 17 '+name;
  manifest.properties.$schema.const=manifest.$id;manifest.properties.formatVersion.const='17.0.0';manifest.properties.compatibility.properties.minimumConsumerFormatVersion.const='17.0.0';
  const artifact=manifest.properties.artifacts.items;artifact.properties.schemaId.enum=artifact.properties.schemaId.enum.map(value=>value===originals[0].$id?catalog.$id:value);
  artifact.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=catalog.$id;schemas[name]=manifest;
 }
 const factValues=new Map();
 for(const req of[...rows,...conditional]){const values=factValues.get(req.key)??[];values.push(...(Object.hasOwn(req,'value')?[req.value]:req.oneOf));factValues.set(req.key,values);}
 factValues.set('authorityHolidayRegion',M2_REGION_CASES.map(row=>row.value));
 for(const item of fixture.cases)for(const[key,value]of Object.entries(item.facts))if(factValues.has(key))factValues.get(key).push(value);
 factValues.set('actualInstructionDays',Array.from({length:365},(_,index)=>index+1));
 schemas.input={$schema:'https://json-schema.org/draft/2020-12/schema',$id:M2_SCHEMA_IDS.input,title:'AP23M2 explicit current NE/VD/VS facts',...object({
  path:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'},pathRevision:{type:'integer',minimum:1},authoritySeatCanton:en(['NE','VD','VS','BE','CH','unknown']),trigger:date(),days:{type:'integer',minimum:1,maximum:365},
  facts:object(Object.fromEntries([...factValues].map(([key,values])=>[key,en([...values,...(values.some(value=>typeof value==='boolean')?[true,false]:[]),'unknown','other',null])])),[...factValues.keys()])})};
 return{schemas,requirements:rows,conditionalRequirements:conditional,baselines:await Promise.all(baselines.map(async path=>({path,sha256:sha(await readFile(resolve(root,path)))})))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));const write=process.argv[2]==='--write',{schemas,baselines}=await buildM2Schemas();
 if(write)await mkdir(resolve(root,directory),{recursive:true});const files=[];
 for(const[name,schema]of Object.entries(schemas)){const path=M2_SCHEMA_FILES[name],text=JSON.stringify(schema,null,2)+'\n';if(write)await writeFile(resolve(root,path),text);else assert.equal(await readFile(resolve(root,path),'utf8'),text,path);files.push({path,byteLength:Buffer.byteLength(text),sha256:sha(text)});}
 console.log(JSON.stringify({workPackage:'AP23M2',status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,nativeSchemasChanged:false,formatDecision:false,runtimeActive:false,sourceReleaseApproved:false},null,2));
}
