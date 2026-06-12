'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DARK, LIGHT, VOICES, NICHES } from '@/lib/theme';
import { BrandProfile, VoiceKey } from '@/lib/types';
import Sheet from '@/components/Sheet';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';

const DEFAULT_PROFILE: BrandProfile = {
  name: 'Parker Sharpe',
  handle: 'parkersharpe',
  niche: 'Entrepreneurship',
  website: '',
  avatar: '/avatar.jpg',
  verified: true,
};

interface Kit {
  id: string;
  label: string;
  profile: BrandProfile;
  voice: VoiceKey;
  savedAt: string;
}

export default function BrandPage() {
  const router = useRouter();
  const { user } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [profile, setProfile] = useState<BrandProfile>(DEFAULT_PROFILE);
  const [voice, setVoice] = useState<VoiceKey>('parker');
  const [kits, setKits] = useState<Kit[]>([]);
  const [voiceSheet, setVoiceSheet] = useState(false);
  const [nicheSheet, setNicheSheet] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    const profile = localStorage.getItem('cgs_profile');
    if (!profile) { router.replace('/onboarding'); return; }

    const savedTheme = localStorage.getItem('cgs_theme');
    if (savedTheme) setIsDark(savedTheme === 'dark');

    const savedProfile = localStorage.getItem('cgs_profile');
    if (savedProfile) { try { setProfile(JSON.parse(savedProfile)); } catch {} }

    const savedVoice = localStorage.getItem('cgs_voice');
    if (savedVoice) setVoice(savedVoice as VoiceKey);

    const savedKits = localStorage.getItem('cgs_kits');
    if (savedKits) { try { setKits(JSON.parse(savedKits)); } catch {} }
  }, []);

  function updateProfile(patch: Partial<BrandProfile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    const json = JSON.stringify(next);
    localStorage.setItem('cgs_profile', json);
    if (user) localStorage.setItem(`cgs_profile_${user.id}`, json);
  }

  function selectVoice(v: VoiceKey) {
    setVoice(v);
    localStorage.setItem('cgs_voice', v);
    if (user) localStorage.setItem(`cgs_voice_${user.id}`, v);
    setVoiceSheet(false);
  }

  function selectNiche(n: string) {
    updateProfile({ niche: n });
    setNicheSheet(false);
  }

  function saveKit() {
    const kit: Kit = {
      id: Date.now().toString(),
      label: `${profile.name} — ${profile.niche}`,
      profile: { ...profile },
      voice,
      savedAt: new Date().toLocaleDateString(),
    };
    const updated = [kit, ...kits];
    setKits(updated);
    localStorage.setItem('cgs_kits', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function loadKit(kit: Kit) {
    setProfile(kit.profile);
    setVoice(kit.voice);
    const json = JSON.stringify(kit.profile);
    localStorage.setItem('cgs_profile', json);
    localStorage.setItem('cgs_voice', kit.voice);
    if (user) {
      localStorage.setItem(`cgs_profile_${user.id}`, json);
      localStorage.setItem(`cgs_voice_${user.id}`, kit.voice);
    }
  }

  async function handleUpgrade(plan: string) {
    setCheckingOut(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.toLowerCase(), email: '' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckingOut(null);
    }
  }

  function deleteKit(id: string) {
    const updated = kits.filter(k => k.id !== id);
    setKits(updated);
    localStorage.setItem('cgs_kits', JSON.stringify(updated));
  }

  const voiceLabel = VOICES.find(v => v.id === voice)?.label || 'Parker Sharpe';
  const voiceDesc = VOICES.find(v => v.id === voice)?.desc || '';

  const PLANS = [
    {
      name: 'Starter', price: '$9.99/mo', desc: 'Get started',
      features: ['50 quotes/day', '20 machine items/day', 'Basic designer', 'Download images'],
      cta: 'Upgrade', highlight: false,
    },
    {
      name: 'Creator', price: '$14.99/mo', desc: 'Most popular',
      features: ['Unlimited quotes', 'Unlimited machine', 'Full designer + video', 'Priority support'],
      cta: 'Upgrade', highlight: true,
    },
    {
      name: 'Pro', price: '$19.99/mo', desc: 'Power users',
      features: ['Everything in Creator', 'Multi-brand kits', 'Custom voice training', 'White-label exports'],
      cta: 'Upgrade', highlight: false,
    },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px', padding: '0 16px',
    background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '12px',
    color: t.text, fontSize: '0.9rem', fontFamily: 'inherit',
  };

  return (
    <AuthGuard>
    <div style={{ background: t.bg, minHeight: '100vh', paddingBottom: '96px', transition: 'background 0.2s' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 24px 16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '4px' }}>
          Brand Kit
        </h1>
        <p style={{ fontSize: '0.82rem', color: t.text2 }}>
          Your identity, voice, and preferences
        </p>
      </div>

      <div style={{ padding: '0 24px' }}>

        {/* Profile card */}
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: '20px',
          padding: '20px', marginBottom: '24px', boxShadow: t.shadow,
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          {/* Tappable avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }} onClick={() => avatarInputRef.current?.click()}>
            <img
              src={profile.avatar}
              alt={profile.name}
              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${t.border2}`, display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '24px', height: '24px', borderRadius: '50%',
              background: t.btnBg, border: `2px solid ${t.bg}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.btnTxt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  updateProfile({ avatar: ev.target?.result as string });
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text, letterSpacing: '-0.02em' }}>{profile.name}</div>
            <div style={{ fontSize: '0.85rem', color: t.text2, marginTop: '2px' }}>@{profile.handle}</div>
            <div style={{
              display: 'inline-block', marginTop: '6px',
              fontSize: '0.7rem', fontWeight: 600, color: t.pillTxt,
              background: t.pill, border: `1px solid ${t.pillBrd}`,
              borderRadius: '20px', padding: '3px 10px',
            }}>
              {profile.niche}
            </div>
          </div>
        </div>

        {/* Profile section */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' }}>
            Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingLeft: '4px' }}>Name</div>
              <input
                type="text"
                placeholder="Your name"
                value={profile.name}
                onChange={e => updateProfile({ name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', paddingLeft: '4px' }}>Handle</div>
              <input
                type="text"
                placeholder="handle (no @)"
                value={profile.handle}
                onChange={e => updateProfile({ handle: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Niche button */}
            <button
              onClick={() => setNicheSheet(true)}
              style={{
                width: '100%', height: '48px', padding: '0 16px',
                background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '12px',
                color: t.text, fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontWeight: 500 }}>{profile.niche}</span>
              <span style={{ fontSize: '0.68rem', color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Niche</span>
            </button>

            {/* Voice button */}
            <button
              onClick={() => setVoiceSheet(true)}
              style={{
                width: '100%', padding: '12px 16px',
                background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '12px',
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'inherit',
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', color: t.text, fontWeight: 600 }}>{voiceLabel}</div>
                <div style={{ fontSize: '0.75rem', color: t.text2, marginTop: '2px' }}>{voiceDesc}</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0, marginLeft: '12px' }}>Voice</span>
            </button>
          </div>
        </div>

        {/* Saved Kits */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              Saved Kits
            </span>
            <button
              onClick={saveKit}
              style={{
                padding: '8px 16px',
                background: saved ? '#16a34a' : t.btnBg,
                color: saved ? '#fff' : t.btnTxt, border: 'none', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.2s', fontFamily: 'inherit',
              }}
            >
              {saved ? 'Saved!' : 'Save Current'}
            </button>
          </div>

          {kits.length === 0 ? (
            <div style={{
              background: t.surface2, border: `1px solid ${t.border}`, borderRadius: '14px',
              padding: '24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.82rem', color: t.text3 }}>No saved kits yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {kits.map(kit => (
                <div
                  key={kit.id}
                  style={{
                    background: t.surface, border: `1px solid ${t.border}`, borderRadius: '14px',
                    padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: t.shadow,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text }}>{kit.label}</div>
                    <div style={{ fontSize: '0.7rem', color: t.text3, marginTop: '2px' }}>{kit.savedAt}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => loadKit(kit)}
                      style={{
                        padding: '7px 14px', background: t.pill, border: `1px solid ${t.pillBrd}`,
                        borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                        color: t.text, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteKit(kit.id)}
                      style={{
                        padding: '7px 12px', background: 'transparent', border: `1px solid ${t.border}`,
                        borderRadius: '20px', fontSize: '0.72rem', color: t.text3, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plans */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' }}>
            Plans
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PLANS.map(plan => {
              const isHighlight = plan.highlight;
              const planBg = isHighlight ? t.btnBg : t.surface;
              const planText = isHighlight ? t.btnTxt : t.text;
              const planText2 = isHighlight ? (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)') : t.text2;
              const planText3 = isHighlight ? (isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.45)') : t.text3;
              const planBorder = isHighlight ? 'transparent' : t.border;
              return (
                <div
                  key={plan.name}
                  style={{
                    background: planBg,
                    border: `1px solid ${planBorder}`,
                    borderRadius: '20px', padding: '20px 18px',
                    boxShadow: isHighlight ? t.shadowMd : t.shadow,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: planText, letterSpacing: '-0.02em' }}>{plan.name}</div>
                      <div style={{ fontSize: '0.72rem', color: planText3, marginTop: '2px', fontWeight: 500 }}>{plan.desc}</div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: planText, letterSpacing: '-0.03em' }}>{plan.price}</div>
                  </div>
                  <ul style={{ marginBottom: '16px', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontSize: '0.8rem', color: planText2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: isHighlight ? (isDark ? '#000' : '#fff') : '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>+</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => plan.cta === 'Upgrade' && handleUpgrade(plan.name)}
                    disabled={checkingOut === plan.name.toLowerCase()}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px',
                      cursor: plan.cta === 'Upgrade' ? 'pointer' : 'default',
                      background: isHighlight ? (isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)') : t.surface2,
                      color: isHighlight ? planText : t.text2,
                      border: isHighlight ? `1px solid ${isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'}` : `1px solid ${t.border}`,
                      fontSize: '0.84rem', fontWeight: 700, fontFamily: 'inherit',
                      letterSpacing: '-0.01em', opacity: checkingOut === plan.name.toLowerCase() ? 0.6 : 1,
                    }}
                  >
                    {checkingOut === plan.name.toLowerCase() ? 'Loading…' : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voice Sheet */}
      <Sheet open={voiceSheet} onClose={() => setVoiceSheet(false)} title="Select Voice" isDark={isDark}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {VOICES.map(v => (
            <button
              key={v.id}
              onClick={() => selectVoice(v.id as VoiceKey)}
              style={{
                background: voice === v.id ? (isDark ? '#1f1f22' : '#f5f5f7') : 'transparent',
                border: `1px solid ${voice === v.id ? (isDark ? '#2a2a2e' : '#e5e5e5') : (isDark ? '#1f1f22' : '#efefef')}`,
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '3px',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#fff' : '#0a0a0a' }}>{v.label}</span>
              <span style={{ fontSize: '0.75rem', color: isDark ? '#666' : '#888' }}>{v.desc}</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* Niche Sheet */}
      <Sheet open={nicheSheet} onClose={() => setNicheSheet(false)} title="Select Niche" isDark={isDark}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NICHES.map(n => (
            <button
              key={n}
              onClick={() => selectNiche(n)}
              style={{
                background: profile.niche === n ? (isDark ? '#ffffff' : '#0a0a0a') : (isDark ? '#141416' : '#f5f5f5'),
                border: `1px solid ${profile.niche === n ? 'transparent' : (isDark ? '#1f1f22' : '#efefef')}`,
                borderRadius: '20px', padding: '9px 18px', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                color: profile.niche === n ? (isDark ? '#000' : '#fff') : (isDark ? '#888' : '#6b6b6b'),
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </Sheet>

      <BottomNav
        active="brand"
        onNavigate={(href) => router.push(href)}
        isDark={isDark}
      />
    </div>
    </AuthGuard>
  );
}
