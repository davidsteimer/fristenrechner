"""Read the actual AP18 workbook into an inert, bounded JSON snapshot.

Standard library only. This is not an Excel engine: formula text and saved
values are evidence, never evaluated. No ZIP member is extracted to disk and
no hyperlink is fetched. The source workbook is never written. Domain and
header-contract validation belongs to the AP18C normalizer.
"""
import argparse
import hashlib
import io
import json
import math
from pathlib import Path
import posixpath
import re
import sys
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET
import zipfile


MAX_FILE_BYTES = 20 * 1024 * 1024
MAX_EXPANDED_BYTES = 60 * 1024 * 1024
MAX_ENTRIES = 500
MAX_TABLE_CELLS = 100000
MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
CONTENT = 'http://schemas.openxmlformats.org/package/2006/content-types'
S = '{' + MAIN + '}'
R = '{' + REL + '}'
SHEETS = ('Übersicht', 'Feiertagskalender', 'Gemeinwesen', 'Feiertagsregeln',
          'Geltungsbereiche', 'Gebietszuordnungen', 'Rechtsquellen',
          'Verfahrensbezug', 'Quellenprüfung')
ALLOWED_CONTENT_TYPES = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.' + x + '+xml'
    for x in ('sheet.main', 'worksheet', 'styles', 'sharedStrings', 'table', 'calcChain')
} | {
    'application/vnd.openxmlformats-officedocument.theme+xml',
    'application/vnd.openxmlformats-package.relationships+xml',
    'application/vnd.openxmlformats-package.core-properties+xml',
    'application/vnd.openxmlformats-officedocument.extended-properties+xml',
    'application/vnd.openxmlformats-officedocument.custom-properties+xml',
    'application/xml',
}


class WorkbookError(ValueError):
    """Unsupported or structurally unsafe workbook, with no partial result."""


def require(condition, message):
    if not condition:
        raise WorkbookError(message)


def member_name(name):
    require(isinstance(name, str) and name and '\\' not in name and '\x00' not in name,
            'Invalid ZIP member name')
    require(not name.startswith('/') and all(p not in ('', '.', '..') for p in name.split('/')),
            'Unsafe ZIP member path')
    require(':' not in name and '%' not in name and not any(ord(c) < 32 for c in name),
            'Ambiguous ZIP member path')
    return name


def allowed_part(name):
    return name in {
        '[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml',
        'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/sharedStrings.xml',
        'xl/calcChain.xml', 'docProps/core.xml', 'docProps/app.xml', 'docProps/custom.xml',
    } or bool(re.fullmatch(
        r'xl/(?:theme/[^/]+\.xml|worksheets/[^/]+\.xml|'
        r'worksheets/_rels/[^/]+\.xml\.rels|tables/[^/]+\.xml)', name))


def safe_xml(raw, part):
    # Decode before searching, so UTF-16/32 cannot conceal a DTD or entity.
    encoding = 'utf-8-sig'
    if raw.startswith((b'\xff\xfe\x00\x00', b'\x00\x00\xfe\xff')):
        encoding = 'utf-32'
    elif raw.startswith((b'\xff\xfe', b'\xfe\xff')):
        encoding = 'utf-16'
    elif raw[:4] in (b'<\x00?\x00', b'\x00<\x00?'):
        encoding = 'utf-16-le' if raw[0] == 60 else 'utf-16-be'
    try:
        text = raw.decode(encoding)
    except UnicodeError as exc:
        raise WorkbookError(f'Unsupported XML encoding in {part}') from exc
    require(not re.search(r'<!\s*(?:DOCTYPE|ENTITY)\b', text, re.I),
            f'DTD/entities are prohibited in {part}')
    try:
        root = ET.fromstring(text)
    except ET.ParseError as exc:
        raise WorkbookError(f'Invalid XML in {part}') from exc
    stack = [(root, 0)]
    count = 0
    while stack:
        element, depth = stack.pop()
        count += 1
        require(depth <= 64 and count <= 1000000, f'XML complexity limit in {part}')
        stack.extend((child, depth + 1) for child in element)
    return root


def package(raw):
    require(len(raw) <= MAX_FILE_BYTES, 'Compressed workbook exceeds 20 MiB')
    try:
        archive = zipfile.ZipFile(io.BytesIO(raw))
    except zipfile.BadZipFile as exc:
        raise WorkbookError('Workbook is not a ZIP package') from exc
    with archive:
        entries = archive.infolist()
        require(len(entries) <= MAX_ENTRIES, 'ZIP entry limit exceeded')
        names = [entry.filename for entry in entries]
        require(len(names) == len(set(names)), 'Duplicate ZIP members')
        require(len(names) == len({name.casefold() for name in names}), 'Ambiguous ZIP member casing')
        require(sum(entry.file_size for entry in entries) <= MAX_EXPANDED_BYTES,
                'Expanded workbook exceeds 60 MiB')
        parts = {}
        for entry in entries:
            name = member_name(entry.filename)
            require(not entry.flag_bits & 1, 'Encrypted ZIP member is prohibited')
            require(entry.compress_type in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED),
                    'Unsupported ZIP compression')
            require(allowed_part(name), f'Unsupported package part: {name}')
            try:
                data = archive.read(entry)
            except (RuntimeError, zipfile.BadZipFile, EOFError) as exc:
                raise WorkbookError(f'Invalid ZIP member: {name}') from exc
            require(len(data) == entry.file_size, 'ZIP member size mismatch')
            parts[name] = safe_xml(data, name)
    require('[Content_Types].xml' in parts, 'Missing content types')
    content = parts['[Content_Types].xml']
    require(content.tag == '{' + CONTENT + '}Types', 'Invalid content-type namespace')
    seen = set()
    for item in content:
        require(item.tag in ('{' + CONTENT + '}Default', '{' + CONTENT + '}Override'),
                'Unknown content-type declaration')
        require(item.get('ContentType') in ALLOWED_CONTENT_TYPES, 'Unsupported content type')
        key = (item.tag, item.get('PartName') or item.get('Extension'))
        require(key not in seen, 'Duplicate content-type declaration')
        seen.add(key)
        if item.tag.endswith('Override'):
            require(item.get('PartName', '').startswith('/'), 'Invalid content-type part')
            require(member_name(item.get('PartName')[1:]) in parts, 'Content-type part missing')
    return parts


def rel_part(source):
    return posixpath.join(posixpath.dirname(source), '_rels', posixpath.basename(source) + '.rels')


def target_part(source, target):
    require(isinstance(target, str) and target and '\\' not in target and '%' not in target,
            'Invalid relationship target')
    require(not any(ord(c) < 32 for c in target), 'Invalid relationship target characters')
    parsed = urlsplit(target)
    require(not parsed.scheme and not parsed.netloc and not parsed.query and not parsed.fragment,
            'Internal relationship cannot reference external data')
    value = posixpath.normpath(target.lstrip('/') if target.startswith('/') else
                              posixpath.join(posixpath.dirname(source), target))
    return member_name(value)


def relationships(parts, source, allowed):
    part = rel_part(source) if source else '_rels/.rels'
    root = parts.get(part)
    if root is None:
        return {}
    require(root.tag == '{' + PKG + '}Relationships', 'Invalid relationship namespace')
    result = {}
    for rel in root:
        require(rel.tag == '{' + PKG + '}Relationship', 'Unknown relationship record')
        ident, kind = rel.get('Id'), rel.get('Type')
        require(ident and ident not in result, 'Duplicate or empty relationship ID')
        require(kind in allowed, f'Unsupported relationship type: {kind}')
        mode = rel.get('TargetMode', 'Internal')
        require(mode in ('Internal', 'External'), 'Invalid relationship target mode')
        target = rel.get('Target')
        if mode == 'External':
            require(kind == REL + '/hyperlink', 'External data relationship is prohibited')
            require(target and not any(ord(c) < 32 for c in target), 'Invalid hyperlink')
            url = urlsplit(target)
            require(url.scheme in ('https', 'http') and url.hostname and not url.username
                    and not url.password and '\\' not in target, 'Only HTTP(S) data hyperlinks are allowed')
        else:
            target = target_part(source, target)
            require(target in parts, 'Internal relationship target missing')
        result[ident] = {'type': kind, 'target': target, 'external': mode == 'External'}
    return result


def position(address):
    match = re.fullmatch(r'\$?([A-Z]{1,3})\$?([1-9]\d{0,6})', address or '')
    require(match is not None, 'Invalid cell address')
    column = 0
    for char in match[1]:
        column = column * 26 + ord(char) - 64
    row = int(match[2])
    require(column <= 16384 and row <= 1048576, 'Cell address outside Excel limits')
    return column, row


def column_name(number):
    result = ''
    while number:
        number, digit = divmod(number - 1, 26)
        result = chr(65 + digit) + result
    return result


def rectangle(ref):
    ends = (ref or '').split(':')
    require(len(ends) in (1, 2), 'Invalid range reference')
    first, last = position(ends[0]), position(ends[-1])
    require(first[0] <= last[0] and first[1] <= last[1], 'Reversed range')
    require((last[0] - first[0] + 1) * (last[1] - first[1] + 1) <= MAX_TABLE_CELLS,
            'Range exceeds cell limit')
    return first, last


def inert_formula(text):
    # No expression is executed, including expressions that later validation
    # rejects. Reject external-workbook, DDE and web-data expressions outright.
    require(not re.search(r'\[[^\]]+\][^!\n]*!|\|[^!\n]*!', text or ''),
            'External data formula is prohibited')
    require(not re.search(r'\b(?:WEBSERVICE|RTD|STOCKHISTORY)\s*\(', text or '', re.I),
            'External data function is prohibited')
    return text


def rich_text(element):
    if element is None:
        return ''
    # Phonetic annotations are not part of the cell's underlying text.
    return ''.join(node.text or '' for child in element
                   for node in ([child] if child.tag == S + 't' else
                                child.findall(S + 't') if child.tag == S + 'r' else []))


def cell_record(element, strings, hyperlink=None):
    if element is None:
        return {'value': None, 'formula': None, 'hyperlink': hyperlink, 'dataType': None}
    kind = element.get('t', 'n')
    require(kind in ('n', 's', 'inlineStr', 'b', 'str', 'e', 'd'), 'Unsupported cell type')
    require(len(element.findall(S + 'v')) <= 1 and len(element.findall(S + 'f')) <= 1,
            'Duplicate cell values/formulas')
    raw = element.findtext(S + 'v')
    if kind == 's':
        require(raw is not None and re.fullmatch(r'\d+', raw), 'Invalid shared-string index')
        index = int(raw)
        require(index < len(strings), 'Shared-string index outside pool')
        value = strings[index]
    elif kind == 'inlineStr':
        value = rich_text(element.find(S + 'is'))
    elif kind == 'b':
        require(raw in ('0', '1'), 'Invalid boolean cell')
        value = raw == '1'
    elif kind in ('str', 'e', 'd'):
        value = raw if raw is not None else ('' if kind == 'str' else None)
    elif raw in (None, ''):
        value = None
    else:
        try:
            number = float(raw)
        except ValueError as exc:
            raise WorkbookError('Invalid numeric cell') from exc
        require(math.isfinite(number), 'Non-finite numeric cell')
        value = int(number) if number.is_integer() else number
    formula = element.find(S + 'f')
    result = {'value': value, 'formula': inert_formula(formula.text or '') if formula is not None else None,
              'hyperlink': hyperlink, 'dataType': kind}
    if formula is not None and formula.attrib:
        result['formulaAttributes'] = dict(sorted(formula.attrib.items()))
    return result


def read_workbook(path):
    """Return header-keyed tables and all nonempty off-table cells, unchanged."""
    source = Path(path)
    require(source.stat().st_size <= MAX_FILE_BYTES, 'Compressed workbook exceeds 20 MiB')
    raw = source.read_bytes()
    parts = package(raw)
    root_rels = relationships(parts, '', {
        REL + '/officeDocument', REL + '/extended-properties', REL + '/custom-properties',
        'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
    })
    offices = [r['target'] for r in root_rels.values() if r['type'] == REL + '/officeDocument']
    require(offices == ['xl/workbook.xml'], 'Exactly one standard workbook is required')
    workbook = parts['xl/workbook.xml']
    require(workbook.tag == S + 'workbook', 'Invalid workbook namespace')
    rels = relationships(parts, 'xl/workbook.xml', {REL + '/' + kind for kind in
                         ('worksheet', 'styles', 'theme', 'sharedStrings', 'calcChain')})
    require(workbook.find(S + 'externalReferences') is None, 'External workbook references are prohibited')
    for dangerous in ('connections', 'ddeLinks', 'oleLinks', 'pivotCaches'):
        require(workbook.find(S + dangerous) is None, 'External/unsupported workbook feature')
    strings = []
    string_rels = [r for r in rels.values() if r['type'] == REL + '/sharedStrings']
    require(len(string_rels) <= 1, 'Duplicate shared-string relationships')
    if string_rels:
        pool = parts[string_rels[0]['target']]
        require(pool.tag == S + 'sst', 'Invalid shared-string namespace')
        strings = [rich_text(item) for item in pool.findall(S + 'si')]
    defined_names = []
    for item in workbook.findall(S + 'definedNames/' + S + 'definedName'):
        defined_names.append({'attributes': dict(sorted(item.attrib.items())),
                              'formula': inert_formula(item.text or '')})
    output = {
        'source': {'fileName': source.name, 'sha256': hashlib.sha256(raw).hexdigest(), 'byteLength': len(raw)},
        'tables': {},
        'context': {'sheets': [], 'definedNames': defined_names,
                    'workbookProperties': dict(workbook.find(S + 'workbookPr').attrib)
                    if workbook.find(S + 'workbookPr') is not None else {}},
    }
    seen_sheets, used_sheets, used_tables, names, ids = set(), set(), set(), set(), set()
    sheet_ids = set()
    sheet_records = workbook.findall(S + 'sheets/' + S + 'sheet')
    require(len(sheet_records) == len(SHEETS), 'Exactly nine AP18 worksheets are required')
    for item in sheet_records:
        name, ident = item.get('name'), item.get(R + 'id')
        require(name in SHEETS and name not in seen_sheets, 'Unknown or duplicate AP18 worksheet')
        seen_sheets.add(name)
        require(item.get('sheetId') and item.get('sheetId') not in sheet_ids, 'Duplicate/empty worksheet ID')
        sheet_ids.add(item.get('sheetId'))
        require(ident in rels and rels[ident]['type'] == REL + '/worksheet', 'Missing worksheet relationship')
        part = rels[ident]['target']
        require(part not in used_sheets and part.startswith('xl/worksheets/'), 'Duplicate/invalid worksheet part')
        used_sheets.add(part)
        sheet = parts[part]
        require(sheet.tag == S + 'worksheet', 'Invalid worksheet namespace')
        require(not any(sheet.find(S + tag) is not None for tag in
                        ('oleObjects', 'controls', 'drawing', 'legacyDrawing', 'extLst')),
                'Unsupported active/extension worksheet feature')
        sheet_rels = relationships(parts, part, {REL + '/table', REL + '/hyperlink'})
        links = {}
        for link in sheet.findall(S + 'hyperlinks/' + S + 'hyperlink'):
            relation = link.get(R + 'id')
            if relation:
                require(relation in sheet_rels and sheet_rels[relation]['type'] == REL + '/hyperlink'
                        and sheet_rels[relation]['external'], 'Invalid hyperlink relationship')
                target = sheet_rels[relation]['target']
            else:
                target = '#' + (link.get('location') or '')
                require(target != '#', 'Empty internal hyperlink')
            start, end = rectangle(link.get('ref'))
            for row in range(start[1], end[1] + 1):
                for col in range(start[0], end[0] + 1):
                    address = f'{column_name(col)}{row}'
                    require(address not in links, 'Overlapping hyperlinks')
                    links[address] = target
        cells, hidden_rows = {}, []
        row_ids = set()
        for row in sheet.findall(S + 'sheetData/' + S + 'row'):
            require(re.fullmatch(r'[1-9]\d{0,6}', row.get('r', '')) is not None, 'Invalid worksheet row number')
            number = int(row.get('r'))
            require(1 <= number <= 1048576 and number not in row_ids, 'Invalid/duplicate worksheet row')
            row_ids.add(number)
            if row.get('hidden') in ('1', 'true'):
                hidden_rows.append(number)
            for cell in row.findall(S + 'c'):
                address = cell.get('r')
                require(position(address)[1] == number and address not in cells, 'Duplicate/misplaced worksheet cell')
                cells[address] = cell_record(cell, strings, links.get(address))
        for address, link in links.items():
            if address not in cells:
                cells[address] = cell_record(None, strings, link)
        table_refs = sheet.findall(S + 'tableParts/' + S + 'tablePart')
        require(len(table_refs) == (0 if name == 'Übersicht' else 1), 'Wrong number of native tables')
        occupied = set()
        for table_ref in table_refs:
            relation = table_ref.get(R + 'id')
            require(relation in sheet_rels and sheet_rels[relation]['type'] == REL + '/table',
                    'Missing table relationship')
            table_part = sheet_rels[relation]['target']
            require(table_part.startswith('xl/tables/') and table_part not in used_tables, 'Duplicate/invalid table part')
            used_tables.add(table_part)
            table = parts[table_part]
            require(table.tag == S + 'table', 'Invalid table namespace')
            table_name, table_id = table.get('name'), table.get('id')
            require(table_name and table_name.casefold() not in names and table_id and table_id not in ids,
                    'Duplicate/empty table name or ID')
            names.add(table_name.casefold())
            ids.add(table_id)
            require(table.get('headerRowCount', '1') == '1' and table.get('totalsRowCount', '0') == '0',
                    'Unsupported table header/totals layout')
            require(table.get('tableType', 'worksheet') == 'worksheet', 'External table is prohibited')
            start, end = rectangle(table.get('ref'))
            columns = table.find(S + 'tableColumns')
            require(columns is not None, 'Missing native table columns')
            require(all(column.tag == S + 'tableColumn' for column in columns), 'Unknown table column declaration')
            require(not any(list(column) for column in columns), 'Unsupported table-column formula or extension')
            headers = [column.get('name') for column in columns]
            require(all(isinstance(header, str) and header for header in headers)
                    and len(headers) == len({header.casefold() for header in headers}), 'Duplicate/empty table headers')
            require(len(headers) == end[0] - start[0] + 1 and columns.get('count') == str(len(headers)),
                    'Native table width mismatch')
            for col, header in enumerate(headers, start[0]):
                cell = cells.get(f'{column_name(col)}{start[1]}')
                require(cell is not None and cell['value'] == header and cell['formula'] is None,
                        'Table header differs from worksheet header')
            rows = []
            for row in range(start[1], end[1] + 1):
                current = {}
                for col, header in enumerate(headers, start[0]):
                    address = f'{column_name(col)}{row}'
                    occupied.add(address)
                    current[header] = cells.get(address, cell_record(None, strings))
                if row > start[1]:
                    rows.append({'row': row, 'cells': current})
            output['tables'][name] = {'name': table_name, 'ref': table.get('ref'),
                                      'headers': headers, 'rows': rows}
        context = {address: cell for address, cell in sorted(cells.items(), key=lambda x: position(x[0])[::-1])
                   if address not in occupied and
                   (cell['value'] not in (None, '') or cell['formula'] is not None or cell['hyperlink'] is not None)}
        output['context']['sheets'].append({'name': name, 'state': item.get('state', 'visible'),
                                           'hiddenRows': sorted(hidden_rows), 'cells': context})
    require(used_sheets == {p for p in parts if re.fullmatch(r'xl/worksheets/[^/]+\.xml', p)},
            'Unreferenced or unknown worksheet parts')
    require(used_tables == {p for p in parts if re.fullmatch(r'xl/tables/[^/]+\.xml', p)},
            'Unreferenced or unknown table parts')
    used_relations = {'_rels/.rels', 'xl/_rels/workbook.xml.rels'} | {rel_part(p) for p in used_sheets}
    require(not {p for p in parts if p.endswith('.rels')} - used_relations, 'Unknown relationship parts')
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('workbook', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = read_workbook(args.workbook)
        text = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
        if args.output:
            require(args.output.resolve() != args.workbook.resolve(), 'Output must not overwrite source workbook')
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(text, encoding='utf-8')
        else:
            sys.stdout.write(text)
    except (WorkbookError, OSError) as exc:
        print(f'AP18C workbook import rejected: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
