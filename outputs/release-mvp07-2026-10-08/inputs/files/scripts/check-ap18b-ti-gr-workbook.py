"""Independent, read-only native OOXML audit for the saved AP18B-02 workbook.

Only the JSON audit report is written. Neither workbook is mutated, recalculated,
imported into the application, or approved. Authoring receipts define permitted
edits but cannot waive independently enforced baseline and package invariants.
Run only after the final V0.7 workbook and its model/checks receipts are available.
"""
from collections import Counter
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
import hashlib
import json
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / '.work/ap18b-02-ti-gr'
SOURCE = ROOT / 'outputs/ap18b-01-ag-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.6.xlsx'
FINAL = ROOT / 'outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx'
SOURCE_SHA = 'b1c88de49b33a2e702d8387eef150b16791fa30bbc7ce465e01ee30adb3965b2'
REPORT = QA / 'independent-audit.json'
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'s': N}
SHEETS = ['Übersicht', 'Feiertagskalender', 'Gemeinwesen', 'Feiertagsregeln',
          'Geltungsbereiche', 'Gebietszuordnungen', 'Rechtsquellen', 'Verfahrensbezug', 'Quellenprüfung']
COUNTS = {'rules': 116, 'scopes': 13, 'sources': 17, 'mappings': 18, 'reviews': 18, 'assignments': 31}
ENDS = {'Feiertagsregeln': ('Z', 96, 122), 'Feiertagskalender': ('N', 105, 131),
        'Geltungsbereiche': ('M', 17, 19), 'Gebietszuordnungen': ('R', 35, 37),
        'Rechtsquellen': ('K', 12, 23), 'Verfahrensbezug': ('H', 17, 24), 'Quellenprüfung': ('K', 13, 24)}
NEW_SCOPES = {'TI-OFFICIAL-ALL': 15, 'GR-PUBLIC-ALL': 11}
ERRORS = {'#REF!', '#DIV/0!', '#VALUE!', '#NAME?', '#N/A', '#NUM!', '#NULL!', '#SPILL!', '#CALC!'}

# Independently specified 2027 calendar expectations, not imported from the seed.
TI_DATES_2027 = {'NEW-YEAR': '01-01', 'EPIPHANY': '01-06', 'ST-JOSEPH': '03-19',
                 'EASTER-MONDAY': '03-29', 'MAY1': '05-01', 'ASCENSION': '05-06',
                 'WHIT-MONDAY': '05-17', 'CORPUS-CHRISTI': '05-27', 'ST-PETER-PAUL': '06-29',
                 'NATIONAL-DAY': '08-01', 'ASSUMPTION': '08-15', 'ALL-SAINTS': '11-01',
                 'IMMACULATE-CONCEPTION': '12-08', 'CHRISTMAS': '12-25', 'ST-STEPHEN': '12-26'}
GR_DATES_2027 = {'NEW-YEAR': '01-01', 'GOOD-FRIDAY': '03-26', 'EASTER': '03-28',
                 'EASTER-MONDAY': '03-29', 'ASCENSION': '05-06', 'PENTECOST': '05-16',
                 'WHIT-MONDAY': '05-17', 'NATIONAL-DAY': '08-01', 'FEDERAL-FAST': '09-19',
                 'CHRISTMAS': '12-25', 'ST-STEPHEN': '12-26'}
EXPECTED_NEW_DATES = {f'{canton}-CAL-DAY-{key}': f'2027-{value}'
                      for canton, entries in [('TI', TI_DATES_2027), ('GR', GR_DATES_2027)]
                      for key, value in entries.items()}


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
    match = re.fullmatch(r'\$?([A-Z]+)\$?(\d+)', address)
    require(match is not None, 'invalid A1 address', address)
    number = 0
    for letter in match[1]:
        number = number * 26 + ord(letter) - 64
    return number, int(match[2])


def addresses(reference):
    result = set()
    for area in reference.split():
        ends = area.split(':')
        left, top = position(ends[0])
        right, bottom = position(ends[-1])
        require(left <= right and top <= bottom, 'invalid range', reference)
        result.update(f'{col(c)}{r}' for r in range(top, bottom + 1) for c in range(left, right + 1))
    return result


def resolve_relationship(part, target):
    parent = posixpath.dirname(posixpath.dirname(part))
    return target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(parent, target))


def relationship_part(part):
    return posixpath.dirname(part) + '/_rels/' + posixpath.basename(part) + '.rels'


class Book:
    def __init__(self, file):
        with zipfile.ZipFile(file) as archive:
            require(archive.testzip() is None, file.name, 'invalid ZIP CRC')
            require(len(archive.namelist()) == len(set(archive.namelist())), 'duplicate ZIP members')
            self.raw = {name: archive.read(name) for name in archive.namelist()}
        self.xml = {key: ET.fromstring(value) for key, value in self.raw.items()
                    if key.endswith(('.xml', '.rels'))}
        self.pool = [''.join(item.itertext()) for item in self.xml.get('xl/sharedStrings.xml', [])]
        rel_key = 'xl/_rels/workbook.xml.rels'
        rels = {item.get('Id'): resolve_relationship(rel_key, item.get('Target')) for item in self.xml[rel_key]}
        self.paths = {item.get('name'): rels[item.get('{' + R + '}id')]
                      for item in self.xml['xl/workbook.xml'].find('s:sheets', NS)}
        self.sheets = {name: self.xml[key] for name, key in self.paths.items()}
        self.cells = {name: {cell.get('r'): cell for cell in sheet.findall('s:sheetData/s:row/s:c', NS)}
                      for name, sheet in self.sheets.items()}
        self.styles = self.xml['xl/styles.xml'].find('s:cellXfs', NS)
        self.tables = {key: value for key, value in self.xml.items()
                       if key.startswith('xl/tables/') and key.endswith('.xml')}
        self.sheet_tables = {}
        for name, path in self.paths.items():
            rel_path = relationship_part(path)
            relations = {r.get('Id'): r for r in self.xml.get(rel_path, [])}
            ids = self.sheets[name].findall('s:tableParts/s:tablePart', NS)
            self.sheet_tables[name] = [resolve_relationship(rel_path, relations[item.get('{' + R + '}id')].get('Target'))
                                       for item in ids]

    def value(self, name, address):
        cell = self.cells[name].get(address)
        if cell is None:
            return None
        if cell.get('t') == 's':
            return self.pool[int(cell.find('s:v', NS).text)]
        if cell.get('t') == 'inlineStr':
            return ''.join(cell.find('s:is', NS).itertext())
        item = cell.find('s:v', NS)
        if item is None or item.text is None:
            return None
        if cell.get('t') in ('str', 'e', 'b', 'd'):
            return item.text
        number = float(item.text)
        return int(number) if number.is_integer() else number

    def unlocked(self, name, address):
        cell = self.cells[name].get(address)
        require(cell is not None, name, address, 'missing styled cell')
        protection = self.styles[int(cell.get('s', '0'))].find('s:protection', NS)
        return protection is not None and protection.get('locked') == '0'

    def row(self, name, row, count):
        return [self.value(name, f'{col(i)}{row}') for i in range(1, count + 1)]


def serial(value):
    return None if value in (None, '') else (date.fromisoformat(value) - date(1899, 12, 30)).days


def same_value(actual, expected, *context):
    require(actual == expected or actual in (None, '') and expected in (None, ''), *context, actual, expected)


def check_row(book, name, row, values):
    for column, expected in enumerate(values, 1):
        same_value(book.value(name, f'{col(column)}{row}'), expected, name, row, col(column))


def easter_sunday(year):
    # Gregorian computus, independent of the JS authoring implementation.
    a, b, c = year % 19, year // 100, year % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    n = h + l - 7 * m + 114
    return date(year, n // 31, n % 31 + 1)


def saved_parameter_date(book, row, year):
    name = 'Feiertagsregeln'
    kind = book.value(name, f'I{row}')
    if kind == 'fixedMonthDay':
        result = date(year, book.value(name, f'J{row}'), book.value(name, f'K{row}'))
    elif kind == 'easterOffsetDays':
        result = easter_sunday(year) + timedelta(days=book.value(name, f'L{row}'))
    elif kind == 'nthWeekdayOfMonth':
        first = date(year, book.value(name, f'J{row}'), 1)
        weekday, occurrence = book.value(name, f'M{row}'), book.value(name, f'N{row}')
        require(1 <= weekday <= 7 and 1 <= occurrence <= 5, 'invalid nth-weekday parameters', row)
        result = first + timedelta(days=(weekday - first.isoweekday()) % 7 + 7 * (occurrence - 1))
        require(result.month == first.month, 'weekday occurrence outside month', row)
    else:
        raise AssertionError(('unsupported calculation', row, kind))
    raw = serial(result.isoformat())
    start, end = book.value(name, f'O{row}'), book.value(name, f'P{row}')
    active = not (start is not None and raw < start or end is not None and raw > end)
    return raw, raw if active else None


def extend_sqref(reference, old_end, new_end):
    # Expand only a lower endpoint, never the upper/body anchor.
    parts = []
    for part in reference.split():
        ends = part.split(':')
        if len(ends) == 2 and position(ends[1])[1] == old_end:
            ends[1] = re.sub(r'\d+$', str(new_end), ends[1])
        parts.append(':'.join(ends))
    return ' '.join(parts)


def check_native(old, new, checks):
    require(list(old.paths) == list(new.paths) == SHEETS, 'nine sheets/order changed')
    require(old.raw['xl/styles.xml'] == new.raw['xl/styles.xml'], 'styles.xml not byte-identical')
    require(canonical(old.xml['xl/workbook.xml']) == canonical(new.xml['xl/workbook.xml']), 'workbook settings changed')
    require(set(old.tables) == set(new.tables) and len(new.tables) == 8, 'eight native tables not preserved')
    require(old.sheet_tables == new.sheet_tables, 'native sheet/table relationships changed')
    specs = {item['name']: item for item in checks['specs']}
    require(set(specs) == set(ENDS), 'unexpected resized table set')
    for name, (last, old_end, end) in ENDS.items():
        spec = specs[name]
        require((spec['last'], spec['oldEnd'], spec['end']) == (last, old_end, end), name, 'wrong range specification')
        require(len(new.sheet_tables[name]) == 1, name, 'expected one native table')
        key = new.sheet_tables[name][0]
        before, after = old.tables[key], new.tables[key]
        require(before.get('ref') == f'A6:{last}{old_end}', name, 'unexpected baseline extent')
        require(after.get('name') == spec['tableName'], name, 'table name mismatch')
        expected = deepcopy(before)
        expected.set('ref', f'A6:{last}{end}')
        expected.find('s:autoFilter', NS).set('ref', f'A6:{last}{end}')
        require(canonical(expected) == canonical(after), name, 'table/filter/column/style mutation')
    require(len(new.sheet_tables['Gemeinwesen']) == 1, 'jurisdiction native table missing')
    key = new.sheet_tables['Gemeinwesen'][0]
    require(canonical(old.tables[key]) == canonical(new.tables[key]), 'jurisdiction table changed')

    patches = {}
    for patch in checks['patches']:
        require(patch['name'] in new.paths, 'unknown patch sheet', patch['name'])
        patches.setdefault(patch['name'], set()).update(addresses(patch['range']))
    preserved, added, control_refs = 0, 0, []
    for name, before in old.sheets.items():
        after = new.sheets[name]
        require(before.attrib == after.attrib, name, 'worksheet attributes changed')
        for address, cell in old.cells[name].items():
            if address not in patches.get(name, set()):
                require(canonical(cell) == canonical(new.cells[name].get(address)), name, address, 'undeclared old-cell change')
                preserved += 1
        for address, cell in new.cells[name].items():
            if address not in old.cells[name] and (new.value(name, address) is not None or cell.find('s:f', NS) is not None):
                require(address in patches.get(name, set()), name, address, 'undeclared new populated cell')
                added += 1
        ignored = {'sheetData', 'dimension', 'dataValidations', 'conditionalFormatting', 'hyperlinks'}
        require([canonical(c) for c in before if c.tag.rsplit('}', 1)[-1] not in ignored]
                == [canonical(c) for c in after if c.tag.rsplit('}', 1)[-1] not in ignored], name, 'native worksheet feature changed')
        # Compare row metadata outside permitted rows, including heights and hidden state.
        after_rows = {r.get('r'): r for r in after.find('s:sheetData', NS)}
        patched_rows = {position(a)[1] for a in patches.get(name, set())}
        for row in before.find('s:sheetData', NS):
            if int(row.get('r')) not in patched_rows:
                require(row.attrib == after_rows[row.get('r')].attrib, name, row.get('r'), 'unrelated row metadata changed')
        for tag in ('dataValidations', 'conditionalFormatting'):
            before_controls, after_controls = before.findall('s:' + tag, NS), after.findall('s:' + tag, NS)
            require(len(before_controls) == len(after_controls), name, tag, 'native control count changed')
            for source_control, saved_control in zip(before_controls, after_controls):
                expected = deepcopy(source_control)
                controls = list(expected) if tag == 'dataValidations' else [expected]
                for control in controls:
                    if name in ENDS:
                        _, old_end, end = ENDS[name]
                        control.set('sqref', extend_sqref(control.get('sqref'), old_end, end))
                    control_refs.append({'sheet': name, 'kind': tag, 'sqref': control.get('sqref')})
                require(canonical(expected) == canonical(saved_control), name, tag, 'incorrect validation/CF extension')

    # Immutable islands override even overbroad patch permissions.
    islands = [('Feiertagsregeln', 7, 96, 26), ('Feiertagskalender', 7, 105, 14),
               ('Geltungsbereiche', 7, 17, 13), ('Rechtsquellen', 7, 12, 11),
               ('Verfahrensbezug', 7, 17, 8), ('Quellenprüfung', 7, 13, 11),
               ('Gebietszuordnungen', 7, 35, 18)]
    baseline_formulas = Counter()
    for name, first, last, width in islands:
        for row in range(first, last + 1):
            for column in range(1, width + 1):
                address = f'{col(column)}{row}'
                a, b = old.cells[name].get(address), new.cells[name].get(address)
                require(canonical(a) == canonical(b), name, address, 'protected baseline cell/formula/cache changed')
                baseline_formulas[name] += a is not None and a.find('s:f', NS) is not None
    for address in ('C15', 'C16'):
        require(new.value('Geltungsbereiche', address) == old.value('Geltungsbereiche', address)
                and 'Gemeinden ' in new.value('Geltungsbereiche', address), 'Rheinfelden concrete member label lost', address)

    source_rel = relationship_part(new.paths['Rechtsquellen'])
    require(set(old.raw) == set(new.raw), 'package parts added or removed')
    allowed_parts = set(new.paths.values()) | set(new.tables) | {source_rel}
    for key in set(new.raw) - allowed_parts:
        require(old.raw[key] == new.raw[key], 'unrelated package part changed', key)
    for key, xml in new.xml.items():
        if key.endswith('.rels'):
            ids = [entry.get('Id') for entry in xml]
            require(len(ids) == len(set(ids)), 'duplicate relationship IDs', key)
            for rel in xml:
                if rel.get('TargetMode') != 'External':
                    target = resolve_relationship(key, rel.get('Target')).split('#', 1)[0]
                    require(target in new.raw, 'unresolved package relationship', key, target)
    require(not any('vbaProject' in p or '/externalLinks/' in p or p == 'xl/connections.xml' for p in new.raw),
            'macro/external workbook link/data connection found')
    return {'preservedCellsOutsideDeclaredPatches': preserved, 'newPopulatedCells': added,
            'baselineFormulaCellsUnchanged': dict(baseline_formulas), 'nativeControlReferences': control_refs}


def check_data(old, new, checks, model):
    require(model['status'] == 'candidate' and model['baseline'] == '2026-08-31-mvp-03-approved.1', 'release boundary')
    require(model['packageId'] == 'AP18B-02-TI-GR', 'wrong model package')
    for field, count in COUNTS.items():
        require(len(model[field]) == count, 'wrong model count', field)
    year = new.value('Übersicht', 'B4')
    require(year == checks['originalYear'] == 2027, 'saved year not restored to 2027')
    rule_rows = {new.value('Feiertagsregeln', f'A{row}'): row for row in range(7, 123)}
    require(len(rule_rows) == 116 and None not in rule_rows, 'duplicate/empty saved rule IDs')
    new_rules = model['rules'][90:]
    require({r['id'] for r in new_rules} == set(EXPECTED_NEW_DATES), 'new rule membership')
    require(Counter(r['jurisdiction'] for r in new_rules) == {'CH-TI': 15, 'CH-GR': 11}, 'new canton counts')
    for row, rule in enumerate(model['rules'], 7):
        require(new.value('Feiertagsregeln', f'A{row}') == rule['id'], 'saved rule ordering', row)
        raw, active = saved_parameter_date(new, row, year)
        same_value(new.value('Feiertagsregeln', f'W{row}'), raw, 'independent saved raw date', row)
        same_value(new.value('Feiertagsregeln', f'X{row}'), active, 'independent saved active date', row)
        if row < 97:
            continue
        calc = rule['calculation']
        values = [rule['id'], rule['jurisdiction'], rule['scope'], rule['de'], rule['fr'], rule.get('it', ''), rule.get('rm', ''),
                  rule['category'], calc['type'], calc.get('month'), calc.get('day'), calc.get('offsetDays'),
                  calc.get('isoWeekday'), calc.get('occurrence'), serial(rule['from']), serial(rule['to']),
                  rule['priority'], rule['status'], rule['approvalBasis'], rule['action'], rule['target'], rule['exportClass']]
        check_row(new, 'Feiertagsregeln', row, values)
        for column, value in [('Y', rule['source']), ('Z', rule['locator'])]:
            same_value(new.value('Feiertagsregeln', f'{column}{row}'), value, 'rule source/locator', row)
        require(new.value('Feiertagsregeln', f'R{row}') == 'open'
                and new.value('Feiertagsregeln', f'S{row}') in (None, '')
                and new.value('Feiertagsregeln', f'V{row}') == 'blockedEffect', 'new rule activation/approval', rule['id'])
        require(active == serial(EXPECTED_NEW_DATES[rule['id']]), 'independent 2027 reference date', rule['id'])
    require(Counter(new.value('Feiertagsregeln', f'R{row}') for row in range(7, 123)) == {'approved': 12, 'open': 104}, 'saved rule status counts')

    source_ids = {s[0] for s in model['sources']}
    require(len(source_ids) == 17, 'duplicate source ID')
    rels = {item.get('Id'): item for item in new.xml[relationship_part(new.paths['Rechtsquellen'])]}
    links_list = new.sheets['Rechtsquellen'].findall('s:hyperlinks/s:hyperlink', NS)
    links = {item.get('ref'): item for item in links_list}
    require(len(links) == len(links_list) == 17, 'source hyperlink count/duplicates')
    require(checks['sourceUrls'] == [s[4] for s in model['sources']], 'receipt source URL ordering')
    for row, source in enumerate(model['sources'], 7):
        check_row(new, 'Rechtsquellen', row, source[:4] + ['Amtliche Quelle öffnen', serial(source[5]), serial(source[6])] + source[7:] + [source[4]])
        parsed = urlparse(source[4])
        require(parsed.scheme == 'https' and parsed.hostname and not parsed.username and not parsed.password, 'invalid source URL', row)
        rel = rels[links[f'E{row}'].get('{' + R + '}id')]
        require(rel.get('Target') == source[4] and rel.get('TargetMode') == 'External'
                and rel.get('Type') == R + '/hyperlink', 'source hyperlink target/type', row)
        if row >= 13:
            require(new.value('Rechtsquellen', f'I{row}') == 'open'
                    and new.value('Rechtsquellen', f'J{row}') in (None, ''), 'new source forged approval', row)
    require(new.value('Rechtsquellen', 'K11') == old.value('Rechtsquellen', 'K11'), 'hidden BJ URL changed')
    for rule in new_rules:
        require(rule['source'] in source_ids, 'orphan new rule source', rule['id'])

    for row, scope in enumerate(model['scopes'][11:], 18):
        labels = model['scopeLabels'][scope[0]]
        check_row(new, 'Geltungsbereiche', row, scope[:3] + [labels['fr'], labels['it'], labels['rm']]
                  + scope[3:8] + [serial(scope[8]), serial(scope[9])])
        require(new.value('Geltungsbereiche', f'K{row}') == 'open', 'new scope approval')
    fields = ['id', 'scopeId', 'areaId', 'de', 'fr', 'it', 'rm', 'areaType', 'parentAreaId', 'effect',
              'officialIdSystem', 'officialId', 'from', 'to', 'sourceId', 'locator', 'status', 'note']
    for row, assignment in enumerate(model['assignments'][29:], 36):
        check_row(new, 'Gebietszuordnungen', row, [serial(assignment[f]) if f in ('from', 'to') else assignment[f] for f in fields])
        require(new.value('Gebietszuordnungen', f'Q{row}') == 'open', 'new assignment approval')
    for row, mapping in enumerate(model['mappings'][11:], 18):
        check_row(new, 'Verfahrensbezug', row, mapping)
        require(new.value('Verfahrensbezug', f'G{row}') in ('open', 'blocked')
                and new.value('Verfahrensbezug', f'H{row}') in (None, ''), 'new mapping activation')
    mappings = {new.value('Verfahrensbezug', f'A{row}'): row for row in range(18, 25)}
    gr_note = new.value('Verfahrensbezug', f'E{mappings["MAP-GR-VRG-ART1"]}')
    require('Projektannahme' in gr_note and 'OF-008' in gr_note and 'keine automatische' in gr_note,
            'GR assumption/uncertainty not visible in process mapping')
    require(new.value('Verfahrensbezug', f'G{mappings["MAP-GR-VRG-ART2"]}') == 'blocked', 'GR Art.2 profile not blocked')
    for row, review in enumerate(model['reviews'][7:], 14):
        check_row(new, 'Quellenprüfung', row, [serial(v) if i == 3 else v for i, v in enumerate(review)])
        require(new.value('Quellenprüfung', f'H{row}') == 'candidate'
                and new.value('Quellenprüfung', f'F{row}') in (None, ''), 'review implies approval/old release', row)
    require(len({new.value('Quellenprüfung', f'A{r}') for r in range(7, 25)}) == 18, 'duplicate review IDs')
    for code in ('CH-TI', 'CH-GR'):
        row = next(r for r in range(7, 34) if new.value('Gemeinwesen', f'A{r}') == code)
        require(new.value('Gemeinwesen', f'H{row}') == 'open', 'jurisdiction approval', code)
        for column, language in [('D', 'it'), ('E', 'rm')]:
            same_value(new.value('Gemeinwesen', f'{column}{row}'), model['jurisdictionLabels'][code][language], 'jurisdiction label', code)

    entries = checks['entries']
    require(len(entries) == 125 and len({(e['scopeId'], e['ruleId']) for e in entries}) == 125, 'calendar membership/count duplicate')
    require(Counter(e['scopeId'] for e in entries[99:]) == NEW_SCOPES, 'new calendar profile counts')
    rule_model = {r['id']: r for r in model['rules']}
    scope_model = {s[0]: s for s in model['scopes']}
    dates_by_scope = set()
    for row, entry in enumerate(entries, 7):
        require(new.value('Feiertagskalender', f'K{row}') == entry['ruleId'], 'calendar rule ID/order', row)
        _, expected = saved_parameter_date(new, rule_rows[entry['ruleId']], year)
        same_value(new.value('Feiertagskalender', f'A{row}'), expected, 'independent calendar date', row)
        weekday = (date(1899, 12, 30) + timedelta(days=expected)).weekday()
        require(new.value('Feiertagskalender', f'B{row}') == ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][weekday], 'calendar weekday', row)
        require((entry['scopeId'], expected) not in dates_by_scope, 'duplicate date in same profile', row)
        dates_by_scope.add((entry['scopeId'], expected))
        if row < 106:
            continue
        rule, scope = rule_model[entry['ruleId']], scope_model[entry['scopeId']]
        for column, value in [('C', scope[1]), ('D', scope[2]), ('E', rule['de']), ('F', rule['fr']),
                              ('G', rule.get('it') or 'Noch zu erfassen'), ('H', rule.get('rm') or 'Noch zu erfassen'),
                              ('I', rule['category']), ('J', 'open'), ('L', rule['source']), ('M', rule['locator'])]:
            same_value(new.value('Feiertagskalender', f'{column}{row}'), value, 'new calendar field', row, column)
        require('offen' in str(new.value('Feiertagskalender', f'N{row}')).lower()
                or 'prüf' in str(new.value('Feiertagskalender', f'N{row}')).lower(), 'calendar boundary marker missing', row)
    for scope in NEW_SCOPES:
        require(sum(e['scopeId'] == scope and e['ruleId'].endswith('NATIONAL-DAY') for e in entries) == 1,
                'federal holiday duplicated within profile', scope)
    national_row = rule_rows['GR-CAL-DAY-NATIONAL-DAY']
    require(new.value('Feiertagsregeln', f'Y{national_row}') == 'SRC-BUNDESFEIERTAG-19940701'
            and new.value('Feiertagsregeln', f'R{national_row}') == 'open', 'GR CH application lost/open status inherited incorrectly')
    evidence = model['languageEvidenceDataset']
    require(len(evidence) == len({(e['ruleId'], e['language']) for e in evidence}) == 104, 'language evidence coverage')
    for entry in evidence:
        rule = rule_model[entry['ruleId']]
        same_value(rule.get(entry['language']), entry['value'], 'language evidence value', entry['ruleId'])
        if entry['sourceId']:
            require(entry['sourceId'] in source_ids, 'language source absent from native source list', entry['sourceId'])
        if entry['kind'] == 'notYetVerified':
            require(entry['value'] in (None, ''), 'unverified language invented')
    require(sum(not r.get('rm') for r in new_rules) == 8, 'expected eight open TI-specific RM names')
    boundary = model['procedureBoundaries']['gr']
    require(boundary['openQuestionId'] == 'OF-008' and not any(boundary[k] for k in
            ['article2AuthoritiesIncluded', 'localHolidaysCollected', 'localHolidaysLegallyExcluded',
             'territorialDeadlineEffectResolved', 'inheritedByOtherProcedures', 'runtimeEnabled']), 'GR boundary weakened')
    return {'savedYear': year, 'independentRuleDateCaches': 116, 'independentCalendarDatesAndWeekdays': 125,
            'independentNew2027ReferenceDates': 26, 'sourceHyperlinks': len(links), 'languageEvidenceValues': 104,
            'unverifiedTiRomanshNamesRemainBlank': 8, 'openTiRules': 15, 'openGrRules': 11,
            'grFederalApplicationOpen': True, 'grLocalDeadlineEffectUnresolved': True}


def check_caches_and_protection(old, new):
    formulas = Counter()
    for name, cells in new.cells.items():
        for address, cell in cells.items():
            value = new.value(name, address)
            require(cell.get('t') != 'e' and not (isinstance(value, str) and value in ERRORS), name, address, 'saved formula error')
            if cell.find('s:f', NS) is not None:
                require(not new.unlocked(name, address), name, address, 'formula unlocked')
                require(cell.find('s:v', NS) is not None and value is not None, name, address, 'formula cache absent')
                formulas[name] += 1
    editable = 0
    for name, (last, old_end, end) in ENDS.items():
        for row in range(old_end + 1, end + 1):
            template = old_end if row % 2 == old_end % 2 else old_end - 1
            for column in range(1, position(last + '1')[0] + 1):
                address, reference = f'{col(column)}{row}', f'{col(column)}{template}'
                require(new.unlocked(name, address) == old.unlocked(name, reference), name, address, 'new input/formula protection not as baseline')
                editable += new.unlocked(name, address)
    return {'savedFormulaCachesBySheet': dict(formulas), 'savedFormulaCaches': sum(formulas.values()),
            'newCellsEditableAsBaseline': editable, 'allFormulaCellsProtected': True}


def main():
    require(SOURCE.is_file() and FINAL.is_file(), 'source/final workbook missing')
    require(hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA, 'V0.6 baseline hash changed')
    checks = json.loads((QA / 'checks.json').read_text())
    model = json.loads((QA / 'model.json').read_text())
    require(Path(checks['source']) == SOURCE and Path(checks['file']) == FINAL, 'unexpected receipt target')
    require(checks.get('sourceSha256') == SOURCE_SHA and checks['workbookRevision'] == '0.7'
            and checks['contract'] == '0.4.0', 'revision/source/contract mismatch')
    before_hash = hashlib.sha256(FINAL.read_bytes()).hexdigest()
    old, new = Book(SOURCE), Book(FINAL)
    native = check_native(old, new, checks)
    data = check_data(old, new, checks, model)
    caches = check_caches_and_protection(old, new)
    require(hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA
            and hashlib.sha256(FINAL.read_bytes()).hexdigest() == before_hash, 'workbooks changed during audit')
    return {'status': 'passed', 'auditedAtUtc': datetime.now(timezone.utc).isoformat(),
            'source': str(SOURCE), 'file': str(FINAL), 'sourceSha256Unchanged': SOURCE_SHA, 'sha256': before_hash,
            'independentSavedFileAudit': True, 'sheets': 9, 'nativeTables': 8, 'stylesByteIdentical': True,
            'oldRulesUnchanged': 90, 'oldCalendarRowsUnchanged': 99, 'oldSourceRowsUnchanged': 6,
            'oldReviewRowsUnchanged': 7, 'rheinfeldenMemberLabelsPreserved': ['C15', 'C16'],
            'rules': 116, 'calendarRows': 125, 'sources': 17, 'reviews': 18, 'assignments': 31,
            **native, **data, **caches,
            'limitations': ['Read-only native ZIP/XML and saved-cache audit, no Excel recalculation or UI test.',
                            'Does not confer legal, source, data, model or production approval.',
                            '2028 projections are not claimed as individually verified official annual dates.',
                            'HTTPS hyperlink structure/target checked, not network availability.',
                            'Visual QA and saved-file reimport/input-change tests are separate checks.'],
            'recalculatesExcel': False, 'mutatesWorkbook': False, 'approvesData': False}


if __name__ == '__main__':
    try:
        audit = main()
    except Exception as error:
        audit = {'status': 'failed', 'auditedAtUtc': datetime.now(timezone.utc).isoformat(),
                 'errorType': type(error).__name__, 'error': str(error),
                 'independentSavedFileAudit': True, 'mutatesWorkbook': False, 'approvesData': False}
        if FINAL.is_file():
            audit['sha256'] = hashlib.sha256(FINAL.read_bytes()).hexdigest()
        QA.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(audit, ensure_ascii=False))
        sys.exit(1)
    QA.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(audit, ensure_ascii=False))
