import React, { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, UserCheck, BookOpen, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const PRESETS = {
  classical: {
    product_name: "Ashwagandha Rasayana Churna",
    intended_use: "therapeutic",
    is_in_authoritative_texts: true,
    processing_nature: "classical",
    has_synthetic_additives: false,
    has_novel_technical_feature: false,
    has_brand_identity: true,
    has_novel_packaging: false,
    is_geography_specific: false,
    involves_plant_cultivar: false,
    uses_microorganism: false,
    makes_health_claims: true,
    export_markets: [],
    applicant_type: "indian_company",
    resource_indian: true,
    resource_source: "cultivated",
    purpose: "commercial_product",
    ipr_filing: "none"
  },
  syrup: {
    product_name: "Ginger-Honey Cough Syrup",
    intended_use: "therapeutic",
    is_in_authoritative_texts: false,
    processing_nature: "aqueous_alcoholic_extract",
    has_synthetic_additives: false,
    has_novel_technical_feature: true,
    has_brand_identity: true,
    has_novel_packaging: true,
    is_geography_specific: false,
    involves_plant_cultivar: false,
    uses_microorganism: false,
    makes_health_claims: true,
    export_markets: ["US"],
    applicant_type: "indian_company",
    resource_indian: true,
    resource_source: "wild",
    purpose: "commercial_product",
    ipr_filing: "india"
  },
  cosmetic: {
    product_name: "Kumkumadi Glow Face Oil",
    intended_use: "cosmetic",
    is_in_authoritative_texts: true,
    processing_nature: "classical",
    has_synthetic_additives: false,
    has_novel_technical_feature: false,
    has_brand_identity: true,
    has_novel_packaging: true,
    is_geography_specific: false,
    involves_plant_cultivar: false,
    uses_microorganism: false,
    makes_health_claims: false,
    export_markets: ["EU"],
    applicant_type: "indian_company",
    resource_indian: true,
    resource_source: "codified_formulation",
    purpose: "commercial_product",
    ipr_filing: "none"
  },
  phyto: {
    product_name: "Standardized Bacopa Neuro-Extract (4 Markers)",
    intended_use: "therapeutic",
    is_in_authoritative_texts: false,
    processing_nature: "purified_fraction_with_markers",
    has_synthetic_additives: false,
    has_novel_technical_feature: true,
    has_brand_identity: true,
    has_novel_packaging: false,
    is_geography_specific: false,
    involves_plant_cultivar: false,
    uses_microorganism: false,
    makes_health_claims: true,
    export_markets: ["EU", "US"],
    applicant_type: "indian_company",
    resource_indian: true,
    resource_source: "cultivated",
    purpose: "commercial_product",
    ipr_filing: "both"
  }
};

export default function ProductDossier({ initialData, onSelectDoc, onOpenEscalation }) {
  const { t, isHindi } = useLanguage();

  const [formData, setFormData] = useState(() => {
    return initialData ? { ...PRESETS.classical, ...initialData } : PRESETS.classical;
  });

  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync if initialData changes from ClassifierWizard
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExportMarketChange = (market) => {
    setFormData(prev => {
      const current = prev.export_markets || [];
      const updated = current.includes(market)
        ? current.filter(m => m !== market)
        : [...current, market];
      return { ...prev, export_markets: updated };
    });
  };

  const loadPreset = (presetKey) => {
    if (PRESETS[presetKey]) {
      setFormData({ ...PRESETS[presetKey] });
    }
  };

  const generateDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        throw new Error(`Dossier request failed: ${res.statusText}`);
      }
      const data = await res.json();
      setDossier(data);
    } catch (err) {
      console.error("Dossier generation error:", err);
      setError(err.message || "Failed to generate product dossier");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/dossier/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("PDF download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (formData.product_name || "product").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `SAKTI_dossier_${cleanName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF: " + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const renderSectionDetails = (section) => {
    const d = section.details;
    if (!d) return null;

    if (section.key === "classification") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {d.patentability?.assessment && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {d.patentability.assessment}
            </p>
          )}
          {d.warnings?.length > 0 && d.warnings.map((w, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--color-error-text)',
              background: 'rgba(220, 38, 38, 0.08)',
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(220, 38, 38, 0.2)'
            }}>
              <AlertTriangle size={13} flexShrink={0} />
              <span>{w}</span>
            </div>
          ))}
        </div>
      );
    }

    if (section.key === "ip_router" && d.paths) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.625rem', marginTop: '0.75rem' }}>
          {d.paths.map((p, idx) => {
            const isViable = /viable|required|recommended/i.test(p.status);
            return (
              <div key={idx} style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <b style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>{p.regime}</b>
                  <span className={`badge ${isViable ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: '0.6875rem' }}>
                    {p.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {p.reason}
                </p>
              </div>
            );
          })}
        </div>
      );
    }

    if (section.key === "abs") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}>
          {d.steps?.map((step, idx) => (
            <div key={idx} style={{
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <b style={{ fontSize: '0.8125rem', color: 'var(--color-brand-emerald-light)' }}>{step.step}</b>
                <span className="badge badge-blue" style={{ fontSize: '0.6875rem' }}>{step.authority}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                {step.detail}
              </p>
            </div>
          ))}
          {d.exemptions?.map((e, idx) => (
            <div key={idx} style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-accent)',
              background: 'rgba(31, 95, 75, 0.08)',
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(31, 95, 75, 0.2)'
            }}>
              <b>Exemption Evaluated:</b> {e}
            </div>
          ))}
        </div>
      );
    }

    if (section.key === "tkdl") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {d.what_it_is}
          </p>
          <div style={{ background: 'var(--color-bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-gold)', marginBottom: '0.25rem' }}>
              How Patent Examiners Use TKDL Against Claims:
            </p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.5 }}>
              {d.how_examiners_use_it?.map((it, idx) => <li key={idx}>{it}</li>)}
            </ul>
          </div>
          {d.limits && (
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              Note: {d.limits}
            </p>
          )}
        </div>
      );
    }

    if (section.key === "advertising") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <ul style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.55 }}>
            {d.items?.map((it, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                <span>{it.text}</span>
                {it.cite && (
                  <button
                    type="button"
                    onClick={() => onSelectDoc && onSelectDoc(it.cite)}
                    className="trust-chip"
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {it.cite}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {d.warnings?.map((w, idx) => (
            <div key={idx} style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-gold)',
              background: 'rgba(154, 106, 18, 0.08)',
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(154, 106, 18, 0.2)'
            }}>
              ⚠ {w}
            </div>
          ))}
        </div>
      );
    }

    if (section.key === "international") {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <ul style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.55 }}>
            {d.notes?.map((n, idx) => <li key={idx} style={{ marginBottom: '0.25rem' }}>{n}</li>)}
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Top Header Card ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(31, 95, 75, 0.12)',
                border: '1px solid rgba(31, 95, 75, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileText size={18} color="var(--color-brand-emerald-light)" />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {t('dossier_title')}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '780px', lineHeight: 1.5 }}>
              {t('dossier_desc')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {t('presets_title')}:
            </span>
            <button type="button" onClick={() => loadPreset('classical')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.6875rem' }}>
              {t('preset_triphala')}
            </button>
            <button type="button" onClick={() => loadPreset('syrup')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.6875rem' }}>
              {t('preset_syrup')}
            </button>
            <button type="button" onClick={() => loadPreset('cosmetic')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.6875rem' }}>
              {t('preset_serum')}
            </button>
            <button type="button" onClick={() => loadPreset('phyto')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.6875rem' }}>
              {t('preset_bacopa')}
            </button>
          </div>
        </div>

        {/* ── Form Inputs ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border-subtle)',
        }}>

          {/* Column 1: Core Formulation Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-emerald-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Formulation Definition
            </h4>

            <div>
              <label className="input-label">{t('product_name_label')}</label>
              <input
                type="text"
                className="input"
                value={formData.product_name}
                onChange={e => handleChange('product_name', e.target.value)}
                placeholder="e.g. Ashwagandha Rasayana Churna"
              />
            </div>

            <div>
              <label className="input-label">{t('intended_use_label')}</label>
              <select
                className="form-select"
                value={formData.intended_use}
                onChange={e => handleChange('intended_use', e.target.value)}
              >
                <option value="therapeutic">{t('use_therapeutic')}</option>
                <option value="dietary">{t('use_dietary')}</option>
                <option value="cosmetic">{t('use_cosmetic')}</option>
              </select>
            </div>

            <div>
              <label className="input-label">{t('classical_texts_label')}</label>
              <select
                className="form-select"
                value={formData.is_in_authoritative_texts ? "true" : "false"}
                onChange={e => handleChange('is_in_authoritative_texts', e.target.value === "true")}
              >
                <option value="true">{t('classical_yes')}</option>
                <option value="false">{t('classical_no')}</option>
              </select>
            </div>

            <div>
              <label className="input-label">{t('processing_nature_label')}</label>
              <select
                className="form-select"
                value={formData.processing_nature}
                onChange={e => handleChange('processing_nature', e.target.value)}
              >
                <option value="classical">{t('proc_classical')}</option>
                <option value="aqueous_alcoholic_extract">{t('proc_extract')}</option>
                <option value="purified_fraction_with_markers">{t('proc_purified')}</option>
                <option value="synthetic_derivative">{t('proc_synthetic')}</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.has_synthetic_additives}
                  onChange={e => handleChange('has_synthetic_additives', e.target.checked)}
                />
                <span>Contains synthetic additives / isolated APIs</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.makes_health_claims}
                  onChange={e => handleChange('makes_health_claims', e.target.checked)}
                />
                <span>Makes specific therapeutic or health claims</span>
              </label>
            </div>
          </div>

          {/* Column 2: IP Features & Export */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Intellectual Property Attributes
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.has_novel_technical_feature}
                  onChange={e => handleChange('has_novel_technical_feature', e.target.checked)}
                />
                <span>Novel technical extraction or unexpected synergistic action</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.has_brand_identity}
                  onChange={e => handleChange('has_brand_identity', e.target.checked)}
                />
                <span>Unique brand name / distinctive trademark logo</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.has_novel_packaging}
                  onChange={e => handleChange('has_novel_packaging', e.target.checked)}
                />
                <span>Novel packaging / proprietary ornamental bottle design</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.is_geography_specific}
                  onChange={e => handleChange('is_geography_specific', e.target.checked)}
                />
                <span>Qualities or reputation tied to a specific geographical origin (GI)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.involves_plant_cultivar}
                  onChange={e => handleChange('involves_plant_cultivar', e.target.checked)}
                />
                <span>Involves newly bred plant variety or cultivar (PPV&amp;FR)</span>
              </label>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label className="input-label">Target Export Markets</label>
              <div style={{ display: 'flex', gap: '0.875rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.export_markets?.includes('EU')}
                    onChange={() => handleExportMarketChange('EU')}
                  />
                  <span>European Union (THMPD)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.export_markets?.includes('US')}
                    onChange={() => handleExportMarketChange('US')}
                  />
                  <span>United States (FDA DSHEA)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Column 3: Biodiversity & ABS Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-info-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Biological Diversity &amp; ABS Setup
            </h4>

            <div>
              <label className="input-label">Applicant Entity Type</label>
              <select
                className="form-select"
                value={formData.applicant_type}
                onChange={e => handleChange('applicant_type', e.target.value)}
              >
                <option value="indian_company">Indian Company (Domestic Capital)</option>
                <option value="indian_individual">Indian Individual / Innovator</option>
                <option value="ayush_practitioner">Registered AYUSH Practitioner / Vaidya</option>
                <option value="foreign_participation_company">Company with Foreign Equity/Director (s.3(2))</option>
                <option value="foreign_or_nri">Foreign National / Non-Resident Indian</option>
              </select>
            </div>

            <div>
              <label className="input-label">Biological Resource Source</label>
              <select
                className="form-select"
                value={formData.resource_source}
                onChange={e => handleChange('resource_source', e.target.value)}
              >
                <option value="cultivated">Cultivated Medicinal Plants (Exempt under 2023 Amendment)</option>
                <option value="wild">Wild-Collected from Natural Habitats</option>
                <option value="codified_formulation">Classical Codified Traditional Recipe</option>
                <option value="traded_commodity">Normally Traded as Commodity (NTAC Notice)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Commercial Purpose</label>
              <select
                className="form-select"
                value={formData.purpose}
                onChange={e => handleChange('purpose', e.target.value)}
              >
                <option value="commercial_product">Commercial Scale Manufacturing</option>
                <option value="research">Non-Commercial Scientific Research</option>
                <option value="patent_filing">Patent Application Filing (Section 6 NBA Approval)</option>
              </select>
            </div>

            <div>
              <label className="input-label">IPR Filing Destination</label>
              <select
                className="form-select"
                value={formData.ipr_filing}
                onChange={e => handleChange('ipr_filing', e.target.value)}
              >
                <option value="none">No Patent Filings Planned</option>
                <option value="india">Indian Patent Office Only</option>
                <option value="abroad">International / PCT Filing Abroad</option>
                <option value="both">Both India &amp; International</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-subtle)',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={generateDossier}
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" />
                <span>{t('generating_dossier')}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} strokeWidth={2.5} />
                <span>{t('dossier_btn')}</span>
              </>
            )}
          </button>

          {dossier && (
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="btn btn-secondary btn-lg"
              style={{
                borderColor: 'rgba(31, 95, 75, 0.4)',
                color: 'var(--color-brand-emerald-light)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {pdfLoading ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>{t('download_pdf')}</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            color: 'var(--color-error)',
            fontSize: '0.8125rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* ── Generated Dossier Report ── */}
      {dossier && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Dossier Banner Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <img
                  src="/app/app-icon.png"
                  alt="SAKTI Emblem"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    objectFit: 'contain',
                    border: '1px solid var(--color-border-default)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-brand-emerald-light)', marginBottom: '0.25rem' }}>
                    Authoritative Statutory Blueprint
                  </p>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {dossier.product_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-emerald">{dossier.category}</span>
                    <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{dossier.category_code}</code>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>·</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      Generated: {dossier.generated_at} UTC
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.875rem',
                textAlign: 'right',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand-emerald-light)' }}>
                  {dossier.trust?.sources_cited || 0} Statutory Citations
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                  {dossier.trust?.verified_sources || 0} Manually Verified
                </div>
              </div>
            </div>

            {/* Plain Language Summary */}
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-base)',
              borderLeft: '4px solid var(--color-brand-emerald)',
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              lineHeight: 1.55,
            }}>
              <b style={{ color: 'var(--color-brand-emerald-light)' }}>{t('what_this_means')} </b>
              <span>{t(`plain_${dossier.category_code}`) || dossier.sections[0]?.summary}</span>
            </div>
          </div>

          {/* 6 Comprehensive Sections */}
          {dossier.sections?.map((section, sIdx) => (
            <div key={sIdx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {section.title}
                </h4>
                {section.cites?.length > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    {section.cites.length} legal sources
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {section.summary}
              </p>

              {renderSectionDetails(section)}

              {/* Citations Row with clickable chips */}
              {section.cites?.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.375rem',
                }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '0.25rem' }}>
                    Authoritative Citations:
                  </span>
                  {section.cites.map((c, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => onSelectDoc && onSelectDoc(c.id)}
                      className={`trust-chip ${c.verified ? '' : 'unverified'}`}
                      title={`${c.statute} - ${c.section_rule} (${c.verified ? 'Verified' : 'Curated Summary'})`}
                    >
                      <span>{c.id}</span>
                      <span style={{ fontSize: '0.625rem', opacity: 0.8 }}>
                        ({c.section_rule || c.statute})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Recommended Next Steps */}
          {dossier.next_steps?.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-gold)', marginBottom: '0.75rem' }}>
                {t('next_steps')}
              </h4>
              <ol style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                {dossier.next_steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '0.375rem' }}>
                    {step}
                  </li>
                ))}
              </ol>

              {onOpenEscalation && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Need formal patent drafting, trademark opposition handling, or NBA Form I filing?
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenEscalation({
                      product_name: dossier.product_name,
                      category: dossier.category,
                      context: "Product Dossier Follow-up"
                    })}
                    className="btn btn-secondary btn-sm"
                    style={{
                      borderColor: 'rgba(154, 106, 18, 0.4)',
                      color: 'var(--color-text-gold)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <UserCheck size={13} />
                    <span>Escalate to Registered Patent Agent / Facilitator</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mandatory Disclaimer */}
          {dossier.disclaimer && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}>
              <ShieldCheck size={14} color="var(--color-text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {dossier.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
