// SPDX-License-Identifier: AGPL-3.0-only
// Repository-owned schemas only. No network resolution or downloaded schemas.
import { parseIsoDate } from './date';
import { canonicalSocialJson } from './socialCatalog';

type Spec = boolean | Record<string, any>;
export type SchemaRegistry = ReadonlyMap<string, unknown>;
export class SchemaContractError extends Error {
  constructor(message: string) { super(message); this.name = 'SchemaContractError'; Object.setPrototypeOf(this, SchemaContractError.prototype); }
}
function fail(path: string, message: string): never { throw new SchemaContractError(`${path}: ${message}`); }
const keys = new Set(['$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'const', 'enum',
  'properties', 'patternProperties', 'additionalProperties', 'required', 'items', 'minItems', 'maxItems',
  'uniqueItems', 'minLength', 'maxLength', 'minimum', 'maximum', 'pattern', 'format', 'allOf', 'anyOf',
  'oneOf', 'not', 'if', 'then', 'else', 'contains', 'minContains', 'maxContains']);
const object = (v: unknown): v is Record<string, any> => v !== null && typeof v === 'object' && !Array.isArray(v);
const same = (a: unknown, b: unknown): boolean => canonicalSocialJson(a) === canonicalSocialJson(b);

/** Fail closed on schema evolution, including branches not used by this input. */
export function assertSchemaContract(schema: unknown, registry: SchemaRegistry = new Map()): void {
  const seen = new Set<unknown>();
  function visit(s: unknown, depth: number, document: unknown): void {
    if (typeof s === 'boolean') return;
    if (!object(s) || depth > 64) fail('#schema', 'Invalid schema');
    if (seen.has(s)) return;
    seen.add(s);
    for (const key of Object.keys(s)) if (!keys.has(key)) fail('#schema', `Unsupported keyword ${key}`);
    if (s.$ref !== undefined) {
      if (typeof s.$ref !== 'string') fail('#schema', 'Invalid reference');
      const [file, fragment = ''] = s.$ref.split('#');
      let target: unknown = document;
      if (file) {
        let id: string;
        try { id = new URL(file, object(document) ? document.$id : undefined).href; }
        catch { return fail('#schema', 'Invalid reference base'); }
        if (!registry.has(id)) fail('#schema', `Unregistered reference ${id}`);
        target = registry.get(id);
      }
      if (fragment) {
        if (!fragment.startsWith('/')) fail('#schema', 'Unsupported reference fragment');
        for (const token of fragment.slice(1).split('/')) {
          const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
          if (!object(target) || !Object.hasOwn(target, key)) fail('#schema', 'Missing reference target');
          target = target[key];
        }
      }
      if (typeof target !== 'boolean' && !object(target)) fail('#schema', 'Reference is not a schema');
    }
    const types = s.type === undefined ? [] : Array.isArray(s.type) ? s.type : [s.type];
    if (types.some((t: unknown) => !['null', 'string', 'integer', 'number', 'boolean', 'array', 'object'].includes(t as string))) fail('#schema', 'Unsupported type');
    if (s.format !== undefined && !['date', 'uri'].includes(s.format)) fail('#schema', 'Unsupported format');
    for (const key of ['$defs', 'properties', 'patternProperties']) {
      if (s[key] !== undefined && !object(s[key])) fail('#schema', `Invalid ${key}`);
      for (const child of Object.values(s[key] ?? {})) visit(child, depth + 1, document);
    }
    for (const key of ['items', 'contains', 'not', 'if', 'then', 'else', 'additionalProperties']) if (s[key] !== undefined) visit(s[key], depth + 1, document);
    for (const key of ['allOf', 'anyOf', 'oneOf']) if (s[key] !== undefined) {
      if (!Array.isArray(s[key]) || !s[key].length) fail('#schema', `Invalid ${key}`);
      s[key].forEach((child: unknown) => visit(child, depth + 1, document));
    }
  }
  visit(schema, 0, schema);
  for (const value of registry.values()) visit(value, 0, value);
}

/** Executes the complete keyword subset used by the bound local contracts. */
export function assertSchema(value: unknown, schema: unknown, registry: SchemaRegistry = new Map()): void {
  assertSchemaContract(schema, registry);
  canonicalSocialJson(value); // Reject accessors, cycles, undefined and non-JSON input.
  const root = schema as Spec;
  function matches(v: unknown, s: Spec, document: Spec, path: string, depth: number): boolean {
    try { check(v, s, document, path, depth); return true; }
    catch (error) { if (error instanceof SchemaContractError) return false; throw error; }
  }
  function check(v: unknown, s: Spec, document: Spec, path: string, depth: number): void {
    if (depth > 96) fail(path, 'Schema recursion limit');
    if (s === true) return;
    if (s === false) fail(path, 'Forbidden value');
    if (s.$ref) {
      const ref = String(s.$ref), hash = ref.indexOf('#');
      const file = hash < 0 ? ref : ref.slice(0, hash), fragment = hash < 0 ? '' : ref.slice(hash + 1);
      let targetDocument: Spec = document;
      if (file) {
        const base = typeof document === 'object' ? document.$id : undefined;
        const id = new URL(file, base).href;
        if (!registry.has(id)) fail(path, `Unregistered schema ${id}`);
        targetDocument = registry.get(id) as Spec;
      }
      let target: any = targetDocument;
      if (fragment) {
        if (!fragment.startsWith('/')) fail(path, 'Only JSON-pointer schema references supported');
        for (const token of fragment.slice(1).split('/')) {
          const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
          if (!object(target) || !Object.hasOwn(target, key)) fail(path, 'Missing schema reference');
          target = target[key];
        }
      }
      check(v, target as Spec, targetDocument, path, depth + 1);
    }
    if (Object.hasOwn(s, 'const') && !same(v, s.const)) fail(path, 'Constant mismatch');
    if (s.enum && !s.enum.some((x: unknown) => same(x, v))) fail(path, 'Unknown value');
    for (const branch of s.allOf ?? []) check(v, branch, document, path, depth + 1);
    if (s.anyOf && !s.anyOf.some((x: Spec) => matches(v, x, document, path, depth + 1))) fail(path, 'No matching alternative');
    if (s.oneOf && s.oneOf.filter((x: Spec) => matches(v, x, document, path, depth + 1)).length !== 1) fail(path, 'Not exactly one alternative');
    if (s.not !== undefined && matches(v, s.not, document, path, depth + 1)) fail(path, 'Excluded alternative');
    if (s.if !== undefined) {
      const branch = matches(v, s.if, document, path, depth + 1) ? s.then : s.else;
      if (branch !== undefined) check(v, branch, document, path, depth + 1);
    }
    if (s.type !== undefined) {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      if (!types.some((t: string) => t === 'null' ? v === null : t === 'array' ? Array.isArray(v)
        : t === 'object' ? object(v) : t === 'integer' ? typeof v === 'number' && Number.isSafeInteger(v)
          : t === 'number' ? typeof v === 'number' && Number.isFinite(v) : typeof v === t)) fail(path, 'Invalid type');
    }
    if (typeof v === 'string') {
      const length = Array.from(v).length;
      if (length < (s.minLength ?? 0) || length > (s.maxLength ?? Infinity)) fail(path, 'Text length');
      if (s.pattern && !new RegExp(s.pattern, 'u').test(v)) fail(path, 'Text pattern');
      if (s.format === 'date' && !parseIsoDate(v)) fail(path, 'Invalid date');
      if (s.format === 'uri') {
        let url: URL;
        try { url = new URL(v); } catch { return fail(path, 'Invalid URI'); }
        // Historic evidence may contain HTTP. Operative sources additionally
        // require ^https:// in their bound schema. No URL is fetched here.
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail(path, 'Unsafe source URI');
      }
    }
    if (typeof v === 'number' && (v < (s.minimum ?? -Infinity) || v > (s.maximum ?? Infinity))) fail(path, 'Number range');
    if (Array.isArray(v)) {
      if (v.length < (s.minItems ?? 0) || v.length > (s.maxItems ?? Infinity)) fail(path, 'Array length');
      if (s.uniqueItems && new Set(v.map(canonicalSocialJson)).size !== v.length) fail(path, 'Duplicate value');
      if (s.items !== undefined) v.forEach((x, i) => check(x, s.items, document, `${path}/${i}`, depth + 1));
      if (s.contains !== undefined) {
        const count = v.filter(x => matches(x, s.contains, document, path, depth + 1)).length;
        if (count < (s.minContains ?? 1) || count > (s.maxContains ?? Infinity)) fail(path, 'Contains cardinality');
      }
    }
    if (object(v)) {
      for (const key of s.required ?? []) if (!Object.hasOwn(v, key)) fail(path, `Missing ${key}`);
      for (const [key, x] of Object.entries(v)) {
        let known = false;
        if (Object.hasOwn(s.properties ?? {}, key)) { check(x, s.properties[key], document, `${path}/${key}`, depth + 1); known = true; }
        for (const [pattern, child] of Object.entries(s.patternProperties ?? {})) if (new RegExp(pattern, 'u').test(key)) {
          check(x, child as Spec, document, `${path}/${key}`, depth + 1); known = true;
        }
        if (!known && s.additionalProperties !== undefined) check(x, s.additionalProperties, document, `${path}/${key}`, depth + 1);
      }
    }
  }
  check(value, root, root, '#', 0);
}
