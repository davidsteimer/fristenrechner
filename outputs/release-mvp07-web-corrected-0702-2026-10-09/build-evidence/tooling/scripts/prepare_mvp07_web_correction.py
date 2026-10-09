#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Build and seal the bounded 0702 web correction, without SPFx or publication.

The build consumes the original archived 0702 inputs. A public readback consumes
only this new archive and the two public helper modules imported below. Original
receipts and local authority/diagnostic material are neither copied nor required
by --check. Historical package inputs are not redefined by today's test scripts.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from prepare_mvp04_artifacts import file_bytes, inventory, require, safe_name, sha256, zip_files
from prepare_mvp07_artifacts import deterministic_zip, inspect_mirror_files, inspect_web_files, validate_schemas

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = "outputs/release-mvp07-web-corrected-0702-2026-10-09"
ORIGINAL = "outputs/release-mvp07-2026-10-08"
CORRECTION = "outputs/release-mvp07-spfx-0.7.0.2-2026-10-09"
ZIP_NAME = "fristenrechner-mvp07-steimer-web-corrected-0702.zip"
SELF = "scripts/prepare_mvp07_web_correction.py"
NODE = ".work/toolchains/node-v22.23.2-darwin-arm64/bin/node"
RELEASE_ID = "2026-10-08-mvp-07-approved.1"
MANIFEST_SHA256 = "fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597"
PIN = "331ef3e19d43a6b51d91a502acd6b5443071599f"
CORRECTION_RECEIPT_SHA256 = "c42c0c75d2352004e640dd0de3d18a37e4147290d4cd2c12f1e9a705d0376702"
ORIGINAL_RECEIPT_SHA256 = "17076eb9d4d5ceb4de8e4aeff5f23d514c0c3db19708d7e9487c42a7cfdcc4cb"
ORIGINAL_WEB_SHA256 = "c7c20676154506694267e517791fe2fca73b7e403523e4968eea5ddb3fa0afcf"
SPPKG_SHA256 = "8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db"
SPPKG = f"{CORRECTION}/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg"
BASELINES = {
    "data/releases/2026-10-01-mvp-06-approved.1/calendars/ch-federal-calendar.json": "c851d4839e06ad714aba988b6c92e9ae81c27a507cc004bf0f89046650a3c5c7",
    "data/releases/2026-10-01-mvp-06-approved.1/calendars/be-public-holidays.json": "6051094d6179f99276cb55cad0f88e562da02c2396dffcf213d0ac165807d121",
}
TOOLING = [SELF, "scripts/prepare_mvp07_artifacts.py", "scripts/prepare_mvp04_artifacts.py",
           "tests/data/test_mvp07_web_correction.py"]
PUBLIC_TESTS = [f"tests/public-app/{name}" for name in
                ["ap19c3-build.test.ts", "ap21-build.test.ts", "ap22c3-build.test.ts", "build.test.ts"]]
TITLE_STYLE = ('title:{height:"auto",minHeight:32,paddingTop:5,paddingBottom:5,lineHeight:20,'
               'whiteSpace:"normal",overflow:"visible",textOverflow:"clip",overflowWrap:"anywhere"}')


def json_bytes(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


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


def assert_public_bytes(files: dict[str, bytes]) -> None:
    """Bounded disclosure guard, not a universal personal-data classifier."""
    # A real user-directory component, not the public helper's redaction regex
    # or its <user> placeholder, is a disclosure failure.
    personal_path = re.compile(rb"/" + rb"(?:Users|home)/[A-Za-z0-9_. -]+/")
    for path, data in files.items():
        safe_name(path)
        require(not personal_path.search(data), f"Personal absolute path in public file: {path}")
        require(b"BEGIN " + b"PRIVATE KEY" not in data and b"BEGIN " + b"RSA PRIVATE KEY" not in data,
                f"Private key in public file: {path}")


def sanitize_log(raw: bytes, stage: Path) -> bytes:
    return raw.replace(str(stage).encode(), b"<isolated-build>").replace(str(ROOT).encode(), b"<repository>")


def audit_correction(files: dict[str, bytes]) -> dict:
    build = json.loads(files["build-manifest.json"])
    script = files[build["assets"]["javascript"].removeprefix("./")].decode()
    require(TITLE_STYLE in script, "Missing complete shared 0702 Fluent title correction")
    require('height:"auto",minHeight:36,paddingTop:7,paddingBottom:7' in script, "Missing auto-height option rows")
    for slot in ["dropdownOptionText", "dropdownItem", "dropdownItemSelected", "dropdownItemDisabled", "dropdownItemSelectedAndDisabled"]:
        require(re.search(rf"\b{slot}:", script) is not None, f"Missing Fluent style slot: {slot}")
    require(re.search(r"\bfetch\s*\(|new XMLHttpRequest\b|new WebSocket\b|new EventSource\b", script) is None,
            "Unexpected runtime network transport")
    require(not re.search(r"stpo-weekend|vrpg-special-gate|qaPresets|SYNTHETIC TEST|TEST-NOT-A-RELEASE", script),
            "QA-only marker in public application")
    require(build.get("status") != "candidate" and build.get("deployable") is not False,
            "Historical candidate must not be sealed as the normal approved entry")
    return {"completeShared0702TitleStyleEmitted": True, "allFourOptionRowSlotsEmitted": True,
            "noRuntimeNetworkTransport": True, "noQaPresetsOrSyntheticApprovals": True,
            "normalApprovedEntry": True, "browserVisualAcceptanceClaimed": False}


def embedded_data_readback(module: bytes, files: dict[str, bytes]) -> None:
    text = module.decode()
    manifest = re.search(r"^export const mvp07ManifestText = (.+);$", text, re.M)
    entries = re.search(r"^export const mvp07Files: ReadonlyMap<string, string> = new Map\((.+)\);$", text, re.M)
    require(manifest is not None and entries is not None, "Unexpected embedded release module")
    embedded = {name: value.encode() for name, value in json.loads(entries.group(1))}
    embedded["manifest.json"] = json.loads(manifest.group(1)).encode()
    require(embedded == files, "Embedded data differ from the exact 41 approved files")


def checked_inputs() -> tuple[dict[str, bytes], list[dict], dict[str, bytes], dict[str, bytes]]:
    correction_raw = file_bytes(ROOT / CORRECTION / "artifact-verification.json")
    original_raw = file_bytes(ROOT / ORIGINAL / "artifact-verification.json")
    require(sha256(correction_raw) == CORRECTION_RECEIPT_SHA256, "Accepted correction receipt differs")
    require(sha256(original_raw) == ORIGINAL_RECEIPT_SHA256, "Original web receipt differs")
    require(sha256(file_bytes(ROOT / SPPKG)) == SPPKG_SHA256, "Accepted SPFx package differs")
    old_zip = file_bytes(ROOT / ORIGINAL / "artifacts/fristenrechner-mvp07-steimer-web.zip")
    require(sha256(old_zip) == ORIGINAL_WEB_SHA256, "Original web archive differs")
    correction, original = json.loads(correction_raw), json.loads(original_raw)
    require(correction.get("passed") is True and correction.get("packageVersion") == "0.7.0.2"
            and correction.get("pinCommit") == PIN and correction.get("manifestSha256") == MANIFEST_SHA256,
            "Unexpected correction contract")
    inputs, bindings = {}, []
    original_rows = {row["path"]: row for row in original["buildInputSnapshots"]}
    fixed = {"package.json", "package-lock.json", "scripts/build-public-app.mjs", "scripts/browser-globals-plugin.mjs",
             "src/release/mvp07ReleaseData.ts", "spfx/src/core/config.ts", "spfx/config/package-solution.json"}
    for row in correction["productInputFiles"]:
        path = safe_name(row["path"])
        if path not in fixed and not path.startswith(("src/core/", "src/ui/", "src/public-app/", "public-app/", "schemas/")):
            continue
        require(not path.startswith("src/ui/preview/"), "Preview source in accepted product inputs")
        snapshot = f"{CORRECTION}/build-evidence/inputs/{path}"
        content = file_bytes(ROOT / snapshot)
        require(sha256(content) == row["sha256"] and len(content) == row["byteLength"], f"Archived source differs: {path}")
        if path == "package.json":
            accepted, current = json.loads(content), json.loads(file_bytes(ROOT / path))
            for key in ["name", "version", "license", "type", "engines", "packageManager", "dependencies", "devDependencies"]:
                require(accepted.get(key) == current.get(key), f"Unaccepted package dependency change: {key}")
        else:
            require(content == file_bytes(ROOT / path), f"Current source differs from accepted 0702: {path}")
        wrapper = path.startswith(("src/public-app/", "public-app/")) or path in {
            "package.json", "package-lock.json", "scripts/build-public-app.mjs", "scripts/browser-globals-plugin.mjs"}
        if wrapper:
            old = original_rows[path]
            previous = file_bytes(ROOT / safe_name(old["archivePath"]))
            require(sha256(previous) == old["sha256"] and previous == content, f"Original wrapper changed: {path}")
        inputs[path] = content
        bindings.append({**row, "origin": "accepted-0702-product-input", "sourceSnapshot": snapshot,
                         "unchangedOriginalWebWrapper": wrapper})
    expected = set(fixed)
    for directory in ["src/core", "src/ui", "src/public-app", "public-app", "schemas"]:
        expected.update(f"{directory}/{path}" for path in tree(ROOT / directory)
                        if not f"{directory}/{path}".startswith("src/ui/preview/"))
    require(expected == set(inputs), f"Unbound or unexpected product source: {sorted(expected ^ set(inputs))}")
    for path, expected_hash in BASELINES.items():
        snapshot = f"{CORRECTION}/local-checks/inputs/{path}"
        content = file_bytes(ROOT / snapshot)
        require(sha256(content) == expected_hash and content == file_bytes(ROOT / path), "Historical normative baseline changed")
        inputs[path] = content
        bindings.append({"path": path, "byteLength": len(content), "sha256": expected_hash,
                         "origin": "separately-archived-0702-normative-baseline", "sourceSnapshot": snapshot})
    data = {}
    for row in correction["releaseFiles"]:
        path = safe_name(row["path"])
        # releaseFiles use repository-relative paths, like the other inventories.
        name = path.removeprefix(f"data/releases/{RELEASE_ID}/")
        require(name != path, "Unexpected release file path")
        content = file_bytes(ROOT / CORRECTION / "build-evidence/inputs" / path)
        require(sha256(content) == row["sha256"] and len(content) == row["byteLength"]
                and content == file_bytes(ROOT / path), "Approved data changed")
        data[name] = content
        inputs[path] = content
        bindings.append({**row, "origin": "unchanged-0702-approved-runtime-data",
                         "sourceSnapshot": f"{CORRECTION}/build-evidence/inputs/{path}"})
    inspect_mirror_files(data, MANIFEST_SHA256)
    embedded_data_readback(inputs["src/release/mvp07ReleaseData.ts"], data)
    validate_schemas(data, inputs)
    assert_public_bytes(inputs)
    return inputs, sorted(bindings, key=lambda row: row["path"]), data, zip_files(old_zip)


def test_inputs() -> dict[str, bytes]:
    """Additional public test fixtures, never recast as old SPFx inputs."""
    paths = {"tsconfig.json", *PUBLIC_TESTS, "outputs/ap22c3-2026-10-08/bundle/manifest.json"}
    for name in ["ap17c", "ap18c", "ap19c3", "ap22c3"]:
        path = f"src/release/{name}CandidateData.ts"
        paths.add(path)
        module = file_bytes(ROOT / path).decode()
        for reference in re.findall(r"^import .* from ['\"]\.\./\.\./(data/[^'\"]+\.json)['\"];", module, re.M):
            paths.add(safe_name(reference))
    result = {path: file_bytes(ROOT / path) for path in sorted(paths)}
    assert_public_bytes(result)
    return result


def unchanged_web_files(old: dict[str, bytes], new: dict[str, bytes]) -> list[dict]:
    paths = {".htaccess", "favicon.svg", *(path for path in old if path.startswith("licenses/")),
             *(path for path in old if path.startswith("assets/") and not path.startswith("assets/app-"))}
    require(len(paths) == 8 and all(old[path] == new.get(path) for path in paths), "Vendor, license or hosting bytes changed")
    return inventory({path: new[path] for path in paths})


def check(output: Path = ROOT / OUTPUT, *, public_readback: bool = False) -> dict:
    """No Git, original archives, .work, node_modules or private evidence needed."""
    receipt = json.loads(file_bytes(output / "artifact-verification.json"))
    require(receipt.get("passed") is True and receipt.get("kind") == "mvp07CorrectedPublicWebArtifact"
            and receipt.get("releaseId") == RELEASE_ID and receipt.get("manifestSha256") == MANIFEST_SHA256
            and receipt.get("matchingSpfxPackageVersion") == "0.7.0.2", "Wrong web receipt")
    require(receipt.get("originalCorrectionReceiptSha256") == CORRECTION_RECEIPT_SHA256
            and receipt.get("matchingSpfxPackageSha256") == SPPKG_SHA256
            and receipt.get("supersededWebArchiveSha256") == ORIGINAL_WEB_SHA256, "Wrong original anchors")
    require(receipt.get("repeatedBuildByteIdentical") is True and receipt.get("normalApprovedEntry") is True,
            "Missing independent build agreement")
    all_files = tree(output)
    packed = file_bytes(output / "artifacts" / ZIP_NAME)
    require(sha256(packed) == receipt["archive"]["sha256"] and len(packed) == receipt["archive"]["byteLength"], "ZIP digest differs")
    web = zip_files(packed)
    require(web == tree(output / "web") and inventory(web) == receipt["webFiles"], "Archived web differs")
    require(deterministic_zip(web) == packed, "ZIP is not deterministic from its archived files")
    inputs = tree(output / "build-evidence/inputs")
    require(inventory(inputs) == [{key: row[key] for key in ["path", "byteLength", "sha256"]}
                                  for row in receipt["inputBindings"]], "Archived product inputs differ")
    data = {path.removeprefix(f"data/releases/{RELEASE_ID}/"): content for path, content in inputs.items()
            if path.startswith(f"data/releases/{RELEASE_ID}/")}
    manifest = inspect_mirror_files(data, MANIFEST_SHA256)
    require(inventory(data) == receipt["runtimeDataFiles"], "Runtime data inventory differs")
    embedded_data_readback(inputs["src/release/mvp07ReleaseData.ts"], data)
    validate_schemas(data, inputs)
    inspect_web_files(web, manifest, inputs["public-app/.htaccess"])
    require(audit_correction(web) == receipt["correctionAudit"], "Emitted correction differs")
    for row in receipt["unchangedVendorLicenseHostingFiles"]:
        require(sha256(web[row["path"]]) == row["sha256"] and len(web[row["path"]]) == row["byteLength"], "Preserved web bytes differ")
    require(inventory(tree(output / "build-evidence/test-inputs")) == receipt["additionalTestInputs"], "Test fixtures differ")
    require(inventory(tree(output / "build-evidence/tooling")) == receipt["toolingSnapshots"], "New tooling snapshot differs")
    for step in receipt["steps"]:
        content = file_bytes(output / safe_name(step["log"]))
        require(step["exitCode"] == 0 and sha256(content) == step["sha256"], "Test/build log differs")
    expected = {"artifact-verification.json", f"artifacts/{ZIP_NAME}",
                *(f"web/{path}" for path in web), *(f"build-evidence/inputs/{path}" for path in inputs),
                *(f"build-evidence/test-inputs/{row['path']}" for row in receipt["additionalTestInputs"]),
                *(f"build-evidence/tooling/{row['path']}" for row in receipt["toolingSnapshots"]),
                *(step["log"] for step in receipt["steps"])}
    require(set(all_files) == expected, "Unexpected file in public output")
    assert_public_bytes({**all_files, **{f"zip/{path}": content for path, content in web.items()}})
    return {"passed": True, "archive": receipt["archive"], "webFiles": len(web), "archivedProductAndDataInputs": len(inputs),
            "additionalTestInputs": len(receipt["additionalTestInputs"]), "publicReadback": public_readback,
            "privateInputsRequired": False, "gitOrNetworkRequired": False, "scratchOrNodeModulesRequired": False,
            "browserVisualAcceptanceClaimed": False, "publicationPerformed": False}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--public-readback", action="store_true", help="Only with --check. Both check modes are private-input-free.")
    parser.add_argument("--output", type=Path, help="Readback path only, never redirects a build")
    args = parser.parse_args()
    require(not (args.public_readback or args.output) or args.check, "Readback options require --check")
    if args.check:
        print(json.dumps(check(args.output or ROOT / OUTPUT, public_readback=args.public_readback), indent=2))
        return
    require(not (ROOT / OUTPUT).exists(), "Existing output must not be overwritten. Use --check.")
    require(not os.environ.get("FRISTENRECHNER_DATA_CANDIDATE"), "A candidate override is not permitted")
    inputs, bindings, data, old_web = checked_inputs()
    extra, tooling = test_inputs(), {path: file_bytes(ROOT / path) for path in TOOLING}
    protected = {directory: inventory(tree(ROOT / directory)) for directory in [ORIGINAL, CORRECTION]}
    preview_paths = [".work/public-app", ".work/public-ap17c", ".work/public-ap18c", ".work/public-ap19c3",
                     ".work/public-ap21", ".work/public-ap22c3"]
    protected_previews = {path: inventory(tree(ROOT / path)) for path in preview_paths}
    node = ROOT / NODE
    require(subprocess.run([str(node), "--version"], capture_output=True, text=True, check=True).stdout.strip() == "v22.23.2",
            "Wrong Node toolchain")
    dependencies = {}
    lock = json.loads(inputs["package-lock.json"])
    for name in ["react", "react-dom", "@fluentui/react", "esbuild", "tsx", "typescript"]:
        installed = json.loads(file_bytes(ROOT / "node_modules" / name / "package.json"))
        require(installed["version"] == lock["packages"][f"node_modules/{name}"]["version"], "Installed dependency differs from lock")
        dependencies[name] = installed["version"]
    stages = [Path(tempfile.mkdtemp(prefix=f"mvp07-web-0702-{index}-", dir=ROOT / ".work")) for index in (1, 2)]
    for index, stage in enumerate(stages):
        for path, content in {**inputs, **(extra if index == 0 else {}), **(tooling if index == 0 else {})}.items():
            write_new(stage / path, content)
        (stage / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
    env = {**os.environ, "PATH": f"{node.parent}:{os.environ.get('PATH', '')}", "FRISTENRECHNER_DATA_CANDIDATE": "",
           "TSX_DISABLE_CACHE": "1", "npm_config_update_notifier": "false"}
    steps, logs = [], {}

    def run(label: str, command: list[str], stage: Path, *, tests: int | None = None) -> None:
        result = subprocess.run(command, cwd=stage, env=env, capture_output=True, timeout=240)
        raw = result.stdout + result.stderr
        write_new(stage / f"step-{len(steps) + 1}.log", raw)
        sanitized = sanitize_log(raw, stage)
        name = f"build-evidence/step-{len(steps) + 1}.log"
        logs[name] = sanitized
        step = {"label": label, "command": Path(command[0]).name, "args": command[1:], "exitCode": result.returncode,
                "log": name, "sha256": sha256(sanitized)}
        if tests is not None:
            summary = {key: int(value) for key, value in re.findall(rb"^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$", result.stdout, re.M)}
            step["testSummary"] = {key.decode(): value for key, value in summary.items()}
            require(step["testSummary"] == {"tests": tests, "pass": tests, "fail": 0, "cancelled": 0, "skipped": 0, "todo": 0}, "Incomplete public tests")
        steps.append(step)
        print(json.dumps({"step": label, "exitCode": result.returncode}), flush=True)
        require(result.returncode == 0, f"Isolated build/test failed. See {stage.relative_to(ROOT)}/step-{len(steps)}.log")

    run("Synthetic-only builder guard tests in isolated copy",
        [sys.executable, "-B", "-m", "unittest", "discover", "-s", "tests/data", "-p", "test_mvp07_web_correction.py", "-v"], stages[0])
    run("All public application tests in isolated accepted source copy",
        [str(node), "--import", "tsx", "--test", "--test-concurrency=1", "--test-timeout=60000", *PUBLIC_TESTS], stages[0], tests=16)
    run("Normal approved web entry, first isolated build", [str(node), "scripts/build-public-app.mjs"], stages[0])
    first = tree(stages[0] / ".work/public-app")
    run("Normal approved web entry, second fresh isolated build", [str(node), "scripts/build-public-app.mjs"], stages[1])
    second = tree(stages[1] / ".work/public-app")
    require(first == second, "Two fresh isolated builds are not byte-identical")
    manifest = inspect_mirror_files(data, MANIFEST_SHA256)
    inspect_web_files(first, manifest, inputs["public-app/.htaccess"])
    correction_audit = audit_correction(first)
    unchanged = unchanged_web_files(old_web, first)
    packed = deterministic_zip(first)
    require(packed == deterministic_zip(second) and sha256(packed) != ORIGINAL_WEB_SHA256, "ZIP repeat/correction check failed")
    new_inputs, new_bindings, new_data, _ = checked_inputs()
    require(new_inputs == inputs and new_bindings == bindings and new_data == data, "Product inputs changed during build")
    require(test_inputs() == extra and all(file_bytes(ROOT / path) == content for path, content in tooling.items()), "Test/tooling inputs changed")
    require(all(inventory(tree(ROOT / directory)) == before for directory, before in protected.items()), "Original release output changed")
    require(all(inventory(tree(ROOT / directory)) == before for directory, before in protected_previews.items()), "Existing local preview changed")
    report = {
        "kind": "mvp07CorrectedPublicWebArtifact", "verifiedOn": datetime.now(timezone.utc).isoformat(), "passed": True,
        "status": "local-publication-candidate-not-deployed", "applicationVersion": "0.7.0", "matchingSpfxPackageVersion": "0.7.0.2",
        "releaseId": RELEASE_ID, "manifestSha256": MANIFEST_SHA256, "dataPinReference": PIN,
        "originalCorrectionReceiptSha256": CORRECTION_RECEIPT_SHA256, "originalWebReceiptSha256": ORIGINAL_RECEIPT_SHA256,
        "matchingSpfxPackageSha256": SPPKG_SHA256, "supersededWebArchiveSha256": ORIGINAL_WEB_SHA256,
        "archive": {"path": f"{OUTPUT}/artifacts/{ZIP_NAME}", "byteLength": len(packed), "sha256": sha256(packed)},
        "webRoot": f"{OUTPUT}/web", "webFiles": inventory(first), "runtimeDataFiles": inventory(data),
        "inputBindings": bindings, "additionalTestInputs": inventory(extra), "toolingSnapshots": inventory(tooling),
        "steps": steps, "correctionAudit": correction_audit, "unchangedVendorLicenseHostingFiles": unchanged,
        "normalApprovedEntry": True, "repeatedBuildByteIdentical": True, "freshBuildDirectories": 2,
        "deterministicZipReadbackVerified": True, "embedded41DataFilesByteIdentical": True,
        "runtimeAndWrappersMatchArchived0702": True, "priorArchivesAndLocalPreviewsUnchanged": True,
        "preservedOriginalArchives": [{"path": path, "fileCount": len(rows), "inventorySha256": sha256(json_bytes(rows))}
                                      for path, rows in protected.items()],
        "toolchain": {"nodeVersion": "v22.23.2", "dependencyVersions": dependencies, "dependencyInstallPerformed": False},
        "publicReadback": {"privateInputsRequired": False, "gitRequired": False, "nodeModulesRequired": False,
                           "dependencies": ["scripts/prepare_mvp04_artifacts.py", "scripts/prepare_mvp07_artifacts.py", "Python jsonschema"]},
        "authorization": {"localPreparation": True, "networkAccessPerformed": False, "spfxBuildPerformed": False,
                          "publicationPerformed": False, "deploymentPerformed": False, "productionActivation": False},
        "provenanceBoundary": "Only the selected original product inputs are attributed to 0702. Additional tests and this builder are new, separate evidence. No full product commit or new legal approval is asserted.",
        "limitations": ["Technical local candidate, no browser/device or actual host acceptance in this receipt.",
                        "Unchanged .htaccess is not a live header or hosting test.",
                        "No new legal/source approval or remote pin verification.",
                        "The original authority receipts remain unchanged and are intentionally not copied to this public output.",
                        "Public readback verifies archived bytes and recorded anchors, not current private history or a new build."]}
    output_files = {f"artifacts/{ZIP_NAME}": packed, "artifact-verification.json": json_bytes(report),
                    **{f"web/{path}": content for path, content in first.items()},
                    **{f"build-evidence/inputs/{path}": content for path, content in inputs.items()},
                    **{f"build-evidence/test-inputs/{path}": content for path, content in extra.items()},
                    **{f"build-evidence/tooling/{path}": content for path, content in tooling.items()}, **logs}
    assert_public_bytes(output_files)
    require(not (ROOT / OUTPUT).exists(), "Existing output must not be overwritten")
    for path, content in sorted(output_files.items()):
        write_new(ROOT / OUTPUT / path, content)
    print(json.dumps(check(public_readback=True), indent=2))


if __name__ == "__main__":
    main()
