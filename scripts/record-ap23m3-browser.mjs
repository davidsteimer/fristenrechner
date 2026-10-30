// SPDX-License-Identifier: AGPL-3.0-only
// Bind actually observed local UI evidence. Never create synthetic browser evidence.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23m3-2026-10-28';
const read=path=>readFile(root+path);
const bind=async path=>{const bytes=await read(path);return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const general=(await read(out+'/browser-ne-general.ax.txt')).toString(),landeron=(await read(out+'/browser-ne-landeron.ax.txt')).toString();
const vd=(await read(out+'/browser-vd-unsigned.ax.txt')).toString(),reset=(await read(out+'/browser-vd-opening-reset.ax.txt')).toString(),vs=(await read(out+'/browser-vs-winter-fr.ax.txt')).toString();
for(const text of[general,landeron,vd,reset,vs])assert.ok(text.includes('AP23M3 · Format 17 · DE / FR'));
for(const value of['26.05.2027','27.05.2027','Kanton Neuenburg ausser Le Landeron','KEIN KALENDEREXPORT'])assert.ok(general.includes(value),value);
for(const value of['26.05.2027','27.05.2027','28.05.2027','Le Landeron','KEIN KALENDEREXPORT'])assert.ok(landeron.includes(value),value);
for(const value of['19.09.2026','22.09.2026','23.09.2026','25.09.2026','Tag nach der rechtlich massgebenden Eröffnung','Zustellung ohne Unterschrift zulässig','Eingang in der Empfängersphäre verifiziert','KEIN KALENDEREXPORT'])assert.ok(vd.includes(value),value);
assert.match(reset,/text field \(settable\) Rechtlich massgebender Eröffnungs- oder Kenntnistag, ID:/u);
assert.ok(!reset.includes('container Lokale Prüfrechnung'));
assert.ok(reset.includes('Fallkonstellation * Bitte wählen'));
for(const value of['05.01.2027','06.01.2027','18 décembre–5 janvier','Notification déterminante','AUCUN EXPORT','lex.vs.ch/api/fr/texts_of_law/172.6'])assert.ok(vs.includes(value),value);
const web=JSON.parse(await read(out+'/web-build.json'));assert.equal(web.status,'passed');assert.equal(web.sourceReleaseApproved,false);
const files=['browser-ne-general.ax.txt','browser-ne-landeron.ax.txt','browser-ne-landeron.jpg','browser-vd-unsigned.ax.txt','browser-vd-unsigned.jpg','browser-vd-opening-reset.ax.txt','browser-vs-winter-fr.ax.txt','browser-vs-winter-fr.jpg'].map(file=>out+'/'+file);
files.push('.work/public-ap23m3/index.html',...web.artifacts.filter(row=>/\/assets\/app-[A-Z0-9]+\.js$/u.test(row.path)).map(row=>row.path));
assert.equal(files.filter(path=>path.endsWith('.js')).length,1,'Exact final minified application');
for(const path of files.filter(file=>file.endsWith('.jpg'))){const bytes=await read(path);assert.equal(bytes.readUInt16BE(0),0xffd8,'Actual JPEG screenshot');assert.ok(bytes.length>10000);}
const report={workPackage:'AP23M3',status:'passed',localOnly:true,
 method:'Observed interaction through the in-app browser on the actual built local application. Screenshots visually inspected. Accessibility text captured from that browser, not synthesized from product sources.',
 url:'http://127.0.0.1:8811/fristenrechner/',dataReleaseId:web.dataReleaseId,
 cases:[
  {id:'B-M3-NE-REGION-CONTRAST',qualifiedOpening:'2027-05-26',days:1,generalEnd:'2027-05-27',leLanderonEnd:'2027-05-28',freshQualificationRequiredAfterRegionChange:true,exportDenied:true},
  {id:'B-M3-VD-UNSIGNED-DE',physicalReceipt:'2026-09-19',qualifiedLegalOpening:'2026-09-22',firstCountedDay:'2026-09-23',days:3,finalEnd:'2026-09-25',bothCurrentRawConditionsVisible:true,noAiTrackingInference:true,exportDenied:true},
  {id:'B-M3-VD-DATE-MEANING-RESET',transition:'physicalUnsignedPostalReceiptDate -> qualifiedLegalOpeningDate',inputDateCleared:true,currentQualificationCleared:true,oldResultRemoved:true},
  {id:'B-M3-VS-WINTER-FR',qualifiedOpening:'2027-01-05',days:1,finalEnd:'2027-01-06',winterBoundaryThroughJanuary5Visible:true,readableFrenchTraceAndLinks:true,exportDenied:true}
 ],visualChecks:{twoColumnsAtObservedDesktopWidth:true,staticSeatLabel:true,buttonsTwoRows:true,earlyDateEntry:true,readableGermanAndFrenchTrace:true,stylesheetsChanged:false},
 actualIcsFilesSaved:0,outlookImports:0,realDeviceOrM365Test:false,professionalTechnicalAcceptance:false,sourceReleaseApproved:false,operatingChanges:false,
 evidence:await Promise.all(files.map(bind))};
await writeFile(root+out+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,cases:report.cases.length,evidenceFiles:report.evidence.length}));
