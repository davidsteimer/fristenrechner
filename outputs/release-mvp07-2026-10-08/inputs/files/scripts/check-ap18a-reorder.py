"""Read-only, independently mapped V0.2 -> V0.3 preservation audit.

Only ZIP/XML reads and openpyxl's formula tokenizer are used. The delivered
workbooks are never loaded for saving or modified by this verification script.
"""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

from openpyxl.formula.tokenizer import Tokenizer

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs/ap18a-2026-09-13'
OLD = OUT / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.2.xlsx'
NEW = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.3.xlsx'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
TAG = '{' + NS['s'] + '}'
OLD_SHA = 'a06db692fd466d1b6e553ea0e2a255a145aa7bc569c526868746e02f177e964f'


def colno(text):
    total = 0
    for char in text:
        total = total * 26 + ord(char) - 64
    return total


def letter(number):
    result = ''
    while number:
        number, digit = divmod(number - 1, 26)
        result = chr(65 + digit) + result
    return result


def mapped_col(sheet, column):
    """Explicit independent old-position mappings, not implementation imports."""
    n = colno(column)
    if sheet == 'Gemeinwesen':
        n = n + 2 if 4 <= n <= 7 else n - 4 if n in (8, 9) else n
    elif sheet == 'Feiertagsregeln':
        n = n + 2 if 6 <= n <= 24 else n - 19 if n in (25, 26) else n
    elif sheet == 'Feiertagskalender':
        n = n + 2 if 7 <= n <= 12 else n - 6 if n in (13, 14) else n
    elif sheet == 'Geltungsbereiche':
        n = n + 3 if 4 <= n <= 10 else n - 6 if n in (11, 12) else n
    return letter(n)


def mapped_address(sheet, address):
    match = re.fullmatch(r'(\$?)([A-Z]+)(\$?)([1-9][0-9]*)', address)
    assert match, ('unexpected address', address)
    dollar_col, column, dollar_row, row = match.groups()
    return dollar_col + mapped_col(sheet, column) + dollar_row + row


def mapped_range(sheet, value):
    return ' '.join(':'.join(mapped_address(sheet, part) for part in item.split(':')) for item in value.split())


def mapped_formula(sheet, expression):
    """Tokenize Excel syntax so quoted strings can never become references."""
    tokens = Tokenizer('=' + expression).items
    result = []
    for token in tokens:
        value = token.value
        if token.type == 'OPERAND' and token.subtype == 'RANGE':
            prefix, separator, reference = value.rpartition('!')
            target_sheet = prefix[1:-1].replace("''", "'") if prefix.startswith("'") else prefix
            target_sheet = target_sheet if separator else sheet
            reference = reference if separator else value
            value = (prefix + separator if separator else '') + mapped_range(target_sheet, reference)
        result.append(value)
    return ''.join(result)


def canonical(node):
    if node is None:
        return None
    return (node.tag, tuple(sorted(node.attrib.items())), node.text or '', tuple(canonical(child) for child in node))


def load(file):
    with zipfile.ZipFile(file) as archive:
        assert archive.testzip() is None
        raw = {name: archive.read(name) for name in archive.namelist()}
    xml = {name: ET.fromstring(data) for name, data in raw.items() if name.endswith('.xml') or name.endswith('.rels')}
    strings = [''.join(node.itertext()) for node in xml.get('xl/sharedStrings.xml', [])]

    def scalar(cell):
        assert cell.get('t') != 'e', ('Excel error', cell.get('r'))
        value = cell.find('s:v', NS)
        if cell.get('t') == 's':
            return strings[int(value.text)]
        if cell.get('t') == 'inlineStr':
            return ''.join(cell.find('s:is', NS).itertext())
        if value is None or value.text is None:
            return ''
        if cell.get('t') in ('str', 'b'):
            return value.text
        return float(value.text)

    return raw, xml, scalar


assert hashlib.sha256(OLD.read_bytes()).hexdigest() == OLD_SHA
old_raw, old, old_scalar = load(OLD)
new_raw, new, new_scalar = load(NEW)
assert set(old_raw) == set(new_raw), 'Unexpected package-part addition or loss'
names = [e.get('name') for e in old['xl/workbook.xml'].find('s:sheets', NS)]
assert names == [e.get('name') for e in new['xl/workbook.xml'].find('s:sheets', NS)]
assert len(names) == 8
assert old_raw['xl/styles.xml'] == new_raw['xl/styles.xml'], 'Style and protection definitions changed'
assert old_raw['xl/workbook.xml'] == new_raw['xl/workbook.xml'], 'Workbook settings changed'
allowed_changed_parts = {f'xl/worksheets/sheet{i}.xml' for i in range(1, 9)} | {name for name in old_raw if name.startswith('xl/tables/')}
for part in set(old_raw) - allowed_changed_parts:
    assert old_raw[part] == new_raw[part], ('Unexpected package change', part)
assert not any('vbaProject' in name or 'externalLinks/' in name or name.endswith('connections.xml') for name in new_raw)
cell_count = formula_count = value_count = width_count = 0
sheet_cells = {}
for index, name in enumerate(names, 1):
    key = f'xl/worksheets/sheet{index}.xml'
    source, target = old[key], new[key]
    before = {cell.get('r'): cell for cell in source.findall('s:sheetData/s:row/s:c', NS)}
    after = {cell.get('r'): cell for cell in target.findall('s:sheetData/s:row/s:c', NS)}
    sheet_cells[name] = after
    expected_addresses = set()
    for address, cell in before.items():
        dest = mapped_address(name, address)
        expected_addresses.add(dest)
        assert dest in after, (name, address, dest, 'Missing cell')
        other = after[dest]
        assert cell.get('s', '0') == other.get('s', '0'), (name, address, dest, 'Style/protection')
        formula_before, formula_after = cell.find('s:f', NS), other.find('s:f', NS)
        if formula_before is not None:
            assert formula_after is not None
            assert mapped_formula(name, formula_before.text) == formula_after.text, (name, address, dest, 'Formula reference')
            assert old_scalar(cell) == new_scalar(other), (name, address, dest, 'Cached formula result')
            formula_count += 1
        else:
            assert formula_after is None
            if not (name == 'Übersicht' and address in ('A6', 'A36')):
                assert old_scalar(cell) == new_scalar(other), (name, address, dest, 'Value')
                value_count += 1
        cell_count += 1
    for address in set(after) - expected_addresses:
        assert name == 'Geltungsbereiche' and re.fullmatch(r'D[1-9][0-9]*', address), (name, address, 'Unexpected cell')
        assert new_scalar(after[address]) == ('Französisch' if address == 'D6' else '')
        counterpart = after.get(address.replace('D', 'E', 1))
        assert counterpart is not None and counterpart.get('s', '0') == after[address].get('s', '0')
    for feature in ['sheetProtection', 'sheetViews', 'sheetFormatPr', 'printOptions', 'pageMargins', 'pageSetup', 'headerFooter', 'hyperlinks', 'tableParts']:
        assert canonical(source.find('s:' + feature, NS)) == canonical(target.find('s:' + feature, NS)), (name, feature)
    before_rows = {r.get('r'): {k: v for k, v in r.attrib.items() if k != 'spans'} for r in source.findall('s:sheetData/s:row', NS)}
    after_rows = {r.get('r'): {k: v for k, v in r.attrib.items() if k != 'spans'} for r in target.findall('s:sheetData/s:row', NS)}
    assert before_rows == after_rows, (name, 'Row metadata')

    def widths(sheet):
        result = {}
        for node in sheet.findall('s:cols/s:col', NS):
            for number in range(int(node.get('min')), int(node.get('max')) + 1):
                assert number not in result, (name, 'Overlapping column metadata', number)
                result[number] = {k: v for k, v in node.attrib.items() if k not in ('min', 'max')}
        return result

    before_widths, after_widths = widths(source), widths(target)
    expected_widths = {colno(mapped_col(name, letter(column))): value for column, value in before_widths.items()}
    if name == 'Geltungsbereiche':
        expected_widths[4] = before_widths[11]
    assert expected_widths == after_widths, (name, 'Column widths and metadata')
    width_count += len(expected_widths)
    old_validation = deepcopy(source.find('s:dataValidations', NS))
    if old_validation is not None:
        for node in old_validation:
            node.set('sqref', mapped_range(name, node.get('sqref')))
            for formula_node in node:
                formula_node.text = mapped_formula(name, formula_node.text)
    assert canonical(old_validation) == canonical(target.find('s:dataValidations', NS)), (name, 'Validations')
    expected_cfs = []
    for node in source.findall('s:conditionalFormatting', NS):
        node = deepcopy(node)
        before_ref = node.get('sqref')
        node.set('sqref', mapped_range(name, before_ref))
        for formula_node in node.findall('.//s:formula', NS):
            formula_node.text = mapped_formula(name, formula_node.text)
        expected_cfs.append(canonical(node))
        if name == 'Geltungsbereiche' and before_ref == 'K7:K11':
            node.set('sqref', 'D7:D11')
            expected_cfs.append(canonical(node))
    assert sorted(expected_cfs) == sorted(canonical(node) for node in target.findall('s:conditionalFormatting', NS)), (name, 'Conditional formatting')

assert formula_count == 210
styles = new['xl/styles.xml'].find('s:cellXfs', NS)
for row in range(7, 12):
    cell = sheet_cells['Geltungsbereiche'][f'D{row}']
    protection = styles[int(cell.get('s', '0'))].find('s:protection', NS)
    assert protection is not None and protection.get('locked') == '0', ('French input protected', row)

table_count = 0
for key in old:
    if not key.startswith('xl/tables/'):
        continue
    source, target = old[key], new[key]
    name = source.get('name').removeprefix('AP18_')
    expected = deepcopy(source)
    columns = expected.find('s:tableColumns', NS)
    ordered = sorted(enumerate(list(columns), 1), key=lambda item: colno(mapped_col(name, letter(item[0]))))
    columns[:] = [node for _, node in ordered]
    if name == 'Geltungsbereiche':
        columns.insert(3, ET.Element(TAG + 'tableColumn', {'id': '13', 'name': 'Französisch'}))
        columns.set('count', '13')
        expected.set('ref', 'A6:M11')
        expected.find('s:autoFilter', NS).set('ref', 'A6:M11')
    assert canonical(expected) == canonical(target), (name, 'Native table metadata')
    if name in sheet_cells:
        for column, node in enumerate(target.find('s:tableColumns', NS), 1):
            assert new_scalar(sheet_cells[name][f'{letter(column)}6']) == node.get('name'), (name, column, 'Table/header mismatch')
    table_count += 1
assert table_count == 7
assert len(new['xl/worksheets/sheet6.xml'].findall('s:hyperlinks/s:hyperlink', NS)) == 5
assert hashlib.sha256(OLD.read_bytes()).hexdigest() == OLD_SHA
print(json.dumps({'source': OLD.name, 'target': NEW.name, 'oldFileUnchanged': True,
                  'preservedCells': cell_count, 'preservedNonFormulaValues': value_count,
                  'semanticallyRelocatedFormulas': formula_count, 'cachedResultsPreserved': True,
                  'columnMetadataChecked': width_count, 'sheets': 8, 'tables': table_count,
                  'sourceHyperlinksPreserved': 5, 'stylesProtectionValidationsConditionalFormatsPanesPreserved': True,
                  'newFrenchScopeInputs': 5, 'sha256': hashlib.sha256(NEW.read_bytes()).hexdigest()}, ensure_ascii=False))
