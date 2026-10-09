#!/usr/bin/env python3
"""Prüft die AP11C-spezifische Bereinigung der Pflichtauswahlen."""

from __future__ import annotations

import json
from pathlib import Path
import sys


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_RELEASE_DIRECTORY = (
    REPOSITORY_ROOT / "data/releases/2026-08-30-ap11c-candidate.1"
)
RELEASE_DIRECTORY = (
    Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_RELEASE_DIRECTORY
)


def load_profile(profile_id: str) -> dict:
    path = RELEASE_DIRECTORY / f"profiles/{profile_id}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def selector_values(profile: dict, selector_id: str) -> list[str]:
    selector = next(
        item for item in profile["selectors"] if item["selectorId"] == selector_id
    )
    return [option["value"] for option in selector["options"]]


def main() -> None:
    manifest = json.loads(
        (RELEASE_DIRECTORY / "manifest.json").read_text(encoding="utf-8")
    )
    zpo_values = selector_values(load_profile("zpo"), "procedureVariant")
    vrpg_values = selector_values(load_profile("vrpg-be"), "specialLawStatus")

    if "unknown" in zpo_values:
        raise SystemExit("ZPO procedureVariant enthält weiterhin unknown")
    if "unknown" in vrpg_values:
        raise SystemExit("VRPG-BE specialLawStatus enthält weiterhin unknown")
    if not {"ordinary", "summary"}.issubset(zpo_values):
        raise SystemExit("ZPO-Bereinigung hat fachlich zulässige Optionen entfernt")
    if set(vrpg_values) != {"noKnownOverride", "knownOverride"}:
        raise SystemExit("VRPG-BE-Bereinigung enthält unerwartete Optionen")

    expected_review_status = (
        "verified" if manifest["releaseStatus"] == "approved" else "candidate"
    )
    for profile_id in ("zpo", "vrpg-be"):
        review = load_profile(profile_id)["review"]
        if review["status"] != expected_review_status:
            raise SystemExit(
                f"{profile_id}: unerwarteter Prüfstatus {review['status']}"
            )
        if expected_review_status == "verified" and review["reviewedBy"] != "David Steimer":
            raise SystemExit(f"{profile_id}: menschliche Freigabe fehlt")

    print(
        "VALID AP11C UI CONTRACT: "
        f"release={manifest['releaseId']}, status={manifest['releaseStatus']}, "
        f"zpoOptions={len(zpo_values)}, vrpgOptions={len(vrpg_values)}, unknownOptions=0"
    )


if __name__ == "__main__":
    main()
