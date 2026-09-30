import React from 'react';
import { Activity, Globe, MapPin, UserCheck, Sparkles } from 'lucide-react';

export default function Header({
  jurisdiction,
  setJurisdiction,
  systemStatus,
  onOpenEscalation,
  onOpenHighlights
}) {
  const isHealthy = systemStatus?.status === 'healthy';
  const docCount = systemStatus?.corpus_documents_loaded;

  return (
    <header style={{
      borderBottom: '1px solid var(--color-border-subtle)',
      background: 'var(--color-bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="container" style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

          {/* ── Brand ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-brand-emerald), #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  SAKTI
                </h1>
                <span className="badge badge-emerald" style={{ flexShrink: 0 }}>SIH 2024</span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem', lineHeight: 1.3 }}>
                Ayurveda IPR, ABS &amp; Regulatory Intelligence
              </p>
            </div>
          </div>

          {/* ── Controls ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>

            {/* 2024 Reforms Button */}
            {onOpenHighlights && (
              <button
                type="button"
                onClick={onOpenHighlights}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.6875rem',
                  borderColor: 'rgba(251, 191, 36, 0.3)',
                  color: '#fbbf24',
                }}
                title="View 2024 statutory amendments and WIPO GRATK Treaty"
              >
                <Sparkles size={12} />
                <span className="hidden sm:inline">2024 Reforms</span>
              </button>
            )}

            {/* Expert Escalation Button */}
            {onOpenEscalation && (
              <button
                type="button"
                onClick={() => onOpenEscalation()}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.6875rem',
                  borderColor: 'rgba(5, 150, 105, 0.3)',
                  color: 'var(--color-brand-emerald-light)',
                }}
                title="Request human IP facilitator or patent agent review"
              >
                <UserCheck size={12} />
                <span className="hidden sm:inline">Expert Review</span>
              </button>
            )}

            {/* Status Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
            }}>
              <span className={`status-dot ${isHealthy ? 'active' : 'inactive'}`}></span>
              <span>
                {docCount ? `${docCount} Statutes` : 'API Active'}
              </span>
            </div>

            {/* Jurisdiction Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '10px',
              padding: '3px',
              gap: '2px',
            }}>
              <button
                onClick={() => setJurisdiction('India')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: 'none',
                  fontFamily: 'inherit',
                  background: jurisdiction === 'India' ? 'var(--color-brand-emerald)' : 'transparent',
                  color: jurisdiction === 'India' ? 'white' : 'var(--color-text-muted)',
                }}
              >
                <MapPin size={12} strokeWidth={2.5} />
                <span>India</span>
              </button>
              <button
                onClick={() => setJurisdiction('International')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: 'none',
                  fontFamily: 'inherit',
                  background: jurisdiction === 'International' ? '#2563eb' : 'transparent',
                  color: jurisdiction === 'International' ? 'white' : 'var(--color-text-muted)',
                }}
              >
                <Globe size={12} strokeWidth={2.5} />
                <span>International</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
