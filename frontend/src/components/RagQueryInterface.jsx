import React, { useState } from 'react';
import { Scale, Send, ExternalLink, BookOpen, ShieldCheck, ChevronDown, ChevronUp, Copy, Check, FileText, ChevronRight, ArrowRight } from 'lucide-react';

const SAMPLE_QUERIES = {
  India: [
    "Can I patent a herbal cough formulation made from ginger and honey in India?",
    "Does an Indian vaidya or AYUSH practitioner need NBA approval under the 2023 amendment?",
    "What are the clinical trial requirements for a Phytopharmaceutical drug under Rule 122E?",
    "Can an Ayurveda Aahar food product claim to cure or treat diabetes?"
  ],
  International: [
    "What international treaties mandate the disclosure of origin for traditional knowledge in patent applications?",
    "How does the Nagoya Protocol affect commercial export of Indian Ayurvedic medicinal plants?",
    "What are the patent search rules for traditional knowledge under the PCT (Patent Cooperation Treaty)?"
  ]
};

function ConfidenceBadge({ confidence, isAbstained }) {
  if (isAbstained) {
    return (
      <span className="badge badge-amber">Safe Abstention — Out of Scope</span>
    );
  }
  const styles = {
    High: { bg: 'rgba(5,150,105,0.1)', color: '#34d399', border: 'rgba(5,150,105,0.3)' },
    Medium: { bg: 'rgba(37,99,235,0.1)', color: '#60a5fa', border: 'rgba(37,99,235,0.3)' },
    Low: { bg: 'rgba(217,119,6,0.1)', color: '#fbbf24', border: 'rgba(217,119,6,0.3)' },
  };
  const s = styles[confidence] || styles.Low;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      Confidence: {confidence}
    </span>
  );
}

function CitationCard({ citation, onSelectDoc }) {
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.875rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.5rem',
      transition: 'border-color 0.15s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(5,150,105,0.4)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-default)'}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <code style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#34d399' }}>{citation.id}</code>
          <span style={{
            fontSize: '0.625rem',
            padding: '0.1rem 0.5rem',
            borderRadius: '999px',
            background: 'var(--color-bg-base)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border-default)',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {(citation.relevance_score * 100).toFixed(0)}% match
          </span>
        </div>

        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4, marginBottom: '0.125rem' }}>
          {citation.statute}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem' }}>
          {citation.section_rule}
        </p>

        {(citation.title || citation.authority) && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            {citation.title || citation.authority}
          </p>
        )}
      </div>

      <div style={{
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <button
          type="button"
          onClick={() => onSelectDoc && onSelectDoc(citation.id)}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.6875rem',
            padding: '0.2rem 0.5rem',
            color: '#34d399',
            borderColor: 'rgba(5, 150, 105, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <FileText size={11} />
          <span>Full Statute</span>
          <ChevronRight size={10} />
        </button>

        <a
          href={citation.official_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--color-brand-emerald-light)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
        >
          <span>Official Record</span>
          <ExternalLink size={10} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}

export default function RagQueryInterface({
  jurisdiction,
  onQuery,
  response,
  loading,
  onOpenEscalation,
  onSelectDoc
}) {
  const [queryText, setQueryText] = useState("");
  const [showSamples, setShowSamples] = useState(true);
  const [copied, setCopied] = useState(false);

  const samples = jurisdiction === 'International' ? SAMPLE_QUERIES.International : SAMPLE_QUERIES.India;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    onQuery(queryText);
  };

  const handleSelectSample = (sample) => {
    setQueryText(sample);
    onQuery(sample);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Query Input Panel ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Scale size={16} color="#60a5fa" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                IPR &amp; Regulatory Legal Assistant
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                Grounded statutory responses with citation
              </p>
            </div>
          </div>
          <span className="badge badge-blue" style={{ flexShrink: 0 }}>
            {jurisdiction}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              id="query-input"
              rows={3}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={`Ask any IPR, patentability, ABS, or regulatory question under ${jurisdiction} jurisdiction...`}
              className="form-textarea"
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Sample Queries toggle */}
            <button
              type="button"
              onClick={() => setShowSamples(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: '0',
              }}
            >
              <span>Sample queries</span>
              {showSamples ? <ChevronUp size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
            </button>

            {/* Submit Button */}
            <button
              id="ask-sakti-btn"
              type="submit"
              disabled={loading || !queryText.trim()}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Send size={14} strokeWidth={2.5} />
                  <span>Ask SAKTI</span>
                </>
              )}
            </button>
          </div>

          {/* Collapsible Sample Prompts */}
          {showSamples && (
            <div className="animate-slide-down" style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Try a sample question
              </p>
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  style={{
                    padding: '0.5rem 0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: '1px solid var(--color-border-default)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                    textAlign: 'left',
                    lineHeight: 1.5,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-brand-emerald)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.background = 'rgba(5,150,105,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border-default)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="card" style={{ padding: '2.5rem' }}>
          <div className="empty-state" style={{ padding: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-border-strong)',
              borderTopColor: '#60a5fa',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Synthesising statutory response...
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Retrieving grounded citations from legal corpus
            </p>
          </div>
        </div>
      )}

      {/* ── Response Panel ── */}
      {!loading && response && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Response Header */}
          <div style={{
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                Grounded Statutory Response
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                "{response.query}"
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(response.answer);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                title="Copy answer to clipboard"
              >
                {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <ConfidenceBadge confidence={response.confidence} isAbstained={response.is_abstained} />
            </div>
          </div>

          {/* Answer Text */}
          <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.125rem 1.25rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.75,
            whiteSpace: 'pre-line',
          }}>
            {response.answer}
          </div>

          {/* Citations */}
          {response.citations?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <BookOpen size={14} color="var(--color-text-muted)" strokeWidth={2} />
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                  Verified Grounding Citations — {response.citations.length}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {response.citations.map((c, idx) => (
                  <CitationCard key={idx} citation={c} onSelectDoc={onSelectDoc} />
                ))}
              </div>
            </div>
          )}

          {/* Human Escalation Option */}
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
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Require an official opinion or representation before the Indian Patent Office or NBA?
              </div>
              <button
                type="button"
                onClick={() => onOpenEscalation({
                  query: response.query,
                  jurisdiction: jurisdiction,
                })}
                className="btn btn-sm"
                style={{
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>Request Expert Review</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Disclaimer */}
          {response.disclaimer && (
            <div style={{
              paddingTop: '0.875rem',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}>
              <ShieldCheck size={14} color="var(--color-text-muted)" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {response.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
