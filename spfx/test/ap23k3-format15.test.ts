// SPDX-License-Identifier: AGPL-3.0-only
// Complete synthetic approvals remain in memory, never a source release.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import {getProviderCacheIdentity} from '../src/core/cacheIdentity';
import {ReleaseService} from '../src/core/ReleaseService';
import {MemoryValidatedReleaseStore} from '../src/core/ValidatedReleaseStore';
import {createCalculatorRuntime} from '../src/product/core';
import {calculateAdministrativeDeadline} from '../src/product/core/administrativeDeadline';
import {administrativeInput15,changeSyntheticFormat15,resealSyntheticFormat15,AP23K3_ADMIN} from '../../tests/core/ap23k3Fixtures';
import {approved,candidateRoot,clone,provider,validator,adminInput} from './ap23k3-fixture';

test('AP23K3 actual candidate fails before any component fetch or cache activation',async()=>{
 const requested:string[]=[],source={...provider(),async fetchBytes(path:string){requested.push(path);return new Uint8Array(readFileSync(resolve(candidateRoot,path)));}};
 const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator);await assert.rejects(service.refresh(source));
 assert.deepEqual(requested,['manifest.json']);assert.equal(await service.getActive(source),undefined);
});
test('AP23K3 full native Format15 bytes activate all165 paths and35 calendars in a synthetic approved shape',async()=>{
 const release=await validator.validateProvider(provider()),runtime=createCalculatorRuntime(release);
 assert.equal(release.formatVersion,'15.0.0');assert.equal(release.artifacts.length,44);assert.equal(release.calendarIds.length,35);
 assert.equal(runtime.data.formatVersion,'15.0.0');assert.equal(runtime.administrativeContext!.administrativeCatalog.paths.length,165);
 const old=calculateAdministrativeDeadline(adminInput,runtime.administrativeContext);assert.equal(old.outcome,'calculated');
 if(old.outcome==='calculated'){assert.equal(old.finalEnd,'2026-11-02');assert.equal(old.referenceOnly,false);}
 const catalog=runtime.administrativeContext!.administrativeCatalog;
 const paths=catalog.paths.filter((p:any)=>p.contractFamily==='qualifiedDayProcedureV8');assert.equal(paths.length,16);
 for(const path of paths){
  const days=path.duration.kind==='statutoryDays'?path.duration.value:10;
  const result=calculateAdministrativeDeadline(administrativeInput15(catalog,path.pathId,'2026-10-02',days),runtime.administrativeContext);
  assert.equal(result.outcome,'calculated',path.pathId);
  if(result.outcome==='calculated'){
   assert.equal(result.finalEnd,({5:'2026-10-07',10:'2026-10-12',30:'2026-11-02'} as Record<number,string>)[days],path.pathId);
   assert.equal(result.provenance.releaseId,release.releaseId);assert.ok(result.provenance.calendarResolution);assert.ok(result.provenance.annualEndShiftResolution);
  }
 }
});
test('AP23K3 provider factory separates BL closures from a BL party anchor in BS court',async()=>{
 const runtime=createCalculatorRuntime(await validator.validateProvider(provider())),c=runtime.administrativeContext!.administrativeCatalog;
 const bs=calculateAdministrativeDeadline(administrativeInput15(c,'bs-court-register-10','2026-12-14',10,undefined,{legalAnchorCanton:'BL'}),runtime.administrativeContext);
 const bl=calculateAdministrativeDeadline(administrativeInput15(c,'bl-admin-appeal-10','2026-12-14',10),runtime.administrativeContext);
 assert.equal(bs.outcome,'calculated');assert.equal(bl.outcome,'calculated');
 if(bs.outcome==='calculated'&&bl.outcome==='calculated'){assert.equal(bs.finalEnd,'2026-12-24');assert.equal(bl.finalEnd,'2027-01-04');
  assert.equal(bs.provenance.annualEndShiftResolution!.kind,'none');assert.ok(bl.provenance.annualEndShiftResolution!.shiftedOfficeClosureDates.length);}
});
test('AP23K3 byte corruption and escaping paths cannot activate a complete provider',async()=>{
 const value=clone();value.files.set(AP23K3_ADMIN,value.files.get(AP23K3_ADMIN)!+' ');await assert.rejects(validator.validateProvider(provider(value)));
 const malformed=clone();malformed.manifest.artifacts[0].path='../foreign.json';const requested:string[]=[],source=provider(malformed);
 await assert.rejects(validator.validateProvider({...source,async fetchBytes(path){requested.push(path);return source.fetchBytes(path);}}));assert.deepEqual(requested,['manifest.json']);
});
for(const label of ['sourceApproval','pathApproval','closureMutation','foreignAuthority'] as const)test('AP23K3 fully resealed '+label+' is not a legal or release approval',async()=>{
 const value=clone();changeSyntheticFormat15(value,AP23K3_ADMIN,(catalog:any)=>{
  if(label==='sourceApproval'){catalog.releaseBinding.status='candidate';catalog.releaseBinding.approval=null;}
  if(label==='pathApproval')catalog.releaseBinding.pathEligibility[0].status='candidate';
  if(label==='closureMutation')catalog.holidayBindings.find((b:any)=>b.holidayBindingId==='bl-authority-seat').annualEndShiftPolicy.years[0].dates.pop();
  if(label==='foreignAuthority')catalog.holidayBindings.find((b:any)=>b.holidayBindingId==='bs-party-representative').authoritySeatCanton='BL';
 });resealSyntheticFormat15(value);
 const store=new MemoryValidatedReleaseStore(),source=provider(value);await assert.rejects(new ReleaseService(store,validator).refresh(source));
 assert.equal(await store.getActive(getProviderCacheIdentity(source)),undefined);
});
test('AP23K3 identical provider bytes have different configured transport identities and no foreign fallback',async()=>{
 const github=await validator.validateProvider(provider()),mirror=await validator.validateProvider(provider(approved,'sharepointMirror'));
 assert.equal(github.manifestSha256,mirror.manifestSha256);assert.notEqual(getProviderCacheIdentity(provider()),getProviderCacheIdentity(provider(approved,'sharepointMirror')));
 const service=new ReleaseService(new MemoryValidatedReleaseStore(),validator),source=provider();await service.refresh(source);
 const offline=(p:any)=>({...p,async fetchBytes(){throw Error('K3 offline');}});assert.equal((await service.refresh(offline(source))).mode,'fallback');
 const foreign={...provider(),cacheConfiguration:{kind:'github' as const,baseUrl:'https://raw.githubusercontent.com/example/foreign/'+'2'.repeat(40)+'/format15'}};
 await assert.rejects(service.refresh(offline(foreign)),/K3 offline/);
});
