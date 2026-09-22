// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createBatch03Model} from '../../scripts/ap18b-03-cantons.mjs';
import {deriveBatch04Model} from '../../scripts/ap18b-04-cantons.mjs';
import {createLanguageOverlay,translateNewLabel,LANGUAGE_NOTES} from '../../scripts/ap18b-complete-labels.mjs';

async function fixture(){
  // Language-overlay semantics use a calculation-seed fixture, not an import
  // or byte-identity proof of V0.9. Separate archive checks preserve that
  // evidence, and createBatch04Model keeps its original strict SHA-256 gate.
  const m=deriveBatch04Model(await createBatch03Model(process.cwd()));
  const tables={
    'Gemeinwesen':m.jurisdictions.map(r=>[r[0],r[1],r[2],m.jurisdictionLabels[r[0]]?.it??null,m.jurisdictionLabels[r[0]]?.rm??null]),
    'Geltungsbereiche':m.scopes.map(r=>[r[0],r[1],r[2],m.scopeLabels[r[0]]?.fr??null,m.scopeLabels[r[0]]?.it??null,m.scopeLabels[r[0]]?.rm??null]),
    'Gebietszuordnungen':m.assignments.map(r=>[r.id,r.scopeId,r.areaId,r.de,r.fr,r.it,r.rm]),
    'Feiertagsregeln':m.rules.map(r=>[r.id,r.jurisdiction,r.scope,r.de,r.fr,r.it,r.rm])
  };
  // The actual delivered workbook contains the user-requested member lists.
  tables.Geltungsbereiche.find(r=>r[0]==='AG-ARG-RHEINFELDEN-E1')[2]='Gemeinden Hellikon, Mumpf, Obermumpf, Schupfart, Stein und Wegenstetten';
  tables.Geltungsbereiche.find(r=>r[0]==='AG-ARG-RHEINFELDEN-E2')[2]='Gemeinden Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen und Zuzgen';
  return tables;
}

test('V0.11 fills exactly 315 input gaps without mutating the source tables',async()=>{
  const tables=await fixture(),before=structuredClone(tables),labels=createLanguageOverlay(tables);
  assert.equal(labels.length,315);assert.deepEqual(tables,before);
  assert.deepEqual(Object.fromEntries(['Gemeinwesen','Geltungsbereiche','Gebietszuordnungen','Feiertagsregeln'].map(s=>[s,labels.filter(p=>p.sheet===s).length])),
    {Gemeinwesen:6,Geltungsbereiche:39,Gebietszuordnungen:84,Feiertagsregeln:186});
  assert.ok(labels.every(p=>p.kind==='provisionalProductTranslation'&&p.sourceUrl===null&&!p.legalEffectChanged&&!p.independentLanguageApproval));
});
test('V0.11 reuses existing holiday wording and preserves 2 January as such',async()=>{
  const labels=createLanguageOverlay(await fixture());
  assert.equal(labels.find(p=>p.id==='VS-PROC-DAY-BERCHTOLD'&&p.language==='it').value,'2 gennaio');
  assert.equal(labels.find(p=>p.id==='VS-PROC-DAY-BERCHTOLD'&&p.language==='rm').value,'2 da schaner');
  assert.ok(labels.filter(p=>p.sheet==='Feiertagsregeln'&&!['Genfer Bettag','Wiederherstellung der Republik'].includes(p.de)).every(p=>p.basis==='existingWorkbookWording'));
});
test('V0.11 translates both Geneva names without altering the legal key',async()=>{
  const labels=createLanguageOverlay(await fixture());
  assert.equal(labels.find(p=>p.id==='GE-CAL-DAY-GENEVA-FAST'&&p.language==='it').value,'Digiuno ginevrino');
  assert.equal(labels.find(p=>p.id==='GE-CAL-DAY-RESTORATION'&&p.language==='rm').value,'Restauraziun da la Republica');
});
test('V0.11 keeps every Rheinfelden member visible in each translation',async()=>{
  const labels=createLanguageOverlay(await fixture());
  for(const[id,members]of [['AG-ARG-RHEINFELDEN-E1',['Hellikon','Mumpf','Obermumpf','Schupfart','Stein','Wegenstetten']],['AG-ARG-RHEINFELDEN-E2',['Kaiseraugst','Magden','Möhlin','Olsberg','Rheinfelden','Wallbach','Zeiningen','Zuzgen']]])
    for(const p of labels.filter(p=>p.sheet==='Geltungsbereiche'&&p.id===id))for(const member of members)assert.ok(p.value.includes(member));
});
test('V0.11 applies French elision and keeps place names intact',()=>{
  assert.equal(translateNewLabel('Bezirk Aarau','fr'),'District d’Aarau');
  assert.equal(translateNewLabel('Gemeinde Obermumpf','fr'),'Commune d’Obermumpf');
  assert.equal(translateNewLabel('Gemeinde Möhlin','it'),'Comune di Möhlin');
  assert.equal(translateNewLabel('Gemeinde Bergdietikon','rm'),'Vischnanca da Bergdietikon');
});
test('V0.11 rejects a new source gap rather than inventing terminology',async()=>{
  const tables=await fixture();tables.Feiertagsregeln[0][3]='Unbekannter neuer Feiertag';
  assert.throws(()=>createLanguageOverlay(tables),/No translation/);
});
test('V0.11 rejects a lost source name and changed table size',async()=>{
  const tables=await fixture();tables.Gemeinwesen[0][1]=null;
  assert.throws(()=>createLanguageOverlay(tables));
  tables.Gemeinwesen=[];assert.throws(()=>createLanguageOverlay(tables));
});
test('V0.11 does not silently overwrite a newly supplied translation',async()=>{
  const tables=await fixture();tables.Gemeinwesen[0][3]='Vorhandene Übersetzung';
  assert.throws(()=>createLanguageOverlay(tables),/unexpected gap count/);
});
test('V0.11 documents the user review while preserving five open cases',()=>{
  assert.equal(LANGUAGE_NOTES.length,7);
  assert.ok(LANGUAGE_NOTES.every(p=>p.sheet==='Übersicht'));
  assert.match(LANGUAGE_NOTES.find(p=>p.cell==='A30').value,/Fünf offene Fälle/);
  assert.match(LANGUAGE_NOTES.find(p=>p.cell==='A34').value,/provisorisch/);
});
