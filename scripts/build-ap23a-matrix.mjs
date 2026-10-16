// SPDX-License-Identifier: AGPL-3.0-only
// Research and scope review only. Never imported by the application.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const root = process.cwd();
const qa = path.join(root, '.work/ap23a');
const out = path.join(root, 'outputs/ap23a-2026-10-12');
const require = createRequire(path.join(qa, 'runtime.mjs'));
const {Workbook, SpreadsheetFile, FileBlob} = await import(pathToFileURL(require.resolve('@oai/artifact-tool')));
const file = path.join(out, '2026-10-12_Verwaltungsverfahren_Schweiz_AP23A_V0.1.xlsx');
const inputs = ['be', 'west', 'zentral', 'nord'].map(x => `docs/fachrecht/ap23a/erhebung-${x}.json`);
const bundles = await Promise.all(inputs.map(async p => {
  const bytes = await fs.readFile(p);
  return {path:p, sha256:createHash('sha256').update(bytes).digest('hex'), data:JSON.parse(bytes)};
}));
const order = ['ZH','BE','LU','UR','SZ','OW','NW','GL','ZG','FR','SO','BS','BL','SH','AR','AI','SG','GR','AG','TG','TI','VD','VS','NE','GE','JU'];
const cantons = bundles.flatMap(b => b.data.cantons).sort((a,b) => order.indexOf(a.code)-order.indexOf(b.code));
assert.deepEqual(cantons.map(c => c.code), order);
const fields = ['name','administration','court','deadlineStart','deadlineEnd','holidayAnchor','stay','deadlineKinds','filing','ordinaryRemedy','exceptions','modelImpact','openQuestions','evidenceStatus','suggestedCluster'];
for (const c of cantons) {
  for (const k of fields) assert.ok(typeof c[k] === 'string' && c[k].length > 0, `${c.code}.${k}`);
  assert.ok(c.laws.length > 0, c.code);
  for (const s of c.laws) {
    assert.ok(s.id && s.url.startsWith('https://') && s.version && s.versionEvidence, `${c.code} source`);
    assert.equal(s.checkedOn, '2026-10-12');
  }
}
const sources = cantons.flatMap(c => c.laws.map(s => ({canton:c.code, ...s})));
assert.equal(new Set(sources.map(s => s.id)).size, sources.length);
const categories = [
  ['deadlineStart','Fristbeginn'], ['deadlineEnd','Fristende'], ['holidayAnchor','Feiertagsanknüpfung'],
  ['stay','Fristenstillstand'], ['deadlineKinds','Fristarten / Erstreckung'], ['filing','Fristwahrung'],
  ['ordinaryRemedy','Ordentliche Rechtsmittelfrist'], ['exceptions','Ausnahmen / Abgrenzung']
];
const ruleRows = cantons.flatMap(c => categories.map(([key,label]) => [`AP23-${c.code}-${key}`,c.code,label,c[key],c.laws.map(s=>s.id).join('\n'),'']));
const questionRows = cantons.map(c => [`AP23-${c.code}-Q`,c.code,c.openQuestions,c.modelImpact,c.suggestedCluster,'Offen','']);
const model = {kind:'ap23a-structural-inventory',version:'0.1',preparedOn:'2026-10-12',status:'Zur Prüfung, nicht abgenommen',runtimeActivation:false,cantons,sources,inputs:bundles.map(({path,sha256})=>({path,sha256}))};
// Documentary review label, not a calculation input. ISO date stays in the JSON.
const reviewDate = '12.10.2026';
const C = {navy:'#122C40',teal:'#2F6F73',text:'#172126',muted:'#566168',pale:'#E7EEEE',amber:'#FFF1CB',white:'#FFFFFF'};
const col = n => {let r=''; for(n++;n>0;n=Math.floor((n-1)/26)) r=String.fromCharCode(65+(n-1)%26)+r; return r;};
const specs=[];
const verify = process.argv.includes('--verify');
if (verify) {
  const creationModel = JSON.parse(await fs.readFile(path.join(out,'matrix-data.json'),'utf8'));
  assert.deepEqual(model.inputs,creationModel.inputs,'Geänderte Erhebungsdateien benötigen einen neuen Erzeugungsstand.');
  assert.deepEqual(model.cantons,creationModel.cantons);
}
if (!verify) {
  try {
    await fs.access(file);
    throw new Error('Die AP23A-Arbeitskopie existiert bereits. Nicht neu erzeugen: menschliche Bemerkungen bewahren. Zur Prüfung --verify verwenden.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
const wb = verify ? await SpreadsheetFile.importXlsx(await FileBlob.load(file)) : Workbook.create();
function tableSheet(name,title,context,headers,rows,widths,tableName,editable=[]) {
  const s=wb.worksheets.add(name), end=6+rows.length,last=col(headers.length-1);
  s.showGridLines=false;
  s.getRange(`A1:${last}${end}`).format={font:{name:'Arial',size:10,color:C.text},verticalAlignment:'top',wrapText:true};
  widths.forEach((w,i)=>{s.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth=w;});
  // The title bands follow the established AP22 project workbook template.
  s.getRange('A1:F2').merge(); s.getRange('A1').values=[[title]];
  s.getRange('A1:F2').format={fill:C.navy,font:{name:'Arial',size:16,bold:true,color:C.white},verticalAlignment:'center'};
  s.getRange('A3:F4').merge(); s.getRange('A3').values=[[context]];
  s.getRange('A3:F4').format={fill:C.pale,font:{name:'Arial',size:10,color:C.muted},verticalAlignment:'center'};
  s.getRange(`A1:${last}4`).format.rowHeight=24;
  s.getRange(`A5:${last}5`).format.rowHeight=10;
  s.getRange(`A6:${last}${end}`).values=[headers,...rows];
  const table=s.tables.add(`A6:${last}${end}`,true,tableName); table.showFilterButton=true;
  s.getRange(`A6:${last}6`).format={fill:C.teal,font:{name:'Arial',size:10,bold:true,color:C.white},rowHeight:36,horizontalAlignment:'center',verticalAlignment:'center'};
  for(let i=0;i<rows.length;i++) {
    const lines=Math.max(...rows[i].map((v,j)=>String(v??'').split('\n').reduce((n,t)=>n+Math.max(1,Math.ceil(t.length/(widths[j]*0.85))),0)));
    s.getRange(`A${i+7}:${last}${i+7}`).format={fill:i%2?C.pale:C.white,rowHeight:Math.max(40,lines*13+14)};
  }
  s.freezePanes.freezeRows(6); s.freezePanes.freezeColumns(2);
  for(const j of editable) s.getRange(`${col(j)}7:${col(j)}${end}`).format.fill=C.amber;
  specs.push({name,rows:rows.length,last,end}); return s;
}
if(!verify) {
  const overview=tableSheet('Kantonsübersicht','STEIMER  Verwaltungsverfahren Schweiz','AP23A V0.1 · 12.10.2026 · 25 neue Kantone + BE-Referenz. Strukturelle Erhebung, keine Produktfreigabe. Gelbe Felder für deine Prüfung.',
    ['Kanton','Name','Allgemeine Grundlagen','Verwaltungsverfahren','Gerichtliches Verfahren','Belegstand','Prüfentscheid David','Bemerkung David'],
    cantons.map(c=>[c.code,c.name,c.laws.filter(l=>l.systematicNumber!=='nicht anwendbar').map(l=>`${l.abbreviation} ${l.systematicNumber}\n${l.title}`).join('\n\n'),c.administration,c.court,c.evidenceStatus,'Offen','']),
    [9,24,50,68,68,25,28,48],'AP23_Kantone',[6,7]);
  overview.tabColor=C.navy;
  overview.getRange('G7:G32').dataValidation={rule:{type:'list',values:['Offen','Struktur bestätigt','Mit Bemerkung','Zurückstellen']}};
  overview.getRange('G7:G32').conditionalFormats.add('containsText',{text:'Mit Bemerkung',format:{font:{bold:true,color:'#8A4B00'}}});
  tableSheet('Fristenregeln','STEIMER  Fristenregeln nach Kanton','Je Kanton acht Prüfdimensionen. Artikel stehen beim Befund, Quellen-IDs verweisen auf das Quellenblatt. Kein automatisches Ergebnis für einen Einzelfall.',
    ['Prüf-ID','Kanton','Gegenstand','Struktureller Befund mit Fundstelle','Quellen-IDs','Bemerkung David'],ruleRows,
    [29,9,31,115,34,48],'AP23_Fristen',[5]);
  const questions=tableSheet('Vertiefung','STEIMER  Offene Punkte und Modellfolgen','Aus AP23A folgende Vertiefung für AP23B/C. Die Arbeitsgruppen sind keine Freigabe oder zwingende Auslieferungsreihenfolge.',
    ['Prüf-ID','Kanton','Offene Fragen / Abgrenzung','Folge für das Modell','Arbeitsgruppe','Prüfstand David','Bemerkung David'],questionRows,
    [22,9,92,86,44,27,48],'AP23_Vertiefung',[5,6]);
  questions.getRange('F7:F32').dataValidation={rule:{type:'list',values:['Offen','Für AP23B bestätigt','Später prüfen','Mit Bemerkung']}};
  tableSheet('Quellen','STEIMER  Amtliche Grundlagen und Fassungen','Fassung und Abrufdatum bleiben getrennt. Teilbeleg oder Fundstelle ist kein Volltextnachweis. Rohbelege dienen der lokalen Nachprüfbarkeit.',
    ['Quellen-ID','Kanton','Titel / Sammlung','Geprüfte Fassung','Artikel / Abschnitt','Abrufdatum','Zugang / Prüftiefe','Fassungsnachweis','URL','Abgrenzung'],
    sources.map(s=>[s.id,s.canton,`${s.title}\n${s.systematicNumber}`,s.version,s.articles,reviewDate,s.access,s.versionEvidence,s.url,s.notes]),
    [31,9,55,31,36,17,29,86,65,75],'AP23_Quellen');
  wb.worksheets.getItem('Quellen').getRange(`F7:F${6+sources.length}`).setNumberFormat('@');
  wb.worksheets.getItem('Quellen').getRange(`I7:I${6+sources.length}`).format.font.color='#1A5C8E';
  await fs.mkdir(out,{recursive:true});
  await fs.writeFile(path.join(out,'matrix-data.json'),JSON.stringify(model,null,2)+'\n');
}
wb.recalculate();
assert.deepEqual(wb.worksheets.getItem('Kantonsübersicht').getRange('A7:A32').values.flat(),order);
assert.equal(wb.worksheets.getItem('Fristenregeln').getRange(`A7:A${6+ruleRows.length}`).values.flat().filter(Boolean).length,208);
assert.deepEqual(wb.worksheets.getItem('Quellen').getRange(`I7:I${6+sources.length}`).values.flat(),sources.map(s=>s.url));
assert.deepEqual(wb.worksheets.getItem('Kantonsübersicht').getRange('A7:F32').values,
  cantons.map(c=>[c.code,c.name,c.laws.filter(l=>l.systematicNumber!=='nicht anwendbar').map(l=>`${l.abbreviation} ${l.systematicNumber}\n${l.title}`).join('\n\n'),c.administration,c.court,c.evidenceStatus]));
assert.deepEqual(wb.worksheets.getItem('Fristenregeln').getRange(`A7:E${6+ruleRows.length}`).values,ruleRows.map(r=>r.slice(0,5)));
assert.deepEqual(wb.worksheets.getItem('Vertiefung').getRange('A7:E32').values,questionRows.map(r=>r.slice(0,5)));
const normalizeRows = rows => rows.map(r=>r.map(v=>v??''));
assert.deepEqual(normalizeRows(wb.worksheets.getItem('Quellen').getRange(`A7:J${6+sources.length}`).values),
  sources.map(s=>[s.id,s.canton,`${s.title}\n${s.systematicNumber}`,s.version,s.articles,reviewDate,s.access,s.versionEvidence,s.url,s.notes]));
const scan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:25},maxChars:1500});
assert.ok(scan.ndjson.includes('Cell search matched 0 entries.'),scan.ndjson);
const views=[['Kantonsübersicht','A1:F10'],['Kantonsübersicht','F6:H10'],['Fristenregeln','A6:F11'],['Vertiefung','A1:F9'],['Quellen','A6:G10'],['Quellen','H6:J10']];
if(!verify) await(await SpreadsheetFile.exportXlsx(wb)).save(file);
// Inspect the exported target, not a separate content variant.
const renderWb=verify?wb:await SpreadsheetFile.importXlsx(await FileBlob.load(file));
for(let n=0;n<views.length;n++) {
  const [sheetName,range]=views[n];
  const blob=await renderWb.render({sheetName,range,scale:1,format:'png'});
  await fs.writeFile(path.join(qa,`saved-${n+1}.png`),new Uint8Array(await blob.arrayBuffer()));
}
const audit={preparedOn:'2026-10-12',stage:verify?'final-workbook-verification':'artifact-export-before-native-hyperlinks',file:path.basename(file),sha256:createHash('sha256').update(await fs.readFile(file)).digest('hex'),cantons:26,newCantons:25,ruleDimensions:208,sources:sources.length,sheets:4,formulaErrorScan:scan.ndjson,reimported:true,nativeExcelInteraction:'not tested',productActivation:false,inputs:model.inputs,renderedViews:views};
await fs.writeFile(path.join(out,verify?'verification-ap23a.json':'qa-ap23a.json'),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit,null,2));
