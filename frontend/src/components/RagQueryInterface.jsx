import React, { useState, useEffect, useRef } from 'react';
import {
  Scale,
  Send,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
  ChevronRight,
  ArrowRight,
  Mic,
  MicOff,
  Globe,
  MapPin,
  Columns,
  Languages,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

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

const SUPPORTED_LANGS = [
  { code: "en", name: "English", voice: "en-IN" },
  { code: "hi", name: "हिन्दी (Hindi)", voice: "hi-IN" },
  { code: "gu", name: "ગુજરાતી (Gujarati)", voice: "gu-IN" },
  { code: "mr", name: "मराठी (Marathi)", voice: "mr-IN" },
  { code: "ta", name: "தமிழ் (Tamil)", voice: "ta-IN" },
  { code: "te", name: "తెలుగు (Telugu)", voice: "te-IN" },
  { code: "bn", name: "বাংলা (Bengali)", voice: "bn-IN" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)", voice: "kn-IN" },
  { code: "ml", name: "മലയാളം (Malayalam)", voice: "ml-IN" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", voice: "pa-IN" },
];

// Helper: Confidence Badge
function ConfidenceBadge({ confidence, isAbstained }) {
  if (isAbstained) {
    return (
      <span className="badge badge-amber">Safe Abstention</span>
    );
  }
  const styles = {
    High: { bg: 'rgba(31, 95, 75,0.12)', color: 'var(--color-text-accent)', border: 'rgba(31, 95, 75,0.35)' },
    Medium: { bg: 'rgba(37,99,235,0.12)', color: 'var(--color-info-text)', border: 'rgba(37,99,235,0.35)' },
    Low: { bg: 'rgba(154, 106, 18,0.12)', color: 'var(--color-text-gold)', border: 'rgba(154, 106, 18,0.35)' },
  };
  const s = styles[confidence] || styles.Low;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      Confidence: {confidence}
    </span>
  );
}

// Helper: Citation Card
function CitationCard({ citation, onSelectDoc }) {
  const isVerified = Boolean(citation.last_verified);

  return (
    <div
      style={{
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
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(31, 95, 75,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-default)'}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <button
            type="button"
            onClick={() => onSelectDoc && onSelectDoc(citation.id)}
            className={`trust-chip ${isVerified ? '' : 'unverified'}`}
            style={{ margin: 0 }}
          >
            {citation.id}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              fontSize: '0.625rem',
              padding: '0.1rem 0.5rem',
              borderRadius: '999px',
              background: 'var(--color-bg-base)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-default)',
              fontWeight: 600,
            }}>
              {citation.relevance_score ? `${(citation.relevance_score * 100).toFixed(0)}% match` : 'Relevant'}
            </span>
            {isVerified ? (
              <span className="badge badge-emerald" style={{ fontSize: '0.625rem', padding: '0.05rem 0.35rem' }}>
                Verified
              </span>
            ) : (
              <span className="badge badge-amber" style={{ fontSize: '0.625rem', padding: '0.05rem 0.35rem' }}>
                Curated
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4, marginBottom: '0.125rem' }}>
          {citation.statute}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-gold)', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.25rem' }}>
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
            color: 'var(--color-brand-emerald-light)',
            borderColor: 'rgba(31, 95, 75, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <FileText size={11} />
          <span>Full Statute</span>
          <ChevronRight size={10} />
        </button>

        {citation.official_url && (
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
          >
            <span>Official Record</span>
            <ExternalLink size={10} strokeWidth={2.5} />
          </a>
        )}
      </div>
    </div>
  );
}

// Helper: Trust Panel component
function TrustPanel({ response, onSelectDoc }) {
  const { t } = useLanguage();
  if (!response) return null;

  const cites = response.citations || [];
  const byId = Object.fromEntries(cites.map(c => [c.id, c]));
  const verifiedCount = cites.filter(c => c.last_verified).length;
  const dates = cites.map(c => c.last_verified).filter(Boolean).sort();
  const latestDate = dates.length ? dates[dates.length - 1] : null;

  // Reason for confidence
  let confidenceReason = response.confidence_reason;
  if (!confidenceReason) {
    if (response.is_abstained) {
      confidenceReason = "Retrieved statutory provisions were insufficient to establish authoritative ground truth; SAKTI strictly abstained instead of hallucinating.";
    } else {
      const topScore = cites.length ? Math.max(...cites.map(c => c.relevance_score || 0)) : 0;
      confidenceReason = `Top retrieval score ${(topScore * 100).toFixed(0)}% via ${response.retrieval_mode || 'dense'} retrieval; ${cites.length} citations verified against legal corpus (${String(response.citation_check || 'all_verified').replace(/_/g, ' ')}).`;
      if (response.retrieval_mode === 'keyword') {
        confidenceReason += " Keyword lexical fallback was utilized, so confidence is capped.";
      }
    }
  }

  const vBadge = response.is_abstained ? (
    <span className="badge badge-amber">{t('safe_abstention')}</span>
  ) : !cites.length ? (
    <span className="badge" style={{ background: 'rgba(220, 38, 38, 0.12)', color: 'var(--color-error-text)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
      Unverified: No Citations
    </span>
  ) : response.citation_check === 'all_verified' ? (
    <span className="badge badge-emerald">{t('citations_verified')}</span>
  ) : (
    <span className="badge badge-amber">{t('unverified_citations')}</span>
  );

  return (
    <div style={{
      background: 'var(--color-bg-base)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.875rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.625rem',
      marginTop: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <b style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('trust_panel_title')}
          </b>
          {vBadge}
          <span className="badge badge-slate" style={{ fontSize: '0.6875rem' }}>
            {response.retrieval_mode || 'dense'} retrieval
          </span>
          <span className="badge badge-slate" style={{ fontSize: '0.6875rem' }}>
            {response.generation_mode || 'grounded'}
          </span>
        </div>

        <ConfidenceBadge confidence={response.confidence} isAbstained={response.is_abstained} />
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {confidenceReason}
      </p>

      {cites.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)',
        }}>
          <div>
            <b>{t('click_source_hint')}</b>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25rem', marginLeft: '0.35rem', verticalAlign: 'middle' }}>
              {cites.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectDoc && onSelectDoc(c.id)}
                  className={`trust-chip ${c.last_verified ? '' : 'unverified'}`}
                  title={`${c.statute} - ${c.section_rule}`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>{t('corpus_verified_date')}: </span>
            <b style={{ color: 'var(--color-text-secondary)' }}>
              {latestDate || 'Continuous curation'}
            </b>
            <span> · {verifiedCount} of {cites.length} cited statutes manually verified against official gazette texts.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Text Renderer with clickable inline [ID] chips
function TextWithInlineCitations({ text, citations, onSelectDoc }) {
  if (!text) return null;

  const citeMap = citations ? Object.fromEntries(citations.map(c => [c.id, c])) : {};

  // Regex matches [IN-PAT-SEC-003-P] or [INT-TRIPS-ART-027]
  const regex = /\[((?:IN|INT)-[A-Z0-9-]+)\]/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const preText = text.substring(lastIndex, match.index);
    if (preText) {
      parts.push(<span key={`text-${lastIndex}`}>{preText}</span>);
    }

    const docId = match[1];
    const citeObj = citeMap[docId];
    const isVerified = citeObj ? Boolean(citeObj.last_verified) : true;
    const isMissing = !citeObj;

    parts.push(
      <button
        key={`chip-${match.index}`}
        type="button"
        onClick={() => onSelectDoc && onSelectDoc(docId)}
        className={`trust-chip ${isMissing ? 'missing' : isVerified ? '' : 'unverified'}`}
        title={citeObj ? `${citeObj.statute} - ${citeObj.section_rule}` : `Statute provision ${docId} (click to view)`}
      >
        <span>[{docId}]</span>
      </button>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return (
    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
      {parts}
    </div>
  );
}

export default function RagQueryInterface({
  jurisdiction,
  onQuery,
  response,
  loading,
  onOpenEscalation,
  onSelectDoc,
}) {
  const { t, lang: appLang } = useLanguage();

  const [queryText, setQueryText] = useState("");
  const [showSamples, setShowSamples] = useState(true);
  const [copied, setCopied] = useState(false);

  // Jurisdiction & Comparison Mode state
  const [viewMode, setViewMode] = useState("single"); // "single" | "compare"
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [compareError, setCompareError] = useState(null);

  // Language & Voice State
  const [selectedLanguage, setSelectedLanguage] = useState("auto"); // "auto" uses appLang
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  // Bhashini State
  const [bhashiniConfigured, setBhashiniConfigured] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [bhashiniTranslation, setBhashiniTranslation] = useState(null);

  const recognitionRef = useRef(null);

  const effectiveLang = selectedLanguage === "auto" ? appLang : selectedLanguage;

  // Check if Bhashini is configured
  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => {
        if (data && data.bhashini_configured) {
          setBhashiniConfigured(true);
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const samples = jurisdiction === 'International' ? SAMPLE_QUERIES.International : SAMPLE_QUERIES.India;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    if (viewMode === "compare") {
      executeCompare(queryText);
    } else {
      onQuery(queryText, effectiveLang);
    }
  };

  const handleSelectSample = (sample) => {
    setQueryText(sample);
    if (viewMode === "compare") {
      executeCompare(sample);
    } else {
      onQuery(sample, effectiveLang);
    }
  };

  const executeCompare = async (text) => {
    setCompareLoading(true);
    setCompareError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          language: effectiveLang,
          top_k: 4,
        }),
      });
      if (!res.ok) throw new Error("Comparative legal synthesis failed");
      const data = await res.json();
      setCompareData(data);
    } catch (err) {
      console.error("Comparison error:", err);
      setCompareError(err.message || "Failed to run comparative query");
    } finally {
      setCompareLoading(false);
    }
  };

  // Browser SpeechRecognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voice_unsupported'));
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langObj = SUPPORTED_LANGS.find(l => l.code === effectiveLang);
      recognition.lang = langObj ? langObj.voice : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQueryText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(t('mic_denied'));
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech init error:", err);
      setIsRecording(false);
    }
  };

  // Bhashini Translation Trigger
  const handleBhashiniTranslate = async (sourceText) => {
    if (!sourceText) return;
    setTranslating(true);
    try {
      const targetLang = effectiveLang === 'en' ? 'hi' : effectiveLang;
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText.replace(/\[[A-Z0-9-]+\]/g, ""),
          target: targetLang,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Bhashini translation failed");
      }
      const data = await res.json();
      setBhashiniTranslation(data.translation);
    } catch (e) {
      alert(e.message || "Bhashini translation failed");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Query Input Card ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
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
              <Scale size={16} color="var(--color-info-text)" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {t('query_title')}
              </h2>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                {t('query_subtitle')}
              </p>
            </div>
          </div>

          {/* Controls Bar: Side-by-side mode switch + Language selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

            {/* View Mode Toggle: Single vs Compare Both */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}>
              <button
                type="button"
                onClick={() => setViewMode("single")}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === "single" ? 'var(--color-brand-emerald)' : 'transparent',
                  color: viewMode === "single" ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {jurisdiction}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compare")}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === "compare" ? '#2563eb' : 'transparent',
                  color: viewMode === "compare" ? 'white' : 'var(--color-text-muted)',
                }}
              >
                <Columns size={11} />
                <span>{t('compare_both')}</span>
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Languages size={13} color="var(--color-text-muted)" />
              <select
                className="form-select"
                style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', height: '28px' }}
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                aria-label="Synthesis Language"
              >
                <option value="auto">Language: Follow UI ({effectiveLang.toUpperCase()})</option>
                {SUPPORTED_LANGS.map(l => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              id="query-input"
              rows={3}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={`${t('query_placeholder')} ${viewMode === 'compare' ? 'India & International' : jurisdiction} legal provisions...`}
              className="form-textarea"
              style={{ resize: 'vertical', minHeight: '80px', paddingRight: '3rem' }}
            />

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={isRecording ? 'mic-recording' : ''}
              style={{
                position: 'absolute',
                right: '0.75rem',
                bottom: '0.75rem',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isRecording ? '#dc2626' : 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-strong)',
                color: isRecording ? 'white' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isRecording ? t('listening') : t('speak_btn')}
            >
              {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          </div>

          {speechError && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-error-text)' }}>
              {speechError}
            </div>
          )}

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
              <span>{t('sample_queries')}</span>
              {showSamples ? <ChevronUp size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
            </button>

            {/* Submit Button */}
            <button
              id="ask-sakti-btn"
              type="submit"
              disabled={loading || compareLoading || !queryText.trim()}
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
            >
              {loading || compareLoading ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>{t('synthesizing')}</span>
                </>
              ) : (
                <>
                  <Send size={14} strokeWidth={2.5} />
                  <span>{viewMode === 'compare' ? t('compare_both') : t('ask_sakti')}</span>
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
                {t('sample_queries')}
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
                    e.currentTarget.style.background = 'rgba(31, 95, 75,0.06)';
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

      {/* ── Loading Spinner State ── */}
      {(loading || compareLoading) && (
        <div className="card" style={{ padding: '2.5rem' }}>
          <div className="empty-state" style={{ padding: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-border-strong)',
              borderTopColor: 'var(--color-info-text)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              {viewMode === 'compare' ? 'Retrieving and synthesizing India & International provisions simultaneously...' : t('synthesizing')}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Grounding citations in official statutory database
            </p>
          </div>
        </div>
      )}

      {/* ── SINGLE VIEW RESPONSE PANEL ── */}
      {viewMode === "single" && !loading && response && (
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
                {t('grounded_response')}
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                "{response.query}"
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(response.answer);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                title="Copy answer"
              >
                {copied ? <Check size={12} color="var(--color-text-accent)" /> : <Copy size={12} />}
                <span>{copied ? t('copied') : t('copy')}</span>
              </button>

              <ConfidenceBadge confidence={response.confidence} isAbstained={response.is_abstained} />
            </div>
          </div>

          {/* Answer Text with Clickable Inline Citations */}
          <div style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.125rem 1.25rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
          }}>
            <TextWithInlineCitations
              text={response.answer}
              citations={response.citations}
              onSelectDoc={onSelectDoc}
            />
          </div>

          {/* Feature 2: Dedicated Trust Panel */}
          <TrustPanel response={response} onSelectDoc={onSelectDoc} />

          {/* Bhashini optional translation button */}
          {bhashiniConfigured && !response.is_abstained && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleBhashiniTranslate(response.answer)}
                disabled={translating}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Languages size={13} />
                <span>{translating ? t('translating') : `${t('bhashini_translate')} (${effectiveLang === 'en' ? 'hi' : effectiveLang})`}</span>
              </button>
              {bhashiniTranslation && (
                <div style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.875rem 1rem',
                  background: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  color: 'var(--color-text-primary)'
                }}>
                  <b style={{ color: 'var(--color-brand-emerald-light)' }}>Bhashini ULCA Translation:</b>
                  <p style={{ marginTop: '0.375rem', whiteSpace: 'pre-wrap' }}>{bhashiniTranslation}</p>
                </div>
              )}
            </div>
          )}

          {/* Citations Grid */}
          {response.citations?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <BookOpen size={14} color="var(--color-text-muted)" strokeWidth={2} />
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                  {t('sources_cited')} — {response.citations.length}
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
              background: 'rgba(154, 106, 18, 0.08)',
              border: '1px solid rgba(154, 106, 18, 0.25)',
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
                <span>{t('request_expert_btn')}</span>
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

      {/* ── FEATURE 3: SIDE-BY-SIDE INDIA VS INTERNATIONAL COMPARATIVE VIEW ── */}
      {viewMode === "compare" && !compareLoading && compareData && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="card" style={{ background: 'var(--color-bg-surface)', borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {t('side_by_side_title')}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {t('side_by_side_desc')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1rem',
          }}>

            {/* Left Column: India Jurisdiction */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid var(--color-brand-emerald)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={15} color="var(--color-brand-emerald-light)" />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {t('india_column')}
                  </h4>
                </div>
                <ConfidenceBadge confidence={compareData.india?.confidence} isAbstained={compareData.india?.is_abstained} />
              </div>

              <div style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
              }}>
                <TextWithInlineCitations
                  text={compareData.india?.answer}
                  citations={compareData.india?.citations}
                  onSelectDoc={onSelectDoc}
                />
              </div>

              <TrustPanel response={compareData.india} onSelectDoc={onSelectDoc} />

              {compareData.india?.citations?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    India Legal Citations ({compareData.india.citations.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {compareData.india.citations.map((c, i) => (
                      <CitationCard key={i} citation={c} onSelectDoc={onSelectDoc} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: International Jurisdiction */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid #2563eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={15} color="var(--color-info-text)" />
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {t('international_column')}
                  </h4>
                </div>
                <ConfidenceBadge confidence={compareData.international?.confidence} isAbstained={compareData.international?.is_abstained} />
              </div>

              <div style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
              }}>
                <TextWithInlineCitations
                  text={compareData.international?.answer}
                  citations={compareData.international?.citations}
                  onSelectDoc={onSelectDoc}
                />
              </div>

              <TrustPanel response={compareData.international} onSelectDoc={onSelectDoc} />

              {compareData.international?.citations?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    International Legal Citations ({compareData.international.citations.length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {compareData.international.citations.map((c, i) => (
                      <CitationCard key={i} citation={c} onSelectDoc={onSelectDoc} />
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
