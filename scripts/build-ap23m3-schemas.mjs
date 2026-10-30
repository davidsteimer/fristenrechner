// SPDX-License-Identifier: AGPL-3.0-only
// Accepted M2 contracts become separate native M3 schemas. Historical bytes stay unchanged.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
export const AP23M3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v10.schema.json',manifest:'schemas/release-manifest-v17.schema.json',
 localManifest:'schemas/implementation/ap23m3/local-reference-manifest-v17.schema.json',input:'schemas/implementation/ap23m3/administrative-input-v10.schema.json'};
const inputs={catalog:['schemas/candidates/ap23m2/administrative-procedure-catalog-v10.schema.json','8a9c4fb6cccfc6d82f422572254c8ca2f2b0afc5f96925c2839dc45046d7b858'],
 manifest:['schemas/candidates/ap23m2/release-manifest-v17.schema.json','65ad53ebc03b0fbd2a7e84e654ea7c29815191fb2a922eaa014ca3b7849aaa50'],
 localManifest:['schemas/candidates/ap23m2/local-reference-manifest-v17.schema.json','ce52a008b7ed510e892403bc2c9c6994eabb8df37d1857812b5c70da3dce7565'],
 input:['schemas/candidates/ap23m2/administrative-input-v10.schema.json','6258c6b9833a6f9ed2ac02e3ae60bae1bc3c451726b6606c9b376fd94ced9b36']};
export async function buildAP23M3Schemas(){
 const schemas={};
 for(const[key,[source,sha]]of Object.entries(inputs)){
  const raw=await readFile(resolve(root,source));assert.equal(hash(raw),sha,'Accepted M2 schema '+source);
  const value=JSON.parse(raw);value.$id=prefix+AP23M3_SCHEMA_FILES[key];
  if(key==='input'){value.title='AP23M3 explicit current NE/VD/VS facts';schemas[key]=value;continue;}
  value.properties.$schema.const=value.$id;
  value.title=key==='catalog'?'Kantonalverfahrenskatalog 10 NE VD VS':key==='manifest'?'Datenrelease Manifest 17':'AP23M3 lokaler Format17 Referenzmanifest';
  if(key!=='catalog'){
   const item=value.properties.artifacts.items,old=prefix+inputs.catalog[0],native=prefix+AP23M3_SCHEMA_FILES.catalog;
   item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===old?native:id);
   item.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=native;
  }
  schemas[key]=value;
 }
 return schemas;
}
export async function materializeAP23M3Schemas(mode){
 for(const[key,value]of Object.entries(await buildAP23M3Schemas())){
  const path=resolve(root,AP23M3_SCHEMA_FILES[key]),text=JSON.stringify(value,null,2)+'\n';
  if(mode==='write'){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
  else assert.equal(await readFile(path,'utf8'),text,'Native M3 schema '+path);
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.ok(['--write','--check'].includes(process.argv[2]));await materializeAP23M3Schemas(process.argv[2]==='--write'?'write':'check');
 console.log(JSON.stringify({schemas:Object.values(AP23M3_SCHEMA_FILES),historicalSchemasChanged:false}));
}
