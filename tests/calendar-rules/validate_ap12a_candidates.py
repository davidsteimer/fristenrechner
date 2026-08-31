#!/usr/bin/env python3
"""Validiert das AP12A-Kalendermodell und seinen Referenzvertrag."""

from __future__ import annotations

import json
import sys
from copy import deepcopy
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIRECTORY = REPOSITORY_ROOT / "schemas"
CANDIDATE_DIRECTORY = (
    REPOSITORY_ROOT
    / "data"
    / "candidates"
    / "2026-08-31-ap12a-eternal-calendar"
)
REFERENCE_SUITE_PATH = (
    REPOSITORY_ROOT
    / "tests"
    / "calendar-rules"
    / "candidates"
    / "ap12a-reference-cases.json"
)
SCHEMA_FILES = (
    "common.schema.json",
    "calendar-rules-v2.schema.json",
    "calendar-rule-reference-suite.schema.json",
)


class CandidateValidationError(Exception):
    """Fasst sämtliche Fehler des AP12A-Kandidaten zusammen."""

    def __init__(self, errors: list[str]):
        self.errors = sorted(set(errors))
        super().__init__("\n".join(self.errors))


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CandidateValidationError([f"{path}: ungültiges JSON: {error}"]) from error


def load_registry() -> tuple[dict[str, dict[str, Any]], Registry]:
    schemas = {name: load_json(SCHEMA_DIRECTORY / name) for name in SCHEMA_FILES}
    errors: list[str] = []
    for name, schema in schemas.items():
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:
            errors.append(f"schemas/{name}: ungültiges JSON-Schema: {error}")
    if errors:
        raise CandidateValidationError(errors)
    registry = Registry().with_resources(
        (schema["$id"], Resource.from_contents(schema))
        for schema in schemas.values()
    )
    return schemas, registry


def schema_errors(
    instance: dict[str, Any],
    schema: dict[str, Any],
    registry: Registry,
    display_path: str,
) -> list[str]:
    validator = Draft202012Validator(
        schema,
        registry=registry,
        format_checker=FormatChecker(),
    )
    errors: list[str] = []
    for error in sorted(validator.iter_errors(instance), key=lambda item: list(item.path)):
        location = "/".join(str(part) for part in error.path)
        suffix = f" bei /{location}" if location else ""
        errors.append(f"{display_path}: Schemafehler{suffix}: {error.message}")
    return errors


def parse_iso(value: str) -> date:
    return date.fromisoformat(value)


def validity_contains(validity: dict[str, str | None], value: date) -> bool:
    start = parse_iso(str(validity["from"]))
    end_value = validity["to"]
    end = parse_iso(end_value) if isinstance(end_value, str) else None
    return value >= start and (end is None or value <= end)


def validities_overlap(
    left: dict[str, str | None],
    right: dict[str, str | None],
) -> bool:
    left_start = parse_iso(str(left["from"]))
    right_start = parse_iso(str(right["from"]))
    left_end = parse_iso(left["to"]) if isinstance(left["to"], str) else date.max
    right_end = parse_iso(right["to"]) if isinstance(right["to"], str) else date.max
    return max(left_start, right_start) <= min(left_end, right_end)


def gregorian_easter(year: int) -> date:
    """Berechnet den gregorianischen Ostersonntag nach Meeus/Jones/Butcher."""

    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31
    day = (h + l - 7 * m + 114) % 31 + 1
    return date(year, month, day)


def calculate_date(calculation: dict[str, Any], year: int) -> date:
    calculation_type = calculation["type"]
    if calculation_type == "fixedMonthDay":
        return date(year, calculation["month"], calculation["day"])
    if calculation_type == "easterOffsetDays":
        return gregorian_easter(year) + timedelta(days=calculation["offsetDays"])
    if calculation_type == "nthWeekdayOfMonth":
        first = date(year, calculation["month"], 1)
        weekday_delta = (calculation["isoWeekday"] - first.isoweekday()) % 7
        result = first + timedelta(
            days=weekday_delta + 7 * (calculation["occurrence"] - 1)
        )
        if result.month != calculation["month"]:
            raise ValueError("Das verlangte Wochentagsvorkommen existiert nicht.")
        return result
    raise ValueError(f"Nicht unterstützte Datumsberechnung: {calculation_type}")


def calculate_boundary(boundary: dict[str, Any], year: int) -> date:
    anchor_year = year + boundary["yearOffset"]
    if boundary["anchor"] == "fixedMonthDay":
        anchor = date(anchor_year, boundary["month"], boundary["day"])
    elif boundary["anchor"] == "easterSunday":
        anchor = gregorian_easter(anchor_year)
    else:
        raise ValueError(f"Nicht unterstützter Periodenanker: {boundary['anchor']}")
    return anchor + timedelta(days=boundary["offsetDays"])


def calculate_reference(calculation: dict[str, Any], year: int) -> dict[str, str]:
    if calculation["type"] == "relativePeriod":
        return {
            "startsOn": calculate_boundary(calculation["startsOn"], year).isoformat(),
            "endsOn": calculate_boundary(calculation["endsOn"], year).isoformat(),
        }
    return {"date": calculate_date(calculation, year).isoformat()}


def semantic_calendar_errors(calendars: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    calendars_by_id = {calendar["calendarId"]: calendar for calendar in calendars}
    if len(calendars_by_id) != len(calendars):
        errors.append("Doppelte Kalender-ID im AP12A-Kandidatenbestand")

    for calendar in calendars:
        calendar_id = calendar["calendarId"]
        validity = calendar["validity"]
        if isinstance(validity["to"], str) and validity["from"] > validity["to"]:
            errors.append(f"{calendar_id}: umgekehrte Kalendergültigkeit")
        source_ids = {source["sourceId"] for source in calendar["sources"]}
        rule_ids: set[str] = set()
        rules_by_id = {rule["ruleId"]: rule for rule in calendar["rules"]}
        override_collisions: set[tuple[str, str, int]] = set()
        for rule in calendar["rules"]:
            rule_id = rule["ruleId"]
            if rule_id in rule_ids:
                errors.append(f"{calendar_id}: doppelte Regel-ID {rule_id}")
            rule_ids.add(rule_id)
            if rule["calendarId"] != calendar_id:
                errors.append(f"{calendar_id}: falsche Kalender-ID in {rule_id}")
            if rule["jurisdiction"] != calendar["jurisdiction"]:
                errors.append(f"{calendar_id}: falsches Gemeinwesen in {rule_id}")
            if not validities_overlap(validity, rule["validity"]):
                errors.append(f"{calendar_id}: {rule_id} liegt ausserhalb der Kalendergültigkeit")
            for source_ref in rule["sourceRefs"]:
                if source_ref["sourceId"] not in source_ids:
                    errors.append(
                        f"{calendar_id}: {rule_id} verweist auf unbekannte Quelle "
                        f"{source_ref['sourceId']}"
                    )
            calculation = rule["calculation"]
            effect = rule["effect"]
            calculation_type = calculation["type"]
            if calculation_type == "fixedMonthDay":
                try:
                    date(2000, calculation["month"], calculation["day"])
                except ValueError:
                    errors.append(f"{calendar_id}: ungültiges Fixdatum in {rule_id}")
            if calculation_type == "relativePeriod":
                try:
                    starts_on = calculate_boundary(calculation["startsOn"], 2000)
                    ends_on = calculate_boundary(calculation["endsOn"], 2000)
                    if starts_on > ends_on:
                        errors.append(f"{calendar_id}: umgekehrte relative Periode in {rule_id}")
                except ValueError as error:
                    errors.append(f"{calendar_id}: ungültige Periode in {rule_id}: {error}")
            if calculation_type == "explicitDateOverride":
                operation = effect["operation"]
                required_fields = {
                    "add": {"date"},
                    "suppress": {"targetDate"},
                    "replace": {"targetDate", "replacementDate"},
                }[operation]
                actual_fields = set(calculation) - {"type"}
                if actual_fields != required_fields:
                    errors.append(
                        f"{calendar_id}: Felder von {rule_id} passen nicht zur Operation {operation}"
                    )
                target_rule_id = effect.get("targetRuleId")
                if target_rule_id is not None and target_rule_id not in rules_by_id:
                    errors.append(
                        f"{calendar_id}: {rule_id} zielt auf unbekannte Regel {target_rule_id}"
                    )
                if operation in {"suppress", "replace"} and target_rule_id is not None:
                    collision_key = (
                        target_rule_id,
                        str(calculation["targetDate"]),
                        rule["priority"],
                    )
                    if collision_key in override_collisions:
                        errors.append(
                            f"{calendar_id}: gleich priorisierter Overridekonflikt für "
                            f"{target_rule_id} am {calculation['targetDate']}"
                        )
                    override_collisions.add(collision_key)

    def visit(calendar_id: str, ancestry: set[str]) -> None:
        if calendar_id in ancestry:
            errors.append(f"Zyklische Kalendervererbung bei {calendar_id}")
            return
        calendar = calendars_by_id.get(calendar_id)
        if calendar is None:
            errors.append(f"Unbekannte Kalendervererbung {calendar_id}")
            return
        next_ancestry = ancestry | {calendar_id}
        for parent_id in calendar["inherits"]:
            visit(parent_id, next_ancestry)

    for calendar_id in calendars_by_id:
        visit(calendar_id, set())
    return errors


def override_rule(
    rule_id: str,
    operation: str,
    target_rule_id: str,
    priority: int = 200,
) -> dict[str, Any]:
    calculation: dict[str, Any] = {
        "type": "explicitDateOverride",
        "targetDate": "2028-08-01",
    }
    effect: dict[str, Any] = {
        "type": "explicitDateOverride",
        "operation": operation,
        "targetRuleId": target_rule_id,
    }
    if operation == "replace":
        calculation["replacementDate"] = "2028-08-02"
        effect["replacementHoliday"] = {
            "kind": "federalHoliday",
            "labelKey": "holiday.ch.nationalDay",
            "labels": {"de": "Bundesfeiertag", "fr": "Fête nationale"},
            "legalEffect": "nonWorkingDayEquivalentToSunday",
            "resultIdSuffix": "NATIONAL-DAY",
        }
    return {
        "ruleId": rule_id,
        "calendarId": "ch-federal-calendar",
        "jurisdiction": {"level": "federal", "code": "CH"},
        "labelKey": "override.ch.nationalDay",
        "labels": {
            "de": "Einmalige Abweichung zum Bundesfeiertag",
            "fr": "Dérogation unique à la fête nationale",
        },
        "priority": priority,
        "validity": {"from": "2028-08-01", "to": "2028-08-02"},
        "sourceRefs": [
            {"sourceId": "SRC-BUNDESFEIERTAG-19940701", "locator": "Art. 1"}
        ],
        "calculation": calculation,
        "effect": effect,
    }


def negative_self_test_errors(
    calendars: list[dict[str, Any]],
    calendar_schema: dict[str, Any],
    registry: Registry,
) -> list[str]:
    errors: list[str] = []
    calendars_by_id = {calendar["calendarId"]: calendar for calendar in calendars}

    unknown_type = deepcopy(calendars_by_id["ch-federal-calendar"])
    unknown_type["rules"][0]["calculation"]["type"] = "lunarGuess"
    if not schema_errors(unknown_type, calendar_schema, registry, "unknownRuleType"):
        errors.append("Negativtest unknownRuleType wurde nicht abgewiesen")

    invalid_date = deepcopy(calendars_by_id["be-public-holidays"])
    invalid_date["rules"][0]["calculation"].update({"month": 2, "day": 30})
    if not semantic_calendar_errors([invalid_date]):
        errors.append("Negativtest invalidFixedDate wurde nicht abgewiesen")

    duplicate_rule = deepcopy(calendars_by_id["be-public-holidays"])
    duplicate_rule["rules"][1]["ruleId"] = duplicate_rule["rules"][0]["ruleId"]
    if not semantic_calendar_errors([duplicate_rule]):
        errors.append("Negativtest duplicateRuleId wurde nicht abgewiesen")

    inheritance_cycle = deepcopy(calendars)
    cycle_by_id = {calendar["calendarId"]: calendar for calendar in inheritance_cycle}
    cycle_by_id["ch-federal-calendar"]["inherits"] = ["be-public-holidays"]
    if not semantic_calendar_errors(inheritance_cycle):
        errors.append("Negativtest inheritanceCycle wurde nicht abgewiesen")

    unmatched_override = deepcopy(calendars)
    unmatched_by_id = {calendar["calendarId"]: calendar for calendar in unmatched_override}
    unmatched_by_id["ch-federal-calendar"]["rules"].append(
        override_rule(
            "CH-CAL-OVERRIDE-UNMATCHED-2028",
            "suppress",
            "CH-CAL-HOL-UNKNOWN",
        )
    )
    if not semantic_calendar_errors(unmatched_override):
        errors.append("Negativtest unmatchedOverride wurde nicht abgewiesen")

    priority_conflict = deepcopy(calendars)
    conflict_by_id = {calendar["calendarId"]: calendar for calendar in priority_conflict}
    conflict_by_id["ch-federal-calendar"]["rules"].extend(
        [
            override_rule(
                "CH-CAL-OVERRIDE-SUPPRESS-2028",
                "suppress",
                "CH-CAL-HOL-NATIONAL-DAY",
            ),
            override_rule(
                "CH-CAL-OVERRIDE-REPLACE-2028",
                "replace",
                "CH-CAL-HOL-NATIONAL-DAY",
            ),
        ]
    )
    conflict_errors = semantic_calendar_errors(priority_conflict)
    if not any("Overridekonflikt" in error for error in conflict_errors):
        errors.append("Negativtest priorityConflict wurde nicht abgewiesen")

    outside_validity = deepcopy(calendars_by_id["ch-federal-calendar"])
    outside_validity["validity"]["to"] = "2026-12-31"
    if validity_contains(outside_validity["validity"], date(2027, 1, 1)):
        errors.append("Negativtest outsideValidity wurde nicht abgewiesen")

    return errors


def generated_holiday(rule: dict[str, Any], year: int) -> dict[str, Any] | None:
    value = calculate_date(rule["calculation"], year)
    if not validity_contains(rule["validity"], value):
        return None
    effect = rule["effect"]
    code = rule["jurisdiction"]["code"]
    return {
        "holidayId": f"{code}-{value.isoformat()}-{effect['resultIdSuffix']}",
        "date": value.isoformat(),
        "kind": effect["kind"],
        "labelKey": rule["labelKey"],
        "legalEffect": effect["legalEffect"],
        "sourceRefs": rule["sourceRefs"],
    }


def generated_period(rule: dict[str, Any], year: int) -> dict[str, Any] | None:
    calculation = rule["calculation"]
    starts_on = calculate_boundary(calculation["startsOn"], year)
    ends_on = calculate_boundary(calculation["endsOn"], year)
    if ends_on < parse_iso(str(rule["validity"]["from"])):
        return None
    valid_to = rule["validity"]["to"]
    if isinstance(valid_to, str) and starts_on > parse_iso(valid_to):
        return None
    effect = rule["effect"]
    period_id = f"{effect['resultIdPrefix']}-{starts_on.year}"
    if starts_on.year != ends_on.year:
        period_id += f"-{ends_on.year}"
    return {
        "periodId": period_id,
        "startsOn": starts_on.isoformat(),
        "endsOn": ends_on.isoformat(),
        "inclusive": effect["inclusive"],
        "labelKey": rule["labelKey"],
        "applicableProfileIds": effect["applicableProfileIds"],
        "sourceRefs": rule["sourceRefs"],
    }


def generate_for_window(
    calendar: dict[str, Any],
    start: date,
    end: date,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    holidays: list[dict[str, Any]] = []
    periods: list[dict[str, Any]] = []
    for year in range(start.year - 1, end.year + 2):
        for rule in calendar["rules"]:
            calculation_type = rule["calculation"]["type"]
            if calculation_type in {
                "fixedMonthDay",
                "easterOffsetDays",
                "nthWeekdayOfMonth",
            }:
                holiday = generated_holiday(rule, year)
                if holiday is not None and start <= parse_iso(holiday["date"]) <= end:
                    holidays.append(holiday)
            elif calculation_type == "relativePeriod":
                period = generated_period(rule, year)
                if period is not None:
                    period_start = parse_iso(period["startsOn"])
                    period_end = parse_iso(period["endsOn"])
                    if period_end >= start and period_start <= end:
                        periods.append(period)
    holidays.sort(key=lambda item: (item["date"], item["holidayId"]))
    periods.sort(key=lambda item: (item["startsOn"], item["periodId"]))
    return holidays, periods


def reference_records(
    reference: dict[str, Any],
    start: date,
    end: date,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    holidays = [
        holiday
        for holiday in reference["holidays"]
        if start <= parse_iso(holiday["date"]) <= end
    ]
    periods: list[dict[str, Any]] = []
    for suspension_set in reference["suspensionSets"]:
        for period in suspension_set["periods"]:
            if parse_iso(period["endsOn"]) >= start and parse_iso(period["startsOn"]) <= end:
                periods.append(
                    {
                        **period,
                        "applicableProfileIds": suspension_set["applicableProfileIds"],
                        "sourceRefs": suspension_set["sourceRefs"],
                    }
                )
    holidays.sort(key=lambda item: (item["date"], item["holidayId"]))
    periods.sort(key=lambda item: (item["startsOn"], item["periodId"]))
    return holidays, periods


def select_fields(record: dict[str, Any], fields: set[str]) -> dict[str, Any]:
    return {key: record[key] for key in sorted(fields) if key in record}


def reference_suite_errors(
    suite: dict[str, Any],
    calendars_by_id: dict[str, dict[str, Any]],
) -> list[str]:
    errors: list[str] = []
    all_cases = [
        *suite["legacyParityCases"],
        *suite["algorithmCases"],
        *suite["leapYearCases"],
        *suite["overrideCases"],
        *suite["failureCases"],
    ]
    case_ids = [case["caseId"] for case in all_cases]
    if len(case_ids) != len(set(case_ids)):
        errors.append("Doppelte Fall-ID im AP12A-Referenzvertrag")

    for parity_case in suite["legacyParityCases"]:
        case_id = parity_case["caseId"]
        candidate_path = REPOSITORY_ROOT / parity_case["candidateArtifact"]
        reference_path = REPOSITORY_ROOT / parity_case["referenceArtifact"]
        if not candidate_path.is_file() or not reference_path.is_file():
            errors.append(f"{case_id}: Kandidaten- oder Referenzartefakt fehlt")
            continue
        candidate = calendars_by_id.get(parity_case["calendarId"])
        if candidate is None:
            errors.append(f"{case_id}: unbekannter Kandidatenkalender")
            continue
        reference = load_json(reference_path)
        if candidate["calendarId"] != reference["calendarId"]:
            errors.append(f"{case_id}: Kalender-IDs stimmen nicht überein")
            continue
        start = parse_iso(parity_case["window"]["from"])
        end = parse_iso(parity_case["window"]["to"])
        generated_holidays, generated_periods = generate_for_window(candidate, start, end)
        expected_holidays, expected_periods = reference_records(reference, start, end)
        expected_counts = parity_case["expectedCounts"]
        if len(expected_holidays) != expected_counts["holidays"]:
            errors.append(f"{case_id}: erwartete Feiertagszahl passt nicht zum Referenzrelease")
        if len(expected_periods) != expected_counts["suspensionPeriods"]:
            errors.append(f"{case_id}: erwartete Stillstandsperiodenzahl passt nicht zum Referenzrelease")
        fields = set(parity_case["compareFields"])
        generated_normalized = [select_fields(item, fields) for item in generated_holidays]
        expected_normalized = [select_fields(item, fields) for item in expected_holidays]
        if generated_normalized != expected_normalized:
            errors.append(f"{case_id}: erzeugte Feiertage weichen vom Referenzrelease ab")
        generated_periods_normalized = [select_fields(item, fields) for item in generated_periods]
        expected_periods_normalized = [select_fields(item, fields) for item in expected_periods]
        if generated_periods_normalized != expected_periods_normalized:
            errors.append(f"{case_id}: erzeugte Stillstandsperioden weichen vom Referenzrelease ab")

    for algorithm_case in suite["algorithmCases"]:
        actual = calculate_reference(algorithm_case["calculation"], algorithm_case["year"])
        if actual != algorithm_case["expected"]:
            errors.append(f"{algorithm_case['caseId']}: Algorithmuserwartung ist widersprüchlich")

    required_years = {1900, 2000, 2100, 2400}
    actual_years = {case["year"] for case in suite["algorithmCases"]}
    if not required_years <= actual_years:
        errors.append("Algorithmusfälle decken 1900, 2000, 2100 und 2400 nicht vollständig ab")
    calculation_types = {case["calculation"]["type"] for case in suite["algorithmCases"]}
    if calculation_types != {
        "fixedMonthDay",
        "easterOffsetDays",
        "nthWeekdayOfMonth",
        "relativePeriod",
    }:
        errors.append("Algorithmusfälle decken die vier wiederkehrenden Regeltypen nicht ab")

    for leap_case in suite["leapYearCases"]:
        year = leap_case["year"]
        actual = year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
        if actual != leap_case["expectedLeapYear"]:
            errors.append(f"{leap_case['caseId']}: falsche Schaltjahreserwartung")

    if {case["operation"] for case in suite["overrideCases"]} != {
        "add",
        "suppress",
        "replace",
    }:
        errors.append("Overridefälle decken add, suppress und replace nicht vollständig ab")
    required_failures = {
        "unknownRuleType",
        "invalidFixedDate",
        "duplicateRuleId",
        "inheritanceCycle",
        "unmatchedOverride",
        "priorityConflict",
        "outsideValidity",
    }
    if {case["failureType"] for case in suite["failureCases"]} != required_failures:
        errors.append("Sperrfälle decken die sieben festgelegten Fehlerklassen nicht vollständig ab")
    return errors


def validate() -> tuple[int, int, int, int]:
    schemas, registry = load_registry()
    calendar_schema = schemas["calendar-rules-v2.schema.json"]
    suite_schema = schemas["calendar-rule-reference-suite.schema.json"]
    calendar_paths = sorted(CANDIDATE_DIRECTORY.glob("*.json"))
    calendars = [load_json(path) for path in calendar_paths]
    suite = load_json(REFERENCE_SUITE_PATH)
    errors: list[str] = []
    for path, calendar in zip(calendar_paths, calendars, strict=True):
        errors.extend(
            schema_errors(
                calendar,
                calendar_schema,
                registry,
                str(path.relative_to(REPOSITORY_ROOT)),
            )
        )
    errors.extend(
        schema_errors(
            suite,
            suite_schema,
            registry,
            str(REFERENCE_SUITE_PATH.relative_to(REPOSITORY_ROOT)),
        )
    )
    if errors:
        raise CandidateValidationError(errors)
    errors.extend(semantic_calendar_errors(calendars))
    calendars_by_id = {calendar["calendarId"]: calendar for calendar in calendars}
    errors.extend(reference_suite_errors(suite, calendars_by_id))
    errors.extend(negative_self_test_errors(calendars, calendar_schema, registry))
    if errors:
        raise CandidateValidationError(errors)
    return (
        len(calendars),
        sum(len(calendar["rules"]) for calendar in calendars),
        sum(
            len(suite[key])
            for key in (
                "legacyParityCases",
                "algorithmCases",
                "leapYearCases",
                "overrideCases",
                "failureCases",
            )
        ),
        len(suite["failureCases"]),
    )


def main() -> int:
    try:
        calendar_count, rule_count, case_count, negative_count = validate()
    except CandidateValidationError as error:
        print("INVALID: AP12A-Kalenderkandidat", file=sys.stderr)
        for validation_error in error.errors:
            print(f"- {validation_error}", file=sys.stderr)
        return 1
    print(
        "VALID: "
        f"calendarCandidates={calendar_count}, rules={rule_count}, referenceCases={case_count}, "
        f"negativeTests={negative_count}, legacyParity=2026-2028"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
