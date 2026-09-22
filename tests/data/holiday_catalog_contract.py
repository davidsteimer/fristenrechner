"""Independent AP18C catalogue checks, deliberately not calling the TS validator.

Schema checks run first. Catalogue sources are separate from the operational
sourceSummary and do not acquire a verified procedural status through this check.
"""

from __future__ import annotations

import hashlib
import json
from datetime import date, timedelta
from typing import Any
from urllib.parse import urlsplit


# Canonical JSON of the twelve unchanged approved MVP-0.3 holiday rule objects,
# sorted by ruleId, with sorted object keys. This is not a hash of the new input.
APPROVED_PROJECTION_SHA256 = "577173f7061291255e4ec26db4881b8fd93799e011353e4b7c2231f30cc8c61e"
APPROVED_COURT_RULES_SHA256 = "329b77ebf9e4cb860f3927ce32775b67d031f460f257788eb2228ff06a5b3947"
BASELINE = "2026-08-31-mvp-03-approved.1"
CANTONS = {f"CH-{code}" for code in
           "ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU".split()}
APPROVED_IDS = {
    "CH-CAL-HOL-NATIONAL-DAY",
    "BE-CAL-HOL-NEW-YEAR", "BE-CAL-HOL-BERCHTOLD-DAY",
    "BE-CAL-HOL-GOOD-FRIDAY", "BE-CAL-HOL-EASTER", "BE-CAL-HOL-EASTER-MONDAY",
    "BE-CAL-HOL-ASCENSION", "BE-CAL-HOL-PENTECOST", "BE-CAL-HOL-WHIT-MONDAY",
    "BE-CAL-HOL-FEDERAL-FAST", "BE-CAL-HOL-CHRISTMAS", "BE-CAL-HOL-ST-STEPHEN",
}


def easter(year: int) -> date:
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    q = h + l - 7 * m + 114
    return date(year, q // 31, q % 31 + 1)


def holiday_date(rule: dict[str, Any], year: int) -> tuple[str, str | None]:
    """Return status and final date, checking validity after the conditional shift."""
    calculation = rule["calculation"]
    kind = calculation["type"]
    if kind == "fixedMonthDay":
        raw = date(year, calculation["month"], calculation["day"])
    elif kind == "easterOffsetDays":
        raw = easter(year) + timedelta(days=calculation["offsetDays"])
    elif kind in {"nthWeekdayOfMonth", "nthWeekdayOffsetDays"}:
        first = date(year, calculation["month"], 1)
        raw = first + timedelta(days=(calculation["isoWeekday"] - first.isoweekday()) % 7
                                + 7 * (calculation["occurrence"] - 1))
        if raw.month != calculation["month"]:
            raise ValueError("Wochentag liegt ausserhalb des Monats")
        if kind == "nthWeekdayOffsetDays":
            raw += timedelta(days=calculation["offsetDays"])
    else:
        raise ValueError(f"unbekannter Rechentyp {kind}")
    condition = rule["condition"]
    if condition == "unlessTuesdayOrSaturday" and raw.isoweekday() in {2, 6}:
        return "notApplicable", None
    if condition == "onlyMonday" and raw.isoweekday() != 1:
        return "notApplicable", None
    if condition == "shiftHolyThursdayBy7Days" and raw == easter(year) - timedelta(days=3):
        raw += timedelta(days=7)
    iso = raw.isoformat()
    if iso < rule["from"] or (rule["to"] is not None and iso > rule["to"]):
        return "outsideValidity", None
    return "occurs", iso


def check_holiday_catalog(
    catalog: dict[str, Any],
    calendars: dict[str, dict[str, Any]],
    label: str,
    errors: list[str],
) -> None:
    data = catalog["data"]
    indexed: dict[str, dict[str, Any]] = {}
    for table, rows in data.items():
        ids = [row["id"] for row in rows]
        if len(ids) != len(set(ids)):
            errors.append(f"{label}: doppelte IDs in {table}")
        indexed[table] = {row["id"]: row for row in rows}

    def reference(table: str, identifier: str | None, context: str) -> None:
        if identifier is not None and identifier not in indexed[table]:
            errors.append(f"{label}: {context} nicht aufgelöst: {identifier}")

    def validity(row: dict[str, Any]) -> None:
        if row.get("to") is not None and row["from"] > row["to"]:
            errors.append(f"{label}: Gültigkeit liegt nach Ende: {row['id']}")

    def encloses(outer: dict[str, Any], inner: dict[str, Any]) -> bool:
        return (outer["from"] <= inner["from"] and (outer["to"] is None
                or inner["to"] is not None and outer["to"] >= inner["to"]))

    def url(value: str, identifier: str) -> None:
        try:
            parts = urlsplit(value)
            if parts.scheme != "https" or not parts.hostname or parts.username or parts.password:
                raise ValueError("HTTPS ohne Zugangsdaten erforderlich")
            # Accessing port also rejects invalid numeric port serialization.
            _ = parts.port
        except ValueError:
            errors.append(f"{label}: ungültige Quellen-URL {identifier}")

    if set(indexed["jurisdictions"]) != {"CH", *CANTONS}:
        errors.append(f"{label}: Bund und genau 26 Kantone erforderlich")

    for row in data["jurisdictions"]:
        reference("jurisdictions", row["parentId"], f"Elterngemeinwesen {row['id']}")
        if row["parentId"] != (None if row["id"] == "CH" else "CH"):
            errors.append(f"{label}: widersprüchliche Gemeinwesenhierarchie {row['id']}")
        if row["status"] == "approved" and row["id"] not in {"CH", "CH-BE"}:
            errors.append(f"{label}: unzulässige historische Gemeinwesenfreigabe {row['id']}")
        url(row["sourceUrl"], row["id"])
    for row in data["scopes"]:
        reference("jurisdictions", row["jurisdiction"], f"Gemeinwesen {row['id']}")
        reference("sources", row["source"], f"Geltungsbereichsquelle {row['id']}")
        source = indexed["sources"].get(row["source"])
        if source and source["jurisdiction"] != row["jurisdiction"]:
            errors.append(f"{label}: kantonsfremde Geltungsquelle {row['id']}")
        if row["status"] == "approved" and row["id"] not in {"CH-ALL", "BE-ALL"}:
            errors.append(f"{label}: unzulässige historische Geltungsfreigabe {row['id']}")
        validity(row)
    for row in data["sources"]:
        reference("jurisdictions", row["jurisdiction"], f"Quellengemeinwesen {row['id']}")
        if row["status"] == "approved":
            if row["approvalBasis"] != BASELINE or row["id"] not in {
                    "SRC-BUNDESFEIERTAG-19940701", "SRC-FRG-BE-20210401"}:
                errors.append(f"{label}: unzulässige historische Quellenfreigabe {row['id']}")
        elif row["approvalBasis"] is not None:
            errors.append(f"{label}: Quellenfreigabe ohne Grundlage {row['id']}")
        url(row["url"], row["id"])

    # A territorial identity has one definition, even when assigned in several
    # periods or scopes. Assignment validity does not create inherited holidays.
    areas: dict[str, dict[str, Any]] = {}
    definition_keys = ("de", "fr", "it", "rm", "areaType", "parentAreaId", "officialIdSystem", "officialId")
    for row in data["assignments"]:
        prior = areas.get(row["areaId"])
        if prior and any(prior[key] != row[key] for key in definition_keys):
            errors.append(f"{label}: widersprüchliche Gebietsdefinition {row['areaId']}")
        areas[row["areaId"]] = row
    levels = {"Bund": {None}, "Kanton": {"Bund"}, "Bezirk": {"Kanton"},
              "Gemeinde": {"Kanton", "Bezirk"}, "Ortsteil": {"Gemeinde"},
              "Gebietsgruppe": {"Kanton", "Bezirk"}}

    def ancestry(area_id: str) -> list[str]:
        seen: list[str] = []
        current: str | None = area_id
        while current is not None:
            if current in seen:
                errors.append(f"{label}: zyklische Gebietshierarchie {area_id}")
                break
            row = areas.get(current)
            if row is None:
                errors.append(f"{label}: unbekanntes Elterngebiet {current}")
                break
            seen.append(current)
            current = row["parentAreaId"]
        return seen

    chains = {key: ancestry(key) for key in areas}
    for area_id, row in areas.items():
        parent = areas.get(row["parentAreaId"])
        parent_type = parent["areaType"] if parent else None
        if parent_type not in levels[row["areaType"]]:
            errors.append(f"{label}: ungültige Gebietsebene {area_id}")
        if row["areaType"] == "Bund" and area_id != "GEO-CH":
            errors.append(f"{label}: unbekanntes Bundesgebiet {area_id}")
        if row["areaType"] == "Kanton" and f"CH-{area_id[4:]}" not in CANTONS:
            errors.append(f"{label}: unbekanntes Kantonsgebiet {area_id}")
    for row in data["assignments"]:
        reference("scopes", row["scopeId"], f"Gebietszuordnung {row['id']}")
        reference("sources", row["sourceId"], f"Gebietsquelle {row['id']}")
        validity(row)
        scope = indexed["scopes"].get(row["scopeId"])
        source = indexed["sources"].get(row["sourceId"])
        if scope:
            if source and source["jurisdiction"] != scope["jurisdiction"]:
                errors.append(f"{label}: kantonsfremde Gebietsquelle {row['id']}")
            if not encloses(scope, row):
                errors.append(f"{label}: Gebietszuordnung überschreitet Geltungsbereich {row['id']}")
            top = next((areas[key] for key in chains[row["areaId"]]
                        if areas[key]["areaType"] in {"Bund", "Kanton"}), None)
            if top and scope["jurisdiction"] != (
                    "CH" if top["areaId"] == "GEO-CH" else f"CH-{top['areaId'][4:]}"):
                errors.append(f"{label}: kantonsfremde Gebietszuordnung {row['id']}")
        if row["effect"] == "exclude" and not any(
                other["scopeId"] == row["scopeId"] and other["effect"] == "include"
                and other["areaId"] in chains[row["areaId"]] and encloses(other, row)
                for other in data["assignments"]):
            errors.append(f"{label}: Ausschluss ohne zeitlich vollständigen Einschluss {row['id']}")
    for index, left in enumerate(data["assignments"]):
        for right in data["assignments"][index + 1:]:
            if (left["scopeId"] == right["scopeId"] and left["areaId"] == right["areaId"]
                    and left["from"] <= (right["to"] or "9999-12-31")
                    and right["from"] <= (left["to"] or "9999-12-31")):
                errors.append(f"{label}: überlappende Gebietszuordnungen {left['id']}/{right['id']}")
    for scope in data["scopes"]:
        if not any(row["scopeId"] == scope["id"] and row["effect"] == "include"
                   for row in data["assignments"]):
            errors.append(f"{label}: Geltungsbereich ohne Einschluss {scope['id']}")
    for row in data["mappings"]:
        reference("scopes", row["scope"], f"Verfahrensbezug {row['id']}")
        if row["status"] == "approved":
            if row["scope"] not in {"CH-ALL", "BE-ALL"} or row["approvalBasis"] != BASELINE:
                errors.append(f"{label}: unzulässige historische Verfahrensfreigabe {row['id']}")
        elif row["approvalBasis"] is not None:
            errors.append(f"{label}: Verfahrensfreigabe ohne Grundlage {row['id']}")
    for row in data["reviews"]:
        reference("sources", row["source"], f"Quellenprüfung {row['id']}")
    linked: set[str] = set()
    for row in catalog["areaSourceLinks"]:
        reference("assignments", row["assignmentId"], "Quellenverknüpfung")
        reference("scopes", row["scopeId"], "Quellenverknüpfungsgebiet")
        reference("sources", row["normSourceId"], "Normquelle")
        reference("sources", row["areaSourceId"], "Gebietsbeleg")
        if row["assignmentId"] in linked:
            errors.append(f"{label}: doppelter Gebietsquellenbeleg {row['assignmentId']}")
        linked.add(row["assignmentId"])
        assignment = indexed["assignments"].get(row["assignmentId"])
        scope = indexed["scopes"].get(row["scopeId"])
        if assignment and scope and (
                assignment["scopeId"] != row["scopeId"] or assignment["sourceId"] != row["areaSourceId"]
                or scope["source"] != row["normSourceId"] or row["normSourceId"] == row["areaSourceId"]
                or any(row[key] != assignment[key] for key in ("locator", "note", "provenance"))):
            errors.append(f"{label}: widersprüchlicher Gebietsquellenbeleg {row['assignmentId']}")
    for row in data["assignments"]:
        scope = indexed["scopes"].get(row["scopeId"])
        if scope and (scope["source"] != row["sourceId"]) != (row["id"] in linked):
            errors.append(f"{label}: fehlender oder unnötiger Gebietsquellenbeleg {row['id']}")

    for rule in data["rules"]:
        reference("jurisdictions", rule["jurisdiction"], f"Regelgemeinwesen {rule['id']}")
        reference("scopes", rule["scope"], f"Regelgebiet {rule['id']}")
        reference("sources", rule["source"], f"Regelquelle {rule['id']}")
        reference("rules", rule["target"], f"Zielregel {rule['id']}")
        validity(rule)
        scope = indexed["scopes"].get(rule["scope"])
        source = indexed["sources"].get(rule["source"])
        if scope and scope["jurisdiction"] != rule["jurisdiction"]:
            errors.append(f"{label}: kantonsfremde Regelgeltung {rule['id']}")
        if source and source["jurisdiction"] not in {rule["jurisdiction"], "CH"}:
            errors.append(f"{label}: kantonsfremde Regelquelle {rule['id']}")
        if scope and not encloses(scope, rule):
            errors.append(f"{label}: Regelgültigkeit überschreitet Geltungsbereich {rule['id']}")
        if rule["status"] == "approved":
            if (rule["approvalBasis"] != BASELINE or rule["exportClass"] != "referenceOnly"
                    or rule["id"] not in APPROVED_IDS or rule["category"] != "publicHoliday"
                    or rule["dayPortion"] != "fullDay" or rule["condition"] != "always"):
                errors.append(f"{label}: unzulässige historische Regelfreigabe {rule['id']}")
        elif rule["approvalBasis"] is not None or rule["exportClass"] == "referenceOnly":
            errors.append(f"{label}: Regelfreigabe ohne Grundlage {rule['id']}")
        if rule["dayPortion"] != "fullDay" and rule["exportClass"] != "blockedEffect":
            errors.append(f"{label}: Halbtag darf keine Fristwirkung erhalten {rule['id']}")
        calculation = rule["calculation"]
        condition = rule["condition"]
        anchored = (
            condition == "always"
            or condition == "unlessTuesdayOrSaturday" and calculation == {
                "type": "fixedMonthDay", "month": 12, "day": 26}
            or condition == "onlyMonday" and calculation in [
                {"type": "fixedMonthDay", "month": 1, "day": 2},
                {"type": "fixedMonthDay", "month": 12, "day": 26}]
            or condition == "shiftHolyThursdayBy7Days" and calculation == {
                "type": "nthWeekdayOfMonth", "month": 4, "isoWeekday": 4, "occurrence": 1}
        )
        if not anchored:
            errors.append(f"{label}: unzulässiger Bedingungsanker {rule['id']}")
        if condition != "always" and (rule["dayPortion"] != "fullDay"
                or rule["status"] == "approved" or rule["exportClass"] != "blockedEffect"
                or rule["approvalBasis"] is not None):
            errors.append(f"{label}: bedingte Katalogregel ohne ausdrückliche operative Sperre {rule['id']}")
        for year in (2026, 2027, 2028):
            try:
                holiday_date(rule, year)
            except (ValueError, OverflowError) as error:
                errors.append(f"{label}: ungültiges Regeldatum {rule['id']}: {error}")
                break

    projections = catalog["calendarProjections"]
    if ({row["catalogRuleId"] for row in projections} != APPROVED_IDS
            or len(projections) != len(APPROVED_IDS)):
        errors.append(f"{label}: Projektion muss genau die zwölf freigegebenen Regeln enthalten")
    projected: list[dict[str, Any]] = []
    for projection in projections:
        rule = indexed["rules"].get(projection["catalogRuleId"])
        if rule is None:
            errors.append(f"{label}: Projektionsregel nicht aufgelöst")
            continue
        if (rule["category"] != "publicHoliday" or rule["dayPortion"] != "fullDay"
                or rule["condition"] != "always" or rule["action"] != "add"
                or rule["status"] != "approved" or rule["exportClass"] != "referenceOnly"
                or rule["approvalBasis"] != BASELINE):
            errors.append(f"{label}: unzulässige operative Feiertagsprojektion {rule['id']}")
        if projection["calendarId"] not in calendars:
            errors.append(f"{label}: unbekannter Projektionskalender {projection['calendarId']}")
        jurisdiction = ({"level": "federal", "code": "CH"} if rule["jurisdiction"] == "CH"
                        else {"level": "cantonal", "code": rule["jurisdiction"].removeprefix("CH-")})
        projected.append({
            "ruleId": projection["ruleId"], "calendarId": projection["calendarId"],
            "jurisdiction": jurisdiction, "labelKey": projection["labelKey"],
            "labels": {"de": rule["de"], "fr": rule["fr"]}, "priority": rule["priority"],
            "validity": {"from": rule["from"], "to": rule["to"]},
            "sourceRefs": [{"sourceId": rule["source"], "locator": rule["locator"]}],
            "calculation": rule["calculation"],
            "effect": {"type": "holiday", "kind": projection["kind"],
                       "legalEffect": projection["legalEffect"], "resultIdSuffix": projection["resultIdSuffix"]},
        })
    projected.sort(key=lambda rule: rule["ruleId"])
    actual = sorted((rule for calendar in calendars.values() for rule in calendar.get("rules", [])
                     if rule["effect"]["type"] == "holiday"), key=lambda rule: rule["ruleId"])
    if actual != projected:
        errors.append(f"{label}: operative Feiertagsregeln weichen von der Katalogprojektion ab")
    fingerprint = hashlib.sha256(json.dumps(projected, ensure_ascii=False, sort_keys=True,
                                            separators=(",", ":")).encode()).hexdigest()
    if fingerprint != APPROVED_PROJECTION_SHA256:
        errors.append(f"{label}: Projektion weicht vom freigegebenen CH-/BE-Referenzbestand ab")
    if set(calendars) != {"ch-federal-calendar", "be-public-holidays"}:
        errors.append(f"{label}: ausschliesslich die operativen Bund-/Bern-Kalender sind zulässig")
    for identifier, calendar in calendars.items():
        if calendar["formatVersion"] != "2.0.0" or calendar["dataKind"] != "calendar":
            errors.append(f"{label}: operativer Kalendervertrag 2.0.0 erforderlich")
        is_bern = identifier == "be-public-holidays"
        expected_inheritance = ["ch-federal-calendar"] if is_bern else []
        expected_jurisdiction = {"level": "cantonal", "code": "BE"} if is_bern else {"level": "federal", "code": "CH"}
        expected_validity = {"from": "2026-01-01" if is_bern else "2025-12-18", "to": None}
        if (calendar["inherits"] != expected_inheritance or calendar["jurisdiction"] != expected_jurisdiction
                or calendar["validity"] != expected_validity):
            errors.append(f"{label}: operative Vererbung, Geltung oder Gültigkeit geändert {identifier}")
        if any(rule["calendarId"] != identifier for rule in calendar["rules"]):
            errors.append(f"{label}: operative Regel im falschen Kalender {identifier}")
    court_rules = sorted((rule for calendar in calendars.values() for rule in calendar.get("rules", [])
                          if rule["effect"]["type"] != "holiday"), key=lambda rule: rule["ruleId"])
    court_fingerprint = hashlib.sha256(json.dumps(court_rules, ensure_ascii=False, sort_keys=True,
                                                  separators=(",", ":")).encode()).hexdigest()
    if court_fingerprint != APPROVED_COURT_RULES_SHA256:
        errors.append(f"{label}: Gerichtsferien geändert oder nicht freigegebene operative Zusatz-/Overrideregel")
