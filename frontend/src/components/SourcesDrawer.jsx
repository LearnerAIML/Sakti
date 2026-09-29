import React, { useState, useEffect } from 'react';

export default function SourcesDrawer({ jurisdiction }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchSources();
  }, [jurisdiction]);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const url = `http://127.0.0.1:8000/api/sources?jurisdiction=${jurisdiction}`;
      const res = await fetch(url);
      const data = await res.json();
      setSources(data.documents || []);
    } catch (e) {
      console.error("Failed to load sources:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedCategory === "all"
    ? sources
    : sources.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  const categories = ["all", ...new Set(sources.map(s => s.category).filter(Boolean))];

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏛️</span> Authoritative Legal Knowledge Base
          </h2>
          <p className="text-xs text-slate-400">
            Curated, version-tracked provisions under {jurisdiction} Jurisdiction.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Loading curated provisions...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-500 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {doc.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase">
                    {doc.category || doc.jurisdiction}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {doc.statute}
                </h4>
                <p className="text-xs text-amber-300 font-medium mb-1">
                  {doc.section_rule}
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  {doc.title}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                  {doc.authority}
                </span>
                <a
                  href={doc.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Official Text</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
