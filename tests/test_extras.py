"""Tests for dossier, ABS wizard, TKDL card, graph, languages, corpus additions (offline)."""
import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.corpus_loader import corpus_store

c = TestClient(app)


def test_new_international_corpus_present():
    for i in ["INT-MADRID-PROTOCOL", "INT-HAGUE-GENEVA-ACT", "INT-BUDAPEST-TREATY", "INT-EXPORT-EU-THMPD", "INT-EXPORT-US-DSHEA"]:
        d = corpus_store.get_by_id(i)
        assert d and d.jurisdiction == "International" and d.official_url.startswith("https://")


def test_dossier_sections_and_valid_citations():
    d = c.post("/api/dossier", json={"product_name": "T", "export_markets": ["EU", "US"], "has_novel_packaging": True, "uses_microorganism": True}).json()
    assert [s["key"] for s in d["sections"]] == ["classification", "ip_router", "abs", "tkdl", "advertising", "international"]
    ids = {x["id"] for s in d["sections"] for x in s["cites"]}
    assert ids and all(corpus_store.get_by_id(i) for i in ids)
    assert {"INT-EXPORT-EU-THMPD", "INT-EXPORT-US-DSHEA", "INT-HAGUE-GENEVA-ACT", "INT-BUDAPEST-TREATY"} <= ids
    assert "not legal advice" in d["disclaimer"].lower() or "informational" in d["disclaimer"].lower()


def test_dossier_pdf():
    r = c.post("/api/dossier/pdf", json={"product_name": "T & <b>"})
    assert r.status_code == 200 and r.content[:4] == b"%PDF"


def test_abs_wizard_paths():
    assert c.post("/api/abs-wizard", json={"applicant_type": "foreign_or_nri"}).json()["outcome_level"] == "required"
    assert c.post("/api/abs-wizard", json={"applicant_type": "ayush_practitioner"}).json()["outcome_level"] == "exempt"
    assert c.post("/api/abs-wizard", json={"resource_indian": False}).json()["outcome_level"] == "not_triggered"
    r = c.post("/api/abs-wizard", json={"purpose": "patent_filing", "ipr_filing": "abroad"}).json()
    cited = {i for s in r["steps"] for i in s["cites"]}
    assert "IN-BDA-SEC-006" in cited and "IN-PAT-SEC-010-4D" in cited


def test_tkdl_card():
    t = c.get("/api/tkdl-card").json()
    assert t["how_you_check"] and any(x["id"] == "IN-TKDL-PRIA-001" for x in t["cites"])


def test_graph_and_languages():
    g = c.get("/api/graph").json()
    kinds = {n["kind"] for n in g["nodes"]}
    assert {"product", "iptype", "law", "jurisdiction"} <= kinds and g["edges"]
    langs = {l["code"] for l in c.get("/api/languages").json()["languages"]}
    assert {"en", "hi", "gu", "mr", "ta"} <= langs


def test_query_accepts_extra_language():
    r = c.post("/api/query", json={"query": "What is Section 3(p)?", "jurisdiction": "India", "language": "gu"})
    assert r.status_code == 200 and "confidence_reason" in r.json()
