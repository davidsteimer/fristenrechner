// SPDX-License-Identifier: AGPL-3.0-only
// Freeze accepted K2 before local K3 integration. This inventory never refreshes.
import assert from 'node:assert/strict';
import {lstat,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {archiveAcceptance,archiveConfig,checkedPath,exact,safeRelative,sha256} from './archive-ap23k2-acceptance.mjs';
import {walk} from './prepare-ap23i1.mjs';
export {checkedPath,exact,walk,safeRelative,sha256};
const core=['administrativeTypes','administrativeCatalog','administrativeDeadline','administrativeContext','modernRuntime','calculateDeadline',
  'calculateCalendarBoundDeadline','calculatorRuntime','calendarResolution','index','socialCatalog','socialDeadline','calculateSpecialDeadline'].map(name=>'src/core/'+name+'.ts');
const ui=['FristenrechnerApp.tsx','administrativeUi.tsx','administrativeMessages.ts','administrativeDefaults.ts','administrativeExport.ts','socialUi.ts'].map(name=>'src/ui/'+name);
const hosts=['package.json','scripts/build-public-app.mjs','spfx/scripts/sync-schemas.mjs','spfx/src/core/ReleaseValidator.ts',
  'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx'];
export const preparationConfig=Object.freeze({
  output:'outputs/ap23k3-2026-10-27',head:'70ce67425e046a7a38a4fbe66acbd93c75ca5983',
  previousGuard:archiveConfig.guard.path,previousGuardSha256:archiveConfig.guard.sha256,previousProtectedCount:6612,
  archive:archiveConfig.target,archiveFiles:131,receiptSha256:'b0991dc1a7f473256009eee7a9fa5109ab797e15694f26412668ff35d1941c79',
  proof:archiveConfig.proofPath,proofSha256:archiveConfig.proofSha256,
  userDocument:'outputs/2026-08-28_Projekt-und-Realisierungsplan_Fristenrechner_Schweiz_V1.0.docx',
  userDocumentSha256:'46e7e3fc9e8eeeeca035c56dbb06eeb0c55f60c423a0bea5f4075bf61b4cac61',
  living:['README.md','docs/README.md','docs/architektur/README.md','docs/fachrecht/README.md','docs/entscheidungen/README.md',
    'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md','docs/planung/schweizausbau-nach-mvp09.md'],
  trees:['src','schemas','data/releases','data/candidates','spfx/src','spfx/test','tests'],
  mutableExisting:[...core,...ui,...hosts],generatedMutablePrefix:'spfx/src/product/',
  additionalProtected:['scripts/archive-ap23k2-acceptance.mjs','tests/governance/ap23k2-acceptance.test.mjs','scripts/prepare-ap23k3.mjs',
    'docs/fachrecht/abnahme-ap23k2.md','docs/entscheidungen/DEC-2026-040-beschluss.md','spfx/scripts/sync-product-source.mjs'],
  generatedDerived:{'spfx/src/product/ui/styles.module.scss':{source:'src/ui/styles.css',prefix:':global {\n',suffix:'\n}\n'}},
  allowedNew:{files:[...['administrativeTypesV8','administrativeCatalogV8','administrativeDeadlineV8','administrativeV8Baseline',
      'format15Baseline','format15CalculationData','format15Runtime','holidayActivationV15','releaseFormat15'].map(name=>'src/core/'+name+'.ts'),
    'src/release/ap23k3CandidateData.ts','src/public-app/ap23k3-main.tsx','schemas/administrative-procedure-catalog-v8.schema.json',
    'schemas/release-manifest-v15.schema.json','schemas/administrative-input-v8.schema.json','tests/data/test_ap23k3_contract.py',
    'spfx/src/core/schemas/administrative-procedure-catalog-v8.schema.json','spfx/src/core/schemas/release-manifest-v15.schema.json',
    'spfx/src/schemas/administrative-procedure-catalog-v8.schema.json','spfx/src/schemas/release-manifest-v15.schema.json',
    'spfx/src/core/schemas/administrative-input-v8.schema.json','spfx/src/schemas/administrative-input-v8.schema.json',
    'spfx/src/schemas/implementation/ap23k3/local-reference-manifest-v15.schema.json'],
    prefixes:['data/candidates/2026-10-27-ap23k3/','schemas/implementation/ap23k3/'],
    patterns:['^src/ui/ap23k3[^/]+$','^tests/(?:core|ui|hosts|public-app|governance)/ap23k3[^/]+$',
      '^spfx/test/ap23k3[^/]+$'],generatedPrefix:'spfx/src/product/'},
  statement:'AP23K2 ist technisch abgenommen. Ich bestätige DEC-2026-040 mit Katalog 8.0.0 sowie Manifest und Mindestconsumer 15.0.0. Bitte starte AP23K3.'
});
export function isAllowedNew(path,allowed=preparationConfig.allowedNew){
  safeRelative(path);return allowed.files.includes(path)||allowed.prefixes.some(prefix=>path.startsWith(prefix))||
    allowed.patterns.some(pattern=>new RegExp(pattern,'u').test(path))||
    path.startsWith(allowed.generatedPrefix)&&isAllowedNew('src/'+path.slice(allowed.generatedPrefix.length),{...allowed,generatedPrefix:'__no-generated__/'});
}
export async function prepareProtection({root=process.cwd(),config=preparationConfig,verifyArchive=archiveAcceptance,
  readHead=directory=>execFileSync('git',['rev-parse','HEAD'],{cwd:directory,encoding:'utf8'}).trim()}={}){
  root=resolve(root);const guardPath=config.output+'/protected-inputs.json';await checkedPath(root,guardPath,{missing:true});
  let exists=false;try{await lstat(resolve(root,guardPath));exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  assert.equal(exists,false,'K3 baseline already frozen. Never refresh it.');
  const archive=await verifyArchive({root});assert.equal(archive.mode,'archive-reverified');assert.equal(archive.files,config.archiveFiles);assert.equal(archive.receiptSha256,config.receiptSha256);
  const receipt=JSON.parse(await exact(root,config.archive+'/receipt.json',config.receiptSha256));
  assert.equal(receipt.technicalAcceptance,true);assert.equal(receipt.technicalK2Acceptance,true);assert.equal(receipt.k3Commissioned,true);
  assert.equal(receipt.k3Started,true);assert.equal(receipt.professionalK3Acceptance,false);
  assert.deepEqual(receipt.contractDecision,{id:'DEC-2026-040',status:'approved',on:'2026-10-27'});assert.equal(receipt.userStatement,config.statement);
  for(const key of['sourceReleaseApproved','deployable','deployed','sourcePublished'])assert.equal(receipt[key],false,'Acceptance boundary '+key);
  const previous=JSON.parse(await exact(root,config.previousGuard,config.previousGuardSha256));
  assert.equal(previous.workPackage,'AP23K2');assert.equal(Object.keys(previous.files).length,config.previousProtectedCount);assert.equal(previous.head,config.head);
  const proof=JSON.parse(await exact(root,config.proof,config.proofSha256));assert.equal(proof.bindings.length,130);
  const files={},mutableBefore={},living=new Set(config.living),mutable=new Set(config.mutableExisting);
  for(const path of await walk(root,'spfx/src/product')){
    const source=config.generatedDerived[path]?.source??'src/'+path.slice(config.generatedMutablePrefix.length);
    await exact(root,source);mutable.add(path);
  }
  async function add(path,expected){
    safeRelative(path);const bytes=await exact(root,path,expected),hash=sha256(bytes);if(living.has(path))return;
    const target=mutable.has(path)?mutableBefore:files;
    if(Object.hasOwn(target,path))assert.equal(target[path],hash,'Conflicting input '+path);target[path]=hash;
  }
  for(const[path,hash]of Object.entries(previous.files))await add(path,hash);
  for(const item of proof.bindings)await add(item.path,item.sha256);
  await add(config.proof,config.proofSha256);
  for(const item of receipt.artifacts)await add(config.archive+'/'+item.path,item.sha256);
  await add(config.archive+'/receipt.json',config.receiptSha256);
  for(const path of config.additionalProtected)await add(path);
  const treeFiles={};for(const directory of config.trees){treeFiles[directory]=await walk(root,directory);for(const path of treeFiles[directory])await add(path);}
  for(const path of mutable)await add(path);
  await add(config.userDocument,config.userDocumentSha256);
  const livingAtStart={};for(const path of config.living){const accepted=proof.bindings.find(item=>item.path===path);assert.ok(accepted,'Living input not bound in K2');livingAtStart[path]=sha256(await exact(root,path,accepted.sha256));}
  const head=await readHead(root);assert.equal(head,config.head);
  const record={workPackage:'AP23K3',createdOn:'2026-10-27',capturedBeforeIntegration:true,capturedBeforeLivingUpdates:true,head,
    k2TechnicallyAccepted:true,acceptedBy:'David Steimer',userStatement:config.statement,
    contractDecision:{id:'DEC-2026-040',status:'approved',on:'2026-10-27'},acceptedK2Archive:archive,
    previousGuard:{path:config.previousGuard,sha256:config.previousGuardSha256,protectedCount:config.previousProtectedCount},
    previousProof:{path:config.proof,sha256:config.proofSha256},userDocument:{path:config.userDocument,sha256:config.userDocumentSha256},
    files:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b,'en'))),
    mutableBefore:Object.fromEntries(Object.entries(mutableBefore).sort(([a],[b])=>a.localeCompare(b,'en'))),livingAtStart,treeFiles,
    allowedNew:config.allowedNew,mutableAllowed:config.mutableExisting,generatedMutablePrefix:config.generatedMutablePrefix,
    generatedDerived:config.generatedDerived,
    sourceReleaseApproved:false,operatingChangesAuthorized:false,commitPermission:false,sourcePushPermission:false,
    scope:'Only local K3 format-15 integration and actual local host artefact tests are authorised. Existing old reader/version modules, arithmetic, accepted data, old tests and evidence remain immutable. Enumerated dispatcher/UI/host files and generated SPFx product copies may change. No source promotion, commit, push, upload, installation, mirror, AP5/AP21 or E/Q/P change.'};
  const bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');await checkedPath(root,guardPath,{missing:true});await mkdir(resolve(root,config.output),{recursive:true});
  await writeFile(resolve(root,guardPath),bytes,{flag:'wx'});await exact(root,guardPath,sha256(bytes));
  return{status:'integration-baseline-frozen',guardPath,guardSha256:sha256(bytes),guardByteLength:bytes.length,protectedFiles:Object.keys(files).length,
    mutableExistingFiles:Object.keys(mutableBefore).length,livingStatusFiles:config.living.length,head,archive};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.equal(process.argv.length,2,'No refresh or alternate CLI config');console.log(JSON.stringify(await prepareProtection(),null,2));
}


