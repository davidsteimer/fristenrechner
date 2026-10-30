// SPDX-License-Identifier: AGPL-3.0-only
// Bind final local integration evidence. Never issues human or operating approval.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
const out='outputs/ap23g3-2026-10-22',hash=b=>createHash('sha256').update(b).digest('hex');
const raw=p=>readFile(p),json=async p=>JSON.parse(await raw(p)),bind=async path=>{const b=await raw(path);return{path,byteLength:b.length,sha256:hash(b)};};
const guard=await json(out+'/protected-inputs.json');
for(const[p,h]of Object.entries(guard.files))assert.equal(hash(await raw(p)),h,'Protected '+p);
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();assert.equal(head,guard.head);
const qa=await json(out+'/QA-AP23G3.json'),spfx=await json(out+'/spfx-build.json'),web=await json(out+'/web-build.json'),pkg=await json(out+'/actual-package.json');
for(const[name,r]of Object.entries({qa,spfx,web,pkg}))assert.equal(r.status,'passed',name);
for(const s of qa.steps){assert.equal(s.exitCode,0);assert.equal(hash(await raw(s.log)),s.sha256,s.log);}
for(const s of spfx.steps){assert.equal(s.exitCode,0);assert.equal(hash(await raw(s.log)),s.sha256,s.log);}
for(const a of [...spfx.protectedBefore,...web.protectedBefore,spfx.testPackage,...web.artifacts])assert.deepEqual(await bind(a.path),a,a.path);
assert.deepEqual(spfx.protectedAfter,spfx.protectedBefore);assert.deepEqual(web.protectedAfter,web.protectedBefore);assert.equal(spfx.operatingPackagePreserved,true);
assert.equal(pkg.typecheckExitCode,0);assert.equal(pkg.counts.fail,0);assert.equal(pkg.counts.pass,pkg.counts.tests);assert.equal(pkg.counts.skipped,0);
assert.equal(hash(await raw(pkg.log)),pkg.sha256);assert.deepEqual(pkg.package,spfx.testPackage);
const source=[];async function collect(dir,pattern){for(const e of await readdir(dir,{withFileTypes:true})){assert.ok(!e.isSymbolicLink(),dir+'/'+e.name);
  const p=dir+'/'+e.name;if(e.isDirectory())await collect(p,pattern);else if(pattern.test(p))source.push(p);}}
for(const dir of['src/core','src/ui'])await collect(dir,/\.(ts|tsx|css)$/);
for(const p of source.filter(p=>!p.includes('/preview/'))){const copy='spfx/src/product/'+p.slice(4),staged=spfx.stage+'/spfx/src/product/'+p.slice(4);
  assert.equal(hash(await raw(copy)),hash(await raw(p)),'Stale generated root copy '+p);assert.equal(hash(await raw(staged)),hash(await raw(p)),'Stale actual packaged build input '+p);}
const review=await raw(out+'/independent-core-review.md');
const rows=[...review.toString().matchAll(/\| `(src\/[^`]+)` \| `([a-f0-9]{64})` \|/g)];assert.equal(rows.length,7);
for(const[,p,h]of rows)assert.equal(hash(await raw(p)),h,'Independent review changed '+p);
const supplemental=[];
for(const[id,args]of[['format11-runtime',['--import','tsx','--test','tests/core/ap23g3-runtime.test.ts']],['typecheck-final',['node_modules/typescript/bin/tsc','--noEmit']],['whitespace',['--git-diff-check']]]){
  const r=args[0]==='--git-diff-check'?spawnSync('git',['diff','--check'],{encoding:'utf8',maxBuffer:16*1024*1024}):spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:16*1024*1024});
  const text=(r.stdout??'')+(r.stderr??''),log=out+'/'+id+'.txt';await writeFile(log,text);assert.equal(r.status,0,id);
  const counts=Object.fromEntries([...text.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
  supplemental.push({id,exitCode:r.status,...await bind(log),counts});
}
assert.equal(supplemental[0].counts.tests,4);assert.equal(supplemental[0].counts.fail,0);assert.equal(supplemental[0].counts.skipped,0);
const candidate=await json(out+'/bundle-integrity.json');assert.equal(candidate.counts.artifacts,42);assert.equal(candidate.counts.administrativePaths,58);
for(const a of[candidate.manifest,...candidate.artifacts])assert.deepEqual(await bind(a.path),a,a.path);
source.push('package.json','spfx/scripts/sync-schemas.mjs','spfx/src/core/ReleaseValidator.ts','spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx',
  'src/public-app/ap23g3-main.tsx','src/release/ap23g3CandidateData.ts','scripts/build-public-app.mjs',
  'scripts/build-ap23g3-schemas.mjs','scripts/build-ap23g3-candidate.ts','scripts/build-ap23g3-public.mjs','scripts/build-ap23g3-spfx.mjs',
  'scripts/check-ap23g3.mjs','scripts/check-ap23g3-package.mjs','scripts/finalize-ap23g3.mjs','scripts/prepare-ap23g3.mjs','scripts/archive-ap23g2-acceptance.mjs',
  'tests/governance/ap23g2-acceptance.test.mjs','tests/core/ap23g3Fixtures.ts','tests/core/ap23g3-core.test.ts','tests/core/ap23g3-data.test.ts','tests/core/ap23g3-runtime.test.ts',
  'tests/data/test_ap23g3_contract.py','tests/ui/ap23g3-app.test.tsx','tests/ui/ap23g3-administrative.test.tsx',
  'tests/hosts/ap23g3-spfx-host.test.ts','tests/hosts/ap23g3-packaged.test.ts','tests/public-app/ap23g3-build.test.ts',
  'spfx/test/ap23g3-fixture.ts','spfx/test/ap23g3-format11.test.ts',
  'schemas/administrative-procedure-catalog-v4.schema.json','schemas/release-manifest-v11.schema.json','schemas/implementation/ap23g3/local-reference-manifest-v11.schema.json',
  'docs/fachrecht/abnahme-ap23g2.md','docs/entscheidungen/DEC-2026-036-beschluss.md','docs/architektur/verwaltungsintegration-ap23g3.md',
  'README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
  'docs/planung/schweizausbau-nach-mvp09.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md');
const evidence=[out+'/QA-AP23G3.json',out+'/bundle-integrity.json',out+'/web-build.json',out+'/spfx-build.json',out+'/actual-package.json',
  out+'/protected-inputs.json',out+'/independent-core-review.md',out+'/browser-ur-de.png',out+'/browser-ur-result-de.png',out+'/browser-ur-fr.png',out+'/issue48-status.json',
  ...qa.steps.map(s=>s.log),...spfx.steps.map(s=>s.log),pkg.log,out+'/typecheck-final.txt',...supplemental.map(s=>s.path),spfx.stage+'/verification.json',spfx.compiler.configuration.path,spfx.testPackage.path,...web.artifacts.map(a=>a.path)];
const sourceBindings=await Promise.all([...new Set(source)].sort().map(bind)),evidenceBindings=await Promise.all([...new Set(evidence)].sort().map(bind));
let links=0;for(const p of source.filter(p=>p.endsWith('.md'))){const text=(await raw(p)).toString();for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
  const target=m[1].replace(/^<|>$/g,'').split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
  const path=resolve(p,'..',decodeURIComponent(target));if(path!==resolve(out+'/local-completion.json'))await raw(path).catch(e=>{if(e.code!=='EISDIR')throw Error('Broken link '+p+' '+target);});links++;}}
for(const[p,h]of Object.entries(guard.files))assert.equal(hash(await raw(p)),h,p);
const r={workPackage:'AP23G3',status:'local-technical-verification-passed-awaiting-human-acceptance',head,professionalTechnicalAcceptance:false,
  sourceReleaseApproved:false,calendarExportEnabled:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,regularIntermediateRelease:false,
  operatingPackagePreserved:true,protectedFiles:Object.keys(guard.files).length,candidateManifest:candidate.manifest,
  sourceBindings,evidence:evidenceBindings,supplemental,localLinksChecked:links,
  formats:{manifest:'11.0.0',minimumConsumer:'11.0.0',administrativeCatalog:'4.0.0'},
  browser:{actualLocalBuild:true,languages:['de','fr'],realDeviceTest:false,realM365HostTest:false},
  toolchain:{node:process.version,npm:'10.9.8'},
  warnings:{lint:49,blocking:false,source:spfx.steps[1].log},
  scope:'Local native integration only. Actual synthetic test approvals are in memory. E/Q/P, AP5, AP21, mirrors, permissions and operating pins unchanged.'};
await writeFile(out+'/local-completion.json',JSON.stringify(r,null,2)+'\n');
console.log(JSON.stringify({status:r.status,protectedFiles:r.protectedFiles,sourceBindings:sourceBindings.length,evidence:evidenceBindings.length,localLinksChecked:links},null,2));
