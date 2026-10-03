import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Network, Search, RotateCcw, BookOpen, ExternalLink, Info, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { API_BASE } from '../config.js';

export default function KnowledgeGraph({ onSelectDoc, onSelectProductClass }) {
  const { t } = useLanguage();
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const svgRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/graph`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch knowledge graph');
        return res.json();
      })
      .then(data => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching graph:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Compute node positions and connections
  const { nodes, edges, pos, totalHeight, nodesById } = useMemo(() => {
    if (!graphData || !graphData.nodes) {
      return { nodes: [], edges: [], pos: {}, totalHeight: 600, nodesById: {} };
    }

    const cols = { product: 0, iptype: 1, law: 2, jurisdiction: 3 };
    const X = [15, 235, 475, 785];
    const W = [190, 205, 270, 130];
    const H = 26;
    const GAP = 7;

    const byKind = (k) => graphData.nodes.filter(n => n.kind === k);
    const posMap = {};
    const nMap = {};

    graphData.nodes.forEach(n => {
      nMap[n.id] = n;
    });

    ['product', 'iptype', 'law', 'jurisdiction'].forEach(k => {
      byKind(k).forEach((n, i) => {
        posMap[n.id] = {
          x: X[cols[k]],
          y: 20 + i * (H + GAP) + (k === 'jurisdiction' ? 180 : 0),
          w: W[cols[k]],
          h: H,
        };
      });
    });

    const maxY = Math.max(...Object.values(posMap).map(p => p.y + p.h), 400);

    return {
      nodes: graphData.nodes,
      edges: graphData.edges,
      pos: posMap,
      totalHeight: maxY + 40,
      nodesById: nMap,
    };
  }, [graphData]);

  // Compute active/connected nodes and edges when a node is selected
  const { activeNodeIds, activeEdgeIndices } = useMemo(() => {
    if (!selectedNodeId || !graphData) {
      return { activeNodeIds: new Set(), activeEdgeIndices: new Set() };
    }

    const activeN = new Set([selectedNodeId]);
    const activeE = new Set();

    // Traverse in both directions
    [['from', 'to'], ['to', 'from']].forEach(([src, dst]) => {
      let frontier = [selectedNodeId];
      while (frontier.length > 0) {
        const next = [];
        graphData.edges.forEach((edge, idx) => {
          if (frontier.includes(edge[src])) {
            activeE.add(idx);
            if (!activeN.has(edge[dst])) {
              activeN.add(edge[dst]);
              next.push(edge[dst]);
            }
          }
        });
        frontier = next;
      }
    });

    return { activeNodeIds: activeN, activeEdgeIndices: activeE };
  }, [selectedNodeId, graphData]);

  // Compute bezier path for edge
  const getEdgePath = (edge) => {
    const a = pos[edge.from];
    const b = pos[edge.to];
    if (!a || !b) return '';
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  const handleNodeClick = (nodeId) => {
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const resetSelection = () => {
    setSelectedNodeId(null);
    setSearchFilter('');
  };

  const selectedNode = selectedNodeId ? nodesById[selectedNodeId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Top Info Card ── */}
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
                <Network size={18} color="var(--color-brand-emerald-light)" />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {t('graph_title')}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '780px', lineHeight: 1.5 }}>
              {t('graph_desc')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {selectedNodeId && (
              <button
                type="button"
                onClick={resetSelection}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem' }}
              >
                <RotateCcw size={12} />
                <span>{t('reset_highlight')}</span>
              </button>
            )}

            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '1.875rem', fontSize: '0.75rem', height: '32px' }}
                placeholder={t('graph_search_placeholder')}
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
              />
              <Search size={13} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
        </div>

        {/* Column Legend */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '190px 205px 270px 130px',
          gap: '20px',
          padding: '0.625rem 0',
          marginTop: '1rem',
          borderTop: '1px solid var(--color-border-subtle)',
          overflowX: 'auto',
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-brand-emerald-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1. {t('graph_col_product')}
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. {t('graph_col_iptype')}
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-info-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            3. {t('graph_col_law')}
          </div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7c5cb8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            4. {t('graph_col_jurisdiction')}
          </div>
        </div>
      </div>

      {/* ── SVG Visualization Canvas ── */}
      <div className="card" style={{ padding: '1rem', overflowX: 'auto', background: 'var(--color-bg-base)' }}>
        {loading && (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <span className="spinner spinner-md" />
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
              Building statutory knowledge graph from legal corpus...
            </p>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--color-error)', padding: '1rem', fontSize: '0.8125rem' }}>
            Error loading knowledge graph: {error}
          </div>
        )}

        {!loading && !error && graphData && (
          <div style={{ minWidth: '940px' }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 940 ${totalHeight}`}
              width="100%"
              height={totalHeight}
              style={{ display: 'block' }}
            >
              {/* Edges */}
              <g className="edges-layer">
                {edges.map((edge, idx) => {
                  const isFiltered = searchFilter && !nodesById[edge.from]?.label.toLowerCase().includes(searchFilter.toLowerCase()) && !nodesById[edge.to]?.label.toLowerCase().includes(searchFilter.toLowerCase());
                  const isActive = activeEdgeIndices.has(idx);
                  const isDim = (selectedNodeId && !isActive) || (searchFilter && isFiltered);

                  return (
                    <path
                      key={idx}
                      className={`sk-edge ${isActive ? 'on' : ''} ${isDim ? 'sk-dim' : ''}`}
                      d={getEdgePath(edge)}
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g className="nodes-layer">
                {nodes.map(node => {
                  const p = pos[node.id];
                  if (!p) return null;

                  const isSelected = selectedNodeId === node.id;
                  const isActive = activeNodeIds.has(node.id);
                  const isSearchMatch = searchFilter && node.label.toLowerCase().includes(searchFilter.toLowerCase());
                  const isDim = (selectedNodeId && !isActive) || (searchFilter && !isSearchMatch);

                  const truncatedLabel = node.label.length > 34 ? node.label.slice(0, 32) + '…' : node.label;

                  return (
                    <g
                      key={node.id}
                      className={`sk-node ${isSelected || isSearchMatch ? 'on' : ''} ${isDim ? 'sk-dim' : ''}`}
                      onClick={() => handleNodeClick(node.id)}
                    >
                      <rect
                        x={p.x}
                        y={p.y}
                        width={p.w}
                        height={p.h}
                        rx={6}
                      />
                      <text
                        x={p.x + 8}
                        y={p.y + 17}
                      >
                        {truncatedLabel}
                      </text>
                      <title>{node.label} ({node.kind})</title>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* ── Selection Details Inspector Panel ── */}
      {selectedNode && (
        <div className="card animate-slide-down" style={{
          borderLeft: '4px solid var(--color-brand-emerald)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-emerald" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
                  {selectedNode.kind}
                </span>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {selectedNode.label}
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Tracing all statutory, regulatory, and jurisdictional links connected to this node.
              </p>
            </div>

            <button
              type="button"
              onClick={resetSelection}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.6875rem' }}
            >
              Clear
            </button>
          </div>

          {/* Associated Corpus Provisions if Law */}
          {selectedNode.docs && selectedNode.docs.length > 0 && (
            <div style={{ marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
                {t('connected_provisions')} ({selectedNode.docs.length})
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {selectedNode.docs.map(docId => (
                  <button
                    key={docId}
                    type="button"
                    onClick={() => onSelectDoc && onSelectDoc(docId)}
                    className="trust-chip"
                    title={`Click to inspect provision ${docId}`}
                  >
                    <BookOpen size={11} />
                    <span>{docId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If Product Class, offer direct navigation to Dossier */}
          {selectedNode.kind === 'product' && onSelectProductClass && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
              <button
                type="button"
                onClick={() => onSelectProductClass(selectedNode.label)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}
              >
                <span>Generate Dossier for "{selectedNode.label}"</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
