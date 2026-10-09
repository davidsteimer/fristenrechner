// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  AP18C_RELEASE_ID, AP18C_BUILD_REPORT, AP18C_IMPORT_SHA256, AP18C_PINS, AP18C_PROJECTION_IDS,
  prepareAp18cRelease, writeAp18cRelease
} from '../../scripts/build-ap18c-release.mjs';
import { sha256 } from '../../scripts/ap18c-import.mjs';
import { AP18C_REFERENCE } from '../../scripts/ap18-workbook-archive.mjs';
import { evaluateHolidayCatalogRule, projectHolidayRules } from '../../src/core/holidayCatalog.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = path.join(root, 'data/releases/2026-09-12-ap17c-candidate.1');
const prepared = await prepareAp18cRelease(root);
const imported = JSON.parse(await readFile(path.join(root, 'data/candidates/2026-09-22-ap18c-workbook/holiday-candidate.json')));

test('AP18C product candidate is deterministic and checks immutable input identities', async () => {
  const again = await prepareAp18cRelease(root);
  assert.deepEqual(again, prepared);
  assert.equal(prepared.report.inputs.sourceImport, AP18C_IMPORT_SHA256);
  assert.equal(prepared.catalog.provenance.workbook.sha256, AP18C_PINS.workbook);
  for (const [name, bytes] of prepared.files) {
    assert.deepEqual(await readFile(path.join(root, 'data/releases', AP18C_RELEASE_ID, name)), bytes, name);
  }
  assert.deepEqual(JSON.parse(await readFile(path.join(root, AP18C_BUILD_REPORT))), prepared.report);
});

test('AP18C retains all seven normalized arrays, acceptance boundaries and evidence links without blanket approval', async () => {
  for (const key of ['jurisdictions', 'scopes', 'sources', 'rules', 'assignments', 'mappings', 'reviews']) {
    assert.deepEqual(prepared.catalog.data[key], imported.data[key], key);
  }
  assert.deepEqual(prepared.report.counts, {
    jurisdictions: 27, scopes: 49, sources: 84, rules: 479, assignments: 95, mappings: 92, reviews: 90
  });
  assert.deepEqual(prepared.catalog.acceptance, imported.acceptance);
  assert.deepEqual(prepared.catalog.areaSourceLinks, imported.areaSourceLinks);
  assert.equal(prepared.catalog.areaSourceLinks.length, 29);
  assert.deepEqual(prepared.catalog.interpretation, imported.interpretation);
  assert.equal('workbookEvidence' in prepared.catalog, false, 'Raw worksheet cells are archived separately');
  assert.equal('annualOccurrences' in prepared.catalog, false, 'Runtime catalog is rule-based, not a three-year cache');
  const baseline = JSON.parse(await readFile(path.join(base, 'manifest.json')));
  assert.deepEqual(prepared.manifest.sourceSummary, baseline.sourceSummary);
  assert.deepEqual(prepared.manifest.extensions['steimer.candidate'].futureSourceComparison,
    baseline.extensions['steimer.candidate'].futureSourceComparison);
  assert.equal(prepared.manifest.extensions['steimer.candidate'].sourceComponentContractProposal,
    baseline.extensions['steimer.candidate'].componentContractProposal);
  assert.equal('componentContractProposal' in prepared.manifest.extensions['steimer.candidate'], false);
  assert.equal(prepared.catalog.acceptance.runtimeEnabled, false, 'Historical workbook acceptance is not rewritten as runtime approval');
});

test('AP18C projects precisely twelve named CH/BE rules and preserves complete calendar bodies and bytes', async () => {
  const projected = projectHolidayRules(prepared.catalog);
  assert.deepEqual(projected.map(rule => rule.ruleId), AP18C_PROJECTION_IDS);
  for (const descriptor of prepared.manifest.artifacts.filter(artifact => artifact.role === 'calendar')) {
    const bytes = prepared.files.get(descriptor.path);
    assert.deepEqual(bytes, await readFile(path.join(base, descriptor.path)), descriptor.path);
    const calendar = JSON.parse(bytes);
    assert.deepEqual(calendar.rules.filter(rule => rule.effect.type === 'holiday'),
      projected.filter(rule => rule.calendarId === calendar.calendarId));
  }
  const national = JSON.parse(prepared.files.get('calendars/ch-federal-calendar.json'));
  assert.deepEqual(national.rules.filter(rule => rule.effect.type === 'suspensionPeriod').map(rule => rule.ruleId),
    ['CH-CAL-SUSP-EASTER', 'CH-CAL-SUSP-SUMMER', 'CH-CAL-SUSP-YEAR-END']);
  assert.ok(national.rules.filter(rule => rule.effect.type === 'suspensionPeriod')
    .every(rule => rule.effect.suspensionSetId === 'ch-court-holidays'));
});

for (const year of [2026, 2027, 2028]) {
  test(`AP18C independently dates all 479 imported rules for ${year}`, () => {
    const expected = imported.annualOccurrences.filter(item => item.year === year);
    assert.equal(expected.length, 479);
    for (const occurrence of expected) {
      const rule = prepared.catalog.data.rules.find(rule => rule.id === occurrence.ruleId);
      assert.deepEqual(evaluateHolidayCatalogRule(rule, year), { status: occurrence.status, date: occurrence.date }, occurrence.ruleId);
    }
  });
}

test('AP18C has no newly enabled canton, profile or AP17 mapping and remains a candidate', async () => {
  const baseline = JSON.parse(await readFile(path.join(base, 'manifest.json')));
  for (const key of ['profileIds', 'calendarIds', 'specialRegimeCatalogIds', 'coverage']) {
    assert.deepEqual(prepared.manifest[key], baseline[key], key);
  }
  for (const artifact of baseline.artifacts) {
    assert.deepEqual(prepared.files.get(artifact.path), await readFile(path.join(base, artifact.path)), artifact.path);
  }
  assert.equal(prepared.manifest.formatVersion, '4.0.0');
  assert.equal(prepared.manifest.compatibility.minimumConsumerFormatVersion, '4.0.0');
  assert.deepEqual(prepared.manifest.holidayCatalogIds, ['ch-holiday-catalog']);
  assert.equal(prepared.manifest.releaseStatus, 'candidate');
  assert.equal(prepared.manifest.extensions['steimer.candidate'].productionActivation, false);
  assert.equal(prepared.manifest.extensions['steimer.candidate'].humanIntegrationApproval, null);
});

test('AP18C manifest binds every artifact byte and each declared byte length', () => {
  for (const artifact of prepared.manifest.artifacts) {
    const bytes = prepared.files.get(artifact.path);
    assert.equal(sha256(bytes), artifact.sha256, artifact.path);
    assert.equal(bytes.length, artifact.byteLength, artifact.path);
  }
});

test('AP18C candidate writes are idempotent and reject an existing different file before creating new outputs', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'ap18c-release-test-'));
  try {
    await writeAp18cRelease(prepared, temporary);
    await writeAp18cRelease(prepared, temporary);
    const manifestPath = path.join(temporary, 'data/releases', AP18C_RELEASE_ID, 'manifest.json');
    await writeFile(manifestPath, 'deliberately changed test fixture\n');
    await assert.rejects(writeAp18cRelease(prepared, temporary), /Existing AP18C candidate differs/);
    assert.equal(await readFile(manifestPath, 'utf8'), 'deliberately changed test fixture\n');
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('AP18C refuses a changed base manifest even when it could be parseable JSON', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'ap18c-pin-test-'));
  try {
    const inputs = [AP18C_REFERENCE,
      'data/candidates/2026-09-22-ap18c-workbook/holiday-candidate.json',
      'data/candidates/2026-09-22-ap18c-workbook/acceptance.json'];
    for (const id of ['2026-09-12-ap17c-candidate.1', '2026-08-31-mvp-03-approved.1']) {
      const manifestPath = `data/releases/${id}/manifest.json`;
      const manifest = JSON.parse(await readFile(path.join(root, manifestPath)));
      inputs.push(manifestPath, ...manifest.artifacts.map(a => `data/releases/${id}/${a.path}`));
    }
    for (const input of inputs) {
      await mkdir(path.dirname(path.join(temporary, input)), { recursive: true });
      await writeFile(path.join(temporary, input), await readFile(path.join(root, input)));
    }
    const destination = path.join(temporary, 'data/releases/2026-09-12-ap17c-candidate.1');
    await writeFile(path.join(destination, 'manifest.json'), '{}\n');
    await assert.rejects(prepareAp18cRelease(temporary), /Changed pinned input: manifest.json/);
    // All inputs are read-only and no candidate directory was created by preparation.
    await assert.rejects(readFile(path.join(temporary, 'data/releases', AP18C_RELEASE_ID, 'manifest.json')), { code: 'ENOENT' });
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
