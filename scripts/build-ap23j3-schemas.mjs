// SPDX-License-Identifier: AGPL-3.0-only
// Approved J2 meanings become new native schemas. Accepted inputs stay immutable.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const prefix='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const AP23J3_SCHEMA_FILES={catalog:'schemas/administrative-procedure-catalog-v7.schema.json',manifest:'schemas/release-manifest-v14.schema.json',
  localManifest:'schemas/implementation/ap23j3/local-reference-manifest-v14.schema.json'};
const inputs={catalog:['schemas/candidates/ap23j2/administrative-procedure-catalog-v7.schema.json','5702d9739f6ff6a826887d8f44686244fc00ea2dbdb7f06784367bb6c5f087f5'],
  manifest:['schemas/candidates/ap23j2/release-manifest-v14.schema.json','0f0d935899c1d05b4865f70d7a4903f87481ceab04092b16b4492ae96f869712'],
  localManifest:['schemas/candidates/ap23j2/local-reference-manifest-v14.schema.json','0eccb68ad0484b7e50b2ee8cc0227ff6adc9199c99e4ea97235fa0b3decb4dc3']};
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function buildAP23J3Schemas(){
  const schemas={};
  for(const[key,[path,expected]]of Object.entries(inputs)){
    const raw=await readFile(resolve(root,path),'utf8');assert.equal(sha(raw),expected,'Accepted J2 schema '+path);
    const s=JSON.parse(raw);s.$id=prefix+AP23J3_SCHEMA_FILES[key];s.properties.$schema.const=s.$id;
    s.title=key==='catalog'?'Kantonalverfahrenskatalog 7 mit qualifizierten Auslösern und Genfer Eröffnungsauflösung':
      key==='manifest'?'Datenrelease Manifest 14':'AP23J3 lokaler Format-14-Referenzmanifest';
    if(key!=='catalog'){
      const item=s.properties.artifacts.items,oldCatalog=prefix+inputs.catalog[0],newCatalog=prefix+AP23J3_SCHEMA_FILES.catalog;
      item.properties.schemaId.enum=item.properties.schemaId.enum.map(id=>id===oldCatalog?newCatalog:id);
      item.allOf.find(x=>x.if?.properties?.role?.const==='administrativeProcedureCatalog').then.properties.schemaId.const=newCatalog;
    }
    schemas[key]=s;
  }
  return schemas;
}
export async function materializeAP23J3Schemas(mode){
  const schemas=await buildAP23J3Schemas();
  for(const[key,value]of Object.entries(schemas)){
    const path=resolve(root,AP23J3_SCHEMA_FILES[key]),text=JSON.stringify(value,null,2)+'\n';
    if(mode==='write'){await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
    else assert.equal(await readFile(path,'utf8'),text,'Native schema rebuild '+path);
  }
  return schemas;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv.includes('--write')?'write':'check';await materializeAP23J3Schemas(mode);
  console.log(JSON.stringify({mode,schemas:Object.values(AP23J3_SCHEMA_FILES),oldSchemasChanged:false}));
}

