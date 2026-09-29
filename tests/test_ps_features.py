"""
Test Suite for Smart India Hackathon (SIH) Problem-Statement Aligned Capabilities:
1. Deterministic Multi-Regime IP Path Router (Patents, TM, GI, Designs, PPVFR)
2. Verified Official Registries and Portal Helper
3. 2024 Law & Policy Highlights (BDA ABS 2024, WIPO GRATK 2024, Patents Rules 2024)
4. Expert Human Facilitator Escalation Workflow
5. DPDP-Aligned Prototype Privacy Governance Notice
6. Bilingual English and Hindi Synthesis with Citation Preservation
"""

import unittest
from backend.ip_router import IPPathRouter, IPPathRouterInput
from backend.registries import get_official_registries
from backend.highlights_2024 import get_2024_highlights
from backend.escalation import ExpertEscalationManager, EscalationRequest
from backend.privacy import get_privacy_notice
from backend.synthesizer import synthesizer
from backend.guardrails import MANDATORY_LEGAL_DISCLAIMER_HI

class TestPSFeatures(unittest.TestCase):

    def test_ip_router_classical_formulation(self):
        """Test IP Path Router for classical formulation (Turmeric + Black Pepper)."""
        payload = IPPathRouterInput(
            category="Classical / Generic Ayurvedic Medicine",
            product_name="Haridra Maricha Churna",
            has_novel_technical_feature=False,
            has_brand_identity=True,
            has_novel_packaging=True,
            is_geography_specific=False,
            involves_plant_cultivar=False
        )
        res = IPPathRouter.evaluate(payload)
        self.assertEqual(res.product_name, "Haridra Maricha Churna")
        self.assertGreater(len(res.paths), 0)

        # Check patent path: should not be recommended due to Section 3(p)
        patent_rec = next((r for r in res.paths if r.ip_regime == "Patents"), None)
        self.assertIsNotNone(patent_rec)
        self.assertFalse(patent_rec.is_recommended)
        self.assertIn("3(p)", patent_rec.governing_law)

        # Check trade mark path: should be recommended
        tm_rec = next((r for r in res.paths if r.ip_regime == "Trade Marks"), None)
        self.assertIsNotNone(tm_rec)
        self.assertTrue(tm_rec.is_recommended)

        # Check designs path: should be recommended due to novel packaging
        design_rec = next((r for r in res.paths if r.ip_regime == "Designs"), None)
        self.assertIsNotNone(design_rec)
        self.assertTrue(design_rec.is_recommended)

    def test_ip_router_phytopharmaceutical_extract(self):
        """Test IP Path Router for a novel standardized botanical extract."""
        payload = IPPathRouterInput(
            category="Phytopharmaceutical Drug",
            product_name="Standardized Curcuminoid Nano-Emulsion",
            has_novel_technical_feature=True,
            has_brand_identity=True,
            has_novel_packaging=False,
            is_geography_specific=False,
            involves_plant_cultivar=False
        )
        res = IPPathRouter.evaluate(payload)
        patent_rec = next((r for r in res.paths if r.ip_regime == "Patents"), None)
        self.assertIsNotNone(patent_rec)
        self.assertTrue(patent_rec.is_recommended)
        self.assertIn("process", patent_rec.relevance_reason.lower())

    def test_ip_router_gi_and_ppvfr(self):
        """Test IP Path Router for geographically rooted agricultural cultivar."""
        payload = IPPathRouterInput(
            category="Medicinal Plant Cultivar",
            product_name="Malabar Special Turmeric Clone",
            has_novel_technical_feature=False,
            has_brand_identity=True,
            has_novel_packaging=False,
            is_geography_specific=True,
            involves_plant_cultivar=True
        )
        res = IPPathRouter.evaluate(payload)
        gi_rec = next((r for r in res.paths if r.ip_regime == "Geographical Indications"), None)
        self.assertIsNotNone(gi_rec)
        self.assertTrue(gi_rec.is_recommended)

        ppvfr_rec = next((r for r in res.paths if r.ip_regime == "Plant Variety Protection"), None)
        self.assertIsNotNone(ppvfr_rec)
        self.assertTrue(ppvfr_rec.is_recommended)

    def test_official_registries(self):
        """Test that official registries helper returns 9 portals with valid HTTPS URLs."""
        registries = get_official_registries()
        self.assertGreaterEqual(len(registries), 8)
        for r in registries:
            self.assertTrue(r["official_url"].startswith("https://"))
            self.assertTrue(len(r["name"]) > 3)
            self.assertTrue(len(r["authority"]) > 3)

        # Test filtering by regime
        patent_reg = get_official_registries(category="patents")
        self.assertGreaterEqual(len(patent_reg), 1)
        self.assertEqual(patent_reg[0]["id"], "REG-PAT-INPASS")

    def test_highlights_2024(self):
        """Test 2024 policy highlights structure and legal accuracy."""
        highlights = get_2024_highlights()
        self.assertGreaterEqual(len(highlights), 3)

        # Verify WIPO GRATK Treaty distinction (adopted May 2024 vs entry into force)
        gratk = next((h for h in highlights if "GRATK" in h["id"]), None)
        self.assertIsNotNone(gratk)
        self.assertIn("Adopted on May 24, 2024", gratk["applicability_status"])
        self.assertIn("15", gratk["applicability_status"])  # 15 ratifications condition

        # Verify BDA ABS 2024 highlights
        abs_hl = next((h for h in highlights if "BDA-ABS" in h["id"]), None)
        self.assertIsNotNone(abs_hl)
        self.assertIn("In Force", abs_hl["applicability_status"])

    def test_expert_escalation_workflow(self):
        """Test creating an expert escalation request dossier."""
        req = EscalationRequest(
            query="Need assistance applying for NBA Form I for exporting standardized ashwagandha extract.",
            jurisdiction="India",
            product_name="AshwaActive-95",
            formulation_details="Standardized withanolide extract 10%",
            classification_category="Phytopharmaceutical",
            relevant_ip_paths=["Patents", "Trade Marks"],
            contact_name="Dr. Ayurvedic Innovator",
            contact_email="innovator@ayush-startup.in",
            user_notes="Seeking guidance on State Biodiversity Board intimation exemption."
        )
        record = ExpertEscalationManager.create_request(req)
        self.assertTrue(record.request_id.startswith("ESC-"))
        self.assertEqual(record.status, "PENDING_EXPERT_REVIEW")
        self.assertIn("facilitation", record.disclaimer.lower())

        # Test listing recent escalations
        recents = ExpertEscalationManager.list_recent(limit=5)
        self.assertGreater(len(recents), 0)
        found = any(r["request_id"] == record.request_id for r in recents)
        self.assertTrue(found)

    def test_privacy_notice(self):
        """Test DPDP-aligned privacy notice response."""
        notice = get_privacy_notice()
        self.assertIn("Privacy", notice["title"])
        self.assertIn("queries_and_formulation_inputs", notice["data_collected"])
        self.assertIn("prototype", notice["legal_status"].lower())
        self.assertIn("compliance", notice["legal_status"].lower())

    def test_bilingual_hindi_synthesis(self):
        """Test that Hindi queries trigger Hindi synthesis with preserved citations."""
        hindi_query = "हल्दी और काली मिर्च के मिश्रण का पेटेंट क्या भारत में संभव है?"
        res = synthesizer.synthesize(query=hindi_query, jurisdiction="India", language="hi")
        self.assertEqual(res.language, "hi")
        self.assertEqual(res.disclaimer, MANDATORY_LEGAL_DISCLAIMER_HI)
        self.assertGreater(len(res.citations), 0)

        # Verify citations retain English IDs and proper statutes
        first_citation = res.citations[0]
        self.assertTrue(first_citation.id.startswith("IN-"))
        self.assertTrue(first_citation.official_url.startswith("https://"))

        # Verify answer text contains Devanagari Hindi
        has_devanagari = any('\u0900' <= char <= '\u097f' for char in res.answer)
        self.assertTrue(has_devanagari)

if __name__ == "__main__":
    unittest.main()
