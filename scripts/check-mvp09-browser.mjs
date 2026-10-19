// SPDX-License-Identifier: AGPL-3.0-only
// Local browser on the exact definitive static build. No external requests.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = 'outputs/release-mvp09-2026-10-18';
const web = resolve(root, output, 'web-build');
const evidenceName = process.env.MVP09_BROWSER_EVIDENCE ?? `browser-evidence-${Date.now()}`;
assert.match(evidenceName, /^browser-[a-z0-9-]+$/);
const evidence = resolve(root, output, evidenceName);
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const hash = data => createHash('sha256').update(data).digest('hex');
const built = JSON.parse(await readFile(resolve(root, output, 'product-build.json')));
for (const item of built.webFiles) assert.equal(hash(await readFile(resolve(root, item.path))), item.sha256);
// Every attempt owns a fresh directory. Never overwrite previous ICS/images.
await mkdir(evidence);
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
const browser = await chromium.launch({headless: true, ...(process.env.MVP09_BROWSER_EXECUTABLE
  ? {executablePath: process.env.MVP09_BROWSER_EXECUTABLE} : {})});
const report = {kind: 'mvp09-actual-static-browser', startedAt: new Date().toISOString(),
  browser: browser.version(), webFiles: built.webFiles, checks: [], diagnostics: [], exports: [], screenshots: [], externalRequests: [],
  pageErrors: [], actualM365Testing: false, actualDeviceTesting: false, actualBrowserMenuZoomTesting: false,
  outlookImports: false, status: 'running'};
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
    await page.locator('.fr-calendar-export input').fill(`QA-MVP09-BROWSER-${locale.toUpperCase()}-TI`);
    const download = page.waitForEvent('download');
    await page.locator('.fr-calendar-export__button').click();
    const file = await download;
    await file.saveAs(resolve(evidence, `${locale}-ti.ics`));
    const content = (await readFile(resolve(evidence, `${locale}-ti.ics`), 'utf8')).replace(/\r\n /g, '');
    assert.ok(content.includes('DTSTART;VALUE=DATE:20261102'));
    assert.ok(content.includes('DTEND;VALUE=DATE:20261103'));
    assert.ok(content.includes('TRIGGER:-PT112H'));
    assert.ok(content.includes('releaseId: 2026-10-18-mvp-09-approved.1'));
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
    const geometry = await page.evaluate(() => {
      const date = document.querySelector('input[name="inputDate"]');
      const days = document.querySelector('input[name="deadlineDays"]');
      return { dateHeight: date.getBoundingClientRect().height, dateFont: getComputedStyle(date).fontSize,
        dateAlign: getComputedStyle(date).textAlign,
        daysHeight: days?.getBoundingClientRect().height, daysFont: days ? getComputedStyle(days).fontSize : null };
    });
    assert.equal(geometry.dateHeight, 32);
    assert.equal(geometry.dateFont, '14px');
    assert.equal(geometry.dateAlign, 'left');
    if (geometry.daysHeight !== undefined) assert.ok(Math.abs(geometry.dateHeight - geometry.daysHeight) <= 2);
    await page.screenshot({path: resolve(evidence, `${locale}-ti-result.png`), fullPage: true});
    report.screenshots.push(await bind(`${locale}-ti-result.png`));
    await page.locator('input[name="inputDate"]').fill('17.02.2027');
    assert.equal(await page.locator('.fr-calendar-export').count(), 0);
    await page.locator('button[type="submit"]').click();
    assert.equal(await page.locator('.fr-calendar-export').count(), 0);
    assert.equal(await page.locator('.fr-result__hero').count(), 0);
    report.checks.push({locale, result: '2026-11-02', download: true, staleExportRemoved: true, tiO2Blocked: true,
      overflow: false, focusAfterDownload, layout, geometry});
    await context.close();
  }
  // Local touch emulation is layout evidence, not a physical iPad test.
  const touch = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await touch.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    report.externalRequests.push(route.request().url()); return route.abort();
  });
  const page = await touch.newPage();
  page.on('pageerror', error => report.pageErrors.push(String(error)));
  await page.goto(origin + '/fristenrechner/', {waitUntil: 'networkidle'});
  const touchMetrics = await page.evaluate(() => {
    const date = document.querySelector('input[name="inputDate"]');
    return {coarse: matchMedia('(pointer: coarse)').matches, dateHeight: date.getBoundingClientRect().height,
      font: getComputedStyle(date).fontSize, overflow: document.documentElement.scrollWidth > innerWidth + 1};
  });
  assert.equal(touchMetrics.coarse, true);
  assert.equal(touchMetrics.dateHeight, 44);
  assert.equal(touchMetrics.font, '16px');
  assert.equal(touchMetrics.overflow, false);
  await page.screenshot({path: resolve(evidence, 'touch-emulation-390.png'), fullPage: true});
  report.screenshots.push(await bind('touch-emulation-390.png'));
  report.checks.push({kind: 'touch-emulation-not-real-device', ...touchMetrics});
  await touch.close();
  // Author CSS zoom is not browser menu zoom. Retain the original failing
  // technique only as a diagnostic: its 1280px media-query viewport stays wide.
  const diagnostic = await browser.newContext({viewport: {width: 1280, height: 960}});
  await diagnostic.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    report.externalRequests.push(route.request().url()); return route.abort();
  });
  const diagnosticPage = await diagnostic.newPage();
  diagnosticPage.on('pageerror', error => report.pageErrors.push(String(error)));
  await diagnosticPage.goto(origin + '/fristenrechner/', {waitUntil: 'networkidle'});
  const layoutMetrics = () => ({
    cssZoom: getComputedStyle(document.documentElement).zoom,
    viewport: {width: innerWidth, height: innerHeight},
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    devicePixelRatio,
    visualViewport: {width: visualViewport.width, height: visualViewport.height, scale: visualViewport.scale},
    media640: matchMedia('(max-width: 640px)').matches,
    media850: matchMedia('(max-width: 850px)').matches,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      || document.body.scrollWidth > document.documentElement.clientWidth + 1,
    columns: getComputedStyle(document.querySelector('.fr-form__grid')).gridTemplateColumns.split(' ').length,
    footerColumns: getComputedStyle(document.querySelector('.public-footer')).gridTemplateColumns.split(' ').length
  });
  const beforeCssZoom = await diagnosticPage.evaluate(layoutMetrics);
  await diagnosticPage.evaluate(() => {document.documentElement.style.zoom = '3';});
  const afterCssZoom = await diagnosticPage.evaluate(layoutMetrics);
  report.diagnostics.push({kind: 'author-css-zoom-not-browser-menu-zoom', acceptanceGate: false,
    reason: 'CSS zoom does not reduce the media-query viewport. Its overflow is diagnostic only, not a browser zoom result.',
    before: beforeCssZoom, after: afterCssZoom});
  assert.equal(beforeCssZoom.cssZoom, '1');
  assert.equal(afterCssZoom.cssZoom, '3');
  assert.equal(afterCssZoom.viewport.width, 1280);
  assert.equal(afterCssZoom.media640, false);
  await diagnostic.close();

  // Approximate the effective CSS viewport of a 1280x960 window at 300%.
  // DPR 3 changes raster density, not browser zoom. The unmodified document
  // must genuinely reflow. Actual browser menu zoom remains a separate E/Q gate.
  const reflow = await browser.newContext({viewport: {width: 426, height: 320}, deviceScaleFactor: 3});
  await reflow.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    report.externalRequests.push(route.request().url()); return route.abort();
  });
  const reflowPage = await reflow.newPage();
  reflowPage.on('pageerror', error => report.pageErrors.push(String(error)));
  await reflowPage.goto(origin + '/fristenrechner/', {waitUntil: 'networkidle'});
  const reflowMetrics = await reflowPage.evaluate(layoutMetrics);
  report.checks.push({kind: 'reflow-equivalent-not-browser-menu-zoom',
    approximation: {referenceViewport: {width: 1280, height: 960}, targetMagnificationPercent: 300,
      method: 'floor(reference viewport / 3), unmodified document; DPR is raster density only'}, ...reflowMetrics});
  assert.equal(reflowMetrics.cssZoom, '1');
  assert.deepEqual(reflowMetrics.viewport, {width: 426, height: 320});
  assert.equal(reflowMetrics.clientWidth, 426);
  assert.equal(reflowMetrics.devicePixelRatio, 3);
  assert.equal(reflowMetrics.visualViewport.scale, 1);
  assert.equal(reflowMetrics.media640, true);
  assert.equal(reflowMetrics.media850, true);
  assert.equal(reflowMetrics.columns, 1);
  assert.equal(reflowMetrics.footerColumns, 1);
  assert.equal(reflowMetrics.overflow, false);
  await reflowPage.screenshot({path: resolve(evidence, 'reflow-426-dpr3-not-browser-zoom.png'), fullPage: true});
  report.screenshots.push(await bind('reflow-426-dpr3-not-browser-zoom.png'));
  await reflow.close();
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.externalRequests, []);
  report.status = 'passed';
} catch (error) {report.status = 'failed'; report.error = String(error.stack ?? error);}
finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
report.finishedAt = new Date().toISOString();
await writeFile(resolve(evidence, `verification-${Date.now()}.json`), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify(report, null, 2));
assert.equal(report.status, 'passed');
