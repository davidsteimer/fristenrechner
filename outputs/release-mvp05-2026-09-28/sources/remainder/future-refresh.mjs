import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const here=new URL('.',import.meta.url);
const cc=(work,date)=>`https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/${work}/${date}/de/xml/fedlex-data-admin-ch-eli-cc-${work.replaceAll('/','-')}-${date}-de-xml.xml`;
const targets=[
 ['VwVG-20270101.xml',cc('1969/737_757_755','20270101')],
 ['VPR-20270701.xml',cc('1978/712_712_712','20270701')],
 ['AS-2026-232.xml','https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/oc/2026/232/de/xml/fedlex-data-admin-ch-eli-oc-2026-232-de-xml.xml'],
 ['AS-2025-314.xml','https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/oc/2025/314/de/xml/fedlex-data-admin-ch-eli-oc-2025-314-de-xml.xml'],
 ['BBl-2025-2891.xml','https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/fga/2025/2891/de/xml/fedlex-data-admin-ch-eli-fga-2025-2891-de-xml.xml'],
];
const results=await Promise.all(targets.map(async([file,url])=>{
 const row={file,url,checkedAt:new Date().toISOString()};
 try {const response=await fetch(url,{signal:AbortSignal.timeout(30000)});const bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(new URL(file,here),bytes);Object.assign(row,{status:response.status,bytes:bytes.length,contentType:response.headers.get('content-type'),sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}catch(error){row.error=String(error);}
 return row;
}));
await fs.writeFile(new URL('future-fetch-results.json',here),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
