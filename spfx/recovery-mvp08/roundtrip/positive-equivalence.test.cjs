// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {loadPackagedHost,RECOVERY,ORIGINAL,F7,provider,activate,basic}=require('./fixture.cjs');
test('actual recovery and original MVP07 positively calculate four valid federal profiles identically',async()=>{
  const recovered=loadPackagedHost(RECOVERY),original=loadPackagedHost(ORIGINAL);
  await activate(recovered,provider(F7,'positive-recovery'));await activate(original,provider(F7,'positive-original'));
  for(const profileId of ['stpo','zpo','bgg','vwvg']){
    const selectors={deliveryMethod:'otherLegallyRelevantDate',
      ...(profileId==='zpo'?{procedureVariant:'ordinary'}:['bgg','vwvg'].includes(profileId)?{subjectMatter:'general'}:{})};
    const input={...basic,profileId,authorityCode:['bgg','vwvg'].includes(profileId)?'CH':'BE',selectors,
      calendarContext:{role:profileId==='zpo'?'court':'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
    const a=recovered.submitCalculator(input),b=original.submitCalculator(input);
    assert.equal(a.outcome,'calculated',`${profileId}: ${JSON.stringify(a)}`);assert.equal(b.outcome,'calculated',profileId);
    assert.equal(a.finalEnd,'2026-09-28',profileId);assert.equal(a.calendarExportAllowed,true,profileId);
    assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),profileId);
  }
});
