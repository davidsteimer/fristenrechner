# SPDX-License-Identifier: AGPL-3.0-only
"""Exact AR host admission using the real public registry, never raw evidence."""
import copy
import unittest

from validate_source_reviews import (
    EVENT_DIRECTORY,
    INDEX_PATH,
    OFFICIAL_HOSTS,
    REGISTER_PATH,
    load_json,
    semantic_errors,
    validate_documents,
)


SOURCE_ID = "SRC-AP23E1-AR-MATERIAL-20180703"
MATERIAL_PATH = "/fileadmin/user_upload/Kantonskanzlei/Rechtsdienst/Volksrechte/Vernehmlassungen/2018_VRPG/Erlaeuternder_Bericht.pdf"
DOMAIN_ERROR = f"{SOURCE_ID}: officialUrl verweist nicht auf eine zugelassene amtliche Domain"


class Mvp09ExactArHost(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.register = load_json(REGISTER_PATH)
        cls.events = [load_json(path) for path in sorted(EVENT_DIRECTORY.glob("*.json"))]
        cls.index = load_json(INDEX_PATH)
        cls.actual_source = next(source for source in cls.register["sources"] if source["sourceId"] == SOURCE_ID)

    def assert_host_rejected(self, host):
        register = copy.deepcopy(self.register)
        source = next(source for source in register["sources"] if source["sourceId"] == SOURCE_ID)
        source["officialUrl"] = f"https://{host}{MATERIAL_PATH}"
        self.assertIn(DOMAIN_ERROR, semantic_errors(register, self.events, self.index))
        self.assertNotIn(host, OFFICIAL_HOSTS)

    def test_actual_approved_material_has_exact_ar_host(self):
        self.assertEqual(self.actual_source["officialUrl"], f"https://ar.ch{MATERIAL_PATH}")
        self.assertEqual(self.actual_source["sourceType"], "officialMaterials")
        self.assertEqual(self.actual_source["jurisdiction"], "AR")
        self.assertIn("ar.ch", OFFICIAL_HOSTS)

    def test_actual_current_registry_passes_complete_semantic_and_schema_validation(self):
        self.assertEqual(validate_documents(self.register, self.events, self.index), [])

    def test_deceptive_suffix_is_rejected(self):
        self.assert_host_rejected("ar.ch.example.org")

    def test_unapproved_www_variant_is_rejected(self):
        self.assert_host_rejected("www.ar.ch")

    def test_unapproved_subdomain_is_rejected(self):
        self.assert_host_rejected("rechtsdienst.ar.ch")

    def test_private_mirrors_remain_rejected_as_official_source(self):
        for host in ("entscheidsuche.ch", "mcp.opencaselaw.ch", "www.lexfind.ch"):
            with self.subTest(host=host):
                self.assert_host_rejected(host)

    def test_ar_text_in_userinfo_does_not_admit_unapproved_host(self):
        self.assert_host_rejected("ar.ch@example.org")

    def test_suffix_without_domain_boundary_is_rejected(self):
        self.assert_host_rejected("notar.ch")


if __name__ == "__main__":
    unittest.main()
