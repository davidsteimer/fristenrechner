// SPDX-License-Identifier: AGPL-3.0-only
// Research oracle only. No imports from product calculation, legal data or UI.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const fixture='docs/fachrecht/ap23m1/referenzfaelle.json';
const day=86400000;
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/u.test(value))return false;
 const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function add(value,count){assert.ok(validDate(value));return new Date(Date.parse(value+'T00:00:00Z')+count*day).toISOString().slice(0,10);}
const weekday=value=>new Date(value+'T00:00:00Z').getUTCDay();
const weekend=value=>[0,6].includes(weekday(value));
export function easter(year){
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
 h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return year+'-'+String(Math.floor(n/31)).padStart(2,'0')+'-'+String(n%31+1).padStart(2,'0');
}
export function holidays(name,year,suite){
 const rule=suite.calendars[name];assert.ok(rule,'Unknown research calendar '+name);
 const dates=new Set(rule.fixed.map(md=>year+'-'+md));
 for(const offset of rule.easterOffsets)dates.add(add(easter(year),offset));
 if(rule.federalFast||rule.federalFastMonday){let date=year+'-09-01';while(weekday(date)!==0)date=add(date,1);
  if(rule.federalFast)dates.add(add(date,14));if(rule.federalFastMonday)dates.add(add(date,15));}
 for(const date of rule.additionalDates??[])if(date.startsWith(year+'-'))dates.add(date);
 for(const value of dates)assert.ok(validDate(value));return dates;
}
export function paused(date,mode){
 if(mode==='none')return false;assert.ok(['three','threeWinterJan5'].includes(mode));
 const year=Number(date.slice(0,4)),md=date.slice(5),last=mode==='threeWinterJan5'?'01-05':'01-02';
 return md>='12-18'||md<=last||(md>='07-15'&&md<='08-15')||(date>=add(easter(year),-7)&&date<=add(easter(year),7));
}
const boundary=reason=>({outcome:'qualificationBoundaryProposed',reason});
const outside=()=>({outcome:'researchWindowBoundary',reason:'outsideReferenceWindow'});
const matches=(actual,req)=>req.oneOf?req.oneOf.some(value=>Object.is(actual,value)):Object.is(actual,req.value);
function allowedFacts(path){
 const keys=new Set();for(const current of [path]){
  const path=current;
  for(const req of path.requirements)keys.add(req.key);
  if(path.calendarBinding.type==='fact')keys.add(path.calendarBinding.fact);
  if(path.calendarBinding.type==='qualifiedAuthoritySeat')keys.add(path.calendarBinding.regionFact);
  if(path.opening){keys.add(path.opening.modeFact);if(path.opening.expectedServiceFact)keys.add(path.opening.expectedServiceFact);
   for(const req of path.opening.trackingRequirements??[])keys.add(req.key);}
  if(path.durationFact)keys.add(path.durationFact);
  if(path.durationBaseFact)keys.add(path.durationBaseFact);
 }return keys;
}
export function evaluate(item,suite){
 const path=suite.paths.find(path=>path.id===item.path);if(!path)return boundary('unknownResearchPath');
 if(!validDate(item.trigger))return boundary('invalidResearchDate');
 const facts=item.facts??{},allowed=allowedFacts(path);
 if(Object.keys(facts).some(key=>!allowed.has(key)))return boundary('unknownResearchFact');
 for(const req of path.requirements)if(!matches(facts[req.key],req))return boundary(req.reason);
 if(!Number.isSafeInteger(item.days)||item.days<1)return boundary('dayDurationNotSpecified');
 if(path.days!==null&&item.days!==path.days)return boundary('statutoryDurationMismatch');
 if(item.days<(path.minimumDays??1)||item.days>(path.maximumDays??Number.MAX_SAFE_INTEGER))return boundary('durationOutsideQualifiedRange');
 const longerThan=path.durationBaseFact?facts[path.durationBaseFact]:path.longerThanDays;
 if(path.durationFact&&(!Number.isSafeInteger(facts[path.durationFact])||facts[path.durationFact]!==item.days||!Number.isSafeInteger(longerThan)||item.days<=longerThan))return boundary('noticeDurationNotQualified');
 const {from,to}=suite.window;if(item.trigger<from||item.trigger>to)return outside();
 const binding=path.calendarBinding;let calendar;
 if(binding.type==='fixed')calendar=binding.calendar;
 else if(binding.type==='fixedQualifiedAuthoritySeat')calendar=binding.calendarId;
 else if(binding.type==='qualifiedAuthoritySeat'){const choice=binding.choices.find(choice=>Object.is(choice.value,facts[binding.regionFact]));
  if(!choice)return boundary('holidayAnchorNotQualified');calendar=choice.calendarId;}
 else{assert.equal(binding.type,'fact');calendar=facts[binding.fact];if(!binding.allowed.includes(calendar))return boundary('holidayAnchorNotQualified');}
 assert.ok(suite.calendars[calendar]);const isHoliday=date=>holidays(calendar,Number(date.slice(0,4)),suite).has(date);
 let opening=item.trigger;
 if(path.opening){
  const spec=path.opening,mode=facts[spec.modeFact];
  if(mode===spec.trackingValue){
   if(spec.expectedServiceFact&&facts[spec.expectedServiceFact]!==true)return boundary('trackingExpectedServiceNotQualified');
   for(const req of spec.trackingRequirements??[])if(!matches(facts[req.key],req))return boundary(req.reason);
   while(weekend(opening)||isHoliday(opening)){opening=add(opening,1);if(opening>to)return outside();}
  }else if(mode!==spec.qualifiedValue)return boundary('openingModeUnqualified');
 }
 const ordinaryStart=add(opening,1);let current=opening,left=item.days,firstCountedDay=null,skippedDays=0;
 while(left>0){current=add(current,1);if(current>to)return outside();
  if(paused(current,path.suspension))skippedDays++;else{firstCountedDay??=current;left--;}}
 const nominal=current;let shifted=0,firstCollision=null;
 while(weekend(current)||isHoliday(current)){
  current=add(current,1);shifted++;if(current>to)return outside();
  if(paused(current,path.suspension))firstCollision??=current;
 }
 if(firstCollision)return{outcome:'unresolvedBoundaryProposed',reason:'M1-END-SUSPENSION',nominalEnd:nominal,ordinaryShiftEnd:current,firstSuspendedShiftDate:firstCollision};
 return{outcome:'datedResearchValue',legalOpening:opening,ordinaryStart,firstCountedDay,nominalEnd:nominal,end:current,
  skippedDays,endShiftDays:shifted,suspension:path.suspension,calendar};
}
export async function runReferences({fixturePath=fixture}={}){
 const raw=await readFile(resolve(root,fixturePath)),suite=JSON.parse(raw);
 assert.equal(suite.formatVersion,'ap23m1-research-references-1');
 for(const key of['runtimeActive','productTest','legalApproval','exportTest'])assert.equal(suite[key],false,key);
 assert.deepEqual(suite.window,{from:'2026-08-29',to:'2027-12-31'});
 assert.equal(suite.factPolicy,'explicitCaseFactsOnly');assert.equal(suite.sharedSyntheticFacts,undefined);
 assert.equal(new Set(suite.paths.map(path=>path.id)).size,suite.paths.length);
 assert.equal(new Set(suite.cases.map(item=>item.id)).size,suite.cases.length);
 let sourceFiles=0,sourceBytes=0,companionFiles=0,companionBytes=0;const modelCases=new Map(),modelPaths=new Set();
 for(const model of suite.sourceModels){
  const bytes=await readFile(resolve(root,model.path));assert.equal(sha256(bytes),model.sha256);
  const content=JSON.parse(bytes);
  if(model.sourceRegister)for(const source of content.sources){
   assert.ok(source.file&&!source.file.includes('..')&&!source.file.startsWith('/'));
   const rawSource=await readFile(resolve(root,content.sourceBase,source.file));
   assert.equal(sha256(rawSource),source.sha256,source.id);assert.equal(rawSource.length,source.bytes,source.id);sourceFiles++;sourceBytes+=rawSource.length;
  }
  if(model.sourceRegister)for(const companion of content.additionalRawCompanions??[]){
   assert.ok(companion.file&&!companion.file.includes('..')&&!companion.file.startsWith('/'));
   const bytes=await readFile(resolve(root,content.sourceBase,companion.file));assert.equal(sha256(bytes),companion.sha256,companion.file);assert.equal(bytes.length,companion.bytes,companion.file);
   companionFiles++;companionBytes+=bytes.length;
  }
  if(model.cantonFindings){
   for(const path of content.pathProposals){assert.ok(!modelPaths.has(path.id));modelPaths.add(path.id);}
   for(const item of content.localReferenceCases){assert.ok(!modelCases.has(item.id));modelCases.set(item.id,{item,source:model.path});}
  }
 }
 assert.deepEqual([...modelPaths].sort(),suite.paths.map(path=>path.id).sort());
 for(const item of suite.cases){
  const original=modelCases.get(item.id);assert.ok(original,'Missing analyst input '+item.id);
  assert.equal(item.analystSource,original.source);
  for(const key of['path','trigger','days','facts','expected'])assert.deepEqual(item[key],original.item[key],'Changed analyst case '+item.id+'/'+key);
  assert.equal(Object.hasOwn(item.expected,'end'),item.expected.outcome==='datedResearchValue','Boundary with definitive result '+item.id);
 }
 assert.equal(modelCases.size,suite.cases.length,'Omitted analyst case');
 const discrepancies=[],results=[];
 for(const item of suite.cases){const actual=evaluate(item,suite);results.push({id:item.id,actual});
  for(const[key,expected]of Object.entries(item.expected))if(!Object.is(actual[key],expected))discrepancies.push({id:item.id,key,expected,actual:actual[key]});}
 for(const path of suite.paths)assert.ok(suite.cases.some(item=>item.path===path.id&&item.expected.outcome==='datedResearchValue'),'No positive reference '+path.id);
 for(const probe of suite.calendarProbes){assert.equal(holidays(probe.calendar,Number(probe.date.slice(0,4)),suite).has(probe.date),probe.isHoliday,JSON.stringify(probe));}
 assert.deepEqual(discrepancies,[],'Reference mismatch');
 const output='outputs/ap23m1-2026-10-27';await mkdir(resolve(root,output),{recursive:true});
 const report={workPackage:'AP23M1',status:'research-references-verified',fixtureSha256:sha256(raw),paths:suite.paths.length,cases:suite.cases.length,
  datedValues:results.filter(row=>row.actual.outcome==='datedResearchValue').length,calendarProbes:suite.calendarProbes.length,sourceFiles,sourceBytes,companionFiles,companionBytes,
  discrepancies,results,productImports:false,productTest:false,legalApproval:false,exportTest:false,operatingChanges:false};
 await writeFile(resolve(root,output,'reference-verification.json'),JSON.stringify(report,null,2)+'\n');return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert.equal(process.argv.length,2);const report=await runReferences();console.log(JSON.stringify({...report,results:report.results.length}));
}

