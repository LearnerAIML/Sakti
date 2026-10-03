import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../config.js';

export default function HighlightsModal({ isOpen, onClose }) {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_BASE}/api/highlights-2024`)
        .then((res) => res.json())
        .then((data) => setHighlights(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error loading highlights:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-dialog modal-dialog-lg">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(154, 106, 18, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-gold)',
            }}>
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                2024 Landmark Reforms in Ayurveda IPR &amp; ABS
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                Statutory amendments, WIPO GratK Treaty &amp; NBA Guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <div className="spinner" />
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Loading 2024 legal updates...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {highlights.map((hl) => (
                <div
                  key={hl.id}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.125rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <code style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-accent)' }}>{hl.id}</code>
                        <span className="badge badge-amber">{hl.domain}</span>
                        <span className="badge badge-emerald">{hl.jurisdiction}</span>
                      </div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {hl.title}
                      </h4>
                    </div>
                    {hl.applicability_status && (
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        background: 'rgba(31, 95, 75, 0.12)',
                        color: 'var(--color-text-accent)',
                        border: '1px solid rgba(31, 95, 75, 0.25)',
                        whiteSpace: 'nowrap',
                      }}>
                        {hl.applicability_status}
                      </span>
                    )}
                  </div>

                  <div style={{
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem',
                    fontSize: '0.75rem',
                    lineHeight: 1.6,
                    color: 'var(--color-text-secondary)',
                  }}>
                    <p style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--color-text-primary)' }}>What Changed: </strong>
                      {hl.what_changed}
                    </p>
                    <p>
                      <strong style={{ color: 'var(--color-text-primary)' }}>Why It Matters for Ayurveda: </strong>
                      {hl.why_it_matters}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Authority: <strong style={{ color: 'var(--color-text-secondary)' }}>{hl.governing_authority}</strong></span>
                    {hl.official_source_url && (
                      <a
                        href={hl.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-brand-emerald-light)' }}
                      >
                        <span>Official Gazette / Text</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
