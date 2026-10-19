// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {loadPackagedHost,PACKAGE,ARCHIVE,activate,basic}=require('./fixture.cjs');
test('actual recovery and original MVP08 have identical Bundesprofile outcomes and traces',async()=>{
  const current=loadPackagedHost(PACKAGE),previous=loadPackagedHost(ARCHIVE);await activate(current);await activate(previous);
  for(const profileId of ['stpo','zpo','bgg','vwvg']){
    const input={...basic,profileId,selectors:{procedureVariant:'ordinary',subjectMatter:'ordinary',deliveryMethod:'direct'},
      calendarContext:{role:profileId==='zpo'?'court':'partyWithoutRepresentative',canton:'BE',areaFacts:{}}};
    assert.deepEqual(JSON.parse(JSON.stringify(current.submitCalculator(input))),JSON.parse(JSON.stringify(previous.submitCalculator(input))),profileId);
  }
});
