// SPDX-License-Identifier: AGPL-3.0-only
// Freeze research inputs once. Never refresh a baseline after research changes.
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {archiveAcceptance} from './archive-ap23g3-acceptance.mjs';
const output='outputs/ap23h1-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex');
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
const file=output+'/protected-inputs.json';
const archive=await archiveAcceptance();assert.equal(archive.mode,'archive-reverified');
const old=await readJson('outputs/ap23g3-2026-10-22/protected-inputs.json');
for(const[p,h]of Object.entries(old.files))assert.equal(hash(await readFile(p)),h,p);
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const paths=new Set(Object.keys(old.files));
const proof=await readJson('outputs/ap23g3-2026-10-22/local-completion.json');
for(const row of [...proof.sourceBindings,...proof.evidence,proof.candidateManifest])if(!living.includes(row.path))paths.add(row.path);
paths.add('outputs/ap23g3-2026-10-22/local-completion.json');
const receiptPath='outputs/ap23g3-abnahme-2026-10-22/receipt.json';
const receipt=await readJson(receiptPath);paths.add(receiptPath);
for(const row of receipt.artifacts)paths.add('outputs/ap23g3-abnahme-2026-10-22/'+row.path);
const prep='outputs/ap23h1-vorbereitung-2026-10-22/verification.json';
const p=await readJson(prep);paths.add(prep);
for(const row of p.files){assert.equal(hash(await readFile(row.path)),row.sha256,row.path);if(!living.includes(row.path))paths.add(row.path);}
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  assert.ok(!entry.isSymbolicLink(),'Symlink '+dir+'/'+entry.name);
  const path=dir+'/'+entry.name;
  if(entry.isDirectory())await walk(path);else if(!path.includes('ap23h1'))paths.add(path);
}}
for(const dir of['src','schemas','data/releases','data/candidates','spfx/src','tests'])await walk(dir);
const files={};for(const path of [...paths].sort())files[path]=hash(await readFile(path));
const livingAtStart={};for(const path of living)livingAtStart[path]=hash(await readFile(path));
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(head,proof.head);
const result={workPackage:'AP23H1',createdOn:'2026-10-22',scopeConfirmedBy:'David Steimer',
  userStartStatement:'Einverstanden. Bitte starte AP23H1 für Obwalden und Nidwalden im vorgeschlagenen Untersuchungsumfang.',
  head,acceptedG3Archive:archive,files,livingAtStart,
  scope:'Research only. No product code, accepted data, schemas, existing tests, operating pins or historical proof changes. Living entry texts may reflect the authorised H1 start and completed research.'};
await mkdir(output,{recursive:true});await writeFile(file,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'research-baseline-frozen',protectedFiles:paths.size,livingStatusFiles:living.length,head}));
