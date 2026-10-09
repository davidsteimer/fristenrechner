// SPDX-License-Identifier: AGPL-3.0-only
// Requires the bundled artifact runtime via .work/ap18a/node_modules.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createPilotModel, validateModel, ruleDate, BASELINE } from './ap18a-model.mjs';

const root=process.cwd();
// Resolve only the public package entry through a task-local bundled dependency link.
const {createRequire}=await import('node:module');
const require=createRequire(path.join(root,'.work/ap18a/runtime.mjs'));
const {Workbook,SpreadsheetFile,FileBlob}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')));
if(process.argv.includes('--batch-05')){
  const {buildBatch05Workbook}=await import('./ap18b-05-workbook.mjs');
  await buildBatch05Workbook({root,SpreadsheetFile,FileBlob});
  process.exit(0);
}
if(process.argv.includes('--complete-languages')){
  await completeWorkbookLanguages();
  process.exit(0);
}
if(process.argv.includes('--batch-03') || process.argv.includes('--batch-04')){
  const { buildBatch03Workbook } = await import('./ap18b-03-workbook.mjs');
  await buildBatch03Workbook({root, SpreadsheetFile, FileBlob});
  process.exit(0);
}
// Narrow follow-up edits start from the delivered workbook, not the initial seed.
if(process.argv.includes('--ti-gr-rg-provisional')){
  await addProvisionalTiRomanshNames();
  process.exit(0);
}
if(process.argv.includes('--ti-gr-package')){
  await extendTiGrSourcePackage();
  process.exit(0);
}
if(process.argv.includes('--municipality-labels')){
  await clarifyMunicipalityLabels();
  process.exit(0);
}
if(process.argv.includes('--ag-package')){
  await extendAgSourcePackage();
  process.exit(0);
}
if(process.argv.includes('--areas')){
  await extendAreaAssignments();
  process.exit(0);
}
if(process.argv.includes('--reorder-languages')){
  await reorderWorkbookLanguages();
  process.exit(0);
}
if(process.argv.includes('--languages')){
  await extendWorkbookLanguages();
  process.exit(0);
}

async function completeWorkbookLanguages(){
  const {createHash}=await import('node:crypto');
  const {LANGUAGE_SOURCE_SHA,LANGUAGE_TABLES,createLanguageOverlay,LANGUAGE_NOTES}=await import('./ap18b-complete-labels.mjs');
  const qa=path.join(root,'.work/ap18b-04-labels');
  const out=path.join(root,'outputs/ap18b-04-restkantone-2026-09-13');
  const source=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx');
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),LANGUAGE_SOURCE_SHA);
  await fs.mkdir(qa,{recursive:true});
  const verify=process.argv.includes('--verify');
  const original=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
  const tables=Object.fromEntries(LANGUAGE_TABLES.map(s=>[s.sheet,original.worksheets.getItem(s.sheet).getRange(`A${s.first}:${s.columns.at(-1)}${s.last}`).values]));
  const labels=createLanguageOverlay(tables),patches=[...labels.map(({sheet,cell,value})=>({sheet,cell,value})),...LANGUAGE_NOTES];
  const wb=verify?await SpreadsheetFile.importXlsx(await FileBlob.load(file)):original;
  const sh=name=>wb.worksheets.getItem(name);
  const formulaCachePatches=[];
  const calendarIds=sh('Feiertagskalender').getRange('K7:K489').values.flat();
  for(const label of labels.filter(p=>p.sheet==='Feiertagsregeln')){
    calendarIds.forEach((id,i)=>{if(id===label.id)formulaCachePatches.push({sheet:'Feiertagskalender',cell:`${label.language==='it'?'G':'H'}${i+7}`,value:label.value});});
  }
  assert.equal(formulaCachePatches.length,204);
  for(const p of patches){
    if(verify)assert.equal(sh(p.sheet).getRange(p.cell).values[0][0],p.value);
    else sh(p.sheet).getRange(p.cell).values=[[p.value]];
  }
  wb.recalculate();
  for(const p of formulaCachePatches)assert.equal(sh(p.sheet).getRange(p.cell).values[0][0],p.value);
  for(const spec of LANGUAGE_TABLES)for(const row of sh(spec.sheet).getRange(`${spec.columns[0]}${spec.first}:${spec.columns.at(-1)}${spec.last}`).values)
    for(const value of row)assert.ok(typeof value==='string'&&value.trim()&&value!=='Noch zu erfassen');
  for(const row of sh('Feiertagskalender').getRange('E7:H489').values)for(const value of row)assert.ok(typeof value==='string'&&value.trim()&&value!=='Noch zu erfassen');
  // Check actual dependency recalculation, restore every temporary edit before export.
  const probe=labels.find(p=>p.sheet==='Feiertagsregeln'&&p.language==='it');
  const deps=formulaCachePatches.filter(p=>calendarIds[Number(p.cell.slice(1))-7]===probe.id&&p.cell.startsWith('G'));
  sh(probe.sheet).getRange(probe.cell).values=[['Sprachprobe']];wb.recalculate();
  for(const p of deps)assert.equal(sh(p.sheet).getRange(p.cell).values[0][0],'Sprachprobe');
  sh(probe.sheet).getRange(probe.cell).values=[[probe.value]];
  const year=sh('Übersicht').getRange('B4').values[0][0];
  sh('Übersicht').getRange('B4').values=[[2028]];wb.recalculate();
  assert.equal(sh('Feiertagskalender').getRange('A7').values[0][0],46966);
  sh('Übersicht').getRange('B4').values=[[year]];wb.recalculate();
  for(const p of formulaCachePatches)assert.equal(sh(p.sheet).getRange(p.cell).values[0][0],p.value);
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'V0.11 language-only formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'),errors.ndjson);
  const views=[];
  for(const spec of LANGUAGE_TABLES){
    const rows=[...new Set(labels.filter(p=>p.sheet===spec.sheet).map(p=>Number(p.cell.slice(1))))].sort((a,b)=>a-b);
    for(let i=0;i<rows.length;){let last=i;while(last+1<rows.length&&rows[last+1]===rows[last]+1&&last-i<5)last++;
      views.push([spec.sheet,`${spec.columns[0]}${rows[i]}:${spec.columns.at(-1)}${rows[last]}`]);i=last+1;}
  }
  const calRows=[...new Set(formulaCachePatches.map(p=>Number(p.cell.slice(1))))].sort((a,b)=>a-b);
  for(let i=0;i<calRows.length;){let last=i;while(last+1<calRows.length&&calRows[last+1]===calRows[last]+1&&last-i<5)last++;
    views.push(['Feiertagskalender',`E${calRows[i]}:H${calRows[last]}`]);i=last+1;}
  views.push(['Übersicht','A6:H10'],['Übersicht','A14:H16'],['Übersicht','A29:H36']);
  if(verify){
    for(let i=0;i<views.length;i++){
      const[sheetName,range]=views[i],img=await wb.render({sheetName,range,scale:1.2,format:'png'});
      await fs.writeFile(path.join(qa,`saved-${i+1}.png`),new Uint8Array(await img.arrayBuffer()));
    }
    await fs.writeFile(path.join(qa,'reimport-audit.json'),JSON.stringify({file,passed:true,languageCells:labels.length,dependentLabelCaches:formulaCachePatches.length,inputChangeTest:'passedAndRestored',yearChangeTest:'2028AndRestored',formulaScan:errors.ndjson,views,workbookReexported:false,nativeExcelUiTest:'notPerformed'},null,2)+'\n');
  }else{
    await(await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
    await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,sourceSha256:LANGUAGE_SOURCE_SHA,patches,formulaCachePatches,labels,views,formulaScan:errors.ndjson},null,2)+'\n');
  }
  console.log(JSON.stringify({file,verified:verify,translatedCells:labels.length,textCells:patches.length,cacheCells:formulaCachePatches.length,views:views.length}));
}

async function addProvisionalTiRomanshNames(){
  const {createHash}=await import('node:crypto');
  const qa=path.join(root,'.work/ap18b-02-ti-gr-v08');
  const out=path.join(root,'outputs/ap18b-02-ti-gr-2026-09-13');
  const source=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx');
  const sourceSha256='a66bfff038a284c99f50337e02609a25718473b7a3d810c8e4c69ee455473c40';
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),sourceSha256);
  await fs.mkdir(qa,{recursive:true});
  const verify=process.argv.includes('--verify');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(verify?file:source));
  const sh=name=>wb.worksheets.getItem(name);
  if(process.argv.includes('--inspect-source')){
    console.log((await wb.inspect({kind:'region',sheetId:'Feiertagsregeln',range:'D97:G111',maxChars:2600})).ndjson);
    const preview=await wb.render({sheetName:'Feiertagsregeln',range:'D97:G111',scale:1.2,format:'png'});
    await fs.writeFile(path.join(qa,'source-names.png'),new Uint8Array(await preview.arrayBuffer()));
    return;
  }
  const {PROVISIONAL_TI_RM_LABELS,validateProvisionalTiRmLabels}=await import('./ap18b-rg-labels.mjs');
  validateProvisionalTiRmLabels();
  const rules=sh('Feiertagsregeln').getRange('A7:A122').values.flat();
  const calendar=sh('Feiertagskalender').getRange('K7:K131').values.flat();
  const patches=[],formulaCachePatches=[];
  for(const label of PROVISIONAL_TI_RM_LABELS){
    const row=rules.indexOf(label.ruleId)+7,calendarRow=calendar.indexOf(label.ruleId)+7;
    assert.ok(row>=7&&calendarRow>=7);
    patches.push({sheet:'Feiertagsregeln',cell:`G${row}`,value:label.rm});
    patches.push({sheet:'Feiertagskalender',cell:`N${calendarRow}`,value:'LPAmm-Zuordnung zur Fachprüfung. RG: provisorische Produktübersetzung.'});
    formulaCachePatches.push({sheet:'Feiertagskalender',cell:`H${calendarRow}`,value:label.rm});
    if(!verify)assert.equal(sh('Feiertagsregeln').getRange(`G${row}`).values[0][0],null);
  }
  patches.push(
    {sheet:'Übersicht',cell:'A6',value:'AP18B-02 · V0.8 · TI/GR mit provisorischen RG-Ergänzungen'},
    {sheet:'Übersicht',cell:'A34',value:'TI/GR: vier Sprachspalten befüllt. Acht TI-Namen in RG sind provisorische Produktübersetzungen.'},
    {sheet:'Übersicht',cell:'A36',value:'V0.8 ergänzt acht RG-Namen. Strukturvertrag 0.4.0. Keine neue Rechts- oder Releasefreigabe.'},
    {sheet:'Rechtsquellen',cell:'H13',value:'15 offizielle Tage. IT amtlich, DE/FR Produktübersetzungen. Acht RG-Namen provisorisch ergänzt, keine amtliche TI-Sprachfassung. Kein gesonderter Fassungsstand, Inkrafttreten 09.02.2010.'},
    {sheet:'Quellenprüfung',cell:'G14',value:'15 offizielle Tage. IT amtlich, DE/FR Produktübersetzungen. Acht RG-Namen auf Nutzerwunsch provisorisch ergänzt. Sprachbelege separat dokumentiert, keine amtliche TI-Sprachfassung. Rechtsprüfung und Fachstatus unverändert.'}
  );
  for(const p of patches){
    const range=sh(p.sheet).getRange(p.cell);
    if(verify)assert.equal(range.values[0][0],p.value,`${p.sheet}!${p.cell}`);
    else range.values=[[p.value]];
  }
  wb.recalculate();
  for(const p of formulaCachePatches)assert.equal(sh(p.sheet).getRange(p.cell).values[0][0],p.value);
  const first=PROVISIONAL_TI_RM_LABELS[0];
  const input=patches.find(p=>p.sheet==='Feiertagsregeln'&&p.value===first.rm);
  sh(input.sheet).getRange(input.cell).values=[['RG-Prüftext']];wb.recalculate();
  assert.equal(sh(formulaCachePatches[0].sheet).getRange(formulaCachePatches[0].cell).values[0][0],'RG-Prüftext');
  sh(input.sheet).getRange(input.cell).values=[[first.rm]];wb.recalculate();
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18B-02 V0.8 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  const views=[['Feiertagsregeln','D97:G111'],['Feiertagskalender','E106:H120'],['Feiertagskalender','M107:N118'],['Übersicht','A34:H36'],['Übersicht','A6:H6'],['Rechtsquellen','H13:J13'],['Quellenprüfung','G14:K14']];
  if(verify){
    for(let i=0;i<views.length;i++){
      const[sheetName,range]=views[i],img=await wb.render({sheetName,range,scale:1.2,format:'png'});
      await fs.writeFile(path.join(qa,`saved-${i+1}.png`),new Uint8Array(await img.arrayBuffer()));
    }
    await fs.writeFile(path.join(qa,'reimport-audit.json'),JSON.stringify({file,textCells:patches.length,translatedLabels:8,dependentLabelCaches:8,inputChangeTest:'passedAndRestored',formulaScan:errors.ndjson,views:views.length,workbookReexported:false,nativeExcelUiTest:'notPerformed'},null,2)+'\n');
  }else{
    await(await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
    await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,sourceSha256,patches,formulaCachePatches,labels:PROVISIONAL_TI_RM_LABELS,formulaScan:errors.ndjson},null,2)+'\n');
  }
  console.log(JSON.stringify({file,verified:verify,translatedLabels:8,textCells:patches.length}));
}

async function extendTiGrSourcePackage(){
  const {createHash}=await import('node:crypto');
  const out=path.join(root,'outputs/ap18b-02-ti-gr-2026-09-13');
  const qa=path.join(root,'.work/ap18b-02-ti-gr');
  await fs.mkdir(qa,{recursive:true});
  const source=path.join(root,'outputs/ap18b-01-ag-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.6.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx');
  const sourceSha256='b1c88de49b33a2e702d8387eef150b16791fa30bbc7ce465e01ee30adb3965b2';
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),sourceSha256);
  const verify=process.argv.includes('--verify');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(verify?file:source));
  const sh=name=>wb.worksheets.getItem(name);
  if(process.argv.includes('--inspect-source')){
    console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:4500,tableMaxRows:2,tableMaxCols:4})).ndjson);
    for(const [sheetName,range,label]of [['Feiertagsregeln','D90:I96','regeln'],['Verfahrensbezug','A15:H17','verfahren'],['Geltungsbereiche','A15:C17','gemeinden']]){
      const img=await wb.render({sheetName,range,scale:1.2,format:'png'});
      await fs.writeFile(path.join(qa,`source-${label}.png`),new Uint8Array(await img.arrayBuffer()));
    }
    return;
  }
  const {createTiGrPackageModel}=await import('./ap18b-ti-gr-model.mjs');
  const m=await createTiGrPackageModel(root);
  const agChecks=JSON.parse(await fs.readFile(path.join(root,'.work/ap18b-01-ag/checks.json'),'utf8'));
  const entries=[...agChecks.entries,...m.additions.rules.map(r=>({scopeId:r.scope,ruleId:r.id}))];
  const patches=[],specs=[];
  const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
  const d=s=>s?new Date(`${s}T00:00:00Z`):null;
  const serial=s=>s?Math.round((new Date(`${s}T00:00:00Z`)-new Date('1899-12-30T00:00:00Z'))/86400000):null;
  const set=(name,range,values)=>{sh(name).getRange(range).values=values;patches.push({name,range});};
  const formula=(name,range,values)=>{sh(name).getRange(range).formulas=values;patches.push({name,range});};
  const append=(name,oldCount,rows)=>{
    const s=sh(name),last=col(rows[0].length-1),oldEnd=6+oldCount,end=oldEnd+rows.length;
    specs.push({name,oldEnd,end,last,tableName:s.tables.items[0].name});
    for(let r=oldEnd+1;r<=end;r++){
      const template=oldEnd-((oldEnd-r)%2===0?0:1);
      s.getRange(`A${r}:${last}${r}`).copyFrom(s.getRange(`A${template}:${last}${template}`),'all');
      s.getRange(`A${r}:${last}${r}`).format.rowHeight=['Feiertagsregeln','Feiertagskalender'].includes(name)?42:name==='Verfahrensbezug'?110:82;
    }
    set(name,`A${oldEnd+1}:${last}${end}`,rows);
  };
  const sourceNotesStart=38,notesStart=6+m.assignments.length+3;
  if(!verify){
    await fs.mkdir(out,{recursive:true});
    append('Feiertagsregeln',90,m.additions.rules.map(r=>[r.id,r.jurisdiction,r.scope,r.de,r.fr,r.it??'',r.rm??'',r.category,r.calculation.type,r.calculation.month??null,r.calculation.day??null,r.calculation.offsetDays??null,r.calculation.isoWeekday??null,r.calculation.occurrence??null,d(r.from),d(r.to),r.priority,r.status,r.approvalBasis,r.action,r.target,r.exportClass,null,null,r.source,r.locator]));
    for(let r=97;r<=6+m.rules.length;r++){
      sh('Feiertagsregeln').getRange(`W${r}:X${r}`).copyFrom(sh('Feiertagsregeln').getRange('W96:X96'),'formulas');
      patches.push({name:'Feiertagsregeln',range:`W${r}:X${r}`});
    }
    append('Geltungsbereiche',11,m.additions.scopes.map(r=>[r[0],r[1],r[2],m.scopeLabels?.[r[0]]?.fr??'',m.scopeLabels?.[r[0]]?.it??'',m.scopeLabels?.[r[0]]?.rm??'',r[3],r[4],r[5],r[6],r[7],d(r[8]),d(r[9])]));
    append('Rechtsquellen',6,m.additions.sources.map(r=>[...r.slice(0,4),'Amtliche Quelle öffnen',d(r[5]),d(r[6]),...r.slice(7),r[4]]));
    append('Verfahrensbezug',11,m.additions.mappings);
    append('Quellenprüfung',7,m.additions.reviews.map(r=>[...r.slice(0,3),d(r[3]),...r.slice(4)]));
    const notes=sh('Gebietszuordnungen').getRange(`A${sourceNotesStart}:A${sourceNotesStart+4}`).values;
    sh('Gebietszuordnungen').getRange(`A${notesStart}:A${notesStart+4}`).copyFrom(sh('Gebietszuordnungen').getRange(`A${sourceNotesStart}:A${sourceNotesStart+4}`),'all');
    for(let r=sourceNotesStart;r<notesStart;r++)set('Gebietszuordnungen',`A${r}`,[[null]]);
    set('Gebietszuordnungen',`A${notesStart}:A${notesStart+4}`,notes);
    append('Gebietszuordnungen',29,m.additions.assignments.map(a=>[a.id,a.scopeId,a.areaId,a.de,a.fr,a.it,a.rm,a.areaType,a.parentAreaId,a.effect,a.officialIdSystem,a.officialId,d(a.from),d(a.to),a.sourceId,a.locator,a.status,a.note]));
    const newEntries=entries.slice(agChecks.entries.length);
    append('Feiertagskalender',99,newEntries.map(e=>{
      const r=m.rules.find(r=>r.id===e.ruleId),scope=m.scopes.find(s=>s[0]===e.scopeId);
      return [null,null,r.jurisdiction,scope[2],null,null,null,null,null,'open',r.id,null,null,r.jurisdiction==='CH-GR'?'Kantonale Grundliste. VRG-Annahme und örtliche Fristwirkung offen':'Offizielle Feiertage. LPAmm-Zuordnung zur Fachprüfung'];
    }));
    // Existing calendar formulas are bounded to the unchanged source rows and stay untouched.
    newEntries.forEach((e,i)=>{
      const row=106+i,last=6+m.rules.length;
      const lookup=c=>`INDEX('Feiertagsregeln'!$${c}$7:$${c}$${last},MATCH($K${row},'Feiertagsregeln'!$A$7:$A$${last},0))`;
      for(const[dest,src]of [['A','X'],['E','D'],['F','E'],['I','H'],['L','Y'],['M','Z']])formula('Feiertagskalender',`${dest}${row}`,[[`=${lookup(src)}`]]);
      for(const[dest,src]of [['G','F'],['H','G']])formula('Feiertagskalender',`${dest}${row}`,[[`=IF(${lookup(src)}="","Noch zu erfassen",${lookup(src)})`]]);
      formula('Feiertagskalender',`B${row}`,[[`=IF(ISNUMBER(A${row}),CHOOSE(WEEKDAY(A${row},2),"Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"),"n.a.")`]]);
    });
    for(const code of ['CH-TI','CH-GR']){
      const i=m.jurisdictions.findIndex(r=>r[0]===code),row=i+7;
      set('Gemeinwesen',`D${row}:E${row}`,[[m.jurisdictionLabels?.[code]?.it??'',m.jurisdictionLabels?.[code]?.rm??'']]);
      set('Gemeinwesen',`G${row}:I${row}`,[[`AP18B-02, kantonale Normliste erfasst, Fachabnahme offen`,'open',m.additions.sources.find(s=>s[1]===code)?.[4]??'']]);
    }
    set('Übersicht','A6',[['AP18B-02 · V0.7 · Tessin und Graubünden zur Fachprüfung']]);
    set('Übersicht','A8',[['22 Kantone noch nicht erhoben. Erfasste Kantonsregeln bleiben bis zur Fachabnahme offen.']]);
    set('Übersicht','A9',[['CH/BE/AG unverändert. TI und GR mit Namensfeldern DE/FR/IT/RG ergänzt.']]);
    set('Übersicht','A10',[['GR nur kantonale Grundliste. Lokale Ruhetage nicht erhoben, VRG-Annahme dokumentiert.']]);
    set('Übersicht','A26',[['Offene Kantonsregeln']]);
    formula('Übersicht','B26',[[`=COUNTIFS('Feiertagsregeln'!$R$7:$R$${6+m.rules.length},"open")`]]);
    set('Übersicht','A34',[['TI/GR: IT und RG quellenbasiert ergänzt. Acht TI-Namen in RG noch offen. Sprachfreigabe ausstehend.']]);
    set('Übersicht','A36',[['V0.7 ergänzt TI/GR. Strukturvertrag 0.4.0. Keine neue Daten- oder Releasefreigabe.']]);
    set('Feiertagskalender','A4',[['CH/BE/AG unverändert. TI: 15 offizielle Tage. GR: kantonale Grundliste, keine lokalen Ruhetage. Fristwirkung gesondert prüfen.']]);
  }
  const originalYear=sh('Übersicht').getRange('B4').values[0][0];
  let dateChecks=0,calendarChecks=0;
  for(const year of [2026,2027,2028]){
    sh('Übersicht').getRange('B4').values=[[year]];wb.recalculate();
    sh('Feiertagsregeln').getRange(`X7:X${6+m.rules.length}`).values.forEach((r,i)=>{assert.equal(r[0],serial(ruleDate(m.rules[i],year)),m.rules[i].id);dateChecks++;});
    sh('Feiertagskalender').getRange(`A7:A${6+entries.length}`).values.forEach((r,i)=>{assert.equal(r[0],serial(ruleDate(m.rules.find(r=>r.id===entries[i].ruleId),year)));calendarChecks++;});
    assert.deepEqual(sh('Übersicht').getRange('B24:B26').values,[[27],[12],[m.rules.length-12]]);
  }
  sh('Feiertagsregeln').getRange('F97').values=[['IT-Prüftext']];wb.recalculate();
  assert.equal(sh('Feiertagskalender').getRange('G106').values[0][0],'IT-Prüftext');
  sh('Feiertagsregeln').getRange('F97').values=[[m.additions.rules[0].it??'']];
  sh('Übersicht').getRange('B4').values=[[originalYear]];wb.recalculate();
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18B-02 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  const views=[['Übersicht','A6:H26'],['Gemeinwesen','A24:I28'],['Feiertagsregeln','D97:I111'],['Feiertagsregeln','D112:I122'],['Feiertagsregeln','R112:Z122'],['Feiertagskalender','A106:I120'],['Feiertagskalender','A121:I131'],['Feiertagskalender','I121:N131'],['Geltungsbereiche','A18:M19'],['Gebietszuordnungen',`A36:R37`],['Rechtsquellen',`D13:K${6+m.sources.length}`],['Verfahrensbezug',`B18:H${6+m.mappings.length}`],['Quellenprüfung',`C14:K${6+m.reviews.length}`],['Übersicht','A31:H36'],['Gebietszuordnungen',`A${notesStart}:H${notesStart+4}`],['Rechtsquellen',`A13:D${6+m.sources.length}`]];
  if(verify){
    for(let i=0;i<views.length;i++){
      const[sheetName,range]=views[i],img=await wb.render({sheetName,range,scale:1.2,format:'png'});
      await fs.writeFile(path.join(qa,`saved-${String(i+1).padStart(2,'0')}-${sheetName}.png`),new Uint8Array(await img.arrayBuffer()));
    }
    await fs.writeFile(path.join(qa,'reimport-audit.json'),JSON.stringify({file,dateChecks,calendarChecks,formulaScan:errors.ndjson,views:views.length,restoredYear:originalYear,nativeExcelTest:'notPerformed',workbookReexported:false},null,2)+'\n');
  }else{
    await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
    await fs.writeFile(path.join(qa,'model.json'),JSON.stringify(m,null,2)+'\n');
    await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,sourceSha256,workbookRevision:'0.7',contract:'0.4.0',patches,specs,dateChecks,calendarChecks,originalYear,views,entries,sourceNotesStart,notesStart,sourceUrls:m.sources.map(s=>s[4]),rules:m.rules.length,calendarRows:entries.length,formulaScan:errors.ndjson},null,2)+'\n');
  }
  console.log(JSON.stringify({file,verified:verify,dateChecks,calendarChecks}));
}

async function clarifyMunicipalityLabels(){
  const {createAgPackageModel}=await import('./ap18b-ag-model.mjs');
  const {createHash}=await import('node:crypto');
  const out=path.join(root,'outputs/ap18b-01-ag-2026-09-13');
  const qa=path.join(root,'.work/ap18b-01-ag-v06');
  await fs.mkdir(qa,{recursive:true});
  const source=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.5.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.6.xlsx');
  const sourceSha256='29990c2b7f53112603f22c6ca9df5c127540907c104b992be81df3803ebdb825';
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),sourceSha256);
  const verify=process.argv.includes('--verify');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(verify?file:source));
  const model=await createAgPackageModel(root);
  const patches=[
    {sheet:'Übersicht',cell:'A6',value:'AP18B-01 · V0.6 · Quellenpaket Aargau zur Fachprüfung'},
    {sheet:'Übersicht',cell:'A36',value:'V0.6 nennt die Rheinfelder Gemeinden direkt. Strukturvertrag 0.4.0, keine Daten- oder Releasefreigabe.'},
  ];
  for(const [row,branch] of [[15,'e1'],[16,'e2']]){
    const profile=model.profiles.find(p=>p.branch===branch);
    assert.equal(wb.worksheets.getItem('Geltungsbereiche').getRange(`A${row}`).values[0][0],profile.scopeId);
    const members=profile.members;
    patches.push({sheet:'Geltungsbereiche',cell:`C${row}`,value:`Gemeinden ${members.slice(0,-1).join(', ')} und ${members.at(-1)}`});
  }
  for(const p of patches){
    const cell=wb.worksheets.getItem(p.sheet).getRange(p.cell);
    if(verify)assert.equal(cell.values[0][0],p.value);
    else cell.values=[[p.value]];
  }
  wb.recalculate();
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18B-01 V0.6 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  if(verify){
    const views=[['Geltungsbereiche','A15:C16','gemeinden'],['Geltungsbereiche','G15:M16','quellen'],['Übersicht','A36:H36','revision'],['Übersicht','A6:H6','titel']];
    for(const [sheetName,range,label] of views){
      const preview=await wb.render({sheetName,range,scale:1.5,format:'png'});
      await fs.writeFile(path.join(qa,`saved-${label}.png`),new Uint8Array(await preview.arrayBuffer()));
    }
    await fs.writeFile(path.join(qa,'reimport-audit.json'),JSON.stringify({file,verifiedCells:patches.length,formulaScan:errors.ndjson,renderedViews:views.length,workbookReexported:false},null,2)+'\n');
  }else{
    await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
    await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,sourceSha256,patches,formulaScan:errors.ndjson},null,2)+'\n');
  }
  console.log(JSON.stringify({file,verified:verify,changedCells:patches.length}));
}

async function extendAgSourcePackage(){
  const {createAgPackageModel,validateAgPackageModel}=await import('./ap18b-ag-model.mjs');
  const {createHash}=await import('node:crypto');
  const out=path.join(root,'outputs/ap18b-01-ag-2026-09-13');
  const qa=path.join(root,'.work/ap18b-01-ag');
  await fs.mkdir(qa,{recursive:true});await fs.mkdir(out,{recursive:true});
  const source=path.join(root,'outputs/ap18a-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.4.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.5.xlsx');
  assert.equal(createHash('sha256').update(await fs.readFile(source)).digest('hex'),'11f47723d4bd9961e177bf0401c015899f41d847e56a32141d72bf82876cd597');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
  const m=await createAgPackageModel(root);validateAgPackageModel(m);
  const base=await createPilotModel(root);
  const patches=[];const specs=[];
  const sh=n=>wb.worksheets.getItem(n);
  const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
  const d=s=>s?new Date(`${s}T00:00:00Z`):null;
  const serial=s=>Math.round((new Date(`${s}T00:00:00Z`)-new Date('1899-12-30T00:00:00Z'))/86400000);
  const set=(name,range,values)=>{sh(name).getRange(range).values=values;patches.push({name,range});};
  const formula=(name,range,values)=>{sh(name).getRange(range).formulas=values;patches.push({name,range});};
  const addRows=(name,oldCount,rows)=>{
    const s=sh(name),last=col(rows[0].length-1),oldEnd=6+oldCount,end=6+rows.length;
    specs.push({name,oldEnd,end,last,tableName:s.tables.items[0].name});
    for(let row=oldEnd+1;row<=end;row++){
      s.getRange(`A${row}:${last}${row}`).copyFrom(s.getRange(`A${oldEnd}:${last}${oldEnd}`),'all');
      s.getRange(`A${row}:${last}${row}`).format.fill=row%2?'#E7EEEE':'#FFFFFF';
      s.getRange(`A${row}:${last}${row}`).format.rowHeight=name==='Gebietszuordnungen'?58:38;
    }
    if(rows.length>oldCount)set(name,`A${oldEnd+1}:${last}${end}`,rows.slice(oldCount));
  };
  const ruleRows=m.rules.map(r=>[r.id,r.jurisdiction,r.scope,r.de,r.fr,r.it??'',r.rm??'',r.category,r.calculation.type,r.calculation.month??null,r.calculation.day??null,r.calculation.offsetDays??null,r.calculation.isoWeekday??null,r.calculation.occurrence??null,d(r.from),d(r.to),r.priority,r.status,r.approvalBasis,r.action,r.target,r.exportClass,null,null,r.source,r.locator]);
  addRows('Feiertagsregeln',15,ruleRows);
  const lastRule=6+m.rules.length;
  for(let r=22;r<=lastRule;r++){
    sh('Feiertagsregeln').getRange(`W${r}:X${r}`).copyFrom(sh('Feiertagsregeln').getRange('W21:X21'),'formulas');
    patches.push({name:'Feiertagsregeln',range:`W${r}:X${r}`});
  }
  const scopeRows=m.scopes.map(r=>[r[0],r[1],r[2],'','','',r[3],r[4],r[5],r[6],r[7],d(r[8]),d(r[9])]);
  addRows('Geltungsbereiche',5,scopeRows);
  const sourceRows=m.sources.map(r=>[...r.slice(0,4),'Amtliche Quelle öffnen',d(r[5]),d(r[6]),...r.slice(7),r[4]]);
  addRows('Rechtsquellen',5,sourceRows);
  for(let i=2;i<m.sources.length;i++)set('Rechtsquellen',`A${i+7}:K${i+7}`,[sourceRows[i]]);
  addRows('Verfahrensbezug',4,m.mappings);
  for(let i=2;i<4;i++)set('Verfahrensbezug',`A${i+7}:H${i+7}`,[m.mappings[i]]);
  addRows('Quellenprüfung',4,m.reviews.map(r=>[...r.slice(0,3),d(r[3]),...r.slice(4)]));
  const areaRows=m.assignments.map(a=>[a.id,a.scopeId,a.areaId,a.de,a.fr,a.it,a.rm,a.areaType,a.parentAreaId,a.effect,a.officialIdSystem,a.officialId,d(a.from),d(a.to),a.sourceId,a.locator,a.status,a.note]);
  const notes=sh('Gebietszuordnungen').getRange('A15:A19').values;
  // Existing off-table notes move below the explicitly added rows.
  const notesStart=areaRows.length+9;
  sh('Gebietszuordnungen').getRange(`A${notesStart}:A${notesStart+4}`).copyFrom(sh('Gebietszuordnungen').getRange('A15:A19'),'all');
  set('Gebietszuordnungen',`A${notesStart}:A${notesStart+4}`,notes);
  set('Gebietszuordnungen',`A${notesStart+3}`,[['Erfasst sind nur die für das Quellenpaket benötigten Gebiete. Amtliche Kennungen bleiben noch offen.']]);
  set('Gebietszuordnungen',`A${notesStart+4}`,[['Änderungen an Gebietszuordnungen benötigen eine kontrollierte Neugenerierung des Kalenders. Keine automatische Ortsauflösung.']]);
  addRows('Gebietszuordnungen',6,areaRows);
  for(const name of ['Geltungsbereiche','Rechtsquellen','Verfahrensbezug','Quellenprüfung']){
    const spec=specs.find(s=>s.name===name);
    if(spec.end>spec.oldEnd)sh(name).getRange(`A${spec.oldEnd+1}:${spec.last}${spec.end}`).format.rowHeight=68;
  }
  const agRow=m.jurisdictions.findIndex(r=>r[0]==='CH-AG')+7;
  set('Gemeinwesen',`G${agRow}:H${agRow}`,[[m.jurisdictions[agRow-7][4],'open']]);
  const entries=[];
  for(const scope of base.scopes)for(const rule of base.rules){
    if(rule.scope===scope[0]||(scope[0]==='BE-ALL'&&rule.scope==='CH-ALL'))entries.push({scopeId:scope[0],ruleId:rule.id});
  }
  for(const rule of m.rules.slice(15))entries.push({scopeId:rule.scope,ruleId:rule.id});
  for(const p of m.profiles.filter(p=>p.kind==='labour'))entries.push({scopeId:p.scopeId,ruleId:'CH-CAL-HOL-NATIONAL-DAY'});
  assert.equal(entries.length,99);
  const rows=entries.map(e=>{
    const scope=m.scopes.find(s=>s[0]===e.scopeId);
    return [null,null,scope[1],scope[2],null,null,null,null,null,null,e.ruleId,null,null,e.scopeId.startsWith('AG-')?'Normliste erfasst, Fachfreigabe offen':e.scopeId==='CH-ALL'?'Nur Bundesfeiertag':'Referenzbestand'];
  });
  addRows('Feiertagskalender',16,rows);
  const lookup=(row,c)=>`INDEX('Feiertagsregeln'!$${c}$7:$${c}$${lastRule},MATCH($K${row},'Feiertagsregeln'!$A$7:$A$${lastRule},0))`;
  entries.forEach((e,i)=>{
    const row=i+7;
    for(const [dest,src]of[['A','X'],['E','D'],['F','E'],['I','H'],['L','Y'],['M','Z']])formula('Feiertagskalender',`${dest}${row}`,[[`=${lookup(row,src)}`]]);
    for(const [dest,src]of[['G','F'],['H','G']])formula('Feiertagskalender',`${dest}${row}`,[[`=IF(${lookup(row,src)}="","Noch zu erfassen",${lookup(row,src)})`]]);
    formula('Feiertagskalender',`B${row}`,[[`=IF(ISNUMBER(A${row}),CHOOSE(WEEKDAY(A${row},2),"Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"),"n.a.")`]]);
    // A released CH rule does not release its new application to an AG profile.
    if(e.scopeId.startsWith('AG-'))set('Feiertagskalender',`J${row}`,[['open']]);
    else formula('Feiertagskalender',`J${row}`,[[`=${lookup(row,'R')}`]]);
    if(i<16&&e.scopeId.startsWith('AG-'))set('Feiertagskalender',`N${row}`,[[rows[i][13]]]);
  });
  set('Feiertagskalender','A4',[['§ 6 EG ArR und § 21 EG ZPO getrennt erfasst. Jahr ändern und nach Geltungsbereich filtern. Keine AG-Fristenfreigabe.']]);
  set('Übersicht','A6',[['AP18B-01 · V0.5 · Quellenpaket Aargau zur Fachprüfung']]);
  set('Übersicht','A9',[['CH/BE: unveränderte Referenzregeln. AG: § 6 EG ArR und § 21 EG ZPO erfasst.']]);
  set('Übersicht','A10',[['Aargau: acht regionale Arbeitsrechtslisten und eine prozessuale Liste. Fachfreigabe offen.']]);
  set('Übersicht','A26',[['Offene AG-Regeln']]);
  formula('Übersicht','B25',[[`=COUNTIFS('Feiertagsregeln'!$R$7:$R$${lastRule},"approved")`]]);
  formula('Übersicht','B26',[[`=COUNTIFS('Feiertagsregeln'!$R$7:$R$${lastRule},"open")`]]);
  set('Übersicht','A36',[['V0.5 ergänzt das Quellenpaket AG. Strukturvertrag 0.4.0, keine Daten- oder Releasefreigabe.']]);
  const originalYear=sh('Übersicht').getRange('B4').values[0][0];
  let dateChecks=0,calendarChecks=0;
  for(const year of [2026,2027,2028]){
    sh('Übersicht').getRange('B4').values=[[year]];wb.recalculate();
    sh('Feiertagsregeln').getRange(`X7:X${lastRule}`).values.forEach((r,i)=>{assert.equal(r[0],serial(ruleDate(m.rules[i],year)),m.rules[i].id);dateChecks++;});
    sh('Feiertagskalender').getRange('A7:A105').values.forEach((r,i)=>{assert.equal(r[0],serial(ruleDate(m.rules.find(x=>x.id===entries[i].ruleId),year)));calendarChecks++;});
    assert.deepEqual(sh('Übersicht').getRange('B24:B26').values,[[27],[12],[78]]);
    for(const p of m.profiles){const dates=entries.filter(e=>e.scopeId===p.scopeId).map(e=>ruleDate(m.rules.find(r=>r.id===e.ruleId),year));assert.equal(dates.length,p.kind==='labour'?9:14);assert.equal(new Set(dates).size,dates.length);}
  }
  // Verify propagation of a new editable name without retaining the QA input.
  sh('Feiertagsregeln').getRange('F22').values=[['IT-Prüftext']];wb.recalculate();
  const testIndex=entries.findIndex(e=>e.ruleId===m.rules[15].id);
  assert.equal(sh('Feiertagskalender').getRange(`G${testIndex+7}`).values[0][0],'IT-Prüftext');
  sh('Feiertagsregeln').getRange('F22').values=[['']];
  sh('Übersicht').getRange('B4').values=[[originalYear]];wb.recalculate();
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18B-01 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
  const views=[['Übersicht','A6:H26'],['Gemeinwesen',`A${agRow-1}:I${agRow+1}`],['Feiertagsregeln','A19:I26'],['Feiertagsregeln',`O${lastRule-5}:Z${lastRule}`],['Feiertagskalender','A96:N105'],['Geltungsbereiche',`A10:M${6+m.scopes.length}`],['Gebietszuordnungen','A25:J35'],['Gebietszuordnungen',`J29:R35`],['Rechtsquellen',`D9:K${6+m.sources.length}`],['Verfahrensbezug',`B9:H${6+m.mappings.length}`],['Quellenprüfung',`C11:K${6+m.reviews.length}`],['Gebietszuordnungen',`A${notesStart}:H${notesStart+4}`]];
  await fs.writeFile(path.join(qa,'model.json'),JSON.stringify(m,null,2)+'\n');
  await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,workbookRevision:'0.5',contract:'0.4.0',patches,specs,dateChecks,calendarChecks,originalYear,views,entries,notesStart,sourceUrls:m.sources.map(s=>s[4]),formulaScan:errors.ndjson},null,2)+'\n');
  console.log(JSON.stringify({file,rules:m.rules.length,calendarRows:entries.length,dateChecks,calendarChecks,nativeCompletionPending:true}));
}

async function extendAreaAssignments(){
  const {createAreaAssignments,validateAreaAssignments,ASSIGNMENT_HEADERS,BJ_HINTS_URL}=await import('./ap18a-area-assignments.mjs');
  const out=path.join(root,'outputs/ap18a-2026-09-13');
  const qa=path.join(root,'.work/ap18a/qa-v04');
  await fs.mkdir(qa,{recursive:true});
  const source=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.3.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.4.xlsx');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
  const model=await createPilotModel(root);
  const assignments=createAreaAssignments(model);
  assert.equal(validateAreaAssignments(assignments,model),true);
  const start=wb.worksheets.getItem('Übersicht');
  start.getRange('A6').values=[['AP18A · V0.4 mit strukturierten Gebietszuordnungen']];
  start.getRange('A30').values=[['Gebietszuordnungen erfassen Ein- und Ausschlüsse. Ortssuche und Export folgen separat.']];
  start.getRange('A36').values=[['V0.4 ergänzt Gebietszuordnungen als offene Prüfgrundlage und aktualisiert den BJ-Quellenlink.']];
  const sources=wb.worksheets.getItem('Rechtsquellen');
  assert.equal(sources.getRange('A11').values[0][0],'SRC-BJ-FRISTENHINWEISE-20121217');
  sources.getRange('E11').values=[['Amtliche Quelle öffnen']];
  sources.getRange('H11').values=[['Neue amtliche URL am 13.09.2026 geprüft. Methodischer Hinweis, keine aktuelle Feiertagsvollerhebung.']];
  const sheet=wb.worksheets.add('Gebietszuordnungen');
  const end=6+assignments.length;
  const col=i=>String.fromCharCode(65+i);
  const day=s=>s?new Date(`${s}T00:00:00Z`):null;
  const values=assignments.map(a=>[a.id,a.scopeId,a.areaId,a.de,a.fr,a.it,a.rm,a.areaType,a.parentAreaId,a.effect,a.officialIdSystem,a.officialId,day(a.from),day(a.to),a.sourceId,a.locator,a.status,a.note]);
  sheet.showGridLines=false;
  sheet.getRange('A1:R19').format={font:{name:'Arial',size:10,color:'#172126'},rowHeight:24,verticalAlignment:'center'};
  sheet.getRange('A2').values=[['Gebietszuordnungen und räumliche Ausnahmen']];
  sheet.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:'#122C40'};
  sheet.getRange('A3:R3').format.borders={bottom:{style:'thin',color:'#A6532D'}};
  sheet.getRange('A4').values=[['Ein Geltungsbereich umfasst die eingeschlossenen Gebiete abzüglich der ausgeschlossenen Gebiete. Keine automatische Fristwirkung.']];
  sheet.getRange('A4').format.font={name:'Arial',size:10,italic:true,color:'#566168'};
  sheet.getRange(`A6:R${end}`).values=[ASSIGNMENT_HEADERS,...values];
  const table=sheet.tables.add(`A6:R${end}`,true,'AP18_Gebietszuordnungen');
  table.style='TableStyleLight1';table.showFilterButton=true;
  sheet.getRange('A6:R6').format={fill:'#122C40',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,rowHeight:42};
  sheet.getRange(`A7:R${end}`).format.wrapText=true;
  sheet.getRange(`A7:R${end}`).format.rowHeight=58;
  for(let r=7;r<=end;r++)sheet.getRange(`A${r}:R${r}`).format.fill=r%2?'#E7EEEE':'#FFFFFF';
  const widths=[31,31,33,33,32,32,32,18,33,15,22,23,16,16,42,32,16,59];
  widths.forEach((w,i)=>sheet.getRange(`${col(i)}1:${col(i)}19`).format.columnWidth=w);
  sheet.getRange(`M7:N${end}`).setNumberFormat('dd"."mm"."yyyy');
  for(const c of ['E','F','G','K','L'])sheet.getRange(`${c}7:${c}${end}`).conditionalFormats.add('containsBlanks',{format:{fill:'#FFF1CB'}});
  sheet.getRange(`H7:H${end}`).dataValidation={rule:{type:'list',values:['Bund','Kanton','Bezirk','Gemeinde','Ortsteil','Gebietsgruppe']}};
  sheet.getRange(`J7:J${end}`).dataValidation={rule:{type:'list',values:['include','exclude']}};
  sheet.getRange(`Q7:Q${end}`).dataValidation={rule:{type:'list',values:['open','blocked']}};
  sheet.getRange(`Q7:Q${end}`).conditionalFormats.add('containsText',{text:'open',format:{fill:'#FFF1CB',font:{color:'#785300'}}});
  sheet.getRange(`Q7:Q${end}`).conditionalFormats.add('containsText',{text:'blocked',format:{fill:'#FCE3DE',font:{color:'#9B2920'}}});
  sheet.freezePanes.freezeRows(6);
  const notes=[
    'include = einschliessen, exclude = ausschliessen. Neue Zuordnungen sind open, keine zusätzliche Fachfreigabe.',
    'GEO-IDs sind interne Kennungen. Amtliche Gebietskennungen sind noch zu erfassen und zu prüfen.',
    'Übergeordnetes Gebiet beschreibt nur Geografie. Daraus werden keine Feiertagsregeln vererbt.',
    'Ortsteile und Gebietsgruppen sind vorgesehen. Es werden nur die sechs vorhandenen Pilotzuordnungen erfasst.',
    'Die Kalenderansicht bleibt unverändert. Änderungen hier lösen noch keine Ortsauflösung oder Kalenderneuberechnung aus.'
  ];
  notes.forEach((v,i)=>sheet.getRange(`A${15+i}`).values=[[v]]);
  const originalYear=start.getRange('B4').values[0][0];
  const rules=wb.worksheets.getItem('Feiertagsregeln');
  const serial=s=>Math.round((new Date(s+'T00:00:00Z')-new Date('1899-12-30T00:00:00Z'))/86400000);
  let dateChecks=0;
  for(const year of [2026,2027,2028]){
    start.getRange('B4').values=[[year]];wb.recalculate();
    rules.getRange('X7:X21').values.forEach((r,i)=>{assert.equal(r[0],serial(ruleDate(model.rules[i],year)));dateChecks++;});
    assert.deepEqual(start.getRange('B24:B26').values,[[27],[12],[3]]);
  }
  start.getRange('B4').values=[[originalYear]];wb.recalculate();
  assert.equal(sheet.getRange(`A7:R${end}`).values.length,6);
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18A V0.4 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
  const views=[['Übersicht','A29:H36'],['Rechtsquellen','D9:H11'],['Gebietszuordnungen','A6:J12'],['Gebietszuordnungen','J6:R12'],['Gebietszuordnungen','A15:H19']];
  await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,workbookRevision:'0.4',contract:'0.4.0',resultColumn:'X',dateChecks,originalYear,views,formulaScan:errors.ndjson,assignments,headers:ASSIGNMENT_HEADERS,bjUrl:BJ_HINTS_URL},null,2)+'\n');
  console.log(JSON.stringify({file,dateChecks,assignments:assignments.length,nativeCompletionPending:true}));
}

async function reorderWorkbookLanguages(){
  const out=path.join(root,'outputs/ap18a-2026-09-13');
  const qa=path.join(root,'.work/ap18a/qa-v03');
  const source=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.2.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.3.xlsx');
  // Native relocation is performed by reorder-ap18a-workbook.py prepare.
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(qa,'relocated-native.xlsx')));
  const start=wb.worksheets.getItem('Übersicht');
  const rules=wb.worksheets.getItem('Feiertagsregeln');
  const calendar=wb.worksheets.getItem('Feiertagskalender');
  const scopes=wb.worksheets.getItem('Geltungsbereiche');
  start.getRange('A6').values=[['AP18A · V0.3 mit zusammenhängenden Sprachspalten DE / FR / IT / RG']];
  start.getRange('A36').values=[['Excel-Interaktion V0.2 durch David Steimer bestätigt. V0.3 ordnet die Sprachspalten neu.']];
  scopes.getRange('D6').values=[['Französisch']];
  scopes.getRange('D7:D11').values=Array.from({length:5},()=>['']);
  const originalYear=start.getRange('B4').values[0][0];
  const model=await createPilotModel(root);
  const serial=s=>Math.round((new Date(s+'T00:00:00Z')-new Date('1899-12-30T00:00:00Z'))/86400000);
  let dateChecks=0;
  for(const year of [2026,2027,2028]){
    start.getRange('B4').values=[[year]];wb.recalculate();
    rules.getRange('X7:X21').values.forEach((row,i)=>{assert.equal(row[0],serial(ruleDate(model.rules[i],year)));dateChecks++;});
    assert.deepEqual(start.getRange('B24:B26').values,[[27],[12],[3]]);
  }
  start.getRange('B4').values=[[originalYear]];
  rules.getRange('F7:G7').values=[['IT-Probe','RG-Probe']];wb.recalculate();
  assert.deepEqual(calendar.getRange('G7:H8').values,[['IT-Probe','RG-Probe'],['IT-Probe','RG-Probe']]);
  rules.getRange('F7:G7').values=[['','']];wb.recalculate();
  assert.deepEqual(calendar.getRange('G7:H8').values,[['Noch zu erfassen','Noch zu erfassen'],['Noch zu erfassen','Noch zu erfassen']]);
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18A V0.3 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(qa,'artifact-export.xlsx'));
  const views=[['Übersicht','A29:H36'],['Gemeinwesen','A6:F12'],['Feiertagsregeln','C6:I12'],['Geltungsbereiche','B6:G11'],['Feiertagskalender','D6:J13']];
  await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,workbookRevision:'0.3',contract:'0.3.0',resultColumn:'X',dateChecks,languagePropagation:true,missingNameMarker:true,originalYear,views,formulaScan:errors.ndjson},null,2)+'\n');
  console.log(JSON.stringify({file,dateChecks,languagePropagation:true,views:views.length,nativeReconciliationPending:true}));
}

async function extendWorkbookLanguages(){
  const out=path.join(root,'outputs/ap18a-2026-09-13');
  const qa=path.join(root,'.work/ap18a/qa-v02');
  await fs.mkdir(qa,{recursive:true});
  const source=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.1.xlsx');
  const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.2.xlsx');
  const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
  const specs=[
    {sheet:'Gemeinwesen',columns:['H','I'],end:33},
    {sheet:'Feiertagsregeln',columns:['Y','Z'],end:21},
    {sheet:'Geltungsbereiche',columns:['K','L'],end:11},
    {sheet:'Feiertagskalender',columns:['M','N'],end:22}
  ];
  const labels=['Italienisch','Rumantsch Grischun'];
  for(const spec of specs){
    const sheet=wb.worksheets.getItem(spec.sheet);
    spec.columns.forEach((column,index)=>{
      const range=sheet.getRange(`${column}6:${column}${spec.end}`);
      // New columns inherit the existing typography, row heights and banding.
      range.copyFrom(sheet.getRange(`A6:A${spec.end}`),'all');
      range.clear({applyTo:'contents'});
      range.format.columnWidth=32;
      range.format.font={name:'Arial',size:10,color:'#172126'};
      range.format.verticalAlignment='center';
      range.format.wrapText=true;
      sheet.getRange(`${column}6`).values=[[labels[index]]];
      sheet.getRange(`${column}6`).format={fill:'#122C40',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true};
      const body=sheet.getRange(`${column}7:${column}${spec.end}`);
      body.values=[['']];
      body.format.horizontalAlignment='left';
      for(let row=7;row<=spec.end;row++)sheet.getRange(`${column}${row}`).format.fill=row%2?'#E7EEEE':'#FFFFFF';
      if(spec.sheet!=='Feiertagskalender'){
        body.conditionalFormats.add('containsBlanks',{format:{fill:'#FFF1CB'}});
      }
    });
  }
  const rules=wb.worksheets.getItem('Feiertagsregeln');
  const calendar=wb.worksheets.getItem('Feiertagskalender');
  for(let row=7;row<=22;row++) for(const [dest,col] of [['M','Y'],['N','Z']]){
    const lookup=`INDEX('Feiertagsregeln'!$${col}$7:$${col}$21,MATCH($I${row},'Feiertagsregeln'!$A$7:$A$21,0))`;
    calendar.getRange(`${dest}${row}`).formulas=[[`=IF(${lookup}="","Noch zu erfassen",${lookup})`]];
  }
  const start=wb.worksheets.getItem('Übersicht');
  start.getRange('A6').values=[['AP18A · V0.2 mit Sprachfeldern IT / Rumantsch Grischun']];
  start.getRange('A34:A36').copyFrom(start.getRange('A31:A33'),'all');
  start.getRange('A34').values=[['IT und Rumantsch Grischun: gelbe Sprachfelder noch zu erfassen, keine Übersetzungsfreigabe.']];
  start.getRange('A35').values=[['Zusätzliche Sprachen nur in der Arbeitsmappe. App und Laufzeitdaten bleiben unverändert.']];
  start.getRange('A36').values=[['Excel-Interaktion V0.1 durch David Steimer bestätigt. V0.2 enthält ergänzte Sprachfelder.']];
  const originalYear=start.getRange('B4').values[0][0];
  const model=await createPilotModel(root);
  const serial=s=>Math.round((new Date(s+'T00:00:00Z')-new Date('1899-12-30T00:00:00Z'))/86400000);
  let dateChecks=0;
  for(const year of [2026,2027,2028]){
    start.getRange('B4').values=[[year]];wb.recalculate();
    rules.getRange('V7:V21').values.forEach((row,i)=>{assert.equal(row[0],serial(ruleDate(model.rules[i],year)));dateChecks++;});
  }
  start.getRange('B4').values=[[originalYear]];
  // A source name must update all inherited output rows. Temporary labels are not translations.
  rules.getRange('Y7:Z7').values=[['IT-Probe','RG-Probe']];wb.recalculate();
  assert.deepEqual(calendar.getRange('M7:N8').values,[['IT-Probe','RG-Probe'],['IT-Probe','RG-Probe']]);
  rules.getRange('Y7:Z7').values=[['','']];wb.recalculate();
  assert.deepEqual(calendar.getRange('M7:N8').values,[['Noch zu erfassen','Noch zu erfassen'],['Noch zu erfassen','Noch zu erfassen']]);
  const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18A V0.2 formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'));
  await (await SpreadsheetFile.exportXlsx(wb)).save(file);
  const views=[['Übersicht','A29:H36'],['Gemeinwesen','G6:I33'],['Feiertagsregeln','W6:AB23'],['Geltungsbereiche','I6:L11'],['Feiertagskalender','I6:N22']];
  for(let i=0;i<views.length;i++){
    const [sheetName,range]=views[i];
    const im=await wb.render({sheetName,range,scale:1.5,format:'png'});
    await fs.writeFile(path.join(qa,`${i+1}-${sheetName}.png`),new Uint8Array(await im.arrayBuffer()));
  }
  await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({source,file,workbookRevision:'0.2',contract:'0.2.0',specs,dateChecks,languagePropagation:true,missingNameMarker:true,originalYear,views,formulaScan:errors.ndjson},null,2)+'\n');
  console.log(JSON.stringify({file,dateChecks,languagePropagation:true,views:views.length}));
}
const out=path.join(root,'outputs/ap18a-2026-09-13');
const qa=path.join(root,'.work/ap18a/qa');
await fs.mkdir(out,{recursive:true}); await fs.mkdir(qa,{recursive:true});
const m=await createPilotModel(root); validateModel(m);
const wb=Workbook.create();
const names=['Übersicht','Feiertagskalender','Gemeinwesen','Feiertagsregeln','Geltungsbereiche','Rechtsquellen','Verfahrensbezug','Quellenprüfung'];
const sheets=Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
const navy='#122C40',teal='#2F6F73',copper='#A6532D',text='#172126',muted='#566168';
// Quoted separators also render correctly in the bundled calculation runtime.
const dateFormat='dd"."mm"."yyyy';
const col=i=>{let s='';for(i++;i;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s;};
const d=s=>s?new Date(`${s}T00:00:00Z`):null;
const serial=s=>Math.round((new Date(`${s}T00:00:00Z`)-new Date('1899-12-30T00:00:00Z'))/86400000);
const plain=(s,end='J40')=>{
  s.showGridLines=false;
  s.getRange(`A1:${end}`).format.font={name:'Arial',size:10,color:text};
  s.getRange(`A1:${end}`).format.rowHeight=24;
  s.getRange(`A1:${end}`).format.verticalAlignment='center';
};
const tableSpecs=[];
function table(name,title,note,headers,rows,widths){
  const s=sheets[name],last=col(headers.length-1),end=6+rows.length;
  plain(s,`${last}${Math.max(end,32)}`);
  s.getRange('A2').values=[[title]];
  s.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:navy};
  s.getRange(`A3:${last}3`).format.borders={bottom:{style:'thin',color:copper}};
  s.getRange('A4').values=[[note]];s.getRange('A4').format.font={italic:true,color:muted};
  s.getRange(`A6:${last}${end}`).values=[headers,...rows];
  const t=s.tables.add(`A6:${last}${end}`,true,`AP18_${name.normalize('NFD').replace(/\p{Diacritic}/gu,'')}`);
  t.style='TableStyleLight1';
  t.showFilterButton=true;
  s.getRange(`A6:${last}6`).format={fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,horizontalAlignment:'center',verticalAlignment:'center',rowHeight:42};
  s.getRange(`A7:${last}${end}`).format.wrapText=true;
  s.getRange(`A7:${last}${end}`).format.rowHeight=38;
  for(let row=7;row<=end;row++)s.getRange(`A${row}:${last}${row}`).format.fill=row%2?'#E7EEEE':'#FFFFFF';
  headers.forEach((_,i)=>s.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth=widths[i]||22);
  s.freezePanes.freezeRows(6);
  // Freeze identifying column and headers in one pane through export patch, if supported.
  tableSpecs.push({name,end,cols:headers.length,headers});
  return s;
}
function status(s,range){
  s.getRange(range).dataValidation={rule:{type:'list',values:['approved','open','blocked']}};
  s.getRange(range).conditionalFormats.add('containsText',{text:'open',format:{fill:'#FFF1CB',font:{color:'#785300'}}});
  s.getRange(range).conditionalFormats.add('containsText',{text:'blocked',format:{fill:'#FCE3DE',font:{color:'#9B2920'}}});
}

const start=sheets['Übersicht'];plain(start,'H36');start.tabColor=navy;
start.getRange('A1:H36').format.columnWidth=16;
start.getRange('A2').values=[['STEIMER Feiertagsgrundlage Schweiz']];
start.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:navy};
start.getRange('A3:H3').format.borders={bottom:{style:'thin',color:copper}};
start.getRange('A4').values=[['Kalenderjahr']];start.getRange('B4').values=[[m.years.selected]];
start.getRange('B4').format={fill:'#FFF1CB',font:{bold:true,color:navy},horizontalAlignment:'center'};
start.getRange('B4').dataValidation={rule:{type:'whole',operator:'between',formula1:2026,formula2:2028}};
start.getRange('D4').values=[['Prüfzeitraum 2026–2028']];
start.getRange('A6').values=[['AP18A · Entwurf zur Abnahme']];start.getRange('A6').format.font={bold:true,color:copper};
const intro=[
  'Bund und alle 26 Kantone sind inventarisiert. 24 Kantone sind noch nicht erhoben.',
  'Ausgelieferter Stand: unveränderte Feiertagsregeln des freigegebenen MVP-0.3-Bestands.',
  'Aargau: drei Beispieldaten, keine vollständige Feiertagsliste und keine Fristenfreigabe.',
  'Gelbes Feld: Jahr ändern. Die Datumswerte werden in Excel neu berechnet.',
  'Im Feiertagskalender nach Gemeinwesen, Geltungsbereich oder Status filtern.',
  'Jede Regeländerung verlangt Fachstatus open und neue Prüfung. Alte Freigabe gilt nicht weiter.',
  'approved bezeichnet nur die angegebene frühere Fachfreigabe, nicht diese Arbeitsmappe.',
  'Quellenprüfung und Datenrelease bleiben getrennt. Neue Prüfereignisse sind candidate.',
  'Keine Makros, externen Datenverbindungen oder automatische Datenaktivierung.',
  'Sonntage gelten separat. Die Ansicht enthält benannte Feiertage, nicht jeden Sonntag.',
  'Gerichtsferien bleiben unverändert in der bestehenden Kalenderkomponente.',
  'Fehlende Kantonsdaten bedeuten nicht, dass dort keine Feiertage bestehen.',
  'Kalender-App und Feiertagskarte gehören nicht zu AP18.'
];
intro.forEach((v,i)=>{start.getRange(`A${8+i}`).values=[[v]];start.getRange(`A${8+i}:H${8+i}`).format.rowHeight=25;});
start.getRange('A23:B26').values=[['Kontrolle','Anzahl'],['Gemeinwesen',27],['Referenz-Feiertagsregeln',12],['Offene AG-Beispiele',3]];
start.getRange('B24').formulas=[["=COUNTA('Gemeinwesen'!$A$7:$A$33)"]];
start.getRange('B25').formulas=[["=COUNTIFS('Feiertagsregeln'!$P$7:$P$21,\"approved\")"]];
start.getRange('B26').formulas=[["=COUNTIFS('Feiertagsregeln'!$P$7:$P$21,\"open\")"]];
start.getRange('A23:B23').format={fill:navy,font:{color:'#FFFFFF',bold:true},rowHeight:24};
start.getRange('A24:A26').format.columnWidth=27;start.getRange('B24:B26').setNumberFormat('0');
start.getRange('D24').values=[['Stand: 13. September 2026']];
start.getRange('D25').values=[['Fachverantwortung: David Steimer']];
start.getRange('D26').values=[['Nächste Jahresprüfung: spätestens 15.11.2027']];
start.getRange('A29').values=[['Pflege: Regeln und Quellen über stabile IDs verknüpfen. Keine Zeilennummer als Identität.']];
start.getRange('A30').values=[['AP18A bildet den Pilot ab. Suppress/Replace, Import und Kandidatenexport folgen separat.']];
start.getRange('A31').values=[['Der Stand enthält keine neue juristische Freigabe und verändert keine Installation.']];
start.getRange('A32').values=[['Gebiets- und Zuordnungsänderungen brauchen eine Neugenerierung des Kalenders.']];
start.getRange('A33').values=[['Formeln und Referenzzeilen sind geschützt. Blattschutz ohne Passwort aufhebbar.']];

let s=table('Gemeinwesen','Gemeinwesen und Bearbeitungsstand','Erfassungsstand und fachliche Freigabe sind getrennt. Leere Quellen sind noch zu erheben.',
  ['Code','Deutsch','Französisch','Übergeordnet','Erfassungsstand','Fachstatus','Amtliche Feiertagsquelle'],
  m.jurisdictions.map(r=>[...r,r[0]==='CH' ? m.sources[0][4] : r[0]==='CH-BE' ? m.sources[1][4] : r[0]==='CH-AG' ? m.sources[2][4] : 'Noch zu erheben']),[15,28,31,15,30,16,64]);
status(s,'F7:F33');

const ruleRows=m.rules.map(r=>[r.id,r.jurisdiction,r.scope,r.de,r.fr,r.category,r.calculation.type,r.calculation.month??null,r.calculation.day??null,r.calculation.offsetDays??null,r.calculation.isoWeekday??null,r.calculation.occurrence??null,d(r.from),d(r.to),r.priority,r.status,r.approvalBasis,r.action,r.target,r.exportClass,null,null,r.source,r.locator]);
s=table('Feiertagsregeln','Feiertagsregeln und Berechnung','Rechtskategorie und Geltungsbereich sind Pflicht. Datum und Gültigkeit rechts werden aus dem Kalenderjahr berechnet.',
  ['Regel-ID','Gemeinwesen','Geltungs-ID','Deutsch','Französisch','Rechtskategorie','Regeltyp','Monat','Tag','Osterversatz','ISO-Wochentag','Vorkommen','Gültig ab','Gültig bis','Priorität','Fachstatus','Freigabebasis','Wirkung','Zielregel','Exportklasse','Rohdatum','Datum im Geltungszeitraum','Quellen-ID','Fundstelle'],
  ruleRows,[42,16,31,35,32,27,27,10,10,13,14,13,16,16,12,15,41,13,24,24,17,24,42,32]);
status(s,`P7:P${6+m.rules.length}`);
s.getRange(`G7:G${6+m.rules.length}`).dataValidation={rule:{type:'list',values:['fixedMonthDay','easterOffsetDays','nthWeekdayOfMonth']}};
s.getRange(`F7:F${6+m.rules.length}`).dataValidation={rule:{type:'list',values:['publicHoliday','labourLawHoliday','proceduralEquivalentDay']}};
s.getRange(`H7:I${6+m.rules.length}`).setNumberFormat('0');
s.getRange(`M7:N${6+m.rules.length}`).setNumberFormat(dateFormat);
s.getRange(`U7:V${6+m.rules.length}`).setNumberFormat(dateFormat);
// Gregorian Easter, transparent scalar steps (Meeus/Jones/Butcher).
const helpers=[['Jahr',"='Übersicht'!$B$4"],['a','=MOD(AB7,19)'],['b','=INT(AB7/100)'],['c','=MOD(AB7,100)'],['d','=INT(AB9/4)'],['e','=MOD(AB9,4)'],['f','=INT((AB9+8)/25)'],['g','=INT((AB9-AB13+1)/3)'],['h','=MOD(19*AB8+AB9-AB11-AB14+15,30)'],['i','=INT(AB10/4)'],['k','=MOD(AB10,4)'],['l','=MOD(32+2*AB12+2*AB16-AB15-AB17,7)'],['m','=INT((AB8+11*AB15+22*AB18)/451)'],['n','=AB15+AB18-7*AB19+114'],['Ostermonat','=INT(AB20/31)'],['Ostertag','=MOD(AB20,31)+1'],['Ostersonntag','=DATE(AB7,AB21,AB22)']];
s.getRange('AA6:AB6').values=[['Osterrechnung','Wert']];
s.getRange('AA6:AB23').format.font={name:'Arial',size:10,color:text};
s.getRange('AA6:AB6').format={fill:navy,font:{color:'#FFFFFF',bold:true}};
s.getRange('AA6:AA23').format.columnWidth=22;s.getRange('AB6:AB23').format.columnWidth=18;
helpers.forEach(([l,f],i)=>{s.getRange(`AA${i+7}`).values=[[l]];s.getRange(`AB${i+7}`).formulas=[[f]];});
s.getRange('AB23').setNumberFormat(dateFormat);
m.rules.forEach((r,i)=>{
  const n=i+7,year="'Übersicht'!$B$4";
  const fixed=`DATE(${year},H${n},I${n})`;
  const nth=`DATE(${year},H${n},1)+MOD(K${n}-WEEKDAY(DATE(${year},H${n},1),2),7)+7*(L${n}-1)`;
  const calculated=`IF(G${n}="fixedMonthDay",IF(AND(ISNUMBER(H${n}),ISNUMBER(I${n}),H${n}=INT(H${n}),I${n}=INT(I${n}),MONTH(${fixed})=H${n},DAY(${fixed})=I${n}),${fixed},NA()),IF(G${n}="easterOffsetDays",IF(AND(ISNUMBER(J${n}),J${n}=INT(J${n}),ABS(J${n})<=366),$AB$23+J${n},NA()),IF(G${n}="nthWeekdayOfMonth",IF(AND(ISNUMBER(H${n}),ISNUMBER(K${n}),ISNUMBER(L${n}),H${n}=INT(H${n}),K${n}=INT(K${n}),L${n}=INT(L${n}),H${n}>=1,H${n}<=12,K${n}>=1,K${n}<=7,L${n}>=1,L${n}<=5,MONTH(${nth})=H${n}),${nth},NA()),NA())))`;
  s.getRange(`U${n}`).formulas=[[`=IF(AND(ISNUMBER(${year}),${year}=INT(${year}),${year}>=2026,${year}<=2028),${calculated},NA())`]];
  s.getRange(`V${n}`).formulas=[[`=IF(AND(U${n}>=M${n},OR(N${n}="",U${n}<=N${n})),U${n},"Ausserhalb Geltung")`]];
});

s=table('Geltungsbereiche','Räumliche Geltungsbereiche','Gemeinden und Bezirke konkretisieren kantonales Recht. Keine Geodaten und kein eigenständiges kommunales Feiertagsrecht.',
  ['Geltungs-ID','Gemeinwesen','Gebiet','Gebietstyp','Umfang / Grenze','Quellen-ID','Fundstelle','Fachstatus','Daten ab','Daten bis'],
  m.scopes.map(r=>[...r.slice(0,8),d(r[8]),d(r[9])]),[31,16,38,22,62,40,35,16,16,16]);
status(s,'H7:H11');s.getRange('I7:J11').setNumberFormat(dateFormat);
s=table('Rechtsquellen','Rechtsgrundlagen und amtliche Quellen','Quellen-IDs sind stabil. Originalstand, Abruf und Fachfreigabe sind verschiedene Angaben.',
  ['Quellen-ID','Gemeinwesen','Erlass / Quelle','Fundstelle','Amtlicher Link','Fassungsstand','Abgerufen','Prüfhinweis','Fachstatus','Frühere Freigabebasis','URL (Original)'],
  m.sources.map(r=>[...r.slice(0,5),d(r[5]),d(r[6]),...r.slice(7),r[4]]),[42,16,66,39,28,17,17,59,16,41,90]);
s.getRange('F7:G11').setNumberFormat(dateFormat);status(s,'I7:I11');
// Native hyperlinks are added by the bounded OOXML finalizer. HYPERLINK() is
// not implemented by this artifact runtime and would export error cells.
m.sources.forEach((r,i)=>s.getRange(`E${i+7}`).values=[['Amtliche Quelle öffnen']]);
s.getRange('E7:E11').format.font={name:'Arial',size:10,color:teal,underline:'single'};

s=table('Verfahrensbezug','Sachliche und verfahrensrechtliche Zuordnung','Ein arbeitsrechtlicher Feiertag ist nicht automatisch ein prozessualer Fristenverlängerungstag.',
  ['Zuordnungs-ID','Geltungs-ID','Rechtskategorie','Anwendungsbereich','Wirkung / Grenze','Norm / Referenz','Fachstatus','Freigabebasis'],m.mappings,[28,31,29,42,65,49,16,41]);
status(s,'G7:G10');
s=table('Quellenprüfung','Quellenprüfung nach AP13','Vorbereitete Prüfnotizen, keine Erweiterung des freigegebenen append-only-Protokolls.',
  ['Prüf-ID','Quellen-ID','Auslöser','Datum','Ergebnis','Vergleichsbasis','Befund','Ereignisstatus','Fachverantwortung','Arbeitsinstrument','Nächster Schritt'],
  m.reviews.map(r=>[...r.slice(0,3),d(r[3]),...r.slice(4)]),[30,42,17,17,18,41,65,18,25,20,47]);
s.getRange('D7:D10').setNumberFormat(dateFormat);
s.getRange('E7:E10').dataValidation={rule:{type:'list',values:['unchanged','changed','unclear','unavailable']}};
s.getRange('H7:H10').dataValidation={rule:{type:'list',values:['candidate','approved','withdrawn']}};

const entries=[];
for(const scope of m.scopes) for(const rule of m.rules) {
  if(rule.scope===scope[0] || (scope[0]==='BE-ALL' && rule.scope==='CH-ALL')) entries.push({scope,rule});
}
s=table('Feiertagskalender','Generierter Feiertagskalender','Jahr auf Übersicht ändern. Filter nach Gebiet und Kategorie. AG zeigt nur Einzelbeispiele. Nicht erhobene Kantone haben keine Ergebniszeilen.',
  ['Datum','Wochentag','Gemeinwesen','Geltungsbereich','Feiertag','Französisch','Rechtskategorie','Fachstatus','Regel-ID','Quellen-ID','Fundstelle','Abdeckung'],
  entries.map(({scope,rule})=>[null,null,scope[1],scope[2],null,null,null,null,rule.id,null,null,scope[0].startsWith('AG-')?'Teilumfang, offen':scope[0]==='CH-ALL'?'Nur Bundesfeiertag':'Referenzbestand']),[17,17,17,38,40,34,29,17,43,43,35,29]);
s.tabColor=teal;
const lastRule=6+m.rules.length;
const lookup=(row,target)=>`INDEX('Feiertagsregeln'!$${target}$7:$${target}$${lastRule},MATCH($I${row},'Feiertagsregeln'!$A$7:$A$${lastRule},0))`;
entries.forEach((_,i)=>{
  const n=i+7;
  for(const [dest,source] of [['A','V'],['E','D'],['F','E'],['G','F'],['H','P'],['J','W'],['K','X']])s.getRange(`${dest}${n}`).formulas=[[`=${lookup(n,source)}`]];
  s.getRange(`B${n}`).formulas=[[`=IF(ISNUMBER(A${n}),CHOOSE(WEEKDAY(A${n},2),"Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"),"n.a.")`]];
});
s.getRange(`A7:A${6+entries.length}`).setNumberFormat(dateFormat);
status(s,`H7:H${6+entries.length}`);

// Verify numerical results after changing the single year input, then restore.
const numericalChecks=[];
for(const year of [2026,2027,2028]){
  start.getRange('B4').values=[[year]];wb.recalculate();
  const vals=sheets.Feiertagsregeln.getRange(`V7:V${lastRule}`).values;
  for(let i=0;i<m.rules.length;i++){
    const expected=ruleDate(m.rules[i],year),value=vals[i][0];
    if(value!==serial(expected))throw new Error(`Workbook date mismatch ${year} ${m.rules[i].id}: ${value} expected ${serial(expected)}`);
  }
  numericalChecks.push({year,rules:m.rules.length,passed:true});
}
start.getRange('B4').values=[[m.years.selected]];wb.recalculate();
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP18A formula error scan'});
await fs.writeFile(path.join(qa,'formula-scan.ndjson'),errors.ndjson);
console.log(errors.ndjson);
if(!errors.ndjson.includes('Cell search matched 0 entries.'))throw new Error('Formula error scan did not confirm zero matches');
console.log((await wb.inspect({kind:'table',range:'Feiertagskalender!A6:H22',include:'values,formulas',tableMaxRows:5,tableMaxCols:8,maxChars:2500})).ndjson);
const file=path.join(out,'2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.1.xlsx');
await (await SpreadsheetFile.exportXlsx(wb)).save(file);
const views=[['Übersicht','A1:H34'],...tableSpecs.map(t=>[t.name,`A1:${col(Math.min(t.cols,8)-1)}${t.end}`]),['Feiertagsregeln','I6:X21'],['Feiertagsregeln','AA6:AB23'],['Rechtsquellen','I6:K11'],['Quellenprüfung','H6:K10'],['Geltungsbereiche','I6:J11'],['Feiertagskalender','I6:L22']];
for(let i=0;i<views.length;i++){
  const [sheetName,range]=views[i];
  const image=await wb.render({sheetName,range,scale:1.5,format:'png'});
  await fs.writeFile(path.join(qa,`${String(i+1).padStart(2,'0')}-${sheetName}.png`),new Uint8Array(await image.arrayBuffer()));
}
await fs.writeFile(path.join(qa,'model.json'),JSON.stringify(m,null,2)+'\n');
await fs.writeFile(path.join(qa,'checks.json'),JSON.stringify({file,baseline:BASELINE,workbookStatus:'candidate',numericalChecks,baselineHashes:m.hashes,sheets:names,formulaScan:errors.ndjson,views},null,2)+'\n');
console.log(JSON.stringify({file,sheets:names.length,rules:m.rules.length,calendarRows:entries.length,numericalChecks}));
