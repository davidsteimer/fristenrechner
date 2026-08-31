// SPDX-License-Identifier: AGPL-3.0-only

import { cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const repositoryRoot = process.cwd();
const baseReleaseId = '2026-08-29-ap5-approved.1';
const candidateReleaseId = '2026-08-30-ap11b-candidate.1';
const approvedReleaseId = '2026-08-30-ap11b-approved.1';
const baseDirectory = join(repositoryRoot, 'data', 'releases', baseReleaseId);
const candidateDirectory = join(repositoryRoot, 'data', 'releases', candidateReleaseId);
const ap11aCatalogPath = join(
  repositoryRoot,
  'data',
  'candidates',
  '2026-08-30-ap11a-vrpg-be',
  'catalog.json'
);
const ap11aSuitePath = join(
  repositoryRoot,
  'tests',
  'golden',
  'candidates',
  'ap11a-vrpg-be-special-cases.json'
);
const approvedSuitePath = join(
  repositoryRoot,
  'tests',
  'golden',
  'approved',
  'vrpg-be-special-cases.json'
);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function calculatedDefinition(rule) {
  const { ruleId, ...rest } = rule;
  return {
    deadlineDefinitionId: ruleId,
    deadlineOrigin: 'CALCULATED',
    ...rest
  };
}

function authoritativeDefinition({
  deadlineDefinitionId,
  validity,
  anchors,
  dateValueId,
  timeValueId,
  filingProfileId,
  legalOverrideIds,
  sourceRefs
}) {
  return {
    deadlineDefinitionId,
    deadlineOrigin: 'AUTHORITATIVE',
    status: 'open',
    validity,
    anchors,
    authoritativeDeadline: {
      dateValueId,
      ...(timeValueId ? { timeValueId } : {}),
      sourceMode: 'caseSpecificOfficialAct',
      sourceRequired: true
    },
    filingProfileId,
    gateIds: [],
    legalOverrideIds,
    sourceRefs
  };
}

function transformCatalog(ap11a) {
  const definitions = ap11a.deadlineRules
    .filter(rule => rule.calculation.type !== 'R5_FIXED')
    .map(calculatedDefinition);

  definitions.push(
    {
      deadlineDefinitionId: 'PRGBE-SPEC-WEEKDAY-016',
      deadlineOrigin: 'CALCULATED',
      status: 'supported',
      validity: {
        dataValidFrom: '2026-08-30',
        dataValidTo: null
      },
      anchors: [
        {
          inputId: 'pollDate',
          role: 'trigger',
          valueType: 'date',
          labelKey: 'input.pollDate'
        }
      ],
      calculation: {
        type: 'R3_WEEKDAY',
        anchorInputId: 'pollDate',
        weekday: 'saturday',
        direction: 'before',
        ordinal: 1,
        strict: true
      },
      resultPolicy: {
        calendarProfileId: 'C_BE',
        suspensionProfileId: 'S0_NONE',
        endShiftPolicy: 'noShift',
        strictFixedDate: false
      },
      filingProfileId: 'F2_RECEIPT',
      gateIds: [],
      legalOverrideIds: [],
      sourceRefs: [
        {
          sourceId: 'SRC-PRG-BE-CURRENT',
          locator: 'Art. 16 Abs. 1'
        }
      ]
    },
    authoritativeDefinition({
      deadlineDefinitionId: 'PRGBE-SPEC-AUTH-016',
      validity: {
        dataValidFrom: '2026-08-30',
        dataValidTo: null
      },
      anchors: [
        {
          inputId: 'authorityDeadlineDate',
          role: 'authoritativeDeadline',
          valueType: 'date',
          labelKey: 'input.authorityDeadlineDate'
        },
        {
          inputId: 'authorityDeadlineTime',
          role: 'authoritativeDeadline',
          valueType: 'localTime',
          labelKey: 'input.authorityDeadlineTime'
        }
      ],
      dateValueId: 'authorityDeadlineDate',
      timeValueId: 'authorityDeadlineTime',
      filingProfileId: 'F2_RECEIPT',
      legalOverrideIds: ['OVR-DYNAMIC-AUTHORITY-DATE'],
      sourceRefs: [
        {
          sourceId: 'SRC-PRG-BE-CURRENT',
          locator: 'Art. 16 Abs. 2'
        }
      ]
    }),
    authoritativeDefinition({
      deadlineDefinitionId: 'BPR-SPEC-AUTH-021',
      validity: {
        dataValidFrom: '2026-08-30',
        dataValidTo: null
      },
      anchors: [
        {
          inputId: 'authorityDeadlineDate',
          role: 'authoritativeDeadline',
          valueType: 'date',
          labelKey: 'input.authorityDeadlineDate'
        }
      ],
      dateValueId: 'authorityDeadlineDate',
      filingProfileId: 'F2_RECEIPT',
      legalOverrideIds: ['OVR-DYNAMIC-AUTHORITY-DATE'],
      sourceRefs: [
        {
          sourceId: 'SRC-BPR-20221023',
          locator: 'Art. 21 Abs. 1 und 2'
        }
      ]
    }),
    {
      deadlineDefinitionId: 'VPR-SPEC-REL-008',
      deadlineOrigin: 'CALCULATED',
      status: 'supported',
      validity: {
        dataValidFrom: '2026-08-30',
        dataValidTo: null,
        legalEffectiveFrom: '2022-07-01'
      },
      anchors: [
        {
          inputId: 'electionYearStartDate',
          role: 'trigger',
          valueType: 'date',
          labelKey: 'input.electionYearStartDate',
          fixedMonthDay: '01-01'
        }
      ],
      calculation: {
        type: 'R1_RELATIVE',
        anchorInputId: 'electionYearStartDate',
        direction: 'after',
        anchorBoundary: 'included',
        duration: {
          value: 2,
          unit: 'month'
        }
      },
      resultPolicy: {
        calendarProfileId: 'C_BE',
        suspensionProfileId: 'S0_NONE',
        endShiftPolicy: 'noShift',
        strictFixedDate: false
      },
      filingProfileId: 'F0_NA',
      gateIds: [],
      legalOverrideIds: [],
      sourceRefs: [
        {
          sourceId: 'SRC-VPR-20220701',
          locator: 'Art. 8a Abs. 1'
        }
      ]
    },
    authoritativeDefinition({
      deadlineDefinitionId: 'VPR-SPEC-AUTH-008',
      validity: {
        dataValidFrom: '2026-08-30',
        dataValidTo: null,
        legalEffectiveFrom: '2022-07-01'
      },
      anchors: [
        {
          inputId: 'authorityDeadlineDate',
          role: 'authoritativeDeadline',
          valueType: 'date',
          labelKey: 'input.authorityDeadlineDate'
        }
      ],
      dateValueId: 'authorityDeadlineDate',
      filingProfileId: 'F2_RECEIPT',
      legalOverrideIds: ['OVR-DYNAMIC-AUTHORITY-DATE'],
      sourceRefs: [
        {
          sourceId: 'SRC-VPR-20220701',
          locator: 'Art. 8a Abs. 2'
        }
      ]
    })
  );

  const replacements = new Map([
    ['prg-be-16-postal-vote', {
      status: 'supported',
      statusReasonKey: 'status.supported.calculatedStatutoryBase',
      deadlineDefinitionIds: ['PRGBE-SPEC-WEEKDAY-016'],
      calendarProfileId: 'C_BE',
      legalOverrideIds: [],
      uiExposure: 'visible'
    }],
    ['bpr-21-nomination-deadline', {
      deadlineDefinitionIds: ['BPR-SPEC-AUTH-021'],
      uiExposure: 'hidden'
    }],
    ['vpr-8a-election-notice', {
      labels: {
        de: 'Meldung des Wahlanmeldeschlusses bis 1. März',
        fr: 'Communication du délai pour le dépôt des candidatures jusqu’au 1er mars'
      },
      status: 'supported',
      statusReasonKey: 'status.supported.calculatedInternalDeadline',
      deadlineDefinitionIds: ['VPR-SPEC-REL-008'],
      filingProfileId: 'F0_NA',
      calendarProfileId: 'C_BE',
      legalOverrideIds: [],
      uiExposure: 'visible'
    }]
  ]);

  const regimes = ap11a.regimes.map(regime => {
    const { calculationRuleIds, ...rest } = regime;
    const replacement = replacements.get(regime.regimeId);
    return {
      ...rest,
      deadlineDefinitionIds: calculationRuleIds,
      uiExposure: regime.status === 'supported' ? 'visible' : 'documentation',
      ...replacement
    };
  });

  regimes.push(
    {
      regimeId: 'prg-be-16-municipal-extension',
      level: 'cantonal',
      lawCode: 'PRG-BE',
      provision: 'Art. 16 Abs. 2',
      labels: {
        de: 'Kommunale Verlängerung und letzte Leerungszeit',
        fr: 'Prolongation communale et heure de la dernière levée'
      },
      status: 'open',
      statusReasonKey: 'status.open.authorityConfiguration',
      deadlineDefinitionIds: ['PRGBE-SPEC-AUTH-016'],
      filingProfileId: 'F2_RECEIPT',
      calendarProfileId: 'C_FIXED_REVIEW',
      suspensionProfileId: 'S0_NONE',
      gateIds: [],
      legalOverrideIds: ['OVR-DYNAMIC-AUTHORITY-DATE'],
      implementationScope: 'documentationOnly',
      uiExposure: 'hidden',
      sourceRefs: [
        {
          sourceId: 'SRC-PRG-BE-CURRENT',
          locator: 'Art. 16 Abs. 2'
        }
      ]
    },
    {
      regimeId: 'vpr-8a-cantonal-nomination-deadline',
      level: 'federal',
      lawCode: 'VPR',
      provision: 'Art. 8a Abs. 2',
      labels: {
        de: 'Kantonaler Wahlanmeldeschluss',
        fr: 'Délai cantonal pour le dépôt des candidatures'
      },
      status: 'open',
      statusReasonKey: 'status.open.authorityConfiguration',
      deadlineDefinitionIds: ['VPR-SPEC-AUTH-008'],
      filingProfileId: 'F2_RECEIPT',
      calendarProfileId: 'C_FIXED_REVIEW',
      suspensionProfileId: 'S0_NONE',
      gateIds: [],
      legalOverrideIds: ['OVR-DYNAMIC-AUTHORITY-DATE'],
      implementationScope: 'documentationOnly',
      uiExposure: 'hidden',
      sourceRefs: [
        {
          sourceId: 'SRC-VPR-20220701',
          locator: 'Art. 8a Abs. 2'
        }
      ]
    }
  );

  const legalOverrides = ap11a.legalOverrides.map(override => {
    if (override.overrideId !== 'OVR-DYNAMIC-AUTHORITY-DATE') {
      return override;
    }
    return {
      ...override,
      targetRegimeIds: [
        'prg-be-16-municipal-extension',
        'bpr-21-nomination-deadline',
        'bpr-29-list-correction',
        'vpr-8a-cantonal-nomination-deadline',
        'vpr-8e-list-connection-receipt'
      ]
    };
  });

  const {
    deadlineRules,
    ...catalogBase
  } = ap11a;
  return {
    ...catalogBase,
    $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/special-regime-catalog-v2.schema.json',
    formatVersion: '2.0.0',
    catalogId: 'vrpg-be-special-regimes-2026-08-30',
    review: {
      ...ap11a.review,
      basis: 'AP11A fachlich abgenommen. In AP11B gemäss DEC-2026-014 in berechnete und behördlich gesetzte Fristen getrennt.'
    },
    legalOverrides,
    deadlineDefinitions: definitions,
    regimes
  };
}

function harmoniseSources(document, sourceById) {
  if (!Array.isArray(document.sources)) {
    return document;
  }
  return {
    ...document,
    sources: document.sources.map(source => sourceById.get(source.sourceId) ?? source)
  };
}

function overrideWarning(overrideId) {
  if (overrideId === 'OVR-PRG111A-CROSSREF') {
    return 'warning.override.prg111aCrossReference';
  }
  return `warning.override.${overrideId.toLowerCase().replaceAll('-', '.')}`;
}

function buildApprovedSuite(catalog) {
  const source = readJson(ap11aSuitePath);
  const calendarById = new Map(
    catalog.calendarProfiles.map(profile => [profile.calendarProfileId, profile])
  );
  const filingById = new Map(
    catalog.filingProfiles.map(profile => [profile.filingProfileId, profile])
  );
  const cases = source.cases.map(goldenCase => {
    const caseInput = goldenCase.input;
    const filing = filingById.get(caseInput.filingProfileId);
    const calendar = calendarById.get(caseInput.calendarProfileId);
    if (!filing || !calendar) {
      throw new Error(`Unbekanntes Komponentenprofil in ${goldenCase.caseId}`);
    }
    const trace = goldenCase.expected.trace
      .map(step => ({
        ...step,
        reasonKeys: step.reasonKeys.filter(reason => reason !== 'candidateNotApproved')
      }));
    const returnIndex = trace.findIndex(step => step.operation === 'returnResult');
    const overrideSteps = goldenCase.expected.appliedOverrideIds.map(overrideId => ({
      sequence: 0,
      operation: 'applyLegalOverride',
      outputDate: goldenCase.expected.finalDeadline.date,
      ruleIds: [],
      reasonKeys: [overrideWarning(overrideId)]
    }));
    if (returnIndex >= 0) trace.splice(returnIndex, 0, ...overrideSteps);
    trace.forEach((step, index) => {
      step.sequence = index + 1;
    });
    return {
      ...goldenCase,
      expectationStatus: 'approved',
      expected: {
        ...goldenCase.expected,
        calculationContext: {
          releaseId: approvedReleaseId,
          catalogId: catalog.catalogId,
          profileId: goldenCase.profileId,
          regimeId: caseInput.regimeId,
          ruleId: caseInput.ruleId,
          deadlineOrigin: 'CALCULATED',
          calendarProfileId: caseInput.calendarProfileId,
          calendarId: calendar.calendarId,
          suspensionProfileId: caseInput.suspensionProfileId,
          filingProfileId: caseInput.filingProfileId
        },
        filingRequirement: {
          ...goldenCase.expected.filingRequirement,
          acceptedChannels: filing.acceptedChannels,
          acceptedEvidence: filing.acceptedEvidence
        },
        trace
      }
    };
  });
  return {
    ...source,
    suiteId: 'ap11b-vrpg-be-special-cases-approved',
    suiteStatus: 'approved',
    catalogId: catalog.catalogId,
    catalogFormatVersion: '2.0.0',
    review: {
      reviewedOn: '2026-08-30',
      status: 'verified',
      reviewedBy: 'David Steimer',
      basis: 'AP11A fachlich abgenommen. AP11B übernimmt die acht Erwartungen in den automatisierten Golden-Case-Bestand.'
    },
    cases
  };
}

function build() {
  const baseManifest = readJson(join(baseDirectory, 'manifest.json'));
  const ap11aCatalog = readJson(ap11aCatalogPath);
  const catalog = transformCatalog(ap11aCatalog);
  const sourceById = new Map(catalog.sources.map(source => [source.sourceId, source]));

  for (const artifact of baseManifest.artifacts) {
    const sourcePath = join(baseDirectory, artifact.path);
    const targetPath = join(candidateDirectory, artifact.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath);
    const document = harmoniseSources(readJson(targetPath), sourceById);
    writeJson(targetPath, document);
  }

  const catalogRelativePath = 'special-regimes/vrpg-be.json';
  writeJson(join(candidateDirectory, catalogRelativePath), catalog);

  const artifactDescriptors = [
    ...baseManifest.artifacts.map(artifact => ({
      path: artifact.path,
      role: artifact.role,
      contentId: artifact.contentId,
      schemaId: artifact.schemaId
    })),
    {
      path: catalogRelativePath,
      role: 'specialRegimeCatalog',
      contentId: catalog.catalogId,
      schemaId: catalog.$schema
    }
  ].map(descriptor => {
    const path = join(candidateDirectory, descriptor.path);
    return {
      ...descriptor,
      mediaType: 'application/json',
      byteLength: statSync(path).size,
      sha256: sha256(path)
    };
  });

  const allSources = new Map();
  for (const descriptor of artifactDescriptors) {
    const document = readJson(join(candidateDirectory, descriptor.path));
    for (const source of document.sources ?? []) {
      allSources.set(source.sourceId, source);
    }
  }

  const manifest = {
    $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/release-manifest.schema.json',
    formatVersion: '2.0.0',
    dataKind: 'releaseManifest',
    releaseId: candidateReleaseId,
    releaseStatus: 'candidate',
    createdOn: '2026-08-30',
    immutable: true,
    coverage: {
      from: '2026-01-01',
      to: baseManifest.coverage.to
    },
    profileIds: baseManifest.profileIds,
    calendarIds: baseManifest.calendarIds,
    specialRegimeCatalogIds: [catalog.catalogId],
    sourceSummary: {
      latestReviewedOn: [...allSources.values()]
        .map(source => source.reviewedOn)
        .sort()
        .at(-1),
      legalBasisReviewStatus: 'verified',
      technicalValidationStatus: 'passed',
      sourceIds: [...allSources.keys()].sort()
    },
    providerContract: baseManifest.providerContract,
    compatibility: {
      ...baseManifest.compatibility,
      minimumConsumerFormatVersion: '2.0.0'
    },
    checksumAlgorithm: 'sha256',
    extensions: {
      'steimer.candidate': {
        preparedOn: '2026-08-30',
        preparedWith: 'Codex',
        workPackage: 'AP11B',
        decisionId: 'DEC-2026-014',
        approvalRequired: true
      }
    },
    artifacts: artifactDescriptors
  };
  writeJson(join(candidateDirectory, 'manifest.json'), manifest);
  writeJson(approvedSuitePath, buildApprovedSuite(catalog));

  console.log(
    `BUILT ${candidateReleaseId}: definitions=${catalog.deadlineDefinitions.length}, regimes=${catalog.regimes.length}, artifacts=${artifactDescriptors.length}`
  );
}

build();
