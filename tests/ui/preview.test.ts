// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = resolve(repositoryRoot, 'preview/index.html');
const componentPath = resolve(repositoryRoot, 'src/ui/FristenrechnerApp.tsx');
const stylesPath = resolve(repositoryRoot, 'src/ui/styles.css');
const outputDirectory = resolve(repositoryRoot, '.work/ui-preview');

describe('AP9-Browservorschau', () => {
  it('erklärt einen fehlenden Build sichtbar und verwendet relative Assetpfade', async () => {
    const html = await readFile(sourcePath, 'utf8');

    assert.match(html, /data-preview-fallback/);
    assert.match(html, /npm run preview:ui/);
    assert.match(html, /href="\.\/app\.css"/);
    assert.match(html, /src="\.\/vendor\/react\.js"/);
    assert.match(html, /src="\.\/vendor\/react-dom\.js"/);
    assert.match(html, /src="\.\/vendor\/fluent-ui-react\.js"/);
    assert.match(html, /src="\.\/app\.js"/);
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
  });

  it('erzeugt HTML, JavaScript und CSS in einem gemeinsamen Ausgabeordner', async () => {
    await execFileAsync(process.execPath, [resolve(repositoryRoot, 'scripts/build-ui-preview.mjs')], {
      cwd: repositoryRoot
    });

    const outputHtml = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');
    const javascript = await stat(resolve(outputDirectory, 'app.js'));
    const stylesheet = await stat(resolve(outputDirectory, 'app.css'));
    const react = await stat(resolve(outputDirectory, 'vendor/react.js'));
    const reactDom = await stat(resolve(outputDirectory, 'vendor/react-dom.js'));
    const fluentUi = await stat(resolve(outputDirectory, 'vendor/fluent-ui-react.js'));

    assert.equal(outputHtml, await readFile(sourcePath, 'utf8'));
    assert.ok(javascript.size > 0);
    assert.ok(stylesheet.size > 0);
    assert.ok(react.size > 0);
    assert.ok(reactDom.size > 0);
    assert.ok(fluentUi.size > 0);
  });

  it('ordnet Hauptaktionen, Resultat, Automatik und Datenstand nach dem Kanzlei-Workflow', async () => {
    const source = await readFile(componentPath, 'utf8');
    const styles = await readFile(stylesPath, 'utf8');
    const actions = source.indexOf('className="fr-actions"');
    const result = source.indexOf('className="fr-result-region"');
    const automatic = source.indexOf('className="fr-automatic"');
    const dataStatus = source.indexOf('className="fr-data-status"');

    assert.ok(actions > 0);
    assert.ok(result > actions);
    assert.ok(automatic > result);
    assert.ok(dataStatus > automatic);
    assert.doesNotMatch(source, /form\.authority\.help|form\.profile\.filtered/);
    assert.match(
      styles,
      /\.fr-actions\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);[\s\S]*?gap:\s*10px 24px;/
    );
    assert.match(
      styles,
      /@media \(max-width: 640px\)[\s\S]*?\.fr-actions\s*\{[\s\S]*?grid-template-columns:\s*1fr;/
    );
  });

  it('nutzt die freie Kachel rechts unten für den Kalendereintrag', async () => {
    const source = await readFile(componentPath, 'utf8');
    const styles = await readFile(stylesPath, 'utf8');
    const resultGridStart = source.indexOf('<dl className="fr-result__grid">');
    const resultGridEnd = source.indexOf('</dl>', resultGridStart);
    const resultGrid = source.slice(resultGridStart, resultGridEnd);

    assert.ok(resultGridStart > 0);
    assert.ok(resultGrid.indexOf("'result.shifted'") > 0);
    assert.ok(resultGrid.indexOf('<CalendarExportTile') > resultGrid.indexOf("'result.shifted'"));
    assert.match(source, /<dt className="fr-calendar-export__action">\s*<PrimaryButton/);
    assert.doesNotMatch(source, /fr-calendar-export__help|calendar\.help\./);
    assert.match(styles, /\.fr-result__grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
    assert.match(styles, /\.fr-result__grid > \.fr-calendar-export\s*\{/);
  });

  it('lokalisiert bestehende Validierungsfehler beim Sprachwechsel neu', async () => {
    const source = await readFile(componentPath, 'utf8');

    assert.match(source, /const validate = \(translationLocale: Locale = locale\): UiValidation/);
    assert.match(source, /setValidation\(current => Object\.keys\(current\)\.length > 0\s*\? validate\(nextLocale\)/);
  });
});
