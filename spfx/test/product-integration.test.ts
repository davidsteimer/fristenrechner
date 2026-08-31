// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import test from 'node:test';

import { ReleaseValidator } from '../src/core/ReleaseValidator';
import { PINNED_GITHUB_RELEASE_URL } from '../src/core/config';
import type { IReleaseProvider } from '../src/core/types';
import {
  calculateDeadline,
  calculateSpecialDeadline,
  createCalculationData
} from '../src/product/core';

const PROJECT_ROOT = process.cwd();
const REPOSITORY_ROOT = resolve(PROJECT_ROOT, '..');
const RELEASE_ROOT = resolve(
  REPOSITORY_ROOT,
  'data',
  'releases',
  '2026-08-31-mvp-02-approved.1'
);

const EXPECTED_PINNED_RELEASE_URL =
  'https://raw.githubusercontent.com/davidsteimer/fristenrechner/bd7c148741626de168af72fa5273dc5fdf24b923/data/releases/2026-08-31-mvp-02-approved.1';

class DirectoryProvider implements IReleaseProvider {
  public readonly id = 'fixture:ap11c';
  public readonly kind = 'github' as const;

  public async fetchBytes(relativePath: string): Promise<Uint8Array> {
    return new Uint8Array(await readFile(resolve(RELEASE_ROOT, relativePath)));
  }
}

test('pinnt den MVP-0.2-Datenrelease auf den freigegebenen Git-Commit', () => {
  assert.equal(PINNED_GITHUB_RELEASE_URL, EXPECTED_PINNED_RELEASE_URL);
});

async function productSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.flatMap(entry => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'preview' ? [] : [productSourceFiles(path)];
    }
    return ['.ts', '.tsx', '.css'].includes(extname(entry.name)) ? [Promise.resolve([path])] : [];
  }));
  return nested.flat().sort();
}

test('verbindet den validierten Release mit dem produktiven Rechenkern', async () => {
  const release = await new ReleaseValidator().validateProvider(new DirectoryProvider());
  const data = createCalculationData(release);
  const result = calculateDeadline({
    profileId: 'stpo',
    inputDate: '2026-09-16',
    inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
    deadlineDays: 10,
    calendarId: 'be-public-holidays',
    selectors: { deliveryMethod: 'otherLegallyRelevantDate' },
    confirmations: {
      holidayAnchorConfirmed: true,
      deliveryFictionApplicabilityConfirmed: false,
      specialLawChecked: false
    },
    holidayAnchorCandidates: ['BE']
  }, data);

  assert.equal(data.releaseId, '2026-08-31-mvp-02-approved.1');
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.finalEnd, '2026-09-28');
});

test('verbindet den Format-2-Release mit der Spezialregimeberechnung', async () => {
  const release = await new ReleaseValidator().validateProvider(new DirectoryProvider());
  const data = createCalculationData(release);
  const result = calculateSpecialDeadline({
    profileId: 'vrpg-be',
    regimeId: 'vrpg-be-general',
    ruleId: 'VRPGBE-SPEC-REL-GENERAL-001',
    dateValues: { eventDate: '2026-09-04' },
    localTimeValues: {},
    integerValues: { deadlineDays: 10 },
    calendarProfileId: 'C_BE',
    suspensionProfileId: 'S0_NONE',
    filingProfileId: 'F1_DISPATCH',
    overrideConfirmations: []
  }, data);

  assert.equal(data.specialRegimeCatalogs.size, 1);
  assert.equal(result.outcome, 'calculated');
  assert.equal(result.finalDeadline?.date, '2026-09-14');
  assert.equal(result.filingRequirement?.preservationMode, 'dispatch');
});

test('exponiert dasselbe WebPart in SharePoint und Teams ohne zusätzliche API-Freigabe', async () => {
  const manifest = JSON.parse(await readFile(
    resolve(PROJECT_ROOT, 'src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json'),
    'utf8'
  ));
  const packageSolution = JSON.parse(await readFile(
    resolve(PROJECT_ROOT, 'config/package-solution.json'),
    'utf8'
  ));

  assert.deepEqual(manifest.supportedHosts, ['SharePointWebPart', 'TeamsTab']);
  assert.equal(manifest.id, '596c7f1c-4d3e-4da8-a7be-27a96024f37c');
  assert.equal(packageSolution.solution.includeClientSideAssets, true);
  assert.equal(packageSolution.solution.version, '0.2.0.0');
  assert.equal('webApiPermissionRequests' in packageSolution.solution, false);
});

test('synchronisiert nur die produktiven Kern- und UI-Quellen', async () => {
  const sourceRoot = resolve(REPOSITORY_ROOT, 'src');
  const productRoot = resolve(PROJECT_ROOT, 'src/product');
  const sourceFiles = [
    ...await productSourceFiles(resolve(sourceRoot, 'core')),
    ...await productSourceFiles(resolve(sourceRoot, 'ui'))
  ];
  const generatedFiles = await productSourceFiles(productRoot);
  const expectedPaths = sourceFiles.map(path => relative(sourceRoot, path)).sort();
  const generatedPaths = generatedFiles.map(path => relative(productRoot, path)).sort();

  assert.deepEqual(generatedPaths, expectedPaths);
  await Promise.all(expectedPaths.map(async path => {
    assert.deepEqual(
      await readFile(resolve(productRoot, path)),
      await readFile(resolve(sourceRoot, path)),
      `Synchronisierte Quelle weicht ab: ${path}`
    );
  }));
});

test('bindet die Produkt-CSS im SPFx-Host ohne lokalisierte fr-Klassennamen ein', async () => {
  const productCss = await readFile(resolve(PROJECT_ROOT, 'src/product/ui/styles.css'), 'utf8');
  const moduleScss = await readFile(resolve(PROJECT_ROOT, 'src/product/ui/styles.module.scss'), 'utf8');

  assert.equal(moduleScss, `:global {\n${productCss}\n}\n`);
  assert.match(moduleScss, /\.fr-actions\s*>\s*\*/);
});
