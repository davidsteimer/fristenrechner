"""Add native hyperlinks missing from the workbook authoring API and audit OOXML.

Does not author cells, formulas or layout. All worksheet data is created by
the bundled Artifact Tool. Source addresses come only from the checked model.
"""
import hashlib
import io
import json
import sys
import zipfile
import xml.etree.ElementTree as E

target, model_path = sys.argv[1:]
with open(model_path, encoding="utf-8") as source:
    model = json.load(source)
main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
pkg = "http://schemas.openxmlformats.org/package/2006/relationships"
E.register_namespace("", main)
E.register_namespace("r", rel)
with zipfile.ZipFile(target) as archive:
    parts = {name: archive.read(name) for name in archive.namelist()}
sheet_path = "xl/worksheets/sheet4.xml"
sheet = E.fromstring(parts[sheet_path])
original_cells = [E.tostring(c) for c in sheet.findall(".//{" + main + "}c")]
links = E.Element("{" + main + "}hyperlinks")
rels_path = "xl/worksheets/_rels/sheet4.xml.rels"
rels = E.fromstring(parts[rels_path]) if rels_path in parts else E.Element("{" + pkg + "}Relationships")
for existing in list(rels):
    if existing.get("Id", "").startswith("rIdAP23Source"):
        rels.remove(existing)
for existing in list(sheet):
    if existing.tag == "{" + main + "}hyperlinks":
        sheet.remove(existing)
for i, source in enumerate(model["sources"], 7):
    rid = "rIdAP23Source" + str(i)
    assert source["url"].startswith("https://")
    E.SubElement(links, "{" + main + "}hyperlink", {"ref": "I" + str(i), "{" + rel + "}id": rid})
    E.SubElement(rels, "{" + pkg + "}Relationship", {
        "Id": rid, "Type": rel + "/hyperlink", "Target": source["url"], "TargetMode": "External"
    })
following = {"printOptions", "pageMargins", "pageSetup", "headerFooter", "rowBreaks", "colBreaks", "customProperties", "cellWatches", "ignoredErrors", "smartTags", "drawing", "legacyDrawing", "legacyDrawingHF", "picture", "oleObjects", "controls", "webPublishItems", "tableParts", "extLst"}
idx = next((i for i, child in enumerate(sheet) if child.tag.rsplit("}", 1)[-1] in following), len(sheet))
sheet.insert(idx, links)
assert original_cells == [E.tostring(c) for c in sheet.findall(".//{" + main + "}c")]
parts[sheet_path] = E.tostring(sheet, encoding="utf-8", xml_declaration=True)
parts[rels_path] = E.tostring(rels, encoding="utf-8", xml_declaration=True)
buf = io.BytesIO()
with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as archive:
    for name, data in parts.items():
        archive.writestr(name, data)
with open(target, "wb") as result:
    result.write(buf.getvalue())
tables = [E.fromstring(data) for name, data in parts.items() if name.startswith("xl/tables/table") and name.endswith(".xml")]
assert len(tables) == 4
assert all(t.find("{" + main + "}autoFilter") is not None for t in tables)
for n in range(1, 5):
    tree = E.fromstring(parts[f"xl/worksheets/sheet{n}.xml"])
    panes = tree.findall(".//{" + main + "}pane")
    assert len(panes) == 1 and panes[0].get("xSplit") == "2" and panes[0].get("ySplit") == "6"
    assert all(float(row.get("ht", "15")) <= 409.5 for row in tree.findall(".//{" + main + "}row"))
assert all(b"/Users/" not in data for data in parts.values())
print(json.dumps({"source_links": len(model["sources"]), "tables": len(tables), "filter_and_freeze_panes": "verified", "cell_values_changed": False, "sha256": hashlib.sha256(buf.getvalue()).hexdigest()}))
