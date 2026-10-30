// SPDX-License-Identifier: AGPL-3.0-only
// Verify captured research bytes, never infer law or approval merely from a successful fetch.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkedPath,exact,safeRelative,sha256,walk} from './prepare-ap23j1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output='outputs/ap23j1-2026-10-27';
export async function checkEvidence(){
  const sources=[],registers=[],models=[],allIDs=new Set();
  for(const canton of['fr','ge','ju']){
    const base=output+'/sources/'+canton,register=base+'/source-bindings.json';
    const registerBytes=await exact(root,register),index=JSON.parse(registerBytes);
    if(index.workPackage!==undefined)assert.equal(index.workPackage,'AP23J1');
    else assert.equal(index.schema,'ap23j1-source-bindings-local-1');assert.equal(index.canton,canton.toUpperCase());
    const rows=index.sources;assert.ok(Array.isArray(rows)&&rows.length>0,'Empty source register '+canton);
    for(const row of rows){
      assert.ok(typeof row.id==='string'&&['J1-','AP23J1-'].some(prefix=>row.id.startsWith(prefix+canton.toUpperCase()+'-')),'Invalid source ID');
      assert.ok(!allIDs.has(row.id),'Duplicate source ID '+row.id);allIDs.add(row.id);
      assert.ok(typeof row.url==='string'&&/^https?:\/\//.test(row.url),'Source URL missing '+row.id);
      assert.ok(typeof row.role==='string'&&row.role.length>0,'Evidence role missing '+row.id);
      const relative=row.file??row.path;safeRelative(relative);
      const path=relative.startsWith(base+'/')?relative:base+'/'+relative;
      assert.ok(path.startsWith(base+'/'),'Source escapes owned evidence directory');
      const bytes=await exact(root,path,row.sha256);assert.equal(bytes.length,row.bytes??row.byteLength,'Source length '+row.id);
      if(path.endsWith('.pdf'))assert.equal(bytes.subarray(0,5).toString(),'%PDF-','Not a PDF '+row.id);
      if(path.endsWith('.html'))assert.match(bytes.toString('latin1'),/<(?:!doctype|html|head|body|div|p|table)\b/i,'Not captured HTML '+row.id);
      sources.push({id:row.id,path,byteLength:bytes.length,sha256:sha256(bytes),role:row.role,url:row.url});
    }
    for(const key of['professionalAcceptance','sourceReleaseApproved','operatingChanges'])if(Object.hasOwn(index,key))assert.equal(index[key],false,key);
    registers.push({canton:canton.toUpperCase(),path:register,sha256:sha256(registerBytes),sourceCount:rows.length});
    const modelPath='docs/fachrecht/ap23j1/befund-'+canton+'.json',raw=await exact(root,modelPath),model=JSON.parse(raw);
    assert.equal(model.canton,canton.toUpperCase());assert.ok(Array.isArray(model.pathProposals)&&model.pathProposals.length>0);
    assert.ok(Array.isArray(model.localReferenceCases)&&model.localReferenceCases.length>0);
    assert.equal(new Set(model.pathProposals.map(p=>p.id)).size,model.pathProposals.length,'Duplicate canton path IDs');
    const pathIDs=new Set(model.pathProposals.map(p=>p.id));
    for(const c of model.localReferenceCases){assert.ok(c.id&&pathIDs.has(c.path),'Reference points at unknown path '+c.id);assert.ok(c.expected&&c.note);}
    for(const key of['professionalAcceptance','sourceReleaseApproved','operatingChanges','runtimeActive'])if(Object.hasOwn(model,key))assert.equal(model[key],false,key);
    models.push({canton:model.canton,path:modelPath,byteLength:raw.length,sha256:sha256(raw),paths:model.pathProposals.length,references:model.localReferenceCases.length});
  }
  const inventory=[];
  for(const path of await walk(root,output+'/sources')){const bytes=await exact(root,path);inventory.push({path,byteLength:bytes.length,sha256:sha256(bytes)});}
  return{workPackage:'AP23J1',asOf:'2026-10-27',status:'captured-source-bytes-verified',registers,models,
    explicitSourceBindings:sources.length,inventoriedEvidenceFiles:inventory.length,sources,fileInventory:inventory,
    readingScope:'The per-source register states what was read. Metadata, full normative bodies, decisions, mirrors, reform drafts and practical guidance remain separate roles. Hash checks alone do not prove legal correctness, complete jurisprudential coverage or human acceptance.',
    sourceReleaseApproved:false,professionalAcceptance:false,productDataChanged:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(x=>x==='--write'));const report=await checkEvidence();
  if(process.argv.includes('--write')){const path=output+'/evidence-verification.json';await checkedPath(root,path,{missing:true});await writeFile(resolve(root,path),JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify({...report,sources:undefined,fileInventory:undefined},null,2));
}
