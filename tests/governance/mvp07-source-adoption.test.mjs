// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { root, hash, approvalPath } from '../../scripts/record-mvp07-source-approval.mjs';
import { prepareMvp07Governance, assembleMvp07Governance, verifyMvp07Governance, expectedMvp07Index, officialHosts, eventPath, versionBridgePath,
  registerPath, indexPath, adoptionPath } from '../../scripts/adopt-mvp07-source-governance.mjs';
const prepared = await prepareMvp07Governance();
const fixture = () => structuredClone(prepared.input);
const json = async path => JSON.parse(await readFile(resolve(root, path)));

test('R07-B governance deterministically covers 232 refs and preserves 81 original rows', async () => {
  assert.deepEqual(await prepareMvp07Governance(), prepared);
  assert.equal(prepared.register.sources.length, 236);
  assert.equal(prepared.newSourceIds.length, 155);
  assert.equal(prepared.event.entries.length, 232);
  assert.equal(prepared.historicalEvents.size, 4);
  assert.equal(prepared.register.sources.filter(row => !prepared.event.entries.some(entry => entry.sourceId === row.sourceId)).length, 4);
  for (const row of prepared.input.oldRegister.sources) assert.deepEqual(prepared.register.sources.find(item => item.sourceId === row.sourceId), row);
});
test('AI and historical FR mirror remain unclear without a positive FR grant', () => {
  const ai = prepared.event.entries.find(row => row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026');
  const fr = prepared.event.entries.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS');
  for (const item of [ai, fr]) { assert.equal(item.outcome, 'unclear'); assert.equal(item.followUp.required, true); }
  assert.deepEqual(fr.affected.profileIds, []);
  assert.deepEqual(fr.affected.calendarIds, []);
  assert.deepEqual(fr.affected.componentIds, []);
  const source = prepared.register.sources.find(row => row.sourceId === fr.sourceId);
  assert.equal(source.usageStatus, 'supporting'); assert.equal(source.officialUrl, null);
  assert.equal(source.jurisdiction, 'FR'); assert.equal(source.sourceType, 'caseLaw');
  assert.ok(!officialHosts.has('entscheidsuche.ch'));
  assert.ok(!officialHosts.has('www.lexfind.ch'));
});
test('two version events retain old source dates and separate future StPO/current LU', () => {
  assert.equal(prepared.bridges.bridges.length, 2);
  const [stpo, lu] = prepared.bridges.bridges;
  assert.deepEqual(stpo.previousVersion, { from: '2025-04-01', to: '2026-12-31' });
  assert.equal(stpo.followingVersion.statusAtReview, 'publishedFuture');
  assert.equal(stpo.followingVersion.from, '2027-01-01');
  assert.equal(lu.previousVersion.versionId, '3569');
  assert.equal(lu.followingVersion.versionId, '4916');
  assert.equal(prepared.register.sources.find(row => row.sourceId === 'SRC-LU-RLG-855-20200501').documentVersionDate, '2020-05-01');
  assert.equal(prepared.register.sources.find(row => row.sourceId === 'SRC-AP22CLOSE-BUND-STPO').documentVersionDate, '2025-04-01');
  assert.ok(prepared.bridges.bridges.every(row => row.modelImpact === 'unchanged' && !row.ruleChangeRequired));
});
test('reuse does not become a fresh-original claim and metadata repairs stay scoped', () => {
  const reused = prepared.event.entries.filter(row => row.evidence.method === 'consolidatedAcceptedReview');
  assert.equal(reused.length, 28);
  assert.ok(reused.every(row => row.evidence.finding.includes('kein frischer Originalabruf')));
  for (const row of prepared.input.inventory.rows) if (row.ap22Documentation?.versionOn === 'Siehe Fundstelle') {
    assert.match(prepared.register.sources.find(source => source.sourceId === row.sourceId).documentVersionDate, /^\d{4}-\d{2}-\d{2}$/);
  }
  for (const id of ['SRC-AP22CLOSE-PROC-STPO-LIMIT', 'SRC-AP22CLOSE-PROC-VD-BGG']) {
    const source = prepared.register.sources.find(row => row.sourceId === id);
    assert.ok(source.officialUrl.startsWith('https://www.bger.ch/'));
    assert.ok(source.retrievalUrl.startsWith('https://'));
  }
  assert.equal(prepared.register.sources.find(row => row.sourceId === 'SRC-BUNDESFEIERTAG-19940701').sourceType, 'ordinance');
});
test('impact includes activation-only sources and complete social binding/eligibility context', () => {
  const stpo = prepared.event.entries.find(row => row.sourceId === 'SRC-AP22-STPO').affected;
  assert.ok(stpo.componentIds.some(id => id.startsWith('AP22-BIND-')));
  const uelg = prepared.event.entries.find(row => row.sourceId === 'SRC-AP20C3-UELG-20250101').affected;
  for (const id of ['CH-SOC-UELG-OBJ', 'BE-SOC-UELG-ADMIN-OBJ', 'AP20C3-BE-SOC-UELG-ADMIN-OBJ']) assert.ok(uelg.componentIds.includes(id));
  assert.deepEqual(uelg.profileIds, ['vrpg-be']);
  const negative = prepared.input.inventory.rows.filter(row => row.directReferenceUse === 'exclusion-only');
  assert.equal(negative.length, 4);
  for (const row of negative) assert.match(prepared.event.entries.find(entry => entry.sourceId === row.sourceId).evidence.finding, /keine positive operative Aktivierung/);
});
test('new records conform to unchanged register/event schema contracts', () => {
  const result = execFileSync(resolve(root, '.venv/bin/python'), ['-c',
    'import sys,json,importlib.util; from pathlib import Path; p=Path("tests/governance/validate_source_reviews.py"); s=importlib.util.spec_from_file_location("v",p); v=importlib.util.module_from_spec(s); s.loader.exec_module(v); schemas,reg=v.load_schemas(); data=json.load(sys.stdin); errors=v.schema_errors(data["register"],schemas["source-register.schema.json"],reg,"register")+v.schema_errors(data["event"],schemas["source-review-event.schema.json"],reg,"event"); print(json.dumps(errors)); sys.exit(bool(errors))'],
    { cwd: root, input: JSON.stringify({ register: prepared.register, event: prepared.event }), encoding: 'utf8' });
  assert.deepEqual(JSON.parse(result), []);
});
test('reject incomplete/duplicate coverage, false authority and premature reuse of current baseline', () => {
  const f = fixture(); f.review.coverage.pop(); assert.throws(() => assembleMvp07Governance(f));
  const g = fixture(); g.inventory.rows[0] = g.inventory.rows[1]; assert.throws(() => assembleMvp07Governance(g));
  const h = fixture(); h.approval.permissions.sourceReviewApproved = false; assert.throws(() => assembleMvp07Governance(h));
  const j = fixture(); j.oldRegister = prepared.register; assert.throws(() => assembleMvp07Governance(j));
});
test('reject an invented clear/positive FR source and unexplained changed outcome', () => {
  const f = fixture(); f.review.coverage.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS').outcome = 'unchanged';
  assert.throws(() => assembleMvp07Governance(f));
  const g = fixture(); g.review.coverage.find(row => row.sourceId === 'SRC-AG-EGARR-20250901').outcome = 'changed';
  assert.throws(() => assembleMvp07Governance(g), /Untracked/);
});
test('adopted live outputs reproduce exact immutable receipt without broadening authority', async () => {
  const record = await json(adoptionPath);
  for (const item of record.evidence) {
    const bytes = await readFile(resolve(root, item.path));
    assert.equal(hash(bytes), item.sha256, item.path); assert.equal(bytes.length, item.byteLength);
  }
  assert.deepEqual(await json(registerPath), prepared.register);
  assert.deepEqual(await json(eventPath), prepared.event);
  assert.deepEqual(await json(versionBridgePath), prepared.bridges);
  assert.equal((await json(indexPath)).sources.length, 236);
  assert.deepEqual(await json(indexPath), expectedMvp07Index(prepared));
  assert.deepEqual(await verifyMvp07Governance(), record);
  for (const flag of ['installationAuthorized', 'publicationAuthorized', 'hostingChangesAuthorized', 'operatingApproval']) assert.equal(record[flag], false);
  assert.equal(hash(await readFile(resolve(root, approvalPath))), '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810');
});
