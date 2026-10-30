// SPDX-License-Identifier: AGPL-3.0-only
// Author isolated research cases from explicit static date expectations, never a product calculator.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const folder='docs/fachrecht/ap23i1';
const sha=b=>createHash('sha256').update(b).digest('hex');
const inputs=[];
const sharedSyntheticFacts={unit:'day',direction:'forward',subsequentChange:'none',
  serviceMode:'qualifiedOrdinaryWritten',calendarUseQualified:true};
const sharedRequirements=Object.entries(sharedSyntheticFacts).map(([key,value])=>({key,value,reason:'I1-RESEARCH-'+key}));
const paths=[];
for(const canton of['GL','TG']){
  const path=folder+'/befund-'+canton.toLowerCase()+'.json',bytes=await readFile(path),report=JSON.parse(bytes);
  assert.equal(report.status,'research-proposal-not-accepted-not-operative');
  assert.equal(report.pathProposals.length,canton==='GL'?19:15);
  inputs.push({path,byteLength:bytes.length,sha256:sha(bytes)});
  for(const p of report.pathProposals){
    const common=report.commonRequirements??{};
    const requirements=Array.isArray(p.requirements)?p.requirements:Object.entries(p.requirements).map(([key,value])=>({key,value,reason:'I1-TG-'+key}));
    const joined=[...Object.entries(common).map(([key,value])=>({key,value,reason:'I1-TG-'+key})),...requirements].map(r=>{
      const q=Array.isArray(r.value)?{key:r.key,oneOf:r.value,reason:r.reason}:{...r};
      if(q.key==='exceptionNotice')q.reason='exceptionNoticeUnresolved';
      return q;
    });
    const syntheticFacts=Object.fromEntries(joined.map(r=>[r.key,r.oneOf?.[0]??r.value]));
    if(p.suspension==='tgNotice')syntheticFacts.exceptionNotice='given';
    paths.push({id:p.id,canton,stage:p.stage??p.target,action:p.action,durationBasis:p.duration.type,
      days:p.duration.days,...(p.duration.minimumDays===undefined?{}:{minimumDays:p.duration.minimumDays}),
      ...(p.duration.maximumDays===undefined?{}:{maximumDays:p.duration.maximumDays}),
      calendar:canton+'-RESEARCH',suspension:p.suspension,
      endShiftCollision:p.suspension==='none'?'notApplicable':'proposedBoundary',
      syntheticFacts,requirements:joined,sourceIds:p.sourceIds});
  }
}
assert.equal(paths.length,34);
const baseline='data/candidates/2026-10-22-ap23h3/calendars/';
const calendarBaselines=[];
for(const[canton,file,expected]of[
  ['GL','ap22-gl-87c11e156541.json','f510c466a1c7755fa63a06fbef41bec760b672833f6284af0818cb044d7a2b65'],
  ['TG','ap22-tg-3d6514fbabb1.json','5e32298fcc0264c1380a100fe88d6ef4a4be9898fee520de043b12f1e4ee11c2']]){
  const bytes=await readFile(baseline+file);assert.equal(sha(bytes),expected);
  calendarBaselines.push({calendar:canton+'-RESEARCH',path:baseline+file,sha256:expected});
}
const cases=[];
const add=(p,suffix,trigger,days,expected,note,facts)=>cases.push({id:p.id+'-'+suffix,path:p.id,trigger,days,
  ...(facts?{facts}:{}),expected,note});
const dated=end=>({outcome:'datedResearchValue',end});
// These hand-specified values are inputs to both independently written oracles.
const baseEnds={30:'2026-11-02',10:'2026-10-12',7:'2026-10-09',5:'2026-10-07',2:'2026-10-05'};
const winterEnds={three:{30:'2027-01-29',10:'2027-01-11',7:'2027-01-06',5:'2027-01-04'},
  none:{30:'2027-01-13',10:'2026-12-24',7:'2026-12-21',5:'2026-12-21'}};
const easterEnds={three:{30:'2027-05-03',10:'2027-04-13',7:'2027-04-12',5:'2027-04-09'},
  none:{30:'2027-04-19',10:'2027-03-30',7:'2027-03-30',5:'2027-03-24'}};
const collisionTriggers={30:'2027-02-18',10:'2027-03-10',7:'2027-03-13',5:'2027-03-15'};
for(const p of paths){
  const days=p.days??7,mode=p.suspension==='tgNotice'?'none':p.suspension;
  assert.ok(baseEnds[days]&&winterEnds[mode][days]&&easterEnds[mode][days]);
  add(p,'BASIC','2026-10-02',days,dated(baseEnds[days]),'Grundfall mit positiv geklärter aktueller Fallqualifikation.');
  add(p,'WINTER','2026-12-14',days,dated(winterEnds[mode][days]),'Wintervergleich, keine pauschale Übernahme des gerichtlichen Stillstands.');
  add(p,'EASTER','2027-03-19',days,dated(easterEnds[mode][days]),'Zählung über Osterstillstand beziehungsweise gewöhnliches Weiterzählen.');
  if(p.suspension==='three'||p.suspension==='tgNotice'){
    const f=p.suspension==='tgNotice'?{exceptionNotice:'absent'}:undefined;
    add(p,'COLLISION',collisionTriggers[days],days,{outcome:'unresolvedBoundaryProposed',reason:'I1-END-SUSPENSION',
      nominalEnd:'2027-03-20',ordinaryShiftEnd:'2027-03-22',firstSuspendedShiftDate:'2027-03-21'},
    'Alle Zähltage sind verbraucht. Erst die Endverschiebung tritt in neue Ferien ein.',f);
  }
  if(p.suspension==='tgNotice'){
    add(p,'NOTICE-ABSENT','2026-12-14',days,dated(winterEnds.three[days]),'Eindeutig vollständig fehlender massgebender Hinweis, nur innerhalb dieser gerichtlichen Ausnahmegruppe.',{exceptionNotice:'absent'});
    for(const state of['incomplete','disputed'])add(p,'NOTICE-'+state.toUpperCase(),'2026-12-14',days,
      {outcome:'qualificationBoundaryProposed',reason:'exceptionNoticeUnresolved'},'Kein definitives Resultat bei unklarer Hinweisqualifikation.',{exceptionNotice:state});
  }
  const temporalRequirement=p.requirements.find(r=>['newLawApplies','currentProceduralLawQualified'].includes(r.key));
  assert.ok(temporalRequirement,'Missing current-law qualification '+p.id);
  add(p,'OLD-LAW','2026-10-02',days,{outcome:'qualificationBoundaryProposed',reason:temporalRequirement.reason},
    'Empfang 2026 ersetzt keine Klärung des auf die konkrete Instanz anwendbaren Übergangsrechts.',{[temporalRequirement.key]:false});
  if(p.days!==null)add(p,'WRONG-DURATION','2026-10-02',p.days+1,{outcome:'qualificationBoundaryProposed',reason:'statutoryDurationMismatch'},'Gesetzliche Dauer ist kein frei übersteuerbarer Eingabewert.');
  if(p.durationBasis.includes('shortened')){
    const req=p.requirements.find(r=>r.key==='shorteningEstablished'||r.key==='specificShorteningQualified');
    assert.ok(req,'Missing specific shortening fact '+p.id);
    add(p,'NO-SHORTENING','2026-10-02',days,{outcome:'qualificationBoundaryProposed',reason:req.reason},'Eine blosse gesetzliche Verkürzungsmöglichkeit genügt nicht.',{[req.key]:false});
    add(p,'BELOW-MIN','2026-10-02',p.minimumDays-1,{outcome:'qualificationBoundaryProposed',reason:'durationOutsideQualifiedRange'},'Unterhalb der eng qualifizierten gesetzlichen Verkürzungsgrenze.');
    add(p,'ABOVE-MAX','2026-10-02',p.maximumDays+1,{outcome:'qualificationBoundaryProposed',reason:'durationOutsideQualifiedRange'},'Keine unverkürzte Rechtsmittelfrist unter einer Kurzfristqualifikation.');
  }
}
for(const p of[paths[0],paths.find(p=>p.canton==='TG')]){
  for(const[mark,trigger]of[['BEFORE','2026-08-28'],['AFTER','2028-01-01'],['END-CROSSING','2027-12-31']])
    add(p,'WINDOW-'+mark,trigger,p.days??7,{outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'},'Auslöser und gesamte Folgerechnung müssen vom Fenster gedeckt sein.');
}
const glOrdered=paths.find(p=>p.id==='GL-COURT-ORDERED');
add(glOrdered,'FAHRT','2027-03-31',1,dated('2027-04-02'),'Angeordnete GL-Tagesfrist zählt während Osterferien, Endtag fällt auf die Näfelser Fahrt.');
const tgOrdered=paths.find(p=>p.id==='TG-ADMIN-ORDERED');
add(tgOrdered,'NO-GL-FAHRT','2027-03-31',1,dated('2027-04-01'),'Keine Übernahme des Glarner Fahrttags in TG.');
const negativeQualifications=[
  ['GL-ADMIN-30','authorityLevel','municipal','Kommunale Zielstelle ist nicht der freigegebene kantonale Umfang.'],
  ['GL-ADMIN-30','specialLaw','ATSG','Keine neue Sozialanbindung über den allgemeinen Verwaltungsweg.'],
  ['GL-ADMIN-30','qualifiedOpening',false,'Ungeklärte Eröffnung trägt keinen positiven Rechtsmittelbeginn.'],
  ['GL-ADMIN-30','openingMode','unqualifiedPlatformReceipt','Plattformquittung nicht ungeprüft als allgemeine schriftliche Eröffnung behandeln.'],
  ['GL-ADMIN-30','deadlineMethod','fixedAppointment','Fixer Termin gehört nicht unter die vorwärts laufende Tagesfrist.'],
  ['GL-ADMIN-30','paymentOrFixedAppointment',true,'Keine Berechnung einer Kostenvorschusszahlung als Beschwerde.'],
  ['GL-ADMIN-30','targetAuthority','foreignAuthority','Keine freie Feiertagskantonswahl anstelle der zuständigen Zielstelle.'],
  ['GL-ADMIN-30','decisionType','interim','Zwischenentscheid darf nicht unter der Dreissigtagegruppe verborgen werden.'],
  ['GL-ADMIN-30','art90Exception','immediateSeriousDanger','Ferienausnahme muss den Normalweg verlassen.'],
  ['GL-ADMIN-30-EXCEPTION','art90Exception','specialUrgencyOnly','Besondere Dringlichkeit allein ist keine unmittelbare ernste Gefahr.'],
  ['GL-COURT-ORDERED','durationBasis','shortenedStatutoryAppeal','Verkürzte gesetzliche Frist ist keine gewöhnliche Eingabeanordnung.'],
  ['TG-REKURS-30','noDifferentSpecialDeadlineRule',false,'Abweichendes Spezialrecht nicht durch den VRG-Normalwert ersetzen.'],
  ['TG-VG-30','notInsuranceCourt',false,'Keine zusätzliche Versicherungsgerichtsfreigabe.'],
  ['TG-VG-30','holidayException','provisionalProtection','Gerichtlicher Ausnahmegegenstand benötigt seinen eigenen Hinweiszweig.'],
  ['TG-VG-30','legallyEffectiveWrittenService',false,'Blosse mündliche Kenntnisnahme genügt nicht für den Rechtsmittelbeginn.'],
  ['TG-RR-30','regierungsratCompetenceBasis','unqualified','Regierungsrat ist keine allgemeine frei wählbare Beschwerdeinstanz.'],
  ['TG-VG-PROVISIONAL-ORDERED','noticeAppliesToCurrentOrder',false,'Frühere Belehrung wird nicht automatisch auf eine spätere Anordnung übertragen.'],
  ['TG-VG-PROVISIONAL-ORDERED','noticeDocumentQualified',false,'Fehlender Hinweis im falschen Dokument ist kein positiver Rückausnahmebeleg.'],
  ['TG-VG-EXECUTION-5','actualEnforcementDecision',false,'Kein tatsächlicher qualifizierter Vollstreckungsentscheid.'],
  ['TG-VG-EXECUTION-5','notMereWarning',false,'Blosse Vollstreckungsandrohung erhält keinen Fünftagesweiterzug.'],
  ['TG-VG-EXECUTION-5','notOriginalSubstantiveDecision',false,'Neuer materieller Sachentscheid ist nicht die reine Vollstreckungsverfügung.'],
  ['TG-VG-EXECUTION-5','noConflictingPeriodInformation',false,'Konkrete Dreissigtagebelehrung wird nicht still durch fünf Tage ersetzt.'],
  ['TG-VG-EXECUTION-5','notSchkgMoneyEnforcement',false,'Kein SchKG-Geldvollstreckungsweg.'],
  ['TG-VG-EXECUTION-5','qualifiedEnforcementReviewScope',false,'Kein verkleideter erneuter Weiterzug gegen die materielle Sache.']
];
assert.equal(negativeQualifications.length,24);
for(const[id,key,value,note]of negativeQualifications){
  const p=paths.find(p=>p.id===id),req=p.requirements.find(r=>r.key===key);assert.ok(req,id+'/'+key);
  add(p,'QUAL-'+key.toUpperCase(),'2026-10-02',p.days??7,{outcome:'qualificationBoundaryProposed',reason:req.reason},note,{[key]:value});
}
const rr=paths.find(p=>p.id==='TG-RR-30');
add(rr,'SECOND-QUALIFIED-COMPETENCE','2026-10-02',30,dated('2026-11-02'),
  'Zweite ausdrücklich zugelassene Zuständigkeitsalternative nach § 55 Abs. 1 Ziff. 9.',{regierungsratCompetenceBasis:'vrg55Abs1Nr9Qualified'});
const probes=[];
for(const[calendar,positive,negative]of[
  ['GL-RESEARCH',['2026-04-09','2027-04-01','2027-11-01','2027-01-01','2027-05-06'],['2026-04-02','2027-04-08','2027-01-02','2026-05-01']],
  ['TG-RESEARCH',['2026-01-02','2026-05-01','2027-03-29','2027-05-17'],['2027-04-01','2027-11-01']]]){
  for(const date of positive)probes.push({calendar,date,isHoliday:true});
  for(const date of negative)probes.push({calendar,date,isHoliday:false});
}
const suite={formatVersion:'ap23i1-research-references-1',asOf:'2026-10-22',runtimeActive:false,productTest:false,legalApproval:false,
  expectedPathCount:34,window:{from:'2026-08-29',to:'2027-12-31'},easter:{2026:'2026-04-05',2027:'2027-03-28'},
  sharedSyntheticFacts,sharedRequirements,sourceModels:inputs,
  temporalBindings:{GL:[{id:'GL-CURRENT-2395',from:'2026-08-29',to:'2027-12-31',basis:'VRG2395, RTG2110, keine Art140a-Altinstanz, qualifizierte schriftliche Eröffnung'}],
    TG:[{id:'TG-CURRENT-2774',from:'2026-08-29',to:'2027-12-31',basis:'VRG2774, RTG2949, konkret geklärtes aktuelles Instanzrecht, qualifizierte schriftliche Eröffnung'}]},
  calendars:{'GL-RESEARCH':{fixed:['01-01','08-01','11-01','12-25','12-26'],easterOffsets:[-2,1,39,50],naefelserFahrt:true},
    'TG-RESEARCH':{fixed:['01-01','01-02','05-01','08-01','12-25','12-26'],easterOffsets:[-2,1,39,50]}},
  calendarBaselines,calendarProbes:probes,paths,cases,
  note:'Static research expectations and synthetic case facts, not product defaults. No live legal, runtime, export or operating approval.'};
await mkdir(folder,{recursive:true});
await writeFile(folder+'/referenzfaelle.json',JSON.stringify(suite,null,2)+'\n');
console.log(JSON.stringify({status:'research-fixture-authored',paths:paths.length,cases:cases.length,calendarProbes:probes.length,productImports:false}));
