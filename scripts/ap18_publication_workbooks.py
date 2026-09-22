#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only
"""Derive privacy-clean publication copies without resaving any workbook model.

Only a metadata-only AlternateContent subtree in xl/workbook.xml is removed.
Originals, accepted references, cells, formulas, caches and styles are not edited.
Public verification never claims access to the private original bytes.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import stat
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = "outputs/archiv/ap18/2026-09-22"
MANIFEST = f"{ARCHIVE}/publication-manifest.json"
MANIFEST_SHA256 = "9ff1bfff327b28e2f709d4b9be879ae8aadd49c0dc10d72ebe301dcd91741c01"
PART = "xl/workbook.xml"
MC = "http://schemas.openxmlformats.org/markup-compatibility/2006"
AC = "http://schemas.microsoft.com/office/spreadsheetml/2010/11/ac"
RECORDS = (
    {"version": "0.9", "directory": "outputs/ap18b-03-vs-fr-so-ge-2026-09-13",
     "name": "2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx",
     "sourceSha256": "7663aacdca75d66c565ca6c049c9958dafad792ec46ec0d0515b4cb1505e8453"},
    {"version": "0.10", "directory": "outputs/ap18b-04-restkantone-2026-09-13",
     "name": "2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10.xlsx",
     "sourceSha256": "57b3c3c668bb00360cf94da159a29509116691f9282419ebc7a87cdf8b88b619"},
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def path_for(record):
    return f"{ARCHIVE}/publikationskopien/{Path(record['name']).stem}_Publikationskopie.xlsx"


def read_regular(root, relative):
    file = root / relative
    require(not file.is_symlink() and file.is_file(), f"Required regular file unavailable: {relative}")
    require(file.resolve().is_relative_to(root.resolve()), "Input escapes project root")
    return file.read_bytes()


def unpack(data):
    result = {}
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        require(len(entries) <= 256 and sum(e.file_size for e in entries) <= 32 * 1024 * 1024,
                "Workbook exceeds bounded archive limits")
        for entry in entries:
            name = entry.filename
            path = PurePosixPath(name)
            require(name and not name.startswith('/') and '\\' not in name
                    and '..' not in path.parts and name == path.as_posix(), "Unsafe ZIP name")
            require(not entry.is_dir() and name not in result, "Duplicate/directory ZIP member")
            require(not entry.flag_bits & 1 and stat.S_IFMT(entry.external_attr >> 16) != stat.S_IFLNK,
                    "Encrypted or symlink ZIP member")
            result[name] = archive.read(entry)
        require(PART in result and archive.testzip() is None, "Workbook part missing or CRC error")
    return result


def xml(data):
    require(b'<!DOCTYPE' not in data.upper() and b'<!ENTITY' not in data.upper(), "XML declarations not allowed")
    return ET.fromstring(data)


def remove_path_metadata(data):
    root = xml(data)
    nodes = list(root.iter(f'{{{AC}}}absPath'))
    require(len(nodes) == 1, "Exactly one path-metadata element required")
    node = nodes[0]
    parent = {child: owner for owner in root.iter() for child in owner}
    choice, container = parent[node], parent[parent[node]]
    require(node.attrib.keys() == {'url'} and len(node) == 0 and not (node.text or '').strip(),
            "Path metadata contains unexpected payload")
    require(choice.tag == f'{{{MC}}}Choice' and list(choice) == [node]
            and choice.attrib == {'Requires': 'x15'} and not (choice.text or '').strip(),
            "Unexpected metadata choice structure")
    require(container.tag == f'{{{MC}}}AlternateContent' and list(container) == [choice]
            and not container.attrib and parent[container] is root
            and not (container.text or '').strip(), "Metadata wrapper contains other content")
    require(not (node.tail or '').strip() and not (choice.tail or '').strip(), "Unexpected metadata tail")
    matches = list(re.finditer(rb'<mc:AlternateContent(?:\s[^<>]*)?>.*?</mc:AlternateContent>', data, re.S))
    require(len(matches) == 1, "Exactly one known metadata wrapper required")
    match = matches[0]
    require(b'<x15ac:absPath ' in match.group(), "Unexpected metadata prefix")
    # Remove this raw span only. Do not serialise or normalise the remaining XML.
    cleaned = data[:match.start()] + data[match.end():]
    root.remove(container)
    parsed = xml(cleaned)
    require(ET.tostring(root) == ET.tostring(parsed), "Unexpected workbook semantic delta")
    require(not list(parsed.iter(f'{{{AC}}}absPath')), "Path metadata remains")
    return cleaned


def sanitize(source):
    before = unpack(source)
    after = dict(before, **{PART: remove_path_metadata(before[PART])})
    output = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(source)) as original:
        with zipfile.ZipFile(output, 'w') as target:
            target.comment = original.comment
            for info in original.infolist():
                target.writestr(copy.copy(info), after[info.filename], compresslevel=9)
    result = output.getvalue()
    require(unpack(result) == after, "Saved publication copy differs on readback")
    require([name for name in before if before[name] != after[name]] == [PART], "Unexpected changed part")
    for data in after.values():
        require(b'/Users/' not in data and b'file:///' not in data and b'\\Users\\' not in data,
                "Local path pattern remains in publication copy")
    proof = [{"path": name, "sourceSha256": sha(before[name]),
              "publicationSha256": sha(after[name]), "unchanged": before[name] == after[name]}
             for name in sorted(before)]
    return result, proof


def expected_records(root):
    records, copies, originals = [], {}, {}
    for record in RECORDS:
        source_path = f"{record['directory']}/{record['name']}"
        archive_path = f"{ARCHIVE}/beobachteter-bestand/{record['name']}"
        source, archive = read_regular(root, source_path), read_regular(root, archive_path)
        require(sha(source) == record['sourceSha256'] and archive == source, "Private original hash mismatch")
        originals.update({source_path: sha(source), archive_path: sha(archive)})
        data, parts = sanitize(source)
        relative = path_for(record)
        copies[relative] = data
        records.append({"version": record['version'], "sourceSha256": sha(source),
                        "publication": {"path": relative, "sha256": sha(data), "byteLength": len(data)},
                        "removedElementCount": 1, "changedParts": [PART], "parts": parts})
    return records, copies, originals


def exclusive_write(root, relative, data):
    file = root / relative
    require(file.parent.resolve().is_relative_to(root.resolve()), "Output escapes project root")
    file.parent.mkdir(parents=True, exist_ok=True)
    require(file.parent.resolve().is_relative_to(root.resolve()), "Output escapes project root")
    try:
        with file.open('xb') as stream:
            stream.write(data)
    except FileExistsError:
        require(read_regular(root, relative) == data, f"Existing output differs, refusing overwrite: {relative}")
    require(read_regular(root, relative) == data, "Written copy differs on readback")


def create_manifest(root, records):
    original_path = f'{ARCHIVE}/manifest.json'
    return {"formatVersion": "1.0.0", "kind": "workbookPublicationDerivations", "recordedOn": "2026-09-22",
            "decision": {"path": "docs/fachrecht/publikationskopien-ap18.md", "selectedOption": 2},
            "sourceArchiveManifest": {"path": original_path, "sha256": sha(read_regular(root, original_path))},
            "originalFilesPublished": False, "historicalOriginalsRecovered": False,
            "privateDerivationVerifiedOn": "2026-09-22", "publicVerificationCanReadPrivateOriginals": False,
            "transform": {"part": PART, "element": "x15ac:absPath", "namespace": AC, "attribute": "url",
                          "operation": "remove-single-path-element-and-its-otherwise-empty-mc-wrapper",
                          "preserveOtherUncompressedPartBytes": True, "recalculateWorkbook": False,
                          "resaveUsingSpreadsheetEngine": False, "zipCompressionLevel": 9},
            "records": records}


def prepare(root=ROOT):
    records, copies, originals = expected_records(root)
    manifest = create_manifest(root, records)
    encoded = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
    if MANIFEST_SHA256:
        require(sha(encoded) == MANIFEST_SHA256, "Prepared manifest differs from reviewed pin")
    # Validate all existing targets before creating any new output.
    for relative, data in {**copies, MANIFEST: encoded}.items():
        if (root / relative).exists() or (root / relative).is_symlink():
            require(read_regular(root, relative) == data, "Existing publication target differs")
    for relative, data in copies.items():
        exclusive_write(root, relative, data)
    exclusive_write(root, MANIFEST, encoded)
    for relative, digest in originals.items():
        require(sha(read_regular(root, relative)) == digest, "Private original changed")
    return {"manifestSha256": sha(encoded), "publicationCopies": [r['publication'] for r in records],
            "privateOriginalsChecked": len(originals), "originalsUnchanged": True}


def verify(root=ROOT, private=False):
    data = read_regular(root, MANIFEST)
    require(MANIFEST_SHA256 is not None and sha(data) == MANIFEST_SHA256, "Publication manifest pin mismatch")
    manifest = json.loads(data)
    require(sha(read_regular(root, manifest['sourceArchiveManifest']['path']))
            == manifest['sourceArchiveManifest']['sha256'], "Historical manifest changed")
    for record in manifest['records']:
        publication = record['publication']
        content = read_regular(root, publication['path'])
        require(len(content) == publication['byteLength'] and sha(content) == publication['sha256'], "Publication copy hash mismatch")
        parts = unpack(content)
        require(set(parts) == {p['path'] for p in record['parts']}, "Publication ZIP inventory differs")
        for part in record['parts']:
            require(sha(parts[part['path']]) == part['publicationSha256'], "Publication part hash mismatch")
            require(part['unchanged'] == (part['sourceSha256'] == part['publicationSha256']), "Part evidence inconsistent")
        require([p['path'] for p in record['parts'] if not p['unchanged']] == [PART], "Unapproved component delta")
        require(not list(xml(parts[PART]).iter(f'{{{AC}}}absPath')), "Path metadata found")
    if private:
        records, copies, originals = expected_records(root)
        require(manifest == create_manifest(root, records), "Private derivation evidence differs")
        for relative, content in copies.items():
            require(read_regular(root, relative) == content, "Private rederivation differs")
    return {"status": "verifiedPublicationDerivatives", "publicationCopies": len(manifest['records']),
            "privateOriginalBytesVerified": private, "historicalByteIdentityRestored": False,
            "originalFilesPublished": False, "sourceArchiveManifestUnchanged": True}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['prepare', 'check', 'check-private'])
    args = parser.parse_args()
    result = prepare() if args.mode == 'prepare' else verify(private=args.mode == 'check-private')
    print(json.dumps(result, ensure_ascii=False, indent=2))
