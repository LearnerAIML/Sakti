"""Run HTTP-style tests in-process (no separate server needed) and skip Gemini-dependent tests without a key."""
import os
import httpx
import pytest
from starlette.testclient import TestClient

from backend.main import app
from backend.config import settings

LIVE_KEY = bool(settings.GEMINI_API_KEY)


def _client_factory(*args, base_url="http://127.0.0.1:8000", **kwargs):
    kwargs.pop("timeout", None)
    return TestClient(app, base_url=base_url, **kwargs)


@pytest.fixture(autouse=True)
def _in_process_http(monkeypatch):
    monkeypatch.setattr(httpx, "Client", _client_factory)


def pytest_collection_modifyitems(config, items):
    if LIVE_KEY:
        return
    skip = pytest.mark.skip(reason="requires GEMINI_API_KEY (live LLM)")
    for item in items:
        if any(k in item.nodeid for k in ("test_live_integration", "test_synthesis", "bilingual_hindi")):
            item.add_marker(skip)
