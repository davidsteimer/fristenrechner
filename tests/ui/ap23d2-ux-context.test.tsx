// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type { CalendarContext } from '../../src/core/calendarResolution';
import type { Locale } from '../../src/ui/i18n';
import type { JanuaryComparison } from '../../src/core/calculateCalendarBoundDeadline';
import { calendarMessages } from '../../src/ui/calendarMessages';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const bundled = buildSync({ stdin: { contents: `
  import React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {setIconOptions} from '@fluentui/react/lib/Styling';
  import {CalendarContextFields,CalendarContextTrace,JanuaryComparisonTrace} from './src/ui/calendarContextUi';
  import {mvp07Runtime} from './src/release/mvp07ReleaseData';
  export {effectiveCalendarContext,changeCalendarPlace,changeCalendarRole} from './src/ui/calendarContextUi';
  setIconOptions({disableWarnings:true});
  export const fields = props => renderToStaticMarkup(React.createElement(CalendarContextFields,{...props,onChange:()=>{}}));
  export const trace = props => renderToStaticMarkup(React.createElement(CalendarContextTrace,{...props,runtime:mvp07Runtime.calendarRuntime}));
  export const january = props => renderToStaticMarkup(React.createElement(JanuaryComparisonTrace,props));
`, loader: 'tsx', resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundled.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as {
  effectiveCalendarContext(profileId: string, value?: CalendarContext, authorityCode?: string): CalendarContext;
  changeCalendarPlace(value: CalendarContext, canton: string): CalendarContext;
  changeCalendarRole(value: CalendarContext, role: CalendarContext['role']): CalendarContext;
  fields(props: { profileId: string; value: CalendarContext; locale: Locale; authorityCode: string }): string;
  trace(props: { profileId: string; context: CalendarContext; locale: Locale }): string;
  january(props: { comparison: JanuaryComparison; locale: Locale }): string;
};
const empty: CalendarContext = { role: '', canton: '', areaFacts: {} };
const ai: CalendarContext = { role: 'court', canton: 'AI', areaFacts: { 'AI-RTG-INNER-ADDITIONAL': true } };

test('AP23D2 UX derives the ZPO court canton from the actual authority seat, not an old default', () => {
  assert.deepEqual(ui.effectiveCalendarContext('zpo', ai, 'TI'), { role: 'court', canton: 'TI', areaFacts: {} });
  assert.deepEqual(ui.effectiveCalendarContext('zpo', empty, 'BE'), { role: 'court', canton: 'BE', areaFacts: {} });
  assert.deepEqual(ai.areaFacts, { 'AI-RTG-INNER-ADDITIONAL': true });
});
test('AP23D2 UX CH is not a geographical court seat and never yields a CH calendar', () => {
  assert.deepEqual(ui.effectiveCalendarContext('zpo', empty, 'CH'), { role: 'court', canton: '', areaFacts: {} });
  assert.deepEqual(ui.effectiveCalendarContext('zpo', { role: 'court', canton: 'TI', areaFacts: {} }, 'CH'),
    { role: 'court', canton: 'TI', areaFacts: {} });
  assert.deepEqual(ui.effectiveCalendarContext('zpo', ai, ''), { role: 'court', canton: '', areaFacts: {} });
  assert.deepEqual(ui.effectiveCalendarContext('zpo', ai, 'XX'), { role: 'court', canton: '', areaFacts: {} });
});
test('AP23D2 UX preserves only current same-role same-place regional facts', () => {
  assert.deepEqual(ui.effectiveCalendarContext('zpo', ai, 'AI'), ai);
  assert.deepEqual(ui.effectiveCalendarContext('zpo', { ...ai, role: 'partyWithoutRepresentative' }, 'AI'),
    { role: 'court', canton: 'AI', areaFacts: {} });
  assert.deepEqual(ui.effectiveCalendarContext('zpo', empty, 'AI'), { role: 'court', canton: 'AI', areaFacts: {} });
  assert.deepEqual(ui.changeCalendarPlace(ai, 'NE').areaFacts, {});
  assert.deepEqual(ui.changeCalendarRole(ai, 'qualifiedServiceRepresentative'),
    { role: 'qualifiedServiceRepresentative', canton: '', areaFacts: {} });
});
test('AP23D2 UX never infers a party or representative place from the authority seat', () => {
  for (const profile of ['stpo', 'bgg', 'vwvg']) {
    const party: CalendarContext = { role: 'partyWithoutRepresentative', canton: 'NE', areaFacts: {} };
    assert.deepEqual(ui.effectiveCalendarContext(profile, party, 'BE'), party);
    assert.deepEqual(ui.effectiveCalendarContext(profile, empty, 'BE'), empty);
  }
});
test('AP23D2 UX known ZPO seats have no redundant role or canton field', () => {
  const html = ui.fields({ profileId: 'zpo', value: ai, authorityCode: 'TI', locale: 'de' });
  assert.doesNotMatch(html, /combobox|Massgebender Feiertagskanton|Zustellung an|Sitz des Gerichts/);
});
test('AP23D2 UX ZPO federal authority still asks the missing actual court canton', () => {
  const html = ui.fields({ profileId: 'zpo', value: empty, authorityCode: 'CH', locale: 'de' });
  assert.match(html, /Sitz des Gerichts – Kanton/);
  assert.equal((html.match(/role="combobox"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Massgebender Feiertagskanton|Zustellung an/);
});
test('AP23D2 UX court-region qualification remains explicit when its canton is automatic', () => {
  for (const canton of ['AI', 'NE']) {
    const html = ui.fields({ profileId: 'zpo', value: empty, authorityCode: canton, locale: 'de' });
    assert.match(html, canton === 'AI' ? /Gerichtssitz im Inneren Land/ : /Gerichtssitz in der Gemeinde Le Landeron/);
    assert.equal((html.match(/role="combobox"/g) ?? []).length, 1);
    assert.match(html, /Bitte wählen/);
  }
});
for (const locale of ['de', 'fr'] as const) test(`AP23D2 UX ${locale} asks factual party/representative places`, () => {
  for (const role of ['partyWithoutRepresentative', 'qualifiedServiceRepresentative'] as const) {
    const html = ui.fields({ profileId: 'stpo', value: { role, canton: 'BE', areaFacts: {} }, authorityCode: 'TI', locale });
    const document = new JSDOM(html).window.document;
    assert.ok(document.body.textContent!.includes(calendarMessages[locale][role === 'partyWithoutRepresentative' ? 'partyCanton' : 'representativeCanton']));
    assert.ok(!document.body.textContent!.includes(calendarMessages[locale].canton));
    if (role === 'qualifiedServiceRepresentative') assert.ok(document.body.textContent!.includes(calendarMessages[locale].representationScope));
  }
});
test('AP23D2 UX unresolved recipient does not invite an arbitrary canton selection', () => {
  const html = ui.fields({ profileId: 'stpo', value: empty, authorityCode: 'BE', locale: 'de' });
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('[role="combobox"][aria-disabled="true"]').length, 1);
});
test('AP23D2 UX human calendar trace retains sources and regional facts, technical IDs start closed', () => {
  const html = ui.trace({ profileId: 'zpo', context: ai, locale: 'de' });
  const document = new JSDOM(html).window.document;
  const technical = document.querySelector('details'); assert.ok(technical);
  assert.equal(technical.hasAttribute('open'), false);
  assert.match(technical.textContent!, /AP22-BIND-AI-ZPO|SHA-256/);
  assert.match(technical.textContent!, /AI-RTG-INNER-ADDITIONAL/);
  technical.remove();
  assert.match(document.body.textContent!, /Sitz des Gerichts – Kanton/);
  assert.doesNotMatch(document.body.textContent!, /Zustellung an/);
  assert.match(document.body.textContent!, /Gerichtssitz im Inneren Land.*Ja/);
  assert.ok(document.querySelector('a[href^="https://"]'));
  assert.doesNotMatch(document.body.textContent!, /AP22-BIND-|AI-RTG-INNER-ADDITIONAL|SHA-256|2026-10-08-mvp-07-approved/);
});
test('AP23D2 UX January comparison keeps legal outcome visible but technical rule IDs closed', () => {
  const comparison: JanuaryComparison = { outcome: 'different', variedCatalogRuleIds: ['SG-ZPO-ADDITIONAL-DAY-BERCHTOLD'],
    withoutJanuary2: { legallyRelevantDate: '2029-01-01', deadlineStart: '2029-01-02', provisionalEnd: '2029-01-02', finalEnd: '2029-01-02' },
    withJanuary2: { legallyRelevantDate: '2029-01-01', deadlineStart: '2029-01-02', provisionalEnd: '2029-01-02', finalEnd: '2029-01-03' } };
  const document = new JSDOM(ui.january({ comparison, locale: 'de' })).window.document;
  const technical = document.querySelector('details'); assert.ok(technical);
  assert.equal(technical.hasAttribute('open'), false);
  assert.match(technical.textContent!, /SG-ZPO-ADDITIONAL-DAY-BERCHTOLD/); technical.remove();
  assert.match(document.body.textContent!, /kein definitives Fristresultat/);
  assert.match(document.querySelector('table')!.textContent!, /02.01.2029.*03.01.2029/);
  assert.doesNotMatch(document.body.textContent!, /SG-ZPO-ADDITIONAL-DAY-BERCHTOLD/);
});
test('AP23D2 UX calendar copy remains complete in DE and FR', () => {
  assert.deepEqual(Object.keys(calendarMessages.de).sort(), Object.keys(calendarMessages.fr).sort());
  assert.equal(calendarMessages.de.representativeCanton, 'Wohnsitz / Sitz der Vertretung – Kanton');
  assert.equal(calendarMessages.fr.representativeCanton, 'Domicile / siège de la représentation – canton');
  assert.equal(calendarMessages.fr.technicalEvidence, 'Justificatifs techniques');
});
