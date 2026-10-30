// SPDX-License-Identifier: AGPL-3.0-only
// R10-A1 technical inventory only. No network, fresh legal review or promotion.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
import {collectReferenceGraph} from './inventory-mvp08-sources.mjs';
import {collectHistoricalCatalogGraph} from './inventory-mvp09-sources.mjs';

export const repositoryRoot=fileURLToPath(new URL('../',import.meta.url));
export const inventoryPaths=Object.freeze({
 candidate:'data/candidates/2026-10-28-ap23m3',prior:'data/releases/2026-10-18-mvp-09-approved.1',
 priorInventory:'outputs/release-mvp09-2026-10-18/sources/source-inventory.json',
 priorReview:'outputs/release-mvp09-2026-10-18/source-review-completeness.json',
 priorCalendarReview:'outputs/release-mvp09-2026-10-18/sources/calendar-review.json',
 priorApproval:'outputs/release-mvp09-2026-10-18/source-approval.json',
 priorAdoption:'outputs/release-mvp09-2026-10-18/source-governance-adoption.json',
 register:'data/source-reviews/source-register.json',
 output:'outputs/r10-a1-2026-10-28/sources/source-inventory.json'
});
const pins=Object.freeze({
 [inventoryPaths.candidate+'/manifest.json']:'4519b40136fd533600b7cda85d941c87dfc14826325a5e542534e5257cedddad',
 [inventoryPaths.prior+'/manifest.json']:'3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265',
 [inventoryPaths.priorApproval]:'4a05e80c0324573f83c88463ba78d20970d0d2152b76f15766bd848bc13a9c68',
 [inventoryPaths.priorAdoption]:'59157237a1a15c86238e675c61f6f7c08984a57927704bc12059b8eb7670ca6e'
});
export const trancheConfig=Object.freeze('FGHIJKLM'.split('').map(letter=>{
 const date='FGHI'.includes(letter)?'2026-10-22':'2026-10-27';
 const prefix='outputs/ap23'+letter.toLowerCase()+'1-'+date;
 return Object.freeze({id:'AP23'+letter+'1',letter,date,prefix,
  report:prefix+(letter==='F'?'/sources-index.json':'/local-completion.json'),
  rawIndex:prefix+(letter==='F'?'/sources-index.json':'GHIJK'.includes(letter)?'/evidence-verification.json':'/local-completion.json'),
  review:letter==='M'?'docs/fachrecht/ap23m1/quellenpruefung.md':'docs/fachrecht/quellenpruefung-ap23'+letter.toLowerCase()+'1.md',
  acceptance:'docs/fachrecht/abnahme-ap23'+letter.toLowerCase()+'1.md',
  findings:({G:['ur','so','sh'],H:['ow','nw'],I:['gl','tg'],J:['fr','ge','ju'],K:['bs','bl']}[letter]??[]).map(c=>'docs/fachrecht/ap23'+letter.toLowerCase()+'1/befund-'+c+'.json'),
  registers:letter==='L'?['docs/fachrecht/ap23l1/quellen-ai.json','docs/fachrecht/ap23l1/quellen-sz.json']:
   letter==='M'?['docs/fachrecht/ap23m1/quellen-ne.json','docs/fachrecht/ap23m1/quellen-vd.json','docs/fachrecht/ap23m1/quellen-vs.json']:[]});
}));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),unique=values=>[...new Set(values)].sort(),minus=(a,b)=>a.filter(x=>!b.includes(x));
const adminPath='administrative-procedures/ch-cantonal-administrative-procedures.json';
const countBy=(rows,key)=>rows.reduce((acc,row)=>({...acc,[row[key]]:(acc[row[key]]??0)+1}),{});
export function safeRelative(relative){assert.equal(typeof relative,'string');assert.ok(relative&&!relative.startsWith('/')&&!/[:\\\x00-\x1f\x7f]/u.test(relative)&&relative.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe relative path '+relative);return relative;}
function readBytes(root,relative){const absolute=path.resolve(root,safeRelative(relative)),physical=fs.realpathSync(absolute);assert.ok(physical.startsWith(fs.realpathSync(root)+path.sep),'Path outside repository '+relative);assert.ok(fs.statSync(physical).isFile());return fs.readFileSync(absolute);}
function uniqueRows(rows,key,label){assert.ok(Array.isArray(rows),label);const ids=rows.map(r=>r[key]);assert.ok(ids.every(x=>typeof x==='string'&&x.length),label+' missing ID');assert.equal(new Set(ids).size,ids.length,label+' duplicate ID');return new Map(rows.map(r=>[r[key],r]));}
function definitions(documents){const map=new Map();for(const document of documents){safeRelative(document.path);uniqueRows(document.value.sources??[],'sourceId',document.path);for(const source of document.value.sources??[]){if(!map.has(source.sourceId))map.set(source.sourceId,[]);map.get(source.sourceId).push({documentPath:document.path,source});}}return map;}
function rawDescriptor(row,registry){const relative=row.raw?.path??row.path??(registry?.sourceBase&&row.file?registry.sourceBase+'/'+row.file:row.file);return{path:safeRelative(relative),byteLength:row.raw?.bytes??row.byteLength??row.bytes,sha256:row.raw?.sha256??row.sha256};}
function metadataRecords(value,indexPath,evidenceBySha,groupFiles,pointer='',inherited={}){
 const records=[];if(Array.isArray(value)){value.forEach((v,i)=>records.push(...metadataRecords(v,indexPath,evidenceBySha,groupFiles,pointer+'/'+i,inherited)));return records;}
 if(!value||typeof value!=='object')return records;
 const context={...inherited};for(const key of['url','requestedUrl','finalUrl','id','sourceId','reviewedOn','observedOn','retrievedAt','downloadedAt','checkedOn','role','sourceType','type','scope','readScope','reviewScope','readingEvidence','locators','fullTextReviewedMeaning','version','edition','effectiveFrom','documentVersionDate','title','access','limit','holdingUsed','findingUsed','relevantArticles'])if(value[key]!==undefined)context[key]=value[key];
 const sha256=value.sha256??value.raw?.sha256;
 if(typeof sha256==='string'&&evidenceBySha.has(sha256)&&[context.url,context.requestedUrl,context.finalUrl].some(x=>typeof x==='string'&&/^https?:\/\//u.test(x)))records.push({registry:indexPath,pointer,metadata:context,evidence:evidenceBySha.get(sha256),association:'Verified SHA in historical metadata. Its URL may identify the instrument rather than the download address of each representation.'});
 if([context.url,context.requestedUrl,context.finalUrl].some(x=>typeof x==='string'&&/^https?:\/\//u.test(x))){const declared=[value.sourceEvidence,value.evidence].flatMap(x=>Array.isArray(x)?x:x?[x]:[]);for(const reference of declared){const local=typeof reference==='string'?reference:reference?.path??reference?.file;if(typeof local!=='string')continue;const matched=groupFiles.filter(r=>r.path===local||(!local.includes('/')&&path.basename(r.path)===local));if(matched.length===1)records.push({registry:indexPath,pointer,metadata:context,evidence:matched,association:'explicit local file reference in historical finding, not a new content assessment'});}}
 for(const[key,child]of Object.entries(value))records.push(...metadataRecords(child,indexPath,evidenceBySha,groupFiles,pointer+'/'+key,context));return records;
}
export function loadR10A1InventoryInputs(root=repositoryRoot){
 const bindings=new Map(),pool=new Map(),evidenceByGroup={};
 function bind(relative,expectedSha256,byteLength){const bytes=readBytes(root,relative),row={path:relative,byteLength:bytes.length,sha256:hash(bytes)};
  if(pins[relative])assert.equal(row.sha256,pins[relative],'Pinned input changed '+relative);if(expectedSha256)assert.equal(row.sha256,expectedSha256,'Evidence hash changed '+relative);if(byteLength!==undefined)assert.equal(row.byteLength,byteLength,'Evidence length changed '+relative);
  if(bindings.has(relative))assert.deepEqual(row,bindings.get(relative),'Conflicting evidence '+relative);bindings.set(relative,row);return bytes;}
 const read=relative=>JSON.parse(bind(relative));
 function bundle(prefix){const manifest=read(prefix+'/manifest.json');uniqueRows(manifest.artifacts,'path','Manifest artifacts');return{manifest,documents:manifest.artifacts.map(r=>({path:safeRelative(r.path),value:JSON.parse(bind(prefix+'/'+r.path,r.sha256,r.byteLength))}))};}
 const candidate=bundle(inventoryPaths.candidate),prior=bundle(inventoryPaths.prior),priorInventory=read(inventoryPaths.priorInventory),priorReview=read(inventoryPaths.priorReview),priorCalendarReview=read(inventoryPaths.priorCalendarReview),priorApproval=read(inventoryPaths.priorApproval),priorAdoption=read(inventoryPaths.priorAdoption),register=read(inventoryPaths.register);
 function addPool(group,row,registry){const descriptor=rawDescriptor(row,registry);assert.ok(Number.isSafeInteger(descriptor.byteLength)&&descriptor.byteLength>=0,'Missing byte length '+descriptor.path);assert.match(descriptor.sha256,/^[a-f0-9]{64}$/u);bind(descriptor.path,descriptor.sha256,descriptor.byteLength);
  if(pool.has(descriptor.path))assert.deepEqual(pool.get(descriptor.path),descriptor,'Conflicting historical pool '+descriptor.path);pool.set(descriptor.path,descriptor);(evidenceByGroup[group]??=[]).push(descriptor);return descriptor;}
 for(const row of priorReview.evidence)addPool('MVP09',row);
 for(const row of priorReview.coverage)for(const item of[...row.freshEvidence,...row.reusedEvidence])assert.deepEqual(pool.get(item.path),rawDescriptor(item),'R09 coverage evidence missing from complete pool '+item.path);
 const tranches=[];
 for(const config of trancheConfig){const report=read(config.report),rawIndex=config.rawIndex===config.report?report:read(config.rawIndex);bind(config.review);bind(config.acceptance);
  const registers=[...config.registers,...config.findings].map(p=>({path:p,value:read(p)}));
  if(config.letter==='F')for(const row of rawIndex.files)addPool(config.id,row);
  else if('GHIJK'.includes(config.letter))for(const row of rawIndex.fileInventory)addPool(config.id,row);
  else for(const registry of registers.filter(r=>config.registers.includes(r.path)))for(const row of registry.value.sources)addPool(config.id,row,registry.value);
  tranches.push({config,report,rawIndex,registers});
 }
 for(const group of Object.keys(evidenceByGroup))evidenceByGroup[group]=[...new Map(evidenceByGroup[group].map(r=>[r.path,r])).values()].sort((a,b)=>a.path.localeCompare(b.path));
 const evidenceBySha=new Map();for(const row of pool.values()){if(!evidenceBySha.has(row.sha256))evidenceBySha.set(row.sha256,[]);evidenceBySha.get(row.sha256).push(row);}
 const structured=[];for(const tranche of tranches){structured.push({path:tranche.config.rawIndex,value:tranche.rawIndex,group:tranche.config.id},...tranche.registers.map(r=>({...r,group:tranche.config.id})));
  for(const row of evidenceByGroup[tranche.config.id])if(/(?:source|practice|followup).*bindings\.json$/u.test(path.basename(row.path)))structured.push({path:row.path,value:JSON.parse(bind(row.path,row.sha256,row.byteLength)),group:tranche.config.id});}
 const registryRecords=structured.flatMap(r=>metadataRecords(r.value,r.path,evidenceBySha,evidenceByGroup[r.group]));
 for(const p of['scripts/inventory-r10-a1-sources.mjs','scripts/inventory-mvp08-sources.mjs','scripts/inventory-mvp09-sources.mjs'])bind(p);
 return{candidate,prior,priorInventory,priorReview,priorCalendarReview,priorApproval,priorAdoption,register,tranches,
  historicalEvidence:[...pool.values()].sort((a,b)=>a.path.localeCompare(b.path)),historicalEvidenceByGroup:evidenceByGroup,registryRecords,
  bindings:[...bindings.values()].sort((a,b)=>a.path.localeCompare(b.path))};
}
export function assembleR10A1SourceInventory(inputs){
 const{candidate,prior,priorInventory,priorReview,priorCalendarReview,priorApproval,priorAdoption,register}=inputs;
 assert.equal(candidate.manifest.formatVersion,'17.0.0');assert.equal(candidate.manifest.releaseStatus,'candidate','Only unpromoted candidate');assert.equal(candidate.manifest.sourceSummary.legalBasisReviewStatus,'pending');
 assert.equal(prior.manifest.formatVersion,'9.0.0');assert.equal(prior.manifest.releaseStatus,'approved');assert.equal(priorApproval.recordStatus,'approved');assert.equal(priorAdoption.releaseId,prior.manifest.releaseId);
 const catalog=candidate.documents.find(r=>r.value.dataKind==='holidayCatalog')?.value,priorCatalog=prior.documents.find(r=>r.value.dataKind==='holidayCatalog')?.value,admin=candidate.documents.find(r=>r.path===adminPath)?.value,oldAdmin=prior.documents.find(r=>r.path===adminPath)?.value;
 assert.ok(catalog&&priorCatalog&&admin&&oldAdmin);assert.equal(admin.formatVersion,'10.0.0');assert.equal(admin.runtimeActive,false);assert.equal(admin.releaseBinding.status,'candidate');assert.equal(admin.releaseBinding.approval,null);assert.equal(admin.releaseBinding.sourceReviewRef,null);
 assert.equal(catalog.activation.releaseEligibility.status,'candidate');assert.equal(catalog.activation.releaseEligibility.approval,null);assert.deepEqual(catalog.data,priorCatalog.data,'Historical catalog changed');
 for(const old of priorCatalog.activation.sourceEvidence)assert.deepEqual(catalog.activation.sourceEvidence.find(r=>r.id===old.id),old,'Historical activation evidence changed '+old.id);
 for(const old of priorCatalog.activation.sourceIdMap)assert.deepEqual(catalog.activation.sourceIdMap.find(r=>r.evidenceId===old.evidenceId),old,'Prior canonical mapping changed '+old.evidenceId);
 const defs=definitions(candidate.documents),priorDefs=definitions(prior.documents),manifestIds=unique(candidate.manifest.sourceSummary.sourceIds);
 assert.equal(manifestIds.length,candidate.manifest.sourceSummary.sourceIds.length);assert.deepEqual(manifestIds,unique([...defs.keys()]),'Manifest source summary differs');
 for(const[id,occurrences]of priorDefs)for(const occurrence of occurrences)assert.ok(defs.get(id)?.some(r=>isDeepStrictEqual(r,occurrence)),'Prior source metadata changed '+id);
 const historical=uniqueRows(catalog.data.sources,'id','Historical source catalog'),activation=uniqueRows(catalog.activation.sourceEvidence,'id','Activation evidence'),mappings=uniqueRows(catalog.activation.sourceIdMap,'evidenceId','Canonical evidence mapping');
 assert.deepEqual(unique([...activation.keys()]),unique([...mappings.keys()]));assert.equal(unique([...mappings.values()].map(r=>r.sourceId)).length,mappings.size,'Ambiguous canonical source mapping');
 for(const row of mappings.values())assert.equal(row.sourceId,row.evidenceId.startsWith('SRC-')?row.evidenceId:'SRC-'+row.evidenceId,'Noncanonical mapping');
 const allIds=unique([...manifestIds,...historical.keys(),...[...mappings.values()].map(r=>r.sourceId)]),allIdSet=new Set(allIds),oldReview=uniqueRows(priorReview.coverage,'sourceId','MVP09 review coverage');
 assert.deepEqual(unique([...oldReview.keys()]),unique(priorInventory.rows.map(r=>r.sourceId)),'Prior coverage incomplete');assert.equal(minus([...oldReview.keys()],allIds).length,0,'Prior source omitted');
 const graph=collectReferenceGraph(candidate.documents,allIdSet,mappings),oldGraph=collectReferenceGraph(prior.documents,allIdSet,mappings);
 assert.deepEqual(oldGraph,priorInventory.referenceGraph,'MVP09 actual graph differs from historical inventory');
 const key=row=>row.documentPath+'#'+row.jsonPath,byLocation=new Map(graph.map(r=>[key(r),r])),oldByLocation=new Map(oldGraph.map(r=>[key(r),r]));
 assert.equal(byLocation.size,graph.length,'Duplicate source edge location');for(const old of oldGraph)assert.deepEqual(byLocation.get(key(old)),old,'Existing reference graph changed '+key(old));
 const additions=graph.filter(r=>!oldByLocation.has(key(r))),historicalGraph=collectHistoricalCatalogGraph(catalog,allIdSet);assert.deepEqual(historicalGraph,collectHistoricalCatalogGraph(priorCatalog,allIdSet),'Historical workbook graph changed');
 const registered=uniqueRows(register.sources,'sourceId','Live governance register'),priorRows=uniqueRows(priorInventory.rows,'sourceId','Prior inventory');
 const newIds=minus(allIds,[...oldReview.keys()]),newDefinitions=minus(manifestIds,prior.manifest.sourceSummary.sourceIds),newGroups={};
 const priorCalendarRows=uniqueRows(priorCalendarReview.rows,'sourceId','Prior calendar assessment');
 assert.deepEqual(unique([...priorCalendarRows.keys()]),unique(priorReview.coverage.filter(r=>r.reviewGroup==='calendar').map(r=>r.sourceId)),'Calendar review ownership mismatch');
 const binding=p=>{const row=inputs.bindings.find(r=>r.path===p);assert.ok(row,'Unbound metadata '+p);return row;};
 const rows=allIds.map(sourceId=>{
  const previous=oldReview.get(sourceId),sourceRecords=defs.get(sourceId)??[],oldRecord=priorRows.get(sourceId),historic=historical.get(sourceId),uses=graph.filter(r=>r.sourceId===sourceId),newUses=additions.filter(r=>r.sourceId===sourceId);
  const activationRecords=[...mappings.values()].filter(r=>r.sourceId===sourceId).map(r=>activation.get(r.evidenceId));
  const urls=unique([...sourceRecords.map(r=>r.source.url),historic?.url,...activationRecords.map(r=>r.url)].filter(Boolean));
  const stageIds=unique(sourceRecords.flatMap(r=>r.source.reviewBasis?.match(/AP23([F-M])1/gu)??[]));
  const assessments=stageIds.map(id=>{const tranche=inputs.tranches.find(r=>r.config.id===id);assert.ok(tranche,'Missing tranche assessment '+id);return{workPackage:id,originalReportDate:tranche.config.date,review:binding(tranche.config.review),acceptance:binding(tranche.config.acceptance),report:binding(tranche.config.report),boundRawEvidenceCount:inputs.historicalEvidenceByGroup[id].length,claim:'Existing tranche-specific interpretation and evidence only. No fresh R10-A2 retrieval or content assessment.'};});
  if(!previous){assert.equal(stageIds.length,1,'New source must have one identifiable originating tranche '+sourceId);(newGroups[stageIds[0]]??=[]).push(sourceId);}
  const associatedEvidence=inputs.registryRecords.filter(record=>[record.metadata.url,record.metadata.requestedUrl,record.metadata.finalUrl].some(url=>urls.includes(url)));
  const relatedPrior=priorInventory.rows.filter(r=>r.sourceId!==sourceId&&r.urls.some(url=>urls.includes(url))).map(r=>({sourceId:r.sourceId,exactMatchingUrls:r.urls.filter(url=>urls.includes(url)),identityConfirmed:false,meaning:'Exact recorded URL overlap only. Not an alias, equal version, legal equivalence or new positive use approval.'}));
  const ownerLotId=previous?previous.reviewGroup==='baseline'?'R10-A2-BASELINE':previous.reviewGroup==='administrative'?'R10-A2-ADMIN-PRIOR':previous.reviewGroup==='calendar'?(assert.ok(['activation','catalog'].includes(priorCalendarRows.get(sourceId)?.reviewGroup),'Unknown calendar subgroup'),priorCalendarRows.get(sourceId).reviewGroup==='activation'?'R10-A2-CALENDAR-ACTIVATION':'R10-A2-CALENDAR-CATALOG'):(assert.fail('Unknown prior review group '+previous.reviewGroup)):'R10-A2-'+stageIds[0];
  return{sourceId,ownerLotId,origin:previous?'priorMVP09':'newTrancheSource',kind:sourceRecords[0]?.source.kind??registered.get(sourceId)?.sourceType??null,inManifest:manifestIds.includes(sourceId),inPriorManifest:prior.manifest.sourceSummary.sourceIds.includes(sourceId),newRuntimeDefinitionForExistingCanonicalSource:Boolean(previous&&newDefinitions.includes(sourceId)),inRegister:registered.has(sourceId),
   sourceRecordOccurrences:sourceRecords,historicalCatalogRecord:historic??null,activationEvidenceRecords:activationRecords,urls,
   referenceUse:uses.some(r=>!r.excluded)?'positive-or-shared-reference':uses.length?'exclusion-only':'supporting-or-monitoring-unreferenced',positiveOrSharedEdges:uses.filter(r=>!r.excluded).length,exclusionEdges:uses.filter(r=>r.excluded).length,
   referenceLocations:uses.map(key),priorReferenceLocations:oldGraph.filter(r=>r.sourceId===sourceId).map(key),newReferenceLocations:newUses.map(key),newUseOfPreviouslyReviewedSource:Boolean(previous&&newUses.length),
   historicalProvenanceLocations:historicalGraph.filter(r=>r.sourceId===sourceId).map(key),
  historicalAssessment:previous?{review:binding(inventoryPaths.priorReview),sourcePointer:'/coverage/'+priorReview.coverage.indexOf(previous),originalCheckedOn:priorReview.checkedOn,outcome:previous.outcome,method:previous.method,scope:previous.outcomeScope,relevantProvisions:previous.relevantProvisions,versionFinding:previous.versionFinding,evidence:[...previous.freshEvidence,...previous.reusedEvidence],humanApproval:binding(inventoryPaths.priorApproval),appliesOnlyToPriorRelease:true}:null,
   historicalTrancheAssessments:assessments,historicalUrlAssociatedEvidence:associatedEvidence,relatedPriorExactUrlCandidates:relatedPrior,previouslyRecordedInstrumentRelations:oldRecord?.samePhysicalInstrumentPriorSourceIds??[],
   proposedReviewTreatment:!previous?'assessNewUseAndVersionWithExplicitTrancheReuse':newUses.length?'assessNewUseOfExistingSourceAndCurrentVersion':'assessBoundedReuseWithCurrentVersionScreen',
   reviewNeeds:{currentVersionAndFutureChanges:'pending',contentAndActualUse:'pending',boundedReuseDecision:'pending',newUsesRequireExplicitAssessment:newUses.length>0,canonicalIdentityNotCollapsed:true},
   declaredProductReviewedOn:unique(sourceRecords.map(r=>r.source.reviewedOn).filter(Boolean)),freshEvidence:[],freshLegalReviewStatus:'pending',sourceReleaseApproved:false,humanApproval:false};
 });
 const paths=uniqueRows(admin.paths,'pathId','Administrative paths'),eligibility=uniqueRows(admin.releaseBinding.pathEligibility,'pathId','Path eligibility');assert.deepEqual(unique([...paths.keys()]),unique([...eligibility.keys()]),'Incomplete path eligibility');
 for(const row of oldAdmin.paths)assert.deepEqual(paths.get(row.pathId),row,'Prior path definition changed '+row.pathId);
 for(const row of eligibility.values()){assert.equal(row.status,'candidate');assert.equal(row.sourceReviewRef,null);assert.equal(row.referenceSuiteRef,null);assert.deepEqual(row.targetComponentRefs,[]);}
 const lotIds=['R10-A2-BASELINE','R10-A2-CALENDAR-ACTIVATION','R10-A2-CALENDAR-CATALOG','R10-A2-ADMIN-PRIOR',...trancheConfig.map(t=>'R10-A2-'+t.id)];
 const reviewLots=lotIds.map(id=>{const owned=rows.filter(r=>r.ownerLotId===id);assert.ok(owned.length,'Empty planned owner lot '+id);return{id,status:'planned-not-reviewed',sourceIds:owned.map(r=>r.sourceId),count:owned.length,
  existingIdsWithNewUses:owned.filter(r=>r.newUseOfPreviouslyReviewedSource).map(r=>r.sourceId),newUseEdges:owned.reduce((n,r)=>n+r.newReferenceLocations.length,0),
  neededChecks:['Identify the exact physical source, language, version and used provisions.','Screen current and already published future versions against applicable product windows.','Read the actually used content or make an explicit, evidence-bound and dated reuse decision.','Assess every new use separately, including new uses of an already reviewed canonical ID.','Preserve source-role and open-boundary limitations. No positive rule from a mere mirror, index, snippet or successful HTTP response.'],
  maySplitForFiveNetDayLimit:true,parallelEssentialWorkPackages:1,netDurationPromise:null,freshLegalReviewPerformed:false,sourceReleaseApproved:false};});
 assert.deepEqual(unique(reviewLots.flatMap(r=>r.sourceIds)),allIds,'Review lots omit a source');assert.equal(reviewLots.flatMap(r=>r.sourceIds).length,allIds.length,'Review lots double-own a source');
 return{inventoryId:'R10-A1-SOURCE-INVENTORY-20261028',workPackage:'R10-A1',formatVersion:'1.0.0',preparedOn:'2026-10-28',recordStatus:'preparation-only',candidateReleaseId:candidate.manifest.releaseId,comparedReleaseId:prior.manifest.releaseId,
  humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,freshLegalVerificationPerformed:false,completeReleaseReview:false,newOnlineRetrievals:0,
  counts:{candidateManifest:manifestIds.length,priorManifest:prior.manifest.sourceSummary.sourceIds.length,allCanonicalSourceIds:allIds.length,priorReviewedSources:oldReview.size,newCanonicalSourceIds:newIds.length,newRuntimeSourceDefinitions:newDefinitions.length,existingCanonicalIdsNewlyDefinedAtRuntime:newDefinitions.filter(id=>oldReview.has(id)).length,
   historicalCatalog:historical.size,activationEvidence:activation.size,priorActivationEvidence:priorCatalog.activation.sourceEvidence.length,newActivationEvidence:activation.size-priorCatalog.activation.sourceEvidence.length,referenceGraphEdges:graph.length,previousReferenceGraphEdges:oldGraph.length,retainedReferenceGraphEdges:oldGraph.length,addedReferenceGraphEdges:additions.length,changedPriorEdges:0,removedPriorEdges:0,
   existingSourceIdsWithNewUses:rows.filter(r=>r.newUseOfPreviouslyReviewedSource).length,referenceGraphKinds:countBy(graph,'kind'),referenceUses:countBy(rows,'referenceUse'),historicalProvenanceEdges:historicalGraph.length,
   boundHistoricalEvidenceFiles:inputs.historicalEvidence.length,boundHistoricalEvidenceBytes:inputs.historicalEvidence.reduce((n,r)=>n+r.byteLength,0),boundHistoricalEvidenceByGroup:Object.fromEntries(Object.entries(inputs.historicalEvidenceByGroup).map(([key,value])=>[key,value.length])),
   newCanonicalByTranche:Object.fromEntries(Object.entries(newGroups).map(([key,value])=>[key,value.length])),newCanonicalKinds:countBy(rows.filter(r=>!oldReview.has(r.sourceId)),'kind'),
   governanceRegister:registered.size,missingFromRegister:minus(allIds,[...registered.keys()]).length,historicalRegisterOnly:minus([...registered.keys()],allIds).length,
   administrativePaths:paths.size,preservedAdministrativePaths:oldAdmin.paths.length,newAdministrativePaths:paths.size-oldAdmin.paths.length,plannedOwnerLots:reviewLots.length,freshOfficialChecks:0},
  groups:{priorMVP09:unique([...oldReview.keys()]),newCanonicalSourceIds:newIds,newRuntimeSourceDefinitions:newDefinitions,newRuntimeDefinitionsOfPreviouslyKnownSources:newDefinitions.filter(id=>oldReview.has(id)),existingSourceIdsWithNewUses:rows.filter(r=>r.newUseOfPreviouslyReviewedSource).map(r=>r.sourceId),...Object.fromEntries(Object.entries(newGroups).map(([k,v])=>[k,v.sort()]))},
  historicalRegisterOnlySourceIds:minus([...registered.keys()],allIds),
  administrativeSourceEligibility:{status:'candidate',runtimeActive:false,approval:null,sourceReviewRef:null,pathEligibility:admin.releaseBinding.pathEligibility},
  interpretation:{countingUnit:'Canonical IDs, not physical statutes, documents or fresh legal reviews. Exact URL overlaps are identity candidates, never automatic aliases.',
   graph:'All literal source uses are enumerated by document and JSON pointer, including positive, shared and excluded uses. Supplementary workbook provenance is a separate non-runtime graph.',
   evidence:'The 1223-path pool contains source bodies, indices, scripts, extracts and alternate representations. Hashes establish existing local byte integrity, not full reading, current online content or a fresh release assessment.',
   dates:'Product reviewedOn fields, prior content assessment dates and original retrieval timestamps remain separate. A later product review date does not imply a new online source retrieval.',
   priorApproval:'MVP09 human approval applies only to the approved prior release. New administrative uses of old sources require their own A2 assessment.',
   limits:'AI conflict, supplemental historical FR mirror, GR/NE reservations, January uncertainties, canton-specific qualification/collision boundaries, AVIV Option B and OF-001 remain unchanged.'},
  historicalEvidenceBindings:inputs.historicalEvidence,historicalEvidenceByGroup:inputs.historicalEvidenceByGroup,trancheMetadataBindings:inputs.tranches.map(t=>({id:t.config.id,date:t.config.date,review:binding(t.config.review),acceptance:binding(t.config.acceptance),report:binding(t.config.report),rawIndex:binding(t.config.rawIndex)})),
  reviewLots,crossCuttingNewUseAssessments:rows.filter(r=>r.newUseOfPreviouslyReviewedSource).map(r=>({sourceId:r.sourceId,ownerLotId:r.ownerLotId,newReferenceLocations:r.newReferenceLocations,requiresExplicitNewUseDecision:true,notAnAdditionalOwnerLot:true})),
  evidenceBindings:inputs.bindings,referenceGraph:graph,priorReferenceGraph:oldGraph,addedReferenceGraph:additions,historicalCatalogProvenanceGraph:historicalGraph,rows};
}
export function writeR10A1Inventory(inventory,root=repositoryRoot){assert.equal(inventory.recordStatus,'preparation-only');for(const key of['humanApproval','sourceReleaseApproved','dataPromotionApproved','publicationApproved','freshLegalVerificationPerformed','completeReleaseReview'])assert.equal(inventory[key],false,'Preparation status '+key);assert.equal(inventory.newOnlineRetrievals,0);
 for(const row of inventory.evidenceBindings){const bytes=readBytes(root,row.path);assert.equal(hash(bytes),row.sha256,'Input changed before write '+row.path);assert.equal(bytes.length,row.byteLength);}
 const target=path.resolve(root,inventoryPaths.output);fs.mkdirSync(path.dirname(target),{recursive:true});assert.ok(fs.realpathSync(path.dirname(target)).startsWith(fs.realpathSync(root)+path.sep));const bytes=Buffer.from(JSON.stringify(inventory,null,2)+'\n');fs.writeFileSync(target,bytes,{flag:'wx'});assert.deepEqual(fs.readFileSync(target),bytes);return{path:inventoryPaths.output,byteLength:bytes.length,sha256:hash(bytes)};}
export function checkR10A1Inventory(inventory,root=repositoryRoot){const bytes=readBytes(root,inventoryPaths.output);assert.deepEqual(JSON.parse(bytes),inventory,'Saved source inventory no longer matches actual inputs');return{path:inventoryPaths.output,byteLength:bytes.length,sha256:hash(bytes)};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const args=process.argv.slice(2);assert.ok(args.length===0||args.length===1&&['--write','--check'].includes(args[0]));const inventory=assembleR10A1SourceInventory(loadR10A1InventoryInputs()),result=args[0]==='--write'?writeR10A1Inventory(inventory):args[0]==='--check'?checkR10A1Inventory(inventory):null;console.log(JSON.stringify({status:'preparation-inventory-verified',counts:inventory.counts,result,freshLegalVerificationPerformed:false,sourceReleaseApproved:false},null,2));}
