// SPDX-License-Identifier: AGPL-3.0-only
// Verify documentation-only G3 acceptance and H1 preparation. No release approval.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {archiveAcceptance} from './archive-ap23g3-acceptance.mjs';

const output='outputs/ap23h1-vorbereitung-2026-10-22';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:digest(bytes)};};
const archive=await archiveAcceptance();
assert.equal(archive.mode,'archive-reverified');
assert.equal(archive.files,218);
assert.equal(archive.receiptSha256,'8b1c51e00a7db862b38a58ead5a20c7e4fa1fdd48c196c07329390f9198dbf7b');
const before='outputs/ap23g3-2026-10-22';
assert.equal((await bind(before+'/local-completion.json')).sha256,'4a394c06458724f6a1e955651efb5c98012ea1998607d7e31283c69d87a60278');
const proof=await json(before+'/local-completion.json');
const guard=await json(before+'/protected-inputs.json');
for(const[path,sha256]of Object.entries(guard.files))assert.equal((await bind(path)).sha256,sha256,path);
assert.equal(Object.keys(guard.files).length,719);
const living=new Set(['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md']);
const changed=[];
for(const descriptor of [...proof.sourceBindings,...proof.evidence]){
  const current=await bind(descriptor.path);
  if(living.has(descriptor.path)){
    assert.notEqual(current.sha256,descriptor.sha256,'Expected live status update '+descriptor.path);
    changed.push(descriptor.path);
  }else assert.deepEqual(current,descriptor,'Changed accepted integration byte '+descriptor.path);
}
assert.deepEqual(new Set(changed),living);
const receipt=await json('outputs/ap23g3-abnahme-2026-10-22/receipt.json');
assert.equal(receipt.accepted,true);
for(const key of['sourceReleaseApproved','deployable','deployed','published'])assert.equal(receipt[key],false,key);
const issue=await json(output+'/issue48-status.json');
assert.equal(issue.readbackVerified,true);assert.equal(issue.previousBodyPreserved,true);
assert.equal(issue.g3HumanAcceptance,true);assert.equal(issue.h1ScopeConfirmed,false);assert.equal(issue.h1Started,false);
assert.equal(issue.sourcePublicationPerformed,false);assert.equal(issue.state,'open');
const docs=[...living,'docs/fachrecht/abnahme-ap23g3.md','docs/planung/ap23h1-vorbereitung-ow-nw.md'];
let links=0;
for(const path of docs){
  const text=await readFile(path,'utf8');
  assert.ok(!text.includes('ß'),'Swiss spelling '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].replace(/^<|>$/g,'').split('#')[0];
    if(!target||/^[a-z]+:/i.test(target))continue;
    await stat(resolve(dirname(path),decodeURIComponent(target)));
    links++;
  }
}
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
assert.equal(head.status,0);assert.equal(head.stdout.trim(),proof.head);
const whitespace=spawnSync('git',['diff','--check'],{encoding:'utf8'});assert.equal(whitespace.status,0,whitespace.stderr||whitespace.stdout);
const tests=spawnSync(process.execPath,['--test','tests/governance/ap23g3-acceptance.test.mjs'],{encoding:'utf8',maxBuffer:4*1024*1024});
assert.equal(tests.status,0,tests.stderr||tests.stdout);
const counts=Object.fromEntries([...tests.stdout.matchAll(/^# (tests|pass|fail|skipped|cancelled) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.equal(counts.tests,31);assert.equal(counts.pass,31);assert.equal(counts.fail,0);assert.equal(counts.skipped,0);
await mkdir(output,{recursive:true});
await writeFile(output+'/archive-tests.txt',tests.stdout+tests.stderr);
const paths=[...docs,'scripts/check-ap23h1-preparation.mjs','scripts/archive-ap23g3-acceptance.mjs',
  'tests/governance/ap23g3-acceptance.test.mjs',output+'/issue48-status.json',output+'/archive-tests.txt',
  'outputs/ap23g3-abnahme-2026-10-22/receipt.json'];
const report={status:'passed',stage:'AP23G3 acceptance and AP23H1 preparation only',head:proof.head,
  g3HumanAcceptance:true,h1ScopeConfirmed:false,h1Started:false,sourceReleaseApproved:false,
  operatingRelease:'MVP 0.9',regularIntermediateRelease:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,
  archive,protectedFilesUnchanged:719,acceptedBindingsCompared:proof.sourceBindings.length+proof.evidence.length,
  allowedLivingStatusChanges:changed,localLinksChecked:links,archiveTestCounts:counts,
  review:'Read-only OW and NW source checks and independent draft reviews. AI work split is not human approval.',
  files:await Promise.all(paths.map(bind))};
await writeFile(output+'/verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,protectedFiles:719,archiveFiles:archive.files,
  allowedLivingStatusChanges:changed.length,localLinksChecked:links,tests:counts,h1Started:false},null,2));
