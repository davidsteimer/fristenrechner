// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import ts from 'typescript';
import { candidatePath, inspectModelCase, runModelCases, validateModel } from '../../scripts/check-ap19a-model.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = JSON.parse(await readFile(resolve(root, candidatePath), 'utf8'));
const fixture = () => structuredClone(source);
const historicalTest = await readFile(resolve(root, 'outputs/release-mvp07-2026-10-08/inputs/files/tests/governance/ap19a-model.test.mjs'));
assert.equal(createHash('sha256').update(historicalTest).digest('hex'), '2d6ed57b924e758bdda44d28147bf7c5abd615a1dfc4d38eed99d411f2142a7c');
function rejectMutation(change) {
  const model = fixture(); change(model);
  assert.throws(() => validateModel(model));
  assert.deepEqual(inspectModelCase(model, source.referenceInput), { structure: 'blocked', reason: 'model-invalid', eligibility: 'blocked-input', runtimeActive: false });
}

test('all 22 structural reference cases pass without calculation or release', () => {
  assert.deepEqual(runModelCases(source), { referenceCases: 22, completeStructures: 5, runtimeActive: false, legalApproval: false, calculationPerformed: false });
});
test('the identical federal object serves BE and synthetic foreign bindings', () => {
  const bindings = source.cantonalBindings.filter(binding => binding.ruleId === 'CH-SOC-ELG-OBJ');
  assert.deepEqual(bindings.map(binding => binding.proceduralCanton).sort(), ['AG', 'BE', 'ZH']);
  assert.equal(source.federalRules.filter(rule => rule.id === 'CH-SOC-ELG-OBJ').length, 1);
  for (const rule of source.federalRules) {
    assert.doesNotMatch(JSON.stringify(rule), /Bern|\bBE\b|vrpg-be|be-public-holidays/);
  }
});
test('all true approval flags and implicit nationwide releases are rejected', () => {
  for (const mutate of [
    m => { m.runtimeActive = true; }, m => { m.legalApproval = true; },
    m => { m.status = 'approved'; }, m => { m.productFormatVersion = '4.0.0'; },
    m => { m.releaseEligibility.runtimeActive = true; }, m => { m.releaseEligibility.calendarProjectionActivation = true; },
    m => { m.releaseEligibility.plannedInitialCantons.push('ZH'); },
    m => { m.releaseEligibility.approvedBindings.push('AP19A-BE-ELG-OBJ'); },
    m => { m.releaseEligibility.requiredApprovals.pop(); }
  ]) rejectMutation(mutate);
});
test('unknown fields fail closed in each contract layer', () => {
  for (const path of [[], ['modelTestWindow'], ['sources', 0], ['federalRules', 0], ['cantonalBindings', 0], ['cantonalBindings', 0, 'holidayScopes', 0], ['releaseEligibility'], ['referenceInput'], ['referenceCases', 0], ['referenceCases', 0, 'overrides']]) {
    rejectMutation(m => { const value = path.reduce((item, key) => item[key], m); value.unknown = true; });
  }
  assert.equal(inspectModelCase(source, { ...source.referenceInput, unexpected: true }).reason, 'input-contract-invalid');
});
test('missing fields fail closed instead of defaulting to Bern or general VRPG', () => {
  for (const path of [['federalRules', 0, 'law'], ['federalRules', 0, 'sourceRefs'], ['cantonalBindings', 0, 'holidayScopes'], ['releaseEligibility', 'runtimeActive']]) {
    rejectMutation(m => { const owner = path.slice(0, -1).reduce((item, key) => item[key], m); delete owner[path.at(-1)]; });
  }
  for (const key of Object.keys(source.referenceInput)) {
    const input = { ...source.referenceInput }; delete input[key];
    assert.equal(inspectModelCase(source, input).reason, 'input-contract-invalid', key);
  }
});
test('empty, unresolved, changed and duplicated norm trails are rejected', () => {
  for (const mutate of [
    m => { m.federalRules[0].sourceRefs = []; }, m => { m.federalRules[0].sourceRefs.push('UNKNOWN'); },
    m => { m.federalRules[0].sourceRefs.pop(); }, m => { m.federalRules[0].sourceRefs.push('ELG-1'); },
    m => { m.sources[0].citation = ''; }, m => { m.sources[0].reviewStatus = 'approved'; },
    m => { m.federalRules[0].calculationParameters = { days: 30 }; }
  ]) rejectMutation(mutate);
});
test('duplicate identifiers and broken binding references are rejected', () => {
  for (const key of ['sources', 'federalRules', 'cantonalBindings', 'referenceCases']) rejectMutation(m => { m[key].push(structuredClone(m[key][0])); });
  rejectMutation(m => { m.cantonalBindings[0].ruleId = 'UNKNOWN'; });
  rejectMutation(m => { m.cantonalBindings[0].holidayScopes.push(structuredClone(m.cantonalBindings[0].holidayScopes[0])); });
});
test('source labels cannot contradict their statutory identifiers', () => {
  rejectMutation(m => { m.sources[0].citation = 'Art. 1 KVG'; });
  rejectMutation(m => { m.sources[1].citation = 'Art. 38 ATSG'; });
  rejectMutation(m => { m.sources.push({ id: 'UNKNOWN', citation: 'Art. 1 ELG', reviewStatus: 'not-approved' }); });
});
test('Bern constants cannot be added to a federal rule', () => {
  for (const [key, value] of [['proceduralCanton', 'BE'], ['calendarId', 'be-public-holidays'], ['profileId', 'vrpg-be']]) rejectMutation(m => { m.federalRules[0][key] = value; });
});
test('invalid, reversed and falsely approved coverage metadata are rejected', () => {
  for (const date of ['2026-02-30', '2026-13-01', '2026-1-01', '', null]) rejectMutation(m => { m.modelTestWindow.from = date; });
  rejectMutation(m => { m.modelTestWindow.from = '2028-01-01'; });
  rejectMutation(m => { m.cantonalBindings[0].localProcedureReview = 'approved'; });
  rejectMutation(m => { m.cantonalBindings[0].calendarProjectionReview = 'approved'; });
});
test('window boundaries are included and no legal-effective-date claim is inferred', () => {
  for (const date of [source.modelTestWindow.from, source.modelTestWindow.to]) {
    assert.equal(inspectModelCase(source, { ...source.referenceInput, legalTriggerDate: date }).structure, 'complete');
  }
  assert.equal(inspectModelCase(source, { ...source.referenceInput, legalTriggerDate: '2025-12-31' }).reason, 'outside-model-test-window');
  assert.equal('legalEffectiveFrom' in source.modelTestWindow, false);
});
test('procedural canton and holiday canton remain independently bound', () => {
  const model = fixture();
  // Synthetic memory-only extension demonstrates the structure, not a legal approval.
  model.cantonalBindings[0].holidayScopes.push({ canton: 'ZH', scopeId: 'MODEL-ZH', regionalAreaRequired: false, regionalAreaIds: [] });
  const result = inspectModelCase(model, { ...model.referenceInput, holidayCanton: 'ZH', holidayScopeId: 'MODEL-ZH' });
  assert.equal(result.structure, 'complete');
  assert.equal(result.eligibility, 'candidate-not-approved');
  assert.equal(result.runtimeActive, false);
});
test('conflicting, unknown and authority-based holiday anchors never fall back', () => {
  for (const status of ['unknown', 'conflict', null]) assert.equal(inspectModelCase(source, { ...source.referenceInput, holidayAnchorStatus: status }).reason, 'holiday-anchor-unqualified');
  assert.equal(inspectModelCase(source, { ...source.referenceInput, holidayCanton: 'XX' }).reason, 'holiday-scope-unbound');
  assert.equal(inspectModelCase(source, { ...source.referenceInput, regionalAreaId: 'SYNTHETIC-REGION-A' }).reason, 'unexpected-regional-area');
  rejectMutation(m => { m.cantonalBindings[3].holidayScopes[0].regionalAreaRequired = false; });
});
test('an unknown rule is blocked, never mapped by a similar label', () => {
  assert.equal(inspectModelCase(source, { ...source.referenceInput, ruleId: 'CH-SOC-KVG-OBJ' }).reason, 'rule-unavailable');
});

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? filesUnder(resolve(directory, entry.name)) : [resolve(directory, entry.name)]))).flat();
}
function moduleReferences(text, filename) {
  const file = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true,
    filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = [];
  function visit(node) {
    let specifier;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier;
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) specifier = node.moduleReference.expression;
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) specifier = node.arguments[0];
    if (specifier && ts.isStringLiteralLike(specifier)) imports.push(specifier.text);
    ts.forEachChild(node, visit);
  }
  visit(file);
  return imports;
}
test('AP19A model remains absent from runtime imports and released artifact paths', async () => {
  const runtimeFiles = (await filesUnder(resolve(root, 'src'))).filter(path => /\.(ts|tsx|js|mjs)$/.test(path));
  const releaseManifests = (await filesUnder(resolve(root, 'data/releases'))).filter(path => path.endsWith('/manifest.json'));
  for (const path of runtimeFiles) {
    const text = await readFile(path, 'utf8');
    for (const dependency of moduleReferences(text, path)) assert.doesNotMatch(dependency, /ap19a-national-model|check-ap19a-model/, path);
    // The CH-SOC-ELG identifiers were later separately implemented and approved.
    // They are not evidence of importing AP19A's synthetic model or permissions.
    assert.doesNotMatch(text, /AP19A-(?:BE|ZH|AG)-ELG/, path);
  }
  for (const path of releaseManifests) {
    const manifest = JSON.parse(await readFile(path, 'utf8'));
    for (const artifact of manifest.artifacts) assert.doesNotMatch(artifact.path, /ap19a-national-model|check-ap19a-model|AP19A-(?:BE|ZH|AG)-ELG/, path);
  }
  assert.doesNotMatch(await readFile(resolve(root, 'package.json'), 'utf8'), /ap19a-national-model|check-ap19a-model/);
});
test('AP19A import guard distinguishes import/export/require from legitimate shared IDs', () => {
  const text = `const releasedRule = "CH-SOC-ELG-OBJ";
    import data from './ap19a-national-model.json';
    export { check } from '../scripts/check-ap19a-model.mjs';
    const dynamic = import('./ap19a-national-model.json');
    const legacy = require('./check-ap19a-model.mjs');`;
  assert.deepEqual(moduleReferences(text, 'synthetic.ts'), ['./ap19a-national-model.json',
    '../scripts/check-ap19a-model.mjs', './ap19a-national-model.json', './check-ap19a-model.mjs']);
  assert.deepEqual(moduleReferences('const releasedRule = "CH-SOC-ELG-OBJ";', 'synthetic.ts'), []);
});
