"""Apply declared Artifact-authored label edits while preserving native Excel parts.

Default mode retains the AP18B-01 V0.5 to V0.6 workflow. The explicitly selected
TI/GR provisional-label mode starts from immutable V0.7 and may also transfer
eight string formula caches. Complete-language mode starts from immutable V0.10
and transfers only its 315 missing input labels, seven overview texts and 204
dependent string caches. Formula expressions, styles and all native objects
are always retained from the source file.
"""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
assert set(sys.argv[1:]).issubset({'--ti-gr-rg-provisional', '--complete-languages'}), 'Unknown adapter option'
assert len(sys.argv[1:]) <= 1, 'Select one label workflow'
PROVISIONAL = '--ti-gr-rg-provisional' in sys.argv[1:]
COMPLETE = '--complete-languages' in sys.argv[1:]
QA = ROOT / ('.work/ap18b-04-labels' if COMPLETE else '.work/ap18b-02-ti-gr-v08' if PROVISIONAL else '.work/ap18b-01-ag-v06')
CHECKS = json.loads((QA / 'checks.json').read_text())
V07_SHA = 'a66bfff038a284c99f50337e02609a25718473b7a3d810c8e4c69ee455473c40'
CACHE_CELLS = {'H107', 'H108', 'H110', 'H113', 'H114', 'H116', 'H117', 'H118'}
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'s': N}
ET.register_namespace('', N)

def read(file):
    with zipfile.ZipFile(file) as archive:
        assert archive.testzip() is None
        assert len(archive.namelist()) == len(set(archive.namelist()))
        return {name: archive.read(name) for name in archive.namelist()}

def sheets(parts):
    rels = {e.get('Id'): e.get('Target').lstrip('/') for e in ET.fromstring(parts['xl/_rels/workbook.xml.rels'])}
    return {e.get('name'): (target if target.startswith('xl/') else 'xl/' + target)
            for e in ET.fromstring(parts['xl/workbook.xml']).find('s:sheets', NS)
            for target in [rels[e.get('{'+R+'}id')]]}

source = Path(CHECKS['source'])
assert hashlib.sha256(source.read_bytes()).hexdigest() == CHECKS['sourceSha256']
if PROVISIONAL:
    assert CHECKS['sourceSha256'] == V07_SHA, 'Provisional mode must use the confirmed V0.7 baseline'
    assert source.name == '2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx'
if COMPLETE:
    assert CHECKS['sourceSha256'] == 'bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e'
    assert source.name == '2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx'
    assert Path(CHECKS['file']).name == '2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx'
    assert Path(CHECKS['file']).resolve().parent == source.resolve().parent
    assert len(CHECKS['labels']) == 315 and len(CHECKS['patches']) == 322
cache_patches = CHECKS.get('formulaCachePatches', [])
if COMPLETE:
    assert len(cache_patches) == len({(p['sheet'], p['cell']) for p in cache_patches}) == 204
    assert all(p['sheet'] == 'Feiertagskalender' and p['cell'][0] in ('G', 'H') for p in cache_patches)
elif PROVISIONAL:
    assert {(p['sheet'], p['cell']) for p in cache_patches} == {('Feiertagskalender', c) for c in CACHE_CELLS}
    assert len(cache_patches) == len(CACHE_CELLS), 'Duplicate formula-cache patch'
else:
    assert not cache_patches, 'Formula-cache changes require explicit provisional-label mode'
before = read(source)
authored = read(QA / 'artifact-export.xlsx')
source_sheets, authored_sheets = sheets(before), sheets(authored)
strings = [''.join(e.itertext()) for e in ET.fromstring(authored['xl/sharedStrings.xml'])] if 'xl/sharedStrings.xml' in authored else []
parts = dict(before)
changed = {}
patch_targets = set()
for patch in CHECKS['patches']:
    target = (patch['sheet'], patch['cell'])
    assert target not in patch_targets, ('Duplicate text patch', target)
    patch_targets.add(target)
    key = source_sheets[patch['sheet']]
    changed.setdefault(key, set()).add(patch['cell'])
    sheet = ET.fromstring(parts[key])
    authored_sheet = ET.fromstring(authored[authored_sheets[patch['sheet']]])
    selector = f"s:sheetData/s:row/s:c[@r='{patch['cell']}']"
    cell, incoming = sheet.find(selector, NS), authored_sheet.find(selector, NS)
    assert cell is not None and incoming is not None
    assert cell.find('s:f', NS) is None and incoming.find('s:f', NS) is None
    if incoming.get('t') == 's':
        value = strings[int(incoming.find('s:v', NS).text)]
    elif incoming.get('t') == 'str':
        value = incoming.find('s:v', NS).text
    else:
        value = ''.join(incoming.find('s:is', NS).itertext())
    assert value == patch['value']
    for child in list(cell):
        cell.remove(child)
    cell.set('t', 'inlineStr')
    ET.SubElement(ET.SubElement(cell, '{'+N+'}is'), '{'+N+'}t').text = value
    parts[key] = ET.tostring(sheet, encoding='utf-8', xml_declaration=True)

# Copy only the type and saved value from Artifact. The original formula subtree,
# its attributes and all source-cell styling remain untouched.
for patch in cache_patches:
    target = (patch['sheet'], patch['cell'])
    assert target not in patch_targets, ('Overlapping text/cache patch', target)
    patch_targets.add(target)
    key = source_sheets[patch['sheet']]
    changed.setdefault(key, set()).add(patch['cell'])
    sheet = ET.fromstring(parts[key])
    authored_sheet = ET.fromstring(authored[authored_sheets[patch['sheet']]])
    selector = f"s:sheetData/s:row/s:c[@r='{patch['cell']}']"
    cell, incoming = sheet.find(selector, NS), authored_sheet.find(selector, NS)
    assert cell is not None and incoming is not None
    formula, incoming_formula = cell.find('s:f', NS), incoming.find('s:f', NS)
    assert formula is not None and incoming_formula is not None
    assert (formula.text or '').lstrip('=') == (incoming_formula.text or '').lstrip('='), ('Authored formula changed', target)
    assert incoming.get('t') == 'str', ('Expected a native string formula cache', target)
    cache = incoming.find('s:v', NS)
    assert cache is not None and cache.text == patch['value'] and isinstance(patch['value'], str)
    original_formula = ET.tostring(formula)
    original_attributes = {k: v for k, v in cell.attrib.items() if k != 't'}
    original_other_children = [ET.tostring(c) for c in cell if c.tag != '{'+N+'}v']
    for child in list(cell):
        if child.tag == '{'+N+'}v':
            cell.remove(child)
    cell.set('t', incoming.get('t'))
    # OOXML stores the formula cache directly after the formula expression.
    cell.insert(list(cell).index(formula) + 1, deepcopy(cache))
    assert ET.tostring(cell.find('s:f', NS)) == original_formula
    assert {k: v for k, v in cell.attrib.items() if k != 't'} == original_attributes
    assert [ET.tostring(c) for c in cell if c.tag != '{'+N+'}v'] == original_other_children
    parts[key] = ET.tostring(sheet, encoding='utf-8', xml_declaration=True)

# Removing only declared cells must leave each sheet structurally identical.
untouched_cells = formula_count = 0
for key, content in before.items():
    if key not in changed:
        assert parts[key] == content, key
    elif key in changed:
        old, new = ET.fromstring(content), ET.fromstring(parts[key])
        for sheet in [old, new]:
            for row in sheet.findall('s:sheetData/s:row', NS):
                for cell in list(row):
                    if cell.get('r') in changed[key]:
                        row.remove(cell)
        assert ET.tostring(old) == ET.tostring(new), key
    if key in source_sheets.values():
        sheet = ET.fromstring(content)
        untouched_cells += sum(c.get('r') not in changed.get(key, set()) for c in sheet.findall('s:sheetData/s:row/s:c', NS))
        formula_count += len(sheet.findall('.//s:f', NS))

final = Path(CHECKS['file'])
assert final.resolve() != source.resolve(), 'Never overwrite the source workbook'
final.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(final, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name, value in parts.items():
        archive.writestr(name, value)
assert read(final) == parts
assert hashlib.sha256(source.read_bytes()).hexdigest() == CHECKS['sourceSha256'], 'Source changed during adapter run'
audit = {'file': str(final), 'sha256': hashlib.sha256(final.read_bytes()).hexdigest(),
         'changedTextCells': len(CHECKS['patches']), 'changedFormulaCacheCells': len(cache_patches),
         'unchangedCells': untouched_cells, 'unchangedFormulaExpressions': formula_count,
         'unchangedFormulasAndCaches': formula_count - len(cache_patches),
         'changedParts': sorted(changed), 'allOtherPartsByteIdentical': True, 'stylesAndRowHeightsUnchanged': True}
(QA / 'native-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(audit, ensure_ascii=False))
