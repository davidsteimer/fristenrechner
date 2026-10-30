"""R10-B exact host/mirror/context counterchecks. Synthetic fixtures only."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from urllib.parse import urlparse
from unittest.mock import patch
import validate_source_reviews as validator


class Mvp10SourceReviewTests(unittest.TestCase):
    def test_exact_nine_official_hosts_are_not_wildcards(self):
        hosts = {"rechtsprechung.tg.ch", "relevancy.bger.ch", "justice.ge.ch", "bl.swisslex.ch",
                 "rechtsprechung.gerichte.bs.ch", "www.ai.ch", "api-justsearche.vs.ch",
                 "decwork.ag.ch", "grgeko.tg.ch"}
        for host in hosts:
            self.assertIn(host, validator.OFFICIAL_HOSTS)
            for altered in (host + ".example.org", "evil." + host, "not-" + host):
                self.assertNotIn(altered, validator.OFFICIAL_HOSTS)
        self.assertNotIn("entscheidsuche.ch", validator.OFFICIAL_HOSTS)
        self.assertNotIn("mcp.opencaselaw.ch", validator.OFFICIAL_HOSTS)
        schemas, registry = validator.load_schemas()
        register = validator.load_json(validator.REGISTER_PATH)
        for host in hosts:
            value = copy.deepcopy(register)
            value["sources"][0]["officialUrl"] = "http://" + host + "/not-https"
            self.assertTrue(validator.schema_errors(value, schemas["source-register.schema.json"], registry, "synthetic"))

    def mirror(self, source_id, jurisdiction, url):
        source = {"sourceId": source_id, "sourceType": "caseLaw", "jurisdiction": jurisdiction,
                  "usageStatus": "supporting", "officialUrl": None, "retrievalUrl": url}
        event = {"reviewEventId": "2026-10-28-mvp-010-prerelease.1", "recordStatus": "approved",
                 "entries": [{"sourceId": source_id, "affected": {"resolutionMode": "explicit",
                              "profileIds": [], "calendarIds": [], "componentIds": []}}]}
        return source, [event]

    def test_five_mirror_exceptions_are_exact_identity_url_role_and_zero_use(self):
        self.assertEqual(len(validator.R10_SUPPORTING_MIRRORS), 5)
        for source_id, (jurisdiction, url) in validator.R10_SUPPORTING_MIRRORS.items():
            source, events = self.mirror(source_id, jurisdiction, url)
            self.assertTrue(validator.bound_r10_supporting_mirror(source, events))
            for key, value in (("sourceId", "FOREIGN"), ("sourceType", "statute"), ("jurisdiction", "BE"),
                               ("usageStatus", "productive"), ("officialUrl", url),
                               ("retrievalUrl", url + "?changed"), ("retrievalUrl", url.replace("https:", "http:"))):
                changed = dict(source)
                changed[key] = value
                self.assertFalse(validator.bound_r10_supporting_mirror(changed, events))
            changed_events = copy.deepcopy(events)
            changed_events[0]["entries"][0]["affected"]["componentIds"] = ["invented-active-rule"]
            self.assertFalse(validator.bound_r10_supporting_mirror(source, changed_events))
            self.assertFalse(validator.bound_r10_supporting_mirror(source, []))

    def test_five_administrative_contexts_survive_the_independent_python_walker(self):
        keys = ("pathId", "lawId", "holidayBindingId", "suspensionProfileId", "qualificationPolicyId")
        for key in keys:
            self.assertIn(key, validator.IDENTIFIER_KEYS)
        with tempfile.TemporaryDirectory(prefix="mvp10-context-") as directory:
            root = Path(directory)
            release = root / "data" / "releases" / "2099-01-01-synthetic.1"
            release.mkdir(parents=True)
            (release / "manifest.json").write_text(json.dumps({"releaseId": "2099-01-01-synthetic.1",
                "sourceSummary": {"sourceIds": ["SRC-SYNTHETIC"]}, "artifacts": [{"path": "fixture.json"}]}))
            document = {key: "synthetic-" + key for key in keys}
            document["sourceRefs"] = [{"sourceId": "SRC-SYNTHETIC", "locator": "Synthetic only"}]
            (release / "fixture.json").write_text(json.dumps(document))
            with patch.object(validator, "REPOSITORY_ROOT", root):
                ids, usage = validator.release_usage("2099-01-01-synthetic.1")
            self.assertEqual(ids, {"SRC-SYNTHETIC"})
            self.assertEqual(usage["SRC-SYNTHETIC"]["componentIds"], {"synthetic-" + key for key in keys})


if __name__ == "__main__":
    unittest.main()
