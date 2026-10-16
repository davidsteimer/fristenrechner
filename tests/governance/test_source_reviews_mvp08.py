# SPDX-License-Identifier: AGPL-3.0-only
"""Narrow official-source provenance checks, using public generated data only."""
import copy
import unittest
from validate_source_reviews import bound_ti_http_original, OFFICIAL_HOSTS


class Mvp08SourceTransport(unittest.TestCase):
    def setUp(self):
        self.source = {
            "sourceId": "JUD-AP23B-TI-PROVISIONAL-JUD", "sourceType": "caseLaw", "jurisdiction": "TI",
            "usageStatus": "productive", "documentVersionDate": "2025-08-13", "officialUrl": None,
            "retrievalUrl": "https://entscheidsuche.ch/docs/TI_Gerichte/TI_TCA_001_52-2025-281_2025-08-13.html",
            "officialLocator": "Erwägungen zur 15-Tage-Frist und Art. 16 Abs. 3 Amtlicher Volltext über HTTP www.sentenze.ti.ch, Dokument 140491. HTTPS-Amtstransport nicht nachgewiesen.",
        }
        self.register = {"registerStatus": "approved"}
        self.events = [{"reviewEventId": "2026-10-15-mvp-08-prerelease.1", "recordStatus": "approved", "entries": [{
            "sourceId": self.source["sourceId"], "outcome": "unchanged", "followUp": {"required": True, "references": [{
                "kind": "riskRecord", "id": "TI-OFFICIAL-HTTP-SOURCE-TRANSPORT", "url": None, "status": "open"}]}}]}]

    def test_exact_accepted_source_relation(self):
        self.assertTrue(bound_ti_http_original(self.source, self.register, self.events))

    def test_each_source_identity_field_is_bound(self):
        for key in self.source:
            with self.subTest(key=key):
                changed = {**self.source, key: "not-the-accepted-value"}
                self.assertFalse(bound_ti_http_original(changed, self.register, self.events))

    def test_unknown_future_or_candidate_approval_rejected(self):
        for change in (lambda events: events[0].update(recordStatus="candidate"),
                       lambda events: events[0].update(reviewEventId="2026-10-16-another.1"),
                       lambda events: events[0]["entries"][0]["followUp"].update(required=False),
                       lambda events: events[0]["entries"][0]["followUp"].update(references=[]),
                       lambda events: events[0]["entries"][0].update(outcome="unclear")):
            events = copy.deepcopy(self.events)
            change(events)
            self.assertFalse(bound_ti_http_original(self.source, self.register, events))
        self.assertFalse(bound_ti_http_original(self.source, {"registerStatus": "candidate"}, self.events))

    def test_gr_official_domain_does_not_turn_mirrors_into_official_sources(self):
        self.assertIn("entscheidsuche.gr.ch", OFFICIAL_HOSTS)
        self.assertNotIn("entscheidsuche.ch", OFFICIAL_HOSTS)
        self.assertNotIn("mcp.opencaselaw.ch", OFFICIAL_HOSTS)
        self.assertNotIn("www.sentenze.ti.ch", OFFICIAL_HOSTS)


if __name__ == "__main__":
    unittest.main()
