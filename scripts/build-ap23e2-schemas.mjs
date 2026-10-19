// SPDX-License-Identifier: AGPL-3.0-only
// AP23E2 proposal only. Never edits approved schemas or creates runtime authority.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = 'schemas/candidates/ap23e2';
const rawBase = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const AP23E2_SCHEMA_FILES = Object.freeze({
  catalog: `${directory}/administrative-procedure-catalog-v2.schema.json`,
  manifest: `${directory}/release-manifest-v9.schema.json`,
  localManifest: `${directory}/local-reference-manifest-v9.schema.json`,
  input: `${directory}/administrative-input-v2.schema.json`
});
export const AP23E2_SCHEMA_IDS = Object.freeze(Object.fromEntries(Object.entries(AP23E2_SCHEMA_FILES).map(([key, path]) => [key, `${rawBase}${path}`])));
export const AP23E2_BASELINE_CATALOG_SHA256 = '2f434968628c951a2e15eb62c5f3e0d5d906fa476b1c66387076a3e9727ce3f7';
const baseline = [
  ['catalog', 'schemas/administrative-procedure-catalog.schema.json', 'c89cf5739b1ec4ca238f15b2d1b0a696e7b3b6c81824b0b4075fdeb43a2f7010'],
  ['manifest', 'schemas/release-manifest-v8.schema.json', '65a8f8e63a013209b57d8802a4c1dc34760c861b8a5cd78b8fb0264aca13fd8a'],
  ['localManifest', 'schemas/implementation/ap23d1/local-reference-manifest-v8.schema.json', '174f7731e14f435e57a3138d30c4ce0e68f18d7f341c6f59fef779557fc61d59']
];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = value => structuredClone(value);
const hashSchema = () => ({ type: 'string', pattern: '^[a-f0-9]{64}$' });
const idSchema = () => ({ type: 'string', pattern: '^[a-z][a-z0-9-]*$' });
const enumSchema = values => ({ enum: values });
const object = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });

function qualificationPolicySchema() {
  const identity = { pathId: idSchema(), pathRevision: { type: 'integer', minimum: 1 }, pathSha256: hashSchema() };
  const requirements = object({
    action: enumSchema(['ordinaryAppeal', 'proceduralSubmission', 'executionAppeal']),
    decisionKind: enumSchema(['finalDecision', 'qualifiedVRPGArt63Order', 'notApplicable']),
    unit: { const: 'day' }, opening: { const: 'qualifiedCompleteActualDelivery' },
    notice: { const: 'uncontested' }, termChange: { const: 'none' }, urgency: { const: 'none' }
  });
  requirements.allOf = [
    ['ordinaryAppeal', 'finalDecision'], ['executionAppeal', 'qualifiedVRPGArt63Order'], ['proceduralSubmission', 'notApplicable']
  ].map(([action, decisionKind]) => ({
    if: { properties: { action: { const: action } }, required: ['action'] },
    then: { properties: { decisionKind: { const: decisionKind } } }
  }));
  return { oneOf: [
    object({ ...clone(identity), mode: { const: 'legacyV1' }, baseline: object({
      releaseId: { const: '2026-10-15-mvp-08-approved.1' }, catalogSha256: { const: AP23E2_BASELINE_CATALOG_SHA256 }
    }) }),
    object({ ...clone(identity), mode: { const: 'qualifiedDayProcedure' }, requirements })
  ] };
}

function inputSchema(cantons) {
  // Negative facts are representable but never silently converted into positive
  // qualifications. Unknown object fields and omitted facts are invalid.
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema', $id: AP23E2_SCHEMA_IDS.input,
    title: 'AP23E2 proposed explicit current-case input, never stored qualification',
    ...object({
      path: { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9-]*$' },
      pathRevision: { type: 'integer', minimum: 1 },
      stage: enumSchema(['administration', 'administrativeAppeal', 'court', 'unknown']),
      authoritySeatCanton: enumSchema([...cantons, 'CH', 'unknown']),
      trigger: { type: 'string', format: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      days: { type: 'integer', minimum: 1, maximum: 365 },
      unit: enumSchema(['day', 'hour', 'month', 'year', 'fixedDate', 'unknown']),
      direction: enumSchema(['forward', 'backward', 'unknown']),
      action: enumSchema(['ordinaryAppeal', 'proceduralSubmission', 'executionAppeal', 'objection', 'reasonRequest', 'costAdvance', 'payment', 'materialPerformance', 'mainCaseAppeal', 'schkgAppeal', 'unknown']),
      decisionKind: enumSchema(['finalDecision', 'qualifiedVRPGArt63Order', 'notApplicable', 'interimDecision', 'paymentReminder', 'schkgOrder', 'mainDecision', 'unknown']),
      opening: enumSchema(['qualifiedCompleteActualDelivery', 'oralAwaitingWrittenConfirmation', 'dispositiveOnly', 'fiction', 'publication', 'unknown']),
      notice: enumSchema(['uncontested', 'missing', 'incorrect', 'disputed', 'unknown']),
      specialLaw: enumSchema(['excluded', 'building', 'tax', 'socialInsurance', 'procurement', 'politicalRights', 'childAdultProtection', 'applicableFederalSpecialLaw', 'other', 'unknown']),
      authorityLevel: enumSchema(['cantonal', 'municipal', 'federal', 'unknown']),
      holidayAnchor: enumSchema(['qualifiedTargetAuthority', 'issuingAuthority', 'party', 'representative', 'unknown']),
      explicitHolidayException: enumSchema(['none', 'present', 'unknown']),
      urgency: enumSchema(['none', 'shortened', 'explicitJudicialUrgencyOrder', 'unknown']),
      fixedEndDate: { type: 'boolean' }, deviatingStart: { type: 'boolean' },
      termChange: enumSchema(['none', 'extension', 'reinstatement', 'shortened', 'other', 'unknown'])
    })
  };
}

function manifestSchema(source, kind) {
  const result = clone(source);
  result.$id = AP23E2_SCHEMA_IDS[kind];
  result.title = kind === 'manifest' ? 'AP23E2 proposed Manifest 9, approved release contract' : 'AP23E2 proposed Manifest 9, local reference only';
  result.properties.$schema.const = result.$id;
  result.properties.formatVersion.const = '9.0.0';
  result.properties.compatibility.properties.minimumConsumerFormatVersion.const = '9.0.0';
  const descriptors = result.properties.artifacts.items;
  const oldCatalogId = `${rawBase}schemas/administrative-procedure-catalog.schema.json`;
  descriptors.properties.schemaId.enum = descriptors.properties.schemaId.enum.map(id => id === oldCatalogId ? AP23E2_SCHEMA_IDS.catalog : id);
  const administrativeRule = descriptors.allOf.find(rule => rule.if?.properties?.role?.const === 'administrativeProcedureCatalog');
  assert.ok(administrativeRule);
  administrativeRule.then.properties.schemaId.const = AP23E2_SCHEMA_IDS.catalog;
  return result;
}

export async function buildAp23e2Schemas() {
  const originals = new Map();
  for (const [key, path, expected] of baseline) {
    const bytes = await readFile(resolve(root, path));
    assert.equal(sha(bytes), expected, `Changed approved schema baseline ${path}`);
    originals.set(key, JSON.parse(bytes));
  }
  const catalog = clone(originals.get('catalog'));
  catalog.$id = AP23E2_SCHEMA_IDS.catalog;
  catalog.title = 'AP23E2 proposed Kantonalverfahrenskatalog 2, explicit path qualifications';
  catalog.properties.$schema.const = catalog.$id;
  catalog.properties.formatVersion.const = '2.0.0';
  catalog.properties.contractDecision.properties.id.const = 'DEC-2026-033';
  catalog.required.push('qualificationPolicies');
  catalog.properties.qualificationPolicies = { type: 'array', minItems: 1, items: { $ref: '#/$defs/qualificationPolicy' } };
  catalog.$defs.qualificationPolicy = qualificationPolicySchema();
  for (const key of ['candidatePathEligibility', 'releasedPathEligibility']) {
    catalog.$defs[key].required.push('qualificationPolicySha256');
    catalog.$defs[key].properties.qualificationPolicySha256 = hashSchema();
  }
  const schemas = {
    catalog, manifest: manifestSchema(originals.get('manifest'), 'manifest'),
    localManifest: manifestSchema(originals.get('localManifest'), 'localManifest'),
    input: inputSchema(catalog.$defs.law.properties.canton.enum)
  };
  return { schemas, preservedSchemaBaselines: baseline.map(([, path, sha256]) => ({ path, sha256 })) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { schemas, preservedSchemaBaselines } = await buildAp23e2Schemas();
  const write = process.argv.includes('--write');
  if (write) await mkdir(resolve(root, directory), { recursive: true });
  const files = [];
  for (const [key, schema] of Object.entries(schemas)) {
    const path = AP23E2_SCHEMA_FILES[key];
    const text = JSON.stringify(schema, null, 2) + '\n';
    if (write) await writeFile(resolve(root, path), text);
    else assert.equal(await readFile(resolve(root, path), 'utf8'), text, `Stale generated schema ${path}`);
    files.push({ path, sha256: sha(text) });
  }
  console.log(JSON.stringify({ status: write ? 'candidateSchemasWritten' : 'candidateSchemasVerified', runtimeActive: false, files, preservedSchemaBaselines }, null, 2));
}
