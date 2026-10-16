// SPDX-License-Identifier: AGPL-3.0-only
// Local AP23C proposal evidence only. No builds, promotion, publication or browser access.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runContractChecks } from './check-ap23c-contract.mjs';
import { runProbeSummary } from './check-ap23c-defaults.mjs';
import { runReferences } from './check-ap23b-references.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const documents = [
  'docs/fachrecht/abnahme-ap23b.md',
  'docs/entscheidungen/DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md',
  'docs/entscheidungen/DEC-2026-032-kantonale-verwaltungsverfahren-datenvertrag.md',
  'docs/architektur/verwaltungsverfahrensvertrag-ap23c.md',
  'docs/architektur/verwaltungsverfahrensvertrag-ap23c-pruefung.md'
];
const historical = [
  ['docs/fachrecht/verwaltungsverfahren-ap23b.md','d27db556347dc5fe441e4cb155c00303d4af7ec1977944db8567356a5f0b6568'],
  ['docs/fachrecht/quellenpruefung-ap23b.md','619f99fa7df2a650467e41ce58d443758263e30f54167aacaf096be7a1e7b3af'],
  ['docs/fachrecht/referenzfaelle-ap23b.md','4ab3f0e1725001a1eff084ae73c10ebcea0e34cd99c52378fa67e20fa0975a60'],
  ['tests/golden/candidates/ap23b-administrative.json','a795a22a07945e02369f917dcea4d047a7bb3bb897e198a1fe1ffbea4a65a5d1'],
  ['scripts/check-ap23b-references.mjs','69ab68b9ff8ef68aabd78a1faa60a0ad98a38aadd7ee6ae4366f70504553523e'],
  ['outputs/ap23b-2026-10-12/QA-AP23B.json','6ce8d3d089d17da7db280a40d2047957c57643f56ccdf2fdd79e6d6e84922ea4']
];
for (const [path, expected] of historical) assert.equal(sha(await readFile(resolve(root,path))), expected, path);
const contract = await runContractChecks();
const defaults = runProbeSummary();
const oldReferences = await runReferences();
const productDiff = execFileSync('git',['diff','--name-only','HEAD','--','src','schemas','data','spfx','package.json','package-lock.json'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(productDiff,'','Tracked product baseline differs from HEAD');
execFileSync('git',['diff','--check'],{cwd:root,encoding:'utf8'});

let checkedLocalLinks = 0;
for (const path of documents) {
  const text = await readFile(resolve(root,path),'utf8');
  assert.ok(!text.includes('ß'),`Non-Swiss spelling: ${path}`);
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^https?:\/\//.test(match[1])) continue;
    const destination = match[1].split('#')[0];
    if (!destination) continue;
    // The report is generated below, its absence on the first run is intentional.
    if (destination.endsWith('/QA-AP23C.json')) continue;
    await readFile(resolve(root,dirname(path),destination));
    checkedLocalLinks++;
  }
}
const files = [...documents,
  'scripts/check-ap23c-contract.mjs','scripts/check-ap23c-defaults.mjs','scripts/check-ap23c-readiness.mjs',
  'tests/golden/candidates/ap23c-administrative-contract.json',
  ...(await readdir(resolve(root,'schemas/candidates/ap23c'))).filter(name=>name.endsWith('.json')).sort().map(name=>`schemas/candidates/ap23c/${name}`)
];
const artifacts = [];
for (const path of files) { const bytes = await readFile(resolve(root,path)); artifacts.push({path,byteLength:bytes.length,sha256:sha(bytes)}); }
const report = {
  kind:'ap23c-proposal-qa',checkedOn:'2026-10-14',status:'ready-for-technical-decision',
  ap23bAccepted:true,legalDecision:'DEC-2026-031',technicalDecision:'DEC-2026-032',technicalDecisionApproved:false,
  runtimeActive:false,productIntegrationTest:false,releaseBuilt:false,published:false,
  environment:{node:process.version,python:execFileSync(resolve(root,'.venv/bin/python'),['--version'],{encoding:'utf8'}).trim()},
  contract,defaults,
  historicalResearch:{referenceCases:oldReferences.referenceCases,negativeMutations:oldReferences.negativeMutations,preservedFiles:oldReferences.preserved.length,
    interpretation:'Historical AP23B oracle unchanged. TI-O1 superseded only through DEC-2026-031 and the new separate contract probe.'},
  historicalAp23bHashes:historical.map(([path,sha256])=>({path,sha256})),
  checks:{trackedProductDiffEmpty:true,gitDiffCheckPassed:true,checkedLocalLinks},artifacts
};
if (process.argv.includes('--write')) {
  const output = resolve(root,'outputs/ap23c-vertrag-2026-10-14');
  await mkdir(output,{recursive:true});
  await writeFile(resolve(output,'QA-AP23C.json'),`${JSON.stringify(report,null,2)}\n`);
}
console.log(JSON.stringify(report,null,2));
