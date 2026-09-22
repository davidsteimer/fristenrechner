// SPDX-License-Identifier: AGPL-3.0-only
// V0.8 language-only overlay. V0.7, legal rules and source approvals stay intact.
import assert from 'node:assert/strict';

const entries = [
  ['EPIPHANY', 'Heilige Drei Könige', 'Bavania',
    'https://portacultura.gr.ch/records/b4603db9-eba1-4815-952a-628f671ed2f3',
    'RTR-Titel Bavania – la festa dals Trais Sontgs Retgs im kantonalen Kulturportal. Kein Beleg einer amtlichen TI-Normübersetzung.'],
  ['ST-JOSEPH', 'Josefstag', 'Son Giusep',
    'https://www.rtr.ch/novitads/grischun/chantun-giuseppas-e-giuseps-celebreschan-oz-lur-di',
    'RTR verwendet Son Giusep und nennt den 19. März. Als kurze Feiertagsbezeichnung übernommen.'],
  ['MAY1', 'Tag der Arbeit (1. Mai)', 'Di da la lavur (1. da matg)',
    'https://www.rtr.ch/archiv/l-archivar-recumonda-il-prim-da-matg-il-di-senza-lavur',
    'RTR-Sprachgebrauch Di da la lavur. Datumszusatz redaktionell analog zu DE/FR ergänzt.'],
  ['CORPUS-CHRISTI', 'Fronleichnam', 'Sontgilcrest',
    'https://www.rtr.ch/archiv/l-archivar-recumonda-sontgilcrest-ina-festa-da-baselgia-tradiziunala',
    'RTR verwendet Sontgilcrest im redaktionellen Text. Lokale Zitatvarianten nicht übernommen. Kein prozessrechtlicher Nachweis.'],
  ['ST-PETER-PAUL', 'Peter und Paul', 'Son Peder e son Paul', null,
    'Eigener provisorischer Übersetzungsvorschlag. Kein vollständiger RG-Sprachbeleg für diese Form gesichert.'],
  ['ASSUMPTION', 'Mariä Himmelfahrt', 'Nossadunna d’avust',
    'https://www.rtr.ch/novitads/grischun/surselva/surselva-tibadas-2016-en-dadas-en-l-aua',
    'RTR verwendet Nossadunna d’avust im Festkontext. Keine amtliche TI-Sprachfassung.'],
  ['ALL-SAINTS', 'Allerheiligen', 'Numnasontga',
    'https://www.gr.ch/RM/instituziuns/parlament/PV/Seiten/RM_2001-01-30_315_m.aspx',
    'Sprachbeleg in einer romanischen Regierungsantwort. Nur Namensgebrauch, keine neue lokale oder kantonale Rechtszuordnung.'],
  ['IMMACULATE-CONCEPTION', 'Mariä Empfängnis', 'Immaculada concepziun da Maria', null,
    'Eigener provisorischer Übersetzungsvorschlag. Idiomatische und historische Belege werden nicht als heutiger RG-Normnachweis ausgegeben.']
];

export const PROVISIONAL_TI_RM_LABELS = entries.map(([key, de, rm, sourceUrl, note]) => ({
  ruleId: `TI-CAL-DAY-${key}`, de, rm, language: 'rm', kind: 'provisionalProductTranslation',
  sourceUrl, note, recordedOn: '2026-09-13', independentLanguageApproval: false,
  legalEffectChanged: false
}));

export function validateProvisionalTiRmLabels(labels = PROVISIONAL_TI_RM_LABELS) {
  assert.deepEqual(labels, PROVISIONAL_TI_RM_LABELS, 'Unexpected language overlay');
  assert.equal(labels.length, 8);
  assert.equal(new Set(labels.map(x => x.ruleId)).size, 8);
  for (const row of labels) {
    assert.ok(row.rm.trim());
    assert.equal(row.kind, 'provisionalProductTranslation');
    assert.equal(row.independentLanguageApproval, false);
    assert.equal(row.legalEffectChanged, false);
    assert.ok(row.sourceUrl === null || row.sourceUrl.startsWith('https://'));
  }
  return true;
}
