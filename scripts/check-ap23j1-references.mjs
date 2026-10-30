// SPDX-License-Identifier: AGPL-3.0-only
// Research-only, UTC day enumeration. Never imports product calculation code.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './prepare-ap23j1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const fixture='docs/fachrecht/ap23j1/referenzfaelle.json',output='outputs/ap23j1-2026-10-27';
const ms=86400000,epoch=d=>Date.parse(d+'T00:00:00Z')/ms,iso=n=>new Date(n*ms).toISOString().slice(0,10);
export const add=(d,n)=>iso(epoch(d)+n);
const dow=d=>new Date(d+'T00:00:00Z').getUTCDay(),weekend=d=>[0,6].includes(dow(d));
const valid=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(epoch(d))&&iso(epoch(d))===d;
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason});
const outside=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'});
export function holidays(calendar,year,s){
  const c=s.calendars[calendar];assert.ok(c&&s.easter[year]);
  const dates=new Set([...c.fixed.map(md=>year+'-'+md),...c.easterOffsets.map(n=>add(s.easter[year],n))]);
  if(c.genevaFast){let date=year+'-09-01';while(dow(date)!==0)date=add(date,1);dates.add(add(date,4));}
  for(const date of c.additionalDates??[])if(date.startsWith(String(year)+'-'))dates.add(date);
  return dates;
}
export function suspended(date,mode,s){
  assert.ok(['none','two','three'].includes(mode),'Unknown suspension mode');if(mode==='none')return false;
  const md=date.slice(5),e=s.easter[date.slice(0,4)];assert.ok(e);
  return md>='12-18'||md<='01-02'||mode==='three'&&md>='07-15'&&md<='08-15'||date>=add(e,-7)&&date<=add(e,7);
}
export function evaluate(item,s){
  const p=s.paths.find(p=>p.id===item.path);if(!p)return boundary('unknownResearchPath');
  if(!valid(item.trigger))return boundary('invalidResearchDate');
  const allowed=new Set([...Object.keys(s.sharedSyntheticFacts),...s.paths.flatMap(p=>Object.keys(p.syntheticFacts))]);
  if(Object.keys(item.facts??{}).some(key=>!allowed.has(key)))return boundary('unknownResearchFact');
  const facts={...s.sharedSyntheticFacts,...p.syntheticFacts,...item.facts};
  for(const q of[...s.sharedRequirements,...p.requirements]){
    const match=Object.hasOwn(q,'oneOf')?(assert.ok(Array.isArray(q.oneOf)&&q.oneOf.length>0),q.oneOf.includes(facts[q.key])):facts[q.key]===q.value;
    if(!match)return boundary(q.reason);
  }
  const mode=p.suspension;assert.ok(['none','two','three'].includes(mode),'Unknown suspension mode');
  assert.ok(['proposedBoundary','notApplicable'].includes(p.endShiftCollision),'Unknown collision policy');
  assert.ok(mode==='none'||p.endShiftCollision==='proposedBoundary','Suspended path requires collision boundary');
  if(!Number.isSafeInteger(item.days)||item.days<1)return boundary('dayDurationNotSpecified');
  if(p.days!==null&&item.days!==p.days)return boundary('statutoryDurationMismatch');
  if(item.days<(p.minimumDays??1)||item.days>(p.maximumDays??Number.MAX_SAFE_INTEGER))return boundary('durationOutsideQualifiedRange');
  if(item.trigger<s.window.from||item.trigger>s.window.to)return outside();
  const bindings=new Set();
  function bind(date){
    const options=s.temporalBindings[p.canton].filter(b=>date>=b.from&&date<=b.to);
    assert.equal(options.length,1,'Missing/ambiguous temporal binding '+p.canton+'/'+date);bindings.add(options[0].id);
  }
  let opening=item.trigger;bind(opening);
  assert.ok(['qualifiedLegalOpening','geQualifiedOrOrdinaryPost'].includes(p.opening),'Unknown opening rule');
  if(p.opening==='geQualifiedOrOrdinaryPost'){
    if(!['qualifiedLegalOpening','ordinaryPostPhysicalReceipt'].includes(facts.openingMode))return boundary('openingModeUnqualified');
    if(facts.openingMode==='ordinaryPostPhysicalReceipt')while(weekend(opening)||holidays(p.calendar,Number(opening.slice(0,4)),s).has(opening)){
      opening=add(opening,1);if(opening>s.window.to)return outside();bind(opening);
    }
  }
  let date=opening,counted=0,skippedDays=0,firstCountedDay;const visited=[];
  while(counted<item.days){
    date=add(date,1);if(date>s.window.to)return outside();bind(date);visited.push(date);
    if(suspended(date,mode,s)){skippedDays++;continue;}firstCountedDay??=date;counted++;
  }
  const nominalEnd=date,shifted=[];
  while(weekend(date)||holidays(p.calendar,Number(date.slice(0,4)),s).has(date)){
    date=add(date,1);if(date>s.window.to)return outside();bind(date);shifted.push(date);
  }
  const collision=shifted.find(d=>suspended(d,mode,s));
  if(collision&&p.endShiftCollision==='proposedBoundary')return{outcome:'unresolvedBoundaryProposed',reason:'J1-END-SUSPENSION',
    legalOpening:opening,nominalEnd,ordinaryShiftEnd:date,firstSuspendedShiftDate:collision};
  return{outcome:'datedResearchValue',legalOpening:opening,ordinaryStart:add(opening,1),firstCountedDay,nominalEnd,end:date,
    openingShiftDays:epoch(opening)-epoch(item.trigger),skippedDays,endShiftDays:epoch(date)-epoch(nominalEnd),suspension:mode,temporalBindings:[...bindings]};
}
function rawRuleDate(rule,year,s){
  const c=rule.calculation;assert.equal(rule.condition,'always');
  if(c.type==='fixedMonthDay')return`${year}-${String(c.month).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
  if(c.type==='easterOffsetDays')return add(s.easter[year],c.offsetDays);
  assert.equal(c.type,'nthWeekdayOffsetDays');let d=`${year}-${String(c.month).padStart(2,'0')}-01`,n=0;
  for(;;d=add(d,1))if((dow(d)||7)===c.isoWeekday&&++n===c.occurrence)break;return add(d,c.offsetDays);
}
export async function runReferences({fixturePath=fixture}={}){
  const bytes=await readFile(resolve(root,fixturePath)),s=JSON.parse(bytes);
  assert.equal(s.formatVersion,'ap23j1-research-references-1');
  for(const key of['runtimeActive','productTest','legalApproval'])assert.equal(s[key],false,key);
  assert.deepEqual(s.window,{from:'2026-08-29',to:'2027-12-31'});
  assert.equal(s.paths.length,s.expectedPathCount);assert.equal(new Set(s.paths.map(p=>p.id)).size,s.paths.length);
  assert.equal(new Set(s.cases.map(c=>c.id)).size,s.cases.length);
  for(const model of s.sourceModels){const raw=await readFile(resolve(root,model.path));assert.equal(raw.length,model.byteLength);assert.equal(sha256(raw),model.sha256);}
  const results=[],discrepancies=[];
  for(const c of s.cases){
    assert.ok(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].includes(c.expected?.outcome));
    if(c.expected.outcome==='datedResearchValue')assert.ok(valid(c.expected.end));
    else assert.equal(Object.hasOwn(c.expected,'end'),false,'Boundary has definitive result '+c.id);
    const actual=evaluate(c,s);
    for(const[key,value]of Object.entries(c.expected))if(JSON.stringify(actual[key])!==JSON.stringify(value))discrepancies.push({id:c.id,key,expected:value,actual:actual[key]??null});
    if(actual.outcome!=='datedResearchValue')assert.equal(Object.hasOwn(actual,'end'),false);
    results.push({id:c.id,path:c.path,expected:c.expected,actual});
  }
  for(const p of s.paths)assert.ok(results.some(r=>r.path===p.id&&r.actual.outcome==='datedResearchValue'),'No positive reference '+p.id);
  for(const probe of s.calendarProbes){const actual=holidays(probe.calendar,Number(probe.date.slice(0,4)),s).has(probe.date);
    if(actual!==probe.isHoliday)discrepancies.push({...probe,kind:'calendarProbe',actual});}
  const calendarComparisons=[];
  for(const b of s.calendarBaselines){
    const raw=await readFile(resolve(root,b.path));assert.equal(sha256(raw),b.sha256);const rules=JSON.parse(raw).rules;
    for(const year of[2026,2027]){
      const dates=new Set(rules.map(r=>rawRuleDate(r,year,s))),named=holidays(b.calendar,year,s);let checked=0,differences=0;
      assert.deepEqual([...dates].sort(),[...named].sort(),'Named holiday date projection differs '+b.calendar+'/'+year);
      for(let date=year+'-01-01';date<=year+'-12-31';date=add(date,1)){
        const a=weekend(date)||dates.has(date),expected=weekend(date)||named.has(date);
        if(a!==expected){differences++;discrepancies.push({kind:'calendarProjection',calendar:b.calendar,date,expected,actual:a});}checked++;
      }
      calendarComparisons.push({calendar:b.calendar,year,sourcePath:b.path,sourceSha256:b.sha256,rawRules:rules.length,
        namedResearchDates:named.size,namedHolidayDateSetsEqual:true,daysCompared:checked,endEligibilityDifferences:differences});
    }
  }
  const counts=Object.fromEntries(['datedResearchValue','unresolvedBoundaryProposed','qualificationBoundaryProposed','researchWindowBoundary'].map(k=>[k,results.filter(r=>r.actual.outcome===k).length]));
  return{suite:s,report:{workPackage:'AP23J1',asOf:s.asOf,status:discrepancies.length?'discrepancies':'passedResearchComparison',
    fixtureSha256:sha256(bytes),checkerSha256:sha256(await readFile(fileURLToPath(import.meta.url))),runtimeActive:false,
    productTest:false,exportTest:false,legalApproval:false,paths:s.paths.length,referenceCases:s.cases.length,counts,
    calendarProbes:s.calendarProbes.length,calendarComparisons,discrepancies,results}};
}
export function renderTable(s,r){
  const fmt=d=>/^\d{4}-\d{2}-\d{2}$/.test(d??'')?`${d.slice(8)}.${d.slice(5,7)}.${d.slice(0,4)}`:d;
  const esc=v=>String(v??'').replaceAll('|','\\|').replaceAll('\n',' ');
  const manual=s.cases.filter(c=>c.provenance==='canton-analyst-static-reference');
  const baselines=s.cases.filter(c=>c.provenance==='root-static-october-baseline');
  const row=c=>`| ${c.id} | ${c.path} | ${fmt(c.trigger)} | ${c.days??'offen'} | ${esc(c.expected.outcome==='datedResearchValue'?fmt(c.expected.end):c.analystExpected?.reason??c.expected.reason??c.expected.outcome)} | ${esc(c.note)} |`;
  return['# AP23J1 Forschungsreferenzen Freiburg Genf und Jura','','Stand 27. Oktober 2026. Fachlicher Vorschlag, keine Produktprüfung oder operative Freigabe.','',
    `${r.paths} Forschungsgruppen, **${manual.length} händisch vorgegebene Fachreferenzen** und ${r.referenceCases-manual.length} ergänzende synthetische Prüfproben. Insgesamt ${r.referenceCases} Fälle mit ${r.counts.datedResearchValue} Datumssollwerten, ${r.counts.unresolvedBoundaryProposed} begrenzten Auslegungsfällen, ${r.counts.qualificationBoundaryProposed} Qualifikationsgrenzen und ${r.counts.researchWindowBoundary} Fenstergrenzen. ${r.discrepancies.length} Abweichungen. Automatisch variierte Qualifikationen sind keine zusätzlichen unabhängig recherchierten Rechtsfälle.`,
    '', '## Händisch vorgegebene Fachreferenzen','', '| Fall | Gruppe | Auslöser | Tage | Erwartung | Zweck |','| --- | --- | --- | ---: | --- | --- |',
    ...manual.map(row),
    '', '## Zusätzliche feste Oktober-Gegenproben','',
    'Jeder Weg erhält eine einfache positive Gegenprobe ab 02.10.2026. Die Sollwerte sind vorgegebene Kalendertage, nicht aus einem der beiden Prüfrechner kopiert. Die positiven Falltatsachen sind ausdrücklich synthetisch qualifiziert.',
    '', '| Fall | Gruppe | Auslöser | Tage | Erwartung | Zweck |','| --- | --- | --- | ---: | --- | --- |',...baselines.map(row),
    '', '## Systematische Negativproben','',
    'Die übrigen Proben entfernen einzeln aktuelle Qualifikationen oder ändern eine gesetzlich feste Dauer. Sie stehen vollständig in der [strukturierten Tabelle](ap23j1/referenzfaelle.json). Fehlende Qualifikationen dürfen nicht aus Benutzerstandards ergänzt werden. Die ursprünglichen Analystenangaben und Grenzbegründungen bleiben zusätzlich gespeichert. Der technische Vergleich prüft dort Ergebnisart und feste Datumserwartungen, nicht die Gleichheit einer späteren Produktfehlermeldung.',
    '', '## Aussagekraft','',
    'Die Datumssollwerte werden vor der maschinellen Nachrechnung festgehalten. Zwei getrennte Forschungsalgorithmen prüfen Tagesfortschaltung und vollständige Datumsenumeration ohne Produktimporte. Die Übereinstimmung bestätigt die Rechenumsetzung des beschriebenen Vorschlags, nicht automatisch seine juristische Richtigkeit oder einen freigegebenen Produktweg.',
    '', 'Die beiden jurassischen Rechtsverwendungsbindungen bleiben in den Fachbefunden getrennt. Nur ihre ausdrücklich identischen Datumsregeln werden für die Forschungsrechnung dedupliziert. Es gibt weder einen ersten Kalendertreffer als Ersatz noch eine Vereinigung konkurrierender Regeln. Beide Prüfer vergleichen die vollständigen benannten Feiertagsdatensets und an 2’190 Tagen die Eignung als Endtag. Identische Feiertagsbezeichnungen werden damit nicht behauptet.',
    '', 'Aktuelle Falltatsachen sind ausdrücklich synthetisch gesetzt. Fehlende Tatsachen sind negative Referenzen, keine automatischen persönlichen Standards. Das Fenster umfasst Empfang beziehungsweise Auslöser, rechtliche Eröffnung, sämtliche Zähl-, Stillstands- und Verschiebungstage. Nicht vollständig gedeckte Ketten erhalten keinen definitiven Datumssollwert.',
    '', 'Genf trennt den qualifizierten rechtlichen Eröffnungstag vom ausdrücklich bestätigten physischen Empfang einer gewöhnlichen Postsendung. Nur im zweiten Fall wird Art. 17 Abs. 6 vorgelagert angewandt. Ferien und Feiertage sind eigenständige Regeln. Ein Wochenende im Fristinnern stoppt die Zählung nicht.',
    '', 'Eine reine Endverschiebung in einen neu beginnenden, anwendbaren Stillstand wird nicht ohne eigenständigen Rechtsnachweis positiv aufgelöst. Die bezeichneten Konfliktfälle bleiben fachliche Abnahmevorschläge ohne definitives Ende oder Kalenderexport.',
    '', `Fixture SHA-256: \`${r.fixtureSha256}\`. [Node-Nachweis](../../outputs/ap23j1-2026-10-27/reference-verification.json), [unabhängiger Python-Nachweis](../../outputs/ap23j1-2026-10-27/reference-independent-verification.json).`,
    '', 'Grundlagen: [Fachvorlage](verwaltungsverfahren-ap23j1.md) und [Quellenprüfung](quellenpruefung-ap23j1.md). Die bestehenden Produktkalender werden ausschliesslich gelesen und nicht geändert.', ''].join('\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(x=>x==='--write'));const{suite,report}=await runReferences();
  if(process.argv.includes('--write')){await mkdir(resolve(root,output),{recursive:true});
    await writeFile(resolve(root,output+'/reference-verification.json'),JSON.stringify(report,null,2)+'\n');
    await writeFile(resolve(root,'docs/fachrecht/referenzfaelle-ap23j1.md'),renderTable(suite,report));}
  console.log(JSON.stringify({...report,results:undefined},null,2));if(report.discrepancies.length)process.exitCode=1;
}
