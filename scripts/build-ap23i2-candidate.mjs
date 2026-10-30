// SPDX-License-Identifier: AGPL-3.0-only
// AP23I2 is an isolated contract probe. No native reader, promotion or deployment.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {I2_SCHEMA_IDS,projectI2Requirement} from './build-ap23i2-schemas.mjs';

export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const BASE='data/candidates/2026-10-22-ap23h3';
export const OUTPUT='outputs/ap23i2-candidate-2026-10-22';
export const ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const HOLIDAYS='holiday-catalogs/ch-holiday-catalog.json';
export const RELEASE='2026-10-22-ap23i2-reference.1';
export const RESEARCH='docs/fachrecht/ap23i1/referenzfaelle.json';
export const WINDOW={from:'2026-08-29',to:'2027-12-31'};
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?
  '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
export const objSha=value=>sha(canonical(value));
export const encode=value=>JSON.stringify(value,null,2)+'\n';
const read=path=>readFile(resolve(ROOT,path),'utf8');
const json=async path=>JSON.parse(await read(path));
export const FIXED=[
  [BASE+'/manifest.json','14f60a83ed2f13e3f176f303e444ea43a606bae6980033e3d875093c63a5d429'],
  [BASE+'/'+ADMIN,'2d6a3894f162a25a4483ec7daf1fc8c5b5e70aed3bab83e544f60fea87782f05'],
  [RESEARCH,'5ac2b60af93ee9ee329b75484356c3442c6a93baf20ac26e4971c208d5d298c8'],
  ['docs/fachrecht/ap23i1/befund-gl.json','b0cd4de67b9c0d64f59d49c6e0be413230cf5f783a5957150c17fe842ded6af7'],
  ['docs/fachrecht/ap23i1/befund-tg.json','d3c4483b040e32fe9422613736b4738bbfa0a4474cdcbf4bd4b03232f3722f05'],
  ['outputs/ap23i1-2026-10-22/local-completion.json','6682f9394d03a2439293863c6493766b34cf2e14ef14a9b6367a2782fafb1991'],
  ['outputs/ap23i1-abnahme-2026-10-22/receipt.json','36580dd3e7c8b02b482edccc7781fe51bfbebf2d2b0fcf4f7d37317ca5397af6']
];
export const DEFINITIONS={
  GL:{lawId:'vrg-gl',title:'Gesetz über die Verwaltungsrechtspflege, Glarus',calendarId:'ap22-gl-87c11e156541',
    statute:'AP23I1-GL-VRG-20230101',holidaySources:['AP23I1-GL-VRG-20230101','AP23I1-GL-RTG-20190701','AP23I1-GL-FAHRT-18350524']},
  TG:{lawId:'vrg-tg',title:'Gesetz über die Verwaltungsrechtspflege, Thurgau',calendarId:'ap22-tg-3d6514fbabb1',
    statute:'AP23I1-TG-VRG-20240601',holidaySources:['AP23I1-TG-VRG-20240601','AP23I1-TG-RTG-20260101']}
};
export const sourceId=id=>(id.includes('-TVR')?'JUD-':'SRC-')+id;
export const STAGE_CROSSWALK={competentCantonalAdministrativeAuthority:'administration',competentCantonalDepartmentOrGovernment:'administrativeAppeal',
  cantonalAdministrativeCourt:'court',administrativeFirstInstance:'administration',administrativeAppeal:'administrativeAppeal',
  regierungsratComplaint:'administrativeAppeal',administrativeCourtComplaint:'court'};
export function durationFor(path){
  if(path.days!==null)return{kind:'statutoryDays',value:path.days,overridable:false};
  if(path.maximumDays!==undefined)return{kind:'concretisedStatutoryDays',minimum:path.minimumDays,maximum:path.maximumDays,
    overridable:false,confirmationFact:path.canton==='GL'?'shorteningEstablished':'concreteShortenedDurationQualified',legalNature:'statutoryNotExtendable'};
  return{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'};
}
export function selectionFor(path){
  return path.suspension==='tgNotice'?{kind:'currentFact',factKey:'exceptionNotice',cases:[
    {value:'given',suspensionProfileId:'tg-none'},{value:'absent',suspensionProfileId:'tg-three'}],otherwise:'block'}:
    {kind:'fixed',suspensionProfileId:path.canton.toLowerCase()+'-'+path.suspension};
}
export const periods=prefix=>[
  {periodId:prefix+'-easter',start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
  {periodId:prefix+'-summer',start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
  {periodId:prefix+'-winter',start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:2,yearOffset:1},inclusive:true}
];
export function closureFor(selection,catalog){
  const ids=selection.kind==='fixed'?[selection.suspensionProfileId]:selection.cases.map(row=>row.suspensionProfileId);
  return [...new Set(ids)].sort().map(id=>{const p=catalog.suspensionProfiles.find(p=>p.suspensionProfileId===id);assert.ok(p,id);return{suspensionProfileId:id,sha256:objSha(p)};});
}
export function eligibilityFor(path,policy,catalog){
  const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId);assert.ok(binding);
  return{status:'candidate',pathId:path.pathId,pathRevision:path.revision,pathSha256:objSha(path),
    holidayBindingId:binding.holidayBindingId,holidayBindingSha256:objSha(binding),
    suspensionSelectionSha256:objSha(path.suspensionSelection),suspensionProfiles:closureFor(path.suspensionSelection,catalog),
    qualificationPolicySha256:objSha(policy),caseCoverage:{...path.temporalBinding.caseCoverage},
    calculationCoverage:{...path.temporalBinding.calculationCoverage},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};
}

export async function buildI2Candidate(){
  for(const[path,pin]of FIXED)assert.equal(sha(await read(path)),pin,'Accepted input changed '+path);
  const receipt=await json(FIXED.at(-1)[0]);
  assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.i2Started,true);assert.equal(receipt.acceptedBy,'David Steimer');
  assert.equal(receipt.formatDecision,false);assert.equal(receipt.implementationStarted,false);
  const manifest0=await json(BASE+'/manifest.json'),files=new Map();
  for(const a of manifest0.artifacts){const bytes=await read(BASE+'/'+a.path);assert.equal(sha(bytes),a.sha256,a.path);
    assert.equal(Buffer.byteLength(bytes),a.byteLength,a.path);files.set(a.path,bytes);}
  assert.equal(files.size,44);
  const old=JSON.parse(files.get(ADMIN)),holidayCatalog=JSON.parse(files.get(HOLIDAYS)),research=await json(RESEARCH);
  assert.equal(old.paths.length,79);assert.equal(research.paths.length,34);assert.equal(research.cases.length,249);
  const [gl,tg]=await Promise.all(['gl','tg'].map(c=>json('docs/fachrecht/ap23i1/befund-'+c+'.json')));
  const usedPractice=new Set(research.paths.flatMap(path=>path.sourceIds).filter(id=>id.includes('-TVR')));
  const sourceModels=[...gl.laws,...tg.laws,...tg.practiceEvidence.filter(row=>usedPractice.has(row.id)),
    ...tg.additionalEvidence.filter(row=>row.id==='AP23I1-TG-BOTSCHAFT-20130625')];
  assert.equal(sourceModels.length,11);
  const crosswalk=sourceModels.map(s=>({researchSourceId:s.id,catalogSourceId:sourceId(s.id),url:s.url,
    kind:s.id.includes('-TVR')?'judgment':s.id.includes('-BOTSCHAFT')?'officialMaterials':'statute',
    versionDescription:s.versionFrom?s.versionFrom+' / Version '+s.versionId:
      s.decisionOn?s.decisionOn+' / '+s.court+(s.docket?' / '+s.docket:''):s.date+' / historische amtliche Botschaft',
    locators:s.locators.join(', '),roleLimit:s.limit??'Geltende Norm im abgenommenen I1-Untersuchungsfenster. Kein neuer Quellenrelease.',
    evidence:(s.evidence??[]).map(e=>({path:e.path,sha256:e.sha256,byteLength:e.byteLength}))}));
  const sourceRows=crosswalk.map(s=>({sourceId:s.catalogSourceId,kind:s.kind,url:s.url,versionDescription:s.versionDescription,
    reviewedOn:'2026-10-22',reviewBasis:'AP23I1 I1-A bis I1-G fachlich abgenommen. Isolierte I2-Probe, keine gemeinsame Releasequellenfreigabe.',locators:s.locators}));
  const ref=id=>{const s=sourceRows.find(row=>row.sourceId===sourceId(id));assert.ok(s,id);return{sourceId:s.sourceId,locator:s.locators};};
  const refs=ids=>ids.map(ref);
  const catalog=structuredClone(old);
  Object.assign(catalog,{$schema:I2_SCHEMA_IDS.catalog,formatVersion:'6.0.0',contractStatus:'proposed',runtimeActive:false,
    contractDecision:{id:'DEC-2026-038',status:'proposed',on:null},review:{basis:'Bestehende H3-Fachobjekte exakt erhalten. AP23I1 I1-A bis I1-G fachlich abgenommen. Isolierte AP23I2-Strukturprobe. DEC-2026-038 vorgeschlagen.',
      sourceReview:'Keine gemeinsame neue Releasequellenfreigabe. Alle 43 nichtadministrativen Artefakte behalten ihre historischen Quell- und Releasebindungen.',checkedOn:'2026-10-22'}});
  catalog.sources.push(...sourceRows);
  const descriptors=new Map(manifest0.artifacts.map(a=>[a.contentId,structuredClone(a)]));
  for(const[canton,d]of Object.entries(DEFINITIONS)){
    catalog.laws.push({lawId:d.lawId,canton,title:d.title,
      holidayPolicyReview:{explicitDeviation:'noneIdentifiedInReviewedGeneralLaw',sourceRefs:refs(d.holidaySources),projectDecisionRef:'DEC-2026-031'},
      sourceRefs:refs([d.statute])});
    for(const kind of['none','three'])catalog.suspensionProfiles.push({suspensionProfileId:canton.toLowerCase()+'-'+kind,lawId:d.lawId,
      periods:kind==='none'?[]:periods(canton.toLowerCase()),sourceRefs:[{...ref(d.statute),locator:canton==='GL'?'Art. 89–90, insbesondere Art. 90 Abs. 1–3':'§ 63 Abs. 1–2 und 4, administrative Abgrenzung §§ 35–54 und 55 Abs. 2'}]});
    const calendar=JSON.parse(files.get(descriptors.get(d.calendarId).path));
    const projection=holidayCatalog.activation.projections.find(p=>p.calendarId===d.calendarId);assert.ok(projection);
    for(const court of[false,true])catalog.holidayBindings.push({holidayBindingId:canton.toLowerCase()+'-'+(court?'court':'administration')+'-seat',
      lawId:d.lawId,authoritySeatCanton:canton,authorityLevel:'cantonal',anchor:court?'courtSeat':'authoritySeat',bindingVersion:'6.0.0',
      physicalBaseline:{releaseId:RELEASE,calendarId:d.calendarId,projectionId:projection.id,
        references:[d.calendarId,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const a=descriptors.get(id);return{role:a.role,contentId:id,sha256:a.sha256,path:a.path};}),
        eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
      legalBinding:{sourceRefs:refs(d.holidaySources),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
      physicalReuse:{kind:'sameDatesIndependentLegalBasis',sourceReleaseId:manifest0.releaseId,sourceCatalogSha256:descriptors.get('ch-holiday-catalog').sha256,
        selectedRuleIds:calendar.rules.map(row=>row.ruleId),projectionRuleIds:[...projection.ruleIds],permissionInheritance:'none',
        evidenceRefs:refs(d.holidaySources),notDerivedFrom:'notApplicable'},practiceAddition:null});
  }
  for(const p of research.paths){
    const pathId=p.id.toLowerCase(),d=DEFINITIONS[p.canton],court=p.canton==='GL'?p.id.startsWith('GL-COURT-'):p.stage==='administrativeCourtComplaint';
    const proposal=(p.canton==='GL'?gl:tg).pathProposals.find(row=>row.id===p.id);assert.ok(proposal);
    const sourceRefs=p.sourceIds.map(id=>{
      const value=ref(id);
      if(p.canton==='GL')value.locator=id.includes('-VRG-')?proposal.duration.basis+'; Art. 32, 89–90 und 140a VRG; '+
        (court?'Art. 105–108 VRG':p.id==='GL-ADMIN-INITIAL-ORDERED'?'Art. 28–36 VRG':'Art. 102–104 VRG'):'Art. 2 und 7 Ruhetagsgesetz';
      else value.locator=(proposal.locators??[]).filter(locator=>id.includes('-TVR')?locator.includes(id.split('-TVR')[1].replace('-',' Nr. ')):
        id.includes('-BOTSCHAFT')?locator.includes('Botschaft'):locator.startsWith('§')).join('; ')||value.locator;
      return value;
    }),path={pathId,revision:1,researchRef:p.id,contractFamily:'qualifiedDayProcedureV6',lawId:d.lawId,
      action:p.action,stages:[STAGE_CROSSWALK[p.stage]],duration:durationFor(p),suspensionSelection:selectionFor(p),
      holidayBindingId:p.canton.toLowerCase()+'-'+(court?'court':'administration')+'-seat',urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',
      endShiftGuard:p.endShiftCollision==='proposedBoundary'?'blockWhenEnteringApplicableSuspension':'none',
      qualification:{delivery:'qualifiedActualDelivery',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
      temporalBinding:{caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},sourceCoverage:{...WINDOW},evaluation:'eachEvaluatedDayIncludingEndShift',
        futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},
      normTimeline:research.temporalBindings[p.canton].map(t=>({researchBindingId:t.id,interval:{from:t.from,to:t.to},sourceRefs:structuredClone(sourceRefs)})),
      sourceRefs,openingWarnings:[]};
    const policy={pathId,pathRevision:1,pathSha256:objSha(path),mode:'qualifiedDayProcedureV6',
      requirements:[...research.sharedRequirements,...p.requirements].map(projectI2Requirement),openingChainPolicy:'notApplicable',localHolidayPolicy:'notApplicable'};
    catalog.paths.push(path);catalog.qualificationPolicies.push(policy);
    catalog.releaseBinding.pathEligibility.push(eligibilityFor(path,policy,catalog));
  }
  for(const[exclusionId,scope,reason]of[
    ['i1-gl-old-law','GL Art. 140a VRG','Aktuelle Instanz muss geltendem neuen Recht unterstehen. Empfang 2026 ersetzt keine Übergangsrechtsqualifikation.'],
    ['i1-gl-einsprache','GL spezialgesetzliche Einsprache und Wiedererwägung','Keine positive allgemeine Einsprache- oder Wiedererwägungsdauer aus sinngemässen Verweisungen.'],
    ['i1-concrete-shortening','GL/TG konkrete verkürzte gesetzliche Rechtsmittelfrist','Konkrete gültige Verkürzung und Tagesdauer sind aktuelle Falltatsachen. Keine feste Zwei- oder Fünftagesdauer aus blosser Verkürzungsmöglichkeit.'],
    ['i1-tg-notice','TG § 63 Abs. 4 aktuelle Ausnahmebelehrung','Vorhanden und vollständig fehlend getrennt. Unbekannte, unvollständige oder widersprüchliche Belehrung bleibt ohne Ergebnis.'],
    ['i1-end-suspension','GL/TG reine Endverschiebung in neue Ferien','Nur konkrete Kollision ohne definitiven Wert und Export. Keine generelle Sperre gewöhnlicher Wochenendverschiebungen.'],
    ['i1-opening-payment-appointments','GL/TG Eröffnung, Zahlung und fixe Termine','Nur qualifizierte tatsächlich eröffnete schriftliche Tagesfrist. Kein fixer Termin, keine Zahlung, keine ungeklärte elektronische Eröffnung oder Zustellfiktion.']
  ])catalog.excludedPaths.push({exclusionId,scope,reason});
  for(const[path,sha256]of FIXED)catalog.preserved.push({path,sha256});
  files.set(ADMIN,encode(catalog));
  Object.assign(descriptors.get('ch-cantonal-administrative-procedures'),{schemaId:I2_SCHEMA_IDS.catalog,
    sha256:sha(files.get(ADMIN)),byteLength:Buffer.byteLength(files.get(ADMIN))});
  const manifest=structuredClone(manifest0);
  Object.assign(manifest,{$schema:I2_SCHEMA_IDS.localManifest,formatVersion:'13.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-22'});
  manifest.compatibility.minimumConsumerFormatVersion='13.0.0';manifest.artifacts=[...descriptors.values()];
  manifest.sourceSummary={latestReviewedOn:'2026-10-22',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',
    sourceIds:[...new Set([...files.values()].flatMap(bytes=>(JSON.parse(bytes).sources??[]).map(s=>s.sourceId)))].sort()};
  manifest.extensions={'steimer.local-reference':{workPackage:'AP23I2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,
    calendarExportEnabled:false,contractDecision:'DEC-2026-038',contractDecisionStatus:'proposed',acceptedResearchSha256:FIXED[2][1],
    acceptedReceiptSha256:FIXED.at(-1)[1],baselineManifestSha256:FIXED[0][1],
    historicalPayloadPolicy:'43 unchanged H3 artifacts retain historical source/target-release bindings. Only the administrative catalog changes. No new calendar or holiday rule. I3 must bind a coherent new release before any native activation.'}};
  const manifestText=encode(manifest),counts={artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,changedBaselineArtifacts:1,newArtifacts:0,
    preservedPaths:79,newPaths:34,totalPaths:113,qualificationPolicies:113,laws:15,suspensionProfiles:29,holidayBindings:21,newSources:11,
    physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,socialRules:44,socialBernBindings:50};
  const crosswalkText=encode({workPackage:'AP23I2',archiveIDsUnchanged:true,mappingOnly:true,sourceRows:crosswalk,
    stageCrosswalk:STAGE_CROSSWALK,stageMeaning:'Three technical stages only. Fine-grained accepted I1 authority/stage requirements remain current case facts.'});
  const integrity={kind:'ap23i2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,runtimeReadable:false,
    productionActivation:false,calendarExportEnabled:false,sourceReview:'pending',counts,basedOn:FIXED.map(([path,sha256])=>({path,sha256})),
    manifest:{path:OUTPUT+'/bundle/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
    sourceCrosswalk:{path:OUTPUT+'/source-crosswalk.json',byteLength:Buffer.byteLength(crosswalkText),sha256:sha(crosswalkText)},
    artifacts:manifest.artifacts.map(a=>({path:OUTPUT+'/bundle/'+a.path,byteLength:a.byteLength,sha256:a.sha256}))};
  return{old,research,befunde:{GL:gl,TG:tg},sourceRows,crosswalk,crosswalkText,holidayCatalog,catalog,manifest,manifest0,manifestText,files,integrity};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const write=process.argv.includes('--write');assert.ok(write||process.argv.includes('--check'));
  const built=await buildI2Candidate();
  const payloads=[...built.files].map(([path,bytes])=>[OUTPUT+'/bundle/'+path,bytes]).concat([
    [OUTPUT+'/bundle/manifest.json',built.manifestText],[OUTPUT+'/source-crosswalk.json',built.crosswalkText],[OUTPUT+'/candidate-integrity.json',encode(built.integrity)]]);
  for(const[path,bytes]of payloads)if(write){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes);}
  else assert.equal(await read(path),bytes,'Stale isolated I2 candidate '+path);
  console.log(JSON.stringify({structuralOnly:true,runtimeReadable:false,counts:built.integrity.counts,manifestSha256:sha(built.manifestText)},null,2));
}
