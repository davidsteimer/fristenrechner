// SPDX-License-Identifier: AGPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertAllowedDelta, catalogPath, socialPath, administrativePath } from '../../scripts/promote-mvp10-release';

// Real accepted native Format-17 input, not an older synthetic catalog shape.
const directory = resolve('data/candidates/2026-10-28-ap23m3');
const manifest = JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8'));
const fixture = (): Map<string, string> => new Map(manifest.artifacts.map((row: any) => [row.path, readFileSync(resolve(directory, row.path), 'utf8')]));
const changed = (path: string, mutate: (value: any) => void) => {
  const before = fixture(), after = new Map(before), value = JSON.parse(after.get(path)!);
  mutate(value);
  after.set(path, JSON.stringify(value, null, 2) + '\n');
  return [before, after] as const;
};
const accepted = (label: string, path: string, mutate: (value: any) => void) => test(label, () => assertAllowedDelta(...changed(path, mutate)));
const rejected = (label: string, path: string, mutate: (value: any) => void) => test(label, () => assert.throws(() => assertAllowedDelta(...changed(path, mutate))));
test('all 44 original artifact bytes satisfy the narrow delta contract', () => {
  const before = fixture();
  assert.equal(before.size, 44);
  assertAllowedDelta(before, new Map(before));
});
accepted('catalog release envelope is rebindable', catalogPath, d => d.activation.releaseEligibility = { status: 'approved' });
accepted('calendar provenance hash is rebindable', 'calendars/be-public-holidays.json', d => d.projection.sourceHash = 'a'.repeat(64));
accepted('social release-only metadata is rebindable', socialPath, d => d.releaseEligibility.forEach((row: any) => { row.releaseId = 'release'; row.status = 'approved'; }));
for (const field of ['physicalBaseline', 'physicalSource']) {
  accepted(`${field}: actual release and hash may be rebound`, administrativePath, d => {
    const value = d.holidayBindings.find((row: any) => field in row)[field];
    value.releaseId = 'release';
    value.references[0].sha256 = 'b'.repeat(64);
  });
  rejected(`${field}: physical identity is immutable`, administrativePath, d => {
    d.holidayBindings.find((row: any) => field in row)[field].references[0].contentId = 'different';
  });
  rejected(`${field}: reference inventory is immutable`, administrativePath, d => {
    d.holidayBindings.find((row: any) => field in row)[field].references.pop();
  });
}
accepted('245 source/suite and holiday provenance hashes may be rebound', administrativePath, d => {
  d.releaseBinding.pathEligibility.forEach((row: any) => { row.holidayBindingSha256 = 'c'.repeat(64); row.sourceReviewRef = { id: 'new' }; row.referenceSuiteRef = { id: 'new' }; });
});
rejected('holiday rules cannot change', catalogPath, d => d.data.rules.pop());
rejected('twenty supplemental rules cannot change', catalogPath, d => d.activation.supplementalRules.pop());
rejected('original source evidence cannot be redated', catalogPath, d => d.activation.sourceEvidence[0].retrievedOn = '2026-10-28');
rejected('calendar date formula cannot change', 'calendars/be-public-holidays.json', d => d.rules[0].calculation.day = 2);
rejected('calendar review cannot become a new historical review', 'calendars/be-public-holidays.json', d => d.review.status = 'verified');
rejected('social cardinality remains fifty', socialPath, d => d.releaseEligibility.pop());
rejected('social rule content is frozen', socialPath, d => d.federalRules[0].title = 'new title');
rejected('social canton remains Bern', socialPath, d => d.cantonalBindings[0].procedureContextCanton = 'ZH');
rejected('social 2026–2027 coverage remains frozen', socialPath, d => d.releaseEligibility[0].caseCoverage.to = '2028-12-31');
rejected('all 245 path permissions remain', administrativePath, d => d.releaseBinding.pathEligibility.pop());
rejected('all 36 physical bindings remain', administrativePath, d => d.holidayBindings.pop());
rejected('all 46 suspension profiles remain', administrativePath, d => d.suspensionProfiles.pop());
rejected('runtimeActive remains false after data promotion', administrativePath, d => d.runtimeActive = true);
rejected('path duration cannot change', administrativePath, d => d.paths[0].duration.value = 31);
rejected('qualification policy cannot change', administrativePath, d => d.qualificationPolicies[0].mode = 'unqualified');
rejected('source metadata cannot be newly dated', administrativePath, d => d.sources[0].reviewedOn = '2026-10-28');
rejected('path qualification hash cannot be resealed', administrativePath, d => d.releaseBinding.pathEligibility[0].qualificationPolicySha256 = '0'.repeat(64));
rejected('opening policy hash cannot change', administrativePath, d => d.releaseBinding.pathEligibility.find((x: any) => x.openingPolicySha256).openingPolicySha256 = '0'.repeat(64));
rejected('path source window cannot expand', administrativePath, d => d.paths[0].temporalBinding.sourceCoverage.to = '2028-12-31');
rejected('global promotion requirement cannot change', administrativePath, d => d.releaseBinding.promotionRequirement = 'none');
for (const kind of ['fixedAuthoritySeat', 'qualifiedAuthoritySeatRegion', 'qualifiedPartyOrRepresentativeCanton']) {
  rejected(`${kind}: calendar-selection semantics cannot change`, administrativePath, d => {
    const binding = d.holidayBindings.find((row: any) => row.calendarSelection?.kind === kind);
    assert.ok(binding, kind);
    binding.calendarSelection.extra = 'unreviewed';
  });
}
rejected('procedural supplement cannot change', administrativePath, d => d.holidayBindings.find((row: any) => row.proceduralCalendarSupplement).proceduralCalendarSupplement.extra = 'new');
test('ordinary profile whitespace changes remain forbidden raw byte changes', () => {
  const before = fixture(), after = new Map(before);
  after.set('profiles/zpo.json', before.get('profiles/zpo.json')! + ' ');
  assert.throws(() => assertAllowedDelta(before, after));
});
test('no missing or extra artifact is accepted', () => {
  const before = fixture(), missing = new Map(before), extra = new Map(before);
  missing.delete('profiles/zpo.json'); extra.set('extra.json', '{}');
  assert.throws(() => assertAllowedDelta(before, missing));
  assert.throws(() => assertAllowedDelta(before, extra));
});
