"""Independent, read-only V0.10/V0.11 audit for complete provisional labels.

The immutable source workbook, not the authoring receipt, determines every
permitted language cell and dependent calendar cache. Only the JSON audit is
written. No workbook is saved, recalculated, linguistically or legally approved.
Use --self-test to run synthetic positive/negative checks entirely in memory.
"""
from collections import Counter
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
QA = ROOT / '.work/ap18b-04-labels'
OUTPUT = ROOT / 'outputs/ap18b-04-restkantone-2026-09-13'
SOURCE = OUTPUT / '2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx'
FINAL = OUTPUT / '2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx'
SOURCE_SHA = 'bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e'
REPORT = QA / 'independent-audit.json'
HELPERS = runpy.run_path(str(ROOT / 'scripts/check-ap18b-ti-gr-workbook.py'))
Book, canonical, require = (HELPERS[k] for k in ('Book', 'canonical', 'require'))
N, NS, SHEETS = (HELPERS[k] for k in ('N', 'NS', 'SHEETS'))
LANGUAGE_TABLES = {
    'Gemeinwesen': ('BCDE', 33, 6),
    'Geltungsbereiche': ('CDEF', 55, 39),
    'Gebietszuordnungen': ('DEFG', 101, 84),
    'Feiertagsregeln': ('DEFG', 480, 186),
}
LANGUAGES = ('de', 'fr', 'it', 'rm')
OVERVIEW_CELLS = {('Übersicht', f'A{r}') for r in (6, 9, 14, 30, 31, 34, 36)}
ERRORS = {'#REF!', '#VALUE!', '#DIV/0!', '#NAME?', '#NUM!', '#NULL!', '#N/A', '#SPILL!', '#CALC!'}
METADATA_KEYS = {'sheet', 'cell', 'id', 'language', 'value', 'kind', 'sourceUrl',
                 'independentLanguageApproval', 'legalEffectChanged'}


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def complete_text(value):
    return (isinstance(value, str) and bool(value.strip())
            and value.strip().casefold() not in {'noch zu erfassen', 'tbd', 'todo', '-', '?'}
            and value not in ERRORS)


def index_entries(entries, kind):
    require(isinstance(entries, list), kind, 'must be a list')
    indexed = {}
    for entry in entries:
        require(isinstance(entry, dict) and {'sheet', 'cell', 'value'} <= entry.keys(),
                kind, 'malformed entry')
        key = (entry['sheet'], entry['cell'])
        require(all(isinstance(x, str) for x in key), kind, 'non-string target')
        require(key not in indexed, kind, 'duplicate target', key)
        indexed[key] = entry
    return indexed


def derive_targets(source):
    """Find blanks and their cache consumers independently of author output."""
    gaps, counts = {}, Counter()
    for sheet, (columns, end, expected) in LANGUAGE_TABLES.items():
        for row in range(7, end + 1):
            identity = source.value(sheet, f'A{row}')
            require(isinstance(identity, str) and identity, 'missing source identity', sheet, row)
            for column, language in zip(columns, LANGUAGES):
                address = f'{column}{row}'
                cell = source.cells[sheet].get(address)
                require(cell is not None and cell.find('s:f', NS) is None,
                        'language source is missing or calculated', sheet, address)
                if source.value(sheet, address) in (None, ''):
                    gaps[(sheet, address)] = {'id': identity, 'language': language}
                    counts[sheet] += 1
        require(counts[sheet] == expected, 'unexpected immutable source gap count', sheet, counts[sheet])
    require(len(gaps) == 315, 'unexpected total source language gaps')

    rule_rows = {}
    for row in range(7, 481):
        identity = source.value('Feiertagsregeln', f'A{row}')
        require(identity not in rule_rows, 'duplicate source rule ID', identity)
        rule_rows[identity] = row
    require(len(rule_rows) == 474, 'unexpected rule count')
    caches = {}
    for row in range(7, 490):
        identity = source.value('Feiertagskalender', f'K{row}')
        require(identity in rule_rows, 'calendar links to unknown rule', row, identity)
        for cache_col, rule_col in (('G', 'F'), ('H', 'G')):
            rule_key = ('Feiertagsregeln', f'{rule_col}{rule_rows[identity]}')
            if rule_key in gaps:
                key = ('Feiertagskalender', f'{cache_col}{row}')
                require(source.value(*key) == 'Noch zu erfassen',
                        'source cache does not show expected language gap', key)
                require(source.cells[key[0]][key[1]].find('s:f', NS) is not None,
                        'language cache lacks source formula', key)
                caches[key] = rule_key
    require(len(caches) == 204, 'unexpected independent dependent-cache count', len(caches))
    return gaps, caches, dict(counts), rule_rows


def cell_structure_without_value(cell):
    result = deepcopy(cell)
    result.attrib.pop('t', None)
    for child in list(result):
        if child.tag in ('{' + N + '}v', '{' + N + '}is'):
            result.remove(child)
    return canonical(result)


def plain_string_payload(cell):
    """A label edit cannot smuggle in a rich-text formatting change."""
    if cell.get('t') == 'str':
        return len(cell.findall('s:v', NS)) == 1 and cell.find('s:is', NS) is None
    if cell.get('t') == 'inlineStr':
        elements = cell.findall('s:is', NS)
        return (len(elements) == 1 and cell.find('s:v', NS) is None
                and len(elements[0]) == 1 and elements[0][0].tag == '{' + N + '}t'
                and not list(elements[0][0]))
    return False


def sheet_without_cells(sheet, addresses):
    result = deepcopy(sheet)
    for row in result.findall('s:sheetData/s:row', NS):
        for cell in list(row):
            if cell.get('r') in addresses:
                row.remove(cell)
    return canonical(result)


def no_active_or_external_data(book):
    forbidden = re.compile(r'vbaproject|vbadata|macrosheets/|dialog[sS]heets/|external[lL]inks/|'
                           r'(?:^|/)connections\.xml$|query[tT]ables/|active[xX]/|embeddings/', re.I)
    require(not [part for part in book.raw if forbidden.search(part)],
            'macro, active content or external-data part found')
    for part, root in book.xml.items():
        if part.endswith('.rels'):
            for relation in root:
                kind = relation.get('Type', '').lower()
                require(not any(token in kind for token in ('vbaproject', 'externallink', 'connections',
                                                             'querytable', 'oleobject', 'activex')),
                        'active/external-data relationship', part, kind)
        if part == '[Content_Types].xml':
            require(not any('macroenabled' in element.get('ContentType', '').lower()
                            or 'vba' in element.get('ContentType', '').lower() for element in root),
                    'macro-enabled content type')
    # Ordinary official-source hyperlinks are explicitly not data connections.
    for sheet, cells in book.cells.items():
        for address, cell in cells.items():
            formula = cell.find('s:f', NS)
            if formula is not None:
                text = formula.text or ''
                require(not re.search(r'\[[^\]]+\][^!]*!|\|[^!]*!', text),
                        'external-workbook or DDE formula', sheet, address)


def audit_books(old, new, checks):
    require(Path(checks['source']) == SOURCE and checks['sourceSha256'] == SOURCE_SHA,
            'unexpected declared baseline')
    require(Path(checks['file']) == FINAL, 'unexpected output path')
    require(list(old.paths) == list(new.paths) == SHEETS, 'nine sheets/order changed')
    require(len(old.tables) == len(new.tables) == 8, 'eight native tables not preserved')
    require(old.sheet_tables == new.sheet_tables, 'native table bindings changed')
    require(set(old.raw) == set(new.raw), 'package parts added/deleted')
    require(old.raw['xl/styles.xml'] == new.raw['xl/styles.xml'], 'styles not byte-identical')
    no_active_or_external_data(old)
    no_active_or_external_data(new)
    gaps, expected_caches, gap_counts, rule_rows = derive_targets(old)

    patches = index_entries(checks['patches'], 'text patches')
    caches = index_entries(checks['formulaCachePatches'], 'formula cache patches')
    labels = index_entries(checks['labels'], 'provisional labels')
    require(set(gaps) <= set(patches) <= set(gaps) | OVERVIEW_CELLS,
            'text edits are not exactly source gaps plus permitted overview notes')
    require(set(caches) == set(expected_caches), 'cache edits differ from independently derived consumers')
    require(set(labels) == set(gaps) and len(labels) == 315, 'label metadata does not match source gaps')
    require(not set(patches) & set(caches), 'text/cache targets overlap')

    for key, expected in gaps.items():
        entry = labels[key]
        require(METADATA_KEYS <= entry.keys(), 'incomplete provisional metadata', key)
        require(entry['id'] == expected['id'] and entry['language'] == expected['language'],
                'provisional identity/language mismatch', key)
        require(entry['kind'] == 'provisionalProductTranslation' and entry['sourceUrl'] is None
                and entry['independentLanguageApproval'] is False and entry['legalEffectChanged'] is False,
                'translation falsely represented as sourced, approved or legally effective', key)
        require(entry['value'] == patches[key]['value'] == new.value(*key)
                and complete_text(entry['value']), 'missing/inconsistent new translation', key)

    for key, patch in patches.items():
        sheet, address = key
        before, after = old.cells[sheet].get(address), new.cells[sheet].get(address)
        require(before is not None and after is not None, 'text cell missing', key)
        require(before.find('s:f', NS) is None and after.find('s:f', NS) is None,
                'text patch changes formula cell', key)
        require(cell_structure_without_value(before) == cell_structure_without_value(after),
                'text-cell style or non-value metadata changed', key)
        require(plain_string_payload(after), 'label is not a plain native string', key)
        require(not isinstance(old.value(*key), (int, float)), 'numeric/date source replaced by text', key)
        require(complete_text(patch['value']) and new.value(*key) == patch['value'],
                'saved text differs from declared patch', key)

    for key, rule_key in expected_caches.items():
        before, after = old.cells[key[0]][key[1]], new.cells[key[0]][key[1]]
        require(cell_structure_without_value(before) == cell_structure_without_value(after),
                'cache patch changes formula, styling or metadata', key)
        require([canonical(c) for c in before if c.tag != '{' + N + '}v']
                == [canonical(c) for c in after if c.tag != '{' + N + '}v'],
                'cache patch changes non-cache child', key)
        require(after.get('t') == 'str' and new.value(*key) == new.value(*rule_key)
                == caches[key]['value'], 'calendar cache differs from linked rule translation', key, rule_key)

    allowed = set(patches) | set(caches)
    by_sheet = {sheet: {address for name, address in allowed if name == sheet} for sheet in old.paths}
    changed, preserved, numeric, formulas, unchanged_caches = set(), 0, 0, 0, 0
    for sheet in old.paths:
        require(set(old.cells[sheet]) == set(new.cells[sheet]), 'cell address set changed', sheet)
        require(sheet_without_cells(old.sheets[sheet], by_sheet[sheet])
                == sheet_without_cells(new.sheets[sheet], by_sheet[sheet]),
                'unrelated cell/row/native worksheet feature changed', sheet)
        for address, before in old.cells[sheet].items():
            key, after = (sheet, address), new.cells[sheet][address]
            if canonical(before) == canonical(after):
                preserved += 1
            else:
                changed.add(key)
                require(key in allowed, 'unpermitted changed cell', key)
            value = new.value(*key)
            require(after.get('t') != 'e' and not (isinstance(value, str) and value in ERRORS),
                    'saved Excel error', key)
            if isinstance(old.value(*key), (int, float)):
                require(old.value(*key) == value, 'numeric/date value changed', key)
                numeric += 1
            before_f, after_f = before.find('s:f', NS), after.find('s:f', NS)
            require(canonical(before_f) == canonical(after_f), 'formula set/expression changed', key)
            if before_f is not None:
                formulas += 1
                require(not new.unlocked(*key) and after.find('s:v', NS) is not None,
                        'formula protection or cache missing', key)
                if key not in caches:
                    require(canonical(before) == canonical(after), 'unpermitted formula-cache change', key)
                    unchanged_caches += 1
    require(changed == allowed, 'declared patches missing or no-op', sorted(allowed - changed))
    changed_parts = {old.paths[sheet] for sheet, cells in by_sheet.items() if cells}
    for part in set(old.raw) - changed_parts:
        require(old.raw[part] == new.raw[part], 'unrelated package part not byte-identical', part)

    checked_language_cells = 0
    for sheet, (columns, end, _) in LANGUAGE_TABLES.items():
        for row in range(7, end + 1):
            for column in columns:
                require(complete_text(new.value(sheet, f'{column}{row}')),
                        'remaining input-language gap or placeholder', sheet, column, row)
                checked_language_cells += 1
    for row in range(7, 490):
        identity = new.value('Feiertagskalender', f'K{row}')
        for calendar_col, rule_col in zip('EFGH', 'DEFG'):
            value = new.value('Feiertagskalender', f'{calendar_col}{row}')
            require(complete_text(value), 'remaining calendar-language gap', calendar_col, row)
            require(value == new.value('Feiertagsregeln', f'{rule_col}{rule_rows[identity]}'),
                    'calendar name differs from linked rule', calendar_col, row, identity)

    overview = '\n'.join(str(new.value('Übersicht', f'A{r}')) for r in (6, 9, 14, 30, 31, 34, 36))
    require('V0.11' in str(new.value('Übersicht', 'A6')), 'V0.11 version label missing')
    require('0.5.0' in str(new.value('Übersicht', 'A36')), 'unchanged workbook contract not visible')
    require('provisor' in overview.lower() and re.search(r'keine?\s+amtlich|nicht\s+amtlich', overview.lower()),
            'provisional/non-official translation qualification missing')
    require(re.search(r'\b5\b.*offen', str(new.value('Übersicht', 'A8'))),
            'five open cases no longer documented')
    return {'status': 'passed', 'sourceLanguageGaps': gap_counts, 'inputLanguageGapsAfter': 0,
            'calendarLanguageGapsAfter': 0, 'checkedInputLanguageCells': checked_language_cells,
            'checkedCalendarLanguageCells': 483 * 4, 'provisionalLabels': len(labels),
            'changedTextCells': len(patches),
            'changedInputLabelCells': len(gaps), 'changedOverviewCells': len(set(patches) - set(gaps)),
            'changedFormulaCacheCells': len(caches), 'actualChangedCells': len(changed),
            'preservedCells': preserved, 'unchangedNumericAndDateCells': numeric,
            'unchangedFormulaExpressions': formulas, 'unchangedFormulasAndCaches': unchanged_caches,
            'sheets': 9, 'nativeTables': 8, 'openCases': 5, 'workbookContract': '0.5.0',
            'stylesRowsNativeObjectsUnchanged': True, 'allOtherPartsByteIdentical': True,
            'existingTranslationsUnchanged': True, 'statusAndApprovalPromotion': False,
            'macrosOrExternalDataConnections': False, 'workbooksMutated': False,
            'recalculatesExcel': False, 'languageOrLegalApprovalClaimed': False}


def put_string(book, sheet, address, value, cache=False):
    """In-memory test fixture helper, never called on a saved workbook."""
    cell = book.cells[sheet][address]
    for child in list(cell):
        if child.tag in ('{' + N + '}v', '{' + N + '}is'):
            cell.remove(child)
    cell.set('t', 'str' if cache else 'inlineStr')
    if cache:
        ET.SubElement(cell, '{' + N + '}v').text = value
    else:
        ET.SubElement(ET.SubElement(cell, '{' + N + '}is'), '{' + N + '}t').text = value
    book.raw[book.paths[sheet]] = ET.tostring(book.sheets[sheet], encoding='utf-8')


def self_tests(source):
    gaps, caches, _, _ = derive_targets(source)
    good, checks = deepcopy(source), {'source': str(SOURCE), 'file': str(FINAL),
                                     'sourceSha256': SOURCE_SHA, 'patches': [],
                                     'formulaCachePatches': [], 'labels': []}
    for number, (key, metadata) in enumerate(gaps.items(), 1):
        value = f'Provisorische Testübersetzung {number}'
        patch = {'sheet': key[0], 'cell': key[1], 'value': value}
        checks['patches'].append(patch)
        checks['labels'].append({**patch, **metadata, 'kind': 'provisionalProductTranslation',
                                 'sourceUrl': None, 'independentLanguageApproval': False,
                                 'legalEffectChanged': False})
        put_string(good, *key, value)
    version = str(source.value('Übersicht', 'A6')).replace('V0.10', 'V0.11')
    checks['patches'].append({'sheet': 'Übersicht', 'cell': 'A6', 'value': version})
    put_string(good, 'Übersicht', 'A6', version)
    for key, rule in caches.items():
        value = good.value(*rule)
        checks['formulaCachePatches'].append({'sheet': key[0], 'cell': key[1], 'value': value})
        put_string(good, *key, value, cache=True)
    audit_books(source, good, checks)
    rejected = []

    def rejects(name, mutate):
        candidate, receipt = deepcopy(good), deepcopy(checks)
        mutate(candidate, receipt)
        try:
            audit_books(source, candidate, receipt)
        except AssertionError:
            rejected.append(name)
        else:
            raise AssertionError(('negative self-test accepted', name))

    def replace_existing(book, receipt):
        put_string(book, 'Feiertagsregeln', 'D7', 'Unzulässiger Ersatz')
        receipt['patches'].append({'sheet': 'Feiertagsregeln', 'cell': 'D7', 'value': 'Unzulässiger Ersatz'})

    def corrupt_cache(book, receipt):
        patch = receipt['formulaCachePatches'][0]
        patch['value'] = 'Falsche Zuordnung'
        put_string(book, patch['sheet'], patch['cell'], patch['value'], cache=True)

    rejects('existing translation overwritten despite forged receipt', replace_existing)
    rejects('missing required label metadata', lambda b, r: r['labels'].pop())
    rejects('false independent language approval',
            lambda b, r: r['labels'][0].update(independentLanguageApproval=True))
    rejects('false official source attribution',
            lambda b, r: r['labels'][0].update(sourceUrl='https://example.org/official'))
    rejects('wrong dependent cache despite forged receipt', corrupt_cache)
    rejects('changed cache formula', lambda b, r: setattr(
        b.cells['Feiertagskalender']['G7'].find('s:f', NS), 'text', '"Wrong"'))
    rejects('changed rule status', lambda b, r: put_string(b, 'Feiertagsregeln', 'R480', 'approved'))
    rejects('changed input style', lambda b, r: b.cells['Gemeinwesen']['D7'].set('s', '0'))
    rejects('changed date cache', lambda b, r: setattr(
        b.cells['Feiertagskalender']['A7'].find('s:v', NS), 'text', '99999'))
    rejects('changed row height', lambda b, r: b.sheets['Gemeinwesen'].find(
        "s:sheetData/s:row[@r='7']", NS).set('ht', '200'))
    rejects('changed table part', lambda b, r: b.raw.update(
        {'xl/tables/table1.xml': b.raw['xl/tables/table1.xml'] + b' '}))
    rejects('new external connection part', lambda b, r: b.raw.update(
        {'xl/connections.xml': b'<connections/>'}))
    return {'positiveFixturePassed': True, 'negativeCasesRejected': len(rejected), 'cases': rejected,
            'inMemoryOnly': True, 'workbooksMutated': False}


def main():
    require(set(sys.argv[1:]) <= {'--self-test'}, 'unknown checker option')
    require(sha(SOURCE) == SOURCE_SHA, 'immutable V0.10 changed')
    source = Book(SOURCE)
    self_test_result = self_tests(source)
    if '--self-test' in sys.argv[1:]:
        require(sha(SOURCE) == SOURCE_SHA, 'source changed during self-test')
        return {'status': 'passed', 'sourceSha256Unchanged': SOURCE_SHA, 'selfTests': self_test_result}
    checks = json.loads((QA / 'checks.json').read_text())
    final_hash = sha(FINAL)
    result = audit_books(source, Book(FINAL), checks)
    require(sha(SOURCE) == SOURCE_SHA and sha(FINAL) == final_hash, 'file changed during audit')
    return {**result, 'auditedAtUtc': datetime.now(timezone.utc).isoformat(),
            'source': str(SOURCE), 'file': str(FINAL), 'sourceSha256Unchanged': SOURCE_SHA,
            'sha256': final_hash, 'selfTests': self_test_result,
            'limitations': ['Checks exact saved-file differences, not linguistic correctness.',
                            'No Excel recalculation or native Excel interaction test.',
                            'Existing legal classifications are preserved, not newly approved.']}


if __name__ == '__main__':
    try:
        result = main()
    except Exception as error:
        result = {'status': 'failed', 'errorType': type(error).__name__, 'error': str(error),
                  'workbooksMutated': False, 'languageOrLegalApprovalClaimed': False}
    if '--self-test' not in sys.argv[1:]:
        QA.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result['status'] == 'passed' else 1)
