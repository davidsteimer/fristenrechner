// SPDX-License-Identifier: AGPL-3.0-only
// Isolated proposal QA. No runtime build, promotion, installation or publication.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,inputs,inspectContract,candidatePath,sha} from './build-ap22b-contract.mjs';
import assert from 'node:assert/strict';

const source=await inputs();
const value=JSON.parse(await fs.readFile(path.join(root,candidatePath),'utf8'));
const structure=inspectContract(value,source);
const nodeArgs=['--test','--test-reporter=tap','tests/governance/ap22b-contract.test.mjs','tests/governance/ap22b-reference-index.test.mjs'];
const nodeOutput=execFileSync(process.execPath,nodeArgs,{cwd:root,encoding:'utf8'});
assert.match(nodeOutput,/# tests 24\b/);assert.match(nodeOutput,/# pass 24\b/);assert.match(nodeOutput,/# fail 0\b/);
const python=path.join(root,'.venv/bin/python');
// unittest writes its summary to stderr. subprocess binds both streams without a shell.
const pyRunner='import subprocess,sys;r=subprocess.run(sys.argv[1:],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);print(r.stdout,end="");sys.exit(r.returncode)';
const pyArgs=['-m','unittest','discover','-s','tests/data','-p','test_ap22b_*.py','-v'];
const pythonOutput=execFileSync(python,['-c',pyRunner,python,...pyArgs],{cwd:root,encoding:'utf8'});
assert.match(pythonOutput,/Ran 20 tests/);assert.match(pythonOutput,/\nOK\s*$/);
const files=[
 'docs/architektur/kalendervertrag-ap22b.md',
 'docs/entscheidungen/DEC-2026-030-kalenderaktivierung-formatvertrag.md',
 'schemas/candidates/ap22b/holiday-catalog-v2.schema.json',
 'schemas/candidates/ap22b/calendar-rules-v3.schema.json',
 'schemas/candidates/ap22b/release-manifest-v7.schema.json',
 candidatePath,'tests/golden/candidates/ap22b-calendar-references.json',
 'scripts/build-ap22b-contract.mjs','scripts/check-ap22b-contract.mjs',
 'tests/governance/ap22b-contract.test.mjs','tests/governance/ap22b-reference-index.test.mjs',
 'tests/data/test_ap22b_catalog.py','tests/data/test_ap22b_formats.py',
];
const artifacts=[];
for(const file of files){const raw=await fs.readFile(path.join(root,file));artifacts.push({path:file,byteLength:raw.length,sha256:sha(raw)});}
const report={
 kind:'ap22b-contract-qa',date:'2026-10-08',status:'proposal-ready-for-review',
 contractApproved:false,runtimeActive:false,releaseBuilt:false,published:false,
 structure,
 environment:{node:process.version,python:execFileSync(python,['--version'],{encoding:'utf8'}).trim(),scope:'Isolated schema and proposal tests only. Not a Node-22 production build qualification.'},
 tests:{total:44,passed:44,failed:0,node:{count:24,command:'node '+nodeArgs.join(' '),outputSha256:sha(nodeOutput)},python:{count:20,command:'.venv/bin/python '+pyArgs.join(' '),outputSha256:sha(pythonOutput)}},
 references:{ap22aGroups:25,centralBoundaries:8,januaryCounterfactuals:4,productCasesExecuted:false},
 productRegressionReexecuted:false,legalSourcesRechecked:false,
 sourceEvidenceDate:'2026-10-02',
 artifacts,
};
await inputs(); // Recheck immutable input bytes after both test runs.
if(process.argv.includes('--write')){
  const dir=path.join(root,'outputs/ap22b-vertrag-2026-10-08');await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,'QA-AP22B.json'),JSON.stringify(report,null,2)+'\n');
  await fs.writeFile(path.join(dir,'node-tests.txt'),nodeOutput);
  await fs.writeFile(path.join(dir,'python-tests.txt'),pythonOutput);
}
console.log(JSON.stringify(report,null,2));
