// SPDX-License-Identifier: AGPL-3.0-only
// Isolated M2 proposal. No native reader, product data or operating mutation.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,safeRelative} from './prepare-ap23m2.mjs';
import {M2_SCHEMA_IDS,projectM2Requirement} from './build-ap23m2-schemas.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const BASE='data/candidates/2026-10-27-ap23l3';
export const OUTPUT='outputs/ap23m2-candidate-2026-10-28';
export const QA_OUTPUT='outputs/ap23m2-2026-10-28';
export const ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const HOLIDAYS='holiday-catalogs/ch-holiday-catalog.json';
export const RELEASE='2026-10-28-ap23m2-reference.1';
export const RESEARCH='docs/fachrecht/ap23m1/referenzfaelle.json';
export const WINDOW={from:'2026-08-29',to:'2027-12-31'};
export const GUARD='outputs/ap23m2-2026-10-28/protected-inputs.json';
export const GUARD_SHA256='af68d4b6c0fb33d731c50f99b3ca3c63bc1c573d5635d259798a5ed28953c3b1';
export const ACCEPTED_RECEIPT='outputs/ap23m1-abnahme-2026-10-28/receipt.json';
export const sha=value=>createHash('sha256').update(value).digest('hex');
export const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?
 '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
export const objSha=value=>sha(canonical(value));
export const encode=value=>JSON.stringify(value,null,2)+'\n';
const guard=JSON.parse(await exact(ROOT,GUARD,GUARD_SHA256));
assert.equal(guard.workPackage,'AP23M2');assert.equal(guard.m1ProfessionallyAccepted,true);
assert.equal(Object.keys(guard.files).length,11414);
for(const key of['formatDecision','productCodeChangePermission','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(guard[key],false,key);
export async function readFixed(path){safeRelative(path);assert.ok(Object.hasOwn(guard.files,path),'Input outside frozen M2 guard: '+path);return exact(ROOT,path,guard.files[path]);}
const json=async path=>JSON.parse(await readFixed(path));
export const DEFINITIONS={
 NE:{lawId:'ne-general-administrative',title:'Allgemeines Verwaltungsverfahren Neuenburg, LPA',calendars:['ap22-ne-027ceadbf103','ap22-ne-21f519039621'],
  statutes:['M1-NE-LPA'],holidaySources:['M1-NE-RDF','M1-NE-LDJF','M1-NE-LANDERON'],chronologicalSources:['M1-NE-LPA','M1-NE-LCE','M1-NE-OJN']},
 VD:{lawId:'vd-general-administrative',title:'Allgemeines Verwaltungsverfahren Waadt, LPA-VD',calendars:['ap22-vd-26f452ff34ee'],
  statutes:['M1-VD-LPA','M1-VD-LSAM'],holidaySources:['M1-VD-LEMP'],chronologicalSources:['M1-VD-LPA','M1-VD-LPA-REFORM','M1-VD-REFORM-ENACTMENT']},
 VS:{lawId:'vs-general-administrative',title:'Allgemeines Verwaltungsverfahren Wallis, VVRG/LPJA',calendars:['ap22-vs-6c002f32b1b0'],
  statutes:['M1-VS-LPJA-FR-API'],holidaySources:['M1-VS-RUHE-API','M1-VS-RUHEREG-API'],chronologicalSources:['M1-VS-LPJA-FR-API','M1-VS-LOJ-API','M1-VS-REVISION-2024-095','M1-VS-ENACTMENT-2024-094']}
};
export const sourceId=id=>(/CASE|CDP|BGER/u.test(id)?'JUD-':'SRC-')+id;
export function stagesFor(path){const table={administration:'administration',initialAdministration:'administration',reclamation:'administration',opposition:'administration',
 internalAppeal:'administrativeAppeal',administrativeAppeal:'administrativeAppeal',court:'court',judicialAppeal:'court',courtAppeal:'court'};
 assert.ok(table[path.stage],'Unmapped M1 stage '+path.stage);return[table[path.stage]];}
export function durationFor(path){
 if(path.durationFact){assert.equal(path.canton,'VS');return{kind:'qualifiedVsLongerNoticeDays',valueFact:'actualInstructionDays',ordinaryBaseFact:'ordinaryDays',minimum:1,maximum:365,
  ordinaryBaseAllowed:[10,30],comparison:'strictlyAboveOrdinaryBase',boundMeaning:'qualifiedCurrentInstructionWithTechnicalSafetyLimit'};}
 if(path.days!==null)return{kind:'statutoryDays',value:path.days,overridable:false};
 return{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'};
}
export const bindingIdFor=path=>path.canton==='NE'?'ne-'+(path.calendarBinding.type==='qualifiedAuthoritySeat'?'admin':'court')+'-qualified-authority-seat':path.canton.toLowerCase()+'-qualified-authority-seat';
export const selectionFor=path=>({kind:'fixed',suspensionProfileId:path.canton.toLowerCase()+'-'+(path.suspension==='none'?'none':'three')});
export function openingFor(path,sourceRefs){
 if(path.canton==='VD')return{kind:'vdQualifiedOrUnsignedPost',factKey:'openingMode',qualifiedMode:'qualifiedLegalOpening',trackingMode:'vdUnsignedPostalReceipt',
  qualifiedTransformation:'none',trackingTransformation:'nextWorkingDayIfNonWorkingReceipt',holidayBinding:'sameAsPath',otherwise:'block',
  trackingRequirements:path.opening.trackingRequirements.map(projectM2Requirement),sourceRefs};
 return{kind:'qualifiedCurrentTrigger',triggerKind:'qualifiedLegalOpening',transformation:'none',sourceRefs};
}
export function periods(canton,kind){if(kind==='none')return[];assert.equal(kind,'three');return[
 {periodId:canton.toLowerCase()+'-easter',start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
 {periodId:canton.toLowerCase()+'-summer',start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
 {periodId:canton.toLowerCase()+'-winter',start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:canton==='VS'?5:2,yearOffset:1},inclusive:true}];}
export function eligibilityFor(path,policy,catalog){
 const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId),profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===path.suspensionSelection.suspensionProfileId);assert.ok(binding&&profile);
 return{status:'candidate',pathId:path.pathId,pathRevision:path.revision,pathSha256:objSha(path),holidayBindingId:binding.holidayBindingId,holidayBindingSha256:objSha(binding),
  suspensionSelectionSha256:objSha(path.suspensionSelection),suspensionProfiles:[{suspensionProfileId:profile.suspensionProfileId,sha256:objSha(profile)}],openingPolicySha256:objSha(path.openingPolicy),
  calendarSelectionSha256:objSha(binding.calendarSelection),proceduralCalendarSupplementSha256:objSha(binding.proceduralCalendarSupplement),durationPolicySha256:objSha(path.duration),
  qualificationPolicySha256:objSha(policy),caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};
}
export async function buildM2Candidate(){
 const receipt=await json(ACCEPTED_RECEIPT);assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.m2Started,true);assert.equal(receipt.formatDecision,false);
 const manifest0=await json(BASE+'/manifest.json');assert.equal(manifest0.formatVersion,'16.0.0');assert.equal(manifest0.artifacts.length,44);
 const filesMap=new Map();for(const descriptor of manifest0.artifacts){const bytes=await readFixed(BASE+'/'+descriptor.path);assert.equal(sha(bytes),descriptor.sha256);assert.equal(bytes.length,descriptor.byteLength);filesMap.set(descriptor.path,bytes.toString('utf8'));}
 const old=JSON.parse(filesMap.get(ADMIN)),holidayCatalog=JSON.parse(filesMap.get(HOLIDAYS)),research=await json(RESEARCH);
 assert.equal(old.paths.length,196);assert.equal(research.paths.length,49);assert.equal(research.cases.length,109);
 const models=Object.fromEntries(await Promise.all(['ne','vd','vs'].map(async code=>[code.toUpperCase(),await json('docs/fachrecht/ap23m1/befund-'+code+'.json')])));
 const registers=Object.fromEntries(await Promise.all(['ne','vd','vs'].map(async code=>[code.toUpperCase(),await json('docs/fachrecht/ap23m1/quellen-'+code+'.json')])));
 for(const model of research.sourceModels)assert.equal(sha(await readFixed(model.path)),model.sha256);
 const operativeIds=new Set(research.paths.flatMap(path=>path.sourceIds));for(const d of Object.values(DEFINITIONS))for(const id of [...d.statutes,...d.holidaySources,...d.chronologicalSources])operativeIds.add(id);
 const crosswalk=[];for(const[canton,register]of Object.entries(registers))for(const entry of register.sources){
  const location=register.sourceBase+'/'+entry.file,bytes=await readFixed(location);assert.equal(sha(bytes),entry.sha256);assert.equal(bytes.length,entry.bytes);
  const role=entry.sourceType??entry.type,operative=operativeIds.has(entry.id),kind=/Decision|CASE/u.test(role+' '+entry.id)?'judgment':/Guidance|Overview|Material/u.test(role)?'officialMaterials':'statute';
  crosswalk.push({researchSourceId:entry.id,catalogSourceId:operative?sourceId(entry.id):null,canton,kind:operative?kind:'evidenceOnly',url:entry.url,researchRole:role,
   versionDescription:entry.edition??entry.title??entry.documentVersionDate??entry.id,readingScope:entry.scope??entry.readingEvidence??entry.locators?.join(', ')??entry.id,
   evidence:[{path:location,sha256:entry.sha256,byteLength:entry.bytes}],sourcePromotion:false,
   roleLimit:operative?'Abgenommene M1-Verwendung, keine Quellenreleasefreigabe.':'Nur Herkunft, Historie, Parallelbeleg, Grenze oder Zugriffsbeleg. Keine zusätzliche positive Normfreigabe.'});
 }
 assert.equal(crosswalk.length,64);const operative=crosswalk.filter(row=>row.catalogSourceId!==null);assert.equal(operative.length,19);
 const sourceMap=new Map(operative.map(row=>[row.researchSourceId,row]));
 const ref=(id,locator)=>{const entry=sourceMap.get(id);assert.ok(entry,'Unprojected source '+id);return{sourceId:entry.catalogSourceId,locator:locator??entry.readingScope};};
 const refs=ids=>[...new Set(ids)].map(id=>ref(id));
 const sourceRows=operative.map(row=>({sourceId:row.catalogSourceId,kind:row.kind,url:row.url,versionDescription:row.versionDescription,reviewedOn:'2026-10-28',
  reviewBasis:'AP23M1 M1 A bis M1 G fachlich abgenommen. Isolierte M2-Vertragsprobe ohne Quellenrelease. '+row.roleLimit,locators:row.readingScope}));
 const catalog=structuredClone(old);Object.assign(catalog,{$schema:M2_SCHEMA_IDS.catalog,formatVersion:'10.0.0',contractStatus:'proposed',runtimeActive:false,
  contractDecision:{id:'DEC-2026-042',status:'proposed',on:null},review:{checkedOn:'2026-10-28',basis:'196 alte Fachpfade und historische Fachobjekte unverändert. 49 fachlich abgenommene NE-/VD-/VS-Gruppen als isolierter Vorschlag.',
   sourceReview:'Gemeinsame Quellenreleasefreigabe ausstehend. 35 physische Kalender und 499 Katalogregeln unverändert. NE-Jahresvorbehalt bleibt berechenbare Grenze.'}});
 catalog.sources.push(...sourceRows);
 const descriptors=new Map(manifest0.artifacts.map(row=>[row.contentId,structuredClone(row)]));
 const physicalRefs=ids=>[...ids,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const d=descriptors.get(id);assert.ok(d);return{role:d.role,contentId:id,sha256:d.sha256,path:d.path};});
 const terminal=id=>{const projection=holidayCatalog.activation.projections.find(row=>row.calendarId===id);assert.ok(projection);return{calendarId:id,projectionId:projection.id};};
 for(const[canton,definition]of Object.entries(DEFINITIONS)){
  catalog.laws.push({lawId:definition.lawId,canton,title:definition.title,holidayPolicyReview:{explicitDeviation:'noneIdentifiedInReviewedGeneralLaw',sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031'},sourceRefs:refs(definition.statutes)});
  for(const kind of canton==='NE'?['three']:['none','three'])catalog.suspensionProfiles.push({suspensionProfileId:canton.toLowerCase()+'-'+kind,lawId:definition.lawId,periods:periods(canton,kind),sourceRefs:refs(definition.statutes)});
  const variants=canton==='NE'?['admin','court']:['fixed'];
  for(const variant of variants){const ids=canton==='NE'&&variant==='admin'?definition.calendars:[definition.calendars[0]];
   const selection=canton==='NE'&&variant==='admin'?{kind:'qualifiedAuthoritySeatRegion',factKey:'authorityHolidayRegion',otherwise:'block',defaultAllowed:false,
    cases:[{value:'neWithoutLeLanderon',...terminal(ids[0])},{value:'leLanderon',...terminal(ids[1])}]}:{kind:'fixedAuthoritySeat',...terminal(ids[0])};
   const id=canton==='NE'?'ne-'+variant+'-qualified-authority-seat':canton.toLowerCase()+'-qualified-authority-seat';
   catalog.holidayBindings.push({holidayBindingId:id,lawId:definition.lawId,authoritySeatCanton:canton,authorityLevel:'cantonal',bindingVersion:'10.0.0',anchor:'authoritySeat',
    physicalSource:{releaseId:RELEASE,references:physicalRefs(ids),eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
    legalBinding:{sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
    calendarSelection:selection,proceduralCalendarSupplement:{kind:'none'}});
  }
 }
 const researchMap={workPackage:'AP23M2',acceptedResearch:RESEARCH,originalCaseCount:109,caseFactsAreCurrentNotDefaults:true,
  vdArticle81Limit:'Qualified current legal scope only. No numeric inference distinguishing an initial order from an extension.',paths:[]};
 for(const row of research.paths){
  const definition=DEFINITIONS[row.canton],proposal=models[row.canton].pathProposals.find(path=>path.id===row.id);assert.ok(proposal);
  const sources=refs([...row.sourceIds,...definition.holidaySources,...definition.chronologicalSources]);
  // Preserve precise research locators where provided instead of flattening them into source titles.
  for(const basis of proposal.legalBasis??[])if(typeof basis==='object'){const target=sources.find(ref=>ref.sourceId===sourceId(basis.sourceId));assert.ok(target);target.locator=basis.locator;}
  const path={pathId:row.id.toLowerCase(),revision:1,researchRef:row.id,contractFamily:'qualifiedDayProcedureV10',lawId:definition.lawId,action:row.actionQualification,
   stages:stagesFor(row),duration:durationFor(row),suspensionSelection:selectionFor(row),openingPolicy:openingFor(row,sources),holidayBindingId:bindingIdFor(row),
   urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',endShiftGuard:row.suspension==='none'?'none':'blockWhenEnteringApplicableSuspension',
   qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
   temporalBinding:{caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},sourceCoverage:{...WINDOW},evaluation:'eachEvaluatedDayIncludingEndShift',futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},
   normTimeline:[{researchBindingId:row.canton+'-NORMS-WINDOW',interval:{...WINDOW},sourceRefs:refs(definition.chronologicalSources)}],sourceRefs:sources,openingWarnings:[]};
  const requirements=row.requirements.map(projectM2Requirement),policy={pathId:path.pathId,pathRevision:1,pathSha256:objSha(path),mode:'qualifiedDayProcedureV10',requirements,
   openingChainPolicy:'notApplicable',localHolidayPolicy:'boundProceduralCalendarSupplement'};
  catalog.paths.push(path);catalog.qualificationPolicies.push(policy);catalog.releaseBinding.pathEligibility.push(eligibilityFor(path,policy,catalog));
  researchMap.paths.push({researchId:row.id,pathId:path.pathId,lawId:path.lawId,sourceStage:row.stage,technicalStages:path.stages,originalRequirements:row.requirements,
   projectedRequirements:requirements,openingKind:path.openingPolicy.kind,holidayBindingId:path.holidayBindingId,noImplicitCaseFacts:true});
 }
 for(const[canton,model]of Object.entries(models)){
  const exclusions=model.exclusions??model.inventoryOutsidePositive??model.inventory?.filter(row=>!String(row.handling).startsWith('positive'))??[];
  exclusions.forEach((entry,index)=>catalog.excludedPaths.push({exclusionId:'m1-'+canton.toLowerCase()+'-'+(index+1),scope:canton+': '+(typeof entry==='string'?entry:entry.norm??entry.id??entry.subject??JSON.stringify(entry)),reason:typeof entry==='string'?entry:entry.finding??entry.reason??JSON.stringify(entry)}));
 }
 const additions=[GUARD,ACCEPTED_RECEIPT,RESEARCH,'outputs/ap23m1-2026-10-27/local-completion.json',...crosswalk.flatMap(row=>row.evidence.map(item=>item.path)),...['ne','vd','vs'].flatMap(code=>['docs/fachrecht/ap23m1/befund-'+code+'.json','docs/fachrecht/ap23m1/quellen-'+code+'.json'])];
 const preserved=new Map(catalog.preserved.map(row=>[row.path,row]));for(const path of additions){const hash=path===GUARD?GUARD_SHA256:guard.files[path];assert.ok(hash);
  if(preserved.has(path))assert.equal(preserved.get(path).sha256,hash);else{catalog.preserved.push({path,sha256:hash});preserved.set(path,{path,sha256:hash});}}
 filesMap.set(ADMIN,encode(catalog));Object.assign(descriptors.get('ch-cantonal-administrative-procedures'),{schemaId:M2_SCHEMA_IDS.catalog,sha256:sha(filesMap.get(ADMIN)),byteLength:Buffer.byteLength(filesMap.get(ADMIN))});
 const manifest=structuredClone(manifest0);Object.assign(manifest,{$schema:M2_SCHEMA_IDS.localManifest,formatVersion:'17.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-28'});
 manifest.compatibility.minimumConsumerFormatVersion='17.0.0';manifest.artifacts=[...descriptors.values()];
 manifest.sourceSummary={latestReviewedOn:'2026-10-28',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds:[...new Set([...manifest0.sourceSummary.sourceIds,...sourceRows.map(row=>row.sourceId)])].sort()};
 manifest.extensions={'steimer.local-reference':{workPackage:'AP23M2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,calendarExportEnabled:false,
  contractDecision:'DEC-2026-042',contractDecisionStatus:'proposed',acceptedResearchSha256:guard.files[RESEARCH],acceptedReceiptSha256:guard.files[ACCEPTED_RECEIPT],startGuardSha256:GUARD_SHA256,
  baselineManifestSha256:guard.files[BASE+'/manifest.json'],historicalPayloadPolicy:'43 unchanged L3 artifacts and all196 historical path/policy/eligibility objects retain their prior bindings. No source release, native runtime reader or export capability.'}};
 const manifestText=encode(manifest),crosswalkText=encode({workPackage:'AP23M2',mappingOnly:true,sourceRows:crosswalk,operativeCatalogSources:operative.length,belegFiles:64,
  roleMeaning:'64 original accepted evidence files retain their distinct roles. Only nineteen explicitly referenced norm, commencement or practice sources project into technical catalog rows. No source release.'}),researchMapText=encode(researchMap);
 const counts={artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,newArtifacts:0,preservedPaths:196,newPaths:49,totalPaths:245,qualificationPolicies:245,
  laws:catalog.laws.length,suspensionProfiles:catalog.suspensionProfiles.length,holidayBindings:catalog.holidayBindings.length,newSources:19,totalSources:catalog.sources.length,
  physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,newProceduralSupplementDates:0,belegFiles:64,socialRules:44,socialBernBindings:50};
 const integrity={kind:'ap23m2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,runtimeReadable:false,productionActivation:false,calendarExportEnabled:false,sourceReview:'pending',counts,
  basedOn:[GUARD,...additions.filter(path=>path!==GUARD),BASE+'/manifest.json',BASE+'/'+ADMIN].map(path=>({path,sha256:path===GUARD?GUARD_SHA256:guard.files[path]})),
  manifest:{path:OUTPUT+'/bundle/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},sourceCrosswalk:{path:OUTPUT+'/source-crosswalk.json',byteLength:Buffer.byteLength(crosswalkText),sha256:sha(crosswalkText)},
  researchMap:{path:OUTPUT+'/research-map.json',byteLength:Buffer.byteLength(researchMapText),sha256:sha(researchMapText)},artifacts:manifest.artifacts.map(row=>({path:OUTPUT+'/bundle/'+row.path,byteLength:row.byteLength,sha256:row.sha256}))};
 const built={old,catalog,holidayCatalog,manifest,manifest0,filesMap,files:filesMap,manifestText,integrity,crosswalk,crosswalkText,research,researchMap,researchMapText,sourceRows,models};
 assertM2Preservation(built);return built;
}
export function assertM2Preservation(built){
 const{old,catalog,manifest0,filesMap}=built;
 for(const[field,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['holidayBindings','holidayBindingId'],['laws','lawId'],['sources','sourceId'],['suspensionProfiles','suspensionProfileId'],['excludedPaths','exclusionId'],['preserved','path']]){
  const actual=new Map(catalog[field].map(row=>[row[id],row]));assert.equal(actual.size,catalog[field].length,'Duplicate '+field);for(const row of old[field])assert.equal(canonical(actual.get(row[id])),canonical(row),'Changed old '+field+'/'+row[id]);}
 const eligibility=new Map(catalog.releaseBinding.pathEligibility.map(row=>[row.pathId,row]));for(const row of old.releaseBinding.pathEligibility)assert.deepEqual(eligibility.get(row.pathId),row,'Changed old eligibility');
 for(const d of manifest0.artifacts)if(d.path!==ADMIN){assert.equal(sha(filesMap.get(d.path)),d.sha256);assert.equal(Buffer.byteLength(filesMap.get(d.path)),d.byteLength);}
 assert.equal(catalog.paths.length,245);assert.equal(catalog.holidayBindings.length,36);assert.equal(catalog.laws.length,25);assert.equal(catalog.suspensionProfiles.length,46);
 assert.equal(catalog.contractDecision.status,'proposed');assert.equal(catalog.runtimeActive,false);assert.equal(catalog.releaseBinding.status,'candidate');
 for(const key of['releaseId','approval','sourceReviewRef','referenceSuiteRef'])assert.equal(catalog.releaseBinding[key],null);assert.deepEqual(catalog.releaseBinding.targetComponentRefs,[]);
 for(const e of catalog.releaseBinding.pathEligibility){assert.equal(e.status,'candidate');assert.deepEqual(e.targetComponentRefs,[]);assert.equal(e.sourceReviewRef,null);assert.equal(e.referenceSuiteRef,null);}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));const built=await buildM2Candidate();
 const payloads=[...built.filesMap].map(([path,bytes])=>[OUTPUT+'/bundle/'+path,bytes]).concat([[OUTPUT+'/bundle/manifest.json',built.manifestText],[OUTPUT+'/source-crosswalk.json',built.crosswalkText],[OUTPUT+'/research-map.json',built.researchMapText],[OUTPUT+'/candidate-integrity.json',encode(built.integrity)]]);
 for(const[path,bytes]of payloads)if(process.argv[2]==='--write'){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes);}else assert.equal(await readFile(resolve(ROOT,path),'utf8'),bytes,'Stale isolated M2 file '+path);
 console.log(JSON.stringify({workPackage:'AP23M2',status:process.argv[2]==='--write'?'isolated-structure-candidate-written':'isolated-structure-candidate-byte-equal',...built.integrity.counts},null,2));
}
