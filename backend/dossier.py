"""One-click Product Dossier: classifier -> IP router -> ABS -> TKDL -> advertising/labelling -> international notes.
Deterministic and citation-backed (corpus IDs validated at runtime). Also renders a PDF."""
from datetime import datetime, timezone
from io import BytesIO
from typing import Any, Dict, List, Optional
from xml.sax.saxutils import escape
from pydantic import BaseModel, Field

from backend.abs_wizard import ABSInput, run_abs_wizard
from backend.classifier import FormulationClassifier, FormulationInput, IntendedUse, ProcessingNature
from backend.corpus_loader import corpus_store
from backend.guardrails import MANDATORY_LEGAL_DISCLAIMER
from backend.ip_router import IPPathRouter, IPPathRouterInput


class DossierInput(BaseModel):
    product_name: str = "Ayurvedic Formulation"
    intended_use: IntendedUse = IntendedUse.THERAPEUTIC
    is_in_authoritative_texts: bool = True
    processing_nature: ProcessingNature = ProcessingNature.CLASSICAL
    has_synthetic_additives: bool = False
    has_novel_technical_feature: bool = False
    has_brand_identity: bool = True
    has_novel_packaging: bool = False
    is_geography_specific: bool = False
    involves_plant_cultivar: bool = False
    uses_microorganism: bool = False
    makes_health_claims: bool = True
    export_markets: List[str] = Field(default_factory=list, description="Any of: EU, US")
    applicant_type: str = "indian_company"
    resource_indian: bool = True
    resource_source: str = "wild"
    purpose: str = "commercial_product"
    ipr_filing: str = "none"


def cite_objs(ids: List[str]) -> List[Dict[str, Any]]:
    out, seen = [], set()
    for i in ids:
        d = corpus_store.get_by_id(i)
        if d and i not in seen:
            seen.add(i)
            out.append({"id": d.id, "statute": d.statute, "section_rule": d.section_rule, "title": d.title,
                        "authority": d.authority, "official_url": d.official_url, "jurisdiction": d.jurisdiction,
                        "verified": bool(d.last_verified), "last_verified": d.last_verified,
                        "verification_status": d.verification_status})
    return out


ADV_LABEL = {
    "IN-DCA-RUL-170-ADV": "Advertising: claims to cure or prevent scheduled diseases are prohibited; brand names implying such cures risk refusal.",
    "IN-DCA-RUL-161-LBL": "Labelling: true list of ingredients, packaging and label particulars for ASU medicines.",
    "IN-DCA-SCH-T-GMP": "Manufacturing: GMP requirements for Ayurvedic, Siddha and Unani products.",
    "IN-DCA-RUL-153": "Licence: manufacturing licence application for ASU drugs.",
    "IN-DCA-RUL-158B": "Licence conditions and proof of effectiveness for ASU drugs.",
    "IN-DCA-RUL-122E-PHYTO": "Phytopharmaceutical route: dossier, trials and approval expectations.",
    "IN-FSSAI-AYU-001": "Ayurveda Aahar: definition, scope and prohibitions.",
    "IN-FSSAI-AYU-002": "Ayurveda Aahar: prior approval for novel formulations and labelling.",
    "IN-COS-RUL-2020": "Cosmetics vs drugs: keep claims on the cosmetic side of the boundary.",
    "IN-COS-RUL-039-SAFE": "Cosmetics safety: heavy-metal limits and animal-testing ban.",
    "IN-API-PHARMA-STD": "Quality: Ayurvedic Pharmacopoeia of India statutory standards.",
}
ADV_BY_CODE = {
    "CLASSICAL_ASU": ["IN-DCA-RUL-170-ADV", "IN-DCA-RUL-161-LBL", "IN-DCA-SCH-T-GMP", "IN-DCA-RUL-153", "IN-API-PHARMA-STD"],
    "PATENT_PROPRIETARY": ["IN-DCA-RUL-170-ADV", "IN-DCA-RUL-161-LBL", "IN-DCA-SCH-T-GMP", "IN-DCA-RUL-158B", "IN-API-PHARMA-STD"],
    "NEW_DRUG": ["IN-DCA-RUL-170-ADV", "IN-DCA-RUL-161-LBL", "IN-DCA-RUL-158B", "IN-DCA-SCH-T-GMP"],
    "PHYTOPHARMACEUTICAL": ["IN-DCA-RUL-122E-PHYTO", "IN-DCA-RUL-170-ADV", "IN-DCA-RUL-161-LBL"],
    "AYURVEDA_AAHAR": ["IN-FSSAI-AYU-001", "IN-FSSAI-AYU-002", "IN-DCA-RUL-170-ADV"],
    "COSMETIC": ["IN-COS-RUL-2020", "IN-COS-RUL-039-SAFE", "IN-DCA-RUL-170-ADV"],
}


CLS_CITE = {"CLASSICAL_ASU": "IN-DCA-SEC-003A", "PATENT_PROPRIETARY": "IN-DCA-SEC-003H", "NEW_DRUG": "IN-DCA-RUL-158B",
            "PHYTOPHARMACEUTICAL": "IN-DCA-RUL-122E-PHYTO", "AYURVEDA_AAHAR": "IN-FSSAI-AYU-001", "COSMETIC": "IN-COS-RUL-2020"}


def tkdl_card() -> Dict[str, Any]:
    return {
        "title": "TKDL prior-art card",
        "what_it_is": "The Traditional Knowledge Digital Library is a CSIR-run database of formulations documented in classical Indian medical texts, structured so patent examiners can search it as prior art.",
        "how_examiners_use_it": [
            "Under access agreements with several patent offices, examiners can search TKDL during prior-art search and cite matching entries against claims.",
            "A match can lead to objection or refusal of claims that only restate documented traditional knowledge.",
            "In India, prior publication of traditional knowledge is also a ground for pre-grant opposition and revocation.",
        ],
        "how_you_check": [
            "1. Identify the classical text, chapter and name of your formulation (Sanskrit name and ingredients with proportions).",
            "2. Search the classical texts and the official Ayurvedic Pharmacopoeia / formulary references for the same combination and use.",
            "3. Ask CSIR-TKDL Unit about a prior-art check; the full database is provided to patent offices under agreements and is not openly searchable by the public.",
            "4. Run patent searches (InPASS, WIPO PATENTSCOPE) for the same ingredients and indication.",
            "5. If a documented match exists, avoid claiming the known composition; consider claiming a genuinely new process, standardised extract or unexpected effect with data.",
        ],
        "limits": "A missing TKDL match does not prove novelty. Other published literature also counts as prior art.",
        "cites": cite_objs(["IN-TKDL-PRIA-001", "IN-TKDL-ACC-AGREE", "IN-PAT-SEC-003P", "IN-PAT-SEC-025-OPP", "IN-PAT-SEC-064-REV", "INT-PCT-DIR-001", "IN-CASE-TURMERIC-CSIR"]),
    }


def build_dossier(x: DossierInput) -> Dict[str, Any]:
    cls = FormulationClassifier.classify(FormulationInput(
        intended_use=x.intended_use, is_in_authoritative_texts=x.is_in_authoritative_texts,
        processing_nature=x.processing_nature, has_synthetic_additives=x.has_synthetic_additives, product_name=x.product_name))
    ip = IPPathRouter.evaluate(IPPathRouterInput(
        category=cls.category, product_name=x.product_name, has_novel_technical_feature=x.has_novel_technical_feature,
        has_brand_identity=x.has_brand_identity, has_novel_packaging=x.has_novel_packaging,
        is_geography_specific=x.is_geography_specific, involves_plant_cultivar=x.involves_plant_cultivar))
    abs_r = run_abs_wizard(ABSInput(applicant_type=x.applicant_type, resource_indian=x.resource_indian,
        resource_source=x.resource_source, purpose=x.purpose, ipr_filing=x.ipr_filing, product_name=x.product_name))

    code = cls.category_code
    pat_ids = ["IN-PAT-SEC-003P", "IN-PAT-SEC-003E", "IN-PAT-SEC-003D", "IN-PAT-SEC-002-1J"]
    ip_ids = {"Patents": pat_ids, "Trade Marks": ["IN-TM-ACT-SEC-009", "IN-TM-ACT-SEC-011", "IN-TM-ACT-SEC-029"],
              "Geographical Indications": ["IN-GI-ACT-1999", "IN-GI-ACT-SEC-020"], "Designs": ["IN-DES-ACT-SEC-002D", "IN-DES-ACT-SEC-004"],
              "Plant Varieties": ["IN-PPVFR-ACT-SEC-015", "IN-PPVFR-ACT-2001"], "Copyright": ["IN-COP-ACT-SEC-013"]}
    ip_cites: List[str] = []
    for p in ip.paths:
        for k, v in ip_ids.items():
            if k.lower().split()[0] in p.ip_regime.lower():
                ip_cites += v

    adv_ids = ADV_BY_CODE.get(code, ["IN-DCA-RUL-170-ADV"])
    adv_items = [{"text": ADV_LABEL.get(i, i), "cite": i} for i in adv_ids if corpus_store.get_by_id(i)]
    adv_warn = []
    if x.makes_health_claims:
        adv_warn.append("You indicated health claims: avoid claiming diagnosis, cure or prevention of scheduled diseases; substantiate other claims.")

    intl_ids = ["INT-TRIPS-ART-027", "INT-PCT-DIR-001", "INT-WIPO-GRATK-2024", "INT-CBD-NAGOYA-2010"]
    notes = ["Patent protection is territorial: file nationally or via PCT in each market where you want it.",
             "Under the WIPO GRATK treaty, disclosure of origin of genetic resources will be required in patent filings of contracting parties once it is in force for them."]
    if x.has_brand_identity:
        intl_ids.append("INT-MADRID-PROTOCOL"); notes.append("Brand: secure the Indian trade mark first, then consider the Madrid System for export markets.")
    if x.has_novel_packaging:
        intl_ids.append("INT-HAGUE-GENEVA-ACT"); notes.append("Packaging design: consider the Hague System after an Indian design filing.")
    if x.uses_microorganism:
        intl_ids.append("INT-BUDAPEST-TREATY"); notes.append("Microorganism strain: a Budapest-recognised deposit may be needed for patent filings.")
    mk = {m.upper() for m in x.export_markets}
    if "EU" in mk:
        intl_ids.append("INT-EXPORT-EU-THMPD"); notes.append("EU: choose between traditional herbal medicinal product registration and the food-supplement route before finalising claims.")
    if "US" in mk:
        intl_ids.append("INT-EXPORT-US-DSHEA"); notes.append("US: supplement route restricts disease claims; drug claims need drug approval.")

    sections = [
        {"key": "classification", "title": "1. Regulatory classification", "summary": f"{cls.category} — governed by {cls.governing_law}. Licensing authority: {cls.licensing_authority}.",
         "details": {"patentability": cls.patentability, "regulatory_requirements": cls.regulatory_requirements, "warnings": cls.warnings},
         "cites": cite_objs([CLS_CITE.get(code, "IN-DCA-SEC-003A"), "IN-PAT-SEC-003P"])},
        {"key": "ip_router", "title": "2. IP routing", "summary": ip.strategic_summary,
         "details": {"recommended_regimes": ip.recommended_regimes,
                     "paths": [{"regime": p.ip_regime, "status": p.status_label, "reason": p.relevance_reason, "conditions": p.eligibility_conditions, "law": p.governing_law, "portal": p.official_portal_url} for p in ip.paths]},
         "cites": cite_objs(ip_cites)},
        {"key": "abs", "title": "3. Access and Benefit Sharing (ABS)", "summary": abs_r.outcome,
         "details": {"level": abs_r.outcome_level, "steps": [s.model_dump() for s in abs_r.steps], "exemptions": abs_r.exemptions_considered, "caveats": abs_r.caveats},
         "cites": cite_objs([c for s in abs_r.steps for c in s.cites])},
        {"key": "tkdl", "title": "4. TKDL and traditional-knowledge prior art", "summary": "Check classical-text prior art before claiming any composition; Section 3(p) can bar aggregations of known properties.",
         "details": tkdl_card(), "cites": tkdl_card()["cites"]},
        {"key": "advertising", "title": "5. Advertising and labelling", "summary": "Claims and label particulars must match the regulatory category.",
         "details": {"items": adv_items, "warnings": adv_warn}, "cites": cite_objs(adv_ids)},
        {"key": "international", "title": "6. International notes", "summary": "Keep international guidance separate from Indian law; verify each target market.",
         "details": {"notes": notes, "export_markets": sorted(mk)}, "cites": cite_objs(intl_ids)},
    ]
    all_c = {c["id"]: c for s in sections for c in s["cites"]}
    return {
        "product_name": x.product_name, "category": cls.category, "category_code": code,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sections": sections,
        "trust": {"sources_cited": len(all_c), "verified_sources": sum(1 for c in all_c.values() if c["verified"]),
                  "note": "Verified = a reviewer set last_verified against the official text. Others are curated summaries pending verification."},
        "next_steps": [
            "Confirm the classification with the State Licensing Authority (or FSSAI / cosmetics authority) before filing.",
            "Complete the ABS steps and keep exemption proof.",
            "Run a TKDL / prior-art check before any patent filing.",
            "Escalate to a registered patent agent or IP facilitator for filings and disputes.",
        ],
        "disclaimer": MANDATORY_LEGAL_DISCLAIMER,
    }


def dossier_pdf(d: Dict[str, Any]) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

    ss = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=ss["Title"], fontSize=18, textColor=colors.HexColor("#065f46"))
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], fontSize=12, textColor=colors.HexColor("#0f172a"), spaceBefore=10)
    body = ParagraphStyle("b", parent=ss["BodyText"], fontSize=9, leading=12)
    small = ParagraphStyle("s", parent=body, fontSize=7.5, textColor=colors.HexColor("#475569"))
    P = lambda t, st=body: Paragraph(escape(str(t)), st)
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=14 * mm, bottomMargin=14 * mm, title=f"SAKTI Product Dossier - {d['product_name']}")
    f = [P("SAKTI Product Dossier", h1), P(f"Product: {d['product_name']}  |  Category: {d['category']}"),
         P(f"Generated {d['generated_at']} UTC  |  Sources cited: {d['trust']['sources_cited']} (manually verified: {d['trust']['verified_sources']})", small), Spacer(1, 4)]
    for s in d["sections"]:
        f += [P(s["title"], h2), P(s["summary"])]
        det = s["details"]
        if s["key"] == "ip_router":
            for p in det["paths"]:
                f.append(P(f"- {p['regime']} [{p['status']}]: {p['reason']}"))
        elif s["key"] == "abs":
            for st in det["steps"]:
                f.append(P(f"- {st['step']}: {st['detail']} ({st['authority']}) [{', '.join(st['cites'])}]"))
            for e in det["exemptions"]:
                f.append(P(f"Exemption considered: {e}"))
        elif s["key"] == "tkdl":
            f.append(P(det["what_it_is"]))
            for t in det["how_examiners_use_it"] + det["how_you_check"]:
                f.append(P(f"- {t}"))
            f.append(P(det["limits"], small))
        elif s["key"] == "advertising":
            for it in det["items"]:
                f.append(P(f"- {it['text']} [{it['cite']}]"))
            for w in det["warnings"]:
                f.append(P(f"Note: {w}"))
        elif s["key"] == "international":
            for n in det["notes"]:
                f.append(P(f"- {n}"))
        elif s["key"] == "classification":
            for w in det.get("warnings", []):
                f.append(P(f"Warning: {w}"))
            pt = det.get("patentability", {})
            if pt.get("status"):
                f.append(P(f"Patentability: {pt['status']}. {pt.get('assessment', '')}"))
        if s["cites"]:
            f.append(P("Sources: " + "; ".join(f"[{c['id']}] {c['statute']} - {c['section_rule']} ({'verified ' + c['last_verified'] if c['verified'] else 'unverified summary'}) {c['official_url']}" for c in s["cites"]), small))
    f += [P("Next steps", h2)] + [P(f"- {n}") for n in d["next_steps"]] + [Spacer(1, 6), P(d["disclaimer"], small)]
    doc.build(f)
    return buf.getvalue()
