// SPDX-License-Identifier: AGPL-3.0-only
// Documentation-only H3 acceptance and I1 scope preparation, not a product release.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {archiveAcceptance} from './archive-ap23h3-acceptance.mjs';

const output='outputs/ap23i1-vorbereitung-2026-10-22';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const bind=async path=>{const bytes=await readFile(path);return{path,byteLength:bytes.length,sha256:digest(bytes)};};
const archive=await archiveAcceptance();
assert.equal(archive.mode,'archive-reverified');
assert.equal(archive.files,417);
assert.equal(archive.receiptSha256,'49bc0fa9060a52d0301dd7b55c269cbc4834cd47170b592db8f7cdb1da4cb357');
const receipt=await json(archive.target+'/receipt.json');
assert.equal(receipt.professionalTechnicalAcceptance,true);
for(const key of['sourceReleaseApproved','calendarExportEnabled','deployable','deployed','published','operatingPermission'])assert.equal(receipt[key],false,key);
const proof=await json('outputs/ap23h3-2026-10-22/local-completion.json');
assert.equal(proof.professionalTechnicalAcceptance,false,'Historical proof must not be rewritten');
const living=new Set(['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md',
  'docs/entscheidungen/README.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md']);
const changed=[];
let acceptedUnchanged=0;
for(const descriptor of receipt.artifacts){
  const current=await bind(descriptor.path);
  if(living.has(descriptor.path)){
    assert.notEqual(current.sha256,descriptor.sha256,'Expected living status update '+descriptor.path);
    changed.push(descriptor.path);
  }else{
    assert.deepEqual(current,descriptor,'Changed accepted H3 byte '+descriptor.path);
    acceptedUnchanged++;
  }
}
assert.deepEqual(new Set(changed),living);
assert.equal(acceptedUnchanged,410);
const protection=await json('outputs/ap23h3-2026-10-22/protected-inputs.json');
const exceptions=await json('outputs/ap23h3-2026-10-22/additional-mutable-inputs.json');
let protectedCount=0;
for(const[path,sha256]of Object.entries(protection.files)){
  if(Object.hasOwn(exceptions.files,path))continue;
  assert.equal((await bind(path)).sha256,sha256,'Changed historical protected byte '+path);
  protectedCount++;
}
assert.equal(protectedCount,1810);
const userDocument='outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx';
assert.equal((await bind(userDocument)).sha256,'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61');

const cantonInventory={
  all:'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' '),
  operational:'BE TI GR LU ZG AR'.split(' '),
  locallyAcceptedOnly:'ZH AG SG UR SO SH OW NW'.split(' '),
  remaining:'AI BS BL FR GE GL JU NE SZ TG VD VS'.split(' '),
  proposedNext:['GL','TG']
};
const union=[...cantonInventory.operational,...cantonInventory.locallyAcceptedOnly,...cantonInventory.remaining];
assert.equal(union.length,26);
assert.equal(new Set(union).size,26);
assert.deepEqual([...union].sort(),[...cantonInventory.all].sort());
assert.equal(cantonInventory.operational.length+cantonInventory.locallyAcceptedOnly.length,14);
assert.equal(cantonInventory.remaining.length,12);
assert.ok(cantonInventory.proposedNext.every(c=>cantonInventory.remaining.includes(c)));
const remainingAfterProposed=cantonInventory.remaining.filter(c=>!cantonInventory.proposedNext.includes(c));
assert.equal(remainingAfterProposed.length,10);

const acceptance='docs/fachrecht/abnahme-ap23h3.md';
const preparation='docs/planung/ap23i1-vorbereitung-gl-tg.md';
const docs=[...living,acceptance,preparation];
const prep=await readFile(preparation,'utf8');
assert.equal(digest(Buffer.from(prep)),'5f09d27b1ac74e4967de02158b447812126ae8a2404a20b54229ae8d2870f4a3','Reviewed draft changed');
assert.ok(prep.includes('AP23I1 ist vorbereitet, aber noch nicht gestartet.'));
assert.ok(prep.includes('keine allgemeine feste Zwei- beziehungsweise Fünftagesfrist'));
assert.ok(prep.includes('Diese historische Dauer wird nicht übernommen.'));
assert.ok(prep.includes('Entscheid des Regierungsrates vom 14.01.2003'));
assert.ok(prep.includes('keine bestätigte aktuelle Fassung')===false,'Do not weaken actual PDF reading');
assert.ok(prep.includes('weder eine bestätigte aktuelle Fassung noch der Ausschluss'));
let links=0;
for(const path of docs){
  const text=await readFile(path,'utf8');
  assert.ok(!text.includes('ß'),'Swiss spelling '+path);
  assert.ok(!text.includes(';'),'No semicolons in project prose '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].replace(/^<|>$/g,'').split('#')[0];
    if(!target||/^[a-z]+:/i.test(target))continue;
    await stat(resolve(dirname(path),decodeURIComponent(target)));
    links++;
  }
}
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'});
assert.equal(head.status,0);
assert.equal(head.stdout.trim(),'70ce67425e046a7a38a4fbe66acbd93c75ca5983');
assert.equal(head.stdout.trim(),proof.head);
const whitespace=spawnSync('git',['diff','--check'],{encoding:'utf8'});
assert.equal(whitespace.status,0,whitespace.stderr||whitespace.stdout);
const tests=spawnSync(process.execPath,['--test','tests/governance/ap23h3-acceptance.test.mjs'],{encoding:'utf8',maxBuffer:4*1024*1024});
assert.equal(tests.status,0,tests.stderr||tests.stdout);
const counts=Object.fromEntries([...tests.stdout.matchAll(/^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.equal(counts.tests,54);
assert.equal(counts.pass,54);
for(const key of['fail','skipped','cancelled','todo'])assert.equal(counts[key],0,key);
await mkdir(output,{recursive:true});
await writeFile(output+'/archive-tests.txt',tests.stdout+tests.stderr);
const report={
  status:'passed',stage:'AP23H3 acceptance and AP23I1 proposal preparation only',date:'2026-10-22',head:proof.head,
  h3HumanAcceptance:true,i1ScopeConfirmed:false,i1Started:false,i2Started:false,i3Started:false,
  sourceReleaseApproved:false,regularIntermediateRelease:false,commitCreated:false,sourcePushPerformed:false,
  githubStatusPublished:false,installationPerformed:false,operatingRelease:'MVP 0.9',
  archive,acceptedH3CurrentFilesUnchanged:acceptedUnchanged,historicalProtectedFilesUnchanged:protectedCount,
  allowedLivingStatusChanges:changed,userDocumentPreserved:true,cantonInventory,remainingAfterProposed,
  localLinksChecked:links,archiveTestCounts:counts,
  legalPreparation:'Bounded official GL/TG reading, not a completed I1 source chronology or positive case release.',
  aiDraftReview:{reviewedSha256:digest(Buffer.from(prep)),blockingFindings:0,
    scope:'Read-only GL/TG plausibility review. AI work splitting is not human approval.'},
  files:await Promise.all([...docs,'scripts/check-ap23i1-preparation.mjs','scripts/archive-ap23h3-acceptance.mjs',
    'tests/governance/ap23h3-acceptance.test.mjs',archive.target+'/receipt.json',output+'/archive-tests.txt'].map(bind))
};
await writeFile(output+'/verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,archiveFiles:archive.files,acceptedCurrentUnchanged:acceptedUnchanged,
  historicalProtectedUnchanged:protectedCount,allowedLivingChanges:changed.length,localLinksChecked:links,
  archiveTests:counts,i1Started:false,locallyAcceptedCantons:14,remainingCantons:12},null,2));
