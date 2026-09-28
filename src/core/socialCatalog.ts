// SPDX-License-Identifier: AGPL-3.0-only
import { parseIsoDate } from './date';
import type { CalculationData } from './types';
import type { ReleaseArtifactReference, SocialInterval, SocialProcedureCatalog } from './socialTypes';

export class SocialCatalogError extends Error {
  constructor(message: string) { super(message); Object.setPrototypeOf(this, SocialCatalogError.prototype); this.name = 'SocialCatalogError'; }
}
function fail(message: string): never { throw new SocialCatalogError(message); }
function unicode(value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    const c = value.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const next = value.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) fail('Unpaired Unicode surrogate');
    } else if (c >= 0xdc00 && c <= 0xdfff) fail('Unpaired Unicode surrogate');
  }
}
/** RFC 8785: ECMAScript scalar serialization and recursive UTF-16 property order.
 * Only JSON data is accepted. No toJSON hooks, sparse arrays or undefined values. */
export function canonicalSocialJson(value: unknown): string {
  const ancestors: object[] = [];
  function encode(item: unknown): string {
    if (item === null) return 'null';
    if (typeof item === 'string') { unicode(item); return JSON.stringify(item); }
    if (typeof item === 'boolean') return String(item);
    if (typeof item === 'number') { if (!Number.isFinite(item)) fail('Non-finite JSON number'); return JSON.stringify(item); }
    if (!item || typeof item !== 'object') return fail('Non-JSON value');
    if (ancestors.includes(item)) fail('Cyclic JSON');
    ancestors.push(item);
    let encoded: string;
    if (Array.isArray(item)) {
      if (Object.keys(item).length !== item.length) fail('Sparse or extended JSON array');
      encoded = '[' + item.map(encode).join(',') + ']';
    } else {
      if (Object.getPrototypeOf(item) !== Object.prototype && Object.getPrototypeOf(item) !== null) fail('Non-plain JSON object');
      if (Object.getOwnPropertySymbols(item).length) fail('Symbol JSON key');
      encoded = '{' + Object.keys(item).sort().map(key => {
        unicode(key);
        const descriptor = Object.getOwnPropertyDescriptor(item, key)!;
        if (!('value' in descriptor)) fail('JSON accessor');
        return JSON.stringify(key) + ':' + encode(descriptor.value);
      }).join(',') + '}';
    }
    ancestors.pop();
    return encoded;
  }
  return encode(value);
}
const SHA_CONSTANTS = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function rotate(value: number, bits: number): number { return (value >>> bits) | (value << (32 - bits)); }
/** Synchronous SHA-256 on canonical UTF-8, host-neutral for browsers and SPFx. */
export function socialObjectSha256(value: unknown): string {
  const input = canonicalSocialJson(value);
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i += 1) {
    let c = input.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) c = 0x10000 + ((c - 0xd800) << 10) + input.charCodeAt(++i) - 0xdc00;
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 65536) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  const bitLength = bytes.length * 8;
  bytes.push(128);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const high = Math.floor(bitLength / 0x100000000), low = bitLength >>> 0;
  for (const part of [high, low]) for (let shift = 24; shift >= 0; shift -= 8) bytes.push((part >>> shift) & 255);
  const state = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words: number[] = [];
    for (let i = 0; i < 16; i += 1) { const p = offset + i * 4; words.push((bytes[p]! << 24) | (bytes[p + 1]! << 16) | (bytes[p + 2]! << 8) | bytes[p + 3]!); }
    for (let i = 16; i < 64; i += 1) {
      const x = words[i - 15]!, y = words[i - 2]!;
      words.push((words[i - 16]! + (rotate(x, 7) ^ rotate(x, 18) ^ (x >>> 3)) + words[i - 7]! + (rotate(y, 17) ^ rotate(y, 19) ^ (y >>> 10))) | 0);
    }
    let [a,b,c,d,e,f,g,h] = state as [number,number,number,number,number,number,number,number];
    for (let i = 0; i < 64; i += 1) {
      const first = (h + (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)) + ((e & f) ^ (~e & g)) + SHA_CONSTANTS[i]! + words[i]!) | 0;
      const second = ((rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + first) | 0; d = c; c = b; b = a; a = (first + second) | 0;
    }
    [a,b,c,d,e,f,g,h].forEach((word, i) => { state[i] = (state[i]! + word) | 0; });
  }
  return state.map(word => (word >>> 0).toString(16).padStart(8, '0')).join('');
}

type Obj = Record<string, unknown>;
function object(value: unknown, keys: string, optional = ''): Obj {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail('Object required');
  const required = keys.split(' ').filter(Boolean), allowed = required.concat(optional.split(' ').filter(Boolean));
  if (Object.keys(value).some(key => !allowed.includes(key)) || required.some(key => !Object.prototype.hasOwnProperty.call(value, key))) fail('Closed object fields invalid');
  return value as Obj;
}
function text(value: unknown): asserts value is string { if (typeof value !== 'string' || !value.trim()) fail('Non-empty string required'); unicode(value); }
function enumeration(value: unknown, values: readonly unknown[]): void { if (!values.includes(value)) fail(`Invalid enum ${String(value)}`); }
function array(value: unknown, min = 1): unknown[] { if (!Array.isArray(value) || value.length < min) return fail('Array required'); return value; }
function distinct(values: readonly unknown[]): void { if (new Set(values).size !== values.length) fail('Duplicate identity or value'); }
function strings(value: unknown, min = 1): string[] { const values = array(value, min); values.forEach(text); distinct(values); return values as string[]; }
function integer(value: unknown): void { if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) fail('Positive integer required'); }
function date(value: unknown, nullable = false): void { if (nullable && value === null) return; if (typeof value !== 'string' || !parseIsoDate(value)) fail('Calendar date invalid'); }
function digest(value: unknown): void { if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) fail('SHA-256 invalid'); }
function labels(value: unknown): void { const v = object(value, 'de fr'); text(v.de); text(v.fr); }
function interval(value: unknown): void { const v = object(value, 'from to'); date(v.from); date(v.to, true); if (v.to !== null && String(v.from) > String(v.to)) fail('Reversed interval'); }
export function socialIntervalContains(intervalValue: SocialInterval, dateValue: string): boolean { return intervalValue.from <= dateValue && (intervalValue.to === null || dateValue <= intervalValue.to); }
function encloses(outer: SocialInterval, inner: SocialInterval): boolean { return outer.from <= inner.from && (outer.to === null || (inner.to !== null && inner.to <= outer.to)); }
export const SOCIAL_CANTONS: readonly string[] = 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ');
export const SOCIAL_FACT_KEYS = ['competentBodyQualified','decisionOrigin','elgAdministrativeCanton','avigControlCanton','avigOfficeCanton','courtCanton','partyDomicileCanton','jurisdictionSpecialCase'] as const;
export function socialFactValid(key: string, value: unknown): boolean {
  if (key === 'competentBodyQualified') return typeof value === 'boolean';
  if (key === 'decisionOrigin') return ['ivOffice','compensationOffice','accidentInsurer','unemploymentFund','cantonalEmploymentOffice','healthInsurer','insuranceCourt'].includes(String(value));
  if (key === 'jurisdictionSpecialCase') return ['ordinary','abroad','thirdParty','unclear'].includes(String(value));
  return SOCIAL_FACT_KEYS.includes(key as typeof SOCIAL_FACT_KEYS[number]) && typeof value === 'string' && SOCIAL_CANTONS.includes(value);
}
const LAWS = ['ivg','ahvg','uvg','elg','avig','kvg'];
const ACTIONS = ['preliminary-objection','objection','appeal','ordered-administrative-days','complaint-correction'];
const STATUS = ['candidate','reviewed','withdrawn'];
function refs(value: unknown, sourceIds: readonly string[], min = 1): void {
  const rows = array(value, min);
  rows.forEach(row => { const v = object(row, 'sourceId locator'); text(v.sourceId); text(v.locator); if (!sourceIds.includes(v.sourceId)) fail('Unknown source reference'); });
  distinct(rows.map(row => canonicalSocialJson(row)));
}
function temporal(v: Obj, sourceIds: readonly string[]): void {
  if (v.legalValidity === null) { if (v.status !== 'candidate') fail('Legal validity missing'); } else interval(v.legalValidity);
  interval(v.caseCoverage); interval(v.sourceCoverage); refs(v.sourceRefs, sourceIds);
  const bindings = array(v.normBindings);
  bindings.forEach(row => {
    const n = object(row, 'sourceId locator temporalSelector applicableFrom applicableTo verification');
    refs([{sourceId: n.sourceId, locator: n.locator}], sourceIds);
    enumeration(n.temporalSelector, ['legalTriggerDate','procedureStartDate','jurisdictionReferenceDate']);
    enumeration(n.verification, ['verified','open']); date(n.applicableFrom, true); date(n.applicableTo, true);
    if (n.applicableFrom === null && v.status !== 'candidate') fail('Unknown norm commencement');
    if (n.applicableFrom !== null && n.applicableTo !== null && String(n.applicableFrom) > String(n.applicableTo)) fail('Reversed norm interval');
    if (!(v.sourceRefs as Obj[]).some(r => r.sourceId === n.sourceId && r.locator === n.locator)) fail('Norm locator not bound');
  });
  distinct(bindings.map(row => canonicalSocialJson(row)));
  for (const entry of bindings as Obj[]) for (const other of bindings as Obj[]) {
    if (entry === other || entry.sourceId !== other.sourceId || entry.locator !== other.locator || entry.temporalSelector !== other.temporalSelector || entry.applicableFrom === null || other.applicableFrom === null) continue;
    if ((entry.applicableTo === null || String(other.applicableFrom) <= String(entry.applicableTo)) && (other.applicableTo === null || String(entry.applicableFrom) <= String(other.applicableTo))) fail('Overlapping norm applicability intervals');
  }
  if (!(v.sourceRefs as Obj[]).every(r => bindings.some(row => (row as Obj).sourceId === r.sourceId && (row as Obj).locator === r.locator))) fail('Source locator without temporal binding');
}

/** Complete closed runtime validation, independent of UI and JSON-schema tools. */
export function assertSocialProcedureCatalog(value: unknown): asserts value is SocialProcedureCatalog {
  canonicalSocialJson(value);
  const root = object(value, '$schema formatVersion dataKind catalogId labels review sources suspensionProfiles filingProfiles federalRules cantonalBindings releaseEligibility excludedPaths');
  enumeration(root.$schema, ['https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/social-procedure-catalog.schema.json']);
  enumeration(root.formatVersion, ['1.0.0']); enumeration(root.dataKind, ['socialProcedureCatalog']); enumeration(root.catalogId, ['ch-social-procedures']); labels(root.labels);
  const review = object(root.review, 'reviewedOn status reviewedBy basis'); date(review.reviewedOn); enumeration(review.status, ['verified','technicalValidated','candidate','monitored']); text(review.reviewedBy); text(review.basis);
  const sources = array(root.sources).map(row => {
    const s = object(row, 'sourceId sourceType title authority url documentVersionDate reviewedOn reviewStatus');
    text(s.sourceId); if (!/^(SRC|JUD)-[A-Z0-9-]+$/.test(s.sourceId)) fail('Source ID invalid');
    enumeration(s.sourceType, ['statute','ordinance','caseLaw','officialDossier']); text(s.title); text(s.authority); text(s.url);
    if (!/^https:\/\/[^\s/]+\//.test(s.url)) fail('HTTPS source URL required');
    date(s.documentVersionDate, true); date(s.reviewedOn); enumeration(s.reviewStatus, ['verified','monitored','withdrawn']); return s.sourceId;
  });
  distinct(sources);
  const suspensions = array(root.suspensionProfiles).map(row => {
    const s = object(row, 'suspensionProfileId mode suspensionSetId labels sourceRefs');
    enumeration(s.suspensionProfileId, ['S_ATSG']); enumeration(s.mode, ['useSet']); enumeration(s.suspensionSetId, ['ch-court-holidays']); labels(s.labels); refs(s.sourceRefs, sources); return s.suspensionProfileId;
  }); distinct(suspensions);
  const filings = array(root.filingProfiles).map(row => {
    const f = object(row, 'filingProfileId preservationMode deadlineDimension acceptedChannels acceptedEvidence originalRequired cutoffTime timezone labels sourceRefs');
    enumeration(f.filingProfileId, ['F7_ATSG_DISPATCH']); enumeration(f.preservationMode, ['dispatch']); enumeration(f.deadlineDimension, ['dateOnly']);
    strings(f.acceptedChannels); strings(f.acceptedEvidence); enumeration(f.originalRequired, [false]); enumeration(f.cutoffTime, [null]); enumeration(f.timezone, [null]); labels(f.labels); refs(f.sourceRefs, sources); return f.filingProfileId;
  }); distinct(filings);
  const rules = array(root.federalRules).map(row => {
    const r = object(row, 'ruleId revision status labels law matter action stage triggerKind notificationChannels calculation suspensionProfileId filingProfileId holidayPolicy endShiftPolicy legalValidity caseCoverage sourceCoverage normBindings sourceRefs');
    text(r.ruleId); if (!/^CH-SOC-[A-Z0-9-]+$/.test(r.ruleId)) fail('National rule identity invalid'); integer(r.revision); enumeration(r.status, STATUS); labels(r.labels); enumeration(r.law, LAWS); text(r.matter); enumeration(r.action, ACTIONS); enumeration(r.stage, ['administration','cantonal-insurance-court']); text(r.triggerKind);
    strings(r.notificationChannels).forEach(v => enumeration(v, ['individual-service']));
    const c = object(r.calculation, 'type anchorInputId direction anchorBoundary', 'duration durationInputId');
    enumeration(c.type, ['R1_RELATIVE']); enumeration(c.anchorInputId, ['legalTriggerDate']); enumeration(c.direction, ['after']); enumeration(c.anchorBoundary, ['excluded']);
    if (('duration' in c) === ('durationInputId' in c)) fail('Exactly one duration form required');
    if ('duration' in c) { const d = object(c.duration, 'value unit'); enumeration(d.value, [30]); enumeration(d.unit, ['day']); }
    else enumeration(c.durationInputId, ['deadlineDays']);
    const ordered = r.action === 'ordered-administrative-days' || r.action === 'complaint-correction';
    if (ordered !== ('durationInputId' in c)) fail('Action duration mismatch');
    if ((r.stage === 'cantonal-insurance-court') !== (r.action === 'appeal' || r.action === 'complaint-correction')) fail('Action stage mismatch');
    enumeration(r.suspensionProfileId, suspensions); enumeration(r.filingProfileId, filings); enumeration(r.holidayPolicy, ['partyOrRepresentative']); enumeration(r.endShiftPolicy, ['nextWorkingDay']); temporal(r, sources); return r;
  });
  distinct(rules.map(r => `${String(r.ruleId)}@${String(r.revision)}`));
  for (const r of rules) for (const other of rules) if (r !== other && r.ruleId === other.ruleId) {
    const a = r.caseCoverage as unknown as SocialInterval, b = other.caseCoverage as unknown as SocialInterval;
    if ((a.to === null || b.from <= a.to) && (b.to === null || a.from <= b.to)) fail('Overlapping rule revisions');
  }
  const bindings = array(root.cantonalBindings).map(row => {
    const b = object(row, 'bindingId revision status labels ruleId ruleRevision procedureContextCanton entryProfileId contextRoutes calendarBindings supplementaryLawRefs legalValidity caseCoverage sourceCoverage normBindings sourceRefs');
    text(b.bindingId); integer(b.revision); enumeration(b.status, STATUS); labels(b.labels); text(b.ruleId); integer(b.ruleRevision); enumeration(b.procedureContextCanton, SOCIAL_CANTONS); text(b.entryProfileId);
    if (!rules.some(r => r.ruleId === b.ruleId && r.revision === b.ruleRevision)) fail('Binding rule missing');
    const routeIds = array(b.contextRoutes).map(row => {
      const route = object(row, 'contextRouteId kind requiredFacts sourceRefs'); text(route.contextRouteId); enumeration(route.kind, ['legal-jurisdiction','product-scope']); refs(route.sourceRefs, sources);
      const factKeys = array(route.requiredFacts).map(row => { const f = object(row, 'factKey allowedValues'); text(f.factKey); enumeration(f.factKey, SOCIAL_FACT_KEYS); const vals = array(f.allowedValues); distinct(vals); if (!vals.every(v => socialFactValid(String(f.factKey), v))) fail('Fact domain mismatch'); return f.factKey; }); distinct(factKeys);
      if (!factKeys.includes('competentBodyQualified') || !factKeys.includes('jurisdictionSpecialCase')) fail('Qualified context facts missing');
      const facts = route.requiredFacts as Obj[];
      if (canonicalSocialJson(facts.find(f => f.factKey === 'competentBodyQualified')!.allowedValues) !== '[true]' || canonicalSocialJson(facts.find(f => f.factKey === 'jurisdictionSpecialCase')!.allowedValues) !== '["ordinary"]') fail('Unqualified route domain');
      return route.contextRouteId;
    }); distinct(routeIds);
    const calendarIds = array(b.calendarBindings).map(row => {
      const c = object(row, 'calendarBindingId holidayCanton spatialScopeId calendarId requiredAnchorRoles sourceRefs'); text(c.calendarBindingId); enumeration(c.holidayCanton, SOCIAL_CANTONS); text(c.spatialScopeId); text(c.calendarId); strings(c.requiredAnchorRoles).forEach(v => enumeration(v, ['party','representative'])); refs(c.sourceRefs, sources); return c.calendarBindingId;
    }); distinct(calendarIds); refs(b.supplementaryLawRefs, sources, 0); temporal(b, sources); return b;
  });
  distinct(bindings.map(b => `${String(b.bindingId)}@${String(b.revision)}`));
  for (const b of bindings) for (const other of bindings) if (b !== other && b.bindingId === other.bindingId) {
    const a = b.caseCoverage as unknown as SocialInterval, c = other.caseCoverage as unknown as SocialInterval;
    if ((a.to === null || c.from <= a.to) && (c.to === null || a.from <= c.to)) fail('Overlapping binding revisions');
  }
  const eligibilityIds = array(root.releaseEligibility, 0).map(row => {
    const e = object(row, 'eligibilityId releaseId status ruleRef bindingRef contextRouteIds calendarBindingIds componentRefs sourceReviewRef referenceSuiteRef caseCoverage calculationCoverage approval');
    text(e.eligibilityId); text(e.releaseId); enumeration(e.status, ['candidate','approved','withdrawn']);
    const rr = object(e.ruleRef, 'ruleId revision sha256'), br = object(e.bindingRef, 'bindingId revision sha256');
    text(rr.ruleId); integer(rr.revision); digest(rr.sha256); text(br.bindingId); integer(br.revision); digest(br.sha256);
    const rule = rules.find(r => r.ruleId === rr.ruleId && r.revision === rr.revision), binding = bindings.find(b => b.bindingId === br.bindingId && b.revision === br.revision);
    if (!rule || !binding || binding.ruleId !== rule.ruleId || binding.ruleRevision !== rule.revision) fail('Eligibility pairing missing');
    if (socialObjectSha256(rule) !== rr.sha256 || socialObjectSha256(binding) !== br.sha256) fail('Eligibility object hash mismatch');
    strings(e.contextRouteIds).forEach(id => { if (!(binding.contextRoutes as Obj[]).some(r => r.contextRouteId === id)) fail('Eligibility route missing'); });
    strings(e.calendarBindingIds).forEach(id => { if (!(binding.calendarBindings as Obj[]).some(c => c.calendarBindingId === id)) fail('Eligibility calendar missing'); });
    const components = array(e.componentRefs).map(row => { const c = object(row, 'role contentId sha256'); enumeration(c.role, ['calendar','holidayCatalog']); text(c.contentId); digest(c.sha256); return `${String(c.role)}:${c.contentId}`; }); distinct(components);
    const sr = object(e.sourceReviewRef, 'reviewId sha256'), rs = object(e.referenceSuiteRef, 'suiteId sha256'); text(sr.reviewId); digest(sr.sha256); text(rs.suiteId); digest(rs.sha256);
    interval(e.caseCoverage); interval(e.calculationCoverage);
    for (const item of [rule, binding]) {
      if (!encloses(item.caseCoverage as unknown as SocialInterval, e.caseCoverage as unknown as SocialInterval) || !encloses(item.sourceCoverage as unknown as SocialInterval, e.calculationCoverage as unknown as SocialInterval)) fail('Eligibility exceeds evidence coverage');
    }
    if (!encloses(e.calculationCoverage as unknown as SocialInterval, e.caseCoverage as unknown as SocialInterval)) fail('Case coverage exceeds calculation coverage');
    if (e.status === 'approved') {
      const a = object(e.approval, 'approvedBy approvedOn decisionRef'); text(a.approvedBy); date(a.approvedOn); text(a.decisionRef);
      if (rule.status !== 'reviewed' || binding.status !== 'reviewed' || [rule,binding].some(v => (v.normBindings as Obj[]).some(n => n.verification !== 'verified'))) fail('Approval of unreviewed rule or binding');
      if ([rule,binding].some(v => !v.legalValidity || !encloses(v.legalValidity as unknown as SocialInterval, e.caseCoverage as unknown as SocialInterval))) fail('Approved case coverage exceeds legal validity');
      const referencedIds = [...rule.sourceRefs as Obj[], ...binding.sourceRefs as Obj[]].map(ref => ref.sourceId);
      if ((root.sources as Obj[]).some(s => referencedIds.includes(s.sourceId) && s.reviewStatus === 'withdrawn')) fail('Approval references withdrawn source');
    } else if (e.approval !== null) fail('Unapproved entry has approval');
    return e.eligibilityId;
  }); distinct(eligibilityIds);
  const exclusions = array(root.excludedPaths, 0).map(row => { const e = object(row, 'exclusionId law matter action reasonKind reasonKey labels sourceRefs'); text(e.exclusionId); enumeration(e.law, LAWS); text(e.matter); text(e.action); enumeration(e.reasonKind, ['statutory-exclusion','product-scope','unsupported-procedure','unresolved-qualification']); text(e.reasonKey); labels(e.labels); refs(e.sourceRefs, sources); return e.exclusionId; }); distinct(exclusions);
}

export function validateSocialCatalogReferences(catalog: SocialProcedureCatalog, data: CalculationData, artifactRefs: readonly ReleaseArtifactReference[] = data.releaseArtifactRefs ?? []): void {
  assertSocialProcedureCatalog(catalog);
  if (data.formatVersion !== '5.0.0') fail('Social contract needs manifest 5');
  distinct(artifactRefs.map(r => `${r.role}:${r.contentId}`));
  for (const binding of catalog.cantonalBindings) {
    if (!data.profiles.has(binding.entryProfileId)) fail('Entry profile missing');
    for (const calendar of binding.calendarBindings) {
      if (!data.calendars.has(calendar.calendarId) && !data.calendarRuleSets.has(calendar.calendarId)) fail('Calendar missing');
      const calendarSet = data.calendarRuleSets.get(calendar.calendarId) ?? data.calendars.get(calendar.calendarId);
      if (calendarSet?.jurisdiction.code !== calendar.holidayCanton) fail('Calendar jurisdiction mismatch');
      // Format 5 still carries the full-canton CH/BE operative projection.
      // A regional label must not silently reuse that projection.
      if (calendar.spatialScopeId !== calendarSet.jurisdiction.code) fail('Spatial calendar projection not available');
    }
  }
  for (const e of catalog.releaseEligibility) {
    if (e.releaseId !== data.releaseId) fail('Eligibility release mismatch');
    for (const c of e.componentRefs) if (!artifactRefs.some(a => a.role === c.role && a.contentId === c.contentId && a.sha256 === c.sha256)) fail('External component hash mismatch');
    const binding = catalog.cantonalBindings.find(b => b.bindingId === e.bindingRef.bindingId && b.revision === e.bindingRef.revision)!;
    for (const id of e.calendarBindingIds) {
      const calendar = binding.calendarBindings.find(c => c.calendarBindingId === id)!;
      const visited = new Set<string>();
      const referenced = (calendarId: string): void => {
        if (visited.has(calendarId)) fail('Cyclic calendar inheritance');
        visited.add(calendarId);
        if (!e.componentRefs.some(c => c.role === 'calendar' && c.contentId === calendarId)) fail('Calendar dependency not bound');
        const component = data.calendarRuleSets.get(calendarId) ?? data.calendars.get(calendarId);
        if (!component) fail('Calendar dependency missing');
        component.inherits.forEach(referenced);
        visited.delete(calendarId);
      };
      referenced(calendar.calendarId);
    }
  }
  const migrated = ['SOC-IV-PRE','SOC-IV-APP','SOC-IV-ADM','SOC-IV-CORRECTION','SOC-AHV-OBJ','SOC-AHV-APP','SOC-AHV-ADM','SOC-AHV-CORRECTION','SOC-UV-OBJ','SOC-UV-APP','SOC-UV-ADM','SOC-UV-CORRECTION'];
  for (const special of data.specialRegimeCatalogs.values()) if (special.deadlineDefinitions.some(d => d.deadlineOrigin === 'CALCULATED' && d.applicability && migrated.includes(d.applicability.mappingId))) fail('Duplicate legacy and social paths');
}
