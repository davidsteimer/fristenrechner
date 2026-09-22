#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Publication derivation guards, using synthetic ZIPs and public-only fixtures.

No test reads or copies the private V0.9/V0.10 originals. Synthetic fixtures are
not spreadsheet deliverables and never become public archive evidence.
"""
from __future__ import annotations

import importlib.util
import io
import json
from pathlib import Path
import stat
import tempfile
import unittest
from unittest import mock
import warnings
import zipfile


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "ap18_publication_workbooks", ROOT / "scripts/ap18_publication_workbooks.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

SPREADSHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
WRAPPER = (
    '<mc:AlternateContent><mc:Choice Requires="x15">'
    '<x15ac:absPath url="/synthetic-private-location/"/>'
    '</mc:Choice></mc:AlternateContent>'
)
WORKBOOK = (
    f'<workbook xmlns="{SPREADSHEET_NS}" xmlns:mc="{MODULE.MC}" '
    f'xmlns:x15ac="{MODULE.AC}" xmlns:x15="urn:synthetic:x15">'
    '<bookViews><workbookView activeTab="0"/></bookViews>'
    + WRAPPER
    + '<sheets><sheet name="Synthetic" sheetId="1"/></sheets>'
    '<definedNames><definedName name="Amount">Synthetic!$A$1</definedName></definedNames>'
    '<calcPr calcId="1" fullCalcOnLoad="0"/></workbook>'
).encode()
SHEET = (
    f'<worksheet xmlns="{SPREADSHEET_NS}"><sheetData><row r="1">'
    '<c r="A1" s="1"><v>2</v></c>'
    '<c r="B1" s="1"><f>A1*3</f><v>6</v></c>'
    '</row></sheetData><dataValidations count="1">'
    '<dataValidation type="whole" sqref="A1"><formula1>0</formula1>'
    '</dataValidation></dataValidations></worksheet>'
).encode()
PARTS = {
    "[Content_Types].xml": b'<Types xmlns="urn:synthetic:types"/>',
    MODULE.PART: WORKBOOK,
    "xl/worksheets/sheet1.xml": SHEET,
    "xl/styles.xml": b'<styleSheet><cellXfs count="2"><xf/><xf numFmtId="1"/></cellXfs></styleSheet>',
    "xl/sharedStrings.xml": b'<sst><si><t>Synthetic public label</t></si></sst>',
    "xl/calcChain.xml": b'<calcChain><c r="B1" i="1"/></calcChain>',
    "xl/tables/table1.xml": b'<table ref="A1:B1" name="Synthetic"/>',
}


def zip_bytes(parts=PARTS, *, entries=None, comment=b"synthetic-fixture"):
    """Generate deterministic, isolated parser fixtures, never source workbooks."""
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        archive.comment = comment
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            for name, data in (entries if entries is not None else parts.items()):
                info = name if isinstance(name, zipfile.ZipInfo) else zipfile.ZipInfo(name)
                info.date_time = (2026, 9, 22, 10, 0, 0)
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, data)
    return output.getvalue()


def write(root, relative, data):
    target = root / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return target


class SyntheticFixture(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ap18-publication-test-")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.source = zip_bytes()
        self.record = {
            "version": "synthetic", "directory": "synthetic-input",
            "name": "Synthetic.xlsx", "sourceSha256": MODULE.sha(self.source),
        }
        self.source_path = f"{self.record['directory']}/{self.record['name']}"
        self.archive_path = f"{MODULE.ARCHIVE}/beobachteter-bestand/{self.record['name']}"
        for path in (self.source_path, self.archive_path):
            write(self.root, path, self.source)
        write(self.root, f"{MODULE.ARCHIVE}/manifest.json", b'{"syntheticArchive":true}\n')
        self.record_patch = mock.patch.object(MODULE, "RECORDS", (self.record,))
        self.pin_patch = mock.patch.object(MODULE, "MANIFEST_SHA256", None)
        self.record_patch.start()
        self.pin_patch.start()
        self.addCleanup(self.record_patch.stop)
        self.addCleanup(self.pin_patch.stop)

    def prepare(self):
        result = MODULE.prepare(self.root)
        MODULE.MANIFEST_SHA256 = result["manifestSha256"]
        return result

    def repin_manifest(self, transform):
        manifest = json.loads((self.root / MODULE.MANIFEST).read_bytes())
        transform(manifest)
        data = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
        write(self.root, MODULE.MANIFEST, data)
        MODULE.MANIFEST_SHA256 = MODULE.sha(data)

    def test_prepare_keeps_original_bytes_and_modification_times(self):
        original = {p: ((self.root / p).read_bytes(), (self.root / p).stat().st_mtime_ns)
                    for p in (self.source_path, self.archive_path)}
        result = self.prepare()
        self.assertEqual(result["privateOriginalsChecked"], 2)
        self.assertTrue(result["originalsUnchanged"])
        for path, (data, mtime) in original.items():
            self.assertEqual((self.root / path).read_bytes(), data)
            self.assertEqual((self.root / path).stat().st_mtime_ns, mtime)

    def test_prepare_is_idempotent_without_rewriting_outputs(self):
        self.prepare()
        paths = (MODULE.MANIFEST, MODULE.path_for(self.record))
        baseline = {p: ((self.root / p).read_bytes(), (self.root / p).stat().st_mtime_ns) for p in paths}
        MODULE.prepare(self.root)
        for path, (data, mtime) in baseline.items():
            self.assertEqual((self.root / path).read_bytes(), data)
            self.assertEqual((self.root / path).stat().st_mtime_ns, mtime)

    def test_public_check_succeeds_after_all_private_sources_are_removed(self):
        self.prepare()
        for path in (self.source_path, self.archive_path):
            (self.root / path).unlink()
        result = MODULE.verify(self.root)
        self.assertFalse(result["privateOriginalBytesVerified"])
        self.assertFalse(result["historicalByteIdentityRestored"])
        self.assertFalse(result["originalFilesPublished"])

    def test_private_check_fails_if_private_bytes_are_unavailable(self):
        self.prepare()
        (self.root / self.source_path).unlink()
        with self.assertRaisesRegex(ValueError, "Required regular file unavailable"):
            MODULE.verify(self.root, private=True)

    def test_private_check_succeeds_only_with_matching_private_inputs(self):
        self.prepare()
        self.assertTrue(MODULE.verify(self.root, private=True)["privateOriginalBytesVerified"])

    def test_prepare_rejects_wrong_source_hash(self):
        self.record["sourceSha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "Private original hash mismatch"):
            MODULE.prepare(self.root)
        self.assertFalse((self.root / MODULE.MANIFEST).exists())

    def test_prepare_rejects_different_archive_bytes(self):
        write(self.root, self.archive_path, b"different-synthetic-content")
        with self.assertRaisesRegex(ValueError, "Private original hash mismatch"):
            MODULE.prepare(self.root)

    def test_prepare_refuses_existing_different_publication(self):
        target = write(self.root, MODULE.path_for(self.record), b"keep-existing")
        with self.assertRaisesRegex(ValueError, "Existing publication target differs"):
            MODULE.prepare(self.root)
        self.assertEqual(target.read_bytes(), b"keep-existing")
        self.assertFalse((self.root / MODULE.MANIFEST).exists())

    def test_prepare_preflights_manifest_before_creating_any_copy(self):
        write(self.root, MODULE.MANIFEST, b"keep-existing-manifest")
        with self.assertRaisesRegex(ValueError, "Existing publication target differs"):
            MODULE.prepare(self.root)
        self.assertFalse((self.root / MODULE.path_for(self.record)).exists())

    def test_prepare_rejects_wrong_reviewed_manifest_pin(self):
        MODULE.MANIFEST_SHA256 = "0" * 64
        with self.assertRaisesRegex(ValueError, "Prepared manifest differs"):
            MODULE.prepare(self.root)

    def test_missing_manifest_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "Required regular file unavailable"):
            MODULE.verify(self.root)

    def test_tampered_manifest_fails_reviewed_pin(self):
        self.prepare()
        with (self.root / MODULE.MANIFEST).open("ab") as stream:
            stream.write(b" ")
        with self.assertRaisesRegex(ValueError, "Publication manifest pin mismatch"):
            MODULE.verify(self.root)

    def test_missing_copy_fails_closed(self):
        self.prepare()
        (self.root / MODULE.path_for(self.record)).unlink()
        with self.assertRaisesRegex(ValueError, "Required regular file unavailable"):
            MODULE.verify(self.root)

    def test_tampered_copy_fails_whole_file_hash(self):
        self.prepare()
        write(self.root, MODULE.path_for(self.record), b"tampered")
        with self.assertRaisesRegex(ValueError, "Publication copy hash mismatch"):
            MODULE.verify(self.root)

    def test_historical_manifest_must_remain_byteidentical(self):
        self.prepare()
        write(self.root, f"{MODULE.ARCHIVE}/manifest.json", b"{}")
        with self.assertRaisesRegex(ValueError, "Historical manifest changed"):
            MODULE.verify(self.root)

    def test_inner_part_hash_is_independently_checked(self):
        self.prepare()
        self.repin_manifest(lambda m: m["records"][0]["parts"][0].update(publicationSha256="0" * 64))
        with self.assertRaisesRegex(ValueError, "Publication part hash mismatch"):
            MODULE.verify(self.root)

    def test_unexpected_inventory_is_refused_even_with_whole_file_pin(self):
        self.prepare()
        path = MODULE.path_for(self.record)
        parts = MODULE.unpack((self.root / path).read_bytes())
        parts["xl/worksheets/sheet2.xml"] = SHEET
        content = zip_bytes(parts)
        write(self.root, path, content)
        self.repin_manifest(lambda m: m["records"][0]["publication"].update(
            sha256=MODULE.sha(content), byteLength=len(content)))
        with self.assertRaisesRegex(ValueError, "Publication ZIP inventory differs"):
            MODULE.verify(self.root)

    def test_inconsistent_unchanged_part_evidence_is_refused(self):
        self.prepare()
        self.repin_manifest(lambda m: m["records"][0]["parts"][0].update(unchanged=False))
        with self.assertRaisesRegex(ValueError, "Part evidence inconsistent"):
            MODULE.verify(self.root)

    def test_undeclared_additional_changed_part_is_refused(self):
        self.prepare()
        self.repin_manifest(lambda m: m["records"][0]["parts"][0].update(
            sourceSha256="0" * 64, unchanged=False))
        with self.assertRaisesRegex(ValueError, "Unapproved component delta"):
            MODULE.verify(self.root)

    def test_input_leaf_symlink_is_refused(self):
        path = self.root / self.source_path
        path.unlink()
        path.symlink_to(self.root / self.archive_path)
        with self.assertRaisesRegex(ValueError, "Required regular file unavailable"):
            MODULE.prepare(self.root)

    def test_output_leaf_symlink_is_refused_without_touching_target(self):
        target = write(self.root, "synthetic-target.bin", b"preserve")
        path = self.root / MODULE.path_for(self.record)
        path.parent.mkdir(parents=True)
        path.symlink_to(target)
        with self.assertRaisesRegex(ValueError, "Required regular file unavailable"):
            MODULE.prepare(self.root)
        self.assertEqual(target.read_bytes(), b"preserve")

    def test_read_rejects_parent_symlink_outside_root(self):
        with tempfile.TemporaryDirectory(prefix="ap18-outside-") as outside:
            external = Path(outside)
            write(external, "fixture.bin", b"synthetic")
            (self.root / "escape").symlink_to(external, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "escapes project root"):
                MODULE.read_regular(self.root, "escape/fixture.bin")

    def test_write_rejects_parent_symlink_without_creating_outside_directory(self):
        with tempfile.TemporaryDirectory(prefix="ap18-outside-") as outside:
            external = Path(outside)
            (self.root / "escape").symlink_to(external, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "escapes project root"):
                MODULE.exclusive_write(self.root, "escape/new-directory/fixture.bin", b"synthetic")
            self.assertFalse((external / "new-directory").exists())

    def test_exclusive_write_preserves_different_existing_file(self):
        path = write(self.root, "synthetic-existing.bin", b"preserve")
        with self.assertRaisesRegex(ValueError, "refusing overwrite"):
            MODULE.exclusive_write(self.root, "synthetic-existing.bin", b"different")
        self.assertEqual(path.read_bytes(), b"preserve")


class ParserAndPreservationTests(unittest.TestCase):
    def test_only_metadata_wrapper_bytes_change(self):
        cleaned = MODULE.remove_path_metadata(WORKBOOK)
        self.assertEqual(cleaned, WORKBOOK.replace(WRAPPER.encode(), b""))

    def test_formulas_caches_styles_tables_and_names_are_preserved(self):
        source = zip_bytes()
        result, proof = MODULE.sanitize(source)
        before, after = MODULE.unpack(source), MODULE.unpack(result)
        self.assertEqual(set(before), set(after))
        self.assertEqual([p["path"] for p in proof if not p["unchanged"]], [MODULE.PART])
        for name in before:
            if name != MODULE.PART:
                self.assertEqual(after[name], before[name], name)
        self.assertIn(b'<f>A1*3</f><v>6</v>', after["xl/worksheets/sheet1.xml"])
        self.assertIn(b'Synthetic!$A$1', after[MODULE.PART])
        self.assertIn(b'fullCalcOnLoad="0"', after[MODULE.PART])
        with zipfile.ZipFile(io.BytesIO(source)) as a, zipfile.ZipFile(io.BytesIO(result)) as b:
            self.assertEqual(a.comment, b.comment)
            self.assertEqual(a.namelist(), b.namelist())
            self.assertEqual([e.date_time for e in a.infolist()], [e.date_time for e in b.infolist()])

    def test_no_metadata_and_duplicate_metadata_are_refused(self):
        for data in (WORKBOOK.replace(WRAPPER.encode(), b""),
                     WORKBOOK.replace(WRAPPER.encode(), (WRAPPER + WRAPPER).encode())):
            with self.subTest(case=data.count(b"absPath")), self.assertRaisesRegex(ValueError, "Exactly one"):
                MODULE.remove_path_metadata(data)

    def test_extra_sheet_inside_wrapper_is_refused(self):
        malicious = WRAPPER.replace("</mc:Choice>", '<sheets><sheet name="DoNotRemove"/></sheets></mc:Choice>')
        with self.assertRaisesRegex(ValueError, "choice structure"):
            MODULE.remove_path_metadata(WORKBOOK.replace(WRAPPER.encode(), malicious.encode()))

    def test_extra_wrapper_branch_is_refused(self):
        malicious = WRAPPER.replace("</mc:AlternateContent>", '<mc:Fallback><sheets/></mc:Fallback></mc:AlternateContent>')
        with self.assertRaisesRegex(ValueError, "other content"):
            MODULE.remove_path_metadata(WORKBOOK.replace(WRAPPER.encode(), malicious.encode()))

    def test_unexpected_metadata_attributes_and_text_are_refused(self):
        variants = [
            WRAPPER.replace('url="', 'other="unexpected" url="'),
            WRAPPER.replace('/></mc:Choice>', '>payload</x15ac:absPath></mc:Choice>'),
            WRAPPER.replace('/></mc:Choice>', '/>payload</mc:Choice>'),
            WRAPPER.replace('Requires="x15"', 'Requires="another"'),
        ]
        for variant in variants:
            with self.subTest(variant=variant), self.assertRaises(ValueError):
                MODULE.remove_path_metadata(WORKBOOK.replace(WRAPPER.encode(), variant.encode()))

    def test_nested_metadata_wrapper_is_refused(self):
        variant = b'<nested>' + WRAPPER.encode() + b'</nested>'
        with self.assertRaisesRegex(ValueError, "other content"):
            MODULE.remove_path_metadata(WORKBOOK.replace(WRAPPER.encode(), variant))

    def test_doctype_and_entity_are_refused(self):
        for prefix in (b'<!DOCTYPE workbook>', b'<!ENTITY sample "synthetic">'):
            with self.subTest(prefix=prefix), self.assertRaisesRegex(ValueError, "declarations"):
                MODULE.remove_path_metadata(prefix + WORKBOOK)

    def test_local_path_in_another_part_is_not_silently_removed(self):
        parts = dict(PARTS)
        parts["synthetic-leak.xml"] = b'<note>file:///synthetic-only</note>'
        with self.assertRaisesRegex(ValueError, "Local path pattern remains"):
            MODULE.sanitize(zip_bytes(parts))

    def test_duplicate_zip_member_is_refused(self):
        entries = list(PARTS.items()) + [(MODULE.PART, WORKBOOK)]
        with self.assertRaisesRegex(ValueError, "Duplicate/directory"):
            MODULE.unpack(zip_bytes(entries=entries))

    def test_zip_directory_is_refused(self):
        entries = list(PARTS.items()) + [("directory/", b"")]
        with self.assertRaisesRegex(ValueError, "Unsafe ZIP name|Duplicate/directory"):
            MODULE.unpack(zip_bytes(entries=entries))

    def test_unsafe_zip_paths_are_refused(self):
        for path in ("../escape", "xl/../../escape", "/absolute", "xl\\escape", "xl//double", "./relative"):
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, "Unsafe ZIP name"):
                MODULE.unpack(zip_bytes(entries=list(PARTS.items()) + [(path, b"synthetic")]))

    def test_zip_symlink_is_refused(self):
        info = zipfile.ZipInfo("synthetic-link")
        info.create_system = 3
        info.external_attr = (stat.S_IFLNK | 0o777) << 16
        with self.assertRaisesRegex(ValueError, "symlink ZIP"):
            MODULE.unpack(zip_bytes(entries=list(PARTS.items()) + [(info, b"synthetic-target")]))

    def test_missing_workbook_part_is_refused(self):
        with self.assertRaisesRegex(ValueError, "Workbook part missing"):
            MODULE.unpack(zip_bytes({"synthetic.xml": b"<x/>"}))

    def test_archive_entry_limit_is_bounded(self):
        entries = [(MODULE.PART, WORKBOOK)] + [(f"synthetic-{i}.xml", b"<x/>") for i in range(256)]
        with self.assertRaisesRegex(ValueError, "bounded archive limits"):
            MODULE.unpack(zip_bytes(entries=entries))


class ActualPublicPinTests(unittest.TestCase):
    """The real public proof is independently usable, without private originals."""

    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="ap18-public-only-")
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        data = (ROOT / MODULE.MANIFEST).read_bytes()
        self.manifest = json.loads(data)
        paths = [MODULE.MANIFEST, self.manifest["sourceArchiveManifest"]["path"]]
        paths.extend(record["publication"]["path"] for record in self.manifest["records"])
        for path in paths:
            write(self.root, path, (ROOT / path).read_bytes())

    def test_actual_manifest_has_reviewed_pin_and_two_public_derivatives(self):
        self.assertEqual(MODULE.sha((self.root / MODULE.MANIFEST).read_bytes()), MODULE.MANIFEST_SHA256)
        self.assertEqual({r["version"] for r in self.manifest["records"]}, {"0.9", "0.10"})
        self.assertFalse(self.manifest["originalFilesPublished"])
        self.assertFalse(self.manifest["historicalOriginalsRecovered"])
        self.assertFalse(self.manifest["publicVerificationCanReadPrivateOriginals"])
        for record in self.manifest["records"]:
            self.assertEqual(record["removedElementCount"], 1)
            self.assertEqual(record["changedParts"], [MODULE.PART])
        originals = {r["version"]: r["sourceSha256"] for r in MODULE.RECORDS}
        self.assertEqual({r["version"]: r["sourceSha256"] for r in self.manifest["records"]}, originals)

    def test_actual_public_files_verify_without_private_inputs(self):
        self.assertEqual(len(list(self.root.rglob("*.xlsx"))), 2)
        result = MODULE.verify(self.root)
        self.assertEqual(result["publicationCopies"], 2)
        self.assertFalse(result["privateOriginalBytesVerified"])
        self.assertFalse(result["historicalByteIdentityRestored"])

    def test_actual_private_verification_never_succeeds_with_public_files_only(self):
        with self.assertRaisesRegex(ValueError, "Required regular file unavailable"):
            MODULE.verify(self.root, private=True)


if __name__ == "__main__":
    unittest.main()
