// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetsRoot = resolve(projectRoot, 'release', 'assets');
const bundleNames = (await readdir(assetsRoot)).filter(name => (
  /^fristenrechner-web-part_[a-f0-9]+\.js$/.test(name)
));

assert.equal(bundleNames.length, 1, 'Genau ein produktives Fristenrechner-Bundle erwartet');

const bundle = await readFile(resolve(assetsRoot, bundleNames[0]), 'utf8');

assert.match(bundle, /(?:^|})\.fr-actions\{/);
assert.doesNotMatch(bundle, /:global\s+\.fr-actions/);
assert.doesNotMatch(bundle, /\.fr-actions_[a-z0-9]+/i);

console.log(`Bundle-CSS geprüft: ${bundleNames[0]}`);
