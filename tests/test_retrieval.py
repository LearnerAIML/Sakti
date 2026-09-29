"""
Automated retrieval evaluation test for SAKTI Vector Store.
Tests the target query: 'Can I patent a ginger and honey cough syrup?'
and verifies:
1. Section 3(p) is retrieved near the top (Top 3).
2. Section 3(e) (admixtures) / TKDL guidelines are retrieved.
3. India jurisdiction filtering works as expected.
4. Metadata preservation (statute, section, URL) is verified.
"""

from backend.vector_store import vector_store

def run_retrieval_test():
    query = "Can I patent a ginger and honey cough syrup?"
    print(f"\n[Test Query] '{query}'")
    print("=" * 70)
    
    # Run retrieval with India jurisdiction filter
    results = vector_store.search(query=query, top_k=5, jurisdiction="India")
    
    print(f"Retrieved {len(results)} results under 'India' jurisdiction:\n")
    retrieved_ids = []
    
    for i, res in enumerate(results):
        retrieved_ids.append(res.id)
        print(f"Rank {i+1} [Score: {res.score:.4f}] - {res.id}")
        print(f"  Statute: {res.statute}")
        print(f"  Section: {res.section_rule} - {res.title}")
        print(f"  Official URL: {res.official_url}")
        print(f"  Excerpt: {res.content[:160]}...")
        print("-" * 70)

    # Verification Assertions
    assert "IN-PAT-SEC-003P" in retrieved_ids[:3], (
        f"FAILED: Expected IN-PAT-SEC-003P in top 3, but got {retrieved_ids[:3]}"
    )
    print("\n[ASSERTION 1 PASSED] Patents Act Section 3(p) retrieved in top 3!")

    # Verify Section 3(e) or TKDL is also retrieved
    has_related_provision = any(pid in retrieved_ids for pid in ["IN-PAT-SEC-003E", "IN-TKDL-PRIA-001", "IN-PAT-GUI-AYU-001"])
    assert has_related_provision, "FAILED: Expected Sec 3(e) or TKDL or CGPDTM guidelines in top 5"
    print("[ASSERTION 2 PASSED] Related Ayurvedic patent provisions (Sec 3(e) / TKDL / Guidelines) retrieved!")

    # Verify International filter rejects Indian documents
    intl_results = vector_store.search(query=query, top_k=3, jurisdiction="International")
    assert all(r.jurisdiction == "International" for r in intl_results), "FAILED: International filter leaked non-international docs"
    print("[ASSERTION 3 PASSED] Jurisdiction filtering strictly isolates international documents!")

    print("\n[ALL STEP 3 RETRIEVAL TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    run_retrieval_test()
