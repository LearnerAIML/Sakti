from starlette.testclient import TestClient
from backend.main import app
from backend.config import settings
c = TestClient(app)


def test_eval_latest_404_or_data():
    assert c.get("/api/eval/latest").status_code in (200, 404)


def test_eval_run_needs_token_in_production(monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "ADMIN_TOKEN", "secret")
    assert c.post("/api/eval/run").status_code == 403
