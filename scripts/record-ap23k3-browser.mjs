// SPDX-License-Identifier: AGPL-3.0-only
// Bind manually observed CUA desktop-browser evidence, not real-device or M365 tests.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='outputs/ap23k3-2026-10-27';
const bind=async path=>{const bytes=await readFile(path);return {path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const ax=async name=>readFile(`${dir}/browser-${name}.ax.txt`,'utf8');
const cases=[
 {id:'BS-BL-no-closure-inheritance',file:'bs-bl',required:['14.12.2026','24.12.2026','Basel-Landschaft (BL)','Kein Friststillstand']},
 {id:'BS-TI-holiday-anchor',file:'bs-ti',required:['28.11.2026','09.12.2026','08.12.2026','Tessin (TI)']},
 {id:'BS-BS-counterfactual-anchor',file:'bs-bs',required:['28.11.2026','08.12.2026','Basel-Stadt (BS)']},
 {id:'BS-readable-norm-trace',file:'bs-ti-trace',required:['Verwaltungsrechtspflegegesetz BS (VRPG): §§ 10, 16 Abs. 1, 21 Abs. 1–2','gesetzessammlung.bs.ch/api/de/versions/5116/pdf_file','Mariä Empfängnis :  08.12.2026']},
 {id:'BL-year-end-closures',file:'bl-yearend',required:['14.12.2026','04.01.2027','24.12.2026','Ganztägige Büroschliessungen automatisch berücksichtigt']},
 {id:'BL-uncertainty-blocks-definitive-result',file:'bl-collision',required:['30.01.2027','09.02.2027','10.02.2027','Für diesen Fall kann kein definitiver Fristablauf angegeben werden.','Die Vergleichsvarianten sind nur Nachweise. Kein definitives Fristresultat und kein Kalenderexport.','Nicht abschliessend bestimmbar. Siehe Vergleichsvarianten.']},
 {id:'BL-French-blocked-trace',file:'bl-collision-fr',required:['30.01.2027','09.02.2027','10.02.2027','Report non déterminable définitivement. Voir les variantes comparatives.']},
 {id:'BL-French-result',file:'bl-fr',required:['Recours administratif général (10 jours)','04.01.2027','AUCUN EXPORT DE CALENDRIER POUR LES CALCULS DE RÉFÉRENCE LOCAUX']}
];
for(const item of cases){const text=await ax(item.file);for(const part of item.required)assert.ok(text.includes(part),`${item.id}: ${part}`);}
const blocked=await ax('bl-collision');
assert.ok(!blocked.includes('container FRISTABLAUF'),'No definitive result tile on blocked case');
assert.ok(!blocked.includes('button Kalendereintrag'),'No calendar action on blocked case');
assert.ok(!blocked.includes('text Keine zusätzliche Büroschliessung hat'),'No definitive negative closure claim on blocked comparison');
const web=JSON.parse(await readFile(dir+'/web-build.json','utf8'));assert.equal(web.status,'passed');
const captures=(await readdir(dir)).filter(name=>/^browser-.*(?:\.ax\.txt|\.png)$/u.test(name)).sort();
assert.equal(captures.filter(name=>name.endsWith('.png')).length,7);
const evidence=await Promise.all([...captures.map(name=>dir+'/'+name),...web.artifacts.map(item=>item.path),'scripts/record-ap23k3-browser.mjs'].map(bind));
for(const artifact of web.artifacts)assert.deepEqual(await bind(artifact.path),artifact);
const report={workPackage:'AP23K3',status:'passed',asOf:'2026-10-27',method:'CUA interaction and visual inspection of the actual final static build in the desktop in-app browser. AX captures are persisted observations, not a simulated browser.',
 url:'http://127.0.0.1:8808/fristenrechner/',cases:cases.map(({id,file})=>({id,status:'observed-matching',capture:`${dir}/browser-${file}.ax.txt`})),
 visualObservations:['Two-column desktop form and two-by-two action buttons preserved.','Date field and other inputs visually aligned.','DE and FR result and automatic-parameter panels readable without visible clipping.','Only qualified party canton shown where legally required, no free closure override.','Norm labels and source links readable in the expanded trace.'],
 limitations:['Desktop viewport only. No new narrow-viewport or real iOS/Android/M365 host inspection in this local step.','Does not replace human professional and technical AP23K3 acceptance.','Candidate export remains blocked. No calendar file saved and no Outlook import.'],
 realDeviceOrM365Test:false,humanAcceptance:false,sourceReleaseApproved:false,operatingChanges:false,screenshots:7,evidence};
await writeFile(dir+'/browser-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,observations:cases.length,screenshots:report.screenshots,boundArtifacts:evidence.length}));
