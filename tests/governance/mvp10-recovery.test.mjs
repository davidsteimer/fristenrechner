// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {ROOT,BASE,VERSION,OLD_PACKAGE,OLD_PACKAGE_SHA,deriveInput,normalizeGeneratedXml,auditPackage,passing,safe,exactScenarioCoverage,scenarioSelector} from '../../scripts/build-mvp10-recovery.mjs';
const archived=path=>readFile(resolve(ROOT,BASE,'build-evidence/inputs',path));
const require=createRequire(resolve(ROOT,'spfx/package.json')),{readPackage}=require(resolve(ROOT,'spfx/test-build/package-harness.cjs'));
function candidate(){const old=readPackage(resolve(ROOT,OLD_PACKAGE)),files=new Map([...old.files].map(([k,b])=>[k,Buffer.from(b)]));for(const k of['AppManifest.xml','feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml']){const s=files.get(k).toString();assert.equal(s.split('Version="0.9.0.0"').length,2);files.set(k,Buffer.from(s.replace('Version="0.9.0.0"',`Version="${VERSION}"`)));}return{old,current:{...old,files,bundle:files.get(old.bundlePath),provenance:{...old.provenance,packageSha256:'synthetic-governance-only'}}};}
test('recovery changes exactly solution and feature version from actual MVP09 archive',async()=>{const b=await archived('spfx/config/package-solution.json'),before=JSON.parse(b),after=JSON.parse(deriveInput('spfx/config/package-solution.json',b));assert.equal(after.solution.version,VERSION);assert.equal(after.solution.features[0].version,VERSION);after.solution.version=before.solution.version;after.solution.features[0].version=before.solution.features[0].version;assert.deepEqual(after,before);});
test('different predecessor package, solution or feature is rejected',async()=>{const b=await archived('spfx/config/package-solution.json');for(const s of[b.toString().replaceAll('0.9.0.0','0.8.0.0'),b.toString().replace('13090feb-a6bf-40fa-9d3c-ec8d90516a60','wrong'),b.toString().replace('3edf1509-41e9-4a2f-8005-df510eec43b6','wrong')])assert.throws(()=>deriveInput('spfx/config/package-solution.json',Buffer.from(s)));});
test('only two exact isolated package-version assertions change',async()=>{const p='spfx/test/product-integration.test.ts',b=await archived(p),after=deriveInput(p,b);assert.equal(after.toString().split("'0.10.0.1'").length,3);assert.equal(after.toString().replaceAll("'0.10.0.1'","'0.9.0.0'"),b.toString());});
test('all other product and schema inputs remain the same Buffer',()=>{for(const p of['src/ui/administrativeDefaults.ts','spfx/scripts/sync-schemas.mjs','src/core/administrativeDeadline.ts','spfx/src/core/config.ts']){const b=Buffer.from('0.9.0.0 and 0.10.0.1 are not global substitution targets');assert.equal(deriveInput(p,b),b);}});
test('strict actual-package comparator accepts version-only model',()=>{const{old,current}=candidate();assert.equal(old.provenance.packageSha256,OLD_PACKAGE_SHA);assert.equal(auditPackage(current,old).normalizedBundleByteIdentical,true);});
test('five separately counted SCSS suffix changes are narrowly permitted',()=>{const{old,current}=candidate();let text=current.bundle.toString();for(const field of['host','startup','badge','runtimeMessage','runtimeStatus'])text=text.replace(new RegExp('\\b'+field+'_[a-f0-9]{8}\\b','g'),field+'_1234abcd');current.bundle=Buffer.from(text);current.files.set(current.bundlePath,current.bundle);assert.equal(auditPackage(current,old).scopedCssMappings.length,5);});
test('arbitrary functional bundle change is rejected',()=>{const{old,current}=candidate();current.bundle=Buffer.concat([current.bundle,Buffer.from('\n/* unapproved */')]);current.files.set(current.bundlePath,current.bundle);assert.throws(()=>auditPackage(current,old));});
test('SCSS normalization rejects occurrence changes and non-listed names',()=>{for(const extra of[' host_1234abcd',' anotherField_1234abcd']){const{old,current}=candidate();current.bundle=Buffer.concat([current.bundle,Buffer.from(extra)]);current.files.set(current.bundlePath,current.bundle);assert.throws(()=>auditPackage(current,old));}});
test('XML functional changes or API permissions cannot be normalized away',()=>{for(const extra of['<AppPermissionRequest/>','<Changed/>']){const{old,current}=candidate();current.files.set('AppManifest.xml',Buffer.from(current.files.get('AppManifest.xml').toString()+extra));assert.throws(()=>auditPackage(current,old));}});
test('extra, missing and modified binary files are rejected',()=>{for(const kind of['extra','missing','changed']){const{old,current}=candidate();const k=[...current.files].find(([n,b])=>n.endsWith('.png'))?.[0]??'[Content_Types].xml';if(kind==='extra')current.files.set('unexpected.bin',Buffer.from('x'));if(kind==='missing')current.files.delete(k);if(kind==='changed')current.files.set(k,Buffer.from('x'));assert.throws(()=>auditPackage(current,old));}});
test('UUID normalization requires the entire exact generated XML shape',()=>{for(const name of['ClientSideAssets.xml.config.xml','feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml.config.xml','ClientSideAssets.xml'])assert.throws(()=>normalizeGeneratedXml(name,'<changed/>'));assert.equal(normalizeGeneratedXml('AppManifest.xml','<changed/>'),'<changed/>');});
test('archive paths reject absolute, traversal and platform escapes',()=>{for(const p of['../other','/absolute','a/../b','a\\b','a:b','a//b'])assert.throws(()=>safe(p));assert.equal(safe('spfx/src/core/config.ts'),'spfx/src/core/config.ts');});
test('TAP requires a complete successful real test stream',()=>{const good='TAP version 13\nok 1 - one\n1..1\n# tests 1\n# pass 1\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';assert.equal(passing(good),1);for(const bad of['',good.replace('# pass 1','# pass 0'),good.replace('# skipped 0','# skipped 1'),good.replace('ok 1','not ok 1')])assert.throws(()=>passing(bad));});
test('scenario coverage requires the exact complete union without duplicates or extras',()=>{
 const expected=['package:identity','defaults:seed-new-VS','cache:bytes-revalidation'];
 assert.equal(exactScenarioCoverage(expected,[...expected].reverse()),3);
 for(const covered of[[],expected.slice(1),[...expected,'unknown'],[...expected,expected[0]]])assert.throws(()=>exactScenarioCoverage(expected,covered));
 assert.throws(()=>exactScenarioCoverage([],[]));assert.throws(()=>exactScenarioCoverage(['a','a'],['a']));
});
test('unknown absent or duplicated scenario selectors fail instead of running zero tests',()=>{
 const row={id:'defaults:seed-new-VS',file:'spfx/recovery-mvp10/recovery-defaults.test.cjs',name:'one exact case'},matrix={scenarios:[row]};
 assert.equal(scenarioSelector(matrix,row.id),row);
 for(const id of['',undefined,'defaults:seed-new-VS-typo'])assert.throws(()=>scenarioSelector(matrix,id));
 assert.throws(()=>scenarioSelector({scenarios:[row,row]},row.id));
});
