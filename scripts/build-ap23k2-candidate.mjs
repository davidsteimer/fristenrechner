// SPDX-License-Identifier: AGPL-3.0-only
// Isolated K2 contract candidate. Never mutates accepted research, native schemas or product code.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,safeRelative} from './prepare-ap23k2.mjs';
import {K2_SCHEMA_IDS,projectK2Requirement} from './build-ap23k2-schemas.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const BASE='data/candidates/2026-10-27-ap23j3';
export const OUTPUT='outputs/ap23k2-candidate-2026-10-27';
export const QA_OUTPUT='outputs/ap23k2-2026-10-27';
export const ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const HOLIDAYS='holiday-catalogs/ch-holiday-catalog.json';
export const RELEASE='2026-10-27-ap23k2-reference.1';
export const RESEARCH='docs/fachrecht/ap23k1/referenzfaelle.json';
export const WINDOW={from:'2026-08-29',to:'2027-12-31'};
export const GUARD='outputs/ap23k2-2026-10-27/protected-inputs.json';
export const GUARD_SHA256='87bce79b661302e4e94091d3664a77c922411782bed38c9f986d6a99f5d2492b';
export const ACCEPTED_RECEIPT='outputs/ap23k1-abnahme-2026-10-27/receipt.json';
export const sha=value=>createHash('sha256').update(value).digest('hex');
export const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?
  '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
export const objSha=value=>sha(canonical(value));
export const encode=value=>JSON.stringify(value,null,2)+'\n';
const read=path=>readFile(resolve(ROOT,path));
const guard=JSON.parse(await exact(ROOT,GUARD,GUARD_SHA256));
assert.equal(guard.workPackage,'AP23K2');assert.equal(guard.capturedBeforeTechnicalWrites,true);
assert.equal(guard.k1ProfessionallyAccepted,true);assert.equal(Object.keys(guard.files).length,6612);
for(const key of ['formatDecision','productCodeChangePermission','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(guard[key],false,key);
export async function readFixed(path){safeRelative(path);assert.ok(Object.hasOwn(guard.files,path),'Input outside frozen K2 guard: '+path);return exact(ROOT,path,guard.files[path]);}
const json=async path=>JSON.parse(await readFixed(path));
export const CANTONS='ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ');
export const DEFINITIONS={
 BS:{lawId:'bs-general-administrative',title:'Allgemeines Verwaltungsverfahren Basel-Stadt, OG und VRPG',calendarId:'ap22-bs-39a64bdfc0fe',
  statuteIds:['K1-BS-OG-20210101','K1-BS-VRPG-20210101'],holidaySources:['K1-BS-OG-20210101','K1-BS-RLG-20200701','K1-BS-STG-20260101','K1-BS-EUFRUEB-20110101','K1-BS-VD2019196']},
 BL:{lawId:'bl-general-administrative',title:'Allgemeines Verwaltungsverfahren Basel-Landschaft, VwVG BL und VPO',calendarId:'ap22-bl-72f1a7e0fcf8',
  statuteIds:['K1-BL-VWVG-20240801','K1-BL-VPO-20240101'],holidaySources:['K1-BL-GOG-20200101','K1-BL-RTG-20191201','K1-BL-RRB2025-51','K1-BL-OVERVIEW2026','K1-BL-RRB2026-217','K1-BL-OVERVIEW2027']}
};
export const sourceId=id=>(id.includes('-VD20')||id.includes('-KGE')?'JUD-':'SRC-')+id;
export function stagesFor(path){const crosswalk={initialAdministration:'administration',internalAppeal:'administrativeAppeal',courtAppeal:'court',administrativeAppeal:'administrativeAppeal',administrativeCourt:'court'};assert.ok(crosswalk[path.stage],'Unmapped K1 stage '+path.stage);return[crosswalk[path.stage]];}
export const durationFor=path=>path.days===null?{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}:{kind:'statutoryDays',value:path.days,overridable:false};
export const bindingIdFor=path=>path.canton==='BL'?'bl-authority-seat':path.calendarBinding.type==='fact'?'bs-party-representative':'bs-authority-seat';
export const selectionFor=path=>({kind:'fixed',suspensionProfileId:path.canton.toLowerCase()+'-none'});
export function eligibilityFor(path,policy,catalog){
 const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId);assert.ok(binding);
 const profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===path.suspensionSelection.suspensionProfileId);assert.ok(profile);
 return{status:'candidate',pathId:path.pathId,pathRevision:path.revision,pathSha256:objSha(path),holidayBindingId:binding.holidayBindingId,
  holidayBindingSha256:objSha(binding),suspensionSelectionSha256:objSha(path.suspensionSelection),suspensionProfiles:[{suspensionProfileId:profile.suspensionProfileId,sha256:objSha(profile)}],
  openingPolicySha256:objSha(path.openingPolicy),calendarSelectionSha256:objSha(binding.calendarSelection),annualEndShiftPolicySha256:objSha(binding.annualEndShiftPolicy),
  qualificationPolicySha256:objSha(policy),caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};
}
export async function buildK2Candidate(){
 const receipt=await json(ACCEPTED_RECEIPT);assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.k2Started,true);assert.equal(receipt.formatDecision,false);
 const manifest0=await json(BASE+'/manifest.json'),files=new Map();assert.equal(manifest0.formatVersion,'14.0.0');assert.equal(manifest0.artifacts.length,44);
 for(const descriptor of manifest0.artifacts){const bytes=await readFixed(BASE+'/'+descriptor.path);assert.equal(sha(bytes),descriptor.sha256);assert.equal(bytes.length,descriptor.byteLength);files.set(descriptor.path,bytes.toString('utf8'));}
 const old=JSON.parse(files.get(ADMIN)),holidayCatalog=JSON.parse(files.get(HOLIDAYS)),research=await json(RESEARCH);
 assert.equal(old.paths.length,149);assert.equal(research.paths.length,16);assert.equal(research.cases.length,67);
 const befunde=Object.fromEntries(await Promise.all(['bs','bl'].map(async code=>[code.toUpperCase(),await json('docs/fachrecht/ap23k1/befund-'+code+'.json')])));
 const registers=Object.fromEntries(await Promise.all(['bs','bl'].map(async code=>[code.toUpperCase(),await json('outputs/ap23k1-2026-10-27/sources/'+code+'/source-bindings.json')])));
 for(const model of research.sourceModels)assert.equal(sha(await readFixed(model.path)),model.sha256);
 const crosswalk=[];
 for(const [canton,register] of Object.entries(registers))for(const row of register.sources.filter(row=>!row.id.includes('-EVIDENCE-')&&!row.id.endsWith('-METADATA'))){
  const path=register.sourceBase+'/'+row.file,bytes=await readFixed(path);assert.equal(sha(bytes),row.sha256);assert.equal(bytes.length,row.bytes);
  const kind=row.id.includes('-VD20')||row.id.includes('-KGE')?'judgment':row.id.includes('COURT-PRACTICAL')||row.id.includes('OVERVIEW')||row.id.includes('RRB')?'officialMaterials':'statute';
  crosswalk.push({researchSourceId:row.id,catalogSourceId:sourceId(row.id),canton,kind,url:row.url,researchRole:row.role,
   readingScope:row.readingScope??row.read,versionDescription:row.title??row.finding??row.id,
   evidence:[{path,sha256:row.sha256,byteLength:row.bytes}],roleLimit:row.finding??row.readingScope??row.read,
   sourcePromotion:false,meaning:'Exact accepted K1 role only. Annual specifications, limited mirrors, history and analogies do not become blanket procedural permission.'});
 }
 assert.equal(crosswalk.length,27);assert.equal(new Set(crosswalk.map(row=>row.catalogSourceId)).size,27);
 const sourceMap=new Map(crosswalk.map(row=>[row.researchSourceId,row]));
 const ref=(id,locator)=>{const source=sourceMap.get(id);assert.ok(source,'Unprojected accepted K1 source '+id);return{sourceId:source.catalogSourceId,locator:locator??source.readingScope};};
 const refs=ids=>[...new Set(ids)].map(id=>ref(id));
 const sourceRows=crosswalk.map(row=>({sourceId:row.catalogSourceId,kind:row.kind,url:row.url,versionDescription:row.versionDescription,
  reviewedOn:'2026-10-27',reviewBasis:'AP23K1 K1-A bis K1-G fachlich abgenommen. Isolierte K2-Vertragsprobe, keine gemeinsame Quellenreleasefreigabe. Rolle: '+row.researchRole,locators:row.readingScope}));
 const catalog=structuredClone(old);
 Object.assign(catalog,{$schema:K2_SCHEMA_IDS.catalog,formatVersion:'8.0.0',contractStatus:'proposed',runtimeActive:false,
  contractDecision:{id:'DEC-2026-040',status:'proposed',on:null},review:{checkedOn:'2026-10-27',basis:'149 alte Fachpfade und alle historischen Fachobjekte unverändert. 16 fachlich abgenommene BS-/BL-Gruppen als isolierter Vorschlag.',sourceReview:'Keine gemeinsame Quellenreleasefreigabe. Physischer Feiertagsbestand unverändert. Jährliche BL-Büroschlüsse sind nur endtagsrelevant.'}});
 catalog.sources.push(...sourceRows);
 const descriptors=new Map(manifest0.artifacts.map(row=>[row.contentId,structuredClone(row)]));
 const physicalRefs=ids=>[...new Set([...ids,'ch-federal-calendar','ch-holiday-catalog'])].map(id=>{const item=descriptors.get(id);assert.ok(item,'Missing physical reference '+id);return{role:item.role,contentId:id,sha256:item.sha256,path:item.path};});
 const projection=id=>{const value=holidayCatalog.activation.projections.find(row=>row.id===id);assert.ok(value,'Missing projection '+id);return value;};
 const vwvgBindings=holidayCatalog.activation.procedureBindings.filter(row=>row.profileId==='vwvg');assert.equal(vwvgBindings.length,26);
 const terminals=vwvgBindings.map(binding=>({canton:binding.jurisdiction.slice(3),bindingId:binding.id,bindingSha256:objSha(binding),requiredAreaScopeIds:[...binding.requiredAreaScopeIds],
  variants:binding.variants.map(variant=>{const p=projection(variant.projectionId);return{areaFacts:structuredClone(variant.areaFacts),projectionId:p.id,projectionSha256:objSha(p),calendarId:p.calendarId,
   alternativeProjectionId:variant.alternativeProjectionId,alternativeProjectionSha256:variant.alternativeProjectionId===null?null:objSha(projection(variant.alternativeProjectionId))};}),
  boundaryIds:[...binding.boundaryIds],ambiguity:structuredClone(binding.ambiguity)}));
 assert.equal(terminals.reduce((n,row)=>n+row.variants.length,0),28);
 const dynamicCalendarIds=[...new Set(terminals.flatMap(row=>row.variants.flatMap(variant=>[variant.calendarId,...variant.alternativeProjectionId?[projection(variant.alternativeProjectionId).calendarId]:[]])))];assert.equal(dynamicCalendarIds.length,29);
 const annualDates=research.officeClosures['BL-ANNUAL'].dates;
 const annualPolicy={kind:'blCantonalOfficeClosures',effect:'endShiftOnly',coverage:{...WINDOW},years:[2026,2027].map(year=>({year,
  coverage:{from:year===2026?WINDOW.from:'2027-01-01',to:year+'-12-31'},dates:annualDates.filter(date=>date.startsWith(year+'-')),
  sourceRefs:refs(['K1-BL-GOG-20200101',year===2026?'K1-BL-RRB2025-51':'K1-BL-RRB2026-217',year===2026?'K1-BL-OVERVIEW2026':'K1-BL-OVERVIEW2027'])})),
  uncertainty:{boundaryId:'BL-B-FASNACHT',dates:['2027-02-09'],comparison:'twoCompleteAdministrativePaths',onDifference:'blockDefinitiveResultAndExport',onEqual:'sameResult',inputOverride:'forbidden',sourceRefs:refs(['K1-BL-GOG-20200101','K1-BL-OVERVIEW2027'])}};
 for(const [canton,definition] of Object.entries(DEFINITIONS)){
  catalog.laws.push({lawId:definition.lawId,canton,title:definition.title,holidayPolicyReview:{explicitDeviation:canton==='BS'?'explicitReviewedPathDependentAnchor':'noneIdentifiedInReviewedGeneralLaw',sourceRefs:refs([...definition.holidaySources,...canton==='BS'?['K1-BS-VRPG-20210101','K1-BS-VWVG-20220701','K1-BS-VWVG-20270101']:[]]),projectDecisionRef:'DEC-2026-031'},sourceRefs:refs(definition.statuteIds)});
  catalog.suspensionProfiles.push({suspensionProfileId:canton.toLowerCase()+'-none',lawId:definition.lawId,periods:[],sourceRefs:refs(canton==='BS'?['K1-BS-VRPG-20210101','K1-BS-VD2022111']:['K1-BL-GOG-20200101','K1-BL-KGE8102390-20230503'])});
  const baseProjection=holidayCatalog.activation.projections.find(row=>row.calendarId===definition.calendarId);assert.ok(baseProjection);
  catalog.holidayBindings.push({holidayBindingId:canton.toLowerCase()+'-authority-seat',lawId:definition.lawId,authoritySeatCanton:canton,authorityLevel:'cantonal',bindingVersion:'8.0.0',anchor:'authoritySeat',
   physicalSource:{releaseId:RELEASE,references:physicalRefs([definition.calendarId]),eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
   legalBinding:{sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
   calendarSelection:{kind:'fixedAuthoritySeat',calendarId:definition.calendarId,projectionId:baseProjection.id},annualEndShiftPolicy:canton==='BL'?structuredClone(annualPolicy):{kind:'none'}});
 }
 catalog.holidayBindings.push({holidayBindingId:'bs-party-representative',lawId:DEFINITIONS.BS.lawId,authoritySeatCanton:'BS',authorityLevel:'cantonal',bindingVersion:'8.0.0',anchor:'qualifiedPartyOrRepresentativeCanton',
  physicalSource:{releaseId:RELEASE,references:physicalRefs(dynamicCalendarIds),eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
  legalBinding:{sourceRefs:refs(['K1-BS-VRPG-20210101','K1-BS-VWVG-20220701','K1-BS-VWVG-20270101']),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:true},
  calendarSelection:{kind:'qualifiedPartyOrRepresentativeCanton',qualificationFact:'legalAnchorQualification',qualifiedValue:'establishedPartyOrRepresentative',cantonFact:'legalAnchorCanton',sourceProfileId:'vwvg',usage:'holidayProjectionOnlyNoFederalProcedurePermission',otherwise:'block',terminals},annualEndShiftPolicy:{kind:'none'}});
 const researchMap={workPackage:'AP23K2',acceptedResearch:RESEARCH,originalCaseCount:67,caseFactsAreCurrentNotDefaults:true,paths:[]};
 for(const r of research.paths){
  const model=befunde[r.canton],proposal=(model.pathProposals??model.groups).find(row=>row.id===r.id);assert.ok(proposal);
  const sourceIds=[...proposal.sourceIds,...DEFINITIONS[r.canton].holidaySources];
  if(r.calendarBinding.type==='fact')sourceIds.push('K1-BS-VRPG-20210101','K1-BS-VWVG-20220701','K1-BS-VWVG-20270101');
  const sourceRefs=refs(sourceIds),pathId=r.id.toLowerCase();
  const path={pathId,revision:1,researchRef:r.id,contractFamily:'qualifiedDayProcedureV8',lawId:DEFINITIONS[r.canton].lawId,action:proposal.action,stages:stagesFor(r),duration:durationFor(r),suspensionSelection:selectionFor(r),
   openingPolicy:{kind:'qualifiedCurrentTrigger',triggerKind:'qualifiedLegalOpening',transformation:'none',sourceRefs},holidayBindingId:bindingIdFor(r),urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',endShiftGuard:'none',
   qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
   temporalBinding:{caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},sourceCoverage:{...WINDOW},evaluation:'eachEvaluatedDayIncludingEndShift',futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},
   normTimeline:research.temporalBindings[r.temporalBindingKey??r.canton].map(segment=>({researchBindingId:segment.id,interval:{from:segment.from,to:segment.to},sourceRefs:refs(segment.sourceIds)})),sourceRefs,openingWarnings:[]};
  const requirements=r.requirements.filter(row=>row.key!=='regionalOfficeMode').map(projectK2Requirement);
  const policy={pathId,pathRevision:1,pathSha256:objSha(path),mode:'qualifiedDayProcedureV8',requirements,openingChainPolicy:'notApplicable',localHolidayPolicy:'boundEndCalendarPolicy'};
  catalog.paths.push(path);catalog.qualificationPolicies.push(policy);catalog.releaseBinding.pathEligibility.push(eligibilityFor(path,policy,catalog));
  researchMap.paths.push({researchId:r.id,pathId,lawId:path.lawId,sourceStage:r.stage,technicalStages:path.stages,originalRequirements:r.requirements,projectedRequirements:requirements,
   holidayBindingId:path.holidayBindingId,annualPolicy:r.canton==='BL'?'blCantonalOfficeClosures':'none',originalResearchOnlyCalendarRestriction:r.calendarBinding.allowed??null,
   abstractPartyOrRepresentativeRolePreserved:true,noImplicitCaseFacts:true});
 }
 for(const [canton,model] of Object.entries(befunde))for(const exclusion of model.exclusions??[]){const exclusionId='k1-'+exclusion.id.toLowerCase();
  catalog.excludedPaths.push({exclusionId,scope:canton+': '+(exclusion.scope??exclusion.id),reason:exclusion.treatment??exclusion.reason??exclusion.scope??exclusion.id});}
 const additions=[GUARD,ACCEPTED_RECEIPT,RESEARCH,'outputs/ap23k1-2026-10-27/local-completion.json',...crosswalk.flatMap(row=>row.evidence.map(item=>item.path)),...['bs','bl'].flatMap(c=>['docs/fachrecht/ap23k1/befund-'+c+'.json','outputs/ap23k1-2026-10-27/sources/'+c+'/source-bindings.json'])];
 const preserved=new Map(catalog.preserved.map(row=>[row.path,row]));for(const path of additions){const hash=path===GUARD?GUARD_SHA256:guard.files[path];assert.ok(hash,'Missing preserved K2 input '+path);
  if(preserved.has(path))assert.equal(preserved.get(path).sha256,hash);else{const row={path,sha256:hash};catalog.preserved.push(row);preserved.set(path,row);}}
 files.set(ADMIN,encode(catalog));Object.assign(descriptors.get('ch-cantonal-administrative-procedures'),{schemaId:K2_SCHEMA_IDS.catalog,sha256:sha(files.get(ADMIN)),byteLength:Buffer.byteLength(files.get(ADMIN))});
 const manifest=structuredClone(manifest0);Object.assign(manifest,{$schema:K2_SCHEMA_IDS.localManifest,formatVersion:'15.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-27'});
 manifest.compatibility.minimumConsumerFormatVersion='15.0.0';manifest.artifacts=[...descriptors.values()];
 manifest.sourceSummary={latestReviewedOn:'2026-10-27',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds:[...new Set([...manifest0.sourceSummary.sourceIds,...sourceRows.map(row=>row.sourceId)])].sort()};
 manifest.extensions={'steimer.local-reference':{workPackage:'AP23K2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
  contractDecision:'DEC-2026-040',contractDecisionStatus:'proposed',acceptedResearchSha256:guard.files[RESEARCH],acceptedReceiptSha256:guard.files[ACCEPTED_RECEIPT],startGuardSha256:GUARD_SHA256,
  baselineManifestSha256:guard.files[BASE+'/manifest.json'],historicalPayloadPolicy:'43 unchanged J3 artifacts and all 149 old path/policy/eligibility objects retain historical bindings. No source release, runtime reader or export capability.'}};
 const manifestText=encode(manifest),crosswalkText=encode({workPackage:'AP23K2',archiveIDsUnchanged:true,mappingOnly:true,sourceRows:crosswalk,
  roleMeaning:'Normen, direkte oder begrenzte Gerichtspraxis, Jahresvollzug und historische Belege behalten ihre abgenommenen Grenzen. Keine neue Norm aus Metadaten, Suchtreffern oder Extrakten.'}),researchMapText=encode(researchMap);
 const counts={artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,newArtifacts:0,preservedPaths:149,newPaths:16,totalPaths:165,qualificationPolicies:165,
  laws:catalog.laws.length,suspensionProfiles:catalog.suspensionProfiles.length,holidayBindings:catalog.holidayBindings.length,newSources:27,totalSources:catalog.sources.length,
  physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,annualOfficeClosureDays:13,uncertainClosureDays:1,dynamicTerminalBindings:26,dynamicTerminalVariants:28,dynamicProjections:29,socialRules:44,socialBernBindings:50};
 const integrity={kind:'ap23k2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,runtimeReadable:false,productionActivation:false,calendarExportEnabled:false,sourceReview:'pending',counts,
  basedOn:[GUARD,...additions.filter(path=>path!==GUARD),BASE+'/manifest.json',BASE+'/'+ADMIN].map(path=>({path,sha256:path===GUARD?GUARD_SHA256:guard.files[path]})),
  manifest:{path:OUTPUT+'/bundle/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
  sourceCrosswalk:{path:OUTPUT+'/source-crosswalk.json',byteLength:Buffer.byteLength(crosswalkText),sha256:sha(crosswalkText)},researchMap:{path:OUTPUT+'/research-map.json',byteLength:Buffer.byteLength(researchMapText),sha256:sha(researchMapText)},
  artifacts:manifest.artifacts.map(row=>({path:OUTPUT+'/bundle/'+row.path,byteLength:row.byteLength,sha256:row.sha256}))};
 const built={old,catalog,holidayCatalog,manifest,manifest0,files,manifestText,integrity,crosswalk,crosswalkText,research,researchMap,researchMapText,sourceRows,befunde};
 assertK2Preservation(built);return built;
}
export function assertK2Preservation(built){
 const {old,catalog,manifest0,files}=built;
 for(const [field,id] of [['paths','pathId'],['qualificationPolicies','pathId'],['holidayBindings','holidayBindingId'],['laws','lawId'],['sources','sourceId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId'],['preserved','path']]){
  const actual=new Map(catalog[field].map(row=>[row[id],row]));assert.equal(actual.size,catalog[field].length,'Duplicate '+field);for(const row of old[field])assert.equal(canonical(actual.get(row[id])),canonical(row),'Changed old '+field+'/'+row[id]);}
 const entries=new Map(catalog.releaseBinding.pathEligibility.map(row=>[row.pathId,row]));for(const row of old.releaseBinding.pathEligibility)assert.deepEqual(entries.get(row.pathId),row,'Changed old path eligibility');
 for(const descriptor of manifest0.artifacts)if(descriptor.path!==ADMIN){assert.equal(sha(files.get(descriptor.path)),descriptor.sha256);assert.equal(Buffer.byteLength(files.get(descriptor.path)),descriptor.byteLength);}
 assert.equal(catalog.paths.length,165);assert.equal(catalog.holidayBindings.length,30);assert.equal(catalog.laws.length,20);assert.equal(catalog.suspensionProfiles.length,37);
 assert.equal(catalog.contractDecision.status,'proposed');assert.equal(catalog.runtimeActive,false);assert.equal(catalog.releaseBinding.status,'candidate');
 for(const field of ['releaseId','approval','sourceReviewRef','referenceSuiteRef'])assert.equal(catalog.releaseBinding[field],null);assert.deepEqual(catalog.releaseBinding.targetComponentRefs,[]);
 for(const entry of catalog.releaseBinding.pathEligibility){assert.equal(entry.status,'candidate');assert.deepEqual(entry.targetComponentRefs,[]);assert.equal(entry.sourceReviewRef,null);assert.equal(entry.referenceSuiteRef,null);}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));const built=await buildK2Candidate();
 const payloads=[...built.files].map(([path,bytes])=>[OUTPUT+'/bundle/'+path,bytes]).concat([[OUTPUT+'/bundle/manifest.json',built.manifestText],[OUTPUT+'/source-crosswalk.json',built.crosswalkText],[OUTPUT+'/research-map.json',built.researchMapText],[OUTPUT+'/candidate-integrity.json',encode(built.integrity)]]);
 for(const [path,bytes] of payloads)if(process.argv[2]==='--write'){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes);}else assert.equal((await read(path)).toString('utf8'),bytes,'Stale isolated K2 file '+path);
 console.log(JSON.stringify({workPackage:'AP23K2',status:process.argv[2]==='--write'?'isolated-structure-candidate-written':'isolated-structure-candidate-byte-equal',...built.integrity.counts},null,2));
}
