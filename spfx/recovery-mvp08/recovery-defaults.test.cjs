// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {memoryStorage,browserState,loadPackagedHost,PACKAGE,V5,OLD,activate,basic,click}=require('./fixture.cjs');
for(const [name,value]of [
  ['preferences',JSON.stringify({version:5,state:'preferences',preferences:{locale:'fr',authorityCode:'TI',procedureSelection:{kind:'cantonalAdministrative',lawId:'lpamm-ti',pathId:'synthetic-preserved'},deadlineDays:30}})],
  ['reset',JSON.stringify({version:5,state:'reset'})],
  ['corrupt','{not-json-preserved'],['future',JSON.stringify({version:999,state:'unknown',payload:['do not delete']})]
])test(`actual MVP07 recovery preserves ${name} V5 bytes through real old defaults load/save/reset`,async()=>{
  const storage=memoryStorage({[V5]:value}),shared=browserState(storage),r=loadPackagedHost(PACKAGE,{browser:shared});
  await activate(r);r.inspectCalculator(basic,ui=>{
    click(ui,'Als Standard speichern');assert.equal(storage.values.get(V5),value);assert.ok(storage.values.has(OLD));
    click(ui,'Standards zurücksetzen');assert.equal(storage.values.get(V5),value);
  });
  assert.equal(storage.values.get(V5),value);assert.ok(storage.operations.every(op=>op[1]!==V5),'Old code must not even interpret V5');
});
