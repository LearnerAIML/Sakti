"""Evaluation harness: python scripts/run_eval.py  (writes eval_results.json + eval_results.md; also shown at /app -> Evaluation)."""
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from backend.evaluation import run_eval

r = run_eval()
m = r["metrics"]
lines = [f"# SAKTI evaluation ({r['total']} questions, {r['passed']} passed)", f"Modes observed: {'; '.join(r['modes'])}", "",
         "| Metric | Result |", "|---|---|",
         f"| Answerable: expected source cited | {m['answerable_hit'][0]}/{m['answerable_hit'][1]} |",
         f"| Abstention on out-of-scope / fake authority | {m['abstention'][0]}/{m['abstention'][1]} |",
         f"| Jurisdiction traps without cross-jurisdiction citation | {m['jurisdiction_traps'][0]}/{m['jurisdiction_traps'][1]} |",
         f"| Jurisdiction leaks (total) | {m['jurisdiction_leaks']} |", f"| Citations not in corpus | {m['invalid_citations']} |", "",
         "| ID | Type | Pass | Abstained | Confidence | Cited |", "|---|---|---|---|---|---|"]
lines += [f"| {x['id']} | {x['type']} | {'PASS' if x['pass'] else 'FAIL'} | {x['abstained']} | {x['confidence']} | {', '.join(x['cited'])} |" for x in r["rows"]]
(ROOT / "eval_results.md").write_text("\n".join(lines), encoding="utf-8")
print("\n".join(lines[:10]))
