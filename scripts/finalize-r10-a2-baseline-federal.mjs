// Explicit, bounded legal assessment of the federal BASELINE partition.
// All acceptance, promotion, publication and operational flags remain false.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='outputs/r10-a2-2026-10-28/baseline-federal';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFile(path.join(root,p));
const json=async p=>JSON.parse(await read(p));
const bind=async p=>{const b=await read(p);return{path:p,sha256:hash(b),byteLength:b.length}};
const emit=async(p,v)=>fs.writeFile(path.join(root,p),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const invPath='outputs/r10-a1-2026-10-28/sources/source-inventory.json';
const priorPath='outputs/release-mvp09-2026-10-18/sources/baseline-review.json';
const priorAssessmentPath='.work/r09-a2-baseline/content-and-version-assessment.json';
const approvalPath='outputs/release-mvp09-2026-10-18/source-approval.json';
const inv=await json(invPath),prior=await json(priorPath),oldAssessment=await json(priorAssessmentPath);
const retrieval=await json(base+'/retrievals.json'),comparison=await json(base+'/content-comparison.json'),editions=await json(base+'/edition-comparison.json'),supplement=await json(base+'/kvg-supplement.json');
assert.equal((await bind(invPath)).sha256,'e9949adea7ef5c0192ed5015ed8bfac7594bdb73c1417f4e81f0df3dee837ec6');
assert.equal((await json(approvalPath)).recordStatus,'approved');
for(const r of [...retrieval.retrievals,supplement]){
 assert.equal(r.status,200,r.id??r.url);
 assert.deepEqual(await bind(r.path),{path:r.path,sha256:r.sha256,byteLength:r.byteLength});
 if(r.baseline)assert.deepEqual(await bind(r.baseline.path),{path:r.baseline.path,sha256:r.baseline.sha256,byteLength:r.baseline.byteLength});
}
const rows=inv.rows.filter(r=>retrieval.sourceIds.includes(r.sourceId));
assert.equal(rows.length,44);
const semantic={
 '63/837_843_843':{name:'AHVG',finding:'Art. 1 zur ATSG-Anwendung und Art. 84 zur besonderen Gerichtszuständigkeit bleiben in den aktuellen indexierten 2026-/2027-Texten identisch. Die bekannten Beitrags-, Renten- und Indexanpassungen nach AS 2026 542 werden ausdrücklich beibehalten. Abweichende ältere XML-Editionen der 2027-Fassung sind kein Beleg dafür, dass diese Anpassungen nicht gelten.'},
 '2002/510':{name:'ATSG',finding:'Amtliche Fassung 01.01.2024. Art. 38 bis 40 sowie die konkret verwendeten Zustellungs-, Einsprache-, Beschwerde- und Zuständigkeitsnormen bleiben im verwendeten Fenster unverändert. Art. 60 Abs. 2 und Art. 61 Bst. b werden nur für die bereits qualifizierte formelle Beschwerdeverbesserung verwendet. Keine allgemeine Gleichstellung sämtlicher richterlicher Fristen, keine Wiederherstellungsprüfung und keine Sozialfreigabe ausserhalb Berns. Die Reform gemäss BBl 2025 2891 wird ohne Inkraftsetzungsnachweis nicht aktiviert.'},
 '1959/827_857_845':{name:'IVG',finding:'Art. 1, 57a und 69 bleiben über die indexierten Fassungen 2026/2027 unverändert. Die bereits bekannte Änderung von Beiträgen und materiellen Leistungsnormen wird nicht als Null-Delta des Gesamtgesetzes ausgegeben. Der Einwand und die besondere Beschwerdezuständigkeit bleiben im bisherigen qualifizierten Umfang.'},
 '1961/29_29_29':{name:'IVV',finding:'Art. 73bis und 73ter sind in den amtlichen Fassungen 01.06.2025, 01.01.2027 und 01.07.2027 identisch. Die bereits in R09 erstmals vollständig erreichbaren 2027-Texte bleiben verfügbar. Die vier Änderungen nach AS 2026 544 und die bekannten Änderungen zwischen Januar und Juli werden erhalten. Keine neue feste Frist aus Art. 66 oder der Leistungsanmeldung.'},
 '1982/1676_1676_1676':{name:'UVG',finding:'Art. 1 bleibt in der aktuell indexierten Fassung 01.01.2026 unverändert. ATSG-Anschluss und Bereichsausnahmen werden nur für den bisher qualifizierten individuellen UV-Leistungsweg wiederverwendet.'},
 '2007/804':{name:'ELG',finding:'Die verwendeten Art. 1 bis 3, 14 bis 16 und 21 bleiben in den aktuellen indexierten Fassungen über Januar 2027 unverändert. AS 2026 546 ändert Leistungsbeträge und institutionelle Beiträge, nicht die benutzte Fristregel. Art. 21 Abs. 2 zur Bezeichnung der Durchführungsorgane wird weiterhin ausdrücklich von der Wohnsitznorm in Abs. 1 getrennt.'},
 '1982/2184_2184_2184':{name:'AVIG',finding:'Die verwendeten Normen und die besondere Zuständigkeitsqualifikation bleiben in der Fassung 01.01.2026 unverändert. Nur individuelle ALE wird positiv erfasst. Kurzarbeit, Schlechtwetter und Insolvenz werden nicht aus der Normgleichheit aktiviert. Art. 20 und materielles Geltendmachen bleiben von prozessualen Tagesfristen getrennt.'},
 '1983/1205_1205_1205':{name:'AVIV',finding:'Option B bleibt erforderlich und in ihrem bisherigen Umfang erhalten. Das amtliche Konsolidat 01.02.2027 ist weiterhin nicht als Norm-XML verfügbar, der direkte Prüfpfad liefert nur HTML. Die amtlichen Versions-/Wirkungszeilen und die frisch gelesenen AS 2025 814 sowie AS 2026 258 bestätigen die bekannte Kette. Art. 46 Abs. 2 und 66a Abs. 2 ändern sich 01.01.2027, Art. 57b läuft am 31.01.2027 aus. Das betrifft keine neue positive ALE-Tagesfrist. Art. 26, 77, 119 und 128 behalten ihre konkret begrenzten Rollen. Kein fiktiver Volltextnachweis für Februar 2027.'},
 '1995/1328_1328_1328':{name:'KVG',finding:'Die aktuell amtlich indexierte XML-Edition der Fassung 01.01.2026 unterscheidet sich materiell von der früher gebundenen, weiterhin unverändert erreichbaren XML-Edition. Insbesondere enthält Art. 53 Abs. 1 den geänderten Katalog der ans Bundesverwaltungsgericht weiterziehbaren Regierungsbeschlüsse und Art. 54 Kosten- und Qualitätsziele statt Globalbudgetierung. AS 2025 769 wurde frisch gelesen und setzt diese Änderungen auf 01.01.2026 in Kraft. Die konkrete KVG-FEDERAL-Ausschlussaussage bleibt rechtlich tragfähig, da Art. 53 weiterhin den Bundesverwaltungsgerichtsweg regelt. Art. 54 ist kein aktueller KVG-Laufzeitlocator. Die tatsächlich verwendeten positiven Art. 1, 80 und 85 sowie die übrigen produktreferenzierten KVG-Artikel ändern ihre Aussage nicht. Kein Produktpatch erforderlich, keine pauschale Behauptung eines unveränderten KVG und keine Erweiterung positiver Fallwege.'},
 '1952/1021_1046_1050':{name:'EOG',finding:'Das nun vollständig verfügbare Januar-2027-Konsolidat bestätigt die bereits gebundene Anpassung von Art. 27 durch AS 2026 542. Art. 1, 17, 18 und 24 bleiben über die verwendeten Phasen unverändert. Die bereits ab Juli 2027 vorhandenen Änderungen der kantonalen Ergänzungsnormen Art. 16mbis, 16sbis und 16x bleiben ausdrücklich als Ausschlüsse erhalten. Keine Leistungsbetragsberechnung und keine Aktivierung kantonaler Zusatzleistungen.'},
 '2005/187':{name:'EOV',finding:'Das nun verfügbare Januar-2027-Konsolidat bestätigt AS 2026 548. Art. 19e Abs. 2 betrifft die Löschung von Belegen nach Bearbeitung, nicht den Beginn einer Rechtsmittelfrist. Beitragsregeln nach Art. 36 werden nicht gerechnet. Die verwendeten besonderen Kassenzuständigkeiten Art. 19, 34, 35i und 35q sind über alle gebundenen Phasen identisch.'},
 '2008/51':{name:'FamZG',finding:'Art. 1, 3 und 22 bleiben in der Fassung 01.01.2026 unverändert. Die tatsächliche Familienzulagenordnung ist gesondert zu qualifizieren. Der Gerichtskanton wird nicht aus Wohnsitz oder Kassensitz erfunden. Finanzhilfen an Familienorganisationen bleiben ausgeschlossen.'},
 '1952/823_843_839':{name:'FLG',finding:'Art. 1, 13, 22 und 25 bleiben über 01.07.2027 unverändert. Die Änderung von Art. 10 betrifft materielle Leistungen. Die besondere gerichtliche Anknüpfung an die verfügende kantonale Kasse und der Ausschluss kantonaler Zusatzleistungen bleiben erhalten.'},
 '1952/896_916_912':{name:'FLV',finding:'Art. 10 der Fassung 23.04.2014 bleibt unverändert. Die Zuständigkeit der kantonalen Kasse wird weiterhin je Berechtigtengruppe qualifiziert und nicht durch eine einheitliche Wohnsitzregel ersetzt.'},
 '1993/3043_3043_3043':{name:'MVG',finding:'Fassung 01.01.2024. ATSG-Anschluss des individuellen Leistungswegs und Bereichsausnahmen Art. 22 bis 27 bleiben unverändert. Art. 104 und 105 bleiben aufgehoben. Keine Wiederbelebung historischer Sonderfristen.'},
 '1993/3080_3080_3080':{name:'MVV',finding:'Art. 32a der Fassung 01.01.2026 bleibt unverändert. Der optionale Vorbescheid begründet weiterhin keine gesetzliche feste Einwandfrist. Nur die konkret angeordnete und qualifizierte positive Tagesfrist wird modelliert.'},
 '2021/373':{name:'ÜLG',finding:'Das neu erreichbare Januar-2027-Konsolidat bestätigt die bekannte Anpassung materieller Bedarfs- und Mietzinsbeträge nach AS 2026 546. Art. 1, 18 und 19 bleiben unverändert. Die 15 Monate in Art. 18 sind keine prozessuale Tagesfrist. Die Verwaltungszuständigkeit wird am konkreten Fall qualifiziert.'},
 '2021/376':{name:'ÜLV',finding:'Das neu erreichbare Januar-2027-Konsolidat bestätigt AS 2026 549 zu Mietzinsaufteilung, Erwerbseinkommen und Anpassungsschwellen. Art. 38 bleibt unverändert. Die grundsätzlich 90 Tage für das Durchführungsorgan sind keine Rechtsmittelfrist der Partei.'},
 '2006/218':{name:'BGG',finding:'Die verwendeten Art. 44 bis 48 und Art. 100 bleiben in der aktuellen Fassung 01.04.2026 bestätigt. Die bereits geltenden Änderungen von Art. 83, 117 und 132b begründen keine Änderung der modellierten Tagesfrist. Kein zusätzlich publizierter späterer Fassungsstand im ungekappten amtlichen Index. OF-001 bleibt offen, die Reformvorlage ist kein Inkraftsetzungsnachweis.'},
 '1978/688_688_688':{name:'BPR',finding:'Die verwendeten Art. 21, 29 Abs. 4, 77 Abs. 2 und 79 Abs. 1 der Fassung 23.10.2022 bleiben inhaltlich bestätigt. In der neu indexierten XML-Edition wurden Soft-Hyphen-/Darstellungsunterschiede entfernt. Art. 77 Abs. 2 bleibt die dreitägige Parteibeschwerde, Art. 79 Abs. 1 die zehntägige Entscheidfrist der Kantonsregierung. Die historische Artikelnummer eines Urteils ersetzt keine heutige Normzuordnung.'},
 '1994/1340_1340_1340':{name:'Bundesfeiertagsverordnung',finding:'Art. 1 der Fassung 01.07.1994 ist in der früher gebundenen und der heute indexierten Edition identisch. Der Bundesfeiertag bleibt ein den Sonntagen gleichgestellter arbeitsfreier Tag. Die neue zusätzliche Verwendung im Zürcher Kalender wird separat ausdrücklich beurteilt. Daraus folgt weder eine neue Sozialfreigabe noch eine örtlich erfundene kantonale Feiertagsregel.'},
 '2010/267':{name:'StPO',finding:'Art. 85 und 89 bis 92 sind in den aktuellen indexierten Fassungen 01.04.2025 und 01.01.2027 identisch. Der vollständige neue Artikelvergleich bestätigt den bereits früher geprüften einzigen Textdelta Art. 269. Diese bekannte Änderung des Überwachungsrechts wird nicht als neue R10-Fristenänderung bezeichnet.'},
 '1978/712_712_712':{name:'VPR',finding:'Art. 8a, 8d und 8e bleiben über die bereits publizierte Fassung 01.07.2027 unverändert. Art. 2a ändert reservierte Abstimmungssonntage, nicht die hier verwendeten Fristen-/Erklärungsregeln. Konkrete Abstimmungstermine werden nicht durch diesen Rechner erzeugt. Kein neuer positiver Stunden- oder Fixterminpfad.'},
 '1969/737_757_755':{name:'VwVG',finding:'Die verwendeten Art. 20 bis 22a sind in der aktuellen Fassung inhaltlich bestätigt. In der bekannten Fassung 01.01.2027 ändert sich innerhalb dieser Gruppe nur die Benennung des IGE in Art. 21 Abs. 1bis. Fristwahrung, Fristbeginn, Feiertagsanknüpfung und Stillstand ändern dadurch nicht. Neue Soft-Hyphen-bereinigte XML-Editionen sind separat verglichen. OF-001 bleibt offen.'},
 '2010/262':{name:'ZPO',finding:'Art. 138 und 142 bis 146 bleiben in der aktuellen Fassung 01.07.2026 bestätigt. Art. 142 Abs. 1bis wird nur in seinem eigenen ZPO-Geltungsbereich verwendet. Die bekannten Textänderungen zum Juli 2026 betreffen Art. 248, 260a und 260b, nicht diese Berechnungsregeln. Der ungekappt abgefragte amtliche Zukunftsbestand zeigt keine zusätzliche spätere publizierte Fassung.'}
};
const workFor=r=>r.historicalAssessment.versionFinding.work??(r.sourceId.includes('AVIV-AS-')?'https://fedlex.data.admin.ch/eli/cc/1983/1205_1205_1205':null);
const evid=r=>({path:r.path,sha256:r.sha256,byteLength:r.byteLength,url:r.url,retrievedAt:r.retrievedAt,status:r.status,bodyKind:r.bodyKind??'akn-xml',role:r.role??'fresh-official-KVG-amending-act'});
const compBinding=await bind(base+'/content-comparison.json'),editionBinding=await bind(base+'/edition-comparison.json'),priorBinding=await bind(priorPath),invBinding=await bind(invPath);
const families=comparison.families.map((f,n)=>{
 const key=f.work.replace('https://fedlex.data.admin.ch/eli/cc/','');assert.ok(semantic[key],key);
 return{...semantic[key],work:f.work,assessmentWindow:retrieval.generalWorks.includes(f.work)?'Veröffentlichte aktuelle und zukünftige Fassungen ohne obere Jahresgrenze im Index, keine unbegrenzte Rechtsbeständigkeitsgarantie.':'Bewertung ausschliesslich im bisherigen Sozialfenster 2026–2027.',
  publishedVersionFinding:{publishedVersions:f.publishedVersions,publishedFutureVersions:f.publishedVersions.filter(v=>v.start>'2026-10-28'),noFutureAbsenceGuarantee:true},
  contentEvidence:{...compBinding,pointer:'/families/'+n},sameVersionEditionEvidence:{...editionBinding,pointer:'/comparisons',workSelector:f.work},
  newNormChangeSinceR09Proven:false,newMaterialTextDifferenceAgainstPreviouslyBoundEdition:key==='1995/1328_1328_1328',
  preservedNormBridge:Object.values(oldAssessment.preservedMvp08NormBridges).find(b=>b.work===f.work)??null,sourceReleaseApproved:false,humanApproval:false};
});
const kvgWork='https://fedlex.data.admin.ch/eli/cc/1995/1328_1328_1328';
const kvgEdition=editions.comparisons.find(c=>c.work===kvgWork&&c.from==='2026-01-01');assert.deepEqual(kvgEdition.usedArticleChanges,['art_53','art_54']);
const productRoot='data/candidates/2026-10-28-ap23m3/';
const socialFile=productRoot+'social-procedures/ch-social-procedures.json';
const social=await json(socialFile);
assert.equal(social.excludedPaths[23].exclusionId,'KVG-FEDERAL');
const kvgEdges=inv.referenceGraph.filter(e=>e.sourceId==='SRC-AP19C3-KVG-20260101');
assert.equal(kvgEdges.filter(e=>/Art\. 53/.test(e.locator)).length,1);
assert.equal(kvgEdges.filter(e=>/Art\. 54/.test(e.locator)).length,0);
const kvgFinding={findingId:'R10-A2-BASELINE-KVG-EDITION-01',kind:'material-difference-in-indexed-consolidation-edition-not-newly-enacted-law',
 affectedSourceIds:['SRC-AP19C3-KVG-20260101','SRC-AP19C3-KVG-20260701'],officialVersionDate:'2026-01-01',
 oldEdition:{...kvgEdition.oldEvidence,url:retrieval.retrievals.find(r=>r.baseline?.path===kvgEdition.oldEvidence.path).url},
 currentlyIndexedEdition:{...kvgEdition.currentEvidence,url:retrieval.retrievals.find(r=>r.path===kvgEdition.currentEvidence.path).url},
 changedUsedOrHistoricallyMentionedArticles:kvgEdition.changes.filter(c=>['art_53','art_54'].includes(c.articleId)),
 freshAmendingAct:{...evid(supplement),officialAct:'AS 2025 769',actDate:'2023-09-29',entryIntoForce:'2026-01-01',freshlyReadPassages:['Art. 53 Abs. 1','Art. 54','Ablauf der Referendumsfrist und Inkraftsetzung Ziff. 2']},
 actualProductReferences:kvgEdges,affectedProductObject:{...await bind(socialFile),pointer:'/excludedPaths/23',value:social.excludedPaths[23]},
 positiveArticles:['1','80','85'].map(number=>({number,currentEditionVersusPriorEditionTextEqual:!kvgEdition.changedArticleIds.includes('art_'+number)})),
 assessment:'Art. 53 bezeichnet weiterhin die Beschwerde ans Bundesverwaltungsgericht. Der geänderte Katalog in Abs. 1 verändert den bewusst gesperrten federal-instance-Pfad nicht. Der konkrete Locator ist deshalb weiterhin tragfähig. Die historische Art.-54-Globalbudgetierungsbeschreibung wäre als heutige Normbeschreibung falsch, ist aber kein aktueller Produktlocator. Alle übrigen KVG-Laufzeitlocators wurden gegen die aktuell indexierte Edition geprüft, keine weitere verwendete Aussage ist von deren materiellen Unterschieden betroffen.',
 consequence:'Kein Produktpatch und keine Änderung einer Rechenregel erforderlich. Der Editions-/Inhaltsunterschied ist ausdrücklich Bestandteil der menschlich abzunehmenden Quellenprüfung. Frühere Abruf- und Prüfzustände werden nicht nachträglich umgeschrieben.',
 humanDecisionRequiredForCurrentReview:true,productPatchRequired:false,sourceReleaseApproved:false,humanApproval:false};
const newUseRow=rows.find(r=>r.sourceId==='SRC-BUNDESFEIERTAG-19940701');
assert.equal(newUseRow.newReferenceLocations.length,1);
const zhFile=productRoot+'calendars/ap23f2-zh-rlg-nine.json';
const zh=await json(zhFile);assert.equal(zh.rules[5].sourceRefs[0].sourceId,newUseRow.sourceId);
const newUse={sourceId:newUseRow.sourceId,newReferenceLocations:newUseRow.newReferenceLocations,
 productObject:{...await bind(zhFile),pointer:'/rules/5',value:zh.rules[5]},
 finding:'Die neue Zürcher Regel bildet ausschliesslich den 1. August als Bundesfeiertag mit sonntagsgleicher Wirkung ab. SR 116 Art. 1 gilt als Bundesrecht auch für dieses neue kantonale Kalenderprofil. Der normale feste Monat/Tag und die bundesrechtliche Wirkung werden nicht mit einer neuen örtlichen Sonderregel vermischt. Die verfahrensrechtliche Kalenderbindung des Zürcher Profils wird im dafür verantwortlichen Los zusätzlich geprüft.',
 legalSupportAssessment:'supported-in-this-federal-source-role-awaiting-common-human-acceptance',sourceReleaseApproved:false,humanApproval:false};
const sourceRows=[];
for(const r of rows){
 const index=inv.rows.indexOf(r),oldIndex=prior.rows.findIndex(o=>o.sourceId===r.sourceId),old=prior.rows[oldIndex];assert.ok(old);
 assert.deepEqual(old.referenceLocations,r.priorReferenceLocations);
 assert.ok(r.priorReferenceLocations.every(p=>r.referenceLocations.includes(p)));
 const work=workFor(r),fIndex=families.findIndex(f=>f.work===work);assert.ok(fIndex>=0);
 const fresh=retrieval.retrievals.filter(e=>e.sourceIds.includes(r.sourceId));
 const actual=inv.referenceGraph.filter(e=>e.sourceId===r.sourceId);
 assert.equal(actual.length,r.referenceLocations.length);
 sourceRows.push({sourceId:r.sourceId,ownerLotId:'R10-A2-BASELINE',partition:'federal',reviewStatus:'reviewed-awaiting-human-acceptance',checkedOn:'2026-10-28',
  outcome:r.sourceId.startsWith('SRC-AP19C3-KVG-')?'used-assertions-confirmed-with-explicit-material-edition-finding':'used-assertions-confirmed-with-retained-limits',
  sourceUrls:r.urls,sourceRole:r.inManifest?'manifest-source':'registered-nonruntime-or-supporting-source',actualStatements:{relevantProvisions:r.historicalAssessment.relevantProvisions,referenceAssertions:actual},
  referenceLocations:r.referenceLocations,referenceLocationCount:r.referenceLocations.length,referenceLocationsSha256:hash(JSON.stringify(r.referenceLocations)),
  priorReferenceLocations:r.priorReferenceLocations,newReferenceLocations:r.newReferenceLocations,
  a1RowBinding:{...invBinding,pointer:'/rows/'+index},historicalAssessmentBinding:{...priorBinding,pointer:'/rows/'+oldIndex,originalCheckedOn:'2026-10-18'},
  originalReviewProvenance:{r09OriginalCheckedOn:r.historicalAssessment.originalCheckedOn,originalFreshRetrievalDates:[...new Set(old.freshEvidence.map(e=>e.retrievedAt))].sort(),
   priorContentAndVersionAssessment:{...await bind(priorAssessmentPath),originalCheckedOn:'2026-10-18'},priorHumanApproval:{...await bind(approvalPath),appliesOnlyToPriorRelease:true},
   historicallyReusedInterpretation:'Die R09-Einzelzeile bindet ihre ursprünglichen R08-/R07-Inhaltsprüfungen mit den damaligen Daten. Die Datumsfelder werden nicht auf R10 umdatiert.',declaredProductReviewedOn:r.declaredProductReviewedOn},
  freshEvidence:[...fresh.map(evid),...(r.sourceId.startsWith('SRC-AP19C3-KVG-')?[evid(supplement)]:[])],
  reuseRationale:r.newReferenceLocations.length?'Die bisherigen konkreten Verwendungen bleiben vollständig erhalten. Die zusätzliche Zürcher Bundesfeierverwendung wird gesondert neu beurteilt. Keine blanket-unverändert-Behauptung für den Gesamtgraphen.':'Die bisherigen konkreten Verwendungen sind vollständig unverändert. Die frühere individuelle Auslegung wird nur im identischen Verwendungsumfang und nach frischem amtlichen Inhalts-/Fassungs-/Editionsabgleich wiederverwendet. Nicht allein wegen gleicher URLs, HTTP 200 oder Rohbytes.',
  currentFamilyAssessmentPointer:'/families/'+fIndex,versionFinding:families[fIndex].publishedVersionFinding,substantiveFinding:families[fIndex].finding,
  ...(r.sourceId===newUse.sourceId?{newUseAssessment:newUse}:{}),
  ...(r.sourceId.startsWith('SRC-AP19C3-KVG-')?{explicitEditionFindingId:kvgFinding.findingId}:{}),
  limitations:['Keine automatische Abnahme, Datenpromotion, Installation, Veröffentlichung oder Betriebsfreigabe.','Kein unbegrenzter Rechtsbeständigkeitsnachweis. Vorhandene soziale Freigaben bleiben auf Bern und 2026–2027 beschränkt.','Historische Entscheidverwendungen benötigen zusätzlich den begrenzten Nachweis im Urteils-Teilbericht.'],
  humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false});
}
assert.equal(sourceRows.filter(r=>r.newReferenceLocations.length).length,1);
assert.equal(sourceRows.reduce((n,r)=>n+r.newReferenceLocations.length,0),1);
const report={reviewId:'R10-A2-BASELINE-federal-content-and-version-review',ownerLotId:'R10-A2-BASELINE',partition:'federal',checkedOn:'2026-10-28',recordStatus:'reviewed-awaiting-human-acceptance',
 humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,publicationApproved:false,
 inputBindings:{inventory:invBinding,priorReview:priorBinding,priorHumanApproval:{...await bind(approvalPath),appliesOnlyToPriorRelease:true},retrievals:await bind(base+'/retrievals.json'),contentComparison:compBinding,editionComparison:editionBinding,KVGSupplement:await bind(base+'/kvg-supplement.json')},
 counts:{sourceRows:44,physicalSRErlassFamilies:25,separatelyRegisteredASActs:2,sourceUrls:41,freshPrimaryRetrievals:97,referenceLocations:sourceRows.reduce((n,r)=>n+r.referenceLocationCount,0),newReferenceLocations:1,
  officialPublishedVersionRows:comparison.families.reduce((n,f)=>n+f.publishedVersions.length,0),freshFullNormXML:retrieval.retrievals.filter(r=>r.bodyKind==='akn-xml').length+1,
  newlyAvailableConsolidatedNormTexts:4,failedRetrievals:0},
 method:'Frische amtliche Originalabrufe und frühere identische Abfragen, ergänzter aktueller XML-Manifestationsindex für alle 25 Familien, veröffentlichter Zukunftsbestand der allgemeinen Bundesprofile ohne Oberjahresfilter, inhaltlicher Artikelkörpervergleich, Editionsabgleich derselben Fassung und individuell begründete Wiederverwendung der unveränderten Aussageverwendungen.',
 evidenceTypes:['Amtlicher SR-Konsolidattext','Amtlicher AS-Änderungsakt und Inkraftsetzungsbestimmung','Amtlicher Fassungs-/Wirkungsindex mit gebundener konkreter SPARQL-Abfrage','Frischer vollständiger sichtbarer BJ-Dossier-Haupttext','Historische abgenommene Einzelauslegung mit Originaldatum und Hash','Konkreter Produktverwendungsgraph und gesonderte neue Verwendung'],
 sourceRows,families,findings:[kvgFinding,{findingId:'R10-A2-BASELINE-AVAILABILITY-01',kind:'new-evidence-availability-not-new-norm',texts:['EOG 01.01.2027','EOV 01.01.2027','ÜLG 01.01.2027','ÜLV 01.01.2027'],
  evidence:comparison.baselineComparisons.filter(c=>c.kind==='newly-available-norm-XML-not-a-new-law-by-itself'),assessment:'Die neuen erreichbaren Konsolidate bestätigen die bereits gebundenen AS-Änderungsbrücken. Der frühere HTML-Nichtverfügbarkeitsbefund bleibt als historischer Zustand erhalten.'}],
 retainedLimits:[{id:'AVIV-OPTION-B',status:'retained',finding:semantic['1983/1205_1205_1205'].finding},
  {id:'OF-001',status:'open-not-activated',finding:'BJ-Haupttext normalisiert identisch. BBl 2025 2891 bleibt byteidentische Referendumsvorlage und delegiert das Inkrafttreten an den Bundesrat. Aktuelle und veröffentlichte künftige BGG-/VwVG-/ATSG-Fassungen liefern keinen neuen Inkraftsetzungsnachweis der allgemeinen Wochenendzustellungsregel. Keine Aktivierung aus dem Reformtext.',evidence:retrieval.retrievals.filter(r=>['069-body.html','070-059-BBl-2025-2891','r10-versions-scoped','r10-impacts-scoped'].includes(r.id)).map(evid),visibleBJComparison:{...compBinding,pointer:'/BJ'}}],
 normCompanionsForJudgmentLane:{sourceIds:sourceRows.map(r=>r.sourceId),use:'Konkrete aktuelle Normfassungen für die gesondert begrenzt wiederverwendeten Urteile. Insbesondere ATSG 38–41, 60 Abs. 2 und 61 Bst. b, BPR 77/79 sowie die jeweiligen Sozial-Zuständigkeitsnormen. Keine pauschale Aktualisierung historischer Entscheidrechtssätze.'},
 remainingDependencies:['Gesonderte menschliche Abnahme des zusammengeführten R10-A2-Quellenberichts.','Die restlichen 33 Baseline-Kennungen einschliesslich historischer Entscheide werden in getrennten Teilberichten desselben ersten Loses beurteilt.','Verfahrensrechtliche Zürcher Kalenderbindung wird unabhängig von der hier beurteilten Bundesfeierquelle im zuständigen weiteren Los abgeglichen.'],
 noProductChanges:true,noEnvironmentChanges:true,noCommitOrUpload:true};
await emit(base+'/review.json',report);
console.log(JSON.stringify({review:await bind(base+'/review.json'),counts:report.counts,sourceRowIndex:sourceRows.map((r,n)=>({id:r.sourceId,pointer:'/sourceRows/'+n})),humanApproval:report.humanApproval},null,2));
