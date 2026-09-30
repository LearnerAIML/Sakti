import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Database, Award } from 'lucide-react';

const API_BASE = "";

export default function PrivacyModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_BASE}/api/privacy`)
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch((err) => console.error("Privacy fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(5, 150, 105, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}>
              <ShieldCheck size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                DPDP Act Data Governance &amp; Privacy Notice
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                Digital Personal Data Protection Act, 2023 Alignment
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
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="spinner" />
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Loading privacy statement...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
              }}>
                <Award size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34d399' }}>
                    Zero-Data-Retention for Innovation Trade Secrets
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                    SAKTI processes your proprietary formulation data in-memory during evaluation. Innovation queries are not logged to third-party model providers.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}>
                <div className="info-row">
                  <div className="info-row-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Lock size={11} /> Local Processing
                  </div>
                  <div className="info-row-value" style={{ fontSize: '0.75rem' }}>
                    Vector store operates on local FAISS indexes with isolated statutory embeddings.
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-row-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Database size={11} /> Escalations
                  </div>
                  <div className="info-row-value" style={{ fontSize: '0.75rem' }}>
                    Escalation dossiers are stored in controlled local vaults and accessed only via authorized tokens.
                  </div>
                </div>
              </div>

              {data && (
                <div style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                }}>
                  <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    {data.title || "Data Governance Policy"}
                  </p>
                  <p style={{ marginBottom: '0.5rem' }}>{data.purpose}</p>
                  <p style={{ marginBottom: '0.5rem' }}><strong>Data Storage:</strong> {data.data_handling_and_storage}</p>
                  <p><strong>Legal Status:</strong> {data.legal_status}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-primary">
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
