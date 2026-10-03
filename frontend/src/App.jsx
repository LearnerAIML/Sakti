import React, { useState, useEffect } from 'react';
import { FlaskConical, Scale, BookOpen, Shield, Sparkles, UserCheck, FileText, Network, AlertTriangle } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import Header from './components/Header.jsx';
import ClassifierWizard from './components/ClassifierWizard.jsx';
import RagQueryInterface from './components/RagQueryInterface.jsx';
import ProductDossier from './components/ProductDossier.jsx';
import KnowledgeGraph from './components/KnowledgeGraph.jsx';
import SourcesDrawer from './components/SourcesDrawer.jsx';
import EscalationModal from './components/EscalationModal.jsx';
import DocumentDetailModal from './components/DocumentDetailModal.jsx';
import PrivacyModal from './components/PrivacyModal.jsx';

const API_BASE = ""; // relative — works via FastAPI (/app/) and Vite dev proxy

function MainApp() {
  const { t, isHindi } = useLanguage();

  const [jurisdiction, setJurisdiction] = useState("India");
  const [activeTab, setActiveTab] = useState("classifier");
  const [systemStatus, setSystemStatus] = useState(null);

  // Theme state: dark | light (Feature 6)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sakti_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('sakti_theme', theme);
  }, [theme]);

  // Modals state
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [escalationData, setEscalationData] = useState({});
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // Classifier state
  const [classifierResult, setClassifierResult] = useState(null);
  const [classifierLoading, setClassifierLoading] = useState(false);

  // Dossier initial data (when transitioning from Classifier to Dossier)
  const [dossierInitialData, setDossierInitialData] = useState(null);

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

  // Switch to dossier tab with preloaded data
  const handleOpenDossierFromClassifier = (formParams) => {
    setDossierInitialData(formParams);
    setActiveTab("dossier");
  };

  // Handle RAG Query API call
  const handleQuery = async (queryText, queryLanguage) => {
    setQueryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          jurisdiction: jurisdiction,
          language: queryLanguage || (isHindi ? "hi" : "en"),
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

  const docCount = systemStatus?.corpus_documents_loaded || 67;

  const TABS = [
    {
      id: 'classifier',
      label: t('tab_classifier'),
      shortLabel: t('tab_classifier_short'),
      Icon: FlaskConical,
    },
    {
      id: 'query',
      label: t('tab_query'),
      shortLabel: t('tab_query_short'),
      Icon: Scale,
    },
    {
      id: 'dossier',
      label: t('tab_dossier'),
      shortLabel: t('tab_dossier_short'),
      Icon: FileText,
      highlight: true,
    },
    {
      id: 'graph',
      label: t('tab_graph'),
      shortLabel: t('tab_graph_short'),
      Icon: Network,
    },
    {
      id: 'sources',
      label: t('tab_sources'),
      shortLabel: t('tab_sources_short'),
      Icon: BookOpen,
      badge: true,
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      {/* ── Header ── */}
      <Header
        jurisdiction={jurisdiction}
        setJurisdiction={setJurisdiction}
        systemStatus={systemStatus}
        onOpenEscalation={() => handleOpenEscalation({ jurisdiction })}
        theme={theme}
        setTheme={setTheme}
      />

      {/* ── Sticky Navigation Tab Bar ── */}
      <div style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        position: 'sticky',
        top: '57px',
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color 0.2s ease',
      }}>
        <div className="container">
          <nav style={{ display: 'flex', gap: '0', overflowX: 'auto' }} aria-label="Main navigation">
            {TABS.map(({ id, label, shortLabel, Icon, badge, highlight }) => {
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
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive
                      ? (highlight ? '2px solid var(--color-brand-gold-light)' : '2px solid var(--color-brand-emerald)')
                      : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
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

                  {highlight && !isActive && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.05rem 0.35rem',
                      borderRadius: '999px',
                      background: 'rgba(154, 106, 18, 0.15)',
                      color: 'var(--color-text-gold)',
                      border: '1px solid rgba(154, 106, 18, 0.3)',
                    }}>
                      New
                    </span>
                  )}

                  {badge && (
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.375rem',
                      borderRadius: '999px',
                      background: isActive ? 'var(--color-success-bg)' : 'var(--color-bg-elevated)',
                      color: isActive ? 'var(--color-text-accent)' : 'var(--color-text-muted)',
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

      {/* ── Main Tab Content ── */}
      <main style={{ flex: 1, paddingTop: '1.75rem', paddingBottom: '2.5rem' }}>
        <div className="container">

          {/* Tab 1: Classifier & IP Router */}
          {activeTab === 'classifier' && (
            <div className="animate-fade-in">
              <ClassifierWizard
                onClassify={handleClassify}
                result={classifierResult}
                loading={classifierLoading}
                onOpenEscalation={handleOpenEscalation}
                onOpenDossier={handleOpenDossierFromClassifier}
              />
            </div>
          )}

          {/* Tab 2: RAG Query Legal Assistant */}
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

          {/* Tab 3: One-Click Product Dossier (Feature 1) */}
          {activeTab === 'dossier' && (
            <div className="animate-fade-in">
              <ProductDossier
                initialData={dossierInitialData}
                onSelectDoc={(docId) => setSelectedDocId(docId)}
                onOpenEscalation={handleOpenEscalation}
              />
            </div>
          )}

          {/* Tab 4: Knowledge Graph (Feature 5) */}
          {activeTab === 'graph' && (
            <div className="animate-fade-in">
              <KnowledgeGraph
                onSelectDoc={(docId) => setSelectedDocId(docId)}
                onSelectProductClass={(className) => {
                  setDossierInitialData({ product_name: className });
                  setActiveTab('dossier');
                }}
              />
            </div>
          )}

          {/* Tab 5: Legal Sources & Registries */}
          {activeTab === 'sources' && (
            <div className="animate-fade-in">
              <SourcesDrawer
                jurisdiction={jurisdiction}
                onSelectDoc={(docId) => setSelectedDocId(docId)}
              />
            </div>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-surface)',
        padding: '1.25rem 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src="/app/app-icon.png"
                alt="SAKTI Icon"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.02em' }}>
                  SAKTI — Ayurveda IPR, ABS &amp; Regulatory Intelligence Platform
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                  Indian Patents Act 1970 · Biological Diversity Act 2002/2023 · DCA 1940 · WIPO Treaties
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Privacy &amp; DPDP Notice
              </button>
              <button
                type="button"
                onClick={() => handleOpenEscalation()}
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--color-brand-emerald-light)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Expert Escalation
              </button>
            </div>
          </div>

          {/* Statutory Intelligence Notice (Subtle, trusted footer placement) */}
          <div style={{
            borderTop: '1px solid var(--color-border-subtle)',
            marginTop: '0.875rem',
            paddingTop: '0.875rem',
            fontSize: '0.6875rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            <Shield size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
            <span>{t('disclaimer_banner')}</span>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      <EscalationModal
        isOpen={escalationOpen}
        onClose={() => setEscalationOpen(false)}
        initialData={escalationData}
      />

      <DocumentDetailModal
        docId={selectedDocId}
        onClose={() => setSelectedDocId(null)}
      />

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
