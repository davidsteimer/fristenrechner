// SPDX-License-Identifier: AGPL-3.0-only
// Assemble research inputs without generating or altering an analyst's expected result.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './check-ap23l1-references.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),folder='docs/fachrecht/ap23l1';
const sourceModels=[],paths=[],cases=[],calendars={},calendarProbes=[],calendarBaselines=[];
async function model(path,flags){const bytes=await readFile(resolve(root,path));sourceModels.push({path,sha256:sha256(bytes),...flags});return JSON.parse(bytes);}
function requirements(list){const result=[];for(const req of list){assert.ok(req.key);const normalized={...req,reason:req.reason??'qualificationNotEstablished:'+req.key};
 const previous=result.find(row=>row.key===req.key);if(previous)assert.deepEqual(previous,normalized,'Contradictory requirement '+req.key);else result.push(normalized);}return result;}
for(const canton of['ai','sz']){
 const location=folder+'/befund-'+canton+'.json',findings=await model(location,{cantonFindings:true});
 await model(folder+'/quellen-'+canton+'.json',{sourceRegister:true});
 for(const key of['professionalAcceptance','formatDecision','sourceReleaseApproved','implementationStarted','operatingChanges'])assert.equal(findings[key],false,key);
 for(const definition of findings.calendarProposals){
  const spec=definition.ruleSpec;assert.ok(spec,'Missing explicit calendar rule specification');assert.ok(!calendars[definition.id]);
  calendars[definition.id]={...spec};
  if(spec.thirdSundaySeptember){delete calendars[definition.id].thirdSundaySeptember;calendars[definition.id].federalFast=true;}
  if(spec.nthWeekday){assert.deepEqual(spec.nthWeekday,[{month:9,isoWeekday:7,occurrence:3}]);
   delete calendars[definition.id].nthWeekday;calendars[definition.id].federalFast=true;}
  if(definition.existingCalendar){const bytes=await readFile(resolve(root,definition.existingCalendar));
   const extra=definition.researchAdditionalDates??(definition.requiresSeparateProceduralCalendar&&definition.fixedMunicipality==='Schwyz'?
    ['2026-11-11','2027-11-11']:undefined);
   calendarBaselines.push({calendar:definition.id,path:definition.existingCalendar,sha256:sha256(bytes),
    ...(extra?{researchAdditionalDates:extra}:{})});}
 }
 for(const proposal of findings.pathProposals){
  const duration=proposal.duration??{},opening=typeof proposal.opening==='object'?structuredClone(proposal.opening):undefined;
  if(opening){const conditional=findings.openingPolicy?.additionalConditionalRequirements??[];
   for(const row of conditional){assert.equal(row.when.key,opening.modeFact);
    if(row.when.value!==opening.trackingValue){assert.ok(proposal.requirements.some(req=>req.key===opening.modeFact&&req.value===opening.qualifiedValue));continue;}
    opening.trackingRequirements=[...(opening.trackingRequirements??[]),...row.requirements];}}
  const binding=proposal.calendarBinding??{type:'fixed',calendar:proposal.calendar};assert.ok(binding.calendar||binding.type==='fact');
  paths.push({id:proposal.id,canton:findings.canton,stage:proposal.stage,
   days:Object.hasOwn(proposal,'days')?proposal.days:(duration.days??null),
   ...(proposal.minimumDays!==undefined||duration.minimumDays!==undefined?{minimumDays:proposal.minimumDays??duration.minimumDays}:{}),
   ...(proposal.maximumDays!==undefined||duration.maximumDays!==undefined?{maximumDays:proposal.maximumDays??duration.maximumDays}:{}),
   ...(proposal.durationFact?{durationFact:proposal.durationFact,durationBaseFact:proposal.durationBaseFact,longerThanDays:proposal.longerThanDays}:{}),
   suspension:proposal.suspension,calendarBinding:binding,...(opening?{opening}:{}),
   requirements:requirements([...(findings.commonRequirements??[]),...proposal.requirements]),
   sourceIds:proposal.sourceIds??proposal.legalBasis});
 }
 for(const item of findings.localReferenceCases)cases.push({...item,analystSource:location});
 calendarProbes.push(...findings.calendarProbes??[]);
}
// Outer AI is a comparison calendar only, not an additional positively proposed target.
if(!calendars['AI-OUTER']){
 assert.ok(calendars['AI-INNER']);calendars['AI-OUTER']={...calendars['AI-INNER'],fixed:calendars['AI-INNER'].fixed.filter(md=>md!=='09-22')};
 const path='data/candidates/2026-10-27-ap23k3/calendars/ap22-ai-5d4e5a68e106.json',bytes=await readFile(resolve(root,path));
 calendarBaselines.push({calendar:'AI-OUTER',path,sha256:sha256(bytes)});
}
assert.equal(paths.filter(path=>path.canton==='AI').length,18);
assert.ok(paths.filter(path=>path.canton==='SZ').length>0);
assert.equal(new Set(paths.map(path=>path.id)).size,paths.length);
const suite={formatVersion:'ap23l1-research-references-1',asOf:'2026-10-27',runtimeActive:false,productTest:false,legalApproval:false,exportTest:false,
 factPolicy:'explicitCaseFactsOnly',window:{from:'2026-08-29',to:'2027-12-31'},easter:{2026:'2026-04-05',2027:'2027-03-28'},
 sourceModels,calendars,calendarBaselines,calendarProbes,paths,cases,
 note:'Static analyst expectations assembled without modification. Research calculations are not product tests, a legal approval, a data release or export permission.'};
await mkdir(resolve(root,folder),{recursive:true});await writeFile(resolve(root,folder,'referenzfaelle.json'),JSON.stringify(suite,null,2)+'\n');
console.log(JSON.stringify({status:'research-inputs-assembled',paths:paths.length,cases:cases.length,expectationsGenerated:false,productCodeImported:false}));
