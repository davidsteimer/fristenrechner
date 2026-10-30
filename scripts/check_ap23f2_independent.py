# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23F2 structural and research comparison.

Reads actual JSON bytes with Python standard modules and jsonschema. No JavaScript,
product reader, UI, release activation or export-capability proof is involved.
Only --write creates the generated QA report next to the local research evidence.
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
BASE = ROOT / "data/releases/2026-10-18-mvp-09-approved.1"
OUT = ROOT / "outputs/ap23f2-candidate-2026-10-22"
BUNDLE = OUT / "bundle"
SCHEMAS = ROOT / "schemas/candidates/ap23f2"
ADMIN = "administrative-procedures/ch-cantonal-administrative-procedures.json"
FIXTURE = ROOT / "docs/fachrecht/ap23f1/referenzfaelle.json"
ACCEPTANCE = ROOT / "docs/fachrecht/abnahme-ap23f1.md"
REPORT = ROOT / "outputs/ap23f2-2026-10-22/QA-AP23F2-INDEPENDENT.json"
BASE_MANIFEST_SHA = "3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265"
BASE_CATALOG_SHA = "dc38ce060ef46720b0a833efab54dc569f2ded4397fef9eaa7874b88a6927115"
ZH_RULE_IDS = {
    "ZH-RLG-ALL-DAY-" + suffix for suffix in (
        "NEW-YEAR", "GOOD-FRIDAY", "EASTER-MONDAY", "ASCENSION", "WHIT-MONDAY",
        "NATIONAL-DAY", "CHRISTMAS", "ST-STEPHEN", "MAY1")
}
WINDOW = {"from": "2026-08-29", "to": "2027-12-31"}


def load(path):
    return json.loads(path.read_bytes())


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical_hash(value):
    return sha(json.dumps(value, sort_keys=True, ensure_ascii=False,
                          separators=(",", ":")).encode("utf-8"))


def index(rows, key):
    result = {row[key]: row for row in rows}
    assert len(result) == len(rows), f"Duplicate {key}"
    return result


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
    return date(year + expression["yearOffset"], expression["month"], expression["day"])


def in_pause(day, profile):
    return any(period_date(p["start"], y) <= day <= period_date(p["end"], y)
               for y in (day.year - 1, day.year)
               for p in profile["periods"])


def calendar_dates(calendar, calendars, year):
    dates = set()
    for inherited in calendar["inherits"]:
        dates |= calendar_dates(calendars[inherited], calendars, year)
    for rule in calendar["rules"]:
        if rule["effect"]["type"] != "holiday":
            continue
        assert rule["condition"] == "always", rule["ruleId"]
        expr = rule["calculation"]
        if expr["type"] == "fixedMonthDay":
            day = date(year, expr["month"], expr["day"])
        elif expr["type"] == "easterOffsetDays":
            day = easter(year) + timedelta(days=expr["offsetDays"])
        else:
            assert expr["type"] == "nthWeekdayOfMonth", expr
            first = date(year, expr["month"], 1)
            shift = (expr["isoWeekday"] - first.isoweekday()) % 7
            day = first + timedelta(days=shift + 7 * (expr["occurrence"] - 1))
        assert rule["validity"]["from"] <= day.isoformat()
        assert rule["validity"]["to"] is None or rule["validity"]["to"] >= day.isoformat()
        dates.add(day)
    return dates


def expected_requirements(research):
    qual = research["qualification"]
    actions = {
        "generalFinalDecision": ("ordinaryAppeal", "finalDecision"),
        "orderedProceduralSubmission": ("proceduralSubmission", "notApplicable"),
        "qualifiedExecution83": ("executionAppeal", "qualifiedAGVRPG83ExecutionOrder"),
        "qualifiedAdministrativeMeasures44": ("measuresAppeal", "qualifiedSGVRP44MeasuresOrder"),
        "qualifiedInterim60": ("interimAppeal", "qualifiedSGVRP60InterimOrder"),
    }
    action, decision = actions[qual]
    court = research["stages"] == ["court"]
    vrk = research["stages"] == ["vrk"]
    return {
        "action": action, "decisionKind": decision, "unit": "day",
        "opening": "qualifiedCompleteActualDelivery", "notice": "uncontested",
        "termChange": "none", "urgency": "none",
        "targetBody": "administrativeAppealsCommission" if vrk else
                      "administrativeCourt" if court else "cantonAdministrativeAuthority",
        "procedureMatter": "documentAccess" if vrk else "generalAdministrative",
        "channelCase": "ordinaryNoFictionNoOutage" if research["canton"] == "ZH" else "notApplicable",
        "exceptionNotice": "correctExceptionNotice" if qual == "qualifiedInterim60" else "notApplicable",
    }


def expected_norm_sources(research, segment):
    prefix = "SRC-AP23F1-"
    canton = research["canton"]
    begin = segment["interval"]["from"]
    if canton == "ZH":
        names = {"ZH-VRG-20260701"}
        names |= {"ZH-GOG-20260101", "CH-ZPO-20260701"} if research["stages"] == ["court"] else {"ZH-RLG-20040701"}
        if begin >= "2027-01-01":
            names |= {"ZH-VRG-REVISION-20270101", "ZH-RRB715-2025"}
    elif canton == "AG":
        names = {"AG-VRPG-20240701", "CH-ZPO-20260701", "AG-EGZPO-20220101"}
    else:
        names = {"SG-VRP-20240101", "CH-ZPO-20260701", "SG-RLG-20080122"}
        names.add("SG-GERG-20270601" if begin >= "2027-06-01" else "SG-GERG-20180701")
        if research["stages"] == ["vrk"]:
            names.add("SG-OEFFG-20230701")
    return {prefix + name for name in names}


def validate_structure(catalog, old, research):
    paths = index(catalog["paths"], "pathId")
    policies = index(catalog["qualificationPolicies"], "pathId")
    entries = index(catalog["releaseBinding"]["pathEligibility"], "pathId")
    holidays = index(catalog["holidayBindings"], "holidayBindingId")
    profiles = index(catalog["suspensionProfiles"], "suspensionProfileId")
    sources = index(catalog["sources"], "sourceId")
    assert catalog["formatVersion"] == "3.0.0"
    assert catalog["contractStatus"] == "proposed" and catalog["runtimeActive"] is False
    assert catalog["releaseBinding"]["status"] == "candidate"
    assert catalog["releaseBinding"]["approval"] is None
    assert catalog["releaseBinding"]["releaseId"] is None
    assert set(paths) == set(policies) == set(entries)
    assert (len(catalog["laws"]), len(profiles), len(holidays), len(paths), len(policies)) == (8, 14, 9, 42, 42)
    for group, key in (("paths", "pathId"), ("qualificationPolicies", "pathId"),
                       ("laws", "lawId"), ("suspensionProfiles", "suspensionProfileId"),
                       ("holidayBindings", "holidayBindingId"), ("sources", "sourceId"),
                       ("excludedPaths", "exclusionId")):
        current = index(catalog[group], key)
        for previous in old[group]:
            assert canonical_hash(current[previous[key]]) == canonical_hash(previous), (group, previous[key])
    research_paths = {p["id"].lower(): p for p in research["paths"]}
    assert set(paths) == {p["pathId"] for p in old["paths"]} | set(research_paths)
    for ident, physical in {
        "zh-administration-authority-seat": "ap23f2-zh-rlg-nine",
        "zh-court-authority-seat": "ap22-zh-5aa2974cffee",
        "ag-authority-seat": "ap22-ag-21d6f2634ce0",
        "sg-authority-seat": "ap22-sg-79009d6d6021",
    }.items():
        assert holidays[ident]["physicalBaseline"]["calendarId"] == physical
    guard_count = 0
    for ident, r in research_paths.items():
        p, policy, entry = paths[ident], policies[ident], entries[ident]
        assert p["revision"] == policy["pathRevision"] == entry["pathRevision"] == 1
        assert p["researchRef"] == r["id"]
        assert p["stages"] == [{"vrk": "court", "recourse": "administrativeAppeal"}.get(x, x) for x in r["stages"]]
        assert policy["mode"] == "qualifiedDayProcedureV3"
        assert policy["requirements"] == expected_requirements(r)
        assert policy["pathSha256"] == canonical_hash(p)
        assert entry["pathSha256"] == canonical_hash(p)
        assert entry["qualificationPolicySha256"] == canonical_hash(policy)
        assert entry["holidayBindingSha256"] == canonical_hash(holidays[p["holidayBindingId"]])
        assert entry["suspensionProfileSha256"] == canonical_hash(profiles[p["suspensionProfileId"]])
        assert entry["status"] == "candidate" and entry["targetComponentRefs"] == []
        assert entry["sourceReviewRef"] is None and entry["referenceSuiteRef"] is None
        assert "normVersionCoverage" not in p["temporalBinding"]
        for field in ("caseCoverage", "calculationCoverage", "sourceCoverage"):
            assert p["temporalBinding"][field] == WINDOW
        spans = p["normTimeline"]
        expected_spans = ([{"from": "2026-08-29", "to": "2026-12-31"},
                           {"from": "2027-01-01", "to": "2027-12-31"}] if r["canton"] == "ZH" else
                          [{"from": "2026-08-29", "to": "2027-05-31"},
                           {"from": "2027-06-01", "to": "2027-12-31"}] if r["canton"] == "SG" else [WINDOW])
        assert [s["interval"] for s in spans] == expected_spans
        for span in spans:
            assert span["sourceRefs"]
            assert {ref["sourceId"] for ref in span["sourceRefs"]} == expected_norm_sources(r, span)
            for ref in span["sourceRefs"]:
                assert ref["sourceId"] in sources and ref["locator"].strip()
        union = set().union(*(expected_norm_sources(r, span) for span in spans))
        if ident == "ag-execution-10":
            union.add("SRC-AP23F1-AG-WBE2024299-20250331")
        assert {ref["sourceId"] for ref in p["sourceRefs"]} == union
        assert p["endShiftGuard"] == ("blockWhenEnteringApplicableSuspension" if r["suspension"] == "three" else "none")
        guard_count += p["endShiftGuard"] != "none"
        if r["days"] is not None:
            assert p["duration"] == {"kind": "statutoryDays", "value": r["days"], "overridable": False}
        else:
            assert p["duration"]["kind"] == "authorityOrderedDays"
            assert p["duration"]["minimum"] == 1 and p["duration"]["maximum"] == 365
        periods = profiles[p["suspensionProfileId"]]["periods"]
        for year in (2026, 2027):
            expected = [] if r["suspension"] == "none" else [
                (easter(year) - timedelta(days=7), easter(year) + timedelta(days=7)),
                (date(year, 7, 15), date(year, 8, 15)), (date(year, 12, 18), date(year+1, 1, 2))]
            assert sorted((period_date(x["start"], year), period_date(x["end"], year)) for x in periods) == sorted(expected)
    assert guard_count == 9
    return paths, holidays, profiles, policies


def case_boundary(case, research_path, path):
    """Evaluate the declared synthetic F1 facts, not a production input object."""
    facts = case.get("facts", {})
    declared_stage = facts.get("stage", research_path["stages"][0])
    if declared_stage not in research_path["stages"]:
        return "qualificationBoundaryProposed"
    conditions = (
        facts.get("qualification", research_path["qualification"]) == research_path["qualification"],
        facts.get("authorityLevel", "cantonal") == "cantonal",
        facts.get("holidayAnchor", "targetAuthoritySeat") == "targetAuthoritySeat",
        facts.get("opening", "completeLegalTriggerKnown") == "completeLegalTriggerKnown",
        facts.get("specialLaw", "excluded") == "excluded",
        facts.get("paymentOrMaterialPerformance", False) is False,
        facts.get("fixedEndDate", False) is False,
        facts.get("deviatingStart", False) is False,
        facts.get("termChange", "none") == "none",
        facts.get("unit", "day") == "day",
        facts.get("direction", "forward") == "forward",
        facts.get("notice", research_path.get("requiredNotice", "uncontested")) == research_path.get("requiredNotice", "uncontested"),
        research_path["canton"] != "ZH" or facts.get("zh2027ChannelCase", "ordinaryNoFictionNoOutage") == "ordinaryNoFictionNoOutage",
        "requiredSubject" not in research_path or facts.get("subject", research_path.get("requiredSubject")) == research_path["requiredSubject"],
    )
    days = case["days"]
    if not all(conditions) or not isinstance(days, int) or days < 1 or days > 365:
        return "qualificationBoundaryProposed"
    if path["duration"]["kind"] == "statutoryDays" and days != path["duration"]["value"]:
        return "qualificationBoundaryProposed"
    return None


def adapt_research_input(case, research_paths):
    """Map only explicit synthetic F1 declarations to the isolated V3 contract."""
    r = research_paths.get(case["path"], next(iter(research_paths.values())))
    f = case.get("facts", {})
    req = expected_requirements(r)
    raw_notice = f.get("notice", r.get("requiredNotice", "uncontested"))
    actual_notice = "uncontested" if raw_notice == "qualifiedCorrectExceptionNotice" else raw_notice
    action, decision = req["action"], req["decisionKind"]
    if f.get("qualification", r["qualification"]) != r["qualification"]:
        action, decision = "unknown", "unknown"
    if f.get("paymentOrMaterialPerformance", False):
        action, decision = "payment", "paymentReminder"
    raw_opening = f.get("opening", "completeLegalTriggerKnown")
    opening = {"completeLegalTriggerKnown": "qualifiedCompleteActualDelivery",
               "electronicFictionUnresolved": "fiction"}.get(raw_opening, raw_opening)
    raw_stage = f.get("stage", r["stages"][0])
    stage = {"vrk": "court", "recourse": "administrativeAppeal"}.get(raw_stage, raw_stage)
    matter = req["procedureMatter"]
    if "subject" in f and f["subject"] != r.get("requiredSubject"):
        matter = "priorRequestForFormalDecisionOeffG17" if f["subject"] == "priorRequestForFormalDecisionOeffG17" else "other"
    item = {
        "path": case["path"].lower(), "pathRevision": 1, "stage": stage,
        "authoritySeatCanton": r["canton"], "trigger": case["trigger"], "days": case["days"],
        "unit": f.get("unit", "day"), "direction": f.get("direction", "forward"),
        "action": action, "decisionKind": decision, "opening": opening, "notice": actual_notice,
        "specialLaw": {"taxProcedure": "tax"}.get(f.get("specialLaw", "excluded"), f.get("specialLaw", "excluded")),
        "authorityLevel": f.get("authorityLevel", "cantonal"),
        "holidayAnchor": "qualifiedTargetAuthority" if f.get("holidayAnchor", "targetAuthoritySeat") == "targetAuthoritySeat" else "party",
        "explicitHolidayException": "none", "urgency": "none",
        "fixedEndDate": f.get("fixedEndDate", False), "deviatingStart": f.get("deviatingStart", False),
        "termChange": {"restored": "reinstatement"}.get(f.get("termChange", "none"), f.get("termChange", "none")),
        "targetBody": req["targetBody"], "procedureMatter": matter,
        "channelCase": f.get("zh2027ChannelCase", req["channelCase"]) if r["canton"] == "ZH" else "notApplicable",
        "exceptionNotice": "correctExceptionNotice" if raw_notice == "qualifiedCorrectExceptionNotice" else
                           (raw_notice if req["exceptionNotice"] == "correctExceptionNotice" else "notApplicable"),
    }
    return item


def isolated_input_qualified(item, validator, paths, policies, laws):
    if not validator.is_valid(item) or item["path"] not in paths:
        return False
    path, policy = paths[item["path"]], policies[item["path"]]
    if item["pathRevision"] != path["revision"] or item["stage"] not in path["stages"]:
        return False
    if item["authoritySeatCanton"] != laws[path["lawId"]]["canton"]:
        return False
    if any(item[key] != expected for key, expected in policy["requirements"].items()):
        return False
    if item["authorityLevel"] != "cantonal" or item["holidayAnchor"] != "qualifiedTargetAuthority":
        return False
    if item["specialLaw"] != "excluded" or item["explicitHolidayException"] != "none":
        return False
    if item["direction"] != "forward" or item["fixedEndDate"] or item["deviatingStart"]:
        return False
    duration = path["duration"]
    return (item["days"] == duration["value"] if duration["kind"] == "statutoryDays"
            else duration["minimum"] <= item["days"] <= duration["maximum"])


def rebind_mutation(catalog):
    """Rehash declared objects, so mutation rejection is not just a stale hash."""
    paths = index(catalog["paths"], "pathId")
    policies = index(catalog["qualificationPolicies"], "pathId")
    holidays = index(catalog["holidayBindings"], "holidayBindingId")
    profiles = index(catalog["suspensionProfiles"], "suspensionProfileId")
    for ident, policy in policies.items():
        policy["pathSha256"] = canonical_hash(paths[ident])
    for entry in catalog["releaseBinding"]["pathEligibility"]:
        path = paths[entry["pathId"]]
        entry["pathSha256"] = canonical_hash(path)
        entry["qualificationPolicySha256"] = canonical_hash(policies[entry["pathId"]])
        entry["holidayBindingSha256"] = canonical_hash(holidays[path["holidayBindingId"]])
        entry["suspensionProfileSha256"] = canonical_hash(profiles[path["suspensionProfileId"]])


def calculate_case(case, research_paths, paths, bindings, profiles, calendars):
    if case["path"] not in research_paths:
        return {"outcome": "qualificationBoundaryProposed"}
    r = research_paths[case["path"]]
    p = paths[case["path"].lower()]
    boundary = case_boundary(case, r, p)
    if boundary:
        return {"outcome": boundary}
    current = date.fromisoformat(case["trigger"])
    end_limit = date.fromisoformat(WINDOW["to"])
    if not WINDOW["from"] <= current.isoformat() <= WINDOW["to"]:
        return {"outcome": "researchWindowBoundary"}
    profile = profiles[p["suspensionProfileId"]]
    binding = bindings[p["holidayBindingId"]]
    calendar = calendars[binding["physicalBaseline"]["calendarId"]]
    remaining, skipped, first_counted = case["days"], 0, None
    while remaining:
        current += timedelta(days=1)
        if current > end_limit:
            return {"outcome": "researchWindowBoundary"}
        if in_pause(current, profile):
            skipped += 1
        else:
            first_counted = first_counted or current
            remaining -= 1
    nominal = current
    crossed = False
    while current.weekday() >= 5 or current in calendar_dates(calendar, calendars, current.year):
        current += timedelta(days=1)
        if current > end_limit:
            return {"outcome": "researchWindowBoundary"}
        crossed = crossed or in_pause(current, profile)
    if crossed:
        assert p["endShiftGuard"] == "blockWhenEnteringApplicableSuspension"
        return {"outcome": "unresolvedBoundaryProposed", "nominalEnd": nominal.isoformat(), "ordinaryShiftEnd": current.isoformat()}
    return {"outcome": "datedResearchValue", "end": current.isoformat(), "firstCountedDay": first_counted.isoformat(),
            "nominalEnd": nominal.isoformat(), "skippedDays": skipped}


def run():
    assert sha((BASE / "manifest.json").read_bytes()) == BASE_MANIFEST_SHA
    assert sha((BASE / ADMIN).read_bytes()) == BASE_CATALOG_SHA
    research, original, original_manifest = load(FIXTURE), load(BASE / ADMIN), load(BASE / "manifest.json")
    candidate, manifest = load(BUNDLE / ADMIN), load(BUNDLE / "manifest.json")
    assert ACCEPTANCE.exists(), "Human F1 acceptance evidence missing"
    validators = {}
    for path in sorted(SCHEMAS.glob("*.json")):
        schema = load(path)
        Draft202012Validator.check_schema(schema)
        validators[path.name] = Draft202012Validator(schema, format_checker=FormatChecker())
    catalog_validator = validators["administrative-procedure-catalog-v3.schema.json"]
    catalog_validator.validate(candidate)
    validators["local-reference-manifest-v10.schema.json"].validate(manifest)
    old_catalog_validator = Draft202012Validator(load(ROOT / "schemas/administrative-procedure-catalog-v2.schema.json"))
    old_manifest_validator = Draft202012Validator(load(ROOT / "schemas/release-manifest-v9.schema.json"))
    assert not old_catalog_validator.is_valid(candidate)
    assert not old_manifest_validator.is_valid(manifest)
    assert manifest["formatVersion"] == manifest["compatibility"]["minimumConsumerFormatVersion"] == "10.0.0"
    assert manifest["releaseStatus"] == "candidate"
    paths, bindings, profiles, policies = validate_structure(candidate, original, research)
    original_descriptors = index(original_manifest["artifacts"], "path")
    descriptors = index(manifest["artifacts"], "path")
    assert len(descriptors) == 42
    assert len([d for d in descriptors.values() if d["role"] == "calendar"]) == 33
    assert set(descriptors) == set(original_descriptors) | {"calendars/ap23f2-zh-rlg-nine.json"}
    raw_unchanged = 0
    calendars = {}
    # Resolve all references from the local schema inventory, without HTTP retrieval.
    schema_resources = [load(p) for p in sorted((ROOT / "schemas").glob("*.schema.json"))]
    registry = Registry().with_resources((s["$id"], Resource.from_contents(s)) for s in schema_resources)
    calendar_validator = Draft202012Validator(load(ROOT / "schemas/calendar-rules-v3.schema.json"),
                                            format_checker=FormatChecker(), registry=registry)
    for rel, d in descriptors.items():
        raw = (BUNDLE / rel).read_bytes()
        assert len(raw) == d["byteLength"] and sha(raw) == d["sha256"], rel
        if rel in original_descriptors and rel != ADMIN:
            assert raw == (BASE / rel).read_bytes(), rel
            assert d == original_descriptors[rel], rel
            raw_unchanged += 1
        if d["role"] == "calendar":
            cal = json.loads(raw)
            calendar_validator.validate(cal)
            calendars[cal["calendarId"]] = cal
    assert raw_unchanged == 40
    assert {p.relative_to(BUNDLE).as_posix() for p in BUNDLE.rglob("*") if p.is_file()} == set(descriptors) | {"manifest.json"}
    h = load(BUNDLE / "holiday-catalogs/ch-holiday-catalog.json")
    assert len(h["data"]["rules"]) == 479 and len(h["activation"]["supplementalRules"]) == 12
    assert len(h["activation"]["projections"]) == 32
    social = load(BUNDLE / "social-procedures/ch-social-procedures.json")
    assert len(social["federalRules"]) == 44 and len(social["cantonalBindings"]) == 50
    assert len(calendars["ap23f2-zh-rlg-nine"]["rules"]) == 9
    assert len(calendars["ap22-zh-5aa2974cffee"]["rules"]) == 10
    assert len(calendars["ap22-ag-21d6f2634ce0"]["rules"]) == 14
    assert len(calendars["ap22-sg-79009d6d6021"]["rules"]) == 12
    zh_binding = bindings["zh-administration-authority-seat"]
    projection_evidence = zh_binding["projectionEvidence"]
    assert projection_evidence["kind"] == "localStructuralProjection"
    assert projection_evidence["sourceReleaseId"] == original_manifest["releaseId"]
    assert projection_evidence["sourceCatalogSha256"] == sha((BASE / "holiday-catalogs/ch-holiday-catalog.json").read_bytes())
    assert set(projection_evidence["selectedRuleIds"]) == ZH_RULE_IDS
    assert bindings["zh-court-authority-seat"]["physicalBaseline"]["calendarId"] == "ap22-zh-5aa2974cffee"
    assert bindings["ag-authority-seat"]["physicalBaseline"]["calendarId"] == "ap22-ag-21d6f2634ce0"
    assert bindings["sg-authority-seat"]["physicalBaseline"]["calendarId"] == "ap22-sg-79009d6d6021"
    for year in (2026, 2027):
        zh_dates = calendar_dates(calendars["ap23f2-zh-rlg-nine"], calendars, year)
        expected_zh = {date(year, m, d) for m, d in ((1, 1), (5, 1), (8, 1), (12, 25), (12, 26))}
        expected_zh |= {easter(year) + timedelta(days=n) for n in (-2, 1, 39, 50)}
        assert zh_dates == expected_zh
        sg_dates = calendar_dates(calendars["ap22-sg-79009d6d6021"], calendars, year)
        assert date(year, 1, 2) not in sg_dates
        assert date(year, 1, 2) in calendar_dates(calendars["ap22-zh-5aa2974cffee"], calendars, year)
    research_paths = index(research["paths"], "id")
    laws = index(candidate["laws"], "lawId")
    input_validator = validators["administrative-input-v3.schema.json"]
    results = []
    for case in research["cases"]:
        item = adapt_research_input(case, research_paths)
        schema_valid = input_validator.is_valid(item)
        qualified = isolated_input_qualified(item, input_validator, paths, policies, laws)
        assert qualified == (case["expected"]["outcome"] != "qualificationBoundaryProposed"), case["id"]
        actual = calculate_case(case, research_paths, paths, bindings, profiles, calendars)
        for key, expected in case["expected"].items():
            if key == "reason":
                continue  # Research labels are not a production error-code contract.
            assert actual.get(key) == expected, (case["id"], key, actual, expected)
        results.append({"id": case["id"], "outcome": actual["outcome"], "actual": actual,
                        "inputSchemaValid": schema_valid, "isolatedContractQualified": qualified})
    counts = dict(Counter(r["outcome"] for r in results))
    assert counts == {"datedResearchValue": 52, "unresolvedBoundaryProposed": 3,
                      "qualificationBoundaryProposed": 20, "researchWindowBoundary": 5}
    negatives = []
    for name, change in (
        ("missing_zh_2027_norm_interval", lambda x: index(x["paths"], "pathId")["zh-rekurs-30"]["normTimeline"].pop()),
        ("ag_execution_cannot_use_ar_decision_kind", lambda x: index(x["qualificationPolicies"], "pathId")["ag-execution-10"]["requirements"].__setitem__("decisionKind", "qualifiedVRPGArt63Order")),
        ("sg_exception_notice_required", lambda x: index(x["qualificationPolicies"], "pathId")["sg-court-interim-5"]["requirements"].__setitem__("exceptionNotice", "notApplicable")),
        ("sg_cannot_import_zpo_jan2_projection", lambda x: index(x["holidayBindings"], "holidayBindingId")["sg-authority-seat"]["physicalBaseline"].__setitem__("calendarId", "ap22-sg-f95068e3b162")),
        ("zh_admin_cannot_invent_zpo_reference", lambda x: index(x["paths"], "pathId")["zh-rekurs-30"]["normTimeline"][0]["sourceRefs"].append({"sourceId": "SRC-AP23F1-CH-ZPO-20260701", "locator": "Art. 142"})),
        ("ag_timeline_requires_egzpo_source", lambda x: index(x["paths"], "pathId")["ag-admin-30"]["normTimeline"][0].__setitem__("sourceRefs", [r for r in index(x["paths"], "pathId")["ag-admin-30"]["normTimeline"][0]["sourceRefs"] if r["sourceId"] != "SRC-AP23F1-AG-EGZPO-20220101"])),
        ("sg_future_gerg_cannot_replace_current_segment", lambda x: index(x["paths"], "pathId")["sg-court-14"]["normTimeline"][0].__setitem__("sourceRefs", [{**r, "sourceId": "SRC-AP23F1-SG-GERG-20270601"} if r["sourceId"] == "SRC-AP23F1-SG-GERG-20180701" else r for r in index(x["paths"], "pathId")["sg-court-14"]["normTimeline"][0]["sourceRefs"]])),
    ):
        mutated = copy.deepcopy(candidate)
        change(mutated)
        rebind_mutation(mutated)
        rejected = False
        try:
            validate_structure(mutated, original, research)
            assert index(mutated["holidayBindings"], "holidayBindingId")["sg-authority-seat"]["physicalBaseline"]["calendarId"] == "ap22-sg-79009d6d6021"
        except (AssertionError, KeyError):
            rejected = True
        assert rejected, name
        negatives.append(name)
    relabeled_catalog = copy.deepcopy(candidate)
    relabeled_catalog["formatVersion"] = "2.0.0"
    assert not old_catalog_validator.is_valid(relabeled_catalog)
    negatives.append("v3_payload_relabelled_v2_rejected")
    relabeled_manifest = copy.deepcopy(manifest)
    relabeled_manifest["formatVersion"] = "9.0.0"
    relabeled_manifest["compatibility"]["minimumConsumerFormatVersion"] = "9.0.0"
    assert not old_manifest_validator.is_valid(relabeled_manifest)
    negatives.append("v10_manifest_relabelled_v9_rejected")
    return {
        "status": "passedIndependentStructuralAndResearchComparison", "checkedOn": "2026-10-22",
        "method": "Python jsonschema, canonical hashes and separate datetime arithmetic, no JavaScript or product imports",
        "runtimeActive": False, "productCapabilityTest": False, "exportTest": False, "releaseApproval": False,
        "jsonschemaVersion": importlib.metadata.version("jsonschema"), "schemaCount": len(validators),
        "actualCalendarFormat3SchemaChecks": len(calendars),
        "counts": {"paths": 42, "newPaths": 17, "unchangedPathsAndPolicies": 25,
                   "laws": 8, "suspensionProfiles": 14, "holidayBindings": 9, "physicalCalendars": 33,
                   "artifacts": 42, "unchangedRawArtifacts": raw_unchanged, "basisHolidayRules": 479,
                   "supplementalSoRules": 12, "nationalSocialRules": 44, "bernSocialBindings": 50},
        "referenceCases": len(results), "referenceOutcomes": counts, "negativeStructuralTests": negatives,
        "isolatedInputContractChecks": len(results),
        "schemaValidInputs": sum(r["inputSchemaValid"] for r in results),
        "contractQualifiedInputsBeforeDateAndWindowEvaluation": sum(r["isolatedContractQualified"] for r in results),
        "discrepancies": [], "results": results,
        "inputs": [evidence(p) for p in (Path(__file__), FIXTURE, ACCEPTANCE, BASE / "manifest.json", BASE / ADMIN,
                                         BUNDLE / "manifest.json", BUNDLE / ADMIN,
                                         ROOT / "schemas/calendar-rules-v3.schema.json",
                                         ROOT / "schemas/common.schema.json")]
                  + [evidence(p) for p in sorted(SCHEMAS.glob("*.json"))],
        "limitations": [
            "The new ZH projection is a local structural proposal, absent from the unchanged baseline activation projections.",
            "F1 negative cases test isolated declared research qualification, not an implemented product guard.",
            "Targeted mutated structures are rehashed before semantic rejection is checked.",
            "Successful structural comparison does not approve a source release, installation, UI, export capability or operation.",
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Write only the generated local QA report")
    args = parser.parse_args()
    report = run()
    if args.write:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: v for k, v in report.items() if k not in ("results", "inputs")}, ensure_ascii=False, indent=2))
