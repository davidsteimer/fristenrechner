// SPDX-License-Identifier: AGPL-3.0-only
// Records the human decision locally. No network or Git mutation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {root, prefix, hash, encode} from './consolidate-mvp08-sources.mjs';
import {readRegular, writeExclusive} from './record-mvp08-source-approval.mjs';

const proposalPath = `${prefix}/r08c/proposal.json`;
const proposalBytes = await readRegular(root, proposalPath);
assert.equal(hash(proposalBytes), '179bfb3b6319a25f816241f69b78eff801cc98de1717523c890a2fc486ab35bf');
const proposal = JSON.parse(proposalBytes);
for (const item of [...proposal.documents, ...proposal.artifacts, proposal.mirrors, proposal.actualPackageRoundtrip, proposal.localCompletion, proposal.tool]) {
  const bytes = await readRegular(root, item.path);
  assert.equal(bytes.length, item.byteLength, item.path);
  assert.equal(hash(bytes), item.sha256, item.path);
}
const targets = await readRegular(root, '.work/deployments/2026-10-15-eq-mvp08/vorbereitung/targets.private.json');
assert.equal(hash(targets), proposal.privateTargetBinding.sha256);
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(), '10a99419eaabb3e96d2acccf0c7a93e2fe6472cb');
assert.equal(execFileSync('git', ['diff', '--cached', '--name-only'], {cwd: root, encoding: 'utf8'}).trim(), '');
const approval = {
  kind: 'r08c-human-execution-approval', schemaVersion: '1.0.0', decisionDate: '2026-10-16', timezone: 'Europe/Zurich',
  recordedAt: new Date().toISOString(), decisionMaker: 'David Steimer', instrument: 'Codex, no formal approval responsibility',
  source: 'Direct user message in the current task',
  exactUserStatement: 'Ich gebe R08C-U01, R08C-H01 und R08C-I01 gemäss der gebundenen Vorlage frei. Starte mit der frischen Ausgangssicherung. Den Mirrorupload übernehme ich anschliessend manuell.',
  proposal: {path: proposalPath, byteLength: proposalBytes.length, sha256: hash(proposalBytes)},
  privateTargetSha256: hash(targets), approvedGates: ['R08C-U01', 'R08C-H01', 'R08C-I01'],
  currentStep: 'C01 fresh read-only baseline and local backup', mirrorUploadActor: 'David Steimer manually after C01',
  installationCondition: 'C01-C03 passed, unchanged exact identities and baseline, E gate before Q transition',
  recoveryCondition: 'Only the bound conditional recovery procedure, Format-7 configurations before package 0.8.0.1',
  notAuthorized: ['Codex mirror upload', 'additional site or tab installation', 'new guests', 'permission or policy changes',
    'AP5 configuration or data change', 'AP21 or E05 change', 'additional builds or commits', 'GitHub push', 'P deployment', 'Outlook import', 'operating approval'],
  historicalProposalUnchanged: true, noUploadOrInstallationInThisRecord: true
};
const destination = `${prefix}/r08c/execution-approval-2026-10-16.json`;
await writeExclusive(root, destination, encode(approval));
console.log(JSON.stringify({path: destination, sha256: hash(encode(approval)), approvedGates: approval.approvedGates, currentStep: approval.currentStep}, null, 2));
