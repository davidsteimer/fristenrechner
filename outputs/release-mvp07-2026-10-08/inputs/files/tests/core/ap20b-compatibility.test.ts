// SPDX-License-Identifier: AGPL-3.0-only
// Negative probes against the unchanged MVP05 consumer, not a new consumer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {assertSocialProcedureCatalog, SocialCatalogError} from '../../src/core/socialCatalog';
const path='data/releases/2026-09-28-mvp-05-approved.1/social-procedures/ch-social-procedures.json';
const copy = () => JSON.parse(readFileSync(path,'utf8'));

test('MVP05 social reader accepts its frozen catalog but refuses proposed component 2',()=>{
  assert.doesNotThrow(()=>assertSocialProcedureCatalog(copy()));
  const value=copy();value.formatVersion='2.0.0';
  assert.throws(()=>assertSocialProcedureCatalog(value),SocialCatalogError);
});
test('new law codes cannot be smuggled into social component 1',()=>{
  for(const law of ['eog','famzg','flg','mvg','uelg']) {
    const value=copy();value.federalRules[0].law=law;
    assert.throws(()=>assertSocialProcedureCatalog(value),SocialCatalogError);
  }
});
test('new facts and origin values cannot be smuggled into component 1',()=>{
  for(const factKey of ['eogOfficeType','compensationOfficeCanton','familyAllowanceOrderCanton','uelgAdministrativeCanton']) {
    const value=copy();value.cantonalBindings[0].contextRoutes[0].requiredFacts.push({factKey,allowedValues:['BE']});
    assert.throws(()=>assertSocialProcedureCatalog(value),SocialCatalogError);
  }
  for(const origin of ['familyCompensationOffice','militaryInsurer']) {
    const value=copy();const fact=value.cantonalBindings[0].contextRoutes[0].requiredFacts.find((f:{factKey:string})=>f.factKey==='decisionOrigin');
    fact.allowedValues=[origin];assert.throws(()=>assertSocialProcedureCatalog(value),SocialCatalogError);
  }
});
test('the current manifest schema does not permit aggregate version 6',()=>{
  const schema=JSON.parse(readFileSync('schemas/release-manifest-v5.schema.json','utf8'));
  assert.equal(schema.properties.formatVersion.const,'5.0.0');
  assert.notEqual(schema.properties.formatVersion.const,'6.0.0');
});
