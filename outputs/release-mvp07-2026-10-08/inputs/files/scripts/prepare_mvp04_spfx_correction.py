#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Prepare the bounded local SPFx 0.4.0.1 correction, never P/web artifacts.

Audits a completed build only. No build, network, deployment, Git write or
publication is performed. Historic release evidence is hash-bound and read-only.
"""

from __future__ import annotations

import importlib.util
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

SPEC = importlib.util.spec_from_file_location(
    "mvp04_portable_artifact_audit", Path(__file__).with_name("prepare_mvp04_artifacts.py"))
audit = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit)

ROOT = audit.ROOT
VERSION = "0.4.0.1"
PACKAGE_NAME = f"fristenrechner-schweiz-{VERSION}.sppkg"
ARTIFACT_DIRECTORY = ".work/release-mvp04-spfx-0.4.0.1-2026-09-22/artifacts"
REPORT = "outputs/release-mvp04-spfx-0.4.0.1-2026-09-22/artifact-verification.json"
MIRROR = f"{audit.ARTIFACT_DIRECTORY}/fristenrechner-mvp04-sharepoint-mirror.zip"
FROZEN_EVIDENCE = {
    f"{audit.ARTIFACT_DIRECTORY}/fristenrechner-schweiz-0.4.0.0.sppkg": "eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a",
    MIRROR: "3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536",
    f"{audit.ARTIFACT_DIRECTORY}/fristenrechner-mvp04-steimer-web.zip": "1131d164d96cffe7ed43206f39b38a1790fa86292542b8d73fa7604f3845d69c",
    audit.REPORT: "f5ada276a79de7238760e175fcd5d5eb6f886b96bb8faff18d78c870426e0fc0",
}


def inspect_frozen_evidence(root: Path) -> list[dict[str, Any]]:
    entries = []
    for relative, expected_hash in FROZEN_EVIDENCE.items():
        data = audit.file_bytes(root / relative)
        audit.require(audit.sha256(data) == expected_hash,
                      f"Frozen release evidence differs: {relative}")
        entries.append({"path": relative, "byteLength": len(data), "sha256": expected_hash})
    return entries


def prepare(root: Path = ROOT, git_root: Path | None = None) -> tuple[dict[str, bytes], dict[str, Any]]:
    frozen = inspect_frozen_evidence(root)
    data_files, _ = audit.inspect_data(root, git_root)
    mirror_bytes = audit.file_bytes(root / MIRROR)
    audit.require(audit.zip_files(mirror_bytes) == data_files,
                  "Existing mirror archive differs from approved committed data")
    package = audit.file_bytes(root / audit.SPPKG)
    config = json.loads(audit.file_bytes(root / "spfx/config/package-solution.json"))
    package_audit = audit.inspect_sppkg(package, config, expected_version=VERSION)
    for relative in ["package.json", "spfx/package.json"]:
        audit.require(json.loads(audit.file_bytes(root / relative)).get("version") == "0.4.0",
                      f"Application version differs: {relative}")
    rollback = audit.file_bytes(root / audit.ROLLBACK)
    audit.require(audit.sha256(rollback) == audit.ROLLBACK_SHA256, "Rollback package hash differs")
    rollback_app = ET.fromstring(audit.zip_files(rollback)["AppManifest.xml"])
    audit.require(rollback_app.get("Version") == "0.3.0.0"
                  and rollback_app.get("ProductID") == audit.SOLUTION_ID,
                  "Rollback package identity differs")
    artifacts = {PACKAGE_NAME: package}
    report = {
        "kind": "mvp04LocalSpfxCorrectionArtifactVerification", "checkedOn": "2026-09-22",
        "status": "passed", "candidateStatus": "localCorrectionCandidate",
        "applicationVersion": "0.4.0", "packageVersion": VERSION,
        "replacesFailedPackageVersion": "0.4.0.0", "releaseId": audit.RELEASE_ID,
        "pinCommit": audit.PIN_COMMIT, "manifestSha256": audit.MANIFEST_SHA256,
        "publicationVerified": False, "deploymentApproved": False, "productionActivation": False,
        "runtimeValidationVerified": False,
        "verificationScope": "Local SPFx package structure and approved data identity only. Runtime tests require separate evidence. No web build or repack, target-environment test, deployment or publication.",
        "artifactDirectory": ARTIFACT_DIRECTORY, "artifacts": audit.inventory(artifacts),
        "sppkg": {"source": audit.SPPKG, "copyByteIdentical": True, **package_audit},
        "data": {"formatVersion": "4.0.0", "gitCommitByteIdentityVerified": True,
                 "entries": audit.inventory(data_files)},
        "mirror": {"existingArchive": MIRROR, "sha256": audit.sha256(mirror_bytes),
                   "byteLength": len(mirror_bytes), "reusedUnchanged": True,
                   "repacked": False, "uploaded": False},
        "web": {"prepared": False, "repacked": False, "productionChanged": False},
        "frozenReleaseEvidence": frozen,
        "rollback": {"path": audit.ROLLBACK, "sha256": audit.ROLLBACK_SHA256,
                     "version": "0.3.0.0", "byteLength": len(rollback), "unchanged": True},
    }
    return artifacts, report


def write(artifacts: dict[str, bytes], report: dict[str, Any], root: Path = ROOT) -> None:
    audit.require(set(artifacts) == {PACKAGE_NAME}, "Correction may write only the explicit SPFx package")
    audit.require(audit.inventory(artifacts) == report["artifacts"], "Artifact bytes changed after audit")
    audit.require(report["artifactDirectory"] == ARTIFACT_DIRECTORY
                  and report["packageVersion"] == VERSION, "Unexpected correction report target/version")
    for key in ["publicationVerified", "deploymentApproved", "productionActivation", "runtimeValidationVerified"]:
        audit.require(report[key] is False, "Local correction audit cannot assert publication, deployment, production or runtime approval")
    audit.require(report["web"] == {"prepared": False, "repacked": False, "productionChanged": False},
                  "Correction cannot prepare or change P/web artifacts")
    inspect_frozen_evidence(root)
    outputs = [(root / ARTIFACT_DIRECTORY / PACKAGE_NAME, artifacts[PACKAGE_NAME]),
               (root / REPORT, (json.dumps(report, indent=2, ensure_ascii=False) + "\n").encode("utf-8"))]
    for file, data in outputs:
        if file.exists() or file.is_symlink():
            audit.require(audit.file_bytes(file) == data, f"Existing artifact differs, no overwrite: {file.name}")
    for file, data in outputs:
        file.parent.mkdir(parents=True, exist_ok=True)
        try:
            with file.open("xb") as stream:
                stream.write(data)
        except FileExistsError:
            pass
        audit.require(audit.file_bytes(file) == data, f"Artifact disk readback differs: {file.name}")
    inspect_frozen_evidence(root)


def main() -> int:
    audit.require(len(sys.argv) == 1, "No build, overwrite, publication or deployment arguments are accepted")
    artifacts, report = prepare()
    write(artifacts, report)
    print(json.dumps({"status": "passed", "report": REPORT, "artifacts": report["artifacts"],
                      "publicationVerified": False, "deploymentApproved": False}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
