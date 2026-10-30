// SPDX-License-Identifier: AGPL-3.0-only
// Bind actual CUA observations. This is not a simulated browser replay.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23j3-2026-10-27';
const json=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const bind=async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,
  sha256:createHash('sha256').update(bytes).digest('hex')};};
assert.deepEqual(process.argv.slice(2),['--write']);
const dom=await json(out+'/browser-dom-observation.json');
assert.equal(dom.url,'http://127.0.0.1:8807/fristenrechner/');
assert.ok(dom.scrollWidth<=dom.viewport.width,'Horizontal overflow');
const left=dom.controls.find(row=>row.id==='Dropdown8'),right=dom.controls.find(row=>row.id==='Dropdown9');
assert.equal(left.rect.y,right.rect.y);assert.ok(right.rect.x>left.rect.x+left.rect.width);
const date=dom.controls.find(row=>row.id==='fr-native-date-1');assert.equal(date.rect.height,32);
const script=dom.scripts.find(url=>/\/assets\/app-[A-Z0-9]+\.js$/.test(url));assert.ok(script);
const asset=await bind('.work/public-ap23j3/assets/'+script.split('/').at(-1));
const web=await json(out+'/web-build.json');
assert.ok(web.artifacts.some(row=>row.path===asset.path&&row.sha256===asset.sha256),'Observed final Web asset');
const cases=[
  {id:'GE-QUALIFIED-DE',receipt:'2026-09-05',days:30,result:'2026-10-05',opening:'2026-09-05',file:'browser-ge-qualified-de-ax.txt',expected:['05.09.2026','05.10.2026','Rechtlich massgebender Eröffnungstag steht fest']},
  {id:'GE-POST-DE',receipt:'2026-09-05',days:30,result:'2026-10-07',opening:'2026-09-07',file:'browser-ge-post-de-ax.txt',expected:['05.09.2026','07.09.2026','07.10.2026','Tatsächlicher Postempfang','Rechtlicher Eröffnungstag']},
  {id:'GE-UNCLEAR-DE',definitiveResult:false,file:'browser-ge-unclear-de-ax.txt',expected:['Unklar oder abweichend','Die Frist kann noch nicht berechnet werden.']},
  {id:'FR-ORDINARY-DE',receipt:'2026-10-02',days:30,result:'2026-11-02',file:'browser-fr-ordinary-de-ax.txt',expected:['02.10.2026','02.11.2026','kein Sommerstillstand']},
  {id:'FR-COURT-DE',receipt:'2026-10-02',days:30,result:'2026-11-02',file:'browser-fr-court-de-ax.txt',expected:['02.11.2026','Ordentliche Beschwerde an das Kantonsgericht','15. Juli–15. August']},
  {id:'FR-COURT-SUMMER-DE',receipt:'2027-07-14',days:30,result:'2027-09-14',suspendedDays:32,file:'browser-fr-court-summer-de-ax.txt',expected:['14.07.2027','14.09.2027','16.08.2027','15. Juli–15. August']},
  {id:'FR-ORDINARY-SUMMER-DE',receipt:'2027-07-14',days:30,result:'2027-08-13',suspendedDays:0,file:'browser-fr-ordinary-summer-de-ax.txt',expected:['14.07.2027','13.08.2027','kein Sommerstillstand']},
  {id:'JU-INITIAL-DE',receipt:'2026-12-17',days:5,result:'2026-12-22',suspendedDays:0,file:'browser-ju-initial-de-ax.txt',expected:['17.12.2026','22.12.2026','Kein Friststillstand']},
  {id:'JU-REVIEW-DE',receipt:'2026-12-17',days:5,result:'2027-01-07',suspendedDays:16,file:'browser-ju-review-de-ax.txt',expected:['17.12.2026','07.01.2027','03.01.2027','KEIN KALENDEREXPORT']},
  {id:'JU-REVIEW-FR',receipt:'2026-12-17',days:5,result:'2027-01-07',suspendedDays:16,file:'browser-ju-review-fr-ax.txt',expected:['17.12.2026','07.01.2027','03.01.2027','AUCUN EXPORT DE CALENDRIER']}
];
for(const row of cases){
  const text=await readFile(resolve(root,out+'/'+row.file),'utf8');
  for(const value of row.expected)assert.ok(text.includes(value),row.id+' '+value);
  if(row.definitiveResult===false)assert.equal(text.includes('container Lokale Prüfrechnung'),false,'Unclear opening must remove result');
}
const trace=await readFile(resolve(root,out+'/browser-ju-trace-fr-ax.txt'),'utf8');
assert.ok(trace.includes('Notification déterminante')&&trace.includes('Seule cette demande est calculée.'));
const screenshots=await Promise.all(['browser-ge-post-de.jpg','browser-fr-court-summer-de.jpg',
  'browser-ju-review-de.jpg','browser-ju-review-fr.jpg','browser-ju-trace-fr.jpg','browser-ju-review-de-final.jpg'].map(name=>bind(out+'/'+name)));
for(const image of screenshots){const bytes=await readFile(resolve(root,image.path));assert.equal(bytes.subarray(0,3).toString('hex'),'ffd8ff');}
const report={workPackage:'AP23J3',status:'passed',asOf:'2026-10-27',
  method:'CUA interactions, accessibility observations, read-only rendered DOM and visual screenshot inspection',
  actualLocalBuild:true,url:dom.url,languages:['de','fr'],realDeviceTest:false,realM365HostTest:false,
  viewport:dom.viewport,horizontalOverflow:false,twoColumnLayout:true,earlyDateEntryVerified:true,
  staticAuthorityLabel:true,noAdditionalDocumentOrHolidayDropdown:true,actualExportEnabled:false,
  openingAlternativesExplicit:true,unknownOpeningBlocksResult:true,cases:cases.map(({expected,...row})=>row),
  asset,domObservation:await bind(out+'/browser-dom-observation.json'),
  accessibility:await Promise.all([...cases.map(row=>row.file),'browser-ju-trace-fr-ax.txt'].map(name=>bind(out+'/'+name))),screenshots,
  limitations:'Desktop in-app browser only. No real iOS, M365, guest, download or Outlook test. Defaults and all-path coverage are separately tested against the final minified Web bundle.'};
await writeFile(resolve(root,out+'/browser-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,observedCases:cases.length,asset:asset.path,realDeviceTest:false}));
