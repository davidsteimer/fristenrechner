// SPDX-License-Identifier: AGPL-3.0-only
// Bind screenshots from actual CUA browser observations. This does not rerun UI interactions.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23h3-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex');
const bind=async path=>{const b=await readFile(resolve(root,path));return{path,byteLength:b.length,sha256:hash(b)};};
const web=JSON.parse(await readFile(resolve(root,out,'web-build.json')));
assert.equal(web.status,'passed');
const observed='app-P36VNTVA.js';
const asset=web.artifacts.find(a=>a.path.endsWith('/'+observed));
assert.ok(asset,'Actual observed browser asset no longer matches the final web build');
assert.deepEqual(await bind(asset.path),asset);
const screenshots=await Promise.all(['browser-ow-de.png','browser-ow-result-de.png','browser-ow-fr.png','browser-nw-winter-fr.png'].map(n=>bind(out+'/'+n)));
const report={workPackage:'AP23H3',status:'passed',actualLocalBuild:true,languages:['de','fr'],
  method:'Actual in-app browser through CUA. Observed form selections, rendered dates, read-only DOM layout measurements and screenshots. This script binds that evidence, not a new browser run.',
  url:'http://127.0.0.1:8805/fristenrechner/',asset,
  layout:{viewportWidth:1240,viewportHeight:1073,documentWidth:1240,formGridColumns:['487px','487px'],horizontalOverflow:false},
  observedCases:[
    {canton:'OW',pathId:'ow-admin-20',date:'2026-10-02',positiveOpening:'originalReasoned',finalEnd:'2026-10-22',firstCounted:'2026-10-03',suspendedDays:0,languages:['de','fr']},
    {canton:'NW',pathId:'nw-einwendung-ordered',date:'2026-12-10',days:20,finalEnd:'2027-01-15',firstCounted:'2026-12-11',suspendedDays:16,stillstand:'winterOnly',language:'fr'}
  ],
  checked:['Early editable date, without waiting for all selections','Actual two-column form and two equal-width button rows',
    'Changing canton resets incompatible law and current-case qualification','Readable source links and separate actual-period norm references',
    'OW administrative GOG interpretation identified explicitly','NW winter-only parameter displayed','No calendar export control'],
  realDeviceTest:false,realM365HostTest:false,narrowViewportVisualTest:false,
  screenshots,sourceReleaseApproved:false,operatingPermission:false};
await writeFile(resolve(root,out,'browser-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,asset:asset.path,screenshots:screenshots.length},null,2));
