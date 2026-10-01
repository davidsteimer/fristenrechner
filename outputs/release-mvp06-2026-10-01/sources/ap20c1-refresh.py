"""Read-only EOG/EOV release refresh. Emits JSON and never writes files."""
import concurrent.futures
import copy
import datetime
import hashlib
import json
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[3]
BASE = ROOT / "outputs/ap20b-2026-09-30"
WORKS = {"EOG": "1952/1021_1046_1050", "EOV": "2005/187"}
ARTICLES = {"EOG": ["1", "17", "18", "24"], "EOV": ["19", "34", "35i", "35q"]}
EXCLUSION_ARTICLES = ["16mbis", "16sbis", "16x"]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def fetch(url, accept=None):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != "fedlex.data.admin.ch":
        raise ValueError("Only bound official Fedlex HTTPS sources permitted")
    request = urllib.request.Request(url, headers={"Accept": accept} if accept else {})
    with urllib.request.urlopen(request, timeout=45) as response:
        data = response.read()
        receipt = {"url": url, "finalUrl": response.url, "retrievedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "httpStatus": response.status, "contentType": response.headers.get("content-type"), "bytes": len(data), "sha256": digest(data)}
    return data, receipt


def checked(fn, arg):
    try:
        return fn(arg)
    except Exception as exc:
        return {"error": str(exc), "input": {key: arg.get(key) for key in ("law", "name", "start", "url") if key in arg}}


def refresh_index(old):
    query = re.sub(r"VALUES \?work \{[^}]+\}", "VALUES ?work { " + " ".join("<https://fedlex.data.admin.ch/eli/cc/" + path + ">" for path in WORKS.values()) + " }", old["query"])
    data, receipt = fetch("https://fedlex.data.admin.ch/sparqlendpoint?query=" + urllib.parse.quote(query), "application/sparql-results+json")
    rows = [{key: value["value"] for key, value in row.items()} for row in json.loads(data)["results"]["bindings"]]
    previous = [row for row in old["rows"] if row["work"] in {"https://fedlex.data.admin.ch/eli/cc/" + path for path in WORKS.values()}]
    key = lambda row: canonical(row)
    return {"name": old["name"], "query": query, "receipt": receipt, "rows": rows, "previousFilteredRowCount": len(previous), "freshRowCount": len(rows), "semanticRowsEqual": sorted(previous, key=key) == sorted(rows, key=key), "previousFilteredRowsSha256": digest(canonical(sorted(previous, key=key))), "freshRowsSha256": digest(canonical(sorted(rows, key=key))), "futureSubsetOnReleaseDate": [row for row in rows if row.get("date", "") >= "2026-10-01"] if old["name"] == "impacts" else None}


def refresh_original(old):
    data, receipt = fetch(old["url"])
    document = ET.fromstring(data)
    if document.tag.rsplit("}", 1)[-1] != "akomaNtoso":
        raise ValueError("Not an Akoma-Ntoso original")
    selected = ARTICLES[old["law"]]
    extra = EXCLUSION_ARTICLES if old["law"] == "EOG" and old["start"] == "2027-07-01" else []
    texts = {}
    for article in document.iter():
        if article.tag.rsplit("}", 1)[-1] != "article":
            continue
        number = article.get("eId", "").removeprefix("art_").replace("_", "")
        if number not in selected + extra:
            continue
        clean = copy.deepcopy(article)
        for parent in clean.iter():
            for child in list(parent):
                if child.tag.rsplit("}", 1)[-1] == "authorialNote":
                    tail = child.tail
                    child.clear()
                    child.tail = tail
        texts[number] = " ".join(" ".join(clean.itertext()).replace("\u00ad", "").split())
    assert set(texts) == set(selected + extra), (old["law"], old["start"], set(texts))
    main = {number: texts[number] for number in selected}
    previous = {row["number"]: row["text"] for row in old["articles"] if row["number"] in selected}
    return {"sourceId": "SRC-AP20C1-" + old["law"] + "-" + old["start"].replace("-", ""), "law": old["law"], "start": old["start"], "end": old.get("end"), "receipt": receipt, "baselineSha256": old["sha256"], "bytesEqualToAP20B": digest(data) == old["sha256"], "tragendeArtikel": selected, "normTextsEqualToAP20B": main == previous, "normTexts": main, "normTextsSha256": digest(canonical(main)), "freshExclusionTexts": {number: texts[number] for number in extra}, "exclusionComparisonMethod": "Erstmals separat extrahierte Zusatzleistungsabgrenzung. Vollstaendige Originalbytes identisch zu AP20B, bisherige fachliche Abgrenzung wiederverwendet. Keine neue positive Regel." if extra else None}


indexes_old = json.loads((BASE / "federal-source-indexes.json").read_text())
originals_old = [row for row in json.loads((BASE / "federal-source-originals.json").read_text()) if row["law"] in WORKS]
tasks = [(refresh_index, row) for row in indexes_old] + [(refresh_original, row) for row in originals_old]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(lambda item: checked(*item), tasks))
indexes = results[:len(indexes_old)]
originals = results[len(indexes_old):]
errors = [row for row in results if "error" in row]
bound_paths = ["docs/fachrecht/abnahme-ap20b.md", "docs/fachrecht/abnahme-ap20c1.md", "docs/fachrecht/quellenabgleich-ap20b-bund.md", "docs/fachrecht/zeitliche-bindung-ap20b.md", "outputs/ap20b-2026-09-30/federal-source-indexes.json", "outputs/ap20b-2026-09-30/federal-source-originals.json", "outputs/ap20b-2026-09-30/federal-source-comparisons.json", "outputs/ap20c1-2026-09-30/quellenkontrolle.json", "data/candidates/2026-10-01-ap20c3/manifest.json"]
bound = [{"path": path, "sha256": digest((ROOT / path).read_bytes())} for path in bound_paths]
same = not errors and all(row["semanticRowsEqual"] for row in indexes) and all(row["bytesEqualToAP20B"] and row["normTextsEqualToAP20B"] for row in originals)
result = {"reviewId": "MVP06-AP20C1-SOURCE-REFRESH-20261001", "checkedOn": "2026-10-01", "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "purpose": "Begrenzter EOG/EOV-Releaseabgleich gegen die unveraenderten AP20B/AP20C1-Grundlagen", "recordStatus": "candidate", "humanApproval": False, "dataPromotionAuthorized": False, "operatingApproval": False, "scope": {"federalLaws": list(WORKS), "sourceWindow": {"from": "2026-01-01", "to": "2027-12-31"}, "manifestSourceCount": 6, "newPositiveRoutes": 0}, "baselineBindings": bound, "federalIndexes": indexes, "federalOriginals": originals, "errors": errors, "noDeltaInCheckedScope": same, "reusedNotFreshlyFetched": [{"source": "AS 2026 433 und AS 2026 457", "basis": "Abgenommener AP20B-Volltextbefund bleibt gebunden. Erneut gelesen werden hier die sechs konsolidierten EOG/EOV-Originale und saemtliche amtlichen Wirkungshinweise im Fenster 2026-2027, nicht die beiden AS-Volltexte."}], "limits": ["Kein Nachweis fuer alle 77 Manifest- oder 82 zusaetzlichen Katalogreferenzen.", "Kein neuer Abruf von ATSG, Berner Quellen oder Rechtsprechung. Diese erhalten separate belegte Zuordnungen.", "Fassungsindex und vollstaendiger artikelbezogener Wirkungsindex werden als volle Zeilen verglichen, nicht nur anhand der Trefferzahl. Kein Publikationsjahr- oder Artikelfilter.", "Der Wirkungsindex umfasst 2026-2027, die enthaltene Zukunftsprojektion beginnt am 1. Oktober 2026. Neu veroeffentlichte spaetere Akte sind damit nicht garantiert ausgeschlossen.", "Keine automatische Gesamtquellenabnahme, Registrierung, Datenpromotion oder territoriale Erweiterung."]}
print(json.dumps(result, ensure_ascii=False, indent=2))
