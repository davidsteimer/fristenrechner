// SPDX-License-Identifier: AGPL-3.0-only
// R10-B append-only governance. No runtime promotion, build, Git write or remote action.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {root,prefix,hash,encode,readRegular,writeExclusive,approvalPath as sourceApprovalPath,
 loadApprovalInputs,verifySourceApproval,acceptanceRoot,inventoryPath,planPath,resultPath} from './record-mvp10-source-approval.mjs';
import {requireR10BApproval,authorityPath,decisionPath,proposalPath,candidateRoot,candidateHash,releaseId} from './record-r10b-execution-approval.mjs';
export {root,prefix,hash,encode,readRegular,writeExclusive,sourceApprovalPath,authorityPath,decisionPath,candidateRoot,candidateHash,releaseId};
export const registerPath='data/source-reviews/source-register.json';
export const indexPath='data/source-reviews/index.json';
export const eventId='2026-10-28-mvp-010-prerelease.1';
export const eventPath='data/source-reviews/events/'+eventId+'.json';
export const bridgePath=prefix+'/source-version-bridges.json';
export const adoptionPath=prefix+'/source-governance-adoption.json';
export const suitePath=prefix+'/administrative-reference-suite.json';
export const baselineRoot=prefix+'/governance-inputs';
export const componentKeys=Object.freeze(['componentId','ruleId','deadlineDefinitionId','filingProfileId','regimeId','suspensionSetId','bindingId','contextRouteId','calendarBindingId','eligibilityId','excludedPathId','pathId','lawId','holidayBindingId','suspensionProfileId','qualificationPolicyId']);
const unique=values=>[...new Set(values.filter(v=>typeof v==='string'&&v.length))].sort();
const pointer=(value,path)=>path.split('/').slice(1).reduce((a,k)=>{assert.ok(a!==null&&typeof a==='object'&&Object.hasOwn(a,k),'Unresolved pointer '+path);return a[k.replace(/~1/g,'/').replace(/~0/g,'~')];},value);
export async function getSourceApprovalBinding(repository=root){const result=await verifySourceApproval(repository);return{path:sourceApprovalPath,byteLength:result.approvalByteLength,sha256:result.approvalSha256,sourceReviewRef:{reviewId:'MVP10-SOURCE-APPROVAL-20261028',sha256:result.approvalSha256},adminSourceReviewRef:{id:'mvp10-source-approval-20261028',sha256:result.approvalSha256}};}
export async function requireAuthority(repository=root){assert.equal(repository,root,'Execution belongs to the bound repository');const authority=await requireR10BApproval();assert.equal(authority.sha256,'595664f96384230fa8941ae1ac3b388c1d213f38596fe9913785966ed45e2e5c');assert.equal(authority.record.permissions.localDataPromotionAuthorized,true);await verifySourceApproval(repository);return authority;}
export function explicitSourceImpacts(inventory){
 assert.equal(inventory.referenceGraph.length,5045);assert.equal(inventory.addedReferenceGraph.length,2909);
 assert.equal(new Set(inventory.referenceGraph.map(e=>e.documentPath+'#'+e.jsonPath)).size,5045);
 const ids=new Set(inventory.rows.map(r=>r.sourceId)),found=new Map();
 for(const edge of inventory.referenceGraph){assert.ok(ids.has(edge.sourceId),'Unknown source '+edge.sourceId);const record=found.get(edge.sourceId)??{profileIds:[],calendarIds:[],componentIds:[]};record.profileIds.push(edge.profileId);record.calendarIds.push(edge.calendarId);record.componentIds.push(...componentKeys.map(k=>edge[k]));found.set(edge.sourceId,record);}
 return new Map([...found].map(([id,value])=>[id,Object.fromEntries(Object.entries(value).map(([k,v])=>[k,unique(v)]))]));
}
function labels(values){const result=[];for(const value of values){assert.equal(typeof value,'string');let rest=value.trim();while(rest.length>300){let split=rest.lastIndexOf(' ',300);if(split<1)split=300;result.push(rest.slice(0,split));rest=rest.slice(split).trim();}if(rest)result.push(rest);}return unique(result);}
export function relevantProvisions(review,oldSource,native){const direct=review.relevantProvisions??review.actualStatements?.relevantProvisions??oldSource?.relevantProvisions??(native?.locators?[native.locators]:review.usedAssertions);assert.ok(Array.isArray(direct)&&direct.length,'Missing explicit provisions');const normalized=labels(direct);assert.ok(normalized.length);return normalized;}
export function newRegisterSource(inventoryRow,plan,review){
 assert.equal(plan.sourceId,inventoryRow.sourceId);assert.equal(plan.stopRequired,false);assert.equal(plan.inventoryKind,inventoryRow.kind);assert.equal(plan.referenceCount,inventoryRow.referenceLocations.length);
 const native=inventoryRow.sourceRecordOccurrences[0].source;assert.equal(plan.nativeUrl,native.url);assert.equal(native.kind,inventoryRow.kind);
 assert.equal(plan.usageStatus,inventoryRow.positiveOrSharedEdges>0?'productive':'supporting');
 assert.equal(plan.targetSourceType,inventoryRow.kind==='judgment'?'caseLaw':inventoryRow.kind==='officialMaterials'?'officialMaterials':plan.classificationReason?'ordinance':'statute');
 assert.match(plan.retrievalUrl,/^https:\/\//u);if(plan.validatorExceptionRequired){assert.equal(plan.officialUrl,null);assert.equal(plan.usageStatus,'supporting');assert.equal(plan.referenceCount,0);}
 const title=native.title??native.versionDescription;assert.ok(typeof title==='string'&&title.length&&title.length<=500,'Unbound title '+plan.sourceId);
 const locator=native.locators;assert.ok(typeof locator==='string'&&locator.length&&locator.length<=500,'Unbound locator '+plan.sourceId);
 const versionDate=native.documentVersionDate??review.decisionDate??null;if(versionDate!==null)assert.match(versionDate,/^\d{4}-\d{2}-\d{2}$/u);
 return{sourceId:plan.sourceId,usageStatus:plan.usageStatus,sourceType:plan.targetSourceType,title,authority:plan.authority,jurisdiction:plan.jurisdiction,officialLocator:locator,officialUrl:plan.officialUrl,retrievalUrl:plan.retrievalUrl,documentVersionDate:versionDate,subjectAreas:['deadlineStart','deadlineCounting','deadlineEnd','deadlineSuspension','publicHolidays'],relevantProvisions:relevantProvisions(review,undefined,native)};
}
function followUp(id,priorEvents){
 const previous=priorEvents.flatMap(event=>event.entries.filter(e=>e.sourceId===id).map(entry=>({event,entry}))).sort((a,b)=>a.entry.reviewedOn.localeCompare(b.entry.reviewedOn)||a.event.reviewEventId.localeCompare(b.event.reviewEventId)).at(-1)?.entry;
 let references=structuredClone(previous?.followUp.references??[]);
 const risk=(name,status='open')=>{if(!references.some(r=>r.id===name))references.push({kind:'riskRecord',id:name,url:null,status});};
 if(id==='SRC-AI-RUHETAGE-LISTE-2026')risk('R10-AI-HISTORICAL-WORKFLOW-STATUS');
 if(id==='SRC-AP22-FR-PRAXIS')risk('FR-101-2012-89-OFFICIAL-IDENTITY');
 if(id.startsWith('SRC-AP19C3-KVG-'))risk('R10-A2-BASELINE-KVG-EDITION-01','resolved');
 if(['SRC-AP23J1-FR-LJ-7926-DE','SRC-AP23J1-FR-LJ-7926-FR'].includes(id))risk('FR-ROF-2026-043-UNDATED-ENACTMENT');
 if(['SRC-M1-NE-LANDERON','SRC-M1-NE-LCE','SRC-M1-NE-LDJF','SRC-M1-NE-LPA','SRC-M1-NE-OJN','SRC-M1-NE-RDF'].includes(id))risk('NE-O4-LJU-JUSTITIA-GATE');
 return{required:references.length>0,references};
}
export function assembleGovernance({oldRegister,oldIndex,priorEvents,inventory,report,plan,nativeReviews,approvalBinding,authorityBinding}){
 assert.equal(oldRegister.sources.length,255);assert.equal(priorEvents.length,7);assert.equal(oldIndex.generatedFrom.eventIds.length,7);
 assert.equal(inventory.rows.length,380);assert.equal(report.sources.length,380);assert.equal(plan.rows.length,129);assert.equal(inventory.historicalCatalogProvenanceGraph.length,713);
 assert.deepEqual(report.sources.map(r=>r.sourceId).sort(),inventory.rows.map(r=>r.sourceId).sort());
 assert.deepEqual(oldIndex.generatedFrom.eventIds.slice().sort(),priorEvents.map(e=>e.reviewEventId).sort());
 const register=structuredClone(oldRegister),known=new Set(oldRegister.sources.map(r=>r.sourceId)),added=inventory.rows.filter(r=>!known.has(r.sourceId));
 assert.deepEqual(added.map(r=>r.sourceId).sort(),plan.rows.map(r=>r.sourceId).sort());
 const plans=new Map(plan.rows.map(r=>[r.sourceId,r]));assert.equal(plans.size,129);
 for(const row of added)register.sources.push(newRegisterSource(row,plans.get(row.sourceId),nativeReviews.get(row.sourceId)));
 register.sources.sort((a,b)=>a.sourceId.localeCompare(b.sourceId,'en'));register.scope.productiveReleaseIds.push(releaseId);register.scope.jurisdictions=unique(register.sources.map(r=>r.jurisdiction));
 for(const old of oldRegister.sources)assert.deepEqual(register.sources.find(r=>r.sourceId===old.sourceId),old,'Changed original row '+old.sourceId);
 assert.equal(register.sources.length,384);assert.equal(added.filter(r=>plans.get(r.sourceId).usageStatus==='productive').length,109);
 const impacts=explicitSourceImpacts(inventory),sourceMap=new Map(register.sources.map(r=>[r.sourceId,r]));
 const event={$schema:'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-event.schema.json',formatVersion:'1.0.0',dataKind:'sourceReviewEvent',reviewEventId:eventId,recordStatus:'approved',recordedOn:'2026-10-28',trigger:'preRelease',reviewWindow:{from:'2026-10-28',to:'2026-10-28'},nextAnnualReviewDue:'2026-11-15',comparedReleaseIds:[releaseId],responsibility:{reviewedBy:'David Steimer',documentedWith:'Codex',formalFourEyes:false,operatingModel:'personalUnion'},entries:inventory.rows.map(row=>{
  const current=report.sources.find(r=>r.sourceId===row.sourceId),review=nativeReviews.get(row.sourceId);assert.equal(review.sourceId,row.sourceId);assert.deepEqual(current.referenceLocations,row.referenceLocations);
  assert.equal(review.humanApproval,false);assert.equal(review.sourceReleaseApproved,false);
  const outcome=['SRC-AI-RUHETAGE-LISTE-2026','SRC-AP22-FR-PRAXIS'].includes(row.sourceId)?'unclear':'unchanged';
  assert.equal(current.outcome==='unclear',outcome==='unclear','Unexpected unresolved workflow outcome');
  let finding=`Einzeln abgenommener A2-Aussageumfang, ${row.referenceLocations.length} konkrete Verwendungen, davon ${row.newReferenceLocations.length} neu. A2-Befund: ${current.outcome}. Vollständige Inhalts-, Fassungs-, Wiederverwendungs- und Grenzbegründung: ${current.reviewBinding.path}#${current.reviewBinding.pointer}. Belegbindung und ursprüngliche Prüfdaten: ${bridgePath}#${row.sourceId}. Kein pauschaler Rechtsbeständigkeitsnachweis und keine zusätzliche Fallfreigabe.`;
  if(row.sourceId==='SRC-AI-RUHETAGE-LISTE-2026')finding+=' Aktuelle amtliche Liste korrigiert, kein heutiger Stephanstagswiderspruch. unclear bezeichnet allein den fortgeführten historischen Katalog-/Workflowstatus.';
  if(row.sourceId==='SRC-AP22-FR-PRAXIS')finding+=' Ausschliesslich ergänzender gekennzeichneter Spiegel, null Graphkanten und keine eigenständige positive Freigabe. Die aktuelle FR-Norm ist separat bestätigt.';
  if(row.sourceId.startsWith('SRC-AP19C3-KVG-'))finding+=' Materieller Editionsbefund KVG/AS 2025 769 ausdrücklich erhalten, verwendete Art.1/80/85 unverändert. Keine Behauptung eines insgesamt unveränderten Gesetzes.';
  assert.ok(finding.length<=2000);
  return{sourceId:row.sourceId,reviewedOn:'2026-10-28',outcome,comparisonBasis:'Gesondert durch David Steimer abgenommener gemeinsamer R10-A2-Nachweis. Einzelne Original-, Abruf-, Wiederverwendungs- und Versionsdaten bleiben im bytegebundenen nativen Teilbericht unverändert. Konsolidierungsdatum ist kein behaupteter neuer Originalabruf.',evidence:{method:'consolidatedAcceptedReview',relevantProvisions:relevantProvisions(review,sourceMap.get(row.sourceId),row.sourceRecordOccurrences[0]?.source),finding},affected:{resolutionMode:'explicit',releaseIds:[releaseId],...(impacts.get(row.sourceId)??{profileIds:[],calendarIds:[],componentIds:[]})},followUp:followUp(row.sourceId,priorEvents)};
 })};
 assert.equal(event.entries.length,380);assert.equal(event.entries.filter(r=>r.outcome==='unclear').length,2);
 const entries=new Map(event.entries.map(r=>[r.sourceId,r]));
 const index={...structuredClone(oldIndex),generatedOn:event.recordedOn,generatedFrom:{...oldIndex.generatedFrom,eventIds:[...oldIndex.generatedFrom.eventIds,eventId].sort()},nextAnnualReviewDue:event.nextAnnualReviewDue,sources:register.sources.slice().sort((a,b)=>a.sourceId<b.sourceId?-1:a.sourceId>b.sourceId?1:0).map(source=>{const entry=entries.get(source.sourceId);if(!entry)return structuredClone(oldIndex.sources.find(r=>r.sourceId===source.sourceId));const{resolutionMode:ignored,...affected}=entry.affected;return{sourceId:source.sourceId,usageStatus:source.usageStatus,jurisdiction:source.jurisdiction,subjectAreas:source.subjectAreas.slice().sort(),latestReview:{reviewEventId:eventId,recordStatus:'approved',reviewedOn:entry.reviewedOn,outcome:entry.outcome,finding:entry.evidence.finding,followUp:entry.followUp.required},affected:{...affected,locators:[]}};})};
 const bridges={formatVersion:'1.0.0',dataKind:'sourceVersionBridges',recordedOn:'2026-10-28',releaseId,approvalRef:approvalBinding,authorityRef:authorityBinding,historicalSourceRecordsUnchanged:true,operationalRulesChanged:false,runtimeSourcesAdded:false,allOriginalRetrievalDatesPreserved:true,noUnlimitedStabilityProof:true,nextOrdinarySourceReview:'2026-11-15',annualReviewCompleted:false,
 retainedLimits:{AIcurrentCorrectionHistoricalStatusRetained:true,FRmirrorNoPositiveActivation:true,FRundatedReformRetained:true,NEgateAndLimitedNegativeSearchRetained:true,januaryComparisonsRetained:true,GRandNEcoverageReservationsRetained:true,AVIVoptionBRetained:true,OF001Retained:true},
 specialFindings:report.sources.filter(r=>r.sourceId.startsWith('SRC-AP19C3-KVG-')||['SRC-AI-RUHETAGE-LISTE-2026','SRC-AP22-FR-PRAXIS','SRC-AP23J1-FR-LJ-7926-DE','SRC-AP23J1-FR-LJ-7926-FR','SRC-M1-NE-OJN'].includes(r.sourceId)).map(r=>({sourceId:r.sourceId,outcome:r.outcome,reviewBinding:r.reviewBinding})),
 sources:report.sources.map(r=>({sourceId:r.sourceId,ownerLotId:r.ownerLotId,outcome:r.outcome,referenceCount:r.referenceLocations.length,newReferenceCount:r.newReferenceLocations.length,reviewBinding:r.reviewBinding,originalMetadataSource:inventoryPath+'#/rows/'+inventory.rows.findIndex(x=>x.sourceId===r.sourceId)}))};
 return{register,event,index,bridges,newSourceIds:added.map(r=>r.sourceId).sort()};
}
export async function prepareGovernance(repository=root){
 const authority=await requireAuthority(repository),sourceInputs=await loadApprovalInputs(repository),proposal=JSON.parse(await readRegular(repository,proposalPath));
 const before=new Map();for(const path of[registerPath,indexPath]){const binding=proposal.existingChangeInputs.find(r=>r.path===path);assert.ok(binding);const bytes=await readRegular(repository,prefix+'/before-inputs/'+path);assert.equal(hash(bytes),binding.sha256);assert.equal(bytes.length,binding.byteLength);before.set(path,bytes);}
 const oldRegister=JSON.parse(before.get(registerPath)),oldIndex=JSON.parse(before.get(indexPath)),priorEvents=[];
 const protection=JSON.parse(await readRegular(repository,authority.record.protection.path));
 for(const id of oldIndex.generatedFrom.eventIds){const path='data/source-reviews/events/'+id+'.json',binding=protection.protectedFiles.find(r=>r.path===path),bytes=await readRegular(repository,path);assert.ok(binding);assert.equal(hash(bytes),binding.sha256);assert.equal(bytes.length,binding.byteLength);before.set(path,bytes);priorEvents.push(JSON.parse(bytes));}
 const nativeReviews=new Map(),cache=new Map();for(const row of sourceInputs.report.sources){const b=row.reviewBinding;if(!cache.has(b.path)){const bytes=await readRegular(repository,acceptanceRoot+'/'+b.path);assert.equal(hash(bytes),b.sha256);assert.equal(bytes.length,b.byteLength);cache.set(b.path,JSON.parse(bytes));}const native=pointer(cache.get(b.path),b.pointer);assert.equal(native.sourceId,row.sourceId);nativeReviews.set(row.sourceId,native);}
 const manifestBytes=await readRegular(repository,candidateRoot+'/manifest.json');assert.equal(hash(manifestBytes),candidateHash);const manifest=JSON.parse(manifestBytes);for(const a of manifest.artifacts){const bytes=await readRegular(repository,candidateRoot+'/'+a.path);assert.equal(hash(bytes),a.sha256);assert.equal(bytes.length,a.byteLength);}
 const approvalBinding=await getSourceApprovalBinding(repository);const authorityBinding={path:authority.path,sha256:authority.sha256};
 return{...assembleGovernance({oldRegister,oldIndex,priorEvents,inventory:sourceInputs.inventory,report:sourceInputs.report,plan:sourceInputs.plan,nativeReviews,approvalBinding:{path:approvalBinding.path,sha256:approvalBinding.sha256,byteLength:approvalBinding.byteLength},authorityBinding}),before,authority,sourceInputs};
}
async function adoptionReceipt(prepared,repository){const paths=[sourceApprovalPath,authorityPath,bridgePath,registerPath,eventPath,indexPath,inventoryPath,planPath,resultPath,...[...prepared.before.keys()].map(path=>baselineRoot+'/'+path)];const evidence=[];for(const path of paths){const bytes=await readRegular(repository,path);evidence.push({path,byteLength:bytes.length,sha256:hash(bytes)});}return{formatVersion:'1.0.0',dataKind:'sourceGovernanceAdoption',adoptedOn:'2026-10-28',releaseId,counts:{previouslyRegistered:255,added:129,registered:384,retainedHistoricalExtraRows:4,newEventEntries:380,totalEvents:8,referenceGraphEdges:5045,retainedUses:2136,newUses:2909,historicalProvenanceEdges:713,changedUsedRules:0},newSourceIds:prepared.newSourceIds,historicalEventsUnchanged:true,previousRegisterRowsUnchanged:true,evidenceOnlySourcesNotActivated:true,AIcurrentCorrectionHistoricalStatusRetained:true,FRmirrorPositiveApproval:false,FRandNEFutureGatesRetained:true,annualReviewCompleted:false,nextOrdinarySourceReview:'2026-11-15',installationAuthorized:false,publicationAuthorized:false,operatingApproval:false,evidence};}
export async function verifyGovernance(repository=root){const p=await prepareGovernance(repository);for(const[path,value]of[[registerPath,p.register],[eventPath,p.event],[indexPath,p.index],[bridgePath,p.bridges]])assert.deepEqual(await readRegular(repository,path),encode(value),'Governance differs '+path);for(const[path,bytes]of p.before)if(path.includes('/events/'))assert.deepEqual(await readRegular(repository,path),bytes);const receipt=await adoptionReceipt(p,repository);assert.deepEqual(await readRegular(repository,adoptionPath),encode(receipt));return receipt;}
export async function adoptGovernance(repository=root){const p=await prepareGovernance(repository);const check="import json,sys\nsys.path.insert(0,'tests/governance')\nfrom validate_source_reviews import load_schemas,schema_errors\nschemas,registry=load_schemas()\nvalues=json.load(sys.stdin)\nerrors=[]\nfor name,value in values.items(): errors.extend(schema_errors(value,schemas[name],registry,name))\nassert not errors, '\\n'.join(errors)\n";execFileSync(resolve(repository,'.venv/bin/python'),['-B','-c',check],{cwd:repository,input:JSON.stringify({'source-register.schema.json':p.register,'source-review-event.schema.json':p.event,'source-review-index.schema.json':p.index}),stdio:['pipe','inherit','inherit']});
 for(const[path,value]of[[registerPath,p.register],[indexPath,p.index]]){const bytes=await readRegular(repository,path);assert.ok(bytes.equals(p.before.get(path))||bytes.equals(encode(value)),'Unexpected living file '+path);}
 for(const[path,bytes]of p.before)await writeExclusive(repository,baselineRoot+'/'+path,bytes);
 await writeExclusive(repository,bridgePath,encode(p.bridges));await writeExclusive(repository,eventPath,encode(p.event));
 await writeFile(resolve(repository,registerPath),encode(p.register));execFileSync(process.execPath,[resolve(repository,'scripts/build-source-review-index.mjs')],{cwd:repository,stdio:'inherit'});
 assert.deepEqual(await readRegular(repository,indexPath),encode(p.index));await writeExclusive(repository,adoptionPath,encode(await adoptionReceipt(p,repository)));return verifyGovernance(repository);}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.ok(process.argv.length===2||(process.argv.length===3&&['--write','--check'].includes(process.argv[2])));console.log(JSON.stringify(await(process.argv[2]==='--write'?adoptGovernance():verifyGovernance()),null,2));}
