// SPDX-License-Identifier: AGPL-3.0-only
// Bind the actual checked local integration, never a release or human acceptance.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const output='outputs/ap23f3-2026-10-22';
const raw=path=>readFile(path);
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const bind=async path=>{const bytes=await raw(path);return {path,byteLength:bytes.length,sha256:hash(bytes)};};
const protectedInput=await json(output+'/protected-inputs.json');
const extra=await json(output+'/additional-protected-inputs.json');
const all={...protectedInput.files,...extra};
for(const [path,expected] of Object.entries(all)) assert.equal(hash(await raw(path)),expected,path);
const f2=await json('outputs/ap23f2-candidate-2026-10-22/bundle/manifest.json');
for(const item of f2.artifacts) assert.equal(hash(await raw('outputs/ap23f2-candidate-2026-10-22/bundle/'+item.path)),item.sha256,item.path);
const head=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
assert.equal(head,protectedInput.head);
const evidenceNames=['QA-AP23F3.json','bundle-integrity.json','web-build.json','spfx-build.json','actual-package.json'];
const evidence=await Promise.all(evidenceNames.map(name=>bind(output+'/'+name)));
for(const name of ['QA-AP23F3.json','web-build.json','spfx-build.json','actual-package.json']) assert.equal((await json(output+'/'+name)).status,'passed',name);
const spfx=await json(output+'/spfx-build.json');
assert.equal(hash(await raw(spfx.testPackage.path)),spfx.testPackage.sha256);
assert.equal(spfx.operatingPackagePreserved,true);
for(const before of spfx.protectedBefore) assert.equal(hash(await raw(before.path)),before.sha256,before.path);
const sourcePaths=[];
async function collect(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await collect(p);else if(/\.(ts|tsx|css)$/.test(p))sourcePaths.push(p);}}
for(const dir of ['src/core','src/ui'])await collect(dir);
for(const path of sourcePaths.filter(p=>!p.includes('/preview/'))){
  const copy='spfx/src/product/'+path.slice(4);
  assert.equal(hash(await raw(copy)),hash(await raw(path)),'Stale generated SPFx copy: '+path);
}
sourcePaths.push('package.json','scripts/check-ap23f3.mjs','scripts/finalize-ap23f3.mjs','scripts/check-ap23f3-package.mjs',
 'scripts/build-ap23f3-candidate.ts','scripts/build-ap23f3-public.mjs','scripts/build-ap23f3-spfx.mjs','scripts/build-public-app.mjs',
 'src/release/ap23f3CandidateData.ts','src/public-app/ap23f3-main.tsx',
 'schemas/release-manifest-v10.schema.json','schemas/administrative-procedure-catalog-v3.schema.json','schemas/implementation/ap23f3/local-reference-manifest-v10.schema.json',
 'spfx/scripts/sync-schemas.mjs','spfx/src/core/ReleaseValidator.ts','spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx',
 'tests/core/ap23f3Fixtures.ts','tests/core/ap23f3-core.test.ts','tests/core/ap23f3-data.test.ts',
 'tests/ui/ap23f3-administrative.test.tsx','tests/ui/ap23f3-app.test.tsx','tests/hosts/ap23f3-spfx-host.test.ts','tests/hosts/ap23f3-packaged.test.ts',
 'tests/public-app/ap23f3-build.test.ts','tests/data/test_ap23f3_contract.py','spfx/test/ap23f3-fixture.ts','spfx/test/ap23f3-format10.test.ts',
 'docs/fachrecht/abnahme-ap23f2.md','docs/entscheidungen/DEC-2026-035-beschluss.md','docs/architektur/verwaltungsintegration-ap23f3.md',
 'outputs/ap23f3-2026-10-22/browser-form-de.png','outputs/ap23f3-2026-10-22/browser-sg-de.png','outputs/ap23f3-2026-10-22/browser-sg-fr.png');
const sourceBindings=await Promise.all([...new Set(sourcePaths)].sort().map(bind));
const qa=await json(output+'/QA-AP23F3.json');
for(const step of qa.steps)assert.equal(hash(await raw(step.log)),step.sha256,step.log);
const report={workPackage:'AP23F3',status:'local-technical-verification-passed-awaiting-human-acceptance',head,
 sourceReleaseApproved:false,commitCreated:false,sourcePushPerformed:false,installationPerformed:false,
 regularIntermediateRelease:false,protectedFiles:Object.keys(all).length,historicalF2ArtifactBytesVerified:f2.artifacts.length,
 operatingPackagePreserved:true,candidateManifest:await bind('data/candidates/2026-10-22-ap23f3/manifest.json'),
 evidence,sourceBindings,toolchain:{node:process.version,npm:'10.9.8'},
 browser:{actualLocalBuild:true,languages:['de','fr'],realDeviceTest:false,realM365HostTest:false},
 initialAttempts:{spfx:'.work/ap23f3-spfx-build-jP0hLQ/verification.json',package:output+'/actual-package-initial.json',
 explanation:'Initial SPFx source-copy race and initial test-harness stage accessor corrected or repeated against frozen inputs. No legal rule changed.'}};
await writeFile(output+'/local-completion.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,protectedFiles:report.protectedFiles,sourceBindings:sourceBindings.length}));
