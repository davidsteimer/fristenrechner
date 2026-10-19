// SPDX-License-Identifier: AGPL-3.0-only
// Supplemental actual-package proof, never rewrites the completed recovery build.
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, writeFile, readdir, lstat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, PREFIX, verifyArchive, hash, passing } from './build-mvp09-recovery.mjs';
import { requireR09BApproval } from './record-r09b-execution-approval.mjs';
const OUTPUT=`${PREFIX}/recovery-roundtrip`;
const read=path=>readFile(resolve(ROOT,path));
const encode=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const bind=async path=>{assert.ok((await lstat(resolve(ROOT,path))).isFile());const bytes=await read(path);return{path,byteLength:bytes.length,sha256:hash(bytes)};};
async function writeNew(path,bytes){await mkdir(dirname(resolve(ROOT,path)),{recursive:true});await writeFile(resolve(ROOT,path),bytes,{flag:'wx'});}
async function inventory(){
  const paths=['scripts/check-mvp09-recovery-roundtrip.mjs','scripts/build-mvp09-recovery.mjs',
    'spfx/recovery-mvp07/package-harness.cjs','spfx/test-build/package-harness.cjs',
    `${PREFIX}/r09b-execution-approval.json`,`${PREFIX}/product-build.json`,`${PREFIX}/recovery-0.9.0.1/artifact-verification.json`,
    `${PREFIX}/fristenrechner-schweiz-0.9.0.0.sppkg`,`${PREFIX}/fristenrechner-schweiz-recovery-0.9.0.1.sppkg`];
  for(const name of await readdir(resolve(ROOT,'spfx/recovery-mvp09-roundtrip'))){assert.ok(/^[a-z-]+\.(?:test\.)?cjs$/.test(name));paths.push(`spfx/recovery-mvp09-roundtrip/${name}`);}
  for(const directory of ['data/releases/2026-10-18-mvp-09-approved.1',`${PREFIX}/recovery-0.9.0.1/build-inputs/data/releases/2026-10-15-mvp-08-approved.1`]){
    const manifest=JSON.parse(await read(`${directory}/manifest.json`));paths.push(`${directory}/manifest.json`);
    for(const item of manifest.artifacts){const actual=await bind(`${directory}/${item.path}`);assert.equal(actual.sha256,item.sha256);assert.equal(actual.byteLength,item.byteLength);paths.push(actual.path);}
  }
  return Promise.all([...new Set(paths)].sort().map(bind));
}
export async function run(){
  assert.equal(process.version,'v22.23.2');
  const authority=await requireR09BApproval();assert.equal(authority.record.permissions.localRecoveryBuildAuthorized,true);
  assert.equal((await verifyArchive()).passed,true);
  try{await read(`${OUTPUT}/verification.json`);assert.fail('Do not overwrite completed roundtrip proof');}catch(error){if(error.code!=='ENOENT')throw error;}
  const inputs=await inventory(),product=JSON.parse(await read(`${PREFIX}/product-build.json`));assert.equal(product.status,'passed');
  const stage=relative(ROOT,await mkdtemp(resolve(ROOT,'.work/mvp09-recovery-roundtrip-')));
  const tests=['lu','zg','ar','corrupt','future','reset','legacy'].map(name=>`recovery-mvp09-roundtrip/${name}.test.cjs`);
  const report={kind:'mvp09-actual-package-recovery-roundtrip',startedAt:new Date().toISOString(),status:'running',stage,
    authority:{path:authority.path,sha256:authority.sha256},normalPackage:product.package,
    recoveryPackage:inputs.find(item=>item.path===`${PREFIX}/fristenrechner-schweiz-recovery-0.9.0.1.sppkg`),
    functionalSequence:['MVP09 0.9.0.0 / Format9','MVP08 recovery 0.9.0.1 / Format8','MVP09 0.9.0.0 / own cached Format9'],
    cases:['LU administrative V5','ZG administrative V5','AR five-day administrative V5','corrupt V5 slot','future V5 slot','V5 reset marker','compatible federal V5'],
    limitation:'Real unchanged AMD code with simulated React hooks, IndexedDB, browser storage and byte transport. Not an M365 installation, browser DOM or live downgrade. The last package reload proves code/data compatibility, not permission or ability to reinstall a lower version.',
    subsequentRealMvp09PackageMustExceed:'0.9.0.1',installationAuthorized:false,actualDeploymentPerformed:false,
    publicationAuthorized:false,browserDataResetPerformed:false,inputs,steps:[]};
  const env={...process.env};for(const key of ['FRISTENRECHNER_TEST_SPPKG','FRISTENRECHNER_DATA_CANDIDATE'])delete env[key];
  try{
    const args=['--test','--test-concurrency=1','--test-timeout=60000',...tests];
    const result=spawnSync(process.execPath,args,{cwd:resolve(ROOT,'spfx'),env,encoding:'utf8',maxBuffer:64*1024*1024});
    const bytes=Buffer.from(`${result.stdout??''}${result.stderr??''}${result.error??''}`),log=`${stage}/roundtrip.log`;
    await writeNew(log,bytes);report.steps.push({id:'actual-package-roundtrip',command:process.execPath,args,exitCode:result.status,log,sha256:hash(bytes)});
    assert.equal(result.status,0,`Roundtrip test failure. Inspect ${log}`);report.steps[0].tests=passing(result.stdout);assert.equal(report.steps[0].tests,7);
    assert.deepEqual(await inventory(),inputs);assert.equal((await verifyArchive()).passed,true);report.status='passed';
  }catch(error){report.status='failed';report.error=String(error.stack??error);}
  report.finishedAt=new Date().toISOString();await writeNew(`${stage}/verification.json`,encode(report));
  if(report.status==='passed'){
    report.archivedFiles=[];
    for(const item of [...inputs,...report.steps.map(step=>({path:step.log,sha256:step.sha256}))]){
      const bytes=await read(item.path);assert.equal(hash(bytes),item.sha256);const archivedAt=`${OUTPUT}/inputs/${item.path}`;await writeNew(archivedAt,bytes);
      report.archivedFiles.push({path:archivedAt,byteLength:bytes.length,sha256:hash(bytes)});
    }
    await writeNew(`${OUTPUT}/verification.json`,encode(report));
  }
  console.log(JSON.stringify({status:report.status,stage,report:`${OUTPUT}/verification.json`,tests:report.steps[0]?.tests,error:report.error}));
  assert.equal(report.status,'passed',report.error);return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await run();
