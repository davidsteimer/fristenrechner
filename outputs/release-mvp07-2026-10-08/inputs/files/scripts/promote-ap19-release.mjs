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
import { verifyMvp05SourceApproval } from './verify-mvp05-source-approval.mjs';

export const MVP05_RELEASE_ID = '2026-09-28-mvp-05-approved.1';
export const MVP05_PROMOTION_REPORT = 'outputs/release-mvp05-2026-09-28/data-promotion.json';
export const AP19C3_CANDIDATE_PATH = 'data/candidates/2026-09-28-ap19c3';
export const AP19C3_CANDIDATE_MANIFEST_SHA256 = '8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da';
export const MVP05_SOURCE_APPROVAL_PATH = 'outputs/release-mvp05-2026-09-28/source-approval.json';
export const MVP05_SOURCE_APPROVAL_SHA256 = '2897874ed52c826bb43dc61270f8122cf996b4fa2070904eacc4d672f551f768';
export const MVP05_DECISION_PATH = 'docs/fachrecht/abnahme-quellenpruefung-mvp05.md';
export const MVP05_REVIEW_PATH = 'outputs/release-mvp05-2026-09-28/source-review-completeness.json';
export const MVP05_REVIEW_SHA256 = '67fdf2e5cb3ac19769655ed08f2ff80e9863b76a2526469917832bcba68e27ce';
export const MVP05_REFERENCE_SUITES = Object.freeze({
  'AP17B-ANWENDBARKEIT': { path: 'tests/golden/candidates/ap17b-anwendbarkeit.json', sha256: 'd180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47' },
  'AP19B-SOCIAL-REFERENCES-1': { path: 'tests/golden/candidates/ap19b-social-deadlines.json', sha256: 'da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8' }
});
const root = fileURLToPath(new URL('../', import.meta.url));
const socialPath = 'social-procedures/ch-social-procedures.json';
const approvedOn = '2026-09-28';
export const mvp05Sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const without = (object, keys) => Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));

export function mvp05CalculationRelease(manifest, files) {
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

export async function prepareMvp05Promotion(repository = root) {
  const read = relative => readFile(path.join(repository, relative));
  const bytes = await read(`${AP19C3_CANDIDATE_PATH}/manifest.json`);
  assert.equal(mvp05Sha256(bytes), AP19C3_CANDIDATE_MANIFEST_SHA256, 'Changed pinned AP19C3 manifest');
  const candidate = JSON.parse(bytes);
  assert.equal(candidate.releaseId, '2026-09-28-ap19c3-candidate.1');
  assert.equal(candidate.releaseStatus, 'candidate');
  assert.equal(candidate.formatVersion, '5.0.0');
  assert.equal(candidate.immutable, true);
  assert.equal(candidate.artifacts.length, 10);
  const files = new Map();
  for (const descriptor of candidate.artifacts) {
    assert.ok(!path.isAbsolute(descriptor.path) && !descriptor.path.split('/').includes('..'), 'Unsafe artifact path');
    const source = path.join(repository, AP19C3_CANDIDATE_PATH, descriptor.path);
    assert.ok((await lstat(source)).isFile(), `Not a regular candidate artifact: ${descriptor.path}`);
    const artifact = await readFile(source);
    assert.equal(mvp05Sha256(artifact), descriptor.sha256, `Changed pinned artifact: ${descriptor.path}`);
    assert.equal(artifact.length, descriptor.byteLength, `Changed artifact length: ${descriptor.path}`);
    files.set(descriptor.path, artifact);
  }
  createCalculationData(mvp05CalculationRelease(candidate, files));
  const reviewBytes = await read(MVP05_REVIEW_PATH);
  assert.equal(mvp05Sha256(reviewBytes), MVP05_REVIEW_SHA256, 'Changed accepted source-review consolidation');
  const approvalBytes = await read(MVP05_SOURCE_APPROVAL_PATH);
  const sourceApproval = JSON.parse(approvalBytes);
  const decisionBytes = await read(MVP05_DECISION_PATH);
  // This gate binds the recorded human decision, not a fabricated test approval.
  assert.equal(mvp05Sha256(approvalBytes), MVP05_SOURCE_APPROVAL_SHA256, 'Changed human source approval');
  const verifiedApproval = await verifyMvp05SourceApproval(repository);
  assert.equal(verifiedApproval.approvalSha256, MVP05_SOURCE_APPROVAL_SHA256);
  assert.match(decisionBytes.toString('utf8'), /Ich gebe die kontrollierte lokale Datenübernahme und den Bau der definitiven Releaseartefakte frei/);
  for (const suite of Object.values(MVP05_REFERENCE_SUITES)) assert.equal(mvp05Sha256(await read(suite.path)), suite.sha256, `Changed accepted reference suite: ${suite.path}`);
  const before = JSON.parse(files.get(socialPath));
  const catalog = structuredClone(before);
  assert.equal(catalog.federalRules.length, 24);
  assert.equal(catalog.cantonalBindings.length, 28);
  assert.equal(catalog.releaseEligibility.length, 28);
  for (const item of [...catalog.federalRules, ...catalog.cantonalBindings]) {
    assert.equal(item.status, 'candidate');
    assert.ok(item.legalValidity, 'Promotion cannot invent missing legal validity');
    assert.ok(item.normBindings.every(norm => norm.verification === 'verified'));
    item.status = 'reviewed';
  }
  assert.ok(catalog.cantonalBindings.every(binding => binding.procedureContextCanton === 'BE'));
  const sourceReviewRef = { reviewId: sourceApproval.reviewId, sha256: mvp05Sha256(approvalBytes) };
  const approval = { approvedBy: 'David Steimer', approvedOn, decisionRef: MVP05_DECISION_PATH };
  catalog.releaseEligibility = catalog.releaseEligibility.map(entry => {
    assert.equal(entry.status, 'candidate');
    assert.equal(entry.approval, null);
    assert.equal(MVP05_REFERENCE_SUITES[entry.referenceSuiteRef.suiteId]?.sha256, entry.referenceSuiteRef.sha256, 'Unbound reference suite');
    const rule = catalog.federalRules.find(rule => rule.ruleId === entry.ruleRef.ruleId && rule.revision === entry.ruleRef.revision);
    const binding = catalog.cantonalBindings.find(binding => binding.bindingId === entry.bindingRef.bindingId && binding.revision === entry.bindingRef.revision);
    return { ...entry, releaseId: MVP05_RELEASE_ID, status: 'approved',
      ruleRef: { ...entry.ruleRef, sha256: socialObjectSha256(rule) },
      bindingRef: { ...entry.bindingRef, sha256: socialObjectSha256(binding) },
      sourceReviewRef: { ...sourceReviewRef }, approval: { ...approval }
    };
  });
  catalog.labels = { de: 'Nationale Sozialversicherungsverfahren · Berner Freigaben', fr: 'Procédures nationales des assurances sociales · rattachements bernois approuvés' };
  catalog.review = { reviewedOn: approvedOn, status: 'verified', reviewedBy: 'David Steimer', basis: 'AP19C1, AP19C2 und AP19C3 fachlich-technisch abgenommen. Zusammengeführte Quellenprüfung MVP 0.5 samt Wiederverwendung und Vorbehalten am 28. September 2026 abgenommen. Kontrollierte lokale Datenübernahme und definitive Releaseartefakte freigegeben. 24 nationale Regeln und 28 konkrete Berner Anbindungen für das geprüfte Fenster 2026 bis 2027. Keine Bereitstellungs-, Publikations- oder Betriebsfreigabe.' };
  assert.deepEqual(without(catalog, ['labels', 'review', 'federalRules', 'cantonalBindings', 'releaseEligibility']), without(before, ['labels', 'review', 'federalRules', 'cantonalBindings', 'releaseEligibility']), 'Non-approval social content changed');
  for (const group of ['federalRules', 'cantonalBindings']) catalog[group].forEach((item, i) => assert.deepEqual(without(item, ['status']), without(before[group][i], ['status']), `Legal content changed: ${group}/${i}`));
  catalog.releaseEligibility.forEach((item, i) => assert.deepEqual(without(item, ['releaseId', 'status', 'ruleRef', 'bindingRef', 'sourceReviewRef', 'approval']), without(before.releaseEligibility[i], ['releaseId', 'status', 'ruleRef', 'bindingRef', 'sourceReviewRef', 'approval']), 'Eligibility scope changed'));
  assertSocialProcedureCatalog(catalog);
  files.set(socialPath, encode(catalog));
  const artifacts = candidate.artifacts.map(descriptor => ({ ...descriptor, byteLength: files.get(descriptor.path).length, sha256: mvp05Sha256(files.get(descriptor.path)) }));
  const manifest = { ...candidate, releaseId: MVP05_RELEASE_ID, releaseStatus: 'approved', createdOn: approvedOn, artifacts,
    extensions: {
      'steimer.candidate': structuredClone(candidate.extensions['steimer.candidate']),
      'steimer.approval': { ...approval, approvalScope: 'mvp05LocalDataAndReleaseArtifacts', contractDecision: 'DEC-2026-025', candidateReleaseId: candidate.releaseId, candidateManifestSha256: AP19C3_CANDIDATE_MANIFEST_SHA256, decisionSha256: mvp05Sha256(decisionBytes), sourceReviewRef, sourceReviewPath: MVP05_SOURCE_APPROVAL_PATH, sourceReviewDatesUnchanged: true, referenceSuites: structuredClone(MVP05_REFERENCE_SUITES) },
      'steimer.release-preparation': { preparedOn: approvedOn, appVersion: '0.5.0', sourceRefresh: 'acceptedWithDocumentedReuseAndReservations', publicationApproved: false, deploymentApproved: false, productionActivation: false, operatingApproval: 'requiresSeparateDecision' }
    }
  };
  assert.deepEqual(manifest.sourceSummary, candidate.sourceSummary, 'Historical source dates must not be rewritten');
  createCalculationData(mvp05CalculationRelease(manifest, files));
  files.set('manifest.json', encode(manifest));
  files.set('README.md', Buffer.from(`# MVP 0.5 · lokal freigegebener Datenrelease\n\nStatus: **Datenübernahme und Bau der definitiven Releaseartefakte freigegeben. Keine Installation, Publikation oder Betriebsfreigabe.**\n\nDavid Steimer hat am 28. September 2026 die zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten abgenommen und die lokale Übernahme des abgenommenen AP19-Stands freigegeben. Die [Abnahmenotiz](../../../${MVP05_DECISION_PATH}) bindet den Entscheid.\n\n## Herkunft und Grenze\n\n- Release-ID: \`${MVP05_RELEASE_ID}\`. Manifest und Mindestconsumer \`5.0.0\`, Sozialverfahrenskatalog \`1.0.0\`, App-Zielversion \`0.5.0\`.\n- Ausgangskandidat \`${candidate.releaseId}\`, Manifest-SHA-256 \`${AP19C3_CANDIDATE_MANIFEST_SHA256}\`.\n- 24 nationale Bundesregeln und 28 ausschliesslich bernische Anbindungen, Fall- und Rechenabdeckung 2026 bis 2027. Keine weiteren Kantone oder Feiertagsräume freigeschaltet.\n- Neun Komponenten bleiben byteidentisch zum AP19C3-Kandidaten. Im Sozialkatalog ändern ausschliesslich Beschriftung, Abnahmemetadaten, Regel-/Anbindungsstatus und die 28 präzisen Freigabebindungen. Materielle Regeln, Zuständigkeitsfakten, Ausschlüsse, Normgeltung und Quellenprüfdaten bleiben unverändert.\n- Historische Quellenstände werden nicht pauschal nachdatiert. Die 82 zusätzlichen, nicht operativ verwendeten Feiertagskatalogquellen verwenden die abgenommene Prüfung vom 22. September 2026. AI-Konflikt, AVIV-Option B und die gesonderte Wochenendzustellungsabklärung bleiben dokumentiert.\n\n## Reproduktion\n\n\`node --import tsx scripts/promote-ap19-release.mjs\` prüft die exakten Eingaben, beide historischen Referenzsuiten, den realen Rechenkern und den unabhängigen Python-Prüfer vor dem Schreiben. Abweichende bestehende Dateien werden nicht überschrieben. Die Freigaben binden SHA-256 der nach RFC 8785 kanonisierten Regel- und Anbindungsobjekte sowie die exakten Quellenfreigabe-, Referenz- und Kalenderstände.\n\nDer [Promotionsnachweis](../../../${MVP05_PROMOTION_REPORT}) beschreibt Hashes, Delta und Prüfstatus. \`steimer.candidate\` bleibt unveränderter Herkunftsnachweis des früheren Kandidaten. Massgebend für diesen neuen Stand sind \`releaseStatus\`, die 28 freigegebenen Einträge und \`steimer.approval\`. Kein Schreiben in diesem Ordner löst ein Deployment aus.\n`));
  return { manifest, catalog, files, report: {
    kind: 'mvp05LocalDataPromotion', preparedOn: approvedOn, releaseId: MVP05_RELEASE_ID,
    dataStatus: 'approved', implementationAccepted: true, sourceReviewAccepted: true,
    publicationApproved: false, deploymentApproved: false, productionActivation: false,
    candidatePath: AP19C3_CANDIDATE_PATH, candidateReleaseId: candidate.releaseId,
    candidateManifestSha256: AP19C3_CANDIDATE_MANIFEST_SHA256,
    manifestSha256: mvp05Sha256(files.get('manifest.json')),
    sourceReviewRef, sourceReviewPath: MVP05_SOURCE_APPROVAL_PATH,
    decisionRef: MVP05_DECISION_PATH, decisionSha256: mvp05Sha256(decisionBytes),
    consolidatedSourceReviewSha256: MVP05_REVIEW_SHA256,
    referenceSuites: structuredClone(MVP05_REFERENCE_SUITES),
    counts: { federalRules: 24, cantonalBindings: 28, approvedEligibility: 28, artifacts: 10, unchangedArtifacts: 9 },
    unchangedArtifacts: artifacts.filter(item => item.path !== socialPath).map(({path, sha256, byteLength}) => ({path, sha256, byteLength})),
    approvalOnlyChanges: { path: socialPath, fields: ['labels', 'review', 'federalRules[].status', 'cantonalBindings[].status', 'releaseEligibility[].releaseId', 'releaseEligibility[].status', 'releaseEligibility[].ruleRef.sha256', 'releaseEligibility[].bindingRef.sha256', 'releaseEligibility[].sourceReviewRef', 'releaseEligibility[].approval'], beforeSha256: candidate.artifacts.find(item => item.path === socialPath).sha256, afterSha256: artifacts.find(item => item.path === socialPath).sha256, legalContentUnchanged: true, sourceReviewDatesUnchanged: true },
    validation: { core: 'passed', python: 'requiredBeforeWrite' }
  } };
}

export async function validateMvp05Promotion(prepared) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'fristenrechner-mvp05-validation-'));
  try {
    for (const [name, bytes] of prepared.files) {
      await mkdir(path.dirname(path.join(temporary, name)), { recursive: true });
      await writeFile(path.join(temporary, name), bytes, { flag: 'wx' });
    }
    const checked = spawnSync(path.join(root, '.venv/bin/python'), [path.join(root, 'tests/data/validate_mvp05_release.py'), temporary], { cwd: root, encoding: 'utf8' });
    assert.equal(checked.status, 0, `Independent MVP05 validation failed:\n${checked.stderr || checked.error || checked.stdout}`);
    return { ...prepared, report: { ...prepared.report, validation: { core: 'passed', python: 'passed', result: JSON.parse(checked.stdout) } } };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

export async function writeMvp05Promotion(prepared, repository = root) {
  assert.equal(prepared.report.validation.python, 'passed', 'Independent Python validation must pass before writing');
  assert.ok(prepared.files.get('manifest.json').equals(encode(prepared.manifest)), 'Prepared manifest changed after validation');
  assert.equal(mvp05Sha256(prepared.files.get('manifest.json')), prepared.report.manifestSha256, 'Prepared identity changed after validation');
  for (const descriptor of prepared.manifest.artifacts) {
    const bytes = prepared.files.get(descriptor.path);
    assert.equal(mvp05Sha256(bytes), descriptor.sha256, `Prepared artifact changed after validation: ${descriptor.path}`);
    assert.equal(bytes.length, descriptor.byteLength);
  }
  // A caller cannot substitute another internally consistent payload or merely
  // set a "passed" flag. Re-derive the exact authorised bytes before any write.
  const expected = await validateMvp05Promotion(await prepareMvp05Promotion());
  assert.deepEqual(prepared.files, expected.files, 'Prepared files differ from authorised promotion');
  assert.deepEqual(prepared.manifest, expected.manifest, 'Prepared manifest differs from authorised promotion');
  assert.deepEqual(prepared.report, expected.report, 'Prepared proof differs from authorised promotion');
  const writes = [...prepared.files].map(([name, bytes]) => [path.join(repository, 'data/releases', MVP05_RELEASE_ID, name), bytes]);
  writes.push([path.join(repository, MVP05_PROMOTION_REPORT), encode(prepared.report)]);
  for (const [file, bytes] of writes) {
    try {
      assert.ok((await lstat(file)).isFile(), `Not a regular release output: ${path.basename(file)}`);
      assert.ok((await readFile(file)).equals(bytes), `Existing MVP05 release differs: ${path.basename(file)}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const [file, bytes] of writes) {
    await mkdir(path.dirname(file), { recursive: true });
    try { await writeFile(file, bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    assert.ok((await readFile(file)).equals(bytes), `MVP05 readback differs: ${path.basename(file)}`);
  }
  return prepared.report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'No overwrite, publication or deployment arguments accepted');
  console.log(JSON.stringify(await writeMvp05Promotion(await validateMvp05Promotion(await prepareMvp05Promotion())), null, 2));
}
