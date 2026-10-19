// SPDX-License-Identifier: AGPL-3.0-only
// R09-B bounded local Format-9 promotion. No Git, installation or publication.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFormat9CalculationData } from '../src/core/calculatorRuntime';
import { projectActivatedCalendars } from '../src/core/holidayActivation';
import { socialObjectSha256 } from '../src/core/socialCatalog';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../src/core/format7Baseline';
import { root, prefix, releaseId, candidateRoot, candidateHash, sourceApprovalPath, sourceApprovalHash,
  sourceReviewRef, adminSourceReviewRef, authorityPath, decisionPath, bridgePath, adoptionPath, suitePath,
  requireAuthority, verifyGovernance, readRegular, writeExclusive, hash, encode } from './prepare-mvp09-source-reviews.mjs';

export const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
export const socialPath = 'social-procedures/ch-social-procedures.json';
export const administrativePath = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const reportPath = `${prefix}/data-promotion.json`;
export const calendarApprovalEvidence = `${decisionPath} | ${sourceApprovalPath} | sha256:${sourceApprovalHash}`;
const text = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const without = (value: Record<string, unknown>, keys: string[]): Record<string, unknown> => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
export async function prepareReferenceSuite() {
  const references: ReadonlyArray<readonly [string, string]> = [
    ['tests/golden/candidates/ap23b-administrative.json', 'a795a22a07945e02369f917dcea4d047a7bb3bb897e198a1fe1ffbea4a65a5d1'],
    ['outputs/ap23d3-2026-10-15/QA-AP23D3.json', '0794e536ce757964eb1e00fb5d65a5fd4fdf39a2ddcb730e6061e93b3d06f38a'],
    ['outputs/ap23d3-abnahme-2026-10-15/receipt.json', 'e3641a460497a0047d7968de106575887757f4d8c619d396359ebd62bfb12966'],
    ['tests/golden/candidates/ap23e1-administrative.json', '769e9c7db0d63b768909a5042bd1446b708f5e0ed6be7bb92abe7f33669d7ddb'],
    ['outputs/ap23e2-2026-10-18/QA-AP23E2.json', 'ac7fd146a9db098d65b37c2c586fab36db0072290195b213f3d7e0cd00ca111b'],
    ['outputs/ap23e3-2026-10-18/QA-AP23E3.json', 'fa564603394ed40a6eebc6a587b5e11111f4f37e75c9930b4a04d1d889991c80'],
    ['outputs/ap23e3-abnahme-2026-10-18/receipt.json', '18de59434d8dcb8469d0ebad767e6fcea55be089948335930d496990730da3ea']
  ];
  const evidence = [];
  for (const [path, sha256] of references) {
    const bytes = await readRegular(root, path); assert.equal(hash(bytes), sha256);
    evidence.push({ path, sha256, byteLength: bytes.length });
  }
  return { formatVersion: '1.0.0', dataKind: 'administrativeReferenceSuiteBinding',
    suiteId: 'mvp09-administrative-reference-suite', recordedOn: '2026-10-18', releaseId,
    candidateManifestSha256: candidateHash, evidence,
    meaning: 'Abgenommene echte AP23-Referenzfälle und D3-Regressionsnachweise. Kein synthetischer Freigabebeleg. Die neue Releaseprüfung erfolgt zusätzlich an den tatsächlichen Approved-Bytes.',
    newHostTestingClaimed: false, noAdditionalCases: true };
}
export function assertAllowedDelta(before: Map<string, string>, after: Map<string, string>) {
  assert.deepEqual([...after.keys()].sort(), [...before.keys()].sort());
  for (const [path, previousText] of before) {
    const previous = JSON.parse(previousText), current = JSON.parse(after.get(path)!);
    if (path === catalogPath) {
      const copy = structuredClone(current); copy.activation.releaseEligibility = previous.activation.releaseEligibility;
      assert.deepEqual(copy, previous, 'Holiday catalog substantive delta');
    } else if (path.startsWith('calendars/')) {
      const copy = structuredClone(current); copy.projection.sourceHash = previous.projection.sourceHash;
      assert.deepEqual(copy, previous, `Calendar semantics changed: ${path}`);
    } else if (path === socialPath) {
      assert.deepEqual(without(current, ['review', 'releaseEligibility']), without(previous, ['review', 'releaseEligibility']));
      assert.equal(current.releaseEligibility.length, 50);
      for (let index = 0; index < 50; index++) assert.deepEqual(
        without(current.releaseEligibility[index], ['releaseId', 'status', 'sourceReviewRef', 'componentRefs', 'approval']),
        without(previous.releaseEligibility[index], ['releaseId', 'status', 'sourceReviewRef', 'componentRefs', 'approval']));
    } else if (path === administrativePath) {
      assert.deepEqual(without(current, ['review', 'releaseBinding', 'holidayBindings']), without(previous, ['review', 'releaseBinding', 'holidayBindings']));
      assert.equal(current.holidayBindings.length, 5);
      for (let i = 0; i < 5; i++) {
        const old = previous.holidayBindings[i], now = current.holidayBindings[i];
        assert.deepEqual(without(now, ['physicalBaseline']), without(old, ['physicalBaseline']));
        assert.deepEqual(without(now.physicalBaseline, ['releaseId', 'references']), without(old.physicalBaseline, ['releaseId', 'references']));
        assert.equal(now.physicalBaseline.references.length, old.physicalBaseline.references.length);
        for (let j = 0; j < old.physicalBaseline.references.length; j++)
          assert.deepEqual(without(now.physicalBaseline.references[j], ['sha256']), without(old.physicalBaseline.references[j], ['sha256']));
      }
      assert.equal(current.releaseBinding.pathEligibility.length, 25);
      for (let index = 0; index < 25; index++) assert.deepEqual(
        without(current.releaseBinding.pathEligibility[index], ['status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256']),
        without(previous.releaseBinding.pathEligibility[index], ['status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256']));
      assert.equal(current.runtimeActive, false);
    } else assert.equal(after.get(path), previousText, `Non-promoted artifact changed: ${path}`);
  }
}
export async function preparePromotion() {
  const authority = await requireAuthority();
  await verifyGovernance();
  const rawManifest = await readRegular(root, `${candidateRoot}/manifest.json`);
  assert.equal(hash(rawManifest), candidateHash);
  const candidate = JSON.parse(rawManifest.toString('utf8'));
  assert.equal(candidate.artifacts.length, 41);
  const before = new Map<string, string>();
  for (const descriptor of candidate.artifacts) {
    const bytes = await readRegular(root, `${candidateRoot}/${descriptor.path}`);
    assert.equal(hash(bytes), descriptor.sha256); assert.equal(bytes.length, descriptor.byteLength);
    before.set(descriptor.path, bytes.toString('utf8'));
  }
  createFormat9CalculationData(rawManifest.toString('utf8'), before, { mode: 'localReference' });
  const files = new Map(before);
  const approval = { approvedBy: 'David Steimer', approvedOn: '2026-10-18', decisionRef: decisionPath };
  const catalog = JSON.parse(before.get(catalogPath)!);
  catalog.activation.releaseEligibility = { status: 'approved', releaseId,
    approval: { on: '2026-10-18', by: 'David Steimer', evidence: calendarApprovalEvidence } };
  files.set(catalogPath, text(catalog));
  const catalogSha256 = hash(files.get(catalogPath)!);
  const calendars = projectActivatedCalendars(catalog, catalogSha256, FORMAT7_LEGACY_CALENDAR_BASELINE);
  assert.equal(calendars.length, 32);
  for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, text(calendar));
  const componentRef = (contentId: string) => ({ role: contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar',
    contentId, sha256: hash(files.get(contentId === 'ch-holiday-catalog' ? catalogPath : `calendars/${contentId}.json`)!) });
  const social = JSON.parse(before.get(socialPath)!);
  social.review = { reviewedOn: '2026-10-18', status: 'verified', reviewedBy: 'David Steimer',
    basis: 'R09-A2 und R09-B durch David Steimer abgenommen. 44 Fachregeln, 50 BE-Anbindungen und Grenzen unverändert. Neue Bundesfassungsbrücken zusätzlich an Quellenabnahme gebunden. Lokale Releasebindung, keine Installation, Veröffentlichung oder Betriebsfreigabe.' };
  social.releaseEligibility = social.releaseEligibility.map((entry: Record<string, unknown>) => ({ ...entry, releaseId, status: 'approved',
    sourceReviewRef: { ...sourceReviewRef }, componentRefs: ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef), approval: { ...approval } }));
  files.set(socialPath, text(social));
  const suite = await prepareReferenceSuite();
  const suiteBytes = encode(suite);
  const suiteRef = { id: suite.suiteId, sha256: hash(suiteBytes) };
  const administrative = JSON.parse(before.get(administrativePath)!);
  administrative.review = { basis: 'AP23B/E1 mit Ergänzungen, DEC-2026-031/032/033 und AP23E3 fachlich-technisch abgenommen. R09-B erlaubt nur die lokale Datenübernahme.',
    sourceReview: `R09-A2 Quellenabnahme ${sourceApprovalPath} SHA-256 ${sourceApprovalHash}, begründete Wiederverwendung und Vorbehalte unverändert.`, checkedOn: '2026-10-18' };
  const componentIds = ['ap22-ti-944ed0286e9a', 'ch-federal-calendar', 'ch-holiday-catalog', 'ap22-gr-bf0366c8eda2',
    'ap22-lu-b879eb8eb04f', 'ap22-zg-860e0f8e0e1a', 'ap22-ar-88bb22c08a22'];
  administrative.holidayBindings = administrative.holidayBindings.map((binding: any) => ({ ...binding,
    physicalBaseline: { ...binding.physicalBaseline, releaseId,
      references: binding.physicalBaseline.references.map((ref: any) => ({ ...ref, sha256: componentRef(ref.contentId).sha256 })) } }));
  Object.assign(administrative.releaseBinding, { status: 'approved', releaseId, approval: { ...approval },
    targetComponentRefs: componentIds.map(componentRef), sourceReviewRef: { ...adminSourceReviewRef }, referenceSuiteRef: suiteRef });
  administrative.releaseBinding.pathEligibility = administrative.releaseBinding.pathEligibility.map((entry: any) => {
    const binding = administrative.holidayBindings.find((item: any) => item.holidayBindingId === entry.holidayBindingId);
    assert.ok(binding);
    return { ...entry, status: 'approved', holidayBindingSha256: socialObjectSha256(binding), targetComponentRefs: binding.physicalBaseline.references.map((ref: any) => componentRef(ref.contentId)),
      sourceReviewRef: { ...adminSourceReviewRef }, referenceSuiteRef: { ...suiteRef } };
  });
  files.set(administrativePath, text(administrative));
  assertAllowedDelta(before, files);
  const artifacts = candidate.artifacts.map((item: any) => ({ ...item,
    byteLength: Buffer.byteLength(files.get(item.path)!), sha256: hash(files.get(item.path)!) }));
  const sourceApproval = JSON.parse((await readRegular(root, sourceApprovalPath)).toString('utf8'));
  const governanceBytes = await readRegular(root, adoptionPath), bridgeBytes = await readRegular(root, bridgePath);
  const manifest = { ...candidate, $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/release-manifest-v9.schema.json',
    releaseId, releaseStatus: 'approved', createdOn: '2026-10-18', artifacts,
    sourceSummary: { ...candidate.sourceSummary, latestReviewedOn: '2026-10-18', legalBasisReviewStatus: 'verified', technicalValidationStatus: 'passed' },
    extensions: {
      'steimer.approval': { ...approval, approvalScope: 'mvp09LocalDataAndReleaseArtifacts', contractDecision: 'DEC-2026-033',
        candidateReleaseId: candidate.releaseId, candidateManifestSha256: candidateHash, sourceReviewRef,
        sourceReviewPath: sourceApprovalPath, sourceApprovalId: sourceApproval.approvalId,
        localBuildApproval: { path: authorityPath, sha256: authority.sha256 },
        sourceGovernance: { path: adoptionPath, sha256: hash(governanceBytes) }, sourceVersionBridges: { path: bridgePath, sha256: hash(bridgeBytes) },
        administrativeReferenceSuite: { path: suitePath, sha256: hash(suiteBytes) }, historicalSourceMetadataUnchanged: true },
      'steimer.release-preparation': { preparedOn: '2026-10-18', appVersion: '0.9.0', sourceRefresh: 'acceptedWithDocumentedReuseAndReservations',
        publicationApproved: false, deploymentApproved: false, productionActivation: false, operatingApproval: 'requiresSeparateDecision' }
    } };
  const manifestText = text(manifest);
  const runtime = createFormat9CalculationData(manifestText, files, { mode: 'approved' });
  assert.equal(runtime.calendarRuntime.referenceOnly, false);
  assert.ok(runtime.administrativeContext);
  files.set('manifest.json', manifestText);
  return { files, suiteBytes, manifest, before, report: { kind: 'mvp09LocalDataPromotion', preparedOn: '2026-10-18', releaseId, dataStatus: 'approved',
    publicationApproved: false, deploymentApproved: false, productionActivation: false, sourceReviewAccepted: true, implementationAccepted: true,
    manifestSha256: hash(manifestText), candidateManifestSha256: candidateHash, candidatePath: candidateRoot, candidateReleaseId: candidate.releaseId,
    sourceReviewRef, localBuildApproval: { path: authorityPath, sha256: authority.sha256 },
    sourceGovernance: { path: adoptionPath, sha256: hash(governanceBytes) }, sourceVersionBridges: { path: bridgePath, sha256: hash(bridgeBytes) },
    administrativeReferenceSuite: { path: suitePath, sha256: hash(suiteBytes) },
    counts: { artifacts: 41, runtimeFiles: 42, unchangedArtifacts: 6, calendars: 32, catalogRules: 479, supplementalRules: 12,
      provenanceDecisions: 198, terminalBindings: 104, federalRules: 44, cantonalBindings: 50, approvedSocialEligibility: 50,
      administrativePaths: 25, tiPaths: 5, grPaths: 7, luPaths: 4, zgPaths: 4, arPaths: 5, administrativeTargetComponents: 7, manifestSources: 128 },
    legalContentUnchanged: true, historicalSourceMetadataUnchanged: true,
    validation: { approvedReader: 'passed', narrowSemanticDelta: 'passed', independentValidator: 'requiredBeforeDataCommit' } } };
}
export async function writePromotion() {
  const prepared = await preparePromotion();
  const writes: Array<[string, Uint8Array | string]> = [...prepared.files].map(([path, bytes]) => [`data/releases/${releaseId}/${path}`, bytes]);
  writes.push([suitePath, prepared.suiteBytes], [reportPath, encode(prepared.report)]);
  // Canonical Format-9 schemas are already part of accepted E3. No schema writes.
  // Preflight every destination. Never overwrite an already different release.
  for (const [path, bytes] of writes) {
    const old = await readRegular(root, path, true);
    if (old) assert.deepEqual(old, Buffer.from(bytes), `Existing destination differs: ${path}`);
  }
  for (const [path, bytes] of writes) await writeExclusive(root, path, Buffer.from(bytes));
  return prepared.report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(process.argv[2] === '--write' ? await writePromotion() : (await preparePromotion()).report, null, 2));
}

