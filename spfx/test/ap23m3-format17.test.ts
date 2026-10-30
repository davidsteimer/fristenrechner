// SPDX-License-Identifier: AGPL-3.0-only
// Actual host validator and source-copy factory. No M365 installation or ICS files.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {getProviderCacheIdentity} from '../src/core/cacheIdentity';
import {ReleaseService} from '../src/core/ReleaseService';
import {MemoryValidatedReleaseStore} from '../src/core/ValidatedReleaseStore';
import {createCalculatorRuntime} from '../src/product/core';
import {calculateAdministrativeDeadline} from '../src/product/core/administrativeDeadline';
import {AP23M3_ADMIN,buildSyntheticFormat17} from '../../tests/core/ap23m3Fixtures';
import {approved,candidateRoot,provider,validator,referenceInput} from './ap23m3-fixture';
const suite=JSON.parse(readFileSync(resolve(process.cwd(),'../docs/fachrecht/ap23m1/referenzfaelle.json'),'utf8'));

test('AP23M3 candidate is rejected before any component request or cache activation',async()=>{
 const requested:string[]=[],source={...provider(),async fetchBytes(path:string){requested.push(path);return new Uint8Array(readFileSync(resolve(candidateRoot,path)));}};
 const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator);
 await assert.rejects(service.refresh(source));assert.deepEqual(requested,['manifest.json']);assert.equal(await service.getActive(source),undefined);
});
test('AP23M3 provider binds44 artifacts35 physical calendars245 administrative paths',async()=>{
 const release=await validator.validateProvider(provider()),runtime=createCalculatorRuntime(release);
 assert.equal(release.formatVersion,'17.0.0');assert.equal(release.artifacts.length,44);assert.equal(release.calendarIds.length,35);
 assert.equal(runtime.data.formatVersion,'17.0.0');assert.equal(runtime.administrativeContext!.administrativeCatalog.paths.length,245);assert.equal(runtime.data.calendarRuleSets?.size,35);
});
test('AP23M3 actual copied source calculates or blocks all109 unchanged references',async()=>{
 const runtime=createCalculatorRuntime(await validator.validateProvider(provider())),context=runtime.administrativeContext!;let calculated=0,blocked=0;
 for(const row of suite.cases){const input=referenceInput(context.administrativeCatalog,row),result=calculateAdministrativeDeadline(input,context);
  assert.deepEqual(input.caseQualification,row.facts,row.id+' facts');
  if(row.expected.outcome==='datedResearchValue'){assert.equal(result.outcome,'calculated',row.id);if(result.outcome==='calculated'){assert.equal(result.finalEnd,row.expected.end,row.id);assert.equal(result.referenceOnly,false);calculated++;}}
  else{assert.notEqual(result.outcome,'calculated',row.id);assert.equal(result.finalEnd,undefined,row.id);assert.equal(result.calendarExportAllowed,false,row.id);blocked++;}}
 assert.equal(calculated,73);assert.equal(blocked,36);
});
test('AP23M3 provider refuses changed bytes and traversal before activation',async()=>{
 const corrupt=buildSyntheticFormat17('approved');corrupt.files.set(AP23M3_ADMIN,corrupt.files.get(AP23M3_ADMIN)!+' ');await assert.rejects(validator.validateProvider(provider(corrupt)));
 const malformed=buildSyntheticFormat17('approved');malformed.manifest.artifacts[0].path='../foreign.json';const requested:string[]=[],source=provider(malformed);
 await assert.rejects(validator.validateProvider({...source,async fetchBytes(path){requested.push(path);return source.fetchBytes(path);}}));assert.deepEqual(requested,['manifest.json']);
});
test('AP23M3 offline fallback never borrows another configured source',async()=>{
 const github=await validator.validateProvider(provider()),mirror=await validator.validateProvider(provider(approved,'sharepointMirror'));
 assert.equal(github.manifestSha256,mirror.manifestSha256);assert.notEqual(getProviderCacheIdentity(provider()),getProviderCacheIdentity(provider(approved,'sharepointMirror')));
 const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator),source=provider();await service.refresh(source);
 const offline=(value:any)=>({...value,async fetchBytes(){throw Error('M3 offline');}});assert.equal((await service.refresh(offline(source))).mode,'fallback');
 const foreign={...provider(),cacheConfiguration:{kind:'github' as const,baseUrl:'https://raw.githubusercontent.com/example/foreign/'+'2'.repeat(40)+'/format17'}};
 await assert.rejects(service.refresh(offline(foreign)),/M3 offline/);
});
