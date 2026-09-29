"""
Official Registry & Statutory Forms Helper for SAKTI.
Provides direct, verified links to official government registries, search databases,
and statutory compliance forms for Ayurvedic and pharmaceutical innovators.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RegistryItem(BaseModel):
    id: str
    name: str
    jurisdiction: str
    category: str
    description: str
    authority: str
    official_url: str
    purpose: str

OFFICIAL_REGISTRIES: List[Dict[str, Any]] = [
    {
        "id": "REG-PAT-INPASS",
        "name": "Indian Patent Advanced Search System (InPASS)",
        "jurisdiction": "India",
        "category": "Patents",
        "description": "Official public search system of the Indian Patent Office for searching published and granted Indian patents.",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://iprsearch.ipindia.gov.in/publicsearch",
        "purpose": "Conduct prior-art searches on patent claims, formulations, extraction processes, and inventor filings in India."
    },
    {
        "id": "REG-TM-PORTAL",
        "name": "Trade Marks Registry & Legislation Repository",
        "jurisdiction": "India",
        "category": "Trade Marks",
        "description": "Statutory database and registry repository for Indian trademark classification (Class 5 Pharmaceuticals & Class 3 Cosmetics).",
        "authority": "Trade Marks Registry (CGPDTM / IP India)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/22958",
        "purpose": "Verify trademark registrability, avoid Section 9 descriptive bars, and review Class 5 pharmaceutical classifications."
    },
    {
        "id": "REG-GI-INDIA",
        "name": "Geographical Indications Registry",
        "jurisdiction": "India",
        "category": "Geographical Indications",
        "description": "Official portal of the Geographical Indications Registry for traditional agricultural, herbal, and manufactured goods.",
        "authority": "Geographical Indications Registry (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/page-content/geographical-indications-act-1999",
        "purpose": "Browse registered herbal GIs (e.g., Malabar Pepper, Alleppey Cardamom) and obtain Form GI-3 for Authorized User registration."
    },
    {
        "id": "REG-DES-INDIA",
        "name": "Designs Registration Portal",
        "jurisdiction": "India",
        "category": "Designs",
        "description": "Official registry portal for the registration of aesthetic industrial designs, containers, bottles, and packaging.",
        "authority": "Patent and Design Office (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/designs-act-2000",
        "purpose": "Register non-functional bottle shapes, dispenser nozzles, and novel packaging designs under Locarno Class 09."
    },
    {
        "id": "REG-PPVFR-PORTAL",
        "name": "Protection of Plant Varieties & Farmers' Rights Authority",
        "jurisdiction": "India",
        "category": "Plant Varieties",
        "description": "Statutory national authority for registration of plant varieties, plant breeders' rights, and recognition of farmers' rights.",
        "authority": "Protection of Plant Varieties and Farmers' Rights Authority (Ministry of Agriculture)",
        "official_url": "https://plantauthority.gov.in/",
        "purpose": "Register new, distinct, uniform, and stable (DUS) medicinal plant cultivars and file benefit-sharing claims under the National Gene Fund."
    },
    {
        "id": "REG-NBA-FORMS",
        "name": "National Biodiversity Authority (NBA) - ABS Guidelines & Statutory Forms",
        "jurisdiction": "India",
        "category": "Biodiversity & ABS",
        "description": "Official statutory portal providing Form I (commercial utilization / IPR application), Form II (transfer of results), and Form III.",
        "authority": "National Biodiversity Authority (NBA / MoEFCC)",
        "official_url": "https://nbaindia.org/content/19/16/1/guidelines.html",
        "purpose": "Download and submit mandatory Access & Benefit Sharing (ABS) compliance applications before filing patents based on biological resources."
    },
    {
        "id": "REG-CDSCO-PORTAL",
        "name": "Central Drugs Standard Control Organisation (CDSCO) Regulatory Portal",
        "jurisdiction": "India",
        "category": "Drug Regulations",
        "description": "Apex regulatory authority for pharmaceuticals, clinical trials, phytopharmaceuticals, and cosmetic safety in India.",
        "authority": "CDSCO (Ministry of Health & Family Welfare)",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/",
        "purpose": "Access DCA 1940, New Drugs and Clinical Trials Rules 2019, and Schedule Y guidelines for phytopharmaceutical clinical validation."
    },
    {
        "id": "REG-WIPO-PATENTSCOPE",
        "name": "WIPO PATENTSCOPE International Patent Search",
        "jurisdiction": "International",
        "category": "Patents",
        "description": "Global patent search portal covering over 110 million patent documents including PCT international applications.",
        "authority": "World Intellectual Property Organization (WIPO)",
        "official_url": "https://patentscope.wipo.int/search/en/search.jsf",
        "purpose": "Search global patent filings, international prior art, and PCT national phase entries for herbal and pharmaceutical innovations."
    },
    {
        "id": "REG-WIPO-BRAND-DB",
        "name": "WIPO Global Brand Database",
        "jurisdiction": "International",
        "category": "Trade Marks",
        "description": "Free, global search engine for international trademarks registered under the Madrid System and national collections.",
        "authority": "World Intellectual Property Organization (WIPO)",
        "official_url": "https://branddb.wipo.int/",
        "purpose": "Verify international trademark clearance across multiple export markets for Ayurvedic brand names and logos."
    }
]

def get_official_registries(category: Optional[str] = None, jurisdiction: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns official registries matching optional category or jurisdiction filters."""
    results = OFFICIAL_REGISTRIES
    if jurisdiction:
        results = [r for r in results if r["jurisdiction"].lower() == jurisdiction.lower()]
    if category:
        results = [r for r in results if r["category"].lower() == category.lower()]
    return results
