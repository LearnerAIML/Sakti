import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ClassifierWizard from './components/ClassifierWizard.jsx';
import RagQueryInterface from './components/RagQueryInterface.jsx';
import SourcesDrawer from './components/SourcesDrawer.jsx';

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [jurisdiction, setJurisdiction] = useState("India");
  const [activeTab, setActiveTab] = useState("classifier");
  const [systemStatus, setSystemStatus] = useState(null);

  // Classifier state
  const [classifierResult, setClassifierResult] = useState(null);
  const [classifierLoading, setClassifierLoading] = useState(false);

  // RAG Query state
  const [queryResponse, setQueryResponse] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Check system health on load
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error("API health check error:", err));
  }, []);

  // Handle classification API call
  const handleClassify = async (formData) => {
    setClassifierLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setClassifierResult(data);
    } catch (e) {
      console.error("Classification error:", e);
    } finally {
      setClassifierLoading(false);
    }
  };

  // Handle RAG Query API call
  const handleQuery = async (queryText) => {
    setQueryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          jurisdiction: jurisdiction,
          top_k: 4
        })
      });
      const data = await res.json();
      setQueryResponse(data);
    } catch (e) {
      console.error("Query error:", e);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Header */}
      <div>
        <Header
          jurisdiction={jurisdiction}
          setJurisdiction={setJurisdiction}
          systemStatus={systemStatus}
        />

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
            <button
              onClick={() => setActiveTab('classifier')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'classifier'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>🔬</span>
              <span>1. Formulation Classifier Wizard</span>
            </button>

            <button
              onClick={() => setActiveTab('query')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'query'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>⚖️</span>
              <span>2. IPR & ABS Legal Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'sources'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>🏛️</span>
              <span>3. Curated Legal Corpus ({systemStatus?.corpus_documents_loaded || 29})</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'classifier' && (
            <ClassifierWizard
              onClassify={handleClassify}
              result={classifierResult}
              loading={classifierLoading}
            />
          )}

          {activeTab === 'query' && (
            <RagQueryInterface
              jurisdiction={jurisdiction}
              onQuery={handleQuery}
              response={queryResponse}
              loading={queryLoading}
            />
          )}

          {activeTab === 'sources' && (
            <SourcesDrawer jurisdiction={jurisdiction} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-400">
            SAKTI — Smart India Hackathon (SIH) Prototype
          </p>
          <p>
            Grounded in Indian Patents Act 1970, Biological Diversity Act 2002/2024, DCA 1940, and WIPO GRATK Treaty 2024.
          </p>
        </div>
      </footer>

    </div>
  );
}
