// SPDX-License-Identifier: AGPL-3.0-only
// Accepted L2 contracts become separate native L3 schemas. No historical edit.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
export const AP23L3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v9.schema.json',manifest:'schemas/release-manifest-v16.schema.json',
  localManifest:'schemas/implementation/ap23l3/local-reference-manifest-v16.schema.json'};
const inputs={catalog:['schemas/candidates/ap23l2/administrative-procedure-catalog-v9.schema.json','2a6caf2a28a654ef1b3f4659096f5ac45f38e3506f889c25b310155da0f63fea'],
  manifest:['schemas/candidates/ap23l2/release-manifest-v16.schema.json','2f169cb6bea8c7699b23b431a4966350f60a89e70230a87030aa4a80c816fd9f'],
  localManifest:['schemas/candidates/ap23l2/local-reference-manifest-v16.schema.json','9dfe0ce022fc93134bb4e2bb8e1d795b4dcdd98a745145f0f24c6dfc38f295fb']};
export async function buildAP23L3Schemas(){
  const schemas={};
  for(const [key,[source,sha]] of Object.entries(inputs)){
    const raw=await readFile(resolve(root,source));assert.equal(hash(raw),sha,'Accepted L2 schema '+source);
    const value=JSON.parse(raw);value.$id=prefix+AP23L3_SCHEMA_FILES[key];value.properties.$schema.const=value.$id;
    value.title=key==='catalog'?'Kantonalverfahrenskatalog 9 mit qualifizierter AI-Eröffnung und SZ-Endergänzung':
      key==='manifest'?'Datenrelease Manifest 16':'AP23L3 lokaler Format 16 Referenzmanifest';
    if(key!=='catalog'){
      const item=value.properties.artifacts.items,old=prefix+inputs.catalog[0],native=prefix+AP23L3_SCHEMA_FILES.catalog;
      item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===old?native:id);
      item.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=native;
    }
    schemas[key]=value;
  }
  return schemas;
}
export async function materializeAP23L3Schemas(mode){
  for(const [key,value] of Object.entries(await buildAP23L3Schemas())){
    const target=resolve(root,AP23L3_SCHEMA_FILES[key]),text=JSON.stringify(value,null,2)+'\n';
    if(mode==='write'){await mkdir(dirname(target),{recursive:true});await writeFile(target,text);}
    else assert.equal(await readFile(target,'utf8'),text,'Native L3 schema '+target);
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(['--write','--check'].includes(process.argv[2]));await materializeAP23L3Schemas(process.argv[2]==='--write'?'write':'check');
  console.log(JSON.stringify({schemas:Object.values(AP23L3_SCHEMA_FILES),historicalSchemasChanged:false}));
}

