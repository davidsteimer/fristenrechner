#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Seal verified local MVP 0.7 artifacts. No network, installation or publication."""
from __future__ import annotations

import argparse
import io
import json
import re
import stat
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any

from prepare_mvp04_artifacts import (
    ArtifactError, require, sha256, file_bytes, safe_name, inventory, zip_files,
    local_name, SOLUTION_ID, FEATURE_ID, WEBPART_ID,
)

ROOT = Path(__file__).resolve().parents[1]
RELEASE_ID = "2026-10-08-mvp-07-approved.1"
OUTPUT = "outputs/release-mvp07-2026-10-08"
EVIDENCE = f"{OUTPUT}/build-evidence"
SOURCE_SHA256 = "478ca3d20ea1d643bb05379f8acc042560fa9547575d62e5d7afd4c8c1213810"
AUTHORITY_SHA256 = "c218888c865e3abbc85d4ea2f0c98664dbbe80e15d64520b78f1a1193b5f3d39"
DECISION_PATH = "docs/betrieb/freigabe-r07-b.md"
DECISION_SHA256 = "e9d3f894f1609d13884e6a02efb0114c9eba521b969dce165adcd2f827131315"
PRIOR_PACKAGE = "outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg"
PRIOR_SHA256 = "60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587"
HISTORICAL_PACKAGE = "spfx/sharepoint/solution/fristenrechner-schweiz.sppkg"
HISTORICAL_SHA256 = "9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346"
PACKAGE_NAME = "fristenrechner-schweiz-0.7.0.0.sppkg"
MIRROR_NAME = "fristenrechner-mvp07-sharepoint-mirror.zip"
WEB_NAME = "fristenrechner-mvp07-steimer-web.zip"
ARTIFACT_NAMES = {PACKAGE_NAME, MIRROR_NAME, WEB_NAME}
PERMISSIONS = {"localDataPromotion": True, "localDefinitiveBuild": True, "eqInstallation": False,
               "publication": False, "hostingChanges": False, "productionActivation": False}
MINIMUM_INPUTS = {"package.json", "package-lock.json", "spfx/package.json", "spfx/package-lock.json",
    "spfx/config/package-solution.json", "spfx/src/core/config.ts", "public-app/.htaccess",
    "src/public-app/main.tsx", "src/release/mvp07ReleaseData.ts", "scripts/build-public-app.mjs",
    "spfx/src/webparts/fristenrechner/FristenrechnerWebPart.manifest.json",
    "schemas/release-manifest-v7.schema.json", "schemas/calendar-rules-v3.schema.json",
    "schemas/holiday-catalog-v2.schema.json"}
TOOL_INPUTS = {"scripts/build-mvp07-spfx.mjs", "scripts/prepare_mvp07_artifacts.py",
              "scripts/build-public-app.mjs", "scripts/browser-globals-plugin.mjs"}


def deterministic_zip(files: dict[str, bytes]) -> bytes:
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(safe_name(name), (2026, 10, 8, 0, 0, 0))
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data, compresslevel=9)
    result = stream.getvalue()
    require(zip_files(result) == files, "ZIP readback differs")
    return result


def write_once(path: Path, data: bytes) -> None:
    if path.exists():
        require(file_bytes(path) == data, f"Refusing to overwrite differing output: {path.name}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as stream:
        stream.write(data)
    require(file_bytes(path) == data, "Written artifact differs on readback")


def product_input_paths(receipt: dict[str, Any]) -> set[str]:
    records = receipt.get("productInputFiles", [])
    require(isinstance(records, list) and records, "Missing bounded product inventory")
    paths = set()
    for item in records:
        name = safe_name(item["path"])
        require(name not in paths, "Duplicate product input")
        require(name in MINIMUM_INPUTS | TOOL_INPUTS or name.startswith(("src/core/", "src/ui/",
            "src/public-app/", "schemas/", "spfx/src/core/", "spfx/src/webparts/", "spfx/scripts/",
            "spfx/config/", "spfx/test/", "spfx/test-build/", "public-app/")), "Unrelated product input")
        require(not name.startswith("src/ui/preview/") and not name.endswith((".pem", ".key", ".map")),
                "Private/development file in product inventory")
        require(re.fullmatch(r"[a-f0-9]{64}", item.get("sha256", "")) is not None
                and type(item.get("byteLength")) is int and item["byteLength"] >= 0, "Invalid product input binding")
        paths.add(name)
    require(MINIMUM_INPUTS <= paths, "Incomplete minimum product inventory")
    return paths


def inspect_governance(manifest_bytes: bytes, source_bytes: bytes, authority_bytes: bytes,
                       decision_bytes: bytes, promotion_bytes: bytes) -> dict[str, str]:
    manifest = json.loads(manifest_bytes)
    require(sha256(source_bytes) == SOURCE_SHA256, "Source approval differs from accepted original")
    require(sha256(authority_bytes) == AUTHORITY_SHA256, "R07-B authority differs from accepted original")
    require(sha256(decision_bytes) == DECISION_SHA256, "Human decision differs from accepted original")
    source, authority, promotion = map(json.loads, (source_bytes, authority_bytes, promotion_bytes))
    require(source.get("recordStatus") == "approved" and source.get("approvedBy") == "David Steimer",
            "Invalid source approval")
    require(source["permissions"]["localDataPromotionAuthorized"] is False,
            "Earlier source approval must not be rewritten as later build authority")
    require(authority.get("declaration") == "Ich gebe R07-B frei."
            and authority.get("sourceApproval") == {"path": f"{OUTPUT}/source-approval.json", "sha256": SOURCE_SHA256}
            and authority.get("decision") == {"path": DECISION_PATH, "sha256": DECISION_SHA256},
            "Broken source/authority/decision binding")
    require(authority["permissions"]["localDataPromotionAuthorized"] is True
            and authority["permissions"]["definitiveLocalBuildAuthorized"] is True, "Missing local authority")
    require(all(value is False for key, value in authority["permissions"].items()
                if key not in {"localDataPromotionAuthorized", "definitiveLocalBuildAuthorized", "localRuntimeDataCommitAuthorized"}),
            "Authority claims external permission")
    require(promotion.get("releaseId") == RELEASE_ID and promotion.get("dataStatus") == "approved",
            "Promotion identity/status differs")
    require(promotion.get("kind") == "mvp07LocalDataPromotion" and promotion.get("implementationAccepted") is True
            and promotion.get("sourceReviewAccepted") is True and promotion.get("legalContentUnchanged") is True
            and promotion.get("historicalSourceMetadataUnchanged") is True, "Promotion acceptance/preservation differs")
    require(promotion.get("manifestSha256") == sha256(manifest_bytes),
            "Promotion manifest digest differs")
    require(all(promotion.get(key) is False for key in ("publicationApproved", "deploymentApproved", "productionActivation")),
            "Promotion claims unauthorised operational authority")
    require(promotion.get("sourceReviewRef", {}).get("sha256") == SOURCE_SHA256, "Promotion source binding differs")
    require(promotion.get("localBuildApproval") == {"path": f"{OUTPUT}/local-build-approval.json", "sha256": AUTHORITY_SHA256}
            and promotion.get("decisionRef") == DECISION_PATH and promotion.get("decisionSha256") == DECISION_SHA256,
            "Promotion local authority binding differs")
    require(promotion.get("counts") == {"artifacts": 40, "runtimeFiles": 41, "unchangedArtifacts": 6,
        "calendars": 32, "catalogRules": 479, "supplementalRules": 12, "provenanceDecisions": 198,
        "terminalBindings": 104, "federalRules": 44, "cantonalBindings": 50, "approvedEligibility": 50},
        "Promotion component/scope counts differ")
    validation = promotion.get("validation", {})
    require(validation.get("core") == "passed" and validation.get("python") == "passed"
            and validation.get("result", {}).get("status") == "passed"
            and validation.get("result", {}).get("manifestSha256") == sha256(manifest_bytes),
            "Promotion verification missing or mismatched")
    approved = manifest.get("extensions", {}).get("steimer.approval", {})
    require(approved.get("sourceReviewRef", {}).get("sha256") == SOURCE_SHA256, "Manifest source approval binding differs")
    require(approved.get("approvedBy") == "David Steimer", "Manifest human approval missing")
    return {"sourceApprovalSha256": SOURCE_SHA256, "localBuildApprovalSha256": AUTHORITY_SHA256,
            "decisionSha256": DECISION_SHA256, "dataPromotionSha256": sha256(promotion_bytes)}


def inspect_mirror_files(files: dict[str, bytes], manifest_sha256: str) -> dict[str, Any]:
    require("manifest.json" in files and sha256(files["manifest.json"]) == manifest_sha256, "Mirror manifest differs")
    manifest = json.loads(files["manifest.json"])
    require(manifest.get("releaseId") == RELEASE_ID and manifest.get("releaseStatus") == "approved"
            and manifest.get("formatVersion") == "7.0.0", "Wrong approved Format-7 release")
    descriptors = manifest["artifacts"]
    require(len(descriptors) == 40 and len(files) == 41
            and set(files) == {"manifest.json", *(item["path"] for item in descriptors)},
            "Mirror must contain exactly 41 unique runtime files")
    require(Counter(row["role"] for row in descriptors) == {"calendar": 32, "legalProfile": 5,
        "holidayCatalog": 1, "specialRegimeCatalog": 1, "socialProcedureCatalog": 1}, "Wrong component inventory")
    formats = {"calendar": "3.0.0", "legalProfile": "1.0.0", "holidayCatalog": "2.0.0",
               "specialRegimeCatalog": "3.0.0", "socialProcedureCatalog": "2.0.0"}
    for row in descriptors:
        name = safe_name(row["path"])
        require(len(files[name]) == row["byteLength"] and sha256(files[name]) == row["sha256"], f"Mirror artifact differs: {name}")
        require(json.loads(files[name])["formatVersion"] == formats[row["role"]], f"Wrong component format: {name}")
    social = json.loads(files[next(row["path"] for row in descriptors if row["role"] == "socialProcedureCatalog")])
    require(len(social["federalRules"]) == 44 and len(social["cantonalBindings"]) == 50
            and len(social["releaseEligibility"]) == 50, "Social scope changed")
    require(all(item.get("status") == "approved" and item.get("releaseId") == RELEASE_ID
                for item in social["releaseEligibility"]), "Social release bindings are not all approved")
    return manifest


def validate_schemas(files: dict[str, bytes], snapshots: dict[str, bytes]) -> None:
    """Offline Draft-2020 validation from the exact archived canonical schemas."""
    import jsonschema
    from referencing import Registry, Resource
    schemas = {name: json.loads(data) for name, data in snapshots.items()
               if name.startswith("schemas/") and name.count("/") == 1 and name.endswith(".json")}
    registry = Registry().with_resources((schema["$id"], Resource.from_contents(schema))
        for schema in schemas.values() if "$id" in schema)
    mapping = {"releaseManifest": "release-manifest-v7", "calendar": "calendar-rules-v3",
               "legalProfile": "legal-profile", "holidayCatalog": "holiday-catalog-v2",
               "specialRegimeCatalog": "special-regime-catalog-v3", "socialProcedureCatalog": "social-procedure-catalog-v2"}
    for name, data in files.items():
        document = json.loads(data)
        schema_name = f"schemas/{mapping[document['dataKind']]}.schema.json"
        require(schema_name in schemas, f"Missing canonical schema: {schema_name}")
        validator = jsonschema.validators.validator_for(schemas[schema_name])
        errors = list(validator(schemas[schema_name], registry=registry,
            format_checker=jsonschema.FormatChecker()).iter_errors(document))
        require(not errors, f"Schema failure {name}: {errors[0].message if errors else ''}")


def inspect_sppkg(data: bytes, config: dict[str, Any], base_url: str) -> dict[str, Any]:
    files = zip_files(data)
    app = ET.fromstring(files["AppManifest.xml"])
    require(app.get("ProductID") == SOLUTION_ID and app.get("Version") == "0.7.0.0", "Wrong solution identity/version")
    require(app.get("IsDomainIsolated") == "false" and app.get("IsClientSideSolution") == "true", "Unexpected application scope")
    solution = config["solution"]
    require(solution.get("id") == SOLUTION_ID and solution.get("version") == "0.7.0.0", "Source/build solution mismatch")
    require(solution.get("includeClientSideAssets") is True and not solution.get("webApiPermissionRequests")
            and not config.get("webApiPermissionRequests"), "Unexpected API permission requests or absent client assets")
    require(len(solution.get("features", [])) == 1 and solution["features"][0]["id"] == FEATURE_ID
            and solution["features"][0]["version"] == "0.7.0.0", "Wrong feature configuration")
    feature = ET.fromstring(files[f"feature_{FEATURE_ID}.xml"])
    require(feature.get("Id") == FEATURE_ID and feature.get("Version") == "0.7.0.0" and feature.get("Scope") == "Web", "Wrong built feature")
    components = []
    for name, content in files.items():
        require(not name.endswith((".map", ".ts", ".tsx", ".pem", ".key")), f"Private/development artifact: {name}")
        if name.endswith((".xml", ".rels")):
            for element in ET.fromstring(content).iter():
                require("permission" not in local_name(element.tag).lower(), f"Unexpected permission in {name}")
                if local_name(element.tag) == "ClientSideComponent":
                    components.append(element)
                if local_name(element.tag) == "Relationship":
                    require(element.get("TargetMode", "Internal") == "Internal"
                            and element.get("Target", "").lstrip("/") in files, "External or unresolved package relationship")
    require(len(components) == 1 and components[0].get("Id") == WEBPART_ID, "Wrong component inventory")
    manifest = json.loads(components[0].attrib["ComponentManifest"])
    require(manifest.get("id") == WEBPART_ID and manifest.get("version") == "0.7.0", "Wrong webpart version")
    require(manifest.get("supportedHosts") == ["SharePointWebPart", "TeamsTab"], "Unexpected hosts")
    entries = manifest.get("preconfiguredEntries", [])
    require(len(entries) == 1 and entries[0].get("properties") == {"providerKind": "github", "githubBaseUrl": base_url,
            "sharePointMirrorPath": ""}, "Wrong immutable default pin")
    bundle = "ClientSideAssets/" + manifest["loaderConfig"]["scriptResources"]["fristenrechner-web-part"]["path"]
    require(bundle in files and bundle + ".LICENSE.txt" in files, "Bundle or licence missing")
    for marker in [base_url, RELEASE_ID, '"7.0.0"', '"3.0.0"', '"2.0.0"', "ch-holiday-catalog", "ch-social-procedures"]:
        require(marker in files[bundle].decode(), f"Missing built consumer marker: {marker}")
    return {"solutionVersion": "0.7.0.0", "featureVersion": "0.7.0.0", "webpartVersion": "0.7.0",
        "solutionId": SOLUTION_ID, "featureId": FEATURE_ID, "webpartId": WEBPART_ID, "additionalApiPermissions": [],
        "defaultGithubBaseUrl": base_url, "bundlePath": bundle, "bundleSha256": sha256(files[bundle]), "entries": inventory(files)}


def inspect_web_files(files: dict[str, bytes], manifest: dict[str, Any], htaccess: bytes) -> None:
    build = json.loads(files["build-manifest.json"])
    require(build.get("application") == "fristenrechner-public" and build.get("version") == "0.7.0"
            and build.get("dataReleaseId") == RELEASE_ID and build.get("deployable") is not False, "Wrong web release metadata")
    require(build.get("basePath") == "/fristenrechner/" and build.get("canonicalUrl") == "https://www.steimer.ch/fristenrechner/", "Wrong hosting target")
    resources = [build["assets"]["javascript"], build["assets"]["stylesheet"], *build["assets"]["vendors"].values()]
    require(len(set(resources)) == 5, "Wrong asset count")
    names = [safe_name(value.removeprefix("./")) for value in resources]
    require(all(re.fullmatch(r"assets/[A-Za-z0-9-]+\.(js|css)", name) for name in names), "Unsafe asset path")
    expected = {"index.html", ".htaccess", "favicon.svg", "build-manifest.json", *names,
                "licenses/react-MIT.txt", "licenses/react-dom-MIT.txt", "licenses/fluent-ui-MIT.txt"}
    require(set(files) == expected, "Unexpected web inventory")
    require(all(value in files["index.html"].decode() for value in resources), "Missing HTML resource link")
    require(files[".htaccess"] == htaccess and b"connect-src 'none'" in htaccess and b"Options -Indexes" in htaccess,
            "Hosting configuration changed or incomplete")
    script = files[names[0]].decode()
    require(RELEASE_ID in script, "Wrong embedded data release")
    require(all(item["sha256"] in script for item in manifest["artifacts"]), "Missing embedded artifact hash")
    require(all(b"Permission is hereby granted" in files[name] for name in expected if name.startswith("licenses/")), "Missing licence")


def validate_build_receipt(receipt: dict[str, Any], pin: str, manifest_hash: str) -> None:
    require(receipt.get("kind") == "mvp07LocalSpfxBuild" and receipt.get("passed") is True
            and receipt.get("releaseId") == RELEASE_ID and receipt.get("manifestSha256") == manifest_hash,
            "Unsuccessful or mismatched build")
    require(receipt.get("pinCommit") == pin and re.fullmatch(r"[a-f0-9]{40}", pin) is not None, "Invalid build pin")
    require(receipt.get("applicationVersion") == "0.7.0" and receipt.get("packageVersion") == "0.7.0.0", "Wrong build versions")
    require(receipt.get("rollbackPackagePath") == PRIOR_PACKAGE and receipt.get("rollbackPackageSha256") == PRIOR_SHA256,
            "Wrong installed rollback package")
    require(all(receipt.get(key) is False for key in ("publicationVerified", "installationAuthorized", "productionActivation")),
            "Build claims external authority")
    require(receipt.get("previousReleaseEvidenceUnchanged") is True, "Earlier evidence preservation not verified")
    product_input_paths(receipt)
    steps = receipt.get("steps", [])
    require([step.get("id") for step in steps] == ["sync", "source-tests", "compile", "css-audit", "package", "built-tests"]
            and all(step.get("exitCode") == 0 for step in steps), "Incomplete or failed build steps")
    expected_source = ['--import', 'tsx', '--test', '--test-concurrency=2', '--test-timeout=60000', *receipt["sourceTestFiles"]]
    expected_built = ['--test', '--test-concurrency=2', '--test-timeout=60000', *receipt["builtTestFiles"]]
    require(steps[1]["args"] == expected_source and steps[5]["args"] == expected_built
            and steps[2]["args"] == ["test", "--clean", "--production"]
            and steps[3]["args"] == ["scripts/audit-product-css.mjs"]
            and steps[4]["args"] == ["package-solution", "--production"], "Build/test command contract differs")
    paths = product_input_paths(receipt)
    require(set(receipt["sourceTestFiles"]) == {path.removeprefix("spfx/") for path in paths if path.startswith("spfx/test/") and path.endswith(".test.ts")}
            and set(receipt["builtTestFiles"]) == {path.removeprefix("spfx/") for path in paths if path.startswith("spfx/test-build/") and path.endswith(".test.cjs")},
            "The build omitted test files")


def collect_archive(root: Path, receipt_path: str) -> tuple[dict[str, bytes], dict[str, Any]]:
    receipt_bytes = file_bytes(root / safe_name(receipt_path))
    receipt = json.loads(receipt_bytes)
    archive = {f"{EVIDENCE}/spfx-verification.json": receipt_bytes}
    snapshots, logs = [], []
    for record in receipt["productInputFiles"]:
        source = safe_name(record["path"])
        data = file_bytes(root / source)
        require(sha256(data) == record["sha256"] and len(data) == record["byteLength"], f"Product input changed: {source}")
        path = f"{EVIDENCE}/inputs/{source}"
        archive[path] = data
        snapshots.append({**record, "archivePath": path})
    for index, step in enumerate(receipt["steps"], 1):
        raw = file_bytes(root / safe_name(step["log"]))
        require(sha256(raw) == step["rawLogSha256"], "Build log changed")
        data = re.sub(r"/Users/[^/\s]+", "/Users/<user>", raw.decode().replace(str(root), "<repository-root>")).encode()
        path = f"{EVIDENCE}/logs/step-{index}.txt"
        archive[path] = data
        logs.append({"archivePath": path, "sha256": sha256(data), "rawLogSha256": sha256(raw), "sourcePath": step["log"]})
    governance = [f"{OUTPUT}/source-approval.json", f"{OUTPUT}/local-build-approval.json",
                  f"{OUTPUT}/data-promotion.json", f"{OUTPUT}/local-data-pin.json",
                  f"{OUTPUT}/source-governance-adoption.json", f"{OUTPUT}/source-version-bridges.json", DECISION_PATH]
    for source in governance:
        archive[f"{EVIDENCE}/governance/{source}"] = file_bytes(root / source)
    return archive, {"archivedBuildEvidence": inventory(archive), "buildInputSnapshots": snapshots,
        "archivedBuildLogs": logs, "spfxBuildEvidence": {"path": f"{EVIDENCE}/spfx-verification.json", "sha256": sha256(receipt_bytes)}}


def prepare(root: Path, receipt_path: str, web_directory: str = ".work/public-app") -> tuple[dict[str, bytes], dict[str, Any]]:
    receipt = json.loads(file_bytes(root / safe_name(receipt_path)))
    promotion_bytes = file_bytes(root / OUTPUT / "data-promotion.json")
    promotion = json.loads(promotion_bytes)
    manifest_hash = promotion["manifestSha256"]
    pin_bytes = file_bytes(root / OUTPUT / "local-data-pin.json")
    pin = json.loads(pin_bytes)
    require(pin.get("releaseId") == RELEASE_ID and pin.get("manifestSha256") == manifest_hash
            and pin.get("localOnly") is True and pin.get("publicationVerified") is False, "Invalid local data pin receipt")
    validate_build_receipt(receipt, pin["commit"], manifest_hash)
    require(receipt["dataPromotionSha256"] == sha256(promotion_bytes)
            and receipt["localDataPinSha256"] == sha256(pin_bytes), "Promotion/pin changed after build")
    manifest_bytes = file_bytes(root / "data/releases" / RELEASE_ID / "manifest.json")
    manifest = json.loads(manifest_bytes)
    mirror = {"manifest.json": manifest_bytes}
    for item in manifest["artifacts"]:
        mirror[safe_name(item["path"])] = file_bytes(root / "data/releases" / RELEASE_ID / item["path"])
    inspect_mirror_files(mirror, manifest_hash)
    for name, data in mirror.items():
        result = subprocess.run(["git", "cat-file", "blob", f"{pin['commit']}:data/releases/{RELEASE_ID}/{name}"], cwd=root, capture_output=True)
        require(result.returncode == 0 and result.stdout == data, f"Pinned Git bytes differ: {name}")
    governance = inspect_governance(manifest_bytes, file_bytes(root / OUTPUT / "source-approval.json"),
        file_bytes(root / OUTPUT / "local-build-approval.json"), file_bytes(root / DECISION_PATH), promotion_bytes)
    archive, provenance = collect_archive(root, receipt_path)
    for field in ("sourceGovernance", "sourceVersionBridges"):
        reference = promotion[field]
        require(sha256(archive[f"{EVIDENCE}/governance/{safe_name(reference['path'])}"]) == reference["sha256"],
                "Promoted governance/version-bridge evidence changed")
    snapshots = {item["path"]: archive[item["archivePath"]] for item in provenance["buildInputSnapshots"]}
    validate_schemas(mirror, snapshots)
    package = file_bytes(root / safe_name(receipt["packagePath"]))
    require(sha256(package) == receipt["packageSha256"], "Built package changed")
    base_url = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{pin['commit']}/data/releases/{RELEASE_ID}"
    package_audit = inspect_sppkg(package, json.loads(snapshots["spfx/config/package-solution.json"]), base_url)
    web = {}
    for path in (root / safe_name(web_directory)).rglob("*"):
        require(not path.is_symlink(), "Symlink in web build")
        if path.is_file():
            web[safe_name(path.relative_to(root / web_directory).as_posix())] = file_bytes(path)
    inspect_web_files(web, manifest, snapshots["public-app/.htaccess"])
    require(sha256(file_bytes(root / PRIOR_PACKAGE)) == PRIOR_SHA256
            and sha256(file_bytes(root / HISTORICAL_PACKAGE)) == HISTORICAL_SHA256, "Old package changed")
    artifacts = {PACKAGE_NAME: package, MIRROR_NAME: deterministic_zip(mirror), WEB_NAME: deterministic_zip(web)}
    report = {"kind": "mvp07LocalReleaseArtifactVerification", "verifiedOn": "2026-10-08", "status": "passed",
        "applicationVersion": "0.7.0", "spfxVersion": "0.7.0.0", "releaseId": RELEASE_ID,
        "manifestSha256": manifest_hash, "pinCommit": pin["commit"], "pinVerifiedAgainstLocalGit": True,
        "remotePinPublicationVerified": False, "unpublishedPinRequiresExplicitMirrorForEQ": True,
        "workingTreeProductBuild": True, "fullProductCommit": None, "archiveVerificationIndependentOfScratch": True,
        **governance, **provenance, "artifacts": inventory(artifacts), "mirror": inventory(mirror),
        "web": inventory(web), "spfx": package_audit, "permissions": PERMISSIONS.copy(),
        "priorPackage": {"path": PRIOR_PACKAGE, "version": "0.6.0.1", "sha256": PRIOR_SHA256, "unchanged": True},
        "historicalPackage": {"path": HISTORICAL_PACKAGE, "version": "0.4.0.1", "sha256": HISTORICAL_SHA256, "unchanged": True},
        "limitations": ["Local build only, not installed, published or accepted on E/Q or P.",
            "Immutable data pin verified locally, not published. E/Q requires its explicitly configured mirror.",
            "Social rules and bindings remain restricted to BE and 2026-2027.",
            "Real iOS/Teams and guest checks require the later separately authorised E/Q stage."]}
    return {**{f"{OUTPUT}/artifacts/{name}": data for name, data in artifacts.items()}, **archive}, report


def verify_archived(root: Path) -> dict[str, Any]:
    """Verify delivered bytes without .work, Git history or current product files."""
    report = json.loads(file_bytes(root / OUTPUT / "artifact-verification.json"))
    require(report.get("kind") == "mvp07LocalReleaseArtifactVerification" and report.get("status") == "passed"
            and report.get("releaseId") == RELEASE_ID and report.get("permissions") == PERMISSIONS
            and report.get("remotePinPublicationVerified") is False and report.get("fullProductCommit") is None
            and report.get("archiveVerificationIndependentOfScratch") is True
            and report.get("pinVerifiedAgainstLocalGit") is True and report.get("workingTreeProductBuild") is True
            and report.get("unpublishedPinRequiresExplicitMirrorForEQ") is True, "Wrong archived scope/status")
    require(report["priorPackage"] == {"path": PRIOR_PACKAGE, "version": "0.6.0.1", "sha256": PRIOR_SHA256, "unchanged": True}
            and report["historicalPackage"] == {"path": HISTORICAL_PACKAGE, "version": "0.4.0.1", "sha256": HISTORICAL_SHA256, "unchanged": True},
            "Rollback provenance differs")
    archive = {}
    for item in report["archivedBuildEvidence"]:
        path = safe_name(item["path"])
        require(path.startswith(EVIDENCE + "/") and path not in archive, "Unexpected or duplicate evidence path")
        data = file_bytes(root / path)
        require(sha256(data) == item["sha256"] and len(data) == item["byteLength"], "Archived evidence changed")
        archive[path] = data
    ref = report["spfxBuildEvidence"]
    require(ref["path"] == f"{EVIDENCE}/spfx-verification.json" and sha256(archive[ref["path"]]) == ref["sha256"], "Build receipt binding differs")
    receipt = json.loads(archive[ref["path"]])
    validate_build_receipt(receipt, report["pinCommit"], report["manifestSha256"])
    require(len(report["archivedBuildLogs"]) == 6, "Missing build logs")
    for log, step in zip(report["archivedBuildLogs"], receipt["steps"]):
        require(sha256(archive[log["archivePath"]]) == log["sha256"] and log["rawLogSha256"] == step["rawLogSha256"]
                and log["sourcePath"] == step["log"], "Archived build log binding differs")
    snapshots = {}
    for item in report["buildInputSnapshots"]:
        require(item["path"] not in snapshots, "Duplicate archived input")
        data = archive[item["archivePath"]]
        require(sha256(data) == item["sha256"] and len(data) == item["byteLength"], "Archived input binding differs")
        snapshots[item["path"]] = data
    require(set(snapshots) == product_input_paths(receipt) and inventory(snapshots) == receipt["productInputFiles"], "Incomplete or stale archived inputs")
    for path in ("package.json", "package-lock.json", "spfx/package.json", "spfx/package-lock.json"):
        doc = json.loads(snapshots[path])
        require(doc.get("version") == "0.7.0", "Archived version differs")
        if path.endswith("-lock.json"):
            require(doc.get("packages", {}).get("", {}).get("version") == "0.7.0", "Archived lock version differs")
    entry = snapshots["src/public-app/main.tsx"]
    require(b"import { mvp07Runtime } from '../release/mvp07ReleaseData'" in entry
            and b"data={mvp07Runtime.data}" in entry and b"calendarRuntime={mvp07Runtime.calendarRuntime}" in entry
            and RELEASE_ID.encode() in snapshots["src/release/mvp07ReleaseData.ts"], "Wrong normal product entry")
    artifacts = {}
    for item in report["artifacts"]:
        name = safe_name(item["path"])
        require(name in ARTIFACT_NAMES and name not in artifacts, "Unexpected artifact")
        data = file_bytes(root / OUTPUT / "artifacts" / name)
        require(sha256(data) == item["sha256"] and len(data) == item["byteLength"], "Archived artifact changed")
        artifacts[name] = data
    require(set(artifacts) == ARTIFACT_NAMES, "Missing artifact")
    mirror = zip_files(artifacts[MIRROR_NAME])
    manifest = inspect_mirror_files(mirror, report["manifestSha256"])
    require(inventory(mirror) == report["mirror"], "Mirror receipt differs")
    validate_schemas(mirror, snapshots)
    governance_bytes = lambda path: archive[f"{EVIDENCE}/governance/{path}"]
    promotion_bytes = governance_bytes(f"{OUTPUT}/data-promotion.json")
    promotion = json.loads(promotion_bytes)
    for field in ("sourceGovernance", "sourceVersionBridges"):
        reference = promotion[field]
        require(sha256(governance_bytes(safe_name(reference["path"]))) == reference["sha256"],
                "Promoted governance/version-bridge archive changed")
    governance = inspect_governance(mirror["manifest.json"], governance_bytes(f"{OUTPUT}/source-approval.json"),
        governance_bytes(f"{OUTPUT}/local-build-approval.json"), governance_bytes(DECISION_PATH), promotion_bytes)
    require(all(report[key] == value for key, value in governance.items())
            and sha256(promotion_bytes) == receipt["dataPromotionSha256"], "Governance receipt differs")
    pin_bytes = governance_bytes(f"{OUTPUT}/local-data-pin.json")
    pin = json.loads(pin_bytes)
    require(sha256(pin_bytes) == receipt["localDataPinSha256"] and pin["commit"] == report["pinCommit"]
            and pin["manifestSha256"] == report["manifestSha256"] and pin["publicationVerified"] is False, "Pin receipt differs")
    base_url = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{pin['commit']}/data/releases/{RELEASE_ID}"
    require(base_url.encode() in snapshots["spfx/src/core/config.ts"], "Archived default pin differs")
    require(sha256(artifacts[PACKAGE_NAME]) == receipt["packageSha256"], "Package differs from selected build")
    require(inspect_sppkg(artifacts[PACKAGE_NAME], json.loads(snapshots["spfx/config/package-solution.json"]), base_url) == report["spfx"], "Package receipt differs")
    web = zip_files(artifacts[WEB_NAME])
    inspect_web_files(web, manifest, snapshots["public-app/.htaccess"])
    require(inventory(web) == report["web"], "Web receipt differs")
    for name in (MIRROR_NAME, WEB_NAME):
        require(deterministic_zip(zip_files(artifacts[name])) == artifacts[name], "Non-deterministic ZIP output")
    return {"status": "passed", "releaseId": RELEASE_ID, "artifacts": 3, "mirrorFiles": len(mirror),
        "webFiles": len(web), "archivedEvidenceFiles": len(archive), "scratchRequired": False,
        "gitHistoryRequiredForThisArchiveCheck": False, "remotePublicationRechecked": False}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spfx-build", help="Relative isolated build verification.json")
    parser.add_argument("--web-build", default=".work/public-app", help="Relative completed normal web build directory")
    parser.add_argument("--verify", action="store_true", help="Read-only verification of already delivered artifacts")
    args = parser.parse_args()
    if args.verify:
        require(not args.spfx_build, "Verification cannot select another build")
        print(json.dumps(verify_archived(ROOT), indent=2))
        return
    require(bool(args.spfx_build), "--spfx-build is required when packaging")
    outputs, report = prepare(ROOT, args.spfx_build, args.web_build)
    outputs[f"{OUTPUT}/artifact-verification.json"] = (json.dumps(report, indent=2, ensure_ascii=False) + "\n").encode()
    for path, data in outputs.items():
        require(not (ROOT / path).exists() or file_bytes(ROOT / path) == data, f"Refusing to overwrite differing output: {path}")
    for path, data in outputs.items():
        write_once(ROOT / path, data)
    print(json.dumps(verify_archived(ROOT), indent=2))


if __name__ == "__main__":
    main()
