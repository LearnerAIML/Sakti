# SAKTI — IP-SAKTI Sahayak (SIH 2026, PS 26045)

Multilingual (EN/HI), source-cited RAG assistant for Ayurveda IP, ABS and drug-regulatory guidance.
**Information, not legal advice.**

## What it does
| Feature | Implementation |
|---|---|
| Jurisdiction switch (India / International) | Applied as a metadata filter on retrieval, not just in the prompt |
| Cited answers | Gemini answers only from retrieved provisions; `[SOURCE-ID]` tokens are parsed, checked against the retrieved set and corpus; unknown IDs are stripped and reported |
| Confidence | From retrieval score + verified citations (not model self-report) |
| Safe abstention | Score threshold (`ABSTENTION_THRESHOLD`), model "INSUFFICIENT EVIDENCE", scope and injection guardrails |
| Formulation classifier | Deterministic rules: classical, P&P, phytopharmaceutical, new drug, Ayurveda Aahar, cosmetic |
| IP router, registries, 2024 highlights | Deterministic engines with official portal links |
| Human escalation | Dossier stored server-side; listing is admin-token only and never returns contact details |
| Audit log | `data/audit/audit.jsonl` (redacted query, retrieved IDs/scores, model, abstention) |
| **Product Dossier** (+PDF) | One click: classifier → IP router → ABS → TKDL → advertising/labelling → international notes, every section cited (`POST /api/dossier`, `/api/dossier/pdf`) |
| **Trust panel** | Clickable `[ID]` chips open the exact corpus passage; verified/unverified badge; confidence with reason; last-verified dates |
| **India vs International** | Toggle plus side-by-side compare (`POST /api/compare`), each retrieved only from its own jurisdiction |
| **ABS wizard + TKDL card** | Four short questions → checklist of authorities, exemptions and steps; TKDL prior-art explainer (`/api/abs-wizard`, `/api/tkdl-card`) |
| **Evaluation dashboard** | 30-question run: expected-source hits, abstention, jurisdiction leaks, invalid citations (`/api/eval/latest`, `/api/eval/run`) |
| **Voice + languages** | Browser speech input; Gemini answers in Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi; optional Bhashini switch via env vars (adapter not implemented) |
| **Knowledge graph** | Clickable product → IP type → law → jurisdiction view (`/api/graph`) built from corpus metadata plus an editorial mapping |
| Resilience | If embeddings or the LLM are unavailable: keyword retrieval / grounded excerpt (labelled) |

## Run
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add GEMINI_API_KEY
uvicorn backend.main:app --port 8000   # UI at http://127.0.0.1:8000/app/
python scripts/rebuild_index.py        # re-embed after corpus changes (also happens automatically on first query)
pytest -q                              # runs offline; live-LLM tests skip without a key

# Docker
docker build -t sakti . && docker run -p 8000:8000 -e GEMINI_API_KEY=... -e ADMIN_TOKEN=... sakti
python scripts/run_eval.py             # writes eval_results.md
```

## Evaluation
`tests/eval_questions.json` holds 25 questions (18 answerable, 5 out-of-scope/fake-authority, 2 jurisdiction traps).
Run `python scripts/run_eval.py` with a key before the demo; results appear in the app's Evaluation tab. Without a key the run uses keyword fallback (offline check: 23/30 passed, 5/5 abstentions, 0 jurisdiction leaks); dense retrieval is expected to do better but is not measured yet.

## Known limitations (be upfront in the demo)
- Corpus: 67 curated summaries. many are marked `pending_manual_verification`; verify against India Code / WIPO Lex / treaty texts and set `last_verified`.
- Madrid, Hague, Budapest and EU/US export notes are short curated summaries and all are `pending_manual_verification`.
- Bhashini adapter, agentic workflows and paid-source connectors are planned, not built. Non-English answers need dense retrieval (Gemini embeddings); keyword fallback is English-only.
- `frontend/src` (React) is an unused scaffold; the served UI is `frontend/static/index.html` plus `extras.js`/`extras.css`.
- Audit log and escalation files are written to local disk; on container hosts they are ephemeral unless a volume is mounted.
- Privacy: query text is sent to the Google Gemini API. Do not submit confidential formulations.
