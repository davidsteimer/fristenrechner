// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runSourceReviewSteps,requireSuccessfulStep,publicPythonContextInputs} from '../../scripts/run-source-reviews.mjs';
const ok=()=>({status:0});
const py=()=>({passed:true,partition:{all:Array(45),current:Array(32),historical:Array(13)}});
test('npm alias uses the additive public entry without changing old assertions',async()=>{
 const p=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
 assert.equal(p.scripts['test:source-reviews'],'node scripts/run-source-reviews.mjs');
});
test('all three phases run in order and keep all 45 Python methods',async()=>{
 const calls=[];await runSourceReviewSteps({selfTest:()=>{calls.push('index');return ok();},pythonContexts:()=>{calls.push('python');return py();},nodeGovernance:()=>{calls.push('node');return ok();}});
 assert.deepEqual(calls,['index','python','node']);
});
test('index failure stops before Python and Node',async()=>{
 await assert.rejects(runSourceReviewSteps({selfTest:()=>({status:1}),pythonContexts:()=>assert.fail('must not run'),nodeGovernance:()=>assert.fail('must not run')}));
});
test('Python failure or incomplete partition cannot be reported as passed',async()=>{
 for(const result of [{...py(),passed:false},{...py(),partition:{all:Array(44),current:Array(31),historical:Array(13)}}])await assert.rejects(runSourceReviewSteps({selfTest:ok,pythonContexts:()=>result,nodeGovernance:()=>assert.fail('must not run')}));
});
test('Node failure propagates',async()=>{await assert.rejects(runSourceReviewSteps({selfTest:ok,pythonContexts:py,nodeGovernance:()=>({status:1})}));});
test('signals, missing exit status and process errors fail closed',()=>{
 for(const result of [{status:null},{status:0,signal:'SIGTERM'},{status:0,error:new Error('spawn failed')}])assert.throws(()=>requireSuccessfulStep(result,'synthetic'));
});
test('public context inventory includes current data, all Python tests and public historical fixture',async()=>{
 const rows=await publicPythonContextInputs();const paths=rows.map(r=>r.path);
 assert.ok(paths.includes('tests/governance/test_source_reviews_mvp10.py'));
 assert.ok(paths.includes('data/releases/2026-10-28-mvp-010-approved.1/manifest.json'));
 assert.ok(paths.includes('outputs/release-mvp09-2026-10-18/build-evidence/fixtures/tests/governance/validate_source_reviews.py'));
 assert.equal(new Set(paths).size,paths.length);
 assert.ok(paths.every(p=>!p.includes('.work/')&&!p.includes('r10-a2-')));
});
