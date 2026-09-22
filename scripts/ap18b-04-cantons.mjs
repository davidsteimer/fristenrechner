// SPDX-License-Identifier: AGPL-3.0-only
// Consolidated research workbook, not runtime data or a complete calendar licence.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createBatch03Model} from './ap18b-03-cantons.mjs';
import {validateContract05} from './ap18b-03-contract.mjs';
import {createEastAdditions} from './ap18b-04-east.mjs';
import {createCentralAdditions} from './ap18b-04-central.mjs';
import {createWestAdditions} from './ap18b-04-west.mjs';

export const BATCH04_CANTONS=Object.freeze(['CH-ZH','CH-SH','CH-TG','CH-SG','CH-AR','CH-AI',
  'CH-LU','CH-UR','CH-SZ','CH-OW','CH-NW','CH-ZG','CH-GL','CH-BS','CH-BL','CH-VD','CH-NE','CH-JU']);
export const V09_WORKBOOK='outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx';
export const V09_SHA256='a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12';
const LISTS=['rules','scopes','sources','mappings','reviews','assignments','areaSourceEvidence'];
const DICTIONARIES=['scopeLabels','ruleKeys','jurisdictionLabels','holidayDefinitions'];

function combine(base) {
  const groups=[createEastAdditions(base),createCentralAdditions(base),createWestAdditions(base)];
  const added=Object.fromEntries(LISTS.map(k=>[k,groups.flatMap(g=>g[k]??[])]));
  for(const k of DICTIONARIES)added[k]=Object.assign({},...groups.map(g=>g[k]??{}));
  // A repeated holiday key may supply a translated display label, but never a
  // different date meaning. Existing dictionary records remain the reference.
  const definitions={...base.holidayDefinitions};
  for(const g of groups)for(const[key,value]of Object.entries(g.holidayDefinitions??{})) {
    if(definitions[key])assert.deepEqual(value.calculation,definitions[key].calculation,`Conflicting holiday key ${key}`);
    else definitions[key]=value;
  }
  added.holidayDefinitions=Object.fromEntries(Object.entries(definitions).filter(([key])=>!Object.hasOwn(base.holidayDefinitions,key)));
  added.pendingCases=groups.flatMap(g=>g.pendingCases??[]);
  added.rules.sort((a,b)=>BATCH04_CANTONS.indexOf(a.jurisdiction)-BATCH04_CANTONS.indexOf(b.jurisdiction));
  return added;
}

export async function createBatch04Model(root) {
  assert.equal(createHash('sha256').update(await fs.readFile(path.join(root,V09_WORKBOOK))).digest('hex'),V09_SHA256);
  return deriveBatch04Model(await createBatch03Model(root));
}

// Pure calculation-seed derivation, not a workbook migration or a hash bypass.
// Callers migrating a workbook must bind and verify their own actual source.
export function deriveBatch04Model(base) {
  const added=combine(base),model=structuredClone(base);
  for(const k of LISTS)model[k].push(...added[k]);
  for(const k of DICTIONARIES)model[k]={...base[k],...added[k]};
  model.packageId='AP18B-04-RESTKANTONE';
  model.batch04Cantons=[...BATCH04_CANTONS];
  model.pendingCases=added.pendingCases;
  model.batch04Additions=added;
  model.referenceAcceptance={sourceWorkbook:V09_WORKBOOK,sourceSha256:V09_SHA256,
    approvedBy:'David Steimer',approvedOn:'2026-09-13',scope:'V0.9 als Erfassungs- und Prüfgrundlage',
    evidence:'docs/fachrecht/abnahme-ap18b-03.md',solothurnMay1HalfDayDeadlineEffect:'none',
    historicalRowsUnchanged:true,productActivation:false};
  model.batch04Boundary={legalApproval:false,productExport:false,municipalLawIncluded:false,
    languageApproval:false,completeDateCoverage:false,contractUnchanged:true};
  for(const code of BATCH04_CANTONS)model.jurisdictions.find(r=>r[0]===code)[4]='Kantonspaket AP18B-04, Fachabnahme offen';
  validateBatch04Model(model,base);
  return model;
}

export function validateBatch04Model(model,base) {
  const expected=combine(base);
  assert.equal(model.packageId,'AP18B-04-RESTKANTONE');
  assert.equal(model.contractVersion,'0.5.0');
  assert.deepEqual(model.batch04Cantons,BATCH04_CANTONS);
  for(const k of LISTS)assert.deepEqual(model[k],[...base[k],...expected[k]],`Changed frozen reference or additions: ${k}`);
  for(const k of DICTIONARIES)assert.deepEqual(model[k],{...base[k],...expected[k]},`Changed reference dictionary: ${k}`);
  assert.deepEqual(model.pendingCases,expected.pendingCases);
  assert.equal(new Set(model.pendingCases.map(p=>p.id)).size,model.pendingCases.length);
  const sources=new Set(model.sources.map(s=>s[0]));
  for(const p of model.pendingCases) {
    assert.ok(BATCH04_CANTONS.includes(p.canton)||BATCH04_CANTONS.includes(`CH-${p.canton}`),p.id);
    for(const k of ['id','holiday','reason','locator','status'])assert.ok(typeof p[k]==='string'&&p[k].trim(),`${p.id}: ${k}`);
    assert.ok(Array.isArray(p.sourceIds)&&p.sourceIds.length&&p.sourceIds.every(id=>sources.has(id)),p.id);
    assert.ok(model.mappings.some(r=>r.some(v=>typeof v==='string'&&v.includes(p.id)))
      ||model.reviews.some(r=>r.some(v=>typeof v==='string'&&v.includes(p.id))),`Pending case not visible in workbook: ${p.id}`);
  }
  assert.deepEqual(new Set(expected.rules.map(r=>r.jurisdiction)),new Set(BATCH04_CANTONS));
  assert.equal(new Set(model.rules.map(r=>r.jurisdiction)).size,27);
  for(const r of expected.rules) {
    assert.equal(r.status,'open');assert.equal(r.exportClass,'blockedEffect');
    assert.equal(r.reference,null);assert.equal(r.approvalBasis,null);assert.equal(r.action,'add');assert.equal(r.target,null);
    assert.equal(r.from,'2026-01-01');
  }
  assert.equal(model.referenceAcceptance.sourceSha256,V09_SHA256);
  assert.equal(model.referenceAcceptance.solothurnMay1HalfDayDeadlineEffect,'none');
  assert.equal(model.referenceAcceptance.productActivation,false);
  assert.deepEqual(model.batch04Boundary,{legalApproval:false,productExport:false,municipalLawIncluded:false,
    languageApproval:false,completeDateCoverage:false,contractUnchanged:true});
  validateContract05(model);
  return true;
}
