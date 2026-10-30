// SPDX-License-Identifier: AGPL-3.0-only
// Read accepted local contract bytes. This inventory never approves law or data.
import assert from 'node:assert/strict';
import {readFile,readdir,lstat,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
export const coverageConfig=Object.freeze({
 candidate:'data/candidates/2026-10-28-ap23m3',baseline:'data/releases/2026-10-18-mvp-09-approved.1',
 output:'outputs/r10-a1-2026-10-28/coverage.json',table:'outputs/r10-a1-2026-10-28/coverage-table.md',
 administrative:'administrative-procedures/ch-cantonal-administrative-procedures.json',
 social:'social-procedures/ch-social-procedures.json',special:'special-regimes/vrpg-be.json',
 evidence:['docs/fachrecht/abnahme-ap23b.md','docs/fachrecht/abnahme-ap23e1.md','docs/fachrecht/abnahme-ap23e3.md',
  ...['f','g','h','i','j','k','l','m'].flatMap(letter=>[1,3].map(part=>`docs/fachrecht/abnahme-ap23${letter}${part}.md`)),
  'docs/entscheidungen/DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md',
  'docs/entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md','docs/entscheidungen/DEC-2026-042-beschluss.md',
  'docs/betrieb/produktionsbereitstellung-mvp09-2026-10-19.md']
});
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function safeRelative(path){assert.equal(typeof path,'string');assert.ok(path&&!path.startsWith('/')&&!/[:\\\x00-\x1f\x7f]/u.test(path)&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'),'Unsafe relative path');return path;}
export function canonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return'['+value.map(canonical).join(',')+']';return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';}
export const objectHash=value=>sha256(Buffer.from(canonical(value)));
const unique=values=>[...new Set(values)].sort();
function index(rows,key,label){assert.ok(Array.isArray(rows),label);const m=new Map();for(const row of rows){assert.ok(typeof row[key]==='string'&&row[key]);assert.ok(!m.has(row[key]),'Duplicate '+label+' '+row[key]);m.set(row[key],row);}return m;}
async function checkedFile(root,path){safeRelative(path);let current=resolve(root);for(const part of path.split('/')){current=resolve(current,part);assert.equal((await lstat(current)).isSymbolicLink(),false,'Symlink '+path);}assert.ok((await lstat(current)).isFile());const bytes=await readFile(current);return{bytes,descriptor:{path,byteLength:bytes.length,sha256:sha256(bytes)}};}
async function tree(root,path){const rows=[];for(const item of await readdir(resolve(root,path),{withFileTypes:true})){const p=path+'/'+item.name;assert.equal(item.isSymbolicLink(),false);if(item.isDirectory())rows.push(...await tree(root,p));else{assert.ok(item.isFile());rows.push(p);}}return rows.sort();}
export async function loadBundle(root,path){safeRelative(path);const manifestFile=await checkedFile(root,path+'/manifest.json'),manifest=JSON.parse(manifestFile.bytes),documents={},bindings=[manifestFile.descriptor];
 index(manifest.artifacts,'path','artifact');for(const row of manifest.artifacts){safeRelative(row.path);assert.equal(row.mediaType,'application/json');const file=await checkedFile(root,path+'/'+row.path);assert.equal(file.descriptor.sha256,row.sha256,'Artifact hash '+row.path);assert.equal(file.descriptor.byteLength,row.byteLength);documents[row.path]=JSON.parse(file.bytes);bindings.push(file.descriptor);}
 assert.deepEqual(await tree(root,path),bindings.map(r=>r.path).sort(),'Exact bundle inventory');return{path,manifest,documents,bindings};}
function referentialObject(rows,key,id,label){const position=rows.findIndex(row=>row[key]===id);assert.ok(position>=0,label+' '+id);const value=rows[position];return{pointer:'/'+label+'/'+position,sha256:objectHash(value),value};}
function suspensionIds(path){const ids=[];function walk(node){if(Array.isArray(node))node.forEach(walk);else if(node&&typeof node==='object')for(const[k,v]of Object.entries(node)){if(k==='suspensionProfileId'){assert.equal(typeof v,'string');ids.push(v);}else walk(v);}}walk(path);return unique(ids);}
const cantonNames={AG:'Aargau',AI:'Appenzell Innerrhoden',AR:'Appenzell Ausserrhoden',BE:'Bern',BL:'Basel-Landschaft',BS:'Basel-Stadt',FR:'Freiburg',GE:'Genf',GL:'Glarus',GR:'Graubünden',JU:'Jura',LU:'Luzern',NE:'Neuenburg',NW:'Nidwalden',OW:'Obwalden',SG:'St. Gallen',SH:'Schaffhausen',SO:'Solothurn',SZ:'Schwyz',TG:'Thurgau',TI:'Tessin',UR:'Uri',VD:'Waadt',VS:'Wallis',ZG:'Zug',ZH:'Zürich'};
const reservations={
 TI:'TI-O2: konkret kollidierende reine Endverschiebung bleibt gesperrt. Beweiskostenvorschüsse und ungeklärte elektronische Vollzugspfade nicht positiv aufgenommen.',
 GR:'Nur kantonale Stellen. Stufen und gesetzliche/angeordnete Dauer bleiben getrennt. Lokale Ruhetage werden im abgenommenen kantonalen Kontext nicht zusätzlich modelliert.',
 AR:'AR-O1: konkret kollidierende reine Endverschiebung bleibt gesperrt. Der Fünftagesrekurs setzt die qualifizierte Nichtgeldvollstreckung voraus.',
 ZH:'Normphase ab 01.01.2027 getrennt. Keine neue Abruffiktions- oder Kanalstörungsautomatik. Januargrenze bleibt konkrete Kalendergrenze.',
 SG:'SG-O1/G1/G2: ungeklärte Ausnahmebelehrung, erster VRK-Massnahmenrekurs und weitere nicht positiv erfasste Art.-60-Konstellationen bleiben begrenzt.',
 UR:'UR-Art.-22-Hinweis ersetzt keine geklärte Eröffnung. Kantonsweiter Feiertagskern mit konkreter ungeklärter lokaler Endtagsgrenze, keine pauschale örtliche Freigabe.',
 SO:'Eigenständige kantonale Prozessliste, keine Vereinigung regionaler arbeitsrechtlicher Listen und keine Halbtagwirkung.',
 SH:'Administrativer Berchtoldstag mit gesondertem Praxiszusatz. Gerichtliche Kalenderbindung eigenständig. Bestehende SH-/StPO-Behandlung unverändert.',
 OW:'OW-GOG-28-Verwaltungsübertragung und Fünftagesweiterzug sind begrenzt bestätigte Auslegung. Konkret ungeklärte lokale Endtagswirkung bleibt gesperrt.',
 NW:'Aktuelle Ausnahmen einschliesslich einvernehmlicher Fristansetzung qualifizieren. Konkret ungeklärte lokale Endtagswirkung und Endverschiebungskollision bleiben begrenzt.',
 GL:'Instanzbezogenes Übergangsrecht Art.140a aktuell qualifizieren. Verkürzte gesetzliche Art.-89-Frist ist keine freie angeordnete Dauer.',
 TG:'Hinweis und Fortwirkung aktuell qualifizieren. Konkret verkürzte gesetzliche Frist bleibt von fixer Fünftagesfrist und angeordneter Dauer getrennt.',
 FR:'Fassungsphasen bis30.09.2026 und ab01.10.2026 getrennt. Sommerstillstand nur in Kantonsgerichtsangelegenheiten. Historischer Praxisbeleg bleibt ergänzender Spiegel.',
 GE:'Qualifizierte Eröffnung und physischer gewöhnlicher Postempfang getrennt. Art.17Abs.6 nur im ausdrücklich qualifizierten Modus. Sachgebietsausnahmen aktuell wählen.',
 JU:'Eigenständige Eröffnungs-/Begründungsverlangen und späterer Weiterzug getrennt. Verfahrenskalender nicht durch arbeitsrechtlichen Teilbestand ersetzen.',
 BS:'Verwaltung und Gericht verwenden eigenständige Anknüpfungen. Qualifizierter Partei-/Vertretungskanton benötigt aktuelle Fakten, keine automatische Vereinigung.',
 BL:'Verwaltungs- und Gerichtswege einschliesslich ihrer qualifizierten Kurzfristen getrennt. Zusätzliche Jahres-Endverschiebung bleibt konkret gebunden.',
 AI:'Nur positiv bestimmter innerer Landesteil. AI-O1/O2/O3 bleiben begrenzt. Tracking-Eröffnung und tatsächlich längere Belehrung setzen aktuelle Qualifikation voraus.',
 SZ:'Qualifizierte örtliche Sitzbindung einschliesslich Martinstag. SZ-O1 und konkrete Endverschiebungskollision bleiben begrenzt.',
 NE:'Aktuelle Behördenregion beziehungsweise qualifizierter Gerichtssitz Neuchâtel. Zusätzliche jährliche/örtliche Schliessanordnungen bleiben Vorbehalt. LJu/Justitia-Inkraftsetzung gesondert.',
 VD:'Begrenzte gewöhnliche Postautomatik, keine AI-Trackingbedingungen. Dreitagesnachfrist nur nach den ausdrücklich qualifizierten Voraussetzungen.',
 VS:'Verwaltung ohne allgemeinen Stillstand, Gerichtswinter bis5Januar. Qualifiziert längere Belehrung ist kein frei überschreibbarer gesetzlicher Wert.'
};
export function assembleCoverage({candidate,baseline,evidence=[]}){
 const m=candidate.manifest,oldm=baseline.manifest,cat=candidate.documents[coverageConfig.administrative],old=baseline.documents[coverageConfig.administrative];
 assert.equal(m.formatVersion,'17.0.0');assert.equal(m.releaseStatus,'candidate');assert.equal(m.releaseId,'2026-10-28-ap23m3-candidate.1');assert.equal(oldm.formatVersion,'9.0.0');assert.equal(oldm.releaseStatus,'approved');assert.equal(oldm.releaseId,'2026-10-18-mvp-09-approved.1');
 assert.equal(m.compatibility.minimumConsumerFormatVersion,'17.0.0');for(const key of['productionActivation','sourceReleaseApproved','calendarExportEnabled'])assert.equal(m.extensions['steimer.local-reference'][key],false,'Reference boundary '+key);
 assert.equal(cat.formatVersion,'10.0.0');assert.equal(cat.contractStatus,'approved');assert.equal(cat.runtimeActive,false);assert.equal(cat.releaseBinding.status,'candidate');assert.equal(cat.releaseBinding.releaseId,null);assert.equal(cat.releaseBinding.approval,null);assert.deepEqual(cat.releaseBinding.targetComponentRefs,[]);
 const laws=index(cat.laws,'lawId','law'),paths=index(cat.paths,'pathId','path'),policies=index(cat.qualificationPolicies,'pathId','policy'),eligible=index(cat.releaseBinding.pathEligibility,'pathId','eligibility'),holiday=index(cat.holidayBindings,'holidayBindingId','holidayBinding'),suspensions=index(cat.suspensionProfiles,'suspensionProfileId','suspensionProfile');
 assert.equal(laws.size,25);assert.equal(paths.size,245);assert.equal(policies.size,245);assert.equal(eligible.size,245);assert.equal(holiday.size,36);assert.equal(suspensions.size,46);
 assert.deepEqual(unique(cat.laws.map(l=>l.canton)),Object.keys(cantonNames).filter(c=>c!=='BE').sort());
 const artifactIndex=index(m.artifacts,'path','artifact'),oldArtifactIndex=index(oldm.artifacts,'path','baseline artifact'),pathRows=[];
 for(const[pathId,path]of paths){assert.ok(laws.has(path.lawId));const law=laws.get(path.lawId),policy=policies.get(pathId),eligibility=eligible.get(pathId),binding=holiday.get(path.holidayBindingId);
  assert.ok(binding,path.holidayBindingId);assert.equal(binding.lawId,path.lawId);assert.equal(binding.authoritySeatCanton,law.canton);assert.equal(eligibility.status,'candidate');assert.equal(eligibility.pathRevision,path.revision);assert.equal(policy.pathRevision,path.revision);
  const hash=objectHash(path);assert.equal(policy.pathSha256,hash);assert.equal(eligibility.pathSha256,hash);assert.equal(eligibility.qualificationPolicySha256,objectHash(policy));assert.equal(eligibility.holidayBindingId,path.holidayBindingId);assert.equal(eligibility.holidayBindingSha256,objectHash(binding));
  assert.deepEqual(eligibility.caseCoverage,path.temporalBinding.caseCoverage);assert.deepEqual(eligibility.calculationCoverage,path.temporalBinding.calculationCoverage);assert.deepEqual(eligibility.targetComponentRefs,[]);assert.equal(eligibility.sourceReviewRef,null);assert.equal(eligibility.referenceSuiteRef,null);
  for(const key of['caseCoverage','calculationCoverage','sourceCoverage'])assert.deepEqual(path.temporalBinding[key],{from:law.canton==='LU'?'2026-09-27':'2026-08-29',to:'2027-12-31'},'Agreed coverage '+pathId+' '+key);
  const ids=suspensionIds(path);assert.ok(ids.length);for(const id of ids)assert.ok(suspensions.has(id),id);
  for(const ref of(binding.physicalBaseline?.references??binding.physicalSource?.references??[])){assert.ok(artifactIndex.has(ref.path),'Current physical reference '+ref.path);const a=artifactIndex.get(ref.path);assert.equal(a.role,ref.role);assert.equal(a.contentId,ref.contentId);assert.equal(a.sha256,ref.sha256);}
  pathRows.push({canton:law.canton,lawId:path.lawId,pathId,revision:path.revision,researchRef:path.researchRef,contractFamily:Object.hasOwn(path,'contractFamily')?path.contractFamily:null,
   definition:referentialObject(cat.paths,'pathId',pathId,'paths'),qualificationPolicy:referentialObject(cat.qualificationPolicies,'pathId',pathId,'qualificationPolicies'),
   releaseEligibility:referentialObject(cat.releaseBinding.pathEligibility,'pathId',pathId,'releaseBinding/pathEligibility'),holidayBinding:referentialObject(cat.holidayBindings,'holidayBindingId',path.holidayBindingId,'holidayBindings'),
   suspensionProfiles:ids.map(id=>referentialObject(cat.suspensionProfiles,'suspensionProfileId',id,'suspensionProfiles')),
   presentInOperatingBaseline:old.paths.some(p=>p.pathId===pathId),candidateReleaseStatus:'candidate'});
 }
 for(const p of old.paths){assert.deepEqual(paths.get(p.pathId),p,'Preserved operating path '+p.pathId);assert.deepEqual(policies.get(p.pathId),old.qualificationPolicies.find(q=>q.pathId===p.pathId),'Preserved operating qualification '+p.pathId);}
 const social=candidate.documents[coverageConfig.social],oldSocial=baseline.documents[coverageConfig.social],be=candidate.documents['profiles/vrpg-be.json'],oldBe=baseline.documents['profiles/vrpg-be.json'],special=candidate.documents[coverageConfig.special],oldSpecial=baseline.documents[coverageConfig.special];
 assert.equal(social.federalRules.length,44);assert.equal(social.cantonalBindings.length,50);assert.equal(social.releaseEligibility.length,50);assert.deepEqual(social.federalRules,oldSocial.federalRules);assert.deepEqual(social.cantonalBindings,oldSocial.cantonalBindings);assert.deepEqual(be,oldBe);assert.deepEqual(special,oldSpecial);assert.equal(be.rules.length,9);
 assert.deepEqual(unique(social.cantonalBindings.map(b=>b.procedureContextCanton)),['BE']);assert.equal(unique(social.federalRules.map(r=>r.law)).length,11);assert.ok(social.releaseEligibility.every(r=>r.status==='candidate'&&r.approval===null&&r.releaseId===m.releaseId));
 for(const row of [...social.federalRules,...social.cantonalBindings,...social.releaseEligibility])assert.deepEqual(row.caseCoverage,{from:'2026-01-01',to:'2027-12-31'});
 const operatingCantons=unique(['BE',...old.laws.map(l=>l.canton)]);assert.deepEqual(operatingCantons,['AR','BE','GR','LU','TI','ZG']);
 const cantonRows=Object.keys(cantonNames).sort().map(canton=>{const law=cat.laws.find(l=>l.canton===canton),rows=pathRows.filter(p=>p.canton===canton),bs=cat.holidayBindings.filter(b=>b.lawId===law?.lawId);return{
  canton,name:cantonNames[canton],generalModel:canton==='BE'?'existingBernProfile':'administrativeCatalogPathDefinitions',lawId:law?.lawId??'vrpg-be',
  generalAdministrativePathCount:canton==='BE'?null:rows.length,bernProfileRuleCount:canton==='BE'?be.rules.length:null,
  operatingBaseline:operatingCantons.includes(canton),localGeneralIntegrationHumanAccepted:true,candidateReleaseOperational:false,
  stages:unique(rows.flatMap(p=>p.definition.value.stages)),durationKinds:unique(rows.map(p=>p.definition.value.duration.kind)),
  statutoryDayValues:unique(rows.filter(p=>p.definition.value.duration.kind==='statutoryDays').map(p=>p.definition.value.duration.value)).sort((a,b)=>a-b),
  caseCoverage:canton==='BE'?be.validity:rows[0].definition.value.temporalBinding.caseCoverage,
  holidayBindings:bs.map(b=>({holidayBindingId:b.holidayBindingId,anchor:b.anchor,calendarSelection:b.calendarSelection??null,
   physicalBaselineCalendarId:b.physicalBaseline?.calendarId??null,proceduralSupplement:b.proceduralCalendarSupplement??null,localBoundary:b.localBoundary??b.physicalReuse?.localBoundary??null})),
  reservation:reservations[canton]??(canton==='BE'?'Bestehendes allgemeines BE-Profil und getrennte Spezial-/Sozialwege. Nicht modellierte Spezialfälle bleiben abgegrenzt.':'Allgemeine qualifizierte kantonale Wege. Nicht modellierte Spezialfälle bleiben abgegrenzt.'),
  pathIds:rows.map(p=>p.pathId),evidencePointers:canton==='BE'?['profiles/vrpg-be.json']:['administrative-procedures/ch-cantonal-administrative-procedures.json#/laws/'+cat.laws.indexOf(law)]};});
 const components=m.artifacts.map(row=>{const prior=oldArtifactIndex.get(row.path),current=candidate.documents[row.path],previous=baseline.documents[row.path];return{path:row.path,role:row.role,contentId:row.contentId,currentSha256:row.sha256,baselineSha256:prior?.sha256??null,
  rawByteIdentical:prior?prior.sha256===row.sha256:false,added:!prior,changedTopLevelKeys:prior?unique([...Object.keys(current),...Object.keys(previous)]).filter(k=>canonical(current[k])!==canonical(previous[k])):[],
  calendarRulesIdentical:prior&&row.role==='calendar'?canonical(current.rules)===canonical(previous.rules):null};});
 const holidayCatalog=candidate.documents['holiday-catalogs/ch-holiday-catalog.json'],oldHoliday=baseline.documents['holiday-catalogs/ch-holiday-catalog.json'];assert.deepEqual(holidayCatalog.data,oldHoliday.data);
 assert.ok(components.filter(c=>c.role==='calendar'&&!c.added).every(c=>c.calendarRulesIdentical&&c.changedTopLevelKeys.every(k=>k==='projection')));
 return{workPackage:'R10-A1',asOf:'2026-10-28',status:'local-coverage-inventory-verified',localOnly:true,
  sourceReleaseApproved:false,humanAcceptance:false,newLegalReviewPerformed:false,newOnlineFetches:0,calculationPerformed:false,operatingChanges:false,
  candidate:{path:candidate.path,releaseId:m.releaseId,manifestFormat:m.formatVersion,administrativeFormat:cat.formatVersion,status:m.releaseStatus,coverage:m.coverage},
  operatingBaseline:{path:baseline.path,releaseId:oldm.releaseId,manifestFormat:oldm.formatVersion,cantons:operatingCantons,basis:'Existing accepted MVP09 production evidence, not a new online inventory.'},
  counts:{allCantons:26,operatingBaselineCantons:6,localOnlyAcceptedCantons:20,administrativeLaws:25,administrativePaths:245,operatingBaselineAdministrativePaths:old.paths.length,newAdministrativePaths:245-old.paths.length,
   qualificationPolicies:245,releaseEligibilityRows:245,holidayBindings:36,suspensionProfiles:46,calendars:m.calendarIds.length,
   baseHolidayRules:holidayCatalog.data.rules.length,proceduralSupplementRules:holidayCatalog.activation.supplementalRules.length,totalHolidayRules:holidayCatalog.data.rules.length+holidayCatalog.activation.supplementalRules.length,
   baselineCalendars:oldm.calendarIds.length,baselineBaseHolidayRules:oldHoliday.data.rules.length,baselineProceduralSupplementRules:oldHoliday.activation.supplementalRules.length,baselineTotalHolidayRules:oldHoliday.data.rules.length+oldHoliday.activation.supplementalRules.length,
   bernProfileRules:9,socialLaws:11,socialRules:44,bernSocialBindings:50,socialEligibilityRows:50,
   specialRegimes:special.regimes.length,specialDeadlineDefinitions:special.deadlineDefinitions.length,administrativeExclusions:cat.excludedPaths.length,
   candidateFiles:candidate.bindings.length,baselineFiles:baseline.bindings.length,byteIdenticalOldComponents:components.filter(c=>c.rawByteIdentical).length,addedComponents:components.filter(c=>c.added).length},
  preserved:{oldAdministrativePaths:true,oldQualificationPolicies:true,bernProfile:true,specialCatalog:true,socialFederalRules:true,bernSocialBindings:true,physicalHolidayCatalogData:true,oldCalendarRules:true},
  limits:{productLanguages:['de','fr'],italianAndRumantschIssue49:'separateNotAutomaticallyReleased',dateHeightIssue50:'alreadyAcceptedMVP09RegressionOnly',independentMunicipalLaw:'excluded',outsideBernSocialRelease:false,
   calendarManifestCoverage:'Calendar availability does not extend path, norm, source or release eligibility windows.',generalAdministrativeCoverage:'Qualified cantonal general procedures only, not all special law or every authority/receipt context.',
   normTimelines:'Actual bound timeline and norm-version intervals are retained per path. They are not a new confirmation of current or future law.',globalReferenceOnlyCandidate:true},
  cantons:cantonRows,paths:pathRows,bernProfile:{definition:be,sha256:objectHash(be)},social:{ruleIds:social.federalRules.map(r=>r.ruleId),bindingIds:social.cantonalBindings.map(b=>b.bindingId),lawRuleCounts:Object.fromEntries(unique(social.federalRules.map(r=>r.law)).map(law=>[law,social.federalRules.filter(r=>r.law===law).length])),caseCoverage:{from:'2026-01-01',to:'2027-12-31'},allCandidateReleaseEligibility:true},
  administrativeExcludedPaths:cat.excludedPaths,components,evidence,bindings:[...candidate.bindings,...baseline.bindings]};
}
const stageNames={administration:'Verwaltung',administrativeAppeal:'Verwaltungsbeschwerde',court:'Gericht'};
export function coverageTable(report){const lines=['# R10-A1 Abdeckungsbestand aller Kantone','','Lokaler Vertragsbestand, keine neue Rechtsauskunft oder Betriebsfreigabe. «MVP09» bezeichnet den dokumentierten Ausgangsbetrieb. Sämtliche Format-17-Releasebindungen bleiben Kandidat.','','| Kanton | Allgemeiner Bestand | Stufen | Gesetzliche Tageswerte | Fallfenster | Ausgangsbetrieb |','| --- | --- | --- | --- | --- | --- |'];
 for(const row of report.cantons){const interval=row.canton==='BE'?`${row.caseCoverage.dataValidFrom} bis offen, vorbehalten Spezialfenster`:`${row.caseCoverage.from} bis ${row.caseCoverage.to}`;
 lines.push(`| ${row.name} (${row.canton}) | ${row.canton==='BE'?'Eigenes Profil, neun Regeln':row.generalAdministrativePathCount+' Pfaddefinitionen'} | ${row.stages.map(s=>stageNames[s]??s).join(', ')||'Bestehendes allgemeines Profil'} | ${row.statutoryDayValues.join(', ')||'Keine neue feste Dauer aus diesem Inventar'} | ${interval} | ${row.operatingBaseline?'MVP09':'Nur lokal abgenommen'} |`);}
 lines.push('','Die gesetzlichen Werte sind kein frei wählbares Menü für beliebige Fälle. Angeordnete, konkretisierte und wirksam längere Tagesfristen bleiben getrennte Dauerarten. Die vollständigen Fallqualifikationen, Eröffnungsregeln, Stillstandsauswahlen, aktuellen Feiertagsbindungen und Normphasen stehen pro Pfad in coverage.json. Bern wird nicht als erfundene zusätzliche Katalogpfadzahl mit den 245 ausserbernischen Definitionen addiert.','');return lines.join('\n');}
export async function inventoryCoverage({root=process.cwd(),write=false,check=false}={}){root=resolve(root);assert.ok(!(write&&check));const candidate=await loadBundle(root,coverageConfig.candidate),baseline=await loadBundle(root,coverageConfig.baseline),evidence=[];
 for(const path of coverageConfig.evidence){const file=await checkedFile(root,path);evidence.push(file.descriptor);}const report=assembleCoverage({candidate,baseline,evidence}),text=JSON.stringify(report,null,2)+'\n',table=coverageTable(report);
 if(write){await mkdir(resolve(root,dirname(coverageConfig.output)),{recursive:true});await writeFile(resolve(root,coverageConfig.output),text,{flag:'wx'});await writeFile(resolve(root,coverageConfig.table),table,{flag:'wx'});}
 if(check){assert.equal((await readFile(resolve(root,coverageConfig.output))).toString(),text,'Coverage report differs');assert.equal((await readFile(resolve(root,coverageConfig.table))).toString(),table,'Coverage table differs');}
 return report;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert.equal(process.argv.length,3,'Select exactly --write or --check');assert.ok(['--write','--check'].includes(process.argv[2]));const report=await inventoryCoverage({write:process.argv[2]==='--write',check:process.argv[2]==='--check'});console.log(JSON.stringify({status:report.status,counts:report.counts,sourceReleaseApproved:false,operatingChanges:false},null,2));}
