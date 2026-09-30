import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

const API_BASE = "";

export default function EscalationModal({ isOpen, onClose, initialData = {} }) {
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    product_name: initialData.product_name || '',
    classification_category: initialData.classification_category || '',
    query: initialData.query || '',
    user_notes: '',
    jurisdiction: initialData.jurisdiction || 'India',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.query.trim()) {
      setError("Please provide a query or description of your case.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          query: formData.query.trim(),
        }),
      });
      if (!res.ok) {
        throw new Error(`Escalation service returned ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Escalation error:", err);
      setError("Unable to submit escalation request. Please verify the API server is reachable.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(217, 119, 6, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}>
              <UserCheck size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Human Expert Review Escalation
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                SIH Problem Statement Facilitator Referral (AYUSH / Patent Agents)
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
          {result ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.15)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: '#34d399',
              }}>
                <CheckCircle2 size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Escalation Request Logged
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  A structured dossier has been prepared for facilitator review.
                </p>
              </div>

              <div style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tracking ID:</span>
                  <code style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fbbf24' }}>{result.request_id}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status:</span>
                  <span className="badge badge-emerald">{result.status || 'Registered'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Jurisdiction:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>{result.jurisdiction}</span>
                </div>
                {result.product_name && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Product:</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>{result.product_name}</span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {result.disclaimer}
              </p>
            </div>
          ) : (
            <form id="escalation-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {error && (
                <div style={{
                  background: 'var(--color-error-bg)',
                  border: '1px solid var(--color-error-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#fca5a5',
                  fontSize: '0.8125rem',
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Innovator / Applicant Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Dr. A. Sharma"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="name@organization.in"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Product / Formulation Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Classical Ashwagandha Synergy"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Jurisdiction</label>
                  <select
                    className="input"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  >
                    <option value="India">India (Patents / BDA / DCA)</option>
                    <option value="International">International (WIPO / PCT / Nagoya)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">
                  Legal / Patent Inquiry Details <span style={{ color: '#f87171' }}>*</span>
                </label>
                <textarea
                  className="input"
                  rows={3}
                  required
                  placeholder="Describe your patentability question, Section 3(p) objections, ABS NBA Form I compliance, or licensing challenge..."
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label className="input-label">Additional Context / Formulation Notes (Optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Ingredients list, extraction methods, clinical claims, or commercial timeline..."
                  value={formData.user_notes}
                  onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem 0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
              }}>
                <ShieldCheck size={14} color="#34d399" style={{ flexShrink: 0 }} />
                <span>
                  Privacy protected under DPDP Act 2023. Requests are stored locally and routed only to designated patent facilitators.
                </span>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          {result ? (
            <button type="button" onClick={handleReset} className="btn btn-primary">
              Done
            </button>
          ) : (
            <>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                form="escalation-form"
                disabled={loading}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit to IP Expert</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
