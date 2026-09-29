"""
Deterministic IP Path Router for SAKTI.
Evaluates which Intellectual Property protection regimes are relevant for an Ayurvedic product:
1. Patents (The Patents Act, 1970)
2. Trade Marks (The Trade Marks Act, 1999)
3. Geographical Indications (The Geographical Indications of Goods Act, 1999)
4. Designs (The Designs Act, 2000)
5. Plant Variety Protection (PPVFR Act, 2001)

Returns multi-path recommendations with statutory rationale, eligibility conditions,
and official verified registry/portal links.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class IPPathRecommendation(BaseModel):
    ip_regime: str = Field(..., description="Name of the IP regime (Patents, Trade Marks, GI, Designs, PPVFR)")
    is_recommended: bool = Field(..., description="Whether this IP path is recommended for the product")
    status_label: str = Field(..., description="Short status (e.g. 'Recommended', 'Highly Recommended', 'Not Recommended', 'Conditional')")
    relevance_reason: str = Field(..., description="Why this path is or is not relevant")
    eligibility_conditions: str = Field(..., description="Key eligibility criteria to qualify")
    governing_law: str = Field(..., description="Statute and key sections governing this regime")
    official_portal_url: str = Field(..., description="Authoritative registry, application, or search link")

class IPPathRouterInput(BaseModel):
    category: str = Field(
        ...,
        description="Regulatory category: 'Classical / Generic Ayurvedic Medicine', 'Patent or Proprietary (P&P) Ayurvedic Medicine', 'Phytopharmaceutical Drug', 'Ayurveda Aahar (Food / Dietary Supplement)', 'Ayurvedic Cosmetic', or 'Medicinal Plant Cultivar'"
    )
    product_name: Optional[str] = Field("Ayurvedic Formulation", description="Product name")
    has_novel_technical_feature: bool = Field(False, description="Whether product involves a novel extraction, synthetic derivative, or unexpected synergy")
    has_brand_identity: bool = Field(True, description="Whether product has a commercial brand name, logo, or distinct trade dress")
    has_novel_packaging: bool = Field(False, description="Whether product features an innovative custom container, bottle shape, or applicator")
    is_geography_specific: bool = Field(False, description="Whether raw botanicals or preparation derive unique qualities from a specific geographical territory")
    involves_plant_cultivar: bool = Field(False, description="Whether innovation involves breeding or developing a distinct, uniform medicinal plant cultivar")

class IPPathRouterResponse(BaseModel):
    product_name: str
    category: str
    recommended_regimes: List[str]
    paths: List[IPPathRecommendation]
    strategic_summary: str

class IPPathRouter:
    """
    Rule-based deterministic engine evaluating IP protection pathways for Ayurvedic products.
    """

    @classmethod
    def evaluate(cls, item: IPPathRouterInput) -> IPPathRouterResponse:
        paths: List[IPPathRecommendation] = []
        recommended_regimes: List[str] = []
        cat_lower = item.category.lower()

        # -------------------------------------------------------------
        # 1. PATENTS
        # -------------------------------------------------------------
        if "phytopharmaceutical" in cat_lower or item.has_novel_technical_feature:
            pat_rec = True
            pat_status = "Highly Recommended"
            pat_reason = (
                "The product involves a novel standardized extraction process, purified bioactive marker fractions, "
                "or unexpected pharmacological synergy that establishes a technical advance over traditional prior art."
            )
            pat_eligibility = (
                "Must satisfy Section 2(1)(j) novelty and inventive step, demonstrate non-obvious synergy under Section 3(e), "
                "and prove enhanced therapeutic efficacy under Section 3(d). Mandatory NBA Form I approval required under Section 6 of BDA."
            )
        elif "classical" in cat_lower:
            pat_rec = False
            pat_status = "Not Recommended (Statutory Bar)"
            pat_reason = (
                "Classical Ayurvedic formulations documented in First Schedule ancient texts are excluded from patentability "
                "under Section 3(p) as traditional knowledge and Section 3(e) as mere admixtures."
            )
            pat_eligibility = (
                "Cannot be patented in its traditional form. Only a truly non-obvious, isolated active fraction or novel delivery "
                "system exhibiting unexpected therapeutic synergy could be considered."
            )
        else:
            # P&P, Food, Cosmetic without explicit novel tech flag
            pat_rec = item.has_novel_technical_feature
            pat_status = "Conditional (Synergy Required)" if item.has_novel_technical_feature else "Not Recommended"
            pat_reason = (
                "Proprietary herbal mixtures are excluded under Section 3(e) unless the applicant produces empirical comparative "
                "data demonstrating unexpected synergy beyond the additive aggregation of known plant properties."
            )
            pat_eligibility = (
                "Rigorous comparative pharmacological data demonstrating unexpected biological synergy over individual herbs, "
                "plus compliance with Section 10(4)(d) source disclosure and NBA prior approval."
            )

        if pat_rec:
            recommended_regimes.append("Patents")

        paths.append(IPPathRecommendation(
            ip_regime="Patents",
            is_recommended=pat_rec,
            status_label=pat_status,
            relevance_reason=pat_reason,
            eligibility_conditions=pat_eligibility,
            governing_law="The Patents Act, 1970 (Section 2(1)(j), Section 3(p), Section 3(e), Section 3(d))",
            official_portal_url="https://iprsearch.ipindia.gov.in/publicsearch"
        ))

        # -------------------------------------------------------------
        # 2. TRADE MARKS
        # -------------------------------------------------------------
        # Every commercial product benefits from Trade Mark protection
        tm_rec = item.has_brand_identity
        tm_status = "Highly Recommended" if tm_rec else "Recommended"
        tm_reason = (
            "Essential for safeguarding product brand name, company logo, and distinctive packaging against deceptive "
            "imitations and counterfeiters in the Ayurvedic and herbal marketplace."
        )
        tm_eligibility = (
            "Mark must be distinctive. Section 9 prohibits registering generic botanical/Sanskrit names (e.g., 'Ashwagandha', "
            "'Triphala') or purely descriptive therapeutic claims. Must conduct prior trademark search in Class 5 (medicines) or Class 3 (cosmetics)."
        )
        if tm_rec:
            recommended_regimes.append("Trade Marks")

        paths.append(IPPathRecommendation(
            ip_regime="Trade Marks",
            is_recommended=tm_rec,
            status_label=tm_status,
            relevance_reason=tm_reason,
            eligibility_conditions=tm_eligibility,
            governing_law="The Trade Marks Act, 1999 (Section 9, Section 11, Section 27, Section 29)",
            official_portal_url="https://www.wipo.int/wipolex/en/legislation/details/22958"
        ))

        # -------------------------------------------------------------
        # 3. GEOGRAPHICAL INDICATIONS (GI)
        # -------------------------------------------------------------
        gi_rec = item.is_geography_specific
        gi_status = "Recommended" if gi_rec else "Conditional (Territorial Basis)"
        gi_reason = (
            "Relevant if raw herbal ingredients or traditional formulation methods possess special qualities, reputation, or "
            "characteristics inextricably linked to a demarcated geographical region (e.g., Malabar Pepper, Alleppey Cardamom, Navara Rice)."
            if gi_rec else
            "Not immediately applicable unless specific botanical ingredients originate from a protected geographic zone or registered GI territory."
        )
        gi_eligibility = (
            "Producer, cultivator, or manufacturer must operate within the designated geographic territory and apply as an "
            "Authorized User (Form GI-3) under the registered GI registry."
        )
        if gi_rec:
            recommended_regimes.append("Geographical Indications")

        paths.append(IPPathRecommendation(
            ip_regime="Geographical Indications",
            is_recommended=gi_rec,
            status_label=gi_status,
            relevance_reason=gi_reason,
            eligibility_conditions=gi_eligibility,
            governing_law="The Geographical Indications of Goods (Registration and Protection) Act, 1999 (Section 20, Section 22)",
            official_portal_url="https://ipindia.gov.in/page-content/geographical-indications-act-1999"
        ))

        # -------------------------------------------------------------
        # 4. DESIGNS (INDUSTRIAL PACKAGING / APPLICATORS)
        # -------------------------------------------------------------
        des_rec = item.has_novel_packaging
        des_status = "Recommended" if des_rec else "Conditional (Packaging Dependent)"
        des_reason = (
            "Relevant if the formulation is commercialized in a custom, aesthetically novel container, ergonomic bottle, or unique "
            "dispensing applicator judging solely by visual appeal (Class 09 Locarno Classification)."
            if des_rec else
            "Applicable only if a novel, proprietary bottle shape, cap, jar, or dispenser is created for commercial distribution."
        )
        des_eligibility = (
            "Design must be novel and original; cannot have been publicly disclosed or sold prior to filing date; "
            "excludes purely functional mechanical features (Section 2(d))."
        )
        if des_rec:
            recommended_regimes.append("Designs")

        paths.append(IPPathRecommendation(
            ip_regime="Designs",
            is_recommended=des_rec,
            status_label=des_status,
            relevance_reason=des_reason,
            eligibility_conditions=des_eligibility,
            governing_law="The Designs Act, 2000 (Section 4, Section 5, Section 22)",
            official_portal_url="https://ipindia.gov.in/acts/designs-act-2000"
        ))

        # -------------------------------------------------------------
        # 5. PLANT VARIETY PROTECTION (PPVFR)
        # -------------------------------------------------------------
        ppv_rec = item.involves_plant_cultivar or "cultivar" in cat_lower
        ppv_status = "Recommended" if ppv_rec else "Not Relevant for Finished Formulations"
        ppv_reason = (
            "Relevant if the innovation involves breeding, cultivating, or propagating a new, distinct, uniform, and stable "
            "medicinal plant cultivar (e.g., high-yield Ashwagandha or Senna strain)."
            if ppv_rec else
            "Not applicable to manufactured drug formulations; PPVFR protects propagating material (seeds, cuttings) of plant varieties, not medicinal extracts."
        )
        ppv_eligibility = (
            "Must satisfy DUS testing (Distinctiveness, Uniformity, Stability) under Section 15; parental lines must be disclosed; "
            "respects farmers' seed rights under Section 39."
        )
        if ppv_rec:
            recommended_regimes.append("Plant Variety Protection")

        paths.append(IPPathRecommendation(
            ip_regime="Plant Variety Protection",
            is_recommended=ppv_rec,
            status_label=ppv_status,
            relevance_reason=ppv_reason,
            eligibility_conditions=ppv_eligibility,
            governing_law="Protection of Plant Varieties and Farmers' Rights Act, 2001 (Section 15, Section 39, Section 41)",
            official_portal_url="https://plantauthority.gov.in/"
        ))

        # Strategic Advice Summary
        rec_str = " + ".join(recommended_regimes) if recommended_regimes else "Trade Marks (Defensive)"
        summary = (
            f"Recommended IP Strategy for {item.product_name} ({item.category}): {rec_str}. "
            f"For Classical ASU formulations, brand identity (Trade Marks) and industrial packaging (Designs) provide practical commercial exclusivity, "
            f"while Phytopharmaceuticals and novel standardized extracts can additionally secure high-value Patent exclusivity subject to NBA ABS approvals."
        )

        return IPPathRouterResponse(
            product_name=item.product_name or "Ayurvedic Formulation",
            category=item.category,
            recommended_regimes=recommended_regimes,
            paths=paths,
            strategic_summary=summary
        )
