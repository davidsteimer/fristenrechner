// SPDX-License-Identifier: AGPL-3.0-only
// Local browser QA only. No browser downloads and no production host access.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const modulePath = process.env.FRISTENRECHNER_PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(resolve(modulePath)).href : 'playwright');
const baseUrl = process.env.FRISTENRECHNER_QA_URL ?? 'http://127.0.0.1:8793/?candidate=ap17c';
const target = new URL(baseUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)) throw new Error('Nur lokale Kandidatenprüfung zulässig.');
const output = resolve(process.env.FRISTENRECHNER_QA_OUTPUT ?? '.work/qa/ap17c-browser');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.FRISTENRECHNER_CHROME_PATH ? { executablePath: process.env.FRISTENRECHNER_CHROME_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1024, height: 1300 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
const externalRequests = [];
const results = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.origin === target.origin || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
  externalRequests.push(url.origin);
  return route.abort();
});
page.setDefaultTimeout(10000);
const choose = async (label, text) => {
  await page.getByRole('listbox').waitFor({ state: 'hidden' });
  const field = page.getByRole('combobox', { name: new RegExp(`^${label}`) });
  await field.waitFor({ state: 'visible' });
  await field.click();
  await page.getByRole('option', { name: text, exact: true }).click();
  await page.getByRole('listbox').waitFor({ state: 'hidden' });
  // A click may finish before React commits the selection and translated labels.
  const selectedField = ['Sprache', 'Langue'].includes(label)
    ? page.locator('.fr-language [role="combobox"]') : field;
  await selectedField.filter({ has: page.getByText(text, { exact: true }) }).waitFor({ state: 'visible' });
};
const calculate = () => page.getByRole('button', { name: 'Frist berechnen', exact: true }).click();
const stableAuthorityField = async () => {
  const languageField = page.locator('.fr-language [role="combobox"]');
  await languageField.waitFor({ state: 'visible' });
  const languageLabel = await languageField.getAttribute('aria-label');
  assert.ok(['Sprache', 'Langue'].includes(languageLabel));
  const isFrench = languageLabel === 'Langue';
  const candidate = target.searchParams.get('candidate');
  if (candidate === 'ap18c' || candidate === 'ap17c') {
    const expectedNotice = `${candidate.toUpperCase()} · ${isFrench ? 'Candidat de test local' : 'Lokaler Prüfkandidat'}`;
    assert.ok((await page.locator('.fr-app').innerText()).includes(expectedNotice), `Kandidatenwarnung fehlt: ${expectedNotice}`);
  }
  if (!candidate && process.env.FRISTENRECHNER_QA_RELEASE_ID) {
    const text = await page.locator('.fr-app').innerText();
    assert.ok(text.includes(process.env.FRISTENRECHNER_QA_RELEASE_ID), 'Erwarteter Datenrelease fehlt');
    assert.doesNotMatch(text, /Lokaler Prüfkandidat|Candidat de test local/);
    assert.doesNotMatch(text, /Geprüfte Fallabdeckung des Kandidaten|Dieser Kandidat unterstützt|Ce candidat ne prend/);
  }
  const label = isFrench ? 'Siège de l’organisme compétent' : 'Sitz der zuständigen Stelle';
  const selectedText = isFrench ? 'Autorité du canton de Berne' : 'Behörde des Kantons Bern';
  // Fluent UI combines the visible label and selected option through aria-labelledby.
  const field = page.getByRole('combobox', { name: new RegExp(`^${label}(?:\\s|$)`) });
  await field.waitFor({ state: 'visible' });
  assert.equal(await field.count(), 1, `Statisches Stellenlabel fehlt: ${label}`);
  assert.deepEqual(await field.evaluate(node => (node.getAttribute('aria-labelledby') ?? '').split(/\s+/)
    .map(id => document.getElementById(id)?.textContent)), [label, selectedText]);
  assert.equal(await field.innerText(), selectedText);
  for (const obsolete of ['Unterstützter Verfahrenskontext', 'Contexte procédural pris en charge',
    'Sitz der zuständigen Behörde', 'Siège de l’autorité compétente']) {
    assert.equal(await page.getByRole('combobox', { name: new RegExp(`^${obsolete}(?:\\s|$)`) }).count(), 0);
  }
};
const fixedField = async (label, value) => {
  assert.equal(await page.getByRole('combobox', { name: new RegExp(`^${label}`) }).count(), 0);
  assert.equal(await page.getByRole('textbox', { name: label, exact: true }).count(), 0);
  const field = page.getByRole('status', { name: label, exact: true });
  assert.equal(await field.innerText(), value);
  assert.equal(await field.isDisabled(), false);
  assert.equal(await field.evaluate(node => node.tagName), 'OUTPUT');
  assert.equal(await field.evaluate(node => node.isContentEditable), false);
  assert.equal(await field.evaluate(node => node.tabIndex), -1);
};
const fixedSocialFields = async () => {
  await fixedField('Verfahrensgegenstand', 'Individuelle IV-Versicherungsleistungen');
  await fixedField('Fristauslösendes Dokument', 'IV-Vorbescheid über Versicherungsleistungen');
  await fixedField('Rechtlich massgebende Eröffnung', 'Massgebende individuelle Zustellung');
};
const qualifiedDate = () => page.getByLabel(/^Datum der rechtlich massgebenden Zustellung/);
const noResult = async () => {
  assert.equal(await page.locator('.fr-result__hero').count(), 0);
  assert.equal(await page.locator('.fr-calendar-export').count(), 0);
};
const end = async value => assert.match(await page.locator('.fr-result__hero').innerText(), new RegExp(value));
const snapshot = async (name, width = 1024) => {
  await stableAuthorityField();
  await page.setViewportSize({ width, height: 1300 });
  const layout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    columns: [...document.querySelectorAll('.fr-form__grid, .fr-actions, .fr-result__grid, .fr-automatic__grid')]
      .map(node => getComputedStyle(node).gridTemplateColumns.split(' ').length),
    clipped: [...document.querySelectorAll('.fr-procedure-choice .ms-Dropdown-title')]
      .filter(node => node.scrollWidth > node.clientWidth + 1).length,
    clippedFixedValues: [...document.querySelectorAll('.fr-model-scope__value')]
      .filter(node => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).length,
    fixedFieldDimensions: [...document.querySelectorAll('.fr-model-scope__value')]
      .map(node => ({ value: node.textContent, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth,
        scrollHeight: node.scrollHeight, clientHeight: node.clientHeight }))
  }));
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true });
  assert.equal(layout.overflow, false, `${name} overflow`);
  assert.ok(layout.columns.every(count => count === (width <= 640 ? 1 : 2)), `${name} columns`);
  assert.equal(layout.clipped, 0, `${name} clipped labels`);
  assert.equal(layout.clippedFixedValues, 0, `${name} clipped fixed values: ${JSON.stringify(layout.fixedFieldDimensions)}`);
  results.push({ name, width, ...layout });
  console.log(`Bestanden: ${name}`);
};

try {
  await page.goto(baseUrl);
  await page.getByRole('heading', { name: 'Angaben zur Frist' }).waitFor();
  await stableAuthorityField();
  if (target.searchParams.has('candidate')) {
    assert.match(await page.locator('.fr-app').innerText(), /Lokaler Prüfkandidat/);
  } else if (process.env.FRISTENRECHNER_QA_RELEASE_ID) {
    const text = await page.locator('.fr-app').innerText();
    assert.ok(text.includes(process.env.FRISTENRECHNER_QA_RELEASE_ID));
    assert.doesNotMatch(text, /Lokaler Prüfkandidat|Candidat de test local/);
  }
  assert.equal(await page.getByLabel('Empfangsdatum der Zustellung').inputValue(), '');
  await page.getByLabel('Empfangsdatum der Zustellung').fill('2026-09-16');
  await calculate();
  await end('28.09.2026');
  await choose('Erlass / Verfahrensrecht', 'VRPG Bern und Spezialrecht');
  await stableAuthorityField();
  await noResult();
  await choose('Bereich', 'Sozialversicherungsrecht');
  await stableAuthorityField();
  await choose('Spezialerlass', 'Invalidenversicherung (IVG)');
  await choose('Verfahrenshandlung', 'Einwand gegen Vorbescheid');
  assert.equal(await page.getByRole('checkbox').count(), 0);
  assert.match(await page.getByLabel('Fristdauer').inputValue(), /30/);
  assert.equal(await page.getByLabel('Fristdauer').getAttribute('readonly'), '');
  await fixedSocialFields();
  await qualifiedDate().fill('2026-09-16');
  await calculate();
  await noResult();
  assert.equal(await page.locator('.fr-result--validation').count(), 1);
  assert.equal(await qualifiedDate().inputValue(), '2026-09-16');
  await choose('Wohnsitz / Sitz', 'Partei und Vertretung im Kanton Bern');
  await calculate();
  await end('16.10.2026');
  await snapshot('C01-iv-einwand');
  await page.getByLabel('Referenz (optional)').fill('AP17C Browserfall');
  const downloadWait = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Kalenderdatei erstellen', exact: true }).click();
  const stream = await (await downloadWait).createReadStream();
  const bytes = [];
  for await (const chunk of stream) bytes.push(chunk);
  const ics = Buffer.concat(bytes).toString('utf8');
  assert.match(ics, /DTSTART;VALUE=DATE:20261016/);
  assert.match(ics, /SUMMARY:Fristablauf \(AP17C Browserfall\)/);

  await page.getByRole('button', { name: 'Als Standard speichern', exact: true }).click();
  await stableAuthorityField();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('fristenrechner.defaults.v1')));
  assert.equal(saved.vrpgSelection.action, 'preliminary-objection');
  assert.doesNotMatch(JSON.stringify(saved), /vrpgContext|notificationChannel|holidayConnections|procedureStartDate|2026-09-16|AP17C Browserfall/);
  await page.reload();
  await qualifiedDate().waitFor();
  await stableAuthorityField();
  assert.equal(await qualifiedDate().inputValue(), '');
  await fixedSocialFields();
  assert.match(await page.getByRole('combobox', { name: /^Wohnsitz \/ Sitz/ }).innerText(), /Bitte wählen/);
  await calculate();
  await noResult();
  await snapshot('C02-defaults-no-case-truth');

  // A restored social default and a newly selected social path must use the same label.
  await choose('Erlass / Verfahrensrecht', 'Strafprozessordnung (StPO)');
  await stableAuthorityField();
  await choose('Erlass / Verfahrensrecht', 'VRPG Bern und Spezialrecht');
  await stableAuthorityField();
  await choose('Bereich', 'Sozialversicherungsrecht');
  await stableAuthorityField();
  await choose('Spezialerlass', 'Invalidenversicherung (IVG)');
  await choose('Verfahrenshandlung', 'Einwand gegen Vorbescheid');
  await fixedSocialFields();
  await stableAuthorityField();

  await choose('Verfahrenshandlung', 'Nachfrist zur Verbesserung der Beschwerde');
  assert.equal(await page.getByRole('combobox', { name: /^Verfahrensstadium/ }).count(), 0);
  await fixedField('Verfahrensgegenstand', 'Individuelle IV-Versicherungsleistungen');
  await fixedField('Fristauslösendes Dokument', 'Tagesnachfrist des Versicherungsgerichts Bern zur Beschwerdeverbesserung');
  await fixedField('Rechtlich massgebende Eröffnung', 'Massgebende individuelle Zustellung');
  await choose('Wohnsitz / Sitz', 'Partei im Kanton Bern, ohne Vertretung');
  await qualifiedDate().fill('2026-03-10');
  await page.getByLabel('Angeordnete Frist in Tagen').fill('30');
  await calculate();
  await end('24.04.2026');
  await snapshot('C03-correction-suspension');
  await choose('Wohnsitz / Sitz', 'Andere oder noch ungeklärte Konstellation');
  await noResult();
  await calculate();
  await noResult();
  assert.match(await page.locator('.fr-result__messages').innerText(), /Anknüpfungen im Kanton Bern/);
  await snapshot('C04-anchor-blocked');
  await choose('Verfahrenshandlung', 'Eingabe im laufenden Verfahren');
  await choose('Verfahrensstadium', 'Versicherungsgerichtliches Verfahren');
  await calculate();
  await noResult();
  assert.match(await page.locator('.fr-result--validation').innerText(), /keine freigegebene Berechnung/);

  await choose('Bereich', 'Beschaffungsrecht');
  await choose('Verfahrenshandlung', 'Beschwerde gegen Zuschlag');
  assert.match(await page.getByLabel('Fristdauer').inputValue(), /20/);
  await fixedField('Verfahrensgegenstand', 'Zuschlag nach bernischem IVöB-Recht');
  await fixedField('Fristauslösendes Dokument', 'Zuschlagsverfügung');
  assert.match(await page.getByRole('combobox', { name: /^Rechtlich massgebende Eröffnung/ }).innerText(), /Bitte wählen/);
  await qualifiedDate().fill('2026-09-06');
  await page.getByLabel('Einleitung des Vergabeverfahrens').fill('2022-02-01');
  await calculate();
  await noResult();
  await choose('Rechtlich massgebende Eröffnung', 'Massgebende amtliche Publikation');
  assert.equal(await page.getByLabel('Datum der massgebenden Publikation').inputValue(), '');
  await page.getByLabel('Datum der massgebenden Publikation').fill('2026-09-06');
  await calculate();
  await end('28.09.2026');
  await snapshot('C05-procurement-publication');
  await choose('Rechtlich massgebende Eröffnung', 'Massgebende individuelle Zustellung');
  await noResult();
  assert.equal(await qualifiedDate().inputValue(), '');
  assert.equal(await page.getByLabel('Einleitung des Vergabeverfahrens').inputValue(), '2022-02-01');
  await calculate();
  await noResult();
  await snapshot('C15-procurement-channel-reset');
  await choose('Rechtlich massgebende Eröffnung', 'Massgebende amtliche Publikation');
  await page.getByLabel('Datum der massgebenden Publikation').fill('2026-09-06');
  await page.getByLabel('Einleitung des Vergabeverfahrens').fill('2022-01-31');
  await calculate();
  await noResult();
  assert.match(await page.locator('.fr-result__messages').innerText(), /vor dem 1. Februar 2022/);
  await snapshot('C06-procurement-old-law-block');
  await page.getByLabel('Einleitung des Vergabeverfahrens').fill('2022-02-01');
  await calculate();
  await choose('Sprache', 'Français');
  await snapshot('C07-procurement-fr', 1024);
  await snapshot('C08-procurement-tablet-fr', 736);
  await snapshot('C09-procurement-mobile-fr', 360);
  await page.setViewportSize({ width: 1024, height: 1300 });
  await choose('Langue', 'Deutsch');
  await choose('Verfahrenshandlung', 'Eingabe im laufenden Verfahren');
  await choose('Verfahrensstadium', 'Verwaltungsinternes Beschwerdeverfahren');
  await fixedField('Verfahrensgegenstand', 'Beschaffungsbeschwerde nach bernischem IVöB-Recht');
  await fixedField('Fristauslösendes Dokument', 'Tagesfrist der verwaltungsinternen Beschwerdeinstanz');
  await choose('Rechtlich massgebende Eröffnung', 'Massgebende individuelle Zustellung');
  await qualifiedDate().fill('2026-03-04');
  await page.getByLabel('Einleitung des Vergabeverfahrens').fill('2022-02-01');
  await page.getByLabel('Angeordnete Frist in Tagen').fill('30');
  await calculate();
  await end('07.04.2026');
  await snapshot('C10-internal-procurement');
  await choose('Verfahrensstadium', 'Vergabeverfahren');
  await calculate();
  await noResult();
  await choose('Bereich', 'Allgemeines Verwaltungsrecht');
  await page.getByLabel('Empfangsdatum der Zustellung').fill('2026-09-16');
  await page.getByLabel('Frist in Tagen', { exact: true }).fill('10');
  await calculate();
  await end('28.09.2026');
  await snapshot('C11-general-regression');
  await choose('Bereich', 'Sozialversicherungsrecht');
  await choose('Spezialerlass', 'Unfallversicherung (UVG)');
  await choose('Verfahrenshandlung', 'Nachfrist zur Verbesserung der Beschwerde');
  await fixedField('Verfahrensgegenstand', 'Individuelle Leistungen der obligatorischen Unfallversicherung');
  await fixedField('Fristauslösendes Dokument', 'Tagesnachfrist des Versicherungsgerichts Bern zur Beschwerdeverbesserung');
  await fixedField('Rechtlich massgebende Eröffnung', 'Massgebende individuelle Zustellung');
  await choose('Wohnsitz / Sitz', 'Partei und Vertretung im Kanton Bern');
  await qualifiedDate().fill('2026-12-20');
  await page.getByLabel('Angeordnete Frist in Tagen').fill('10');
  // Exercise keyboard submission from a real numeric input, not only a button click.
  await page.getByLabel('Angeordnete Frist in Tagen').press('Enter');
  await end('12.01.2027');
  await choose('Sprache', 'Français');
  await fixedField('Objet de la procédure', 'Prestations individuelles de l’assurance-accidents obligatoire');
  await fixedField('Document déclenchant le délai', 'Délai en jours du Tribunal des assurances du canton de Berne pour corriger le recours');
  await fixedField('Notification juridiquement déterminante', 'Notification individuelle déterminante');
  assert.equal(await page.getByLabel(/^Date de notification juridiquement déterminante/).inputValue(), '2026-12-20');
  await snapshot('C12-social-fr', 1024);
  await snapshot('C13-social-tablet-fr', 736);
  await snapshot('C14-social-mobile-fr', 360);
  await choose('Langue', 'Deutsch');
  await snapshot('C16-social-mobile-de', 360);
  await snapshot('C17-social-tablet-de', 736);
  await choose('Spezialerlass', 'Alters- und Hinterlassenenversicherung (AHVG)');
  await noResult();
  await choose('Verfahrenshandlung', 'Nachfrist zur Verbesserung der Beschwerde');
  await fixedField('Verfahrensgegenstand', 'Individuelle AHV-Versicherungsleistungen');
  assert.equal(await qualifiedDate().inputValue(), '');
  assert.match(await page.getByRole('combobox', { name: /^Wohnsitz \/ Sitz/ }).innerText(), /Bitte wählen/);
  await choose('Bereich', 'Politische Rechte');
  await choose('Ebene der politischen Angelegenheit', 'Eidgenössische Angelegenheit');
  const federalActionDe = 'Weiterzug gegen Regierungsentscheid zu eidgenössischer Abstimmung';
  const federalActionFr = 'Recours contre la décision gouvernementale relative à une votation fédérale';
  await fixedField('Verfahrenshandlung / Situation', federalActionDe);
  assert.equal(await page.getByLabel('Eröffnungsdatum des Entscheids').isEnabled(), true);
  assert.equal(await page.getByLabel('Eröffnungsdatum des Entscheids').inputValue(), '');
  await page.getByLabel('Eröffnungsdatum des Entscheids').fill('2026-09-16');
  await calculate();
  await end('21.09.2026');
  await snapshot('C18-federal-fixed-de', 1024);
  await page.getByRole('button', { name: 'Als Standard speichern', exact: true }).click();
  await page.reload();
  await fixedField('Verfahrenshandlung / Situation', federalActionDe);
  assert.equal(await page.getByLabel('Eröffnungsdatum des Entscheids').inputValue(), '');
  await noResult();
  await choose('Sprache', 'Français');
  await fixedField('Acte de procédure / Situation', federalActionFr);
  await stableAuthorityField();
  await page.getByRole('button', { name: 'Enregistrer comme valeurs par défaut', exact: true }).click();
  await page.reload();
  await fixedField('Acte de procédure / Situation', federalActionFr);
  await stableAuthorityField();
  await noResult();
  await snapshot('C19-federal-fixed-fr-tablet', 736);
  await snapshot('C20-federal-fixed-fr-mobile', 360);
  await choose('Niveau de l’affaire politique', 'Affaire cantonale');
  assert.equal(await page.getByRole('status', { name: 'Acte de procédure / Situation', exact: true }).count(), 0);
  assert.match(await page.getByRole('combobox', { name: /^Acte de procédure/ }).innerText(), /Veuillez choisir/);
  await noResult();
  await snapshot('C21-cantonal-real-choice-fr', 736);
  await choose('Niveau de l’affaire politique', 'Affaire fédérale');
  await fixedField('Acte de procédure / Situation', federalActionFr);
  assert.equal(await page.getByLabel('Date de la notification de la décision').inputValue(), '');
  await noResult();
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ baseUrl, results, errors, externalRequests }, null, 2));
  await browser.close();
}
