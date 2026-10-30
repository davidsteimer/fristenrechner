// SPDX-License-Identifier: AGPL-3.0-only
// Materialize the approved G2 meanings as new native schemas, never edit history.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const AP23G3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v4.schema.json',
  manifest:'schemas/release-manifest-v11.schema.json',localManifest:'schemas/implementation/ap23g3/local-reference-manifest-v11.schema.json'};
const inputs={catalog:['schemas/candidates/ap23g2/administrative-procedure-catalog-v4.schema.json','8cceae6a2407c1b28a7d4d020eb0772f94919d707eb019a5b44570efe2d96f7e'],
  manifest:['schemas/candidates/ap23g2/release-manifest-v11.schema.json','e34ae5bb84bc839233115b4e5b181ecfef770cfea195ea834e65fb9115ba7b21'],
  localManifest:['schemas/candidates/ap23g2/local-reference-manifest-v11.schema.json','b0c09d2be9279c6940a7c0099d33fa98c6535c359c79be1de0dfba0ce6cc7e0c']};
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function buildAP23G3Schemas(){
  const schemas={};
  for(const[key,[path,expected]]of Object.entries(inputs)){
    const raw=await readFile(resolve(root,path),'utf8');assert.equal(sha(raw),expected,`Accepted G2 schema ${path}`);
    const s=JSON.parse(raw),old=s.$id,next=prefix+AP23G3_SCHEMA_FILES[key];
    s.$id=next;s.properties.$schema.const=next;s.title=key==='catalog'?'Kantonalverfahrenskatalog 4 mit qualifizierten Eröffnungsketten':
      key==='manifest'?'Datenrelease Manifest 11':'AP23G3 lokaler Format-11-Referenzmanifest';
    if(key!=='catalog'){
      const item=s.properties.artifacts.items,oldCatalog=prefix+inputs.catalog[0],newCatalog=prefix+AP23G3_SCHEMA_FILES.catalog;
      item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===oldCatalog?newCatalog:id);
      item.allOf.find(x=>x.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=newCatalog;
    }
    assert.notEqual(old,next);schemas[key]=s;
  }
  return schemas;
}
export async function materializeAP23G3Schemas(mode){
  const schemas=await buildAP23G3Schemas();
  for(const[k,s]of Object.entries(schemas)){
    const path=resolve(root,AP23G3_SCHEMA_FILES[k]),text=JSON.stringify(s,null,2)+'\n';
    if(mode==='write'){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
    else assert.equal(await readFile(path,'utf8'),text,`Native schema rebuild ${path}`);
  }
  return schemas;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv.includes('--write')?'write':'check';await materializeAP23G3Schemas(mode);
  console.log(JSON.stringify({mode,schemas:Object.values(AP23G3_SCHEMA_FILES),oldSchemasChanged:false}));
}
