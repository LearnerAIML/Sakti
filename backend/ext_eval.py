import threading
from typing import Optional
from fastapi import APIRouter, Header, HTTPException
from backend.config import settings

router = APIRouter()
_lock = threading.Lock()


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
        raise HTTPException(status_code=403, detail="Admin token required in production (set ADMIN_TOKEN and enter it above).")
    if not _lock.acquire(blocking=False):
        raise HTTPException(status_code=409, detail="An evaluation is already running.")
    try:
        from backend.evaluation import run_eval
        return run_eval()
    finally:
        _lock.release()
