// SPDX-License-Identifier: AGPL-3.0-only
// Materialize the approved H2 meanings as new native schemas, never edit history.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const AP23H3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v5.schema.json',
  manifest:'schemas/release-manifest-v12.schema.json',localManifest:'schemas/implementation/ap23h3/local-reference-manifest-v12.schema.json'};
const inputs={catalog:['schemas/candidates/ap23h2/administrative-procedure-catalog-v5.schema.json','0840debc2b59f1dcfeeebb59a86513a00d43eba23a6bc36398f6b59358ef7628'],
  manifest:['schemas/candidates/ap23h2/release-manifest-v12.schema.json','d79ca721fd41618c0c5a2345bc08db38d4061e31c33dcf868a823b8ac1e772ee'],
  localManifest:['schemas/candidates/ap23h2/local-reference-manifest-v12.schema.json','05837c8baf773e8a9f7d7e59ff64684e5b20537cb32a912eb90978c25f2d1f3f']};
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function buildAP23H3Schemas(){
  const schemas={};
  for(const[key,[path,expected]]of Object.entries(inputs)){
    const raw=await readFile(resolve(root,path),'utf8');assert.equal(sha(raw),expected,`Accepted H2 schema ${path}`);
    const s=JSON.parse(raw),old=s.$id,next=prefix+AP23H3_SCHEMA_FILES[key];
    s.$id=next;s.properties.$schema.const=next;s.title=key==='catalog'?'Kantonalverfahrenskatalog 5 mit OW-/NW-Fallqualifikation':
      key==='manifest'?'Datenrelease Manifest 12':'AP23H3 lokaler Format-12-Referenzmanifest';
    if(key!=='catalog'){
      const item=s.properties.artifacts.items,oldCatalog=prefix+inputs.catalog[0],newCatalog=prefix+AP23H3_SCHEMA_FILES.catalog;
      item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===oldCatalog?newCatalog:id);
      item.allOf.find(x=>x.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=newCatalog;
    }
    if(key==='catalog'){
      // Only new OW/NW paths bind four active components. Historic paths keep three.
      const e=s.$defs.releasedPathEligibility;e.properties.targetComponentRefs.maxItems=4;
      e.allOf=[{if:{properties:{pathId:{pattern:'^(ow|nw)-'}}},then:{properties:{targetComponentRefs:{minItems:4,maxItems:4}}},else:{properties:{targetComponentRefs:{minItems:3,maxItems:3}}}}];
    }
    assert.notEqual(old,next);schemas[key]=s;
  }
  return schemas;
}
export async function materializeAP23H3Schemas(mode){
  const schemas=await buildAP23H3Schemas();
  for(const[k,s]of Object.entries(schemas)){
    const path=resolve(root,AP23H3_SCHEMA_FILES[k]),text=JSON.stringify(s,null,2)+'\n';
    if(mode==='write'){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
    else assert.equal(await readFile(path,'utf8'),text,`Native schema rebuild ${path}`);
  }
  return schemas;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv.includes('--write')?'write':'check';await materializeAP23H3Schemas(mode);
  console.log(JSON.stringify({mode,schemas:Object.values(AP23H3_SCHEMA_FILES),oldSchemasChanged:false}));
}
