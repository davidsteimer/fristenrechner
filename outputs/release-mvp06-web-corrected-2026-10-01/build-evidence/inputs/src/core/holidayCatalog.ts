// SPDX-License-Identifier: AGPL-3.0-only
//
// Host-neutral product contract. This module neither loads a workbook nor
// grants procedural applicability from a canton, category or area membership.
import catalogSchema from '../../schemas/holiday-catalog-v1.schema.json';
import { addCalendarDays, parseIsoDate, weekdayIndex } from './date';
import { calculateCalendarRuleOccurrence, calculateGregorianEaster } from './generateCalendar';
import type { CalendarRule, CalendarRuleSet, HolidayCalendarRule } from './calendarRuleTypes';
import type {
  HolidayCatalog, HolidayCatalogAssignment, HolidayCatalogCalculation,
  HolidayCatalogRule
} from './holidayCatalogTypes';

const BASELINE = '2026-08-31-mvp-03-approved.1';
const CANTONS = 'ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU'
  .split(' ').map(code => `CH-${code}`);

// The first DEC-2026-023 release deliberately preserves this operative contract.
// This is an explicit allow-list, not a filter by canton or workbook export class.
const REFERENCE_RULES: readonly CalendarRule[] = [
  {
    "ruleId": "CH-CAL-HOL-NATIONAL-DAY",
    "calendarId": "ch-federal-calendar",
    "jurisdiction": {
      "level": "federal",
      "code": "CH"
    },
    "labelKey": "holiday.ch.nationalDay",
    "labels": {
      "de": "Bundesfeiertag",
      "fr": "Fête nationale"
    },
    "priority": 100,
    "validity": {
      "from": "1994-07-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "locator": "Art. 1"
      }
    ],
    "calculation": {
      "type": "fixedMonthDay",
      "month": 8,
      "day": 1
    },
    "effect": {
      "type": "holiday",
      "kind": "federalHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "NATIONAL-DAY"
    }
  },
  {
    "ruleId": "CH-CAL-SUSP-EASTER",
    "calendarId": "ch-federal-calendar",
    "jurisdiction": {
      "level": "federal",
      "code": "CH"
    },
    "labelKey": "suspension.ch.easter",
    "labels": {
      "de": "Gerichtsferien über Ostern",
      "fr": "Féries judiciaires de Pâques"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-ZPO-20260701",
        "locator": "Art. 145 Abs. 1"
      },
      {
        "sourceId": "SRC-BGG-20260401",
        "locator": "Art. 46 Abs. 1"
      },
      {
        "sourceId": "SRC-VWVG-20220701",
        "locator": "Art. 22a Abs. 1"
      }
    ],
    "calculation": {
      "type": "relativePeriod",
      "startsOn": {
        "anchor": "easterSunday",
        "yearOffset": 0,
        "offsetDays": -7
      },
      "endsOn": {
        "anchor": "easterSunday",
        "yearOffset": 0,
        "offsetDays": 7
      }
    },
    "effect": {
      "type": "suspensionPeriod",
      "suspensionSetId": "ch-court-holidays",
      "applicableProfileIds": [
        "zpo",
        "bgg",
        "vwvg"
      ],
      "inclusive": true,
      "resultIdPrefix": "EASTER"
    }
  },
  {
    "ruleId": "CH-CAL-SUSP-SUMMER",
    "calendarId": "ch-federal-calendar",
    "jurisdiction": {
      "level": "federal",
      "code": "CH"
    },
    "labelKey": "suspension.ch.summer",
    "labels": {
      "de": "Gerichtsferien im Sommer",
      "fr": "Féries judiciaires d'été"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-ZPO-20260701",
        "locator": "Art. 145 Abs. 1"
      },
      {
        "sourceId": "SRC-BGG-20260401",
        "locator": "Art. 46 Abs. 1"
      },
      {
        "sourceId": "SRC-VWVG-20220701",
        "locator": "Art. 22a Abs. 1"
      }
    ],
    "calculation": {
      "type": "relativePeriod",
      "startsOn": {
        "anchor": "fixedMonthDay",
        "month": 7,
        "day": 15,
        "yearOffset": 0,
        "offsetDays": 0
      },
      "endsOn": {
        "anchor": "fixedMonthDay",
        "month": 8,
        "day": 15,
        "yearOffset": 0,
        "offsetDays": 0
      }
    },
    "effect": {
      "type": "suspensionPeriod",
      "suspensionSetId": "ch-court-holidays",
      "applicableProfileIds": [
        "zpo",
        "bgg",
        "vwvg"
      ],
      "inclusive": true,
      "resultIdPrefix": "SUMMER"
    }
  },
  {
    "ruleId": "CH-CAL-SUSP-YEAR-END",
    "calendarId": "ch-federal-calendar",
    "jurisdiction": {
      "level": "federal",
      "code": "CH"
    },
    "labelKey": "suspension.ch.yearEnd",
    "labels": {
      "de": "Gerichtsferien über den Jahreswechsel",
      "fr": "Féries judiciaires de fin d'année"
    },
    "priority": 100,
    "validity": {
      "from": "2025-12-18",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-ZPO-20260701",
        "locator": "Art. 145 Abs. 1"
      },
      {
        "sourceId": "SRC-BGG-20260401",
        "locator": "Art. 46 Abs. 1"
      },
      {
        "sourceId": "SRC-VWVG-20220701",
        "locator": "Art. 22a Abs. 1"
      }
    ],
    "calculation": {
      "type": "relativePeriod",
      "startsOn": {
        "anchor": "fixedMonthDay",
        "month": 12,
        "day": 18,
        "yearOffset": 0,
        "offsetDays": 0
      },
      "endsOn": {
        "anchor": "fixedMonthDay",
        "month": 1,
        "day": 2,
        "yearOffset": 1,
        "offsetDays": 0
      }
    },
    "effect": {
      "type": "suspensionPeriod",
      "suspensionSetId": "ch-court-holidays",
      "applicableProfileIds": [
        "zpo",
        "bgg",
        "vwvg"
      ],
      "inclusive": true,
      "resultIdPrefix": "YEAR-END"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-NEW-YEAR",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.newYear",
    "labels": {
      "de": "Neujahr",
      "fr": "Nouvel An"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. c"
      }
    ],
    "calculation": {
      "type": "fixedMonthDay",
      "month": 1,
      "day": 1
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "NEW-YEAR"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-BERCHTOLD-DAY",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.berchtoldDay",
    "labels": {
      "de": "Berchtoldstag",
      "fr": "Saint-Berchtold"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. c"
      }
    ],
    "calculation": {
      "type": "fixedMonthDay",
      "month": 1,
      "day": 2
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "BERCHTOLD-DAY"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-GOOD-FRIDAY",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.goodFriday",
    "labels": {
      "de": "Karfreitag",
      "fr": "Vendredi saint"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. b"
      }
    ],
    "calculation": {
      "type": "easterOffsetDays",
      "offsetDays": -2
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "GOOD-FRIDAY"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-EASTER",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.easter",
    "labels": {
      "de": "Ostern",
      "fr": "Pâques"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. b"
      }
    ],
    "calculation": {
      "type": "easterOffsetDays",
      "offsetDays": 0
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "EASTER"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-EASTER-MONDAY",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.easterMonday",
    "labels": {
      "de": "Ostermontag",
      "fr": "Lundi de Pâques"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. c"
      }
    ],
    "calculation": {
      "type": "easterOffsetDays",
      "offsetDays": 1
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "EASTER-MONDAY"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-ASCENSION",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.ascension",
    "labels": {
      "de": "Auffahrt",
      "fr": "Ascension"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. b"
      }
    ],
    "calculation": {
      "type": "easterOffsetDays",
      "offsetDays": 39
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "ASCENSION"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-PENTECOST",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.pentecost",
    "labels": {
      "de": "Pfingsten",
      "fr": "Pentecôte"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. b"
      }
    ],
    "calculation": {
      "type": "easterOffsetDays",
      "offsetDays": 49
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "PENTECOST"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-WHIT-MONDAY",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.whitMonday",
    "labels": {
      "de": "Pfingstmontag",
      "fr": "Lundi de Pentecôte"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. c"
      }
    ],
    "calculation": {
      "type": "easterOffsetDays",
      "offsetDays": 50
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "WHIT-MONDAY"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-FEDERAL-FAST",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.federalFast",
    "labels": {
      "de": "Eidgenössischer Dank-, Buss- und Bettag",
      "fr": "Jeûne fédéral"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. b"
      }
    ],
    "calculation": {
      "type": "nthWeekdayOfMonth",
      "month": 9,
      "isoWeekday": 7,
      "occurrence": 3
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "FEDERAL-FAST"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-CHRISTMAS",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.christmas",
    "labels": {
      "de": "Weihnachten",
      "fr": "Noël"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. b"
      }
    ],
    "calculation": {
      "type": "fixedMonthDay",
      "month": 12,
      "day": 25
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "CHRISTMAS"
    }
  },
  {
    "ruleId": "BE-CAL-HOL-ST-STEPHEN",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "labelKey": "holiday.be.stStephen",
    "labels": {
      "de": "Stephanstag",
      "fr": "Saint-Étienne"
    },
    "priority": 100,
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "sourceRefs": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "locator": "Art. 2 Abs. 1 Bst. c"
      }
    ],
    "calculation": {
      "type": "fixedMonthDay",
      "month": 12,
      "day": 26
    },
    "effect": {
      "type": "holiday",
      "kind": "cantonalPublicHoliday",
      "legalEffect": "nonWorkingDayEquivalentToSunday",
      "resultIdSuffix": "ST-STEPHEN"
    }
  }
];
const REFERENCE_HOLIDAYS = REFERENCE_RULES.filter((rule): rule is HolidayCalendarRule => rule.effect.type === 'holiday');

export class HolidayCatalogError extends Error {
  public override readonly name = 'HolidayCatalogError';
  public constructor(public readonly reasonKey: string, message: string) {
    super(message);
    // SPFx targets ES5: native Error returns its own instance, so restore the
    // subclass prototype used by the schema interpreter's narrow oneOf catch.
    Object.setPrototypeOf(this, HolidayCatalogError.prototype);
  }
}

function fail(message: string): never {
  throw new HolidayCatalogError('holidayCatalog.invalidContract', message);
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort()
    .map(key => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function equal(actual: unknown, expected: unknown, label: string): void {
  if (stable(actual) !== stable(expected)) fail(`Unveränderter Vertrag verletzt: ${label}`);
}

// The repository schema uses this intentionally small, closed subset. The
// independent release audit additionally evaluates the full JSON Schema.
// No schema or validator code is supplied by downloaded releases.
type Schema = {
  readonly $ref?: string; readonly const?: unknown; readonly enum?: readonly unknown[];
  readonly oneOf?: readonly Schema[]; readonly type?: string; readonly pattern?: string;
  readonly minLength?: number; readonly minimum?: number; readonly maximum?: number;
  readonly minItems?: number; readonly maxItems?: number; readonly items?: Schema;
  readonly required?: readonly string[]; readonly properties?: Readonly<Record<string, Schema>>;
  readonly additionalProperties?: boolean; readonly format?: string;
};
const SCHEMA = catalogSchema as unknown as Schema & { readonly $defs: Readonly<Record<string, Schema>> };
// All four patterns are repository-owned literals. New patterns need an
// explicit interpreter change, never dynamic compilation from schema text.
const SCHEMA_PATTERNS: ReadonlyMap<string, RegExp> = new Map([
  ['\\S', /\S/],
  ['^[A-Za-z0-9][A-Za-z0-9._-]*$', /^[A-Za-z0-9][A-Za-z0-9._-]*$/],
  ['^https://', /^https:\/\//],
  ['^\\d{4}-\\d{2}-\\d{2}$', /^\d{4}-\d{2}-\d{2}$/]
]);
function schemaPattern(value: unknown): RegExp {
  const pattern = typeof value === 'string' ? SCHEMA_PATTERNS.get(value) : undefined;
  if (!pattern) fail('Nicht unterstütztes Schema-Muster');
  return pattern;
}

/** Detects schema evolution before this deliberately limited interpreter runs. */
export function assertHolidayCatalogSchemaContract(value: unknown): void {
  const allowed = new Set(['$schema', '$id', '$defs', '$ref', 'title', 'description', 'const', 'enum',
    'oneOf', 'type', 'pattern', 'minLength', 'minimum', 'maximum', 'minItems', 'maxItems',
    'items', 'required', 'properties', 'additionalProperties', 'format']);
  function visit(node: unknown, path: string, depth: number): void {
    if (depth > 32 || !node || typeof node !== 'object' || Array.isArray(node)) fail(`Nicht unterstützte Schemabeschreibung: ${path}`);
    const row = node as Record<string, unknown>;
    for (const key of Object.keys(row)) if (!allowed.has(key)) fail(`Nicht unterstütztes Schema-Schlüsselwort: ${path}/${key}`);
    if (row.type !== undefined && !['null', 'string', 'integer', 'array', 'object'].includes(row.type as string)) {
      fail(`Nicht unterstützter Schema-Datentyp: ${path}`);
    }
    if (row.format !== undefined && !['date', 'uri'].includes(row.format as string)) fail(`Nicht unterstütztes Schema-Format: ${path}`);
    if (row.pattern !== undefined) schemaPattern(row.pattern);
    if (row.$ref !== undefined && (typeof row.$ref !== 'string' || !row.$ref.startsWith('#/$defs/')
      || Object.keys(row).some(key => !['$ref', 'title', 'description'].includes(key)))) {
      fail(`Nicht unterstützte Schemareferenz oder Referenz-Geschwister: ${path}`);
    }
    if (row.additionalProperties !== undefined && row.additionalProperties !== false) fail(`Nur geschlossene Objektschemata unterstützt: ${path}`);
    if (row.$defs !== undefined && path !== '#') fail('Verschachtelte Schemadefinitionen werden nicht unterstützt');
    for (const key of ['$defs', 'properties']) {
      const children = row[key];
      if (children !== undefined) {
        if (!children || typeof children !== 'object' || Array.isArray(children)) fail(`Ungültige Schema-Objektfelder: ${path}/${key}`);
        for (const [name, child] of Object.entries(children)) visit(child, `${path}/${key}/${name}`, depth + 1);
      }
    }
    if (row.items !== undefined) visit(row.items, `${path}/items`, depth + 1);
    if (row.oneOf !== undefined) {
      if (!Array.isArray(row.oneOf) || row.oneOf.length === 0) fail(`Ungültige Schema-Alternativen: ${path}`);
      row.oneOf.forEach((child, index) => visit(child, `${path}/oneOf/${index}`, depth + 1));
    }
  }
  visit(value, '#', 0);
}
assertHolidayCatalogSchemaContract(catalogSchema);

function validateStructure(value: unknown, specification: Schema, path: string): void {
  if (specification.$ref) {
    const definition = SCHEMA.$defs[specification.$ref.replace('#/$defs/', '')];
    if (!definition || !specification.$ref.startsWith('#/$defs/')) fail('Unbekannte interne Schemareferenz');
    validateStructure(value, definition, path);
    return;
  }
  if (Object.hasOwn(specification, 'const')) equal(value, specification.const, path);
  if (specification.enum && !specification.enum.some(option => stable(option) === stable(value))) fail(`Unbekannter Wert: ${path}`);
  if (specification.oneOf) {
    let matches = 0;
    for (const choice of specification.oneOf) {
      try { validateStructure(value, choice, path); matches++; }
      catch (error) { if (!(error instanceof HolidayCatalogError)) throw error; }
    }
    if (matches !== 1) fail(`Kein eindeutiger Datentyp: ${path}`);
  }
  switch (specification.type) {
    case 'null': if (value !== null) fail(`Null erwartet: ${path}`); break;
    case 'string':
      if (typeof value !== 'string' || (specification.minLength !== undefined && value.length < specification.minLength)
        || (specification.pattern !== undefined && !schemaPattern(specification.pattern).test(value))) fail(`Ungültiger Text: ${path}`);
      if (specification.format === 'date' && !parseIsoDate(value)) fail(`Ungültiges Datum: ${path}`);
      if (specification.format === 'uri') {
        let parsed: URL;
        try { parsed = new URL(value); } catch { fail(`Ungültige Quellen-URL: ${path}`); }
        if (parsed.protocol !== 'https:' || parsed.username || parsed.password) fail(`Ungültige Quellen-URL: ${path}`);
      }
      break;
    case 'integer':
      if (typeof value !== 'number' || !Number.isSafeInteger(value)
        || (specification.minimum !== undefined && value < specification.minimum)
        || (specification.maximum !== undefined && value > specification.maximum)) fail(`Ungültige Ganzzahl: ${path}`);
      break;
    case 'array':
      if (!Array.isArray(value) || value.length < (specification.minItems ?? 0)
        || value.length > (specification.maxItems ?? Number.MAX_SAFE_INTEGER)) fail(`Ungültige Liste: ${path}`);
      if (!specification.items) fail('Interne Array-Schemabeschreibung fehlt');
      value.forEach((entry, index) => validateStructure(entry, specification.items!, `${path}/${index}`));
      break;
    case 'object': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) fail(`Objekt erwartet: ${path}`);
      const record = value as Record<string, unknown>;
      if ((specification.required ?? []).some(key => !Object.hasOwn(record, key))) fail(`Pflichtfeld fehlt: ${path}`);
      for (const [key, entry] of Object.entries(record)) {
        const property = specification.properties && Object.hasOwn(specification.properties, key)
          ? specification.properties[key] : undefined;
        if (!property) {
          if (specification.additionalProperties === false) fail(`Unbekanntes Kernfeld: ${path}/${key}`);
        } else validateStructure(entry, property, `${path}/${key}`);
      }
      break;
    }
  }
}

function unique<T extends { readonly id: string }>(rows: readonly T[], label: string): ReadonlyMap<string, T> {
  const index = new Map<string, T>();
  for (const row of rows) {
    if (index.has(row.id)) fail(`Doppelte ${label}: ${row.id}`);
    index.set(row.id, row);
  }
  return index;
}
function reference<T>(index: ReadonlyMap<string, T>, id: string, label: string): T {
  const row = index.get(id);
  if (!row) fail(`Nicht auflösbare ${label}: ${id}`);
  return row;
}
function interval(from: string, to: string | null, label: string): void {
  if (!parseIsoDate(from) || (to !== null && (!parseIsoDate(to) || to < from))) fail(`Ungültige Gültigkeit: ${label}`);
}
function encloses(outer: {readonly from: string; readonly to: string | null}, inner: {readonly from: string; readonly to: string | null}): boolean {
  return outer.from <= inner.from && (outer.to === null || (inner.to !== null && outer.to >= inner.to));
}
function active(from: string, to: string | null, date: string): boolean {
  return date >= from && (to === null || date <= to);
}
function assertCalculation(calculation: HolidayCatalogCalculation): void {
  validateStructure(calculation, SCHEMA.$defs.calculation!, 'calculation');
  if (calculation.type === 'fixedMonthDay'
    && !parseIsoDate(`2000-${String(calculation.month).padStart(2, '0')}-${String(calculation.day).padStart(2, '0')}`)) {
    fail('Ungültige Kombination von Monat und Tag');
  }
}
function assertCondition(rule: HolidayCatalogRule): void {
  const c = rule.calculation;
  if (rule.condition === 'unlessTuesdayOrSaturday' && !(c.type === 'fixedMonthDay' && c.month === 12 && c.day === 26)) {
    fail('unlessTuesdayOrSaturday benötigt den 26. Dezember');
  }
  if (rule.condition === 'onlyMonday' && !(c.type === 'fixedMonthDay' && ((c.month === 1 && c.day === 2) || (c.month === 12 && c.day === 26)))) {
    fail('onlyMonday benötigt den 2. Januar oder den 26. Dezember');
  }
  if (rule.condition === 'shiftHolyThursdayBy7Days'
    && !(c.type === 'nthWeekdayOfMonth' && c.month === 4 && c.isoWeekday === 4 && c.occurrence === 1)) {
    fail('shiftHolyThursdayBy7Days benötigt den ersten Donnerstag im April');
  }
  if (rule.condition !== 'always' && (rule.dayPortion !== 'fullDay' || rule.status === 'approved'
    || rule.exportClass !== 'blockedEffect' || rule.approvalBasis !== null)) {
    fail('Bedingte Katalogregel ohne operative Freigabe benötigt einen ganzen Tag und blockedEffect');
  }
}

/** Dates an archival catalog fact, never a procedural permission. */
export function evaluateHolidayCatalogRule(rule: HolidayCatalogRule, year: number): {
  readonly status: 'occurs' | 'notApplicable' | 'outsideValidity'; readonly date: string | null;
} {
  validateStructure(rule, SCHEMA.$defs.rule!, 'rule');
  assertCalculation(rule.calculation);
  assertCondition(rule);
  interval(rule.from, rule.to, rule.id);
  if (!Number.isInteger(year) || year < 1583 || year > 9999) fail('Gregorianisches Ankerjahr muss zwischen 1583 und 9999 liegen');
  const c = rule.calculation;
  const base = c.type === 'nthWeekdayOffsetDays'
    ? calculateCalendarRuleOccurrence({ type: 'nthWeekdayOfMonth', month: c.month, isoWeekday: c.isoWeekday, occurrence: c.occurrence }, year, rule.id)
    : calculateCalendarRuleOccurrence(c, year, rule.id);
  if (!('date' in base)) fail('Datum statt Periode erwartet');
  let date = c.type === 'nthWeekdayOffsetDays' ? addCalendarDays(base.date, c.offsetDays) : base.date;
  const parsed = parseIsoDate(date);
  if (!parsed || parsed.year < 1583 || parsed.year > 9999) fail('Resultat ausserhalb des unterstützten gregorianischen Bereichs');
  const weekday = weekdayIndex(date) + 1;
  if ((rule.condition === 'unlessTuesdayOrSaturday' && [2, 6].includes(weekday))
    || (rule.condition === 'onlyMonday' && weekday !== 1)) return { status: 'notApplicable', date: null };
  if (rule.condition === 'shiftHolyThursdayBy7Days' && date === addCalendarDays(calculateGregorianEaster(year), -3)) {
    date = addCalendarDays(date, 7);
  }
  if (!active(rule.from, rule.to, date)) return { status: 'outsideValidity', date: null };
  return { status: 'occurs', date };
}

function areaDefinitions(assignments: readonly HolidayCatalogAssignment[]): ReadonlyMap<string, HolidayCatalogAssignment> {
  const areas = new Map<string, HolidayCatalogAssignment>();
  for (const row of assignments) {
    const prior = areas.get(row.areaId);
    if (prior) {
      for (const key of ['de', 'fr', 'it', 'rm', 'areaType', 'parentAreaId', 'officialIdSystem', 'officialId'] as const) {
        equal(row[key], prior[key], `Gebietsdefinition ${row.areaId}/${key}`);
      }
    }
    areas.set(row.areaId, row);
  }
  return areas;
}
function contains(areas: ReadonlyMap<string, HolidayCatalogAssignment>, outer: string, inner: string): boolean {
  const visited = new Set<string>();
  for (let row = areas.get(inner); row; row = row.parentAreaId === null ? undefined : areas.get(row.parentAreaId)) {
    if (visited.has(row.areaId)) fail(`Zyklische Gebietshierarchie: ${row.areaId}`);
    visited.add(row.areaId);
    if (row.areaId === outer) return true;
  }
  return false;
}

/** Schema, all references, bounded approvals and the explicit activation list. */
export function assertHolidayCatalog(value: unknown): asserts value is HolidayCatalog {
  validateStructure(value, SCHEMA, 'holidayCatalog');
  const catalog = value as HolidayCatalog;
  const data = catalog.data;
  const jurisdictions = unique(data.jurisdictions, 'Gemeinwesen');
  equal([...jurisdictions.keys()].sort(), ['CH', ...CANTONS].sort(), 'Bund und 26 Kantone');
  for (const row of data.jurisdictions) {
    equal(row.parentId, row.id === 'CH' ? null : 'CH', `Gemeinweseneltern ${row.id}`);
    if (row.status === 'approved' && !['CH', 'CH-BE'].includes(row.id)) fail(`Unzulässige historische Gemeinwesenfreigabe: ${row.id}`);
  }
  const sources = unique(data.sources, 'Quellen-ID');
  const scopes = unique(data.scopes, 'Geltungs-ID');
  const rules = unique(data.rules, 'Regel-ID');
  const assignments = unique(data.assignments, 'Gebietszuordnungs-ID');
  unique(data.mappings, 'Verfahrenshinweis-ID');
  unique(data.reviews, 'Quellenprüfungs-ID');
  for (const row of data.sources) {
    reference(jurisdictions, row.jurisdiction, 'Quellengemeinwesen');
    if (row.status === 'approved'
      ? row.approvalBasis !== BASELINE || !['SRC-BUNDESFEIERTAG-19940701', 'SRC-FRG-BE-20210401'].includes(row.id)
      : row.approvalBasis !== null) fail(`Unzulässige historische Quellenfreigabe: ${row.id}`);
  }
  for (const row of data.scopes) {
    reference(jurisdictions, row.jurisdiction, 'Geltungsgemeinwesen');
    if (reference(sources, row.source, 'Geltungsquelle').jurisdiction !== row.jurisdiction) fail(`Kantonsfremde Geltungsquelle: ${row.id}`);
    if (row.status === 'approved' && !['CH-ALL', 'BE-ALL'].includes(row.id)) fail(`Unzulässige historische Geltungsfreigabe: ${row.id}`);
    interval(row.from, row.to, row.id);
  }
  for (const rule of data.rules) {
    const scope = reference(scopes, rule.scope, 'Regelgeltung');
    const source = reference(sources, rule.source, 'Regelquelle');
    if (scope.jurisdiction !== rule.jurisdiction || ![rule.jurisdiction, 'CH'].includes(source.jurisdiction)) fail(`Kantonsfremde Regelzuordnung: ${rule.id}`);
    if (!encloses(scope, rule)) fail(`Regelgültigkeit überschreitet Geltungsbereich: ${rule.id}`);
    if (rule.status === 'approved') {
      if (rule.approvalBasis !== BASELINE || rule.exportClass !== 'referenceOnly'
        || !REFERENCE_HOLIDAYS.some(item => item.ruleId === rule.id) || rule.category !== 'publicHoliday'
        || rule.dayPortion !== 'fullDay' || rule.condition !== 'always') fail(`Unzulässige historische Regelfreigabe: ${rule.id}`);
    } else if (rule.approvalBasis !== null || rule.exportClass === 'referenceOnly') fail(`Übernommene Freigabe ohne Grundlage: ${rule.id}`);
    if (rule.dayPortion !== 'fullDay' && rule.exportClass !== 'blockedEffect') fail(`Halbtag darf keine Fristwirkung erhalten: ${rule.id}`);
    for (const year of [2026, 2027, 2028]) evaluateHolidayCatalogRule(rule, year);
  }
  for (const row of data.mappings) {
    reference(scopes, row.scope, 'Verfahrensgeltung');
    if (row.status === 'approved'
      ? !['CH-ALL', 'BE-ALL'].includes(row.scope) || row.approvalBasis !== BASELINE
      : row.approvalBasis !== null) fail(`Unzulässige historische Verfahrensfreigabe: ${row.id}`);
  }
  for (const row of data.reviews) reference(sources, row.source, 'Geprüfte Quelle');
  const areas = areaDefinitions(data.assignments);
  const levels: Readonly<Record<HolidayCatalogAssignment['areaType'], readonly (string | null)[]>> = {
    Bund: [null], Kanton: ['Bund'], Bezirk: ['Kanton'], Gemeinde: ['Kanton', 'Bezirk'],
    Ortsteil: ['Gemeinde'], Gebietsgruppe: ['Kanton', 'Bezirk']
  };
  for (const row of areas.values()) {
    const parent = row.parentAreaId === null ? null : reference(areas, row.parentAreaId, 'Elterngebiet');
    if (!levels[row.areaType].includes(parent?.areaType ?? null)) fail(`Ungültige Gebietsebene: ${row.areaId}`);
    if (row.areaType === 'Bund' && row.areaId !== 'GEO-CH') fail('Unbekanntes Bundesgebiet');
    if (row.areaType === 'Kanton' && !CANTONS.includes(`CH-${row.areaId.slice(4)}`)) fail('Unbekanntes Kantonsgebiet');
    // A complete walk also rejects cycles that do not contain the queried root.
    contains(areas, '__unreachable__', row.areaId);
  }
  for (const row of data.assignments) {
    const scope = reference(scopes, row.scopeId, 'Gebietsgeltung');
    const source = reference(sources, row.sourceId, 'Gebietsquelle');
    if (source.jurisdiction !== scope.jurisdiction) fail(`Kantonsfremde Gebietsquelle: ${row.id}`);
    interval(row.from, row.to, row.id);
    if (!encloses(scope, row)) fail(`Gebietszuordnung überschreitet Geltungsbereich: ${row.id}`);
    let top = row;
    while (!['Bund', 'Kanton'].includes(top.areaType)) top = reference(areas, top.parentAreaId!, 'Obergebiet');
    if (scope.jurisdiction !== (top.areaId === 'GEO-CH' ? 'CH' : `CH-${top.areaId.slice(4)}`)) fail(`Kantonsfremde Gebietszuordnung: ${row.id}`);
    if (row.effect === 'exclude' && !data.assignments.some(other =>
      other.scopeId === row.scopeId && other.effect === 'include' && contains(areas, other.areaId, row.areaId) && encloses(other, row))) {
      fail(`Ausschluss ohne zeitlich vollständigen Einschluss: ${row.id}`);
    }
  }
  for (let index = 0; index < data.assignments.length; index++) {
    const a = data.assignments[index]!;
    for (const b of data.assignments.slice(index + 1)) {
      if (a.scopeId === b.scopeId && a.areaId === b.areaId && a.from <= (b.to ?? '9999-12-31')
        && b.from <= (a.to ?? '9999-12-31')) fail(`Überlappende Gebietszuordnungen: ${a.id}/${b.id}`);
    }
  }
  for (const scope of data.scopes) if (!data.assignments.some(row => row.scopeId === scope.id && row.effect === 'include')) fail(`Geltungsbereich ohne Einschluss: ${scope.id}`);
  const links = new Map<string, HolidayCatalog['areaSourceLinks'][number]>();
  for (const link of catalog.areaSourceLinks) {
    if (links.has(link.assignmentId)) fail(`Doppelter Gebietsquellenbeleg: ${link.assignmentId}`);
    const assignment = reference(assignments, link.assignmentId, 'Gebietsquellenbeleg-Zuordnung');
    const scope = reference(scopes, link.scopeId, 'Gebietsquellenbeleg-Geltung');
    if (assignment.scopeId !== link.scopeId || assignment.sourceId !== link.areaSourceId
      || scope.source !== link.normSourceId || link.normSourceId === link.areaSourceId) fail(`Widersprüchlicher Gebietsquellenbeleg: ${link.assignmentId}`);
    reference(sources, link.areaSourceId, 'Gebietsbeleg');
    reference(sources, link.normSourceId, 'Normbeleg');
    equal(link.locator, assignment.locator, 'Gebietsquellenbeleg-Fundstelle');
    equal(link.note, assignment.note, 'Gebietsquellenbeleg-Prüfhinweis');
    equal(link.provenance, assignment.provenance, 'Gebietsquellenbeleg-Herkunft');
    links.set(link.assignmentId, link);
  }
  for (const row of data.assignments) {
    const needed = reference(scopes, row.scopeId, 'Gebietsgeltung').source !== row.sourceId;
    if (needed !== links.has(row.id)) fail(`Fehlender oder unnötiger Gebietsquellenbeleg: ${row.id}`);
  }
  const expected = REFERENCE_HOLIDAYS.map(rule => ({
    catalogRuleId: rule.ruleId, calendarId: rule.calendarId, ruleId: rule.ruleId,
    labelKey: rule.labelKey, kind: rule.effect.kind, resultIdSuffix: rule.effect.resultIdSuffix,
    legalEffect: rule.effect.legalEffect, approvalBasis: BASELINE
  }));
  equal([...catalog.calendarProjections].sort((a,b) => a.ruleId.localeCompare(b.ruleId)),
    expected.sort((a,b) => a.ruleId.localeCompare(b.ruleId)), 'Abschliessende CH/BE-Projektionsliste');
  for (const projection of catalog.calendarProjections) {
    const rule = reference(rules, projection.catalogRuleId, 'Projektionsregel');
    if (rule.status !== 'approved' || rule.dayPortion !== 'fullDay' || rule.condition !== 'always'
      || rule.category !== 'publicHoliday' || rule.action !== 'add' || rule.exportClass !== 'referenceOnly') {
      fail(`Nicht freigegebene operative Projektionsregel: ${rule.id}`);
    }
    const projected = projectOne(rule, projection);
    equal(projected, REFERENCE_HOLIDAYS.find(item => item.ruleId === projection.ruleId), `Historische Kalenderregel ${projection.ruleId}`);
  }
}

function projectOne(rule: HolidayCatalogRule, projection: HolidayCatalog['calendarProjections'][number]): HolidayCalendarRule {
  if (rule.calculation.type === 'nthWeekdayOffsetDays') fail('Offset-Wochentagsregel gehört nicht zur CH/BE-Projektion');
  return {
    ruleId: projection.ruleId, calendarId: projection.calendarId,
    jurisdiction: rule.jurisdiction === 'CH' ? { level: 'federal', code: 'CH' } : { level: 'cantonal', code: rule.jurisdiction.slice(3) },
    labelKey: projection.labelKey, labels: { de: rule.de, fr: rule.fr }, priority: rule.priority,
    validity: { from: rule.from, to: rule.to }, sourceRefs: [{ sourceId: rule.source, locator: rule.locator }],
    calculation: { ...rule.calculation },
    effect: { type: 'holiday', kind: projection.kind, legalEffect: projection.legalEffect, resultIdSuffix: projection.resultIdSuffix }
  };
}

export function projectHolidayRules(catalog: HolidayCatalog): readonly HolidayCalendarRule[] {
  assertHolidayCatalog(catalog);
  const rules = new Map(catalog.data.rules.map(rule => [rule.id, rule]));
  // Reference order is deterministic even when the catalog input order changes.
  return REFERENCE_HOLIDAYS.map(expected => {
    const projection = catalog.calendarProjections.find(item => item.ruleId === expected.ruleId)!;
    return projectOne(reference(rules, projection.catalogRuleId, 'Projektionsregel'), projection);
  });
}

/** Rejects additions, omissions, changed inheritance and changed court holidays. */
export function assertHolidayCatalogProjection(catalog: HolidayCatalog, calendars: readonly CalendarRuleSet[]): void {
  const expected = projectHolidayRules(catalog);
  equal(calendars.map(calendar => calendar.calendarId).sort(), ['be-public-holidays', 'ch-federal-calendar'], 'Operative Kalender-IDs');
  const allRules: CalendarRule[] = [];
  for (const calendar of calendars) {
    if (calendar.formatVersion !== '2.0.0' || calendar.dataKind !== 'calendar') fail('Operativer Kalendervertrag 2.0.0 erforderlich');
    equal(calendar.inherits, calendar.calendarId === 'be-public-holidays' ? ['ch-federal-calendar'] : [], 'Kalendervererbung');
    equal(calendar.jurisdiction, calendar.calendarId === 'be-public-holidays' ? { level: 'cantonal', code: 'BE' } : { level: 'federal', code: 'CH' }, 'Kalendergemeinwesen');
    equal(calendar.validity, { from: calendar.calendarId === 'be-public-holidays' ? '2026-01-01' : '2025-12-18', to: null }, 'Kalendergültigkeit');
    if (calendar.rules.some(rule => rule.calendarId !== calendar.calendarId)) fail('Operative Regel im falschen Kalender');
    allRules.push(...calendar.rules);
  }
  const holidays = allRules.filter(rule => rule.effect.type === 'holiday');
  equal(holidays.sort((a,b) => a.ruleId.localeCompare(b.ruleId)),
    [...expected].sort((a,b) => a.ruleId.localeCompare(b.ruleId)), 'Operative Feiertagsprojektion');
  equal(allRules.filter(rule => rule.effect.type !== 'holiday').sort((a,b) => a.ruleId.localeCompare(b.ruleId)),
    REFERENCE_RULES.filter(rule => rule.effect.type !== 'holiday').sort((a,b) => a.ruleId.localeCompare(b.ruleId)), 'Unveränderte Gerichtsferien ohne Zusatzregeln');
}

/** Factual geographic membership only. It never selects a deadline calendar. */
export function isHolidayCatalogScopeMember(catalog: HolidayCatalog, scopeId: string, areaId: string, date: string): boolean {
  assertHolidayCatalog(catalog);
  if (!parseIsoDate(date)) fail('Ungültiges Datum der Gebietsabfrage');
  const scope = catalog.data.scopes.find(row => row.id === scopeId);
  if (!scope) fail(`Unbekannter Geltungsbereich: ${scopeId}`);
  const areas = areaDefinitions(catalog.data.assignments);
  reference(areas, areaId, 'Abgefragtes Gebiet');
  if (!active(scope.from, scope.to, date)) return false;
  const applicable = catalog.data.assignments.filter(row => row.scopeId === scopeId
    && active(row.from, row.to, date) && contains(areas, row.areaId, areaId));
  return applicable.some(row => row.effect === 'include') && !applicable.some(row => row.effect === 'exclude');
}
