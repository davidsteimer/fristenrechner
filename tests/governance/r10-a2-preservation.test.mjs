// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {validateGuard,preservationConfig} from '../../scripts/check-r10-a2-preservation.mjs';
import {archiveAcceptance} from '../../scripts/archive-r10-a1-acceptance.mjs';
const bytes=await readFile(new URL('../../outputs/r10-a2-2026-10-28/protected-inputs.json',import.meta.url)),original=JSON.parse(bytes);
test('A2 guard binds the accepted A1 input and only source-review authority',()=>assert.equal(validateGuard(original),true));
for(const flag of ['sourceReleaseApproved','dataPromoted','definitiveBuild','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','r10A2HumanAcceptance'])test('A2 rejects fabricated authority: '+flag,()=>{const g=structuredClone(original);g[flag]=true;assert.throws(()=>validateGuard(g));});
test('A2 rejects a replaced original user statement',()=>{const g=structuredClone(original);g.userStatement='All changes approved';assert.throws(()=>validateGuard(g));});
test('A2 rejects missing protected files',()=>{const g=structuredClone(original);g.files.pop();assert.throws(()=>validateGuard(g));});
test('A2 rejects duplicate protected file identities',()=>{const g=structuredClone(original);g.files[1]=g.files[0];assert.throws(()=>validateGuard(g));});
test('A2 rejects unbound living product paths',()=>{const g=structuredClone(original);g.livingAtStart[0].path='src/core/calculateDeadline.ts';assert.throws(()=>validateGuard(g));});
test('A2 rejects a fabricated A1 receipt',()=>{const g=structuredClone(original);g.acceptedA1.receiptSha256='0'.repeat(64);assert.throws(()=>validateGuard(g));});
for(const path of ['src/new.ts','data/source-reviews/new.json','schemas/new.json','spfx/config/new.json','docs/fachrecht/quellenpruefplan-r10-a2.md'])test('A2 does not allow a new or replaced product/input path: '+path,()=>assert.equal(original.allowedNew.some(p=>new RegExp(p,'u').test(path)),false));
test('A1 archive checker rejects a symlinked archive root',async()=>{const dir=await mkdtemp(join(tmpdir(),'r10-a2-archive-'));try{await mkdir(join(dir,'real'));await symlink(join(dir,'real'),join(dir,'alias'));await assert.rejects(archiveAcceptance({root:join(dir,'alias')}),/real directory/u);}finally{await rm(dir,{recursive:true,force:true});}});
test('A2 guard digest and file count remain concretely bound',()=>{assert.equal(preservationConfig.guardSha256,'1c07c86cb49f1bda4b68da069da2b908e2adefbe1bca71b8db914bd0b5f628ec');assert.equal(original.files.length,17637);assert.ok(original.files.some(r=>r.path==='data/candidates/2026-10-28-ap23m3/manifest.json'));assert.ok(original.files.some(r=>r.path==='docs/fachrecht/quellenpruefplan-r10-a2.md'));});
