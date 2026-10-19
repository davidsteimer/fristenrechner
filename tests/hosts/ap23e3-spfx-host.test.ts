// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { build } from 'esbuild';
import * as React from 'react';

// Actual SPFx host lifecycle with controlled transport timing. Full byte-bound
// Format9 provider and factory behavior is tested by spfx/test/ap23e3-format9.
const bundle = await build({ stdin: { contents: `
  export { default as Host } from './spfx/src/webparts/fristenrechner/components/Fristenrechner';
  export { control } from 'ap23e3-host-test-control';
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react'], logLevel: 'silent', plugins: [{ name: 'ap23e3-host-fixtures', setup(builder) {
    builder.onResolve({ filter: /ap23e3-host-test-control|\/ReleaseService$|\/cacheIdentity$|\/product\/core$|\/product\/ui$|^@fluentui\/react$|\.scss$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => {
      const contents = args.path === 'ap23e3-host-test-control'
        ? `export const control = { factories: [], active: async () => undefined, refresh: async () => { throw Error('offline'); } };`
        : args.path.endsWith('/ReleaseService')
          ? `import {control} from 'ap23e3-host-test-control'; export class ReleaseService {
              getActive(provider) { return control.active(provider); } refresh(provider) { return control.refresh(provider); }
            }`
          : args.path.endsWith('/cacheIdentity')
            ? `export function getProviderCacheIdentity(provider) { return JSON.stringify(provider.cacheConfiguration); }`
            : args.path.endsWith('/product/core')
              ? `import {control} from 'ap23e3-host-test-control'; export const hasMatchingFormat8Runtime = () => false; export function createCalculatorRuntime(release, options) {
                  control.factories.push([release, options]); if (release.invalid) throw Error('invalid full Format9 context'); return release.runtime;
                } export function hasMatchingFormat9Runtime(data, calendarRuntime, administrativeContext) {
                  return control.factories.some(([release]) => !release.invalid && release.runtime.data === data
                    && release.runtime.calendarRuntime === calendarRuntime && release.runtime.administrativeContext === administrativeContext);
                }`
              : args.path.endsWith('/product/ui')
                ? `export function FristenrechnerApp() { return null; }`
                : args.path === '@fluentui/react'
                  ? `import * as React from 'react'; export const MessageBarType = { warning:1, info:2, error:3 };
                      export const MessageBar = props => React.createElement('aside', props); export const Spinner = props => React.createElement('i', props);`
                  : `export default { host:'host', startup:'startup' };`;
      return { contents, loader: 'js' };
    });
  } }] });
const evaluated = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(createRequire(import.meta.url), evaluated, evaluated.exports);
type HostInstance = {
  props: Record<string, any>; state: Record<string, any>;
  setState: (value: Record<string, any>) => void;
  render: () => React.ReactElement;
  componentDidMount: () => void;
  componentDidUpdate: (previous: Record<string, any>) => void;
  componentWillUnmount: () => void;
};
const { Host, control } = evaluated.exports as {
  Host: new (props: Record<string, any>) => HostInstance;
  control: { factories: any[][]; active: (provider: any) => Promise<any>; refresh: (provider: any) => Promise<any> };
};
function props(site = 'E', folder = 'format9') {
  const provider = { id: 'same-label', kind: 'sharepointMirror', cacheConfiguration: {
    kind: 'sharepointMirror', siteAbsoluteUrl: `https://example.test/sites/${site}`, mirrorPath: `/${folder}`
  } };
  return { componentId: 'component', hostLabel: 'SharePoint', providerLabel: 'Mirror', provider,
    configurationKey: JSON.stringify(provider.cacheConfiguration), store: {} };
}
function release(name = 'format9', hash = 'manifest-a') {
  return { releaseId: name, manifestSha256: hash, runtime: {
    data: { releaseId: name, formatVersion: '9.0.0' },
    calendarRuntime: { releaseId: name, referenceOnly: false },
    administrativeContext: { releaseId: name, transportBound: true }
  } };
}
function activation(value: any = release(), mode = 'network') { return { mode, release: value }; }
function instantiate(): HostInstance {
  const host = new Host(props());
  host.setState = patch => { host.state = { ...host.state, ...patch }; };
  return host;
}
function nodes(value: unknown): React.ReactElement<any>[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!React.isValidElement(value)) return [];
  return [value, ...nodes((value.props as { children?: unknown }).children)];
}
function calculator(host: HostInstance) {
  return nodes(host.render()).find(node => typeof node.type === 'function' && node.type.name === 'FristenrechnerApp');
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(yes => { resolve = yes; });
  return { promise, resolve };
}
async function settle() { await new Promise(resolve => setImmediate(resolve)); }
function reset() { control.factories = []; control.active = async () => undefined; control.refresh = async () => activation(); }

test('AP23E3 actual host passes the shared Format9 contexts together without local-reference options', async () => {
  reset();
  const bound = release();
  control.refresh = async () => activation(bound);
  const host = instantiate(); host.componentDidMount(); await settle();
  assert.equal(calculator(host)?.props.data, bound.runtime.data);
  assert.equal(calculator(host)?.props.calendarRuntime, bound.runtime.calendarRuntime);
  assert.equal(calculator(host)?.props.administrativeContext, bound.runtime.administrativeContext);
  assert.equal(control.factories[0]![1], undefined);
  assert.equal(Object.hasOwn(calculator(host)!.props, 'referenceOnlyAllCalculations'), false);
});

test('AP23E3 byte-identical cache to network refresh validates again without discarding the current administrative form', async () => {
  reset();
  const cached = release();
  const fetched = release();
  assert.notEqual(cached.runtime.administrativeContext, fetched.runtime.administrativeContext);
  control.active = async () => cached;
  const pending = deferred<any>();
  control.refresh = async () => pending.promise;
  const host = instantiate(); host.componentDidMount(); await settle();
  assert.equal(host.state.status, 'local');
  const before = calculator(host)!;
  pending.resolve(activation(fetched)); await settle();
  const after = calculator(host)!;
  assert.equal(host.state.status, 'ready');
  assert.equal(control.factories.length, 2, 'Network bytes must still pass the full factory');
  assert.equal(after.key, before.key);
  assert.equal(after.props.data, before.props.data);
  assert.equal(after.props.calendarRuntime, before.props.calendarRuntime);
  assert.equal(after.props.administrativeContext, before.props.administrativeContext);
});

test('AP23E3 byte-identical refresh updates fallback status and warning while preserving only the valid context', async () => {
  reset();
  control.active = async () => release();
  const pending = deferred<any>();
  control.refresh = async () => pending.promise;
  const host = instantiate(); host.componentDidMount(); await settle();
  const context = host.state.administrativeContext;
  pending.resolve({ ...activation(release(), 'fallback'), warning: 'Temporary synthetic network failure' }); await settle();
  assert.equal(host.state.status, 'fallback');
  assert.equal(host.state.message, 'Temporary synthetic network failure');
  assert.equal(host.state.administrativeContext, context);
});

test('AP23E3 same hash never reuses mismatched unissued administrative context objects', async () => {
  reset();
  const cached = release();
  const fetched = release();
  control.active = async () => cached;
  const pending = deferred<any>(); control.refresh = async () => pending.promise;
  const host = instantiate(); host.componentDidMount(); await settle();
  host.state.administrativeContext = { forged: true };
  pending.resolve(activation(fetched)); await settle();
  assert.equal(host.state.administrativeContext, fetched.runtime.administrativeContext);
});

test('AP23E3 configuration changes immediately remove the old administrative result and export subtree', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const previous = host.props;
  const pending = deferred<any>(); control.refresh = async () => pending.promise;
  host.props = props('Q');
  assert.equal(calculator(host), undefined);
  host.componentDidUpdate(previous); await settle();
  assert.equal(host.state.administrativeContext, undefined);
  assert.equal(calculator(host), undefined);
  pending.resolve(activation(release('Q-format9'))); await settle();
  assert.equal(calculator(host)?.props.administrativeContext.releaseId, 'Q-format9');
});

test('AP23E3 new manifest hash remounts the calculator even under the same release name', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const originalKey = calculator(host)!.key;
  const previous = host.props;
  host.props = { ...host.props, store: {} };
  control.refresh = async () => activation(release('format9', 'manifest-b'));
  host.componentDidUpdate(previous); await settle();
  assert.notEqual(calculator(host)!.key, originalKey);
  assert.equal(calculator(host)?.props.data.releaseId, 'format9');
});

test('AP23E3 late old configuration response cannot replace the current administrative context', async () => {
  reset();
  const pending = deferred<any>(); control.refresh = async () => pending.promise;
  const host = instantiate(); host.componentDidMount(); await settle();
  const previous = host.props; host.props = props('Q');
  control.refresh = async () => activation(release('current-Q'));
  host.componentDidUpdate(previous); await settle();
  const current = host.state.administrativeContext;
  pending.resolve(activation(release('late-E'))); await settle();
  assert.equal(host.state.administrativeContext, current);
  assert.equal(calculator(host)?.props.data.releaseId, 'current-Q');
});

test('AP23E3 invalid network adaptation clears all previously displayed local Format9 contexts', async () => {
  reset(); control.active = async () => release('local-format9');
  control.refresh = async () => activation({ ...release(), invalid: true });
  const host = instantiate(); host.componentDidMount(); await settle();
  assert.equal(host.state.status, 'error');
  assert.equal(host.state.calculationData, undefined);
  assert.equal(host.state.calendarRuntime, undefined);
  assert.equal(host.state.administrativeContext, undefined);
  assert.equal(calculator(host), undefined);
});

test('AP23E3 same-configuration fallback forwards only its revalidated administrative context', async () => {
  reset(); const cached = release('revalidated-format9');
  control.refresh = async () => activation(cached, 'fallback');
  const host = instantiate(); host.componentDidMount(); await settle();
  assert.equal(host.state.status, 'fallback');
  assert.equal(calculator(host)?.props.administrativeContext, cached.runtime.administrativeContext);
  assert.equal(control.factories[0]![0], cached);
});

test('AP23E3 returning to the historical AP5 host cannot retain a Format9 administrative context', async () => {
  reset(); const host = instantiate(); host.componentDidMount(); await settle();
  const previous = host.props; host.props = props('E', 'ap5');
  control.refresh = async () => activation({ releaseId: 'ap5', manifestSha256: 'ap5-manifest', runtime: {
    data: { releaseId: 'ap5', formatVersion: '1.0.0' }
  } });
  host.componentDidUpdate(previous); await settle();
  assert.equal(host.state.administrativeContext, undefined);
  assert.equal(Object.hasOwn(calculator(host)!.props, 'administrativeContext'), false);
  assert.equal(Object.hasOwn(calculator(host)!.props, 'calendarRuntime'), false);
  assert.equal(calculator(host)?.props.data.releaseId, 'ap5');
});

