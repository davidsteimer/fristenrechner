// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { after, test } from 'node:test';
import { buildSync } from 'esbuild';
import type { DateInputProps } from '../../src/ui/DateInput';
import type { DateInputSession } from '../../src/ui/dateInputSession';

// jsdom is pinned for root tests, never included in the product/browser bundle.
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://test.invalid/', pretendToBeVisual: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver', 'getComputedStyle', 'MessageChannel'] as const) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
}
Object.defineProperty(globalThis, 'requestAnimationFrame', { value: dom.window.requestAnimationFrame.bind(dom.window), configurable: true });
Object.defineProperty(globalThis, 'cancelAnimationFrame', { value: dom.window.cancelAnimationFrame.bind(dom.window), configurable: true });
after(() => dom.window.close());
dom.window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
const React = require('react');
const ReactDOM = require('react-dom');
const { act, Simulate } = require('react-dom/test-utils');
const built = buildSync({ stdin: { contents: `
  export {DateInput} from './src/ui/DateInput';
  export {createDateInputSession,DateInputSessionContext} from './src/ui/dateInputSession';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  setIconOptions({disableWarnings:true});
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
external: ['react', 'react-dom'], logLevel: 'silent' });
const compiled = { exports: {} as { DateInput: unknown; DateInputSessionContext: { Provider: unknown }; createDateInputSession: () => DateInputSession } };
new Function('require', 'module', 'exports', built.outputFiles[0]!.text)(require, compiled, compiled.exports);
const api = compiled.exports;

function mount(initial: Partial<DateInputProps> = {}) {
  const container = document.createElement('div');
  document.body.append(container);
  const emitted: string[] = [];
  const session = api.createDateInputSession();
  let edits = 0;
  let props = { label: 'Empfangsdatum', value: '', name: 'inputDate', ...initial };
  const render = () => ReactDOM.render(React.createElement(api.DateInputSessionContext.Provider, { value: session },
    React.createElement(api.DateInput, { ...props, onDraftChange: () => { edits++; }, onChange: (value: string) => {
      emitted.push(value); props = { ...props, value }; render();
    } })), container);
  act(() => { render(); });
  const input = () => container.querySelector('input')!;
  return {
    container, session, emitted, input, edits: () => edits,
    change(value: string) { act(() => { input().value = value; Simulate.change(input()); }); },
    key(key: string, altKey = false) {
      const event = new dom.window.KeyboardEvent('keydown', { key, altKey, bubbles: true, cancelable: true });
      act(() => { input().dispatchEvent(event); }); return event;
    },
    blur(target: Element | null = null) { act(() => Simulate.blur(input(), { relatedTarget: target })); },
    update(next: Partial<DateInputProps>) { props = { ...props, ...next }; act(() => { render(); }); },
    open(kind: 'calendar' | 'help') {
      const button = container.querySelectorAll('button')[kind === 'calendar' ? 0 : 1]!;
      act(() => { Simulate.blur(input(), { relatedTarget: button }); Simulate.click(button); });
    },
    dismiss() { const button = Array.from(document.querySelectorAll('button')).find(el => ['Abbrechen', 'Annuler', 'Schliessen', 'Fermer'].includes(el.textContent ?? ''))!;
      assert.ok(button); act(() => Simulate.click(button)); },
    close() { act(() => { ReactDOM.unmountComponentAtNode(container); }); container.remove(); }
  };
}

test('stable native text input has Swiss placeholder, label, text keyboard and linked accessible error', () => {
  const ui = mount({ errorMessage: 'Datum fehlt' });
  try {
    const input = ui.input();
    assert.equal(input.type, 'text'); assert.equal(input.inputMode, 'text');
    assert.equal(input.placeholder, 'TT.MM.JJJJ');
    assert.equal(ui.container.querySelector('label')?.htmlFor, input.id);
    assert.equal(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent, 'Datum fehlt');
    ui.change('16.09.2026'); assert.equal(ui.input(), input);
    assert.equal(ui.edits(), 1); assert.deepEqual(ui.emitted, []);
  } finally { ui.close(); }
});

test('Enter fixes the value without submitting and Tab commits without preventing normal navigation', () => {
  const ui = mount();
  try {
    ui.change('16.9.2026'); assert.equal(ui.key('Enter').defaultPrevented, true);
    assert.equal(ui.input().value, '16.09.2026'); assert.deepEqual(ui.emitted, ['2026-09-16']);
    ui.change('17.9.2026'); assert.equal(ui.key('Tab').defaultPrevented, false);
    assert.equal(ui.input().value, '17.09.2026'); assert.equal(ui.emitted.at(-1), '2026-09-17');
    ui.blur(); assert.equal(ui.emitted.length, 2);
    for (const button of Array.from(ui.container.querySelectorAll('button'))) assert.equal(button.tabIndex, -1);
    assert.equal(ui.input().getAttribute('aria-keyshortcuts'), 'Alt+ArrowDown F1');
  } finally { ui.close(); }
});

for (const shortcut of ['calendar', 'help'] as const) test(`${shortcut} keyboard shortcut preserves draft and cancellation restores input focus`, () => {
  const ui = mount({ value: '2026-09-16' });
  try {
    ui.input().focus(); ui.change('unfinished');
    const event = shortcut === 'calendar' ? ui.key('ArrowDown', true) : ui.key('F1');
    assert.equal(event.defaultPrevented, true); assert.ok(document.querySelector('[role="dialog"]'));
    ui.dismiss(); assert.equal(ui.input().value, 'unfinished'); assert.deepEqual(ui.emitted, []);
    assert.equal(document.activeElement, ui.input());
  } finally { ui.close(); }
});

test('invalid replacement clears committed ISO while preserving the exact visible draft and error', () => {
  const ui = mount({ value: '2026-09-16' });
  try {
    ui.change('31.04.2026'); ui.blur();
    assert.equal(ui.input().value, '31.04.2026'); assert.deepEqual(ui.emitted, ['']);
    assert.equal(ui.input().getAttribute('aria-invalid'), 'true');
    assert.match(ui.container.textContent!, /Dieses Datum gibt es nicht/);
    ui.update({ locale: 'fr' });
    assert.match(ui.container.textContent!, /Cette date n’existe pas/);
    assert.doesNotMatch(ui.container.textContent!, /Dieses Datum/);
    assert.equal(ui.input().placeholder, 'JJ.MM.AAAA');
  } finally { ui.close(); }
});

test('form session commits the latest still-focused draft, never the previous committed value', () => {
  const ui = mount({ value: '2026-09-16' });
  try {
    ui.change('20.10.2026'); let result: ReturnType<DateInputSession['commitAll']>;
    act(() => { result = ui.session.commitAll(); });
    assert.deepEqual(result!.inputDate, { value: '2026-10-20' });
    assert.equal(ui.input().value, '20.10.2026');
    ui.change('31.2'); act(() => { result = ui.session.commitAll(); });
    assert.equal(result!.inputDate?.value, ''); assert.match(result!.inputDate?.errorMessage ?? '', /gibt es nicht/);
  } finally { ui.close(); }
});

test('reset key clears an uncommitted draft even when the committed value stays empty', () => {
  const ui = mount({ resetKey: 0 });
  try {
    ui.change('invalid'); ui.open('help');
    ui.update({ resetKey: 1 });
    assert.equal(ui.input().value, ''); assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(ui.input().getAttribute('aria-invalid'), 'false');
  } finally { ui.close(); }
});

for (const kind of ['calendar', 'help'] as const) test(`${kind} opening and cancellation preserve uncommitted and invalid drafts`, () => {
  const ui = mount({ value: '2026-09-16' });
  try {
    ui.change('bad draft'); ui.open(kind);
    assert.ok(document.querySelector('[role="dialog"]'));
    assert.equal(ui.input().value, 'bad draft'); assert.deepEqual(ui.emitted, []);
    ui.dismiss(); assert.equal(ui.input().value, 'bad draft'); assert.deepEqual(ui.emitted, []);
  } finally { ui.close(); }
});

test('calendar clear uses the same strict commit path and invalidates existing results', () => {
  const ui = mount({ value: '2026-09-16' });
  try {
    ui.open('calendar');
    const button = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Datum leeren')!;
    act(() => Simulate.click(button));
    assert.equal(ui.input().value, ''); assert.deepEqual(ui.emitted, ['']); assert.equal(ui.edits(), 1);
  } finally { ui.close(); }
});

test('disabled and unmounted fields do not participate in submit', () => {
  const ui = mount({ disabled: true });
  try {
    assert.equal(ui.input().disabled, true); assert.deepEqual(Object.keys(ui.session.commitAll()), []);
    ui.update({ disabled: false }); assert.deepEqual(Object.keys(ui.session.commitAll()), ['inputDate']);
  } finally { ui.close(); }
  assert.deepEqual(Object.keys(ui.session.commitAll()), []);
});

test('registry uses one instant for all fields and old cleanup cannot unregister a replacement', () => {
  const session = api.createDateInputSession();
  const instants: Date[] = [];
  const old = session.register('inputDate', { commit: now => { instants.push(now); return { value: 'old' }; } });
  session.register('inputDate', { commit: now => { instants.push(now); return { value: 'new' }; } });
  session.register('other', { commit: now => { instants.push(now); return { value: 'other' }; } });
  old(); const result = session.commitAll();
  assert.equal(result.inputDate?.value, 'new'); assert.equal(instants.length, 2); assert.equal(instants[0], instants[1]);
});

test('iOS styling is left-aligned 16px with a 44px touch target and no native date picker dependency', () => {
  const css = readFileSync('src/ui/styles.css', 'utf8');
  const source = readFileSync('src/ui/DateInput.tsx', 'utf8');
  assert.match(css, /font: 16px/); assert.match(css, /text-align: left/); assert.match(css, /pointer: coarse/);
  assert.match(css, /height: 44px/); assert.doesNotMatch(source, /showPicker|type="date"/);
});
