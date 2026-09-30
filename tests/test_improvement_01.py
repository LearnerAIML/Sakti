from starlette.testclient import TestClient
from backend.main import app
from backend.corpus_loader import corpus_store
c = TestClient(app)


def test_dossier_sections_and_valid_citations():
    d = c.post("/api/dossier", json={"product_name": "T", "export_markets": ["EU", "US"]}).json()
    assert [s["key"] for s in d["sections"]] == ["classification", "ip_router", "abs", "tkdl", "advertising", "international"]
    ids = {x["id"] for s in d["sections"] for x in s["cites"]}
    assert ids and all(corpus_store.get_by_id(i) for i in ids)
    assert d["disclaimer"]


def test_dossier_pdf():
    r = c.post("/api/dossier/pdf", json={"product_name": "T & <b>"})
    assert r.status_code == 200 and r.content[:4] == b"%PDF"
