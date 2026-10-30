// SPDX-License-Identifier: AGPL-3.0-only
// Accepted K2 contracts become separate native K3 schemas. No historical edit.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
export const AP23K3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v8.schema.json',manifest:'schemas/release-manifest-v15.schema.json',
  localManifest:'schemas/implementation/ap23k3/local-reference-manifest-v15.schema.json'};
const inputs={catalog:['schemas/candidates/ap23k2/administrative-procedure-catalog-v8.schema.json','afcc5fb6c6f668d844ce1b2b1a1dc05d64c92a51e4e188ed7feb71d93d53068a'],
  manifest:['schemas/candidates/ap23k2/release-manifest-v15.schema.json','8b70cdb02eaa8670a963ea647955575d6f115810768e81267c92e1639fbd06cd'],
  localManifest:['schemas/candidates/ap23k2/local-reference-manifest-v15.schema.json','ac0f8df129762d44beab41a7b56c011b05ac3df2bf8aec1a7ab7ab011a92c090']};
export async function buildAP23K3Schemas(){
  const schemas={};
  for(const [key,[source,sha]] of Object.entries(inputs)){
    const raw=await readFile(resolve(root,source));assert.equal(hash(raw),sha,'Accepted K2 schema '+source);
    const value=JSON.parse(raw);value.$id=prefix+AP23K3_SCHEMA_FILES[key];value.properties.$schema.const=value.$id;
    value.title=key==='catalog'?'Kantonalverfahrenskatalog 8 mit dynamischem Feiertagsanker und jährlichen Büroschliesstagen':
      key==='manifest'?'Datenrelease Manifest 15':'AP23K3 lokaler Format 15 Referenzmanifest';
    if(key!=='catalog'){
      const item=value.properties.artifacts.items,old=prefix+inputs.catalog[0],native=prefix+AP23K3_SCHEMA_FILES.catalog;
      item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===old?native:id);
      item.allOf.find(row=>row.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=native;
    }
    schemas[key]=value;
  }
  return schemas;
}
export async function materializeAP23K3Schemas(mode){
  for(const [key,value] of Object.entries(await buildAP23K3Schemas())){
    const target=resolve(root,AP23K3_SCHEMA_FILES[key]),text=JSON.stringify(value,null,2)+'\n';
    if(mode==='write'){await mkdir(dirname(target),{recursive:true});await writeFile(target,text);}
    else assert.equal(await readFile(target,'utf8'),text,'Native K3 schema '+target);
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert.ok(['--write','--check'].includes(process.argv[2]));await materializeAP23K3Schemas(process.argv[2]==='--write'?'write':'check');
  console.log(JSON.stringify({schemas:Object.values(AP23K3_SCHEMA_FILES),historicalSchemasChanged:false}));
}
