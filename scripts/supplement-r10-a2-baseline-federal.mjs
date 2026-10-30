// Narrow official KVG amendment supplement following the observed XML-edition difference.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='outputs/r10-a2-2026-10-28/baseline-federal';
const hash=b=>createHash('sha256').update(b).digest('hex');
const url='https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/oc/2025/769/de/xml/fedlex-data-admin-ch-eli-oc-2025-769-de-xml.xml';
const retrievedAt=new Date().toISOString();
const r=await fetch(url,{signal:AbortSignal.timeout(45000)});
const b=new Uint8Array(await r.arrayBuffer());
const file=base+'/raw/097-KVG-AS-2025-769.response';
await fs.writeFile(path.join(root,file),b,{flag:'wx'});
const record={reviewId:'R10-A2-BASELINE-KVG-edition-supplement',checkedOn:'2026-10-28',humanApproval:false,sourceReleaseApproved:false,sourceIds:['SRC-AP19C3-KVG-20260101','SRC-AP19C3-KVG-20260701'],
 retrievedAt,url,finalUrl:r.url,status:r.status,headers:Object.fromEntries(r.headers),path:file,sha256:hash(b),byteLength:b.length,
 role:'Fresh official amending act to distinguish an indexed consolidation-edition discrepancy from a newly enacted rule.'};
await fs.writeFile(path.join(root,base+'/kvg-supplement.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(record));
