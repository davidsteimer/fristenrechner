// SPDX-License-Identifier: AGPL-3.0-only
// C1 data contract only. Parsing/projecting never authorises a legal calculation.
import schema from '../../schemas/implementation/ap22c1/holiday-catalog-v2.schema.json';
import { assertSchema } from './schemaContract';
import { assertHolidayCatalog, assertHolidayCatalogProjection, HolidayCatalogError } from './holidayCatalog';
import { canonicalSocialJson, rawSha256Text } from './socialCatalog';
import { parseIsoDate } from './date';
import type { CalendarRule, CalendarRuleSet, HolidayCalendarRule } from './calendarRuleTypes';
import type { HolidayCatalog } from './holidayCatalogTypes';
import type { CalendarProjectionRecipe, HolidayCatalogV2 } from './holidayActivationTypes';

const PREFIX = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/';
const PROFILES = ['stpo', 'zpo', 'bgg', 'vwvg'] as const;
const REGIONAL = ['AI-RTG-INNER-ADDITIONAL', 'NE-LANDERON-ADDITIONAL'];
const CANTONS = 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'.split(' ');
function fail(message: string): never { throw new HolidayCatalogError('holidayCatalog.invalidActivation', message); }
function equal(actual: unknown, expected: unknown, label: string): void {
  if (canonicalSocialJson(actual) !== canonicalSocialJson(expected)) fail(`Abweichender Aktivierungsvertrag: ${label}`);
}
const sorted = (items: readonly string[]): string[] => [...new Set(items)].sort();
function index<T extends { readonly id: string }>(items: readonly T[], label: string): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) { if (result.has(item.id)) fail(`Doppelte ${label}: ${item.id}`); result.set(item.id, item); }
  return result;
}
function get<T>(items: ReadonlyMap<string, T>, id: string, label: string): T {
  const value = items.get(id); if (!value) fail(`Fehlende ${label}: ${id}`); return value;
}
function legacyView(catalog: HolidayCatalogV2): HolidayCatalog {
  const { activation: _activation, ...archive } = catalog;
  return { ...archive, $schema: PREFIX + 'holiday-catalog-v1.schema.json', formatVersion: '1.0.0' };
}
const rename = (id: string): string => id === 'SO-PROCEDURAL-DRAFT' ? 'SO-PROCEDURAL-ALL' : id;

/** Strict local schema plus referential/terminal semantics, no procedure resolver. */
export function assertHolidayCatalogV2(value: unknown): asserts value is HolidayCatalogV2 {
  assertSchema(value, schema);
  const catalog = value as HolidayCatalogV2;
  assertHolidayCatalog(legacyView(catalog));
  const a = catalog.activation;
  equal(catalog.data.rules.length, 479, '479 erhaltene Erhebungsregeln');
  equal(a.matrixDecisions.length, 198, '198 Herkunftsentscheidungen');
  equal(a.procedureBindings.length, 104, '104 Verfahrensbindungen');
  equal(a.projections.length, 32, '32 Kalenderdefinitionen');
  equal(a.sourceEvidence.length, 157, '157 Quellenbelege');
  equal(a.supplementalScopes, [{id:'SO-PROCEDURAL-ALL',jurisdiction:'CH-SO',scopeType:'canton',legacyMatrixId:'SO-PROCEDURAL-DRAFT',legalValidity:{from:'2015-03-01',to:null}}], 'Gesonderte SO-Liste');
  const sources = index(a.sourceEvidence, 'Quellenbeleg');
  const sourceMap = new Map<string, string>();
  for (const row of a.sourceIdMap) {
    get(sources, row.evidenceId, 'Quellenbeleg');
    if (sourceMap.has(row.evidenceId)) fail('Doppelte Quellenabbildung');
    equal(row.sourceId, /^(SRC|JUD)-/.test(row.evidenceId) ? row.evidenceId : `SRC-${row.evidenceId}`, 'Quellen-ID-Normalisierung');
    sourceMap.set(row.evidenceId, row.sourceId);
  }
  equal(sorted([...sourceMap.keys()]), sorted([...sources.keys()]), 'Vollständige Quellenabbildung');
  equal(new Set(sourceMap.values()).size, sourceMap.size, 'Eindeutige operative Quellen-IDs');
  // Preserve underlying AP18 evidence verbatim, the added review text is separate.
  for (const source of catalog.data.sources) {
    const evidence = get(sources, source.id, 'Archivquellenbeleg');
    for (const key of Object.keys(source) as (keyof typeof source)[]) equal(evidence[key as keyof typeof evidence], source[key], `Archivquelle ${source.id}/${key}`);
  }
  const scopes = new Map(catalog.data.scopes.map(row => [row.id, {jurisdiction:row.jurisdiction, from:row.from, to:row.to}]));
  for (const row of a.supplementalScopes) {
    if (scopes.has(row.id)) fail('SO-Liste überschreibt eine Archivliste');
    scopes.set(row.id, {jurisdiction:row.jurisdiction, ...row.legalValidity});
  }
  const allRules = new Map(catalog.data.rules.map(row => [row.id, {scopeId:row.scope, fullDay:row.dayPortion === 'fullDay'}]));
  index(a.supplementalRules, 'SO-Regel');
  const soDays: readonly (readonly [string, number, number?])[] = [['NEW-YEAR',1,1],['BERCHTOLD',1,2],['GOOD-FRIDAY',-2],['EASTER-MONDAY',1],['ASCENSION',39],['WHIT-MONDAY',50],['MAY1',5,1],['CORPUS-CHRISTI',60],['ASSUMPTION',8,15],['ALL-SAINTS',11,1],['CHRISTMAS',12,25],['ST-STEPHEN',12,26]];
  equal(a.supplementalRules.length, soDays.length, 'Zwölf SO-Regeln');
  for (const [name, first, second] of soDays) {
    const id = `SO-PROCEDURAL-ALL-DAY-${name}`;
    const rule = a.supplementalRules.find(row => row.id === id);
    if (!rule || allRules.has(id)) fail(`Fehlende oder überschreibende SO-Regel: ${id}`);
    equal(rule.scopeId, 'SO-PROCEDURAL-ALL', id);
    equal(rule.calculation, second === undefined ? {type:'easterOffsetDays',offsetDays:first} : {type:'fixedMonthDay',month:first,day:second}, id);
    equal(rule.legalValidity, {from:'2015-03-01',to:null}, id);
    equal(rule.sourceRefs, [{evidenceId:'AP22-SO-GS201463',locator:'Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015'}], id);
    for (const ref of rule.sourceRefs) get(sources, ref.evidenceId, 'SO-Normbeleg');
    allRules.set(id, {scopeId:rule.scopeId,fullDay:true});
  }
  const decisions = index(a.matrixDecisions, 'Herkunftsentscheidung');
  for (const row of decisions.values()) {
    if (get(scopes, rename(row.originScopeId), 'Ausgangsliste').jurisdiction !== row.jurisdiction) fail('Kantonsfremde Ausgangsliste');
    for (const id of row.selectedScopeIds) if (![row.jurisdiction,'CH'].includes(get(scopes, id, 'Gewählte Liste').jurisdiction)) fail('Kantonsfremde gewählte Liste');
    if (['exclude','resultDependentClarification'].includes(row.mode) && row.selectedScopeIds.length) fail('Negativer oder unbestimmter Listenentscheid wird positiv verwendet');
  }
  const policies = index(a.anchorPolicies, 'Rollenregel');
  equal(sorted(a.anchorPolicies.map(row => row.profileId)), sorted(PROFILES), 'Vier Rollenregeln');
  for (const policy of policies.values()) {
    equal(policy.id, `AP22-ANCHOR-${policy.profileId.toUpperCase()}`, 'Rollen-ID');
    equal(policy.resolvedModes, policy.profileId === 'zpo' ? ['court'] : ['partyWithoutRepresentative','qualifiedServiceRepresentative'], 'Qualifizierte Rollen');
    equal(policy.unresolvedModes, policy.profileId === 'zpo' ? ['missingCourt'] : ['missingParty','unqualifiedRepresentation','nonProfessionalDifferentPlaces','mandateChange','personalActUnqualified','unresolvedMultiplePlaces'], 'Unbestimmte Rollen');
    for (const id of policy.sourceIds) get(sources, id, 'Rollenquelle');
  }
  const recipes = index(a.projections, 'Projektion');
  equal(new Set(a.projections.map(row => row.calendarId)).size, a.projections.length, 'Eindeutige Kalender-IDs');
  for (const recipe of recipes.values()) {
    const base = get(scopes, recipe.baseScopeId, 'Grundliste');
    if (base.jurisdiction !== recipe.jurisdiction || recipe.baseScopeId.endsWith('ADDITIONAL')) fail('Keine eindeutige terminale Grundliste');
    if (recipe.supplementScopeIds.some(id => !id.endsWith('ADDITIONAL') || get(scopes, id, 'Ergänzung').jurisdiction !== recipe.jurisdiction)) fail('Konkurrierende oder kantonsfremde Ergänzung');
    equal(recipe.scopeIds, sorted(['CH-ALL',recipe.baseScopeId,...recipe.supplementScopeIds]), 'Abschliessende Listenmenge');
    const expectedIds = sorted([...allRules].filter(([,rule]) => recipe.scopeIds.includes(rule.scopeId)).map(([id]) => id));
    equal(recipe.ruleIds, expectedIds, 'Vollständige terminale Regelmenge');
    if (!expectedIds.length || expectedIds.some(id => !get(allRules,id,'Regel').fullDay)) fail('Leere oder halbtägige Fristwirkung');
    const digest = rawSha256Text(JSON.stringify({jurisdiction:recipe.jurisdiction,scopeIds:recipe.scopeIds,ruleIds:recipe.ruleIds}));
    equal(recipe.id, `projection-${digest.slice(0,16)}`, 'Projektionsidentität');
    equal(recipe.calendarId, recipe.jurisdiction === 'CH' ? 'ch-federal-calendar' : recipe.jurisdiction === 'CH-BE' ? 'be-public-holidays' : `ap22-${recipe.jurisdiction.slice(3).toLowerCase()}-${digest.slice(0,12)}`, 'Kalenderidentität');
  }
  index(a.procedureBindings, 'Verfahrensbindung');
  equal(sorted(a.procedureBindings.map(row => `${row.jurisdiction}/${row.profileId}`)), sorted(CANTONS.flatMap(canton => PROFILES.map(profile => `CH-${canton}/${profile}`))), '26 Kantone mal vier Bundesprofile');
  const used = new Set<string>();
  for (const binding of a.procedureBindings) {
    equal(binding.id, `AP22-BIND-${binding.jurisdiction.slice(3)}-${binding.profileId.toUpperCase()}`, 'Bindungs-ID');
    equal(get(policies,binding.anchorPolicyId,'Rollenregel').profileId,binding.profileId,'Profilgebundene Rolle');
    equal(binding.caseCoverage,{from:'2026-08-29',to:null},'Produktfenster ohne Rechtsbeständigkeitszusage');
    const rows = a.matrixDecisions.filter(row => row.jurisdiction === binding.jurisdiction && row.profileId === binding.profileId);
    equal(sorted(binding.matrixDecisionIds),sorted(rows.map(row=>row.id)),'Vollständige Herkunftsentscheidungen der Bindung');
    const selected = sorted(['CH-ALL',...rows.filter(row=>row.mode !== 'exclude').flatMap(row=>row.selectedScopeIds)]);
    const regional = selected.filter(id=>REGIONAL.includes(id));
    equal(binding.requiredAreaScopeIds,regional,'Explizite regionale Fakten');
    equal(binding.variants.map(row=>row.areaFacts),regional.length ? [[{scopeId:regional[0],member:false}],[{scopeId:regional[0],member:true}]] : [[]],'Keine regionale Standardannahme');
    for (const id of binding.sourceIds) get(sources,id,'Bindungsquelle');
    equal(binding.boundaryIds,binding.jurisdiction === 'CH-GR' ? ['GR-BASE-ONLY'] : binding.jurisdiction === 'CH-NE' ? ['NE-YEAR-LOCAL-RESERVE'] : [],'Getrennte berechenbare Grenzen');
    const uncertain = rows.filter(row=>row.mode === 'resultDependentClarification');
    if (uncertain.length > 1) fail('Mehr als eine Januargrenze');
    const uncertaintyRule = `${binding.jurisdiction.slice(3)}-ZPO-ADDITIONAL-DAY-BERCHTOLD`;
    equal(binding.ambiguity,uncertain.length ? {decision:'DEC-2026-029',catalogRuleIds:[uncertaintyRule],comparison:'fullCalculation',onDifference:'clarificationRequired',onEqual:'resolved'} : null,'Vollständiger Januarvergleich');
    equal(binding.approvalBasis,uncertain.length ? ['DEC-2026-028','DEC-2026-029'] : ['DEC-2026-028'],'Fachliche Entscheidgrundlagen');
    for (const variant of binding.variants) {
      const recipe = get(recipes,variant.projectionId,'Variante'); used.add(recipe.id);
      equal(recipe.jurisdiction,binding.jurisdiction,'Kanton der Variante');
      equal(recipe.scopeIds,selected.filter(id=>!regional.includes(id)||variant.areaFacts.some(fact=>fact.scopeId===id&&fact.member)),'Genau gewählte terminale Listen');
      if (uncertain.length) {
        if (!variant.alternativeProjectionId) fail('Fehlende Januaralternative');
        const alternative = get(recipes,variant.alternativeProjectionId,'Januaralternative'); used.add(alternative.id);
        equal(alternative.jurisdiction,recipe.jurisdiction,'Alternativkanton');
        equal(alternative.ruleIds,sorted([...recipe.ruleIds,uncertaintyRule]),'Nur gebundene unsichere Regel variiert');
        equal(alternative.scopeIds,sorted([...recipe.scopeIds,uncertain[0]!.originScopeId]),'Nur gebundene unsichere Liste variiert');
      } else if (variant.alternativeProjectionId !== null) fail('Alternative ohne Januargrenze');
    }
  }
  equal(sorted(a.procedureBindings.filter(row=>row.ambiguity).map(row=>row.id)),sorted(['AP22-BIND-SH-STPO','AP22-BIND-SG-STPO','AP22-BIND-SG-BGG','AP22-BIND-SG-VWVG']),'Vier gebundene Januargrenzen');
  const federal = a.projections.filter(row=>row.jurisdiction==='CH');
  equal(federal.length,1,'Ein Bundeskalender'); used.add(federal[0]!.id);
  equal(sorted([...used]),sorted([...recipes.keys()]),'Kein ungebundener Kalender');
}

/** True only for a concrete release, never from archived statuses or DEC alone. */
export function isHolidayActivationReleased(catalog: HolidayCatalogV2, releaseId: string): boolean {
  assertHolidayCatalogV2(catalog);
  return catalog.activation.contractDecision.status === 'approved'
    && catalog.activation.releaseEligibility.status === 'approved'
    && catalog.activation.releaseEligibility.releaseId === releaseId
    && catalog.activation.releaseEligibility.approval !== null;
}

export function activatedRuleId(ruleId: string, recipe: CalendarProjectionRecipe): string {
  return /^(CH|BE)-CAL-/.test(ruleId) ? ruleId : `${recipe.jurisdiction.slice(3)}-CAL-${ruleId}-${recipe.id.slice(11).toUpperCase()}`;
}
function projectRule(catalog: HolidayCatalogV2, recipe: CalendarProjectionRecipe, id: string): HolidayCalendarRule {
  const old = catalog.data.rules.find(row=>row.id===id);
  const extra = catalog.activation.supplementalRules.find(row=>row.id===id);
  if (!old && !extra) fail(`Unbekannte Projektionsregel: ${id}`);
  if (old && (old.dayPortion !== 'fullDay' || old.action !== 'add')) fail('Unzulässige Fristwirkung');
  const historical = catalog.calendarProjections.find(row=>row.catalogRuleId===id);
  const sourceMap = new Map(catalog.activation.sourceIdMap.map(row=>[row.evidenceId,row.sourceId]));
  const sourceRefs = old ? [{sourceId:get(sourceMap,old.source,'Regelquellen-ID'),locator:old.locator}]
    : extra!.sourceRefs.map(ref=>({sourceId:get(sourceMap,ref.evidenceId,'SO-Quellen-ID'),locator:ref.locator}));
  return {
    ruleId:activatedRuleId(id,recipe),calendarId:recipe.calendarId,
    jurisdiction:recipe.jurisdiction==='CH'?{level:'federal',code:'CH'}:{level:'cantonal',code:recipe.jurisdiction.slice(3)},
    labelKey:historical?.labelKey??`holiday.${recipe.jurisdiction.slice(3).toLowerCase()}.${id}`,
    labels:old?{de:old.de,fr:old.fr}:{de:extra!.labels.de,fr:extra!.labels.fr},
    priority:old?.priority??100,validity:old?{from:old.from,to:old.to}:{...extra!.legalValidity},sourceRefs,
    calculation:{...(old?.calculation??extra!.calculation)},condition:old?.condition??extra!.condition,
    effect:{type:'holiday',kind:historical?.kind??((old?.category??extra!.category)==='proceduralEquivalentDay'?'proceduralEquivalentDay':'cantonalPublicHoliday'),legalEffect:'nonWorkingDayEquivalentToSunday',resultIdSuffix:historical?.resultIdSuffix??id}
  };
}

/** Deterministic construction from full catalog bytes (caller verifies digest).
 * The legacy pair is checked against fixed historical rules, not trusted as a
 * source of additional calendar permissions. */
export function projectActivatedCalendars(catalog: HolidayCatalogV2, catalogSha256: string, legacyCalendars: readonly CalendarRuleSet[]): readonly CalendarRuleSet[] {
  assertHolidayCatalogV2(catalog);
  if (!/^[a-f0-9]{64}$/.test(catalogSha256)) fail('Vollständiger Kataloghash erforderlich');
  assertHolidayCatalogProjection(legacyView(catalog),legacyCalendars);
  const legacy = new Map(legacyCalendars.map(row=>[row.calendarId,row]));
  const evidenceIndex = index(catalog.activation.sourceEvidence,'Quellenbeleg');
  const mapped = new Map(catalog.activation.sourceIdMap.map(row=>[row.sourceId,get(evidenceIndex,row.evidenceId,'Quellenbeleg')]));
  const result: CalendarRuleSet[] = [];
  for (const recipe of [...catalog.activation.projections].sort((left,right)=>left.calendarId.localeCompare(right.calendarId))) {
    const historical = legacy.get(recipe.calendarId);
    const ownIds = recipe.ruleIds.filter(id=>recipe.jurisdiction==='CH'||catalog.data.rules.find(row=>row.id===id)?.scope!=='CH-ALL');
    const rules: CalendarRule[] = ownIds.map(id=>projectRule(catalog,recipe,id));
    if (recipe.jurisdiction==='CH') rules.push(...JSON.parse(JSON.stringify(get(legacy,'ch-federal-calendar','Bundeskalender').rules.filter(rule=>rule.effect.type!=='holiday'))) as CalendarRule[]);
    const ids = sorted(rules.flatMap(rule=>rule.sourceRefs.map(ref=>ref.sourceId)));
    const sources = ids.map(sourceId=> {
      const previous = historical?.sources.find(row=>row.sourceId===sourceId);
      if (previous) return {...previous};
      const evidence = get(mapped,sourceId,'Operative Quelle');
      return {sourceId,sourceType:'officialDossier',title:evidence.title,authority:evidence.jurisdiction,url:evidence.url,documentVersionDate:evidence.versionOn&&parseIsoDate(evidence.versionOn)?evidence.versionOn:null,reviewedOn:evidence.retrievedOn,reviewStatus:'monitored'};
    });
    const calendar = {
      $schema:PREFIX+'calendar-rules-v3.schema.json',formatVersion:'3.0.0' as const,dataKind:'calendar' as const,
      calendarId:recipe.calendarId,jurisdiction:recipe.jurisdiction==='CH'?{level:'federal' as const,code:'CH'}:{level:'cantonal' as const,code:recipe.jurisdiction.slice(3)},
      validity:historical?{...historical.validity}:{from:'2026-08-29',to:null},inherits:recipe.jurisdiction==='CH'?[]:['ch-federal-calendar'],
      review:{reviewedOn:'2026-10-08',status:'candidate',reviewedBy:'Codex',basis:'AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe.'},
      sources,rules:rules.sort((left,right)=>left.ruleId.localeCompare(right.ruleId)),
      projection:{catalogId:catalog.catalogId,catalogFormatVersion:'2.0.0' as const,projectionId:recipe.id,sourceHash:catalogSha256}
    };
    result.push(calendar);
  }
  return result;
}

/** Closed content comparison covers rule arithmetic, sources, validity, effects,
 * inheritance and full-catalog provenance, not merely rule IDs. */
export function assertActivatedCalendarProjection(catalog: HolidayCatalogV2, catalogSha256: string, calendars: readonly CalendarRuleSet[], legacyCalendars: readonly CalendarRuleSet[]): void {
  const expected = projectActivatedCalendars(catalog,catalogSha256,legacyCalendars);
  equal([...calendars].sort((left,right)=>left.calendarId.localeCompare(right.calendarId)),expected,'Vollständige operative Projektion');
}
