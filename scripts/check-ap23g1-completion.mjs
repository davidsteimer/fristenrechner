// SPDX-License-Identifier: AGPL-3.0-only
// Separate research completion record. Never refresh an accepted baseline.
import assert from 'node:assert/strict';
import { readFile, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = 'outputs/ap23g1-2026-10-22';
const read = p => readFile(resolve(root, p));
const hash = b => createHash('sha256').update(b).digest('hex');
const run = (file, args) => execFileSync(file, args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const nodeReferences = JSON.parse(run(process.execPath, ['scripts/check-ap23g1-references.mjs', '--write']));
const pythonReferences = JSON.parse(run(resolve(root, '.venv/bin/python'), ['scripts/check_ap23g1_independent.py', '--write']));
const evidence = JSON.parse(run(process.execPath, ['scripts/check-ap23g1-evidence.mjs', '--write']));
const preservation = JSON.parse(run(process.execPath, ['scripts/check-ap23g1-preservation.mjs', '--write']));
const tests = run(process.execPath, ['--test', 'tests/governance/ap23g1-research.test.mjs']);
assert.match(tests, /# tests 36\n/);
assert.match(tests, /# pass 36\n/);
assert.match(tests, /# fail 0\n/);
run('git', ['diff', '--check']);
const newDocuments = [
  'docs/fachrecht/start-ap23g1.md', 'docs/fachrecht/verwaltungsverfahren-ap23g1.md',
  'docs/fachrecht/quellenpruefung-ap23g1.md', 'docs/fachrecht/referenzfaelle-ap23g1.md',
  ...['ur','so','sh'].map(c => `docs/fachrecht/ap23g1/recherche-${c}.md`)
];
const living = ['README.md', 'docs/README.md', 'docs/fachrecht/README.md',
  'docs/architektur/README.md', 'docs/entscheidungen/README.md',
  'docs/planung/schweizausbau-nach-mvp09.md', 'docs/planung/fortsetzung-verwaltungsverfahren-mvp09.md'];
let localLinksChecked = 0;
for (const p of [...newDocuments, ...living]) {
  const text = (await read(p)).toString();
  if (newDocuments.includes(p)) assert.equal(/[;ß]/u.test(text), false, `Language style ${p}`);
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
    let target = m[1].replace(/^<|>$/g, '').split(/\s+"/)[0];
    if (/^(?:https?:|mailto:|codex:|plugin:|#)/i.test(target)) continue;
    target = decodeURIComponent(target.split('#')[0]);
    if (!target) continue;
    await access(resolve(root, dirname(p), target)).catch(() => { throw Error(`Broken local link ${p} -> ${target}`); });
    localLinksChecked++;
  }
}
const sources = [
  ...newDocuments, ...living, 'docs/fachrecht/ap23g1/referenzfaelle.json',
  ...['ur','so','sh'].map(c => `docs/fachrecht/ap23g1/befund-${c}.json`),
  'scripts/check-ap23g1-references.mjs', 'scripts/check_ap23g1_independent.py',
  'scripts/check-ap23g1-evidence.mjs', 'scripts/check-ap23g1-preservation.mjs',
  'scripts/check-ap23g1-completion.mjs', 'tests/governance/ap23g1-research.test.mjs',
  ...['reference-verification.json','independent-verification.json','evidence-verification.json','preservation-verification.json'].map(n => `${output}/${n}`),
  `${output}/project-card-status.json`
];
const bindings = [];
for (const p of sources) {
  const b = await read(p);
  bindings.push({ path: p, byteLength: b.length, sha256: hash(b) });
}
const report = {
  workPackage: 'AP23G1', asOf: '2026-10-22', status: 'research-completed-awaiting-human-acceptance',
  scopeConfirmedBy: 'David Steimer', referenceGroups: 16, referenceCases: 115,
  counts: nodeReferences.counts, independentCalculationComparisons: pythonReferences.referenceComparisons,
  researchCheckerTests: { passed: 36, failed: 0, productTests: false, overlapsReferenceExpectations: true },
  calendarProbes: nodeReferences.calendarProbes, calendarAnnualCountChecks: nodeReferences.calendarCountChecks,
  calendarDateComparisons: evidence.calendarComparisons.reduce((n, c) => n + c.datesCompared, 0),
  evidenceOriginalFiles: evidence.originalFilesInventoried, explicitEvidenceBindings: evidence.explicitEvidenceBindingsVerified,
  localLinksChecked, diffWhitespaceCheckPassed: true, preservation,
  issueStatusReadbackSnapshot: JSON.parse(await read(`${output}/project-card-status.json`)),
  professionalAcceptance: false, formatDecision: false, runtimeActivation: false,
  productCodeChanged: false, acceptedLegalDataChanged: false, commitCreated: false,
  sourcePushPerformed: false, releaseBuildPerformed: false, operatingChanges: false,
  nextGate: 'Human professional acceptance, then separately commissioned AP23G2',
  bindings
};
if (process.argv.includes('--write')) {
  await writeFile(resolve(root, output, 'research-checker-tests.txt'), tests);
  await writeFile(resolve(root, output, 'local-completion.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ ...report, bindings: undefined }, null, 2));
