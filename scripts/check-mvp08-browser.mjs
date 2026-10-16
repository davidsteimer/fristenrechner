// SPDX-License-Identifier: AGPL-3.0-only
// Local browser on the exact definitive static build. No external requests.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = 'outputs/release-mvp08-2026-10-15';
const web = resolve(root, output, 'web-build');
const evidenceName = process.env.MVP08_BROWSER_EVIDENCE ?? 'browser-evidence';
assert.match(evidenceName, /^browser-[a-z-]+$/);
const evidence = resolve(root, output, evidenceName);
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const hash = data => createHash('sha256').update(data).digest('hex');
const built = JSON.parse(await readFile(resolve(root, output, 'product-build.json')));
for (const item of built.webFiles) assert.equal(hash(await readFile(resolve(root, item.path))), item.sha256);
await mkdir(evidence, {recursive: true});
const mime = {'.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.json': 'application/json'};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!path.startsWith('/fristenrechner/')) throw new Error('Outside local app');
    const selected = resolve(web, path.slice('/fristenrechner/'.length) || 'index.html');
    if (!selected.startsWith(web + '/')) throw new Error('Outside local app');
    res.writeHead(200, {'content-type': mime[extname(selected)] ?? 'application/octet-stream'});
    res.end(await readFile(selected));
  } catch {res.writeHead(404); res.end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
// Use an already installed browser. Never download or alter browser profiles.
const browser = await chromium.launch({headless: true, ...(process.env.MVP08_BROWSER_EXECUTABLE
  ? {executablePath: process.env.MVP08_BROWSER_EXECUTABLE} : {})});
const report = {kind: 'mvp08-actual-static-browser', startedAt: new Date().toISOString(),
  browser: browser.version(), webFiles: built.webFiles, checks: [], exports: [], screenshots: [], externalRequests: [],
  pageErrors: [], actualM365Testing: false, actualDeviceTesting: false, outlookImports: false, status: 'running'};
async function bind(path) {const bytes = await readFile(resolve(evidence, path)); return {path: `${output}/${evidenceName}/${path}`, byteLength: bytes.length, sha256: hash(bytes)};}
async function choose(page, label, option) {
  await page.getByRole('combobox', {name: label}).click();
  await page.getByRole('option', {name: option, exact: true}).click();
}
try {
  for (const locale of ['de', 'fr']) {
    const context = await browser.newContext({viewport: {width: locale === 'de' ? 1280 : 390, height: 960}, acceptDownloads: true});
    await context.route('**/*', route => {
      if (route.request().url().startsWith(origin + '/')) return route.continue();
      report.externalRequests.push(route.request().url()); return route.abort();
    });
    const page = await context.newPage(); page.on('pageerror', error => report.pageErrors.push(String(error)));
    await page.goto(`${origin}/fristenrechner/`, {waitUntil: 'networkidle'});
    await choose(page, 'Sitz der zuständigen Stelle', /^Tessin/);
    await choose(page, 'Erlass / Verfahrensrecht', 'LPAmm (TI)');
    await choose(page, 'Verfahrensstadium', 'Verwaltungsbeschwerde');
    await choose(page, 'Verfahrenshandlung', 'Ordentliche Verwaltungsbeschwerde');
    await choose(page, 'Fallkonstellation', 'Allgemeines kantonales Verfahren, tatsächlicher Empfang, keine Abweichung');
    await page.locator('input[name="inputDate"]').fill('02.10.2026');
    if (locale === 'fr') await choose(page, 'Sprache', 'Français');
    await page.locator('button[type="submit"]').click();
    await page.locator('.fr-result-region').getByText('02.11.2026', {exact: true}).first().waitFor();
    assert.equal(await page.locator('.fr-form__grid').count(), 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Horizontal page overflow');
    await page.locator('.fr-calendar-export input').fill(`QA-MVP08-BROWSER-${locale.toUpperCase()}-TI`);
    const download = page.waitForEvent('download');
    await page.locator('.fr-calendar-export__button').click();
    const file = await download;
    await file.saveAs(resolve(evidence, `${locale}-ti.ics`));
    const content = (await readFile(resolve(evidence, `${locale}-ti.ics`), 'utf8')).replace(/\r\n /g, '');
    assert.ok(content.includes('DTSTART;VALUE=DATE:20261102'));
    assert.ok(content.includes('DTEND;VALUE=DATE:20261103'));
    assert.ok(content.includes('TRIGGER:-PT112H'));
    assert.ok(content.includes('releaseId: 2026-10-15-mvp-08-approved.1'));
    assert.ok(content.includes('pathId: ti-80-30'));
    report.exports.push(await bind(`${locale}-ti.ics`));
    const focusAfterDownload = await page.evaluate(() => ({tag: document.activeElement?.tagName,
      className: document.activeElement?.className, skipLinkFocused: document.querySelector('.public-skip-link').matches(':focus')}));
    await page.locator('h1').click();
    const layout = await page.evaluate(() => ({skipLinkFocused: document.querySelector('.public-skip-link').matches(':focus'),
      skipLinkBottom: document.querySelector('.public-skip-link').getBoundingClientRect().bottom,
      formColumns: getComputedStyle(document.querySelector('.fr-form__grid')).gridTemplateColumns.split(' ').length}));
    assert.equal(layout.skipLinkFocused, false);
    assert.ok(layout.skipLinkBottom < 0);
    assert.equal(layout.formColumns, locale === 'de' ? 2 : 1);
    await page.screenshot({path: resolve(evidence, `${locale}-ti-result.png`), fullPage: true});
    report.screenshots.push(await bind(`${locale}-ti-result.png`));
    await page.locator('input[name="inputDate"]').fill('17.02.2027');
    assert.equal(await page.locator('.fr-calendar-export').count(), 0);
    await page.locator('button[type="submit"]').click();
    assert.equal(await page.locator('.fr-calendar-export').count(), 0);
    assert.equal(await page.locator('.fr-result__hero').count(), 0);
    report.checks.push({locale, result: '2026-11-02', download: true, staleExportRemoved: true, tiO2Blocked: true,
      overflow: false, focusAfterDownload, layout});
    await context.close();
  }
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.externalRequests, []);
  report.status = 'passed';
} catch (error) {report.status = 'failed'; report.error = String(error.stack ?? error);}
finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
report.finishedAt = new Date().toISOString();
await writeFile(resolve(evidence, `verification-${Date.now()}.json`), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify(report, null, 2));
assert.equal(report.status, 'passed');
