// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Emitted ES5 and actual AMD bytes only. No TypeScript or source transpiler.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {REPO_ROOT, loadPackagedHost, localMirrorConfiguration} = require('./package-harness.cjs');
const {parseDateEntry, formatDateEntry, zurichToday} = require('../lib-commonjs/product/ui/dateEntry.js');

function releaseProvider() {
  const releaseId = '2026-10-01-mvp-06-approved.1';
  const directory = path.join(REPO_ROOT, 'data/releases', releaseId);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  const files = new Map(['manifest.json', ...manifest.artifacts.map(item => item.path)]
    .map(name => [name, fs.readFileSync(path.join(directory, name))]));
  return {id: 'ap21-actual-approved-mvp06', kind: 'sharepointMirror',
    cacheConfiguration: localMirrorConfiguration(releaseId),
    async fetchBytes(name) {assert.ok(files.has(name)); return new Uint8Array(files.get(name));}};
}
async function calculator() {
  const runtime = loadPackagedHost();
  const activation = await runtime.service.refresh(releaseProvider());
  runtime.host.applyActivationResult(activation, runtime.host.props.configurationKey);
  assert.equal(runtime.host.state.status, 'ready');
  return runtime;
}
const initialState = {authorityCode: 'BE', profileId: 'stpo', inputDate: '2026-09-16', deadlineDays: '10'};
const dateText = (find, tree) => find(tree, element => element.type === 'input' && element.props.type === 'text');
function keyEvent(key) {
  return {key, nativeEvent: {isComposing: false}, prevented: false, stopped: false,
    preventDefault() {this.prevented = true;}, stopPropagation() {this.stopped = true;}};
}
function withDate(runtime, inspect) {
  return runtime.inspectCalculator(initialState, state => {
    const dateElement = state.findElement(state.tree, element => typeof element.type === 'function'
      && element.props.name === 'inputDate');
    assert.ok(dateElement, 'The actual bundled calculator must use the shared named DateInput');
    const instance = state.component(dateElement);
    return inspect({...state, dateElement, instance, dateTree: instance.render()});
  });
}

test('AP21 emitted ES5 parser fixes shortcuts to the Swiss civil date and rejects rollover guesses', () => {
  const at = new Date('2026-12-31T23:30:00Z');
  assert.equal(zurichToday(at), '2027-01-01');
  for (const [text, locale, expected] of [
    ['7', 'de', '2027-01-07'], ['16.9', 'de', '2027-09-16'],
    ['h', 'de', '2027-01-01'], ['a', 'fr', '2027-01-01'],
    ['29.2.2028', 'de', '2028-02-29']
  ]) {
    const result = parseDateEntry(text, locale, at);
    assert.equal(result.kind, 'valid'); assert.equal(result.value, expected);
    assert.equal(result.display, formatDateEntry(expected));
  }
  for (const text of ['31.4.2026', '29.2.2027', '16.9.26', '2026-09-16', 'tomorrow', '+1']) {
    assert.equal(parseDateEntry(text, 'de', at).kind, 'invalid', text);
  }
  assert.equal(parseDateEntry('a', 'de', at).kind, 'invalid');
  assert.equal(parseDateEntry('  ', 'de', at).kind, 'empty');
});

test('AP21 actual SPPKG exposes an ordinary editable text date, not the iOS-only native date control', async t => {
  const runtime = await calculator(); t.diagnostic(JSON.stringify(runtime.provenance));
  withDate(runtime, ({findElement, dateTree}) => {
    const input = dateText(findElement, dateTree);
    assert.ok(input); assert.equal(input.props.value, '16.09.2026');
    assert.equal(input.props.placeholder, 'TT.MM.JJJJ');
    assert.ok(!findElement(dateTree, element => element.type === 'input' && element.props.type === 'date'));
    assert.ok(findElement(dateTree, element => element.type === 'button' && element.props.type === 'button'),
      'A separate calendar button must remain available');
  });
});

test('AP21 actual bundled Enter handler commits a valid date without submitting the form', async () => {
  const runtime = await calculator();
  withDate(runtime, ({findElement, dateTree, instance, stateValues}) => {
    let input = dateText(findElement, dateTree);
    input.props.onChange({currentTarget: {value: '1.10.2026'}});
    input = dateText(findElement, instance.render());
    const event = keyEvent('Enter'); input.props.onKeyDown(event);
    assert.equal(event.prevented, true);
    assert.equal(dateText(findElement, instance.render()).props.value, '01.10.2026');
    assert.ok(stateValues().some(value => value?.inputDate === '2026-10-01'));
    assert.ok(!stateValues().some(value => value?.kind === 'general'));
  });
});

test('AP21 actual bundled form submit commits the still-focused draft, not an earlier ISO value', async () => {
  const runtime = await calculator();
  withDate(runtime, ({tree, findElement, dateTree, stateValues}) => {
    dateText(findElement, dateTree).props.onChange({currentTarget: {value: '1.10.2026'}});
    findElement(tree, element => element.type === 'form').props.onSubmit({preventDefault() {}});
    const result = stateValues().find(value => value?.kind === 'general');
    assert.ok(result, 'The real submit handler should calculate using the committed draft');
    assert.equal(result.value.finalEnd, '2026-10-12');
    assert.ok(stateValues().some(value => value?.inputDate === '2026-10-01'));
  });
});

test('AP21 actual bundled Tab keeps native navigation and commits on blur, while clear removes the previous date', async () => {
  const runtime = await calculator();
  withDate(runtime, ({findElement, dateTree, instance, stateValues}) => {
    let input = dateText(findElement, dateTree);
    input.props.onChange({currentTarget: {value: '1.10.2026'}});
    input = dateText(findElement, instance.render());
    const event = keyEvent('Tab'); input.props.onKeyDown(event);
    assert.equal(event.prevented, false);
    input.props.onBlur({relatedTarget: null});
    assert.equal(dateText(findElement, instance.render()).props.value, '01.10.2026');
    assert.ok(stateValues().some(value => value?.inputDate === '2026-10-01'));
    input.props.onChange({currentTarget: {value: ''}});
    dateText(findElement, instance.render()).props.onBlur({relatedTarget: null});
    assert.ok(stateValues().some(value => value?.inputDate === ''));
  });
});

test('AP21 actual bundled calendar handlers cancel without rewriting and commit the chosen civil date', async () => {
  const runtime = await calculator();
  withDate(runtime, ({findElement, dateTree, instance, stateValues}) => {
    dateText(findElement, dateTree).props.onChange({currentTarget: {value: '31.2.2026'}});
    const calendarButton = findElement(dateTree, element => element.type === 'button'
      && element.props['aria-label']?.startsWith('Datum im Kalender'));
    calendarButton.props.onClick();
    let opened = instance.render();
    const dialog = findElement(opened, element => element.props.dialogContentProps);
    assert.ok(dialog); dialog.props.onDismiss();
    assert.equal(dateText(findElement, instance.render()).props.value, '31.2.2026');
    assert.ok(!stateValues().some(value => value?.inputDate === ''));
    calendarButton.props.onClick(); opened = instance.render();
    const calendar = findElement(opened, element => typeof element.props.onSelectDate === 'function');
    assert.ok(calendar, 'The real dialog must render Fluent Calendar with a controlled handler');
    calendar.props.onSelectDate(new Date(2026, 9, 1, 12));
    assert.equal(dateText(findElement, instance.render()).props.value, '01.10.2026');
    assert.ok(stateValues().some(value => value?.inputDate === '2026-10-01'));
  });
});

test('AP21 actual bundled invalid draft prevents any stale-date calculation and remains editable', async () => {
  const runtime = await calculator();
  withDate(runtime, ({tree, findElement, dateTree, instance, stateValues}) => {
    dateText(findElement, dateTree).props.onChange({currentTarget: {value: '31.2.2026'}});
    findElement(tree, element => element.type === 'form').props.onSubmit({preventDefault() {}});
    assert.ok(!stateValues().some(value => value?.kind === 'general'));
    const input = dateText(findElement, instance.render());
    assert.equal(input.props.value, '31.2.2026');
    assert.equal(input.props['aria-invalid'], true);
    assert.ok(stateValues().some(value => value && typeof value === 'object'
      && typeof value.inputDate === 'string' && value.inputDate.includes('Datum')));
  });
});

test('AP21 actual bundled date error and placeholder follow the French locale without changing the draft', async () => {
  const runtime = await calculator();
  withDate(runtime, ({findElement, dateTree, dateElement, instance}) => {
    dateText(findElement, dateTree).props.onChange({currentTarget: {value: '31.2.2026'}});
    dateText(findElement, instance.render()).props.onKeyDown(keyEvent('Enter'));
    const french = instance.render({...dateElement.props, locale: 'fr'});
    const input = dateText(findElement, french);
    assert.equal(input.props.value, '31.2.2026');
    assert.equal(input.props.placeholder, 'JJ.MM.AAAA');
    const error = findElement(french, element => element.type === 'p' && element.props.role === 'alert');
    assert.match(error.props.children, /^Cette date/);
  });
});
