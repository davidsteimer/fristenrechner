# SPDX-License-Identifier: AGPL-3.0-only
"""Derived bounded comparisons, not a human source approval or legal expansion."""
import hashlib
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / "outputs/release-mvp06-2026-10-01/sources/remainder"
fetch = json.loads((OUT / "fetch-run-03.json").read_text())
extra = json.loads((OUT / "earlier-consolidations.json").read_text())
rows = {r["id"]: r for r in fetch["retrievals"] + extra["retrievals"]}


def sha(value):
    return hashlib.sha256(value).hexdigest()


def body(node):
    assert node is not None, "Required article missing"
    text = node.text or ""
    for child in node:
        if child.tag.split("}")[-1] != "authorialNote":
            text += body(child)
        text += child.tail or ""
    return text


def article(path, number):
    tree = ET.parse(ROOT / path)
    return body(tree.find(f'.//{{*}}article[@eId="art_{number}"]'))


def normalize(text):
    return re.sub(r"\s+", "", text.replace("\u00ad", ""))


comparisons = []
for law, current, numbers in [
    ("BGG", "SRC-BGG-20260401", ["44", "45", "46", "100"]),
    ("ZPO", "SRC-ZPO-20260701", ["138", "142", "143", "145", "146"]),
]:
    for number in numbers:
        before = normalize(article(rows[f"{law}-20250101"]["rawPath"], number))
        after = normalize(article(rows[current]["rawPath"], number))
        comparisons.append({"law": law, "article": number, "earlierEdition": "2025-01-01",
                            "laterSourceId": current, "bodySha256Earlier": sha(before.encode()),
                            "bodySha256Later": sha(after.encode()), "equal": before == after})
assert all(row["equal"] for row in comparisons), "Earlier consolidation changes require assessment"


def visible(path):
    text = (ROOT / path).read_text()
    text = re.sub(r"<script\b[^>]*>[\s\S]*?</script>", "", text, flags=re.I)
    text = re.sub(r"<style\b[^>]*>[\s\S]*?</style>", "", text, flags=re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text))).strip()


bj = rows["OF001-BJ"]
before, after = visible(bj["baselinePath"]), visible(bj["rawPath"])
assert before == after, "BJ visible content changed and needs assessment"
assert "Referendumsvorlage" in after and "2891" in after
bbl = ET.parse(ROOT / rows["BBl-2025-2891"]["rawPath"])
bbl_text = " ".join("".join(bbl.getroot().itertext()).split())
assert "Bundesrat bestimmt das Inkrafttreten" in bbl_text
judgment_path = ".work/release-mvp06-2026-10-01/remainder/entscheidsuche-8C-767-2008.json"
judgment_bytes = (ROOT / judgment_path).read_bytes()
judgment = json.loads(judgment_bytes)["result"]
assert judgment["id"] == "CH_BGer_008_8C-767-2008_2009-01-12"
assert judgment["decision_date"] == "2009-01-12" and not judgment["text_truncated"]
start = judgment["text"].index("\n4.3.2 Ist die Ansetzung")
end = judgment["text"].index("\n5.", start)
pinpoint = judgment["text"][start:end]
assert "unmittelbaren Zusammenhang zur Beschwerdeeinreichung" in pinpoint
assert "keiner endgültigen Klärung" in pinpoint
result = {
    "checkedOn": "2026-10-01", "formalApproval": False,
    "normalization": "XML article bodies exclude authorialNote elements and normalize whitespace and soft hyphens. BJ visible text excludes scripts, styles and tags, then decodes HTML entities and normalizes whitespace. Neither comparison changes the archived originals.",
    "earlierConsolidations": comparisons,
    "monitoringOF001": {"bjVisibleTextUnchanged": True, "bjVisibleTextSha256": sha(after.encode()),
        "referendumTextStillLinked": True, "bblCommencementStillDelegatedToFederalCouncil": True,
        "bblOriginalByteIdentical": rows["BBl-2025-2891"]["previousWholeDocumentHashMatches"],
        "finding": "No operative commencement date inferred from the unchanged BJ dossier or BBl referendum text. Fresh current/future law and impact-index checks remain required alongside this page."},
    "jurisprudence": {"sourceId": "JUD-AP17C-BGER-8C-767-2008-20090112",
        "method": "Fresh exact-case search and full-text retrieval via Entscheidsuche MCP, E. 4.3.1/4.3.2 reread",
        "documentId": judgment["id"], "decisionDate": judgment["decision_date"],
        "rawToolResponsePath": judgment_path, "rawToolResponseSha256": sha(judgment_bytes),
        "pinpointTextSha256": sha(pinpoint.encode()), "sourceClassification": "nonofficial-judgment-mirror",
        "openCaseLawAvailability": "No callable OpenCaseLaw connector in this session, not claimed as used",
        "finding": "The accepted extension to formal complaint-correction deadlines is confirmed. The judgment expressly leaves general later court deadlines unresolved. No extension of the modeled scope.",
        "exhaustiveNewerCaseLawSearch": False},
}
target = OUT / "bounded-comparison.json"
with target.open("x", encoding="utf-8") as handle:
    handle.write(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"earlierArticlePairs": len(comparisons), "equal": all(r["equal"] for r in comparisons), "bjVisibleTextUnchanged": True}))
