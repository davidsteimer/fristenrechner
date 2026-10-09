// SPDX-License-Identifier: AGPL-3.0-only
// R07-B: append-only adoption of the actual source decision. No deployment.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { root, prefix, hash, approvalPath, reportPath, verifyMvp07SourceApproval } from './record-mvp07-source-approval.mjs';
import { requireLocalBuildApproval } from './record-mvp07-local-build-approval.mjs';

export const releaseId = '2026-10-08-mvp-07-approved.1';
export const eventId = '2026-10-08-mvp-07-prerelease.1';
export const registerPath = 'data/source-reviews/source-register.json';
export const indexPath = 'data/source-reviews/index.json';
export const eventPath = `data/source-reviews/events/${eventId}.json`;
export const adoptionPath = `${prefix}/source-governance-adoption.json`;
export const versionBridgePath = `${prefix}/source-version-bridges.json`;
export const baselineRoot = `${prefix}/inputs/files`;
export const inventoryPath = `${prefix}/sources/source-inventory.json`;
export const oldRegisterHash = '1a2c61816d1c86c7731b6c06f2ae13970b28743644ad5f28672f326b45bd02d1';
export const oldIndexHash = '42d314b03a9ebbeece198359af283c1885f540156a6cfeb26783be42d6f4db63';
export const officialHosts = new Set([
  'fedlex.admin.ch', 'www.fedlex.admin.ch', 'fedlex.data.admin.ch', 'bj.admin.ch', 'www.bj.admin.ch',
  'belex.sites.be.ch', 'www.belex.sites.be.ch', 'rrgr-service.apps.be.ch', 'www.rrgr-service.apps.be.ch',
  'search.bger.ch', 'bger.ch', 'www.bger.ch', 'ai.ch', 'ai.clex.ch', 'ar.clex.ch', 'bdlf.fr.ch',
  'bgs.so.ch', 'bgs.zg.ch', 'bl-api.webcloud7.ch', 'bl.clex.ch', 'gdb.ow.ch', 'gesetze.gl.ch',
  'gesetze.nw.ch', 'gesetzessammlungen.ag.ch', 'lex.vs.ch', 'm3.ti.ch', 'prestations.vd.ch',
  'publikationen.sg.ch', 'rechtsbuch.sh.ch', 'rechtsbuch.ur.ch', 'rsju.jura.ch', 'rsn.ne.ch',
  'sh.ch', 'silgeneve.ch', 'so.ch', 'srl.lu.ch', 'www.ag.ch', 'www.bk.admin.ch', 'www.bs.ch',
  'www.estv.admin.ch', 'www.fr.ch', 'www.ge.ch', 'www.gesetzessammlung.bs.ch',
  'www.gesetzessammlung.sg.ch', 'www.gl.ch', 'www.gr-lex.gr.ch', 'www.gr.ch', 'www.jura.ch',
  'www.ne.ch', 'www.notes.zh.ch', 'www.parlament.ch', 'www.rechtsbuch.tg.ch',
  'www.swisstopo.admin.ch', 'www.sz.ch', 'www.ur.ch', 'www.vd.ch', 'www.zh.ch',
  'www3.ti.ch', 'www4.ti.ch', 'zg.ch', 'bstger.weblaw.ch', 'www.bstger.ch',
  'bvger.weblaw.ch', 'www.bvger.ch'
]);
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const unique = values => [...new Set(values.filter(Boolean))].sort();
const isoDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
const isOfficial = url => typeof url === 'string' && url.startsWith('https://') && officialHosts.has(new URL(url).hostname);
const counties = 'AG AI AR BE BL BS FR GE GL GR JU LU NE NW OW SG SH SO SZ TG TI UR VD VS ZG ZH'.split(' ');
const identifiers = ['ruleId', 'deadlineDefinitionId', 'filingProfileId', 'regimeId', 'suspensionSetId',
  'bindingId', 'contextRouteId', 'calendarBindingId', 'eligibilityId', 'excludedPathId'];

function sourceJurisdiction(row) {
  const recorded = row.ap22Documentation?.jurisdiction ?? row.sourceRecord?.authority;
  if (/^(CH-)?[A-Z]{2}$/.test(recorded ?? '')) return recorded.replace(/^CH-/, '');
  if (/^(?:BGer|BGE|BVGer|BStGer|Europäisches)/.test(row.title)) return 'CH';
  const code = row.sourceId.match(/^SRC-(?:AP22CLOSE-(?:PROC-)?|AP22-)?([A-Z]{2})-/)?.[1];
  if (counties.includes(code)) return code;
  return 'CH';
}
function sourceType(row) {
  if (row.sourceRecord) return row.sourceRecord.sourceType;
  if (/BGer|BGE |BVGer|BStGer|^TC |Kantonsgericht|Verwaltungsgericht|Obergericht/.test(row.title)) return 'caseLaw';
  if (/^BBl /.test(row.title)) return 'officialMaterials';
  if (/Verordnung|Règlement|Reglement|Arrêté/.test(row.title)) return 'ordinance';
  if (/Gesetz|gesetz|Loi |Legge |Lescha |BGG|StPO|ZPO|VwVG|EuFr|Übereinkommen|GOG/.test(row.title)) return 'statute';
  return 'officialDossier';
}
function provisions(row, check) {
  const result = unique([...(Array.isArray(check.relevantProvisions) ? check.relevantProvisions : [check.relevantProvisions]),
    row.ap22Documentation?.locator]);
  assert.ok(result.length && result.every(value => value.length <= 300), `Unbounded provisions: ${row.sourceId}`);
  return result;
}
function recordFor(row, check) {
  const historical = row.sourceRecord, documentation = row.ap22Documentation;
  const jurisdiction = sourceJurisdiction(row);
  const officialUrl = row.sourceId === 'SRC-AP22-FR-PRAXIS' ? null
    : [...row.urls, ...(check.freshEvidence ?? []).map(item => item.url)].find(isOfficial);
  assert.ok(officialUrl || row.sourceId === 'SRC-AP22-FR-PRAXIS', `No confirmed official URL: ${row.sourceId}`);
  const retrievalUrl = historical?.url?.startsWith('https://') ? historical.url
    : row.urls.find(url => url.startsWith('https://')) ?? officialUrl;
  const recordedDate = historical?.documentVersionDate ?? documentation?.versionOn;
  const documentVersionDate = isoDate(recordedDate) ? recordedDate
    : isoDate(check.versionFinding?.resolvedVersion) ? check.versionFinding.resolvedVersion : null;
  return { sourceId: row.sourceId,
    usageStatus: row.directReferenceUse === 'positive-or-shared-reference' ? 'productive'
      : documentVersionDate > '2026-10-08' ? 'monitoring' : 'supporting',
    sourceType: sourceType(row), title: historical?.title ?? row.title,
    authority: historical?.authority ?? (jurisdiction === 'CH' ? 'Schweizerische Eidgenossenschaft' : `CH-${jurisdiction}`),
    jurisdiction, officialLocator: documentation?.locator || row.title,
    officialUrl, retrievalUrl, documentVersionDate,
    subjectAreas: ['publicHolidays', 'deadlineEnd'], relevantProvisions: provisions(row, check) };
}

// The accepted graph includes activation sourceIds/evidenceId edges missing from the old generic walker.
// Supplement it with all inherited component identifiers and the unchanged social eligibility joins.
export function sourceImpacts(inventory, documents) {
  const impacts = new Map();
  const add = (id, context) => {
    const record = impacts.get(id) ?? { profileIds: [], calendarIds: [], componentIds: [] };
    record.profileIds.push(context.profileId); record.calendarIds.push(context.calendarId);
    record.componentIds.push(context.componentId, ...identifiers.map(key => context[key]));
    impacts.set(id, record);
  };
  for (const edge of inventory.referenceGraph) add(edge.sourceId, edge);
  function walk(node, inherited = {}) {
    if (Array.isArray(node)) return node.forEach(child => walk(child, inherited));
    if (!node || typeof node !== 'object') return;
    const context = { ...inherited };
    if (node.entryProfileId) context.profileId = node.entryProfileId;
    for (const key of ['profileId', 'calendarId', ...identifiers]) if (typeof node[key] === 'string') context[key] = node[key];
    for (const key of ['sourceRefs', 'normBindings', 'supplementaryLawRefs']) for (const ref of node[key] ?? []) add(ref.sourceId, context);
    for (const value of Object.values(node)) walk(value, context);
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
  return new Map([...impacts].map(([id, entry]) => [id, Object.fromEntries(Object.entries(entry).map(([key, values]) => [key, unique(values)]))]));
}

export function assembleMvp07Governance({ oldRegister, inventory, review, approval, documents }) {
  assert.equal(oldRegister.sources.length, 81);
  assert.equal(oldRegister.registerStatus, 'approved');
  assert.ok(!oldRegister.scope.productiveReleaseIds.includes(releaseId));
  assert.equal(approval.approvalId, '2026-10-08-mvp-07-source-approval.1');
  assert.equal(approval.permissions.sourceReviewApproved, true);
  assert.equal(review.coverage.length, 232);
  assert.equal(inventory.rows.length, 232);
  assert.equal(new Set(inventory.rows.map(row => row.sourceId)).size, 232);
  assert.deepEqual(review.coverage.map(row => row.sourceId).sort(), inventory.rows.map(row => row.sourceId).sort());
  const impacts = sourceImpacts(inventory, documents);
  const byId = new Map(review.coverage.map(row => [row.sourceId, row]));
  const register = structuredClone(oldRegister), oldIds = new Set(register.sources.map(row => row.sourceId));
  const newRows = inventory.rows.filter(row => !oldIds.has(row.sourceId));
  assert.equal(newRows.length, 155);
  register.sources.push(...newRows.map(row => recordFor(row, byId.get(row.sourceId))));
  register.sources.sort((a, b) => a.sourceId.localeCompare(b.sourceId, 'en'));
  register.scope.jurisdictions = unique(register.sources.map(row => row.jurisdiction));
  register.scope.productiveReleaseIds.push(releaseId);
  assert.equal(register.sources.length, 236);
  assert.equal(register.sources.find(row => row.sourceId === 'SRC-BUNDESFEIERTAG-19940701').sourceType, 'ordinance');
  for (const original of oldRegister.sources) assert.deepEqual(register.sources.find(row => row.sourceId === original.sourceId), original);
  const event = { $schema: 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-event.schema.json',
    formatVersion: '1.0.0', dataKind: 'sourceReviewEvent', reviewEventId: eventId,
    recordStatus: 'approved', recordedOn: '2026-10-08', trigger: 'preRelease',
    reviewWindow: { from: '2026-10-08', to: '2026-10-08' }, nextAnnualReviewDue: '2027-11-15',
    comparedReleaseIds: [releaseId], responsibility: { reviewedBy: 'David Steimer', documentedWith: 'Codex', formalFourEyes: false, operatingModel: 'personalUnion' },
    entries: inventory.rows.map(row => {
      const check = byId.get(row.sourceId), versionChange = review.legalChangeEvents.find(item => item.sourceIds.includes(row.sourceId));
      const references = [];
      if (versionChange) references.push({ kind: 'riskRecord', id: versionChange.eventId, url: null, status: 'resolved' });
      if (row.sourceId === 'SRC-AI-RUHETAGE-LISTE-2026') references.push({ kind: 'riskRecord', id: 'AI-OFFICIAL-LIST-2026-CONFLICT', url: null, status: 'open' });
      if (row.sourceId === 'SRC-AP22-FR-PRAXIS') references.push({ kind: 'riskRecord', id: 'FR-101-2012-89-OFFICIAL-IDENTITY', url: null, status: 'open' });
      if (['SRC-BGG-20260401', 'SRC-VWVG-20220701'].includes(row.sourceId)) references.push({ kind: 'riskRecord', id: 'OF-001', url: null, status: 'open' });
      let finding = check.rationale;
      if (versionChange) finding += ` Fassungsbrücke ${versionChange.eventId}: ${versionBridgePath}. Verwendete Rechenregeln unverändert, keine Umdeutung der historischen Source-ID.`;
      if (row.directReferenceUse === 'exclusion-only') finding += ' Ausschliesslich Ausschlussnachweis, keine positive operative Aktivierung.';
      if (!row.positiveOrSharedEdges) finding += ' Keine eigenständige positive Fallfreigabe.';
      if (!(check.freshEvidence ?? []).length) finding += ' Ausschliesslich bezeichnete ältere Nachweise wiederverwendet, kein frischer Originalabruf behauptet.';
      finding += ` Vollständige Einzelbelege und Wiederverwendungsgrenzen: ${reportPath}#${row.sourceId}.`;
      assert.ok(typeof finding === 'string' && finding.length <= 2000, `Unbounded finding: ${row.sourceId}`);
      assert.ok(check.outcome === 'unchanged' || references.length > 0, `Untracked non-unchanged source: ${row.sourceId}`);
      const affected = impacts.get(row.sourceId) ?? { profileIds: [], calendarIds: [], componentIds: [] };
      return { sourceId: row.sourceId, reviewedOn: '2026-10-08', outcome: check.outcome,
        comparisonBasis: `Abgenommene zusammengeführte Quellenprüfung MVP 0.7, ${approval.approvalId}. Prüfdatum ist das Datum dieser Zusammenführung. Historische Fassungsdaten, Originalprüfungen und ausdrückliche Wiederverwendung bleiben im Einzelbeleg getrennt. Keine pauschale neue amtliche Bestätigung.`,
        evidence: { method: (check.freshEvidence ?? []).length ? 'targetedSubstantiveComparison' : 'consolidatedAcceptedReview',
          relevantProvisions: provisions(row, check), finding },
        affected: { resolutionMode: 'explicit', releaseIds: [releaseId], ...affected },
        followUp: { required: references.length > 0, references } };
    }) };
  const fr = event.entries.find(row => row.sourceId === 'SRC-AP22-FR-PRAXIS');
  assert.equal(fr.outcome, 'unclear'); assert.deepEqual(fr.affected.componentIds, []);
  assert.equal(register.sources.find(row => row.sourceId === fr.sourceId).usageStatus, 'supporting');
  return { register, event, newSourceIds: newRows.map(row => row.sourceId).sort() };
}

export async function prepareMvp07Governance(repository = root) {
  const authority = await requireLocalBuildApproval(repository);
  const read = path => readFile(resolve(repository, path)), json = async path => JSON.parse(await read(path));
  const oldRegisterBytes = await read(`${baselineRoot}/${registerPath}`), oldIndexBytes = await read(`${baselineRoot}/${indexPath}`);
  assert.equal(hash(oldRegisterBytes), oldRegisterHash); assert.equal(hash(oldIndexBytes), oldIndexHash);
  const approvalBytes = await read(approvalPath), reviewBytes = await read(reportPath), inventoryBytes = await read(inventoryPath);
  assert.equal(hash(approvalBytes), '478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810');
  assert.equal(hash(reviewBytes), 'ce9122d5e6a5c3bf8c0fb8061e51e6e1613fbb04f34d65825eeea7a59796f587');
  assert.equal(hash(inventoryBytes), '4bb394c9b1cccdc50ccae896925a5b64b3a6274fba0fb0b81a35b0ddca7e9c82');
  const manifest = await json('outputs/ap22c3-2026-10-08/bundle/manifest.json'), documents = [];
  for (const descriptor of manifest.artifacts) {
    const bytes = await read(`outputs/ap22c3-2026-10-08/bundle/${descriptor.path}`);
    assert.equal(hash(bytes), descriptor.sha256); assert.equal(bytes.length, descriptor.byteLength);
    documents.push(JSON.parse(bytes));
  }
  const input = { oldRegister: JSON.parse(oldRegisterBytes), inventory: JSON.parse(inventoryBytes), review: JSON.parse(reviewBytes), approval: JSON.parse(approvalBytes), documents };
  const historicalEvents = new Map();
  for (const id of JSON.parse(oldIndexBytes).generatedFrom.eventIds) {
    const path = `data/source-reviews/events/${id}.json`, original = await read(`${baselineRoot}/${path}`);
    assert.ok(original.equals(await read(path)), `Historical event changed: ${id}`);
    historicalEvents.set(path, original);
  }
  const bridges = { formatVersion: '1.0.0', dataKind: 'sourceVersionBridges', recordedOn: '2026-10-08',
    releaseId, approvalRef: { path: approvalPath, sha256: hash(approvalBytes) },
    authorityRef: { path: `${prefix}/local-build-approval.json`, sha256: authority.sha256 },
    historicalSourceRecordsUnchanged: true, operationalRulesChanged: false,
    bridges: input.review.legalChangeEvents.map(change => ({ ...change,
      previousVersion: change.eventId === 'STPO-AS-2026-509'
        ? { from: '2025-04-01', to: '2026-12-31' } : { versionId: '3569', from: '2020-05-01', to: '2026-09-26' },
      followingVersion: change.eventId === 'STPO-AS-2026-509'
        ? { from: '2027-01-01', statusAtReview: 'publishedFuture', changePublication: 'AS 2026 509' }
        : { versionId: '4916', from: '2026-09-27', statusAtReview: 'current',
          title: 'Gesetz über die Ruhetage und die Öffnungs- und Schliessungszeiten der Verkaufsgeschäfte' },
      equalUsedProvisions: change.eventId === 'STPO-AS-2026-509' ? ['Art. 85', 'Art. 89', 'Art. 90', 'Art. 91', 'Art. 92'] : ['§ 1a Abs. 1–3', '§ 2'],
      noUnlimitedStabilityProof: true })) };
  return { ...assembleMvp07Governance(input), input, bridges, oldRegisterBytes, oldIndexBytes, historicalEvents };
}

export function expectedMvp07Index(prepared) {
  const oldIndex = JSON.parse(prepared.oldIndexBytes);
  return { ...oldIndex, generatedOn: '2026-10-08', generatedFrom: { ...oldIndex.generatedFrom,
    eventIds: [...oldIndex.generatedFrom.eventIds, eventId].sort() }, nextAnnualReviewDue: '2027-11-15',
    sources: [...prepared.register.sources].sort((a, b) => a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0).map(source => {
      const entry = prepared.event.entries.find(item => item.sourceId === source.sourceId);
      if (!entry) return oldIndex.sources.find(item => item.sourceId === source.sourceId);
      const { resolutionMode: _mode, ...affected } = entry.affected;
      return { sourceId: source.sourceId, usageStatus: source.usageStatus, jurisdiction: source.jurisdiction,
        subjectAreas: [...source.subjectAreas].sort(), latestReview: { reviewEventId: eventId,
          recordStatus: 'approved', reviewedOn: entry.reviewedOn, outcome: entry.outcome,
          finding: entry.evidence.finding, followUp: entry.followUp.required },
        affected: { ...affected, locators: [] } };
    }) };
}

async function appendOnly(repository, path, value) {
  const bytes = encode(value), target = resolve(repository, path);
  await mkdir(dirname(target), { recursive: true });
  try { await writeFile(target, bytes, { flag: 'wx' }); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  assert.ok((await readFile(target)).equals(bytes), `Refusing changed immutable governance proof: ${path}`);
}
async function adoptionRecord(prepared, repository) {
  const read = path => readFile(resolve(repository, path));
  const evidence = [];
  for (const path of [approvalPath, `${prefix}/local-build-approval.json`, reportPath, inventoryPath,
    `${baselineRoot}/${registerPath}`, `${baselineRoot}/${indexPath}`, registerPath, eventPath, indexPath,
    versionBridgePath, ...prepared.historicalEvents.keys()]) {
    const bytes = await read(path); evidence.push({ path, sha256: hash(bytes), byteLength: bytes.length });
  }
  return { formatVersion: '1.0.0', dataKind: 'sourceGovernanceAdoption', adoptedOn: '2026-10-08', releaseId,
    sourceReviewRef: { reviewId: 'MVP07-SOURCE-APPROVAL-20261008', approvalId: prepared.input.approval.approvalId,
      path: approvalPath, sha256: hash(await read(approvalPath)) },
    counts: { previouslyRegistered: 81, added: 155, registered: 236, retainedHistoricalExtraRows: 4,
      newEventEntries: 232, totalEvents: 5, freshlyEvidenced: 204, reusedWithoutFreshEvidence: 28,
      distinctVersionChanges: 2, changedReferenceOutcomes: 3, unclearReferenceOutcomes: 2 },
    newSourceIds: prepared.newSourceIds, historicalEventsUnchanged: true, previousRegisterRowsUnchanged: true,
    metadataPolicy: 'Existing source identities, version dates and runtime source records remain unchanged. Missing register entries use the accepted specific source metadata and resolved version findings, not retrieval dates. Explicit impacts combine the approved activation graph and complete inherited runtime component identities.',
    evidenceOnlySourcesNotActivated: true, aiTreatmentUnchanged: true, historicalFrMirrorOnly: true,
    installationAuthorized: false, publicationAuthorized: false, hostingChangesAuthorized: false, operatingApproval: false,
    evidence };
}
export async function verifyMvp07Governance(repository = root) {
  const prepared = await prepareMvp07Governance(repository);
  const json = async path => JSON.parse(await readFile(resolve(repository, path)));
  assert.deepEqual(await json(registerPath), prepared.register, 'Living register differs from approved adoption');
  assert.deepEqual(await json(eventPath), prepared.event, 'Source event differs from approved adoption');
  assert.deepEqual(await json(indexPath), expectedMvp07Index(prepared), 'Source impact index differs from approved graph');
  assert.deepEqual(await json(versionBridgePath), prepared.bridges, 'Source version bridges differ from accepted assessment');
  const record = await json(adoptionPath);
  assert.deepEqual(record, await adoptionRecord(prepared, repository), 'Adoption receipt altered or evidence drift');
  return record;
}
export async function adoptMvp07Governance(repository = root) {
  const prepared = await prepareMvp07Governance(repository);
  const read = path => readFile(resolve(repository, path));
  const current = await read(registerPath), index = await read(indexPath);
  assert.ok(current.equals(prepared.oldRegisterBytes) || current.equals(encode(prepared.register)), 'Unexpected living register change');
  assert.ok(index.equals(prepared.oldIndexBytes) || index.equals(encode(expectedMvp07Index(prepared))), 'Unexpected living index change');
  await appendOnly(repository, versionBridgePath, prepared.bridges);
  await appendOnly(repository, eventPath, prepared.event);
  await writeFile(resolve(repository, registerPath), encode(prepared.register));
  execFileSync(process.execPath, [resolve(repository, 'scripts/build-source-review-index.mjs')], { cwd: repository, stdio: 'inherit' });
  for (const [path, bytes] of prepared.historicalEvents) assert.ok((await read(path)).equals(bytes));
  const record = await adoptionRecord(prepared, repository);
  await appendOnly(repository, adoptionPath, record);
  await verifyMvp07SourceApproval(repository);
  await verifyMvp07Governance(repository);
  return record;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--write'));
  console.log(JSON.stringify(process.argv[2] === '--write' ? (await adoptMvp07Governance()).counts
    : { preparedRows: (await prepareMvp07Governance()).register.sources.length, liveWrite: false }, null, 2));
}
