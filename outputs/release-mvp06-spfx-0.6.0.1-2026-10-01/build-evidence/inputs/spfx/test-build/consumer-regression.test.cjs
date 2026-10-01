// SPDX-License-Identifier: AGPL-3.0-only
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, describe } = require('node:test');
const { IDBFactory } = require('fake-indexeddb');
const { REPO_ROOT, SPFX_ROOT, loadPackagedHost, sha256 } = require('./package-harness.cjs');

const APPROVED = '2026-09-22-mvp-04-approved.1';
const PREVIOUS = '2026-08-31-mvp-03-approved.1';
const AP5 = '2026-08-29-ap5-approved.1';
const CATALOG_PATH = 'holiday-catalogs/ch-holiday-catalog.json';
// Optional immutable historical package for an explicit RED regression run.
// The normal build always exercises the package just produced by package-solution.
const PACKAGE_OVERRIDE = process.env.FRISTENRECHNER_TEST_SPPKG;

function provider(releaseId = APPROVED, mutate, brokenPath) {
  const root = path.join(REPO_ROOT, 'data/releases', releaseId);
  const manifestBytes = fs.readFileSync(path.join(root, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  const bytes = new Map([['manifest.json', manifestBytes]]);
  for (const descriptor of manifest.artifacts) {
    bytes.set(descriptor.path, fs.readFileSync(path.join(root, descriptor.path)));
  }
  if (mutate) {
    const documents = new Map(manifest.artifacts.map(item => [item.path, JSON.parse(bytes.get(item.path))]));
    mutate({ manifest, documents, catalog: documents.get(CATALOG_PATH) });
    for (const descriptor of manifest.artifacts) {
      const updated = Buffer.from(JSON.stringify(documents.get(descriptor.path)));
      bytes.set(descriptor.path, updated);
      descriptor.byteLength = updated.length;
      descriptor.sha256 = sha256(updated);
    }
    bytes.set('manifest.json', Buffer.from(JSON.stringify(manifest)));
  }
  const fetched = [];
  return {
    id: `local-build-regression:${releaseId}`, kind: 'sharepointMirror', fetched,
    async fetchBytes(relativePath) {
      fetched.push(relativePath);
      assert.ok(bytes.has(relativePath), `Unexpected local release path: ${relativePath}`);
      if (relativePath === brokenPath) throw new Error('Local fixture: missing artifact');
      return new Uint8Array(bytes.get(relativePath));
    }
  };
}

function compiledHost() {
  // Deliberately no tsx, TypeScript source import or compiler invocation here.
  const { ReleaseService } = require('../lib-commonjs/core/ReleaseService.js');
  const { IndexedDbValidatedReleaseStore } = require('../lib-commonjs/core/ValidatedReleaseStore.js');
  const { createCalculationData } = require('../lib-commonjs/product/core/index.js');
  const store = new IndexedDbValidatedReleaseStore('built-contract', new IDBFactory());
  return { service: new ReleaseService(store), store, realmObject: Object,
    consume: result => createCalculationData(result.release) };
}

function packagedHost() {
  const runtime = loadPackagedHost(PACKAGE_OVERRIDE);
  return {
    ...runtime,
    consume(result) {
      // This calls the actual packaged host method and its own product boundary.
      runtime.host.applyActivationResult(result);
      assert.equal(runtime.host.state.status, 'ready');
      return runtime.host.state.calculationData;
    }
  };
}

test('emitted ES5 HolidayCatalogError retains its own Error subclass identity', () => {
  const { HolidayCatalogError } = require('../lib-commonjs/product/core/holidayCatalog.js');
  const error = new HolidayCatalogError('regression', 'test error');
  assert.equal(error instanceof HolidayCatalogError, true);
  assert.equal(error instanceof Error, true);
  assert.equal(Object.getPrototypeOf(error), HolidayCatalogError.prototype);
  assert.equal(error.reasonKey, 'regression');
  assert.equal(error.message, 'test error');
  assert.equal(new Error('ordinary error') instanceof HolidayCatalogError, false);
});

test('the unchanged actual SPPKG AMD bundle executes through its real exported WebPart', t => {
  const runtime = packagedHost();
  t.diagnostic(JSON.stringify(runtime.provenance));
  assert.equal(typeof runtime.host.restoreAndRefresh, 'function');
  assert.equal(typeof runtime.service.validator.validateProvider, 'function');
  assert.equal(typeof runtime.store.activate, 'function');
  assert.match(runtime.provenance.bundlePath, /^ClientSideAssets\/fristenrechner-web-part_[a-f0-9]+\.js$/);
  if (!PACKAGE_OVERRIDE) {
    const solution = JSON.parse(fs.readFileSync(path.join(SPFX_ROOT, 'config/package-solution.json'))).solution;
    const { readPackage } = require('./package-harness.cjs');
    const manifest = readPackage().files.get('AppManifest.xml').toString();
    assert.ok(manifest.includes(`Version="${solution.version}"`), 'Package must match current solution version');
  }
});

test('packaged HolidayCatalogError is a real subclass, not a relabelled native Error', async () => {
  const runtime = packagedHost();
  let caught;
  try {
    await runtime.service.refresh(provider(APPROVED, ({ catalog }) => {
      catalog.data.jurisdictions[0].parentId = 'CH'; // Schema-valid, semantically invalid.
    }));
  } catch (error) { caught = error; }
  assert.ok(caught, 'The invalid CH parent must fail');
  assert.equal(caught.name, 'HolidayCatalogError');
  assert.equal(caught.reasonKey, 'holidayCatalog.invalidContract');
  assert.ok(caught instanceof runtime.realmError, 'Must remain an Error in the actual bundle realm');
  assert.notEqual(caught.constructor, runtime.realmError, 'ES5 compilation must not erase the custom prototype');
  assert.equal(caught instanceof caught.constructor, true);
  const another = new caught.constructor('regression', 'roundtrip');
  assert.equal(another instanceof caught.constructor, true);
  assert.equal(another.message, 'roundtrip');
});

for (const [label, makeHost] of [
  ['emitted ES5 CommonJS', compiledHost],
  ['actual packaged AMD bundle', packagedHost]
]) {
  describe(label, () => {
    test('accepts all real approved format-4 bytes, including nullable oneOf branches, from an empty store', async () => {
      const runtime = makeHost();
      const local = provider();
      assert.equal(await runtime.store.getActive(), undefined);
      const result = await runtime.service.refresh(local);
      assert.equal(result.mode, 'network');
      assert.equal(result.release.releaseId, APPROVED);
      assert.equal(result.release.formatVersion, '4.0.0');
      assert.equal(result.release.artifacts.length, 9);
      assert.equal(local.fetched.length, 10);
      assert.equal(new Set(local.fetched).size, 10);
      const catalog = result.release.artifacts.find(item => item.descriptor.role === 'holidayCatalog').parsed;
      assert.equal(catalog.data.jurisdictions[0].parentId, null);
      assert.equal(catalog.data.rules.length, 479);
      const data = runtime.consume(result);
      assert.equal(data.releaseId, APPROVED);
      assert.equal(data.profiles.size, 5);
      assert.equal(data.holidayCatalogs.size, 1);
      assert.equal((await runtime.store.getActive()).manifestSha256, result.release.manifestSha256);
    });

    test('retains AP5 format-1 compatibility without a pre-existing active release', async () => {
      const runtime = makeHost();
      const result = await runtime.service.refresh(provider(AP5));
      assert.equal(result.mode, 'network');
      assert.equal(result.release.releaseId, AP5);
      assert.equal(result.release.formatVersion, '1.0.0');
      assert.equal(result.release.artifacts.length, 7);
      assert.equal(runtime.consume(result).profiles.size, 5);
    });

    test('promotes a real format-3 active release to the real format-4 release without fallback', async () => {
      const runtime = makeHost();
      assert.equal((await runtime.service.refresh(provider(PREVIOUS))).mode, 'network');
      const next = await runtime.service.refresh(provider());
      assert.equal(next.mode, 'network');
      assert.equal(next.release.releaseId, APPROVED);
      assert.equal((await runtime.store.getActive()).releaseId, APPROVED);
    });

    for (const [name, mutate] of [
      ['invalid oneOf value', ({ catalog }) => { catalog.data.jurisdictions[0].parentId = 42; }],
      ['schema-valid but forbidden CH parent', ({ catalog }) => { catalog.data.jurisdictions[0].parentId = 'CH'; }],
      ['unknown catalog core field', ({ catalog }) => { catalog.activateAllCantons = true; }],
      ['unresolvable catalog source', ({ catalog }) => { catalog.data.rules[0].source = 'SRC-NOT-AVAILABLE'; }]
    ]) {
      test(`rejects ${name} and does not activate any partial release`, async () => {
        const runtime = makeHost();
        await assert.rejects(runtime.service.refresh(provider(APPROVED, mutate)));
        assert.equal(await runtime.store.getActive(), undefined);
      });
    }

    test('rejects a missing catalog on first use without inventing an active release', async () => {
      const runtime = makeHost();
      await assert.rejects(runtime.service.refresh(provider(APPROVED, undefined, CATALOG_PATH)), /missing artifact/);
      assert.equal(await runtime.store.getActive(), undefined);
    });

    test('oneOf propagates an unexpected error unchanged instead of swallowing it as a branch mismatch', async () => {
      const runtime = makeHost();
      // Observe the real interpreter entering a nullable oneOf schema, then
      // inject an unexpected runtime fault from Object.hasOwn on its first
      // branch. No validator code or data is replaced. The realm-local built-in
      // is restored in finally. This tests the catch itself, not a failure before it.
      const original = runtime.realmObject.hasOwn;
      let branch;
      const unexpected = new Error('Unexpected fixture fault inside the oneOf branch');
      let reached = 0;
      runtime.realmObject.hasOwn = function (target, key) {
        if (key === 'const' && target?.oneOf?.[0]?.type === 'string'
          && target?.oneOf?.[1]?.type === 'null') branch = target.oneOf[0];
        if (key === 'const' && target === branch) { reached++; throw unexpected; }
        return original(target, key);
      };
      try {
        await assert.rejects(runtime.service.refresh(provider()), error => error === unexpected);
        assert.equal(reached, 1, 'The unexpected error must escape on the first branch');
        assert.equal(await runtime.store.getActive(), undefined);
      } finally {
        runtime.realmObject.hasOwn = original;
      }
    });

    test('retains the complete validated format-4 active release after invalid schema or semantics', async () => {
      const runtime = makeHost();
      const approved = await runtime.service.refresh(provider());
      for (const mutate of [
        ({ catalog }) => { catalog.data.jurisdictions[0].parentId = 42; },
        ({ catalog }) => { catalog.data.jurisdictions[0].parentId = 'CH'; }
      ]) {
        const failed = await runtime.service.refresh(provider(APPROVED, mutate));
        assert.equal(failed.mode, 'fallback');
        assert.equal(typeof failed.warning, 'string');
        assert.ok(failed.warning.length > 0);
        assert.equal(failed.release.manifestSha256, approved.release.manifestSha256);
        const active = await runtime.store.getActive();
        assert.equal(active.manifestSha256, approved.release.manifestSha256);
        assert.equal(active.artifacts.length, 9);
        assert.equal(active.artifacts.find(item => item.descriptor.role === 'holidayCatalog').parsed.data.rules.length, 479);
      }
    });

    test('a catalog checksum mismatch preserves the previous valid release', async () => {
      const runtime = makeHost();
      const initial = await runtime.service.refresh(provider(PREVIOUS));
      const original = provider();
      const corrupt = { ...original, async fetchBytes(relativePath) {
        const bytes = await original.fetchBytes(relativePath);
        if (relativePath === CATALOG_PATH) bytes[bytes.length - 2] ^= 1;
        return bytes;
      } };
      const failed = await runtime.service.refresh(corrupt);
      assert.equal(failed.mode, 'fallback');
      assert.match(failed.warning, /SHA-256-Prüfsumme/);
      assert.equal(failed.release.manifestSha256, initial.release.manifestSha256);
      assert.equal((await runtime.store.getActive()).releaseId, PREVIOUS);
    });
  });
}
