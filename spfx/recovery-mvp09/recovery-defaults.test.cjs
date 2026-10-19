// SPDX-License-Identifier: AGPL-3.0-only
'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {memoryStorage,browserState,loadPackagedHost,PACKAGE,V5,activate,basic,click,protectedSeeds}=require('./fixture.cjs');
for(const [name,raw]of Object.entries(protectedSeeds))test(`MVP08 recovery protects ${name} V5 raw bytes through load, save and reset`,async()=>{
  const storage=memoryStorage({[V5]:raw}),browser=browserState(storage),runtime=loadPackagedHost(PACKAGE,{browser});await activate(runtime);
  runtime.inspectCalculator(undefined,ui=>{
    // The defaults decoder is useMemo, not a useState slot. Inspect the actual
    // visible guard and form, then exercise both real persistence handlers.
    const warning=ui.findElement(ui.tree,node=>node.props.className==='fr-selection-notice'&&typeof node.props.children==='string'
      &&node.props.children.startsWith('Die gespeicherten Standards sind mit diesem Datenstand nicht verwendbar.'));
    assert.ok(warning);
    const form=ui.stateValues().find(value=>value&&typeof value==='object'&&Object.hasOwn(value,'authorityCode')&&Object.hasOwn(value,'inputDate'));
    assert.ok(form);assert.equal(form.authorityCode,'');assert.equal(form.profileId,'');assert.equal(form.inputDate,'');
  });
  runtime.inspectCalculator(basic,ui=>{click(ui,'Als Standard speichern');assert.equal(storage.values.get(V5),raw);
    click(ui,'Standards zurücksetzen');assert.equal(storage.values.get(V5),raw);});
  assert.equal(storage.values.get(V5),raw);assert.ok(storage.operations.every(op=>op[1]!==V5||op[0]==='get'),'No write or deletion of protected V5 is permitted');
});
