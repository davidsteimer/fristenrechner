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
const output = resolve('.work/public-ap23h3');
const manifestPath = 'data/candidates/2026-10-22-ap23h3/manifest.json';
const digest = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
let manifestHash: string;
let manifest: any;
let javascript: string;
before(async () => {
  manifestHash = digest(await readFile(manifestPath));
  await exec(process.execPath, [resolve('scripts/build-public-app.mjs')], { cwd: process.cwd(),
    env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: 'ap23h3' }, maxBuffer: 8 * 1024 * 1024 });
  manifest = JSON.parse(await readFile(resolve(output, 'build-manifest.json'), 'utf8'));
  javascript = await readFile(resolve(output, manifest.assets.javascript), 'utf8');
});

async function loadActualStaticPage(): Promise<any> {
  const dom = new JSDOM(await readFile(resolve(output, 'index.html'), 'utf8'), {
    url: 'https://ap23h3.invalid/fristenrechner/?candidate=untrusted',
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

test('AP23H3 builds separately with the bound Format-12 candidate and no deployment claim', async () => {
  assert.equal(manifest.version, 'ap23h3-local-candidate');
  assert.equal(manifest.dataReleaseId, '2026-10-22-ap23h3-candidate.1');
  assert.equal(manifest.status, 'candidate');
  assert.equal(manifest.deployable, false);
  assert.equal(digest(await readFile(manifestPath)), manifestHash);
  for (const token of ['AP23H3', '2026-10-22-ap23h3-candidate.1', 'administrativeProcedureCatalog', 'ti-80-30', 'gr-52-30']) {
    assert.ok(javascript.includes(token), `Missing actual bundle token ${token}`);
  }
  assert.doesNotMatch(javascript, /qaPresets|SYNTHETIC TEST|\bfetch\s*\(|new XMLHttpRequest|new WebSocket/);
  assert.ok(!(await readdir(output, { recursive: true })).some(path => path.endsWith('.map')));
  assert.equal(await readFile(resolve(output, '.htaccess'), 'utf8'), await readFile('public-app/.htaccess', 'utf8'));
});

test('AP23H3 actual minified browser bundle calculates the legacy StPO branch from the same Format-12 candidate without export', async () => {
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
    assert.match(window.document.querySelector('.fr-data-status')!.textContent, /2026-10-22-ap23h3-candidate\.1/);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    assert.equal(window.document.querySelectorAll('.fr-form__grid').length, 1);
  } finally { dom.window.close(); }
});

test('AP23H3 actual minified browser bundle calculates TI and preserves the TI12 block without export', async () => {
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

test('AP23H3 actual minified browser bundle qualifies LU only after the current case choice and preserves early date entry', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    const dateField = window.document.querySelector('input[name="inputDate"]');
    assert.ok(dateField);
    assert.equal(dateField.disabled, false);
    input(window, 'inputDate', '02.10.2026');
    await choose(window, /Sitz der zuständigen Stelle/, /^Luzern/);
    await choose(window, /Verfahrensrecht/, /^VRG LU/);
    await choose(window, /Verfahrensstadium/, /^Verwaltungsbeschwerde/);
    await choose(window, /Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
    submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /aktuelle Fallkonstellation/);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    await choose(window, /Fallkonstellation/, /^Endentscheid/);
    submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent, /02\.11\.2026/);
    assert.equal(window.document.querySelectorAll('.fr-form__grid').length, 1);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    assert.doesNotMatch(window.document.body.textContent, /Fristauslösendes Dokument|Massgeblicher Feiertagskanton/);
  } finally { dom.window.close(); }
});

test('AP23H3 actual minified browser bundle calculates the qualified Zug 20-day administrative appeal without export', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^Zug/);
    await choose(window, /Verfahrensrecht/, /^VRG ZG/);
    await choose(window, /Verfahrensstadium/, /^Verwaltungsbeschwerde/);
    await choose(window, /Verfahrenshandlung/, /^Ordentliche Verwaltungsbeschwerde/);
    await choose(window, /Fallkonstellation/, /^Endentscheid/);
    input(window, 'inputDate', '16.10.2026');
    submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent, /05\.11\.2026/);
    assert.equal(window.document.querySelector('input[readonly]').value, '20 Tage');
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    assert.match(window.document.querySelector('.fr-data-status')!.textContent, /2026-10-22-ap23h3-candidate\.1/);
  } finally { dom.window.close(); }
});

test('AP23H3 actual minified browser bundle calculates AR five-day execution and blocks AR-O1 after fresh court qualification', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^Appenzell Ausserrhoden/);
    await choose(window, /Verfahrensrecht/, /^VRPG AR/);
    await choose(window, /Verfahrensstadium/, /^Verwaltungsbeschwerde/);
    await choose(window, /Verfahrenshandlung/, /^Rekurs gegen eine Vollstreckungsverfügung/);
    await choose(window, /Fallkonstellation/, /^Nichtgeldvollstreckung/);
    input(window, 'inputDate', '16.09.2026');
    submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent, /21\.09\.2026/);
    assert.equal(window.document.querySelector('input[readonly]').value, '5 Tage');
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    await choose(window, /Verfahrensstadium/, /^Gerichtsverfahren/);
    await choose(window, /Verfahrenshandlung/, /^Ordentliche Beschwerde an das Gericht/);
    input(window, 'inputDate', '18.02.2027');
    submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /aktuelle Fallkonstellation/);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    await choose(window, /Fallkonstellation/, /^Endentscheid/);
    submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /Grenzfall in Appenzell Ausserrhoden ist gesperrt/);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
  } finally { dom.window.close(); }
});

test('AP23H3 actual minified bundle calculates the qualified AG execution case with court suspension', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^Aargau/);
    await choose(window, /Verfahrensrecht/, /^VRPG AG/);
    await choose(window, /Verfahrensstadium/, /^Gerichtsverfahren/);
    await choose(window, /Verfahrenshandlung/, /^Beschwerde gegen den Vollstreckungsteil/);
    input(window, 'inputDate', '10.07.2027'); submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    await choose(window, /Fallkonstellation/, /^Vollstreckungsteil/); submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent, /23\.08\.2027/);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
  } finally { dom.window.close(); }
});

test('AP23H3 actual minified bundle distinguishes SG document access and interim measures without redundant document inputs', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^St\. Gallen/);
    await choose(window, /Verfahrensrecht/, /^VRP SG/);
    await choose(window, /Verfahrensstadium/, /^Gerichtsverfahren/);
    await choose(window, /Verfahrenshandlung/, /^Rekurs über Dokumentenzugang/);
    await choose(window, /Fallkonstellation/, /^Formelle Departementsverfügung/);
    input(window, 'inputDate', '10.07.2027'); submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent, /25\.08\.2027/);
    await choose(window, /Verfahrenshandlung/, /^Beschwerde gegen vorsorgliche Massnahme/); submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    await choose(window, /Fallkonstellation/, /^Vorsorgliche Massnahme nach Art\. 60/); submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent, /15\.07\.2027/);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
    assert.doesNotMatch(window.document.body.textContent, /Fristauslösendes Dokument|Massgeblicher Feiertagskanton/);
  } finally { dom.window.close(); }
});

test('AP23H3 actual minified bundle blocks the qualified ZH F1-O1 collision', async () => {
  const dom = await loadActualStaticPage();
  try {
    const { window } = dom;
    await choose(window, /Sitz der zuständigen Stelle/, /^Zürich/);
    await choose(window, /Verfahrensrecht/, /^VRG ZH/);
    await choose(window, /Verfahrensstadium/, /^Gerichtsverfahren/);
    await choose(window, /Verfahrenshandlung/, /^Ordentliche Beschwerde/);
    await choose(window, /Fallkonstellation/, /^Endentscheid/);
    input(window, 'inputDate', '18.02.2027'); submit(window);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent, /Endverschiebung führt in einen neu beginnenden Friststillstand/);
    assert.equal(window.document.querySelector('.fr-result__hero'), null);
    assert.equal(window.document.querySelector('.fr-calendar-export'), null);
  } finally { dom.window.close(); }
});

test('AP23H3 keeps approved entries, default pin and existing package version untouched', async () => {
  assert.match(await readFile('src/public-app/main.tsx', 'utf8'), /mvp10Runtime/);
  assert.match(await readFile('spfx/src/core/config.ts', 'utf8'), /[a-f0-9]{40}\/data\/releases\/2026-10-28-mvp-010-approved\.1/);
  const solution = JSON.parse(await readFile('spfx/config/package-solution.json', 'utf8'));
  assert.equal(solution.solution.version, '0.10.0.0');
  assert.doesNotMatch(await readFile('src/public-app/ap23h3-main.tsx', 'utf8'), /URLSearchParams|window\.location/);
});

test('AP23H3 actual bundle distinguishes original and timely-requested reasoned UR openings without extra fields',async()=>{
  const dom=await loadActualStaticPage();try{
    const{window}=dom;
    await choose(window,/Sitz der zuständigen Stelle/,/^Uri/);
    await choose(window,/Verfahrensrecht/,/^VRPV UR/);
    await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren/);
    await choose(window,/Verfahrenshandlung/,/^Ordentliche Verwaltungsbeschwerde/);
    input(window,'inputDate','23.12.2026');submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null);
    const before=window.document.querySelectorAll('[role="combobox"]').length;
    await choose(window,/Fallkonstellation/,/^Ursprünglich begründeter Entscheid/);submit(window);
    await new Promise(resolve=>window.setTimeout(resolve,100));
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/12\.01\.2027/);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent,/Art\. 22 VRPV UR/);
    await choose(window,/Fallkonstellation/,/^Vollständige spätere Begründung nach nachweislich rechtzeitigem/);submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/12\.01\.2027/);
    assert.equal(window.document.querySelectorAll('[role="combobox"]').length,before);
    assert.equal(window.document.querySelector('.fr-calendar-export'),null);
    assert.doesNotMatch(window.document.body.textContent,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton/);
  }finally{dom.window.close();}
});

test('AP23H3 actual bundle calculates offered SO reasons as an independent ten-day action',async()=>{
  const dom=await loadActualStaticPage();try{
    const{window}=dom;
    await choose(window,/Sitz der zuständigen Stelle/,/^Solothurn/);
    await choose(window,/Verfahrensrecht/,/^VRG SO/);
    await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren/);
    await choose(window,/Verfahrenshandlung/,/^Angebotene Begründung/);
    await choose(window,/Fallkonstellation/,/^Unbegründete Verfügung mit ausdrücklichem/);
    input(window,'inputDate','02.10.2026');submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/12\.10\.2026/);
    assert.equal(window.document.querySelector('input[readonly]').value,'10 Tage');
    assert.equal(window.document.querySelector('.fr-calendar-export'),null);
  }finally{dom.window.close();}
});

test('AP23H3 actual bundle requires new SH court-reasons qualification and blocks the collision',async()=>{
  const dom=await loadActualStaticPage();try{
    const{window}=dom;
    await choose(window,/Sitz der zuständigen Stelle/,/^Schaffhausen/);
    await choose(window,/Verfahrensrecht/,/^VRG SH/);
    await choose(window,/Verfahrensstadium/,/^Gerichtsverfahren/);
    await choose(window,/Verfahrenshandlung/,/^Begründung beim selben Obergericht/);
    await choose(window,/Fallkonstellation/,/^Dispositiv oder massgebende mündliche Eröffnung/);
    input(window,'inputDate','02.10.2026');submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/02\.11\.2026/);
    assert.equal(window.document.querySelector('input[readonly]').value,'30 Tage');
    input(window,'inputDate','18.02.2027');submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent,/Endverschiebung führt in einen neu beginnenden Friststillstand/);
    assert.equal(window.document.querySelector('.fr-calendar-export'),null);
  }finally{dom.window.close();}
});

test('AP23H3 actual minified OW bundle separates the thirty-day reasons request from the vacation-free five-day appeal',async()=>{
  const dom=await loadActualStaticPage();try{
    const{window}=dom;
    await choose(window,/Sitz der zuständigen Stelle/,/^Obwalden/);
    await choose(window,/Verfahrensrecht/,/^StVG \/ VGV OW/);
    await choose(window,/Verfahrensstadium/,/^Gerichtsverfahren/);
    await choose(window,/Verfahrenshandlung/,/^Begründung beim selben Verwaltungsgericht/);
    input(window,'inputDate','02.10.2026');submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null);
    await choose(window,/Fallkonstellation/,/^Zulässig unbegründeter Gerichtsentscheid/);submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/02\.11\.2026/);
    assert.equal(window.document.querySelector('input[readonly]').value,'30 Tage');
    await choose(window,/Verfahrenshandlung/,/^Präsidialentscheid zur aufschiebenden Wirkung/);
    input(window,'inputDate','23.12.2026');submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null,'Changing action must clear the case qualification');
    await choose(window,/Fallkonstellation/,/^Präsidialentscheid zur aufschiebenden Wirkung/);submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/28\.12\.2026/);
    assert.equal(window.document.querySelector('input[readonly]').value,'5 Tage');
    assert.equal(window.document.querySelector('.fr-calendar-export'),null);
    assert.equal(window.document.querySelectorAll('.fr-form__grid').length,1);
    assert.doesNotMatch(window.document.body.textContent,/Fristauslösendes Dokument|Massgeblicher Feiertagskanton/);
  }finally{dom.window.close();}
});

test('AP23H3 actual minified NW bundle uses only winter for objections and three suspensions for statutory observations',async()=>{
  const dom=await loadActualStaticPage();try{
    const{window}=dom;
    await choose(window,/Sitz der zuständigen Stelle/,/^Nidwalden/);
    await choose(window,/Verfahrensrecht/,/^VRG NW/);
    await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren/);
    await choose(window,/Verfahrenshandlung/,/^Angeordnete Stellungnahme im Einwendungsverfahren/);
    await choose(window,/Fallkonstellation/,/^Angeordnete Stellungnahme im Einwendungsverfahren/);
    input(window,'inputDate','10.12.2026');input(window,'deadlineDays','20');submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/15\.01\.2027/);
    input(window,'inputDate','10.07.2027');submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/30\.07\.2027/);
    await choose(window,/Verfahrenshandlung/,/^Vernehmlassung im Verwaltungsbeschwerdeverfahren/);submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null);
    await choose(window,/Fallkonstellation/,/^Beschwerde zur Vernehmlassung zugestellt/);submit(window);
    assert.match(window.document.querySelector('.fr-result__hero')!.textContent,/31\.08\.2027/);
    assert.equal(window.document.querySelector('input[readonly]').value,'20 Tage');
    assert.equal(window.document.querySelector('.fr-calendar-export'),null);
  }finally{dom.window.close();}
});

test('AP23H3 actual minified OW bundle preserves the narrow endshift collision and rejects unknown cases',async()=>{
  const dom=await loadActualStaticPage();try{
    const{window}=dom;
    await choose(window,/Sitz der zuständigen Stelle/,/^Obwalden/);
    await choose(window,/Verfahrensrecht/,/^StVG \/ VGV OW/);
    await choose(window,/Verfahrensstadium/,/^Verwaltungsverfahren/);
    await choose(window,/Verfahrenshandlung/,/^Angeordnete Verfahrenseingabe an die Verwaltung/);
    await choose(window,/Fallkonstellation/,/^Konkret angeordnete Verfahrenseingabe/);
    input(window,'inputDate','19.03.2027');input(window,'deadlineDays','1');submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null);
    assert.match(window.document.querySelector('.fr-result-region')!.textContent,/Endverschiebung führt in einen neu beginnenden Friststillstand/);
    await choose(window,/Fallkonstellation/,/^Nicht geklärt/);submit(window);
    assert.equal(window.document.querySelector('.fr-result__hero'),null);
    assert.equal(window.document.querySelector('.fr-calendar-export'),null);
  }finally{dom.window.close();}
});
