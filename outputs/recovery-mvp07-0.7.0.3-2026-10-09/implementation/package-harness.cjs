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
  // A bundled component may choose useEffect/useLayoutEffect once at module
  // initialisation. Keep that reference dispatchable inside the harness too.
  for (const name of ['useState', 'useMemo', 'useRef', 'useCallback', 'useContext', 'useEffect', 'useLayoutEffect']) {
    const forward = (...args) => react[name] === forward ? React[name](...args) : react[name](...args);
    react[name] = forward;
  }
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
  const realmObject = vm.runInContext('Object', context);
  let service = host.releaseService;
  if (!service) {
    // C3 creates its real ReleaseService inside each load, not on the host.
    // Observe that actual AMD constructor assigning its validator once. This
    // does not replace, wrap or edit the bundle, service, validator or store.
    // The unconfigured bootstrap returns before any fetch or cache read. The
    // isolated realm observation is removed before any test operation starts.
    assert.equal(Object.getOwnPropertyDescriptor(realmObject.prototype, 'validator'), undefined);
    Object.defineProperty(realmObject.prototype, 'validator', {
      configurable: true,
      set(value) {
        Object.defineProperty(this, 'validator', { value, configurable: true, enumerable: true, writable: true });
        if (typeof this.refresh === 'function' && typeof this.getActive === 'function') {
          assert.equal(service, undefined, 'Bootstrap must create exactly one packaged release service');
          service = this;
        }
      }
    });
    const props = host.props, state = host.state;
    try {
      host.props = { ...props, provider: undefined, configurationError: 'Isolated harness bootstrap' };
      void host.restoreAndRefresh();
    } finally {
      delete realmObject.prototype.validator;
      host.props = props;
      host.state = state;
    }
  }
  assert.equal(typeof service?.refresh, 'function', 'Packaged per-load release service missing');
  assert.equal(typeof service.validator?.validateProvider, 'function', 'Packaged validator missing');
  assert.equal(service.store, host.props.store, 'The actual host and service must use the same packaged store');
  function findElement(node, predicate) {
    if (Array.isArray(node)) {
      for (const child of node) { const found = findElement(child, predicate); if (found) return found; }
    } else if (node && typeof node === 'object' && node.props) {
      if (predicate(node)) return node;
      return findElement(node.props.children, predicate);
    }
    return undefined;
  }
  function inspectCalculator(initialState, inspect) {
    const app = findElement(host.render(), element => element.props.data === host.state.calculationData
      && typeof element.type === 'function');
    assert.ok(app, 'The actual host must expose its configured calculator element');
    const hookNames = ['useState', 'useMemo', 'useRef', 'useCallback', 'useContext', 'useEffect', 'useLayoutEffect'];
    const originals = Object.fromEntries(hookNames.map(name => [name, react[name]]));
    const states = [], frames = [], contexts = new Map();
    let activeFrame;
    const slot = () => {
      assert.ok(activeFrame, 'Packaged hook used outside the synchronous inspection frame');
      const index = activeFrame.index++;
      return activeFrame.slots[index] ?? (activeFrame.slots[index] = {});
    };
    const equalDeps = (before, after) => before && after && before.length === after.length
      && before.every((value, index) => Object.is(value, after[index]));
    react.useState = initial => {
      const state = slot();
      if (!Object.hasOwn(state, 'value')) {
        state.value = typeof initial === 'function' ? initial() : initial;
        states.push(state);
      }
      return [state.value, next => { state.value = typeof next === 'function' ? next(state.value) : next; }];
    };
    react.useMemo = (factory, deps) => {
      const memo = slot();
      if (!Object.hasOwn(memo, 'value') || !equalDeps(memo.deps, deps)) {
        memo.value = factory(); memo.deps = deps;
      }
      return memo.value;
    };
    react.useCallback = (callback, deps) => react.useMemo(() => callback, deps);
    react.useRef = initial => {
      const ref = slot();
      if (!Object.hasOwn(ref, 'value')) ref.value = {current: initial};
      return ref.value;
    };
    react.useContext = context => contexts.has(context) ? contexts.get(context) : context._currentValue;
    react.useEffect = react.useLayoutEffect = (effect, deps) => {
      const entry = slot();
      if (!equalDeps(entry.deps, deps)) activeFrame.effects.push(() => {
        if (typeof entry.cleanup === 'function') entry.cleanup();
        entry.deps = deps; entry.cleanup = effect();
      });
    };
    function component(element) {
      assert.equal(typeof element.type, 'function');
      const frame = {slots: [], index: 0, effects: []};
      frames.push(frame);
      let props = element.props;
      return {render(nextProps = props) {
        props = nextProps; frame.index = 0; frame.effects = []; activeFrame = frame;
        let tree;
        try { tree = element.type(props); } finally { activeFrame = undefined; }
        for (const effect of frame.effects) effect();
        return tree;
      }};
    }
    try {
      // The real bundled functions and event handlers are unchanged. Only hook
      // storage and explicit layout-effect registration are simulated. This is
      // not a DOM, focus, popup, React scheduling or native-picker proof.
      let tree = {...app, props: {...app.props, initialState,
        storage: {getItem() {return null;}, setItem() {}, removeItem() {}}}};
      for (let depth = 0; depth < 10; depth++) {
        if (typeof tree.type === 'function') tree = component(tree).render();
        else if (tree.type?.$$typeof === Symbol.for('react.provider')) {
          contexts.set(tree.type._context, tree.props.value); tree = tree.props.children;
        } else break;
      }
      return inspect({tree, findElement, component, stateValues: () => states.map(state => state.value)});
    } finally {
      for (const frame of frames) for (const entry of frame.slots) {
        if (typeof entry.cleanup === 'function') entry.cleanup();
      }
      for (const name of hookNames) react[name] = originals[name];
    }
  }
  function submitCalculator(initialState) {
    return inspectCalculator(initialState, ({tree, stateValues}) => {
      const form = findElement(tree, element => element.type === 'form' && typeof element.props.onSubmit === 'function');
      assert.ok(form, 'The packaged calculator must expose its real submit handler');
      form.props.onSubmit({ preventDefault() {} });
      const result = stateValues().find(value => value?.kind === 'boundCalendar');
      assert.ok(result, 'The real UI submit must enter the bound-calendar calculation path');
      return result.value;
    });
  }
  return {
    host, context, provenance: packaged.provenance,
    realmError: vm.runInContext('Error', context),
    realmObject,
    submitCalculator,
    inspectCalculator,
    service,
    store: service.store
  };
}

// Offline fixtures still declare the complete real-provider configuration.
// A label or release ID is not itself a cache boundary.
function localMirrorConfiguration(dataPin) {
  return {
    kind: 'sharepointMirror', siteAbsoluteUrl: 'https://example.invalid/sites/test',
    mirrorPath: `/sites/test/Shared Documents/releases/${dataPin}`
  };
}

module.exports = { SPFX_ROOT, REPO_ROOT, readPackage, loadPackagedHost, sha256, localMirrorConfiguration };
