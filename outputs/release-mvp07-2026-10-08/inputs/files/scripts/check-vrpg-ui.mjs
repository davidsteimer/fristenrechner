// SPDX-License-Identifier: AGPL-3.0-only
// Optional local browser QA. Uses an installed Playwright module, never downloads a browser.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.FRISTENRECHNER_PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(resolve(modulePath)).href : 'playwright');
const baseUrl = process.env.FRISTENRECHNER_QA_URL ?? 'http://127.0.0.1:4173/';
const target = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)) {
  throw new Error('Dieser Test darf nur gegen eine lokale Entwicklungsvorschau laufen.');
}
const output = resolve(process.env.FRISTENRECHNER_QA_OUTPUT ?? '.work/qa/ap17');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.FRISTENRECHNER_CHROME_PATH ? { executablePath: process.env.FRISTENRECHNER_CHROME_PATH } : {})
});
const results = [];
const pageErrors = [];
const externalRequests = [];
const context = await browser.newContext({ viewport: { width: 1024, height: 1300 }, acceptDownloads: true });
const page = await context.newPage();
page.on('pageerror', error => pageErrors.push(error.message));
await page.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.origin === target.origin || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
  externalRequests.push(url.origin);
  return route.abort();
});
page.setDefaultTimeout(10000);
const choose = async (label, text) => {
  await page.getByRole('combobox', { name: new RegExp(`^${label}`) }).click();
  await page.getByRole('option', { name: text, exact: true }).click();
};
const input = label => page.getByLabel(label);
const calc = () => page.getByRole('button', { name: 'Frist berechnen', exact: true }).click();
const noResult = async () => {
  assert.equal(await page.locator('.fr-result__hero').count(), 0);
  assert.equal(await page.locator('.fr-calendar-export').count(), 0);
};
const snapshot = async (name, width, columns = 2) => {
  await page.setViewportSize({ width, height: 1300 });
  const layout = await page.evaluate(() => {
    const grids = [...document.querySelectorAll('.fr-form__grid, .fr-actions, .fr-result__grid, .fr-automatic__grid')];
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      columns: grids.map(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length),
      clippedChoices: [...document.querySelectorAll('.fr-procedure-choice .ms-Dropdown-title')]
        .filter(node => node.scrollWidth > node.clientWidth + 1).length
    };
  });
  assert.equal(layout.overflow, false, `${name}: horizontal overflow`);
  assert.ok(layout.columns.every(count => count === columns), `${name}: wrong grid ${layout.columns}`);
  assert.equal(layout.clippedChoices, 0, `${name}: clipped selection`);
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true });
  results.push({ name, width, ...layout });
  console.log(`Bestanden: ${name}`);
};

try {
  await page.goto(baseUrl);
  await page.getByRole('heading', { name: 'Angaben zur Frist' }).waitFor();
  assert.equal(await input('Empfangsdatum der Zustellung').inputValue(), '');
  await input('Empfangsdatum der Zustellung').fill('2026-09-16');
  await input('Frist in Tagen').fill('10');
  await calc();
  assert.match(await page.locator('.fr-result__hero').innerText(), /28\.09\.2026/);
  await snapshot('A01-stpo-result', 1024);
  await input('Referenz (optional)').fill('AP17 lokaler Test');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Kalenderdatei erstellen', exact: true }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  assert.match(Buffer.concat(chunks).toString('utf8'), /DTSTART;VALUE=DATE:20260928/);

  await choose('Erlass / Verfahrensrecht', 'VRPG Bern und Spezialrecht');
  await noResult();
  await calc();
  assert.match(await page.locator('.fr-result--validation').innerText(), /noch fehlende Angabe/);
  await choose('Bereich', 'Allgemeines Verwaltungsrecht');
  await input('Empfangsdatum der Zustellung').fill('2026-09-16');
  await calc();
  assert.match(await page.locator('.fr-result__hero').innerText(), /28\.09\.2026/);
  await snapshot('A02-vrpg-general', 1024);

  await choose('Bereich', 'Sozialversicherungsrecht');
  await noResult();
  await choose('Spezialerlass', 'Invalidenversicherung (IVG)');
  await choose('Verfahrenshandlung', 'Eingabe im laufenden Verfahren');
  await calc();
  assert.match(await page.locator('.fr-result--validation').innerText(), /noch fehlende Angabe/);
  await choose('Verfahrensstadium', 'Versicherungsgerichtliches Verfahren');
  await calc();
  await noResult();
  assert.match(await page.locator('.fr-result--validation').innerText(), /keine freigegebene Berechnung/);
  await page.getByRole('button', { name: 'Als Standard speichern', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('fristenrechner.defaults.v1')));
  assert.equal(saved.version, 3);
  assert.deepEqual(saved.vrpgSelection, { area: 'social', law: 'ivg', action: 'ongoing', stage: 'court' });
  assert.doesNotMatch(JSON.stringify(saved), /2026-09-16|AP17 lokaler Test|inputDate|specialDateValues/);
  await page.reload();
  await page.getByRole('combobox', { name: /^Verfahrensstadium/ }).waitFor();
  assert.equal(await input('Empfangsdatum der Zustellung').inputValue(), '');
  await choose('Verfahrenshandlung', 'Beschwerde ans Versicherungsgericht');
  assert.equal(await page.getByRole('combobox', { name: /^Verfahrensstadium/ }).count(), 0);
  await choose('Spezialerlass', 'Alters- und Hinterlassenenversicherung (AHVG)');
  assert.match(await page.getByRole('combobox', { name: /^Verfahrenshandlung/ }).innerText(), /Bitte wählen/);
  await snapshot('A03-social-law-reset', 1024);
  await choose('Verfahrenshandlung', 'Eingabe im laufenden Verfahren');
  await choose('Sprache', 'Français');
  await snapshot('A04-social-fr', 736);
  await snapshot('A05-social-mobile-fr', 360, 1);
  await page.setViewportSize({ width: 1024, height: 1300 });
  await choose('Langue', 'Deutsch');

  await choose('Bereich', 'Beschaffungsrecht');
  assert.equal(await input('Spezialerlass').inputValue(), 'IVöB · Kanton Bern');
  await choose('Verfahrenshandlung', 'Eingabe im laufenden Verfahren');
  await choose('Verfahrensstadium', 'Vergabeverfahren');
  await calc();
  await noResult();
  await snapshot('A06-procurement-block', 1024);

  await choose('Bereich', 'Politische Rechte');
  await choose('Ebene der politischen Angelegenheit', 'Kommunale Angelegenheit');
  await page.getByRole('combobox', { name: /^Verfahrenshandlung/ }).click();
  const communalOptions = await page.getByRole('option').allTextContents();
  assert.equal(communalOptions.length, 5);
  const voteOption = communalOptions.find(text => /Abstimmung/i.test(text));
  assert.ok(voteOption);
  await page.getByRole('option', { name: voteOption, exact: true }).click();
  const politicalDate = page.locator('input[type=date]').first();
  await politicalDate.fill('2026-09-16');
  await calc();
  assert.equal(await page.locator('.fr-result__hero').count(), 1);
  await snapshot('A07-political-result', 1024);
  await snapshot('A08-political-tablet', 736);
  await snapshot('A09-political-mobile', 360, 1);
  await page.setViewportSize({ width: 1024, height: 1300 });
  await choose('Ebene der politischen Angelegenheit', 'Kantonale Angelegenheit');
  await noResult();
  assert.equal(await page.locator('input[type=date]').first().inputValue(), '');
  await page.getByRole('combobox', { name: /^Verfahrenshandlung/ }).click();
  assert.equal((await page.getByRole('option').allTextContents()).length, 16);
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: /^Bereich/ }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('option', { name: 'Bitte wählen', exact: true }).click();
  await page.getByRole('button', { name: 'Als Standard speichern', exact: true }).click();
  await page.reload();
  assert.match(await page.getByRole('combobox', { name: /^Bereich/ }).innerText(), /Bitte wählen/);
  await calc();
  await noResult();
  await page.getByRole('button', { name: 'Standards zurücksetzen', exact: true }).click();
  assert.equal(await input('Empfangsdatum der Zustellung').inputValue(), '');
  assert.equal(await page.evaluate(() => localStorage.getItem('fristenrechner.defaults.v1')), null);
  assert.equal(await page.getByRole('combobox', { name: /^Bereich/ }).count(), 0);
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(externalRequests, []);
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify({ passed: true, results, pageErrors, externalRequests }, null, 2));
  console.log(JSON.stringify({ passed: true, results, pageErrors, externalRequests }, null, 2));
} finally {
  await browser.close();
}
