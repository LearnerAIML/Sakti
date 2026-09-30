"""Additional endpoints: dossier (+PDF), ABS wizard, TKDL card, India-vs-International compare,
knowledge graph, evaluation dashboard data, Bhashini adapter status."""
import threading
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException, Response
from pydantic import BaseModel, Field

from backend.abs_wizard import ABSInput, ABSResult, run_abs_wizard
from backend.config import settings
from backend.corpus_loader import corpus_store
from backend.dossier import DossierInput, build_dossier, dossier_pdf, tkdl_card
from backend.audit import log_event

router = APIRouter()
_eval_lock = threading.Lock()


@router.post("/api/abs-wizard", response_model=ABSResult, tags=["ABS & TKDL"])
def abs_wizard(payload: ABSInput):
    return run_abs_wizard(payload)


@router.get("/api/tkdl-card", tags=["ABS & TKDL"])
def get_tkdl_card():
    return tkdl_card()


@router.post("/api/dossier", tags=["Product Dossier"])
def dossier(payload: DossierInput):
    d = build_dossier(payload)
    log_event("dossier", category_code=d["category_code"], sources=d["trust"]["sources_cited"])
    return d


@router.post("/api/dossier/pdf", tags=["Product Dossier"])
def dossier_pdf_endpoint(payload: DossierInput):
    d = build_dossier(payload)
    log_event("dossier_pdf", category_code=d["category_code"])
    name = "".join(ch if ch.isalnum() else "_" for ch in payload.product_name)[:40] or "product"
    return Response(dossier_pdf(d), media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="SAKTI_dossier_{name}.pdf"'})


class CompareRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2500)
    language: Optional[str] = "en"
    top_k: int = Field(4, ge=1, le=10)


@router.post("/api/compare", tags=["IPR Legal Assistant"])
def compare(payload: CompareRequest):
    from backend.synthesizer import synthesizer
    def run(j):
        return synthesizer.synthesize(query=payload.query, jurisdiction=j, top_k=payload.top_k, language=payload.language or "en")
    with ThreadPoolExecutor(max_workers=2) as ex:
        fi, fn = ex.submit(run, "India"), ex.submit(run, "International")
        return {"india": fi.result(), "international": fn.result()}


# ---------------- knowledge graph (corpus metadata + editorial mapping) ----------------
TYPE_GROUPS = {
    "Patents": ["patents"], "Traditional knowledge": ["traditional_knowledge"], "Trade Marks": ["trademarks", "trademarks_international"],
    "Geographical Indications": ["geographical_indications"], "Designs": ["designs", "designs_international"], "Copyright": ["copyright"],
    "Plant varieties": ["plant_varieties"], "ABS & biodiversity": ["biodiversity", "biodiversity_abs"],
    "Drug regulation": ["drug_regulatory", "drugs_cosmetics", "advertising_compliance", "standards"],
    "Food safety": ["food_safety"], "Cosmetics": ["cosmetics", "food_cosmetics"],
    "International treaties": ["international", "international_treaty", "patents_international"],
    "Export market access": ["export_market_access"], "Case law": ["case_law"],
}
PRODUCT_LINKS = {
    "Classical / generic medicine": ["Traditional knowledge", "Trade Marks", "Geographical Indications", "Copyright", "ABS & biodiversity", "Drug regulation", "Designs", "Case law"],
    "Patent / proprietary medicine": ["Patents", "Traditional knowledge", "Trade Marks", "Designs", "ABS & biodiversity", "Drug regulation", "Copyright"],
    "New / non-classical drug": ["Patents", "Trade Marks", "ABS & biodiversity", "Drug regulation", "Designs"],
    "Phytopharmaceutical": ["Patents", "Trade Marks", "ABS & biodiversity", "Drug regulation", "Plant varieties"],
    "Ayurveda Aahar / nutraceutical": ["Trade Marks", "Designs", "Geographical Indications", "ABS & biodiversity", "Food safety", "Copyright"],
    "Cosmetic": ["Trade Marks", "Designs", "Patents", "ABS & biodiversity", "Cosmetics"],
}
INTL_ALL = ["International treaties", "Export market access"]


@router.get("/api/graph", tags=["Knowledge Graph"])
def graph():
    docs = corpus_store.get_all()
    nodes, edges = [], []
    nodes += [{"id": f"P:{p}", "label": p, "kind": "product"} for p in PRODUCT_LINKS]
    nodes += [{"id": f"T:{t}", "label": t, "kind": "iptype"} for t in TYPE_GROUPS]
    laws: Dict[str, Dict[str, Any]] = {}
    cat_to_type = {c: t for t, cs in TYPE_GROUPS.items() for c in cs}
    for d in docs:
        t = cat_to_type.get(d.category or "")
        if not t:
            continue
        lid = f"L:{d.statute}"
        laws.setdefault(lid, {"id": lid, "label": d.statute, "kind": "law", "docs": [], "types": set(), "jurisdictions": set()})
        laws[lid]["docs"].append(d.id); laws[lid]["types"].add(t); laws[lid]["jurisdictions"].add(d.jurisdiction)
    for l in laws.values():
        nodes.append({"id": l["id"], "label": l["label"], "kind": "law", "docs": sorted(l["docs"])})
        for t in sorted(l["types"]):
            edges.append({"from": f"T:{t}", "to": l["id"]})
        for j in sorted(l["jurisdictions"]):
            edges.append({"from": l["id"], "to": f"J:{j}"})
    nodes += [{"id": "J:India", "label": "India", "kind": "jurisdiction"}, {"id": "J:International", "label": "International", "kind": "jurisdiction"}]
    for p, ts in PRODUCT_LINKS.items():
        for t in ts + INTL_ALL:
            edges.append({"from": f"P:{p}", "to": f"T:{t}"})
    return {"nodes": nodes, "edges": edges, "docs_total": len(docs),
            "note": "Laws and jurisdictions come from corpus metadata; product-to-IP-type links are an editorial mapping of this prototype."}


# ---------------- evaluation dashboard ----------------
@router.get("/api/eval/latest", tags=["Evaluation"])
def eval_latest():
    from backend.evaluation import load_latest
    data = load_latest()
    if not data:
        raise HTTPException(status_code=404, detail="No evaluation results yet. Run: python scripts/run_eval.py")
    return data


@router.post("/api/eval/run", tags=["Evaluation"])
def eval_run(x_admin_token: Optional[str] = Header(None)):
    if settings.ENVIRONMENT == "production" and (not settings.ADMIN_TOKEN or x_admin_token != settings.ADMIN_TOKEN):
        raise HTTPException(status_code=403, detail="Admin token required in production.")
    if not _eval_lock.acquire(blocking=False):
        raise HTTPException(status_code=409, detail="An evaluation is already running.")
    try:
        from backend.evaluation import run_eval
        return run_eval()
    finally:
        _eval_lock.release()


# ---------------- Bhashini adapter (optional) ----------------
@router.get("/api/languages", tags=["Multilingual"])
def languages():
    from backend.synthesizer import EXTRA_LANGS
    import os
    langs = [{"code": "en", "name": "English"}, {"code": "hi", "name": "Hindi"}] + [{"code": k, "name": v[0]} for k, v in EXTRA_LANGS.items()]
    return {"languages": langs, "bhashini_configured": bool(os.getenv("BHASHINI_API_KEY") and os.getenv("BHASHINI_USER_ID")),
            "note": "Answers in non-English languages are generated by Gemini from retrieved English sources. Bhashini translation can be enabled with BHASHINI_USER_ID and BHASHINI_API_KEY."}
