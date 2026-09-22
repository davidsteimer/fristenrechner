// SPDX-License-Identifier: AGPL-3.0-only
import { spawnSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson, createCandidate, sha256 } from './ap18c-import.mjs';
import { AP18C_REFERENCE } from './ap18-workbook-archive.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(root, 'data/candidates/2026-09-22-ap18c-workbook');
const workbook = path.join(root, AP18C_REFERENCE);
const python = process.env.AP18_PYTHON || 'python3';
const run = spawnSync(python, [path.join(root, 'scripts/ap18c_read_workbook.py'), workbook], {
  encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 60000
});
if (run.error || run.status !== 0) throw new Error(`XLSX import failed: ${run.error?.message ?? run.stderr}`);
const snapshot = JSON.parse(run.stdout);
const acceptanceBytes = await readFile(path.join(target, 'acceptance.json'));
const acceptance = JSON.parse(acceptanceBytes);
const baseline = path.join(root, 'data/releases/2026-08-31-mvp-03-approved.1');
const manifest = JSON.parse(await readFile(path.join(baseline, 'manifest.json'), 'utf8'));
// Recheck the existing manifest. Importing the workbook never writes here.
for (const artifact of manifest.artifacts) {
  if (sha256(await readFile(path.join(baseline, artifact.path))) !== artifact.sha256) throw new Error(`Changed approved baseline: ${artifact.path}`);
}
const calendars = await Promise.all(['ch-federal-calendar', 'be-public-holidays'].map(async name =>
  JSON.parse(await readFile(path.join(baseline, `calendars/${name}.json`), 'utf8'))));
const { candidate, report } = createCandidate(snapshot, acceptance, calendars);
report.acceptanceSha256 = sha256(acceptanceBytes);
report.verifiedBaselineArtifacts = manifest.artifacts.length;
if (sha256(await readFile(workbook)) !== snapshot.source.sha256) throw new Error('Workbook changed during import');
await mkdir(target, { recursive: true });
for (const [name, value] of [['holiday-candidate.json', candidate], ['validation-report.json', report]]) {
  const destination = path.join(target, name);
  const bytes = canonicalJson(value);
  // Repeated builds may verify but never silently replace a different candidate.
  try {
    const current = await readFile(destination, 'utf8');
    if (current !== bytes) throw new Error(`Existing candidate differs: ${name}. Review the change before choosing a new candidate directory.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(destination, bytes, { flag: 'wx' });
  }
  if (await readFile(destination, 'utf8') !== bytes) throw new Error(`Readback mismatch: ${name}`);
}
console.log(JSON.stringify(report, null, 2));
