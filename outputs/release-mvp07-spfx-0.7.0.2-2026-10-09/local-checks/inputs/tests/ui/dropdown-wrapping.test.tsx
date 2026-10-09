// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, afterEach, test } from 'node:test';
import { buildSync } from 'esbuild';
import * as ts from 'typescript';
import type * as ReactType from 'react';
import type * as TestUtilsType from 'react-dom/test-utils';

test('every calculator dropdown explicitly uses the same layer-aware wrapping slots', () => {
  const counts = new Map<string, number>();
  for (const path of ['src/ui/FristenrechnerApp.tsx', 'src/ui/calendarContextUi.tsx']) {
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let count = 0;
    const visit = (node: ts.Node): void => {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(source) === 'Dropdown') {
        const style = node.attributes.properties.find(attribute => ts.isJsxAttribute(attribute) && attribute.name.getText(source) === 'styles');
        assert.ok(style && ts.isJsxAttribute(style) && style.initializer && ts.isJsxExpression(style.initializer));
        assert.equal(style.initializer.expression?.getText(source), 'calculatorDropdownStyles', `${path}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}`);
        count += 1;
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    counts.set(path, count);
  }
  assert.equal(counts.get('src/ui/FristenrechnerApp.tsx'), 16);
  assert.equal(counts.get('src/ui/calendarContextUi.tsx'), 3);
});

// This checks Fluent UI's actual DOM and injected CSS, including its separate
// mobile Panel. It does not claim pixel geometry or replace real host zoom QA.
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom') as {
  JSDOM: new (html: string, options: object) => { window: Window & typeof globalThis & { close(): void } }
};
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://dropdown-tests.invalid/', pretendToBeVisual: true });
const oldGlobals = new Map<string, PropertyDescriptor | undefined>();
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent',
  'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'MessageChannel']) {
  oldGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  const candidate = Reflect.get(dom.window, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true,
    value: ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(name) ? candidate.bind(dom.window) : candidate });
}
Object.defineProperty(dom.window, 'matchMedia', { configurable: true, value: (query: string) => ({
  matches: false, media: query, onchange: null, addListener() {}, removeListener() {},
  addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false
}) });
const sheet = document.createElement('style');
sheet.textContent = readFileSync('src/ui/styles.css', 'utf8');
document.head.append(sheet);
const ReactDOM = require('react-dom') as {
  render(element: ReactType.ReactElement, target: Element): unknown;
  unmountComponentAtNode(target: Element): boolean;
};
const { act, Simulate } = require('react-dom/test-utils') as typeof TestUtilsType;
const bundle = buildSync({ stdin: { contents: `
  import React from 'react';
  import {Dropdown} from '@fluentui/react/lib/Dropdown';
  import {ResponsiveMode} from '@fluentui/react/lib/ResponsiveMode';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {calculatorDropdownStyles} from './src/ui/dropdownStyles';
  setIconOptions({disableWarnings:true});
  export const element=(options, selectedKey, narrow, onChange, disabled)=>React.createElement('main',{className:'fr-app'},
    React.createElement('div',{className:'fr-form__grid'},React.createElement(Dropdown,{
      label:'Art der Zustellung',styles:calculatorDropdownStyles,options,selectedKey,onChange,disabled,
      responsiveMode:narrow?ResponsiveMode.small:ResponsiveMode.large
    })));
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const fixture = module.exports as { element(options: unknown[], selectedKey: string, narrow: boolean, onChange: (...args: unknown[]) => void, disabled: boolean): ReactType.ReactElement };
const longText = 'Nicht abgeholte eingeschriebene Sendung (siebentägige Zustellfiktion nach erfolglosem Zustellversuch)';
const frenchText = 'Envoi recommandé non retiré (fiction de notification au septième jour après la tentative infructueuse de remise)';
const options = [
  { key: 'selected', text: longText }, { key: 'other', text: frenchText },
  { key: 'disabled', text: `${longText} – nicht verfügbar`, disabled: true }
];
let container: HTMLDivElement | undefined;
afterEach(() => {
  if (container) act(() => { ReactDOM.unmountComponentAtNode(container!); });
  container?.remove();
  container = undefined;
  document.body.replaceChildren();
});
after(() => {
  dom.window.close();
  for (const [name, descriptor] of oldGlobals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});
function mount(selectedKey: string, narrow: boolean, onChange: (...args: unknown[]) => void = () => {}, disabled = false): HTMLElement {
  container = document.createElement('div');
  document.body.append(container);
  act(() => { ReactDOM.render(fixture.element(options, selectedKey, narrow, onChange, disabled), container!); });
  const dropdown = container.querySelector<HTMLElement>('[role="combobox"]');
  assert.ok(dropdown);
  return dropdown;
}
function assertTextWraps(element: Element): void {
  const style = getComputedStyle(element);
  assert.equal(style.whiteSpace, 'normal');
  assert.equal(style.textOverflow, 'clip');
  assert.equal(style.overflow, 'visible');
  assert.equal(style.overflowWrap, 'anywhere');
}

for (const narrow of [false, true]) for (const selectedKey of ['selected', 'disabled']) {
  test(`real Fluent ${narrow ? 'mobile Panel' : 'Callout'} wraps selected, ordinary and disabled option text (${selectedKey})`, () => {
    const dropdown = mount(selectedKey, narrow);
    const title = container!.querySelector('.ms-Dropdown-title')!;
    assertTextWraps(title);
    assert.equal(getComputedStyle(title).height, 'auto');
    assert.equal(getComputedStyle(title).minHeight, '32px');
    act(() => { Simulate.click(dropdown); });
    assert.ok(document.querySelector(narrow ? '.ms-Panel' : '.ms-Callout'));
    const entries = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
    assert.equal(entries.length, options.length);
    for (const [index, entry] of entries.entries()) {
      assert.equal(entry.textContent?.trim(), options[index]!.text);
      assertTextWraps(entry.querySelector('.ms-Dropdown-optionText')!);
      assert.equal(getComputedStyle(entry).height, 'auto');
      assert.equal(getComputedStyle(entry).minHeight, '36px');
      assert.equal(entry.getAttribute('aria-selected'), String(options[index]!.key === selectedKey));
    }
    assert.equal(entries[2]!.getAttribute('aria-disabled'), 'true');
  });
}

test('wrapping preserves selected values, onChange and disabled-field semantics', () => {
  const selections: unknown[] = [];
  const dropdown = mount('selected', false, (_event, option) => { selections.push(option); });
  act(() => { Simulate.click(dropdown); });
  const other = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(element => element.textContent === frenchText)!;
  act(() => { Simulate.click(other); });
  assert.deepEqual(selections, [options[1]]);
  act(() => { ReactDOM.render(fixture.element(options, 'disabled', false, () => {}, true), container!); });
  const disabled = container!.querySelector('[role="combobox"]')!;
  assert.equal(disabled.getAttribute('aria-disabled'), 'true');
  assertTextWraps(container!.querySelector('.ms-Dropdown-title')!);
});
