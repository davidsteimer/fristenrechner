#!/usr/bin/env python3
"""Validiert und berechnet die AP6-Golden-Cases unabhängig nach."""

from __future__ import annotations

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
GOLDEN_DIRECTORY = REPOSITORY_ROOT / "tests" / "golden"
RELEASE_ID = "2026-08-29-ap5-approved.1"
RELEASE_DIRECTORY = REPOSITORY_ROOT / "data" / "releases" / RELEASE_ID
SCHEMA_FILES = (
    "common.schema.json",
    "golden-case-suite.schema.json",
)
SUITE_FILES = (
    GOLDEN_DIRECTORY / "candidate" / "golden-cases.json",
    GOLDEN_DIRECTORY / "unresolved" / "open-cases.json",
)
INVALID_FILE = GOLDEN_DIRECTORY / "invalid" / "missing-deadline-days.json"
REQUIRED_TAGS = {
    "start-next-day",
    "end-saturday-or-sunday",
    "holiday-national-or-bern",
    "year-boundary",
    "leap-year",
    "suspension",
}
REQUIRED_PROFILES = {"stpo", "zpo", "bgg", "vwvg", "vrpg-be"}


class GoldenValidationError(Exception):
    """Fasst alle fachlichen und technischen Validierungsfehler zusammen."""

    def __init__(self, errors: Iterable[str]):
        self.errors = sorted(set(errors))
        super().__init__("\n".join(self.errors))


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise GoldenValidationError([f"{path}: ungültiges JSON: {error}"]) from error


def iso_date(value: str) -> date:
    return date.fromisoformat(value)


def schema_registry() -> tuple[dict[str, dict[str, Any]], Registry]:
    schemas = {
        name: load_json(SCHEMA_DIRECTORY / name)
        for name in SCHEMA_FILES
    }
    for name, schema in schemas.items():
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:
            raise GoldenValidationError(
                [f"schemas/{name}: ungültiges JSON-Schema: {error}"]
            ) from error
    registry = Registry().with_resources(
        (
            schema["$id"],
            Resource.from_contents(schema),
        )
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


def load_release() -> tuple[
    dict[str, Any],
    dict[str, dict[str, Any]],
    dict[str, dict[str, Any]],
]:
    manifest = load_json(RELEASE_DIRECTORY / "manifest.json")
    profiles: dict[str, dict[str, Any]] = {}
    calendars: dict[str, dict[str, Any]] = {}
    for artifact in manifest["artifacts"]:
        document = load_json(RELEASE_DIRECTORY / artifact["path"])
        if artifact["role"] == "legalProfile":
            profiles[document["profileId"]] = document
        elif artifact["role"] == "calendar":
            calendars[document["calendarId"]] = document
    return manifest, profiles, calendars


def merged_holidays(
    calendar_id: str,
    calendars: dict[str, dict[str, Any]],
    visited: set[str] | None = None,
) -> dict[date, list[str]]:
    if visited is None:
        visited = set()
    if calendar_id in visited:
        raise GoldenValidationError([f"Kalenderzyklus bei {calendar_id}"])
    visited = visited | {calendar_id}
    calendar = calendars[calendar_id]
    result: dict[date, list[str]] = {}
    for inherited_id in calendar["inherits"]:
        for holiday_date, holiday_ids in merged_holidays(
            inherited_id, calendars, visited
        ).items():
            result.setdefault(holiday_date, []).extend(holiday_ids)
    for holiday in calendar["holidays"]:
        result.setdefault(iso_date(holiday["date"]), []).append(holiday["holidayId"])
    return result


def suspension_periods(
    calendars: dict[str, dict[str, Any]],
) -> dict[str, dict[str, tuple[date, date]]]:
    result: dict[str, dict[str, tuple[date, date]]] = {}
    for calendar in calendars.values():
        for suspension_set in calendar["suspensionSets"]:
            set_id = suspension_set["suspensionSetId"]
            result.setdefault(set_id, {})
            for period in suspension_set["periods"]:
                result[set_id][period["periodId"]] = (
                    iso_date(period["startsOn"]),
                    iso_date(period["endsOn"]),
                )
    return result


def conditions_match(rule: dict[str, Any], selectors: dict[str, str]) -> bool:
    for condition in rule["conditions"]:
        if selectors.get(condition["selector"]) not in condition["values"]:
            return False
    return True


def rule_by_effect(
    profile: dict[str, Any],
    effect_type: str,
) -> list[dict[str, Any]]:
    return [
        rule
        for rule in profile["rules"]
        if rule["effect"]["type"] == effect_type
    ]


def block_reasons(case: dict[str, Any], profile: dict[str, Any]) -> list[str]:
    inputs = case["input"]
    selectors = inputs["selectors"]
    confirmations = inputs["confirmations"]
    reasons: list[str] = []

    selector_definitions = {
        selector["selectorId"]: selector
        for selector in profile["selectors"]
    }
    for selector_id, definition in selector_definitions.items():
        if definition["required"] and selector_id not in selectors:
            reasons.append("requiredSelectorMissing")
            continue
        if selector_id not in selectors:
            continue
        valid_values = {option["value"] for option in definition["options"]}
        value = selectors[selector_id]
        if value not in valid_values:
            reasons.append("unknownSelectorValue")
        elif value == "unknown" and definition["unknownHandling"] == "block":
            if selector_id == "specialLawStatus":
                reasons.append("unknownSpecialLaw")
            else:
                reasons.append("unknownSelectorValue")

    if selectors.get("specialLawStatus") == "knownOverride":
        reasons.append("knownSpecialLawOverride")
    if selectors.get("specialLawStatus") == "noKnownOverride" and not confirmations.get(
        "specialLawChecked", False
    ):
        reasons.append("specialLawCheckUnconfirmed")

    if inputs["inputDateSemantics"] == "failedDeliveryAttemptDate" and not confirmations.get(
        "deliveryFictionApplicabilityConfirmed", False
    ):
        reasons.append("deliveryFictionApplicabilityUnconfirmed")

    if inputs["inputDateSemantics"] == "observedOrdinaryMailDeliveryDate" and not confirmations.get(
        "deliveryFictionApplicabilityConfirmed", False
    ):
        reasons.append("deliveryFictionApplicabilityUnconfirmed")

    if len(inputs["holidayAnchorCandidates"]) > 1 and not confirmations.get(
        "holidayAnchorConfirmed", False
    ):
        reasons.append("holidayAnchorConflictUnresolved")

    return sorted(set(reasons))


def resolve_legally_relevant_date(
    case: dict[str, Any],
    profile: dict[str, Any],
    holidays: dict[date, list[str]],
) -> date:
    inputs = case["input"]
    input_date = iso_date(inputs["inputDate"])
    semantics = inputs["inputDateSemantics"]
    if semantics == "legallyRelevantDeliveryOrEventDate":
        return input_date
    if semantics == "failedDeliveryAttemptDate":
        matching = [
            rule
            for rule in rule_by_effect(profile, "deliveryDate")
            if conditions_match(rule, inputs["selectors"])
            and rule["effect"]["mode"] == "seventhDayAfterFailedAttempt"
        ]
        if len(matching) != 1:
            raise GoldenValidationError(
                [f"{case['caseId']}: Zustellfiktion ist nicht eindeutig"]
            )
        return input_date + timedelta(days=matching[0]["effect"]["daysAfterFailedAttempt"])
    if semantics == "observedOrdinaryMailDeliveryDate":
        matching = [
            rule
            for rule in rule_by_effect(profile, "deliveryDate")
            if conditions_match(rule, inputs["selectors"])
            and rule["effect"]["mode"] == "nextWorkingDayAfterWeekendOrHoliday"
        ]
        if len(matching) != 1:
            raise GoldenValidationError(
                [f"{case['caseId']}: Wochenendzustellung ist nicht eindeutig"]
            )
        resolved = input_date
        while resolved.weekday() >= 5 or resolved in holidays:
            resolved += timedelta(days=1)
        return resolved
    raise GoldenValidationError([f"{case['caseId']}: unbekannte Eingabesemantik"])


def suspension_configuration(
    profile: dict[str, Any],
    selectors: dict[str, str],
) -> tuple[bool, str | None, list[str]]:
    enabled = False
    suspension_set_id: str | None = None
    applied_rules: list[str] = []
    for rule in profile["rules"]:
        effect = rule["effect"]
        if effect["type"] == "suspension":
            applied_rules.append(rule["ruleId"])
            if effect["mode"] == "useSet":
                enabled = True
                suspension_set_id = effect["suspensionSetId"]
        elif effect["type"] == "suspensionException" and conditions_match(
            rule, selectors
        ):
            applied_rules.append(rule["ruleId"])
            enabled = False
        elif effect["type"] == "suspensionRouting":
            selected_value = selectors.get(effect["selector"])
            for routing_case in effect["cases"]:
                if routing_case["value"] == selected_value:
                    applied_rules.append(rule["ruleId"])
                    enabled = routing_case["suspensionEnabled"]
    return enabled, suspension_set_id, applied_rules


def calculate_case(
    case: dict[str, Any],
    profile: dict[str, Any],
    calendars: dict[str, dict[str, Any]],
    periods: dict[str, dict[str, tuple[date, date]]],
) -> dict[str, Any]:
    calendar_id = case["input"]["calendarId"]
    holidays = merged_holidays(calendar_id, calendars)
    reasons = block_reasons(case, profile)
    if reasons:
        legally_relevant_date = None
        if case["input"]["inputDateSemantics"] == "legallyRelevantDeliveryOrEventDate":
            legally_relevant_date = case["input"]["inputDate"]
        return {
            "outcome": "blocked",
            "legallyRelevantDate": legally_relevant_date,
            "blockReasonKeys": reasons,
        }

    legally_relevant = resolve_legally_relevant_date(case, profile, holidays)
    deadline_start = legally_relevant + timedelta(days=1)
    suspension_enabled, suspension_set_id, _ = suspension_configuration(
        profile, case["input"]["selectors"]
    )

    applicable_periods: dict[str, tuple[date, date]] = {}
    if suspension_enabled:
        if suspension_set_id is None:
            raise GoldenValidationError(
                [f"{case['caseId']}: Stillstand ohne Stillstandssatz"]
            )
        if suspension_set_id not in periods:
            raise GoldenValidationError(
                [f"{case['caseId']}: unbekannter Stillstandssatz {suspension_set_id}"]
            )
        applicable_periods = periods[suspension_set_id]

    current = legally_relevant
    counted_days = 0
    skipped_days = 0
    encountered_period_ids: list[str] = []
    while counted_days < case["input"]["deadlineDays"]:
        current += timedelta(days=1)
        matching_period_ids = [
            period_id
            for period_id, (starts_on, ends_on) in applicable_periods.items()
            if starts_on <= current <= ends_on
        ]
        if matching_period_ids:
            skipped_days += 1
            for period_id in matching_period_ids:
                if period_id not in encountered_period_ids:
                    encountered_period_ids.append(period_id)
            continue
        counted_days += 1

    provisional_end = current
    final_end = provisional_end
    shift_reasons: list[str] = []
    holiday_ids: list[str] = []
    while final_end.weekday() >= 5 or final_end in holidays:
        if final_end.weekday() == 5 and "saturday" not in shift_reasons:
            shift_reasons.append("saturday")
        if final_end.weekday() == 6 and "sunday" not in shift_reasons:
            shift_reasons.append("sunday")
        if final_end in holidays:
            if "publicHoliday" not in shift_reasons:
                shift_reasons.append("publicHoliday")
            for holiday_id in holidays[final_end]:
                if holiday_id not in holiday_ids:
                    holiday_ids.append(holiday_id)
        final_end += timedelta(days=1)

    reason_order = {"saturday": 0, "sunday": 1, "publicHoliday": 2}
    shift_reasons.sort(key=reason_order.__getitem__)
    holiday_ids.sort()

    return {
        "outcome": "calculated",
        "legallyRelevantDate": legally_relevant.isoformat(),
        "deadlineStart": deadline_start.isoformat(),
        "provisionalEnd": provisional_end.isoformat(),
        "finalEnd": final_end.isoformat(),
        "suspension": {
            "enabled": suspension_enabled,
            "periodIds": encountered_period_ids,
            "skippedCalendarDays": skipped_days,
        },
        "endShift": {
            "applied": final_end != provisional_end,
            "reasonKeys": shift_reasons,
            "holidayIds": holiday_ids,
        },
        "blockReasonKeys": [],
    }


def compare_value(
    case_id: str,
    field: str,
    actual: Any,
    expected: Any,
    errors: list[str],
) -> None:
    if actual != expected:
        errors.append(
            f"{case_id}: {field} erwartet {expected!r}, berechnet {actual!r}"
        )


def validate_trace(case: dict[str, Any], errors: list[str]) -> None:
    case_id = case["caseId"]
    expected = case["expected"]
    trace = expected["trace"]
    sequences = [step["sequence"] for step in trace]
    if sequences != list(range(1, len(trace) + 1)):
        errors.append(f"{case_id}: Rechenspur hat keine lückenlose Reihenfolge")
    all_rule_ids = set(expected["appliedRuleIds"])
    for step in trace:
        unknown = set(step["ruleIds"]) - all_rule_ids
        if unknown:
            errors.append(
                f"{case_id}: Rechenspur verwendet nicht angewandte Regeln {sorted(unknown)}"
            )
    final_step = trace[-1]
    if expected["outcome"] == "calculated":
        if final_step["operation"] != "returnResult":
            errors.append(f"{case_id}: Rechenspur endet nicht mit returnResult")
        if final_step.get("outputDate") != expected["finalEnd"]:
            errors.append(f"{case_id}: letztes Spurdatum stimmt nicht mit finalEnd überein")
        expected_operations = {
            "resolveInputDate",
            "setDeadlineStart",
            "countDeadlineDays",
            "returnResult",
        }
        actual_operations = {step["operation"] for step in trace}
        missing = expected_operations - actual_operations
        if missing:
            errors.append(f"{case_id}: Rechenspur fehlt {sorted(missing)}")
    elif final_step["operation"] != "blockCalculation":
        errors.append(f"{case_id}: blockierter Fall endet nicht mit blockCalculation")


def validate_case_references(
    case: dict[str, Any],
    profile: dict[str, Any],
    calendars: dict[str, dict[str, Any]],
    errors: list[str],
) -> None:
    case_id = case["caseId"]
    rule_ids = {rule["ruleId"] for rule in profile["rules"]}
    applied_rule_ids = set(case["expected"]["appliedRuleIds"])
    unknown_applied = applied_rule_ids - rule_ids
    if unknown_applied:
        errors.append(f"{case_id}: unbekannte angewandte Regeln {sorted(unknown_applied)}")

    source_ids = {source["sourceId"] for source in profile["sources"]}
    for calendar in calendars.values():
        source_ids.update(source["sourceId"] for source in calendar["sources"])
    for source_ref in case["sourceRefs"]:
        if source_ref["sourceId"] not in source_ids:
            errors.append(f"{case_id}: unbekannte Quelle {source_ref['sourceId']}")
        unknown_rules = set(source_ref["ruleIds"]) - rule_ids
        if unknown_rules:
            errors.append(
                f"{case_id}: Quellenverweis nennt unbekannte Regeln {sorted(unknown_rules)}"
            )
        unapplied_rules = set(source_ref["ruleIds"]) - applied_rule_ids
        if unapplied_rules:
            errors.append(
                f"{case_id}: Quellenverweis nennt nicht angewandte Regeln {sorted(unapplied_rules)}"
            )

    calendar_id = case["input"]["calendarId"]
    if calendar_id not in calendars:
        errors.append(f"{case_id}: unbekannter Kalender {calendar_id}")


def validate_suite_semantics(
    suite: dict[str, Any],
    manifest: dict[str, Any],
    profiles: dict[str, dict[str, Any]],
    calendars: dict[str, dict[str, Any]],
    periods: dict[str, dict[str, tuple[date, date]]],
    errors: list[str],
) -> None:
    case_ids: set[str] = set()
    coverage_from = iso_date(manifest["coverage"]["from"])
    coverage_to = iso_date(manifest["coverage"]["to"])
    for case in suite["cases"]:
        case_id = case["caseId"]
        if case_id in case_ids:
            errors.append(f"{suite['suiteId']}: doppelte Fall-ID {case_id}")
        case_ids.add(case_id)

        if case["dataReleaseId"] != manifest["releaseId"]:
            errors.append(f"{case_id}: falscher Datenrelease")
        profile = profiles.get(case["profileId"])
        if profile is None:
            errors.append(f"{case_id}: unbekanntes Rechtsprofil")
            continue
        validate_case_references(case, profile, calendars, errors)
        validate_trace(case, errors)

        input_date = iso_date(case["input"]["inputDate"])
        if not coverage_from <= input_date <= coverage_to:
            errors.append(f"{case_id}: Eingabedatum liegt ausserhalb des Datenrelease")

        actual = calculate_case(case, profile, calendars, periods)
        expected = case["expected"]
        compare_value(case_id, "outcome", actual["outcome"], expected["outcome"], errors)
        if actual["outcome"] == "blocked":
            compare_value(
                case_id,
                "blockReasonKeys",
                actual["blockReasonKeys"],
                sorted(expected["blockReasonKeys"]),
                errors,
            )
            if actual.get("legallyRelevantDate") is not None:
                compare_value(
                    case_id,
                    "legallyRelevantDate",
                    actual["legallyRelevantDate"],
                    expected.get("legallyRelevantDate"),
                    errors,
                )
            continue

        for field in (
            "legallyRelevantDate",
            "deadlineStart",
            "provisionalEnd",
            "finalEnd",
        ):
            compare_value(case_id, field, actual[field], expected[field], errors)
        compare_value(
            case_id,
            "suspension.enabled",
            actual["suspension"]["enabled"],
            expected["suspension"]["enabled"],
            errors,
        )
        compare_value(
            case_id,
            "suspension.periodIds",
            actual["suspension"]["periodIds"],
            expected["suspension"]["periodIds"],
            errors,
        )
        compare_value(
            case_id,
            "suspension.skippedCalendarDays",
            actual["suspension"]["skippedCalendarDays"],
            expected["suspension"]["skippedCalendarDays"],
            errors,
        )
        for field in ("applied", "reasonKeys", "holidayIds"):
            compare_value(
                case_id,
                f"endShift.{field}",
                actual["endShift"][field],
                expected["endShift"][field],
                errors,
            )

    if suite["suiteStatus"] == "candidate":
        for case in suite["cases"]:
            if case["expectationStatus"] != "candidate" or case["expected"]["outcome"] != "calculated":
                errors.append(
                    f"{suite['suiteId']}: Kandidatensuite enthält nicht berechenbaren Fall"
                )
    if suite["suiteStatus"] == "unresolved":
        for case in suite["cases"]:
            if case["expectationStatus"] != "blocked" or case["expected"]["outcome"] != "blocked":
                errors.append(
                    f"{suite['suiteId']}: offene Suite enthält freigegebene Erwartung"
                )


def validate_coverage(candidate_suite: dict[str, Any], errors: list[str]) -> None:
    cases = candidate_suite["cases"]
    if len(cases) < 10:
        errors.append("Kandidatensuite enthält weniger als zehn Golden Cases")
    profiles = {case["profileId"] for case in cases}
    missing_profiles = REQUIRED_PROFILES - profiles
    if missing_profiles:
        errors.append(f"Kandidatensuite fehlt Profile {sorted(missing_profiles)}")
    tags = {tag for case in cases for tag in case["tags"]}
    missing_tags = REQUIRED_TAGS - tags
    if missing_tags:
        errors.append(f"Kandidatensuite fehlt Mindestabdeckung {sorted(missing_tags)}")


def run_semantic_negative_tests(
    candidate_suite: dict[str, Any],
    unresolved_suite: dict[str, Any],
    manifest: dict[str, Any],
    profiles: dict[str, dict[str, Any]],
    calendars: dict[str, dict[str, Any]],
    periods: dict[str, dict[str, tuple[date, date]]],
) -> list[str]:
    mutations: list[tuple[str, dict[str, Any]]] = []

    wrong_result = copy.deepcopy(candidate_suite)
    wrong_result["cases"][0]["expected"]["finalEnd"] = "2026-09-03"
    mutations.append(("falsches Fristende", wrong_result))

    unknown_source = copy.deepcopy(candidate_suite)
    unknown_source["cases"][0]["sourceRefs"][0]["sourceId"] = "SRC-UNKNOWN-999"
    mutations.append(("unbekannte Quelle", unknown_source))

    duplicate_case = copy.deepcopy(candidate_suite)
    duplicate_case["cases"][1]["caseId"] = duplicate_case["cases"][0]["caseId"]
    mutations.append(("doppelte Fall-ID", duplicate_case))

    wrong_block_reason = copy.deepcopy(unresolved_suite)
    wrong_block_reason["cases"][0]["expected"]["blockReasonKeys"] = [
        "incorrectBlockReason"
    ]
    mutations.append(("falscher Sperrgrund", wrong_block_reason))

    rejected: list[str] = []
    for label, suite in mutations:
        mutation_errors: list[str] = []
        validate_suite_semantics(
            suite,
            manifest,
            profiles,
            calendars,
            periods,
            mutation_errors,
        )
        if not mutation_errors:
            raise GoldenValidationError(
                [f"Semantischer Negativtest wurde akzeptiert: {label}"]
            )
        rejected.append(label)
    return rejected


def main() -> int:
    try:
        schemas, registry = schema_registry()
        golden_schema = schemas["golden-case-suite.schema.json"]
        suites = [load_json(path) for path in SUITE_FILES]
        errors: list[str] = []
        for path, suite in zip(SUITE_FILES, suites):
            errors.extend(
                schema_errors(
                    suite,
                    golden_schema,
                    registry,
                    str(path.relative_to(REPOSITORY_ROOT)),
                )
            )
        if errors:
            raise GoldenValidationError(errors)

        invalid = load_json(INVALID_FILE)
        invalid_errors = schema_errors(
            invalid,
            golden_schema,
            registry,
            str(INVALID_FILE.relative_to(REPOSITORY_ROOT)),
        )
        if not invalid_errors:
            raise GoldenValidationError(
                ["Erwarteter Negativdatensatz wurde fälschlich akzeptiert"]
            )
        if not any("deadlineDays" in error for error in invalid_errors):
            raise GoldenValidationError(
                ["Negativdatensatz scheitert nicht am fehlenden deadlineDays"]
            )

        manifest, profiles, calendars = load_release()
        periods = suspension_periods(calendars)
        all_case_ids: set[str] = set()
        for suite in suites:
            validate_suite_semantics(
                suite,
                manifest,
                profiles,
                calendars,
                periods,
                errors,
            )
            for case in suite["cases"]:
                if case["caseId"] in all_case_ids:
                    errors.append(f"Suiteübergreifend doppelte Fall-ID {case['caseId']}")
                all_case_ids.add(case["caseId"])
        validate_coverage(suites[0], errors)
        if errors:
            raise GoldenValidationError(errors)

        rejected_mutations = run_semantic_negative_tests(
            suites[0],
            suites[1],
            manifest,
            profiles,
            calendars,
            periods,
        )

        candidate_count = len(suites[0]["cases"])
        blocked_count = len(suites[1]["cases"])
        print(
            "VALID: "
            f"candidateCases={candidate_count}, "
            f"blockedCases={blocked_count}, "
            f"profiles={len(REQUIRED_PROFILES)}, "
            f"dataRelease={manifest['releaseId']}"
        )
        print(
            "NEGATIVE FIXTURE: missing-deadline-days.json wurde wie erwartet abgewiesen"
        )
        print("SEMANTIC NEGATIVE TESTS: " + ", ".join(rejected_mutations))
        return 0
    except GoldenValidationError as error:
        print("INVALID:", file=sys.stderr)
        for message in error.errors:
            print(f"- {message}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
