// SPDX-License-Identifier: AGPL-3.0-only
// Initial seed for the AP18A review workbook. Not an application data provider.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

export const BASELINE = '2026-08-31-mvp-03-approved.1';
export const REVIEW_DATE = '2026-09-13';
export const HOLIDAY_TYPES = ['fixedMonthDay', 'easterOffsetDays', 'nthWeekdayOfMonth'];
export const WORK_STATUSES = ['approved', 'open', 'blocked'];

export async function createPilotModel(root) {
  const base = path.join(root, 'data/releases', BASELINE);
  const read = async f => JSON.parse(await fs.readFile(path.join(base, f), 'utf8'));
  const ch = await read('calendars/ch-federal-calendar.json');
  const be = await read('calendars/be-public-holidays.json');
  const cantons = [
    ['ZH','Zürich','Zurich'],['BE','Bern','Berne'],['LU','Luzern','Lucerne'],
    ['UR','Uri','Uri'],['SZ','Schwyz','Schwytz'],['OW','Obwalden','Obwald'],
    ['NW','Nidwalden','Nidwald'],['GL','Glarus','Glaris'],['ZG','Zug','Zoug'],
    ['FR','Freiburg','Fribourg'],['SO','Solothurn','Soleure'],['BS','Basel-Stadt','Bâle-Ville'],
    ['BL','Basel-Landschaft','Bâle-Campagne'],['SH','Schaffhausen','Schaffhouse'],
    ['AR','Appenzell Ausserrhoden','Appenzell Rhodes-Extérieures'],
    ['AI','Appenzell Innerrhoden','Appenzell Rhodes-Intérieures'],['SG','St. Gallen','Saint-Gall'],
    ['GR','Graubünden','Grisons'],['AG','Aargau','Argovie'],['TG','Thurgau','Thurgovie'],
    ['TI','Tessin','Tessin'],['VD','Waadt','Vaud'],['VS','Wallis','Valais'],
    ['NE','Neuenburg','Neuchâtel'],['GE','Genf','Genève'],['JU','Jura','Jura']
  ];
  const jurisdictions = [['CH','Bund','Confédération',null,'Referenzpilot','approved'],
    ...cantons.map(([c,de,fr]) => [`CH-${c}`,de,fr,'CH',c === 'BE' ? 'Referenzpilot' : c === 'AG' ? 'Strukturpilot, Teilumfang' : 'Nicht erhoben',c === 'BE' ? 'approved' : 'open'])];
  const scopes = [
    ['CH-ALL','CH','Bundesgebiet','National','Bundesgebiet','SRC-BUNDESFEIERTAG-19940701','Art. 1','approved','1994-07-01',null],
    ['BE-ALL','CH-BE','Kanton Bern','Kanton','Gesamtes Kantonsgebiet','SRC-FRG-BE-20210401','Art. 2 Abs. 1','approved','2026-01-01',null],
    ['AG-ARG-BADEN','CH-AG','Bezirk Baden ohne Bergdietikon','Bezirksausnahme','Nur § 6 Abs. 1 Bst. b Ziff. 2 EG ArR. Kein allgemeiner Fristenkalender.','SRC-AG-EGARR-20250901','§ 6 Abs. 1 Bst. b Ziff. 2','open','2026-01-01',null],
    ['AG-ARG-BERGDIETIKON','CH-AG','Gemeinde Bergdietikon','Gemeinde','Nur § 6 Abs. 1 Bst. b Ziff. 1 EG ArR. Kantonale Rechtsgrundlage.','SRC-AG-EGARR-20250901','§ 6 Abs. 1 Bst. b Ziff. 1','open','2026-01-01',null],
    ['AG-ZPO-ALL','CH-AG','Aargau, prozessuale Zuordnung','Kanton','§ 21 EG ZPO getrennt vom Arbeitsrecht. Anwendungszuordnung offen.','SRC-AG-EGZPO','§ 21','open','2026-01-01',null]
  ];
  const sources = [
    [ch.sources[0].sourceId,'CH',ch.sources[0].title,'SR 116, Art. 1',ch.sources[0].url,'1994-07-01',REVIEW_DATE,'Originaltext geöffnet','approved',BASELINE],
    [be.sources[0].sourceId,'CH-BE',be.sources[0].title,'BSG 555.1, Art. 2',be.sources[0].url,'2021-04-01',REVIEW_DATE,'Originaltext geöffnet','approved',BASELINE],
    ['SRC-AG-EGARR-20250901','CH-AG','Einführungsgesetz zum Arbeitsrecht','SAR 961.200, § 6','https://gesetzessammlungen.ag.ch/app/de/texts_of_law/961.200','2025-09-01',REVIEW_DATE,'Amtliche Fassung geprüft, Fachabnahme offen','open',null],
    ['SRC-AG-EGZPO','CH-AG','Einführungsgesetz zur Schweizerischen Zivilprozessordnung','SAR 221.200, § 21 Abs. 1','https://gesetzessammlungen.ag.ch/app/de/texts_of_law/221.200','2022-01-01',REVIEW_DATE,'Verfahrensbezogene Abgrenzung, Fachabnahme offen','open',null],
    ['SRC-BJ-FRISTENHINWEISE-20121217','CH','Hinweise zum Verzeichnis gesetzlicher Feiertage und gleichgestellter Tage','Ziff. 1–3, Stand 17.12.2012','https://www.bj.admin.ch/dam/bj/de/data/publiservice/service/zivilprozessrecht/hinweise-kant-feiertage-d.pdf.download.pdf/hinweise-kant-feiertage-d.pdf','2012-12-17',REVIEW_DATE,'Methodische Abgrenzung, keine aktuelle Feiertagsvollerhebung','open',null]
  ];
  const rules = [...ch.rules,...be.rules].filter(r=>r.effect.type === 'holiday').map(r=>({
    id:r.ruleId,jurisdiction:r.jurisdiction.code === 'CH' ? 'CH' : `CH-${r.jurisdiction.code}`,
    scope:r.jurisdiction.code === 'CH' ? 'CH-ALL' : 'BE-ALL',de:r.labels.de,fr:r.labels.fr,
    category:'publicHoliday',calculation:structuredClone(r.calculation),from:r.validity.from,to:r.validity.to,
    source:r.sourceRefs[0].sourceId,locator:r.sourceRefs[0].locator,status:'approved',
    approvalBasis:BASELINE,priority:r.priority,action:'add',target:null,
    exportClass:'referenceOnly',reference:r
  }));
  // Minimal spatial counterexample. Full AG holiday coverage is deliberately absent.
  rules.push({id:'AG-WORK-HOL-CORPUS-CHRISTI',jurisdiction:'CH-AG',scope:'AG-ARG-BADEN',
    de:'Fronleichnam',fr:'Fête-Dieu',category:'labourLawHoliday',
    calculation:{type:'easterOffsetDays',offsetDays:60},from:'2026-01-01',to:null,
    source:'SRC-AG-EGARR-20250901',locator:'§ 6 Abs. 1 Bst. b Ziff. 2',status:'open',
    approvalBasis:null,priority:100,action:'add',target:null,exportClass:'blockedScope',reference:null});
  rules.push({id:'AG-WORK-HOL-BERCHTOLD',jurisdiction:'CH-AG',scope:'AG-ARG-BERGDIETIKON',
    de:'Berchtoldstag',fr:'Saint-Berchtold',category:'labourLawHoliday',
    calculation:{type:'fixedMonthDay',month:1,day:2},from:'2026-01-01',to:null,
    source:'SRC-AG-EGARR-20250901',locator:'§ 6 Abs. 1 Bst. b Ziff. 1',status:'open',
    approvalBasis:null,priority:100,action:'add',target:null,exportClass:'blockedScope',reference:null});
  rules.push({id:'AG-PROC-DAY-ALL-SAINTS',jurisdiction:'CH-AG',scope:'AG-ZPO-ALL',
    de:'Allerheiligen',fr:'Toussaint',category:'proceduralEquivalentDay',
    calculation:{type:'fixedMonthDay',month:11,day:1},from:'2026-01-01',to:null,
    source:'SRC-AG-EGZPO',locator:'§ 21',status:'open',approvalBasis:null,
    priority:100,action:'add',target:null,exportClass:'blockedEffect',reference:null});
  const mappings = [
    ['MAP-BE-PARITY','BE-ALL','publicHoliday','MVP-0.3-Referenzprofile','Bestehende Anknüpfung unverändert, keine neue Profilfreigabe','Referenzrelease / jeweiliges Rechtsprofil','approved',BASELINE],
    ['MAP-CH-PARITY','CH-ALL','publicHoliday','MVP-0.3-Referenzprofile','Nur Bundesfeiertag vererben, keine kantonale Vollständigkeit ableiten','SR 116 Art. 1 / Referenzrelease','approved',BASELINE],
    ['MAP-AG-LABOUR','AG-ARG-BADEN','labourLawHoliday','Arbeitsrecht, nicht pauschal Fristenrecht','Keine automatische Übernahme in Fristenrechner','SAR 961.200 § 6 Abs. 1 Bst. b','blocked',null],
    ['MAP-AG-ZPO','AG-ZPO-ALL','proceduralEquivalentDay','EG ZPO / konkrete Bundesprofile noch prüfen','Genaue Verfahrensanknüpfung vor Export fachlich abnehmen','SAR 221.200 § 21','open',null]
  ];
  const reviews = [
    ['AP18A-20260913-CH','SRC-BUNDESFEIERTAG-19940701','newScope',REVIEW_DATE,'unchanged',BASELINE,'Art. 1 und aktuelle Fassung im Original verglichen','candidate','David Steimer','Codex','Prüfereignis fachlich abnehmen'],
    ['AP18A-20260913-BE','SRC-FRG-BE-20210401','newScope',REVIEW_DATE,'unchanged',BASELINE,'Art. 2 und aktuelle Fassung im Original verglichen','candidate','David Steimer','Codex','Prüfereignis fachlich abnehmen'],
    ['AP18A-20260913-AG','SRC-AG-EGARR-20250901','newScope',REVIEW_DATE,'unclear',null,'Regionale Arbeitsfeiertage sind kein generischer Fristenkalender','candidate','David Steimer','Codex','AG-Fristenanknüpfung separat prüfen'],
    ['AP18A-20260913-AG-ZPO','SRC-AG-EGZPO','newScope',REVIEW_DATE,'unclear',null,'Prozessuale Liste getrennt von regionalem Arbeitsrecht führen','candidate','David Steimer','Codex','Anwendungsbereich und Quellenstand abnehmen']
  ];
  const files = ['manifest.json','calendars/ch-federal-calendar.json','calendars/be-public-holidays.json'];
  const hashes = {};
  for (const f of files) hashes[f] = createHash('sha256').update(await fs.readFile(path.join(base,f))).digest('hex');
  return {contractVersion:'0.1.0',kind:'reviewWorkbookSeed',status:'candidate',baseline:BASELINE,
    createdOn:REVIEW_DATE,years:{from:2026,to:2028,selected:2027},jurisdictions,scopes,sources,rules,mappings,reviews,hashes,
    preservedSuspensionRules:ch.rules.filter(r=>r.effect.type==='suspensionPeriod').map(r=>r.ruleId)};
}

export function easterDate(year) {
  if(!Number.isInteger(year)||year<1583||year>9999)throw new Error('Invalid Gregorian year');
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
  const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const n=h+l-7*m+114;
  return new Date(Date.UTC(year,Math.floor(n/31)-1,n%31+1));
}
export function ruleDate(rule, year) {
  if(!Number.isInteger(year)||year<1583||year>9999)throw new Error('Invalid Gregorian year');
  const c=rule.calculation;
  assertCalculation(c);
  assertValidity(rule.from,rule.to);
  let d;
  if(c.type==='fixedMonthDay') {
    d=new Date(Date.UTC(year,c.month-1,c.day));
    if(d.getUTCMonth()!==c.month-1)throw new Error('Invalid fixed date in year');
  }
  else if(c.type==='easterOffsetDays') {d=easterDate(year);d.setUTCDate(d.getUTCDate()+c.offsetDays);}
  else if(c.type==='nthWeekdayOfMonth') {
    const first=new Date(Date.UTC(year,c.month-1,1));
    const iso=first.getUTCDay()||7;
    d=new Date(Date.UTC(year,c.month-1,1+(c.isoWeekday-iso+7)%7+7*(c.occurrence-1)));
    if(d.getUTCMonth()!==c.month-1)throw new Error('Weekday occurrence outside month');
  } else throw new Error(`Unsupported calculation ${c.type}`);
  const iso=d.toISOString().slice(0,10);
  return iso<rule.from || (rule.to && iso>rule.to) ? null : iso;
}
function assertDate(s){
  if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))throw new Error('Invalid ISO date');
  const parsed=new Date(`${s}T00:00:00Z`);
  if(Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==s)throw new Error('Invalid ISO date');
}
function assertValidity(from,to){assertDate(from);if(to!==null){assertDate(to);if(to<from)throw new Error('Reversed validity');}}
function assertCalculation(c){
  const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
  if(!HOLIDAY_TYPES.includes(c.type))throw new Error('Unsupported calculation');
  if(c.type==='fixedMonthDay'){
    if(!integer(c.month,1,12)||!integer(c.day,1,31))throw new Error('Invalid fixed parameters');
    if(new Date(Date.UTC(2000,c.month-1,c.day)).getUTCMonth()!==c.month-1)throw new Error('Invalid fixed date');
  }
  if(c.type==='easterOffsetDays'&&!integer(c.offsetDays,-366,366))throw new Error('Invalid Easter offset');
  if(c.type==='nthWeekdayOfMonth'&&(!integer(c.month,1,12)||!integer(c.isoWeekday,1,7)||!integer(c.occurrence,1,5)))throw new Error('Invalid weekday parameters');
}
// The default remains the historical seed contract. New workbook contracts pass
// their explicit calculation validator without changing legacy date semantics.
export function validateModel(m, { holidayTypes = HOLIDAY_TYPES, calculationValidator = assertCalculation } = {}) {
  const unique=(rows,key,label)=>{const seen=new Set();for(const r of rows){const id=key(r);if(seen.has(id))throw new Error(`Duplicate ${label}: ${id}`);seen.add(id);}return seen;};
  const js=unique(m.jurisdictions,r=>r[0],'jurisdiction');
  const ss=unique(m.sources,r=>r[0],'source');
  const scopes=unique(m.scopes,r=>r[0],'scope');
  const ids=unique(m.rules,r=>r.id,'rule');
  const expected=['CH',...'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ').map(c=>`CH-${c}`)];
  if(js.size!==27||expected.some(c=>!js.has(c)))throw new Error('Expected CH and 26 cantons');
  if(m.baseline!==BASELINE || m.status!=='candidate' || m.kind!=='reviewWorkbookSeed')throw new Error('Invalid workbook baseline or status');
  const checkStatus=(v)=>{if(!WORK_STATUSES.includes(v))throw new Error('Unknown work status');};
  for(const j of m.jurisdictions){checkStatus(j[5]);if(j[0]!=='CH'&&j[3]!=='CH')throw new Error('Invalid jurisdiction parent');}
  for(const source of m.sources){
    checkStatus(source[8]);if(!js.has(source[1])||!source[3])throw new Error('Invalid source');
    const url=new URL(source[4]);if(url.protocol!=='https:')throw new Error('Non-HTTPS source');
    if(source[8]==='approved'&&source[9]!==BASELINE)throw new Error('Invalid source approval');
  }
  for(const scope of m.scopes){checkStatus(scope[7]);if(!ss.has(scope[5])||!js.has(scope[1]))throw new Error('Invalid scope reference');assertValidity(scope[8],scope[9]);}
  unique(m.mappings,r=>r[0],'mapping');
  for(const mapping of m.mappings){checkStatus(mapping[6]);if(!scopes.has(mapping[1]))throw new Error('Invalid mapping scope');}
  unique(m.reviews,r=>r[0],'review');
  for(const review of m.reviews){
    if(!ss.has(review[1]))throw new Error('Invalid review source');
    if(!['candidate','approved','withdrawn'].includes(review[7]))throw new Error('Invalid event status');
    if(!['unchanged','changed','unclear','unavailable'].includes(review[4]))throw new Error('Invalid review outcome');
    assertDate(review[3]);
    if(['changed','unclear','unavailable'].includes(review[4])&&!review[10])throw new Error('Missing follow-up');
  }
  for(const r of m.rules){
    if(!js.has(r.jurisdiction)||!scopes.has(r.scope)||!ss.has(r.source))throw new Error(`Missing reference: ${r.id}`);
    if(!WORK_STATUSES.includes(r.status))throw new Error(`Invalid status: ${r.id}`);
    if(!holidayTypes.includes(r.calculation.type))throw new Error(`Unsupported calculation: ${r.id}`);
    if(!r.locator || !r.de || !r.fr)throw new Error(`Incomplete rule: ${r.id}`);
    if(!['publicHoliday','labourLawHoliday','proceduralEquivalentDay'].includes(r.category))throw new Error('Unknown category');
    if(m.scopes.find(s=>s[0]===r.scope)[1]!==r.jurisdiction)throw new Error('Scope jurisdiction mismatch');
    if(!['referenceOnly','blockedScope','blockedEffect'].includes(r.exportClass))throw new Error('Unknown export class');
    if(r.status==='approved' && (r.approvalBasis!==BASELINE||!r.reference||r.exportClass!=='referenceOnly'))throw new Error(`Missing approval basis: ${r.id}`);
    if(!Number.isInteger(r.priority)||r.priority<0||r.priority>10000)throw new Error('Invalid priority');
    if(r.action!=='add')throw new Error(`Unimplemented rule action: ${r.id}`);
    if(r.target && !ids.has(r.target))throw new Error(`Unknown target: ${r.id}`);
    if(r.exportClass==='referenceOnly' && (!r.reference || r.category!=='publicHoliday' || !['CH-ALL','BE-ALL'].includes(r.scope)))throw new Error(`Lossy v2 representation: ${r.id}`);
    if(r.category!=='publicHoliday' && r.exportClass==='referenceOnly')throw new Error(`Unsupported legal effect: ${r.id}`);
    assertValidity(r.from,r.to);calculationValidator(r.calculation);
    if(r.reference){
      const ref=r.reference;
      if(ref.ruleId!==r.id||!isDeepStrictEqual(ref.calculation,r.calculation)||ref.validity.from!==r.from||ref.validity.to!==r.to||ref.labels.de!==r.de||ref.labels.fr!==r.fr||ref.priority!==r.priority||ref.sourceRefs.length!==1||ref.sourceRefs[0].sourceId!==r.source||ref.sourceRefs[0].locator!==r.locator)throw new Error('Changed reference must lose inherited approval');
    }
  }
  return true;
}
