/* Improvement 07: clickable knowledge graph. */
(function () {
const { esc, $, j, opt, chk } = SK;
const api = SK.api;
const chip = c => SK.chip(c);
  // ---------- Knowledge graph ----------
  const G = SK.addTab("graph", "Knowledge Graph", () => window.load_graph && window.load_graph());
  G.innerHTML = `<div class="sk-card"><h2 class="sk-h text-lg">Knowledge graph</h2><p class="sk-muted">Product class → IP / regulatory type → law → jurisdiction. Click any node to trace its connections; click a law to list its provisions.</p><p class="sk-muted mt-2">Columns: <b>Product class</b> → <b>IP / regulatory type</b> → <b>Law</b> → <b>Jurisdiction</b>. Scroll sideways on small screens.</p><div id="grInfo" class="sk-muted mt-2"></div><div style="overflow:auto;max-height:70vh" class="mt-3"><svg id="grSvg" width="100%"></svg></div></div>`;
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
        const n = nodes[id]; $("#grInfo").innerHTML = n.docs ? `<b class="text-white">${esc(n.label)}</b>: ${n.docs.map(d => chip({ id: d, neutral: true })).join(" ")}` : `<b class="text-white">${esc(n.label)}</b>`; }
      svg.querySelectorAll(".sk-node").forEach(x => { x.classList.toggle("on", el && x.dataset.id === el.dataset.id); x.classList.toggle("sk-dim", !!el && !on.has(x.dataset.id)); });
      svg.querySelectorAll(".sk-edge").forEach(x => { x.classList.toggle("on", onE.has(+x.dataset.i)); x.classList.toggle("sk-dim", !!el && !onE.has(+x.dataset.i)); });
    };
    $("#grInfo").textContent = g.note + " " + g.docs_total + " provisions indexed.";
  };

})();
