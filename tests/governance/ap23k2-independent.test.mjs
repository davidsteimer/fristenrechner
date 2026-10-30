// SPDX-License-Identifier: AGPL-3.0-only
// Counterchecks run in Python without invoking a JS evaluator or importing product calculation code.
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const python=fileURLToPath(new URL('../../.venv/bin/python',import.meta.url));
const options={cwd:root,encoding:'utf8',maxBuffer:4*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}};
const setup=`
from scripts.check_ap23k2_independent import *
manifest=load(BUNDLE/'manifest.json')
catalog=load(BUNDLE/ADMIN)
old=load(BASE/ADMIN)
suite=load(SUITE)
payloads=[load(BUNDLE/ref['path']) for ref in manifest['artifacts']]
calendars={row['calendarId']:row for row in payloads if row['dataKind']=='calendar'}
holiday=load(BUNDLE/HOLIDAY)
names={'catalog':'administrative-procedure-catalog-v8.schema.json','input':'administrative-input-v8.schema.json',
       'manifest':'release-manifest-v15.schema.json','localManifest':'local-reference-manifest-v15.schema.json'}
validators={key:Draft202012Validator(load(ROOT/'schemas/candidates/ap23k2'/name),format_checker=FormatChecker())
            for key,name in names.items()}
seed,_=adapt(next(row for row in suite['cases'] if row['id']=='K1-BS-R03'),suite)
def checked(value):
    return evaluate(value,catalog,calendars,holiday,validators['input'])
def reseal(value):
    paths=index(value['paths'],'pathId')
    policies=index(value['qualificationPolicies'],'pathId')
    bindings=index(value['holidayBindings'],'holidayBindingId')
    for entry in value['releaseBinding']['pathEligibility']:
        if paths[entry['pathId']].get('contractFamily')!='qualifiedDayProcedureV8':
            continue
        path=paths[entry['pathId']]
        policy=policies[entry['pathId']]
        binding=bindings[path['holidayBindingId']]
        policy['pathSha256']=digest(path)
        entry.update(pathSha256=digest(path),qualificationPolicySha256=digest(policy),
                     holidayBindingSha256=digest(binding),calendarSelectionSha256=digest(binding['calendarSelection']),
                     annualEndShiftPolicySha256=digest(binding['annualEndShiftPolicy']))
def structure_rejects(value):
    reseal(value)
    try:
        validate_structure(value,old,suite,calendars,holiday,manifest)
    except AssertionError:
        return
    raise AssertionError('Resealed semantic mutation passed independent structure inspection')
`;
function py(body){return execFileSync(python,['-B','-c',setup+'\n'+body],options);}

test('Python independently verifies actual candidate bytes, original static expectations and Node evidence',()=>{
  const result=JSON.parse(execFileSync(python,['-B','scripts/check_ap23k2_independent.py'],options));
  assert.equal(result.status,'passedIndependentStructuralAndResearchComparison');
  assert.equal(result.referenceCases,65);assert.equal(result.diagnosticBranchOracleCases,2);
  assert.equal(result.independentSyntheticCases,44);assert.equal(result.parallelSyntheticComparisons,46);
  assert.equal(result.sgJanuaryCalendarDiagnosticCases,4);assert.deepEqual(result.discrepancies,[]);
  assert.equal(result.physicalCalendarDiagnosticCases,7);
  assert.equal(result.nodeConsumerComparisons,65);assert.equal(result.nodeDiagnosticBranchComparisons,2);
  assert.equal(result.runtimeActive,false);assert.equal(result.sourceReleaseApproved,false);assert.equal(result.calendarExportEnabled,false);
});
test('Python input schema blocks native date overflow, booleans as durations and foreign input keys',()=>py(`
for key,value in [('trigger','2027-02-30'),('days',True),('days',0),('days',1.5),('role','partyWithoutRepresentative')]:
    item=copy.deepcopy(seed)
    item[key]=value
    assert checked(item)['outcome']=='qualificationBoundaryProposed'
`));
test('Python holiday qualification never invents an anchor or a representation role',()=>py(`
for facts in [{}, {'legalAnchorCanton':''}, {'legalAnchorCanton':['BS','TI']},
              {'legalAnchorQualification':'authoritySeatOnly'}, {'representativeRole':'professional'}]:
    item=copy.deepcopy(seed)
    if not facts:
        item['facts'].pop('legalAnchorCanton')
    else:
        item['facts'].update(facts)
    assert checked(item)['outcome']=='qualificationBoundaryProposed'
`));
test('Python AI and NE area facts must be current closed Boolean maps, not strings, arrays or a foreign scope',()=>py(`
for canton,scope in [('AI','AI-RTG-INNER-ADDITIONAL'),('NE','NE-LANDERON-ADDITIONAL')]:
    for area in [None,{scope:'false'},[{ 'scopeId':scope,'member':False}],{'foreign':True},{scope:False,'foreign':False}]:
        item=copy.deepcopy(seed)
        item['facts']['legalAnchorCanton']=canton
        if area is not None:
            item['areaFacts']=area
        assert checked(item)['outcome']=='qualificationBoundaryProposed'
`));
test('Python evaluates both AI and NE membership variants against independently specified actual holiday dates',()=>py(`
rows=[row for row in synthetic_references(suite,catalog) if row['id'].startswith(('PY-K2-AREA-AI-F','PY-K2-AREA-AI-T','PY-K2-AREA-NE-F','PY-K2-AREA-NE-T'))]
assert len(rows)==4
assert [checked(row['input'])['end'] for row in rows]==['2027-09-22','2027-09-23','2027-05-27','2027-05-28']
`));
test('Python checks all 28 terminal variants without freely joining calendars',()=>py(`
rows=[row for row in synthetic_references(suite,catalog) if row['id'].startswith('PY-K2-OCT-')]
assert len(rows)==28
assert all(checked(row['input'])['end']=='2026-10-12' for row in rows)
`));
test('Python keeps BL annual closures separate from the same physical holiday anchor used by BS',()=>py(`
peers=load(OUT/'QA-AP23K2.json')['syntheticProbeResults']
bs=next(row['input'] for row in peers if row['id']=='bs-court-bl-anchor-no-bl-office-closure')
bl=next(row['input'] for row in peers if row['id']=='bl-procedure-uses-annual-closure-chain')
assert checked(bs)['end']=='2026-12-24'
assert checked(bl)['end']=='2027-01-04'
`));
test('Python BL two-world consumer calculation blocks its definitive result even though each diagnostic world has a date',()=>py(`
original=next(row for row in suite['cases'] if row['id']=='K1-BL-R17')
item,_=adapt(original,suite)
result=checked(item)
assert result['outcome']=='unresolvedBoundaryProposed' and 'end' not in result
assert evaluate(item,catalog,calendars,holiday,validators['input'],False)['end']=='2027-02-09'
assert evaluate(item,catalog,calendars,holiday,validators['input'],True)['end']=='2027-02-10'
for mode in ['noOptionalFullClosure','confirmedFullClosure']:
    bad=copy.deepcopy(item)
    bad['facts']['regionalOfficeMode']=mode
    assert checked(bad)['outcome']=='qualificationBoundaryProposed'
`));
test('Python checks the complete calculation window, not just the opening date',()=>py(`
for trigger in ['2026-08-28','2027-12-31','2028-01-01']:
    item=copy.deepcopy(seed)
    item['trigger']=trigger
    result=checked(item)
    assert result['outcome']=='researchWindowBoundary' and 'end' not in result
`));
test('Python arithmetic checks the actual SG January rule without expanding K1 legal coverage',()=>py(`
rows=sg_january_diagnostics(catalog,calendars,holiday)
assert len(rows)==4 and [row['different'] for row in rows]==[False,False,True,False]
assert all(row['diagnosticCalendarArithmeticOnly'] and row['legalApproval'] is False and row['exportAllowed'] is False for row in rows)
assert [row['outsideK1Window'] for row in rows]==[False,True,True,True]
item=copy.deepcopy(seed)
item['facts']['legalAnchorCanton']='SG'
item['trigger']='2029-01-01'
assert checked(item)['outcome']=='researchWindowBoundary'
`));
test('Python perpetual holiday arithmetic covers conditional Stephanstag, NE replacement days and Näfelser Fahrt',()=>py(`
stephan={'calculation':{'type':'fixedMonthDay','month':12,'day':26},'condition':'unlessTuesdayOrSaturday'}
assert rule_day(stephan,2026) is None
assert rule_day(stephan,2027)==date(2027,12,26)
replacement={'calculation':{'type':'fixedMonthDay','month':1,'day':2},'condition':'onlyMonday'}
assert rule_day(replacement,2023)==date(2023,1,2)
assert rule_day(replacement,2027) is None
fahrt={'calculation':{'type':'nthWeekdayOfMonth','month':4,'isoWeekday':4,'occurrence':1},'condition':'shiftHolyThursdayBy7Days'}
assert easter(2026)==date(2026,4,5) and rule_day(fahrt,2026)==date(2026,4,9)
assert easter(2027)==date(2027,3,28) and rule_day(fahrt,2027)==date(2027,4,1)
`));
test('Python holiday projection never leaks relative-period court recess rules into end-shift holidays',()=>py(`
rule={'calculation':{'type':'fixedMonthDay','month':1,'day':1},'effect':{'type':'holiday'},'validity':WINDOW}
fake={'calendarId':'test','validity':WINDOW,'inherits':[],'rules':[rule,{'calculation':{'type':'relativePeriod'},'effect':{'type':'suspension'}}]}
assert calendar_dates('test',{'test':fake},2027)=={date(2027,1,1)}
`));
test('Python structural inspection rejects changed accepted paths and old eligibility even when new objects are resealed',()=>py(`
for field in ['paths','eligibility']:
    bad=copy.deepcopy(catalog)
    if field=='paths':
        bad['paths'][0]['revision']+=1
    else:
        bad['releaseBinding']['pathEligibility'][0]['pathSha256']='0'*64
    structure_rejects(bad)
`));
test('Python structural inspection rejects a resealed missing terminal or projection digest mismatch',()=>py(`
for field in ['missingTerminal','projectionHash']:
    bad=copy.deepcopy(catalog)
    selection=next(row for row in bad['holidayBindings'] if row['holidayBindingId']=='bs-party-representative')['calendarSelection']
    if field=='missingTerminal':
        selection['terminals'].pop()
    else:
        selection['terminals'][0]['variants'][0]['projectionSha256']='0'*64
    structure_rejects(bad)
`));
test('Python structural inspection rejects consumer-controlled BL closures and a fourteen-day annual list',()=>py(`
for field in ['override','extraClosure']:
    bad=copy.deepcopy(catalog)
    annual=next(row for row in bad['holidayBindings'] if row['holidayBindingId']=='bl-authority-seat')['annualEndShiftPolicy']
    if field=='override':
        annual['uncertainty']['inputOverride']='consumerMaySelect'
    else:
        annual['years'][1]['dates'].append('2027-02-10')
    structure_rejects(bad)
`));
test('Python structural inspection rejects resealed norm gaps, federal-recess leakage and runtime promotion',()=>py(`
for field in ['normGap','recess','promotion']:
    bad=copy.deepcopy(catalog)
    path=next(row for row in bad['paths'] if row['pathId']=='bs-court-register-10')
    if field=='normGap':
        path['normTimeline'][1]['interval']['from']='2027-01-02'
    elif field=='recess':
        profile=next(row for row in bad['suspensionProfiles'] if row['suspensionProfileId']=='bs-none')
        profile['periods']=[{'kind':'inventedFederalRecess'}]
    else:
        bad['runtimeActive']=True
    structure_rejects(bad)
`));
test('Python provenance countercheck rejects altered evaluated norm sources or calendar selection',()=>py(`
peer=copy.deepcopy(next(row for row in load(OUT/'QA-AP23K2.json')['results'] if row['id']=='K1-BS-R03'))
independent={'id':peer['id'],'input':peer['input'],'actual':checked(peer['input'])}
for field in ['normSource','calendar']:
    bad=copy.deepcopy(peer)
    if field=='normSource':
        bad['actual']['provenance']['evaluatedNormSegments'][0]['sourceRefs'][0]['sourceId']='invented'
    else:
        bad['actual']['provenance']['calendarId']='wrong-calendar'
    try:
        compare_peer(independent,bad,catalog,[])
    except AssertionError:
        continue
    raise AssertionError('Altered provenance accepted')
`));
test('Python comparison records tampered Node arithmetic rather than treating it as an expected value',()=>py(`
peer=copy.deepcopy(next(row for row in load(OUT/'QA-AP23K2.json')['results'] if row['id']=='K1-BS-R03'))
row={'id':peer['id'],'input':peer['input'],'actual':checked(peer['input'])}
peer['actual']['end']='2026-10-13'
differences=[]
compare_peer(row,peer,catalog,differences)
assert len(differences)==1 and differences[0]['python']['end']=='2026-10-12'
`));
test('Python isolated schema validation rejects local candidate as production release and rejects unknown opening facts',()=>py(`
assert validators['localManifest'].is_valid(manifest)
assert not validators['manifest'].is_valid(manifest)
bad=copy.deepcopy(catalog)
path=next(row for row in bad['paths'] if row['pathId']=='bs-court-register-10')
path['openingPolicy']['triggerKind']='unqualifiedPhysicalReceipt'
assert not validators['catalog'].is_valid(bad)
`));
