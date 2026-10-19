// SPDX-License-Identifier: AGPL-3.0-only
// Separate human approval record. No network, deployment or Git mutation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {root, hash, encode} from './consolidate-mvp08-sources.mjs';
import {readRegular, writeExclusive} from './record-mvp08-source-approval.mjs';

const prefix = 'outputs/release-mvp09-2026-10-18/r09c';
const proposalPath = `${prefix}/proposal.json`;
const proposalBytes = await readRegular(root, proposalPath);
assert.equal(hash(proposalBytes), '222dd2c7d771ebb319d827c9b23dc686d9eed291004282fe52bf9154422fc06b');
const proposal = JSON.parse(proposalBytes);
for (const item of [...proposal.documents, ...proposal.currentNavigation, ...proposal.artifacts,
  proposal.mirrors, proposal.actualPackageRoundtrip, proposal.localCompletion,
  proposal.documentationCompletion, proposal.tool]) {
  const bytes = await readRegular(root, item.path);
  assert.equal(bytes.length, item.byteLength, item.path);
  assert.equal(hash(bytes), item.sha256, item.path);
}
const targetPath = '.work/deployments/2026-10-18-eq-mvp09/vorbereitung/targets.private.json';
const targets = await readRegular(root, targetPath);
assert.equal(hash(targets), proposal.privateTargetBinding.sha256);
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(), '0ccc4b9178503ede051964149a4b17efab8d0cf9');
assert.equal(execFileSync('git', ['diff', '--cached', '--name-only'], {cwd: root, encoding: 'utf8'}).trim(), '');
const approval = {
  kind: 'r09c-human-execution-approval', schemaVersion: '1.0.0',
  decisionDate: '2026-10-18', timezone: 'Europe/Zurich', recordedAt: new Date().toISOString(),
  decisionMaker: 'David Steimer', instrument: 'Codex, no formal approval responsibility',
  source: 'Direct user message in the current task',
  exactUserStatement: 'Ich gebe R09C-U01, R09C-H01 und R09C-I01 gemäss der gebundenen Vorlage frei. Starte mit der frischen Ausgangssicherung. Den Mirrorupload übernehme ich anschliessend manuell.',
  proposal: {path: proposalPath, byteLength: proposalBytes.length, sha256: hash(proposalBytes)},
  privateTargetSha256: hash(targets), approvedGates: ['R09C-U01', 'R09C-H01', 'R09C-I01'],
  currentStep: 'C01 fresh read-only baseline and local backup',
  captureStartedAt: '2026-10-18T21:58:45Z',
  mirrorUploadActor: 'David Steimer manually after C01',
  installationCondition: 'C01-C03 passed, exact identities and expected current baseline, E gate before Q transition',
  recoveryCondition: 'Only the bound conditional recovery procedure, all four own Format-8 mirrors before package 0.9.0.1',
  notAuthorized: ['Codex mirror upload', 'additional site or tab installation', 'new guests',
    'permission or policy changes', 'AP5 configuration or data change', 'AP21 or E05 change',
    'additional builds or commits', 'GitHub push', 'P deployment', 'Outlook import',
    'general browser data reset', 'cache entry deletion', 'operating approval'],
  historicalProposalUnchanged: true, noUploadOrInstallationInThisRecord: true
};
const destination = `${prefix}/execution-approval-2026-10-18.json`;
await writeExclusive(root, destination, encode(approval));
console.log(JSON.stringify({path: destination, sha256: hash(encode(approval)), approvedGates: approval.approvedGates, currentStep: approval.currentStep}, null, 2));
