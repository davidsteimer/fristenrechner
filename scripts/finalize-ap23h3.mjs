// SPDX-License-Identifier: AGPL-3.0-only
// Bind actual local H3 inputs and evidence. Does not issue human or operating approval.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23h3-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=p=>readFile(resolve(root,p)),json=async p=>JSON.parse(await raw(p));
const bind=async path=>{const b=await raw(path);return{path,byteLength:b.length,sha256:hash(b)};};
const run=(command,args)=>spawnSync(command,args,{cwd:root,
  env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')},encoding:'utf8',maxBuffer:64*1024*1024});
const preservation=run(process.execPath,['scripts/check-ap23h3-preservation.mjs','--write']);
assert.equal(preservation.status,0,(preservation.stdout??'')+(preservation.stderr??''));
const guard=await json(out+'/preservation-verification.json');
assert.equal(guard.protectedFilesVerified,1810);
assert.equal(guard.additionalMutableInputs.length,2);
const head=run('git',['rev-parse','HEAD']).stdout.trim();
assert.equal(head,guard.head);
const qa=await json(out+'/QA-AP23H3.json'),spfx=await json(out+'/spfx-build.json');
const web=await json(out+'/web-build.json'),pkg=await json(out+'/actual-package.json');
for(const[name,r]of Object.entries({qa,spfx,web,pkg}))assert.equal(r.status,'passed',name);
assert.deepEqual(qa.steps.map(s=>s.id),['typecheck','native-schema-rebuild','candidate-rebuild','product-regression',
  'host-lifecycle','actual-web-bundle','independent-schema','h2-archive','h2-archive-tests','web-build']);
for(const[id,count]of [['product-regression',3053],['host-lifecycle',40],['actual-web-bundle',16],['h2-archive-tests',29]]){
  const counts=qa.steps.find(s=>s.id===id).counts;
  assert.deepEqual(counts,{tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0},id);
}
assert.match((await raw(qa.steps.find(s=>s.id==='independent-schema').log)).toString(),/Ran 9 tests/);
assert.equal(spfx.steps.length,5);
for(const s of [...qa.steps,...spfx.steps]){
  assert.equal(s.exitCode,0,s.id??s.log);
  assert.equal(hash(await raw(s.log)),s.sha256,s.log);
}
for(const a of [...spfx.protectedBefore,...web.protectedBefore,spfx.testPackage,...web.artifacts]){
  assert.deepEqual(await bind(a.path),a,a.path);
}
assert.deepEqual(spfx.protectedAfter,spfx.protectedBefore);
assert.deepEqual(web.protectedAfter,web.protectedBefore);
assert.equal(spfx.operatingPackagePreserved,true);
assert.equal(pkg.typecheckExitCode,0);
assert.equal(pkg.counts.fail,0);
assert.equal(pkg.counts.pass,pkg.counts.tests);
assert.equal(pkg.counts.skipped,0);
assert.equal(pkg.counts.tests,9);
assert.equal(hash(await raw(pkg.log)),pkg.sha256);
assert.deepEqual(pkg.package,spfx.testPackage);
const builtCounts=text=>Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
for(const[index,count]of [[0,248],[4,170]])assert.deepEqual(builtCounts((await raw(spfx.steps[index].log)).toString()),
  {tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0},'Actual SPFx gate '+index);
assert.match((await raw(spfx.steps[1].log)).toString(),/Encountered 60 warnings/);

const source=[];
async function collect(dir,pattern){
  for(const e of await readdir(resolve(root,dir),{withFileTypes:true})){
    assert.ok(!e.isSymbolicLink(),dir+'/'+e.name);
    const p=dir+'/'+e.name;
    if(e.isDirectory())await collect(p,pattern);
    else if(pattern.test(p))source.push(p);
  }
}
for(const dir of ['src/core','src/ui'])await collect(dir,/\.(ts|tsx|css)$/);
for(const p of source.filter(p=>!p.includes('/preview/'))){
  const copy='spfx/src/product/'+p.slice(4),staged=spfx.stage+'/spfx/src/product/'+p.slice(4);
  assert.equal(hash(await raw(copy)),hash(await raw(p)),'Stale generated root copy '+p);
  assert.equal(hash(await raw(staged)),hash(await raw(p)),'Stale actual package input '+p);
}
const hostInputs=[];
async function collectHost(dir){
  for(const e of await readdir(resolve(root,dir),{withFileTypes:true})){
    assert.ok(!e.isSymbolicLink(),dir+'/'+e.name);
    const p=dir+'/'+e.name;
    if(e.isDirectory())await collectHost(p);
    else if(/\.(?:ts|tsx|json|css|scss|mjs)$/.test(p))hostInputs.push(p);
  }
}
for(const dir of ['spfx/src','spfx/scripts'])await collectHost(dir);
hostInputs.push('spfx/tsconfig.json');
for(const p of hostInputs)assert.equal(hash(await raw(spfx.stage+'/'+p)),hash(await raw(p)),
  'Stale actual host or schema input '+p);
source.push(...hostInputs);
assert.deepEqual(await bind(spfx.compiler.configuration.path),spfx.compiler.configuration);
const review=await json(out+'/independent-core-review.json');
assert.equal(review.status,'passed');
assert.equal(review.humanFourEyesReview,false);
assert.ok(review.bindings.length>=6);
for(const a of review.bindings)assert.deepEqual(await bind(a.path),a,'Review input drift '+a.path);
assert.deepEqual(await bind(review.tests.log.path),review.tests.log);
const exportProof=await json(out+'/export-verification.json');
assert.equal(exportProof.status,'passed');
assert.equal(exportProof.qualifiedPaths,21);
assert.equal(exportProof.syntheticInMemoryArtifacts,42);
assert.equal(exportProof.actualIcsFilesSaved,0);
assert.equal(exportProof.outlookImports,0);
for(const a of exportProof.bindings)assert.deepEqual(await bind(a.path),a,'Export input drift '+a.path);

const supplemental=[];
for(const[id,command,args]of[
  ['typecheck-final',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
  ['whitespace','git',['diff','--check']]
]){
  const r=run(command,args),text=(r.stdout??'')+(r.stderr??''),log=out+'/'+id+'.txt';
  await writeFile(resolve(root,log),text);
  assert.equal(r.status,0,id+': '+text);
  supplemental.push({id,exitCode:r.status,...await bind(log)});
}
const candidate=await json(out+'/bundle-integrity.json');
assert.equal(candidate.counts.artifacts,44);
assert.equal(candidate.counts.administrativePaths,79);
assert.equal(candidate.counts.preservedAdministrativePaths,58);
assert.equal(candidate.counts.newAdministrativePaths,21);
assert.equal(candidate.counts.calendars,35);
for(const a of [candidate.manifest,...candidate.artifacts])assert.deepEqual(await bind(a.path),a,a.path);
assert.equal(candidate.generatedModules.length,3);
for(const a of candidate.generatedModules)assert.equal(hash(await raw(a.path)),a.sha256,'Generated module drift '+a.path);
for(const dir of ['tests/core','tests/ui','tests/hosts','tests/public-app','tests/governance','spfx/test','schemas/implementation/ap23h3']){
  await collect(dir,/(?:ap23h[23]|implementation\/ap23h3).*\.(?:ts|tsx|mjs|json)$/);
}
source.push('package.json','scripts/build-public-app.mjs','spfx/scripts/sync-schemas.mjs',
  'spfx/src/core/ReleaseValidator.ts','spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx',
  'src/public-app/ap23h3-main.tsx','src/release/ap23h3CandidateData.ts',
  'scripts/archive-ap23h2-acceptance.mjs','scripts/prepare-ap23h3.mjs','scripts/check-ap23h3-preservation.mjs',
  'scripts/build-ap23h3-schemas.mjs','scripts/build-ap23h3-candidate.ts','scripts/build-ap23h3-public.mjs',
  'scripts/build-ap23h3-spfx.mjs','scripts/check-ap23h3.mjs','scripts/check-ap23h3-package.mjs','scripts/finalize-ap23h3.mjs','scripts/check-ap23h3-review.mjs','scripts/check-ap23h3-browser-evidence.mjs','scripts/check-ap23h3-export.mjs',
  'tests/data/test_ap23h3_contract.py','schemas/administrative-procedure-catalog-v5.schema.json','schemas/release-manifest-v12.schema.json',
  'docs/fachrecht/abnahme-ap23h2.md','docs/entscheidungen/DEC-2026-037-beschluss.md','docs/architektur/verwaltungsintegration-ap23h3.md',
  'README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/schweizausbau-nach-mvp09.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md');
const browser=await json(out+'/browser-verification.json');
assert.equal(browser.status,'passed');
assert.equal(browser.actualLocalBuild,true);
assert.deepEqual(browser.languages,['de','fr']);
assert.deepEqual(await bind(browser.asset.path),browser.asset);
assert.ok(web.artifacts.some(a=>a.path===browser.asset.path&&a.sha256===browser.asset.sha256
  &&a.byteLength===browser.asset.byteLength),'Observed browser asset is not in final web build');
for(const a of browser.screenshots)assert.deepEqual(await bind(a.path),a);
const evidence=[out+'/QA-AP23H3.json',out+'/bundle-integrity.json',out+'/web-build.json',out+'/spfx-build.json',out+'/actual-package.json',
  out+'/protected-inputs.json',out+'/mutable-inputs.json',out+'/additional-mutable-inputs.json',out+'/preservation-verification.json',
  out+'/independent-core-review.json',out+'/independent-core-review.md',review.tests.log.path,out+'/browser-verification.json',out+'/export-verification.json',
  ...browser.screenshots.map(x=>x.path),...qa.steps.map(s=>s.log),...spfx.steps.map(s=>s.log),pkg.log,
  ...supplemental.map(s=>s.path),spfx.stage+'/verification.json',spfx.compiler.configuration.path,spfx.testPackage.path,
  ...web.artifacts.map(a=>a.path)];
const sourceBindings=await Promise.all([...new Set(source)].sort().map(bind));
const evidenceBindings=await Promise.all([...new Set(evidence)].sort().map(bind));
let links=0;
for(const p of source.filter(p=>p.endsWith('.md'))){
  const text=(await raw(p)).toString();
  for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
    const target=m[1].replace(/^<|>$/g,'').split('#')[0];
    if(!target||/^[a-z]+:/i.test(target))continue;
    const path=resolve(root,p,'..',decodeURIComponent(target));
    if(path!==resolve(root,out,'local-completion.json'))await readFile(path).catch(e=>{
      if(e.code!=='EISDIR')throw Error('Broken link '+p+' '+target);
    });
    links++;
  }
}
assert.equal(run(process.execPath,['scripts/check-ap23h3-preservation.mjs']).status,0);
const r={workPackage:'AP23H3',status:'local-technical-verification-passed-awaiting-human-acceptance',head,
  professionalTechnicalAcceptance:false,sourceReleaseApproved:false,calendarExportEnabled:false,
  commitCreated:false,sourcePushPerformed:false,installationPerformed:false,regularIntermediateRelease:false,
  operatingPackagePreserved:true,protectedFiles:1810,separatelyBoundRegistryChanges:2,candidateManifest:candidate.manifest,
  sourceBindings,evidence:evidenceBindings,supplemental,localLinksChecked:links,
  formats:{manifest:'12.0.0',minimumConsumer:'12.0.0',administrativeCatalog:'5.0.0'},
  counts:candidate.counts,browser,toolchain:{node:process.version,npm:'10.9.8'},
  warnings:{lint:60,blocking:false,source:spfx.steps[1].log},
  scope:'Local native integration only. Synthetic approvals remain test-memory only. E/Q/P, AP5, AP21, mirrors, permissions, hosting and operating pins unchanged.'};
await writeFile(resolve(root,out,'local-completion.json'),JSON.stringify(r,null,2)+'\n');
console.log(JSON.stringify({status:r.status,protectedFiles:r.protectedFiles,sourceBindings:sourceBindings.length,
  evidence:evidenceBindings.length,localLinksChecked:links},null,2));
