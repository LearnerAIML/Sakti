import React from 'react';
import { Activity, Globe, MapPin, UserCheck, Sparkles, Sun, Moon, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Header({
  jurisdiction,
  setJurisdiction,
  systemStatus,
  onOpenEscalation,
  theme,
  setTheme,
}) {
  const { lang, setLang, t, isHindi } = useLanguage();
  const isHealthy = systemStatus?.status === 'healthy';
  const docCount = systemStatus?.corpus_documents_loaded;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const toggleLanguage = () => {
    setLang(lang === 'hi' ? 'en' : 'hi');
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--color-border-subtle)',
      background: 'var(--color-bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      <div className="container" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.875rem', flexWrap: 'wrap' }}>

          {/* ── Brand Logo & Title ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <img
              src="/app/app-icon.png"
              alt="SAKTI Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                objectFit: 'contain',
                flexShrink: 0,
                border: '1px solid var(--color-border-default)',
              }}
            />

            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}>
                {t('app_title')}
              </h1>
              <p style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                marginTop: '0.15rem',
                lineHeight: 1.3,
                letterSpacing: '0.01em',
              }}>
                {t('app_subtitle')}
              </p>
            </div>
          </div>

          {/* ── Action Controls & Switches ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

            {/* Feature 7: Language Switcher (हिन्दी / English) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="btn btn-secondary btn-sm"
              title={isHindi ? "Switch to English" : "Switch to Hindi (हिन्दी)"}
            >
              <Languages size={13} />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>

            {/* Feature 6: Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.6875rem',
                padding: '0.35rem 0.6rem',
              }}
              title={theme === 'dark' ? t('light_mode') : t('dark_mode')}
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={13} color="#f59e0b" />
                  <span className="hidden sm:inline">{t('light_mode')}</span>
                </>
              ) : (
                <>
                  <Moon size={13} color="#6366f1" />
                  <span className="hidden sm:inline">{t('dark_mode')}</span>
                </>
              )}
            </button>

            {/* Expert Escalation Button */}
            {onOpenEscalation && (
              <button
                type="button"
                onClick={() => onOpenEscalation()}
                className="btn btn-secondary btn-sm"
                title="Request human IP facilitator or patent agent review"
              >
                <UserCheck size={12} />
                <span className="hidden sm:inline">{t('expert_review')}</span>
              </button>
            )}

            {/* Status Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.65rem',
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
                {docCount ? `${docCount} ${t('statutes_count')}` : t('api_active')}
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
                type="button"
                onClick={() => setJurisdiction('India')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.35rem 0.65rem',
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
                <span>{t('india')}</span>
              </button>
              <button
                type="button"
                onClick={() => setJurisdiction('International')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.35rem 0.65rem',
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
                <span>{t('international')}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
