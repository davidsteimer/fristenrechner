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
const outputDirectory = resolve(repositoryRoot, '.work/ui-preview');

describe('AP9-Browservorschau', () => {
  it('erklärt einen fehlenden Build sichtbar und verwendet relative Assetpfade', async () => {
    const html = await readFile(sourcePath, 'utf8');

    assert.match(html, /data-preview-fallback/);
    assert.match(html, /npm run preview:ui/);
    assert.match(html, /href="\.\/app\.css"/);
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

    assert.equal(outputHtml, await readFile(sourcePath, 'utf8'));
    assert.ok(javascript.size > 0);
    assert.ok(stylesheet.size > 0);
  });
});
