// SPDX-License-Identifier: AGPL-3.0-only
// Workbook-authoring module called only through the established AP18 builder.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const col = n => {let s=''; for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s; return s;};
const serial = value => value === null ? null : Math.round((new Date(`${value}T00:00:00Z`)-new Date('1899-12-30T00:00:00Z'))/86400000);
const excelDate = value => value===null ? 'Ausserhalb Geltung' : serial(value);
const dayLabel = value => value==='fullDay' ? 'Ganztägig' : value==='afternoonFromNoon' ? 'Ab 12.00 Uhr' : null;

// Existing positional columns remain stable. Only the Easter helper moves two columns.
export function rawDateFormula05(r) {
  const integer = (c,min,max) => `ISNUMBER(${c}${r}),${c}${r}=INT(${c}${r}),${c}${r}>=${min},${c}${r}<=${max}`;
  const anchor = `DATE('Übersicht'!$B$4,J${r},1)+MOD(M${r}-WEEKDAY(DATE('Übersicht'!$B$4,J${r},1),2),7)+7*(N${r}-1)`;
  const fixed = `DATE('Übersicht'!$B$4,J${r},K${r})`;
  const nthCheck = `${integer('J',1,12)},${integer('M',1,7)},${integer('N',1,5)},MONTH(${anchor})=J${r},K${r}=""`;
  const offset = `${integer('L',-366,366)}`;
  const value = `IF(I${r}="fixedMonthDay",IF(AND(${integer('J',1,12)},${integer('K',1,31)},MONTH(${fixed})=J${r},DAY(${fixed})=K${r},L${r}="",M${r}="",N${r}=""),${fixed},NA()),IF(I${r}="easterOffsetDays",IF(AND(${offset},J${r}="",K${r}="",M${r}="",N${r}=""),$AD$23+L${r},NA()),IF(I${r}="nthWeekdayOfMonth",IF(AND(${nthCheck},L${r}=""),${anchor},NA()),IF(I${r}="nthWeekdayOffsetDays",IF(AND(${nthCheck},${offset}),${anchor}+L${r},NA()),NA()))))`;
  return `=IF(AND(ISNUMBER('Übersicht'!$B$4),'Übersicht'!$B$4=INT('Übersicht'!$B$4),'Übersicht'!$B$4>=2026,'Übersicht'!$B$4<=2028),${value},NA())`;
}
export function validDateFormula05(r) {
  const date=c=>`ISNUMBER(${c}${r}),${c}${r}=INT(${c}${r}),${c}${r}>=${serial('1583-01-01')},${c}${r}<=${serial('9999-12-31')}`;
  return `=IF(AND(${date('O')},OR(P${r}="",AND(${date('P')},P${r}>=O${r})),OR(AA${r}="Ganztägig",AA${r}="Ab 12.00 Uhr")),IF(AND(W${r}>=O${r},OR(P${r}="",W${r}<=P${r})),W${r},"Ausserhalb Geltung"),NA())`;
}

export async function buildBatch03Workbook({root, SpreadsheetFile, FileBlob}) {
  const rest = process.argv.includes('--batch-04');
  const baseQa = path.join(root, rest ? '.work/ap18b-04' : '.work/ap18b-03');
  const batch = rest || process.argv.includes('--with-cantons');
  const verify = process.argv.includes('--verify');
  const qa = path.join(baseQa,batch?'batch':'structure');
  await fs.mkdir(qa, {recursive:true});
  const source = path.join(root,rest ? 'outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx' : 'outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx');
  const sourceSha256 = rest ? 'a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12' : 'd3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f';
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'), sourceSha256);
  const file = rest ? path.join(root,'outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx') : batch ? path.join(root,'outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx') : path.join(qa,'structure.xlsx');
  const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(verify?file:source));
  if(process.argv.includes('--validation-help')) {
    console.log(wb.help('range.dataValidation',{include:'index,examples,notes',maxChars:6000}).ndjson);
    return;
  }
  if(process.argv.includes('--inspect-source')) {
    console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:4000,tableMaxRows:1,tableMaxCols:4})).ndjson);
    for(const [name,range] of [['Feiertagsregeln','H6:N12'],['Feiertagsregeln','R6:AB12'],['Feiertagskalender','A6:F12']]) {
      const preview = await wb.render({sheetName:name,range,scale:1.2,format:'png'});
      await fs.writeFile(path.join(baseQa,`source-${name}-${range.replace(':','-')}.png`),new Uint8Array(await preview.arrayBuffer()));
    }
    return;
  }
  const {createContract05Model,ruleDate05,validateContract05} = await import('./ap18b-03-contract.mjs');
  const base = rest ? await (await import('./ap18b-03-cantons.mjs')).createBatch03Model(root) : await createContract05Model(root);
  let m=base;
  if(rest) {
    const gate=JSON.parse(await fs.readFile(path.join(root,'.work/ap18b-03/batch/independent-audit.json'),'utf8'));
    assert.equal(gate.status,'passed'); assert.equal(gate.sha256,sourceSha256);
    m=await (await import('./ap18b-04-cantons.mjs')).createBatch04Model(root);
  } else if(batch) {
    const gate=JSON.parse(await fs.readFile(path.join(baseQa,'structure/reimport-audit.json'),'utf8'));
    assert.equal(gate.contract,'0.5.0'); assert.equal(gate.passed,true);
    const {createBatch03Model}=await import('./ap18b-03-cantons.mjs');
    m=await createBatch03Model(root);
  }
  validateContract05(m);
  const oldEntries=JSON.parse(await fs.readFile(path.join(root,rest?'.work/ap18b-03/batch/checks.json':'.work/ap18b-02-ti-gr/checks.json'),'utf8')).entries;
  const newCantons=rest?m.batch04Cantons:['CH-VS','CH-FR','CH-SO','CH-GE'];
  const entries=[...oldEntries,...m.rules.slice(base.rules.length).map(r=>({scopeId:r.scope,ruleId:r.id}))];
  const sh = name => wb.worksheets.getItem(name);
  if(rest&&verify&&process.argv.includes('--inspect-special')) {
    const special=[];
    for(const key of Object.keys(m.batch04Additions.holidayDefinitions)) {
      const rule=m.rules.find(r=>m.ruleKeys[r.id]===key),row=m.rules.indexOf(rule)+7;
      const cal=entries.findIndex(e=>e.ruleId===rule.id)+7;
      special.push(['Feiertagsregeln',`D${row}:N${row}`],['Feiertagskalender',`A${cal}:H${cal}`]);
    }
    for(let i=0;i<special.length;i++) {
      const[name,range]=special[i],preview=await wb.render({sheetName:name,range,scale:1.2,format:'png'});
      await fs.writeFile(path.join(qa,`special-${i+1}.png`),new Uint8Array(await preview.arrayBuffer()));
    }
    await fs.writeFile(path.join(qa,'special-views.json'),JSON.stringify(special,null,2)+'\n');
    console.log(JSON.stringify({special,readOnly:true}));return;
  }
  const patches=[], specs=[];
  const set=(name,range,values)=>{sh(name).getRange(range).values=values;patches.push({name,range});};
  const formula=(name,range,values)=>{sh(name).getRange(range).formulas=values;patches.push({name,range});};
  const d=value=>value?new Date(`${value}T00:00:00Z`):null;
  const addSpec=(name,oldCount,newCount,last)=>specs.push({name,oldEnd:6+oldCount,end:6+newCount,last,tableName:sh(name).tables.items[0].name});
  const append=(name,oldCount,rows)=>{
    if(!rows.length)return;
    const last=col(rows[0].length-1),oldEnd=6+oldCount,end=oldEnd+rows.length;
    addSpec(name,oldCount,oldCount+rows.length,last);
    for(let r=oldEnd+1;r<=end;r++) {
      const template=oldEnd-(r%2===oldEnd%2?0:1);
      sh(name).getRange(`A${r}:${last}${r}`).copyFrom(sh(name).getRange(`A${template}:${last}${template}`),'all');
      sh(name).getRange(`A${r}:${last}${r}`).format.rowHeight=['Feiertagsregeln','Feiertagskalender'].includes(name)?44:name==='Verfahrensbezug'?118:88;
    }
    set(name,`A${oldEnd+1}:${last}${end}`,rows);
  };
  const ruleEnd=6+m.rules.length, calendarEnd=6+entries.length;
  const ruleRows=rules=>rules.map(r=>[r.id,r.jurisdiction,r.scope,r.de,r.fr,r.it??'',r.rm??'',r.category,r.calculation.type,r.calculation.month??null,r.calculation.day??null,r.calculation.offsetDays??null,r.calculation.isoWeekday??null,r.calculation.occurrence??null,d(r.from),d(r.to),r.priority,r.status,r.approvalBasis,r.action,r.target,r.exportClass,null,null,r.source,r.locator,dayLabel(r.dayPortion)]);
  const sourceNotesStart=rest?6+base.assignments.length+3:40, notesStart=6+m.assignments.length+3;
  if(!verify) {
    if(!rest) {
    assert.equal(sh('Feiertagsregeln').getRange('L6').values[0][0],'Osterversatz');
    assert.equal(sh('Feiertagsregeln').getRange('AA6').values[0][0],'Osterrechnung');
    sh('Feiertagsregeln').getRange('AC6:AD23').copyFrom(sh('Feiertagsregeln').getRange('AA6:AB23'),'all');
    patches.push({name:'Feiertagsregeln',range:'AC6:AD23'});
    sh('Feiertagsregeln').getRange('AA6:AB23').clear({applyTo:'all'});
    patches.push({name:'Feiertagsregeln',range:'AA6:AB23'});
    sh('Feiertagsregeln').getRange('AA6').copyFrom(sh('Feiertagsregeln').getRange('Z6'),'all');
    for(let r=7;r<=122;r++)sh('Feiertagsregeln').getRange(`AA${r}`).copyFrom(sh('Feiertagsregeln').getRange(`L${r}`),'all');
    set('Feiertagsregeln','AA6',[['Tagesumfang']]);
    set('Feiertagsregeln','L6',[['Tagesabstand']]);
    set('Feiertagsregeln','AA7:AA122',base.rules.map(r=>[dayLabel(r.dayPortion)]));
    } else {
      assert.equal(sh('Feiertagsregeln').getRange('AA6').values[0][0],'Tagesumfang');
      assert.equal(sh('Feiertagsregeln').getRange('AC6').values[0][0],'Osterrechnung');
    }
    append('Feiertagsregeln',base.rules.length,ruleRows(m.rules.slice(base.rules.length)));
    if(!batch)addSpec('Feiertagsregeln',base.rules.length,m.rules.length,'AA');
    formula('Feiertagsregeln',`W7:X${ruleEnd}`,m.rules.map((_,i)=>[rawDateFormula05(i+7),validDateFormula05(i+7)]));
    const rs=sh('Feiertagsregeln');
    const alert=message=>({style:'stop',title:'Ungültige Eingabe',message});
    rs.getRange(`I7:I${ruleEnd}`).dataValidation={allowBlank:false,rule:{type:'list',values:['fixedMonthDay','easterOffsetDays','nthWeekdayOfMonth','nthWeekdayOffsetDays']},errorAlert:alert('Bitte einen unterstützten Regeltyp wählen.')};
    rs.getRange(`J7:J${ruleEnd}`).dataValidation={allowBlank:true,rule:{type:'whole',operator:'between',formula1:1,formula2:12},errorAlert:alert('Der Monat muss eine ganze Zahl von 1 bis 12 sein.')};
    rs.getRange(`K7:K${ruleEnd}`).dataValidation={allowBlank:true,rule:{type:'whole',operator:'between',formula1:1,formula2:31},errorAlert:alert('Der Tag muss eine ganze Zahl von 1 bis 31 sein.')};
    rs.getRange(`L7:L${ruleEnd}`).dataValidation={allowBlank:true,rule:{type:'whole',operator:'between',formula1:-366,formula2:366},errorAlert:alert('Der Tagesabstand muss eine ganze Zahl von −366 bis 366 sein.')};
    rs.getRange(`AA7:AA${ruleEnd}`).dataValidation={allowBlank:false,rule:{type:'list',values:['Ganztägig','Ab 12.00 Uhr']},errorAlert:alert('Bitte den Tagesumfang ausdrücklich wählen.')};
    rs.getRange(`AA6:AA${ruleEnd}`).format.columnWidth=22;
    rs.getRange('AB6:AB23').format.columnWidth=3;
    rs.getRange('AC6:AC23').format.columnWidth=22;
    rs.getRange('AD6:AD23').format.columnWidth=18;
    const calendar=sh('Feiertagskalender');
    calendar.getRange('O6').copyFrom(calendar.getRange('N6'),'all');
    if(!rest)for(let r=7;r<=131;r++)calendar.getRange(`O${r}`).copyFrom(calendar.getRange(`N${r}`),'all');
    set('Feiertagskalender','O6',[['Tagesumfang']]);
    append('Feiertagskalender',oldEntries.length,entries.slice(oldEntries.length).map(e=>{
      const r=m.rules.find(r=>r.id===e.ruleId), scope=m.scopes.find(s=>s[0]===e.scopeId);
      return [null,null,r.jurisdiction,scope[2],null,null,null,null,null,'open',r.id,null,null,
        r.dayPortion==='afternoonFromNoon'?'Halbtag nach kantonalem Recht. Wirkung auf Tagesfristen offen.': 'Erfassungsentwurf. Keine neue Fristenprofilfreigabe.',null];
    }));
    if(!batch)addSpec('Feiertagskalender',oldEntries.length,entries.length,'O');
    entries.forEach((e,i)=>{
      const row=i+7,lookup=c=>`INDEX('Feiertagsregeln'!$${c}$7:$${c}$${ruleEnd},MATCH($K${row},'Feiertagsregeln'!$A$7:$A$${ruleEnd},0))`;
      for(const[dest,src]of [['A','X'],['E','D'],['F','E'],['I','H'],['L','Y'],['M','Z'],['O','AA']])formula('Feiertagskalender',`${dest}${row}`,[[`=${lookup(src)}`]]);
      for(const[dest,src]of [['G','F'],['H','G']])formula('Feiertagskalender',`${dest}${row}`,[[`=IF(${lookup(src)}="","Noch zu erfassen",${lookup(src)})`]]);
      formula('Feiertagskalender',`B${row}`,[[`=IF(ISNUMBER(A${row}),CHOOSE(WEEKDAY(A${row},2),"Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag")&IF(O${row}="Ab 12.00 Uhr",", ab 12.00 Uhr",""),"n.a.")`]]);
    });
    calendar.getRange(`B6:B${calendarEnd}`).format.columnWidth=30;
    calendar.getRange(`O6:O${calendarEnd}`).format.columnWidth=22;
    if(batch) {
      append('Geltungsbereiche',base.scopes.length,m.scopes.slice(base.scopes.length).map(r=>[r[0],r[1],r[2],m.scopeLabels?.[r[0]]?.fr??'',m.scopeLabels?.[r[0]]?.it??'',m.scopeLabels?.[r[0]]?.rm??'',r[3],r[4],r[5],r[6],r[7],d(r[8]),d(r[9])]));
      append('Rechtsquellen',base.sources.length,m.sources.slice(base.sources.length).map(r=>[...r.slice(0,4),'Amtliche Quelle öffnen',d(r[5]),d(r[6]),...r.slice(7),r[4]]));
      append('Verfahrensbezug',base.mappings.length,m.mappings.slice(base.mappings.length));
      append('Quellenprüfung',base.reviews.length,m.reviews.slice(base.reviews.length).map(r=>[...r.slice(0,3),d(r[3]),...r.slice(4)]));
      const notes=sh('Gebietszuordnungen').getRange(`A${sourceNotesStart}:A${sourceNotesStart+4}`).values;
      sh('Gebietszuordnungen').getRange(`A${notesStart}:A${notesStart+4}`).copyFrom(sh('Gebietszuordnungen').getRange(`A${sourceNotesStart}:A${sourceNotesStart+4}`),'all');
      for(let r=sourceNotesStart;r<notesStart;r++)set('Gebietszuordnungen',`A${r}`,[[null]]);
      set('Gebietszuordnungen',`A${notesStart}:A${notesStart+4}`,notes);
      append('Gebietszuordnungen',base.assignments.length,m.assignments.slice(base.assignments.length).map(a=>[a.id,a.scopeId,a.areaId,a.de,a.fr,a.it,a.rm,a.areaType,a.parentAreaId,a.effect,a.officialIdSystem,a.officialId,d(a.from),d(a.to),a.sourceId,a.locator,a.status,a.note]));
      for(const code of newCantons) {
        const row=m.jurisdictions.findIndex(r=>r[0]===code)+7;
        set('Gemeinwesen',`D${row}:E${row}`,[[m.jurisdictionLabels?.[code]?.it??'',m.jurisdictionLabels?.[code]?.rm??'']]);
        const gap=rest&&m.pendingCases.some(p=>p.canton===code||`CH-${p.canton}`===code);
        set('Gemeinwesen',`G${row}:I${row}`,[[`${rest?'AP18B-04':'AP18B-03'}, ${gap?'Teilerfassung mit dokumentierter Lücke':'Normlisten erfasst'}, Fachabnahme offen`,'open',m.sources.find(s=>s[1]===code)?.[4]??'']]);
      }
    }
    set('Übersicht','A6',[[batch?'AP18B-03 · V0.9 · VS, FR, SO und GE zur Fachprüfung':'AP18B-03 · Strukturprüfung 0.5.0 vor Kantonerfassung']]);
    set('Übersicht','A8',[[batch?'18 Kantone noch nicht erhoben. Neue Kantonsregeln bleiben bis zur Fachabnahme offen.':'22 Kantone noch nicht erhoben. Strukturmigration ohne neue Kantonsdaten.']]);
    set('Übersicht','A9',[['Bisherige Regeln erhalten. Tagesumfang ausdrücklich erfasst, Fristwirkung getrennt.']]);
    set('Übersicht','A34',[['Vier Sprachspalten erhalten. Neue Produktübersetzungen sind provisorisch, keine amtlichen Sprachfassungen.']]);
    set('Übersicht','A36',[[`Arbeitsmappenvertrag 0.5.0 bestätigt (DEC-2026-021). Keine neue Fach-, Produkt- oder Releasefreigabe.`]]);
    formula('Übersicht','B26',[[`=COUNTIFS('Feiertagsregeln'!$R$7:$R$${ruleEnd},"open")`]]);
    set('Feiertagskalender','A4',[['Tagesumfang beachten. Regionale Arbeitsfeiertage und prozessuale Listen getrennt. Neue Fristwirkungen bleiben gesperrt.']]);
    if(rest) {
      set('Übersicht','A6',[['AP18B-04 · V0.10 · Bund und alle 26 Kantone als Arbeitsgrundlage']]);
      set('Übersicht','A8',[[`Alle Kantone erhoben, keine Vollständigkeitsfreigabe. ${m.pendingCases.length} begrenzte Fälle offen, siehe Quellenprüfung.`]]);
      set('Übersicht','A9',[['Abgenommene V0.9 erhalten. SO-Halbtag am 1. Mai: gemäss Fachentscheid keine Fristwirkung.']]);
      set('Übersicht','A19',[['Bedingte und nicht belegte Tage fehlen bewusst in der Datumsansicht. Offene Fälle sind keine negativen Feiertagsnachweise.']]);
      set('Übersicht','A30',[['V0.9 ist fachlich abgenommen. Statuswerte früherer Kandidaten bleiben historisch, neue Regeln sind nicht freigegeben.']]);
      const gaps=[...new Set(m.pendingCases.map(p=>p.canton.replace('CH-','')))].join('/');
      set('Feiertagskalender','A4',[[`Unvollständige Profile ${gaps} beachten. SO-Halbtag ohne Fristwirkung. Neue Regeln nicht für Fristen freigegeben.`]]);
    }
  }
  const year=sh('Übersicht').getRange('B4').values[0][0];
  assert.deepEqual(sh('Feiertagsregeln').getRange('A6:AA6').values[0],[
    'Regel-ID','Gemeinwesen','Geltungs-ID','Deutsch','Französisch','Italienisch','Rumantsch Grischun',
    'Rechtskategorie','Regeltyp','Monat','Tag','Tagesabstand','ISO-Wochentag','Vorkommen','Gültig ab',
    'Gültig bis','Priorität','Fachstatus','Freigabebasis','Wirkung','Zielregel','Exportklasse','Rohdatum',
    'Datum im Geltungszeitraum','Quellen-ID','Fundstelle','Tagesumfang']);
  const actual=sh('Feiertagsregeln').getRange(`A7:AA${ruleEnd}`).values;
  ruleRows(m.rules).forEach((expected,i)=>expected.forEach((value,j)=>{
    if(j===22||j===23)return;
    const normalize=v=>v instanceof Date?serial(v.toISOString().slice(0,10)):v===''?null:v??null;
    assert.equal(normalize(actual[i][j]),normalize(value),`${m.rules[i].id} field ${col(j)}`);
  }));
  let dateChecks=0,calendarChecks=0;
  for(const selected of [2026,2027,2028,2026]) {
    sh('Übersicht').getRange('B4').values=[[selected]]; wb.recalculate();
    m.rules.forEach((r,i)=>{assert.equal(sh('Feiertagsregeln').getRange(`X${i+7}`).values[0][0],excelDate(ruleDate05(r,selected)),r.id);dateChecks++;});
    entries.forEach((e,i)=>{const r=m.rules.find(r=>r.id===e.ruleId);assert.equal(sh('Feiertagskalender').getRange(`A${i+7}`).values[0][0],excelDate(ruleDate05(r,selected)));assert.equal(sh('Feiertagskalender').getRange(`O${i+7}`).values[0][0],dayLabel(r.dayPortion));calendarChecks++;});
  }
  // Disposable in-memory probes. Every value/formula is restored before export.
  const testRow=122, original=sh('Feiertagsregeln').getRange(`I${testRow}:P${testRow}`).values;
  const originalPart=sh('Feiertagsregeln').getRange(`AA${testRow}`).values;
  const change=calculation=>{sh('Feiertagsregeln').getRange(`I${testRow}:N${testRow}`).values=[[calculation.type,calculation.month??null,calculation.day??null,calculation.offsetDays??null,calculation.isoWeekday??null,calculation.occurrence??null]];};
  const valid={from:'2024-01-01',to:'2029-12-31',dayPortion:'fullDay'};
  sh('Feiertagsregeln').getRange(`O${testRow}:P${testRow}`).values=[[serial(valid.from),serial(valid.to)]];
  sh('Feiertagsregeln').getRange(`AA${testRow}`).values=[['Ganztägig']];
  const probes=[
    {type:'nthWeekdayOffsetDays',month:9,isoWeekday:7,occurrence:1,offsetDays:4},
    {type:'nthWeekdayOffsetDays',month:1,isoWeekday:4,occurrence:1,offsetDays:-366},
    {type:'nthWeekdayOffsetDays',month:12,isoWeekday:4,occurrence:4,offsetDays:366},
    {type:'nthWeekdayOffsetDays',month:1,isoWeekday:4,occurrence:1,offsetDays:0}
  ];
  for(const calculation of probes){change(calculation);wb.recalculate();assert.equal(sh('Feiertagsregeln').getRange(`X${testRow}`).values[0][0],serial(ruleDate05({...valid,calculation},2026)));}
  for(const calculation of [
    {...probes[0],offsetDays:367},{...probes[0],offsetDays:-367},{...probes[0],offsetDays:0.5},{...probes[0],offsetDays:'4'},
    {...probes[0],offsetDays:null},{...probes[0],month:2,isoWeekday:1,occurrence:5,offsetDays:-7},
    {type:'nthWeekdayOfMonth',month:9,isoWeekday:7,occurrence:1,offsetDays:4},
    {type:'fixedMonthDay',month:2,day:30},{type:'unknown'}
  ]){change(calculation);wb.recalculate();assert.equal(String(sh('Feiertagsregeln').getRange(`X${testRow}`).values[0][0]),'#N/A');}
  change(probes[0]);
  const at=serial('2026-09-10');
  for(const[from,to,expected]of [[at,at,at],[at+1,null,'Ausserhalb Geltung'],[at-1,at-1,'Ausserhalb Geltung']]) {
    sh('Feiertagsregeln').getRange(`O${testRow}:P${testRow}`).values=[[from,to]];wb.recalculate();assert.equal(sh('Feiertagsregeln').getRange(`X${testRow}`).values[0][0],expected);
  }
  for(const[from,to]of [[at+0.5,null],[at-1,at+0.5],[null,null],[serial('1583-01-01')-1,null],[at,serial('9999-12-31')+1]]) {
    sh('Feiertagsregeln').getRange(`O${testRow}:P${testRow}`).values=[[from,to]];wb.recalculate();assert.equal(String(sh('Feiertagsregeln').getRange(`X${testRow}`).values[0][0]),'#N/A');
  }
  sh('Feiertagsregeln').getRange(`I${testRow}:P${testRow}`).values=original;
  const related=entries.findIndex(e=>e.ruleId===m.rules[testRow-7].id)+7;
  for(const portion of ['Ab 12.00 Uhr','Ganztägig']) {
    sh('Feiertagsregeln').getRange(`AA${testRow}`).values=[[portion]];wb.recalculate();
    assert.equal(sh('Feiertagskalender').getRange(`O${related}`).values[0][0],portion);
    assert.equal(sh('Feiertagskalender').getRange(`B${related}`).values[0][0].includes('ab 12.00 Uhr'),portion==='Ab 12.00 Uhr');
  }
  sh('Feiertagsregeln').getRange(`AA${testRow}`).values=originalPart;
  sh('Übersicht').getRange('B4').values=[[year]];wb.recalculate();
  assert.equal(sh('Feiertagsregeln').getRange('AA6').values[0][0],'Tagesumfang');
  assert.equal(sh('Feiertagsregeln').getRange('L6').values[0][0],'Tagesabstand');
  assert.equal(sh('Feiertagsregeln').getRange('AC6').values[0][0],'Osterrechnung');
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:60},summary:'AP18B-03 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'),errors.ndjson);
  const views=[['Übersicht','A6:H26'],['Feiertagsregeln','I6:N12'],['Feiertagsregeln','W6:AD12'],['Feiertagsregeln','AC6:AD23'],['Feiertagskalender','A6:D12']];
  if(batch)for(const code of newCantons) {
    const i=m.rules.findIndex(r=>r.jurisdiction===code),j=entries.findIndex(e=>m.rules.find(r=>r.id===e.ruleId).jurisdiction===code);
    views.push(['Feiertagsregeln',`D${i+7}:N${Math.min(i+13,ruleEnd)}`],['Feiertagskalender',`A${j+7}:F${Math.min(j+13,calendarEnd)}`]);
  }
  if(batch) {
    if(rest)views.push(['Gemeinwesen','A7:I15'],['Gemeinwesen','A16:I24'],['Gemeinwesen','A25:I33']);
    else views.push(['Gemeinwesen','A15:I18'],['Gemeinwesen','A28:I32']);
    for(const[name,count,last,ranges]of [
      ['Geltungsbereiche',base.scopes.length,m.scopes.length,[['A','F'],['G','M']]],
      ['Gebietszuordnungen',base.assignments.length,m.assignments.length,[['A','I'],['O','R']]],
      ['Rechtsquellen',base.sources.length,m.sources.length,[['A','D'],['H','K']]],
      ['Verfahrensbezug',base.mappings.length,m.mappings.length,[['A','D'],['E','H']]],
      ['Quellenprüfung',base.reviews.length,m.reviews.length,[['A','F'],['G','K']]]
    ])for(let row=count+7;row<=last+6;row+=6)for(const[a,b]of ranges)views.push([name,`${a}${row}:${b}${Math.min(row+5,last+6)}`]);
    const half=m.rules.findIndex(r=>r.dayPortion==='afternoonFromNoon')+7;
    const halfCal=entries.findIndex(e=>e.ruleId===m.rules[half-7].id)+7;
    views.push(['Feiertagsregeln',`W${half}:AA${half}`],['Feiertagskalender',`A${halfCal}:F${halfCal}`]);
  }
  if(rest)views.push(['Übersicht','A28:H36'],['Feiertagskalender','A2:H6']);
  for(let i=0;i<(rest&&!verify?5:views.length);i++) {
    const[name,range]=views[i],img=await wb.render({sheetName:name,range,scale:1.2,format:'png'});
    await fs.writeFile(path.join(qa,`${verify?'saved':'authored'}-${i+1}.png`),new Uint8Array(await img.arrayBuffer()));
  }
  const audit={contract:'0.5.0',passed:true,source,file,sourceSha256,dateChecks,calendarChecks,probes:probes.length+9+3+5+2,formulaScan:errors.ndjson,nativeExcelTest:'notPerformed',restoredYear:year,views};
  if(verify)await fs.writeFile(path.join(qa,'reimport-audit.json'),JSON.stringify(audit,null,2)+'\n');
  else {
    await(await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
    await fs.writeFile(path.join(qa,'model.json'),JSON.stringify(m,null,2)+'\n');
    await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({...audit,patches,specs,entries,rules:m.rules.length,calendarRows:entries.length,sourceNotesStart,notesStart,sourceUrls:m.sources.map(s=>s[4])},null,2)+'\n');
  }
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),sourceSha256);
  console.log(JSON.stringify({phase:batch?'batch':'structure',verify,...audit}));
}
