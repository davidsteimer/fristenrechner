"""Bounded, read-only Fedlex original-pair comparison for MVP 0.6.

Only --write creates the new append-only report. It never overwrites an existing
report or changes candidate data, historic reviews, the inventory or approvals.
"""
import concurrent.futures
import copy
import datetime
import hashlib
import json
from pathlib import Path
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
TARGET = ROOT / "outputs/release-mvp06-2026-10-01/sources/source-original-bridges.json"
OLD_PATH = "outputs/release-mvp05-2026-09-28/sources/ap19-source-review.json"
CURRENT_PATH = "outputs/ap20c3-2026-10-01/quellenkontrolle.json"
BINDINGS = {
    OLD_PATH: "c5e37d8c44f9aa17d6b102f654551ea27960231a66dc14a284f91032117f87c7",
    CURRENT_PATH: "b7cfc44bb809f66ff8bbb55e30580710e4716a63253d4125ed6874c55c2b518c",
    "outputs/release-mvp05-2026-09-28/source-review-completeness.json": "67fdf2e5cb3ac19769655ed08f2ff80e9863b76a2526469917832bcba68e27ce",
    "docs/fachrecht/abnahme-quellenpruefung-mvp05.md": "ce1ece8fd0ba72d364b19df851d534528f09e7d645cd5e41872c7a9192d39c5c",
    "data/candidates/2026-10-01-ap20c3/manifest.json": "b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450",
}
SPECS = [
    {"law": "ELG", "versionOn": "2026-01-01", "oldSourceId": "SRC-AP19C-ELG-20260101", "sourceIds": ["SRC-AP19C-ELG-20260101", "SRC-AP20C3-ELG-20260101"], "articles": ["1", "2", "3", "14", "15", "16", "21"]},
    {"law": "ATSG", "versionOn": "2024-01-01", "oldSourceId": "SRC-AP17C-ATSG-20240101", "sourceIds": ["SRC-AP17C-ATSG-20240101", "SRC-ATSG-20240101"], "articles": ["2", "38", "39", "40", "41", "49", "51", "52", "55", "56", "57", "58", "60", "61"]},
]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def local_name(node):
    return node.tag.rsplit("}", 1)[-1]


def normalised_norm(node):
    clean = copy.deepcopy(node)
    for parent in clean.iter():
        for child in list(parent):
            if local_name(child) == "authorialNote":
                tail = child.tail
                child.clear()
                child.tail = tail
    return " ".join(" ".join(clean.itertext()).replace("\u00ad", "").split())


def extract(data, selected):
    root = ET.fromstring(data)
    if local_name(root) != "akomaNtoso":
        raise ValueError("Expected official Akoma Ntoso XML original")
    articles = {}
    for node in root.iter():
        if local_name(node) != "article":
            continue
        number = node.get("eId", "").removeprefix("art_").replace("_", "")
        if number not in selected:
            continue
        if number in articles:
            raise ValueError("Duplicate requested article: " + number)
        paragraphs = {}
        for paragraph in node.iter():
            if local_name(paragraph) != "paragraph":
                continue
            key = paragraph.get("eId", "")
            if not key or key in paragraphs:
                raise ValueError("Missing or duplicate paragraph identifier in article " + number)
            paragraphs[key] = normalised_norm(paragraph)
        notes = [" ".join(" ".join(part.itertext()).split()) for part in node.iter() if local_name(part) == "authorialNote"]
        articles[number] = {"article": number, "eId": node.get("eId"), "normText": normalised_norm(node), "paragraphs": paragraphs, "editorialNoteCount": len(notes), "editorialNotesSha256": sha(canonical(notes))}
    if set(articles) != set(selected):
        raise ValueError("Missing requested articles: " + repr(sorted(set(selected) - set(articles))))
    return articles


def checked_official_url(url):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in {"fedlex.data.admin.ch", "www.fedlex.admin.ch"} or not parsed.path.startswith("/filestore/fedlex.data.admin.ch/eli/cc/") or not parsed.path.endswith(".xml"):
        raise ValueError("Only bound official Fedlex XML originals permitted")
    return url


class OfficialRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, new_url):
        checked_official_url(new_url)
        return super().redirect_request(request, fp, code, msg, headers, new_url)


def fetch_original(task):
    # The older proof used the public www host. Keep its exact XML filename and
    # record the explicit official file-store host used for this fresh retrieval.
    recorded_url = checked_official_url(task["recordedUrl"])
    parsed = urllib.parse.urlparse(recorded_url)
    url = checked_official_url(urllib.parse.urlunparse(parsed._replace(netloc="fedlex.data.admin.ch")))
    started = utc_now()
    try:
        request = urllib.request.Request(url, headers={"Accept": "application/xml"})
        with urllib.request.build_opener(OfficialRedirects()).open(request, timeout=45) as response:
            data = response.read(4_000_001)
            if len(data) > 4_000_000:
                raise ValueError("Original exceeds bounded four-megabyte limit")
            receipt = {"recordedUrl": recorded_url, "requestedUrl": url, "finalUrl": checked_official_url(response.url), "retrievedAt": utc_now(), "httpStatus": response.status, "contentType": response.headers.get("content-type"), "byteLength": len(data), "sha256": sha(data)}
        return {**task, "receipt": receipt, "boundOriginalHashMatches": sha(data) == task["expectedSha256"], "articles": extract(data, task["selectedArticles"])}
    except Exception as exc:
        return {**task, "attemptedAt": started, "requestedUrl": url, "error": str(exc)}


def self_test():
    base = '<akomaNtoso><article eId="art_21"><num>Art. 21</num><paragraph eId="art_21/para_2"><num>2</num><content><p>Norm <b>bleibt</b> gleich<authorialNote>alte Fussnote</authorialNote>.</p></content></paragraph></article></akomaNtoso>'
    old = extract(base.encode(), ["21"])
    notes_only = extract(base.replace("alte Fussnote", "neue Fussnote").encode(), ["21"])
    changed_norm = extract(base.replace("gleich", "anders").encode(), ["21"])
    assert old["21"]["normText"] == notes_only["21"]["normText"]
    assert old["21"]["editorialNotesSha256"] != notes_only["21"]["editorialNotesSha256"]
    assert old["21"]["normText"] != changed_norm["21"]["normText"]
    assert old["21"]["paragraphs"]["art_21/para_2"].endswith("gleich .")
    try:
        extract(base.encode(), ["21", "57"])
        raise AssertionError("Missing article was accepted")
    except ValueError:
        pass
    try:
        checked_official_url("https://example.com/filestore/fedlex.data.admin.ch/eli/cc/test.xml")
        raise AssertionError("Non-official host was accepted")
    except ValueError:
        pass
    identifier_only = extract(base.replace("art_21/para_2", "art_21/para_2_other").encode(), ["21"])
    assert old["21"]["paragraphs"] != identifier_only["21"]["paragraphs"]
    assert list(old["21"]["paragraphs"].values()) == list(identifier_only["21"]["paragraphs"].values())
    return 8


def build():
    parsed = {}
    bindings = []
    for path, expected in BINDINGS.items():
        data = (ROOT / path).read_bytes()
        if sha(data) != expected:
            raise ValueError("Bound historic evidence changed: " + path)
        bindings.append({"path": path, "sha256": expected, "byteLength": len(data)})
        if path.endswith(".json"):
            parsed[path] = json.loads(data)
    inventory_path = "outputs/release-mvp06-2026-10-01/source-inventory.json"
    inventory_bytes = (ROOT / inventory_path).read_bytes()
    bindings.append({"path": inventory_path, "sha256": sha(inventory_bytes), "byteLength": len(inventory_bytes), "bindingRole": "unchanged-provisional-inventory-being-corrected-by-this-addendum"})
    script_path = Path(__file__).resolve().relative_to(ROOT).as_posix()
    bindings.append({"path": script_path, "sha256": sha(Path(__file__).read_bytes())})
    old_review, current_review = parsed[OLD_PATH], parsed[CURRENT_PATH]
    tasks = []
    for spec in SPECS:
        old = next(row for row in old_review["entries"] if row["sourceId"] == spec["oldSourceId"])
        if old["articles"] != spec["articles"]:
            raise ValueError("Requested article list no longer equals MVP05 bound scope")
        if spec["law"] == "ELG":
            current = next(row for row in current_review["elgCrossReference"]["originals"] if row["start"] == spec["versionOn"])
        else:
            current = next(row for row in current_review["federalOriginals"] if row["law"] == spec["law"] and row["start"] == spec["versionOn"])
        for side, url, expected in [("MVP05", old["officialUrl"], old["originalSha256"]), ("AP20C3", current["receipt"]["url"], current["receipt"]["sha256"])]:
            tasks.append({"law": spec["law"], "versionOn": spec["versionOn"], "side": side, "recordedUrl": url, "expectedSha256": expected, "selectedArticles": spec["articles"]})
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        originals = list(executor.map(fetch_original, tasks))
    errors = [{"law": row["law"], "side": row["side"], "error": row.get("error", "Original hash does not match bound evidence")} for row in originals if "error" in row or not row["boundOriginalHashMatches"]]
    comparisons = []
    for spec in SPECS:
        old, current = [row for row in originals if row["law"] == spec["law"]]
        if "error" in old or "error" in current:
            comparisons.append({**spec, "comparisonCompleted": False})
            continue
        per_article = []
        for number in spec["articles"]:
            left, right = old["articles"][number], current["articles"][number]
            paragraph_content_equal = list(left["paragraphs"].values()) == list(right["paragraphs"].values())
            identifier_differences = []
            if paragraph_content_equal:
                for (old_id, old_text), (current_id, current_text) in zip(left["paragraphs"].items(), right["paragraphs"].items()):
                    if old_id != current_id:
                        identifier_differences.append({"oldEId": old_id, "currentEId": current_id, "paragraphNormText": old_text, "paragraphNormTextSha256": sha(old_text.encode()), "normTextEqual": old_text == current_text})
            per_article.append({"article": number, "normalisedNormTextEqual": left["normText"] == right["normText"], "oldNormText": left["normText"], "currentNormText": right["normText"], "oldNormTextSha256": sha(left["normText"].encode()), "currentNormTextSha256": sha(right["normText"].encode()), "paragraphStructureAndTextsEqual": left["paragraphs"] == right["paragraphs"], "paragraphContentAndOrderEqual": paragraph_content_equal, "oldParagraphIds": list(left["paragraphs"]), "currentParagraphIds": list(right["paragraphs"]), "xmlIdentifierDifferences": identifier_differences, "editorialNotesEqual": left["editorialNotesSha256"] == right["editorialNotesSha256"], "oldEditorialNoteCount": left["editorialNoteCount"], "currentEditorialNoteCount": right["editorialNoteCount"], "oldEditorialNotesSha256": left["editorialNotesSha256"], "currentEditorialNotesSha256": right["editorialNotesSha256"]})
        paragraph = None
        if spec["law"] == "ELG":
            paragraph_id = "art_21/para_2"
            left = old["articles"]["21"]["paragraphs"][paragraph_id]
            right = current["articles"]["21"]["paragraphs"][paragraph_id]
            paragraph = {"article": "21", "paragraph": "2", "oldNormText": left, "currentNormText": right, "normalisedNormTextEqual": left == right}
        comparisons.append({**spec, "comparisonCompleted": True, "boundOriginalHashesMatch": old["boundOriginalHashMatches"] and current["boundOriginalHashMatches"], "wholeOriginalBytesEqual": old["receipt"]["sha256"] == current["receipt"]["sha256"], "articleComparisons": per_article, "explicitParagraphComparison": paragraph, "allSelectedNormTextsEqual": all(row["normalisedNormTextEqual"] for row in per_article), "allSelectedParagraphStructuresAndTextsEqual": all(row["paragraphStructureAndTextsEqual"] for row in per_article), "allSelectedParagraphContentAndOrderEqual": all(row["paragraphContentAndOrderEqual"] for row in per_article)})
    verified = not errors and all(row.get("comparisonCompleted") and row.get("boundOriginalHashesMatch") and row.get("allSelectedNormTextsEqual") and row.get("allSelectedParagraphContentAndOrderEqual") for row in comparisons)
    return {"reviewId": "MVP06-SOURCE-ORIGINAL-BRIDGES-20261001", "checkedOn": "2026-10-01", "completedAt": utc_now(), "kind": "bounded-original-pair-norm-text-comparison-addendum", "recordStatus": "candidate", "humanApproval": False, "dataPromotionAuthorized": False, "operatingApproval": False, "scope": {"laws": [row["law"] for row in SPECS], "originals": 4, "articleComparisons": 21, "additionalParagraphComparisons": 1, "newPositiveRoutes": 0, "newVersionOrImpactIndexReview": False}, "correction": {"target": inventory_path, "historicInventoryRetainedUnchanged": True, "previousWholeOriginalIdentityAssumptionCorrect": False, "explanation": "Die MVP05- und AP20C3-Gesamtoriginale fuer ELG 2026 und ATSG 2024 sind NICHT byteidentisch. C3 bestaetigte Identitaet jeweils nur zur AP20B-Datei. Dieser Zusatzbeleg ersetzt die zu weit gehende Whole-source-identity-Begruendung durch einen frischen, getrennten Vergleich aller in der MVP05-Pruefung verwendeten Artikel beider Fassungsdateien. ATSG Art. 57 wird ausdruecklich mitgeprueft. Historische Nachweise und das vorlaeufige Inventar werden nicht umgeschrieben."}, "method": {"freshRetrievals": "Both exact XML filenames for each law freshly retrieved from the official Fedlex file store. Prior public-www host URLs are recorded, retrieval uses official fedlex.data.admin.ch host without changing filename.", "normalisation": "XML parse. Compare complete selected article including heading, numbers and all paragraphs. Remove only authorialNote editorial footnotes, preserve their following text. Collapse whitespace and remove soft hyphens. No punctuation, words, paragraph numbers or substantive conditions discarded. Editorial-note counts and hashes are separately recorded and never equated with operative norm identity.", "granularity": "Full article norm text and paragraph content in original order, including printed paragraph numbers, plus explicit ELG Article 21 paragraph 2. Exact XML paragraph identifiers are independently compared and differences retained. A technical eId difference does not imply a norm change when the complete ordered paragraph texts are equal.", "selfTestsPassed": self_test()}, "baselineBindings": bindings, "originals": [{key: value for key, value in row.items() if key != "articles"} for row in originals], "comparisons": comparisons, "errors": errors, "verifiedNormTextBridgeInCheckedScope": verified, "limits": ["Technischer Normtextvergleich des eng bezeichneten Artikelumfangs, keine neue umfassende Rechtspruefung oder menschliche Freigabe.", "Keine Behauptung, ganze Dateien oder alle Artikel beider Erlasse seien identisch. Unterschiede ausserhalb des angegebenen Artikelumfangs werden nicht untersucht.", "Keine automatische Umdeutung von Fussnotenunterschieden. Gegebenenfalls abweichende redaktionelle Hinweise bleiben separat sichtbar.", "Aktuelle und kuenftige Fassungs-/Wirkungsindexpruefung bleibt durch die separat gebundenen AP20C3-Nachweise belegt und wird hier nicht erneut durchgefuehrt.", "Keine Aenderung von Datenkandidaten, Quellenregister, historischen Berichten, Quellenabnahmen oder Produktaktivierung."]}


if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        print(json.dumps({"selfTestsPassed": self_test()}))
        raise SystemExit(0)
    if sys.argv[1:] not in ([], ["--write"]):
        raise SystemExit("Use --self-test, --write, or no argument to emit JSON")
    if sys.argv[1:] == ["--write"] and TARGET.exists():
        raise SystemExit("Append-only report already exists. Do not overwrite historic evidence.")
    result = build()
    content = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if sys.argv[1:] == ["--write"]:
        with TARGET.open("x", encoding="utf-8") as stream:
            stream.write(content)
        if TARGET.read_bytes() != content.encode("utf-8"):
            raise RuntimeError("Report read-back mismatch")
        print(json.dumps({"path": TARGET.relative_to(ROOT).as_posix(), "sha256": sha(TARGET.read_bytes()), "verifiedNormTextBridgeInCheckedScope": result["verifiedNormTextBridgeInCheckedScope"], "errors": result["errors"], "comparisons": [{key: value for key, value in row.items() if key not in {"articleComparisons", "explicitParagraphComparison"}} for row in result["comparisons"]]}, ensure_ascii=False, indent=2))
    else:
        print(content, end="")
    raise SystemExit(0 if result["verifiedNormTextBridgeInCheckedScope"] else 1)
