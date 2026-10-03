"""
Step 8: Automated Live Frontend-Backend Integration Test Suite.
Verifies the complete round-trip workflows required by Step 8:
1. Formulation Classification Workflow (All 5 archetypes)
2. RAG Legal Query Workflow with Grounded Synthesis
3. Citation & Source Display with Metadata Verification
4. India vs. International Jurisdiction Switching
5. Loading, Error States & Safe Abstention
"""

import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def test_workflow_1_classification():
    print("\n" + "=" * 70)
    print("WORKFLOW 1: Formulation Classification Round-Trip")
    print("=" * 70)
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Archetype A: Phytopharmaceutical
        res_phyto = client.post("/api/classify", json={
            "product_name": "Standardized Bacopa Neuro-Extract",
            "intended_use": "therapeutic",
            "is_in_authoritative_texts": False,
            "processing_nature": "purified_fraction_with_markers",
            "has_synthetic_additives": False
        })
        assert res_phyto.status_code == 200
        d_phyto = res_phyto.json()
        assert d_phyto["category_code"] == "PHYTOPHARMACEUTICAL"
        assert "High Potential" in d_phyto["patentability"]["status"]
        assert "NBA Form I" in d_phyto["abs_compliance"]["form_type"]
        print(f"  [PASS] Phyto: {d_phyto['category']} -> {d_phyto['patentability']['status']}")

        # Archetype B: Classical Ayurvedic Medicine
        res_class = client.post("/api/classify", json={
            "product_name": "Triphala Churna",
            "intended_use": "therapeutic",
            "is_in_authoritative_texts": True,
            "processing_nature": "classical",
            "has_synthetic_additives": False
        })
        assert res_class.status_code == 200
        d_class = res_class.json()
        assert d_class["category_code"] == "CLASSICAL_ASU"
        assert "Severely Restricted" in d_class["patentability"]["status"]
        assert d_class["abs_compliance"]["exemption_eligible"] is True
        print(f"  [PASS] Classical: {d_class['category']} -> {d_class['patentability']['status']}")

        # Archetype C: Patent & Proprietary Medicine
        res_pp = client.post("/api/classify", json={
            "product_name": "Polyherbal Cough Relief",
            "intended_use": "therapeutic",
            "is_in_authoritative_texts": False,
            "processing_nature": "aqueous_alcoholic_extract",
            "has_synthetic_additives": False
        })
        assert res_pp.status_code == 200
        d_pp = res_pp.json()
        assert d_pp["category_code"] == "PATENT_PROPRIETARY"
        print(f"  [PASS] P&P: {d_pp['category']} -> {d_pp['patentability']['status']}")

        # Archetype D: Ayurveda Aahar
        res_aahar = client.post("/api/classify", json={
            "product_name": "Ayur-Digestive Botanical Drink",
            "intended_use": "dietary",
            "is_in_authoritative_texts": True,
            "processing_nature": "classical",
            "has_synthetic_additives": False
        })
        assert res_aahar.status_code == 200
        d_aahar = res_aahar.json()
        assert d_aahar["category_code"] == "AYURVEDA_AAHAR"
        print(f"  [PASS] Aahar: {d_aahar['category']} -> {d_aahar['patentability']['status']}")

        # Archetype E: Ayurvedic Cosmetic
        res_cos = client.post("/api/classify", json={
            "product_name": "Kumkumadi Glow Serum",
            "intended_use": "cosmetic",
            "is_in_authoritative_texts": False,
            "processing_nature": "aqueous_alcoholic_extract",
            "has_synthetic_additives": False
        })
        assert res_cos.status_code == 200
        d_cos = res_cos.json()
        assert d_cos["category_code"] == "COSMETIC"
        print(f"  [PASS] Cosmetic: {d_cos['category']} -> {d_cos['patentability']['status']}")

def test_workflow_2_rag_query():
    print("\n" + "=" * 70)
    print("WORKFLOW 2: RAG Legal Query Round-Trip (India Jurisdiction)")
    print("=" * 70)
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        query = "Can I patent a herbal cough formulation made from ginger and honey in India?"
        res = client.post("/api/query", json={
            "query": query,
            "jurisdiction": "India",
            "top_k": 4
        })
        assert res.status_code == 200
        data = res.json()
        assert data["is_abstained"] is False
        assert data["confidence"] in ["High", "Medium"]
        assert len(data["citations"]) >= 2
        assert "LEGAL DISCLAIMER" in data["disclaimer"]
        print(f"  [PASS] Query: '{query}'")
        print(f"  [PASS] Confidence: {data['confidence']}")
        print(f"  [PASS] Citations Returned: {len(data['citations'])}")
        print(f"  [PASS] Excerpt: {data['answer'][:200]}...")

def test_workflow_3_citations_display():
    print("\n" + "=" * 70)
    print("WORKFLOW 3: Citation & Source Metadata Verification")
    print("=" * 70)
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        res = client.get("/api/sources/IN-PAT-SEC-003P")
        assert res.status_code == 200
        doc = res.json()
        assert doc["id"] == "IN-PAT-SEC-003P"
        assert "Section 3(p)" in doc["section_rule"]
        assert doc["official_url"].startswith("http")
        assert "Exclusion of Traditional Knowledge" in doc["title"]
        print(f"  [PASS] Citation ID: {doc['id']}")
        print(f"  [PASS] Statute: {doc['statute']} ({doc['section_rule']})")
        print(f"  [PASS] Official Portal URL: {doc['official_url']}")

def test_workflow_4_jurisdiction_switching():
    print("\n" + "=" * 70)
    print("WORKFLOW 4: India vs. International Jurisdiction Switching")
    print("=" * 70)
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # A. Sources partition count
        res_in = client.get("/api/sources?jurisdiction=India")
        assert res_in.status_code == 200
        assert res_in.json()["total"] >= 25

        res_intl = client.get("/api/sources?jurisdiction=International")
        assert res_intl.status_code == 200
        assert res_intl.json()["total"] >= 4
        print(f"  [PASS] Jurisdiction Partition: India={res_in.json()['total']}, International={res_intl.json()['total']}")

        # B. International Query execution
        intl_query = "What international treaties mandate the disclosure of origin for traditional knowledge in patent applications?"
        res_q_intl = client.post("/api/query", json={
            "query": intl_query,
            "jurisdiction": "International",
            "top_k": 3
        })
        assert res_q_intl.status_code == 200
        d_intl = res_q_intl.json()
        assert d_intl["is_abstained"] is False
        assert any(c["id"] == "INT-WIPO-GRATK-2024" for c in d_intl["citations"])
        assert all(c["jurisdiction"] == "International" for c in d_intl["citations"])
        print(f"  [PASS] International Query: Verified WIPO GRATK 2024 citation without leaking Indian domestic laws!")

def test_workflow_5_error_and_abstention_states():
    print("\n" + "=" * 70)
    print("WORKFLOW 5: Error Handling, Validation & Safe Abstention")
    print("=" * 70)
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # A. Invalid Classification Payload -> HTTP 422
        res_bad_cls = client.post("/api/classify", json={"bad_field": 123})
        assert res_bad_cls.status_code == 422
        print(f"  [PASS] Invalid classification payload correctly rejected with HTTP 422")

        # B. Invalid Source ID -> HTTP 404
        res_bad_src = client.get("/api/sources/INVALID_DOC_999")
        assert res_bad_src.status_code == 404
        print(f"  [PASS] Non-existent document ID correctly returned HTTP 404")

        # C. Out-of-Scope Query -> Safe Abstention
        res_abstain = client.post("/api/query", json={
            "query": "How do I build an Ethereum blockchain ERC-20 token?",
            "jurisdiction": "India",
            "top_k": 3
        })
        assert res_abstain.status_code == 200
        d_abs = res_abstain.json()
        assert d_abs["is_abstained"] is True
        assert d_abs["confidence"] == "Low"
        assert len(d_abs["citations"]) == 0
        assert ("SAFE ABSTENTION" in d_abs["answer"] or "OUT-OF-SCOPE" in d_abs["answer"])
        print(f"  [PASS] Out-of-scope query safely triggered Safe Abstention with 0 hallucinated citations!")

if __name__ == "__main__":
    test_workflow_1_classification()
    test_workflow_2_rag_query()
    test_workflow_3_citations_display()
    test_workflow_4_jurisdiction_switching()
    test_workflow_5_error_and_abstention_states()
    print("\n" + "=" * 70)
    print("[ALL STEP 8 LIVE INTEGRATION WORKFLOW TESTS PASSED SUCCESSFULLY!]")
    print("=" * 70)
