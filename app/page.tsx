'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DARK, LIGHT, VOICES, NICHES, SEED_QUOTES } from '@/lib/theme';
import { Quote, BrandProfile, VoiceKey } from '@/lib/types';
import Sheet from '@/components/Sheet';
import QuoteCard from '@/components/QuoteCard';
import BottomNav from '@/components/BottomNav';

const DEFAULT_PROFILE: BrandProfile = {
  name: 'Parker Sharpe',
  handle: 'parkersharpe',
  niche: 'Entrepreneurship',
  website: '',
  avatar: '/avatar.jpg',
  verified: true,
};

export default function HomePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [profile, setProfile] = useState<BrandProfile>(DEFAULT_PROFILE);
  const [voice, setVoice] = useState<VoiceKey>('parker');
  const [count, setCount] = useState(10);
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [barAnimating, setBarAnimating] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [voiceSheet, setVoiceSheet] = useState(false);
  const [nicheSheet, setNicheSheet] = useState(false);
  const [customVoice, setCustomVoice] = useState('');
  const [customNiche, setCustomNiche] = useState('');

  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    const savedTheme = localStorage.getItem('cgs_theme');
    if (savedTheme) setIsDark(savedTheme === 'dark');

    const savedProfile = localStorage.getItem('cgs_profile');
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch {}
    }

    const savedQuotes = localStorage.getItem('cgs_quotes');
    if (savedQuotes) {
      try { setQuotes(JSON.parse(savedQuotes)); } catch {}
    }

    const savedVoice = localStorage.getItem('cgs_voice');
    if (savedVoice) setVoice(savedVoice as VoiceKey);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('cgs_theme', next ? 'dark' : 'light');
  }

  async function handleGenerate() {
    setLoading(true);
    setSelectedIdx(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count,
          voice,
          niche: customNiche || profile.niche,
          name: profile.name,
          handle: profile.handle,
          customVoiceDesc: customVoice || undefined,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuotes(data);
        localStorage.setItem('cgs_quotes', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRewrite() {
    if (selectedIdx === null) return;
    setRewriting(true);
    const q = quotes[selectedIdx];
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote: q.text,
          voice,
          niche: customNiche || profile.niche,
          name: profile.name,
          customVoiceDesc: customVoice || undefined,
        }),
      });
      const data = await res.json();
      if (data.text) {
        const updated = [...quotes];
        updated[selectedIdx] = data;
        setQuotes(updated);
        localStorage.setItem('cgs_quotes', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRewriting(false);
    }
  }

  function handleCopy() {
    if (selectedIdx === null) return;
    navigator.clipboard.writeText(quotes[selectedIdx].text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleSave() {
    if (selectedIdx === null) return;
    const q = quotes[selectedIdx];
    const saved = JSON.parse(localStorage.getItem('cgs_saved') || '[]');
    const newItem = { id: `q-${Date.now()}`, text: q.text, type: 'quote', savedAt: Date.now() };
    localStorage.setItem('cgs_saved', JSON.stringify([...saved, newItem]));
    setSavedIds(prev => new Set(Array.from(prev).concat(selectedIdx)));
  }

  function selectVoice(v: VoiceKey) {
    setVoice(v);
    localStorage.setItem('cgs_voice', v);
    if (v !== 'custom') setVoiceSheet(false);
  }

  function selectNiche(n: string) {
    const updated = { ...profile, niche: n };
    setProfile(updated);
    localStorage.setItem('cgs_profile', JSON.stringify(updated));
    setCustomNiche('');
    setNicheSheet(false);
  }

  const activeVoiceLabel = customVoice
    ? 'Custom Voice'
    : VOICES.find(v => v.id === voice)?.label || 'Parker Sharpe';

  const activeNicheLabel = customNiche || profile.niche;

  const selectedQuote = selectedIdx !== null ? quotes[selectedIdx] : null;

  return (
    <div style={{ background: t.bg, minHeight: '100vh', paddingBottom: barVisible ? '200px' : '96px', transition: 'padding-bottom 0.3s ease, background 0.2s' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px',
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 900, color: t.text, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 64 64" fill="none" style={{ flexShrink: 0 }}>
              <path d="M32 6 C32 6 30 19 30 27 C30 27 19 29 6 32 C6 32 19 35 30 37 C30 37 32 50 32 58 C32 58 34 50 34 37 C34 37 45 35 58 32 C58 32 45 29 34 27 C34 27 32 19 32 6 Z" fill={t.text}/>
            </svg>
            Creator<span style={{ opacity: 0.35, fontWeight: 700 }}>Studio</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '20px',
              padding: '7px 14px', cursor: 'pointer', fontSize: '0.72rem',
              color: t.text2, fontWeight: 600, letterSpacing: '0.01em',
            }}
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={() => router.push('/brand')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${t.border2}`, display: 'block' }}
            />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ padding: '4px 24px 24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: t.text, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '6px' }}>
          Hi, {profile.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '0.9rem', color: t.text2, fontWeight: 400 }}>
          What will you create today?
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '0 24px' }}>

        {/* Voice + Niche row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={() => setVoiceSheet(true)}
            style={{
              flex: 1, background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '14px',
              padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>Voice</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>{activeVoiceLabel}</div>
          </button>
          <button
            onClick={() => setNicheSheet(true)}
            style={{
              flex: 1, background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '14px',
              padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>Niche</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>{activeNicheLabel}</div>
          </button>
        </div>

        {/* Count pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[10, 25, 50].map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              style={{
                background: count === n ? t.pillActive : t.pill,
                border: `1px solid ${count === n ? t.pillActive : t.pillBrd}`,
                borderRadius: '20px', padding: '8px 20px',
                cursor: 'pointer', fontSize: '0.82rem',
                color: count === n ? t.pillActiveTxt : t.pillTxt,
                fontWeight: count === n ? 700 : 500,
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%', height: '56px', background: loading ? t.surface2 : t.btnBg,
            color: loading ? t.text3 : t.btnTxt, border: 'none', borderRadius: '16px',
            fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', marginBottom: '12px',
            letterSpacing: '-0.02em', boxShadow: loading ? 'none' : t.shadowMd,
          }}
        >
          {loading ? 'Generating...' : `Generate ${count} Quotes`}
        </button>

      </div>

      {/* Quote list */}
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '0.68rem', color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>
          {quotes.length} quotes
        </div>
        {quotes.map((q, i) => (
          <QuoteCard
            key={i}
            quote={q}
            selected={selectedIdx === i}
            onClick={() => {
              const next = selectedIdx === i ? null : i;
              if (next === null) {
                // animate out then hide
                setBarAnimating(true);
                setTimeout(() => { setSelectedIdx(null); setBarVisible(false); setBarAnimating(false); }, 260);
              } else {
                setSelectedIdx(next);
                setBarVisible(true);
                setBarAnimating(false);
              }
            }}
            isDark={isDark}
          />
        ))}
      </div>

      {/* Voice Sheet */}
      <Sheet open={voiceSheet} onClose={() => setVoiceSheet(false)} title="Select Voice" isDark={isDark}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {VOICES.map(v => (
            <button
              key={v.id}
              onClick={() => selectVoice(v.id as VoiceKey)}
              style={{
                background: voice === v.id && !customVoice ? (isDark ? '#1f1f22' : '#f5f5f7') : 'transparent',
                border: `1px solid ${voice === v.id && !customVoice ? (isDark ? '#2a2a2e' : '#e5e5e5') : (isDark ? '#1f1f22' : '#efefef')}`,
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '3px',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#fff' : '#0a0a0a' }}>
                {v.label}
              </span>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#666' : '#888' }}>{v.desc}</span>
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: '1px', background: isDark ? '#1f1f22' : '#efefef', margin: '8px 0' }} />

          {/* Custom voice input */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isDark ? '#666' : '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Or describe your own voice style...
            </div>
            <textarea
              value={customVoice}
              onChange={e => setCustomVoice(e.target.value)}
              placeholder="e.g. Calm, spiritual, speaks to single moms rebuilding..."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: isDark ? '#141416' : '#f5f5f7',
                border: `1px solid ${customVoice ? (isDark ? '#555' : '#aaa') : (isDark ? '#1f1f22' : '#efefef')}`,
                borderRadius: '12px', padding: '12px 14px',
                fontSize: '0.85rem', color: isDark ? '#fff' : '#0a0a0a',
                resize: 'none', outline: 'none', lineHeight: 1.5,
              }}
            />
            {customVoice && (
              <button
                onClick={() => { setVoiceSheet(false); }}
                style={{
                  marginTop: '10px', width: '100%', height: '44px',
                  background: isDark ? '#ffffff' : '#0a0a0a',
                  color: isDark ? '#000' : '#fff',
                  border: 'none', borderRadius: '12px',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Use This Voice
              </button>
            )}
            {customVoice && (
              <button
                onClick={() => setCustomVoice('')}
                style={{
                  marginTop: '6px', width: '100%', height: '36px',
                  background: 'transparent', color: isDark ? '#666' : '#888',
                  border: 'none', fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                Clear custom voice
              </button>
            )}
          </div>
        </div>
      </Sheet>

      {/* Niche Sheet */}
      <Sheet open={nicheSheet} onClose={() => setNicheSheet(false)} title="Select Niche" isDark={isDark}>
        {/* Custom niche input at top */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={customNiche}
            onChange={e => setCustomNiche(e.target.value)}
            placeholder="Type your own niche... e.g. Catholic moms, BJJ athletes, dog trainers..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: isDark ? '#141416' : '#f5f5f7',
              border: `1px solid ${customNiche ? (isDark ? '#555' : '#aaa') : (isDark ? '#1f1f22' : '#efefef')}`,
              borderRadius: '12px', padding: '12px 14px',
              fontSize: '0.85rem', color: isDark ? '#fff' : '#0a0a0a',
              outline: 'none',
            }}
          />
          {customNiche && (
            <button
              onClick={() => setNicheSheet(false)}
              style={{
                marginTop: '8px', width: '100%', height: '40px',
                background: isDark ? '#ffffff' : '#0a0a0a',
                color: isDark ? '#000' : '#fff',
                border: 'none', borderRadius: '12px',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Use &ldquo;{customNiche}&rdquo;
            </button>
          )}
        </div>

        <div style={{ height: '1px', background: isDark ? '#1f1f22' : '#efefef', marginBottom: '14px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NICHES.map(n => (
            <button
              key={n}
              onClick={() => selectNiche(n)}
              style={{
                background: profile.niche === n && !customNiche ? (isDark ? '#ffffff' : '#0a0a0a') : (isDark ? '#141416' : '#f5f5f5'),
                border: `1px solid ${profile.niche === n && !customNiche ? 'transparent' : (isDark ? '#1f1f22' : '#efefef')}`,
                borderRadius: '20px', padding: '9px 18px', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                color: profile.niche === n && !customNiche ? (isDark ? '#000' : '#fff') : (isDark ? '#888' : '#6b6b6b'),
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </Sheet>

      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(110%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(0);    opacity: 1; }
          to   { transform: translateX(-50%) translateY(110%); opacity: 0; }
        }
      `}</style>

      {/* Floating action bar — slides up/down */}
      {(barVisible || barAnimating) && (
        <div style={{
          position: 'fixed', bottom: '84px', left: '50%',
          width: 'calc(100% - 32px)', maxWidth: '398px',
          background: isDark ? 'rgba(18,18,20,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${t.border2}`,
          borderRadius: '20px',
          padding: '10px',
          display: 'flex', gap: '8px',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.1)',
          zIndex: 100,
          animation: barAnimating
            ? 'slideDown 0.24s cubic-bezier(0.4, 0, 0.6, 1) forwards'
            : 'slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <button
            onClick={handleSave}
            style={{
              width: '44px', height: '44px', background: selectedIdx !== null && savedIds.has(selectedIdx) ? '#7c3aed18' : t.surface2,
              border: `1px solid ${selectedIdx !== null && savedIds.has(selectedIdx) ? '#7c3aed' : t.border}`,
              borderRadius: '12px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={selectedIdx !== null && savedIds.has(selectedIdx) ? '#7c3aed' : 'none'} stroke={selectedIdx !== null && savedIds.has(selectedIdx) ? '#7c3aed' : t.text2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, height: '44px', background: t.surface2,
              border: `1px solid ${t.border}`, borderRadius: '12px',
              fontSize: '0.78rem', fontWeight: 600, color: t.text, cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={handleRewrite}
            disabled={rewriting}
            style={{
              flex: 1, height: '44px', background: t.surface2,
              border: `1px solid ${t.border}`, borderRadius: '12px',
              fontSize: '0.78rem', fontWeight: 600, color: rewriting ? t.text3 : t.text,
              cursor: rewriting ? 'not-allowed' : 'pointer',
            }}
          >
            {rewriting ? '...' : 'More Viral'}
          </button>
          <button
            onClick={() => {
              if (selectedIdx === null) return;
              localStorage.setItem('cgs_selected_quote', String(selectedIdx));
              router.push('/designer');
            }}
            style={{
              flex: 2, height: '44px',
              background: t.btnBg, color: t.btnTxt,
              border: 'none', borderRadius: '12px',
              fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              letterSpacing: '-0.02em',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            Design This
          </button>
        </div>
      )}

      <BottomNav
        active="generate"
        onNavigate={(href) => router.push(href)}
        isDark={isDark}
      />
    </div>
  );
}
