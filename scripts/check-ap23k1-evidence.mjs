// SPDX-License-Identifier: AGPL-3.0-only
// Local research-byte verification. Does not infer legal correctness from a successful download.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,safeRelative,sha256,walk} from './prepare-ap23k1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output='outputs/ap23k1-2026-10-27';
export async function checkEvidence(){
  const sources=[],registers=[],models=[],ids=new Set();
  for(const canton of ['bs','bl']){
    const base=output+'/sources/'+canton,register=base+'/source-bindings.json';
    const bytes=await exact(root,register),index=JSON.parse(bytes);
    assert.equal(index.workPackage,'AP23K1');assert.equal(index.canton,canton.toUpperCase());
    assert.ok(Array.isArray(index.sources)&&index.sources.length>0,'Empty source register');
    for(const row of index.sources){
      assert.ok(typeof row.id==='string'&&row.id.startsWith('K1-'+canton.toUpperCase()+'-'),'Invalid source ID');
      assert.ok(!ids.has(row.id),'Duplicate source ID '+row.id);ids.add(row.id);
      const nonWebEvidence=row.id.startsWith('K1-BS-EVIDENCE-')&&[
        'mcp-citation-attempt-with-date-validation','mcp-retrieval-corroboration',
        'derived-reading-extract','mcp-federal-source-discovery-and-chronology'].includes(row.role);
      assert.ok(/^https:\/\//u.test(row.url)||nonWebEvidence&&typeof row.url==='string'&&row.url.trim(),
        'Missing public source URL or explicitly qualified derived/MCP origin '+row.id);
      assert.ok(typeof row.role==='string'&&row.role.trim(),'Missing evidence role '+row.id);
      const readingScope=row.readingScope??row.read;
      assert.ok(typeof readingScope==='string'&&readingScope.trim(),'Missing reading scope '+row.id);
      assert.match(row.sha256,/^[a-f0-9]{64}$/u,'Missing or invalid source SHA-256 '+row.id);
      assert.ok(Number.isSafeInteger(row.bytes??row.byteLength)&&(row.bytes??row.byteLength)>0,'Missing source byte length '+row.id);
      const relative=row.file??row.path;safeRelative(relative);
      const path=relative.startsWith(base+'/')?relative:base+'/'+relative;
      assert.ok(path.startsWith(base+'/'),'Evidence outside canton directory');
      const raw=await exact(root,path,row.sha256);assert.equal(raw.length,row.bytes??row.byteLength,'Source length '+row.id);
      if(path.endsWith('.pdf'))assert.equal(raw.subarray(0,5).toString(),'%PDF-','Invalid PDF '+row.id);
      if(path.endsWith('.json'))JSON.parse(raw);
      sources.push({id:row.id,path,byteLength:raw.length,sha256:sha256(raw),url:row.url,role:row.role,readingScope});
    }
    for(const artifact of index.artifacts??[]){
      assert.match(artifact.sha256,/^[a-f0-9]{64}$/u,'Missing or invalid artifact SHA-256');
      assert.ok(Number.isSafeInteger(artifact.bytes??artifact.byteLength)&&(artifact.bytes??artifact.byteLength)>0,'Missing artifact byte length');
      const relative=artifact.file??artifact.path;safeRelative(relative);
      const path=relative.startsWith(base+'/')?relative:base+'/'+relative;
      assert.ok(path.startsWith(base+'/'),'Registered artifact outside canton directory');
      const raw=await exact(root,path,artifact.sha256);assert.equal(raw.length,artifact.bytes??artifact.byteLength,'Artifact length '+path);
    }
    for(const key of ['professionalAcceptance','sourceReleaseApproved','operatingChanges'])
      if(Object.hasOwn(index,key))assert.equal(index[key],false,key);
    registers.push({canton:index.canton,path:register,sha256:sha256(bytes),sourceCount:index.sources.length});
    const path='docs/fachrecht/ap23k1/befund-'+canton+'.json',raw=await exact(root,path),model=JSON.parse(raw);
    assert.equal(model.canton,canton.toUpperCase());
    const paths=model.pathProposals??model.groups,cases=model.localReferenceCases??model.researchCases;
    assert.ok(Array.isArray(paths)&&paths.length>0,'Missing path proposals');
    assert.ok(Array.isArray(cases)&&cases.length>=15,'Insufficient analyst reference cases');
    const pathIDs=new Set(paths.map(p=>p.id));assert.equal(pathIDs.size,paths.length,'Duplicate proposed path');
    for(const c of cases)assert.ok(c.id&&pathIDs.has(c.path)&&c.expected&&c.note,'Incomplete analyst case '+c.id);
    for(const key of ['professionalAcceptance','sourceReleaseApproved','operatingChanges'])assert.equal(model[key],false,key);
    models.push({canton:model.canton,path,byteLength:raw.length,sha256:sha256(raw),paths:paths.length,references:cases.length});
  }
  function inspect(value){
    if(!value||typeof value!=='object')return;
    for(const [key,item] of Object.entries(value)){
      if(key==='sourceId')assert.ok(ids.has(item),'Unknown source ID '+item);
      if(key==='sourceIds'||key==='commonSourceIds')for(const id of item)assert.ok(ids.has(id),'Unknown source ID '+id);
      inspect(item);
    }
  }
  for(const model of models)inspect(JSON.parse(await exact(root,model.path)));
  const inventory=[];
  for(const path of await walk(root,output+'/sources')){
    const bytes=await exact(root,path);inventory.push({path,byteLength:bytes.length,sha256:sha256(bytes)});
  }
  return {workPackage:'AP23K1',asOf:'2026-10-27',status:'captured-source-bytes-verified',registers,models,
    explicitSourceBindings:sources.length,inventoriedEvidenceFiles:inventory.length,sources,fileInventory:inventory,
    readingScope:'Per-source roles and reading scopes distinguish normative bodies, metadata, derived text, decisions, annual closure lists and incomplete decision extracts. Hash verification is not a legal opinion, complete jurisprudential search or human acceptance.',
    professionalAcceptance:false,sourceReleaseApproved:false,productDataChanged:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(process.argv.slice(2).every(arg=>arg==='--write'),'Only --write supported');const report=await checkEvidence();
  if(process.argv.includes('--write'))await writeFile(resolve(root,output+'/evidence-verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,sources:undefined,fileInventory:undefined},null,2));
}
