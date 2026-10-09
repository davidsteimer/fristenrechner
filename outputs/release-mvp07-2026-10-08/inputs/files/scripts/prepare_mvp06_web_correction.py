#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Isolated, bounded web rebuild using the accepted SPFx 0.6.0.1 product inputs.

Never overwrites prior releases, changes runtime sources, deploys or contacts a
remote service. --check validates archived output without a disposable stage.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from prepare_mvp04_artifacts import file_bytes, inventory, require, safe_name, sha256, zip_files
from prepare_mvp06_artifacts import (
    MANIFEST_SHA256, RELEASE_ID, deterministic_zip, inspect_data, inspect_mirror_files, inspect_web_files,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = "outputs/release-mvp06-web-corrected-2026-10-01"
ORIGINAL = "outputs/release-mvp06-2026-10-01"
CORRECTION = "outputs/release-mvp06-spfx-0.6.0.1-2026-10-01"
SPPKG = f"{CORRECTION}/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg"
SPPKG_SHA256 = "60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587"
SPFX_RECEIPT_SHA256 = "66f590d1b8942b9bddb76646f0ed0f74c5bad395b58b6ac28fbf006d19a20143"
ORIGINAL_RECEIPT_SHA256 = "b1605744fe22e21aa012a78cb941ea5573fe4962fb1e11ad09b6331116f752ad"
ORIGINAL_WEB_SHA256 = "3b54e098124649e18036303d38747f41b6374d913182766197fe65d34789d2ae"
PIN = "19b37336974f3ba7c72333763e1272425239b8cd"
NODE = ".work/toolchains/node-v22.23.2-darwin-arm64/bin/node"
ZIP_NAME = "fristenrechner-mvp06-steimer-web-corrected-0601.zip"
SELF = "scripts/prepare_mvp06_web_correction.py"


def tree(directory: Path) -> dict[str, bytes]:
    result = {}
    for path in sorted(directory.rglob("*")):
        require(not path.is_symlink(), f"Unexpected symlink: {path.name}")
        if path.is_file() and path.name != ".DS_Store" and path.suffix != ".pyc":
            result[safe_name(path.relative_to(directory).as_posix())] = file_bytes(path)
    return result


def write_new(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as stream:
        stream.write(data)
    require(file_bytes(path) == data, f"Write/readback differs: {path.name}")


def audit_correction(files: dict[str, bytes]) -> dict:
    manifest = json.loads(files["build-manifest.json"])
    script = files[manifest["assets"]["javascript"].removeprefix("./")].decode()
    css = files[manifest["assets"]["stylesheet"].removeprefix("./")].decode()
    selected = re.search(r"\.fr-form__grid\s+\.fr-holiday-connections\s+\.ms-Dropdown-title\{([^}]+)\}", css)
    require(selected is not None, "Missing holiday field CSS selector")
    declarations = {part.strip() for part in selected.group(1).split(";")}
    require({"height:auto", "white-space:normal", "overflow:visible", "text-overflow:clip", "overflow-wrap:anywhere"} <= declarations,
            "The built title wrapping correction is incomplete")
    require("fr-procedure-choice fr-holiday-connections" in script and 'className:"fr-holiday-connections"' in script,
            "The shared general/social UI hooks are missing")
    for declaration in ['whiteSpace:"normal"', 'overflow:"visible"', 'textOverflow:"clip"', 'overflowWrap:"anywhere"']:
        require(declaration in script, f"Built Fluent option text lacks {declaration}")
    for slot in ["dropdownOptionText", "dropdownItem", "dropdownItemSelected", "dropdownItemDisabled", "dropdownItemSelectedAndDisabled"]:
        require(re.search(rf"\b{slot}:", script) is not None, f"Missing Fluent style slot: {slot}")
    require('height:"auto",minHeight:36,paddingTop:7,paddingBottom:7' in script, "Missing auto-height option rows")
    require(re.search(r"\bfetch\s*\(|new XMLHttpRequest\b|new WebSocket\b|new EventSource\b", script) is None,
            "Unexpected external runtime transport")
    require(not re.search(r"stpo-weekend|vrpg-special-gate|qaPresets|SYNTHETIC TEST|TEST-NOT-A-RELEASE", script),
            "QA-only marker in public app")
    return {"titleWrapping": True, "generalAndSocialHooks": True, "fluentOptionWrapping": True,
            "allFourOptionRowSlots": True, "noRuntimeNetworkTransport": True,
            "noQaPresetsOrSyntheticApprovals": True, "browserVisualAcceptanceClaimed": False}


def checked_inputs() -> tuple[dict[str, bytes], list[dict], dict, dict]:
    correction_bytes = file_bytes(ROOT / CORRECTION / "artifact-verification.json")
    original_bytes = file_bytes(ROOT / ORIGINAL / "artifact-verification.json")
    require(sha256(correction_bytes) == SPFX_RECEIPT_SHA256, "Frozen correction receipt differs")
    require(sha256(original_bytes) == ORIGINAL_RECEIPT_SHA256, "Frozen original receipt differs")
    require(sha256(file_bytes(ROOT / SPPKG)) == SPPKG_SHA256, "Accepted package differs")
    require(sha256(file_bytes(ROOT / ORIGINAL / "artifacts/fristenrechner-mvp06-steimer-web.zip")) == ORIGINAL_WEB_SHA256,
            "The original web archive differs")
    correction, original = json.loads(correction_bytes), json.loads(original_bytes)
    require(correction.get("passed") is True and correction.get("packageVersion") == "0.6.0.1"
            and correction.get("manifestSha256") == MANIFEST_SHA256 and correction.get("pinCommit") == PIN,
            "Wrong accepted correction contract")
    inputs, bindings = {}, []
    for item in correction["archivedInputSnapshots"]:
        path = safe_name(item["path"])
        if not path.startswith(("src/core/", "src/ui/", "src/release/", "schemas/")) and path != "spfx/src/core/config.ts":
            continue
        archived = safe_name(item["archivedPath"])
        data = file_bytes(ROOT / archived)
        require(sha256(data) == item["sha256"] and len(data) == item["byteLength"], f"Frozen source differs: {path}")
        require(data == file_bytes(ROOT / path), f"Working product differs from accepted 0.6.0.1: {path}")
        inputs[path] = data
        bindings.append({"path": path, "origin": "accepted-spfx-0.6.0.1-input", "sourceSnapshot": archived,
                         "sha256": sha256(data), "byteLength": len(data)})
    for item in original["buildInputSnapshots"]:
        path = safe_name(item["sourcePath"])
        if not (path.startswith(("src/public-app/", "public-app/"))
                or path in {"scripts/build-public-app.mjs", "scripts/browser-globals-plugin.mjs", "package.json", "package-lock.json"}):
            continue
        archived = safe_name(item["archivePath"])
        data = file_bytes(ROOT / archived)
        require(sha256(data) == item["sha256"] and len(data) == item["byteLength"], f"Frozen web wrapper differs: {path}")
        if path == "package.json":
            # Public/private test command separation may change scripts, not build dependencies.
            approved, current = json.loads(data), json.loads(file_bytes(ROOT / path))
            for key in ["name", "version", "license", "type", "engines", "packageManager", "dependencies", "devDependencies"]:
                require(approved.get(key) == current.get(key), f"Unaccepted package contract change: {key}")
        else:
            require(data == file_bytes(ROOT / path), f"Working web wrapper differs: {path}")
        inputs[path] = data
        bindings.append({"path": path, "origin": "unchanged-original-web-input", "sourceSnapshot": archived,
                         "sha256": sha256(data), "byteLength": len(data)})
    expected_product = set()
    for directory in ["src/core", "src/ui", "src/release", "schemas", "src/public-app", "public-app"]:
        expected_product.update(f"{directory}/{name}" for name in tree(ROOT / directory)
                                if not f"{directory}/{name}".startswith("src/ui/preview/"))
    require(expected_product <= set(inputs), f"Unbound runtime sources: {sorted(expected_product - set(inputs))}")
    require("src/ui/holidayConnectionDropdown.ts" in inputs and "src/release/mvp06ReleaseData.ts" in inputs, "Incomplete runtime source binding")
    return inputs, sorted(bindings, key=lambda row: row["path"]), correction, original


def public_data_readback() -> tuple[dict[str, bytes], dict]:
    """Check the published data bytes, without treating a readback as a fresh Git audit."""
    directory = ROOT / "data/releases" / RELEASE_ID
    manifest_bytes = file_bytes(directory / "manifest.json")
    require(sha256(manifest_bytes) == MANIFEST_SHA256, "Approved manifest hash differs")
    manifest = json.loads(manifest_bytes)
    files = {"manifest.json": manifest_bytes}
    for item in manifest["artifacts"]:
        path = safe_name(item["path"])
        require(path not in files, "Duplicate public data artifact")
        files[path] = file_bytes(directory / path)
    inspect_mirror_files(files)
    return files, manifest


def check(output: Path = ROOT / OUTPUT, *, public_readback: bool = False) -> dict:
    receipt = json.loads(file_bytes(output / "artifact-verification.json"))
    require(receipt.get("passed") is True and receipt.get("releaseId") == RELEASE_ID, "Unsuccessful or wrong web receipt")
    require(receipt.get("spfxPackage", {}).get("sha256") == SPPKG_SHA256, "Wrong matching SPFx package")
    data, manifest = public_data_readback() if public_readback else inspect_data(ROOT, PIN)
    require(receipt.get("runtimeDataFiles") == inventory(data), "Runtime data inventory differs")
    packed = file_bytes(output / "artifacts" / ZIP_NAME)
    require(sha256(packed) == receipt["archive"]["sha256"] and len(packed) == receipt["archive"]["byteLength"], "Archive digest differs")
    files = zip_files(packed)
    require(files == tree(output / "web") and inventory(files) == receipt["webFiles"], "Web file readback differs")
    require(deterministic_zip(files) == packed, "Archive is not reproducible from its archived web files")
    archived_inputs = {}
    for row in receipt["inputBindings"]:
        data = file_bytes(output / "build-evidence/inputs" / safe_name(row["path"]))
        require(sha256(data) == row["sha256"] and len(data) == row["byteLength"], "Archived input differs")
        require(data == file_bytes(ROOT / safe_name(row["sourceSnapshot"])), "Accepted source snapshot differs")
        archived_inputs[row["path"]] = data
    inspect_web_files(files, manifest, archived_inputs["public-app/.htaccess"])
    require(audit_correction(files) == receipt["correctionAudit"], "Built correction differs")
    for step in receipt["steps"]:
        require(step["exitCode"] == 0 and sha256(file_bytes(output / safe_name(step["log"]))) == step["sha256"], "Test/build log differs")
    for row in receipt["toolingSnapshots"]:
        require(sha256(file_bytes(output / safe_name(row["archivePath"]))) == row["sha256"], "Builder/tool snapshot differs")
    if public_readback:
        # The full local preservation inventories include deliberately unpublished
        # historical .work evidence. Public readback verifies fixed public anchors,
        # not the continued existence of those private historical files.
        for path, expected in {
            SPPKG: SPPKG_SHA256,
            f"{CORRECTION}/artifact-verification.json": SPFX_RECEIPT_SHA256,
            f"{ORIGINAL}/artifact-verification.json": ORIGINAL_RECEIPT_SHA256,
            f"{ORIGINAL}/artifacts/fristenrechner-mvp06-steimer-web.zip": ORIGINAL_WEB_SHA256,
        }.items():
            require(sha256(file_bytes(ROOT / path)) == expected, "Fixed public release anchor differs")
    else:
        for frozen in receipt["preservedOutputs"]:
            require(inventory(tree(ROOT / frozen["path"])) == frozen["files"], "Prior release tree changed")
    return {"passed": True, "archive": receipt["archive"], "webFiles": len(files), "archivedInputs": len(archived_inputs),
            "archiveIndependentOfScratch": True, "publicReadback": public_readback,
            "gitPinCheckedNow": not public_readback, "gitPinValidatedAtOriginalBuild": True,
            "fullHistoricalPreservationCheckedNow": not public_readback,
            "fixedPublicReleaseAnchorsCheckedNow": public_readback}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--public-readback", action="store_true", help="Only with --check. Verify public bytes without Git or private historical evidence.")
    args = parser.parse_args()
    require(not args.public_readback or args.check, "--public-readback requires --check and never enables a build")
    if args.check:
        print(json.dumps(check(public_readback=args.public_readback), indent=2))
        return
    require(not (ROOT / OUTPUT).exists(), "Existing correction output must not be overwritten. Use --check.")
    require(not os.environ.get("FRISTENRECHNER_DATA_CANDIDATE"), "A candidate override is not permitted")
    inputs, bindings, correction, _ = checked_inputs()
    data_files, manifest = inspect_data(ROOT, PIN)
    preserved = [{"path": directory, "files": inventory(tree(ROOT / directory))} for directory in [ORIGINAL, CORRECTION]]
    stage = Path(tempfile.mkdtemp(prefix="mvp06-web-corrected-", dir=ROOT / ".work"))
    for path, data in inputs.items():
        write_new(stage / path, data)
    shutil.copytree(ROOT / "data", stage / "data")
    shutil.copytree(ROOT / "tests/public-app", stage / "tests/public-app")
    (stage / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
    node = ROOT / NODE
    require(subprocess.run([str(node), "--version"], capture_output=True, text=True, check=True).stdout.strip() == "v22.23.2", "Wrong Node toolchain")
    steps, log_bytes = [], {}
    env = {**os.environ, "PATH": f"{node.parent}:{os.environ.get('PATH', '')}", "FRISTENRECHNER_DATA_CANDIDATE": ""}
    def run(label: str, args: list[str]) -> None:
        result = subprocess.run([str(node), *args], cwd=stage, env=env, capture_output=True)
        raw = result.stdout + result.stderr
        write_new(stage / f"step-{len(steps) + 1}.log", raw)
        sanitized = raw.replace(str(stage).encode(), b"<isolated-build>").replace(str(ROOT).encode(), b"<repository>")
        name = f"build-evidence/step-{len(steps) + 1}.log"
        log_bytes[name] = sanitized
        steps.append({"label": label, "command": "node", "args": args, "exitCode": result.returncode,
                      "log": name, "sha256": sha256(sanitized), "rawLogSha256": sha256(raw)})
        print(json.dumps({"step": label, "exitCode": result.returncode}), flush=True)
        require(result.returncode == 0, f"Failed isolated build/test. Inspect {stage.relative_to(ROOT)}/step-{len(steps)}.log")
    tests = sorted(str(path.relative_to(stage)) for path in (stage / "tests/public-app").glob("*.test.ts"))
    require(len(tests) >= 2, "Missing public build tests")
    run("All public application build tests in isolated source copy", ["--import", "tsx", "--test", "--test-concurrency=1", *tests])
    run("Corrected definitive public build", ["scripts/build-public-app.mjs"])
    web = tree(stage / ".work/public-app")
    inspect_web_files(web, manifest, inputs["public-app/.htaccess"])
    correction_audit = audit_correction(web)
    run("Independent repeated build from the same isolated accepted inputs", ["scripts/build-public-app.mjs"])
    require(tree(stage / ".work/public-app") == web, "Repeated builds differ")
    packed = deterministic_zip(web)
    require(deterministic_zip(web) == packed, "Repeated ZIP construction differs")
    require(sha256(packed) != ORIGINAL_WEB_SHA256, "The correction did not change the old web archive")
    _, current_bindings, _, _ = checked_inputs()
    require(current_bindings == bindings and inspect_data(ROOT, PIN)[0] == data_files, "Input changed during build")
    for frozen in preserved:
        require(inventory(tree(ROOT / frozen["path"])) == frozen["files"], "Prior release output changed during build")
    require(not (ROOT / OUTPUT).exists(), "Existing output must not be overwritten")
    output = ROOT / OUTPUT
    write_new(output / "artifacts" / ZIP_NAME, packed)
    for path, data in web.items():
        write_new(output / "web" / path, data)
    for path, data in inputs.items():
        write_new(output / "build-evidence/inputs" / path, data)
    for path, data in log_bytes.items():
        write_new(output / path, data)
    tooling = []
    for path in [SELF, "scripts/prepare_mvp06_artifacts.py", "scripts/prepare_mvp04_artifacts.py", *tests]:
        content = file_bytes(ROOT / path)
        destination = f"build-evidence/tooling/{path}"
        write_new(output / destination, content)
        tooling.append({"path": path, "archivePath": destination, "sha256": sha256(content), "byteLength": len(content)})
    report = {
        "kind": "mvp06CorrectedPublicWebArtifact", "verifiedOn": datetime.now(timezone.utc).isoformat(),
        "passed": True, "status": "local-publication-candidate-not-deployed", "applicationVersion": "0.6.0",
        "matchingSpfxPackageVersion": "0.6.0.1", "releaseId": RELEASE_ID, "manifestSha256": MANIFEST_SHA256,
        "pinCommit": PIN, "sourceApprovalSha256": correction["sourceApprovalSha256"],
        "spfxPackage": {"path": SPPKG, "sha256": SPPKG_SHA256},
        "spfxBuildReceipt": {"path": f"{CORRECTION}/artifact-verification.json", "sha256": SPFX_RECEIPT_SHA256},
        "supersededWebArchive": {"path": f"{ORIGINAL}/artifacts/fristenrechner-mvp06-steimer-web.zip", "sha256": ORIGINAL_WEB_SHA256},
        "archive": {"path": f"{OUTPUT}/artifacts/{ZIP_NAME}", "byteLength": len(packed), "sha256": sha256(packed)},
        "webRoot": f"{OUTPUT}/web", "webFiles": inventory(web), "runtimeDataFiles": inventory(data_files),
        "runtimeDataAndApprovedPinUnchanged": True, "sharedRuntimeMatchesAcceptedSpfx0601": True,
        "publicWrapperAndHostingRulesUnchanged": True, "repeatedBuildByteIdentical": True,
        "deterministicZipReadbackVerified": True, "archiveVerificationIndependentOfScratch": True,
        "inputBindings": bindings, "toolingSnapshots": tooling, "steps": steps, "correctionAudit": correction_audit,
        "preservedOutputs": preserved, "toolchain": {"nodeVersion": "v22.23.2", "nodePath": NODE},
        "authorization": {"localPreparation": True, "networkAccessPerformed": False, "publicationPerformed": False,
                          "deploymentPerformed": False, "productionActivation": False},
        "limitations": ["Technical local candidate only. Public hosting and browser acceptance remain separate gates.",
                        "Unchanged hosting rules do not resolve or retest the known live GET/HEAD header discrepancy.",
                        "Dependency installation is reused from the locked local node_modules. No network dependency install was performed."]
    }
    write_new(output / "artifact-verification.json", (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode())
    print(json.dumps(check(), indent=2))


if __name__ == "__main__":
    main()
