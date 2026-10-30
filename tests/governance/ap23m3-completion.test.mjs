// SPDX-License-Identifier: AGPL-3.0-only
// Synthetic metadata tests. Never execute the finalizer, build or operating workflow.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
import {metadataFromEvidence,validateCompletionMetadata,completionFlags,completionConfig,validateBrowserBinding} from '../../scripts/finalize-ap23m3.mjs';
import {buildPlan,tapCounts,assertPassedCounts} from '../../scripts/check-ap23m3.mjs';
const bundle=JSON.parse(readFileSync(new URL('../../outputs/ap23m3-2026-10-28/bundle-integrity.json',import.meta.url),'utf8'));
const suite=JSON.parse(readFileSync(new URL('../../docs/fachrecht/ap23m1/referenzfaelle.json',import.meta.url),'utf8'));
function fixture(){const e={qa:{head:'a'.repeat(40)},bundle:structuredClone(bundle),native:{consumerCases:suite.cases.length,syntheticCases:33,oldNativeCases:bundle.counts.preservedAdministrativePaths,consumerOutcomes:{datedResearchValue:73,qualificationBoundaryProposed:27,researchWindowBoundary:6,unresolvedBoundaryProposed:3}},
 independent:{counts:{originalReferences:suite.cases.length,independentProbes:1239,mutationSensitivities:3,physicalCalendarProbes:22,physicalCalendarYearEnumerations:70,positivePaths:49,oldPathsPreserved:196,unchangedNonAdministrativeArtifacts:42}},inherited:{referenceCases:776},
 qaCounts:{'product-regression':1,'host-lifecycle':1,'actual-web-bundle':1,governance:1},exported:{qualifiedPaths:49,qualifiedCases:73,syntheticInMemoryArtifacts:146,referenceExportsDenied:73,blockedCasesDenied:36,changedFactsDenied:844,changedDurationsDenied:73,resultClonesDenied:219,contextClonesDenied:73,changedDatesDenied:73,directCoreResultsDenied:73},
 // Small synthetic counts only. The real collector derives every total from actual TAP evidence.
 stage:{sourceTestFiles:1,historicalTestFiles:1,verified:[{}],sourceCounts:{tests:1},historicalCounts:{tests:1}},packaged:{counts:{tests:1}},
 spfx:{testPackage:{path:'.work/ap23m3-spfx-build-ABC123/spfx/sharepoint/solution/fristenrechner-schweiz.sppkg',byteLength:1,sha256:'b'.repeat(64)}}};
 const saved={...metadataFromEvidence(e),localLinksChecked:1,bindings:[{path:'synthetic/file.txt',byteLength:1,sha256:'c'.repeat(64)}]};return{e,saved};}
function rejects(edit){const{e,saved}=fixture();edit(saved,e);assert.throws(()=>validateCompletionMetadata(saved,e));}
test('complete synthetic local integration metadata validates without a completion proof file',()=>{const{e,saved}=fixture(),before=structuredClone(saved);assert.equal(validateCompletionMetadata(saved,e),true);assert.deepEqual(saved,before);assert.equal(saved.formats.manifest,'17.0.0');assert.equal(saved.formats.administrativeCatalog,'10.0.0');});
test('M3 fixture binds actual accepted and inherited case inventories without granting approval',()=>{
 const{saved}=fixture();assert.equal(suite.cases.length,109);
 assert.equal(saved.nativeCounts.consumerReferences,109);assert.equal(saved.nativeCounts.syntheticCases,33);assert.equal(saved.nativeCounts.oldNativeReferences,196);
 assert.deepEqual(saved.nativeCounts.consumerOutcomes,{datedResearchValue:73,qualificationBoundaryProposed:27,researchWindowBoundary:6,unresolvedBoundaryProposed:3});
 assert.equal(saved.inheritedReferenceCases,776);assert.equal(saved.protectedFiles,11540);assert.equal(saved.mutableSourceBoundary,157);
 assert.equal(saved.counts.administrativePaths,245);assert.equal(saved.counts.newAdministrativePaths,49);
 assert.deepEqual(saved.contractDecision,{id:'DEC-2026-042',status:'approved',on:'2026-10-28'});
 assert.equal(saved.formats.minimumConsumer,'17.0.0');assert.equal(saved.exportCounts.qualifiedCases,73);assert.equal(saved.exportCounts.qualifiedPaths,49);
 assert.equal(saved.exportCounts.syntheticInMemoryArtifacts,146);assert.equal(saved.exportCounts.changedFactsDenied,844);
 for(const flag of completionFlags)assert.equal(saved[flag],false,flag);
});
for(const flag of completionFlags)test('completion cannot grant '+flag,()=>rejects(saved=>{saved[flag]=true;}));
for(const[key,value]of[['workPackage','AP23M2'],['asOf','2026-10-29'],['status','released'],['head','d'.repeat(40)],['m2TechnicallyAccepted',false],['protectedFiles',11539],['mutableSourceBoundary',156],['inheritedReferenceCases',775],['operatingPackagePreserved',false]])test('completion metadata stays exact: '+key,()=>rejects(saved=>{saved[key]=value;}));
test('accepted DEC remains separate from operating authority',()=>{rejects(saved=>{saved.contractDecision.status='proposed';});rejects(saved=>{saved.contractDecision.id='DEC-2026-040';});rejects(saved=>{saved.contractDecision.extra='deploy';});});
test('format inventory cannot downgrade or acquire another format',()=>{for(const key of['manifest','minimumConsumer','administrativeCatalog'])rejects(saved=>{saved.formats[key]='99.0.0';});rejects(saved=>{saved.formats.export='approved';});});
test('every observed runtime statistic is bound to the actual collected evidence',()=>{for(const key of['nativeCounts','independentCounts','qaCounts','hostCounts','exportCounts'])rejects(saved=>{saved[key].invented=1;});rejects(saved=>{saved.nativeCounts.oldNativeReferences++;});rejects(saved=>{saved.hostCounts.actualPackageTests++;});});
test('candidate inventory and manifest bytes cannot change',()=>{rejects(saved=>{saved.counts.administrativePaths++;});rejects(saved=>{saved.candidateManifest.sha256='0'.repeat(64);});rejects(saved=>{saved.actualPackage.byteLength++;});});
test('next gate cannot become automatic release or implementation approval',()=>{rejects(saved=>{saved.nextGate='Deploy now';});rejects(saved=>{saved.nextGate='Human acceptance already granted';});});
test('technical scope completion cannot hide the late release blocker or accept it for the human',()=>{const{saved}=fixture();assert.equal(saved.status,'local-scoped-verification-passed-with-release-blocker');assert.equal(saved.releaseReadiness.ready,false);for(const key of['ready','fixImplemented','humanAcceptanceOfFinding'])rejects(value=>{value.releaseReadiness[key]=true;});rejects(value=>{delete value.releaseReadiness;});});
test('local-link count is a strictly positive safe integer',()=>{for(const value of[0,-1,NaN,Infinity,1.5,'1'])rejects(saved=>{saved.localLinksChecked=value;});});
test('binding inventory cannot be empty or duplicate a path',()=>{rejects(saved=>{saved.bindings=[];});rejects(saved=>{saved.bindings.push({...saved.bindings[0]});});});
test('bound file descriptors have closed fields and exact hash/length types',()=>{for(const edit of[row=>{row.extra=true;},row=>{row.sha256='z'.repeat(64);},row=>{row.sha256='a'.repeat(63);},row=>{row.byteLength=-1;},row=>{row.byteLength=1.1;},row=>{row.byteLength='1';}])rejects(saved=>edit(saved.bindings[0]));});
test('bound paths cannot leave the exact local inventory',()=>{for(const path of['','/tmp/file','../file','src/../file','src//file','a\\b','a\0b'])rejects(saved=>{saved.bindings[0].path=path;});});
test('completion fields cannot be dropped or expanded with implied permissions',()=>{for(const key of['nativeCounts','independentCounts','actualPackage','bindings','localLinksChecked','sourceReleaseApproved'])rejects(saved=>{delete saved[key];});rejects(saved=>{saved.deployable=true;});});
test('pipeline plan includes full existing standard-product collection and fresh export evidence',async()=>{const plan=await buildPlan(),product=plan.find(row=>row[0]==='product-regression'),exported=plan.find(row=>row[0]==='calendar-export');assert.deepEqual(product[2],['scripts/run-standard-tests.mjs','product']);assert.deepEqual(exported[2],['--import','tsx','scripts/check-ap23m3-export.mjs']);assert.equal(plan[0][0],'preservation-before');assert.equal(plan.at(-2)[0],'preservation-after');assert.equal(plan.at(-1)[0],'whitespace');});
test('pipeline discovers every historical and current host lifecycle test',async()=>{const plan=await buildPlan(),host=plan.find(row=>row[0]==='host-lifecycle');const expected=(await readdir(new URL('../../tests/hosts',import.meta.url))).filter(name=>/^ap23[e-m]3-spfx-host\.test\.ts$/u.test(name)).sort().map(name=>'tests/hosts/'+name);assert.deepEqual(host[2].filter(path=>path.endsWith('.test.ts')),expected);assert.ok(expected.includes('tests/hosts/ap23m3-spfx-host.test.ts'));});
test('pipeline discovers new M3 governance tests but does not rerun frozen M2 proof tests',async()=>{
 const plan=await buildPlan(),governance=plan.find(row=>row[0]==='governance');
 assert.ok(governance[2].includes('tests/governance/ap23m3-acceptance-archive.test.mjs'));
 assert.ok(governance[2].includes('tests/governance/ap23m3-completion.test.mjs'));
 for(const path of governance[2].filter(value=>value.endsWith('.test.mjs')))assert.match(path,/^tests\/governance\/ap23m3[^/]+\.test\.mjs$/u);
 for(const path of['tests/governance/ap23m2-preservation.test.mjs','tests/governance/ap23m2-acceptance.test.mjs','tests/governance/ap23m2-completion.test.mjs'])assert.equal(governance[2].includes(path),false,path);
 const archive=plan.find(row=>row[0]==='m2-archive');assert.ok(archive);
 assert.deepEqual(archive[2],['scripts/archive-ap23m2-acceptance.mjs','--check']);
});
test('completion points to the separately supplied browser and export proofs',()=>{assert.equal(completionConfig.browser,'outputs/ap23m3-2026-10-28/browser-verification.json');assert.equal(completionConfig.exported,'outputs/ap23m3-2026-10-28/calendar-export-verification.json');assert.equal(completionConfig.proof,'outputs/ap23m3-2026-10-28/local-completion.json');});
test('clean TAP counts are derived without an assumed test total',()=>{const counts=tapCounts('# tests 123\n# pass 123\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n');assert.equal(counts.tests,123);assert.doesNotThrow(()=>assertPassedCounts(counts,'synthetic'));});
test('browser proof must bind this workpackage and current built index and JavaScript bytes',()=>{
 const rows=[{path:'.work/public-ap23m3/index.html',byteLength:1,sha256:'a'.repeat(64)},{path:'.work/public-ap23m3/assets/app-ABC123.js',byteLength:2,sha256:'b'.repeat(64)}];
 const browser={workPackage:'AP23M3',localOnly:true,dataReleaseId:'M3-synthetic',url:'http://127.0.0.1:8811/fristenrechner/',evidence:structuredClone(rows)},web={dataReleaseId:'M3-synthetic',artifacts:structuredClone(rows)},bundle={releaseId:'M3-synthetic'};
 assert.equal(validateBrowserBinding(browser,web,bundle),true);
 for(const edit of[value=>{value.workPackage='AP23L3';},value=>{value.localOnly=false;},value=>{value.dataReleaseId='older';},value=>{value.url='http://127.0.0.1:8810/fristenrechner/';},value=>{value.evidence[0].sha256='c'.repeat(64);},value=>{value.evidence[1].byteLength++;},value=>{value.evidence.pop();}]){const changed=structuredClone(browser);edit(changed);assert.throws(()=>validateBrowserBinding(changed,web,bundle));}
 assert.throws(()=>validateBrowserBinding(browser,{...web,dataReleaseId:'older'},bundle));assert.throws(()=>validateBrowserBinding(browser,web,{releaseId:'older'}));
});
test('failures, incomplete counters, skips and empty suites fail the pipeline gate',()=>{const clean={tests:1,pass:1,fail:0,cancelled:0,skipped:0,todo:0};for(const key of['fail','cancelled','skipped','todo'])assert.throws(()=>assertPassedCounts({...clean,[key]:1},key));assert.throws(()=>assertPassedCounts({...clean,pass:0},'pass'));assert.throws(()=>assertPassedCounts({...clean,tests:0,pass:0},'empty'));const missing={...clean};delete missing.skipped;assert.throws(()=>assertPassedCounts(missing,'missing'));});

