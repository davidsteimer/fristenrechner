// SPDX-License-Identifier: AGPL-3.0-only
// Isolated contract/data structure. Never promotes a release or registers a reader.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {H2_SCHEMA_IDS} from './build-ap23h2-schemas.mjs';
export const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const BASE='data/candidates/2026-10-22-ap23g3';
export const OUTPUT='outputs/ap23h2-candidate-2026-10-22';
export const ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json';
export const HOLIDAYS='holiday-catalogs/ch-holiday-catalog.json';
export const RELEASE='2026-10-22-ap23h2-reference.1';
export const RESEARCH='docs/fachrecht/ap23h1/referenzfaelle.json';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?
  '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
export const objSha=v=>sha(canonical(v));
export const encode=v=>JSON.stringify(v,null,2)+'\n';
const read=p=>readFile(resolve(ROOT,p),'utf8');
const load=async p=>JSON.parse(await read(p));
const fixed=[
  [BASE+'/manifest.json','bf710be1a5e58b540d644e4dace885eed4dbe998a431badb9eec07032ea6bada'],
  [BASE+'/'+ADMIN,'cb1c0fa0b37f06d921d86f875e5a17a4b89fa9cb77eddcfe04e99d9d078a2d8e'],
  [RESEARCH,'d924f5e02b38ff3e594339d7c4cebc4c23478db7375ce1d97108451b5aefb094'],
  ['outputs/ap23h1-2026-10-22/local-completion.json','c7d12e796aab92309b38acc0fd10ff8792106d4d8d86e60efd2b47cc6748a47d'],
  ['outputs/ap23h1-abnahme-2026-10-22/receipt.json','66ecb1c71dea0fd2f2c46e708931a6984ce3ec23c56b1658aff8ba10fdf64318']
];
export const IDS={OW2025:'SRC-AP23H1-OW-STVG-20250101',OW2027:'SRC-AP23H1-OW-STVG-20270101',
  OWVGV:'SRC-AP23H1-OW-VGV-20110101',OWVWVV:'SRC-AP23H1-OW-VWVV-20200101',OWGOG:'SRC-AP23H1-OW-GOG-20220401',
  OWRTG:'SRC-AP23H1-OW-RTG-20090801',ZPO:'SRC-AP23H1-CH-ZPO-20260701',BGG:'SRC-AP23H1-CH-BGG-20260401',
  NWVRG:'SRC-AP23H1-NW-VRG-20260801',NWRTG:'SRC-AP23H1-NW-RTG-20160101'};
export const DEFINITIONS={OW:{lawId:'stvg-vgv-ow',title:'Staatsverwaltungsgesetz und Verordnungen über Verwaltungsverfahren, Obwalden',
  baselineCalendarId:'ap22-ow-76c151dccf1f',calendarId:'ap23h2-ow-procedural-core',sourceKey:'OWGOG',sourceDate:'2022-04-01'},
  NW:{lawId:'vrg-nw',title:'Gesetz über das Verwaltungsverfahren und die Verwaltungsrechtspflege, NG 265.1',
    baselineCalendarId:'ap22-nw-5dfca484e4af',calendarId:'ap23h2-nw-procedural-core',sourceKey:'NWVRG',sourceDate:'2026-08-01'}};
export const periods=prefix=>[
  {periodId:prefix+'-easter',start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
  {periodId:prefix+'-summer',start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
  {periodId:prefix+'-winter',start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:2,yearOffset:1},inclusive:true}
];
function actionBasis(id){
  if(id==='OW-ADMIN-20')return'Art. 64 und Art. 67 Abs. 1 StVG';
  if(id==='OW-COURT-30')return'Art. 8b VGV';
  if(id==='OW-ADMIN-REASONS-30')return'Art. 11 Abs. 2a VwVV mit Art. 112 Abs. 2 BGG';
  if(id==='OW-COURT-REASONS-30')return'Art. 14 Abs. 4 VGV mit Art. 112 Abs. 2 BGG';
  if(id==='OW-COURT-SUSPENSIVE-5')return'Art. 12 Abs. 3 VGV und abgenommene Massnahmenanalogie H1-C';
  if(id.startsWith('OW-'))return'Art. 64 StVG und Art. 15 VGV, konkrete Tagesanordnung';
  if(id==='NW-EINSPRACHE-20')return'Art. 56 Abs. 2 Ziff. 3, Art. 62/64 und 71 VRG';
  if(id==='NW-EINWENDUNG-ORDERED')return'Art. 60b Abs. 2 mit Art. 33a Abs. 1 VRG';
  if(id.includes('VERNEHMLASSUNG'))return'Art. 76 Abs. 2–3 VRG';
  if(id.includes('REPLIK'))return'Art. 77 Abs. 1 und 3 VRG';
  if(id.includes('DUPLIK'))return'Art. 77 Abs. 2–3 VRG';
  if(id==='NW-ADMIN-20')return'Art. 71 Abs. 1 mit Art. 81 VRG';
  if(id==='NW-COURT-20')return'Art. 71 Abs. 1 mit Art. 89 VRG';
  return'Art. 33–36 und Art. 33a VRG, konkrete Tagesanordnung';
}
export async function buildH2Candidate(){
  for(const[path,pin]of fixed)assert.equal(sha(await read(path)),pin,'Accepted input changed '+path);
  const receipt=await load('outputs/ap23h1-abnahme-2026-10-22/receipt.json');
  assert.equal(receipt.professionalAcceptance,true);assert.equal(receipt.acceptedBy,'David Steimer');
  const acceptance=await read('docs/fachrecht/abnahme-ap23h1.md');
  assert.ok(acceptance.includes('AP23H1 ist fachlich abgenommen. AP23H2 ist ausdrücklich gestartet.'));
  const manifest0=await load(BASE+'/manifest.json'),files=new Map();
  for(const a of manifest0.artifacts){const text=await read(BASE+'/'+a.path);assert.equal(sha(text),a.sha256,a.path);
    assert.equal(Buffer.byteLength(text),a.byteLength,a.path);files.set(a.path,text);}
  const old=JSON.parse(files.get(ADMIN)),oldHolidays=JSON.parse(files.get(HOLIDAYS)),research=await load(RESEARCH);
  const befunde=await Promise.all(['ow','nw'].map(c=>load('docs/fachrecht/ap23h1/befund-'+c+'.json')));
  const sourceRows=befunde.flatMap(b=>b.laws.map(l=>({sourceId:'SRC-'+l.id,kind:'statute',url:l.url,
    versionDescription:(l.versionFrom??l.versionOn)+' / '+(l.versionId?'Version '+l.versionId:'amtliches XML'),
    reviewedOn:'2026-10-22',reviewBasis:'AP23H1 H1-A bis H1-F fachlich abgenommen. Keine gemeinsame Releasequellenfreigabe.',
    locators:(l.locators??['Art. 64 und 67']).join(', ')})));
  assert.equal(sourceRows.length,10);
  const ref=(key,locator)=>{const s=sourceRows.find(s=>s.sourceId===IDS[key]);assert.ok(s,key);return{sourceId:s.sourceId,locator:locator??s.locators};};
  const refs=keys=>keys.map(k=>ref(k));
  const legalKeys=(p,future=false)=>p.canton==='NW'?['NWVRG','NWRTG']:
    [future?'OW2027':'OW2025','OWVGV','OWGOG','OWRTG','ZPO',...(p.id.includes('REASONS')?['BGG',...(p.stage==='administration'?['OWVWVV']:[])]:[])];
  const catalog=structuredClone(old),holidayCatalog=structuredClone(oldHolidays);
  Object.assign(catalog,{$schema:H2_SCHEMA_IDS.catalog,formatVersion:'5.0.0',contractStatus:'proposed',runtimeActive:false,
    contractDecision:{id:'DEC-2026-037',status:'proposed',on:null},review:{basis:'AP23H1 fachlich abgenommen, isolierte AP23H2-Strukturprobe. DEC-2026-037 vorgeschlagen.',
      sourceReview:'Keine neue gemeinsame Releasequellenfreigabe. Kopierte G3-Komponenten behalten ihre historischen Quell- und Releasebindungen.',checkedOn:'2026-10-22'}});
  catalog.sources.push(...sourceRows);
  const descriptors=new Map(manifest0.artifacts.map(a=>[a.contentId,structuredClone(a)]));
  const newCalendars=[],newProjectionRows=[],newCalendarPaths=[];
  for(const[c,d]of Object.entries(DEFINITIONS)){
    const oldProjection=holidayCatalog.activation.projections.find(p=>p.calendarId===d.baselineCalendarId);assert.ok(oldProjection);
    const scopeId=c+'-PROCEDURAL-ALL',source=sourceRows.find(s=>s.sourceId===IDS[d.sourceKey]),jurisdiction='CH-'+c;
    holidayCatalog.activation.supplementalScopes.push({id:scopeId,jurisdiction,scopeType:'canton',legacyMatrixId:'AP23H1-'+c+'-PROCEDURAL-CORE',
      legalValidity:{from:d.sourceDate,to:null}});
    holidayCatalog.activation.sourceEvidence.push({id:source.sourceId,jurisdiction,title:c==='OW'?'Obwalden GOG Art. 28':'Nidwalden VRG Art. 34',
      locator:c==='OW'?'Art. 28 Abs. 2':'Art. 34 Abs. 2',url:source.url,versionOn:d.sourceDate,retrievedOn:'2026-10-22',
      review:'AP23H1 H1-D fachlich abgenommen, keine gemeinsame Quellenreleasefreigabe.',
      note:c==='OW'?'Gericht direkt. Administrative Übertragung systematisch gemäss H1-D. Nur neue OW-Verwaltungswege.':'Nur neue NW-Verwaltungswege, keine Änderung bestehender Bundesprofilkalender.'});
    holidayCatalog.activation.sourceIdMap.push({evidenceId:source.sourceId,sourceId:source.sourceId});
    const additions=['BERCHTOLD','EASTER-MONDAY','WHIT-MONDAY','ST-STEPHEN'].map(suffix=>{
      const template=oldHolidays.activation.supplementalRules.find(r=>r.id==='SO-PROCEDURAL-ALL-DAY-'+suffix);assert.ok(template);
      return{id:scopeId+'-DAY-'+suffix,scopeId,labels:structuredClone(template.labels),category:'proceduralEquivalentDay',dayPortion:'fullDay',
        calculation:structuredClone(template.calculation),condition:'always',legalValidity:{from:d.sourceDate,to:null},
        sourceRefs:[{evidenceId:source.sourceId,locator:c==='OW'?'Art. 28 Abs. 2 GOG, administrative Reichweite gemäss H1-D':'Art. 34 Abs. 2 VRG'}]};});
    holidayCatalog.activation.supplementalRules.push(...additions);
    const projection={id:'projection-'+d.calendarId,calendarId:d.calendarId,jurisdiction,baseScopeId:oldProjection.baseScopeId,
      supplementScopeIds:[scopeId],scopeIds:[...oldProjection.scopeIds,scopeId],ruleIds:[...oldProjection.ruleIds,...additions.map(r=>r.id)].sort()};
    holidayCatalog.activation.projections.push(projection);newProjectionRows.push(projection);
    const calendar={$schema:'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json',
      formatVersion:'3.0.0',dataKind:'calendar',calendarId:d.calendarId,jurisdiction:{level:'cantonal',code:c},
      validity:{...research.referenceWindow},inherits:[d.baselineCalendarId],review:{reviewedOn:'2026-10-22',status:'candidate',reviewedBy:'Codex',
        basis:'AP23H1 H1-D fachlich abgenommen. Isolierte H2-Projektion, keine gemeinsame Quellen- oder Betriebsfreigabe.'},
      sources:[{sourceId:source.sourceId,sourceType:'officialDossier',title:c==='OW'?'Gesetz über die Gerichtsorganisation, Art. 28':'VRG, Art. 34',
        authority:jurisdiction,url:source.url,documentVersionDate:d.sourceDate,reviewedOn:'2026-10-22',reviewStatus:'monitored'}],
      rules:additions.map(r=>({ruleId:c+'-CAL-'+r.id,calendarId:d.calendarId,jurisdiction:{level:'cantonal',code:c},
        labelKey:'holiday.'+c.toLowerCase()+'.'+r.id,labels:{de:r.labels.de,fr:r.labels.fr},priority:100,validity:{...r.legalValidity},
        sourceRefs:[ref(d.sourceKey,c==='OW'?'Art. 28 Abs. 2':'Art. 34 Abs. 2')],calculation:structuredClone(r.calculation),condition:'always',
        effect:{type:'holiday',kind:'cantonalPublicHoliday',legalEffect:'nonWorkingDayEquivalentToSunday',resultIdSuffix:r.id}})),
      projection:{catalogId:holidayCatalog.catalogId,catalogFormatVersion:'2.0.0',projectionId:projection.id,sourceHash:'pending'}};
    newCalendars.push(calendar);newCalendarPaths.push('calendars/'+d.calendarId+'.json');
  }
  holidayCatalog.activation.releaseEligibility={status:'candidate',releaseId:null,approval:null};
  files.set(HOLIDAYS,encode(holidayCatalog));
  descriptors.get('ch-holiday-catalog').sha256=sha(files.get(HOLIDAYS));
  descriptors.get('ch-holiday-catalog').byteLength=Buffer.byteLength(files.get(HOLIDAYS));
  for(const calendar of newCalendars){
    calendar.projection.sourceHash=sha(files.get(HOLIDAYS));const path='calendars/'+calendar.calendarId+'.json',text=encode(calendar);files.set(path,text);
    descriptors.set(calendar.calendarId,{role:'calendar',contentId:calendar.calendarId,path,mediaType:'application/json',schemaId:calendar.$schema,
      byteLength:Buffer.byteLength(text),sha256:sha(text)});
  }
  for(const[c,d]of Object.entries(DEFINITIONS)){
    catalog.laws.push({lawId:d.lawId,canton:c,title:d.title,holidayPolicyReview:{explicitDeviation:c==='OW'?'explicitCourtLocationRule':'noneIdentifiedInReviewedGeneralLaw',
      sourceRefs:c==='OW'?refs(['OW2025','OW2027','OWVGV','OWGOG','ZPO']):refs(['NWVRG','NWRTG']),projectDecisionRef:'DEC-2026-031'},
      sourceRefs:c==='OW'?refs(['OW2025','OW2027','OWVGV','OWVWVV']):refs(['NWVRG'])});
    for(const type of(c==='OW'?['none','three']:['none','winter','three']))catalog.suspensionProfiles.push({suspensionProfileId:c.toLowerCase()+'-'+type,
      lawId:d.lawId,periods:type==='none'?[]:type==='winter'?periods(c.toLowerCase()).slice(-1):periods(c.toLowerCase()),
      sourceRefs:c==='OW'?refs(['OW2025','OW2027','OWVGV','ZPO']):[ref('NWVRG','Art. 33a Abs. 1–3')]});
    for(const court of[false,true]){
      const projection=newProjectionRows.find(p=>p.calendarId===d.calendarId),sourceKeys=c==='OW'?['OW2025','OW2027','OWVGV','OWGOG','OWRTG','ZPO']:['NWVRG','NWRTG'];
      catalog.holidayBindings.push({holidayBindingId:c.toLowerCase()+'-'+(court?'court':'administration')+'-seat',lawId:d.lawId,
        authoritySeatCanton:c,authorityLevel:'cantonal',anchor:court?'courtSeat':'authoritySeat',bindingVersion:'5.0.0',
        physicalBaseline:{releaseId:RELEASE,calendarId:d.calendarId,projectionId:projection.id,
          references:[d.calendarId,d.baselineCalendarId,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const a=descriptors.get(id);return{role:a.role,contentId:id,path:a.path,sha256:a.sha256};}),
          eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
        legalBinding:{sourceRefs:refs(sourceKeys),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
        projectionEvidence:{kind:'proceduralSupplementProjection',baselineReleaseId:manifest0.releaseId,baselineCalendarId:d.baselineCalendarId,
          baselineCalendarSha256:descriptors.get(d.baselineCalendarId).sha256,baselineCatalogSha256:manifest0.artifacts.find(a=>a.contentId==='ch-holiday-catalog').sha256,
          baseScopeId:projection.baseScopeId,supplementScopeIds:[c+'-PROCEDURAL-ALL'],
          newRuleIds:holidayCatalog.activation.supplementalRules.filter(r=>r.scopeId===c+'-PROCEDURAL-ALL').map(r=>r.id),
          catalogRuleIds:[...projection.ruleIds],permissionInheritance:'none',legalScope:c+'-'+(court?'COURT':'ADMIN'),
          legalInterpretation:c==='NW'?'directVRG34':court?'directCourtStatute':'systematicAdministrativeTransferConfirmedH1D'}});
    }
  }
  for(const p of research.paths){const id=p.id.toLowerCase(),court=p.stage==='court',d=DEFINITIONS[p.canton];
    const q={pathId:id,pathRevision:1,pathSha256:'pending',mode:'qualifiedDayProcedureV5',
      requirements:structuredClone([...research.sharedRequirements,...p.requirements]),
      openingChainPolicy:p.openingChain?'requireOriginalOrTimelyRequestedReasons':'notApplicable',localHolidayPolicy:'blockConcreteUnresolvedAdditionalEndEffect'};
    const timeline=research.temporalBindings[p.canton].map(t=>({researchBindingId:t.id,interval:{from:t.from,to:t.to},sourceRefs:refs(legalKeys(p,t.id==='OW-STVG-2031'))}));
    const sourceRefs=[...new Map(timeline.flatMap(t=>t.sourceRefs).map(r=>[r.sourceId,r])).values()];
    const path={pathId:id,revision:1,researchRef:p.id,contractFamily:'qualifiedDayProcedureV5',lawId:d.lawId,action:p.action,stages:[p.stage],
      duration:p.days===null?{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}:
        {kind:'statutoryDays',value:p.days,overridable:false},suspensionProfileId:p.canton.toLowerCase()+'-'+p.suspension,
      holidayBindingId:p.canton.toLowerCase()+'-'+(court?'court':'administration')+'-seat',urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',
      endShiftGuard:p.endShiftCollision==='proposedBoundary'?'blockWhenEnteringApplicableSuspension':'none',
      qualification:{delivery:'qualifiedActualDelivery',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
      temporalBinding:{caseCoverage:{...research.referenceWindow},calculationCoverage:{...research.referenceWindow},sourceCoverage:{...research.referenceWindow},
        evaluation:'eachEvaluatedDayIncludingEndShift',futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},
      normTimeline:timeline,sourceRefs,openingWarnings:[]};
    // Retain precise duration source pinpoints without inventing mutable extra facts.
    if(p.canton==='NW')path.sourceRefs.find(r=>r.sourceId===IDS.NWVRG).locator=actionBasis(p.id);
    else if(p.id==='OW-COURT-SUSPENSIVE-5')path.sourceRefs.find(r=>r.sourceId===IDS.OWVGV).locator=actionBasis(p.id);
    catalog.paths.push(path);q.pathSha256=objSha(path);catalog.qualificationPolicies.push(q);
  }
  for(const[id,scope,reason]of[
    ['h1-local','OW und NW zusätzliche örtliche Endtagswirkung','Nur konkrete ungeklärte zusätzliche Wirkung sperrt den definitiven Wert. Kein pauschales Verbot wegen unvollständiger Ortsinventur.'],
    ['h1-ow-reasons','OW Begründungsverlangen und nachfolgendes Rechtsmittel','Getrennte Handlung, bekannte vollständige spätere Eröffnung und erwiesen rechtzeitiges Verlangen nötig. Kein automatischer Restcountdown.'],
    ['h1-ow-suspensive','OW Art. 12 Abs. 3 VGV','Nur besonderer Präsidialentscheid mit schriftlichem Weiterzug an das Gesamtgericht. Ferienfreiheit gemäss abgenommenem H1-C, nicht allein wegen kurzer Dauer.'],
    ['h1-nw-exceptions','NW Art. 33a Abs. 3','Stillstandsausnahmen einschliesslich einvernehmlicher Fristansetzung nicht aus Standards erfinden oder ignorieren.'],
    ['h1-nw-einsprache','NW Art. 62/64','Positive gesetzliche Zulässigkeit ohne abweichende Sonderregel, kein allgemeiner Import jeder spezialgesetzlichen Einsprache.'],
    ['h1-nw-exchange','NW Art. 76/77','Vernehmlassung, Replik und Duplik gesetzliche unveränderte Normaldauer. Kein automatischer Transfer auf Einsprache oder freie Dauer.'],
    ['h1-end-suspension','OW/NW reine Endverschiebung in neue Ferien','Nur präzise Kollision ohne definitiven Wert/Export. Keine erfundene NW-Winterkollision und kein gesetzliches Berechnungsverbot.']
  ])catalog.excludedPaths.push({exclusionId:id,scope,reason});
  catalog.releaseBinding={status:'candidate',releaseId:null,approval:null,targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null,
    promotionRequirement:'rebindExactTargetReleaseBytesAndApproveBeforeActivation',pathEligibility:catalog.paths.map(p=>{
      const h=catalog.holidayBindings.find(x=>x.holidayBindingId===p.holidayBindingId),s=catalog.suspensionProfiles.find(x=>x.suspensionProfileId===p.suspensionProfileId),q=catalog.qualificationPolicies.find(x=>x.pathId===p.pathId);
      return{status:'candidate',pathId:p.pathId,pathRevision:p.revision,pathSha256:objSha(p),holidayBindingId:h.holidayBindingId,holidayBindingSha256:objSha(h),
        suspensionProfileId:s.suspensionProfileId,suspensionProfileSha256:objSha(s),qualificationPolicySha256:objSha(q),
        caseCoverage:{...p.temporalBinding.caseCoverage},calculationCoverage:{...p.temporalBinding.calculationCoverage},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};})};
  for(const[path,sha256]of fixed)catalog.preserved.push({path,sha256});
  catalog.preserved.push({path:'docs/fachrecht/abnahme-ap23h1.md',sha256:sha(acceptance)});
  files.set(ADMIN,encode(catalog));descriptors.get('ch-cantonal-administrative-procedures').schemaId=H2_SCHEMA_IDS.catalog;
  descriptors.get('ch-cantonal-administrative-procedures').sha256=sha(files.get(ADMIN));
  descriptors.get('ch-cantonal-administrative-procedures').byteLength=Buffer.byteLength(files.get(ADMIN));
  const manifest=structuredClone(manifest0);Object.assign(manifest,{$schema:H2_SCHEMA_IDS.localManifest,formatVersion:'12.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-22'});
  manifest.compatibility.minimumConsumerFormatVersion='12.0.0';manifest.artifacts=[...descriptors.values()];
  manifest.calendarIds=[...manifest0.calendarIds,...newCalendars.map(c=>c.calendarId)].sort();
  manifest.sourceSummary={latestReviewedOn:'2026-10-22',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',
    sourceIds:[...new Set([...files.values()].flatMap(b=>(JSON.parse(b).sources??[]).map(s=>s.sourceId)))].sort()};
  manifest.extensions={'steimer.local-reference':{workPackage:'AP23H2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,
    calendarExportEnabled:false,contractDecision:'DEC-2026-037',contractDecisionStatus:'proposed',acceptedResearchSha256:fixed[2][1],
    acceptedReceiptSha256:sha(await read('outputs/ap23h1-abnahme-2026-10-22/receipt.json')),baselineManifestSha256:fixed[0][1],
    historicalPayloadPolicy:'40 unchanged G3 artifacts, including social component, retain historical target-release bindings. Only administrative catalog and holiday catalog change, two procedural calendars are added. H3 must bind a coherent new target release before native runtime activation.'}};
  const manifestText=encode(manifest),integrity={kind:'ap23h2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,
    runtimeReadable:false,productionActivation:false,calendarExportEnabled:false,sourceReview:'pending',
    counts:{artifacts:44,totalFilesIncludingManifest:45,unchangedRawArtifacts:40,changedBaselineArtifacts:2,newArtifacts:2,preservedPaths:58,newPaths:21,totalPaths:79,
      qualificationPolicies:79,laws:13,suspensionProfiles:25,holidayBindings:17,physicalCalendars:35,
      preservedCatalogRules:479,preservedSupplementalRules:12,newSupplementalRules:8,totalHolidayRules:499},basedOn:fixed.map(([path,sha256])=>({path,sha256})),
    acceptance:{path:'docs/fachrecht/abnahme-ap23h1.md',sha256:sha(acceptance)},
    manifest:{path:OUTPUT+'/bundle/manifest.json',byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
    artifacts:manifest.artifacts.map(a=>({path:OUTPUT+'/bundle/'+a.path,byteLength:a.byteLength,sha256:a.sha256}))};
  return{old,oldHolidays,research,catalog,holidayCatalog,manifest,manifestText,files,integrity,newCalendars,newCalendarPaths};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const write=process.argv.includes('--write');assert.ok(write||process.argv.includes('--check'));
  const built=await buildH2Candidate();
  for(const[path,text]of[...built.files].map(([p,b])=>[OUTPUT+'/bundle/'+p,b]).concat([[OUTPUT+'/bundle/manifest.json',built.manifestText],[OUTPUT+'/candidate-integrity.json',encode(built.integrity)]])){
    if(write){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),text);}
    else assert.equal(await read(path),text,'Stale isolated candidate '+path);
  }
  console.log(JSON.stringify({structuralOnly:true,runtimeReadable:false,counts:built.integrity.counts,manifestSha256:sha(built.manifestText)},null,2));
}
