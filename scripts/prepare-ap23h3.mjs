// SPDX-License-Identifier: AGPL-3.0-only
// Freeze original pre-integration files, separating intended source edits from immutable history.
import assert from 'node:assert/strict';
import {readFile,readdir,lstat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,safeRelative,sha256} from './archive-ap23h2-acceptance.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23h3-2026-10-22';
const read=p=>readFile(resolve(root,p));
const json=async p=>JSON.parse(await read(p));
const files={},mutableFiles={};
const core=['administrativeTypes.ts','administrativeCatalog.ts','administrativeDeadline.ts','calculateDeadline.ts','calculateCalendarBoundDeadline.ts',
  'calculatorRuntime.ts','calendarResolution.ts','index.ts','socialCatalog.ts','socialDeadline.ts','calculateSpecialDeadline.ts'].map(p=>'src/core/'+p);
const ui=['FristenrechnerApp.tsx','administrativeUi.tsx','administrativeMessages.ts','administrativeDefaults.ts','administrativeExport.ts','socialUi.ts'].map(p=>'src/ui/'+p);
const host=['package.json','scripts/build-public-app.mjs','spfx/scripts/sync-schemas.mjs','spfx/src/core/ReleaseValidator.ts',
  'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx'];
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
async function pathsUnder(dir){const rows=[];for(const e of await readdir(resolve(root,dir),{withFileTypes:true})){
  const p=dir+'/'+e.name;assert.ok(!e.isSymbolicLink(),'Symlink '+p);if(e.isDirectory())rows.push(...await pathsUnder(p));else{assert.ok(e.isFile());rows.push(p);}
}return rows.sort();}
const mutable=new Set([...core,...ui,...host,...await pathsUnder('spfx/src/product')]);
const add=async(path,expected)=>{safeRelative(path);const stat=await lstat(resolve(root,path));assert.ok(stat.isFile()&&!stat.isSymbolicLink(),path);
  const b=await read(path),actual=sha256(b);if(expected)assert.equal(actual,expected,'Changed original '+path);
  if(living.includes(path))return;
  (mutable.has(path)?mutableFiles:files)[path]=actual;
};
const archive=await archiveAcceptance({root});assert.equal(archive.mode,'archive-reverified','Create exact H2 archive first');
assert.equal(sha256(await read(archiveConfig.protected.path)),archiveConfig.protected.sha256);
const h2=await json(archiveConfig.protected.path),proof=await json(archiveConfig.proofPath);
for(const[p,h]of Object.entries(h2.files))await add(p,h);
for(const d of proof.bindings)await add(d.path,d.sha256);
for(const p of[archiveConfig.proofPath,...await pathsUnder(archiveConfig.target),'scripts/archive-ap23h2-acceptance.mjs',
  'tests/governance/ap23h2-acceptance.test.mjs','scripts/prepare-ap23h3.mjs'])await add(p);
for(const p of mutable)try{await add(p);}catch(e){if(e.code!=='ENOENT')throw e;}
const livingAtStart={};for(const p of living)livingAtStart[p]=sha256(await read(p));
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();assert.equal(head,h2.head);
assert.equal(sha256(await read('outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx')),
  '46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61');
const mutableRecord={workPackage:'AP23H3',capturedBeforeIntegration:true,head,
  existingFiles:Object.fromEntries(Object.entries(mutableFiles).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,
  intendedChanges:'Only these explicitly inventoried existing dispatcher, UI and host/generated-source files may change. New H3 modules and artifacts are separate. Old V1–11 modules, arithmetic, generated data, tests and historical evidence remain immutable.'};
const mutablePath=out+'/mutable-inputs.json',mutableBytes=Buffer.from(JSON.stringify(mutableRecord,null,2)+'\n');
const record={workPackage:'AP23H3',capturedBeforeIntegration:true,head,acceptedH2Archive:archive,
  acceptedH2Proof:{path:archiveConfig.proofPath,sha256:archiveConfig.proofSha256},
  files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),
  mutableInventory:{path:mutablePath,sha256:sha256(mutableBytes),existingFiles:Object.keys(mutableFiles).length,livingFiles:living.length},
  operatingChangesAuthorized:false,sourceReleaseApproved:false};
await mkdir(resolve(root,out),{recursive:true});
await writeFile(resolve(root,mutablePath),mutableBytes,{flag:'wx'});
const guardPath=out+'/protected-inputs.json',guardBytes=Buffer.from(JSON.stringify(record,null,2)+'\n');
await writeFile(resolve(root,guardPath),guardBytes,{flag:'wx'});
console.log(JSON.stringify({guardPath,guardSha256:sha256(guardBytes),protectedFiles:Object.keys(files).length,
  mutablePath,mutableSha256:sha256(mutableBytes),mutableExistingFiles:Object.keys(mutableFiles).length,livingFiles:living.length,head,archive},null,2));
