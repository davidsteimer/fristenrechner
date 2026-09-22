// SPDX-License-Identifier: AGPL-3.0-only
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { inflateRawSync } = require('node:zlib');
const { createHash, webcrypto } = require('node:crypto');

const SPFX_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.dirname(SPFX_ROOT);
const PACKAGE_PATH = path.join(SPFX_ROOT, 'sharepoint/solution/fristenrechner-schweiz.sppkg');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

/** Read the real small, non-ZIP64 SPPKG without extracting or changing files. */
function readPackage(packagePath = PACKAGE_PATH) {
  const bytes = fs.readFileSync(packagePath);
  let end = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset--) {
    if (bytes.readUInt32LE(offset) === 0x06054b50
      && offset + 22 + bytes.readUInt16LE(offset + 20) === bytes.length) {
      end = offset;
      break;
    }
  }
  assert.ok(end >= 0, 'SPPKG has no complete ZIP directory');
  assert.equal(bytes.readUInt16LE(end + 4), 0, 'Multi-disk ZIP unsupported');
  assert.equal(bytes.readUInt16LE(end + 6), 0, 'Multi-disk ZIP unsupported');
  const count = bytes.readUInt16LE(end + 10);
  assert.notEqual(count, 0xffff, 'ZIP64 unsupported');
  let cursor = bytes.readUInt32LE(end + 16);
  const files = new Map();
  for (let index = 0; index < count; index++) {
    assert.equal(bytes.readUInt32LE(cursor), 0x02014b50, 'Invalid ZIP entry');
    const flags = bytes.readUInt16LE(cursor + 8);
    const method = bytes.readUInt16LE(cursor + 10);
    const compressedSize = bytes.readUInt32LE(cursor + 20);
    const size = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const localOffset = bytes.readUInt32LE(cursor + 42);
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    assert.equal(flags & 1, 0, 'Encrypted ZIP unsupported');
    assert.ok(!files.has(name), `Duplicate ZIP entry ${name}`);
    assert.equal(bytes.readUInt32LE(localOffset), 0x04034b50, 'Invalid ZIP local header');
    const start = localOffset + 30 + bytes.readUInt16LE(localOffset + 26)
      + bytes.readUInt16LE(localOffset + 28);
    const compressed = bytes.subarray(start, start + compressedSize);
    assert.equal(compressed.length, compressedSize);
    const data = method === 0 ? compressed : method === 8 ? inflateRawSync(compressed) : undefined;
    assert.ok(data, `Unsupported ZIP compression ${method}`);
    assert.equal(data.length, size, `ZIP size mismatch ${name}`);
    files.set(name, data);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  const bundles = [...files.keys()].filter(name => /^ClientSideAssets\/fristenrechner-web-part_[a-f0-9]+\.js$/.test(name));
  assert.equal(bundles.length, 1, 'Exactly one actual product bundle required');
  const bundlePath = bundles[0];
  return {
    files, bundlePath, bundle: files.get(bundlePath),
    provenance: { packagePath, packageSha256: sha256(bytes), bundlePath, bundleSha256: sha256(files.get(bundlePath)) }
  };
}

function loadPackagedHost(packagePath) {
  const packaged = readPackage(packagePath);
  const React = require('react');
  function Component(props) { this.props = props; this.state = {}; }
  Component.prototype.setState = function (patch) { this.state = { ...this.state, ...patch }; };
  const react = { ...React, Component };
  let rendered;
  const reactDom = { render: element => { rendered = element; }, unmountComponentAtNode() {} };
  function BaseClientSideWebPart() {}
  const dependencies = {
    react,
    'react-dom': reactDom,
    '@microsoft/sp-core-library': { Version: { parse: value => value } },
    '@microsoft/sp-property-pane': {},
    '@microsoft/sp-webpart-base': { BaseClientSideWebPart },
    '@microsoft/sp-http': { SPHttpClient: { configurations: { v1: {} } } },
    FristenrechnerWebPartStrings: {
      ProviderSharePointMirror: 'SharePoint-Mirror', ProviderGitHub: 'GitHub'
    }
  };
  let definition;
  const context = vm.createContext({
    console, URL, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer,
    crypto: webcrypto, setTimeout, clearTimeout,
    indexedDB: new (require('fake-indexeddb').IDBFactory)(),
    define(name, names, factory) {
      assert.equal(definition, undefined, 'Only one AMD product definition expected');
      definition = { name, names, factory };
    }
  });
  vm.runInContext(packaged.bundle.toString('utf8'), context, { filename: packaged.bundlePath, timeout: 10000 });
  assert.ok(definition, 'Product AMD definition missing');
  const externalModules = definition.names.map(name => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected AMD external: ${name}`);
    return dependencies[name];
  });
  const product = definition.factory(...externalModules);
  const webpart = new product.default();
  webpart.properties = {
    providerKind: 'sharepointMirror',
    sharePointMirrorPath: '/sites/test/Shared Documents/releases/test'
  };
  webpart.manifest = { id: '596c7f1c-4d3e-4da8-a7be-27a96024f37c' };
  webpart.context = {
    sdks: {}, pageContext: { web: { absoluteUrl: 'https://example.invalid/sites/test' } },
    spHttpClient: { get() { throw new Error('Real network prohibited in packaged regression'); } }
  };
  webpart.domElement = {};
  webpart.render();
  assert.equal(typeof rendered?.type, 'function', 'Real product host was not rendered');
  const host = new rendered.type(rendered.props);
  assert.equal(typeof host.releaseService?.refresh, 'function', 'Packaged release service missing');
  return {
    host, context, provenance: packaged.provenance,
    realmError: vm.runInContext('Error', context),
    realmObject: vm.runInContext('Object', context),
    service: host.releaseService,
    store: host.releaseService.store
  };
}

module.exports = { SPFX_ROOT, REPO_ROOT, readPackage, loadPackagedHost, sha256 };
