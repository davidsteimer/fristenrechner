#!/usr/bin/env python3
"""Prüft ausschliesslich den lokalen AP17B-Referenzvertrag, nicht die Produktintegration.

Standardbibliothek, keine Imports aus src oder aus dem bisherigen Golden-Case-Orakel.
Die Datumsarithmetik verwendet den freigegebenen expandierten Feiertagsbestand.
Juristische Anwendbarkeit und Quelleninhalt bleiben Gegenstand der Fachabnahme.
"""

from __future__ import annotations

import copy
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CORPUS = ROOT / "tests/golden/candidates/ap17b-anwendbarkeit.json"
CALENDARS = ROOT / "data/releases/2026-08-31-mvp-02-approved.1/calendars"
ONE_DAY = timedelta(days=1)
REASONS = {
    "unknownMapping", "mappingBlocked", "unsupportedAuthority", "matterMismatch", "triggerKindMismatch",
    "unsupportedDeadlineForm", "notificationUnconfirmed", "holidayAnchorUnconfirmed",
    "unsupportedHolidayCanton", "procedureStartMissing", "procedureStartInvalid",
    "procurementLegacyProcedure", "procedureStartAfterTrigger", "triggerDateInvalid",
    "deadlineDaysInvalid", "unexpectedDeadlineDays",
}
RESULT_FIELDS = {
    "status", "calendarStart", "firstCountedDay", "rawEnd", "finalEnd",
    "suspensionDays", "rollDays",
}
# Geplanter Mindestbestand des AP17B-Vertrags, zusätzlich zur fachlichen Abdeckung.
REQUIRED_CASE_IDS = {f"AP17B-P{number:02d}" for number in range(1, 29)} | {
    f"AP17B-N{number:02d}" for number in range(1, 33)
}
AREA_LAWS = {"social": {"ivg", "ahvg", "uvg"}, "procurement": {"ivob"}}


class InvalidCandidate(ValueError):
    """Ein Referenzvertrag ist strukturell oder arithmetisch inkonsistent."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise InvalidCandidate(message)


def integer(value: Any) -> bool:
    return type(value) is int


def iso(value: Any) -> date | None:
    if not isinstance(value, str) or re.fullmatch(r"\d{4}-\d{2}-\d{2}", value) is None:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def index(items: Any, kind: str) -> dict[str, dict[str, Any]]:
    require(isinstance(items, list) and len(items) > 0, f"{kind}: leere/ungültige Liste")
    result = {}
    for item in items:
        require(isinstance(item, dict), f"{kind}: Eintrag ist kein Objekt")
        key = item.get("id")
        require(isinstance(key, str) and bool(key.strip()), f"{kind}: ID fehlt")
        require(key not in result, f"{kind}: doppelte ID {key}")
        result[key] = item
    return result


def reference_ids(item: dict[str, Any], sources: dict[str, Any]) -> None:
    refs = item.get("sourceIds")
    require(isinstance(refs, list) and bool(refs), f"{item['id']}: Quellenbezug fehlt")
    require(all(isinstance(ref, str) and ref in sources for ref in refs),
            f"{item['id']}: unbekannte Quellen-ID")
    require(len(set(refs)) == len(refs), f"{item['id']}: doppelte Quellen-ID")


def load_calendar() -> tuple[set[date], dict[int, date]]:
    holidays = set()
    easter = {}
    for name in ("be-public-holidays.json", "ch-federal-calendar.json"):
        document = json.loads((CALENDARS / name).read_text(encoding="utf-8"))
        for item in document["holidays"]:
            day = iso(item["date"])
            require(day is not None, "Referenzkalender: ungültiges Datum")
            holidays.add(day)
            if item["labelKey"] == "holiday.be.easter":
                easter[day.year] = day
    require(set(easter) >= {2026, 2027}, "Osterreferenz 2026/2027 fehlt")
    return holidays, easter


def suspension_periods(easter: dict[int, date]) -> list[tuple[date, date]]:
    periods = []
    for year in (2025, 2026, 2027, 2028):
        periods.append((date(year, 12, 18), date(year + 1, 1, 2)))
        periods.append((date(year, 7, 15), date(year, 8, 15)))
        if year in easter:
            periods.append((easter[year] - 7 * ONE_DAY, easter[year] + 7 * ONE_DAY))
    return periods


def blocked(reason: str) -> dict[str, str]:
    require(reason in REASONS, f"Unbekannter Sperrgrund im Validator: {reason}")
    return {"status": "blocked", "reason": reason}


def evaluate(
    case: dict[str, Any], mappings: dict[str, Any], profiles: dict[str, Any],
    holidays: set[date], periods: list[tuple[date, date]],
) -> dict[str, Any]:
    """Explizite Kandidatenzuordnung, danach vollständig getrennte Arithmetik."""
    mapping = mappings.get(case.get("mappingId"))
    if mapping is None:
        return blocked("unknownMapping")
    if mapping["disposition"] == "blocked":
        return blocked("mappingBlocked")
    inputs = case["input"]
    if inputs.get("authorityCode") != "BE":
        return blocked("unsupportedAuthority")
    if inputs.get("matter") != mapping["requiredContext"]["matter"]:
        return blocked("matterMismatch")
    if inputs.get("triggerKind") != mapping["requiredContext"]["triggerKind"]:
        return blocked("triggerKindMismatch")
    if inputs.get("deadlineForm") != "days":
        return blocked("unsupportedDeadlineForm")
    if inputs.get("notificationConfirmed") is not True:
        return blocked("notificationUnconfirmed")
    profile = profiles[mapping["profileId"]]
    if profile["holidayPolicy"] == "partyOrRepresentative":
        if inputs.get("holidayAnchorConfirmed") is not True:
            return blocked("holidayAnchorUnconfirmed")
        if inputs.get("holidayCanton") != "BE":
            return blocked("unsupportedHolidayCanton")
    elif inputs.get("holidayCanton") != "BE":
        return blocked("unsupportedHolidayCanton")
    trigger = iso(inputs.get("legalTriggerDate"))
    procurement_start = None
    if mapping["selection"]["area"] == "procurement":
        if "procedureStartDate" not in inputs or inputs["procedureStartDate"] in (None, ""):
            return blocked("procedureStartMissing")
        procurement_start = iso(inputs["procedureStartDate"])
        if procurement_start is None:
            return blocked("procedureStartInvalid")
        if procurement_start < date(2022, 2, 1):
            return blocked("procurementLegacyProcedure")
        if trigger is not None and procurement_start > trigger:
            return blocked("procedureStartAfterTrigger")
    if trigger is None:
        return blocked("triggerDateInvalid")
    duration = profile["duration"]
    if duration["mode"] == "fixed":
        if "days" in inputs:
            return blocked("unexpectedDeadlineDays")
        days = duration["days"]
    else:
        days = inputs.get("days")
        if not integer(days) or not duration["min"] <= days <= duration["max"]:
            return blocked("deadlineDaysInvalid")

    applicable = periods if profile["suspension"] == "atsg" else []
    cursor = trigger
    counted = 0
    skipped = 0
    first_counted = None
    while counted < days:
        cursor += ONE_DAY
        if any(start <= cursor <= end for start, end in applicable):
            skipped += 1
        else:
            counted += 1
            first_counted = first_counted or cursor
    raw = cursor
    while cursor.weekday() >= 5 or cursor in holidays:
        cursor += ONE_DAY

    # Zweite Rechnung mit Intervallschnitten, unabhängig von der Zählschleife.
    def cumulative(day: date) -> int:
        deductions = sum(
            max(0, (min(day, end) - max(trigger + ONE_DAY, start)).days + 1)
            for start, end in applicable
        )
        return (day - trigger).days - deductions

    require(cumulative(raw) == days and cumulative(raw - ONE_DAY) == days - 1,
            f"{case['id']}: unabhängige Intervallnachrechnung weicht ab")
    return {
        "status": "calculateAfterApproval",
        "calendarStart": str(trigger + ONE_DAY),
        "firstCountedDay": str(first_counted),
        "rawEnd": str(raw),
        "finalEnd": str(cursor),
        "suspensionDays": skipped,
        "rollDays": (cursor - raw).days,
    }


def validate(document: dict[str, Any]) -> dict[str, int]:
    require(document.get("formatVersion") == "ap17b-reference-1", "Unbekanntes Referenzformat")
    require(document.get("status") == "draft", "Kandidat muss draft bleiben")
    require("approvedBy" in document and document["approvedBy"] is None, "Keine Fachfreigabe zulässig")
    require(document.get("runtimeActivation") is False, "Keine Laufzeitaktivierung zulässig")
    require(iso(document.get("reviewedAsOf")) is not None, "reviewedAsOf fehlt/ungültig")
    require(document.get("coverageFrom") == "2026-01-01" and
            document.get("coverageTo") == "2027-12-31", "Abweichendes AP17B-Testprojektionsfenster")
    sources = index(document.get("sources"), "Quellen")
    profiles = index(document.get("calculationProfiles"), "Rechenprofile")
    mappings = index(document.get("mappings"), "Zuordnungen")
    cases = index(document.get("referenceCases"), "Referenzfälle")
    require(REQUIRED_CASE_IDS <= cases.keys(),
            f"Geplante Referenzfälle fehlen: {sorted(REQUIRED_CASE_IDS - cases.keys())}")
    for source in sources.values():
        url = source.get("url")
        require(isinstance(url, str) and urlparse(url).scheme == "https" and
                bool(urlparse(url).hostname), f"{source['id']}: gültige HTTPS-Quelle fehlt")
        require(isinstance(source.get("version"), str) and bool(source["version"].strip()),
                f"{source['id']}: Quellenstand fehlt")
    for profile in profiles.values():
        reference_ids(profile, sources)
        require(profile.get("suspension") in ("atsg", "none"), f"{profile['id']}: Stillstand unbekannt")
        require(profile.get("holidayPolicy") in ("partyOrRepresentative", "bern"),
                f"{profile['id']}: Feiertagsanknüpfung unbekannt")
        duration = profile.get("duration")
        require(isinstance(duration, dict), f"{profile['id']}: Fristdauer fehlt")
        if duration.get("mode") == "fixed":
            require(set(duration) == {"mode", "days"} and integer(duration["days"]) and
                    1 <= duration["days"] <= 365, f"{profile['id']}: feste Fristdauer ungültig")
        elif duration.get("mode") == "input":
            require(set(duration) == {"mode", "min", "max"} and integer(duration["min"]) and
                    integer(duration["max"]) and 1 <= duration["min"] <= duration["max"] <= 365,
                    f"{profile['id']}: Eingabefrist ungültig")
        else:
            raise InvalidCandidate(f"{profile['id']}: unbekannter Fristmodus")
    selection_keys = set()
    for mapping in mappings.values():
        reference_ids(mapping, sources)
        require(mapping.get("disposition") in ("candidate", "blocked"),
                f"{mapping['id']}: unbekannter Zuordnungsstatus")
        if mapping["disposition"] == "blocked":
            require("profileId" in mapping and mapping["profileId"] is None,
                    f"{mapping['id']}: Sperre verlangt ausdrücklich profileId null")
        else:
            require(mapping.get("profileId") in profiles, f"{mapping['id']}: Profil unbekannt")
        selection = mapping.get("selection")
        require(isinstance(selection, dict) and set(selection) == {"area", "law", "action", "stage"},
                f"{mapping['id']}: Auswahlvertrag unvollständig")
        require(all(isinstance(selection[key], str) for key in selection),
                f"{mapping['id']}: Auswahlwerte müssen Zeichenketten sein")
        require(selection["area"] in AREA_LAWS and
                selection["law"] in AREA_LAWS[selection["area"]],
                f"{mapping['id']}: unbekanntes Bereich-/Erlass-Paar")
        key = tuple(selection[field] for field in ("area", "law", "action", "stage"))
        require(key not in selection_keys, f"{mapping['id']}: widersprüchliche/doppelte Auswahlzuordnung")
        selection_keys.add(key)
        context = mapping.get("requiredContext")
        require(isinstance(context, dict) and isinstance(context.get("matter"), str) and
                bool(context["matter"]) and isinstance(context.get("triggerKind"), str) and
                bool(context["triggerKind"]) and context.get("deadlineForm") == "days",
                f"{mapping['id']}: erforderlicher Kontext fehlt")
    holidays, easter = load_calendar()
    periods = suspension_periods(easter)
    positive_mappings = set()
    reasons = set()
    positive_count = 0
    for case in cases.values():
        require(isinstance(case.get("input"), dict), f"{case['id']}: Eingaben fehlen")
        require(isinstance(case.get("rationale"), str) and bool(case["rationale"].strip()),
                f"{case['id']}: Begründung fehlt")
        expected = case.get("expected")
        require(isinstance(expected, dict), f"{case['id']}: Erwartung fehlt")
        if expected.get("status") == "blocked":
            require(set(expected) == {"status", "reason"} and expected["reason"] in REASONS,
                    f"{case['id']}: Sperrfall darf keine Ergebnisfelder enthalten")
            reasons.add(expected["reason"])
        else:
            require(expected.get("status") == "calculateAfterApproval" and set(expected) == RESULT_FIELDS,
                    f"{case['id']}: unbekannter/unvollständiger Ergebnisstatus")
            require(integer(expected["suspensionDays"]) and integer(expected["rollDays"]),
                    f"{case['id']}: Ergebniszähler müssen Ganzzahlen sein")
            for field in ("calendarStart", "firstCountedDay", "rawEnd", "finalEnd"):
                require(iso(expected[field]) is not None, f"{case['id']}: ungültiges {field}")
            trigger = iso(case["input"].get("legalTriggerDate"))
            require(trigger is not None and date(2026, 1, 1) <= trigger <= date(2027, 12, 31) and
                    iso(expected["finalEnd"]) <= date(2027, 12, 31),
                    f"{case['id']}: positiver Fall ausserhalb des Testprojektionsfensters")
            positive_mappings.add(case.get("mappingId"))
            positive_count += 1
        actual = evaluate(case, mappings, profiles, holidays, periods)
        require(actual == expected, f"{case['id']}: erwartet {expected}, nachgerechnet {actual}")
    candidates = {key for key, mapping in mappings.items() if mapping["disposition"] == "candidate"}
    require(candidates <= positive_mappings,
            f"Positive Referenz fehlt für {sorted(candidates - positive_mappings)}")
    require(REASONS <= reasons, f"Sperrgrundabdeckung fehlt: {sorted(REASONS - reasons)}")
    return {"cases": len(cases), "positive": positive_count, "blocked": len(cases) - positive_count,
            "candidateMappings": len(candidates), "blockedMappings": len(mappings) - len(candidates),
            "blockedReasons": len(reasons)}


def self_tests(document: dict[str, Any]) -> int:
    """Mutationen müssen durch die Prüfung abgewiesen werden, nicht stillschweigend bestehen."""
    count = 0

    def rejects(label: str, mutate: Any) -> None:
        nonlocal count
        changed = copy.deepcopy(document)
        mutate(changed)
        try:
            validate(changed)
        except InvalidCandidate:
            count += 1
        else:
            raise InvalidCandidate(f"Negativselbsttest nicht abgewiesen: {label}")

    def first_positive(doc: dict[str, Any]) -> dict[str, Any]:
        return next(case for case in doc["referenceCases"] if case["expected"]["status"] == "calculateAfterApproval")

    def remove_mapping_cases(doc: dict[str, Any]) -> None:
        mapping_id = first_positive(doc)["mappingId"]
        doc["referenceCases"] = [case for case in doc["referenceCases"] if case["mappingId"] != mapping_id]

    def duplicate_selection(doc: dict[str, Any]) -> None:
        duplicate = copy.deepcopy(doc["mappings"][0])
        duplicate["id"] += "-CONFLICT"
        doc["mappings"].append(duplicate)

    def flip_suspension(doc: dict[str, Any]) -> None:
        case = next(case for case in doc["referenceCases"] if case["expected"].get("suspensionDays", 0) > 0)
        mapping = next(mapping for mapping in doc["mappings"] if mapping["id"] == case["mappingId"])
        profile = next(profile for profile in doc["calculationProfiles"] if profile["id"] == mapping["profileId"])
        profile["suspension"] = "none"

    def change_duration(doc: dict[str, Any]) -> None:
        profile = next(profile for profile in doc["calculationProfiles"] if profile["duration"]["mode"] == "fixed")
        profile["duration"]["days"] += 1

    rejects("wrongEnd", lambda doc: first_positive(doc)["expected"].update(finalEnd="2026-01-01"))
    rejects("unknownSource", lambda doc: doc["calculationProfiles"][0]["sourceIds"].append("UNKNOWN"))
    rejects("missingMappingCase", remove_mapping_cases)
    rejects("prematureApproval", lambda doc: doc.update(approvedBy="not-authorised"))
    rejects("runtimeActivation", lambda doc: doc.update(runtimeActivation=True))
    rejects("durationDrift", change_duration)
    rejects("suspensionDrift", flip_suspension)
    rejects("conflictingSelection", duplicate_selection)
    rejects("unknownSuspension", lambda doc: doc["calculationProfiles"][0].update(suspension="unknown"))
    rejects("unknownStatus", lambda doc: doc["mappings"][0].update(disposition="supported"))
    rejects("unknownHolidayPolicy", lambda doc: doc["calculationProfiles"][0].update(holidayPolicy="automatic"))
    rejects("unknownDurationMode", lambda doc: doc["calculationProfiles"][0]["duration"].update(mode="unknown"))
    rejects("blockedResultLeak", lambda doc: next(case for case in doc["referenceCases"] if
            case["expected"]["status"] == "blocked")["expected"].update(finalEnd="2026-10-16"))
    rejects("unknownArea", lambda doc: doc["mappings"][0]["selection"].update(area="unknown"))
    rejects("unknownLaw", lambda doc: doc["mappings"][0]["selection"].update(law="unknown"))
    rejects("missingSingleReference", lambda doc: doc.update(referenceCases=[case for case in
            doc["referenceCases"] if case["id"] != "AP17B-P09"]))
    rejects("missingExplicitBlockedProfile", lambda doc: next(mapping for mapping in doc["mappings"] if
            mapping["disposition"] == "blocked").pop("profileId"))
    return count


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CORPUS
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
        results = validate(document)
        mutations = self_tests(document)
    except (OSError, json.JSONDecodeError, InvalidCandidate, KeyError, TypeError, StopIteration) as error:
        print(f"INVALID AP17B CANDIDATE: {error}", file=sys.stderr)
        return 1
    print("VALID AP17B CANDIDATE: " + ", ".join(f"{key}={value}" for key, value in results.items()))
    print(f"NEGATIVE SELF-TESTS: {mutations} mutations rejected")
    print("DRAFT ONLY: no legal approval, no runtime activation, no production-core import")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
