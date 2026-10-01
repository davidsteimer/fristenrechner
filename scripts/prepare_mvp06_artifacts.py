#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Package verified local MVP 0.6 builds. No network, installation or publication."""
from __future__ import annotations

import argparse
import io
import json
import re
import stat
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from typing import Any

from prepare_mvp04_artifacts import (
    ArtifactError, require, sha256, file_bytes, safe_name, inventory, zip_files,
    local_name, SOLUTION_ID, FEATURE_ID, WEBPART_ID,
)

ROOT = Path(__file__).resolve().parents[1]
RELEASE_ID = "2026-10-01-mvp-06-approved.1"
MANIFEST_SHA256 = "637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724"
SOURCE_APPROVAL_SHA256 = "10f43005757c54a445f009d702b17a37f04e2dad530241201dbf6c4eebfc2cbb"
PROMOTION_SHA256 = "51f946fe36104e83e766ad7b958d2debf678781deee7f9b388c573b928088b91"
PRIOR_PACKAGE = "outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg"
PRIOR_SHA256 = "f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39"
HISTORICAL_PACKAGE = "spfx/sharepoint/solution/fristenrechner-schweiz.sppkg"
HISTORICAL_SHA256 = "9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346"
DECISION_PATH = "docs/fachrecht/abnahme-quellen-mvp06.md"
DECISION_SHA256 = "18adb59a4731838f88761513117041697e5ee6d61b9a40726b5a9945c97dbc15"
OUTPUT = "outputs/release-mvp06-2026-10-01"
EVIDENCE = f"{OUTPUT}/build-evidence"
ARTIFACT_NAMES = {"fristenrechner-schweiz-0.6.0.0.sppkg", "fristenrechner-mvp06-sharepoint-mirror.zip",
                  "fristenrechner-mvp06-steimer-web.zip"}
PERMISSIONS = {"localDataPromotion": True, "localDefinitiveBuild": True, "eqInstallation": False,
               "publication": False, "hostingChanges": False, "productionActivation": False}
PROMOTION_COUNTS = {"federalRules": 44, "cantonalBindings": 50, "approvedEligibility": 50,
                    "unchangedReviewedRules": 24, "unchangedReviewedBindings": 28,
                    "newlyReviewedRules": 20, "newlyReviewedBindings": 22,
                    "artifacts": 10, "unchangedArtifacts": 9}
SNAPSHOT_SOURCES = {
    "spfx/config/package-solution.json", "spfx/src/core/config.ts", "spfx/package.json", "spfx/package-lock.json",
    "spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json", "public-app/.htaccess",
    "package.json", "package-lock.json", "src/public-app/main.tsx", "src/release/mvp06ReleaseData.ts",
    "scripts/build-public-app.mjs",
}


def product_input_paths(receipt: dict[str, Any]) -> set[str]:
    records = receipt.get("productInputFiles", [])
    require(isinstance(records, list) and records, "Missing bounded working-tree product inventory")
    paths = set()
    for item in records:
        name = safe_name(item["path"])
        require(name not in paths, "Duplicate working-tree input")
        require(name in SNAPSHOT_SOURCES or name == "scripts/browser-globals-plugin.mjs"
                or name.startswith(("src/core/", "src/ui/", "schemas/", "src/public-app/", "spfx/src/core/",
                                    "spfx/src/webparts/", "spfx/scripts/", "spfx/config/", "public-app/")),
                "Unrelated file in working-tree product inventory")
        require(not name.startswith("src/ui/preview/") and not name.endswith((".pem", ".key", ".map")),
                "Non-product file in working-tree input inventory")
        require(re.fullmatch(r"[a-f0-9]{64}", item.get("sha256", "")) is not None
                and isinstance(item.get("byteLength"), int) and item["byteLength"] >= 0,
                "Invalid working-tree input digest or size")
        paths.add(name)
    require({"package.json", "package-lock.json", "src/public-app/main.tsx", "src/release/mvp06ReleaseData.ts"} <= paths,
            "Incomplete minimum working-tree source inventory")
    return paths


def deterministic_zip(files: dict[str, bytes]) -> bytes:
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(safe_name(name), (2026, 10, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data, compresslevel=9)
    result = stream.getvalue()
    require(zip_files(result) == files, "ZIP readback differs")
    return result


def data_pin(root: Path) -> tuple[str, str]:
    config = file_bytes(root / "spfx/src/core/config.ts").decode()
    found = re.findall(r"https://raw\.githubusercontent\.com/davidsteimer/fristenrechner/([0-9a-f]{40})/data/releases/" + re.escape(RELEASE_ID), config)
    require(len(found) == 1, "Expected exactly one immutable MVP06 data pin")
    return found[0], f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{found[0]}/data/releases/{RELEASE_ID}"


def inspect_data(root: Path, pin: str) -> tuple[dict[str, bytes], dict[str, Any]]:
    directory = root / "data/releases" / RELEASE_ID
    manifest_bytes = file_bytes(directory / "manifest.json")
    require(sha256(manifest_bytes) == MANIFEST_SHA256, "Approved manifest hash differs")
    manifest = json.loads(manifest_bytes)
    require(manifest["releaseId"] == RELEASE_ID and manifest["releaseStatus"] == "approved", "Wrong release status or identity")
    require(manifest["formatVersion"] == "6.0.0" and len(manifest["artifacts"]) == 10, "Wrong manifest contract")
    files = {"manifest.json": manifest_bytes}
    for artifact in manifest["artifacts"]:
        name = safe_name(artifact["path"])
        require(name not in files, "Duplicate data artifact")
        data = file_bytes(directory / name)
        require(len(data) == artifact["byteLength"] and sha256(data) == artifact["sha256"], f"Data hash differs: {name}")
        files[name] = data
    for name, data in files.items():
        blob = subprocess.run(["git", "cat-file", "blob", f"{pin}:data/releases/{RELEASE_ID}/{name}"], cwd=root, capture_output=True)
        require(blob.returncode == 0 and blob.stdout == data, f"Pinned Git blob differs: {name}")
    inspect_mirror_files(files)
    return files, manifest


def inspect_mirror_files(files: dict[str, bytes]) -> dict[str, Any]:
    require("manifest.json" in files, "Missing mirror manifest")
    require(sha256(files["manifest.json"]) == MANIFEST_SHA256, "Mirror manifest differs")
    manifest = json.loads(files["manifest.json"])
    require(manifest.get("releaseId") == RELEASE_ID and manifest.get("releaseStatus") == "approved"
            and manifest.get("formatVersion") == "6.0.0", "Wrong mirror release contract")
    descriptors = manifest["artifacts"]
    expected = {"manifest.json", *(row["path"] for row in descriptors)}
    require(len(descriptors) == 10 and len(expected) == 11 and set(files) == expected, "Mirror must contain exactly eleven unique release files")
    for row in descriptors:
        name = safe_name(row["path"])
        require(sha256(files[name]) == row["sha256"] and len(files[name]) == row["byteLength"], f"Mirror artifact differs: {name}")
    social_descriptors = [row for row in descriptors if row["role"] == "socialProcedureCatalog"]
    require(len(social_descriptors) == 1, "Wrong social catalog inventory")
    catalog = json.loads(files[social_descriptors[0]["path"]])
    require(catalog.get("formatVersion") == "2.0.0" and len(catalog.get("federalRules", [])) == 44
            and len(catalog.get("cantonalBindings", [])) == 50 and len(catalog.get("releaseEligibility", [])) == 50,
            "Wrong approved social catalog 2 / 44 / 50 contract")
    require(all(row.get("status") == "reviewed" for row in catalog["federalRules"] + catalog["cantonalBindings"]),
            "Unreviewed rule or binding in definitive release")
    approval = manifest["extensions"]["steimer.approval"]
    for item in catalog["releaseEligibility"]:
        require(item.get("status") == "approved" and item.get("releaseId") == RELEASE_ID
                and item.get("sourceReviewRef") == approval["sourceReviewRef"]
                and item.get("approval", {}).get("approvedBy") == "David Steimer"
                and item.get("approval", {}).get("approvedOn") == "2026-10-01"
                and item.get("approval", {}).get("decisionRef") == DECISION_PATH,
                "Candidate, synthetic or mismatched eligibility in definitive release")
    return manifest


def inspect_sppkg(data: bytes, config: dict[str, Any], base_url: str) -> dict[str, Any]:
    files = zip_files(data)
    require("AppManifest.xml" in files, "Missing AppManifest.xml")
    app = ET.fromstring(files["AppManifest.xml"])
    require(app.get("ProductID") == SOLUTION_ID and app.get("Version") == "0.6.0.0", "Wrong solution identity/version")
    require(app.get("IsDomainIsolated") == "false" and app.get("IsClientSideSolution") == "true", "Unexpected application scope")
    solution = config["solution"]
    require(solution.get("id") == SOLUTION_ID and solution.get("version") == "0.6.0.0", "Source/build solution mismatch")
    require(solution.get("includeClientSideAssets") is True, "Client assets not included")
    require(not solution.get("webApiPermissionRequests") and not config.get("webApiPermissionRequests"), "Unexpected API permission requests")
    require(len(solution.get("features", [])) == 1, "Wrong feature count")
    require(solution["features"][0]["id"] == FEATURE_ID and solution["features"][0]["version"] == "0.6.0.0", "Wrong feature configuration")
    feature = ET.fromstring(files[f"feature_{FEATURE_ID}.xml"])
    require(feature.get("Id") == FEATURE_ID and feature.get("Version") == "0.6.0.0" and feature.get("Scope") == "Web", "Wrong built feature")
    components = []
    for name, content in files.items():
        require(not name.endswith((".map", ".ts", ".tsx", ".pem", ".key")), f"Private/development artifact: {name}")
        if name.endswith((".xml", ".rels")):
            for element in ET.fromstring(content).iter():
                require("permission" not in local_name(element.tag).lower(), f"Unexpected permission in {name}")
                if local_name(element.tag) == "ClientSideComponent":
                    components.append(element)
                if local_name(element.tag) == "Relationship":
                    require(element.get("TargetMode", "Internal") == "Internal", "External package relationship")
                    require(element.get("Target", "").lstrip("/") in files, "Unresolved package relationship")
    require(len(components) == 1 and components[0].get("Id") == WEBPART_ID, "Wrong component inventory")
    manifest = json.loads(components[0].attrib["ComponentManifest"])
    require(manifest.get("id") == WEBPART_ID and manifest.get("version") == "0.6.0", "Wrong webpart version")
    require(manifest.get("supportedHosts") == ["SharePointWebPart", "TeamsTab"], "Unexpected hosts")
    entries = manifest.get("preconfiguredEntries", [])
    require(len(entries) == 1 and entries[0].get("properties") == {"providerKind": "github", "githubBaseUrl": base_url, "sharePointMirrorPath": ""}, "Wrong immutable default pin")
    bundle = "ClientSideAssets/" + manifest["loaderConfig"]["scriptResources"]["fristenrechner-web-part"]["path"]
    require(bundle in files and bundle + ".LICENSE.txt" in files, "Bundle or licence missing")
    script = files[bundle].decode()
    for marker in [base_url, RELEASE_ID, '"6.0.0"', '"2.0.0"', "ch-holiday-catalog", "ch-social-procedures"]:
        require(marker in script, f"Missing built consumer marker: {marker}")
    return {"solutionVersion": "0.6.0.0", "featureVersion": "0.6.0.0", "webpartVersion": "0.6.0",
            "solutionId": SOLUTION_ID, "featureId": FEATURE_ID, "webpartId": WEBPART_ID,
            "additionalApiPermissions": [], "defaultGithubBaseUrl": base_url, "entries": inventory(files)}


def inspect_web_files(files: dict[str, bytes], manifest: dict[str, Any], htaccess: bytes) -> dict[str, bytes]:
    """Inspect shipped bytes, independent of a disposable build directory."""
    require("build-manifest.json" in files, "Missing web build receipt")
    build = json.loads(files["build-manifest.json"])
    require(build.get("application") == "fristenrechner-public" and build.get("version") == "0.6.0", "Wrong web application/version")
    require(build.get("dataReleaseId") == RELEASE_ID and build.get("deployable") is not False, "Not an approved data build")
    require(build.get("basePath") == "/fristenrechner/" and build.get("canonicalUrl") == "https://www.steimer.ch/fristenrechner/", "Wrong hosting target")
    resources = [build["assets"]["javascript"], build["assets"]["stylesheet"], *build["assets"]["vendors"].values()]
    require(len(set(resources)) == 5, "Wrong asset count")
    names = [safe_name(value.removeprefix("./")) for value in resources]
    require(all(re.fullmatch(r"assets/[A-Za-z0-9-]+\.(js|css)", name) for name in names), "Unsafe asset path")
    expected = {"index.html", ".htaccess", "favicon.svg", "build-manifest.json", *names,
                "licenses/react-MIT.txt", "licenses/react-dom-MIT.txt", "licenses/fluent-ui-MIT.txt"}
    require(set(files) == expected, f"Unexpected web file inventory: {sorted(set(files) ^ expected)}")
    for resource in resources:
        require(resource in files["index.html"].decode(), f"Missing resource link: {resource}")
    require(files[".htaccess"] == htaccess, "Hosting rules changed during build")
    require(b"connect-src 'none'" in files[".htaccess"] and b"Options -Indexes" in files[".htaccess"], "Missing static security rules")
    script = files[names[0]].decode()
    require(RELEASE_ID in script, "Wrong embedded data release")
    for artifact in manifest["artifacts"]:
        require(artifact["sha256"] in script, f"Missing embedded data hash: {artifact['path']}")
    for name in expected:
        if name.startswith("licenses/"):
            require(b"Permission is hereby granted" in files[name], "Missing licence text")
    return files


def inspect_web(directory: Path, manifest: dict[str, Any], root: Path) -> dict[str, bytes]:
    files = {}
    for path in directory.rglob("*"):
        require(not path.is_symlink(), "Symlink in public build")
        if path.is_file():
            files[safe_name(path.relative_to(directory).as_posix())] = file_bytes(path)
    return inspect_web_files(files, manifest, file_bytes(root / "public-app/.htaccess"))


def validate_build_receipt(evidence: dict[str, Any], pin: str) -> None:
    require(evidence.get("passed") is True and evidence.get("pinCommit") == pin, "Unsuccessful or stale SPFx build")
    require(evidence.get("releaseId") == RELEASE_ID and evidence.get("manifestSha256") == MANIFEST_SHA256, "Build data differs")
    require(evidence.get("applicationVersion") == "0.6.0" and evidence.get("packageVersion") == "0.6.0.0", "Wrong build receipt versions")
    require(re.fullmatch(r"[a-f0-9]{40}", pin) is not None, "Invalid immutable Git pin")
    product_input_paths(evidence)
    require(evidence.get("rollbackPackagePath") == PRIOR_PACKAGE and evidence.get("rollbackPackageSha256") == PRIOR_SHA256,
            "Wrong last-installed rollback package in build receipt")
    require(all(evidence.get(key) is False for key in ("publicationVerified", "installationAuthorized", "productionActivation")),
            "Build receipt claims external authority")
    steps = evidence.get("steps", [])
    expected = [("npm", ["test"]), ("heft", ["test", "--clean", "--production"]),
                ("node", ["scripts/audit-product-css.mjs"]), ("heft", ["package-solution", "--production"]),
                ("npm", ["run", "test:built"])]
    require(len(steps) == len(expected), "Missing build tests")
    for step, (command, args) in zip(steps, expected):
        require(Path(step.get("command", "")).name == command and step.get("args") == args and step.get("exitCode") == 0,
                "Missing or mismatched build step")


def collect_build_archive(root: Path, build_evidence: str) -> tuple[dict[str, bytes], dict[str, Any]]:
    """Preserve the selected receipt, redacted logs and small immutable input snapshots."""
    original_path = safe_name(build_evidence)
    original_bytes = file_bytes(root / original_path)
    receipt = json.loads(original_bytes)
    archive = {f"{EVIDENCE}/spfx-verification.json": original_bytes}
    log_records = []
    for number, step in enumerate(receipt["steps"], 1):
        original = file_bytes(root / safe_name(step["log"]))
        # Preserve technical text while removing the local macOS user/root prefix.
        text = original.decode().replace(str(root), "<repository-root>")
        text = re.sub(r"/Users/[^/\s]+", "/Users/<user>", text)
        archived = text.encode()
        path = f"{EVIDENCE}/logs/step-{number}.txt"
        archive[path] = archived
        log_records.append({"originalPath": step["log"], "originalSha256": sha256(original),
                            "archivePath": path, "archivedSha256": sha256(archived),
                            "normalization": "Repository root and macOS username prefixes redacted, remaining technical text unchanged"})
    stage = root / safe_name(receipt["stage"])
    snapshots = []
    product_paths = product_input_paths(receipt)
    for item in receipt["productInputFiles"]:
        content = file_bytes(root / safe_name(item["path"]))
        require(sha256(content) == item["sha256"] and len(content) == item["byteLength"],
                f"Product input changed after isolated build: {item['path']}")
    inputs = [(source, stage / source if source.startswith("spfx/") else root / source,
               "isolated-spfx-build-copy" if source.startswith("spfx/") else "local-input-bound-at-artifact-packaging")
              for source in sorted(SNAPSHOT_SOURCES | product_paths)]
    for source, file, origin in inputs:
        content = file_bytes(file)
        require(content == file_bytes(root / source), f"Input changed after selected build: {source}")
        destination = f"{EVIDENCE}/inputs/{source}"
        archive[destination] = content
        snapshots.append({"sourcePath": source, "archivePath": destination, "origin": origin,
                          "sha256": sha256(content), "byteLength": len(content)})
    return archive, {"spfxBuildEvidence": {"path": f"{EVIDENCE}/spfx-verification.json", "sha256": sha256(original_bytes)},
                     "originalSpfxBuildEvidence": {"path": original_path, "sha256": sha256(original_bytes)},
                     "archivedBuildEvidence": inventory(archive), "archivedBuildLogs": log_records,
                     "buildInputSnapshots": snapshots, "archiveVerificationIndependentOfScratch": True}


def inspect_governance(manifest: dict[str, Any], source_approval_bytes: bytes,
                       promotion_bytes: bytes, decision_bytes: bytes) -> dict[str, str]:
    """Bind real approvals to the immutable release, not merely inventory current bytes."""
    approved = manifest["extensions"]["steimer.approval"]
    source = json.loads(source_approval_bytes)
    promotion = json.loads(promotion_bytes)
    source_hash = sha256(source_approval_bytes)
    require(source_hash == approved["sourceReviewRef"]["sha256"] == SOURCE_APPROVAL_SHA256,
            "Source approval differs from approved manifest or accepted original")
    require(source.get("reviewId") == approved["sourceReviewRef"]["reviewId"]
            and source.get("releaseId") == RELEASE_ID and source.get("recordStatus") == "approved",
            "Source approval identity/status differs")
    require(source.get("approvedBy") == approved["approvedBy"] == "David Steimer"
            and source.get("approvedOn") == approved["approvedOn"] == "2026-10-01",
            "Source approval human identity/date differs")
    require(approved.get("decisionRef") == DECISION_PATH and sha256(decision_bytes) == DECISION_SHA256,
            "Human decision does not match the separately accepted MVP06 decision")
    require(source.get("decisionRef") == approved["decisionRef"]
            and sha256(decision_bytes) == approved["decisionSha256"], "Human decision binding differs")
    require(source.get("permissions") == {"sourceReviewApproved": True, "localDataPromotionAuthorized": True,
            "definitiveLocalBuildAuthorized": True, "installationAuthorized": False, "publicationAuthorized": False,
            "hostingChangesAuthorized": False, "operatingApproval": False}, "Source approval permissions differ")
    require(promotion.get("kind") == "mvp06LocalDataPromotion" and promotion.get("releaseId") == RELEASE_ID
            and promotion.get("manifestSha256") == MANIFEST_SHA256 and promotion.get("dataStatus") == "approved",
            "Data promotion release identity/hash/status differs")
    require(promotion.get("implementationAccepted") is True and promotion.get("sourceReviewAccepted") is True,
            "Data promotion acceptance missing")
    require(all(promotion.get(key) is False for key in ("publicationApproved", "deploymentApproved", "productionActivation")),
            "Data promotion claims unauthorised operational authority")
    for key in ("sourceReviewRef", "sourceReviewPath", "decisionRef", "decisionSha256", "candidateReleaseId",
                "candidateManifestSha256", "referenceSuites", "preparationSnapshot"):
        require(promotion.get(key) == approved.get(key), f"Data promotion governance binding differs: {key}")
    require(promotion.get("sourceReviewPath") == f"{OUTPUT}/source-approval.json", "Unexpected source approval path")
    require(promotion.get("counts") == PROMOTION_COUNTS, "Data promotion scope differs")
    require(set(promotion.get("referenceSuites", {})) == {"AP17B-ANWENDBARKEIT", "AP19B-SOCIAL-REFERENCES-1", "AP20B-SOCIAL-DATES-1"},
            "Incomplete accepted reference-suite scope")
    require(promotion.get("preparationSnapshot", {}).get("evidenceFiles") == 180
            and promotion.get("preparationSnapshot", {}).get("historicalArchives") == 85,
            "Incomplete immutable preparation evidence")
    changes = promotion.get("approvalOnlyChanges", {})
    social = next(item for item in manifest["artifacts"] if item["role"] == "socialProcedureCatalog")
    require(changes.get("path") == social["path"] and changes.get("afterSha256") == social["sha256"]
            and changes.get("legalContentUnchanged") is True and changes.get("sourceReviewDatesUnchanged") is True,
            "Data promotion legal-content binding differs")
    validation = promotion.get("validation", {})
    require(validation.get("core") == "passed" and validation.get("python") == "passed"
            and validation.get("result", {}).get("status") == "passed"
            and validation.get("result", {}).get("manifestSha256") == MANIFEST_SHA256,
            "Data promotion verification missing or mismatched")
    require(sha256(promotion_bytes) == PROMOTION_SHA256, "Data promotion differs from the separately verified immutable original")
    return {"sourceApprovalSha256": source_hash, "dataPromotionSha256": sha256(promotion_bytes)}


def prepare(root: Path, build_evidence: str) -> tuple[dict[str, bytes], dict[str, Any]]:
    evidence_path = safe_name(build_evidence)
    evidence_bytes = file_bytes(root / evidence_path)
    evidence = json.loads(evidence_bytes)
    pin, base_url = data_pin(root)
    validate_build_receipt(evidence, pin)
    _, archived_provenance = collect_build_archive(root, evidence_path)
    mirror, manifest = inspect_data(root, pin)
    governance = inspect_governance(manifest,
        file_bytes(root / OUTPUT / "source-approval.json"), file_bytes(root / OUTPUT / "data-promotion.json"),
        file_bytes(root / safe_name(manifest["extensions"]["steimer.approval"]["decisionRef"])))
    package_path = safe_name(evidence["packagePath"])
    package = file_bytes(root / package_path)
    require(sha256(package) == evidence["packageSha256"], "Selected SPFx bytes changed")
    package_audit = inspect_sppkg(package, json.loads(file_bytes(root / "spfx/config/package-solution.json")), base_url)
    require(sha256(file_bytes(root / PRIOR_PACKAGE)) == PRIOR_SHA256, "Prior package changed")
    require(sha256(file_bytes(root / HISTORICAL_PACKAGE)) == HISTORICAL_SHA256, "Historical 0.4.0.1 package changed")
    web = inspect_web(root / ".work/public-app", manifest, root)
    artifacts = {"fristenrechner-schweiz-0.6.0.0.sppkg": package,
                 "fristenrechner-mvp06-sharepoint-mirror.zip": deterministic_zip(mirror),
                 "fristenrechner-mvp06-steimer-web.zip": deterministic_zip(web)}
    report = {"kind": "mvp06LocalReleaseArtifactVerification", "verifiedOn": "2026-10-01", "status": "passed",
              "applicationVersion": "0.6.0", "spfxVersion": "0.6.0.0", "releaseId": RELEASE_ID,
              "manifestSha256": MANIFEST_SHA256, "pinCommit": pin, "pinVerifiedAgainstLocalGit": True,
              "remotePinPublicationVerified": False, "unpublishedPinRequiresExplicitMirrorForEQ": True,
              "workingTreeProductBuild": True, "fullProductCommit": None,
              **governance,
              **archived_provenance,
              "artifacts": inventory(artifacts), "mirror": inventory(mirror), "web": inventory(web), "spfx": package_audit,
              "priorPackage": {"path": PRIOR_PACKAGE, "version": "0.5.0.0", "sha256": PRIOR_SHA256, "unchanged": True, "role": "last-documented-installed-rollback-package"},
              "historicalPackage": {"path": HISTORICAL_PACKAGE, "version": "0.4.0.1", "sha256": HISTORICAL_SHA256, "unchanged": True},
              "permissions": PERMISSIONS.copy(),
              "limitations": ["Local artifact verification is not an installation or browser test on E/Q.",
                              "The data pin is verified locally, not published to GitHub.",
                              "The locally created data-only Git commit is not a published or complete product commit.",
                              "Earlier accepted P header deviations do not automatically approve a new P release.",
                              "Only BE bindings and the accepted 2026-2027 coverage are released."]}
    return artifacts, report


def verify_archived(root: Path) -> dict[str, Any]:
    """Read-only verification using delivered archives and durable evidence, no .work or network."""
    report = json.loads(file_bytes(root / OUTPUT / "artifact-verification.json"))
    require(report.get("kind") == "mvp06LocalReleaseArtifactVerification" and report.get("status") == "passed"
            and report.get("releaseId") == RELEASE_ID and report.get("manifestSha256") == MANIFEST_SHA256, "Wrong archived report")
    require(report.get("permissions") == PERMISSIONS and report.get("remotePinPublicationVerified") is False
            and report.get("archiveVerificationIndependentOfScratch") is True, "Wrong archived authority or portability claims")
    require(report.get("pinVerifiedAgainstLocalGit") is True and report.get("workingTreeProductBuild") is True
            and report.get("fullProductCommit") is None, "Local Git/data provenance is misrepresented")
    require(report.get("priorPackage") == {"path": PRIOR_PACKAGE, "version": "0.5.0.0", "sha256": PRIOR_SHA256,
            "unchanged": True, "role": "last-documented-installed-rollback-package"}, "Wrong MVP05 rollback provenance")
    require(report.get("historicalPackage") == {"path": HISTORICAL_PACKAGE, "version": "0.4.0.1",
            "sha256": HISTORICAL_SHA256, "unchanged": True}, "Wrong historic package provenance")
    archive = {}
    for item in report["archivedBuildEvidence"]:
        path = safe_name(item["path"])
        require(path.startswith(EVIDENCE + "/") and path not in archive, "Invalid or duplicate archived evidence path")
        content = file_bytes(root / path)
        require(sha256(content) == item["sha256"] and len(content) == item["byteLength"], "Archived evidence changed")
        archive[path] = content
    ref = report["spfxBuildEvidence"]
    require(ref["path"] == f"{EVIDENCE}/spfx-verification.json" and sha256(archive[ref["path"]]) == ref["sha256"], "Archived receipt binding differs")
    receipt = json.loads(archive[ref["path"]])
    pin = report["pinCommit"]
    require(re.fullmatch(r"[a-f0-9]{40}", pin), "Invalid archived data pin")
    validate_build_receipt(receipt, pin)
    require(len(report["archivedBuildLogs"]) == 5, "Incomplete archived logs")
    for log, step in zip(report["archivedBuildLogs"], receipt["steps"]):
        require(log["originalPath"] == step["log"] and sha256(archive[log["archivePath"]]) == log["archivedSha256"], "Archived build log binding differs")
    snapshots = {}
    for item in report["buildInputSnapshots"]:
        content = archive[item["archivePath"]]
        require(item["sourcePath"] not in snapshots and sha256(content) == item["sha256"] and len(content) == item["byteLength"],
                "Archived build input binding differs")
        snapshots[item["sourcePath"]] = content
    require(set(snapshots) == SNAPSHOT_SOURCES | product_input_paths(receipt),
            "Incomplete archived build inputs")
    for item in receipt["productInputFiles"]:
        content = snapshots[item["path"]]
        require(sha256(content) == item["sha256"] and len(content) == item["byteLength"],
                "Archived working-tree source inventory differs from actual build")
    base_url = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{pin}/data/releases/{RELEASE_ID}"
    require(base_url in snapshots["spfx/src/core/config.ts"].decode(), "Archived default pin differs")
    for package_path in ("package.json", "package-lock.json", "spfx/package.json", "spfx/package-lock.json"):
        content = json.loads(snapshots[package_path])
        require(content.get("version") == "0.6.0", "Archived application/package version differs")
        if package_path.endswith("-lock.json"):
            require(content.get("packages", {}).get("", {}).get("version") == "0.6.0", "Archived lock root version differs")
    require("mvp06CalculationData" in snapshots["src/public-app/main.tsx"].decode(), "Wrong archived normal web entry")
    require(RELEASE_ID in snapshots["src/release/mvp06ReleaseData.ts"].decode(), "Wrong archived embedded release import")
    source_manifest = json.loads(snapshots["spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json"])
    require(source_manifest["preconfiguredEntries"][0]["properties"]["githubBaseUrl"] == base_url,
            "Archived source webpart pin differs")
    artifacts = {}
    for item in report["artifacts"]:
        name = safe_name(item["path"])
        require(name in ARTIFACT_NAMES and name not in artifacts, "Unexpected archived artifact")
        content = file_bytes(root / OUTPUT / "artifacts" / name)
        require(sha256(content) == item["sha256"] and len(content) == item["byteLength"], "Archived artifact changed")
        artifacts[name] = content
    require(set(artifacts) == ARTIFACT_NAMES, "Missing archived artifact")
    mirror = zip_files(artifacts["fristenrechner-mvp06-sharepoint-mirror.zip"])
    manifest = inspect_mirror_files(mirror)
    require(inventory(mirror) == report["mirror"], "Mirror receipt differs")
    governance = inspect_governance(manifest, file_bytes(root / OUTPUT / "source-approval.json"),
        file_bytes(root / OUTPUT / "data-promotion.json"), file_bytes(root / safe_name(manifest["extensions"]["steimer.approval"]["decisionRef"])))
    require(all(report[key] == value for key, value in governance.items()), "Archived governance binding differs")
    package = artifacts["fristenrechner-schweiz-0.6.0.0.sppkg"]
    require(sha256(package) == receipt["packageSha256"], "Archived package differs from selected build")
    package_audit = inspect_sppkg(package, json.loads(snapshots["spfx/config/package-solution.json"]), base_url)
    require(package_audit == report["spfx"], "Archived package receipt differs")
    web = inspect_web_files(zip_files(artifacts["fristenrechner-mvp06-steimer-web.zip"]), manifest, snapshots["public-app/.htaccess"])
    require(inventory(web) == report["web"], "Archived web receipt differs")
    return {"status": "passed", "releaseId": RELEASE_ID, "artifacts": len(artifacts), "mirrorFiles": len(mirror),
            "webFiles": len(web), "archivedEvidenceFiles": len(archive), "scratchRequired": False,
            "gitHistoryRequiredForThisArchiveCheck": False, "remotePublicationRechecked": False}


def write_once(path: Path, data: bytes) -> None:
    if path.exists():
        require(file_bytes(path) == data, f"Refusing to overwrite differing output: {path.name}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as stream:
        stream.write(data)
    require(file_bytes(path) == data, "Written artifact differs on readback")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spfx-build", required=True, help="Relative isolated build verification.json")
    args = parser.parse_args()
    artifacts, report = prepare(ROOT, args.spfx_build)
    archive, provenance = collect_build_archive(ROOT, args.spfx_build)
    require(all(report[key] == value for key, value in provenance.items()), "Build evidence changed during packaging")
    outputs = {ROOT / OUTPUT / "artifacts" / name: data for name, data in artifacts.items()}
    outputs.update({ROOT / path: data for path, data in archive.items()})
    outputs[ROOT / OUTPUT / "artifact-verification.json"] = (json.dumps(report, indent=2, ensure_ascii=False) + "\n").encode()
    for path, data in outputs.items():
        require(not path.exists() or file_bytes(path) == data, f"Refusing to overwrite differing output: {path.name}")
    for path, data in outputs.items():
        write_once(path, data)
    verify_archived(ROOT)
    print(json.dumps({"status": "passed", "artifacts": report["artifacts"], "report": f"{OUTPUT}/artifact-verification.json"}, indent=2))


if __name__ == "__main__":
    main()
