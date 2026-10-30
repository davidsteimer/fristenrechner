// SPDX-License-Identifier: AGPL-3.0-only
// Documentation-only J3 acceptance and K1 scope proposal. No product or operating change.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig} from './archive-ap23j3-acceptance.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const output='outputs/ap23k1-vorbereitung-2026-10-27';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const raw=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await raw(path));
const bind=async path=>{const bytes=await raw(path);return{path,byteLength:bytes.length,sha256:digest(bytes)};};
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const acceptance='docs/fachrecht/abnahme-ap23j3.md',preparation='docs/planung/ap23k1-vorbereitung-bs-bl.md';
const receiptPath=archiveConfig.target+'/receipt.json';
const archive=await archiveAcceptance({root});
assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,1284);
assert.equal(archive.receiptSha256,'2dc1ad03491435959c2985934436be99bf7dcf924eb65fe71a4c6187ea505b1a');
const receipt=await json(receiptPath),proof=await json(archiveConfig.proofPath);
assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.acceptedBy,'David Steimer');
assert.equal(receipt.acceptedOn,'2026-10-27');assert.equal(receipt.originalBindingCount,1232);
assert.equal(receipt.artifacts.length,1284);assert.equal(receipt.explicitTransitivePayloads.length,51);
assert.equal(proof.professionalTechnicalAcceptance,false,'Historical proof remains historical');
assert.equal((await bind(archiveConfig.proofPath)).sha256,archiveConfig.proofSha256);
for(const key of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','sourcePublished',
  'operatingPermission','commitPermission','sourcePushPermission','nextProfessionalStepStarted'])assert.equal(receipt[key],false,key);
const changed=[],preserved=[];
for(const row of receipt.artifacts){
  const current=await bind(row.path);
  if(living.includes(row.path)){
    assert.notEqual(current.sha256,row.sha256,'Expected separate living status update '+row.path);changed.push(row.path);
  }else{assert.deepEqual(current,row,'Accepted J3 raw bytes changed '+row.path);preserved.push(row.path);}
}
assert.deepEqual(changed.sort(),[...living].sort());assert.equal(preserved.length,1277);
const guard=await json('outputs/ap23j3-2026-10-27/protected-inputs.json');
assert.equal(Object.keys(guard.files).length,4466);
for(const[path,sha]of Object.entries(guard.files))assert.equal((await bind(path)).sha256,sha,'Historical input '+path);
const userDocument='outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx';
assert.equal((await bind(userDocument)).sha256,'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61');
const cantonInventory={all:'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '),
  operational:'BE TI GR LU ZG AR'.split(' '),locallyAcceptedOnly:'ZH AG SG UR SO SH OW NW GL TG FR GE JU'.split(' '),
  remaining:'AI BS BL NE SZ VD VS'.split(' '),proposedNext:['BS','BL']};
const union=[...cantonInventory.operational,...cantonInventory.locallyAcceptedOnly,...cantonInventory.remaining];
assert.equal(union.length,26);assert.equal(new Set(union).size,26);assert.deepEqual([...union].sort(),[...cantonInventory.all].sort());
assert.equal(cantonInventory.operational.length+cantonInventory.locallyAcceptedOnly.length,19);
assert.equal(cantonInventory.remaining.length,7);assert.ok(cantonInventory.proposedNext.every(code=>cantonInventory.remaining.includes(code)));
const remainingAfterProposed=cantonInventory.remaining.filter(code=>!cantonInventory.proposedNext.includes(code));
assert.deepEqual(remainingAfterProposed,['AI','NE','SZ','VD','VS']);
const prep=await raw(preparation),text=prep.toString();
for(const phrase of['AP23K1 ist vorbereitet, aber nicht gestartet.','Höchstens fünf Nettoarbeitstage','29.08.2026–31.12.2027',
  'K1-BS-01','K1-BL-02','K1-ALLE-01','7.0.0','14.0.0','AP23K2','AP23K3'])assert.ok(text.includes(phrase),phrase);
assert.ok((await raw(acceptance)).toString().includes(receipt.userStatement),'Exact human statement');
const testArgs=['--test','tests/governance/ap23j3-acceptance.test.mjs'];
const tests=spawnSync(process.execPath,testArgs,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
const testText=(tests.stdout??'')+(tests.stderr??'');assert.equal(tests.status,0,testText);
const archiveTests=Object.fromEntries([...testText.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.deepEqual(archiveTests,{tests:56,pass:56,fail:0,cancelled:0,skipped:0,todo:0});
await mkdir(resolve(root,output),{recursive:true});
const testLog=output+'/archive-tests.txt';await writeFile(resolve(root,testLog),testText);
let localLinksChecked=0;
for(const path of[...living,acceptance,preparation]){
  const prose=(await raw(path)).toString();assert.equal(/[;ß]/u.test(prose),false,'Swiss prose '+path);
  for(const match of prose.matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
    const absolute=resolve(root,dirname(path),decodeURIComponent(target));
    if(absolute!==resolve(root,output+'/verification.json'))await stat(absolute);localLinksChecked++;
  }
}
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});assert.equal(head.status,0);assert.equal(head.stdout.trim(),proof.head);
const whitespace=spawnSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});assert.equal(whitespace.status,0,whitespace.stdout+whitespace.stderr);
const files=await Promise.all([...living,acceptance,preparation,'scripts/check-ap23k1-preparation.mjs',
  'scripts/archive-ap23j3-acceptance.mjs','tests/governance/ap23j3-acceptance.test.mjs',receiptPath,testLog].map(bind));
const report={status:'passed',stage:'AP23J3 human acceptance and AP23K1 proposal preparation only',date:'2026-10-27',head:proof.head,
  j3HumanAcceptance:true,k1ScopeConfirmed:false,k1Started:false,k2Started:false,k3Started:false,
  sourceReleaseApproved:false,regularIntermediateRelease:false,commitCreated:false,sourcePushPerformed:false,githubStatusPublished:false,
  installationPerformed:false,operatingChanges:false,operatingRelease:'MVP 0.9',archive,
  acceptedJ3CurrentFilesUnchanged:preserved.length,historicalProtectedFilesUnchanged:4466,
  allowedLivingStatusChanges:changed,userDocumentPreserved:true,cantonInventory,remainingAfterProposed,localLinksChecked,
  archiveTests,archiveTestExecution:{command:process.execPath,args:testArgs,exitCode:tests.status,...await bind(testLog)},
  testScope:'Fresh acceptance/archive safety tests. No new full product, host, legal release or operating test is claimed.',
  legalPreparation:'Bounded official BS/BL reading for scope selection. No completed K1 source chronology or positive case release.',
  proposalSha256:digest(prep),files};
await writeFile(resolve(root,output+'/verification.json'),JSON.stringify(report,null,2)+'\n');
for(const row of files)assert.deepEqual(await bind(row.path),row,'Final preparation readback '+row.path);
console.log(JSON.stringify({status:report.status,archiveFiles:archive.files,acceptedCurrentUnchanged:preserved.length,
  historicalProtectedUnchanged:4466,livingStatusFiles:changed.length,localLinksChecked,archiveTests,
  k1Started:false,locallyAcceptedCantons:19,remainingCantons:7,proposedNext:cantonInventory.proposedNext},null,2));
