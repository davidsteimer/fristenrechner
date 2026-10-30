// SPDX-License-Identifier: AGPL-3.0-only
// Approved I2 meanings become new native schemas. Accepted inputs stay immutable.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const AP23I3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v6.schema.json',manifest:'schemas/release-manifest-v13.schema.json',
  localManifest:'schemas/implementation/ap23i3/local-reference-manifest-v13.schema.json'};
const inputs={catalog:['schemas/candidates/ap23i2/administrative-procedure-catalog-v6.schema.json','0cd52008c2a50069dc286577e97bc4778a19fbd3e596cb603dd2b3eb79bc42df'],
  manifest:['schemas/candidates/ap23i2/release-manifest-v13.schema.json','09d10648b59a114252109f3730f9f8ea39f6bb241d6129bf6e960f9ad9f8383f'],
  localManifest:['schemas/candidates/ap23i2/local-reference-manifest-v13.schema.json','4d0e04bde48dda9d95c62b7be9b01aefc73856f125673fd72f8e4dc3ee6cfffa']};
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function buildAP23I3Schemas(){
  const schemas={};
  for(const[key,[path,expected]]of Object.entries(inputs)){
    const raw=await readFile(resolve(root,path),'utf8');assert.equal(sha(raw),expected,'Accepted I2 schema '+path);
    const s=JSON.parse(raw);s.$id=prefix+AP23I3_SCHEMA_FILES[key];s.properties.$schema.const=s.$id;
    s.title=key==='catalog'?'Kantonalverfahrenskatalog 6 mit konkretisierten Tagesfristen und Hinweiszweigen':
      key==='manifest'?'Datenrelease Manifest 13':'AP23I3 lokaler Format-13-Referenzmanifest';
    if(key!=='catalog'){
      const item=s.properties.artifacts.items,oldCatalog=prefix+inputs.catalog[0],newCatalog=prefix+AP23I3_SCHEMA_FILES.catalog;
      item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===oldCatalog?newCatalog:id);
      item.allOf.find(x=>x.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=newCatalog;
    }
    schemas[key]=s;
  }
  return schemas;
}
export async function materializeAP23I3Schemas(mode){
  const schemas=await buildAP23I3Schemas();
  for(const[key,value]of Object.entries(schemas)){
    const path=resolve(root,AP23I3_SCHEMA_FILES[key]),text=JSON.stringify(value,null,2)+'\n';
    if(mode==='write'){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
    else assert.equal(await readFile(path,'utf8'),text,'Native schema rebuild '+path);
  }
  return schemas;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv.includes('--write')?'write':'check';await materializeAP23I3Schemas(mode);
  console.log(JSON.stringify({mode,schemas:Object.values(AP23I3_SCHEMA_FILES),oldSchemasChanged:false}));
}
