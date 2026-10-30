// SPDX-License-Identifier: AGPL-3.0-only
// Read-only local static preview, no build or hosting mutation.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..'),host='127.0.0.1',port=8812;
const roots=[['/fristenrechner/',resolve(repo,'.work/public-r10-u1')],['/layout/',resolve(repo,'.work/r10-u1-layout')]];
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
await stat(resolve(roots[0][1],'index.html'));
createServer(async(req,res)=>{const url=new URL(req.url,'http://'+host+':'+port);if(url.pathname==='/'){res.writeHead(302,{location:'/fristenrechner/'});res.end();return;}
 const selected=roots.find(([base])=>url.pathname.startsWith(base));if(!selected){res.writeHead(404);res.end();return;}
 try{const[base,root]=selected,path=resolve(root,decodeURIComponent(url.pathname.slice(base.length)||'index.html'));if(!path.startsWith(root+sep))throw Error('Closed path');if(!(await stat(path)).isFile())throw Error('File required');const bytes=await readFile(path);res.writeHead(200,{'content-type':types[extname(path)]??'application/octet-stream','cache-control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end();}
}).listen(port,host,()=>process.stdout.write('Read-only R10-U1: http://'+host+':'+port+'/fristenrechner/ and /layout/\n'));
