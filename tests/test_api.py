"""
Automated End-to-End API Integration Test Suite for SAKTI.
Tests all endpoints:
- GET /health
- GET /
- GET /api/sources
- GET /api/sources/IN-PAT-SEC-003P
- POST /api/classify
- POST /api/query
"""

import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_api_health():
    print("\n[TEST API 1] Testing GET /health...")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        res = client.get("/health")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data["status"] == "healthy"
        assert data["corpus_documents_loaded"] == 62
        print(f"  [PASS] /health: {data}")

def test_api_root():
    print("\n[TEST API 2] Testing GET /...")
    with httpx.Client(base_url=BASE_URL, follow_redirects=True, timeout=10.0) as client:
        res = client.get("/")
        assert res.status_code == 200
        assert "SAKTI" in res.text
        print("  [PASS] / redirects cleanly to /app/ with HTTP 200")

def test_api_sources():
    print("\n[TEST API 3] Testing GET /api/sources...")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # All sources
        res = client.get("/api/sources")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == 62
        print(f"  [PASS] Total sources returned: {data['total']}")

        # Filtered by India jurisdiction
        res_india = client.get("/api/sources?jurisdiction=India")
        assert res_india.status_code == 200
        assert res_india.json()["total"] == 55
        print(f"  [PASS] India sources returned: {res_india.json()['total']}")

        # Filtered by International jurisdiction
        res_intl = client.get("/api/sources?jurisdiction=International")
        assert res_intl.status_code == 200
        assert res_intl.json()["total"] == 7
        print(f"  [PASS] International sources returned: {res_intl.json()['total']}")

def test_api_source_detail():
    print("\n[TEST API 4] Testing GET /api/sources/{doc_id}...")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Valid ID
        res = client.get("/api/sources/IN-PAT-SEC-003P")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "IN-PAT-SEC-003P"
        assert "Section 3(p)" in data["section_rule"]
        print(f"  [PASS] Retrieved {data['id']}: {data['title']}")

        # Invalid ID -> 404
        res_404 = client.get("/api/sources/NON_EXISTENT_ID")
        assert res_404.status_code == 404
        print("  [PASS] Correctly returned 404 for invalid ID")

def test_api_classify():
    print("\n[TEST API 5] Testing POST /api/classify...")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        payload = {
            "product_name": "Standardized Curcumin Fraction",
            "intended_use": "therapeutic",
            "is_in_authoritative_texts": False,
            "processing_nature": "purified_fraction_with_markers",
            "has_synthetic_additives": False
        }
        res = client.post("/api/classify", json=payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data["category_code"] == "PHYTOPHARMACEUTICAL"
        assert "High Potential" in data["patentability"]["status"]
        assert data["abs_compliance"]["nba_form_required"] is True
        print(f"  [PASS] Classified as: {data['category']}")
        print(f"  [PASS] Patentability: {data['patentability']['status']}")
        print(f"  [PASS] ABS Form: {data['abs_compliance']['form_type']}")

def test_api_query():
    print("\n[TEST API 6] Testing POST /api/query (RAG synthesis over HTTP)...")
    with httpx.Client(base_url=BASE_URL, timeout=60.0) as client:
        payload = {
            "query": "Can I patent a ginger and honey cough syrup in India?",
            "jurisdiction": "India",
            "top_k": 3
        }
        res = client.post("/api/query", json=payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        data = res.json()
        assert data["is_abstained"] is False
        assert data["confidence"] in ["High", "Medium"]
        assert len(data["citations"]) > 0
        print(f"  [PASS] Query synthesis returned successfully!")
        print(f"  [PASS] Confidence: {data['confidence']}")
        print(f"  [PASS] Citations count: {len(data['citations'])}")
        print(f"  [PASS] Excerpt: {data['answer'][:200]}...")

if __name__ == "__main__":
    test_api_health()
    test_api_root()
    test_api_sources()
    test_api_source_detail()
    test_api_classify()
    test_api_query()
    print("\n" + "=" * 70)
    print("[ALL 6 FASTAPI API GATEWAY INTEGRATION TESTS PASSED!]")
    print("=" * 70)
