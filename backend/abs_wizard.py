"""ABS wizard: short answers -> checklist of authorities, forms/portals and next steps.
Deterministic; every step cites corpus IDs (filtered to IDs that exist). Information only, not legal advice."""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from backend.corpus_loader import corpus_store
from backend.registries import get_official_registries

Applicant = Literal["indian_individual", "indian_company", "ayush_practitioner", "foreign_or_nri", "foreign_participation_company"]
Source = Literal["wild", "cultivated", "codified_formulation", "traded_commodity"]
Purpose = Literal["research", "commercial_product", "patent_filing"]
Filing = Literal["none", "india", "abroad", "both"]


class ABSInput(BaseModel):
    applicant_type: Applicant = Field("indian_company", description="Who is accessing the resource")
    resource_indian: bool = Field(True, description="Is the biological resource / associated knowledge from India?")
    resource_source: Source = "wild"
    purpose: Purpose = "commercial_product"
    ipr_filing: Filing = "none"
    product_name: Optional[str] = "Ayurvedic product"


class ABSStep(BaseModel):
    step: str
    detail: str
    authority: str
    cites: List[str] = Field(default_factory=list)


class ABSResult(BaseModel):
    product_name: str
    outcome: str
    outcome_level: Literal["required", "conditional", "exempt", "not_triggered"]
    steps: List[ABSStep]
    exemptions_considered: List[str]
    portals: List[dict]
    caveats: List[str]


def _c(*ids: str) -> List[str]:
    return [i for i in ids if corpus_store.get_by_id(i)]


def run_abs_wizard(x: ABSInput) -> ABSResult:
    steps: List[ABSStep] = []
    exempt: List[str] = []
    caveats = [
        "Exemption and approval outcomes depend on facts (certificates, ownership, nature of use). Confirm with the NBA / State Biodiversity Board before acting.",
        "Cited provisions are curated summaries; several are marked pending manual verification against the official text.",
    ]
    foreign = x.applicant_type in ("foreign_or_nri", "foreign_participation_company")
    commercial = x.purpose in ("commercial_product", "patent_filing")
    portals = get_official_registries(category="Biodiversity & ABS")

    if not x.resource_indian:
        steps.append(ABSStep(
            step="Check the provider country's ABS law",
            detail="The Indian Biological Diversity Act regime applies to biological resources and associated knowledge obtained from India. For material from elsewhere, follow the provider country's access, prior-informed-consent and benefit-sharing rules under the Nagoya framework.",
            authority="Provider-country national focal point / CBD ABS Clearing-House", cites=_c("INT-CBD-NAGOYA-2010", "INT-CBD-ART-015")))
        if x.purpose == "patent_filing":
            steps.append(ABSStep(step="Prepare for origin disclosure in patent filings",
                detail="Several jurisdictions and the WIPO GRATK treaty (once in force for the relevant party) require disclosure of the origin of genetic resources used in a claimed invention.",
                authority="Target patent office", cites=_c("INT-WIPO-GRATK-2024")))
        return ABSResult(product_name=x.product_name or "Ayurvedic product",
            outcome="Indian ABS approval is not triggered on these facts; provider-country rules apply.",
            outcome_level="not_triggered", steps=steps, exemptions_considered=[], portals=portals, caveats=caveats)

    level = "conditional"
    if foreign:
        level = "required"
        steps.append(ABSStep(step="Obtain prior approval from the National Biodiversity Authority (NBA)",
            detail="Non-citizens, NRIs and bodies corporate that are not Indian or that have non-Indian participation in share capital or management need NBA approval before obtaining Indian biological resources or associated knowledge for research, commercial utilisation or bio-survey.",
            authority="National Biodiversity Authority", cites=_c("IN-BDA-SEC-003", "IN-BDA-SEC-019")))
    elif commercial:
        if x.applicant_type == "ayush_practitioner":
            exempt.append("Local vaidyas / registered AYUSH practitioners: exempt from prior intimation and ABS fees (2023 amendment summary).")
        if x.resource_source == "cultivated":
            exempt.append("Cultivated medicinal plants: exempt if a certificate of origin / cultivation certificate is maintained.")
        if x.resource_source == "codified_formulation":
            exempt.append("Codified traditional formulations made strictly per recognised classical texts: exemption discussed in the 2024 regulations summary.")
        if x.resource_source == "traded_commodity":
            exempt.append("Items normally traded as commodities (NTAC): exempt from ABS where notified.")
        if exempt:
            level = "exempt"
            steps.append(ABSStep(step="Keep proof for the exemption you rely on",
                detail="Retain the certificate of origin / cultivation certificate, purchase invoices, practitioner registration or classical-text reference, so you can show the exemption applies if asked.",
                authority="State Biodiversity Board (SBB)",
                cites=_c("IN-BDA-SEC-007-EXEMP", "IN-BDA-RUL-2024-EXEMP", "IN-BDA-SEC-040-NTAC")))
        else:
            level = "required"
            steps.append(ABSStep(step="Give prior intimation to the State Biodiversity Board",
                detail="Indian citizens and Indian-registered bodies obtaining biological resources for commercial utilisation must give prior intimation to the concerned SBB.",
                authority="State Biodiversity Board", cites=_c("IN-BDA-SEC-007", "IN-BDA-SEC-024")))
            steps.append(ABSStep(step="Plan for benefit sharing",
                detail="Benefit-sharing percentages depend on annual gross ex-factory sales (tiered) or IPR royalties. Proceeds are determined and recovered under the Act.",
                authority="NBA / SBB", cites=_c("IN-BDA-RUL-2024-ABS", "IN-BDA-SEC-021")))
    else:
        steps.append(ABSStep(step="Research use: check transfer restrictions",
            detail="Even for research, transferring results or the resource to foreign parties can need NBA permission; keep access records.",
            authority="NBA", cites=_c("IN-BDA-SEC-004", "IN-BDA-SEC-020")))

    if x.purpose == "patent_filing" or x.ipr_filing != "none":
        steps.append(ABSStep(step="NBA approval before IPR grant",
            detail="An IPR application (in or outside India) for an invention based on a biological resource obtained from India needs NBA approval before grant. Check separately whether any exemption above also covers this step.",
            authority="National Biodiversity Authority", cites=_c("IN-BDA-SEC-006")))
        steps.append(ABSStep(step="Disclose source and geographical origin in the patent specification",
            detail="Name the biological material and its geographical origin (for example district and state) in the complete specification.",
            authority="Indian Patent Office", cites=_c("IN-PAT-SEC-010-4D")))
        if x.ipr_filing in ("abroad", "both"):
            steps.append(ABSStep(step="Foreign filing: permission and origin-disclosure rules",
                detail="Residents of India may need prior permission before filing abroad for inventions made in India, unless an Indian application was filed first and the waiting period has passed. Foreign offices and the PCT/GRATK framework may also require origin declarations.",
                authority="Indian Patent Office; target patent office",
                cites=_c("IN-PAT-SEC-039", "INT-PCT-RUL-051BIS", "INT-WIPO-GRATK-2024")))
    steps.append(ABSStep(step="Check traditional-knowledge prior art before you file",
        detail="If the formulation or use is documented in classical texts, TKDL may already count as prior art; see the TKDL card.",
        authority="CSIR-TKDL / Indian Patent Office", cites=_c("IN-TKDL-PRIA-001", "IN-PAT-SEC-025-OPP")))

    outcome = {
        "required": "ABS obligations are likely to apply: approval or intimation and benefit sharing.",
        "conditional": "Obligations depend on the facts; see the checklist.",
        "exempt": "An exemption may apply if you can document it; IPR-stage approval may still be relevant.",
    }[level]
    return ABSResult(product_name=x.product_name or "Ayurvedic product", outcome=outcome, outcome_level=level,
                     steps=steps, exemptions_considered=exempt, portals=portals, caveats=caveats)
