// SPDX-License-Identifier: AGPL-3.0-only
// Actual minified normal-entry browser assets, not a test re-bundle.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { before, test } from 'node:test';
import { promisify } from 'node:util';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const output = resolve('.work/public-app');
const exportDirectory = resolve('.work/mvp09-web-exports');
const releaseId = '2026-10-18-mvp-09-approved.1';
let manifest: any, javascript: string;
before(async () => {
  await promisify(execFile)(process.execPath, ['scripts/build-public-app.mjs'], {
    cwd: process.cwd(), env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: '' }, maxBuffer: 8 * 1024 * 1024 });
  manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
  javascript = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
  await mkdir(exportDirectory, { recursive: true });
});
async function page(seed?: Record<string, string>): Promise<any> {
  const dom = new JSDOM(await readFile(resolve(output, 'index.html'), 'utf8'), {
    url: 'https://mvp09.invalid/fristenrechner/?qa=untrusted&candidate=ap23d3', pretendToBeVisual: true, runScripts: 'outside-only' });
  const { window } = dom;
  window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder; window.Blob = Blob;
  window.matchMedia = (media: string) => ({ matches: false, media, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false });
  const blobs: Blob[] = [], downloads: string[] = [];
  window.URL.createObjectURL = (blob: Blob) => { blobs.push(blob); return `blob:https://mvp09.invalid/${blobs.length}`; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
  for (const [key, value] of Object.entries(seed ?? {})) window.localStorage.setItem(key, value);
  for (const asset of [manifest.assets.vendors.react, manifest.assets.vendors.reactDom, manifest.assets.vendors.fluentUiReact])
    window.eval(await readFile(resolve(output, asset), 'utf8'));
  window.eval(javascript);
  // Fluent UI MessageBar and dropdown labels complete their mount on animation frames.
  await new Promise(resolve => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
  return { dom, window, blobs, downloads };
}
function fieldName(document: Document, element: Element): string {
  return element.getAttribute('aria-label') || (element.getAttribute('aria-labelledby') ?? '').split(' ')
    .map(id => document.getElementById(id)?.textContent ?? '').join(' ');
}
async function choose(window: any, label: RegExp, option: RegExp): Promise<void> {
  const document = window.document as Document;
  const field = Array.from(document.querySelectorAll('[role="combobox"]')).find(el => label.test(fieldName(document, el)));
  assert.ok(field, `Missing dropdown ${label}`);
  field.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise(resolve => window.setTimeout(resolve, 20));
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = options.find(el => option.test(el.textContent ?? ''));
  assert.ok(selected, `Missing ${option}: ${options.map(el => el.textContent)}`);
  selected.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise(resolve => window.setTimeout(resolve, 20));
}
function input(window: any, selector: string, value: string): void {
  const field = window.document.querySelector(selector); assert.ok(field, selector);
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(field, value);
  field.dispatchEvent(new window.Event('input', { bubbles: true }));
  field.dispatchEvent(new window.Event('change', { bubbles: true }));
}
function submit(window: any): void {
  window.document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}
async function ti(window: any): Promise<void> {
  await choose(window, /Sitz der zuständigen Stelle/, /^Tessin/);
  await choose(window, /Verfahrensrecht/, /^LPAmm/);
  await choose(window, /Verfahrensstadium/, /^Verwaltungsbeschwerde/);
  await choose(window, /Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
  await choose(window, /Fallkonstellation/, /^Allgemeines kantonales/);
}
async function exportCalendar(p: any, label: string, date: string, nextDate: string, language: 'de'|'fr', admin: boolean | string = false): Promise<void> {
  input(p.window, '.fr-calendar-export input', `QA-MVP09-${label}`);
  const button = p.window.document.querySelector('.fr-calendar-export__button'); assert.ok(button);
  button.dispatchEvent(new p.window.MouseEvent('click', { bubbles: true }));
  assert.equal(p.blobs.length, 1); assert.equal(p.downloads.length, 1);
  const content = await p.blobs[0].text(); const unfolded = content.replace(/\r\n /g, '');
  assert.match(content, /^BEGIN:VCALENDAR\r\n/);
  assert.ok(unfolded.includes(`DTSTART;VALUE=DATE:${date}`));
  assert.ok(unfolded.includes(`DTEND;VALUE=DATE:${nextDate}`));
  assert.ok(unfolded.includes('TRANSP:TRANSPARENT'));
  assert.ok(unfolded.includes('CATEGORIES:Fristablauf'));
  assert.ok(unfolded.includes('TRIGGER:-PT112H'));
  assert.ok(unfolded.includes(`QA-MVP09-${label}`));
  assert.ok(unfolded.includes(language === 'de' ? 'SUMMARY:Fristablauf' : 'SUMMARY:Échéance'));
  assert.doesNotMatch(unfolded, /(?:ATTENDEE|ORGANIZER|RRULE|ATTACH):/);
  for (const line of content.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
  if (admin) {
    assert.ok(unfolded.includes(`releaseId: ${releaseId}`));
    assert.ok(unfolded.includes(`pathId: ${typeof admin === 'string' ? admin : 'ti-80-30'}`));
  }
  await writeFile(resolve(exportDirectory, `${label}.ics`), content, 'utf8');
}
test('MVP09 normal static entry contains the approved runtime, no QA activation and unchanged hosting bytes', async () => {
  assert.equal(manifest.version, '0.9.0'); assert.equal(manifest.dataReleaseId, releaseId);
  assert.notEqual(manifest.status, 'candidate');
  assert.ok(javascript.includes(releaseId));
  assert.doesNotMatch(javascript, /qaPresets|SYNTHETIC AMD TEST|\bfetch\s*\(|new XMLHttpRequest/);
  assert.equal(await readFile(resolve(output, '.htaccess'), 'utf8'), await readFile('public-app/.htaccess', 'utf8'));
});
test('actual static DE StPO export and immediate invalidation on input change', async () => {
  const p = await page();
  try {
    const w = p.window;
    assert.equal(w.document.querySelector('input[name="inputDate"]').value, '');
    await choose(w, /Sitz der zuständigen Stelle/, /^Bern/);
    await choose(w, /Verfahrensrecht/, /^Strafprozessordnung/);
    await choose(w, /Zustellung an/, /^Partei ohne Vertretung/);
    await choose(w, /Wohnsitz \/ Sitz der Partei/, /^Bern/);
    input(w, 'input[name="inputDate"]', '16.09.2026'); input(w, 'input[type="number"]', '10'); submit(w);
    assert.match(w.document.querySelector('.fr-result-region').textContent, /28\.09\.2026/);
    await exportCalendar(p, 'WEB-DE-STPO', '20260928', '20260929', 'de');
    input(w, 'input[name="inputDate"]', '17.09.2026');
    assert.equal(w.document.querySelector('.fr-calendar-export'), null);
  } finally { p.dom.window.close(); }
});
for (const language of ['de', 'fr'] as const) test(`actual static TI ${language} export with bound provenance and TI-O2 block`, async () => {
  const p = await page();
  try {
    const w = p.window; await ti(w);
    input(w, 'input[name="inputDate"]', '02.10.2026');
    if (language === 'fr') await choose(w, /Sprache/, /^Français/);
    submit(w);
    assert.match(w.document.querySelector('.fr-result-region').textContent, /02\.11\.2026/);
    assert.equal(w.document.querySelectorAll('.fr-form__grid').length, 1);
    await exportCalendar(p, `WEB-${language.toUpperCase()}-TI`, '20261102', '20261103', language, true);
    input(w, 'input[name="inputDate"]', '17.02.2027'); submit(w);
    assert.equal(w.document.querySelector('.fr-calendar-export'), null);
    assert.equal(w.document.querySelector('.fr-result__hero'), null);
  } finally { p.dom.window.close(); }
});
test('actual static bundle protects corrupt and future v5 preferences without replacing stored bytes', async () => {
  for (const original of ['broken-json', '{"version":6,"future":"keep me"}']) {
    const p = await page({ 'fristenrechner.defaults.v5': original });
    try {
      assert.equal(p.window.localStorage.getItem('fristenrechner.defaults.v5'), original);
      assert.match(p.window.document.body.textContent, /unverändert geschützt/);
      assert.equal(p.window.document.querySelector('.fr-calendar-export'), null);
    } finally { p.dom.window.close(); }
  }
});

const newCases = [
  {canton: /^Luzern/, law: /^VRG LU/, action: /^Ordentliche Verwaltungsbeschwerde/,
    qualification: /^Endentscheid/, pathId: 'lu-admin-30', input: '02.10.2026',
    final: /02\.11\.2026/, date: '20261102', next: '20261103', days: '30 Tage'},
  {canton: /^Zug/, law: /^VRG ZG/, action: /^Ordentliche Verwaltungsbeschwerde/,
    qualification: /^Endentscheid/, pathId: 'zg-admin-20', input: '16.10.2026',
    final: /05\.11\.2026/, date: '20261105', next: '20261106', days: '20 Tage'},
  {canton: /^Appenzell Ausserrhoden/, law: /^VRPG AR/, action: /^Rekurs gegen eine Vollstreckungsverfügung/,
    qualification: /^Nichtgeldvollstreckung/, pathId: 'ar-execution-5', input: '16.09.2026',
    final: /21\.09\.2026/, date: '20260921', next: '20260922', days: '5 Tage'}
];
for (const scenario of newCases) for (const locale of ['de', 'fr'] as const) {
  test(`actual normal MVP09 static bundle qualifies ${scenario.pathId}, exports ${locale} and clears changed facts`, async () => {
    const p = await page();
    try {
      const w = p.window;
      const date = w.document.querySelector('input[name="inputDate"]');
      assert.equal(date.disabled, false);
      input(w, 'input[name="inputDate"]', scenario.input);
      await choose(w, /Sitz der zuständigen Stelle/, scenario.canton);
      await choose(w, /Verfahrensrecht/, scenario.law);
      await choose(w, /Verfahrensstadium/, /^Verwaltungsbeschwerde/);
      await choose(w, /Verfahrenshandlung/, scenario.action);
      submit(w);
      assert.equal(w.document.querySelector('.fr-result__hero'), null);
      assert.equal(w.document.querySelector('.fr-calendar-export'), null);
      assert.match(w.document.querySelector('.fr-result-region').textContent, /aktuelle Fallkonstellation/);
      await choose(w, /Fallkonstellation/, scenario.qualification);
      submit(w);
      assert.match(w.document.querySelector('.fr-result__hero').textContent, scenario.final);
      assert.equal(w.document.querySelector('input[readonly]').value, scenario.days);
      assert.equal(w.document.querySelectorAll('.fr-form__grid').length, 1);
      assert.doesNotMatch(w.document.body.textContent, /Fristauslösendes Dokument|Massgeblicher Feiertagskanton/);
      assert.match(w.document.querySelector('.fr-data-status').textContent, /2026-10-18-mvp-09-approved\.1/);
      if (locale === 'fr') await choose(w, /Sprache/, /^Français/);
      await exportCalendar(p, `WEB-${scenario.pathId}-${locale}`, scenario.date, scenario.next, locale, scenario.pathId);
      input(w, 'input[name="inputDate"]', '03.10.2026');
      assert.equal(w.document.querySelector('.fr-calendar-export'), null);
    } finally { p.dom.window.close(); }
  });
}
test('actual normal MVP09 static AR-O1 blocks the shifted end without definitive result or export', async () => {
  const p = await page();
  try {
    const w = p.window;
    await choose(w, /Sitz der zuständigen Stelle/, /^Appenzell Ausserrhoden/);
    await choose(w, /Verfahrensrecht/, /^VRPG AR/);
    await choose(w, /Verfahrensstadium/, /^Gerichtsverfahren/);
    await choose(w, /Verfahrenshandlung/, /^Ordentliche Beschwerde an das Gericht/);
    await choose(w, /Fallkonstellation/, /^Endentscheid/);
    input(w, 'input[name="inputDate"]', '18.02.2027');
    submit(w);
    assert.match(w.document.querySelector('.fr-result-region').textContent, /Grenzfall in Appenzell Ausserrhoden ist gesperrt/);
    assert.equal(w.document.querySelector('.fr-result__hero'), null);
    assert.equal(w.document.querySelector('.fr-calendar-export'), null);
  } finally { p.dom.window.close(); }
});
