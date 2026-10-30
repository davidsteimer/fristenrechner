// SPDX-License-Identifier: AGPL-3.0-only
// Closed standard-test copy. Private evidence audits remain separate commands.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {copyFile,lstat,mkdir,mkdtemp,readFile,readdir,symlink,writeFile} from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {historicalPythonContext,runPythonGovernanceContexts} from './check-mvp10-historical-source-tests.mjs';

// Suite-exact separation, not a directory/glob exclusion. These unchanged tests
// deliberately verify original research full texts or autonomous source archives.
export const privateMvp10InitialResearchSuites=Object.freeze([
  'tests/governance/ap23j2-candidate.test.mjs',
  'tests/governance/ap23j2-contract.test.mjs',
  'tests/governance/ap23k2-candidate.test.mjs',
  'tests/governance/ap23k2-contract.test.mjs',
  'tests/governance/ap23k2-independent.test.mjs',
  'tests/governance/ap23l2-candidate.test.mjs',
  'tests/governance/ap23l2-contract.test.mjs',
  'tests/governance/ap23l2-independent.test.mjs',
  'tests/governance/ap23l2-native.test.mjs',
  'tests/governance/ap23l2-schemas.test.mjs',
  'tests/governance/ap23m2-contract.test.mjs',
  'tests/governance/ap23m2-independent.test.mjs',
  'tests/governance/ap23m2-native.test.mjs',
  'tests/governance/ap23m2-finalizer.test.mjs',
  'tests/governance/ap23m3-independent.test.mjs',
  'tests/governance/ap23j3-acceptance.test.mjs',
  'tests/governance/ap23k3-acceptance.test.mjs',
  'tests/governance/ap23l1-acceptance.test.mjs',
  'tests/governance/ap23l2-acceptance.test.mjs',
  'tests/governance/ap23m1-acceptance.test.mjs',
  'tests/governance/ap23m2-acceptance.test.mjs',
  'tests/governance/ap23m3-acceptance-archive.test.mjs',
  'tests/governance/ap23k1-research.test.mjs',
  'tests/governance/ap23l1-research.test.mjs',
  'tests/governance/ap23m1-research.test.mjs',
  'tests/governance/r10-a1-source-inventory.test.mjs',
  'tests/governance/r10-a2-baseline-judgments.test.mjs',
  'tests/governance/r10-a2-baseline-judgment-norms.test.mjs'
]);
export const privateMvp10SupplementalResearchSuites=Object.freeze([
  'tests/governance/ap23h1-research.test.mjs',
  'tests/governance/ap23k1-references.test.mjs',
  'tests/governance/ap23l1-references.test.mjs',
  'tests/governance/ap23l2-preservation.test.mjs',
  'tests/governance/ap23m2-preservation.test.mjs',
  'tests/governance/ap23l3-acceptance.test.mjs',
  'tests/governance/ap23m3-acceptance.test.mjs'
]);
export const privateMvp10HistoricalResearchSuites=Object.freeze([
  ...privateMvp10InitialResearchSuites,...privateMvp10SupplementalResearchSuites
]);
// This is a superseded historical routing contract, not a raw-source audit.
export const privateMvp10HistoricalRoutingSuites=Object.freeze([
  'tests/governance/mvp09-test-scopes.test.mjs'
]);

export const portabilityConfig=Object.freeze({
  prior:'outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/input-inventory.json',
  output:'outputs/release-mvp10-2026-10-28/portability',
  codeRoots:['src','scripts','tests','schemas','data','public-app','preview','spfx/src','spfx/config'],
  referenceRoots:['docs/fachrecht/ap23f1','docs/fachrecht/ap23g1','docs/fachrecht/ap23h1','docs/fachrecht/ap23i1',
    'docs/fachrecht/ap23j1','docs/fachrecht/ap23k1','docs/fachrecht/ap23l1','docs/fachrecht/ap23m1'],
  nonprivateMetadataDirectories:[
    'outputs/ap23f1-2026-10-22','outputs/ap23f2-2026-10-22','outputs/ap23f2-candidate-2026-10-22','outputs/ap23f3-2026-10-22',
    'outputs/ap23g1-2026-10-22','outputs/ap23g2-2026-10-22','outputs/ap23g2-candidate-2026-10-22','outputs/ap23g3-2026-10-22',
    'outputs/ap23h1-2026-10-22','outputs/ap23h2-2026-10-22','outputs/ap23h2-candidate-2026-10-22','outputs/ap23h3-2026-10-22',
    'outputs/ap23i1-2026-10-22','outputs/ap23i2-2026-10-22','outputs/ap23i2-candidate-2026-10-22','outputs/ap23i3-2026-10-22',
    'outputs/ap23j1-2026-10-27','outputs/ap23j2-2026-10-27','outputs/ap23j2-candidate-2026-10-27','outputs/ap23j3-2026-10-27',
    'outputs/ap23k1-2026-10-27','outputs/ap23k2-2026-10-27','outputs/ap23k2-candidate-2026-10-27','outputs/ap23k3-2026-10-27',
    'outputs/ap23l1-2026-10-27','outputs/ap23l2-2026-10-27','outputs/ap23l2-candidate-2026-10-27','outputs/ap23l3-2026-10-27',
    'outputs/ap23m1-2026-10-27','outputs/ap23m2-2026-10-28','outputs/ap23m2-candidate-2026-10-28','outputs/ap23m3-2026-10-28',
    'outputs/r10-u1-2026-10-28'],
  exactMetadata:[
    'outputs/ap23i1-abnahme-2026-10-22/receipt.json',
    'outputs/ap23g2-abnahme-2026-10-22/receipt.json',
    'outputs/ap23h2-abnahme-2026-10-22/receipt.json',
    'outputs/ap23i2-abnahme-2026-10-22/receipt.json',
    'outputs/ap23j2-abnahme-2026-10-27/receipt.json',
    'outputs/ap23k2-abnahme-2026-10-27/receipt.json',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23f2.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23f2-pruefung.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23g2.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23g2-pruefung.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23h2.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23i2.md',
    'docs/architektur/verwaltungsverfahrensvertrag-ap23j2.md',
    'outputs/r10-a1-2026-10-28/coverage.json','outputs/r10-a1-2026-10-28/coverage-table.md',
    'outputs/r10-a2-2026-10-28/protected-inputs.json',
    historicalPythonContext.fixture,historicalPythonContext.publication],
  absenceRoots:['.git','.private','Userinput','tests/private','outputs/r10-b-vorbereitung-2026-10-28',
    'outputs/ap23j3-abnahme-2026-10-27','outputs/ap23k3-abnahme-2026-10-27',
    'outputs/ap23l1-abnahme-2026-10-27','outputs/ap23l2-abnahme-2026-10-27',
    'outputs/ap23m1-abnahme-2026-10-28','outputs/ap23m2-abnahme-2026-10-28',
    'outputs/ap23l3-abnahme-2026-10-27','outputs/ap23m3-abnahme-2026-10-28',
    'outputs/r10-u1-abnahme-2026-10-28',
    'outputs/r10-a2-abnahme-2026-10-28','outputs/r10-a1-abnahme-2026-10-28',
    'outputs/recovery-mvp10-2026-10-28','outputs/release-mvp10-2026-10-28']
});
const root=fileURLToPath(new URL('../',import.meta.url));
// A failed isolated run is retained. A later explicitly numbered attempt writes
// a new record and never replaces or relabels the failed one.
const attempt=process.env.FRISTENRECHNER_PORTABILITY_ATTEMPT??'01';
assert.match(attempt,/^[0-9]{2}$/u,'Explicit two-digit portability attempt required');
const out=portabilityConfig.output+'/attempt-'+attempt;
const sha=b=>createHash('sha256').update(b).digest('hex');
const encode=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
const forbidden=/(?:^|\/)(?:\.git|\.work|\.private|Userinput|private|arbeitskopien|raw|__pycache__|\.ssh|\.aws)(?:\/|$)|\.private\.|backup|\.har(?:\.|$)|\.pyc$/iu;
const sourceExtension=/\.(?:json|mjs|cjs|js|ts|tsx|mts|py|md|css|scss|html|txt|svg|png|woff2?)$/u;
function safe(path){assert.ok(typeof path==='string'&&path&&!path.startsWith('/')&&!/[\\:\x00-\x1f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),path);return path;}
async function regular(base,path){safe(path);let target=base;for(const part of path.split('/')){target=resolve(target,part);assert.equal((await lstat(target)).isSymbolicLink(),false,path);}assert.equal((await lstat(target)).isFile(),true,path);return readFile(target);}
async function walk(base,path){safe(path);const stat=await lstat(resolve(base,path));assert.equal(stat.isSymbolicLink(),false,path);if(stat.isFile())return[path];const paths=[];for(const entry of(await readdir(resolve(base,path))).sort()){const p=path+'/'+entry;if(forbidden.test(p)||entry==='node_modules'||entry==='.DS_Store')continue;paths.push(...await walk(base,p));}return paths;}
async function save(path,value){const bytes=Buffer.isBuffer(value)?value:encode(value);await mkdir(dirname(resolve(root,path)),{recursive:true});await writeFile(resolve(root,path),bytes,{flag:'wx'});return{path,sha256:sha(bytes),byteLength:bytes.length};}
async function suites(base,scope){const{selectStandardSuites}=await import(pathToFileURL(resolve(base,'scripts/run-standard-tests.mjs')).href);const paths=[];for(const dir of scope==='product'?['tests/core','tests/ui']:scope==='governance'?['tests/governance']:['tests/public-app'])for(const n of(await readdir(resolve(base,dir))).sort())if(/\.test\.(?:tsx?|mjs)$/u.test(n))paths.push(dir+'/'+n);return selectStandardSuites(paths);}

export async function preparePortability(){
  const priorBytes=await regular(root,portabilityConfig.prior),prior=JSON.parse(priorBytes);
  assert.equal(prior.files.length,2799,'Unexpected prior closed input inventory');
  assert.equal(prior.privateRawEvidenceIncluded,false);
  const excluded=new Set(prior.excludedHistoricalOriginalPaths),paths=new Set(prior.files.map(r=>r.path));
  paths.add('public-app/.htaccess');
  const suppliedRoots=[...portabilityConfig.codeRoots,...portabilityConfig.referenceRoots];
  for(const dir of suppliedRoots)for(const p of await walk(root,dir))if(sourceExtension.test(p))paths.add(p);
  // Only top-level JSON/Markdown descriptors and candidate JSON bundles. Never
  // descend into a source directory or an autonomous acceptance archive.
  const fixturePaths=[];
  for(const dir of portabilityConfig.nonprivateMetadataDirectories){
    for(const e of await readdir(resolve(root,dir),{withFileTypes:true}))if(e.isFile()&&/\.(?:json|md)$/u.test(e.name)){const p=dir+'/'+e.name;paths.add(p);fixturePaths.push(p);}
    if(dir.includes('-candidate-'))for(const p of await walk(root,dir+'/bundle')){assert.match(p,/\.json$/u);paths.add(p);fixturePaths.push(p);}
  }
  for(const p of portabilityConfig.exactMetadata){paths.add(p);fixturePaths.push(p);}
  // These are already published MVP09 product/evidence anchors, not private
  // source originals. Keep public readback tests in the standard collection.
  const public09=await import('./verify-mvp09-publication.mjs');
  const evidence09=await import('./prepare-mvp09-public-evidence.mjs');
  const coverage=await import('./inventory-r10-a1-coverage.mjs');
  const publicFixturePaths=[...Object.keys(public09.anchors),evidence09.MANIFEST,
    ...evidence09.SPECS.map(s=>evidence09.OUTPUT+'/'+s.output)];
  for(const p of [...publicFixturePaths,...coverage.coverageConfig.evidence,
    'outputs/ap23j1-2026-10-27/sources/ju/source-bindings.json']){paths.add(p);fixturePaths.push(p);}
  // Decision/acceptance prose is reference material, not an archive payload.
  for(const p of await walk(root,'docs/entscheidungen'))if(/\.(?:json|md)$/u.test(p))paths.add(p);
  for(const e of await readdir(resolve(root,'docs/fachrecht'),{withFileTypes:true}))if(e.isFile()&&/^(?:abnahme-ap23[f-m]|abnahme-r10-u1)/u.test(e.name)&&e.name.endsWith('.md'))paths.add('docs/fachrecht/'+e.name);
  for(const p of paths){assert.ok(!forbidden.test(p),'Forbidden input '+p);assert.ok(!excluded.has(p),'Private historical original '+p);assert.ok(!portabilityConfig.absenceRoots.some(a=>p===a||p.startsWith(a+'/')),'Excluded private archive '+p);}
  await mkdir(resolve(root,'.work'),{recursive:true});
  const stage=await mkdtemp(resolve(root,'.work/mvp10-standard-no-private-')),files=[];
  for(const p of [...paths].sort()){const bytes=await regular(root,p);await mkdir(dirname(resolve(stage,p)),{recursive:true});await copyFile(resolve(root,p),resolve(stage,p));const copied=await regular(stage,p);assert.equal(sha(copied),sha(bytes));files.push({path:p,sha256:sha(bytes),byteLength:bytes.length});}
  // Dependencies only, no link back to project data or source evidence.
  await symlink(resolve(root,'node_modules'),resolve(stage,'node_modules'),'dir');
  await mkdir(resolve(stage,'spfx'),{recursive:true});await symlink(resolve(root,'spfx/node_modules'),resolve(stage,'spfx/node_modules'),'dir');
  await symlink(resolve(root,'.venv'),resolve(stage,'.venv'),'dir');
  const selected={};for(const scope of['product','governance','public'])selected[scope]=await suites(stage,scope);
  const record={kind:'mvp10ClosedStandardPortabilityInputs',preparedAt:new Date().toISOString(),stage:relative(root,stage),
    priorRoutingInventory:{path:portabilityConfig.prior,sha256:sha(priorBytes),byteLength:priorBytes.length},
    codeRoots:portabilityConfig.codeRoots,referenceRoots:portabilityConfig.referenceRoots,metadataDirectories:portabilityConfig.nonprivateMetadataDirectories,
    exactMetadata:portabilityConfig.exactMetadata,additionalFixturePaths:fixturePaths.sort(),publishedMvp09Fixtures:publicFixturePaths.sort(),files,suites:selected,
    excludedHistoricalOriginalPaths:[...excluded].sort(),absenceRoots:portabilityConfig.absenceRoots,
    retainedHistoricalPublicFullTextFixture:prior.retainedHistoricalPublicFullTextFixture,
    privateRawEvidenceIncluded:false,currentR10ArchivesIncluded:false,gitIncluded:false,initialWorkTreeIncluded:false,
    noOfficialFullTextsClaimed:false,publicationReviewPerformed:false,
    historicalPythonTechnicalFixture:{path:historicalPythonContext.fixture,sha256:historicalPythonContext.sha256,byteLength:historicalPythonContext.byteLength,publicBinding:{path:historicalPythonContext.publication,pointer:historicalPythonContext.publicationPointer},notALegalSourceOriginal:true},
    dependencies:{node:process.execPath,nodeModules:'node_modules symlink to existing dependency tree',spfxModules:'spfx/node_modules dependency symlink',python:'.venv dependency symlink',pythonBytecodeWriting:false},
    limits:['Technical portability, not a privacy/publication approval','Private source, original acceptance and execution-authority audits are separate explicit commands','One expressly retained public ELG full-text reference fixture remains, as in the verified MVP09 test copy','Tests may create fresh scratch files, but no prior .work is supplied'],
    installationPerformed:false,uploaded:false,published:false};
  const descriptor=await save(out+'/input-inventory.json',record);
  await save(out+'/workspace.json',{stage:record.stage,inventory:descriptor});
  console.log(JSON.stringify({prepared:true,stage:record.stage,inputFiles:files.length,suites:Object.fromEntries(Object.entries(selected).map(([k,v])=>[k,v.length]))}));
  return record;
}
async function inputs(){const pointer=JSON.parse(await regular(root,out+'/workspace.json'));assert.match(pointer.stage,/^\.work\/mvp10-standard-no-private-[A-Za-z0-9]+$/u);const bytes=await regular(root,pointer.inventory.path);assert.equal(sha(bytes),pointer.inventory.sha256);assert.equal(bytes.length,pointer.inventory.byteLength);const record=JSON.parse(bytes);assert.equal(record.stage,pointer.stage);return record;}
async function unchanged(record){const stage=resolve(root,record.stage);for(const r of record.files){const bytes=await regular(stage,r.path);assert.equal(sha(bytes),r.sha256,r.path);assert.equal(bytes.length,r.byteLength,r.path);}for(const p of[...record.absenceRoots,...record.excludedHistoricalOriginalPaths])await assert.rejects(lstat(resolve(stage,p)),{code:'ENOENT'});const fixture=record.retainedHistoricalPublicFullTextFixture;assert.equal(sha(await regular(stage,fixture.path)),fixture.sha256);for(const p of['node_modules','spfx/node_modules','.venv'])assert.equal((await lstat(resolve(stage,p))).isSymbolicLink(),true,p);for(const scope of Object.keys(record.suites))assert.deepEqual(await suites(stage,scope),record.suites[scope],'Standard test selection changed '+scope);return stage;}
export async function recordHistoricalSupplement(){
  const guardPath='outputs/r10-a2-2026-10-28/protected-inputs.json',guardBytes=await regular(root,guardPath);
  assert.equal(sha(guardBytes),'1c07c86cb49f1bda4b68da069da2b908e2adefbe1bca71b8db914bd0b5f628ec');
  const guard=JSON.parse(guardBytes),pins=new Map(guard.files.map(r=>[r.path,r]));assert.equal(pins.size,17637);
  const oldPath='outputs/release-mvp10-2026-10-28/historical-source-evidence.json',oldBytes=await regular(root,oldPath),old=JSON.parse(oldBytes);
  assert.equal(old.status,'passed');assert.equal(old.suites.length,28);
  assert.deepEqual(old.suites.map(r=>r.path),privateMvp10InitialResearchSuites);
  const audited=async path=>{const pin=pins.get(path);assert.ok(pin,'Original is not A2 guard-bound: '+path);const b=await regular(root,path);assert.equal(sha(b),pin.sha256,path);assert.equal(b.length,pin.byteLength,path);return{...pin};};
  const rules=[
    {name:'ap23h1-research',scripts:['scripts/check-ap23h1-references.mjs'],
      chain:'runReferences() verifies isolatedPracticeProbes[].sourcePath bytes, including outputs/ap23h1-2026-10-22/sources/nw/va-24-19-amtlich.pdf, before mathematical comparisons.',
      completion:'outputs/ap23h1-2026-10-22/local-completion.json',receipt:'outputs/ap23h1-abnahme-2026-10-22/receipt.json',counter:'researchCheckerTests'},
    {name:'ap23k1-references',scripts:['scripts/check-ap23k1-references.mjs'],
      chain:'runReferences() loads sourceModels with sourceRegister:true and verifies every register.sourceBase/entry.file original, not just the reference-model JSON.',
      completion:'outputs/ap23k1-2026-10-27/local-completion.json',receipt:'outputs/ap23k1-abnahme-2026-10-27/receipt.json',counter:'researchCheckerTests'},
    {name:'ap23l1-references',scripts:['scripts/check-ap23l1-references.mjs'],
      chain:'runReferences() loads sourceModels with sourceRegister:true and verifies all content.sourceBase/source.file originals, including the AI VerwVG PDF.',
      completion:'outputs/ap23l1-2026-10-27/local-completion.json',receipt:'outputs/ap23l1-abnahme-2026-10-27/receipt.json',counter:'researchTests'},
    {name:'ap23l2-preservation',scripts:['scripts/check-ap23l2-preservation.mjs','scripts/archive-ap23l1-acceptance.mjs'],
      chain:'The actual-workspace test calls checkPreservation() without synthetic options and checks 9048 historical protected paths plus the autonomous accepted L1 archive.',
      completion:'outputs/ap23l2-2026-10-27/local-completion.json',receipt:'outputs/ap23l2-abnahme-2026-10-27/receipt.json',counter:'governanceTests'},
    {name:'ap23m2-preservation',scripts:['scripts/check-ap23m2-preservation.mjs','scripts/archive-ap23m1-acceptance.mjs'],
      chain:'The actual-workspace test calls checkPreservation() without synthetic options and checks 11414 original protected paths plus the autonomous accepted M1 archive.',
      completion:'outputs/ap23m2-2026-10-28/local-completion.json',receipt:'outputs/ap23m2-abnahme-2026-10-28/receipt.json',counter:'governanceTests'},
    {name:'ap23l3-acceptance',scripts:['scripts/archive-ap23l3-acceptance.mjs'],
      chain:'The accepted-L3 test calls archiveAcceptance({root:workspace}); its archive binds 1427 original payloads, including historical private build/work paths. Other tests in the same file are synthetic, but no individual assertion is removed.',
      completion:'outputs/ap23l3-2026-10-27/local-completion.json',receipt:'outputs/ap23l3-abnahme-2026-10-27/receipt.json',counter:'qaCounts'},
    {name:'ap23m3-acceptance',scripts:['scripts/archive-ap23m3-acceptance.mjs'],
      chain:'The accepted-M3 test calls archiveAcceptance({root:workspace}); exact archived payloads include original private work/build paths. Its synthetic assertions remain intact in the separate historical suite.',
      completion:'outputs/ap23m3-2026-10-28/local-completion.json',receipt:'outputs/ap23m3-abnahme-2026-10-28/receipt.json',counter:'qaCounts'}
  ];
  const rows=[];
  for(const r of rules){const path='tests/governance/'+r.name+'.test.mjs';assert.ok(privateMvp10SupplementalResearchSuites.includes(path));const originalScript=await audited(path),chainScripts=[];for(const p of r.scripts)chainScripts.push(await audited(p));const completion=await audited(r.completion),receipt=await audited(r.receipt),record=JSON.parse(await regular(root,r.completion));assert.ok(Object.hasOwn(record,r.counter),'Missing historical QA counter '+r.counter);rows.push({path,originalScript,chainScripts,reason:r.chain,classification:'private-original-evidence-or-archive-audit',historicalQa:{completion,receipt,counterPointer:'/'+r.counter,originalCounter:record[r.counter],countersBelongToHistoricalWorkPackage:true,notAnIndividualCurrentTestCount:true},originalBytesPreserved:true,currentHistoricalAuditRerun:false,currentPassClaim:false,newHumanAcceptance:false,productChange:false});}
  const logPath='outputs/release-mvp10-2026-10-28/portability/attempt-01/governance-node.log',log=await regular(root,logPath);
  const report={kind:'mvp10-historical-research-portability-supplement',status:'bounded-original-evidence-reuse-recorded',checkedAt:new Date().toISOString(),
    guard:{path:guardPath,sha256:sha(guardBytes),byteLength:guardBytes.length},initial28Evidence:{path:oldPath,sha256:sha(oldBytes),byteLength:oldBytes.length},
    diagnostic:{path:logPath,sha256:sha(log),byteLength:log.length,failedIsolatedRun:true,notAProductRegressionConclusion:true},
    scope:{initialHistoricalSuites:28,addedHistoricalSuites:rows.length,combinedHistoricalResearchSuites:privateMvp10HistoricalResearchSuites.length},rows,
    unchangedStandardPreservationSuites:['tests/governance/ap23l3-preservation.test.mjs','tests/governance/ap23m3-preservation.test.mjs'],
    actualSourceOrOriginalArchiveChecksRerun:false,oldResultsRelabelledCurrent:false,all35HistoricalSuitesPassedTodayClaimed:false,
    rootOld28ProofUnchanged:true,assertionsRemoved:false,testsSilentlySkipped:false,sourceReleaseApprovalChanged:false,operatingChanges:false};
  const descriptor=await save(portabilityConfig.output+'/historical-research-supplement.json',report);console.log(JSON.stringify({...descriptor,status:report.status,addedSuites:rows.length}));return report;
}
export async function checkHistoricalRouting(){
  const inventoryBytes=await regular(root,portabilityConfig.prior),inventory=JSON.parse(inventoryBytes),sourceCommit='02209d0';
  const inputs=['scripts/run-standard-tests.mjs',...privateMvp10HistoricalRoutingSuites],copied=[];
  await mkdir(resolve(root,'.work'),{recursive:true});const stage=await mkdtemp(resolve(root,'.work/mvp10-historical-routing-'));
  for(const path of inputs){const expected=inventory.files.find(r=>r.path===path);assert.ok(expected);const b=execFileSync('git',['show',sourceCommit+':'+path],{cwd:root,maxBuffer:1024*1024});assert.equal(sha(b),expected.sha256,path);assert.equal(b.length,expected.byteLength,path);await mkdir(dirname(resolve(stage,path)),{recursive:true});await writeFile(resolve(stage,path),b,{flag:'wx'});copied.push({...expected,readFrom:sourceCommit+':'+path});}
  const args=['--test',...privateMvp10HistoricalRoutingSuites],result=spawnSync(process.execPath,args,{cwd:stage,encoding:'utf8',maxBuffer:1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
  if(result.error)throw result.error;assert.equal(result.status,0,result.stdout+result.stderr);const log=Buffer.from(result.stdout+result.stderr),counts=tap(log.toString());assert.equal(counts.tests,3);
  for(const row of copied){const b=await regular(stage,row.path);assert.equal(sha(b),row.sha256);assert.equal(b.length,row.byteLength);}
  const priorPath='outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/governance-execution.json',priorBytes=await regular(root,priorPath),prior=JSON.parse(priorBytes);
  assert.equal(prior.passed,true);assert.ok(inventory.suites.governance.includes(privateMvp10HistoricalRoutingSuites[0]));const step=prior.steps.find(r=>r.id==='governance-node'),oldLog=await regular(root,step.log.path);assert.equal(sha(oldLog),step.log.sha256);assert.deepEqual(tap(oldLog.toString()),step.counts);
  const descriptor=await save(portabilityConfig.output+'/historical-routing.log',log);
  const report={kind:'mvp10-separate-historical-routing-contract',status:'passed',checkedAt:new Date().toISOString(),stage:relative(root,stage),
    whySeparate:'The original MVP09 selector correctly included the then-current MVP09 web test. MVP10 intentionally routes that test to a separately bound original-archive build. The old expectation is preserved and rerun only with its exact original selector, while current routing is independently tested.',
    inputInventory:{path:portabilityConfig.prior,sha256:sha(inventoryBytes),byteLength:inventoryBytes.length},inputs:copied,
    priorGovernance:{path:priorPath,sha256:sha(priorBytes),byteLength:priorBytes.length,originalCounts:step.counts,originalLog:step.log,originalResultsNotRelabelledCurrent:true},
    currentHistoricalRoutingExecution:{command:[process.execPath,...args],exitCode:result.status,counts,log:descriptor,onlyTwoOriginalNonprivateFilesSupplied:true,inputsUnchanged:true},
    currentMvp10RoutingPassedClaimed:false,privateSourceAuditRerun:false,assertionsRemoved:false,oldAssertionsModified:false,installationPerformed:false,uploaded:false,published:false};
  const bound=await save(portabilityConfig.output+'/historical-routing.json',report);console.log(JSON.stringify({...bound,status:'passed',counts}));return report;
}
function tap(text){const counts=Object.fromEntries(['tests','pass','fail','cancelled','skipped','todo'].map(k=>{const m=[...text.matchAll(new RegExp('^# '+k+' (\\d+)\\r?$','gm'))];return[k,m.length===1?Number(m[0][1]):null];}));assert.ok(Number.isSafeInteger(counts.tests)&&counts.tests>0,'No complete TAP counter set');assert.equal(counts.pass,counts.tests);for(const k of['fail','cancelled','skipped','todo'])assert.equal(counts[k],0,k);return counts;}
export async function runPortability(scope){assert.ok(['product','governance','public'].includes(scope));const record=await inputs(),stage=await unchanged(record);
  const commands=scope==='governance'?[
    ['governance-node',process.execPath,['--import','tsx','--test','--test-concurrency=2',...record.suites.governance],'tap'],
    ['governance-schema',resolve(root,'.venv/bin/python'),['-B','tests/governance/validate_source_reviews.py','--self-test'],'schema']
  ]:[[scope,process.execPath,['--import','tsx','--test','--test-concurrency=2',...record.suites[scope]],'tap']];
  const steps=[];
  for(const[id,executable,args,mode]of commands){
    const chunks=[],startedAt=new Date().toISOString();let progressBuffer='',observedPoints=0,observedFailures=0,nextReportAt=100;
    const child=spawn(executable,args,{cwd:stage,env:{...process.env,PATH:dirname(process.execPath)+':'+(process.env.PATH??''),FORCE_COLOR:'0',PYTHONDONTWRITEBYTECODE:'1',FRISTENRECHNER_DATA_CANDIDATE:''},stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',b=>{
      chunks.push(b);
      // Observations are progress only, never a substitute for the complete
      // final TAP summary. Preserve every raw chunk without filtering it.
      if(mode!=='tap')return;
      progressBuffer+=b.toString();const end=progressBuffer.lastIndexOf('\n');if(end<0)return;
      const lines=progressBuffer.slice(0,end).split('\n');progressBuffer=progressBuffer.slice(end+1);
      for(const line of lines){if(!/^(?:not )?ok\s+\d+\b/u.test(line))continue;observedPoints++;if(/^not ok\b/u.test(line))observedFailures++;if(observedPoints>=nextReportAt){console.log(JSON.stringify({kind:'portability-progress-observation',id,at:new Date().toISOString(),observedTopLevelTapPoints:observedPoints,observedFailurePoints:observedFailures,finalCounts:false}));nextReportAt+=100;}}
    });
    child.stderr.on('data',b=>chunks.push(b));
    const exitCode=await new Promise((done,reject)=>{child.on('error',reject);child.on('close',done);});
    const bytes=Buffer.concat(chunks),text=bytes.toString(),log=await save(out+'/'+id+'.log',bytes);
    const row={id,command:[executable,...args],startedAt,finishedAt:new Date().toISOString(),exitCode,log,passed:exitCode===0};
    try{if(mode==='tap')row.counts=tap(text);else if(mode==='unittest'){row.tests=Number(text.match(/^Ran (\d+) tests? in /mu)?.[1]??0);assert.ok(row.tests>0&&/^OK\s*$/mu.test(text)&&!/\b(?:skipped|expected failure|unexpected success)\b/iu.test(text));}else assert.match(text,/384 Quellen.*266 produktiv.*8 Ereignis.*8 Negativtests/su);}catch(error){row.passed=false;row.validationError=error.message;}
    steps.push(row);console.log(JSON.stringify(row));if(!row.passed)break;
  }
  let pythonContexts=null;
  if(scope==='governance'&&steps.length===commands.length&&steps.every(r=>r.passed)){
    const result=await runPythonGovernanceContexts({base:stage,inputFiles:record.files,python:resolve(root,'.venv/bin/python'),onLog:(id,bytes)=>save(out+'/'+id+'.log',bytes)});
    steps.push(...result.steps);pythonContexts=await save(out+'/governance-python-contexts.json',result);for(const step of result.steps)console.log(JSON.stringify(step));
  }
  await unchanged(record);const expectedSteps=commands.length+(scope==='governance'?2:0);const report={kind:'mvp10StandardPortabilityExecution',scope,stage:record.stage,passed:steps.length===expectedSteps&&steps.every(r=>r.passed),inputsVerifiedBeforeAndAfter:true,inputCount:record.files.length,privateSourceAuditClaimed:false,operationalAcceptanceClaimed:false,pythonContexts,steps};await save(out+'/'+scope+'-execution.json',report);process.exitCode=report.passed?0:1;return report;
}
export async function verifyPortability(){
  const record=await inputs();await unchanged(record);const executions=[];
  for(const scope of['product','governance','public']){
    const path=out+'/'+scope+'-execution.json',bytes=await regular(root,path),execution=JSON.parse(bytes);
    assert.equal(execution.passed,true,scope);assert.equal(execution.inputsVerifiedBeforeAndAfter,true);assert.equal(execution.stage,record.stage);
    assert.deepEqual(execution.steps.map(r=>r.id),scope==='governance'?['governance-node','governance-schema','governance-python-current','governance-python-historical']:[scope]);
    for(const step of execution.steps){
      assert.equal(step.passed,true);assert.equal(step.exitCode,0);const log=await regular(root,step.log.path);
      assert.equal(sha(log),step.log.sha256);assert.equal(log.length,step.log.byteLength);const text=log.toString();
      if(step.id.endsWith('-schema'))assert.match(text,/384 Quellen.*266 produktiv.*8 Ereignis.*8 Negativtests/su);
      else if(step.id.startsWith('governance-python-')){assert.equal(Number(text.match(/^Ran (\d+) tests? in /mu)?.[1]??0),step.tests);assert.equal(step.tests,step.expectedMethodIds.length);assert.ok(step.tests>0&&/^OK\s*$/mu.test(text));assert.doesNotMatch(text,/\b(?:skipped|expected failure|unexpected success)\b/iu);}
      else assert.deepEqual(tap(text),step.counts);
    }
    if(scope==='governance'){
      const proof=execution.pythonContexts,proofBytes=await regular(root,proof.path);assert.equal(sha(proofBytes),proof.sha256);assert.equal(proofBytes.length,proof.byteLength);const contexts=JSON.parse(proofBytes);assert.equal(contexts.passed,true);assert.deepEqual(contexts.partition.all,[...contexts.partition.current,...contexts.partition.historical].sort());assert.deepEqual({all:contexts.partition.all.length,current:contexts.partition.current.length,historical:contexts.partition.historical.length},historicalPythonContext.expectedMethodCounts);assert.equal(contexts.currentValidatorUnchanged,true);assert.equal(contexts.oldTestsAndIndicesUnchanged,true);assert.equal(contexts.testsSkipped,false);assert.equal(contexts.assertionsRemoved,false);assert.deepEqual(contexts.steps,execution.steps.slice(2));
    }
    executions.push({path,sha256:sha(bytes),byteLength:bytes.length,execution});
  }
  const historical=[];for(const path of[portabilityConfig.output+'/historical-research-supplement.json',portabilityConfig.output+'/historical-routing.json']){const bytes=await regular(root,path);historical.push({path,sha256:sha(bytes),byteLength:bytes.length});}
  const inventoryBytes=await regular(root,out+'/input-inventory.json');
  const report={kind:'mvp10StandardTestPortabilityProof',passed:true,scope:['product','governance','public','source-schema','python-governance'],
    inputInventory:{path:out+'/input-inventory.json',sha256:sha(inventoryBytes),byteLength:inventoryBytes.length},inputCount:record.files.length,
    suites:Object.fromEntries(Object.entries(record.suites).map(([k,v])=>[k,v.length])),inputsVerifiedBeforeAndAfter:true,
    privateRawSourceOriginalsPresent:false,originalAcceptanceArchivesPresent:false,executionAuthorityPresent:false,gitPresent:false,initialWorkTreeIncluded:false,
    retainedHistoricalPublicFullTextFixture:record.retainedHistoricalPublicFullTextFixture,publishedMvp09Fixtures:record.publishedMvp09Fixtures,
    noOfficialFullTextsClaimed:false,noTestsSkipped:true,executions,separateHistoricalBoundaries:historical,
    actualHistoricalSourceAuditsRerun:false,historicalRoutingRerunIsOnlyOriginalThreeTestContract:true,
    limits:record.limits,installationPerformed:false,uploaded:false,published:false};
  const result=await save(out+'/report.json',report);console.log(JSON.stringify({...result,passed:true}));return report;
}
// Do not hold this module's evaluation open while the dynamically loaded runner
// imports the suite-only export above. A top-level await would form a cycle.
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3);const mode=process.argv[2];assert.ok(['prepare','product','governance','public','verify','historical-supplement','historical-routing'].includes(mode),'Choose explicit portability mode');void(async()=>{if(mode==='prepare')await preparePortability();else if(mode==='verify')await verifyPortability();else if(mode==='historical-supplement')await recordHistoricalSupplement();else if(mode==='historical-routing')await checkHistoricalRouting();else await runPortability(mode);})().catch(error=>{console.error(error);process.exitCode=1;});}
