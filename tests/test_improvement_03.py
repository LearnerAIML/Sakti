from starlette.testclient import TestClient
from backend.main import app
c = TestClient(app)


def test_compare_separates_jurisdictions():
    d = c.post("/api/compare", json={"query": "patent traditional knowledge disclosure"}).json()
    assert all(x["jurisdiction"] == "India" for x in d["india"]["citations"])
    assert all(x["jurisdiction"] == "International" for x in d["international"]["citations"])
