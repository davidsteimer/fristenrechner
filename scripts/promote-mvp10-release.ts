// SPDX-License-Identifier: AGPL-3.0-only
// R10-B: bounded local Format-17 metadata promotion, never an installation.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFormat17CalculationData } from '../src/core/format17CalculationData';
import { projectActivatedCalendarsV17 } from '../src/core/holidayActivationV17';
import { socialObjectSha256 } from '../src/core/socialCatalog';
import { administrativeBindingReferencesV10 } from '../src/core/administrativeCatalogV10';
import { root, prefix, releaseId, candidateRoot, candidateHash, sourceApprovalPath,
  getSourceApprovalBinding, authorityPath, decisionPath, bridgePath, adoptionPath, suitePath,
  requireAuthority, verifyGovernance, readRegular, writeExclusive, hash, encode } from './prepare-mvp10-source-reviews.mjs';

export const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
export const socialPath = 'social-procedures/ch-social-procedures.json';
export const administrativePath = 'administrative-procedures/ch-cantonal-administrative-procedures.json';
export const reportPath = `${prefix}/data-promotion.json`;
const date = '2026-10-28';
const text = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const without = (value: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const physical = (binding: any): any => binding.physicalSource ?? binding.physicalBaseline;
export const suiteEvidencePaths = [
  'tests/golden/candidates/ap23b-administrative.json',
  'outputs/ap23d3-2026-10-15/QA-AP23D3.json',
  'outputs/ap23d3-abnahme-2026-10-15/receipt.json',
  'tests/golden/candidates/ap23e1-administrative.json',
  'outputs/ap23e2-2026-10-18/QA-AP23E2.json',
  'outputs/ap23e3-2026-10-18/QA-AP23E3.json',
  'outputs/ap23e3-abnahme-2026-10-18/receipt.json',
  ...([
    ['f', '2026-10-22', 'outputs/ap23f2-2026-10-22/QA-AP23F2.json', '2026-10-22'],
    ['g', '2026-10-22', 'outputs/ap23g2-2026-10-22/QA-AP23G2.json', '2026-10-22'],
    ['h', '2026-10-22', 'outputs/ap23h2-2026-10-22/QA-AP23H2.json', '2026-10-22'],
    ['i', '2026-10-22', 'outputs/ap23i2-candidate-2026-10-22/QA-AP23I2.json', '2026-10-27'],
    ['j', '2026-10-27', 'outputs/ap23j2-candidate-2026-10-27/QA-AP23J2.json', '2026-10-27'],
    ['k', '2026-10-27', 'outputs/ap23k2-candidate-2026-10-27/QA-AP23K2.json', '2026-10-27'],
    ['l', '2026-10-27', 'outputs/ap23l2-candidate-2026-10-27/QA-AP23L2.json', '2026-10-27'],
    ['m', '2026-10-28', 'outputs/ap23m2-candidate-2026-10-28/QA-AP23M2.json', '2026-10-28']
  ] as const).flatMap(([letter, qaDate, second, receiptDate]) => [
    `docs/fachrecht/ap23${letter}1/referenzfaelle.json`, second,
    `outputs/ap23${letter}3-${qaDate}/QA-AP23${letter.toUpperCase()}3.json`,
    `outputs/ap23${letter}3-abnahme-${receiptDate}/receipt.json`
  ])
] as const;

/** Evidence identities come from the approved R2 baseline, not mutable discovery. */
export async function prepareReferenceSuite(authority: Awaited<ReturnType<typeof requireAuthority>>) {
  const proposalRef = authority.record.proposal as { path: string; sha256: string };
  const proposalBytes = await readRegular(root, proposalRef.path);
  assert.equal(hash(proposalBytes), proposalRef.sha256);
  const proposal = JSON.parse(proposalBytes.toString('utf8'));
  const baselineBytes = await readRegular(root, proposal.baseline.path);
  assert.equal(hash(baselineBytes), proposal.baseline.sha256);
  assert.equal(baselineBytes.length, proposal.baseline.byteLength);
  const rows = new Map<string, any>(JSON.parse(baselineBytes.toString('utf8')).files.map((row: any) => [row.path, row]));
  const identityAnchors: Array<{ path: string; sha256: string; byteLength: number }> = [];
  const bound = async (ref: { path: string; sha256: string; byteLength?: number }) => {
    const bytes = await readRegular(root, ref.path);
    assert.equal(hash(bytes), ref.sha256, ref.path);
    if (ref.byteLength !== undefined) assert.equal(bytes.length, ref.byteLength, ref.path);
    identityAnchors.push({ path: ref.path, sha256: ref.sha256, byteLength: bytes.length });
    return JSON.parse(bytes.toString('utf8'));
  };
  // Older proofs are not silently treated as fresh R2 baseline files. Follow
  // their exact accepted metadata chains from protected R2 anchor documents.
  const oldManifest = await bound(rows.get('data/releases/2026-10-18-mvp-09-approved.1/manifest.json'));
  const oldSuite = await bound(oldManifest.extensions['steimer.approval'].administrativeReferenceSuite);
  for (const row of oldSuite.evidence) if (!rows.has(row.path)) rows.set(row.path, row);
  const g1Receipt = await bound(rows.get('outputs/ap23g1-abnahme-2026-10-22/receipt.json'));
  const f3Ref = g1Receipt.previousF3References.find((row: any) => row.path === 'outputs/ap23f3-abnahme-2026-10-22/receipt.json');
  assert.ok(f3Ref, 'Accepted G1 does not bind F3');
  const f3Receipt = await bound(f3Ref);
  const f3Bytes = await readRegular(root, f3Ref.path);
  rows.set(f3Ref.path, { ...f3Ref, byteLength: f3Bytes.length });
  for (const row of f3Receipt.artifacts) if (!rows.has(row.path)) rows.set(row.path, row);
  const evidence = [];
  assert.equal(suiteEvidencePaths.length, 39);
  for (const path of suiteEvidencePaths) {
    const row = rows.get(path);
    assert.ok(row, `Reference evidence was not protected by approved R2: ${path}`);
    const bytes = await readRegular(root, path);
    assert.equal(hash(bytes), row.sha256, path);
    assert.equal(bytes.length, row.byteLength, path);
    evidence.push({ path, sha256: row.sha256, byteLength: bytes.length });
  }
  return { formatVersion: '1.0.0', dataKind: 'administrativeReferenceSuiteBinding',
    suiteId: 'mvp10-administrative-reference-suite', recordedOn: date, releaseId,
    candidateManifestSha256: candidateHash, evidence, identityAnchors,
    meaning: 'Bereits abgenommene echte AP23-Fallvorlagen, technische Prüfnachweise und separate menschliche Abnahmen B/E bis M3. Direkte R2-Baselinebindungen sowie die davon ausgehenden ausdrücklichen MVP09-Suite- und G1/F3-Belegketten sichern die Originale. Keine neuen Fälle oder nachträglich erfundene Fachfreigaben.',
    newHostTestingClaimed: false, noAdditionalCases: true };
}

/** Only release provenance may change. This is independent of renewed hashes. */
export function assertAllowedDelta(before: Map<string, string>, after: Map<string, string>): void {
  assert.deepEqual([...after.keys()].sort(), [...before.keys()].sort(), 'Runtime inventory changed');
  for (const [path, previousText] of before) {
    const previous = JSON.parse(previousText), current = JSON.parse(after.get(path)!);
    if (path === catalogPath) {
      const copy = structuredClone(current);
      copy.activation.releaseEligibility = previous.activation.releaseEligibility;
      assert.deepEqual(copy, previous, 'Holiday catalog substantive delta');
    } else if (path.startsWith('calendars/')) {
      const copy = structuredClone(current);
      copy.projection.sourceHash = previous.projection.sourceHash;
      assert.deepEqual(copy, previous, `Calendar semantics changed: ${path}`);
    } else if (path === socialPath) {
      assert.deepEqual(without(current, ['review', 'releaseEligibility']), without(previous, ['review', 'releaseEligibility']));
      assert.equal(current.releaseEligibility.length, 50);
      assert.equal(previous.releaseEligibility.length, 50);
      for (let i = 0; i < 50; i++) assert.deepEqual(
        without(current.releaseEligibility[i], ['releaseId', 'status', 'sourceReviewRef', 'componentRefs', 'approval']),
        without(previous.releaseEligibility[i], ['releaseId', 'status', 'sourceReviewRef', 'componentRefs', 'approval']));
    } else if (path === administrativePath) {
      assert.deepEqual(without(current, ['review', 'releaseBinding', 'holidayBindings']), without(previous, ['review', 'releaseBinding', 'holidayBindings']));
      assert.equal(current.holidayBindings.length, 36);
      assert.equal(previous.holidayBindings.length, 36);
      for (let i = 0; i < 36; i++) {
        const old = previous.holidayBindings[i], now = current.holidayBindings[i];
        const field = 'physicalSource' in old ? 'physicalSource' : 'physicalBaseline';
        assert.deepEqual(without(now, [field]), without(old, [field]), 'Legal/calendar selection changed');
        assert.deepEqual(without(now[field], ['releaseId', 'references']), without(old[field], ['releaseId', 'references']));
        assert.equal(now[field].references.length, old[field].references.length);
        for (let j = 0; j < old[field].references.length; j++) assert.deepEqual(
          without(now[field].references[j], ['sha256']), without(old[field].references[j], ['sha256']), 'Physical identity changed');
      }
      assert.deepEqual(without(current.releaseBinding, ['status', 'releaseId', 'approval', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'pathEligibility']),
        without(previous.releaseBinding, ['status', 'releaseId', 'approval', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'pathEligibility']));
      assert.equal(current.releaseBinding.pathEligibility.length, 245);
      assert.equal(previous.releaseBinding.pathEligibility.length, 245);
      for (let i = 0; i < 245; i++) assert.deepEqual(
        without(current.releaseBinding.pathEligibility[i], ['status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256']),
        without(previous.releaseBinding.pathEligibility[i], ['status', 'targetComponentRefs', 'sourceReviewRef', 'referenceSuiteRef', 'holidayBindingSha256']));
      assert.equal(current.runtimeActive, false);
    } else assert.equal(after.get(path), previousText, `Non-promoted artifact changed: ${path}`);
  }
}

export async function preparePromotion() {
  const authority = await requireAuthority();
  await verifyGovernance();
  const sourceBinding = await getSourceApprovalBinding(root);
  const { sourceReviewRef, adminSourceReviewRef } = sourceBinding;
  const rawManifest = await readRegular(root, `${candidateRoot}/manifest.json`);
  assert.equal(hash(rawManifest), candidateHash);
  const candidate = JSON.parse(rawManifest.toString('utf8'));
  assert.equal(candidate.artifacts.length, 44);
  const before = new Map<string, string>();
  for (const descriptor of candidate.artifacts) {
    const bytes = await readRegular(root, `${candidateRoot}/${descriptor.path}`);
    assert.equal(hash(bytes), descriptor.sha256);
    assert.equal(bytes.length, descriptor.byteLength);
    before.set(descriptor.path, bytes.toString('utf8'));
  }
  createFormat17CalculationData(rawManifest.toString('utf8'), before, { mode: 'localReference' });
  const files = new Map(before);
  const approval = { approvedBy: 'David Steimer', approvedOn: date, decisionRef: decisionPath };
  const catalog = JSON.parse(before.get(catalogPath)!);
  catalog.activation.releaseEligibility = { status: 'approved', releaseId,
    approval: { on: date, by: 'David Steimer', evidence: `${decisionPath} | ${sourceApprovalPath} | sha256:${sourceBinding.sha256}` } };
  files.set(catalogPath, text(catalog));
  const calendars = projectActivatedCalendarsV17(catalog, hash(Buffer.from(files.get(catalogPath)!)));
  assert.equal(calendars.length, 35);
  for (const calendar of calendars) files.set(`calendars/${calendar.calendarId}.json`, text(calendar));
  const componentRef = (contentId: string) => {
    const path = contentId === 'ch-holiday-catalog' ? catalogPath : `calendars/${contentId}.json`;
    assert.ok(files.has(path), `Unresolved physical component: ${contentId}`);
    return { role: contentId === 'ch-holiday-catalog' ? 'holidayCatalog' : 'calendar', contentId, sha256: hash(Buffer.from(files.get(path)!)) };
  };
  const social = JSON.parse(before.get(socialPath)!);
  social.review = { reviewedOn: date, status: 'verified', reviewedBy: 'David Steimer',
    basis: 'R10-A2 durch David Steimer abgenommen, lokale R10-B-Ausführung separat freigegeben. 44 Fachregeln, 50 BE-Anbindungen, 2026–2027 und dokumentierte Quellen-/Fassungsgrenzen unverändert. Keine ausserbernische Sozialfreigabe oder Betriebsfreigabe.' };
  social.releaseEligibility = social.releaseEligibility.map((entry: any) => ({ ...entry, releaseId, status: 'approved',
    sourceReviewRef: { ...sourceReviewRef }, componentRefs: ['ch-federal-calendar', 'be-public-holidays', 'ch-holiday-catalog'].map(componentRef), approval: { ...approval } }));
  files.set(socialPath, text(social));
  const suite = await prepareReferenceSuite(authority), suiteBytes = encode(suite);
  const suiteRef = { id: suite.suiteId, sha256: hash(suiteBytes) };
  const administrative = JSON.parse(before.get(administrativePath)!);
  administrative.review = { basis: 'AP23B/E und F–M3 einschliesslich DEC-2026-042 fachlich-technisch abgenommen. R10-B erlaubt ausschliesslich die kontrollierte lokale Datenübernahme und Artefakterstellung.',
    sourceReview: `R10-A2 Quellenabnahme ${sourceApprovalPath} SHA-256 ${sourceBinding.sha256}. Dokumentierte Wiederverwendung, Originaldaten, Normphasen und Vorbehalte bleiben unverändert.`, checkedOn: date };
  administrative.holidayBindings = administrative.holidayBindings.map((binding: any) => {
    const field = 'physicalSource' in binding ? 'physicalSource' : 'physicalBaseline';
    return { ...binding, [field]: { ...binding[field], releaseId,
      references: binding[field].references.map((ref: any) => ({ ...ref, sha256: componentRef(ref.contentId).sha256 })) } };
  });
  const components = new Map<string, ReturnType<typeof componentRef>>();
  for (const binding of administrative.holidayBindings) for (const ref of physical(binding).references) {
    const value = componentRef(ref.contentId), previous = components.get(ref.contentId);
    if (previous) assert.deepEqual(value, previous);
    components.set(ref.contentId, value);
  }
  assert.equal(components.size, 34);
  Object.assign(administrative.releaseBinding, { status: 'approved', releaseId, approval: { ...approval },
    targetComponentRefs: [...components.values()], sourceReviewRef: { ...adminSourceReviewRef }, referenceSuiteRef: { ...suiteRef } });
  administrative.releaseBinding.pathEligibility = administrative.releaseBinding.pathEligibility.map((entry: any) => {
    const binding = administrative.holidayBindings.find((row: any) => row.holidayBindingId === entry.holidayBindingId);
    assert.ok(binding);
    return { ...entry, status: 'approved', holidayBindingSha256: socialObjectSha256(binding),
      targetComponentRefs: administrativeBindingReferencesV10(binding).map(ref => componentRef(ref.contentId)),
      sourceReviewRef: { ...adminSourceReviewRef }, referenceSuiteRef: { ...suiteRef } };
  });
  files.set(administrativePath, text(administrative));
  assertAllowedDelta(before, files);
  const unchangedArtifacts = [...before].filter(([path, value]) => files.get(path) === value).length;
  assert.equal(unchangedArtifacts, 6);
  const artifacts = candidate.artifacts.map((item: any) => ({ ...item,
    byteLength: Buffer.byteLength(files.get(item.path)!), sha256: hash(Buffer.from(files.get(item.path)!)) }));
  const governanceBytes = await readRegular(root, adoptionPath), bridgeBytes = await readRegular(root, bridgePath);
  const sourceApproval = JSON.parse((await readRegular(root, sourceApprovalPath)).toString('utf8'));
  const evidence = {
    sourceReviewRef, localBuildApproval: { path: authorityPath, sha256: authority.sha256 },
    sourceGovernance: { path: adoptionPath, sha256: hash(governanceBytes) },
    sourceVersionBridges: { path: bridgePath, sha256: hash(bridgeBytes) },
    administrativeReferenceSuite: { path: suitePath, sha256: hash(suiteBytes) }
  };
  const manifest = { ...candidate,
    $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/release-manifest-v17.schema.json',
    releaseId, releaseStatus: 'approved', createdOn: date, artifacts,
    sourceSummary: { ...candidate.sourceSummary, latestReviewedOn: date, legalBasisReviewStatus: 'verified', technicalValidationStatus: 'passed' },
    extensions: {
      'steimer.approval': { ...approval, approvalScope: 'mvp10LocalDataAndReleaseArtifacts', contractDecision: 'DEC-2026-042',
        candidateReleaseId: candidate.releaseId, candidateManifestSha256: candidateHash, ...evidence,
        sourceReviewPath: sourceApprovalPath, sourceApprovalId: sourceApproval.approvalId,
        historicalSourceMetadataUnchanged: true },
      'steimer.release-preparation': { preparedOn: date, appVersion: '0.10.0', sourceRefresh: 'acceptedWithDocumentedReuseAndReservations',
        publicationApproved: false, deploymentApproved: false, productionActivation: false, operatingApproval: 'requiresSeparateDecision' }
    } };
  const manifestText = text(manifest);
  const runtime = createFormat17CalculationData(manifestText, files, { mode: 'approved' });
  assert.equal(runtime.calendarRuntime.referenceOnly, false);
  assert.ok(runtime.administrativeContext);
  files.set('manifest.json', manifestText);
  return { files, suiteBytes, manifest, before, report: {
    kind: 'mvp10LocalDataPromotion', preparedOn: date, releaseId, dataStatus: 'approved',
    publicationApproved: false, deploymentApproved: false, productionActivation: false, operatingApproval: false,
    sourceReviewAccepted: true, implementationAccepted: true, manifestSha256: hash(Buffer.from(manifestText)),
    candidateManifestSha256: candidateHash, candidatePath: candidateRoot, candidateReleaseId: candidate.releaseId, ...evidence,
    counts: { artifacts: 44, runtimeFiles: 45, unchangedArtifacts, metadataOnlyArtifacts: 38, metadataOnlyRuntimeFiles: 39,
      calendars: 35, catalogRules: 479, supplementalRules: 20, provenanceDecisions: 198, terminalBindings: 104,
      federalRules: 44, cantonalBindings: 50, approvedSocialEligibility: 50, administrativePaths: 245,
      qualificationPolicies: 245, holidayBindings: 36, suspensionProfiles: 46, administrativeTargetComponents: components.size,
      bernGeneralPathsInPreservedProfile: 9, manifestSources: manifest.sourceSummary.sourceIds.length,
      referenceEvidence: suite.evidence.length },
    legalContentUnchanged: true, historicalSourceMetadataUnchanged: true,
    validation: { approvedReader: 'passed', narrowSemanticDelta: 'passed', independentValidator: 'requiredBeforeDataCommit' }
  } };
}

export async function writePromotion() {
  const prepared = await preparePromotion();
  const writes: Array<[string, Uint8Array | string]> = [...prepared.files].map(([path, bytes]) => [`data/releases/${releaseId}/${path}`, bytes]);
  writes.push([suitePath, prepared.suiteBytes], [reportPath, encode(prepared.report)]);
  for (const [path, bytes] of writes) {
    const previous = await readRegular(root, path, true);
    if (previous) assert.deepEqual(previous, Buffer.from(bytes), `Existing destination differs: ${path}`);
  }
  for (const [path, bytes] of writes) await writeExclusive(root, path, Buffer.from(bytes));
  return prepared.report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(process.argv[2] === '--write' ? await writePromotion() : (await preparePromotion()).report, null, 2));
}
