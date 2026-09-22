"""Read-only, independent OOXML audit of the saved AP18B-01 AG workbook.

The authoring receipts describe permitted edits, not evidence of correctness.
This checker compares the actual files, preserves the approved baseline, checks
the saved data and formula caches, and enforces package-specific release limits.
It neither recalculates Excel nor imports/activates application data.
"""
from collections import Counter
from copy import deepcopy
from datetime import date, timedelta
from pathlib import Path
import hashlib
import json
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / '.work/ap18b-01-ag'
SOURCE = ROOT / 'outputs/ap18a-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.4.xlsx'
FINAL = ROOT / 'outputs/ap18b-01-ag-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.5.xlsx'
SOURCE_SHA = '11f47723d4bd9961e177bf0401c015899f41d847e56a32141d72bf82876cd597'
BASELINE = '2026-08-31-mvp-03-approved.1'
BJ_URL = 'https://www.bj.admin.ch/dam/de/sd-web/4Ad6GMn8rA0i/hinweise-kant-feiertage.pdf'
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'s': N}


def require(condition, *context):
    if not condition:
        raise AssertionError(context)


def canonical(element):
    if element is None:
        return None
    return (element.tag, tuple(sorted(element.attrib.items())), element.text or '',
            tuple(canonical(child) for child in element))


def col(number):
    result = ''
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def position(address):
    letters, row = re.fullmatch(r'([A-Z]+)(\d+)', address).groups()
    number = 0
    for letter in letters:
        number = number * 26 + ord(letter) - 64
    return number, int(row)


def addresses(reference):
    start, *rest = reference.split(':')
    left, top = position(start)
    right, bottom = position(rest[-1] if rest else start)
    return {f'{col(c)}{r}' for r in range(top, bottom + 1) for c in range(left, right + 1)}


def resolve_relationship(part, target):
    parent = posixpath.dirname(posixpath.dirname(part))
    return target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(parent, target))


class Book:
    def __init__(self, file):
        with zipfile.ZipFile(file) as archive:
            require(archive.testzip() is None, file, 'invalid ZIP')
            require(len(archive.namelist()) == len(set(archive.namelist())), 'duplicate ZIP member')
            self.raw = {name: archive.read(name) for name in archive.namelist()}
        self.xml = {key: ET.fromstring(value) for key, value in self.raw.items()
                    if key.endswith(('.xml', '.rels'))}
        self.pool = [''.join(item.itertext()) for item in self.xml.get('xl/sharedStrings.xml', [])]
        rel_key = 'xl/_rels/workbook.xml.rels'
        rels = {item.get('Id'): resolve_relationship(rel_key, item.get('Target'))
                for item in self.xml[rel_key]}
        self.sheet_list = list(self.xml['xl/workbook.xml'].find('s:sheets', NS))
        self.paths = {item.get('name'): rels[item.get('{' + R + '}id')] for item in self.sheet_list}
        self.sheets = {name: self.xml[key] for name, key in self.paths.items()}
        self.cells = {name: {cell.get('r'): cell for cell in sheet.findall('s:sheetData/s:row/s:c', NS)}
                      for name, sheet in self.sheets.items()}
        self.styles = self.xml['xl/styles.xml'].find('s:cellXfs', NS)
        self.tables = {key: value for key, value in self.xml.items() if key.startswith('xl/tables/')}

    def value(self, name, address):
        cell = self.cells[name].get(address)
        if cell is None:
            return None
        if cell.get('t') == 's':
            return self.pool[int(cell.find('s:v', NS).text)]
        if cell.get('t') == 'inlineStr':
            return ''.join(cell.find('s:is', NS).itertext())
        value = cell.find('s:v', NS)
        if value is None or value.text is None:
            return None
        if cell.get('t') in ('str', 'e', 'b'):
            return value.text
        number = float(value.text)
        return int(number) if number.is_integer() else number

    def unlocked(self, name, address):
        cell = self.cells[name].get(address)
        require(cell is not None, name, address, 'missing styled cell')
        protection = self.styles[int(cell.get('s', '0'))].find('s:protection', NS)
        return protection is not None and protection.get('locked') == '0'

    def row(self, name, row, count):
        return [self.value(name, f'{col(i)}{row}') for i in range(1, count + 1)]


def serial(value):
    return None if value is None else (date.fromisoformat(value) - date(1899, 12, 30)).days


def same_value(actual, expected, *context):
    require(actual == expected or actual in (None, '') and expected in (None, ''), *context, actual, expected)


def expected_date(rule, year):
    calculation = rule['calculation']
    kind = calculation['type']
    if kind == 'fixedMonthDay':
        result = date(year, calculation['month'], calculation['day'])
    elif kind == 'easterOffsetDays':
        # Gregorian computus, used only to check saved caches, not to author them.
        a, b, c = year % 19, year // 100, year % 100
        d, e = b // 4, b % 4
        f = (b + 8) // 25
        g = (b - f + 1) // 3
        h = (19 * a + b - d - g + 15) % 30
        i, k = c // 4, c % 4
        l = (32 + 2 * e + 2 * i - h - k) % 7
        m = (a + 11 * h + 22 * l) // 451
        n = h + l - 7 * m + 114
        result = date(year, n // 31, n % 31 + 1) + timedelta(days=calculation['offsetDays'])
    elif kind == 'nthWeekdayOfMonth':
        first = date(year, calculation['month'], 1)
        result = first + timedelta(days=(calculation['isoWeekday'] - first.isoweekday()) % 7
                                  + 7 * (calculation['occurrence'] - 1))
        require(result.month == first.month, 'invalid weekday occurrence')
    else:
        raise AssertionError(('unsupported calculation', kind))
    return None if result.isoformat() < rule['from'] or rule['to'] and result.isoformat() > rule['to'] else serial(result.isoformat())


def main():
    require(hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA, 'V0.4 source changed')
    checks = json.loads((QA / 'checks.json').read_text())
    model = json.loads((QA / 'model.json').read_text())
    require(Path(checks['source']) == SOURCE and Path(checks['file']) == FINAL, 'unexpected audit targets')
    require(checks['contract'] == '0.4.0' and checks['workbookRevision'] == '0.5', 'wrong workbook contract')
    old, new = Book(SOURCE), Book(FINAL)
    expected_sheets = ['Übersicht', 'Feiertagskalender', 'Gemeinwesen', 'Feiertagsregeln',
                       'Geltungsbereiche', 'Gebietszuordnungen', 'Rechtsquellen', 'Verfahrensbezug', 'Quellenprüfung']
    require(list(old.paths) == list(new.paths) == expected_sheets, 'nine sheets and original order')
    require(canonical(old.xml['xl/workbook.xml']) == canonical(new.xml['xl/workbook.xml']), 'workbook native settings')
    require(old.raw['xl/styles.xml'] == new.raw['xl/styles.xml'], 'styles.xml must be byte-identical')
    require(set(old.tables) == set(new.tables) and len(new.tables) == 8, 'native eight tables')
    specs = {spec['name']: spec for spec in checks['specs']}
    expected_ends = {'Feiertagsregeln': ('Z', 96), 'Geltungsbereiche': ('M', 17), 'Rechtsquellen': ('K', 12),
                     'Verfahrensbezug': ('H', 17), 'Quellenprüfung': ('K', 13),
                     'Gebietszuordnungen': ('R', 35), 'Feiertagskalender': ('N', 105)}
    require(set(specs) == set(expected_ends), 'expected seven resized tables')
    for name, (last, end) in expected_ends.items():
        spec = specs[name]
        require((spec['last'], spec['end']) == (last, end), name, 'unexpected dimensions')
    for key, table in new.tables.items():
        before = old.tables[key]
        spec = next((item for item in specs.values() if item['tableName'] == table.get('name')), None)
        expected = deepcopy(before)
        if spec:
            ref = f'A6:{spec["last"]}{spec["end"]}'
            expected.set('ref', ref)
            expected.find('s:autoFilter', NS).set('ref', ref)
        require(canonical(expected) == canonical(table), key, 'native table headers, style or filter changed')

    patches = {}
    for patch in checks['patches']:
        require(patch['name'] in new.paths, 'unknown patched sheet')
        patches.setdefault(patch['name'], set()).update(addresses(patch['range']))
    preserved = 0
    formulas = Counter()
    for name, sheet in old.sheets.items():
        for address, cell in old.cells[name].items():
            if address not in patches.get(name, set()):
                require(canonical(cell) == canonical(new.cells[name].get(address)), name, address, 'undeclared cell change')
                preserved += 1
        for child in sheet:
            if child.tag.rsplit('}', 1)[-1] in ('sheetData', 'dimension', 'dataValidations', 'conditionalFormatting', 'hyperlinks'):
                continue
            require(canonical(child) == canonical(new.sheets[name].find(child.tag)), name, child.tag, 'native feature changed')
        # Validate extensions of original validations and conditional formatting.
        for tag in ('dataValidations', 'conditionalFormatting'):
            before_items, after_items = sheet.findall('s:' + tag, NS), new.sheets[name].findall('s:' + tag, NS)
            require(len(before_items) == len(after_items), name, tag, 'control count changed')
            for before, after in zip(before_items, after_items):
                expected = deepcopy(before)
                candidates = list(expected) if tag == 'dataValidations' else [expected]
                if name in specs:
                    spec = specs[name]
                    for control in candidates:
                        control.set('sqref', re.sub(r'(:\$?[A-Z]+\$?)' + str(spec['oldEnd']) + r'(?=$|\s)',
                                                   lambda match: match[1] + str(spec['end']), control.get('sqref')))
                require(canonical(expected) == canonical(after), name, tag, 'invalid range extension')
        for address, cell in new.cells[name].items():
            require(cell.get('t') != 'e', name, address, 'saved Excel error')
            if cell.find('s:f', NS) is not None:
                require(not new.unlocked(name, address), name, address, 'formula is editable')
                require(cell.find('s:v', NS) is not None, name, address, 'formula has no saved cache')
                require(new.value(name, address) is not None, name, address, 'empty formula cache')
                formulas[name] += 1

    # Broad calendar patches cannot waive approved semantic preservation.
    baseline_formula_caches = 0
    for row in range(7, 19):
        for column in range(1, 27):
            address = f'{col(column)}{row}'
            require(canonical(old.cells['Feiertagsregeln'].get(address)) == canonical(new.cells['Feiertagsregeln'].get(address)),
                    'approved reference cell changed', address)
            cell = new.cells['Feiertagsregeln'].get(address)
            baseline_formula_caches += cell is not None and cell.find('s:f', NS) is not None
    for row in range(7, 20):
        for column in range(1, 15):
            address = f'{col(column)}{row}'
            same_value(new.value('Feiertagskalender', address), old.value('Feiertagskalender', address), 'CH/BE calendar semantic preservation', address)
    for row in range(7, 11):
        for column in range(1, 12):
            address = f'{col(column)}{row}'
            require(canonical(old.cells['Quellenprüfung'].get(address)) == canonical(new.cells['Quellenprüfung'].get(address)), 'old source review changed', address)

    require(model['status'] == 'candidate' and model['baseline'] == BASELINE, 'model release limit')
    require(len(model['rules']) == 90 and len(model['assignments']) == 29 and len(model['reviews']) == 7, 'package data counts')
    require(len({rule['id'] for rule in model['rules']}) == 90, 'duplicate rule IDs')
    year = new.value('Übersicht', 'B4')
    require(year == checks['originalYear'] == 2027, 'year restored')
    for address, expected in [('B24', 27), ('B25', 12), ('B26', 78)]:
        require(new.value('Übersicht', address) == expected, 'saved summary cache', address)
    rule_by_id = {rule['id']: rule for rule in model['rules']}
    for row, rule in enumerate(model['rules'], 7):
        calculation = rule['calculation']
        values = [rule['id'], rule['jurisdiction'], rule['scope'], rule['de'], rule['fr'],
                  rule.get('it', ''), rule.get('rm', ''), rule['category'], calculation['type'],
                  calculation.get('month'), calculation.get('day'), calculation.get('offsetDays'),
                  calculation.get('isoWeekday'), calculation.get('occurrence'), serial(rule['from']), serial(rule['to']),
                  rule['priority'], rule['status'], rule['approvalBasis'], rule['action'], rule['target'], rule['exportClass']]
        for column, expected in enumerate(values, 1):
            same_value(new.value('Feiertagsregeln', f'{col(column)}{row}'), expected, 'rule value', row, col(column))
        same_value(new.value('Feiertagsregeln', f'X{row}'), expected_date(rule, year), 'saved rule date cache', row)
        same_value(new.value('Feiertagsregeln', f'Y{row}'), rule['source'], 'rule source', row)
        same_value(new.value('Feiertagsregeln', f'Z{row}'), rule['locator'], 'rule locator', row)
        if rule['jurisdiction'] == 'CH-AG':
            require(new.value('Feiertagsregeln', f'R{row}') == 'open', 'new AG rule not open', rule['id'])
            require(new.value('Feiertagsregeln', f'S{row}') in (None, ''), 'forged AG approval', rule['id'])
            require(rule['exportClass'] in ('blockedScope', 'blockedEffect'), 'new AG export activation')
    require(Counter(new.value('Feiertagsregeln', f'R{r}') for r in range(7, 97)) == {'approved': 12, 'open': 78}, 'saved statuses')

    assignment_fields = ['id', 'scopeId', 'areaId', 'de', 'fr', 'it', 'rm', 'areaType', 'parentAreaId', 'effect',
                         'officialIdSystem', 'officialId', 'from', 'to', 'sourceId', 'locator', 'status', 'note']
    for row, assignment in enumerate(model['assignments'], 7):
        for column, field in enumerate(assignment_fields, 1):
            expected = serial(assignment[field]) if field in ('from', 'to') else assignment[field]
            same_value(new.value('Gebietszuordnungen', f'{col(column)}{row}'), expected, 'assignment cell', row, field)
            require(new.unlocked('Gebietszuordnungen', f'{col(column)}{row}'), 'assignment input locked', row, field)
        require(new.value('Gebietszuordnungen', f'Q{row}') == 'open', 'assignment approval')

    # Every source URL is both preserved as raw data and a native HTTPS hyperlink.
    source_path = new.paths['Rechtsquellen']
    relation_path = posixpath.dirname(source_path) + '/_rels/' + posixpath.basename(source_path) + '.rels'
    relations = {entry.get('Id'): entry for entry in new.xml[relation_path]}
    links = {entry.get('ref'): entry for entry in new.sheets['Rechtsquellen'].find('s:hyperlinks', NS)}
    require(len(links) == 6, 'source hyperlink count')
    for row, source in enumerate(model['sources'], 7):
        source_values = source[:4] + ['Amtliche Quelle öffnen', serial(source[5]), serial(source[6])] + source[7:] + [source[4]]
        for column, expected in enumerate(source_values, 1):
            same_value(new.value('Rechtsquellen', f'{col(column)}{row}'), expected, 'source field', row, column)
        link = links[f'E{row}']
        relationship = relations[link.get('{' + R + '}id')]
        require(relationship.get('Target') == source[4] and relationship.get('TargetMode') == 'External'
                and source[4].startswith('https://'), 'source hyperlink', row)
        if source[1] == 'CH-AG':
            require(new.value('Rechtsquellen', f'I{row}') == 'open'
                    and new.value('Rechtsquellen', f'J{row}') in (None, ''), 'AG source approval')
    require(new.value('Rechtsquellen', 'K11') == BJ_URL, 'old hidden BJ URL not corrected')
    for row, scope in enumerate(model['scopes'], 7):
        scope_values = scope[:3] + ['', '', ''] + scope[3:8] + [serial(scope[8]), serial(scope[9])]
        for column, expected in enumerate(scope_values, 1):
            same_value(new.value('Geltungsbereiche', f'{col(column)}{row}'), expected, 'scope field', row, column)
        if scope[1] == 'CH-AG':
            require(new.value('Geltungsbereiche', f'K{row}') == 'open', 'AG scope approval')
    for row, mapping in enumerate(model['mappings'], 7):
        for column, expected in enumerate(mapping, 1):
            same_value(new.value('Verfahrensbezug', f'{col(column)}{row}'), expected, 'process mapping', row, column)
        if mapping[1].startswith('AG-'):
            require(new.value('Verfahrensbezug', f'G{row}') in ('open', 'blocked')
                    and new.value('Verfahrensbezug', f'H{row}') in (None, ''), 'AG process approval')
    for row, review in enumerate(model['reviews'], 7):
        for column, expected in enumerate(review, 1):
            same_value(new.value('Quellenprüfung', f'{col(column)}{row}'), serial(expected) if column == 4 else expected,
                       'review cell', row, column)
        require(new.value('Quellenprüfung', f'H{row}') == 'candidate', 'review is not a candidate')
    require(len({new.value('Quellenprüfung', f'A{row}') for row in range(7, 14)}) == 7, 'duplicate review ID')
    ag_jurisdiction_row = next(row for row in range(7, 34) if new.value('Gemeinwesen', f'A{row}') == 'CH-AG')
    require(new.value('Gemeinwesen', f'H{ag_jurisdiction_row}') == 'open', 'AG jurisdiction approval')

    # Check all saved calendar rows and independently enforce one date per scope.
    entries = checks['entries']
    require(len(entries) == 99 and len({(e['scopeId'], e['ruleId']) for e in entries}) == 99, 'calendar duplicate or row count')
    by_scope = Counter()
    scoped_dates = set()
    inherited_ag = 0
    scope_by_id = {scope[0]: scope for scope in model['scopes']}
    for row, entry in enumerate(entries, 7):
        rule, scope = rule_by_id[entry['ruleId']], scope_by_id[entry['scopeId']]
        expected = expected_date(rule, year)
        require(new.value('Feiertagskalender', f'A{row}') == expected, 'saved calendar date', row)
        weekday = (date(1899, 12, 30) + timedelta(days=expected)).weekday()
        require(new.value('Feiertagskalender', f'B{row}') == ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
                                                           'Freitag', 'Samstag', 'Sonntag'][weekday], 'saved weekday', row)
        require((entry['scopeId'], expected) not in scoped_dates, 'duplicated holiday effect', row)
        scoped_dates.add((entry['scopeId'], expected))
        by_scope[entry['scopeId']] += 1
        for column, value in [('C', scope[1]), ('D', scope[2]), ('E', rule['de']), ('F', rule['fr']),
                              ('I', rule['category']), ('K', rule['id']), ('L', rule['source']), ('M', rule['locator'])]:
            same_value(new.value('Feiertagskalender', f'{column}{row}'), value, 'calendar field', row, column)
        for column in ('G', 'H'):
            require(new.value('Feiertagskalender', f'{column}{row}') == 'Noch zu erfassen', 'missing language marker', row)
        is_ag = entry['scopeId'].startswith('AG-')
        require(new.value('Feiertagskalender', f'J{row}') == ('open' if is_ag else 'approved'), 'calendar status', row)
        inherited_ag += is_ag and rule['id'] == 'CH-CAL-HOL-NATIONAL-DAY'
    require(inherited_ag == 8 and by_scope['CH-ALL'] == 1 and by_scope['BE-ALL'] == 12
            and by_scope['AG-ZPO-ALL'] == 14, 'CH inheritance and procedural duplicate guard')
    require(len(by_scope) == 11 and all(count == 9 for scope, count in by_scope.items()
                                      if scope.startswith('AG-ARG-')), 'eight complete labour profiles')

    # New form inputs retain editability. Calendar output and computed fields stay protected.
    input_columns = {
        'Feiertagsregeln': set('DEFGJKLMNOPQR'),
        'Geltungsbereiche': set('DEF'),
        'Rechtsquellen': set('BCDFGHIJ'),
        'Verfahrensbezug': set(),
        'Quellenprüfung': set('BCDEFGHIJK'),
        'Gebietszuordnungen': set('ABCDEFGHIJKLMNOPQR'),
    }
    editable_new = 0
    for name, spec in specs.items():
        if name == 'Feiertagskalender':
            continue
        for row in range(spec['oldEnd'] + 1, spec['end'] + 1):
            for column in range(1, position(spec['last'] + '1')[0] + 1):
                address = f'{col(column)}{row}'
                editable = col(column) in input_columns[name]
                require(new.unlocked(name, address) == editable, 'new cell protection differs from input contract', name, address)
                editable_new += editable

    require(set(old.raw) == set(new.raw), 'unexpected package parts')
    allowed_parts = set(new.paths.values()) | set(new.tables) | {relation_path}
    for key in set(new.raw) - allowed_parts:
        require(old.raw[key] == new.raw[key], 'unexpected package mutation', key)
    for key, xml in new.xml.items():
        if key.endswith('.rels'):
            ids = [entry.get('Id') for entry in xml]
            require(len(ids) == len(set(ids)), 'duplicate relationship ID', key)
            for relationship in xml:
                if relationship.get('TargetMode') != 'External':
                    require(resolve_relationship(key, relationship.get('Target')) in new.raw,
                            'unresolved package relationship', key, relationship.get('Target'))
    require(not any('vbaProject' in key or 'externalLinks/' in key or key.endswith('connections.xml')
                    for key in new.raw), 'macro, external workbook link or data connection')
    return {'sourceSha256Unchanged': SOURCE_SHA, 'sha256': hashlib.sha256(FINAL.read_bytes()).hexdigest(),
            'sheets': 9, 'tables': 8, 'stylesByteIdentical': True, 'preservedCellsOutsideDeclaredPatches': preserved,
            'approvedBaselineRules': 12, 'baselineFormulaAndCacheCellsUnchanged': baseline_formula_caches,
            'openAgRules': 78, 'assignmentsOpenAndEditable': 29, 'calendarRows': 99,
            'agFederalInheritanceRowsOpen': inherited_ag, 'reviews': 7, 'oldReviewsUnchanged': 4,
            'sourceHyperlinks': 6, 'newEditableInputs': editable_new, 'savedFormulaCachesBySheet': dict(formulas),
            'savedFormulaCaches': sum(formulas.values()), 'nativeControlsPreserved': True,
            'independentSavedFileAudit': True, 'recalculatesExcel': False}


if __name__ == '__main__':
    print(json.dumps(main(), ensure_ascii=False))
