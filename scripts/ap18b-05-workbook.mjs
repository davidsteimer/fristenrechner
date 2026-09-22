// SPDX-License-Identifier: AGPL-3.0-only
// Narrow follow-up from the delivered V0.11, never from the earlier label seed.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {rawDateFormula05} from './ap18b-03-workbook.mjs';
import {createBatch05Model,evaluateRule06,V11_WORKBOOK,V11_SHA256,CONDITION_LABELS_06} from './ap18b-05-conditions.mjs';

export const OUTPUT_05='outputs/ap18b-05-bedingte-feiertage-2026-09-22/2026-09-22_Feiertagsmatrix_Schweiz_AP18B-05_V0.12.xlsx';
const serial=v=>Math.round((new Date(`${v}T00:00:00Z`)-new Date('1899-12-30T00:00:00Z'))/86400000);
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
const display=result=>result.status==='occurs'?serial(result.date):result.status==='notApplicable'?'Entfällt':'Ausserhalb Geltung';
export function validDateFormula06(r) {
  const c=`AB${r}`,w=`W${r}`;
  const fixed=`I${r}="fixedMonthDay"`;
  const compatible=`OR(${c}="Immer",AND(${c}="Nicht Dienstag/Samstag",${fixed},J${r}=12,K${r}=26),AND(${c}="Nur Montag",${fixed},OR(AND(J${r}=1,K${r}=2),AND(J${r}=12,K${r}=26))),AND(${c}="Gründonnerstag + 7 Tage",I${r}="nthWeekdayOfMonth",J${r}=4,M${r}=4,N${r}=1))`;
  const validDate=k=>`ISNUMBER(${k}${r}),${k}${r}=INT(${k}${r}),${k}${r}>=${serial('1583-01-01')},${k}${r}<=${serial('9999-12-31')}`;
  const absent=`OR(AND(${c}="Nicht Dienstag/Samstag",OR(WEEKDAY(${w},2)=2,WEEKDAY(${w},2)=6)),AND(${c}="Nur Montag",WEEKDAY(${w},2)<>1))`;
  const effective=`IF(AND(${c}="Gründonnerstag + 7 Tage",${w}=$AD$23-3),${w}+7,${w})`;
  return `=IF(AND(${validDate('O')},OR(P${r}="",AND(${validDate('P')},P${r}>=O${r})),OR(AA${r}="Ganztägig",AA${r}="Ab 12.00 Uhr"),ISNUMBER(${w}),${compatible}),IF(${absent},"Entfällt",IF(AND(${effective}>=O${r},OR(P${r}="",${effective}<=P${r})),${effective},"Ausserhalb Geltung")),NA())`;
}

const notes={
  ar:'Stephanstag nach Art. 7 Abs. 1 Arbeitsverordnung: 26. Dezember ausser Dienstag oder Samstag. Fachlich bestätigt am 22.09.2026, als bedingte Regel ergänzt. Keine pauschale Freigabe einer Fristwirkung.',
  ai:'Stephanstag nach Art. 2 Abs. 1 Bst. b RTG: 26. Dezember ausser Dienstag oder Samstag. David Steimer entscheidet am 22.09.2026 zugunsten der Norm. Die abweichende amtliche Liste für 26.12.2026 bleibt als Quellenabweichung dokumentiert, nicht als amtlich korrigiert.',
  gl:'Näfelser Fahrt: erster Donnerstag im April, bei Gründonnerstag sieben Tage später. Amtliche Regierungsratsmitteilung 06.01.2026 und Fachbestätigung 22.09.2026. 2026: 09.04.2026. Keine jährlichen Scheinfixdaten.',
  ne:'Allgemeine Ersatzfeiertage: 2. Januar bzw. 26. Dezember nur am Montag nach Sonntags-Neujahr bzw. Sonntags-Weihnachten. Fachlich bestätigt am 22.09.2026. Feste LPA-Verwaltungsergänzungen bleiben davon unabhängig.',
  reserve:'Vorbehalt: gesondert festgelegte zusätzliche regionale Feiertage nach LDJF Art. 3 Abs. 2 sowie zusätzliche Verwaltungsschliesstage nach RDF Art. 11 Abs. 2 / LPA Art. 33 Abs. 3 werden nicht automatisch erzeugt. Konkrete Fristenwirkung separat prüfen. Le Landeron und die acht festen LPA-Ergänzungen bleiben erfasst.'
};

export async function buildBatch05Workbook({root,SpreadsheetFile,FileBlob}) {
  const qa=path.join(root,'.work/ap18b-05'),source=path.join(root,V11_WORKBOOK),file=path.join(root,OUTPUT_05);
  await fs.mkdir(qa,{recursive:true});
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),V11_SHA256);
  const verify=process.argv.includes('--verify');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(verify?file:source));
  const m=await createBatch05Model(root),sh=n=>wb.worksheets.getItem(n);
  const oldEntries=sh('Feiertagskalender').getRange('K7:K489').values.map(([ruleId])=>{
    const rule=m.rules.find(r=>r.id===ruleId);assert.ok(rule,`Unknown V0.11 calendar rule ${ruleId}`);
    return {scopeId:rule.scope,ruleId};
  });
  const additions=m.batch05Additions.rules;
  const entries=[...oldEntries,...additions.map(r=>({scopeId:r.scope,ruleId:r.id}))];
  assert.equal(m.rules.length,479);assert.equal(entries.length,488);
  const end=485,calendarEnd=494,patches=[],specs=[];
  const set=(name,range,values)=>{sh(name).getRange(range).values=values;patches.push({name,range});};
  const formula=(name,range,values)=>{sh(name).getRange(range).formulas=values;patches.push({name,range});};
  const rowId=(name,id,column='A')=>{
    const values=sh(name).getRange(`${column}7:${column}${({Rechtsquellen:90,Geltungsbereiche:55,Verfahrensbezug:98,Quellenprüfung:91,Gemeinwesen:33})[name]}`).values;
    const i=values.findIndex(v=>v[0]===id);assert.notEqual(i,-1,`${name}/${id}`);return i+7;
  };
  const append=(name,oldEnd,last,rows,height=66)=>{
    const newEnd=oldEnd+rows.length;
    specs.push({name,oldEnd,end:newEnd,last,tableName:sh(name).tables.items[0].name});
    for(let r=oldEnd+1;r<=newEnd;r++){
      const template=oldEnd-(r%2===oldEnd%2?0:1);
      sh(name).getRange(`A${r}:${last}${r}`).copyFrom(sh(name).getRange(`A${template}:${last}${template}`),'all');
      sh(name).getRange(`A${r}:${last}${r}`).format.rowHeight=height;
    }
    set(name,`A${oldEnd+1}:${last}${newEnd}`,rows);
  };
  const scopeNames={
    'AR-ARG-ALL':'Appenzell Ausserrhoden, Arbeitsfeiertage mit bedingtem Stephanstag',
    'AI-RTG-ALL':'Appenzell Innerrhoden, kantonsweite RTG-Tage mit bedingtem Stephanstag',
    'NE-LDJF-BASE':'Neuenburg, allgemeine Grundliste mit bedingten Ersatzfeiertagen'
  };
  // Compare the preserved V0.11 input cells with the pure calculation seed.
  // Language cells deliberately come from the delivered, completed V0.11.
  const oldRows=sh('Feiertagsregeln').getRange('A7:AA480').values;
  const normal=v=>v instanceof Date?serial(v.toISOString().slice(0,10)):v===''?null:v??null;
  m.rules.slice(0,474).forEach((r,i)=>{
    const expected=[r.id,r.jurisdiction,r.scope,null,null,null,null,r.category,r.calculation.type,r.calculation.month??null,r.calculation.day??null,r.calculation.offsetDays??null,r.calculation.isoWeekday??null,r.calculation.occurrence??null,serial(r.from),r.to?serial(r.to):null,r.priority,r.status,r.approvalBasis,r.action,r.target,r.exportClass,null,null,r.source,r.locator,r.dayPortion==='fullDay'?'Ganztägig':'Ab 12.00 Uhr'];
    expected.forEach((value,j)=>{if(![3,4,5,6,22,23].includes(j))assert.equal(normal(oldRows[i][j]),normal(value),`V0.11 baseline ${r.id}/${col(j)}`);});
  });
  if(!verify){
    console.log('Authoring five rules and one explicit condition column');
    sh('Feiertagsregeln').getRange('AB6').copyFrom(sh('Feiertagsregeln').getRange('AA6'),'all');
    for(let r=7;r<=480;r++)sh('Feiertagsregeln').getRange(`AB${r}`).copyFrom(sh('Feiertagsregeln').getRange(`AA${r}`),'all');
    set('Feiertagsregeln','AB6',[['Kalenderbedingung']]);
    set('Feiertagsregeln','AB7:AB480',m.rules.slice(0,474).map(r=>[CONDITION_LABELS_06[r.condition]]));
    append('Feiertagsregeln',480,'AB',additions.map(r=>[r.id,r.jurisdiction,r.scope,r.de,r.fr,r.it,r.rm,r.category,r.calculation.type,r.calculation.month??null,r.calculation.day??null,r.calculation.offsetDays??null,r.calculation.isoWeekday??null,r.calculation.occurrence??null,serial(r.from),r.to?serial(r.to):null,r.priority,r.status,r.approvalBasis,r.action,r.target,r.exportClass,null,null,r.source,r.locator,'Ganztägig',CONDITION_LABELS_06[r.condition]]));
    formula('Feiertagsregeln','W481:W485',additions.map((_,i)=>[rawDateFormula05(481+i)]));
    formula('Feiertagsregeln',`X7:X${end}`,m.rules.map((_,i)=>[validDateFormula06(i+7)]));
    sh('Feiertagsregeln').getRange(`AB6:AB${end}`).format.columnWidth=38;
    sh('Feiertagsregeln').getRange(`AB7:AB${end}`).dataValidation={allowBlank:false,rule:{type:'list',values:Object.values(CONDITION_LABELS_06)},errorAlert:{style:'stop',title:'Ungültige Kalenderbedingung',message:'Bitte eine der vier ausdrücklich unterstützten Bedingungen wählen.'}};
    append('Feiertagskalender',489,'O',additions.map(r=>[null,null,r.jurisdiction,scopeNames[r.scope]??m.scopes.find(s=>s[0]===r.scope)[2],null,null,null,null,null,'open',r.id,null,null,'Fachregel bestätigt 22.09.2026. Bedingter Kandidat, keine Produktaktivierung.',null]));
    for(let i=0;i<entries.length;i++){
      const e=entries[i],row=i+7,lookup=c=>`INDEX('Feiertagsregeln'!$${c}$7:$${c}$${end},MATCH($K${row},'Feiertagsregeln'!$A$7:$A$${end},0))`;
      for(const[dest,src]of [['A','X'],['E','D'],['F','E'],['I','H'],['L','Y'],['M','Z'],['O','AA']])formula('Feiertagskalender',`${dest}${row}`,[[`=${lookup(src)}`]]);
      for(const[dest,src]of [['G','F'],['H','G']])formula('Feiertagskalender',`${dest}${row}`,[[`=IF(${lookup(src)}="","Noch zu erfassen",${lookup(src)})`]]);
      if(row>489)formula('Feiertagskalender',`B${row}`,[[`=IF(ISNUMBER(A${row}),CHOOSE(WEEKDAY(A${row},2),"Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag")&IF(O${row}="Ab 12.00 Uhr",", ab 12.00 Uhr",""),"n.a.")`]]);
      if(scopeNames[e.scopeId])set('Feiertagskalender',`D${row}`,[[scopeNames[e.scopeId]]]);
    }
    for(const[id,label]of Object.entries(scopeNames))set('Geltungsbereiche',`C${rowId('Geltungsbereiche',id)}`,[[label]]);
    const neScope=rowId('Geltungsbereiche','NE-LDJF-BASE');
    set('Geltungsbereiche',`D${neScope}:F${neScope}`,[['Neuchâtel, liste générale avec jours de remplacement conditionnels','Neuchâtel, elenco generale con giorni sostitutivi condizionati','Neuchâtel, glista generala cun dis cumpensatorics cundiziunads']]);
    for(const[id,key]of [['AR-ARG-ALL','ar'],['AI-RTG-ALL','ai'],['GL-RTG-ALL','gl'],['NE-LDJF-BASE','ne'],['NE-LPA-ADDITIONAL','reserve']])set('Geltungsbereiche',`H${rowId('Geltungsbereiche',id)}`,[[notes[key]]]);
    const sourceNotes=[['SRC-AR-ARGV-82211-V1058','ar'],['SRC-AI-RTG-822200-V1327','ai'],['SRC-AI-RUHETAGE-LISTE-2026','ai'],['SRC-AI-STK-FEIERTAGE-20150929','ai'],['SRC-GL-RTG-IXB211-20190701','gl'],['SRC-GL-FAHRT-RR-20260106','gl'],['SRC-NE-LDJF-94102-20100101','ne'],['SRC-NE-RDF-152512-20230101','reserve']];
    for(const[id,key]of sourceNotes){
      const row=rowId('Rechtsquellen',id);set('Rechtsquellen',`H${row}`,[[notes[key]+' Sprachergänzungen bleiben provisorische Produktbezeichnungen.']]);
      set('Rechtsquellen',`G${row}`,[[serial('2026-09-22')]]);
    }
    const mapNotes=[['MAP-AP18B04-AR-STEPHAN-CONDITION','ar'],['MAP-AP18B04-AI-STEPHAN-CONDITION','ai'],['MAP-GL-FAHRT-GAP','gl'],['MAP-NE-PENDING-SUNDAY-SUBSTITUTION','ne'],['MAP-NE-PENDING-COMPENSATION','reserve']];
    for(const[id,key]of mapNotes){
      const row=rowId('Verfahrensbezug',id);set('Verfahrensbezug',`D${row}:E${row}`,[[key==='reserve'?'Dokumentierter Erfassungs- und Anwendungsvorbehalt':'Datumsregel fachlich bestätigt und modelliert',notes[key]]]);
    }
    for(const[id,key]of [['MAP-AR-ARG-ALL','ar'],['MAP-AI-RTG-ALL','ai'],['MAP-GL-RTG-ALL-REST','gl'],['MAP-GL-RTG-ALL-LABOUR','gl']])set('Verfahrensbezug',`E${rowId('Verfahrensbezug',id)}`,[[notes[key]+' Normkategorie und konkrete verfahrensrechtliche Anknüpfung gesondert prüfen.']]);
    for(const code of ['CH-AR','CH-AI','CH-GL','CH-NE'])set('Gemeinwesen',`G${rowId('Gemeinwesen',code)}`,[[code==='CH-NE'?'Datumsregeln ergänzt, zusätzliche Einzelfestlegungen vorbehalten':'Bedingte Datumsregel fachlich bestätigt, Produktzuordnung separat']]);
    const reviewSpecs=[['AR','SRC-AR-ARGV-82211-V1058','ar'],['AI','SRC-AI-RTG-822200-V1327','ai'],['GL','SRC-GL-FAHRT-RR-20260106','gl'],['NE-SUBSTITUTE','SRC-NE-LDJF-94102-20100101','ne'],['NE-RESERVE','SRC-NE-RDF-152512-20230101','reserve']];
    append('Quellenprüfung',91,'K',reviewSpecs.map(([id,sourceId,key])=>[`AP18B05-${id}-20260922`,sourceId,'expertClarification',serial('2026-09-22'),'unchanged','V0.11 / Fachvorgabe 22.09.2026','Normgrundlage unverändert. '+notes[key], 'candidate','David Steimer','Codex',key==='reserve'?'Vorbehalt in Release und etwaigen NE-Verfahren sichtbar erhalten.':'Technischen Kandidaten 0.6.0 prüfen. Keine automatische Produktfreigabe.']),118);
    set('Quellenprüfung','A4',[['Frühere Prüfungen bleiben historisch. Nachträge AP18B05 am Tabellenende dokumentieren die Bereinigung vom 22.09.2026.']]);
    for(const[address,text]of Object.entries({
      A6:'AP18B-05 · V0.12 · Bedingte Feiertagsregeln AR, AI, GL und NE',
      A8:'Vier Datumsfragen bereinigt. NE: zusätzliche Einzelfestlegungen bleiben ausdrücklich vorbehalten.',
      A9:'V0.11 unverändert erhalten. SO-Halbtag ohne Fristwirkung. Bestehende Sprachergänzungen bewahrt.',
      A19:'«Entfällt» bedeutet: Die Jahresbedingung ist nicht erfüllt. Es wird kein Ersatzdatum erfunden.',
      A30:'Fachvorgaben vom 22.09.2026 umgesetzt. Historische Statuswerte sind keine Produktfreigabe.',
      A31:'Kalenderbedingung in Spalte AB. Fünf zusätzliche Regeln, 479 Regeln insgesamt.',
      A36:'Arbeitsmappenvertrag 0.6.0 als technischer Kandidat. Kein Runtime-Export und kein Deployment.',
      D24:'Stand: 22. September 2026'
    }))set('Übersicht',address,[[text]]);
    formula('Übersicht','B26',[[`=COUNTIFS('Feiertagsregeln'!$R$7:$R$${end},"open")`]]);
    set('Feiertagskalender','A4',[['Bedingte Tage: «Entfällt» bei nicht erfüllter Jahresbedingung. Zusätzliche NE-Einzelfestlegungen vorbehalten. Keine neue Fristenfreigabe.']]);
  }
  const savedYear=sh('Übersicht').getRange('B4').values[0][0];
  const ruleValues=sh('Feiertagsregeln').getRange('A7:AB485').values;
  assert.equal(ruleValues.length,479);
  ruleValues.forEach((r,i)=>{assert.equal(r[0],m.rules[i].id);assert.equal(r[27],CONDITION_LABELS_06[m.rules[i].condition]);for(const label of r.slice(3,7))assert.ok(typeof label==='string'&&label.trim());});
  let dateChecks=0;
  for(const year of [2026,2027,2028]){
    sh('Übersicht').getRange('B4').values=[[year]];wb.recalculate();
    const actual=sh('Feiertagsregeln').getRange('X7:X485').values;
    m.rules.forEach((r,i)=>{assert.equal(actual[i][0],display(evaluateRule06(r,year)),`${r.id}/${year}`);dateChecks++;});
    const calendar=sh('Feiertagskalender').getRange('A7:A494').values;
    entries.forEach((e,i)=>{assert.equal(calendar[i][0],display(evaluateRule06(m.rules.find(r=>r.id===e.ruleId),year)),`${e.ruleId} calendar ${year}`);dateChecks++;});
  }
  // Disposable input probes exercise formula compatibility, not just cached dates.
  const tests=[['AB481','Unbekannt'],['AB481',''],['AB483','Nur Montag'],['J481',11],['N483',2]];
  for(const[cell,value]of tests){const original=sh('Feiertagsregeln').getRange(cell).values;sh('Feiertagsregeln').getRange(cell).values=[[value]];wb.recalculate();assert.equal(String(sh('Feiertagsregeln').getRange(`X${cell.match(/\d+/)[0]}`).values[0][0]),'#N/A');sh('Feiertagsregeln').getRange(cell).values=original;}
  sh('Übersicht').getRange('B4').values=[[2026]];
  const originalValidity=sh('Feiertagsregeln').getRange('O483:P483').values;
  for(const[from,to,result]of [['2026-04-09','2026-04-09',serial('2026-04-09')],['2026-04-02','2026-04-08','Ausserhalb Geltung']]){sh('Feiertagsregeln').getRange('O483:P483').values=[[serial(from),serial(to)]];wb.recalculate();assert.equal(sh('Feiertagsregeln').getRange('X483').values[0][0],result);}
  sh('Feiertagsregeln').getRange('O483:P483').values=originalValidity;
  sh('Übersicht').getRange('B4').values=[[savedYear]];wb.recalculate();
  if(!verify){
    console.log('Checks passed, exporting authored cells for native reconciliation');
    const output=await SpreadsheetFile.exportXlsx(wb);await output.save(path.join(qa,'artifact-export.xlsx'));
    await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,sourceSha256:V11_SHA256,patches,specs,entries,dateChecks,contract:'0.6.0',savedYear},null,2)+'\n');
    await fs.writeFile(path.join(qa,'model.json'),JSON.stringify(m,null,2)+'\n');
  }else{
    const views=[['Übersicht','A2:D20'],['Übersicht','A23:D36'],['Feiertagsregeln','D481:N485'],['Feiertagsregeln','W481:AB485'],['Feiertagskalender','A490:H494'],['Quellenprüfung','A92:F96'],['Quellenprüfung','G92:K96']];
    for(const year of [2026,2028]){sh('Übersicht').getRange('B4').values=[[year]];wb.recalculate();const p=await wb.render({sheetName:'Feiertagskalender',range:'A490:H494',scale:1,format:'png'});await fs.writeFile(path.join(qa,`saved-calendar-${year}.png`),new Uint8Array(await p.arrayBuffer()));}
    sh('Übersicht').getRange('B4').values=[[savedYear]];wb.recalculate();
    for(let i=0;i<views.length;i++){const[sheetName,range]=views[i],p=await wb.render({sheetName,range,scale:1,format:'png'});await fs.writeFile(path.join(qa,`saved-${i+1}.png`),new Uint8Array(await p.arrayBuffer()));}
    const audit={passed:true,contract:'0.6.0',dateChecks,rules:479,calendarRows:488,sourceUnchanged:createHash('sha256').update(await fs.readFile(source)).digest('hex')===V11_SHA256,sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex'),views};
    await fs.writeFile(path.join(qa,'reimport-audit.json'),JSON.stringify(audit,null,2)+'\n');console.log(JSON.stringify(audit));
  }
}
