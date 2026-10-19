# SPDX-License-Identifier: AGPL-3.0-only
"""Independent AP23E2 structural review. No JavaScript or product-code imports.

Uses Python jsonschema and hashlib against actual candidate bytes. It does not
create a release capability, perform a browser migration, or re-approve law.
"""
import argparse
import copy
import hashlib
import importlib.metadata
import json
from datetime import date, timedelta
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import ValidationError


ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "data/releases/2026-10-15-mvp-08-approved.1"
BUNDLE = ROOT / "outputs/ap23e2-candidate-2026-10-18/bundle"
SCHEMAS = ROOT / "schemas/candidates/ap23e2"
ADMIN = "administrative-procedures/ch-cantonal-administrative-procedures.json"
RESEARCH = ROOT / "tests/golden/candidates/ap23e1-administrative.json"
RESEARCH_HASH = "769e9c7db0d63b768909a5042bd1446b708f5e0ed6be7bb92abe7f33669d7ddb"
BASE_MANIFEST_HASH = "2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4"
BASE_CATALOG_HASH = "2f434968628c951a2e15eb62c5f3e0d5d906fa476b1c66387076a3e9727ce3f7"


def digest(value):
    return hashlib.sha256(value).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def object_hash(value):
    # All contract keys are ASCII and numeric values integers. For this closed
    # input domain this equals the recursively sorted ECMAScript encoding.
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True,
                             separators=(",", ":")).encode("utf-8"))


def indexed(rows, key):
    result = {row[key]: row for row in rows}
    assert len(result) == len(rows), f"duplicate {key}"
    return result


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


def validate_catalog(catalog, old, research, original_manifest, validator):
    validator.validate(catalog)
    assert catalog["formatVersion"] == "2.0.0"
    assert catalog["contractStatus"] == "proposed" and catalog["runtimeActive"] is False
    assert catalog["contractDecision"] == {"id": "DEC-2026-033", "status": "proposed", "on": None}
    release = catalog["releaseBinding"]
    assert release["status"] == "candidate"
    for field in ("releaseId", "approval", "sourceReviewRef", "referenceSuiteRef"):
        assert release[field] is None
    assert release["targetComponentRefs"] == []
    sources = indexed(catalog["sources"], "sourceId")
    laws = indexed(catalog["laws"], "lawId")
    profiles = indexed(catalog["suspensionProfiles"], "suspensionProfileId")
    holidays = indexed(catalog["holidayBindings"], "holidayBindingId")
    paths = indexed(catalog["paths"], "pathId")
    policies = indexed(catalog["qualificationPolicies"], "pathId")
    entries = indexed(release["pathEligibility"], "pathId")
    original_paths = indexed(old["paths"], "pathId")
    research_paths = {row["id"].lower(): row for row in research["paths"]}
    assert len(original_paths) == 12 and len(research_paths) == 13
    assert set(paths) == set(policies) == set(entries) == set(original_paths) | set(research_paths)
    assert (len(laws), len(profiles), len(holidays)) == (5, 8, 5)
    for group, key in (("sources", "sourceId"), ("laws", "lawId"),
                       ("suspensionProfiles", "suspensionProfileId"), ("excludedPaths", "exclusionId")):
        present = indexed(catalog[group], key)
        for original in old[group]:
            assert present[original[key]] == original, f"changed original {group}"

    def refs(rows):
        assert rows
        assert len({(row["sourceId"], row["locator"]) for row in rows}) == len(rows)
        for row in rows:
            assert row["sourceId"] in sources and row["locator"].strip()

    for law in laws.values():
        refs(law["sourceRefs"])
        refs(law["holidayPolicyReview"]["sourceRefs"])
    for profile in profiles.values():
        refs(profile["sourceRefs"])
        assert profile["lawId"] in laws
        indexed(profile["periods"], "periodId")
        for year in (2026, 2027):
            spans = sorted((period_date(p["start"], year), period_date(p["end"], year))
                           for p in profile["periods"])
            for begin, end in spans:
                assert begin <= end and (end - begin).days < 366
            for left, right in zip(spans, spans[1:]):
                assert left[1] < right[0]

    descriptors = indexed(original_manifest["artifacts"], "contentId")
    for binding in holidays.values():
        refs(binding["legalBinding"]["sourceRefs"])
        assert laws[binding["lawId"]]["canton"] == binding["authoritySeatCanton"]
        physical = binding["physicalBaseline"]
        assert physical["releaseId"] == original_manifest["releaseId"]
        expected_ids = {physical["calendarId"], "ch-federal-calendar", "ch-holiday-catalog"}
        assert set(indexed(physical["references"], "contentId")) == expected_ids
        for ref in physical["references"]:
            assert ref == {key: descriptors[ref["contentId"]][key]
                           for key in ("role", "contentId", "sha256", "path")}
        original = next((item for item in old["holidayBindings"]
                         if item["holidayBindingId"] == binding["holidayBindingId"]), None)
        if original:
            assert {k: v for k, v in binding.items() if k != "physicalBaseline"} == {
                k: v for k, v in original.items() if k != "physicalBaseline"}

    for path_id, path in paths.items():
        policy, entry = policies[path_id], entries[path_id]
        assert policy["pathRevision"] == path["revision"] == entry["pathRevision"]
        assert policy["pathSha256"] == entry["pathSha256"] == object_hash(path)
        assert entry["qualificationPolicySha256"] == object_hash(policy)
        assert entry["status"] == "candidate"
        assert entry["targetComponentRefs"] == []
        assert entry["sourceReviewRef"] is None and entry["referenceSuiteRef"] is None
        binding, profile = holidays[path["holidayBindingId"]], profiles[path["suspensionProfileId"]]
        assert entry["holidayBindingSha256"] == object_hash(binding)
        assert entry["suspensionProfileSha256"] == object_hash(profile)
        assert entry["holidayBindingId"] == binding["holidayBindingId"]
        assert entry["suspensionProfileId"] == profile["suspensionProfileId"]
        assert binding["lawId"] == profile["lawId"] == path["lawId"]
        refs(path["sourceRefs"])
        for field in ("caseCoverage", "calculationCoverage"):
            assert entry[field] == path["temporalBinding"][field]
        if path_id in original_paths:
            assert path == original_paths[path_id], "legacy path object changed"
            assert policy["mode"] == "legacyV1"
            assert policy["baseline"] == {"releaseId": original_manifest["releaseId"],
                                           "catalogSha256": BASE_CATALOG_HASH}
            continue
        accepted = research_paths[path_id]
        assert policy["mode"] == "qualifiedDayProcedure"
        assert path["revision"] == 1 and path["researchRef"] == accepted["id"]
        assert laws[path["lawId"]]["canton"] == accepted["canton"]
        assert path["stages"] == accepted["stages"]
        expected_action = ("execution-order-appeal" if accepted["action"] == "executionAppeal"
                           else ("ordered-court-submission" if accepted["stages"] == ["court"]
                                 else "ordered-administrative-submission")
                           if accepted["action"] == "proceduralSubmission"
                           else ("ordinary-court-appeal" if accepted["stages"] == ["court"]
                                 else "ordinary-administrative-appeal"))
        assert path["action"] == expected_action
        duration = ({"kind": "authorityOrderedDays", "minimum": 1, "maximum": 365,
                     "boundMeaning": "technicalSafetyLimitNotLegalMaximum"} if accepted["days"] is None
                    else {"kind": "statutoryDays", "value": accepted["days"], "overridable": False})
        assert path["duration"] == duration
        assert path["urgencyPolicy"] == "notApplicable" and path["endShiftPolicy"] == "nextWorkingDay"
        assert path["endShiftGuard"] == ("blockWhenEnteringApplicableSuspension"
                                         if accepted["suspension"] == "three" else "none")
        assert policy["requirements"] == {
            "action": accepted["action"], "decisionKind": "finalDecision" if accepted["action"] == "ordinaryAppeal"
            else "qualifiedVRPGArt63Order" if accepted["action"] == "executionAppeal" else "notApplicable",
            "unit": "day", "opening": "qualifiedCompleteActualDelivery", "notice": "uncontested",
            "termChange": "none", "urgency": "none"}
        window = {"from": accepted["from"], "to": "2027-12-31"}
        for field in ("caseCoverage", "calculationCoverage", "sourceCoverage"):
            assert path["temporalBinding"][field] == window
        assert binding["physicalBaseline"]["calendarId"] == Path(
            research["calendars"][accepted["canton"]]["physical"]["path"]).stem
        for year in (2026, 2027):
            expected = [] if accepted["suspension"] == "none" else [
                (easter(year) - timedelta(days=7), easter(year) + timedelta(days=7)),
                (date(year, 7, 15), date(year, 8, 15)), (date(year, 12, 18), date(year + 1, 1, 2))]
            actual = [(period_date(p["start"], year), period_date(p["end"], year)) for p in profile["periods"]]
            assert sorted(actual) == sorted(expected)
    return True


def run():
    assert digest(RESEARCH.read_bytes()) == RESEARCH_HASH
    assert digest((BASE / "manifest.json").read_bytes()) == BASE_MANIFEST_HASH
    assert digest((BASE / ADMIN).read_bytes()) == BASE_CATALOG_HASH
    research, old, original_manifest = load(RESEARCH), load(BASE / ADMIN), load(BASE / "manifest.json")
    candidate, manifest = load(BUNDLE / ADMIN), load(BUNDLE / "manifest.json")
    schemas = {p.name: load(p) for p in sorted(SCHEMAS.glob("*.json"))}
    assert len(schemas) == 4
    for schema in schemas.values():
        Draft202012Validator.check_schema(schema)
    validators = {name: Draft202012Validator(schema, format_checker=FormatChecker())
                  for name, schema in schemas.items()}
    validate_catalog(candidate, old, research, original_manifest,
                     validators["administrative-procedure-catalog-v2.schema.json"])
    validators["local-reference-manifest-v9.schema.json"].validate(manifest)
    assert not validators["release-manifest-v9.schema.json"].is_valid(manifest)
    old_catalog_schema = load(ROOT / "schemas/administrative-procedure-catalog.schema.json")
    old_manifest_schema = load(ROOT / "schemas/release-manifest-v8.schema.json")
    assert not Draft202012Validator(old_catalog_schema).is_valid(candidate)
    assert not Draft202012Validator(old_manifest_schema).is_valid(manifest)
    assert manifest["formatVersion"] == manifest["compatibility"]["minimumConsumerFormatVersion"] == "9.0.0"
    assert manifest["releaseStatus"] == "candidate" and manifest["sourceSummary"]["legalBasisReviewStatus"] == "pending"
    assert manifest["profileIds"] == original_manifest["profileIds"]
    assert manifest["calendarIds"] == original_manifest["calendarIds"]
    copied = 0
    original_descriptors = indexed(original_manifest["artifacts"], "path")
    descriptors = indexed(manifest["artifacts"], "path")
    indexed(manifest["artifacts"], "contentId")
    assert set(descriptors) == set(original_descriptors) and len(descriptors) == 41
    for path, descriptor in descriptors.items():
        content = (BUNDLE / path).read_bytes()
        assert digest(content) == descriptor["sha256"] and len(content) == descriptor["byteLength"]
        original = (BASE / path).read_bytes()
        assert digest(original) == original_descriptors[path]["sha256"]
        if path != ADMIN:
            assert content == original and descriptor == original_descriptors[path]
            copied += 1
    assert copied == 40
    actual_bundle_paths = {p.relative_to(BUNDLE).as_posix() for p in BUNDLE.rglob("*") if p.is_file()}
    assert actual_bundle_paths == set(descriptors) | {"manifest.json"}

    checked_inputs = 0
    for case in research["cases"]:
        path = next(p for p in research["paths"] if p["id"] == case["input"]["path"])
        value = {**research["sharedFacts"], **case["input"], "pathRevision": 1,
                 "authoritySeatCanton": path["canton"], "direction": "forward", "explicitHolidayException": "none"}
        if path["action"] == "proceduralSubmission":
            value["decisionKind"] = "notApplicable"
        validators["administrative-input-v2.schema.json"].validate(value)
        checked_inputs += 1
    assert checked_inputs == 51

    mutations = []
    def negative(name, edit):
        value = copy.deepcopy(candidate)
        edit(value)
        try:
            validate_catalog(value, old, research, original_manifest,
                             validators["administrative-procedure-catalog-v2.schema.json"])
        except (AssertionError, ValidationError):
            # Only schema or invariant failures count, not unrelated process errors.
            mutations.append(name)
        else:
            raise AssertionError(f"Mutation accepted: {name}")

    negative("missing-policy", lambda c: c["qualificationPolicies"].pop())
    negative("duplicate-policy", lambda c: c["qualificationPolicies"].append(c["qualificationPolicies"][0]))
    negative("changed-policy-digest", lambda c: c["releaseBinding"]["pathEligibility"][0].update(qualificationPolicySha256="0" * 64))
    negative("legacy-hash-mismatch", lambda c: c["qualificationPolicies"][0].update(pathSha256="0" * 64))
    negative("legacy-path-duration", lambda c: c["paths"][0]["duration"].update(value=29))
    negative("runtime-enabled", lambda c: c.update(runtimeActive=True))
    negative("approval-invented", lambda c: c.update(contractStatus="approved"))
    negative("source-id-collision", lambda c: c["sources"].append(c["sources"][0]))
    negative("ar-guard-removed", lambda c: next(p for p in c["paths"] if p["pathId"] == "ar-court-30").update(endShiftGuard="none"))
    negative("lu-window-expanded", lambda c: next(p for p in c["paths"] if p["pathId"] == "lu-admin-30")["temporalBinding"]["caseCoverage"].update({"from": "2026-08-29"}))
    for proof in research["preservedTrees"]:
        directory = ROOT / proof["path"]
        files = sorted(p for p in directory.rglob("*") if p.is_file())
        body = "".join(f"{p.relative_to(ROOT).as_posix()}\0{digest(p.read_bytes())}\n" for p in files)
        assert len(files) == proof["files"] and digest(body.encode()) == proof["sha256"]
    return {"status": "passed", "workPackage": "AP23E2", "independentImplementation": "Python, no JavaScript or product imports",
            "validator": f"jsonschema {importlib.metadata.version('jsonschema')}", "contractStatus": "proposed",
            "runtimeActive": False, "productIntegrationTest": False, "sourceReleaseApproved": False,
            "schemaMetaChecks": 4, "schemaPayloadChecks": 2, "schemaRejectionChecks": 3,
            "acceptedCaseInputShapeChecks": checked_inputs, "paths": 25, "unchangedLegacyPathObjects": 12,
            "acceptedNewPathMappings": 13, "qualificationPolicies": 25, "suspensionProfilesChecked": 8,
            "rawPreservedArtifacts": copied, "negativeMutations": mutations,
            "preservedTrees": research["preservedTrees"],
            "candidateManifestSha256": digest((BUNDLE / "manifest.json").read_bytes()),
            "candidateCatalogSha256": digest((BUNDLE / ADMIN).read_bytes()),
            "acceptedResearchSha256": RESEARCH_HASH, "checkerSha256": digest(Path(__file__).read_bytes())}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    report = run()
    encoded = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        destination = ROOT / "outputs/ap23e2-2026-10-18/QA-AP23E2-INDEPENDENT.json"
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(encoded)
    print(encoded, end="")
