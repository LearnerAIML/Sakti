"""
Deterministic Formulation Classifier Engine for SAKTI.
Rule-based regulatory and IPR classification engine for Ayurvedic innovations.
Determines:
1. Regulatory Category (Classical ASU, Patent & Proprietary, Phytopharmaceutical, Ayurveda Aahar, Cosmetic)
2. Governing Law and Enforcing Authority
3. Patentability Posture under Patents Act Section 3(p), 3(e), 3(d)
4. NBA Form I / ABS Compliance Trigger under Biological Diversity Act
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class IntendedUse(str, Enum):
    THERAPEUTIC = "therapeutic"  # Treating, curing, or preventing disease/disorder
    DIETARY = "dietary"          # Nutrition, general wellness, dietary supplement
    COSMETIC = "cosmetic"        # Cleansing, beautifying, external skin/hair appearance

class ProcessingNature(str, Enum):
    CLASSICAL = "classical"                                     # Traditional kwath, churna, taila, asava, etc.
    EXTRACT_ADMIXTURE = "aqueous_alcoholic_extract"             # Standard botanical extract or polyherbal combination
    PURIFIED_MARKER_FRACTION = "purified_fraction_with_markers"  # Standardized fraction with >= 4 bioactive marker compounds
    SYNTHETIC_DERIVATIVE = "synthetic_derivative"                # Synthetic derivative of a plant constituent

class FormulationInput(BaseModel):
    intended_use: IntendedUse = Field(..., description="Primary commercial and therapeutic intent of the product")
    is_in_authoritative_texts: bool = Field(..., description="Whether formulation is explicitly specified in First Schedule classical texts")
    processing_nature: ProcessingNature = Field(..., description="Method of extraction or processing used")
    has_synthetic_additives: bool = Field(False, description="Whether formulation contains synthetic chemicals or isolated modern APIs")
    product_name: Optional[str] = Field("Ayurvedic Formulation", description="Optional name of the product")

class ClassificationResult(BaseModel):
    product_name: str
    category: str
    category_code: str
    governing_law: str
    licensing_authority: str
    patentability: Dict[str, Any]
    abs_compliance: Dict[str, Any]
    regulatory_requirements: Dict[str, Any]
    warnings: List[str]

class FormulationClassifier:
    """
    Deterministic rule engine mapping formulation inputs to regulatory and IPR regimes.
    """

    @classmethod
    def classify(cls, item: FormulationInput) -> ClassificationResult:
        warnings: List[str] = []
        name = item.product_name or "Ayurvedic Formulation"

        # Check for synthetic additives warning
        if item.has_synthetic_additives:
            warnings.append(
                "CRITICAL WARNING: Contains synthetic additives or non-herbal active ingredients. "
                "This may disqualify the formulation from AYUSH licensing or FSSAI Ayurveda Aahar certification."
            )

        # -------------------------------------------------------------
        # 1. ARCHETYPE 5: AYURVEDIC COSMETIC
        # -------------------------------------------------------------
        if item.intended_use == IntendedUse.COSMETIC:
            return ClassificationResult(
                product_name=name,
                category="Ayurvedic Cosmetic",
                category_code="COSMETIC",
                governing_law="Drugs and Cosmetics Act, 1940 (Section 3(aaa)) & Cosmetics Rules, 2020",
                licensing_authority="State Licensing Authority (Cosmetics Division) / CDSCO",
                patentability={
                    "status": "Generally Barred",
                    "relevant_sections": ["Patents Act Section 3(p)", "Patents Act Section 3(e)"],
                    "assessment": (
                        "Formulation compositions containing known botanical ingredients (e.g. aloe vera, sandalwood) "
                        "are excluded under Section 3(p) as traditional knowledge and Section 3(e) as mere admixtures. "
                        "Only novel, non-obvious cosmetic delivery systems (e.g. liposomal carriers) or novel extraction processes "
                        "may be eligible."
                    ),
                    "recommended_ip_strategy": "Register Trade Marks (brand name & logo), design registration for packaging, and trade secrets for cosmetic base formulation."
                },
                abs_compliance={
                    "nba_form_required": True,
                    "form_type": "NBA Form I (if patent applied) / SBB Prior Intimation (commercial production)",
                    "statutory_provisions": ["Biological Diversity Act Section 6 & 7", "2024 ABS Rules"],
                    "exemption_eligible": False,
                    "guidance": "Commercial manufacturing utilizing Indian biological resources requires prior intimation to the State Biodiversity Board and payment of ABS fee (0.1% to 0.5% ex-factory sale)."
                },
                regulatory_requirements={
                    "license_type": "Cosmetics Manufacturing License (Form COS-8)",
                    "clinical_trials_required": False,
                    "evidentiary_standard": "Heavy metals, microbial limits, and skin irritation safety testing as per Bureau of Indian Standards (BIS)."
                },
                warnings=warnings
            )

        # -------------------------------------------------------------
        # 2. ARCHETYPE 4: AYURVEDA AAHAR (NUTRACEUTICAL / FOOD)
        # -------------------------------------------------------------
        if item.intended_use == IntendedUse.DIETARY:
            if item.has_synthetic_additives:
                warnings.append(
                    "REGULATORY VIOLATION: Regulation 4 of FSSAI Ayurveda Aahar Regulations 2022 strictly prohibits "
                    "synthetic vitamins, minerals, or amino acids. The product will fail Ayurveda Aahar certification."
                )
            return ClassificationResult(
                product_name=name,
                category="Ayurveda Aahar (Nutraceutical / Food Supplement)",
                category_code="AYURVEDA_AAHAR",
                governing_law="Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 & FSSAI Act, 2006",
                licensing_authority="Food Safety and Standards Authority of India (FSSAI)",
                patentability={
                    "status": "Barred for Health/Dietary Claims",
                    "relevant_sections": ["Patents Act Section 3(p)", "Patents Act Section 3(e)", "Patents Act Section 3(i)"],
                    "assessment": (
                        "Dietary preparations and health supplements derived from traditional recipes are excluded "
                        "from patentability under Section 3(p) (traditional knowledge) and Section 3(e) (mere admixture). "
                        "Furthermore, dietary treatments are not patentable as medical treatments under Section 3(i)."
                    ),
                    "recommended_ip_strategy": "Brand protection via Trade Marks, proprietary culinary recipes via Trade Secrets, and mandatory FSSAI Ayurveda Aahar distinctive logo."
                },
                abs_compliance={
                    "nba_form_required": False,
                    "form_type": "Conditional SBB Intimation",
                    "statutory_provisions": ["Biological Diversity Act Section 7 & Section 40"],
                    "exemption_eligible": True,
                    "guidance": (
                        "If ingredients are purchased strictly as raw agricultural commodities on the 'Normally Traded as Commodities' "
                        "(NTAC) list, ABS exemption applies under Section 40. Commercial processing into novel proprietary food may trigger SBB intimation."
                    )
                },
                regulatory_requirements={
                    "license_type": "FSSAI Food Business Operator (FBO) License under Category 100 (Ayurveda Aahar)",
                    "clinical_trials_required": False,
                    "evidentiary_standard": "Prior approval from FSSAI Expert Committee required if departing from classical recipes; mandatory 'For dietary use only' label."
                },
                warnings=warnings
            )

        # -------------------------------------------------------------
        # 3. ARCHETYPE 3: PHYTOPHARMACEUTICAL DRUG
        # -------------------------------------------------------------
        if (
            item.intended_use == IntendedUse.THERAPEUTIC
            and item.processing_nature == ProcessingNature.PURIFIED_MARKER_FRACTION
        ):
            return ClassificationResult(
                product_name=name,
                category="Phytopharmaceutical Drug",
                category_code="PHYTOPHARMACEUTICAL",
                governing_law="Drugs and Cosmetics Rules, 1945 (Rule 122E & Schedule Y / New Drugs Rules 2019)",
                licensing_authority="Central Drugs Standard Control Organisation (CDSCO / DCGI)",
                patentability={
                    "status": "High Potential (Patentable)",
                    "relevant_sections": ["Patents Act Section 2(1)(j)", "Patents Act Section 3(p) Exception", "Section 10(4)(d)"],
                    "assessment": (
                        "STRONG IP POTENTIAL. A purified and standardized botanical fraction characterized by >= 4 bioactive marker "
                        "compounds is recognized as an innovative pharmaceutical agent. It overcomes Section 3(p) provided the specific fraction, "
                        "isolation process, and enhanced therapeutic bioactivity are not disclosed in traditional texts or the TKDL."
                    ),
                    "recommended_ip_strategy": "File patent applications for both (1) Novel composition of standardized fraction and (2) Novel process of purification/isolation. Must disclose botanical source origin under Sec 10(4)(d)."
                },
                abs_compliance={
                    "nba_form_required": True,
                    "form_type": "NBA Form I (Mandatory Prior Approval for IPR)",
                    "statutory_provisions": ["Biological Diversity Act Section 6(1) & Section 3", "2024 ABS Rules"],
                    "exemption_eligible": False,
                    "guidance": (
                        "Under Section 6(1) of the Biological Diversity Act, 2002 (as amended in 2023), for inventions based on biological resources obtained from India, "
                        "approval of the National Biodiversity Authority must be obtained before the grant of the patent/IPR in or outside India (and prior approval before commercialization). "
                        "In addition, Indian residents filing abroad must comply with Section 39 of the Patents Act, 1970 (Foreign Filing License). Benefit-sharing royalty (0.2%–1.0% ex-factory or 3%–5% licensing) applies."
                    )
                },
                regulatory_requirements={
                    "license_type": "New Drug Approval from CDSCO (Form CT-20/CT-23)",
                    "clinical_trials_required": True,
                    "evidentiary_standard": "Full Phase I, II, III human clinical trials, chemical fingerprinting (HPLC/LC-MS), stability and toxicology studies required."
                },
                warnings=warnings
            )

        # -------------------------------------------------------------
        # 4. ARCHETYPE 1: CLASSICAL / GENERIC AYURVEDIC MEDICINE
        # -------------------------------------------------------------
        if (
            item.intended_use == IntendedUse.THERAPEUTIC
            and item.is_in_authoritative_texts is True
            and item.processing_nature == ProcessingNature.CLASSICAL
        ):
            return ClassificationResult(
                product_name=name,
                category="Classical / Generic Ayurvedic Medicine",
                category_code="CLASSICAL_ASU",
                governing_law="Drugs and Cosmetics Act, 1940 (Section 3(a)) & Drugs and Cosmetics Rules, 1945 (Rule 154)",
                licensing_authority="State Licensing Authority (AYUSH Department)",
                patentability={
                    "status": "Severely Restricted (Section 3(p) objection expected)",
                    "relevant_sections": ["Patents Act Section 3(p)", "Patents Act Section 25(1)(k)", "Section 64(1)(p)"],
                    "assessment": (
                        "Would face severe statutory patentability objections under Section 3(p) and Section 3(e) of the Patents Act, 1970. "
                        "Formulations manufactured strictly in accordance with formulae described in the 54 classical texts specified in the First Schedule "
                        "constitute codified Traditional Knowledge in the public domain. In the absence of unexpected synergistic efficacy or novel non-obvious "
                        "technological modification, patent claims to classical formulations face insurmountable Section 3(p) objections and pre-grant opposition under Section 25(1)(k)."
                    ),
                    "recommended_ip_strategy": "Protect via distinctive Brand Name / Trademark (e.g. 'BrandX Chyawanprash'), unique trade dress / packaging design. Product formula cannot be monopolized."
                },
                abs_compliance={
                    "nba_form_required": False,
                    "form_type": "Exempted for Registered Vaidyas / Form I for Commercial Entities",
                    "statutory_provisions": ["Biological Diversity Act Section 7 Proviso (2023 Amendment)", "Section 40"],
                    "exemption_eligible": True,
                    "guidance": (
                        "Local vaidyas, registered AYUSH practitioners, and traditional healers are strictly EXEMPTED from SBB prior intimation and ABS fees under the 2023 Amendment. "
                        "Commercial manufacturers must notify the relevant State Biodiversity Board."
                    )
                },
                regulatory_requirements={
                    "license_type": "Ayurvedic Drug Manufacturing License (Form 25D)",
                    "clinical_trials_required": False,
                    "evidentiary_standard": "Citation of authoritative recipe from First Schedule texts (e.g. Charaka Samhita, API); no safety/efficacy trial data required under Rule 158B."
                },
                warnings=warnings
            )

        # -------------------------------------------------------------
        # 4b. NEW / NON-CLASSICAL DRUG (synthetic derivative of plant constituent)
        # -------------------------------------------------------------
        if (
            item.intended_use == IntendedUse.THERAPEUTIC
            and item.is_in_authoritative_texts is False
            and item.processing_nature == ProcessingNature.SYNTHETIC_DERIVATIVE
        ):
            warnings.append(
                "Verify the applicable New Drugs and Clinical Trials Rules and current CDSCO requirements before relying on this classification."
            )
            return ClassificationResult(
                product_name=name,
                category="New / Non-Classical Drug",
                category_code="NEW_DRUG",
                governing_law="Drugs and Cosmetics Act, 1940 & New Drugs and Clinical Trials Rules, 2019",
                licensing_authority="Central Drugs Standard Control Organisation (CDSCO)",
                patentability={
                    "status": "Conditional (novelty, inventive step and Section 3(d) to be assessed)",
                    "relevant_sections": ["Patents Act Section 3(d)", "Patents Act Section 3(e)", "Patents Act Section 3(p)"],
                    "assessment": (
                        "A synthetic derivative may be patentable if it is novel, non-obvious and shows enhanced efficacy where "
                        "Section 3(d) applies. A claim that in effect reproduces traditional knowledge could still face Section 3(p) objections."
                    ),
                    "recommended_ip_strategy": "Prior-art search (including TKDL), then consider a compound/process patent alongside trade marks."
                },
                abs_compliance={
                    "nba_form_required": True,
                    "form_type": "NBA approval before IPR grant where Indian biological resources are used",
                    "statutory_provisions": ["Biological Diversity Act Section 6"],
                    "exemption_eligible": False,
                    "guidance": "If the derivative was developed using Indian biological resources, check NBA approval requirements before patent grant."
                },
                regulatory_requirements={
                    "license_type": "New drug permission / marketing authorisation via CDSCO",
                    "clinical_trials_required": True,
                    "evidentiary_standard": "Evidence of safety and efficacy through non-clinical and clinical studies as required by the applicable rules."
                },
                warnings=warnings
            )

        # -------------------------------------------------------------
        # 5. ARCHETYPE 2: PATENT OR PROPRIETARY (P&P) ASU MEDICINE
        # -------------------------------------------------------------
        return ClassificationResult(
            product_name=name,
            category="Patent or Proprietary (P&P) Ayurvedic Medicine",
            category_code="PATENT_PROPRIETARY",
            governing_law="Drugs and Cosmetics Act, 1940 (Section 3(h)) & Drugs and Cosmetics Rules, 1945 (Rule 158B)",
            licensing_authority="State Licensing Authority (AYUSH Department)",
            patentability={
                "status": "Strictly Conditional / High Sec 3(e) & 3(p) Hurdle",
                "relevant_sections": ["Patents Act Section 3(p)", "Patents Act Section 3(e)", "Patents Act Section 3(d)"],
                "assessment": (
                    "Would face significant patentability objections under Section 3(e) (mere admixture) and potentially Section 3(p) (traditional knowledge). "
                    "Combining known botanical ingredients is routinely scrutinized by patent examiners for lack of inventive step. "
                    "To overcome these objections, the applicant must provide rigorous empirical data demonstrating a non-obvious synergistic therapeutic interaction "
                    "(e.g. combination index < 1.0 or non-additive therapeutic effect) not disclosed or implied in classical texts."
                ),
                "recommended_ip_strategy": "Primary protection via strong Trademarks and Trade Secrets (confidential processing ratios). If synergistic data is proven, file combination patent with experimental bioassays."
            },
            abs_compliance={
                "nba_form_required": True,
                "form_type": "NBA Form I (for patent applications) & SBB Commercial Utilization Intimation",
                "statutory_provisions": ["Biological Diversity Act Section 6", "Section 7", "2024 ABS Rules"],
                "exemption_eligible": False,
                "guidance": "Commercial manufacturing requires prior intimation to State Biodiversity Board. If a patent application is filed, prior approval of NBA (Form I) is mandatory before patent grant."
            },
            regulatory_requirements={
                "license_type": "P&P Ayurvedic Drug License (Form 25D under Rule 158B)",
                "clinical_trials_required": False,
                "evidentiary_standard": "Published scientific literature and safety data required under Rule 158B. If novel indications or altered ingredients are used, pilot safety and efficacy data is mandatory."
            },
            warnings=warnings
        )
