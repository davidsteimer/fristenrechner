# SPDX-License-Identifier: AGPL-3.0-only
"""Public, synthetic-only guards for the bounded MVP07 web correction builder."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import prepare_mvp07_web_correction as subject
from prepare_mvp04_artifacts import ArtifactError


class WebCorrectionTests(unittest.TestCase):
    def bundle(self):
        script = subject.TITLE_STYLE + ',height:"auto",minHeight:36,paddingTop:7,paddingBottom:7,'
        script += ','.join(name + ':{}' for name in ["dropdownOptionText", "dropdownItem", "dropdownItemSelected",
                                                   "dropdownItemDisabled", "dropdownItemSelectedAndDisabled"])
        return {"build-manifest.json": json.dumps({"assets": {"javascript": "./assets/app-X.js"}}).encode(),
                "assets/app-X.js": script.encode()}

    def test_complete_shared_style_is_required(self):
        bundle = self.bundle()
        self.assertTrue(subject.audit_correction(bundle)["completeShared0702TitleStyleEmitted"])
        bundle["assets/app-X.js"] = bundle["assets/app-X.js"].replace(b'minHeight:32', b'minHeight:33')
        with self.assertRaises(ArtifactError):
            subject.audit_correction(bundle)

    def test_candidate_cannot_be_sealed_as_approved(self):
        bundle = self.bundle()
        manifest = json.loads(bundle["build-manifest.json"])
        manifest["deployable"] = False
        bundle["build-manifest.json"] = json.dumps(manifest).encode()
        with self.assertRaises(ArtifactError):
            subject.audit_correction(bundle)

    def test_network_transport_and_qa_markers_are_rejected(self):
        for suffix in [b';fetch("remote")', b';new WebSocket("remote")', b';qaPresets']:
            bundle = self.bundle()
            bundle["assets/app-X.js"] += suffix
            with self.assertRaises(ArtifactError):
                subject.audit_correction(bundle)

    def test_personal_absolute_paths_and_keys_are_rejected(self):
        subject.assert_public_bytes({"build-evidence/public.txt": b"<repository>/src/core"})
        for data in [b"/" + b"Users/example/private", b"/" + b"home/example/private", b"BEGIN " + b"PRIVATE KEY"]:
            with self.assertRaises(ArtifactError):
                subject.assert_public_bytes({"receipt.json": data})

    def test_existing_file_is_never_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "existing"
            subject.write_new(path, b"original")
            with self.assertRaises(FileExistsError):
                subject.write_new(path, b"replacement")
            self.assertEqual(path.read_bytes(), b"original")

    def test_zip_is_deterministic_and_exact(self):
        files = {"z.txt": b"last", "a.txt": b"first"}
        packed = subject.deterministic_zip(files)
        self.assertEqual(packed, subject.deterministic_zip(dict(reversed(list(files.items())))))
        self.assertEqual(subject.zip_files(packed), files)

    def test_embedded_data_requires_byte_equality(self):
        files = {"manifest.json": b'{"release":"test"}\n', "profiles/a.json": b'{}\n'}
        module = ('export const mvp07ManifestText = ' + json.dumps(files["manifest.json"].decode()) + ';\n'
                  'export const mvp07Files: ReadonlyMap<string, string> = new Map(' +
                  json.dumps([["profiles/a.json", "{}\n"]]) + ');\n').encode()
        subject.embedded_data_readback(module, files)
        with self.assertRaises(ArtifactError):
            subject.embedded_data_readback(module, {**files, "profiles/a.json": b'{}'})

    def test_standalone_readback_is_explicitly_private_input_free(self):
        # Keep the architecture boundary reviewable without invoking a private archive.
        import inspect
        source = inspect.getsource(subject.check)
        self.assertNotIn("checked_inputs(", source)
        self.assertNotIn("subprocess", source)
        self.assertNotIn("ROOT / CORRECTION", source)
        self.assertNotIn("ROOT / ORIGINAL", source)


if __name__ == "__main__":
    unittest.main()
