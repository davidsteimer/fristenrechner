// SPDX-License-Identifier: AGPL-3.0-only
// Research evidence inventory and read-only comparison, not a product validator.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { holidays } from './check-ap23g1-references.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = 'outputs/ap23g1-2026-10-22';
const read = p => readFile(resolve(root, p));
const json = async p => JSON.parse(await read(p));
const hash = b => createHash('sha256').update(b).digest('hex');
const suite = await json('docs/fachrecht/ap23g1/referenzfaelle.json');
const files = new Map();
const boundFiles = new Map();
async function collect(p) {
  for (const e of await readdir(resolve(root, p), { withFileTypes: true })) {
    const q = `${p}/${e.name}`;
    if (e.isDirectory()) await collect(q);
    else { const b = await read(q); files.set(q, { path: q, byteLength: b.length, sha256: hash(b) }); }
  }
}
await collect(`${out}/sources`);
function scan(value, canton) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.sha256 === 'string' && (value.path || value.file)) {
    let p = value.path ?? value.file;
    if (!p.startsWith('outputs/')) p = `${out}/sources/${canton}/${p}`;
    assert.ok(files.has(p), `Missing bound evidence: ${p}`);
    assert.equal(files.get(p).sha256, value.sha256, p);
    boundFiles.set(p, files.get(p));
  }
  for (const v of Object.values(value)) scan(v, canton);
}
const cantonCounts = {};
for (const [c, n] of [['ur', 5], ['so', 5], ['sh', 6]]) {
  const j = await json(`docs/fachrecht/ap23g1/befund-${c}.json`);
  assert.equal(j.pathProposals.length, n);
  scan(j, c);
  cantonCounts[c.toUpperCase()] = n;
}
// Do not mutate/review-refresh these accepted data. Compare explicitly specified
// research dates with a tiny independent interpreter for the three rule forms.
const comparisons = [];
for (const [research, id] of [
  ['UR-LSG-CORE', 'ap22-ur-67275ff3e872'],
  ['SO-PROCEDURAL', 'ap22-so-3f5f7b7f54f5'],
  ['SH-VRG-PRACTICE', 'ap22-sh-ec7d0988145a']
]) {
  const p = `data/candidates/2026-10-22-ap23f3/calendars/${id}.json`, b = await read(p), c = JSON.parse(b);
  assert.equal(c.inherits.length, 1);
  assert.equal(c.inherits[0], 'ch-federal-calendar');
  let datesCompared = 0;
  const differences = [];
  for (const year of [2026, 2027]) {
    const expected = holidays(research, year, suite);
    const actual = new Set([`${year}-08-01`]);
    for (const r of c.rules) {
      assert.equal(r.effect.type, 'holiday');
      assert.equal(r.condition, 'always');
      const k = r.calculation;
      let d;
      if (k.type === 'fixedMonthDay') d = `${year}-${String(k.month).padStart(2, '0')}-${String(k.day).padStart(2, '0')}`;
      else if (k.type === 'easterOffsetDays') d = new Date(Date.parse(`${suite.easter[year]}T00:00:00Z`) + k.offsetDays * 86400000).toISOString().slice(0, 10);
      else if (k.type === 'nthWeekdayOfMonth') {
        const weekday = k.isoWeekday % 7;
        assert.ok(weekday >= 0 && weekday <= 6);
        let day = new Date(Date.UTC(year, k.month - 1, 1));
        day.setUTCDate(1 + (weekday - day.getUTCDay() + 7) % 7 + (k.occurrence - 1) * 7);
        d = day.toISOString().slice(0, 10);
      } else throw Error(`Unexpected comparison-only rule form ${k.type}`);
      const validity = r.validity;
      if (d >= validity.from && (!validity.to || d <= validity.to)) actual.add(d);
    }
    for (let t = Date.UTC(year, 0, 1); t < Date.UTC(year + 1, 0, 1); t += 86400000) {
      const d = new Date(t).toISOString().slice(0, 10);
      if (actual.has(d) !== expected.has(d)) differences.push({ date: d, research: expected.has(d), existing: actual.has(d) });
      datesCompared++;
    }
  }
  comparisons.push({ researchCalendar: research, existingCalendar: id, existingBytesSha256: hash(b), datesCompared, differences,
    legalBindingApproved: false, note: research === 'SH-VRG-PRACTICE' ? 'Identical date set does not authorise reusing a ZPO-specific scope for administrative VRG. New practice binding required.' : 'New administrative legal binding required despite identical dates.' });
}
assert.ok(comparisons.every(c => c.differences.length === 0), JSON.stringify(comparisons));
const soZpo = files.get(`${out}/sources/so/zpo-20260701.xml`);
const shZpo = files.get(`${out}/sources/sh/ZPO-20260701.xml`);
assert.equal(soZpo.sha256, 'e306d06a12260096787195c15d1d6ae8910fc4f567e3a90fa38d5892b3cacc12');
assert.equal(shZpo.sha256, soZpo.sha256);
const report = {
  workPackage: 'AP23G1', asOf: '2026-10-22', status: 'research-evidence-and-calendar-comparison-passed',
  cantonGroups: cantonCounts, originalFilesInventoried: files.size, explicitEvidenceBindingsVerified: boundFiles.size,
  fileInventory: [...files.values()].sort((a, b) => a.path.localeCompare(b.path)),
  explicitEvidenceBindings: [...boundFiles.keys()].sort(), calendarComparisons: comparisons,
  officialZpoCopiesIdentical: true, productCodeChanged: false, existingCalendarBytesChanged: false,
  legalApproval: false, operationalApproval: false
};
if (process.argv.includes('--write')) await writeFile(resolve(root, out, 'evidence-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, fileInventory: undefined, explicitEvidenceBindings: undefined }, null, 2));
