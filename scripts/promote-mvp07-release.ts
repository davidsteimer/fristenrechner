// SPDX-License-Identifier: AGPL-3.0-only
// Controlled, deterministic, append-only promotion. No deployment or remote action.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, lstat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createFormat7CalculationData } from '../src/core/calculatorRuntime';
import { projectActivatedCalendars } from '../src/core/holidayActivation';
import { FORMAT7_LEGACY_CALENDAR_BASELINE } from '../src/core/format7Baseline';
import { requireLocalBuildApproval } from './record-mvp07-local-build-approval.mjs';
import { verifyMvp07Governance } from './adopt-mvp07-source-governance.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const prefix = 'outputs/release-mvp07-2026-10-08';
export const releaseId = '2026-10-08-mvp-07-approved.1';
export const candidatePath = 'outputs/ap22c3-2026-10-08/bundle';
export const sourceApprovalSha256 = '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810';
export const sourceReviewRef = { reviewId: 'MVP07-SOURCE-APPROVAL-20261008', sha256: sourceApprovalSha256 };
export const decisionRef = 'docs/betrieb/freigabe-r07-b.md';
export const calendarApprovalEvidence = `${decisionRef} | ${prefix}/source-approval.json | sha256:${sourceApprovalSha256}`;
const catalogPath = 'holiday-catalogs/ch-holiday-catalog.json';
const socialPath = 'social-procedures/ch-social-procedures.json';
export const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex');
const encode = (value: unknown): string => JSON.stringify(value, null, 2) + '\n';
const omit = (value: Record<string, unknown>, keys: string[]): Record<string, unknown> => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
async function regular(path: string, repository = root): Promise<Buffer> {
  assert.ok(path.length > 0 && !path.startsWith('/') && path.split('/').every(part => part && part !== '..' && part !== '.'));
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const stat = await lstat(resolve(repository, parts.slice(0, i).join('/')));
    assert.ok(!stat.isSymbolicLink() && (i === parts.length ? stat.isFile() : stat.isDirectory()), `Not a regular file path: ${path}`);
  }
  return readFile(resolve(repository, path));
}
export async function prepareMvp07Promotion() {
  const authority = await requireLocalBuildApproval(root);
  await verifyMvp07Governance(root);
  const candidateBytes = await regular(`${candidatePath}/manifest.json`);
  assert.equal(sha(candidateBytes), 'b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6');
  const candidate = JSON.parse(candidateBytes.toString());
  assert.equal(candidate.releaseStatus, 'candidate');
  assert.equal(candidate.artifacts.length, 40);
  const before = new Map<string, string>();
  for (const item of candidate.artifacts) {
    const bytes = await regular(`${candidatePath}/${item.path}`);
    assert.equal(sha(bytes), item.sha256);
    assert.equal(bytes.length, item.byteLength);
    before.set(item.path, bytes.toString('utf8'));
  }
  createFormat7CalculationData(candidateBytes.toString('utf8'), before, { mode: 'localReference' });
  const files = new Map(before);
  const catalog = JSON.parse(before.get(catalogPath)!);
  catalog.activation.releaseEligibility = { status: 'approved', releaseId,
    approval: { on: '2026-10-08', by: 'David Steimer', evidence: calendarApprovalEvidence } };
  assert.deepEqual(omit(catalog.activation, ['releaseEligibility']), omit(JSON.parse(before.get(catalogPath)!).activation, ['releaseEligibility']));
  assert.deepEqual(omit(catalog, ['activation']), omit(JSON.parse(before.get(catalogPath)!), ['activation']));
  files.set(catalogPath, encode(catalog));
  const catalogHash = sha(files.get(catalogPath)!);
  const calendars = projectActivatedCalendars(catalog, catalogHash, FORMAT7_LEGACY_CALENDAR_BASELINE);
  assert.equal(calendars.length, 32);
  for (const calendar of calendars) {
    const path = `calendars/${calendar.calendarId}.json`;
    const previous = JSON.parse(before.get(path)!);
    assert.deepEqual(omit(calendar as unknown as Record<string, unknown>, ['projection']), omit(previous, ['projection']), `Changed calendar content: ${path}`);
    assert.deepEqual(omit(calendar.projection as unknown as Record<string, unknown>, ['sourceHash']), omit(previous.projection, ['sourceHash']));
    files.set(path, encode(calendar));
  }
  const social = JSON.parse(before.get(socialPath)!);
  const oldSocial = structuredClone(social);
  const approval = { approvedBy: 'David Steimer', approvedOn: '2026-10-08', decisionRef };
  const componentRefs = ['ch-federal-calendar', 'be-public-holidays'].map(contentId => ({
    role: 'calendar', contentId, sha256: sha(files.get(`calendars/${contentId}.json`)!)
  }));
  componentRefs.push({ role: 'holidayCatalog', contentId: 'ch-holiday-catalog', sha256: catalogHash });
  social.review = { reviewedOn: '2026-10-08', status: 'verified', reviewedBy: 'David Steimer',
    basis: 'AP22C3 und Quellenprüfung MVP 0.7 abgenommen. R07-B erlaubt die lokale Releasebindung. 44 Fachregeln, 50 BE-Anbindungen und deren Grenzen unverändert. Quellenprüfung mit dokumentierter Wiederverwendung und Vorbehalten. Keine Installation, Veröffentlichung oder Betriebsfreigabe.' };
  social.releaseEligibility = social.releaseEligibility.map((item: Record<string, unknown>) => ({
    ...item, releaseId, status: 'approved', sourceReviewRef: { ...sourceReviewRef },
    componentRefs: structuredClone(componentRefs), approval: { ...approval }
  }));
  assert.deepEqual(omit(social, ['review', 'releaseEligibility']), omit(oldSocial, ['review', 'releaseEligibility']));
  assert.equal(social.federalRules.length, 44);
  assert.equal(social.cantonalBindings.length, 50);
  assert.equal(social.releaseEligibility.length, 50);
  for (let i = 0; i < 50; i++) assert.deepEqual(
    omit(social.releaseEligibility[i], ['releaseId', 'status', 'sourceReviewRef', 'componentRefs', 'approval']),
    omit(oldSocial.releaseEligibility[i], ['releaseId', 'status', 'sourceReviewRef', 'componentRefs', 'approval']));
  files.set(socialPath, encode(social));
  const artifacts = candidate.artifacts.map((item: { path: string }) => ({ ...item,
    byteLength: Buffer.byteLength(files.get(item.path)!), sha256: sha(files.get(item.path)!) }));
  const unchangedArtifacts = candidate.artifacts.filter((item: { role: string }) => ['legalProfile', 'specialRegimeCatalog'].includes(item.role));
  assert.equal(unchangedArtifacts.length, 6);
  for (const item of unchangedArtifacts) assert.equal(files.get(item.path), before.get(item.path));
  const sourceApproval = JSON.parse((await regular(`${prefix}/source-approval.json`)).toString());
  const governancePath = `${prefix}/source-governance-adoption.json`;
  const governanceBytes = await regular(governancePath);
  const governance = JSON.parse(governanceBytes.toString());
  assert.equal(governance.releaseId, releaseId);
  const manifest = { ...candidate,
    $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/release-manifest-v7.schema.json',
    releaseId, releaseStatus: 'approved', createdOn: '2026-10-08', artifacts,
    sourceSummary: { ...candidate.sourceSummary, latestReviewedOn: '2026-10-08', legalBasisReviewStatus: 'verified' },
    extensions: {
      'steimer.approval': { ...approval, approvalScope: 'mvp07LocalDataAndReleaseArtifacts', contractDecision: 'DEC-2026-030',
        candidateReleaseId: candidate.releaseId, candidateManifestSha256: sha(candidateBytes),
        sourceReviewRef, sourceReviewPath: `${prefix}/source-approval.json`, sourceApprovalId: sourceApproval.approvalId,
        localBuildApproval: { path: `${prefix}/local-build-approval.json`, sha256: authority.sha256 },
        sourceGovernance: { path: governancePath, sha256: sha(governanceBytes) },
        sourceVersionBridges: { path: `${prefix}/source-version-bridges.json`, sha256: sha(await regular(`${prefix}/source-version-bridges.json`)) },
        historicalSourceMetadataUnchanged: true },
      'steimer.release-preparation': { preparedOn: '2026-10-08', appVersion: '0.7.0',
        sourceRefresh: 'acceptedWithDocumentedReuseAndReservations', publicationApproved: false,
        deploymentApproved: false, productionActivation: false, operatingApproval: 'requiresSeparateDecision' }
    }
  };
  const manifestText = encode(manifest);
  const runtime = createFormat7CalculationData(manifestText, files, { mode: 'approved' });
  assert.equal(runtime.calendarRuntime.referenceOnly, false);
  files.set('manifest.json', manifestText);
  const report = { kind: 'mvp07LocalDataPromotion', preparedOn: '2026-10-08', releaseId, dataStatus: 'approved',
    implementationAccepted: true, sourceReviewAccepted: true, publicationApproved: false, deploymentApproved: false,
    productionActivation: false, manifestSha256: sha(manifestText), candidateManifestSha256: sha(candidateBytes),
    candidatePath, candidateReleaseId: candidate.releaseId, sourceReviewRef,
    sourceApprovalId: sourceApproval.approvalId, sourceReviewPath: `${prefix}/source-approval.json`,
    localBuildApproval: manifest.extensions['steimer.approval'].localBuildApproval,
    sourceGovernance: manifest.extensions['steimer.approval'].sourceGovernance,
    sourceVersionBridges: manifest.extensions['steimer.approval'].sourceVersionBridges,
    decisionRef, decisionSha256: sha(await regular(decisionRef)),
    counts: { artifacts: 40, runtimeFiles: 41, unchangedArtifacts: 6, calendars: 32, catalogRules: 479,
      supplementalRules: 12, provenanceDecisions: 198, terminalBindings: 104, federalRules: 44, cantonalBindings: 50, approvedEligibility: 50 },
    unchangedArtifacts, legalContentUnchanged: true, historicalSourceMetadataUnchanged: true,
    validation: { core: 'passed', python: 'requiredBeforeWrite' } };
  return { files, report };
}
export async function validateMvp07Promotion(prepared: Awaited<ReturnType<typeof prepareMvp07Promotion>>) {
  await mkdir(resolve(root, '.work'), { recursive: true });
  const temp = await mkdtemp(resolve(root, '.work/mvp07-promotion-check-'));
  for (const [name, text] of prepared.files) {
    await mkdir(dirname(resolve(temp, name)), { recursive: true });
    await writeFile(resolve(temp, name), text, { flag: 'wx' });
  }
  const check = spawnSync(resolve(root, '.venv/bin/python'), ['tests/data/validate_mvp07_release.py', temp], {
    cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  assert.equal(check.status, 0, `Independent validation failed: ${check.stdout}\n${check.stderr}`);
  return { ...prepared, report: { ...prepared.report, validation: { core: 'passed', python: 'passed', result: JSON.parse(check.stdout) } } };
}
async function appendOnly(path: string, bytes: string | Buffer) {
  await mkdir(dirname(resolve(root, path)), { recursive: true });
  try { await writeFile(resolve(root, path), bytes, { flag: 'wx' }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  assert.ok((await regular(path)).equals(Buffer.from(bytes)), `Existing release file differs: ${path}`);
}
export async function writeMvp07Promotion() {
  const prepared = await validateMvp07Promotion(await prepareMvp07Promotion());
  const writes: [string, string | Buffer][] = [...prepared.files].map(([path, bytes]) => [`data/releases/${releaseId}/${path}`, bytes]);
  writes.push([`${prefix}/data-promotion.json`, encode(prepared.report)]);
  for (const name of ['release-manifest-v7.schema.json', 'calendar-rules-v3.schema.json', 'holiday-catalog-v2.schema.json']) {
    writes.push([`schemas/${name}`, await regular(`schemas/implementation/ap22c1/${name}`)]);
  }
  const manifestText = prepared.files.get('manifest.json')!;
  const rawFiles = [...prepared.files].filter(([name]) => name !== 'manifest.json');
  const module = `// SPDX-License-Identifier: AGPL-3.0-only\n// Generated by promote-mvp07-release.ts from approved original bytes.\nimport { createFormat7CalculationData } from '../core/calculatorRuntime';\nexport const mvp07ManifestText = ${JSON.stringify(manifestText)};\nexport const mvp07Files: ReadonlyMap<string, string> = new Map(${JSON.stringify(rawFiles)});\nexport const mvp07Runtime = createFormat7CalculationData(mvp07ManifestText, mvp07Files, { mode: 'approved' });\nexport const mvp07CalculationData = mvp07Runtime.data;\n`;
  writes.push(['src/release/mvp07ReleaseData.ts', module]);
  // Preflight every destination before the first promotion write.
  for (const [path, bytes] of writes) {
    try { assert.ok((await regular(path)).equals(Buffer.from(bytes)), `Existing release file differs: ${path}`); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  for (const [path, bytes] of writes) await appendOnly(path, bytes);
  return prepared.report;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.equal(process.argv.length, 2, 'No overwrite or deployment flags supported');
  console.log(JSON.stringify(await writeMvp07Promotion(), null, 2));
}
