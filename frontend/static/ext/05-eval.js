/* Improvement 05: live evaluation dashboard. */
(function () {
const { esc, $, j, opt, chk } = SK;
const api = SK.api;
const chip = c => SK.chip(c);
  // ---------- Evaluation dashboard ----------
  const E = SK.addTab("eval", "Evaluation", () => window.load_eval && window.load_eval());
  E.innerHTML = `<div class="sk-card"><div class="flex justify-between flex-wrap gap-2"><div><h2 class="sk-h text-lg">Live evaluation</h2><p class="sk-muted">Numbers, not claims: citation validity, safe abstention and jurisdiction leaks on a fixed question set.</p></div><div class="flex gap-2 items-center flex-wrap"><input id="evTok" type="password" class="sk-in" style="width:150px" placeholder="Admin token (production only)" autocomplete="off"><button class="sk-btn" id="evRun">Run evaluation now</button></div></div><div id="evOut" class="mt-3"></div></div>`;
  function evRender(r) {
    const m = r.metrics, pct = (a) => a[1] ? Math.round(100 * a[0] / a[1]) : 0;
    const card = (t, val, sub, good) => `<div class="sk-card"><p class="sk-muted">${t}</p><p class="text-2xl font-bold ${good ? "text-emerald-400" : "text-amber-400"}">${val}</p><p class="sk-muted">${sub}</p></div>`;
    $("#evOut").innerHTML = `<p class="sk-muted">Run ${esc(r.generated_at)} · ${esc((r.modes || []).join("; ") || "no live mode")}${(r.modes || []).some(x => /keyword|offline/.test(x)) ? ' <span class="sk-chip unv">fallback mode: not representative of the full pipeline</span>' : ""}</p>
     <div class="sk-bar mt-2"><i style="width:${Math.round(100 * r.passed / r.total)}%"></i></div><p class="sk-muted">${r.passed}/${r.total} passed</p>
     <div class="sk-grid2 mt-3">${card("Expected source cited", m.answerable_hit[0] + "/" + m.answerable_hit[1], pct(m.answerable_hit) + "% of answerable questions", pct(m.answerable_hit) >= 80)}${card("Safe abstention", m.abstention[0] + "/" + m.abstention[1], "out-of-scope and fake-authority questions", m.abstention[0] === m.abstention[1])}${card("Jurisdiction leaks", m.jurisdiction_leaks, "cross-jurisdiction citations", m.jurisdiction_leaks === 0)}${card("Invalid citations", m.invalid_citations, "IDs not in the corpus", m.invalid_citations === 0)}</div>
     <div style="overflow:auto;max-height:50vh" class="mt-3"><table class="w-full text-xs"><thead class="text-slate-400"><tr><th align=left>ID</th><th align=left>Question</th><th>J</th><th>Type</th><th>Result</th><th align=left>Cited</th></tr></thead><tbody>${r.rows.map(x => `<tr class="border-t border-slate-800"><td>${esc(x.id)}</td><td class="text-slate-300">${esc(x.q)}</td><td align=center>${esc(x.jurisdiction[0])}</td><td>${esc(x.type)}</td><td align=center class="${x.pass ? "text-emerald-400" : "text-rose-400"}">${x.pass ? "PASS" : "FAIL"}</td><td>${x.cited.map(id => chip({ id, neutral: true })).join(" ")}</td></tr>`).join("")}</tbody></table></div>`;
  }
  window.load_eval = async function () { try { evRender(await j("/api/eval/latest")); } catch (e) { $("#evOut").innerHTML = `<p class="sk-muted">${esc(e.message)} — or press “Run evaluation now” (uses your Gemini key).</p>`; } };
  $("#evRun").onclick = async () => { const b = $("#evRun"); b.disabled = true; $("#evOut").innerHTML = `<p class="sk-muted">Running all questions… this can take a few minutes because every question calls the model.</p>`; try { evRender(await j("/api/eval/run", {}, $("#evTok").value ? { "X-Admin-Token": $("#evTok").value } : {})); } catch (e) { $("#evOut").innerHTML = `<p class="text-rose-300 text-xs">${esc(e.message)}</p>`; } b.disabled = false; };
})();
