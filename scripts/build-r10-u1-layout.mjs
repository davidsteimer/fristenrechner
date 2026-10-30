// SPDX-License-Identifier: AGPL-3.0-only
// Actual-package source-row layout fixture. No calculator execution or host claim.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const spfxRequire=createRequire(resolve(repo,'spfx/package.json'));
const postcss=spfxRequire('postcss'),sass=spfxRequire('sass-embedded');
export const layoutConfig=Object.freeze({workPackage:'R10-U1',output:'.work/r10-u1-layout',report:'outputs/r10-u1-2026-10-28/layout-build.json',
 source:'spfx/src/webparts/fristenrechner/components/Fristenrechner.module.scss',
 wrapper:'spfx/src/webparts/fristenrechner/components/Fristenrechner.tsx',
 compiled:'spfx/lib/webparts/fristenrechner/components/Fristenrechner.module.scss.css',
 package:'spfx/sharepoint/solution/fristenrechner-schweiz.sppkg',
 widths:[1120,400,373,320],languages:['de','fr'],label:'Datenquelle / Source des données:'});
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
export function validateStage(stage){assert.equal(typeof stage,'string');assert.match(stage,/^\.work\/r10-u1-spfx-build-[A-Za-z0-9]{6}$/u,'Only actual isolated R10-U1 stage');return stage;}
export function compileSourceScss(path=resolve(repo,layoutConfig.source)){return sass.compile(path,{style:'expanded',sourceMap:false}).css;}
export function assertLayoutContract(css,classes={host:'host',row:'runtimeStatus'}){
 const ast=postcss.parse(css),normal=value=>value.replace(/\s+/gu,'');
 function declaration(selector,property,{media=false}={}){
  const values=[];ast.walkRules(rule=>{if(!rule.selector.split(',').map(normal).includes(normal(selector)))return;
   const inMedia=rule.parent.type==='atrule'&&rule.parent.name==='media'&&normal(rule.parent.params)==='(max-width:640px)';
   if(inMedia!==media)return;rule.walkDecls(property,item=>values.push(item.value));});
  assert.equal(values.length,1,'Exactly one '+selector+' '+property+' media='+media);return normal(values[0]);
 }
 const host='.'+classes.host,row='.'+classes.row;
 assert.equal(declaration(host,'box-sizing'),'border-box');assert.equal(declaration(host,'overflow'),'hidden');
 for(const[property,value]of Object.entries({'box-sizing':'border-box',display:'flex','flex-wrap':'wrap','align-items':'baseline','min-width':'0','max-width':'100%'}))
  assert.equal(declaration(row,property),value,'Source row '+property);
 for(const selector of[row+' > span',row+' code'])for(const[property,value]of Object.entries({'min-width':'0','max-width':'100%','overflow-wrap':'anywhere','white-space':'normal'}))
  assert.equal(declaration(selector,property),value,'Source child '+selector+' '+property);
 assert.equal(declaration(row,'width',{media:true}),'100%');assert.equal(declaration(row,'margin-left',{media:true}),'0');assert.equal(declaration(row,'margin-right',{media:true}),'0');
 assert.equal(declaration(row,'padding',{media:true}),'014px');
 return{boxSizing:true,wrapping:true,baselineAlignment:true,childBreaking:true,smallViewportPadding:true};
}
export function findElement(node,predicate){
 if(Array.isArray(node)){for(const item of node){const found=findElement(item,predicate);if(found)return found;}}
 else if(node&&typeof node==='object'&&node.props){if(predicate(node))return node;return findElement(node.props.children,predicate);}
 return undefined;
}
export function serializeRow(node){
 assert.ok(node&&['div','span','code'].includes(node.type),'Only actual source-row tags');
 const allowed=new Set(['children','className']);for(const key of Object.keys(node.props))assert.ok(allowed.has(key),'No unexpected row property '+key);
 const children=Array.isArray(node.props.children)?node.props.children:[node.props.children];
 return '<'+node.type+(node.props.className?' class="'+escapeHtml(node.props.className)+'"':'')+'>'+
  children.map(item=>item===null||item===undefined||item===false?'':typeof item==='object'?serializeRow(item):escapeHtml(item)).join('')+'</'+node.type+'>';
}
export function extractPackagedCss(bundle,hostClass){
 assert.match(hostClass,/^[A-Za-z_][A-Za-z0-9_-]*$/u);const marker='" .'+hostClass+'{';
 const start=bundle.indexOf(marker.replace('" ','"'));assert.ok(start>=0,'Actual hashed host CSS string is embedded in AMD bundle');let escaped=false,end=-1;
 for(let index=start+1;index<bundle.length;index++){const char=bundle[index];if(escaped){escaped=false;continue;}if(char==='\\'){escaped=true;continue;}if(char==='"'){end=index;break;}}
 assert.ok(end>start,'Complete package CSS literal');const css=JSON.parse(bundle.slice(start,end+1));assert.ok(css.startsWith('.'+hostClass+'{'));return css;
}
export function packagedLayoutSnapshot(host,providerLabel){
 // This direct state fixture only reaches renderCalculator's static wrapper.
 // The FristenrechnerApp element is never invoked and no release is approved.
 host.host.props={...host.host.props,providerLabel};
 host.host.state={...host.host.state,loadedConfigurationKey:host.host.props.configurationKey,status:'ready',
  calculationData:{__syntheticNonCalculatingLayoutFixture:true}};
 const tree=host.host.render();assert.equal(tree.type,'section');const hostClass=tree.props.className;assert.match(hostClass,/^host_[a-f0-9]+$/u);
 const row=findElement(tree,node=>node.type==='div'&&Array.isArray(node.props.children)&&node.props.children[0]?.type==='span'
  &&node.props.children[0].props.children===layoutConfig.label&&node.props.children[1]?.type==='code');
 assert.ok(row,'Actual source-row span/code markup required');assert.equal(row.props.children.length,2);assert.equal(row.props.children[1].props.children,providerLabel);
 const rowClass=row.props.className;assert.match(rowClass,/^runtimeStatus_[a-f0-9]+$/u);assert.equal(hostClass.slice(5),rowClass.slice(14),'Actual CSS module suffix matches');
 return{hostClass,rowClass,markup:serializeRow(row),bilingualLabel:row.props.children[0].props.children,providerLabel};
}
function browserMeasurementRunner(definitions){
 const output=document.getElementById('r10-measurements');
 let queued=false;
 function rectangle(element){
  if(!element)return null;
  const value=element.getBoundingClientRect();
  return{x:value.x,y:value.y,left:value.left,right:value.right,top:value.top,bottom:value.bottom,width:value.width,height:value.height};
 }
 function computed(element,frameWindow){
  if(!element)return null;
  const style=frameWindow.getComputedStyle(element);
  return{display:style.display,flexWrap:style.flexWrap,boxSizing:style.boxSizing,overflowWrap:style.overflowWrap,whiteSpace:style.whiteSpace,minWidth:style.minWidth,maxWidth:style.maxWidth};
 }
 function measure(definition){
  try{
   const frame=document.querySelector('iframe[data-r10-frame="'+definition.id+'"]');
   const frameWindow=frame&&frame.contentWindow,frameDocument=frame&&frame.contentDocument;
   if(!frameWindow||!frameDocument||frameDocument.readyState!=='complete')return{id:definition.id,status:'frame-not-ready'};
   const host=frameDocument.querySelector('.'+definition.hostClass),row=frameDocument.querySelector('.'+definition.rowClass);
   const span=row&&row.querySelector('span'),code=row&&row.querySelector('code');
   if(!host||!row||!span||!code)return{id:definition.id,status:'package-row-not-found'};
   const h=rectangle(host),r=rectangle(row),l=rectangle(span),c=rectangle(code),rowStyle=computed(row,frameWindow),codeStyle=computed(code,frameWindow);
   return{id:definition.id,viewportWidth:frameWindow.innerWidth,documentScrollWidth:frameDocument.documentElement.scrollWidth,
    host:{left:h.left,right:h.right,top:h.top,bottom:h.bottom},
    row:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,scrollWidth:row.scrollWidth,clientWidth:row.clientWidth},
    label:{left:l.left,right:l.right,bottom:l.bottom,text:span.textContent},
    code:{left:c.left,right:c.right,bottom:c.bottom,text:code.textContent,scrollWidth:code.scrollWidth,clientWidth:code.clientWidth},
    styles:{flexWrap:rowStyle.flexWrap,boxSizing:rowStyle.boxSizing,overflowWrap:codeStyle.overflowWrap}};
  }catch(error){return{id:definition.id,status:'measurement-read-error',error:String(error)};}
 }
 function collect(){
  queued=false;
  const cases=definitions.map(measure);
  output.textContent=JSON.stringify({status:cases.every(item=>Object.hasOwn(item,'viewportWidth'))?'measured-awaiting-judgment':'waiting-or-partial-measurements',cases},null,2);
 }
 function schedule(){
  if(queued)return;
  queued=true;
  window.requestAnimationFrame(()=>window.requestAnimationFrame(collect));
 }
 for(const definition of definitions){
  const frame=document.querySelector('iframe[data-r10-frame="'+definition.id+'"]');
  frame.addEventListener('load',()=>{
   frame.contentWindow.addEventListener('resize',schedule);
   if(frame.contentDocument.fonts)frame.contentDocument.fonts.ready.then(schedule);
   schedule();
  });
 }
 window.addEventListener('resize',schedule);
 schedule();
}
export function makeMeasurementScript(cases){
 const definitions=cases.map(({id,locale,viewportWidthCssPixels,hostClass,rowClass})=>({id,locale,viewportWidthCssPixels,hostClass,rowClass}));
 for(const item of definitions){assert.match(item.id,/^(?:de|fr)-(?:1120|400|373|320)$/u);assert.match(item.hostClass,/^host_[a-f0-9]+$/u);assert.match(item.rowClass,/^runtimeStatus_[a-f0-9]+$/u);}
 return '('+browserMeasurementRunner.toString()+')('+JSON.stringify(definitions)+');';
}
const labels={
 de:'SharePoint-Mirror · ausschliesslich synthetischer langer Prüfpfad /lokale-layoutprobe/'+('ununterbrochener-datenquellenbezeichner-'.repeat(12))+'manifest.json',
 fr:'Miroir SharePoint · chemin long exclusivement synthétique /verification-locale/'+('designation-ininterrompue-source-donnees-'.repeat(12))+'manifest.json'
};
export async function buildLayout({root=repo,stage}={}){
 validateStage(stage);root=resolve(root);const absoluteStage=resolve(root,stage);
 const verification=JSON.parse(await readFile(resolve(absoluteStage,'verification.json')));assert.equal(verification.workPackage,'R10-U1');assert.equal(verification.status,'passed');assert.equal(verification.localOnly,true);
 assert.equal(verification.stage,stage);assert.equal(verification.deployable,false);assert.equal(verification.operatingPackagePreserved,true);assert.equal(verification.steps.length,7);for(const step of verification.steps)assert.equal(step.exitCode,0);
 const verifiedPackageBytes=await readFile(resolve(absoluteStage,layoutConfig.package));assert.deepEqual(verification.testPackage,{path:stage+'/'+layoutConfig.package,byteLength:verifiedPackageBytes.length,sha256:sha256(verifiedPackageBytes)},'Exact package from verified isolated build');
 const source=await readFile(resolve(root,layoutConfig.source)),stageSource=await readFile(resolve(absoluteStage,layoutConfig.source));assert.deepEqual(stageSource,source,'Stage uses actual current source-row SCSS');
 const wrapper=await readFile(resolve(root,layoutConfig.wrapper)),stageWrapper=await readFile(resolve(absoluteStage,layoutConfig.wrapper));assert.deepEqual(stageWrapper,wrapper,'Stage uses unchanged actual wrapper');
 const compiled=await readFile(resolve(absoluteStage,layoutConfig.compiled));assertLayoutContract(compiled.toString());
 const harnessPath=resolve(absoluteStage,'spfx/test-build/package-harness.cjs'),require=createRequire(import.meta.url),harness=require(harnessPath),packagePath=resolve(absoluteStage,layoutConfig.package);
 const packaged=harness.readPackage(packagePath),snapshots={};for(const locale of layoutConfig.languages)snapshots[locale]=packagedLayoutSnapshot(harness.loadPackagedHost(packagePath),labels[locale]);
 assert.equal(snapshots.de.hostClass,snapshots.fr.hostClass);assert.equal(snapshots.de.rowClass,snapshots.fr.rowClass);
 const css=extractPackagedCss(packaged.bundle.toString('utf8'),snapshots.de.hostClass);assertLayoutContract(css,{host:snapshots.de.hostClass,row:snapshots.de.rowClass});
 const bind=async path=>{const bytes=await readFile(resolve(root,path));return{path,byteLength:bytes.length,sha256:sha256(bytes)};};
 const out=resolve(root,layoutConfig.output);await mkdir(out,{recursive:true});const generated=[];
 async function artifact(name,content){const path=layoutConfig.output+'/'+name;await writeFile(resolve(root,path),content);const descriptor=await bind(path);generated.push(descriptor);return descriptor;}
 await artifact('host.compiled.css',compiled);await artifact('host.packaged.css',css);
 const cases=[];
 for(const locale of layoutConfig.languages)for(const width of layoutConfig.widths){
  const id=locale+'-'+width,name=id+'.html',snapshot=snapshots[locale];
  const html='<!doctype html><html lang="'+locale+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+
   '<title>R10-U1 · '+id+' · tatsächliche Paketzeile</title><link rel="stylesheet" href="host.packaged.css">'+
   '<style>html,body{margin:0;padding:0}.fixture-content{height:56px;padding:12px;box-sizing:border-box;font:12px Segoe UI,Arial,sans-serif}</style></head>'+
   '<body data-r10-case="'+id+'"><section class="'+snapshot.hostClass+'"><div class="fixture-content">R10-U1 · '+locale.toUpperCase()+' · '+width+
   ' CSS-Pixel · nur Layoutprobe</div>'+snapshot.markup+'</section></body></html>\n';
  const descriptor=await artifact(name,html);cases.push({id,locale,viewportWidthCssPixels:width,artifact:descriptor,hostClass:snapshot.hostClass,rowClass:snapshot.rowClass,bilingualLabel:snapshot.bilingualLabel,providerLabel:snapshot.providerLabel});
 }
 const index='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>R10-U1 · Paketlayoutprobe</title>'+
  '<style>body{margin:20px;font:14px Segoe UI,Arial,sans-serif;background:#fff}iframe{display:block;border:1px solid #cad3d6;margin:8px 0 24px}h2{font-size:16px}#r10-measurements{max-width:1120px;white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body>'+
  '<h1>R10-U1 · tatsächliche SPFx-Paketzeile</h1><p>Lokale Breitenprobe. Kein Zoom-, Geräte-, M365- oder Berechnungsnachweis. Tatsächliches unverändertes Paketmarkup und tatsächliches Paket-CSS. Die Providertexte sind synthetisch.</p>'+
  '<h2>Tatsächliche Browsermesswerte, noch nicht beurteilt</h2><pre id="r10-measurements" aria-live="polite">{"status":"waiting-for-frames","cases":[]}</pre>'+
  cases.map(row=>'<h2>'+row.locale.toUpperCase()+' · '+row.viewportWidthCssPixels+' CSS-Pixel</h2><iframe data-r10-frame="'+row.id+'" title="'+row.id+'" src="'+row.id+'.html" width="'+row.viewportWidthCssPixels+'" height="480"></iframe>').join('')+
  '<script>'+makeMeasurementScript(cases)+'</script></body></html>\n';
 await artifact('index.html',index);
 const inputs=[layoutConfig.source,layoutConfig.wrapper,'scripts/build-r10-u1-layout.mjs','tests/hosts/r10-u1-layout.test.ts',
  stage+'/verification.json',stage+'/'+layoutConfig.source,stage+'/'+layoutConfig.wrapper,stage+'/'+layoutConfig.compiled,stage+'/'+layoutConfig.package,stage+'/spfx/test-build/package-harness.cjs'];
 const report={workPackage:'R10-U1',status:'built-awaiting-browser-measurement',localOnly:true,kind:'actual-package-static-layout-fixture',stage,
  package:await bind(stage+'/'+layoutConfig.package),bundle:{path:packaged.bundlePath,byteLength:packaged.bundle.length,sha256:sha256(packaged.bundle)},
  compiledCss:await bind(stage+'/'+layoutConfig.compiled),packagedCssSha256:sha256(Buffer.from(css)),cases,
  actualPackageMarkup:true,actualHashedClasses:true,actualPackagedCss:true,directSyntheticLayoutState:true,calculatorExecuted:false,syntheticApprovalCreated:false,
  measurementInstrumentation:{visibleElementId:'r10-measurements',trigger:'iframe load and window resize',automaticPassAssessment:false,actualPackageRowModified:false},
  widthsAreViewportCssPixels:true,zoomTest:false,realDeviceTest:false,m365HostTest:false,sourceReleaseApproved:false,operatingChanges:false,
  assertion:'Static render wrapper only. No calculator, provider refresh, deadline, browser measurement or real-host assertion.',
  bindings:await Promise.all(inputs.map(bind)),artifacts:generated};
 await mkdir(resolve(root,dirname(layoutConfig.report)),{recursive:true});await writeFile(resolve(root,layoutConfig.report),JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,3,'Exactly --stage=<isolated R10-U1 stage> required');assert.ok(process.argv[2].startsWith('--stage='));
 const report=await buildLayout({stage:process.argv[2].slice(8)});console.log(JSON.stringify({status:report.status,cases:report.cases.length,index:layoutConfig.output+'/index.html',package:report.package,compiledCss:report.compiledCss},null,2));
}

