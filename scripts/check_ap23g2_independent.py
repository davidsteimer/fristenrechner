# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23G2 contract and calendar check.

Uses actual candidate bytes, Python jsonschema and independent datetime
enumeration. No JavaScript checker, builder constants or product code imports.
"""
import argparse
import copy
import hashlib
import importlib.metadata
import json
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "data/candidates/2026-10-22-ap23f3"
OUT = ROOT / "outputs/ap23g2-candidate-2026-10-22"
BUNDLE = OUT / "bundle"
SCHEMAS = ROOT / "schemas/candidates/ap23g2"
ADMIN = "administrative-procedures/ch-cantonal-administrative-procedures.json"
FIXTURE = ROOT / "docs/fachrecht/ap23g1/referenzfaelle.json"
REPORT = ROOT / "outputs/ap23g2-2026-10-22/QA-AP23G2-INDEPENDENT.json"
WINDOW = {"from": "2026-08-29", "to": "2027-12-31"}
DAY = timedelta(days=1)


def load(path):
    return json.loads(path.read_bytes())


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical_hash(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False,
                          separators=(",", ":")).encode("utf-8"))


def index(rows, key):
    found = {row[key]: row for row in rows}
    assert len(found) == len(rows), f"Duplicate {key}"
    return found


def evidence(path):
    raw = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": sha(raw), "bytes": len(raw)}


def easter(year):
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    ell = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * ell) // 451
    month, day = divmod(h + ell - 7 * m + 114, 31)
    return date(year, month, day + 1)


def period_date(expression, year):
    if expression["type"] == "easterOffset":
        return easter(year) + timedelta(days=expression["days"])
    assert expression["type"] == "fixedMonthDay"
    return date(year + expression["yearOffset"], expression["month"], expression["day"])


def in_pause(day, profile):
    return any(period_date(p["start"], y) <= day <= period_date(p["end"], y)
               for y in (day.year - 1, day.year)
               for p in profile["periods"])


def calendar_dates(calendar, calendars, year):
    result = set()
    for parent in calendar["inherits"]:
        result |= calendar_dates(calendars[parent], calendars, year)
    for rule in calendar["rules"]:
        if rule["effect"]["type"] != "holiday":
            continue
        assert rule["condition"] == "always"
        expr = rule["calculation"]
        if expr["type"] == "fixedMonthDay":
            day = date(year, expr["month"], expr["day"])
        elif expr["type"] == "easterOffsetDays":
            day = easter(year) + timedelta(days=expr["offsetDays"])
        else:
            assert expr["type"] == "nthWeekdayOfMonth"
            first = date(year, expr["month"], 1)
            day = first + timedelta(days=(expr["isoWeekday"] - first.isoweekday()) % 7
                                   + 7 * (expr["occurrence"] - 1))
        if day.isoformat() >= rule["validity"]["from"] and (
                rule["validity"]["to"] is None or day.isoformat() <= rule["validity"]["to"]):
            result.add(day)
    return result


# Independently transcribed from the accepted G1 legal paper, not from builder
# constants or the research fixture's calendarDefinitions/path defaults.
EXPECTED = {
    "ur-admin-20": ("UR", "administration", 20, "none", "targetAuthoritySeat", "ordinaryAdministrativeAppeal"),
    "ur-court-20": ("UR", "court", 20, "three", "targetAuthoritySeat", "ordinaryAdministrativeCourtAppeal"),
    "ur-admin-ordered": ("UR", "administration", None, "none", "targetAuthoritySeat", "orderedProceduralSubmission"),
    "ur-court-ordered": ("UR", "court", None, "three", "targetAuthoritySeat", "orderedProceduralSubmission"),
    "ur-admin-reasons-10": ("UR", "administration", 10, "none", "issuingAuthoritySeat", "requestAdministrativeReasons"),
    "so-admin-10": ("SO", "administration", 10, "none", "targetAuthoritySeat", "ordinaryAdministrativeAppeal"),
    "so-court-10": ("SO", "court", 10, "three", "targetAuthoritySeat", "ordinaryAdministrativeCourtAppeal"),
    "so-admin-ordered": ("SO", "administration", None, "none", "targetAuthoritySeat", "orderedProceduralSubmission"),
    "so-court-ordered": ("SO", "court", None, "three", "targetAuthoritySeat", "orderedProceduralSubmission"),
    "so-admin-reasons-10": ("SO", "administration", 10, "none", "issuingAuthoritySeat", "requestAdministrativeReasons"),
    "sh-admin-20": ("SH", "administration", 20, "none", "targetAuthoritySeat", "ordinaryAdministrativeRekurs"),
    "sh-court-20": ("SH", "court", 20, "three", "courtSeat", "ordinaryAdministrativeCourtAppeal"),
    "sh-admin-ordered": ("SH", "administration", None, "none", "targetAuthoritySeat", "orderedProceduralSubmission"),
    "sh-court-ordered": ("SH", "court", None, "three", "courtSeat", "orderedProceduralSubmission"),
    "sh-admin-reasons-10": ("SH", "administration", 10, "none", "issuingAuthoritySeat", "requestAdministrativeReasons"),
    "sh-court-reasons-30": ("SH", "court", 30, "three", "courtSeat", "requestCourtReasons"),
}


def legal_calendar(canton, year):
    """Independent legal list, distinct from actual candidate parameter source."""
    if canton == "UR":
        fixed = ((1, 1), (1, 6), (3, 19), (8, 1), (8, 15),
                 (11, 1), (12, 8), (12, 25), (12, 26))
        offsets = (-2, 1, 39, 50, 60)
    elif canton == "SO":
        fixed = ((1, 1), (1, 2), (5, 1), (8, 1), (8, 15),
                 (11, 1), (12, 25), (12, 26))
        offsets = (-2, 1, 39, 50, 60)
    else:
        assert canton == "SH"
        fixed = ((1, 1), (1, 2), (5, 1), (8, 1), (12, 25), (12, 26))
        offsets = (-2, 0, 1, 39, 49, 50)
    dates = {date(year, month, day) for month, day in fixed}
    dates |= {easter(year) + n * DAY for n in offsets}
    if canton == "SH":
        first = date(year, 9, 15)
        dates.add(first + ((6 - first.weekday()) % 7) * DAY)
    return dates


def expected_requirements(ident):
    canton, stage, _, _, anchor, action = EXPECTED[ident]
    is_reasons = action in ("requestAdministrativeReasons", "requestCourtReasons")
    is_ordered = action == "orderedProceduralSubmission"
    if action == "requestCourtReasons":
        opening = "legallyQualifiedCourtDispositiveOrOralOpening"
    elif action == "requestAdministrativeReasons":
        opening = ("lawfullyUnreasonedAdministrativeDecision" if canton == "UR"
                   else "lawfullyUnreasonedAdministrativeDecisionWithExpressReasonsOffer")
    else:
        opening = "orderedForwardDayPeriod" if is_ordered else "completeReasonedAdministrativeDecision"
    return {
        "action": action, "opening": opening, "holidayAnchor": anchor,
        "authorityLevel": "cantonal", "specialLaw": "excluded", "materialPerformance": False,
        "fixedEndDate": False, "deviatingStart": False, "termChange": "none", "unit": "day",
        "direction": "forward", "notice": "uncontested", "suspensionContext": "ordinaryNoException",
        "serviceContext": "effectiveLegalTriggerKnown",
        "requiredTargetCourt": {"UR": "UR-Obergericht", "SO": "SO-Verwaltungsgericht",
                                "SH": "SH-Obergericht"}[canton] if stage == "court" else "notApplicable",
        "requiredSameIssuingCourt": ident == "sh-court-reasons-30",
        "openingChainPolicy": "notApplicable" if is_reasons or is_ordered else "requireOriginalOrTimelyRequestedReasons",
        "coordinationPolicy": "excludeCoordinatedAppeal" if ident in ("ur-admin-20", "ur-court-20") else "notApplicable",
        "localHolidayPolicy": "blockConcreteUnresolvedAdditionalEndEffect" if canton == "UR" else "notApplicable",
        "specialOpeningPolicy": "ordinaryEffectiveUROpening" if canton == "UR" else "notApplicable",
        "shorteningPolicy": "noShortenedSHRekurs" if canton == "SH" else "notApplicable",
    }


def adapt_research_input(case):
    """Explicit synthetic facts only, no candidate-derived positive facts."""
    ident = case["path"].lower()
    basis = ident if ident in EXPECTED else "ur-admin-20"
    canton, stage, _, _, anchor, action = EXPECTED[basis]
    req = expected_requirements(basis)
    result = {
        "path": ident, "pathRevision": 1, "authoritySeatCanton": canton, "stage": stage,
        "trigger": case["trigger"], "days": case["days"], "action": action, "opening": req["opening"],
        "holidayAnchor": anchor, "authorityLevel": "cantonal", "specialLaw": "excluded",
        "materialPerformance": False, "fixedEndDate": False, "deviatingStart": False,
        "termChange": "none", "unit": "day", "direction": "forward", "notice": "uncontested",
        "suspensionContext": "ordinaryNoException", "serviceContext": "effectiveLegalTriggerKnown",
        "coordinatedDecision": False, "shortenedRekurs": False,
        "sameIssuingCourt": req["requiredSameIssuingCourt"], "targetCourt": req["requiredTargetCourt"],
        "openingOrigin": "originalReasoned" if req["opening"] == "completeReasonedAdministrativeDecision" else "notApplicable",
        "priorReasonsRequest": "notApplicable", "localHolidayEffect": "noAdditionalRelevantLocalHoliday",
        "urOpeningConsequence": "ordinaryEffectiveOpening",
    }
    result.update(case.get("facts", {}))
    return result


CONTROL_REQUIREMENTS = {
    "requiredTargetCourt", "requiredSameIssuingCourt", "openingChainPolicy", "coordinationPolicy",
    "localHolidayPolicy", "specialOpeningPolicy", "shorteningPolicy",
}


def isolated_input_qualified(item, validator, paths, policies, laws):
    if not validator.is_valid(item) or item["path"] not in paths:
        return False
    path, policy = paths[item["path"]], policies[item["path"]]
    if policy["mode"] != "qualifiedDayProcedureV4":
        return False
    if item["pathRevision"] != path["revision"] or item["stage"] not in path["stages"]:
        return False
    if item["authoritySeatCanton"] != laws[path["lawId"]]["canton"]:
        return False
    req = policy["requirements"]
    if any(item.get(k) != value for k, value in req.items() if k not in CONTROL_REQUIREMENTS):
        return False
    if item["targetCourt"] != req["requiredTargetCourt"]:
        return False
    if req["requiredSameIssuingCourt"] and not item["sameIssuingCourt"]:
        return False
    if req["openingChainPolicy"] == "requireOriginalOrTimelyRequestedReasons":
        if item["openingOrigin"] not in ("originalReasoned", "reasonedFollowingRequest"):
            return False
        if item["openingOrigin"] == "reasonedFollowingRequest" and item["priorReasonsRequest"] != "timelyEstablished":
            return False
    if req["coordinationPolicy"] == "excludeCoordinatedAppeal" and item["coordinatedDecision"]:
        return False
    if req["localHolidayPolicy"] == "blockConcreteUnresolvedAdditionalEndEffect" and item["localHolidayEffect"] != "noAdditionalRelevantLocalHoliday":
        return False
    if req["specialOpeningPolicy"] == "ordinaryEffectiveUROpening" and item["urOpeningConsequence"] != "ordinaryEffectiveOpening":
        return False
    if req["shorteningPolicy"] == "noShortenedSHRekurs" and item["shortenedRekurs"]:
        return False
    duration = path["duration"]
    return item["days"] == duration["value"] if duration["kind"] == "statutoryDays" else duration["minimum"] <= item["days"] <= duration["maximum"]


IDS = {
    "UR": "SRC-AP23G1-UR-VRPV-20160301", "URLSG": "SRC-AP23G1-UR-LSG-20030101",
    "SO": "SRC-AP23G1-SO-VRG-20250801", "SOGS": "SRC-AP23G1-SO-GS201463",
    "SH": "SRC-AP23G1-SH-VRG-20251101", "SHJG": "SRC-AP23G1-SH-JG-20260501",
    "SHRTG": "SRC-AP23G1-SH-RTG-20070101",
    "SHOGE": "JUD-AP23G1-SH-OGE-4020181K-20180824",
    "SHBGER": "JUD-AP23G1-SH-BGER-2C4832025-20260312",
    "ZPO": "SRC-AP23G1-CH-ZPO-20260701", "NATIONAL": "SRC-AP23G1-CH-BUNDESFEIERTAG-19940701",
}
LAW_IDS = {"UR": "vrpv-ur", "SO": "vrg-so", "SH": "vrg-sh"}
CALENDARS = {"UR": "ap22-ur-67275ff3e872", "SO": "ap22-so-3f5f7b7f54f5", "SH": "ap22-sh-ec7d0988145a"}


def expected_source_keys(canton, court):
    if canton == "UR":
        keys = ["UR", "URLSG"]
    elif canton == "SO":
        keys = ["SO", "SOGS", "NATIONAL"]
    else:
        keys = ["SH", "SHRTG", "SHOGE", "SHJG"] if court else ["SH", "SHRTG", "SHBGER"]
    if court:
        keys.append("ZPO")
    return {IDS[key] for key in keys}


def refs_set(rows):
    assert rows and all(row["locator"].strip() for row in rows)
    assert len({row["sourceId"] for row in rows}) == len(rows)
    return {row["sourceId"] for row in rows}


def validate_structure(catalog, original, calendars, manifest, original_manifest):
    paths = index(catalog["paths"], "pathId")
    policies = index(catalog["qualificationPolicies"], "pathId")
    entries = index(catalog["releaseBinding"]["pathEligibility"], "pathId")
    bindings = index(catalog["holidayBindings"], "holidayBindingId")
    profiles = index(catalog["suspensionProfiles"], "suspensionProfileId")
    sources = index(catalog["sources"], "sourceId")
    assert catalog["formatVersion"] == "4.0.0"
    assert catalog["contractStatus"] == "proposed" and catalog["runtimeActive"] is False
    assert catalog["contractDecision"] == {"id": "DEC-2026-036", "status": "proposed", "on": None}
    assert catalog["releaseBinding"]["status"] == "candidate"
    for key in ("releaseId", "approval", "sourceReviewRef", "referenceSuiteRef"):
        assert catalog["releaseBinding"][key] is None
    assert catalog["releaseBinding"]["targetComponentRefs"] == []
    assert set(paths) == set(policies) == set(entries)
    assert (len(catalog["laws"]), len(profiles), len(bindings), len(paths), len(policies)) == (11, 20, 13, 58, 58)
    for group, key in (
            ("paths", "pathId"), ("qualificationPolicies", "pathId"), ("laws", "lawId"),
            ("suspensionProfiles", "suspensionProfileId"), ("holidayBindings", "holidayBindingId"),
            ("sources", "sourceId"), ("excludedPaths", "exclusionId")):
        current = index(catalog[group], key)
        for old in original[group]:
            assert canonical_hash(current[old[key]]) == canonical_hash(old), (group, old[key])
    for old in original["preserved"]:
        assert old in catalog["preserved"]
    assert set(paths) == {p["pathId"] for p in original["paths"]} | set(EXPECTED)
    assert len(set(sources) - {s["sourceId"] for s in original["sources"]}) == 11
    for key in ("UR", "URLSG", "SO", "SOGS", "SH", "SHJG", "SHRTG"):
        assert sources[IDS[key]]["kind"] == "statute"
    for key in ("SHOGE", "SHBGER"):
        assert sources[IDS[key]]["kind"] == "judgment"
    versions = {"UR": ("ur", 641), "URLSG": ("ur", 963), "SO": ("so", 5523),
                "SH": ("sh", 2030), "SHJG": ("sh", 2100), "SHRTG": ("sh", 1886)}
    for key, (canton, version) in versions.items():
        domain = "bgs.so.ch" if canton == "so" else f"rechtsbuch.{canton}.ch"
        assert sources[IDS[key]]["url"] == f"https://{domain}/api/de/versions/{version}/pdf_file"
    assert "12-03-2026-2C_483-2025" in sources[IDS["SHBGER"]]["url"]
    assert "2018" in sources[IDS["SHOGE"]]["versionDescription"]
    descriptors = index(original_manifest["artifacts"], "contentId")
    holiday_catalog = load(BASE / "holiday-catalogs/ch-holiday-catalog.json")
    new_bindings = {}
    for canton, court in (("UR", False), ("SO", False), ("SH", False), ("SH", True)):
        ident = f"{canton.lower()}-{'court' if court else 'administration'}-seat"
        binding = bindings[ident]
        new_bindings[ident] = binding
        assert binding["bindingVersion"] == "4.0.0"
        assert binding["lawId"] == LAW_IDS[canton]
        assert binding["authoritySeatCanton"] == canton and binding["authorityLevel"] == "cantonal"
        assert binding["anchor"] == ("courtSeat" if court else "authoritySeat")
        assert binding["physicalBaseline"]["calendarId"] == CALENDARS[canton]
        assert binding["physicalBaseline"]["releaseId"] == original_manifest["releaseId"]
        assert binding["physicalBaseline"]["eligibilityMeaning"] == "physicalSourceOnlyNotFederalProcedurePermission"
        assert binding["legalBinding"]["projectDecisionRef"] == "DEC-2026-031"
        assert binding["legalBinding"]["roleUnion"] is False
        assert binding["legalBinding"]["partyOrRepresentativeRequired"] is False
        assert refs_set(binding["legalBinding"]["sourceRefs"]) == expected_source_keys(canton, court)
        reuse = binding["physicalReuse"]
        assert reuse["kind"] == "sameDatesIndependentLegalBasis" and reuse["permissionInheritance"] == "none"
        assert reuse["sourceReleaseId"] == original_manifest["releaseId"]
        assert reuse["sourceCatalogSha256"] == descriptors["ch-holiday-catalog"]["sha256"]
        assert refs_set(reuse["evidenceRefs"]) == expected_source_keys(canton, court)
        calendar = calendars[CALENDARS[canton]]
        assert reuse["selectedRuleIds"] == [rule["ruleId"] for rule in calendar["rules"]]
        projection = next(p for p in holiday_catalog["activation"]["projections"] if p["calendarId"] == CALENDARS[canton])
        assert reuse["projectionRuleIds"] == projection["ruleIds"]
        assert binding["physicalBaseline"]["projectionId"] == projection["id"]
        for physical in binding["physicalBaseline"]["references"]:
            original_descriptor = descriptors[physical["contentId"]]
            assert physical["path"] == original_descriptor["path"]
            assert physical["sha256"] == original_descriptor["sha256"]
            assert physical["role"] == original_descriptor["role"]
        assert {r["contentId"] for r in binding["physicalBaseline"]["references"]} == {
            CALENDARS[canton], "ch-federal-calendar", "ch-holiday-catalog"}
        if canton == "SH" and not court:
            assert reuse["notDerivedFrom"] == "SH-ZPO-ADDITIONAL"
            addition = binding["practiceAddition"]
            assert addition["day"] == "01-02"
            assert addition["evidenceLimit"] == "nonDispositiveCantonalLawDescription"
            assert addition["scope"] == "newSHGeneralAdministrativeOnly"
            assert refs_set(addition["sourceRefs"]) == {IDS["SHBGER"]}
            assert addition["sourceRefs"][0]["locator"] == "E. 3.1"
        else:
            assert reuse["notDerivedFrom"] == "notApplicable" and binding["practiceAddition"] is None
        for year in (2026, 2027):
            assert calendar_dates(calendar, calendars, year) == legal_calendar(canton, year)
    warning_count, guarded_count = 0, 0
    for ident, (canton, stage, days, pause, _, action) in EXPECTED.items():
        path, policy, entry = paths[ident], policies[ident], entries[ident]
        assert path["revision"] == policy["pathRevision"] == entry["pathRevision"] == 1
        assert path["researchRef"] == ident.upper()
        assert path["lawId"] == LAW_IDS[canton] and path["stages"] == [stage]
        assert policy["mode"] == "qualifiedDayProcedureV4"
        assert policy["requirements"] == expected_requirements(ident)
        assert policy["pathSha256"] == canonical_hash(path)
        assert entry["pathSha256"] == canonical_hash(path)
        assert entry["qualificationPolicySha256"] == canonical_hash(policy)
        expected_binding = f"{canton.lower()}-{'court' if canton == 'SH' and stage == 'court' else 'administration'}-seat"
        assert path["holidayBindingId"] == expected_binding
        assert path["suspensionProfileId"] == f"{canton.lower()}-{pause}"
        binding, profile = bindings[path["holidayBindingId"]], profiles[path["suspensionProfileId"]]
        assert entry["holidayBindingSha256"] == canonical_hash(binding)
        assert entry["suspensionProfileSha256"] == canonical_hash(profile)
        assert entry["status"] == "candidate" and entry["targetComponentRefs"] == []
        assert entry["sourceReviewRef"] is None and entry["referenceSuiteRef"] is None
        if days is None:
            assert path["duration"] == {"kind": "authorityOrderedDays", "minimum": 1, "maximum": 365,
                                        "boundMeaning": "technicalSafetyLimitNotLegalMaximum"}
        else:
            assert path["duration"] == {"kind": "statutoryDays", "value": days, "overridable": False}
        if action == "requestAdministrativeReasons":
            assert path["action"] == "administrative-reasons-request"
        elif action == "requestCourtReasons":
            assert path["action"] == "court-reasons-request"
        elif days is None:
            assert path["action"] == f"ordered-{'court' if stage == 'court' else 'administrative'}-submission"
        else:
            assert path["action"] == f"ordinary-{'court' if stage == 'court' else 'administrative'}-appeal"
        for field in ("caseCoverage", "calculationCoverage", "sourceCoverage"):
            assert path["temporalBinding"][field] == WINDOW
        assert path["temporalBinding"]["evaluation"] == "eachEvaluatedDayIncludingEndShift"
        assert path["normTimeline"][0]["interval"] == WINDOW and len(path["normTimeline"]) == 1
        assert refs_set(path["normTimeline"][0]["sourceRefs"]) == expected_source_keys(canton, stage == "court")
        assert refs_set(path["sourceRefs"]) == expected_source_keys(canton, stage == "court")
        for ref in path["sourceRefs"]:
            assert ref["sourceId"] in sources
        assert path["endShiftPolicy"] == "nextWorkingDay"
        assert path["endShiftGuard"] == ("blockWhenEnteringApplicableSuspension" if stage == "court" else "none")
        guarded_count += stage == "court"
        assert profile["lawId"] == LAW_IDS[canton]
        assert refs_set(profile["sourceRefs"]) == {IDS[canton]} | ({IDS["ZPO"]} if pause == "three" else set()) | (
            {IDS["SHJG"]} if pause == "three" and canton == "SH" else set())
        for year in (2026, 2027):
            expected_periods = [] if pause == "none" else [
                (easter(year) - 7 * DAY, easter(year) + 7 * DAY),
                (date(year, 7, 15), date(year, 8, 15)),
                (date(year, 12, 18), date(year + 1, 1, 2))]
            assert sorted((period_date(p["start"], year), period_date(p["end"], year))
                          for p in profile["periods"]) == sorted(expected_periods)
        warnings = path["openingWarnings"]
        if ident in ("ur-admin-20", "ur-court-20"):
            assert len(warnings) == 1
            warning = warnings[0]
            assert warning["warningId"] == "ur-art22-opening-restriction"
            assert warning["evaluatedOn"] == "qualifiedOpeningDate"
            assert warning["effect"] == "noticeOnlyNoDateChange"
            assert refs_set(warning["sourceRefs"]) == {IDS["UR"]}
            assert warning["sourceRefs"][0]["locator"] == "Art. 22"
            for year in (2026, 2027):
                assert sorted((period_date(p["start"], year), period_date(p["end"], year))
                              for p in warning["periods"]) == sorted([
                    (easter(year) - 8 * DAY, easter(year) + 8 * DAY),
                    (date(year, 12, 18), date(year + 1, 1, 6))])
            warning_count += 1
        else:
            assert warnings == []
    assert warning_count == 2 and guarded_count == 7
    assert manifest["formatVersion"] == manifest["compatibility"]["minimumConsumerFormatVersion"] == "11.0.0"
    return paths, bindings, profiles, policies


def rebind_mutation(catalog):
    paths = index(catalog["paths"], "pathId")
    policies = index(catalog["qualificationPolicies"], "pathId")
    bindings = index(catalog["holidayBindings"], "holidayBindingId")
    profiles = index(catalog["suspensionProfiles"], "suspensionProfileId")
    for ident, policy in policies.items():
        policy["pathSha256"] = canonical_hash(paths[ident])
    for entry in catalog["releaseBinding"]["pathEligibility"]:
        path = paths[entry["pathId"]]
        entry["pathSha256"] = canonical_hash(path)
        entry["qualificationPolicySha256"] = canonical_hash(policies[path["pathId"]])
        entry["holidayBindingSha256"] = canonical_hash(bindings[path["holidayBindingId"]])
        entry["suspensionProfileSha256"] = canonical_hash(profiles[path["suspensionProfileId"]])


def calculate_case(item, paths, bindings, profiles, calendars):
    path = paths[item["path"]]
    start = date.fromisoformat(item["trigger"])
    spans = [path["temporalBinding"][key] for key in ("caseCoverage", "calculationCoverage", "sourceCoverage")]
    def covered(day):
        value = day.isoformat()
        return all(span["from"] <= value <= span["to"] for span in spans) and any(
            s["interval"]["from"] <= value <= s["interval"]["to"] for s in path["normTimeline"])
    boundary = {"outcome": "researchWindowBoundary"}
    if not covered(start):
        return boundary
    upper = min(date.fromisoformat(s["to"]) for s in spans)
    profile = profiles[path["suspensionProfileId"]]
    # Enumerate all covered future dates, then select the Nth eligible date.
    future = [start + n * DAY for n in range(1, (upper - start).days + 1)]
    eligible = [day for day in future if not in_pause(day, profile)]
    if len(eligible) < item["days"]:
        return boundary
    nominal = eligible[item["days"] - 1]
    evaluated = [day for day in future if day <= nominal]
    if not all(covered(day) for day in evaluated):
        return boundary
    binding = bindings[path["holidayBindingId"]]
    calendar = calendars[binding["physicalBaseline"]["calendarId"]]
    ends = [day for day in future if day >= nominal and day.weekday() < 5
            and day not in calendar_dates(calendar, calendars, day.year)]
    if not ends:
        return boundary
    end = ends[0]
    shift_dates = [nominal + n * DAY for n in range(1, (end - nominal).days + 1)]
    if not all(covered(day) for day in shift_dates):
        return boundary
    if path["endShiftGuard"] == "blockWhenEnteringApplicableSuspension" and any(in_pause(day, profile) for day in shift_dates):
        return {"outcome": "unresolvedBoundaryProposed", "nominalEnd": nominal.isoformat(),
                "ordinaryShiftEnd": end.isoformat()}
    warnings = []
    for warning in path["openingWarnings"]:
        if in_pause(start, {"periods": warning["periods"]}):
            assert warning["effect"] == "noticeOnlyNoDateChange"
            assert warning["warningId"] == "ur-art22-opening-restriction"
            warnings.append("UR-ART22")
    return {"outcome": "datedResearchValue", "end": end.isoformat(),
            "ordinaryStart": (start + DAY).isoformat(), "firstCountedDay": eligible[0].isoformat(),
            "nominalEnd": nominal.isoformat(), "skippedDays": (nominal - start).days - item["days"],
            "warnings": warnings}


def run():
    assert sha((BASE / "manifest.json").read_bytes()) == "89470d589615a447b146eb58028a7e2ac58fe7389b908196b3f82e02864b3311"
    assert sha((BASE / ADMIN).read_bytes()) == "c336ce6745ea3e3cf6a241d83102e1cbcae6787ad7d4bb426aceb273cc8d7fc3"
    receipt_path = ROOT / "outputs/ap23g1-abnahme-2026-10-22/receipt.json"
    assert sha(receipt_path.read_bytes()) == "d075f55e3439d8480107129916b6f22052ad8cb5b0294f42ae1696eda702b443"
    receipt = load(receipt_path)
    assert receipt["professionalAcceptance"] is True and receipt["technicalContractApproved"] is False
    assert receipt["acceptedBy"] == "David Steimer"
    archive_files = 0
    for row in receipt["artifacts"]:
        archived = receipt_path.parent / row["path"]
        assert sha(archived.read_bytes()) == row["sha256"], row["path"]
        assert archived.stat().st_size == row["byteLength"]
        archive_files += 1
    fixture_hash = next(a["sha256"] for a in receipt["artifacts"] if a["path"] == FIXTURE.relative_to(ROOT).as_posix())
    assert sha(FIXTURE.read_bytes()) == fixture_hash
    assert (ROOT / "docs/fachrecht/abnahme-ap23g1.md").exists()
    original, original_manifest = load(BASE / ADMIN), load(BASE / "manifest.json")
    candidate, manifest = load(BUNDLE / ADMIN), load(BUNDLE / "manifest.json")
    research = load(FIXTURE)
    validators = {}
    schema_resources = [load(p) for p in sorted((ROOT / "schemas").glob("*.schema.json"))]
    schema_resources += [load(p) for p in sorted(SCHEMAS.glob("*.json"))]
    registry = Registry().with_resources((s["$id"], Resource.from_contents(s)) for s in schema_resources)
    for path in sorted(SCHEMAS.glob("*.json")):
        schema = load(path)
        Draft202012Validator.check_schema(schema)
        validators[path.name] = Draft202012Validator(schema, format_checker=FormatChecker(), registry=registry)
    assert len(validators) == 4
    catalog_validator = validators["administrative-procedure-catalog-v4.schema.json"]
    catalog_validator.validate(candidate)
    validators["local-reference-manifest-v11.schema.json"].validate(manifest)
    assert manifest["releaseStatus"] == "candidate"
    local_extension = manifest["extensions"]["steimer.local-reference"]
    for field in ("productionActivation", "sourceReleaseApproved", "calendarExportEnabled"):
        assert local_extension[field] is False
    assert local_extension["contractDecision"] == "DEC-2026-036" and local_extension["contractDecisionStatus"] == "proposed"
    descriptors = index(manifest["artifacts"], "path")
    old_descriptors = index(original_manifest["artifacts"], "path")
    assert len(descriptors) == 42 and set(descriptors) == set(old_descriptors)
    assert {p.relative_to(BUNDLE).as_posix() for p in BUNDLE.rglob("*") if p.is_file()} == set(descriptors) | {"manifest.json"}
    calendars, raw_unchanged = {}, 0
    calendar_validator = Draft202012Validator(load(ROOT / "schemas/calendar-rules-v3.schema.json"),
                                            format_checker=FormatChecker(), registry=registry)
    for rel, descriptor in descriptors.items():
        raw = (BUNDLE / rel).read_bytes()
        assert len(raw) == descriptor["byteLength"] and sha(raw) == descriptor["sha256"], rel
        if rel != ADMIN:
            assert raw == (BASE / rel).read_bytes()
            assert descriptor == old_descriptors[rel]
            raw_unchanged += 1
        if descriptor["role"] == "calendar":
            calendar = json.loads(raw)
            calendar_validator.validate(calendar)
            calendars[calendar["calendarId"]] = calendar
    assert raw_unchanged == 41 and len(calendars) == 33
    paths, bindings, profiles, policies = validate_structure(candidate, original, calendars, manifest, original_manifest)
    laws = index(candidate["laws"], "lawId")
    input_validator = validators["administrative-input-v4.schema.json"]
    results = []
    for case in research["cases"]:
        item = adapt_research_input(case)
        schema_valid = input_validator.is_valid(item)
        qualified = isolated_input_qualified(item, input_validator, paths, policies, laws)
        expected_outcome = case["expected"]["outcome"]
        assert qualified == (expected_outcome != "qualificationBoundaryProposed"), (case["id"], qualified)
        actual = calculate_case(item, paths, bindings, profiles, calendars) if qualified else {"outcome": "qualificationBoundaryProposed"}
        for key, expected in case["expected"].items():
            if key == "reason":
                continue
            assert actual.get(key) == expected, (case["id"], key, expected, actual)
        results.append({"id": case["id"], "inputSchemaValid": schema_valid, "qualified": qualified, "actual": actual})
    counts = dict(Counter(row["actual"]["outcome"] for row in results))
    assert counts == {"datedResearchValue": 70, "unresolvedBoundaryProposed": 7,
                      "qualificationBoundaryProposed": 34, "researchWindowBoundary": 4}
    holiday_catalog = load(BUNDLE / "holiday-catalogs/ch-holiday-catalog.json")
    assert len(holiday_catalog["data"]["rules"]) == 479
    assert len(holiday_catalog["activation"]["supplementalRules"]) == 12
    social = load(BUNDLE / "social-procedures/ch-social-procedures.json")
    assert len(social["federalRules"]) == 44 and len(social["cantonalBindings"]) == 50
    negatives = []
    mutations = (
        ("sh_reasons_offer_cannot_be_generic_unreasoned", lambda x: index(x["qualificationPolicies"], "pathId")["sh-admin-reasons-10"]["requirements"].__setitem__("opening", "lawfullyUnreasonedAdministrativeDecision")),
        ("so_reasons_offer_cannot_be_generic_unreasoned", lambda x: index(x["qualificationPolicies"], "pathId")["so-admin-reasons-10"]["requirements"].__setitem__("opening", "lawfullyUnreasonedAdministrativeDecision")),
        ("ur_reasoned_followup_requires_timely_prior_request", lambda x: index(x["qualificationPolicies"], "pathId")["ur-admin-20"]["requirements"].__setitem__("openingChainPolicy", "notApplicable")),
        ("sh_court_reasons_requires_same_issuing_obergericht", lambda x: index(x["qualificationPolicies"], "pathId")["sh-court-reasons-30"]["requirements"].__setitem__("requiredSameIssuingCourt", False)),
        ("sh_court_reasons_cannot_use_other_target", lambda x: index(x["qualificationPolicies"], "pathId")["sh-court-reasons-30"]["requirements"].__setitem__("requiredTargetCourt", "notApplicable")),
        ("ur_article22_warning_cannot_disappear", lambda x: index(x["paths"], "pathId")["ur-admin-20"].__setitem__("openingWarnings", [])),
        ("ur_article22_is_eight_days_not_seven", lambda x: index(x["paths"], "pathId")["ur-court-20"]["openingWarnings"][0]["periods"][0]["start"].__setitem__("days", -7)),
        ("ur_local_limit_cannot_disappear", lambda x: index(x["qualificationPolicies"], "pathId")["ur-admin-ordered"]["requirements"].__setitem__("localHolidayPolicy", "notApplicable")),
        ("ur_coordination_must_be_limited_to_appeal", lambda x: index(x["qualificationPolicies"], "pathId")["ur-admin-ordered"]["requirements"].__setitem__("coordinationPolicy", "excludeCoordinatedAppeal")),
        ("ur_coordinated_appeal_cannot_use_plain_twenty_days", lambda x: index(x["qualificationPolicies"], "pathId")["ur-admin-20"]["requirements"].__setitem__("coordinationPolicy", "notApplicable")),
        ("sh_administration_january_requires_own_practice", lambda x: index(x["holidayBindings"], "holidayBindingId")["sh-administration-seat"].__setitem__("practiceAddition", None)),
        ("sh_administration_cannot_replace_bger_with_zpo_practice", lambda x: index(x["holidayBindings"], "holidayBindingId")["sh-administration-seat"]["legalBinding"]["sourceRefs"][-1].__setitem__("sourceId", IDS["SHOGE"])),
        ("sh_court_anchor_cannot_be_administrative_rule", lambda x: index(x["holidayBindings"], "holidayBindingId")["sh-court-seat"].__setitem__("anchor", "authoritySeat")),
        ("so_timeline_requires_process_holiday_act", lambda x: index(x["paths"], "pathId")["so-court-10"]["normTimeline"][0].__setitem__("sourceRefs", [r for r in index(x["paths"], "pathId")["so-court-10"]["normTimeline"][0]["sourceRefs"] if r["sourceId"] != IDS["SOGS"]])),
        ("temporal_gap_after_receipt_cannot_be_ignored", lambda x: index(x["paths"], "pathId")["ur-court-20"]["normTimeline"][0]["interval"].__setitem__("to", "2027-01-01")),
        ("physical_rule_selection_cannot_drop_january", lambda x: index(x["holidayBindings"], "holidayBindingId")["sh-administration-seat"]["physicalReuse"]["selectedRuleIds"].pop()),
        ("court_end_shift_guard_cannot_disappear", lambda x: index(x["paths"], "pathId")["sh-court-reasons-30"].__setitem__("endShiftGuard", "none")),
        ("old_path_objects_cannot_change", lambda x: index(x["paths"], "pathId")["ag-admin-30"]["duration"].__setitem__("value", 20)),
    )
    for name, change in mutations:
        changed = copy.deepcopy(candidate)
        change(changed)
        rebind_mutation(changed)
        rejected = False
        try:
            validate_structure(changed, original, calendars, manifest, original_manifest)
        except (AssertionError, KeyError, TypeError):
            rejected = True
        assert rejected, name
        negatives.append({"name": name, "rehashedBeforeSemanticCheck": True, "rejected": True})
    old_catalog_validator = Draft202012Validator(load(ROOT / "schemas/administrative-procedure-catalog-v3.schema.json"))
    old_manifest_validator = Draft202012Validator(load(ROOT / "schemas/release-manifest-v10.schema.json"))
    assert not old_catalog_validator.is_valid(candidate) and not old_manifest_validator.is_valid(manifest)
    for name, obj, version, validator in (
            ("catalog_v4_relabelled_v3", candidate, "3.0.0", old_catalog_validator),
            ("manifest_v11_relabelled_v10", manifest, "10.0.0", old_manifest_validator)):
        changed = copy.deepcopy(obj)
        changed["formatVersion"] = version
        changed["$schema"] = validator.schema["$id"]
        if "compatibility" in changed:
            changed["compatibility"]["minimumConsumerFormatVersion"] = version
        assert not validator.is_valid(changed)
        negatives.append({"name": name, "formalOldSchemaRejected": True, "actualOldReaderTest": False})
    reference_inputs = [
        Path(__file__), FIXTURE, ROOT / "docs/fachrecht/abnahme-ap23g1.md", receipt_path,
        BASE / "manifest.json", BASE / ADMIN, BUNDLE / "manifest.json", BUNDLE / ADMIN,
        ROOT / "schemas/calendar-rules-v3.schema.json", ROOT / "schemas/common.schema.json",
    ] + sorted(SCHEMAS.glob("*.json"))
    return {
        "status": "passedIndependentStructuralAndResearchComparison", "checkedOn": "2026-10-22",
        "method": "Python jsonschema, fixed independent legal expectations, canonical hashes and date enumeration with actual candidate parameters",
        "runtimeActive": False, "productImports": False, "productCapabilityTest": False,
        "exportTest": False, "releaseApproval": False,
        "jsonschemaVersion": importlib.metadata.version("jsonschema"), "schemaCount": len(validators),
        "actualCalendarFormat3SchemaChecks": len(calendars), "acceptedArchiveFilesVerified": archive_files,
        "counts": {"paths": 58, "newPaths": 16, "unchangedPathsAndPolicies": 42, "laws": 11,
                   "suspensionProfiles": 20, "holidayBindings": 13, "physicalCalendars": 33,
                   "artifacts": 42, "unchangedRawArtifacts": 41, "basisHolidayRules": 479,
                   "supplementalSoRules": 12, "nationalSocialRules": 44, "bernSocialBindings": 50},
        "referenceCases": len(results), "referenceOutcomes": counts,
        "schemaValidInputs": sum(r["inputSchemaValid"] for r in results),
        "contractQualifiedInputsBeforeDateAndWindowEvaluation": sum(r["qualified"] for r in results),
        "negativeStructuralTests": negatives, "results": results, "discrepancies": [],
        "inputs": [evidence(p) for p in reference_inputs],
        "limitations": [
            "G1 is human-accepted but G2 contract and future runtime activation still need separate decisions.",
            "Identical SH calendar bytes do not transfer ZPO legal permission to the administrative route.",
            "Negative cases exercise an isolated contract, not a current UI or export gate.",
            "Old-schema rejection is formal and is not presented as an executed old JavaScript reader test.",
            "Structural mutations are rehashed before independent semantic comparison."
        ]
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Write only this checker's own QA evidence")
    args = parser.parse_args()
    report = run()
    if args.write:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k not in ("results", "inputs")}, ensure_ascii=False, indent=2))
