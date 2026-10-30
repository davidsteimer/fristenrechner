// SPDX-License-Identifier: AGPL-3.0-only
// Build a new local proof, never overwrite accepted M3 artefacts or the operating entry.
import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve,relative} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/r10-u1-2026-10-28';
const bind=async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const paths=['src/public-app/main.tsx','spfx/config/package-solution.json','spfx/src/core/config.ts','spfx/sharepoint/solution/fristenrechner-schweiz.sppkg','data/candidates/2026-10-28-ap23m3/manifest.json','outputs/ap23m3-2026-10-28/local-completion.json'];
const before=await Promise.all(paths.map(bind));
process.env.FRISTENRECHNER_DATA_CANDIDATE='r10-u1';
const {buildPublicApp}=await import('./build-public-app.mjs');const built=await buildPublicApp();
const after=await Promise.all(paths.map(bind));assert.deepEqual(after,before);
async function inventory(directory){const rows=[];for(const item of await readdir(directory,{withFileTypes:true})){const path=resolve(directory,item.name);if(item.isDirectory())rows.push(...await inventory(path));else rows.push(await bind(relative(root,path)));}return rows;}
await mkdir(resolve(root,out),{recursive:true});
const report={workPackage:'R10-U1',status:'passed',localOnly:true,deployable:false,sourceReleaseApproved:false,operatingChanges:false,
 dataReleaseId:'2026-10-28-ap23m3-candidate.1',outputDirectory:relative(root,built.outputDirectory),protectedBefore:before,protectedAfter:after,
 artifacts:(await inventory(built.outputDirectory)).sort((a,b)=>a.path.localeCompare(b.path))};
await writeFile(resolve(root,out+'/web-build.json'),JSON.stringify(report,null,2)+'\n');
