from fastapi import APIRouter
from backend.abs_wizard import ABSInput, run_abs_wizard
from backend.tkdl import tkdl_card

router = APIRouter()


@router.post("/api/abs-wizard", tags=["ABS Wizard"])
def abs_wizard(payload: ABSInput):
    return run_abs_wizard(payload)


@router.get("/api/tkdl-card", tags=["TKDL"])
def tkdl_card_endpoint():
    return tkdl_card()
