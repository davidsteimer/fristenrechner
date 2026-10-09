#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent, read-only validator for the exact approved MVP 0.5 envelope."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "data/candidates/2026-09-28-ap19c3"
RELEASE_ID = "2026-09-28-mvp-05-approved.1"
SOCIAL_PATH = "social-procedures/ch-social-procedures.json"
APPROVAL_PATH = "outputs/release-mvp05-2026-09-28/source-approval.json"
APPROVAL_SHA = "2897874ed52c826bb43dc61270f8122cf996b4fa2070904eacc4d672f551f768"
DECISION_PATH = "docs/fachrecht/abnahme-quellenpruefung-mvp05.md"
CANDIDATE_SHA = "8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da"
WINDOW = {"from": "2026-01-01", "to": "2027-12-31"}
SUITES = {
    "AP17B-ANWENDBARKEIT": ("tests/golden/candidates/ap17b-anwendbarkeit.json", "d180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47"),
    "AP19B-SOCIAL-REFERENCES-1": ("tests/golden/candidates/ap19b-social-deadlines.json", "da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8"),
}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def object_sha(value):
    # These bound objects contain no floats or supplementary-plane object keys.
    # Thus this independent encoding equals the accepted RFC 8785 serialization.
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def without(value, keys):
    return {key: item for key, item in value.items() if key not in keys}


def check_release(directory):
    directory = Path(directory)
    schemas = [load(path) for path in (ROOT / "schemas").glob("*.schema.json")]
    registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema)) for schema in schemas)
    validators = {schema["$id"]: Draft202012Validator(schema, registry=registry, format_checker=FormatChecker()) for schema in schemas}
    raw_manifest = (directory / "manifest.json").read_bytes()
    manifest = json.loads(raw_manifest)
    validators[manifest["$schema"]].validate(manifest)
    assert manifest["releaseId"] == RELEASE_ID
    assert manifest["releaseStatus"] == "approved"
    assert manifest["formatVersion"] == "5.0.0"
    assert manifest["compatibility"]["minimumConsumerFormatVersion"] == "5.0.0"
    assert manifest["immutable"] is True
    assert len(manifest["artifacts"]) == 10
    assert sha((CANDIDATE / "manifest.json").read_bytes()) == CANDIDATE_SHA
    original_manifest = load(CANDIDATE / "manifest.json")
    assert manifest["sourceSummary"] == original_manifest["sourceSummary"]
    for key in ["coverage", "profileIds", "calendarIds", "specialRegimeCatalogIds", "holidayCatalogIds", "socialProcedureCatalogIds"]:
        assert manifest[key] == original_manifest[key], key
    assert manifest["extensions"]["steimer.candidate"] == original_manifest["extensions"]["steimer.candidate"]
    release = manifest["extensions"]["steimer.release-preparation"]
    for key in ["publicationApproved", "deploymentApproved", "productionActivation"]:
        assert release[key] is False
    approval_bytes = (ROOT / APPROVAL_PATH).read_bytes()
    assert sha(approval_bytes) == APPROVAL_SHA
    approval = json.loads(approval_bytes)
    assert approval["approvedBy"] == "David Steimer"
    assert approval["approvedOn"] == "2026-09-28"
    assert approval["permissions"]["localDataPromotionAuthorized"] is True
    for evidence in approval["evidence"]:
        actual = (ROOT / evidence["path"]).read_bytes()
        assert sha(actual) == evidence["sha256"], evidence["path"]
        assert len(actual) == evidence["byteLength"]
    for file, expected_hash in SUITES.values():
        assert sha((ROOT / file).read_bytes()) == expected_hash
    source_ref = {"reviewId": "MVP05-SOURCE-APPROVAL-20260928", "sha256": APPROVAL_SHA}
    extension = manifest["extensions"]["steimer.approval"]
    assert extension["sourceReviewRef"] == source_ref
    assert extension["decisionSha256"] == sha((ROOT / DECISION_PATH).read_bytes())
    artifacts = {}
    for descriptor in manifest["artifacts"]:
        target = directory / descriptor["path"]
        assert not target.is_symlink()
        assert target.resolve().is_relative_to(directory.resolve())
        raw = target.read_bytes()
        assert sha(raw) == descriptor["sha256"], descriptor["path"]
        assert len(raw) == descriptor["byteLength"], descriptor["path"]
        document = json.loads(raw)
        validators[descriptor["schemaId"]].validate(document)
        artifacts[descriptor["path"]] = document
        if descriptor["path"] != SOCIAL_PATH:
            assert raw == (CANDIDATE / descriptor["path"]).read_bytes(), descriptor["path"]
    social = artifacts[SOCIAL_PATH]
    original = load(CANDIDATE / SOCIAL_PATH)
    assert len(social["federalRules"]) == 24
    assert len(social["cantonalBindings"]) == len(social["releaseEligibility"]) == 28
    assert social["review"]["status"] == "verified"
    assert social["review"]["reviewedBy"] == "David Steimer"
    assert without(social, ["labels", "review", "federalRules", "cantonalBindings", "releaseEligibility"]) == without(original, ["labels", "review", "federalRules", "cantonalBindings", "releaseEligibility"])
    rules = {item["ruleId"]: item for item in social["federalRules"]}
    bindings = {item["bindingId"]: item for item in social["cantonalBindings"]}
    for group in ["federalRules", "cantonalBindings"]:
        for item, before in zip(social[group], original[group], strict=True):
            assert item["status"] == "reviewed"
            assert without(item, ["status"]) == without(before, ["status"])
            assert item["legalValidity"] is not None
            assert item["caseCoverage"] == item["sourceCoverage"] == WINDOW
            assert item["legalValidity"]["from"] <= WINDOW["from"]
            assert item["legalValidity"]["to"] is None or item["legalValidity"]["to"] >= WINDOW["to"]
            assert all(norm["verification"] == "verified" for norm in item["normBindings"])
    for binding in bindings.values():
        assert binding["procedureContextCanton"] == "BE"
        assert all(item["holidayCanton"] == "BE" and item["calendarId"] == "be-public-holidays" for item in binding["calendarBindings"])
    for item, before in zip(social["releaseEligibility"], original["releaseEligibility"], strict=True):
        rule, binding = rules[item["ruleRef"]["ruleId"]], bindings[item["bindingRef"]["bindingId"]]
        assert item["releaseId"] == RELEASE_ID
        assert item["status"] == "approved"
        assert item["approval"] == {"approvedBy": "David Steimer", "approvedOn": "2026-09-28", "decisionRef": DECISION_PATH}
        assert item["ruleRef"] == {"ruleId": rule["ruleId"], "revision": rule["revision"], "sha256": object_sha(rule)}
        assert item["bindingRef"] == {"bindingId": binding["bindingId"], "revision": binding["revision"], "sha256": object_sha(binding)}
        assert item["sourceReviewRef"] == source_ref
        assert item["referenceSuiteRef"]["sha256"] == SUITES[item["referenceSuiteRef"]["suiteId"]][1]
        assert item["caseCoverage"] == item["calculationCoverage"] == WINDOW
        ignored = ["releaseId", "status", "ruleRef", "bindingRef", "sourceReviewRef", "approval"]
        assert without(item, ignored) == without(before, ignored)
        for component in item["componentRefs"]:
            assert any(all(descriptor[key] == component[key] for key in ["role", "contentId", "sha256"]) for descriptor in manifest["artifacts"])
    return {"status": "passed", "releaseId": RELEASE_ID, "manifestSha256": sha(raw_manifest), "validatedArtifacts": 10, "unchangedArtifacts": 9, "reviewedFederalRules": 24, "approvedBindings": 28, "sourceReviewDatesUnchanged": True, "legalContentUnchanged": True}


if __name__ == "__main__":
    assert len(sys.argv) == 2, "Expected one local release directory"
    print(json.dumps(check_release(Path(sys.argv[1])), sort_keys=True))
