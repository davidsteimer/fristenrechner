# SPDX-License-Identifier: AGPL-3.0-only
"""Independent native J3 schema, exact-byte and accepted-meaning checks."""
import copy
import hashlib
import json
import unittest
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / 'data/candidates/2026-10-27-ap23j3'
ACCEPTED = ROOT / 'outputs/ap23j2-candidate-2026-10-27/bundle'
OLD = ROOT / 'data/candidates/2026-10-22-ap23i3'
ADMIN = 'administrative-procedures/ch-cantonal-administrative-procedures.json'
HOLIDAY = 'holiday-catalogs/ch-holiday-catalog.json'
SOCIAL = 'social-procedures/ch-social-procedures.json'
def read(path):
    return json.loads(path.read_bytes())
def sha(raw):
    return hashlib.sha256(raw).hexdigest()
SCHEMAS = {s['$id']: s for p in (ROOT / 'schemas').rglob('*.json') if '$id' in (s := read(p))}
REGISTRY = Registry().with_resources((k, Resource.from_contents(v)) for k, v in SCHEMAS.items())
def validate(value, schema):
    Draft202012Validator(schema, registry=REGISTRY, format_checker=FormatChecker()).validate(value)

def meaning(catalog):
    accepted = read(ACCEPTED / ADMIN)
    for key in ['paths', 'qualificationPolicies', 'laws', 'sources', 'suspensionProfiles', 'excludedPaths', 'preserved']:
        if catalog[key] != accepted[key]:
            raise AssertionError('Changed accepted native meaning: ' + key)
    for current, prior in zip(catalog['holidayBindings'], accepted['holidayBindings']):
        if {k:v for k,v in current.items() if k != 'physicalBaseline'} != {k:v for k,v in prior.items() if k != 'physicalBaseline'}:
            raise AssertionError('Changed independent legal holiday use')

def digest(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())

def eligibility(admin):
    paths={p['pathId']:p for p in admin['paths']}
    policies={q['pathId']:q for q in admin['qualificationPolicies']}
    entries={e['pathId']:e for e in admin['releaseBinding']['pathEligibility']}
    profiles={p['suspensionProfileId']:p for p in admin['suspensionProfiles']}
    uses={b['holidayBindingId']:b for b in admin['holidayBindings']}
    assert len(paths)==len(policies)==len(entries)==149
    for ident,path in paths.items():
        q,e=policies[ident],entries[ident]
        assert e['status']=='candidate'
        assert e['pathRevision']==q['pathRevision']==path['revision']
        assert e['pathSha256']==q['pathSha256']==digest(path)
        assert e['qualificationPolicySha256']==digest(q)
        assert e['holidayBindingSha256']==digest(uses[path['holidayBindingId']])
        if 'suspensionSelection' in path:
            selection=path['suspensionSelection']
            ids=[selection['suspensionProfileId']] if selection['kind']=='fixed' else [row['suspensionProfileId'] for row in selection['cases']]
            assert e['suspensionSelectionSha256']==digest(selection)
            assert e['suspensionProfiles']==[{'suspensionProfileId':ident,'sha256':digest(profiles[ident])} for ident in sorted(set(ids))]
        else:
            assert e['suspensionProfileId']==path['suspensionProfileId']
            assert e['suspensionProfileSha256']==digest(profiles[path['suspensionProfileId']])
        if 'openingPolicy' in path:
            assert path['contractFamily']==q['mode']=='qualifiedDayProcedureV7'
            assert e['openingPolicySha256']==digest(path['openingPolicy'])
        else:
            assert 'openingPolicySha256' not in e

def actual_bindings(manifest, admin, calendars):
    descriptors = {a['contentId']: a for a in manifest['artifacts']}
    def closure(id, chain=()):
        if id in chain or id not in calendars:
            raise AssertionError('Missing or cyclic actual parent')
        return {id}.union(*(closure(p, chain+(id,)) for p in calendars[id]['inherits']))
    for b in admin['holidayBindings']:
        physical = b['physicalBaseline']
        assert physical['releaseId'] == manifest['releaseId']
        refs = physical['references']
        assert len({r['contentId'] for r in refs}) == len(refs)
        assert {r['contentId'] for r in refs} == closure(physical['calendarId']) | {'ch-holiday-catalog'}
        assert len(refs) == (4 if b.get('bindingVersion') == '5.0.0' else 3)
        for r in refs:
            d = descriptors[r['contentId']]
            assert r == {k: d[k] for k in ['role','contentId','path','sha256']}

class AP23J3Contract(unittest.TestCase):
    def setUp(self):
        self.manifest = read(BUNDLE / 'manifest.json')
        self.admin = read(BUNDLE / ADMIN)
        self.calendars = {p.stem: read(p) for p in (BUNDLE / 'calendars').glob('*.json')}

    def test_45_actual_files_all_schemas_and_bytes(self):
        m = self.manifest
        validate(m, SCHEMAS[m['$schema']])
        self.assertEqual((m['formatVersion'], m['compatibility']['minimumConsumerFormatVersion']), ('14.0.0','14.0.0'))
        self.assertEqual(len(m['artifacts']), 44)
        self.assertEqual(len(m['calendarIds']), 35)
        self.assertEqual(sorted(str(p.relative_to(BUNDLE)) for p in BUNDLE.rglob('*.json')), sorted(['manifest.json']+[a['path'] for a in m['artifacts']]))
        for d in m['artifacts']:
            raw = (BUNDLE/d['path']).read_bytes()
            self.assertEqual((len(raw),sha(raw)),(d['byteLength'],d['sha256']))
            value = json.loads(raw)
            self.assertEqual(value['$schema'], d['schemaId'])
            validate(value, SCHEMAS[value['$schema']])

    def test_149_accepted_meanings_and_113_older_paths(self):
        meaning(self.admin)
        eligibility(self.admin)
        self.assertEqual([len(self.admin[k]) for k in ['paths','qualificationPolicies','laws','suspensionProfiles','holidayBindings']], [149,149,18,35,27])
        old = read(OLD/ADMIN)
        for key in ['paths','qualificationPolicies']:
            values = {p['pathId']:p for p in self.admin[key]}
            for p in old[key]:
                self.assertEqual(values[p['pathId']],p)

    def test_all_35_projection_hashes_are_actual(self):
        h = next(d['sha256'] for d in self.manifest['artifacts'] if d['role']=='holidayCatalog')
        for id,c in self.calendars.items():
            self.assertEqual(c['projection']['sourceHash'],h)
            accepted=read(ACCEPTED/'calendars'/f'{id}.json')
            accepted['projection']['sourceHash']=h
            self.assertEqual(c,accepted)

    def test_transitive_actual_bindings_and_separate_history(self):
        actual_bindings(self.manifest,self.admin,self.calendars)
        accepted=read(ACCEPTED/ADMIN)
        for b in self.admin['holidayBindings']:
            source=next(old for old in accepted['holidayBindings'] if old['holidayBindingId']==b['holidayBindingId'])
            if b.get('bindingVersion')=='7.0.0':
                reuse=b['physicalReuse']
                self.assertEqual(reuse['permissionInheritance'],'none')
                self.assertEqual(reuse['sourceReleaseId'],read(OLD/'manifest.json')['releaseId'])
                self.assertEqual(reuse['sourceCatalogSha256'],sha((OLD/HOLIDAY).read_bytes()))
            if 'projectionEvidence' in b:
                self.assertEqual(b['projectionEvidence'],source['projectionEvidence'])

    def test_all_499_rules_and_104_federal_bindings_are_unchanged(self):
        current=read(BUNDLE/HOLIDAY)
        self.assertEqual(current,read(ACCEPTED/HOLIDAY))
        old=read(OLD/HOLIDAY)
        self.assertEqual(current['data'],old['data'])
        for key in ['matrixDecisions','procedureBindings','anchorPolicies']:
            self.assertEqual(current['activation'][key],old['activation'][key])
        self.assertEqual(len(current['data']['rules'])+len(current['activation']['supplementalRules']),499)
        self.assertEqual(len(current['activation']['procedureBindings']),104)
        self.assertEqual(len(current['activation']['projections']),35)
        self.assertEqual(sum(len(c['rules']) for c in self.calendars.values()),431)

    def test_social_44_50_content_and_actual_targets_remain_limited(self):
        current,old=read(BUNDLE/SOCIAL),read(OLD/SOCIAL)
        for key in ['federalRules','cantonalBindings','suspensionProfiles','filingProfiles','excludedPaths']:
            self.assertEqual(current[key],old[key])
        self.assertEqual((len(current['federalRules']),len(current['cantonalBindings'])),(44,50))
        descriptors={a['contentId']:a for a in self.manifest['artifacts']}
        for e in current['releaseEligibility']:
            self.assertEqual(e['releaseId'],self.manifest['releaseId'])
            self.assertEqual(e['status'],'candidate')
            self.assertIsNone(e['approval'])
            self.assertEqual(e['calculationCoverage']['to'],'2027-12-31')
            for r in e['componentRefs']:
                self.assertEqual(r['sha256'],descriptors[r['contentId']]['sha256'])

    def test_no_release_or_operating_permission_from_decision(self):
        self.assertEqual(self.admin['contractDecision'],{'id':'DEC-2026-039','status':'approved','on':'2026-10-27'})
        self.assertEqual(self.admin['releaseBinding']['status'],'candidate')
        self.assertIsNone(self.admin['releaseBinding']['releaseId'])
        self.assertIsNone(self.admin['releaseBinding']['approval'])
        self.assertFalse(self.admin['runtimeActive'])
        for p in self.admin['releaseBinding']['pathEligibility']:
            self.assertEqual(p['targetComponentRefs'],[])
            self.assertIsNone(p['sourceReviewRef'])
        for key in ['productionActivation','sourceReleaseApproved','calendarExportEnabled']:
            self.assertFalse(self.manifest['extensions']['steimer.local-reference'][key])

    def test_7_independent_definition_mutations_rejected(self):
        for field in ['paths','qualificationPolicies','laws','sources','suspensionProfiles','excludedPaths','holidayBindings']:
            value=copy.deepcopy(self.admin)
            if field=='holidayBindings':
                value[field][-1]['physicalReuse']['permissionInheritance']='invented'
            else:
                value[field][-1]['forged']='changed'
            with self.assertRaises(AssertionError):
                meaning(value)

    def test_3_independent_parent_mutations_rejected(self):
        for action in ['delete','replace','cycle']:
            calendars=copy.deepcopy(self.calendars)
            id='ap23h2-ow-procedural-core'
            if action=='delete':
                del calendars[calendars[id]['inherits'][0]]
            elif action=='replace':
                calendars[id]['inherits']=['ch-federal-calendar']
            else:
                calendars[id]['inherits']=[id]
            with self.assertRaises(AssertionError):
                actual_bindings(self.manifest,self.admin,calendars)

    def test_5_opening_meaning_mutations_rejected(self):
        for edit in ['kind','mode','fallback','timeline','trigger']:
            value=copy.deepcopy(self.admin)
            p=next(p for p in value['paths'] if p['pathId']=='ge-recours-30')
            if edit=='kind': p['openingPolicy']['kind']='qualifiedCurrentTrigger'
            elif edit=='mode': p['openingPolicy']['allowedModes'].pop()
            elif edit=='fallback': p['openingPolicy']['otherwise']='useFirst'
            elif edit=='timeline': p['normTimeline'][0]['interval']['to']='2026-09-01'
            else:
                p=next(p for p in value['paths'] if p['pathId']=='ju-confirmation-request5-initial')
                p['openingPolicy']['triggerKind']='inventedFutureOpening'
            with self.assertRaises(AssertionError): meaning(value)

    def test_3_opening_eligibility_mutations_rejected(self):
        for edit in ['policy','profile','qualification']:
            value=copy.deepcopy(self.admin)
            e=next(e for e in value['releaseBinding']['pathEligibility'] if e['pathId']=='ge-recours-30')
            if edit=='policy': e['openingPolicySha256']='0'*64
            elif edit=='profile': e['suspensionProfiles'].pop()
            else: e['qualificationPolicySha256']='0'*64
            with self.assertRaises(AssertionError): eligibility(value)

    def test_sources_keep_exact_historical_exception_and_complete_roles(self):
        accepted=read(ACCEPTED/ADMIN)
        self.assertEqual(self.admin['sources'],accepted['sources'])
        self.assertEqual(len(self.admin['sources']),85)
        row=next(s for s in self.admin['sources'] if s['sourceId']=='JUD-AP23J1-JU-BGER2D55-2010')
        self.assertEqual(row['kind'],'judgment')
        self.assertEqual(row['url'],'http://relevancy.bger.ch/cgi-bin/JumpCGI?id=01.03.2011_2D_55/2010')

if __name__=='__main__':
    unittest.main(verbosity=2)

