# SPDX-License-Identifier: AGPL-3.0-only
"""Independent actual I3-byte checks and Python enumeration vs native results.

The immutable I2 Python date oracle is explicitly reused. It never imports or
calls the JavaScript product, candidate builder or native calculation adapter.
"""
import argparse
import hashlib
import importlib.util
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'outputs/ap23i3-2026-10-22'
BUNDLE=ROOT/'data/candidates/2026-10-22-ap23i3'
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
def run():
 oracle=module('accepted_i2_python_oracle',ROOT/'scripts/check_ap23i2_independent.py')
 contract=module('native_i3_independent_contract',ROOT/'tests/data/test_ap23i3_contract.py')
 suite=load(ROOT/'docs/fachrecht/ap23i1/referenzfaelle.json')
 manifest=load(BUNDLE/'manifest.json')
 catalog=load(BUNDLE/ADMIN)
 assert manifest['formatVersion']==manifest['compatibility']['minimumConsumerFormatVersion']=='13.0.0'
 assert manifest['releaseStatus']=='candidate' and catalog['contractDecision']=={'id':'DEC-2026-038','status':'approved','on':'2026-10-22'}
 contract.validate(manifest,contract.SCHEMAS[manifest['$schema']])
 contract.meaning(catalog)
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
 input_schema=load(ROOT/'schemas/candidates/ap23i2/administrative-input-v6.schema.json')
 input_validator=Draft202012Validator(input_schema,format_checker=FormatChecker())
 native=load(OUT/'native-reference-verification.json')
 assert native['status']=='passedNativeFullReferenceComparison' and len(native['results'])==249
 results=[]
 for case in suite['cases']:
  actual=oracle.evaluate(oracle.adapt(case,suite),catalog,calendars,input_validator)
  peer=next(row for row in native['results'] if row['id']==case['id'])
  assert actual==peer['actual'],(case['id'],actual,peer['actual'])
  for key,value in case['expected'].items(): assert actual[key]==value,(case['id'],key)
  assert peer['native']['calendarExportAllowed'] is False
  if peer['native']['outcome']=='calculated':
   p=peer['native']['provenance']
   profile=next(row for row in catalog['suspensionProfiles'] if row['suspensionProfileId']==p['suspensionProfileId'])
   assert p['suspensionProfileSha256']==oracle.digest(profile)
   path=next(row for row in catalog['paths'] if row['pathId']==p['pathId'])
   assert p['suspensionSelectionSha256']==oracle.digest(path['suspensionSelection'])
   entry=next(row for row in catalog['releaseBinding']['pathEligibility'] if row['pathId']==p['pathId'])
   assert p['permittedSuspensionProfiles']==entry['suspensionProfiles']
  results.append({'id':case['id'],'actual':actual})
 comparisons=0
 for canton in ('GL','TG'):
  for year in (2026,2027):
   raw_dates=oracle.calendar_dates(oracle.CALENDARS[canton],calendars,year,False)
   named=oracle.named_legal_calendar(canton,year)
   for n in range(365):
    day=date(year,1,1)+timedelta(days=n)
    assert (day.weekday()>=5 or day in raw_dates)==(day.weekday()>=5 or day in named)
    comparisons+=1
 for probe in suite['calendarProbes']:
  day=date.fromisoformat(probe['date'])
  assert (day in oracle.calendar_dates(oracle.CALENDARS[probe['calendar'][:2]],calendars,day.year,False))==probe['isHoliday']
 old=load(ROOT/'data/candidates/2026-10-22-ap23h3/manifest.json')
 unchanged=sum((BUNDLE/d['path']).read_bytes()==(ROOT/'data/candidates/2026-10-22-ap23h3'/d['path']).read_bytes() for d in manifest['artifacts'])
 assert unchanged==42 and len(calendars)==35
 paths=[Path(__file__),ROOT/'scripts/check_ap23i2_independent.py',ROOT/'tests/data/test_ap23i3_contract.py',OUT/'native-reference-verification.json',
  ROOT/'docs/fachrecht/ap23i1/referenzfaelle.json',BUNDLE/'manifest.json',BUNDLE/ADMIN]
 return {'workPackage':'AP23I3','status':'passedIndependentNativeComparison','referenceCases':len(results),'counts':dict(Counter(row['actual']['outcome'] for row in results)),
  'calendarEndEligibilityComparisons':comparisons,'calendarProbes':len(suite['calendarProbes']),'unchangedRawArtifacts':unchanged,
  'physicalCalendars':35,'preservedPaths':79,'newPaths':34,'sourceReleaseApproved':False,'calendarExportEnabled':False,
  'method':'Independent Python date enumeration explicitly reused from immutable I2 oracle against actual native Format13 results and actual candidate bytes',
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
