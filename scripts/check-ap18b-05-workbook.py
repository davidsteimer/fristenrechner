"""Independent, read-only saved-OOXML audit of AP18B-05 / V0.12.

Uses the standard library and the existing bounded formula reader only.
No author model or receipt is imported. Only the audit JSON is written.
"""
import argparse
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
import json
from pathlib import Path
import re
import runpy
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
H = runpy.run_path(str(ROOT / 'scripts/check-ap18b-03-workbook.py'))
Book, Evaluator = H['Book'], H['Evaluator']
easter, parameter_date, canonical, dv_map = (H[k] for k in ('easter', 'parameter_date', 'canonical', 'dv_map'))
require, digest, same, col, position, addresses = (H[k] for k in ('require', 'digest', 'same', 'col', 'position', 'addresses'))
NS, TAG, EPOCH, SHEETS = (H[k] for k in ('NS', 'TAG', 'EPOCH', 'SHEETS'))
SOURCE = ROOT / 'outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.11.xlsx'
SOURCE_SHA = '37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd'
TARGET = ROOT / 'outputs/ap18b-05-bedingte-feiertage-2026-09-22/2026-09-22_Feiertagsmatrix_Schweiz_AP18B-05_V0.12.xlsx'
REPORT = ROOT / '.work/ap18b-05/independent-audit.json'
RULES, CALENDAR = 'Feiertagsregeln', 'Feiertagskalender'
CONDITIONS = ('Immer', 'Nicht Dienstag/Samstag', 'Nur Montag', 'Gründonnerstag + 7 Tage')
SPECS = {RULES: (480, 485, 28), CALENDAR: (489, 494, 15), 'Quellenprüfung': (91, 96, 11)}
NEW = {
    481: ('AR-ARG-ALL-DAY-ST-STEPHEN', 'CH-AR', 'AR-ARG-ALL', 'labourLawHoliday',
          ('fixedMonthDay', 12, 26, None, None, None), 'Nicht Dienstag/Samstag', 'SRC-AR-ARGV-82211-V1058'),
    482: ('AI-RTG-ALL-DAY-ST-STEPHEN', 'CH-AI', 'AI-RTG-ALL', 'publicHoliday',
          ('fixedMonthDay', 12, 26, None, None, None), 'Nicht Dienstag/Samstag', 'SRC-AI-RTG-822200-V1327'),
    483: ('GL-RTG-ALL-DAY-NAEFELSER-FAHRT', 'CH-GL', 'GL-RTG-ALL', 'publicHoliday',
          ('nthWeekdayOfMonth', 4, None, None, 4, 1), 'Gründonnerstag + 7 Tage', 'SRC-GL-RTG-IXB211-20190701'),
    484: ('NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE', 'CH-NE', 'NE-LDJF-BASE', 'publicHoliday',
          ('fixedMonthDay', 1, 2, None, None, None), 'Nur Montag', 'SRC-NE-LDJF-94102-20100101'),
    485: ('NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE', 'CH-NE', 'NE-LDJF-BASE', 'publicHoliday',
          ('fixedMonthDay', 12, 26, None, None, None), 'Nur Montag', 'SRC-NE-LDJF-94102-20100101'),
}
SCOPE_LABELS = {
    'AR-ARG-ALL': 'Appenzell Ausserrhoden, Arbeitsfeiertage mit bedingtem Stephanstag',
    'AI-RTG-ALL': 'Appenzell Innerrhoden, kantonsweite RTG-Tage mit bedingtem Stephanstag',
    'NE-LDJF-BASE': 'Neuenburg, allgemeine Grundliste mit bedingten Ersatzfeiertagen',
}


def row_ids(book, sheet):
    ids = {book.value(sheet, f'A{r}'): r for r in range(7, book.end(sheet) + 1)}
    require(len(ids) == book.end(sheet) - 6 and all(ids), 'duplicate or blank IDs', sheet)
    return ids


def native(old, new):
    require(list(old.paths) == list(new.paths) == SHEETS, 'nine sheets/order required')
    require(set(old.raw) == set(new.raw), 'package members changed')
    require(old.raw['xl/styles.xml'] == new.raw['xl/styles.xml'], 'styles changed')
    require(old.raw['xl/workbook.xml'] == new.raw['xl/workbook.xml'], 'workbook settings changed')
    require(len(new.tables) == 8, 'eight tables required')
    allowed = set(new.paths.values()) | {new.tables[n][0] for n in SPECS}
    for part in old.raw:
        if part not in allowed:
            require(old.raw[part] == new.raw[part], 'unrelated package part changed', part)
    for name, (part, table) in new.tables.items():
        oldpart, original = old.tables[name]
        require(oldpart == part, 'table relationship changed', name)
        expected = deepcopy(original)
        if name in SPECS:
            previous, end, width = SPECS[name]
            require(old.end(name) == previous and new.end(name) == end, 'table row contract', name)
            expected.set('ref', f'A6:{col(width)}{end}')
            expected.find('s:autoFilter', NS).set('ref', expected.get('ref'))
            if name == RULES:
                cols = expected.find('s:tableColumns', NS)
                require(len(cols) == 27, 'source rule width')
                ET.SubElement(cols, TAG + 'tableColumn', {'id': '28', 'name': 'Kalenderbedingung'})
                cols.set('count', '28')
        require(canonical(expected) == canonical(table), 'native table metadata changed', name)
        for i, item in enumerate(table.find('s:tableColumns', NS), 1):
            same(new.value(name, f'{col(i)}6'), item.get('name'), 'native table/header mismatch', name, i)
    for name in SHEETS:
        a, b = old.sheets[name], new.sheets[name]
        excluded = {'sheetData', 'dimension', 'cols', 'dataValidations', 'conditionalFormatting'}
        require([canonical(e) for e in a if e.tag.split('}')[-1] not in excluded]
                == [canonical(e) for e in b if e.tag.split('}')[-1] not in excluded], 'native sheet feature changed', name)
        old_end, end = SPECS[name][:2] if name in SPECS else (0, 0)
        cf = deepcopy(a.findall('s:conditionalFormatting', NS))
        for item in cf:
            item.set('sqref', H['extension'](item.get('sqref'), old_end, end))
        require([canonical(e) for e in cf] == [canonical(e) for e in b.findall('s:conditionalFormatting', NS)],
                'conditional formatting changed beyond row extension', name)
        dv = deepcopy(a)
        for item in dv.findall('s:dataValidations/s:dataValidation', NS):
            item.set('sqref', H['extension'](item.get('sqref'), old_end, end))
        before, after = dv_map(dv), dv_map(b)
        if name == RULES:
            require(before == {k: v for k, v in after.items() if position(k)[0] != 28},
                    'existing validations changed')
            require({k for k in after if position(k)[0] == 28} == addresses('AB7:AB485'), 'AB validation coverage')
            rules = [d for d in b.findall('s:dataValidations/s:dataValidation', NS)
                     if addresses(d.get('sqref')).intersection(addresses('AB7:AB485'))]
            require(len(rules) == 1, 'condition validation must be a single list')
            d = rules[0]
            require(d.get('type') == 'list' and d.get('errorStyle', 'stop') == 'stop'
                    and d.get('showErrorMessage') in ('1', 'true') and bool(d.get('error')), 'AB stop list required')
            require(d.findtext('s:formula1', namespaces=NS) == '"' + ','.join(CONDITIONS) + '"', 'condition list differs')
        else:
            require(before == after, 'unrelated validation changed', name)
        def widths(sheet):
            return {i: {k: v for k, v in c.attrib.items() if k not in ('min', 'max')}
                    for c in sheet.findall('s:cols/s:col', NS)
                    for i in range(int(c.get('min')), int(c.get('max')) + 1)}
        ca, cb = widths(a), widths(b)
        if name == RULES:
            require(float(cb[28]['width']) == 38, 'condition width')
            ca.pop(28, None)
            cb.pop(28, None)
        require(ca == cb, 'unrelated column dimensions changed', name)
        old_rows = {int(r.get('r')): r for r in a.findall('s:sheetData/s:row', NS)}
        new_rows = {int(r.get('r')): r for r in b.findall('s:sheetData/s:row', NS)}
        for r in old_rows:
            if name in SPECS and SPECS[name][0] < r <= SPECS[name][1]:
                continue
            require(old_rows[r].attrib == new_rows[r].attrib, 'existing row dimensions changed', name, r)
        if name == 'Quellenprüfung':
            require(all(float(new_rows[r].get('ht', '0')) == 118 for r in range(92, 97)), 'review row heights')


def allowed_text_changes(old):
    allowed = {'Übersicht': {'A6', 'A8', 'A9', 'A19', 'A30', 'A31', 'A36', 'D24'},
               CALENDAR: {'A4'}, 'Quellenprüfung': {'A4'}}
    def add(sheet, ids, columns):
        index = row_ids(old, sheet)
        for key in ids:
            require(key in index, 'expected baseline ID missing', sheet, key)
            allowed.setdefault(sheet, set()).update(f'{c}{index[key]}' for c in columns)
    add('Geltungsbereiche', SCOPE_LABELS, ['C'])
    add('Geltungsbereiche', ['NE-LDJF-BASE'], ['D', 'E', 'F'])
    add('Geltungsbereiche', ['AR-ARG-ALL', 'AI-RTG-ALL', 'GL-RTG-ALL', 'NE-LDJF-BASE', 'NE-LPA-ADDITIONAL'], ['H'])
    add('Rechtsquellen', ['SRC-AR-ARGV-82211-V1058', 'SRC-AI-RTG-822200-V1327', 'SRC-AI-RUHETAGE-LISTE-2026',
        'SRC-AI-STK-FEIERTAGE-20150929', 'SRC-GL-RTG-IXB211-20190701', 'SRC-GL-FAHRT-RR-20260106',
        'SRC-NE-LDJF-94102-20100101', 'SRC-NE-RDF-152512-20230101'], ['H', 'G'])
    add('Verfahrensbezug', ['MAP-AP18B04-AR-STEPHAN-CONDITION', 'MAP-AP18B04-AI-STEPHAN-CONDITION',
        'MAP-GL-FAHRT-GAP', 'MAP-NE-PENDING-SUNDAY-SUBSTITUTION', 'MAP-NE-PENDING-COMPENSATION'], ['D', 'E'])
    add('Verfahrensbezug', ['MAP-AR-ARG-ALL', 'MAP-AI-RTG-ALL', 'MAP-GL-RTG-ALL-REST', 'MAP-GL-RTG-ALL-LABOUR'], ['E'])
    add('Gemeinwesen', ['CH-AR', 'CH-AI', 'CH-GL', 'CH-NE'], ['G'])
    return allowed


def preservation(old, new):
    allowed = allowed_text_changes(old)
    rule_ids = row_ids(old, RULES)
    preserved = 0
    for name in SHEETS:
        for address in new.cells[name].keys() - old.cells[name].keys():
            c, r = position(address)
            ok = name == RULES and c == 28 and 6 <= r <= 485
            ok |= name in SPECS and 1 <= c <= SPECS[name][2] and SPECS[name][0] < r <= SPECS[name][1]
            ok |= address in allowed.get(name, set())
            require(ok, 'undeclared inserted cell', name, address)
        for address, before in old.cells[name].items():
            c, r = position(address)
            after = new.cells[name].get(address)
            require(after is not None, 'source cell removed', name, address)
            if name == RULES and c == 28 and 6 <= r <= 480:
                continue
            appended = name in SPECS and SPECS[name][0] < r <= SPECS[name][1] and c <= SPECS[name][2]
            if appended:
                require(old.value(name, address) in (None, '') and not old.formula(name, address),
                        'append overwrites original content', name, address)
                continue
            require(before.get('s', '0') == after.get('s', '0'), 'existing style changed', name, address)
            if name == RULES and c == 24 and 7 <= r <= 480:
                same(new.value(name, address), old.value(name, address), 'legacy effective date cache changed', address)
                continue
            if name == CALENDAR and 7 <= r <= 489:
                if c == 4:
                    key = old.value(name, f'K{r}')
                    scope = old.value(RULES, f'C{rule_ids[key]}')
                    if scope in SCOPE_LABELS:
                        same(new.value(name, address), SCOPE_LABELS[scope], 'updated scope label', address)
                        continue
                formula = old.formula(name, address)
                expected = formula.replace('$480', '$485') if formula else None
                require(new.formula(name, address) == expected, 'calendar formula changed beyond rule-bound extension', address)
                same(new.value(name, address), old.value(name, address), 'legacy calendar value changed', address)
                preserved += 1
                continue
            if name == 'Übersicht' and address == 'B26':
                require(new.formula(name, address) == old.formula(name, address).replace('$480', '$485'), 'open-count formula')
                continue
            if address in allowed.get(name, set()):
                require(new.formula(name, address) is None, 'metadata replacement became a formula', name, address)
                value = new.value(name, address)
                if name == 'Rechtsquellen' and c == 7:
                    same(value, (date(2026, 9, 22) - EPOCH).days, 'review timestamp', address)
                else:
                    require(isinstance(value, str) and value.strip(), 'metadata text missing', name, address)
                continue
            same(new.value(name, address), old.value(name, address), 'unexpected original value change', name, address)
            require(canonical(before.find('s:f', NS)) == canonical(after.find('s:f', NS)), 'unexpected original formula change', name, address)
            preserved += 1
    return preserved


def data_contract(old, new):
    require(new.value('Übersicht', 'B4') == 2027 and not new.locked('Übersicht', 'B4'), 'year selector contract')
    require('0.6.0' in new.value('Übersicht', 'A36') and 'Kandidat' in new.value('Übersicht', 'A36'), 'candidate contract marker')
    require(new.value(RULES, 'AB6') == 'Kalenderbedingung', 'condition header')
    ids = row_ids(new, RULES)
    require(len(ids) == 479, '479 rules required')
    require({new.value(RULES, f'B{r}') for r in ids.values()} ==
            {old.value(RULES, f'B{r}') for r in range(7, 481)}, 'jurisdiction set changed')
    for r in range(7, 486):
        labels = new.row(RULES, r, 7)[3:7]
        require(all(isinstance(x, str) and x.strip() for x in labels), 'four language labels required', r)
        require(new.locked(RULES, f'AB{r}') == new.locked(RULES, f'AA{r}'), 'condition input/reference protection', r)
        require(new.cells[RULES][f'AB{r}'].get('s', '0') == new.cells[RULES][f'AA{r}'].get('s', '0'), 'condition style', r)
        if r <= 480:
            require(new.value(RULES, f'AB{r}') == 'Immer', 'legacy rule condition not neutral', r)
    for r, (key, jurisdiction, scope, category, params, condition, source) in NEW.items():
        require(new.row(RULES, r, 3) == [key, jurisdiction, scope], 'new rule identity', r)
        require(new.value(RULES, f'H{r}') == category, 'new rule category', r)
        for c, v in zip('IJKLMN', params):
            same(new.value(RULES, f'{c}{r}'), v, 'new parameter', r, c)
        require(new.value(RULES, f'AB{r}') == condition, 'new condition', r)
        require(new.value(RULES, f'Y{r}') == source and bool(new.value(RULES, f'Z{r}')), 'new rule provenance', r)
        expected = [(date(2026, 1, 1) - EPOCH).days, None, 100, 'open', None, 'add', None, 'blockedEffect']
        for c, value in zip('OPQRSTUV', expected):
            same(new.value(RULES, f'{c}{r}'), value, 'new rule status/validity', r, c)
        require(new.value(RULES, f'AA{r}') == 'Ganztägig', 'new day extent')
    review_ids = ['AR', 'AI', 'GL', 'NE-SUBSTITUTE', 'NE-RESERVE']
    for r, suffix in enumerate(review_ids, 92):
        require(new.value('Quellenprüfung', f'A{r}') == f'AP18B05-{suffix}-20260922', 'review identity')
        require(new.value('Quellenprüfung', f'D{r}') == (date(2026, 9, 22) - EPOCH).days, 'review date')
        require(new.value('Quellenprüfung', f'H{r}') == 'candidate', 'review not candidate')
        require(new.value('Quellenprüfung', f'I{r}') == 'David Steimer', 'expert identity')
        require(new.value('Quellenprüfung', f'E{r}') == 'unchanged', 'review enum must remain supported')
        require(new.value('Quellenprüfung', f'G{r}').startswith('Normgrundlage unverändert.'), 'review norm/decision distinction')
    ne = [r for r in range(7, 481) if old.value(RULES, f'C{r}') == 'NE-LPA-ADDITIONAL']
    landeron = [r for r in range(7, 481) if old.value(RULES, f'C{r}') == 'NE-LANDERON-ADDITIONAL']
    require(len(ne) == 8 and len(landeron) == 1, 'NE reference profile counts')
    for r in ne + landeron:
        for c in list(range(1, 24)) + [25, 26, 27]:
            same(new.value(RULES, f'{col(c)}{r}'), old.value(RULES, f'{col(c)}{r}'), 'NE reference rule changed', r, c)
    return ids


def new_list_inputs(book):
    checked = 0
    ranges = {RULES: addresses('A481:AB485') | addresses('AB7:AB480'),
              CALENDAR: addresses('A490:O494'), 'Quellenprüfung': addresses('A92:K96')}
    for name, selected in ranges.items():
        for validation in book.sheets[name].findall('s:dataValidations/s:dataValidation', NS):
            cells = addresses(validation.get('sqref')).intersection(selected)
            if not cells or validation.get('type') != 'list':
                continue
            expression = validation.findtext('s:formula1', default='', namespaces=NS)
            require(expression.startswith('"') and expression.endswith('"'),
                    'unsupported new input list reference', name, expression)
            options = expression[1:-1].split(',')
            for address in cells:
                value = book.value(name, address)
                if value in (None, ''):
                    continue
                require(str(value) in options, 'new value absent from native dropdown', name, address, value, options)
                checked += 1
    return checked


def independent_condition_date(book, r, year):
    raw, old_valid = parameter_date(book, r, year)
    if r < 481:
        return raw, old_valid
    day = EPOCH + timedelta(days=raw)
    if r in (481, 482):
        # Legal AR expression tests Christmas itself, independently of AB's label.
        absent = date(year, 12, 25).isoweekday() in (1, 5)
    elif r in (484, 485):
        absent = (day - timedelta(days=1)).isoweekday() != 7
    else:
        absent = False
        # Independent interval test, not the builder's equality to Easter minus 3.
        holy_monday, holy_saturday = easter(year) - timedelta(days=6), easter(year) - timedelta(days=1)
        if holy_monday <= day <= holy_saturday:
            day += timedelta(days=7)
    if absent:
        return raw, 'Entfällt'
    effective = (day - EPOCH).days
    start, end = book.value(RULES, f'O{r}'), book.value(RULES, f'P{r}')
    return raw, effective if start <= effective and (end in (None, '') or effective <= end) else 'Ausserhalb Geltung'


def dates(book, ids):
    comparisons = 0
    for year in (2026, 2027, 2028):
        ev = Evaluator(book, year)
        require(ev.cell(RULES, 'AD23') == (easter(year) - EPOCH).days, 'Easter helper mismatch', year)
        for r in ids.values():
            raw, expected = independent_condition_date(book, r, year)
            for c, value in [('W', raw), ('X', expected)]:
                require(book.formula(RULES, f'{c}{r}'), 'date formula missing', r, c)
                same(ev.cell(RULES, f'{c}{r}'), value, 'actual formula/oracle mismatch', year, r, c)
                if year == 2027:
                    same(book.value(RULES, f'{c}{r}'), value, 'saved date cache mismatch', r, c)
                comparisons += 1
    for r in range(7, 495):
        key = book.value(CALENDAR, f'K{r}')
        require(key in ids, 'calendar orphan', r)
        origin = ids[key]
        expected = independent_condition_date(book, origin, 2027)[1]
        same(book.value(CALENDAR, f'A{r}'), expected, 'calendar effective date cache', r)
        for dest, source in [('A', 'X'), ('E', 'D'), ('F', 'E'), ('I', 'H'), ('L', 'Y'), ('M', 'Z'), ('O', 'AA')]:
            expression = f"INDEX('Feiertagsregeln'!${source}$7:${source}$485,MATCH($K{r},'Feiertagsregeln'!$A$7:$A$485,0))"
            require(book.formula(CALENDAR, f'{dest}{r}') == expression, 'calendar saved lookup', r, dest)
            same(book.value(CALENDAR, f'{dest}{r}'), book.value(RULES, f'{source}{origin}'), 'calendar lookup cache', r, dest)
        for dest, source in [('G', 'F'), ('H', 'G')]:
            expression = f"INDEX('Feiertagsregeln'!${source}$7:${source}$485,MATCH($K{r},'Feiertagsregeln'!$A$7:$A$485,0))"
            require(book.formula(CALENDAR, f'{dest}{r}') == f'IF({expression}="","Noch zu erfassen",{expression})', 'calendar language lookup', r)
            same(book.value(CALENDAR, f'{dest}{r}'), book.value(RULES, f'{source}{origin}'), 'calendar language cache', r)
        weekday = 'n.a.' if isinstance(expected, str) else ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][(EPOCH + timedelta(days=expected)).weekday()]
        if not isinstance(expected, str) and book.value(RULES, f'AA{origin}') == 'Ab 12.00 Uhr':
            weekday += ', ab 12.00 Uhr'
        same(book.value(CALENDAR, f'B{r}'), weekday, 'calendar weekday cache', r)
        if r >= 490:
            require(key == NEW[r - 9][0] and book.value(CALENDAR, f'J{r}') == 'open', 'new calendar identity/status', r)
    return comparisons


def isolated_year_probes(book):
    """Only an evaluator cache is overridden. No saved year or XML is changed."""
    count = 0
    observed = {}
    for year in range(2000, 2400):
        ev = Evaluator(book, year)
        for r in NEW:
            raw, expected = independent_condition_date(book, r, year)
            ev.cache[(RULES, f'W{r}')] = raw
            actual = ev.cell(RULES, f'X{r}')
            same(actual, expected, 'conditional formula isolated-year mismatch', r, year)
            if year in (2022, 2023, 2026, 2027, 2028, 2029, 2030, 2031, 2033, 2034):
                observed[f'{year}:{r}'] = actual
            count += 1
    seven = {2033: 1, 2028: 2, 2029: 3, 2030: 4, 2031: 5, 2026: 6, 2027: 7}
    for year, weekday in seven.items():
        expected = 'Entfällt' if weekday in (2, 6) else (date(year, 12, 26) - EPOCH).days
        for r in (481, 482):
            same(observed[f'{year}:{r}'], expected, 'AR/AI seven-weekday reference', year, r)
    require(observed['2034:484'] == (date(2034, 1, 2) - EPOCH).days, 'positive NE New Year replacement')
    require(observed['2033:485'] == (date(2033, 12, 26) - EPOCH).days, 'positive NE Christmas replacement')
    require(observed['2023:484'] == observed['2022:485'] == 'Ausserhalb Geltung', 'no historical scope expansion')
    for year, result in [(2026, '2026-04-09'), (2027, '2027-04-01'), (2028, '2028-04-06')]:
        same(observed[f'{year}:483'], (date.fromisoformat(result) - EPOCH).days, 'GL reference', year)
    for start, end, wanted in [('2026-04-09', '2026-04-09', (date(2026, 4, 9) - EPOCH).days),
                               ('2026-04-02', '2026-04-08', 'Ausserhalb Geltung')]:
        ev = Evaluator(book, 2026)
        ev.cache[(RULES, 'O483')] = (date.fromisoformat(start) - EPOCH).days
        ev.cache[(RULES, 'P483')] = (date.fromisoformat(end) - EPOCH).days
        same(ev.cell(RULES, 'X483'), wanted, 'GL effective-date validity boundary')
    return count, {'arAiAllSevenWeekdays': True, 'glarus2026': '2026-04-09', 'glarus2027': '2027-04-01',
                   'nePositiveNewYear': '2034-01-02', 'nePositiveChristmas': '2033-12-26',
                   'ne2022And2023RemainOutsideValidity': True, 'effectiveDateValidityBoundaryChecks': 2}


def negative_tests(old, book, ids):
    passed = []
    def reject(label, mutate, check):
        damaged = deepcopy(book)
        mutate(damaged)
        try:
            check(damaged)
        except (AssertionError, H['FormulaError']):
            passed.append(label)
        else:
            raise AssertionError(('negative self-test missed corruption', label))
    def change_text(b, sheet, address, text):
        cell = b.cells[sheet][address]
        cell.set('t', 'inlineStr')
        for child in list(cell):
            cell.remove(child)
        ET.SubElement(ET.SubElement(cell, TAG + 'is'), TAG + 't').text = text
    reject('condition column table metadata', lambda b: b.tables[RULES][1].set('ref', 'A6:AA485'), lambda b: native(old, b))
    reject('old raw formula modified', lambda b: setattr(b.cells[RULES]['W7'].find('s:f', NS), 'text', 'DATE(2027,1,1)'), lambda b: preservation(old, b))
    reject('AR 2026 wrongly present', lambda b: setattr(b.cells[RULES]['X481'].find('s:f', NS), 'text', 'W481'), lambda b: dates(b, ids))
    reject('GL shift missing', lambda b: setattr(b.cells[RULES]['X483'].find('s:f', NS), 'text', 'W483'), lambda b: dates(b, ids))
    reject('positive NE replaced by permanent absence', lambda b: setattr(b.cells[RULES]['X484'].find('s:f', NS), 'text', '"Entfällt"'), isolated_year_probes)
    reject('old review overwritten', lambda b: change_text(b, 'Quellenprüfung', 'G91', 'Replaced'), lambda b: preservation(old, b))
    reject('provisional language overwritten', lambda b: change_text(b, RULES, 'G448', 'Replaced'), lambda b: preservation(old, b))
    def invalid_condition(b):
        d = next(v for v in b.sheets[RULES].findall('s:dataValidations/s:dataValidation', NS) if v.get('sqref') == 'AB7:AB485')
        d.set('errorStyle', 'warning')
    reject('weak condition validation', invalid_condition, lambda b: native(old, b))
    reject('unsupported source-review enum', lambda b: change_text(b, 'Quellenprüfung', 'E92', 'ruleConfirmed'), new_list_inputs)
    return passed


def audit(file):
    require(digest(SOURCE) == SOURCE_SHA, 'immutable V0.11 SHA mismatch')
    target_sha = digest(file)
    old, new = Book(SOURCE), Book(file)
    native(old, new)
    preserved = preservation(old, new)
    ids = data_contract(old, new)
    list_inputs = new_list_inputs(new)
    comparisons = dates(new, ids)
    probes, spots = isolated_year_probes(new)
    protected = H['check_package_safety'](new)
    require(new.end('Rechtsquellen') == 90, '84 source rows required')
    negative = negative_tests(old, new, ids)
    require(digest(SOURCE) == SOURCE_SHA and digest(file) == target_sha, 'workbook changed during read-only audit')
    return {'status': 'passed', 'sha256': target_sha, 'sourceSha256': SOURCE_SHA,
            'sheets': 9, 'nativeTables': 8, 'rules': 479, 'calendarRows': 488, 'sourceReviews': 90, 'sources': 84,
            'preservedBaselineCells': preserved, 'actualSavedDateFormulaComparisons2026to2028': comparisons,
            'isolatedConditionalFormulaProbes2000to2399': probes, 'negativeInMemorySelfTests': negative,
            'newValuesCheckedAgainstNativeListValidation': list_inputs,
            'savedFormulaCellsProtectedAndCached': protected, 'allOld474RulesNeutralCondition': True,
            'allOldRuleParametersAndLanguagesPreserved': True, 'allOldSourceReviewsPreserved': True,
            'neFixedLpaEightRulesAndLeLanderonPreserved': True, 'nativeValidationsExtendedAndConditionListAdded': True,
            'sourceHyperlinksPreservedAndHttps': True, 'stylesByteIdentical': True,
            'sourceWorkbookUnchanged': True, 'targetWorkbookUnchanged': True, **spots}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--file', type=Path, default=TARGET)
    parser.add_argument('--report', type=Path, default=REPORT)
    args = parser.parse_args()
    require(args.report.suffix == '.json' and args.report.resolve() not in {SOURCE.resolve(), args.file.resolve()}, 'unsafe report path')
    metadata = {'auditedAtUtc': datetime.now(timezone.utc).isoformat(), 'contract': '0.6.0',
                'source': str(SOURCE), 'file': str(args.file), 'independentSavedFileAudit': True,
                'authorModelOrReceiptUsedAsEvidence': False, 'mutatesWorkbook': False, 'approvesData': False,
                'limitations': ['Bounded independent evaluation, not native Excel execution.',
                               'Long-range probes override only disposable evaluator inputs. Saved year window remains 2026–2028.',
                               'HTTPS links checked structurally, not network availability. Visual QA is separate.',
                               'No legal, language, data, runtime or production approval.']}
    try:
        result = audit(args.file) if args.file.is_file() else {'status': 'pending', 'reason': 'Saved V0.12 not yet available. No pass claimed.'}
    except Exception as error:
        result = {'status': 'failed', 'errorType': type(error).__name__, 'error': str(error)}
    result = {**metadata, **result}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False))
    return 1 if result['status'] == 'failed' else 0


if __name__ == '__main__':
    sys.exit(main())
