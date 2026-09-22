"""AP18A mechanical OOXML completion and saved-file audit.

Artifact Tool authors all cells, formulas, tables and styling. Its documented API
does not expose worksheet protection in this runtime. This step adds only native
protection/freeze settings and native source hyperlinks, removes author metadata
and checks the saved package. Language mode extends native table metadata only.
No password or security claim. No external application connection.
"""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = '--languages' in sys.argv
VERSION = '0.2' if LANGUAGES else '0.1'
FILE = ROOT / f'outputs/ap18a-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V{VERSION}.xlsx'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
TAG = '{' + NS['s'] + '}'
with zipfile.ZipFile(FILE) as z:
    assert z.testzip() is None
    parts = {n: z.read(n) for n in z.namelist()}
assert not any('vbaProject' in n or 'externalLinks/' in n or n.endswith('connections.xml') for n in parts)
styles = ET.fromstring(parts['xl/styles.xml'])
xfs = styles.find('s:cellXfs', NS)
style_map = {}
known_styles = {ET.tostring(xf): i for i, xf in enumerate(xfs)}

def protected_style(old, locked):
    key = (old, locked)
    if key not in style_map:
        xf = deepcopy(xfs[old])
        for e in list(xf):
            if e.tag == TAG + 'protection':
                xf.remove(e)
        xf.set('applyProtection', '1')
        ET.SubElement(xf, TAG + 'protection', {'locked': '1' if locked else '0', 'hidden': '0'})
        xml = ET.tostring(xf)
        if xml not in known_styles:
            known_styles[xml] = len(xfs)
            xfs.append(xf)
        style_map[key] = known_styles[xml]
    return style_map[key]

sheet_names = [n.attrib['name'] for n in ET.fromstring(parts['xl/workbook.xml']).findall('s:sheets/s:sheet', NS)]
assert len(sheet_names) == 8
summary = []
for index, name in enumerate(sheet_names, 1):
    part = f'xl/worksheets/sheet{index}.xml'
    sheet = ET.fromstring(parts[part])
    formulas = 0
    unlocked = 0
    for cell in sheet.findall('.//s:sheetData/s:row/s:c', NS):
        address = cell.attrib['r']
        row = int(re.search(r'\d+', address).group())
        column = re.match(r'[A-Z]+', address).group()
        has_formula = cell.find('s:f', NS) is not None
        formulas += int(has_formula)
        # Output and immutable reference data are intentionally protected.
        editable = (name == 'Übersicht' and address == 'B4') or (
            name not in ['Übersicht', 'Feiertagskalender', 'Geltungsbereiche', 'Verfahrensbezug']
            and row >= 7 and column != 'A' and not has_formula)
        if name == 'Feiertagsregeln':
            editable = row >= 19 and row <= 21 and column in ['D', 'E', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
        if name == 'Rechtsquellen' and (row <= 8 or column in ['E', 'K']):
            editable = False
        if LANGUAGES and ((name == 'Feiertagsregeln' and 7 <= row <= 21 and column in ['Y', 'Z']) or
                          (name == 'Geltungsbereiche' and 7 <= row <= 11 and column in ['K', 'L'])):
            editable = True
        cell.set('s', str(protected_style(int(cell.attrib.get('s', '0')), not editable)))
        unlocked += int(editable)
        assert cell.attrib.get('t') != 'e', (name, address, ET.tostring(cell).decode())
    # sheetProtection must follow sheetData/sheetCalcPr and precede autoFilter/etc.
    for old in list(sheet):
        if old.tag == TAG + 'sheetProtection':
            sheet.remove(old)
    protection = ET.Element(TAG + 'sheetProtection', {'sheet': '1', 'objects': '1', 'scenarios': '1', 'autoFilter': '0', 'sort': '0', 'selectLockedCells': '0', 'selectUnlockedCells': '0'})
    after = max(i for i,e in enumerate(sheet) if e.tag in [TAG+'sheetData', TAG+'sheetCalcPr'])
    sheet.insert(after+1, protection)
    if name == 'Rechtsquellen':
        reltag = '{http://schemas.openxmlformats.org/package/2006/relationships}'
        document_rel = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
        relpart = f'xl/worksheets/_rels/sheet{index}.xml.rels'
        rels = ET.fromstring(parts[relpart]) if relpart in parts else ET.Element(reltag+'Relationships')
        model = json.loads((ROOT/'.work/ap18a/qa/model.json').read_text())
        # Exported relationship IDs are opaque, not necessarily rId<number>.
        # Remove only this finalizer's old links so a rerun stays idempotent.
        for old in list(sheet):
            if old.tag == TAG+'hyperlinks':
                sheet.remove(old)
        for old in list(rels):
            if old.attrib['Type'].endswith('/hyperlink'):
                rels.remove(old)
        used_ids = {e.attrib['Id'] for e in rels}
        links = ET.Element(TAG+'hyperlinks')
        for offset, source in enumerate(model['sources']):
            assert source[4].startswith('https://')
            rid = f'ap18Hyperlink{offset+1}'
            assert rid not in used_ids
            used_ids.add(rid)
            ET.SubElement(rels,reltag+'Relationship',{'Id':rid,'Type':document_rel[1:-1]+'/hyperlink','Target':source[4],'TargetMode':'External'})
            ET.SubElement(links,TAG+'hyperlink',{'ref':f'E{7+offset}',document_rel+'id':rid})
        before = next((i for i,e in enumerate(sheet) if e.tag in [TAG+'printOptions',TAG+'pageMargins',TAG+'pageSetup',TAG+'headerFooter',TAG+'drawing',TAG+'tableParts',TAG+'extLst']),len(sheet))
        sheet.insert(before,links)
        parts[relpart]=ET.tostring(rels,encoding='utf-8',xml_declaration=True)
    if name != 'Übersicht':
        pane = sheet.find('s:sheetViews/s:sheetView/s:pane', NS)
        assert pane is not None
        pane.attrib.update({'xSplit': '1', 'ySplit': '6', 'topLeftCell': 'B7', 'activePane': 'bottomRight', 'state': 'frozen'})
    parts[part] = ET.tostring(sheet, encoding='utf-8', xml_declaration=True)
    summary.append({'sheet': name, 'formulas': formulas, 'unlockedCells': unlocked, 'protected': True})
xfs.set('count', str(len(xfs)))
parts['xl/styles.xml'] = ET.tostring(styles, encoding='utf-8', xml_declaration=True)
if LANGUAGES:
    # Artifact's documented table API has no resize operation. Extend metadata
    # only, preserving native table identity, filter state, style and old columns.
    targets = {'AP18_Gemeinwesen': 'I33', 'AP18_Feiertagsregeln': 'Z21',
               'AP18_Geltungsbereiche': 'L11', 'AP18_Feiertagskalender': 'N22'}
    resized = []
    for part in parts:
        if not re.fullmatch(r'xl/tables/table\d+\.xml', part):
            continue
        table = ET.fromstring(parts[part])
        if table.attrib['name'] not in targets:
            continue
        end = targets[table.attrib['name']]
        table.set('ref', 'A6:'+end)
        table.find('s:autoFilter', NS).set('ref', 'A6:'+end)
        columns = table.find('s:tableColumns', NS)
        for label in ['Italienisch', 'Rumantsch Grischun']:
            if not any(c.attrib['name'] == label for c in columns):
                next_id = max(int(c.attrib['id']) for c in columns)+1
                ET.SubElement(columns, TAG+'tableColumn', {'id':str(next_id), 'name':label})
        columns.set('count', str(len(columns)))
        parts[part] = ET.tostring(table, encoding='utf-8', xml_declaration=True)
        resized.append(table.attrib['name'])
    assert set(resized) == set(targets)
if 'docProps/core.xml' in parts:
    core = ET.fromstring(parts['docProps/core.xml'])
    for e in list(core):
        if e.tag.rsplit('}',1)[-1] in ['creator', 'lastModifiedBy', 'description', 'keywords']:
            core.remove(e)
    parts['docProps/core.xml'] = ET.tostring(core, encoding='utf-8', xml_declaration=True)
temp = FILE.with_suffix('.xlsx.tmp')
with zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, content in parts.items():
        z.writestr(name, content)
temp.replace(FILE)
with zipfile.ZipFile(FILE) as z:
    assert z.testzip() is None
    tables = [n for n in z.namelist() if re.fullmatch(r'xl/tables/table\d+\.xml',n)]
    assert len(tables) == 7
    for n in tables:
        table = ET.fromstring(z.read(n))
        assert table.find('s:autoFilter',NS) is not None
    source_sheet = ET.fromstring(z.read('xl/worksheets/sheet6.xml'))
    assert len(source_sheet.findall('s:hyperlinks/s:hyperlink',NS)) == 5
    source_rels = ET.fromstring(z.read('xl/worksheets/_rels/sheet6.xml.rels'))
    source_links = [e for e in source_rels if e.attrib['Type'].endswith('/hyperlink')]
    assert len(source_links) == 5
    assert [e.attrib['Target'] for e in source_links] == [s[4] for s in model['sources']]
    for n in z.namelist():
        if n.endswith('.xml'):
            ET.fromstring(z.read(n))
            assert b'/Users/' not in z.read(n), n
            assert b'justice.be.ch' not in z.read(n), n
report = {'file': FILE.name, 'sha256': hashlib.sha256(FILE.read_bytes()).hexdigest(), 'sheets': summary,
          'tables': len(tables), 'sourceHyperlinks': len(source_links), 'macros': False, 'externalDataConnections': False,
          'formulaErrorCells': 0, 'metadataChecked': True, 'nativeExcelTest': 'V0.1 user-confirmed, V0.2 not repeated' if LANGUAGES else 'notPerformed'}
(ROOT/f'.work/ap18a/{"qa-v02" if LANGUAGES else "qa"}/saved-file-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
