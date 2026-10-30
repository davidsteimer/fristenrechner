// SPDX-License-Identifier: AGPL-3.0-only
// Default tests are pure synthetic fixtures. No repository/evidence/artifact load.
import test from 'node:test';
import assert from 'node:assert/strict';
import {publicContract,hash,manifestPath,releasePath,releaseId,recordedDataCommit,recordedParent,
 assertPublicMvp10Path,verifyBoundBytes,validateMvp10PublicIntegrity,readZip,crc32,
 assertByteInventory,zipInventory,assertLocalPin,assertPackageScope} from '../../scripts/verify-mvp10-public-integrity.mjs';
import {selectStandardSuites,privateMvp10Suites,privateMvp10HistoricalWebSuites} from '../../scripts/run-standard-tests.mjs';
import {privateMvp10InitialResearchSuites,privateMvp10SupplementalResearchSuites,
 privateMvp10HistoricalResearchSuites,privateMvp10HistoricalRoutingSuites} from '../../scripts/check-mvp10-portability.mjs';
const json=value=>Buffer.from(JSON.stringify(value));
function fixture(){
 const files=new Map(),artifacts=[],schemas={};
 for(const path of Object.keys(publicContract.schemaBindings)){const raw=json({$id:path});files.set(path,raw);schemas[path]=hash(raw);}
 const add=(path,role,contentId,value,schema)=>{const raw=json({dataKind:role,$schema:'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/'+schema,
  [role==='calendar'?'calendarId':role==='legalProfile'?'profileId':'catalogId']:contentId,...value});files.set(releasePath+'/'+path,raw);
  artifacts.push({path,role,contentId,mediaType:'application/json',schemaId:JSON.parse(raw).$schema,sha256:hash(raw),byteLength:raw.length});};
 for(let n=0;n<5;n++)add('profiles/test'+n+'.json','legalProfile','profile'+n,{},'legal-profile.schema.json');
 add('special-regimes/test.json','specialRegimeCatalog','special',{},'special-regime-catalog-v3.schema.json');
 add('holiday-catalogs/test.json','holidayCatalog','holidays',{},'holiday-catalog-v2.schema.json');
 for(let n=0;n<35;n++)add('calendars/test'+n+'.json','calendar','calendar'+n,{},'calendar-rules-v3.schema.json');
 add('social-procedures/test.json','socialProcedureCatalog','ch-social-procedures',{
  federalRules:Array.from({length:44},(_,n)=>({ruleId:String(n)})),cantonalBindings:Array.from({length:50},()=>({procedureContextCanton:'BE'}))},'social-procedure-catalog-v2.schema.json');
 add('administrative-procedures/test.json','administrativeProcedureCatalog','ch-cantonal-administrative-procedures',{
  runtimeActive:false,paths:Array(245).fill({}),qualificationPolicies:Array(245).fill({}),suspensionProfiles:Array(46).fill({}),
  holidayBindings:Array.from({length:36},(_,n)=>({[n%2?'physicalSource':'physicalBaseline']:{releaseId}})),
  releaseBinding:{pathEligibility:Array(245).fill({})}},'administrative-procedure-catalog-v10.schema.json');
 const manifest={releaseId,releaseStatus:'approved',formatVersion:'17.0.0',compatibility:{minimumConsumerFormatVersion:'17.0.0'},artifacts,
  sourceSummary:{sourceIds:Array.from({length:258},(_,n)=>'source-'+n)},extensions:{'steimer.approval':{
   sourceReviewRef:{reviewId:'MVP10-SOURCE-APPROVAL-20261028',sha256:publicContract.sourceApprovalSha256}},
  'steimer.release-preparation':{publicationApproved:false,deploymentApproved:false,productionActivation:false,operatingApproval:'requiresSeparateDecision'}}};
 const raw=json(manifest);files.set(manifestPath,raw);return{files,contract:{...publicContract,manifestSha256:hash(raw),schemaBindings:schemas}};
}
function mutateManifest(item,mutate){const value=JSON.parse(item.files.get(manifestPath));mutate(value);const raw=json(value);item.files.set(manifestPath,raw);item.contract.manifestSha256=hash(raw);}
function mutateComponent(item,id,mutate){const manifest=JSON.parse(item.files.get(manifestPath)),row=manifest.artifacts.find(x=>x.contentId===id),path=releasePath+'/'+row.path;
 const value=JSON.parse(item.files.get(path));mutate(value);const raw=json(value);item.files.set(path,raw);mutateManifest(item,m=>Object.assign(m.artifacts.find(x=>x.contentId===id),{sha256:hash(raw),byteLength:raw.length}));}

test('pure fixture confirms 45 runtime and seven schema byte bindings without private evidence',()=>{const x=fixture(),r=validateMvp10PublicIntegrity(x.files,x.contract);
 assert.equal(r.runtimeFilesVerified,45);assert.equal(r.uniquePublicFilesVerified,52);
 for(const key of ['privateEvidenceRequired','privateRawEvidenceRechecked','completeSourceAuditReproduced','schemaValidationPerformed','gitHistoryChecked','newApprovalGranted','installationAuthorized','publicationAuthorized','operatingApproval'])assert.equal(r[key],false,key);
});
test('every expected public byte input is mandatory',()=>{const x=fixture();for(const path of x.files.keys()){const copy=new Map(x.files);copy.delete(path);assert.throws(()=>validateMvp10PublicIntegrity(copy,x.contract));}});
test('every public input is cryptographically bound',()=>{const x=fixture();for(const path of x.files.keys()){const copy=new Map(x.files);copy.set(path,Buffer.concat([copy.get(path),Buffer.from(' ')]));assert.throws(()=>validateMvp10PublicIntegrity(copy,x.contract));}});
test('forged manifest fails before following private descriptors',()=>{const x=fixture(),m=JSON.parse(x.files.get(manifestPath));m.artifacts[0].path='../../Userinput/private';x.files.set(manifestPath,json(m));assert.throws(()=>validateMvp10PublicIntegrity(x.files,x.contract),/Changed public input/u);});
for(const[name,mutate]of[
 ['consumer',m=>m.compatibility.minimumConsumerFormatVersion='16.0.0'],['candidate',m=>m.releaseStatus='candidate'],
 ['source duplicate',m=>m.sourceSummary.sourceIds[0]=m.sourceSummary.sourceIds[1]],
 ['publication',m=>m.extensions['steimer.release-preparation'].publicationApproved=true],
 ['missing component',m=>m.artifacts.pop()],['artifact traversal',m=>m.artifacts[0].path='../bad']])
 test('rehashed wrong '+name+' is still rejected',()=>{const x=fixture();mutateManifest(x,mutate);assert.throws(()=>validateMvp10PublicIntegrity(x.files,x.contract));});
test('rehashed administrative runtimeActive does not activate a contract',()=>{const x=fixture();mutateComponent(x,'ch-cantonal-administrative-procedures',d=>d.runtimeActive=true);assert.throws(()=>validateMvp10PublicIntegrity(x.files,x.contract));});
test('both physical binding forms require the actual release',()=>{for(const field of ['physicalBaseline','physicalSource']){const x=fixture();mutateComponent(x,'ch-cantonal-administrative-procedures',d=>d.holidayBindings.find(row=>field in row)[field].releaseId='old');assert.throws(()=>validateMvp10PublicIntegrity(x.files,x.contract));}});
test('social canton scope cannot expand to another canton',()=>{const x=fixture();mutateComponent(x,'ch-social-procedures',d=>d.cantonalBindings[0].procedureContextCanton='ZH');assert.throws(()=>validateMvp10PublicIntegrity(x.files,x.contract));});
test('extra inputs do not create a wider legal audit',()=>{const x=fixture();x.files.set('outputs/private-proof.json',json({}));assert.throws(()=>validateMvp10PublicIntegrity(x.files,x.contract),/Unexpected public input closure/u);});
test('path guard excludes private and ambiguous paths',()=>{for(const path of ['/bad','../bad','a/../b','a//b','a/./b','a\\b','a:b','a\nb','.git/config','.work/raw','node_modules/test','Userinput/test','outputs/r10-a2-2026-10-28/source.json','a.private.zip'])assert.throws(()=>assertPublicMvp10Path(path));});
test('bound descriptors require real byte length as well as hash',()=>{const raw=Buffer.from('test'),files=new Map([['x',raw]]);assert.throws(()=>verifyBoundBytes(files,{path:'x',sha256:hash(raw),byteLength:3}));});
test('local pin cannot change recorded commit or claim publication',()=>{const x=fixture();const pin={releaseId,commit:recordedDataCommit,parent:recordedParent,manifestSha256:x.contract.manifestSha256,localOnly:true,publicationVerified:false,installationAuthorized:false,
 files:zipInventory(new Map([...x.files].filter(([path])=>path.startsWith(releasePath+'/'))))};assertLocalPin(pin,x.files,x.contract);
 for(const delta of [{commit:'0'.repeat(40)},{parent:'0'.repeat(40)},{publicationVerified:true}])assert.throws(()=>assertLocalPin({...pin,...delta},x.files,x.contract));});

// Minimal stored ZIP writer is a synthetic test fixture, not the implementation.
function zip(entries){const locals=[],central=[];let offset=0;for(const row of entries){const name=Buffer.from(row.name),raw=row.raw??Buffer.from('x'),local=Buffer.alloc(30),head=Buffer.alloc(46),crc=crc32(raw);
 local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt32LE(crc,14);local.writeUInt32LE(raw.length,18);local.writeUInt32LE(raw.length,22);local.writeUInt16LE(name.length,26);
 head.writeUInt32LE(0x02014b50);head.writeUInt16LE(0x0314,4);head.writeUInt16LE(20,6);head.writeUInt32LE(crc,16);head.writeUInt32LE(raw.length,20);head.writeUInt32LE(raw.length,24);head.writeUInt16LE(name.length,28);head.writeUInt32LE(row.external??0,38);head.writeUInt32LE(offset,42);
 locals.push(local,name,raw);central.push(head,name);offset+=local.length+name.length+raw.length;}
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,directory,end]);}
test('strict in-memory ZIP parser reads exact stored bytes and inventories',()=>{const raw=zip([{name:'manifest.json',raw:json({})},{name:'.htaccess'}]),files=readZip(raw);assert.equal(files.size,2);assertByteInventory(files,zipInventory(files));});
for(const name of ['../bad','/absolute','a//b','a\\b','Userinput/private'])test('ZIP path rejected: '+name,()=>assert.throws(()=>readZip(zip([{name}]))));
test('ZIP duplicate, symlink, CRC damage and local/central disagreement fail',()=>{
 assert.throws(()=>readZip(zip([{name:'x'},{name:'x'}])),/Duplicate ZIP/u);
 assert.throws(()=>readZip(zip([{name:'x',external:(0xa1ff<<16)>>>0}])),/symlink/u);
 const bad=zip([{name:'x'}]);bad[31]^=1;assert.throws(()=>readZip(bad),/CRC/u);
 const mismatch=zip([{name:'x'}]);mismatch[30]=121;assert.throws(()=>readZip(mismatch),/name mismatch/u);
});
test('ZIP truncation, trailing bytes and encrypted entry fail',()=>{const raw=zip([{name:'x'}]);assert.throws(()=>readZip(raw.subarray(0,-1)));assert.throws(()=>readZip(Buffer.concat([raw,Buffer.from('x')])));
 const encrypted=Buffer.from(raw);encrypted.writeUInt16LE(1,6);encrypted.writeUInt16LE(1,31+1+8);assert.throws(()=>readZip(encrypted));});
test('readback inventory rejects missing, extra and byte-mutated members',()=>{const files=new Map([['x',Buffer.from('x')]]),rows=zipInventory(files);for(const value of [new Map(),new Map([...files,['extra',Buffer.from('y')]]),new Map([['x',Buffer.from('z')]])])assert.throws(()=>assertByteInventory(value,rows));});
test('package scope refuses another solution and any permission tag',()=>{const files=new Map([['AppManifest.xml',Buffer.from('<App ProductID="other" Version="0.10.0.0" IsDomainIsolated="false" IsClientSideSolution="true"/>')]]);assert.throws(()=>assertPackageScope(files,'https://example.invalid'));
 files.set('AppManifest.xml',Buffer.from('<App ProductID="13090feb-a6bf-40fa-9d3c-ec8d90516a60" Version="0.10.0.0" IsDomainIsolated="false" IsClientSideSolution="true"><AppPermissionRequest/></App>'));assert.throws(()=>assertPackageScope(files,'https://example.invalid'),/permission/u);});

test('current MVP10 web, public integrity and ordinary product/UI tests stay standard',()=>{
 const current=['tests/public-app/mvp10-build.test.ts','tests/governance/mvp10-public-integrity.test.mjs',
  'tests/core/calendar-rules.test.ts','tests/ui/ap23m3-administrative.test.tsx'];
 assert.deepEqual(selectStandardSuites(current),current);
 assert.deepEqual(selectStandardSuites([...privateMvp10Suites,...current,...privateMvp10HistoricalWebSuites]),current);
});
test('all six current private execution/source suites are explicitly separated',()=>{
 assert.deepEqual(privateMvp10Suites,[
  'tests/core/mvp10-promotion-delta.test.ts',
  'tests/governance/mvp10-source-inventory.test.mjs',
  'tests/governance/mvp10-source-approval.test.mjs',
  'tests/governance/mvp10-source-coverage.test.mjs',
  'tests/governance/mvp10-recovery.test.mjs',
  'tests/governance/mvp10-execution-boundary.test.mjs'
 ]);
 assert.deepEqual(selectStandardSuites(privateMvp10Suites),[]);
});
test('exactly 28 original and seven supplemental research suites remain historical',()=>{
 assert.equal(privateMvp10InitialResearchSuites.length,28);
 assert.equal(privateMvp10SupplementalResearchSuites.length,7);
 assert.deepEqual(privateMvp10HistoricalResearchSuites,[...privateMvp10InitialResearchSuites,...privateMvp10SupplementalResearchSuites]);
 assert.equal(new Set(privateMvp10HistoricalResearchSuites).size,35);
 assert.deepEqual(selectStandardSuites(privateMvp10InitialResearchSuites),[]);
 assert.deepEqual(selectStandardSuites(privateMvp10SupplementalResearchSuites),[]);
});
test('old MVP09 web and its unchanged historical routing contract are not current tests',()=>{
 assert.deepEqual(privateMvp10HistoricalWebSuites,['tests/public-app/mvp09-build.test.ts']);
 assert.deepEqual(privateMvp10HistoricalRoutingSuites,['tests/governance/mvp09-test-scopes.test.mjs']);
 assert.deepEqual(selectStandardSuites([...privateMvp10HistoricalWebSuites,...privateMvp10HistoricalRoutingSuites]),[]);
});
test('new unknown tests are retained and no whole product/UI directory is omitted',()=>{
 const unknown=['tests/governance/unclassified-new-audit.test.mjs','tests/ui/mvp10-new.test.tsx','tests/core/new-runtime-regression.test.ts'];
 const retained=['tests/public-app/mvp10-build.test.ts','tests/governance/mvp10-public-integrity.test.mjs',...unknown];
 const privatePaths=[...privateMvp10Suites,...privateMvp10HistoricalResearchSuites,...privateMvp10HistoricalWebSuites,...privateMvp10HistoricalRoutingSuites];
 assert.equal(new Set(privatePaths).size,43);
 assert.deepEqual(selectStandardSuites([...retained,...privatePaths]),retained);
});
