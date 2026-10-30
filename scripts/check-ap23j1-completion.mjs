// SPDX-License-Identifier: AGPL-3.0-only
// Local research binding only. No product build, Git mutation, source promotion or external write.
import assert from 'node:assert/strict';
import {access,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,researchConfig,sha256} from './prepare-ap23j1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output=researchConfig.output;
const read=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await read(path));
const run=(file,args)=>execFileSync(file,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,
  env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
const finalPath=output+'/local-completion.json';
assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'Use --write or --check');
if(process.argv[2]==='--check'){
  const report=await json(finalPath);assert.equal(report.workPackage,'AP23J1');assert.equal(report.status,'research-completed-awaiting-human-acceptance');
  for(const flag of['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation',
    'productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated',
    'sourcePushPerformed','githubStatusPublished','operatingChanges'])assert.equal(report[flag],false,flag);
  assert.equal(new Set(report.bindings.map(b=>b.path)).size,report.bindings.length);
  for(const b of report.bindings){const raw=await exact(root,b.path,b.sha256);assert.equal(raw.length,b.byteLength);}
  const preserved=JSON.parse(run(process.execPath,['scripts/check-ap23j1-preservation.mjs']));assert.equal(preserved.protectedFilesVerified,4214);
  console.log(JSON.stringify({workPackage:'AP23J1',status:'bound-research-reverified',bindings:report.bindings.length,
    manualLegalReferences:report.manualLegalReferences,researchGroups:report.researchGroups,protectedFiles:4214,
    professionalAcceptance:false,sourceReleaseApproved:false,operatingChanges:false},null,2));
  process.exit(0);
}
const fixtureBuilt=JSON.parse(run(process.execPath,['scripts/build-ap23j1-reference-fixture.mjs']));
const references=JSON.parse(run(process.execPath,['scripts/check-ap23j1-references.mjs','--write']));
const independent=JSON.parse(run(resolve(root,'.venv/bin/python'),['scripts/check_ap23j1_independent.py','--write']));
run(process.execPath,['scripts/check-ap23j1-evidence.mjs','--write']);const evidence=await json(output+'/evidence-verification.json');
const preservation=JSON.parse(run(process.execPath,['scripts/check-ap23j1-preservation.mjs','--write']));
const suite=await json('docs/fachrecht/ap23j1/referenzfaelle.json');
assert.equal(references.status,'passedResearchComparison');assert.deepEqual(references.discrepancies,[]);
assert.equal(independent.status,'passedIndependentResearchComparison');assert.deepEqual(independent.discrepancies,[]);
assert.equal(references.paths,36);assert.equal(fixtureBuilt.groups,36);assert.equal(references.referenceCases,673);
assert.equal(independent.referenceComparisons,673);assert.equal(independent.calendarEndEligibilityComparisons,2190);
assert.equal(references.calendarProbes,13);assert.ok(references.calendarComparisons.every(c=>c.namedHolidayDateSetsEqual&&c.endEligibilityDifferences===0));
assert.deepEqual(fixtureBuilt.groupsByCanton,{FR:11,GE:7,JU:18});
const manual=suite.cases.filter(c=>c.provenance==='canton-analyst-static-reference'),manualCount=outcome=>manual.filter(c=>c.expected.outcome===outcome).length;
assert.equal(manual.length,78);assert.deepEqual({dated:manualCount('datedResearchValue'),qualification:manualCount('qualificationBoundaryProposed'),
  collision:manualCount('unresolvedBoundaryProposed'),window:manualCount('researchWindowBoundary')},{dated:57,qualification:14,collision:3,window:4});
assert.equal(evidence.status,'captured-source-bytes-verified');assert.equal(evidence.explicitSourceBindings,48);
assert.equal(preservation.protectedFilesVerified,4214);assert.equal(preservation.acceptedI3Archive.files,822);
assert.equal(preservation.livingStatus.length,7);assert.ok(preservation.livingStatus.every(row=>row.changed));
assert.deepEqual(preservation.researchTestAdditions,[...researchConfig.allowedNewResearchTests].sort());
// Cross-check the real official metadata rather than inheriting old labels.
const cpja=(await json(output+'/sources/fr/cpja-api-1501.json')).text_of_law;
const lj=(await json(output+'/sources/fr/lj-api-1301.json')).text_of_law;
assert.equal(cpja.current_version.id,8637);assert.equal(lj.current_version.id,7926);assert.deepEqual(cpja.future_versions,[]);assert.deepEqual(lj.future_versions,[]);
const articleComparison=await json(output+'/sources/fr/relevant-article-comparison.json');assert.equal(articleComparison.articles.length,27);
assert.ok(articleComparison.articles.every(a=>a.normalizedEqual&&a.previousNormalizedSha256===a.currentNormalizedSha256));
const allSources=new Set(evidence.sources.map(s=>s.id));
function checkSourceRefs(value){
  if(!value||typeof value!=='object')return;
  for(const[key,v]of Object.entries(value)){
    if(key==='sourceId')assert.ok(allSources.has(v),'Unknown source binding '+v);
    if(key==='sourceIds'||key==='commonSourceIds')for(const id of v)assert.ok(allSources.has(id),'Unknown source binding '+id);
    checkSourceRefs(v);
  }
}
for(const c of['fr','ge','ju'])checkSourceRefs(await json('docs/fachrecht/ap23j1/befund-'+c+'.json'));
const testCases=researchConfig.allowedNewResearchTests;
const tests=run(process.execPath,['--test',...testCases]);
const counts=Object.fromEntries([...tests.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.deepEqual(counts,{tests:104,pass:104,fail:0,cancelled:0,skipped:0,todo:0});
await writeFile(resolve(root,output+'/research-checker-tests.txt'),tests);run('git',['diff','--check']);
const newDocuments=['docs/fachrecht/start-ap23j1.md','docs/fachrecht/verwaltungsverfahren-ap23j1.md',
  'docs/fachrecht/quellenpruefung-ap23j1.md','docs/fachrecht/referenzfaelle-ap23j1.md','docs/fachrecht/ap23j1/pruefnotiz.md',
  ...['fr','ge','ju'].map(c=>'docs/fachrecht/ap23j1/recherche-'+c+'.md')];
let localLinksChecked=0;
for(const path of[...newDocuments,...researchConfig.living]){
  const text=(await read(path)).toString();
  if(newDocuments.includes(path))assert.equal(/[;ß]/u.test(text),false,'Swiss project prose '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    let target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];if(/^(?:https?:|mailto:|codex:|plugin:|#)/i.test(target))continue;
    target=decodeURIComponent(target.split('#')[0]);if(!target)continue;
    const absolute=resolve(root,dirname(path),target);
    if(absolute!==resolve(root,finalPath))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});
    localLinksChecked++;
  }
}
const scripts=['scripts/prepare-ap23j1.mjs','scripts/check-ap23j1-preservation.mjs','scripts/build-ap23j1-reference-fixture.mjs',
  'scripts/check-ap23j1-references.mjs','scripts/check_ap23j1_independent.py','scripts/check-ap23j1-evidence.mjs','scripts/check-ap23j1-completion.mjs'];
const files=[...newDocuments,...researchConfig.living,...['fr','ge','ju'].map(c=>'docs/fachrecht/ap23j1/befund-'+c+'.json'),
  'docs/fachrecht/ap23j1/referenzfaelle.json',...scripts,...testCases,
  ...['protected-inputs.json','preservation-verification.json','reference-verification.json','reference-independent-verification.json',
    'evidence-verification.json','research-checker-tests.txt'].map(p=>output+'/'+p),...evidence.fileInventory.map(b=>b.path)];
assert.equal(new Set(files).size,files.length,'Duplicate completion binding');const bindings=[];
for(const path of files){const bytes=await exact(root,path);bindings.push({path,byteLength:bytes.length,sha256:sha256(bytes)});}
const report={workPackage:'AP23J1',asOf:'2026-10-27',status:'research-completed-awaiting-human-acceptance',
  head:preservation.gitHead,scopeConfirmed:true,scopeConfirmedBy:'David Steimer',researchGroups:36,groupsByCanton:fixtureBuilt.groupsByCanton,
  manualLegalReferences:78,manualReferenceCounts:{dated:57,qualification:14,collision:3,window:4},
  extraSyntheticProbes:595,allResearchComparisons:673,counts:references.counts,
  independentImplementationComparisons:673,calendarProbes:13,calendarEndEligibilityComparisons:2190,namedHolidayDateSetsEqual:true,
  researchCheckerTests:{...counts,productTests:false},explicitEvidenceBindings:evidence.explicitSourceBindings,
  evidenceFiles:evidence.inventoriedEvidenceFiles,sourceRoleLimits:'48 bindings include derived text, metadata, mirrors, search results and drafts. They are not 48 independent normative sources.',
  localLinksChecked,diffWhitespaceCheckPassed:true,readOnlyCountercheckNote:'docs/fachrecht/ap23j1/pruefnotiz.md',
  preservation,professionalAcceptance:false,sourceReleaseApproved:false,formatDecision:false,implementationStarted:false,
  runtimeActivation:false,productCodeChanged:false,schemasChanged:false,acceptedLegalDataChanged:false,existingTestsChanged:false,
  releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,githubStatusPublished:false,operatingChanges:false,
  nextGate:'David Steimer confirms professional acceptance of J1-A through J1-G, then commissions AP23J2 separately. No format, source release or operating approval is inferred.',bindings};
await writeFile(resolve(root,finalPath),JSON.stringify(report,null,2)+'\n');
for(const b of bindings){const raw=await exact(root,b.path,b.sha256);assert.equal(raw.length,b.byteLength);}
console.log(JSON.stringify({...report,preservation:undefined,bindings:undefined,boundFiles:bindings.length},null,2));
