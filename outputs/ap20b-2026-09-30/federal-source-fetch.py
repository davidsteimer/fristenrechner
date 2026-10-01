"""Read-only Fedlex evidence collector for AP20B. Emits JSON, writes no files."""
import concurrent.futures
import copy
import datetime
import hashlib
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

WORKS = {
    "ATSG": "2002/510",
    "EOG": "1952/1021_1046_1050",
    "FamZG": "2008/51",
    "FLG": "1952/823_843_839",
    "MVG": "1993/3043_3043_3043",
    "ÜLG": "2021/373",
    "EOV": "2005/187",
    "FLV": "1952/896_916_912",
    "MVV": "1993/3080_3080_3080",
    "ÜLV": "2021/376",
}
ARTICLES = {
    "ATSG": ["2", "38", "39", "40", "41", "49", "51", "52", "55", "56", "58", "60", "61"],
    "EOG": ["1", "17", "18", "20", "24", "29"],
    "FamZG": ["1", "3", "22", "29"],
    "FLG": ["1", "13", "22", "25"],
    "MVG": ["1", "22", "27", "104", "105", "117"],
    "ÜLG": ["1", "18", "19", "23", "28"],
    "EOV": ["19", "34", "35i", "35q", "45"],
    "FLV": ["10", "25"],
    "MVV": ["32a", "42"],
    "ÜLV": ["38", "51"],
}
PREFIX = "PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>\n"
VALUES = "VALUES ?work { " + " ".join("<https://fedlex.data.admin.ch/eli/cc/" + v + ">" for v in WORKS.values()) + " }\n"
QUERIES = {
    "versions": PREFIX + """SELECT DISTINCT ?work ?version ?start ?end ?expression ?xml WHERE {
""" + VALUES + """
      ?version jolux:isMemberOf ?work; jolux:dateApplicability ?start.
      OPTIONAL { ?version jolux:dateEndApplicability ?end }
      OPTIONAL {
        ?version jolux:isRealizedBy ?expression.
        ?expression jolux:language <http://publications.europa.eu/resource/authority/language/DEU>;
          jolux:isEmbodiedBy ?manifestation.
        ?manifestation jolux:format <http://publications.europa.eu/resource/authority/file-type/XML>;
          jolux:isExemplifiedBy ?xml.
      }
      FILTER(str(?start) <= "2027-12-31" && (!BOUND(?end) || str(?end) >= "2026-01-01"))
    } ORDER BY ?work ?start""",
    "impacts": PREFIX + """SELECT DISTINCT ?work ?impact ?date ?target ?source WHERE {
""" + VALUES + """
      ?impact jolux:impactToLegalResource ?target;
        jolux:legalResourceImpactHasDateEntryInForce ?date.
      { ?target jolux:legalResourceSubdivisionIsPartOf ?work. } UNION { FILTER(?target = ?work) }
      OPTIONAL { ?impact jolux:impactFromLegalResource/jolux:legalResourceSubdivisionIsPartOf ?source }
      FILTER(str(?date) >= "2026-01-01" && str(?date) <= "2027-12-31")
    } ORDER BY ?work ?date ?target""",
}

def fetch(url, accept=None):
    req = urllib.request.Request(url, headers={"Accept": accept} if accept else {})
    with urllib.request.urlopen(req, timeout=40) as response:
        data = response.read()
        return data, {
            "url": url,
            "retrievedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "httpStatus": response.status,
            "contentType": response.headers.get("content-type"),
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
        }

def query(name):
    data, meta = fetch("https://fedlex.data.admin.ch/sparqlendpoint?query=" + urllib.parse.quote(QUERIES[name]), "application/sparql-results+json")
    rows = [{k: v["value"] for k, v in row.items()} for row in json.loads(data)["results"]["bindings"]]
    return {"name": name, "query": QUERIES[name], "response": meta, "rows": rows}

def original(row):
    law = next(k for k, v in WORKS.items() if row["work"].endswith("/" + v))
    if "xml" not in row:
        return {"law": law, **row, "error": "No XML manifestation in official version index"}
    try:
        data, meta = fetch(row["xml"])
        root = ET.fromstring(data)
        if "akomaNtoso" not in root.tag:
            return {"law": law, **row, **meta, "error": "Not an Akoma Ntoso XML original", "rootTag": root.tag}
        articles = []
        all_articles = {}
        for article in root.iter():
            if article.tag.rsplit("}", 1)[-1] != "article":
                continue
            n = article.get("eId", "").replace("art_", "", 1).replace("_", "")
            clean = copy.deepcopy(article)
            notes = [" ".join(" ".join(x.itertext()).split()) for x in article.iter() if x.tag.rsplit("}", 1)[-1] == "authorialNote"]
            for parent in clean.iter():
                for child in list(parent):
                    if child.tag.rsplit("}", 1)[-1] == "authorialNote":
                        tail = child.tail
                        child.clear()
                        child.tail = tail
            norm = " ".join(" ".join(clean.itertext()).replace("\u00ad", "").split())
            all_articles[n] = norm
            if n in ARTICLES[law]:
                articles.append({"number": n, "id": article.get("eId"), "text": norm, "notes": notes})
        return {"law": law, **row, **meta, "rootTag": root.tag, "articles": articles, "allNorms": all_articles}
    except Exception as exc:
        return {"law": law, **row, "error": str(exc)}

mode = sys.argv[1] if len(sys.argv) > 1 else "indexes"
if mode == "indexes":
    print(json.dumps(list(concurrent.futures.ThreadPoolExecutor().map(query, QUERIES)), ensure_ascii=False, indent=2))
elif mode == "originals":
    versions = query("versions")
    originals = list(concurrent.futures.ThreadPoolExecutor(max_workers=6).map(original, versions["rows"]))
    for row in originals:
        row.pop("allNorms", None)
    print(json.dumps(originals, ensure_ascii=False, indent=2))
elif mode == "comparisons":
    versions = query("versions")
    originals = list(concurrent.futures.ThreadPoolExecutor(max_workers=6).map(original, versions["rows"]))
    result = []
    for law in WORKS:
        rows = sorted([r for r in originals if r["law"] == law], key=lambda r: r["start"])
        for old, new in zip(rows, rows[1:]):
            changes = [{"article": n, "old": old["allNorms"].get(n), "new": new["allNorms"].get(n)} for n in sorted(set(old["allNorms"]) | set(new["allNorms"])) if old["allNorms"].get(n) != new["allNorms"].get(n)]
            result.append({"law": law, "from": old["start"], "to": new["start"], "changes": changes})
    print(json.dumps(result, ensure_ascii=False, indent=2))
else:
    raise SystemExit("Use indexes or originals")
