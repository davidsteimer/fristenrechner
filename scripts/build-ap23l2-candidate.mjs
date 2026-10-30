// SPDX-License-Identifier: AGPL-3.0-only
// Isolated L2 contract candidate. No native reader, product data or operating mutation.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,safeRelative} from './prepare-ap23l2.mjs';
import {L2_SCHEMA_IDS,L2_TRACKING_REQUIREMENTS,projectL2Requirement} from './build-ap23l2-schemas.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const BASE='data/candidates/2026-10-27-ap23k3';
export const OUTPUT='outputs/ap23l2-candidate-2026-10-27';
export const QA_OUTPUT='outputs/ap23l2-2026-10-27';
export const ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const HOLIDAYS='holiday-catalogs/ch-holiday-catalog.json';
export const RELEASE='2026-10-27-ap23l2-reference.1';
export const RESEARCH='docs/fachrecht/ap23l1/referenzfaelle.json';
export const WINDOW={from:'2026-08-29',to:'2027-12-31'};
export const GUARD='outputs/ap23l2-2026-10-27/protected-inputs.json';
export const GUARD_SHA256='6b8540b694a67a1fffd292486a7480728eca06f37f53f490f8df75fad2786bb1';
export const ACCEPTED_RECEIPT='outputs/ap23l1-abnahme-2026-10-27/receipt.json';
export const sha=value=>createHash('sha256').update(value).digest('hex');
export const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?
 '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
export const objSha=value=>sha(canonical(value));
export const encode=value=>JSON.stringify(value,null,2)+'\n';
const guard=JSON.parse(await exact(ROOT,GUARD,GUARD_SHA256));
assert.equal(guard.workPackage,'AP23L2');assert.equal(guard.capturedAtTechnicalPlanningStart,true);assert.equal(guard.l1ProfessionallyAccepted,true);
assert.equal(Object.keys(guard.files).length,9048);
for(const key of['formatDecision','productCodeChangePermission','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(guard[key],false,key);
export async function readFixed(path){safeRelative(path);assert.ok(Object.hasOwn(guard.files,path),'Input outside frozen L2 guard: '+path);return exact(ROOT,path,guard.files[path]);}
const json=async path=>JSON.parse(await readFixed(path));
const read=path=>readFile(resolve(ROOT,path));
export const DEFINITIONS={
 AI:{lawId:'ai-general-administrative',title:'Allgemeines Verwaltungsverfahren Appenzell Innerrhoden, VerwVG, VerwGG und FriG',calendarId:'ap22-ai-f507435d8aa8',
  statutes:['L1-AI-VERWVG','L1-AI-VERWGG','L1-AI-FRIG'],holidaySources:['L1-AI-REST','L1-AI-FRIG'],
  chronologicalSources:['L1-AI-VERWVG','L1-AI-VERWGG','L1-AI-FRIG','L1-AI-GOG','L1-AI-REVISION-2025-12']},
 SZ:{lawId:'sz-general-administrative',title:'Allgemeines Verwaltungsverfahren Schwyz, VRP und JG',calendarId:'ap22-sz-ec9f2c557fe4',
  statutes:['L1-SZ-VRP-20260701','L1-SZ-JG-20260701'],holidaySources:['L1-SZ-JG-20260701','L1-SZ-RTG-20180701','L1-SZ-HOLIDAY-OVERVIEW-20260924','L1-SZ-STATE-DIRECTORY-20261006'],
  chronologicalSources:['L1-SZ-VRP-20260701','L1-SZ-JG-20260701','L1-SZ-AMENDMENT-20240424','L1-SZ-VRPV-20260701','L1-SZ-REVVGER-20260701']}
};
const operativeAi=new Set(['L1-AI-VERWVG','L1-AI-FRIG','L1-AI-VERWGG','L1-AI-GOG','L1-AI-REST','L1-AI-REVISION-2025-12','L1-AI-PRACTICE-V2','L1-AI-PRACTICE-V9']);
export const sourceId=id=>(id.includes('-PRACTICE-')||id.includes('-VGE-')?'JUD-':'SRC-')+id;
export function stagesFor(path){const table={initialAdministration:'administration',internalAppeal:'administrativeAppeal',internalSupervision:'administrativeAppeal',
 courtAppeal:'court',courtDecisionFollowup:'court',courtPersonnelCommission:'court',administrativeAppeal:'administrativeAppeal',provisionalOpposition:'administrativeAppeal',courtProceeding:'court'};
 assert.ok(table[path.stage],'Unmapped L1 stage '+path.stage);return[table[path.stage]];}
export function durationFor(path){
 if(path.durationFact){const bases=path.requirements.find(req=>req.key===path.durationBaseFact)?.oneOf;assert.ok(bases);
  return{kind:'qualifiedLongerNoticeDays',valueFact:'actualLongerInstructionDays',ordinaryBaseFact:'ordinaryStatutoryDays',minimum:31,maximum:365,
   ordinaryBaseAllowed:[...bases],qualificationFact:'longerInstructionQualification',qualifiedValue:'aboveBothStatutoryAndThirty',
   comparison:'strictlyAboveOrdinaryBaseAndThirty',boundMeaning:'qualifiedCurrentInstructionWithTechnicalSafetyLimit'};}
 if(path.days!==null)return{kind:'statutoryDays',value:path.days,overridable:false};
 return{kind:'authorityOrderedDays',minimum:path.minimumDays??1,maximum:path.maximumDays??365,
  boundMeaning:path.maximumDays===10?'statutoryMaximumForCurrentOrder':'technicalSafetyLimitNotLegalMaximum'};
}
export const bindingIdFor=path=>path.canton.toLowerCase()+'-qualified-authority-seat';
export const selectionFor=path=>({kind:'fixed',suspensionProfileId:path.canton.toLowerCase()+'-'+(path.suspension==='none'?'none':'three')});
export function openingFor(path,sourceRefs){
 if(path.canton==='AI'&&path.opening?.trackingValue==='trackingPhysicalReceipt')return{kind:'aiQualifiedOrTrackingPost',factKey:'openingMode',qualifiedMode:'qualifiedLegalOpening',
  trackingMode:'trackingPhysicalReceipt',qualifiedTransformation:'none',trackingTransformation:'nextWorkingDayIfNonWorkingReceipt',holidayBinding:'sameAsPath',otherwise:'block',
  trackingRequirements:L2_TRACKING_REQUIREMENTS.map(projectL2Requirement),sourceRefs};
 return{kind:'qualifiedCurrentTrigger',triggerKind:'qualifiedLegalOpening',transformation:'none',sourceRefs};
}
export function periods(canton,kind){if(kind==='none')return[];assert.equal(kind,'three');return[
 {periodId:canton.toLowerCase()+'-easter',start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
 {periodId:canton.toLowerCase()+'-summer',start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
 {periodId:canton.toLowerCase()+'-winter',start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:canton==='SZ'?7:2,yearOffset:1},inclusive:true}];}
export function eligibilityFor(path,policy,catalog){
 const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId);assert.ok(binding);
 const profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===path.suspensionSelection.suspensionProfileId);assert.ok(profile);
 return{status:'candidate',pathId:path.pathId,pathRevision:path.revision,pathSha256:objSha(path),holidayBindingId:binding.holidayBindingId,holidayBindingSha256:objSha(binding),
  suspensionSelectionSha256:objSha(path.suspensionSelection),suspensionProfiles:[{suspensionProfileId:profile.suspensionProfileId,sha256:objSha(profile)}],openingPolicySha256:objSha(path.openingPolicy),
  calendarSelectionSha256:objSha(binding.calendarSelection),proceduralCalendarSupplementSha256:objSha(binding.proceduralCalendarSupplement),durationPolicySha256:objSha(path.duration),
  qualificationPolicySha256:objSha(policy),caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};
}
export async function buildL2Candidate(){
 const receipt=await json(ACCEPTED_RECEIPT);assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.l2Started,true);assert.equal(receipt.formatDecision,false);
 const manifest0=await json(BASE+'/manifest.json');assert.equal(manifest0.formatVersion,'15.0.0');assert.equal(manifest0.artifacts.length,44);
 const filesMap=new Map();for(const descriptor of manifest0.artifacts){const bytes=await readFixed(BASE+'/'+descriptor.path);assert.equal(sha(bytes),descriptor.sha256);assert.equal(bytes.length,descriptor.byteLength);filesMap.set(descriptor.path,bytes.toString('utf8'));}
 const old=JSON.parse(filesMap.get(ADMIN)),holidayCatalog=JSON.parse(filesMap.get(HOLIDAYS)),research=await json(RESEARCH);
 assert.equal(old.paths.length,165);assert.equal(research.paths.length,31);assert.equal(research.cases.length,83);
 const models=Object.fromEntries(await Promise.all(['ai','sz'].map(async code=>[code.toUpperCase(),await json('docs/fachrecht/ap23l1/befund-'+code+'.json')])));
 const registers=Object.fromEntries(await Promise.all(['ai','sz'].map(async code=>[code.toUpperCase(),await json('docs/fachrecht/ap23l1/quellen-'+code+'.json')])));
 for(const model of research.sourceModels)assert.equal(sha(await readFixed(model.path)),model.sha256);
 const crosswalk=[];for(const[canton,register]of Object.entries(registers))for(const entry of register.sources){
  const location=register.sourceBase+'/'+entry.file,bytes=await readFixed(location);assert.equal(sha(bytes),entry.sha256);assert.equal(bytes.length,entry.bytes);
  const operative=canton==='SZ'||operativeAi.has(entry.id);const kind=entry.id.includes('-PRACTICE-')||entry.id.includes('-VGE-')?'judgment':entry.id.includes('OVERVIEW')||entry.id.includes('DIRECTORY')?'officialMaterials':'statute';
  const extract=entry.id.endsWith('-EXTRACT'),metadata=entry.id.endsWith('-API'),history=entry.id.includes('-PREVIOUS');
  crosswalk.push({researchSourceId:entry.id,catalogSourceId:operative?sourceId(entry.id):null,canton,kind:operative?kind:'evidenceOnly',url:entry.url,
   researchRole:extract?'derivedApiExtract':metadata?'officialVersionRegister':history?'historicalPredecessor':operative?kind:'institutionalEvidence',
   versionDescription:entry.edition??entry.scope??entry.id,readingScope:entry.scope??entry.locators?.join('; ')??entry.validityEvidence??entry.id,
   evidence:[{path:location,sha256:entry.sha256,byteLength:entry.bytes}],sourcePromotion:false,
   roleLimit:entry.scope??entry.validityEvidence??'Fassungs- oder Institutionsbeleg, keine zusätzliche eigenständige Rechtsnorm.'});
 }
 assert.equal(crosswalk.length,31);const operative=crosswalk.filter(row=>row.catalogSourceId!==null);assert.equal(operative.length,17);
 const sourceMap=new Map(operative.map(row=>[row.researchSourceId,row]));
 const ref=(id,locator)=>{const entry=sourceMap.get(id);assert.ok(entry,'Unprojected source '+id);return{sourceId:entry.catalogSourceId,locator:locator??entry.readingScope};};
 const refs=ids=>[...new Set(ids)].map(id=>ref(id));
 const sourceRows=operative.map(row=>({sourceId:row.catalogSourceId,kind:row.kind,url:row.url,versionDescription:row.versionDescription,reviewedOn:'2026-10-27',
  reviewBasis:'AP23L1 L1 A bis L1 G fachlich abgenommen. Isolierte L2-Vertragsprobe ohne Quellenrelease. Verwendungsgrenze: '+row.roleLimit,locators:row.readingScope}));
 const catalog=structuredClone(old);Object.assign(catalog,{$schema:L2_SCHEMA_IDS.catalog,formatVersion:'9.0.0',contractStatus:'proposed',runtimeActive:false,
  contractDecision:{id:'DEC-2026-041',status:'proposed',on:null},review:{checkedOn:'2026-10-27',basis:'165 alte Fachpfade und historische Fachobjekte unverändert. 31 fachlich abgenommene AI-/SZ-Gruppen als isolierter Vorschlag.',
   sourceReview:'Keine gemeinsame Quellenreleasefreigabe. 35 physische Kalender und 499 Katalogregeln unverändert. Schwyzer Martinstag nur als gebundene administrative Endverschiebungsergänzung.'}});
 catalog.sources.push(...sourceRows);
 const descriptors=new Map(manifest0.artifacts.map(row=>[row.contentId,structuredClone(row)]));
 const physicalRefs=calendarId=>[calendarId,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const descriptor=descriptors.get(id);assert.ok(descriptor,'Missing physical source '+id);return{role:descriptor.role,contentId:id,sha256:descriptor.sha256,path:descriptor.path};});
 for(const[canton,definition]of Object.entries(DEFINITIONS)){
  catalog.laws.push({lawId:definition.lawId,canton,title:definition.title,holidayPolicyReview:{explicitDeviation:'noneIdentifiedInReviewedGeneralLaw',sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031'},sourceRefs:refs(definition.statutes)});
  for(const kind of['none','three'])catalog.suspensionProfiles.push({suspensionProfileId:canton.toLowerCase()+'-'+kind,lawId:definition.lawId,periods:periods(canton,kind),sourceRefs:refs(canton==='AI'?['L1-AI-VERWVG','L1-AI-VERWGG']:['L1-SZ-VRP-20260701','L1-SZ-JG-20260701'])});
  const projection=holidayCatalog.activation.projections.find(row=>row.calendarId===definition.calendarId);assert.ok(projection);
  catalog.holidayBindings.push({holidayBindingId:canton.toLowerCase()+'-qualified-authority-seat',lawId:definition.lawId,authoritySeatCanton:canton,authorityLevel:'cantonal',bindingVersion:'9.0.0',anchor:'authoritySeat',
   physicalSource:{releaseId:RELEASE,references:physicalRefs(definition.calendarId),eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
   legalBinding:{sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
   calendarSelection:{kind:'fixedAuthoritySeat',calendarId:definition.calendarId,projectionId:projection.id},
   proceduralCalendarSupplement:canton==='AI'?{kind:'none'}:{kind:'szSchwyzMartinstag',effect:'endShiftOnly',coverage:{...WINDOW},authorityMunicipality:'Schwyz',dates:['2026-11-11','2027-11-11'],sourceRefs:refs(definition.holidaySources)}});
 }
 const researchMap={workPackage:'AP23L2',acceptedResearch:RESEARCH,originalCaseCount:83,caseFactsAreCurrentNotDefaults:true,paths:[]};
 for(const row of research.paths){
  const model=models[row.canton],proposal=model.pathProposals.find(path=>path.id===row.id);assert.ok(proposal);const definition=DEFINITIONS[row.canton];
  const originalRefs=proposal.sourceIds??proposal.legalBasis;assert.ok(originalRefs);const sources=refs([...originalRefs,...definition.holidaySources,...definition.chronologicalSources]);
  const timeline=row.canton==='AI'?[{researchBindingId:'AI-NORMS-WINDOW',interval:{...WINDOW},sourceRefs:refs(definition.chronologicalSources)}]:[
   {researchBindingId:'SZ-NORMS-PHASE1',interval:{from:WINDOW.from,to:'2027-06-30'},sourceRefs:refs(definition.chronologicalSources)},
   {researchBindingId:'SZ-NORMS-PHASE2',interval:{from:'2027-07-01',to:WINDOW.to},sourceRefs:refs(definition.chronologicalSources)}];
  const path={pathId:row.id.toLowerCase(),revision:1,researchRef:row.id,contractFamily:'qualifiedDayProcedureV9',lawId:definition.lawId,
   action:row.requirements.find(req=>req.key==='actionQualification').value,stages:stagesFor(row),duration:durationFor(row),suspensionSelection:selectionFor(row),openingPolicy:openingFor(row,sources),
   holidayBindingId:bindingIdFor(row),urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',endShiftGuard:row.suspension==='none'?'none':'blockWhenEnteringApplicableSuspension',
   qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
   temporalBinding:{caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},sourceCoverage:{...WINDOW},evaluation:'eachEvaluatedDayIncludingEndShift',futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},
   normTimeline:timeline,sourceRefs:sources,openingWarnings:[]};
  const requirements=row.requirements.map(projectL2Requirement),policy={pathId:path.pathId,pathRevision:1,pathSha256:objSha(path),mode:'qualifiedDayProcedureV9',requirements,
   openingChainPolicy:'notApplicable',localHolidayPolicy:'boundProceduralCalendarSupplement'};
  catalog.paths.push(path);catalog.qualificationPolicies.push(policy);catalog.releaseBinding.pathEligibility.push(eligibilityFor(path,policy,catalog));
  researchMap.paths.push({researchId:row.id,pathId:path.pathId,lawId:path.lawId,sourceStage:row.stage,technicalStages:path.stages,originalRequirements:row.requirements,
   projectedRequirements:requirements,openingKind:path.openingPolicy.kind,holidayBindingId:path.holidayBindingId,noImplicitCaseFacts:true});
 }
 for(const[canton,model]of Object.entries(models)){
  const exclusions=model.exclusions??model.inventory.filter(row=>!row.handling.startsWith('positive'));
  exclusions.forEach((entry,index)=>catalog.excludedPaths.push({exclusionId:'l1-'+canton.toLowerCase()+'-'+(index+1),scope:canton+': '+(typeof entry==='string'?entry:entry.norm),reason:typeof entry==='string'?entry:entry.finding}));
 }
 const additions=[GUARD,ACCEPTED_RECEIPT,RESEARCH,'outputs/ap23l1-2026-10-27/local-completion.json',...crosswalk.flatMap(row=>row.evidence.map(item=>item.path)),...['ai','sz'].flatMap(code=>['docs/fachrecht/ap23l1/befund-'+code+'.json','docs/fachrecht/ap23l1/quellen-'+code+'.json'])];
 const preserved=new Map(catalog.preserved.map(row=>[row.path,row]));for(const path of additions){const hash=path===GUARD?GUARD_SHA256:guard.files[path];assert.ok(hash,'Missing preserved L2 input '+path);
  if(preserved.has(path))assert.equal(preserved.get(path).sha256,hash);else{const row={path,sha256:hash};catalog.preserved.push(row);preserved.set(path,row);}}
 filesMap.set(ADMIN,encode(catalog));Object.assign(descriptors.get('ch-cantonal-administrative-procedures'),{schemaId:L2_SCHEMA_IDS.catalog,sha256:sha(filesMap.get(ADMIN)),byteLength:Buffer.byteLength(filesMap.get(ADMIN))});
 const manifest=structuredClone(manifest0);Object.assign(manifest,{$schema:L2_SCHEMA_IDS.localManifest,formatVersion:'16.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-27'});
 manifest.compatibility.minimumConsumerFormatVersion='16.0.0';manifest.artifacts=[...descriptors.values()];
 manifest.sourceSummary={latestReviewedOn:'2026-10-27',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds:[...new Set([...manifest0.sourceSummary.sourceIds,...sourceRows.map(row=>row.sourceId)])].sort()};
 manifest.extensions={'steimer.local-reference':{workPackage:'AP23L2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
  contractDecision:'DEC-2026-041',contractDecisionStatus:'proposed',acceptedResearchSha256:guard.files[RESEARCH],acceptedReceiptSha256:guard.files[ACCEPTED_RECEIPT],startGuardSha256:GUARD_SHA256,
  baselineManifestSha256:guard.files[BASE+'/manifest.json'],historicalPayloadPolicy:'43 unchanged K3 artifacts and all165 historical path/policy/eligibility objects retain their prior bindings. No source release, native runtime reader or export capability.'}};
 const manifestText=encode(manifest),crosswalkText=encode({workPackage:'AP23L2',mappingOnly:true,sourceRows:crosswalk,operativeCatalogSources:17,belegFiles:31,
  roleMeaning:'17 konkrete Rechts-/Praxis-/Vollzugsquellen, keine zusätzlichen Normen aus API, abgeleiteten Extrakten, Historie oder Institutionsseiten. Sämtliche31 Belegdateien bleiben mit ihrer angenommenen Rolle gebunden.'}),researchMapText=encode(researchMap);
 const counts={artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,newArtifacts:0,preservedPaths:165,newPaths:31,totalPaths:196,qualificationPolicies:196,
  laws:catalog.laws.length,suspensionProfiles:catalog.suspensionProfiles.length,holidayBindings:catalog.holidayBindings.length,newSources:17,totalSources:catalog.sources.length,
  physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,proceduralSupplementDates:2,belegFiles:31,socialRules:44,socialBernBindings:50};
 const integrity={kind:'ap23l2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,runtimeReadable:false,productionActivation:false,calendarExportEnabled:false,sourceReview:'pending',counts,
  basedOn:[GUARD,...additions.filter(path=>path!==GUARD),BASE+'/manifest.json',BASE+'/'+ADMIN].map(path=>({path,sha256:path===GUARD?GUARD_SHA256:guard.files[path]})),
  manifest:{path:OUTPUT+'/bundle/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},sourceCrosswalk:{path:OUTPUT+'/source-crosswalk.json',byteLength:Buffer.byteLength(crosswalkText),sha256:sha(crosswalkText)},
  researchMap:{path:OUTPUT+'/research-map.json',byteLength:Buffer.byteLength(researchMapText),sha256:sha(researchMapText)},artifacts:manifest.artifacts.map(row=>({path:OUTPUT+'/bundle/'+row.path,byteLength:row.byteLength,sha256:row.sha256}))};
 const built={old,catalog,holidayCatalog,manifest,manifest0,filesMap,files:filesMap,manifestText,integrity,crosswalk,crosswalkText,research,researchMap,researchMapText,sourceRows,models};
 assertL2Preservation(built);return built;
}
export function assertL2Preservation(built){
 const{old,catalog,manifest0,filesMap}=built;
 for(const[field,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['holidayBindings','holidayBindingId'],['laws','lawId'],['sources','sourceId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId'],['preserved','path']]){
  const actual=new Map(catalog[field].map(row=>[row[id],row]));assert.equal(actual.size,catalog[field].length,'Duplicate '+field);for(const row of old[field])assert.equal(canonical(actual.get(row[id])),canonical(row),'Changed old '+field+'/'+row[id]);}
 const eligibility=new Map(catalog.releaseBinding.pathEligibility.map(row=>[row.pathId,row]));for(const row of old.releaseBinding.pathEligibility)assert.deepEqual(eligibility.get(row.pathId),row,'Changed old path eligibility');
 for(const descriptor of manifest0.artifacts)if(descriptor.path!==ADMIN){assert.equal(sha(filesMap.get(descriptor.path)),descriptor.sha256);assert.equal(Buffer.byteLength(filesMap.get(descriptor.path)),descriptor.byteLength);}
 assert.equal(catalog.paths.length,196);assert.equal(catalog.holidayBindings.length,32);assert.equal(catalog.laws.length,22);assert.equal(catalog.suspensionProfiles.length,41);
 assert.equal(catalog.contractDecision.status,'proposed');assert.equal(catalog.runtimeActive,false);assert.equal(catalog.releaseBinding.status,'candidate');
 for(const key of['releaseId','approval','sourceReviewRef','referenceSuiteRef'])assert.equal(catalog.releaseBinding[key],null);assert.deepEqual(catalog.releaseBinding.targetComponentRefs,[]);
 for(const item of catalog.releaseBinding.pathEligibility){assert.equal(item.status,'candidate');assert.deepEqual(item.targetComponentRefs,[]);assert.equal(item.sourceReviewRef,null);assert.equal(item.referenceSuiteRef,null);}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));const built=await buildL2Candidate();
 const payloads=[...built.filesMap].map(([path,bytes])=>[OUTPUT+'/bundle/'+path,bytes]).concat([[OUTPUT+'/bundle/manifest.json',built.manifestText],[OUTPUT+'/source-crosswalk.json',built.crosswalkText],[OUTPUT+'/research-map.json',built.researchMapText],[OUTPUT+'/candidate-integrity.json',encode(built.integrity)]]);
 for(const[path,bytes]of payloads)if(process.argv[2]==='--write'){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes);}else assert.equal((await read(path)).toString('utf8'),bytes,'Stale isolated L2 file '+path);
 console.log(JSON.stringify({workPackage:'AP23L2',status:process.argv[2]==='--write'?'isolated-structure-candidate-written':'isolated-structure-candidate-byte-equal',...built.integrity.counts},null,2));
}
