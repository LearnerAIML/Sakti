/* SAKTI extensions: shared core + module loader (identical in every Improvement zip).
   Each improvement ships its own file in static/ext/. Missing modules are skipped silently. */
(function () {
  if (window.SK) return;
  const SK = window.SK = {};
  SK.$ = (s, r) => (r || document).querySelector(s);
  SK.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  SK.base = () => (typeof API_BASE !== "undefined" ? API_BASE : "");
  SK.api = async (p, o) => { const r = await fetch(SK.base() + p, o); if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(typeof e.detail === "string" ? e.detail : ("HTTP " + r.status)); } return r; };
  SK.j = (p, body, headers) => SK.api(p, body === undefined ? {} : { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, headers || {}), body: JSON.stringify(body) }).then(r => r.json());
  SK.opt = arr => arr.map(([v, l]) => `<option value="${v}">${SK.esc(l)}</option>`).join("");
  SK.chk = (id, label, on) => `<label class="flex items-center gap-2 text-xs text-slate-300 py-0.5"><input type="checkbox" id="${id}" ${on ? "checked" : ""}> ${SK.esc(label)}</label>`;
  SK.lang = () => (typeof currentLanguage !== "undefined" ? currentLanguage : "en");
  SK.style = css => { const s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); };
  SK.wrap = (name, fn) => { const orig = window[name]; if (typeof orig !== "function") return false; window[name] = function () { return fn(orig, this, arguments); }; return true; };

  // verification state cache (last_verified comes from the corpus record)
  const vcache = {};
  SK.verified = id => vcache[id];
  SK.loadDoc = async id => { if (!vcache[id] || !vcache[id].doc) { const d = await SK.j("/api/sources/" + encodeURIComponent(id)); vcache[id] = { doc: d, last_verified: d.last_verified || null }; } return vcache[id].doc; };
  SK.chip = c => { const lv = c.last_verified !== undefined ? c.last_verified : (vcache[c.id] ? vcache[c.id].last_verified : undefined); const unv = !c.neutral && (c.verified === false || (c.verified === undefined && !lv));
    return `<button type="button" class="sk-chip ${unv ? "unv" : ""}" data-sk-id="${SK.esc(c.id)}" onclick="SK.openPassage('${SK.esc(c.id)}')" title="${SK.esc(((c.statute || "") + " " + (c.section_rule || "")).trim() || "Open source passage")}">${SK.esc(c.id)}</button>`; };
  SK.openPassage = async id => {
    const m = document.createElement("div"); m.className = "sk-modal"; m.onclick = e => { if (e.target === m) m.remove(); };
    m.innerHTML = `<div class="sk-card"><p class="sk-muted">Loading ${SK.esc(id)}…</p></div>`; document.body.appendChild(m);
    try {
      const d = await SK.loadDoc(id);
      const ver = d.last_verified ? `<span class="sk-chip plain">verified ${SK.esc(d.last_verified)}</span>` : `<span class="sk-chip unv plain">unverified summary</span>`;
      m.firstChild.innerHTML = `<div class="flex justify-between gap-3"><div><span class="sk-chip plain">${SK.esc(d.id)}</span> ${ver}<h4 class="sk-h mt-2">${SK.esc(d.title || d.section_rule)}</h4><p class="sk-muted">${SK.esc(d.statute)} — ${SK.esc(d.section_rule)} · ${SK.esc(d.jurisdiction)}</p></div><button class="sk-btn alt" style="height:32px" onclick="this.closest('.sk-modal').remove()">Close</button></div>
        <div class="text-xs text-slate-300 mt-3 whitespace-pre-wrap leading-relaxed">${SK.esc(d.content)}</div>
        <p class="sk-muted mt-3">Authority: ${SK.esc(d.authority)}${d.verification_status ? " · status: " + SK.esc(d.verification_status) : ""}</p>
        <a class="text-xs text-emerald-400 underline" href="${SK.esc(d.official_url)}" target="_blank" rel="noopener noreferrer">Open official source →</a>`;
    } catch (e) { m.firstChild.innerHTML = `<p class="text-rose-300 text-xs">Could not load ${SK.esc(id)}: ${SK.esc(e.message)}</p><button class="sk-btn alt mt-2" onclick="this.closest('.sk-modal').remove()">Close</button>`; }
  };

  // tab registry (index.html's switchTab reads window.SAKTI_TABS)
  window.SAKTI_TABS = ["classifier", "query", "sources"];
  const NAVCLS = "pb-2 text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white -mb-[9px] border-b-2 border-transparent flex items-center gap-1.5";
  SK.addTab = (key, label, onShow) => {
    const K = key[0].toUpperCase() + key.slice(1), row = SK.$("nav > div"), main = SK.$("main");
    if (!row || !main || SK.$("#section" + K)) return SK.$("#section" + K);
    const btn = document.createElement("button"); btn.id = "tabBtn" + K; btn.className = NAVCLS; btn.innerHTML = `<span>${SK.esc(label)}</span>`;
    btn.onclick = () => { switchTab(key); if (onShow) onShow(); }; row.appendChild(btn);
    const sec = document.createElement("section"); sec.id = "section" + K; sec.className = "space-y-6 hidden"; main.appendChild(sec);
    window.SAKTI_TABS.push(key); return sec;
  };

  // module loader: order matters (tabs appear in this order; 02 registers SK.decorate before 03 uses it)
  const MODS = ["01-dossier", "04-abs-tkdl", "07-graph", "05-eval", "02-trust", "03-compare", "06-voice-lang", "09-ux"];
  const load = i => { if (i >= MODS.length) return; const s = document.createElement("script"); s.src = "ext/" + MODS[i] + ".js";
    s.onload = s.onerror = () => load(i + 1); document.body.appendChild(s); };
  load(0);
})();
