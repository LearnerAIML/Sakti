"""Traditional Knowledge Digital Library (TKDL) and prior-art search guidance.
Information only, not legal advice."""
from typing import Any, Dict, List
from backend.corpus_loader import corpus_store


def tkdl_card() -> Dict[str, Any]:
    """Generates a structured TKDL prior-art card with citations grounded in the official corpus."""
    cites: List[Dict[str, Any]] = []
    seen = set()
    for cid in ["IN-TKDL-PRIA-001", "IN-TKDL-ACC-AGREE", "IN-PAT-SEC-003P"]:
        d = corpus_store.get_by_id(cid)
        if d and cid not in seen:
            seen.add(cid)
            cites.append({
                "id": d.id,
                "statute": d.statute,
                "section_rule": d.section_rule,
                "title": d.title,
                "authority": d.authority,
                "official_url": d.official_url,
                "jurisdiction": d.jurisdiction,
                "verified": bool(d.last_verified),
                "last_verified": d.last_verified,
                "verification_status": d.verification_status,
            })

    return {
        "title": "TKDL prior-art pointer",
        "what_it_is": (
            "The Traditional Knowledge Digital Library (CSIR) documents formulations "
            "from classical texts so patent examiners can use them as prior art."
        ),
        "how_examiners_use_it": [
            "Examiners at offices with access agreements (EPO, USPTO, JPO, etc.) can cite matching TKDL entries against claims.",
            "Under Indian Patents Act Section 3(p), an invention which in effect is traditional knowledge or an aggregation/duplication of known properties of traditionally known components is not patentable.",
        ],
        "how_you_check": [
            "Identify the classical text and formulation name from the First Schedule of DCA 1940.",
            "Ask CSIR-TKDL or perform a prior-art search across Indian and international databases before filing.",
        ],
        "limits": "A missing TKDL match does not prove novelty under Section 2(1)(j) or 3(d).",
        "cites": cites,
    }
