// SPDX-License-Identifier: AGPL-3.0-only
// Bind observations made through CUA, not an invented automated browser run.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23i3-2026-10-22';
const json=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const bind=async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,
  sha256:createHash('sha256').update(bytes).digest('hex')};};
assert.deepEqual(process.argv.slice(2),['--write']);
const dom=await json(out+'/browser-dom-observation.json');
assert.equal(dom.url,'http://127.0.0.1:8806/fristenrechner/');
assert.ok(dom.scrollWidth<=dom.viewport.width,'Horizontal overflow');
const left=dom.controls.find(row=>row.id==='Dropdown8'),right=dom.controls.find(row=>row.id==='Dropdown9');
assert.equal(left.rect.y,right.rect.y);assert.ok(right.rect.x>left.rect.x+left.rect.width);
const script=dom.scripts.find(url=>/\/assets\/app-[A-Z0-9]+\.js$/.test(url));assert.ok(script);
const asset=await bind('.work/public-ap23i3/assets/'+script.split('/').at(-1));
const web=await json(out+'/web-build.json');assert.ok(web.artifacts.some(row=>row.path===asset.path&&row.sha256===asset.sha256));
for(const[language,expected]of[['de','KEIN KALENDEREXPORT'],['fr','AUCUN EXPORT DE CALENDRIER']]){
  const ax=await readFile(resolve(root,out+'/browser-tg-'+language+'-ax.txt'),'utf8');
  assert.ok(ax.includes('04.01.2027')&&ax.includes('14.12.2026')&&ax.includes(expected));
}
const screenshots=await Promise.all(['browser-gl-de.jpg','browser-tg-de.jpg','browser-tg-fr.jpg',
  'browser-tg-fr-full.jpg','browser-tg-de-final.jpg','browser-tg-de-full.jpg'].map(name=>bind(out+'/'+name)));
for(const image of screenshots){const bytes=await readFile(resolve(root,image.path));
  assert.equal(bytes.subarray(0,3).toString('hex'),'ffd8ff');}
const report={status:'passed',asOf:'2026-10-22',method:'CUA interactions, accessibility observations, read-only rendered DOM and visual screenshot inspection',
  actualLocalBuild:true,url:dom.url,languages:['de','fr'],realDeviceTest:false,realM365HostTest:false,
  viewport:dom.viewport,horizontalOverflow:false,twoColumnLayout:true,earlyDateEntryVerified:true,
  staticAuthorityLabel:true,noAdditionalDocumentOrHolidayDropdown:true,actualExportEnabled:false,
  cases:[
    {id:'GL-30-DE',receipt:'2026-10-02',days:30,result:'2026-11-02'},
    {id:'GL-SHORT-DE',receipt:'2026-10-02',durationInitiallyBlank:true,days:7,result:'2026-10-09'},
    {id:'TG-86-GIVEN-DE',receipt:'2026-12-14',days:5,result:'2026-12-21',suspendedDays:0},
    {id:'TG-86-ABSENT-DE',receipt:'2026-12-14',days:5,result:'2027-01-04',suspendedDays:16},
    {id:'TG-86-UNCLEAR-DE',definitiveResult:false,automaticSuspension:'unresolved'},
    {id:'TG-86-ABSENT-FR',receipt:'2026-12-14',days:5,result:'2027-01-04',suspendedDays:16}
  ],asset,domObservation:await bind(out+'/browser-dom-observation.json'),
  accessibility:await Promise.all(['browser-tg-de-ax.txt','browser-tg-fr-ax.txt','browser-tg-trace-de-ax.txt'].map(name=>bind(out+'/'+name))),screenshots,
  limitations:'Desktop in-app browser only. No real iOS, M365, guest, download or Outlook test. Defaults and all-path coverage are separately tested against the actual minified Web bundle.'};
await writeFile(resolve(root,out+'/browser-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,observedCases:report.cases.length,asset:asset.path,realDeviceTest:false}));
