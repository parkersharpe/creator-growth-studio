'use client';

import { Quote } from '@/lib/types';

interface QuoteCardProps {
  quote: Quote;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
}

function viralityColor(v: number) {
  if (v >= 88) return '#16a34a';
  if (v >= 75) return '#d97706';
  return '#dc2626';
}

function tagColor(level: string, isDark: boolean) {
  switch (level) {
    case 'Very High': return isDark ? '#166534' : '#dcfce7';
    case 'High': return isDark ? '#1e3a5f' : '#dbeafe';
    case 'Medium': return isDark ? '#92400e' : '#fef3c7';
    default: return isDark ? '#1f1f22' : '#f5f5f5';
  }
}

function tagText(level: string, isDark: boolean) {
  switch (level) {
    case 'Very High': return isDark ? '#4ade80' : '#15803d';
    case 'High': return isDark ? '#60a5fa' : '#1d4ed8';
    case 'Medium': return isDark ? '#fbbf24' : '#92400e';
    default: return isDark ? '#666' : '#888';
  }
}

export default function QuoteCard({ quote, selected, onClick, isDark }: QuoteCardProps) {
  const surface = isDark ? '#0f0f11' : '#ffffff';
  const borderColor = selected
    ? (isDark ? '#2a2a2e' : '#e5e5e5')
    : (isDark ? '#1f1f22' : '#efefef');
  const shadow = isDark ? '0 2px 20px rgba(0,0,0,0.4)' : '0 2px 20px rgba(0,0,0,0.06)';
  const text = isDark ? '#ffffff' : '#0a0a0a';
  const text2 = isDark ? '#666666' : '#b0b0b0';

  return (
    <div
      onClick={onClick}
      style={{
        background: surface,
        border: `1px solid ${borderColor}`,
        borderLeft: selected ? `3px solid ${isDark ? '#ffffff' : '#0a0a0a'}` : `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? shadow : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Virality score */}
        <div style={{ flexShrink: 0, textAlign: 'center', paddingTop: '2px' }}>
          <div style={{
            fontSize: '1.4rem', fontWeight: 800, lineHeight: 1,
            color: viralityColor(quote.virality),
            letterSpacing: '-0.03em',
          }}>
            {quote.virality}
          </div>
          <div style={{ fontSize: '0.6rem', color: text2, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
            score
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: text, marginBottom: '10px', fontWeight: 400 }}>
            {quote.text}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              background: tagColor(quote.share, isDark), color: tagText(quote.share, isDark),
              padding: '3px 8px', borderRadius: '20px',
            }}>
              Share: {quote.share}
            </span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              background: tagColor(quote.save, isDark), color: tagText(quote.save, isDark),
              padding: '3px 8px', borderRadius: '20px',
            }}>
              Save: {quote.save}
            </span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 500,
              background: isDark ? '#141416' : '#f5f5f5',
              color: text2,
              padding: '3px 8px', borderRadius: '20px',
            }}>
              {quote.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
