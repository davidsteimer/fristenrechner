// SPDX-License-Identifier: AGPL-3.0-only
// AP22A working-copy follow-up. The reviewed V0.1 input must never be overwritten.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = process.cwd();
const require = createRequire(path.join(root,'.work/ap22a/runtime.mjs'));
const { SpreadsheetFile, FileBlob } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')));
const original = path.join(root,'outputs/ap22a-matrix-2026-10-02/2026-10-02_Verfahrens-und-Gebietsmatrix_AP22A_V0.1.xlsx');
const out = path.join(root,'outputs/ap22a-abschluss-2026-10-02');
const qa = path.join(root,'.work/ap22a/abschluss');
const file = path.join(out,'2026-10-02_Verfahrens-und-Gebietsmatrix_AP22A_V0.2.xlsx');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const python=process.env.FRISTENRECHNER_PYTHON || 'python3';
if(process.argv.includes('--accept')) { await recordAcceptance(); process.exit(0); }
assert.equal(hash(await fs.readFile(original)),'7e1ec29abc9a08e6c7627ebf745e3af011806f2ab4fe77d4021f294745aa531d');
await fs.mkdir(qa,{recursive:true});
const verify=process.argv.includes('--verify');
const inspect=process.argv.includes('--inspect');
const prepared=path.join(qa,'unfiltered-original.xlsx');
if(!verify&&!inspect)execFileSync(python,['scripts/ap22a_workbook_metadata.py','prepare',original,prepared]);
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(verify ? file : inspect ? original : prepared));
if (process.argv.includes('--inspect')) {
  console.log(wb.help('filter rows', {search:'filter|hidden',include:'index,examples,notes',maxChars:4000}).ndjson);
  console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:5000,tableMaxRows:2,tableMaxCols:4})).ndjson);
  console.log((await wb.inspect({kind:'region',sheetId:'Lesehilfe',range:'A13:F21',maxChars:6000})).ndjson);
  for (const [name,sheetName,range] of [['original-intro','Lesehilfe','A13:F21'],['original-matrix','Verfahrensmatrix','A75:F82'],['original-comments','Verfahrensmatrix','M75:O82']]) {
    const image = await wb.render({sheetName,range,scale:1,format:'png'});
    await fs.writeFile(path.join(qa,name+'.png'),new Uint8Array(await image.arrayBuffer()));
  }
  process.exit(0);
}
const model=JSON.parse(await fs.readFile(path.join(out,'matrix-data-v02.json'),'utf8'));
const mat=wb.worksheets.getItem('Verfahrensmatrix');
const intro=wb.worksheets.getItem('Lesehilfe');
const checks=wb.worksheets.getItem('Prüfpunkte');
const sources=wb.worksheets.getItem('Quellen');
const col=n=>{let r='';for(n++;n>0;n=Math.floor((n-1)/26))r=String.fromCharCode(65+(n-1)%26)+r;return r;};
const styleRows=(sheet,rows,widths)=>{
  for(let i=0;i<rows.length;i++){
    const lines=Math.max(...rows[i].map((v,j)=>String(v??'').split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/(widths[j]*0.85))),0)));
    sheet.getRange(`A${i+7}:${col(widths.length-1)}${i+7}`).format={font:{name:'Arial',size:10,color:'#172126'},verticalAlignment:'top',wrapText:true,rowHeight:Math.max(48,lines*14+16),fill:i%2?'#E7EEEE':'#FFFFFF'};
  }
};
const sourceRows=model.sources.map(s=>[s.id,s.jurisdiction,s.title,s.locator,s.url,s.versionOn,s.retrievedOn,s.review,s.note,'']);
const checkRows=model.checks.map(r=>[...r,'']);
const originalComments=mat.getRange('O7:O204').values;
const originalScopeValues=wb.worksheets.getItem('Geltungsräume').getRange('A6:O55').values;
if(!verify){
  const oldCheckComments=checks.getRange('I7:I24').values;
  const oldSourceComments=sources.getRange('J7:J114').values;
  const matrixRows=model.matrix.map((r,i)=>[r.id,r.place,r.profile,r.scope,r.status,r.action,r.anchor,r.category,r.reason,r.sourceIds.join('\n'),r.locator,r.dates,r.evidence,r.release,originalComments[i][0]]);
  mat.getRange('A7:O204').values=matrixRows;
  mat.getRange('E6:F6').values=[['Bearbeitungsstand','Konkrete Verwendung']];
  mat.getRange('I6').values=[['Begründung und Grenzen']];
  mat.getRange('N6').values=[['Fachliche Freigabe / Umsetzung']];
  mat.getRange('A3').values=[['V0.2 Abschlussvorlage. Freigabe DEC-2026-028 erteilt. Vier eng begrenzte Januar-2-Entscheide offen. Keine Produktaktivierung.']];
  styleRows(mat,matrixRows,[35,19,12,40,27,34,32,38,76,44,44,52,48,36,55]);
  mat.getRange('O7:O204').format.fill='#FFF1CB';
  for(let i=0;i<model.matrix.length;i++)mat.getRange(`E${i+7}`).format.fill=model.matrix[i].status==='Grenzentscheid offen'?'#FCE3DE':['Bewusst begrenzt','Katalogergänzung nötig'].includes(model.matrix[i].status)?'#FFF1CB':'#E7EEEE';
  mat.freezePanes.freezeRows(6);mat.freezePanes.freezeColumns(3);
  const introRows=[
    ['Überblick','27 Gemeinwesen','49 bestehende Räume','4 Bundesprofile','198 Zuordnungszeilen','Abschlussvorlage V0.2. Vier gezielte Grenzentscheide offen.'],
    ['Verfahren','Massgebender Ort','Wirkung','Norm / Quelle','Friststillstand','Abgrenzung'],
    ...model.profiles.map(p=>[p.id,p.anchor,p.effect,`${p.norm}\n${p.source}`,p.recess,`${p.role}\n${p.limit}`]),
    ['Leseschlüssel','Bestand unverändert','Zuordnung bestimmt','Grenzentscheid offen','Bewusst begrenzt','Nicht übernehmen / Katalogergänzung nötig'],
    ['Bedeutung','Bisher operativer CH-/BE-Bestand.','Auswahlregel konkretisiert. Fachliche Zustimmung DEC-2026-028 erteilt.','Nur SG/StPO/BGG/VwVG und SH/StPO zum entscheidenden 2. Januar. Gezielter Grenzvorschlag, keine erneute Pauschalfreigabe.','GR bewusst nur Grundkatalog plus Bundesfeier. Sichtbarer Hinweis bleibt Pflicht.','20 negative Listenbindungen unverändert. Zwei SO-Erfassungszeilen freigegeben, technisch noch anzulegen.'],
    ['Arbeitsweise','1. Kanton und Verfahren filtern.','2. Konkrete Verwendung beachten: Grundliste, Ergänzung oder Ersatz.','3. Freigabe ist nicht gleich technische Aktivierung.','4. Gelbe Benutzerbemerkungen sind aus V0.1 bewahrt.','Vier neue Grenzvorschläge sind rosa markiert. Kein endgültiger AP22A-Abschluss vor deren Entscheidung.'],
    ['Quellenstatus','108 frühere Quellenmetadaten bewahrt.','49 gezielte neue Quellenverweise, teils dieselbe Norm mit anderem Nachweis.','AP18-Wiederverwendung bleibt als solche erkennbar.','AG-Altbefund zu 4A_538/2023 ausdrücklich durch 2E_8/2024 korrigiert.','Normtext, Einzelentscheid und normative Ableitung bleiben getrennt. Kein neuer Vollabgleich aller 84 AP18-Quellen.'],
    ['Umfang','Bund und 26 Kantone','Nur Tagesfristen: StPO, ZPO, BGG, VwVG','Keine zusätzlichen Sozialanbindungen oder kantonalen Verwaltungsverfahren','Eigenständiges kommunales Recht bleibt ausserhalb. Kantonalrechtliche Ortsunterschiede berücksichtigen.','Feiertage, Friststillstand, Zustellung und Zuständigkeit getrennt. AP22B-Vertrag noch nicht beschlossen.'],
    ['Zahlen','Bestandszeilen','Bestimmte Zuordnungen','Gezielte Grenzentscheide','Bewusst begrenzte GR-Zeilen','Negative Listen / neue SO-Listen'],
    ['Anzahl',null,null,null,null,null],
    ['Herkunft','Eingangskatalog unverändert','479 Feiertagsregeln','95 räumliche Zuordnungen','198 = 49 × 4 + 2 SO-Zeilen','14 Modellproben und 220 Bestandsregressionen bestanden. Noch keine neue Produktintegration getestet.'],
    ['Dateiablage','Separate Folgefassung, V0.1 unverändert.','Originalfilter nur in dieser Kopie zurückgesetzt.','GR-Bemerkungen unverändert übernommen.','Dateiprüfsummen und QA im Abschlussordner.','E/Q/P, AP5, Mirrors und GitHub durch diesen lokalen Abschluss unverändert.'],
  ];
  intro.getRange('A7:F21').values=introRows;
  intro.getRange('A3').values=[['Stand 02.10.2026 · V0.2 Abschlussvorlage · Fachliche Freigabe und neue Grenzentscheide getrennt · Keine Aktivierung']];
  styleRows(intro,introRows,[20,33,33,38,43,68]);
  intro.getRange('A8:F8').format={fill:'#2F6F73',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'}};
  intro.getRange('A18:F19').format.rowHeight=58;
  intro.getRange('B19:F19').formulas=[[
    '=COUNTIF(Verfahrensmatrix!E7:E204,"Bestand unverändert")',
    '=COUNTIF(Verfahrensmatrix!E7:E204,"Zuordnung bestimmt")',
    '=COUNTIF(Verfahrensmatrix!E7:E204,"Grenzentscheid offen")',
    '=COUNTIF(Verfahrensmatrix!E7:E204,"Bewusst begrenzt")',
    '=COUNTIF(Verfahrensmatrix!E7:E204,"Nicht übernehmen")+COUNTIF(Verfahrensmatrix!E7:E204,"Katalogergänzung nötig")'
  ]];
  checks.tables.items[0].rows.add(null,checkRows.slice(18));
  checks.getRange(`A7:I${6+checkRows.length}`).values=checkRows;
  checks.getRange('I7:I24').values=oldCheckComments;
  checks.getRange('A3').values=[['22 konkrete Prüfaufträge. Datierte Sollwerte sind von tatsächlich ausgeführten Modell- und Bestandsprüfungen getrennt.']];
  styleRows(checks,checkRows,[14,25,52,43,76,58,35,52,55]);checks.getRange(`I7:I${6+checkRows.length}`).format.fill='#FFF1CB';
  sources.tables.items[0].rows.add(null,sourceRows.slice(108));
  sources.getRange(`A7:J${6+sourceRows.length}`).values=sourceRows;
  sources.getRange('J7:J114').values=oldSourceComments;
  sources.getRange('A3').values=[[`${sourceRows.length} Quellenverweise. Alte Quellen und ihre Prüftiefe bewahrt, neue gezielte Abschlussnachweise angefügt. Keine vollständige neue Quellenrevision.`]];
  styleRows(sources,sourceRows,[43,18,60,54,85,22,22,33,78,55]);sources.getRange(`J7:J${6+sourceRows.length}`).format.fill='#FFF1CB';
  sources.getRange(`E7:E${6+sourceRows.length}`).format.font.color='#1A5C8E';
  wb.recalculate();
  assert.deepEqual(intro.getRange('B19:F19').values[0],[8,160,4,4,22]);
  const before=mat.getRange('E7').values;
  mat.getRange('E7').values=[['Grenzentscheid offen']];wb.recalculate();
  assert.equal(intro.getRange('B19').values[0][0],7);
  assert.equal(intro.getRange('D19').values[0][0],5);
  mat.getRange('E7').values=before;wb.recalculate();
  assert.deepEqual(mat.getRange('O7:O204').values,originalComments);
  assert.deepEqual(wb.worksheets.getItem('Geltungsräume').getRange('A6:O55').values,originalScopeValues);
}
wb.recalculate();
assert.deepEqual(intro.getRange('B19:F19').values[0],[8,160,4,4,22]);
assert.deepEqual(mat.getRange('A7:A204').values.flat(),model.matrix.map(r=>r.id));
assert.deepEqual(sources.getRange(`E7:E${6+sourceRows.length}`).values.flat(),model.sources.map(s=>s.url));
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'AP22A V0.2 formula scan'});
assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'),errors.ndjson);
if(!verify){
  const exported=path.join(qa,'artifact-export.xlsx');
  await(await SpreadsheetFile.exportXlsx(wb)).save(exported);
  execFileSync(python,['scripts/ap22a_workbook_metadata.py','links',exported,file,path.join(out,'matrix-data-v02.json')]);
}
const views=[['Lesehilfe','A13:F21'],['Verfahrensmatrix','A23:F26'],['Verfahrensmatrix','M119:O122'],['Verfahrensmatrix','A119:F122'],['Prüfpunkte','A24:H28'],['Quellen','A150:D154'],['Quellen','G150:J154'],['Lesehilfe','A1:F12'],['Verfahrensmatrix','A113:F118'],['Verfahrensmatrix','I113:O118']];
if(verify)for(let i=0;i<views.length;i++){
  const [sheetName,range]=views[i];
  const blob=await wb.render({sheetName,range,scale:1,format:'png'});
  await fs.writeFile(path.join(qa,`saved-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));
}
const audit={file:path.basename(file),sha256:hash(await fs.readFile(file)),originalSha256:hash(await fs.readFile(original)),matrixRows:198,sourceRows:sourceRows.length,checkRows:checkRows.length,formulaCounts:intro.getRange('B19:F19').values[0],formulaErrors:0,dependencyTest:'Changed one status and restored, both dependent counts checked',reimported:verify,rendered:verify?views:[],nativeExcelInteraction:'Not performed',productActivation:false};
await fs.writeFile(path.join(out,verify?'workbook-qa.json':'workbook-build.json'),JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit));

// Narrow approval follow-up. The reviewed V0.2 is the authoritative input.
async function recordAcceptance(){
  const input=path.join(root,'outputs/ap22a-abschluss-2026-10-02/2026-10-02_Verfahrens-und-Gebietsmatrix_AP22A_V0.2.xlsx');
  const dataInput=path.join(root,'outputs/ap22a-abschluss-2026-10-02/matrix-data-v02.json');
  const acceptedOut=path.join(root,'outputs/ap22a-abnahme-2026-10-08');
  const acceptedQa=path.join(root,'.work/ap22a/abnahme-2026-10-08');
  const target=path.join(acceptedOut,'2026-10-08_Verfahrens-und-Gebietsmatrix_AP22A_V1.0.xlsx');
  const dataTarget=path.join(acceptedOut,'matrix-data-v10.json');
  const decision='DEC-2026-029';
  const state='Ergebnisabhängig begrenzt';
  const expectedInput='25bf4999d63a3b2fabefe74bcd621e933c6bebed92d05ff9884cf200a0322c84';
  const expectedData='5c7d8a6684a2ce018a3636e41bb2664d67d675e109ab25dd6e9f99bcc562cf2d';
  assert.equal(hash(await fs.readFile(input)),expectedInput);
  assert.equal(hash(await fs.readFile(dataInput)),expectedData);
  const isVerify=process.argv.includes('--verify');
  const isInspect=process.argv.includes('--inspect');
  await fs.mkdir(acceptedQa,{recursive:true});
  const workbook=await SpreadsheetFile.importXlsx(await FileBlob.load(isVerify?target:input));
  const m=workbook.worksheets.getItem('Verfahrensmatrix');
  const help=workbook.worksheets.getItem('Lesehilfe');
  const checksSheet=workbook.worksheets.getItem('Prüfpunkte');
  const views=[['Lesehilfe','A13:F21'],['Verfahrensmatrix','D113:F118'],['Verfahrensmatrix','M113:O122'],['Prüfpunkte','A25:H25'],['Lesehilfe','A1:F7']];
  if(isInspect){
    console.log((await workbook.inspect({kind:'region',sheetId:'Lesehilfe',range:'A13:F19',maxChars:3000})).ndjson);
    for(let i=0;i<2;i++){
      const [sheetName,range]=views[i];const b=await workbook.render({sheetName,range,scale:1,format:'png'});
      await fs.writeFile(path.join(acceptedQa,`before-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));
    }
    return;
  }
  const model=JSON.parse(await fs.readFile(isVerify?dataTarget:dataInput,'utf8'));
  if(!isVerify){
    await fs.mkdir(acceptedOut,{recursive:true});
    await fs.access(target).then(()=>{throw new Error('Accepted workbook already exists. Preserve user edits and use --verify.');},e=>{if(e.code!=='ENOENT')throw e;});
    const expectedIds=['AP22-SH-ZPO-ADDITIONAL-STPO','AP22-SG-ZPO-ADDITIONAL-STPO','AP22-SG-ZPO-ADDITIONAL-BGG','AP22-SG-ZPO-ADDITIONAL-VWVG'].sort();
    assert.deepEqual(model.matrix.filter(r=>r.mode==='needsDecision').map(r=>r.id).sort(),expectedIds);
    for(let i=0;i<model.matrix.length;i++){
      const r=model.matrix[i];
      r.comment=m.getRange(`O${i+7}`).values[0][0]??'';
      if(r.mode!=='needsDecision')continue;
      r.mode='resultDependentClarification';r.status=state;
      r.action='Einzelfallklärung nur bei Ergebnisunterschied am 2. Januar';
      r.reason='DEC-2026-029 vom 08.10.2026: übrige bestätigte Regeln bleiben verwendbar. Wenn die Behandlung des 2. Januar das Ergebnis verändert, Einzelfallklärung und kein definitives automatisches Fristresultat. Kein sicherer Feiertags- oder Werktagsstatus behauptet. Keine pauschale Kantons- oder Verfahrenssperre.';
      r.release='DEC-2026-028 und DEC-2026-029 beschlossen. AP22A abgeschlossen. Technische Umsetzung ausstehend.';
      r.limitation={...r.limitationProposal,approved:true,approvedOn:'2026-10-08',approvalBasis:decision};
      delete r.limitationProposal;
      for(const [column,value]of Object.entries({E:r.status,F:r.action,I:r.reason,N:r.release}))m.getRange(`${column}${i+7}`).values=[[value]];
      m.getRange(`E${i+7}`).format.fill='#E7EEEE';
    }
    model.version='1.0';model.status='AP22A abgeschlossen';model.closedOn='2026-10-08';
    model.humanApproval='DEC-2026-028 und DEC-2026-029 erteilt';
    model.counts.pendingNarrowLimitations=0;model.counts.approvedNarrowLimitations=4;
    model.approval={decision,date:'2026-10-08',by:'David Steimer',quote:'Ja, wir können diese begrenzte Behandlung des 2. Januar so festhalten.',implementation:false};
    model.predecessor={version:'0.2',workbookSha256:expectedInput,dataSha256:expectedData};
    const r19=model.checks.find(r=>r[0]==='R19');
    r19[4]='Beschlossen: Einzelfallklärung und kein definitives automatisches Fristresultat, wenn die unterschiedliche Behandlung des 2. Januar das Ergebnis verändert. Sonst keine Sperre.';
    r19[6]='DEC-2026-029 am 08.10.2026 beschlossen';r19[7]='Beide Ergebnisvarianten, Folgeverschiebung und unverändertes Ergebnis in AP22C testen.';
    checksSheet.getRange('E25').values=[[r19[4]]];checksSheet.getRange('G25:H25').values=[[r19[6],r19[7]]];
    checksSheet.getRange('A25:I25').format.rowHeight=94;
    m.getRange('A3').values=[['V1.0 Abschlussfassung vom 08.10.2026. DEC-2026-028 und DEC-2026-029 beschlossen. AP22A abgeschlossen, keine Produktaktivierung.']];
    help.getRange('A3').values=[['Stand 08.10.2026 · V1.0 Abschlussfassung · Vier ergebnisabhängige Grenzen beschlossen · Keine technische Aktivierung']];
    help.getRange('F7').values=[['Abschlussfassung V1.0. AP22A am 08.10.2026 abgeschlossen.']];
    help.getRange('D13').values=[[state]];
    help.getRange('D14').values=[['DEC-2026-029: Nur SG/StPO/BGG/VwVG und SH/StPO. Bei Ergebnisunterschied durch den 2. Januar Einzelfallklärung, kein definitives automatisches Resultat.']];
    help.getRange('F15').values=[['Alle Fachentscheide von AP22A liegen vor. Vier ergebnisabhängige Grenzen sind beschlossen. Umsetzung und AP22B-Vertrag bleiben getrennt.']];
    help.getRange('D18').values=[['Beschlossene Jan.-2-Grenzen']];
    help.getRange('D19').formulas=[['=COUNTIF(Verfahrensmatrix!E7:E204,"Ergebnisabhängig begrenzt")']];
    help.getRange('F20').values=[['Nachweise vom 02.10.2026: 14 Modellproben und 220 Bestandsregressionen bestanden. Keine neue Produktintegration getestet.']];
    help.getRange('B21:C21').values=[['Separate Abschlussfassung, V0.1 und V0.2 unverändert.','Quellen- und Prüfstand 02.10.2026, Beschluss 08.10.2026.']];
    workbook.recalculate();
    assert.deepEqual(help.getRange('B19:F19').values[0],[8,160,4,4,22]);
    m.getRange('E95').values=[['Zuordnung bestimmt']];workbook.recalculate();
    assert.deepEqual(help.getRange('C19:D19').values[0],[161,3]);
    m.getRange('E95').values=[[state]];workbook.recalculate();
    await fs.writeFile(dataTarget,JSON.stringify(model,null,2)+'\n');
  }
  workbook.recalculate();
  assert.deepEqual(help.getRange('B19:F19').values[0],[8,160,4,4,22]);
  assert.equal(model.matrix.filter(r=>r.limitation?.approved===true).length,4);
  assert.equal(model.matrix.filter(r=>r.mode==='needsDecision').length,0);
  assert.deepEqual(m.getRange('A7:A204').values.flat(),model.matrix.map(r=>r.id));
  assert.equal(model.matrix.filter(r=>r.mode==='exclude').length,20);
  const errors=await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'AP22A acceptance formula scan'});
  assert.ok(errors.ndjson.includes('Cell search matched 0 entries.'),errors.ndjson);
  if(!isVerify){
    const stage=path.join(acceptedQa,'artifact-export.xlsx');
    await(await SpreadsheetFile.exportXlsx(workbook)).save(stage);
    execFileSync(python,['scripts/ap22a_workbook_metadata.py','links',stage,target,dataTarget]);
  }
  if(isVerify)for(let i=0;i<views.length;i++){
    const [sheetName,range]=views[i];const b=await workbook.render({sheetName,range,scale:1,format:'png'});
    await fs.writeFile(path.join(acceptedQa,`saved-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));
  }
  const report={date:'2026-10-08',decision,status:'AP22A abgeschlossen',file:path.basename(target),sha256:hash(await fs.readFile(target)),dataSha256:hash(await fs.readFile(dataTarget)),inputWorkbookSha256:expectedInput,inputDataSha256:expectedData,rows:198,sourceRows:157,checkRows:22,approvedNarrowLimitations:4,pendingNarrowLimitations:0,formulaCounts:help.getRange('B19:F19').values[0],formulaErrors:0,dependencyTest:'One approved limitation changed to determined, both counters changed, original state restored',reimported:isVerify,rendered:isVerify?views:[],nativeExcelInteraction:false,productActivation:false,priorModelTests:{date:'2026-10-02',modelChecks:14,regressions:220,reexecuted:false}};
  await fs.writeFile(path.join(acceptedOut,isVerify?'workbook-qa.json':'workbook-build.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(hash(await fs.readFile(input)),expectedInput);assert.equal(hash(await fs.readFile(dataInput)),expectedData);
  console.log(JSON.stringify(report));
}
