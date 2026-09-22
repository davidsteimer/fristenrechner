// SPDX-License-Identifier: AGPL-3.0-only
// Local data promotion only. This command neither publishes nor activates a release.
// Run with node --import tsx using the repository's Python validation environment.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, lstat, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson, sha256 } from './ap18c-import.mjs';
import { createCalculationData } from '../src/core/data.ts';

export const MVP04_RELEASE_ID = '2026-09-22-mvp-04-approved.1';
export const MVP04_PROMOTION_REPORT = 'outputs/release-mvp04-2026-09-22/data-promotion.json';
export const AP18C_CANDIDATE_ID = '2026-09-22-ap18c-candidate.1';
export const AP18C_CANDIDATE_MANIFEST_SHA256 = 'be1bf547e085032f505e71d0d12b891436b2e9a9ec0b67cc33b711f32d5906b7';
export const MVP04_METADATA_PATHS = Object.freeze(['review', 'scope']);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const specialPath = 'special-regimes/vrpg-be.json';
const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
const approvedOn = '2026-09-22';

function calculationRelease(manifest, files) {
  return {
    releaseId: manifest.releaseId, formatVersion: manifest.formatVersion,
    coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
    profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
    specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
    holidayCatalogIds: manifest.holidayCatalogIds,
    artifacts: manifest.artifacts.map(descriptor => ({
      descriptor, parsed: JSON.parse(files.get(descriptor.path))
    }))
  };
}

export async function prepareMvp04Promotion(root = repositoryRoot) {
  const source = path.join(root, 'data/releases', AP18C_CANDIDATE_ID);
  const manifestBytes = await readFile(path.join(source, 'manifest.json'));
  assert.equal(sha256(manifestBytes), AP18C_CANDIDATE_MANIFEST_SHA256, 'Changed pinned AP18C manifest');
  const candidate = JSON.parse(manifestBytes);
  assert.equal(candidate.releaseId, AP18C_CANDIDATE_ID);
  assert.equal(candidate.releaseStatus, 'candidate');
  assert.equal(candidate.formatVersion, '4.0.0');
  assert.equal(candidate.immutable, true);
  assert.equal(candidate.compatibility.minimumConsumerFormatVersion, '4.0.0');
  assert.equal(candidate.coverage.to, null);
  assert.equal(candidate.artifacts.length, 9);
  const files = new Map();
  for (const descriptor of candidate.artifacts) {
    assert.ok(!path.isAbsolute(descriptor.path) && !descriptor.path.split('/').includes('..'), 'Unsafe artifact path');
    const file = path.join(source, descriptor.path);
    assert.ok((await lstat(file)).isFile(), `Not a regular artifact: ${descriptor.path}`);
    const bytes = await readFile(file);
    assert.equal(sha256(bytes), descriptor.sha256, `Changed pinned artifact: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength, `Changed artifact length: ${descriptor.path}`);
    files.set(descriptor.path, bytes);
  }
  createCalculationData(calculationRelease(candidate, files));

  const specialBefore = JSON.parse(files.get(specialPath));
  assert.equal(specialBefore.review.status, 'candidate');
  const specialAfter = {
    ...specialBefore,
    review: {
      reviewedOn: approvedOn,
      status: 'verified',
      reviewedBy: 'David Steimer',
      basis: 'AP17C fachlich abgenommen und Spezialregimekatalog 3.0.0 als technischer Produktvertrag bestätigt. AP18C am 22. September 2026 abgenommen und Releasevorbereitung beauftragt. Diese Implementierungs- und Datenabnahme ist keine erneute juristische Quellenprüfung und keine Publikations- oder Betriebsfreigabe.'
    },
    scope: {
      de: 'MVP 0.4: bisherige politische Regime und 16 begrenzte IVG-, AHVG-, UVG- und bernische Beschaffungszuordnungen. Neue Fallabdeckung 2026 bis 2027. Keine weiteren Zuordnungen oder kantonalen Verfahrensprofile.',
      fr: 'MVP 0.4 : régimes politiques existants et 16 rattachements limités LAI, LAVS, LAA et marchés publics bernois. Nouveaux cas couverts de 2026 à 2027. Aucun autre rattachement ni profil de procédure cantonal.'
    }
  };
  const withoutMetadata = document => Object.fromEntries(Object.entries(document)
    .filter(([key]) => !MVP04_METADATA_PATHS.includes(key)));
  assert.deepEqual(withoutMetadata(specialAfter), withoutMetadata(specialBefore), 'Promotion must not change AP17 legal data');
  files.set(specialPath, Buffer.from(canonicalJson(specialAfter)));
  const artifacts = candidate.artifacts.map(artifact => {
    const bytes = files.get(artifact.path);
    return { ...artifact, byteLength: bytes.length, sha256: sha256(bytes) };
  });
  const humanApproval = {
    approvedOn, approvedBy: 'David Steimer', approvalType: 'human', workPackage: 'AP18C',
    basis: 'AP18C ist abgenommen. Starten wir den Release.'
  };
  const manifest = {
    ...candidate, releaseId: MVP04_RELEASE_ID, releaseStatus: 'approved', createdOn: approvedOn,
    extensions: {
      ...candidate.extensions,
      // Preserve the existing validated location of the future-version comparison.
      // Its historical date and source IDs must not become a new source review.
      'steimer.candidate': {
        ...candidate.extensions['steimer.candidate'],
        approvalRequired: false, humanIntegrationApproval: humanApproval,
        promotedToReleaseId: MVP04_RELEASE_ID, productionActivation: false
      },
      'steimer.approval': {
        ...humanApproval, approvalScope: 'mvp04DataAndImplementation',
        workPackages: ['AP17', 'AP18C'], decision: 'DEC-2026-023',
        candidateReleaseId: AP18C_CANDIDATE_ID,
        candidateManifestSha256: AP18C_CANDIDATE_MANIFEST_SHA256,
        baseReleaseId: '2026-08-31-mvp-03-approved.1',
        sourceReviewDatesUnchanged: true,
        catalogApprovalScope: 'Historische gegenstandsbezogene Fachabnahmen unverändert. Keine pauschale Quellen-, Übersetzungs- oder Verfahrensfreigabe.'
      },
      'steimer.release-preparation': {
        preparedOn: approvedOn, appVersion: '0.4.0',
        sourceRefresh: 'separateReleaseGate', publicationApproved: false,
        deploymentApproved: false, productionActivation: false,
        operatingApproval: 'requiresSeparateDecision'
      }
    },
    artifacts
  };
  createCalculationData(calculationRelease(manifest, files));
  assert.deepEqual(manifest.sourceSummary, candidate.sourceSummary, 'Source summary is historical, not refreshed by promotion');
  const catalogDescriptor = artifacts.find(artifact => artifact.path === catalogPath);
  assert.deepEqual(catalogDescriptor, candidate.artifacts.find(artifact => artifact.path === catalogPath));
  files.set('manifest.json', Buffer.from(canonicalJson(manifest)));
  const report = {
    kind: 'mvp04LocalDataPromotion', releaseId: MVP04_RELEASE_ID,
    preparedOn: approvedOn, dataStatus: 'approved', implementationAccepted: true,
    publicationApproved: false, deploymentApproved: false, productionActivation: false,
    sourceRefresh: 'separateReleaseGate', candidateReleaseId: AP18C_CANDIDATE_ID,
    candidateManifestSha256: AP18C_CANDIDATE_MANIFEST_SHA256,
    manifestSha256: sha256(files.get('manifest.json')),
    unchangedArtifacts: artifacts.filter(artifact => artifact.sha256 === candidate.artifacts.find(before => before.path === artifact.path).sha256)
      .map(artifact => artifact.path),
    metadataOnlyChanges: [{
      path: specialPath, fields: MVP04_METADATA_PATHS,
      beforeSha256: candidate.artifacts.find(artifact => artifact.path === specialPath).sha256,
      afterSha256: artifacts.find(artifact => artifact.path === specialPath).sha256,
      legalContentUnchanged: true, sourceReviewDatesUnchanged: true
    }],
    holidayCatalog: { path: catalogPath, sha256: catalogDescriptor.sha256, byteLength: catalogDescriptor.byteLength, rules: 479 },
    validation: { core: 'passed', python: 'requiredBeforeWrite' }
  };
  const readme = `# MVP 0.4: lokal vorbereiteter Datenrelease\n\n` +
    `Status: **Daten und Implementierung abgenommen, Publikation und Betrieb noch nicht freigegeben.**\n\n` +
    `David Steimer hat AP18C am 22. September 2026 abgenommen und den Releaseprozess gestartet. Dieser neue, unveränderliche Datenstand \`${MVP04_RELEASE_ID}\` setzt diese Abnahme um. Er ist keine Bestätigung einer neuen juristischen Quellenprüfung. Der separate Release-Quellencheck, die Veröffentlichung und die Freigaben für Installation und Betrieb bleiben eigene Schritte.\n\n` +
    `## Vertrag und Herkunft\n\n` +
    `- App-Zielversion \`0.4.0\`, Manifest und Mindestconsumer \`4.0.0\`. Diese Versionen bezeichnen unterschiedliche Verträge.\n` +
    `- Ausgangskandidat [${AP18C_CANDIDATE_ID}](../${AP18C_CANDIDATE_ID}/README.md), Manifest-SHA-256 \`${AP18C_CANDIDATE_MANIFEST_SHA256}\`.\n` +
    `- Neun Artefakte. Acht bleiben byteidentisch. Nur die Felder \`review\` und \`scope\` des AP17-Spezialregimekatalogs bilden nun den abgenommenen Stand ab. Fachregeln und historische Quellenprüfungen bleiben unverändert.\n` +
    `- Alle 479 Feiertagsregeln bleiben byteidentisch erhalten. Operativ wirken weiterhin nur die zwölf bestehenden CH-/BE-Feiertagsregeln und die drei Gerichtsferienregeln. Keine neuen kantonalen Fristenprofile.\n` +
    `- Historische Arbeitsstatus, Fachabnahmen und provisorische Übersetzungen des Feiertagskatalogs bleiben erhalten. Eine technische Datenfreigabe ist keine pauschale juristische Freigabe dieser Einträge.\n\n` +
    `## Nachvollziehbare Metadaten\n\n` +
    `Die Manifest-Erweiterung \`steimer.approval\` dokumentiert die menschliche Daten- und Implementierungsabnahme. \`steimer.release-preparation\` weist die weiterhin ausstehenden Publikations-, Deployment- und Betriebsfreigaben aus. \`steimer.candidate\` bleibt als Herkunftsnachweis und für den unveränderten Zukunftsquellenvergleich bestehen. Dort ist die AP18C-Abnahme eingetragen, die Aktivierung bleibt ausdrücklich falsch. Die Quellenzusammenfassung wurde nicht nachdatiert.\n\n` +
    `## Reproduktion und Bereitstellungsgrenze\n\n` +
    `\`node --import tsx scripts/promote-ap18c-release.mjs\` prüft den hash-gebundenen Kandidaten, die Fachdatenidentität, den Rechenkern und den unabhängigen Python-Prüfer vor dem Schreiben. Abweichende bestehende Ausgaben werden nicht überschrieben. Ein zweiter Lauf muss identische Bytes bestätigen.\n\n` +
    `Der [Promotionsnachweis](../../../outputs/release-mvp04-2026-09-22/data-promotion.json) enthält alle relevanten Hashes und das begrenzte Artefaktdelta. Ein Format-4-fähiger Consumer muss vor dem Wechsel des vollständigen Feeds oder Mirrors bereitstehen. Dieser Ordner und sein Manifest lösen keine automatische Bereitstellung aus.\n`;
  files.set('README.md', Buffer.from(readme));
  return { manifest, report, files };
}

function pythonValidate(directory) {
  const validation = spawnSync(path.join(repositoryRoot, '.venv/bin/python'),
    [path.join(repositoryRoot, 'tests/data/validate_release.py'), directory],
    { cwd: repositoryRoot, encoding: 'utf8' });
  assert.equal(validation.status, 0, `Independent release validation failed:\n${validation.stderr || validation.error || validation.stdout}`);
  return validation.stdout.trim();
}

export async function validateMvp04Promotion(prepared, root = repositoryRoot) {
  const candidateResult = pythonValidate(path.join(root, 'data/releases', AP18C_CANDIDATE_ID));
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'fristenrechner-mvp04-validation-'));
  const stagedRelease = path.join(temporary, MVP04_RELEASE_ID);
  try {
    for (const [name, bytes] of prepared.files) {
      await mkdir(path.dirname(path.join(stagedRelease, name)), { recursive: true });
      await writeFile(path.join(stagedRelease, name), bytes, { flag: 'wx' });
    }
    const approvedResult = pythonValidate(stagedRelease);
    return { ...prepared, report: {
      ...prepared.report, validation: { core: 'passed', python: 'passed', candidateResult, approvedResult }
    } };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function writeMvp04Promotion(prepared, root = repositoryRoot) {
  assert.equal(prepared.report.validation.python, 'passed', 'Independent Python validation must pass before writing');
  assert.ok(prepared.files.get('manifest.json').equals(Buffer.from(canonicalJson(prepared.manifest))), 'Prepared manifest changed after validation');
  assert.equal(sha256(prepared.files.get('manifest.json')), prepared.report.manifestSha256, 'Prepared manifest identity changed after validation');
  for (const artifact of prepared.manifest.artifacts) {
    const bytes = prepared.files.get(artifact.path);
    assert.equal(sha256(bytes), artifact.sha256, `Prepared artifact changed after validation: ${artifact.path}`);
    assert.equal(bytes.length, artifact.byteLength, `Prepared artifact length changed after validation: ${artifact.path}`);
  }
  const destination = path.join(root, 'data/releases', MVP04_RELEASE_ID);
  const outputs = [...prepared.files].map(([name, bytes]) => [path.join(destination, name), bytes]);
  outputs.push([path.join(root, MVP04_PROMOTION_REPORT), Buffer.from(canonicalJson(prepared.report))]);
  for (const [file, bytes] of outputs) {
    try {
      assert.ok((await lstat(file)).isFile(), `Not a regular release output: ${path.basename(file)}`);
      assert.ok((await readFile(file)).equals(bytes), `Existing MVP04 release differs: ${path.basename(file)}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const [file, bytes] of outputs) {
    await mkdir(path.dirname(file), { recursive: true });
    try { await writeFile(file, bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readFile(file)).equals(bytes), `MVP04 readback differs: ${path.basename(file)}`);
  }
  return prepared.report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'This command takes no overwrite, publication or deployment arguments');
  console.log(JSON.stringify(await writeMvp04Promotion(await validateMvp04Promotion(await prepareMvp04Promotion())), null, 2));
}
