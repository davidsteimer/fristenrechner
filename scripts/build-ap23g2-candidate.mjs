// SPDX-License-Identifier: AGPL-3.0-only
// Data/contract structure only. Never registers a runtime or promotes a release.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { G2_SCHEMA_IDS } from './build-ap23g2-schemas.mjs';
export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const BASE = 'data/candidates/2026-10-22-ap23f3';
export const OUTPUT = 'outputs/ap23g2-candidate-2026-10-22';
export const ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const RELEASE = '2026-10-22-ap23g2-reference.1';
export const RESEARCH = 'docs/fachrecht/ap23g1/referenzfaelle.json';
export const sha = b => createHash('sha256').update(b).digest('hex');
export const canonical = v => Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : v && typeof v === 'object'
  ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}` : JSON.stringify(v);
export const objSha = v => sha(canonical(v));
export const encode = v => JSON.stringify(v,null,2)+'\n';
const read = p => readFile(resolve(ROOT,p),'utf8');
const fixed = [
  [`${BASE}/manifest.json`,'89470d589615a447b146eb58028a7e2ac58fe7389b908196b3f82e02864b3311'],
  [`${BASE}/${ADMIN}`,'c336ce6745ea3e3cf6a241d83102e1cbcae6787ad7d4bb426aceb273cc8d7fc3'],
  [RESEARCH,'3aa2cc7a3ffaacee3f5ac22bf5c4cce9f9227f5461b7de99f5a34dbea114726f'],
  ['outputs/ap23g1-abnahme-2026-10-22/receipt.json','d075f55e3439d8480107129916b6f22052ad8cb5b0294f42ae1696eda702b443']
];
const src = (id,url,versionDescription,locators,kind='statute') => ({sourceId:id,kind,url,versionDescription,
  reviewedOn:'2026-10-22',reviewBasis:'AP23G1 fachlich abgenommen. Neue allgemeine Verwaltungsverwendung, keine gemeinsame Releasequellenfreigabe.',locators});
const sourceRows = [
  src('SRC-AP23G1-UR-VRPV-20160301','https://rechtsbuch.ur.ch/api/de/versions/641/pdf_file','01.03.2016, Version 641, frische Metadaten 22.10.2026','Art. 20–22, 29–30, 48, 59, 62–64'),
  src('SRC-AP23G1-UR-LSG-20030101','https://rechtsbuch.ur.ch/api/de/versions/963/pdf_file','01.01.2003, Version 963','Art. 9 Abs. 1 Bst. b/c und Art. 10'),
  src('SRC-AP23G1-SO-VRG-20250801','https://bgs.so.ch/api/de/versions/5523/pdf_file','01.08.2025, Version 5523','§§ 9–10bis, 21bis Abs. 1 Bst. c, 32, 58 und 67'),
  src('SRC-AP23G1-SO-GS201463','https://bgs.so.ch/api/de/change_documents/file_dictionaries/1025/pdf_file','01.03.2015, GS 2014, 63, Original erneut gelesen','II.1 § 9 VRG und Inkrafttreten'),
  src('SRC-AP23G1-SH-VRG-20251101','https://rechtsbuch.sh.ch/api/de/versions/2030/pdf_file','01.11.2025, Version 2030','Art. 8–11, 20, 35, 39, 47, 50 und 59'),
  src('SRC-AP23G1-SH-JG-20260501','https://rechtsbuch.sh.ch/api/de/versions/2100/pdf_file','01.05.2026, Version 2100','Art. 44 und 48 sowie Verfahrensbestimmungen'),
  src('SRC-AP23G1-SH-RTG-20070101','https://rechtsbuch.sh.ch/api/de/versions/1886/pdf_file','01.01.2007, Version 1886','Art. 1–2'),
  src('JUD-AP23G1-SH-OGE-4020181K-20180824','https://sh.ch/CMS/get/file/771a1a2e-4ef2-47bb-9b04-f4afc5aed3ea','24.08.2018, OGE 40/2018/1/K','Amtsbericht S. 84–87, E. 2.1.4, gerichtlicher Berchtoldstag','judgment'),
  src('JUD-AP23G1-SH-BGER-2C4832025-20260312','https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F12-03-2026-2C_483-2025&lang=de&type=show_document','12.03.2026, BGer 2C_483/2025','E. 3.1, administrativer Praxisbefund zum 2. Januar, für konkreten Ablauf nicht tragend','judgment'),
  src('SRC-AP23G1-CH-ZPO-20260701','https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2010/262/20260701/de/xml/fedlex-data-admin-ch-eli-cc-2010-262-20260701-de-xml.xml','01.07.2026, amtlicher XML-Volltext','Art. 142–146, Reichweite gemäss konkreter kantonaler Verweisung'),
  src('SRC-AP23G1-CH-BUNDESFEIERTAG-19940701','https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de','01.07.1994, SR 116','Art. 1, Bundesfeiertag')
];
export const IDS = { UR:'SRC-AP23G1-UR-VRPV-20160301',URLSG:'SRC-AP23G1-UR-LSG-20030101',
  SO:'SRC-AP23G1-SO-VRG-20250801',SOGS:'SRC-AP23G1-SO-GS201463',SH:'SRC-AP23G1-SH-VRG-20251101',
  SHJG:'SRC-AP23G1-SH-JG-20260501',SHRTG:'SRC-AP23G1-SH-RTG-20070101',
  SHOGE:'JUD-AP23G1-SH-OGE-4020181K-20180824',SHBGER:'JUD-AP23G1-SH-BGER-2C4832025-20260312',
  ZPO:'SRC-AP23G1-CH-ZPO-20260701',NATIONAL:'SRC-AP23G1-CH-BUNDESFEIERTAG-19940701' };
const ref = (key,locator) => {const s=sourceRows.find(s=>s.sourceId===IDS[key]);assert.ok(s,key);return{sourceId:s.sourceId,locator:locator??s.locators};};
const refs = keys => keys.map(k=>ref(k));
const definitions = {
  UR:{lawId:'vrpv-ur',title:'Verordnung über die Verwaltungsrechtspflege, RB 2.2345',calendar:'ap22-ur-67275ff3e872'},
  SO:{lawId:'vrg-so',title:'Gesetz über den Rechtsschutz in Verwaltungssachen, BGS 124.11',calendar:'ap22-so-3f5f7b7f54f5'},
  SH:{lawId:'vrg-sh',title:'Gesetz über den Rechtsschutz in Verwaltungssachen, SHR 172.200',calendar:'ap22-sh-ec7d0988145a'}
};
export const periods = prefix => [
  {periodId:`${prefix}-easter`,start:{type:'easterOffset',days:-7,yearOffset:0},end:{type:'easterOffset',days:7,yearOffset:0},inclusive:true},
  {periodId:`${prefix}-summer`,start:{type:'fixedMonthDay',month:7,day:15,yearOffset:0},end:{type:'fixedMonthDay',month:8,day:15,yearOffset:0},inclusive:true},
  {periodId:`${prefix}-winter`,start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:2,yearOffset:1},inclusive:true}
];
export function requirements(p) {
  return {action:p.action,opening:p.opening,holidayAnchor:p.holidayAnchor,authorityLevel:'cantonal',specialLaw:'excluded',
    materialPerformance:false,fixedEndDate:false,deviatingStart:false,termChange:'none',unit:'day',direction:'forward',
    notice:'uncontested',suspensionContext:'ordinaryNoException',serviceContext:'effectiveLegalTriggerKnown',
    requiredTargetCourt:p.requiredCourt??'notApplicable',requiredSameIssuingCourt:p.sameIssuingCourt??false,
    openingChainPolicy:p.opening==='completeReasonedAdministrativeDecision'?'requireOriginalOrTimelyRequestedReasons':'notApplicable',
    coordinationPolicy:['UR-ADMIN-20','UR-COURT-20'].includes(p.id)?'excludeCoordinatedAppeal':'notApplicable',
    localHolidayPolicy:p.canton==='UR'?'blockConcreteUnresolvedAdditionalEndEffect':'notApplicable',
    specialOpeningPolicy:p.canton==='UR'?'ordinaryEffectiveUROpening':'notApplicable',
    shorteningPolicy:p.canton==='SH'?'noShortenedSHRekurs':'notApplicable'};
}
const legalKeys = (c,court) => c==='UR'?['UR','URLSG',...(court?['ZPO']:[])]:c==='SO'?['SO','SOGS','NATIONAL',...(court?['ZPO']:[])]:court?['SH','SHJG','SHRTG','SHOGE','ZPO']:['SH','SHRTG','SHBGER'];
export async function buildG2Candidate() {
  for(const[p,h]of fixed)assert.equal(sha(await read(p)),h,`Accepted input changed ${p}`);
  const manifest0=JSON.parse(await read(`${BASE}/manifest.json`)),files=new Map();
  for(const a of manifest0.artifacts){const b=await read(`${BASE}/${a.path}`);assert.equal(sha(b),a.sha256,a.path);assert.equal(Buffer.byteLength(b),a.byteLength);files.set(a.path,b);}
  const old=JSON.parse(files.get(ADMIN)),research=JSON.parse(await read(RESEARCH));
  const acceptance=await read('docs/fachrecht/abnahme-ap23g1.md');
  assert.ok(acceptance.includes('AP23G1 ist fachlich abgenommen. AP23G2 ist ausdrücklich gestartet.'));
  const catalog=structuredClone(old);
  Object.assign(catalog,{$schema:G2_SCHEMA_IDS.catalog,formatVersion:'4.0.0',contractStatus:'proposed',runtimeActive:false,
    contractDecision:{id:'DEC-2026-036',status:'proposed',on:null},
    review:{basis:'AP23G1 fachlich abgenommen. Isolierte AP23G2-Strukturprobe, DEC-2026-036 vorgeschlagen.',
      sourceReview:'Keine neue gemeinsame Releasequellenfreigabe. Historische F3-Rohkomponenten behalten ihre damaligen Bindungen.',checkedOn:'2026-10-22'}});
  catalog.sources.push(...structuredClone(sourceRows));
  const physicalCatalog=JSON.parse(files.get('holiday-catalogs/ch-holiday-catalog.json'));
  const descriptors=new Map(manifest0.artifacts.map(a=>[a.contentId,a]));
  for(const[c,d]of Object.entries(definitions)){
    const prefix=c.toLowerCase();
    catalog.laws.push({lawId:d.lawId,canton:c,title:d.title,holidayPolicyReview:{
      explicitDeviation:c==='SH'?'explicitCourtLocationRule':'noneIdentifiedInReviewedGeneralLaw',
      sourceRefs:c==='SH'?[ref('SH','Art. 9 für Verwaltung, Art. 50 Abs. 1 für Gericht'),ref('ZPO','Art. 142 Abs. 3, ausdrücklicher Gerichtsort')]:[ref(c)],projectDecisionRef:'DEC-2026-031'},sourceRefs:[ref(c)]});
    for(const type of ['none','three'])catalog.suspensionProfiles.push({suspensionProfileId:`${prefix}-${type}`,lawId:d.lawId,
      periods:type==='three'?periods(prefix):[],sourceRefs:type==='three'?refs([c,'ZPO',...(c==='SH'?['SHJG']:[])]):[ref(c)]});
    for(const court of (c==='SH'?[false,true]:[false])){
      const calendarId=d.calendar,descriptor=descriptors.get(calendarId),calendar=JSON.parse(files.get(descriptor.path));
      const keys=legalKeys(c,court), projection=physicalCatalog.activation.projections.find(p=>p.calendarId===calendarId);
      assert.ok(projection);
      const binding={holidayBindingId:`${prefix}-${court?'court':'administration'}-seat`,lawId:d.lawId,
        authoritySeatCanton:c,authorityLevel:'cantonal',anchor:court?'courtSeat':'authoritySeat',bindingVersion:'4.0.0',
        physicalBaseline:{releaseId:manifest0.releaseId,calendarId,projectionId:calendar.projection.projectionId,
          references:[calendarId,'ch-federal-calendar','ch-holiday-catalog'].map(id=>{const a=descriptors.get(id);return{role:a.role,contentId:id,path:a.path,sha256:a.sha256};}),
          eligibilityMeaning:'physicalSourceOnlyNotFederalProcedurePermission'},
        legalBinding:{sourceRefs:refs(keys),projectDecisionRef:'DEC-2026-031',roleUnion:false,partyOrRepresentativeRequired:false},
        physicalReuse:{kind:'sameDatesIndependentLegalBasis',sourceReleaseId:manifest0.releaseId,
          sourceCatalogSha256:descriptors.get('ch-holiday-catalog').sha256,selectedRuleIds:calendar.rules.map(r=>r.ruleId),
          projectionRuleIds:[...projection.ruleIds],permissionInheritance:'none',evidenceRefs:refs(keys),
          notDerivedFrom:c==='SH'&&!court?'SH-ZPO-ADDITIONAL':'notApplicable'},
        practiceAddition:c==='SH'&&!court?{day:'01-02',sourceRefs:[ref('SHBGER','E. 3.1')],
          evidenceLimit:'nonDispositiveCantonalLawDescription',scope:'newSHGeneralAdministrativeOnly'}:null};
      catalog.holidayBindings.push(binding);
    }
  }
  for(const p of research.paths){
    const court=p.stage==='court',d=definitions[p.canton],keys=legalKeys(p.canton,court),q=requirements(p),id=p.id.toLowerCase();
    const warning=p.openingRestriction?[{warningId:'ur-art22-opening-restriction',evaluatedOn:'qualifiedOpeningDate',effect:'noticeOnlyNoDateChange',
      periods:[{periodId:'ur-art22-easter',start:{type:'easterOffset',days:-8,yearOffset:0},end:{type:'easterOffset',days:8,yearOffset:0},inclusive:true},
        {periodId:'ur-art22-winter',start:{type:'fixedMonthDay',month:12,day:18,yearOffset:0},end:{type:'fixedMonthDay',month:1,day:6,yearOffset:1},inclusive:true}],
      sourceRefs:[ref('UR','Art. 22')]}]:[];
    const path={pathId:id,revision:1,researchRef:p.id,lawId:d.lawId,
      action:p.action==='requestAdministrativeReasons'?'administrative-reasons-request':p.action==='requestCourtReasons'?'court-reasons-request':p.days===null?
        (court?'ordered-court-submission':'ordered-administrative-submission'):(court?'ordinary-court-appeal':'ordinary-administrative-appeal'),
      stages:[p.stage],duration:p.days===null?{kind:'authorityOrderedDays',minimum:1,maximum:365,boundMeaning:'technicalSafetyLimitNotLegalMaximum'}:
        {kind:'statutoryDays',value:p.days,overridable:false},
      suspensionProfileId:`${p.canton.toLowerCase()}-${p.suspension}`,
      holidayBindingId:`${p.canton.toLowerCase()}-${p.canton==='SH'&&court?'court':'administration'}-seat`,
      urgencyPolicy:'notApplicable',endShiftPolicy:'nextWorkingDay',endShiftGuard:court?'blockWhenEnteringApplicableSuspension':'none',
      qualification:{delivery:'qualifiedActualDelivery',authorityLevel:'cantonal',generalRoute:'qualified',specialLaw:'excluded',fixedEndDate:false,deviatingStart:false,evidenceAdvance:false},
      temporalBinding:{caseCoverage:{...research.referenceWindow},calculationCoverage:{...research.referenceWindow},sourceCoverage:{...research.referenceWindow},
        evaluation:'eachEvaluatedDayIncludingEndShift',futureNormAssumption:'proposalAssumingContinuedApplicabilityNotFutureLegalVerification'},
      normTimeline:[{interval:{...research.referenceWindow},sourceRefs:refs(keys)}],sourceRefs:refs(keys),openingWarnings:warning};
    catalog.paths.push(path);
    catalog.qualificationPolicies.push({pathId:id,pathRevision:1,pathSha256:objSha(path),mode:'qualifiedDayProcedureV4',requirements:q});
  }
  for(const[id,scope,reason]of[
    ['g1-ur-local','UR lokale Endtagswirkung','Kantonsweiter Kern. Konkret mögliche ungeklärte zusätzliche örtliche Endtagswirkung ohne definitives Ergebnis und Export.'],
    ['g1-ur-opening','UR Art. 22','Wirksame Eröffnung mit Hinweis, keine zusätzliche Pause. Konkret behauptete besondere Eröffnungsrechtsfolge bleibt Klärungsfall.'],
    ['g1-ur-coordination','UR koordinierte Beschwerden','Längste koordinierte Beschwerdefrist nicht aus gewöhnlicher Zwanzigtagesgruppe ableiten. Keine pauschale Sperre angeordneter Eingaben.'],
    ['g1-reasons-chain','Begründungsanforderung und spätere Eröffnung','Keine neue volle Rechtsmittelfrist aus verspäteter oder ungeklärter Voranforderung, keine automatische Verkettung.'],
    ['g1-sh-shortening','SH verkürzter Rekurs','48 Stunden nicht als zwei Tage behandeln.'],
    ['g1-end-suspension','Sieben neue Gerichtspfade','Abgenommene enge Endverschiebungskollision ohne definitives Ergebnis und Export. Kein gesetzliches Berechnungsverbot.']
  ])catalog.excludedPaths.push({exclusionId:id,scope,reason});
  catalog.releaseBinding={status:'candidate',releaseId:null,approval:null,targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null,
    promotionRequirement:'rebindExactTargetReleaseBytesAndApproveBeforeActivation',pathEligibility:catalog.paths.map(p=>{
      const h=catalog.holidayBindings.find(h=>h.holidayBindingId===p.holidayBindingId),s=catalog.suspensionProfiles.find(s=>s.suspensionProfileId===p.suspensionProfileId),q=catalog.qualificationPolicies.find(q=>q.pathId===p.pathId);
      return{status:'candidate',pathId:p.pathId,pathRevision:p.revision,pathSha256:objSha(p),holidayBindingId:h.holidayBindingId,holidayBindingSha256:objSha(h),
        suspensionProfileId:s.suspensionProfileId,suspensionProfileSha256:objSha(s),qualificationPolicySha256:objSha(q),caseCoverage:{...p.temporalBinding.caseCoverage},
        calculationCoverage:{...p.temporalBinding.calculationCoverage},targetComponentRefs:[],sourceReviewRef:null,referenceSuiteRef:null};})};
  for(const[p,h]of fixed)catalog.preserved.push({path:p,sha256:h});
  catalog.preserved.push({path:'docs/fachrecht/abnahme-ap23g1.md',sha256:sha(acceptance)});
  files.set(ADMIN,encode(catalog));
  const manifest=structuredClone(manifest0);
  Object.assign(manifest,{$schema:G2_SCHEMA_IDS.localManifest,formatVersion:'11.0.0',releaseId:RELEASE,releaseStatus:'candidate',createdOn:'2026-10-22'});
  manifest.compatibility.minimumConsumerFormatVersion='11.0.0';
  manifest.artifacts=manifest0.artifacts.map(a=>a.path===ADMIN?{...a,schemaId:G2_SCHEMA_IDS.catalog,byteLength:Buffer.byteLength(files.get(ADMIN)),sha256:sha(files.get(ADMIN))}:structuredClone(a));
  manifest.sourceSummary={latestReviewedOn:'2026-10-22',legalBasisReviewStatus:'pending',technicalValidationStatus:'pending',
    sourceIds:[...new Set([...files.values()].flatMap(b=>(JSON.parse(b).sources??[]).map(s=>s.sourceId)))].sort()};
  manifest.extensions={'steimer.local-reference':{workPackage:'AP23G2',structuralContractProbeOnly:true,productionActivation:false,sourceReleaseApproved:false,
    calendarExportEnabled:false,contractDecision:'DEC-2026-036',contractDecisionStatus:'proposed',
    acceptedResearchSha256:sha(await read(RESEARCH)),acceptedReceiptSha256:fixed[3][1],baselineManifestSha256:fixed[0][1],
    historicalPayloadPolicy:'41 non-administrative artifacts are exact accepted F3 reference bytes. Existing physical/embedded bindings retain their prior reference release. Full target rebinding and source release approval are later separate steps.'}};
  const manifestText=encode(manifest);
  const integrity={kind:'ap23g2-structural-contract-candidate',releaseId:RELEASE,contractStatus:'proposed',referenceOnly:true,runtimeReadable:false,
    productionActivation:false,calendarExportEnabled:false,sourceReview:'pending',
    counts:{artifacts:42,totalFilesIncludingManifest:43,unchangedRawArtifacts:41,preservedPaths:42,newPaths:16,totalPaths:58,qualificationPolicies:58,laws:11,suspensionProfiles:20,holidayBindings:13,physicalCalendars:33},
    basedOn:fixed.map(([path,sha256])=>({path,sha256})),
    acceptance:{path:'docs/fachrecht/abnahme-ap23g1.md',sha256:sha(acceptance)},
    manifest:{path:`${OUTPUT}/bundle/manifest.json`,byteLength:Buffer.byteLength(manifestText),sha256:sha(manifestText)},
    artifacts:manifest.artifacts.map(a=>({path:`${OUTPUT}/bundle/${a.path}`,byteLength:a.byteLength,sha256:a.sha256}))};
  return{old,research,catalog,manifest,manifestText,files,integrity};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const write=process.argv.includes('--write');assert.ok(write||process.argv.includes('--check'));
  const r=await buildG2Candidate();
  for(const[p,b]of[...r.files].map(([p,b])=>[`${OUTPUT}/bundle/${p}`,b]).concat([[`${OUTPUT}/bundle/manifest.json`,r.manifestText],[`${OUTPUT}/candidate-integrity.json`,encode(r.integrity)]])){
    if(write){await mkdir(dirname(resolve(ROOT,p)),{recursive:true});await writeFile(resolve(ROOT,p),b);}else assert.equal(await read(p),b,`Stale candidate ${p}`);
  }
  console.log(JSON.stringify({structuralOnly:true,runtimeReadable:false,counts:r.integrity.counts,manifestSha256:sha(r.manifestText)},null,2));
}
