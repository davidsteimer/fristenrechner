import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const here=new URL('.',import.meta.url);
const read=async file=>JSON.parse(await fs.readFile(file));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const prior=await read('outputs/release-mvp04-2026-09-22/source-check.json');
const priorEvent=await read('outputs/release-mvp04-2026-09-22/source-event-candidate.json');
const priorJudgments=await read('outputs/release-mvp04-2026-09-22/judgment-refresh.json');
const inventory=await read('outputs/release-mvp05-2026-09-28/source-inventory.json');
const fetched=await read(new URL('fetch-results.json',here));
const futureFetch=await read(new URL('future-fetch-results.json',here));
const articles=await read(new URL('article-extracts.json',here));
const futureArticles=await read(new URL('future-article-comparison.json',here));
const futureIndex=await read(new URL('future-index.json',here));
const pinpoint={
 'JUD-AP17C-VGER-BE-100-2024-8-20240404':['1.1','2'],
 'JUD-AP17C-VGER-BE-200-2017-814-20180117':['1.2'],
 'JUD-BE-VG-100-2016-347':['3.4','3.4.1','3.4.2','4.5'],
 'JUD-BE-VG-100-2017-270':['4.1','4.3','5.2'],
 'JUD-BE-VG-100-2021-189':['4.1','4.2'],
 'JUD-BE-VG-200-2026-421':['4','6'],
 'JUD-BGER-1C-275-2009':['3.3.2'],
 'JUD-BGER-8C-620-2007':['3.3'],
 'JUD-BGER-9C-757-2007':['3'],
};
const checks=inventory.remainingManifestSourceIds.map(sourceId=>{
 const old=prior.checks.find(c=>c.sourceId===sourceId);
 if(!old)throw new Error(`Missing previous source ${sourceId}`);
 const judgment=priorJudgments.checks.find(j=>j.sourceId===sourceId);
 const retrieval=fetched.retrievals.find(f=>f.id===(judgment?sourceId:old.evidenceId));
 if(retrieval?.status!==200)throw new Error(`Retrieval unsuccessful ${sourceId}`);
 if(!judgment && (!retrieval.previousHashMatches || !retrieval.baselineLocalMatchesRecorded))throw new Error(`Original changed ${sourceId}`);
 const previousEntry=priorEvent.entries.find(e=>e.sourceId===sourceId);
 return {
  sourceId,checkedOn:'2026-09-28',outcome:'unchanged',outcomeScope:'Previously modeled deadline rules and previously delimited use of this source, not entire legislation unchanged forever',
  method:judgment?'fresh-mirror-retrieval-and-targeted-pinpoint-read':'fresh-official-original-byte-comparison-and-current-version-check',
  comparisonReviewedOn:'2026-09-22',comparisonBasis:'MVP04 source review, formally accepted separately',
  retrievedFile:retrieval.file,retrievedSha256:retrieval.sha256,retrievedUrl:retrieval.url,
  previousWholeDocumentHashMatches:judgment?null:retrieval.previousHashMatches,
  finding:judgment?judgment.finding:previousEntry.evidence.finding,
  ...(judgment?{pinpointsReadToday:pinpoint[sourceId],limits:judgment.limits,accessMethod:sourceId==='JUD-BE-VG-200-2026-421'?'Entscheidsuche MCP full text':'Swiss Caselaw MCP named pinpoint passages',sourceClassification:'Court text accessed through a nonofficial mirror, not a newly verified official publication address',newCaseLawSearch:false}:{}),
  followUpRequired:false,
 };
});
const currentCantonalVersions=Object.fromEntries(['VRPG','IVOEB','IVOEBG','IVOEBV','PRG','PRV'].map(law=>[law,{current:articles[law].currentVersion,future:articles[law].futureVersions}]));
const report={
 reviewId:'MVP05-REMAINDER-SOURCE-REVIEW-20260928',checkedOn:'2026-09-28',recordStatus:'candidate',formalApproval:false,
 performedBy:'Codex as documented AI work instrument, human approval by David Steimer remains pending',
 scope:'26 remaining manifest source IDs, excluding 27 AP19 IDs handled separately and excluding 82 catalog-only IDs. Additional targeted OF-001 monitoring and 2026-2027 amendment index.',
 counts:{sourceIds:checks.length,freshOfficialOriginalFiles:16,sourceIdsBoundToFreshOfficialOriginals:17,freshJudgmentMirrorFiles:9,targetedJudgmentPinpointChecks:9,unavailable:0,modelRuleChangesRequired:0},
 checks,currentCantonalVersions,
 futureReview:{from:'2026-09-22',to:'2027-12-31',federalLaws:7,articleFilter:false,publicationYearFilter:false,indexEntryCount:futureIndex.results.bindings.length,records:futureIndex.results.bindings.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v.value]))),
  findings:[
   {law:'VwVG',from:'2027-01-01',amendment:'AS 2026 232',articles:['1','2','21','24','47','63','64','65'],newConsolidationAvailable:true,arithmeticArticlesUnchanged:['20','22a'],finding:'Art. 1/2/47 add the Federal Patent Court context, Art. 21 and 24 adjust the IGE designation, Art. 63-65 alter cost/compensation provisions including a ten-year reimbursement limitation. No change to modeled day counting, service fiction, end-date extension or standstill. No patent, cost-reimbursement or other new procedural coverage is activated.',productRuleChangeRequired:false},
   {law:'VPR',from:'2027-07-01',amendment:'AS 2025 314',articles:['2a'],newConsolidationAvailable:true,modeledArticlesUnchanged:['8a','8d','8e'],finding:'Change to reserved federal voting dates, not the modeled filing/deadline rules. The calculator does not generate federal voting dates. No voting calendar function is introduced.',productRuleChangeRequired:false},
  ],normalization:'Body comparison removes authorial notes, whitespace and soft hyphen only. Changed notes and source versions remain in the raw full XML and extracted afterWithNotes fields.',limits:'Index and available consolidations checked as of this date. No guarantee against later publication or incomplete index metadata.'},
 monitoring:{id:'OF-001',status:'open',reviewedOn:'2026-09-28',evidence:['OF001-BJ.html','BBl-2025-2891.xml','versions.json','future-index.json','VwVG-20270101.xml','BGG.xml'],finding:'BJ dossier still links the referendum text. BBl 2025 2891 delegates entry into force to the Federal Council. Current BGG and VwVG texts, the VwVG 2027 consolidation and the queried amendment index do not provide a basis to activate the new weekend delivery fiction. No entry-into-force date is asserted and the monitoring item remains open.',action:'Do not anticipate the proposed fiction. Recheck on official implementation evidence or the next release.'},
 formalGates:['Consolidated human acceptance of the MVP05 source review','Separate data promotion and binding of operative approval metadata'],
 limitations:['No comprehensive search for new case law','Judgment mirrors are not official publication sites','Historical current-source IDs, including SRC-VRPG-BE-20230801, are not rewritten','No source review of 82 catalog-only sources in this workstream','No product data, source register, approved event, runtime release, mirror or environment changed'],
 evidenceBindings:[],
};
for(const path of ['outputs/release-mvp04-2026-09-22/source-check.json','outputs/release-mvp04-2026-09-22/source-event-candidate.json','outputs/release-mvp04-2026-09-22/judgment-refresh.json','outputs/release-mvp04-2026-09-22/source-approval.json','docs/fachrecht/abnahme-quellenpruefung-mvp04.md']) report.evidenceBindings.push({path,sha256:sha(await fs.readFile(path))});
for(const file of ['fetch-results.json','future-fetch-results.json','future-index.rq','future-index.json','versions.rq','versions.json','article-extracts.json','future-article-comparison.json']) report.evidenceBindings.push({path:'outputs/release-mvp05-2026-09-28/sources/remainder/'+file,sha256:sha(await fs.readFile(new URL(file,here)))});
if(checks.length!==26||new Set(checks.map(x=>x.sourceId)).size!==26||futureIndex.results.bindings.length!==9||futureFetch.some(x=>x.status!==200))throw new Error('Incomplete bounded review');
await fs.writeFile(new URL('source-review.json',here),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts:report.counts,formalApproval:report.formalApproval,sha256:sha(await fs.readFile(new URL('source-review.json',here)))},null,2));
