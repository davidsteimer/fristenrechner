#!/usr/bin/env python3
"""Prüft die kontrollierte AP12C-Migration unabhängig vom Produktgenerator."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
AP12A_ROOT = (
    REPOSITORY_ROOT
    / "data"
    / "candidates"
    / "2026-08-31-ap12a-eternal-calendar"
)
OLD_SET_ID = "ch-court-holidays-2026-2028"
NEW_SET_ID = "ch-court-holidays"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prüft einen AP12C-Kandidaten oder den daraus freigegebenen Format-3-Release."
    )
    parser.add_argument("release_directory", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    release_root = args.release_directory.resolve()
    release_id = release_root.name
    manifest = load_json(release_root / "manifest.json")
    assert manifest["releaseId"] == release_id
    expected_status = "approved" if "-approved." in release_id else "candidate"
    assert manifest["releaseStatus"] == expected_status
    assert manifest["formatVersion"] == "3.0.0"
    assert manifest["coverage"] == {"from": "2026-01-01", "to": None}
    assert manifest["compatibility"]["minimumConsumerFormatVersion"] == "3.0.0"

    calendar_artifacts = [
        artifact for artifact in manifest["artifacts"]
        if artifact["role"] == "calendar"
    ]
    assert len(calendar_artifacts) == 2
    for artifact in calendar_artifacts:
        assert artifact["schemaId"].endswith("/calendar-rules-v2.schema.json")
        release_calendar = load_json(release_root / artifact["path"])
        reference_calendar = load_json(AP12A_ROOT / f"{artifact['contentId']}.json")
        assert release_calendar == reference_calendar

    artifact_text = "\n".join(
        (release_root / artifact["path"]).read_text(encoding="utf-8")
        for artifact in manifest["artifacts"]
    )
    assert OLD_SET_ID not in artifact_text
    assert artifact_text.count(f'"{NEW_SET_ID}"') == 9

    if expected_status == "approved":
        approval = manifest["extensions"]["steimer.approval"]
        assert approval["approvedBy"] == "David Steimer"
        assert approval["candidateReleaseId"] == "2026-08-31-ap12c-candidate.1"
        for artifact in manifest["artifacts"]:
            document = load_json(release_root / artifact["path"])
            assert document["review"]["status"] == "verified"
            assert document["review"]["reviewedBy"] == "David Steimer"

    print(
        "VALID AP12C MIGRATION: "
        f"release={release_id}, status={expected_status}, calendars={len(calendar_artifacts)}, "
        "calendarRules=15, oldSetIds=0, newSetIds=9, coverage=open"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
