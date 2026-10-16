// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
// Executes the real package. Browser/React/transport are synthetic local seams.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const sha = value => createHash('sha256').update(value).digest('hex');
for (const [file, expected] of [
  ['spfx/recovery-mvp07/package-harness.cjs','c2fe144c3f7229e63a7046b7eb07a6dac9f0d7c6423f783ff519a805646c9a42'],
  ['spfx/test-build/package-harness.cjs','826444399ea2e8a72a6ad06924b6c05a44ea71413ca34b2dc63c4f51c0b5547d']
]) assert.equal(sha(fs.readFileSync(path.join(root,file))),expected,file);
module.exports = require('../recovery-mvp07/package-harness.cjs');
