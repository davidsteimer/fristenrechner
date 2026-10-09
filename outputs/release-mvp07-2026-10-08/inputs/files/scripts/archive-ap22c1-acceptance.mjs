// SPDX-License-Identifier: AGPL-3.0-only
// Preserve exactly the accepted implementation before C2 evolves shared code.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const hash=x=>createHash('sha256').update(x).digest('hex');
const qaPath='outputs/ap22c1-2026-10-08/QA-AP22C1.json';
const qaBytes=await readFile(qaPath);
assert.equal(hash(qaBytes),'21381e84e85e42e2f43d01fd054efe161adf14fef91d4e419030e8dd0874167c');
const qa=JSON.parse(qaBytes);
const target='outputs/ap22c1-abnahme-2026-10-08';
const entries=[...qa.artifacts,{path:qaPath,sha256:hash(qaBytes),byteLength:qaBytes.length}];
for(const entry of entries){
 const destination=resolve(target,entry.path);
 let bytes;
 try{bytes=await readFile(destination);}catch(e){if(e.code!=='ENOENT')throw e;bytes=await readFile(entry.path);}
 assert.equal(hash(bytes),entry.sha256,entry.path);assert.equal(bytes.length,entry.byteLength);
 await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes,{flag:'w'});
}
const receipt={kind:'acceptedAP22C1SourceSnapshot',acceptedOn:'2026-10-08',acceptedBy:'David Steimer',sourceQA:qaPath,sourceQASha256:hash(qaBytes),artifacts:entries};
await writeFile(resolve(target,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({target,files:entries.length,verified:true}));
