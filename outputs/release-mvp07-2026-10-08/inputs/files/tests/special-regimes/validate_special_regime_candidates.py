#!/usr/bin/env python3
"""Validiert den AP11A-Katalog und rechnet die acht Kandidatenfälle unabhängig nach."""

from __future__ import annotations

import calendar
import copy
import json
import sys
from collections.abc import Iterable
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIRECTORY = REPOSITORY_ROOT / "schemas"
CATALOG_PATH = (
    REPOSITORY_ROOT
    / "data/candidates/2026-08-30-ap11a-vrpg-be/catalog.json"
)
SUITE_PATH = (
    REPOSITORY_ROOT
    / "tests/golden/candidates/ap11a-vrpg-be-special-cases.json"
)
POSITIVE_EXAMPLES = {
    REPOSITORY_ROOT
    / "data/candidates/2026-08-30-ap11a-vrpg-be/examples/r5-fixed.json":
        "deadline-rule.schema.json",
    REPOSITORY_ROOT
    / "data/candidates/2026-08-30-ap11a-vrpg-be/examples/f3-original-1200.json":
        "filing-profile.schema.json",
}
NEGATIVE_EXAMPLES = {
    REPOSITORY_ROOT
    / "tests/special-regimes/invalid/unknown-calculation-type.json":
        "deadline-rule.schema.json",
    REPOSITORY_ROOT
    / "tests/special-regimes/invalid/original-without-cutoff.json":
        "filing-profile.schema.json",
}
SCHEMA_FILES = (
    "common.schema.json",
    "deadline-rule.schema.json",
    "filing-profile.schema.json",
    "special-regime-catalog.schema.json",
    "special-golden-case-suite.schema.json",
)


class SpecialRegimeValidationError(Exception):
    """Fasst strukturelle und semantische Fehler zusammen."""

    def __init__(self, errors: Iterable[str]):
        self.errors = sorted(set(errors))
        super().__init__("\n".join(self.errors))


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SpecialRegimeValidationError(
            [f"{path.relative_to(REPOSITORY_ROOT)}: ungültiges JSON: {error}"]
        ) from error


def load_schemas() -> tuple[dict[str, dict[str, Any]], Registry]:
    schemas = {
        name: load_json(SCHEMA_DIRECTORY / name)
        for name in SCHEMA_FILES
    }
    for name, schema in schemas.items():
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:
            raise SpecialRegimeValidationError(
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


def collect_source_references(node: Any) -> Iterable[dict[str, Any]]:
    if isinstance(node, dict):
        refs = node.get("sourceRefs")
        if isinstance(refs, list):
            yield from refs
        for value in node.values():
            yield from collect_source_references(value)
    elif isinstance(node, list):
        for value in node:
            yield from collect_source_references(value)


def index_unique(
    items: list[dict[str, Any]],
    key: str,
    label: str,
    errors: list[str],
) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for item in items:
        item_id = item[key]
        if item_id in result:
            errors.append(f"{label}: doppelte ID {item_id}")
        result[item_id] = item
    return result


def calculation_anchor_ids(rule: dict[str, Any]) -> set[str]:
    calculation = rule["calculation"]
    calculation_type = calculation["type"]
    if calculation_type in {"R1_RELATIVE", "R2_OFFSET", "R3_WEEKDAY"}:
        return {calculation["anchorInputId"]}
    if calculation_type == "R4_DUAL":
        return {branch["anchorInputId"] for branch in calculation["branches"]}
    if calculation_type == "R5_FIXED":
        result = {calculation["deadlineDateInputId"]}
        if "deadlineTimeInputId" in calculation:
            result.add(calculation["deadlineTimeInputId"])
        return result
    return set()


def validate_catalog_semantics(catalog: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    sources = index_unique(catalog["sources"], "sourceId", "Quellen", errors)
    calendars = index_unique(
        catalog["calendarProfiles"], "calendarProfileId", "Kalenderprofile", errors
    )
    suspensions = index_unique(
        catalog["suspensionProfiles"],
        "suspensionProfileId",
        "Stillstandsprofile",
        errors,
    )
    filings = index_unique(
        catalog["filingProfiles"], "filingProfileId", "Einreichungsprofile", errors
    )
    gates = index_unique(catalog["gates"], "gateId", "Gates", errors)
    overrides = index_unique(
        catalog["legalOverrides"], "overrideId", "Overrides", errors
    )
    rules = index_unique(catalog["deadlineRules"], "ruleId", "Fristenregeln", errors)
    regimes = index_unique(catalog["regimes"], "regimeId", "Regime", errors)

    available_source_ids = set(sources)
    for source_ref in collect_source_references(catalog):
        if source_ref["sourceId"] not in available_source_ids:
            errors.append(
                f"Katalog: Quellenverweis {source_ref['sourceId']} ist nicht lokal aufgelöst"
            )

    for rule_id, rule in rules.items():
        anchor_ids = [anchor["inputId"] for anchor in rule["anchors"]]
        if len(anchor_ids) != len(set(anchor_ids)):
            errors.append(f"Regel {rule_id}: doppelte Anker-ID")
        unknown_anchors = calculation_anchor_ids(rule) - set(anchor_ids)
        if unknown_anchors:
            errors.append(
                f"Regel {rule_id}: Berechnung verwendet unbekannte Anker {sorted(unknown_anchors)}"
            )
        if rule["resultPolicy"]["calendarProfileId"] not in calendars:
            errors.append(f"Regel {rule_id}: unbekanntes Kalenderprofil")
        if rule["resultPolicy"]["suspensionProfileId"] not in suspensions:
            errors.append(f"Regel {rule_id}: unbekanntes Stillstandsprofil")
        if rule["filingProfileId"] not in filings:
            errors.append(f"Regel {rule_id}: unbekanntes Einreichungsprofil")
        for gate_id in rule["gateIds"]:
            if gate_id not in gates:
                errors.append(f"Regel {rule_id}: unbekanntes Gate {gate_id}")
            elif gates[gate_id]["rightInputId"] not in anchor_ids:
                errors.append(
                    f"Regel {rule_id}: Gate {gate_id} verwendet unbekannten Anker"
                )
        for override_id in rule["legalOverrideIds"]:
            if override_id not in overrides:
                errors.append(f"Regel {rule_id}: unbekannter Override {override_id}")

    for regime_id, regime in regimes.items():
        rule_ids = regime["calculationRuleIds"]
        unknown_rules = set(rule_ids) - set(rules)
        if unknown_rules:
            errors.append(
                f"Regime {regime_id}: unbekannte Regeln {sorted(unknown_rules)}"
            )
        if (
            regime["status"] == "supported"
            and not rule_ids
            and regime.get("regimeKind", "deadline") != "filingOverlay"
        ):
            errors.append(
                f"Regime {regime_id}: unterstütztes Rechenregime ohne Fristenregel"
            )
        if regime["status"] == "blocked" and rule_ids:
            errors.append(f"Regime {regime_id}: gesperrtes Regime enthält Fristenregeln")
        if regime.get("regimeKind", "deadline") == "filingOverlay" and rule_ids:
            errors.append(f"Regime {regime_id}: Einreichungs-Overlay enthält Fristenregeln")
        for field, available in (
            ("filingProfileId", filings),
            ("calendarProfileId", calendars),
            ("suspensionProfileId", suspensions),
        ):
            value = regime[field]
            if value is not None and value not in available:
                errors.append(f"Regime {regime_id}: unbekannter Verweis {field}={value}")
        if regime["status"] == "blocked" and any(
            regime[field] is not None
            for field in (
                "filingProfileId",
                "calendarProfileId",
                "suspensionProfileId",
            )
        ):
            errors.append(f"Regime {regime_id}: gesperrtes Regime enthält aktive Profile")
        for rule_id in rule_ids:
            if rule_id not in rules:
                continue
            rule = rules[rule_id]
            if rule["status"] != regime["status"]:
                errors.append(
                    f"Regime {regime_id}: Status stimmt nicht mit Regel {rule_id} überein"
                )
            expected_fields = {
                "filingProfileId": rule["filingProfileId"],
                "calendarProfileId": rule["resultPolicy"]["calendarProfileId"],
                "suspensionProfileId": rule["resultPolicy"]["suspensionProfileId"],
            }
            for field, expected in expected_fields.items():
                if regime[field] != expected:
                    errors.append(
                        f"Regime {regime_id}: {field} stimmt nicht mit Regel {rule_id} überein"
                    )
            if set(regime["gateIds"]) != set(rule["gateIds"]):
                errors.append(
                    f"Regime {regime_id}: Gates stimmen nicht mit Regel {rule_id} überein"
                )
            if set(regime["legalOverrideIds"]) != set(rule["legalOverrideIds"]):
                errors.append(
                    f"Regime {regime_id}: Overrides stimmen nicht mit Regel {rule_id} überein"
                )
        for gate_id in regime["gateIds"]:
            if gate_id not in gates:
                errors.append(f"Regime {regime_id}: unbekanntes Gate {gate_id}")
        for override_id in regime["legalOverrideIds"]:
            if override_id not in overrides:
                errors.append(f"Regime {regime_id}: unbekannter Override {override_id}")

    for override_id, override in overrides.items():
        for regime_id in override["targetRegimeIds"]:
            if regime_id not in regimes:
                errors.append(
                    f"Override {override_id}: unbekanntes Zielregime {regime_id}"
                )
            elif override_id not in regimes[regime_id]["legalOverrideIds"]:
                errors.append(
                    f"Override {override_id}: Zielregime {regime_id} verweist nicht zurück"
                )
    expected_status_counts = {"supported": 24, "blocked": 3, "open": 7}
    actual_status_counts = {
        status: sum(1 for regime in regimes.values() if regime["status"] == status)
        for status in expected_status_counts
    }
    if actual_status_counts != expected_status_counts:
        errors.append(
            "Katalog: Statusverteilung "
            f"{actual_status_counts} statt {expected_status_counts}"
        )
    expected_calculation_types = {
        "R1_RELATIVE",
        "R2_OFFSET",
        "R3_WEEKDAY",
        "R4_DUAL",
        "R5_FIXED",
    }
    actual_calculation_types = {
        rule["calculation"]["type"] for rule in rules.values()
    }
    if actual_calculation_types != expected_calculation_types:
        errors.append(
            "Katalog: Rechenarten "
            f"{sorted(actual_calculation_types)} statt {sorted(expected_calculation_types)}"
        )
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
    value = duration["value"]
    if boundary == "included":
        value -= 1
    sign = 1 if direction == "after" else -1
    if duration["unit"] == "day":
        return anchor + timedelta(days=sign * value)
    return add_months(anchor, sign * value)


def calculate_weekday(anchor: date, calculation: dict[str, Any]) -> date:
    weekdays = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6,
    }
    target = weekdays[calculation["weekday"]]
    direction = 1 if calculation["direction"] == "after" else -1
    current = anchor
    matches = 0
    if not calculation["strict"] and current.weekday() == target:
        matches = 1
    while matches < calculation["ordinal"]:
        current += timedelta(days=direction)
        if current.weekday() == target:
            matches += 1
    return current


def calculate_provisional(
    rule: dict[str, Any],
    case_input: dict[str, Any],
) -> date:
    calculation = rule["calculation"]
    calculation_type = calculation["type"]
    dates = {
        key: date.fromisoformat(value)
        for key, value in case_input["dateValues"].items()
    }
    integers = case_input["integerValues"]
    if calculation_type == "R1_RELATIVE":
        if "duration" in calculation:
            duration = calculation["duration"]
        else:
            duration = {
                "value": integers[calculation["durationInputId"]],
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
        branch_results = [
            apply_duration(
                dates[branch["anchorInputId"]],
                branch["duration"],
                "after",
                branch["anchorBoundary"],
            )
            for branch in calculation["branches"]
        ]
        return (
            min(branch_results)
            if calculation["selection"] == "earliest"
            else max(branch_results)
        )
    if calculation_type == "R5_FIXED":
        return dates[calculation["deadlineDateInputId"]]
    raise AssertionError(f"unbekannter Rechentyp {calculation_type}")


def holiday_dates() -> set[date]:
    result: set[date] = set()
    for relative_path in (
        "data/releases/2026-08-29-ap5-approved.1/calendars/ch-federal-calendar.json",
        "data/releases/2026-08-29-ap5-approved.1/calendars/be-public-holidays.json",
    ):
        calendar_data = load_json(REPOSITORY_ROOT / relative_path)
        result.update(date.fromisoformat(item["date"]) for item in calendar_data["holidays"])
    return result


def shift_deadline(
    provisional: date,
    rule: dict[str, Any],
    holidays: set[date],
) -> date:
    policy = rule["resultPolicy"]["endShiftPolicy"]
    if policy != "nextWorkingDay":
        return provisional
    result = provisional
    while result.weekday() >= 5 or result in holidays:
        result += timedelta(days=1)
    return result


def expected_gate_results(
    rule: dict[str, Any],
    case_input: dict[str, Any],
    final_deadline: date,
    gates: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for gate_id in rule["gateIds"]:
        gate = gates[gate_id]
        comparison_date = date.fromisoformat(
            case_input["dateValues"][gate["rightInputId"]]
        )
        matched = (
            final_deadline <= comparison_date
            if gate["operator"] == "lte"
            else final_deadline < comparison_date
        )
        results.append(
            {
                "gateId": gate_id,
                "matched": matched,
                "action": gate["onTrue"] if matched else "none",
            }
        )
    return results


def validate_case_semantics(
    suite: dict[str, Any],
    catalog: dict[str, Any],
) -> list[str]:
    errors: list[str] = []
    rules = {item["ruleId"]: item for item in catalog["deadlineRules"]}
    regimes = {item["regimeId"]: item for item in catalog["regimes"]}
    filings = {item["filingProfileId"]: item for item in catalog["filingProfiles"]}
    gates = {item["gateId"]: item for item in catalog["gates"]}
    source_ids = {item["sourceId"] for item in catalog["sources"]}
    holidays = holiday_dates()
    case_ids: set[str] = set()

    for case in suite["cases"]:
        case_id = case["caseId"]
        if case_id in case_ids:
            errors.append(f"{case_id}: doppelte Fall-ID")
        case_ids.add(case_id)
        case_input = case["input"]
        rule = rules.get(case_input["ruleId"])
        regime = regimes.get(case_input["regimeId"])
        if rule is None:
            errors.append(f"{case_id}: unbekannte Regel {case_input['ruleId']}")
            continue
        if regime is None:
            errors.append(f"{case_id}: unbekanntes Regime {case_input['regimeId']}")
            continue
        if rule["ruleId"] not in regime["calculationRuleIds"]:
            errors.append(f"{case_id}: Regel gehört nicht zum Regime")
        for field, rule_value in (
            ("calendarProfileId", rule["resultPolicy"]["calendarProfileId"]),
            ("suspensionProfileId", rule["resultPolicy"]["suspensionProfileId"]),
            ("filingProfileId", rule["filingProfileId"]),
        ):
            if case_input[field] != rule_value:
                errors.append(
                    f"{case_id}: {field}={case_input[field]} statt {rule_value}"
                )

        input_ids = set(case_input["dateValues"]) | set(case_input["localTimeValues"])
        missing_anchors = {
            anchor["inputId"] for anchor in rule["anchors"]
        } - input_ids
        if missing_anchors:
            errors.append(f"{case_id}: fehlende Anker {sorted(missing_anchors)}")
        calculation = rule["calculation"]
        if (
            calculation["type"] == "R1_RELATIVE"
            and "durationInputId" in calculation
            and calculation["durationInputId"] not in case_input["integerValues"]
        ):
            errors.append(
                f"{case_id}: fehlender Zahlenwert {calculation['durationInputId']}"
            )
            continue

        for source_ref in case["sourceRefs"]:
            if source_ref["sourceId"] not in source_ids:
                errors.append(
                    f"{case_id}: unbekannte Quelle {source_ref['sourceId']}"
                )
            if rule["ruleId"] not in source_ref["ruleIds"]:
                errors.append(f"{case_id}: Quellenverweis nennt die gewählte Regel nicht")

        provisional = calculate_provisional(rule, case_input)
        final_deadline = shift_deadline(provisional, rule, holidays)
        expected = case["expected"]
        if expected["provisionalDeadline"]["date"] != provisional.isoformat():
            errors.append(
                f"{case_id}: Rohresultat {expected['provisionalDeadline']['date']} "
                f"statt {provisional.isoformat()}"
            )
        if expected["finalDeadline"]["date"] != final_deadline.isoformat():
            errors.append(
                f"{case_id}: Fristende {expected['finalDeadline']['date']} "
                f"statt {final_deadline.isoformat()}"
            )
        expected_outcome = (
            "manualReview"
            if rule["resultPolicy"]["endShiftPolicy"] == "manualReview"
            else "calculated"
        )
        if expected["outcome"] != expected_outcome:
            errors.append(
                f"{case_id}: Ergebnisstatus {expected['outcome']} statt {expected_outcome}"
            )
        actual_gate_results = expected_gate_results(
            rule, case_input, final_deadline, gates
        )
        if expected["gateResults"] != actual_gate_results:
            errors.append(f"{case_id}: Gate-Ergebnis stimmt nicht")
        filing = filings[rule["filingProfileId"]]
        expected_filing = {
            "filingProfileId": filing["filingProfileId"],
            "preservationMode": filing["preservationMode"],
            "originalRequired": filing["originalRequired"],
            "cutoffTime": filing["cutoffTime"],
            "timezone": filing["timezone"],
        }
        if expected["filingRequirement"] != expected_filing:
            errors.append(f"{case_id}: Einreichungsanforderung stimmt nicht")
        if expected["appliedRuleIds"] != [rule["ruleId"]]:
            errors.append(f"{case_id}: angewandte Regel-IDs stimmen nicht")
        if expected["appliedOverrideIds"] != rule["legalOverrideIds"]:
            errors.append(f"{case_id}: angewandte Overrides stimmen nicht")
        sequences = [step["sequence"] for step in expected["trace"]]
        if sequences != list(range(1, len(sequences) + 1)):
            errors.append(f"{case_id}: Rechenspur ist nicht lückenlos")
        if expected["trace"][-1].get("outputDate") != final_deadline.isoformat():
            errors.append(f"{case_id}: letzter Schritt gibt nicht das Fristende aus")

    if len(case_ids) != 8:
        errors.append(f"Kandidaten-Suite: acht Fälle erwartet, vorhanden {len(case_ids)}")
    return errors


def run_semantic_negative_tests(catalog: dict[str, Any]) -> list[str]:
    tests: list[tuple[str, str, Any]] = []

    def unknown_rule(data: dict[str, Any]) -> None:
        data["regimes"][0]["calculationRuleIds"] = ["NOT-AVAILABLE-001"]

    tests.append(("unbekannte Regel", "unbekannte Regeln", unknown_rule))

    def duplicate_rule(data: dict[str, Any]) -> None:
        data["deadlineRules"].append(copy.deepcopy(data["deadlineRules"][0]))

    tests.append(("doppelte Regel", "doppelte ID", duplicate_rule))

    def unknown_anchor(data: dict[str, Any]) -> None:
        data["deadlineRules"][0]["calculation"]["anchorInputId"] = "missingDate"

    tests.append(("unbekannter Anker", "unbekannte Anker", unknown_anchor))

    def blocked_with_rule(data: dict[str, Any]) -> None:
        blocked = next(item for item in data["regimes"] if item["status"] == "blocked")
        blocked["calculationRuleIds"] = [data["deadlineRules"][0]["ruleId"]]

    tests.append(("gesperrtes Rechenregime", "gesperrtes Regime enthält", blocked_with_rule))

    passed: list[str] = []
    for name, expected_text, mutator in tests:
        mutated = copy.deepcopy(catalog)
        mutator(mutated)
        errors = validate_catalog_semantics(mutated)
        if not any(expected_text in error for error in errors):
            raise AssertionError(
                f"Semantischer Negativtest {name} meldete nicht {expected_text!r}: {errors}"
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
            schemas["special-regime-catalog.schema.json"],
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
        for path, schema_name in POSITIVE_EXAMPLES.items():
            errors.extend(
                schema_errors(
                    load_json(path),
                    schemas[schema_name],
                    registry,
                    str(path.relative_to(REPOSITORY_ROOT)),
                )
            )
        invalid_passed: list[str] = []
        for path, schema_name in NEGATIVE_EXAMPLES.items():
            fixture_errors = schema_errors(
                load_json(path),
                schemas[schema_name],
                registry,
                str(path.relative_to(REPOSITORY_ROOT)),
            )
            if not fixture_errors:
                errors.append(f"{path.relative_to(REPOSITORY_ROOT)} wurde fälschlich akzeptiert")
            else:
                invalid_passed.append(path.name)
        if errors:
            raise SpecialRegimeValidationError(errors)

        semantic_errors = validate_catalog_semantics(catalog)
        semantic_errors.extend(validate_case_semantics(suite, catalog))
        if semantic_errors:
            raise SpecialRegimeValidationError(semantic_errors)
        semantic_negative_passed = run_semantic_negative_tests(catalog)
        print(
            "VALID: "
            f"regimes={len(catalog['regimes'])}, "
            f"rules={len(catalog['deadlineRules'])}, "
            f"filingProfiles={len(catalog['filingProfiles'])}, "
            f"candidateCases={len(suite['cases'])}"
        )
        print("NEGATIVE FIXTURES: " + ", ".join(invalid_passed))
        print("SEMANTIC NEGATIVE TESTS: " + ", ".join(semantic_negative_passed))
    except (SpecialRegimeValidationError, AssertionError, KeyError) as error:
        print(f"INVALID:\n{error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
