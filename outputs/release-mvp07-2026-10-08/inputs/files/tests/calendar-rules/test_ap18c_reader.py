"""Independent hostile-package and native-value tests of the AP18C reader."""
import hashlib
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import warnings
import xml.etree.ElementTree as ET
import zipfile


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('ap18c_reader', ROOT / 'scripts/ap18c_read_workbook.py')
READER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(READER)
SOURCE = ROOT / 'outputs/ap18b-05-bedingte-feiertage-2026-09-22/2026-09-22_Feiertagsmatrix_Schweiz_AP18B-05_V0.12.xlsx'
SHA = 'd4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65'
S, R, PKG = READER.S, READER.R, READER.PKG


class WorkbookReaderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = SOURCE.read_bytes()
        with zipfile.ZipFile(io.BytesIO(cls.raw)) as source:
            cls.parts = {name: source.read(name) for name in source.namelist()}
        cls.snapshot = READER.read_workbook(SOURCE)

    def mutation(self, changes=None, xml_changes=None, duplicate=None):
        parts = dict(self.parts)
        for name, alter in (xml_changes or {}).items():
            root = ET.fromstring(parts[name])
            alter(root)
            parts[name] = ET.tostring(root, encoding='utf-8', xml_declaration=True)
        parts.update(changes or {})
        with tempfile.TemporaryDirectory(prefix='ap18c-reader-') as directory:
            target = Path(directory) / 'candidate.xlsx'
            with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
                for name, content in parts.items():
                    archive.writestr(name, content)
                if duplicate:
                    with warnings.catch_warnings():
                        warnings.simplefilter('ignore', UserWarning)
                        archive.writestr(duplicate, parts[duplicate])
            return READER.read_workbook(target)

    def rejects(self, pattern, **kwargs):
        with self.assertRaisesRegex(READER.WorkbookError, pattern):
            self.mutation(**kwargs)

    def test_actual_approved_source_inventory(self):
        self.assertEqual(self.snapshot['source']['sha256'], SHA)
        self.assertEqual(self.snapshot['source']['byteLength'], 391640)
        self.assertEqual({name: len(table['rows']) for name, table in self.snapshot['tables'].items()}, {
            'Feiertagskalender': 488, 'Gemeinwesen': 27, 'Feiertagsregeln': 479,
            'Geltungsbereiche': 49, 'Gebietszuordnungen': 95, 'Rechtsquellen': 84,
            'Verfahrensbezug': 92, 'Quellenprüfung': 90,
        })
        self.assertEqual([sheet['name'] for sheet in self.snapshot['context']['sheets']], list(READER.SHEETS))
        self.assertEqual(hashlib.sha256(SOURCE.read_bytes()).hexdigest(), SHA)

    def test_headers_are_keys_and_formulas_are_inert(self):
        rule = self.snapshot['tables']['Feiertagsregeln']['rows'][-1]
        self.assertEqual(rule['row'], 485)
        self.assertEqual(rule['cells']['Regel-ID']['value'], 'NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE')
        self.assertEqual(rule['cells']['Kalenderbedingung']['value'], 'Nur Montag')
        self.assertIsInstance(rule['cells']['Rohdatum']['formula'], str)
        self.assertIsInstance(rule['cells']['Rohdatum']['value'], int)

    def test_native_hyperlinks_remain_data(self):
        sources = self.snapshot['tables']['Rechtsquellen']['rows']
        links = [cell['hyperlink'] for row in sources for cell in row['cells'].values() if cell['hyperlink']]
        self.assertEqual(len(links), 84)
        self.assertTrue(all(link.startswith(('https://', 'http://')) for link in links))

    def test_no_author_or_absolute_path_metadata(self):
        self.assertEqual(set(self.snapshot['source']), {'fileName', 'sha256', 'byteLength'})
        self.assertNotIn(str(ROOT), str(self.snapshot))
        self.assertEqual(set(self.snapshot), {'source', 'tables', 'context'})

    def test_actual_off_table_context_and_helpers_preserved(self):
        sheets = {sheet['name']: sheet for sheet in self.snapshot['context']['sheets']}
        self.assertEqual(sheets['Übersicht']['cells']['B4']['value'], 2027)
        self.assertIn('0.6.0', sheets['Übersicht']['cells']['A36']['value'])
        self.assertIn('AD23', sheets['Feiertagsregeln']['cells'])

    def test_hidden_rows_not_dropped(self):
        def alter(root):
            root.find(S + 'sheetData/' + S + 'row[@r="7"]').set('hidden', '1')
        result = self.mutation(xml_changes={'xl/worksheets/sheet4.xml': alter})
        self.assertEqual(len(result['tables']['Feiertagsregeln']['rows']), 479)
        context = next(sheet for sheet in result['context']['sheets'] if sheet['name'] == 'Feiertagsregeln')
        self.assertIn(7, context['hiddenRows'])

    def test_inline_string_boolean_and_shared_formula_follower(self):
        def alter(root):
            row = root.find(S + 'sheetData/' + S + 'row[@r="1"]')
            cell = ET.SubElement(row, S + 'c', {'r': 'Z1', 't': 'b'})
            ET.SubElement(cell, S + 'v').text = '1'
            cell = ET.SubElement(row, S + 'c', {'r': 'AA1', 't': 'inlineStr'})
            rich = ET.SubElement(cell, S + 'is')
            ET.SubElement(rich, S + 't').text = 'A'
            phonetic = ET.SubElement(rich, S + 'rPh')
            ET.SubElement(phonetic, S + 't').text = 'ignored'
            run = ET.SubElement(rich, S + 'r')
            ET.SubElement(run, S + 't').text = 'B'
            cell = ET.SubElement(row, S + 'c', {'r': 'AB1'})
            ET.SubElement(cell, S + 'f', {'t': 'shared', 'si': '2'})
            ET.SubElement(cell, S + 'v').text = '7'
        result = self.mutation(xml_changes={'xl/worksheets/sheet1.xml': alter})
        cells = result['context']['sheets'][0]['cells']
        self.assertIs(cells['Z1']['value'], True)
        self.assertEqual(cells['AA1']['value'], 'AB')
        self.assertEqual(cells['AB1']['formula'], '')
        self.assertEqual(cells['AB1']['formulaAttributes'], {'t': 'shared', 'si': '2'})

    def test_defined_names_preserved_without_execution(self):
        def alter(root):
            names = ET.SubElement(root, S + 'definedNames')
            ET.SubElement(names, S + 'definedName', {'name': 'ReviewYear'}).text = "'Übersicht'!$B$4"
        result = self.mutation(xml_changes={'xl/workbook.xml': alter})
        self.assertEqual(result['context']['definedNames'], [
            {'attributes': {'name': 'ReviewYear'}, 'formula': "'Übersicht'!$B$4"}])

    def test_rejects_duplicate_zip(self):
        self.rejects('Duplicate ZIP', duplicate='xl/workbook.xml')

    def test_rejects_case_alias_zip(self):
        self.rejects('casing', changes={'XL/workbook.xml': self.parts['xl/workbook.xml']})

    def test_rejects_traversal_zip(self):
        self.rejects('Unsafe ZIP', changes={'../escape.xml': b'<x/>'})

    def test_rejects_macro_part(self):
        self.rejects('Unsupported package part', changes={'xl/vbaProject.bin': b'not executed'})

    def test_rejects_encrypted_zip_flag_before_decompression(self):
        raw = bytearray(self.raw)
        central = raw.index(b'PK\x01\x02')
        raw[central + 8] |= 1
        with self.assertRaisesRegex(READER.WorkbookError, 'Encrypted ZIP'):
            READER.package(bytes(raw))

    def test_legal_relative_relationship_is_normalized(self):
        def alter(root):
            relation = next(rel for rel in root if rel.get('Type') == READER.REL + '/table')
            relation.set('Target', '../tables/table3.xml')
        result = self.mutation(xml_changes={'xl/worksheets/_rels/sheet4.xml.rels': alter})
        self.assertEqual(result['tables']['Feiertagsregeln'], self.snapshot['tables']['Feiertagsregeln'])

    def test_rejects_dtd_utf8_and_utf16(self):
        for encoding in ('utf-8', 'utf-16'):
            with self.subTest(encoding=encoding):
                xml = '<?xml version="1.0"?><!DOCTYPE workbook [<!ENTITY x "value">]><workbook/>'
                self.rejects('DTD/entities', changes={'xl/workbook.xml': xml.encode(encoding)})

    def test_rejects_unbound_worksheet_part_even_wrong_namespace(self):
        self.rejects('unknown worksheet parts', changes={'xl/worksheets/orphan.xml': b'<unrelated/>'})

    def test_rejects_unbound_table_part(self):
        self.rejects('unknown table parts', changes={'xl/tables/orphan.xml': b'<unrelated/>'})

    def test_rejects_duplicate_table_headers(self):
        def alter(root):
            cols = root.find(S + 'tableColumns')
            cols[1].set('name', cols[0].get('name'))
        self.rejects('Duplicate/empty table headers', xml_changes={'xl/tables/table3.xml': alter})

    def test_rejects_table_header_cell_mismatch(self):
        def alter(root):
            root.find(S + 'tableColumns')[0].set('name', 'Changed but cell untouched')
        self.rejects('differs from worksheet', xml_changes={'xl/tables/table3.xml': alter})

    def test_rejects_unknown_sheet_name(self):
        def alter(root):
            root.find(S + 'sheets')[0].set('name', 'Unknown')
        self.rejects('Unknown or duplicate', xml_changes={'xl/workbook.xml': alter})

    def test_rejects_external_workbook_relation(self):
        def alter(root):
            ET.SubElement(root, '{' + PKG + '}Relationship', {
                'Id': 'externalData', 'Type': READER.REL + '/externalLink',
                'TargetMode': 'External', 'Target': 'https://example.invalid/data.xlsx'})
        self.rejects('Unsupported relationship', xml_changes={'xl/_rels/workbook.xml.rels': alter})

    def test_rejects_javascript_hyperlink(self):
        def alter(root):
            link = next(rel for rel in root if rel.get('Type') == READER.REL + '/hyperlink')
            link.set('Target', 'javascript:alert(1)')
        self.rejects('Only HTTP', xml_changes={'xl/worksheets/_rels/sheet6.xml.rels': alter})

    def test_rejects_escaping_internal_relationship(self):
        def alter(root):
            root[0].set('Target', '../../../escape.xml')
        self.rejects('Unsafe ZIP', xml_changes={'xl/_rels/workbook.xml.rels': alter})

    def test_rejects_external_data_formula(self):
        def alter(root):
            cell = root.find(S + 'sheetData/' + S + 'row[@r="7"]/' + S + 'c[@r="W7"]')
            cell.find(S + 'f').text = "'[external.xlsx]Sheet1'!A1"
        self.rejects('External data formula', xml_changes={'xl/worksheets/sheet4.xml': alter})

    def test_rejects_nonfinite_number(self):
        def alter(root):
            cell = root.find(S + 'sheetData/' + S + 'row[@r="7"]/' + S + 'c[@r="W7"]')
            cell.find(S + 'v').text = 'NaN'
        self.rejects('Non-finite', xml_changes={'xl/worksheets/sheet4.xml': alter})

    def test_rejects_bad_shared_string_index(self):
        def alter(root):
            cell = root.find(S + 'sheetData/' + S + 'row[@r="7"]/' + S + 'c[@r="A7"]')
            cell.set('t', 's')
            cell.find(S + 'v').text = '99999999'
        self.rejects('outside pool', xml_changes={'xl/worksheets/sheet4.xml': alter})

    def test_bounds_are_checked_before_expansion(self):
        for key, value, message in (
            ('MAX_FILE_BYTES', 1, 'Compressed'), ('MAX_EXPANDED_BYTES', 1, 'Expanded'),
            ('MAX_ENTRIES', 1, 'entry limit'),
        ):
            with self.subTest(key=key), patch.object(READER, key, value):
                with self.assertRaisesRegex(READER.WorkbookError, message):
                    READER.read_workbook(SOURCE)


if __name__ == '__main__':
    unittest.main()
