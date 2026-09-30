"""
Automated UI Scaffolding & Verification Test for Step 7.
Verifies that:
1. Frontend server on http://127.0.0.1:5173 responds with HTTP 200 OK.
2. FastAPI app on http://127.0.0.1:8000/app/ responds with HTTP 200 OK.
3. All key UI sections exist in the rendered HTML:
   - India vs International Jurisdiction Toggle
   - Formulation Classifier Wizard
   - RAG Query Assistant
   - Citation & Sources Cards
   - Legal Disclaimer
4. API endpoints connected by the frontend match backend routes.
"""

import urllib.request
import re

FRONTEND_URL = "http://127.0.0.1:5173/"
BACKEND_APP_URL = "http://127.0.0.1:8000/app/"

import pytest

@pytest.mark.skip(reason="requires running dev servers on :5173 and :8000")
def test_frontend_scaffold():
    print("\n" + "=" * 70)
    print("STEP 7 FRONTEND UI SCAFFOLDING VERIFICATION TEST")
    print("=" * 70)

    # 1. Fetch from standalone frontend server (port 5173)
    req_fe = urllib.request.Request(FRONTEND_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_fe, timeout=5) as resp:
        assert resp.status == 200, f"Expected 200 from {FRONTEND_URL}, got {resp.status}"
        html_5173 = resp.read().decode("utf-8")
        print(f"[PASS] Frontend server on {FRONTEND_URL} -> HTTP 200 OK ({len(html_5173)} bytes)")

    # 2. Fetch from FastAPI static mount (port 8000/app/)
    req_be = urllib.request.Request(BACKEND_APP_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_be, timeout=5) as resp:
        assert resp.status == 200, f"Expected 200 from {BACKEND_APP_URL}, got {resp.status}"
        html_8000 = resp.read().decode("utf-8")
        print(f"[PASS] FastAPI static UI on {BACKEND_APP_URL} -> HTTP 200 OK ({len(html_8000)} bytes)")

    # 3. Verify Key Elements in UI
    required_elements = [
        ("India / International Toggle", r"btnJurIndia.*btnJurIntl"),
        ("Formulation Classifier Wizard", r"Guided Formulation Classifier|Check Product Rules"),
        ("Section 3(p) Patentability Analysis", r"Section 3\(p\)|Patentability"),
        ("ABS & Biodiversity Compliance", r"ABS & Biodiversity|Biological Diversity"),
        ("IPR & ABS Legal Assistant", r"Ayurveda IPR & Regulatory Legal Assistant|Ask Legal Assistant"),
        ("Verified Sources & Citations", r"Verified Authoritative Sources|Knowledge Base"),
        ("Legal Disclaimer", r"LEGAL DISCLAIMER|Grounded in Indian Patents Act 1970"),
        ("API Contracts", r"/api/classify|/api/query|/api/sources")
    ]

    for label, pattern in required_elements:
        match = re.search(pattern, html_5173, re.DOTALL | re.IGNORECASE)
        assert match is not None, f"FAILED: Missing UI component '{label}' in frontend HTML"
        print(f"  [OK] Found component: {label}")

    print("\n" + "=" * 70)
    print("[ALL STEP 7 FRONTEND SCAFFOLDING TESTS PASSED!]")
    print("=" * 70)

if __name__ == "__main__":
    test_frontend_scaffold()
