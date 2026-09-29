import React from 'react';

export default function Header({ jurisdiction, setJurisdiction, systemStatus }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <span className="text-xl font-bold tracking-tight text-white">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">SAKTI</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SIH 2024 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ayurveda IPR, Access & Benefit Sharing (ABS) & Regulatory Intelligence
            </p>
          </div>
        </div>

        {/* Center: System Status & Jurisdiction Switch */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${systemStatus?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300">
              {systemStatus?.corpus_documents_loaded ? `${systemStatus.corpus_documents_loaded} Curated Statutes` : 'Live API Active'}
            </span>
          </div>

          {/* Jurisdiction Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setJurisdiction('India')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                jurisdiction === 'India'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇮🇳</span>
              <span>India Law (Patents / BDA / DCA)</span>
            </button>
            <button
              onClick={() => setJurisdiction('International')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                jurisdiction === 'International'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🌐</span>
              <span>International (WIPO GRATK / Nagoya)</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
