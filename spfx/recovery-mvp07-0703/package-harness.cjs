// SPDX-License-Identifier: AGPL-3.0-only
'use strict';

// Reuse the sealed original harness byte for byte. It runs the actual AMD
// package with simulated browser/React storage, not a browser or tenant host.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const REPO_ROOT = path.resolve(__dirname, '../..');
const RECOVERY_BASIS = path.join(REPO_ROOT, 'outputs/recovery-mvp07-0.7.0.1-2026-10-08');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [file, expected] of [
  ['spfx/recovery-mvp07/package-harness.cjs', 'c2fe144c3f7229e63a7046b7eb07a6dac9f0d7c6423f783ff519a805646c9a42'],
  ['spfx/test-build/package-harness.cjs', '2b64616aca108bc8d77d444d79ffa37249d73b0fceb7c83787bb6990314ffa30']
]) {
  assert.equal(sha256(fs.readFileSync(path.join(REPO_ROOT, file))), expected, file);
  assert.equal(sha256(fs.readFileSync(path.join(RECOVERY_BASIS, 'implementation', file))), expected, file);
}
const receipt = JSON.parse(fs.readFileSync(path.join(RECOVERY_BASIS, 'artifact-verification.json')));
assert.equal(sha256(fs.readFileSync(path.join(RECOVERY_BASIS, receipt.package.path))), '9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9');
for (const item of receipt.files.filter(item => item.path.startsWith('basis/data/releases/'))) {
  const bytes = fs.readFileSync(path.join(RECOVERY_BASIS, item.path));
  assert.equal(bytes.length, item.byteLength, item.path);
  assert.equal(sha256(bytes), item.sha256, item.path);
}
module.exports = {...require('../recovery-mvp07/package-harness.cjs'), RECOVERY_BASIS, sha256};
