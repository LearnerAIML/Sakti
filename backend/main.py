"""
SAKTI Backend API Gateway.
Provides REST endpoints for:
- /health: System health and API readiness
- /api/query: Grounded RAG legal synthesis with strict source citations and safe abstention
- /api/classify: Deterministic Ayurvedic formulation classifier (5 regulatory archetypes)
- /api/sources: Official legal corpus browser and document detail viewer
"""

from typing import List, Optional, Dict, Any
import logging
from fastapi import FastAPI, HTTPException, Query, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.config import settings
from backend.classifier import (
    FormulationClassifier,
    FormulationInput,
    ClassificationResult,
    IntendedUse,
    ProcessingNature
)
from backend.corpus_loader import corpus_store, CorpusDocument
from backend.synthesizer import (
    synthesizer,
    SynthesisResponse,
    CitationItem
)
from backend.ip_router import (
    IPPathRouter,
    IPPathRouterInput,
    IPPathRouterResponse
)
from backend.registries import get_official_registries, RegistryItem
from backend.highlights_2024 import get_2024_highlights, LegalHighlight
from backend.escalation import (
    ExpertEscalationManager,
    EscalationRequest,
    EscalationRecord
)
from backend.audit import log_event
from backend.privacy import get_privacy_notice, PrivacyNoticeResponse

logger = logging.getLogger("sakti")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Authoritative API Gateway for SAKTI - Ayurveda IPR & Regulatory Intelligence Agent (SIH).\n"
        "Grounds Ayurvedic intellectual property, Access & Benefit Sharing (ABS), and drug regulatory guidance "
        "in official statutes with zero fabricated citations."
    )
)

from backend.extras_api import router as extras_router
app.include_router(extras_router)

# Enable CORS for frontend clients (React / Vite / Streamlit)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# REQUEST / RESPONSE SCHEMAS
# =====================================================================

class QueryRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        max_length=2500,
        description="Legal or IPR question regarding Ayurvedic medicines or botanicals",
        examples=["Can I patent a ginger and honey cough syrup in India?"]
    )
    jurisdiction: Optional[str] = Field(
        "India",
        description="Jurisdiction filter: 'India', 'International', or 'All'",
        examples=["India"]
    )
    top_k: Optional[int] = Field(
        4,
        ge=1,
        le=10,
        description="Number of authoritative context provisions to retrieve"
    )
    language: Optional[str] = Field(
        "en",
        description="Language: en, hi, or gu/mr/ta/te/bn/kn/ml/pa. Hindi is also auto-detected from Devanagari text."
    )

class CorpusSummary(BaseModel):
    id: str
    jurisdiction: str
    statute: str
    section_rule: str
    title: Optional[str] = None
    authority: str
    category: Optional[str] = None
    official_url: str

class SourcesResponse(BaseModel):
    total: int
    jurisdiction_filter: Optional[str] = None
    category_filter: Optional[str] = None
    documents: List[CorpusSummary]

# =====================================================================
# SYSTEM & HEALTH ENDPOINTS
# =====================================================================

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse, Response

STATIC_DIR = Path(__file__).resolve().parent.parent / "frontend" / "static"
if STATIC_DIR.exists():
    app.mount("/app", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

@app.get("/favicon.ico", include_in_schema=False)
def get_root_favicon():
    ico = STATIC_DIR / "favicon.ico"
    if ico.exists():
        return FileResponse(str(ico), media_type="image/x-icon")
    png = STATIC_DIR / "favicon-32x32.png"
    if png.exists():
        return FileResponse(str(png), media_type="image/png")
    return Response(status_code=404)

@app.get("/favicon.png", include_in_schema=False)
def get_root_favicon_png():
    png = STATIC_DIR / "favicon-32x32.png"
    if png.exists():
        return FileResponse(str(png), media_type="image/png")
    return Response(status_code=404)

@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint returning system status, version, and API readiness.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "groq_api_configured": bool(settings.GROQ_API_KEY),
        "corpus_documents_loaded": len(corpus_store.get_all()),
        "unverified_corpus_documents": sum(1 for d in corpus_store.get_all() if not d.last_verified)
    }

@app.get("/", tags=["System"])
def root():
    return RedirectResponse(url="/app/")

# =====================================================================
# CORE WORKFLOW 1: FORMULATION CLASSIFICATION ENDPOINT
# =====================================================================

@app.post(
    "/api/classify",
    response_model=ClassificationResult,
    tags=["Ayurveda Regulatory Workflows"],
    summary="Classify an Ayurvedic formulation into its regulatory & IPR archetype"
)
def classify_formulation(payload: FormulationInput):
    """
    Deterministic rule engine mapping formulation inputs across the 5 statutory archetypes:
    1. Classical / Generic ASU Medicine (DCA Sec 3(a))
    2. Patent or Proprietary (P&P) ASU Medicine (DCA Sec 3(h))
    3. Phytopharmaceutical Drug (DCA Rule 122E / Schedule Y)
    4. Ayurveda Aahar (FSSAI Regulations 2022)
    5. Ayurvedic Cosmetic (DCA Sec 3(aaa) / Cosmetics Rules 2020)

    Returns:
    - Regulatory Category & Governing Law
    - Patentability status under Patents Act Section 3(p) & 3(e)
    - NBA Form I / ABS compliance triggers under Biological Diversity Act
    - Licensing and clinical trial evidentiary standards
    """
    try:
        result = FormulationClassifier.classify(payload)
        log_event("classify", category_code=result.category_code, intended_use=payload.intended_use.value)
        return result
    except Exception as e:
        logger.exception("endpoint failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Formulation classification failed. Please check the inputs and try again."
        )

# =====================================================================
# CORE WORKFLOW 2: GROUNDED RAG QUERY ENDPOINT
# =====================================================================

@app.post(
    "/api/query",
    response_model=SynthesisResponse,
    tags=["IPR Legal Assistant"],
    summary="Submit an IPR/regulatory legal query with jurisdiction routing and grounded citations"
)
def query_legal_assistant(payload: QueryRequest):
    """
    Executes grounded RAG retrieval and synthesis:
    - Filters vector retrieval by jurisdiction ('India' vs 'International')
    - Retrieves top-k matching authoritative provisions
    - Enforces safe abstention if relevance falls below legal threshold (0.52)
    - Invokes Groq LLM for grounded legal analysis with strict citations
    - Validates cited IDs against curated official corpus
    - Returns structured answer, verified citations with URLs, and confidence indicator
    """
    try:
        jurisdiction_val = payload.jurisdiction
        if jurisdiction_val and jurisdiction_val.lower() == "all":
            jurisdiction_val = None

        response = synthesizer.synthesize(
            query=payload.query,
            jurisdiction=jurisdiction_val,
            top_k=payload.top_k or 4,
            language=payload.language or "en"
        )
        return response
    except Exception as e:
        logger.exception("endpoint failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The assistant is temporarily unavailable. Please try again."
        )

# =====================================================================
# CORPUS EXPLORER ENDPOINTS
# =====================================================================

@app.get(
    "/api/sources",
    response_model=SourcesResponse,
    tags=["Corpus Transparency"],
    summary="Explore authoritative legal corpus provisions"
)
def list_sources(
    jurisdiction: Optional[str] = Query(None, description="Filter by 'India' or 'International'"),
    category: Optional[str] = Query(None, description="Filter by category (patents, biodiversity_abs, drug_regulatory, etc.)")
):
    """
    Lists authoritative legal documents in the curated SAKTI knowledge base,
    allowing judges and innovators to verify the grounding sources.
    """
    docs = corpus_store.filter(jurisdiction=jurisdiction, category=category)
    summaries = [
        CorpusSummary(
            id=d.id,
            jurisdiction=d.jurisdiction,
            statute=d.statute,
            section_rule=d.section_rule,
            title=d.title,
            authority=d.authority,
            category=d.category,
            official_url=d.official_url
        )
        for d in docs
    ]
    return SourcesResponse(
        total=len(summaries),
        jurisdiction_filter=jurisdiction,
        category_filter=category,
        documents=summaries
    )

@app.get(
    "/api/sources/{doc_id}",
    response_model=CorpusDocument,
    tags=["Corpus Transparency"],
    summary="Retrieve full statutory text and metadata for a specific provision"
)
def get_source_detail(doc_id: str):
    """
    Returns full text, official URL, and compliance details for an exact statutory ID.
    """
    doc = corpus_store.get_by_id(doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Statutory document ID '{doc_id}' not found in authoritative corpus"
        )
    return doc

# =====================================================================
# IP PATH ROUTER ENDPOINT (SIH CORE REQUIREMENT)
# =====================================================================

@app.post(
    "/api/ip-router",
    response_model=IPPathRouterResponse,
    tags=["IP Strategy & Routing"],
    summary="Evaluate multi-regime IP protection paths (Patents, TM, GI, Designs, PPVFR)"
)
def route_ip_paths(payload: IPPathRouterInput):
    """
    Deterministic IP Path Router evaluating applicable intellectual property regimes:
    - Patents (Patents Act, 1970 - Section 3(p), 3(e), 3(d), Form 1)
    - Trade Marks (Trade Marks Act, 1999 - Form TM-A, Section 9, Class 5)
    - Geographical Indications (GI Act, 1999 - Section 8, Form GI-1)
    - Designs (Designs Act, 2000 - Section 4, Form 1)
    - Plant Variety Protection (PPVFR Act, 2001 - Section 14, Form 1)

    Returns multi-path recommendations with eligibility status, statutory basis,
    and verified official application/search links.
    """
    try:
        return IPPathRouter.evaluate(payload)
    except Exception as e:
        logger.exception("endpoint failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="IP path evaluation failed. Please check the inputs and try again."
        )

# =====================================================================
# OFFICIAL REGISTRIES & FORMS ENDPOINT
# =====================================================================

@app.get(
    "/api/registries",
    response_model=List[RegistryItem],
    tags=["Official Portals & Registries"],
    summary="Get verified official government registry, search, and application portal links"
)
def list_official_registries(
    category: Optional[str] = Query(None, description="Filter by regime (patents, trademarks, gi, designs, ppvfr, abs, regulatory, international)")
):
    """
    Returns curated, verified links to official statutory portals:
    - InPASS Patent Search & Filing
    - Trade Marks Registry & Search
    - Geographical Indications Registry
    - Designs Search & Application
    - PPVFR Plant Variety Portal
    - NBA Access & Benefit Sharing Forms
    - CDSCO Sugam Portal
    - WIPO PATENTSCOPE & Global Brand Database
    """
    return get_official_registries(category=category)

# =====================================================================
# 2024 LAW & POLICY HIGHLIGHTS ENDPOINT
# =====================================================================

@app.get(
    "/api/highlights-2024",
    response_model=List[LegalHighlight],
    tags=["2024 Policy & Legal Highlights"],
    summary="Get structured analysis of recent 2024 statutory updates (ABS Rules, WIPO GRATK Treaty, Patent Rules)"
)
def list_2024_highlights():
    """
    Returns structured data on crucial 2024 amendments and treaties:
    - Biological Diversity (Amendment) Act & 2024 ABS Regulations
    - WIPO GRATK Treaty 2024 (adopted May 2024; entry into force conditions)
    - Patents (Amendment) Rules, 2024 (Form 27 relaxation, Section 8 timeline)
    """
    return get_2024_highlights()

# =====================================================================
# EXPERT ESCALATION ENDPOINTS
# =====================================================================

@app.post(
    "/api/escalate",
    response_model=EscalationRecord,
    tags=["Expert Escalation"],
    summary="Submit an inquiry to create a structured dossier for human IP facilitator review"
)
def create_expert_escalation(payload: EscalationRequest):
    """
    Creates a persistent, structured escalation dossier stored in data/escalations/.
    Facilitates human expert review when automated guidance requires legal representation.
    """
    try:
        rec = ExpertEscalationManager.create_request(payload)
        log_event("escalation", request_id=rec.request_id, jurisdiction=rec.jurisdiction, category=rec.classification_category)
        return rec
    except Exception as e:
        logger.exception("endpoint failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Escalation request could not be saved."
        )

@app.get(
    "/api/escalations",
    tags=["Expert Escalation"],
    summary="Admin only: list recent escalation requests (no contact details)"
)
def list_expert_escalations(limit: int = Query(20, ge=1, le=100), x_admin_token: Optional[str] = Header(None)):
    """Requires the X-Admin-Token header to match ADMIN_TOKEN. Contact details are never returned."""
    if not settings.ADMIN_TOKEN or x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    safe_keys = ("request_id", "created_at", "status", "jurisdiction", "classification_category")
    return [{k: r.get(k) for k in safe_keys} for r in ExpertEscalationManager.list_recent(limit=limit)]

# =====================================================================
# PRIVACY & DATA GOVERNANCE ENDPOINT (DPDP-ALIGNED PROTOTYPE)
# =====================================================================

@app.get(
    "/api/privacy",
    response_model=PrivacyNoticeResponse,
    tags=["Governance & Privacy"],
    summary="Get prototype privacy and data protection disclosures aligned with DPDP Act, 2023 principles"
)
def get_privacy_governance():
    """
    Returns prototype data governance notice outlining:
    - Data minimization and local processing
    - Ephemeral query handling
    - Explicit consent framework
    - Statutory clarity that this is a research prototype, not a certified statutory auditor
    """
    return get_privacy_notice()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
