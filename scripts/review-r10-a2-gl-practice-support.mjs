// SPDX-License-Identifier: AGPL-3.0-only
// Supplemental historical reading, not three more canonical source IDs.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {exact,hash} from './archive-r10-u1-acceptance.mjs';
import {descriptor,verifyDescriptors} from './r10-a2-review-contract.mjs';
const prefix='outputs/ap23i1-2026-10-22/sources/gl/';
const files=[
 ['practice-fulltext-0.json',52928,'f9a941005d23b6f31874058539a1de15a5dc20d9a5a9f0b3d4d1e4c20ddeae8b'],
 ['practice-fulltext-1.json',67648,'74fe60aad322ea34204a9c737eef92bcd77de82ea899f1e42148de678bc4a7be'],
 ['practice-entscheidsuche-fulltext-2017.json',55950,'8042384efe59fee2b7078e9ccf91eadd7a086051aea478aa308f24d05f5bac5c']];
const out='outputs/r10-a2-2026-10-28/ap23i1-gl-support/practice-reuse.json';
const section=(text,start,end)=>{const a=text.indexOf(start);assert.ok(a>=0,start);const b=text.indexOf(end,a+start.length);assert.ok(b>a,end);return text.slice(a,b);};
const docs=[];for(const[name,byteLength,sha256]of files)docs.push(JSON.parse(await exact(process.cwd(),prefix+name,{byteLength,sha256})));
assert.equal(docs[0].structuredContent.docket_number,'VG.2016.00090');assert.equal(docs[0].structuredContent.decision_date,'2017-04-13');
assert.equal(docs[1].structuredContent.docket_number,'VG.2025.00056');assert.equal(docs[1].structuredContent.decision_date,'2025-06-24');
const old=section(docs[0].structuredContent.full_text,'\nII.\n','\n2.\n');
const recent=docs[1].structuredContent.full_text,interim=section(recent,'\nII.\n','\n2.\n'),effects=section(recent,'\n5.\n','\n6.\n');
const mirror=JSON.parse(docs[2].content[0].text);assert.equal(mirror.id,'GL_VG_001_VG-2016-00090_2017-04-13');
for(const text of [old,mirror.text]){assert.match(text,/Rechtsmittelfrist/u);assert.match(text,/angesetzten Fristen/u);assert.match(text,/13\. April 2017|ständigen Praxis/u);}
assert.match(interim,/Art\.\s*86/u);assert.match(interim,/nicht\s+wiedergutzumachenden Nachteil/u);assert.match(effects,/keine aufschiebende Wirkung/u);
const bindings=await verifyDescriptors(process.cwd(),[...files.map(([name,byteLength,sha256])=>({path:prefix+name,byteLength,sha256})),await descriptor(process.cwd(),prefix+'source-bindings.json'),await descriptor(process.cwd(),'docs/fachrecht/quellenpruefung-ap23i1.md'),await descriptor(process.cwd(),'docs/fachrecht/abnahme-ap23i1.md')]);
const report={workPackage:'R10-A2',ownerLotId:'R10-A2-AP23I1',checkedOn:'2026-10-28',status:'supplemental-historical-practice-read-for-the-GL-owner-report',canonicalSourceIdsAdded:[],newReferenceLocationsAdded:[],supportsSourceId:'SRC-AP23I1-GL-VRG-20230101',originalCheckedOn:'2026-10-22',method:'Erneute lokale Identitäts- und Erwägungslektüre der ursprünglich gesicherten Volltextspiegel. Keine neuen Onlineabrufe, keine neue oder erschöpfende Rechtsprechungssuche, keine neue kanonische Kennung oder positive Fallfreigabe.',decisions:[{docket:'VG.2016.00090',date:'2017-04-13',providers:['Swiss Caselaw/OpenCaseLaw','Entscheidsuche'],pinpoint:'E. II/1.1–1.3',reading:old,assessment:'Historisch tragend für die Einlegungsfrist als Teil des streitigen Verfahrens und den damaligen Stillstand. Der damalige Art. 90 erfasste auch angesetzte Fristen. Gerade diese alte Reichweite darf nicht unverändert auf Neufälle unter dem seit 01.02.2022 auf gesetzliche Fristen begrenzten Recht übertragen werden. Gegenprüfung von heutigem Art. 90 und instanzbezogenem Art. 140a erfolgt im nativen GL-Normbericht.'},{docket:'VG.2025.00056',date:'2025-06-24',providers:['Swiss Caselaw/OpenCaseLaw'],pinpoint:'E. II/1.1–1.3 und II/5.1–5.2',reading:interim+'\n'+effects,assessment:'Nur ergänzende Zwischenentscheid- und Suspensiveffektabgrenzung. Kein tragender Ferien-, Fristverkürzungs- oder allgemeiner Fristenberechnungsentscheid. Der konkrete fremdenpolizeiliche Sachverhalt begründet keine positive Ausländerrechtssonderfreigabe oder allgemeine Dringlichkeitsausnahme.'}],remainingBoundary:'Der ergänzende Praxisbeleg ist nur zusammen mit der heutigen Norm- und Verwendungsprüfung der nativen GL-Quellenzeile zu lesen. Die dortigen Fachauslegungen und offenen Kollisions-/Übergangsgrenzen werden nicht durch historische Praxis scheinbar erledigt.',freshOnlineRetrievals:0,humanApproval:false,sourceReleaseApproved:false,dataPromotionApproved:false,productChanges:false,registerChanges:false,operatingChanges:false,bindings};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');assert.ok(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write'){await mkdir(resolve(out,'..'),{recursive:true});await writeFile(resolve(out),bytes,{flag:'wx'});}else assert.deepEqual(await exact(process.cwd(),out),bytes);
console.log(JSON.stringify({path:out,byteLength:bytes.length,sha256:hash(bytes),historicalDecisions:2,canonicalSourceIdsAdded:0,freshOnlineRetrievals:0,sourceReleaseApproved:false},null,2));
