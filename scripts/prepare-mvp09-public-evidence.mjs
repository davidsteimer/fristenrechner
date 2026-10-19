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
export const OUTPUT = 'outputs/publication-mvp09-2026-10-19/evidence';
export const MANIFEST = OUTPUT + '/manifest.json';
export const SELF = 'scripts/prepare-mvp09-public-evidence.mjs';
export const RELEASE = '2026-10-18-mvp-09-approved.1';
export const SPECS = [
  {
    "id": "01",
    "source": "outputs/release-mvp09-2026-10-18/source-review-verification.json",
    "output": "summaries/source-review-verification.json",
    "category": "historical-bounded-summary",
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
      "tests",
      "humanReadableReport",
      "localReportLinksChecked",
      "limitations"
    ],
    "sourceByteLength": 6216,
    "sourceSha256": "3120eced83895a732a41f7eec32bb4b2486873d108a5a0ab1ce3adee94b579c7"
  },
  {
    "id": "02",
    "source": "outputs/release-mvp09-2026-10-18/data-verification.json",
    "output": "summaries/data-verification.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "releaseId",
      "manifestSha256",
      "sourceApproval",
      "executionApproval",
      "passed",
      "inputsUnchanged",
      "sourcesAndHistoricalEvidenceReverified",
      "inputFiles",
      "steps",
      "sourceReviewAccepted",
      "runtimeFiles",
      "localDataCommitPerformed",
      "externalDeploymentAuthorized",
      "installationPerformed",
      "uploaded",
      "published"
    ],
    "sourceByteLength": 44376,
    "sourceSha256": "dbbb954179639d69226bf0e04887f1bdbff130618d91eaa235a768b68c8628df"
  },
  {
    "id": "03",
    "source": "outputs/release-mvp09-2026-10-18/product-build.json",
    "output": "summaries/product-build.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "startedAt",
      "status",
      "authority",
      "releaseId",
      "manifest",
      "localDataPin",
      "embedded",
      "applicationVersion",
      "packageVersion",
      "runtimeFiles",
      "oldPackage",
      "steps",
      "installationAuthorized",
      "publicationAuthorized",
      "actualM365TestsPerformed",
      "remotePinPublicationVerified",
      "package",
      "webFiles",
      "finishedAt"
    ],
    "sourceByteLength": 523918,
    "sourceSha256": "9b1d4312f9fbb0e8256f4208ded9c6dacd0c57705ebf018db53fdfbbd7786105"
  },
  {
    "id": "04",
    "source": "outputs/release-mvp09-2026-10-18/artifact-verification.json",
    "output": "summaries/artifact-verification.json",
    "category": "historical-bounded-summary",
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
      "mirrorFiles",
      "webFiles",
      "artifacts",
      "installationAuthorized",
      "publicationAuthorized",
      "operatingApproval",
      "remotePinVerified",
      "realM365TestsPerformed"
    ],
    "sourceByteLength": 15677,
    "sourceSha256": "7e623a62275ab6faa3fdde6a9c49ab4360232b16228c877ddbade545f12d14f2"
  },
  {
    "id": "05",
    "source": "outputs/release-mvp09-2026-10-18/local-completion.json",
    "output": "summaries/local-completion.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "recordedAt",
      "status",
      "authority",
      "closureTool",
      "releaseId",
      "applicationVersion",
      "packageVersion",
      "recoveryPackageVersion",
      "recoveryFunctionality",
      "dataCommit",
      "parent",
      "additionalCommits",
      "dataManifest",
      "artifacts",
      "wiring",
      "publicIntegrity",
      "buildCounts",
      "recoveryCounts",
      "builtProductAndFixturesUnchanged",
      "postBuildFixtureExceptions",
      "finalChecks",
      "installationPerformed",
      "uploadsPerformed",
      "githubPushPerformed",
      "outlookImportsPerformed",
      "operationalApprovalGranted",
      "realM365TestsPerformed",
      "realDeviceTestsPerformed",
      "localBrowserSettingsZoomPerformed",
      "remoteDataPinPublicationVerified",
      "remaining"
    ],
    "sourceByteLength": 149169,
    "sourceSha256": "e94353ac31cc4be6c2168ba4895e619f57f390e3a3c6d53c7d1d9ebaa1eec60f"
  },
  {
    "id": "06",
    "source": "outputs/release-mvp09-2026-10-18/outlook-reuse-assessment.json",
    "output": "summaries/outlook-reuse-assessment.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "status",
      "proposalOnly",
      "releaseId",
      "manifestSha256",
      "applicationVersion",
      "packageVersion",
      "buildProof",
      "artifactVerification",
      "definitiveArtifacts",
      "actualPackageProvenance",
      "historicalEvidenceUnchanged",
      "sourceComparisons",
      "unchangedSourceBlocks",
      "administrativeAdapter",
      "browserProof",
      "browserVersion",
      "browserExports",
      "packagedAmdExports",
      "packagedHarnessInputs",
      "excludedOlderSavedCalendarDiagnostics",
      "actualBrowserDownloads",
      "simulatedPackagedDownloads",
      "unchangedAppointmentContract",
      "proposedReuseScope",
      "newProvenanceNotCoveredByOldImport",
      "humanReuseAccepted",
      "noOutlookImport",
      "noM365",
      "outlookImportsPerformed",
      "mailboxOrCalendarChanged",
      "newBrowserSessionPerformedByThisScript",
      "newTestsPerformedByThisScript",
      "publicProductionHostTestsPerformed",
      "actualDeviceTestsPerformed",
      "installationAuthorized",
      "publicationAuthorized",
      "operatingApproval",
      "retainedLimits",
      "parser",
      "script"
    ],
    "sourceByteLength": 64392,
    "sourceSha256": "bac1216d343fb10798eccb50a361b351a78cad11df7690c8c4af1167a44c1b38"
  },
  {
    "id": "07",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/artifact-verification.json",
    "output": "summaries/recovery-0.9.0.1--artifact-verification.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "startedAt",
      "packageVersion",
      "applicationVersion",
      "functionalBaseline",
      "authority",
      "installationAuthorized",
      "deploymentPerformed",
      "publicationAuthorized",
      "liveHostVerified",
      "browserResetAuthorized",
      "roundTripMvp09Pending",
      "steps",
      "limitations",
      "priorFailedAttempt",
      "packageAudit",
      "packageSha256",
      "packageByteLength",
      "passed",
      "finishedAt"
    ],
    "sourceByteLength": 912144,
    "sourceSha256": "3d16f6e36e7e9fd1b8035cecbd634dd7636f956b963a0b8c45d38ca3d754376c"
  },
  {
    "id": "08",
    "source": "outputs/release-mvp09-2026-10-18/recovery-roundtrip/verification.json",
    "output": "summaries/recovery-roundtrip--verification.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "startedAt",
      "status",
      "authority",
      "normalPackage",
      "recoveryPackage",
      "functionalSequence",
      "cases",
      "limitation",
      "subsequentRealMvp09PackageMustExceed",
      "installationAuthorized",
      "actualDeploymentPerformed",
      "publicationAuthorized",
      "browserDataResetPerformed",
      "steps",
      "finishedAt"
    ],
    "sourceByteLength": 57053,
    "sourceSha256": "f109e22af10660e964d9e0f8d7e1dd0e0923e732e0aad643908a2f23c21b3d0c"
  },
  {
    "id": "09",
    "source": "outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/report.json",
    "output": "summaries/portability-standard-no-private-20261018-05--report.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "passed",
      "scope",
      "inputInventory",
      "inputCount",
      "suites",
      "isolatedInputBytesVerifiedBeforeAndAfter",
      "absentAfterExecution",
      "currentR09ArchivesPresent",
      "privateRawSourceOriginalsPresent",
      "gitPresent",
      "hostingBackupsPresent",
      "noOfficialFullTextsClaimed",
      "retainedHistoricalPublicFullTextFixture",
      "noTestsSkipped",
      "standardSuiteSelectionUnchanged",
      "executions",
      "testGeneratedScratch",
      "limits",
      "installationPerformed",
      "uploaded",
      "published"
    ],
    "sourceByteLength": 21033,
    "sourceSha256": "6bbfe0aad22f39488bed10c14664dd3949acd42faf3b2753bce94a3dbbdfa89a"
  },
  {
    "id": "10",
    "source": "outputs/release-mvp09-2026-10-18/browser-zoom-native-20261018-03/verification.json",
    "output": "summaries/browser-zoom-native-20261018-03--verification.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "status",
      "startedAt",
      "browser",
      "temporaryProfile",
      "method",
      "browserSettingsZoomExercised",
      "realM365Testing",
      "realDeviceTesting",
      "existingBrowserProfilesTouched",
      "installationPerformed",
      "uploaded",
      "published",
      "outlookImports",
      "webFiles",
      "buildProof",
      "script",
      "checks",
      "screenshots",
      "pageErrors",
      "externalRequests",
      "originalSetting",
      "before",
      "appliedSetting",
      "afterRestore",
      "temporaryProfileZoomRestored",
      "finishedAt"
    ],
    "sourceByteLength": 10162,
    "sourceSha256": "1d422f88b23dad750baf7ce0bc9f0618edb255e4c782ef389469407ce7de56bf"
  },
  {
    "id": "11",
    "source": "outputs/release-mvp09-2026-10-18/browser-definitive-20261018-02/verification-1792359318158.json",
    "output": "summaries/browser-definitive-20261018-02--verification-1792359318158.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "startedAt",
      "browser",
      "webFiles",
      "checks",
      "diagnostics",
      "exports",
      "screenshots",
      "externalRequests",
      "pageErrors",
      "actualM365Testing",
      "actualDeviceTesting",
      "actualBrowserMenuZoomTesting",
      "outlookImports",
      "status",
      "finishedAt"
    ],
    "sourceByteLength": 7662,
    "sourceSha256": "85a3737cefdf0d16d5e28387f6caa0bc7362560427bab3ad8875e64fbbc7eefa"
  },
  {
    "id": "12",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/verification.json",
    "output": "summaries/recovery-0.9.0.1--attempts--first-failed--verification.json",
    "category": "historical-bounded-summary",
    "selectedFields": [
      "kind",
      "startedAt",
      "packageVersion",
      "applicationVersion",
      "functionalBaseline",
      "stage",
      "authority",
      "basis",
      "installationAuthorized",
      "deploymentPerformed",
      "publicationAuthorized",
      "liveHostVerified",
      "browserResetAuthorized",
      "roundTripMvp09Pending",
      "inputDerivation",
      "implementation",
      "protectedFiles",
      "steps",
      "limitations",
      "error",
      "passed",
      "finishedAt"
    ],
    "sourceByteLength": 694896,
    "sourceSha256": "1a2cc30cd53436333b851d09106da5c9c27b7b939f08db922cd3c3df0528e21f"
  },
  {
    "id": "13",
    "source": "outputs/ap23e3-2026-10-18/QA-AP23E3.json",
    "output": "copies/QA-AP23E3.json",
    "category": "historical-diagnostic-copy",
    "sourceByteLength": 79981,
    "sourceSha256": "fa564603394ed40a6eebc6a587b5e11111f4f37e75c9930b4a04d1d889991c80"
  },
  {
    "id": "14",
    "source": "outputs/ap23e3-2026-10-18/spfx-build.json",
    "output": "copies/spfx-build.json",
    "category": "historical-diagnostic-copy",
    "sourceByteLength": 5914,
    "sourceSha256": "0a20e0717ca0f7db0937936a5c8efd518d08b8db7add6a58c6019ee7eebc4216"
  },
  {
    "id": "15",
    "source": "outputs/ap23e3-2026-10-18/core-sweep-1-report.json",
    "output": "copies/core-sweep-1-report.json",
    "category": "historical-diagnostic-copy",
    "sourceByteLength": 44344,
    "sourceSha256": "e8d313793650e0a7412e24894df8ec15a1c9e6d2007e12b5ac4046e754a3cf9a"
  },
  {
    "id": "16",
    "source": "outputs/ap23e3-2026-10-18/spfx-initial-provider-tests.txt",
    "output": "copies/spfx-initial-provider-tests.txt",
    "category": "historical-diagnostic-copy",
    "sourceByteLength": 773463,
    "sourceSha256": "dc24716ce531db62838e386bf4935dd117c1a6c71f3e3d08383b413bc44e5a66"
  },
  {
    "id": "17",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-built-tests.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-built-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 56431,
    "sourceSha256": "196a673584edcb284239bcd22ab039ff0ed5d324ee2f65344a4bb3127ed7abef"
  },
  {
    "id": "18",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-compile.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-compile.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 11822,
    "sourceSha256": "0ca13833c3efe4a304fb47673cfe0b2e73cfbadb5dfcc987a06ddbe239745539"
  },
  {
    "id": "19",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-css-audit.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-css-audit.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 69,
    "sourceSha256": "ca6200c68ec090373cf4d20daa3edf48f437509fb335dd063fc73dac96818c60"
  },
  {
    "id": "20",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-package.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-package.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 6227,
    "sourceSha256": "e3c5ef985506bd020d6a5871d7103c204777ee05bcc7ca38575c006a703dae8b"
  },
  {
    "id": "21",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-source-tests.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-source-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 46547,
    "sourceSha256": "5ec155226e3809240c663d05c3a59c8982563b94f93381e5f5ade27f8edb4a22"
  },
  {
    "id": "22",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-sync.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-sync.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 197,
    "sourceSha256": "676b347c0cc6758a20bc9ca830810bd276d4475ff4fe4104b5927fe37aeb52d6"
  },
  {
    "id": "23",
    "source": "outputs/release-mvp09-2026-10-18/build-evidence/logs/mvp09-product-build-g8pU5R-web-build.log",
    "output": "logs/build-evidence--logs--mvp09-product-build-g8pU5R-web-build.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 128,
    "sourceSha256": "5ce19732a398836a95dba18f9c33dafd34ddf404895b3115b82a13ef6e9b1f48"
  },
  {
    "id": "24",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/built-tests.log",
    "output": "logs/recovery-0.9.0.1--logs--built-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 34664,
    "sourceSha256": "1e98939d2f0e77ec23730cf7cfff1096b521eee0f0cc02aed6655ea7f6068836"
  },
  {
    "id": "25",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/compile.log",
    "output": "logs/recovery-0.9.0.1--logs--compile.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 8906,
    "sourceSha256": "e4713f7d34dac1e11edec1e4f8d91226a33a93735913e857054fe9075db1a74d"
  },
  {
    "id": "26",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/css-audit.log",
    "output": "logs/recovery-0.9.0.1--logs--css-audit.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 69,
    "sourceSha256": "be9fe3a888db654f7f0b44a84c4ba0e764af4ba8e3d23fb31bd43c966a823d73"
  },
  {
    "id": "27",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/package.log",
    "output": "logs/recovery-0.9.0.1--logs--package.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 6121,
    "sourceSha256": "a553e53e3f1d51362ebf17591d46e938c7ea445b307aa1c0d7d0a5bac18982af"
  },
  {
    "id": "28",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/recovery-tests.log",
    "output": "logs/recovery-0.9.0.1--logs--recovery-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 2440,
    "sourceSha256": "60b8620b81ae09870aa6bea73b385e42eab51638afeac8ff23e6969511dd95ce"
  },
  {
    "id": "29",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/source-tests.log",
    "output": "logs/recovery-0.9.0.1--logs--source-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 43976,
    "sourceSha256": "20f74032e1f6ee58b241a2ecb8526368c5e3343ce3363c837684e7dc4b362835"
  },
  {
    "id": "30",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/sync.log",
    "output": "logs/recovery-0.9.0.1--logs--sync.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 197,
    "sourceSha256": "b09161c434779a2c3c967982921a9ec1ea86a269810c0c7c7aa309bac942c593"
  },
  {
    "id": "31",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/logs/tool-tests.log",
    "output": "logs/recovery-0.9.0.1--logs--tool-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 1274,
    "sourceSha256": "a8a8b34faa986bc5e39a78c7218c81cf8106f4ed09fe316e261c862f907986a1"
  },
  {
    "id": "32",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/built-tests.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--built-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 34683,
    "sourceSha256": "e49fe4bfd54f2e1565b516c619b9953ef76c43c16037bee0742f385356a0a201"
  },
  {
    "id": "33",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/compile.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--compile.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 8905,
    "sourceSha256": "f933ea239e91411bc657249d0ec1c2a87a371d972e1aa2b4067307c14ac92b3c"
  },
  {
    "id": "34",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/css-audit.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--css-audit.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 69,
    "sourceSha256": "e88fbea09aca51c7826ce1f5833f712a195855e6a3d49bba28d0536783fb68c8"
  },
  {
    "id": "35",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/package.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--package.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 6122,
    "sourceSha256": "a74adaa5579fef54725aa3973f96bb20ef453c2379a9dce3c91f18fde043c60f"
  },
  {
    "id": "36",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/recovery-tests.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--recovery-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 7910,
    "sourceSha256": "21a660c4e0b5d8cce0af0e2b2b6057f46fc156c0e67836a6cadef3d826581ea9"
  },
  {
    "id": "37",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/source-tests.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--source-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 43990,
    "sourceSha256": "0ff96e61cfb743ff6f7c2d3e0ed73f76863bcb5a1b56605930eb82aa45f9a19b"
  },
  {
    "id": "38",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/sync.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--sync.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 197,
    "sourceSha256": "b09161c434779a2c3c967982921a9ec1ea86a269810c0c7c7aa309bac942c593"
  },
  {
    "id": "39",
    "source": "outputs/release-mvp09-2026-10-18/recovery-0.9.0.1/attempts/first-failed/tool-tests.log",
    "output": "logs/recovery-0.9.0.1--attempts--first-failed--tool-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 1276,
    "sourceSha256": "df4adec25fb995974c38bae1bb48e31f2a34b34aea6241eebffa55dca5ffa773"
  },
  {
    "id": "40",
    "source": "outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/governance-node.log",
    "output": "logs/portability-standard-no-private-20261018-05--governance-node.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 61720,
    "sourceSha256": "f1d2184d537524a0d484c8ad97424f7a996073d931b2e06824dd4004aaac8c09"
  },
  {
    "id": "41",
    "source": "outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/governance-python.log",
    "output": "logs/portability-standard-no-private-20261018-05--governance-python.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 142,
    "sourceSha256": "c064e6c95ce96f3fb00e968b10efa90223181316926ab7bad1e4d1b4b5c95ad1"
  },
  {
    "id": "42",
    "source": "outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/governance-schema.log",
    "output": "logs/portability-standard-no-private-20261018-05--governance-schema.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 117,
    "sourceSha256": "abe674c462fe8e2d414edf9def1c288a1c0b13eb620c5498b2884a748e691582"
  },
  {
    "id": "43",
    "source": "outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/product.log",
    "output": "logs/portability-standard-no-private-20261018-05--product.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 633983,
    "sourceSha256": "d7e8b8b597cefa1237f9a69367cbf88dc0c759835473f6482aafb7f044db15e9"
  },
  {
    "id": "44",
    "source": "outputs/release-mvp09-2026-10-18/validator-supplement/exact-host-tests.log",
    "output": "logs/validator-supplement--exact-host-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 107,
    "sourceSha256": "ea133491bd13ef1fb07617a072c9a20681385202f4d3bcc43c0e38f9e50fa5d0"
  },
  {
    "id": "45",
    "source": "outputs/release-mvp09-2026-10-18/validator-supplement/python-governance.log",
    "output": "logs/validator-supplement--python-governance.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 142,
    "sourceSha256": "335d0ddc23650d59aa29b785f807532dec9094d61898ef3b2dd1c7158604e68a"
  },
  {
    "id": "46",
    "source": "outputs/release-mvp09-2026-10-18/validator-supplement/source-semantic-schema.log",
    "output": "logs/validator-supplement--source-semantic-schema.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 117,
    "sourceSha256": "abe674c462fe8e2d414edf9def1c288a1c0b13eb620c5498b2884a748e691582"
  },
  {
    "id": "47",
    "source": "outputs/release-mvp09-2026-10-18/data-approved-reader.log",
    "output": "logs/data-approved-reader.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 2280,
    "sourceSha256": "13405b5d0d0eed329f147b33a1e1d8c63daa7ba305a85d502b20635c1249b194"
  },
  {
    "id": "48",
    "source": "outputs/release-mvp09-2026-10-18/data-independent-negative-tests.log",
    "output": "logs/data-independent-negative-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 8020,
    "sourceSha256": "bab71714eb958fe098fb32b5714d4a2872f8f315bdcde700b676b0bc5380db33"
  },
  {
    "id": "49",
    "source": "outputs/release-mvp09-2026-10-18/data-independent-validator.log",
    "output": "logs/data-independent-validator.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 1019,
    "sourceSha256": "7b90ec440d29cf8130eb73a692a27bac19b069c6096fa0dfebb6874204466792"
  },
  {
    "id": "50",
    "source": "outputs/release-mvp09-2026-10-18/data-public-data-tests.log",
    "output": "logs/data-public-data-tests.txt",
    "category": "historical-complete-log",
    "sourceByteLength": 4274,
    "sourceSha256": "150a59c85ca05d21c5149bceeea257ac9a2f16e079f8db4c5c4f0b5d10916182"
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
    kind: 'mvp09-public-historical-evidence-summary',
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
    kind: 'mvp09-public-evidence-manifest',
    preparedOn: '2026-10-19',
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
  assert.equal(m.kind, 'mvp09-public-evidence-manifest');
  assert.equal(m.releaseId, RELEASE);
  assert.equal(m.evidenceFileCount, 50);
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
    kind: 'mvp09-public-evidence-integrity', status: 'passed', evidenceFilesVerified: SPECS.length,
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


