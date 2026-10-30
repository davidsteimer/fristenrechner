// SPDX-License-Identifier: AGPL-3.0-only
// Isolated L2 structural proposal. Native schemas and their historical branches stay immutable.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),directory='schemas/candidates/ap23l2';
const raw='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const L2_SCHEMA_FILES=Object.freeze({catalog:directory+'/administrative-procedure-catalog-v9.schema.json',manifest:directory+'/release-manifest-v16.schema.json',
 localManifest:directory+'/local-reference-manifest-v16.schema.json',input:directory+'/administrative-input-v9.schema.json'});
export const L2_SCHEMA_IDS=Object.freeze(Object.fromEntries(Object.entries(L2_SCHEMA_FILES).map(([key,path])=>[key,raw+path])));
export const L2_LAW_IDS=Object.freeze(['ai-general-administrative','sz-general-administrative']);
export const L2_PROFILE_IDS=Object.freeze(['ai-none','ai-three','sz-none','sz-three']);
export const L2_WINDOW=Object.freeze({from:'2026-08-29',to:'2027-12-31'});
export const L2_TRACKING_REQUIREMENTS=Object.freeze([
 {key:'expectedService',value:true,reason:'trackingExpectedServiceNotQualified'},
 {key:'entryIntoSphere',value:'verified',reason:'AI-B-TRACKING-ENTRY'},
 {key:'receiptHolidayRegime',value:'sameAsBoundAuthorityCalendar',reason:'AI-B-TRACKING-PLACE'}]);
const object=(properties,optional=[])=>({type:'object',additionalProperties:false,required:Object.keys(properties).filter(key=>!optional.includes(key)),properties});
const id=()=>({type:'string',pattern:'^[a-z][a-z0-9-]*$'}),hash=()=>({type:'string',pattern:'^[a-f0-9]{64}$'});
const date=()=>({type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'});
const en=values=>({enum:[...new Map(values.map(value=>[JSON.stringify(value),value])).values()]});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const load=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
export function projectL2Requirement(row){
 assert.ok(row&&typeof row==='object'&&!Array.isArray(row));assert.ok(typeof row.key==='string'&&row.key.trim());
 assert.notEqual(Object.hasOwn(row,'value'),Object.hasOwn(row,'oneOf'));
 const scalar=value=>typeof value==='string'||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value);
 assert.ok(Object.hasOwn(row,'value')?scalar(row.value):Array.isArray(row.oneOf)&&row.oneOf.length&&row.oneOf.every(scalar));
 assert.ok(typeof row.reason==='string'&&row.reason.trim());
 return{key:row.key,...(Object.hasOwn(row,'value')?{value:row.value}:{oneOf:[...row.oneOf]}),reason:row.reason,explanation:'Aktuelle Fachqualifikation '+row.key+'.'};
}
const exactRow=row=>object(Object.fromEntries(Object.entries(row).map(([key,value])=>[key,{const:value}])));
export async function buildL2Schemas(){
 const baselines=['schemas/administrative-procedure-catalog-v8.schema.json','schemas/release-manifest-v15.schema.json',
  'schemas/implementation/ap23k3/local-reference-manifest-v15.schema.json'];
 const originals=await Promise.all(baselines.map(load)),fixture=await load('docs/fachrecht/ap23l1/referenzfaelle.json');
 assert.equal(fixture.paths.length,31);assert.equal(fixture.cases.length,83);
 const rows=[...new Map(fixture.paths.flatMap(path=>path.requirements).map(projectL2Requirement).map(row=>[JSON.stringify(row),row])).values()];
 const conditional=L2_TRACKING_REQUIREMENTS.map(projectL2Requirement);
 const catalog=structuredClone(originals[0]);catalog.$id=L2_SCHEMA_IDS.catalog;catalog.title='AP23L2 proposed Kantonalverfahrenskatalog 9 for qualified AI and SZ procedures';
 catalog.properties.$schema.const=catalog.$id;catalog.properties.formatVersion.const='9.0.0';catalog.properties.contractDecision.properties.id.const='DEC-2026-041';
 const lawVariants=L2_LAW_IDS.map((lawId,index)=>{const law=structuredClone(catalog.$defs.law);law.properties.lawId={const:lawId};law.properties.canton={const:index===0?'AI':'SZ'};return law;});
 catalog.$defs.lawV9={oneOf:[{allOf:[{$ref:'#/$defs/lawV8'},{not:{properties:{lawId:en(L2_LAW_IDS)},required:['lawId']}}]},...lawVariants]};
 catalog.properties.laws.items={$ref:'#/$defs/lawV9'};
 const refs={$ref:'#/$defs/sourceRefs'};
 catalog.$defs.openingPolicyV9={oneOf:[
  object({kind:{const:'qualifiedCurrentTrigger'},triggerKind:{const:'qualifiedLegalOpening'},transformation:{const:'none'},sourceRefs:refs}),
  object({kind:{const:'aiQualifiedOrTrackingPost'},factKey:{const:'openingMode'},qualifiedMode:{const:'qualifiedLegalOpening'},trackingMode:{const:'trackingPhysicalReceipt'},
   qualifiedTransformation:{const:'none'},trackingTransformation:{const:'nextWorkingDayIfNonWorkingReceipt'},holidayBinding:{const:'sameAsPath'},otherwise:{const:'block'},
   trackingRequirements:{type:'array',minItems:3,maxItems:3,uniqueItems:true,items:{oneOf:conditional.map(exactRow)}},sourceRefs:refs})]};
 const oldDuration=catalog.$defs.duration.oneOf;
 catalog.$defs.durationV9={oneOf:[...structuredClone(oldDuration),
  object({kind:{const:'authorityOrderedDays'},minimum:{const:1},maximum:{const:10},boundMeaning:{const:'statutoryMaximumForCurrentOrder'}}),
  object({kind:{const:'qualifiedLongerNoticeDays'},valueFact:{const:'actualLongerInstructionDays'},ordinaryBaseFact:{const:'ordinaryStatutoryDays'},
   minimum:{const:31},maximum:{const:365},ordinaryBaseAllowed:en([[10,30],[7,30]]),
   qualificationFact:{const:'longerInstructionQualification'},qualifiedValue:{const:'aboveBothStatutoryAndThirty'},
   comparison:{const:'strictlyAboveOrdinaryBaseAndThirty'},boundMeaning:{const:'qualifiedCurrentInstructionWithTechnicalSafetyLimit'}})]};
 catalog.$defs.suspensionSelectionV9=object({kind:{const:'fixed'},suspensionProfileId:en(L2_PROFILE_IDS)});
 const path=structuredClone(catalog.$defs.path.oneOf.at(-1));path.properties.contractFamily={const:'qualifiedDayProcedureV9'};
 path.properties.lawId=en(L2_LAW_IDS);path.properties.action=en(fixture.paths.map(row=>row.requirements.find(req=>req.key==='actionQualification')?.value));
 assert.ok(path.properties.action.enum.every(value=>typeof value==='string'));
 path.properties.duration={$ref:'#/$defs/durationV9'};path.properties.openingPolicy={$ref:'#/$defs/openingPolicyV9'};
 path.properties.suspensionSelection={$ref:'#/$defs/suspensionSelectionV9'};
 path.properties.endShiftGuard=en(['none','blockWhenEnteringApplicableSuspension']);
 path.properties.normTimeline.items.properties.researchBindingId=en(['AI-NORMS-WINDOW','SZ-NORMS-PHASE1','SZ-NORMS-PHASE2']);
 catalog.$defs.path.oneOf.push(path);
 catalog.$defs.qualificationPolicy.oneOf.push(object({pathId:id(),pathRevision:{type:'integer',minimum:1},pathSha256:hash(),mode:{const:'qualifiedDayProcedureV9'},
  requirements:{type:'array',minItems:1,uniqueItems:true,items:{oneOf:rows.map(exactRow)}},openingChainPolicy:{const:'notApplicable'},localHolidayPolicy:{const:'boundProceduralCalendarSupplement'}}));
 const fixed=object({kind:{const:'fixedAuthoritySeat'},calendarId:id(),projectionId:id()});
 const none=object({kind:{const:'none'}});
 const local=object({kind:{const:'szSchwyzMartinstag'},effect:{const:'endShiftOnly'},coverage:{const:L2_WINDOW},authorityMunicipality:{const:'Schwyz'},
  dates:{const:['2026-11-11','2027-11-11']},sourceRefs:refs});
 catalog.$defs.proceduralCalendarSupplementV9={oneOf:[none,local]};
 const physicalSource=object({releaseId:{type:'string',minLength:1},references:{type:'array',minItems:3,maxItems:3,uniqueItems:true,items:{$ref:'#/$defs/physicalReference'}},eligibilityMeaning:{const:'physicalSourceOnlyNotFederalProcedurePermission'}});
 const binding=(canton,calendarId,supplement)=>object({holidayBindingId:{const:canton.toLowerCase()+'-qualified-authority-seat'},lawId:{const:canton.toLowerCase()+'-general-administrative'},
  authoritySeatCanton:{const:canton},authorityLevel:{const:'cantonal'},bindingVersion:{const:'9.0.0'},anchor:{const:'authoritySeat'},physicalSource,
  legalBinding:object({sourceRefs:refs,projectDecisionRef:{const:'DEC-2026-031'},roleUnion:{const:false},partyOrRepresentativeRequired:{const:false}}),
  calendarSelection:{...structuredClone(fixed),properties:{...structuredClone(fixed.properties),calendarId:{const:calendarId}}},
  proceduralCalendarSupplement:supplement});
 catalog.$defs.holidayBinding.oneOf.push(binding('AI','ap22-ai-f507435d8aa8',none),binding('SZ','ap22-sz-ec9f2c557fe4',local));
 for(const [baseName,newName]of[['candidatePathEligibilityV8','candidatePathEligibilityV9'],['releasedPathEligibilityV8','releasedPathEligibilityV9']]){
  const entry=structuredClone(catalog.$defs[baseName]);entry.required=entry.required.filter(key=>key!=='annualEndShiftPolicySha256');delete entry.properties.annualEndShiftPolicySha256;
  entry.required.push('proceduralCalendarSupplementSha256','durationPolicySha256');entry.properties.proceduralCalendarSupplementSha256=hash();entry.properties.durationPolicySha256=hash();
  entry.properties.suspensionProfiles.items.properties.suspensionProfileId=en(L2_PROFILE_IDS);catalog.$defs[newName]=entry;
  const branch=catalog.properties.releaseBinding.oneOf.find(row=>row.properties.pathEligibility.items.oneOf?.some(item=>item.$ref==='#/$defs/'+baseName));assert.ok(branch);
  branch.properties.pathEligibility.items.oneOf.push({$ref:'#/$defs/'+newName});
 }
 const schemas={catalog};
 for(const[name,original]of[['manifest',originals[1]],['localManifest',originals[2]]]){
  const manifest=structuredClone(original);manifest.$id=L2_SCHEMA_IDS[name];manifest.title='AP23L2 proposed Manifest 16 '+name;
  manifest.properties.$schema.const=manifest.$id;manifest.properties.formatVersion.const='16.0.0';manifest.properties.compatibility.properties.minimumConsumerFormatVersion.const='16.0.0';
  const artifact=manifest.properties.artifacts.items;artifact.properties.schemaId.enum=artifact.properties.schemaId.enum.map(value=>value===originals[0].$id?catalog.$id:value);
  artifact.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=catalog.$id;schemas[name]=manifest;
 }
 const factValues=new Map();
 for(const req of [...rows,...conditional]){const values=factValues.get(req.key)??[];values.push(...(Object.hasOwn(req,'value')?[req.value]:req.oneOf));factValues.set(req.key,values);}
 for(const item of fixture.cases)for(const[key,value]of Object.entries(item.facts))if(factValues.has(key))factValues.get(key).push(value);
 factValues.set('actualLongerInstructionDays',[...Array.from({length:365},(_,index)=>index+1)]);
 schemas.input={$schema:'https://json-schema.org/draft/2020-12/schema',$id:L2_SCHEMA_IDS.input,title:'AP23L2 explicit current AI/SZ facts',...object({
  path:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'},pathRevision:{type:'integer',minimum:1},authoritySeatCanton:en(['AI','SZ','BE','CH','unknown']),trigger:date(),days:{type:'integer',minimum:1,maximum:365},
  facts:object(Object.fromEntries([...factValues].map(([key,values])=>[key,en([...values,...(values.some(value=>typeof value==='boolean')?[true,false]:[]),'unknown','other',null])])),[...factValues.keys()])})};
 return{schemas,requirements:rows,conditionalRequirements:conditional,baselines:await Promise.all(baselines.map(async path=>({path,sha256:sha(await readFile(resolve(root,path)))})))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));const write=process.argv[2]==='--write',{schemas,baselines}=await buildL2Schemas();
 if(write)await mkdir(resolve(root,directory),{recursive:true});const files=[];
 for(const[name,schema]of Object.entries(schemas)){const path=L2_SCHEMA_FILES[name],text=JSON.stringify(schema,null,2)+'\n';if(write)await writeFile(resolve(root,path),text);else assert.equal(await readFile(resolve(root,path),'utf8'),text,path);files.push({path,byteLength:Buffer.byteLength(text),sha256:sha(text)});}
 console.log(JSON.stringify({workPackage:'AP23L2',status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,nativeSchemasChanged:false,formatDecision:false,runtimeActive:false,sourceReleaseApproved:false},null,2));
}
