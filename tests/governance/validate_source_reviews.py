#!/usr/bin/env python3
"""Validiert Quellenregister, append-only-Prüfereignisse und Suchindex von AP13."""

from __future__ import annotations

import argparse
import copy
import json
import sys
from collections.abc import Iterable
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
SCHEMA_DIRECTORY = REPOSITORY_ROOT / "schemas"
REVIEW_DIRECTORY = REPOSITORY_ROOT / "data" / "source-reviews"
REGISTER_PATH = REVIEW_DIRECTORY / "source-register.json"
EVENT_DIRECTORY = REVIEW_DIRECTORY / "events"
INDEX_PATH = REVIEW_DIRECTORY / "index.json"
SCHEMA_NAMES = (
    "common.schema.json",
    "source-register.schema.json",
    "source-review-event.schema.json",
    "source-review-index.schema.json",
)
OFFICIAL_HOSTS = {
    "fedlex.admin.ch",
    "www.fedlex.admin.ch",
    "bj.admin.ch",
    "www.bj.admin.ch",
    "belex.sites.be.ch",
    "www.belex.sites.be.ch",
    "rrgr-service.apps.be.ch",
    "www.rrgr-service.apps.be.ch",
    "search.bger.ch",
    "bger.ch",
    "www.bger.ch",
}
IDENTIFIER_KEYS = (
    "ruleId",
    "deadlineDefinitionId",
    "filingProfileId",
    "regimeId",
    "suspensionSetId",
)


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def sorted_unique(values: Iterable[str]) -> list[str]:
    return sorted(set(values))


def load_schemas() -> tuple[dict[str, dict[str, Any]], Registry]:
    schemas = {name: load_json(SCHEMA_DIRECTORY / name) for name in SCHEMA_NAMES}
    for name, schema in schemas.items():
        Draft202012Validator.check_schema(schema)
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


def duplicate_values(items: Iterable[dict[str, Any]], key: str) -> set[str]:
    seen: set[str] = set()
    duplicates: set[str] = set()
    for item in items:
        value = item.get(key)
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    return duplicates


def release_usage(release_id: str) -> tuple[set[str], dict[str, dict[str, set[str]]]]:
    release_directory = REPOSITORY_ROOT / "data" / "releases" / release_id
    manifest_path = release_directory / "manifest.json"
    if not manifest_path.exists():
        raise ValueError(f"Datenrelease nicht gefunden: {release_id}")
    manifest = load_json(manifest_path)
    if manifest.get("releaseId") != release_id:
        raise ValueError(f"{release_id}: Manifest-ID stimmt nicht mit dem Ordner überein")

    usage: dict[str, dict[str, set[str]]] = {}

    def add_reference(source_id: str, context: dict[str, str], locator: str) -> None:
        record = usage.setdefault(
            source_id,
            {
                "profileIds": set(),
                "calendarIds": set(),
                "componentIds": set(),
                "locators": set(),
            },
        )
        if context.get("profileId"):
            record["profileIds"].add(context["profileId"])
        if context.get("calendarId"):
            record["calendarIds"].add(context["calendarId"])
        for key in IDENTIFIER_KEYS:
            if context.get(key):
                record["componentIds"].add(context[key])
        if locator:
            record["locators"].add(locator)

    def walk(node: Any, inherited: dict[str, str] | None = None) -> None:
        context = dict(inherited or {})
        if isinstance(node, list):
            for value in node:
                walk(value, context)
            return
        if not isinstance(node, dict):
            return
        for key in ("profileId", "calendarId", *IDENTIFIER_KEYS):
            if isinstance(node.get(key), str):
                context[key] = node[key]
        if isinstance(node.get("sourceRefs"), list):
            for reference in node["sourceRefs"]:
                add_reference(
                    reference["sourceId"],
                    context,
                    reference.get("locator", ""),
                )
        for value in node.values():
            walk(value, context)

    for artifact in manifest["artifacts"]:
        walk(load_json(release_directory / artifact["path"]))
    return set(manifest["sourceSummary"]["sourceIds"]), usage


def resolve_affected(entry: dict[str, Any]) -> dict[str, list[str]]:
    affected = {
        "releaseIds": list(entry["affected"]["releaseIds"]),
        "profileIds": list(entry["affected"]["profileIds"]),
        "calendarIds": list(entry["affected"]["calendarIds"]),
        "componentIds": list(entry["affected"]["componentIds"]),
        "locators": [],
    }
    if entry["affected"]["resolutionMode"] == "allReferencesInRelease":
        for release_id in entry["affected"]["releaseIds"]:
            _, usage = release_usage(release_id)
            record = usage.get(entry["sourceId"])
            if record is None:
                raise ValueError(
                    f"{entry['sourceId']}: keine Referenz im Datenrelease {release_id} gefunden"
                )
            for key in ("profileIds", "calendarIds", "componentIds", "locators"):
                affected[key].extend(record[key])
    return {key: sorted_unique(values) for key, values in affected.items()}


def expected_index(
    register: dict[str, Any], events: list[dict[str, Any]]
) -> dict[str, Any]:
    latest_event = max(events, key=lambda event: (event["recordedOn"], event["reviewEventId"]))
    sources = []
    for source in sorted(register["sources"], key=lambda item: item["sourceId"]):
        candidates = [
            (event, entry)
            for event in events
            for entry in event["entries"]
            if entry["sourceId"] == source["sourceId"]
        ]
        if not candidates:
            raise ValueError(f"Quelle ohne Prüfereignis: {source['sourceId']}")
        event, entry = max(
            candidates,
            key=lambda item: (item[1]["reviewedOn"], item[0]["reviewEventId"]),
        )
        sources.append(
            {
                "sourceId": source["sourceId"],
                "usageStatus": source["usageStatus"],
                "jurisdiction": source["jurisdiction"],
                "subjectAreas": sorted(source["subjectAreas"]),
                "latestReview": {
                    "reviewEventId": event["reviewEventId"],
                    "recordStatus": event["recordStatus"],
                    "reviewedOn": entry["reviewedOn"],
                    "outcome": entry["outcome"],
                    "finding": entry["evidence"]["finding"],
                    "followUp": entry["followUp"]["required"],
                },
                "affected": resolve_affected(entry),
            }
        )
    return {
        "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/source-review-index.schema.json",
        "formatVersion": "1.0.0",
        "dataKind": "sourceReviewIndex",
        "generatedOn": latest_event["recordedOn"],
        "generatedFrom": {
            "sourceRegister": "source-register.json",
            "eventDirectory": "events",
            "eventIds": sorted(event["reviewEventId"] for event in events),
        },
        "nextAnnualReviewDue": latest_event["nextAnnualReviewDue"],
        "sources": sources,
    }


def semantic_errors(
    register: dict[str, Any],
    events: list[dict[str, Any]],
    index: dict[str, Any],
) -> list[str]:
    errors: list[str] = []
    source_duplicates = duplicate_values(register["sources"], "sourceId")
    for source_id in sorted(source_duplicates):
        errors.append(f"Quellenregister: doppelte sourceId {source_id}")

    sources_by_id = {source["sourceId"]: source for source in register["sources"]}
    productive_ids = {
        source["sourceId"]
        for source in register["sources"]
        if source["usageStatus"] == "productive"
    }
    for source in register["sources"]:
        official_url = source["officialUrl"]
        if official_url:
            host = (urlparse(official_url).hostname or "").lower()
            if host not in OFFICIAL_HOSTS:
                errors.append(
                    f"{source['sourceId']}: officialUrl verweist nicht auf eine zugelassene amtliche Domain"
                )
        elif not (source["sourceType"] == "caseLaw" and source["jurisdiction"] == "BE"):
            errors.append(
                f"{source['sourceId']}: fehlende amtliche URL ist nur bei bernischer Rechtsprechung zulässig"
            )

    event_duplicates = duplicate_values(events, "reviewEventId")
    for event_id in sorted(event_duplicates):
        errors.append(f"Prüfprotokoll: doppelte reviewEventId {event_id}")

    initial_events = [event for event in events if event["trigger"] == "initialConsolidation"]
    if len(initial_events) != 1:
        errors.append("Prüfprotokoll: genau eine initialConsolidation ist erforderlich")

    for event in events:
        if event["reviewWindow"]["from"] > event["reviewWindow"]["to"]:
            errors.append(f"{event['reviewEventId']}: ungültiges Prüfzeitfenster")
        if event["nextAnnualReviewDue"][5:] != "11-15":
            errors.append(
                f"{event['reviewEventId']}: nächste Jahresprüfung muss auf den 15. November terminiert sein"
            )
        entry_duplicates = duplicate_values(event["entries"], "sourceId")
        for source_id in sorted(entry_duplicates):
            errors.append(f"{event['reviewEventId']}: doppelte sourceId {source_id}")
        for entry in event["entries"]:
            source_id = entry["sourceId"]
            if source_id not in sources_by_id:
                errors.append(f"{event['reviewEventId']}: nicht registrierte Quelle {source_id}")
            if not (
                event["reviewWindow"]["from"]
                <= entry["reviewedOn"]
                <= event["reviewWindow"]["to"]
            ):
                errors.append(
                    f"{event['reviewEventId']}/{source_id}: Prüfdatum liegt ausserhalb des Prüfzeitfensters"
                )
            if entry["outcome"] != "unchanged" and not entry["followUp"]["required"]:
                errors.append(
                    f"{event['reviewEventId']}/{source_id}: {entry['outcome']} benötigt eine Folgemassnahme"
                )
            if entry["outcome"] == "unchanged" and any(
                reference["kind"] == "dataRelease"
                for reference in entry["followUp"]["references"]
            ):
                errors.append(
                    f"{event['reviewEventId']}/{source_id}: unverändert darf keinen Datenrelease auslösen"
                )
            if entry["affected"]["resolutionMode"] == "allReferencesInRelease":
                for release_id in entry["affected"]["releaseIds"]:
                    try:
                        release_sources, _ = release_usage(release_id)
                    except ValueError as error:
                        errors.append(str(error))
                        continue
                    if source_id not in release_sources:
                        errors.append(
                            f"{event['reviewEventId']}/{source_id}: Quelle fehlt im Datenrelease {release_id}"
                        )

    if initial_events:
        initial_ids = {entry["sourceId"] for entry in initial_events[0]["entries"]}
        missing_initial = set(sources_by_id) - initial_ids
        for source_id in sorted(missing_initial):
            errors.append(f"Initialprüfung: Quelle fehlt {source_id}")

        compared_release_ids = initial_events[0]["comparedReleaseIds"]
        compared_productive_ids: set[str] = set()
        for release_id in compared_release_ids:
            try:
                release_sources, _ = release_usage(release_id)
                compared_productive_ids.update(release_sources)
            except ValueError as error:
                errors.append(str(error))
        for source_id in sorted(compared_productive_ids - productive_ids):
            errors.append(f"Quellenregister: produktive Quelle fehlt {source_id}")
        for source_id in sorted(productive_ids - compared_productive_ids):
            errors.append(
                f"Quellenregister: als produktiv markierte Quelle ist im Vergleichsrelease nicht enthalten {source_id}"
            )

    try:
        expected = expected_index(register, events)
        if index != expected:
            errors.append("Quellenprüfindex: nicht reproduzierbar oder veraltet")
    except ValueError as error:
        errors.append(str(error))

    return sorted(set(errors))


def validate_documents(
    register: dict[str, Any],
    events: list[dict[str, Any]],
    index: dict[str, Any],
) -> list[str]:
    schemas, registry = load_schemas()
    errors = schema_errors(
        register,
        schemas["source-register.schema.json"],
        registry,
        "source-register.json",
    )
    for event in events:
        errors.extend(
            schema_errors(
                event,
                schemas["source-review-event.schema.json"],
                registry,
                event["reviewEventId"],
            )
        )
    errors.extend(
        schema_errors(
            index,
            schemas["source-review-index.schema.json"],
            registry,
            "index.json",
        )
    )
    errors.extend(semantic_errors(register, events, index))
    return sorted(set(errors))


def assert_rejected(
    label: str,
    register: dict[str, Any],
    events: list[dict[str, Any]],
    index: dict[str, Any],
    expected_fragment: str,
) -> None:
    errors = validate_documents(register, events, index)
    if not any(expected_fragment in error for error in errors):
        raise AssertionError(
            f"Negativtest {label} wurde nicht wie erwartet abgewiesen: {errors}"
        )


def run_self_tests(
    register: dict[str, Any],
    events: list[dict[str, Any]],
    index: dict[str, Any],
) -> None:
    mutated_register = copy.deepcopy(register)
    mutated_register["sources"].append(copy.deepcopy(mutated_register["sources"][0]))
    assert_rejected(
        "doppelte Quelle",
        mutated_register,
        events,
        index,
        "doppelte sourceId",
    )

    mutated_register = copy.deepcopy(register)
    mutated_register["sources"][0]["officialUrl"] = "https://example.org/not-official"
    assert_rejected(
        "nichtamtliche URL",
        mutated_register,
        events,
        index,
        "officialUrl verweist nicht",
    )

    mutated_events = copy.deepcopy(events)
    mutated_events[0]["entries"] = mutated_events[0]["entries"][1:]
    assert_rejected(
        "unvollständige Initialprüfung",
        register,
        mutated_events,
        index,
        "Initialprüfung: Quelle fehlt",
    )

    mutated_events = copy.deepcopy(events)
    entry = mutated_events[0]["entries"][0]
    entry["outcome"] = "changed"
    entry["followUp"] = {"required": False, "references": []}
    assert_rejected(
        "Änderung ohne Folgemassnahme",
        register,
        mutated_events,
        index,
        "benötigt eine Folgemassnahme",
    )

    mutated_events = copy.deepcopy(events)
    entry = mutated_events[0]["entries"][0]
    entry["followUp"] = {
        "required": True,
        "references": [
            {
                "kind": "dataRelease",
                "id": "unzulässig",
                "url": None,
                "status": "implemented",
            }
        ],
    }
    assert_rejected(
        "Datenrelease trotz unverändert",
        register,
        mutated_events,
        index,
        "unverändert darf keinen Datenrelease auslösen",
    )

    mutated_events = copy.deepcopy(events)
    mutated_events[0]["nextAnnualReviewDue"] = "2027-12-01"
    assert_rejected(
        "falscher Jahresprüftermin",
        register,
        mutated_events,
        index,
        "15. November",
    )

    mutated_index = copy.deepcopy(index)
    mutated_index["sources"][0]["latestReview"]["finding"] = "veraltet"
    assert_rejected(
        "veralteter Index",
        register,
        events,
        mutated_index,
        "nicht reproduzierbar oder veraltet",
    )

    mutated_events = copy.deepcopy(events)
    mutated_events[0]["entries"][0]["outcome"] = "unknown"
    assert_rejected(
        "unbekanntes Ergebnis",
        register,
        mutated_events,
        index,
        "Schemafehler",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="führt zusätzlich gezielte Negativtests aus",
    )
    arguments = parser.parse_args()

    register = load_json(REGISTER_PATH)
    event_paths = sorted(EVENT_DIRECTORY.glob("*.json"))
    events = [load_json(path) for path in event_paths]
    index = load_json(INDEX_PATH)

    filename_errors = [
        f"{path.name}: Dateiname und reviewEventId stimmen nicht überein"
        for path, event in zip(event_paths, events, strict=True)
        if path.name != f"{event['reviewEventId']}.json"
    ]
    errors = filename_errors + validate_documents(register, events, index)
    if errors:
        print("AP13-Quellenprüfung ungültig:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    if arguments.self_test:
        run_self_tests(register, events, index)

    productive_count = sum(
        source["usageStatus"] == "productive" for source in register["sources"]
    )
    print(
        f"AP13-Quellenprüfung gültig: {len(register['sources'])} Quellen, "
        f"davon {productive_count} produktiv, {len(events)} Ereignis(sen), "
        f"4 Ergebnisarten und 8 Negativtests."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
