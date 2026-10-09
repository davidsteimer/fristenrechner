// SPDX-License-Identifier: AGPL-3.0-only
// Read-only verification of the explicit publication snapshot, independent of staging.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const snapshotPath = 'outputs/publication-mvp05-final-2026-09-28/publication-package.json'
const snapshot = JSON.parse(fs.readFileSync(path.join(root, snapshotPath), 'utf8'))
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const issues = []
const seen = new Set()
for (const entry of snapshot.files) {
  const p = entry.path
  if (seen.has(p) || p === snapshotPath || path.isAbsolute(p) || p.split('/').includes('..') || p.includes('\\') || /^(?:\.work|Userinput|outputs\/arbeitskopien)\//.test(p) || snapshot.excludedPaths.includes(p)) {
    issues.push(`Forbidden or duplicate path: ${p}`)
    continue
  }
  seen.add(p)
  try {
    const full = path.join(root, p)
    if (!fs.lstatSync(full).isFile()) throw new Error('Not a regular file')
    const bytes = fs.readFileSync(full)
    if (bytes.length !== entry.byteLength || sha(bytes) !== entry.sha256) issues.push(`Byte mismatch: ${p}`)
  } catch (error) {
    issues.push(`Unreadable path: ${p}: ${error.message}`)
  }
}
const canonical = [...snapshot.files].sort((a,b)=>a.path < b.path ? -1 : a.path > b.path ? 1 : 0).map(e=>`${e.sha256}  ${e.byteLength}  ${e.path}\n`).join('')
if (sha(canonical) !== snapshot.inventorySha256) issues.push('Inventory digest mismatch')
if (snapshot.fileCount !== snapshot.files.length || snapshot.totalBytes !== snapshot.files.reduce((n,e)=>n+e.byteLength,0)) issues.push('Inventory counts differ')
if (snapshot.releaseId !== '2026-09-28-mvp-05-approved.1' || snapshot.packageVersion !== '0.5.0.0' || snapshot.publicationAuthorized !== false || snapshot.productionAuthorized !== false) issues.push('Unexpected release or authority binding')
if (snapshot.dataCommitFiles.length !== 12 || snapshot.dataCommitFiles.some(p=>!seen.has(p) || !p.startsWith(`data/releases/${snapshot.releaseId}/`))) issues.push('Data commit selection mismatch')
console.log(JSON.stringify({kind:'mvp05PublicationSnapshotReadback',fileCount:snapshot.files.length,inventorySha256:snapshot.inventorySha256,passed:issues.length===0,issues},null,2))
if (issues.length) process.exitCode = 1
