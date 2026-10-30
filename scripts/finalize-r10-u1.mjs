// SPDX-License-Identifier: AGPL-3.0-only
// Close actual local artefact evidence. Never substitute for a human acceptance.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildPlan,tapCounts,assertPassedCounts} from './check-r10-u1.mjs';
import {checkPreservation,preservationConfig} from './check-r10-u1-preservation.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const completionConfig=Object.freeze({out:'outputs/r10-u1-2026-10-28',proof:'outputs/r10-u1-2026-10-28/local-completion.json',
 documents:['docs/ux/r10-u1-nachtrag.md'],living:preservationConfig.livingPaths});
const {out,proof}=completionConfig,raw=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await raw(path));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function safe(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!/[:\\\x00-\x1f\x7f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Closed evidence path '+path);return path;}
const bind=async path=>{safe(path);const b=await raw(path);return{path,byteLength:b.length,sha256:sha(b)};};
async function verifyInputs(rows,label){assert.ok(Array.isArray(rows)&&rows.length>0,label);assert.equal(new Set(rows.map(r=>r.path)).size,rows.length);for(const row of rows)assert.deepEqual(await bind(row.path),row,label+' '+row.path);}
async function tree(path){const result=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){const p=path+'/'+item.name;assert.ok(!item.isSymbolicLink(),p);if(item.isDirectory())result.push(...await tree(p));else{assert.ok(item.isFile());result.push(p);}}return result.sort();}
const copiedDirs=['spfx/src','spfx/scripts','spfx/config','spfx/test','spfx/test-build'];
async function copiedFiles(){const files=(await readdir(resolve(root,'spfx'),{withFileTypes:true})).filter(item=>item.isFile()).map(item=>'spfx/'+item.name);for(const path of copiedDirs)files.push(...await tree(path));return[...new Set(files)].sort();}
async function verifyStage(spfx){
 assert.match(spfx.stage,/^\.work\/r10-u1-spfx-build-[A-Za-z0-9]{6}$/u);const verified=[];
 for(const directory of copiedDirs)assert.deepEqual((await tree(spfx.stage+'/'+directory)).map(path=>path.slice(spfx.stage.length+1)),await tree(directory),'Stage inventory '+directory);
 for(const path of await copiedFiles()){const source=await bind(path),stage=await bind(spfx.stage+'/'+path);assert.equal(source.sha256,stage.sha256,'Actual compiled source '+path);assert.equal(source.byteLength,stage.byteLength);verified.push({source,stage});}
 assert.deepEqual(await bind(spfx.testPackage.path),spfx.testPackage);assert.deepEqual(await json(spfx.stage+'/verification.json'),spfx);
 const sourceTests=(await readdir(resolve(root,'spfx/test'))).filter(name=>name.endsWith('.test.ts')).sort().map(name=>'test/'+name);
 const historicalTests=(await readdir(resolve(root,'spfx/test-build'))).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>'test-build/'+name);
 assert.deepEqual(spfx.steps[2].args.filter(arg=>arg.endsWith('.test.ts')),sourceTests,'Complete SPFx source test inventory');
 assert.deepEqual(spfx.steps[6].args.filter(arg=>arg.endsWith('.test.cjs')),historicalTests,'Complete historical package test inventory');
 for(const step of spfx.steps){assert.equal(step.exitCode,0);assert.deepEqual(await bind(step.log),{path:step.log,byteLength:step.byteLength,sha256:step.sha256});}
 const sourceCounts=tapCounts((await raw(spfx.steps[2].log)).toString()),historicalCounts=tapCounts((await raw(spfx.steps[6].log)).toString());
 assertPassedCounts(sourceCounts,'SPFx source');assertPassedCounts(historicalCounts,'Historical package');
 assert.deepEqual(spfx.protectedBefore,spfx.protectedAfter);await verifyInputs(spfx.protectedAfter,'Operating paths');
 return{verified,sourceTestFiles:sourceTests.length,historicalTestFiles:historicalTests.length,sourceCounts,historicalCounts};
}

export function validateBrowserBinding(browser,web,layout){
 assert.equal(browser.workPackage,'R10-U1');assert.equal(browser.status,'passed-local-browser');assert.equal(browser.localOnly,true);
 assert.equal(browser.realDeviceOrM365Test,false);assert.equal(browser.realZoomTest,false);
 assert.equal(browser.sourceReleaseApproved,false);assert.equal(browser.url,'http://127.0.0.1:8812/fristenrechner/');
 assert.equal(browser.dataReleaseId,web.dataReleaseId);assert.equal(browser.dataReleaseId,'2026-10-28-ap23m3-candidate.1');
 const indexes=web.artifacts.filter(r=>r.path==='.work/public-r10-u1/index.html'),apps=web.artifacts.filter(r=>/^\.work\/public-r10-u1\/assets\/app-[A-Z0-9]+\.js$/u.test(r.path));
 assert.equal(indexes.length,1);assert.equal(apps.length,1);for(const row of [...indexes,...apps])assert.deepEqual(browser.evidence.find(r=>r.path===row.path),row,'Current browser application '+row.path);
 for(const row of layout.artifacts)assert.deepEqual(browser.evidence.find(r=>r.path===row.path),row,'Actual layout fixture '+row.path);
 assert.deepEqual(browser.layoutWidths,[1120,400,373,320]);assert.deepEqual(browser.languages,['de','fr']);
 for(const key of ['socialLawSelectionVisible','earlyAbortText','actualPackageRowWraps','localReferenceExportBlocked'])assert.equal(browser.checks[key],true,key);
 assert.ok(browser.evidence.some(r=>r.path.endsWith('.png')));assert.ok(browser.evidence.some(r=>r.path.endsWith('.txt')));return true;
}
export const completionFlags=['humanAcceptance','sourceReleaseApproved','dataPromoted','commitCreated','sourcePushPerformed','installationPerformed','operatingChanges','realM365Validation'];
export function metadataFromEvidence(e){return{
 workPackage:'R10-U1',asOf:'2026-10-28',status:'local-follow-up-verified-awaiting-human-acceptance',head:e.qa.head,
 scope:['R10-H01','T06-H01','B11-H01'],formatsUnchanged:true,legalDataUnchanged:true,calculationRulesUnchanged:true,
 acceptedM3ArchiveUnchanged:true,immutableFiles:e.preservation.protectedFilesVerified,mutableBoundary:9,livingBoundary:8,
 qaCounts:e.qaCounts,hostCounts:{source:e.stage.sourceCounts.tests,historicalPackage:e.stage.historicalCounts.tests,actualPackage:e.packaged.counts.tests},
 actualPackage:e.spfx.testPackage,webReleaseId:e.web.dataReleaseId,
 localCorrectionVerified:{'R10-H01':true,'T06-H01':true,'B11-H01':true},
 limitations:['Real M365 wrapper layout at 100/300 percent requires later E/Q validation. Local width proof is not a real zoom or device test.','Local reference candidate remains non-operational and export-disabled.'],
 ...Object.fromEntries(completionFlags.map(k=>[k,false])),
 nextGate:'Human acceptance of R10-U1. Afterwards R10-A1 may prepare the combined release inventory. No promotion, commit, upload or installation authority.'
};}
export function validateCompletionMetadata(saved,e){const expected=metadataFromEvidence(e);for(const[k,v]of Object.entries(expected))assert.deepEqual(saved[k],v,k);
 assert.match(saved.head,/^[a-f0-9]{40}$/u);assert.ok(Number.isSafeInteger(saved.localLinksChecked)&&saved.localLinksChecked>0);
 assert.ok(Array.isArray(saved.bindings)&&saved.bindings.length>0);assert.equal(new Set(saved.bindings.map(r=>r.path)).size,saved.bindings.length);
 for(const row of saved.bindings){safe(row.path);assert.deepEqual(Object.keys(row).sort(),['byteLength','path','sha256']);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);assert.match(row.sha256,/^[a-f0-9]{64}$/u);}
 assert.deepEqual(Object.keys(saved).sort(),[...Object.keys(expected),'localLinksChecked','bindings'].sort());return true;}
export async function collectEvidence(){
 const preservation=await checkPreservation(),qa=await json(out+'/QA-R10-U1.json'),spfx=await json(out+'/spfx-build.json'),web=await json(out+'/web-build.json'),packaged=await json(out+'/actual-package.json'),layout=await json(out+'/layout-build.json'),browser=await json(out+'/browser-verification.json');
 for(const[name,value]of Object.entries({qa,spfx,web,packaged}))assert.equal(value.status,'passed',name);
 assert.equal(qa.head,preservation.head);assert.equal(qa.workPackage,'R10-U1');assert.equal(qa.localOnly,true);
 assert.deepEqual(qa.inputsBefore,qa.inputsAfter);await verifyInputs(qa.inputsAfter,'QA source input');
 assert.deepEqual(qa.inputsAfter.map(r=>r.path),[...new Set([...preservationConfig.mutableAllowed,...preservation.newFollowUpFiles,'scripts/run-standard-tests.mjs','tsconfig.json'])].sort(),'Complete follow-up QA source inventory');
 for(const flag of ['sourceReleaseApproved','installationPerformed','githubPushPerformed'])assert.equal(qa[flag],false);
 const plan=await buildPlan();assert.deepEqual(qa.steps.map(r=>r.id),plan.map(r=>r[0]));const qaCounts={};
 for(const step of qa.steps){assert.equal(step.exitCode,0,step.id);assert.deepEqual(step.args,plan.find(r=>r[0]===step.id)[2]);assert.deepEqual(await bind(step.log),{path:step.log,byteLength:step.byteLength,sha256:step.sha256});
 if(Object.hasOwn(step.counts,'tests')){assertPassedCounts(step.counts,step.id);assert.deepEqual(tapCounts((await raw(step.log)).toString()),step.counts);qaCounts[step.id]=step.counts.tests;}}
 for(const key of ['product-regression','host-lifecycle','actual-web-bundle','governance'])assert.ok(qaCounts[key]>0,key);
 for(const value of[spfx,web]){assert.equal(value.workPackage,'R10-U1');assert.equal(value.localOnly,true);assert.equal(value.deployable,false);assert.deepEqual(value.protectedBefore,value.protectedAfter);await verifyInputs(value.protectedAfter,'Operating input');}
 const stage=await verifyStage(spfx);
 assert.equal(packaged.workPackage,'R10-U1');assert.equal(packaged.stage,spfx.stage);assert.deepEqual(packaged.package,spfx.testPackage);
 assert.equal(packaged.localOnly,true);assert.equal(packaged.syntheticApprovalsOnly,true);assert.equal(packaged.installationPerformed,false);assert.equal(packaged.exitCode,0);
 assert.deepEqual(packaged.args,['--import','tsx','--test','--test-timeout=900000','tests/hosts/r10-u1-packaged.test.ts','tests/hosts/r10-u1-social-packaged.test.ts','tests/hosts/r10-u1-layout.test.ts']);
 assertPassedCounts(packaged.counts,'Actual packaged follow-up');assert.equal(packaged.counts.tests,36);
 assert.equal(sha(await raw(packaged.log)),packaged.sha256);assert.deepEqual(tapCounts((await raw(packaged.log)).toString()),packaged.counts);
 await verifyInputs(web.artifacts,'Actual web byte');assert.equal(web.dataReleaseId,'2026-10-28-ap23m3-candidate.1');
 assert.equal(layout.workPackage,'R10-U1');assert.equal(layout.status,'built-awaiting-browser-measurement');assert.equal(layout.stage,spfx.stage);assert.deepEqual(layout.package,spfx.testPackage);
 for(const key of ['actualPackageMarkup','actualHashedClasses','actualPackagedCss','localOnly','widthsAreViewportCssPixels'])assert.equal(layout[key],true,key);
 for(const key of ['calculatorExecuted','syntheticApprovalCreated','zoomTest','realDeviceTest','m365HostTest','sourceReleaseApproved','operatingChanges'])assert.equal(layout[key],false,key);
 assert.equal(layout.cases.length,8);await verifyInputs(layout.bindings,'Actual package layout input');await verifyInputs(layout.artifacts,'Actual package layout byte');
 validateBrowserBinding(browser,web,layout);await verifyInputs(browser.evidence,'Actual browser byte');
 return{preservation,qa,spfx,web,packaged,layout,browser,stage,qaCounts};
}
async function inventory(e){const paths=[...completionConfig.documents,...completionConfig.living,'package.json','scripts/build-public-app.mjs',...preservationConfig.mutableAllowed,
 preservationConfig.guardPath,preservationConfig.previousProof.path,'outputs/ap23m3-abnahme-2026-10-28/receipt.json','src/public-app/r10-u1-main.tsx'];
 for(const dir of ['scripts','tests/governance','tests/hosts','tests/ui','tests/public-app'])paths.push(...(await tree(dir)).filter(p=>p.split('/').at(-1).startsWith('r10-u1')||p.split('/').at(-1).includes('-r10-u1')));
 paths.push(...(await tree(out)).filter(p=>p!==proof),...e.web.artifacts.map(r=>r.path),...e.layout.artifacts.map(r=>r.path),...e.browser.evidence.map(r=>r.path),e.spfx.testPackage.path,e.spfx.stage+'/verification.json',...e.spfx.steps.map(r=>r.log));
 for(const row of e.stage.verified)paths.push(row.source.path,row.stage.path);
 return[...new Set(paths)].sort();}
export async function finalize(mode){assert.ok(mode==='--write'||mode==='--check');const e=await collectEvidence(),expectedPaths=await inventory(e);
 if(mode==='--check'){const saved=await json(proof);validateCompletionMetadata(saved,e);assert.deepEqual(saved.bindings.map(r=>r.path),expectedPaths);await verifyInputs(saved.bindings,'Final follow-up byte');return{status:'local-follow-up-reverified',bindings:saved.bindings.length,humanAcceptance:false,operatingChanges:false};}
 let localLinksChecked=0;for(const p of [...completionConfig.documents,...completionConfig.living])for(const m of(await raw(p)).toString().matchAll(/\]\(([^)]+)\)/gu)){const target=m[1].replace(/^<|>$/gu,'').split('#')[0];if(!target||/^(?:https?:|mailto:|codex:|plugin:)/iu.test(target))continue;const absolute=resolve(root,dirname(p),decodeURIComponent(target));if(absolute!==resolve(root,proof))await access(absolute);localLinksChecked++;}
 const report={...metadataFromEvidence(e),localLinksChecked,bindings:await Promise.all(expectedPaths.map(bind))};validateCompletionMetadata(report,e);await writeFile(resolve(root,proof),JSON.stringify(report,null,2)+'\n');await verifyInputs(report.bindings,'Final readback');return{status:report.status,bindings:report.bindings.length,qaCounts:e.qaCounts,hostCounts:report.hostCounts,humanAcceptance:false,operatingChanges:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await finalize(process.argv[2]),null,2));

