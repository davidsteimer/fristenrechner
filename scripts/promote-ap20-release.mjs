// SPDX-License-Identifier: AGPL-3.0-only
// Controlled local promotion only. No push, deployment or production activation.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile, lstat, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCalculationData } from '../src/core/data.ts';
import { assertSocialProcedureCatalog, socialObjectSha256 } from '../src/core/socialCatalog.ts';
import { verifyMvp06SourceApproval } from './verify-mvp06-source-approval.mjs';
import { assertSafeEvidencePath, prepareMvp06Inputs, outputPath as snapshotPath } from './prepare-mvp06-inputs.mjs';

export const MVP06_RELEASE_ID = '2026-10-01-mvp-06-approved.1';
export const MVP06_PROMOTION_REPORT = 'outputs/release-mvp06-2026-10-01/data-promotion.json';
export const AP20C3_CANDIDATE_PATH = 'data/candidates/2026-10-01-ap20c3';
export const AP20C3_CANDIDATE_MANIFEST_SHA256 = 'b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450';
export const MVP06_SOURCE_APPROVAL_PATH = 'outputs/release-mvp06-2026-10-01/source-approval.json';
export const MVP06_SOURCE_APPROVAL_SHA256 = '10f43005757c54a445f009d702b17a37f04e2dad530241201dbf6c4eebfc2cbb';
export const MVP06_DECISION_PATH = 'docs/fachrecht/abnahme-quellen-mvp06.md';
export const MVP06_REVIEW_PATH = 'outputs/release-mvp06-2026-10-01/source-review-completeness.json';
export const MVP06_REVIEW_SHA256 = 'a389456a87f57e595818c76852360162daab58cc772fda82ae8de8100225c7bb';
export const MVP06_REFERENCE_SUITES = Object.freeze({
  'AP17B-ANWENDBARKEIT': { path: 'tests/golden/candidates/ap17b-anwendbarkeit.json', sha256: 'd180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47' },
  'AP19B-SOCIAL-REFERENCES-1': { path: 'tests/golden/candidates/ap19b-social-deadlines.json', sha256: 'da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8' },
  'AP20B-SOCIAL-DATES-1': { path: 'tests/golden/candidates/ap20b-social-dates.json', sha256: '9740ce84883a54beec81f2f8a6cb1c450d690c9b6f440c5841d5821dfad16fa3' }
});
const root = fileURLToPath(new URL('../', import.meta.url));
const socialPath = 'social-procedures/ch-social-procedures.json';
const approvedOn = '2026-10-01';
export const mvp06Sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const without = (object, keys) => Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
const priorReleasePath = 'data/releases/2026-09-28-mvp-05-approved.1';
function assertSafeArtifactPath(relative) {
  assert.equal(typeof relative, 'string');
  assert.ok(relative.length > 0 && !path.isAbsolute(relative));
  assertSafeEvidencePath(`${AP20C3_CANDIDATE_PATH}/${relative}`);
}

async function readRegular(repository, relative) {
  assertSafeEvidencePath(relative);
  const parts = relative.split('/');
  for (let index = 0; index < parts.length; index++) {
    const selected = parts.slice(0, index + 1).join('/');
    const stat = await lstat(path.resolve(repository, selected));
    assert.ok(!stat.isSymbolicLink() && (index === parts.length - 1 ? stat.isFile() : stat.isDirectory()), `Not regular promotion evidence: ${selected}`);
  }
  return readFile(path.resolve(repository, relative));
}

export function assertMvp06PromotionDelta(before, catalog, previous) {
  assert.equal(before.formatVersion, '2.0.0');
  assert.equal(catalog.formatVersion, '2.0.0');
  assert.equal(catalog.federalRules.length, 44);
  assert.equal(catalog.cantonalBindings.length, 50);
  assert.equal(catalog.releaseEligibility.length, 50);
  assert.equal(previous.federalRules.length, 24);
  assert.equal(previous.cantonalBindings.length, 28);
  assert.deepEqual(before.federalRules.slice(0, 24), previous.federalRules, 'Previously reviewed rules changed');
  assert.deepEqual(before.cantonalBindings.slice(0, 28), previous.cantonalBindings, 'Previously reviewed bindings changed');
  assert.deepEqual(catalog.federalRules.slice(0, 24), previous.federalRules, 'Prior reviewed objects must remain exact');
  assert.deepEqual(catalog.cantonalBindings.slice(0, 28), previous.cantonalBindings, 'Prior reviewed objects must remain exact');
  for (const group of ['federalRules', 'cantonalBindings']) {
    const reviewedCount = group === 'federalRules' ? 24 : 28;
    for (const [i, item] of catalog[group].entries()) {
      assert.equal(before[group][i].status, i < reviewedCount ? 'reviewed' : 'candidate');
      assert.equal(item.status, 'reviewed');
      assert.deepEqual(without(item, ['status']), without(before[group][i], ['status']), `Legal content changed: ${group}/${i}`);
    }
  }
  assert.deepEqual(without(catalog, ['labels', 'review', 'federalRules', 'cantonalBindings', 'releaseEligibility']), without(before, ['labels', 'review', 'federalRules', 'cantonalBindings', 'releaseEligibility']), 'Non-approval social content changed');
  for (const [i, item] of catalog.releaseEligibility.entries()) {
    const old = before.releaseEligibility[i];
    assert.equal(old.status, 'candidate');
    assert.equal(old.approval, null);
    assert.equal(item.status, 'approved');
    assert.equal(item.releaseId, MVP06_RELEASE_ID);
    assert.deepEqual(without(item, ['releaseId', 'status', 'ruleRef', 'bindingRef', 'sourceReviewRef', 'approval']), without(old, ['releaseId', 'status', 'ruleRef', 'bindingRef', 'sourceReviewRef', 'approval']), 'Eligibility scope changed');
    assert.deepEqual(without(item.ruleRef, ['sha256']), without(old.ruleRef, ['sha256']));
    assert.deepEqual(without(item.bindingRef, ['sha256']), without(old.bindingRef, ['sha256']));
  }
}

export function mvp06CalculationRelease(manifest, files) {
  return {
    releaseId: manifest.releaseId, formatVersion: manifest.formatVersion,
    coverageFrom: manifest.coverage.from, coverageTo: manifest.coverage.to,
    profileIds: manifest.profileIds, calendarIds: manifest.calendarIds,
    specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
    holidayCatalogIds: manifest.holidayCatalogIds,
    socialProcedureCatalogIds: manifest.socialProcedureCatalogIds,
    artifacts: manifest.artifacts.map(descriptor => ({ descriptor, parsed: JSON.parse(files.get(descriptor.path)) }))
  };
}

export async function prepareMvp06Promotion(repository = root) {
  const read = relative => readRegular(repository, relative);
  const preparation = await prepareMvp06Inputs(repository);
  assert.equal(preparation.snapshot.evidence.length, 180);
  assert.equal(preparation.snapshot.preservation.historicalArchives.length, 85);
  const bytes = await read(`${AP20C3_CANDIDATE_PATH}/manifest.json`);
  assert.equal(mvp06Sha256(bytes), AP20C3_CANDIDATE_MANIFEST_SHA256, 'Changed pinned AP20C3 manifest');
  const candidate = JSON.parse(bytes);
  assert.equal(candidate.releaseId, '2026-10-01-ap20c3-candidate.1');
  assert.equal(candidate.releaseStatus, 'candidate');
  assert.equal(candidate.formatVersion, '6.0.0');
  assert.equal(candidate.compatibility.minimumConsumerFormatVersion, '6.0.0');
  assert.equal(candidate.immutable, true);
  assert.equal(candidate.artifacts.length, 10);
  const files = new Map();
  for (const descriptor of candidate.artifacts) {
    assertSafeArtifactPath(descriptor.path);
    const artifact = await read(`${AP20C3_CANDIDATE_PATH}/${descriptor.path}`);
    assert.equal(mvp06Sha256(artifact), descriptor.sha256, `Changed pinned artifact: ${descriptor.path}`);
    assert.equal(artifact.length, descriptor.byteLength, `Changed artifact length: ${descriptor.path}`);
    files.set(descriptor.path, artifact);
  }
  createCalculationData(mvp06CalculationRelease(candidate, files));
  const reviewBytes = await read(MVP06_REVIEW_PATH);
  assert.equal(mvp06Sha256(reviewBytes), MVP06_REVIEW_SHA256, 'Changed accepted source-review consolidation');
  const approvalBytes = await read(MVP06_SOURCE_APPROVAL_PATH);
  const sourceApproval = JSON.parse(approvalBytes);
  const decisionBytes = await read(MVP06_DECISION_PATH);
  // This gate binds the recorded human decision, not a fabricated test approval.
  assert.equal(mvp06Sha256(approvalBytes), MVP06_SOURCE_APPROVAL_SHA256, 'Changed human source approval');
  const verifiedApproval = await verifyMvp06SourceApproval(repository);
  assert.equal(verifiedApproval.approvalSha256, MVP06_SOURCE_APPROVAL_SHA256);
  assert.equal(mvp06Sha256(decisionBytes), '18adb59a4731838f88761513117041697e5ee6d61b9a40726b5a9945c97dbc15', 'Changed actual human decision');
  for (const suite of Object.values(MVP06_REFERENCE_SUITES)) assert.equal(mvp06Sha256(await read(suite.path)), suite.sha256, `Changed accepted reference suite: ${suite.path}`);
  const before = JSON.parse(files.get(socialPath));
  const previous = JSON.parse(await read(`${priorReleasePath}/${socialPath}`));
  const catalog = structuredClone(before);
  assert.equal(catalog.federalRules.length, 44);
  assert.equal(catalog.cantonalBindings.length, 50);
  assert.equal(catalog.releaseEligibility.length, 50);
  for (const item of [...catalog.federalRules, ...catalog.cantonalBindings]) {
    assert.ok(['reviewed', 'candidate'].includes(item.status));
    assert.ok(item.legalValidity, 'Promotion cannot invent missing legal validity');
    assert.ok(item.normBindings.every(norm => norm.verification === 'verified'));
    item.status = 'reviewed';
  }
  assert.ok(catalog.cantonalBindings.every(binding => binding.procedureContextCanton === 'BE'));
  const sourceReviewRef = { reviewId: sourceApproval.reviewId, sha256: mvp06Sha256(approvalBytes) };
  const approval = { approvedBy: 'David Steimer', approvedOn, decisionRef: MVP06_DECISION_PATH };
  catalog.releaseEligibility = catalog.releaseEligibility.map(entry => {
    assert.equal(entry.status, 'candidate');
    assert.equal(entry.approval, null);
    assert.equal(MVP06_REFERENCE_SUITES[entry.referenceSuiteRef.suiteId]?.sha256, entry.referenceSuiteRef.sha256, 'Unbound reference suite');
    const rule = catalog.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId && rule.revision === entry.ruleRef.revision);
    const binding = catalog.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId && binding.revision === entry.bindingRef.revision);
    return { ...entry, releaseId: MVP06_RELEASE_ID, status: 'approved',
      ruleRef: { ...entry.ruleRef, sha256: socialObjectSha256(rule) },
      bindingRef: { ...entry.bindingRef, sha256: socialObjectSha256(binding) },
      sourceReviewRef: { ...sourceReviewRef }, approval: { ...approval }
    };
  });
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · Berner Freigaben', fr: 'Procédures nationales des assurances sociales · rattachements bernois approuvés' };
  catalog.review = { reviewedOn: approvedOn, status: 'verified', reviewedBy: 'David Steimer', basis: 'AP20C1–C3 und Quellenprüfung MVP 0.6 mit Wiederverwendung und Vorbehalten abgenommen. Lokale Datenübernahme und definitive Builds am 01.10.2026 freigegeben. 24 Regeln/28 BE-Anbindungen objektidentisch erhalten, 20 Regeln/22 BE-Anbindungen neu geprüft. Alle 50 Freigaben an diesen Release gebunden, Fenster 2026–2027. Keine Installation, Publikation, Hostingänderung oder Betriebsfreigabe.' };
  assertMvp06PromotionDelta(before, catalog, previous);
  assertSocialProcedureCatalog(catalog);
  files.set(socialPath, encode(catalog));
  const artifacts = candidate.artifacts.map(descriptor => ({ ...descriptor, byteLength: files.get(descriptor.path).length, sha256: mvp06Sha256(files.get(descriptor.path)) }));
  for (const descriptor of artifacts.filter(item => item.path !== socialPath)) assert.ok(files.get(descriptor.path).equals(await read(`${priorReleasePath}/${descriptor.path}`)), `Previous nonsocial component changed: ${descriptor.path}`);
  const manifest = { ...candidate, releaseId: MVP06_RELEASE_ID, releaseStatus: 'approved', createdOn: approvedOn, artifacts,
    extensions: {
      'steimer.candidate': structuredClone(candidate.extensions['steimer.candidate']),
      'steimer.approval': { ...approval, approvalScope: 'mvp06LocalDataAndReleaseArtifacts', contractDecision: 'DEC-2026-026', candidateReleaseId: candidate.releaseId, candidateManifestSha256: AP20C3_CANDIDATE_MANIFEST_SHA256, decisionSha256: mvp06Sha256(decisionBytes), sourceReviewRef, sourceReviewPath: MVP06_SOURCE_APPROVAL_PATH, sourceReviewDatesUnchanged: true, referenceSuites: structuredClone(MVP06_REFERENCE_SUITES), preparationSnapshot: { path: snapshotPath, sha256: mvp06Sha256(await read(snapshotPath)), evidenceFiles: 180, historicalArchives: 85 } },
      'steimer.release-preparation': { preparedOn: approvedOn, appVersion: '0.6.0', sourceRefresh: 'acceptedWithDocumentedReuseAndReservations', publicationApproved: false, deploymentApproved: false, productionActivation: false, operatingApproval: 'requiresSeparateDecision' }
    }
  };
  assert.deepEqual(manifest.sourceSummary, candidate.sourceSummary, 'Historical source dates must not be rewritten');
  createCalculationData(mvp06CalculationRelease(manifest, files));
  files.set('manifest.json', encode(manifest));
  files.set('README.md', Buffer.from(`# MVP 0.6 · lokal freigegebener Datenrelease\n\nStatus: **Datenübernahme und Bau der definitiven Releaseartefakte freigegeben. Keine Installation, Publikation oder Betriebsfreigabe.**\n\nDavid Steimer hat am 1. Oktober 2026 die zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten abgenommen und die lokale Übernahme des abgenommenen AP20-Stands freigegeben. Die [Abnahmenotiz](../../../${MVP06_DECISION_PATH}) bindet den Entscheid.\n\n## Herkunft und Grenze\n\n- Release-ID: \`${MVP06_RELEASE_ID}\`. Manifest und Mindestconsumer \`6.0.0\`, Sozialverfahrenskatalog \`2.0.0\`, App-Zielversion \`0.6.0\`.\n- Ausgangskandidat \`${candidate.releaseId}\`, Manifest-SHA-256 \`${AP20C3_CANDIDATE_MANIFEST_SHA256}\`.\n- 44 nationale Bundesregeln und 50 ausschliesslich bernische Anbindungen, Fall- und Rechenabdeckung 2026 bis 2027. Keine weiteren Kantone oder Feiertagsräume freigeschaltet.\n- Neun Komponenten bleiben byteidentisch zum AP20C3-Kandidaten. Im Sozialkatalog ändern ausschliesslich Beschriftung, Abnahmemetadaten, Regel-/Anbindungsstatus und die 50 präzisen Freigabebindungen. Materielle Regeln, Zuständigkeitsfakten, Ausschlüsse, Normgeltung und Quellenprüfdaten bleiben unverändert.\n- Historische Quellenstände werden nicht pauschal nachdatiert. Die 82 zusätzlichen, nicht operativ verwendeten Feiertagskatalogquellen verwenden die abgenommene Prüfung vom 22. September 2026. AI-Konflikt, AVIV-Option B und die gesonderte Wochenendzustellungsabklärung bleiben dokumentiert.\n\n## Reproduktion\n\n\`node --import tsx scripts/promote-ap20-release.mjs\` prüft die exakten Eingaben, alle drei abgenommenen Referenzsuiten, den realen Rechenkern und den unabhängigen Python-Prüfer vor dem Schreiben. Der volle Quellenprüflauf benötigt derzeit lokale private Rohbelege. Die öffentliche Reproduzierbarkeit ist als P06-01 vor einem späteren Push gesondert zu klären. Abweichende bestehende Dateien werden nicht überschrieben. Die Freigaben binden SHA-256 der nach RFC 8785 kanonisierten Regel- und Anbindungsobjekte sowie die exakten Quellenfreigabe-, Referenz- und Kalenderstände.\n\nDer [Promotionsnachweis](../../../${MVP06_PROMOTION_REPORT}) beschreibt Hashes, Delta und Prüfstatus. \`steimer.candidate\` bleibt unveränderter Herkunftsnachweis des früheren Kandidaten. Massgebend für diesen neuen Stand sind \`releaseStatus\`, die 50 freigegebenen Einträge und \`steimer.approval\`. Kein Schreiben in diesem Ordner löst ein Deployment aus.\n`));
  return { manifest, catalog, files, report: {
    kind: 'mvp06LocalDataPromotion', preparedOn: approvedOn, releaseId: MVP06_RELEASE_ID,
    dataStatus: 'approved', implementationAccepted: true, sourceReviewAccepted: true,
    publicationApproved: false, deploymentApproved: false, productionActivation: false,
    candidatePath: AP20C3_CANDIDATE_PATH, candidateReleaseId: candidate.releaseId,
    candidateManifestSha256: AP20C3_CANDIDATE_MANIFEST_SHA256,
    manifestSha256: mvp06Sha256(files.get('manifest.json')),
    sourceReviewRef, sourceReviewPath: MVP06_SOURCE_APPROVAL_PATH,
    decisionRef: MVP06_DECISION_PATH, decisionSha256: mvp06Sha256(decisionBytes),
    consolidatedSourceReviewSha256: MVP06_REVIEW_SHA256,
    referenceSuites: structuredClone(MVP06_REFERENCE_SUITES),
    preparationSnapshot: manifest.extensions['steimer.approval'].preparationSnapshot,
    counts: { federalRules: 44, cantonalBindings: 50, approvedEligibility: 50, unchangedReviewedRules: 24, unchangedReviewedBindings: 28, newlyReviewedRules: 20, newlyReviewedBindings: 22, artifacts: 10, unchangedArtifacts: 9 },
    unchangedArtifacts: artifacts.filter(item => item.path !== socialPath).map(({path, sha256, byteLength}) => ({path, sha256, byteLength})),
    approvalOnlyChanges: { path: socialPath, fields: ['labels', 'review', 'federalRules[].status', 'cantonalBindings[].status', 'releaseEligibility[].releaseId', 'releaseEligibility[].status', 'releaseEligibility[].ruleRef.sha256', 'releaseEligibility[].bindingRef.sha256', 'releaseEligibility[].sourceReviewRef', 'releaseEligibility[].approval'], beforeSha256: candidate.artifacts.find(item => item.path === socialPath).sha256, afterSha256: artifacts.find(item => item.path === socialPath).sha256, legalContentUnchanged: true, sourceReviewDatesUnchanged: true },
    validation: { core: 'passed', python: 'requiredBeforeWrite' }
  } };
}

export async function validateMvp06Promotion(prepared) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'fristenrechner-mvp06-validation-'));
  try {
    for (const [name, bytes] of prepared.files) {
      assertSafeArtifactPath(name);
      await mkdir(path.dirname(path.join(temporary, name)), { recursive: true });
      await writeFile(path.join(temporary, name), bytes, { flag: 'wx' });
    }
    const checked = spawnSync(path.join(root, '.venv/bin/python'), [path.join(root, 'tests/data/validate_mvp06_release.py'), temporary], { cwd: root, encoding: 'utf8' });
    assert.equal(checked.status, 0, `Independent MVP06 validation failed:\n${checked.stderr || checked.error || checked.stdout}`);
    return { ...prepared, report: { ...prepared.report, validation: { core: 'passed', python: 'passed', result: JSON.parse(checked.stdout) } } };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

export async function writeMvp06Promotion(prepared, repository = root) {
  assert.equal(prepared.report.validation.python, 'passed', 'Independent Python validation must pass before writing');
  assert.ok(prepared.files.get('manifest.json').equals(encode(prepared.manifest)), 'Prepared manifest changed after validation');
  assert.equal(mvp06Sha256(prepared.files.get('manifest.json')), prepared.report.manifestSha256, 'Prepared identity changed after validation');
  for (const descriptor of prepared.manifest.artifacts) {
    const bytes = prepared.files.get(descriptor.path);
    assert.equal(mvp06Sha256(bytes), descriptor.sha256, `Prepared artifact changed after validation: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
  }
  // A caller cannot substitute another internally consistent payload or merely
  // set a "passed" flag. Re-derive the exact authorised bytes before any write.
  const expected = await validateMvp06Promotion(await prepareMvp06Promotion());
  assert.deepEqual(prepared.files, expected.files, 'Prepared files differ from authorised promotion');
  assert.deepEqual(prepared.catalog, expected.catalog, 'Prepared catalog differs from authorised promotion');
  assert.deepEqual(prepared.manifest, expected.manifest, 'Prepared manifest differs from authorised promotion');
  assert.deepEqual(prepared.report, expected.report, 'Prepared proof differs from authorised promotion');
  const writes = [...prepared.files].map(([name, bytes]) => [`data/releases/${MVP06_RELEASE_ID}/${name}`, bytes]);
  writes.push([MVP06_PROMOTION_REPORT, encode(prepared.report)]);
  assert.ok((await lstat(repository)).isDirectory() && !(await lstat(repository)).isSymbolicLink(), 'Unsafe output repository');
  for (const [relative, bytes] of writes) {
    try {
      assert.ok((await readRegular(repository, relative)).equals(bytes), `Existing MVP06 release differs: ${relative}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const [relative, bytes] of writes) {
    const file = path.resolve(repository, relative);
    await mkdir(path.dirname(file), { recursive: true });
    const parents = relative.split('/').slice(0, -1);
    for (let index = 0; index < parents.length; index++) {
      const parent = await lstat(path.resolve(repository, parents.slice(0, index + 1).join('/')));
      assert.ok(parent.isDirectory() && !parent.isSymbolicLink(), 'Unsafe output parent');
    }
    try { await writeFile(file, bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readRegular(repository, relative)).equals(bytes), `MVP06 readback differs: ${relative}`);
  }
  return prepared.report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'No overwrite, publication or deployment arguments accepted');
  console.log(JSON.stringify(await writeMvp06Promotion(await validateMvp06Promotion(await prepareMvp06Promotion())), null, 2));
}
