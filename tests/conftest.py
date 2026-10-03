"""Run HTTP-style tests in-process (no separate server needed) and skip Groq-dependent tests without a key."""
import os
import httpx
import pytest
from starlette.testclient import TestClient

from backend.main import app
from backend.config import settings

LIVE_KEY = bool(settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("your_"))


_orig_httpx_client = httpx.Client


class _ClientWrapper(_orig_httpx_client):
    def __new__(cls, *args, **kwargs):
        base_url = kwargs.get("base_url") or (args[0] if args else None)
        if base_url is not None:
            url_str = str(base_url)
            if "groq.com" in url_str or ("http" in url_str and "127.0.0.1" not in url_str and "localhost" not in url_str):
                return _orig_httpx_client(*args, **kwargs)

        if any(k in kwargs for k in ("transport", "mounts", "http2", "limits", "event_hooks")):
            return _orig_httpx_client(*args, **kwargs)

        kwargs.pop("timeout", None)
        target_base = kwargs.pop("base_url", "http://127.0.0.1:8000")
        return TestClient(app, base_url=target_base, **kwargs)


@pytest.fixture(autouse=True)
def _in_process_http(monkeypatch):
    monkeypatch.setattr(httpx, "Client", _ClientWrapper)


def pytest_collection_modifyitems(config, items):
    if LIVE_KEY:
        return
    skip = pytest.mark.skip(reason="requires GROQ_API_KEY (live LLM)")
    for item in items:
        if any(k in item.nodeid for k in ("test_live_integration", "test_synthesis", "bilingual_hindi")):
            item.add_marker(skip)
