// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {prepareGovernance,root,eventId,eventPath,registerPath,indexPath} from '../../scripts/prepare-mvp10-source-reviews.mjs';
const p=await prepareGovernance();
test('255 original register rows and all seven events remain byte bound',()=>{
 const old=JSON.parse(p.before.get(registerPath));for(const row of old.sources)assert.deepEqual(p.register.sources.find(r=>r.sourceId===row.sourceId),row);assert.equal(p.before.size,9);assert.equal(p.register.sources.length,384);assert.equal(p.event.entries.length,380);assert.equal(p.index.sources.length,384);assert.equal(p.index.generatedFrom.eventIds.length,8);
 for(const id of p.sourceInputs.inventory.historicalRegisterOnlySourceIds)assert.deepEqual(p.index.sources.find(r=>r.sourceId===id),JSON.parse(p.before.get(indexPath)).sources.find(r=>r.sourceId===id));
});
test('AI, FR, NE, KVG and annual-review status retain their qualified meanings',()=>{
 const ai=p.event.entries.find(r=>r.sourceId==='SRC-AI-RUHETAGE-LISTE-2026');assert.equal(ai.outcome,'unclear');assert.match(ai.evidence.finding,/kein heutiger Stephanstagswiderspruch/);
 const fr=p.event.entries.find(r=>r.sourceId==='SRC-AP22-FR-PRAXIS');assert.equal(fr.outcome,'unclear');assert.deepEqual(fr.affected.componentIds,[]);assert.match(fr.evidence.finding,/null Graphkanten/);
 assert.ok(p.event.entries.find(r=>r.sourceId==='SRC-AP19C3-KVG-20260701').followUp.references.some(r=>r.id==='R10-A2-BASELINE-KVG-EDITION-01'));
 assert.ok(p.event.entries.find(r=>r.sourceId==='SRC-M1-NE-OJN').followUp.references.some(r=>r.id==='NE-O4-LJU-JUSTITIA-GATE'));
 assert.equal(p.event.nextAnnualReviewDue,'2026-11-15');assert.equal(p.bridges.annualReviewCompleted,false);
});
test('generic JS index independently reproduces exact explicit MVP10 impacts without writing',()=>{
 const script=path.join(root,'scripts/build-source-review-index.mjs');let code=fs.readFileSync(script,'utf8').replace(/^import .*;\n/gmu,'').replaceAll('import.meta.url',JSON.stringify(new URL('../../scripts/build-source-review-index.mjs',import.meta.url).href));let written;
 const fake={...fs,readFileSync(file,...args){if(file===path.join(root,registerPath))return JSON.stringify(p.register);if(file===path.join(root,eventPath))return JSON.stringify(p.event);return fs.readFileSync(file,...args);},readdirSync(directory,...args){const result=fs.readdirSync(directory,...args);if(directory===path.join(root,'data/source-reviews/events')&&!result.includes(eventId+'.json'))return[...result,eventId+'.json'];return result;},writeFileSync(file,bytes){assert.equal(file,path.join(root,indexPath));assert.equal(written,undefined);written=JSON.parse(bytes);}};
 vm.runInNewContext(code,{fs:fake,path,fileURLToPath,console:{log(){}}},{filename:script});assert.deepEqual(written,p.index);
});
