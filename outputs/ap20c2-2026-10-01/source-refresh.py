"""Read-only official FamZG/FLG integration refresh. Emits JSON, writes no files."""
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
WORKS = {"ATSG": "2002/510", "FamZG": "2008/51", "FLG": "1952/823_843_839", "FLV": "1952/896_916_912"}
ARTICLES = {"ATSG": ["2", "38", "39", "40", "41", "49", "51", "52", "55", "56", "58", "60", "61"], "FamZG": ["1", "3", "22"], "FLG": ["1", "13", "22", "25"], "FLV": ["10"]}

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

def refresh_index(old, works=WORKS):
    query = re.sub(r"VALUES \?work \{[^}]+\}", "VALUES ?work { " + " ".join("<https://fedlex.data.admin.ch/eli/cc/" + path + ">" for path in works.values()) + " }", old["query"])
    data, receipt = fetch("https://fedlex.data.admin.ch/sparqlendpoint?query=" + urllib.parse.quote(query), "application/sparql-results+json")
    rows = [{k: v["value"] for k, v in row.items()} for row in json.loads(data)["results"]["bindings"]]
    previous = [row for row in old["rows"] if row["work"] in {"https://fedlex.data.admin.ch/eli/cc/" + v for v in works.values()}]
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
bern_old = [row for row in json.loads((BASE / "bern-sources/bern-source-review.json").read_text()) if row["law"] in {"GSOG", "VRPG", "KFAMZG"}]
assert len(bern_old) == 3 and len(originals_old) == 5
tasks = [(refresh_index, row) for row in indexes_old] + [(refresh_original, row) for row in originals_old] + [(refresh_bern, row) for row in bern_old]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(lambda item: checked(*item), tasks))
indexes = results[:len(indexes_old)]
originals = results[len(indexes_old):len(indexes_old) + len(originals_old)]
bern = results[len(indexes_old) + len(originals_old):]
errors = [row for row in results if "error" in row]
# FamZV was not a standalone AP20B work. Keep new discovery separate from baseline refresh.
famzv_indexes = [refresh_index(row, {"FamZV": "2008/52"}) for row in indexes_old]
for row in famzv_indexes:
    row.pop("semanticRowsEqual")
    row["baselineComparison"] = "No separate AP20B FamZV index. Additional bounded original check."
famzv_originals = []
for row in next(i for i in famzv_indexes if i["name"] == "versions")["rows"]:
    data, receipt = fetch(row["xml"])
    root = ET.fromstring(data)
    assert root.tag.rsplit("}", 1)[-1] == "akomaNtoso"
    texts = {}
    for article in root.iter():
        if article.tag.rsplit("}", 1)[-1] != "article":
            continue
        number = article.get("eId", "").removeprefix("art_").replace("_", "")
        clean = copy.deepcopy(article)
        for parent in clean.iter():
            for child in list(parent):
                if child.tag.rsplit("}", 1)[-1] == "authorialNote":
                    tail = child.tail
                    child.clear()
                    child.tail = tail
        texts[number] = " ".join(" ".join(clean.itertext()).replace("\u00ad", "").split())
    famzv_originals.append({"start": row["start"], "end": row.get("end"), "receipt": receipt, "normTexts": texts, "normTextsSha256": digest(canonical(texts))})
famzv_changes = []
for before, after in zip(famzv_originals, famzv_originals[1:]):
    keys = sorted(set(before["normTexts"]) | set(after["normTexts"]))
    changes = [{"article": key, "before": before["normTexts"].get(key), "after": after["normTexts"].get(key)} for key in keys if before["normTexts"].get(key) != after["normTexts"].get(key)]
    famzv_changes.append({"from": before["start"], "to": after["start"], "changes": changes})
flg_rows = [row for row in originals if row.get("law") == "FLG"]
flg_continuity = {"from": "2024-01-01", "to": "2027-07-01", "articleNumbers": ARTICLES["FLG"], "normTextsIdenticalAcross20270701": len(flg_rows) == 2 and flg_rows[0]["normTexts"] == flg_rows[1]["normTexts"], "materialArticle10Comparison": next(row for row in json.loads((BASE / "federal-source-comparisons.json").read_text()) if row["law"] == "FLG"), "method": "Fresh complete FLG files compared bytewise with AP20B, selected route articles additionally extracted anew. AP20B Art. 10 comparison reused through exact original-file identity."}

bound_paths = ["docs/fachrecht/quellenabgleich-ap20b-bund.md", "docs/fachrecht/zeitliche-bindung-ap20b.md", "docs/architektur/sozialversicherungsvertrag-ap20b.md", "docs/fachrecht/abnahme-ap20b.md", "outputs/ap20b-2026-09-30/federal-source-indexes.json", "outputs/ap20b-2026-09-30/federal-source-originals.json", "outputs/ap20b-2026-09-30/federal-source-comparisons.json", "outputs/ap20b-2026-09-30/bern-sources/bern-source-review.json", "data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json", "data/releases/2026-09-28-mvp-05-approved.1/social-procedures/ch-social-procedures.json", "docs/fachrecht/abnahme-ap20c1.md", "outputs/ap20c1-2026-09-30/quellenkontrolle.json", "docs/entscheidungen/DEC-2026-026-beschluss.md"]
bound = [{"path": path, "sha256": digest((ROOT / path).read_bytes())} for path in bound_paths]
all_same = not errors and all(row["semanticRowsEqual"] for row in indexes) and all(row["bytesEqualToAP20B"] and row["normTextsEqualToAP20B"] for row in originals) and all(row["currentVersionEqualToAP20B"] and row["futureVersionsEqualToAP20B"] and row["normTextsEqualToAP20B"] and all(pdf["bytesEqualToAP20B"] for pdf in row["pdfOriginals"]) for row in bern)
result = {"reviewId": "AP20C2-SOURCE-CONTROL-20261001", "checkedOn": "2026-10-01", "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "purpose": "Begrenzte amtliche Quellenaktualisierung vor lokaler FamZG-/FLG-Integration AP20C2", "scope": {"federalLaws": list(WORKS), "bernLaws": ["GSOG", "VRPG", "KFamZG"], "sourceWindow": {"from": "2026-01-01", "to": "2027-12-31"}, "newFederalRules": 8, "newBernerBindings": 8}, "baselineBindings": bound, "federalIndexes": indexes, "federalOriginals": originals, "bernOriginals": bern, "flg2027Continuity": flg_continuity, "additionalFamZVReview": {"federalIndexes": famzv_indexes, "originals": famzv_originals, "comparisons": famzv_changes, "notAnAP20BBaselineComparison": True}, "errors": errors, "noDeltaInCheckedScope": all_same and flg_continuity["normTextsIdenticalAcross20270701"], "reusedNotFreshlyFetched": [{"source": "BGer 8C_767/2008 E. 4.3.2", "basis": "In AP20B ausdrücklich dokumentierter enger Vorbefund für Beschwerdeverbesserung. Keine neue Rechtsprechungsrecherche oder ganze Entscheidungslektüre."}, {"source": "FRG BE und übrige unveränderte CH-/BE-Kalenderquellen", "basis": "MVP-0.5-Quellenprüfung vom 28. September 2026 und unveränderte bereits freigegebene Kalender. Keine neue Feiertagsquelle oder Ortsfreigabe."}, {"source": "AS 2026 433 und AS 2026 457", "basis": "AP20B-Originalprüfung und Übergangsbeurteilung werden wiederverwendet. Für AP20C2 frisch erneut gelesen sind die beiden FLG-Konsolidierungen sowie die FamZV-Konsolidierungen und ihre begrenzten amtlichen Änderungsmetadaten, nicht die AS-Volltexte selbst."}], "limits": ["Kein vollständiger EOG-/AP20C3- oder MVP-0.5-Quellenrefresh.", "Quellenkontrolle ist keine neue Fachabnahme, Datenpromotion, operative Quellenfreigabe oder Betriebsfreigabe.", "Die abgenommene 2026–2027-Spanne wird weder zeitlich noch sachlich erweitert.", "Originalexportrückvergleich erfolgt byteweise. Normextrakte werden zusätzlich artikelgenau gegen AP20B geprüft. Bei bernischen Metadaten ist eine reine Metadatenbyteänderung getrennt von Norm- und Versionsänderungen erkennbar.", "Amtliche Weboberflächen waren im Web-Lesewerkzeug nicht erreichbar. Erfolgreiche direkte HTTPS-Abrufe der amtlichen XML-, API- und PDF-Endpunkte sind separat zeit- und hashgebunden."]}
famzv_expected_change = len(famzv_originals) == 2 and len(famzv_changes) == 1 and famzv_changes[0]["from"] == "2025-01-01" and famzv_changes[0]["to"] == "2027-07-01" and [item["article"] for item in famzv_changes[0]["changes"]] == ["10"]
result["additionalFamZVReview"]["onlyArticle10Changed"] = famzv_expected_change
result["additionalFamZVReview"]["scopeAssessment"] = "Der Vergleich sämtlicher Artikel zeigt ausschliesslich die bereits in AP20B über AS 2026 457 geprüfte Änderung von Art. 10 zur materiellen Anspruchsdauer. Art. 11 betrifft die Kassenqualifikation bei mehreren Erwerbstätigkeiten, nicht eine automatische Herleitung im Rechner. Art. 19 betrifft Behördenbeschwerden an Bundesgerichte und ist kein neuer AP20-Parteipfad. Register- und Behördenfristen werden nicht integriert. Keine Änderung des abgenommenen AP20B-Fristenvertrags."
result["noDeltaInCheckedScope"] = result["noDeltaInCheckedScope"] and famzv_expected_change
print(json.dumps(result, ensure_ascii=False, indent=2))
