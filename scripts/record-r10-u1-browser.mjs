// SPDX-License-Identifier: AGPL-3.0-only
// Bind personally observed local browser evidence, without source or host approval.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out='outputs/r10-u1-2026-10-28',read=p=>readFile(p),json=async p=>JSON.parse(await read(p));
const bind=async path=>{const b=await read(path);return{path,byteLength:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const web=await json(out+'/web-build.json'),layout=await json(out+'/layout-build.json'),measured=await json(out+'/browser-layout-measurements.json');
assert.equal(web.status,'passed');assert.equal(layout.status,'built-awaiting-browser-measurement');
assert.equal(measured.status,'measured-awaiting-judgment');assert.equal(measured.cases.length,8);
for(const expected of layout.cases){const actual=measured.cases.find(r=>r.id===expected.id);assert.ok(actual,expected.id);
 assert.equal(actual.viewportWidth,expected.viewportWidthCssPixels);assert.ok(actual.documentScrollWidth<=actual.viewportWidth+1);
 assert.ok(actual.row.left>=actual.host.left-1&&actual.row.right<=actual.host.right+1);
 assert.ok(actual.row.scrollWidth<=actual.row.clientWidth+1);
 for(const child of [actual.label,actual.code])assert.ok(child.left>=actual.row.left-1&&child.right<=actual.row.right+1&&child.bottom<=actual.row.bottom+1,expected.id+' child fully inside');
 assert.equal(actual.code.text,expected.providerLabel);assert.equal(actual.label.text,expected.bilingualLabel);
 assert.equal(actual.styles.flexWrap,'wrap');assert.equal(actual.styles.boxSizing,'border-box');assert.equal(actual.styles.overflowWrap,'anywhere');
}
const source=(await read(out+'/browser-social-options-de.txt')).toString();for(const law of ['IVG','AHVG','UVG','ELG','AVIG','KVG','EOG','FamZG','FLG','MVG','ÜLG'])assert.ok(source.includes(law),law);
for(const locale of['de','fr']){const early=(await read(out+'/browser-early-abort-'+locale+'.txt')).toString(),social=(await read(out+'/browser-social-result-'+locale+'.txt')).toString();
 assert.ok(early.includes('28.08.2026'));assert.ok(early.includes(locale==='de'?'Eine Ergebnisherkunft wurde noch nicht aufgebaut.':'avant l’établissement de l’origine du résultat.'));
 assert.equal(early.includes(locale==='de'?'Bezeichnungen können nicht sicher aufgelöst':'Les désignations ne peuvent pas être résolues'),false);
 assert.ok(social.includes('16.10.2026'));assert.ok(social.includes(locale==='de'?'KALENDEREXPORT ERST NACH RELEASEFREIGABE':'EXPORT APRÈS VALIDATION DE LA VERSION'));
 assert.equal(/button .*?(?:Kalendereintrag|Événement de calendrier)/u.test(social),false);
}
const observed=(await readdir(out)).filter(p=>/^browser-.+\.(?:txt|png|json)$/u.test(p)&&p!=='browser-verification.json').sort().map(p=>out+'/'+p);
assert.ok(observed.filter(p=>p.endsWith('.png')).length>=7);
const paths=[...new Set([...observed,...web.artifacts.map(r=>r.path),...layout.artifacts.map(r=>r.path)])].sort();
const report={workPackage:'R10-U1',status:'passed-local-browser',asOf:'2026-10-28',localOnly:true,
 url:'http://127.0.0.1:8812/fristenrechner/',layoutUrl:'http://127.0.0.1:8812/layout/',dataReleaseId:web.dataReleaseId,
 languages:['de','fr'],layoutWidths:[1120,400,373,320],
 checks:{socialLawSelectionVisible:true,earlyAbortText:true,actualPackageRowWraps:true,localReferenceExportBlocked:true},
 observedLayoutCases:measured.cases.length,actualPackage:layout.package,realDeviceOrM365Test:false,realZoomTest:false,sourceReleaseApproved:false,operatingChanges:false,
 note:'Actual IAB UI and actual package static wrapper fixture. Synthetic provider labels. Frame widths are real CSS viewports, not browser zoom or M365 tests. No download or Outlook import.',
 evidence:await Promise.all(paths.map(bind))};
await writeFile(out+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,layoutCases:report.observedLayoutCases,evidence:report.evidence.length}));

