// SPDX-License-Identifier: AGPL-3.0-only
// Fresh local preflight, without source-content review or artefact rebuilding.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/r10-a1-2026-10-28';
export const tapCounts=t=>Object.fromEntries([...t.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(r=>[r[1],Number(r[2])]));
export function passed(counts){assert.ok(Number.isSafeInteger(counts.tests)&&counts.tests>0);assert.equal(counts.pass,counts.tests);for(const k of ['fail','cancelled','skipped','todo'])assert.equal(counts[k],0,k);}
export async function buildPlan(){const host=(await readdir(resolve(root,'tests/hosts'))).filter(n=>/^ap23[e-m]3-spfx-host\.test\.ts$/u.test(n)).sort().map(n=>'tests/hosts/'+n);assert.equal(host.length,9);return[
 ['preservation-before',['scripts/check-r10-a1-preservation.mjs','--write']],
 ['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],
 ['candidate-reproduction',['--import','tsx','scripts/build-ap23m3-candidate.ts','--check']],
 ['product-regression',['scripts/run-standard-tests.mjs','product']],
 ['host-lifecycle',['--import','tsx','--test',...host]],
 ['legacy-equivalence',['--import','tsx','scripts/check-ap23d1-legacy-equivalence.mjs']],
 ['accepted-u1-archive',['scripts/archive-r10-u1-acceptance.mjs','--check']],
 ['accepted-m3-archive',['scripts/archive-ap23m3-acceptance.mjs','--check']],
 ['preservation-after',['scripts/check-r10-a1-preservation.mjs','--write']]
 ];}
export async function preflight(){
 const guard=JSON.parse(await readFile(resolve(root,out+'/protected-inputs.json'))),plan=await buildPlan();
 const fixed=['scripts/check-r10-a1.mjs','scripts/check-r10-a1-preservation.mjs','scripts/prepare-r10-a1.mjs','scripts/archive-r10-u1-acceptance.mjs'];
 const bind=async path=>{const b=await readFile(resolve(root,path));return{path,byteLength:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
 const before=await Promise.all(fixed.map(bind)),report={workPackage:'R10-A1',status:'running',head:guard.head,asOf:'2026-10-28',localOnly:true,
 freshOnlineRetrievals:0,substantiveSourceReviewsPerformed:0,humanAcceptance:false,sourceReleaseApproved:false,dataPromoted:false,definitiveBuild:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,operatingChanges:false,steps:[],runnerInputsBefore:before};
 for(const[id,args]of plan){const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:96*1024*1024,env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')}}),output=(r.stdout??'')+(r.stderr??''),log=out+'/'+id+'.txt';await writeFile(resolve(root,log),output);
  const step={id,args,exitCode:r.status,log:await bind(log),counts:tapCounts(output)};report.steps.push(step);console.log(JSON.stringify(step));
  if(r.status!==0){report.status='failed';break;}if(Object.hasOwn(step.counts,'tests'))passed(step.counts);
  if(id==='candidate-reproduction'){const result=JSON.parse(output.trim());assert.equal(result.mode,'check');assert.equal(result.artifacts,44);assert.equal(result.referenceOnly,true);assert.equal(result.exportAllowed,false);}
  if(id==='legacy-equivalence'){const result=JSON.parse(output.trim());assert.equal(result.status,'passed');assert.equal(result.comparisons,1584);report.legacyComparisons=result.comparisons;}
 }
 report.runnerInputsAfter=await Promise.all(fixed.map(bind));assert.deepEqual(report.runnerInputsBefore,report.runnerInputsAfter);
 if(report.status!=='failed')report.status='passed';await writeFile(resolve(root,out+'/preflight.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,2);const report=await preflight();console.log(JSON.stringify({status:report.status,steps:report.steps.length}));process.exitCode=report.status==='passed'?0:1;}

