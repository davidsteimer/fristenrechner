// SPDX-License-Identifier: AGPL-3.0-only
// Isolated contract specimen. Never promotes data or touches a runtime consumer.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

export const root=fileURLToPath(new URL('../',import.meta.url));
export const basePath='data/releases/2026-10-01-mvp-06-approved.1/holiday-catalogs/ch-holiday-catalog.json';
export const matrixPath='outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json';
export const candidatePath='tests/golden/candidates/ap22b-holiday-contract.json';
export const sha=x=>createHash('sha256').update(x).digest('hex');
const sorted=x=>[...new Set(x)].sort();
const canon=x=>JSON.stringify(x);
const profiles=['stpo','zpo','bgg','vwvg'];
const rename=s=>s==='SO-PROCEDURAL-DRAFT'?'SO-PROCEDURAL-ALL':s;
const days=[['NEW-YEAR',1,1],['BERCHTOLD',1,2],['GOOD-FRIDAY',-2],['EASTER-MONDAY',1],['ASCENSION',39],['WHIT-MONDAY',50],['MAY1',5,1],['CORPUS-CHRISTI',60],['ASSUMPTION',8,15],['ALL-SAINTS',11,1],['CHRISTMAS',12,25],['ST-STEPHEN',12,26]];

export async function inputs(){
  const raw=await fs.readFile(path.join(root,basePath));
  const matrixRaw=await fs.readFile(path.join(root,matrixPath));
  assert.equal(sha(raw),'b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7');
  assert.equal(sha(matrixRaw),'7c0512b66fcd7206c47f2d36b4774824325fe779b7045cb12925bf2fb0146f89');
  return {base:JSON.parse(raw),matrix:JSON.parse(matrixRaw),raw,matrixRaw};
}

export function buildContract({base,matrix,raw,matrixRaw}){
  const catalog=structuredClone(base);
  catalog.$schema='https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/holiday-catalog-v2.schema.json';
  catalog.formatVersion='2.0.0';
  const rules=base.data.rules;
  const extraRules=days.map(([key,a,b])=>{
    const original=rules.find(r=>r.id.endsWith('-DAY-'+key)||r.id.endsWith('-HOL-'+key));
    assert.ok(original,'Known labels required: '+key);
    return {id:'SO-PROCEDURAL-ALL-DAY-'+key,scopeId:'SO-PROCEDURAL-ALL',labels:{de:original.de,fr:original.fr,it:original.it,rm:original.rm},category:'proceduralEquivalentDay',dayPortion:'fullDay',calculation:b===undefined?{type:'easterOffsetDays',offsetDays:a}:{type:'fixedMonthDay',month:a,day:b},condition:'always',legalValidity:{from:'2015-03-01',to:null},sourceRefs:[{evidenceId:'AP22-SO-GS201463',locator:'Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015'}]};
  });
  const allRules=[...rules.map(r=>({id:r.id,scopeId:r.scope})),...extraRules];
  const projections=new Map();
  const projection=(jurisdiction,scopeIds)=>{
    scopeIds=sorted(scopeIds);
    const bases=scopeIds.filter(s=>s!=='CH-ALL'&&!s.endsWith('ADDITIONAL'));
    assert.equal(bases.length,jurisdiction==='CH'?0:1,'Exactly one terminal base list');
    const baseScopeId=bases[0]??'CH-ALL';
    const supplementScopeIds=scopeIds.filter(s=>s!=='CH-ALL'&&s!==baseScopeId);
    const ruleIds=sorted(allRules.filter(r=>scopeIds.includes(r.scopeId)).map(r=>r.id));
    assert.ok(ruleIds.length);
    const recipeHash=sha(canon({jurisdiction,scopeIds,ruleIds}));
    const id='projection-'+recipeHash.slice(0,16);
    const calendarId=jurisdiction==='CH'?'ch-federal-calendar':jurisdiction==='CH-BE'?'be-public-holidays':'ap22-'+jurisdiction.slice(3).toLowerCase()+'-'+recipeHash.slice(0,12);
    if(!projections.has(id))projections.set(id,{id,calendarId,jurisdiction,baseScopeId,supplementScopeIds,scopeIds,ruleIds});
    return id;
  };
  projection('CH',['CH-ALL']);
  const bindings=[];
  for(const jurisdiction of sorted(matrix.matrix.map(r=>r.jurisdiction).filter(j=>j!=='CH'))){
    for(const profileId of profiles){
      const rows=matrix.matrix.filter(r=>r.jurisdiction===jurisdiction&&r.profile.toLowerCase()===profileId);
      assert.ok(rows.length);
      const scopes=sorted(['CH-ALL',...rows.filter(r=>r.mode!=='exclude').flatMap(r=>r.selectedScopes.map(rename))]);
      const localScopes=scopes.filter(s=>['AI-RTG-INNER-ADDITIONAL','NE-LANDERON-ADDITIONAL'].includes(s));
      assert.ok(localScopes.length<=1);
      const uncertain=rows.filter(r=>r.mode==='resultDependentClarification');
      assert.ok(uncertain.length<=1);
      const variants=[];
      for(const value of localScopes.length?[false,true]:[null]){
        const selected=scopes.filter(s=>!localScopes.includes(s)||value===true);
        variants.push({areaFacts:localScopes.map(scopeId=>({scopeId,member:value})),projectionId:projection(jurisdiction,selected),alternativeProjectionId:uncertain.length?projection(jurisdiction,[...selected,uncertain[0].scope]):null});
      }
      bindings.push({id:'AP22-BIND-'+jurisdiction.slice(3)+'-'+profileId.toUpperCase(),profileId,jurisdiction,purpose:'deadlineCalendar',anchorPolicyId:'AP22-ANCHOR-'+profileId.toUpperCase(),caseCoverage:{from:'2026-08-29',to:null},requiredAreaScopeIds:localScopes,variants,matrixDecisionIds:rows.map(r=>r.id),sourceIds:sorted(rows.flatMap(r=>r.sourceIds)),boundaryIds:jurisdiction==='CH-GR'?['GR-BASE-ONLY']:jurisdiction==='CH-NE'?['NE-YEAR-LOCAL-RESERVE']:[],ambiguity:uncertain.length?{decision:'DEC-2026-029',catalogRuleIds:uncertain[0].rules,comparison:'fullCalculation',onDifference:'clarificationRequired',onEqual:'resolved'}:null,approvalBasis:uncertain.length?['DEC-2026-028','DEC-2026-029']:['DEC-2026-028'],reviewedOn:'2026-10-02'});
    }
  }
  catalog.activation={
    contractDecision:{id:'DEC-2026-030',status:'proposed',on:null},
    base:{catalogPath:basePath,catalogSha256:sha(raw),matrixPath,matrixSha256:sha(matrixRaw)},
    sourceEvidence:structuredClone(matrix.sources),
    sourceIdMap:matrix.sources.map(s=>({evidenceId:s.id,sourceId:s.id.startsWith('SRC-')||s.id.startsWith('JUD-')?s.id:'SRC-'+s.id})),
    supplementalScopes:[{id:'SO-PROCEDURAL-ALL',jurisdiction:'CH-SO',scopeType:'canton',legacyMatrixId:'SO-PROCEDURAL-DRAFT',legalValidity:{from:'2015-03-01',to:null}}],
    supplementalRules:extraRules,
    matrixDecisions:matrix.matrix.map(r=>({id:r.id,profileId:r.profile.toLowerCase(),jurisdiction:r.jurisdiction,originScopeId:r.scope,mode:r.mode,selectedScopeIds:r.selectedScopes.map(rename),rowSha256:sha(canon(r))})),
    anchorPolicies:[
      {id:'AP22-ANCHOR-ZPO',profileId:'zpo',resolvedModes:['court'],unresolvedModes:['missingCourt'],sourceIds:['AP22CLOSE-BUND-ZPO']},
      ...['stpo','bgg','vwvg'].map(p=>({id:'AP22-ANCHOR-'+p.toUpperCase(),profileId:p,resolvedModes:['partyWithoutRepresentative','qualifiedServiceRepresentative'],unresolvedModes:['missingParty','unqualifiedRepresentation','nonProfessionalDifferentPlaces','mandateChange','personalActUnqualified','unresolvedMultiplePlaces'],sourceIds:['AP22CLOSE-BUND-'+p.toUpperCase()]}))
    ],
    procedureBindings:bindings,
    projections:[...projections.values()].sort((a,b)=>a.calendarId.localeCompare(b.calendarId)),
    releaseEligibility:{status:'candidate',releaseId:null,approval:null},
  };
  return catalog;
}

export function inspectContract(candidate,source){
  // Closed, bound draft: unknown/missing fields and silent re-interpretation fail.
  assert.deepEqual(candidate,buildContract(source));
  assert.deepEqual(candidate.data,source.base.data);
  const a=candidate.activation;
  assert.equal(a.matrixDecisions.length,198);assert.equal(a.procedureBindings.length,104);
  assert.equal(a.matrixDecisions.filter(x=>x.mode==='exclude').length,20);
  assert.equal(a.procedureBindings.filter(x=>x.ambiguity).length,4);
  assert.equal(a.supplementalRules.length,12);
  assert.equal(new Set(a.projections.map(x=>x.calendarId)).size,a.projections.length);
  const ids=new Set(a.sourceEvidence.map(x=>x.id));
  assert.equal(new Set(a.sourceIdMap.map(x=>x.sourceId)).size,a.sourceIdMap.length);
  for(const b of a.procedureBindings){
    for(const id of b.sourceIds)assert.ok(ids.has(id),id);
    for(const v of b.variants){
      const p=a.projections.find(p=>p.id===v.projectionId);assert.ok(p);
      assert.ok(p.scopeIds.includes('CH-ALL'));
      if(v.alternativeProjectionId){
        const alt=a.projections.find(p=>p.id===v.alternativeProjectionId);assert.ok(alt);
        assert.deepEqual(alt.ruleIds.filter(id=>!p.ruleIds.includes(id)),b.ambiguity.catalogRuleIds);
        assert.ok(p.ruleIds.every(id=>alt.ruleIds.includes(id)));
      }
    }
  }
  const scopes=(c,p='stpo')=>a.projections.find(x=>x.id===a.procedureBindings.find(b=>b.jurisdiction==='CH-'+c&&b.profileId===p).variants[0].projectionId).scopeIds;
  assert.deepEqual(scopes('AG'),['AG-ZPO-ALL','CH-ALL']);
  assert.deepEqual(scopes('FR'),['CH-ALL','FR-JG-ALL']);
  assert.deepEqual(scopes('SO'),['CH-ALL','SO-PROCEDURAL-ALL']);
  assert.deepEqual(scopes('LU'),['CH-ALL','LU-JUSG-ART76']);
  assert.deepEqual(scopes('LU','bgg'),['CH-ALL','LU-RLG-ALL','LU-VRG-ADDITIONAL']);
  assert.deepEqual(scopes('ZH'),['CH-ALL','ZH-GOG-ALL']);
  assert.deepEqual(scopes('GR'),['CH-ALL','GR-PUBLIC-ALL']);
  return {status:'contractProposal',contractApproved:false,runtimeActive:false,matrixDecisions:198,procedureBindings:104,projectionRecipes:a.projections.length,plannedManifestArtifacts:8+a.projections.length,preservedRules:479,supplementalRules:12,excludedDecisions:20,resultDependentBindings:4,regionalBindings:a.procedureBindings.filter(x=>x.requiredAreaScopeIds.length).length,sourceEvidence:a.sourceEvidence.length};
}

function schema(){
  const str={type:'string',minLength:1};const id={type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9._-]*$'};const hash={type:'string',pattern:'^[a-f0-9]{64}$'};
  const obj=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
  const arr=(items,minItems=0)=>({type:'array',items,minItems});
  const strs=()=>({...arr(id),uniqueItems:true});
  const nullable=s=>({oneOf:[s,{type:'null'}]});
  const date={type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'};
  const interval=obj({from:date,to:nullable(date)});
  const profile={enum:profiles};
  const jurisdiction={type:'string',pattern:'^CH(?:-[A-Z]{2})?$'};
  const evidence=obj({id,title:str,url:{type:'string',format:'uri'},locator:{type:'string'},jurisdiction:str,versionOn:nullable(str),retrievedOn:date,review:str,note:{type:'string'}});
  // Archive metadata remains intact. Its status is not an activation permission.
  Object.assign(evidence.properties,{approvalBasis:nullable(str),provenance:{$ref:'#/$defs/row'},status:{enum:['approved','open','blocked']}});
  const activation=obj({
    contractDecision:obj({id:{const:'DEC-2026-030'},status:{enum:['proposed','approved']},on:nullable(date)}),
    base:obj({catalogPath:str,catalogSha256:hash,matrixPath:str,matrixSha256:hash}),
    sourceEvidence:arr(evidence,1),sourceIdMap:arr(obj({evidenceId:id,sourceId:{type:'string',pattern:'^(SRC|JUD)-[A-Z0-9-]+$'}}),1),
    supplementalScopes:arr(obj({id,jurisdiction,scopeType:{const:'canton'},legacyMatrixId:id,legalValidity:interval})),
    supplementalRules:arr(obj({id,scopeId:id,labels:{$ref:'#/$defs/labels'},category:{const:'proceduralEquivalentDay'},dayPortion:{const:'fullDay'},calculation:{$ref:'#/$defs/calculation'},condition:{const:'always'},legalValidity:interval,sourceRefs:arr(obj({evidenceId:id,locator:str}),1)})),
    matrixDecisions:arr(obj({id,profileId:profile,jurisdiction,originScopeId:id,mode:{enum:['existing','include','replace','supplement','exclude','limited','resultDependentClarification','create']},selectedScopeIds:strs(),rowSha256:hash}),198),
    anchorPolicies:arr(obj({id,profileId:profile,resolvedModes:{type:'array',minItems:1,uniqueItems:true,items:{enum:['court','partyWithoutRepresentative','qualifiedServiceRepresentative']}},unresolvedModes:{type:'array',minItems:1,uniqueItems:true,items:{enum:['missingCourt','missingParty','unqualifiedRepresentation','nonProfessionalDifferentPlaces','mandateChange','personalActUnqualified','unresolvedMultiplePlaces']}},sourceIds:strs()}),4),
    procedureBindings:arr(obj({id,profileId:profile,jurisdiction,purpose:{const:'deadlineCalendar'},anchorPolicyId:id,caseCoverage:interval,requiredAreaScopeIds:strs(),variants:arr(obj({areaFacts:arr(obj({scopeId:id,member:{type:'boolean'}})),projectionId:id,alternativeProjectionId:nullable(id)}),1),matrixDecisionIds:strs(),sourceIds:strs(),boundaryIds:{type:'array',uniqueItems:true,items:{enum:['GR-BASE-ONLY','NE-YEAR-LOCAL-RESERVE']}},ambiguity:nullable(obj({decision:{const:'DEC-2026-029'},catalogRuleIds:strs(),comparison:{const:'fullCalculation'},onDifference:{const:'clarificationRequired'},onEqual:{const:'resolved'}})),approvalBasis:{type:'array',minItems:1,uniqueItems:true,items:{enum:['DEC-2026-028','DEC-2026-029']}},reviewedOn:date}),104),
    projections:arr(obj({id,calendarId:{type:'string',pattern:'^[a-z][a-z0-9-]*$'},jurisdiction,baseScopeId:id,supplementScopeIds:strs(),scopeIds:strs(),ruleIds:strs()}),1),
    releaseEligibility:obj({status:{enum:['candidate','approved','withdrawn']},releaseId:nullable(str),approval:nullable(obj({on:date,by:str,evidence:str}))}),
  });
  activation.properties.contractDecision.allOf=[{if:{properties:{status:{const:'proposed'}}},then:{properties:{on:{type:'null'}}},else:{properties:{on:date}}}];
  activation.properties.releaseEligibility.allOf=[{if:{properties:{status:{const:'candidate'}}},then:{properties:{releaseId:{type:'null'},approval:{type:'null'}}},else:{properties:{releaseId:str,approval:obj({on:date,by:str,evidence:str})}}}];
  activation.allOf=[{if:{properties:{releaseEligibility:{properties:{status:{const:'approved'}}}}},then:{properties:{contractDecision:{properties:{status:{const:'approved'}}}}}}];
  return activation;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const source=await inputs();
  const candidate=buildContract(source);
  const report=inspectContract(candidate,source);
  if(process.argv.includes('--write')){
    const oldSchema=JSON.parse(await fs.readFile(path.join(root,'schemas/holiday-catalog-v1.schema.json'),'utf8'));
    oldSchema.$id=candidate.$schema;oldSchema.title='AP22B Entwurf Feiertagskatalog 2';
    oldSchema.properties.$schema.const=candidate.$schema;oldSchema.properties.formatVersion.const='2.0.0';
    oldSchema.required.push('activation');oldSchema.properties.activation=schema();
    for(const [file,body] of [[candidatePath,candidate],['schemas/candidates/ap22b/holiday-catalog-v2.schema.json',oldSchema]]){
      await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});
      await fs.writeFile(path.join(root,file),JSON.stringify(body,null,2)+'\n');
    }
  }else{
    const saved=JSON.parse(await fs.readFile(path.join(root,candidatePath),'utf8'));
    inspectContract(saved,source);
  }
  console.log(JSON.stringify(report,null,2));
}
