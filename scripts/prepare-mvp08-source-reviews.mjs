// SPDX-License-Identifier: AGPL-3.0-only
// R08-B only. Exact, append-only source governance. No Git or remote actions.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readRegular, writeExclusive, verifySourceApproval } from './record-mvp08-source-approval.mjs';
import { root, prefix, hash, encode } from './consolidate-mvp08-sources.mjs';
import { requireR08BApproval } from './record-r08b-execution-approval.mjs';

export { root, prefix, hash, encode, readRegular, writeExclusive };
export const releaseId = '2026-10-15-mvp-08-approved.1';
export const eventId = '2026-10-15-mvp-08-prerelease.1';
export const candidateRoot = 'outputs/ap23d2-candidate-2026-10-15/bundle';
export const candidateHash = 'ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d';
export const sourceApprovalPath = `${prefix}/source-approval.json`;
export const sourceApprovalHash = '53a7f9e8b304c2552e89dc6fa4787b178170bde31aaf55100f5aed55cd995026';
export const authorityPath = `${prefix}/r08b-execution-approval.json`;
export const decisionPath = 'docs/betrieb/freigabe-r08-b.md';
export const registerPath = 'data/source-reviews/source-register.json';
export const indexPath = 'data/source-reviews/index.json';
export const eventPath = `data/source-reviews/events/${eventId}.json`;
export const bridgePath = `${prefix}/source-version-bridges.json`;
export const adoptionPath = `${prefix}/source-governance-adoption.json`;
export const baselineRoot = `${prefix}/governance-inputs`;
export const suitePath = `${prefix}/administrative-reference-suite.json`;
export const sourceReviewRef = { reviewId: 'MVP08-SOURCE-APPROVAL-20261015', sha256: sourceApprovalHash };
export const adminSourceReviewRef = { id: 'mvp08-source-approval-20261015', sha256: sourceApprovalHash };
const reportPath = `${prefix}/source-review-completeness.json`;
const inventoryPath = `${prefix}/sources/source-inventory.json`;
const originalHashes = {
  [registerPath]: '4da56b5c2e6b02730a33e4eb74d2c0f1c6aa52188ff1bfe649204b58a4e4eb20',
  [indexPath]: '8ffa79680dd02c29e10cedf81ca7b833e897d8b3c8274d7b0a8e6ee30fce797d'
};
const unique = values => [...new Set(values.filter(Boolean))].sort();
const componentKeys = ['componentId', 'ruleId', 'deadlineDefinitionId', 'filingProfileId', 'regimeId', 'suspensionSetId',
  'bindingId', 'contextRouteId', 'calendarBindingId', 'eligibilityId', 'excludedPathId', 'pathId', 'lawId', 'holidayBindingId', 'suspensionProfileId'];
const sourceTitles = {
  'SRC-AP23B-TI-LPAMM': 'Legge sulla procedura amministrativa del Cantone Ticino (LPAmm)',
  'SRC-AP23B-TI-HOL': 'Legge concernente i giorni festivi ufficiali nel Cantone Ticino',
  'SRC-AP23B-TI-MATERIAL': 'Messaggio 6645 del 23 maggio 2012, revisione della procedura amministrativa',
  'JUD-AP23B-TI-ADVANCE-JUD': 'BGer 2C_422/2019 vom 28. Mai 2019, Kostenvorschuss',
  'JUD-AP23B-TI-PROVISIONAL-JUD': 'Tribunale cantonale amministrativo TI 52.2025.281 vom 13. August 2025',
  'SRC-AP23B-GR-VRG': 'Gesetz über die Verwaltungsrechtspflege des Kantons Graubünden (VRG)',
  'SRC-AP23B-GR-RTG': 'Gesetz über die öffentlichen Ruhetage des Kantons Graubünden',
  'SRC-AP23B-GR-MATERIAL': 'Botschaft der Regierung Graubünden vom 30. Mai 2006 zur Verwaltungsrechtspflege',
  'JUD-AP23B-GR-START-JUD': 'Verwaltungsgericht GR U 16 15 vom 18. Februar 2016',
  'JUD-AP23B-GR-STAGE-JUD': 'Kantonsgericht GR SK2 10 7 vom 3. März 2010, begrenzter historischer Systembeleg',
  'SRC-AP23B-CH-HOL': 'Verordnung über den Bundesfeiertag (Art. 1)'
};
export async function requireAuthority(repository = root) {
  assert.equal(repository, root, 'Execution authority belongs to this repository');
  const source = await verifySourceApproval(repository);
  assert.equal(source.approvalSha256, sourceApprovalHash);
  const authority = await requireR08BApproval();
  assert.equal(authority.sha256, '5efaec306598ee0c9f9ed5ff47c6c3ee3ce21697fc0f089c8abbb4ad4d0e3c66');
  return authority;
}
export function explicitSourceImpacts(inventory, documents) {
  assert.equal(inventory.referenceGraph.length, 2078);
  const impacts = new Map();
  const add = (id, context) => {
    const row = impacts.get(id) ?? { profileIds: [], calendarIds: [], componentIds: [] };
    row.profileIds.push(context.profileId ?? context.entryProfileId);
    row.calendarIds.push(context.calendarId);
    row.componentIds.push(...componentKeys.map(key => context[key]));
    impacts.set(id, row);
  };
  for (const edge of inventory.referenceGraph) add(edge.sourceId, edge);
  function walk(node, inherited = {}) {
    if (Array.isArray(node)) return node.forEach(value => walk(value, inherited));
    if (!node || typeof node !== 'object') return;
    const context = { ...inherited };
    for (const key of ['entryProfileId', 'profileId', 'calendarId', ...componentKeys]) if (typeof node[key] === 'string') context[key] = node[key];
    for (const key of ['sourceRefs', 'normBindings', 'supplementaryLawRefs']) for (const ref of node[key] ?? []) if (ref.sourceId) add(ref.sourceId, context);
    Object.values(node).forEach(value => walk(value, context));
  }
  for (const document of documents) {
    walk(document);
    if (document.dataKind === 'socialProcedureCatalog') for (const eligibility of document.releaseEligibility) {
      const rule = document.federalRules.find(row => row.ruleId === eligibility.ruleRef.ruleId);
      const binding = document.cantonalBindings.find(row => row.bindingId === eligibility.bindingRef.bindingId);
      assert.ok(rule && binding);
      walk({ eligibilityId: eligibility.eligibilityId, ruleId: rule.ruleId, bindingId: binding.bindingId,
        entryProfileId: binding.entryProfileId, sourceRefs: [...rule.sourceRefs, ...binding.sourceRefs] });
    }
  }
  return new Map([...impacts].map(([id, row]) => [id, Object.fromEntries(Object.entries(row).map(([key, values]) => [key, unique(values)]))]));
}
function provisions(check) {
  const values = unique(check.relevantProvisions);
  assert.ok(values.length && values.every(value => typeof value === 'string' && value.length <= 300));
  return values;
}
function newRegisterSource(row, check) {
  assert.equal(row.sourceRecordOccurrences.length, 1);
  const source = row.sourceRecordOccurrences[0].source;
  assert.ok(sourceTitles[row.sourceId]);
  const jurisdiction = row.sourceId.includes('-CH-') || row.sourceId === 'JUD-AP23B-TI-ADVANCE-JUD' ? 'CH' : row.sourceId.includes('-TI-') ? 'TI' : 'GR';
  const official = check.freshEvidence.map(item => item.url).find(url => /^https:\/\/(?:[^/]+\.)?(?:admin\.ch|gr\.ch|gr-lex\.gr\.ch|ti\.ch|bger\.ch)\//.test(url));
  const provisional = row.sourceId === 'JUD-AP23B-TI-PROVISIONAL-JUD';
  assert.ok(official || provisional);
  const date = source.versionDescription.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  assert.ok(date);
  return { sourceId: row.sourceId, usageStatus: 'productive',
    sourceType: row.sourceId === 'SRC-AP23B-CH-HOL' ? 'ordinance' : source.kind === 'judgment' ? 'caseLaw' : source.kind,
    title: sourceTitles[row.sourceId], authority: jurisdiction === 'CH' ? 'Schweizerische Eidgenossenschaft' : `CH-${jurisdiction}`,
    jurisdiction, officialLocator: source.locators + (provisional ? ' Amtlicher Volltext über HTTP www.sentenze.ti.ch, Dokument 140491. HTTPS-Amtstransport nicht nachgewiesen.' : ''),
    officialUrl: official ?? null, retrievalUrl: source.url, documentVersionDate: date,
    subjectAreas: ['deadlineStart', 'deadlineCounting', 'deadlineEnd', 'deadlineSuspension', 'publicHolidays'],
    relevantProvisions: provisions(check) };
}
export function assembleGovernance({ oldRegister, oldIndex, inventory, report, documents, authoritySha256 }) {
  assert.equal(oldRegister.sources.length, 236);
  assert.equal(oldIndex.generatedFrom.eventIds.length, 5);
  assert.equal(inventory.rows.length, 243);
  assert.equal(report.coverage.length, 243);
  const checked = new Map(report.coverage.map(row => [row.sourceId, row]));
  assert.deepEqual([...checked.keys()].sort(), inventory.rows.map(row => row.sourceId).sort());
  const register = structuredClone(oldRegister), known = new Set(register.sources.map(row => row.sourceId));
  const added = inventory.rows.filter(row => !known.has(row.sourceId));
  assert.equal(added.length, 11);
  register.sources.push(...added.map(row => newRegisterSource(row, checked.get(row.sourceId))));
  register.sources.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
  register.scope.productiveReleaseIds.push(releaseId);
  register.scope.jurisdictions = unique(register.sources.map(row => row.jurisdiction));
  for (const old of oldRegister.sources) assert.deepEqual(register.sources.find(row => row.sourceId === old.sourceId), old);
  const impacts = explicitSourceImpacts(inventory, documents);
  const event = { $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-event.schema.json',
    formatVersion: '1.0.0', dataKind: 'sourceReviewEvent', reviewEventId: eventId, recordStatus: 'approved', recordedOn: '2026-10-15',
    trigger: 'preRelease', reviewWindow: { from: '2026-10-15', to: '2026-10-15' }, nextAnnualReviewDue: '2027-11-15',
    comparedReleaseIds: [releaseId], responsibility: { reviewedBy: 'David Steimer', documentedWith: 'Codex', formalFourEyes: false, operatingModel: 'personalUnion' },
    entries: inventory.rows.map(row => {
      const check = checked.get(row.sourceId), references = [];
      for (const [family, bridge] of Object.entries(report.newNormBridges)) if (bridge.existingSourceIds.includes(row.sourceId))
        references.push({ kind: 'riskRecord', id: `MVP08-VERSION-BRIDGE-${family}`, url: null, status: bridge.newIntermediateVersion ? 'open' : 'resolved' });
      for (const bridge of report.retainedVersionBridges) if (bridge.sourceIds.includes(row.sourceId)) references.push({ kind: 'riskRecord', id: bridge.eventId, url: null, status: 'resolved' });
      if (row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026') references.push({ kind: 'riskRecord', id: 'AI-OFFICIAL-LIST-2026-CONFLICT', url: null, status: 'open' });
      if (row.sourceId === 'SRC-AP22-FR-PRAXIS') references.push({ kind: 'riskRecord', id: 'FR-101-2012-89-OFFICIAL-IDENTITY', url: null, status: 'open' });
      if (['SRC-BGG-20260401', 'SRC-VWVG-20220701'].includes(row.sourceId)) references.push({ kind: 'riskRecord', id: 'OF-001', url: null, status: 'open' });
      if (row.sourceId === 'JUD-AP23B-TI-PROVISIONAL-JUD') references.push({ kind: 'riskRecord', id: 'TI-OFFICIAL-HTTP-SOURCE-TRANSPORT', url: null, status: 'open' });
      const suffix = ` Einzelbelege, Originalprüfdaten und Grenzen: ${reportPath}#${row.sourceId}. Zusatzfassungen: ${bridgePath}. Keine Ausweitung der Fallfreigabe.`;
      const finding = check.rationale + suffix;
      assert.ok(finding.length <= 2000, `Oversize finding ${row.sourceId}`);
      assert.ok(check.outcome === 'unchanged' || references.length > 0);
      return { sourceId: row.sourceId, reviewedOn: '2026-10-15', outcome: check.outcome,
        comparisonBasis: 'Durch David Steimer abgenommener R08-A2-Gesamtnachweis. Datum der Zusammenführung, nicht behaupteter erneuter Originalabruf. Historische Fassungen und Artikelprüfungen bleiben im gebundenen Einzelbeleg datiert. Wiederverwendung und Nachweisgrenzen bleiben ausdrücklich bestehen.',
        evidence: { method: check.freshEvidence.length ? 'targetedSubstantiveComparison' : 'consolidatedAcceptedReview', relevantProvisions: provisions(check), finding },
        affected: { resolutionMode: 'explicit', releaseIds: [releaseId], ...(impacts.get(row.sourceId) ?? { profileIds: [], calendarIds: [], componentIds: [] }) },
        followUp: { required: references.length > 0, references } };
    }) };
  const fr = event.entries.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS');
  assert.equal(fr.outcome, 'unclear'); assert.deepEqual(fr.affected.componentIds, []);
  const index = { ...structuredClone(oldIndex), generatedOn: '2026-10-15', generatedFrom: { ...oldIndex.generatedFrom,
    eventIds: [...oldIndex.generatedFrom.eventIds, eventId].sort() }, nextAnnualReviewDue: '2027-11-15',
    sources: [...register.sources].sort((a, b) => a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0).map(source => {
      const entry = event.entries.find(row => row.sourceId === source.sourceId);
      if (!entry) return oldIndex.sources.find(row => row.sourceId === source.sourceId);
      const { resolutionMode: _ignored, ...affected } = entry.affected;
      return { sourceId: source.sourceId, usageStatus: source.usageStatus, jurisdiction: source.jurisdiction,
        subjectAreas: [...source.subjectAreas].sort(), latestReview: { reviewEventId: eventId, recordStatus: 'approved',
          reviewedOn: entry.reviewedOn, outcome: entry.outcome, finding: entry.evidence.finding, followUp: entry.followUp.required }, affected: { ...affected, locators: [] } };
    }) };
  const bridges = { formatVersion: '1.0.0', dataKind: 'sourceVersionBridges', recordedOn: '2026-10-15', releaseId,
    approvalRef: { path: sourceApprovalPath, sha256: sourceApprovalHash }, authorityRef: { path: authorityPath, sha256: authoritySha256 },
    historicalSourceRecordsUnchanged: true, operationalRulesChanged: false, runtimeSourcesAdded: false,
    retainedVersionBridges: report.retainedVersionBridges, newNormBridges: report.newNormBridges,
    counts: report.normChangeCounts, noUnlimitedStabilityProof: true,
    productTemporalLimit: '2027-12-31', consolidatedFederalTextsNotClaimed: true };
  assert.equal(register.sources.length, 247);
  assert.deepEqual(register.sources.reduce((a, row) => ({ ...a, [row.usageStatus]: (a[row.usageStatus] ?? 0) + 1 }), {}),
    { productive: 149, supporting: 85, monitoring: 13 });
  return { register, event, index, bridges, newSourceIds: added.map(row => row.sourceId).sort() };
}
export async function prepareGovernance(repository = root) {
  const authority = await requireAuthority(repository);
  const json = async path => JSON.parse(await readRegular(repository, path));
  const before = new Map();
  for (const [path, sha256] of Object.entries(originalHashes)) {
    const archived = await readRegular(repository, `${baselineRoot}/${path}`, true);
    const bytes = archived ?? await readRegular(repository, path);
    assert.equal(hash(bytes), sha256, `Original governance drift: ${path}`);
    before.set(path, bytes);
  }
  const oldIndex = JSON.parse(before.get(indexPath));
  const proposal = await json(`${prefix}/r08b-proposal.json`);
  for (const id of oldIndex.generatedFrom.eventIds) {
    const path = `data/source-reviews/events/${id}.json`, bytes = await readRegular(repository, path);
    const ref = proposal.protectedInputs.find(row => row.path === path);
    assert.ok(ref); assert.equal(hash(bytes), ref.sha256);
    before.set(path, bytes);
  }
  const inventory = await json(inventoryPath), report = await json(reportPath);
  assert.equal(hash(await readRegular(repository, inventoryPath)), '6d40975ddf0fc334a43ae7444033037ab9809a90763be2461dc21b139d589526');
  assert.equal(hash(await readRegular(repository, reportPath)), 'e0c1012036fe1ddda95ab660d1153b203de19e8a75d9d6245da78d60e4796c66');
  const manifestBytes = await readRegular(repository, `${candidateRoot}/manifest.json`);
  assert.equal(hash(manifestBytes), candidateHash);
  const manifest = JSON.parse(manifestBytes), documents = [];
  for (const item of manifest.artifacts) {
    const bytes = await readRegular(repository, `${candidateRoot}/${item.path}`);
    assert.equal(hash(bytes), item.sha256); assert.equal(bytes.length, item.byteLength);
    documents.push(JSON.parse(bytes));
  }
  return { ...assembleGovernance({ oldRegister: JSON.parse(before.get(registerPath)), oldIndex, inventory, report, documents, authoritySha256: authority.sha256 }), before, authority };
}
export async function adoptionReceipt(prepared, repository = root) {
  const paths = [sourceApprovalPath, authorityPath, reportPath, inventoryPath, bridgePath, registerPath, eventPath, indexPath,
    ...[...prepared.before.keys()].map(path => `${baselineRoot}/${path}`)];
  const evidence = [];
  for (const path of paths) { const bytes = await readRegular(repository, path); evidence.push({ path, sha256: hash(bytes), byteLength: bytes.length }); }
  return { formatVersion: '1.0.0', dataKind: 'sourceGovernanceAdoption', adoptedOn: '2026-10-15', releaseId,
    sourceReviewRef: { ...sourceReviewRef, path: sourceApprovalPath }, authorityRef: { path: authorityPath, sha256: prepared.authority.sha256 },
    counts: { previouslyRegistered: 236, added: 11, registered: 247, retainedHistoricalExtraRows: 4, newEventEntries: 243,
      totalEvents: 6, referenceGraphEdges: 2078, newAdministrativeEdges: 58, freshlyEvidenced: 171, reusedWithoutFreshEvidence: 72,
      newlyPublishedActs: 5, affectedLawFamilies: 8, newIntermediateVersions: 5, changedUsedRules: 0 },
    newSourceIds: prepared.newSourceIds, historicalEventsUnchanged: true, previousRegisterRowsUnchanged: true,
    explicitImpactsIncludeAdministrativePaths: true, evidenceOnlySourcesNotActivated: true, aiTreatmentUnchanged: true,
    historicalFrMirrorOnly: true, installationAuthorized: false, publicationAuthorized: false, operatingApproval: false, evidence };
}
export async function verifyGovernance(repository = root) {
  const prepared = await prepareGovernance(repository);
  for (const [path, value] of [[registerPath, prepared.register], [eventPath, prepared.event], [indexPath, prepared.index], [bridgePath, prepared.bridges]])
    assert.deepEqual(JSON.parse(await readRegular(repository, path)), value, `Governance changed: ${path}`);
  for (const [path, bytes] of prepared.before) if (path.includes('/events/')) assert.deepEqual(await readRegular(repository, path), bytes);
  const receipt = await adoptionReceipt(prepared, repository);
  assert.deepEqual(JSON.parse(await readRegular(repository, adoptionPath)), receipt);
  return receipt;
}
export async function adoptGovernance(repository = root) {
  const prepared = await prepareGovernance(repository);
  // Independently check the existing public schemas before the first mutation.
  const schemaCheck = `import json,sys\nsys.path.insert(0,'tests/governance')\nfrom validate_source_reviews import load_schemas,schema_errors\nschemas,registry=load_schemas()\nvalues=json.load(sys.stdin)\nerrors=[]\nfor name,value in values.items(): errors.extend(schema_errors(value,schemas[name],registry,name))\nassert not errors, '\\n'.join(errors)\nprint('Three governance schemas passed')\n`;
  execFileSync(resolve(repository, '.venv/bin/python'), ['-c', schemaCheck], { cwd: repository,
    input: JSON.stringify({ 'source-register.schema.json': prepared.register, 'source-review-event.schema.json': prepared.event, 'source-review-index.schema.json': prepared.index }), stdio: ['pipe', 'inherit', 'inherit'] });
  for (const [path, value] of [[registerPath, prepared.register], [indexPath, prepared.index]]) {
    const current = await readRegular(repository, path);
    assert.ok(current.equals(prepared.before.get(path)) || current.equals(encode(value)), `Unexpected living file: ${path}`);
  }
  for (const [path, bytes] of prepared.before) await writeExclusive(repository, `${baselineRoot}/${path}`, bytes);
  await writeExclusive(repository, bridgePath, encode(prepared.bridges));
  await writeExclusive(repository, eventPath, encode(prepared.event));
  await writeFile(resolve(repository, registerPath), encode(prepared.register));
  // Existing renderer uses explicit affected lists, so no pending target-release lookup.
  execFileSync(process.execPath, [resolve(repository, 'scripts/build-source-review-index.mjs')], { cwd: repository, stdio: 'inherit' });
  assert.deepEqual(JSON.parse(await readRegular(repository, indexPath)), prepared.index);
  await writeExclusive(repository, adoptionPath, encode(await adoptionReceipt(prepared, repository)));
  return verifyGovernance(repository);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(await (process.argv[2] === '--write' ? adoptGovernance() : verifyGovernance()), null, 2));
}
