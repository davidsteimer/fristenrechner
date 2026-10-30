// SPDX-License-Identifier: AGPL-3.0-only
// Native identities for the approved J2 contract, never an operating approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import Ajv2020 from '../../spfx/node_modules/ajv/dist/2020.js';
import addFormats from '../../spfx/node_modules/ajv-formats/dist/index.js';
import {buildAP23J3Schemas,AP23J3_SCHEMA_FILES} from '../../scripts/build-ap23j3-schemas.mjs';
const root=new URL('../../',import.meta.url),prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
const load=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const schemas=await buildAP23J3Schemas();
const candidate='data/candidates/2026-10-27-ap23j3/';
const manifest=await load(candidate+'manifest.json'),catalog=await load(candidate+'administrative-procedures/ch-cantonal-administrative-procedures.json');
const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);for(const value of Object.values(schemas))ajv.addSchema(value);
const fragment=key=>({$defs:schemas.catalog.$defs,$ref:'#/$defs/'+key});
const accepts=(value,schema)=>{const validate=ajv.compile(schema);assert.equal(validate(value),true,JSON.stringify(validate.errors));};
const rejects=(value,schema)=>assert.equal(ajv.compile(schema)(value),false);

test('all three actual native schema files reproduce from accepted J2 schemas',async()=>{
  for(const[key,path]of Object.entries(AP23J3_SCHEMA_FILES)){assert.deepEqual(await load(path),schemas[key]);assert.ok(!path.includes('/candidates/'));
    assert.equal(schemas[key].$id,prefix+path);assert.equal(schemas[key].properties.$schema.const,schemas[key].$id);
    assert.equal(ajv.validateSchema(schemas[key]),true);}
});
test('native catalogue retains every accepted definition and union without broadening the contract',async()=>{
  const accepted=await load('schemas/candidates/ap23j2/administrative-procedure-catalog-v7.schema.json');
  assert.deepEqual(schemas.catalog.$defs,accepted.$defs);
  for(const key of Object.keys(accepted.properties).filter(key=>key!=='$schema'))assert.deepEqual(schemas.catalog.properties[key],accepted.properties[key]);
  assert.deepEqual(schemas.catalog.required,accepted.required);assert.equal(schemas.catalog.additionalProperties,false);
});
test('old native V6 source and path branches remain exact',async()=>{
  const old=await load('schemas/administrative-procedure-catalog-v6.schema.json');
  for(const key of ['path','qualificationPolicy','holidayBinding'])assert.deepEqual(schemas.catalog.$defs[key].oneOf.slice(0,old.$defs[key].oneOf.length),old.$defs[key].oneOf);
  assert.deepEqual(schemas.catalog.$defs.source,old.$defs.source);
});
test('native manifests differ only in their identities, title and catalogue descriptor mapping',async()=>{
  for(const name of ['manifest','localManifest']){
    const f=name==='manifest'?'release-manifest-v14.schema.json':'local-reference-manifest-v14.schema.json';
    const accepted=await load('schemas/candidates/ap23j2/'+f),actual=structuredClone(schemas[name]);
    actual.$id=accepted.$id;actual.properties.$schema.const=accepted.$id;actual.title=accepted.title;
    const items=actual.properties.artifacts.items,from=prefix+AP23J3_SCHEMA_FILES.catalog,to=accepted.properties.artifacts.items.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const;
    items.properties.schemaId.enum=items.properties.schemaId.enum.map(value=>value===from?to:value);
    items.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=to;
    assert.deepEqual(actual,accepted);
  }
});
test('actual native candidate catalogue and local manifest satisfy native draft2020 schemas',()=>{
  accepts(catalog,schemas.catalog);accepts(manifest,schemas.localManifest);rejects(manifest,schemas.manifest);
  assert.equal(catalog.contractStatus,'approved');assert.deepEqual(catalog.contractDecision,{id:'DEC-2026-039',status:'approved',on:'2026-10-27'});
  assert.equal(manifest.formatVersion,'14.0.0');assert.equal(manifest.compatibility.minimumConsumerFormatVersion,'14.0.0');assert.equal(manifest.releaseStatus,'candidate');
});
test('all physical resource schemas and roles remain unchanged in the native manifest',async()=>{
  const accepted=await load('outputs/ap23j2-candidate-2026-10-27/bundle/manifest.json');
  for(const descriptor of manifest.artifacts){
    const old=accepted.artifacts.find(row=>row.path===descriptor.path);
    assert.equal(descriptor.contentId,old.contentId);assert.equal(descriptor.role,old.role);
    if(descriptor.role!=='administrativeProcedureCatalog')assert.equal(descriptor.schemaId,old.schemaId);
    else assert.equal(descriptor.schemaId,prefix+AP23J3_SCHEMA_FILES.catalog);
  }
});
test('local candidate cannot acquire export, source or operating permission from native identity',()=>{
  const e=manifest.extensions['steimer.local-reference'];assert.equal(e.workPackage,'AP23J3');
  for(const key of ['productionActivation','sourceReleaseApproved','calendarExportEnabled'])assert.equal(e[key],false);
  assert.equal(catalog.runtimeActive,false);assert.equal(catalog.releaseBinding.status,'candidate');
  assert.equal(catalog.releaseBinding.releaseId,null);assert.deepEqual(catalog.releaseBinding.targetComponentRefs,[]);
});
const original=catalog.sources.find(row=>row.sourceId==='JUD-AP23J1-JU-BGER2D55-2010');
test('exact historic source exception is retained without changing its accepted role',()=>{
  assert.equal(original.url,'http://relevancy.bger.ch/cgi-bin/JumpCGI?id=01.03.2011_2D_55/2010');
  assert.equal(original.kind,'judgment');accepts(original,fragment('sourceV7'));
  rejects(original,fragment('source'));
});
for(const[name,edit]of [
  ['foreign source',row=>row.sourceId='JUD-FOREIGN'],['wrong kind',row=>row.kind='statute'],
  ['different query',row=>row.url+='&redirect=elsewhere'],['other path',row=>row.url=row.url.replace('JumpCGI','Other')],
  ['unverified HTTPS relabel',row=>row.url=row.url.replace('http:','https:')]
])test('new schema does not broaden historic reference exception: '+name,()=>{
  const row=structuredClone(original);edit(row);rejects(row,fragment('sourceV7'));
});
test('candidate physical source bytes remain checked against actual native descriptors',async()=>{
  for(const descriptor of manifest.artifacts){
    const raw=await readFile(new URL(candidate+descriptor.path,root));
    assert.equal(raw.length,descriptor.byteLength);assert.equal(createHash('sha256').update(raw).digest('hex'),descriptor.sha256);
  }
});

