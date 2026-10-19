#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23E1 research check, without JavaScript or product imports.

The legal calendar and path rules below are specified independently of the
fixture. Only its case inputs, expected outputs and byte-bound physical calendar
files are read. This is not a product test, legal approval or activation.
"""

import argparse
import calendar
from datetime import date, timedelta
import hashlib
import json
from pathlib import Path
import platform
import re


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests/golden/candidates/ap23e1-administrative.json"
REPORT = ROOT / "outputs/ap23e1-2026-10-18/QA-AP23E1-INDEPENDENT.json"
DAY = timedelta(days=1)
UPPER = date(2027, 12, 31)
# Canton, action, stages, fixed days or None, suspension.
PATHS = {
    "LU-ADMIN-30": ("LU", "ordinaryAppeal", ("administrativeAppeal",), 30, "none"),
    "LU-COURT-30": ("LU", "ordinaryAppeal", ("court",), 30, "none"),
    "LU-ADMIN-ORDERED": ("LU", "proceduralSubmission", ("administration", "administrativeAppeal"), None, "none"),
    "LU-COURT-ORDERED": ("LU", "proceduralSubmission", ("court",), None, "none"),
    "ZG-ADMIN-20": ("ZG", "ordinaryAppeal", ("administrativeAppeal",), 20, "none"),
    "ZG-COURT-30": ("ZG", "ordinaryAppeal", ("court",), 30, "none"),
    "ZG-ADMIN-ORDERED": ("ZG", "proceduralSubmission", ("administration", "administrativeAppeal"), None, "none"),
    "ZG-COURT-ORDERED": ("ZG", "proceduralSubmission", ("court",), None, "none"),
    "AR-ADMIN-20": ("AR", "ordinaryAppeal", ("administrativeAppeal",), 20, "none"),
    "AR-EXECUTION-5": ("AR", "executionAppeal", ("administrativeAppeal",), 5, "none"),
    "AR-ADMIN-ORDERED": ("AR", "proceduralSubmission", ("administration", "administrativeAppeal"), None, "none"),
    "AR-COURT-30": ("AR", "ordinaryAppeal", ("court",), 30, "three"),
    "AR-COURT-ORDERED": ("AR", "proceduralSubmission", ("court",), None, "three"),
}


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def easter(year):
    """Gregorian computus, independent of the fixture's Easter lookup table."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month, zero_based_day = divmod(h + l - 7 * m + 114, 31)
    return date(year, month, zero_based_day + 1)


def holidays(canton, year):
    if canton == "AR":
        fixed = [(1, 1), (8, 1), (12, 25)]
        offsets = [-2, 1, 39, 50]
    elif canton in ("LU", "ZG"):
        fixed = [(1, 1), (1, 2), (8, 1), (8, 15), (11, 1), (12, 8), (12, 25), (12, 26)]
        offsets = [-2, 1, 39, 50, 60]
    else:
        raise ValueError(f"Unreviewed canton {canton}")
    days = {date(year, month, day) for month, day in fixed}
    days.update(easter(year) + offset * DAY for offset in offsets)
    # AR excludes 26 December if Christmas falls on Monday or Friday.
    if canton == "AR" and date(year, 12, 25).weekday() not in (0, 4):
        days.add(date(year, 12, 26))
    return days


def suspended(day, mode):
    if mode == "none":
        return False
    assert mode == "three"
    return (
        (day.month == 12 and day.day >= 18)
        or (day.month == 1 and day.day <= 2)
        or date(day.year, 7, 15) <= day <= date(day.year, 8, 15)
        or easter(day.year) - 7 * DAY <= day <= easter(day.year) + 7 * DAY
    )


def blocked(reason):
    return {"outcome": "blocked", "reason": reason, "exportAllowed": False}


def parse_date(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def evaluate(facts):
    path = PATHS.get(facts.get("path"))
    if path is None:
        return blocked("unknownPath")
    canton, action, stages, prescribed_days, mode = path
    trigger = parse_date(facts.get("trigger"))
    if trigger is None:
        return blocked("invalidDate")
    qualifications = [
        (facts.get("unit") == "day", "unsupportedUnit"),
        (facts.get("action") == action, "actionDoesNotMatchPath"),
        (action != "ordinaryAppeal" or facts.get("decisionKind") == "finalDecision", "decisionOutsideScope"),
        (action != "executionAppeal" or facts.get("decisionKind") == "qualifiedVRPGArt63Order", "executionOrderNotQualified"),
        (facts.get("stage") in stages, "stageDoesNotMatchPath"),
        (facts.get("authorityLevel") == "cantonal", "authorityOutsideScope"),
        (facts.get("holidayAnchor") == "qualifiedTargetAuthority", "holidayAnchorNotQualified"),
        (facts.get("opening") == "qualifiedCompleteActualDelivery", "openingNotQualified"),
        (facts.get("notice") == "uncontested", "noticeNeedsIndividualReview"),
        (facts.get("specialLaw") == "excluded", "specialLawNotExcluded"),
        (facts.get("urgency") == "none", "shortenedOrSpecialPeriod"),
        (facts.get("fixedEndDate") is False and facts.get("deviatingStart") is False, "fixedDateOrDeviatingStart"),
        (facts.get("termChange") == "none", "termChangeNeedsIndividualReview"),
    ]
    for permitted, reason in qualifications:
        if not permitted:
            return blocked(reason)
    days = facts.get("days")
    if type(days) is not int or not 1 <= days <= 365:
        return blocked("invalidDays")
    if prescribed_days is not None and days != prescribed_days:
        return blocked("statutoryDurationMismatch")
    lower = date(2026, 9, 27) if canton == "LU" else date(2026, 8, 29)
    if not lower <= trigger <= UPPER:
        return blocked("outsideReferenceRange")
    cursor = trigger
    counted = skipped = 0
    first = None
    while counted < days:
        cursor += DAY
        if cursor > UPPER:
            return blocked("outsideReferenceRange")
        if suspended(cursor, mode):
            skipped += 1
        else:
            first = cursor if first is None else first
            counted += 1
    nominal_end = cursor
    while cursor.weekday() >= 5 or cursor in holidays(canton, cursor.year):
        cursor += DAY
        if cursor > UPPER:
            return blocked("outsideReferenceRange")
    if cursor != nominal_end and suspended(cursor, mode):
        return blocked("AR-O1-endShiftIntoSuspension")
    return {
        "outcome": "reference",
        "ordinaryStart": (trigger + DAY).isoformat(),
        "firstCountedDay": first.isoformat(),
        "nominalEnd": nominal_end.isoformat(),
        "end": cursor.isoformat(),
        "skippedDays": skipped,
        "endShiftDays": (cursor - nominal_end).days,
        "exportAllowed": False,
    }


def physical_rule_day(rule, year):
    expression = rule["calculation"]
    kind = expression["type"]
    if kind == "fixedMonthDay":
        result = date(year, expression["month"], expression["day"])
    elif kind == "easterOffsetDays":
        result = easter(year) + expression["offsetDays"] * DAY
    elif kind == "nthWeekdayOfMonth":
        weeks = calendar.Calendar().monthdatescalendar(year, expression["month"])
        matches = [week[expression["isoWeekday"] - 1] for week in weeks
                   if week[expression["isoWeekday"] - 1].month == expression["month"]]
        result = matches[expression["occurrence"] - 1]
    else:
        raise ValueError(f"Unreviewed physical expression {kind}")
    assert rule["condition"] in ("always", "unlessTuesdayOrSaturday")
    if rule["condition"] == "unlessTuesdayOrSaturday" and result.weekday() in (1, 5):
        return None
    return result


def run():
    raw = FIXTURE.read_bytes()
    suite = json.loads(raw)
    assert suite["formatVersion"] == "ap23e1-research-1"
    assert suite["status"] == "draft" and suite["runtimeActive"] is False
    assert suite["referenceRange"]["to"] == UPPER.isoformat()
    assert len(suite["paths"]) == len(PATHS) == len({p["id"] for p in suite["paths"]})
    assert len(suite["cases"]) == len({c["id"] for c in suite["cases"]})
    for path in suite["paths"]:
        expected = PATHS[path["id"]]
        actual = (path["canton"], path["action"], tuple(path["stages"]), path["days"], path["suspension"])
        assert actual == expected, (path["id"], actual, expected)
        assert path["from"] == ("2026-09-27" if path["canton"] == "LU" else "2026-08-29")
    for year, expected in suite["easter"].items():
        assert easter(int(year)).isoformat() == expected, year
    results = []
    for case in suite["cases"]:
        result = evaluate(suite["sharedFacts"] | case["input"])
        for key, expected in case["expected"].items():
            assert result.get(key) == expected, (case["id"], key, result.get(key), expected)
        assert result["exportAllowed"] is False
        if result["outcome"] == "blocked":
            assert "end" not in result
        results.append({"id": case["id"], **result})

    # Own qualification probes, evaluated without running the JS checker.
    base = suite["sharedFacts"] | suite["cases"][0]["input"]
    mutations = [
        ({"path": "unknown"}, "unknownPath"),
        ({"trigger": "2027-02-30"}, "invalidDate"),
        ({"unit": "hour"}, "unsupportedUnit"),
        ({"action": "reasonRequest"}, "actionDoesNotMatchPath"),
        ({"decisionKind": "interimDecision"}, "decisionOutsideScope"),
        ({"stage": "court"}, "stageDoesNotMatchPath"),
        ({"authorityLevel": "municipal"}, "authorityOutsideScope"),
        ({"holidayAnchor": "party"}, "holidayAnchorNotQualified"),
        ({"opening": "fiction"}, "openingNotQualified"),
        ({"notice": "unknown"}, "noticeNeedsIndividualReview"),
        ({"specialLaw": "unknown"}, "specialLawNotExcluded"),
        ({"urgency": "shortened"}, "shortenedOrSpecialPeriod"),
        ({"fixedEndDate": True}, "fixedDateOrDeviatingStart"),
        ({"deviatingStart": True}, "fixedDateOrDeviatingStart"),
        ({"termChange": "extension"}, "termChangeNeedsIndividualReview"),
        ({"days": 0}, "invalidDays"),
        ({"days": 366}, "invalidDays"),
        ({"days": 1.5}, "invalidDays"),
        ({"days": 29}, "statutoryDurationMismatch"),
        ({"trigger": "2026-09-26"}, "outsideReferenceRange"),
    ]
    for change, reason in mutations:
        assert evaluate(base | change) == blocked(reason), change

    comparisons = 0
    physical_evidence = []
    physical_calendars = {}
    for canton, spec in suite["calendars"].items():
        physical_bytes = (ROOT / spec["physical"]["path"]).read_bytes()
        assert sha256(physical_bytes) == spec["physical"]["sha256"]
        physical = json.loads(physical_bytes)
        assert physical["jurisdiction"]["code"] == canton
        physical_calendars[canton] = physical
        # This check compares the explicitly bound local rules. All three
        # projections already include 1 August. No inherited holiday is added.
        for year in (2026, 2027):
            physical_days = {physical_rule_day(rule, year) for rule in physical["rules"]}
            assert date(year, 8, 1) in physical_days
            legal_days = holidays(canton, year)
            day = date(year, 1, 1)
            while day.year == year:
                actual = day.weekday() >= 5 or day in physical_days
                expected = day.weekday() >= 5 or day in legal_days
                assert actual == expected, (canton, day.isoformat())
                comparisons += 1
                day += DAY
        physical_evidence.append({"canton": canton, **spec["physical"], "hashMatches": True})
    for probe in suite["calendarProbes"]:
        day = date.fromisoformat(probe["date"])
        assert (day in holidays(probe["canton"], day.year)) == probe["isHoliday"], probe
        physical_days = {physical_rule_day(rule, day.year) for rule in physical_calendars[probe["canton"]]["rules"]}
        assert (day in physical_days) == probe["isHoliday"], ("physical", probe)
    return {
        "status": "passed",
        "runtimeActive": False,
        "productIntegrationTest": False,
        "independentImplementation": "Python datetime, separate Gregorian computus, independent path qualifications and legal holiday lists. No JS or product imports.",
        "fixtureSha256": sha256(raw),
        "checkerSha256": sha256(Path(__file__).read_bytes()),
        "pythonVersion": platform.python_version(),
        "paths": len(PATHS),
        "referenceCases": len(results),
        "datedCases": sum(r["outcome"] == "reference" for r in results),
        "blockedCases": sum(r["outcome"] == "blocked" for r in results),
        "negativeMutations": len(mutations),
        "calendarDayComparisons": comparisons,
        "calendarProbes": len(suite["calendarProbes"]),
        "physicalCalendarProbes": len(suite["calendarProbes"]),
        "independentEasterComparisons": len(suite["easter"]),
        "physicalCalendars": physical_evidence,
        "results": results,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Write only the dedicated independent QA report")
    arguments = parser.parse_args()
    result = run()
    if arguments.write:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in result.items() if key != "results"}, ensure_ascii=False, indent=2))
