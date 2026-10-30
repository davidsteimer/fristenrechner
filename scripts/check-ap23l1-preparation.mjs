// SPDX-License-Identifier: AGPL-3.0-only
// Proposal/preparation only. Protect the accepted K3 bytes and record no new release.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig} from './archive-ap23k3-acceptance.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23l1-vorbereitung-2026-10-27';
const preparation='docs/planung/ap23l1-vorbereitung-ai-sz.md',proof='outputs/ap23k3-2026-10-27/local-completion.json';
const living=['README.md','docs/README.md','docs/architektur/README.md','docs/entscheidungen/README.md','docs/fachrecht/README.md',
 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
const documents=[...living,preparation,'docs/fachrecht/abnahme-ap23k3.md'];
const raw=path=>readFile(resolve(root,path)),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await raw(path);return{path,byteLength:bytes.length,sha256:sha(bytes)};};
const counts=text=>Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(row=>[row[1],Number(row[2])]));
function passed(tap){assert.equal(tap.tests,60);assert.equal(tap.pass,60);for(const key of['fail','cancelled','skipped','todo'])assert.equal(tap[key],0);}
function run(args){const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
 assert.equal(result.status,0,(result.stdout??'')+(result.stderr??''));return(result.stdout??'')+(result.stderr??'');}
const mode=process.argv[2];assert.ok(['--write','--check'].includes(mode));
assert.equal(sha(await raw(proof)),archiveConfig.proofSha256,'Original K3 completion proof');
const original=JSON.parse(await raw(proof));assert.equal(original.professionalTechnicalAcceptance,false);
const accepted=await archiveAcceptance({root});assert.equal(accepted.mode,'archive-reverified');assert.equal(accepted.files,1324);
const receiptPath=archiveConfig.target+'/receipt.json',receipt=JSON.parse(await raw(receiptPath));
assert.equal(receipt.professionalTechnicalAcceptance,true);assert.equal(receipt.acceptedCantons,21);
assert.equal(receipt.operationalCantons,6);assert.equal(receipt.localOnlyAcceptedCantons,15);
assert.deepEqual(receipt.remainingCantons,['AI','NE','SZ','VD','VS']);assert.equal(receipt.nextProfessionalStepStarted,false);
assert.equal(sha(await raw(receiptPath)),'8609424600cfb276fa92338e7f4ef915034894f03c0e98ccb80f48c9002a0dd8');
let unchanged=0;for(const item of original.bindings){if(living.includes(item.path))continue;
 assert.deepEqual(await bind(item.path),item,'Accepted K3 non-living bytes '+item.path);unchanged++;}
assert.equal(unchanged,1316);
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});assert.equal(head.status,0);assert.equal(head.stdout.trim(),original.head);
const guardText=run(['scripts/check-ap23k3-preservation.mjs']);
const prep=(await raw(preparation)).toString();assert.ok(prep.includes('AP23L1 ist vorbereitet, aber nicht gestartet.'));
assert.ok(prep.includes('8.0.0')&&prep.includes('15.0.0')&&prep.includes('SZ-Fassungsgate'));
let localLinks=0;for(const path of documents){const text=(await raw(path)).toString();for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
 const target=match[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;
 await access(resolve(root,dirname(path),decodeURIComponent(target)));localLinks++;}}
const testLog=out+'/k3-acceptance-tests.txt',guardLog=out+'/preservation.txt';
const inputs=['scripts/check-ap23l1-preparation.mjs','scripts/archive-ap23k3-acceptance.mjs','tests/governance/ap23k3-acceptance.test.mjs',
 ...documents,proof,receiptPath,testLog,guardLog];
if(mode==='--check'){
 const report=JSON.parse(await raw(out+'/verification.json'));assert.equal(report.status,'prepared-not-started');
 assert.equal(report.unchangedOriginalK3Bindings,unchanged);assert.equal(report.localLinksChecked,localLinks);assert.equal(report.head,original.head);
 assert.deepEqual(report.inputs.map(row=>row.path),inputs);for(const item of report.inputs)assert.deepEqual(await bind(item.path),item);
 passed(counts((await raw(testLog)).toString()));for(const flag of['professionalStepStarted','professionalAcceptance','sourceReleaseApproved','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(report[flag],false);
 console.log(JSON.stringify({status:'preparation-reverified',unchangedOriginalK3Bindings:unchanged,localLinksChecked:localLinks,professionalStepStarted:false}));
}else{
 const testText=run(['--test','tests/governance/ap23k3-acceptance.test.mjs']);passed(counts(testText));
 await mkdir(resolve(root,out),{recursive:true});await writeFile(resolve(root,testLog),testText);await writeFile(resolve(root,guardLog),guardText);
 const whitespace=spawnSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});assert.equal(whitespace.status,0,whitespace.stdout+whitespace.stderr);
 const report={workPackage:'AP23L1Preparation',asOf:'2026-10-27',status:'prepared-not-started',head:original.head,
  previousWorkPackageAccepted:'AP23K3',acceptedCantons:21,operationalCantons:6,localOnlyAcceptedCantons:15,
  proposedCantons:['AI','SZ'],remainingCantons:['AI','NE','SZ','VD','VS'],anticipatedAfterSeparateAcceptance:23,
  currentFormats:{administrativeCatalog:'8.0.0',manifest:'15.0.0',minimumConsumer:'15.0.0'},
  unchangedOriginalK3Bindings:unchanged,acceptedArchivePayloads:1324,protectedFiles:6696,localLinksChecked:localLinks,archiveTests:60,
  legalReviewScope:'Limited official-source triage for a proposed scope. Not the completed L1 legal review, no new positive procedure permission.',
  professionalStepStarted:false,professionalAcceptance:false,sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  inputs:await Promise.all(inputs.map(bind))};
 await writeFile(resolve(root,out+'/verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,inputs:report.inputs.length}));
}
