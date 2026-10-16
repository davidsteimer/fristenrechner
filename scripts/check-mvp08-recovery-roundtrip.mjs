// SPDX-License-Identifier: AGPL-3.0-only
// Separate supplemental proof. Does not rewrite the completed recovery build.
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, PREFIX, verifyArchive, hash, passing } from './build-mvp08-recovery.mjs';
import { requireR08BApproval } from './record-r08b-execution-approval.mjs';
const OUTPUT=`${PREFIX}/recovery-roundtrip`;
const read=path=>readFile(resolve(ROOT,path));
const encode=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const bind=async path=>{const bytes=await read(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
async function writeNew(path,bytes){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes,{flag:'wx'});}
async function inventory(){
  const paths=['scripts/check-mvp08-recovery-roundtrip.mjs','scripts/build-mvp08-recovery.mjs',
    'spfx/recovery-mvp08/package-harness.cjs','spfx/recovery-mvp07/package-harness.cjs','spfx/test-build/package-harness.cjs',
    `${PREFIX}/r08b-execution-approval.json`,`${PREFIX}/product-build.json`,`${PREFIX}/recovery-0.8.0.1/artifact-verification.json`,
    `${PREFIX}/fristenrechner-schweiz-0.8.0.0.sppkg`,`${PREFIX}/fristenrechner-schweiz-recovery-0.8.0.1.sppkg`,
    'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg'];
  for(const name of await readdir(resolve(ROOT,'spfx/recovery-mvp08/roundtrip'))){assert.ok(/^[a-z-]+\.(?:test\.)?cjs$/.test(name));paths.push(`spfx/recovery-mvp08/roundtrip/${name}`);}
  for(const directory of [`data/releases/2026-10-15-mvp-08-approved.1`,`${PREFIX}/recovery-0.8.0.1/build-inputs/data/releases/2026-10-08-mvp-07-approved.1`]){
    const manifest=JSON.parse(await read(`${directory}/manifest.json`));paths.push(`${directory}/manifest.json`);
    for(const item of manifest.artifacts){const actual=await bind(`${directory}/${item.path}`);assert.equal(actual.sha256,item.sha256);assert.equal(actual.byteLength,item.byteLength);paths.push(actual.path);}
  }
  return Promise.all([...new Set(paths)].sort().map(bind));
}
export async function run(){
  assert.equal(process.version,'v22.23.2');
  const authority=await requireR08BApproval();assert.equal(authority.record.permissions.localRecoveryBuildAuthorized,true);
  const verified=await verifyArchive();assert.equal(verified.passed,true);
  try{await read(`${OUTPUT}/verification.json`);assert.fail('Do not overwrite the completed roundtrip proof');}catch(error){if(error.code!=='ENOENT')throw error;}
  const inputs=await inventory(),product=JSON.parse(await read(`${PREFIX}/product-build.json`));assert.equal(product.status,'passed');
  const stage=relative(ROOT,await mkdtemp(resolve(ROOT,'.work/mvp08-recovery-roundtrip-')));
  const tests=['preferences','administrative','reset','corrupt','future','positive-equivalence'].map(name=>`recovery-mvp08/roundtrip/${name}.test.cjs`);
  const report={kind:'mvp08-actual-package-recovery-roundtrip',startedAt:new Date().toISOString(),status:'running',stage,
    authority:{path:authority.path,sha256:authority.sha256},normalPackage:product.package,
    recoveryPackage:inputs.find(item=>item.path===`${PREFIX}/fristenrechner-schweiz-recovery-0.8.0.1.sppkg`),
    functionalSequence:['MVP08 0.8.0.0 / Format8','MVP07 recovery 0.8.0.1 / Format7','MVP08 0.8.0.0 / own cached Format8'],
    cases:['valid V5 legacy-profile preferences','valid V5 administrative preferences','V5 reset marker','corrupt V5 slot','future V5 slot'],
    limitation:'Local real AMD code with simulated React hooks, IndexedDB, browser storage and byte transport. Not an actual M365 installation, browser DOM or live host proof. The last package reload proves code/data compatibility, not an installable lower-version reinstallation after recovery.',
    subsequentRealMvp08PackageMustExceed:'0.8.0.1',installationAuthorized:false,actualDeploymentPerformed:false,
    publicationAuthorized:false,browserDataResetPerformed:false,inputs,steps:[]};
  const env={...process.env};for(const key of ['FRISTENRECHNER_TEST_SPPKG','FRISTENRECHNER_DATA_CANDIDATE'])delete env[key];
  try{
    const args=['--test','--test-concurrency=1','--test-timeout=60000',...tests];
    const result=spawnSync(process.execPath,args,{cwd:resolve(ROOT,'spfx'),env,encoding:'utf8',maxBuffer:64*1024*1024});
    const bytes=Buffer.from(`${result.stdout??''}${result.stderr??''}${result.error??''}`),log=`${stage}/roundtrip.log`;
    await writeNew(log,bytes);report.steps.push({id:'actual-package-roundtrip',command:process.execPath,args,exitCode:result.status,log,sha256:hash(bytes)});
    assert.equal(result.status,0,`Roundtrip test failure. Inspect ${log}`);report.steps[0].tests=passing(result.stdout);
    assert.equal(report.steps[0].tests,6);assert.deepEqual(await inventory(),inputs);assert.equal((await verifyArchive()).passed,true);
    report.status='passed';
  }catch(error){report.status='failed';report.error=String(error.stack??error);}
  report.finishedAt=new Date().toISOString();await writeNew(`${stage}/verification.json`,encode(report));
  if(report.status==='passed'){
    report.archivedFiles=[];
    for(const item of [...inputs,...report.steps.map(step=>({path:step.log,byteLength:undefined,sha256:step.sha256}))]){
      const bytes=await read(item.path);assert.equal(hash(bytes),item.sha256);
      const archivedAt=`${OUTPUT}/inputs/${item.path}`;await writeNew(archivedAt,bytes);
      report.archivedFiles.push({path:archivedAt,byteLength:bytes.length,sha256:hash(bytes)});
    }
    await writeNew(`${OUTPUT}/verification.json`,encode(report));
  }
  console.log(JSON.stringify({status:report.status,stage,report:`${OUTPUT}/verification.json`,tests:report.steps[0]?.tests,error:report.error}));
  assert.equal(report.status,'passed',report.error);return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await run();
