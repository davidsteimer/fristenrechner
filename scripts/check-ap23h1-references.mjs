// SPDX-License-Identifier: AGPL-3.0-only
// Research-only oracle. No product imports and no runtime or export assertion.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const fixture='docs/fachrecht/ap23h1/referenzfaelle.json';
const out='outputs/ap23h1-2026-10-22';
const dayMs=86400000;
const epoch=d=>Date.parse(d+'T00:00:00Z')/dayMs;
const iso=n=>new Date(n*dayMs).toISOString().slice(0,10);
const add=(d,n)=>iso(epoch(d)+n);
const dow=d=>new Date(d+'T00:00:00Z').getUTCDay();
const weekend=d=>dow(d)===0||dow(d)===6;
const sha=b=>createHash('sha256').update(b).digest('hex');
const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(epoch(d))&&iso(epoch(d))===d;
const inside=(d,s)=>d>=s.referenceWindow.from&&d<=s.referenceWindow.to;
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason});
const windowBoundary=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'});
export function holidays(id,year,s){
  const p=s.calendarDefinitions[id];assert.ok(p&&s.easter[year],id+'/'+year);
  return new Set([...p.fixed.map(md=>year+'-'+md),...p.easterOffsets.map(n=>add(s.easter[year],n))]);
}
export function suspended(d,path,s){
  assert.ok(['none','winter','three'].includes(path.suspension),'Unknown research suspension');
  if(path.suspension==='none')return false;
  const md=d.slice(5);
  if(md>='12-18'||md<='01-02')return true;
  if(path.suspension==='winter')return false;
  const e=s.easter[d.slice(0,4)];assert.ok(e);
  return md>='07-15'&&md<='08-15'||d>=add(e,-7)&&d<=add(e,7);
}
function prepared(item,s){
  const p=s.paths.find(p=>p.id===item.path);
  if(!p)return{result:boundary('unknownResearchPath')};
  if(!valid(item.trigger))return{result:boundary('invalidResearchDate')};
  const f={...s.sharedSyntheticFacts,...p.syntheticFacts,...item.facts};
  const allowed=new Set([...Object.keys(s.sharedSyntheticFacts),...s.paths.flatMap(p=>Object.keys(p.syntheticFacts))]);
  if(Object.keys(item.facts??{}).some(k=>!allowed.has(k)))return{result:boundary('unknownResearchFact')};
  for(const q of [...s.sharedRequirements,...p.requirements])if(f[q.key]!==q.value)return{result:boundary(q.reason)};
  if(p.openingChain){
    if(!['originalReasoned','reasonedFollowingTimelyRequest'].includes(f.openingOrigin))return{result:boundary('openingOriginNotQualified')};
    if(f.openingOrigin==='reasonedFollowingTimelyRequest'&&f.priorReasonsRequest!=='timelyEstablished')return{result:boundary('priorReasonsRequestNotEstablished')};
  }
  if(!Number.isSafeInteger(item.days)||item.days<1)return{result:boundary('dayDurationNotSpecified')};
  if(p.days!==null&&item.days!==p.days)return{result:boundary('statutoryDurationMismatch')};
  if(!inside(item.trigger,s))return{result:windowBoundary()};
  return{p,f};
}
export function evaluate(item,s){
  const q=prepared(item,s);if(q.result)return q.result;
  const {p}=q;
  let d=item.trigger,count=0,skippedDays=0,firstCountedDay;
  const bindings=new Set();
  function bindDate(date){
    const match=s.temporalBindings[p.canton].filter(b=>date>=b.from&&date<=b.to);
    assert.equal(match.length,1,'Ambiguous/missing temporal binding '+p.canton+'/'+date);bindings.add(match[0].id);
  }
  bindDate(d);
  while(count<item.days){
    d=add(d,1);if(!inside(d,s))return windowBoundary();bindDate(d);
    if(suspended(d,p,s)){skippedDays++;continue;}
    firstCountedDay??=d;count++;
  }
  const nominalEnd=d,shifts=[];
  while(weekend(d)||holidays(p.calendar,Number(d.slice(0,4)),s).has(d)){
    d=add(d,1);if(!inside(d,s))return windowBoundary();bindDate(d);shifts.push(d);
  }
  const collision=shifts.find(date=>suspended(date,p,s));
  if(collision&&p.endShiftCollision==='proposedBoundary')return{outcome:'unresolvedBoundaryProposed',reason:'H1-END-SUSPENSION',
    nominalEnd,ordinaryShiftEnd:d,firstSuspendedShiftDate:collision};
  return{outcome:'datedResearchValue',ordinaryStart:add(item.trigger,1),firstCountedDay,nominalEnd,end:d,skippedDays,
    endShiftDays:epoch(d)-epoch(nominalEnd),temporalBindings:[...bindings]};
}
export function evaluateIsolatedPractice(probe,s){
  assert.equal(probe.productScope,false);assert.equal(probe.normReleaseApproval,false);
  const p=s.paths.find(p=>p.id===probe.path);assert.ok(p);
  assert.ok(probe.trigger<s.referenceWindow.from||probe.trigger>s.referenceWindow.to,'Separate probe must not masquerade as in-scope case');
  const isolated={...s,referenceWindow:probe.arithmeticWindow,temporalBindings:{...s.temporalBindings,
    [p.canton]:[{id:'isolatedPracticeArithmeticOnly',...probe.arithmeticWindow}]}};
  const result=evaluate(probe,isolated);
  return{...result,isolatedPracticeOnly:true,normReleaseApproval:false};
}
function rawRuleDate(rule,year,s){
  const c=rule.calculation;
  assert.equal(rule.condition,'always','Do not silently simplify calendar conditions');
  if(c.type==='fixedMonthDay')return `${year}-${String(c.month).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
  if(c.type==='easterOffsetDays')return add(s.easter[year],c.offsetDays);
  assert.equal(c.type,'nthWeekdayOfMonth');assert.equal(c.isoWeekday,7);assert.equal(c.occurrence,3);
  let date=`${year}-${String(c.month).padStart(2,'0')}-15`;while(dow(date)!==0)date=add(date,1);return date;
}
export async function runReferences({fixturePath=fixture}={}){
  const raw=await readFile(resolve(root,fixturePath)),s=JSON.parse(raw);
  assert.equal(s.formatVersion,'ap23h1-research-references-1');
  for(const k of ['runtimeActive','productTest','legalApproval'])assert.equal(s[k],false,k);
  assert.equal(s.paths.length,s.expectedPathCount);assert.equal(new Set(s.paths.map(x=>x.id)).size,s.paths.length);
  assert.ok(s.paths.length>0);assert.ok(valid(s.referenceWindow.from)&&valid(s.referenceWindow.to));
  assert.ok(s.referenceWindow.from<=s.referenceWindow.to);
  assert.equal(new Set(s.cases.map(x=>x.id)).size,s.cases.length);
  const discrepancies=[],results=s.cases.map(c=>{
    assert.ok(c.expected&&Object.hasOwn(c.expected,'outcome'),'Missing explicit expected outcome '+c.id);
    assert.ok(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].includes(c.expected.outcome),'Unknown expected outcome '+c.id);
    if(c.expected.outcome==='datedResearchValue')assert.ok(valid(c.expected.end),'Dated expectation needs explicit end '+c.id);
    else assert.equal(Object.hasOwn(c.expected,'end'),false,'Boundary must not carry a dated expectation '+c.id);
    const actual=evaluate(c,s);
    for(const[k,expected]of Object.entries(c.expected))if(JSON.stringify(actual[k])!==JSON.stringify(expected))discrepancies.push({id:c.id,key:k,expected,actual:actual[k]??null});
    if(actual.outcome!=='datedResearchValue')assert.equal(Object.hasOwn(actual,'end'),false,c.id);
    return{id:c.id,path:c.path,expected:c.expected,actual};
  });
  for(const p of s.paths)assert.ok(results.some(r=>r.path===p.id&&r.actual.outcome==='datedResearchValue'),'Missing positive '+p.id);
  const isolatedPracticeResults=[];
  for(const probe of s.isolatedPracticeProbes??[]){
    assert.equal(sha(await readFile(resolve(root,probe.sourcePath))),probe.sourceSha256,'Isolated practice source bytes');
    const actual=evaluateIsolatedPractice(probe,s);
    for(const[k,expected]of Object.entries(probe.expected))if(JSON.stringify(actual[k])!==JSON.stringify(expected))discrepancies.push({id:probe.id,type:'isolatedPracticeArithmetic',key:k,expected,actual:actual[k]??null});
    isolatedPracticeResults.push({id:probe.id,sourceRef:probe.sourceRef,sourcePath:probe.sourcePath,sourceSha256:probe.sourceSha256,expected:probe.expected,actual});
  }
  let calendarCountChecks=0;
  for(const[id,c]of Object.entries(s.calendarDefinitions))for(const y of [2026,2027]){
    assert.equal(holidays(id,y,s).size,c.expectedAnnualRuleCount,id+'/'+y);calendarCountChecks++;
  }
  for(const p of s.calendarProbes){
    const actual=holidays(p.calendar,Number(p.date.slice(0,4)),s).has(p.date);
    if(actual!==p.isHoliday)discrepancies.push({type:'calendarProbe',...p,actual});
  }
  const calendarComparisons=[];
  for(const b of s.calendarBaselines){
    const bytes=await readFile(resolve(root,b.path));assert.equal(sha(bytes),b.sha256,b.path);
    const old=JSON.parse(bytes);assert.equal(old.rules.length,13);
    for(const year of [2026,2027]){
      const baseline=new Set(old.rules.map(r=>rawRuleDate(r,year,s)));
      const additions=[...b.additionalFixed.map(md=>year+'-'+md),...b.additionalEasterOffsets.map(n=>add(s.easter[year],n))];
      const projected=new Set([...baseline,...additions]);assert.equal(projected.size,17);
      let daysCompared=0,differences=0;
      for(let d=`${year}-01-01`;d<=`${year}-12-31`;d=add(d,1)){
        const a=weekend(d)||projected.has(d),expected=weekend(d)||holidays(b.researchCalendar,year,s).has(d);
        if(a!==expected){differences++;discrepancies.push({type:'calendarProjection',calendar:b.researchCalendar,date:d,expected,actual:a});}
        daysCompared++;
      }
      calendarComparisons.push({calendar:b.researchCalendar,year,sourcePath:b.path,sourceSha256:b.sha256,baselineRules:13,
        proposedProjectionDates:17,relevantNamedResearchDates:14,daysCompared,endEligibilityDifferences:differences});
    }
  }
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(k=>[k,results.filter(r=>r.actual.outcome===k).length]));
  return{suite:s,report:{workPackage:'AP23H1',asOf:s.asOf,status:discrepancies.length?'discrepancies':'passedResearchComparison',
    fixtureSha256:sha(raw),checkerSha256:sha(await readFile(fileURLToPath(import.meta.url))),
    runtimeActive:false,productTest:false,exportTest:false,legalApproval:false,paths:s.paths.length,referenceCases:results.length,
    counts,calendarProbes:s.calendarProbes.length,calendarCountChecks,calendarComparisons,isolatedPracticeResults,discrepancies,results}};
}
export function renderTable(s,r){
  const fmt=d=>/^\d{4}-\d{2}-\d{2}$/.test(d??'')?`${d.slice(8)}.${d.slice(5,7)}.${d.slice(0,4)}`:d;
  const escape=v=>String(v??'').replaceAll('|','\\|').replaceAll('\n',' ');
  return['# AP23H1 Forschungsreferenzfälle für Obwalden und Nidwalden','',
    'Stand 22. Oktober 2026. **Fachlicher Abnahmevorschlag, keine Produktprüfung oder operative Freigabe.**','',
    `${r.paths} Forschungsgruppen und ${r.referenceCases} Fälle. ${r.counts.datedResearchValue} Datumssollwerte, ${r.counts.unresolvedBoundaryProposed} offene Endverschiebungen, ${r.counts.qualificationBoundaryProposed} vorgeschlagene Qualifikationsgrenzen und ${r.counts.researchWindowBoundary} Fenstergrenzen. ${r.discrepancies.length} Abweichungen.`,
    '', 'Alle positiven Fälle enthalten ausdrücklich synthetische aktuelle Falltatsachen. Diese Forschungsannahmen sind keine Benutzerdefaults. Die Probe berechnet weder Zustellfiktionen noch eine tatsächliche Einreichung und beweist keine bereits implementierte App- oder Exportsperre.',
    '', '## Forschungsgruppen','', '| Gruppe | Stufe | Tage | Kalender | Stillstand |','| --- | --- | ---: | --- | --- |',
    ...s.paths.map(p=>`| ${p.id} | ${p.stage} | ${p.days??'angeordnet'} | ${p.calendar} | ${p.suspension} |`),
    '', 'Die Kalender enthalten je 14 benannte prozessrelevante Tage. Sonntage werden separat berücksichtigt. Die unabhängige virtuelle Rohdatenprojektion umfasst einschliesslich ohnehin sonntäglicher Tage 17 Termine, nicht 17 zusätzliche fristverschiebende Wochentage. Es werden keine Produktkalender verändert.',
    '', '## Vorgegebene Referenzfälle','', '| Fall | Gruppe | Massgebender Auslöser | Tage | Erwartung | Zweck |','| --- | --- | --- | ---: | --- | --- |',
    ...r.results.map(row=>{const c=s.cases.find(c=>c.id===row.id),a=row.actual;
      const result=a.outcome==='datedResearchValue'?fmt(a.end):a.outcome==='unresolvedBoundaryProposed'?`Offen: Zähltag ${fmt(a.nominalEnd)}, blosse Endverschiebung ${fmt(a.ordinaryShiftEnd)}`:a.outcome==='researchWindowBoundary'?'Ausserhalb des vollständig gedeckten Fensters':a.reason;
      return`| ${c.id} | ${c.path} | ${fmt(c.trigger)} | ${c.days??'offen'} | ${escape(result)} | ${escape(c.note)} |`;}),
    '', '## Unabhängigkeit und Grenzen','',
    '`node scripts/check-ap23h1-references.mjs` prüft die vorgegebenen Erwartungen. `--write` erzeugt diese Tabelle und den Forschungsbericht. `python scripts/check_ap23h1_independent.py` verwendet eine getrennte vollständige Datumsenumeration und einen selbst berechneten Ostertermin. Beide Sollrechner importieren keine Produktmodule. Nur die isolierte Wiederverwendbarkeitsprobe liest die bytegebundenen Bestandskalender.',
    '', 'Das Fenster umfasst 29.08.2026 bis 31.12.2027 einschliesslich sämtlicher Zähl-, Stillstands- und Endverschiebungstage. Die unabhängige Datumsrechnung bestätigt nicht von selbst die gemeinsame Rechtsauslegung. Offene reine Endverschiebungskollisionen enthalten deshalb keinen definitiven Fristwert.',
    '', 'Die drei zusätzlichen OW-Handlungen sind ausdrücklich Fachvorschläge: Die Begründungsverlangen werden mit dreissig Tagen und kantonalem Stillstand geprüft. Der Fünftagesweiterzug setzt die vorgeschlagene sinngemässe Ferienausnahme für den qualifizierten Massnahmekontext voraus. Ein positiver Forschungswert ist keine bereits bestätigte Rechtsauslegung oder Runtimefreigabe.',
    '', 'Die reine Endverschiebung in neu beginnende Ferien ist in 18 Dreiperiodengruppen eigens geprüft. Für das reine Winterprofil entsteht im konkreten Fenster keine solche Kernkalenderkonstellation: Der 18. Dezember fällt 2026 auf Freitag und 2027 auf Samstag, der jeweilige Vortag ist ein zulässiger Endtag. Es wird dafür kein künstlicher positiver Kollisionsfall erfunden.',
    ...(r.isolatedPracticeResults.length?['','## Isolierter arithmetischer Praxisnachvollzug','',
      ...r.isolatedPracticeResults.map(row=>`- ${row.id}: ${fmt(s.isolatedPracticeProbes.find(p=>p.id===row.id).trigger)} mit 20 Tagen und Sommerstillstand ergibt ${fmt(row.actual.end)}. Quelle ${row.sourceRef}. Dieser gesonderte Nachvollzug liegt ausserhalb des H1-Fallfensters und erzeugt keine zusätzliche zeitliche oder operative Freigabe.`)]:[]),
    '', `Fixture SHA-256: \`${r.fixtureSha256}\`. Node-Checker SHA-256: \`${r.checkerSha256}\`. [Node-Nachweis](../../outputs/ap23h1-2026-10-22/reference-verification.json), [Python-Nachweis](../../outputs/ap23h1-2026-10-22/reference-independent-verification.json).`,
    '', 'Fachliche Grundlage: [Fachvorlage](verwaltungsverfahren-ap23h1.md) und [Quellenprüfung](quellenpruefung-ap23h1.md). Aufnahme, Kalenderbindungen, zusätzliche Sachverhaltsqualifikation und begrenzte offene Fälle stehen zur menschlichen Fachabnahme.', ''].join('\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const{suite,report}=await runReferences();
  if(process.argv.includes('--write')){
    await mkdir(resolve(root,out),{recursive:true});await writeFile(resolve(root,out+'/reference-verification.json'),JSON.stringify(report,null,2)+'\n');
    await writeFile(resolve(root,'docs/fachrecht/referenzfaelle-ap23h1.md'),renderTable(suite,report));
  }
  console.log(JSON.stringify({...report,results:undefined},null,2));if(report.discrepancies.length)process.exitCode=1;
}
