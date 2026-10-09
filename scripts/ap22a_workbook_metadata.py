"""Narrow OOXML fallback for filter reset and native hyperlinks absent from Artifact API.

No cell values or formulas are authored here. Never edits the reviewed input.
"""
import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
ET.register_namespace('', MAIN)
ET.register_namespace('r', REL)
NS = {'s': MAIN}
mode, source, destination = sys.argv[1:4]
assert Path(source).resolve() != Path(destination).resolve()
with zipfile.ZipFile(source) as archive:
    parts = {name: archive.read(name) for name in archive.namelist()}

if mode == 'prepare':
    for name in list(parts):
        if not (name.startswith('xl/worksheets/sheet') or name.startswith('xl/tables/table')) or not name.endswith('.xml'):
            continue
        root = ET.fromstring(parts[name])
        for row in root.findall('s:sheetData/s:row', NS):
            row.attrib.pop('hidden', None)
        for filt in root.findall('s:autoFilter', NS):
            for child in list(filt):
                filt.remove(child)
        for pane in root.findall('s:sheetViews/s:sheetView/s:pane', NS):
            pane.set('topLeftCell', 'D7' if name.endswith('sheet2.xml') else pane.get('topLeftCell', 'A1'))
        parts[name] = ET.tostring(root, encoding='utf-8', xml_declaration=True)
elif mode == 'links':
    model = json.loads(Path(sys.argv[4]).read_text())
    sheet_name = 'xl/worksheets/sheet5.xml'
    rels_name = 'xl/worksheets/_rels/sheet5.xml.rels'
    sheet = ET.fromstring(parts[sheet_name])
    original_cells = [ET.tostring(c) for c in sheet.findall('.//s:c', NS)]
    rels = ET.fromstring(parts[rels_name]) if rels_name in parts else ET.Element('{' + PKG + '}Relationships')
    for old in sheet.findall('s:hyperlinks', NS):
        sheet.remove(old)
    for old in list(rels):
        if old.get('Type') == REL + '/hyperlink':
            rels.remove(old)
    links = ET.Element('{' + MAIN + '}hyperlinks')
    ids = {node.get('Id') for node in rels}
    for row, item in enumerate(model['sources'], 7):
        rid = 'rIdAP22CloseSource' + str(row)
        assert rid not in ids
        assert item['url'].startswith('https://') or (
            item['id'] in {'AP22CLOSE-PROC-STPO-LIMIT', 'AP22CLOSE-PROC-VD-BGG'}
            and item['url'].startswith('http://relevancy.bger.ch/')
            and 'historisch' in (item.get('review', '') + item.get('note', '')).lower()
        )
        ET.SubElement(links, '{' + MAIN + '}hyperlink', {'ref': f'E{row}', '{' + REL + '}id': rid})
        ET.SubElement(rels, '{' + PKG + '}Relationship', {'Id': rid, 'Type': REL + '/hyperlink', 'Target': item['url'], 'TargetMode': 'External'})
    followers = {'printOptions','pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','customProperties','cellWatches','ignoredErrors','smartTags','drawing','legacyDrawing','legacyDrawingHF','picture','oleObjects','controls','webPublishItems','tableParts','extLst'}
    index = next((i for i, node in enumerate(sheet) if node.tag.rsplit('}', 1)[-1] in followers), len(sheet))
    sheet.insert(index, links)
    assert original_cells == [ET.tostring(c) for c in sheet.findall('.//s:c', NS)]
    parts[sheet_name] = ET.tostring(sheet, encoding='utf-8', xml_declaration=True)
    parts[rels_name] = ET.tostring(rels, encoding='utf-8', xml_declaration=True)
else:
    raise ValueError(mode)

with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name, data in parts.items():
        archive.writestr(name, data)
