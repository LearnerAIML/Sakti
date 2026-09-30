/* Improvement 06: more answer languages, browser voice input, optional Bhashini translation. */
(function () {
  const { esc, $ } = SK;
  const LANGS = [["auto", "Language: follow UI"], ["en", "English"], ["hi", "हिन्दी"], ["gu", "ગુજરાતી"], ["mr", "मराठी"], ["ta", "தமிழ்"], ["te", "తెలుగు"], ["bn", "বাংলা"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]];
  const VOICE = { en: "en-IN", hi: "hi-IN", gu: "gu-IN", mr: "mr-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN" };
  let chosen = "auto";
  const effective = () => (chosen === "auto" ? SK.lang() : chosen);

  const _fetch = window.fetch;
  window.fetch = function (u, o) {
    try { if (o && o.body && chosen !== "auto" && /\/api\/(query|compare)$/.test(String(u))) { const b = JSON.parse(o.body); b.language = chosen; o = Object.assign({}, o, { body: JSON.stringify(b) }); } } catch (e) { }
    return _fetch.call(this, u, o);
  };

  const anchor = $("#queryLangBadge"), bar = anchor && anchor.parentElement; if (!bar) return;
  const sel = document.createElement("select"); sel.className = "sk-in"; sel.style.width = "auto"; sel.setAttribute("aria-label", "Answer language");
  sel.innerHTML = SK.opt(LANGS);
  sel.onchange = () => { chosen = sel.value; const l = LANGS.find(x => x[0] === effective()); anchor.textContent = l ? l[1].replace("Language: follow UI", "") || "English" : "English"; };
  bar.appendChild(sel);

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = document.createElement("button"); mic.type = "button"; mic.className = "sk-btn alt"; mic.textContent = "🎤 Speak";
  if (!SR) { mic.disabled = true; mic.title = "Voice input needs a browser with speech recognition (Chrome or Edge)."; }
  let rec = null;
  const idle = msg => { rec = null; mic.textContent = "🎤 Speak"; if (msg) alert(msg); };
  mic.onclick = () => {
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = VOICE[effective()] || "en-IN"; rec.interimResults = false; mic.textContent = "Listening… (tap to stop)";
    rec.onresult = e => { $("#ragQueryInput").value = e.results[0][0].transcript; };
    rec.onend = () => idle();
    rec.onerror = e => idle(e.error === "not-allowed" ? "Microphone permission was denied." : e.error === "no-speech" || e.error === "aborted" ? "" : "Voice input failed: " + e.error);
    try { rec.start(); } catch (e) { idle(); }
  };
  bar.appendChild(mic);

  // notes + optional Bhashini button on each answer
  let bhashini = false;
  SK.j("/api/languages").then(d => { bhashini = !!d.bhashini_configured; }).catch(() => { });
  SK.wrap("renderQueryResult", (orig, self, args) => {
    const data = args[0], out = orig.apply(self, args), body = $("#queryAnswerBody");
    const old = $("#skLangNote"); if (old) old.remove();
    const note = document.createElement("div"); note.id = "skLangNote"; note.className = "mt-2";
    if (data.language && data.language !== "en" && data.retrieval_mode === "keyword") note.innerHTML = `<p class="sk-muted" style="color:#fbbf24">Note: keyword fallback retrieval is English-only, so a non-English question may retrieve poorly. Use a Gemini key for dense retrieval.</p>`;
    if (bhashini && !data.is_abstained) {
      note.innerHTML += `<button type="button" class="sk-btn alt" id="skBhashini">Translate with Bhashini → ${esc(effective() === "en" ? "hi" : effective())}</button> <span id="skBhOut"></span>`;
    }
    body.after(note);
    const b = $("#skBhashini"); if (b) b.onclick = async () => {
      b.disabled = true; $("#skBhOut").textContent = "Translating…";
      try { const t = await SK.j("/api/translate", { text: data.answer.replace(/\[[A-Z0-9-]+\]/g, ""), target: effective() === "en" ? "hi" : effective() }); $("#skBhOut").innerHTML = ""; const d = document.createElement("div"); d.className = "sk-plain mt-2 whitespace-pre-wrap"; d.textContent = t.translation; note.appendChild(d); }
      catch (e) { $("#skBhOut").textContent = e.message; } b.disabled = false;
    };
    return out;
  });
})();
