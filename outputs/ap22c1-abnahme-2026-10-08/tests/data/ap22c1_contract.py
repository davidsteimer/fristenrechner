"""Independent AP22C1 checks. No TypeScript calls, promotion or runtime permission.

The approved AP22B specimen is an immutable input, not a computation oracle.
Calendar dates below are independently evaluated with Python's Gregorian dates.
"""
from __future__ import annotations

import copy
import hashlib
import json
from datetime import date, timedelta
from functools import lru_cache
from pathlib import Path, PurePosixPath
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "data/releases/2026-10-01-mvp-06-approved.1"
BUNDLE = ROOT / "outputs/ap22c1-2026-10-08"
PREFIX = "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/"
SPECIMEN = ROOT / "tests/golden/candidates/ap22b-holiday-contract.json"
SPECIMEN_SHA = "572b735fdb5cdbd7a397b41f6f1cb7eb99a15db43e506d9bc8e312293ba00c0a"
MATRIX = ROOT / "outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json"
ROLE_SCHEMAS = {
    "legalProfile": "legal-profile.schema.json",
    "calendar": "calendar-rules-v3.schema.json",
    "holidayCatalog": "holiday-catalog-v2.schema.json",
    "specialRegimeCatalog": "special-regime-catalog-v3.schema.json",
    "socialProcedureCatalog": "social-procedure-catalog-v2.schema.json",
}
CANTONS = "ZH BE LU UR SZ OW NW GL ZG FR SO BS BL SH AR AI SG GR AG TG TI VD VS NE GE JU".split()


class ContractError(ValueError):
    """A schema, identity, preservation or projection invariant is broken."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def canonical(value: Any) -> bytes:
    # Preserve source insertion order to verify the row hashes specified by AP22B.
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()


@lru_cache(maxsize=None)
def schema_validator(name: str) -> Draft202012Validator:
    schemas = {read_json(p)["$id"]: read_json(p) for p in (ROOT / "schemas").glob("*.schema.json")}
    for schema_name in ("holiday-catalog-v2.schema.json", "calendar-rules-v3.schema.json",
                        "release-manifest-v7.schema.json"):
        path = ROOT / "schemas/implementation/ap22c1" / schema_name
        require(path.is_file(), f"Missing implementation schema: {schema_name}")
        value = read_json(path)
        schemas[value["$id"]] = value
    registry = Registry().with_resources((key, Resource.from_contents(value))
                                         for key, value in schemas.items())
    schema = schemas[PREFIX + name]
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())


def check_schema(name: str, value: Any) -> None:
    errors = sorted(schema_validator(name).iter_errors(value), key=lambda e: str(e.absolute_path))
    require(not errors, f"{name}: {errors[0].message if errors else ''}")


def unique(rows: list[dict], key: str, label: str) -> dict:
    indexed = {row[key]: row for row in rows}
    require(len(indexed) == len(rows), f"Duplicate {label}")
    return indexed


def validate_catalog(catalog: dict, raw: bytes) -> None:
    check_schema("holiday-catalog-v2.schema.json", catalog)
    require(json.loads(raw) == catalog, "Catalog object differs from bound full file")
    require(sha(SPECIMEN.read_bytes()) == SPECIMEN_SHA, "Frozen AP22B specimen changed")
    specimen = read_json(SPECIMEN)
    expected = copy.deepcopy(specimen)
    expected["activation"]["contractDecision"] = {
        "id": "DEC-2026-030", "status": "approved", "on": "2026-10-08"}
    require(catalog == expected, "Candidate differs from approved AP22B contract")
    a = catalog["activation"]
    for key, path in (("catalog", BASE / "holiday-catalogs/ch-holiday-catalog.json"),
                      ("matrix", MATRIX)):
        require(a["base"][key + "Sha256"] == sha(path.read_bytes()), f"Changed {key} input bytes")
        require(a["base"][key + "Path"] == str(path.relative_to(ROOT)), f"Wrong {key} input path")
    base = read_json(BASE / "holiday-catalogs/ch-holiday-catalog.json")
    for key in base:
        if key not in {"$schema", "formatVersion"}:
            require(catalog[key] == base[key], f"Archived catalog field changed: {key}")
    require(len(catalog["data"]["rules"]) == 479, "479 archived rules required")
    matrix = read_json(MATRIX)
    require(a["sourceEvidence"] == matrix["sources"], "Original source evidence changed")
    require(len(a["sourceEvidence"]) == 157, "157 original source records required")
    decisions = unique(a["matrixDecisions"], "id", "matrix decision")
    require(len(decisions) == 198, "198 provenance decisions required")
    for row in matrix["matrix"]:
        require(decisions[row["id"]]["rowSha256"] == sha(canonical(row)),
                f"Original matrix row not bound: {row['id']}")
    rules = unique(catalog["data"]["rules"], "id", "archive rule")
    supplemental = unique(a["supplementalRules"], "id", "supplemental rule")
    require(len(supplemental) == 12 and not set(rules) & set(supplemental), "Separate 12 SO rules required")
    for rule in supplemental.values():
        require(rule["scopeId"] == "SO-PROCEDURAL-ALL" and rule["dayPortion"] == "fullDay",
                "SO process rule is not an independent whole day")
        require(rule["legalValidity"] == {"from": "2015-03-01", "to": None}, "SO legal validity changed")
    projections = unique(a["projections"], "id", "projection")
    require(len(projections) == 32, "32 projection definitions required")
    unique(a["projections"], "calendarId", "projection calendar")
    for p in projections.values():
        scope_ids = set(p["scopeIds"])
        expected_ids = {r["id"] for r in rules.values() if r["scope"] in scope_ids}
        expected_ids |= {r["id"] for r in supplemental.values() if r["scopeId"] in scope_ids}
        require(set(p["ruleIds"]) == expected_ids, f"Incomplete projected rule set: {p['id']}")
        require(scope_ids == {"CH-ALL", p["baseScopeId"], *p["supplementScopeIds"]},
                f"Unbound scope in {p['id']}")
        recipe = {"jurisdiction": p["jurisdiction"], "scopeIds": p["scopeIds"], "ruleIds": p["ruleIds"]}
        require(p["id"] == "projection-" + sha(canonical(recipe))[:16], "Projection identity not deterministic")
    bindings = unique(a["procedureBindings"], "id", "procedure binding")
    require(len(bindings) == 104, "104 terminal bindings required")
    require({(b["jurisdiction"], b["profileId"]) for b in bindings.values()}
            == {(f"CH-{c}", p) for c in CANTONS for p in ("stpo", "zpo", "bgg", "vwvg")},
            "Binding jurisdiction/profile set changed")
    limited = []
    for binding in bindings.values():
        require(binding["caseCoverage"] == {"from": "2026-08-29", "to": None}, "Product coverage changed")
        for variant in binding["variants"]:
            p = projections[variant["projectionId"]]
            require(p["jurisdiction"] == binding["jurisdiction"], "Cross-canton projection")
            if variant["alternativeProjectionId"]:
                alt = projections[variant["alternativeProjectionId"]]
                require(set(alt["ruleIds"]) - set(p["ruleIds"]) == set(binding["ambiguity"]["catalogRuleIds"])
                        and set(p["ruleIds"]) <= set(alt["ruleIds"]), "January alternative changes unrelated rules")
                limited.append((binding["jurisdiction"], binding["profileId"]))
    require(set(limited) == {("CH-SH", "stpo"), ("CH-SG", "stpo"), ("CH-SG", "bgg"), ("CH-SG", "vwvg")},
            "January comparison bindings changed")
    require(a["releaseEligibility"] == {"status": "candidate", "releaseId": None, "approval": None},
            "C1 candidate must not imply release approval")


def expected_rule(catalog: dict, recipe: dict, rule_id: str) -> dict:
    """Reconstruct one normative rule independently of the TS projector."""
    prior = {r["ruleId"]: r for name in ("ch-federal-calendar", "be-public-holidays")
             for r in read_json(BASE / f"calendars/{name}.json")["rules"]}
    if rule_id in prior:
        rule = copy.deepcopy(prior[rule_id])
        rule["condition"] = "always"
        return rule
    archive = {r["id"]: r for r in catalog["data"]["rules"]}
    extra = {r["id"]: r for r in catalog["activation"]["supplementalRules"]}
    r = archive.get(rule_id) or extra[rule_id]
    code = recipe["jurisdiction"].removeprefix("CH-")
    mapped = {x["evidenceId"]: x["sourceId"] for x in catalog["activation"]["sourceIdMap"]}
    refs = ([{"sourceId": mapped[x["evidenceId"]], "locator": x["locator"]} for x in r["sourceRefs"]]
            if rule_id in extra else [{"sourceId": mapped[r["source"]], "locator": r["locator"]}])
    return {
        "ruleId": f"{code}-CAL-{rule_id}-{recipe['id'][11:].upper()}",
        "calendarId": recipe["calendarId"], "jurisdiction": {"level": "cantonal", "code": code},
        "labelKey": f"holiday.{code.lower()}.{rule_id}",
        "labels": ({k: r["labels"][k] for k in ("de", "fr")} if rule_id in extra
                   else {k: r[k] for k in ("de", "fr")}),
        "priority": r.get("priority", 100),
        "validity": r["legalValidity"] if rule_id in extra else {"from": r["from"], "to": r["to"]},
        "sourceRefs": refs, "calculation": r["calculation"], "condition": r["condition"],
        "effect": {"type": "holiday", "kind": "proceduralEquivalentDay" if r["category"] == "proceduralEquivalentDay"
                   else "cantonalPublicHoliday", "legalEffect": "nonWorkingDayEquivalentToSunday",
                   "resultIdSuffix": rule_id},
    }


def validate_calendars(catalog: dict, raw: bytes, calendars: dict[str, dict]) -> None:
    require(json.loads(raw) == catalog, "Full catalog bytes do not match supplied catalog")
    recipes = {p["calendarId"]: p for p in catalog["activation"]["projections"]}
    require(set(calendars) == set(recipes), "Missing or additional projected calendar")
    seen_rule_ids: set[str] = set()
    mapped_sources = {m["sourceId"]: m["evidenceId"] for m in catalog["activation"]["sourceIdMap"]}
    evidence = {s["id"]: s for s in catalog["activation"]["sourceEvidence"]}
    for identifier, calendar in calendars.items():
        check_schema("calendar-rules-v3.schema.json", calendar)
        p = recipes[identifier]
        require(calendar["calendarId"] == identifier, "Calendar identity mismatch")
        jurisdiction = {"level": "federal", "code": "CH"} if p["jurisdiction"] == "CH" else {
            "level": "cantonal", "code": p["jurisdiction"].removeprefix("CH-")}
        require(calendar["jurisdiction"] == jurisdiction, "Calendar jurisdiction does not match projection")
        require(calendar["review"]["status"] == "candidate", "Projected calendar cannot invent review approval")
        require(calendar["projection"] == {"catalogId": catalog["catalogId"], "catalogFormatVersion": "2.0.0",
                                            "projectionId": p["id"], "sourceHash": sha(raw)},
                "Projection must bind the full catalog bytes")
        require(calendar["inherits"] == ([] if identifier == "ch-federal-calendar" else ["ch-federal-calendar"]),
                "Unbound inheritance, cycle or missing federal parent")
        expected = [expected_rule(catalog, p, r) for r in p["ruleIds"]
                    if identifier == "ch-federal-calendar" or r != "CH-CAL-HOL-NATIONAL-DAY"]
        if identifier == "ch-federal-calendar":
            expected += [r for r in read_json(BASE / "calendars/ch-federal-calendar.json")["rules"]
                         if r["effect"]["type"] == "suspensionPeriod"]
        actual = unique(calendar["rules"], "ruleId", "calendar rule")
        require(actual == {r["ruleId"]: r for r in expected}, f"Incomplete or altered projected rules: {identifier}")
        require(not seen_rule_ids & set(actual), "Rule ID reused across calendar inventory")
        seen_rule_ids.update(actual)
        sources = unique(calendar["sources"], "sourceId", "calendar source")
        expected_source_ids = {ref["sourceId"] for r in expected for ref in r["sourceRefs"]}
        require(set(sources) == expected_source_ids, f"Missing or additional source metadata: {identifier}")
        if identifier in {"ch-federal-calendar", "be-public-holidays"}:
            base = read_json(BASE / f"calendars/{identifier}.json")
            require(sources == {s["sourceId"]: s for s in base["sources"]}, "Historic CH/BE sources changed")
            require(calendar["validity"] == base["validity"], "Historic CH/BE validity changed")
        else:
            require(calendar["validity"] == {"from": "2026-08-29", "to": None}, "New calendar coverage changed")
            for source in sources.values():
                record = evidence[mapped_sources[source["sourceId"]]]
                version = record["versionOn"]
                try:
                    version = date.fromisoformat(version).isoformat() if version else None
                except ValueError:
                    version = None
                require(source["title"] == record["title"] and source["url"] == record["url"]
                        and source["documentVersionDate"] == version, "Source metadata not bound to evidence")
                require(source["sourceType"] == "officialDossier" and source["authority"] == record["jurisdiction"]
                        and source["reviewedOn"] == record["retrievedOn"], "Source provenance metadata changed")
                require(source["reviewStatus"] == "monitored", "No new source verification may be invented")


def validate_manifest(manifest: dict, files: dict[str, bytes]) -> None:
    """Format-7 inventory fixture validation, not permission to activate a release."""
    check_schema("release-manifest-v7.schema.json", manifest)
    artifacts = manifest["artifacts"]
    unique(artifacts, "path", "artifact path")
    require(len({(a["role"], a["contentId"]) for a in artifacts}) == len(artifacts), "Duplicate role/content ID")
    require(set(files) == {a["path"] for a in artifacts}, "Manifest/file inventory mismatch")
    by_role: dict[str, set] = {role: set() for role in ROLE_SCHEMAS}
    calendar_values: dict[str, dict] = {}
    catalog_bytes = None
    for item in artifacts:
        path = PurePosixPath(item["path"])
        require(not path.is_absolute() and ".." not in path.parts and "\\" not in item["path"], "Unsafe artifact path")
        raw = files[item["path"]]
        require(sha(raw) == item["sha256"] and len(raw) == item["byteLength"], "Artifact bytes not bound")
        value = json.loads(raw)
        role = item["role"]
        key = "calendarId" if role == "calendar" else "profileId" if role == "legalProfile" else "catalogId"
        require(value[key] == item["contentId"], "Artifact content identity mismatch")
        require(item["schemaId"] == PREFIX + ROLE_SCHEMAS[role], "Artifact schema/role mismatch")
        check_schema(ROLE_SCHEMAS[role], value)
        by_role[role].add(value[key])
        if role == "calendar":
            calendar_values[value["calendarId"]] = value
        elif role == "holidayCatalog":
            catalog_bytes = raw
    for role, key in (("calendar", "calendarIds"), ("legalProfile", "profileIds"),
                      ("holidayCatalog", "holidayCatalogIds"),
                      ("specialRegimeCatalog", "specialRegimeCatalogIds"),
                      ("socialProcedureCatalog", "socialProcedureCatalogIds")):
        require(by_role[role] == set(manifest[key]), f"{role} inventory is not a bijection")
    require(catalog_bytes is not None, "Missing holiday catalog")
    validate_calendars(json.loads(catalog_bytes), catalog_bytes, calendar_values)


def easter_sunday(year: int) -> date:
    """Gregorian computus, evaluated with independent Python date arithmetic."""
    a = year % 19
    century, remainder = divmod(year, 100)
    leap_centuries, century_mod4 = divmod(century, 4)
    moon_correction = (century - (century + 8) // 25 + 1) // 3
    epact = (19 * a + century - leap_centuries - moon_correction + 15) % 30
    leap_remainder, remainder_mod4 = divmod(remainder, 4)
    weekday = (32 + 2 * century_mod4 + 2 * leap_remainder - epact - remainder_mod4) % 7
    correction = (a + 11 * epact + 22 * weekday) // 451
    month, day = divmod(epact + weekday - 7 * correction + 114, 31)
    return date(year, month, day + 1)


def holiday_date(calculation: dict, condition: str, anchor_year: int, validity: dict) -> date | None:
    """One anchor-year occurrence, with conditions and final-date legal validity."""
    require(condition in {"always", "unlessTuesdayOrSaturday", "onlyMonday", "shiftHolyThursdayBy7Days"},
            "Unknown holiday condition")
    kind = calculation["type"]
    if kind == "fixedMonthDay":
        raw = date(anchor_year, calculation["month"], calculation["day"])
    elif kind == "easterOffsetDays":
        raw = easter_sunday(anchor_year) + timedelta(days=calculation["offsetDays"])
    elif kind in {"nthWeekdayOfMonth", "nthWeekdayOffsetDays"}:
        first = date(anchor_year, calculation["month"], 1)
        raw = first + timedelta(days=(calculation["isoWeekday"] - first.isoweekday()) % 7
                                + (calculation["occurrence"] - 1) * 7)
        require(raw.month == first.month, "Requested weekday occurrence does not exist")
        if kind == "nthWeekdayOffsetDays":
            offset = calculation["offsetDays"]
            require(type(offset) is int and -366 <= offset <= 366, "Invalid weekday offset")
            raw += timedelta(days=offset)
    else:
        raise ContractError(f"Unsupported date expression: {kind}")
    if condition == "unlessTuesdayOrSaturday" and raw.isoweekday() in (2, 6):
        return None
    if condition == "onlyMonday" and raw.isoweekday() != 1:
        return None
    if condition == "shiftHolyThursdayBy7Days" and raw == easter_sunday(anchor_year) - timedelta(days=3):
        raw += timedelta(days=7)
    return raw if date.fromisoformat(validity["from"]) <= raw and (
        validity["to"] is None or raw <= date.fromisoformat(validity["to"])) else None


def holiday_dates_in_year(rule: dict, year: int) -> list[str]:
    # +/-366-day offsets may originate from adjacent anchor years. Iterate two
    # neighbours to include the leap-day edge without clipping to anchor year.
    return sorted({value.isoformat() for anchor in range(max(1, year - 2), min(9999, year + 2) + 1)
                   if (value := holiday_date(rule["calculation"], rule["condition"], anchor, rule["validity"]))
                   is not None and value.year == year})


def validate_date_probes(calendars: dict[str, dict], probes: dict) -> int:
    """Compare the complete TS-produced occurrence set against Python dates."""
    start, end = date.fromisoformat(probes["from"]), date.fromisoformat(probes["to"])
    require(start == date(2027, 1, 1) and end == date(2035, 12, 31), "Unexpected cross-language comparison window")
    expected = set()
    for identifier, calendar in calendars.items():
        rules = list(calendar["rules"])
        for parent in calendar["inherits"]:
            rules.extend(calendars[parent]["rules"])
        for rule in rules:
            if rule["effect"]["type"] != "holiday":
                continue
            for year in range(start.year, end.year + 1):
                for day in holiday_dates_in_year(rule, year):
                    if start.isoformat() <= day <= end.isoformat():
                        expected.add((identifier, rule["ruleId"], day))
    actual = {(r["calendarId"], r["ruleId"], r["date"]) for r in probes["occurrences"]}
    require(len(actual) == len(probes["occurrences"]), "Duplicate generated date trace")
    missing, extra = expected - actual, actual - expected
    require(not missing and not extra, f"TS/Python date mismatch, missing={sorted(missing)[:3]}, extra={sorted(extra)[:3]}")
    return len(expected)


def validate_social_copy(value: dict, component_bytes: dict[str, bytes]) -> None:
    check_schema("social-procedure-catalog-v2.schema.json", value)
    base = read_json(BASE / "social-procedures/ch-social-procedures.json")
    for key in base:
        if key not in {"review", "releaseEligibility"}:
            require(value[key] == base[key], f"Social subject-matter contents changed: {key}")
    require(len(value["federalRules"]) == 44 and len(value["cantonalBindings"]) == 50,
            "Social 44/50 population changed")
    expected_review = copy.deepcopy(base["review"])
    expected_review["status"] = "candidate"
    require(value["review"] == expected_review, "Social review evidence changed or falsely refreshed")
    old = unique(base["releaseEligibility"], "eligibilityId", "old social eligibility")
    current = unique(value["releaseEligibility"], "eligibilityId", "candidate social eligibility")
    require(set(current) == set(old), "Social eligibility inventory changed")
    expected_components = {
        ("calendar", "ch-federal-calendar"): sha(component_bytes["calendars/ch-federal-calendar.json"]),
        ("calendar", "be-public-holidays"): sha(component_bytes["calendars/be-public-holidays.json"]),
        ("holidayCatalog", "ch-holiday-catalog"): sha(component_bytes["holiday-catalogs/ch-holiday-catalog.json"]),
    }
    for identifier, entry in current.items():
        require(entry["releaseId"] == "2026-10-08-ap22c1-candidate.1"
                and entry["status"] == "candidate" and entry["approval"] is None,
                "Old social approval reused for candidate")
        for key in old[identifier]:
            if key not in {"releaseId", "status", "approval", "componentRefs"}:
                require(entry[key] == old[identifier][key], f"Social binding content changed: {identifier}/{key}")
        refs = {(r["role"], r["contentId"]): r["sha256"] for r in entry["componentRefs"]}
        require(len(refs) == len(entry["componentRefs"]) and refs == expected_components,
                "Social candidate not bound to the actual new components")


def validate_inventory(directory: Path, inventory: dict) -> int:
    require(inventory["releaseStatus"] == "candidate" and inventory["runtimeEnabled"] is False,
            "Validation bundle must not be activated")
    require(inventory["frozenInput"]["sha256"] == sha(SPECIMEN.read_bytes()), "Frozen input inventory hash changed")
    indexed = unique(inventory["artifacts"], "path", "bundle artifact path")
    expected = {"holiday-catalogs/ch-holiday-catalog.json", "special-regimes/vrpg-be.json",
                "social-procedures/ch-social-procedures.json", "generated-dates.json", "date-probes.json"}
    expected.update(f"profiles/{p}.json" for p in ("stpo", "zpo", "bgg", "vwvg", "vrpg-be"))
    expected.update(f"calendars/{p.name}" for p in (directory / "calendars").glob("*.json"))
    require(set(indexed) == expected and len(indexed) == 42, "Bundle inventory differs from 40 data + two oracle files")
    for name, item in indexed.items():
        raw = (directory / name).read_bytes()
        require(sha(raw) == item["sha256"] and len(raw) == item["byteLength"], f"Bundle bytes changed: {name}")
    for name in expected:
        if name.startswith(("profiles/", "special-regimes/")):
            require((directory / name).read_bytes() == (BASE / name).read_bytes(), f"Historic component bytes changed: {name}")
    return len(indexed)


def validate_bundle(directory: Path = BUNDLE) -> dict:
    raw = (directory / "holiday-catalogs/ch-holiday-catalog.json").read_bytes()
    catalog = json.loads(raw)
    validate_catalog(catalog, raw)
    calendars = {p.stem: read_json(p) for p in (directory / "calendars").glob("*.json")}
    validate_calendars(catalog, raw, calendars)
    inventory_count = validate_inventory(directory, read_json(directory / "inventory.json"))
    components = {name: (directory / name).read_bytes() for name in (
        "calendars/ch-federal-calendar.json", "calendars/be-public-holidays.json",
        "holiday-catalogs/ch-holiday-catalog.json")}
    validate_social_copy(read_json(directory / "social-procedures/ch-social-procedures.json"), components)
    occurrences = validate_date_probes(calendars, read_json(directory / "date-probes.json"))
    return {"kind": "ap22c1-independent-python-contract", "catalogSha256": sha(raw),
            "archivedRules": 479, "matrixDecisions": 198, "bindings": 104, "projections": len(calendars),
            "supplementalRules": 12, "inventoryArtifacts": inventory_count, "dateOccurrencesCompared": occurrences,
            "socialRules": 44, "socialBindings": 50, "runtimeActivation": False, "newSourceReview": False}


if __name__ == "__main__":
    print(json.dumps(validate_bundle(), indent=2))
