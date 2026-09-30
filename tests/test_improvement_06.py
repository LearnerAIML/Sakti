from starlette.testclient import TestClient
from backend.main import app
c = TestClient(app)


def test_languages_listed():
    d = c.get("/api/languages").json()
    assert {"en", "hi", "gu", "mr", "ta", "te", "bn", "kn", "ml", "pa"} <= {l["code"] for l in d["languages"]}
    assert isinstance(d["bhashini_configured"], bool)


def test_query_accepts_extra_language():
    r = c.post("/api/query", json={"query": "What is Section 3(p)?", "jurisdiction": "India", "language": "gu"})
    assert r.status_code == 200 and r.json()["language"] in ("gu", "en")


def test_translate_unconfigured_is_503(monkeypatch):
    monkeypatch.delenv("BHASHINI_USER_ID", raising=False)
    assert c.post("/api/translate", json={"text": "hello", "target": "hi"}).status_code == 503
