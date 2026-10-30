// SPDX-License-Identifier: AGPL-3.0-only
// CSS compilation and unchanged wrapper contract. Actual package mode is explicit.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import test from 'node:test';
import ts from 'typescript';
import vm from 'node:vm';
const {layoutConfig,compileSourceScss,assertLayoutContract,validateStage,escapeHtml,serializeRow,
 extractPackagedCss,packagedLayoutSnapshot,makeMeasurementScript,sha256}=await import(new URL('../../scripts/build-r10-u1-layout.mjs',import.meta.url).href);
const source=readFileSync(layoutConfig.source,'utf8'),css=compileSourceScss(),wrapper=readFileSync(layoutConfig.wrapper,'utf8');
const guard=JSON.parse(readFileSync('outputs/r10-u1-2026-10-28/protected-inputs.json','utf8'));
test('R10-U1 source SCSS compiles through the actual SPFx sass-embedded dependency',()=>{assert.ok(css.length>500);assert.deepEqual(assertLayoutContract(css),{boxSizing:true,wrapping:true,baselineAlignment:true,childBreaking:true,smallViewportPadding:true});});
test('source stylesheet keeps the correction local to the own source row',()=>{
 assert.match(source,/\.runtimeStatus\s*\{/u);assert.equal(source.includes(':global'),false);assert.equal(source.includes('!important'),false);
 assert.equal(sha256(readFileSync('src/ui/styles.css')),guard.files['src/ui/styles.css']);
 assert.equal(sha256(readFileSync(layoutConfig.wrapper)),guard.files[layoutConfig.wrapper],'No wrapper TSX mutation');
});
for(const[property,value]of[['box-sizing','border-box'],['flex-wrap','wrap'],['align-items','baseline'],['overflow-wrap','anywhere'],['white-space','normal']])
 test('compiled CSS contract detects removal of '+property,()=>{const changed=css.replace(new RegExp(property+':\\s*'+value+';','gu'),'');assert.notEqual(changed,css);assert.throws(()=>assertLayoutContract(changed));});
test('compiled CSS contract detects lost small-screen box padding',()=>{const changed=css.replace(/padding:\s*0 14px;/gu,'');assert.notEqual(changed,css);assert.throws(()=>assertLayoutContract(changed));});
test('compiled CSS contract detects lost min-width boundary',()=>{const changed=css.replace(/min-width:\s*0;/gu,'');assert.notEqual(changed,css);assert.throws(()=>assertLayoutContract(changed));});
test('compiled CSS contract detects lost max-width boundary',()=>{const changed=css.replace(/max-width:\s*100%;/gu,'');assert.notEqual(changed,css);assert.throws(()=>assertLayoutContract(changed));});
function nodes(){const result:ts.Node[]=[];const file=ts.createSourceFile(layoutConfig.wrapper,wrapper,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(node:ts.Node){result.push(node);ts.forEachChild(node,visit);}visit(file);return{file,result};}
function className(node:ts.JsxElement,file:ts.SourceFile){const attribute=node.openingElement.attributes.properties.find(item=>ts.isJsxAttribute(item)&&item.name.getText(file)==='className');
 return attribute&&ts.isJsxAttribute(attribute)&&attribute.initializer&&ts.isJsxExpression(attribute.initializer)?attribute.initializer.expression?.getText(file):undefined;}
test('unchanged TSX binds the source row to the exact CSS-module class',()=>{
 const{file,result}=nodes(),rows=result.filter((n):n is ts.JsxElement=>ts.isJsxElement(n)&&className(n,file)==='styles.runtimeStatus');assert.equal(rows.length,1);
 const row=rows[0];assert.ok(row);assert.equal(row.openingElement.tagName.getText(file),'div');const children=row.children.filter((n):n is ts.JsxElement=>ts.isJsxElement(n));
 assert.deepEqual(children.map(n=>n.openingElement.tagName.getText(file)),['span','code']);
 const label=children[0],code=children[1];assert.ok(label);assert.ok(code);
 assert.equal(label.children.filter(ts.isJsxText).map(n=>n.getText(file)).join('').trim(),layoutConfig.label);
 const expression=code.children.find(ts.isJsxExpression);assert.equal(expression?.expression?.getText(file),'this.props.providerLabel');
});
test('unchanged TSX binds its outer section to the actual host CSS class',()=>{const{file,result}=nodes(),hosts=result.filter((n):n is ts.JsxElement=>ts.isJsxElement(n)&&className(n,file)==='styles.host');assert.equal(hosts.length,1);const host=hosts[0];assert.ok(host);assert.equal(host.openingElement.tagName.getText(file),'section');});
test('layout cases are viewport widths, not simulated zoom or real-host claims',()=>{assert.deepEqual(layoutConfig.widths,[1120,400,373,320]);assert.deepEqual(layoutConfig.languages,['de','fr']);assert.equal(layoutConfig.output,'.work/r10-u1-layout');assert.equal(layoutConfig.widths.length*layoutConfig.languages.length,8);});
test('only an exact new isolated R10-U1 stage can be selected',()=>{assert.equal(validateStage('.work/r10-u1-spfx-build-aB1234'),'.work/r10-u1-spfx-build-aB1234');for(const value of['.work/ap23m3-spfx-build-aB1234','.work/r10-u1-spfx-build-../bad','/tmp/r10-u1-spfx-build-aB1234','.work/r10-u1-spfx-build-aB12345',''])assert.throws(()=>validateStage(value));});
test('actual CSS string extraction preserves escaped CSS bytes without evaluation',()=>{const original='.host_deadbeef{font-family:"Segoe UI";overflow:hidden}.runtimeStatus_deadbeef{display:flex}';assert.equal(extractPackagedCss('call('+JSON.stringify(original)+',true)','host_deadbeef'),original);});
test('CSS extraction rejects missing actual module class',()=>{assert.throws(()=>extractPackagedCss('call(".other{display:none}",true)','host_deadbeef'));});
test('row serialization escapes synthetic labels and retains actual class names',()=>{const row={type:'div',props:{className:'runtimeStatus_deadbeef',children:[{type:'span',props:{children:layoutConfig.label}},{type:'code',props:{children:'A<&"B'}}]}};assert.equal(serializeRow(row),'<div class="runtimeStatus_deadbeef"><span>Datenquelle / Source des données:</span><code>A&lt;&amp;&quot;B</code></div>');assert.equal(escapeHtml("<script>'"),'&lt;script&gt;&#39;');});
test('row serialization cannot inject unsupported tags or event handlers',()=>{assert.throws(()=>serializeRow({type:'script',props:{children:'bad'}}));assert.throws(()=>serializeRow({type:'code',props:{onClick(){},children:'bad'}}));});
test('layout snapshot reaches only the static wrapper, never a calculator function',()=>{
 let calculatorCalls=0;const app=()=>{calculatorCalls++;throw Error('Must not execute calculator');};
 const host={host:{props:{configurationKey:'current',providerLabel:''},state:{calculationData:{__syntheticNonCalculatingLayoutFixture:false}},render(){return{type:'section',props:{className:'host_deadbeef',children:[
  {type:app,props:{}},{type:'div',props:{className:'runtimeStatus_deadbeef',children:[{type:'span',props:{children:layoutConfig.label}},{type:'code',props:{children:this.props.providerLabel}}]}}]}};}}};
 const result=packagedLayoutSnapshot(host,'synthetic-long-label');assert.equal(result.hostClass,'host_deadbeef');assert.equal(result.rowClass,'runtimeStatus_deadbeef');assert.equal(calculatorCalls,0);
 assert.equal(host.host.state.calculationData.__syntheticNonCalculatingLayoutFixture,true);
});
const selected=process.env.R10_U1_LAYOUT_STAGE;
test('visible measurement instrument emits exact raw-value contract without judging overflow',()=>{
 const output={textContent:''},rowStyle={display:'flex',flexWrap:'wrap',boxSizing:'border-box',overflowWrap:'normal',whiteSpace:'normal',minWidth:'0px',maxWidth:'100%'},codeStyle={...rowStyle,overflowWrap:'anywhere'};
 const rectangle={x:3,y:4,left:3,right:1400,top:4,bottom:88,width:1397,height:84};
 const span={textContent:layoutConfig.label,getBoundingClientRect:()=>rectangle},code={textContent:'synthetic text',scrollWidth:555,clientWidth:333,getBoundingClientRect:()=>rectangle};
 const row={scrollWidth:1444,clientWidth:300,getBoundingClientRect:()=>rectangle,querySelector:(selector:string)=>selector==='span'?span:code};
 const host={getBoundingClientRect:()=>rectangle};const definitions=layoutConfig.languages.flatMap((locale:string)=>layoutConfig.widths.map((width:number)=>({id:locale+'-'+width,locale,viewportWidthCssPixels:width,hostClass:'host_deadbeef',rowClass:'runtimeStatus_deadbeef'})));
 const listeners:Record<string,()=>void>={};const frames=Object.fromEntries(definitions.map((definition:{id:string;viewportWidthCssPixels:number})=>[definition.id,{addEventListener(){},contentWindow:{innerWidth:definition.viewportWidthCssPixels,addEventListener(){},getComputedStyle:(element:unknown)=>element===code?codeStyle:rowStyle},contentDocument:{readyState:'complete',documentElement:{scrollWidth:1777},querySelector:(selector:string)=>selector==='.host_deadbeef'?host:row}}]));
 const document={getElementById:()=>output,querySelector:(selector:string)=>frames[selector.match(/data-r10-frame="([^"]+)"/u)![1]!]};
 const window={requestAnimationFrame:(callback:()=>void)=>callback(),addEventListener:(name:string,callback:()=>void)=>{listeners[name]=callback;}};
 new vm.Script(makeMeasurementScript(definitions)).runInNewContext({window,document});const result=JSON.parse(output.textContent);
 assert.deepEqual(Object.keys(result).sort(),['cases','status']);assert.equal(result.status,'measured-awaiting-judgment');assert.equal(result.cases.length,8);
 const first=result.cases[0];assert.deepEqual(Object.keys(first).sort(),['code','documentScrollWidth','host','id','label','row','styles','viewportWidth']);
 assert.equal(first.documentScrollWidth,1777);assert.equal(first.row.scrollWidth,1444);assert.equal(first.code.clientWidth,333);assert.equal(first.row.right,1400);
 assert.deepEqual(first.styles,{flexWrap:'wrap',boxSizing:'border-box',overflowWrap:'anywhere'});assert.equal(first.label.text,layoutConfig.label);assert.equal(first.code.text,'synthetic text');assert.equal(typeof listeners.resize,'function');
});
if(selected){
 validateStage(selected);const require=createRequire(import.meta.url),harness=require(resolve(selected,'spfx/test-build/package-harness.cjs')),packagePath=resolve(selected,layoutConfig.package);
 test('actual isolated stage CSS matches current SCSS and satisfies source-row contract',()=>{assert.deepEqual(readFileSync(resolve(selected,layoutConfig.source)),readFileSync(layoutConfig.source));assertLayoutContract(readFileSync(resolve(selected,layoutConfig.compiled),'utf8'));});
 test('actual package returns the existing bilingual span/code markup in DE and FR fixtures',()=>{for(const language of layoutConfig.languages){const snapshot=packagedLayoutSnapshot(harness.loadPackagedHost(packagePath),'synthetic-'+language+'-'+('x'.repeat(300)));assert.equal(snapshot.bilingualLabel,layoutConfig.label);assert.match(snapshot.markup,/^<div class="runtimeStatus_[a-f0-9]+">/u);}});
 test('actual packaged hashed CSS satisfies the same contract without remapping',()=>{const snapshot=packagedLayoutSnapshot(harness.loadPackagedHost(packagePath),'synthetic'),packaged=harness.readPackage(packagePath),actual=extractPackagedCss(packaged.bundle.toString('utf8'),snapshot.hostClass);assertLayoutContract(actual,{host:snapshot.hostClass,row:snapshot.rowClass});});
}

