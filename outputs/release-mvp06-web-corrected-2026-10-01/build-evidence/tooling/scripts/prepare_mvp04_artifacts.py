#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Audit completed local builds and prepare portable MVP 0.4 artifacts.

Uses only Python's standard library. No build, network, publication or deployment
operation is performed. Existing differing outputs are never overwritten.
"""

from __future__ import annotations

import hashlib
import io
import json
import re
import stat
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path, PurePosixPath
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
RELEASE_ID = "2026-09-22-mvp-04-approved.1"
PIN_COMMIT = "739876a0d11b550ea8cc702622ab22af321994a5"
MANIFEST_SHA256 = "a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e"
ROLLBACK_SHA256 = "a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1"
SOLUTION_ID = "13090feb-a6bf-40fa-9d3c-ec8d90516a60"
FEATURE_ID = "3edf1509-41e9-4a2f-8005-df510eec43b6"
WEBPART_ID = "596c7f1c-4d3e-4da8-a7be-27a96024f37c"
BASE_URL = f"https://raw.githubusercontent.com/davidsteimer/fristenrechner/{PIN_COMMIT}/data/releases/{RELEASE_ID}"
SPPKG = "spfx/sharepoint/solution/fristenrechner-schweiz.sppkg"
ROLLBACK = ".work/release-mvp04-2026-09-22/rollback/fristenrechner-schweiz-0.3.0.0.sppkg"
ARTIFACT_DIRECTORY = ".work/release-mvp04-2026-09-22/artifacts"
REPORT = "outputs/release-mvp04-2026-09-22/artifact-verification.json"
ZIP_TIMESTAMP = (2026, 9, 22, 0, 0, 0)


class ArtifactError(ValueError):
    """A prepared release artifact failed its bounded publication-independent audit."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ArtifactError(message)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_bytes(file: Path) -> bytes:
    require(not file.is_symlink() and file.is_file(), f"Not a regular input file: {file.name}")
    return file.read_bytes()


def safe_name(name: str) -> str:
    parts = PurePosixPath(name).parts
    require(bool(name) and not name.startswith("/") and "\\" not in name
            and ".." not in parts and name == PurePosixPath(name).as_posix(), f"Unsafe archive path: {name}")
    return name


def inventory(files: dict[str, bytes]) -> list[dict[str, Any]]:
    return [{"path": name, "byteLength": len(data), "sha256": sha256(data)}
            for name, data in sorted(files.items())]


def zip_files(data: bytes) -> dict[str, bytes]:
    files: dict[str, bytes] = {}
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            require(archive.testzip() is None, "ZIP CRC verification failed")
            seen: set[str] = set()
            for entry in archive.infolist():
                name = entry.filename.rstrip("/") if entry.is_dir() else entry.filename
                safe_name(name)
                require(entry.filename not in seen, f"Duplicate ZIP member: {entry.filename}")
                seen.add(entry.filename)
                require(not entry.flag_bits & 1, "Encrypted ZIP member is not allowed")
                require(stat.S_IFMT(entry.external_attr >> 16) != stat.S_IFLNK, "ZIP symlink is not allowed")
                if not entry.is_dir():
                    files[name] = archive.read(entry)
    except zipfile.BadZipFile as error:
        raise ArtifactError("Invalid ZIP input") from error
    return files


def deterministic_zip(files: dict[str, bytes]) -> bytes:
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(files.items()):
            safe_name(name)
            info = zipfile.ZipInfo(name, ZIP_TIMESTAMP)
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, data, compresslevel=9)
    result = stream.getvalue()
    require(zip_files(result) == files, "Generated ZIP content differs on readback")
    return result


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def inspect_sppkg(data: bytes, solution_config: dict[str, Any], *,
                  expected_version: str = "0.4.0.0") -> dict[str, Any]:
    require(expected_version in {"0.4.0.0", "0.4.0.1"}, "Unsupported explicit SPFx package version")
    files = zip_files(data)
    require("AppManifest.xml" in files, "SPPKG has no AppManifest.xml")
    app = ET.fromstring(files["AppManifest.xml"])
    require(app.get("ProductID") == SOLUTION_ID, "Unexpected solution ID")
    require(app.get("Version") == expected_version, f"SPPKG is not version {expected_version}")
    require(app.get("IsDomainIsolated") == "false", "Domain-isolated package not allowed")
    require(app.get("IsClientSideSolution") == "true", "Expected a client-side solution")
    solution = solution_config["solution"]
    require(solution.get("id") == SOLUTION_ID and solution.get("version") == expected_version, "Package configuration differs from built solution")
    require(solution.get("includeClientSideAssets") is True, "Client-side assets must be included")
    require(not solution.get("webApiPermissionRequests") and not solution_config.get("webApiPermissionRequests"), "Unexpected additional API permissions")
    require(solution.get("features") == [{
        "title": "Fristenrechner Schweiz",
        "description": "Aktiviert den Fristenrechner für SharePoint und Microsoft Teams.",
        "id": FEATURE_ID, "version": expected_version
    }], "Unexpected solution feature configuration")
    feature_name = f"feature_{FEATURE_ID}.xml"
    require(feature_name in files, "Expected feature is missing")
    feature = ET.fromstring(files[feature_name])
    require(feature.get("Id") == FEATURE_ID and feature.get("Version") == expected_version, "Built feature identity/version differs")
    require(feature.get("Scope") == "Web", "Unexpected feature deployment scope")
    components = []
    for name, content in files.items():
        require(not name.endswith((".map", ".ts", ".tsx", ".pem", ".key")), f"Development/private file in package: {name}")
        if not name.endswith((".xml", ".rels")):
            continue
        document = ET.fromstring(content)
        for element in document.iter():
            require("permission" not in local_name(element.tag).lower(), f"Unexpected permission declaration in {name}")
            if local_name(element.tag) == "ClientSideComponent":
                components.append(element)
            if local_name(element.tag) == "Relationship":
                require(element.get("TargetMode", "Internal") == "Internal", "External package relationship")
                target = element.get("Target", "").lstrip("/")
                require(target in files, f"Unresolved package relationship: {target}")
    require(len(components) == 1 and components[0].get("Id") == WEBPART_ID, "Unexpected webpart component inventory")
    manifest = json.loads(components[0].attrib["ComponentManifest"])
    require(manifest.get("id") == WEBPART_ID and manifest.get("version") == "0.4.0", "Built webpart identity/version differs")
    require(manifest.get("supportedHosts") == ["SharePointWebPart", "TeamsTab"], "Unexpected supported hosts")
    entries = manifest.get("preconfiguredEntries", [])
    require(len(entries) == 1, "Unexpected webpart entries")
    require(entries[0].get("properties") == {"providerKind": "github", "githubBaseUrl": BASE_URL, "sharePointMirrorPath": ""}, "Built webpart has a wrong default data pin")
    resources = manifest["loaderConfig"]["scriptResources"]
    main_name = "ClientSideAssets/" + resources["fristenrechner-web-part"]["path"]
    require(main_name in files, "Webpart bundle is missing")
    script = files[main_name].decode("utf-8")
    for marker in [BASE_URL, RELEASE_ID, '"4.0.0"', "ch-holiday-catalog"]:
        require(marker in script, f"SPFx bundle does not contain required marker: {marker}")
    require(main_name + ".LICENSE.txt" in files, "SPFx bundle licence is missing")
    return {"solutionId": SOLUTION_ID, "solutionVersion": expected_version, "featureId": FEATURE_ID,
            "featureVersion": expected_version, "webpartId": WEBPART_ID, "webpartVersion": "0.4.0",
            "defaultGithubBaseUrl": BASE_URL, "additionalApiPermissions": [],
            "embeddedPinVerified": True, "entries": inventory(files)}


def git_blob(root: Path, relative: str) -> bytes:
    command = subprocess.run(["git", "cat-file", "blob", f"{PIN_COMMIT}:{relative}"],
                             cwd=root, capture_output=True, check=False)
    require(command.returncode == 0, f"Pinned commit does not contain {relative}")
    return command.stdout


def inspect_data(root: Path, git_root: Path | None = None) -> tuple[dict[str, bytes], dict[str, Any]]:
    directory = root / "data/releases" / RELEASE_ID
    manifest_bytes = file_bytes(directory / "manifest.json")
    require(sha256(manifest_bytes) == MANIFEST_SHA256, "Approved manifest hash differs")
    manifest = json.loads(manifest_bytes)
    require(manifest["releaseId"] == RELEASE_ID and manifest["releaseStatus"] == "approved", "Not the approved MVP04 data release")
    require(manifest["formatVersion"] == "4.0.0" and len(manifest["artifacts"]) == 9, "Unexpected manifest contract")
    files = {"manifest.json": manifest_bytes}
    for artifact in manifest["artifacts"]:
        name = safe_name(artifact["path"])
        data = file_bytes(directory / name)
        require(len(data) == artifact["byteLength"] and sha256(data) == artifact["sha256"], f"Manifest artifact differs: {name}")
        require(name not in files, f"Duplicate manifest artifact: {name}")
        files[name] = data
    for name, data in files.items():
        relative = f"data/releases/{RELEASE_ID}/{name}"
        require(git_blob(git_root or root, relative) == data, f"Local bytes differ from pinned Git commit: {name}")
    return files, manifest


def inspect_web(directory: Path, data_manifest: dict[str, Any]) -> dict[str, bytes]:
    build = json.loads(file_bytes(directory / "build-manifest.json"))
    require(build.get("application") == "fristenrechner-public" and build.get("version") == "0.4.0", "Web build is not MVP 0.4")
    require(build.get("dataReleaseId") == RELEASE_ID, "Web build data release differs")
    require(build.get("deployable") is not False, "Local candidate web build is not a release artifact")
    require(build.get("basePath") == "/fristenrechner/" and build.get("canonicalUrl") == "https://www.steimer.ch/fristenrechner/", "Unexpected public hosting target")
    resources = [build["assets"]["javascript"], build["assets"]["stylesheet"], *build["assets"]["vendors"].values()]
    require(len(set(resources)) == 5, "Unexpected or duplicate web assets")
    names = [safe_name(resource.removeprefix("./")) for resource in resources]
    require(all(re.fullmatch(r"assets/[A-Za-z0-9-]+\.(js|css)", name) for name in names), "Unexpected web asset filename")
    expected = {"index.html", ".htaccess", "favicon.svg", "build-manifest.json", *names,
                "licenses/react-MIT.txt", "licenses/react-dom-MIT.txt", "licenses/fluent-ui-MIT.txt"}
    actual: set[str] = set()
    for file in directory.rglob("*"):
        require(not file.is_symlink(), f"Symlink in web output: {file.name}")
        if file.is_file():
            actual.add(file.relative_to(directory).as_posix())
    require(actual == expected, f"Unexpected/missing web files: {sorted(actual ^ expected)}")
    files = {name: file_bytes(directory / name) for name in sorted(expected)}
    index = files["index.html"].decode("utf-8")
    for resource in resources:
        require(resource in index, f"Web index does not reference {resource}")
    htaccess = files[".htaccess"].decode("utf-8")
    require("Options -Indexes" in htaccess and "connect-src 'none'" in htaccess, "Required static-host security settings missing")
    script = files[names[0]].decode("utf-8")
    require(RELEASE_ID in script, "Web bundle does not embed the approved data release")
    for artifact in data_manifest["artifacts"]:
        require(artifact["sha256"] in script, f"Web bundle lacks the manifest hash for {artifact['path']}")
    for name in expected:
        if name.startswith("licenses/"):
            require(b"Permission is hereby granted" in files[name], f"Expected MIT licence text missing: {name}")
    return files


def prepare(root: Path = ROOT, git_root: Path | None = None) -> tuple[dict[str, bytes], dict[str, Any]]:
    mirror, manifest = inspect_data(root, git_root)
    package_bytes = file_bytes(root / SPPKG)
    solution_config = json.loads(file_bytes(root / "spfx/config/package-solution.json"))
    package_audit = inspect_sppkg(package_bytes, solution_config)
    rollback = file_bytes(root / ROLLBACK)
    require(sha256(rollback) == ROLLBACK_SHA256, "Rollback package hash differs")
    rollback_manifest = ET.fromstring(zip_files(rollback)["AppManifest.xml"])
    require(rollback_manifest.get("Version") == "0.3.0.0" and rollback_manifest.get("ProductID") == SOLUTION_ID, "Rollback package identity differs")
    web = inspect_web(root / ".work/public-app", manifest)
    artifacts = {
        "fristenrechner-schweiz-0.4.0.0.sppkg": package_bytes,
        "fristenrechner-mvp04-sharepoint-mirror.zip": deterministic_zip(mirror),
        "fristenrechner-mvp04-steimer-web.zip": deterministic_zip(web)
    }
    report = {
        "kind": "mvp04LocalPortableArtifactVerification", "checkedOn": "2026-09-22",
        "status": "passed", "releaseId": RELEASE_ID, "applicationVersion": "0.4.0",
        "pinCommit": PIN_COMMIT, "manifestSha256": MANIFEST_SHA256,
        "publicationVerified": False, "deploymentApproved": False, "productionActivation": False,
        "verificationScope": "Local package, committed data identity and portable archive readback only. No remote publication or target-environment test.",
        "artifactDirectory": ARTIFACT_DIRECTORY, "artifacts": inventory(artifacts),
        "sppkg": {"source": SPPKG, "copyByteIdentical": True, **package_audit},
        "mirror": {"formatVersion": "4.0.0", "archiveRoot": "manifest.json plus nine declared artifacts",
                   "destinationReleaseDirectory": RELEASE_ID, "gitCommitByteIdentityVerified": True,
                   "entries": inventory(mirror)},
        "web": {"source": ".work/public-app", "targetBasePath": "/fristenrechner/",
                "hiddenHtaccessIncluded": True, "licencesIncluded": True,
                "manifestArtifactHashMarkersVerified": True, "entries": inventory(web)},
        "zipReproducibility": {"timestamp": list(ZIP_TIMESTAMP), "sortedPaths": True,
                               "compression": "deflate-9", "unixFileMode": "0644", "readbackVerified": True},
        "rollback": {"path": ROLLBACK, "sha256": ROLLBACK_SHA256, "byteLength": len(rollback),
                     "version": "0.3.0.0", "unchanged": True}
    }
    return artifacts, report


def write(artifacts: dict[str, bytes], report: dict[str, Any], root: Path = ROOT) -> None:
    require(inventory(artifacts) == report["artifacts"], "Artifact bytes changed after audit")
    require(report["publicationVerified"] is False and report["deploymentApproved"] is False,
            "Local artifact preparation cannot assert publication or deployment approval")
    outputs = [(root / ARTIFACT_DIRECTORY / safe_name(name), data) for name, data in artifacts.items()]
    report_bytes = (json.dumps(report, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    outputs.append((root / REPORT, report_bytes))
    for file, data in outputs:
        if file.exists() or file.is_symlink():
            require(file_bytes(file) == data, f"Existing artifact differs, no overwrite: {file.name}")
    for file, data in outputs:
        file.parent.mkdir(parents=True, exist_ok=True)
        try:
            with file.open("xb") as stream:
                stream.write(data)
        except FileExistsError:
            pass
        require(file_bytes(file) == data, f"Artifact disk readback differs: {file.name}")


def main() -> int:
    require(len(sys.argv) == 1, "No build, overwrite, publication or deployment arguments are accepted")
    artifacts, report = prepare()
    write(artifacts, report)
    print(json.dumps({"status": "passed", "report": REPORT, "artifacts": report["artifacts"],
                      "publicationVerified": False, "deploymentApproved": False}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
