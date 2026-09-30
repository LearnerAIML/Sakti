"""Evaluation harness shared by scripts/run_eval.py and the /api/eval endpoints."""
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

ROOT = Path(__file__).resolve().parent.parent
RESULT_FILE = ROOT / "eval_results.json"
QUESTIONS_FILE = ROOT / "tests" / "eval_questions.json"


def run_eval(client=None) -> Dict[str, Any]:
    from starlette.testclient import TestClient
    from backend.main import app
    from backend.corpus_loader import corpus_store
    client = client or TestClient(app)
    qs = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
    agg = {"answer": [0, 0], "abstain": [0, 0], "jurisdiction_only": [0, 0]}
    rows, leaks, invalid, modes = [], 0, 0, set()
    for q in qs:
        d = client.post("/api/query", json={"query": q["q"], "jurisdiction": q["j"], "top_k": 4}).json()
        cites = d.get("citations", [])
        ids = [c["id"] for c in cites]
        leak = any(c["jurisdiction"] != q["j"] for c in cites)
        bad = [i for i in ids if not corpus_store.get_by_id(i)]
        leaks += leak
        invalid += len(bad)
        modes.add((d.get("retrieval_mode"), d.get("generation_mode")))
        if q["type"] == "answer":
            ok = any(e in ids for e in q["expect"]) and not d["is_abstained"]
        elif q["type"] == "abstain":
            ok = d["is_abstained"]
        else:
            ok = not leak
        agg[q["type"]][0] += int(ok)
        agg[q["type"]][1] += 1
        rows.append({"id": q["id"], "q": q["q"], "jurisdiction": q["j"], "type": q["type"], "pass": bool(ok),
                     "abstained": d["is_abstained"], "confidence": d["confidence"], "cited": ids,
                     "expected": q.get("expect", []), "leak": bool(leak), "invalid_citations": bad})
    total = len(rows)
    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "total": total, "passed": sum(r["pass"] for r in rows),
        "modes": sorted(f"retrieval={a}, generation={b}" for a, b in modes if a != "none"),
        "metrics": {
            "answerable_hit": agg["answer"], "abstention": agg["abstain"], "jurisdiction_traps": agg["jurisdiction_only"],
            "jurisdiction_leaks": leaks, "invalid_citations": invalid,
        },
        "rows": rows,
    }
    RESULT_FILE.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    return result


def load_latest() -> Dict[str, Any]:
    if not RESULT_FILE.exists():
        return {}
    data = json.loads(RESULT_FILE.read_text(encoding="utf-8"))
    return data if isinstance(data, dict) else {}
