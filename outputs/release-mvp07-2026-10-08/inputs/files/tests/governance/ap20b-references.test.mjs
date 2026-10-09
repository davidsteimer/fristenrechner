// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {contract,dates,bindings,baseInput,evaluate,runDateReferences,validateContract,verifyPreserved} from '../../scripts/check-ap20b-references.mjs';
const root = fileURLToPath(new URL('../../',import.meta.url));
const ids = bindings.map(item=>item.id);
function run(id,patch={}) {const input=baseInput(id); return evaluate(id,{...input,...patch,facts:{...input.facts,...patch.facts}});}

test('20 national rules, 22 distinct Bern bindings and 220 literal date references',()=>{
  assert.deepEqual(runDateReferences(),{nationalRules:20,bernBindings:22,dateCases:220,runtimeActive:false});
  assert.equal(new Set(ids).size,22);
  for(const law of ['EOG','FAMZG','FLG','MVG','UELG']) {
    assert.deepEqual([...new Set(bindings.filter(b=>b.route.law===law).map(b=>b.ruleId))].sort(),['ADM','APP','CORRECTION','OBJ'].map(a=>`CH-SOC-${law}-${a}`));
    assert.equal(bindings.filter(b=>b.route.law===law).length,law==='EOG'?6:4);
  }
});
test('all bindings independently reject missing and unexpected facts',()=>{
  for(const id of ids) for(const key of Object.keys(baseInput(id).facts)) {
    const input=baseInput(id); delete input.facts[key];
    assert.equal(evaluate(id,input).reason,'reference-contract-invalid',`${id}/${key}`);
  }
  for(const id of ids) assert.equal(run(id,{facts:{inferredFromDefault:true}}).reason,'reference-contract-invalid');
});
test('qualified issuer, source origin and ordinary domestic case are mandatory',()=>{
  for(const id of ids) {
    assert.equal(run(id,{facts:{competentBodyQualified:false}}).reason,'competence-unqualified');
    assert.equal(run(id,{facts:{decisionOrigin:'insuranceCourt'}}).reason,'origin-unqualified');
    for(const value of ['abroad','thirdParty','unclear']) assert.equal(run(id,{facts:{jurisdictionSpecialCase:value}}).reason,'unsupported-special-case');
  }
});
test('every substantive route fact blocks a wrong canton or unqualified office class',()=>{
  for(const binding of bindings) for(const [key,value] of Object.entries(binding.route.facts)) {
    for(const wrong of [null,'unknown',value==='BE'?'ZH':value==='cantonal'?'nonCantonal':'cantonal']) {
      assert.equal(run(binding.id,{facts:{[key]:wrong}}).reason,'jurisdiction-unbound',`${binding.id}/${key}`);
    }
  }
});
test('EOG cantonal and noncantonal court origins cannot substitute for each other',()=>{
  const cantonal='BE-SOC-EOG-CANTONAL-APP',ordinary='BE-SOC-EOG-ORDINARY-APP';
  assert.equal(run(cantonal).qualification,'qualified-reference');
  assert.equal(run(ordinary).qualification,'qualified-reference');
  assert.equal(run(cantonal,{facts:{eogOfficeType:'nonCantonal'}}).reason,'jurisdiction-unbound');
  assert.equal(run(ordinary,{facts:{eogOfficeType:'cantonal'}}).reason,'jurisdiction-unbound');
  assert.equal(run(cantonal,{facts:{partyDomicileCanton:'BE',compensationOfficeCanton:'ZH'}}).reason,'reference-contract-invalid');
  assert.equal(run(ordinary,{facts:{compensationOfficeCanton:'BE'}}).reason,'reference-contract-invalid');
});
test('EO adoption rejects an externally identified wrong issuer, not an inferred benefits classification',()=>{
  // EOV35q assigns adoption to EAK. The product does not independently infer
  // benefit type or competence. The negative finding must be qualified first.
  assert.equal(run('BE-SOC-EOG-ADMIN-OBJ',{facts:{competentBodyQualified:false}}).reason,'competence-unqualified');
  assert.equal(run('BE-SOC-EOG-CANTONAL-APP',{facts:{competentBodyQualified:false}}).reason,'competence-unqualified');
  // Qualified EAK origin uses the noncantonal route, never the cantonal-seat rule.
  assert.equal(run('BE-SOC-EOG-ORDINARY-APP').qualification,'qualified-reference');
});
test('EOG and MVG administrative domicile is a product boundary, never an insurer-seat filter',()=>{
  for(const law of ['EOG','MVG']) for(const action of ['OBJ','ADM']) {
    const id=`BE-SOC-${law}-ADMIN-${action}`;
    assert.equal(bindings.find(b=>b.id===id).route.kind,'product-scope');
    for(const authoritySeatCanton of ['BE','ZH','LU','GE',null]) assert.equal(run(id,{authoritySeatCanton}).qualification,'qualified-reference');
    assert.equal(run(id,{facts:{partyDomicileCanton:'ZH'},authoritySeatCanton:'BE'}).reason,'jurisdiction-unbound');
    assert.equal(run(id,{facts:{compensationOfficeCanton:'BE'}}).reason,'reference-contract-invalid');
  }
});
test('FamZG uses the applicable order, FLG the issuing competent cantonal fund, not domicile',()=>{
  for(const law of ['FAMZG','FLG']) for(const binding of bindings.filter(b=>b.route.law===law)) {
    assert.equal(run(binding.id,{authoritySeatCanton:'ZH'}).qualification,'qualified-reference');
    assert.equal(Object.hasOwn(baseInput(binding.id).facts,'partyDomicileCanton'),false);
    assert.equal(run(binding.id,{facts:{partyDomicileCanton:'BE'}}).reason,'reference-contract-invalid');
  }
});
test('UELG administration and court require different independently qualified facts',()=>{
  assert.equal(run('BE-SOC-UELG-ADMIN-OBJ',{facts:{uelgAdministrativeCanton:'ZH'}}).reason,'jurisdiction-unbound');
  assert.equal(run('BE-SOC-UELG-COURT-APP',{facts:{partyDomicileCanton:'ZH'}}).reason,'jurisdiction-unbound');
  assert.equal(run('BE-SOC-UELG-COURT-APP',{facts:{uelgAdministrativeCanton:'BE'}}).reason,'reference-contract-invalid');
});
test('court dates are explicit, covered, and separate from notification',()=>{
  for(const binding of bindings.filter(b=>b.route.dateSelector==='jurisdictionReferenceDate')) {
    assert.equal(run(binding.id,{jurisdictionReferenceDate:null}).reason,'jurisdiction-date-required');
    assert.equal(run(binding.id,{jurisdictionReferenceDate:'2026-02-29'}).reason,'jurisdiction-date-required');
    assert.equal(run(binding.id,{jurisdictionReferenceDate:'2028-01-03'}).reason,'jurisdiction-date-uncovered');
    const earlier=run(binding.id,{jurisdictionReferenceDate:'2026-09-01'});
    assert.deepEqual(earlier.arithmetic,run(binding.id).arithmetic);
    if(binding.action==='CORRECTION') assert.equal(run(binding.id,{jurisdictionReferenceDate:'2026-09-17'}).reason,'jurisdiction-date-after-correction');
    else assert.equal(run(binding.id,{jurisdictionReferenceDate:'2026-10-01'}).qualification,'qualified-reference');
  }
});
test('administration never silently consumes an irrelevant court date',()=>{
  for(const binding of bindings.filter(b=>b.route.dateSelector==='legalTriggerDate')) assert.equal(run(binding.id,{jurisdictionReferenceDate:'2026-09-16'}).reason,'unexpected-jurisdiction-date');
});
test('all named statutory exclusions and product limits have explicit reasons',()=>{
  for(const row of contract.exclusions) {
    const id=bindings.find(b=>b.route.law===row.law).id;
    assert.equal(run(id,{matter:row.matter}).reason,row.reason);
  }
  assert.equal(run('BE-SOC-FAMZG-ADMIN-OBJ',{matter:'famzg-voluntary-fund-benefits'}).reason,'unresolved-qualification');
  assert.equal(run('BE-SOC-EOG-ADMIN-OBJ',{matter:'eog-cantonal-supplement',legalTriggerDate:'2027-07-01'}).reason,'product-scope');
});
test('formless EO statements and generic judicial orders do not start modeled objection/correction periods',()=>{
  assert.equal(run('BE-SOC-EOG-ADMIN-OBJ',{document:'informal-benefit-statement'}).reason,'document-unqualified');
  for(const binding of bindings.filter(b=>b.action==='CORRECTION')) for(const document of ['generic-court-order','evidence-order','court-fixed-date']) assert.equal(run(binding.id,{document}).reason,'document-unqualified');
});
test('MVV notice is an ordered response only when concretely qualified, no IVG-style fixed period',()=>{
  assert.equal(run('BE-SOC-MVG-ADMIN-ADM',{days:14}).qualification,'qualified-reference');
  assert.equal(run('BE-SOC-MVG-ADMIN-ADM',{document:'generic-preliminary-notice',days:30}).reason,'document-unqualified');
  assert.equal(run('BE-SOC-MVG-ADMIN-OBJ',{days:90}).reason,'fixed-duration-changed');
});
test('fixed days versus ordered days, units and bounds remain closed',()=>{
  for(const binding of bindings) {
    for(const days of [0,366,-1,1.5,'30',null]) assert.equal(run(binding.id,{days}).reason,'duration-unqualified');
    for(const durationUnit of ['months','fixed-date','years']) assert.equal(run(binding.id,{durationUnit}).reason,'duration-unqualified');
    if(['OBJ','APP'].includes(binding.action)) assert.equal(run(binding.id,{days:10}).reason,'fixed-duration-changed');
    else assert.equal(run(binding.id,{days:1}).qualification,'qualified-reference');
  }
});
test('BE jurisdiction does not determine holiday anchor and no other canton is activated',()=>{
  for(const id of ids) {
    assert.deepEqual(run(id,{holidayRole:'representative'}).arithmetic,run(id).arithmetic);
    assert.equal(run(id,{holidayRole:'authority'}).reason,'holiday-anchor-unqualified');
    assert.equal(run(id,{holidayStatus:'conflict'}).reason,'holiday-anchor-unqualified');
    assert.equal(run(id,{holidayCanton:'ZH'}).reason,'holiday-scope-unbound');
    assert.equal(run(id,{spatialScopeId:'AG-REGION'}).reason,'holiday-scope-unbound');
    assert.equal(run(id,{procedureContextCanton:'ZH'}).reason,'product-canton-unbound');
  }
});
test('the whole computation must remain inside the covered window',()=>{
  assert.equal(run('BE-SOC-EOG-ADMIN-OBJ',{legalTriggerDate:'2027-11-18'}).reason,'result-outside-reference-window');
  assert.equal(run('BE-SOC-MVG-ADMIN-ADM',{legalTriggerDate:'2027-12-17',days:1}).reason,'result-outside-reference-window');
  for(const date of ['2025-12-31','2028-01-03']) assert.equal(run('BE-SOC-UELG-ADMIN-OBJ',{legalTriggerDate:date}).reason,'outside-reference-window');
  assert.equal(run('BE-SOC-UELG-ADMIN-OBJ',{procedureStartDate:'2025-12-31'}).reason,'outside-reference-window');
  assert.equal(run('BE-SOC-UELG-ADMIN-OBJ',{procedureStartDate:'2026-09-17'}).reason,'procedure-date-invalid');
});
test('invalid trigger, wrong stage and missing notification are not replaced by defaults',()=>{
  for(const id of ids) {
    assert.equal(run(id,{legalTriggerDate:'2026-02-29'}).reason,'date-invalid');
    assert.equal(run(id,{notificationConfirmed:false}).reason,'trigger-unqualified');
    assert.equal(run(id,{stage:'federal-supreme-court'}).reason,'stage-unqualified');
    assert.equal(run(id,{matter:'unknown'}).reason,'subject-unqualified');
  }
});
test('proposal, approval, versions and route mutations fail closed',()=>{
  for(const edit of [m=>m.runtimeActive=true,m=>m.approvedBy='David Steimer',m=>m.legalTimeApproval=true,m=>m.status='approved',m=>m.proposedVersions.minimumConsumer='5.0.0',m=>m.routes[0].facts.partyDomicileCanton='ZH',m=>m.referenceWindow.to='2028-12-31',m=>m.extra=true]) {
    const model=structuredClone(contract);edit(model);
    assert.throws(()=>validateContract(model));assert.equal(evaluate(ids[0],baseInput(ids[0]),model).reason,'reference-contract-invalid');
  }
});
test('literal expected results are not regenerated to match the implementation',()=>{
  const copy=structuredClone(dates); copy.vectors[0].ordered[3]='2026-09-27';
  assert.throws(()=>runDateReferences(copy),/R01/);
});
test('civil-date results are independent of host timezone and DST',()=>{
  for(const TZ of ['UTC','Europe/Zurich','America/New_York']) {
    const result=spawnSync(process.execPath,['scripts/check-ap20b-references.mjs'],{cwd:root,env:{...process.env,TZ},encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).dateCases,220);
  }
});
test('AP20A and the existing calendar reference remain byteidentical',async()=>{
  assert.deepEqual(await verifyPreserved(),{ap20aFiles:2,calendarFiles:2});
});
test('MVP05 manifest, social payload and every release artifact remain unchanged',async()=>{
  const directory=resolve(root,'data/releases/2026-09-28-mvp-05-approved.1');
  const pinned=[['manifest.json','3aa09c80c93ef56d472748c4a5496d439537272d96491497b2c678e3c7e20715'],['social-procedures/ch-social-procedures.json','1dd2792295b3b929efdcfa883b15509c0cd4fbef9dbf2a9f5228a8e6a6dacc26']];
  for(const [path,hash] of pinned) assert.equal(createHash('sha256').update(await readFile(resolve(directory,path))).digest('hex'),hash,path);
  const manifest=JSON.parse(await readFile(resolve(directory,'manifest.json'),'utf8'));
  assert.equal(manifest.artifacts.length,10);
  for(const artifact of manifest.artifacts) assert.equal(createHash('sha256').update(await readFile(resolve(directory,artifact.path))).digest('hex'),artifact.sha256,artifact.path);
  const catalog=JSON.parse(await readFile(resolve(directory,'social-procedures/ch-social-procedures.json'),'utf8'));
  assert.equal(catalog.federalRules.length,24);assert.equal(catalog.cantonalBindings.length,28);
});
async function files(directory) {
  return (await Promise.all((await readdir(directory,{withFileTypes:true})).map(e=>e.isDirectory()?files(resolve(directory,e.name)):[resolve(directory,e.name)]))).flat();
}
const ap20FixturePattern = /ap20b-social|check-ap20b-references/;
const ap20SuiteEvidence = {path:'tests/golden/candidates/ap20b-social-dates.json',sha256:'9740ce84883a54beec81f2f8a6cb1c450d690c9b6f440c5841d5821dfad16fa3'};
function assertNoFixturePayload(original,label='synthetic manifest') {
  const manifest=structuredClone(original);
  assert.doesNotMatch(JSON.stringify(manifest.artifacts),ap20FixturePattern,label);
  const suite=manifest.extensions?.['steimer.approval']?.referenceSuites?.['AP20B-SOCIAL-DATES-1'];
  if(suite) {
    assert.deepEqual(suite,ap20SuiteEvidence,label);
    delete manifest.extensions['steimer.approval'].referenceSuites['AP20B-SOCIAL-DATES-1'];
  }
  assert.doesNotMatch(JSON.stringify(manifest),ap20FixturePattern,label);
}
test('AP20B fixture is not runtime or payload, only its exact nonoperative approval evidence is allowed',async()=>{
  const paths=[...await files(resolve(root,'src')),...await files(resolve(root,'schemas'))];
  for(const path of paths.filter(p=>/\.(json|ts|tsx|js|mjs)$/.test(p))) assert.doesNotMatch(await readFile(path,'utf8'),ap20FixturePattern,path);
  assert.equal(createHash('sha256').update(await readFile(resolve(root,ap20SuiteEvidence.path))).digest('hex'),ap20SuiteEvidence.sha256);
  const manifests=(await files(resolve(root,'data/releases'))).filter(p=>p.endsWith('/manifest.json'));
  for(const path of manifests) {
    const manifest=JSON.parse(await readFile(path,'utf8'));
    assertNoFixturePayload(manifest,path);
    for(const artifact of manifest.artifacts) {
      const payload=resolve(path,'..',artifact.path);
      assert.doesNotMatch(await readFile(payload,'utf8'),ap20FixturePattern,payload);
    }
  }
});
test('AP20B approval exception rejects altered hashes, payload leaks and other metadata locations',()=>{
  const allowed={artifacts:[],extensions:{'steimer.approval':{referenceSuites:{'AP20B-SOCIAL-DATES-1':ap20SuiteEvidence}}}};
  assert.doesNotThrow(()=>assertNoFixturePayload(allowed));
  const wrongHash=structuredClone(allowed);wrongHash.extensions['steimer.approval'].referenceSuites['AP20B-SOCIAL-DATES-1'].sha256='0'.repeat(64);
  assert.throws(()=>assertNoFixturePayload(wrongHash));
  const payload=structuredClone(allowed);payload.artifacts.push({...ap20SuiteEvidence,role:'ruleProfile'});
  assert.throws(()=>assertNoFixturePayload(payload));
  for(const location of ['steimer.candidate','other']) {
    const extra=structuredClone(allowed);extra.extensions[location]={referenceSuite:ap20SuiteEvidence};
    assert.throws(()=>assertNoFixturePayload(extra));
  }
  const runner=structuredClone(allowed);runner.extensions['steimer.approval'].runner='scripts/check-ap20b-references.mjs';
  assert.throws(()=>assertNoFixturePayload(runner));
});
