"""Preserve V0.4 native Excel features while applying Artifact-authored AP18B data.

Only declared changed cells, appended table rows, range extensions and source
hyperlinks are touched. No legal calculations or release activation occur here.
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
QA = ROOT / ('.work/ap18b-02-ti-gr' if '--ti-gr-package' in sys.argv else '.work/ap18b-01-ag')
CHECKS = json.loads((QA / 'checks.json').read_text())
SOURCE = Path(CHECKS['source'])
FINAL = Path(CHECKS['file'])
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
P = 'http://schemas.openxmlformats.org/package/2006/relationships'
NS = {'s': N}
T = '{' + N + '}'

def read(file):
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        return {name: z.read(name) for name in z.namelist()}

def xml(node):
    ET.register_namespace('', node.tag.split('}')[0].lstrip('{'))
    return ET.tostring(node, encoding='utf-8', xml_declaration=True)

def pool(parts):
    return [''.join(e.itertext()) for e in ET.fromstring(parts['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in parts else []

def indices(cell):
    letters, row = re.fullmatch(r'([A-Z]+)(\d+)', cell).groups()
    col = 0
    for c in letters:
        col = col * 26 + ord(c) - 64
    return col, int(row)

def letters(col):
    text = ''
    while col:
        col, remainder = divmod(col - 1, 26)
        text = chr(65 + remainder) + text
    return text

def addresses(ref):
    ends = ref.split(':')
    left, top = indices(ends[0])
    right, bottom = indices(ends[-1])
    return [f'{letters(c)}{r}' for r in range(top, bottom + 1) for c in range(left, right + 1)]

def sheet_map(parts):
    rels = {e.get('Id'): e.get('Target').lstrip('/') for e in ET.fromstring(parts['xl/_rels/workbook.xml.rels'])}
    return {e.get('name'): (rels[e.get('{'+R+'}id')] if rels[e.get('{'+R+'}id')].startswith('xl/') else 'xl/' + rels[e.get('{'+R+'}id')]) for e in ET.fromstring(parts['xl/workbook.xml']).find('s:sheets', NS)}

def canonical(cell, strings):
    out = deepcopy(cell)
    if out.get('t') == 's':
        value = strings[int(out.find('s:v', NS).text)]
        for child in list(out):
            out.remove(child)
        out.set('t', 'inlineStr')
        ET.SubElement(ET.SubElement(out, T+'is'), T+'t').text = value
    return out

before = read(SOURCE)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == CHECKS.get('sourceSha256', '11f47723d4bd9961e177bf0401c015899f41d847e56a32141d72bf82876cd597')
parts = dict(before)
authored = read(QA / 'artifact-export.xlsx')
src_pool, out_pool = pool(before), pool(authored)
src_sheets, out_sheets = sheet_map(before), sheet_map(authored)
specs = {s['name']: s for s in CHECKS['specs']}
targets = {}
for patch in CHECKS['patches']:
    targets.setdefault(patch['name'], set()).update(addresses(patch['range']))

def extend(ref, old, new):
    # Only the lower boundary changes. Upper header/body anchors stay in place.
    return re.sub(r'(:\$?[A-Z]+\$?)' + str(old) + r'(?=$|\s)', lambda m: m[1] + str(new), ref)

for name, changed in targets.items():
    key = src_sheets[name]
    sheet = ET.fromstring(before[key])
    source_data = sheet.find('s:sheetData', NS)
    old_cells = {c.get('r'): c for c in sheet.findall('s:sheetData/s:row/s:c', NS)}
    rows = {int(r.get('r')): r for r in source_data}
    authored_sheet = ET.fromstring(authored[out_sheets[name]])
    author_cells = {c.get('r'): c for c in authored_sheet.findall('s:sheetData/s:row/s:c', NS)}
    author_rows = {int(r.get('r')): r for r in authored_sheet.find('s:sheetData', NS)}
    spec = specs.get(name)
    for address in sorted(changed, key=lambda a: (indices(a)[1], indices(a)[0])):
        column, row_number = indices(address)
        existing = old_cells.get(address)
        is_new_data = spec and spec['oldEnd'] < row_number <= spec['end'] and column <= indices(spec['last']+'1')[0]
        cell = canonical(author_cells.get(address, ET.Element(T+'c', {'r': address})), out_pool)
        if is_new_data:
            template_row = spec['oldEnd'] if row_number % 2 == spec['oldEnd'] % 2 else spec['oldEnd'] - 1
            template = old_cells.get(f'{letters(column)}{template_row}')
        else:
            template = existing
            if name == 'Gebietszuordnungen' and column == 1 and CHECKS['notesStart'] <= row_number <= CHECKS['notesStart'] + 4:
                template = old_cells.get(f'A{CHECKS.get("sourceNotesStart", 15) + row_number - CHECKS["notesStart"]}')
        if template is not None and 's' in template.attrib:
            cell.set('s', template.get('s'))
        else:
            cell.attrib.pop('s', None)
        row = rows.get(row_number)
        if row is None:
            row = ET.Element(T+'row', dict(author_rows.get(row_number, ET.Element(T+'row', {'r': str(row_number)})).attrib))
            # Source styles govern all cells, not imported row/column style IDs.
            row.attrib.pop('s', None)
            rows[row_number] = row
        if existing is not None and existing in list(row):
            row.remove(existing)
        row.append(cell)
    for row in rows.values():
        row[:] = sorted(row, key=lambda c: indices(c.get('r'))[0])
        rn = int(row.get('r'))
        if spec and spec['oldEnd'] < rn <= spec['end'] and rn in author_rows:
            for attr in ['ht', 'customHeight']:
                if attr in author_rows[rn].attrib:
                    row.set(attr, author_rows[rn].get(attr))
    source_data[:] = [rows[r] for r in sorted(rows)]
    if spec:
        for item in sheet.findall('s:dataValidations/s:dataValidation', NS) + sheet.findall('s:conditionalFormatting', NS):
            item.set('sqref', extend(item.get('sqref'), spec['oldEnd'], spec['end']))
    max_row = max(rows)
    max_col = max(indices(c.get('r'))[0] for row in rows.values() for c in row)
    dimension = sheet.find('s:dimension', NS)
    if dimension is not None:
        dimension.set('ref', f'A1:{letters(max_col)}{max_row}')
    parts[key] = xml(sheet)

# Resize native tables without changing their names, IDs, filters or style.
for key, value in list(parts.items()):
    if key.startswith('xl/tables/') and key.endswith('.xml'):
        table = ET.fromstring(value)
        spec = next((s for s in specs.values() if s['tableName'] == table.get('name')), None)
        if spec:
            table.set('ref', f'A6:{spec["last"]}{spec["end"]}')
            table.find('s:autoFilter', NS).set('ref', table.get('ref'))
            parts[key] = xml(table)

# Existing five link IDs survive. New source links use explicit HTTPS targets.
source_key = src_sheets['Rechtsquellen']
source_sheet = ET.fromstring(parts[source_key])
links = source_sheet.find('s:hyperlinks', NS)
rel_key = source_key.replace('/worksheets/', '/worksheets/_rels/') + '.rels'
rels = ET.fromstring(parts[rel_key])
for i, url in enumerate(CHECKS['sourceUrls'], 7):
    assert url.startswith('https://')
    address = f'E{i}'
    link = next((l for l in links if l.get('ref') == address), None)
    if link is None:
        rid = f'ap18bSource{i}'
        link = ET.SubElement(links, T+'hyperlink', {'ref': address, '{'+R+'}id': rid})
        ET.SubElement(rels, '{'+P+'}Relationship', {'Id': rid, 'Type': R+'/hyperlink', 'Target': url, 'TargetMode': 'External'})
    else:
        next(r for r in rels if r.get('Id') == link.get('{'+R+'}id')).set('Target', url)
parts[source_key], parts[rel_key] = xml(source_sheet), xml(rels)

# Verify every cell outside the declared patch is byte-semantically preserved.
unchanged = 0
for name, key in src_sheets.items():
    old = ET.fromstring(before[key])
    new = ET.fromstring(parts[key])
    cells = {c.get('r'): c for c in new.findall('s:sheetData/s:row/s:c', NS)}
    for cell in old.findall('s:sheetData/s:row/s:c', NS):
        address = cell.get('r')
        if address in targets.get(name, set()):
            continue
        assert ET.tostring(canonical(cell, src_pool)) == ET.tostring(canonical(cells[address], src_pool)), (name, address)
        unchanged += 1
    assert not new.findall('.//s:c[@t="e"]', NS), name
assert parts['xl/styles.xml'] == before['xl/styles.xml']
assert not any('vbaProject' in p or p == 'xl/connections.xml' for p in parts)
FINAL.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(FINAL, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, data in parts.items():
        z.writestr(name, data)
assert read(FINAL).keys() == parts.keys()
audit = {'sha256': hashlib.sha256(FINAL.read_bytes()).hexdigest(), 'sourceUnchanged': True,
         'unchangedCellsOutsideDeclaredEdits': unchanged, 'stylePartIdentical': True,
         'sheets': len(src_sheets), 'tables': len(specs) + 1,
         'rules': CHECKS.get('rules', 90), 'calendarRows': CHECKS.get('calendarRows', 99), 'sourceHyperlinks': len(CHECKS['sourceUrls'])}
(QA/'native-audit.json').write_text(json.dumps(audit, indent=2)+'\n')
print(json.dumps(audit))
