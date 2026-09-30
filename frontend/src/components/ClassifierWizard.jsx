import React, { useState } from 'react';
import { FlaskConical, Zap, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Beaker } from 'lucide-react';

const PRESETS = [
  {
    label: "Triphala Churna",
    sublabel: "Classical",
    data: {
      product_name: "Triphala Churna",
      intended_use: "therapeutic",
      is_in_authoritative_texts: true,
      processing_nature: "classical",
      has_synthetic_additives: false
    }
  },
  {
    label: "Bacopa Extract",
    sublabel: "Phytopharmaceutical",
    data: {
      product_name: "Standardized Bacopa Neuro-Extract (4 Markers)",
      intended_use: "therapeutic",
      is_in_authoritative_texts: false,
      processing_nature: "purified_fraction_with_markers",
      has_synthetic_additives: false
    }
  },
  {
    label: "Herbal Cough Syrup",
    sublabel: "Proprietary",
    data: {
      product_name: "Polyherbal Cough Relief Formula",
      intended_use: "therapeutic",
      is_in_authoritative_texts: false,
      processing_nature: "aqueous_alcoholic_extract",
      has_synthetic_additives: false
    }
  },
  {
    label: "Ayurveda Health Drink",
    sublabel: "Dietary",
    data: {
      product_name: "Ayur-Digestive Botanical Infusion",
      intended_use: "dietary",
      is_in_authoritative_texts: true,
      processing_nature: "classical",
      has_synthetic_additives: false
    }
  },
  {
    label: "Kumkumadi Serum",
    sublabel: "Cosmetic",
    data: {
      product_name: "Kumkumadi Facial Glow Serum",
      intended_use: "cosmetic",
      is_in_authoritative_texts: false,
      processing_nature: "aqueous_alcoholic_extract",
      has_synthetic_additives: false
    }
  }
];

import IPRouterSection from './IPRouterSection.jsx';

function ResultCard({ result, onOpenEscalation }) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Category Header */}
      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.125rem 1.25rem',
      }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Evaluation — {result.product_name}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {result.category}
          </h3>
          <code style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border-strong)',
            color: 'var(--color-text-secondary)',
            flexShrink: 0,
          }}>
            {result.category_code}
          </code>
        </div>
      </div>

      {/* 3 High-Level Regulatory Summary Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem' }}>
        <div className="info-row">
          <div className="info-row-label">Statute &amp; Licensing</div>
          <div className="info-row-value" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            {result.governing_law}
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#34d399', fontWeight: 600, marginTop: '0.25rem' }}>
            Auth: {result.licensing_authority}
          </div>
        </div>
        <div className="info-row">
          <div className="info-row-label">Patentability Posture</div>
          <div className="info-row-value">
            <span className="badge badge-amber">{result.patentability?.status}</span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
            {result.patentability?.relevant_sections?.join(', ')}
          </p>
        </div>
        <div className="info-row">
          <div className="info-row-label">ABS Biodiversity Form</div>
          <div className="info-row-value">
            <span className="badge" style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)', fontSize: '0.6875rem' }}>
              {result.abs_compliance?.form_type}
            </span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {result.abs_compliance?.statutory_provisions?.join(', ')}
          </p>
        </div>
      </div>

      {/* Key Actionable Takeaway Box */}
      <div style={{
        background: 'var(--color-bg-base)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1rem',
        fontSize: '0.75rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>Recommended IP Prosecution Strategy: </strong>
        {result.patentability?.recommended_ip_strategy}
      </div>

      {/* Section 3(p) Detailed Analysis Accordion */}
      <details className="sakti-accordion">
        <summary>
          <span>Section 3(p) Patentability &amp; ABS Compliance Breakdown</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-brand-emerald-light)' }}>View Details ▾</span>
        </summary>
        <div className="accordion-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
              Patentability Assessment:
            </h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {result.patentability?.assessment}
            </p>
          </div>
          <div>
            <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
              ABS &amp; Biological Diversity Compliance:
            </h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {result.abs_compliance?.guidance}
            </p>
          </div>
        </div>
      </details>

      {/* Warnings */}
      {result.warnings?.length > 0 && (
        <div style={{
          background: 'rgba(220,38,38,0.07)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.875rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {result.warnings.map((w, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={14} color="#f87171" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.8125rem', color: '#fca5a5', lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Path IP Protection Engine */}
      <IPRouterSection result={result} onOpenEscalation={onOpenEscalation} />
    </div>
  );
}

export default function ClassifierWizard({ onClassify, result, loading, onOpenEscalation }) {
  const [formData, setFormData] = useState({
    product_name: "Novel Herbal Formulation",
    intended_use: "therapeutic",
    is_in_authoritative_texts: false,
    processing_nature: "aqueous_alcoholic_extract",
    has_synthetic_additives: false
  });

  const handleApplyPreset = (preset) => {
    setFormData(preset.data);
    onClassify(preset.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClassify(formData);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }} className="lg:grid-cols-[420px_1fr]">

      {/* ── Form Panel ── */}
      <div className="card" style={{ alignSelf: 'start' }}>
        {/* Panel Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(5,150,105,0.12)',
              border: '1px solid rgba(5,150,105,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FlaskConical size={16} color="var(--color-brand-emerald-light)" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                Formulation Classifier
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>Rule-Based Engine</p>
            </div>
          </div>
          <span className="badge badge-amber" style={{ flexShrink: 0 }}>Rule Engine</span>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Determines regulatory classification and statutory IPR &amp; ABS posture under Indian law.
        </p>

        {/* Presets */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p className="section-eyebrow">Quick Demo Presets</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.375rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-default)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-brand-emerald)';
                  e.currentTarget.style.background = 'rgba(5,150,105,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border-default)';
                  e.currentTarget.style.background = 'var(--color-bg-elevated)';
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{p.label}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>{p.sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" style={{ marginBottom: '1.25rem' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Product Name */}
          <div>
            <label className="form-label" htmlFor="product-name">Product / Formulation Name</label>
            <input
              id="product-name"
              type="text"
              className="form-input"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
            />
          </div>

          {/* Intended Use */}
          <div>
            <label className="form-label" htmlFor="intended-use">1. Intended Commercial &amp; Health Use</label>
            <select
              id="intended-use"
              className="form-select"
              value={formData.intended_use}
              onChange={(e) => setFormData({ ...formData, intended_use: e.target.value })}
            >
              <option value="therapeutic">Therapeutic — Treating, curing, or preventing disease</option>
              <option value="dietary">Dietary Wellness / Nutrition — Food supplement / Ayurveda Aahar</option>
              <option value="cosmetic">Cosmetic — Cleansing, beautifying, external skin/hair care</option>
            </select>
          </div>

          {/* Classical Texts Toggle */}
          <div>
            <label className="form-label">2. Documented in First Schedule Classical Texts?</label>
            <div className="toggle-group" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button
                type="button"
                className={`toggle-btn ${formData.is_in_authoritative_texts ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, is_in_authoritative_texts: true })}
              >
                Yes — Charaka, Sushruta, etc.
              </button>
              <button
                type="button"
                className={`toggle-btn ${!formData.is_in_authoritative_texts ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, is_in_authoritative_texts: false })}
              >
                No / Modified / Proprietary
              </button>
            </div>
          </div>

          {/* Processing Nature */}
          <div>
            <label className="form-label" htmlFor="processing-nature">3. Processing / Extraction Method</label>
            <select
              id="processing-nature"
              className="form-select"
              value={formData.processing_nature}
              onChange={(e) => setFormData({ ...formData, processing_nature: e.target.value })}
            >
              <option value="classical">Traditional Classical — Kwath, Churna, Taila, Asava, Bhasma</option>
              <option value="aqueous_alcoholic_extract">Standard Extract / Admixture — Aqueous/Alcoholic extract</option>
              <option value="purified_fraction_with_markers">Purified Fraction with ≥ 4 Bioactive Markers (Phyto)</option>
            </select>
          </div>

          {/* Synthetic Additives Checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            cursor: 'pointer',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            transition: 'border-color 0.15s ease',
          }}>
            <input
              type="checkbox"
              checked={formData.has_synthetic_additives}
              onChange={(e) => setFormData({ ...formData, has_synthetic_additives: e.target.checked })}
              style={{ width: '15px', height: '15px', marginTop: '1px', accentColor: 'var(--color-brand-emerald)', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
              Contains synthetic vitamins, minerals, or modern chemical APIs
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Classifying...</span>
              </>
            ) : (
              <>
                <Beaker size={16} strokeWidth={2} />
                <span>Evaluate Formulation &amp; IPR Posture</span>
                <ChevronRight size={15} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Result Panel ── */}
      <div className="card" style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="empty-state">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--color-border-strong)',
                borderTopColor: 'var(--color-brand-emerald)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                Analysing formulation...
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Applying regulatory classification rules
              </p>
            </div>
          </div>
        ) : result ? (
          <ResultCard result={result} onOpenEscalation={onOpenEscalation} />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FlaskConical size={22} color="var(--color-text-muted)" strokeWidth={1.5} />
            </div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              No Formulation Evaluated Yet
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', maxWidth: '320px', lineHeight: 1.6 }}>
              Complete the form or select a quick preset to see regulatory classification and IPR/ABS guidance.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
