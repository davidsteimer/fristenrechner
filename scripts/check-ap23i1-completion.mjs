// SPDX-License-Identifier: AGPL-3.0-only
// Bind completed local legal research. No product build, source promotion or remote write.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output='outputs/ap23i1-2026-10-22';
const read=path=>readFile(resolve(root,path));
const json=async path=>JSON.parse(await read(path));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const run=(file,args)=>execFileSync(file,args,{cwd:root,encoding:'utf8',maxBuffer:12*1024*1024});
assert.deepEqual(process.argv.slice(2),['--write'],'Explicit research write mode required');
run(process.execPath,['scripts/build-ap23i1-reference-fixture.mjs']);
const reference=JSON.parse(run(process.execPath,['scripts/check-ap23i1-references.mjs','--write']));
const independent=JSON.parse(run(resolve(root,'.venv/bin/python'),['scripts/check_ap23i1_independent.py','--write']));
run(process.execPath,['scripts/check-ap23i1-evidence.mjs','--write']);
const evidence=await json(output+'/evidence-verification.json');
const preservation=JSON.parse(run(process.execPath,['scripts/check-ap23i1-preservation.mjs','--write']));
assert.equal(reference.paths,34);assert.equal(reference.referenceCases,249);
assert.deepEqual(reference.counts,{datedResearchValue:110,unresolvedBoundaryProposed:16,qualificationBoundaryProposed:117,researchWindowBoundary:6});
assert.equal(independent.referenceComparisons,249);assert.equal(independent.calendarEndEligibilityComparisons,1460);
assert.deepEqual(independent.discrepancies,[]);assert.equal(reference.discrepancies.length,0);
assert.equal(evidence.inventoriedEvidenceFiles,99);assert.equal(evidence.explicitEvidenceBindingsVerified,98);
assert.equal(evidence.officialCantonMetadataChecks.length,7);
assert.equal(preservation.protectedFilesVerified,2496);
assert.equal(preservation.acceptedH3Archive.files,417);
const testCases=['tests/governance/ap23i1-references.test.mjs','tests/governance/ap23i1-research.test.mjs'];
const tests=run(process.execPath,['--test',...testCases]);
const counts=Object.fromEntries([...tests.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map(m=>[m[1],Number(m[2])]));
assert.deepEqual(counts,{tests:116,pass:116,fail:0,cancelled:0,skipped:0,todo:0});
await writeFile(resolve(root,output,'research-checker-tests.txt'),tests);
run('git',['diff','--check']);
const newDocuments=['docs/fachrecht/start-ap23i1.md','docs/fachrecht/verwaltungsverfahren-ap23i1.md',
  'docs/fachrecht/quellenpruefung-ap23i1.md','docs/fachrecht/referenzfaelle-ap23i1.md',
  ...['gl','tg'].map(c=>'docs/fachrecht/ap23i1/recherche-'+c+'.md'),output+'/project-card-update-proposal.md'];
let localLinksChecked=0;
const finalPath=resolve(root,output,'local-completion.json');
for(const path of[...newDocuments,...preservation.livingStatus.map(r=>r.path)]){
  const text=(await read(path)).toString();
  if(newDocuments.includes(path))assert.equal(/[;ß]/u.test(text),false,'Swiss project prose '+path);
  for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
    let target=m[1].replace(/^<|>$/g,'').split(/\s+"/)[0];
    if(/^(?:https?:|mailto:|codex:|plugin:|#)/i.test(target))continue;
    target=decodeURIComponent(target.split('#')[0]);if(!target)continue;
    const absolute=resolve(root,dirname(path),target);
    if(absolute!==finalPath)await access(absolute).catch(()=>{throw Error('Broken local link '+path+' -> '+target);});
    localLinksChecked++;
  }
}
const card=await json(output+'/project-card-status.json');
for(const key of['liveReadPerformed','publicUpdatePerformed','sourcePublicationPerformed','professionalAcceptance','i2Started','i3Started'])assert.equal(card[key],false,key);
assert.equal(card.noRemoteWritePerformed,true);
const reviewedDocuments=[
  {path:'docs/fachrecht/verwaltungsverfahren-ap23i1.md',sha256:'576ed83ada11f5871763f28242a34c93919ccf78b93c9a28ab026d6f62968d44'},
  {path:'docs/fachrecht/quellenpruefung-ap23i1.md',sha256:'916c7e05d0ba7f1ef68321ba4e637711f85cdc4fc17360a0818214e7dd64cd55'}
];
for(const item of reviewedDocuments)assert.equal(hash(await read(item.path)),item.sha256,'Changed reviewed text '+item.path);
const files=[...newDocuments,...preservation.livingStatus.map(r=>r.path),
  ...['gl','tg'].map(c=>'docs/fachrecht/ap23i1/befund-'+c+'.json'),'docs/fachrecht/ap23i1/referenzfaelle.json',
  'scripts/prepare-ap23i1.mjs','scripts/check-ap23i1-preservation.mjs','scripts/check-ap23i1-evidence.mjs',
  'scripts/check-ap23i1-references.mjs','scripts/check_ap23i1_independent.py','scripts/build-ap23i1-reference-fixture.mjs',
  'scripts/check-ap23i1-completion.mjs',...testCases,
  ...['protected-inputs.json','preservation-verification.json','reference-verification.json','reference-independent-verification.json',
    'evidence-verification.json','research-checker-tests.txt','project-card-status.json'].map(p=>output+'/'+p),
  ...evidence.fileInventory.map(r=>r.path)];
assert.equal(new Set(files).size,files.length,'Duplicate final binding');
const bindings=[];
for(const path of files){const bytes=await read(path);bindings.push({path,byteLength:bytes.length,sha256:hash(bytes)});}
const report={workPackage:'AP23I1',asOf:'2026-10-22',status:'research-completed-awaiting-human-acceptance',
  head:preservation.gitHead,scopeConfirmed:true,scopeConfirmedBy:'David Steimer',researchGroups:34,
  groupsByCanton:{GL:19,TG:15},researchCases:249,counts:reference.counts,
  independentReferenceComparisons:249,calendarProbes:15,calendarEndEligibilityComparisons:1460,
  researchCheckerTests:{reference:70,governance:46,...counts,productTests:false},
  evidenceFiles:99,explicitEvidenceBindings:98,officialMetadataChecks:7,localLinksChecked,diffWhitespaceCheckPassed:true,
  aiReadOnlyCountercheck:{reviewedDocuments,reportedBlockingFindings:0,
    note:'Final read-only GL/TG and overall research checks, not a second human professional approval. Earlier 224-case intermediate hashes and extra mutation counts are not used as final evidence.'},
  preservation,projectCardStatus:card,
  professionalAcceptance:false,sourceReleaseApproved:false,formatDecision:false,implementationStarted:false,
  runtimeActivation:false,productCodeChanged:false,schemasChanged:false,acceptedLegalDataChanged:false,
  existingTestsChanged:false,releaseBuildPerformed:false,commitCreated:false,sourcePushPerformed:false,operatingChanges:false,
  nextGate:'David Steimer confirms professional acceptance of I1-A through I1-G, then commissions AP23I2 separately.',bindings};
await writeFile(finalPath,JSON.stringify(report,null,2)+'\n');
for(const item of bindings)assert.equal(hash(await read(item.path)),item.sha256,'Completion readback '+item.path);
console.log(JSON.stringify({...report,preservation:undefined,bindings:undefined},null,2));
