// SPDX-License-Identifier: AGPL-3.0-only
// Exact research acceptance snapshot. Old product baselines are checked, not copied recursively.
import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {lstat,mkdir,open,readFile,readdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

export const sha256=b=>createHash('sha256').update(b).digest('hex');
const out='outputs/ap23h1-2026-10-22';
export const archiveConfig=Object.freeze({
  target:'outputs/ap23h1-abnahme-2026-10-22',proofPath:out+'/local-completion.json',
  proofSha256:'c7d12e796aab92309b38acc0fd10ff8792106d4d8d86e60efd2b47cc6748a47d',
  bindingCount:71,sourceCount:39,groups:21,cases:118,
  evidencePath:out+'/evidence-verification.json',referencePath:out+'/reference-verification.json',
  independentPath:out+'/reference-independent-verification.json',preservationPath:out+'/preservation-verification.json',
  sourcePrefix:out+'/sources/',
  protected:{path:out+'/protected-inputs.json',sha256:'e4edd554265322cb4bb782feaa0cbe32ce685eac7dde6f0bc5a788ba5a1f160e',count:1614},
  upstream:{path:'outputs/ap23g3-abnahme-2026-10-22/receipt.json',sha256:'8b1c51e00a7db862b38a58ead5a20c7e4fa1fdd48c196c07329390f9198dbf7b',payloads:218},
  acceptance:{kind:'acceptedAP23H1Snapshot',acceptedOn:'2026-10-22',acceptedBy:'David Steimer',
    userStatement:'AP23H1 ist einschliesslich der Punkte H1-A bis H1-F fachlich abgenommen. Den vorgelegten Statusentwurf für #48 darfst du veröffentlichen. Bitte starte AP23H2.',
    accepted:true,professionalAcceptance:true,acceptedDecisionPoints:['H1-A','H1-B','H1-C','H1-D','H1-E','H1-F'],
    technicalContractApproved:false,formatDecision:false,runtimeActive:false,sourceReleaseApproved:false,
    deployable:false,deployed:false,published:false,
    boundaries:['Original research reports retain their historical pre-acceptance flags and exact bytes.',
      'Public status proposal is separately authorised, not a source-code push or source release.',
      'AP23H2 is an isolated contract and data probe. No H3, product integration or operating changes.',
      'Previous accepted G3 and protected historical inputs are checked without recursive copies.']}
});
export function safeRelative(path){
  assert.equal(typeof path,'string','Path must be a string');
  assert.ok(path.length&&!path.startsWith('/')&&!/[\\\x00:]/u.test(path),'Unsafe path: '+path);
  assert.ok(path.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe path: '+path);return path;
}
async function exists(path){try{await lstat(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function noSymlinks(root,path,{missing=false}={}){
  const base=await lstat(root);assert.ok(base.isDirectory()&&!base.isSymbolicLink(),'Invalid root');let current=root;
  const parts=safeRelative(path).split('/');
  for(const[i,part]of parts.entries()){
    current=resolve(current,part);let stat;
    try{stat=await lstat(current);}catch(e){if(missing&&e.code==='ENOENT')return;throw e;}
    assert.ok(!stat.isSymbolicLink(),'Symlink not allowed: '+current);
    assert.ok(i===parts.length-1||stat.isDirectory(),'Not a directory: '+current);
  }
}
async function readExact(root,item){
  await noSymlinks(root,item.path);
  const h=await open(resolve(root,item.path),constants.O_RDONLY|constants.O_NOFOLLOW);
  try{assert.ok((await h.stat()).isFile(),'Not a file: '+item.path);const b=await h.readFile();
    assert.equal(sha256(b),item.sha256,'SHA-256 mismatch: '+item.path);
    if(item.byteLength!==undefined)assert.equal(b.length,item.byteLength,'Byte length mismatch: '+item.path);return b;
  }finally{await h.close();}
}
async function pathsUnder(root,relative=''){
  const rows=[];for(const e of await readdir(resolve(root,relative),{withFileTypes:true})){
    const p=relative?relative+'/'+e.name:e.name;assert.ok(!e.isSymbolicLink(),'Symlink not allowed: '+p);
    if(e.isDirectory())rows.push(...await pathsUnder(root,p));else{assert.ok(e.isFile(),'Not a regular file: '+p);rows.push(p);}
  }return rows.sort();
}
export async function archiveAcceptance({root=process.cwd(),write=false,config=archiveConfig}={}){
  root=resolve(root);safeRelative(config.target);await noSymlinks(root,config.target,{missing:true});
  const target=resolve(root,config.target),complete=await exists(target);
  if(complete)assert.ok(await exists(resolve(target,'receipt.json')),'Partial archive without receipt: halt without repair');
  const input=complete?target:root,descriptors=new Map(),buffers=new Map();
  function add(d){
    safeRelative(d.path);assert.match(d.sha256,/^[a-f0-9]{64}$/u,'Invalid descriptor hash');
    if(d.byteLength!==undefined)assert.ok(Number.isSafeInteger(d.byteLength)&&d.byteLength>=0,'Invalid length');
    const old=descriptors.get(d.path);
    if(old){assert.equal(old.sha256,d.sha256,'Conflicting descriptor: '+d.path);
      if(old.byteLength!==undefined&&d.byteLength!==undefined)assert.equal(old.byteLength,d.byteLength,'Conflicting length');}
    descriptors.set(d.path,{path:d.path,sha256:d.sha256,...(d.byteLength===undefined&&old?.byteLength===undefined?{}:{byteLength:d.byteLength??old.byteLength})});
  }
  async function boundJson(path){const d=descriptors.get(path);assert.ok(d,'Report is not bound: '+path);
    const b=await readExact(input,d);buffers.set(path,b);return JSON.parse(b);}
  add({path:config.proofPath,sha256:config.proofSha256});const proof=await boundJson(config.proofPath);
  assert.equal(proof.workPackage,'AP23H1');assert.equal(proof.status,'research-completed-awaiting-human-acceptance');
  assert.equal(proof.scopeConfirmed,true);assert.equal(proof.scopeConfirmedBy,'David Steimer');
  assert.equal(proof.researchGroups,config.groups);assert.equal(proof.researchCases,config.cases);
  for(const k of ['professionalAcceptance','formatDecision','implementationStarted','runtimeActivation','productCodeChanged',
    'schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated','sourcePushPerformed','operatingChanges'])assert.equal(proof[k],false,k);
  assert.equal(proof.bindings.length,config.bindingCount,'Unexpected binding inventory');
  assert.equal(new Set(proof.bindings.map(d=>d.path)).size,config.bindingCount,'Duplicate research bindings');
  proof.bindings.forEach(add);
  const evidence=await boundJson(config.evidencePath);
  assert.equal(evidence.status,'research-source-bindings-verified');assert.equal(evidence.inventoriedEvidenceFiles,config.sourceCount);
  assert.equal(evidence.fileInventory.length,config.sourceCount,'Unexpected source inventory');
  assert.equal(new Set(evidence.fileInventory.map(d=>d.path)).size,config.sourceCount,'Duplicate source inventory');
  for(const k of ['legalInterpretationAutomaticallyValidated','professionalAcceptance','runtimeActive','operatingChanges'])assert.equal(evidence[k],false,k);
  for(const d of evidence.fileInventory){assert.ok(d.path.startsWith(config.sourcePrefix),'Source outside scoped inventory');
    assert.ok(descriptors.has(d.path),'Source not already in proof bindings');add(d);}
  for(const path of[config.referencePath,config.independentPath]){
    const r=await boundJson(path);assert.equal(r.workPackage,'AP23H1');assert.equal(r.legalApproval,false);assert.equal(r.runtimeActive,false);assert.deepEqual(r.discrepancies,[]);
    if(path===config.referencePath){assert.equal(r.status,'passedResearchComparison');assert.equal(r.paths,config.groups);assert.equal(r.referenceCases,config.cases);}
    else{assert.equal(r.status,'passedIndependentResearchComparison');assert.equal(r.referenceComparisons,config.cases);}
  }
  const preservation=await boundJson(config.preservationPath);assert.equal(preservation.status,'research-inputs-preserved');
  assert.deepEqual(preservation,proof.preservation,'Preservation proof differs');
  const guard=await boundJson(config.protected.path);assert.equal(sha256(buffers.get(config.protected.path)),config.protected.sha256);
  assert.equal(Object.keys(guard.files).length,config.protected.count,'Unexpected protected inventory');
  assert.equal(preservation.protectedFilesVerified,config.protected.count);
  if(!complete){
    for(const[path,sha256]of Object.entries(guard.files))await readExact(root,{path,sha256});
    const upstream=JSON.parse(await readExact(root,config.upstream));assert.equal(upstream.artifacts.length,config.upstream.payloads,'Unexpected upstream payload count');
    for(const d of upstream.artifacts)await readExact(root,{...d,path:dirname(config.upstream.path)+'/'+safeRelative(d.path)});
  }
  const rows=[];
  for(const d of [...descriptors.values()].sort((a,b)=>a.path.localeCompare(b.path,'en'))){
    const b=buffers.get(d.path)??await readExact(input,d);assert.equal(sha256(b),d.sha256,d.path);
    if(d.byteLength!==undefined)assert.equal(b.length,d.byteLength,d.path);
    rows.push({item:{path:d.path,byteLength:b.length,sha256:d.sha256},bytes:b});
  }
  const receipt={...config.acceptance,proof:{path:config.proofPath,sha256:config.proofSha256},
    originalBindingCount:config.bindingCount,sourceFolderFiles:config.sourceCount,
    protectedInputsCheckedWithoutRecopy:config.protected.count,previousG3CheckedWithoutRecopy:config.upstream,
    artifacts:rows.map(r=>r.item)};
  const bytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  if(complete){
    await noSymlinks(target,'receipt.json');assert.deepEqual(await readFile(resolve(target,'receipt.json')),bytes,'Receipt is not the exact derived acceptance record');
    assert.deepEqual(await pathsUnder(target),[...rows.map(r=>r.item.path),'receipt.json'].sort(),'Unexpected archive files');
  }else if(write){
    await noSymlinks(root,config.target,{missing:true});await mkdir(dirname(target),{recursive:true});await mkdir(target);
    for(const{item,bytes}of rows){await noSymlinks(target,item.path,{missing:true});await mkdir(dirname(resolve(target,item.path)),{recursive:true});
      await noSymlinks(target,item.path,{missing:true});await writeFile(resolve(target,item.path),bytes,{flag:'wx'});await readExact(target,item);}
    await writeFile(resolve(target,'receipt.json'),bytes,{flag:'wx'});
  }
  return{target:config.target,mode:complete?'archive-reverified':write?'archive-created':'source-preflight-only',verified:true,
    files:rows.length,sourceFiles:config.sourceCount,payloadBytes:rows.reduce((n,r)=>n+r.bytes.length,0),
    protectedInputsNotRecopied:config.protected.count,upstreamPayloadsNotRecopied:config.upstream.payloads,
    receiptSha256:sha256(bytes),receiptByteLength:bytes.length};
}

export async function freezeH2Inputs({root=process.cwd(),write=false}={}){
  root=resolve(root);const archive=await archiveAcceptance({root});assert.equal(archive.mode,'archive-reverified','Create H1 archive before freezing H2');
  const guard=JSON.parse(await readExact(root,archiveConfig.protected));
  const proof=JSON.parse(await readExact(resolve(root,archiveConfig.target),{path:archiveConfig.proofPath,sha256:archiveConfig.proofSha256}));
  const living=['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md',
    'docs/entscheidungen/README.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'];
  const files={...guard.files};for(const p of living)delete files[p];
  const add=async path=>{safeRelative(path);await noSymlinks(root,path);files[path]=sha256(await readFile(resolve(root,path)));};
  for(const d of proof.bindings)if(!living.includes(d.path)){
    assert.equal(sha256(await readFile(resolve(root,d.path))),d.sha256,'Changed H1 input before H2 freeze: '+d.path);await add(d.path);
  }
  for(const p of[archiveConfig.proofPath,'scripts/archive-ap23h1-acceptance.mjs','tests/governance/ap23h1-acceptance.test.mjs',
    ...await pathsUnder(resolve(root,archiveConfig.target)).then(xs=>xs.map(p=>archiveConfig.target+'/'+p))])await add(p);
  const livingAtStart={};for(const p of living)livingAtStart[p]=sha256(await readFile(resolve(root,p)));
  const record={workPackage:'AP23H2',asOf:'2026-10-22',status:'frozen-before-contract-probe',
    head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
    acceptedH1:{proofPath:archiveConfig.proofPath,proofSha256:archiveConfig.proofSha256,archive},
    files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,
    note:'Unique protected paths. Seven living entry texts are separately mutable. H1 reports and source/evidence files retain their pre-acceptance bytes. No H2 files, other than this separate inventory, are used as their own baseline.'};
  assert.equal(record.head,guard.head??guard.gitHead??'70ce67425e046a7a38a4fbe66acbd93c75ca5983');
  const path='outputs/ap23h2-2026-10-22/protected-inputs.json',bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');
  if(await exists(resolve(root,path)))assert.deepEqual(await readFile(resolve(root,path)),bytes,'H2 baseline already exists with different bytes');
  else if(write){await mkdir(resolve(root,dirname(path)),{recursive:true});await writeFile(resolve(root,path),bytes,{flag:'wx'});}
  return{path,sha256:sha256(bytes),byteLength:bytes.length,protectedFiles:Object.keys(files).length,livingFiles:living.length,written:write};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(a=>['--write','--check','--freeze-h2'].includes(a)),'Only --write, --check or --freeze-h2');
  assert.ok(!(process.argv.includes('--write')&&process.argv.includes('--check')),'Choose one mode');
  console.log(JSON.stringify(process.argv.includes('--freeze-h2')?await freezeH2Inputs({write:process.argv.includes('--write')}):
    await archiveAcceptance({write:process.argv.includes('--write')}),null,2));
}
