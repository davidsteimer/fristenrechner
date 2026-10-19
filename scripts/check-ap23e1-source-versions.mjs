// SPDX-License-Identifier: AGPL-3.0-only
// Read-only public-law retrieval. Private receipts, no release-data mutation.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, '.work/ap23e1-source-checks');
const sources = [
  ['LU-VRG', 'https://srl.lu.ch/api/de/texts_of_law/40', 3793],
  ['LU-RTG', 'https://srl.lu.ch/api/de/texts_of_law/855', 4916],
  ['LU-JUSG', 'https://srl.lu.ch/api/de/texts_of_law/260', 4662],
  ['ZG-VRG', 'https://bgs.zg.ch/api/de/texts_of_law/162.1', 2740],
  ['AR-VRPG', 'https://ar.clex.ch/api/de/texts_of_law/143.1', 1285],
  ['AR-ARGV', 'https://ar.clex.ch/api/de/texts_of_law/822.11', 1058],
  ['AR-BAUG', 'https://ar.clex.ch/api/de/texts_of_law/721.1', 1584],
  ['AR-STG', 'https://ar.clex.ch/api/de/texts_of_law/621.11', 1634]
];
await mkdir(output, { recursive: true });
const results = process.argv.includes('--cached') ? JSON.parse(await readFile(resolve(output, 'versions.json'), 'utf8')) : await Promise.all(sources.map(async ([id, url, expectedVersion]) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const data = JSON.parse(bytes.toString('utf8'));
    await writeFile(resolve(output, `${id}.json`), bytes);
    return { id, url, expectedVersion, retrievedAt: new Date().toISOString(),
      sha256: createHash('sha256').update(bytes).digest('hex'), data };
  } catch (error) { return { id, url, expectedVersion, error: String(error.message) }; }
}));
if (!process.argv.includes('--cached')) await writeFile(resolve(output, 'versions.json'), JSON.stringify(results, null, 2) + '\n');
const summary = results.map(({ data, ...receipt }) => ({ ...receipt,
  currentVersion: data?.text_of_law?.current_version,
  futureVersions: data?.text_of_law?.future_versions,
  abrogated: data?.text_of_law?.abrogated,
  matchesExpected: data?.text_of_law?.current_version?.id === receipt.expectedVersion
}));
const destination = resolve(root, 'outputs/ap23e1-2026-10-18');
await mkdir(destination, { recursive: true });
await writeFile(resolve(destination, 'quellenfassungen.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (summary.some(result => result.error || !result.matchesExpected || result.abrogated !== false)) process.exitCode = 1;
