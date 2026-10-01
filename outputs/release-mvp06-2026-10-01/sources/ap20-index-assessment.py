# SPDX-License-Identifier: AGPL-3.0-only
"""Assess only the one additional earlier ELG index row, no network or approval."""
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "outputs/release-mvp06-2026-10-01/sources"
paths = {
    "index": "outputs/release-mvp06-2026-10-01/sources/ap20-index-addendum.json",
    "bridge": "outputs/release-mvp06-2026-10-01/sources/source-original-bridges.json",
    "original": "outputs/release-mvp05-2026-09-28/sources/retry-01/CH-ELG-20260101.xml",
    "catalog": "data/candidates/2026-10-01-ap20c3/social-procedures/ch-social-procedures.json",
    "script": "outputs/release-mvp06-2026-10-01/sources/ap20-index-assessment.py",
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load(name):
    return json.loads((ROOT / paths[name]).read_bytes())


def body(node):
    text = node.text or ""
    for child in node:
        if child.tag.rsplit("}", 1)[-1] != "authorialNote":
            text += body(child)
        text += child.tail or ""
    return text


index, bridge, catalog = load("index"), load("bridge"), load("catalog")
assert index["noDeltaInComparedIndexes"] is False
assert all(row["identicalInPriorWindow"] for row in index["comparisons"])
assert index["fullWindowDeltas"]["versions"] == {"added": [], "removed": []}
assert index["fullWindowDeltas"]["impacts"]["removed"] == []
added = index["fullWindowDeltas"]["impacts"]["added"]
assert len(added) == 1
row = added[0]
assert row == {
    "work": "https://fedlex.data.admin.ch/eli/cc/2007/804",
    "impact": "https://fedlex.data.admin.ch/eli/oc/2025/704/legal-analysis/LegalResourceImpact/5",
    "date": "2026-01-01", "target": "https://fedlex.data.admin.ch/eli/cc/2007/804/art_11",
    "source": "https://fedlex.data.admin.ch/eli/oc/2025/704",
}
original_bytes = (ROOT / paths["original"]).read_bytes()
fresh_original = next(item for item in bridge["originals"] if item["law"] == "ELG" and item["side"] == "MVP05")
assert fresh_original["boundOriginalHashMatches"] is True
assert fresh_original["receipt"]["httpStatus"] == 200
assert fresh_original["receipt"]["retrievedAt"].startswith("2026-10-01")
assert sha(original_bytes) == fresh_original["receipt"]["sha256"] == fresh_original["expectedSha256"]
article = ET.fromstring(original_bytes).find('.//{*}article[@eId="art_11"]')
assert article is not None
with_notes = " ".join("".join(article.itertext()).split())
norm = " ".join(body(article).replace("\u00ad", "").split())
assert "Anrechenbare Einnahmen" in norm
assert "die 13. Altersrente nach Artikel 34ter AHVG" in norm
assert "AS 2025 704" in with_notes and "in Kraft seit 1. Jan. 2026" in with_notes
locators = sorted({binding["locator"] for group in ["federalRules", "cantonalBindings"]
                   for item in catalog[group] for binding in item["normBindings"]
                   if re.match(r"SRC-AP(?:19C|20C3)-ELG-", binding["sourceId"])})
assert locators and all(not re.search(r"Art\.\s*11\b", locator) for locator in locators)
report = {
    "reviewId": "MVP06-AP20-INDEX-WINDOW-ASSESSMENT-20261001", "checkedOn": "2026-10-01",
    "recordStatus": "candidate", "formalApproval": False, "humanApproval": False,
    "dataPromotionApproved": False, "runtimeActivation": False,
    "scope": "Only the single additional ELG Article 11 impact exposed by expanding the previous ELG index lower bound from 2026-09-30 to 2026-01-01",
    "additionalIndexRow": row,
    "classification": "already-effective-material-benefit-rule-in-existing-2026-consolidation",
    "originalReceipt": fresh_original["receipt"],
    "reading": {"law": "ELG", "versionOn": "2026-01-01", "article": "11", "paragraph": "3", "letter": "i",
                "heading": "Anrechenbare Einnahmen", "normArticleSha256": sha(norm.encode()),
                "finding": "Die zusätzliche Indexzeile betrifft die seit 1. Januar 2026 im ELG-Original enthaltene Nichtanrechnung der 13. Altersrente. Sie regelt eine materielle Einnahmenposition, nicht Zuständigkeit, Fristbeginn, Fristdauer, Friststillstand oder Fristende.",
                "actualUsedElgNormLocators": locators, "outsideUsedDeadlineAndJurisdictionArticles": True,
                "method": "Targeted reading of Article 11 in the existing local XML whose entire bytes were freshly retrieved and hash-confirmed by the separate original-pair bridge. No new original request and no inference of whole-file identity between XML representations."},
    "result": {"knownWindowExtensionAccountedFor": True, "newFutureCommencementDetected": False,
               "newDeadlineRuleRequired": False, "newJurisdictionRuleRequired": False,
               "rawIndexNoDeltaFalsePreserved": True, "earlierProofsRewritten": False},
    "limits": ["No complete material-benefit calculation assessment", "No human source approval",
               "The raw index delta remains one added row and is not relabelled as zero",
               "No source register, candidate, release or environment change"],
    "evidenceBindings": [{"path": path, "sha256": sha((ROOT / path).read_bytes()), "byteLength": (ROOT / path).stat().st_size}
                         for path in paths.values()],
}
target = OUT / "ap20-index-assessment.json"
content = (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode()
with target.open("xb") as handle:
    handle.write(content)
assert target.read_bytes() == content
print(json.dumps({"path": str(target.relative_to(ROOT)), "sha256": sha(content), "knownWindowExtensionAccountedFor": True}))
