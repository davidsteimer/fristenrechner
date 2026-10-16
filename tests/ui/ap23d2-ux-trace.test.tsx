// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { buildSync } from 'esbuild';
import type * as Presentation from '../../src/ui/tracePresentation';
import type { CalculationData, CalculationResult, CalendarTraceEvidence } from '../../src/core/types';
import type { BoundCalendarRuntime } from '../../src/core/calendarResolution';
import type { SocialProcedureCatalog, SocialDeadlineResult } from '../../src/core/socialTypes';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
// One genuine runtime and core bundle, with no result stubs or mutated approvals.
const bundle = buildSync({ stdin: { contents: `
  import * as React from 'react';
  import {renderToStaticMarkup} from 'react-dom/server';
  import {FriendlyCalendarEvidence,LegalTraceSources} from './src/ui/tracePresentation';
  import {mvp07Runtime} from './src/release/mvp07ReleaseData';
  import {calculateCalendarBoundDeadline} from './src/core/calculateCalendarBoundDeadline';
  import {calculateSocialDeadline} from './src/core/socialDeadline';
  export * from './src/ui/tracePresentation';
  export const data=mvp07Runtime.data;
  export const calendarRuntime=mvp07Runtime.calendarRuntime;
  export const social=[...data.socialProcedureCatalogs.values()][0];
  export function zpo(){return calculateCalendarBoundDeadline({profileId:'zpo',inputDate:'2026-12-15',
    inputDateSemantics:'legallyRelevantDeliveryOrEventDate',deadlineDays:30,calendarId:'be-public-holidays',
    holidayAnchorCandidates:['BE'],confirmations:{},selectors:{procedureVariant:'ordinary'}},
    {role:'court',canton:'BE',areaFacts:{}},data,calendarRuntime);}
  export function socialResult(){
    const rule=social.federalRules.find(r=>r.law==='ahvg'&&r.action==='objection');
    const binding=social.cantonalBindings.find(b=>b.ruleId===rule.ruleId);
    const route=binding.contextRoutes[0];
    const calendar=binding.calendarBindings.find(c=>c.holidayCanton==='BE'&&c.requiredAnchorRoles.length===1&&c.requiredAnchorRoles[0]==='party');
    return calculateSocialDeadline({ruleId:rule.ruleId,bindingId:binding.bindingId,contextRouteId:route.contextRouteId,
      procedureContextCanton:'BE',caseFacts:Object.fromEntries(route.requiredFacts.map(f=>[f.factKey,f.allowedValues[0]])),
      qualificationBasis:'displayed-model-scope',matter:rule.matter,triggerKind:rule.triggerKind,
      notificationChannel:'individual-service',notificationConfirmed:false,legalTriggerDate:'2026-12-15',
      holidayResolution:{status:'resolved',calendarBindingId:calendar.calendarBindingId,
        anchors:[{role:'party',canton:'BE',spatialScopeId:calendar.spatialScopeId}]}},data);}
  export const render=(props)=>renderToStaticMarkup(React.createElement(FriendlyCalendarEvidence,props));
  export const sources=(props)=>renderToStaticMarkup(React.createElement(LegalTraceSources,props));
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false,
  external: ['react', 'react-dom/server'], logLevel: 'silent' });
const module = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0]!.text)(require, module, module.exports);
const ui = module.exports as typeof Presentation & {
  data: CalculationData; calendarRuntime: BoundCalendarRuntime; social: SocialProcedureCatalog;
  zpo(): CalculationResult; socialResult(): SocialDeadlineResult;
  render(props: Presentation.FriendlyCalendarEvidenceProps): string;
  sources(props: Parameters<typeof Presentation.LegalTraceSources>[0]): string;
};
const result = ui.zpo();
assert.equal(result.outcome, 'calculated');
const step = result.trace.find(value => value.operation === 'applySuspension')!;
assert.ok(step?.calendarEvidence);
const evidence = step.calendarEvidence;
const sourceEvidence = ui.profileTraceSources(ui.data.profiles.get('zpo'), step.ruleIds);
function markup(props: Partial<Presentation.FriendlyCalendarEvidenceProps> = {}): string {
  return ui.render({ evidence, data: ui.data, calendars: ui.calendarRuntime.calendars, locale: 'de',
    range: { from: '2026-12-15', to: '2027-02-28' }, resultIds: step.periodIds, legalSources: sourceEvidence, ...props });
}
function visibleText(html: string): string {
  const document = new JSDOM(html).window.document;
  document.querySelectorAll('details:not([open])').forEach((node: Element) => node.remove());
  return document.body.textContent ?? '';
}

test('AP23D2 UX ZPO trace binds the actual profile norm, not all shared generator sources', () => {
  assert.equal(sourceEvidence.unresolved, false);
  assert.deepEqual(sourceEvidence.refs, [{ sourceId: 'SRC-ZPO-20260701', locator: 'Art. 145 Abs. 1' }]);
  const visible = visibleText(markup());
  assert.match(visible, /Gerichtsferien über den Jahreswechsel/);
  assert.match(visible, /18\.12\.2026–02\.01\.2027/);
  assert.match(visible, /Zivilprozessordnung.*Art\. 145 Abs\. 1/);
  assert.doesNotMatch(visible, /CH-CAL-|SRC-|BGG|VwVG|YEAR-END|Datenstand/);
});

test('AP23D2 UX retains full shared calendar provenance in closed technical details', () => {
  const document = new JSDOM(markup()).window.document;
  const details = document.querySelector('details.fr-trace__technical');
  assert.ok(details);
  assert.equal(details.hasAttribute('open'), false);
  for (const application of evidence.applications) {
    assert.ok(details.textContent.includes(application.ruleId));
    assert.ok(details.textContent.includes(application.calendarId));
    assert.ok(details.textContent.includes(application.operation));
    for (const ref of application.sourceRefs) {
      assert.ok(details.textContent.includes(ref.sourceId));
      assert.ok(details.textContent.includes(ref.locator));
    }
    for (const id of [...application.generatedIds, ...application.removedIds]) assert.ok(details.textContent.includes(id));
  }
  assert.ok(details.textContent.includes(evidence.releaseId));
  assert.ok(details.textContent.includes(evidence.calendarId));
  assert.equal(document.querySelector('.fr-trace__legal a')?.getAttribute('href'), 'https://www.fedlex.admin.ch/eli/cc/2010/262/de');
});

test('AP23D2 UX French labels and precise selected periods are displayed without IDs', () => {
  const html = markup({ locale: 'fr' });
  assert.match(visibleText(html), /Féries judiciaires de fin d’année|Féries judiciaires de fin d'année/);
  assert.match(html, /Justificatifs techniques/);
  assert.match(visibleText(html), /Base légale/);
  assert.doesNotMatch(visibleText(html), /Gerichtsferien|CH-CAL-|SRC-|18\.12\.2025|18\.12\.2027/);
});

test('AP23D2 UX exact source lookup fails neutral for unknown, ambiguous or unbound sources', () => {
  assert.equal(ui.profileTraceSources(undefined, step.ruleIds).unresolved, true);
  const noRule = ui.profileTraceSources(ui.data.profiles.get('zpo'), ['ZPO-IMAGINARY-SUSPENSION']);
  assert.equal(noRule.links.length, 0);
  const noSource = ui.catalogTraceSources({ sources: [{ sourceId: 'SRC-ZPO-SIMILAR', title: 'Wrong', url: 'https://example.invalid/' }] }, sourceEvidence.refs);
  assert.equal(noSource.links.length, 0);
  assert.equal(noSource.unresolved, true);
  const duplicate = ui.catalogTraceSources({ sources: [
    { sourceId: 'exact', title: 'A', url: 'https://example.invalid/a' },
    { sourceId: 'exact', title: 'B', url: 'https://example.invalid/b' }
  ] }, [{ sourceId: 'exact', locator: 'Art. 1' }]);
  assert.equal(duplicate.links.length, 0);
  assert.match(ui.sources({ evidence: noSource, locale: 'de' }), /genaue Quellenzuordnung/);
  assert.doesNotMatch(ui.sources({ evidence: noSource, locale: 'de' }), /SRC-ZPO|Wrong|href/);
});

test('AP23D2 UX malformed or unsafe URLs are not clickable and labels remain escaped', () => {
  const context = ui.catalogTraceSources({ sources: [{ sourceId: 'x', title: '<script>do not run</script>', url: 'javascript:alert(1)' }] }, [{ sourceId: 'x', locator: 'Art. <1>' }]);
  const html = ui.sources({ evidence: context, locale: 'de' });
  assert.doesNotMatch(html, /href=|<script>/);
  assert.match(html, /&lt;script&gt;/);
  const credentialed = ui.catalogTraceSources({ sources: [{ sourceId: 'x', title: 'A', url: 'https://user:secret@example.invalid/' }] }, [{ sourceId: 'x', locator: 'Art. 1' }]);
  assert.equal(credentialed.links[0]!.url, undefined);
});

test('AP23D2 UX no label or date is invented for an unmatched calendar identity or release', () => {
  const alien: CalendarTraceEvidence = { ...evidence, releaseId: 'not-the-active-release' };
  const html = markup({ evidence: alien });
  assert.match(visibleText(html), /Berücksichtigter Kalendereintrag/);
  assert.doesNotMatch(visibleText(html), /Gerichtsferien|18\.12\.2026/);
  const mismatch = { ...evidence, applications: evidence.applications.map(application => ({ ...application, calendarId: 'wrong-calendar' })) };
  assert.deepEqual(ui.calendarApplicationLabels(mismatch, ui.data, 'de'), ['Berücksichtigter Kalendereintrag']);
});

test('AP23D2 UX actual social calculation uses the bound ATSG source despite shared federal calendar ancestry', () => {
  const social = ui.socialResult();
  assert.equal(social.outcome, 'calculated');
  const suspensionStep = social.trace.find(value => value.operation === 'applySuspension');
  assert.ok(suspensionStep?.calendarEvidence);
  const suspension = ui.social.suspensionProfiles.find(value => value.suspensionProfileId === 'S_ATSG')!;
  const sources = ui.catalogTraceSources(ui.social, suspension.sourceRefs);
  assert.equal(sources.unresolved, false);
  const html = markup({ evidence: suspensionStep.calendarEvidence, legalSources: sources, resultIds: undefined });
  assert.match(visibleText(html), /ATSG|Allgemeiner Teil des Sozialversicherungsrechts/);
  assert.match(visibleText(html), /Art\. 38 Abs\. 4/);
  assert.doesNotMatch(visibleText(html), /Zivilprozessordnung|Art\. 145|Art\. 46|Art\. 22a|SRC-|CH-CAL-/);
  const document = new JSDOM(html).window.document;
  assert.match(document.querySelector('details')!.textContent!, /SRC-ZPO-20260701/);
});

test('AP23D2 UX does not change calculation data or the original evidence object', () => {
  const before = JSON.stringify({ evidence, sourceEvidence, profiles: [...ui.data.profiles.values()] });
  markup(); markup({ locale: 'fr' });
  assert.equal(JSON.stringify({ evidence, sourceEvidence, profiles: [...ui.data.profiles.values()] }), before);
  assert.deepEqual(ui.zpo(), result);
});

test('AP23D2 UX reason text translates known diagnostics and actual calendar label keys', () => {
  const holiday = ui.calendarRuntime.calendars.flatMap(set => set.rules).find(rule => rule.effect.type === 'holiday')!;
  assert.ok(holiday);
  for (const locale of ['de', 'fr'] as const) {
    const labels = ui.traceReasonLabels(['saturday', holiday.labelKey, 'skipped16CalendarDays'], locale, ui.data, ui.calendarRuntime.calendars);
    assert.equal(labels[0], locale === 'de' ? 'Samstag' : 'Samedi');
    assert.ok(labels.includes(holiday.labels[locale]));
    assert.ok(labels.some(label => label.includes('16') && !label.includes('skipped')));
    assert.doesNotMatch(labels.join(' · '), /SRC-|CH-CAL-|CalendarDays|holiday\./);
  }
  assert.deepEqual(ui.traceReasonLabels(['skipped1CalendarDays'], 'de', ui.data), ['1 Kalendertag im Friststillstand']);
  assert.deepEqual(ui.traceReasonLabels(['skipped1CalendarDays'], 'fr', ui.data), ['1 jour calendaire non compté pendant la suspension']);
});

test('AP23D2 UX unresolved or ambiguous reason codes never leak into the readable trace', () => {
  const unknown = ['YEAR-END-2099', 'SRC-ZPO-IMAGINARY', 'skippedNaNCalendarDays', 'skipped9007199254740992CalendarDays'];
  const labels = ui.traceReasonLabels(unknown, 'de', ui.data);
  assert.deepEqual(labels, ['Weitere Einzelheiten siehe technische Nachweise.']);
  assert.equal(unknown.length, 4);
  const first = ui.calendarRuntime.calendars.find(set => set.rules.length)!;
  const rule = first.rules[0]!;
  const conflicting = { ...first, rules: [{ ...rule, labels: { de: 'Widerspruch', fr: 'Contradiction' } }] };
  assert.deepEqual(ui.traceReasonLabels([rule.labelKey], 'de', ui.data, [first, conflicting]), ['Weitere Einzelheiten siehe technische Nachweise.']);
});
