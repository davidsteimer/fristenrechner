// SPDX-License-Identifier: AGPL-3.0-only
// Records observed local-browser evidence. Does not drive a browser or grant acceptance.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23l3-2026-10-27';
const read=path=>readFile(root+path);
const bind=async path=>{const bytes=await read(path);return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const ai=(await read(out+'/browser-ai-tracking.ax.txt')).toString();
const reset=(await read(out+'/browser-opening-reset.ax.txt')).toString();
const sz=(await read(out+'/browser-sz-martinstag-fr.ax.txt')).toString();
for(const value of['19.09.2026','21.09.2026','22.09.2026','01.10.2026','Tag nach der rechtlich massgebenden Eröffnung','KEIN KALENDEREXPORT'])assert.ok(ai.includes(value),value);
assert.match(reset,/text field \(settable\) Rechtlich massgebender Eröffnungs- oder Kenntnistag, ID:/u);
assert.ok(!reset.includes('container Lokale Prüfrechnung'));
for(const value of['01.11.2026','11.11.2026','12.11.2026','Saint-Martin','sans interrompre le décompte','jusqu’au 7 janvier inclus','AUCUN EXPORT'])assert.ok(sz.includes(value),value);
const web=JSON.parse(await read(out+'/web-build.json'));
assert.equal(web.status,'passed');assert.equal(web.sourceReleaseApproved,false);
const files=[
  out+'/browser-ai-tracking.ax.txt',out+'/browser-ai-tracking.jpg',
  out+'/browser-opening-reset.ax.txt',
  out+'/browser-sz-martinstag-fr.ax.txt',out+'/browser-sz-martinstag-fr.jpg',
  out+'/browser-sz-form-de.jpg',
  '.work/public-ap23l3/index.html',...web.artifacts.filter(row=>/\/assets\/app-[A-Z0-9]+\.js$/u.test(row.path)).map(row=>row.path),
];
assert.equal(files.filter(path=>path.endsWith('.js')).length,1,'Exact final minified application');
for(const file of files.filter(path=>path.endsWith('.jpg'))){const bytes=await read(file);assert.equal(bytes.readUInt16BE(0),0xffd8,'Actual JPEG screenshot');assert.ok(bytes.length>10_000);}
const report={
  workPackage:'AP23L3',status:'passed',localOnly:true,
  method:'Observed interaction through the in-app browser on the actual built local application. Screenshots visually inspected. Accessibility text is captured from that browser, not synthesized from product sources.',
  url:'http://127.0.0.1:8810/fristenrechner/',dataReleaseId:web.dataReleaseId,
  cases:[
    {id:'B-L3-AI-TRACKING-DE',physicalReceipt:'2026-09-19',qualifiedLegalOpening:'2026-09-21',firstCountedDay:'2026-09-22',days:10,finalEnd:'2026-10-01',correctedNextDayCaptionObserved:true,exportDenied:true},
    {id:'B-L3-DATE-MEANING-RESET',transition:'trackingPhysicalReceipt -> unselected',inputDateCleared:true,currentQualificationCleared:true,oldResultRemoved:true},
    {id:'B-L3-SZ-MARTINSTAG-FR',qualifiedOpening:'2026-11-01',firstCountedDay:'2026-11-02',days:10,lastCountedDay:'2026-11-11',finalEnd:'2026-11-12',martinstagEndShiftOnly:true,readableFrenchSources:true,exportDenied:true},
  ],
  visualChecks:{twoColumns:true,staticSeatLabel:true,buttonsTwoRows:true,earlyDateEntry:true,readableGermanAndFrenchTrace:true,stylesheetsChanged:false},
  actualIcsFilesSaved:0,outlookImports:0,realDeviceOrM365Test:false,
  professionalTechnicalAcceptance:false,sourceReleaseApproved:false,operatingChanges:false,
  evidence:await Promise.all(files.map(bind)),
};
await writeFile(root+out+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,cases:report.cases.length,evidenceFiles:report.evidence.length}));
