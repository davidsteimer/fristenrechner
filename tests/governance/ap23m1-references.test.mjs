// SPDX-License-Identifier: AGPL-3.0-only
// Research-only arithmetic and completion boundaries. No product imports or release.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {evaluate,holidays,paused,validDate,add,easter} from '../../scripts/check-ap23m1.mjs';
import {metadataFromEvidence,validateCompletionMetadata,completionFlags,tapCounts,passedTests} from '../../scripts/finalize-ap23m1.mjs';
const window={from:'2026-08-29',to:'2027-12-31'},calendar={fixed:['01-01','01-02','03-19','08-01','08-15','11-01','12-08','12-25','12-26'],easterOffsets:[1,39,50,60]};
function syntheticPath(edit={}){return{id:'synthetic-vs-policy',canton:'VS',days:null,suspension:'none',calendarBinding:{type:'fixed',calendar:'qualifiedEndCalendar'},
 requirements:[{key:'authorityCanton',value:'VS',reason:'scope'},{key:'openingMode',value:'qualifiedLegalOpening',reason:'opening'}],
 opening:{modeFact:'openingMode',qualifiedValue:'qualifiedLegalOpening',trackingValue:'notSupported'},...edit};}
function syntheticSuite(path=syntheticPath()){return{window,paths:[path],calendars:{qualifiedEndCalendar:calendar}};}
function input(trigger='2026-10-02',days=10,facts={}){return{path:'synthetic-vs-policy',trigger,days,facts:{authorityCanton:'VS',openingMode:'qualifiedLegalOpening',...facts}};}
test('canonical date handling remains independent of locale and product code',()=>{assert.equal(validDate('2027-02-29'),false);assert.equal(validDate('2028-02-29'),true);
 assert.equal(validDate('2.10.2026'),false);assert.equal(add('2026-12-31',1),'2027-01-01');assert.equal(easter(2027),'2027-03-28');});
test('qualified Saturday opening is never normalized by a different canton policy',()=>{const r=evaluate(input('2026-10-03',2),syntheticSuite());assert.equal(r.legalOpening,'2026-10-03');assert.equal(r.end,'2026-10-05');});
test('VS winter ending on January5 stays separate from ordinary three-period calendars',()=>{assert.equal(paused('2027-01-05','threeWinterJan5'),true);assert.equal(paused('2027-01-06','threeWinterJan5'),false);
 assert.equal(paused('2027-01-05','three'),false);assert.throws(()=>paused('2027-01-05','unconfirmedPolicy'));});
test('administrative and judicial winter arithmetic use separate explicit policies',()=>{
 assert.equal(evaluate(input('2026-12-10',30),syntheticSuite()).end,'2027-01-11');
 assert.equal(evaluate(input('2026-12-10',30),syntheticSuite(syntheticPath({suspension:'threeWinterJan5'}))).end,'2027-01-28');});
test('general end holiday does not remove days inside the counting interval',()=>{const s=syntheticSuite();assert.equal(holidays('qualifiedEndCalendar',2026,s).has('2026-12-08'),true);
 assert.equal(evaluate(input('2026-12-07',1),s).end,'2026-12-09');assert.equal(evaluate(input('2026-12-07',2),s).end,'2026-12-09');});
test('VS calendar does not silently receive Good Friday',()=>{const s=syntheticSuite();assert.equal(holidays('qualifiedEndCalendar',2027,s).has('2027-03-26'),false);assert.equal(evaluate(input('2027-03-25',1),s).end,'2027-03-26');});
test('a specifically bound federal-fast Monday never adds the preceding Sunday as another holiday',()=>{const s=syntheticSuite();s.calendars.qualifiedEndCalendar={fixed:[],easterOffsets:[],federalFastMonday:true};
 assert.equal(holidays('qualifiedEndCalendar',2026,s).has('2026-09-21'),true);assert.equal(holidays('qualifiedEndCalendar',2026,s).has('2026-09-20'),false);
 assert.equal(holidays('qualifiedEndCalendar',2027,s).has('2027-09-20'),true);assert.equal(holidays('qualifiedEndCalendar',2027,s).has('2027-09-19'),false);});
test('a half-day closure in an end calendar cannot change an already qualified opening',()=>{
 const s=syntheticSuite();s.calendars.qualifiedEndCalendar={fixed:['12-24','12-25','12-26'],easterOffsets:[]};const r=evaluate(input('2026-12-24',1),s);
 assert.equal(r.legalOpening,'2026-12-24');assert.equal(r.ordinaryStart,'2026-12-25');assert.equal(r.end,'2026-12-28');});
test('actual end-shift into a new recess stays unresolved, without definitive end',()=>{const r=evaluate(input('2027-03-19',1),syntheticSuite(syntheticPath({suspension:'threeWinterJan5'})));
 assert.equal(r.outcome,'unresolvedBoundaryProposed');assert.equal(r.reason,'M1-END-SUSPENSION');assert.equal(Object.hasOwn(r,'end'),false);});
test('lawfully longer duration still needs actual matching days above actual ordinary basis',()=>{
 const p=syntheticPath({durationFact:'actualInstructionDays',durationBaseFact:'ordinaryDays'}),s=syntheticSuite(p);
 assert.equal(evaluate(input('2026-10-02',40,{actualInstructionDays:40,ordinaryDays:30}),s).end,'2026-11-11');
 for(const facts of[{actualInstructionDays:30,ordinaryDays:30},{actualInstructionDays:39,ordinaryDays:30},{actualInstructionDays:40}])assert.equal(evaluate(input('2026-10-02',40,facts),s).outcome,'qualificationBoundaryProposed');});
test('missing, foreign and unsupported current facts cannot be inferred',()=>{
 const s=syntheticSuite();assert.equal(evaluate(input('2026-10-02',10,{authorityCanton:undefined}),s).reason,'scope');
 assert.equal(evaluate(input('2026-10-02',10,{openingMode:'trackingPhysicalReceipt'}),s).reason,'opening');
 assert.equal(evaluate(input('2026-10-02',10,{foreignCantonFact:true}),s).reason,'unknownResearchFact');
 assert.equal(evaluate({...input(),path:'unknown'},s).reason,'unknownResearchPath');});
test('tracking expectation is required only when the specific policy explicitly says so',()=>{
 const opening={modeFact:'openingMode',qualifiedValue:'qualifiedLegalOpening',trackingValue:'explicitlyConfiguredPhysicalReceipt'},p=syntheticPath({requirements:[{key:'authorityCanton',value:'VS',reason:'scope'}],opening}),s=syntheticSuite(p);
 const i=input('2026-10-03',1,{openingMode:'explicitlyConfiguredPhysicalReceipt'});assert.equal(evaluate(i,s).end,'2026-10-06');
 const restricted=syntheticSuite({...p,opening:{...opening,expectedServiceFact:'explicitExpectedService'}});assert.equal(evaluate(i,restricted).reason,'trackingExpectedServiceNotQualified');
 assert.equal(evaluate({...i,facts:{...i.facts,explicitExpectedService:true}},restricted).end,'2026-10-06');});
test('qualified authority regions select exactly one explicit calendar without first-hit or union fallback',()=>{
 const p=syntheticPath({calendarBinding:{type:'qualifiedAuthoritySeat',regionFact:'authorityHolidayRegion',choices:[{value:'general',calendarId:'raw-general'},{value:'leLanderon',calendarId:'raw-landeron'}]}}),s=syntheticSuite(p);
 s.calendars={'raw-general':{fixed:[],easterOffsets:[]},'raw-landeron':{fixed:[],easterOffsets:[60]}};
 assert.equal(evaluate(input('2027-05-26',1,{authorityHolidayRegion:'general'}),s).end,'2027-05-27');
 assert.equal(evaluate(input('2027-05-26',1,{authorityHolidayRegion:'leLanderon'}),s).end,'2027-05-28');
 for(const value of[undefined,'unknown','differentRegion'])assert.equal(evaluate(input('2027-05-26',1,{authorityHolidayRegion:value}),s).reason,'holidayAnchorNotQualified');
 const fixed=syntheticSuite(syntheticPath({calendarBinding:{type:'fixedQualifiedAuthoritySeat',calendarId:'raw-general',seat:'qualifiedCurrentSeat'}}));fixed.calendars=s.calendars;
 assert.equal(evaluate(input('2027-05-26',1),fixed).end,'2027-05-27');});
test('actual currently drafted VS cases remain static analyst inputs, not legal approval',async()=>{
 const x=JSON.parse(await readFile(new URL('../../docs/fachrecht/ap23m1/befund-vs.json',import.meta.url)));assert.ok(x.pathProposals.length>0&&x.localReferenceCases.length>0);
 const s={window,paths:x.pathProposals,calendars:Object.fromEntries(x.calendarProposals.map(c=>[c.id,c.ruleSpec]))};
 for(const c of x.localReferenceCases){const actual=evaluate(c,s);for(const[key,value]of Object.entries(c.expected))assert.deepEqual(actual[key],value,c.id+'/'+key);}
});
function evidence(){return{preservation:{gitHead:'1'.repeat(40),protectedInputSha256:'2'.repeat(64),acceptedL3Archive:{files:1427},startSnapshot:{payloadFiles:8}},
 suite:{window,paths:[{id:'synthetic-ne',canton:'NE'},{id:'synthetic-vd',canton:'VD'},{id:'synthetic-vs',canton:'VS'}],cases:[{id:'a'},{id:'b'},{id:'c'}],calendarProbes:[{id:'calendar'}]},
 pathProposalsByCanton:{NE:1,VD:1,VS:1},referenceOutcomes:{datedResearchValue:3},sourceBindings:[{path:'synthetic-ne'},{path:'synthetic-vd'},{path:'synthetic-vs'}],
 sourceFilesByCanton:{NE:1,VD:1,VS:1},sourceBytes:123,companionBindings:[],companionBytes:0,independent:{calendarEndEligibilityComparisons:17},testCounts:{tests:17}};}
function valid(){const e=evidence();return{e,saved:{...metadataFromEvidence(e),localLinksChecked:1,bindings:[{path:'docs/fachrecht/ap23m1/synthetic.json',byteLength:1,sha256:'3'.repeat(64)}]}};}
test('synthetic metadata derives research totals without fixing actual M1 group counts',()=>{const{e,saved}=valid();assert.equal(validateCompletionMetadata(saved,e),true);assert.equal(saved.pathProposals,e.suite.paths.length);assert.equal(saved.references,e.suite.cases.length);assert.equal(saved.researchTests,e.testCounts.tests);});
for(const flag of completionFlags)test('completion cannot raise '+flag,()=>{const{e,saved}=valid();saved[flag]=true;assert.throws(()=>validateCompletionMetadata(saved,e));});
for(const[key,value]of[['status','accepted'],['workPackage','AP23M2'],['scopeConfirmed',false],['professionalStepStarted',false],['acceptedCantons',26],['operationalCantons',23],
 ['protectedFiles',0],['sourceFiles',0],['references',0],['researchTests',0],['pathProposals',0],['sourceBytes',0],['calendarEndEligibilityComparisons',0],['calendarProbes',0],
 ['currentFormats',{administrativeCatalog:'10.0.0',manifest:'17.0.0',minimumConsumer:'17.0.0'}]])
 test('completion cannot relabel '+key,()=>{const{e,saved}=valid();saved[key]=value;assert.throws(()=>validateCompletionMetadata(saved,e));});
test('metadata is detached from evidence objects before negative tests mutate it',()=>{const{e,saved}=valid();saved.pathProposalsByCanton.NE=99;assert.equal(e.pathProposalsByCanton.NE,1);assert.throws(()=>validateCompletionMetadata(saved,e));});
test('closed metadata rejects unknown authority or unsafe evidence locations',()=>{for(const edit of[s=>{s.publishNow=true;},s=>{s.bindings[0].path='../outside';},s=>{s.bindings.push(s.bindings[0]);},s=>{s.bindings[0].byteLength=-1;},s=>{s.bindings[0].sha256='not-a-hash';},s=>{s.bindings[0].approval=true;},s=>{s.bindings=[];},s=>{s.localLinksChecked=0;}]){
 const{e,saved}=valid();edit(saved);assert.throws(()=>validateCompletionMetadata(saved,e));}});
test('test count parser refuses partial, skipped or failed verification summaries',()=>{const text='# tests 7\n# pass 7\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n',counts=tapCounts(text);passedTests(counts);
 for(const edit of[c=>{c.pass=6;},c=>{c.fail=1;},c=>{c.cancelled=1;},c=>{c.skipped=1;},c=>{c.todo=1;},c=>{c.tests=0;}]){const copy=structuredClone(counts);edit(copy);assert.throws(()=>passedTests(copy));}});
