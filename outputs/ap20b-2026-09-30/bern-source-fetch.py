"""Read-only official BELEX source capture for AP20B.

Downloads public original law metadata and PDFs into this evidence directory.
Does not modify product data, approved documentation or the source register.
"""
import concurrent.futures
import datetime
import hashlib
import html
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent / "bern-sources"
LAWS = [
    ("GSOG", "161.1", ["54"], [3144]),
    ("VRPG", "155.21", ["1", "32", "81", "83"], [2855]),
    ("KFAMZG", "832.71", ["1", "2", "26", "27"], []),
    ("EGELG", "841.31", ["8", "9"], []),
    ("EGKUMV", "842.11", ["39", "40"], [2435]),
]


def download(url, name):
    checked = datetime.datetime.now(datetime.timezone.utc).isoformat()
    request = urllib.request.Request(url, headers={"Accept": "application/json, application/pdf, */*"})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read()
        content_type = response.headers.get("Content-Type")
        status = response.status
    (ROOT / name).write_bytes(data)
    return data, {"file": name, "url": url, "checkedAt": checked, "status": status,
                  "contentType": content_type, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def fetch_law(spec):
    name, number, articles, historical = spec
    url = f"https://www.belex.sites.be.ch/api/de/texts_of_law/{number}"
    data, receipt = download(url, name + ".json")
    law = json.loads(data)["text_of_law"]
    selected = law["selected_version"]
    blocks = re.split(r"(?=<div class=.article.>)", selected["xhtml_tol"])
    extracts = {}
    for article in articles:
        pattern = rf"article_number[\s\S]*?class=.number.>\s*{re.escape(article)}\s*</span>"
        matches = [a for a in blocks if re.search(pattern, a[:250])]
        if len(matches) != 1:
            raise ValueError(f"{name} article {article}: expected one block, got {len(matches)}")
        text = html.unescape(re.sub(r"<[^>]+>", " ", matches[0]))
        extracts[article] = re.sub(r"\s+", " ", text).strip()
    pdf_receipts = []
    for version in [selected["id"], *historical]:
        _, pdf = download(f"https://www.belex.sites.be.ch/api/de/versions/{version}/pdf_file", f"{name}-{version}.pdf")
        pdf_receipts.append(pdf)
    return {"law": name, "systematicNumber": number, "metadata": receipt,
            "currentVersion": law["current_version"], "futureVersions": law["future_versions"],
            "historicalVersionsUsed": [v for v in law["old_versions"] if v["id"] in historical],
            "articleExtractsFromOfficialXhtml": extracts, "pdfReceipts": pdf_receipts}


ROOT.mkdir(parents=True, exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    result = list(pool.map(fetch_law, LAWS))
(ROOT / "bern-source-review.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps([{ "law": r["law"], "version": r["currentVersion"]["id"],
                   "futureVersions": len(r["futureVersions"]),
                   "articles": list(r["articleExtractsFromOfficialXhtml"]),
                   "pdfs": [{"file": p["file"], "sha256": p["sha256"]} for p in r["pdfReceipts"]]}
                  for r in result], ensure_ascii=False, indent=2))
