/* Improvement 03: side-by-side India | International, plus a visible jurisdiction switch on the Ask tab
   (the base UI only exposes the switch inside Settings). */
(function () {
  const { esc, $ } = SK;
  const form = $("#ragQueryForm"); if (!form) return;
  const bar = document.createElement("div");
  bar.className = "flex items-center justify-center gap-1 mb-3 flex-wrap"; bar.id = "skJurBar";
  bar.innerHTML = `<div class="inline-flex rounded-xl border border-slate-800 p-0.5 bg-slate-950" role="group" aria-label="Jurisdiction">
    <button type="button" data-j="India" class="sk-btn alt" style="border:0">India</button>
    <button type="button" data-j="International" class="sk-btn alt" style="border:0">International</button></div>
    <button type="button" id="skCompareBtn" class="sk-btn alt">⇄ Compare both</button>`;
  form.before(bar);
  const paint = () => bar.querySelectorAll("[data-j]").forEach(b => { const on = typeof currentJurisdiction !== "undefined" && b.dataset.j === currentJurisdiction; b.style.background = on ? "#10b981" : "transparent"; b.style.color = on ? "#020617" : "#cbd5e1"; b.setAttribute("aria-pressed", on); });
  bar.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { setJurisdiction(b.dataset.j); hidePanel(); });
  SK.wrap("setJurisdiction", (orig, self, args) => { const r = orig.apply(self, args); paint(); return r; });
  paint();

  const hidePanel = () => { const h = $("#comparePanel"); if (h) h.remove(); const c = $("#queryResultCard"); if (c && c.dataset.skHidden) { c.classList.remove("hidden"); delete c.dataset.skHidden; } };
  SK.wrap("handleQuerySubmit", (orig, self, args) => { hidePanel(); return orig.apply(self, args); });

  const col = (title, r, id) => `<div class="sk-card"><b class="sk-h">${title}</b> <span class="sk-chip plain ${r.is_abstained || r.confidence !== "High" ? "unv" : ""}">${r.is_abstained ? "Safe abstention" : "Confidence: " + esc(r.confidence)}</span>
    <div class="text-xs text-slate-200 leading-relaxed mt-2" id="${id}b">${renderMarkdown(r.answer)}</div><div id="${id}p"></div></div>`;
  $("#skCompareBtn").onclick = async () => {
    const q = $("#ragQueryInput").value.trim(); if (!q) { $("#ragQueryInput").focus(); return; }
    const btn = $("#skCompareBtn"); btn.disabled = true; btn.textContent = "Comparing…";
    hidePanel(); const card = $("#queryResultCard"); if (card && !card.classList.contains("hidden")) { card.classList.add("hidden"); card.dataset.skHidden = "1"; }
    const host = document.createElement("div"); host.id = "comparePanel"; host.className = "mt-4"; host.innerHTML = `<div class="sk-card"><p class="sk-muted">Running both jurisdictions separately… (two model calls)</p></div>`;
    $("#sectionQuery").appendChild(host);
    try {
      const d = await SK.j("/api/compare", { query: q, language: SK.lang() });
      host.innerHTML = `<div class="sk-grid2" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))">${col("India", d.india, "cmpI")}${col("International", d.international, "cmpN")}</div>
        <p class="sk-muted mt-2">Each column retrieves only from its own jurisdiction, so Indian and international rules are never mixed. Disclaimer: ${esc(d.india.disclaimer)}</p>`;
      if (SK.decorate) { SK.decorate(d.india, $("#cmpIb"), "cmpIp"); SK.decorate(d.international, $("#cmpNb"), "cmpNp"); }
      host.scrollIntoView({ behavior: "smooth" });
    } catch (e) { host.innerHTML = `<div class="sk-card text-rose-300 text-xs">Compare failed: ${esc(e.message)}</div>`; }
    btn.disabled = false; btn.textContent = "⇄ Compare both";
  };
})();
