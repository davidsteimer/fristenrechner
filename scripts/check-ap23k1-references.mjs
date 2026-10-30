// SPDX-License-Identifier: AGPL-3.0-only
// Research arithmetic only. No application calculator or calendar generator imports.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const fixture='docs/fachrecht/ap23k1/referenzfaelle.json';
const output='outputs/ap23k1-2026-10-27';
const day=86400000;
const ordinal=value=>Date.parse(value+'T00:00:00Z')/day;
const iso=value=>new Date(value*day).toISOString().slice(0,10);
export const add=(value,count)=>iso(ordinal(value)+count);
const weekday=value=>new Date(value+'T00:00:00Z').getUTCDay();
const weekend=value=>[0,6].includes(weekday(value));
const hash=value=>createHash('sha256').update(value).digest('hex');
const valid=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(ordinal(value))&&iso(ordinal(value))===value;
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason});
const outside=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'});

export function holidays(name,year,suite){
  const calendar=suite.calendars[name];assert.ok(calendar,'Unknown named research calendar');
  const result=new Set(calendar.fixed.map(md=>year+'-'+md));
  if(calendar.easterOffsets.length)assert.ok(suite.easter[year],'Missing Easter date');
  for(const offset of calendar.easterOffsets)result.add(add(suite.easter[year],offset));
  for(const rule of calendar.nthWeekdays??[]){
    let date=year+'-'+String(rule.month).padStart(2,'0')+'-01',count=0;
    while((weekday(date)||7)!==rule.isoWeekday||++count!==rule.occurrence)date=add(date,1);
    result.add(add(date,rule.offsetDays??0));
  }
  for(const date of calendar.additionalDates??[])if(date.startsWith(year+'-'))result.add(date);
  return result;
}

function temporalBindings(path,start,end,suite){
  const result=[];
  for(let date=start;date<=end;date=add(date,1)){
    const choices=suite.temporalBindings[path.temporalBindingKey??path.canton].filter(item=>date>=item.from&&date<=item.to);
    assert.equal(choices.length,1,'Missing or ambiguous temporal binding '+date);
    if(!result.includes(choices[0].id))result.push(choices[0].id);
  }
  return result;
}

export function evaluate(item,suite){
  const path=suite.paths.find(row=>row.id===item.path);
  if(!path)return boundary('unknownResearchPath');
  if(!valid(item.trigger))return boundary('invalidResearchDate');
  const allowed=new Set([...(suite.allowedFactKeys??[]),...Object.keys(suite.sharedSyntheticFacts),...suite.paths.flatMap(row=>Object.keys(row.syntheticFacts))]);
  if(Object.keys(item.facts??{}).some(key=>!allowed.has(key)))return boundary('unknownResearchFact');
  const facts={...suite.sharedSyntheticFacts,...path.syntheticFacts,...item.facts};
  for(const requirement of[...suite.sharedRequirements,...path.requirements]){
    const matches=Object.hasOwn(requirement,'oneOf')?requirement.oneOf.includes(facts[requirement.key]):facts[requirement.key]===requirement.value;
    if(!matches)return boundary(requirement.reason??requirement.key+'NotQualified');
  }
  assert.equal(path.suspension,'none','K1 does not posit a general recess');
  assert.equal(path.opening,'qualifiedLegalOpening','Do not reconstruct a service fiction');
  if(!Number.isSafeInteger(item.days)||item.days<1)return boundary('dayDurationNotSpecified');
  if(path.days!==null&&item.days!==path.days)return boundary('statutoryDurationMismatch');
  if(item.days<(path.minimumDays??1))return boundary('durationOutsideQualifiedRange');
  if(item.trigger<suite.window.from||item.trigger>suite.window.to)return outside();
  const binding=path.calendarBinding;
  assert.ok(['fixed','fact'].includes(binding.type),'Unknown calendar binding policy');
  let calendar;
  if(binding.type==='fixed')calendar=binding.calendar;
  else{
    calendar=facts[binding.fact];
    if(!binding.allowed.includes(calendar))return boundary('holidayAnchorNotQualified');
  }
  assert.ok(suite.calendars[calendar],'Missing bound calendar');
  if(item.days>ordinal(suite.window.to)-ordinal(item.trigger))return outside();
  const nominal=add(item.trigger,item.days);
  if(nominal>suite.window.to)return outside();
  const closure=path.officeClosure?suite.officeClosures[path.officeClosure]:null;
  assert.ok(!path.officeClosure||closure,'Missing office-closure binding');
  const fixedClosures=new Set(closure?.dates??[]);
  const uncertain=closure?.uncertainty??null;
  const mode=uncertain?facts[uncertain.fact]:null;
  const closedValue=uncertain?.closedValue??'confirmedClosed';
  const unknownValue=uncertain?.unknownValue??'unknown';
  const openValues=uncertain?.openValues??['notApplicable','confirmedOpen'];
  if(uncertain&&![...openValues,closedValue,unknownValue].includes(mode))return boundary('officeClosureNotQualified');

  function end(includeUncertain){
    let date=nominal;const shifted=[];
    while(weekend(date)||holidays(calendar,Number(date.slice(0,4)),suite).has(date)||fixedClosures.has(date)||includeUncertain&&uncertain.dates.includes(date)){
      shifted.push(date);date=add(date,1);if(date>suite.window.to)return{outside:true};
    }
    return{end:date,shifted};
  }
  const without=end(false),withOptional=uncertain?end(true):without;
  if(uncertain&&mode===unknownValue&&without.end!==withOptional.end){
    if(without.outside||withOptional.outside)return outside();
    temporalBindings(path,item.trigger,withOptional.end,suite);
    return{outcome:'unresolvedBoundaryProposed',reason:uncertain.reason,legalOpening:item.trigger,nominalEnd:nominal,
      endWithoutOptionalClosure:without.end,endWithOptionalClosure:withOptional.end};
  }
  const selected=uncertain&&mode===closedValue?withOptional:without;
  if(selected.outside)return outside();
  const bindings=temporalBindings(path,item.trigger,selected.end,suite);
  return{outcome:'datedResearchValue',legalOpening:item.trigger,ordinaryStart:add(item.trigger,1),nominalEnd:nominal,end:selected.end,
    endShiftDays:ordinal(selected.end)-ordinal(nominal),suspension:'none',calendar,
    officeClosureDays:selected.shifted.filter(date=>fixedClosures.has(date)||uncertain&&mode===closedValue&&uncertain.dates.includes(date)),
    temporalBindings:bindings};
}

function rawDate(rule,year,suite){
  assert.equal(rule.condition,'always');const calculation=rule.calculation;
  if(calculation.type==='fixedMonthDay')return `${year}-${String(calculation.month).padStart(2,'0')}-${String(calculation.day).padStart(2,'0')}`;
  if(calculation.type==='easterOffsetDays')return add(suite.easter[year],calculation.offsetDays);
  assert.ok(['nthWeekdayOfMonth','nthWeekdayOffsetDays'].includes(calculation.type),'Unknown read-only baseline rule');
  let date=year+'-'+String(calculation.month).padStart(2,'0')+'-01',count=0;
  while((weekday(date)||7)!==calculation.isoWeekday||++count!==calculation.occurrence)date=add(date,1);
  return add(date,calculation.offsetDays??0);
}

export async function runReferences({fixturePath=fixture}={}){
  const raw=await readFile(resolve(root,fixturePath)),suite=JSON.parse(raw);
  assert.equal(suite.formatVersion,'ap23k1-research-references-1');
  for(const flag of['runtimeActive','productTest','legalApproval','exportTest'])assert.equal(suite[flag],false,flag);
  assert.deepEqual(suite.window,{from:'2026-08-29',to:'2027-12-31'});
  assert.equal(suite.factPolicy,'explicitCaseFactsOnly');
  assert.deepEqual(suite.sharedSyntheticFacts,{});
  for(const path of suite.paths)assert.deepEqual(path.syntheticFacts,{},'No inferred case facts from a path default');
  assert.equal(new Set(suite.paths.map(row=>row.id)).size,suite.paths.length);
  assert.equal(new Set(suite.cases.map(row=>row.id)).size,suite.cases.length);
  let registeredSourceBytes=0,registeredSources=0;
  const analystCaseIds=new Set(),analystPathIds=new Set();
  for(const source of suite.sourceModels){
    const bytes=await readFile(resolve(root,source.path));assert.equal(hash(bytes),source.sha256,'Source-model bytes '+source.path);
    if(source.sourceRegister){
      const register=JSON.parse(bytes);
      for(const entry of register.sources){
        assert.ok(typeof entry.file==='string'&&!entry.file.includes('..')&&!entry.file.startsWith('/'),'Unsafe raw-source path');
        const rawSource=await readFile(resolve(root,register.sourceBase,entry.file));
        assert.equal(hash(rawSource),entry.sha256,'Registered raw source '+entry.id);assert.equal(rawSource.length,entry.bytes,'Raw source size');
        registeredSources++;registeredSourceBytes+=rawSource.length;
      }
    }
    if(source.cantonFindings){
      const model=JSON.parse(bytes),cases=model.localReferenceCases??model.researchCases,paths=model.pathProposals??model.groups;
      for(const path of paths){assert.ok(!analystPathIds.has(path.id),'Duplicate analyst path');analystPathIds.add(path.id);}
      for(const original of cases){
        assert.ok(!analystCaseIds.has(original.id),'Duplicate analyst case');analystCaseIds.add(original.id);
        const candidate=suite.cases.find(row=>row.id===original.id);assert.ok(candidate,'Omitted analyst reference '+original.id);
        assert.equal(candidate.analystSource,source.path);assert.equal(candidate.provenance,'canton-analyst-static-reference');
        for(const key of['path','trigger','days','facts'])assert.deepEqual(candidate[key],original[key],'Changed analyst reference '+original.id+'/'+key);
        assert.deepEqual(candidate.analystExpected,original.expected,'Changed static expectation '+original.id);
      }
    }
  }
  assert.equal(analystCaseIds.size,suite.cases.length,'Added non-analyst case');
  assert.deepEqual([...analystPathIds].sort(),suite.paths.map(row=>row.id).sort(),'Research path coverage differs from analyst findings');
  const discrepancies=[],results=[];
  for(const item of suite.cases){
    assert.ok(['datedResearchValue','qualificationBoundaryProposed','unresolvedBoundaryProposed','researchWindowBoundary'].includes(item.expected?.outcome));
    assert.equal(Object.hasOwn(item.expected,'end'),item.expected.outcome==='datedResearchValue','Boundary must not carry a definitive end');
    const actual=evaluate(item,suite);
    for(const[key,expected]of Object.entries(item.expected))if(JSON.stringify(actual[key])!==JSON.stringify(expected))discrepancies.push({id:item.id,key,expected,actual:actual[key]??null});
    if(actual.outcome!=='datedResearchValue')assert.equal(Object.hasOwn(actual,'end'),false);
    results.push({id:item.id,path:item.path,expected:item.expected,actual});
  }
  for(const path of suite.paths)assert.ok(results.some(row=>row.path===path.id&&row.actual.outcome==='datedResearchValue'),'No positive reference for '+path.id);
  const calendarComparisons=[];
  for(const baseline of suite.calendarBaselines){
    const bytes=await readFile(resolve(root,baseline.path));assert.equal(hash(bytes),baseline.sha256,'Calendar baseline bytes');
    const rules=JSON.parse(bytes).rules;
    for(const year of[2026,2027]){
      const projected=new Set(rules.map(rule=>rawDate(rule,year,suite))),named=holidays(baseline.calendar,year,suite);
      const rawWeekdays=[...projected].filter(date=>!weekend(date)).sort(),namedWeekdays=[...named].filter(date=>!weekend(date)).sort();
      assert.deepEqual(rawWeekdays,namedWeekdays,'Non-weekend holiday projection differs');
      let daysCompared=0;
      for(let date=year+'-01-01';date<=year+'-12-31';date=add(date,1)){
        if((weekend(date)||projected.has(date))!==(weekend(date)||named.has(date)))discrepancies.push({kind:'calendarEndEligibility',calendar:baseline.calendar,date});
        daysCompared++;
      }
      calendarComparisons.push({calendar:baseline.calendar,year,sourcePath:baseline.path,sourceSha256:baseline.sha256,
        rawRules:rules.length,weekdayDateSetsEqual:true,daysCompared,officeClosuresExcluded:true});
    }
  }
  for(const probe of suite.calendarProbes){
    const actual=holidays(probe.calendar,Number(probe.date.slice(0,4)),suite).has(probe.date);
    if(actual!==probe.isHoliday)discrepancies.push({...probe,kind:'calendarProbe',actual});
  }
  return{suite,report:{workPackage:'AP23K1',asOf:suite.asOf,status:discrepancies.length?'discrepancies':'passedResearchComparison',
    fixtureSha256:hash(raw),checkerSha256:hash(await readFile(fileURLToPath(import.meta.url))),runtimeActive:false,productTest:false,exportTest:false,legalApproval:false,
    paths:suite.paths.length,referenceCases:suite.cases.length,handSpecifiedReferences:suite.cases.filter(row=>row.provenance==='canton-analyst-static-reference').length,
    counts:Object.fromEntries(['datedResearchValue','qualificationBoundaryProposed','unresolvedBoundaryProposed','researchWindowBoundary'].map(kind=>[kind,results.filter(row=>row.actual.outcome===kind).length])),
    registeredSources,registeredSourceBytes,calendarComparisons,calendarProbes:suite.calendarProbes.length,discrepancies,results}};
}

export function renderTable(suite,report){
  const fmt=date=>valid(date)?`${date.slice(8)}.${date.slice(5,7)}.${date.slice(0,4)}`:date;
  const esc=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n',' ');
  return ['# AP23K1 Forschungsreferenzen Basel-Stadt und Basel-Landschaft','','Stand 27. Oktober 2026. Fachlicher Vorschlag, keine Produktprüfung oder operative Freigabe.','',
    `${report.paths} vorgeschlagene Forschungsgruppen und **${report.handSpecifiedReferences} händisch vorgegebene Fachreferenzen**. Node-Tagesfortschaltung und eine unabhängige Python-Enumeration prüfen dieselben vorab festgehaltenen Erwartungen. ${report.discrepancies.length} Abweichungen. Die Unit- und Mutationsprüfungen werden nicht als weitere recherchierte Fachfälle gezählt.`,
    '', '| Fall | Gruppe | Qualifizierter Auslöser | Tage | Erwartung | Zweck |','| --- | --- | --- | ---: | --- | --- |',
    ...suite.cases.map(row=>`| ${row.id} | ${row.path} | ${fmt(row.trigger)} | ${row.days??'offen'} | ${esc(row.expected.outcome==='datedResearchValue'?fmt(row.expected.end):row.expected.reason??row.expected.outcome)} | ${esc(row.note)} |`),
    '', '## Aussagegrenzen','',
    'Die vorgegebenen Datumssollwerte stammen aus der Fachanalyse und werden nicht aus den beiden Forschungsalgorithmen erzeugt. Rechnerische Übereinstimmung ersetzt weder die juristische Beurteilung noch die menschliche Abnahme. Alle Fallqualifikationen sind ausdrücklich synthetische Tatsachen, keine automatisch ergänzten Benutzerstandards.',
    '', 'Der Eröffnungstag zählt nicht mit. Wochenenden, Feiertage und vollständige Büroschliesstage am Fristende werden getrennt von der Zählung im Fristinnern behandelt. Ein allgemeiner Friststillstand wird nicht unterstellt. Ein nachgewiesener Halbtag ist nicht automatisch ein ganzer Schliesstag.',
    '', 'Eine allfällige optionale regionale Ganzschliessung wird nur bei Ergebnisrelevanz zur Grenze. Die unbekannte Variante liefert dann kein definitives Datum und keinen Export. Eine solche Ungewissheit mitten im Lauf sperrt nicht pauschal den ganzen Fall. Die zwei möglichen Endtage sind Forschungsdiagnostik, kein Wahlangebot an Benutzer.',
    '', 'Die zehn- und dreissigtägigen Basler Rechtsmittelschritte sind eigenständige Handlungen ab derselben qualifizierten Eröffnung. Das erste errechnete Ende wird nicht zum Auslöser der Begründungsfrist umgedeutet. Eine gewährte neue Tagesfrist ist von einem bloss gestellten Erstreckungsgesuch zu unterscheiden.',
    '', 'Die Kalendervergleiche lesen die gebundenen Bestandsdateien unverändert. Zusätzliche, schon durch das Wochenende ausgeschlossene Sonntagsfeiertage werden nicht mit unterschiedlichen Verfahrenswirkungen verwechselt. Ganztägige BL-Büroschlüsse sind gesonderte, auf die geprüften Jahre und Zielstellen begrenzte Daten, keine Änderung des ewigen Feiertagskalenders.',
    '', `Fixture SHA-256: \`${report.fixtureSha256}\`. [Node-Nachweis](../../outputs/ap23k1-2026-10-27/reference-verification.json), [unabhängiger Python-Nachweis](../../outputs/ap23k1-2026-10-27/reference-independent-verification.json).`,
    '', 'Grundlagen: [Fachvorlage](verwaltungsverfahren-ap23k1.md) und [Quellenprüfung](quellenpruefung-ap23k1.md). Das vollständige Fallfenster umfasst Eröffnung, Zähltage und jede Endverschiebung. Ausserhalb dieses Fensters entsteht kein definitives Fristresultat.', ''].join('\n');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(value=>value==='--write'));
  const{suite,report}=await runReferences();
  if(process.argv.includes('--write')){
    await mkdir(resolve(root,output),{recursive:true});
    await writeFile(resolve(root,output+'/reference-verification.json'),JSON.stringify(report,null,2)+'\n');
    await writeFile(resolve(root,'docs/fachrecht/referenzfaelle-ap23k1.md'),renderTable(suite,report));
  }
  console.log(JSON.stringify({...report,results:undefined},null,2));
  if(report.discrepancies.length)process.exitCode=1;
}
