"""
2024 Law and Policy Highlights for SAKTI.
Data-driven summary of major 2024 statutory and treaty updates relevant to Ayurvedic IPR:
1. Biological Diversity (ABS) Guidelines & Regulations, 2024
2. WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (GRATK, May 2024)
3. The Patents (Amendment) Rules, 2024 (India)
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field

class LegalHighlight(BaseModel):
    id: str
    title: str
    jurisdiction: str
    domain: str
    what_changed: str
    why_it_matters: str
    applicability_status: str
    governing_authority: str
    official_source_url: str

HIGHLIGHTS_2024: List[Dict[str, Any]] = [
    {
        "id": "HL-2024-BDA-ABS",
        "title": "Biological Diversity Access & Benefit Sharing (ABS) Regulations, 2024",
        "jurisdiction": "India",
        "domain": "Biodiversity & Traditional Knowledge",
        "what_changed": (
            "Operationalized the Biological Diversity (Amendment) Act, 2023 by standardizing benefit-sharing payment structures "
            "(0.1% to 0.5% of ex-factory sales for commercial utilization) and establishing codified statutory exemptions for: "
            "(a) cultivated medicinal plants backed by origin certificates, (b) registered AYUSH practitioners (Vaidyas/Hakims) "
            "manufacturing remedies for individual patients, and (c) codified classical Ayurvedic medicines from domestic SBB benefit-sharing levies."
        ),
        "why_it_matters": (
            "Substantially reduces regulatory ambiguity for domestic Ayurvedic manufacturers by eliminating SBB intimation and "
            "ABS fees on cultivated raw materials, while maintaining rigorous NBA Form I prior-approval oversight for intellectual "
            "property filings and foreign entities."
        ),
        "applicability_status": "In Force (Notified and actively applied by NBA and State Biodiversity Boards)",
        "governing_authority": "National Biodiversity Authority (NBA / MoEFCC)",
        "official_source_url": "https://nbaindia.org/content/19/16/1/guidelines.html"
    },
    {
        "id": "HL-2024-WIPO-GRATK",
        "title": "WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (2024)",
        "jurisdiction": "International",
        "domain": "International Patent Law & Traditional Knowledge",
        "what_changed": (
            "Adopted at the WIPO Diplomatic Conference in Geneva on May 24, 2024. Establishes a groundbreaking mandatory disclosure "
            "requirement: where a claimed invention in a patent application is materially based on genetic resources and/or associated "
            "traditional knowledge, applicants must disclose the country of origin or Indigenous/local community source. Contains "
            "express non-retroactivity protections (Article 5) and safeguards against automatic patent revocation for non-fraudulent omissions."
        ),
        "why_it_matters": (
            "Historic milestone in international IPR: prevents wrongful patenting of traditional Indian Ayurvedic medicine globally "
            "and creates transparency across international patent offices (USPTO, EPO, JPO) once ratified. Indian applicants filing "
            "abroad must document biological origin meticulously."
        ),
        "applicability_status": "Adopted on May 24, 2024; Legal obligations enter into force three months after 15 contracting states deposit instruments of ratification or accession.",
        "governing_authority": "World Intellectual Property Organization (WIPO)",
        "official_source_url": "https://www.wipo.int/edocs/mdocs/tk/en/gratk_dc/gratk_dc_7.pdf"
    },
    {
        "id": "HL-2024-PAT-RULES",
        "title": "The Patents (Amendment) Rules, 2024",
        "jurisdiction": "India",
        "domain": "Patent Prosecution & Examination",
        "what_changed": (
            "Notified in March 2024. Key procedural modernizations include: (a) Rule 12 Section 8 compliance streamlined—the Controller "
            "now retrieves foreign prosecution history via public databases, reducing repeated Form 3 filing burdens on applicants; "
            "(b) introduction of Certificate of Inventorship in Form 31 allowing named inventors to be recognized; (c) discounted renewal fees "
            "for advance payments; and (d) strict timelines for working statements (Form 27 once every three financial years instead of annually)."
        ),
        "why_it_matters": (
            "Significantly reduces patent prosecution compliance friction and maintenance costs for Ayurvedic startups, academic "
            "institutions, and individual inventors seeking to protect novel phytopharmaceutical extraction techniques."
        ),
        "applicability_status": "In Force (Notified in Official Gazette and enacted by the Indian Patent Office)",
        "governing_authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_source_url": "https://ipindia.gov.in/acts/patent-act-1970"
    }
]

def get_2024_highlights() -> List[Dict[str, Any]]:
    """Returns verified 2024 policy and legal updates."""
    return HIGHLIGHTS_2024
