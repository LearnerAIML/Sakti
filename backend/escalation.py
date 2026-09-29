"""
Expert Escalation Facilitator for SAKTI.
Matches the SIH Problem Statement requirement for routing complex patent/regulatory inquiries
to a human IP Facilitator, Patent Agent, or AYUSH legal specialist.

Stores structured escalation requests locally and generates a formal tracking dossier.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

ESCALATIONS_DIR = Path(__file__).resolve().parent.parent / "data" / "escalations"

class EscalationRequest(BaseModel):
    query: str = Field(..., description="The user's legal or patent query requiring human review")
    jurisdiction: str = Field("India", description="'India' or 'International'")
    product_name: Optional[str] = Field(None, description="Name of the Ayurvedic product or formulation")
    formulation_details: Optional[str] = Field(None, description="Details of ingredients, preparation method, or intended use")
    classification_category: Optional[str] = Field(None, description="Result from product classifier if available")
    relevant_ip_paths: Optional[List[str]] = Field(default_factory=list, description="Recommended IP regimes from IP Path Router")
    contact_name: Optional[str] = Field(None, description="Optional name of the innovator/applicant")
    contact_email: Optional[str] = Field(None, description="Optional contact email address")
    contact_phone: Optional[str] = Field(None, description="Optional contact phone number")
    user_notes: Optional[str] = Field(None, description="Additional context or specific questions for the IP expert")

class EscalationRecord(BaseModel):
    request_id: str
    created_at: str
    status: str
    query: str
    jurisdiction: str
    product_name: Optional[str]
    formulation_details: Optional[str]
    classification_category: Optional[str]
    relevant_ip_paths: List[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    user_notes: Optional[str]
    disclaimer: str

class ExpertEscalationManager:
    """
    Handles intake, local storage, and structured dispatch of expert review requests.
    """

    @classmethod
    def create_request(cls, req: EscalationRequest) -> EscalationRecord:
        ESCALATIONS_DIR.mkdir(parents=True, exist_ok=True)

        req_id = f"ESC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        timestamp = datetime.now(timezone.utc).isoformat()

        disclaimer = (
            "NOTICE: This escalation request is a formal referral for human IP facilitation assistance "
            "by a registered patent agent or AYUSH regulatory consultant. It does NOT constitute a binding "
            "legal opinion or official patent prosecution action. Information provided will be reviewed by "
            "an IP facilitator for guidance purposes under the Smart India Hackathon prototype framework."
        )

        record = EscalationRecord(
            request_id=req_id,
            created_at=timestamp,
            status="PENDING_EXPERT_REVIEW",
            query=req.query,
            jurisdiction=req.jurisdiction,
            product_name=req.product_name,
            formulation_details=req.formulation_details,
            classification_category=req.classification_category,
            relevant_ip_paths=req.relevant_ip_paths or [],
            contact_name=req.contact_name,
            contact_email=req.contact_email,
            contact_phone=req.contact_phone,
            user_notes=req.user_notes,
            disclaimer=disclaimer
        )

        # Store locally as JSON file
        out_path = ESCALATIONS_DIR / f"{req_id}.json"
        out_path.write_text(json.dumps(record.model_dump(), indent=2), encoding="utf-8")

        return record

    @classmethod
    def list_requests(cls, limit: int = 50) -> List[Dict[str, Any]]:
        if not ESCALATIONS_DIR.exists():
            return []
        records = []
        files = sorted(ESCALATIONS_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
        for f in files:
            try:
                records.append(json.loads(f.read_text(encoding="utf-8")))
                if len(records) >= limit:
                    break
            except Exception:
                pass
        return records

    @classmethod
    def list_recent(cls, limit: int = 50) -> List[Dict[str, Any]]:
        return cls.list_requests(limit=limit)
