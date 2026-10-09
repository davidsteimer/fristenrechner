// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const archive = path.join(repo, 'outputs/recovery-mvp07-0.7.0.1-2026-10-08');
const configuredStage = process.env.FRISTENRECHNER_RECOVERY_STAGE;
assert.ok(configuredStage && path.isAbsolute(configuredStage), 'An explicit absolute recovery stage is required. No live-source fallback.');
const stage = fs.realpathSync(configuredStage);
assert.match(path.relative(repo, stage), /^\.work\/mvp07-recovery-0703-[A-Za-z0-9]+$/);
const spfx = path.join(stage, 'spfx');
const sha = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');
const receipt = JSON.parse(fs.readFileSync(path.join(archive, 'artifact-verification.json'), 'utf8')) as {
  package: { path: string; sha256: string };
  files: Array<{ path: string; byteLength: number; sha256: string }>;
};
assert.equal(receipt.package.sha256, '9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9');
assert.equal(sha(fs.readFileSync(path.join(archive, receipt.package.path))), receipt.package.sha256);

// The whole staged source tree must still equal the sealed recovery source.
// Only the visible recovery-version marker is allowed to change. The actual
// calculation, lifecycle, defaults, schemas and all imported siblings are bound.
const prefix = 'build-inputs/spfx/src/';
const sourceFiles = receipt.files.filter(item => item.path.startsWith(prefix));
assert.equal(sourceFiles.length, 69, 'Sealed recovery source inventory missing');
for (const item of sourceFiles) {
  const sealed = fs.readFileSync(path.join(archive, item.path));
  assert.equal(sealed.length, item.byteLength, item.path);
  assert.equal(sha(sealed), item.sha256, item.path);
  const relative = item.path.slice('build-inputs/spfx/'.length);
  let expected = sealed;
  if (relative === 'src/webparts/fristenrechner/components/Fristenrechner.tsx') {
    const text = sealed.toString('utf8');
    assert.equal(text.split('data-recovery-version="0.7.0.1"').length, 2);
    expected = Buffer.from(text.replace('data-recovery-version="0.7.0.1"', 'data-recovery-version="0.7.0.3"'));
  }
  const actualPath = path.join(spfx, relative);
  assert.equal(fs.realpathSync(actualPath), actualPath, 'Staged source symlinks are not permitted');
  assert.deepEqual(fs.readFileSync(actualPath), expected, relative);
}
const solution = JSON.parse(fs.readFileSync(path.join(spfx, 'config/package-solution.json'), 'utf8'));
assert.equal(solution.solution.version, '0.7.0.3');
assert.ok(solution.solution.features.length > 0);
assert.ok(solution.solution.features.every((feature: { version: string }) => feature.version === '0.7.0.3'));
const stagedRequire = createRequire(path.join(spfx, 'package.json'));

export function loadStageModule<T>(relativePath: string): T {
  assert.ok(sourceFiles.some(item => item.path === `build-inputs/spfx/${relativePath}`), 'Only sealed source modules may be loaded');
  return stagedRequire(path.join(spfx, relativePath)) as T;
}
