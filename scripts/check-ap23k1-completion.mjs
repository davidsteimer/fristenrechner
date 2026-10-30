// SPDX-License-Identifier: AGPL-3.0-only
// Bind the local research handoff. No product build, Git mutation or remote write.
import assert from 'node:assert/strict';
import {access,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,researchConfig,sha256,walk} from './prepare-ap23k1.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output=researchConfig.output;
const finalPath=output+'/local-completion.json';
const read=path=>readFile(resolve(root,path)),json=async path=>JSON.parse(await read(path));
const run=(file,args)=>execFileSync(file,args,{cwd:root,encoding:'utf8',maxBuffer:24*1024*1024,
  env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
const falseFlags=['professionalAcceptance','sourceReleaseApproved','formatDecision','implementationStarted','runtimeActivation',
  'productCodeChanged','schemasChanged','acceptedLegalDataChanged','existingTestsChanged','releaseBuildPerformed','commitCreated',
  'sourcePushPerformed','githubStatusPublished','operatingChanges'];
const documents=['docs/fachrecht/start-ap23k1.md','docs/fachrecht/verwaltungsverfahren-ap23k1.md',
  'docs/fachrecht/quellenpruefung-ap23k1.md','docs/fachrecht/referenzfaelle-ap23k1.md','docs/fachrecht/ap23k1/pruefnotiz.md'];
const scripts=['scripts/prepare-ap23k1.mjs','scripts/check-ap23k1-preservation.mjs','scripts/check-ap23k1-evidence.mjs',
  'scripts/check-ap23k1-references.mjs','scripts/check-ap23k1-references.py','scripts/check-ap23k1-completion.mjs'];
async function requiredBindings(){
  return [...documents,...researchConfig.living,...['bs','bl'].map(c=>'docs/fachrecht/ap23k1/befund-'+c+'.json'),
    'docs/fachrecht/ap23k1/referenzfaelle.json',...scripts,...researchConfig.allowedNewResearchTests,
    ...['protected-inputs.json','preservation-verification.json','reference-verification.json','reference-independent-verification.json',
      'evidence-verification.json','research-checker-tests.txt'].map(path=>output+'/'+path),...await walk(root,output+'/sources')];
}
assert.ok(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'Use --write or --check');
if(process.argv[2]==='--check'){
  const report=await json(finalPath);assert.equal(report.workPackage,'AP23K1');
  assert.equal(report.status,'research-completed-awaiting-human-acceptance');
  for(const flag of falseFlags)assert.equal(report[flag],false,flag);
  assert.equal(new Set(report.bindings.map(row=>row.path)).size,report.bindings.length);
  assert.deepEqual(report.bindings.map(row=>row.path).sort(),(await requiredBindings()).sort(),'Incomplete research binding set');
  for(const binding of report.bindings){assert.match(binding.sha256,/^[a-f0-9]{64}$/u);
    assert.ok(Number.isSafeInteger(binding.byteLength)&&binding.byteLength>0);
    const bytes=await exact(root,binding.path,binding.sha256);assert.equal(bytes.length,binding.byteLength);}
  const suite=await json('docs/fachrecht/ap23k1/referenzfaelle.json');
  assert.equal(report.researchGroups,suite.paths.length);assert.equal(report.manualLegalReferences,suite.cases.length);
  const references=JSON.parse(run(process.execPath,['scripts/check-ap23k1-references.mjs']));
  const independent=JSON.parse(run(resolve(root,'.venv/bin/python'),['scripts/check-ap23k1-references.py']));
  const evidence=JSON.parse(run(process.execPath,['scripts/check-ap23k1-evidence.mjs']));
  assert.equal(references.status,'passedResearchComparison');assert.deepEqual(references.discrepancies,[]);
  assert.equal(independent.status,'passedIndependentResearchComparison');assert.deepEqual(independent.discrepancies,[]);
  assert.equal(report.independentImplementationComparisons,independent.referenceComparisons);
  assert.equal(report.calendarEndEligibilityComparisons,independent.calendarEndEligibilityComparisons);
  assert.deepEqual(report.researchResultCounts,references.counts);
  assert.equal(report.explicitEvidenceBindings,evidence.explicitSourceBindings);assert.equal(report.evidenceFiles,evidence.inventoriedEvidenceFiles);
  const preservation=JSON.parse(run(process.execPath,['scripts/check-ap23k1-preservation.mjs']));
  assert.equal(preservation.protectedFilesVerified,6367);
  console.log(JSON.stringify({workPackage:'AP23K1',status:'bound-research-reverified',bindings:report.bindings.length,
    researchGroups:report.researchGroups,manualLegalReferences:report.manualLegalReferences,protectedFiles:6367,
    professionalAcceptance:false,sourceReleaseApproved:false,operatingChanges:false},null,2));
  process.exit(0);
}
const references=JSON.parse(run(process.execPath,['scripts/check-ap23k1-references.mjs','--write']));
const independent=JSON.parse(run(resolve(root,'.venv/bin/python'),['scripts/check-ap23k1-references.py','--write']));
run(process.execPath,['scripts/check-ap23k1-evidence.mjs','--write']);const evidence=await json(output+'/evidence-verification.json');
const preservation=JSON.parse(run(process.execPath,['scripts/check-ap23k1-preservation.mjs','--write']));
const suite=await json('docs/fachrecht/ap23k1/referenzfaelle.json');
assert.equal(references.status,'passedResearchComparison');assert.deepEqual(references.discrepancies,[]);
assert.equal(independent.status,'passedIndependentResearchComparison');assert.deepEqual(independent.discrepancies,[]);
assert.equal(independent.referenceComparisons,suite.cases.length);assert.equal(references.referenceCases,suite.cases.length);
assert.equal(references.handSpecifiedReferences,suite.cases.length,'Do not inflate legal references with synthetic mutations');
assert.equal(references.paths,suite.paths.length);assert.equal(evidence.status,'captured-source-bytes-verified');
const analystCases=[],groupsByCanton={};
for(const canton of ['bs','bl']){
  const model=await json('docs/fachrecht/ap23k1/befund-'+canton+'.json');
  const groups=model.pathProposals??model.groups,cases=model.localReferenceCases??model.researchCases;
  groupsByCanton[canton.toUpperCase()]=groups.length;analystCases.push(...cases);
  for(const flag of ['professionalAcceptance','formatDecision','sourceReleaseApproved','implementationStarted','operatingChanges'])assert.equal(model[flag],false,flag);
}
assert.equal(suite.paths.length,Object.values(groupsByCanton).reduce((sum,n)=>sum+n,0));
assert.equal(new Set(analystCases.map(row=>row.id)).size,analystCases.length,'Duplicate analyst case');
assert.equal(analystCases.length,suite.cases.length,'Lost or added analyst references');
for(const original of analystCases){
  const item=suite.cases.find(row=>row.id===original.id);assert.ok(item,'Missing analyst case '+original.id);
  for(const key of ['trigger','days','facts'])assert.deepEqual(item[key],original[key],'Changed analyst '+key+' '+item.id);
  assert.deepEqual(item.analystExpected,original.expected,'Original legal expectation not preserved '+item.id);
  assert.equal(item.expected.outcome,original.expected.outcome,'Changed expected outcome '+item.id);
  if(original.expected.outcome==='datedResearchValue')assert.equal(item.expected.end,original.expected.end,'Changed expected date '+item.id);
}
assert.equal(preservation.protectedFilesVerified,6367);assert.equal(preservation.acceptedJ3Archive.files,1284);
assert.equal(preservation.livingStatus.length,7);assert.ok(preservation.livingStatus.every(row=>row.changed));
assert.deepEqual(preservation.researchTestAdditions,[...researchConfig.allowedNewResearchTests].sort());
const tests=run(process.execPath,['--test',...researchConfig.allowedNewResearchTests]);
const counts=Object.fromEntries([...tests.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(row=>[row[1],Number(row[2])]));
assert.ok(counts.tests>=100);assert.equal(counts.tests,counts.pass);for(const flag of ['fail','cancelled','skipped','todo'])assert.equal(counts[flag],0);
await writeFile(resolve(root,output+'/research-checker-tests.txt'),tests);run('git',['diff','--check']);
let localLinksChecked=0;
for(const path of [...documents,...researchConfig.living]){
  const text=(await read(path)).toString();
  if(documents.includes(path))assert.equal(/[;ß]/u.test(text),false,'Swiss project prose '+path);
  for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
    let target=match[1].replace(/^<|>$/g,'').split(/\s+"/)[0];
    if(/^(?:https?:|mailto:|codex:|plugin:|#)/iu.test(target))continue;
    target=decodeURIComponent(target.split('#')[0]);if(!target)continue;
    const absolute=resolve(root,dirname(path),target);if(absolute!==resolve(root,finalPath))await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});
    localLinksChecked++;
  }
}
const files=await requiredBindings();
assert.equal(new Set(files).size,files.length,'Duplicate final binding');const bindings=[];
for(const path of files){const bytes=await exact(root,path);bindings.push({path,byteLength:bytes.length,sha256:sha256(bytes)});}
const report={workPackage:'AP23K1',asOf:'2026-10-27',status:'research-completed-awaiting-human-acceptance',
  head:preservation.gitHead,scopeConfirmed:true,scopeConfirmedBy:'David Steimer',
  researchGroups:suite.paths.length,groupsByCanton,manualLegalReferences:suite.cases.length,researchResultCounts:references.counts,
  independentImplementationComparisons:independent.referenceComparisons,calendarEndEligibilityComparisons:independent.calendarEndEligibilityComparisons,
  calendarProbes:references.calendarProbes,researchCheckerTests:{...counts,productTests:false},
  explicitEvidenceBindings:evidence.explicitSourceBindings,evidenceFiles:evidence.inventoriedEvidenceFiles,
  sourceRoleLimits:'Bindings include normative bodies, metadata, decisions, mirrors, annual closure documentation and derived text. Counts are not independent normative authorities or proof of complete jurisprudential coverage.',
  localLinksChecked,diffWhitespaceCheckPassed:true,readOnlyCountercheckNote:'docs/fachrecht/ap23k1/pruefnotiz.md',preservation,
  ...Object.fromEntries(falseFlags.map(flag=>[flag,false])),
  nextGate:'David Steimer accepts the professional K1-A through K1-G proposals, then commissions AP23K2 separately. No format, source release, implementation or operating approval is inferred.',bindings};
await writeFile(resolve(root,finalPath),JSON.stringify(report,null,2)+'\n');
for(const binding of bindings){const bytes=await exact(root,binding.path,binding.sha256);assert.equal(bytes.length,binding.byteLength);}
console.log(JSON.stringify({...report,preservation:undefined,bindings:undefined,boundFiles:bindings.length},null,2));
