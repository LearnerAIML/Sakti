import React, { useMemo } from 'react';
import {
  Scale,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

/**
 * Parses inline formatting:
 * - [IN-PAT-SEC-003P] / [INT-...] -> Interactive Trust Chip button
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - `code` -> <code className="mono">
 * - <br> -> <br />
 */
export function renderInlineText(text, citeMap = {}, onSelectDoc) {
  if (!text) return null;

  // Normalize unicode hyphens and dashes to standard ASCII dash
  const cleanText = String(text).replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-');

  // Replace <br> or <br/> with newline placeholder to handle linebreaks
  const lines = cleanText.split(/<br\s*\/?>/gi);
  if (lines.length > 1) {
    return lines.map((line, idx) => (
      <React.Fragment key={idx}>
        {idx > 0 && <br />}
        {renderInlineText(line, citeMap, onSelectDoc)}
      </React.Fragment>
    ));
  }

  // Tokenize string for citations [ID], bold **text**, italic *text*, code `text`
  const regex = /(\[([A-Z0-9_]{2,8}(?:-[A-Z0-9_]+)+)\])|(\*\*(.+?)\*\*)|(\*([^\*]+?)\*)|(`([^`]+?)`)/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanText)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Citation token [ID]
      const docId = match[2];
      const citeObj = citeMap[docId];
      const isVerified = citeObj ? Boolean(citeObj.last_verified) : true;
      const isMissing = !citeObj;

      elements.push(
        <button
          key={`chip-${match.index}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectDoc) onSelectDoc(docId);
          }}
          className={`trust-chip ${isMissing ? 'missing' : isVerified ? '' : 'unverified'}`}
          title={citeObj ? `${citeObj.statute} - ${citeObj.section_rule}` : `Statute provision ${docId} (click to view)`}
          style={{ margin: '0 0.2rem', verticalAlign: 'baseline' }}
        >
          <span>[{docId}]</span>
        </button>
      );
    } else if (match[3]) {
      // Bold **text**
      elements.push(
        <strong key={`bold-${match.index}`} style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
          {renderInlineText(match[4], citeMap, onSelectDoc)}
        </strong>
      );
    } else if (match[5]) {
      // Italic *text*
      elements.push(
        <em key={`italic-${match.index}`} style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
          {renderInlineText(match[6], citeMap, onSelectDoc)}
        </em>
      );
    } else if (match[7]) {
      // Code `text`
      elements.push(
        <code key={`code-${match.index}`} className="mono" style={{ background: 'var(--color-bg-base)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.85em' }}>
          {match[8]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length === 1 ? elements[0] : elements;
}

/**
 * Checks if a line is a markdown table row (contains | )
 */
function isTableRow(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
}

/**
 * Checks if a line is a markdown table separator (e.g. |---|:---|---:|)
 */
function isTableSeparator(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.includes('-') && /^\|[\s\-:|]+\|$/.test(trimmed);
}

/**
 * Parses markdown table lines into headers and row cells
 */
function parseTable(lines) {
  if (lines.length < 2) return null;
  const headerLine = lines[0];
  const sepIndex = lines.findIndex((l, i) => i > 0 && isTableSeparator(l));
  if (sepIndex === -1) return null;

  const splitCells = (line) => {
    // Strip leading and trailing pipes
    const raw = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return raw.split('|').map(c => c.trim());
  };

  const headers = splitCells(headerLine);
  const rows = [];

  for (let i = sepIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (isTableRow(line)) {
      rows.push(splitCells(line));
    }
  }

  return { headers, rows };
}

/**
 * Parses a section body into blocks (tables, numbered steps, lists, paragraphs)
 */
function parseBlocks(rawText) {
  const lines = rawText.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines or lone horizontal dividers
    if (!trimmed || trimmed === '---' || trimmed === '***') {
      i++;
      continue;
    }

    // 1. Table Detection
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
      const tableLines = [line];
      i++;
      while (i < lines.length && isTableRow(lines[i].trim())) {
        tableLines.push(lines[i]);
        i++;
      }
      const tableData = parseTable(tableLines);
      if (tableData) {
        blocks.push({ type: 'table', data: tableData });
        continue;
      }
    }

    // 2. Numbered Step Item (e.g., "1. **Conduct a TKDL Prior-Art Search**" or "1. Step Name")
    const stepMatch = trimmed.match(/^(\d+)\.\s+(\*\*(.+?)\*\*|(.+?))(?:\s*[:–-]\s*(.*))?$/);
    if (stepMatch) {
      const stepNum = stepMatch[1];
      const stepTitle = stepMatch[3] || stepMatch[4] || stepMatch[2];
      const initialDetail = stepMatch[5] || '';
      const subBullets = [];
      i++;

      // Check subsequent lines for sub-bullets or details
      while (i < lines.length) {
        const nextLine = lines[i];
        const nextTrimmed = nextLine.trim();
        if (!nextTrimmed) {
          i++;
          // check if next non-empty line is still a bullet
          if (i < lines.length && /^\s*[*•-]\s+/.test(lines[i])) continue;
          break;
        }
        // If it's a new numbered step, break out
        if (/^\d+\.\s+/.test(nextTrimmed)) break;
        // If it's a heading or divider, break out
        if (nextTrimmed.startsWith('#') || nextTrimmed.startsWith('**') && nextTrimmed.endsWith('**') || nextTrimmed === '---') break;

        // Sub-bullet (* item or - item or • item)
        const bulletMatch = nextTrimmed.match(/^[*•-]\s+(.*)$/);
        if (bulletMatch) {
          subBullets.push(bulletMatch[1]);
          i++;
        } else if (/^\s{2,}/.test(nextLine)) {
          // Indented continuation
          subBullets.push(nextTrimmed);
          i++;
        } else {
          break;
        }
      }

      blocks.push({
        type: 'step',
        num: stepNum,
        title: stepTitle.trim(),
        detail: initialDetail.trim(),
        subBullets
      });
      continue;
    }

    // 3. Bullet List Item (* or - or •)
    if (/^[*•-]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[*•-]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[*•-]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // 4. Subheadings (### or ####)
    if (trimmed.startsWith('###') || trimmed.startsWith('####')) {
      const title = trimmed.replace(/^#+\s*/, '');
      blocks.push({ type: 'subheading', title });
      i++;
      continue;
    }

    // 5. Notice tags ([SAKTI notice: ...])
    if (trimmed.startsWith('[SAKTI notice:')) {
      blocks.push({ type: 'notice', text: trimmed.replace(/^\[SAKTI notice:\s*/i, '').replace(/\]$/, '') });
      i++;
      continue;
    }

    // 6. Regular Paragraph
    const paraLines = [trimmed];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      const nextTrimmed = nextLine.trim();
      if (!nextTrimmed || nextTrimmed === '---' || isTableRow(nextTrimmed) || /^\d+\.\s+/.test(nextTrimmed) || /^[*•-]\s+/.test(nextTrimmed) || nextTrimmed.startsWith('#')) {
        break;
      }
      paraLines.push(nextTrimmed);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

/**
 * High-Level Structured Section Segmenter
 */
function segmentSections(rawAnswer) {
  if (!rawAnswer) return [];

  // Safe Abstention Check
  if (rawAnswer.includes('SAFE ABSTENTION') || rawAnswer.includes('सुरक्षित परिहार')) {
    return [{
      type: 'abstention',
      title: 'Safe Statutory Abstention',
      content: rawAnswer
    }];
  }

  // Define section heading pattern:
  // Matches:
  // ## Summary Answer | ### Summary Answer | **Summary Answer** | ## सारांश
  // ## Applicable Legal Provisions... | ### Applicable Legal Provisions... | **Applicable Legal Provisions...**
  // ## Strategic Guidance & Next Steps | ### Strategic Guidance... | **Strategic Guidance & Next Steps**
  // ## Bottom Line | **Bottom Line** | ### Bottom Line
  const sectionRegex = /(?:^|\n)(?:#{1,4}\s+|\*\*)(Summary Answer|Executive Summary|Applicable Legal Provisions.*?|Statutory.*?Analysis|Strategic Guidance.*?|Next Steps|Bottom Line|Conclusion|सारांश|लागू सांविधिक प्रावधान.*?|रणनीतिक मार्गदर्शन.*?|निष्कर्ष)(?:\*\*|#{0,4})[ \t]*(?:\n|$)/gi;

  const matches = [];
  let match;
  while ((match = sectionRegex.exec(rawAnswer)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      rawTitle: match[1].trim()
    });
  }

  // If no standard section headers were found, treat the whole answer as general sections
  if (matches.length === 0) {
    // Check if separated by ---
    const parts = rawAnswer.split(/\n\s*---\s*\n/).filter(p => p.trim());
    if (parts.length > 1) {
      return parts.map((part, idx) => ({
        type: idx === 0 ? 'summary' : idx === parts.length - 1 ? 'bottom_line' : 'provisions',
        title: idx === 0 ? 'Executive Summary' : idx === parts.length - 1 ? 'Bottom Line Takeaway' : 'Statutory & Legal Analysis',
        content: part.trim()
      }));
    }
    return [{
      type: 'general',
      title: 'Authoritative Legal Analysis',
      content: rawAnswer.trim()
    }];
  }

  const sections = [];

  // Content before the first matched heading (if any)
  if (matches[0].index > 0) {
    const preContent = rawAnswer.substring(0, matches[0].index).trim();
    if (preContent) {
      sections.push({
        type: 'summary',
        title: 'Executive Summary',
        content: preContent
      });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.length;
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : rawAnswer.length;
    const body = rawAnswer.substring(startIndex, endIndex).trim().replace(/^---\s*|\s*---$/g, '').trim();

    const titleLower = current.rawTitle.toLowerCase();
    let type = 'provisions';
    let cleanTitle = current.rawTitle;

    if (titleLower.includes('summary') || titleLower.includes('सारांश')) {
      type = 'summary';
      cleanTitle = current.rawTitle.includes('सारांश') ? 'सारांश (Executive Summary)' : 'Executive Summary';
    } else if (titleLower.includes('strategic') || titleLower.includes('next step') || titleLower.includes('रणनीतिक')) {
      type = 'guidance';
      cleanTitle = current.rawTitle.includes('रणनीतिक') ? 'रणनीतिक मार्गदर्शन एवं आगामी कदम (Strategic Guidance)' : 'Strategic Guidance & Action Plan';
    } else if (titleLower.includes('bottom line') || titleLower.includes('conclusion') || titleLower.includes('निष्कर्ष')) {
      type = 'bottom_line';
      cleanTitle = current.rawTitle.includes('निष्कर्ष') ? 'निष्कर्ष (Bottom Line Takeaway)' : 'Bottom Line Advisory Takeaway';
    } else {
      type = 'provisions';
      cleanTitle = current.rawTitle.includes('प्रावधान') ? 'लागू सांविधिक प्रावधान एवं कानूनी विश्लेषण (Statutory Analysis)' : 'Applicable Legal Provisions & Statutory Analysis';
    }

    sections.push({
      type,
      title: cleanTitle,
      content: body
    });
  }

  return sections;
}

/**
 * Main LegalAnswerRenderer Component
 */
export default function LegalAnswerRenderer({ text, citations = [], onSelectDoc }) {
  const citeMap = useMemo(() => {
    return citations ? Object.fromEntries(citations.map(c => [c.id, c])) : {};
  }, [citations]);

  const sections = useMemo(() => {
    return segmentSections(text);
  }, [text]);

  if (!text) return null;

  return (
    <div className="legal-answer-container">
      {sections.map((sec, secIdx) => {
        const blocks = parseBlocks(sec.content);

        // 1. Safe Abstention Card
        if (sec.type === 'abstention') {
          return (
            <div key={secIdx} className="legal-abstention-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-warning)'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Safe Statutory Abstention
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Hallucination-prevention guardrail active
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
                {renderInlineText(sec.content, citeMap, onSelectDoc)}
              </div>
            </div>
          );
        }

        // 2. Executive Summary Card
        if (sec.type === 'summary') {
          return (
            <div key={secIdx} className="legal-section-card legal-summary-card">
              <div className="legal-section-header">
                <div className="legal-section-title">
                  <Sparkles size={16} color="var(--color-brand-emerald-light)" />
                  <span>{sec.title}</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
                  Direct Legal Assessment
                </span>
              </div>
              <div className="legal-summary-text">
                {blocks.map((block, bi) => (
                  <BlockRenderer key={bi} block={block} citeMap={citeMap} onSelectDoc={onSelectDoc} />
                ))}
              </div>
            </div>
          );
        }

        // 3. Bottom Line Callout Card
        if (sec.type === 'bottom_line') {
          return (
            <div key={secIdx} className="legal-bottom-line-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                <AlertCircle size={16} color="var(--color-text-gold)" />
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-gold)' }}>
                  {sec.title}
                </h4>
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-text-primary)' }}>
                {blocks.map((block, bi) => (
                  <BlockRenderer key={bi} block={block} citeMap={citeMap} onSelectDoc={onSelectDoc} />
                ))}
              </div>
            </div>
          );
        }

        // 4. Strategic Guidance Card
        if (sec.type === 'guidance') {
          const stepBlocks = blocks.filter(b => b.type === 'step');
          const nonStepBlocks = blocks.filter(b => b.type !== 'step');

          return (
            <div key={secIdx} className="legal-section-card">
              <div className="legal-section-header">
                <div className="legal-section-title">
                  <ShieldCheck size={16} color="var(--color-info-text)" />
                  <span>{sec.title}</span>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
                  Actionable Steps
                </span>
              </div>

              {nonStepBlocks.map((block, bi) => (
                <BlockRenderer key={bi} block={block} citeMap={citeMap} onSelectDoc={onSelectDoc} />
              ))}

              {stepBlocks.length > 0 && (
                <div className="legal-steps-grid">
                  {stepBlocks.map((step, si) => (
                    <div key={si} className="legal-step-card">
                      <div className="legal-step-header">
                        <span className="legal-step-badge">
                          STEP {String(step.num).padStart(2, '0')}
                        </span>
                        <span className="legal-step-title">
                          {renderInlineText(step.title, citeMap, onSelectDoc)}
                        </span>
                      </div>
                      {step.detail && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                          {renderInlineText(step.detail, citeMap, onSelectDoc)}
                        </p>
                      )}
                      {step.subBullets?.length > 0 && (
                        <ul className="legal-step-bullets">
                          {step.subBullets.map((bullet, bi) => (
                            <li key={bi}>
                              {renderInlineText(bullet, citeMap, onSelectDoc)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // 5. Statutory Provisions & Analysis (Default / Tables / Provisions)
        return (
          <div key={secIdx} className="legal-section-card">
            <div className="legal-section-header">
              <div className="legal-section-title">
                <Scale size={16} color="var(--color-brand-gold-light)" />
                <span>{sec.title}</span>
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem' }}>
                Statutory Grounding
              </span>
            </div>
            <div>
              {blocks.map((block, bi) => (
                <BlockRenderer key={bi} block={block} citeMap={citeMap} onSelectDoc={onSelectDoc} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Helper to render individual blocks within a section
 */
function BlockRenderer({ block, citeMap, onSelectDoc }) {
  if (!block) return null;

  switch (block.type) {
    case 'table': {
      const { headers, rows } = block.data;
      return (
        <div className="legal-table-wrapper">
          <table className="legal-table">
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi}>{renderInlineText(h, citeMap, onSelectDoc)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>
                      {renderInlineText(cell, citeMap, onSelectDoc)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'step': {
      return (
        <div className="legal-step-card" style={{ marginBottom: '0.75rem' }}>
          <div className="legal-step-header">
            <span className="legal-step-badge">STEP {String(block.num).padStart(2, '0')}</span>
            <span className="legal-step-title">{renderInlineText(block.title, citeMap, onSelectDoc)}</span>
          </div>
          {block.detail && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              {renderInlineText(block.detail, citeMap, onSelectDoc)}
            </p>
          )}
          {block.subBullets?.length > 0 && (
            <ul className="legal-step-bullets">
              {block.subBullets.map((bullet, bi) => (
                <li key={bi}>{renderInlineText(bullet, citeMap, onSelectDoc)}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case 'list': {
      return (
        <ul className="legal-step-bullets" style={{ margin: '0.5rem 0 1rem 0' }}>
          {block.items.map((item, ii) => (
            <li key={ii}>{renderInlineText(item, citeMap, onSelectDoc)}</li>
          ))}
        </ul>
      );
    }

    case 'subheading': {
      return (
        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '1.25rem 0 0.5rem 0',
          paddingBottom: '0.25rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ChevronRight size={13} color="var(--color-brand-emerald-light)" />
          <span>{renderInlineText(block.title, citeMap, onSelectDoc)}</span>
        </h4>
      );
    }

    case 'notice': {
      return (
        <div style={{
          background: 'rgba(217, 164, 65, 0.08)',
          border: '1px solid rgba(217, 164, 65, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem 0.875rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-gold)',
          margin: '0.75rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Info size={14} flexShrink={0} />
          <span>{renderInlineText(block.text, citeMap, onSelectDoc)}</span>
        </div>
      );
    }

    case 'paragraph':
    default: {
      return (
        <p style={{
          fontSize: '0.875rem',
          lineHeight: 1.7,
          color: 'var(--color-text-secondary)',
          margin: '0 0 0.75rem 0'
        }}>
          {renderInlineText(block.text, citeMap, onSelectDoc)}
        </p>
      );
    }
  }
}
