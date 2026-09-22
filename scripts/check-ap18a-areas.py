"""Independent read-only OOXML comparison of the delivered AP18A V0.4 extension."""
from pathlib import Path
import hashlib
import json
import posixpath
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / 'outputs/ap18a-2026-09-13'
SOURCE = DIRECTORY / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.3.xlsx'
FINAL = DIRECTORY / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.4.xlsx'
SOURCE_SHA = '7fc8663e35e5f579b951da75fdc57e364d6a3dff8758cbb9f564a0e2fed22bfc'
BJ_URL = 'https://www.bj.admin.ch/dam/de/sd-web/4Ad6GMn8rA0i/hinweise-kant-feiertage.pdf'
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'s': N}


def load(file):
    with zipfile.ZipFile(file) as archive:
        assert archive.testzip() is None
        raw = {name: archive.read(name) for name in archive.namelist()}
    xml = {key: ET.fromstring(value) for key, value in raw.items()
           if key.endswith(('.xml', '.rels'))}
    pool = [''.join(item.itertext()) for item in xml.get('xl/sharedStrings.xml', [])]
    return raw, xml, pool


def canonical(element):
    if element is None:
        return None
    return (element.tag, tuple(sorted(element.attrib.items())), element.text or '',
            tuple(canonical(child) for child in element))


def value(cell, pool):
    if cell.get('t') == 's':
        return pool[int(cell.find('s:v', NS).text)]
    if cell.get('t') == 'inlineStr':
        return ''.join(cell.find('s:is', NS).itertext())
    content = cell.find('s:v', NS)
    return content.text if content is not None else None


assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA
old_raw, old, old_pool = load(SOURCE)
new_raw, new, new_pool = load(FINAL)
old_sheets = list(old['xl/workbook.xml'].find('s:sheets', NS))
new_sheets = list(new['xl/workbook.xml'].find('s:sheets', NS))
assert len(old_sheets) == 8 and len(new_sheets) == 9
assert new_sheets[5].get('name') == 'Gebietszuordnungen'
assert [canonical(item) for item in old_sheets] == [
    canonical(item) for item in new_sheets if item.get('name') != 'Gebietszuordnungen']
assert [item.get('name') for item in new_sheets][4:7] == [
    'Geltungsbereiche', 'Gebietszuordnungen', 'Rechtsquellen']

changes = {1: {'A6', 'A30', 'A36'}, 6: {'H11'}}
unchanged_cells = 0
formula_count = 0
for index in range(1, 9):
    key = f'xl/worksheets/sheet{index}.xml'
    before, after = old[key], new[key]
    a = {cell.get('r'): cell for cell in before.findall('s:sheetData/s:row/s:c', NS)}
    b = {cell.get('r'): cell for cell in after.findall('s:sheetData/s:row/s:c', NS)}
    assert set(a) == set(b), (key, 'cell set')
    for address, cell in a.items():
        assert cell.get('s') == b[address].get('s'), (key, address, 'style')
        if address not in changes.get(index, set()):
            assert canonical(cell) == canonical(b[address]), (key, address)
            unchanged_cells += 1
        else:
            assert value(cell, old_pool) != value(b[address], new_pool), (key, address, 'expected change')
        if cell.find('s:f', NS) is not None:
            formula_count += 1
            assert canonical(cell) == canonical(b[address]), (key, address, 'formula and cached value')
    # Whole XML, including row formatting and native controls, differs only at four cells.
    for sheet in [before, after]:
        for row in sheet.findall('s:sheetData/s:row', NS):
            for cell in list(row):
                if cell.get('r') in changes.get(index, set()):
                    row.remove(cell)
    assert canonical(before) == canonical(after), (key, 'native worksheet metadata')
    if index not in changes:
        assert old_raw[key] == new_raw[key], (key, 'untouched bytes')
assert formula_count == 210
assert old_raw['xl/sharedStrings.xml'] == new_raw['xl/sharedStrings.xml']

# Appended styles must leave every existing font/fill/border/format/protection intact.
for group in ['fonts', 'fills', 'borders', 'cellStyleXfs', 'cellXfs', 'dxfs', 'numFmts', 'cellStyles']:
    before = old['xl/styles.xml'].find('s:' + group, NS)
    after = new['xl/styles.xml'].find('s:' + group, NS)
    if before is not None:
        assert after is not None and len(after) >= len(before), group
        assert [canonical(item) for item in before] == [canonical(item) for item in after[:len(before)]], group

old_tables = {key for key in old if key.startswith('xl/tables/')}
new_tables = {key for key in new if key.startswith('xl/tables/')}
assert len(old_tables) == 7 and len(new_tables) == 8
assert all(old_raw[key] == new_raw[key] for key in old_tables)
new_sheet = new['xl/worksheets/sheet9.xml']
cells = {cell.get('r'): cell for cell in new_sheet.findall('s:sheetData/s:row/s:c', NS)}
headers = ['Zuordnungs-ID', 'Geltungs-ID', 'Gebiet-ID', 'Deutsch', 'Französisch',
           'Italienisch', 'Rumantsch Grischun', 'Gebietstyp', 'Übergeordnetes Gebiet',
           'Einbezug', 'Kennungssystem', 'Amtliche Kennung', 'Gültig ab', 'Gültig bis',
           'Quellen-ID', 'Fundstelle', 'Fachstatus', 'Prüfhinweis']
assert [value(cells[f'{chr(65+i)}6'], new_pool) for i in range(18)] == headers
table = new['xl/tables/table8.xml']
assert table.get('name') == 'AP18_Gebietszuordnungen'
assert table.get('ref') == 'A6:R12' and table.find('s:autoFilter', NS).get('ref') == 'A6:R12'
assert [item.get('name') for item in table.find('s:tableColumns', NS)] == headers
expected = [
    ('CH-ALL', 'GEO-CH', 'include'), ('BE-ALL', 'GEO-BE', 'include'),
    ('AG-ARG-BADEN', 'GEO-AG-BADEN', 'include'),
    ('AG-ARG-BADEN', 'GEO-AG-BERGDIETIKON', 'exclude'),
    ('AG-ARG-BERGDIETIKON', 'GEO-AG-BERGDIETIKON', 'include'),
    ('AG-ZPO-ALL', 'GEO-AG', 'include')]
xfs = new['xl/styles.xml'].find('s:cellXfs', NS)
unlocked = []
for address, cell in cells.items():
    xf = xfs[int(cell.get('s', '0'))]
    lock = xf.find('s:protection', NS)
    if lock is not None and lock.get('locked') == '0':
        unlocked.append(address)
assert set(unlocked) == {f'{chr(65+col)}{row}' for col in range(18) for row in range(7, 13)}
assert len(unlocked) == 108
for index, row in enumerate(range(7, 13)):
    assert value(cells[f'A{row}'], new_pool) == f'AREA-AP18A-{index+1:02}'
    assert tuple(value(cells[f'{col}{row}'], new_pool) for col in ['B', 'C', 'J']) == expected[index]
    assert value(cells[f'Q{row}'], new_pool) == 'open'
    assert all(value(cells[f'{col}{row}'], new_pool) in ['', None] for col in ['F', 'G', 'K', 'L'])
assert new_sheet.find('s:sheetProtection', NS).get('sheet') == '1'
assert new_sheet.find('s:sheetProtection', NS).get('autoFilter') == '0'
assert new_sheet.find('s:sheetViews/s:sheetView/s:pane', NS).attrib == {
    'xSplit': '1', 'ySplit': '6', 'topLeftCell': 'B7', 'activePane': 'bottomRight', 'state': 'frozen'}
validations = {item.get('sqref'): item for item in new_sheet.find('s:dataValidations', NS)}
assert set(validations) == {'H7:H12', 'J7:J12', 'Q7:Q12'}
for cell_range, words in [('H7:H12', ['Bund', 'Kanton', 'Bezirk', 'Gemeinde', 'Ortsteil', 'Gebietsgruppe']),
                          ('J7:J12', ['include', 'exclude']), ('Q7:Q12', ['open', 'blocked'])]:
    rule = validations[cell_range]
    assert rule.get('type') == 'list'
    assert rule.find('s:formula1', NS).text == '"' + ','.join(words) + '"'
assert {rule.get('sqref') for rule in new_sheet.findall('s:conditionalFormatting', NS)} == {
    'E7:E12', 'F7:F12', 'G7:G12', 'K7:K12', 'L7:L12', 'Q7:Q12'}
assert len(new_sheet.findall('s:conditionalFormatting/s:cfRule', NS)) == 7

# One changed native hyperlink, all other source links preserved.
source_key = 'xl/worksheets/_rels/sheet6.xml.rels'
old_rels = {entry.get('Id'): entry for entry in old[source_key]}
new_rels = {entry.get('Id'): entry for entry in new[source_key]}
assert set(old_rels) == set(new_rels)
changed_links = []
for key, entry in old_rels.items():
    if canonical(entry) != canonical(new_rels[key]):
        changed_links.append(key)
        assert new_rels[key].get('Target') == BJ_URL
        assert {k: v for k, v in entry.attrib.items() if k != 'Target'} == {
            k: v for k, v in new_rels[key].attrib.items() if k != 'Target'}
assert len(changed_links) == 1
links = new['xl/worksheets/sheet6.xml'].find('s:hyperlinks', NS)
assert len(links) == 5
assert next(link for link in links if link.get('ref') == 'E11').get('{' + R + '}id') == changed_links[0]
assert value(next(c for c in ET.fromstring(new_raw['xl/worksheets/sheet6.xml']).findall('s:sheetData/s:row/s:c', NS)
                  if c.get('r') == 'E11'), new_pool) == 'Amtliche Quelle öffnen'

# Every internal package relationship resolves, including the added sheet and table.
for key, root in new.items():
    if not key.endswith('.rels'):
        continue
    parent = posixpath.dirname(posixpath.dirname(key))
    for rel in root:
        if rel.get('TargetMode') != 'External':
            target = rel.get('Target')
            resolved = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(parent, target))
            assert resolved in new_raw, (key, resolved)
for key, root in new.items():
    assert not root.findall('.//s:c[@t="e"]', NS), (key, 'error cells')
assert not any('vbaProject' in key or 'externalLinks/' in key or key.endswith('connections.xml') for key in new_raw)
print(json.dumps({'sourceSha256Unchanged': SOURCE_SHA, 'sha256': hashlib.sha256(FINAL.read_bytes()).hexdigest(),
                  'preservedExistingCells': unchanged_cells, 'changedExistingCells': 4,
                  'preservedFormulaAndCacheCells': formula_count, 'sheets': 9, 'tables': 8,
                  'assignments': 6, 'newEditableInputs': len(unlocked),
                  'nativeControlsPreserved': True, 'packageRelationshipsResolve': True}))
