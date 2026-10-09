#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Independent, read-only validator for the exact approved MVP 0.6 envelope."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "data/candidates/2026-10-01-ap20c3"
PREVIOUS = ROOT / "data/releases/2026-09-28-mvp-05-approved.1"
RELEASE_ID = "2026-10-01-mvp-06-approved.1"
SOCIAL_PATH = "social-procedures/ch-social-procedures.json"
APPROVAL_PATH = "outputs/release-mvp06-2026-10-01/source-approval.json"
APPROVAL_SHA = "10f43005757c54a445f009d702b17a37f04e2dad530241201dbf6c4eebfc2cbb"
DECISION_PATH = "docs/fachrecht/abnahme-quellen-mvp06.md"
CANDIDATE_SHA = "b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450"
WINDOW = {"from": "2026-01-01", "to": "2027-12-31"}
SUITES = {
    "AP17B-ANWENDBARKEIT": ("tests/golden/candidates/ap17b-anwendbarkeit.json", "d180d6c7dd67f30bf8abe9b101878b22b1e455ad42bbd2ca633b1ee4487b5f47"),
    "AP19B-SOCIAL-REFERENCES-1": ("tests/golden/candidates/ap19b-social-deadlines.json", "da5895b8d09ce46f61830d08613f93ee0a673bd1cefbd7cbbadeb4c054940ae8"),
    "AP20B-SOCIAL-DATES-1": ("tests/golden/candidates/ap20b-social-dates.json", "9740ce84883a54beec81f2f8a6cb1c450d690c9b6f440c5841d5821dfad16fa3"),
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


def read_regular(base, relative):
    parts = Path(relative).parts
    assert parts and not Path(relative).is_absolute() and ".." not in parts
    target = base
    for part in parts:
        target = target / part
        assert not target.is_symlink(), str(target)
    assert target.is_file()
    assert target.resolve().is_relative_to(base.resolve())
    return target.read_bytes()


def check_release(directory, *, evidence_scope="private-full"):
    # Promotion callers retain the strict default. Public integrity is a named,
    # read-only scope, never an automatic fallback when private evidence is absent.
    assert evidence_scope in ("private-full", "public-integrity"), "Unknown evidence scope"
    directory = Path(directory)
    schemas = [load(path) for path in (ROOT / "schemas").glob("*.schema.json")]
    registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema)) for schema in schemas)
    validators = {schema["$id"]: Draft202012Validator(schema, registry=registry, format_checker=FormatChecker()) for schema in schemas}
    raw_manifest = read_regular(directory, "manifest.json")
    manifest = json.loads(raw_manifest)
    validators[manifest["$schema"]].validate(manifest)
    assert manifest["releaseId"] == RELEASE_ID
    assert manifest["releaseStatus"] == "approved"
    assert manifest["formatVersion"] == "6.0.0"
    assert manifest["compatibility"]["minimumConsumerFormatVersion"] == "6.0.0"
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
    assert approval["approvedOn"] == "2026-10-01"
    assert approval["permissions"]["localDataPromotionAuthorized"] is True
    assert approval["permissions"]["sourceReviewApproved"] is True
    assert approval["permissions"]["definitiveLocalBuildAuthorized"] is True
    for key in ["installationAuthorized", "publicationAuthorized", "hostingChangesAuthorized", "operatingApproval"]:
        assert approval["permissions"][key] is False
    public_count, private_count = 0, 0
    for evidence in approval["evidence"]:
        private = any(".work" in Path(path).parts for path in
                      (evidence["path"], evidence.get("resolvedPath", evidence["path"])))
        if private:
            private_count += 1
            if evidence_scope == "public-integrity":
                continue
        else:
            public_count += 1
        actual = read_regular(ROOT, evidence.get("resolvedPath", evidence["path"]))
        assert sha(actual) == evidence["sha256"], evidence["path"]
        assert len(actual) == evidence["byteLength"]
    assert (public_count, private_count) == (63, 107)
    for file, expected_hash in SUITES.values():
        assert sha((ROOT / file).read_bytes()) == expected_hash
    source_ref = {"reviewId": "MVP06-SOURCE-APPROVAL-20261001", "sha256": APPROVAL_SHA}
    extension = manifest["extensions"]["steimer.approval"]
    assert extension["sourceReviewRef"] == source_ref
    assert extension["decisionSha256"] == sha((ROOT / DECISION_PATH).read_bytes())
    assert extension["decisionSha256"] == "18adb59a4731838f88761513117041697e5ee6d61b9a40726b5a9945c97dbc15"
    assert extension["contractDecision"] == "DEC-2026-026"
    snapshot = extension["preparationSnapshot"]
    assert snapshot == {"path": "outputs/release-mvp06-2026-10-01/preparation-inputs.json", "sha256": "e38f06f47f258f3a7d54359d5ca5c0c12bc37fe846f197c4194d784c0a7c585a", "evidenceFiles": 180, "historicalArchives": 85}
    assert sha(read_regular(ROOT, snapshot["path"])) == snapshot["sha256"]
    artifacts = {}
    for descriptor in manifest["artifacts"]:
        target = directory / descriptor["path"]
        assert not target.is_symlink()
        assert target.resolve().is_relative_to(directory.resolve())
        raw = read_regular(directory, descriptor["path"])
        assert sha(raw) == descriptor["sha256"], descriptor["path"]
        assert len(raw) == descriptor["byteLength"], descriptor["path"]
        document = json.loads(raw)
        validators[descriptor["schemaId"]].validate(document)
        artifacts[descriptor["path"]] = document
        if descriptor["path"] != SOCIAL_PATH:
            assert raw == (CANDIDATE / descriptor["path"]).read_bytes(), descriptor["path"]
            assert raw == (PREVIOUS / descriptor["path"]).read_bytes(), descriptor["path"]
    social = artifacts[SOCIAL_PATH]
    original = load(CANDIDATE / SOCIAL_PATH)
    previous = load(PREVIOUS / SOCIAL_PATH)
    assert social["formatVersion"] == "2.0.0"
    assert len(social["federalRules"]) == 44
    assert len(social["cantonalBindings"]) == len(social["releaseEligibility"]) == 50
    assert social["federalRules"][:24] == original["federalRules"][:24] == previous["federalRules"]
    assert social["cantonalBindings"][:28] == original["cantonalBindings"][:28] == previous["cantonalBindings"]
    assert social["review"]["status"] == "verified"
    assert social["review"]["reviewedBy"] == "David Steimer"
    assert without(social, ["labels", "review", "federalRules", "cantonalBindings", "releaseEligibility"]) == without(original, ["labels", "review", "federalRules", "cantonalBindings", "releaseEligibility"])
    rules = {item["ruleId"]: item for item in social["federalRules"]}
    bindings = {item["bindingId"]: item for item in social["cantonalBindings"]}
    for group in ["federalRules", "cantonalBindings"]:
        existing_count = 24 if group == "federalRules" else 28
        for index, (item, before) in enumerate(zip(social[group], original[group], strict=True)):
            assert before["status"] == ("reviewed" if index < existing_count else "candidate")
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
        assert before["status"] == "candidate" and before["approval"] is None
        rule, binding = rules[item["ruleRef"]["ruleId"]], bindings[item["bindingRef"]["bindingId"]]
        assert item["releaseId"] == RELEASE_ID
        assert item["status"] == "approved"
        assert item["approval"] == {"approvedBy": "David Steimer", "approvedOn": "2026-10-01", "decisionRef": DECISION_PATH}
        assert item["ruleRef"] == {"ruleId": rule["ruleId"], "revision": rule["revision"], "sha256": object_sha(rule)}
        assert item["bindingRef"] == {"bindingId": binding["bindingId"], "revision": binding["revision"], "sha256": object_sha(binding)}
        assert without(item["ruleRef"], ["sha256"]) == without(before["ruleRef"], ["sha256"])
        assert without(item["bindingRef"], ["sha256"]) == without(before["bindingRef"], ["sha256"])
        assert item["sourceReviewRef"] == source_ref
        assert item["referenceSuiteRef"]["sha256"] == SUITES[item["referenceSuiteRef"]["suiteId"]][1]
        assert item["caseCoverage"] == item["calculationCoverage"] == WINDOW
        ignored = ["releaseId", "status", "ruleRef", "bindingRef", "sourceReviewRef", "approval"]
        assert without(item, ignored) == without(before, ignored)
        for component in item["componentRefs"]:
            assert any(all(descriptor[key] == component[key] for key in ["role", "contentId", "sha256"]) for descriptor in manifest["artifacts"])
    result = {"status": "passed", "releaseId": RELEASE_ID, "manifestSha256": sha(raw_manifest), "validatedArtifacts": 10, "unchangedArtifacts": 9, "reviewedFederalRules": 44, "approvedBindings": 50, "unchangedReviewedRules": 24, "unchangedReviewedBindings": 28, "newlyReviewedRules": 20, "newlyReviewedBindings": 22, "sourceReviewDatesUnchanged": True, "legalContentUnchanged": True}
    if evidence_scope == "public-integrity":
        result.update(verificationScope="public-integrity", publicEvidenceFilesVerified=63,
                      privateEvidenceFilesBoundButNotRechecked=107,
                      privateRawEvidenceRechecked=False, completeSourceAuditReproduced=False)
    return result


if __name__ == "__main__":
    assert len(sys.argv) == 2 or (len(sys.argv) == 3 and sys.argv[2] == "--public-integrity"), \
        "Expected one local release directory, optionally --public-integrity"
    selected_scope = "public-integrity" if len(sys.argv) == 3 else "private-full"
    print(json.dumps(check_release(Path(sys.argv[1]), evidence_scope=selected_scope), sort_keys=True))
