/* Improvement 02: Trust panel on every answer. Frontend-only (works with or without backend confidence_reason / last_verified). */
(function () {
  const { esc, $ } = SK;
  const LBL = { en: { High: "High", Medium: "Medium", Low: "Low", c: "Confidence" }, hi: { High: "उच्च", Medium: "मध्यम", Low: "निम्न", c: "विश्वसनीयता" } };
  const ID_RE = /^\[((?:IN|INT)-[A-Z0-9-]+)\]$/;

  function reason(data, cites) {
    if (data.confidence_reason) return data.confidence_reason;
    if (data.is_abstained) return "The retrieved provisions were insufficient, so SAKTI abstained instead of guessing.";
    const top = cites.length ? Math.max(...cites.map(c => c.relevance_score || 0)) : 0;
    let r = `Top retrieval score ${top.toFixed(2)} (${data.retrieval_mode} retrieval); ${cites.length} citation(s) checked against the corpus (${String(data.citation_check).replace(/_/g, " ")}).`;
    if (data.retrieval_mode !== "dense") r += " Keyword fallback was used, so confidence is capped.";
    return r;
  }

  SK.decorate = function (data, bodyEl, panelId) {
    const cites = data.citations || [], byId = Object.fromEntries(cites.map(c => [c.id, c]));
    // 1. Replace the base UI's static [ID] spans with clickable chips; flag IDs that are NOT among the retrieved sources.
    bodyEl.querySelectorAll("span").forEach(sp => {
      const m = ID_RE.exec((sp.textContent || "").trim()); if (!m) return;
      const id = m[1], c = byId[id], holder = document.createElement("span");
      holder.innerHTML = c ? SK.chip({ id, last_verified: c.last_verified, statute: c.statute, section_rule: c.section_rule })
        : `<span class="sk-chip bad plain" title="This ID was not among the retrieved sources for this answer">${esc(id)} ✕</span>`;
      sp.replaceWith(holder.firstChild);
    });
    // 2. Panel
    let p = document.getElementById(panelId);
    if (!p) { p = document.createElement("div"); p.id = panelId; bodyEl.after(p); }
    const L = LBL[SK.lang()] || LBL.en, unv = cites.filter(c => !c.last_verified).length;
    const dates = cites.map(c => c.last_verified).filter(Boolean).sort();
    const vbadge = data.is_abstained ? `<span class="sk-chip unv plain">No source relied on</span>`
      : !cites.length ? `<span class="sk-chip bad plain">Unverified: no citations</span>`
      : data.citation_check === "all_verified" ? `<span class="sk-chip plain">Citations verified against corpus</span>`
      : `<span class="sk-chip unv plain">Citation check: ${esc(String(data.citation_check).replace(/_/g, " "))}</span>`;
    p.className = "sk-card mt-3";
    p.innerHTML = `<div class="flex flex-wrap gap-2 items-center"><b class="sk-h" style="font-size:12px">Trust panel</b> ${vbadge}
      <span class="sk-chip plain ${data.confidence === "High" ? "" : data.confidence === "Low" ? "bad" : "unv"}">${L.c}: ${esc(L[data.confidence] || data.confidence)}</span>
      <span class="sk-chip plain">${esc(data.retrieval_mode)} retrieval</span><span class="sk-chip plain">${esc(data.generation_mode)}</span></div>
      <p class="sk-muted mt-2">${esc(reason(data, cites))}</p>
      ${cites.length ? `<p class="sk-muted mt-2">Sources (click to read the exact passage): ${cites.map(c => SK.chip(c)).join(" ")}</p>
      <p class="sk-muted">Corpus last verified: ${dates.length ? esc(dates[dates.length - 1]) : "not yet verified"} · ${unv} of ${cites.length} cited sources are curated summaries pending verification against the official text.</p>` : ""}`;
    return p;
  };

  SK.wrap("renderQueryResult", (orig, self, args) => {
    const data = args[0], out = orig.apply(self, args);
    try {
      SK.decorate(data, $("#queryAnswerBody"), "trustPanel");
      // base UI shows "Medium" for Low confidence in Hindi and never shows Low colours: fix the badge
      const L = LBL[SK.lang()] || LBL.en, box = $("#confidenceBadgeContainer");
      if (box && !data.is_abstained) box.innerHTML = `<span class="sk-chip plain" style="font-size:12px;padding:4px 10px">${L.c}: ${esc(L[data.confidence] || data.confidence)}</span>`;
    } catch (e) { console.warn("trust panel", e); }
    return out;
  });
  // do not leave the previous answer's panel on screen while a new query is loading
  SK.wrap("handleQuerySubmit", (orig, self, args) => { const p = document.getElementById("trustPanel"); if (p) p.remove(); return orig.apply(self, args); });
})();
