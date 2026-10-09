"""Narrow native-column relocation, then lossless cache/content reconciliation.

The bundled workbook API has no documented structural column-move operation.
Authoring and calculation remain in build-ap18a-workbook.mjs. This adapter keeps
Excel table/protection/validation metadata and styles from the delivered file.
"""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs/ap18a-2026-09-13'
QA = ROOT / '.work/ap18a/qa-v03'
SOURCE = OUT / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.2.xlsx'
FINAL = OUT / '2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.3.xlsx'
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
NS = {'s': N}
ET.register_namespace('', N)
ORDER = {
    'Gemeinwesen': 'A B C H I D E F G'.split(),
    'Feiertagsregeln': 'A B C D E Y Z F G H I J K L M N O P Q R S T U V W X'.split(),
    'Feiertagskalender': 'A B C D E F M N G H I J K L'.split(),
    'Geltungsbereiche': 'A B C NEW K L D E F G H I J'.split(),
}

def letter(n):
    result = ''
    while n:
        n, r = divmod(n - 1, 26)
        result = chr(65 + r) + result
    return result

def number(c):
    result = 0
    for ch in c:
        result = result * 26 + ord(ch) - 64
    return result

MAP = {s: {old: letter(i+1) for i, old in enumerate(cols) if old != 'NEW'} for s, cols in ORDER.items()}

def address(ref, sheet):
    m = re.fullmatch(r'(\$?)([A-Z]+)(\$?\d+)', ref)
    assert m, ref
    return m[1] + MAP.get(sheet, {}).get(m[2], m[2]) + m[3]

REF = re.compile(r"(?<![A-Za-z0-9_])(?:(?P<sheet>'(?:[^']|'')+'|[A-Za-z_\u0080-\uffff][\w]*)!)?(?P<a>\$?[A-Z]{1,3}\$?\d+)(?::(?P<b>\$?[A-Z]{1,3}\$?\d+))?(?![A-Za-z0-9_])")

def formula(value, current):
    def replace(m):
        sheet = m['sheet'].strip("'").replace("''", "'") if m['sheet'] else current
        prefix = m['sheet'] + '!' if m['sheet'] else ''
        return prefix + address(m['a'], sheet) + (':' + address(m['b'], sheet) if m['b'] else '')
    # Quoted Excel string literals are data, never cell references.
    chunks = re.split(r'("(?:[^"]|"")*")', value or '')
    return ''.join(chunk if i % 2 else REF.sub(replace, chunk) for i, chunk in enumerate(chunks))

def refs(value, sheet):
    """Relocate native ranges, splitting only if a moved range is discontinuous."""
    results = []
    for item in value.split():
        ends = item.split(':')
        if len(ends) == 1:
            results.append(address(item, sheet))
            continue
        a = re.fullmatch(r'([A-Z]+)(\d+)', ends[0])
        b = re.fullmatch(r'([A-Z]+)(\d+)', ends[1])
        cols = sorted(number(MAP.get(sheet, {}).get(letter(c), letter(c))) for c in range(number(a[1]), number(b[1])+1))
        groups = [[cols[0]]]
        for c in cols[1:]:
            if c == groups[-1][-1]+1:
                groups[-1].append(c)
            else:
                groups.append([c])
        for group in groups:
            results.append(f'{letter(group[0])}{a[2]}:{letter(group[-1])}{b[2]}')
    return ' '.join(results)

def read(file):
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        return {n: z.read(n) for n in z.namelist()}

def write(file, parts):
    with zipfile.ZipFile(file, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, data in parts.items():
            z.writestr(name, data)

def xml(e):
    return ET.tostring(e, encoding='utf-8', xml_declaration=True)

def inline(cell, value):
    for child in list(cell):
        cell.remove(child)
    cell.set('t', 'inlineStr')
    ET.SubElement(ET.SubElement(cell, f'{{{N}}}is'), f'{{{N}}}t').text = value

def prepare():
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == 'a06db692fd466d1b6e553ea0e2a255a145aa7bc569c526868746e02f177e964f'
    parts = read(SOURCE)
    workbook = ET.fromstring(parts['xl/workbook.xml'])
    names = [e.get('name') for e in workbook.find('s:sheets', NS)]
    for index, sheet in enumerate(names, 1):
        key = f'xl/worksheets/sheet{index}.xml'
        node = ET.fromstring(parts[key])
        for row in node.findall('s:sheetData/s:row', NS):
            cells = list(row)
            if sheet == 'Geltungsbereiche':
                original = next((c for c in cells if c.get('r') == f'K{row.get("r")}'), None)
                if original is not None:
                    extra = deepcopy(original)
                    extra.set('r', f'D{row.get("r")}')
                    inline(extra, 'Französisch' if row.get('r') == '6' else '')
                else:
                    extra = None
            for cell in cells:
                cell.set('r', address(cell.get('r'), sheet))
                f = cell.find('s:f', NS)
                if f is not None:
                    f.text = formula(f.text, sheet)
            if sheet == 'Geltungsbereiche' and extra is not None:
                cells.append(extra)
            row[:] = sorted(cells, key=lambda c: number(re.match('[A-Z]+', c.get('r'))[0]))
            if 'spans' in row.attrib:
                del row.attrib['spans']
        cols = node.find('s:cols', NS)
        if cols is not None and sheet in MAP:
            relocated = []
            for col in cols:
                for i in range(int(col.get('min')), int(col.get('max'))+1):
                    c = deepcopy(col)
                    dest = number(MAP[sheet].get(letter(i), letter(i)))
                    c.set('min', str(dest))
                    c.set('max', str(dest))
                    relocated.append(c)
                    if sheet == 'Geltungsbereiche' and i == 11:
                        extra = deepcopy(c)
                        extra.set('min', '4')
                        extra.set('max', '4')
                        relocated.append(extra)
            cols[:] = sorted(relocated, key=lambda c: int(c.get('min')))
        for parent in list(node.findall('s:conditionalFormatting', NS)):
            original = parent.get('sqref')
            parent.set('sqref', refs(original, sheet))
            for f in parent.findall('.//s:formula', NS):
                f.text = formula(f.text, sheet)
            if sheet == 'Geltungsbereiche' and original == 'K7:K11':
                extra = deepcopy(parent)
                extra.set('sqref', 'D7:D11')
                node.insert(list(node).index(parent), extra)
        for dv in node.findall('s:dataValidations/s:dataValidation', NS):
            dv.set('sqref', refs(dv.get('sqref'), sheet))
            for f in list(dv):
                f.text = formula(f.text, sheet)
        if sheet == 'Geltungsbereiche':
            dimension = node.find('s:dimension', NS)
            if dimension is not None:
                dimension.set('ref', 'A1:M32')
        parts[key] = xml(node)
    for key in list(parts):
        if not key.startswith('xl/tables/') or not key.endswith('.xml'):
            continue
        table = ET.fromstring(parts[key])
        sheet = table.get('name').removeprefix('AP18_')
        if sheet not in ORDER:
            continue
        columns = table.find('s:tableColumns', NS)
        old = list(columns)
        updated = []
        for col in ORDER[sheet]:
            if col == 'NEW':
                updated.append(ET.Element(f'{{{N}}}tableColumn', {'id': str(max(int(c.get('id')) for c in old)+1), 'name': 'Französisch'}))
            else:
                updated.append(old[number(col)-1])
        columns[:] = updated
        columns.set('count', str(len(updated)))
        if sheet == 'Geltungsbereiche':
            table.set('ref', 'A6:M11')
            table.find('s:autoFilter', NS).set('ref', 'A6:M11')
        assert not table.findall('.//s:filterColumn', NS) and table.find('s:sortState', NS) is None
        parts[key] = xml(table)
    QA.mkdir(parents=True, exist_ok=True)
    write(QA / 'relocated-native.xlsx', parts)
    print('Prepared native column relocation from unchanged V0.2.')

def reconcile():
    parts = read(QA / 'relocated-native.xlsx')
    authored = read(QA / 'artifact-export.xlsx')
    strings_node = ET.fromstring(authored['xl/sharedStrings.xml']) if 'xl/sharedStrings.xml' in authored else []
    strings = [''.join(e.itertext()) for e in strings_node]
    count = 0
    for index in range(1, 9):
        key = f'xl/worksheets/sheet{index}.xml'
        base = ET.fromstring(parts[key])
        calc = ET.fromstring(authored[key])
        cells = {c.get('r'): c for c in calc.findall('s:sheetData/s:row/s:c', NS)}
        for cell in base.findall('s:sheetData/s:row/s:c', NS):
            a = cells.get(cell.get('r'))
            assert a is not None, (index, cell.get('r'))
            af, bf = a.find('s:f', NS), cell.find('s:f', NS)
            assert (af.text if af is not None else None) == (bf.text if bf is not None else None), (index, cell.get('r'), 'formula changed unexpectedly')
            if af is not None:
                count += 1
            for child in list(cell):
                cell.remove(child)
            cell.attrib.pop('t', None)
            if a.get('t') == 's':
                inline(cell, strings[int(a.find('s:v', NS).text)])
            else:
                if a.get('t'):
                    cell.set('t', a.get('t'))
                for child in a:
                    cell.append(deepcopy(child))
            assert cell.get('t') != 'e'
        parts[key] = xml(base)
    assert count == 210, count
    write(FINAL, parts)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == 'a06db692fd466d1b6e553ea0e2a255a145aa7bc569c526868746e02f177e964f'
    audit = {'file': str(FINAL), 'formulas': count, 'sourceUnchanged': True, 'sha256': hashlib.sha256(FINAL.read_bytes()).hexdigest()}
    (QA / 'native-audit.json').write_text(json.dumps(audit, indent=2)+'\n')
    print(json.dumps(audit))

if __name__ == '__main__':
    {'prepare': prepare, 'reconcile': reconcile}[sys.argv[1]]()
