"""
Automated Unit Tests for Deterministic Formulation Classifier Engine.
Covers all 5 formulation archetypes:
1. Classical / Generic ASU Medicine
2. Patent or Proprietary (P&P) Ayurvedic Medicine
3. Phytopharmaceutical Drug
4. Ayurveda Aahar (Nutraceutical / Food)
5. Ayurvedic Cosmetic
Plus edge case: synthetic additives violation.
"""

from backend.classifier import (
    FormulationClassifier,
    FormulationInput,
    IntendedUse,
    ProcessingNature
)

def test_classical_asu_medicine():
    """Archetype 1: Classical formulation formulated strictly per First Schedule texts."""
    inp = FormulationInput(
        product_name="Maha Triphala Ghrita",
        intended_use=IntendedUse.THERAPEUTIC,
        is_in_authoritative_texts=True,
        processing_nature=ProcessingNature.CLASSICAL,
        has_synthetic_additives=False
    )
    res = FormulationClassifier.classify(inp)
    assert res.category_code == "CLASSICAL_ASU"
    assert "Section 3(a)" in res.governing_law
    assert "State Licensing Authority" in res.licensing_authority
    assert "Severely Restricted" in res.patentability["status"]
    assert any("Section 3(p)" in s for s in res.patentability["relevant_sections"])
    assert res.abs_compliance["exemption_eligible"] is True
    print("[PASS] Test 1: Classical ASU Medicine")

def test_patent_and_proprietary_medicine():
    """Archetype 2: Polyherbal combination not in classical texts but using classical herbs."""
    inp = FormulationInput(
        product_name="Liv-Herbal Synergistic Syrup",
        intended_use=IntendedUse.THERAPEUTIC,
        is_in_authoritative_texts=False,
        processing_nature=ProcessingNature.EXTRACT_ADMIXTURE,
        has_synthetic_additives=False
    )
    res = FormulationClassifier.classify(inp)
    assert res.category_code == "PATENT_PROPRIETARY"
    assert "Section 3(h)" in res.governing_law
    assert "Rule 158B" in res.governing_law
    assert any("Section 3(e)" in s for s in res.patentability["relevant_sections"])
    assert any("Section 3(p)" in s for s in res.patentability["relevant_sections"])
    assert res.abs_compliance["nba_form_required"] is True
    print("[PASS] Test 2: Patent & Proprietary Medicine")

def test_phytopharmaceutical_drug():
    """Archetype 3: Purified standardized fraction with >= 4 bioactive marker compounds."""
    inp = FormulationInput(
        product_name="Standardized Bacopa Neuro-Fraction (4 Markers)",
        intended_use=IntendedUse.THERAPEUTIC,
        is_in_authoritative_texts=False,
        processing_nature=ProcessingNature.PURIFIED_MARKER_FRACTION,
        has_synthetic_additives=False
    )
    res = FormulationClassifier.classify(inp)
    assert res.category_code == "PHYTOPHARMACEUTICAL"
    assert "Rule 122E" in res.governing_law
    assert "CDSCO" in res.licensing_authority
    assert res.regulatory_requirements["clinical_trials_required"] is True
    assert "High Potential" in res.patentability["status"]
    assert res.abs_compliance["nba_form_required"] is True
    assert "NBA Form I" in res.abs_compliance["form_type"]
    print("[PASS] Test 3: Phytopharmaceutical Drug")

def test_ayurveda_aahar():
    """Archetype 4: Dietary food/supplement prepared per traditional recipes."""
    inp = FormulationInput(
        product_name="Ayur-Digestive Herbal Infusion",
        intended_use=IntendedUse.DIETARY,
        is_in_authoritative_texts=True,
        processing_nature=ProcessingNature.CLASSICAL,
        has_synthetic_additives=False
    )
    res = FormulationClassifier.classify(inp)
    assert res.category_code == "AYURVEDA_AAHAR"
    assert "FSSAI" in res.governing_law
    assert "Barred for Health/Dietary Claims" in res.patentability["status"]
    assert res.regulatory_requirements["clinical_trials_required"] is False
    assert len(res.warnings) == 0
    print("[PASS] Test 4: Ayurveda Aahar (Dietary)")

def test_ayurvedic_cosmetic():
    """Archetype 5: Skin brightening serum for external beautifying."""
    inp = FormulationInput(
        product_name="Kumkumadi Radiant Glow Serum",
        intended_use=IntendedUse.COSMETIC,
        is_in_authoritative_texts=False,
        processing_nature=ProcessingNature.EXTRACT_ADMIXTURE,
        has_synthetic_additives=False
    )
    res = FormulationClassifier.classify(inp)
    assert res.category_code == "COSMETIC"
    assert "Cosmetics Rules, 2020" in res.governing_law
    assert "Cleansing, beautifying" in res.patentability["recommended_ip_strategy"] or "Trade Marks" in res.patentability["recommended_ip_strategy"]
    assert res.regulatory_requirements["clinical_trials_required"] is False
    print("[PASS] Test 5: Ayurvedic Cosmetic")

def test_synthetic_additive_violation_in_aahar():
    """Edge Case: Adding synthetic vitamins to an Ayurveda Aahar triggers statutory warning."""
    inp = FormulationInput(
        product_name="Herbal Drink with Synthetic Vit C",
        intended_use=IntendedUse.DIETARY,
        is_in_authoritative_texts=True,
        processing_nature=ProcessingNature.CLASSICAL,
        has_synthetic_additives=True
    )
    res = FormulationClassifier.classify(inp)
    assert len(res.warnings) > 0
    assert any("synthetic" in w.lower() for w in res.warnings)
    print("[PASS] Test 6: Synthetic Additives Regulatory Warning")

if __name__ == "__main__":
    test_classical_asu_medicine()
    test_patent_and_proprietary_medicine()
    test_phytopharmaceutical_drug()
    test_ayurveda_aahar()
    test_ayurvedic_cosmetic()
    test_synthetic_additive_violation_in_aahar()
    print("\n[ALL 6 CLASSIFIER TESTS PASSED SUCCESSFULLY!]")
