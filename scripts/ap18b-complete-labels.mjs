// SPDX-License-Identifier: AGPL-3.0-only
// Language-only V0.11 overlay. Frozen models and legal semantics stay intact.
import assert from 'node:assert/strict';

export const LANGUAGE_SOURCE_SHA='bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e';
export const LANGUAGE_TABLES=[
  {sheet:'Gemeinwesen',first:7,last:33,columns:['B','C','D','E'],expected:6},
  {sheet:'Geltungsbereiche',first:7,last:55,columns:['C','D','E','F'],expected:39},
  {sheet:'Gebietszuordnungen',first:7,last:101,columns:['D','E','F','G'],expected:84},
  {sheet:'Feiertagsregeln',first:7,last:480,columns:['D','E','F','G'],expected:186}
];
export const LANGUAGE_CODES=['de','fr','it','rm'];
const word=(fr,it,rm)=>({fr,it,rm});
const E1='Hellikon, Mumpf, Obermumpf, Schupfart, Stein';
const E2='Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen';
export const NEW_TRANSLATIONS={
  'Bund':word('Confédération','Confederazione','Confederaziun'),
  'Bern':word('Berne','Berna','Berna'),
  'Aargau':word('Argovie','Argovia','Argovia'),
  'Genfer Bettag':word('Jeûne genevois','Digiuno ginevrino','Di da la rogaziun da Genevra'),
  'Wiederherstellung der Republik':word('Restauration de la République','Restaurazione della Repubblica','Restauraziun da la Republica'),
  'Bundesgebiet':word('Territoire de la Confédération','Territorio della Confederazione','Territori da la Confederaziun'),
  'Kanton Bern':word('Canton de Berne','Cantone di Berna','Chantun Berna'),
  'Bezirk Baden ohne Bergdietikon':word('District de Baden sans Bergdietikon','Distretto di Baden senza Bergdietikon','District da Baden senza Bergdietikon'),
  'Aargau, prozessuale Zuordnung':word('Argovie, rattachement procédural','Argovia, attribuzione procedurale','Argovia, attribuziun procedurala'),
  'Bezirke Aarau, Brugg, Kulm, Lenzburg und Zofingen':word('Districts d’Aarau, de Brugg, de Kulm, de Lenzburg et de Zofingen','Distretti di Aarau, Brugg, Kulm, Lenzburg e Zofingen','Districts dad Aarau, Brugg, Kulm, Lenzburg e Zofingen'),
  'Bezirke Laufenburg und Muri':word('Districts de Laufenburg et de Muri','Distretti di Laufenburg e Muri','Districts da Laufenburg e Muri'),
  [`Gemeinden ${E1} und Wegenstetten`]:word(`Communes de ${E1} et Wegenstetten`,`Comuni di ${E1} e Wegenstetten`,`Vischnancas da ${E1} e Wegenstetten`),
  [`Gemeinden ${E2} und Zuzgen`]:word(`Communes de ${E2} et Zuzgen`,`Comuni di ${E2} e Zuzgen`,`Vischnancas da ${E2} e Zuzgen`),
  'Wallis, namentliche allgemeine Feiertagsgrundliste':word('Valais, liste de base des jours fériés nommés','Vallese, elenco di base dei giorni festivi generali indicati','Vallais, glista da basa dals firads generals numnads'),
  'Wallis, vier Prozessergänzungen nach Art. 37 RPflG':word('Valais, quatre jours supplémentaires selon l’art. 37 LOJ','Vallese, quattro giorni supplementari secondo l’art. 37 RPflG','Vallais, quatter dis supplementars tenor l’art. 37 RPflG'),
  'Genf, gesetzliche Feiertage nach Art. 1 Abs. 1 LJF':word('Genève, jours fériés selon l’art. 1 al. 1 LJF','Ginevra, giorni festivi secondo l’art. 1 cpv. 1 LJF','Genevra, firads tenor l’art. 1 al. 1 LJF')
};

const index=column=>column.charCodeAt(0)-65;
const blank=value=>value===null||value===undefined||value==='';
export function translateNewLabel(de,language){
  let labels=NEW_TRANSLATIONS[de];
  if(!labels&&de.startsWith('Gemeinde ')){
    const place=de.slice('Gemeinde '.length);
    labels=word(`Commune ${/^[AEIOU]/.test(place)?'d’':'de '}${place}`,`Comune di ${place}`,`Vischnanca ${/^[AEIOU]/.test(place)?'dad':'da'} ${place}`);
  }
  if(!labels&&de.startsWith('Bezirk ')){
    const place=de.slice('Bezirk '.length);
    labels=word(`District ${/^[AEIOU]/.test(place)?'d’':'de '}${place}`,`Distretto di ${place}`,`District ${/^[AEIOU]/.test(place)?'dad':'da'} ${place}`);
  }
  assert.ok(labels?.[language]?.trim(),`No translation for ${de} (${language})`);
  return labels[language];
}

export function createLanguageOverlay(tables){
  const labels=[];
  for(const spec of LANGUAGE_TABLES){
    const rows=tables[spec.sheet];
    assert.equal(rows.length,spec.last-spec.first+1,spec.sheet);
    const count=labels.length;
    rows.forEach((row,i)=>{
      assert.ok(row[0],`${spec.sheet}: missing stable ID`);
      const de=row[index(spec.columns[0])];
      assert.ok(typeof de==='string'&&de.trim());
      spec.columns.forEach((column,j)=>{
        if(!blank(row[index(column)]))return;
        assert.ok(j>0,'Never invent a missing German source name');
        const language=LANGUAGE_CODES[j];
        // Prefer the same existing reader-facing name in this immutable workbook.
        const existing=rows.find(r=>r[index(spec.columns[0])]===de&&!blank(r[index(column)]));
        const value=existing?existing[index(column)]:translateNewLabel(de,language);
        labels.push({sheet:spec.sheet,cell:`${column}${spec.first+i}`,id:row[0],de,language,value,
          kind:'provisionalProductTranslation',sourceUrl:null,
          basis:existing?'existingWorkbookWording':'editorialTranslation',
          recordedOn:'2026-09-13',independentLanguageApproval:false,legalEffectChanged:false});
      });
    });
    assert.equal(labels.length-count,spec.expected,`${spec.sheet}: unexpected gap count`);
  }
  assert.equal(labels.length,315);
  assert.equal(new Set(labels.map(p=>`${p.sheet}!${p.cell}`)).size,315);
  return labels;
}

export const LANGUAGE_NOTES=[
  ['A6','AP18B-04 · V0.11 · Bund und alle Kantone mit vier vollständigen Sprachspalten'],
  ['A9','V0.9 und V0.10 unverändert erhalten. SO-Halbtag am 1. Mai: gemäss Fachentscheid keine Fristwirkung.'],
  ['A14','Historische Statuswerte bleiben erhalten. Keine automatische Datenfreigabe.'],
  ['A30','V0.10 fachlich ohne Beanstandung durchgesehen. Fünf offene Fälle bleiben bestehen.'],
  ['A31','V0.11 ergänzt nur Sprache. Keine Produktfreigabe oder Änderung einer Installation.'],
  ['A34','DE/FR/IT/RG-Bezeichnungen vollständig. Ergänzungen provisorisch, keine amtlichen Sprachfassungen.'],
  ['A36','Arbeitsmappenvertrag 0.5.0 unverändert. Fachregeln, Fristwirkung und Datumslogik unverändert.']
].map(([cell,value])=>({sheet:'Übersicht',cell,value}));
