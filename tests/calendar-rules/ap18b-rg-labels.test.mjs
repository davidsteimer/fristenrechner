// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTiGrPackageModel } from '../../scripts/ap18b-ti-gr-model.mjs';
import { PROVISIONAL_TI_RM_LABELS, validateProvisionalTiRmLabels } from '../../scripts/ap18b-rg-labels.mjs';

test('V0.8 fills exactly the eight previously blank TI Romansh names', async () => {
  const base = await createTiGrPackageModel(process.cwd());
  const blanks = base.additions.rules.filter(x => !x.rm).map(x => x.id);
  assert.deepEqual(PROVISIONAL_TI_RM_LABELS.map(x => x.ruleId), blanks);
  assert.equal(validateProvisionalTiRmLabels(), true);
  assert.equal(base.additions.rules.filter(x => !x.rm).length, 8, 'V0.7 model remains unchanged');
});

test('V0.8 preserves the distinction between provisional use and language approval', () => {
  assert.ok(PROVISIONAL_TI_RM_LABELS.every(x => !x.independentLanguageApproval && !x.legalEffectChanged));
  assert.equal(PROVISIONAL_TI_RM_LABELS.filter(x => x.sourceUrl).length, 6);
  assert.deepEqual(PROVISIONAL_TI_RM_LABELS.filter(x => !x.sourceUrl).map(x => x.ruleId),
    ['TI-CAL-DAY-ST-PETER-PAUL', 'TI-CAL-DAY-IMMACULATE-CONCEPTION']);
});

test('V0.8 rejects a forged official translation status', () => {
  const changed = structuredClone(PROVISIONAL_TI_RM_LABELS);
  changed[0].kind = 'officialText';
  assert.throws(() => validateProvisionalTiRmLabels(changed));
});

test('V0.8 rejects a changed label or missing item', () => {
  assert.throws(() => validateProvisionalTiRmLabels(PROVISIONAL_TI_RM_LABELS.slice(1)));
  const changed = structuredClone(PROVISIONAL_TI_RM_LABELS);
  changed[0].rm = '';
  assert.throws(() => validateProvisionalTiRmLabels(changed));
});
