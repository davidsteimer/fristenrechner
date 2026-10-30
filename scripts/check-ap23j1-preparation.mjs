// SPDX-License-Identifier: AGPL-3.0-only
// Documentation-only I3 acceptance and J1 scope proposal. No research start or release.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig} from './archive-ap23i3-acceptance.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const output='outputs/ap23j1-vorbereitung-2026-10-27';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const bytes=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await bytes(path));
const bind=async path=>{const value=await bytes(path);return{path,byteLength:value.length,sha256:digest(value)};};
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const acceptance='docs/fachrecht/abnahme-ap23i3.md',preparation='docs/planung/ap23j1-vorbereitung-fr-ge-ju.md';
const targetReceipt=archiveConfig.target+'/receipt.json';
const archive=await archiveAcceptance({root});
assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,822);
assert.equal(archive.receiptSha256,'9c43382c61788c665e1ac814410bdd56e0db396b77e2a1157347a116a4183cfe');
const receipt=await json(targetReceipt),proof=await json(archiveConfig.proofPath);
assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.acceptedOn,'2026-10-27');
assert.equal(receipt.acceptedBy,'David Steimer');assert.equal(receipt.originalBindingCount,820);
assert.equal(receipt.artifacts.length,822);assert.equal(receipt.explicitTransitivePayloads.length,1);
assert.equal(proof.professionalTechnicalAcceptance,false,'Historical proof is not the later acceptance record');
assert.equal((await bind(archiveConfig.proofPath)).sha256,archiveConfig.proofSha256);
for(const key of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished','operatingPermission','commitPermission','sourcePushPermission'])
  assert.equal(receipt[key],false,key);
const changed=[],preserved=[];
for(const row of receipt.artifacts){
  const actual=await bind(row.path);
  if(living.includes(row.path)){
    assert.notEqual(actual.sha256,row.sha256,'Expected living status update '+row.path);changed.push(row.path);
  }else{assert.deepEqual(actual,row,'Changed accepted I3 byte '+row.path);preserved.push(row.path);}
}
assert.deepEqual(changed.sort(),[...living].sort());assert.equal(preserved.length,815);
const guard=await json('outputs/ap23i3-2026-10-22/protected-inputs.json');
assert.equal(Object.keys(guard.files).length,2839);
for(const[path,expected]of Object.entries(guard.files))assert.equal((await bind(path)).sha256,expected,'Historical input '+path);
const supplement=await json('outputs/ap23i3-2026-10-22/generated-schema-supplement.json');assert.equal(supplement.copies.length,5);
for(const copy of supplement.copies)assert.deepEqual(await bytes(copy.path),await bytes(copy.source),'Exact generated schema '+copy.path);
const userDocument='outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx';
assert.equal((await bind(userDocument)).sha256,'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61');

const cantonInventory={all:'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '),
  operational:'BE TI GR LU ZG AR'.split(' '),locallyAcceptedOnly:'ZH AG SG UR SO SH OW NW GL TG'.split(' '),
  remaining:'AI BS BL FR GE JU NE SZ VD VS'.split(' '),proposedNext:['FR','GE','JU']};
const union=[...cantonInventory.operational,...cantonInventory.locallyAcceptedOnly,...cantonInventory.remaining];
assert.equal(union.length,26);assert.equal(new Set(union).size,26);assert.deepEqual([...union].sort(),[...cantonInventory.all].sort());
assert.equal(cantonInventory.operational.length+cantonInventory.locallyAcceptedOnly.length,16);
assert.equal(cantonInventory.remaining.length,10);assert.ok(cantonInventory.proposedNext.every(code=>cantonInventory.remaining.includes(code)));
const remainingAfterProposed=cantonInventory.remaining.filter(code=>!cantonInventory.proposedNext.includes(code));
assert.deepEqual(remainingAfterProposed,['AI','BS','BL','NE','SZ','VD','VS']);
const prep=await bytes(preparation),prepText=prep.toString();
for(const phrase of['AP23J1 ist vorbereitet, aber noch nicht gestartet.','Höchstens fünf Nettoarbeitstage','Art. 17 Abs. 6',
  'Art. 121 LJ/JG','Art. 87 Abs. 2','Art. 86 Abs. 3','29.08.2026–31.12.2027','AP23J2','AP23J3'])assert.ok(prepText.includes(phrase),phrase);
assert.ok((await bytes(acceptance)).toString().includes(receipt.userStatement));
let links=0;
for(const path of[...living,acceptance,preparation]){
  const text=(await bytes(path)).toString();assert.equal(/[;ß]/u.test(text),false,'Swiss prose '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    const local=match[1].replace(/^<|>$/g,'').split('#')[0];if(!local||/^[a-z]+:/i.test(local))continue;
    await stat(resolve(root,dirname(path),decodeURIComponent(local)));links++;
  }
}
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});assert.equal(head.status,0);assert.equal(head.stdout.trim(),proof.head);
const whitespace=spawnSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});assert.equal(whitespace.status,0,whitespace.stdout+whitespace.stderr);
// Reuse only the exact newly executed archive QA, not the old product test totals as a new run.
const archiveQaPath='outputs/ap23i3-abnahme-qa-2026-10-27/verification.json';
const archiveQa=await json(archiveQaPath),archiveTestLog='outputs/ap23i3-abnahme-qa-2026-10-27/tests.txt';
const tap=(await bytes(archiveTestLog)).toString();
const archiveTests=Object.fromEntries([...tap.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(match=>[match[1],Number(match[2])]));
assert.deepEqual(archiveTests,{tests:47,pass:47,fail:0,cancelled:0,skipped:0,todo:0});
assert.equal(archiveQa.status,'passed');
assert.equal(archiveQa.sourceProofUnchanged,true);assert.deepEqual(archiveQa.archive,archive);
assert.deepEqual(await bind(archiveQa.tests.path),{path:archiveQa.tests.path,byteLength:archiveQa.tests.byteLength,sha256:archiveQa.tests.sha256});
for(const row of archiveQa.sources)assert.deepEqual(await bind(row.path),row,'Reused archive QA source '+row.path);
for(const key of['sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(archiveQa[key],false,key);
const report={status:'passed',stage:'AP23I3 human acceptance and AP23J1 proposal preparation only',date:'2026-10-27',head:proof.head,
  i3HumanAcceptance:true,j1ScopeConfirmed:false,j1Started:false,j2Started:false,j3Started:false,
  sourceReleaseApproved:false,regularIntermediateRelease:false,commitCreated:false,sourcePushPerformed:false,githubStatusPublished:false,
  installationPerformed:false,operatingChanges:false,operatingRelease:'MVP 0.9',archive,
  acceptedI3CurrentFilesUnchanged:preserved.length,historicalProtectedFilesUnchanged:2839,generatedSchemasUnchanged:5,
  allowedLivingStatusChanges:changed,userDocumentPreserved:true,cantonInventory,remainingAfterProposed,localLinksChecked:links,
  archiveTests,archiveTestReuse:'Exact fresh archive implementation and 47-test run. Product sources, accepted arithmetic, data and test packages are unchanged. No new full product or host run is claimed.',
  legalPreparation:'Bounded official FR/GE/JU reading for scope selection. No completed J1 source chronology or positive case release.',
  proposalSha256:digest(prep),files:await Promise.all([...living,acceptance,preparation,'scripts/check-ap23j1-preparation.mjs',
    'scripts/archive-ap23i3-acceptance.mjs','tests/governance/ap23i3-acceptance.test.mjs',targetReceipt,archiveQaPath,archiveTestLog].map(bind))};
await mkdir(resolve(root,output),{recursive:true});
await writeFile(resolve(root,output+'/verification.json'),JSON.stringify(report,null,2)+'\n');
for(const row of report.files)assert.deepEqual(await bind(row.path),row,'Final preparation readback '+row.path);
console.log(JSON.stringify({status:report.status,archiveFiles:archive.files,acceptedCurrentUnchanged:preserved.length,
  historicalProtectedUnchanged:2839,livingStatusFiles:changed.length,localLinksChecked:links,archiveTests,
  j1Started:false,locallyAcceptedCantons:16,remainingCantons:10,proposedNext:cantonInventory.proposedNext},null,2));
