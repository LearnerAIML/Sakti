/* Improvement 01: One-click Product Dossier (tab + PDF). */
(function () {
const { esc, $, j, opt, chk } = SK;
const api = SK.api;
const chip = c => SK.chip(c);
  // ---------- plain-language helper ----------
  const PLAIN = {
    CLASSICAL_ASU: "Your product looks like a classical formulation. It is usually sold under an ASU licence, but the formula itself is hard to patent because it is traditional knowledge. Build value through your brand, packaging and process, and avoid disease-cure claims.",
    PATENT_PROPRIETARY: "Your product looks like a proprietary Ayurvedic medicine. You can protect the brand and design; a patent is realistic only for a genuinely new technical feature, backed by data.",
    NEW_DRUG: "Your product looks like a non-classical drug. Expect to show evidence of safety and effectiveness. Patent potential is higher, but you must show novelty and inventive step.",
    PHYTOPHARMACEUTICAL: "Your product looks like a phytopharmaceutical. This is a stricter, evidence-heavy route; plan for a full dossier and trials, and protect your standardised extract and process.",
    AYURVEDA_AAHAR: "Your product looks like Ayurveda Aahar (food). FSSAI rules apply, health claims are tightly limited, and brand and packaging are your main IP tools.",
    COSMETIC: "Your product looks like an Ayurvedic cosmetic. Cosmetics rules apply, and drug-like claims will push it into the drug category.",
  };


  const PRESETS = {
    classical: ["Ashwagandha Rasayana Churna", "therapeutic", "true", "classical", false, false],
    syrup: ["Ginger-Honey Cough Syrup", "therapeutic", "false", "aqueous_alcoholic_extract", false, true],
    cosmetic: ["Kumkumadi Face Oil", "cosmetic", "true", "classical", false, false],
  };
  window.skDossierPreset = k => { const p = PRESETS[k]; $("#dsName").value = p[0]; $("#dsUse").value = p[1]; $("#dsAuth").value = p[2]; $("#dsProc").value = p[3]; $("#dsSyn").checked = p[4]; $("#dsNovel").checked = p[5]; };
  // ---------- DOSSIER ----------
  const D = SK.addTab("dossier", "Product Dossier");
  D.innerHTML = `<div class="sk-card"><h2 class="sk-h text-lg">One-click Product Dossier</h2><p class="sk-muted">Answer a few questions once. SAKTI classifies your product, then runs IP routing, the ABS check, the TKDL pointer, advertising/labelling rules and international notes together, with citations.</p>
  <div class="sk-grid2 mt-3">
   <div><label class="sk-lbl">Product name</label><input id="dsName" class="sk-in" value="Ashwagandha Rasayana Churna">
    <label class="sk-lbl">Intended use</label><select id="dsUse" class="sk-in">${opt([["therapeutic", "Therapeutic / medicine"], ["dietary", "Dietary / food"], ["cosmetic", "Cosmetic"]])}</select>
    <label class="sk-lbl">Formula appears in the authoritative classical texts?</label><select id="dsAuth" class="sk-in">${opt([["true", "Yes"], ["false", "No"]])}</select>
    <label class="sk-lbl">Processing</label><select id="dsProc" class="sk-in">${opt([["classical", "Classical method"], ["aqueous_alcoholic_extract", "Aqueous/alcoholic extract"], ["purified_fraction_with_markers", "Purified fraction with markers"], ["synthetic_derivative", "Synthetic derivative"]])}</select>
    ${chk("dsSyn", "Contains synthetic additives / isolated APIs")}${chk("dsClaims", "Makes health claims", true)}</div>
   <div><label class="sk-lbl">IP features</label>${chk("dsNovel", "Novel extraction / unexpected synergy")}${chk("dsBrand", "Has a brand name / logo", true)}${chk("dsPack", "Novel packaging / container")}${chk("dsGeo", "Qualities tied to a geography")}${chk("dsCult", "New plant cultivar")}${chk("dsMicro", "Uses a defined microorganism strain")}
    <label class="sk-lbl">Export markets</label>${chk("dsEU", "European Union")}${chk("dsUS", "United States")}</div>
   <div><label class="sk-lbl">ABS: who are you?</label><select id="dsApp" class="sk-in">${opt([["indian_company", "Indian company"], ["indian_individual", "Indian individual"], ["ayush_practitioner", "Registered AYUSH practitioner / vaidya"], ["foreign_participation_company", "Company with foreign participation"], ["foreign_or_nri", "Foreign national / NRI"]])}</select>
    ${chk("dsInd", "Resource or knowledge is from India", true)}
    <label class="sk-lbl">Resource source</label><select id="dsSrc" class="sk-in">${opt([["wild", "Wild-collected"], ["cultivated", "Cultivated"], ["codified_formulation", "Classical codified formulation"], ["traded_commodity", "Normally traded commodity"]])}</select>
    <label class="sk-lbl">Purpose</label><select id="dsPur" class="sk-in">${opt([["commercial_product", "Commercial product"], ["research", "Research"], ["patent_filing", "Patent filing"]])}</select>
    <label class="sk-lbl">IPR filing</label><select id="dsIpr" class="sk-in">${opt([["none", "None"], ["india", "India"], ["abroad", "Abroad"], ["both", "India + abroad"]])}</select></div></div>
  <p class="sk-muted mt-3">Try an example: <button class="sk-btn alt" onclick="skDossierPreset('classical')">Classical churna</button> <button class="sk-btn alt" onclick="skDossierPreset('syrup')">New herbal syrup</button> <button class="sk-btn alt" onclick="skDossierPreset('cosmetic')">Cosmetic oil</button></p><div class="flex gap-2 mt-4 flex-wrap"><button class="sk-btn" id="dsGo">Generate dossier ➔</button><button class="sk-btn alt" id="dsPdf" disabled>Download PDF</button></div></div><div id="dsOut"></div>`;
  function dsPayload() {
    const v = id => $("#" + id).value, c = id => $("#" + id).checked;
    return { product_name: v("dsName") || "Ayurvedic Formulation", intended_use: v("dsUse"), is_in_authoritative_texts: v("dsAuth") === "true", processing_nature: v("dsProc"), has_synthetic_additives: c("dsSyn"), makes_health_claims: c("dsClaims"),
      has_novel_technical_feature: c("dsNovel"), has_brand_identity: c("dsBrand"), has_novel_packaging: c("dsPack"), is_geography_specific: c("dsGeo"), involves_plant_cultivar: c("dsCult"), uses_microorganism: c("dsMicro"),
      export_markets: [c("dsEU") ? "EU" : null, c("dsUS") ? "US" : null].filter(Boolean), applicant_type: v("dsApp"), resource_indian: c("dsInd"), resource_source: v("dsSrc"), purpose: v("dsPur"), ipr_filing: v("dsIpr") };
  }
  const citeRow = cs => cs && cs.length ? `<p class="sk-muted mt-2">Sources: ${cs.map(chip).join(" ")}</p>` : "";
  function secBody(s) {
    const d = s.details;
    if (s.key === "classification") return `<p class="text-xs text-slate-300">${esc((d.patentability || {}).assessment || "")}</p>${(d.warnings || []).map(w => `<p class="text-xs text-rose-300 mt-1">⚠ ${esc(w)}</p>`).join("")}`;
    if (s.key === "ip_router") return d.paths.map(p => `<div class="mt-2"><b class="text-xs text-white">${esc(p.regime)}</b> <span class="sk-chip ${/not/i.test(p.status) ? "unv" : ""}">${esc(p.status)}</span><p class="text-xs text-slate-400">${esc(p.reason)}</p></div>`).join("");
    if (s.key === "abs") return d.steps.map(t => `<div class="mt-2"><b class="text-xs text-white">${esc(t.step)}</b><p class="text-xs text-slate-400">${esc(t.detail)} <i>(${esc(t.authority)})</i></p></div>`).join("") + d.exemptions.map(e => `<p class="text-xs text-emerald-300 mt-1">Exemption considered: ${esc(e)}</p>`).join("");
    if (s.key === "tkdl") return `<p class="text-xs text-slate-300">${esc(d.what_it_is)}</p><ul class="text-xs text-slate-400 list-disc pl-5 mt-1">${d.how_examiners_use_it.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    if (s.key === "advertising") return `<ul class="text-xs text-slate-300 list-disc pl-5">${d.items.map(i => `<li>${esc(i.text)}</li>`).join("")}</ul>${d.warnings.map(w => `<p class="text-xs text-amber-300 mt-1">${esc(w)}</p>`).join("")}`;
    if (s.key === "international") return `<ul class="text-xs text-slate-300 list-disc pl-5">${d.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>`;
    return "";
  }
  $("#dsGo").onclick = async () => {
    const out = $("#dsOut"); out.innerHTML = `<div class="sk-card"><p class="sk-muted">Building dossier…</p></div>`;
    try {
      const d = await j("/api/dossier", dsPayload()); $("#dsPdf").disabled = false;
      out.innerHTML = `<div class="sk-card"><div class="flex justify-between flex-wrap gap-2"><div><b class="sk-h">${esc(d.product_name)}</b> <span class="sk-chip">${esc(d.category)}</span></div><span class="sk-muted">${d.trust.sources_cited} sources · ${d.trust.verified_sources} manually verified</span></div>
        <div class="sk-plain mt-3"><b>What this means for you:</b> ${esc(PLAIN[d.category_code] || "")}</div></div>` +
        d.sections.map(s => `<div class="sk-card mt-3"><b class="sk-h">${esc(s.title)}</b><p class="text-xs text-slate-300 mt-1">${esc(s.summary)}</p>${secBody(s)}${citeRow(s.cites)}</div>`).join("") +
        `<div class="sk-card mt-3"><b class="sk-h">Next steps</b><ol class="text-xs text-slate-300 list-decimal pl-5 mt-1">${d.next_steps.map(n => `<li>${esc(n)}</li>`).join("")}</ol><p class="sk-muted mt-2">${esc(d.disclaimer)}</p><button class="sk-btn alt mt-2" onclick="openEscalationModal()">Escalate to a human IP facilitator</button></div>`;
    } catch (e) { out.innerHTML = `<div class="sk-card text-rose-300 text-xs">Dossier failed: ${esc(e.message)}</div>`; }
  };
  $("#dsPdf").onclick = async () => {
    const r = await api("/api/dossier/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dsPayload()) });
    const u = URL.createObjectURL(await r.blob()), a = document.createElement("a"); a.href = u; a.download = "SAKTI_dossier.pdf"; a.click(); setTimeout(() => URL.revokeObjectURL(u), 3000);
  };

})();
