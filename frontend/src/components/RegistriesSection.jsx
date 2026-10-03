import React, { useState, useEffect } from 'react';
import { ExternalLink, Landmark, CheckCircle2, Search } from 'lucide-react';
import { API_BASE } from '../config.js';

export default function RegistriesSection({ jurisdiction = "India" }) {
  const [registries, setRegistries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/registries`)
      .then((res) => res.json())
      .then((data) => setRegistries(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading registries:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = registries.filter((r) => {
    const matchesJurisdiction = !jurisdiction || r.jurisdiction === jurisdiction || r.jurisdiction === 'Global' || r.jurisdiction === 'International';
    const matchesSearch = !searchFilter.trim() ||
      r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.authority.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.domain.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesJurisdiction && matchesSearch;
  });

  return (
    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Landmark size={18} color="var(--color-text-gold)" />
            <span>Official Government Registries &amp; Filing Portals</span>
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Verified authoritative statutory databases and patent filing gateways
          </p>
        </div>

        {/* Filter Input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input"
            placeholder="Filter portals..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.75rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Loading government portal links...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '0.875rem',
        }}>
          {filtered.map((reg) => (
            <div
              key={reg.id}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.625rem',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-default)'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem', gap: '0.5rem' }}>
                  <code style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-gold)' }}>{reg.id}</code>
                  <span className="badge badge-emerald" style={{ fontSize: '0.625rem', textTransform: 'uppercase' }}>
                    {reg.jurisdiction}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                  {reg.name}
                </h4>

                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                  {reg.authority}
                </p>

                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {reg.description}
                </p>

                {reg.search_capabilities && (
                  <div style={{
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.6875rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    <strong style={{ color: 'var(--color-text-secondary)' }}>Features: </strong>
                    {reg.search_capabilities}
                  </div>
                )}
              </div>

              <div style={{
                paddingTop: '0.625rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={12} />
                  <span>Official Gateway</span>
                </span>
                <a
                  href={reg.portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(31, 95, 75, 0.12)',
                    color: 'var(--color-brand-emerald-light)',
                    border: '1px solid rgba(31, 95, 75, 0.25)',
                    fontSize: '0.6875rem',
                    padding: '0.25rem 0.625rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>Launch Portal</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
