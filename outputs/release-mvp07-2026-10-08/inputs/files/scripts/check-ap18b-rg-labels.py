"""Read-only V0.7/V0.8 native diff for eight provisional TI Romansh labels.

Reuses only the independent Book/XML read helpers, never the V0.7 strict-data
audit or the authoring adapter. The only write is independent-audit.json.
This checks faithful provisional labelling, not linguistic or legal approval.
"""
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import runpy
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / '.work/ap18b-02-ti-gr-v08'
SOURCE = ROOT / 'outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx'
SOURCE_SHA = 'a66bfff038a284c99f50337e02609a25718473b7a3d810c8e4c69ee455473c40'
REPORT = QA / 'independent-audit.json'
HELPERS = runpy.run_path(str(ROOT / 'scripts/check-ap18b-ti-gr-workbook.py'))
Book, canonical, require = (HELPERS[key] for key in ('Book', 'canonical', 'require'))
N, NS = HELPERS['N'], HELPERS['NS']
CACHE_TO_RULE = {'H107': 'TI-CAL-DAY-EPIPHANY', 'H108': 'TI-CAL-DAY-ST-JOSEPH',
                 'H110': 'TI-CAL-DAY-MAY1', 'H113': 'TI-CAL-DAY-CORPUS-CHRISTI',
                 'H114': 'TI-CAL-DAY-ST-PETER-PAUL', 'H116': 'TI-CAL-DAY-ASSUMPTION',
                 'H117': 'TI-CAL-DAY-ALL-SAINTS', 'H118': 'TI-CAL-DAY-IMMACULATE-CONCEPTION'}
ERROR_VALUES = {'#REF!', '#VALUE!', '#DIV/0!', '#NAME?', '#NUM!', '#NULL!', '#N/A', '#SPILL!', '#CALC!'}


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def without_changed_cells(sheet, addresses):
    copy = deepcopy(sheet)
    for row in copy.findall('s:sheetData/s:row', NS):
        for cell in list(row):
            if cell.get('r') in addresses:
                row.remove(cell)
    return canonical(copy)


def attributes_except_type(cell):
    return {k: v for k, v in cell.attrib.items() if k != 't'}


def main():
    checks = json.loads((QA / 'checks.json').read_text())
    final = Path(checks['file'])
    require(Path(checks['source']) == SOURCE and checks['sourceSha256'] == SOURCE_SHA,
            'unexpected source in receipt')
    require(final.name == '2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx'
            and final.resolve().is_relative_to((ROOT / 'outputs').resolve()), 'unexpected V0.8 output')
    require(sha(SOURCE) == SOURCE_SHA, 'immutable V0.7 changed')
    final_hash = sha(final)
    old, new = Book(SOURCE), Book(final)
    require(list(old.paths) == list(new.paths) == HELPERS['SHEETS'], 'nine sheets/order changed')
    require(len(old.tables) == len(new.tables) == 8, 'native table count changed')
    require(old.sheet_tables == new.sheet_tables, 'native table bindings changed')
    require(set(old.raw) == set(new.raw), 'package parts added/deleted')
    require(old.raw['xl/styles.xml'] == new.raw['xl/styles.xml'], 'styles not byte-identical')

    text_patches = {(p['sheet'], p['cell']): p for p in checks['patches']}
    cache_patches = {(p['sheet'], p['cell']): p for p in checks.get('formulaCachePatches', [])}
    require(len(text_patches) == len(checks['patches']), 'duplicate declared text patch')
    require(len(cache_patches) == len(checks.get('formulaCachePatches', [])) == 8, 'cache patch count/duplicates')
    require(set(cache_patches) == {('Feiertagskalender', cell) for cell in CACHE_TO_RULE}, 'unexpected formula-cache targets')
    require(not (set(text_patches) & set(cache_patches)), 'overlapping text/cache changes')
    allowed = set(text_patches) | set(cache_patches)
    by_sheet = {name: {cell for sheet, cell in allowed if sheet == name} for name in new.paths}
    require(all(sheet in new.paths for sheet, _ in allowed), 'unknown patched sheet')

    rule_rows = {old.value('Feiertagsregeln', f'A{row}'): row for row in range(7, 123)}
    expected_rule_cells = {f'G{rule_rows[rule_id]}' for rule_id in CACHE_TO_RULE.values()}
    expected_text_targets = {('Feiertagsregeln', cell) for cell in expected_rule_cells}
    expected_text_targets |= {('Feiertagskalender', 'N' + cell[1:]) for cell in CACHE_TO_RULE}
    expected_text_targets |= {('Übersicht', 'A6'), ('Übersicht', 'A34'), ('Übersicht', 'A36'),
                              ('Rechtsquellen', 'H13'), ('Quellenprüfung', 'G14')}
    require(set(text_patches) == expected_text_targets and len(text_patches) == 21,
            'text edits outside eight language cells, eight notes and five revision/source notes')
    overlay = {entry['ruleId']: entry for entry in checks['labels']}
    require(len(overlay) == len(checks['labels']) == 8 and set(overlay) == set(CACHE_TO_RULE.values()),
            'provisional overlay membership/duplicates')

    for (sheet, address), patch in text_patches.items():
        before, after = old.cells[sheet].get(address), new.cells[sheet].get(address)
        require(before is not None and after is not None, 'text patch missing source/target', sheet, address)
        require(before.find('s:f', NS) is None and after.find('s:f', NS) is None,
                'a text patch altered a formula cell', sheet, address)
        require(attributes_except_type(before) == attributes_except_type(after), 'text-cell style/metadata changed', sheet, address)
        require(not isinstance(old.value(sheet, address), (int, float)), 'text patch replaced numeric source', sheet, address)
        require(isinstance(patch['value'], str) and new.value(sheet, address) == patch['value'],
                'saved text differs from declaration', sheet, address)
    for (sheet, address), patch in cache_patches.items():
        before, after = old.cells[sheet][address], new.cells[sheet][address]
        require(before.find('s:f', NS) is not None and after.find('s:f', NS) is not None, 'formula lost', address)
        require(ET.tostring(before.find('s:f', NS)) == ET.tostring(after.find('s:f', NS)), 'formula expression/attributes changed', address)
        require(attributes_except_type(before) == attributes_except_type(after), 'cache-cell style/metadata changed', address)
        require([canonical(c) for c in before if c.tag != '{' + N + '}v']
                == [canonical(c) for c in after if c.tag != '{' + N + '}v'], 'cache patch changed another child', address)
        require(after.get('t') == 'str' and new.value(sheet, address) == patch['value'], 'wrong saved RG cache', address)
        require(old.value(sheet, address) == 'Noch zu erfassen', 'cache source was not an open language placeholder', address)

    actual_changed, preserved, numeric_unchanged = set(), 0, 0
    formulas, unchanged_formula_caches = 0, 0
    for name in old.paths:
        require(set(old.cells[name]) == set(new.cells[name]), name, 'cell addresses added/deleted')
        require(without_changed_cells(old.sheets[name], by_sheet[name])
                == without_changed_cells(new.sheets[name], by_sheet[name]),
                name, 'unrelated cell, row height, validation, CF, protection or native object changed')
        for address, before in old.cells[name].items():
            after = new.cells[name][address]
            key = (name, address)
            if canonical(before) != canonical(after):
                actual_changed.add(key)
                require(key in allowed, 'undeclared cell change', key)
            else:
                preserved += 1
            if isinstance(old.value(name, address), (int, float)):
                require(old.value(name, address) == new.value(name, address), 'numeric/date result changed', key)
                numeric_unchanged += 1
            value = new.value(name, address)
            require(after.get('t') != 'e' and not (isinstance(value, str) and value in ERROR_VALUES), 'saved Excel error', key)
            old_formula, new_formula = before.find('s:f', NS), after.find('s:f', NS)
            require(canonical(old_formula) == canonical(new_formula), 'formula set/text changed', key)
            if old_formula is not None:
                formulas += 1
                require(not new.unlocked(name, address) and after.find('s:v', NS) is not None, 'formula protection/cache lost', key)
                if key not in cache_patches:
                    require(canonical(before) == canonical(after), 'unapproved formula-cache change', key)
                    unchanged_formula_caches += 1
        part = old.paths[name]
        if not by_sheet[name]:
            require(old.raw[part] == new.raw[part], 'unpatched worksheet part not byte-identical', part)
    require(actual_changed == allowed, 'declared edits missing or no-op', sorted(allowed - actual_changed))
    changed_parts = {old.paths[name] for name, cells in by_sheet.items() if cells}
    for part in set(old.raw) - changed_parts:
        require(old.raw[part] == new.raw[part], 'unrelated package part changed', part)

    # Independent invariant: none of the statuses, approvals or export classes moves.
    status_ranges = {'Feiertagsregeln': (7, 122, ('R', 'S', 'V')),
                     'Gemeinwesen': (7, 33, ('H',)), 'Geltungsbereiche': (7, 19, ('K',)),
                     'Gebietszuordnungen': (7, 37, ('Q',)), 'Rechtsquellen': (7, 23, ('I', 'J')),
                     'Verfahrensbezug': (7, 24, ('G', 'H')), 'Quellenprüfung': (7, 24, ('E', 'F', 'H')),
                     'Feiertagskalender': (7, 131, ('J',))}
    statuses = 0
    for name, (first, last, columns) in status_ranges.items():
        for row in range(first, last + 1):
            for column in columns:
                address = f'{column}{row}'
                require(canonical(old.cells[name].get(address)) == canonical(new.cells[name].get(address)),
                        'status/approval/export field changed', name, address)
                statuses += 1

    labels = []
    for address, rule_id in CACHE_TO_RULE.items():
        rule_address = f'G{rule_rows[rule_id]}'
        require(old.value('Feiertagsregeln', rule_address) in (None, ''), 'source RG name was not empty', rule_id)
        value = new.value('Feiertagsregeln', rule_address)
        require(isinstance(value, str) and value.strip() and value != 'Noch zu erfassen', 'missing provisional RG value', rule_id)
        require(value == new.value('Feiertagskalender', address), 'rule/calendar provisional name mismatch', rule_id)
        require(value == overlay[rule_id]['rm'] and overlay[rule_id]['kind'] == 'provisionalProductTranslation'
                and overlay[rule_id]['independentLanguageApproval'] is False
                and overlay[rule_id]['legalEffectChanged'] is False, 'overlay value/approval classification', rule_id)
        calendar_note = new.value('Feiertagskalender', 'N' + address[1:])
        require('provisor' in calendar_note.lower() and 'produktübersetzung' in calendar_note.lower(),
                'row-specific provisional translation marker missing', address)
        require(new.value('Feiertagskalender', 'K' + address[1:]) == rule_id, 'calendar cache attached to wrong rule', address)
        require(new.value('Feiertagsregeln', f'R{rule_rows[rule_id]}') == 'open'
                and new.value('Feiertagsregeln', f'V{rule_rows[rule_id]}') == 'blockedEffect', 'provisional data activated', rule_id)
        labels.append({'ruleId': rule_id, 'ruleCell': rule_address, 'calendarCell': address, 'value': value})
    changed_text = '\n'.join(p['value'] for p in text_patches.values()).lower()
    require('provisor' in changed_text, 'provisional marker absent from changed text')
    require(re.search(r'(?:nicht|kein\w*)\s+amtlich|ungeprüft|noch\s+(?:nicht|zu)\s+prüf', changed_text),
            'lack of official/verified status not visible in changed text')
    require(sha(SOURCE) == SOURCE_SHA and sha(final) == final_hash, 'file changed while auditing')
    return {'status': 'passed', 'auditedAtUtc': datetime.now(timezone.utc).isoformat(),
            'source': str(SOURCE), 'file': str(final), 'sourceSha256Unchanged': SOURCE_SHA, 'sha256': final_hash,
            'changedTextCells': len(text_patches), 'changedFormulaCacheCells': 8, 'actualChangedCells': len(actual_changed),
            'preservedCells': preserved, 'unchangedNumericAndDateCells': numeric_unchanged,
            'unchangedStatusApprovalExportCells': statuses, 'unchangedFormulaExpressions': formulas,
            'unchangedFormulasAndCaches': unchanged_formula_caches, 'provisionalLabels': labels,
            'sheets': 9, 'nativeTables': 8, 'stylesAndRowHeightsUnchanged': True,
            'allOtherPartsByteIdentical': True, 'provisionalMarkerPresent': True, 'nonOfficialStatusVisible': True,
            'sourceV07Preserved': True, 'workbooksMutated': False, 'recalculatesExcel': False,
            'languageOrLegalApprovalClaimed': False,
            'limitations': ['Exact saved-file difference check. Does not establish linguistic correctness.',
                            'Only eight declared string caches change. No Excel recalculation performed.',
                            'All date/status/native-object invariants are compared to V0.7, not newly legally approved.']}


if __name__ == '__main__':
    try:
        audit = main()
    except Exception as error:
        audit = {'status': 'failed', 'errorType': type(error).__name__, 'error': str(error),
                 'workbooksMutated': False, 'languageOrLegalApprovalClaimed': False}
        QA.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(audit, ensure_ascii=False))
        sys.exit(1)
    QA.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(audit, ensure_ascii=False))
