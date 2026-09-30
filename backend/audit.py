"""Append-only JSONL audit log for SAKTI (traceability of answers and retrieved sources)."""
import json
import re
import threading
from datetime import datetime, timezone
from typing import Any, Dict

from backend.config import settings

_LOCK = threading.Lock()
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE = re.compile(r"(?<!\d)(?:\+?\d[\s-]?){10,13}(?!\d)")


def redact(text: str) -> str:
    return _PHONE.sub("[PHONE]", _EMAIL.sub("[EMAIL]", text or ""))


def log_event(event: str, **fields: Any) -> None:
    """Never raises: auditing must not break the request."""
    try:
        settings.AUDIT_DIR.mkdir(parents=True, exist_ok=True)
        record: Dict[str, Any] = {"ts": datetime.now(timezone.utc).isoformat(), "event": event}
        for k, v in fields.items():
            record[k] = redact(v) if isinstance(v, str) else v
        with _LOCK, open(settings.AUDIT_DIR / "audit.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception:
        pass
