// SPDX-License-Identifier: AGPL-3.0-only
// Immutable published MVP08 browser ZIP. Historical coverage never rebuilds today's entry.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { before, test } from 'node:test';
import { promisify } from 'node:util';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const archive = resolve('outputs/release-mvp08-2026-10-15/fristenrechner-mvp08-steimer-web.zip');
const archiveSha256 = '0abbc23d691835e5b04b64975140afb36c4bfa89482ff872c0c76188673f4176';
const archivedFiles = new Map<string, string>();
function archivedText(name: string): string {
  const value = archivedFiles.get(name.replace(/^\.\//, ''));
  assert.notEqual(value, undefined, `Missing bound historical ZIP entry ${name}`);
  return value!;
}
const exportDirectory = resolve('.work/mvp08-web-exports');
const releaseId = '2026-10-15-mvp-08-approved.1';
let manifest: any, javascript: string;
before(async () => {
  assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'), archiveSha256);
  const execute = promisify(execFile);
  const { stdout: listing } = await execute('unzip', ['-Z1', archive], { encoding: 'utf8' });
  const names = listing.trim().split('\n');
  assert.equal(new Set(names).size, names.length);
  assert.equal(names.length, 12);
  for (const name of names) {
    assert.match(name, /^[a-zA-Z0-9._/-]+$/);
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..'));
    const { stdout } = await execute('unzip', ['-p', archive, name], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
    archivedFiles.set(name, stdout);
  }
  manifest = JSON.parse(archivedText('build-manifest.json'));
  javascript = archivedText(manifest.assets.javascript);
  await mkdir(exportDirectory, { recursive: true });
});
async function page(seed?: Record<string, string>): Promise<any> {
  const dom = new JSDOM(archivedText('index.html'), {
    url: 'https://mvp08.invalid/fristenrechner/?qa=untrusted&candidate=ap23d3', pretendToBeVisual: true, runScripts: 'outside-only' });
  const { window } = dom;
  window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder; window.Blob = Blob;
  window.matchMedia = (media: string) => ({ matches: false, media, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false });
  const blobs: Blob[] = [], downloads: string[] = [];
  window.URL.createObjectURL = (blob: Blob) => { blobs.push(blob); return `blob:https://mvp08.invalid/${blobs.length}`; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
  for (const [key, value] of Object.entries(seed ?? {})) window.localStorage.setItem(key, value);
  for (const asset of [manifest.assets.vendors.react, manifest.assets.vendors.reactDom, manifest.assets.vendors.fluentUiReact])
    window.eval(archivedText(asset));
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
async function exportCalendar(p: any, label: string, date: string, nextDate: string, language: 'de'|'fr', admin = false): Promise<void> {
  input(p.window, '.fr-calendar-export input', `QA-MVP08-${label}`);
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
  assert.ok(unfolded.includes(`QA-MVP08-${label}`));
  assert.ok(unfolded.includes(language === 'de' ? 'SUMMARY:Fristablauf' : 'SUMMARY:Échéance'));
  assert.doesNotMatch(unfolded, /(?:ATTENDEE|ORGANIZER|RRULE|ATTACH):/);
  for (const line of content.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
  if (admin) { assert.ok(unfolded.includes(`releaseId: ${releaseId}`)); assert.ok(unfolded.includes('pathId: ti-80-30')); }
  await writeFile(resolve(exportDirectory, `${label}.ics`), content, 'utf8');
}
test('historical byte-bound MVP08 static entry contains the approved runtime, no QA activation and unchanged hosting bytes', async () => {
  assert.equal(manifest.version, '0.8.0'); assert.equal(manifest.dataReleaseId, releaseId);
  assert.notEqual(manifest.status, 'candidate');
  assert.ok(javascript.includes(releaseId));
  assert.doesNotMatch(javascript, /qaPresets|SYNTHETIC AMD TEST|\bfetch\s*\(|new XMLHttpRequest/);
  assert.equal(archivedText('.htaccess'), await readFile('public-app/.htaccess', 'utf8'));
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
