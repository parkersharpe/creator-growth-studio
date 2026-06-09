'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DARK, LIGHT, VOICES, NICHES } from '@/lib/theme';
import { BrandProfile, MachineType, VoiceKey } from '@/lib/types';
import BottomNav from '@/components/BottomNav';

const DEFAULT_PROFILE: BrandProfile = {
  name: 'Parker Sharpe',
  handle: 'parkersharpe',
  niche: 'Entrepreneurship',
  website: '',
  avatar: '/avatar.jpg',
  verified: true,
};

const TYPES: { id: MachineType; label: string }[] = [
  { id: 'tweets', label: 'Tweets' },
  { id: 'hooks', label: 'Hooks' },
  { id: 'captions', label: 'Captions' },
  { id: 'threads', label: 'Threads' },
  { id: 'questions', label: 'Questions' },
];

export default function MachinePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [profile, setProfile] = useState<BrandProfile>(DEFAULT_PROFILE);
  const [voice, setVoice] = useState<VoiceKey>('parker');
  const [activeType, setActiveType] = useState<MachineType>('tweets');
  const [content, setContent] = useState<Record<MachineType, string[]>>({
    tweets: [], hooks: [], captions: [], threads: [], questions: [],
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    const savedTheme = localStorage.getItem('cgs_theme');
    if (savedTheme) setIsDark(savedTheme === 'dark');

    const savedProfile = localStorage.getItem('cgs_profile');
    if (savedProfile) { try { setProfile(JSON.parse(savedProfile)); } catch {} }

    const savedVoice = localStorage.getItem('cgs_voice');
    if (savedVoice) setVoice(savedVoice as VoiceKey);
  }, []);

  async function handleGenerate(type: MachineType) {
    setLoading(true);
    try {
      const res = await fetch('/api/machine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, voice, niche: profile.niche, name: profile.name, handle: profile.handle }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setContent(prev => ({ ...prev, [type]: data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1800);
  }

  function handleSave(text: string, idx: number) {
    const key = `${activeType}-${idx}`;
    const existing = JSON.parse(localStorage.getItem('cgs_saved') || '[]');
    const typeMap: Record<string, string> = { tweets: 'tweet', hooks: 'hook', captions: 'caption', threads: 'thread', questions: 'question' };
    const newItem = { id: `m-${Date.now()}`, text, type: typeMap[activeType] || activeType, savedAt: Date.now() };
    localStorage.setItem('cgs_saved', JSON.stringify([...existing, newItem]));
    setSaved(prev => new Set([...prev, key]));
  }

  const voiceLabel = VOICES.find(v => v.id === voice)?.label || 'Parker Sharpe';
  const items = content[activeType];

  return (
    <div style={{ background: t.bg, minHeight: '100vh', paddingBottom: '96px', transition: 'background 0.2s' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 24px 16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '4px' }}>
          Content Machine
        </h1>
        <p style={{ fontSize: '0.82rem', color: t.text2 }}>
          {profile.niche} · {voiceLabel}
        </p>
      </div>

      {/* Type tabs */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto',
        padding: '0 24px 16px',
      }}>
        {TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            style={{
              flexShrink: 0, padding: '9px 20px', borderRadius: '20px', cursor: 'pointer',
              background: activeType === type.id ? t.pillActive : t.pill,
              border: `1px solid ${activeType === type.id ? 'transparent' : t.pillBrd}`,
              color: activeType === type.id ? t.pillActiveTxt : t.pillTxt,
              fontSize: '0.82rem', fontWeight: activeType === type.id ? 700 : 500,
              transition: 'all 0.15s',
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ padding: '0 24px' }}>
        {items.length === 0 ? (
          <div style={{
            textAlign: 'center', paddingTop: '60px', paddingBottom: '40px',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: t.surface2, border: `1px solid ${t.border}`,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '1.6rem', color: t.text3 }}>&#9670;</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: t.text2, marginBottom: '6px', fontWeight: 600 }}>
              No {activeType} yet
            </div>
            <div style={{ fontSize: '0.8rem', color: t.text3, marginBottom: '28px' }}>
              Generate content in your voice
            </div>
            <button
              onClick={() => handleGenerate(activeType)}
              disabled={loading}
              style={{
                height: '56px', padding: '0 36px',
                background: loading ? t.surface2 : t.btnBg,
                color: loading ? t.text3 : t.btnTxt, border: 'none', borderRadius: '16px',
                fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.02em', boxShadow: loading ? 'none' : t.shadowMd,
              }}
            >
              {loading ? 'Generating...' : `Generate ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.68rem', color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {items.length} items
              </span>
              <button
                onClick={() => handleGenerate(activeType)}
                disabled={loading}
                style={{
                  padding: '8px 16px', background: t.surface2, border: `1px solid ${t.border}`,
                  borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                  color: t.text2, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Loading...' : 'Regenerate'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: t.surface, border: `1px solid ${t.border}`,
                    borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    boxShadow: t.shadow,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '0.62rem', color: t.text3, fontWeight: 700,
                      marginBottom: '8px', display: 'block',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>
                      #{i + 1}
                    </span>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: t.text, margin: 0 }}>{item}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleSave(item, i)}
                      style={{
                        width: '32px', height: '32px', background: saved.has(`${activeType}-${i}`) ? '#7c3aed18' : t.pill,
                        border: `1px solid ${saved.has(`${activeType}-${i}`) ? '#7c3aed' : t.pillBrd}`,
                        borderRadius: '20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.has(`${activeType}-${i}`) ? '#7c3aed' : 'none'} stroke={saved.has(`${activeType}-${i}`) ? '#7c3aed' : t.pillTxt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleCopy(item, i)}
                      style={{
                        flexShrink: 0, padding: '7px 13px', background: t.pill,
                        border: `1px solid ${t.pillBrd}`, borderRadius: '20px',
                        fontSize: '0.72rem', fontWeight: 600,
                        color: copied === i ? '#16a34a' : t.pillTxt, cursor: 'pointer',
                        transition: 'color 0.15s',
                      }}
                    >
                      {copied === i ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom generate button */}
            <button
              onClick={() => handleGenerate(activeType)}
              disabled={loading}
              style={{
                width: '100%', height: '56px', marginTop: '20px',
                background: loading ? t.surface2 : t.btnBg,
                color: loading ? t.text3 : t.btnTxt, border: 'none', borderRadius: '16px',
                fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.02em', boxShadow: loading ? 'none' : t.shadowMd,
              }}
            >
              {loading ? 'Generating...' : `Regenerate ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
            </button>
          </>
        )}
      </div>

      <BottomNav
        active="machine"
        onNavigate={(href) => router.push(href)}
        isDark={isDark}
      />
    </div>
  );
}
