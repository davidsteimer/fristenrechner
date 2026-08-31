#!/usr/bin/env python3
"""Validiert ein Datenrelease strukturell, semantisch und kryptografisch."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import shutil
import sys
import tempfile
from collections.abc import Callable, Iterable
from datetime import date, timedelta
from pathlib import Path, PurePosixPath
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIRECTORY = REPOSITORY_ROOT / "schemas"
SCHEMA_FILES = (
    "common.schema.json",
    "legal-profile.schema.json",
    "calendar.schema.json",
    "calendar-rules-v2.schema.json",
    "filing-profile.schema.json",
    "deadline-definition.schema.json",
    "special-regime-catalog-v2.schema.json",
    "release-manifest.schema.json",
)
MANIFEST_SCHEMA_ID = (
    "https://raw.githubusercontent.com/davidsteimer/fristenrechner/"
    "main/schemas/release-manifest.schema.json"
)
PROFILE_SCHEMA_ID = (
    "https://raw.githubusercontent.com/davidsteimer/fristenrechner/"
    "main/schemas/legal-profile.schema.json"
)
CALENDAR_SCHEMA_ID = (
    "https://raw.githubusercontent.com/davidsteimer/fristenrechner/"
    "main/schemas/calendar.schema.json"
)
CALENDAR_RULE_SCHEMA_ID = (
    "https://raw.githubusercontent.com/davidsteimer/fristenrechner/"
    "main/schemas/calendar-rules-v2.schema.json"
)
SPECIAL_CATALOG_SCHEMA_ID = (
    "https://raw.githubusercontent.com/davidsteimer/fristenrechner/"
    "main/schemas/special-regime-catalog-v2.schema.json"
)


class ReleaseValidationError(Exception):
    """Fasst sämtliche Validierungsfehler eines Releases zusammen."""

    def __init__(self, errors: Iterable[str]):
        self.errors = sorted(set(errors))
        super().__init__("\n".join(self.errors))


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ReleaseValidationError([f"{path}: ungültiges JSON: {error}"]) from error


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_handle:
        for block in iter(lambda: file_handle.read(65536), b""):
            digest.update(block)
    return digest.hexdigest()


def load_schema_registry() -> tuple[dict[str, dict[str, Any]], Registry]:
    schemas = {
        name: load_json(SCHEMA_DIRECTORY / name)
        for name in SCHEMA_FILES
    }
    for name, schema in schemas.items():
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:
            raise ReleaseValidationError(
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


def validate_against_schema(
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


def collect_source_references(node: Any) -> Iterable[dict[str, str]]:
    if isinstance(node, dict):
        source_refs = node.get("sourceRefs")
        if isinstance(source_refs, list):
            yield from source_refs
        for value in node.values():
            yield from collect_source_references(value)
    elif isinstance(node, list):
        for value in node:
            yield from collect_source_references(value)


def check_date_order(
    start: str,
    end: str,
    label: str,
    errors: list[str],
) -> None:
    if start > end:
        errors.append(f"{label}: Beginn {start} liegt nach Ende {end}")


def easter_sunday(year: int) -> date:
    """Berechnet den Ostersonntag nach dem gregorianischen Kalender."""

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


def third_sunday_in_september(year: int) -> date:
    first = date(year, 9, 1)
    first_sunday = first + timedelta(days=(6 - first.weekday()) % 7)
    return first_sunday + timedelta(days=14)


def expected_holiday_date(label_key: str, year: int) -> date | None:
    fixed_dates = {
        "holiday.ch.nationalDay": (8, 1),
        "holiday.be.newYear": (1, 1),
        "holiday.be.berchtoldDay": (1, 2),
        "holiday.be.christmas": (12, 25),
        "holiday.be.stStephen": (12, 26),
    }
    if label_key in fixed_dates:
        month, day = fixed_dates[label_key]
        return date(year, month, day)
    easter_offsets = {
        "holiday.be.goodFriday": -2,
        "holiday.be.easter": 0,
        "holiday.be.easterMonday": 1,
        "holiday.be.ascension": 39,
        "holiday.be.pentecost": 49,
        "holiday.be.whitMonday": 50,
    }
    if label_key in easter_offsets:
        return easter_sunday(year) + timedelta(days=easter_offsets[label_key])
    if label_key == "holiday.be.federalFast":
        return third_sunday_in_september(year)
    return None


def check_known_calendar_completeness(
    calendar: dict[str, Any],
    display_path: str,
    errors: list[str],
) -> None:
    expected_labels = {
        "ch-federal-calendar": {"holiday.ch.nationalDay"},
        "be-public-holidays": {
            "holiday.be.newYear",
            "holiday.be.berchtoldDay",
            "holiday.be.goodFriday",
            "holiday.be.easter",
            "holiday.be.easterMonday",
            "holiday.be.ascension",
            "holiday.be.pentecost",
            "holiday.be.whitMonday",
            "holiday.be.federalFast",
            "holiday.be.christmas",
            "holiday.be.stStephen",
        },
    }.get(calendar["calendarId"])
    if expected_labels is None:
        return
    holidays_by_year: dict[int, list[dict[str, Any]]] = {}
    for holiday in calendar["holidays"]:
        holiday_year = int(holiday["date"][:4])
        holidays_by_year.setdefault(holiday_year, []).append(holiday)
    for year in (2026, 2027, 2028):
        actual_labels = {
            holiday["labelKey"] for holiday in holidays_by_year.get(year, [])
        }
        if actual_labels != expected_labels:
            errors.append(
                f"{display_path}: Feiertagsbestand {year} ist unvollständig oder "
                f"enthält Überhang, erwartet {sorted(expected_labels)}, "
                f"vorhanden {sorted(actual_labels)}"
            )


def check_known_suspension_period(
    suspension_set_id: str,
    period: dict[str, Any],
    display_path: str,
    errors: list[str],
) -> None:
    if suspension_set_id != "ch-court-holidays-2026-2028":
        return
    period_id = period["periodId"]
    expected_start: date | None = None
    expected_end: date | None = None
    if period_id.startswith("EASTER-"):
        year = int(period_id[-4:])
        easter = easter_sunday(year)
        expected_start = easter - timedelta(days=7)
        expected_end = easter + timedelta(days=7)
    elif period_id.startswith("SUMMER-"):
        year = int(period_id[-4:])
        expected_start = date(year, 7, 15)
        expected_end = date(year, 8, 15)
    elif period_id.startswith("YEAR-END-"):
        first_year = int(period_id[9:13])
        second_year = int(period_id[14:18])
        expected_start = date(first_year, 12, 18)
        expected_end = date(second_year, 1, 2)
    if expected_start is None or expected_end is None:
        errors.append(f"{display_path}: unbekannte Stillstandsperiode {period_id}")
        return
    if period["startsOn"] != expected_start.isoformat():
        errors.append(
            f"{display_path}: {period_id} beginnt am {period['startsOn']} statt "
            f"{expected_start.isoformat()}"
        )
    if period["endsOn"] != expected_end.isoformat():
        errors.append(
            f"{display_path}: {period_id} endet am {period['endsOn']} statt "
            f"{expected_end.isoformat()}"
        )


def check_local_sources(
    document: dict[str, Any],
    display_path: str,
    errors: list[str],
) -> None:
    source_ids = [source["sourceId"] for source in document.get("sources", [])]
    if len(source_ids) != len(set(source_ids)):
        errors.append(f"{display_path}: doppelte Quellen-ID")
    available = set(source_ids)
    for source_ref in collect_source_references(document):
        if source_ref["sourceId"] not in available:
            errors.append(
                f"{display_path}: Quellenverweis {source_ref['sourceId']} ist nicht lokal aufgelöst"
            )


def check_profile(
    profile: dict[str, Any],
    display_path: str,
    errors: list[str],
) -> tuple[set[str], set[str]]:
    check_local_sources(profile, display_path, errors)
    rule_ids = [rule["ruleId"] for rule in profile["rules"]]
    if len(rule_ids) != len(set(rule_ids)):
        errors.append(f"{display_path}: doppelte Regel-ID")

    selectors = {
        selector["selectorId"]: {
            option["value"] for option in selector["options"]
        }
        for selector in profile["selectors"]
    }
    if len(selectors) != len(profile["selectors"]):
        errors.append(f"{display_path}: doppelte Selektor-ID")
    for selector in profile["selectors"]:
        option_values = [option["value"] for option in selector["options"]]
        if len(option_values) != len(set(option_values)):
            errors.append(
                f"{display_path}: Selektor {selector['selectorId']} enthält doppelte Optionen"
            )

    effects = [rule["effect"] for rule in profile["rules"]]
    for rule in profile["rules"]:
        for condition in rule["conditions"]:
            selector_id = condition["selector"]
            if selector_id not in selectors:
                errors.append(
                    f"{display_path}: Regel {rule['ruleId']} verwendet unbekannten Selektor {selector_id}"
                )
                continue
            unknown_values = set(condition["values"]) - selectors[selector_id]
            if unknown_values:
                errors.append(
                    f"{display_path}: Regel {rule['ruleId']} verwendet unbekannte "
                    f"Selektorwerte {sorted(unknown_values)}"
                )
        if rule["effect"]["type"] == "suspensionRouting":
            selector_id = rule["effect"]["selector"]
            if selector_id not in selectors:
                errors.append(
                    f"{display_path}: Regel {rule['ruleId']} routet über unbekannten "
                    f"Selektor {selector_id}"
                )
            else:
                case_values = [case["value"] for case in rule["effect"]["cases"]]
                if len(case_values) != len(set(case_values)):
                    errors.append(
                        f"{display_path}: Regel {rule['ruleId']} enthält doppelte Routingwerte"
                    )
                unknown_values = set(case_values) - selectors[selector_id]
                if unknown_values:
                    errors.append(
                        f"{display_path}: Regel {rule['ruleId']} routet unbekannte "
                        f"Selektorwerte {sorted(unknown_values)}"
                    )

    def count_effect(effect_type: str) -> int:
        return sum(effect["type"] == effect_type for effect in effects)

    for required_type in ("deadlineStart", "counting", "deadlineEnd", "holidayAnchor"):
        if count_effect(required_type) != 1:
            errors.append(
                f"{display_path}: genau ein Effekt des Typs {required_type} ist erforderlich"
            )

    holiday_effects = [
        effect for effect in effects if effect["type"] == "holidayAnchor"
    ]
    if holiday_effects:
        configured_anchor = profile["calendarPolicy"]["holidayAnchor"]
        if holiday_effects[0]["anchor"] != configured_anchor:
            errors.append(
                f"{display_path}: Feiertagsanknüpfung widerspricht der calendarPolicy"
            )

    counting_effects = [
        effect for effect in effects if effect["type"] == "counting"
    ]
    suspension_effects = [
        effect for effect in effects if effect["type"] == "suspension"
    ]
    uses_suspension = any(
        effect.get("mode") == "useSet" for effect in suspension_effects
    )
    if counting_effects:
        excludes_suspensions = (
            counting_effects[0]["mode"] == "calendarDaysExcludingSuspensions"
        )
        if excludes_suspensions != uses_suspension:
            errors.append(
                f"{display_path}: Zählmodus und Stillstandsregel widersprechen sich"
            )
    if any(
        effect["type"] in {"suspensionException", "suspensionRouting"}
        for effect in effects
    ) and not uses_suspension:
        errors.append(
            f"{display_path}: Stillstandsausnahme ohne aktiven Stillstand"
        )

    suspension_ids = {
        effect["suspensionSetId"]
        for effect in suspension_effects
        if effect.get("mode") == "useSet"
    }
    calendar_ids = {
        effect["calendarId"]
        for effect in effects
        if effect["type"] == "holidaySet"
    }
    return suspension_ids, calendar_ids


def check_calendar(
    calendar: dict[str, Any],
    display_path: str,
    errors: list[str],
) -> set[str]:
    check_local_sources(calendar, display_path, errors)
    coverage = calendar["coverage"]
    check_date_order(coverage["from"], coverage["to"], f"{display_path}: Abdeckung", errors)

    holiday_ids: set[str] = set()
    for holiday in calendar["holidays"]:
        holiday_id = holiday["holidayId"]
        if holiday_id in holiday_ids:
            errors.append(f"{display_path}: doppelter Feiertag {holiday_id}")
        holiday_ids.add(holiday_id)
        if not coverage["from"] <= holiday["date"] <= coverage["to"]:
            errors.append(
                f"{display_path}: Feiertag {holiday_id} liegt ausserhalb der Abdeckung"
            )
        holiday_date = date.fromisoformat(holiday["date"])
        expected_date = expected_holiday_date(
            holiday["labelKey"],
            holiday_date.year,
        )
        if expected_date is not None and holiday_date != expected_date:
            errors.append(
                f"{display_path}: Feiertag {holiday_id} liegt am {holiday['date']} "
                f"statt am {expected_date.isoformat()}"
            )
    check_known_calendar_completeness(calendar, display_path, errors)

    suspension_ids: set[str] = set()
    period_ids: set[str] = set()
    for suspension_set in calendar["suspensionSets"]:
        set_id = suspension_set["suspensionSetId"]
        if set_id in suspension_ids:
            errors.append(f"{display_path}: doppelter Stillstandssatz {set_id}")
        suspension_ids.add(set_id)
        periods = sorted(
            suspension_set["periods"],
            key=lambda period: (period["startsOn"], period["endsOn"]),
        )
        previous_end: str | None = None
        for period in periods:
            period_id = period["periodId"]
            if period_id in period_ids:
                errors.append(f"{display_path}: doppelte Stillstandsperiode {period_id}")
            period_ids.add(period_id)
            check_date_order(
                period["startsOn"],
                period["endsOn"],
                f"{display_path}: Stillstandsperiode {period_id}",
                errors,
            )
            if (
                period["startsOn"] < coverage["from"]
                or period["endsOn"] > coverage["to"]
            ):
                errors.append(
                    f"{display_path}: Stillstandsperiode {period_id} liegt ausserhalb "
                    "der Abdeckung"
                )
            if previous_end is not None and period["startsOn"] <= previous_end:
                errors.append(
                    f"{display_path}: Stillstandsperioden in {set_id} überlappen"
                )
            previous_end = max(previous_end or period["endsOn"], period["endsOn"])
            check_known_suspension_period(set_id, period, display_path, errors)
    return suspension_ids


def check_calendar_rules(
    calendar: dict[str, Any],
    display_path: str,
    errors: list[str],
) -> tuple[set[str], set[str], set[str]]:
    """Prüft die releaseweiten Beziehungen einer Kalenderkomponente 2.0.0."""

    check_local_sources(calendar, display_path, errors)
    validity = calendar["validity"]
    if validity["to"] is not None:
        check_date_order(
            validity["from"],
            validity["to"],
            f"{display_path}: Gültigkeit",
            errors,
        )
    rule_ids: set[str] = set()
    suspension_ids: set[str] = set()
    applicable_profiles: set[str] = set()
    override_targets: set[str] = set()
    for rule in calendar["rules"]:
        rule_id = rule["ruleId"]
        if rule_id in rule_ids:
            errors.append(f"{display_path}: doppelte Kalenderregel-ID {rule_id}")
        rule_ids.add(rule_id)
        if rule["calendarId"] != calendar["calendarId"]:
            errors.append(
                f"{display_path}: Kalenderregel {rule_id} widerspricht der Kalender-ID"
            )
        if rule["jurisdiction"] != calendar["jurisdiction"]:
            errors.append(
                f"{display_path}: Kalenderregel {rule_id} widerspricht dem Gemeinwesen"
            )
        rule_validity = rule["validity"]
        if rule_validity["to"] is not None:
            check_date_order(
                rule_validity["from"],
                rule_validity["to"],
                f"{display_path}: Kalenderregel {rule_id}",
                errors,
            )
        effect = rule["effect"]
        if effect["type"] == "suspensionPeriod":
            suspension_ids.add(effect["suspensionSetId"])
            applicable_profiles.update(effect["applicableProfileIds"])
        if effect["type"] == "explicitDateOverride" and "targetRuleId" in effect:
            override_targets.add(effect["targetRuleId"])
    return suspension_ids, applicable_profiles, override_targets


def check_inheritance(
    calendars: dict[str, dict[str, Any]],
    errors: list[str],
) -> None:
    for calendar_id, calendar in calendars.items():
        for inherited_id in calendar["inherits"]:
            if inherited_id not in calendars:
                errors.append(
                    f"Kalender {calendar_id}: unbekannter geerbter Kalender {inherited_id}"
                )
    for start_id in calendars:
        visiting: set[str] = set()
        visited: set[str] = set()

        def visit(calendar_id: str) -> None:
            if calendar_id in visiting:
                errors.append(f"Kalender {start_id}: zyklische Vererbung")
                return
            if calendar_id in visited or calendar_id not in calendars:
                return
            visiting.add(calendar_id)
            for inherited_id in calendars[calendar_id]["inherits"]:
                visit(inherited_id)
            visiting.remove(calendar_id)
            visited.add(calendar_id)

        visit(start_id)


def index_unique(
    items: list[dict[str, Any]],
    id_field: str,
    label: str,
    errors: list[str],
) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for item in items:
        item_id = item[id_field]
        if item_id in result:
            errors.append(f"{label}: doppelte ID {item_id}")
        result[item_id] = item
    return result


def calculated_anchor_ids(definition: dict[str, Any]) -> set[str]:
    calculation = definition.get("calculation")
    if not isinstance(calculation, dict):
        return set()
    calculation_type = calculation["type"]
    if calculation_type in {"R1_RELATIVE", "R2_OFFSET", "R3_WEEKDAY"}:
        return {calculation["anchorInputId"]}
    if calculation_type == "R4_DUAL":
        return {
            branch["anchorInputId"]
            for branch in calculation["branches"]
        }
    return set()


def check_special_catalog(
    catalog: dict[str, Any],
    display_path: str,
    profile_ids: set[str],
    calendar_ids: set[str],
    errors: list[str],
) -> tuple[set[str], int, int]:
    check_local_sources(catalog, display_path, errors)
    calendars = index_unique(
        catalog["calendarProfiles"],
        "calendarProfileId",
        f"{display_path}: Kalenderprofile",
        errors,
    )
    suspensions = index_unique(
        catalog["suspensionProfiles"],
        "suspensionProfileId",
        f"{display_path}: Stillstandsprofile",
        errors,
    )
    filings = index_unique(
        catalog["filingProfiles"],
        "filingProfileId",
        f"{display_path}: Einreichungsprofile",
        errors,
    )
    gates = index_unique(
        catalog["gates"],
        "gateId",
        f"{display_path}: Gates",
        errors,
    )
    overrides = index_unique(
        catalog["legalOverrides"],
        "overrideId",
        f"{display_path}: Overrides",
        errors,
    )
    definitions = index_unique(
        catalog["deadlineDefinitions"],
        "deadlineDefinitionId",
        f"{display_path}: Fristdefinitionen",
        errors,
    )
    regimes = index_unique(
        catalog["regimes"],
        "regimeId",
        f"{display_path}: Regime",
        errors,
    )
    requested_suspensions: set[str] = set()

    if catalog["profileId"] not in profile_ids:
        errors.append(
            f"{display_path}: unbekanntes Rechtsprofil {catalog['profileId']}"
        )
    for profile_id, calendar_profile in calendars.items():
        calendar_id = calendar_profile["calendarId"]
        if calendar_id is not None and calendar_id not in calendar_ids:
            errors.append(
                f"{display_path}: Kalenderprofil {profile_id} verweist auf "
                f"unbekannten Kalender {calendar_id}"
            )
    for profile_id, suspension in suspensions.items():
        if suspension["mode"] == "useSet":
            requested_suspensions.add(suspension["suspensionSetId"])

    for definition_id, definition in definitions.items():
        anchor_ids = [anchor["inputId"] for anchor in definition["anchors"]]
        if len(anchor_ids) != len(set(anchor_ids)):
            errors.append(f"{display_path}: Definition {definition_id} mit doppeltem Anker")
        if definition["deadlineOrigin"] == "CALCULATED":
            unknown_anchors = calculated_anchor_ids(definition) - set(anchor_ids)
            if unknown_anchors:
                errors.append(
                    f"{display_path}: Definition {definition_id} verwendet unbekannte "
                    f"Anker {sorted(unknown_anchors)}"
                )
            result_policy = definition["resultPolicy"]
            if result_policy["calendarProfileId"] not in calendars:
                errors.append(
                    f"{display_path}: Definition {definition_id} mit unbekanntem Kalenderprofil"
                )
            if result_policy["suspensionProfileId"] not in suspensions:
                errors.append(
                    f"{display_path}: Definition {definition_id} mit unbekanntem Stillstandsprofil"
                )
        else:
            authoritative = definition["authoritativeDeadline"]
            authoritative_ids = {authoritative["dateValueId"]}
            if "timeValueId" in authoritative:
                authoritative_ids.add(authoritative["timeValueId"])
            if authoritative_ids - set(anchor_ids):
                errors.append(
                    f"{display_path}: behördlich gesetzte Definition {definition_id} "
                    "verwendet unbekannte Werte"
                )
        if definition["filingProfileId"] not in filings:
            errors.append(
                f"{display_path}: Definition {definition_id} mit unbekanntem Einreichungsprofil"
            )
        for gate_id in definition["gateIds"]:
            if gate_id not in gates:
                errors.append(f"{display_path}: Definition {definition_id} mit unbekanntem Gate")
            elif gates[gate_id]["rightInputId"] not in anchor_ids:
                errors.append(
                    f"{display_path}: Definition {definition_id}, Gate {gate_id} "
                    "verwendet unbekannten Vergleichsanker"
                )
        for override_id in definition["legalOverrideIds"]:
            if override_id not in overrides:
                errors.append(
                    f"{display_path}: Definition {definition_id} mit unbekanntem Override"
                )

    for regime_id, regime in regimes.items():
        definition_ids = regime["deadlineDefinitionIds"]
        unknown_definitions = set(definition_ids) - set(definitions)
        if unknown_definitions:
            errors.append(
                f"{display_path}: Regime {regime_id} mit unbekannten Definitionen "
                f"{sorted(unknown_definitions)}"
            )
        if (
            regime["status"] == "supported"
            and not definition_ids
            and regime.get("regimeKind", "deadline") != "filingOverlay"
        ):
            errors.append(
                f"{display_path}: unterstütztes Regime {regime_id} ohne Fristdefinition"
            )
        if regime["status"] == "blocked" and definition_ids:
            errors.append(
                f"{display_path}: gesperrtes Regime {regime_id} enthält Fristdefinitionen"
            )
        if regime.get("regimeKind", "deadline") == "filingOverlay" and definition_ids:
            errors.append(
                f"{display_path}: Einreichungs-Overlay {regime_id} enthält Fristdefinitionen"
            )
        for field, available in (
            ("filingProfileId", filings),
            ("calendarProfileId", calendars),
            ("suspensionProfileId", suspensions),
        ):
            value = regime[field]
            if value is not None and value not in available:
                errors.append(
                    f"{display_path}: Regime {regime_id} mit unbekanntem {field}={value}"
                )
        for definition_id in definition_ids:
            definition = definitions.get(definition_id)
            if definition is None:
                continue
            if definition["status"] != regime["status"]:
                errors.append(
                    f"{display_path}: Status von Regime {regime_id} und Definition "
                    f"{definition_id} widersprechen sich"
                )
            if definition["filingProfileId"] != regime["filingProfileId"]:
                errors.append(
                    f"{display_path}: Einreichungsprofil von Regime {regime_id} und "
                    f"Definition {definition_id} widersprechen sich"
                )
            if definition["deadlineOrigin"] == "CALCULATED":
                policy = definition["resultPolicy"]
                if policy["calendarProfileId"] != regime["calendarProfileId"]:
                    errors.append(
                        f"{display_path}: Kalenderprofil von Regime {regime_id} und "
                        f"Definition {definition_id} widersprechen sich"
                    )
                if policy["suspensionProfileId"] != regime["suspensionProfileId"]:
                    errors.append(
                        f"{display_path}: Stillstandsprofil von Regime {regime_id} und "
                        f"Definition {definition_id} widersprechen sich"
                    )
            elif regime["uiExposure"] != "hidden":
                errors.append(
                    f"{display_path}: behördlich gesetztes Regime {regime_id} "
                    "muss im Rechen-GUI verborgen bleiben"
                )
            if set(definition["gateIds"]) != set(regime["gateIds"]):
                errors.append(
                    f"{display_path}: Gates von Regime {regime_id} und Definition "
                    f"{definition_id} widersprechen sich"
                )
            if set(definition["legalOverrideIds"]) != set(regime["legalOverrideIds"]):
                errors.append(
                    f"{display_path}: Overrides von Regime {regime_id} und Definition "
                    f"{definition_id} widersprechen sich"
                )

    for override_id, override in overrides.items():
        for regime_id in override["targetRegimeIds"]:
            regime = regimes.get(regime_id)
            if regime is None:
                errors.append(
                    f"{display_path}: Override {override_id} mit unbekanntem Ziel {regime_id}"
                )
            elif override_id not in regime["legalOverrideIds"]:
                errors.append(
                    f"{display_path}: Override {override_id} ohne Rückverweis von {regime_id}"
                )

    actual_origins = {
        origin: sum(
            definition["deadlineOrigin"] == origin
            for definition in definitions.values()
        )
        for origin in ("CALCULATED", "AUTHORITATIVE")
    }
    if actual_origins != {"CALCULATED": 26, "AUTHORITATIVE": 3}:
        errors.append(
            f"{display_path}: unerwartete Herkunftsverteilung {actual_origins}"
        )
    return requested_suspensions, len(definitions), len(regimes)


def validate_release(release_directory: Path) -> dict[str, int]:
    errors: list[str] = []
    schemas, registry = load_schema_registry()
    manifest_path = release_directory / "manifest.json"
    manifest = load_json(manifest_path)
    errors.extend(
        validate_against_schema(
            manifest,
            schemas["release-manifest.schema.json"],
            registry,
            str(manifest_path.relative_to(REPOSITORY_ROOT))
            if manifest_path.is_relative_to(REPOSITORY_ROOT)
            else str(manifest_path),
        )
    )
    if errors:
        raise ReleaseValidationError(errors)

    if release_directory.name != manifest["releaseId"]:
        errors.append("manifest.json: Release-ID stimmt nicht mit dem Verzeichnisnamen überein")

    artifact_paths = [artifact["path"] for artifact in manifest["artifacts"]]
    artifact_ids = [artifact["contentId"] for artifact in manifest["artifacts"]]
    if len(artifact_paths) != len(set(artifact_paths)):
        errors.append("manifest.json: doppelte Artefaktpfade")
    if len(artifact_ids) != len(set(artifact_ids)):
        errors.append("manifest.json: doppelte Artefakt-IDs")

    listed_files = set(artifact_paths)
    actual_files = {
        path.relative_to(release_directory).as_posix()
        for path in release_directory.rglob("*.json")
        if path.name != "manifest.json"
    }
    if listed_files != actual_files:
        missing = sorted(actual_files - listed_files)
        surplus = sorted(listed_files - actual_files)
        if missing:
            errors.append(f"manifest.json: nicht gelistete JSON-Dateien {missing}")
        if surplus:
            errors.append(f"manifest.json: gelistete Dateien fehlen {surplus}")

    profiles: dict[str, dict[str, Any]] = {}
    calendars: dict[str, dict[str, Any]] = {}
    special_catalogs: dict[str, dict[str, Any]] = {}
    requested_suspension_ids: set[str] = set()
    requested_calendar_ids: set[str] = set()
    all_rule_ids: set[str] = set()
    all_calendar_rule_ids: set[str] = set()
    calendar_override_targets: set[str] = set()
    calendar_applicable_profiles: set[str] = set()
    calendar_defined_suspension_ids: set[str] = set()
    all_sources: dict[str, dict[str, Any]] = {}

    for artifact in manifest["artifacts"]:
        pure_path = PurePosixPath(artifact["path"])
        if pure_path.is_absolute() or ".." in pure_path.parts or "." in pure_path.parts:
            errors.append(f"manifest.json: unsicherer Artefaktpfad {artifact['path']}")
            continue
        artifact_path = release_directory / Path(*pure_path.parts)
        if not artifact_path.is_file():
            continue
        actual_size = artifact_path.stat().st_size
        actual_hash = sha256(artifact_path)
        if actual_size != artifact["byteLength"]:
            errors.append(
                f"{artifact['path']}: Dateigrösse {actual_size} statt "
                f"{artifact['byteLength']}"
            )
        if actual_hash != artifact["sha256"]:
            errors.append(
                f"{artifact['path']}: Prüfsumme stimmt nicht mit dem Manifest überein"
            )

        document = load_json(artifact_path)
        if document.get("$schema") != artifact["schemaId"]:
            errors.append(f"{artifact['path']}: Schema-ID widerspricht dem Manifest")
        expected_schema_file = {
            "legalProfile": "legal-profile.schema.json",
            "calendar": (
                "calendar-rules-v2.schema.json"
                if manifest["formatVersion"] == "3.0.0"
                else "calendar.schema.json"
            ),
            "specialRegimeCatalog": "special-regime-catalog-v2.schema.json",
        }[artifact["role"]]
        document_schema_errors = validate_against_schema(
            document,
            schemas[expected_schema_file],
            registry,
            artifact["path"],
        )
        errors.extend(document_schema_errors)
        if document_schema_errors:
            continue
        if document.get("dataKind") != artifact["role"]:
            errors.append(f"{artifact['path']}: Datenart widerspricht der Manifestrolle")

        document_id_field = {
            "legalProfile": "profileId",
            "calendar": "calendarId",
            "specialRegimeCatalog": "catalogId",
        }[artifact["role"]]
        if document.get(document_id_field) != artifact["contentId"]:
            errors.append(f"{artifact['path']}: Inhalts-ID widerspricht dem Manifest")

        for source in document.get("sources", []):
            source_id = source["sourceId"]
            if source_id in all_sources and all_sources[source_id] != source:
                errors.append(f"Quelle {source_id}: widersprüchliche Metadaten im Release")
            all_sources[source_id] = source

        if artifact["role"] == "legalProfile":
            profiles[document["profileId"]] = document
            suspension_ids, calendar_ids = check_profile(
                document,
                artifact["path"],
                errors,
            )
            requested_suspension_ids.update(suspension_ids)
            requested_calendar_ids.update(calendar_ids)
            for rule in document["rules"]:
                rule_id = rule["ruleId"]
                if rule_id in all_rule_ids:
                    errors.append(f"Release: doppelte Regel-ID {rule_id}")
                all_rule_ids.add(rule_id)
        elif artifact["role"] == "calendar":
            calendars[document["calendarId"]] = document
            if manifest["formatVersion"] == "3.0.0":
                suspension_ids, applicable_profiles, override_targets = (
                    check_calendar_rules(document, artifact["path"], errors)
                )
                calendar_defined_suspension_ids.update(suspension_ids)
                calendar_applicable_profiles.update(applicable_profiles)
                calendar_override_targets.update(override_targets)
                for rule in document["rules"]:
                    rule_id = rule["ruleId"]
                    if rule_id in all_calendar_rule_ids:
                        errors.append(f"Release: doppelte Kalenderregel-ID {rule_id}")
                    all_calendar_rule_ids.add(rule_id)
            else:
                check_calendar(document, artifact["path"], errors)
        else:
            special_catalogs[document["catalogId"]] = document

    if set(manifest["profileIds"]) != set(profiles):
        errors.append("manifest.json: Profil-IDs stimmen nicht mit den Artefakten überein")
    if set(manifest["calendarIds"]) != set(calendars):
        errors.append("manifest.json: Kalender-IDs stimmen nicht mit den Artefakten überein")
    if set(manifest.get("specialRegimeCatalogIds", [])) != set(special_catalogs):
        errors.append(
            "manifest.json: Spezialregimekatalog-IDs stimmen nicht mit den "
            "Artefakten überein"
        )
    if set(manifest["sourceSummary"]["sourceIds"]) != set(all_sources):
        errors.append("manifest.json: Quellenübersicht ist nicht vollständig oder enthält Überhang")
    if all_sources:
        latest_source_review = max(
            source["reviewedOn"] for source in all_sources.values()
        )
        if (
            manifest["sourceSummary"]["latestReviewedOn"]
            != latest_source_review
        ):
            errors.append(
                "manifest.json: jüngstes Quellenprüfdatum stimmt nicht mit den "
                "Artefakten überein"
            )

    unknown_override_targets = calendar_override_targets - all_calendar_rule_ids
    if unknown_override_targets:
        errors.append(
            "Release: Kalender-Overrideziele fehlen "
            f"{sorted(unknown_override_targets)}"
        )
        for source_id, source in all_sources.items():
            if source["reviewedOn"] > manifest["createdOn"]:
                errors.append(
                    f"Quelle {source_id}: Prüfdatum liegt nach dem Releasedatum"
                )
            document_version_date = source["documentVersionDate"]
            if (
                document_version_date is not None
                and document_version_date > source["reviewedOn"]
            ):
                errors.append(
                    f"Quelle {source_id}: Dokumentstand liegt nach dem Prüfdatum"
                )

    release_coverage = manifest["coverage"]
    if release_coverage["to"] is not None:
        check_date_order(
            release_coverage["from"],
            release_coverage["to"],
            "manifest.json: Release-Abdeckung",
            errors,
        )
    for profile_id, profile in profiles.items():
        valid_to = profile["validity"]["dataValidTo"]
        if manifest["formatVersion"] == "1.0.0":
            if profile["validity"]["dataValidFrom"] > release_coverage["from"]:
                errors.append(f"Profil {profile_id}: beginnt nach der Release-Abdeckung")
            if valid_to is not None and valid_to < release_coverage["to"]:
                errors.append(f"Profil {profile_id}: endet vor der Release-Abdeckung")
        elif manifest["formatVersion"] == "2.0.0":
            if profile["validity"]["dataValidFrom"] > release_coverage["to"]:
                errors.append(f"Profil {profile_id}: beginnt nach dem Release-Zeithorizont")
            if valid_to is not None and valid_to < release_coverage["from"]:
                errors.append(f"Profil {profile_id}: endet vor dem Release-Zeithorizont")
        elif valid_to is not None and valid_to < release_coverage["from"]:
            errors.append(f"Profil {profile_id}: endet vor Beginn der offenen Release-Abdeckung")
    for calendar_id, calendar in calendars.items():
        if manifest["formatVersion"] == "3.0.0":
            validity = calendar["validity"]
            if validity["from"] > release_coverage["from"]:
                errors.append(f"Kalender {calendar_id}: beginnt nach der Release-Abdeckung")
            if validity["to"] is not None:
                errors.append(f"Kalender {calendar_id}: besitzt keine offene Gültigkeit")
        else:
            if calendar["coverage"]["from"] > release_coverage["from"]:
                errors.append(f"Kalender {calendar_id}: beginnt nach der Release-Abdeckung")
            if calendar["coverage"]["to"] < release_coverage["to"]:
                errors.append(f"Kalender {calendar_id}: endet vor der Release-Abdeckung")

    check_inheritance(calendars, errors)
    special_definition_count = 0
    special_regime_count = 0
    for catalog_id, catalog in special_catalogs.items():
        requested, definition_count, regime_count = check_special_catalog(
            catalog,
            f"Spezialregimekatalog {catalog_id}",
            set(profiles),
            set(calendars),
            errors,
        )
        requested_suspension_ids.update(requested)
        special_definition_count += definition_count
        special_regime_count += regime_count
    available_suspension_ids = (
        calendar_defined_suspension_ids
        if manifest["formatVersion"] == "3.0.0"
        else {
            suspension_set["suspensionSetId"]
            for calendar in calendars.values()
            for suspension_set in calendar["suspensionSets"]
        }
    )
    missing_suspensions = requested_suspension_ids - available_suspension_ids
    if missing_suspensions:
        errors.append(
            f"Release: referenzierte Stillstandssätze fehlen {sorted(missing_suspensions)}"
        )
    missing_calendars = requested_calendar_ids - set(calendars)
    if missing_calendars:
        errors.append(
            f"Release: referenzierte Kalender fehlen {sorted(missing_calendars)}"
        )
    if manifest["formatVersion"] == "3.0.0":
        unknown_profiles = calendar_applicable_profiles - set(profiles)
        if unknown_profiles:
            errors.append(
                "Kalenderregeln verwenden unbekannte Profile "
                f"{sorted(unknown_profiles)}"
            )
    else:
        for calendar in calendars.values():
            for suspension_set in calendar["suspensionSets"]:
                unknown_profiles = (
                    set(suspension_set["applicableProfileIds"]) - set(profiles)
                )
                if unknown_profiles:
                    errors.append(
                        f"Stillstandssatz {suspension_set['suspensionSetId']}: "
                        f"unbekannte Profile {sorted(unknown_profiles)}"
                    )

    if errors:
        raise ReleaseValidationError(errors)
    return {
        "profiles": len(profiles),
        "rules": len(all_rule_ids),
        "calendarRules": len(all_calendar_rule_ids),
        "calendars": len(calendars),
        "holidays": sum(len(calendar.get("holidays", [])) for calendar in calendars.values()),
        "suspensionPeriods": sum(
            len(suspension_set["periods"])
            for calendar in calendars.values()
            for suspension_set in calendar.get("suspensionSets", [])
        ),
        "sources": len(all_sources),
        "artifacts": len(manifest["artifacts"]),
        "specialCatalogs": len(special_catalogs),
        "specialDefinitions": special_definition_count,
        "specialRegimes": special_regime_count,
    }


def rewrite_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def refresh_artifact_metadata(release_directory: Path, relative_path: str) -> None:
    artifact_path = release_directory / relative_path
    manifest_path = release_directory / "manifest.json"
    manifest = load_json(manifest_path)
    artifact = next(
        item for item in manifest["artifacts"] if item["path"] == relative_path
    )
    artifact["byteLength"] = artifact_path.stat().st_size
    artifact["sha256"] = sha256(artifact_path)
    rewrite_json(manifest_path, manifest)


def run_negative_self_tests(release_directory: Path) -> list[str]:
    tests: list[tuple[str, str, Callable[[Path], None]]] = []

    def corrupt_checksum(test_directory: Path) -> None:
        path = test_directory / "profiles" / "stpo.json"
        path.write_bytes(path.read_bytes() + b"\n")

    tests.append(("Prüfsummenfehler", "Prüfsumme stimmt nicht", corrupt_checksum))

    def duplicate_rule(test_directory: Path) -> None:
        path = test_directory / "profiles" / "stpo.json"
        data = load_json(path)
        data["rules"].append(copy.deepcopy(data["rules"][0]))
        rewrite_json(path, data)
        refresh_artifact_metadata(test_directory, "profiles/stpo.json")

    tests.append(("doppelte Regel", "doppelte Regel-ID", duplicate_rule))

    def unresolved_source(test_directory: Path) -> None:
        path = test_directory / "profiles" / "stpo.json"
        data = load_json(path)
        data["rules"][0]["sourceRefs"][0]["sourceId"] = "SRC-NOT-AVAILABLE"
        rewrite_json(path, data)
        refresh_artifact_metadata(test_directory, "profiles/stpo.json")

    tests.append(("unaufgelöste Quelle", "nicht lokal aufgelöst", unresolved_source))

    def unknown_rule_type(test_directory: Path) -> None:
        path = test_directory / "profiles" / "stpo.json"
        data = load_json(path)
        data["rules"][0]["effect"]["type"] = "mysteryRule"
        rewrite_json(path, data)
        refresh_artifact_metadata(test_directory, "profiles/stpo.json")

    tests.append(("unbekannte Regelart", "Schemafehler", unknown_rule_type))

    def reversed_period(test_directory: Path) -> None:
        path = test_directory / "calendars" / "ch-federal-calendar.json"
        data = load_json(path)
        if data["formatVersion"] == "2.0.0":
            rule = next(
                item for item in data["rules"]
                if item["effect"]["type"] == "suspensionPeriod"
            )
            rule["validity"] = {"from": "2027-01-01", "to": "2026-12-31"}
        else:
            period = data["suspensionSets"][0]["periods"][0]
            period["startsOn"] = "2026-01-03"
            period["endsOn"] = "2026-01-02"
        rewrite_json(path, data)
        refresh_artifact_metadata(test_directory, "calendars/ch-federal-calendar.json")

    tests.append(("verkehrte Periode", "liegt nach Ende", reversed_period))

    def missing_inheritance(test_directory: Path) -> None:
        path = test_directory / "calendars" / "be-public-holidays.json"
        data = load_json(path)
        data["inherits"] = ["not-available"]
        rewrite_json(path, data)
        refresh_artifact_metadata(test_directory, "calendars/be-public-holidays.json")

    tests.append(("unbekannte Vererbung", "unbekannter geerbter Kalender", missing_inheritance))

    special_catalog_path = release_directory / "special-regimes" / "vrpg-be.json"
    if special_catalog_path.is_file():
        def removed_r5_type(test_directory: Path) -> None:
            path = test_directory / "special-regimes" / "vrpg-be.json"
            data = load_json(path)
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
            rewrite_json(path, data)
            refresh_artifact_metadata(test_directory, "special-regimes/vrpg-be.json")

        tests.append(("entfernte Rechenart R5", "Schemafehler", removed_r5_type))

        def visible_authoritative_deadline(test_directory: Path) -> None:
            path = test_directory / "special-regimes" / "vrpg-be.json"
            data = load_json(path)
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
            rewrite_json(path, data)
            refresh_artifact_metadata(test_directory, "special-regimes/vrpg-be.json")

        tests.append(
            (
                "sichtbarer Behörden-Termin",
                "muss im Rechen-GUI verborgen bleiben",
                visible_authoritative_deadline,
            )
        )

        def special_component_mismatch(test_directory: Path) -> None:
            path = test_directory / "special-regimes" / "vrpg-be.json"
            data = load_json(path)
            regime = next(
                item
                for item in data["regimes"]
                if item["status"] == "supported"
                and item["deadlineDefinitionIds"]
            )
            regime["filingProfileId"] = "F2_RECEIPT"
            rewrite_json(path, data)
            refresh_artifact_metadata(test_directory, "special-regimes/vrpg-be.json")

        tests.append(
            (
                "widersprüchliches Einreichungsprofil",
                "Einreichungsprofil von Regime",
                special_component_mismatch,
            )
        )

    passed: list[str] = []
    for test_name, expected_text, mutator in tests:
        with tempfile.TemporaryDirectory(prefix="fristenrechner-ap5-") as temp_name:
            test_directory = Path(temp_name) / release_directory.name
            shutil.copytree(release_directory, test_directory)
            mutator(test_directory)
            try:
                validate_release(test_directory)
            except ReleaseValidationError as error:
                if expected_text not in str(error):
                    raise AssertionError(
                        f"Negativtest {test_name} meldete nicht den erwarteten Fehler "
                        f"{expected_text!r}:\n{error}"
                    ) from error
                passed.append(test_name)
            else:
                raise AssertionError(
                    f"Negativtest {test_name} wurde fälschlich akzeptiert"
                )
    return passed


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validiert ein Regel- und Kalenderdatenrelease."
    )
    parser.add_argument(
        "release_directory",
        type=Path,
        help="Verzeichnis mit manifest.json",
    )
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="führt zusätzlich erwartete Negativtests in temporären Kopien aus",
    )
    return parser.parse_args()


def main() -> int:
    arguments = parse_arguments()
    release_directory = arguments.release_directory.resolve()
    try:
        summary = validate_release(release_directory)
        print(
            "VALID: "
            + ", ".join(f"{key}={value}" for key, value in summary.items())
        )
        if arguments.self_test:
            passed = run_negative_self_tests(release_directory)
            print("NEGATIVE TESTS: " + ", ".join(passed))
    except (ReleaseValidationError, AssertionError) as error:
        print(f"INVALID:\n{error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
