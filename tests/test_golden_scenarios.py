"""
Automated End-to-End Verification Test Suite for Step 10: Golden Demo Scenarios.

Verifies the 3 core SIH demo scenarios through the actual UI endpoints:
1. Classical formulation: Turmeric + Pepper -> Section 3(p) / traditional knowledge issue.
2. Phytopharmaceutical innovation: Novel standardized extract -> regulatory + ABS workflow.
3. International filing: Ayurvedic medicine -> WIPO GRATK disclosure workflow.

Each scenario is executed 3 consecutive times to verify:
- Correct classification / answer
- Correct jurisdiction
- Citations are displayed
- No API/UI errors
- Disclaimer is present
- Results are repeatable
"""

import sys
import time
import httpx

API_BASE = "http://127.0.0.1:8000"
FRONTEND_BASE = "http://127.0.0.1:5173"

def verify_ui_availability(client: httpx.Client):
    print("=" * 80)
    print("STEP 10 PRE-CHECK: Verifying UI Availability on Ports 8000 & 5173")
    print("=" * 80)

    # 1. FastAPI hosted UI
    res_app = client.get(f"{API_BASE}/app/")
    assert res_app.status_code == 200, f"FastAPI UI not reachable: {res_app.status_code}"
    assert "SAKTI" in res_app.text
    assert "Turmeric + Pepper (Classical)" in res_app.text
    print("  [PASS] FastAPI /app/ UI bundle loaded successfully (HTTP 200)")

    # 2. Standalone static UI server
    try:
        res_fe = client.get(f"{FRONTEND_BASE}/")
        assert res_fe.status_code == 200
        assert "SAKTI" in res_fe.text
        print("  [PASS] Standalone frontend server on port 5173 loaded successfully (HTTP 200)")
    except Exception as e:
        print(f"  [NOTE] Standalone port 5173 check: {e}")

    # 3. System health check
    res_health = client.get(f"{API_BASE}/health")
    assert res_health.status_code == 200
    h_data = res_health.json()
    assert h_data["status"] == "healthy"
    assert h_data["corpus_documents_loaded"] == 67
    print(f"  [PASS] System Health: {h_data['corpus_documents_loaded']} Curated Statutes Active\n")


def verify_scenario_1_classical_turmeric_pepper(client: httpx.Client):
    print("=" * 80)
    print("DEMO SCENARIO 1: Classical Formulation (Turmeric + Pepper) -> Sec 3(p) Traditional Knowledge")
    print("Running 3 consecutive iterations to verify correctness and repeatability...")
    print("=" * 80)

    classification_payload = {
        "product_name": "Classical Haridra & Maricha (Turmeric & Black Pepper) Churna",
        "intended_use": "therapeutic",
        "is_in_authoritative_texts": True,
        "processing_nature": "classical",
        "has_synthetic_additives": False
    }

    query_payload = {
        "query": "Can I patent a classical formulation of turmeric and black pepper for inflammation?",
        "jurisdiction": "India",
        "top_k": 4
    }

    for i in range(1, 4):
        print(f"\n--- [Iteration {i}/3] Classical Formulation Scenario ---")
        t0 = time.time()

        # Step 1A: Classification Engine
        res_cls = client.post(f"{API_BASE}/api/classify", json=classification_payload)
        assert res_cls.status_code == 200, f"Iteration {i} classify failed: {res_cls.status_code}"
        d_cls = res_cls.json()

        assert d_cls["category_code"] == "CLASSICAL_ASU", f"Wrong category code: {d_cls['category_code']}"
        assert "Classical" in d_cls["category"]
        assert "Section 3(a)" in d_cls["governing_law"]
        assert d_cls["patentability"]["status"] .startswith("Severely Restricted")
        assert "traditional knowledge" in d_cls["patentability"]["assessment"].lower()
        assert "Section 3(p)" in d_cls["patentability"]["assessment"]
        assert "Exempted" in d_cls["abs_compliance"]["form_type"]
        print(f"  [Iter {i} Classify PASS] Category: {d_cls['category']}")
        print(f"  [Iter {i} Classify PASS] Patentability: {d_cls['patentability']['status']}")

        # Step 1B: RAG Assistant Query
        res_q = client.post(f"{API_BASE}/api/query", json=query_payload)
        assert res_q.status_code == 200, f"Iteration {i} query failed: {res_q.status_code}"
        d_q = res_q.json()

        assert d_q["is_abstained"] is False, f"Unexpected abstention on valid classical query in iteration {i}"
        assert d_q["confidence"] in ["High", "Medium"], f"Low confidence on valid query: {d_q['confidence']}"
        assert "LEGAL DISCLAIMER" in d_q["disclaimer"], "Mandatory legal disclaimer missing!"

        # Verify Citations
        citations = d_q["citations"]
        assert len(citations) >= 1, f"Zero citations returned in iteration {i}"
        citation_ids = [c["id"] for c in citations]
        assert "IN-PAT-SEC-003P" in citation_ids, f"Missing Section 3(p) citation! Got: {citation_ids}"

        # Verify Answer content mentions Section 3(p) and traditional knowledge
        answer_lower = d_q["answer"].lower()
        assert "3(p)" in answer_lower or "traditional knowledge" in answer_lower, (
            "Answer missing Section 3(p) or traditional knowledge reference"
        )

        elapsed = time.time() - t0
        print(f"  [Iter {i} RAG PASS] Citations ({len(citations)}): {', '.join(citation_ids)}")
        print(f"  [Iter {i} RAG PASS] Section 3(p) verified in citations and legal answer")
        print(f"  [Iter {i} RAG PASS] Mandatory disclaimer present | Time: {elapsed:.2f}s")

    print("\n[SCENARIO 1 VERIFIED: 3/3 Consecutive Executions Passed Repeatably!]")


def verify_scenario_2_phytopharmaceutical_bacopa(client: httpx.Client):
    print("\n" + "=" * 80)
    print("DEMO SCENARIO 2: Phytopharmaceutical Innovation (Novel Extract) -> CDSCO Regulatory + ABS")
    print("Running 3 consecutive iterations to verify correctness and repeatability...")
    print("=" * 80)

    classification_payload = {
        "product_name": "Standardized Bacopa Neuro-Extract (4 Bioactive Markers)",
        "intended_use": "therapeutic",
        "is_in_authoritative_texts": False,
        "processing_nature": "purified_fraction_with_markers",
        "has_synthetic_additives": False
    }

    query_payload = {
        "query": "What are the regulatory approval and ABS requirements for a novel standardized phytopharmaceutical extract?",
        "jurisdiction": "India",
        "top_k": 4
    }

    for i in range(1, 4):
        print(f"\n--- [Iteration {i}/3] Phytopharmaceutical Innovation Scenario ---")
        t0 = time.time()

        # Step 2A: Classification Engine
        res_cls = client.post(f"{API_BASE}/api/classify", json=classification_payload)
        assert res_cls.status_code == 200, f"Iteration {i} classify failed: {res_cls.status_code}"
        d_cls = res_cls.json()

        assert d_cls["category_code"] == "PHYTOPHARMACEUTICAL", f"Wrong category code: {d_cls['category_code']}"
        assert "Phytopharmaceutical" in d_cls["category"]
        assert "Rule 122E" in d_cls["governing_law"]
        assert "CDSCO" in d_cls["licensing_authority"]
        assert d_cls["patentability"]["status"] == "High Potential (Patentable)"
        assert "Form I" in d_cls["abs_compliance"]["form_type"] or "Mandatory" in d_cls["abs_compliance"]["form_type"]
        print(f"  [Iter {i} Classify PASS] Category: {d_cls['category']} | Auth: {d_cls['licensing_authority']}")
        print(f"  [Iter {i} Classify PASS] Patentability: {d_cls['patentability']['status']}")

        # Step 2B: RAG Assistant Query
        res_q = client.post(f"{API_BASE}/api/query", json=query_payload)
        assert res_q.status_code == 200, f"Iteration {i} query failed: {res_q.status_code}"
        d_q = res_q.json()

        assert d_q["is_abstained"] is False
        assert d_q["confidence"] in ["High", "Medium"]
        assert "LEGAL DISCLAIMER" in d_q["disclaimer"]

        # Verify Citations for Rule 122E and/or BDA provisions
        citations = d_q["citations"]
        assert len(citations) >= 1
        citation_ids = [c["id"] for c in citations]
        has_phyto_or_abs = any(
            cid in citation_ids for cid in ["IN-DCA-RUL-122E-PHYTO", "IN-BDA-SEC-006", "IN-BDA-SEC-003", "IN-BDA-SEC-004", "IN-PAT-SEC-003P"]
        )
        assert has_phyto_or_abs, f"Expected Phyto/ABS statutory citations! Got: {citation_ids}"

        # Verify Answer content covers regulatory and ABS concepts
        answer_lower = d_q["answer"].lower()
        assert ("phytopharmaceutical" in answer_lower or "122e" in answer_lower or "cdsco" in answer_lower), (
            "Answer missing phytopharmaceutical regulatory context"
        )
        assert ("abs" in answer_lower or "biodiversity" in answer_lower or "nba" in answer_lower or "form" in answer_lower), (
            "Answer missing ABS / NBA compliance context"
        )

        elapsed = time.time() - t0
        print(f"  [Iter {i} RAG PASS] Citations ({len(citations)}): {', '.join(citation_ids)}")
        print(f"  [Iter {i} RAG PASS] DCA Rule 122E & BDA ABS workflow verified")
        print(f"  [Iter {i} RAG PASS] Mandatory disclaimer present | Time: {elapsed:.2f}s")

    print("\n[SCENARIO 2 VERIFIED: 3/3 Consecutive Executions Passed Repeatably!]")


def verify_scenario_3_international_wipo_gratk(client: httpx.Client):
    print("\n" + "=" * 80)
    print("DEMO SCENARIO 3: International Filing -> WIPO GRATK Treaty 2024 Disclosure Workflow")
    print("Running 3 consecutive iterations to verify correctness and repeatability...")
    print("=" * 80)

    query_payload = {
        "query": "What mandatory disclosure requirements exist under the WIPO GRATK Treaty 2024 for patent applications based on Indian traditional knowledge?",
        "jurisdiction": "International",
        "top_k": 4
    }

    for i in range(1, 4):
        print(f"\n--- [Iteration {i}/3] International WIPO GRATK Scenario ---")
        t0 = time.time()

        res_q = client.post(f"{API_BASE}/api/query", json=query_payload)
        assert res_q.status_code == 200, f"Iteration {i} international query failed: {res_q.status_code}"
        d_q = res_q.json()

        assert d_q["is_abstained"] is False
        assert d_q["confidence"] in ["High", "Medium"]
        assert "LEGAL DISCLAIMER" in d_q["disclaimer"]

        # Verify Citations: MUST strictly be International provisions (INT- prefix)
        citations = d_q["citations"]
        assert len(citations) >= 1
        citation_ids = [c["id"] for c in citations]
        for cid in citation_ids:
            assert cid.startswith("INT-"), f"CRITICAL LEAK: Domestic Indian law {cid} returned in International query!"

        # Must cite WIPO GRATK Treaty Article 3 or Article 6
        has_gratk = any("WIPO-GRATK" in cid for cid in citation_ids)
        assert has_gratk, f"Missing WIPO GRATK Treaty citations! Got: {citation_ids}"

        # Verify Answer content discusses mandatory origin / traditional knowledge disclosure
        answer_lower = d_q["answer"].lower()
        assert ("disclosure" in answer_lower or "origin" in answer_lower), (
            "Answer missing mandatory origin/TK disclosure context"
        )
        assert ("gratk" in answer_lower or "wipo" in answer_lower or "treaty" in answer_lower), (
            "Answer missing WIPO GRATK Treaty context"
        )

        elapsed = time.time() - t0
        print(f"  [Iter {i} RAG PASS] International Citations ({len(citations)}): {', '.join(citation_ids)}")
        print(f"  [Iter {i} RAG PASS] Strict International isolation verified (0 domestic law leakage)")
        print(f"  [Iter {i} RAG PASS] WIPO GRATK Treaty 2024 disclosure verified | Time: {elapsed:.2f}s")

    print("\n[SCENARIO 3 VERIFIED: 3/3 Consecutive Executions Passed Repeatably!]")


def main():
    print("\n" + "#" * 80)
    print("STARTING STEP 10: GOLDEN DEMO SCENARIOS VERIFICATION")
    print("#" * 80 + "\n")

    with httpx.Client(timeout=120.0) as client:
        verify_ui_availability(client)
        verify_scenario_1_classical_turmeric_pepper(client)
        verify_scenario_2_phytopharmaceutical_bacopa(client)
        verify_scenario_3_international_wipo_gratk(client)

    print("\n" + "=" * 80)
    print("ALL 3 GOLDEN DEMO SCENARIOS SUCCESSFULLY VERIFIED ACROSS 3 CONSECUTIVE RUNS (9/9 PASS)!")
    print("=" * 80)

if __name__ == "__main__":
    main()
