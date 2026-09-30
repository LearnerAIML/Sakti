/* Improvement 09: UX polish. Disclaimer banner, plain-language box on the classifier result, mobile layout,
   loading indicator. (Example question chips already exist in the base UI and are left as they are.) */
(function () {
  const { esc, $ } = SK;
  SK.style(`
    .sk-banner{background:#451a03;color:#fde68a;font-size:11px;line-height:1.3;text-align:center;padding:.35rem .75rem;border-bottom:1px solid #78350f}
    html:not(.dark) .sk-banner{background:#fef3c7;color:#78350f;border-color:#fcd34d}
    #skBusy{position:fixed;top:0;left:0;height:3px;width:0;background:#10b981;z-index:80;transition:width .3s,opacity .3s;opacity:0}
    @media (max-width:640px){
      button,select,input,textarea{font-size:16px}
      .sk-btn{min-height:44px} main{padding-left:.75rem;padding-right:.75rem}
      table{display:block;overflow-x:auto} .sk-modal{padding:.5rem}.sk-modal>div{max-height:92vh}
    }`);
  const hdr = $("header");
  if (hdr) { const b = document.createElement("div"); b.className = "sk-banner"; b.setAttribute("role", "note");
    b.textContent = "SAKTI gives information, not legal advice. Answers come from a curated corpus; some entries are unverified summaries. Confirm with a registered patent agent or IP facilitator before acting."; hdr.after(b); }

  // loading indicator for every API call
  const bar = document.createElement("div"); bar.id = "skBusy"; document.body.appendChild(bar);
  let n = 0; const _f = window.fetch;
  window.fetch = function (u, o) {
    const api = /\/api\//.test(String(u)); if (api && ++n === 1) { bar.style.opacity = 1; bar.style.width = "70%"; }
    const end = () => { if (api && --n === 0) { bar.style.width = "100%"; setTimeout(() => { bar.style.opacity = 0; bar.style.width = "0"; }, 250); } };
    const p = _f.call(this, u, o); p.then(end, end); return p;
  };

  // plain-language "what this means for you" under the classifier result
  const PLAIN = {
    CLASSICAL_ASU: "Your product looks like a classical formulation. It is usually sold under an ASU licence, but the formula itself is hard to patent because it is traditional knowledge. Build value through your brand, packaging and process, and avoid disease-cure claims.",
    PATENT_PROPRIETARY: "Your product looks like a proprietary Ayurvedic medicine. You can protect the brand and design; a patent is realistic only for a genuinely new technical feature, backed by data.",
    NEW_DRUG: "Your product looks like a non-classical drug. Expect to show evidence of safety and effectiveness. Patent potential is higher, but you must show novelty and inventive step.",
    PHYTOPHARMACEUTICAL: "Your product looks like a phytopharmaceutical. This is a stricter, evidence-heavy route; plan for a full dossier and trials, and protect your standardised extract and process.",
    AYURVEDA_AAHAR: "Your product looks like Ayurveda Aahar (food). FSSAI rules apply, health claims are tightly limited, and brand and packaging are your main IP tools.",
    COSMETIC: "Your product looks like an Ayurvedic cosmetic. Cosmetics rules apply, and drug-like claims will push it into the drug category.",
  };
  SK.wrap("renderClassifierResult", (orig, self, args) => {
    const out = orig.apply(self, args), code = args[0] && args[0].category_code, card = $("#classifierResultCard");
    const old = $("#skPlainCls"); if (old) old.remove();
    if (card && PLAIN[code]) { const d = document.createElement("div"); d.id = "skPlainCls"; d.className = "sk-plain"; d.innerHTML = `<b>What this means for you:</b> ${esc(PLAIN[code])} <i>(Plain-language summary in English; information, not legal advice.)</i>`; card.insertBefore(d, card.children[1] || null); }
    return out;
  });
})();
