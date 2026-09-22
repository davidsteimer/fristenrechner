// SPDX-License-Identifier: AGPL-3.0-only
// Review batch only. Never an application calendar or export approval.
import assert from 'node:assert/strict';
import {createContract05Model,validateContract05} from './ap18b-03-contract.mjs';
import {createVsGeAdditions} from './ap18b-03-vs-ge.mjs';
import {createFrSoAdditions} from './ap18b-03-fr-so.mjs';

const CANTONS=['CH-VS','CH-FR','CH-SO','CH-GE'];
const LISTS=['rules','scopes','sources','mappings','reviews','assignments'];

function combine(base) {
  const a=createVsGeAdditions(base),b=createFrSoAdditions(base);
  const additions=Object.fromEntries(LISTS.map(key=>[key,[...a[key],...b[key]]]));
  additions.rules.sort((x,y)=>CANTONS.indexOf(x.jurisdiction)-CANTONS.indexOf(y.jurisdiction));
  return {...additions,areaSourceEvidence:[...(a.areaSourceEvidence??[]),...(b.areaSourceEvidence??[])],
    scopeLabels:{...a.scopeLabels,...b.scopeLabels},ruleKeys:{...a.ruleKeys,...b.ruleKeys},
    jurisdictionLabels:{...a.jurisdictionLabels,...b.jurisdictionLabels}};
}

export async function createBatch03Model(root) {
  const base=await createContract05Model(root), added=combine(base), model=structuredClone(base);
  for(const key of LISTS)model[key].push(...added[key]);
  model.areaSourceEvidence.push(...added.areaSourceEvidence);
  model.scopeLabels={...base.scopeLabels,...added.scopeLabels};
  model.ruleKeys={...base.ruleKeys,...added.ruleKeys};
  model.jurisdictionLabels={...base.jurisdictionLabels,...added.jurisdictionLabels};
  for(const code of CANTONS)model.jurisdictions.find(r=>r[0]===code)[4]='Kantonspaket AP18B-03, Fachabnahme offen';
  model.packageId='AP18B-03-VS-FR-SO-GE';
  model.batch03Additions=added;
  model.batch03Boundary={legalApproval:false,productExport:false,municipalLawIncluded:false,
    geSundaySubstitution:false,soPartialDayDeadlineEffect:'open',languageApproval:false};
  validateBatch03Model(model,base);
  return model;
}

export function validateBatch03Model(model,base) {
  assert.equal(model.packageId,'AP18B-03-VS-FR-SO-GE');
  const expected=combine(base);
  for(const key of LISTS)assert.deepEqual(model[key],[...base[key],...expected[key]],`Changed base or batch ${key}`);
  assert.deepEqual(model.areaSourceEvidence,[...base.areaSourceEvidence,...expected.areaSourceEvidence]);
  assert.deepEqual(model.scopeLabels,{...base.scopeLabels,...expected.scopeLabels});
  assert.deepEqual(model.ruleKeys,{...base.ruleKeys,...expected.ruleKeys});
  assert.deepEqual(model.jurisdictionLabels,{...base.jurisdictionLabels,...expected.jurisdictionLabels});
  const jurisdictions=structuredClone(base.jurisdictions);
  for(const code of CANTONS)jurisdictions.find(r=>r[0]===code)[4]='Kantonspaket AP18B-03, Fachabnahme offen';
  assert.deepEqual(model.jurisdictions,jurisdictions);
  for(const rule of expected.rules) {
    assert.ok(CANTONS.includes(rule.jurisdiction));
    assert.equal(rule.status,'open'); assert.equal(rule.approvalBasis,null);assert.equal(rule.reference,null);
    assert.equal(rule.exportClass,'blockedEffect');assert.equal(rule.from,'2026-01-01');
  }
  assert.deepEqual(model.batch03Boundary,{legalApproval:false,productExport:false,municipalLawIncluded:false,
    geSundaySubstitution:false,soPartialDayDeadlineEffect:'open',languageApproval:false});
  validateContract05(model);
  return true;
}
