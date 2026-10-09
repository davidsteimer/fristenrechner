#!/usr/bin/env python3
"""Validiert AP11B unabhängig vom TypeScript-Rechenkern und rechnet die Golden Cases nach."""

from __future__ import annotations

import calendar
import copy
import json
import sys
from collections.abc import Callable, Iterable
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIRECTORY = REPOSITORY_ROOT / "schemas"
RELEASE_DIRECTORY = (
    REPOSITORY_ROOT / "data/releases/2026-08-30-ap11b-approved.1"
)
CATALOG_PATH = RELEASE_DIRECTORY / "special-regimes/vrpg-be.json"
SUITE_PATH = REPOSITORY_ROOT / "tests/golden/approved/vrpg-be-special-cases.json"
SCHEMA_FILES = (
    "common.schema.json",
    "filing-profile.schema.json",
    "deadline-definition.schema.json",
    "special-regime-catalog-v2.schema.json",
    "special-golden-case-suite.schema.json",
)


class IndependentValidationError(Exception):
    """Fasst die unabhängigen AP11B-Prüffehler zusammen."""

    def __init__(self, errors: Iterable[str]):
        self.errors = sorted(set(errors))
        super().__init__("\n".join(self.errors))


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise IndependentValidationError([f"{path}: ungültiges JSON: {error}"]) from error


def load_schemas() -> tuple[dict[str, dict[str, Any]], Registry]:
    schemas = {
        name: load_json(SCHEMA_DIRECTORY / name)
        for name in SCHEMA_FILES
    }
    for name, schema in schemas.items():
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:
            raise IndependentValidationError(
                [f"schemas/{name}: ungültiges JSON-Schema: {error}"]
            ) from error
    registry = Registry().with_resources(
        (schema["$id"], Resource.from_contents(schema))
        for schema in schemas.values()
    )
    return schemas, registry


def schema_errors(
    instance: dict[str, Any],
    schema: dict[str, Any],
    registry: Registry,
    label: str,
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
        errors.append(f"{label}: Schemafehler{suffix}: {error.message}")
    return errors


def add_months(anchor: date, months: int) -> date:
    month_index = anchor.month - 1 + months
    year = anchor.year + month_index // 12
    month = month_index % 12 + 1
    day = min(anchor.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def apply_duration(
    anchor: date,
    duration: dict[str, Any],
    direction: str,
    boundary: str,
) -> date:
    sign = 1 if direction == "after" else -1
    if duration["unit"] == "month":
        return add_months(anchor, sign * duration["value"])
    boundary_adjustment = 1 if boundary == "included" else 0
    return anchor + timedelta(
        days=sign * (duration["value"] - boundary_adjustment)
    )


def calculate_weekday(anchor: date, calculation: dict[str, Any]) -> date:
    weekday_index = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6,
    }
    target = weekday_index[calculation["weekday"]]
    direction = 1 if calculation["direction"] == "after" else -1
    current = anchor
    matches = int(not calculation["strict"] and current.weekday() == target)
    while matches < calculation["ordinal"]:
        current += timedelta(days=direction)
        if current.weekday() == target:
            matches += 1
    return current


def calculate_provisional(
    definition: dict[str, Any],
    case_input: dict[str, Any],
) -> date:
    if definition["deadlineOrigin"] != "CALCULATED":
        raise IndependentValidationError(
            [f"{definition['deadlineDefinitionId']}: Behörden-Termin ist nicht berechenbar"]
        )
    calculation = definition["calculation"]
    dates = {
        key: date.fromisoformat(value)
        for key, value in case_input["dateValues"].items()
    }
    calculation_type = calculation["type"]
    if calculation_type == "R1_RELATIVE":
        duration = calculation.get("duration")
        if duration is None:
            duration = {
                "value": case_input["integerValues"][calculation["durationInputId"]],
                "unit": "day",
            }
        return apply_duration(
            dates[calculation["anchorInputId"]],
            duration,
            calculation["direction"],
            calculation["anchorBoundary"],
        )
    if calculation_type == "R2_OFFSET":
        return dates[calculation["anchorInputId"]] + timedelta(
            days=calculation["offsetDays"]
        )
    if calculation_type == "R3_WEEKDAY":
        return calculate_weekday(dates[calculation["anchorInputId"]], calculation)
    if calculation_type == "R4_DUAL":
        results = [
            apply_duration(
                dates[branch["anchorInputId"]],
                branch["duration"],
                "after",
                branch["anchorBoundary"],
            )
            for branch in calculation["branches"]
        ]
        return min(results) if calculation["selection"] == "earliest" else max(results)
    raise IndependentValidationError(
        [f"{definition['deadlineDefinitionId']}: unbekannte Rechenart {calculation_type}"]
    )


def holiday_dates(calendar_id: str | None) -> set[date]:
    if calendar_id is None:
        return set()
    calendars: dict[str, dict[str, Any]] = {}
    for path in (RELEASE_DIRECTORY / "calendars").glob("*.json"):
        item = load_json(path)
        calendars[item["calendarId"]] = item
    result: set[date] = set()
    visited: set[str] = set()

    def collect(current_id: str) -> None:
        if current_id in visited:
            return
        visited.add(current_id)
        current = calendars[current_id]
        for inherited_id in current["inherits"]:
            collect(inherited_id)
        result.update(date.fromisoformat(item["date"]) for item in current["holidays"])

    collect(calendar_id)
    return result


def shift_deadline(
    provisional: date,
    policy: str,
    holidays: set[date],
) -> date:
    if policy != "nextWorkingDay":
        return provisional
    current = provisional
    while current.weekday() >= 5 or current in holidays:
        current += timedelta(days=1)
    return current


def validate_semantics(
    catalog: dict[str, Any],
    suite: dict[str, Any],
) -> list[str]:
    errors: list[str] = []
    definitions = {
        item["deadlineDefinitionId"]: item
        for item in catalog["deadlineDefinitions"]
    }
    regimes = {item["regimeId"]: item for item in catalog["regimes"]}
    filings = {
        item["filingProfileId"]: item
        for item in catalog["filingProfiles"]
    }
    calendars = {
        item["calendarProfileId"]: item
        for item in catalog["calendarProfiles"]
    }
    gates = {item["gateId"]: item for item in catalog["gates"]}

    if any(
        definition.get("calculation", {}).get("type") == "R5_FIXED"
        for definition in definitions.values()
    ):
        errors.append("Katalog: R5_FIXED ist nach DEC-2026-014 nicht zulässig")
    origins = {
        origin: sum(item["deadlineOrigin"] == origin for item in definitions.values())
        for origin in ("CALCULATED", "AUTHORITATIVE")
    }
    if origins != {"CALCULATED": 26, "AUTHORITATIVE": 3}:
        errors.append(f"Katalog: Herkunftsverteilung {origins} ist unerwartet")
    for regime in regimes.values():
        for definition_id in regime["deadlineDefinitionIds"]:
            definition = definitions.get(definition_id)
            if definition is None:
                errors.append(
                    f"{regime['regimeId']}: unbekannte Definition {definition_id}"
                )
                continue
            if definition["deadlineOrigin"] == "AUTHORITATIVE" and regime["uiExposure"] != "hidden":
                errors.append(
                    f"{regime['regimeId']}: Behörden-Termin ist im Rechen-GUI sichtbar"
                )

    case_ids: set[str] = set()
    for golden_case in suite["cases"]:
        case_id = golden_case["caseId"]
        if case_id in case_ids:
            errors.append(f"{case_id}: doppelte Fall-ID")
        case_ids.add(case_id)
        case_input = golden_case["input"]
        expected = golden_case["expected"]
        definition = definitions.get(case_input["ruleId"])
        regime = regimes.get(case_input["regimeId"])
        if definition is None or regime is None:
            errors.append(f"{case_id}: Definition oder Regime unbekannt")
            continue
        if definition["deadlineDefinitionId"] not in regime["deadlineDefinitionIds"]:
            errors.append(f"{case_id}: Definition gehört nicht zum Regime")
            continue
        for field, expected_value in (
            ("calendarProfileId", definition["resultPolicy"]["calendarProfileId"]),
            ("suspensionProfileId", definition["resultPolicy"]["suspensionProfileId"]),
            ("filingProfileId", definition["filingProfileId"]),
        ):
            if case_input[field] != expected_value:
                errors.append(f"{case_id}: widersprüchliches {field}")

        provisional = calculate_provisional(definition, case_input)
        calendar_profile = calendars[case_input["calendarProfileId"]]
        final_deadline = shift_deadline(
            provisional,
            definition["resultPolicy"]["endShiftPolicy"],
            holiday_dates(calendar_profile["calendarId"]),
        )
        if expected["provisionalDeadline"]["date"] != provisional.isoformat():
            errors.append(f"{case_id}: Rohfrist stimmt nicht")
        if expected["finalDeadline"]["date"] != final_deadline.isoformat():
            errors.append(f"{case_id}: Fristende stimmt nicht")
        expected_outcome = (
            "manualReview"
            if definition["resultPolicy"]["endShiftPolicy"] == "manualReview"
            else "calculated"
        )
        if expected["outcome"] != expected_outcome:
            errors.append(f"{case_id}: Ergebnisart stimmt nicht")
        if expected["appliedRuleIds"] != [definition["deadlineDefinitionId"]]:
            errors.append(f"{case_id}: Regelbezug stimmt nicht")
        if expected["appliedOverrideIds"] != definition["legalOverrideIds"]:
            errors.append(f"{case_id}: Override-Bezug stimmt nicht")

        filing = filings[case_input["filingProfileId"]]
        expected_filing = {
            "filingProfileId": filing["filingProfileId"],
            "preservationMode": filing["preservationMode"],
            "originalRequired": filing["originalRequired"],
            "cutoffTime": filing["cutoffTime"],
            "timezone": filing["timezone"],
            "acceptedChannels": filing["acceptedChannels"],
            "acceptedEvidence": filing["acceptedEvidence"],
        }
        if expected["filingRequirement"] != expected_filing:
            errors.append(f"{case_id}: Einreichungsanforderung stimmt nicht")

        expected_gates: list[dict[str, Any]] = []
        for gate_id in definition["gateIds"]:
            gate = gates[gate_id]
            comparison = date.fromisoformat(
                case_input["dateValues"][gate["rightInputId"]]
            )
            matched = (
                final_deadline <= comparison
                if gate["operator"] == "lte"
                else final_deadline < comparison
            )
            expected_gates.append(
                {
                    "gateId": gate_id,
                    "matched": matched,
                    "action": gate["onTrue"] if matched else "none",
                }
            )
        if expected["gateResults"] != expected_gates:
            errors.append(f"{case_id}: Gate-Ergebnis stimmt nicht")
        sequences = [step["sequence"] for step in expected["trace"]]
        if sequences != list(range(1, len(sequences) + 1)):
            errors.append(f"{case_id}: Rechenspur ist nicht lückenlos")

    if len(case_ids) != 8:
        errors.append(f"Golden-Case-Suite: acht Fälle erwartet, vorhanden {len(case_ids)}")
    return errors


def run_negative_tests(
    catalog: dict[str, Any],
    schemas: dict[str, dict[str, Any]],
    registry: Registry,
) -> list[str]:
    tests: list[
        tuple[
            str,
            str,
            Callable[[dict[str, Any]], None],
            bool,
        ]
    ] = []

    def insert_r5(data: dict[str, Any]) -> None:
        definition = next(
            item
            for item in data["deadlineDefinitions"]
            if item["deadlineOrigin"] == "CALCULATED"
        )
        definition["calculation"] = {
            "type": "R5_FIXED",
            "deadlineDateInputId": definition["anchors"][0]["inputId"],
            "authoritativeSourceRequired": True,
        }

    tests.append(("R5 zurückgeschmuggelt", "Schemafehler", insert_r5, True))

    def expose_authoritative(data: dict[str, Any]) -> None:
        authoritative_ids = {
            item["deadlineDefinitionId"]
            for item in data["deadlineDefinitions"]
            if item["deadlineOrigin"] == "AUTHORITATIVE"
        }
        regime = next(
            item
            for item in data["regimes"]
            if authoritative_ids.intersection(item["deadlineDefinitionIds"])
        )
        regime["uiExposure"] = "visible"

    tests.append(("Behörden-Termin sichtbar", "Rechen-GUI sichtbar", expose_authoritative, False))

    passed: list[str] = []
    empty_suite = {"cases": []}
    for name, expected_text, mutator, schema_only in tests:
        mutated = copy.deepcopy(catalog)
        mutator(mutated)
        if schema_only:
            errors = schema_errors(
                mutated,
                schemas["special-regime-catalog-v2.schema.json"],
                registry,
                name,
            )
        else:
            errors = validate_semantics(mutated, empty_suite)
        if not any(expected_text in error for error in errors):
            raise AssertionError(
                f"Negativtest {name} meldete nicht {expected_text!r}: {errors}"
            )
        passed.append(name)
    return passed


def main() -> int:
    try:
        schemas, registry = load_schemas()
        catalog = load_json(CATALOG_PATH)
        suite = load_json(SUITE_PATH)
        errors = schema_errors(
            catalog,
            schemas["special-regime-catalog-v2.schema.json"],
            registry,
            str(CATALOG_PATH.relative_to(REPOSITORY_ROOT)),
        )
        errors.extend(
            schema_errors(
                suite,
                schemas["special-golden-case-suite.schema.json"],
                registry,
                str(SUITE_PATH.relative_to(REPOSITORY_ROOT)),
            )
        )
        if not errors:
            errors.extend(validate_semantics(catalog, suite))
        if errors:
            raise IndependentValidationError(errors)
        negative_tests = run_negative_tests(catalog, schemas, registry)
        print(
            "VALID: "
            f"definitions={len(catalog['deadlineDefinitions'])}, "
            f"regimes={len(catalog['regimes'])}, "
            f"approvedCases={len(suite['cases'])}"
        )
        print("INDEPENDENT COUNTERCALCULATION: 8/8")
        print("NEGATIVE TESTS: " + ", ".join(negative_tests))
    except (IndependentValidationError, AssertionError, KeyError) as error:
        print(f"INVALID:\n{error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
