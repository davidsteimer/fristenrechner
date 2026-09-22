// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outputDirectory = resolve(repositoryRoot, '.work/public-app');

async function buildCandidate(candidate = '') {
  await execFileAsync(process.execPath, [resolve(repositoryRoot, 'scripts/build-public-app.mjs')], {
    cwd: repositoryRoot,
    env: { ...process.env, FRISTENRECHNER_DATA_CANDIDATE: candidate }
  });
}

describe('Statischer P-Build für MVP 0.4', () => {
  it('erzeugt inhaltsadressierte relative Assets und ein vollständiges Buildmanifest', async () => {
    await buildCandidate();

    const html = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');
    const manifest = JSON.parse(await readFile(resolve(outputDirectory, 'build-manifest.json'), 'utf8'));

    assert.equal(manifest.application, 'fristenrechner-public');
    assert.equal(manifest.version, '0.4.0');
    assert.equal(manifest.dataReleaseId, '2026-09-22-mvp-04-approved.1');
    assert.notEqual(manifest.status, 'candidate');
    assert.equal(manifest.basePath, '/fristenrechner/');
    assert.match(manifest.assets.javascript, /^\.\/assets\/app-[A-Z0-9]+\.js$/);
    assert.match(manifest.assets.stylesheet, /^\.\/assets\/app-[A-Z0-9]+\.css$/);
    assert.match(manifest.assets.vendors.react, /^\.\/assets\/react-[a-f0-9]{12}\.js$/);
    assert.match(manifest.assets.vendors.reactDom, /^\.\/assets\/react-dom-[a-f0-9]{12}\.js$/);
    assert.match(
      manifest.assets.vendors.fluentUiReact,
      /^\.\/assets\/fluent-ui-react-[a-f0-9]{12}\.js$/
    );
    assert.match(html, new RegExp(`src="${manifest.assets.javascript.replace('.', '\\.')}"`));
    assert.match(html, new RegExp(`href="${manifest.assets.stylesheet.replace('.', '\\.')}"`));
    assert.doesNotMatch(html, /\{\{APP_/);
    assert.ok((await stat(resolve(outputDirectory, manifest.assets.javascript))).size > 0);
    assert.ok((await stat(resolve(outputDirectory, manifest.assets.stylesheet))).size > 0);
    assert.ok((await stat(resolve(outputDirectory, manifest.assets.vendors.react))).size > 0);
    assert.ok((await stat(resolve(outputDirectory, manifest.assets.vendors.reactDom))).size > 0);
    assert.ok((await stat(resolve(outputDirectory, manifest.assets.vendors.fluentUiReact))).size > 0);
  });

  it('enthält keine Quellkarten, QA-Presets oder externen Laufzeitprovider', async () => {
    await buildCandidate();

    const files = await readdir(resolve(outputDirectory, 'assets'));
    const javascriptFile = files.find(file => file.endsWith('.js'));
    assert.ok(javascriptFile);
    const javascript = await readFile(resolve(outputDirectory, 'assets', javascriptFile), 'utf8');
    const completeOutput = (await readdir(outputDirectory, { recursive: true })).join('\n');

    assert.doesNotMatch(completeOutput, /\.map$/m);
    assert.doesNotMatch(javascript, /stpo-weekend|vrpg-special-gate|qaPresets/);
    assert.doesNotMatch(javascript, /\bfetch\s*\(|new XMLHttpRequest\b|new WebSocket\b|new EventSource\b/);
    assert.match(javascript, /2026-09-22-mvp-04-approved\.1/);
    assert.ok((await stat(resolve(outputDirectory, 'licenses/react-MIT.txt'))).size > 0);
    assert.ok((await stat(resolve(outputDirectory, 'licenses/react-dom-MIT.txt'))).size > 0);
    assert.ok((await stat(resolve(outputDirectory, 'licenses/fluent-ui-MIT.txt'))).size > 0);
  });

  it('führt kanonische Metadaten, private Anbieterabgrenzung und lokale Assets', async () => {
    await buildCandidate();

    const html = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');
    const javascript = await readFile(
      resolve(
        outputDirectory,
        JSON.parse(await readFile(resolve(outputDirectory, 'build-manifest.json'), 'utf8'))
          .assets.javascript
      ),
      'utf8'
    );

    assert.match(html, /<html lang="de-CH">/);
    assert.match(html, /https:\/\/www\.steimer\.ch\/fristenrechner\//);
    assert.match(html, /href="\.\/favicon\.svg"/);
    assert.match(javascript, /Privates Open-Source-Angebot/);
    assert.match(javascript, /Offre open source priv(?:ée|\\xE9e)/);
    assert.match(javascript, /github\.com\/davidsteimer\/fristenrechner/);
  });

  it('liefert die vorbereiteten Sicherheits- und Cacheregeln aus', async () => {
    await buildCandidate();

    const configuration = await readFile(resolve(outputDirectory, '.htaccess'), 'utf8');

    assert.match(configuration, /Options -Indexes/);
    assert.match(configuration, /Content-Security-Policy/);
    assert.match(configuration, /script-src 'self'/);
    assert.match(configuration, /connect-src 'none'/);
    assert.match(configuration, /object-src 'none'/);
    assert.match(configuration, /X-Content-Type-Options "nosniff"/);
    assert.match(configuration, /Referrer-Policy "strict-origin-when-cross-origin"/);
    assert.match(configuration, /Cache-Control "no-cache, no-store, must-revalidate"/);
    assert.match(configuration, /Cache-Control "public, max-age=31536000, immutable"/);
  });

  for (const candidate of ['ap17c', 'ap18c']) {
    it(`hält den historischen ${candidate}-Prüfkandidaten vom normalen Releasebuild getrennt`, async () => {
      await buildCandidate(candidate);
      const candidateDirectory = resolve(repositoryRoot, `.work/public-${candidate}`);
      const manifest = JSON.parse(await readFile(resolve(candidateDirectory, 'build-manifest.json'), 'utf8'));
      const javascript = await readFile(resolve(candidateDirectory, manifest.assets.javascript), 'utf8');
      assert.equal(manifest.version, `${candidate}-local-candidate`);
      assert.equal(manifest.dataReleaseId, candidate === 'ap18c'
        ? '2026-09-22-ap18c-candidate.1' : '2026-09-12-ap17c-candidate.1');
      assert.equal(manifest.status, 'candidate');
      assert.equal(manifest.deployable, false);
      assert.ok(javascript.includes(manifest.dataReleaseId));
      assert.doesNotMatch(javascript, /2026-09-22-mvp-04-approved\.1/);
      const approvedManifest = JSON.parse(await readFile(resolve(outputDirectory, 'build-manifest.json'), 'utf8'));
      assert.equal(approvedManifest.version, '0.4.0');
      assert.equal(approvedManifest.dataReleaseId, '2026-09-22-mvp-04-approved.1');
    });
  }

  it('weist unbekannte Kandidaten zurück, statt einen anderen Datenstand zu bauen', async () => {
    await assert.rejects(buildCandidate('unrecognised'), /Unbekannter lokaler Datenkandidat/);
  });
});
