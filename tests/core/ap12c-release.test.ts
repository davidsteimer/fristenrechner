// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  calculateDeadline,
  calculateSpecialDeadline,
  createCalculationData,
  type CalculationData,
  type CalculationInput,
  type ValidatedReleaseLike
} from '../../src/core';

const repositoryRoot = process.cwd();
const releaseId = '2026-08-31-mvp-03-approved.1';
const releaseDirectory = `data/releases/${releaseId}`;

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(repositoryRoot, relativePath), 'utf8')) as unknown;
}

function loadFormat3Data(): CalculationData {
  const manifest = readJson(`${releaseDirectory}/manifest.json`) as {
    readonly releaseId: string;
    readonly formatVersion: string;
    readonly coverage: { readonly from: string; readonly to: string | null };
    readonly profileIds: readonly string[];
    readonly calendarIds: readonly string[];
    readonly specialRegimeCatalogIds: readonly string[];
    readonly artifacts: readonly {
      readonly role: 'legalProfile' | 'calendar' | 'specialRegimeCatalog';
      readonly contentId: string;
      readonly path: string;
      readonly schemaId: string;
    }[];
  };
  const release: ValidatedReleaseLike = {
    releaseId: manifest.releaseId,
    formatVersion: manifest.formatVersion,
    coverageFrom: manifest.coverage.from,
    coverageTo: manifest.coverage.to,
    profileIds: manifest.profileIds,
    calendarIds: manifest.calendarIds,
    specialRegimeCatalogIds: manifest.specialRegimeCatalogIds,
    artifacts: manifest.artifacts.map(artifact => ({
      descriptor: {
        role: artifact.role,
        contentId: artifact.contentId,
        schemaId: artifact.schemaId
      },
      parsed: readJson(`${releaseDirectory}/${artifact.path}`)
    }))
  };
  return createCalculationData(release);
}

const data = loadFormat3Data();

function calculate(input: CalculationInput) {
  return calculateDeadline(input, data);
}

describe('MVP-0.3-Format-3-Integration', () => {
  it('lädt zwei Regelkalender mit offener Releaseabdeckung', () => {
    assert.equal(data.releaseId, releaseId);
    assert.equal(data.formatVersion, '3.0.0');
    assert.equal(data.coverage.to, null);
    assert.equal(data.calendarRuleSets.size, 2);
    assert.deepEqual([...data.calendarRuleSets.keys()].sort(), [
      'be-public-holidays',
      'ch-federal-calendar'
    ]);
  });

  it('berechnet den Bundesfeiertagsfall mit Release, Kalenderregel und Quelle in der Rechenspur', () => {
    const result = calculate({
      profileId: 'stpo',
      inputDate: '2027-07-22',
      inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
      deadlineDays: 10,
      calendarId: 'be-public-holidays',
      selectors: {},
      confirmations: { holidayAnchorConfirmed: true },
      holidayAnchorCandidates: ['BE']
    });
    assert.equal(result.outcome, 'calculated');
    if (result.outcome !== 'calculated') return;
    assert.equal(result.finalEnd, '2027-08-02');
    assert.deepEqual(result.endShift.holidayIds, ['CH-2027-08-01-NATIONAL-DAY']);
    const evidence = result.trace.find(step => step.operation === 'shiftDeadlineEnd')?.calendarEvidence;
    assert.equal(evidence?.releaseId, releaseId);
    assert.equal(evidence?.calendarId, 'be-public-holidays');
    assert.deepEqual(evidence?.applications.map(application => application.ruleId), [
      'CH-CAL-HOL-NATIONAL-DAY'
    ]);
    assert.deepEqual(evidence?.applications[0]?.sourceRefs, [{
      sourceId: 'SRC-BUNDESFEIERTAG-19940701',
      locator: 'Art. 1'
    }]);
  });

  it('verwendet den migrierten Stillstandssatz und weist die erzeugende Regel nach', () => {
    const result = calculate({
      profileId: 'zpo',
      inputDate: '2027-03-19',
      inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
      deadlineDays: 10,
      calendarId: 'be-public-holidays',
      selectors: { procedureVariant: 'ordinary' },
      confirmations: { holidayAnchorConfirmed: true },
      holidayAnchorCandidates: ['BE']
    });
    assert.equal(result.outcome, 'calculated');
    if (result.outcome !== 'calculated') return;
    assert.equal(result.finalEnd, '2027-04-13');
    assert.deepEqual(result.suspension.periodIds, ['EASTER-2027']);
    assert.ok(result.appliedRuleIds.includes('CH-CAL-SUSP-EASTER'));
    const evidence = result.trace.find(step => step.operation === 'applySuspension')?.calendarEvidence;
    assert.deepEqual(evidence?.applications.map(application => application.ruleId), [
      'CH-CAL-SUSP-EASTER'
    ]);
  });

  it('berechnet ohne künstliche Jahresgrenze auch im Schaltjahr 2400', () => {
    const result = calculate({
      profileId: 'stpo',
      inputDate: '2400-02-28',
      inputDateSemantics: 'legallyRelevantDeliveryOrEventDate',
      deadlineDays: 1,
      calendarId: 'be-public-holidays',
      selectors: {},
      confirmations: { holidayAnchorConfirmed: true },
      holidayAnchorCandidates: ['BE']
    });
    assert.equal(result.outcome, 'calculated');
    if (result.outcome !== 'calculated') return;
    assert.equal(result.deadlineStart, '2400-02-29');
    assert.equal(result.provisionalEnd, '2400-02-29');
  });

  it('verwendet den migrierten Stillstandssatz auch im VRPG-Spezialregimepfad', () => {
    const result = calculateSpecialDeadline({
      profileId: 'vrpg-be',
      regimeId: 'bgg-100-1-general-appeal',
      ruleId: 'BGG-SPEC-REL-101',
      dateValues: { decisionNoticeDate: '2027-03-19' },
      localTimeValues: {},
      integerValues: {},
      calendarProfileId: 'C_BGG',
      suspensionProfileId: 'S_BGG',
      filingProfileId: 'F1_DISPATCH',
      overrideConfirmations: []
    }, data);
    assert.equal(result.outcome, 'calculated');
    assert.equal(result.finalDeadline?.date, '2027-05-03');
    const evidence = result.trace.find(step => step.operation === 'applySuspension')?.calendarEvidence;
    assert.deepEqual(evidence?.applications.map(application => application.ruleId), [
      'CH-CAL-SUSP-EASTER'
    ]);
    assert.ok(result.appliedRuleIds.includes('CH-CAL-SUSP-EASTER'));
  });

  it('enthält nirgends mehr die zeitlich begrenzte Stillstandssatz-ID', () => {
    const manifest = readJson(`${releaseDirectory}/manifest.json`) as {
      readonly artifacts: readonly { readonly path: string }[];
    };
    const serialized = manifest.artifacts
      .map(artifact => readFileSync(join(repositoryRoot, releaseDirectory, artifact.path), 'utf8'))
      .join('\n');
    assert.doesNotMatch(serialized, /ch-court-holidays-2026-2028/);
    assert.match(serialized, /ch-court-holidays/);
  });
});
