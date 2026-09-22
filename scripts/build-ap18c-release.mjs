// SPDX-License-Identifier: AGPL-3.0-only
// Run with node --import tsx. Writes only the new, explicitly non-approved candidate.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson, sha256 } from './ap18c-import.mjs';
import { AP18C_REFERENCE } from './ap18-workbook-archive.mjs';
import {
  assertHolidayCatalog, assertHolidayCatalogProjection, projectHolidayRules,
  evaluateHolidayCatalogRule
} from '../src/core/holidayCatalog.ts';

export const AP18C_RELEASE_ID = '2026-09-22-ap18c-candidate.1';
export const AP18C_BUILD_REPORT = 'outputs/ap18c-product-2026-09-22/build-verification.json';
export const AP18C_IMPORT_SHA256 = '9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099';
export const AP18C_PINS = Object.freeze({
  ap17cManifest: 'e13a5cc8887bb6f16572d87729728511d71b8048690e2ef514c0194f21c61b90',
  approvedManifest: '74583fa4dc9cab8ed99af3f9202782d90b02e9e47578f1dd9d2da40d19357be8',
  workbook: 'd4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65',
  acceptance: '3d97ec7ce4c02d712761569b0836fdf342552f7e12800034b1bc837adbed54cf'
});
export const AP18C_PROJECTION_IDS = Object.freeze([
  'CH-CAL-HOL-NATIONAL-DAY', 'BE-CAL-HOL-NEW-YEAR', 'BE-CAL-HOL-BERCHTOLD-DAY',
  'BE-CAL-HOL-GOOD-FRIDAY', 'BE-CAL-HOL-EASTER', 'BE-CAL-HOL-EASTER-MONDAY',
  'BE-CAL-HOL-ASCENSION', 'BE-CAL-HOL-PENTECOST', 'BE-CAL-HOL-WHIT-MONDAY',
  'BE-CAL-HOL-FEDERAL-FAST', 'BE-CAL-HOL-CHRISTMAS', 'BE-CAL-HOL-ST-STEPHEN'
]);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const ap17cId = '2026-09-12-ap17c-candidate.1';
const approvedId = '2026-08-31-mvp-03-approved.1';
const importDirectory = 'data/candidates/2026-09-22-ap18c-workbook';
const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
const schemaId = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/holiday-catalog-v1.schema.json';

async function pinnedBytes(file, expected) {
  const bytes = await readFile(file);
  assert.equal(sha256(bytes), expected, `Changed pinned input: ${path.basename(file)}`);
  return bytes;
}

async function verifiedRelease(root, id, manifestSha256) {
  const directory = path.join(root, 'data/releases', id);
  const manifest = JSON.parse(await pinnedBytes(path.join(directory, 'manifest.json'), manifestSha256));
  const artifacts = new Map();
  for (const descriptor of manifest.artifacts) {
    assert.ok(!path.isAbsolute(descriptor.path) && !descriptor.path.split('/').includes('..'), 'Unsafe pinned artifact path');
    const bytes = await pinnedBytes(path.join(directory, descriptor.path), descriptor.sha256);
    assert.equal(bytes.length, descriptor.byteLength, `Artifact length changed: ${descriptor.path}`);
    artifacts.set(descriptor.path, bytes);
  }
  return { manifest, artifacts };
}

export async function prepareAp18cRelease(root = repositoryRoot) {
  // All provenance gates are checked before any target file is created.
  const [ap17c, approved, importBytes, acceptanceBytes, workbookBytes] = await Promise.all([
    verifiedRelease(root, ap17cId, AP18C_PINS.ap17cManifest),
    verifiedRelease(root, approvedId, AP18C_PINS.approvedManifest),
    pinnedBytes(path.join(root, importDirectory, 'holiday-candidate.json'), AP18C_IMPORT_SHA256),
    pinnedBytes(path.join(root, importDirectory, 'acceptance.json'), AP18C_PINS.acceptance),
    pinnedBytes(path.join(root, AP18C_REFERENCE), AP18C_PINS.workbook)
  ]);
  const imported = JSON.parse(importBytes);
  assert.deepEqual(imported.acceptance, JSON.parse(acceptanceBytes), 'Acceptance differs from pinned import');
  assert.equal(imported.source.sha256, AP18C_PINS.workbook);
  assert.equal(imported.source.byteLength, workbookBytes.length);
  assert.equal(imported.runtimeEnabled, false, 'The source import is evidence, not an approved runtime release');
  const approvedCalendars = approved.manifest.artifacts.filter(a => a.role === 'calendar')
    .map(a => JSON.parse(approved.artifacts.get(a.path)));
  const calendarProjections = AP18C_PROJECTION_IDS.map(ruleId => {
    const rules = approvedCalendars.flatMap(c => c.rules).filter(r => r.ruleId === ruleId && r.effect.type === 'holiday');
    assert.equal(rules.length, 1, `Missing or duplicate approved projection metadata: ${ruleId}`);
    const rule = rules[0];
    // Only product metadata comes from the old calendar. Dates, labels, validity,
    // source references and jurisdiction are derived by projectHolidayRules.
    return {
      catalogRuleId: ruleId, calendarId: rule.calendarId, ruleId, labelKey: rule.labelKey,
      kind: rule.effect.kind, resultIdSuffix: rule.effect.resultIdSuffix,
      legalEffect: 'nonWorkingDayEquivalentToSunday', approvalBasis: approvedId
    };
  });
  const catalog = {
    $schema: schemaId, formatVersion: '1.0.0', dataKind: 'holidayCatalog', catalogId: 'ch-holiday-catalog',
    provenance: { workbook: imported.source, importSha256: AP18C_IMPORT_SHA256, decision: 'DEC-2026-023' },
    acceptance: imported.acceptance, data: imported.data, areaSourceLinks: imported.areaSourceLinks,
    interpretation: imported.interpretation, calendarProjections
  };
  assertHolidayCatalog(catalog);
  const derived = projectHolidayRules(catalog);
  assert.equal(derived.length, 12);
  const actualCalendars = ap17c.manifest.artifacts.filter(a => a.role === 'calendar')
    .map(a => JSON.parse(ap17c.artifacts.get(a.path)));
  assertHolidayCatalogProjection(catalog, actualCalendars);
  assertHolidayCatalogProjection(catalog, approvedCalendars);
  for (const calendar of actualCalendars) {
    const projected = { ...calendar, rules: calendar.rules.map(rule => rule.effect.type === 'holiday'
      ? derived.find(replacement => replacement.ruleId === rule.ruleId) : rule) };
    assert.deepEqual(projected, calendar, `Catalog projection changes operative calendar: ${calendar.calendarId}`);
  }
  // Retaining byte-identical original calendar serialization is allowed only after
  // full-object projection parity, including all field values, has been proved.
  const files = new Map(ap17c.artifacts);
  const catalogBytes = Buffer.from(canonicalJson(catalog));
  files.set(catalogPath, catalogBytes);
  for (const expected of imported.annualOccurrences) {
    const rule = catalog.data.rules.find(rule => rule.id === expected.ruleId);
    assert.ok(rule, `Missing imported rule: ${expected.ruleId}`);
    assert.deepEqual(evaluateHolidayCatalogRule(rule, expected.year), {
      status: expected.status, date: expected.date
    }, `Annual occurrence differs from workbook import: ${expected.ruleId}/${expected.year}`);
  }
  const sourceCandidateMetadata = Object.fromEntries(Object.entries(ap17c.manifest.extensions['steimer.candidate'])
    .map(([key, value]) => [key === 'componentContractProposal' ? 'sourceComponentContractProposal' : key, value]));
  const manifest = {
    ...ap17c.manifest, formatVersion: '4.0.0', releaseId: AP18C_RELEASE_ID,
    releaseStatus: 'candidate', createdOn: '2026-09-22', holidayCatalogIds: [catalog.catalogId],
    compatibility: { ...ap17c.manifest.compatibility, minimumConsumerFormatVersion: '4.0.0' },
    // sourceSummary deliberately retains only the operative, previously reviewed
    // legal sources. The catalog's historical reviews are not blanket approvals.
    sourceSummary: ap17c.manifest.sourceSummary,
    extensions: {
      ...ap17c.manifest.extensions,
      'steimer.candidate': {
        ...sourceCandidateMetadata,
        preparedOn: '2026-09-22', preparedWith: 'Codex', workPackage: 'AP18C',
        approvalRequired: true, baseReleaseId: ap17cId, approvedReferenceReleaseId: approvedId,
        sourceImportSha256: AP18C_IMPORT_SHA256, workbookSha256: AP18C_PINS.workbook,
        componentContractDecision: 'DEC-2026-023',
        scope: 'Schweizweiter Feiertagskatalog, zwölf operative CH-/BE-Projektionen, AP17C unverändert. Keine neuen kantonalen Fristenprofile.',
        sourceSummaryScope: 'Operative Rechtsprofile, Kalender und AP17-Spezialregime. Keine pauschale Verifikation der Katalogquellen, Übersetzungen oder Verfahrensbezüge.',
        humanIntegrationApproval: null, productionActivation: false
      }
    },
    artifacts: [...ap17c.manifest.artifacts, {
      path: catalogPath, role: 'holidayCatalog', contentId: catalog.catalogId, schemaId,
      mediaType: 'application/json', byteLength: catalogBytes.length, sha256: sha256(catalogBytes)
    }]
  };
  const report = {
    kind: 'ap18cCandidateBuildVerification', releaseId: AP18C_RELEASE_ID, status: 'passed',
    releaseStatus: 'candidate', productionActivation: false,
    inputs: { ...AP18C_PINS, sourceImport: AP18C_IMPORT_SHA256 },
    counts: Object.fromEntries(Object.entries(catalog.data).map(([key, entries]) => [key, entries.length])),
    areaSourceLinks: catalog.areaSourceLinks.length, catalogProjections: derived.length,
    annualComparisons: imported.annualOccurrences.length,
    unchangedAp17cArtifacts: ap17c.manifest.artifacts.length,
    catalogByteLength: catalogBytes.length, catalogSha256: sha256(catalogBytes),
    unchangedOperativeCalendarIds: actualCalendars.map(calendar => calendar.calendarId),
    sourceSummaryScope: 'Only operative sources, unchanged from AP17C. Catalog source reviews retain their individual scope and status.'
  };
  files.set('manifest.json', Buffer.from(canonicalJson(manifest)));
  return { manifest, catalog, report, files };
}

export async function writeAp18cRelease(prepared, root = repositoryRoot) {
  const target = path.join(root, 'data/releases', AP18C_RELEASE_ID);
  const destinations = [...prepared.files].map(([name, bytes]) => [path.join(target, name), bytes]);
  // The strict release inventory allows only manifest-declared JSON artifacts.
  // The build report is evidence outside the distributable release directory.
  destinations.push([path.join(root, AP18C_BUILD_REPORT), Buffer.from(canonicalJson(prepared.report))]);
  // Preflight all existing destinations. Never repair a candidate by overwriting it.
  for (const [file, bytes] of destinations) {
    try {
      assert.ok((await lstat(file)).isFile(), `Candidate is not a regular file: ${path.basename(file)}`);
      assert.ok((await readFile(file)).equals(bytes), `Existing AP18C candidate differs: ${path.basename(file)}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  for (const [file, bytes] of destinations) {
    await mkdir(path.dirname(file), { recursive: true });
    try { await writeFile(file, bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readFile(file)).equals(bytes), `AP18C candidate readback differs: ${path.basename(file)}`);
  }
  return prepared.report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'This builder takes no promotion, overwrite or deployment arguments');
  console.log(JSON.stringify(await writeAp18cRelease(await prepareAp18cRelease()), null, 2));
}
