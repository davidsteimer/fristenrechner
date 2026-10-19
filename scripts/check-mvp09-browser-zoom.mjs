// SPDX-License-Identifier: AGPL-3.0-only
// Actual Chrome page zoom, selected through its normal settings UI in a fresh
// temporary profile. Never writes an existing user's browser preferences.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve, extname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = 'outputs/release-mvp09-2026-10-18';
const web = resolve(root, prefix, 'web-build');
const name = process.env.MVP09_ZOOM_EVIDENCE ?? `browser-zoom-${Date.now()}`;
assert.match(name, /^browser-zoom-[a-z0-9-]+$/);
const evidence = resolve(root, prefix, name);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bind = async path => {const bytes = await readFile(resolve(root, path)); return {path, byteLength: bytes.length, sha256: hash(bytes)};};
const built = JSON.parse(await readFile(resolve(root, prefix, 'product-build.json')));
assert.equal(built.status, 'passed');
for (const file of built.webFiles) assert.deepEqual(await bind(file.path), file);
await mkdir(evidence);
const profile = await mkdtemp(resolve(root, '.work/mvp09-zoom-profile-'));
const mime = {'.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.json': 'application/json'};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!path.startsWith('/fristenrechner/')) throw new Error('Outside app');
    const target = resolve(web, path.slice('/fristenrechner/'.length) || 'index.html');
    if (!target.startsWith(web + '/')) throw new Error('Outside app');
    res.writeHead(200, {'content-type': mime[extname(target)] ?? 'application/octet-stream'});
    res.end(await readFile(target));
  } catch {res.writeHead(404); res.end();}
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const context = await chromium.launchPersistentContext(profile, {
  executablePath: process.env.MVP09_BROWSER_EXECUTABLE,
  headless: true, viewport: null, args: ['--window-size=1280,960']
});
const report = {kind: 'mvp09-actual-browser-settings-zoom', status: 'running', startedAt: new Date().toISOString(),
  browser: context.browser().version(), temporaryProfile: relative(root, profile),
  method: 'Native Chrome settings Page zoom selector, not CSS zoom, device emulation, CDP page scale or synthetic viewport resizing',
  browserSettingsZoomExercised: true, realM365Testing: false, realDeviceTesting: false, existingBrowserProfilesTouched: false,
  installationPerformed: false, uploaded: false, published: false, outlookImports: false,
  webFiles: built.webFiles, buildProof: await bind(`${prefix}/product-build.json`),
  script: await bind('scripts/check-mvp09-browser-zoom.mjs'), checks: [], screenshots: [], pageErrors: [], externalRequests: []};
context.on('page', page => page.on('pageerror', error => report.pageErrors.push(String(error))));
await context.route('**/*', route => {
  const url = route.request().url();
  if (url.startsWith(origin + '/') || /^(?:chrome|chrome-untrusted|data):/.test(url)) return route.continue();
  report.externalRequests.push(url); return route.abort();
});
const metrics = () => ({viewport: {width: innerWidth, height: innerHeight},
  clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
  bodyScrollWidth: document.body.scrollWidth, devicePixelRatio, cssZoom: getComputedStyle(document.documentElement).zoom,
  visualScale: visualViewport.scale, media640: matchMedia('(max-width: 640px)').matches,
  columns: getComputedStyle(document.querySelector('.fr-form__grid')).gridTemplateColumns.split(' ').length,
  footerColumns: getComputedStyle(document.querySelector('.public-footer')).gridTemplateColumns.split(' ').length,
  dateHeight: document.querySelector('input[name="inputDate"]').getBoundingClientRect().height,
  dateFont: getComputedStyle(document.querySelector('input[name="inputDate"]')).fontSize,
  dateAlign: getComputedStyle(document.querySelector('input[name="inputDate"]')).textAlign});
async function choose(page, label, option) {
  await page.getByRole('combobox', {name: label}).click();
  await page.getByRole('option', {name: option, exact: true}).click();
}
try {
  const settings = await context.newPage();
  await settings.goto('chrome://settings/appearance');
  const zoom = settings.locator('select#zoomLevel');
  await zoom.waitFor(); assert.equal(await zoom.inputValue(), '1');
  report.originalSetting = {value: await zoom.inputValue(), text: (await zoom.locator('option:checked').textContent()).trim()};
  const page = await context.newPage();
  await page.goto(origin + '/fristenrechner/', {waitUntil: 'networkidle'});
  report.before = await page.evaluate(metrics);
  assert.equal(report.before.viewport.width, 1280); assert.equal(report.before.devicePixelRatio, 1);
  assert.equal(report.before.cssZoom, '1'); assert.equal(report.before.columns, 2);
  await zoom.selectOption('3');
  assert.equal(await zoom.inputValue(), '3');
  report.appliedSetting = {value: await zoom.inputValue(), text: (await zoom.locator('option:checked').textContent()).trim()};
  assert.equal(report.appliedSetting.text, '300%');
  await page.reload({waitUntil: 'networkidle'});
  await page.waitForFunction(() => innerWidth < 430 && devicePixelRatio > 2.99);
  await choose(page, 'Sitz der zuständigen Stelle', /^Tessin/);
  await choose(page, 'Erlass / Verfahrensrecht', 'LPAmm (TI)');
  await choose(page, 'Verfahrensstadium', 'Verwaltungsbeschwerde');
  await choose(page, 'Verfahrenshandlung', 'Ordentliche Verwaltungsbeschwerde');
  await choose(page, 'Fallkonstellation', 'Allgemeines kantonales Verfahren, tatsächlicher Empfang, keine Abweichung');
  const capture = await context.newCDPSession(page);
  for (const locale of ['de', 'fr']) {
    if (locale === 'fr') await choose(page, 'Sprache', 'Français');
    await page.locator('input[name="inputDate"]').fill('02.10.2026');
    await page.locator('button[type="submit"]').click();
    await page.locator('.fr-result-region').getByText('02.11.2026', {exact: true}).first().waitFor();
    const observed = await page.evaluate(metrics);
    report.checks.push({locale, result: '2026-11-02', ...observed});
    assert.ok(observed.viewport.width >= 426 && observed.viewport.width <= 427);
    assert.ok(Math.abs(observed.devicePixelRatio - 3) < 0.001);
    assert.equal(observed.cssZoom, '1'); assert.equal(observed.visualScale, 1);
    assert.equal(observed.media640, true); assert.equal(observed.columns, 1); assert.equal(observed.footerColumns, 1);
    assert.ok(observed.scrollWidth <= observed.clientWidth + 1); assert.ok(observed.bodyScrollWidth <= observed.clientWidth + 1);
    assert.equal(observed.dateHeight, 32); assert.equal(observed.dateFont, '14px'); assert.equal(observed.dateAlign, 'left');
    // Capture the actual browser surface without a CSS-pixel clip or viewport
    // resize. fullPage captures at native browser zoom can crop to CSS width.
    await page.bringToFront();
    for (const position of ['top', 'form', 'result']) {
      if (position === 'top') await page.evaluate(() => scrollTo(0, 0));
      if (position === 'form') await page.locator('input[name="inputDate"]').scrollIntoViewIfNeeded();
      if (position === 'result') await page.locator('.fr-result__hero').scrollIntoViewIfNeeded();
      const screenshotPath = `${prefix}/${name}/${locale}-actual-browser-zoom-300-${position}.png`;
      const result = await capture.send('Page.captureScreenshot', {format: 'png', fromSurface: true});
      const bytes = Buffer.from(result.data, 'base64');
      const pixels = {width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20)};
      assert.equal(pixels.width, 1280); assert.equal(pixels.height, 873);
      await writeFile(resolve(root, screenshotPath), bytes, {flag: 'wx'});
      report.screenshots.push({...await bind(screenshotPath), locale, position, pixels, viewport: await page.evaluate(metrics)});
    }
  }
  await zoom.selectOption('1');
  assert.equal(await zoom.inputValue(), '1');
  await page.reload({waitUntil: 'networkidle'});
  await page.waitForFunction(() => innerWidth === 1280 && devicePixelRatio === 1);
  report.afterRestore = await page.evaluate(metrics);
  assert.equal(report.afterRestore.cssZoom, '1'); assert.equal(report.afterRestore.columns, 2);
  report.temporaryProfileZoomRestored = true;
  for (const file of built.webFiles) assert.deepEqual(await bind(file.path), file);
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.externalRequests, []);
  report.status = 'passed';
} catch (error) {report.status = 'failed'; report.error = String(error.stack ?? error);}
finally {await context.close(); await new Promise(done => server.close(done));}
report.finishedAt = new Date().toISOString();
await writeFile(resolve(evidence, 'verification.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
await writeFile(resolve(evidence, 'check-mvp09-browser-zoom.mjs'), await readFile(resolve(root, report.script.path)), {flag: 'wx'});
console.log(JSON.stringify({status: report.status, report: await bind(`${prefix}/${name}/verification.json`),
  before: report.before, appliedSetting: report.appliedSetting, checks: report.checks, afterRestore: report.afterRestore, error: report.error}, null, 2));
assert.equal(report.status, 'passed');
