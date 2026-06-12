'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050507',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <path d="M32 6 C32 6 30 19 30 27 C30 27 19 29 6 32 C6 32 19 35 30 37 C30 37 32 50 32 58 C32 58 34 50 34 37 C34 37 45 35 58 32 C58 32 45 29 34 27 C34 27 32 19 32 6 Z" fill="#ffffff"/>
          </svg>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em' }}>
            Creator<span style={{ opacity: 0.4, fontWeight: 700 }}>Studio</span>
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
          Your AI-powered content studio
        </p>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#ffffff',
            colorBackground: '#0f0f12',
            borderRadius: '14px',
            fontFamily: 'DM Sans, sans-serif',
          },
          elements: {
            card: {
              background: '#0f0f12',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              borderRadius: '20px',
              padding: '32px 28px',
            },
            headerTitle: { color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 },
            headerSubtitle: { color: 'rgba(255,255,255,0.45)' },
            socialButtonsBlockButton: {
              background: '#1a1a1e',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff',
              borderRadius: '12px',
              fontWeight: 600,
            },
            socialButtonsBlockButtonText: { color: '#ffffff', fontWeight: 600 },
            dividerLine: { background: 'rgba(255,255,255,0.08)' },
            dividerText: { color: 'rgba(255,255,255,0.3)' },
            formButtonPrimary: {
              background: '#ffffff',
              color: '#000000',
              fontWeight: 800,
              borderRadius: '12px',
            },
            footerActionLink: { color: 'rgba(255,255,255,0.6)' },
          },
        }}
      />
    </div>
  );
}
