import React, { useState, useEffect } from 'react';
import { Library, ExternalLink, RefreshCw, Tag, Search, Sparkles, FileText, ChevronRight } from 'lucide-react';
import RegistriesSection from './RegistriesSection.jsx';
import { API_BASE } from '../config.js';

export default function SourcesDrawer({ jurisdiction, onSelectDoc }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSources();
  }, [jurisdiction]);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/sources?jurisdiction=${encodeURIComponent(jurisdiction)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSources(data.documents || []);
    } catch (e) {
      console.error("Failed to load sources:", e);
      setError("Could not load legal corpus. Ensure the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...new Set(sources.map(s => s.category).filter(Boolean))];

  const filtered = sources.filter(s => {
    const matchesCategory = selectedCategory === "all" || s.category?.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      s.id?.toLowerCase().includes(query) ||
      s.statute?.toLowerCase().includes(query) ||
      s.section_rule?.toLowerCase().includes(query) ||
      s.title?.toLowerCase().includes(query) ||
      s.authority?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Panel Header ── */}
      <div className="card" style={{ padding: '1.125rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(154, 106, 18,0.12)',
              border: '1px solid rgba(154, 106, 18,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Library size={16} color="var(--color-text-gold)" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                Authoritative Legal Knowledge Base
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                Curated, version-tracked statutory provisions — {jurisdiction} Jurisdiction
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Doc Count */}
            <span className="badge badge-amber">{sources.length} Documents</span>

            {/* Refresh */}
            <button
              onClick={fetchSources}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              title="Refresh corpus"
            >
              <RefreshCw size={13} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.875rem',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
            <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search statutes, sections (e.g. 3(p), Form I, DCA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', height: '34px', fontSize: '0.75rem' }}
            />
          </div>

          {/* Category Filters */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              <Tag size={12} color="var(--color-text-muted)" strokeWidth={2} style={{ flexShrink: 0 }} />
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  id={`filter-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className="btn btn-sm"
                  style={{
                    background: selectedCategory === cat ? 'var(--color-brand-emerald)' : 'var(--color-bg-elevated)',
                    color: selectedCategory === cat ? 'white' : 'var(--color-text-muted)',
                    border: `1px solid ${selectedCategory === cat ? 'var(--color-brand-emerald-dark)' : 'var(--color-border-default)'}`,
                    textTransform: 'capitalize',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    fontSize: '0.6875rem',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--color-border-strong)',
              borderTopColor: 'var(--color-text-gold)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Loading authoritative legal provisions...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="card" style={{
          background: 'var(--color-error-bg)',
          borderColor: 'var(--color-error-border)',
        }}>
          <div className="empty-state" style={{ padding: '2rem 1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-error-text)', fontWeight: 500 }}>{error}</p>
            <button onClick={fetchSources} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
              Try Again
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Library size={22} color="var(--color-text-muted)" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              No documents match your filter
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Try clearing your search query or selecting "all" categories.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.875rem',
        }}>
          {filtered.map((doc) => (
            <SourceCard key={doc.id} doc={doc} onSelectDoc={onSelectDoc} />
          ))}
        </div>
      )}

      {/* ── Official Government Registries & Search Portals ── */}
      <RegistriesSection jurisdiction={jurisdiction} />
    </div>
  );
}

function SourceCard({ doc, onSelectDoc }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        transition: 'border-color 0.15s ease, transform 0.1s ease',
        height: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-strong)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-default)';
      }}
    >
      {/* Top row: ID + Category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <code style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-accent)', lineHeight: 1 }}>
          {doc.id}
        </code>
        {(doc.category || doc.jurisdiction) && (
          <span style={{
            fontSize: '0.625rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '999px',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            color: 'var(--color-text-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>
            {doc.category || doc.jurisdiction}
          </span>
        )}
      </div>

      {/* Statute + Section */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4, marginBottom: '0.25rem' }}>
          {doc.statute}
        </p>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-gold)', lineHeight: 1.4, marginBottom: '0.375rem' }}>
          {doc.section_rule}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {doc.title}
        </p>
      </div>

      {/* Footer: Authority + Buttons */}
      <div style={{
        paddingTop: '0.625rem',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <button
          type="button"
          onClick={() => onSelectDoc && onSelectDoc(doc.id)}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.6875rem',
            padding: '0.2rem 0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--color-text-accent)',
            borderColor: 'rgba(31, 95, 75, 0.3)',
          }}
          title="Open full statutory provision and legal implications"
        >
          <FileText size={11} />
          <span>Full Statute</span>
          <ChevronRight size={10} />
        </button>

        <a
          href={doc.official_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
        >
          <span>Official Portal</span>
          <ExternalLink size={10} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
