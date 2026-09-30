"""Knowledge graph: product class -> IP/regulatory type -> law -> jurisdiction (from corpus metadata + editorial mapping)."""
from typing import Any, Dict
from fastapi import APIRouter
from backend.corpus_loader import corpus_store

router = APIRouter()


TYPE_GROUPS = {
    "Patents": ["patents"], "Traditional knowledge": ["traditional_knowledge"], "Trade Marks": ["trademarks", "trademarks_international"],
    "Geographical Indications": ["geographical_indications"], "Designs": ["designs", "designs_international"], "Copyright": ["copyright"],
    "Plant varieties": ["plant_varieties"], "ABS & biodiversity": ["biodiversity", "biodiversity_abs"],
    "Drug regulation": ["drug_regulatory", "drugs_cosmetics", "advertising_compliance", "standards"],
    "Food safety": ["food_safety"], "Cosmetics": ["cosmetics", "food_cosmetics"],
    "International treaties": ["international", "international_treaty", "patents_international"],
    "Export market access": ["export_market_access"], "Case law": ["case_law"],
}
PRODUCT_LINKS = {
    "Classical / generic medicine": ["Traditional knowledge", "Trade Marks", "Geographical Indications", "Copyright", "ABS & biodiversity", "Drug regulation", "Designs", "Case law"],
    "Patent / proprietary medicine": ["Patents", "Traditional knowledge", "Trade Marks", "Designs", "ABS & biodiversity", "Drug regulation", "Copyright"],
    "New / non-classical drug": ["Patents", "Trade Marks", "ABS & biodiversity", "Drug regulation", "Designs"],
    "Phytopharmaceutical": ["Patents", "Trade Marks", "ABS & biodiversity", "Drug regulation", "Plant varieties"],
    "Ayurveda Aahar / nutraceutical": ["Trade Marks", "Designs", "Geographical Indications", "ABS & biodiversity", "Food safety", "Copyright"],
    "Cosmetic": ["Trade Marks", "Designs", "Patents", "ABS & biodiversity", "Cosmetics"],
}
INTL_ALL = ["International treaties", "Export market access"]


@router.get("/api/graph", tags=["Knowledge Graph"])
def graph():
    docs = corpus_store.get_all()
    nodes, edges = [], []
    nodes += [{"id": f"P:{p}", "label": p, "kind": "product"} for p in PRODUCT_LINKS]
    nodes += [{"id": f"T:{t}", "label": t, "kind": "iptype"} for t in TYPE_GROUPS]
    laws: Dict[str, Dict[str, Any]] = {}
    cat_to_type = {c: t for t, cs in TYPE_GROUPS.items() for c in cs}
    for d in docs:
        t = cat_to_type.get(d.category or "")
        if not t:
            continue
        lid = f"L:{d.statute}"
        laws.setdefault(lid, {"id": lid, "label": d.statute, "kind": "law", "docs": [], "types": set(), "jurisdictions": set()})
        laws[lid]["docs"].append(d.id); laws[lid]["types"].add(t); laws[lid]["jurisdictions"].add(d.jurisdiction)
    for l in laws.values():
        nodes.append({"id": l["id"], "label": l["label"], "kind": "law", "docs": sorted(l["docs"])})
        for t in sorted(l["types"]):
            edges.append({"from": f"T:{t}", "to": l["id"]})
        for j in sorted(l["jurisdictions"]):
            edges.append({"from": l["id"], "to": f"J:{j}"})
    nodes += [{"id": "J:India", "label": "India", "kind": "jurisdiction"}, {"id": "J:International", "label": "International", "kind": "jurisdiction"}]
    for p, ts in PRODUCT_LINKS.items():
        for t in ts + INTL_ALL:
            edges.append({"from": f"P:{p}", "to": f"T:{t}"})
    return {"nodes": nodes, "edges": edges, "docs_total": len(docs),
            "note": "Laws and jurisdictions come from corpus metadata; product-to-IP-type links are an editorial mapping of this prototype."}
