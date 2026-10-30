// SPDX-License-Identifier: AGPL-3.0-only
// Isolated J2 structure proposal. No native reader, release promotion or operation.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {J2_SCHEMA_IDS,projectJ2Requirement} from './build-ap23j2-schemas.mjs';
import {exact,safeRelative} from './prepare-ap23j2.mjs';

export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const BASE='data/candidates/2026-10-22-ap23i3';
export const OUTPUT='outputs/ap23j2-candidate-2026-10-27';
export const ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const HOLIDAYS='holiday-catalogs/ch-holiday-catalog.json';
export const RELEASE='2026-10-27-ap23j2-reference.1';
export const RESEARCH='docs/fachrecht/ap23j1/referenzfaelle.json';
export const WINDOW={from:'2026-08-29',to:'2027-12-31'};
export const GUARD='outputs/ap23j2-2026-10-27/protected-inputs.json';
export const GUARD_SHA256='1d65ba6006db51cea44198a52cb61def7830b67887e6f502aa8445a3f0cb6b17';
export const ACCEPTED_RECEIPT='outputs/ap23j1-abnahme-2026-10-27/receipt.json';
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value&&typeof value==='object'?
  '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
export const objSha=value=>sha(canonical(value));
export const encode=value=>JSON.stringify(value,null,2)+'\n';
const read=path=>readFile(resolve(ROOT,path));
const guard=JSON.parse(await exact(ROOT,GUARD,GUARD_SHA256));
assert.equal(guard.workPackage,'AP23J2');assert.equal(guard.capturedBeforeTechnicalPlanning,true);
assert.equal(guard.j1ProfessionallyAccepted,true);assert.equal(Object.keys(guard.files).length,4413);
for(const key of['formatDecision','productCodeChangePermission','runtimeActivation','sourceReleaseApproved','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(guard[key],false,key);
export async function readFixed(path){safeRelative(path);assert.ok(Object.hasOwn(guard.files,path),'Input absent from frozen J2 guard: '+path);return exact(ROOT,path,guard.files[path]);}
const json=async path=>JSON.parse(await readFixed(path));

export const DEFINITIONS={
  FR:{lawId:'cpja-fr',title:'Code de procédure et de juridiction administrative, Fribourg',calendarId:'ap22-fr-7d8c38f7c610',
    statuteIds:['AP23J1-FR-CPJA-7947','AP23J1-FR-CPJA-8637'],
    holidaySources:['AP23J1-FR-CPJA-7947','AP23J1-FR-CPJA-8637','AP23J1-FR-LJ-7926-FR','AP23J1-FR-MESSAGE-175-2009']},
  GE:{lawId:'lpa-ge',title:'Loi sur la procédure administrative, Genève',calendarId:'ap22-ge-a36ff7926d08',
    statuteIds:['J1-GE-LPA-20250601'],holidaySources:['J1-GE-LPA-20250601','J1-GE-LJF-19910101','J1-GE-ATA436-20240326','J1-GE-BGER7B32-20230906']},
  JU:{lawId:'cpa-ju',title:'Code de procédure administrative, Jura',calendarId:'ap22-ju-b096c09f506c',
    statuteIds:['AP23J1-JU-CPA-20240101'],holidaySources:['AP23J1-JU-CPA-20240101','AP23J1-JU-LJF-20230101']}
};

// Explicit, closed evidence projection. Bodies, source IDs and limits remain J1 evidence.
const SOURCE_DEFINITIONS=[
  ['AP23J1-FR-CPJA-7947','FR','statute','CPJA 150.1, Version 7947, 01.03.2024–30.09.2026','Art. 1–7, 27–35, 66–69, 79, 103–120, 128, 148 und Anhang 1'],
  ['AP23J1-FR-CPJA-8637','FR','statute','CPJA 150.1, Version 8637, ab 01.10.2026','Art. 1–7, 27–35, 66–69, 79, 103–120, 128, 148 und Anhang 1'],
  ['AP23J1-FR-LJ-7926-FR','FR','statute','LJ 130.1, Version 7926, ab 01.01.2024','Art. 1 und 121'],
  ['AP23J1-FR-LJ-7926-DE','FR','statute','JG 130.1, Version 7926, ab 01.01.2024, amtliche Sprachgegenkontrolle derselben Norm','Art. 1 und 121, keine zusätzliche Kalenderregel'],
  ['AP23J1-FR-ROF-2026-044','FR','statute','ROF 2026_044, Änderung 26.05.2026, ab 01.10.2026','Teil II, CPJA Anhang Art. A1-3 Abs. 1'],
  ['AP23J1-FR-ROF-2014-103','FR','statute','ROF 2014_103, historischer Änderungserlass ab 01.07.2015','Art. 5: CPJA Art. 29 Abs. 2bis, 30 Abs. 3 und 66 Abs. 3, ergänzend zur geltenden Konsolidierung'],
  ['AP23J1-FR-MESSAGE-175-2009','FR','officialMaterials','Botschaft Nr. 175 vom 14.12.2009, historisches Material','Kommentar Entwurf Art. 122, heute Art. 121 LJ, und CPJA Art. 27 Abs. 2'],
  ['AP23J1-FR-BGER-8C884-2010','FR','judgment','BGer 8C_884/2010 vom 12.01.2011, ergänzender historischer Beleg','E. 4–6, kantonale Hilfsbegründung ohne materielle Prüfung durch das Bundesgericht'],
  ['AP23J1-FR-BGER-2C741-2016','FR','judgment','BGer 2C_741/2016 vom 26.01.2017, ergänzender Zahlungssachverhalt','E. 6, keine positive Zahlungsfreigabe'],
  ['J1-GE-LPA-20250601','GE','statute','LPA E 5 10, Gesamtstand 01.06.2025, Art. 17 Abs. 6 ab 20.01.2025','Art. 1–6, 16–18A, 24, 46–52, 57–65, 87 und Änderungstabelle'],
  ['J1-GE-LJF-19910101','GE','statute','LJF J 1 45, aktueller Gesamtstand 01.01.1991','Art. 1 Abs. 1–2 und Fussnote a, keine Personalurlaubstage'],
  ['J1-GE-ATA436-20240326','GE','judgment','ATA/436/2024 vom 26.03.2024, ergänzende unmittelbare LPA-Praxis','E. 2.4–2.9, tatsächliche Eröffnung und Feiertagsbindung'],
  ['J1-GE-BGER7B32-20230906','GE','judgment','BGer 7B_32/2023 vom 06.09.2023, verfahrensübergreifender ergänzender Beleg','E. 4.3.2 und 5.2, Strafprozess-/Willkürprüfungsgrenze bleibt erhalten'],
  ['J1-GE-ATA520-20260526','GE','judgment','ATA/520/2026 vom 26.05.2026, ergänzende Kostenreklamationspraxis','Kostenreklamation und Eingabefrist. Fehlerhafter Ferienbeginn 17. Juli wird nicht übernommen'],
  ['AP23J1-JU-CPA-20240101','JU','statute','CPA RSJU 175.1, Version 8, ab 01.01.2024','Art. 1, 3–8, 44–48, 51, 86–89, 91, 94–98, 108–112, 117–125, 158, 160 und 172–173'],
  ['AP23J1-JU-LJF-20230101','JU','statute','LJF RSJU 555.1 vom 31.08.2022, ab 01.01.2023','Art. 3, 4, 9 und 11, nicht das aufgehobene Dekret 555.10'],
  ['AP23J1-JU-ADM121-2017','JU','judgment','JU ADM 121/2017 vom 09.11.2017, ergänzender historischer Volltextspiegel','E. 1–2, vorsorgliche Massnahmen und getrennte Zulässigkeitsprüfung, keine Freigabe des damaligen Falls'],
  ['AP23J1-JU-ADM77-2021','JU','judgment','JU ADM 77/2021 vom 30.08.2021, ergänzender historischer Volltextspiegel','E. 1.3, Osterstillstand, kein allgemeiner Nachweis der reinen Endverschiebungskollision'],
  ['AP23J1-JU-BGER2D55-2010','JU','judgment','BGer 2D_55/2010 vom 01.03.2011, ergänzender historischer Volltextspiegel','E. 2.1–2.3, kein automatischer voller Fristneubeginn nach nachgelieferten Gründen']
];
const sourceDefinitions=new Map(SOURCE_DEFINITIONS.map(row=>[row[0],row]));
assert.equal(sourceDefinitions.size,19);
export const sourceId=id=>{const source=sourceDefinitions.get(id);assert.ok(source,'Unaccepted J1 source '+id);return(source[2]==='judgment'?'JUD-':'SRC-')+id;};
export const STAGE_CROSSWALK={
  cantonalAdministrationOrNonTribunalCantonalRemedy:['administration','administrativeAppeal'],
  nonTribunalCantonalAdministrativeRemedy:['administrativeAppeal'],nonTribunalCantonalReclamation:['administrativeAppeal'],
  tribunalCantonal:['court'],tribunalCantonalJudgmentReasonsRequest:['court'],tribunalCantonalCostsReclamation:['court'],
  initialAdministration:['administration'],reclamation:['administrativeAppeal'],costsReclamation:['administrativeAppeal','court'],
  administrativeAppeal:['administrativeAppeal','court'],administrativeFirstInstance:['administration'],
  opposition:['administrativeAppeal'],oppositionProvisional:['administrativeAppeal'],
  administrativeReview:['administrativeAppeal','court'],administrativeReviewProvisional:['administrativeAppeal','court'],
  oppositionOrAdministrativeReview:['administrativeAppeal','court'],oppositionOrAdministrativeReviewProvisional:['administrativeAppeal','court']
};
export function stagesFor(path){const stages=STAGE_CROSSWALK[path.stage];assert.ok(stages,'Unmapped accepted J1 stage '+path.stage);return [...stages];}
export function durationFor(path){return path.days===null?{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}:
  {kind:'statutoryDays',value:path.days,overridable:false};}
export function selectionFor(path){assert.ok(['none','two','three'].includes(path.suspension));return{kind:'fixed',suspensionProfileId:path.canton.toLowerCase()+'-'+path.suspension};}
export function openingFor(path,sourceRefs){
  const refs=sourceRefs.filter(ref=>path.canton==='GE'?ref.sourceId===sourceId('J1-GE-LPA-20250601')||ref.sourceId===sourceId('J1-GE-LJF-19910101'):
    path.canton==='FR'?ref.sourceId.startsWith('SRC-AP23J1-FR-CPJA-'):ref.sourceId===sourceId('AP23J1-JU-CPA-20240101'));
  assert.ok(refs.length,'Opening lacks qualified source');
  if(path.canton==='GE')return{kind:'geQualifiedOrOrdinaryPost',factKey:'openingMode',allowedModes:['qualifiedLegalOpening','ordinaryPostPhysicalReceipt'],
    ordinaryPostTransformation:'nextWorkingDayIfNonWorkingReceipt',holidayBinding:'sameAsPath',otherwise:'block',sourceRefs:refs};
  const triggerKind=path.id.includes('NACHFRIST-3')?'qualifiedExtensionRefusalAfterExpiredDeadline':path.id==='FR-TC-BEGRUENDUNG-30'?'qualifiedTcDispositifOpening':
    path.id.startsWith('JU-CONFIRMATION-REQUEST5-')?'qualifiedOralDecisionOpening':path.id.startsWith('JU-MOTIVATION-REQUEST30-')?'qualifiedFullyFavourableAbbreviatedOpening':'qualifiedWrittenOpening';
  return{kind:'qualifiedCurrentTrigger',triggerKind,transformation:'none',sourceRefs:refs};
}
export const periods=(prefix,kind)=>{
  const all=[
    {periodId:prefix+'-easter',start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
    {periodId:prefix+'-summer',start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
    {periodId:prefix+'-winter',start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:2,yearOffset:1},inclusive:true}
  ];return kind==='none'?[]:kind==='two'?[all[0],all[2]]:all;
};
export function closureFor(selection,catalog){assert.equal(selection.kind,'fixed');const profile=catalog.suspensionProfiles.find(row=>row.suspensionProfileId===selection.suspensionProfileId);assert.ok(profile);return[{suspensionProfileId:profile.suspensionProfileId,sha256:objSha(profile)}];}
export function eligibilityFor(path,policy,catalog){
  const binding=catalog.holidayBindings.find(row=>row.holidayBindingId===path.holidayBindingId);assert.ok(binding);
  return{status:'candidate',pathId:path.pathId,pathRevision:path.revision,pathSha256:objSha(path),holidayBindingId:binding.holidayBindingId,
    holidayBindingSha256:objSha(binding),suspensionSelectionSha256:objSha(path.suspensionSelection),suspensionProfiles:closureFor(path.suspensionSelection,catalog),
    openingPolicySha256:objSha(path.openingPolicy),qualificationPolicySha256:objSha(policy),caseCoverage:{...path.temporalBinding.caseCoverage},
    calculationCoverage:{...path.temporalBinding.calculationCoverage},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};
}
export function bindingIdFor(path){
  if(path.canton==='FR')return path.id.startsWith('FR-TC-')?'fr-tc-authority-seat':'fr-nontc-authority-seat';
  return path.canton.toLowerCase()+'-'+(stagesFor(path).length===1&&stagesFor(path)[0]==='administration'?'initial':'review')+'-authority-seat';
}
const INITIAL_FIXED=[BASE+'/manifest.json',BASE+'/'+ADMIN,RESEARCH,'outputs/ap23j1-2026-10-27/local-completion.json',ACCEPTED_RECEIPT,
  ...['fr','ge','ju'].flatMap(c=>['docs/fachrecht/ap23j1/befund-'+c+'.json','outputs/ap23j1-2026-10-27/sources/'+c+'/source-bindings.json'])];
export const FIXED=[[GUARD,GUARD_SHA256],...INITIAL_FIXED.map(path=>{assert.ok(guard.files[path]);return[path,guard.files[path]];})];

export function assertJ2Preservation(built){
  const{old,catalog,files,manifest0}=built;
  for(const[key,id]of[['paths','pathId'],['qualificationPolicies','pathId'],['sources','sourceId'],['laws','lawId'],['suspensionProfiles','suspensionProfileId'],['holidayBindings','holidayBindingId'],['excludedPaths','exclusionId'],['preserved','path']]){
    const rows=new Map(catalog[key].map(row=>[row[id],row]));assert.equal(rows.size,catalog[key].length,'Duplicate '+key);
    for(const row of old[key])assert.equal(canonical(rows.get(row[id])),canonical(row),'Changed I3 '+key+' '+row[id]);
  }
  const eligible=new Map(catalog.releaseBinding.pathEligibility.map(row=>[row.pathId,row]));
  for(const row of old.releaseBinding.pathEligibility)assert.equal(canonical(eligible.get(row.pathId)),canonical(row),'Changed I3 path eligibility '+row.pathId);
  for(const descriptor of manifest0.artifacts)if(descriptor.path!==ADMIN){const bytes=files.get(descriptor.path);assert.equal(sha(bytes),descriptor.sha256,'Changed nonadministrative bytes '+descriptor.path);assert.equal(Buffer.byteLength(bytes),descriptor.byteLength);}
  assert.equal(catalog.releaseBinding.status,'candidate');
  for(const key of['releaseId','approval','sourceReviewRef','referenceSuiteRef'])assert.equal(catalog.releaseBinding[key],null,key);
  assert.deepEqual(catalog.releaseBinding.targetComponentRefs,[]);
  for(const entry of catalog.releaseBinding.pathEligibility){assert.equal(entry.status,'candidate');assert.deepEqual(entry.targetComponentRefs,[]);assert.equal(entry.sourceReviewRef,null);assert.equal(entry.referenceSuiteRef,null);}
}

export async function buildJ2Candidate(){
  for(const[path,hash]of FIXED)assert.equal(sha(path===GUARD?await exact(ROOT,path,hash):await readFixed(path)),hash,'Changed J2 input '+path);
  const receipt=await json(ACCEPTED_RECEIPT);assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.j2Started,true);
  assert.equal(receipt.acceptedBy,'David Steimer');assert.equal(receipt.formatDecision,false);assert.equal(receipt.implementationStarted,false);
  assert.deepEqual(receipt.acceptedDecisionPoints,['J1-A','J1-B','J1-C','J1-D','J1-E','J1-F','J1-G']);
  const manifest0=await json(BASE+'/manifest.json'),files=new Map();
  for(const descriptor of manifest0.artifacts){const bytes=await readFixed(BASE+'/'+descriptor.path);assert.equal(sha(bytes),descriptor.sha256);assert.equal(bytes.length,descriptor.byteLength);files.set(descriptor.path,bytes.toString('utf8'));}
  assert.equal(files.size,44);assert.equal(manifest0.formatVersion,'13.0.0');
  const old=JSON.parse(files.get(ADMIN)),holidayCatalog=JSON.parse(files.get(HOLIDAYS)),research=await json(RESEARCH);
  assert.equal(old.paths.length,113);assert.equal(old.qualificationPolicies.length,113);assert.equal(research.paths.length,36);assert.equal(research.cases.length,673);
  const befunde=Object.fromEntries(await Promise.all(['fr','ge','ju'].map(async c=>[c.toUpperCase(),await json('docs/fachrecht/ap23j1/befund-'+c+'.json')])));
  for(const model of research.sourceModels)assert.equal(sha(await readFixed(model.path)),model.sha256);
  const registers=Object.fromEntries(await Promise.all(['fr','ge','ju'].map(async c=>[c.toUpperCase(),await json('outputs/ap23j1-2026-10-27/sources/'+c+'/source-bindings.json')])));
  const crosswalk=[];
  for(const[id,canton,kind,versionDescription,locators]of SOURCE_DEFINITIONS){
    const row=registers[canton].sources.find(source=>source.id===id);assert.ok(row,'Unbound source '+id);
    const path=row.path??'outputs/ap23j1-2026-10-27/sources/'+canton.toLowerCase()+'/'+row.file;
    const bytes=await readFixed(path);assert.equal(sha(bytes),row.sha256);assert.equal(bytes.length,row.byteLength??row.bytes);
    let capturedCanonicalUrl=null;
    if(id==='AP23J1-JU-BGER2D55-2010'){
      const captured=JSON.parse(bytes);assert.equal(captured.source_url,row.url);
      assert.equal(captured.canonical_url,'https://mcp.opencaselaw.ch/entscheid/bger_2D_55_2010');capturedCanonicalUrl=captured.canonical_url;
    }
    crosswalk.push({researchSourceId:id,catalogSourceId:sourceId(id),canton,kind,url:row.url,researchUrl:row.url,capturedCanonicalUrl,
      urlProjection:'noneOriginalResearchUrlPreserved',versionDescription,locators,
      researchRole:row.role,roleLimit:row.reviewScope??row.read??row.role,evidenceFinding:row.finding??null,
      evidence:[{path,sha256:sha(bytes),byteLength:bytes.length}],archiveIDsUnchanged:true,
      normativeMeaning:kind==='statute'?(row.role.includes('amending')?'Enacted amending statute. Its exact current or historical role is retained, not a substitute for the separately bound consolidated version.':
        'Applicable only in the expressly bound normative interval and accepted role. Language countercheck is not a separate holiday permission.'):
        kind==='judgment'?'Supplementary practice with the exact accepted procedural and historical limits. Not an independent current enactment.':'Legislative material or amendment context, not an independent replacement of the currently bound consolidated norm.'});
  }
  assert.equal(new Set(crosswalk.map(row=>row.catalogSourceId)).size,19);
  const sourceRows=crosswalk.map(source=>({sourceId:source.catalogSourceId,kind:source.kind,url:source.url,versionDescription:source.versionDescription,
    reviewedOn:'2026-10-27',reviewBasis:'AP23J1 J1-A bis J1-G fachlich abgenommen. Isolierte J2-Vertragsprobe, keine neue gemeinsame Quellenreleasefreigabe. Rolle: '+source.researchRole,locators:source.locators}));
  const byResearchId=new Map(crosswalk.map(row=>[row.researchSourceId,row]));
  const ref=(id,locator)=>{const source=byResearchId.get(id);assert.ok(source,'Unprojected J1 source '+id);return{sourceId:source.catalogSourceId,locator:locator??source.locators};};
  const refs=ids=>ids.map(id=>ref(id));
  const catalog=structuredClone(old);
  Object.assign(catalog,{$schema:J2_SCHEMA_IDS.catalog,formatVersion:'7.0.0',contractStatus:'proposed',runtimeActive:false,
    contractDecision:{id:'DEC-2026-039',status:'proposed',on:null},review:{basis:'113 I3-Pfade und sämtliche alten Fachobjekte exakt erhalten. AP23J1 J1-A bis J1-G fachlich abgenommen. Isolierte J2-Probe, DEC-2026-039 vorgeschlagen.',
      sourceReview:'Keine gemeinsame Quellenreleasefreigabe. Alle 43 nichtadministrativen Artefakte und sämtliche historischen Bestandsbindungen unverändert. Keine native Aktivierung.',checkedOn:'2026-10-27'}});
  catalog.sources.push(...sourceRows);
  const descriptors=new Map(manifest0.artifacts.map(artifact=>[artifact.contentId,structuredClone(artifact)]));
  for(const[canton,definition]of Object.entries(DEFINITIONS)){
    catalog.laws.push({lawId:definition.lawId,canton,title:definition.title,
      holidayPolicyReview:{explicitDeviation:'noneIdentifiedInReviewedGeneralLaw',sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031'},sourceRefs:refs(definition.statuteIds)});
    for(const kind of canton==='FR'?['two','three']:['none','three'])catalog.suspensionProfiles.push({suspensionProfileId:canton.toLowerCase()+'-'+kind,
      lawId:definition.lawId,periods:periods(canton.toLowerCase(),kind),sourceRefs:definition.statuteIds.map(id=>ref(id,canton==='FR'?'CPJA Art. 30 Abs. 1–3, zusätzliche Sommerperiode nur für Angelegenheiten des TC':
        canton==='GE'?'LPA Art. 51 Abs. 4 und 63, kein allgemeiner Erstverfahrensstillstand, alle sechs Sachgebietsausnahmen bleiben vorbehalten':'CPA Art. 44a Abs. 1–2, tatsächliche Opposition oder Verwaltungsjustiz, echte Provisorien ohne Ferien'))});
    const calendar=JSON.parse(files.get(descriptors.get(definition.calendarId).path));
    const projection=holidayCatalog.activation.projections.find(row=>row.calendarId===definition.calendarId);assert.ok(projection);
    for(const role of canton==='FR'?['nontc','tc']:['initial','review'])catalog.holidayBindings.push({
      holidayBindingId:canton.toLowerCase()+'-'+role+'-authority-seat',lawId:definition.lawId,authoritySeatCanton:canton,authorityLevel:'cantonal',anchor:'authoritySeat',bindingVersion:'7.0.0',
      physicalBaseline:{releaseId:RELEASE,calendarId:definition.calendarId,projectionId:projection.id,
        references:[definition.calendarId,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const descriptor=descriptors.get(id);assert.ok(descriptor);return{role:descriptor.role,contentId:id,sha256:descriptor.sha256,path:descriptor.path};}),
        eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
      legalBinding:{sourceRefs:refs(definition.holidaySources),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
      physicalReuse:{kind:'sameDatesIndependentLegalBasis',sourceReleaseId:manifest0.releaseId,sourceCatalogSha256:descriptors.get('ch-holiday-catalog').sha256,
        selectedRuleIds:calendar.rules.map(rule=>rule.ruleId),projectionRuleIds:[...projection.ruleIds],permissionInheritance:'none',evidenceRefs:refs(definition.holidaySources),notDerivedFrom:'notApplicable'},practiceAddition:null});
  }
  const researchMap={workPackage:'AP23J2',acceptedResearch:RESEARCH,mappingOnly:true,caseFactsAreCurrentNotDefaults:true,
    stageCrosswalk:STAGE_CROSSWALK,stageMeaning:'Three existing technical stages. Mixed accepted functions retain explicit current target qualification, no new groups invented.',paths:[]};
  for(const researchPath of research.paths){
    const definition=DEFINITIONS[researchPath.canton],proposal=befunde[researchPath.canton].pathProposals.find(row=>row.id===researchPath.id);assert.ok(proposal);
    const sourceRefs=researchPath.sourceIds.map(id=>ref(id,id.includes('-CPJA-')?(proposal.articles??[]).join(', '):id==='J1-GE-LPA-20250601'?
      (proposal.basis??[]).filter(row=>row.sourceId===id).flatMap(row=>row.articles??[]).join(', '):id==='AP23J1-JU-CPA-20240101'?(proposal.locators??[]).join(', '):undefined));
    // Holiday and opening meaning is bound independently from a terse path source list.
    for(const id of definition.holidaySources)if(!sourceRefs.some(row=>row.sourceId===sourceId(id)))sourceRefs.push(ref(id));
    const pathId=researchPath.id.toLowerCase(),openingPolicy=openingFor(researchPath,sourceRefs);
    const normTimeline=research.temporalBindings[researchPath.canton].map(segment=>({researchBindingId:segment.id,interval:{from:segment.from,to:segment.to},
      sourceRefs:researchPath.canton==='FR'?[ref(segment.to==='2026-09-30'?'AP23J1-FR-CPJA-7947':'AP23J1-FR-CPJA-8637'),ref('AP23J1-FR-LJ-7926-FR')]:
        refs([...definition.statuteIds,researchPath.canton==='GE'?'J1-GE-LJF-19910101':'AP23J1-JU-LJF-20230101'])}));
    const path={pathId,revision:1,researchRef:researchPath.id,contractFamily:'qualifiedDayProcedureV7',lawId:definition.lawId,action:researchPath.action,
      stages:stagesFor(researchPath),duration:durationFor(researchPath),suspensionSelection:selectionFor(researchPath),openingPolicy,
      holidayBindingId:bindingIdFor(researchPath),urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',
      endShiftGuard:researchPath.endShiftCollision==='proposedBoundary'?'blockWhenEnteringApplicableSuspension':'none',
      qualification:{delivery:'qualifiedTriggerAccordingToOpeningPolicy',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
      temporalBinding:{caseCoverage:{...WINDOW},calculationCoverage:{...WINDOW},sourceCoverage:{...WINDOW},evaluation:'eachEvaluatedDayIncludingEndShift',
        futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},normTimeline,sourceRefs,openingWarnings:[]};
    const requirements=[...research.sharedRequirements,...researchPath.requirements].map(projectJ2Requirement);
    assert.equal(new Set(requirements.map(row=>row.key)).size,requirements.length,'Duplicate current requirement '+researchPath.id);
    const policy={pathId,pathRevision:1,pathSha256:objSha(path),mode:'qualifiedDayProcedureV7',requirements,openingChainPolicy:'notApplicable',localHolidayPolicy:'notApplicable'};
    catalog.paths.push(path);catalog.qualificationPolicies.push(policy);catalog.releaseBinding.pathEligibility.push(eligibilityFor(path,policy,catalog));
    researchMap.paths.push({researchId:researchPath.id,pathId,lawId:definition.lawId,technicalStages:[...path.stages],sourceStage:researchPath.stage,
      calendarBindingId:path.holidayBindingId,openingPolicyKind:openingPolicy.kind,triggerKind:openingPolicy.triggerKind??null,
      sourceIds:researchPath.sourceIds.map(sourceId),currentRequirements:requirements});
  }
  for(const[canton,befund]of Object.entries(befunde))for(const exclusion of befund.exclusions){
    const id=exclusion.id.toLowerCase(),exclusionId=id.startsWith('j1-')?id:'j1-'+id;
    catalog.excludedPaths.push({exclusionId,scope:canton+': '+(exclusion.scope??exclusion.provision??exclusion.id),
      reason:exclusion.treatment??exclusion.reason??exclusion.scope});
  }
  const preserved=new Map(catalog.preserved.map(row=>[row.path,row]));
  for(const[path,sha256]of[...FIXED,...crosswalk.flatMap(row=>row.evidence.map(item=>[item.path,item.sha256]))]){
    if(preserved.has(path))assert.equal(preserved.get(path).sha256,sha256);else{const row={path,sha256};catalog.preserved.push(row);preserved.set(path,row);}
  }
  files.set(ADMIN,encode(catalog));Object.assign(descriptors.get('ch-cantonal-administrative-procedures'),{schemaId:J2_SCHEMA_IDS.catalog,sha256:sha(files.get(ADMIN)),byteLength:Buffer.byteLength(files.get(ADMIN))});
  const manifest=structuredClone(manifest0);Object.assign(manifest,{$schema:J2_SCHEMA_IDS.localManifest,formatVersion:'14.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-27'});
  manifest.compatibility.minimumConsumerFormatVersion='14.0.0';manifest.artifacts=[...descriptors.values()];
  manifest.sourceSummary={latestReviewedOn:'2026-10-27',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',sourceIds:[...new Set([...manifest0.sourceSummary.sourceIds,...sourceRows.map(row=>row.sourceId)])].sort()};
  manifest.extensions={'steimer.local-reference':{workPackage:'AP23J2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,
    calendarExportEnabled:false,contractDecision:'DEC-2026-039',contractDecisionStatus:'proposed',acceptedResearchSha256:guard.files[RESEARCH],
    acceptedReceiptSha256:guard.files[ACCEPTED_RECEIPT],startGuardSha256:GUARD_SHA256,baselineManifestSha256:guard.files[BASE+'/manifest.json'],
    historicalPayloadPolicy:'43 unchanged I3 artifacts and all 113 old path/policy/eligibility objects retain historical bindings. No new physical calendar or rule. J3 must separately bind coherent actual target bytes after an express format decision.'}};
  const manifestText=encode(manifest),crosswalkText=encode({workPackage:'AP23J2',archiveIDsUnchanged:true,mappingOnly:true,sourceRows:crosswalk,
    stageCrosswalk:STAGE_CROSSWALK,roleMeaning:'Geltende Normen, amtliche Sprachgegenkontrolle, historische Materialien und begrenzte Praxis bleiben unterschieden. Keine eigenständige Quelle aus API-, Such- oder Texthilfsdateien.'});
  const researchMapText=encode(researchMap);
  const counts={artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:43,changedBaselineArtifacts:1,newArtifacts:0,preservedPaths:113,newPaths:36,totalPaths:149,
    qualificationPolicies:149,laws:18,suspensionProfiles:35,holidayBindings:27,newSources:19,totalSources:85,physicalCalendars:35,totalHolidayRules:499,newHolidayRules:0,
    socialRules:44,socialBernBindings:50};
  assert.equal(catalog.paths.length,149);assert.equal(catalog.qualificationPolicies.length,149);assert.equal(catalog.sources.length,85);assert.equal(catalog.laws.length,18);
  assert.equal(catalog.suspensionProfiles.length,35);assert.equal(catalog.holidayBindings.length,27);
  const integrity={kind:'ap23j2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,runtimeReadable:false,productionActivation:false,
    calendarExportEnabled:false,sourceReview:'pending',counts,basedOn:FIXED.map(([path,sha256])=>({path,sha256})),
    manifest:{path:OUTPUT+'/bundle/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
    sourceCrosswalk:{path:OUTPUT+'/source-crosswalk.json',byteLength:Buffer.byteLength(crosswalkText),sha256:sha(crosswalkText)},
    researchMap:{path:OUTPUT+'/research-map.json',byteLength:Buffer.byteLength(researchMapText),sha256:sha(researchMapText)},
    artifacts:manifest.artifacts.map(artifact=>({path:OUTPUT+'/bundle/'+artifact.path,byteLength:artifact.byteLength,sha256:artifact.sha256}))};
  const result={old,research,befunde,sourceRows,crosswalk,crosswalkText,holidayCatalog,catalog,manifest,manifest0,manifestText,files,integrity,researchMap,researchMapText};
  assertJ2Preservation(result);return result;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'||arg==='--check'));assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')));
  const write=process.argv.includes('--write');assert.ok(write||process.argv.includes('--check'));
  const built=await buildJ2Candidate(),payloads=[...built.files].map(([path,bytes])=>[OUTPUT+'/bundle/'+path,bytes]).concat([
    [OUTPUT+'/bundle/manifest.json',built.manifestText],[OUTPUT+'/source-crosswalk.json',built.crosswalkText],[OUTPUT+'/research-map.json',built.researchMapText],[OUTPUT+'/candidate-integrity.json',encode(built.integrity)]]);
  for(const[path,bytes]of payloads)if(write){assert.ok(path.startsWith(OUTPUT+'/'));await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes);}
  else assert.equal((await read(path)).toString('utf8'),bytes,'Stale isolated J2 candidate '+path);
  console.log(JSON.stringify({structuralOnly:true,runtimeReadable:false,counts:built.integrity.counts,manifestSha256:sha(built.manifestText)},null,2));
}
