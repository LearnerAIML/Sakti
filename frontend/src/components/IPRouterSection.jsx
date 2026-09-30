import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, ExternalLink, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

export default function IPRouterSection({ result, onOpenEscalation }) {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (result?.category) {
      setLoading(true);
      fetch(`${API_BASE}/api/ip-router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: result.category,
          product_name: result.product_name || "Ayurvedic Formulation",
          has_novel_technical_feature: result.category_code === 'PHYTOPHARMACEUTICAL' || result.processing_nature === 'purified_fraction_with_markers',
          has_brand_identity: true,
          has_novel_packaging: false,
          is_geography_specific: false,
          involves_plant_cultivar: false,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("IP router fetch failed");
          return res.json();
        })
        .then((data) => setIpData(data))
        .catch((err) => {
          console.error("IP router error:", err);
          setIpData(null);
        })
        .finally(() => setLoading(false));
    }
  }, [result]);

  if (loading) {
    return (
      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        textAlign: 'center',
        marginTop: '1rem',
      }}>
        <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Evaluating multi-path IPR protection regimes...
        </p>
      </div>
    );
  }

  if (!ipData) return null;

  return (
    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="#34d399" />
            <span>Recommended Multi-Regime IP Protection</span>
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Statutory regimes evaluated for {ipData.product_name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {ipData.recommended_regimes?.map((r, idx) => (
            <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.625rem' }}>
              ✓ {r}
            </span>
          ))}
        </div>
      </div>

      {/* Strategic Summary Box */}
      {ipData.strategic_summary && (
        <div style={{
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Strategic Assessment: </strong>
          {ipData.strategic_summary}
        </div>
      )}

      {/* Dynamic IP Path Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '0.75rem',
      }}>
        {ipData.paths?.map((path, idx) => {
          const isRec = path.is_recommended;
          const isCond = path.status_label.toLowerCase().includes('cond');

          const borderColor = isRec ? 'rgba(5, 150, 105, 0.35)' : isCond ? 'rgba(217, 119, 6, 0.35)' : 'var(--color-border-default)';
          const badgeClass = isRec ? 'badge-emerald' : isCond ? 'badge-amber' : 'badge-slate';

          return (
            <div
              key={idx}
              style={{
                background: 'var(--color-bg-elevated)',
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.625rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', gap: '0.5rem' }}>
                  <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {path.ip_regime}
                  </h5>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.625rem' }}>
                    {path.status_label}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.375rem' }}>
                  {path.relevance_reason}
                </p>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--color-text-secondary)' }}>Eligibility: </strong>
                  {path.eligibility_conditions}
                </div>
              </div>

              <div style={{
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.6875rem',
              }}>
                <span style={{ color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                  {path.governing_law}
                </span>
                {path.official_portal_url && (
                  <a
                    href={path.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      color: 'var(--color-brand-emerald-light)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Filing Portal</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Escalation Prompt */}
      {onOpenEscalation && (
        <div style={{
          background: 'rgba(217, 119, 6, 0.08)',
          border: '1px solid rgba(217, 119, 6, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginTop: '0.25rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Need registered patent agent or AYUSH regulatory representation?
          </div>
          <button
            type="button"
            onClick={() => onOpenEscalation({
              product_name: result.product_name,
              classification_category: result.category,
              query: `Assistance requested for IP routing of formulation: ${result.product_name} (${result.category})`,
            })}
            className="btn btn-sm"
            style={{
              background: '#d97706',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.6875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>Request Expert Facilitation</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
