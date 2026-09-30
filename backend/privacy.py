"""
Privacy Notice & Prototype Data Governance for SAKTI.
Aligns prototype data handling with Digital Personal Data Protection (DPDP) principles
for research and demonstration purposes.
"""

from typing import Dict, Any
from pydantic import BaseModel

class PrivacyNoticeResponse(BaseModel):
    title: str
    purpose: str
    data_collected: Dict[str, str]
    data_handling_and_storage: str
    user_guidance: str
    legal_status: str

PRIVACY_SAFEGUARD_NOTICE: Dict[str, Any] = {
    "title": "SAKTI Prototype Privacy & Data Governance Safeguards",
    "purpose": (
        "SAKTI is an academic and hackathon research prototype designed to assist Ayurvedic innovators, researchers, "
        "and small businesses in understanding Intellectual Property Rights (IPR), Access and Benefit Sharing (ABS), "
        "and regulatory compliance under Indian and international law."
    ),
    "data_collected": {
        "queries_and_formulation_inputs": (
            "Text queries, product categories, and technical descriptions submitted in the classifier, assistant, "
            "and router interfaces to generate real-time statutory analysis."
        ),
        "expert_escalation_data": (
            "Optional innovator contact details (name, email, phone) provided strictly at the user's voluntary discretion "
            "when requesting expert review."
        ),
        "telemetry_and_health": (
            "Audit log (data/audit/audit.jsonl): timestamp, PII-redacted query, jurisdiction, retrieved source IDs and scores, model used, abstention flag. Stored locally on the server."
        )
    },
    "data_handling_and_storage": (
        "All data processed by this prototype is stored on local server storage (except query text sent to Gemini, see below). No user inquiries, "
        "formulation recipes, or contact data are harvested, monetized, sold, or shared with third-party advertising networks. "
        "Query text is sent to the Google Gemini API from the server for retrieval embeddings and answer generation, so it leaves this server; "
        "API keys are never exposed to browsers."
    ),
    "user_guidance": (
        "Users are advised not to submit proprietary unpatented chemical formulas, undisclosed industrial trade secrets, "
        "or sensitive personal identifiers (such as government IDs or medical patient records) into the prototype interface."
    ),
    "legal_status": (
        "PROTOTYPE SAFEGUARD NOTICE: This statement reflects privacy safeguards and architectural alignment with basic "
        "data minimization principles outlined under India's Digital Personal Data Protection Act, 2023 (DPDP). This notice "
        "is established for prototype demonstration purposes and does not represent an audited statutory compliance certification."
    )
}

def get_privacy_notice() -> Dict[str, Any]:
    return PRIVACY_SAFEGUARD_NOTICE
