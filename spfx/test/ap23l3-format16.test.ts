// SPDX-License-Identifier: AGPL-3.0-only
// Tests the actual host validator and source-copy factory without installation or ICS files.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {getProviderCacheIdentity} from '../src/core/cacheIdentity';
import {ReleaseService} from '../src/core/ReleaseService';
import {MemoryValidatedReleaseStore} from '../src/core/ValidatedReleaseStore';
import {createCalculatorRuntime} from '../src/product/core';
import {calculateAdministrativeDeadline} from '../src/product/core/administrativeDeadline';
import {AP23L3_ADMIN,buildSyntheticFormat16} from '../../tests/core/ap23l3Fixtures';
import {approved,candidateRoot,provider,validator,referenceInput} from './ap23l3-fixture';
const suite=JSON.parse(readFileSync(resolve(process.cwd(),'../docs/fachrecht/ap23l1/referenzfaelle.json'),'utf8'));

test('AP23L3 candidate is rejected before any artifact fetch or cache activation',async()=>{
 const requested:string[]=[],source={...provider(),async fetchBytes(path:string){requested.push(path);return new Uint8Array(readFileSync(resolve(candidateRoot,path)));}};
 const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator);
 await assert.rejects(service.refresh(source));assert.deepEqual(requested,['manifest.json']);assert.equal(await service.getActive(source),undefined);
});

test('AP23L3 native16 provider binds44 artifacts,35 physical calendars and196 paths',async()=>{
 const release=await validator.validateProvider(provider()),runtime=createCalculatorRuntime(release);
 assert.equal(release.formatVersion,'16.0.0');assert.equal(release.artifacts.length,44);assert.equal(release.calendarIds.length,35);
 assert.equal(runtime.data.formatVersion,'16.0.0');assert.equal(runtime.administrativeContext!.administrativeCatalog.paths.length,196);
 assert.equal(runtime.data.calendarRuleSets?.size,35);
});

test('AP23L3 actual host source factory calculates or blocks all83 unchanged L1 cases with current explicit facts',async()=>{
 const runtime=createCalculatorRuntime(await validator.validateProvider(provider())),catalog=runtime.administrativeContext!.administrativeCatalog;
 let calculated=0,nondefinitive=0;
 for(const row of suite.cases){
  const input=referenceInput(catalog,row),result=calculateAdministrativeDeadline(input,runtime.administrativeContext);
  assert.deepEqual(input.caseQualification,row.facts,row.id+' facts');
  if(row.expected.outcome==='datedResearchValue'){
   assert.equal(result.outcome,'calculated',row.id);
   if(result.outcome==='calculated'){assert.equal(result.finalEnd,row.expected.end,row.id);assert.equal(result.referenceOnly,false);calculated++;}
  }else{
   assert.notEqual(result.outcome,'calculated',row.id);assert.equal(result.finalEnd,undefined,row.id);
   assert.equal(result.calendarExportAllowed,false,row.id);nondefinitive++;
  }
 }
 assert.equal(calculated,54);assert.equal(nondefinitive,29);
});

test('AP23L3 provider refuses changed component bytes and path traversal before activation',async()=>{
 const corrupt=buildSyntheticFormat16('approved');corrupt.files.set(AP23L3_ADMIN,corrupt.files.get(AP23L3_ADMIN)!+' ');
 await assert.rejects(validator.validateProvider(provider(corrupt)));
 const malformed=buildSyntheticFormat16('approved');malformed.manifest.artifacts[0].path='../foreign.json';
 const requested:string[]=[],source=provider(malformed);
 await assert.rejects(validator.validateProvider({...source,async fetchBytes(path){requested.push(path);return source.fetchBytes(path);}}));
 assert.deepEqual(requested,['manifest.json']);
});

test('AP23L3 source-bound offline fallback never borrows another provider configuration',async()=>{
 const github=await validator.validateProvider(provider()),mirror=await validator.validateProvider(provider(approved,'sharepointMirror'));
 assert.equal(github.manifestSha256,mirror.manifestSha256);
 assert.notEqual(getProviderCacheIdentity(provider()),getProviderCacheIdentity(provider(approved,'sharepointMirror')));
 const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator),source=provider();await service.refresh(source);
 const offline=(value:any)=>({...value,async fetchBytes(){throw Error('L3 offline');}});
 assert.equal((await service.refresh(offline(source))).mode,'fallback');
 const foreign={...provider(),cacheConfiguration:{kind:'github' as const,baseUrl:'https://raw.githubusercontent.com/example/foreign/'+'2'.repeat(40)+'/format16'}};
 await assert.rejects(service.refresh(offline(foreign)),/L3 offline/);
});
