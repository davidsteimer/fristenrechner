// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Local, synthetic transport over original archived release bytes. No browser,
// tenant, remote request, TypeScript import or replacement calculation engine.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, RECOVERY_BASIS, sha256, readPackage, loadPackagedHost, browserState, memoryStorage, localMirrorConfiguration} = require('./package-harness.cjs');

const RECOVERY = process.env.FRISTENRECHNER_RECOVERY_SPPKG;
assert.ok(RECOVERY, 'Set FRISTENRECHNER_RECOVERY_SPPKG to the newly built recovery SPPKG. No default or stale-package fallback is allowed.');
assert.ok(path.isAbsolute(RECOVERY), 'The recovery package path must be absolute.');
assert.ok(fs.statSync(RECOVERY).isFile(), 'Recovery package must exist before any packaged test');
const ARCHIVE06 = path.join(REPO_ROOT,'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg');
const ARCHIVE07 = path.join(REPO_ROOT,'outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg');
assert.equal(sha256(fs.readFileSync(ARCHIVE06)),'60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587');
assert.equal(sha256(fs.readFileSync(ARCHIVE07)),'8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db');
assert.notEqual(fs.realpathSync(RECOVERY),fs.realpathSync(ARCHIVE06));
assert.notEqual(fs.realpathSync(RECOVERY),fs.realpathSync(ARCHIVE07));
const F6 = '2026-10-01-mvp-06-approved.1', F7 = '2026-10-08-mvp-07-approved.1', AP5 = '2026-08-29-ap5-approved.1';
const DEFAULTS = 'fristenrechner.defaults.v1', RECOVERY_DEFAULTS = 'fristenrechner.defaults.recovery-mvp06.v1';
const basic = {authorityCode:'BE',profileId:'stpo',inputDate:'2026-09-16',deadlineDays:'10'};
const filesByRelease = new Map();
function provider(releaseId = F6, suffix = '') {
  if (!filesByRelease.has(releaseId)) {
    const directory = path.join(RECOVERY_BASIS,'basis/data/releases',releaseId);
    const manifest = fs.readFileSync(path.join(directory,'manifest.json'));
    filesByRelease.set(releaseId,new Map([['manifest.json',manifest],...JSON.parse(manifest).artifacts.map(item =>
      [item.path,fs.readFileSync(path.join(directory,item.path))])]));
  }
  const files = filesByRelease.get(releaseId), fetched = [];
  return {id:`synthetic-local-transport:${releaseId}${suffix}`,kind:'sharepointMirror',
    cacheConfiguration:localMirrorConfiguration(`${releaseId}${suffix}`),fetched,
    async fetchBytes(name) {fetched.push(name);assert.ok(files.has(name),name);return new Uint8Array(files.get(name));}
  };
}
const offline = source => ({...source,async fetchBytes() {throw new Error('SYNTHETIC LOCAL OFFLINE');}});
const recovery = (browser, options) => loadPackagedHost(RECOVERY,{browser,...options});
async function activate(runtime, source = provider()) {
  runtime.configure(source);
  await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'ready',runtime.host.state.message);
  return runtime.host.state.calculationData;
}
const plain = value => JSON.parse(JSON.stringify(value));
function button(ui,label) {
  const found = ui.findElement(ui.tree,node => typeof node.props.onClick === 'function' && node.props.children === label);
  assert.ok(found,`Actual packaged button missing: ${label}`);return found;
}
const formState = ui => ui.stateValues().find(value => value?.profileId && typeof value.inputDate === 'string');
function requestResult(request) {return new Promise((resolve,reject) => {request.onsuccess = () => resolve(request.result);request.onerror = () => reject(request.error);});}
async function database(shared) {return requestResult(shared.indexedDB.open('fristenrechner-spfx',2));}
function transactionComplete(tx) {return new Promise((resolve,reject) => {tx.oncomplete = resolve;tx.onerror = () => reject(tx.error);tx.onabort = () => reject(tx.error);});}

test('actual recovery 0.7.0.3 SPPKG has unchanged identities, higher version than 0.7.0.2 and no API permission request', t => {
  const packaged = readPackage(RECOVERY), old6 = readPackage(ARCHIVE06), old7 = readPackage(ARCHIVE07);
  t.diagnostic(JSON.stringify({recovery:packaged.provenance,mvp06:old6.provenance,mvp07:old7.provenance}));
  const manifest = packaged.files.get('AppManifest.xml').toString();
  assert.match(manifest,/ProductID="13090feb-a6bf-40fa-9d3c-ec8d90516a60"/);
  assert.match(manifest,/Version="0\.7\.0\.3"/);
  assert.match(old7.files.get('AppManifest.xml').toString(),/Version="0\.7\.0\.2"/);
  assert.match(manifest,/IsDomainIsolated="false"/);
  const feature = packaged.files.get('feature_3edf1509-41e9-4a2f-8005-df510eec43b6.xml').toString();
  assert.match(feature,/Version="0\.7\.0\.3"/);
  assert.match(feature,/Id="3edf1509-41e9-4a2f-8005-df510eec43b6"/);
  const webpart = packaged.files.get('3edf1509-41e9-4a2f-8005-df510eec43b6/WebPart_596c7f1c-4d3e-4da8-a7be-27a96024f37c.xml').toString();
  const componentManifest = JSON.parse(webpart.match(/ComponentManifest="([^"]+)"/)[1]
    .replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'));
  assert.equal(componentManifest.id,'596c7f1c-4d3e-4da8-a7be-27a96024f37c');
  assert.equal(componentManifest.version,'0.7.1');
  assert.equal(`ClientSideAssets/${componentManifest.loaderConfig.scriptResources['fristenrechner-web-part'].path}`,packaged.bundlePath);
  assert.match(componentManifest.preconfiguredEntries[0].properties.githubBaseUrl,/\/data\/releases\/2026-10-01-mvp-06-approved\.1$/);
  for (const [name,bytes] of packaged.files) if (/\.xml$/.test(name)) {
    assert.doesNotMatch(bytes.toString(),/AppPermissionRequest|WebApiPermission|webApiPermissionRequests/);
  }
  assert.notEqual(packaged.provenance.bundleSha256,old6.provenance.bundleSha256);
  assert.notEqual(packaged.provenance.bundleSha256,old7.provenance.bundleSha256);
  assert.ok(packaged.files.has('ClientSideAssets.xml'));
  const runtime = recovery();
  assert.equal(runtime.host.render().props['data-recovery-version'],'0.7.0.3');
});

// Reusing the 0.7.0.2 consumer bytes proves storage compatibility only. It does
// not claim a SharePoint downgrade or authorize installation after 0.7.0.3.
test('actual 0.7.0.2 DB survives recovery F6 online and offline with retained F7 storage compatibility', async () => {
  const shared = browserState(), current = loadPackagedHost(ARCHIVE07,{browser:shared});
  const f7 = provider(F7), original = await current.service.refresh(f7);
  const db = await database(shared);
  assert.equal(db.version,2);
  assert.ok(db.objectStoreNames.contains('configuredReleases'));
  db.close();
  const runtime = recovery(shared);
  const data = await activate(runtime);
  assert.equal(data.formatVersion,'6.0.0');assert.equal(data.releaseId,F6);
  assert.equal(runtime.host.state.calendarRuntime,undefined);
  runtime.configure(offline(provider()));await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'fallback');assert.equal(runtime.host.state.calculationData.releaseId,F6);
  const resumed = loadPackagedHost(ARCHIVE07,{browser:shared});
  resumed.configure(offline(f7));await resumed.host.restoreAndRefresh();
  assert.equal(resumed.host.state.status,'fallback');assert.equal(resumed.host.state.calculationData.formatVersion,'7.0.0');
  assert.equal(resumed.host.state.manifestSha256,original.release.manifestSha256);
  assert.equal(resumed.submitCalculator({...basic,calendarContext:{role:'partyWithoutRepresentative',canton:'BE',areaFacts:{}}}).finalEnd,'2026-09-28');
});

test('missing source, different source, F7 and corrupt configured cache cannot revive historical AP5', async () => {
  const shared = browserState();
  const old = loadPackagedHost(ARCHIVE06,{browser:shared});
  const historical = await old.service.refresh(provider(AP5));
  assert.equal(historical.release.formatVersion,'1.0.0');
  // Closing this genuine v1 connection allows the real 0.7 store to upgrade.
  if (old.store.databasePromise) (await old.store.databasePromise).close();
  const v7 = loadPackagedHost(ARCHIVE07,{browser:shared});
  await v7.service.refresh(provider(F7));
  const runtime = recovery(shared);
  runtime.configure(offline(provider()));await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'error');assert.equal(runtime.calculatorElement(),undefined);
  assert.equal(await runtime.service.getActive(),undefined);
  await assert.rejects(runtime.service.refresh({...offline(provider()),cacheConfiguration:undefined}),/Cachekonfiguration/);
  await activate(runtime);
  const previous = runtime.host.props;
  runtime.host.props = {...previous,provider:undefined,configurationError:'Missing data source'};
  assert.equal(runtime.calculatorElement(),undefined,'A props change must immediately hide prior results');
  await runtime.host.restoreAndRefresh();assert.equal(runtime.host.state.status,'error');
  runtime.configure(offline(provider(F6,'-other-source')));await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'error');assert.equal(runtime.calculatorElement(),undefined);
  runtime.configure(provider(F7));await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'error');assert.equal(runtime.calculatorElement(),undefined);
  const db = await database(shared);
  runtime.configure(provider());
  const key = runtime.host.props.configurationKey;
  const read = db.transaction('configuredReleases','readonly');
  const entry = await requestResult(read.objectStore('configuredReleases').get(key));
  assert.ok(entry);
  entry.release.manifestBytes[0] ^= 1;
  const write = db.transaction('configuredReleases','readwrite');
  write.objectStore('configuredReleases').put(entry);await transactionComplete(write);db.close();
  runtime.configure(offline(provider()));await runtime.host.restoreAndRefresh();
  assert.equal(runtime.host.state.status,'error');assert.equal(runtime.calculatorElement(),undefined);
  assert.match(runtime.host.state.message,/Cache|Prüfsumme/);
});

test('own AP5 and F6 configuration caches remain separate without relabelling data', async () => {
  const runtime = recovery(), ap5 = provider(AP5), f6 = provider();
  const six = await runtime.service.refresh(f6), historical = await runtime.service.refresh(ap5);
  assert.equal(historical.release.formatVersion,'1.0.0');
  assert.equal((await runtime.service.refresh(offline(ap5))).release.manifestSha256,historical.release.manifestSha256);
  assert.equal((await runtime.service.refresh(offline(f6))).release.manifestSha256,six.release.manifestSha256);
  await assert.rejects(runtime.service.refresh(offline(provider(F6,'-wrong'))),/SYNTHETIC LOCAL OFFLINE/);
});

test('same actual recovery store retries after an old MVP06 connection blocks the DB version 2 upgrade', async () => {
  const shared = browserState(), old = loadPackagedHost(ARCHIVE06,{browser:shared});
  await old.service.refresh(provider(AP5));
  const oldDatabase = await old.store.databasePromise;
  assert.equal(oldDatabase.version,1);
  const runtime = recovery(shared);
  await assert.rejects(runtime.service.getActive(provider()),/blockiert/);
  oldDatabase.close();
  // Keep the same actual store and service to prove that no reload is needed.
  const result = await runtime.service.refresh(provider());
  assert.equal(result.mode,'network');assert.equal(result.release.releaseId,F6);
  assert.equal((await runtime.service.refresh(offline(provider()))).mode,'fallback');
});

test('configuration change hides old calculator immediately and late success or failure cannot replace new state', async () => {
  for (const rejects of [false,true]) {
    const runtime = recovery();await activate(runtime);
    assert.equal(runtime.submitCalculator(basic).finalEnd,'2026-09-28');
    const oldKey = runtime.calculatorElement().key;
    let unblock, reached;
    const started = new Promise(resolve => {reached = resolve;});
    const gate = new Promise((resolve,reject) => {unblock = () => rejects ? reject(new Error('SYNTHETIC STALE FAILURE')) : resolve();});
    const source = provider(F6,`-delayed-${rejects}`);
    const delayed = {...source,async fetchBytes(name) {if (name === 'manifest.json') {reached();await gate;}return source.fetchBytes(name);}};
    runtime.configure(delayed);
    assert.equal(runtime.calculatorElement(),undefined);
    const oldLoad = runtime.host.restoreAndRefresh();await started;
    runtime.configure(provider(AP5));
    assert.equal(runtime.calculatorElement(),undefined);
    await runtime.host.restoreAndRefresh();
    assert.equal(runtime.host.state.status,'ready');assert.equal(runtime.host.state.calculationData.releaseId,AP5);
    assert.notEqual(runtime.calculatorElement().key,oldKey,'New configuration remounts actual calculator');
    const newState = runtime.host.state;
    unblock();await oldLoad;
    assert.equal(runtime.host.state,newState,'Stale async must not modify the new state');
    assert.ok((await runtime.service.getActive(delayed)) === undefined,'Stale async must not activate the obsolete configured cache');
  }
});

test('packaged recovery StPO submit uses native date input and reproduces actual MVP06 calculation', async () => {
  const runtime = recovery();await activate(runtime);
  const historical = loadPackagedHost(ARCHIVE06);
  const result = await historical.service.refresh(provider());
  historical.host.applyActivationResult(result,historical.host.props.configurationKey);
  const expected = historical.submitCalculator(basic);
  runtime.inspectCalculator(basic,ui => {
    const date = ui.findElement(ui.tree,node => node.props.value === basic.inputDate && typeof node.props.onChange === 'function');
    assert.ok(date);
    const dateTree = ui.component(date).render();
    assert.ok(ui.findElement(dateTree,node => node.type === 'input' && node.props.type === 'date'));
    const submitted = ui.submit();assert.equal(submitted.kind,'general');
    assert.equal(submitted.value.finalEnd,'2026-09-28');
    assert.deepEqual(plain(submitted.value),plain(expected));
  });
});

test('actual packaged social UI handlers calculate all 50 F6 bindings for both supported holiday roles', async t => {
  const runtime = recovery(), data = await activate(runtime);
  const catalog = data.socialProcedureCatalogs.get('ch-social-procedures');
  assert.equal(catalog.cantonalBindings.length,50);
  let count = 0;
  for (const binding of catalog.cantonalBindings) for (const holiday of ['partyBE','partyAndRepresentativeBE']) {
    const rule = catalog.federalRules.find(item => item.ruleId === binding.ruleId);
    const suffix = rule.ruleId.split('-').at(-1);
    const action = {PRE:'preliminary-objection',OBJ:'objection',APP:'appeal',CORRECTION:'complaint-correction',ADM:'ongoing'}[suffix];
    assert.ok(action,rule.ruleId);
    const facts = Object.fromEntries(binding.contextRoutes[0].requiredFacts.map(item => [item.factKey,item.allowedValues[0]]));
    runtime.inspectCalculator({authorityCode:'BE',profileId:'vrpg-be',inputDate:'2026-09-16',
      vrpgSelection:{area:'social',law:rule.law,action,stage:suffix === 'ADM' ? 'administration' : ''},
      specialIntegerValues:{deadlineDays:'10'}},ui => {
      // Fill only visible, empty real UI fields through their actual handlers.
      // Transient jurisdiction facts are never injected into hook state.
      for (let pass = 0; pass < 18; pass++) {
        const field = ui.findElement(ui.tree,node => typeof node.props.onChange === 'function'
          && !node.props.disabled && (node.props.selectedKey === '' || node.props.selectedKey === undefined)
          && Array.isArray(node.props.options) && node.props.options.some(option =>
            option.key === 'BE' || option.key === holiday || option.key === 'unemploymentFund' || option.key === 'nonCantonal'));
        if (!field) break;
        const keys = field.props.options.map(option => option.key);
        const selected = keys.includes(holiday) ? holiday : keys.includes('unemploymentFund') ? facts.decisionOrigin
          : keys.includes('nonCantonal') ? facts.eogOfficeType : 'BE';
        assert.ok(selected,`${binding.bindingId}: ${field.props.label}`);
        field.props.onChange(undefined,{key:selected});ui.rerender();
      }
      const date = ui.findElement(ui.tree,node => node.props.value === '' && typeof node.props.onChange === 'function'
        && /Zeitpunkt|ursprünglichen Kassenverfügung/.test(node.props.label ?? ''));
      if (date) {date.props.onChange('2026-09-16');ui.rerender();}
      const submitted = ui.submit();
      assert.ok(submitted,`${binding.bindingId}/${holiday}: validation ${JSON.stringify(ui.stateValues().filter(value => value && typeof value === 'object'))}`);
      assert.equal(submitted.kind,'social');assert.equal(submitted.value.outcome,'calculated',binding.bindingId);
      assert.equal(submitted.value.finalDeadline.date,rule.calculation.durationInputId ? '2026-09-28' : '2026-10-16',binding.bindingId);
      assert.equal(submitted.value.socialEvidence.releaseId,F6);
      assert.equal(submitted.value.socialEvidence.bindingId,binding.bindingId);
      count++;
    });
  }
  assert.equal(count,100);t.diagnostic('100 actual packaged UI submissions, with simulated React hook storage and explicit handler events.');
});

test('actual UI save and reset preserve shared v4 bytes and retain separate recovery preferences across consumers', async () => {
  const shared = browserState();
  const modern = loadPackagedHost(ARCHIVE07,{browser:shared});await activate(modern,provider(F7));
  modern.inspectCalculator({...basic,deadlineDays:'17',calendarContext:{role:'qualifiedServiceRepresentative',canton:'SG',areaFacts:{}}},ui => {
    button(ui,'Als Standard speichern').props.onClick();
  });
  const raw = shared.storage.getItem(DEFAULTS);assert.equal(JSON.parse(raw).version,4);
  const runtime = recovery(shared);await activate(runtime);
  assert.ok(runtime.calculatorElement().props.storage,'Real host must pass a non-null protected adapter');
  runtime.inspectCalculator(undefined,ui => {assert.equal(formState(ui).deadlineDays,'10','Recovery must not consume v4');});
  runtime.inspectCalculator({...basic,deadlineDays:'23'},ui => {button(ui,'Als Standard speichern').props.onClick();});
  assert.equal(shared.storage.getItem(DEFAULTS),raw);
  const own = shared.storage.getItem(RECOVERY_DEFAULTS);assert.equal(JSON.parse(own).deadlineDays,23);assert.equal(JSON.parse(own).version,3);
  assert.equal(Object.hasOwn(JSON.parse(own),'inputDate'),false);
  modern.inspectCalculator(undefined,ui => {
    assert.equal(formState(ui).deadlineDays,'17');
    button(ui,'Als Standard speichern').props.onClick();
  });
  assert.equal(shared.storage.getItem(DEFAULTS),raw);
  assert.equal(shared.storage.getItem(RECOVERY_DEFAULTS),own,'Actual modern UI save must preserve separate recovery preferences');
  const reload = recovery(shared);await activate(reload);
  reload.inspectCalculator(undefined,ui => {
    assert.equal(formState(ui).deadlineDays,'23');assert.equal(formState(ui).inputDate,'');
    button(ui,'Standards zurücksetzen').props.onClick();
  });
  assert.equal(shared.storage.getItem(DEFAULTS),raw);
  const resetMarker = shared.storage.getItem(RECOVERY_DEFAULTS);
  assert.ok(resetMarker,'Reset must retain an own marker');
  const resetReload = recovery(shared);await activate(resetReload);
  resetReload.inspectCalculator(undefined,ui => {assert.equal(formState(ui).deadlineDays,'10');});
  const modernAgain = loadPackagedHost(ARCHIVE07,{browser:shared});await activate(modernAgain,provider(F7));
  modernAgain.inspectCalculator(undefined,ui => {
    assert.equal(formState(ui).deadlineDays,'17');
    assert.equal(formState(ui).calendarContext.role,'qualifiedServiceRepresentative');
    assert.equal(formState(ui).calendarContext.canton,'SG');
  });
  assert.equal(shared.storage.getItem(DEFAULTS),raw);
  assert.equal(shared.storage.getItem(RECOVERY_DEFAULTS),resetMarker);
});

test('recovery UI legacy import and reset do not revive original v3 preferences after reload', async () => {
  const shared = browserState(), old = loadPackagedHost(ARCHIVE06,{browser:shared});
  const active = await old.service.refresh(provider());old.host.applyActivationResult(active,old.host.props.configurationKey);
  old.inspectCalculator({...basic,deadlineDays:'19'},ui => {button(ui,'Als Standard speichern').props.onClick();});
  const raw = shared.storage.getItem(DEFAULTS);assert.equal(JSON.parse(raw).version,3);
  if (old.store.databasePromise) (await old.store.databasePromise).close();
  const runtime = recovery(shared);await activate(runtime);
  runtime.inspectCalculator(undefined,ui => {assert.equal(formState(ui).deadlineDays,'19');button(ui,'Standards zurücksetzen').props.onClick();});
  const reload = recovery(shared);await activate(reload);
  reload.inspectCalculator(undefined,ui => {assert.equal(formState(ui).deadlineDays,'10');});
  assert.equal(shared.storage.getItem(DEFAULTS),raw);
});

test('unavailable browser storage still uses non-null adapter and actual UI reports failed save and reset', async () => {
  const original = '{"version":4,"locale":"fr","deadlineDays":27}', shared = browserState(memoryStorage({[DEFAULTS]:original}));
  const runtime = recovery(shared,{storageUnavailable:true});await activate(runtime);
  assert.ok(runtime.calculatorElement().props.storage,'Undefined would cause unprotected UI browser fallback');
  runtime.inspectCalculator(basic,ui => {
    button(ui,'Als Standard speichern').props.onClick();
    assert.ok(ui.stateValues().some(value => value?.text?.includes('nicht gespeichert')));
    button(ui,'Standards zurücksetzen').props.onClick();
    assert.ok(ui.stateValues().some(value => value?.text?.includes('nicht entfernt')));
  });
  assert.equal(shared.storage.values.get(DEFAULTS),original);
  assert.equal(shared.storage.values.has(RECOVERY_DEFAULTS),false);
  assert.equal(shared.storage.operations.length,0,'No direct fallback access to unprotected browser storage');
});
