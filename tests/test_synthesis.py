"""
Automated Evaluation Tests for Gemini Grounded Synthesis & Citation Formatter.
Tests 3 representative legal scenarios:
1. Domestic Patentability (Section 3(p) & 3(e) - Ginger & Honey cough syrup)
2. International Jurisdiction (WIPO GRATK Treaty 2024 & Mandatory Origin Disclosure)
3. Safe Abstention (Out-of-scope query trigger)
"""

from backend.synthesizer import synthesizer
from backend.corpus_loader import corpus_store

def test_query_1_domestic_patentability():
    print("\n" + "=" * 70)
    print("TEST 1: Domestic Patentability (Ginger & Honey Cough Syrup)")
    print("=" * 70)
    query = "Can I patent a herbal cough formulation made from ginger and honey in India?"
    res = synthesizer.synthesize(query=query, jurisdiction="India", top_k=4)

    print(f"Confidence: {res.confidence}")
    print(f"Is Abstained: {res.is_abstained}")
    print(f"Citations Returned: {len(res.citations)}")
    print(f"First 300 chars of Answer:\n{res.answer[:300]}...\n")

    # Assertions
    assert res.is_abstained is False, "FAILED: Valid patent query was unexpectedly abstained"
    assert res.confidence in ["High", "Medium"], f"FAILED: Expected High or Medium confidence, got {res.confidence}"
    assert len(res.citations) > 0, "FAILED: No citations returned"
    
    # Verify cited sections exist in our corpus
    for c in res.citations:
        assert corpus_store.get_by_id(c.id) is not None, f"FAILED: Citation ID {c.id} does not exist in corpus"
        assert c.official_url.startswith("http"), f"FAILED: Missing or invalid URL for {c.id}"

    # Verify Section 3(p) or 3(e) is in citations
    citation_ids = [c.id for c in res.citations]
    assert any(cid in citation_ids for cid in ["IN-PAT-SEC-003P", "IN-PAT-SEC-003E"]), (
        f"FAILED: Expected Sec 3(p) or 3(e) in citations, got {citation_ids}"
    )
    print("[PASS] Test 1: Domestic patentability grounded with verified citations!")

def test_query_2_international_disclosure():
    print("\n" + "=" * 70)
    print("TEST 2: International Treaties (Mandatory Origin Disclosure)")
    print("=" * 70)
    query = "What international treaties mandate the disclosure of origin for traditional knowledge in patent applications?"
    res = synthesizer.synthesize(query=query, jurisdiction="International", top_k=3)

    print(f"Confidence: {res.confidence}")
    print(f"Is Abstained: {res.is_abstained}")
    print(f"Citations Returned: {len(res.citations)}")
    print(f"First 300 chars of Answer:\n{res.answer[:300]}...\n")

    # Assertions
    assert res.is_abstained is False, "FAILED: Valid treaty query was unexpectedly abstained"
    assert any(c.id == "INT-WIPO-GRATK-2024" for c in res.citations), (
        "FAILED: Expected INT-WIPO-GRATK-2024 in citations"
    )
    # Check that all citations belong to International jurisdiction
    assert all(c.jurisdiction == "International" for c in res.citations), (
        "FAILED: International jurisdiction leaked Indian statutes"
    )
    print("[PASS] Test 2: International treaty query correctly partitioned and grounded!")

def test_query_3_safe_abstention():
    print("\n" + "=" * 70)
    print("TEST 3: Safe Abstention on Out-of-Scope Query")
    print("=" * 70)
    query = "How do I write a cryptocurrency smart contract in Solidity for Ethereum?"
    res = synthesizer.synthesize(query=query, jurisdiction="India", top_k=3)

    print(f"Confidence: {res.confidence}")
    print(f"Is Abstained: {res.is_abstained}")
    print(f"Answer:\n{res.answer}\n")

    # Assertions
    assert res.is_abstained is True, "FAILED: Out-of-scope query was NOT abstained"
    assert res.confidence == "Low", f"FAILED: Expected Low confidence for abstention, got {res.confidence}"
    assert len(res.citations) == 0, f"FAILED: Expected 0 citations for abstention, got {len(res.citations)}"
    assert ("SAFE ABSTENTION" in res.answer or "OUT-OF-SCOPE" in res.answer), "FAILED: Missing safe abstention notice"
    print("[PASS] Test 3: Safe abstention correctly triggered on irrelevant query!")

if __name__ == "__main__":
    test_query_1_domestic_patentability()
    test_query_2_international_disclosure()
    test_query_3_safe_abstention()
    print("\n" + "=" * 70)
    print("[ALL 3 SYNTHESIZER EVALUATION TESTS PASSED SUCCESSFULLY!]")
    print("=" * 70)
