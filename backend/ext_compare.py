from concurrent.futures import ThreadPoolExecutor
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class CompareRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2500)
    language: Optional[str] = "en"
    top_k: int = Field(4, ge=1, le=10)


@router.post("/api/compare", tags=["IPR Legal Assistant"])
def compare(payload: CompareRequest):
    """Runs the same grounded query once per jurisdiction; each side retrieves only from its own jurisdiction."""
    from backend.synthesizer import synthesizer

    def run(j):
        return synthesizer.synthesize(query=payload.query, jurisdiction=j, top_k=payload.top_k, language=payload.language or "en")

    with ThreadPoolExecutor(max_workers=2) as ex:
        fi, fn = ex.submit(run, "India"), ex.submit(run, "International")
        return {"india": fi.result(), "international": fn.result()}
