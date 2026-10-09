// SPDX-License-Identifier: AGPL-3.0-only
// Documentation model only. Never modifies the released product data.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const out='outputs/ap22a-abschluss-2026-10-02';
const input='outputs/ap22a-matrix-2026-10-02/matrix-data.json';
const original=await fs.readFile(input);
assert.equal(createHash('sha256').update(original).digest('hex'),'e39e56bfb892aff8bc57e0b8229454401e2d21bb610b2e637005ff4af7f47319');
const old=JSON.parse(original);
const supplements=await Promise.all(['regional','weitere'].map(async name=>JSON.parse(await fs.readFile(`${out}/${name}/zuordnungen.json`,'utf8'))));
const keyed=new Map();
for(const part of supplements)for(const group of part.groups)for(const scope of group.scopes)for(const profile of group.profiles){
  const key=`${scope}/${profile}`;
  assert.ok(!keyed.has(key),key);
  keyed.set(key,group);
}
assert.equal(keyed.size,73);
assert.deepEqual([...keyed.keys()].sort(),old.matrix.filter(r=>r.status==='Zuordnung offen').map(r=>`${r.scope}/${r.profile}`).sort());

const bund=await fs.readFile('docs/fachrecht/ap22a-bundesanknuepfungen.md','utf8');
const bundSources=bund.split('\n').filter(line=>line.startsWith('| AP22CLOSE-BUND-')).map(line=>{
  const [,id,label,review]=line.split('|').map(v=>v.trim());
  const match=label.match(/^\[([^\]]+)\]\((https:[^)]+)\)(.*)$/);
  assert.ok(match,label);
  return {id,title:match[1],url:match[2],locator:match[3].replace(/^,\s*/,''),jurisdiction:'CH',versionOn:'Siehe Fundstelle',retrievedOn:'2026-10-02',review,note:'Fachnachtrag ap22a-bundesanknuepfungen.md. Quellenstand, Normprüfung und Ableitung dort differenziert.'};
});
assert.equal(bundSources.length,19);
const sources=[...old.sources.map(s=>({...s})),...supplements.flatMap(p=>p.sources).map(s=>({...s,jurisdiction:s.jurisdiction??'Siehe Titel',retrievedOn:'2026-10-02'})),...bundSources];
assert.equal(new Set(sources.map(s=>s.id)).size,sources.length);
const bySource=new Map(sources.map(s=>[s.id,s]));
// Preserve the former source entry, but prevent the superseded inference from being read as current.
bySource.get('AP22-4A538').note='Historischer Erstbefund, am 02.10.2026 korrigiert: Die damalige Fristberechnung ist gemäss 2E_8/2024 E. 6.5 fehlerhaft. Keine operative Begründung für eine regionale BGG-Beschränkung. Siehe AP22CLOSE-BGER-2E8.';
const prof=Object.fromEntries(old.profiles.map(p=>[p.id,{...p}]));
for(const p of Object.values(prof)){
  p.source=`AP22CLOSE-BUND-${p.id==='VwVG'?'VWVG':p.id.toUpperCase()}`;
  p.role=p.id==='ZPO'?'Ort des zuständigen Gerichts, kein zusätzlicher Partei- oder Vertretungskalender.':'Ohne Vertretung Parteiort. Bei eindeutig bestimmter professioneller Zustellvertretung deren Ort. Keine freie Vereinigung. Ungeklärte Vertretung oder Mandatswechsel gesondert klären.';
  p.anchor=p.id==='ZPO'?'Gerichtsort':'Rechtlich massgebender Partei- / Vertretungsort';
  p.limit=p.id==='VwVG'?'Art. 20 und 22a der amtlichen Fassung 2027 geprüft, inhaltlich unverändert. Nichtprofessionelle Mehrortfälle bleiben gesondert.':'Tagesfristen und bisher modellierte Zustellungs-/Verfahrensarten. Kein zusätzlicher Sozial- oder kantonaler Verwaltungsbereich.';
}
const action={include:'Verwenden',supplement:'Ergänzen',replace:'Ersetzen durch',exclude:'Nicht verwenden',limited:'Bewusst begrenzt',needsDecision:'Gezielte Grenze vorgeschlagen',create:'Neue Prozessliste erfassen',existing:'Bestand beibehalten'};
const baseFor={
  'AI-RTG-INNER-ADDITIONAL':'AI-RTG-ALL','SH-ZPO-ADDITIONAL':'SH-RTG-ALL','SG-ZPO-ADDITIONAL':'SG-RLG-ALL',
  'NE-LANDERON-ADDITIONAL':'NE-LDJF-BASE','NE-LPA-ADDITIONAL':'NE-LDJF-BASE','VS-LOJ-ADDITIONAL':'VS-PUBLIC-ALL','LU-VRG-ADDITIONAL':'LU-RLG-ALL'
};
const matrix=old.matrix.map(row=>{
  const r={...row,originalStatus:row.status,originalReason:row.reason,sourceIds:[...row.sourceIds]};
  r.anchor=prof[r.profile].anchor;
  r.release=row.status==='Bestand unverändert'?'Bestehende CH-/BE-Freigabe':row.status==='Nicht übernehmen'?'Negativer Verwendungsentscheid bleibt':'Fachliche Freigabe DEC-2026-028 erteilt. Keine technische Aktivierung.';
  r.mode='include';r.selectedScopes=[r.scope];r.status='Zuordnung bestimmt';
  r.reason='Kantonal anerkannte Grundliste am rechtlich massgebenden Ort. Übernahme im Umfang von DEC-2026-028. AP18-/MVP-0.6-Quellenstand wiederverwendet, keine vollständige neue Quellenrevision behauptet.';
  r.evidence='Fachliche Freigabe DEC-2026-028. Quellenherkunft gemäss Blatt Quellen.';
  const group=keyed.get(`${r.scope}/${r.profile}`);
  if(group){
    Object.assign(r,{mode:group.mode,selectedScopes:group.selectedScopes,reason:group.reason,sourceIds:[...new Set([...group.sourceIds,prof[r.profile].source])],evidence:'02.10.2026 gezielte Quellenprüfung. Direktbeleg und normative Ableitung siehe Begründung und Fachnachtrag.'});
    if(group.mode==='needsDecision'){
      r.status='Grenzentscheid offen';
      r.release='DEC-2026-028 erteilt. Neuer eng begrenzter Jan.-2-Vorschlag zur Entscheidung vorgelegt.';
      r.limitationProposal={date:'01-02',when:'Zwei Berechnungspfade mit und ohne diesen Tag liefern unterschiedliche rechtliche Ergebnisse.',effect:'Keine automatische definitive Frist. Einzelfallklärung verlangen.',approved:false};
    }
  }else if(row.status==='Bestand unverändert'){
    r.mode='existing';r.status=row.status;r.reason=row.reason;r.evidence=row.evidence;
  }else if(row.status==='Nicht übernehmen'){
    r.mode='exclude';r.selectedScopes=[];r.status=row.status;r.reason=row.reason;
  }else if(row.status==='Quellenlücke'){
    r.mode='limited';r.status='Bewusst begrenzt';r.selectedScopes=['CH-ALL','GR-PUBLIC-ALL'];
    r.reason='Nur kantonaler Grundkatalog und Bundesfeier. Lokale Ruhetage nach Art. 3 Ruhetagsgesetz nicht erhoben. Sichtbarer Hinweis und Rechenspur erforderlich. Kein allgemeiner rechtlicher Irrelevanzbefund. DEC-2026-028.';
  }else if(row.status==='Katalogergänzung nötig'){
    r.mode='create';r.status=row.status;r.selectedScopes=['CH-ALL','SO-PROCEDURAL-DRAFT'];
    r.reason='Zwölf ganztägige kantonale Verfahrenstage plus Bundesfeier, ohne Bucheggberg-Ausnahme. Fachlich nach DEC-2026-028 freigegeben. Technische Erfassung in AP22B/C, kein Umdeuten des RTG-Halbtags.';
  }else if(r.scope.endsWith('ADDITIONAL')){
    r.mode='supplement';r.reason='Nur die bezeichneten Zusatztage zur passenden Grundliste. Räumliche und verfahrensrechtliche Bindung beachten, keine freie Vereinigung konkurrierender Listen. DEC-2026-028.';
  }else if(['AG-ZPO-ALL','FR-JG-ALL','LU-JUSG-ART76'].includes(r.scope)){
    r.reason='Eigene ausdrücklich für dieses Verfahren anerkannte kantonsweite Prozessliste. Andere Regional- oder Grundlisten nicht zusätzlich vereinigen. DEC-2026-028 und die bezeichnete Prozessnorm.';
  }
  // General lists remain in the research catalogue, but lose priority to the selected complete process list.
  if(['ZH-RLG-ALL','ZG-RLG-ALL'].includes(r.scope)||(r.scope==='LU-RLG-ALL'&&['StPO','ZPO'].includes(r.profile))){
    r.mode='replace';r.selectedScopes=[r.scope==='ZH-RLG-ALL'?'ZH-GOG-ALL':r.scope==='ZG-RLG-ALL'?'ZG-VRG-ART10':'LU-JUSG-ART76'];
    r.reason='Diese allgemeine Grundliste bleibt als Katalogwissen erhalten. Operativ ist die vollständige, konkret belegte Prozessliste vorrangig. Keine zusätzliche Vereinigung und keine Doppelzählung.';
    const peer=keyed.get(`${r.selectedScopes[0]}/${r.profile}`);
    r.sourceIds=[...new Set([...r.sourceIds,...(peer?.sourceIds??['AP22CLOSE-PROC-LU-JUSG'])])];
  }
  if(baseFor[r.scope]&&r.mode==='supplement')r.selectedScopes=[...new Set([baseFor[r.scope],...r.selectedScopes])];
  if(r.scope==='AI-RTG-INNER-ADDITIONAL')r.reason+=' Nur im kantonal definierten inneren Landesteil, nicht in Oberegg.';
  if(r.scope==='AI-RTG-ALL')r.reason+=' Beschlossene gesetzesbasierte Stephanstagsregel und dokumentierter amtlicher Kalenderkonflikt bleiben unverändert.';
  if(r.scope==='GL-RTG-ALL')r.reason+=' Näfelser Fahrt mit bereits abgenommener Karwochenverschiebung.';
  if(r.scope==='NE-LANDERON-ADDITIONAL')r.reason+=' Fronleichnam nur Le Landeron, kantonaler Beschluss. Nicht kantonsweit.';
  if(r.scope.startsWith('NE-'))r.reason+=' Besondere noch nicht erhobene Jahres- und örtliche Beschlüsse bleiben vorbehalten.';
  if(r.scope==='NE-LDJF-BASE')r.reason+=' Ergänzend gilt NE-LPA-ADDITIONAL nach der je Profil eigenen Gleichstellungsnorm.';
  r.action=`${action[r.mode]}${r.selectedScopes.length?'\n'+r.selectedScopes.join(' + '):''}`;
  r.locator=[...new Set(r.sourceIds.map(id=>{assert.ok(bySource.has(id),id);return bySource.get(id).locator}).filter(Boolean))].join(' | ');
  return r;
});
assert.equal(matrix.filter(r=>r.status==='Grenzentscheid offen').length,4);
assert.equal(matrix.filter(r=>r.status==='Nicht übernehmen').length,20);
const knownScopes=new Set([...old.scopes.map(s=>s.id),'SO-PROCEDURAL-DRAFT']);
for(const r of matrix)for(const s of r.selectedScopes)assert.ok(knownScopes.has(s),s);
const checks=old.checks.map(r=>[...r]);
const setCheck=(id,changes)=>{const r=checks.find(r=>r[0]===id);for(const [i,value]of Object.entries(changes))r[Number(i)]=value;};
setCheck('R01',{3:'07.07.–08.09.2023',4:'BGG-Ende 08.09.2023 mit GE-Zustellvertretung, Genfer Bettag am 07.09.2023. Kein zusätzlicher SH-Kalender.',5:'AP22CLOSE-BUND-4A434'});
setCheck('R02',{3:'20.05.–19.06.2025',4:'BGG-Ende 19.06.2025 bei Vertreter VD. Fronleichnam am Parteiort verlängert nicht.',5:'AP22CLOSE-BUND-7B561'});
setCheck('R03',{3:'Nomineller Endtag 02.01.2029',4:'AG-ZPO-Liste: 2. Januar positiv, nächster Werktag 03.01.2029. Feiertagsauswahl, kein eigenständiger Test des Weihnachtsstillstands.'});
setCheck('R04',{2:'BGG, Lenzburg AG',3:'02.10.–02.11.2023',4:'Korrigierter Sollwert 02.11.2023. EG ZPO gilt kantonsweit. Frühere regionale Einschränkung aus 4A_538/2023 nicht fortschreiben.',5:'AP22CLOSE-BGER-2E8'});
setCheck('R05',{4:'01.05.2026 ist ganztägiger Prozessfeiertag, nominelles Ende verschiebt sich auf 04.05.2026. SO-Prozessliste noch technisch zu erfassen.'});
setCheck('R06',{3:'Nomineller Endtag 25.05.2026',4:'JG-Liste kantonsweit, Pfingstmontag positiv, nächster Werktag 26.05.2026. Stundenfrist bleibt ausserhalb.',5:'AP22CLOSE-FR-JG'});
setCheck('R07',{4:'GR-Grundkatalog plus Bundesfeier, sichtbarer Hinweis auf bewusst nicht berücksichtigte lokale Ruhetage. Kein Vollständigkeitsversprechen.',6:'DEC-2026-028 beschlossen',7:'Warnung und Rechenspur in AP22C testen'});
setCheck('R12',{3:'Nomineller Endtag 04.06.2026',4:'Le Landeron: Fronleichnam positiv, Ende 05.06.2026. Neuchâtel: keine Verschiebung aus bekannten Regeln. Örtliche Grenze explizit.'});
setCheck('R13',{3:'Nomineller Endtag 25.05.2026',4:'Pfingstmontag positiv aus wiederkehrender RDF-Regel, Ende 26.05.2026. Besonderer Jahresvorbehalt separat. Aktuelle LPA-Gleichstellung geprüft.',5:'AP22CLOSE-NE-LPA | AP22CLOSE-NE-RDF | AP22CLOSE-BGER-9C396'});
setCheck('R14',{3:'Gewöhnliche Post, 01.05.2026, SO',4:'Art. 142 Abs. 1bis: gesetzlicher Empfangstag 04.05.2026 bei massgebendem SO-Gerichtsort. Keine neue Zustellartfreigabe.'});
setCheck('R15',{3:'Empfang 14.07.2026, zehn Tage',4:'StPO: 24.07.2026. ZPO ordentlich mit Sommerstillstand: 25.08.2026. BGG-Beschaffung ohne Stillstand: 24.07.2026. Gleiche Datumsbasis, unterschiedliche Verfahren.'});
setCheck('R16',{3:'GE, 23.12.2022, zehn StPO-Tage',4:'Fristende 02.01.2023. Personalersatzurlaub und geschlossene Schalter machen diesen Tag nicht zum Prozessfeiertag.',5:'AP22CLOSE-BUND-7B32'});
setCheck('R18',{4:'Art. 20 und 22a der amtlichen Konsolidierungen 2022 und 2027 sind inhaltlich gleich. Spezifischer Aktualitätsprüfpunkt erledigt, kein unbegrenzter Releasehorizont.',5:'AP22CLOSE-BUND-VWVG2027',6:'Amtlicher Textvergleich durchgeführt',7:'Releasezeitraum in AP22B gesondert binden'});
for(const r of checks){
  if(!['R07','R18'].includes(r[0])){r[6]=['R08','R09','R10','R11'].includes(r[0])?'Datumsregel in Modellproben geprüft':'Fachlicher Sollfall bestimmt';r[7]='Produkttest in AP22C. Kein bereits ausgeführter neuer End-to-End-Nachweis.';}
}
checks.push(['R19','SG StPO/BGG/VwVG und SH StPO','2. Januar entscheidungsrelevant','Nomineller Endtag 02.01.2026','Vorschlag: kein definitives Resultat, falls die Kalenderalternativen das Ergebnis ändern. Keine pauschale Sperre anderer Daten.','AP22CLOSE-PROC-SG-POS | AP22CLOSE-PROC-SG-NEG | AP22CLOSE-PROC-SH','Gezielter Benutzerentscheid ausstehend','Nach Entscheid beide Gegenproben implementieren']);
checks.push(['R20','StPO / BGG / VwVG','Nur Behördenebene Bund bekannt','Fehlender massgebender Ort','Kein stiller Bund-/BE-Ersatzkalender. Fehlende Rolle und nötigen Ort erfragen.','AP22CLOSE-BUND-STPO | AP22CLOSE-BUND-BGG | AP22CLOSE-BUND-VWVG','Negativbedingung bestimmt','Resolver- und UI-Gegenprobe in AP22C']);
checks.push(['R21','VwVG','Nichtprofessionelle Vertretung oder Mandatswechsel','Unaufgelöste Ortskollision','Nicht automatisch Partei- und Vertreterkalender vereinigen. Historische Mehrortausnahme nicht als allgemeine Regel ausgeben.','AP22CLOSE-BUND-D6953 | AP22CLOSE-BUND-F10031','Bewusst ausserhalb des Einort-Standardpfads','Passende Hinweise und gezielte Klärung implementieren']);
checks.push(['R22','ATSG / Sozialverfahren','Nicht-BE-Anbindung','Kalenderaktivierung allein','Keine zusätzliche Sozialanbindung durch die vier Bundesprofile. Separate Modellierung und Freigabe, #35 bleibt abgegrenzt.','AP22CLOSE-BUND-STPO','Bestehende Umfangsgrenze','Negativtest gegen stillschweigende Ausweitung']);
for(const r of checks)for(const id of r[5].split(' | '))assert.ok(bySource.has(id),id);
const model={...old,version:'0.2',status:'Abschlussvorlage, gezielter Jan.-2-Grenzentscheid offen',productActivation:false,
  humanApproval:'DEC-2026-028 erteilt',originalMatrixSha256:createHash('sha256').update(original).digest('hex'),
  originalWorkbookSha256:'7e1ec29abc9a08e6c7627ebf745e3af011806f2ab4fe77d4021f294745aa531d',
  counts:{...old.counts,checks:checks.length,formerOpenMappings:73,concreteFormerOpenMappings:69,pendingNarrowLimitations:4},
  profiles:Object.values(prof),matrix,sources,checks};
await fs.mkdir(out,{recursive:true});
await fs.writeFile(`${out}/matrix-data-v02.json`,JSON.stringify(model,null,2)+'\n');
console.log(JSON.stringify({rows:matrix.length,sources:sources.length,checks:checks.length,statusCounts:Object.fromEntries([...new Set(matrix.map(r=>r.status))].map(s=>[s,matrix.filter(r=>r.status===s).length]))}));
