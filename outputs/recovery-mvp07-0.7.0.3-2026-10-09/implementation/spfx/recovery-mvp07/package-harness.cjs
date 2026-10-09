// SPDX-License-Identifier: AGPL-3.0-only
'use strict';

// Adapted from test-build/package-harness.cjs. Product AMD bytes, host methods,
// validators and event handlers execute unchanged. Browser APIs and React hook
// storage are simulations, not a DOM, React scheduler or SharePoint-host proof.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {webcrypto} = require('node:crypto');
const {IDBFactory} = require('fake-indexeddb');
const {readPackage, sha256, REPO_ROOT, SPFX_ROOT, localMirrorConfiguration} = require('../test-build/package-harness.cjs');

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const operations = [];
  return {values, operations,
    getItem(key) { operations.push(['get', key]); return values.get(key) ?? null; },
    setItem(key, value) { operations.push(['set', key]); values.set(key, String(value)); },
    removeItem(key) { operations.push(['remove', key]); values.delete(key); }
  };
}
function browserState(storage = memoryStorage()) { return {indexedDB: new IDBFactory(), storage}; }
function findElement(node, predicate) {
  if (Array.isArray(node)) {
    for (const child of node) { const found = findElement(child, predicate); if (found) return found; }
  } else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) return node;
    return findElement(node.props.children, predicate);
  }
}
function findElements(node, predicate, result = []) {
  if (Array.isArray(node)) for (const child of node) findElements(child, predicate, result);
  else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) result.push(node);
    findElements(node.props.children, predicate, result);
  }
  return result;
}

function loadPackagedHost(packagePath, options = {}) {
  assert.ok(packagePath, 'An explicit real SPPKG path is mandatory');
  const packaged = readPackage(packagePath);
  const shared = options.browser ?? browserState();
  const React = require('react');
  function Component(props) { this.props = props; this.state = {}; }
  Component.prototype.setState = function(patch) {
    this.state = {...this.state, ...(typeof patch === 'function' ? patch(this.state, this.props) : patch)};
  };
  const react = {...React, Component};
  const hookNames = ['useState','useMemo','useRef','useCallback','useContext','useEffect','useLayoutEffect'];
  for (const name of hookNames) {
    const forward = (...args) => react[name] === forward ? React[name](...args) : react[name](...args);
    react[name] = forward;
  }
  let rendered;
  const reactDom = {render: element => { rendered = element; }, unmountComponentAtNode() {}};
  function BaseClientSideWebPart() {}
  const dependencies = {
    react, 'react-dom': reactDom,
    '@microsoft/sp-core-library': {Version: {parse: value => value}},
    '@microsoft/sp-property-pane': {},
    '@microsoft/sp-webpart-base': {BaseClientSideWebPart},
    '@microsoft/sp-http': {SPHttpClient: {configurations: {v1: {}}}},
    FristenrechnerWebPartStrings: {ProviderSharePointMirror:'SharePoint-Mirror',ProviderGitHub:'GitHub'}
  };
  let definition;
  const window = {};
  Object.defineProperty(window, 'localStorage', {get() {
    if (options.storageUnavailable) throw new Error('LOCAL TEST: browser storage unavailable');
    return shared.storage;
  }});
  const context = vm.createContext({console, URL, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer,
    crypto: webcrypto, setTimeout, clearTimeout, indexedDB: shared.indexedDB, window,
    define(name, names, factory) {
      assert.equal(definition, undefined, 'Exactly one unchanged AMD product definition expected');
      definition = {name, names, factory};
    }
  });
  vm.runInContext(packaged.bundle.toString('utf8'), context, {filename:packaged.bundlePath,timeout:10000});
  assert.ok(definition, 'Product AMD definition missing');
  const product = definition.factory(...definition.names.map(name => {
    assert.ok(Object.hasOwn(dependencies,name), `Unexpected AMD external: ${name}`);
    return dependencies[name];
  }));
  const webpart = new product.default();
  webpart.properties = {providerKind:'sharepointMirror',sharePointMirrorPath:'/sites/test/Shared Documents/releases/test'};
  webpart.manifest = {id:'596c7f1c-4d3e-4da8-a7be-27a96024f37c'};
  webpart.context = {sdks:{},pageContext:{web:{absoluteUrl:'https://example.invalid/sites/test'}},
    spHttpClient:{get() {throw new Error('Real network prohibited in packaged recovery regression');}}};
  webpart.domElement = {};
  webpart.render();
  assert.equal(typeof rendered?.type, 'function');
  const host = new rendered.type(rendered.props);
  const realmObject = vm.runInContext('Object', context);
  let service = host.releaseService;
  if (!service) {
    assert.equal(Object.getOwnPropertyDescriptor(realmObject.prototype,'validator'),undefined);
    Object.defineProperty(realmObject.prototype,'validator',{configurable:true,set(value) {
      Object.defineProperty(this,'validator',{value,configurable:true,enumerable:true,writable:true});
      if (typeof this.refresh === 'function' && typeof this.getActive === 'function') {
        assert.equal(service,undefined); service = this;
      }
    }});
    const props = host.props, state = host.state;
    try {
      host.props = {...props,provider:undefined,configurationError:'Isolated harness bootstrap'};
      void host.restoreAndRefresh();
    } finally {
      delete realmObject.prototype.validator;
      host.props = props; host.state = state;
    }
  }
  assert.equal(typeof service?.refresh, 'function');
  assert.equal(typeof service.validator?.validateProvider, 'function');
  assert.equal(service.store, host.props.store);
  function configure(source) {
    const config = source.cacheConfiguration;
    assert.equal(config.kind, 'sharepointMirror');
    webpart.context.pageContext.web.absoluteUrl = config.siteAbsoluteUrl;
    webpart.properties.sharePointMirrorPath = config.mirrorPath;
    webpart.render();
    const previous = host.props;
    host.props = {...rendered.props,provider:source};
    return previous;
  }
  function calculatorElement() {
    return findElement(host.render(), node => node.props.data === host.state.calculationData
      && Boolean(node.props.data) && typeof node.type === 'function');
  }
  function inspectCalculator(initialState, inspect) {
    const app = calculatorElement();
    assert.ok(app, 'The actual configured host must expose its calculator');
    const originals = Object.fromEntries(hookNames.map(name => [name,react[name]]));
    const states = [], frames = [], contexts = new Map();
    let activeFrame;
    const slot = () => {
      assert.ok(activeFrame,'Hook outside simulated inspection frame');
      const index = activeFrame.index++;
      return activeFrame.slots[index] ?? (activeFrame.slots[index] = {});
    };
    const equalDeps = (before, after) => before && after && before.length === after.length
      && before.every((value,index) => Object.is(value,after[index]));
    react.useState = initial => {
      const state = slot();
      if (!Object.hasOwn(state,'value')) {state.value = typeof initial === 'function' ? initial() : initial; states.push(state);}
      return [state.value,next => {state.value = typeof next === 'function' ? next(state.value) : next;}];
    };
    react.useMemo = (factory,deps) => {
      const memo = slot();
      if (!Object.hasOwn(memo,'value') || !equalDeps(memo.deps,deps)) {memo.value = factory();memo.deps = deps;}
      return memo.value;
    };
    react.useCallback = (callback,deps) => react.useMemo(() => callback,deps);
    react.useRef = initial => {const ref = slot();return ref.value ?? (ref.value = {current:initial});};
    react.useContext = context => contexts.has(context) ? contexts.get(context) : context._currentValue;
    react.useEffect = react.useLayoutEffect = (effect,deps) => {
      const entry = slot();
      if (!equalDeps(entry.deps,deps)) activeFrame.effects.push(() => {
        if (typeof entry.cleanup === 'function') entry.cleanup();
        entry.deps = deps;entry.cleanup = effect();
      });
    };
    function component(element) {
      assert.equal(typeof element.type,'function');
      const frame = {slots:[],index:0,effects:[]}; frames.push(frame);
      let props = element.props;
      return {render(nextProps = props) {
        props = nextProps;frame.index = 0;frame.effects = [];activeFrame = frame;
        let tree;
        try {tree = element.type(props);} finally {activeFrame = undefined;}
        for (const effect of frame.effects) effect();
        return tree;
      }};
    }
    try {
      const components = [];
      let tree = {...app,props:{...app.props,...(initialState === undefined ? {} : {initialState})}};
      // Preserve the actual host-provided storage property, including absence.
      for (let depth = 0; depth < 12; depth++) {
        if (typeof tree.type === 'function') {const item = component(tree);components.push(item);tree = item.render();}
        else if (tree.type?.$$typeof === Symbol.for('react.provider')) {contexts.set(tree.type._context,tree.props.value);tree = tree.props.children;}
        else break;
      }
      assert.ok(components.length);
      const session = components[components.length - 1];
      const api = {get tree() {return tree;},findElement,findElements,component,
        rerender() {tree = session.render();return tree;},
        stateValues: () => states.map(state => state.value),
        result: () => states.map(state => state.value).find(value => ['general','social','special','boundCalendar'].includes(value?.kind)),
        submit() {const form = findElement(tree,node => node.type === 'form' && typeof node.props.onSubmit === 'function');
          assert.ok(form,'Actual UI submit handler missing');form.props.onSubmit({preventDefault() {}});return api.result();}
      };
      return inspect(api);
    } finally {
      for (const frame of frames) for (const entry of frame.slots) if (typeof entry.cleanup === 'function') entry.cleanup();
      for (const name of hookNames) react[name] = originals[name];
    }
  }
  return {host,webpart,context,service,store:service.store,browser:shared,provenance:packaged.provenance,
    configure,calculatorElement,inspectCalculator,findElement,findElements,
    submitCalculator(initialState) {return inspectCalculator(initialState, ui => {const result = ui.submit();assert.ok(result);return result.value;});}
  };
}

module.exports = {readPackage,sha256,REPO_ROOT,SPFX_ROOT,localMirrorConfiguration,memoryStorage,browserState,
  findElement,findElements,loadPackagedHost};
