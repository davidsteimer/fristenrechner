# SPDX-License-Identifier: AGPL-3.0-only
"""Independent actual J3-byte checks and Python enumeration versus native results.

The unchanged accepted J2 Python date oracle is explicitly reused. It never
imports or calls Node, the product kernel or the TypeScript candidate builder.
J2's proposal-only structural closure is not reused as a native activation rule.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'outputs/ap23j3-2026-10-27'
BUNDLE=ROOT/'data/candidates/2026-10-27-ap23j3'
OLD=ROOT/'data/candidates/2026-10-22-ap23i3'
ADMIN='administrative-procedures/ch-cantonal-administrative-procedures.json'
def load(path): return json.loads(path.read_bytes())
def sha(raw): return hashlib.sha256(raw).hexdigest()
def evidence(path):
 raw=path.read_bytes()
 return {'path':path.relative_to(ROOT).as_posix(),'byteLength':len(raw),'sha256':sha(raw)}
def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path)
 result=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(result)
 return result
def normalize_native(raw):
 resolution=copy.deepcopy(raw.get('provenance',{}).get('openingResolution'))
 if resolution is not None: resolution['exportAllowed']=False
 if raw['outcome']=='calculated':
  assert resolution is not None
  profile=raw['provenance']['suspensionProfileId']
  return {'outcome':'datedResearchValue','legalOpening':resolution['qualifiedOpeningDate'],'ordinaryStart':raw['ordinaryStart'],
   'firstCountedDay':raw['countedDates'][0],'nominalEnd':raw['provisionalEnd'],'end':raw['finalEnd'],
   'openingShiftDays':(date.fromisoformat(resolution['qualifiedOpeningDate'])-date.fromisoformat(resolution['inputDate'])).days,
   'skippedDays':raw['skippedCalendarDays'],'endShiftDays':(date.fromisoformat(raw['finalEnd'])-date.fromisoformat(raw['provisionalEnd'])).days,
   'suspension':'three' if profile.endswith('-three') else 'two' if profile.endswith('-two') else 'none',
   'temporalBindings':[s['researchBindingId'] for s in raw['provenance']['evaluatedNormSegments']],
   'openingResolution':resolution,'exportAllowed':False}
 reason=raw['blockReasonKeys'][0]
 if reason=='endShiftIntoSuspensionUnresolved':
  assert resolution is not None
  return {'outcome':'unresolvedBoundaryProposed','reason':'J1-END-SUSPENSION','legalOpening':resolution['qualifiedOpeningDate'],
   'nominalEnd':raw['provisionalEnd'],'ordinaryShiftEnd':raw['ordinaryShiftEnd'],'firstSuspendedShiftDate':raw['blockedDate'],
   'openingResolution':resolution,'exportAllowed':False}
 if reason in ('administrative.outsideCaseCoverage','dataCoverageExceeded'):
  return {'outcome':'researchWindowBoundary','reason':'outsideReferenceWindow','exportAllowed':False}
 return {'outcome':'qualificationBoundaryProposed','reason':reason.removeprefix('administrative.'),'exportAllowed':False}

def run():
 oracle_path=ROOT/'scripts/check_ap23j2_independent.py'
 assert sha(oracle_path.read_bytes())=='8b4cf61a428cb6a9590a365686922c7bc1bff0a229bf60d0dcc6dba29f1199f3'
 oracle=module('accepted_j2_python_oracle',oracle_path)
 named=module('accepted_j1_named_calendars',ROOT/'scripts/check_ap23j1_independent.py')
 contract=module('native_j3_independent_contract',ROOT/'tests/data/test_ap23j3_contract.py')
 suite=load(ROOT/'docs/fachrecht/ap23j1/referenzfaelle.json')
 manifest,catalog=load(BUNDLE/'manifest.json'),load(BUNDLE/ADMIN)
 assert manifest['formatVersion']==manifest['compatibility']['minimumConsumerFormatVersion']=='14.0.0'
 assert manifest['releaseStatus']=='candidate' and catalog['contractDecision']=={'id':'DEC-2026-039','status':'approved','on':'2026-10-27'}
 contract.validate(manifest,contract.SCHEMAS[manifest['$schema']])
 contract.meaning(catalog)
 contract.eligibility(catalog)
 files={}
 for descriptor in manifest['artifacts']:
  raw=(BUNDLE/descriptor['path']).read_bytes()
  assert len(raw)==descriptor['byteLength'] and sha(raw)==descriptor['sha256']
  value=json.loads(raw)
  assert value['$schema']==descriptor['schemaId']
  contract.validate(value,contract.SCHEMAS[value['$schema']])
  files[descriptor['contentId']]=value
 calendars={ident:value for ident,value in files.items() if value['dataKind']=='calendar'}
 contract.actual_bindings(manifest,catalog,calendars)
 input_schema=load(ROOT/'schemas/candidates/ap23j2/administrative-input-v7.schema.json')
 input_validator=Draft202012Validator(input_schema,format_checker=FormatChecker())
 native=load(OUT/'native-reference-verification.json')
 assert native['status']=='passedNativeFullReferenceComparison' and len(native['results'])==673
 peers={row['id']:row for row in native['results']}
 assert len(peers)==673
 results=[]
 opening_comparisons=0
 for case in suite['cases']:
  item=oracle.adapt(case,suite)
  actual=oracle.evaluate(item,catalog,calendars,input_validator,manifest['coverage'])
  peer=peers[case['id']]
  assert peer['input']['caseQualification']==item['facts'],('No default fact completion',case['id'])
  assert peer['input']['inputDate']==item['trigger'] and peer['input']['deadlineDays']==item['days']
  assert peer['input']['selection']['pathId']==item['path']
  assert peer['provenance']==oracle.research_provenance(case)
  from_raw=normalize_native(peer['native'])
  assert actual==from_raw==peer['actual'],(case['id'],actual,from_raw,peer['actual'])
  for key,value in case['expected'].items(): assert actual[key]==value,(case['id'],key)
  assert peer['native']['calendarExportAllowed'] is False
  if actual['outcome'] in ('datedResearchValue','unresolvedBoundaryProposed'):
   opening_comparisons+=1
   p=peer['native']['provenance']
   path=next(row for row in catalog['paths'] if row['pathId']==p['pathId'])
   assert p['openingResolution']['openingPolicySha256']==oracle.digest(path['openingPolicy'])
   profile=next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId']==p['suspensionProfileId'])
   assert p['suspensionProfileSha256']==oracle.digest(profile)
   assert p['suspensionSelectionSha256']==oracle.digest(path['suspensionSelection'])
  results.append({'id':case['id'],'actual':actual})
 comparisons=0
 for canton in ('FR','GE','JU'):
  for year in (2026,2027):
   raw_dates=oracle.calendar_dates(oracle.CALENDARS[canton],calendars,year,False)
   named_dates=named.holidays(canton+'-RESEARCH-ALL',year,suite)
   for n in range((date(year,12,31)-date(year,1,1)).days+1):
    day=date(year,1,1)+timedelta(days=n)
    assert (day.weekday()>=5 or day in raw_dates)==(day.weekday()>=5 or day in named_dates)
    comparisons+=1
 for probe in suite['calendarProbes']:
  day=date.fromisoformat(probe['date'])
  assert (day in oracle.calendar_dates(oracle.CALENDARS[probe['calendar'][:2]],calendars,day.year,False))==probe['isHoliday']
 crosswalk=load(ROOT/'outputs/ap23j2-candidate-2026-10-27/source-crosswalk.json')['sourceRows']
 assert len(crosswalk)==19
 for row in crosswalk:
  for pin in row['evidence']:
   body=(ROOT/pin['path']).read_bytes()
   assert sha(body)==pin['sha256'] and len(body)==pin['byteLength']
 unchanged=sum((BUNDLE/d['path']).read_bytes()==(OLD/d['path']).read_bytes() for d in manifest['artifacts'])
 assert unchanged==42 and len(calendars)==35
 holiday=files['ch-holiday-catalog']
 assert len(holiday['data']['rules'])==479 and len(holiday['activation']['supplementalRules'])==20
 assert sum(len(c['rules']) for c in calendars.values())==431
 assert opening_comparisons==96 and comparisons==2190
 paths=[Path(__file__),oracle_path,ROOT/'scripts/check_ap23j1_independent.py',ROOT/'tests/data/test_ap23j3_contract.py',
  OUT/'native-reference-verification.json',ROOT/'outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json',
  ROOT/'docs/fachrecht/ap23j1/referenzfaelle.json',BUNDLE/'manifest.json',BUNDLE/ADMIN]
 return {'workPackage':'AP23J3','status':'passedIndependentNativeComparison','referenceCases':len(results),'counts':dict(Counter(row['actual']['outcome'] for row in results)),
  'calendarEndEligibilityComparisons':comparisons,'calendarProbes':len(suite['calendarProbes']),'unchangedRawArtifacts':unchanged,
  'physicalCalendars':35,'physicalProjectionRules':431,'baseHolidayRules':479,'supplementalHolidayRules':20,'holidayRules':499,
  'preservedPaths':113,'newPaths':36,'sourceByteBindings':len(crosswalk),'openingProvenanceComparisons':opening_comparisons,
  'sourceReleaseApproved':False,'calendarExportEnabled':False,'discrepancies':[],
  'method':'Unchanged accepted J2 Python date oracle explicitly reused against independently normalized actual native Format14 results and actual candidate bytes. No Node or product imports.',
  'results':results,'inputs':[evidence(path) for path in paths]}

if __name__=='__main__':
 parser=argparse.ArgumentParser()
 parser.add_argument('--write',action='store_true')
 args=parser.parse_args()
 report=run()
 if args.write:
  OUT.mkdir(parents=True,exist_ok=True)
  (OUT/'independent-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({**report,'results':len(report['results']),'inputs':len(report['inputs'])},ensure_ascii=False,indent=2))

