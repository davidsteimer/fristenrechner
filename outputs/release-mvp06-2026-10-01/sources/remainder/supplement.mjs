// SPDX-License-Identifier: AGPL-3.0-only
// Read-only retrieval of two earlier consolidations overlapping the 2026 window.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const out = 'outputs/release-mvp06-2026-10-01/sources/remainder';
const raw = '.work/release-mvp06-2026-10-01/remainder/earlier-consolidations';
const results = [];
for (const [law, work] of [['BGG', '2006/218'], ['ZPO', '2010/262']]) {
  const file = `${law}-20250101.xml`;
  const url = `https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/${work}/20250101/de/xml/fedlex-data-admin-ch-eli-cc-${work.replaceAll('/', '-')}-20250101-de-xml.xml`;
  const result = {id: `${law}-20250101`, url, checkedAt: new Date().toISOString(), rawPath: `${raw}/${file}`};
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
    const bytes = Buffer.from(await response.arrayBuffer());
    await mkdir(resolve(root, raw), {recursive: true});
    await writeFile(resolve(root, result.rawPath), bytes, {flag: 'wx'});
    Object.assign(result, {status: response.status, contentType: response.headers.get('content-type'), bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex')});
  } catch (error) { result.error = String(error); }
  results.push(result);
}
const content = Buffer.from(JSON.stringify({checkedOn: '2026-10-01', formalApproval: false, retrievals: results}, null, 2) + '\n');
await writeFile(resolve(root, out, 'earlier-consolidations.json'), content, {flag: 'wx'});
console.log(JSON.stringify(results));
