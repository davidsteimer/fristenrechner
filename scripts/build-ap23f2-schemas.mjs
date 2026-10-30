// SPDX-License-Identifier: AGPL-3.0-only
// Isolated AP23F2 contract proposal. Never edits approved schemas.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = 'schemas/candidates/ap23f2';
const rawBase = 'https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/';
export const AP23F2_SCHEMA_FILES = Object.freeze({
  catalog: `${directory}/administrative-procedure-catalog-v3.schema.json`,
  manifest: `${directory}/release-manifest-v10.schema.json`,
  localManifest: `${directory}/local-reference-manifest-v10.schema.json`,
  input: `${directory}/administrative-input-v3.schema.json`
});
export const AP23F2_SCHEMA_IDS = Object.freeze(Object.fromEntries(Object.entries(AP23F2_SCHEMA_FILES).map(([key, path]) => [key, rawBase + path])));
const baselines = [
  ['catalog', 'schemas/administrative-procedure-catalog-v2.schema.json', 'cbedc3757fd1e5919b1c8c2a4969597e697df56bcf147c14fa6b81e30cd161e0'],
  ['manifest', 'schemas/release-manifest-v9.schema.json', '1b489a9cc4efad7751586c5f9bdfa198a0ea6396f4737db9c363e98089c12333'],
  ['localManifest', 'schemas/implementation/ap23e3/local-reference-manifest-v9.schema.json', 'ecbe2fc25a1026cd53b810a86196d7bc68038f9a7da50a7881236a604eaff569'],
  ['input', 'schemas/candidates/ap23e2/administrative-input-v2.schema.json', '5e488869d660dc78f22ef182159fd306f84c5be7fa3387da14dd31bd339075eb']
];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const clone = value => structuredClone(value);
const object = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const enumeration = values => ({ enum: values });
const hash = () => ({ type: 'string', pattern: '^[a-f0-9]{64}$' });
const id = () => ({ type: 'string', pattern: '^[a-z][a-z0-9-]*$' });
const date = () => ({ type: 'string', format: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$' });
export const AP23F2_REQUIREMENTS = Object.freeze({
  action: ['ordinaryAppeal', 'proceduralSubmission', 'executionAppeal', 'interimAppeal', 'measuresAppeal'],
  decisionKind: ['finalDecision', 'notApplicable', 'qualifiedAGVRPG83ExecutionOrder', 'qualifiedSGVRP44MeasuresOrder', 'qualifiedSGVRP60InterimOrder'],
  unit: ['day'], opening: ['qualifiedCompleteActualDelivery'], notice: ['uncontested'], termChange: ['none'], urgency: ['none'],
  targetBody: ['cantonAdministrativeAuthority', 'administrativeAppealAuthority', 'administrativeCourt', 'administrativeAppealsCommission'],
  procedureMatter: ['generalAdministrative', 'documentAccess'],
  channelCase: ['ordinaryNoFictionNoOutage', 'notApplicable'],
  exceptionNotice: ['correctExceptionNotice', 'notApplicable']
});

export async function buildAp23f2Schemas() {
  const originals = new Map();
  for (const [key, path, expected] of baselines) {
    const bytes = await readFile(resolve(root, path));
    assert.equal(sha(bytes), expected, `Changed AP23F2 schema baseline ${path}`);
    originals.set(key, JSON.parse(bytes));
  }
  const catalog = clone(originals.get('catalog'));
  catalog.$id = AP23F2_SCHEMA_IDS.catalog;
  catalog.title = 'AP23F2 proposed Kantonalverfahrenskatalog 3';
  catalog.properties.$schema.const = catalog.$id;
  catalog.properties.formatVersion.const = '3.0.0';
  catalog.properties.contractDecision.properties.id.const = 'DEC-2026-035';
  const pathV2 = clone(catalog.$defs.path);
  const pathV3 = clone(pathV2);
  pathV3.required.push('normTimeline');
  delete pathV3.properties.temporalBinding.properties.normVersionCoverage;
  pathV3.properties.temporalBinding.required = pathV3.properties.temporalBinding.required.filter(key => key !== 'normVersionCoverage');
  pathV3.properties.normTimeline = { type: 'array', minItems: 1, items: object({
    interval: object({ from: date(), to: date() }), sourceRefs: clone(pathV2.properties.sourceRefs)
  }) };
  catalog.$defs.path = { oneOf: [pathV2, pathV3] };
  const requirements = object(Object.fromEntries(Object.entries(AP23F2_REQUIREMENTS).map(([key, values]) => [key, enumeration(values)])));
  catalog.$defs.qualificationPolicy.oneOf.push(object({ pathId: id(), pathRevision: { type: 'integer', minimum: 1 },
    pathSha256: hash(), mode: { const: 'qualifiedDayProcedureV3' }, requirements }));
  // The new physical projection is not represented as an existing MVP09 file.
  const bindingV2 = clone(catalog.$defs.holidayBinding);
  const bindingV3 = clone(bindingV2);
  bindingV3.required.push('projectionEvidence');
  bindingV3.properties.projectionEvidence = object({ kind: { const: 'localStructuralProjection' },
    sourceReleaseId: { const: '2026-10-18-mvp-09-approved.1' }, sourceCatalogSha256: hash(),
    selectedRuleIds: { type: 'array', minItems: 9, maxItems: 9, uniqueItems: true, items: { type: 'string', pattern: '^ZH-RLG-ALL-DAY-[A-Z0-9-]+$' } } });
  catalog.$defs.holidayBinding = { oneOf: [bindingV2, bindingV3] };

  const schemas = { catalog };
  for (const kind of ['manifest', 'localManifest']) {
    const schema = clone(originals.get(kind));
    schema.$id = AP23F2_SCHEMA_IDS[kind];
    schema.title = `AP23F2 proposed Manifest 10 ${kind === 'manifest' ? 'release contract' : 'local structural reference'}`;
    schema.properties.$schema.const = schema.$id;
    schema.properties.formatVersion.const = '10.0.0';
    schema.properties.compatibility.properties.minimumConsumerFormatVersion.const = '10.0.0';
    schema.properties.calendarIds.minItems = 33;
    schema.properties.calendarIds.maxItems = 33;
    schema.properties.artifacts.minItems = 42;
    schema.properties.artifacts.maxItems = 42;
    const descriptors = schema.properties.artifacts.items;
    const old = originals.get('catalog').$id;
    descriptors.properties.schemaId.enum = descriptors.properties.schemaId.enum.map(value => value === old ? catalog.$id : value);
    const rule = descriptors.allOf.find(rule => rule.if?.properties?.role?.const === 'administrativeProcedureCatalog');
    assert.ok(rule);
    rule.then.properties.schemaId.const = catalog.$id;
    schemas[kind] = schema;
  }
  const input = clone(originals.get('input'));
  input.$id = AP23F2_SCHEMA_IDS.input;
  input.title = 'AP23F2 explicit research input V3 not persistent user facts';
  const extra = {
    targetBody: [...AP23F2_REQUIREMENTS.targetBody, 'unknown', 'other'],
    procedureMatter: [...AP23F2_REQUIREMENTS.procedureMatter, 'unknown', 'tax', 'priorRequestForFormalDecisionOeffG17', 'other'],
    channelCase: [...AP23F2_REQUIREMENTS.channelCase, 'unknown', 'channelOutageClaimed', 'electronicFictionUnresolved'],
    exceptionNotice: [...AP23F2_REQUIREMENTS.exceptionNotice, 'unknown', 'missing', 'incorrect', 'disputed']
  };
  for (const [key, values] of Object.entries(extra)) { input.required.push(key); input.properties[key] = enumeration(values); }
  input.properties.action.enum.push('interimAppeal', 'measuresAppeal');
  input.properties.decisionKind.enum.push('qualifiedAGVRPG83ExecutionOrder', 'qualifiedSGVRP44MeasuresOrder', 'qualifiedSGVRP60InterimOrder');
  schemas.input = input;
  return { schemas, preservedSchemaBaselines: baselines.map(([, path, sha256]) => ({ path, sha256 })) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { schemas, preservedSchemaBaselines } = await buildAp23f2Schemas();
  const write = process.argv.includes('--write');
  if (write) await mkdir(resolve(root, directory), { recursive: true });
  const files = [];
  for (const [key, schema] of Object.entries(schemas)) {
    const path = AP23F2_SCHEMA_FILES[key], text = JSON.stringify(schema, null, 2) + '\n';
    if (write) await writeFile(resolve(root, path), text);
    else assert.equal(await readFile(resolve(root, path), 'utf8'), text, `Stale AP23F2 schema ${path}`);
    files.push({ path, sha256: sha(text) });
  }
  console.log(JSON.stringify({ status: write ? 'candidateSchemasWritten' : 'candidateSchemasVerified', runtimeActive: false, files, preservedSchemaBaselines }, null, 2));
}
