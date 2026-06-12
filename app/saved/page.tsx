'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DARK, LIGHT } from '@/lib/theme';
import BottomNav from '@/components/BottomNav';

export type SavedItem = {
  id: string;
  text: string;
  type: 'quote' | 'tweet' | 'hook' | 'caption' | 'thread' | 'question';
  savedAt: number;
};

export default function SavedPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<SavedItem['type'] | 'all'>('all');

  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    if (!localStorage.getItem('cgs_profile')) { router.replace('/onboarding'); return; }
    const savedTheme = localStorage.getItem('cgs_theme');
    if (savedTheme) setIsDark(savedTheme === 'dark');
    loadItems();
  }, []);

  function loadItems() {
    try {
      const raw = localStorage.getItem('cgs_saved');
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }

  function deleteItem(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem('cgs_saved', JSON.stringify(next));
  }

  function startEdit(item: SavedItem) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function saveEdit(id: string) {
    const next = items.map(i => i.id === id ? { ...i, text: editText } : i);
    setItems(next);
    localStorage.setItem('cgs_saved', JSON.stringify(next));
    setEditingId(null);
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  const TYPE_LABELS: Record<SavedItem['type'], string> = {
    quote: 'Quote', tweet: 'Tweet', hook: 'Hook',
    caption: 'Caption', thread: 'Thread', question: 'Question',
  };

  const TYPE_COLORS: Record<SavedItem['type'], string> = {
    quote: '#7c3aed', tweet: '#0ea5e9', hook: '#f59e0b',
    caption: '#ec4899', thread: '#10b981', question: '#f97316',
  };

  const filters: Array<SavedItem['type'] | 'all'> = ['all', 'quote', 'tweet', 'hook', 'caption', 'thread', 'question'];
  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);
  const sorted = [...filtered].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <div style={{ background: t.bg, minHeight: '100vh', paddingBottom: '96px', transition: 'background 0.2s' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 24px 16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '4px' }}>
          Saved
        </h1>
        <p style={{ fontSize: '0.82rem', color: t.text2 }}>
          {items.length} saved item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 24px 16px' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
              background: filter === f ? t.pillActive : t.pill,
              border: `1px solid ${filter === f ? 'transparent' : t.pillBrd}`,
              color: filter === f ? t.pillActiveTxt : t.pillTxt,
              fontSize: '0.78rem', fontWeight: filter === f ? 700 : 500,
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? `All (${items.length})` : `${TYPE_LABELS[f as SavedItem['type']]}s`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: t.surface2, border: `1px solid ${t.border}`,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </div>
            <div style={{ fontSize: '0.9rem', color: t.text2, fontWeight: 600, marginBottom: '6px' }}>Nothing saved yet</div>
            <div style={{ fontSize: '0.8rem', color: t.text3 }}>Tap the bookmark icon on any quote or content</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sorted.map(item => (
              <div
                key={item.id}
                style={{
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: '16px', padding: '16px',
                  boxShadow: t.shadow,
                }}
              >
                {/* Type badge + actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: TYPE_COLORS[item.type],
                    background: `${TYPE_COLORS[item.type]}18`,
                    borderRadius: '6px', padding: '3px 8px',
                  }}>
                    {TYPE_LABELS[item.type]}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const quotes = JSON.parse(localStorage.getItem('cgs_quotes') || '[]');
                        const injected = [{ text: item.text, virality: 90, tags: [] }, ...quotes];
                        localStorage.setItem('cgs_quotes', JSON.stringify(injected));
                        localStorage.setItem('cgs_selected_quote', '0');
                        router.push('/designer');
                      }}
                      style={{
                        padding: '5px 11px', background: t.btnBg, border: 'none',
                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                        color: t.btnTxt, cursor: 'pointer',
                      }}
                    >
                      Design
                    </button>
                    <button
                      onClick={() => handleCopy(item.text, item.id)}
                      style={{
                        padding: '5px 11px', background: t.pill, border: `1px solid ${t.pillBrd}`,
                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                        color: copied === item.id ? '#16a34a' : t.pillTxt, cursor: 'pointer',
                      }}
                    >
                      {copied === item.id ? '✓' : 'Copy'}
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      style={{
                        padding: '5px 11px', background: t.pill, border: `1px solid ${t.pillBrd}`,
                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                        color: t.pillTxt, cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{
                        padding: '5px 8px', background: 'transparent', border: `1px solid ${t.border}`,
                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                        color: '#ef4444', cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Text or edit textarea */}
                {editingId === item.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: t.surface2, border: `1px solid ${t.border2}`,
                        borderRadius: '10px', padding: '10px 12px',
                        fontSize: '0.88rem', color: t.text, lineHeight: 1.6,
                        resize: 'none', outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => saveEdit(item.id)}
                        style={{
                          flex: 1, height: '36px', background: t.btnBg, color: t.btnTxt,
                          border: 'none', borderRadius: '10px',
                          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          flex: 1, height: '36px', background: t.surface2,
                          border: `1px solid ${t.border}`, borderRadius: '10px',
                          fontSize: '0.78rem', fontWeight: 600, color: t.text2, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: t.text, margin: 0 }}>{item.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="saved" onNavigate={(href) => router.push(href)} isDark={isDark} />
    </div>
  );
}
