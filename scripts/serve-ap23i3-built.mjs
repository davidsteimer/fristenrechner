// SPDX-License-Identifier: AGPL-3.0-only
// Serve already built local I3 bytes without rebuilding while artefact tests run.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','.work/public-ap23i3');
const base='/fristenrechner/',host='127.0.0.1',port=8806;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
await stat(resolve(root,'index.html'));
createServer(async(request,response)=>{
  const url=new URL(request.url,'http://'+host+':'+port);
  if(url.pathname==='/'){response.writeHead(302,{location:base});response.end();return;}
  if(!url.pathname.startsWith(base)){response.writeHead(404);response.end();return;}
  try{
    const path=resolve(root,decodeURIComponent(url.pathname.slice(base.length)||'index.html'));
    if(!path.startsWith(root+sep)){response.writeHead(400);response.end();return;}
    if(!(await stat(path)).isFile())throw Error('Not a file');
    const bytes=await readFile(path);
    response.writeHead(200,{'content-type':types[extname(path)]??'application/octet-stream','cache-control':'no-store'});
    response.end(bytes);
  }catch{response.writeHead(404);response.end();}
}).listen(port,host,()=>process.stdout.write('Read-only AP23I3 preview: http://'+host+':'+port+base+'\n'));
