'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { NICHES, VOICES } from '@/lib/theme';
import { VoiceKey } from '@/lib/types';

const STEPS = ['name', 'handle', 'niche', 'voice', 'done'] as const;
type Step = typeof STEPS[number];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState(user?.firstName || '');
  const [handle, setHandle] = useState('');
  const [niche, setNiche] = useState('');
  const [voice, setVoice] = useState<VoiceKey>('parker');

  const stepIndex = STEPS.indexOf(step);
  const progress = (stepIndex / (STEPS.length - 1)) * 100;

  function next() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function finish() {
    // Save to localStorage
    const profile = {
      name: name || user?.fullName || 'Creator',
      handle: handle.replace('@', ''),
      niche,
      website: '',
      avatar: user?.imageUrl || '/avatar.jpg',
      verified: true,
    };
    localStorage.setItem('cgs_profile', JSON.stringify(profile));
    localStorage.setItem('cgs_voice', voice);
    router.push('/');
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050507',
      display: 'flex', flexDirection: 'column',
      padding: '0 24px 48px',
    }}>
      {/* Progress bar */}
      <div style={{ paddingTop: '60px', marginBottom: '48px' }}>
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: '#ffffff',
            width: `${progress}%`,
            transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '10px', fontWeight: 500 }}>
          Step {stepIndex + 1} of {STEPS.length - 1}
        </p>
      </div>

      {/* Step: Name */}
      {step === 'name' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '12px' }}>
            What's your name?
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '32px' }}>
            This shows on your quote cards.
          </p>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Parker Sharpe"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px', padding: '16px 18px',
              fontSize: '1rem', color: '#fff', outline: 'none',
              fontFamily: 'inherit',
            }}
            onKeyDown={e => e.key === 'Enter' && name.trim() && next()}
          />
          <button
            onClick={next}
            disabled={!name.trim()}
            style={btnStyle(!name.trim())}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step: Handle */}
      {step === 'handle' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '12px' }}>
            Your social handle?
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '32px' }}>
            Appears on every card you design.
          </p>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.35)', fontSize: '1rem', fontWeight: 600,
            }}>@</span>
            <input
              autoFocus
              value={handle}
              onChange={e => setHandle(e.target.value.replace('@', ''))}
              placeholder="yourhandle"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '14px', padding: '16px 18px 16px 36px',
                fontSize: '1rem', color: '#fff', outline: 'none',
                fontFamily: 'inherit',
              }}
              onKeyDown={e => e.key === 'Enter' && handle.trim() && next()}
            />
          </div>
          <button onClick={next} disabled={!handle.trim()} style={btnStyle(!handle.trim())}>
            Continue →
          </button>
        </div>
      )}

      {/* Step: Niche */}
      {step === 'niche' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '12px' }}>
            What's your niche?
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            AI will write content tailored to your audience.
          </p>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  style={{
                    padding: '10px 18px', borderRadius: '20px', cursor: 'pointer',
                    background: niche === n ? '#ffffff' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${niche === n ? '#ffffff' : 'rgba(255,255,255,0.1)'}`,
                    color: niche === n ? '#000' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.82rem', fontWeight: niche === n ? 700 : 500,
                    transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button onClick={next} disabled={!niche} style={btnStyle(!niche)}>
            Continue →
          </button>
        </div>
      )}

      {/* Step: Voice */}
      {step === 'voice' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '12px' }}>
            Pick your voice.
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>
            How should your content sound?
          </p>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {VOICES.filter(v => v.id !== 'custom').map(v => (
              <button
                key={v.id}
                onClick={() => setVoice(v.id as VoiceKey)}
                style={{
                  padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: voice === v.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${voice === v.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  textAlign: 'left', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{v.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{v.desc}</div>
                </div>
                {voice === v.id && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
          <button onClick={next} style={btnStyle(false)}>
            Continue →
          </button>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🚀</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '12px' }}>
            You're all set, {name.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', marginBottom: '40px', lineHeight: 1.6 }}>
            Your studio is ready. Start generating content that sounds exactly like you.
          </p>
          <button onClick={finish} style={btnStyle(false)}>
            Enter Creator Growth Studio ✦
          </button>
        </div>
      )}
    </div>
  );
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%', height: '56px', marginTop: '24px',
    background: disabled ? 'rgba(255,255,255,0.08)' : '#ffffff',
    color: disabled ? 'rgba(255,255,255,0.25)' : '#000000',
    border: 'none', borderRadius: '16px',
    fontSize: '0.95rem', fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '-0.02em', transition: 'all 0.15s',
    flexShrink: 0,
  };
}
