// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { after, test } from 'node:test';
import { calculatorDropdownStyles } from '../../src/ui/dropdownStyles';

// Inspect the authored CSS contract only. jsdom does not measure browser layout
// or prove real-device geometry and touch behaviour.
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
after(() => dom.window.close());
const style = dom.window.document.createElement('style');
style.textContent = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8');
dom.window.document.head.append(style);
const sheet = style.sheet as CSSStyleSheet;

function ruleIn(rules: CSSRuleList, selector: string): CSSStyleDeclaration {
  const matches = Array.from(rules).filter(rule =>
    rule.type === 1 && (rule as CSSStyleRule).selectorText === selector);
  assert.equal(matches.length, 1, `Expected one exact CSS rule for ${selector}`);
  return (matches[0] as CSSStyleRule).style;
}

test('issue 50: ordinary date field shares the 32px single-line control height', () => {
  const date = ruleIn(sheet.cssRules, '.fr-date-input input');
  const title = calculatorDropdownStyles.title as Record<string, unknown>;
  assert.equal(date.getPropertyValue('height'), '32px');
  assert.equal(title.minHeight, 32);
  assert.equal(date.getPropertyValue('height'), `${title.minHeight}px`);
  assert.equal(ruleIn(sheet.cssRules, '.fr-date-input__controls').getPropertyValue('align-items'), 'stretch');
  assert.equal(ruleIn(sheet.cssRules, '.fr-date-input__aux').getPropertyValue('height'), '');
});

test('issue 50: date typography matches desktop fields and preserves 16px text on coarse pointers', () => {
  const date = ruleIn(sheet.cssRules, '.fr-date-input input');
  assert.equal(date.getPropertyValue('font'), '14px Aptos, Arial, Helvetica, sans-serif');
  assert.equal(date.getPropertyValue('text-align'), 'left');
  const coarse = Array.from(sheet.cssRules).filter(rule =>
    rule.type === 4 && (rule as CSSMediaRule).conditionText === '(pointer: coarse)');
  assert.equal(coarse.length, 1);
  const coarseRules = (coarse[0] as CSSMediaRule).cssRules;
  assert.equal(ruleIn(coarseRules, '.fr-date-input input').getPropertyValue('height'), '44px');
  assert.equal(ruleIn(coarseRules, '.fr-date-input input').getPropertyValue('font-size'), '16px');
  assert.equal(ruleIn(coarseRules, '.fr-date-input__aux, .fr-date-input__help').getPropertyValue('flex-basis'), '44px');
});

test('issue 50: equal single-line height does not constrain multiline dropdowns', () => {
  const title = calculatorDropdownStyles.title as Record<string, unknown>;
  assert.equal(title.height, 'auto');
  assert.equal(title.minHeight, 32);
  assert.equal(title.whiteSpace, 'normal');
  assert.equal(title.overflow, 'visible');
  assert.equal(title.textOverflow, 'clip');
  assert.equal(title.overflowWrap, 'anywhere');
});
