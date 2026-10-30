// SPDX-License-Identifier: AGPL-3.0-only
// Isolated research completion. No product build, promotion or remote write.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out='outputs/ap23h1-2026-10-22';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>readFile(resolve(root,p));
const json=async p=>JSON.parse(await read(p));
const run=(file,args)=>execFileSync(file,args,{cwd:root,encoding:'utf8',maxBuffer:12*1024*1024});
assert.deepEqual(process.argv.slice(2),['--write'],'Explicit research-report write mode required');
const references=JSON.parse(run(process.execPath,['scripts/check-ap23h1-references.mjs','--write']));
const independent=JSON.parse(run(resolve(root,'.venv/bin/python'),['scripts/check_ap23h1_independent.py','--write']));
run(process.execPath,['scripts/check-ap23h1-evidence.mjs','--write']);
const evidence=await json(out+'/evidence-verification.json');
const preservation=JSON.parse(run(process.execPath,['scripts/check-ap23h1-preservation.mjs','--write']));
assert.equal(references.referenceCases,118);assert.equal(references.paths,21);
assert.equal(independent.referenceComparisons,118);assert.deepEqual(independent.discrepancies,[]);
assert.equal(independent.nodeReportSha256,hash(await read(out+'/reference-verification.json')));
assert.equal(evidence.researchGroupConsistency.length,21);
assert.equal(evidence.calendarEndEligibilityComparisons,1460);
assert.equal(preservation.protectedFilesVerified,1614);
const tests=run(process.execPath,['--test','tests/governance/ap23h1-research.test.mjs']);
for(const[key,value]of Object.entries({tests:81,pass:81,fail:0,cancelled:0,skipped:0})){
  assert.match(tests,new RegExp('# '+key+' '+value+'\\n'));
}
await writeFile(resolve(root,out,'research-checker-tests.txt'),tests);
const earlierTests=await json(out+'/reference-checker-tests.json');
assert.equal(hash(await read(earlierTests.log)),earlierTests.sha256);
assert.equal(earlierTests.counts.pass,81);
run('git',['diff','--check']);
const newDocuments=[
  'docs/fachrecht/start-ap23h1.md','docs/fachrecht/verwaltungsverfahren-ap23h1.md',
  'docs/fachrecht/quellenpruefung-ap23h1.md','docs/fachrecht/referenzfaelle-ap23h1.md',
  ...['ow','nw'].map(c=>'docs/fachrecht/ap23h1/recherche-'+c+'.md')
];
const living=preservation.livingStatus.map(x=>x.path);
let localLinksChecked=0;
const plannedSelf=resolve(root,out,'local-completion.json');
for(const path of [...newDocuments,...living]){
  const text=(await read(path)).toString();
  if(newDocuments.includes(path))assert.equal(/[;ß]/u.test(text),false,'Language style '+path);
  for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
    let target=m[1].replace(/^<|>$/g,'').split(/\s+"/)[0];
    if(/^(?:https?:|mailto:|codex:|plugin:|#)/i.test(target))continue;
    target=decodeURIComponent(target.split('#')[0]);if(!target)continue;
    const absolute=resolve(root,dirname(path),target);
    if(absolute!==plannedSelf)await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});
    localLinksChecked++;
  }
}
const project=await json(out+'/project-card-status.json');
assert.equal(project.readbackVerified,true);assert.equal(project.publicUpdatePerformed,false);
assert.equal(project.issueUnchanged,true);assert.equal(project.professionalAcceptance,false);
const sources=[
  ...newDocuments,...living,'docs/fachrecht/ap23h1/referenzfaelle.json',
  ...['ow','nw'].map(c=>'docs/fachrecht/ap23h1/befund-'+c+'.json'),
  'scripts/prepare-ap23h1.mjs','scripts/check-ap23h1-preservation.mjs','scripts/check-ap23h1-evidence.mjs',
  'scripts/check-ap23h1-references.mjs','scripts/check_ap23h1_independent.py',
  'scripts/check-ap23h1-completion.mjs','tests/governance/ap23h1-research.test.mjs',
  ...['protected-inputs.json','reference-verification.json','reference-independent-verification.json',
    'evidence-verification.json','preservation-verification.json','research-checker-tests.txt',
    'reference-checker-tests.json','reference-checker-tests.txt','project-card-status.json',
    'project-card-update-proposal.md'].map(p=>out+'/'+p),
  ...evidence.fileInventory.map(x=>x.path)
];
assert.equal(new Set(sources).size,sources.length,'Duplicate completion binding');
const bindings=[];
for(const path of sources){const bytes=await read(path);bindings.push({path,byteLength:bytes.length,sha256:hash(bytes)});}
const report={workPackage:'AP23H1',asOf:'2026-10-22',status:'research-completed-awaiting-human-acceptance',
  scopeConfirmed:true,scopeConfirmedBy:'David Steimer',researchGroups:21,researchCases:118,counts:references.counts,
  independentReferenceComparisons:independent.referenceComparisons,calendarProbes:references.calendarProbes,
  calendarAnnualCountChecks:references.calendarCountChecks,calendarEndEligibilityComparisons:1460,
  isolatedHistoricalPracticeComparisons:independent.isolatedPracticeComparisons,
  researchCheckerTests:{passed:81,failed:0,skipped:0,productTests:false},
  sourceFolderFiles:evidence.inventoriedEvidenceFiles,explicitEvidenceBindings:evidence.explicitEvidenceBindingsVerified,
  officialCantonMetadataChecks:evidence.officialMetadata.length,localLinksChecked,diffWhitespaceCheckPassed:true,
  preservation,projectCardStatus:project,professionalAcceptance:false,formatDecision:false,implementationStarted:false,
  runtimeActivation:false,productCodeChanged:false,schemasChanged:false,acceptedLegalDataChanged:false,
  existingTestsChanged:false,releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,
  operatingChanges:false,nextGate:'Human professional acceptance of H1-A through H1-F, then separately commissioned AP23H2. Public project status needs explicit payload approval.',bindings};
await writeFile(plannedSelf,JSON.stringify(report,null,2)+'\n');await access(plannedSelf);
// Read all bindings back, including original source files, after writing the final report.
for(const binding of bindings)assert.equal(hash(await read(binding.path)),binding.sha256,'Completion readback '+binding.path);
console.log(JSON.stringify({...report,preservation:undefined,bindings:undefined},null,2));
