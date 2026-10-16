// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {loadPackagedHost,PACKAGE,ARCHIVE,activate,basic}=require('./fixture.cjs');
test('actual recovery matches the actual original MVP07 package for representative Bundesprofiles',async()=>{
  const current=loadPackagedHost(PACKAGE),old=loadPackagedHost(ARCHIVE);await activate(current);await activate(old);
  for(const profileId of ['stpo','zpo','bgg','vwvg']){
    const input={...basic,profileId,selectors:{procedureVariant:'ordinary',subjectMatter:'ordinary',deliveryMethod:'direct'},
      calendarContext:{role:profileId==='zpo'?'court':'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
    const a=current.submitCalculator(input),b=old.submitCalculator(input);
    assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),profileId);
  }
});
