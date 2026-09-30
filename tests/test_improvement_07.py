from starlette.testclient import TestClient
from backend.main import app
c = TestClient(app)


def test_graph_structure():
    g = c.get("/api/graph").json()
    assert {"product", "iptype", "law", "jurisdiction"} <= {n["kind"] for n in g["nodes"]}
    ids = {n["id"] for n in g["nodes"]}
    assert g["edges"] and all(e["from"] in ids and e["to"] in ids for e in g["edges"])
