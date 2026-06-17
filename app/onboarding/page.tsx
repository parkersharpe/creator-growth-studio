'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { NICHES, VOICES } from '@/lib/theme';
import { VoiceKey, AccountType } from '@/lib/types';

const STEPS = ['welcome', 'type', 'handle', 'niche', 'goal', 'voice', 'plan'] as const;
type Step = typeof STEPS[number];

const PERSON_GOALS = [
  'Grow my following', 'Build authority in my niche', 'Get more engagement',
  'Sell my product or service', 'Tell my story', 'Educate my audience',
];
const BUSINESS_GOALS = [
  'Get more local customers', 'Book more jobs & appointments', 'Build trust & reputation',
  'Promote an offer or sale', 'Show off my work', 'Stay top-of-mind in my area',
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$7.99',
    period: '/mo',
    desc: 'Perfect to get started',
    features: ['50 quotes/day', '20 machine items/day', 'Unlimited image exports', '10 video exports/mo'],
    highlight: false,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$14.99',
    period: '/mo',
    desc: 'Everything, no limits',
    features: ['Unlimited quotes', 'Unlimited content machine', 'Unlimited video exports', 'Multi-brand kits', 'Priority support'],
    highlight: true,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<Step>('welcome');
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [handle, setHandle] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState('');
  const [niches, setNiches] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [voice, setVoice] = useState<VoiceKey>('parker');
  const [selectedPlan, setSelectedPlan] = useState('unlimited');
  const [checkingOut, setCheckingOut] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stepIndex = STEPS.indexOf(step);
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Creator';
  const isBusiness = accountType === 'business';

  // Numbered-step label (welcome isn't numbered)
  const numberedSteps = STEPS.filter(s => s !== 'welcome');
  const stepLabel = step === 'welcome' ? '' : `Step ${numberedSteps.indexOf(step) + 1} of ${numberedSteps.length}`;

  // Per-step "can continue" gating
  const identityValid = isBusiness
    ? businessName.trim().length > 0 && location.trim().length > 0 && services.trim().length > 0
    : handle.trim().length > 0;

  // Onboarding requires a signed-in account — payment is tied to the user.
  // Users who already finished onboarding (profile exists) go straight to the app.
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.replace('/sign-in'); return; }
    if (localStorage.getItem(`cgs_profile_${user.id}`)) { router.replace('/'); return; }
    setChecked(true);
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (step === 'handle' && !isBusiness) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [step, isBusiness]);

  function goNext() {
    if (animating) return;
    setDirection('forward');
    setAnimating(true);
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    setTimeout(() => setAnimating(false), 150);
  }

  function goBack() {
    if (animating || stepIndex === 0) return;
    setDirection('back');
    setAnimating(true);
    setStep(STEPS[stepIndex - 1]);
    setTimeout(() => setAnimating(false), 150);
  }

  function toggleNiche(n: string) {
    setNiches(prev =>
      prev.includes(n) ? prev.filter(x => x !== n)
      : prev.length < 3 ? [...prev, n]
      : prev
    );
  }

  async function handleCheckout() {
    const profile = {
      name: isBusiness ? (businessName || user?.fullName || firstName) : (user?.fullName || firstName),
      handle: handle.replace('@', '') || user?.username || '',
      niche: niches[0] || '',
      niches,
      website: '',
      avatar: user?.imageUrl || '/avatar.jpg',
      verified: true,
      accountType: accountType || 'person',
      businessName: isBusiness ? businessName : undefined,
      location: isBusiness ? location : undefined,
      services: isBusiness ? services : undefined,
      goal: goal || undefined,
    };
    const uid = user?.id || 'guest';
    // Save as PENDING — only finalized after Stripe confirms payment
    localStorage.setItem(`cgs_pending_profile_${uid}`, JSON.stringify(profile));
    localStorage.setItem(`cgs_pending_voice_${uid}`, voice);

    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          email: user?.primaryEmailAddress?.emailAddress || '',
          userId: user?.id || '',
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setCheckingOut(false);
    }
  }

  // Hold rendering until we know whether this user still needs onboarding
  if (!checked) return <div style={{ minHeight: '100vh', background: '#f5f5f7' }} />;

  const slideStyle: React.CSSProperties = {
    animation: animating
      ? `${direction === 'forward' ? 'slideOutLeft' : 'slideOutRight'} 0.15s ease forwards`
      : `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.2s ease forwards`,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-24px); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(24px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.08); }
          50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .niche-pill:active { transform: scale(0.95); }
        .voice-card:active { transform: scale(0.98); }
        .plan-card:active { transform: scale(0.98); }
        input::placeholder { color: rgba(0,0,0,0.25); }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      {/* Top nav */}
      <div style={{ padding: '52px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {stepIndex > 0 ? (
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(0,0,0,0.35)', fontSize: '0.85rem', fontFamily: 'inherit', padding: '8px 0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        ) : <div />}

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              width: i === stepIndex ? '20px' : '6px',
              height: '6px', borderRadius: '3px',
              background: i <= stepIndex ? '#000000' : 'rgba(0,0,0,0.12)',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
        </div>

        <div style={{ width: '60px' }} />
      </div>

      {/* Content */}
      <div key={step} style={{ ...slideStyle, flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 48px' }}>

        {/* WELCOME */}
        {step === 'welcome' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Avatar */}
              {user?.imageUrl && (
                <div style={{ marginBottom: '28px', animation: 'float 3s ease-in-out infinite' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.12)', boxShadow: '0 0 40px rgba(0,0,0,0.07)' }}>
                    <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '8px', animation: 'fadeUp 0.5s ease forwards' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Welcome</span>
              </div>

              <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: '#000', letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: '16px', animation: 'fadeUp 0.5s 0.1s ease both' }}>
                Hey {firstName},<br />let's build<br />your studio. ✦
              </h1>

              <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.35)', lineHeight: 1.6, marginBottom: '40px', animation: 'fadeUp 0.5s 0.2s ease both' }}>
                Takes 60 seconds. We'll set up your AI voice, your niche, and get you creating.
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px', animation: 'fadeUp 0.5s 0.3s ease both' }}>
                {['AI content in your voice', 'Designer templates', 'Post-ready in 60s'].map(f => (
                  <span key={f} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)', fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>
                    ✦ {f}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={goNext} style={ctaStyle(false)}>
              Let's go →
            </button>
          </div>
        )}

        {/* ACCOUNT TYPE */}
        {step === 'type' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{stepLabel}</p>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '10px' }}>
              Who's this<br />studio for?
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.35)', marginBottom: '28px', lineHeight: 1.5 }}>
              We'll tailor how the AI writes for you.
            </p>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                { id: 'person', emoji: '🙋', title: 'A personal brand', desc: 'Creator, coach, influencer, or individual building an audience.' },
                { id: 'business', emoji: '🏢', title: 'A business', desc: 'Local or online business marketing a product or service.' },
              ] as const).map((opt, i) => {
                const sel = accountType === opt.id;
                return (
                  <button
                    key={opt.id}
                    className="plan-card"
                    onClick={() => setAccountType(opt.id)}
                    style={{
                      padding: '20px', borderRadius: '18px', cursor: 'pointer', textAlign: 'left',
                      background: sel ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      border: `1.5px solid ${sel ? '#000000' : 'rgba(0,0,0,0.1)'}`,
                      boxShadow: sel ? '0 8px 30px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px',
                      animation: `fadeUp 0.3s ${i * 0.06}s ease both`,
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{opt.emoji}</span>
                    <span>
                      <span style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, color: '#000', marginBottom: '3px' }}>{opt.title}</span>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(0,0,0,0.45)', lineHeight: 1.4 }}>{opt.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button onClick={goNext} disabled={!accountType} style={ctaStyle(!accountType)}>
              Continue →
            </button>
          </div>
        )}

        {/* HANDLE / BUSINESS IDENTITY */}
        {step === 'handle' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{stepLabel}</p>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '10px' }}>
                {isBusiness ? <>Tell us about<br />your business.</> : <>What's your<br />social handle?</>}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.35)', marginBottom: '28px', lineHeight: 1.5 }}>
                {isBusiness ? 'This is how the AI markets you — be specific.' : "We'll put it on every quote card you create."}
              </p>

              {isBusiness && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                  <OnboardField label="Business name" value={businessName} onChange={setBusinessName} placeholder="e.g. Queen City Pressure Washing" />
                  <OnboardField label="Location (city, state)" value={location} onChange={setLocation} placeholder="e.g. Charlotte, NC" />
                  <OnboardField label="What you do" value={services} onChange={setServices} placeholder="e.g. residential & commercial pressure washing" />
                </div>
              )}

              {/* Handle (required for people, optional for businesses) */}
              <div style={{
                position: 'relative', borderRadius: '16px', background: '#ffffff',
                border: `1.5px solid ${inputFocused ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.12)'}`,
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: inputFocused ? '0 0 0 4px rgba(0,0,0,0.06)' : 'none', overflow: 'hidden',
              }}>
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: inputFocused ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.2)', fontSize: '1.1rem', fontWeight: 700, pointerEvents: 'none' }}>@</span>
                <input
                  ref={inputRef}
                  value={handle}
                  onChange={e => setHandle(e.target.value.replace('@', '').replace(/\s/g, ''))}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={isBusiness ? 'yourbusiness (optional)' : 'yourhandle'}
                  onKeyDown={e => e.key === 'Enter' && identityValid && goNext()}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', outline: 'none', padding: '18px 18px 18px 38px', fontSize: '1.1rem', fontWeight: 600, color: '#000', fontFamily: 'inherit' }}
                />
              </div>
              {handle && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.25)', marginTop: '10px' }}>
                  Will appear as <span style={{ color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>@{handle}</span>
                </p>
              )}
            </div>

            <button onClick={goNext} disabled={!identityValid} style={ctaStyle(!identityValid)}>
              Continue →
            </button>
          </div>
        )}

        {/* NICHE */}
        {step === 'niche' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{stepLabel}</p>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '10px' }}>
              {isBusiness ? <>Pick your<br />industry.</> : <>Pick up to 3<br />niches.</>}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.35)', marginBottom: '28px', lineHeight: 1.5 }}>
              {isBusiness ? 'Choose what fits your business best. ' : 'AI writes content tailored to your audience. '}{niches.length}/3 selected.
            </p>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingBottom: '8px' }}>
                {NICHES.map((n, i) => {
                  const on = niches.includes(n);
                  return (
                  <button
                    key={n}
                    className="niche-pill"
                    onClick={() => toggleNiche(n)}
                    style={{
                      padding: '10px 16px', borderRadius: '24px', cursor: 'pointer',
                      background: on ? '#000000' : '#ffffff',
                      border: `1.5px solid ${on ? '#000000' : 'rgba(0,0,0,0.1)'}`,
                      color: on ? '#ffffff' : 'rgba(0,0,0,0.6)',
                      fontSize: '0.82rem', fontWeight: on ? 700 : 500,
                      transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                      transform: on ? 'scale(1.04)' : 'scale(1)',
                      fontFamily: 'inherit',
                      animation: `fadeUp 0.3s ${i * 0.02}s ease both`,
                      opacity: !on && niches.length >= 3 ? 0.4 : 1,
                    }}
                  >
                    {on ? '✓ ' : ''}{n}
                  </button>
                  );
                })}
              </div>
            </div>

            <button onClick={goNext} disabled={niches.length === 0} style={ctaStyle(niches.length === 0)}>
              {niches.length > 0 ? `Continue with ${niches.length} ${niches.length === 1 ? 'niche' : 'niches'} →` : 'Pick at least one'}
            </button>
          </div>
        )}

        {/* GOAL */}
        {step === 'goal' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{stepLabel}</p>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '10px' }}>
              What should your<br />content do?
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.35)', marginBottom: '28px', lineHeight: 1.5 }}>
              We'll aim every post at this goal.
            </p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {(isBusiness ? BUSINESS_GOALS : PERSON_GOALS).map((g, i) => {
                const sel = goal === g;
                return (
                  <button
                    key={g}
                    className="voice-card"
                    onClick={() => setGoal(g)}
                    style={{
                      padding: '16px 18px', borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                      background: sel ? '#000000' : 'rgba(255,255,255,0.6)',
                      border: `1.5px solid ${sel ? '#000000' : 'rgba(0,0,0,0.1)'}`,
                      color: sel ? '#ffffff' : 'rgba(0,0,0,0.7)',
                      fontSize: '0.95rem', fontWeight: sel ? 700 : 500, fontFamily: 'inherit',
                      transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      animation: `fadeUp 0.3s ${i * 0.04}s ease both`, flexShrink: 0,
                    }}
                  >
                    {g}
                    {sel && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    )}
                  </button>
                );
              })}
            </div>

            <button onClick={goNext} disabled={!goal} style={ctaStyle(!goal)}>
              Continue →
            </button>
          </div>
        )}

        {/* VOICE */}
        {step === 'voice' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{stepLabel}</p>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '10px' }}>
              Pick your<br />content voice.
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.35)', marginBottom: '24px', lineHeight: 1.5 }}>
              How should your posts sound?
            </p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {VOICES.filter(v => v.id !== 'custom').map((v, i) => {
                const isSelected = voice === v.id;
                return (
                  <button
                    key={v.id}
                    className="voice-card"
                    onClick={() => setVoice(v.id as VoiceKey)}
                    style={{
                      padding: '14px 16px', borderRadius: '16px', cursor: 'pointer',
                      background: isSelected ? '#000000' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#000000' : 'rgba(0,0,0,0.08)'}`,
                      textAlign: 'left', transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontFamily: 'inherit', flexShrink: 0,
                      animation: `fadeUp 0.3s ${i * 0.03}s ease both`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'rgba(0,0,0,0.7)', marginBottom: '3px' }}>{v.label}</div>
                      <div style={{ fontSize: '0.73rem', color: isSelected ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)', lineHeight: 1.4 }}>{v.desc}</div>
                    </div>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginLeft: '12px',
                      background: isSelected ? '#ffffff' : 'rgba(0,0,0,0.05)',
                      border: `1.5px solid ${isSelected ? '#ffffff' : 'rgba(0,0,0,0.12)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={goNext} style={ctaStyle(false)}>
              Continue →
            </button>
          </div>
        )}

        {/* PLAN */}
        {step === 'plan' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{stepLabel}</p>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '8px' }}>
              Choose your<br />plan.
            </h1>

            {/* Trial badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '20px', padding: '6px 12px', marginBottom: '24px', width: 'fit-content' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.55)' }}>3-day free trial on all plans</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {PLANS.map((plan, i) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    className="plan-card"
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      padding: '16px', borderRadius: '18px', cursor: 'pointer',
                      background: '#ffffff',
                      border: `1.5px solid ${isSelected ? '#000000' : 'rgba(0,0,0,0.08)'}`,
                      boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
                      textAlign: 'left', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                      fontFamily: 'inherit', flexShrink: 0,
                      animation: `fadeUp 0.3s ${i * 0.05}s ease both`,
                      position: 'relative',
                    }}
                  >
                    {plan.highlight && isSelected && (
                      <span style={{ position: 'absolute', top: '-1px', right: '14px', background: '#000', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: '0 0 8px 8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Most Popular
                      </span>
                    )}
                    {plan.highlight && !isSelected && (
                      <span style={{ position: 'absolute', top: '-1px', right: '14px', background: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.5)', fontSize: '0.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: '0 0 8px 8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Most Popular
                      </span>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#000', marginBottom: '2px' }}>{plan.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>{plan.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#000' }}>{plan.price}</span>
                        <span style={{ fontSize: '0.72rem', color: isSelected && plan.highlight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)', fontWeight: 500 }}>{plan.period}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          <span style={{ fontSize: '0.76rem', color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{
                ...ctaStyle(false),
                background: checkingOut ? 'rgba(0,0,0,0.08)' : '#000000',
                color: checkingOut ? 'rgba(0,0,0,0.35)' : '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {checkingOut ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin-slow 0.8s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3"/>
                    <path d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  Setting up your studio...
                </>
              ) : (
                `Start 3-day free trial →`
              )}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(0,0,0,0.2)', marginTop: '10px' }}>
              Cancel anytime. No charge for 3 days.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

function ctaStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%', height: '58px',
    background: disabled ? 'rgba(0,0,0,0.06)' : '#000000',
    color: disabled ? 'rgba(0,0,0,0.25)' : '#ffffff',
    border: `1.5px solid ${disabled ? 'rgba(0,0,0,0.06)' : 'transparent'}`,
    borderRadius: '18px',
    fontSize: '0.96rem', fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '-0.02em',
    transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
    flexShrink: 0, fontFamily: 'inherit',
  };
}

function OnboardField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', paddingLeft: '2px' }}>{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box', background: '#ffffff',
          border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '14px',
          padding: '14px 16px', fontSize: '1rem', fontWeight: 500, color: '#000',
          fontFamily: 'inherit', outline: 'none',
        }}
      />
    </label>
  );
}
