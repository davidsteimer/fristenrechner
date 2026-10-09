"""Independent read-only OOXML audit for AP18B-03 contract 0.5.0.

Uses only Python's standard library. Never imports an author receipt or executes
the workbook. The only output is an audit JSON outside the workbook. Formula
evaluation below is a deliberately bounded independent checker, not Excel and
not a new production calendar engine.
"""
import argparse
from collections import Counter
from copy import deepcopy
from datetime import date, datetime, timedelta, timezone
import hashlib
import json
import math
from pathlib import Path
import posixpath
import re
import sys
from urllib.parse import urlparse
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx'
SOURCE_SHA = 'd3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f'
BATCH = ROOT / 'outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx'
REST = False
BASE_RULE_COUNT = 116
N = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'s': N}
TAG = '{' + N + '}'
SHEETS = ['Übersicht', 'Feiertagskalender', 'Gemeinwesen', 'Feiertagsregeln',
          'Geltungsbereiche', 'Gebietszuordnungen', 'Rechtsquellen', 'Verfahrensbezug', 'Quellenprüfung']
MODEL_TABLES = {'Feiertagsregeln': ('rules', 27), 'Geltungsbereiche': ('scopes', 13),
                'Gebietszuordnungen': ('assignments', 18), 'Rechtsquellen': ('sources', 11),
                'Verfahrensbezug': ('mappings', 8), 'Quellenprüfung': ('reviews', 11)}
NEW_CANTONS = {'CH-VS', 'CH-FR', 'CH-SO', 'CH-GE'}
BATCH_JURISDICTION_LABEL_CELLS = {
    'D17': ('CH-FR', 'it', 'Friburgo'), 'E17': ('CH-FR', 'rm', 'Friburg'),
    'D18': ('CH-SO', 'it', 'Soletta'), 'E18': ('CH-SO', 'rm', 'Soloturn'),
    'D30': ('CH-VS', 'it', 'Vallese'), 'E30': ('CH-VS', 'rm', 'Vallais'),
    'D32': ('CH-GE', 'it', 'Ginevra'), 'E32': ('CH-GE', 'rm', 'Genevra'),
}
TYPES = {'fixedMonthDay', 'easterOffsetDays', 'nthWeekdayOfMonth', 'nthWeekdayOffsetDays'}
PORTIONS = {'fullDay': 'Ganztägig', 'afternoonFromNoon': 'Ab 12.00 Uhr'}
ERRORS = {'#REF!', '#DIV/0!', '#VALUE!', '#NAME?', '#N/A', '#NUM!', '#NULL!', '#SPILL!', '#CALC!'}
EPOCH = date(1899, 12, 30)


def require(test, *context):
    if not test:
        raise AssertionError(context)


def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def canonical(element):
    if element is None:
        return None
    return (element.tag, tuple(sorted(element.attrib.items())), element.text or '',
            tuple(canonical(child) for child in element))


def col(n):
    result = ''
    while n:
        n, r = divmod(n - 1, 26)
        result = chr(65 + r) + result
    return result


def position(a):
    m = re.fullmatch(r'\$?([A-Z]+)\$?([1-9]\d*)', a)
    require(m is not None, 'invalid A1 address', a)
    c = 0
    for ch in m[1]:
        c = c * 26 + ord(ch) - 64
    return c, int(m[2])


def addresses(ref):
    result = set()
    for area in ref.split():
        ends = area.split(':')
        require(len(ends) <= 2, 'invalid rectangle', area)
        a, b = position(ends[0]), position(ends[-1])
        require(a[0] <= b[0] and a[1] <= b[1], 'reversed rectangle', area)
        require((b[0] - a[0] + 1) * (b[1] - a[1] + 1) < 100000, 'unbounded audit rectangle', area)
        result.update(f'{col(c)}{r}' for r in range(a[1], b[1] + 1) for c in range(a[0], b[0] + 1))
    return result


def relationship_part(part):
    return posixpath.dirname(part) + '/_rels/' + posixpath.basename(part) + '.rels'


def resolve(relpart, target):
    if target.startswith('/'):
        return target.lstrip('/')
    return posixpath.normpath(posixpath.join(posixpath.dirname(posixpath.dirname(relpart)), target))


class Book:
    def __init__(self, file):
        with zipfile.ZipFile(file) as z:
            require(z.testzip() is None, 'ZIP CRC failure', str(file))
            require(len(z.namelist()) == len(set(z.namelist())), 'duplicate ZIP members')
            self.raw = {name: z.read(name) for name in z.namelist()}
        self.xml = {k: ET.fromstring(v) for k, v in self.raw.items() if k.endswith(('.xml', '.rels'))}
        self.pool = [''.join(n.itertext()) for n in self.xml.get('xl/sharedStrings.xml', [])]
        relpart = 'xl/_rels/workbook.xml.rels'
        rels = {r.get('Id'): resolve(relpart, r.get('Target')) for r in self.xml[relpart]}
        self.paths = {s.get('name'): rels[s.get('{' + R + '}id')]
                      for s in self.xml['xl/workbook.xml'].find('s:sheets', NS)}
        self.sheets = {n: self.xml[p] for n, p in self.paths.items()}
        self.cells = {n: {c.get('r'): c for c in s.findall('s:sheetData/s:row/s:c', NS)} for n, s in self.sheets.items()}
        self.styles = self.xml['xl/styles.xml'].find('s:cellXfs', NS)
        self.tables = {}
        for name, path in self.paths.items():
            part = relationship_part(path)
            rs = {r.get('Id'): r for r in self.xml.get(part, [])}
            parts = self.sheets[name].findall('s:tableParts/s:tablePart', NS)
            require(len(parts) == (0 if name == 'Übersicht' else 1), 'wrong table count', name)
            for p in parts:
                target = resolve(part, rs[p.get('{' + R + '}id')].get('Target'))
                self.tables[name] = (target, self.xml[target])

    def value(self, name, address):
        c = self.cells[name].get(address)
        if c is None:
            return None
        if c.get('t') == 's':
            return self.pool[int(c.findtext('s:v', namespaces=NS))]
        if c.get('t') == 'inlineStr':
            return ''.join(c.find('s:is', NS).itertext())
        value = c.findtext('s:v', namespaces=NS)
        if value is None or value == '':
            return '' if c.get('t') == 'str' else None
        if c.get('t') in ('str', 'e', 'd'):
            return value
        n = float(value)
        require(math.isfinite(n), 'nonfinite numeric cell', name, address)
        return int(n) if n.is_integer() else n

    def formula(self, name, address):
        c = self.cells[name].get(address)
        return c.findtext('s:f', namespaces=NS) if c is not None else None

    def locked(self, name, address):
        c = self.cells[name].get(address)
        require(c is not None, 'missing cell', name, address)
        style = int(c.get('s', '0'))
        require(0 <= style < len(self.styles), 'invalid cell style', name, address)
        p = self.styles[style].find('s:protection', NS)
        return p is None or p.get('locked', '1') not in ('0', 'false')

    def row(self, name, r, count):
        return [self.value(name, f'{col(c)}{r}') for c in range(1, count + 1)]

    def end(self, name):
        return position(self.tables[name][1].get('ref').split(':')[-1])[1]


def serial(value):
    return None if value in (None, '') else (date.fromisoformat(value) - EPOCH).days


def same(actual, expected, *context):
    require(actual == expected or actual in (None, '') and expected in (None, ''), *context, actual, expected)


def easter(y):
    a, b, c = y % 19, y // 100, y % 100
    d, e, f = b // 4, b % 4, (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    q = h + l - 7 * m + 114
    return date(y, q // 31, q % 31 + 1)


def parameter_date(book, row, year):
    v = lambda c: book.value('Feiertagsregeln', f'{c}{row}')
    kind, month, day, offset, weekday, occurrence = (v(c) for c in 'IJKLMN')
    require(kind in TYPES, 'unsupported rule type', row, kind)
    def integer(n, low, high):
        require(type(n) is int and low <= n <= high, 'invalid integer parameter', row, n, low, high)
    if kind == 'fixedMonthDay':
        integer(month, 1, 12)
        integer(day, 1, 31)
        require(all(x in (None, '') for x in (offset, weekday, occurrence)), 'irrelevant fixed parameters', row)
        result = date(year, month, day)
    elif kind == 'easterOffsetDays':
        integer(offset, -366, 366)
        require(all(x in (None, '') for x in (month, day, weekday, occurrence)), 'irrelevant Easter parameters', row)
        result = easter(year) + timedelta(days=offset)
    else:
        integer(month, 1, 12)
        integer(weekday, 1, 7)
        integer(occurrence, 1, 5)
        require(day in (None, ''), 'nth weekday has fixed day', row)
        first = date(year, month, 1)
        result = first + timedelta(days=(weekday - first.isoweekday()) % 7 + 7 * (occurrence - 1))
        require(result.month == month, 'nth anchor outside month', row)
        if kind == 'nthWeekdayOffsetDays':
            integer(offset, -366, 366)
            result += timedelta(days=offset)
        else:
            require(offset in (None, ''), 'untyped weekday offset', row)
    raw = (result - EPOCH).days
    start, end = v('O'), v('P')
    integer(start, serial('1583-01-01'), serial('9999-12-31'))
    if end not in (None, ''):
        integer(end, start, serial('9999-12-31'))
    active = raw >= start and (end in (None, '') or raw <= end)
    return raw, raw if active else 'Ausserhalb Geltung'


class FormulaError(Exception):
    pass


# Tiny parser/evaluator for the actual saved W/X and relocated Easter formulas.
# Unsupported Excel functions/references fail closed instead of accepting caches.
TOKEN = re.compile(r'\s*(?:((?:\d+(?:\.\d*)?|\.\d+))|("(?:[^"]|"")*")|((?:\'(?:[^\']|\'\')+\'!)?\$?[A-Z]+\$?\d+)|([A-Za-z_][A-Za-z_0-9.]*)|(<=|>=|<>|[=<>+*/^(),&-]))')


class FormulaParser:
    def __init__(self, formula):
        self.tokens = []
        at = 0
        while at < len(formula):
            m = TOKEN.match(formula, at)
            require(m is not None, 'unsupported formula syntax', formula[at:at + 60])
            self.tokens.append(next((i, x) for i, x in enumerate(m.groups()) if x is not None))
            at = m.end()
        self.i = 0

    def take(self, value=None):
        t = self.tokens[self.i] if self.i < len(self.tokens) else (None, None)
        require(value is None or t[1] == value, 'formula token expected', value, t)
        self.i += 1
        return t

    def parse(self, minimum=0):
        typ, value = self.take()
        if value in ('+', '-'):
            left = ('unary', value, self.parse(5))
        elif value == '(':
            left = self.parse()
            self.take(')')
        elif typ == 0:
            left = ('literal', float(value))
        elif typ == 1:
            left = ('literal', value[1:-1].replace('""', '"'))
        elif typ == 2:
            left = ('ref', value)
        elif typ == 3:
            self.take('(')
            args = []
            if self.tokens[self.i][1] != ')':
                while True:
                    args.append(self.parse())
                    if self.tokens[self.i][1] != ',':
                        break
                    self.take(',')
            self.take(')')
            left = ('call', value.upper(), args)
        else:
            raise AssertionError(('unsupported formula token', typ, value))
        precedence = {'=': 1, '<>': 1, '<': 1, '>': 1, '<=': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5}
        while self.i < len(self.tokens):
            op = self.tokens[self.i][1]
            p = precedence.get(op, -1)
            if p < minimum:
                break
            self.take()
            left = ('binary', op, left, self.parse(p + 1))
        return left


class Evaluator:
    def __init__(self, book, year):
        self.book, self.year, self.cache, self.stack = book, year, {}, set()

    def cell(self, sheet, address):
        address = address.replace('$', '')
        if (sheet, address) == ('Übersicht', 'B4'):
            return self.year
        key = (sheet, address)
        if key in self.cache:
            return self.cache[key]
        require(key not in self.stack, 'formula cycle', key)
        self.stack.add(key)
        f = self.book.formula(sheet, address)
        if f:
            parser = FormulaParser(f)
            ast = parser.parse()
            require(parser.i == len(parser.tokens), 'trailing formula tokens', sheet, address)
            out = self.evaluate(ast, sheet)
        else:
            out = self.book.value(sheet, address)
        self.stack.remove(key)
        self.cache[key] = out
        return out

    @staticmethod
    def number(x):
        if x in (None, ''):
            return 0
        return float(x)

    def evaluate(self, node, sheet):
        kind = node[0]
        if kind == 'literal':
            return node[1]
        if kind == 'ref':
            bits = node[1].split('!')
            return self.cell(bits[0][1:-1].replace("''", "'") if len(bits) == 2 else sheet, bits[-1])
        if kind == 'unary':
            return (1 if node[1] == '+' else -1) * self.number(self.evaluate(node[2], sheet))
        if kind == 'binary':
            op, a, b = node[1], self.evaluate(node[2], sheet), self.evaluate(node[3], sheet)
            if op in ('=', '<>'):
                eq = (a == b) or (a in (None, '') and b in (None, ''))
                return eq if op == '=' else not eq
            if op in ('<', '>', '<=', '>='):
                a, b = (0 if x is None else x for x in (a, b))
                if isinstance(a, str) != isinstance(b, str):
                    a, b = int(isinstance(a, str)), int(isinstance(b, str))
                return {'<': a < b, '>': a > b, '<=': a <= b, '>=': a >= b}[op]
            if op == '&':
                return str(a or '') + str(b or '')
            a, b = self.number(a), self.number(b)
            if op == '+': return a + b
            if op == '-': return a - b
            if op == '*': return a * b
            if op == '/': return a / b
            if op == '^': return a ** b
        name, args = node[1], node[2]
        ev = lambda n: self.evaluate(n, sheet)
        if name == 'IF':
            return ev(args[1] if ev(args[0]) else args[2])
        if name == 'NA':
            raise FormulaError('#N/A')
        values = [ev(x) for x in args]
        if name == 'AND': return all(values)
        if name == 'OR': return any(values)
        if name == 'ISNUMBER': return type(values[0]) in (int, float)
        if name == 'INT': return math.floor(self.number(values[0]))
        if name == 'MOD': return self.number(values[0]) % self.number(values[1])
        if name == 'DATE':
            y, m, d = (int(self.number(x)) for x in values)
            if 0 <= y < 1900: y += 1900
            y += (m - 1) // 12
            return (date(y, (m - 1) % 12 + 1, 1) + timedelta(days=d - 1) - EPOCH).days
        if name in ('MONTH', 'DAY', 'WEEKDAY'):
            day = EPOCH + timedelta(days=self.number(values[0]))
            if name == 'MONTH': return day.month
            if name == 'DAY': return day.day
            require(len(values) == 2 and values[1] == 2, 'unsupported WEEKDAY mode')
            return day.isoweekday()
        raise AssertionError(('unsupported formula function', name))


def extension(ref, before, after):
    return re.sub(r'(:\$?[A-Z]+\$?)' + str(before) + r'(?=$|\s)', lambda m: m[1] + str(after), ref)


def dv_map(sheet):
    result = {}
    for d in sheet.findall('s:dataValidations/s:dataValidation', NS):
        cp = deepcopy(d)
        cp.attrib.pop('sqref')
        for a in addresses(d.get('sqref')):
            require(a not in result, 'overlapping validations', a)
            result[a] = canonical(cp)
    return result


def check_native(old, new, model, batch):
    require(list(old.paths) == list(new.paths) == SHEETS, 'sheet/order contract')
    require(set(old.raw) == set(new.raw), 'package member mutation')
    require(old.raw['xl/styles.xml'] == new.raw['xl/styles.xml'], 'styles not byte-identical')
    require(old.raw['xl/workbook.xml'] == new.raw['xl/workbook.xml'], 'workbook settings changed')
    require(len(new.tables) == 8, 'eight native tables required')
    ends = {n: 6 + len(model[k]) for n, (k, _) in MODEL_TABLES.items()}
    ends.update(Gemeinwesen=33, Feiertagskalender=131 + len(model['rules']) - 116)
    widths = {n: w for n, (_, w) in MODEL_TABLES.items()}
    widths.update(Gemeinwesen=9, Feiertagskalender=15)
    allowed_parts = set(new.paths.values()) | {p for p, _ in new.tables.values()}
    if batch:
        allowed_parts.add(relationship_part(new.paths['Rechtsquellen']))
    for p in old.raw:
        if p not in allowed_parts:
            require(old.raw[p] == new.raw[p], 'native part changed', p)
        require(not re.search(r'vba|macro|connections|externalLinks|queryTables|activeX|embeddings', p, re.I), 'unsafe native part', p)
    for n, (part, table) in new.tables.items():
        oldpart, before = old.tables[n]
        require(part == oldpart, 'table relationship changed', n)
        expected = deepcopy(before)
        expected.set('ref', f'A6:{col(widths[n])}{ends[n]}')
        expected.find('s:autoFilter', NS).set('ref', expected.get('ref'))
        columns = expected.find('s:tableColumns', NS)
        if n in ('Feiertagsregeln', 'Feiertagskalender'):
            if not REST:
                ET.SubElement(columns, TAG + 'tableColumn', {'id': str(widths[n]), 'name': 'Tagesumfang'})
            columns.set('count', str(widths[n]))
            if n == 'Feiertagsregeln': columns[11].set('name', 'Tagesabstand')
        require(canonical(expected) == canonical(table), 'native table/filter/style mismatch', n)
        for c, item in enumerate(table.find('s:tableColumns', NS), 1):
            same(new.value(n, f'{col(c)}6'), item.get('name'), 'table/header mismatch', n, c)
    for n in SHEETS:
        a, b = old.sheets[n], new.sheets[n]
        excluded = {'sheetData', 'dimension', 'cols', 'dataValidations', 'conditionalFormatting', 'hyperlinks'}
        require([canonical(e) for e in a if e.tag.split('}')[-1] not in excluded]
                == [canonical(e) for e in b if e.tag.split('}')[-1] not in excluded], 'sheet native metadata changed', n)
        require(b.find('s:sheetProtection', NS) is not None, 'sheet protection missing', n)
        if n != 'Rechtsquellen' or not batch:
            require(canonical(a.find('s:hyperlinks', NS)) == canonical(b.find('s:hyperlinks', NS)),
                    'unrelated hyperlinks changed', n)
        old_end, new_end = (old.end(n), ends[n]) if n != 'Übersicht' else (0, 0)
        expected_cf = deepcopy(a.findall('s:conditionalFormatting', NS))
        for cf in expected_cf:
            cf.set('sqref', extension(cf.get('sqref'), old_end, new_end))
        require([canonical(e) for e in expected_cf] == [canonical(e) for e in b.findall('s:conditionalFormatting', NS)], 'conditional formatting changed', n)
        expected_dv = deepcopy(a)
        for d in expected_dv.findall('s:dataValidations/s:dataValidation', NS):
            d.set('sqref', extension(d.get('sqref'), old_end, new_end))
        prev, current = dv_map(expected_dv), dv_map(b)
        replaced = {9, 10, 11, 12, 27} if n == 'Feiertagsregeln' else set()
        require({k: v for k, v in prev.items() if position(k)[0] not in replaced}
                == {k: v for k, v in current.items() if position(k)[0] not in replaced}, 'preserved validations changed', n)
        def column_attributes(s):
            return {i: {k: v for k, v in c.attrib.items() if k not in ('min', 'max')}
                    for c in s.findall('s:cols/s:col', NS) for i in range(int(c.get('min')), int(c.get('max')) + 1)}
        ca, cb = column_attributes(a), column_attributes(b)
        allowed = {27, 28, 29, 30} if n == 'Feiertagsregeln' else {2, 15} if n == 'Feiertagskalender' else set()
        require({k: v for k, v in ca.items() if k not in allowed} == {k: v for k, v in cb.items() if k not in allowed}, 'unrelated column dimensions changed', n)
    return ends


def check_preservation(old, new, ends, batch):
    count = 0
    for n in SHEETS:
        for address in new.cells[n].keys() - old.cells[n].keys():
            c, r = position(address)
            permitted = n == 'Feiertagsregeln' and ((c == 27 and 6 <= r <= ends[n])
                        or (c in (29, 30) and 6 <= r <= 23))
            permitted |= n == 'Feiertagskalender' and c == 15 and 6 <= r <= ends[n]
            if batch and n in new.tables:
                width = position(new.tables[n][1].get('ref').split(':')[-1])[0]
                permitted |= 1 <= c <= width and old.end(n) < r <= ends[n]
                permitted |= n == 'Gebietszuordnungen' and c == 1 and 40 <= r <= ends[n] + 7
            require(permitted, 'undeclared extra cell', n, address)
        for address, before in old.cells[n].items():
            c, r = position(address)
            appended_blank = batch and n in {'Geltungsbereiche', 'Rechtsquellen', 'Verfahrensbezug', 'Quellenprüfung'} \
                and old.end(n) < r <= ends[n] and 1 <= c <= MODEL_TABLES[n][1]
            if appended_blank:
                require(old.value(n, address) in (None, '') and old.formula(n, address) is None,
                        'appended table overwrites nonempty original', n, address)
                template_row = old.end(n) - ((old.end(n) - r) % 2)
                template = old.cells[n][f'{col(c)}{template_row}']
                after = new.cells[n].get(address)
                require(after is not None and after.get('s', '0') == template.get('s', '0'),
                        'appended preformatted cell must use original data-row style', n, address)
                # Exact appended values are checked independently against the model below.
                require(new.formula(n, address) is None, 'unexpected appended metadata formula', n, address)
                continue
            exempt = n == 'Übersicht' and address in {'A6', 'A8', 'A9', 'A34', 'A36', 'B26'}
            exempt |= REST and n == 'Übersicht' and address in {'A19', 'A30'}
            exempt |= n == 'Feiertagsregeln' and (address == 'L6' or c in (23, 24, 27, 28, 29, 30))
            exempt |= n == 'Feiertagskalender' and (address == 'A4' or c == 15)
            if batch and n == 'Gemeinwesen' and 7 <= c <= 9 and new.value(n, f'A{r}') in NEW_CANTONS:
                exempt = True
            if batch and n == 'Gebietszuordnungen' and r > old.end(n):
                exempt = True
            if exempt:
                continue
            after = new.cells[n].get(address)
            require(after is not None, 'original cell removed', n, address)
            expected_value = old.value(n, address)
            if batch and n == 'Gemeinwesen' and address in BATCH_JURISDICTION_LABEL_CELLS:
                jurisdiction, language, expected_value = BATCH_JURISDICTION_LABEL_CELLS[address]
                require(old.value(n, address) in (None, '', expected_value), 'new canton label overwrites prior value', address)
                require(old.value(n, f'A{r}') == new.value(n, f'A{r}') == jurisdiction,
                        'new canton label has wrong jurisdiction row', address)
            same(new.value(n, address), expected_value, 'original value changed', n, address)
            require(before.get('s', '0') == after.get('s', '0'), 'original style changed', n, address)
            # Calendar formulas are intentionally re-bound to the enlarged rule list.
            if n != 'Feiertagskalender' or not (r >= 7 and c in (1, 2, 5, 6, 7, 8, 9, 12, 13)):
                require(canonical(before.find('s:f', NS)) == canonical(after.find('s:f', NS)), 'original formula changed', n, address)
            count += 1
    for r in range(6, 24):
        for a, b in ([('AC', 'AC'), ('AD', 'AD')] if REST else [('AA', 'AC'), ('AB', 'AD')]):
            same(new.value('Feiertagsregeln', f'{b}{r}'), old.value('Feiertagsregeln', f'{a}{r}'), 'moved helper cache', r)
            f = old.formula('Feiertagsregeln', f'{a}{r}')
            expected = re.sub(r'\b(\$?)AB(\$?\d+)\b', r'\1AD\2', f) if f else None
            require(new.formula('Feiertagsregeln', f'{b}{r}') == expected, 'helper formula relocation', b, r)
            require(new.locked('Feiertagsregeln', f'{b}{r}'), 'helper unlocked', b, r)
            require(new.cells['Feiertagsregeln'][f'{b}{r}'].get('s', '0') ==
                    old.cells['Feiertagsregeln'][f'{a}{r}'].get('s', '0'), 'helper style changed', b, r)
        require(new.value('Feiertagsregeln', f'AB{r}') in (None, ''), 'old helper column not empty', r)
    require(new.row('Feiertagsregeln', 6, 7)[3:] == ['Deutsch', 'Französisch', 'Italienisch', 'Rumantsch Grischun'], 'language positions changed')
    for r in range(7, 123):
        for c in ('W', 'X'):
            require(old.cells['Feiertagsregeln'][f'{c}{r}'].get('s', '0') ==
                    new.cells['Feiertagsregeln'][f'{c}{r}'].get('s', '0'), 'original date style changed', c, r)
    if batch:
        for delta in range(5):
            same(new.value('Gebietszuordnungen', f'A{ends["Gebietszuordnungen"] + 3 + delta}'),
                 old.value('Gebietszuordnungen', f'A{old.end("Gebietszuordnungen") + 3 + delta}'), 'moved area note', delta)
    return count


def check_validations(book, end):
    expected = {'I': ('list', '"fixedMonthDay,easterOffsetDays,nthWeekdayOfMonth,nthWeekdayOffsetDays"', None),
                'J': ('whole', '1', '12'), 'K': ('whole', '1', '31'), 'L': ('whole', '-366', '366'),
                'AA': ('list', '"Ganztägig,Ab 12.00 Uhr"', None)}
    dvs = book.sheets['Feiertagsregeln'].findall('s:dataValidations/s:dataValidation', NS)
    for c, (kind, f1, f2) in expected.items():
        for r in range(7, end + 1):
            matches = [d for d in dvs if f'{c}{r}' in addresses(d.get('sqref'))]
            require(len(matches) == 1, 'validation coverage', c, r)
            d = matches[0]
            require(d.get('type') == kind and d.findtext('s:formula1', namespaces=NS) == f1
                    and d.findtext('s:formula2', namespaces=NS) == f2, 'validation rule', c, r)
            require(d.get('errorStyle', 'stop') == 'stop' and d.get('showErrorMessage') in ('1', 'true')
                    and bool(d.get('error')), 'validation must reject invalid input', c, r)


def check_data(book, old, model, batch):
    require(model['contractVersion'] == '0.5.0', 'model contract')
    require(model['contract05Review'] == {'dayPortionStatus': 'open', 'approvalBasis': None, 'runtimeEnabled': False}, 'unapproved contract metadata promoted')
    require(model['years'] == {'from': 2026, 'to': 2028, 'selected': 2027}, 'model year range')
    require(book.value('Übersicht', 'B4') == 2027 and not book.locked('Übersicht', 'B4'), 'saved year/selector protection')
    require('0.5.0' in str(book.value('Übersicht', 'A36')), 'visible contract marker')
    require(len(model['rules']) == (116 if not batch else book.end('Feiertagsregeln') - 6), 'rule count')
    if batch:
        require({r['jurisdiction'] for r in model['rules'][BASE_RULE_COUNT:]} == NEW_CANTONS,
                'batch must append exactly the authorised cantons')
        for address, (jurisdiction, language, expected) in BATCH_JURISDICTION_LABEL_CELLS.items():
            same(model['jurisdictionLabels'][jurisdiction][language], expected,
                 'confirmed canton label differs from model', address)
    else:
        require({k: len(model[k]) for k in ('scopes', 'sources', 'mappings', 'reviews', 'assignments')} ==
                {'scopes': 13, 'sources': 17, 'mappings': 18, 'reviews': 18, 'assignments': 31},
                'structural-only metadata count changed')
    rules = {}
    for row, rule in enumerate(model['rules'], 7):
        c = rule['calculation']
        wanted = [rule['id'], rule['jurisdiction'], rule['scope'], rule['de'], rule['fr'], rule.get('it'), rule.get('rm'),
                  rule['category'], c['type'], c.get('month'), c.get('day'), c.get('offsetDays'), c.get('isoWeekday'), c.get('occurrence'),
                  serial(rule['from']), serial(rule['to']), rule['priority'], rule['status'], rule['approvalBasis'], rule['action'], rule['target'],
                  rule['exportClass'], None, None, rule['source'], rule['locator'], PORTIONS[rule['dayPortion']]]
        require(rule['id'] not in rules, 'duplicate rule ID', rule['id'])
        rules[rule['id']] = row
        for column, value in enumerate(wanted, 1):
            if column not in (23, 24):
                same(book.value('Feiertagsregeln', f'{col(column)}{row}'), value, 'model/rule mismatch', rule['id'], column)
        if row <= 122:
            require(rule['dayPortion'] == 'fullDay', 'legacy day extent changed', rule['id'])
        if rule['jurisdiction'] in NEW_CANTONS:
            require(row > 122 and batch, 'new canton in structural-only output')
            require(rule['status'] in ('open', 'blocked') and rule['approvalBasis'] is None and rule['reference'] is None,
                    'new rule approval inherited', rule['id'])
            require(rule['action'] == 'add' and rule['target'] is None, 'new suppression/replacement', rule['id'])
        reference = book.value('Feiertagsregeln', f'V{row}') == 'referenceOnly'
        require(book.locked('Feiertagsregeln', f'AA{row}') == reference, 'day-portion input/reference protection', row)
        if rule['dayPortion'] == 'afternoonFromNoon':
            require(rule['exportClass'] == 'blockedEffect' and rule['status'] != 'approved', 'partial-day effect not blocked', rule['id'])
    require(sum(book.value('Feiertagsregeln', f'B{r}') in ('CH', 'CH-BE') for r in rules.values()) == 12, 'original CH/BE reference count')
    # Explicitly preserve all eight V0.8 provisional labels, without reapproving them.
    labels = model.get('provisionalTiRmLabels', [])
    require(len(labels) == 8, 'provisional RG metadata lost')
    for label in labels:
        require(label['kind'] == 'provisionalProductTranslation' and label['independentLanguageApproval'] is False
                and label['legalEffectChanged'] is False, 'provisional label promoted')
        r = rules[label['ruleId']]
        same(book.value('Feiertagsregeln', f'G{r}'), old.value('Feiertagsregeln', f'G{r}'), 'V0.8 provisional RG label changed')
    for row, source in enumerate(model['sources'], 7):
        # V0.8's reviewed notes supersede the historical V0.7 model seed.
        # The independent old/new cell comparison already protects these rows.
        if row <= old.end('Rechtsquellen'):
            continue
        require(source[8] in ('open', 'blocked'), 'new source approved', row)
        wanted = [*source[:4], 'Amtliche Quelle öffnen', serial(source[5]), serial(source[6]), *source[7:], source[4]]
        for c, value in enumerate(wanted, 1):
            same(book.value('Rechtsquellen', f'{col(c)}{row}'), value, 'source/model', row, c)
    for name, key in [('Verfahrensbezug', 'mappings'), ('Quellenprüfung', 'reviews')]:
        for r, entry in enumerate(model[key], 7):
            if r <= old.end(name):
                continue
            wanted = list(entry)
            if key == 'reviews': wanted[3] = serial(wanted[3])
            for c, value in enumerate(wanted, 1):
                same(book.value(name, f'{col(c)}{r}'), value, 'model/table', name, r, c)
            if r > old.end(name):
                require(book.value(name, f'{"G" if key == "mappings" else "H"}{r}') in
                        (('open', 'blocked') if key == 'mappings' else ('candidate',)), 'new status approved', name, r)
    for r, scope in enumerate(model['scopes'], 7):
        if r <= old.end('Geltungsbereiche'):
            continue
        labels = model.get('scopeLabels', {}).get(scope[0], {})
        wanted = [*scope[:3], labels.get('fr', ''), labels.get('it', ''), labels.get('rm', ''), *scope[3:8], serial(scope[8]), serial(scope[9])]
        for c, value in enumerate(wanted, 1):
            same(book.value('Geltungsbereiche', f'{col(c)}{r}'), value, 'model/scope', r, c)
        if r > old.end('Geltungsbereiche'):
            require(book.value('Geltungsbereiche', f'K{r}') in ('open', 'blocked'), 'new scope approved', r)
    for r, a in enumerate(model['assignments'], 7):
        wanted = [a[k] for k in ('id', 'scopeId', 'areaId', 'de', 'fr', 'it', 'rm', 'areaType', 'parentAreaId', 'effect', 'officialIdSystem', 'officialId')]
        wanted += [serial(a['from']), serial(a['to']), a['sourceId'], a['locator'], a['status'], a['note']]
        for c, value in enumerate(wanted, 1):
            same(book.value('Gebietszuordnungen', f'{col(c)}{r}'), value, 'model/area', r, c)
        if r > old.end('Gebietszuordnungen'):
            require(a['status'] in ('open', 'blocked'), 'new area approved', r)
    if batch:
        for r in range(7, book.end('Gemeinwesen') + 1):
            if book.value('Gemeinwesen', f'A{r}') in NEW_CANTONS:
                require(book.value('Gemeinwesen', f'H{r}') == 'open', 'new canton approved', r)
                url = book.value('Gemeinwesen', f'I{r}')
                require(urlparse(url).scheme == 'https' and bool(urlparse(url).netloc), 'new canton source URL', r)
    return rules


def check_dates(book, rules):
    checked = 0
    for year in (2026, 2027, 2028):
        evaluator = Evaluator(book, year)
        require(evaluator.cell('Feiertagsregeln', 'AD23') == (easter(year) - EPOCH).days, 'Easter formula/oracle mismatch', year)
        for key, row in rules.items():
            raw, valid = parameter_date(book, row, year)
            for column, expected in [('W', raw), ('X', valid)]:
                f = book.formula('Feiertagsregeln', f'{column}{row}')
                require(f and not re.search(r'\$?AB\$?\d+', f), 'missing/old-helper formula', key, column)
                if column == 'W': require('$AD$23' in f, 'Easter reference not AD23', key)
                require(evaluator.cell('Feiertagsregeln', f'{column}{row}') == expected, 'actual saved formula disagrees with independent oracle', key, year, column)
                if year == 2027:
                    require(book.value('Feiertagsregeln', f'{column}{row}') == expected, 'saved formula cache mismatch', key, column)
            checked += 1
    for row in range(7, book.end('Feiertagskalender') + 1):
        key = book.value('Feiertagskalender', f'K{row}')
        require(key in rules, 'calendar orphan rule', row, key)
        source_row = rules[key]
        expected = parameter_date(book, source_row, 2027)[1]
        require(book.value('Feiertagskalender', f'A{row}') == expected and type(expected) is int, 'calendar date not whole serial', row)
        label = book.value('Feiertagsregeln', f'AA{source_row}')
        same(book.value('Feiertagskalender', f'O{row}'), label, 'calendar day extent', row)
        day = EPOCH + timedelta(days=expected)
        weekday = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'][day.weekday()]
        if label == 'Ab 12.00 Uhr': weekday += ', ab 12.00 Uhr'
        same(book.value('Feiertagskalender', f'B{row}'), weekday, 'calendar weekday/partial label', row)
        for dest, src in [('A', 'X'), ('E', 'D'), ('F', 'E'), ('I', 'H'), ('L', 'Y'), ('M', 'Z'), ('O', 'AA')]:
            lookup = f"INDEX('Feiertagsregeln'!${src}$7:${src}${book.end('Feiertagsregeln')},MATCH($K{row},'Feiertagsregeln'!$A$7:$A${book.end('Feiertagsregeln')},0))"
            require(book.formula('Feiertagskalender', f'{dest}{row}') == lookup, 'calendar lookup reference', row, dest)
            same(book.value('Feiertagskalender', f'{dest}{row}'), book.value('Feiertagsregeln', f'{src}{source_row}'), 'calendar lookup cache', row, dest)
        for dest, src in [('G', 'F'), ('H', 'G')]:
            lookup = f"INDEX('Feiertagsregeln'!${src}$7:${src}${book.end('Feiertagsregeln')},MATCH($K{row},'Feiertagsregeln'!$A$7:$A${book.end('Feiertagsregeln')},0))"
            require(book.formula('Feiertagskalender', f'{dest}{row}') == f'IF({lookup}="","Noch zu erfassen",{lookup})', 'calendar language lookup reference', row, dest)
            value = book.value('Feiertagsregeln', f'{src}{source_row}')
            same(book.value('Feiertagskalender', f'{dest}{row}'), value or 'Noch zu erfassen', 'calendar language cache', row, dest)
        if row > 131:
            same(book.value('Feiertagskalender', f'C{row}'), book.value('Feiertagsregeln', f'B{source_row}'), 'new calendar jurisdiction', row)
            require(book.value('Feiertagskalender', f'J{row}') in ('open', 'blocked'), 'new calendar status approved', row)
        require(book.locked('Feiertagskalender', f'O{row}'), 'new calendar formula not locked', row)
    return checked


def check_legal_spots(book, rules):
    ge = [r for r in rules.values() if book.value('Feiertagsregeln', f'B{r}') == 'CH-GE']
    require(len(ge) == 9, 'Geneva must have exactly nine holidays', len(ge))
    fast = {2026: date(2026, 9, 10), 2027: date(2027, 9, 9), 2028: date(2028, 9, 7)}
    for y, jeune in fast.items():
        e = easter(y)
        expected = {date(y, 1, 1), e - timedelta(days=2), e + timedelta(days=1), e + timedelta(days=39),
                    e + timedelta(days=50), date(y, 8, 1), jeune, date(y, 12, 25), date(y, 12, 31)}
        actual = {EPOCH + timedelta(days=parameter_date(book, r, y)[0]) for r in ge}
        require(actual == expected and date(y, 1, 2) not in actual, 'Geneva legal date set / Sunday substitution', y)
    offsets = [r for r in ge if book.value('Feiertagsregeln', f'I{r}') == 'nthWeekdayOffsetDays']
    require(len(offsets) == 1 and book.row('Feiertagsregeln', offsets[0], 14)[9:14] == [9, None, 4, 7, 1], 'Geneva fast anchor must be first Sunday + four days')
    so = [r for r in rules.values() if book.value('Feiertagsregeln', f'B{r}') == 'CH-SO']
    require(so, 'Solothurn rules absent')
    may = [r for r in so if book.value('Feiertagsregeln', f'I{r}') == 'fixedMonthDay'
           and book.value('Feiertagsregeln', f'J{r}') == 5 and book.value('Feiertagsregeln', f'K{r}') == 1]
    require(may, 'Solothurn May 1 absent')
    for r in so:
        expected = 'Ab 12.00 Uhr' if r in may else 'Ganztägig'
        require(book.value('Feiertagsregeln', f'AA{r}') == expected, 'Solothurn half-day/full-day conflation', r)
        if r in may:
            require(book.value('Feiertagsregeln', f'V{r}') == 'blockedEffect', 'Solothurn partial-day export not blocked', r)
    return {'genevaHolidays': 9, 'genevaFastDates': {str(y): d.isoformat() for y, d in fast.items()},
            'genevaJanuary2OrSundayReplacement': False, 'solothurnMay1HalfDayRules': len(may)}


def check_package_safety(book):
    formula_count = 0
    for name, cells in book.cells.items():
        for address, cell in cells.items():
            value = book.value(name, address)
            require(cell.get('t') != 'e' and not (isinstance(value, str) and value in ERRORS), 'cached Excel error', name, address)
            f = book.formula(name, address)
            if f is not None:
                require('#REF!' not in f and '[' not in f and not re.search(r'WEBSERVICE|RTD\(|DDE|CALL\(', f, re.I), 'unsafe/broken formula', name, address)
                require(book.locked(name, address), 'formula unlocked', name, address)
                require(cell.find('s:v', NS) is not None and value is not None, 'formula cache missing', name, address)
                formula_count += 1
    for part, xml in book.xml.items():
        if part.endswith('.rels'):
            for rel in xml:
                if rel.get('TargetMode') == 'External':
                    require(rel.get('Type') == R + '/hyperlink', 'external non-hyperlink relationship', part)
                    u = urlparse(rel.get('Target', ''))
                    require(u.scheme == 'https' and bool(u.netloc), 'non-HTTPS hyperlink', part, rel.get('Target'))
                else:
                    require(resolve(part, rel.get('Target', '')) in book.raw, 'broken internal relationship', part, rel.get('Target'))
    n = 'Rechtsquellen'
    part = relationship_part(book.paths[n])
    relations = {r.get('Id'): r for r in book.xml[part]}
    links = {h.get('ref'): h for h in book.sheets[n].findall('s:hyperlinks/s:hyperlink', NS)}
    for r in range(7, book.end(n) + 1):
        target = book.value(n, f'K{r}')
        require(urlparse(target).scheme == 'https' and bool(urlparse(target).netloc), 'source URL not HTTPS', r)
        require(f'E{r}' in links, 'source hyperlink missing', r)
        rel = relations[links[f'E{r}'].get('{' + R + '}id')]
        require(rel.get('Target') == target and rel.get('TargetMode') == 'External', 'source visible URL/href mismatch', r)
    return formula_count


def negative_self_tests(old, new, model, ends, rules, batch):
    """Corrupt independent in-memory XML copies only, never a ZIP/file."""
    passed = []
    def rejects(label, change, check):
        copy = deepcopy(new)
        change(copy)
        try:
            check(copy)
        except (AssertionError, FormulaError):
            passed.append(label)
        else:
            raise AssertionError(('negative self-test did not reject corruption', label))
    rejects('native table width', lambda b: b.tables['Feiertagsregeln'][1].set('ref', 'A6:Z122'),
            lambda b: check_native(old, b, model, batch))
    rejects('stale AB helper reference', lambda b: setattr(b.cells['Feiertagsregeln']['AD8'].find('s:f', NS), 'text', 'MOD(AB7,19)'),
            lambda b: check_preservation(old, b, ends, batch))
    rejects('hardcoded year in actual date formula',
            lambda b: setattr(b.cells['Feiertagsregeln']['W7'].find('s:f', NS), 'text',
                              b.formula('Feiertagsregeln', 'W7').replace("'Übersicht'!$B$4", '2027')),
            lambda b: check_dates(b, rules))
    unlocked = new.cells['Feiertagsregeln']['AA122'].get('s', '0')
    rejects('unlocked calendar day-portion formula', lambda b: b.cells['Feiertagskalender']['O7'].set('s', unlocked), check_package_safety)
    rejects('fractional saved calendar date',
            lambda b: setattr(b.cells['Feiertagskalender']['A7'].find('s:v', NS), 'text', str(b.value('Feiertagskalender', 'A7') + 0.5)),
            lambda b: check_dates(b, rules))
    def damage_validation(b):
        dv = next(d for d in b.sheets['Feiertagsregeln'].findall('s:dataValidations/s:dataValidation', NS)
                  if 'AA7' in addresses(d.get('sqref')))
        dv.find('s:formula1', NS).text = '"Ganztägig"'
    rejects('missing partial-day validation option', damage_validation, lambda b: check_validations(b, ends['Feiertagsregeln']))
    def damage_label(b):
        row = rules['TI-CAL-DAY-EPIPHANY']
        cell = b.cells['Feiertagsregeln'][f'G{row}']
        cell.clear()
        cell.attrib.update(r=f'G{row}', t='inlineStr')
        ET.SubElement(ET.SubElement(cell, TAG + 'is'), TAG + 't').text = 'Unapproved replacement'
    rejects('changed V0.8 provisional RG label', damage_label, lambda b: check_preservation(old, b, ends, batch))
    require(digest(SOURCE) == SOURCE_SHA, 'source changed during in-memory tests')
    return passed


def audit(args):
    require(digest(SOURCE) == SOURCE_SHA, 'V0.8 source SHA mismatch')
    target_sha = digest(args.file)
    old, new = Book(SOURCE), Book(args.file)
    model = json.loads(args.model.read_text())
    if REST:
        require(model['batch04Boundary'] == {'legalApproval': False, 'productExport': False,
                'municipalLawIncluded': False, 'languageApproval': False, 'completeDateCoverage': False,
                'contractUnchanged': True}, 'research capture must not imply activation or completeness')
        require(model['referenceAcceptance']['sourceSha256'] == SOURCE_SHA
                and model['referenceAcceptance']['solothurnMay1HalfDayDeadlineEffect'] == 'none', 'accepted reference / SO decision lost')
        require(len({r['jurisdiction'] for r in model['rules']}) == 27, 'Bund and all 26 cantons required')
        for p in model['pendingCases']:
            require(any(p['id'] in str(v) for row in model['mappings'] + model['reviews'] for v in row),
                    'pending case not visible in workbook metadata', p['id'])
    ends = check_native(old, new, model, args.batch)
    preserved = check_preservation(old, new, ends, args.batch)
    check_validations(new, ends['Feiertagsregeln'])
    rules = check_data(new, old, model, args.batch)
    dates = check_dates(new, rules)
    spots = check_legal_spots(new, rules) if args.batch else {'batchLegalSpots': 'notApplicableToStructure'}
    formulas = check_package_safety(new)
    negative = negative_self_tests(old, new, model, ends, rules, args.batch) if args.self_test else []
    require(digest(SOURCE) == SOURCE_SHA and digest(args.file) == target_sha, 'workbook mutated during read-only audit')
    return {'status': 'passed', 'sourceSha256': SOURCE_SHA, 'sha256': target_sha,
            'sheets': 9, 'nativeTables': 8, 'rules': len(rules), 'calendarRows': ends['Feiertagskalender'] - 6,
            'counts': {k: len(model[k]) for k in ('rules', 'scopes', 'sources', 'mappings', 'reviews', 'assignments')},
            'stylesByteIdentical': True, 'sourceWorkbookUnchanged': True, 'targetWorkbookUnchanged': True,
            'preservedBaselineCells': preserved, 'preservedChBeReferences': 12, 'preservedProvisionalRgLabels': 8,
            'actualFormulaVsIndependentDateComparisons': dates * 2, 'savedFormulaCellsProtectedAndCached': formulas,
            'negativeInMemorySelfTests': negative,
            'helperRelocationVerified': 'AC:AD preserved, date formulas use AD23' if REST else 'AA:AB to AC:AD, date formulas use AD23',
            'dataValidationsNativeAndExtended': True, 'sourceHyperlinksHttpsAndMatchUrlCells': True, **spots}


def main():
    global REST, SOURCE, SOURCE_SHA, BATCH, NEW_CANTONS, BASE_RULE_COUNT, BATCH_JURISDICTION_LABEL_CELLS
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--batch', action='store_true')
    p.add_argument('--batch-04', action='store_true')
    p.add_argument('--file', type=Path)
    p.add_argument('--model', type=Path)
    p.add_argument('--report', type=Path)
    p.add_argument('--self-test', action='store_true', help='Also reject seven deliberately corrupted in-memory XML copies')
    args = p.parse_args()
    REST = args.batch_04
    if REST:
        args.batch = True
        SOURCE = BATCH
        SOURCE_SHA = 'a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12'
        BATCH = ROOT / 'outputs/ap18b-04-restkantone-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx'
        BASE_RULE_COUNT = 192
        NEW_CANTONS = {'CH-ZH', 'CH-SH', 'CH-TG', 'CH-SG', 'CH-AR', 'CH-AI', 'CH-LU', 'CH-UR', 'CH-SZ',
                       'CH-OW', 'CH-NW', 'CH-ZG', 'CH-GL', 'CH-BS', 'CH-BL', 'CH-VD', 'CH-NE', 'CH-JU'}
    qa = ROOT / ('.work/ap18b-04' if REST else '.work/ap18b-03') / ('batch' if args.batch else 'structure')
    args.file = args.file or (BATCH if args.batch else qa / 'structure.xlsx')
    args.model = args.model or qa / 'model.json'
    args.report = args.report or qa / 'independent-audit.json'
    if REST and args.model.is_file():
        # Only previously empty language cells in the eighteen new canton rows
        # may be filled. Their exact source-backed values are independently tested
        # in the three canton test modules, and compared to the saved cells here.
        candidate = json.loads(args.model.read_text())
        BATCH_JURISDICTION_LABEL_CELLS = {f'{c}{i + 7}': (j[0], lang, candidate['jurisdictionLabels'][j[0]][lang])
            for i, j in enumerate(candidate['jurisdictions']) if j[0] in NEW_CANTONS
            for c, lang in [('D', 'it'), ('E', 'rm')]}
    require(args.report.suffix == '.json' and args.report.resolve() not in
            {SOURCE.resolve(), args.file.resolve(), args.model.resolve()}, 'unsafe audit report target')
    metadata = {'auditedAtUtc': datetime.now(timezone.utc).isoformat(), 'contract': '0.5.0',
                'phase': 'batch' if args.batch else 'structure', 'source': str(SOURCE), 'file': str(args.file),
                'model': str(args.model), 'independentSavedFileAudit': True, 'mutatesWorkbook': False,
                'approvesData': False, 'authorReceiptsUsedAsEvidence': False,
                'limitations': ['Bounded Python evaluation of saved formulas, not native Excel recalculation.',
                                'HTTPS targets checked structurally, not live network availability.',
                                'Visual and intended-engine input-change QA are separate.',
                                'No legal, data, export or production approval.']}
    try:
        if args.batch and (not args.file.is_file() or not args.model.is_file()):
            result = {'status': 'pending', 'reason': 'Batch workbook/model not yet available. No batch pass claimed.'}
        else:
            result = audit(args)
    except Exception as error:
        result = {'status': 'failed', 'errorType': type(error).__name__, 'error': str(error)}
    result = {**metadata, **result}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False))
    return 1 if result['status'] == 'failed' else 0


if __name__ == '__main__':
    sys.exit(main())
