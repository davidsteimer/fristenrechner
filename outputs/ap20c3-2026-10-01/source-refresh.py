"""Read-only official MVG/ÜLG integration refresh. Emits JSON, writes no files."""
import concurrent.futures
import copy
import datetime
import hashlib
import html
import json
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = ROOT / "outputs/ap20b-2026-09-30"
WORKS = {"ATSG": "2002/510", "MVG": "1993/3043_3043_3043", "MVV": "1993/3080_3080_3080", "ÜLG": "2021/373", "ÜLV": "2021/376"}
ARTICLES = {"ATSG": ["2", "38", "39", "40", "41", "49", "51", "52", "55", "56", "58", "60", "61"], "MVG": ["1", "22", "27", "104", "105"], "MVV": ["32a"], "ÜLG": ["1", "18", "19", "23"], "ÜLV": ["38"]}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()

def fetch(url, accept=None):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in {"fedlex.data.admin.ch", "www.belex.sites.be.ch"}:
        raise ValueError("Only bound official HTTPS sources permitted")
    req = urllib.request.Request(url, headers={"Accept": accept} if accept else {})
    with urllib.request.urlopen(req, timeout=45) as response:
        data = response.read()
        meta = {"url": url, "finalUrl": response.url, "retrievedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "httpStatus": response.status, "contentType": response.headers.get("content-type"), "bytes": len(data), "sha256": digest(data)}
    return data, meta

def checked(fn, arg):
    try:
        return fn(arg)
    except Exception as exc:
        return {"error": str(exc), "input": {key: arg.get(key) for key in ("law", "name", "start", "url") if key in arg}}

def refresh_index(old):
    query = re.sub(r"VALUES \?work \{[^}]+\}", "VALUES ?work { " + " ".join("<https://fedlex.data.admin.ch/eli/cc/" + path + ">" for path in WORKS.values()) + " }", old["query"])
    data, receipt = fetch("https://fedlex.data.admin.ch/sparqlendpoint?query=" + urllib.parse.quote(query), "application/sparql-results+json")
    rows = [{k: v["value"] for k, v in row.items()} for row in json.loads(data)["results"]["bindings"]]
    previous = [row for row in old["rows"] if row["work"] in {"https://fedlex.data.admin.ch/eli/cc/" + v for v in WORKS.values()}]
    key = lambda row: canonical(row)
    return {"name": old["name"], "query": query, "receipt": receipt, "rows": rows, "previousFilteredRowCount": len(previous), "freshRowCount": len(rows), "semanticRowsEqual": sorted(previous, key=key) == sorted(rows, key=key), "previousFilteredRowsSha256": digest(canonical(sorted(previous, key=key))), "freshRowsSha256": digest(canonical(sorted(rows, key=key)))}

def refresh_original(old):
    data, receipt = fetch(old["url"])
    root = ET.fromstring(data)
    if root.tag.rsplit("}", 1)[-1] != "akomaNtoso":
        raise ValueError("Not Akoma-Ntoso original")
    texts = {}
    for article in root.iter():
        if article.tag.rsplit("}", 1)[-1] != "article":
            continue
        number = article.get("eId", "").removeprefix("art_").replace("_", "")
        if number not in ARTICLES[old["law"]]:
            continue
        clean = copy.deepcopy(article)
        for parent in clean.iter():
            for child in list(parent):
                if child.tag.rsplit("}", 1)[-1] == "authorialNote":
                    tail = child.tail
                    child.clear()
                    child.tail = tail
        texts[number] = " ".join(" ".join(clean.itertext()).replace("\u00ad", "").split())
    previous = {row["number"]: row["text"] for row in old["articles"] if row["number"] in ARTICLES[old["law"]]}
    assert set(texts) == set(ARTICLES[old["law"]]), (old["law"], set(texts))
    return {"law": old["law"], "start": old["start"], "end": old.get("end"), "receipt": receipt, "baselineSha256": old["sha256"], "bytesEqualToAP20B": digest(data) == old["sha256"], "tragendeArtikel": list(texts), "normTextsEqualToAP20B": texts == previous, "normTexts": texts, "normTextsSha256": digest(canonical(texts))}

def refresh_bern(old):
    data, receipt = fetch(old["metadata"]["url"], "application/json")
    law = json.loads(data)["text_of_law"]
    blocks = re.split(r"(?=<div class=.article.>)", law["selected_version"]["xhtml_tol"])
    texts = {}
    for number in old["articleExtractsFromOfficialXhtml"]:
        pattern = rf"article_number[\s\S]*?class=.number.>\s*{re.escape(number)}\s*</span>"
        matches = [a for a in blocks if re.search(pattern, a[:250])]
        assert len(matches) == 1, (old["law"], number, len(matches))
        texts[number] = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", matches[0]))).strip()
    pdfs = []
    for baseline in old["pdfReceipts"]:
        pdf, pdf_receipt = fetch(baseline["url"])
        assert pdf.startswith(b"%PDF-"), "Not a PDF original"
        pdfs.append({"file": baseline["file"], "receipt": pdf_receipt, "baselineSha256": baseline["sha256"], "bytesEqualToAP20B": digest(pdf) == baseline["sha256"]})
    return {"law": old["law"], "metadataReceipt": receipt, "baselineMetadataSha256": old["metadata"]["sha256"], "metadataBytesEqualToAP20B": digest(data) == old["metadata"]["sha256"], "currentVersion": law["current_version"], "currentVersionEqualToAP20B": law["current_version"] == old["currentVersion"], "futureVersions": law["future_versions"], "futureVersionsEqualToAP20B": law["future_versions"] == old["futureVersions"], "normTexts": texts, "normTextsEqualToAP20B": texts == old["articleExtractsFromOfficialXhtml"], "pdfOriginals": pdfs}

indexes_old = json.loads((BASE / "federal-source-indexes.json").read_text())
originals_old = [row for row in json.loads((BASE / "federal-source-originals.json").read_text()) if row["law"] in WORKS]
bern_old = [row for row in json.loads((BASE / "bern-sources/bern-source-review.json").read_text()) if row["law"] in {"GSOG", "VRPG", "EGELG", "EGKUMV"}]
assert len(originals_old) == 5 and len(bern_old) == 4
tasks = [(refresh_index, row) for row in indexes_old] + [(refresh_original, row) for row in originals_old] + [(refresh_bern, row) for row in bern_old]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(lambda item: checked(*item), tasks))
indexes = results[:len(indexes_old)]
originals = results[len(indexes_old):len(indexes_old) + len(originals_old)]
bern = results[len(indexes_old) + len(originals_old):]
errors = [row for row in results if "error" in row]
elg_baseline = json.loads((BASE / "federal-source-elg-cross-reference.json").read_text())

def refresh_bound_index(old):
    data, receipt = fetch(old["response"]["url"], "application/sparql-results+json")
    rows = [{k: v["value"] for k, v in row.items()} for row in json.loads(data)["results"]["bindings"]]
    ordered_old = sorted(old["rows"], key=canonical)
    ordered_fresh = sorted(rows, key=canonical)
    return {"query": old["query"], "receipt": receipt, "rows": rows, "semanticRowsEqualToAP20B": ordered_old == ordered_fresh, "previousRowsSha256": digest(canonical(ordered_old)), "freshRowsSha256": digest(canonical(ordered_fresh))}

def refresh_elg_original(old):
    data, receipt = fetch(old["url"])
    root = ET.fromstring(data)
    assert root.tag.rsplit("}", 1)[-1] == "akomaNtoso"
    articles = [node for node in root.iter() if node.tag.rsplit("}", 1)[-1] == "article" and node.get("eId", "").removeprefix("art_").replace("_", "") == "21"]
    assert len(articles) == 1
    paragraphs = [node for node in articles[0].iter() if node.tag.rsplit("}", 1)[-1] == "paragraph" and any(child.tag.rsplit("}", 1)[-1] == "num" and "".join(child.itertext()).strip() == "2" for child in node)]
    assert len(paragraphs) == 1
    clean = copy.deepcopy(paragraphs[0])
    for parent in clean.iter():
        for child in list(parent):
            if child.tag.rsplit("}", 1)[-1] == "authorialNote":
                tail = child.tail
                child.clear()
                child.tail = tail
    text = " ".join(" ".join(clean.itertext()).replace("\u00ad", "").split())
    return {"start": old["start"], "end": old.get("end"), "receipt": receipt, "baselineSha256": old["sha256"], "bytesEqualToAP20B": digest(data) == old["sha256"], "article": "21", "paragraph": "2", "text": text, "normTextEqualToAP20B": text == old["text"], "normTextSha256": digest(text.encode())}

elg_indexes = [refresh_bound_index(elg_baseline[key]) for key in ["versionIndex", "futureIndex"]]
elg_originals = [refresh_elg_original(row) for row in elg_baseline["originals"]]
elg_same = all(row["semanticRowsEqualToAP20B"] for row in elg_indexes) and all(row["bytesEqualToAP20B"] and row["normTextEqualToAP20B"] for row in elg_originals)
elg_continuity = len(elg_originals) == 2 and elg_originals[0]["text"] == elg_originals[1]["text"]

bound_paths = ["docs/fachrecht/quellenabgleich-ap20b-bund.md", "docs/fachrecht/zeitliche-bindung-ap20b.md", "docs/architektur/sozialversicherungsvertrag-ap20b.md", "docs/fachrecht/abnahme-ap20b.md", "outputs/ap20b-2026-09-30/federal-source-indexes.json", "outputs/ap20b-2026-09-30/federal-source-originals.json", "outputs/ap20b-2026-09-30/federal-source-comparisons.json", "outputs/ap20b-2026-09-30/bern-sources/bern-source-review.json", "data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json", "data/releases/2026-09-28-mvp-05-approved.1/social-procedures/ch-social-procedures.json", "outputs/ap20b-2026-09-30/federal-source-elg-cross-reference.json", "docs/fachrecht/abnahme-ap20c2.md", "outputs/ap20c2-2026-10-01/quellenkontrolle.json", "outputs/ap20c1-2026-09-30/quellenkontrolle.json", "docs/entscheidungen/DEC-2026-026-beschluss.md"]
bound = [{"path": path, "sha256": digest((ROOT / path).read_bytes())} for path in bound_paths]
all_same = not errors and all(row["semanticRowsEqual"] for row in indexes) and all(row["bytesEqualToAP20B"] and row["normTextsEqualToAP20B"] for row in originals) and all(row["currentVersionEqualToAP20B"] and row["futureVersionsEqualToAP20B"] and row["normTextsEqualToAP20B"] and all(pdf["bytesEqualToAP20B"] for pdf in row["pdfOriginals"]) for row in bern)
result = {
    "reviewId": "AP20C3-SOURCE-CONTROL-20261001",
    "checkedOn": "2026-10-01",
    "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "purpose": "Begrenzte amtliche Quellenaktualisierung vor lokaler MVG-/ÜLG-Integration AP20C3",
    "scope": {"federalLaws": list(WORKS), "bernLaws": ["GSOG", "VRPG", "EGELG", "EGKUMV"], "crossReference": "ELG Art. 21 Abs. 2, keine vollständige ELG-Fachprüfung", "sourceWindow": {"from": "2026-01-01", "to": "2027-12-31"}, "newFederalRules": 8, "newBernerBindings": 8},
    "baselineBindings": bound,
    "federalIndexes": indexes,
    "federalOriginals": originals,
    "bernOriginals": bern,
    "elgCrossReference": {"versionIndex": elg_indexes[0], "futureIndex": elg_indexes[1], "originals": elg_originals, "normTextIdenticalAcross20270101": elg_continuity, "noDeltaComparedWithAP20B": elg_same},
    "errors": errors,
    "noDeltaInCheckedScope": all_same and elg_same and elg_continuity,
    "reusedNotFreshlyFetched": [
        {"source": "BGer 8C_767/2008 E. 4.3.2", "basis": "In AP20B dokumentierter enger Vorbefund für formelle Beschwerdeverbesserung. Keine neue Rechtsprechungssuche oder ganze Entscheidungslektüre."},
        {"source": "FRG BE und übrige unveränderte CH-/BE-Kalenderquellen", "basis": "MVP-0.5-Quellenprüfung vom 28. September 2026 und unveränderte Kalender. Keine neue Feiertagsquelle oder Ortsfreigabe."},
        {"source": "Bestehende EOG-, FamZG-, FLG- und übrige Sozialverfahren", "basis": "AP20C1-/AP20C2-Quellenkontrollen sowie unveränderte frühere abgenommene Befunde. Keine neue vollständige Originalprüfung dieser Rechtsgebiete in AP20C3."}
    ],
    "limits": [
        "Begrenzter Originalabgleich für die acht AP20C3-Pfade und ihre Ausschlüsse, kein vollständiger Quellenrefresh aller alten Sozialverfahren.",
        "Keine neue Fachabnahme, Datenpromotion, operative Quellenfreigabe oder Betriebsfreigabe.",
        "Die abgenommene 2026–2027-Spanne wird weder zeitlich noch sachlich erweitert.",
        "Bundesoriginale werden frisch byteweise verglichen und die ausgewählten Normtexte neu ausgelesen. ELG wird zusätzlich nur hinsichtlich Art. 21 Abs. 2 geprüft.",
        "Historische Berner PDFs werden frisch byteweise mit AP20B verglichen, nicht erneut visuell oder per PDF-Textextraktion gelesen. Aktuelle XHTML-Artikel werden frisch ausgelesen.",
        "Amtliche Weboberflächen waren über das Web-Lesewerkzeug nicht erreichbar. Direkte amtliche HTTPS-Abrufe sind zeit- und hashgebunden."
    ]
}
print(json.dumps(result, ensure_ascii=False, indent=2))

