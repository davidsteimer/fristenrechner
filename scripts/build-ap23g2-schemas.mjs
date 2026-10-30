// SPDX-License-Identifier: AGPL-3.0-only
// Isolated proposal. Never edits native or historically accepted schemas.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = 'schemas/candidates/ap23g2';
const raw = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const G2_SCHEMA_FILES = {
  catalog: `${directory}/administrative-procedure-catalog-v4.schema.json`,
  manifest: `${directory}/release-manifest-v11.schema.json`,
  localManifest: `${directory}/local-reference-manifest-v11.schema.json`,
  input: `${directory}/administrative-input-v4.schema.json`
};
export const G2_SCHEMA_IDS = Object.fromEntries(Object.entries(G2_SCHEMA_FILES).map(([k, p]) => [k, raw + p]));
const sha = b => createHash('sha256').update(b).digest('hex');
const obj = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const en = values => ({ enum: values });
const bool = () => ({ type: 'boolean' });
const id = () => ({ type: 'string', pattern: '^[a-z][a-z0-9-]*$' });
export const G2_REQUIREMENTS = {
  action: ['ordinaryAdministrativeAppeal','ordinaryAdministrativeCourtAppeal','ordinaryAdministrativeRekurs','orderedProceduralSubmission','requestAdministrativeReasons','requestCourtReasons'],
  opening: ['completeReasonedAdministrativeDecision','orderedForwardDayPeriod','lawfullyUnreasonedAdministrativeDecision','lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer','legallyQualifiedCourtDispositiveOrOralOpening'],
  holidayAnchor: ['targetAuthoritySeat','issuingAuthoritySeat','courtSeat'], authorityLevel: ['cantonal'], specialLaw: ['excluded'],
  termChange: ['none'], unit: ['day'], direction: ['forward'], notice: ['uncontested'],
  suspensionContext: ['ordinaryNoException'], serviceContext: ['effectiveLegalTriggerKnown'],
  requiredTargetCourt: ['notApplicable','UR-Obergericht','SO-Verwaltungsgericht','SH-Obergericht'],
  openingChainPolicy: ['requireOriginalOrTimelyRequestedReasons','notApplicable'],
  coordinationPolicy: ['excludeCoordinatedAppeal','notApplicable'],
  localHolidayPolicy: ['blockConcreteUnresolvedAdditionalEndEffect','notApplicable'],
  specialOpeningPolicy: ['ordinaryEffectiveUROpening','notApplicable'],
  shorteningPolicy: ['noShortenedSHRekurs','notApplicable']
};
export async function buildG2Schemas() {
  const paths = ['schemas/administrative-procedure-catalog-v3.schema.json','schemas/release-manifest-v10.schema.json','schemas/implementation/ap23f3/local-reference-manifest-v10.schema.json'];
  const originals = await Promise.all(paths.map(async p => JSON.parse(await readFile(resolve(root, p)))));
  const catalog = structuredClone(originals[0]);
  catalog.$id = G2_SCHEMA_IDS.catalog;
  catalog.title = 'AP23G2 proposed Kantonalverfahrenskatalog 4';
  catalog.properties.$schema.const = catalog.$id;
  catalog.properties.formatVersion.const = '4.0.0';
  catalog.properties.contractDecision.properties.id.const = 'DEC-2026-036';
  const v4 = structuredClone(catalog.$defs.path.oneOf[1]);
  v4.required.push('openingWarnings');
  v4.properties.openingWarnings = { type: 'array', maxItems: 1, items: obj({
    warningId: { const: 'ur-art22-opening-restriction' }, evaluatedOn: { const: 'qualifiedOpeningDate' },
    effect: { const: 'noticeOnlyNoDateChange' }, periods: { type: 'array', minItems: 2, maxItems: 2, items: structuredClone(catalog.$defs.period) },
    sourceRefs: { $ref: '#/$defs/sourceRefs' }
  }) };
  for (const side of ['start','end']) {
    const offset = v4.properties.openingWarnings.items.properties.periods.items.properties[side].oneOf[1].properties.days;
    offset.minimum = -8; offset.maximum = 8;
  }
  catalog.$defs.path.oneOf.push(v4);
  const requirements = obj(Object.fromEntries(Object.entries(G2_REQUIREMENTS).map(([k,v]) => [k,en(v)])));
  Object.assign(requirements.properties, { materialPerformance: { const: false }, fixedEndDate: { const: false },
    deviatingStart: { const: false }, requiredSameIssuingCourt: bool() });
  requirements.required = Object.keys(requirements.properties);
  catalog.$defs.qualificationPolicy.oneOf.push(obj({ pathId: id(), pathRevision: {type:'integer',minimum:1},
    pathSha256: {type:'string',pattern:'^[a-f0-9]{64}$'}, mode: {const:'qualifiedDayProcedureV4'}, requirements }));
  catalog.$defs.law.properties.holidayPolicyReview.properties.explicitDeviation = en(['noneIdentifiedInReviewedGeneralLaw','explicitCourtLocationRule']);
  const binding = structuredClone(catalog.$defs.holidayBinding.oneOf[0]);
  binding.required.push('bindingVersion','physicalReuse','practiceAddition');
  binding.properties.bindingVersion = { const: '4.0.0' };
  binding.properties.anchor = en(['authoritySeat','courtSeat']);
  binding.properties.physicalReuse = obj({ kind: {const:'sameDatesIndependentLegalBasis'},
    sourceReleaseId: structuredClone(binding.properties.physicalBaseline.properties.releaseId),
    sourceCatalogSha256: {type:'string',pattern:'^[a-f0-9]{64}$'},
    selectedRuleIds: {type:'array',minItems:1,uniqueItems:true,items:{type:'string',minLength:1}},
    projectionRuleIds: {type:'array',minItems:1,uniqueItems:true,items:{type:'string',minLength:1}},
    permissionInheritance: {const:'none'}, evidenceRefs: {$ref:'#/$defs/sourceRefs'},
    notDerivedFrom: en(['notApplicable','SH-ZPO-ADDITIONAL'])
  });
  binding.properties.practiceAddition = { oneOf: [{type:'null'},obj({ day: {const:'01-02'},
    sourceRefs: {$ref:'#/$defs/sourceRefs'}, evidenceLimit: {const:'nonDispositiveCantonalLawDescription'},
    scope: {const:'newSHGeneralAdministrativeOnly'} })] };
  catalog.$defs.holidayBinding.oneOf.push(binding);
  const schemas = { catalog };
  for (const [n, original] of [['manifest',originals[1]],['localManifest',originals[2]]]) {
    const s = structuredClone(original);
    s.$id = G2_SCHEMA_IDS[n]; s.title = `AP23G2 proposed Manifest 11 ${n}`;
    s.properties.$schema.const = s.$id; s.properties.formatVersion.const = '11.0.0';
    s.properties.compatibility.properties.minimumConsumerFormatVersion.const = '11.0.0';
    const a = s.properties.artifacts.items;
    a.properties.schemaId.enum = a.properties.schemaId.enum.map(id => id === originals[0].$id ? catalog.$id : id);
    a.allOf.find(x => x.if?.properties?.role?.const === 'administrativeProcedureCatalog').then.properties.schemaId.const = catalog.$id;
    schemas[n] = s;
  }
  const properties = {
    path: {type:'string',pattern:'^[A-Za-z][A-Za-z0-9-]*$'}, pathRevision:{type:'integer',minimum:1},
    authoritySeatCanton: en(['UR','SO','SH','BE','CH','unknown']),
    stage: en(['administration','court','unknown']), trigger:{type:'string',format:'date',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},
    days:{type:'integer',minimum:1,maximum:365},
    ...Object.fromEntries(Object.entries(G2_REQUIREMENTS).filter(([k]) => !k.startsWith('required') && !k.endsWith('Policy')).map(([k,v]) => [k,en([...v,'unknown','other'])])),
    materialPerformance: bool(), fixedEndDate:bool(),deviatingStart:bool(),coordinatedDecision:bool(),shortenedRekurs:bool(),sameIssuingCourt:bool(),
    targetCourt:en(['notApplicable','UR-Obergericht','SO-Verwaltungsgericht','SH-Obergericht','lowerSpecialAdministrativeCourt','unknown']),
    openingOrigin:en(['originalReasoned','reasonedFollowingRequest','notApplicable','unknown']),
    priorReasonsRequest:en(['timelyEstablished','notApplicable','late','unknown']),
    localHolidayEffect:en(['noAdditionalRelevantLocalHoliday','concretePotentialEndChangeUnresolved','unknown']),
    urOpeningConsequence:en(['ordinaryEffectiveOpening','specialPostponementClaimed','unknown'])
  };
  // Negative input states are representable, but never inferred into positive facts.
  for (const [k, values] of Object.entries({
    authorityLevel:['municipal','federal'], unit:['hour','month','year','fixedDate'],direction:['backward'],
    notice:['missing','incorrect','disputed'],specialLaw:['ATSG','tax','procurement','politicalRights','childAdultProtection'],
    holidayAnchor:['partyOrRepresentativeSeat'], opening:['unreasonedFullAllowanceWithoutReasonsOffer'],
    suspensionContext:['taxCase'],serviceContext:['oralOpeningDateUnclear'],termChange:['restorationRequested']
  })) properties[k].enum.push(...values);
  schemas.input = { $schema:'https://json-schema.org/draft/2020-12/schema',$id:G2_SCHEMA_IDS.input,
    title:'AP23G2 explicit current research facts not persistent defaults', ...obj(properties) };
  return { schemas, baselines: await Promise.all(paths.map(async p => ({path:p,sha256:sha(await readFile(resolve(root,p)))}))) };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {schemas,baselines}=await buildG2Schemas(), write=process.argv.includes('--write'), files=[];
  if(write)await mkdir(resolve(root,directory),{recursive:true});
  for(const [k,s]of Object.entries(schemas)) {
    const p=G2_SCHEMA_FILES[k], bytes=JSON.stringify(s,null,2)+'\n';
    if(write)await writeFile(resolve(root,p),bytes); else assert.equal(await readFile(resolve(root,p),'utf8'),bytes,p);
    files.push({path:p,sha256:sha(bytes)});
  }
  console.log(JSON.stringify({status:write?'isolatedSchemasWritten':'isolatedSchemasVerified',files,baselines,runtimeActive:false},null,2));
}
