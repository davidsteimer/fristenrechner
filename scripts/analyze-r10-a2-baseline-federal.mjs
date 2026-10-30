// Mechanical evidence comparison only. Does not create legal approval or alter product data.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const { JSDOM } = require('jsdom');
const base = 'outputs/r10-a2-2026-10-28/baseline-federal';
const hash = b => createHash('sha256').update(b).digest('hex');
const read = p => fs.readFile(path.join(root,p));
const json = async p => JSON.parse(await read(p));
const clean = s => s.replace(/\s+/g,' ').trim();
const canonical = v => JSON.stringify(Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))));
const report = await json(`${base}/retrievals.json`);
const binding = async p => { const b = await read(p); return {path:p,sha256:hash(b),byteLength:b.length}; };
const emit = async (p,v) => fs.writeFile(path.join(root,p),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const bs = async p => (await json(p)).results.bindings.map(b=>Object.fromEntries(Object.entries(b).map(([k,v])=>[k,v.value])));
const current = await bs(report.retrievals.find(r=>r.id==='r10-versions-scoped').path);
const impacts = await bs(report.retrievals.find(r=>r.id==='r10-impacts-scoped').path);
const indices = [];
for(const r of report.retrievals.filter(r=>r.bodyKind==='sparql-results'&&r.baseline)){
  const before=await bs(r.baseline.path), after=await bs(r.path);
  const a=new Set(before.map(canonical)),b=new Set(after.map(canonical));
  indices.push({id:r.id,evidence:await binding(r.path),originalEvidence:r.baseline,beforeRows:before.length,afterRows:after.length,
    added:after.filter(x=>!a.has(canonical(x))),removed:before.filter(x=>!b.has(canonical(x)))});
}
const usedByWork = {
 '63/837_843_843':['1','84'], '2002/510':['2','38','39','40','41','49','51','52','55','56','57','58','60','61'],
 '1959/827_857_845':['1','57a','69'], '1961/29_29_29':['73bis','73ter'], '1982/1676_1676_1676':['1'],
 '2007/804':['1','2','3','14','15','16','21'], '1982/2184_2184_2184':['1','20','31','42','51','100','101'],
 '1983/1205_1205_1205':['26','46','57b','66a','77','119','128'], '1995/1328_1328_1328':['1','1a','3','25','25a','53','54','61','64','64a','67','80','85','87','89'],
 '1952/1021_1046_1050':['1','17','18','24','16mbis','16sbis','16x'], '2005/187':['19','34','35i','35q'],
 '2008/51':['1','3','22'], '1952/823_843_839':['1','13','22','25'], '1952/896_916_912':['10'],
 '1993/3043_3043_3043':['1','22','23','24','25','26','27','104','105'], '1993/3080_3080_3080':['32a'],
 '2021/373':['1','18','19'], '2021/376':['38'], '2006/218':['44','45','46','47','48','100'],
 '1978/688_688_688':['21','29','77','79'], '1994/1340_1340_1340':['1'], '2010/267':['85','89','90','91','92'],
 '1978/712_712_712':['8a','8d','8e'], '1969/737_757_755':['20','21','21a','22','22a'], '2010/262':['138','142','143','144','145','146']
};
const parse = async p => {
 const d=new JSDOM((await read(p)).toString(),{contentType:'text/xml'});
 const result={};
 for(const a of d.window.document.querySelectorAll('article')){
   const c=a.cloneNode(true); c.querySelectorAll('authorialNote').forEach(n=>n.remove());
   const id=a.getAttribute('eId');
   result[id]={id,number:id.replace(/^art_/,'').replaceAll('_',''),text:clean(c.textContent)};
 }
 d.window.close(); return result;
};
const cache=new Map();
const articles=async p=>{if(!cache.has(p))cache.set(p,await parse(p));return cache.get(p)};
const diff=(a,b)=>[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>a[k]?.text!==b[k]?.text).sort();
const baselineComparisons=[];
for(const r of report.retrievals.filter(r=>r.bodyKind==='akn-xml'&&r.baseline)){
 const old=(await read(r.baseline.path)).toString();
 if(!/<akomaNtoso[\s>]|<akn:akomaNtoso[\s>]/.test(old)){
   baselineComparisons.push({id:r.id,kind:'newly-available-norm-XML-not-a-new-law-by-itself',previousKind:'not-norm-XML',evidence:await binding(r.path),originalEvidence:r.baseline});
   continue;
 }
 const a=await articles(r.baseline.path),b=await articles(r.path);
 baselineComparisons.push({id:r.id,kind:'article-body-comparison',wholeBytesEqual:r.wholeBytesEqual,beforeArticles:Object.keys(a).length,afterArticles:Object.keys(b).length,
   changedArticleIds:diff(a,b),evidence:await binding(r.path),originalEvidence:r.baseline});
}
const byUrl=new Map(report.retrievals.map(r=>[r.url,r]));
const families=[];
for(const work of report.works){
 const key=work.replace('https://fedlex.data.admin.ch/eli/cc/','');
 const versions=current.filter(v=>v.work===work);
 const texts=[];
 for(const v of versions){
  const r=byUrl.get(v.xml);
  const map=r?.bodyKind==='akn-xml'?await articles(r.path):null;
  texts.push({version:v.version,from:v.start,to:v.end??null,evidence:r?await binding(r.path):null,available:!!map,articleCount:map?Object.keys(map).length:0,map});
 }
 const deltas=[];
 for(let n=1;n<texts.length;n++){
  const a=texts[n-1],b=texts[n];
  const changes=a.map&&b.map?diff(a.map,b.map):null;
  deltas.push({from:a.from,to:b.from,comparable:!!changes,changedArticleIds:changes,usedArticleChanges:changes?.filter(id=>usedByWork[key].includes((b.map[id]??a.map[id]).number))??null,
    changes:changes?.map(id=>({articleId:id,before:a.map[id]?.text??null,after:b.map[id]?.text??null}))??null});
 }
 const usedArticles=usedByWork[key].map(n=>({number:n,versions:texts.map(t=>{const a=t.map?Object.values(t.map).find(a=>a.number===n):null;return{from:t.from,found:!!a,articleId:a?.id??null,normalizedTextSha256:a?hash(a.text):null,text:a?.text??null}})}));
 families.push({work,sourceIds:report.sourceIds.filter(id=>report.retrievals.some(r=>r.sourceIds.includes(id)&&r.url.includes('/eli/cc/'+key+'/'))),publishedVersions:versions,
   texts:texts.map(({map,...t})=>t),deltas,usedArticles,impactRows:impacts.filter(x=>x.work===work)});
}
const bj=report.retrievals.find(r=>r.id==='069-body.html');
const visible=async p=>{const d=new JSDOM((await read(p)).toString());d.window.document.querySelectorAll('script,style').forEach(n=>n.remove());const m=d.window.document.querySelector('main');assert.ok(m);const s=clean(m.textContent);d.window.close();return s;};
const bjBefore=await visible(bj.baseline.path),bjNow=await visible(bj.path);
const result={reviewId:'R10-A2-BASELINE-federal-content-comparison',checkedOn:'2026-10-28',recordStatus:'mechanical-comparison-awaiting-legal-assessment',humanApproval:false,sourceReleaseApproved:false,
 retrievalEvidence:await binding(`${base}/retrievals.json`),normalization:'article elements by eId, authorialNote removed, whitespace normalized. Not a comparison of every footnote or editorial metadata.',indices,baselineComparisons,families,
 BJ:{wholeBytesEqual:bj.wholeBytesEqual,visibleMainTextEqual:bjBefore===bjNow,normalizedVisibleMainSha256:hash(bjNow),currentVisibleText:bjNow,evidence:await binding(bj.path),originalEvidence:bj.baseline},
 limits:['No automatic legal assessment or approval from byte/metadata identity.','Article changes between already published versions may be historical, not newly discovered legal changes.']};
await emit(`${base}/content-comparison.json`,result);
console.log(JSON.stringify({indices:indices.map(x=>({id:x.id,added:x.added.length,removed:x.removed.length})),newlyAvailable:baselineComparisons.filter(x=>x.kind!=='article-body-comparison').map(x=>x.id),changedAgainstSamePriorXML:baselineComparisons.filter(x=>x.changedArticleIds?.length),families:families.map(x=>({work:x.work,versions:x.texts.map(t=>({from:t.from,available:t.available})),deltas:x.deltas.map(d=>({from:d.from,to:d.to,changed:d.changedArticleIds,used:d.usedArticleChanges}))})),bjEqual:result.BJ.visibleMainTextEqual},null,2));
