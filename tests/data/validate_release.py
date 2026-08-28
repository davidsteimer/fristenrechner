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
    requested_suspension_ids: set[str] = set()
    requested_calendar_ids: set[str] = set()
    all_rule_ids: set[str] = set()
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
            "calendar": "calendar.schema.json",
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

        document_id_field = (
            "profileId" if artifact["role"] == "legalProfile" else "calendarId"
        )
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
        else:
            calendars[document["calendarId"]] = document
            check_calendar(document, artifact["path"], errors)

    if set(manifest["profileIds"]) != set(profiles):
        errors.append("manifest.json: Profil-IDs stimmen nicht mit den Artefakten überein")
    if set(manifest["calendarIds"]) != set(calendars):
        errors.append("manifest.json: Kalender-IDs stimmen nicht mit den Artefakten überein")
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
    check_date_order(
        release_coverage["from"],
        release_coverage["to"],
        "manifest.json: Release-Abdeckung",
        errors,
    )
    for profile_id, profile in profiles.items():
        valid_to = profile["validity"]["dataValidTo"]
        if profile["validity"]["dataValidFrom"] > release_coverage["from"]:
            errors.append(f"Profil {profile_id}: beginnt nach der Release-Abdeckung")
        if valid_to is not None and valid_to < release_coverage["to"]:
            errors.append(f"Profil {profile_id}: endet vor der Release-Abdeckung")
    for calendar_id, calendar in calendars.items():
        if calendar["coverage"]["from"] > release_coverage["from"]:
            errors.append(f"Kalender {calendar_id}: beginnt nach der Release-Abdeckung")
        if calendar["coverage"]["to"] < release_coverage["to"]:
            errors.append(f"Kalender {calendar_id}: endet vor der Release-Abdeckung")

    check_inheritance(calendars, errors)
    available_suspension_ids = {
        suspension_set["suspensionSetId"]
        for calendar in calendars.values()
        for suspension_set in calendar["suspensionSets"]
    }
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
        "calendars": len(calendars),
        "holidays": sum(len(calendar["holidays"]) for calendar in calendars.values()),
        "suspensionPeriods": sum(
            len(suspension_set["periods"])
            for calendar in calendars.values()
            for suspension_set in calendar["suspensionSets"]
        ),
        "sources": len(all_sources),
        "artifacts": len(manifest["artifacts"]),
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
        help="führt zusätzlich sechs erwartete Negativtests in temporären Kopien aus",
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
