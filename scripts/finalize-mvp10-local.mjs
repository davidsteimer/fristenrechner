// SPDX-License-Identifier: AGPL-3.0-only
// Seal completed local execution evidence. No build, Git write or external action.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root,prefix,releaseId,hash,encode,bind,readRegular,writeExclusive,requireR10BApproval,verifyExecutionPreservation} from './record-r10b-execution-approval.mjs';
import {verifyArchive as verifyRecovery} from './build-mvp10-recovery.mjs';
import {verifyArchive as verifyAcceptedA2Archive} from '../outputs/r10-b-vorbereitung-2026-10-28/tools/archive-r10-a2-acceptance.mjs';
import {privateMvp10InitialResearchSuites,privateMvp10SupplementalResearchSuites} from './check-mvp10-portability.mjs';
const json=async p=>JSON.parse(await readRegular(root,p));
const descriptor=row=>({path:row.path,sha256:row.sha256,byteLength:row.byteLength});
async function boundBytes(row){assert.equal(typeof row.path,'string');assert.match(row.sha256,/^[a-f0-9]{64}$/u);assert.ok(Number.isSafeInteger(row.byteLength)&&row.byteLength>=0);const raw=await readRegular(root,row.path);assert.equal(raw.length,row.byteLength,row.path);assert.equal(hash(raw),row.sha256,row.path);return raw;}
const exact=async row=>JSON.parse(await boundBytes(row));
const target=prefix+'/local-completion.json';

export function passingTap(text){const result={};for(const key of ['tests','pass','fail','cancelled','skipped','todo']){const matches=[...text.matchAll(new RegExp('^# '+key+' (\\d+)\\r?$','gm'))];assert.equal(matches.length,1,'Missing/ambiguous TAP '+key);result[key]=Number(matches[0][1]);}assert.ok(result.tests>0&&result.tests===result.pass);for(const key of ['fail','cancelled','skipped','todo'])assert.equal(result[key],0);assert.equal(/^not ok|^Bail out!/mu.test(text),false);return result;}
function passingUnittest(text){const matches=[...text.matchAll(/^Ran (\d+) tests? in /gmu)];assert.equal(matches.length,1,'Missing/ambiguous unittest count');const tests=Number(matches[0][1]);assert.ok(tests>0&&/^OK\s*$/mu.test(text));assert.doesNotMatch(text,/\b(?:skipped|expected failure|unexpected success)\b/iu);return tests;}
function falseFlags(record,fields){for(const key of fields)assert.equal(record[key],false,key);}
async function checkedStep(step){assert.equal(step.exitCode,0,step.id);if('signal'in step)assert.equal(step.signal,null,step.id);if('passed'in step)assert.equal(step.passed,true,step.id);const raw=await boundBytes(step.log);if(step.testCounts)assert.deepEqual(passingTap(raw.toString()),step.testCounts);return raw.toString();}
export async function verifyPortableTapStep(step,suites){
 assert.ok(['product','public','governance-node'].includes(step.id));
 assert.ok(step.counts&&typeof step.counts==='object','Complete TAP counters are mandatory for '+step.id);
 assert.ok(Array.isArray(suites)&&suites.length>0);assert.equal(new Set(suites).size,suites.length);
 assert.deepEqual(step.command.slice(1),['--import','tsx','--test','--test-concurrency=2',...suites]);
 const actual=passingTap(await checkedStep(step));assert.deepEqual(actual,step.counts);return actual;
}
export function verifyProjectPackageDelta(before,after,path){
 assert.ok(['package.json','spfx/package.json'].includes(path));
 const normalized=structuredClone(after),testRoutingChanges=[];
 assert.equal(normalized.version,'0.10.0');normalized.version=before.version;
 if(path==='package.json')for(const [key,oldValue,newValue]of[
  ['test:public','node --import tsx --test tests/public-app/*.test.ts','node scripts/run-standard-tests.mjs public'],
  ['test:private:mvp10',undefined,'node scripts/run-standard-tests.mjs private-mvp10'],
  ['test:historical:mvp09:web',undefined,'node scripts/run-standard-tests.mjs historical-mvp09-web']
 ]){assert.equal(before.scripts[key],oldValue);assert.equal(normalized.scripts[key],newValue);testRoutingChanges.push({key,before:oldValue??null,after:newValue});if(oldValue===undefined)delete normalized.scripts[key];else normalized.scripts[key]=oldValue;}
 assert.deepEqual(normalized,before,'Only approved project version and three exact test-routing contracts may differ');
 return{path,version:'0.10.0',testRoutingChanges,legacySourceReviewAliasUnchanged:true,dependenciesUnchanged:true};
}

export async function verifySourceRegisterSelftest(record){
 assert.equal(record.status,'passed');assert.equal(record.proof.id,'source-register-selftest');assert.equal(record.proof.passed,true);
 assert.equal(record.proof.exitCode,0);assert.equal(record.proof.signal,null);const text=await checkedStep(record.proof);
 assert.match(text,/384 Quellen.*266 produktiv.*8 Ereignis.*8 Negativtests/su);
 return{passed:true,log:descriptor(record.proof.log)};
}

export async function verifyArtifactTests(record,sealBinding){
 assert.equal(record.kind,'mvp10-local-artifact-tests');assert.equal(record.status,'passed');assert.equal(record.releaseId,releaseId);
 assert.deepEqual(record.sealRef,sealBinding);await boundBytes(record.sealRef);
 falseFlags(record,['installationAuthorized','uploadAuthorized','publicationAuthorized','operatingApproval']);
 assert.deepEqual(record.steps.map(step=>step.id),['artifacts-python','public-portability-python','public-integrity-unit','public-integrity-actual']);
 const results=[];
 for(const step of record.steps){assert.equal(step.signal,null);const text=await checkedStep(step);
  if(step.testMode==='unittest'){assert.ok(['artifacts-python','public-portability-python'].includes(step.id));const tests=passingUnittest(text);assert.equal(step.tests,tests);results.push({id:step.id,tests});}
  else if(step.testMode==='tap'){assert.equal(step.id,'public-integrity-unit');const counts=passingTap(text);assert.deepEqual(step.counts??step.testCounts,counts);results.push({id:step.id,counts});}
  else{assert.equal(step.testMode,'json');assert.equal(step.id,'public-integrity-actual');const value=JSON.parse(text);assert.equal(value.status,'passed');assert.equal(value.verificationScope,'local-pinned-runtime-git-and-sealed-artifact-integrity');assert.equal(step.jsonScope,value.verificationScope);assert.equal(value.gitHistoryChecked,true);assert.equal(value.gitBlobsVerified,45);assert.equal(value.localArtifactsVerified,3);assert.equal(value.mirrorFilesVerified,45);assert.equal(value.staticWebFilesVerified,12);assert.equal(value.privateRawEvidenceRechecked,false);assert.equal(value.remotePinVerified,false);falseFlags(value,['installationAuthorized','publicationAuthorized','operatingApproval']);results.push({id:step.id,scope:value.verificationScope});}
 }
 return{passed:true,steps:results,sealRef:sealBinding};
}

export async function verifyHistoricalEvidence(record,supplement,routing,sourceBinding){
 assert.equal(record.kind,'mvp10-bounded-historical-source-evidence-reuse');assert.equal(record.status,'passed');
 assert.equal(record.historicalSuitesReexecuted,false);assert.equal(record.originalGovernanceTests,117);
 const autonomous=await verifyAcceptedA2Archive(resolve(root,'outputs/r10-a2-abnahme-2026-10-28'));
 assert.deepEqual(record.archive,autonomous);assert.equal(autonomous.files,1886);assert.equal(autonomous.payloadBytes,532232845);
 assert.equal(autonomous.receiptSha256,'6687d720296645439b66beb6c654e79b776df7d44252751d870838749e49db52');
 const common=await exact(record.a2Common);assert.equal(record.a2Common.sha256,'7a5a93d7e8147d0de9013e645343ef9a346ba3c77ee98085fb1db92b376ebbb1');assert.equal(common.governanceTests.pass,117);assert.equal(common.technicalEvidenceClosure,true);
 const execution=await json(prefix+'/execution-protection.json'),protectedRows=new Map(execution.protectedFiles.map(row=>[row.path,row]));
 assert.deepEqual(record.suites.map(row=>row.path),privateMvp10InitialResearchSuites);assert.equal(record.suites.length,28);
 for(const row of record.suites){assert.deepEqual(row,protectedRows.get(row.path));await boundBytes(row);}
 assert.equal(supplement.kind,'mvp10-historical-research-portability-supplement');assert.equal(supplement.status,'bounded-original-evidence-reuse-recorded');
 assert.deepEqual(supplement.initial28Evidence,sourceBinding);await boundBytes(supplement.initial28Evidence);
 assert.deepEqual(supplement.scope,{initialHistoricalSuites:28,addedHistoricalSuites:7,combinedHistoricalResearchSuites:35});
 for(const field of ['actualSourceOrOriginalArchiveChecksRerun','oldResultsRelabelledCurrent','all35HistoricalSuitesPassedTodayClaimed','assertionsRemoved','testsSilentlySkipped','sourceReleaseApprovalChanged','operatingChanges'])assert.equal(supplement[field],false,field);
 assert.equal(supplement.rootOld28ProofUnchanged,true);assert.equal(supplement.diagnostic.failedIsolatedRun,true);assert.equal(supplement.diagnostic.notAProductRegressionConclusion,true);await boundBytes(supplement.diagnostic);
 const a2Guard=await exact(supplement.guard);assert.equal(supplement.guard.sha256,'1c07c86cb49f1bda4b68da069da2b908e2adefbe1bca71b8db914bd0b5f628ec');
 const a2Rows=new Map(a2Guard.files.map(row=>[row.path,row]));assert.equal(a2Rows.size,17637);
 assert.deepEqual(supplement.rows.map(row=>row.path),privateMvp10SupplementalResearchSuites);
 for(const row of supplement.rows){assert.equal(row.classification,'private-original-evidence-or-archive-audit');assert.equal(row.originalBytesPreserved,true);falseFlags(row,['currentHistoricalAuditRerun','currentPassClaim','newHumanAcceptance','productChange']);
  for(const item of [row.originalScript,...row.chainScripts,row.historicalQa.completion,row.historicalQa.receipt]){assert.deepEqual(item,a2Rows.get(item.path),'Unbound historical item '+item.path);await boundBytes(item);}
  const completion=await exact(row.historicalQa.completion),parts=row.historicalQa.counterPointer.split('/').slice(1);let counter=completion;
  for(const key of parts){assert.ok(Object.hasOwn(counter,key));counter=counter[key];}assert.deepEqual(counter,row.historicalQa.originalCounter);
  assert.equal(row.historicalQa.countersBelongToHistoricalWorkPackage,true);assert.equal(row.historicalQa.notAnIndividualCurrentTestCount,true);
 }
 assert.equal(routing.kind,'mvp10-separate-historical-routing-contract');assert.equal(routing.status,'passed');
 falseFlags(routing,['currentMvp10RoutingPassedClaimed','privateSourceAuditRerun','assertionsRemoved','oldAssertionsModified','installationPerformed','uploaded','published']);
 const priorInventory=await exact(routing.inputInventory);assert.equal(routing.inputInventory.path,'outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/input-inventory.json');assert.equal(routing.inputInventory.sha256,'378045bdd5bef301828572110996fdcf05ef1450f466d8947a810adf51ccfff6');
 assert.deepEqual(routing.inputs.map(row=>row.path),['scripts/run-standard-tests.mjs','tests/governance/mvp09-test-scopes.test.mjs']);
 for(const row of routing.inputs){const original=priorInventory.files.find(item=>item.path===row.path);assert.deepEqual(descriptor(row),descriptor(original));assert.equal(row.readFrom,'02209d0:'+row.path);const bytes=execFileSync('git',['cat-file','blob','02209d0:'+row.path],{cwd:root,maxBuffer:1024*1024});assert.equal(hash(bytes),row.sha256);assert.equal(bytes.length,row.byteLength);}
 const prior=await exact(routing.priorGovernance);assert.equal(prior.passed,true);assert.equal(routing.priorGovernance.originalResultsNotRelabelledCurrent,true);
 const priorLog=await boundBytes(routing.priorGovernance.originalLog);assert.deepEqual(passingTap(priorLog.toString()),routing.priorGovernance.originalCounts);
 const historical=routing.currentHistoricalRoutingExecution;assert.equal(historical.exitCode,0);assert.equal(historical.onlyTwoOriginalNonprivateFilesSupplied,true);assert.equal(historical.inputsUnchanged,true);
 assert.deepEqual(passingTap((await boundBytes(historical.log)).toString()),historical.counts);assert.equal(historical.counts.tests,3);
 return{passed:true,autonomousA2:autonomous,historicalInitialScripts:28,historicalSupplementScripts:7,historicalRoutingTests:3,oldProductGuardRerun:false,original117TestsReexecuted:false};
}

export async function verifyBrowserReport(record,sealBinding,seal){
 assert.equal(record.kind,'mvp10-local-real-browser-verification');assert.equal(record.status,'passed');assert.equal(record.releaseId,releaseId);
 assert.deepEqual(record.sealRef,sealBinding);await boundBytes(record.sealRef);
 falseFlags(record,['realM365OrDeviceTestsPerformed','outlookImportPerformed','installationPerformed','uploadPerformed','publicationPerformed','operatingApproval']);
 const modes=['de-desktop-100','fr-desktop-100','de-small-390','fr-small-390','de-native-300','fr-native-300','fr-u1-outside-coverage'];
 assert.deepEqual(record.checkedModes.slice().sort(),modes.slice().sort());assert.equal(new Set(record.checkedModes).size,7);
 const observations=await exact(record.observationsRef);assert.equal(record.observationsRef.path,prefix+'/browser-evidence/observations.json');assert.equal(observations.kind,'mvp10-local-real-browser-observations');assert.equal(observations.status,'passed-observations-awaiting-final-byte-equivalence');assert.ok(observations.checks.length>=5);assert.ok(observations.checks.every(row=>row.status==='passed'));
 const equality=record.actualWebEquivalence;assert.equal(equality.allBytesEqual,true);assert.equal(equality.testedRoot,observations.servedDirectory);assert.match(equality.testedRoot,/^\.work\/mvp10-web-tests-[A-Za-z0-9]+\/\.work\/public-app$/u);
 assert.equal(equality.files.length,12);assert.equal(new Set(equality.files.map(row=>row.relativePath)).size,12);
 const sealed=new Map(seal.webFiles.map(row=>[row.path,row])),observed=new Map(observations.webFiles.map(row=>[row.path,row]));
 assert.deepEqual(equality.files.map(row=>row.relativePath).sort(),[...sealed.keys()].sort());
 for(const row of equality.files){assert.ok(row.relativePath&&!row.relativePath.startsWith('/')&&!row.relativePath.includes('\\')&&row.relativePath.split('/').every(part=>part&&part!=='.'&&part!=='..'));
  assert.equal(row.tested.path,equality.testedRoot+'/'+row.relativePath);assert.equal(row.sealed.path,prefix+'/web-build/'+row.relativePath);
  assert.deepEqual(row.tested,observed.get(row.tested.path));assert.deepEqual(descriptor(row.sealed),{...sealed.get(row.relativePath),path:row.sealed.path});
  assert.deepEqual(await boundBytes(row.tested),await boundBytes(row.sealed),'Browser/sealed web bytes differ: '+row.relativePath);
 }
 assert.equal(record.screenshots.length,new Set(record.screenshots.map(row=>row.path)).size);assert.ok(record.screenshots.length>=10);
 const originalScreenshots=new Map([...observations.screenshots,...observations.privateScreenshots].map(row=>[row.path,row]));
 for(const row of record.screenshots){await boundBytes(row);assert.ok(['de','fr'].includes(row.language));assert.ok(typeof row.browser==='string'&&row.browser.trim());
  assert.ok(Number.isFinite(row.zoomPercent)&&row.zoomPercent>0||Number.isFinite(row.viewportCssWidth)&&row.viewportCssWidth>0,'Missing actual zoom or viewport');
  if(row.privateLocalOnly){assert.ok(row.path.startsWith('.work/mvp10-browser-private-20261028/'));}
  else{assert.equal(row.privateLocalOnly,false);assert.ok(row.path.startsWith(prefix+'/browser-evidence/'));}
  if(originalScreenshots.has(row.path)){assert.deepEqual(descriptor(row),originalScreenshots.get(row.path));originalScreenshots.delete(row.path);}
 }
 assert.equal(originalScreenshots.size,0,'Original browser screenshot missing from final binding');
 return{passed:true,webFilesCompared:12,screenshotsVerified:record.screenshots.length,checkedModes:modes,realM365OrDeviceTestsPerformed:false};
}
export async function verifyRoundtrip(record){
 assert.equal(record.kind,'mvp10-actual-four-package-recovery-roundtrip');assert.equal(record.status,'passed');
 assert.deepEqual(record.functionalSequence,['MVP09 0.9.0.0 / Format9','MVP10 0.10.0.0 / Format17','Recovery 0.10.0.1 / MVP09 / own Format9 cache','MVP10 0.10.0.0 / own Format17 cache']);
 falseFlags(record,['installationAuthorized','actualDeploymentPerformed','publicationAuthorized','browserDataResetPerformed']);
 assert.equal(record.sameSyntheticV5AndIndexedDB,true);assert.equal(record.newCantonPreferenceScopes,20);
 assert.ok(Array.isArray(record.inputs)&&record.inputs.length>3);assert.ok(Array.isArray(record.archivedFiles)&&record.archivedFiles.length>3);
 const inputs=new Map(record.inputs.map(row=>[row.path,row])),archives=new Map(record.archivedFiles.map(row=>[row.path,row]));
 assert.equal(inputs.size,record.inputs.length);assert.equal(archives.size,record.archivedFiles.length);
 for(const row of record.inputs)await boundBytes(row);for(const row of record.archivedFiles)await boundBytes(row);
 const packagePaths={normalPackage:prefix+'/fristenrechner-schweiz-0.10.0.0.sppkg',recoveryPackage:prefix+'/fristenrechner-schweiz-recovery-0.10.0.1.sppkg',originalMvp09Package:'outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg'};
 for(const [key,path]of Object.entries(packagePaths)){const actual=await bind(path);assert.deepEqual(record[key],actual);assert.deepEqual(inputs.get(path),actual);assert.deepEqual(archives.get(prefix+'/recovery-roundtrip/inputs/'+path),{...actual,path:prefix+'/recovery-roundtrip/inputs/'+path});}
 assert.equal(record.originalMvp09Package.sha256,'7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331');
 assert.deepEqual(record.normalPackage,(await json(prefix+'/product-build.json')).package);
 const old=await json('data/releases/2026-10-18-mvp-09-approved.1/administrative-procedures/ch-cantonal-administrative-procedures.json');
 const current=await json('data/releases/'+releaseId+'/administrative-procedures/ch-cantonal-administrative-procedures.json');
 const oldIds=new Set(old.paths.map(row=>row.pathId)),cantons=new Set(current.paths.filter(row=>!oldIds.has(row.pathId)&&row.duration.kind==='statutoryDays').map(row=>current.laws.find(law=>law.lawId===row.lawId).canton));assert.equal(cantons.size,20);
 const expected=['package:identity','package:activation',...[...cantons].map(c=>'defaults:seed-new-'+c),'defaults:seed-current-ordered-VS',...['LU','ZG','AR'].map(c=>'defaults:seed-known-'+c),...['corrupt','future','reset','legacy'].map(s=>'defaults:seed-'+s),...[1,2,3,4].map(v=>'defaults:migration-v'+v),'defaults:save-reset','cache:ap5-separation','cache:provider-pin','cache:format17-refused','cache:bytes-revalidation','equivalence:federal','equivalence:administrative'].sort();
 assert.equal(expected.length,41);assert.equal(new Set(expected).size,41);
 const fixedNames={
  'package:identity':'actual recovery has package 0.10.0.1 and unchanged MVP09 app, old pin, identities and hosts',
  'package:activation':'actual recovery loads all 42 Format9 files, only 25 old admin paths and retains own cache',
  'defaults:save-reset':'intentional compatible save and targeted reset create a marker without reviving V1',
  'cache:ap5-separation':'AP5 and Format9 keep separate validated own caches and refuse a foreign mirror',
  'cache:provider-pin':'GitHub pin and provider type are part of cache identity, not the display label',
  'cache:format17-refused':'Recovery rejects actual Format17 and its cache instead of substituting Format9',
  'cache:bytes-revalidation':'own cache is fully revalidated from bytes and not trusted parsed metadata',
  'equivalence:federal':'recovery and actual MVP09 retain identical Bundesprofile results and traces',
  'equivalence:administrative':'all 25 old administrative UI paths retain their exact MVP09 result and provenance'
 };
 const expectedName=id=>id.startsWith('defaults:seed-')?'four actual packages preserves '+id.slice('defaults:seed-'.length)+' V5 without invented facts':/^defaults:migration-v[1-4]$/u.test(id)?'V'+id.at(-1)+' migration is allowed only when V5 is genuinely absent':fixedNames[id];
 const scenarios=record.testScenarios;assert.equal(scenarios.mode,'roundtrip');assert.equal(scenarios.scenarioProcessConcurrency,1);
 assert.deepEqual([...scenarios.expectedScenarioIds].sort(),expected);assert.deepEqual([...scenarios.coveredScenarioIds].sort(),expected);
 assert.deepEqual({scenarios:scenarios.scenarios,passed:scenarios.passed,skipped:scenarios.skipped,pending:scenarios.pending},{scenarios:41,passed:41,skipped:0,pending:0});
 assert.equal(record.steps.length,43);
 const covered=[],matrices=[];let overrides=0,fourPhaseCases=0;
 for(const step of record.steps){assert.equal(step.exitCode,0);const raw=await readRegular(root,step.log);assert.equal(hash(raw),step.sha256);const text=raw.toString();
  if(step.id.startsWith('scenario-matrix-')){const matrix=JSON.parse(text);matrices.push({id:step.id,value:matrix});assert.equal(matrix.kind,'mvp10-exhaustive-recovery-scenarios');assert.equal(matrix.mode,'roundtrip');assert.equal(matrix.expectedCount,41);assert.deepEqual(matrix.scenarios.map(row=>row.id).sort(),expected);for(const row of matrix.scenarios){assert.equal(row.name,expectedName(row.id));assert.equal(row.file,'spfx/recovery-mvp10/recovery-'+row.id.split(':')[0]+'.test.cjs');}continue;}
  assert.ok(expected.includes(step.scenarioId));covered.push(step.scenarioId);
  const name=expectedName(step.scenarioId);assert.ok(name);assert.equal(step.scenarioName,name);
  assert.deepEqual(text.split(/\r?\n/u).filter(line=>line.startsWith('# Subtest: ')),['# Subtest: '+name]);
  assert.deepEqual(text.split(/\r?\n/u).filter(line=>/^ok \d+ - /u.test(line)),['ok 1 - '+name]);
  assert.equal(passingTap(text).tests,1);assert.equal(step.tests,1);
  const scoped=step.scenarioId.startsWith('defaults:seed-')||step.scenarioId==='cache:format17-refused',budget=scoped?90000:60000;
  assert.deepEqual(step.args,['--test','--test-concurrency=1','--test-timeout='+budget,'recovery-mvp10/recovery-'+step.scenarioId.split(':')[0]+'.test.cjs']);
  assert.equal(step.scenarioTimeoutMs,budget);assert.equal(step.budgetPolicy,scoped?'measured-four-phase-only':'unchanged-default-60s');
  if(scoped)overrides++;
  if(step.scenarioId.startsWith('defaults:seed-')){const rows=text.split(/\r?\n/u).filter(line=>line.startsWith('# {"case":')).map(line=>JSON.parse(line.slice(2)));assert.equal(rows.length,1);assert.deepEqual(rows[0],{case:step.scenarioId.slice('defaults:seed-'.length),sequence:['MVP09/9','MVP10/17','Recovery MVP09/own9cache','MVP10/own17cache'],sameV5:true,sameIndexedDB:true,protectedRawUnchanged:true,realM365:false});fourPhaseCases++;}
 }
 assert.deepEqual(covered.sort(),expected);assert.equal(overrides,29);assert.equal(fourPhaseCases,28);assert.deepEqual(matrices.map(row=>row.id),['scenario-matrix-before','scenario-matrix-after']);assert.deepEqual(matrices[0].value,matrices[1].value);
 const timing=await bind(prefix+'/test-diagnostics/roundtrip-zh-timing-r1/diagnostic.json');assert.equal(timing.sha256,'5805e8467637dd6591629cbaa644463f19cd967105d84a56e74221352986304b');
 const diagnosis=await exact(timing);assert.equal(diagnosis.diagnosticOnly,true);assert.equal(diagnosis.gatePass,false);assert.equal(diagnosis.exitCode,0);assert.equal(diagnosis.unchanged,true);assert.deepEqual(diagnosis.before,diagnosis.after);for(const row of diagnosis.before)await boundBytes(row);await boundBytes(diagnosis.rawLog);
 return{passed:true,scenarios:41,fourCompletePhaseSeedCases:28,rawScenarioLogsRechecked:41,defaultTimeoutMs:60000,exactScopedOverrides:{count:29,timeoutMs:90000},timingDiagnostic:timing,realM365Performed:false};
}

export async function verifyPythonContexts(portability,execution){
 assert.deepEqual(execution.steps.map(row=>row.id),['governance-node','governance-schema','governance-python-current','governance-python-historical']);
 const record=await exact(execution.pythonContexts),partition=record.partition;
 assert.equal(record.kind,'mvp10-disjoint-python-index-test-contexts');assert.equal(record.passed,true);
 for(const key of ['testsSkipped','assertionsRemoved','newLegalSourceReviewClaimed'])assert.equal(record[key],false,key);
 for(const key of ['currentValidatorUnchanged','oldTestsAndIndicesUnchanged'])assert.equal(record[key],true,key);
 assert.deepEqual({all:partition.all.length,current:partition.current.length,historical:partition.historical.length},{all:45,current:32,historical:13});
 for(const rows of Object.values(partition))assert.equal(new Set(rows).size,rows.length,'Duplicate unittest ID');
 assert.deepEqual([...partition.current,...partition.historical].sort(),partition.all);
 const old=id=>/^test_source_reviews_mvp0[56]\./u.test(id);
 assert.ok(partition.historical.every(old));assert.ok(partition.current.every(id=>!old(id)));
 assert.equal(partition.historical.filter(id=>id.startsWith('test_source_reviews_mvp05.')).length,7);
 assert.equal(partition.historical.filter(id=>id.startsWith('test_source_reviews_mvp06.')).length,6);
 assert.deepEqual(record.steps,execution.steps.slice(2));
 for(const [step,ids]of [[record.steps[0],partition.current],[record.steps[1],partition.historical]]){
  assert.deepEqual(step.expectedMethodIds,ids);assert.deepEqual(step.command.slice(1),['-B','-m','unittest','-v',...ids]);
  const text=await checkedStep(step);assert.equal(passingUnittest(text),ids.length);assert.equal(step.tests,ids.length);
  for(const id of ids)assert.ok(text.includes('('+id+') ... ok'),'Missing real verbose unittest result '+id);
 }
 const source=await exact(portability.inputInventory),historical=record.historicalContext;
 assert.match(execution.stage,/^\.work\/mvp10-standard-no-private-[A-Za-z0-9]+$/u);
 assert.match(historical.stage,/^\.work\/mvp10-python-historical-context-[A-Za-z0-9]+$/u);
 assert.equal(historical.inputCount,source.files.length);assert.equal(historical.inputFiles.length,source.files.length);
 const validator='tests/governance/validate_source_reviews.py',oldSha='40d8bdb6f26a7fe710a4430e2ce45e7a709896348250c649c18fdeafa392eedd';
 assert.equal(historical.onlyReplacedPath,validator);assert.equal(historical.replacement.sha256,oldSha);assert.equal(historical.replacement.byteLength,26984);
 for(const key of ['derivedFromSameNonprivateInputs','allOtherInputBytesUnchanged','noGitRequired'])assert.equal(historical[key],true,key);
 const changed=[];
 for(let i=0;i<source.files.length;i++){
  const input=source.files[i],derived=historical.inputFiles[i];assert.equal(input.path,derived.path);
  const expected=input.path===validator?{...input,sha256:oldSha,byteLength:26984}:input;assert.deepEqual(derived,expected);
  if(input.sha256!==derived.sha256||input.byteLength!==derived.byteLength)changed.push(input.path);
  await boundBytes({...input,path:execution.stage+'/'+input.path});
  await boundBytes({...derived,path:execution.stage+'/'+historical.stage+'/'+derived.path});
 }
 assert.deepEqual(changed,[validator]);
 const fixture=await boundBytes({...historical.replacement,path:execution.stage+'/'+historical.replacement.path});
 assert.equal(hash(fixture),oldSha);
 const pub=historical.publicBinding;assert.equal(pub.path,'outputs/publication-mvp09-2026-10-19/publication-package.json');
 assert.equal(pub.sha256,'be8c283620e72df15c6803bedcde6d2c5ff83d5d2428631fc21130778ed46a97');assert.equal(pub.byteLength,117422);assert.equal(pub.pointer,'/files/508');
 const publicRecord=JSON.parse(await boundBytes({...pub,path:execution.stage+'/'+pub.path}));
 assert.deepEqual(descriptor(publicRecord.files[508]),{path:validator,sha256:oldSha,byteLength:26984});
 return{passed:true,binding:execution.pythonContexts,methodCounts:{all:45,current:32,historical:13},derivedInputsRechecked:source.files.length,onlyReplacedPath:validator,legacyUnversionedNpmDiscoveryPassedClaimed:false};
}

async function closure(){
 const authority=await requireR10BApproval(),pin=await json(prefix+'/local-data-pin.json');
 assert.equal(pin.commit,'01bbd96a296b0fc4d64cd554acc8cb122c3017a3');
 const names=['data-verification.json','source-approval.json','source-governance-adoption.json','source-version-bridges.json','administrative-reference-suite.json','product-build.json','artifact-verification.json','web-browser-tests.json','additional-local-tests.json','historical-source-evidence.json','source-register-selftest.json','portability/historical-research-supplement.json','portability/historical-routing.json','artifact-tests.json','local-browser-verification.json','recovery-0.10.0.1/artifact-verification.json','recovery-roundtrip/verification.json'];
 const reports=Object.fromEntries(await Promise.all(names.map(async name=>[name,{binding:await bind(prefix+'/'+name),value:await json(prefix+'/'+name)}])));
 for(const name of ['product-build.json','artifact-verification.json','web-browser-tests.json','additional-local-tests.json','historical-source-evidence.json','artifact-tests.json','local-browser-verification.json','recovery-roundtrip/verification.json'])assert.equal(reports[name].value.status,'passed',name);
 assert.equal(reports['data-verification.json'].value.passed,true);
 assert.equal(reports['recovery-0.10.0.1/artifact-verification.json'].value.passed,true);
 assert.equal(reports['product-build.json'].value.packageVersion,'0.10.0.0');
 assert.equal(reports['product-build.json'].value.localDataPin.commit,pin.commit);
 assert.equal(reports['artifact-verification.json'].value.manifestSha256,pin.manifestSha256);
 assert.equal(reports['historical-source-evidence.json'].value.historicalSuitesReexecuted,false);
 const sourceRegisterSelftest=await verifySourceRegisterSelftest(reports['source-register-selftest.json'].value);
 const artifactTests=await verifyArtifactTests(reports['artifact-tests.json'].value,reports['artifact-verification.json'].binding);
 const historicalReuse=await verifyHistoricalEvidence(reports['historical-source-evidence.json'].value,
  reports['portability/historical-research-supplement.json'].value,reports['portability/historical-routing.json'].value,
  reports['historical-source-evidence.json'].binding);
 const browserVerification=await verifyBrowserReport(reports['local-browser-verification.json'].value,
  reports['artifact-verification.json'].binding,reports['artifact-verification.json'].value);
 const portabilityPath=process.env.FRISTENRECHNER_MVP10_PORTABILITY_REPORT??prefix+'/portability/attempt-01/report.json';
 assert.match(portabilityPath,new RegExp('^'+prefix+'/portability/attempt-[0-9]{2}/report\\.json$'));
 const portability=await json(portabilityPath);assert.equal(portability.passed,true);assert.equal(portability.noTestsSkipped,true);
 const portableInputs=await exact(portability.inputInventory),expectedScopes=['product','governance','public'];
 assert.deepEqual(portability.scope,[...expectedScopes,'source-schema','python-governance']);assert.equal(portability.executions.length,3);
 assert.equal(portability.inputCount,portableInputs.files.length);assert.deepEqual(portability.suites,Object.fromEntries(Object.entries(portableInputs.suites).map(([key,rows])=>[key,rows.length])));
 for(const flag of ['privateRawSourceOriginalsPresent','originalAcceptanceArchivesPresent','executionAuthorityPresent','gitPresent','initialWorkTreeIncluded'])assert.equal(portability[flag],false);
 let pythonContexts;
 for(const [i,row]of portability.executions.entries()){
  const execution=await exact({path:row.path,sha256:row.sha256,byteLength:row.byteLength}),scope=expectedScopes[i];
  assert.equal(execution.scope,scope);assert.equal(execution.stage,portableInputs.stage);assert.equal(execution.inputCount,portableInputs.files.length);assert.equal(execution.inputsVerifiedBeforeAndAfter,true);
  assert.deepEqual(execution.steps.map(step=>step.id),scope==='governance'?['governance-node','governance-schema','governance-python-current','governance-python-historical']:[scope]);assert.equal(execution.passed,true);
  for(const step of execution.steps){
   if(['product','public','governance-node'].includes(step.id)){await verifyPortableTapStep(step,portableInputs.suites[scope]);continue;}
   const text=await checkedStep(step);
   if(step.id.startsWith('governance-python-'))assert.equal(passingUnittest(text),step.tests);
   else if(step.id==='governance-schema'){assert.deepEqual(step.command.slice(1),['-B','tests/governance/validate_source_reviews.py','--self-test']);assert.match(text,/384 Quellen.*266 produktiv.*8 Ereignis.*8 Negativtests/su);}
   else assert.fail('Unexpected portability step '+step.id);
  }
  if(execution.scope==='governance')pythonContexts=await verifyPythonContexts(portability,execution);
 }
 assert.equal(pythonContexts?.passed,true,'Versioned Python governance proof required');
 for(const name of ['data-verification.json','additional-local-tests.json','web-browser-tests.json'])for(const step of reports[name].value.steps)await checkedStep(step);
 const recovery=await verifyRecovery();assert.equal(recovery.passed,true);
 const recoveryRoundtrip=await verifyRoundtrip(reports['recovery-roundtrip/verification.json'].value);
 const artifacts=[...reports['artifact-verification.json'].value.artifacts,await bind(prefix+'/fristenrechner-schweiz-recovery-0.10.0.1.sppkg')];
 assert.equal(artifacts.length,4);for(const row of artifacts)assert.deepEqual(await bind(row.path),row);
 const locks=[];for(const path of ['package-lock.json','spfx/package-lock.json']){const before=await json(prefix+'/before-inputs/'+path),after=await json(path);assert.equal(after.version,'0.10.0');assert.equal(after.packages[''].version,'0.10.0');after.version=before.version;after.packages[''].version=before.packages[''].version;assert.deepEqual(after,before);locks.push(await bind(path));}
 const packageDeltas=[];for(const path of ['package.json','spfx/package.json'])packageDeltas.push(verifyProjectPackageDelta(await json(prefix+'/before-inputs/'+path),await json(path),path));
 const preservation=await verifyExecutionPreservation();
return{implementation:await Promise.all(['scripts/finalize-mvp10-local.mjs','scripts/record-r10b-execution-approval.mjs','scripts/check-mvp10-historical-source-tests.mjs','scripts/check-mvp10-portability.mjs','scripts/run-standard-tests.mjs','scripts/verify-mvp10-public-integrity.mjs','scripts/prepare_mvp10_artifacts.py'].map(bind)),kind:'R10-B-local-completion',status:'passed',releaseId,authority:{path:authority.path,sha256:authority.sha256},localDataPin:pin,reports:Object.values(reports).map(r=>r.binding),portability:await bind(portabilityPath),artifacts,lockVersionsOnly:true,locks,packageDeltas,recovery,recoveryRoundtrip,preservation,sourceRegisterSelftest,artifactTests,historicalReuse,browserVerification,pythonContexts,knownTechnicalLimits:[{id:'R10B-CLI-H01',status:'open-explicitly-not-a-product-rule-failure',legacyNpmAlias:'test:source-reviews',unversionedPythonDiscoveryNotClaimedPassed:true,correctExplicitCommand:'node scripts/check-mvp10-historical-source-tests.mjs --python-governance',legacySourceReviewScriptUnchanged:true,approvedTestRoutingChanges:3,reason:'The project version and three exact public/private/historical test-routing contracts are bound separately. The unchanged legacy Python discovery still mixes historical index expectations with the current walker. All45 methods are actually tested in their32/13 versioned contexts.'}],closingDocument:await bind('docs/betrieb/lokaler-releaseabschluss-mvp10.md'),livingEntryDocuments:await Promise.all(['README.md','docs/README.md','docs/architektur/README.md','docs/entscheidungen/README.md','docs/fachrecht/README.md','docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/gebuendelter-release-nach-ap23m3.md','docs/planung/schweizausbau-nach-mvp09.md'].map(bind)),applicationVersion:'0.10.0',packageVersion:'0.10.0.0',recoveryPackageVersion:'0.10.0.1',recoveryFunctionalBaseline:'MVP 0.9 / Format 9',localExecutionCompleted:true,installationPerformed:false,uploadPerformed:false,pushPerformed:false,additionalCommitPerformed:false,realM365OrDeviceTestsPerformed:false,outlookImportPerformed:false,hostingHeaderCacheRetested:false,remoteDataPinVerified:false,operatingApproval:false,nextGate:'R10-C concrete E/Q installation proposal and separate human authorization'};
}
export async function finalize({write=false}={}){const record=await closure();if(write){assert.equal(await readRegular(root,target,true),undefined,'Completed local closure already exists');record.completedAt=new Date().toISOString();await writeExclusive(root,target,encode(record));}else{const old=await json(target),{completedAt,...rest}=old;assert.ok(completedAt);assert.deepEqual(rest,record);}return{status:'passed',binding:await bind(target),artifacts:record.artifacts,nextGate:record.nextGate};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);assert.ok(['--write','--verify'].includes(process.argv[2]));console.log(JSON.stringify(await finalize({write:process.argv[2]==='--write'}),null,2));}
