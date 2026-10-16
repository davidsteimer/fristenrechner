#!/usr/bin/env node
/**
 * Explicit local derivation of a small public evidence set.
 * Import and --verify are read-only. --prepare requires the original local reports.
 * Historical source statuses remain historical, not current release permissions.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const OUTPUT = 'outputs/publication-mvp08-2026-10-16/evidence';
export const MANIFEST = OUTPUT + '/manifest.json';
export const SELF = 'scripts/prepare-mvp08-public-evidence.mjs';
export const RELEASE = '2026-10-15-mvp-08-approved.1';
export const SPECS = [
  {
    "id": "01",
    "category": "historical-ap23",
    "source": "outputs/ap23d2-2026-10-15/product-regression-initial-harness-failure.txt",
    "sourceSha256": "7cd65478382dc67c842b025d21f91783a2c3f0eed832f6c7c6ff262f5566f1fd",
    "sourceByteLength": 693096,
    "output": "ap23/d2-initial-harness-failure.txt"
  },
  {
    "id": "02",
    "category": "historical-ap23",
    "source": "outputs/ap23d3-2026-10-15/spfx-build.json",
    "sourceSha256": "3f23d4e1d4a23de0aa791c975dd6b5b6102361e5f94b24b29ff5a5f17bf26b35",
    "sourceByteLength": 21502,
    "output": "ap23/d3-spfx-build.json"
  },
  {
    "id": "03",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-built-tests.log",
    "sourceSha256": "413975fe588f4850f7a56e63b610d5329f5f7b7b89db19da491e78d1afb852ce",
    "sourceByteLength": 34763,
    "output": "build/built-tests.txt"
  },
  {
    "id": "04",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-compile.log",
    "sourceSha256": "a4b5f2f0b9dc305f46c324ae32eaca0ae2ef3095ac186236af396d3e69de021d",
    "sourceByteLength": 8950,
    "output": "build/compile.txt"
  },
  {
    "id": "05",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-css-audit.log",
    "sourceSha256": "e0e51bb6da9d4ec7fa8d7a230b0b076a419a0123f263a7f8024c1f958e01db6a",
    "sourceByteLength": 69,
    "output": "build/css-audit.txt"
  },
  {
    "id": "06",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-package.log",
    "sourceSha256": "9f1c6d6a099621953f3cf42f842657f28fe89466d3f40f3ac0bc3aebf4eaf8f7",
    "sourceByteLength": 6227,
    "output": "build/package.txt"
  },
  {
    "id": "07",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-source-tests.log",
    "sourceSha256": "6277dad18aaaf43681fa1c821df6f485e4f9826ea17a2bb2b2b6bd0313b4b253",
    "sourceByteLength": 43991,
    "output": "build/source-tests.txt"
  },
  {
    "id": "08",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-sync.log",
    "sourceSha256": "b09161c434779a2c3c967982921a9ec1ea86a269810c0c7c7aa309bac942c593",
    "sourceByteLength": 197,
    "output": "build/sync.txt"
  },
  {
    "id": "09",
    "category": "historical-product-build",
    "source": "outputs/release-mvp08-2026-10-15/build-evidence/logs/mvp08-product-build-jI3Ehy-web-build.log",
    "sourceSha256": "454dab7ebb729ce280c3a9b324d3a79583fd9da4112e4a858a3cdf9c557f281b",
    "sourceByteLength": 128,
    "output": "build/web-build.txt"
  },
  {
    "id": "10",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/built-tests.log",
    "sourceSha256": "a20d0a8432889f82286e6846b53620f71e5587c4e74588be6c7d2e79df335e5e",
    "sourceByteLength": 27147,
    "output": "recovery-first-attempt/built-tests.txt"
  },
  {
    "id": "11",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/compile.log",
    "sourceSha256": "69dfd5cbe1a3d2c51aac7be7173654024f07897fd0c518f2250e3979cc1035a5",
    "sourceByteLength": 6319,
    "output": "recovery-first-attempt/compile.txt"
  },
  {
    "id": "12",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/css-audit.log",
    "sourceSha256": "00aaa5e38dbef617af7d1da6ecd11b623c95699c5c9d3cc34fb2fc7f7c88a8b9",
    "sourceByteLength": 69,
    "output": "recovery-first-attempt/css-audit.txt"
  },
  {
    "id": "13",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/package.log",
    "sourceSha256": "f1fb2147d813586fe89657a7824ba65e9a6c217bf004f67a3a224584ba6bfc68",
    "sourceByteLength": 6122,
    "output": "recovery-first-attempt/package.txt"
  },
  {
    "id": "14",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/recovery-tests.log",
    "sourceSha256": "52662b5d2ca29349e1cb5f7f997c636770bb50a23ceaa102e0cdc8867dc6bb4f",
    "sourceByteLength": 2598,
    "output": "recovery-first-attempt/recovery-tests.txt"
  },
  {
    "id": "15",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/source-tests.log",
    "sourceSha256": "6d87d5735768e5201c0447704236d0de67c385c970b2bc469ed36ac906ba259b",
    "sourceByteLength": 39727,
    "output": "recovery-first-attempt/source-tests.txt"
  },
  {
    "id": "16",
    "category": "historical-failed-recovery-attempt",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/attempts/first-failed/sync.log",
    "sourceSha256": "5daaaf376e44ca608965ae073818f8319a75b3fb00fd502a2fe5c55a54553c25",
    "sourceByteLength": 197,
    "output": "recovery-first-attempt/sync.txt"
  },
  {
    "id": "17",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/built-tests.log",
    "sourceSha256": "c168be64f0d61853d2bbc2982e2d1be03e57f566ba54edaa716419d7021d3a23",
    "sourceByteLength": 27155,
    "output": "recovery-final/built-tests.txt"
  },
  {
    "id": "18",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/compile.log",
    "sourceSha256": "8b7b30b1eb6240f38f71424492e161a0ada3f1a757af87369880df896aec9030",
    "sourceByteLength": 6319,
    "output": "recovery-final/compile.txt"
  },
  {
    "id": "19",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/css-audit.log",
    "sourceSha256": "4bab332ce799b00cc75620b404fe5e2116c36bc296c66d6eeed325f23727112f",
    "sourceByteLength": 69,
    "output": "recovery-final/css-audit.txt"
  },
  {
    "id": "20",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/package.log",
    "sourceSha256": "b585f00c552776c0ef8493f955a057546479e19f6e62cb0d39ea378eb4f61e41",
    "sourceByteLength": 6122,
    "output": "recovery-final/package.txt"
  },
  {
    "id": "21",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/recovery-tests.log",
    "sourceSha256": "37a8864092d01247b81444cc357b948d41e7e5e7bd8f0654282ec291916a6718",
    "sourceByteLength": 2419,
    "output": "recovery-final/recovery-tests.txt"
  },
  {
    "id": "22",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/source-tests.log",
    "sourceSha256": "daf8daa94c88fb110995d8f1442c7ce0addd4b5b427e5403e490033b1ea04d00",
    "sourceByteLength": 39722,
    "output": "recovery-final/source-tests.txt"
  },
  {
    "id": "23",
    "category": "historical-recovery-build",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/logs/sync.log",
    "sourceSha256": "5daaaf376e44ca608965ae073818f8319a75b3fb00fd502a2fe5c55a54553c25",
    "sourceByteLength": 197,
    "output": "recovery-final/sync.txt"
  },
  {
    "id": "24",
    "category": "historical-source-review",
    "source": "outputs/release-mvp08-2026-10-15/source-review-verification.json",
    "sourceSha256": "487744ce4462f247efbb53079b1a605c02628daebae768123bcb16860ccd768f",
    "sourceByteLength": 5995,
    "output": "summaries/source-review-verification.json",
    "selectedFields": [
      "verificationId",
      "checkedOn",
      "startedAt",
      "completedAt",
      "technicalValidationPassed",
      "humanApproval",
      "sourceReleaseApproved",
      "dataPromotionApproved",
      "publicationApproved",
      "productDataChanged",
      "deploymentPerformed",
      "counts",
      "normChangeCounts",
      "tests",
      "humanReadableReport",
      "limitations"
    ]
  },
  {
    "id": "25",
    "category": "historical-source-review",
    "source": "outputs/release-mvp08-2026-10-15/source-approval.json",
    "sourceSha256": "53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026",
    "sourceByteLength": 157937,
    "output": "summaries/source-approval.json",
    "selectedFields": [
      "formatVersion",
      "dataKind",
      "approvalId",
      "approvedOn",
      "approvedBy",
      "recordStatus",
      "declaration",
      "decisionRef",
      "candidateReleaseId",
      "permissions",
      "scope",
      "acceptedNormBridges",
      "explicitBoundedReuse",
      "retainedLimits",
      "responsibility",
      "nextGate"
    ]
  },
  {
    "id": "26",
    "category": "historical-local-release",
    "source": "outputs/release-mvp08-2026-10-15/artifact-verification.json",
    "sourceSha256": "5307901a72a32537ffc8f05cefa250341c42a5d21fc387a64df04ea2c1e369c2",
    "sourceByteLength": 15676,
    "output": "summaries/artifact-verification.json",
    "selectedFields": [
      "kind",
      "status",
      "releaseId",
      "applicationVersion",
      "packageVersion",
      "localDataCommit",
      "manifestSha256",
      "authority",
      "buildProof",
      "buildAudit",
      "packageAudit",
      "artifacts",
      "installationAuthorized",
      "publicationAuthorized",
      "operatingApproval",
      "remotePinVerified",
      "realM365TestsPerformed"
    ]
  },
  {
    "id": "27",
    "category": "historical-local-release",
    "source": "outputs/release-mvp08-2026-10-15/local-completion.json",
    "sourceSha256": "68a91b538cc7437d91932e04cf3bb320a0378c201714d0e440aa36ec7e957864",
    "sourceByteLength": 135213,
    "output": "summaries/local-completion.json",
    "selectedFields": [
      "kind",
      "recordedAt",
      "status",
      "authority",
      "applicationVersion",
      "packageVersion",
      "recoveryPackageVersion",
      "recoveryFunctionality",
      "releaseId",
      "dataCommit",
      "parent",
      "additionalCommits",
      "dataManifest",
      "artifacts",
      "priorInputs",
      "builtProductUnchanged",
      "finalChecks",
      "installationPerformed",
      "uploadsPerformed",
      "githubPushPerformed",
      "outlookImportsPerformed",
      "operationalApprovalGranted",
      "realM365TestsPerformed",
      "remoteDataPinPublicationVerified",
      "remaining"
    ]
  },
  {
    "id": "28",
    "category": "historical-local-release",
    "source": "outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/artifact-verification.json",
    "sourceSha256": "e70bbf13dca3d5aa94044e70fe0aeb82e2f8b0a6945c23093a266ed5bea1c7f7",
    "sourceByteLength": 606824,
    "output": "summaries/recovery-build.json",
    "selectedFields": [
      "kind",
      "startedAt",
      "finishedAt",
      "packageVersion",
      "applicationVersion",
      "functionalBaseline",
      "authority",
      "installationAuthorized",
      "deploymentPerformed",
      "publicationAuthorized",
      "liveHostVerified",
      "browserResetAuthorized",
      "roundTripMvp08Pending",
      "steps",
      "limitations",
      "priorFailedAttempt",
      "packageAudit",
      "packageSha256",
      "packageByteLength",
      "passed"
    ]
  },
  {
    "id": "29",
    "category": "historical-local-release",
    "source": "outputs/release-mvp08-2026-10-15/recovery-roundtrip/verification.json",
    "sourceSha256": "07a5187e4869104568ca0d39b70bc4bee9ec3a427780ff450b129bb8504526e4",
    "sourceByteLength": 56920,
    "output": "summaries/recovery-roundtrip.json",
    "selectedFields": [
      "kind",
      "startedAt",
      "finishedAt",
      "status",
      "authority",
      "normalPackage",
      "recoveryPackage",
      "functionalSequence",
      "cases",
      "limitation",
      "subsequentRealMvp08PackageMustExceed",
      "installationAuthorized",
      "actualDeploymentPerformed",
      "publicationAuthorized",
      "browserDataResetPerformed",
      "steps"
    ]
  },
  {
    "id": "30",
    "category": "historical-outlook-assessment",
    "source": "outputs/release-mvp08-2026-10-15/outlook-final-artifact-supplement.json",
    "sourceSha256": "91c281872265198d322e84b57d3fc8efa22b6c42d0e46edacdf670b102d327bc",
    "sourceByteLength": 8894,
    "output": "summaries/outlook-final-artifact-supplement.json",
    "selectedFields": [
      "kind",
      "status",
      "releaseId",
      "manifestSha256",
      "applicationVersion",
      "packageVersion",
      "priorAssessmentUnchanged",
      "artifactVerification",
      "buildProof",
      "definitiveArtifacts",
      "browserProof",
      "browserVersion",
      "browserExports",
      "packagedAmdExports",
      "actualBrowserDownloads",
      "simulatedPackagedDownloads",
      "readOnlyReverificationOfExistingEvidence",
      "newBrowserSessionPerformedByThisScript",
      "proposedReuseScope",
      "m365HostTestsPerformed",
      "publicProductionHostTestsPerformed",
      "actualDeviceTestsPerformed",
      "outlookImportsPerformed",
      "mailboxChanged",
      "humanReuseAccepted",
      "installationAuthorized",
      "publicationAuthorized",
      "operatingApproval"
    ]
  }
];
export const RULES = [
  'repo-file-uri-to-placeholder',
  'repo-root-to-placeholder',
  'other-user-home-to-placeholder',
  'macos-temp-root-to-placeholder',
  'temporary-root-to-placeholder'
];
const historyLimit = 'Historical source status, dates, failures and permission flags are retained. This copy does not assert current approval or repeat the original tests.';
const verificationLimit = 'Only the selected public copies are verifiable here. Original reports, omitted fields, full archives and raw legal sources are not required or reproduced. The external publication positive list must pin this manifest.';
export function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
function safeRelative(path) {
  assert.equal(typeof path, 'string');
  assert.ok(path && !isAbsolute(path) && !path.includes('\\') && !path.includes('\0'), 'Unsafe path');
  assert.ok(path.split('/').every(v => v && v !== '.' && v !== '..'), 'Unsafe path segment');
  return path;
}
async function regular(root, path) {
  safeRelative(path);
  let current = root;
  for (const part of path.split('/')) {
    current = resolve(current, part);
    const stat = await lstat(current);
    assert.ok(!stat.isSymbolicLink(), 'Symlinks are not evidence files: ' + path);
  }
  const stat = await lstat(current);
  assert.ok(stat.isFile(), 'Not a regular file: ' + path);
  return readFile(current);
}
function replaceAllCount(text, from, to, counts, key) {
  if (!from || !text.includes(from)) return text;
  const pieces = text.split(from);
  counts[key] += pieces.length - 1;
  return pieces.join(to);
}
export function redactPaths(input, root = ROOT) {
  assert.equal(typeof input, 'string');
  const counts = Object.fromEntries(RULES.map(key => [key, 0]));
  let text = input;
  const rootPath = resolve(root).replace(/\\/g, '/');
  for (const uri of [pathToFileURL(rootPath).href, 'file://' + rootPath]) {
    text = replaceAllCount(text, uri, '<REPO_FILE_URI>', counts, RULES[0]);
  }
  text = replaceAllCount(text, rootPath, '<REPO_ROOT>', counts, RULES[1]);
  text = text.replace(/(?:file:\/\/)?\/Users\/[^/\s"'\\]+(?=\/)/g, () => {
    counts[RULES[2]] += 1;
    return '<USER_HOME>';
  });
  text = text.replace(/(?:file:\/\/)?\/(?:private\/)?var\/folders\/[^/\s"'\\]+\/[^/\s"'\\]+\/[TC](?=\/)/g, () => {
    counts[RULES[3]] += 1;
    return '<SYSTEM_TEMP>';
  });
  text = text.replace(/(?:file:\/\/)?\/(?:private\/)?tmp(?=\/)/g, () => {
    counts[RULES[4]] += 1;
    return '<SYSTEM_TEMP>';
  });
  return { text, counts };
}
export function assertPublicText(text) {
  const forbidden = [
    /\/Users\/[A-Za-z0-9_.-]+\//,
    /\/(?:private\/)?var\/folders\//,
    /(?:https?:\/\/)[a-z0-9-]+\.sharepoint\.com/i,
    /-----BEGIN (?:OPENSSH |RSA |EC |DSA )?PRIVATE KEY-----/,
    /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
    /[A-Za-z0-9._%+-]+@(?:justice\.be\.ch|steimer\.ch)/i,
    /file:\/\//i
  ];
  for (const pattern of forbidden) assert.ok(!pattern.test(text), 'Unexpected private text pattern');
}
export function selectSummary(source, spec) {
  assert.ok(source && typeof source === 'object' && !Array.isArray(source));
  const data = {};
  for (const key of spec.selectedFields) {
    assert.ok(Object.hasOwn(source, key), 'Missing selected field: ' + key);
    data[key] = source[key];
  }
  return {
    kind: 'mvp08-public-historical-evidence-summary',
    sourceRecordStatusIsHistorical: true,
    sourcePath: spec.source,
    selectedFields: spec.selectedFields,
    omittedTopLevelFields: Object.keys(source).filter(key => !spec.selectedFields.includes(key)),
    limitation: verificationLimit,
    historicalStatusNotice: historyLimit,
    data
  };
}
export function derive(bytes, spec, root = ROOT) {
  assert.equal(bytes.length, spec.sourceByteLength, 'Original byte length changed: ' + spec.source);
  assert.equal(sha256(bytes), spec.sourceSha256, 'Original SHA-256 changed: ' + spec.source);
  const original = bytes.toString('utf8');
  assert.ok(Buffer.from(original, 'utf8').equals(bytes), 'Source is not exact UTF-8');
  const selected = spec.selectedFields ? encode(selectSummary(JSON.parse(original), spec)).toString('utf8') : original;
  const redacted = redactPaths(selected, root);
  assertPublicText(redacted.text);
  if (spec.output.endsWith('.json')) JSON.parse(redacted.text);
  return { bytes: Buffer.from(redacted.text), redactionCounts: redacted.counts };
}
function outputPath(spec) { return OUTPUT + '/' + safeRelative(spec.output); }
function entryFor(spec, derived) {
  return {
    id: spec.id,
    category: spec.category,
    evidenceType: spec.selectedFields ? 'selected-field-summary' : 'path-redacted-copy',
    source: {
      path: spec.source, sha256: spec.sourceSha256, byteLength: spec.sourceByteLength,
      availability: spec.source.endsWith('/source-approval.json') ? 'public-anchor-selected-separately' : 'private-original-not-required'
    },
    output: { path: outputPath(spec), sha256: sha256(derived.bytes), byteLength: derived.bytes.length },
    transformation: {
      kind: spec.selectedFields ? 'selected-field-summary-with-path-redaction' : 'path-redaction-only',
      ...(spec.selectedFields ? { selectedFields: spec.selectedFields } : {}),
      rules: RULES, redactionCounts: derived.redactionCounts
    },
    limitations: [historyLimit, verificationLimit]
  };
}
export async function prepare(root = ROOT) {
  const outputs = [], entries = [];
  for (const spec of SPECS) {
    const bytes = await regular(root, spec.source);
    const derived = derive(bytes, spec, root);
    outputs.push({ path: outputPath(spec), bytes: derived.bytes });
    entries.push(entryFor(spec, derived));
  }
  const generator = await regular(root, SELF);
  const manifest = {
    formatVersion: '1.0.0',
    kind: 'mvp08-public-evidence-manifest',
    preparedOn: '2026-10-16',
    releaseId: RELEASE,
    evidenceFileCount: entries.length,
    status: 'local-publication-preparation-not-publication-approval',
    generator: { path: SELF, sha256: sha256(generator), byteLength: generator.length },
    scope: {
      publicCopyIntegrityOnly: true, originalsRequiredForPublicVerification: false,
      fullArchiveReproductionClaimed: false, originalReportsChanged: false,
      rawLegalSourcesIncluded: false, newTestsOfProductClaimed: false,
      publicationAuthorizedByThisManifest: false
    },
    redactionRules: RULES,
    entries,
    limitations: [
      historyLimit, verificationLimit,
      'Selected-field summaries omit explicitly listed top-level fields. Complete copied logs retain all text apart from path substitutions.',
      'No raw legal documents, HARs, screenshots, personal Word changes, backups, complete input archives or tenant targets are included.',
      'Pattern screening is limited and is not a general guarantee that arbitrary binary or secret data cannot exist.'
    ]
  };
  outputs.push({ path: MANIFEST, bytes: encode(manifest) });
  // Validate all conflicts before writing anything. Existing evidence is never overwritten.
  for (const output of outputs) {
    try { assert.ok((await regular(root, output.path)).equals(output.bytes), 'Existing evidence differs: ' + output.path); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const output of outputs) {
    const dest = resolve(root, safeRelative(output.path));
    await mkdir(dirname(dest), { recursive: true });
    try { await writeFile(dest, output.bytes, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  await verifyOriginals(root);
  return verifyPublicEvidence(root);
}
export async function verifyPublicEvidence(root = ROOT) {
  const manifestBytes = await regular(root, MANIFEST);
  const m = JSON.parse(manifestBytes);
  assert.equal(m.formatVersion, '1.0.0');
  assert.equal(m.kind, 'mvp08-public-evidence-manifest');
  assert.equal(m.releaseId, RELEASE);
  assert.equal(m.evidenceFileCount, 30);
  assert.equal(m.entries.length, SPECS.length);
  assert.equal(m.scope.originalsRequiredForPublicVerification, false);
  assert.equal(m.scope.fullArchiveReproductionClaimed, false);
  assert.equal(m.scope.publicationAuthorizedByThisManifest, false);
  assert.deepEqual(m.redactionRules, RULES);
  assertPublicText(manifestBytes.toString('utf8'));
  const generator = await regular(root, SELF);
  assert.deepEqual(m.generator, { path: SELF, sha256: sha256(generator), byteLength: generator.length });
  for (let i = 0; i < SPECS.length; i++) {
    const spec = SPECS[i], e = m.entries[i];
    assert.equal(e.id, spec.id);
    assert.equal(e.category, spec.category);
    assert.equal(e.source.path, spec.source);
    assert.equal(e.source.sha256, spec.sourceSha256);
    assert.equal(e.source.byteLength, spec.sourceByteLength);
    assert.equal(e.output.path, outputPath(spec));
    assert.equal(e.evidenceType, spec.selectedFields ? 'selected-field-summary' : 'path-redacted-copy');
    assert.equal(e.transformation.kind, spec.selectedFields ? 'selected-field-summary-with-path-redaction' : 'path-redaction-only');
    assert.deepEqual(e.transformation.rules, RULES);
    if (spec.selectedFields) assert.deepEqual(e.transformation.selectedFields, spec.selectedFields);
    const bytes = await regular(root, e.output.path);
    assert.equal(bytes.length, e.output.byteLength);
    assert.equal(sha256(bytes), e.output.sha256, 'Public copy changed: ' + e.output.path);
    assertPublicText(bytes.toString('utf8'));
    if (e.output.path.endsWith('.json')) JSON.parse(bytes);
  }
  return {
    kind: 'mvp08-public-evidence-integrity', status: 'passed', evidenceFilesVerified: SPECS.length,
    manifestSha256: sha256(manifestBytes), originalFilesRead: 0,
    fullOriginalAuditPerformed: false, historicalProductTestsRerun: false, publicationAuthorized: false
  };
}
export async function verifyOriginals(root = ROOT) {
  for (const spec of SPECS) {
    const derived = derive(await regular(root, spec.source), spec, root);
    const actual = await regular(root, outputPath(spec));
    assert.ok(derived.bytes.equals(actual), 'Derived evidence differs from original: ' + spec.source);
  }
  return { originalFilesVerifiedUnchanged: SPECS.length, derivedCopiesReproduced: SPECS.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  if (mode === '--prepare') console.log(JSON.stringify(await prepare(), null, 2));
  else if (mode === '--verify') console.log(JSON.stringify(await verifyPublicEvidence(), null, 2));
  else if (mode === '--verify-originals') console.log(JSON.stringify(await verifyOriginals(), null, 2));
  else throw new Error('Use --verify (read-only public), --verify-originals (read-only local), or --prepare (explicit local creation)');
}

