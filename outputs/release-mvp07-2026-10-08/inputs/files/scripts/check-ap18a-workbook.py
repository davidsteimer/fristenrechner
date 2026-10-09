"""Read-only scope-preservation check for the AP18A language-field revision."""
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'outputs/ap18a-2026-09-13'
OLD = DIR / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.1.xlsx'
NEW = DIR / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.2.xlsx'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def canonical(e):
    if e is None:
        return None
    return (e.tag, tuple(sorted(e.attrib.items())), e.text or '', tuple(canonical(c) for c in e))

def load(file):
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        parts = {n: ET.fromstring(z.read(n)) for n in z.namelist() if n.endswith('.xml')}
    strings = [''.join(e.itertext()) for e in parts.get('xl/sharedStrings.xml', [])]
    styles = parts['xl/styles.xml']
    def cell_value(cell):
        if cell is None:
            return None
        assert cell.get('t') != 'e'
        f = cell.find('s:f', NS)
        v = cell.find('s:v', NS)
        if f is not None:
            return ('formula', f.text)
        if cell.get('t') == 's' and v is not None:
            return ('text', strings[int(v.text)])
        if cell.get('t') == 'inlineStr':
            return ('text', ''.join(cell.find('s:is', NS).itertext()))
        return ('value', v.text if v is not None else None)
    def cell_style(cell):
        xf = styles.find('s:cellXfs', NS)[int(cell.get('s', '0'))]
        fmt_id = xf.get('numFmtId', '0')
        fmts = styles.find('s:numFmts', NS)
        fmt = next((e.get('formatCode') for e in fmts if e.get('numFmtId') == fmt_id),fmt_id) if fmts is not None else fmt_id
        components = tuple(canonical(styles.find('s:'+group, NS)[int(xf.get(attr, '0'))]) for group,attr in [('fonts','fontId'),('fills','fillId'),('borders','borderId')])
        return (fmt, components, canonical(xf.find('s:alignment', NS)), canonical(xf.find('s:protection', NS)))
    return parts, cell_value, cell_style

assert hashlib.sha256(OLD.read_bytes()).hexdigest() == '3af259515c502ef563cc3097bce0c7e15147d5158ac9590f95c014bbebd81aa4'
old, old_value, old_style = load(OLD)
new, new_value, new_style = load(NEW)
assert [e.get('name') for e in old['xl/workbook.xml'].find('s:sheets', NS)] == [e.get('name') for e in new['xl/workbook.xml'].find('s:sheets', NS)]
compared = 0
for index in range(1,9):
    a = old[f'xl/worksheets/sheet{index}.xml']
    b = new[f'xl/worksheets/sheet{index}.xml']
    new_cells = {c.get('r'): c for c in b.findall('.//s:sheetData/s:row/s:c', NS)}
    for cell in a.findall('.//s:sheetData/s:row/s:c', NS):
        address = cell.get('r')
        # Existing blank reserved cells may now contain the requested additions.
        if cell.find('s:f',NS) is None and cell.find('s:v',NS) is None and cell.find('s:is',NS) is None:
            continue
        if index == 1 and address == 'A6':
            continue
        target = new_cells.get(address)
        assert old_value(cell) == new_value(target), (index,address,'value/formula')
        assert old_style(cell) == new_style(target), (index,address,'style')
        compared += 1
    for feature in ['dataValidations','sheetProtection']:
        assert canonical(a.find('s:'+feature,NS)) == canonical(b.find('s:'+feature,NS)), (index,feature)
    assert canonical(a.find('s:sheetViews/s:sheetView/s:pane',NS)) == canonical(b.find('s:sheetViews/s:sheetView/s:pane',NS)), (index,'pane')
    old_cfs = [canonical(e) for e in a.findall('s:conditionalFormatting',NS)]
    new_cfs = [canonical(e) for e in b.findall('s:conditionalFormatting',NS)]
    assert all(e in new_cfs for e in old_cfs), (index,'conditionalFormatting')

old_tables = {e.get('name'):e for n,e in old.items() if n.startswith('xl/tables/')}
new_tables = {e.get('name'):e for n,e in new.items() if n.startswith('xl/tables/')}
assert set(old_tables) == set(new_tables) and len(new_tables) == 7
for name,a in old_tables.items():
    b = new_tables[name]
    labels_a = [e.get('name') for e in a.find('s:tableColumns',NS)]
    labels_b = [e.get('name') for e in b.find('s:tableColumns',NS)]
    assert labels_b[:len(labels_a)] == labels_a
    assert canonical(a.find('s:tableStyleInfo',NS)) == canonical(b.find('s:tableStyleInfo',NS))
    if name in ['AP18_Gemeinwesen','AP18_Feiertagsregeln','AP18_Geltungsbereiche','AP18_Feiertagskalender']:
        assert labels_b[len(labels_a):] == ['Italienisch','Rumantsch Grischun']
    else:
        assert labels_a == labels_b
print(json.dumps({'preservedCells':compared,'sheets':8,'tables':7,'oldFileUnchanged':True,'stylesValidationsPanesPreserved':True,'sha256':hashlib.sha256(NEW.read_bytes()).hexdigest()}))
