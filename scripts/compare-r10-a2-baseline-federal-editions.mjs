// Compare newly indexed XML editions with the formerly bound edition of the same law/date.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(path.join(root,'package.json'));
const {JSDOM}=require('jsdom');
const base='outputs/r10-a2-2026-10-28/baseline-federal';
const read=p=>fs.readFile(path.join(root,p));
const json=async p=>JSON.parse(await read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const binding=async p=>{const b=await read(p);return{path:p,sha256:hash(b),byteLength:b.length}};
const r=await json(base+'/retrievals.json');
const a=await json(base+'/content-comparison.json');
const cache=new Map();
const parse=async p=>{
 if(cache.has(p))return cache.get(p);
 const d=new JSDOM((await read(p)).toString(),{contentType:'text/xml'});
 const m={};
 for(const n of d.window.document.querySelectorAll('article')){const c=n.cloneNode(true);c.querySelectorAll('authorialNote').forEach(x=>x.remove());m[n.getAttribute('eId')]=c.textContent.replace(/\s+/g,' ').trim()}
 d.window.close();cache.set(p,m);return m;
};
const comparisons=[];
for(const f of a.families)for(const t of f.texts.filter(t=>t.available)){
 const key=f.work.replace('https://fedlex.data.admin.ch/eli/cc/','')+'/'+t.from.replaceAll('-','')+'/';
 for(const e of r.retrievals.filter(e=>e.baseline&&e.bodyKind==='akn-xml'&&e.url.includes('/eli/cc/'+key))){
  if(!/<akomaNtoso[\s>]|<akn:akomaNtoso[\s>]/.test((await read(e.baseline.path)).toString()))continue;
  const b=await parse(e.baseline.path),n=await parse(t.evidence.path);
  const changed=[...new Set([...Object.keys(b),...Object.keys(n)])].filter(id=>b[id]!==n[id]);
  comparisons.push({work:f.work,from:t.from,oldEvidence:e.baseline,currentEvidence:t.evidence,wholeBytesEqual:hash(await read(e.baseline.path))===t.evidence.sha256,
   changedArticleIds:changed,usedArticleChanges:changed.filter(id=>f.usedArticles.some(x=>x.number===id.replace(/^art_/,'').replaceAll('_',''))),changes:changed.map(id=>({articleId:id,before:b[id]??null,after:n[id]??null}))});
 }
}
const oldViews=a.indices.map(i=>({id:i.id,sameApplicabilityRows:JSON.stringify(i.added.map(x=>({work:x.work,version:x.version,start:x.start,from:x.from,end:x.end,to:x.to})))===JSON.stringify(i.removed.map(x=>({work:x.work,version:x.version,start:x.start,from:x.from,end:x.end,to:x.to})))}));
const result={reviewId:'R10-A2-BASELINE-federal-same-version-edition-comparison',checkedOn:'2026-10-28',recordStatus:'mechanical-comparison-awaiting-legal-assessment',humanApproval:false,sourceReleaseApproved:false,
 normalisation:'article text by eId after removal of authorialNote and whitespace normalisation',indexApplicabilityChecks:oldViews,comparisons,
 currentComparisonBinding:await binding(base+'/content-comparison.json'),limits:['No claim that footnotes or editorial annotations are unchanged.','A current XML edition is compared to the originally retrieved edition, not silently substituted for its original date.']};
await fs.writeFile(path.join(root,base+'/edition-comparison.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({count:comparisons.length,applicability:oldViews,changed:comparisons.filter(c=>c.changedArticleIds.length)},null,2));
