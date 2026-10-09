// SPDX-License-Identifier: AGPL-3.0-only
// Read-only local publication inventory. No staging, commit, upload or approval.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = 'outputs/publication-mvp06-final-2026-10-01/publication-package.json';
const snapshot = JSON.parse(fs.readFileSync(path.join(root, snapshotPath), 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const issues = [];
const seen = new Set();
const privateSegments = new Set(['.work', '.git', '.venv', 'node_modules', 'Userinput', 'arbeitskopien']);
for (const entry of snapshot.files) {
  const p = entry.path;
  const parts = p.split('/');
  if (seen.has(p) || p === snapshotPath || path.isAbsolute(p) || parts.some(x => !x || x === '..' || privateSegments.has(x)) || p.includes('\\') || snapshot.excludedPaths.includes(p)) {
    issues.push(`Forbidden or duplicate path: ${p}`);
    continue;
  }
  seen.add(p);
  try {
    for (let i = 1; i <= parts.length; i++) {
      const stat = fs.lstatSync(path.join(root, ...parts.slice(0, i)));
      if (stat.isSymbolicLink() || (i === parts.length ? !stat.isFile() : !stat.isDirectory())) throw new Error('Not a regular repository path');
    }
    const bytes = fs.readFileSync(path.join(root, p));
    if (bytes.length !== entry.byteLength || hash(bytes) !== entry.sha256) issues.push(`Byte mismatch: ${p}`);
  } catch (error) { issues.push(`Unreadable path: ${p}: ${error.message}`); }
}
const canonical = [...snapshot.files].sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0).map(e => `${e.sha256}  ${e.byteLength}  ${e.path}\n`).join('');
if (hash(canonical) !== snapshot.inventorySha256) issues.push('Inventory digest mismatch');
if (snapshot.fileCount !== snapshot.files.length || snapshot.totalBytes !== snapshot.files.reduce((n,e) => n + e.byteLength, 0)) issues.push('Inventory counts differ');
if (snapshot.releaseId !== '2026-10-01-mvp-06-approved.1' || snapshot.packageVersion !== '0.6.0.1' || snapshot.dataCommit !== '19b37336974f3ba7c72333763e1272425239b8cd') issues.push('Unexpected release binding');
if (snapshot.publicationAuthorized !== false || snapshot.productionAuthorized !== false) issues.push('Unexpected authority claim');
if (snapshot.dataCommitFiles.length !== 11 || new Set(snapshot.dataCommitFiles).size !== 11 || snapshot.dataCommitFiles.some(p => !seen.has(p) || !p.startsWith(`data/releases/${snapshot.releaseId}/`))) issues.push('Data commit selection mismatch');
const required = {
  'data/releases/2026-10-01-mvp-06-approved.1/manifest.json': '637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724',
  'outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg': '60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587',
  'outputs/release-mvp06-web-corrected-2026-10-01/artifacts/fristenrechner-mvp06-steimer-web-corrected-0601.zip': '37e949e0442365a86b5b4e90e25a5a4ef9d8209a31644f3de119f2862b9d3810',
  'docs/betrieb/pruefmatrix-mvp06.md': '8e5db3b7fcc5e71e46767d1b37fc68d02d0c37946a238f9b2e99352af97f08ad'
};
for (const [p, sha256] of Object.entries(required)) if (snapshot.files.find(e => e.path === p)?.sha256 !== sha256) issues.push(`Missing exact release anchor: ${p}`);
console.log(JSON.stringify({kind:'mvp06PublicationSnapshotReadback', fileCount:snapshot.files.length, inventorySha256:snapshot.inventorySha256, publicationPerformed:false, passed:issues.length === 0, issues}, null, 2));
if (issues.length) process.exitCode = 1;
