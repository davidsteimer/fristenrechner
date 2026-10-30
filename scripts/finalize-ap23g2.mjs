// SPDX-License-Identifier: AGPL-3.0-only
// Bind only new G2 evidence. Never replace a historical proof or release.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),out='outputs/ap23g2-2026-10-22';
const proof=`${out}/local-completion.json`,sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=p=>readFile(resolve(root,p)),json=async p=>JSON.parse(await bytes(p));
const head=()=>spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();
const expectedHead='70ce67425e046a7a38a4fbe66acbd93c75ca5983';
const docx='outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx';
const docxSha='46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61';
async function walk(path){const out=[];for(const e of await readdir(resolve(root,path),{withFileTypes:true})){
  assert.ok(!e.isSymbolicLink(),path+'/'+e.name);out.push(...(e.isDirectory()?await walk(path+'/'+e.name):[path+'/'+e.name]));}return out.sort();}
async function bound(path){const b=await bytes(path);return{path,byteLength:b.length,sha256:sha(b)};}
assert.equal(head(),expectedHead);assert.equal(sha(await bytes(docx)),docxSha);
if(!process.argv.includes('--write')){
  const r=await json(proof);assert.equal(r.status,'passed-awaiting-technical-acceptance');assert.equal(r.head,expectedHead);
  for(const a of r.bindings)assert.deepEqual(await bound(a.path),a,a.path);
  assert.equal(r.runtimeActive,false);assert.equal(r.sourceReleaseApproved,false);assert.equal(r.sourcePushPerformed,false);
  console.log(JSON.stringify({verified:true,bindings:r.bindings.length,head:r.head,technicalAcceptance:'pending',contractDecision:'proposed'},null,2));
}else{
  const commands=[
    ['schemas',process.execPath,['scripts/build-ap23g2-schemas.mjs']],
    ['candidate',process.execPath,['scripts/build-ap23g2-candidate.mjs','--check']],
    ['contract',process.execPath,['--import','tsx','scripts/check-ap23g2-contract.mjs']],
    ['independent',resolve(root,'.venv/bin/python'),['scripts/check_ap23g2_independent.py']],
    ['g1-archive',process.execPath,['scripts/archive-ap23g1-acceptance.mjs','--check']],
    ['archive-tests',process.execPath,['--test','tests/governance/ap23g1-acceptance.test.mjs']],
    ['preservation',process.execPath,['scripts/check-ap23g1-preservation.mjs']],
    ['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit']],
    ['whitespace','git',['diff','--check']]
  ];
  const steps=[];
  for(const[id,cmd,args]of commands){const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8',env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??'')},maxBuffer:16*1024*1024});
    const text=(r.stdout??'')+(r.stderr??'')+(r.error?String(r.error):''),path=`${out}/${id}.txt`;await writeFile(resolve(root,path),text);
    const row={id,command:cmd===process.execPath?'node':cmd===resolve(root,'.venv/bin/python')?'.venv/bin/python':cmd,args,exitCode:r.status,...await bound(path)};
    steps.push(row);assert.equal(r.status,0,`${id} failed`);
  }
  const qa=await json(`${out}/QA-AP23G2.json`),ind=await json(`${out}/QA-AP23G2-INDEPENDENT.json`);
  assert.equal(qa.status,'passed');assert.equal(qa.referenceCases,115);assert.equal(qa.negativeCatalogMutations,43);
  assert.equal(qa.negativeInputMutations,38);assert.equal(qa.readerNegatives.length,6);assert.equal(ind.referenceCases,115);
  const bundle=await walk('outputs/ap23g2-candidate-2026-10-22/bundle');assert.equal(bundle.length,43);
  const candidate=await json('outputs/ap23g2-candidate-2026-10-22/candidate-integrity.json');
  assert.equal(sha(await bytes(candidate.manifest.path)),candidate.manifest.sha256);
  for(const a of candidate.artifacts)assert.deepEqual(await bound(a.path),a);
  const paths=[
    'scripts/finalize-ap23g2.mjs','scripts/build-ap23g2-candidate.mjs','scripts/build-ap23g2-schemas.mjs','scripts/check-ap23g2-contract.mjs','scripts/check_ap23g2_independent.py',
    'scripts/archive-ap23g1-acceptance.mjs','tests/governance/ap23g1-acceptance.test.mjs',
    'docs/fachrecht/abnahme-ap23g1.md','docs/fachrecht/ap23g1/referenzfaelle.json',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23g2.md','docs/architektur/verwaltungsverfahrensvertrag-ap23g2-pruefung.md',
    'docs/entscheidungen/DEC-2026-036-eroeffnungsketten-und-begruendungsverlangen-v4.md',
    'README.md','docs/README.md','docs/architektur/README.md','docs/entscheidungen/README.md','docs/fachrecht/README.md',
    'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md',
    `${out}/QA-AP23G2.json`,`${out}/QA-AP23G2-INDEPENDENT.json`,`${out}/contract-gap-review.md`,`${out}/issue48-status.json`,
    'outputs/ap23g1-abnahme-2026-10-22/receipt.json','outputs/ap23g1-2026-10-22/local-completion.json',
    'outputs/ap23g2-candidate-2026-10-22/candidate-integrity.json',docx,...await walk('schemas/candidates/ap23g2'),...bundle,...steps.map(s=>s.path)
  ];
  const bindings=await Promise.all([...new Set(paths)].sort().map(bound));
  // Check local document targets, including the about-to-be-written proof link.
  let localLinks=0;for(const p of paths.filter(p=>p.endsWith('.md'))){const text=(await bytes(p)).toString();
    for(const m of text.matchAll(/\]\(([^)]+)\)/g)){let target=m[1].replace(/^<|>$/g,'').split('#')[0];
      if(!target||/^[a-z]+:/i.test(target))continue;
      const absolute=resolve(root,dirname(p),decodeURIComponent(target));if(absolute!==resolve(root,proof))await readFile(absolute).catch(async e=>{
        if(e.code!=='EISDIR')throw new Error(`Broken local link ${p}: ${target}`);
      });localLinks++;}}
  assert.equal(head(),expectedHead);assert.equal(sha(await bytes(docx)),docxSha);
  const r={workPackage:'AP23G2',asOf:'2026-10-22',status:'passed-awaiting-technical-acceptance',head:expectedHead,
    professionalG1Acceptance:true,technicalAcceptance:false,contractDecision:{id:'DEC-2026-036',status:'proposed'},
    proposedFormats:{administrativeCatalog:'4.0.0',manifest:'11.0.0',minimumConsumer:'11.0.0'},
    runtimeActive:false,productIntegration:false,sourceReleaseApproved:false,calendarExportEnabled:false,
    productCodeChanged:false,acceptedLegalDataChanged:false,commitCreated:false,sourcePushPerformed:false,releaseBuildPerformed:false,
    operatingChanges:false,issue48StatusUpdated:true,g3Started:false,
    counts:{paths:58,newPaths:16,preservedPaths:42,calendars:33,artifacts:42,unchangedRawArtifacts:41,cases:115,
      catalogMutations:43,inputNegatives:38,nativeReaderNegatives:6,oldNativeCalculations:42,forgedContextBlocks:126,archiveTests:40},
    manifest:candidate.manifest,steps,localLinksChecked:localLinks,bindings};
  await writeFile(resolve(root,proof),JSON.stringify(r,null,2)+'\n');
  console.log(JSON.stringify({status:r.status,bindings:bindings.length,steps:steps.length,localLinksChecked:localLinks,manifestSha256:r.manifest.sha256},null,2));
}
