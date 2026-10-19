// SPDX-License-Identifier: AGPL-3.0-only
// The browser assets below are the actual minified output, not a test re-bundle.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { before, test } from 'node:test';
import { promisify } from 'node:util';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const exec = promisify(execFile);
const output = resolve('.work/public-ap23d3');
const manifestPath = 'outputs/ap23d2-candidate-2026-10-15/bundle/manifest.json';
const digest = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
let manifestHash: string;
let manifest: any;
let javascript: string;
before(async () => {
  manifestHash = digest(await readFile(manifestPath));
  await exec(process.execPath, [resolve('scripts/build-public-app.mjs')], { cwd: process.cwd(),
    env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: 'ap23d3' }, maxBuffer: 8 * 1024 * 1024 });
  manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
  javascript = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
});

async function loadActualStaticPage(): Promise<any> {
  const dom = new JSDOM(await readFile(resolve(output, 'index.html'), 'utf8'), {
    url: 'https://ap23d3.invalid/fristenrechner/?candidate=untrusted',
    pretendToBeVisual: true, runScripts: 'outside-only'
  });
  const { window } = dom;
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  window.matchMedia = (query: string) => ({ matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false });
  for (const asset of [manifest.assets.vendors.react, manifest.assets.vendors.reactDom,
    manifest.assets.vendors.fluentUiReact]) window.eval(await readFile(resolve(output, asset), 'utf8'));
  window.eval(javascript);
  return dom;
}
function name(document: Document, element: Element): string {
  return element.getAttribute('aria-label') || (element.getAttribute('aria-labelledby') ?? '').split(' ')
    .map(id => document.getElementById(id)?.textContent ?? '').join(' ');
}
async function choose(window: any, label: RegExp, option: RegExp): Promise<void> {
  const document = window.document as Document;
  const select = Array.from(document.querySelectorAll('[role="combobox"]')).find(el => label.test(name(document, el)));
  assert.ok(select, `Missing dropdown ${label}`);
  select.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise(resolve => window.setTimeout(resolve, 25));
  const options = Array.from(document.querySelectorAll('[role="option"]'));
  const selected = options.find(el => option.test(el.textContent ?? ''));
  assert.ok(selected, `Missing option ${option}: ${options.map(el => el.textContent)}`);
  selected.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await new Promise(resolve => window.setTimeout(resolve, 25));
}
function input(window: any, name: string, value: string): void {
  const field = window.document.querySelector(name === 'deadlineDays' ? 'input[type="number"]' : `input[name="${name}"]`);
  assert.ok(field, `Missing input ${name}`);
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(field, value);
  field.dispatchEvent(new window.Event('input', { bubbles: true }));
  field.dispatchEvent(new window.Event('change', { bubbles: true }));
}
function submit(window: any): void {
  window.document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
}

test('AP23D3 builds separately with the unchanged accepted Format-8 source and no deployment claim', async () => {
  assert.equal(manifest.version, 'ap23d3-local-candidate');
  assert.equal(manifest.dataReleaseId, '2026-10-15-ap23d2-reference.1');
  assert.equal(manifest.status, 'candidate');
  assert.equal(manifest.deployable, false);
  assert.equal(digest(await readFile(manifestPath)), manifestHash);
  for (const token of ['AP23D3', '2026-10-15-ap23d2-reference.1', 'administrativeProcedureCatalog', 'ti-80-30', 'gr-52-30']) {
    assert.ok(javascript.includes(token), `Missing actual bundle token ${token}`);
  }
  assert.doesNotMatch(javascript, /qaPresets|SYNTHETIC TEST|\bfetch\s*\(|new XMLHttpRequest|new WebSocket/);
  assert.ok(!(await readdir(output, { recursive: true })).some(path => path.endsWith('.map')));
  assert.equal(await readFile(resolve(output, '.htaccess'), 'utf8'), await readFile('public-app/.htaccess', 'utf8'));
});

test('AP23D3 actual minified browser bundle calculates the legacy StPO branch from the same Format-8 release without export', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^Bern/);
    await choose(window, /Verfahrensrecht/, /^Strafprozessordnung/);
    await choose(window, /Zustellung an/, /^Partei ohne Vertretung/);
    await choose(window, /Wohnsitz \/ Sitz der Partei/, /^Bern/);
    input(window, 'inputDate', '16.09.2026');
    input(window, 'deadlineDays', '10');
    submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /28\.09\.2026/);
    assert.match(window.document.querySelector('.fr-data-status')!.textContent, /2026-10-15-ap23d2-reference\.1/);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    assert.equal(window.document.querySelectorAll('.fr-form__grid').length, 1);
  } finally { dom.window.close(); }
});

test('AP23D3 actual minified browser bundle calculates TI and preserves the TI12 block without export', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^Tessin/);
    await choose(window, /Verfahrensrecht/, /^LPAmm/);
    await choose(window, /Verfahrensstadium/, /^Verwaltungsbeschwerde/);
    await choose(window, /Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
    await choose(window, /Fallkonstellation/, /^Allgemeines kantonales/);
    input(window, 'inputDate', '02.10.2026'); submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /02\.11\.2026/);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    input(window, 'inputDate', '17.02.2027'); submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /Tessiner Grenzfall ist gesperrt/);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
  } finally { dom.window.close(); }
});

test('AP23D3 keeps approved entries, default pin and existing package version untouched', async () => {
  assert.match(await readFile('src/public-app/main.tsx', 'utf8'), /mvp09Runtime/);
  assert.match(await readFile('spfx/src/core/config.ts', 'utf8'), /[a-f0-9]{40}\/data\/releases\/2026-10-18-mvp-09-approved\.1/);
  const solution = JSON.parse(await readFile('spfx/config/package-solution.json', 'utf8'));
  assert.equal(solution.solution.version, '0.9.0.0');
  assert.doesNotMatch(await readFile('src/public-app/ap23d3-main.tsx', 'utf8'), /URLSearchParams|window\.location/);
});
