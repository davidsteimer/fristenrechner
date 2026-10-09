// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { build } from 'esbuild';
import * as React from 'react';

// Exercise the real host lifecycle, with controlled asynchronous transport and
// a runtime-factory spy. The byte-bound factory and cache are tested separately.
const bundle = await build({ stdin: { contents: `
  export { default as Host } from './spfx/src/webparts/fristenrechner/components/Fristenrechner';
  export { control } from 'host-test-control';
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react'], logLevel: 'silent', plugins: [{ name: 'host-fixtures', setup(builder) {
    builder.onResolve({ filter: /host-test-control|\/ReleaseService$|\/cacheIdentity$|\/product\/core$|\/product\/ui$|^@fluentui\/react$|\.scss$/ }, args => ({ path: args.path, namespace: 'host-fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'host-fixture' }, args => {
      const contents = args.path === 'host-test-control' ? `export const control = { calls: [], factories: [], active: async () => undefined, refresh: async () => { throw Error('offline'); } };`
        : args.path.endsWith('/ReleaseService') ? `import {control} from 'host-test-control'; export class ReleaseService {
          constructor(store) { this.store = store; }
          getActive(provider) { control.calls.push(['active', provider, this.store]); return control.active(provider); }
          refresh(provider) { control.calls.push(['refresh', provider, this.store]); return control.refresh(provider); }
        }`
        : args.path.endsWith('/cacheIdentity') ? `export function getProviderCacheIdentity(provider) {
          if (!provider.cacheConfiguration) throw Error('no identity'); return JSON.stringify(provider.cacheConfiguration);
        }`
        : args.path.endsWith('/product/core') ? `import {control} from 'host-test-control'; export function createCalculatorRuntime(release, options) {
          control.factories.push([release, options]); if (release.invalid) throw Error('invalid release'); return release.runtime;
        }`
        : args.path.endsWith('/product/ui') ? `import * as React from 'react'; export function FristenrechnerApp(props) { return React.createElement('output', { 'data-release': props.data.releaseId }); }`
        : args.path === '@fluentui/react' ? `import * as React from 'react'; export const MessageBarType = {warning:1,info:2,error:3}; export const MessageBar = props => React.createElement('aside', props); export const Spinner = props => React.createElement('i', props);`
        : `export default {host:'host',startup:'startup'};`;
      return { contents, loader: 'js' };
    });
  } }] });
const evaluated = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(createRequire(import.meta.url), evaluated, evaluated.exports);
type HostInstance = {
  props: Record<string, any>;
  state: Record<string, any>;
  setState: (value: Record<string, any>) => void;
  render: () => React.ReactElement;
  componentDidMount: () => void;
  componentDidUpdate: (previous: Record<string, any>) => void;
  componentWillUnmount: () => void;
};
const { Host, control } = evaluated.exports as {
  Host: new (props: Record<string, any>) => HostInstance;
  control: { calls: any[][]; factories: any[][]; active: (provider: any) => Promise<any>; refresh: (provider: any) => Promise<any> };
};
function provider(site: string, mirror = '/data') {
  return { id: 'same-label', kind: 'sharepointMirror', cacheConfiguration: { kind: 'sharepointMirror', siteAbsoluteUrl: site, mirrorPath: mirror } };
}
function props(selected = provider('https://example.test/sites/A')) {
  return { componentId: 'component', hostLabel: 'SharePoint', providerLabel: 'Mirror', provider: selected,
    configurationKey: JSON.stringify(selected.cacheConfiguration), store: {} };
}
function instantiate(selected = props()): HostInstance {
  const host = new Host(selected);
  host.setState = patch => { host.state = { ...host.state, ...patch }; };
  return host;
}
function release(id = 'legacy-ap5', calendarRuntime?: Record<string, unknown>, hash = 'first-hash') {
  return { releaseId: id, manifestSha256: hash, runtime: { data: { releaseId: id }, ...(calendarRuntime ? { calendarRuntime } : {}) } };
}
function result(value: ReturnType<typeof release> & { invalid?: boolean } = release()) { return { mode: 'network', release: value }; }
function nodes(element: unknown): React.ReactElement<any>[] {
  if (Array.isArray(element)) return element.flatMap(nodes);
  if (!React.isValidElement(element)) return [];
  return [element, ...nodes((element.props as { children?: unknown }).children)];
}
function calculator(host: HostInstance) { return nodes(host.render()).find(node => node.type instanceof Function && node.type.name === 'FristenrechnerApp'); }
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function settle() { await new Promise(resolve => setImmediate(resolve)); }
function reset() { control.calls = []; control.factories = []; control.active = async () => undefined; control.refresh = async () => result(); }

test('C3 host forwards a validated Format-7 runtime automatically, never candidate approval options', async () => {
  reset();
  const runtime = { releaseId: 'format7', referenceOnly: false };
  control.refresh = async () => result(release('format7', runtime));
  const host = instantiate();
  host.componentDidMount(); await settle();
  assert.equal(calculator(host)?.props.calendarRuntime, runtime);
  assert.equal(control.factories.length, 1);
  assert.equal(control.factories[0]![1], undefined);
  assert.equal(control.calls[0]![1], host.props.provider);
});

test('historical AP5 runtime retains its identity without a calendar context prop', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  assert.equal(calculator(host)?.props.data.releaseId, 'legacy-ap5');
  assert.equal(Object.hasOwn(calculator(host)!.props, 'calendarRuntime'), false);
  assert.equal(Object.hasOwn(calculator(host)!.props, 'referenceOnlyAllCalculations'), false);
});

test('same provider label on a different site hides the old result synchronously and reloads', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const previous = host.props;
  const pending = deferred<any>(); control.refresh = async () => pending.promise;
  host.props = props(provider('https://example.test/sites/B'));
  assert.equal(calculator(host), undefined, 'render before componentDidUpdate must already hide A');
  host.componentDidUpdate(previous); await settle();
  assert.equal(calculator(host), undefined);
  assert.equal(control.calls.at(-1)![1], host.props.provider);
  pending.resolve(result(release('new-site'))); await settle();
  assert.equal(calculator(host)?.props.data.releaseId, 'new-site');
});

test('mirror-path change changes the React key even when release ID and provider label are identical', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const key = calculator(host)!.key;
  const previous = host.props; host.props = props(provider('https://example.test/sites/A', '/different'));
  host.componentDidUpdate(previous); await settle();
  assert.notEqual(calculator(host)!.key, key);
});

test('new manifest bytes remount the session even if a release name was reused', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const key = calculator(host)!.key;
  const previous = host.props; host.props = { ...host.props, store: {} };
  control.refresh = async () => result(release('legacy-ap5', undefined, 'changed-hash'));
  host.componentDidUpdate(previous); await settle();
  assert.notEqual(calculator(host)!.key, key);
  assert.equal(control.calls.at(-1)![2], host.props.store);
});

test('configuration errors immediately hide calculator, do not access cache, and show an error', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const previous = host.props; control.calls = [];
  host.props = { ...host.props, configurationError: 'broken config' };
  assert.equal(calculator(host), undefined);
  host.componentDidUpdate(previous); await settle();
  assert.equal(control.calls.length, 0);
  assert.equal(host.state.status, 'error');
  assert.equal(host.state.calculationData, undefined);
});

test('an incorrectly bound configuration key cannot resurrect cached data', async () => {
  reset(); const host = instantiate({ ...props(), configurationKey: 'wrong' });
  host.componentDidMount(); await settle();
  assert.equal(control.calls.length, 0); assert.equal(calculator(host), undefined);
  assert.equal(host.state.status, 'error');
});

test('late response from old configuration and unmounted host never overwrites current state', async () => {
  reset(); const oldRequest = deferred<any>(); control.refresh = async () => oldRequest.promise;
  const host = instantiate(); host.componentDidMount(); await settle();
  const previous = host.props; host.props = props(provider('https://example.test/sites/B'));
  control.refresh = async () => result(release('current'));
  host.componentDidUpdate(previous); await settle();
  oldRequest.resolve(result(release('late-old'))); await settle();
  assert.equal(calculator(host)?.props.data.releaseId, 'current');
  const pending = deferred<any>(); control.refresh = async () => pending.promise;
  const previousAgain = host.props; host.props = { ...host.props, store: {} };
  host.componentDidUpdate(previousAgain); await settle(); host.componentWillUnmount();
  const state = host.state; pending.resolve(result(release('after-unmount'))); await settle();
  assert.equal(host.state, state);
});

test('invalid adapted data clears a valid local display rather than leaving it stale', async () => {
  reset(); control.active = async () => release('local');
  control.refresh = async () => result({ ...release(), invalid: true });
  const host = instantiate(); host.componentDidMount(); await settle();
  assert.equal(calculator(host), undefined); assert.equal(host.state.status, 'error');
});

test('WebPart remounts by the real cache identity and does not expose a candidate control', async () => {
  const source = await readFile(resolve('spfx/src/webparts/fristenrechner/FristenrechnerWebPart.ts'), 'utf8');
  assert.match(source, /key: getProviderCacheIdentity\(provider\)/);
  assert.match(source, /key: props.configurationKey/);
  assert.doesNotMatch(source, /localReference|referenceOnlyAllCalculations|URLSearchParams|ap22c3/);
});
