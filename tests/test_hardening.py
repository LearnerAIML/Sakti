"""Regression tests for citation verification, jurisdiction filtering, escalation privacy and audit logging."""
from fastapi.testclient import TestClient
from backend.main import app
from backend.vector_store import vector_store
from backend.synthesizer import synthesizer
from backend.config import settings

c = TestClient(app)


def test_escalations_requires_admin_token():
    assert c.get("/api/escalations").status_code == 403


def test_keyword_fallback_respects_jurisdiction():
    for j in ("India", "International"):
        res = vector_store._keyword_search("patent traditional knowledge disclosure", 5, j)
        assert res and all(r.jurisdiction == j for r in res)


def test_offline_query_never_500_and_cites_only_retrieved():
    r = c.post("/api/query", json={"query": "Section 3(p) patents traditional knowledge Ayurveda", "jurisdiction": "India"})
    assert r.status_code == 200
    d = r.json()
    assert all(x["jurisdiction"] == "India" for x in d["citations"])


def test_fake_citation_ids_are_stripped(monkeypatch):
    monkeypatch.setattr(synthesizer, "_call_gemini_with_fallback",
                        lambda p: "Answer [IN-PAT-SEC-003P] and also [IN-FAKE-999].")
    monkeypatch.setattr(vector_store, "search", lambda **kw: _fake_results())
    resp = synthesizer.synthesize("patent traditional knowledge ayurveda", "India")
    assert [x.id for x in resp.citations] == ["IN-PAT-SEC-003P"]
    assert resp.unverified_citation_ids == ["IN-FAKE-999"]
    assert resp.citation_check == "partially_verified"


def _fake_results():
    from backend.vector_store import RetrievalResult
    from backend.corpus_loader import corpus_store
    d = corpus_store.get_by_id("IN-PAT-SEC-003P").model_dump()
    return [RetrievalResult(d, 0.9)]


def test_audit_log_written():
    c.post("/api/query", json={"query": "patent ginger honey syrup ayurveda", "jurisdiction": "India"})
    assert (settings.AUDIT_DIR / "audit.jsonl").exists()
