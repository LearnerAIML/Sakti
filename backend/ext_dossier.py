from fastapi import APIRouter, Response
from backend.audit import log_event
from backend.dossier import DossierInput, build_dossier, dossier_pdf

router = APIRouter()


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
