// SPDX-License-Identifier: AGPL-3.0-only
// Capture protected existing inputs before G3 source integration.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex'),j=async p=>JSON.parse(await readFile(p));
const out='outputs/ap23g3-2026-10-22',file=out+'/protected-inputs.json',files={};
async function add(p,h){const b=await readFile(p),actual=hash(b);if(h)assert.equal(actual,h,p);files[p]=actual;}
async function walk(p){for(const e of await readdir(p,{withFileTypes:true})){
  assert.ok(!e.isSymbolicLink(),p+'/'+e.name);if(e.isDirectory())await walk(p+'/'+e.name);else await add(p+'/'+e.name);}}
const base=await j('outputs/ap23f3-2026-10-22/protected-inputs.json'),extra=await j('outputs/ap23f3-2026-10-22/additional-protected-inputs.json');
for(const[p,h]of Object.entries({...base.files,...extra}))await add(p,h);
for(const dir of['data/candidates/2026-10-22-ap23f3','schemas','outputs/ap23g2-candidate-2026-10-22','outputs/ap23g2-2026-10-22'])await walk(dir);
for(const dir of['outputs/ap23g1-abnahme-2026-10-22','outputs/ap23g2-abnahme-2026-10-22'])await walk(dir);
for(const p of['src/core/releaseFormat10.ts','src/core/administrativeCatalogV3.ts','src/core/administrativeTypesV3.ts',
  'src/core/format10Runtime.ts','src/core/format10CalculationData.ts','src/core/format10Baseline.ts','src/core/administrativeV3Baseline.ts','src/core/holidayActivationV10.ts',
  'src/core/dayDeadlineArithmetic.ts','scripts/build-ap23g2-schemas.mjs','scripts/build-ap23g2-candidate.mjs','scripts/check-ap23g2-contract.mjs',
  'scripts/check_ap23g2_independent.py','scripts/finalize-ap23g2.mjs','docs/architektur/verwaltungsverfahrensvertrag-ap23g2.md',
  'docs/architektur/verwaltungsverfahrensvertrag-ap23g2-pruefung.md','docs/entscheidungen/DEC-2026-036-eroeffnungsketten-und-begruendungsverlangen-v4.md'])await add(p);
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();assert.equal(head,'70ce67425e046a7a38a4fbe66acbd93c75ca5983');
const report={workPackage:'AP23G3',capturedBeforeIntegration:true,head,files,operatingChangesAuthorized:false,sourceReleaseApproved:false};
await mkdir(out,{recursive:true});try{await readFile(file);throw new Error('Existing initial snapshot must not be refreshed');}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({protectedFiles:Object.keys(files).length,head},null,2));
