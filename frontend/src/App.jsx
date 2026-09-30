import React, { useState, useEffect } from 'react';
import { FlaskConical, Scale, BookOpen, Shield, Sparkles, UserCheck } from 'lucide-react';
import Header from './components/Header.jsx';
import ClassifierWizard from './components/ClassifierWizard.jsx';
import RagQueryInterface from './components/RagQueryInterface.jsx';
import SourcesDrawer from './components/SourcesDrawer.jsx';
import EscalationModal from './components/EscalationModal.jsx';
import DocumentDetailModal from './components/DocumentDetailModal.jsx';
import PrivacyModal from './components/PrivacyModal.jsx';
import HighlightsModal from './components/HighlightsModal.jsx';

const API_BASE = "http://127.0.0.1:8000";

const TABS = [
  {
    id: 'classifier',
    label: 'Formulation Classifier & IP Router',
    shortLabel: 'Classifier',
    Icon: FlaskConical,
  },
  {
    id: 'query',
    label: 'IPR & Legal Assistant',
    shortLabel: 'Legal AI',
    Icon: Scale,
  },
  {
    id: 'sources',
    label: 'Legal Corpus & Registries',
    shortLabel: 'Corpus & Portals',
    Icon: BookOpen,
    badge: true,
  },
];

export default function App() {
  const [jurisdiction, setJurisdiction] = useState("India");
  const [activeTab, setActiveTab] = useState("classifier");
  const [systemStatus, setSystemStatus] = useState(null);

  // Modals state
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [escalationData, setEscalationData] = useState({});
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Classifier state
  const [classifierResult, setClassifierResult] = useState(null);
  const [classifierLoading, setClassifierLoading] = useState(false);

  // RAG Query state
  const [queryResponse, setQueryResponse] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Check system health on load
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
      })
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

  const handleOpenEscalation = (data = {}) => {
    setEscalationData(data);
    setEscalationOpen(true);
  };

  const docCount = systemStatus?.corpus_documents_loaded || 55;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Header
        jurisdiction={jurisdiction}
        setJurisdiction={setJurisdiction}
        systemStatus={systemStatus}
        onOpenEscalation={() => handleOpenEscalation({ jurisdiction })}
        onOpenHighlights={() => setHighlightsOpen(true)}
      />

      {/* Tab Bar */}
      <div style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        position: 'sticky',
        top: '64px',
        zIndex: 40,
      }}>
        <div className="container">
          <nav style={{ display: 'flex', gap: '0', overflowX: 'auto' }} aria-label="Main navigation">
            {TABS.map(({ id, label, shortLabel, Icon, badge }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  aria-selected={isActive}
                  role="tab"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-brand-emerald-light)' : 'var(--color-text-muted)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--color-brand-emerald)' : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                    fontFamily: 'inherit',
                    flexShrink: 0,
                    marginBottom: '-1px',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = 'var(--color-text-muted)';
                  }}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                  {badge && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.375rem',
                      borderRadius: '999px',
                      background: isActive ? 'var(--color-success-bg)' : 'var(--color-bg-elevated)',
                      color: isActive ? '#34d399' : 'var(--color-text-muted)',
                      border: `1px solid ${isActive ? 'var(--color-success-border)' : 'var(--color-border-strong)'}`,
                      lineHeight: 1.4,
                    }}>
                      {docCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, paddingTop: '1.75rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          {activeTab === 'classifier' && (
            <div className="animate-fade-in">
              <ClassifierWizard
                onClassify={handleClassify}
                result={classifierResult}
                loading={classifierLoading}
                onOpenEscalation={handleOpenEscalation}
              />
            </div>
          )}
          {activeTab === 'query' && (
            <div className="animate-fade-in">
              <RagQueryInterface
                jurisdiction={jurisdiction}
                onQuery={handleQuery}
                response={queryResponse}
                loading={queryLoading}
                onOpenEscalation={handleOpenEscalation}
                onSelectDoc={(docId) => setSelectedDocId(docId)}
              />
            </div>
          )}
          {activeTab === 'sources' && (
            <div className="animate-fade-in">
              <SourcesDrawer
                jurisdiction={jurisdiction}
                onSelectDoc={(docId) => setSelectedDocId(docId)}
                onOpenHighlights={() => setHighlightsOpen(true)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        padding: '1.25rem 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                SAKTI — Smart India Hackathon (SIH) Prototype
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                Indian Patents Act 1970 · Biological Diversity Act 2002/2024 · DCA 1940 · WIPO GRATK 2024
              </p>
            </div>

            {/* Footer Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setHighlightsOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                <Sparkles size={12} color="#fbbf24" />
                <span>2024 Legal Reforms</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEscalation()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-emerald-light)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                <UserCheck size={12} color="var(--color-brand-emerald-light)" />
                <span>Expert Facilitation</span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand-emerald-light)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                <Shield size={12} color="var(--color-brand-emerald-light)" />
                <span>DPDP Act Privacy Notice</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <EscalationModal
        isOpen={escalationOpen}
        onClose={() => setEscalationOpen(false)}
        initialData={escalationData}
      />

      <DocumentDetailModal
        docId={selectedDocId}
        isOpen={Boolean(selectedDocId)}
        onClose={() => setSelectedDocId(null)}
      />

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      <HighlightsModal
        isOpen={highlightsOpen}
        onClose={() => setHighlightsOpen(false)}
      />
    </div>
  );
}
