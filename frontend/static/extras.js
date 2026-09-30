/* SAKTI extras: dossier, ABS+TKDL, graph, evaluation, trust panel, compare, voice, languages. Vanilla JS; uses globals from index.html. */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const api = (p, o) => fetch((typeof API_BASE !== "undefined" ? API_BASE : "") + p, o).then(async r => { if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || ("HTTP " + r.status)); } return r; });
  const j = (p, body) => api(p, body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
  const opt = (arr) => arr.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("");
  const chk = (id, label, on) => `<label class="flex items-center gap-2 text-xs text-slate-300 py-0.5"><input type="checkbox" id="${id}" ${on ? "checked" : ""}> ${esc(label)}</label>`;

  window.SAKTI_TABS = ["classifier", "query", "sources", "dossier", "abs", "graph", "eval"];
  const TABS = [["dossier", "Product Dossier"], ["abs", "ABS & TKDL"], ["graph", "Knowledge Graph"], ["eval", "Evaluation"]];
  const NAVCLS = "pb-2 text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white -mb-[9px] border-b-2 border-transparent flex items-center gap-1.5";

  // ---------- shell: banner, tabs, sections ----------
  const hdr = $("header");
  if (hdr) { const b = document.createElement("div"); b.className = "sk-banner"; b.textContent = "Information, not legal advice. Prototype grounded in a curated corpus: confirm with a registered patent agent or IP facilitator before acting."; hdr.after(b); }
  const navRow = $("nav .flex"), main = $("main");
  TABS.forEach(([k, label]) => {
    const K = k[0].toUpperCase() + k.slice(1);
    const btn = document.createElement("button"); btn.id = "tabBtn" + K; btn.className = NAVCLS; btn.onclick = () => { switchTab(k); if (window["load_" + k]) window["load_" + k](); }; btn.innerHTML = `<span>${label}</span>`; navRow.appendChild(btn);
    const sec = document.createElement("section"); sec.id = "section" + K; sec.className = "space-y-6 hidden"; main.appendChild(sec);
  });

  // ---------- passage modal (trust: chip -> exact source passage) ----------
  window.skOpenPassage = async function (id) {
    const m = document.createElement("div"); m.className = "sk-modal"; m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `<div class="sk-card"><p class="sk-muted">Loading ${esc(id)}…</p></div>`; document.body.appendChild(m);
    try {
      const d = await j("/api/sources/" + encodeURIComponent(id));
      const ver = d.last_verified ? `<span class="sk-chip">verified ${esc(d.last_verified)}</span>` : `<span class="sk-chip unv">unverified summary</span>`;
      m.firstChild.innerHTML = `<div class="flex justify-between gap-3"><div><span class="sk-chip">${esc(d.id)}</span> ${ver}<h4 class="sk-h mt-2">${esc(d.title || d.section_rule)}</h4><p class="sk-muted">${esc(d.statute)} — ${esc(d.section_rule)} · ${esc(d.jurisdiction)}</p></div><button class="sk-btn alt" style="height:32px" onclick="this.closest('.sk-modal').remove()">Close</button></div>
        <div class="text-xs text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">${esc(d.content)}</div>
        <p class="sk-muted mt-3">Authority: ${esc(d.authority)}${d.verification_status ? " · status: " + esc(d.verification_status) : ""}</p>
        <a class="text-xs text-emerald-400 underline" href="${esc(d.official_url)}" target="_blank" rel="noopener noreferrer">Open official source →</a>`;
    } catch (e) { m.firstChild.innerHTML = `<p class="text-rose-300 text-xs">Could not load ${esc(id)}: ${esc(e.message)}</p>`; }
  };
  const chip = (c) => `<button type="button" class="sk-chip ${c.verified === false || (c.verified === undefined && !c.last_verified) ? "unv" : ""}" onclick="skOpenPassage('${esc(c.id)}')" title="${esc((c.statute || "") + " " + (c.section_rule || ""))}">${esc(c.id)}</button>`;

  // ---------- trust panel on every answer ----------
  const origRender = window.renderQueryResult;
  window.renderQueryResult = function (data) {
    origRender(data);
    try { decorate(data, $("#queryAnswerBody"), $("#queryResultCard"), "trustPanel"); } catch (e) { console.warn(e); }
  };
  function decorate(data, bodyEl, cardEl, panelId) {
    const cites = data.citations || [], ids = new Set(cites.map(c => c.id));
    const byId = Object.fromEntries(cites.map(c => [c.id, c]));
    bodyEl.innerHTML = bodyEl.innerHTML.replace(/\[([A-Z0-9][A-Z0-9-]{5,})\]/g, (m, id) => ids.has(id) ? chip({ id, last_verified: byId[id].last_verified, statute: byId[id].statute, section_rule: byId[id].section_rule }) : m);
    let p = document.getElementById(panelId);
    if (!p) { p = document.createElement("div"); p.id = panelId; bodyEl.after(p); }
    const unv = cites.filter(c => !c.last_verified).length;
    const dates = cites.map(c => c.last_verified).filter(Boolean).sort();
    const vbadge = data.is_abstained ? `<span class="sk-chip unv">No source relied on</span>` : !cites.length ? `<span class="sk-chip unv">Unverified: no citations</span>`
      : (data.citation_check === "all_verified" ? `<span class="sk-chip">Citations verified against corpus</span>` : `<span class="sk-chip unv">Citation check: ${esc(String(data.citation_check).replace(/_/g, " "))}</span>`);
    p.className = "sk-card mt-3";
    p.innerHTML = `<div class="flex flex-wrap gap-2 items-center"><b class="sk-h" style="font-size:12px">Trust panel</b> ${vbadge}
      <span class="sk-chip ${data.confidence === "High" ? "" : "unv"}">Confidence: ${esc(data.confidence)}</span>
      <span class="sk-chip">${esc(data.retrieval_mode)} retrieval</span><span class="sk-chip">${esc(data.generation_mode)}</span></div>
      <p class="sk-muted mt-2">${esc(data.confidence_reason || "Confidence is computed from retrieval score and verified citations, not from the model's self-report.")}</p>
      ${cites.length ? `<p class="sk-muted mt-2">Sources (click to read the exact passage): ${cites.map(c => chip(c)).join(" ")}</p>
      <p class="sk-muted">Corpus last verified: ${dates.length ? esc(dates[dates.length - 1]) : "not yet verified"} · ${unv} of ${cites.length} cited sources are curated summaries pending verification against the official text.</p>` : ""}`;
  }

  // ---------- language override, voice, compare ----------
  let langOverride = "auto";
  const _fetch = window.fetch;
  window.fetch = function (u, o) {
    try { if (o && o.body && /\/api\/(query|compare)$/.test(String(u)) && langOverride !== "auto") { const b = JSON.parse(o.body); b.language = langOverride; o = Object.assign({}, o, { body: JSON.stringify(b) }); } } catch (e) { }
    return _fetch.call(this, u, o);
  };
  const VOICE = { en: "en-IN", hi: "hi-IN", gu: "gu-IN", mr: "mr-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN" };
  const qbar = $("#queryLangBadge") && $("#queryLangBadge").parentElement;
  if (qbar) {
    const sel = document.createElement("select"); sel.id = "extraLang"; sel.className = "sk-in"; sel.style.width = "auto"; sel.title = "Answer language";
    sel.innerHTML = `<option value="auto">Language: follow UI</option>` + opt([["en", "English"], ["hi", "हिन्दी"], ["gu", "ગુજરાતી"], ["mr", "मराठी"], ["ta", "தமிழ்"], ["te", "తెలుగు"], ["bn", "বাংলা"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]]);
    sel.onchange = () => { langOverride = sel.value; }; qbar.appendChild(sel);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const mic = document.createElement("button"); mic.type = "button"; mic.className = "sk-btn alt"; mic.textContent = "🎤 Speak"; mic.title = "Voice input (browser speech recognition)";
      mic.onclick = () => { const r = new SR(); r.lang = VOICE[langOverride === "auto" ? (typeof currentLanguage !== "undefined" ? currentLanguage : "en") : langOverride] || "en-IN"; r.interimResults = false; mic.textContent = "Listening…"; r.onresult = e => { $("#ragQueryInput").value = e.results[0][0].transcript; }; r.onend = () => { mic.textContent = "🎤 Speak"; }; r.onerror = () => { mic.textContent = "🎤 Speak"; }; r.start(); };
      qbar.appendChild(mic);
    }
    const cmp = document.createElement("button"); cmp.type = "button"; cmp.className = "sk-btn alt"; cmp.textContent = "⇄ Compare India vs International";
    cmp.onclick = runCompare; qbar.appendChild(cmp);
  }
  async function runCompare() {
    const q = $("#ragQueryInput").value.trim(); if (!q) return;
    let host = $("#comparePanel"); if (!host) { host = document.createElement("div"); host.id = "comparePanel"; $("#sectionQuery").appendChild(host); }
    host.innerHTML = `<div class="sk-card"><p class="sk-muted">Running both jurisdictions separately…</p></div>`; host.scrollIntoView({ behavior: "smooth" });
    try {
      const d = await j("/api/compare", { query: q, language: typeof currentLanguage !== "undefined" ? currentLanguage : "en" });
      const col = (t, r, id) => `<div class="sk-card"><b class="sk-h">${t}</b> <span class="sk-chip ${r.confidence === "High" ? "" : "unv"}">${r.is_abstained ? "Safe abstention" : "Confidence: " + esc(r.confidence)}</span><div class="text-xs text-slate-200 leading-relaxed mt-2" id="${id}b">${renderMarkdown(r.answer)}</div><div id="${id}p"></div></div>`;
      host.innerHTML = `<div class="sk-grid2" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${col("India", d.india, "cmpI")}${col("International", d.international, "cmpN")}</div><p class="sk-muted mt-2">Each column is retrieved only from its own jurisdiction, so Indian and international rules are never mixed.</p>`;
      decorate(d.india, $("#cmpIb"), null, "cmpIp"); decorate(d.international, $("#cmpNb"), null, "cmpNp");
    } catch (e) { host.innerHTML = `<div class="sk-card text-rose-300 text-xs">Compare failed: ${esc(e.message)}</div>`; }
  }

  // ---------- plain-language helper ----------
  const PLAIN = {
    CLASSICAL_ASU: "Your product looks like a classical formulation. It is usually sold under an ASU licence, but the formula itself is hard to patent because it is traditional knowledge. Build value through your brand, packaging and process, and avoid disease-cure claims.",
    PATENT_PROPRIETARY: "Your product looks like a proprietary Ayurvedic medicine. You can protect the brand and design; a patent is realistic only for a genuinely new technical feature, backed by data.",
    NEW_DRUG: "Your product looks like a non-classical drug. Expect to show evidence of safety and effectiveness. Patent potential is higher, but you must show novelty and inventive step.",
    PHYTOPHARMACEUTICAL: "Your product looks like a phytopharmaceutical. This is a stricter, evidence-heavy route; plan for a full dossier and trials, and protect your standardised extract and process.",
    AYURVEDA_AAHAR: "Your product looks like Ayurveda Aahar (food). FSSAI rules apply, health claims are tightly limited, and brand and packaging are your main IP tools.",
    COSMETIC: "Your product looks like an Ayurvedic cosmetic. Cosmetics rules apply, and drug-like claims will push it into the drug category.",
  };

  // ---------- DOSSIER ----------
  const D = $("#sectionDossier");
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
  <div class="flex gap-2 mt-4 flex-wrap"><button class="sk-btn" id="dsGo">Generate dossier ➔</button><button class="sk-btn alt" id="dsPdf" disabled>Download PDF</button></div></div><div id="dsOut"></div>`;
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

  // ---------- ABS + TKDL ----------
  const A = $("#sectionAbs");
  A.innerHTML = `<div class="sk-grid2" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))"><div class="sk-card"><h2 class="sk-h text-lg">ABS wizard</h2><p class="sk-muted">Four short questions lead to a checklist of authorities, exemptions and next steps.</p>
   <label class="sk-lbl">1. Who are you?</label><select id="abApp" class="sk-in">${opt([["indian_company", "Indian company"], ["indian_individual", "Indian individual"], ["ayush_practitioner", "Registered AYUSH practitioner / vaidya"], ["foreign_participation_company", "Company with foreign participation"], ["foreign_or_nri", "Foreign national / NRI"]])}</select>
   <label class="sk-lbl">2. Is the resource / knowledge Indian?</label><select id="abInd" class="sk-in">${opt([["true", "Yes"], ["false", "No"]])}</select>
   <label class="sk-lbl">Source of the resource</label><select id="abSrc" class="sk-in">${opt([["wild", "Wild-collected"], ["cultivated", "Cultivated"], ["codified_formulation", "Classical codified formulation"], ["traded_commodity", "Normally traded commodity"]])}</select>
   <label class="sk-lbl">3. Is this a patent filing?</label><select id="abPat" class="sk-in">${opt([["none", "No"], ["india", "Yes, in India"], ["abroad", "Yes, abroad"], ["both", "Yes, India + abroad"]])}</select>
   <label class="sk-lbl">4. Is it a commercial product?</label><select id="abCom" class="sk-in">${opt([["commercial_product", "Yes, commercial"], ["research", "No, research only"]])}</select>
   <button class="sk-btn mt-3" id="abGo">Get checklist ➔</button><div id="abOut" class="mt-3"></div></div>
   <div class="sk-card" id="tkdlBox"><p class="sk-muted">Loading TKDL card…</p></div></div>`;
  $("#abGo").onclick = async () => {
    const v = id => $("#" + id).value, pat = v("abPat");
    const body = { applicant_type: v("abApp"), resource_indian: v("abInd") === "true", resource_source: v("abSrc"), purpose: pat !== "none" ? "patent_filing" : v("abCom"), ipr_filing: pat };
    const out = $("#abOut"); out.innerHTML = `<p class="sk-muted">Working…</p>`;
    try {
      const r = await j("/api/abs-wizard", body); const col = { required: "amber", conditional: "sky", exempt: "emerald", not_triggered: "slate" }[r.outcome_level];
      out.innerHTML = `<div class="sk-plain"><b>${esc(r.outcome)}</b></div><ol class="mt-2 space-y-2">${r.steps.map((s, i) => `<li class="text-xs"><b class="text-white">${i + 1}. ${esc(s.step)}</b><p class="text-slate-400">${esc(s.detail)}</p><p class="sk-muted">Authority: ${esc(s.authority)}</p>${citeRow(s.cites.map(id => ({ id })))}</li>`).join("")}</ol>` +
        r.exemptions_considered.map(e => `<p class="text-xs text-emerald-300 mt-1">Exemption: ${esc(e)}</p>`).join("") + r.portals.map(p => `<p class="mt-1"><a class="text-xs text-emerald-400 underline" target="_blank" rel="noopener noreferrer" href="${esc(p.official_url || "#")}">${esc(p.name || p.title || "Official portal")}</a></p>`).join("") + r.caveats.map(c => `<p class="sk-muted mt-1">• ${esc(c)}</p>`).join("");
    } catch (e) { out.innerHTML = `<p class="text-rose-300 text-xs">${esc(e.message)}</p>`; }
  };
  j("/api/tkdl-card").then(t => { $("#tkdlBox").innerHTML = `<h2 class="sk-h text-lg">${esc(t.title)}</h2><p class="text-xs text-slate-300 mt-1">${esc(t.what_it_is)}</p><b class="text-xs text-white block mt-3">How examiners use it</b><ul class="text-xs text-slate-400 list-disc pl-5">${t.how_examiners_use_it.map(x => `<li>${esc(x)}</li>`).join("")}</ul><b class="text-xs text-white block mt-3">How you check prior art</b><ol class="text-xs text-slate-400 pl-1 space-y-1">${t.how_you_check.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p class="sk-muted mt-2">${esc(t.limits)}</p>${citeRow(t.cites)}`; }).catch(e => { $("#tkdlBox").innerHTML = `<p class="text-rose-300 text-xs">${esc(e.message)}</p>`; });

  // ---------- Knowledge graph ----------
  const G = $("#sectionGraph");
  G.innerHTML = `<div class="sk-card"><h2 class="sk-h text-lg">Knowledge graph</h2><p class="sk-muted">Product class → IP / regulatory type → law → jurisdiction. Click any node to trace its connections; click a law to list its provisions.</p><div id="grInfo" class="sk-muted mt-2"></div><div style="overflow:auto;max-height:70vh" class="mt-3"><svg id="grSvg" width="100%"></svg></div></div>`;
  let graphLoaded = false;
  window.load_graph = async function () {
    if (graphLoaded) return; graphLoaded = true;
    const g = await j("/api/graph"), cols = { product: 0, iptype: 1, law: 2, jurisdiction: 3 }, X = [10, 250, 500, 800], W = [200, 210, 260, 130], H = 24, GAP = 6;
    const byKind = k => g.nodes.filter(n => n.kind === k), pos = {};
    ["product", "iptype", "law", "jurisdiction"].forEach(k => byKind(k).forEach((n, i) => { pos[n.id] = { x: X[cols[k]], y: 10 + i * (H + GAP) + (k === "jurisdiction" ? 200 : 0), w: W[cols[k]] }; }));
    const height = Math.max(...Object.values(pos).map(p => p.y)) + 40, svg = $("#grSvg"); svg.setAttribute("viewBox", `0 0 950 ${height}`); svg.style.minWidth = "700px";
    const path = e => { const a = pos[e.from], b = pos[e.to]; if (!a || !b) return ""; const x1 = a.x + a.w, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, mx = (x1 + x2) / 2; return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`; };
    svg.innerHTML = g.edges.map((e, i) => `<path class="sk-edge" data-i="${i}" d="${path(e)}"/>`).join("") + g.nodes.map(n => { const p = pos[n.id]; const lab = n.label.length > 38 ? n.label.slice(0, 36) + "…" : n.label; return `<g class="sk-node" data-id="${esc(n.id)}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${H}" rx="6"/><text x="${p.x + 6}" y="${p.y + 15}">${esc(lab)}</text><title>${esc(n.label)}</title></g>`; }).join("");
    const nodes = Object.fromEntries(g.nodes.map(n => [n.id, n]));
    svg.onclick = ev => {
      const el = ev.target.closest(".sk-node"); const on = new Set(), onE = new Set();
      if (el) { const id = el.dataset.id; on.add(id);
        [["from", "to"], ["to", "from"]].forEach(([a, b]) => { let fr = [id]; while (fr.length) { const nx = []; g.edges.forEach((e, i) => { if (fr.includes(e[a]) && !on.has(e[b])) { on.add(e[b]); nx.push(e[b]); } if (fr.includes(e[a])) onE.add(i); }); fr = nx; } });
        const n = nodes[id]; $("#grInfo").innerHTML = n.docs ? `<b class="text-white">${esc(n.label)}</b>: ${n.docs.map(d => chip({ id: d, last_verified: "x" })).join(" ")}` : `<b class="text-white">${esc(n.label)}</b>`; }
      svg.querySelectorAll(".sk-node").forEach(x => { x.classList.toggle("on", el && x.dataset.id === el.dataset.id); x.classList.toggle("sk-dim", !!el && !on.has(x.dataset.id)); });
      svg.querySelectorAll(".sk-edge").forEach(x => { x.classList.toggle("on", onE.has(+x.dataset.i)); x.classList.toggle("sk-dim", !!el && !onE.has(+x.dataset.i)); });
    };
    $("#grInfo").textContent = g.note + " " + g.docs_total + " provisions indexed.";
  };

  // ---------- Evaluation dashboard ----------
  const E = $("#sectionEval");
  E.innerHTML = `<div class="sk-card"><div class="flex justify-between flex-wrap gap-2"><div><h2 class="sk-h text-lg">Live evaluation</h2><p class="sk-muted">Numbers, not claims: citation validity, safe abstention and jurisdiction leaks on a fixed question set.</p></div><button class="sk-btn" id="evRun">Run evaluation now</button></div><div id="evOut" class="mt-3"></div></div>`;
  function evRender(r) {
    const m = r.metrics, pct = (a) => a[1] ? Math.round(100 * a[0] / a[1]) : 0;
    const card = (t, val, sub, good) => `<div class="sk-card"><p class="sk-muted">${t}</p><p class="text-2xl font-bold ${good ? "text-emerald-400" : "text-amber-400"}">${val}</p><p class="sk-muted">${sub}</p></div>`;
    $("#evOut").innerHTML = `<p class="sk-muted">Run ${esc(r.generated_at)} · ${esc((r.modes || []).join("; ") || "no live mode")}${(r.modes || []).some(x => /keyword|offline/.test(x)) ? ' <span class="sk-chip unv">fallback mode: not representative of the full pipeline</span>' : ""}</p>
     <div class="sk-bar mt-2"><i style="width:${Math.round(100 * r.passed / r.total)}%"></i></div><p class="sk-muted">${r.passed}/${r.total} passed</p>
     <div class="sk-grid2 mt-3">${card("Expected source cited", m.answerable_hit[0] + "/" + m.answerable_hit[1], pct(m.answerable_hit) + "% of answerable questions", pct(m.answerable_hit) >= 80)}${card("Safe abstention", m.abstention[0] + "/" + m.abstention[1], "out-of-scope and fake-authority questions", m.abstention[0] === m.abstention[1])}${card("Jurisdiction leaks", m.jurisdiction_leaks, "cross-jurisdiction citations", m.jurisdiction_leaks === 0)}${card("Invalid citations", m.invalid_citations, "IDs not in the corpus", m.invalid_citations === 0)}</div>
     <div style="overflow:auto;max-height:50vh" class="mt-3"><table class="w-full text-xs"><thead class="text-slate-400"><tr><th align=left>ID</th><th align=left>Question</th><th>J</th><th>Type</th><th>Result</th><th align=left>Cited</th></tr></thead><tbody>${r.rows.map(x => `<tr class="border-t border-slate-800"><td>${esc(x.id)}</td><td class="text-slate-300">${esc(x.q)}</td><td align=center>${esc(x.jurisdiction[0])}</td><td>${esc(x.type)}</td><td align=center class="${x.pass ? "text-emerald-400" : "text-rose-400"}">${x.pass ? "PASS" : "FAIL"}</td><td>${x.cited.map(id => chip({ id, last_verified: "x" })).join(" ")}</td></tr>`).join("")}</tbody></table></div>`;
  }
  window.load_eval = async function () { try { evRender(await j("/api/eval/latest")); } catch (e) { $("#evOut").innerHTML = `<p class="sk-muted">${esc(e.message)} — or press “Run evaluation now” (uses your Gemini key).</p>`; } };
  $("#evRun").onclick = async () => { $("#evOut").innerHTML = `<p class="sk-muted">Running all questions… this can take a minute.</p>`; try { evRender(await j("/api/eval/run", {})); } catch (e) { $("#evOut").innerHTML = `<p class="text-rose-300 text-xs">${esc(e.message)}</p>`; } };
})();
