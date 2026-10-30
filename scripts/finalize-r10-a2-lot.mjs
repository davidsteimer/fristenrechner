// SPDX-License-Identifier: AGPL-3.0-only
// Sequential source-lot closure. Integrity checks never grant legal release.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exact,hash} from './archive-r10-u1-acceptance.mjs';
import {inventoryPath,inventorySha256,validateSourcePartition,verifyDescriptors,collectDescriptors,descriptor} from './r10-a2-review-contract.mjs';
import {resolveBundleReferences} from './r10-a2-bundle-references.mjs';
export const lotConfigs={
 'R10-A2-CALENDAR-ACTIVATION':{number:2,parts:[
  ['activation-federal/review.json','f6f888fe099122ab9f23b162980eeea45c1eb05e40dadf0c3cfb0c60b74f8759'],
  ['activation-cantonal/review.json','ff07ee41babdcc419db94f36aafd39c8e8ac4cccfe4d6982057cfc33491d8a59'],
  ['activation-judgments/review.json','81c3530f3b9ee9137ffa8e17c1a3092b534f0c2b639531419e2028028a043b9e']],
  closure:['activation-judgments/companion-norm-closure.json','6f032bc809194ffd6a439c7c4967546f757acddcccc21a21f539441de8d12e95'],previous:'baseline-completion.json',previousSha256:'4bc3f3462517fd461ab834dbdf02dc2ebaf75471a76a8227d3833af7c77d2cd8'},
 'R10-A2-CALENDAR-CATALOG':{number:3,parts:[
  ['catalog-central/review.json','8c718404ff2cdb4714533d0c2d592177679a62da18071cda326cc60a524e88e8'],
  ['catalog-east/review.json','6f2dbdba3a298824d4a4feef5a7ccb41f39d25f5821bd618e139516e1826f4b5'],
  ['catalog-west/review.json','d83741e2eb025ca4404d8ee749c79fdab3bd43090fd847ab4ca1b74b416e38b1'],
  ['catalog-support/review.json','b23b436d7c96659a8099d0d056e5cf4bbe43ad7018d642e8ec990c52214da210']],
  previous:'lot-02-completion.json',previousSha256:'4a8d8fbf69534c66906acdeee400c6aa7176a450b4b2ae7ae204498f45597078'},
 'R10-A2-ADMIN-PRIOR':{number:4,parts:[
  ['admin-prior-gr-ti/review.json','9ecd79a8bef1aeb8769bcb104c300843f8be5a641083c4ab16ad917a7b3962f1'],
  ['admin-prior-ar-lu-zg/review.json','47dc730d88ea79844a5e557503f12a85c0c13ee6c4d7f663ee7dc01fae74c0d8'],
  ['admin-prior-judgments/review.json','9de8a2469ea6ecbe13d9af7b47f381dacf68b8d969afac0c2070e171d62c7c1b']],
  closure:['admin-prior-judgments/companion-norm-closure.json','8d1e1325e377280cfeb9023d7eda97c7d87a9cb45433bf3b27daa487ec825b83'],previous:'lot-03-completion.json',previousSha256:'5f163875a95d53f044bb0da0bf21d9d4a0d4e392b9220a2f2ed623f41eb483ca'},
 'R10-A2-AP23F1':{number:5,parts:[
  ['ap23f1-zh/review.json','d94883d115b95747d85391033cd6ccf6641682cccef7ce03355291b4a2cf4a94'],
  ['ap23f1-sg/review.json','6e9e145f4eef2059e6ef4af987b616e687fbc25beebb9fcc4ed4dc686e1afc41'],
  ['ap23f1-ag-ch/review.json','93f016cd90891098b9093d7bd7ebc8fa8baac90bde147ba1c4b2d9775de4c705']],
  crossPartCompanions:[{requestingSourceIds:['SRC-AP23F1-SG-VRP-20240101','SRC-AP23F1-ZH-VRG-20260701','SRC-AP23F1-ZH-GOG-20260101'],companionSourceId:'SRC-AP23F1-CH-ZPO-20260701',assessment:'Der getrennte heutige CH-ZPO-Bericht beurteilt die konkreten neuen ZH-/AG-/SG-Verwendungen einschliesslich Art. 142/143/145/146/248. SG Art. 60 sowie die gerichtliche ZH-Verweisung werden nur im positiv qualifizierten Verfahrensweg und den gebundenen Normphasen geschlossen. Kein allgemeiner ZPO-Sonderverfahrensimport. Der ursprüngliche SG-Teilbericht mit damaliger Teilabhängigkeit bleibt unverändert.'}],
  previous:'lot-04-completion.json',previousSha256:'43bbc81e54c76145891faa5374448ce742d556de7035b9cad55da215f19d225f'},
 'R10-A2-AP23G1':{number:6,output:'lot-06-completion-r2.json',coordinationCorrection:{supersedes:{path:'outputs/r10-a2-2026-10-28/lot-06-completion.json',byteLength:84133,sha256:'a87c4508e9a2d13b5083dd808fe30eed95de2bda5500501ca9ec19e9c6f4db39'},reason:'Eine neu formulierte Root-Koordinationsnotiz bezeichnete SH Art. 50 Abs. 2 statt Abs. 1 als ZPO-Verweisung. Der native SH-Quellenbericht war korrekt. Die ursprüngliche fehlerhafte Koordinationsnotiz bleibt als überholter Nachweis erhalten, nicht als aktuelle Rechtsaussage.',correctedFinding:'Die ZPO-Verweisung folgt aus SH VRG Art. 50 Abs. 1. Abs. 2 übernimmt nur die ausdrücklich genannten kantonalen Bestimmungen. Keine Änderung der Normberichte, Rechtsdaten, Rechenlogik oder Fallfreigaben.',sourceReleaseApproved:false},parts:[
  ['ap23g1-ur-ch/review.json','c810b0343c7476d935789d147beff5275b25c771d2f6f05822c41b57d89dc95f'],
  ['ap23g1-so-ch/review.json','958ccb2ea76ceaa32825044478fdd36f87bb47fbd8bb478061fa641d9689ed5f'],
  ['ap23g1-sh/review.json','862b890934590dd9041fd5b6607854a7c0c74e891be07c115d29a65c633f3156']],
  crossPartCompanions:[
   {requestingSourceIds:['SRC-AP23G1-UR-VRPV-20160301','SRC-AP23G1-SH-VRG-20251101'],companionSourceId:'SRC-AP23G1-CH-ZPO-20260701',assessment:'Der native G1-ZPO-Bericht beurteilt alle 19 neuen Kanten. UR übernimmt Gerichtsferien sinngemäss, keine allgemeinen ZPO-Zustellungs-/Feiertagsortregeln. SH verweist über Art. 50 Abs. 1 auf die ZPO. Abs. 2 übernimmt nur die dort bezeichneten kantonalen Bestimmungen. Gesetzliche kantonale Dauern und die begrenzten Kollisionssperren bleiben eigenständig. Die ursprünglichen Teilpendenzen werden hiermit konkret geschlossen.'},
   {requestingSourceIds:['SRC-AP23G1-CH-ZPO-20260701'],companionSourceId:'SRC-AP23G1-UR-VRPV-20160301',assessment:'Der heutige vollständige UR-Normbericht bestätigt die konkrete Verweisung, Art.-22-Behandlung, qualifizierte Eröffnung und die fünf abgenommenen UR-Pfade. Der Bundesnormtext allein begründet keine kantonale Anwendbarkeit.'},
   {requestingSourceIds:['SRC-AP23G1-CH-ZPO-20260701'],companionSourceId:'SRC-AP23G1-SH-VRG-20251101',assessment:'Der finale SH-Bericht bestätigt die ergänzende ZPO-Verweisung des Obergerichts, die bezeichneten Abschnitte, die eigenständigen kantonalen Dauern und den begrenzten Praxiszusatz. Die beiden historischen Urteile bleiben in ihrer konkreten Aussage und Kontrolltiefe begrenzt.'},
   {requestingSourceIds:['SRC-AP23G1-CH-BUNDESFEIERTAG-19940701'],companionSourceId:'SRC-AP23G1-SO-VRG-20250801',assessment:'Die elf neuen SR-116-Kanten betreffen SO. § 9 VRG bindet die eigenständige volle Prozessliste. Der Bundesfeiertag ist im Bundeskalender ausdrücklich mitgebunden und nicht als regionaler Zusatztag oder Halbtag eingeführt.'},
   {requestingSourceIds:['SRC-AP23G1-CH-BUNDESFEIERTAG-19940701'],companionSourceId:'SRC-AP23G1-SO-GS201463',assessment:'Der vollständige Änderungsakt GS 2014,63 und sein Inkrafttreten bestätigen den SO-Prozesslistenbezug. Die zwölf kantonalen Regeln und der separat gebundene Bundesfeiertag werden nicht durch freie Vereinigung allgemeiner regionaler Listen ersetzt.'}],
  previous:'lot-05-completion.json',previousSha256:'c33eaa07137a22a390897847c7c7bd0b0bdc0ef820eceb424d95d45d30bec19a'},
 'R10-A2-AP23H1':{number:7,parts:[
  ['ap23h1-ow/review.json','3182c75499eb0247ebdc808f34fae927d2b497f7b5605866085fa4b49694c172'],
  ['ap23h1-nw/review.json','505071b4386dea43a97a0f3a96a3f3a2cdde339dbc9984ea97c317891f1d4c21'],
  ['ap23h1-ch/review.json','9d42a7452f2bf9f523c0b878247031194dbaee0845aec6294d12b178d00204dd']],
  crossPartCompanions:[
   {requestingSourceIds:['SRC-AP23H1-OW-VWVV-20200101','SRC-AP23H1-OW-VGV-20110101'],companionSourceId:'SRC-AP23H1-CH-BGG-20260401',assessment:'Der abschliessende native BGG-Bericht prüft alle sechs OW-Kanten zu Art. 112 Abs. 2. Die kantonalen Begleiter sind VwVV Art. 11 Abs. 2a und VGV Art. 14 Abs. 4. H1-B bleibt eine begrenzte Auslegung zu den beiden Begründungsverlangen, keine Beschwerde ans Bundesgericht und keine Übernahme der gesamten BGG-Fristenordnung.'},
   {requestingSourceIds:['SRC-AP23H1-OW-STVG-20250101','SRC-AP23H1-OW-STVG-20270101','SRC-AP23H1-OW-VGV-20110101'],companionSourceId:'SRC-AP23H1-CH-ZPO-20260701',assessment:'Der native ZPO-Bericht schliesst alle 26 tatsächlichen OW-Kanten an den heutigen und publizierten Fassungen. StVG Art. 64 über VGV Art. 15 bleibt speziell gegenüber der subsidiären VwVG-Verweisung. H1-B und H1-C werden als begrenzte Auslegungen erhalten. NW hat keine entsprechende positive native Bundesnormkante. Die ursprüngliche OW-Teilpendenz ist damit konkret geschlossen.'}],
  previous:'lot-06-completion-r2.json',previousSha256:'385d12c2dc8609533d4ff0b12f808daa6c5383f04fd535a9700cc56dfa09ff86'},
 'R10-A2-AP23I1':{number:8,parts:[
  ['ap23i1-gl/review.json','7f07c06f1c126e47c740ad3216eda30c1fd1c45443f59fa6d9c79e22afba97c7'],
  ['ap23i1-tg-norms/review.json','893eacf5d41cd8bd9463464199a340231af1c0d15c08534d6cdc377a5c5dc688'],
  ['ap23i1-tg-judgments/review.json','7843c7bac15277a72d832d67867ee67e350e1beba94df74276ad544bf216a62e']],
  previous:'lot-07-completion.json',previousSha256:'fc7afd7464a73341266a0edbc63586066235d8016de540cdeb4006c2059c7b35'},
 'R10-A2-AP23J1':{number:9,parts:[
  ['ap23j1-fr/review.json','492d3cd319257c2bab164586030988e841c0f6eb8de531d879168cc3485a9fb9'],
  ['ap23j1-ge/review.json','d4e0c4e9dc40c041e6ccbc4d69c9d0d7071970be71a7e4e22474e8e9cb2623c8'],
  ['ap23j1-ju/review.json','7171157f0a24a6c5a72f5636564f67d3a48f030e4c63369375ca12702d6f7023']],
  previous:'lot-08-completion.json',previousSha256:'bd37c86bc504fd5efa7dc7375ecf8efd4d995ec9c2cb546655d8e2cc528d216c'},
 'R10-A2-AP23K1':{number:10,parts:[
  ['ap23k1-bs-norms/review.json','f4e78ad0fdd941b122ab86b763b3c0f302f2afbdd2ae0325c6ee424710d91fdf'],
  ['ap23k1-bl-norms/review.json','99d98409b1c58179884a1c0f49a3ef6ec103d1e07332c9e75ae4068e4769d1ab'],
  ['ap23k1-judgments/review.json','cfd694ee83cd7cf8ffd8e1fc0a85d13e4391979aaf54eedeb745a6b5c53882d4']],
  previous:'lot-09-completion.json',previousSha256:'e3b798c614e794fd1b8db01eca8a0ee8864237b7ab24d88906f83ebfe47900b4'},
 'R10-A2-AP23L1':{number:11,parts:[
  ['ap23l1-ai/review.json','ce38783b8a2a51d6598a756fa8b8e1d37bb42a72eb4631db9dac2d4919c2373c'],
  ['ap23l1-sz/review.json','d3b744f644f005f22db9e46903d2d7b64f8b01be9c1d54bdd709e8ef3c0b971f'],
  ['ap23l1-judgments/review.json','daa349264c01b37091c38ad62aadabf8542fe1a77fdc24d22e7afaeb48c7e3f9']],
  previous:'lot-10-completion.json',previousSha256:'431c663643e7a8a43e3d3290710b4fb7e2f87131b393759787389aa60e47c67a'},
 'R10-A2-AP23M1':{number:12,parts:[
  ['ap23m1-ne/review.json','aa32bc75cf3bb59112e578d047b855e6be00a06fee9465b1e214c9007b8b6df3'],
  ['ap23m1-vd/review.json','4888e5b337cfce1fe3b1b6d87f8fa24c89023e54f442d00b70c5c6f31b868f3d'],
  ['ap23m1-vs/review.json','c19e57ad84f59b5286e3fb194c659bff668ba628de08517d6476f393845a659b']],
  previous:'lot-11-completion.json',previousSha256:'2b87db4fbbd936f1ffcf941258b8557f176c0995022b7096a8b4ce163ce20590'}
};
export function normalize(native){return{...native,rows:(native.rows??native.sourceRows).map(row=>({...row,method:row.method??native.method,relevantProvisions:row.relevantProvisions??row.actualStatements?.relevantProvisions??row.usedAssertions}))};}
export function resolveCrossPartCompanions(config,reports,parts){
 const locate=id=>{const reportIndex=reports.findIndex(r=>r.rows.some(s=>s.sourceId===id));assert.ok(reportIndex>=0,'Unreviewed cross-part norm '+id);const report=reports[reportIndex],rowIndex=report.rows.findIndex(s=>s.sourceId===id);return{sourceId:id,reviewBinding:{...parts[reportIndex],pointer:'/'+(report.sourceRows?'sourceRows':'rows')+'/'+rowIndex}};};
 return(config.crossPartCompanions??[]).map(link=>{assert.ok(link.requestingSourceIds.length);assert.ok(typeof link.assessment==='string'&&link.assessment.length>60,'Missing concrete cross-part assessment');return{requestingSources:link.requestingSourceIds.map(locate),companion:locate(link.companionSourceId),assessment:link.assessment,status:'closed-for-the-exact-new-uses-in-this-lot',humanApproval:false,sourceReleaseApproved:false};});
}
const prefix='outputs/r10-a2-2026-10-28/';
export async function finalize(lotId,{root=process.cwd(),write=false}={}){
 const config=lotConfigs[lotId];assert.ok(config,'Unknown lot');const inventory=JSON.parse(await exact(root,inventoryPath,{sha256:inventorySha256})),lot=inventory.reviewLots.find(l=>l.id===lotId);assert.ok(lot);
 const previousPath=prefix+config.previous,previousBytes=await exact(root,previousPath,{sha256:config.previousSha256}),previous=JSON.parse(previousBytes);assert.equal(previous.lotId,inventory.reviewLots[config.number-2].id,'Sequential predecessor mismatch');
 const reports=[],parts=[],nativeReports=[];for(const[relative,sha256]of config.parts){const path=prefix+relative,bytes=await exact(root,path,{sha256}),native=JSON.parse(bytes);parts.push({path,byteLength:bytes.length,sha256});nativeReports.push(native);reports.push(normalize(native));}
 let closure,closureBinding;if(config.closure){const path=prefix+config.closure[0],bytes=await exact(root,path,{sha256:config.closure[1]});closure=JSON.parse(bytes);closureBinding={path,byteLength:bytes.length,sha256:config.closure[1]};assert.equal(closure.counts.pendingCompanionDependencies,0);for(const key of ['humanApproval','sourceReleaseApproved'])assert.equal(closure[key],false);const judgments=reports.at(-1).rows;assert.deepEqual(closure.rows.map(r=>r.sourceId).sort(),judgments.map(r=>r.sourceId).sort());for(const row of closure.rows){assert.match(row.normCompanionStatus,/^closed-for-/u);assert.deepEqual(row.referenceLocations,judgments.find(r=>r.sourceId===row.sourceId).referenceLocations);}}
 const partition=validateSourcePartition(inventory,reports,{requiredLotIds:[lotId],resolvedCompanionSourceIds:closure?.rows.map(r=>r.sourceId)??[]});assert.equal(partition.sourceCount,lot.count);assert.equal(partition.referenceCount,inventory.rows.filter(r=>r.ownerLotId===lotId).reduce((n,r)=>n+r.referenceLocations.length,0));
 assert.ok(partition.rows.every(r=>r.ownerLotId===lotId),'Foreign owner source included');
 const bundleReferenceResolution=await resolveBundleReferences(root,nativeReports,parts);
 const bindings=await verifyDescriptors(root,[...parts,await descriptor(root,inventoryPath),{path:previousPath,byteLength:previousBytes.length,sha256:config.previousSha256},...reports.flatMap(collectDescriptors),...(closure?[closureBinding,...collectDescriptors(closure)]:[]),...collectDescriptors(config.coordinationCorrection),...bundleReferenceResolution.bindings]);
 const value={workPackage:'R10-A2',lotId,lotNumber:config.number,checkedOn:'2026-10-28',status:'source-lot-reviewed-awaiting-common-human-acceptance',sourceCount:partition.sourceCount,actualUseCount:partition.referenceCount,newUseCount:partition.newReferenceCount,cumulativeSourceCount:(previous.cumulativeSourceCount??previous.sourceCount)+partition.sourceCount,cumulativeActualUseCount:(previous.cumulativeActualUseCount??previous.actualUseCount)+partition.referenceCount,completeCommonReview:false,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false,registerChanges:false,operatingChanges:false,parts,judgmentNormClosure:closureBinding??null,reviewedSources:partition.rows,bindings};
 if(config.crossPartCompanions)value.crossPartNormClosure=resolveCrossPartCompanions(config,reports,parts);
 if(config.coordinationCorrection)value.coordinationCorrection=config.coordinationCorrection;
 if(bundleReferenceResolution.rows.length)value.bundleReferenceResolution=bundleReferenceResolution.rows;
 const path=prefix+(config.output??('lot-'+String(config.number).padStart(2,'0')+'-completion.json')),encoded=Buffer.from(JSON.stringify(value,null,2)+'\n');if(write)await writeFile(resolve(root,path),encoded,{flag:'wx'});else assert.deepEqual(await exact(root,path),encoded);
 return{status:write?'source-lot-closed':'source-lot-reverified',path,sha256:hash(encoded),byteLength:encoded.length,sourceCount:partition.sourceCount,actualUseCount:partition.referenceCount,newUseCount:partition.newReferenceCount,cumulativeSourceCount:value.cumulativeSourceCount,cumulativeActualUseCount:value.cumulativeActualUseCount,evidenceFiles:bindings.length,completeCommonReview:false,sourceReleaseApproved:false};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,4);assert.ok(['--write','--check'].includes(process.argv[2]));console.log(JSON.stringify(await finalize(process.argv[3],{write:process.argv[2]==='--write'}),null,2));}
