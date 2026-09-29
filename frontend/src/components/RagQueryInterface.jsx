import React, { useState } from 'react';

const SAMPLE_QUERIES = {
  India: [
    "Can I patent a herbal cough formulation made from ginger and honey in India?",
    "Does an Indian vaidya or AYUSH practitioner need NBA approval under the 2023 amendment?",
    "What are the clinical trial requirements for a Phytopharmaceutical drug under Rule 122E?",
    "Can an Ayurveda Aahar food product claim to cure or treat diabetes?"
  ],
  International: [
    "What international treaties mandate the disclosure of origin for traditional knowledge in patent applications?",
    "How does the Nagoya Protocol affect commercial export of Indian Ayurvedic medicinal plants?",
    "What are the patent search rules for traditional knowledge under the PCT (Patent Cooperation Treaty)?"
  ]
};

export default function RagQueryInterface({ jurisdiction, onQuery, response, loading }) {
  const [queryText, setQueryText] = useState("");

  const samples = jurisdiction === 'International' ? SAMPLE_QUERIES.International : SAMPLE_QUERIES.India;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    onQuery(queryText);
  };

  const handleSelectSample = (sample) => {
    setQueryText(sample);
    onQuery(sample);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Input Box */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h2 className="text-lg font-bold text-white">
              Ayurveda IPR & Regulatory Legal Assistant
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Jurisdiction: {jurisdiction}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={`Ask any IPR, patentability, ABS, or regulatory question under ${jurisdiction} jurisdiction...`}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Quick Prompts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold">Try:</span>
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors truncate max-w-xs"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Query Submit Button */}
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="px-5 py-2 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Synthesizing...</span>
                </>
              ) : (
                <span>Ask SAKTI ➔</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Answer & Grounded Citations Display */}
      {response && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          
          {/* Header metadata */}
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Grounded Statutory Response
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                "{response.query}"
              </h3>
            </div>
            
            {/* Confidence & Abstention Badge */}
            <div className="flex items-center gap-2">
              {response.is_abstained ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  SAFE ABSTENTION (Out of Scope)
                </span>
              ) : (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  response.confidence === 'High'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : response.confidence === 'Medium'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  Confidence: {response.confidence}
                </span>
              )}
            </div>
          </div>

          {/* Rendered Text Response */}
          <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {response.answer}
          </div>

          {/* Source Citation Cards */}
          {response.citations && response.citations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>📚</span> Verified Authoritative Sources ({response.citations.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.citations.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {c.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Match: {(c.relevance_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white mb-1">
                        {c.statute} — {c.section_rule}
                      </h5>
                      <p className="text-[11px] text-slate-400 mb-2">
                        {c.title || c.authority}
                      </p>
                    </div>

                    <a
                      href={c.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 self-start underline underline-offset-2"
                    >
                      <span>View Official Portal Record</span>
                      <span>↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Disclaimer Footer */}
          <div className="border-t border-slate-700/60 pt-4 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <span>🛡️</span>
            <span>{response.disclaimer}</span>
          </div>

        </div>
      )}

    </div>
  );
}
