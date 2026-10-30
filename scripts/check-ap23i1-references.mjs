// SPDX-License-Identifier: AGPL-3.0-only
// Isolated research arithmetic and qualifications. No product modules or runtime claims.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const fixture='docs/fachrecht/ap23i1/referenzfaelle.json';
const output='outputs/ap23i1-2026-10-22';
const ms=86400000;
const epoch=d=>Date.parse(d+'T00:00:00Z')/ms;
const iso=n=>new Date(n*ms).toISOString().slice(0,10);
const add=(d,n)=>iso(epoch(d)+n);
const dow=d=>new Date(d+'T00:00:00Z').getUTCDay();
const weekend=d=>[0,6].includes(dow(d));
const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(epoch(d))&&iso(epoch(d))===d;
const hash=b=>createHash('sha256').update(b).digest('hex');
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason});
const outside=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'});
export function holidays(calendar,year,s){
  const c=s.calendars[calendar];assert.ok(c&&s.easter[year]);
  const dates=new Set([...c.fixed.map(md=>year+'-'+md),...c.easterOffsets.map(n=>add(s.easter[year],n))]);
  if(c.naefelserFahrt){
    let d=year+'-04-01';while(dow(d)!==4)d=add(d,1);
    if(d===add(s.easter[year],-3))d=add(d,7);
    dates.add(d);
  }
  return dates;
}
export function suspended(date,mode,s){
  assert.ok(['none','three'].includes(mode));
  if(mode==='none')return false;
  const md=date.slice(5),e=s.easter[date.slice(0,4)];assert.ok(e);
  return md>='12-18'||md<='01-02'||md>='07-15'&&md<='08-15'||date>=add(e,-7)&&date<=add(e,7);
}
export function evaluate(item,s){
  const p=s.paths.find(p=>p.id===item.path);
  if(!p)return boundary('unknownResearchPath');
  if(!valid(item.trigger))return boundary('invalidResearchDate');
  const allowed=new Set([...Object.keys(s.sharedSyntheticFacts),...s.paths.flatMap(p=>Object.keys(p.syntheticFacts))]);
  if(Object.keys(item.facts??{}).some(k=>!allowed.has(k)))return boundary('unknownResearchFact');
  const facts={...s.sharedSyntheticFacts,...p.syntheticFacts,...item.facts};
  for(const q of [...s.sharedRequirements,...p.requirements]){
    const match=Object.hasOwn(q,'oneOf')?(assert.ok(Array.isArray(q.oneOf)&&q.oneOf.length>0),q.oneOf.includes(facts[q.key])):facts[q.key]===q.value;
    if(!match)return boundary(q.reason);
  }
  let mode=p.suspension;
  if(mode==='tgNotice'){
    if(!['given','absent'].includes(facts.exceptionNotice))return boundary('exceptionNoticeUnresolved');
    mode=facts.exceptionNotice==='absent'?'three':'none';
  }
  assert.ok(['proposedBoundary','notApplicable'].includes(p.endShiftCollision),'Unknown end-shift collision policy');
  assert.ok(mode==='none'||p.endShiftCollision==='proposedBoundary','Suspended path requires explicit collision boundary');
  if(!Number.isSafeInteger(item.days)||item.days<1)return boundary('dayDurationNotSpecified');
  if(p.days!==null&&item.days!==p.days)return boundary('statutoryDurationMismatch');
  if(p.minimumDays!==undefined&&item.days<p.minimumDays||p.maximumDays!==undefined&&item.days>p.maximumDays)return boundary('durationOutsideQualifiedRange');
  if(item.trigger<s.window.from||item.trigger>s.window.to)return outside();
  const bindings=new Set();
  function bind(d){
    const options=s.temporalBindings[p.canton].filter(b=>d>=b.from&&d<=b.to);
    assert.equal(options.length,1,'Missing/ambiguous temporal binding '+p.canton+'/'+d);
    bindings.add(options[0].id);
  }
  let d=item.trigger,n=0,skippedDays=0,firstCountedDay;
  bind(d);
  while(n<item.days){
    d=add(d,1);if(d>s.window.to)return outside();bind(d);
    if(suspended(d,mode,s)){skippedDays++;continue;}
    firstCountedDay??=d;n++;
  }
  const nominalEnd=d,shifted=[];
  while(weekend(d)||holidays(p.calendar,Number(d.slice(0,4)),s).has(d)){
    d=add(d,1);if(d>s.window.to)return outside();bind(d);shifted.push(d);
  }
  const collision=shifted.find(x=>suspended(x,mode,s));
  if(collision&&p.endShiftCollision==='proposedBoundary')return{outcome:'unresolvedBoundaryProposed',reason:'I1-END-SUSPENSION',nominalEnd,ordinaryShiftEnd:d,firstSuspendedShiftDate:collision};
  return{outcome:'datedResearchValue',ordinaryStart:add(item.trigger,1),firstCountedDay,nominalEnd,end:d,
    skippedDays,endShiftDays:epoch(d)-epoch(nominalEnd),suspension:mode,temporalBindings:[...bindings]};
}
function rawRuleDate(r,year,s){
  const c=r.calculation;
  if(c.type==='fixedMonthDay'){
    assert.equal(r.condition,'always');
    return`${year}-${String(c.month).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
  }
  if(c.type==='easterOffsetDays'){
    assert.equal(r.condition,'always');return add(s.easter[year],c.offsetDays);
  }
  assert.equal(c.type,'nthWeekdayOfMonth');
  let d=`${year}-${String(c.month).padStart(2,'0')}-01`,n=0;
  for(;;d=add(d,1))if((dow(d)||7)===c.isoWeekday&&++n===c.occurrence)break;
  if(r.condition==='shiftHolyThursdayBy7Days'){
    assert.deepEqual(c,{type:'nthWeekdayOfMonth',month:4,isoWeekday:4,occurrence:1});
    if(d===add(s.easter[year],-3))d=add(d,7);
  }else assert.equal(r.condition,'always');
  return d;
}
export async function runReferences({fixturePath=fixture}={}){
  const bytes=await readFile(resolve(root,fixturePath)),s=JSON.parse(bytes);
  assert.equal(s.formatVersion,'ap23i1-research-references-1');
  for(const key of['runtimeActive','productTest','legalApproval'])assert.equal(s[key],false,key);
  assert.equal(s.paths.length,s.expectedPathCount);
  assert.equal(new Set(s.paths.map(p=>p.id)).size,s.paths.length);
  assert.equal(new Set(s.cases.map(c=>c.id)).size,s.cases.length);
  assert.deepEqual(s.window,{from:'2026-08-29',to:'2027-12-31'});
  const discrepancies=[],results=[];
  for(const c of s.cases){
    assert.ok(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].includes(c.expected?.outcome));
    if(c.expected.outcome==='datedResearchValue')assert.ok(valid(c.expected.end));
    else assert.equal(Object.hasOwn(c.expected,'end'),false,'Boundary cannot carry definite end '+c.id);
    const actual=evaluate(c,s);
    for(const[key,value]of Object.entries(c.expected))if(JSON.stringify(actual[key])!==JSON.stringify(value))discrepancies.push({id:c.id,key,expected:value,actual:actual[key]??null});
    if(actual.outcome!=='datedResearchValue')assert.equal(Object.hasOwn(actual,'end'),false);
    results.push({id:c.id,path:c.path,expected:c.expected,actual});
  }
  for(const p of s.paths)assert.ok(results.some(r=>r.path===p.id&&r.actual.outcome==='datedResearchValue'),'No positive reference '+p.id);
  for(const probe of s.calendarProbes){
    const actual=holidays(probe.calendar,Number(probe.date.slice(0,4)),s).has(probe.date);
    if(actual!==probe.isHoliday)discrepancies.push({...probe,kind:'calendarProbe',actual});
  }
  const calendarComparisons=[];
  for(const b of s.calendarBaselines){
    const raw=await readFile(resolve(root,b.path));assert.equal(hash(raw),b.sha256,b.path);
    const rules=JSON.parse(raw).rules;assert.equal(rules.length,13);
    for(const year of[2026,2027]){
      const dates=new Set(rules.map(r=>rawRuleDate(r,year,s))),named=holidays(b.calendar,year,s);
      assert.equal(dates.size,13);assert.equal(named.size,10);
      let checked=0,differences=0;
      for(let date=year+'-01-01';date<=year+'-12-31';date=add(date,1)){
        const a=weekend(date)||dates.has(date),e=weekend(date)||named.has(date);
        if(a!==e){differences++;discrepancies.push({kind:'calendarProjection',calendar:b.calendar,date,expected:e,actual:a});}
        checked++;
      }
      calendarComparisons.push({calendar:b.calendar,year,sourcePath:b.path,sourceSha256:b.sha256,rawRules:13,
        namedResearchDates:10,daysCompared:checked,endEligibilityDifferences:differences});
    }
  }
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(k=>[k,results.filter(r=>r.actual.outcome===k).length]));
  return{suite:s,report:{workPackage:'AP23I1',asOf:s.asOf,status:discrepancies.length?'discrepancies':'passedResearchComparison',
    fixtureSha256:hash(bytes),checkerSha256:hash(await readFile(fileURLToPath(import.meta.url))),
    runtimeActive:false,productTest:false,exportTest:false,legalApproval:false,paths:s.paths.length,referenceCases:s.cases.length,
    counts,calendarProbes:s.calendarProbes.length,calendarComparisons,discrepancies,results}};
}
export function renderTable(s,r){
  const fmt=d=>/^\d{4}-\d{2}-\d{2}$/.test(d??'')?`${d.slice(8)}.${d.slice(5,7)}.${d.slice(0,4)}`:d;
  const esc=v=>String(v??'').replaceAll('|','\\|').replaceAll('\n',' ');
  return['# AP23I1 Forschungsreferenzfälle für Glarus und Thurgau','',
    'Stand 22. Oktober 2026. Fachlicher Abnahmevorschlag, keine Produktprüfung oder operative Freigabe.','',
    `${r.paths} Forschungsgruppen, ${r.referenceCases} vorgegebene Fälle. ${r.counts.datedResearchValue} Datumssollwerte, ${r.counts.unresolvedBoundaryProposed} begrenzte Endverschiebungskollisionen, ${r.counts.qualificationBoundaryProposed} Qualifikationsgrenzen und ${r.counts.researchWindowBoundary} Fenstergrenzen. ${r.discrepancies.length} Abweichungen.`,
    '', '## Gruppen und Forschungsannahmen','',
    '| Gruppe | Stufe | Tage | Stillstand |','| --- | --- | ---: | --- |',
    ...s.paths.map(p=>`| ${p.id} | ${p.stage} | ${p.days??'konkret angeordnet'} | ${p.suspension} |`),
    '', 'Alle positiven Fälle setzen ausdrücklich synthetische aktuelle Falltatsachen voraus. Sie sind keine Benutzerdefaults. Der Modus `tgNotice` unterscheidet bei den dafür bestimmten gerichtlichen Ausnahmegruppen den vorhandenen vom vollständig fehlenden Hinweis. Ungeklärte Hinweise erhalten keinen definitiven Datumssollwert.',
    '', '## Vorgegebene Fälle','',
    '| Fall | Gruppe | Auslöser | Tage | Erwartung | Zweck |','| --- | --- | --- | ---: | --- | --- |',
    ...r.results.map(row=>{const c=s.cases.find(c=>c.id===row.id),a=row.actual;
      const e=a.outcome==='datedResearchValue'?fmt(a.end):a.outcome==='unresolvedBoundaryProposed'?`Offen: Zähltag ${fmt(a.nominalEnd)}, gewöhnliche Endverschiebung ${fmt(a.ordinaryShiftEnd)}`:a.outcome==='researchWindowBoundary'?'Ausserhalb des vollständigen Fallfensters':a.reason;
      return`| ${c.id} | ${c.path} | ${fmt(c.trigger)} | ${c.days??'offen'} | ${esc(e)} | ${esc(c.note)} |`;}),
    '', '## Kalender und unabhängige Nachrechnung','',
    'Die Forschungslisten enthalten je zehn benannte Feiertagsdaten. Die beiden bytegebundenen Bestandskalender enthalten zusätzlich drei ohnehin sonntägliche Herkunftsregeln. Verglichen wird die Endtagszulässigkeit einschliesslich Wochenenden an 1’460 Tagen in 2026 und 2027. Die GL-Fahrtregel wird unabhängig einschliesslich Karwochenverschiebung geprüft. Keine Produktkalender werden verändert.',
    '', '`node scripts/check-ap23i1-references.mjs --write` prüft die vorgegebenen Erwartungen durch Tagesfortschaltung. `python scripts/check_ap23i1_independent.py --write` prüft sie durch getrennte vollständige Datumsenumeration und selbst berechnete Ostertermine. Beide importieren keine Produktmodule und berechnen keine Zustellfiktion oder tatsächliche Einreichung.',
    '', 'Das Fenster 29.08.2026–31.12.2027 umfasst Auslöser, Zählung, Stillstand und Endverschiebung vollständig. Ein nachträgliches rechnerisches Übereinstimmen bestätigt nicht von selbst die Rechtsauslegung. Reine Endverschiebung in einen neu beginnenden Stillstand bleibt deshalb im genau bezeichneten Fall ohne definitives Forschungsresultat.',
    '', `Fixture SHA-256: \`${r.fixtureSha256}\`. [Node-Nachweis](../../outputs/ap23i1-2026-10-22/reference-verification.json), [Python-Nachweis](../../outputs/ap23i1-2026-10-22/reference-independent-verification.json).`,
    '', 'Grundlagen: [Fachvorlage](verwaltungsverfahren-ap23i1.md) und [Quellenprüfung](quellenpruefung-ap23i1.md). Aufnahme und Grenzen liegen zur menschlichen Fachabnahme vor.', ''].join('\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(x=>x==='--write'));
  const{suite,report}=await runReferences();
  if(process.argv.includes('--write')){
    await mkdir(resolve(root,output),{recursive:true});
    await writeFile(resolve(root,output+'/reference-verification.json'),JSON.stringify(report,null,2)+'\n');
    await writeFile(resolve(root,'docs/fachrecht/referenzfaelle-ap23i1.md'),renderTable(suite,report));
  }
  console.log(JSON.stringify({...report,results:undefined},null,2));
  if(report.discrepancies.length)process.exitCode=1;
}
