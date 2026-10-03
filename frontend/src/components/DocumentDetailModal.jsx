import React, { useState, useEffect } from 'react';
import { X, ExternalLink, BookOpen, ShieldCheck, Copy, Check, Scale } from 'lucide-react';
import { API_BASE } from '../config.js';

export default function DocumentDetailModal({ docId, isOpen, onClose }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If isOpen is provided, use it; otherwise modal is open whenever docId is set
  const open = isOpen !== undefined ? Boolean(isOpen) : Boolean(docId);

  useEffect(() => {
    if (open && docId) {
      setLoading(true);
      fetch(`${API_BASE}/api/sources/${encodeURIComponent(docId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Document not found");
          return res.json();
        })
        .then((data) => setDoc(data))
        .catch((err) => {
          console.error("Error loading document detail:", err);
          setDoc(null);
        })
        .finally(() => setLoading(false));
    } else if (!open) {
      setDoc(null);
    }
  }, [open, docId]);

  // Handle ESC key to close modal & lock body scroll
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopyCitation = () => {
    if (!doc) return;
    const citationText = `${doc.statute}, ${doc.section_rule} — "${doc.title}" [${doc.id}]. Authority: ${doc.authority}. URL: ${doc.official_url}`;
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-dialog modal-dialog-lg">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(31, 95, 75, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-accent)',
              flexShrink: 0,
            }}>
              <Scale size={18} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <code style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-accent)' }}>{docId}</code>
                {doc?.category && (
                  <span className="badge" style={{ textTransform: 'uppercase', fontSize: '0.625rem' }}>
                    {doc.category}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {doc?.statute || "Statutory Provision Detail"}
              </h3>
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
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <div className="spinner" style={{ width: '28px', height: '28px' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Loading authoritative statutory text...
              </p>
            </div>
          ) : doc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Provision Header Info */}
              <div style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-gold)', letterSpacing: '0.05em' }}>
                      {doc.section_rule}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>
                      {doc.title}
                    </h4>
                  </div>
                  <span className="badge badge-emerald" style={{ flexShrink: 0 }}>
                    {doc.jurisdiction} Law
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>Authority:</span>
                    <span>{doc.authority}</span>
                  </div>
                  {doc.effective_date && (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>Effective:</span>
                      <span>{doc.effective_date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Statutory Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <BookOpen size={14} color="var(--color-brand-emerald-light)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Statutory Language &amp; Practical Legal Application
                  </span>
                </div>
                <div style={{
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  fontSize: '0.8125rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-line',
                }}>
                  {doc.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p style={{ color: 'var(--color-error-text)', fontSize: '0.875rem' }}>Could not load statutory text for {docId}.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={handleCopyCitation}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}
          >
            {copied ? (
              <>
                <Check size={13} color="var(--color-text-accent)" />
                <span>Citation Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Citation</span>
              </>
            )}
          </button>
          {doc?.official_url && (
            <a
              href={doc.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}
            >
              <span>Official Government Portal</span>
              <ExternalLink size={12} />
            </a>
          )}
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
